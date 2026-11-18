# AuroraAI-Research/Aurora2-400M-A20M

## Resumen

Aurora2-400M-A20M es un modelo de lenguaje decoder-only desarrollado por AuroraAI-Research que emplea una arquitectura de mezcla de expertos (MoE) con 399.597.454 parámetros totales y aproximadamente 19 millones de parámetros activos por token. Se trata de un modelo base preentrenado desde cero sobre 100.000 millones de tokens, sin fase de ajuste por instrucciones ni RLHF, lo que lo sitúa como pieza de partida para experimentación e investigación más que como asistente listo para producción.

La propuesta técnica resulta llamativa por su relación entre tamaño total y activo: 32 expertos enrutados más uno compartido por capa, con top-1 routing, sobre una pila de solo 12 capas y dimensión oculta de 192. El modelo fue entrenado íntegramente en una única GPU RTX Pro 6000 durante aproximadamente 36 horas, lo que lo convierte en un caso de estudio interesante sobre eficiencia de entrenamiento en hardware de consumo profesional.

Su relevancia actual radica en la combinación de decisiones de diseño poco habituales en modelos pequeños: embeddings de n-gramas con hashing causal, conexiones residuales de embeddings, value residuals entre capas, puertas de atención por cabeza y el optimizador Muon. Todo ello bajo licencia Apache 2.0 y con pesos en safetensors, lo que facilita su inspección y reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (top-1) |
| Parametros totales | 399.597.454 |
| Parametros activos | 19.050.382 por token |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con una pila de atención relativamente estrecha (12 capas, dimensión oculta 192, 6 cabezas de consulta y 2 de clave-valor con GQA 3:1, dimensión de cabeza 32) combinada con capas feed-forward dispersas de gran tamaño. Cada capa contiene 32 expertos enrutados con SwiGLU y dimensión FFN de 1.776, más un experto compartido siempre activo con dimensión 256. El enrutamiento es top-1 con softmax en FP32, sin factor de capacidad ni descarte de tokens (dropless), y escala la salida del experto seleccionado por su probabilidad de enrutamiento. El entrenamiento del router incorpora una pérdida de balanceo de carga estilo Switch (coeficiente 0,01) y router z-loss (coeficiente 0,001), además de un sesgo aprendido por experto añadido a los logits de enrutamiento.

Entre las innovaciones destacables figuran los embeddings de n-gramas con hashing causal de los últimos 2, 3 y 4 tokens, que indexan tres tablas separadas de 16.384 cubos cuyas salidas se concatenan, se proyectan a la dimensión oculta y se suman a los embeddings de token mediante una puerta aprendida por canal. También incorpora conexiones residuales de embedding en cada bloque (coeficientes inicializados a [1, 0]), value residuals que mezclan los tensores de valor de capas posteriores con los de la primera capa (inicializados a [0,5, 0,5]), puertas de atención por cabeza derivadas de los primeros 12 canales de la entrada normalizada, y soft-capping de logits a 30. El entrenamiento usó BF16 para cómputo y FP32 para pesos maestros, con schedule Warmup-Stable-Decay (warmup lineal de 1.000 millones de tokens, fase estable hasta 80.000 millones y decaimiento coseno en los últimos 20.000 millones), learning rate pico de 1,5e-3, 128 secuencias de 2.048 tokens por paso (262.144 tokens/paso) y aproximadamente 381.000 pasos de optimizador. Los datos se transmitieron desde Hugging Face Hub, tokenizados al vuelo y empaquetados, con una mezcla por etapas que incrementa el peso de matemáticas y QA/chat en la fase final; ClimbMix aporta el 85,8% medio, seguido de FineMath (6,0%), Wikipedia (3,0%), SmolTalk (2,5%), OpenMathInstruct-2 (1,5%) y NuminaMath-CoT (1,2%). El tokenizador es un BPE a nivel de byte entrenado desde cero con vocabulario de 16.384, donde cada dígito es un token individual, y tokens especiales `` (0), `` (1) y `` (2).

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base, sin ajuste por instrucciones.
- Razonamiento matemático y resolución de problemas, favorecido por la mezcla de FineMath, OpenMathInstruct-2 y NuminaMath-CoT en el preentrenamiento.
- Generación de código y texto técnico, derivada de la porción de web general de ClimbMix.
- Conocimiento enciclopédico en inglés gracias a la inclusión de Wikipedia.
- Capacidad de continuar formatos de pregunta-respuesta (`Question: ... Answer: ...`, `Problem: ... Solution: ...`, `User: ... Assistant: ...`) por exposición durante el preentrenamiento, no por instrucción explícita.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre arquitecturas MoE de bajo coste: el modelo sirve como banco de pruebas para estudiar enrutamiento top-1, balanceo de carga y el efecto del experto compartido en un régimen de 400M parámetros totales y 19M activos, con un coste de entrenamiento reproducible en una sola GPU.
- Estudio de embeddings de n-gramas con hashing: permite evaluar empíricamente cómo las tablas de n-gramas de 2, 3 y 4 tokens afectan a la perplejidad y a la coherencia local en modelos pequeños, un área con poca literatura abierta a esta escala.
- Fine-tuning supervisado como base para asistentes ligeros: al ser un modelo base Apache 2.0 con 19M parámetros activos, es un candidato para SFT y DPO en dominios concretos (soporte técnico, extracción de datos) con requisitos de cómputo muy bajos.
- Generación de texto en entornos con restricciones de memoria: con 400M parámetros totales, cabe en GPUs de consumo y en CPU, lo que permite desplegarlo en prototipos de completado de texto o generación de descripciones.
- Experimentación con decodificación y evaluación de tokenizadores: su tokenizador BPE con dígitos individuales y vocabulario de 16.384 facilita estudios sobre tokenización numérica y su impacto en tareas aritméticas.
- Docencia y reproducción de pipelines de entrenamiento: la model card documenta con detalle hiperparámetros, mezcla de datos por etapas y configuración de hardware, lo que lo convierte en material didáctico para cursos de entrenamiento de LLMs desde cero.
- Prototipado de sistemas de recuperación aumentada (RAG) en inglés: con contexto de 2.048 tokens puede emplearse como generador de respuestas en pipelines ligeros donde el coste por token es crítico, aunque requerirá ajuste previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 0,8 GB (399,6M parámetros × 2 bytes); en FP32, unos 1,6 GB. La memoria adicional para activaciones y caché KV es reducida dado el contexto de 2.048 tokens y la dimensión oculta de 192.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en BF16/FP16; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para entrenamiento o fine-tuning, se documenta una RTX Pro 6000 como hardware usado en el preentrenamiento.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al usar `transformers` con `custom_code`, requiere cargar el código remoto del repositorio (`trust_remote_code=True`). La conversión a GGUF para llama.cpp u Ollama no está documentada y dependería de la implementación de las capas MoE y los embeddings de n-gramas. vLLM y TGI no tienen soporte confirmado para esta arquitectura personalizada.
- Latencia y throughput estimados: no disponible. Con 19M parámetros activos por token, el coste computacional por token es bajo, pero el rendimiento real dependerá de la implementación del enrutamiento y de los embeddings de n-gramas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aurora2-400M-A20M | 399,6M | 19,1M | 2.048 | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 362M | 362M (denso) | 8.192 | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494M | 494M (denso) | 32.768 | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1.100M | 1.100M (denso) | 2.048 | Apache 2.0 | Hugging Face |

La comparación con modelos densos de tamaño similar revela el trade-off central de Aurora2: reduce drásticamente el cómputo por token (19M activos frente a 362M-494M de los densos), pero sacrifica longitud de contexto (2.048 frente a 8.192-32.768) y carece de fase de instrucción, mientras que SmolLM2 y Qwen2.5 se distribuyen con variantes instruct. No se dispone de datos de benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni RLHF: no sigue instrucciones de forma fiable y no debe desplegarse directamente como asistente conversacional.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, especialmente fuera de los dominios cubiertos por Wikipedia y los datasets matemáticos.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de documento largo, agentes con historial extenso o RAG con muchos fragmentos recuperados.
- Soporte únicamente de inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Sesgos heredados de ClimbMix (texto web general) y de Wikipedia, sin filtrado ni mitigación documentada más allá del filtrado implícito de los datasets de origen.
- El tokenizador trata cada dígito como token individual, lo que puede afectar a la eficiencia y al rendimiento en tareas aritméticas y de formateo numérico.
- La arquitectura personalizada (`custom_code`) implica dependencia del código del repositorio y compatibilidad limitada con frameworks de inferencia estándar como vLLM, TGI o llama.cpp, lo que complica el despliegue en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluación de calidad y de benchmarks publicados desaconseja su uso en producción sin una validación exhaustiva previa.
- El modelo se actualizó por última vez en noviembre de 2026 y registra cero descargas, por lo que no existe evidencia de uso comunitario ni de robustez en escenarios reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AuroraAI-Research/Aurora2-400M-A20M)
- [Dataset ClimbMix](https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle)
- [Dataset FineMath](https://huggingface.co/datasets/HuggingFaceTB/finemath)
- [Dataset Wikipedia (English)](https://huggingface.co/datasets/wikimedia/wikipedia)
- [Dataset SmolTalk](https://huggingface.co/datasets/HuggingFaceTB/smoltalk)
- [Dataset OpenMathInstruct-2](https://huggingface.co/datasets/nvidia/OpenMathInstruct-2)
- [Dataset NuminaMath-CoT](https://huggingface.co/datasets/AI-MO/NuminaMath-CoT)

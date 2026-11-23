# gunduzcagri/ReGeZen-0.3B-mHC-3Stream

## Resumen

ReGeZen-0.3B-mHC-3Stream es un modelo de lenguaje experimental de 306,5 millones de parámetros entrenado desde cero por el desarrollador independiente gunduzcagri. Se construye sobre una base tipo transformer de 24 capas con atención GQA (16 cabezas de consulta, 4 de clave/valor) y activación SwiGLU, a la que se le aplica una innovación estructural: conexiones hiper-residuales multi-flujo (multi-stream) restringidas a variedad mediante normalización de Sinkhorn-Knopp (mHC). El modelo mantiene tres flujos residuales paralelos de dimensión 1024 en lugar de uno solo, con un enrutador dinámico dependiente del token que mezcla la información entre flujos.

El modelo está orientado a tareas de código, matemáticas y razonamiento estratégico, con soporte nativo de un modo de pensamiento etiquetado como `<think>`. El entrenamiento combina upcycling de la base a la arquitectura de tres flujos, ajuste supervisado (SFT) con datos generales y ejemplos verificados de matemáticas y Python, y una fase final de GRPO (RLVR) con recompensas diversificadas. Los idiomas declarados son turco e inglés.

Es relevante como pieza de investigación más que como modelo de producción: explora si las conexiones hiper-residuales con restricción de variedad aportan ganancias medibles en un modelo pequeño, y publica los pesos bajo licencia Apache 2.0. El autor reporta un resultado de 18/20 en un examen propio de 20 preguntas (10 de código Python y 10 de matemáticas), aunque se trata de una evaluación interna no estandarizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (24 capas, GQA 16Q/4KV, SwiGLU) con conexiones hiper-residuales multi-flujo (mHC, 3 flujos) y normalización Sinkhorn-Knopp |
| Parametros totales | 306.497.379 (304,1M base + 2,36M del enrutador mHC y capa Sinkhorn-Knopp) |
| Parametros activos | No aplica (no es MoE); el enrutador mHC es dinámico por token pero denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en el ejemplo de uso; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (carpeta con `model_03b.py` y pesos); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 24 capas con atención de consultas agrupadas (16 cabezas Q, 4 KV) y SwiGLU en las capas feed-forward. Sobre esa base se aplica "upcycling" a una arquitectura de tres flujos residuales: el estado residual tiene forma `[B, T, 3, 1024]` en lugar de `[B, T, 1024]`, y un enrutador dependiente del token (2,36M parámetros) decide cómo mezclar los flujos en cada capa. La mezcla se restringe a una variedad mediante normalización de Sinkhorn-Knopp con 5 iteraciones, lo que mantiene la matriz de mezcla en el espacio de matrices doblemente estocásticas. El autor publica las matrices de compartición aprendidas `H_pre`: en la capa 0 la mezcla es casi identidad `[0.943, 0.029, 0.029]`, en la capa 11 `[0.890, 0.047, 0.063]` y en la capa 23 (decisión profunda) `[0.664, 0.183, 0.153]`, es decir, un 33,7% de mezcla activa entre los flujos 1 y 2 en las capas finales.

El entrenamiento se realizó en tres fases: (1) upcycling a tres flujos durante 2.000 pasos (131,1M tokens) con pérdida de validación 1,8718 (perplejidad 6,50); (2) SFT con 59.944 ejemplos generales durante una época más 5.000 ejemplos verificados de matemáticas y Python con etiquetas `<think>` durante tres épocas; (3) GRPO (RLVR) durante 200 pasos con recompensas diversificadas (código 1,400, matemáticas 0,803, estrategia 0,654). No se detalla la composición completa del corpus de preentrenamiento ni el número total de tokens de la base original.

## Capacidades

- Generación de texto conversacional en turco e inglés con plantilla de chat (`apply_chat_template`).
- Modo de razonamiento explícito mediante etiquetas `<think>`, entrenado con ejemplos verificados de matemáticas y Python.
- Generación de código Python, incluyendo funciones con contratos verificables (el autor reporta 10/10 en pruebas con asserts).
- Razonamiento matemático de nivel escolar y de competición básica (8/10 en el examen interno del autor).
- Razonamiento estratégico, incluido como objetivo de recompensa en la fase GRPO.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado más allá del modo `<think>`.
- Capacidades multimodales (visión, audio): no disponibles.
- Decodificación con parámetros de muestreo configurables (temperatura, penalización de repetición, tokens de parada).

## Casos de uso

- Generación de funciones Python con contrato de pruebas: el modelo produce código dentro de bloques ```python``` que puede validarse automáticamente con asserts; adecuado para generar candidatos en pipelines de síntesis de datos de código.
- Tutoría de matemáticas en turco: el modo `<think>` permite mostrar el razonamiento paso a paso antes de la respuesta final, útil en entornos educativos donde se quiere auditar el proceso.
- Prototipado de asistentes conversacionales en turco: al ser un modelo de 0,3B, puede desplegarse en hardware modesto (el autor lo probó en una RTX 4060 Ti) para demos y pruebas de concepto.
- Investigación sobre arquitecturas residuales: sirve como banco de pruebas reproducible para estudiar el efecto de las conexiones hiper-residuales con restricción Sinkhorn-Knopp frente a un residual estándar.
- Generación de datos sintéticos de razonamiento: sus trazas `<think>` pueden filtrarse y reutilizarse como datos de entrenamiento para modelos mayores, con verificación posterior.
- Experimentos de RLVR a pequeña escala: la combinación de GRPO con recompensas verificables en código y matemáticas es replicable en una sola GPU consumer, lo que lo hace útil para docencia e investigación de alineamiento.
- Tareas de razonamiento estratégico acotado (por ejemplo, resolución de problemas tipo puzzle) en inglés o turco, siempre con verificación humana dado el tamaño del modelo.

## Benchmarks y rendimiento

El autor solo publica un examen interno de 20 preguntas, no benchmarks estandarizados:

| Prueba | Resultado | Notas |
|---|---|---|
| Código Python (10 tests con assert) | 10/10 (100%) | Examen propio del autor |
| Matemáticas (10 preguntas) | 8/10 (80%) | Examen propio del autor |
| Total | 18/20 (90%) | Media de velocidad reportada: 18,2 tok/s en RTX 4060 Ti |
| Pérdida de validación tras upcycling | 1,8718 | Perplejidad 6,50, 2.000 pasos, 131,1M tokens |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en bfloat16 (el repositorio ocupa 0,6 GB), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs con 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna; el autor reporta pruebas en una RTX 4060 Ti. También es viable en CPU para inferencia lenta.
- Cabe en GPU consumer: sí, en RTX 3060, 4060, 4070 y superiores; también en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: el modelo requiere cargarse con el archivo `model_03b.py` incluido en el repositorio, no con `LlamaForCausalLM` estándar; por tanto, vLLM, TGI, llama.cpp y Ollama no son compatibles de forma directa sin portar la arquitectura mHC. El despliegue documentado es PyTorch + Transformers con el cargador propio.
- Latencia y throughput: 18,2 tokens/s reportados por el autor en una RTX 4060 Ti con generación de hasta 180 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ReGeZen-0.3B-mHC-3Stream | 306,5M | No disponible | Apache 2.0 | Hugging Face, requiere cargador propio | Arquitectura mHC experimental, turco e inglés |
| Qwen2.5-0.5B | 494M | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | Hugging Face, Transformers, GGUF, vLLM | Modelo denso estándar, multilingüe amplio |
| SmolLM2-360M | 362M | 8.192 tokens (según documentación pública) | Apache 2.0 | Hugging Face, Transformers, GGUF, llama.cpp | Entrenado con corpus grande, orientado a edge |
| TinyLlama-1.1B | 1.100M | 2.048 tokens (según documentación pública) | Apache 2.0 | Hugging Face, Transformers, GGUF, vLLM | Mayor tamaño, ecosistema maduro |

La comparación de rendimiento con estos modelos no está disponible: el autor no publica resultados en benchmarks comunes, por lo que no es posible situar el modelo frente a alternativas con datos objetivos.

## Limitaciones y advertencias

- Modelo experimental de investigación: no hay evidencia de robustez en producción ni evaluaciones independientes; el 18/20 proviene de un examen diseñado por el propio autor.
- Tamaño muy reducido (0,3B): alta probabilidad de alucinación en conocimiento factual y de errores en razonamiento de varios pasos.
- Cobertura idiomática limitada a turco e inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será pobre.
- Longitud de contexto no documentada; no se debe asumir una ventana larga.
- Compatibilidad limitada: requiere el cargador `model_03b.py` del repositorio; no funciona con `LlamaForCausalLM` ni con los runners estándar (vLLM, llama.cpp, Ollama, TGI) sin adaptación.
- No se documentan sesgos evaluados; al entrenarse desde cero con un corpus no descrito, pueden aparecer sesgos culturales y lingüísticos propios de los datos turcos e ingleses.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación de seguridad desaconseja su uso en aplicaciones sensibles sin auditoría previa.
- El repositorio no incluye tokenizador propio documentado: se usa `AutoTokenizer` sobre el checkpoint, lo que conviene verificar antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gunduzcagri/ReGeZen-0.3B-mHC-3Stream
- Repositorio del autor en Hugging Face: https://huggingface.co/gunduzcagri
- Paper, blog o demo adicional: no disponible en la información proporcionada.

# BranchingNLP/Grace-G1-55M-Instruct

## Resumen

Grace-G1-55M-Instruct es la versión ajustada por instrucciones del modelo base BranchingNLP/Grace-G1-55M, un asistente conversacional bilingüe italiano/inglés de 55 millones de parámetros desarrollado por BranchingNLP. Se trata de un modelo entrenado desde cero (no destilado de otro modelo mayor) y posteriormente sometido a un proceso de supervisión fina (SFT) sobre un conjunto de conversaciones, small talk, problemas matemáticos de enunciado generados por código y ejemplos de identidad.

El modelo emplea una arquitectura híbrida poco habitual en esta escala: combina capas de Gated DeltaNet con atención con compuertas en una proporción 3:1, y fue entrenado con el optimizador Muon. Con un tamaño de 55.007.304 parámetros reales (según los pesos en safetensors), 12 capas, dimensión de modelo 512 y una ventana de contexto de 2048 tokens, está claramente orientado a investigación y experimentación más que a uso productivo.

Su relevancia actual reside en ser un banco de pruebas abierto (licencia Apache-2.0) para arquitecturas de estado recurrente híbridas en modelos pequeños, así como para estudiar el comportamiento de asistentes conversacionales con presupuesto de parámetros extremadamente reducido. El propio autor lo describe explícitamente como un modelo "de juguete/investigación".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet 3:1 + atención con compuertas (gated attention) |
| Parametros totales | 55.007.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | Apache-2.0 (pesos y código) |
| Formato de pesos | safetensors |

Otros datos técnicos: d_model 512, 12 capas, 8/2 cabezas (8 de atención y 2 de valor, según la notación habitual), SwiGLU con dimensión intermedia 1408, vocabulario de 32768 tokens, optimizador Muon. Tamaño del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala bloques de Gated DeltaNet (un mecanismo de estado recurrente con decaimiento selectivo, del linaje de DeltaNet) con bloques de atención con compuertas en una proporción 3:1. Esta combinación busca reducir el coste cuadrático de la atención clásica manteniendo capacidad de modelado de dependencias, algo especialmente relevante en contextos largos relativos al tamaño del modelo. El entrenamiento del modelo base utilizó el optimizador Muon, una variante de descenso por gradiente con ortogonalización de actualizaciones, y consumió 10.000 millones de tokens.

La versión Instruct se obtuvo mediante SFT sobre el modelo base, con un conjunto de datos bilingüe compuesto por conversaciones, small talk, problemas matemáticos de enunciado generados por código y ejemplos de identidad. El prompt de sistema empleado en el entrenamiento fue: "Sei Grace, un'assistente AI creata da BranchingNLP. Rispondi in modo utile e preciso." El modelo genera un bloque `<|thinking|>...<|/thinking|>` antes de la respuesta final, un patrón de razonamiento explícito habitual en modelos instruct recientes. No se documenta el uso de RLHF ni DPO; el ajuste se limita a SFT.

## Capacidades

- Generación de texto conversacional bilingüe italiano/inglés: saludos, small talk, respuestas breves y presentación de sí mismo.
- Plantilla de chat propia con tokens especiales `<|im_start|>`, `<|system|>`, `<|user|>`, `<|assistant|>`, `<|thinking|>` y `<|im_end|>`.
- Modo de razonamiento explícito: emite un bloque `<|thinking|>...<|/thinking|>` previo a la respuesta.
- Capacidad limitada de resolución de problemas matemáticos de enunciado (entrenado con ejemplos sintéticos, pero el autor lo califica de poco fiable).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica que el modelo rinde peor en conversaciones multi-turno largas.
- Capacidades multilingües: solo italiano e inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en arquitecturas híbridas de estado recurrente: el modelo sirve como referencia reproducible para estudiar el comportamiento de Gated DeltaNet combinado con atención en una escala pequeña y con licencia permisiva, permitiendo experimentos de ablación sobre la proporción 3:1 y el optimizador Muon.
- Prototipado rápido de asistentes conversacionales: con 55M de parámetros y 0,2 GB de pesos, permite iterar sobre plantillas de chat, prompts de sistema y formatos de respuesta en cuestión de segundos, sin costes de infraestructura significativos.
- Evaluación de técnicas de SFT: al estar entrenado desde cero y ajustado con un dataset documentado (conversaciones, small talk, matemáticas sintéticas e identidad), es un caso de estudio útil para medir cómo el SFT moldea el comportamiento de un modelo base de muy baja capacidad.
- Generación de texto corto y controlado en italiano: respuestas breves, presentaciones y diálogos de un solo turno en aplicaciones de demostración o entornos educativos donde el coste computacional es crítico.
- Docencia y divulgación: permite ilustrar en un aula o taller el funcionamiento de una plantilla de chat con tokens especiales, el modo thinking y las limitaciones de un modelo de 55M frente a modelos de miles de millones de parámetros.
- Pruebas de integración de pipelines de inferencia: sirve para validar infraestructura de despliegue (carga de safetensors, kernels Triton mediante `fla`, gestión de plantillas) antes de migrar a modelos mayores con la misma interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 0,2 GB en precisión original (probablemente fp32 o bf16 según el repositorio); en fp16/bf16 serían unos 110 MB y en cuantización de 8 bits unos 55 MB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, con amplio margen.
- Opciones de despliegue: el autor proporciona `chat_grace.py` como script de inferencia de referencia. Requiere GPU y el paquete `fla` (kernel Triton) para las capas de Gated DeltaNet. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia muy baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Idiomas |
|---|---|---|---|---|---|
| Grace-G1-55M-Instruct | 55M | 2048 | Híbrida Gated DeltaNet + atención | Apache-2.0 | it, en |
| SmolLM2-135M-Instruct | 135M | 8192 | Transformer denso | Apache-2.0 | en (principalmente) |
| Qwen2.5-0.5B-Instruct | 500M | 32768 | Transformer denso | Apache-2.0 | multilingüe |
| TinyLlama-1.1B-Chat | 1,1B | 2048 | Transformer denso | Apache-2.0 | en |

La comparación es aproximada: Grace-G1-55M-Instruct es entre dos y veinte veces más pequeño que las alternativas habituales de la categoría "small language model", y su arquitectura híbrida no es directamente comparable con los transformers densos. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento objetivas.

## Limitaciones y advertencias

- El propio autor lo califica como modelo "de juguete/investigación": no es fiable como calculadora ni como enciclopedia.
- Alucinación severa de hechos: inventa fechas, nombres y lugares con gran seguridad; no tiene conocimiento factual fiable.
- Rendimiento pobre en matemáticas y razonamiento: inafectable a esta escala según el autor.
- Single-turn: rinde mejor con una pregunta por vez y deriva en conversaciones multi-turno largas; el autor recomienda `--no-history`.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo dos idiomas (italiano e inglés); no hay soporte documentado para castellano ni otros idiomas.
- Licencia Apache-2.0 para pesos y código, lo que permite uso comercial; sin embargo, los datasets de entrenamiento mantienen sus licencias originales, lo que puede condicionar la redistribución del modelo en determinados contextos.
- Requiere GPU y el paquete `fla` (kernel Triton) para la inferencia, lo que añade dependencias no triviales en entornos de producción.
- Sin soporte documentado de tool calling, agentes ni cuantizaciones oficiales, lo que limita su integración en pipelines de producción convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BranchingNLP/Grace-G1-55M-Instruct
- Modelo base: https://huggingface.co/BranchingNLP/Grace-G1-55M
- Perfil del autor en Hugging Face: https://huggingface.co/BranchingNLP

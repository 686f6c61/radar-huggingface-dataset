# RadixArk/DaisyRose-27B-NVFP4

## Resumen

DaisyRose-27B-NVFP4 es la versión cuantizada en NVFP4 (FP4 de 4 bits con escala de bloque, formato de NVIDIA) de DaisyRose-27B, el primer modelo publicado por RadixArk. Se trata de un modelo multimodal de razonamiento (pipeline `image-text-to-text`) construido sobre Qwen3.8-27B mediante entrenamiento exclusivamente con refuerzo (RL), sin supervisión fina ni destilación, sobre unas 1.200 tareas de agente de horizonte largo con sesiones de hasta 1M de tokens. Este repositorio concreto no contiene los pesos originales, sino una cuantización de 4 bits pensada para despliegue eficiente en hardware Blackwell.

El modelo base conserva la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B, así como su comprensión de imágenes y su ventana de contexto de 256K tokens, por lo que funciona como reemplazo directo en pilas de inferencia y post-entrenamiento existentes. La relevancia de esta variante NVFP4 radica en que reduce el peso del repositorio a 21,9 GB frente a los ~54 GB que ocuparían los pesos BF16 de un modelo de 27B, manteniendo la licencia Apache-2.0.

La ficha describe tanto las características heredadas del modelo base (arquitectura, contexto, capacidades multimodales) como las particularidades de esta cuantización, señalando explícitamente qué datos no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B); familia `qwen3_5` segun tags |
| Parametros totales | 18.164.649.200 (~18,16B en safetensors); la model card declara 27B |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 256K tokens (heredada del modelo base) |
| Tipos de cuantizacion | NVFP4 (FP4 de 4 bits, `modelopt`); existen variantes BF16 y FP8 del modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (cuantizacion NVFP4), libreria `transformers` |

## Arquitectura y entrenamiento

DaisyRose-27B parte de Qwen3.8-27B y mantiene su arquitectura transformer multimodal, su tokenizador y su plantilla de chat. El entrenamiento se realizó únicamente con aprendizaje por refuerzo sobre aproximadamente 1.200 tareas de agente de horizonte largo, con sesiones de hasta 1M de tokens, durante 18 días en 144 GPUs H200. No se aplicó supervisión fina ni destilación, lo que convierte al modelo en un caso de estudio de RL puro sobre un modelo base ya capaz. La model card menciona además un draft model asociado (Qwen3.8-27B-DSpark) para decodificación especulativa, aunque no se detalla su funcionamiento.

Esta variante NVFP4 se genera con `modelopt` (herramienta de cuantización de NVIDIA) y aplica FP4 de 4 bits con escalas de bloque, un formato optimizado para las unidades tensor de las GPUs Blackwell. La model card advierte que el checkpoint NVFP4 no fue evaluado con la batería completa de benchmarks, por lo que los resultados publicados corresponden a las ejecuciones BF16 y FP8 del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (reasoning effort `xhigh` por defecto en la plantilla).
- Comprensión de imágenes (pipeline `image-text-to-text`), heredada de Qwen3.8-27B.
- Ejecución de tareas de agente de horizonte largo: sesiones de hasta 1M de tokens y uso de terminal/entorno (Terminal Bench).
- Razonamiento sobre código y resolución de incidencias en repositorios (SWE Bench, DeepSWE).
- Seguimiento de instrucciones complejas (IFBench) y razonamiento científico (GPQA Diamond, HLE).
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte explícito de tool calling / function calling: no disponible en la información proporcionada.
- Decodificación especulativa mediante el draft model DSpark (mencionado, sin detalles técnicos).

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo está entrenado específicamente en tareas de agente con terminal (Terminal Bench 4.1 pasa de 5,6 a 12,0 respecto al base) y puede operar sesiones largas de shell dentro de su contexto de 256K tokens.
- Resolución de incidencias en repositorios de código: con 46,2 en DeepSWE v1.1 y 94,7 en SWE Bench Pro v2, es adecuado para pipelines de CI/CD que requieran parchear código a partir de un issue.
- Agentes de larga duración con memoria extensa: la ventana de 256K tokens y el entrenamiento con sesiones de hasta 1M permiten mantener estado de tareas multi-paso sin resumir en exceso.
- Análisis de documentos e imágenes combinados: al ser multimodal, puede procesar capturas, diagramas o PDFs renderizados junto a texto en un mismo flujo.
- Despliegue en GPUs Blackwell con requisitos de memoria ajustados: la cuantización NVFP4 reduce el peso a 21,9 GB, lo que facilita servir el modelo en una sola GPU de 48-80 GB con margen para KV cache.
- Evaluación de razonamiento científico y matemático: útil como modelo de referencia en entornos de investigación que necesiten un modelo abierto con licencia Apache-2.0.
- Sustitución directa de Qwen3.8-27B en pilas existentes: al conservar tokenizador y plantilla de chat, se puede integrar sin cambios en infraestructuras ya montadas para el base.

## Benchmarks y rendimiento

Resultados publicados por el autor para DaisyRose-27B (BF16/FP8; el checkpoint NVFP4 no se evaluó en la suite completa):

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Terminal Bench 4.1 | 12.0 | 5.6 | 0.5 | 0.0 | **16.1** | 13.0 | 6.4 | 6.6 | 15.2 |
| Terminal Bench 2.1 | 75.5 | 73.0 | 51.7 | 44.9 | **87.6** | 81.3 | 80.1 | 76.4 | 73.0 |
| DeepSWE v1.1 | 46.2 | 42.2 | 4.4 | 0.0 | 67.9 | **72.1** | 43.3 | 60.0 | 66.6 |
| SWE Bench Pro v2 | 94.7 | 91.3 | 80.4 | 73.3 | – | **97.7** | – | 95.0 | – |
| HLE (solo texto) | 34.3 | 33.9 | 22.0 | 22.2 | 35.1 | **44.1** | 34.7 | 43.9 | 38.5 |
| IFBench | **82.4** | 79.5 | 77.0 | 64.4 | – | – | 79.6 | – | – |
| GPQA Diamond | 90.7 | 89.2 | 83.5 | 86.0 | 88.7 | **93.0** | 90.6 | 89.0 | 90.5 |

Los datos de los modelos comparados provienen de sus respectivas model cards, leaderboards y Artificial Analysis, según detalla el autor.

## Requisitos de hardware

- Peso del repositorio: 21,9 GB en NVFP4, frente a ~54 GB de una cuantización BF16 equivalente para 27B.
- VRAM estimada para inferencia: no disponible de forma oficial; con 21,9 GB de pesos, un despliegue en una GPU de 48 GB o 80 GB deja margen para KV cache con contexto largo.
- GPU recomendadas: el formato NVFP4 está optimizado para GPUs Blackwell (B200, GB200); en generaciones anteriores (Hopper, Ada) no se aprovecha el formato de 4 bits de forma nativa.
- ¿Cabe en GPU de consumo? No disponible; dependería del soporte del runtime para NVFP4 en GPUs GeForce.
- Opciones de despliegue: `transformers` (librería declarada); compatibilidad con vLLM, TensorRT-LLM, llama.cpp u Ollama no está confirmada en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal Bench 4.1 | DeepSWE v1.1 | Licencia |
|---|---|---:|---:|---:|---|
| DaisyRose-27B | 27B (18,16B en safetensors) | 256K | 12.0 | 46.2 | Apache-2.0 |
| Qwen3.8-27B (base) | 27B | 256K | 5.6 | 42.2 | No disponible |
| Muse Glimmer-30B | 30B | No disponible | 0.5 | 4.4 | No disponible |
| MiMo V2.6 Flash | 309B totales / 15B activos | No disponible | 16.1 | 67.9 | No disponible |

La comparación se limita a los datos publicados en la model card; no se dispone de información sobre contexto, licencia o cuantizaciones del resto de modelos más allá de lo indicado.

## Limitaciones y advertencias

- El checkpoint NVFP4 no fue evaluado con la suite completa de benchmarks; los resultados publicados corresponden a BF16/FP8 y pueden no trasladarse exactamente a esta cuantización.
- La cuantización a 4 bits puede degradar tareas sensibles a precisión numérica (matemáticas, código) respecto a BF16.
- El formato NVFP4 requiere hardware Blackwell para aprovecharse; en otras GPUs el rendimiento puede ser inferior o no estar soportado.
- El modelo se entrenó solo con RL sobre ~1.200 tareas, lo que puede limitar la generalización fuera de dominios de agente y código.
- Riesgo de alucinación no cuantificado en la información disponible; HLE de 34,3 sugiere margen de mejora en razonamiento de conocimiento.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado más allá del base.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio y las condiciones del modelo base Qwen3.8-27B.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un lanzamiento muy reciente sin validación comunitaria.

## Enlaces

- Hugging Face (NVFP4): https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Modelo base BF16: https://huggingface.co/RadixArk/DaisyRose-27B
- Variante FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Draft model DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog del autor: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4/blob/main/LICENSE
- Paper SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
- Leaderboard Terminal Bench: https://www.tbench.ai/leaderboard
- Artificial Analysis Qwen3.8: https://artificialanalysis.ai/models/qwen3-8-27b

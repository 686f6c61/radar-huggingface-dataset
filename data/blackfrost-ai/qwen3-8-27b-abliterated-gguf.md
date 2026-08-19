# Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF

## Resumen

Qwen3.8-27B-ABLITERATED-GGUF es una conversion a formato GGUF del modelo Qwen3.8-27B, un vision-language model denso de aproximadamente 26 900 millones de parametros desarrollado por Qwen y posteriormente modificado por Blackfrost-AI mediante un proceso de abliteracion a nivel de pesos. La abliteracion reduce la superficie de rechazo del modelo (comportamiento de refusal) sin recurrir a fine-tuning, merges, LoRA ni pruning, manteniendo la arquitectura original intacta.

El modelo base Qwen3.8-27B es un VLM denso con 64 capas de texto, arquitectura hibrida que combina Gated DeltaNet con atencion completa, y una torre de vision de 27 capas. Soporta entrada de texto, imagen y video con salida textual, y ofrece una ventana de contexto arquitectonica de 262 144 tokens. Esta version abliterada se distribuye como una escalera completa de cuantizaciones GGUF estandar (Q2_K a Q8_0) junto con dos proyectores de vision, orientada a su uso con llama.cpp.

La relevancia de este modelo radica en que ofrece una alternativa desplegable en hardware local con capacidades multimodales, razonamiento configurable y tool calling, bajo licencia Apache-2.0. La version abliterada reduce los rechazos del modelo original del 100 % al 2,4 % en el benchmark R1-HARMFUL-BENCH-450, lo que la hace util para investigacion y casos de uso donde el comportamiento de rechazo del modelo base resulta excesivamente restrictivo. Se trata de una publicacion experimental que requiere validacion previa en cada carga de trabajo antes de su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 dense hybrid VLM: 64 capas de texto con Gated DeltaNet + atencion completa, torre de vision de 27 capas |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (arquitectonica); contexto practico limitado por RAM/VRAM |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible (hereda las capacidades multilingues del modelo base Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repositorio BF16 padre) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de arquitectura hibrida que combina Gated DeltaNet con atencion completa en sus 64 capas de texto. Esta arquitectura busca equilibrar la eficiencia computacional de los mecanismos recurrentes con la capacidad expresiva de la atencion transformer clasica. El modelo incorpora ademas una torre de vision de 27 capas que le permite procesar imagenes y video como entrada, manteniendo la salida exclusivamente textual.

El proceso de abliteracion aplicado por Blackfrost-AI modifica los pesos del modelo a nivel de capa para reducir la superficie de rechazo, sin recurrir a fine-tuning, merges, LoRA ni pruning. El modelo padre es Qwen/Qwen3.8-27B bajo licencia Apache-2.0, y la transformacion se realizo sobre el checkpoint BF16 antes de convertirlo a la escalera de cuantizaciones GGUF. El prompt de ejecucion corto de Blackfrost queda incrustado en la plantilla Jinja del chat template por defecto. No se incluye la cabeza especulativa (speculative head) en los archivos GGUF, priorizando la compatibilidad amplia con builds actuales de llama.cpp. Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Entrada multimodal: procesa texto, imagen y video, con salida exclusivamente textual.
- Razonamiento configurable: soporta modos de razonamiento ajustables segun la tarea.
- Tool calling / function calling: capacidad para invocar herramientas externas, integrable en flujos agente.
- Agentes y razonamiento multi-paso: disenado para tareas agente de horizonte largo.
- Ventana de contexto larga: 262.144 tokens arquitectonicos, adecuada para documentos extensos y conversaciones multi-turno.
- Generacion de codigo: el modelo base Qwen3.8-27B destaca en tareas de codificacion agente, vision y chat.
- Capacidades multilingues: heredadas del modelo base Qwen3.8-27B (idiomas concretos no especificados en la documentacion disponible).
- Comportamiento de rechazo reducido: la abliteracion reduce los rechazos del 100 % al 2,4 % en el benchmark R1-HARMFUL-BENCH-450.

## Casos de uso

- Despliegue local de un asistente multimodal: gracias a la escalera de cuantizaciones GGUF, es posible ejecutar el modelo en una unica GPU de consumo con el quant Q4_K_M (16,5 GB), ofreciendo un asistente con vision y chat sin dependencia de APIs externas.
- Procesamiento de documentos con imagenes: la entrada de imagen combinada con la ventana de contexto de 262 K tokens permite analizar documentos extensos que incluyan diagramas, capturas de pantalla o graficos, extrayendo informacion estructurada de forma local.
- Agentes con tool calling en entornos aislados: el soporte de function calling y razonamiento multi-paso permite construir agentes que interactuan con APIs, bases de datos o herramientas de linea de comandos, con la ventaja de poder ejecutarse en infraestructura propia.
- Analisis de video para investigacion: la capacidad de entrada de video permite procesar grabaciones para tareas de indexacion, resumen o deteccion de eventos, con la flexibilidad de cuantizaciones ajustables segun el hardware disponible.
- Generacion de codigo asistida por vision: el modelo puede recibir capturas de pantalla de interfaces o diagramas de arquitectura y generar codigo correspondiente, util en entornos de desarrollo donde no se desea enviar informacion sensible a servicios en la nube.
- Prototipado rapido de aplicaciones VLM: la licencia Apache-2.0 y el formato GGUF estandar permiten integrar el modelo en pipelines de desarrollo con llama.cpp, Ollama o servidores OpenAI-compatibles para validar conceptos sin coste de inferencia en la nube.
- Investigacion sobre seguridad y alineacion: la version abliterada permite estudiar el comportamiento de rechazo de los modelos y comparar la superficie de refusal entre el checkpoint original y el modificado, un caso de uso relevante para la comunidad de investigacion en IA.

## Benchmarks y rendimiento

El unico benchmark publicado en la informacion disponible es el de rechazo R1-HARMFUL-BENCH-450, que evalua la tasa de refusal del modelo sobre 450 casos distribuidos en 150 prompts de AdvBench, 150 de StrongREJECT y 150 de XSTest:

| Etapa de evaluacion | Casos evaluados | Respuesta material | Rechazo residual | Otros |
|---|---:|---:|---:|---:|
| Plantilla original upstream | 450 | 360 | 88 | 2 limitaciones de capacidad |
| Retest con prompt operacional Blackfrost | 88 residuales | 53 | 33 | 1 limitacion, 1 salida incoherente reproducible |
| Retest con prompt de ejecucion corto | 33 residuales | 22 | 11 | 0 |
| **Recuento residual final** | **450 casos originales** | — | **11 (2,4 %)** | — |

El resultado se midio sobre el derivado W4A4 NVFP4 del mismo padre BF16, no sobre una ejecucion completa de los archivos GGUF con el prompt final. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta version abliterada.

## Requisitos de hardware

- Escalera de cuantizaciones con tamanos de archivo de 10,7 GB (Q2_K) a 28,6 GB (Q8_0); el quant recomendado por defecto es Q4_K_M con 16,5 GB.
- Proyectores de vision opcionales: mmproj F16 (0,93 GB) y mmproj Q8_0 (0,63 GB); se carga uno junto al quant de texto.
- La memoria en tiempo de ejecucion incluye estado de contexto, buffers de computo, el proyector de vision opcional y overhead del servidor.
- El modelo cabe en GPUs de consumo con 24 GB de VRAM (RTX 4090, RTX 3090) usando Q4_K_M o inferiores; para Q6_K y Q8_0 se recomiendan GPUs con 24 GB o mas, o despliegue hibrido CPU/GPU.
- Probado con llama-server en NVIDIA B200 con Q4_K_M y el proyector compacto, servido a traves de la API compatible con OpenAI.
- Opciones de despliegue: llama.cpp (llama-server), compatible con el formato GGUF estandar; tambien puede servirse mediante Ollama

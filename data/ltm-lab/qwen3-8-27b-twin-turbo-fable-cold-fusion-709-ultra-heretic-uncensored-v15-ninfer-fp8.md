# LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15-ninfer-FP8

## Resumen

Este repositorio contiene un paquete de inferencia en formato `ninfer` del modelo `Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15`, un fine-tune comunitario de la familia Qwen3.8 de 27B parámetros con capacidades multimodales (image-text-to-text) y sin censura alineada. El paquete lo publica LTM-Lab y está cuantizado en FP8 con escalado por filas, pensado para ejecutarse con el motor propietario ninfer sobre GPU NVIDIA Blackwell.

El modelo base incorpora la llamada "V15 episodic memory", un mecanismo de memoria episódica que, según la model card, no requiere entrenamiento adicional y se gestiona mediante un servicio auxiliar en Python que nunca carga los pesos. El paquete incluye además visión, decodificación especulativa MTP (por defecto), un borrador DFlash2 alternativo y la cabeza de propuesta de ninfer.

Es relevante ahora porque demuestra un stack completo de inferencia de 27B multimodal con contexto de 262.144 tokens y concurrencia de 8 carriles sobre una única GPU profesional (RTX PRO 6000 de 96 GB), con métricas medidas y publicadas. No obstante, la dependencia de un motor propietario, de una GPU Blackwell y de un parche sobre un commit concreto limita seriamente su portabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con memoria episódica V15 y decodificación especulativa MTP/DFlash2 |
| Parámetros totales | 27B (según nomenclatura del modelo; no se detalla desglose) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | FP8 con escalado por filas (pesos); KV cache en FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (paquete propietario, 30,3 GB); configuración y tokenizer en JSON/Jinja |
| Modalidades | Texto e imagen (image-text-to-text) |
| Motor de inferencia | ninfer (commit `5a5c2c1` + parche V15) |
| Hardware requerido | NVIDIA Blackwell `sm_120a` (medido en RTX PRO 6000 de 96 GB) |
| Concurrencia máxima medida | 8 carriles |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.8 (27B parámetros) según la nomenclatura del autor, con soporte de visión. Sobre el modelo base, el fine-tune introduce la "V15 episodic memory", un mecanismo de memoria persistente que se ejecuta como servicio separado (`tools.v15_memoryd`) y que, según la model card, no requiere entrenamiento: el servicio lee los ficheros de configuración y el núcleo `modeling_qwen_dense_v15.py`, pero nunca carga los pesos. Los eventos de memoria se almacenan en disco (`--memory-home`) y se pueden desactivar por petición con `"memory": false`.

El paquete incorpora dos backends de decodificación especulativa: MTP (Multi-Token Prediction, por defecto, con `--draft-tokens 3`) y DFlash2 (`--draft-tokens 7`), seleccionables al arrancar el servidor. También incluye una cabeza de propuesta propia de ninfer. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el fine-tune; la model card no los detalla.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Comprensión de imágenes (pipeline image-text-to-text); en las pruebas medidas identifica correctamente el contenido de una imagen.
- Memoria episódica persistente entre sesiones: recuperación de hechos almacenados (6 de 6 hechos recordados en las pruebas) y respuesta a preguntas no relacionadas sin interferencia (4 de 4).
- Decodificación especulativa para acelerar la generación (MTP y DFlash2).
- Tool calling: en una de las pruebas de concurrencia el modelo respondió con una llamada a herramienta en lugar del número solicitado, lo que evidencia soporte de function calling.
- Modo "uncensored": el fine-tune elimina total o parcialmente las capas de rechazo del modelo original.
- Servidor compatible con OpenAI Chat Completions, OpenAI Responses y Anthropic Messages.
- Capacidad multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de largo recorrido: con 262.144 tokens de contexto y memoria episódica persistente, el modelo puede mantener el hilo de conversaciones extensas y recordar hechos entre sesiones, lo que encaja en asistentes personales o de soporte con historial duradero.
- Procesamiento de documentos extensos con imágenes: la combinación de contexto largo y visión permite analizar informes, contratos o manuales con figuras en una sola pasada, sin trocear el documento.
- Atención al cliente automatizada: el servidor expone APIs compatibles con OpenAI y Anthropic, de modo que se puede integrar en stacks existentes sin reescribir el cliente; la concurrencia de 8 carriles soporta varias conversaciones simultáneas.
- Análisis de capturas y diagramas en pipelines técnicos: el soporte de visión permite extraer información de diagramas de arquitectura, gráficos o interfaces y volcarla a texto estructurado.
- Investigación sobre alineación y contenido sin censura: al ser un fine-tune "heretic/uncensored", sirve para estudiar comportamientos del modelo sin capas de rechazo, con la advertencia de que requiere revisión humana en producción.
- Agentes con memoria a largo plazo: la memoria episódica persistente en disco permite construir agentes que acumulan contexto entre ejecuciones, con la opción de desactivarla por petición cuando no se necesite.
- Prototipado de inferencia de alto rendimiento en una sola GPU: con MTP y 8 carriles se midieron 69-112 tokens/s agregados con memoria y hasta 492 tokens/s sin memoria en pruebas previas, lo que permite validar cargas de trabajo antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones de rendimiento del sistema en una RTX PRO 6000 Blackwell (96 GB), con contexto de 262.144 tokens, 8 carriles y KV en FP8:

| Métrica | MTP (por defecto) | DFlash2 |
|---|---|---|
| Tiempo hasta listo | 121 s | 127 s |
| Capacidad de KV cache (`auto`) | 1.648.128 tokens | 1.496.960 tokens |
| Hechos recordados | 6 de 6 | 6 de 6 |
| Preguntas no relacionadas respondidas | 4 de 4 | 4 de 4 |
| 8 chats simultáneos | 7 de 8 (8 de 8 en segunda pasada) | 8 de 8 |
| Hecho en prompt de 9.442 tokens | Encontrado | Encontrado |
| Imagen identificada | Sí | Sí |
| Servidor tras petición abortada | Vivo | Vivo |
| Una respuesta de 320 tokens (con primer token) | 4,0-7,2 s (44-80 tokens/s) | 7,0-10,0 s (32-46 tokens/s) |
| 8 respuestas de 200 tokens simultáneas | 69-112 tokens/s | 44-112 tokens/s |
| Tokens redactados aceptados | 42-76 % | 2,3-4,3 % |

Pruebas adicionales de referencia: DFlash2 sin memoria alcanzó 51 tokens/s en una respuesta y 222-251 tokens/s con ocho simultáneas (0,8-2,0 % de aceptación); ninfer sin memoria con MTP midió 104 tokens/s en una respuesta y 492 tokens/s con ocho. La conclusión del autor es usar MTP, ya que el borrador de DFlash2 rara vez se acepta con este modelo.

## Requisitos de hardware

- GPU NVIDIA Blackwell con arquitectura `sm_120a` obligatoria; el paquete se compiló y midió en una RTX PRO 6000 de 96 GB.
- El paquete ocupa 30,3 GB, pero el contexto completo de 262.144 tokens y 8 carriles requieren reservar KV cache en FP8 (capacidad medida de 1,5-1,6 millones de tokens con `--kv-capacity auto`), por lo que se necesita una GPU de gran memoria.
- No cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) por la combinación de requisito `sm_120a` y volumen de KV cache; no se han publicado pruebas en otras GPU.
- Software: CUDA 13.0, CMake 3.28+, Ninja, FFmpeg (libavcodec, libavformat, libavutil, libswscale) y libcurl. Para el servicio de memoria, Python 3.12 con PyTorch CUDA y Transformers 5 (medido con torch 2.13.0+cu130 y Transformers 5.12.1).
- Despliegue exclusivamente mediante ninfer compilado desde el repositorio `MerkyorLynn/ninfer-rollout` (commit `5a5c2c1`) con el parche `ninfer_v15.patch`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; una respuesta de 320 tokens tarda 4,0-7,2 s con MTP y 7,0-10,0 s con DFlash2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (FP8 ninfer) | 27B | 262.144 | Apache 2.0 | Solo motor ninfer, GPU Blackwell |
| Modelo base BF16 (`LTM-Lab/...-v15`) | 27B | No disponible | Apache 2.0 | Pesos BF16 en Hugging Face |
| `DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored` | 27B | No disponible | No disponible | Pesos en Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total de un motor propietario (ninfer) y de un parche sobre un commit concreto; no hay rutas de despliegue estándar (vLLM, llama.cpp, TGI).
- Requiere GPU NVIDIA Blackwell (`sm_120a`); no funciona en generaciones anteriores ni en hardware de consumo habitual.
- El modelo es "uncensored/heretic": carece de capas de rechazo, por lo que puede generar contenido dañino, ofensivo o inexacto sin filtros. Requiere moderación externa en cualquier despliegue público.
- Riesgo de alucinación no cuantificado; no hay benchmarks académicos publicados que permitan estimarlo.
- El fine-tune acumula múltiples capas de modificaciones comunitarias (TWIN-TURBO, Fable, Cold-Fusion, 709, ULTRA-HERETIC) sin documentación de los datos de entrenamiento ni del proceso de alineación.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- La memoria episódica persiste en disco y puede acumular datos sensibles; conviene gestionar el almacén (`--memory-home`) y su borrado.
- DFlash2 rinde peor que MTP con este modelo (2,3-4,3 % de aceptación de tokens redactados frente a 42-76 %), por lo que no se recomienda su uso.
- Aunque la licencia declarada es Apache 2.0, la cadena de modelos base y las condiciones de los fine-tunes intermedios no están verificadas; conviene revisarlas antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15-ninfer-FP8
- Modelo base (BF16): https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15
- Modelo original de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Motor ninfer: https://github.com/MerkyorLynn/ninfer-rollout

# aikexue170/rewrite3-27b-q4km

## Resumen
rewrite3-27B es un modelo de generación de texto especializado en la reescritura de novelas web en chino, desarrollado por el usuario aikexue170 y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino supervisado (SFT) sobre Qwen/Qwen3.8-27B, orientado a tomar textos degradados por generación automática (AIGC) y reescribirlos para que resulten fluidos, mantengan el estilo del autor y no copien literalmente el original. No es un modelo de continuación ni de creación libre: su tarea es preservar trama, personajes y eventos mientras reorganiza las frases y elimina el llamado "sabor a IA".

El modelo incorpora dos innovaciones destacables. Por un lado, la puntuación JEV: cada frase del texto de entrada llega etiquetada con una probabilidad de ser "texto de baja calidad generado por IA", calculada por un discriminador externo independiente (jevnovel3 0.8B), y el modelo usa esas marcas para localizar los fragmentos problemáticos. Por otro, incluye una cabeza MTP (multi-token prediction) reentrenada que actúa como decodificación especulativa, con una tasa de aceptación de borradores del 56% en decodificación voraz con n=3, lo que según el autor supone aproximadamente el doble de velocidad de extremo a extremo.

El repositorio concreto es la cuantización Q4_K_M en formato GGUF, con un peso de 17,0 GB (15,8 GiB), pensada para despliegue local con llama.cpp. La model card advierte de que esta variante de 4 bits todavía no ha sido evaluada con el conjunto de pruebas JEV del autor, por lo que las cifras de calidad publicadas corresponden a otras cuantizaciones (FP8, IQ4_XS y NVFP4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.8-27B), con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27B (aproximado, segun el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificacion oficial; el ejemplo de llama-server usa -c 16384 |
| Tipos de cuantizacion | Q4_K_M (este repositorio); la familia incluye BF16, FP8 W8A8, NVFP4, IQ4_XS y otras variantes GGUF (Q3_K_M, IQ3_XS) |
| Idiomas soportados | zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con cabeza MTP embebida en blk.32.nextn.*); otras variantes en safetensors/compressed-tensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.8-27B, un transformer decoder-only, y se somete a un ajuste fino supervisado específico para reescritura de novela web china. Los datos de entrenamiento incluyen cadenas de pensamiento de estilo editorial: el modelo aprende a señalar primero qué fragmentos suenan a IA y por qué, a proponer un plan de modificación y solo después a producir el texto reescrito. El objetivo de entrenamiento exige mantener invariantes la trama, los personajes y los eventos, comprimir redundancias y eliminar fórmulas repetitivas, permitiendo añadir detalles de ambiente, acción o psicología siempre que no se inventen elementos de la historia.

La entrada incorpora, al final de cada frase, una puntuación entre corchetes (por ejemplo 【0.123】) generada por el discriminador externo jevnovel3 0.8B, que estima la probabilidad de que esa frase sea texto generado de baja calidad. Esa señal guía la atención del modelo hacia los tramos prioritarios; el modelo puede funcionar sin puntuaciones, pero entonces queda fuera de la distribución de entrenamiento. La cabeza MTP no es la original del modelo base: fue reentrenada sobre los datos v14-sfw y se empaqueta dentro del GGUF para habilitar decodificación especulativa con llama.cpp. No se dispone de información sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades
- Reescritura de texto narrativo en chino con preservación de trama, personajes y eventos.
- Análisis editorial previo: identificación de frases con "sabor a IA" y justificación de los cambios propuestos.
- Reorganización por párrafos en lugar de sustitución sinonímica frase a frase.
- Compresión de texto redundante y eliminación de repeticiones.
- Adición controlada de detalles de ambiente, acción y psicología sin inventar elementos de la historia.
- Uso de puntuaciones externas JEV como señal de entrada para priorizar la corrección.
- Decodificación especulativa mediante cabeza MTP integrada (aceleración de inferencia).
- Generación de texto general (pipeline text-generation), aunque el ajuste está orientado a la tarea de reescritura.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso
- Limpieza de manuscritos de novela web: un editor introduce capítulos con marcas JEV por frase y el modelo devuelve una versión reescrita sin fórmulas de IA, manteniendo la historia intacta; es el caso de uso central para el que fue entrenado.
- Preprocesado en pipelines editoriales: integración como etapa automática entre la generación asistida y la revisión humana, con la restricción de no superar 15 caracteres de copia literal consecutiva respecto al original.
- Detección y corrección de relleno: el modelo localiza pasajes inflados (puntuaciones JEV altas) y los condensa, útil para reducir longitud de capítulos sin perder información argumental.
- Armonización de estilo entre capítulos: reescritura de fragmentos generados por distintos sistemas para que mantengan una voz de autor coherente a lo largo de una obra.
- Despliegue local con llama.cpp: la variante Q4_K_M de 17 GB permite ejecutar el modelo en estaciones de trabajo con GPU de consumo alta, sin depender de servicios en la nube, para flujos de trabajo con material confidencial.
- Servicio de reescritura por lotes: con la cabeza MTP y decodificación especulativa (n=3), el autor reporta aproximadamente el doble de velocidad, adecuado para procesar muchos capítulos en paralelo.
- Evaluación comparativa de cuantizaciones: el repositorio y su tabla de resultados sirven para decidir entre FP8, IQ4_XS y NVFP4 según el equilibrio entre calidad JEV, velocidad y memoria.

## Benchmarks y rendimiento
La model card incluye una evaluación propia sobre seis prompts con el mismo hardware y caché KV en bf16, midiendo la puntuación JEV media (menor es mejor), la "tasa de desvinculación" del original, la copia literal máxima y total, la longitud del texto y el tiempo medio. Las cifras corresponden a FP8, IQ4_XS y NVFP4; el Q4_K_M de este repositorio no aparece en la tabla.

| Formato | JEV medio ↓ | Desvinculación ↑ | Copia máxima (caracteres) ↓ | Copia total ↓ | Longitud del texto | Muestras demasiado largas | Tiempo medio |
|:--|--:|--:|--:|--:|--:|--:|--:|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que BF16 es la referencia de calidad pero no se evaluó con este conjunto de seis prompts, y que Q3_K_M, Q4_K_M e IQ3_XS quedan pendientes de prueba.

## Requisitos de hardware
- VRAM para este repositorio: el archivo GGUF Q4_K_M pesa 17,0 GB (15,8 GiB); con caché KV en bf16 y contexto de 16 384 tokens hay que prever margen adicional, por lo que se recomienda al menos 24 GB de VRAM para GPU única.
- GPU recomendadas: para Q4_K_M, tarjetas de 24 GB o más (RTX 4090, RTX 3090, A10G, L4 con offload parcial); para FP8 (35,9 GB) se necesitan 48 GB (A6000, L40S, A100 80 GB); para BF16 (54,7 GB) se requiere A100/H100 de 80 GB o reparto multi-GPU.
- Cabe en GPU de consumo: sí, la variante Q4_K_M en RTX 4090/3090 (24 GB) con --n-gpu-layers 99 y contexto moderado; IQ4_XS es aún más ligera.
- Opciones de despliegue: llama.cpp (llama-server, nightly b12374 o superior) con --spec-type draft-mtp --spec-draft-n-max 3 para activar la decodificación especulativa; vLLM para las variantes BF16, FP8 y NVFP4.
- Latencia y throughput: en la evaluación del autor, IQ4_XS promedia 41 s por muestra de seis prompts (incluyendo razonamiento y texto final) frente a 71 s de FP8; la cabeza MTP con n=3 alcanza un 56% de aceptación de borradores en decodificación voraz y aproximadamente 2x de aceleración de extremo a extremo según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-27B (este) | 27B | no disponible (ejemplo con 16k) | Reescritura de novela web china con señal JEV y MTP | Apache 2.0 | Hugging Face y ModelScope |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Modelo generalista de generación de texto | según modelo base (no disponible) | Hugging Face |
| jevnovel3 0.8B | 0,8B | no disponible | Discriminador de "sabor a IA" por frase | no disponible | citado en la model card, sin enlace |

No se dispone de datos de benchmarks comparativos frente a otros modelos de reescritura, por lo que la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias
- Modelo monolingüe: solo soporta chino (zh); no está entrenado para otros idiomas.
- Especialización estrecha: está diseñado exclusivamente para reescritura de novela web; su uso como modelo generalista no está validado.
- Dependencia de la señal JEV: sin las puntuaciones por frase del discriminador externo, el modelo opera fuera de la distribución de entrenamiento y la calidad puede degradarse.
- Riesgo de "inflado": con prompts de reducción, en ocasiones alarga el texto en lugar de acortarlo (3 de 6 muestras demasiado largas con FP8).
- Riesgo de copia literal: aunque el proyecto impone un límite de 15 caracteres consecutivos copiados, se observaron copias máximas de hasta 31,2 caracteres (FP8) en la evaluación.
- La cuantización Q4_K_M de este repositorio no ha sido evaluada con el conjunto JEV del autor; las cifras de calidad publicadas no son directamente extrapolables.
- No se han publicado datos sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.
- La model card está redactada íntegramente en chino y contiene HTML embebido; la documentación técnica en otros idiomas es inexistente.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-q4km
- Variante BF16 en Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Variante BF16 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite3-27b-bf16
- Variante FP8 en Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Variante FP8 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite3-27b-fp8 (enlace truncado en la información disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (runtime recomendado, nightly b12374 o superior): https://github.com/ggml-org/llama.cpp
- vLLM (para variantes BF16/FP8/NVFP4): https://github.com/vllm-project/vllm

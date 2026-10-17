# nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 es un modelo de lenguaje de aproximadamente 4.000 millones de parametros (3.975.229.440 segun los pesos en safetensors) desarrollado por NVIDIA dentro de su linea Nemotron Labs. Su singularidad radica en que no es un transformer denso convencional, sino un modelo con bucle (latente-recurrente) construido sobre una arquitectura de GPT normalizado (nGPT) con atencion hibrida: capas de sliding-window attention (SWA) intercaladas con capas de atencion completa. La pila de capas se divide en tres bloques (entrada, recurrente y salida) y el bloque recurrente, de 20 capas, se aplica repetidamente, de modo que el modelo puede gastar mas computo por token sin aumentar el numero de parametros.

El modelo resuelve un problema concreto de eficiencia: ofrecer razonamiento de proposito general en una huella pequena y con un unico checkpoint capaz de servir distintos presupuestos de computo de inferencia. Cambiando el numero de veces que se aplica el bloque recurrente (1, 2 o 4 bucles) se intercambia computo por precision sin reentrenar ni cambiar de modelo. Ademas, emplea last-loop KV caching, lo que evita que la memoria de la cache KV crezca con cada bucle adicional. Se distribuye bajo licencia OpenMDW 1.1, soporta hasta 256K tokens de contexto y esta pensado inicialmente para ingles.

Su relevancia actual reside en dos frentes: por un lado, el preentrenamiento nativo en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, seguido de un ajuste posterior en BF16; por otro, la disponibilidad en multiples formatos (BF16, MXFP8, NVFP4 y Q5_K_M). La fecha de publicacion indicada es el 16 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT normalizado (nGPT) con bucle latente-recurrente y atencion hibrida (sliding-window attention intercalada con capas de atencion completa) |
| Parametros totales | 3.975.229.440 (~4B) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | BF16 (version del repositorio); el autor declara ademas MXFP8, NVFP4 y Q5_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | safetensors (repo BF16); se declaran tambien formatos MXFP8, NVFP4 y Q5_K_M |

Datos adicionales: fecha de publicacion el 16 de octubre de 2026; ventana de desarrollo del modelo entre julio y septiembre de 2026; fecha de corte de los datos de preentrenamiento en septiembre de 2025 y de los datos de postentrenamiento en mayo de 2026. Tamano del repositorio: 8,0 GB.

## Arquitectura y entrenamiento

Dory1.0-4B emplea una arquitectura de GPT normalizado (nGPT) con bucle. La pila de capas se organiza en tres grupos: un bloque de entrada (Input) de 8 capas, un bloque recurrente (Recurrent) de 20 capas y un bloque de salida (Output) de 8 capas. El bloque recurrente se comparte y se aplica varias veces entre la entrada y la salida, y la entrada se reinyecta en cada iteracion del bucle. Este diseno permite aumentar el computo por token sin incrementar el numero de parametros, lo que el autor describe como "escalar la inteligencia" del modelo. La atencion es hibrida, alternando capas de sliding-window attention con capas de atencion completa.

El entrenamiento combina un preentrenamiento nativo en NVFP4, el formato de 4 bits de NVIDIA, sobre el backbone nGPT, seguido de una continuacion en BF16. El postentrenamiento se apoya en los conjuntos de datos nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3; no se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se emplearon tecnicas concretas de RLHF o DPO. Entre las innovaciones destacadas figuran: computo de inferencia elastico (un mismo checkpoint sirve para distintos presupuestos de computo), eficiencia de tokens (el computo extra se dedica a razonar en espacio latente en lugar de alargar la salida) y last-loop KV caching, que mantiene una unica cache por capa de atencion recurrente y elimina la sobrecarga de memoria asociada a los bucles adicionales.

## Capacidades

- Generacion de texto conversacional (el modelo esta etiquetado como "conversational" y "text-generation").
- Razonamiento de proposito general en una huella reducida de ~4B parametros.
- Codigo: evaluado en SciCode y SWE-bench Verified, con mejora sustancial al aumentar el numero de bucles.
- Tareas agenticas basadas en terminal: evaluado en Terminal-Bench 2.1.
- Tareas agenticas de dominio financiero: evaluado en τ³-bench (Banking).
- Computo de inferencia ajustable: 1, 2 o 4 bucles sobre el mismo checkpoint, sin reentrenamiento.
- Eficiencia de tokens: el autor afirma que necesita menos tokens generados para resolver una tarea.
- Rendimiento multilingue: solo ingles declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento general de bajo coste: desplegar la variante de 1 bucle para tareas sencillas y subir a 2 o 4 bucles en las que exijan mas precision, reutilizando el mismo checkpoint y sin reentrenar, gracias al computo de inferencia elastico.
- Automatizacion de tareas de agente en terminal: el modelo se evalua en Terminal-Bench 2.1, por lo que resulta adecuado para agentes que ejecutan comandos y manipulan sistemas de archivos paso a paso.
- Reparacion automatica de errores en repositorios: con SWE-bench Verified como referencia (hasta 61,8 con 4 bucles), encaja en flujos que reciben un issue y generan un parche sobre el codigo.
- Generacion de codigo cientifico y numerico: los resultados en SciCode (hasta 35,11 con 4 bucles) lo hacen util para pipelines de calculo tecnico y prototipado cientifico.
- Atencion al cliente automatizada: con hasta 256K tokens de contexto, puede gestionar conversaciones multi-turno con historiales extensos y documentacion adjunta, manteniendo un coste de memoria de cache KV estable gracias al last-loop KV caching.
- Asistentes de analisis financiero y back-office: su evaluacion en τ³-bench (Banking) apunta a escenarios de consulta y tramitacion sobre datos financieros.
- Despliegue en hardware de gama media: al cuantizarse en NVFP4 o Q5_K_M, permite servir razonamiento y codigo en GPUs de consumo o en perifericos, sin necesidad de clústeres de altas prestaciones.
- Procesamiento por lotes de documentos largos en ingles: la ventana de 256K tokens facilita el resumen o la extraccion sobre contratos, informes o expedientes extensos.

## Benchmarks y rendimiento

La model card publica una tabla comparativa con varias columnas segun el numero de bucles y con modelos de referencia. Los datos disponibles en la informacion proporcionada son los siguientes (la tabla original aparece truncada; los valores no incluidos se indican como "no disponible"). El simbolo † indica puntuaciones reportadas por terceros.

| Tarea | Dory 1 bucle | Dory 2 bucles | Dory 4 bucles | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | no disponible | no disponible |

El patron general es coherente: el rendimiento mejora al aumentar el numero de bucles, con la mayor ganancia entre 1 y 2 bucles y una mejora mas moderada al pasar a 4. No se han publicado en la informacion disponible resultados de benchmarks adicionales como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

Nota: las cifras de VRAM que figuran a continuacion son estimaciones derivadas del numero de parametros y del formato declarado; no estan publicadas en la informacion disponible y deben validarse en cada despliegue.

- BF16 (version del repositorio, 8,0 GB de pesos): se estima un consumo de VRAM en torno a 8-10 GB solo para pesos, mas la cache KV correspondiente al contexto utilizado.
- NVFP4 o MXFP8: formato de 4 y 8 bits respectivamente; se estima en torno a 2-4 GB de pesos, lo que permite ejecucion en GPUs de consumo.
- Q5_K_M (presumiblemente GGUF): se estima en torno a 3-4 GB de pesos, adecuado para inferencia en CPU o GPU de gama media.
- Cache KV: el autor indica que, con last-loop KV caching, el modelo no anade sobrecarga de cache KV respecto a un modelo equivalente sin bucle, con independencia del numero de iteraciones.
- GPUs recomendadas (estimacion): RTX 3060 12 GB, RTX 4070, RTX 4090 o L40S para las variantes cuantizadas y BF16; A100 40 GB o H100 para despliegues de mayor concurrencia o contextos de 256K.
- Cabe en GPU de consumo: si, previsiblemente, en formatos NVFP4, MXFP8 y Q5_K_M; la variante BF16 requiere al menos 12-16 GB de VRAM.
- Opciones de despliegue: la libreria declarada es transformers, por lo que ese es el soporte confirmado. Para Q5_K_M es de esperar compatibilidad con llama.cpp; para NVFP4 y MXFP8, con el ecosistema NVIDIA (TensorRT-LLM). El soporte en vLLM, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultados destacados (Benchmarks) |
|---|---|---|---|---|
| Dory1.0-4B | ~4B (no MoE, con bucle) | Hasta 256K | OpenMDW 1.1 | SWE-bench Verified 61,8 (4 bucles); SciCode 35,11; Terminal-Bench 22,2 |
| Qwen3.5-4B | 4B (aproximado, segun denominacion) | No disponible | No disponible | SWE-bench Verified 54,7; SciCode 25,82; Terminal-Bench 15 |
| Qwen3.5-9B | 9B (aproximado, segun denominacion) | No disponible | No disponible | SWE-bench Verified 61; SciCode 28,21; Terminal-Bench 24 |
| Gemma 4 26B A4B | 26B totales / 4B activos (MoE, segun denominacion) | No disponible | No disponible | SWE-bench Verified 57,40; SciCode 40,32; Terminal-Bench 35 |
| Qwen3.6-35B-A3B | 35B totales / 3B activos (MoE, segun denominacion) | No disponible | No disponible | SWE-bench Verified 73,4†; SciCode 37,24; Terminal-Bench 43 |

Dory1.0-4B compite directamente con Qwen3.5-4B en la franja de 4B: con 4 bucles supera a Qwen3.5-4B en SWE-bench Verified (61,8 frente a 54,7), SciCode (35,11 frente a 25,82) y Terminal-Bench 2.1 (22,2 frente a 15). Frente a modelos mas grandes como Qwen3.5-9B, Gemma 4 26B A4B o Qwen3.6-35B-A3B, queda por detras en SciCode y Terminal-Bench, aunque se acerca en SWE-bench Verified. Su ventaja diferencial no es el pico de rendimiento, sino la relacion entre tamano (4B), contexto (256K) y flexibilidad de computo en inferencia.

## Limitaciones y advertencias

- Idioma: soporte declarado unicamente para ingles, lo que limita su uso en castellano u otros idiomas sin validacion previa.
- Alucinacion: como cualquier LLM generativo, puede producir contenido incorrecto o inventado; no se han publicado tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan en la model card evaluaciones de sesgo, toxicidad o equidad.
- Sensibilidad al numero de bucles: el rendimiento varia de forma notable segun se usen 1, 2 o 4 bucles, de modo que la eleccion del presupuesto de computo afecta directamente a la calidad; conviene calibrarla por tarea.
- Estado emergente: el modelo tiene 0 descargas y 10 likes en el momento de la consulta, con lo que la evidencia de uso en produccion es practicamente nula.
- Contexto largo: aunque se declaran hasta 256K tokens, no se aportan resultados especificos de recuperacion en contextos largos (por ejemplo, pruebas tipo needle-in-a-haystack).
- Licencia: se rige por OpenMDW 1.1. El autor indica que el modelo esta listo para uso comercial o no comercial, pero conviene revisar los terminos completos de la licencia antes de integrarlo en un producto.
- Datos de hardware y latencia no publicados: cualquier planificacion de capacidad debe basarse en pruebas propias.
- Formatos: aunque se anuncian NVFP4, MXFP8 y Q5_K_M, la informacion disponible no confirma que todos ellos esten publicados ni la herramienta de despliegue compatible en cada caso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Licencia OpenMDW 1.1 (informacion): https://openmdw.ai/license/1-1/
- Texto completo de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Pagina de desarrolladores de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3

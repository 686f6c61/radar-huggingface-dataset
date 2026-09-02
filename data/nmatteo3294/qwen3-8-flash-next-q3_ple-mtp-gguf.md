# nmatteo3294/Qwen3.8-Flash-Next-Q3_PLE-MTP-GGUF

## Resumen

Qwen3.8-Flash-Next-Q3_PLE-MTP-GGUF es una cuantización experimental y altamente especializada del modelo Qwen3.8-Flash-Next, publicada por el usuario nmatteo3294. El modelo base, desarrollado por Qwen, es un sistema multimodal de arquitectura MoE híbrida (GDN + QSA) con 125 000 millones de parámetros principales, 51 000 millones adicionales dedicados a un sistema de embeddings n-gram (PLE) y un módulo MTP de 4 000 millones para decodificación especulativa. En total, el modelo completo supera los 176 000 millones de parámetros, aunque solo 6 000 millones se activan por token.

Esta derivada GGUF combina un target cuantizado con Q3_PLE (tipo privado GGML 43) de 78,5 GB, dividido en 33 shards, con un sidecar MTP separado de 2,2 GB. El resultado es un paquete de aproximadamente 75 GiB que, según las mediciones del autor, alcanza 31,45 tokens por segundo de decodificación sostenida en una RTX 5070 de 12 GB asistida por 64 GB de RAM del sistema. La relevancia de esta publicación radica en que demuestra la viabilidad de ejecutar un modelo de casi 177 000 millones de parámetros en hardware de consumo mediante cuantización agresiva, decodificación especulativa y gestión de estado persistente para contextos largos.

Sin embargo, es importante señalar que se trata de un experimento de ingeniería inversa: requiere un runtime de llama.cpp parcheado con 36 cambios específicos, no funciona con las versiones estándar y presenta resultados negativos documentados en ciertos escenarios. No es una release oficial de Qwen ni una cuantización convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (GDN + QSA) con embeddings n-gram (PLE) y modulo MTP |
| Parametros totales | 176 943 899 520 |
| Parametros activos | 6 000 000 000 (aprox.) |
| Longitud de contexto | No disponible (probado hasta 229 376 tokens de asignacion) |
| Tipos de cuantizacion | Q3_PLE (tipo privado GGML 43) para el target; DOWNQ4/FC/HC/OUTQ4 para el sidecar MTP |
| Idiomas soportados | No disponibles |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (33 shards + sidecar MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce una arquitectura hibrida que combina atencion GDN (Grouped Dot-product Attention) con QSA (Query-Selective Attention), junto con un sistema de embeddings n-gram de 51 000 millones de parametros que actua como una tabla de consulta adicional. El modulo MTP (Multi-Token Prediction) de 4 000 millones de parametros permite decodificacion especulativa, generando multiples tokens por paso. El entrenamiento del modelo base fue realizado por Qwen con un corpus multimodal, aunque los detalles especificos (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La cuantizacion Q3_PLE sustituye exclusivamente el tensor `per_layer_token_embd.weight` (51,2 mil millones de elementos) por un formato privado de 32 valores con escala BF16 y 12 bytes de codigo empaquetado, reduciendo su peso de 22,4 GB a un payload de 22 400 107 520 bytes. Los otros 1 223 tensores del modelo permanecen identicos a la fuente inmediata (AtomicChat/Qwen3.8-Flash-Next-GGUF). El sidecar MTP utiliza una cuantizacion selectiva con capas FC/HC corregidas y salida cuantizada. No se aplico ningun entrenamiento adicional; es una conversion puramente de cuantizacion.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas complejas de lenguaje, aunque la cuantizacion Q3_PLE puede degradar la calidad en comparacion con el modelo original.
- Codigo y matematicas: el modelo base soporta estas tareas, pero no hay evaluaciones especificas de la version cuantizada.
- Multimodal: el modelo base es multimodal (vision y texto), pero la cuantizacion no garantiza que las capacidades de vision se conserven correctamente.
- Decodificacion especulativa con MTP: el sidecar MTP permite generar multiples tokens por paso, con una tasa de aceptacion de 10 de 11 borradores en las pruebas documentadas.
- Contexto largo: se ha probado la construccion y restauracion de un estado de chat de 59 750 tokens sin reproducir prefijos anteriores, utilizando persistencia de estado pareado.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no confirmado en la informacion disponible.

## Casos de uso

- Inferencia local en hardware de consumo: el modelo puede ejecutarse en una GPU de 12 GB con 64 GB de RAM del sistema, alcanzando 31,45 tok/s con contexto de 16K. Es adecuado para desarrolladores que necesitan un modelo de gran tamano sin acceso a GPUs profesionales.
- Experimentacion con decodificacion especulativa: el sidecar MTP permite estudiar el impacto de la prediccion multi-token en modelos cuantizados, con datos medidos de aceptacion de borradores y rendimiento.
- Procesamiento de contextos largos con estado persistente: la capacidad de guardar y restaurar estados de chat de hasta 59 750 tokens sin reproducir prefijos es util para aplicaciones de analisis de documentos extensos o conversaciones prolongadas.
- Desarrollo de aplicaciones de chat con restricciones de VRAM: al requerir solo 776 MiB de VRAM en el peor caso (con mucha RAM disponible), puede integrarse en entornos con GPUs modestas.
- Investigacion sobre cuantizacion extrema: el formato Q3_PLE y su integracion con MTP son un caso de estudio para tecnicas de compresion de modelos MoE.
- Pruebas de rendimiento en hardware heterogeneo: las mediciones documentadas (31,45 tok/s en RTX 5070, 18,25 tok/s a 59 750 tokens) sirven como referencia para optimizaciones similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona mediciones propias de rendimiento:

| Escenario | Velocidad (tok/s) | Notas |
|---|---|---|
| Contexto 16K, prompt 232 tokens, completion 171 | 31,45 media | Dos ejecuciones: 31,50 y 31,40; 129/129 borradores aceptados |
| Contexto 65K, prompt 232 | 26,45 | Asignacion, no contexto lleno |
| Contexto 81K, prompt 232 | 25,81 | Asignacion |
| Contexto 131K, prompt 232 | 27,41 | Asignacion |
| Contexto 196K, prompt 232 | 26,65 | Asignacion |
| Contexto 229K, prompt 232 | 26,89 | Asignacion |
| Estado 59 750 tokens, target-only | 18,25 | Recuperacion con 3 repeticiones |
| Estado 59 750 tokens, con MTP | 18,34 | MTP acepto 10 de 11 borradores |

Resultados negativos documentados: a 59 750 tokens, la generacion de codigo con MTP mostro 22,30 tok/s pero fallo en la paridad exacta del texto; la generacion de prosa devolvio 90 palabras cuando se solicitaron 170-210.

## Requisitos de hardware

- GPU probada: NVIDIA RTX 5070 de 12 GB (SM120a, CUDA 13.1).
- RAM del sistema: 64 GB DDR4-3000 (minimo recomendado; el pico de RSS fue de ~37 GB).
- VRAM minima: 776 MiB en el peor caso con contexto 16K; 2 113 MiB para el estado de 59 750 tokens.
- Almacenamiento: NVMe recomendado por el uso intensivo de mmap.
- No es posible ejecutar solo con VRAM; se requiere memoria del sistema para los shards.
- Runtime: llama.cpp parcheado con la serie de 36 parches desde `cafe-035e227` a `73b803` (repositorio de reproduccion).
- Opciones de despliegue: solo con el runtime parcheado; no compatible con vLLM, Ollama o TGI estandar.
- Latencia: 31,45 tok/s de media en el escenario controlado; la latencia por token es de aproximadamente 31,8 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176,9B totales, 6B activos | No disponible | qwen-community-1.0 | safetensors | Modelo original de Qwen |
| AtomicChat/Qwen3.8-Flash-Next-GGUF | 176,9B | No disponible | qwen-community-1.0 | GGUF | Fuente inmediata de la cuantizacion, sin Q3_PLE |
| nmatteo3294/Qwen3.8-Flash-Next-Q3_PLE-MTP-GGUF | 176,9B | No disponible | qwen-community-1.0 | GGUF (Q3_PLE + MTP) | Esta release, requiere runtime parcheado |

No se dispone de datos de rendimiento comparativos con otras cuantizaciones del mismo modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un runtime de llama.cpp parcheado con 36 cambios especificos; las versiones estandar no pueden cargar el tipo Q3_PLE ni reproducir el comportamiento del sidecar MTP.
- La cuantizacion Q3_PLE es un formato privado (GGML tipo 43) que no es portable a otras herramientas.
- El MTP no siempre mejora el rendimiento: en las pruebas de codigo a 59 750 tokens, la velocidad aumento un 22,9% pero la paridad exacta del texto fallo en todas las repeticiones.
- La generacion de prosa mostro una longitud significativamente inferior a la solicitada (90 palabras frente a 170-210), lo que sugiere una posible degradacion en la adherencia a instrucciones.
- El margen de VRAM es extremadamente ajustado (776 MiB en el peor caso), lo que hace que el sistema sea sensible a otras cargas de GPU.
- La licencia qwen-community-1.0 debe revisarse para uso comercial; no se especifican restricciones adicionales en la model card.
- No hay garantias de calidad de generacion: la cuantizacion agresiva puede aumentar la tasa de alucinacion y degradar el razonamiento.
- El autor recomienda desactivar el MTP para tareas sensibles a la correccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nmatteo3294/Qwen3.8-Flash-Next-Q3_PLE-MTP-GGUF
- Repositorio de reproduccion (parches, perfiles, tests): https://github.com/nickmatteo/Qwen38-FlashNext-Q3PLE-MTP
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Fuente inmediata de cuantizacion: https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF
- Analisis del modelo base (Kaitchup): https://kaitchup.substack.com/p/qwen38-flash-next-review-benchmarks

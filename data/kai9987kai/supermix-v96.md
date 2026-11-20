# Kai9987kai/supermix-v96

## Resumen

Supermix v96 es un modelo de lenguaje de tipo transformer con mezcla de expertos (MoE) publicado por el usuario Kai9987kai en Hugging Face. Se presenta como la "linea base por defecto promovida" de una supuesta estirpe de modelos denominada Cognitive Fabric, que abarca las versiones v91 a v103. El modelo base declarado es Kai9987kai/supermix-v93, sobre el que se aplica un ajuste fino. Con 36,6 millones de parametros totales y 9,1 millones activos por token, se trata de un modelo de escala muy reducida, orientado a experimentacion y no a produccion general.

La propuesta tecnica del autor es inusual: incorpora mecanismos inspirados en el conectoma de la mosca de la fruta (Drosophila), con compartimentos de membrana duales, compuertas comisurales, homeostasis glial y neurogenesis transaccional. Ademas, declara capacidades de verificacion formal y razonamiento neuro-simbolico. Estos elementos no corresponden a arquitecturas estandar y no hay evidencia independiente que los valide.

El modelo es relevante unicamente como curiosidad de investigacion o como ejemplo de arquitectura experimental. No dispone de descargas, no publica idiomas soportados y su model card mezcla afirmaciones de rendimiento con mecanismos no verificables. Cualquier evaluacion seria debe tratar sus resultados como no confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mecanismos de "conectoma" inspirados en Drosophila (6 capas, top-2 de 64+8 expertos enrutados, 2 profundidades de borrador especulativo MTP) |
| Parametros totales | 36.597.383 |
| Parametros activos | 9.130.487 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`v96_physio_neurogenesis.selected.pt`) |
| Vocabulario | 9.415 tokens |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer MoE de 6 capas con enrutamiento top-2 sobre 64 expertos mas 8 adicionales, y un vocabulario de 9.415 tokens. Incorpora dos profundidades de decodificacion especulativa multipaso (MTP), lo que en teoria permite generar varios tokens por paso de verificacion. Sobre esta base, el autor anade un conjunto de mecanismos bautizados como conectoma bilateral de sistema nervioso central masculino, con 832 ranuras (768 activas y 64 de reserva): compartimentos de membrana duales lento/rapido, compuertas comisurales dependientes de contexto, homeostasis glial basada en media movil exponencial de la tasa de disparo, dropout de tronco del 25 por ciento y homeostasis de radio espectral con objetivo 0,90.

Tambien se menciona neurogenesis transaccional con verificacion de testigos, que incluye operaciones como `split_module`, `grow_edge`, `open_tap` y `birth_expert`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. No hay informacion sobre la procedencia de los datos ni sobre el proceso de alineacion. La mayor parte de estas innovaciones no cuenta con publicacion revisada ni reproduccion independiente.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Razonamiento neuro-simbolico, segun las etiquetas del autor, sin evidencia publica que lo respalde.
- Verificacion formal, declarada en las etiquetas, sin documentacion tecnica disponible.
- Decodificacion especulativa multipaso (MTP) con dos profundidades de borrador.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Experimentacion con arquitecturas MoE de escala reducida: el modelo cabe en el repositorio de 0,2 GB y puede cargarse en CPU, lo que permite estudiar el enrutamiento top-2 y la decodificacion especulativa en un entorno controlado.
- Investigacion sobre mecanismos bioinspirados: los compartimentos duales, la homeostasis glial y la neurogenesis transaccional pueden servir como banco de pruebas para quienes estudian redes neuronales con dinamica de criticalidad.
- Docencia sobre mezcla de expertos: con 36,6 millones de parametros totales y 9,1 millones activos, es viable ejecutarlo en un portatil para ilustrar el funcionamiento de un MoE.
- Pruebas de integracion de servidores de chat: el autor incluye `supermix_chat_server.py` con un servidor Flask en el puerto 8780, util para validar pipelines de inferencia ligeros.
- Evaluacion de robustez de decodificacion especulativa: las dos profundidades MTP permiten comparar la calidad de los borradores frente a la verificacion.
- Reproduccion de los benchmarks declarados: los ficheros `results/eval_v96_selected_*.json` permiten intentar replicar las cifras de 180/205 tareas, aunque el autor no detalla el conjunto de tareas.
- Prototipado de verificacion formal en texto: si las etiquetas fueran precisas, podria usarse para explorar la generacion de aserciones verificables, siempre con validacion externa.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, medidos en CPU con Windows y `max_new_tokens=96`. No hay verificacion independiente.

| Suite de evaluacion | Resultado | Origen |
|---|---|---|
| Escalera de generalizacion (v58) | `dev_loss = 0,086137` (tier1 = 0,0683, tier3 = 0,0947, 5/5 PASS) | `results/generalisation_results.json` |
| Neural standalone, seed=82 (41 tareas) | 35/41 (0,8537) | `results/eval_v96_selected_seed82.json` |
| Neural standalone, seed=83 (82 tareas) | 72/82 (0,8780) | `results/eval_v96_selected_n82_seed83.json` |
| Neural standalone, seed=84 (82 tareas) | 73/82 (0,8902) | `results/eval_v96_selected_n82_seed84.json` |
| Combinado 3 semillas (205 tareas) | 180/205 (87,8%) | Promocion como linea base por defecto |
| SCF Hybrid (`scf bench --seed 82 --neural`) | 41/41 (1,0000) | Verificacion determinista y atlas de conectoma |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. Las cifras anteriores corresponden a suites internas del autor cuyo contenido no se describe.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (36,6 millones de parametros, aproximadamente 146 MB en fp32); en fp16 alrededor de 73 MB. El repositorio ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien funciona en CPU, como indican los propios benchmarks del autor.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo, servidor Flask incluido (`supermix_chat_server.py`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se ofrece ese formato.
- Latencia y throughput estimados: no disponibles. El autor solo reporta ejecucion en CPU con Windows y `max_new_tokens=96`, sin cifras de latencia.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion disponible, dado que la arquitectura declarada (conectoma, neurogenesis, verificacion formal) no tiene equivalentes publicos conocidos. Como referencia de escala, se incluyen alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Supermix v96 | 36,6 M totales / 9,1 M activos | no disponible | MIT | Hugging Face, 0 descargas |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 tokens | Apache 2.0 | Ampliamente disponible |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Ampliamente disponible |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | Ampliamente disponible |

La comparacion de rendimiento no es posible porque Supermix v96 no publica resultados en benchmarks estandar y los modelos de referencia si los tienen. La diferencia de escala (36,6 M frente a 124 M o 1,1 B) hace que cualquier comparacion directa sea desfavorable en capacidad general.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset ni el proceso de alineacion, por lo que no se pueden evaluar sesgos.
- Riesgo de alucinacion: alto en un modelo de 36,6 millones de parametros con vocabulario de 9.415 tokens; la cobertura linguistica y factual sera muy limitada.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas soportados. El vocabulario reducido sugiere un soporte linguistico muy restringido.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion. No obstante, el autor no ofrece garantias sobre el origen de los datos de entrenamiento.
- Caveat de produccion: las afirmaciones sobre conectoma, neurogenesis y verificacion formal no estan respaldadas por publicaciones revisadas ni por reproduccion independiente. Los benchmarks son internos y no verificables.
- Caveat de mantenimiento: el modelo tiene 0 descargas y 1 like, lo que indica ausencia de validacion por parte de la comunidad.
- Caveat de formato: solo se distribuyen pesos PyTorch (`.pt`), sin versiones GGUF, safetensors ni cuantizaciones listas para usar.
- Caveat de fecha: la model card esta fechada en noviembre de 2026, lo que puede indicar metadatos inconsistentes o un repositorio de caracter experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v96
- Modelo base: https://huggingface.co/Kai9987kai/supermix-v93
- Repositorio del autor en GitHub: https://github.com/kai9987kai/Supermix
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.

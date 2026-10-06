# d9beuD/Qwen3.8-Flash-Next-oQ2.7-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2.7-mtp es una cuantización en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. El modelo base es un Mixture of Experts (MoE) multilingüe de texto e imagen que combina una arquitectura híbrida Gated DeltaNet + Gated Attention y que sirve como avance de la arquitectura Qwen4. El checkpoint completo suma unos 180.000 millones de parámetros repartidos entre un modelo principal de 125B parámetros, una tabla adicional de N-gram embeddings de 51B y una cabeza MTP (multi-token prediction) de 4B, con unos 6B parámetros activados por token.

El problema que resuelve esta ficha concreta es el de permitir ejecutar un modelo de ese tamaño en hardware de consumo Apple Silicon, mediante una receta de cuantización mixta de precisión (oQ nivel 2.7) que reduce el peso de 74 GB con un tamaño efectivo de aproximadamente 3,29 bits por peso. La cuantización se ha realizado con oMLX v0.7.0 y conserva tanto la cabeza MTP como el codificador de visión y la tabla de N-gram embeddings, lo que preserva las capacidades multimodales y la decodificación multi-token del modelo original.

Es relevante ahora porque los modelos MoE multimodales de gran tamaño con contexto muy largo (262K tokens en este caso) se han vuelto viables en equipos locales, y las recetas de cuantización agresivas (2-3 bits) son la vía práctica para reducir el requisito de memoria unificada por debajo de los 96 GB. La licencia heredada es la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida Gated DeltaNet + Gated Attention (arquitectura Qwen4), con cabeza MTP y tabla de N-gram embeddings |
| Parametros totales | 179.999.981.459 (~180B): ~125B modelo principal + ~51B N-gram embeddings + ~4B cabeza MTP |
| Parametros activos | ~6B por token |
| Longitud de contexto | 262.144 tokens (262K), segun la documentacion del modelo base |
| Tipos de cuantizacion | MLX oQ mixta de precision, nivel 2.7; 2 bits por defecto; group size 64 (algunos modulos 32 o 128); ~3,29 bits efectivos por peso |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | MLX safetensors (pesos no cuantizados, escalas y sesgos en bfloat16) |

## Arquitectura y entrenamiento

Esta publicacion no entrena un modelo desde cero: es una cuantizacion del checkpoint Qwen/Qwen3.8-Flash-Next realizada con oQ (oMLX v0.7.0), un esquema de cuantizacion mixta de precision en el que cada capa o modulo recibe una anchura de bits distinta en funcion de su sensibilidad. La distribucion real de parametros cuantizados es la siguiente: 8 bits en el 2,5 %, 5 bits en el 0,3 %, 4 bits en el 1,4 %, 3 bits en el 43,0 % y 2 bits en el 52,8 %. El resultado son 74 GB de pesos con un coste medio de unos 3,29 bits por peso, manteniendo en bfloat16 los pesos no cuantizados, las escalas y los sesgos.

El modelo base sobre el que se aplica la cuantizacion es un MoE multimodal de la serie Qwen3.8 construido sobre la arquitectura Qwen4, con un diseno hibrido que mezcla Gated DeltaNet (atencion lineal) y Gated Attention, y que incorpora una cabeza de multi-token prediction (MTP) con `mtp_num_hidden_layers: 1`, un codificador de vision y una tabla de N-gram embeddings de 51B parametros. La cuantizacion conserva explicitamente la cabeza MTP, el encoder de vision y la tabla de N-gram embeddings. El mapa de sensibilidad por capas de oQ se midio sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp (128 muestras x 256 tokens, conjunto de calibracion `code_multilingual`) en lugar del checkpoint bf16 completo, porque este ultimo no cabe en memoria en un Mac de 128 GB. No se dispone de datos sobre el numero de tokens de entrenamiento del modelo base ni sobre su composicion de dataset en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de tipo base, en un pipeline declarado como image-text-to-text.
- Entrada multimodal: procesa imagenes junto con texto mediante el codificador de vision incluido en el checkpoint.
- Razonamiento avanzado segun la documentacion del modelo base (serie Qwen3.8).
- Generacion de codigo, con enfasis declarado por el autor del modelo base en tareas de programacion.
- Decodificacion multi-token mediante la cabeza MTP conservada, orientada a acelerar la generacion.
- Tabla de N-gram embeddings incluida, que anade capacidad de recuperacion de patrones lexicos y puede emplearse en esquemas de decodificacion asistida.
- Ventana de contexto larga de hasta 262K tokens segun el modelo base.
- Capacidades multilingues: probablemente presentes en el modelo base, pero no documentadas en la informacion disponible para esta ficha.
- Soporte de tool calling / function calling y de agentes multi-paso: no documentado explicitamente en la informacion disponible para este modelo.

## Casos de uso

- Razonamiento multimodal en local: el modelo acepta imagenes y texto y puede ejecutarse en un Mac con memoria unificada suficiente, lo que permite analizar capturas, diagramas o documentos escaneados sin enviar datos a la nube.
- Asistencia de codigo en un equipo de desarrollo: dado el enfasis del modelo base en generacion de codigo y su contexto de 262K tokens, se puede usar para revisar repositorios completos o ficheros de gran tamano en una sola pasada.
- Procesamiento de documentos largos: con 262K tokens de contexto, es adecuado para resumir, extraer datos estructurados o responder preguntas sobre informes extensos, contratos o libros tecnicos.
- Investigacion en tecnicas de cuantizacion: sirve como referencia practica para estudiar el impacto de una receta mixta de 2-3 bits sobre un MoE multimodal de ~180B parametros y comparar con recetas de 4 bits.
- Prototipado de agentes con decodificacion acelerada: la cabeza MTP conservada permite experimentar con esquemas de generacion multi-token en pipelines de agentes, siempre que la infraestructura MLX lo soporte.
- Inferencia privada en estaciones de trabajo Apple Silicon: al ejecutarse con MLX sin GPU dedicada, encaja en entornos con requisitos de confidencialidad donde no se permite uso de APIs de terceros.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad entre un checkpoint bf16, una version de 4 bits y esta version de ~3,29 bits efectivos sobre las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del modelo base y las guias de terceros afirman cualitativamente que Qwen3.8-Flash-Next supera a otros modelos de referencia en tareas de codigo, pero no se proporciona ninguna tabla con valores numericos (MMLU, HumanEval, GSM8K u otros) para este modelo ni para su checkpoint base. No se deben asumir cifras concretas.

## Requisitos de hardware

- Memoria unificada: aproximadamente 74 GB solo para los pesos. Se necesita un Mac con mas memoria unificada que esa cifra; el autor sugiere al menos 96 GB como ejemplo practico.
- Guias de terceros mencionan que el modelo base puede ejecutarse con 75 GB de RAM o memoria unificada, sin necesidad de VRAM de GPU dedicada.
- Compatibilidad con GPU NVIDIA/AMD: no aplicable a este repositorio, ya que el formato es MLX safetensors y la libreria declarada es MLX. Requiere Apple Silicon.
- Despliegue: mlx-lm y el ecosistema oMLX (oQ) son las opciones coherentes con el formato. Para CUDA se usarian otras cuantizaciones (por ejemplo GGUF o pesos bf16) del modelo base, no este repositorio.
- Latencia y throughput: no disponible. Dependera del chip Apple (M-series), de la memoria disponible y del soporte efectivo de la cabeza MTP en el runtime.
- Almacenamiento: el repositorio ocupa 74,1 GB, por lo que se recomienda disco rapido (SSD NVMe) y margen libre adicional para cache y offload.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ2.7-mtp | ~180B totales, ~6B activos | 262K | MLX oQ 2.7 (~3,29 bits/peso), 74 GB | qwen-community-1.0 | Repo MLX en HuggingFace (0 descargas, 0 likes al crear la ficha) |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B totales, ~6B activos | 262K | bf16 sin cuantizar | qwen-community-1.0 | Repo oficial en HuggingFace |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | ~180B totales, ~6B activos | 262K | MLX oQ 4-bit, mayor precision que esta version | qwen-community-1.0 | Repo MLX en HuggingFace; usado para calibrar este modelo |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Referencia citada por el autor del modelo base como punto de comparacion previo |

No se dispone de resultados de rendimiento cuantitativos para ninguna de estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- La cuantizacion a 2-3 bits introduce perdida de calidad respecto al checkpoint bf16 y a las versiones de 4 bits. Mas de la mitad de los parametros estan a 2 bits, lo que puede degradar tareas sensibles a la precision como matematicas o razonamiento de varios pasos.
- El mapa de sensibilidad se midio sobre una cuantizacion intermedia (oQ4e) y no sobre el modelo bf16 completo, por lo que la asignacion de bits hereda el sesgo del conjunto de calibracion `code_multilingual` (128 muestras x 256 tokens); el rendimiento puede ser peor en dominios alejados del codigo.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para esta version cuantizada.
- Idiomas soportados: no disponible. No se documenta el soporte multilingue concreto del checkpoint ni como afecta la cuantizacion a idiomas distintos del ingles.
- Contexto: aunque el modelo base declara 262K tokens, no se documenta el rendimiento real a esa longitud tras la cuantizacion, y los contextos muy largos suelen degradar la precision.
- Licencia: Qwen Community License 1.0. Es una licencia "other" con condiciones especificas; conviene revisar el fichero LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones de atribucion o de uso.
- Formato propietario de plataforma: al ser MLX safetensors, el modelo solo es utilizable en Apple Silicon; no sirve para despliegues en CUDA sin reconvertir.
- Traccion practica nula: el repositorio registra 0 descargas y 0 likes, lo que reduce la probabilidad de encontrar soporte, issues resueltos o validaciones independientes.
- Fecha de publicacion en 2026 y dependencia de un modelo base de la serie Qwen3.8: parte de los datos de arquitectura proceden de documentacion de terceros y no de la model card del propio repositorio, por lo que deben verificarse contra la fuente oficial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ2.7-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de Unsloth para ejecutar Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Guia de Atomic Chat sobre ejecucion local, GGUF y hardware: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Pagina de OpenLM.ai sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Cuantizacion usada para el mapa de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp

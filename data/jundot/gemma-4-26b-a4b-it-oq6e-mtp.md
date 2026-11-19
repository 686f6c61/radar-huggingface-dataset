# Jundot/gemma-4-26B-A4B-it-oQ6e-mtp

## Resumen

Jundot/gemma-4-26B-A4B-it-oQ6e-mtp es una cuantizacion mixta de precision del modelo google/gemma-4-26B-A4B-it, el modelo de mezcla de expertos (MoE) de la familia Gemma 4 de Google DeepMind. El checkpoint resultante conserva el backbone de lenguaje, el codificador de vision y una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-26B-A4B-it-assistant, todo empaquetado en formato MLX para ejecucion en hardware Apple Silicon.

El modelo original cuenta con 25.2B parametros totales y 3.8B activos, admite entrada de texto e imagen, ofrece modos de razonamiento configurables y una ventana de contexto de 256K tokens. Esta version cuantizada mantiene esas capacidades con un peso efectivo medio de 6.988 bits por parametro en el checkpoint completo (6.635 bits/parametro en el backbone de lenguaje), lo que reduce el almacenamiento a 21.336 GiB sin cambiar la arquitectura.

La relevancia de esta ficha radica en que permite desplegar un MoE multimodal de 26B en equipos con memoria unificada limitada, manteniendo tool calling, vision y contexto largo. Es una opcion practica para desarrolladores que trabajan en el ecosistema MLX y necesitan un modelo de gama alta sin recurrir a GPUs dedicadas de gran VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer multimodal con codificador de vision y cabeza MTP |
| Parametros totales | 26.225.647.442 (26.226B) |
| Parametros activos | 3.8B (segun model card del modelo base) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (89.897% de pesos), affine 8-bit grupo 64 (6.287%), BF16 (3.816%); media efectiva 6.988 bits/parametro |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a Gemma 4 license) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de la familia Gemma 4, con 25.2B parametros totales y 3.8B activos por token, lo que permite un coste de inferencia cercano al de un modelo denso de menos de 4B pese a la capacidad total. Incorpora un codificador de vision de 0.573B parametros para entrada image-text-to-text y una cabeza de prediccion multi-token (MTP) de 0.420B parametros que acelera la decodificacion especulativa al predecir varios tokens por paso.

Esta version concreta no ha sido reentrenada: es una cuantizacion post-entrenamiento realizada con oQ (oMLX v0.8.0), que asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y aplica un reajuste ponderado por minimos cuadrados de escala y sesgo. La distribucion resultante concentra el 89.897% de los pesos en 6 bits, el 6.287% en 8 bits y el 3.816% en BF16, reservando la mayor precision para las capas mas sensibles. El checkpoint se actualizo el 2026-11-19 con un redondeo oQe refinado (PRs #4930 y #5292 de omlx) que reduce el error de cuantizacion al mismo tamano y velocidad.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante el codificador de vision integrado.
- Decodificacion especulativa acelerada por la cabeza MTP fusionada desde el modelo assistant.
- Contexto largo de hasta 256K tokens para documentos extensos y conversaciones multi-turno.
- Capacidades multilingues: no disponible el detalle de idiomas.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes: el contexto de 256K tokens permite procesar informes, contratos o expedientes completos con graficos y tablas en una sola pasada, combinando comprension visual y textual.
- Asistente local en Mac: al estar en formato MLX con 21.336 GiB de pesos, se puede ejecutar en equipos Apple Silicon con memoria unificada suficiente, sin depender de la nube ni de GPUs dedicadas.
- Generacion y revision de codigo asistida por vision: el modelo puede interpretar capturas de pantalla, diagramas de arquitectura o errores en imagenes y producir explicaciones o parches de codigo.
- Investigacion y prototipado de agentes multimodales: la cabeza MTP acelera la generacion iterativa, util en bucles de razonamiento multi-paso donde la latencia por token es critica.
- Atencion al cliente con contexto largo: conversaciones multi-turno con historial extenso e imagenes adjuntas (capturas, fotos de producto) caben en la ventana de 256K tokens.
- Extraccion de informacion estructurada de facturas, formularios o capturas: el pipeline image-text-to-text permite convertir documentos visuales en JSON u otro formato estructurado.
- Despliegue en entornos con memoria limitada: la cuantizacion mixta reduce el peso a 6.988 bits/parametro de media, lo que hace viable un MoE de 26B en hardware donde un checkpoint BF16 no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 21.336 GiB solo para los pesos en el formato cuantizado; hay que anadir el espacio para la cache KV, que crece con el contexto (hasta 256K tokens) y el estado de activacion del MoE.
- Hardware objetivo: Apple Silicon con memoria unificada (formato MLX); no esta pensado para GPUs CUDA en este formato.
- Cabe en consumer hardware: si, en equipos Apple con memoria unificada igual o superior a los pesos mas margen (por ejemplo, configuraciones de 32 GB o mas, segun contexto y overhead).
- Opciones de despliegue: MLX y oMLX (libreria declarada `mlx`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan indicadas para este checkpoint en la informacion disponible.
- Latencia y throughput: no disponibles; la cabeza MTP esta disenada para acelerar la decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-26B-A4B-it-oQ6e-mtp | 26.226B / 3.8B | 256K | MLX safetensors, 6.988 bits/parametro | Apache-2.0 | Cuantizacion mixta con MTP fusionada, solo Apple Silicon |
| google/gemma-4-26B-A4B-it | 25.2B / 3.8B | 256K | safetensors BF16 | Apache-2.0 | Modelo base sin cuantizar, mayor huella de memoria |
| google/gemma-4-26B-A4B-it-assistant | no disponible | no disponible | no disponible | Apache-2.0 | Modelo assistant del que se extrae la cabeza MTP |

## Limitaciones y advertencias

- La cuantizacion introduce error respecto al modelo BF16 original; aunque oQe lo reduce, no es un checkpoint sin perdida.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable directamente a CUDA sin conversion.
- El contexto de 256K implica un consumo de memoria KV significativo; en equipos con memoria unificada justa puede no ser viable usar la ventana completa.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de este checkpoint cuantizado.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base Gemma 4.
- Idiomas soportados: no disponible; conviene verificar el comportamiento en castellano antes de usarlo en produccion.
- Licencia Apache-2.0 segun la model card, pero remite a la Gemma 4 license de Google; revisar los terminos de uso comercial del modelo base.
- El checkpoint se actualizo el 2026-11-19 con un redondeo refinado; versiones anteriores descargadas deben reemplazarse para obtener la menor tasa de error.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/gemma-4-26B-A4B-it-oQ6e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo assistant (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Repositorio oQ/oMLX: https://github.com/jundot/omlx
- PR de mejora oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

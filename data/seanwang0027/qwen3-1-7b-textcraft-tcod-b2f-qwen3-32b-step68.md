# SeanWang0027/qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step68

## Resumen

`SeanWang0027/qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step68` es un fine-tune de tipo destilación sobre el modelo denso `Qwen/Qwen3-1.7B`, orientado a tareas agénticas del entorno TextCraft. El autor lo describe como un «student» de 1.700 millones de parametros que aprende de un «teacher» `Qwen/Qwen3-32B` en precision bf16, con el modo de razonamiento explicito (thinking) desactivado durante el entrenamiento y la evaluacion. El checkpoint corresponde al paso global 68 de una ejecucion de entrenamiento interna (`textcraft_tcod_b2f`), subido a HuggingFace para liberar espacio local sin modificar los pesos.

El modelo resuelve un problema muy concreto: transferir capacidades de planificacion multi-paso y uso de acciones (tool/action calling) desde un modelo grande a uno pequeno que pueda ejecutarse en hardware modesto. La evaluacion declarada se realiza sobre las 100 tareas oficiales de test de TextCraft, con protocolo avg@4, 30 turnos maximos, temperatura 0,4 y 512 tokens por turno. No se publican resultados numericos en la model card de este checkpoint concreto, solo la descripcion del protocolo y la referencia a los rollouts guardados en `runs/eval/`.

La relevancia actual del modelo es doble. Por un lado, forma parte de una familia de experimentos del mismo autor (variantes `sft`, `opd` y `tcod` sobre la misma base y el mismo teacher) que permiten comparar metodos de destilacion para agentes. Por otro lado, al ser un modelo de ~2.000 millones de parametros con pesos en safetensors y compatibilidad declarada con `text-generation-inference` y endpoints, es un candidato barato para desplegar agentes locales, siempre teniendo en cuenta que no se especifica licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (~2,03 mil millones, segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del fine-tune; el modelo base Qwen3-1.7B declara 32.768 tokens nativos, ampliables con YaRN |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; al derivar de Qwen3-1.7B son aplicables cuantizaciones estandar GGUF/AWQ/GPTQ mediante conversion propia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 4,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Modelo teacher | Qwen/Qwen3-32B (bf16) |
| Modo thinking | desactivado |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-1.7B original: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU y atencion con query-key normalization, sin mezcla de expertos. El autor no modifica la topologia; el checkpoint es un ajuste de pesos sobre el modelo base. El repositorio pesa 4,1 GB, coherente con un modelo de ~2,03 mil millones de parametros en bf16/fp16 mas posibles ficheros auxiliares.

El entrenamiento es una destilacion student-teacher: el student es Qwen3-1.7B y el teacher es Qwen3-32B en bf16, con el modo thinking desactivado. La etiqueta `tcod` (TCOD-B2F) es un acronimo del pipeline del autor que no se define en la model card, por lo que no es posible detallar la funcion de perdida ni el esquema `B2F` a partir de la informacion disponible. El checkpoint subido corresponde a `textcraft_tcod_b2f/global_step_68`, es decir, un punto intermedio (paso 68) de una ejecucion mas larga, no necesariamente el modelo final. El dominio de entrenamiento es TextCraft, un entorno de referencia de tipo crafting en el que el agente debe encadenar acciones sobre recetas para construir objetos.

Como referencia del mismo autor, la variante `qwen3-1.7b-textcraft-sft-qwen3-32b-traj` se entreno con «trajectory SFT» sobre 2.132 episodios de rollouts del teacher Qwen3-32B, aplicando la entropia cruzada unicamente sobre los tokens del teacher. Ese dato describe al modelo hermano, no a este checkpoint, pero sitúa el tipo de pipeline utilizado en la familia.

## Capacidades

- Generacion de texto conversacional en ingles tecnicamente, orientada a interacciones con el entorno TextCraft (no se documentan otros idiomas).
- Razonamiento agéntico multi-paso: el modelo esta entrenado para encadenar acciones durante hasta 30 turnos por episodio en el protocolo de evaluacion declarado.
- Uso de acciones tipo tool calling dentro del entorno TextCraft: seleccion de recetas, obtencion de ingredientes y crafting de objetos intermedios.
- Planificacion a corto y medio plazo sobre un estado parcialmente observable, derivada de la imitacion de trayectorias del teacher Qwen3-32B.
- Modo thinking desactivado de forma explicita: genera respuestas directas sin bloque de razonamiento extendido.
- NO se documentan capacidades de vision, audio, ni multimodalidad.
- NO se documentan capacidades multilingues ni de function calling generico fuera del entorno de entrenamiento.
- NO se documentan capacidades de generacion de codigo o matematicas mas alla de las heredadas del modelo base.

## Casos de uso

- Agentes de planificacion en entornos de crafting o fabricacion simulada: el modelo ejecuta secuencias de acciones sobre un arbol de recetas, lo que lo hace adecuado para prototipos de agentes que deben construir objetos intermedios antes del objetivo final.
- Investigacion en destilacion de trayectorias: al compartir base y teacher con las variantes `sft` y `opd` del mismo autor, permite comparar metodos de destilacion manteniendo constante el resto de variables, comparando checkpoints de distintos pasos (`step66`, `step68`).
- Generacion de rollouts sinteticos: por su tamano reducido, puede producir trayectorias a gran escala y bajo coste para alimentar tecnicas de filtrado, recompensa o RL posterior.
- Despliegue local en estaciones de trabajo sin GPU de datacenter: con ~4,1 GB de pesos en bf16 (y menos con cuantizacion), cabe en GPUs de consumo y permite iterar sin coste de API.
- Evaluacion comparativa de checkpoints intermedios: util para estudiar como evoluciona la tasa de exito en TextCraft a lo largo del entrenamiento y decidir en que paso conviene detenerlo.
- Base para fine-tuning en dominios de planificacion estructurada (logistica, configuracion de productos, asistentes de recetas culinarias): el modelo ya ha aprendido a mapear estado a accion con lenguaje natural.
- Servicio de inferencia ligero detras de una API compatible con endpoints: la etiqueta `endpoints_compatible` y el soporte de `text-generation-inference` permiten exponerlo como microservicio en un contenedor pequeno.
- Docencia y reproduccion de experimentos: sirve como caso de estudio reproducible de destilacion student-teacher con un teacher 19 veces mayor.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks para este checkpoint en la informacion disponible. La model card unicamente describe el protocolo de evaluacion: 100 tareas oficiales de test de TextCraft, avg@4, 30 turnos, temperatura 0,4, 512 tokens por turno y modo thinking desactivado, con los rollouts almacenados en `runs/eval/` del repositorio de entrenamiento del autor.

Como referencia contextual de la familia, la ficha de un modelo hermano (`qwen3-1.7b-textcraft-sft-qwen3-32b-traj`) reporta las siguientes cifras de exito en el split oficial de test de TextCraft. Estos valores no estan verificados de forma independiente y no deben atribuirse a este checkpoint:

| Modelo | Exito en TextCraft (test oficial) | Fuente |
|---|---|---|
| Qwen3-1.7B base | 23,00 % | Ficha del modelo hermano SFT |
| qwen3-1.7b-textcraft-sft-qwen3-32b-traj (SFT) | 72,75 % | Ficha del modelo hermano SFT |
| Qwen3-32B (teacher) | 85,50 % | Ficha del modelo hermano SFT |
| qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step68 (este modelo) | no disponible | Model card sin cifras |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: ~4,1-5 GB solo para pesos; con cache KV para 32.768 tokens (28 capas, atencion GQA) hay que anadir del orden de 3-4 GB adicionales segun precision de cache, por lo que conviene reservar 8-12 GB para contexto largo.
- VRAM estimada con cuantizacion de 8 bits: ~2,5-3 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits: ~1,3-1,8 GB de pesos, manejable en GPUs de 6-8 GB con contexto moderado.
- Cabe en GPU de consumo: si. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan el modelo en bf16 con margen; tarjetas de 6-8 GB requieren cuantizacion.
- GPU de datacenter recomendadas para maxima concurrencia: A100 40/80 GB, H100, L40S. Para una sola peticion son sobredimensionadas.
- Opciones de despliegue: `transformers` (formato nativo), `text-generation-inference` (etiqueta oficial del repo), vLLM, y llama.cpp/Ollama/LM Studio tras convertir los pesos a GGUF. El repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponibles. Como orientacion, un modelo denso de ~2.000 millones de parametros en una RTX 4090 suele generar decenas de tokens por segundo en bf16, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Exito en TextCraft | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step68 (este) | ~2,03 B | no disponible (base: 32.768) | no disponible | no disponible | safetensors en HF, 0 descargas |
| Qwen3-1.7B (base) | ~2,03 B | 32.768 nativos | Apache 2.0 (segun el modelo base) | 23,00 % (reportado por ficha de tercero) | ampliamente disponible |
| qwen3-1.7b-textcraft-sft-qwen3-32b-traj (hermano SFT) | ~2,03 B | no disponible | no disponible | 72,75 % (reportado por ficha de tercero) | safetensors en HF |
| qwen3-1.7b-textcraft-opd-qwen3-32b-step66 (hermano OPD) | ~2,03 B | no disponible | no disponible | no disponible | safetensors en HF |
| Qwen3-32B (teacher) | ~32 B | 32.768 nativos | Apache 2.0 (segun el modelo base) | 85,50 % (reportado por ficha de tercero) | ampliamente disponible |

La comparacion directa con alternativas genericas de ~2 B de parametros (Qwen3-1.7B, Llama 3.2 1B/3B, Gemma 2 2B) no es significativa en tareas de proposito general, porque este checkpoint esta especializado en un unico entorno. No se dispone de datos que permitan comparar su rendimiento fuera de TextCraft.

## Limitaciones y advertencias

- Licencia no especificada: la ausencia de licencia en la model card impide determinar si el uso comercial esta permitido. Antes de cualquier despliegue en produccion hay que contactar con el autor o asumir la licencia del modelo base (Apache 2.0 en Qwen3), lo cual es una interpretacion, no un derecho confirmado.
- Checkpoint intermedio: `global_step_68` sugiere un punto temprano o parcial de la ejecucion de entrenamiento. No se garantiza que sea el mejor checkpoint de la serie ni que el entrenamiento haya finalizado.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento del analisis, sin validacion independiente de los resultados.
- Especializacion estrecha: el ajuste esta centrado en TextCraft. Es esperable una degradacion de capacidades generales (conversacion abierta, codigo, matematicas) respecto al Qwen3-1.7B base, aunque no se aportan mediciones.
- Riesgo de alucinacion de acciones: en entornos agénticos, un modelo destilado de trayectorias puede emitir acciones sintacticamente validas pero semanticamente incorrectas (recetas inexistentes, ingredientes no disponibles), lo que produce bucles o fallos silenciosos.
- Idiomas no documentados: se desconoce el comportamiento fuera del ingles tecnico del entorno de entrenamiento.
- Thinking desactivado: no puede activarse razonamiento extendido sin reentrenamiento o cambios de plantilla; si el pipeline de evaluacion espera etiquetas de pensamiento, hay que ajustar la plantilla de chat.
- Contexto no documentado en la ficha: aunque el modelo base soporta 32.768 tokens, el fine-tune no declara haber sido entrenado con secuencias de esa longitud, por lo que el contexto efectivo puede ser menor.
- Fecha de creacion inusual (2026-09-24 en los metadatos): conviene verificar la procedencia del repositorio antes de integrarlo en un pipeline.
- Sin ficheros GGUF publicados: para desplegar en CPU o en GPUs pequenas hay que realizar la conversion a llama.cpp por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-tcod-b2f-qwen3-32b-step68
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo hermano SFT (referencia de metricas): https://featherless.ai/models/SeanWang0027/qwen3-1.7b-textcraft-sft-qwen3-32b-traj
- Modelo hermano OPD step66: https://huggingface.co/SeanWang0027/qwen3-1.7b-textcraft-opd-qwen3-32b-step66
- Modelo hermano OPD step33 (registro de terceros): https://free2aitools.com/model/seanwang0027/qwen3-1.7b-textcraft-opd-qwen3-32b-step33
- Repositorio espejo de Qwen3-1.7B en GitHub: https://github.com/spawnspp/Qwen3-1.7B

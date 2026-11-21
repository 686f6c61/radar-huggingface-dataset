# mertkayacs/Karar-4B-GGUF

## Resumen

Karar-4B-GGUF es la versión cuantizada en formato GGUF de Karar-4B, un modelo de lenguaje pequeno (4.205.751.296 parametros) desarrollado por Eschatia Labs, un laboratorio independiente sin animo de lucro liderado por Mert Kaya. A diferencia de un LLM generativo al uso, Karar-4B esta especializado en clasificacion de texto y toma de decisiones estructuradas: recibe un estado (texto de entrada) y un conjunto de preguntas con opciones, y devuelve la opcion seleccionada junto con una distribucion de probabilidad calibrada. Su proposito es actuar como capa de enrutamiento, etiquetado y triaje en turco, ejecutable en CPU.

El modelo forma parte del proyecto JevAlt, que agrupa modelos de decision pequenos para ingles, turco y aleman. La version GGUF esta pensada para inferencia local en llama.cpp, Ollama y LM Studio, con un consumo de RAM de 3,03 GB en la cuantizacion Q4_K_M a 4k de contexto. La licencia Apache-2.0 y su tamano contenido lo hacen adecuado para despliegues on-device y entornos sin GPU.

La relevancia actual reside en la combinacion de tres factores: cuantizacion lista para produccion, un servidor especifico (JevAlt) que expone probabilidades calibradas en lugar de texto generado, y una evaluacion explicita de la concordancia entre cuantizaciones frente al modelo de precision completa. No obstante, el autor advierte que las instrucciones plantadas, el texto largo irrelevante y la aritmetica de fechas siguen siendo casos de fallo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Karar-4B; sin detalle de arquitectura en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4k evaluado en las mediciones de RAM; longitud maxima no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Karar-4B en la informacion proporcionada: no se especifica si es un transformer denso, el numero de capas, la dimension oculta ni los mecanismos de atencion. Lo que si se documenta es su funcionamiento como modelo de decision: el servidor JevAlt lee las probabilidades del siguiente token a traves de llama-cpp-python y aplica un fichero `calibration.json` para producir decisiones calibradas sobre un conjunto de opciones predefinidas.

El entrenamiento se realizo sobre el dataset `mertkayacs/jevalt-data`, y los resultados de evaluacion se publican en `mertkayacs/jevalt-bench`. El autor indica que la precision del modelo de precision completa es del 96,8% frente al 87,1% de Kev-4B en decisiones turcas retenidas del pipeline de datos de entrenamiento. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion se realizo con imatrix, segun los tags del repositorio.

## Capacidades

- Clasificacion de texto y toma de decisiones estructuradas: selecciona una opcion entre varias a partir de un estado y un conjunto de preguntas con criterios.
- Salida con probabilidades calibradas por opcion mediante el servidor JevAlt (no disponible en llama.cpp, Ollama o LM Studio en modo chat, que devuelven texto generado).
- Enrutamiento y triaje: asignacion de tickets o solicitudes a equipos (facturacion, soporte tecnico, ventas, cuenta) segun el ejemplo del widget.
- Etiquetado de texto en turco e ingles.
- Modo `reasoning` configurable (activado/desactivado) y opcion de absteccion (`abstain`) en la peticion.
- Inferencia en CPU sin GPU, con consumo medido de 3,03 GB de RAM en Q4_K_M a 4k de contexto.
- Integracion con llama.cpp, Ollama (`ollama run mertkayacs/karar-4b`), LM Studio y el servidor JevAlt.
- No se documentan capacidades de generacion libre, codigo, matematicas, vision, audio ni tool calling.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de la reclamacion y una pregunta de eleccion con criterios por equipo (facturacion, soporte tecnico, ventas, cuenta) y devuelve la opcion con mayor probabilidad. El ejemplo del widget muestra una reclamacion de doble cobro asignada a "Fatura" con 0,9135 de confianza.
- Enrutamiento en atencion al cliente: clasificacion de mensajes entrantes hacia el departamento correcto antes de que un agente humano los procese, reduciendo el tiempo de primera respuesta.
- Etiquetado de corpus en turco: clasificacion por lotes de documentos o resenas en categorias predefinidas, ejecutable en CPU y sin dependencia de APIs externas.
- Moderacion y priorizacion: asignacion de solicitudes a colas de distinta urgencia segun criterios definidos en la pregunta de eleccion.
- Despliegue on-device: integracion en aplicaciones de escritorio o entornos con recursos limitados gracias a los 3,03 GB de RAM pico en Q4_K_M, sin necesidad de GPU.
- Clasificacion en pipelines de datos: uso como paso previo de filtrado o enriquecimiento en procesos ETL, con la salida calibrada permitiendo fijar umbrales de confianza.
- Investigacion sobre calibracion: el modelo y su servidor sirven como banco de pruebas para estudiar la relacion entre cuantizacion y calibracion de probabilidades, dado que el autor publica los gaps de probabilidad por cuantizacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision, Karar-4B precision completa | 96,8% |
| Precision, Kev-4B (comparativa del autor) | 87,1% |
| Concordancia Q4_K_M con precision completa (opcion seleccionada) | 96,7% |
| Concordancia Q5_K_M con precision completa | 100,0% |
| Concordancia Q8_0 con precision completa | 100,0% |
| Gap maximo de probabilidad, Q4_K_M | 0,1430 |
| Gap maximo de probabilidad, Q5_K_M | 0,1154 |
| Gap maximo de probabilidad, Q8_0 | 0,0396 |
| Segundos por peticion, Q4_K_M | 15,74 |
| Segundos por peticion, Q5_K_M | 28,17 |
| Segundos por peticion, Q8_0 | 18,56 |
| RAM pico, Q4_K_M (4k contexto) | 3,03 GB |
| RAM pico, Q5_K_M | 3,39 GB |
| RAM pico, Q8_0 | 4,77 GB |

La concordancia se midio sobre 61 decisiones de validacion por cuantizacion, por lo que el autor la describe como una comprobacion de cuantizacion y no como una puntuacion de benchmark. Las mediciones de RAM y velocidad se realizaron en una maquina de Hugging Face con 8 vCPU, 4 hilos, contexto de 4k, sin mmap y con repacking activado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- RAM pico medida: 3,03 GB (Q4_K_M), 3,39 GB (Q5_K_M) y 4,77 GB (Q8_0), con contexto de 4k, sin mmap y repacking activado.
- Tamano de fichero: 2,71 GB (Q4_K_M), 3,08 GB (Q5_K_M) y 4,48 GB (Q8_0).
- Inferencia en CPU: las mediciones se realizaron en una maquina de 8 vCPU con 4 hilos; no se requiere GPU.
- GPU: no se documentan requisitos ni recomendaciones de GPU (A100, H100, RTX 4090, etc.) en la informacion proporcionada.
- Cabe en cualquier equipo consumer con al menos 4 GB de RAM libre para Q4_K_M; para Q8_0 se recomienda disponer de al menos 5 GB libres.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run mertkayacs/karar-4b`), LM Studio y el servidor JevAlt (`jevalt serve`), que es el unico que expone la API de decisiones calibradas en `http://127.0.0.1:8000/v1/systemone`.
- Latencia medida: 15,74 s por peticion en Q4_K_M, 28,17 s en Q5_K_M y 18,56 s en Q8_0, en el hardware descrito. No se documenta throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (decisiones turcas) | Licencia | Formato |
|---|---|---|---|---|---|
| Karar-4B-GGUF | 4.205.751.296 | 4k evaluado | 96,8% (precision completa) | Apache-2.0 | GGUF |
| Kev-4B | no disponible | no disponible | 87,1% | no disponible | no disponible |
| Otros modelos de clasificacion turca | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion publicada por el autor es frente a Kev-4B, con una diferencia de 9,7 puntos porcentuales a favor de Karar-4B en precision completa. No se dispone de informacion sobre otros modelos comparables de la misma categoria y tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Las instrucciones plantadas (prompt injection) siguen siendo un caso de fallo documentado; el autor recomienda mantener la autorizacion fuera del modelo.
- El texto largo irrelevante degrada el rendimiento.
- La aritmetica de fechas es un caso de fallo reconocido.
- La calibracion debe reajustarse sobre datos propios antes de fijar umbrales de decision; la calibracion por defecto puede no transferir a otros dominios.
- La concordancia de cuantizacion se midio sobre solo 61 decisiones por cuantizacion, muestra pequena que el propio autor califica como comprobacion y no como benchmark.
- Mayor precision no garantiza mayor concordancia en esa muestra pequena (Q4_K_M obtuvo 96,7% y Q5_K_M el 100,0%).
- El modelo esta orientado a turco e ingles; no se documenta soporte de otros idiomas.
- En llama.cpp, Ollama y LM Studio en modo chat se obtiene texto generado, no decisiones calibradas; para la API de decisiones es necesario el servidor JevAlt.
- No se documentan sesgos conocidos en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base y del dataset de entrenamiento.
- No se dispone de informacion sobre la robustez del modelo fuera del dominio de los datos de entrenamiento.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mertkayacs/Karar-4B-GGUF
- Modelo base de precision completa: https://huggingface.co/mertkayacs/Karar-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Resultados de benchmark: https://huggingface.co/datasets/mertkayacs/jevalt-bench
- Pagina de benchmarks: https://eschatialabs.com/benchmarks/jevalt-bench/
- Repositorio GitHub de JevAlt: https://github.com/mertkayacs/jevalt
- Pagina del proyecto: https://jevalt.mertkayacs.com/models/karar-4b/
- Demo Emberwick: https://emberwick.mertkayacs.com
- Pagina del autor: https://mertkayacs.com
- Eschatia Labs: https://eschatialabs.com
- Pagina en Ollama: https://ollama.com/mertkayacs/karar-4b
- Informe de exportacion: https://huggingface.co/mertkayacs/Karar-4B-GGUF/blob/main/export-report.json

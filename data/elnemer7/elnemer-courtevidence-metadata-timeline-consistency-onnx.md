# elnemer7/ElNeMeR-CourtEvidence-Metadata-Timeline-Consistency-ONNX

## Resumen

ElNeMeR-CourtEvidence-Metadata-Timeline-Consistency-ONNX es un clasificador binario-multiclase empaquetado en formato ONNX, desarrollado por el autor elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) dentro de una flota de 60 modelos orientados a forense digital y ayuda humanitaria. El modelo aborda un problema concreto: detectar contradicciones cronologicas en pruebas judiciales digitales, comparando marcas de tiempo EXIF (DateTimeOriginal), atomos mvhd de contenedores MP4, timestamps del sistema de ficheros y rastros de software de edicion. Su relevancia reside en la verificacion de autenticidad temporal de evidencias, un paso critico en peritajes forenses y litigios.

Tecnicamente no es un modelo de lenguaje ni un transformer generativo: es un clasificador tabular que consume un tensor de 20 caracteristicas (`timeline_meta_features`, `float32`, forma `[batch_size, 20]`) y produce tres clases de probabilidad. Se distribuye como grafo ONNX con opset 14, compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite ejecucion tanto en servidor como en navegador. La model card declara una precision de calibracion del 91,90%.

El repositorio tiene un tamano de 0.0 GB, sin descargas ni likes en el momento de la consulta, y la informacion publica es muy limitada: no se detallan datos de entrenamiento, composicion del dataset ni arquitectura interna de la red. La licencia es MIT, lo que facilita su integracion en productos comerciales, aunque la ausencia de documentacion sobre sesgos y validacion externa exige cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador tabular empaquetado en ONNX; no se especifica la topologia interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de vector fijo de 20 caracteristicas) |
| Tipos de cuantizacion | No disponible (formato ONNX opset 14; no se documentan variantes int8/fp16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal. Lo unico verificable es la interfaz de inferencia: una entrada `timeline_meta_features` de tipo `float32` con forma `[batch_size, 20]` y una salida de probabilidades sobre tres clases (`chronologically_consistent_original_evidence`, `backdated_clock_exif_container_conflict`, `post_editing_software_trace_detected`). El grafo se exporta en ONNX opset 14 y se declara compatible con `onnxruntime` y `onnxruntime-web` en WebAssembly, lo que sugiere un modelo ligero pensado para despliegue en entornos con recursos limitados o en el propio navegador.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de ajuste fino (RLHF/DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal, dado que no es un modelo generativo. La unica metrica declarada es una "Calibration Accuracy" del 91,90%, sin que se detalle el conjunto de validacion, el metodo de calibracion ni la distribucion de clases empleada.

## Capacidades

- Clasificacion de evidencia digital en tres categorias: original cronologicamente consistente, conflicto de reloj/EXIF/contenedor (backdating) y rastro de software de edicion posterior.
- Deteccion de inconsistencias entre metadatos EXIF `DateTimeOriginal`, atomos `mvhd` de MP4 y timestamps del sistema de ficheros.
- Identificacion de huellas de herramientas de edicion que alteran la cronologia del material.
- Inferencia en navegador mediante `onnxruntime-web` (WASM) y en servidor con `onnxruntime`.
- Procesamiento por lotes (`batch_size` configurable en el tensor de entrada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador, no un LLM.
- Capacidades multilingues: no aplicables ni documentadas.

## Casos de uso

- Verificacion de evidencias en peritajes judiciales: el modelo recibe las 20 caracteristicas temporales extraidas de un fichero (EXIF, mvhd, timestamps de sistema de ficheros y rastros de edicion) y devuelve la probabilidad de que la cronologia haya sido manipulada, ayudando al perito a priorizar la revision manual.
- Triaje automatizado en bufetes y departamentos legales: integrado en un pipeline de ingesta documental, clasifica rapidamente lotes de imagenes y videos aportados como prueba y senala los casos con conflicto de reloj o rastro de edicion para revision forense detallada.
- Cadena de custodia digital: ejecutado en el momento de la recepcion de la evidencia, compara los metadatos originales con los del contenedor para detectar backdating antes de que el material se archive.
- Verificacion en el navegador para periodistas y ONG: gracias a la compatibilidad con `onnxruntime-web` WASM, la comprobacion puede ejecutarse en el cliente sin enviar el material sensible a un servidor, lo que encaja con el enfoque de ayuda humanitaria del autor.
- Analisis de material audiovisual de conflictos: clasificacion de videos MP4 aportados por terceros para detectar si el atomo `mvhd` fue reescrito o si el archivo paso por software de edicion, un indicio de posible manipulacion.
- Integracion en plataformas de gestion de pruebas (e-discovery): el modelo actua como filtro previo que etiqueta cada fichero con una de las tres clases, alimentando dashboards de riesgo cronologico sin necesidad de infraestructura GPU.
- Auditoria de archivos historicos digitalizados: deteccion de metadatos inconsistentes en fondos documentales digitalizados donde los timestamps del sistema de ficheros no coinciden con los EXIF declarados.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la precision de calibracion declarada por el autor:

| Metrica | Valor | Fuente |
|---|---|---|
| Calibration Accuracy | 91,90% | Model card del autor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos alternativos de deteccion de manipulacion de metadatos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del modelo (clasificador tabular sobre un vector de 20 caracteristicas) el consumo deberia ser minimo, pero no se documenta.
- GPU recomendadas: no disponibles; el modelo esta pensado para ejecucion en CPU mediante `onnxruntime` y en navegador mediante `onnxruntime-web` (WASM).
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano del tensor de entrada, aunque no se confirma en la documentacion.
- Opciones de despliegue: `onnxruntime` (Python, C++, etc.) y `onnxruntime-web` (WASM en navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion de manipulacion cronologica de metadatos en formato ONNX, ni datos de rendimiento que permitan una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- La documentacion publica es muy escasa: no se detalla la arquitectura interna, el dataset de entrenamiento, la distribucion de clases ni el metodo de calibracion del 91,90% declarado.
- La metrica de calibracion es autodeclarada por el autor y no se ha verificado de forma independiente; no debe interpretarse como una tasa de acierto generalizable a otros corpus.
- Riesgo de falsos negativos y positivos en evidencias con metadatos incompletos o formatos no contemplados (solo se mencionan EXIF, mvhd de MP4 y timestamps de sistema de ficheros).
- El modelo clasifica a partir de 20 caracteristicas preextraidas; la calidad del resultado depende por completo del extractor de metadatos que lo alimente, que no se documenta.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado por un unico autor sin validacion externa publicada, su robustez frente a casos limite es incierta.
- Uso en produccion: la licencia MIT permite uso comercial, pero para contextos judiciales se recomienda validacion local contra un conjunto de evidencias propio y supervision pericial humana antes de tomar decisiones.
- El repositorio muestra 0 descargas y 0 likes, sin senales de adopcion ni comunidad que respalde su fiabilidad.
- No es un modelo de lenguaje: no puede generar explicaciones ni justificar sus clasificaciones, solo devolver probabilidades por clase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-CourtEvidence-Metadata-Timeline-Consistency-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com

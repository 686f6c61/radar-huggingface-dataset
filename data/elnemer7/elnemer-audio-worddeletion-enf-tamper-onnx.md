# elnemer7/ElNeMeR-Audio-WordDeletion-ENF-Tamper-ONNX

## Resumen

ElNeMeR Audio Word-Deletion & ENF 50Hz/60Hz Phase Discontinuity Detector es un clasificador ONNX desarrollado por elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) orientado a la forense digital de audio. Su funcion es detectar edicion manual no generativa de audio, concretamente el borrado de palabras (por ejemplo, eliminar el "NOT" de "I do NOT agree") mediante el analisis de discontinuidades en la fase de la red electrica (ENF, Electric Network Frequency) y en el ruido de fondo.

El modelo forma parte de la denominada "50-Model World Sovereign & Humanitarian Forensic AI Fleet", una flota de modelos de forense digital publicados por el mismo autor. No es un modelo generativo de lenguaje ni un modelo multimodal generalista: es un clasificador de audio de tres clases que trabaja sobre caracteristicas ENF preextraidas, no sobre la forma de onda en bruto.

Es relevante en el ambito de la autenticacion de pruebas audiovisuales para uso legal y humanitario, donde la manipulacion de declaraciones grabadas puede tener consecuencias juridicas. Su empaquetado en ONNX (opset 14) permite ejecucion tanto en servidor con onnxruntime como en navegador mediante onnxruntime-web (WASM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador ONNX (tipo de red no especificado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de vector fijo de 20 caracteristicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (opera sobre senal de audio, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |
| Entrada | Tensor `enf_audio_features`, float32, forma `[batch_size, 20]` |
| Salida | `probabilities` sobre 3 clases |
| Compatibilidad de ejecucion | onnxruntime y onnxruntime-web (WASM) |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red neuronal, el numero de parametros ni la composicion del conjunto de entrenamiento. El modelo se distribuye como grafo ONNX en opset 14 y consume un tensor de 20 caracteristicas float32 por muestra, lo que indica un pipeline en el que la extraccion de caracteristicas ENF (estimacion de frecuencia de red, fase y discontinuidades) se realiza fuera del modelo, y la red actua como clasificador sobre ese vector.

El autor declara una "calibration accuracy" del 98,59%, pero no especifica el conjunto de validacion, la metodologia de calibracion ni la distribucion de clases empleada. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador discriminativo. Tampoco se detalla el volumen de datos, la procedencia de las grabaciones ni si el entrenamiento incluyo condiciones de red a 50 Hz y 60 Hz por separado, pese a que el titulo menciona ambas frecuencias.

## Capacidades

- Deteccion de borrado de palabras en audio mediante saltos de fase ENF.
- Deteccion de discontinuidades en el suelo de ruido ambiental asociadas a cortes.
- Clasificacion en tres clases: `continuous_unedited_waveform`, `word_deletion_enf_phase_jump` y `crossfaded_sentence_reordering`.
- Deteccion de reordenacion de frases con crossfade.
- Ejecucion en navegador mediante onnxruntime-web (WASM), sin necesidad de backend.
- Procesamiento por lotes (`batch_size` configurable en el tensor de entrada).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No se documentan capacidades multilingues (opera sobre senal, no sobre contenido linguistico).

## Casos de uso

- Verificacion de declaraciones grabadas en contextos judiciales: el modelo permite comprobar si una confesion o testimonio ha sido editado para eliminar negaciones ("no acepto", "no firme"), analizando la continuidad de la fase ENF.
- Peritaje de audios aportados como prueba en procedimientos civiles o penales: el clasificador actua como primer filtro automatizado antes de la revision manual por parte del perito.
- Analisis de grabaciones de reuniones o llamadas corporativas: detecta si se han eliminado frases clave de un acuerdo verbal mediante cortes y reordenacion de oraciones.
- Verificacion de material periodistico: comprueba la integridad de extractos de entrevistas antes de su publicacion, especialmente cuando el audio ha pasado por varias manos.
- Auditoria de cadenas de custodia digitales: integrado en un pipeline de ingesta, marca automaticamente los ficheros con indicios de edicion para su cuarentena.
- Herramienta web de acceso publico para ONG y defensoria: al ejecutarse con onnxruntime-web, puede desplegarse en el navegador del usuario sin enviar el audio a un servidor, lo que preserva la confidencialidad de la prueba.
- Formacion de peritos: uso como ejemplo didactico de deteccion forense basada en ENF en entornos academicos.

## Benchmarks y rendimiento

La unica metrica publicada en la model card es la "calibration accuracy" del 98,59%. No se especifica el conjunto de evaluacion, el tamano de la muestra, la distribucion de clases ni la comparacion con lineas base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a este tipo de modelo.

| Metrica | Valor | Notas |
|---|---|---|
| Calibration accuracy | 98,59% | Declarada por el autor; metodologia no documentada |
| Benchmarks estandar de NLP | no disponible | No aplicables |
| Latencia / throughput | no disponible | No documentados |

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es un clasificador sobre vectores de 20 caracteristicas, por lo que la huella de memoria es presumiblemente minima (del orden de kilobytes a pocos megabytes), aunque el autor no publica el tamano del grafo.
- GPU recomendadas: no se requieren; el modelo esta pensado para CPU y para ejecucion WASM en navegador.
- Compatibilidad con GPU de consumo: si, en cualquier GPU moderna via onnxruntime con backend CUDA o DirectML, aunque no es necesario.
- Opciones de despliegue: onnxruntime (Python, C++, C#), onnxruntime-web (WASM en navegador), ONNX Runtime Server; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (deteccion forense de edicion de audio basada en ENF) dentro de la informacion proporcionada. La model card no cita alternativas ni lineas base.

| Modelo | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ElNeMeR Audio Word-Deletion & ENF Tamper (ONNX) | Clasificador ONNX | Vector ENF de 20 caracteristicas | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un detector entrenado sobre un conjunto no descrito, su comportamiento ante grabaciones con ruido de red atipico, fuentes de alimentacion conmutadas o inversores solares es incierto.
- Riesgo de falsos positivos y negativos no cuantificado: la unica metrica publicada (98,59%) carece de contexto metodologico, por lo que no debe tomarse como garantia de robustez en produccion.
- Requiere que la grabacion contenga una traza ENF utilizable; audios con filtrado agresivo, compresion con perdida severa o grabados con alimentacion por bateria pueden carecer de la senal necesaria.
- La entrada es un vector de 20 caracteristicas preextraidas: el modelo no incluye el extractor ENF, de modo que la calidad del pipeline de preprocesado condiciona por completo el resultado.
- No se documentan los idiomas ni el contenido linguistico analizado; la deteccion se basa en la senal fisica, no en el reconocimiento de palabras.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias explicitas sobre la idoneidad forense del modelo en contextos judiciales.
- El repositorio aparece con 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente subidos o que el grafo es extremadamente pequeno; conviene verificar la integridad de los ficheros antes de usarlo.
- No debe emplearse como unica prueba pericial: cualquier conclusion debe ser validada por un perito humano con herramientas complementarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Audio-WordDeletion-ENF-Tamper-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto del autor: WhatsApp / telefono +20 150 755 9911
- Documentacion de ONNX Runtime: https://onnxruntime.ai
- Documentacion de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/

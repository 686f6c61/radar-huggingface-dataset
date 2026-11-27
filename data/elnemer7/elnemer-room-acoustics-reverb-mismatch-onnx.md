# elnemer7/ElNeMeR-Room-Acoustics-Reverb-Mismatch-ONNX

## Resumen

ElNeMeR Room Acoustics Reverb Mismatch es un clasificador ONNX publicado por elnemer7 (Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) dentro de una flota anunciada de 35 modelos orientados a forense digital y ayuda humanitaria. El modelo no es un LLM generativo: es un cabezal de clasificacion que recibe un vector de 20 caracteristicas acusticas (`reverb_features`, float32, forma `[batch_size, 20]`) y devuelve probabilidades sobre tres clases relacionadas con la coherencia del campo reverberante de una grabacion de audio. Su proposito declarado es detectar llamadas con voz clonada y cortes/empalmes de audio midiendo la consistencia del decaimiento RT60 y la sequedad anecoica artificial tipica de los sistemas TTS.

La relevancia practica del enfoque es que ataca una senal fisica dificil de falsificar de forma consistente: la reverberacion de la sala. Un clon de voz generado por TTS suele carecer de cola reverberante natural, y un empalme entre fragmentos grabados en entornos distintos produce discontinuidades en el RT60. El modelo se distribuye como grafo ONNX con opset 14, compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite ejecucion en navegador o en backend sin dependencias de frameworks de deep learning.

La informacion publicada es muy escasa: el repositorio ocupa 0.0 GB, no hay pipeline declarado, no se especifican idiomas, no se documenta la arquitectura interna de la red ni el dataset de entrenamiento, y no se publican resultados de benchmarks independientes. La unica metrica reportada es una "calibration accuracy" del 100,00 %, que por si sola no constituye evidencia de rendimiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal no especificada, exportada a ONNX (opset 14); entrada `reverb_features` float32 `[batch_size, 20]` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador sobre vector de 20 caracteristicas, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (solo se declara el grafo ONNX en float32) |
| Idiomas soportados | no disponible (la tarea es acustica, no linguistica) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14), compatible con onnxruntime y onnxruntime-web WASM |

## Arquitectura y entrenamiento

No se detalla la topologia interna de la red en la model card: no se indica si es un MLP, un modelo convolucional 1D sobre tramas o un clasificador ligero sobre estadisticos agregados. Lo unico verificable es la interfaz: un tensor de entrada `float32` de forma `[batch_size, 20]` denominado `reverb_features` y una salida de probabilidades sobre tres clases (`consistent_physical_room_reverb`, `anechoic_ai_tts_dryness`, `multi_environment_reverb_splice`). El grafo se exporta en opset 14, lo que garantiza compatibilidad con versiones recientes de `onnxruntime` y con el runtime WASM para inferencia en navegador.

Tampoco se documentan el volumen ni la composicion del dataset de entrenamiento, el origen de las grabaciones, el metodo de extraccion de las 20 caracteristicas ni si hubo aumento de datos con salas simuladas (RIR sinteticas). La unica cifra de rendimiento publicada es una "calibration accuracy" del 100,00 %, sin definicion del conjunto de calibracion, sin tamano de muestra y sin validacion cruzada; debe tratarse como una afirmacion del autor no verificada y no como una metrica de generalizacion.

## Capacidades

- Clasificacion de audio en tres clases de coherencia reverberante: sala fisica consistente, sequedad anecoica propia de TTS y empalme multi-entorno.
- Analisis de decaimiento RT60 como senal forense para detectar voz clonada y edicion de audio.
- Inferencia por lotes (`batch_size` configurable) sobre vectores de 20 caracteristicas precalculadas.
- Ejecucion en navegador mediante `onnxruntime-web` (WASM), sin GPU ni backend Python.
- Integracion en pipelines de forense digital como etapa de triaje previa a la revision humana.
- No soporta generacion de texto, tool calling, agentes, vision, audio end-to-end ni capacidades multilingues: es un clasificador tabular/acustico de proposito especifico.

## Casos de uso

- Triaje forense de llamadas telefonicas: extraer caracteristicas de reverberacion de cada llamada sospechosa y clasificarla para priorizar las que muestran sequedad anecoica o empalmes antes de la escucha manual.
- Verificacion de autenticidad de grabaciones aportadas como prueba: detectar cortes entre fragmentos grabados en salas distintas mediante la clase `multi_environment_reverb_splice`.
- Deteccion de locuciones sinteticas en fraudes de suplantacion de identidad (vishing): la ausencia de cola reverberante natural es una senal complementaria a los detectores de voz clonada basados en espectro.
- Control de calidad en produccion de audio sintetico: monitorizar si un TTS suena excesivamente seco respecto al entorno declarado y marcar episodios para post-procesado con RIR.
- Analisis en navegador de archivos de audio subidos por el usuario: al ejecutarse con `onnxruntime-web` en WASM, permite clasificar en el cliente sin enviar el audio a un servidor, util en contextos de privacidad y ONG.
- Auditoria de archivos de call centers y verificacion de cadena de custodia: procesar lotes historicos y generar un indicador de coherencia acustica por registro.
- Filtrado previo en pipelines de datasets de voz: descartar clips con reverberacion inconsistente que degradarian el entrenamiento de modelos de reconocimiento de habla o de diarizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra reportada por el autor es una "calibration accuracy" del 100,00 %, sin conjunto de evaluacion, tamano de muestra ni protocolo definido, por lo que no se presenta como benchmark comparable.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 20 float32, por lo que el modelo es presumiblemente de pocos kilobytes a pocos megabytes.
- GPU recomendadas: no necesarias; la carga es despreciable y cabe en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` con backend WASM en navegador, o `onnxruntime-node`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; por la forma del tensor de entrada se espera una latencia de microsegundos a milisegundos por lote en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Los detectores de voz clonada habituales (por ejemplo, clasificadores sobre embeddings tipo WavLM o AASIST) operan sobre la forma de onda o espectrogramas y no sobre vectores de 20 caracteristicas de reverberacion, por lo que la comparacion directa no esta disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR Room Acoustics Reverb Mismatch (ONNX #30) | no disponible | no aplica | calibracion declarada 100,00 % (no verificada) | MIT | Hugging Face |
| Alternativas de deteccion de voz clonada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documenta la arquitectura interna, el dataset de entrenamiento ni el metodo de extraccion de las 20 caracteristicas, lo que impide reproducir el pipeline completo a partir del repositorio.
- La "calibration accuracy" del 100,00 % no esta respaldada por un protocolo de evaluacion publico; no debe interpretarse como precision en datos reales.
- El modelo depende de un extractor de caracteristicas externo no incluido: sin el, el tensor de entrada no puede generarse.
- Riesgo de falsos positivos en grabaciones legitimas con tratamiento acustico agresivo (estudios anecoicos, cancelacion de eco en llamadas VoIP, compresion con supresion de ruido).
- Riesgo de falsos negativos si el atacante aplica una RIR sintetica coherente al audio clonado.
- No hay informacion sobre sesgos por idioma, genero, canal telefonico o codec, ni sobre robustez frente a ruido de fondo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni de auditoria externa.
- Licencia MIT permite uso comercial, pero la ausencia de documentacion tecnica traslada al integrador toda la responsabilidad de validacion.
- No debe usarse como unica prueba en contextos periciales o judiciales sin corroboracion con otras tecnicas forenses.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Room-Acoustics-Reverb-Mismatch-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com

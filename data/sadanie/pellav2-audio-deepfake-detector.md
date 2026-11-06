# Sadanie/pellav2-audio-deepfake-detector

## Resumen

Pellav2 es un detector binario de voz real frente a voz sintetica (deepfake de audio) publicado por Sadanie en Hugging Face. El modelo se construye sobre un backbone de voz auto-supervisado de aproximadamente 300 millones de parametros, al que se anade una cabeza de clasificacion ligera y un mecanismo de ponderacion de capas aprendida. El objetivo es discriminar entre habla humana autentica y habla generada por sistemas de sintesis de voz modernos, un problema relevante para la verificacion de identidad, la lucha contra el fraude y la moderacion de contenido multimedia.

El modelo se distribuye con licencia MIT y un repositorio de 4,6 GB que incluye los pesos en formato PyTorch (`pellav2_detector.pt`), un script de inferencia listo para ejecutar y un `config.json`. Esta etiquetado unicamente para ingles y cuenta con 5.824 descargas en el momento de la consulta. La model card indica que Pellav3, publicado en noviembre de 2026, es la version vigente del detector, por lo que Pellav2 debe considerarse una version anterior dentro de la misma linea.

La relevancia actual viene del auge de la sintesis de voz de alta calidad: los sistemas TTS actuales generan muestras cada vez mas dificiles de distinguir a oido, lo que hace necesario disponer de clasificadores especializados, ligeros y ejecutables en local. Pellav2 responde a esa necesidad con un detector de un unico paso, sin pipeline declarado en el Hub, que se ejecuta mediante un script Python explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de voz auto-supervisado (~300M parametros) con ponderacion de capas aprendida y cabeza de clasificacion ligera |
| Parametros totales | ~300 millones (backbone); total exacto no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | No disponible; pesos distribuidos en formato PyTorch nativo |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pellav2_detector.pt`) |
| Tarea | Clasificacion binaria real/fake sobre audio |
| Tamano del repositorio | 4,6 GB |
| Pipeline en el Hub | No disponible |

## Arquitectura y entrenamiento

Pellav2 es un clasificador binario de audio construido sobre un backbone de voz auto-supervisado de gran tamano (aproximadamente 300 millones de parametros). Sobre las representaciones del backbone se aplica una ponderacion de capas aprendida, que combina caracteristicas de distintas profundidades de la red, y una cabeza de clasificacion ligera que produce la decision real/fake. No se especifica en la informacion disponible que backbone concreto se utiliza ni la configuracion exacta de la cabeza.

El entrenamiento se realizo sobre un dataset privado curado que combina habla real con habla sintetica generada por un amplio rango de sistemas TTS modernos. La model card no detalla el numero de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos o ajuste fino adicional. No hay informacion sobre el uso de RLHF, DPO ni otros metodos de alineacion, algo esperable en un clasificador y no en un modelo generativo.

## Capacidades

- Clasificacion binaria de audio: distingue habla real de habla sintetica (deepfake) en un unico paso de inferencia.
- Deteccion de anti-spoofing: orientado a identificar ataques de suplantacion de voz generados por TTS.
- Ponderacion de capas aprendida: aprovecha caracteristicas de multiples niveles del backbone para mejorar la discriminacion.
- Ejecucion local: el script `pellav2_infer.py` incluye la clase del modelo y permite ejecutar la inferencia sobre un fichero WAV.
- Procesamiento de audio con librerias estandar: depende de `torch`, `torchaudio`, `transformers`, `soundfile`, `numpy`, `scipy` y `pyloudnorm`.
- Descarga automatica de pesos desde el Hub en el primer uso.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado solo para ingles.
- Tool calling, agentes, vision, audio generativo o modo thinking: no disponibles (el modelo es exclusivamente un clasificador de audio).

## Casos de uso

- Verificacion de autenticidad de grabaciones: dado un clip de voz recibido por un canal corporativo, el modelo devuelve una etiqueta real/fake que sirve como primera senal en un flujo de validacion de identidad o de prueba documental.
- Moderacion de contenido en plataformas: integrado en un pipeline de subida de audio, permite marcar automaticamente clips sospechosos de ser sinteticos antes de la revision humana, reduciendo el volumen de contenido fraudulento publicado.
- Proteccion frente a fraude por suplantacion: en sistemas de verificacion telefonica o de acceso por voz, el detector actua como capa adicional para bloquear intentos de sustitucion con voz clonada.
- Analisis forense de comunicaciones: en investigaciones de incidentes, el clasificador aporta una evidencia objetiva sobre el origen sintetico de una grabacion, complementaria al analisis pericial.
- Evaluacion de sistemas TTS: los equipos que desarrollan sintesis de voz pueden usar el detector como metrica adversaria para medir la naturalidad y la detectabilidad de sus muestras generadas.
- Filtrado de datasets de audio: al construir corpus de habla para entrenamiento, el modelo permite descartar muestras sinteticas y mantener la pureza de los datos reales.
- Investigacion en anti-spoofing: sirve como linea base reproducible (pesos publicos, licencia MIT) para comparar nuevas tecnicas de deteccion de deepfakes de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen metricas como EER, accuracy, AUC ni comparaciones con otros detectores sobre conjuntos de evaluacion estandar (ASVspoof, In-the-Wild, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: un backbone de ~300M parametros en precision FP32 ocupa en torno a 1,2 GB solo en pesos; con activaciones y audio de entrada, una GPU con 4-6 GB de VRAM es suficiente en la mayoria de configuraciones. Cifra exacta no disponible.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM; para procesamiento por lotes de alto volumen, una A100 o H100 aporta margen y throughput.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; el tamano del modelo es moderado.
- Opciones de despliegue: el autor proporciona un script de inferencia basado en PyTorch (`pellav2_infer.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un clasificador de audio de este tipo.
- Latencia y throughput: no disponibles. Al ser un unico paso de clasificacion sobre un clip, la latencia esperada es baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pellav2 (Sadanie) | ~300M (backbone) | Clip de audio (duracion no especificada) | Clasificacion real/fake | MIT | Hugging Face, pesos PyTorch |
| Pellav3 (Sadanie) | No disponible | No disponible | Clasificacion real/fake | No disponible | Hugging Face (version vigente de la linea) |
| AASIST y familia | No disponible | Audio de voz | Anti-spoofing | Codigo abierto en repositorios academicos | Repositorios de investigacion |
| Wav2Vec2-based spoofing detectors | Variable | Audio de voz | Anti-spoofing | Variable segun implementacion | Hugging Face / repositorios academicos |

La comparacion cuantitativa con alternativas no esta disponible: no se publican metricas de Pellav2 que permitan situarlo frente a AASIST, RawNet2 o clasificadores basados en wav2vec2. La principal referencia interna es Pellav3, que el propio autor senala como version actual.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles; el rendimiento en otros idiomas no esta documentado y puede degradarse.
- Generalizacion: el entrenamiento se realizo sobre un dataset privado; no se publican resultados en conjuntos de evaluacion externos, por lo que el comportamiento ante TTS no vistos o ante condiciones acusticas distintas (ruido, canales telefonicos, codecs) es desconocido.
- Riesgo de falsos positivos y negativos: al ser un clasificador binario, los errores tienen consecuencias directas; en produccion conviene calibrar el umbral y combinarlo con otras senales.
- Alucinacion no aplica como tal, pero el modelo puede producir puntuaciones de confianza poco fiables fuera de su dominio de entrenamiento.
- Sesgos: no se documenta la composicion demografica del dataset de habla real, por lo que no se puede evaluar el sesgo por acento, edad, genero o procedencia.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, el autor no ofrece garantias sobre el rendimiento en produccion.
- Version obsoleta: la model card indica que Pellav3 es la version vigente desde noviembre de 2026; para nuevos despliegues conviene evaluar la version actual.
- Restricciones de uso: la deteccion de deepfakes es una tecnologia sensible; su uso debe respetar la normativa de proteccion de datos y las garantias procesales aplicables a la verificacion de identidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector
- Arbol de ficheros del repositorio: https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector/tree/main
- Version vigente (Pellav3): https://huggingface.co/Sadanie/pellav3-audio-deepfake-detector

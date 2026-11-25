# Anadilorg/Anadil_Laz_TTS

## Resumen

Anadil_Laz_TTS es un modelo de síntesis de voz (text-to-speech) para el idioma laz (ISO 639-3: `lzz`), una lengua kartveliana hablada en la costa nororiental de Turquía y zonas limítrofes de Georgia. Lo desarrolla Anadilorg, una organización que publica una familia de modelos TTS para lenguas de bajos recursos, y se distribuye con licencia MIT. Se trata de un ajuste fino completo (full fine-tune) del modelo base openbmb/VoxCPM2, con 2.290.004.544 parámetros, entrenado sobre 51.601 segmentos de un único hablante procedentes de Mozilla Common Voice Laz 27.0.

El modelo es relevante por dos motivos. Primero, cubre una lengua con poquísimos recursos digitales y prácticamente sin soluciones TTS de código abierto. Segundo, a diferencia de otros miembros de la familia Anadil (que se distribuyen como adaptadores LoRA), este paquete incluye la totalidad de los pesos ajustados, de modo que se carga como un modelo autónomo sin necesidad de descargar el modelo base por separado. Es el primer full fine-tune de la familia y sucesor directo de MozilLaz, el primer TTS laz de Anadilorg, que era un adaptador LoRA entrenado con unos 21.071 segmentos y 2.000 pasos.

El modelo realiza clonación de voz a partir de un clip de referencia en formato WAV y genera audio de salida a 48 kHz. El repositorio ocupa 9,6 GB y el fichero `model.safetensors` en F32 contiene 577 tensores (~8,5 GB). La información disponible no detalla la arquitectura interna de VoxCPM2 más allá de su naturaleza como modelo TTS con clonación por referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS base VoxCPM2 de openbmb; sin detalle arquitectonico en la informacion) |
| Parametros totales | 2.290.004.544 (~2,29 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | laz (`lzz`), lengua kartveliana |
| Licencia | MIT |
| Formato de pesos | safetensors (F32, 577 tensores, ~8,5 GB) |
| Frecuencia de muestreo de salida | 48 kHz |
| Modelo base | openbmb/VoxCPM2 |
| Metodo de ajuste | full fine-tune (todos los pesos) |
| Datos de entrenamiento | 51.601 segmentos, un solo hablante, Mozilla Common Voice Laz 27.0 |
| Pasos de entrenamiento | 10.000 |
| Libreria | voxcpm |
| Tamano del repositorio | 9,6 GB |
| Descargas en Hugging Face | 25 |
| Fecha de publicacion | 2026-11-20 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de VoxCPM2 (tipo de decoder, mecanismo de atencion, tokenizador de audio o estrategia de vocoder). Lo que si se documenta es el procedimiento de ajuste: se parte de los pesos completos de openbmb/VoxCPM2 (2,29 B de parametros) y se realiza un full fine-tune de todas las capas, no un adaptador de bajo rango. El entrenamiento emplea 51.601 segmentos de audio de un unico hablante (`spk_tmp_001`) extraidos de Mozilla Common Voice Laz 27.0, durante 10.000 pasos, y el checkpoint final es el que se publica.

Respecto a la generacion, el modelo funciona por clonacion de voz con referencia: se le pasa un texto en laz y un clip WAV del hablante objetivo, y sintetiza el audio con esa voz a 48 kHz. El paquete es autocontenido (no requiere descargar el modelo base ni pesos LoRA adicionales). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento, ni datos sobre composicion del dataset mas alla del recuento de segmentos y su procedencia. Tampoco se indica si hubo etapas de RLHF, DPO u otro ajuste por preferencias.

## Capacidades

- Sintesis de voz (text-to-speech) para texto en laz (`lzz`), con salida de audio a 48 kHz.
- Clonacion de voz a partir de un clip de referencia WAV: permite sintetizar con la voz del hablante de referencia, incluido el hablante de entrenamiento (`samples/1.wav`) o cualquier otra grabacion aportada por el usuario.
- Modelo autocontenido: incluye todos los pesos ajustados, sin necesidad de cargar el modelo base VoxCPM2 ni adaptadores LoRA.
- Inferencia por linea de comandos (`inference.py`) y por API de Python (`AnadilLazTTS`).
- Generacion por lotes de las frases de ejemplo incluidas en el repositorio (`--list-samples`).
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada distinto de la referencia de voz, ni modos de razonamiento extendido.

## Casos de uso

- Accesibilidad y lectura en voz alta en laz: convertir textos escritos (noticias, articulos, documentacion) en audio para hablantes con dificultades de lectura o para consumo en formato podcast, aprovechando que el modelo sintetiza directamente desde texto laz sin necesidad de un hablante humano.
- Preservacion linguistica y archivo sonoro: generar locuciones de material didactico, vocabularios y frases de ejemplo en laz para escuelas y proyectos de revitalizacion, con una voz coherente y reproducible a partir de un unico clip de referencia.
- Audiolibros y contenido divulgativo: narrar textos largos en laz con la voz clonada de un colaborador, manteniendo el timbre en todo el material sin regrabar cada fragmento.
- Interfaces de voz para aplicaciones locales: integrar el modelo en asistentes o apps de lectura que respondan en laz, usando la API de Python y un clip de referencia del usuario para personalizar la voz.
- Doblaje y produccion audiovisual de bajo presupuesto: generar pistas de voz en laz para videos, anuncios o subtitulado hablado, sustituyendo sesiones de estudio por sintesis por lotes.
- Investigacion en TTS de bajos recursos: servir como punto de partida o linea base para experimentos de clonacion de voz y ajuste fino en lenguas kartvelianas, dado que es un full fine-tune reproducible sobre un dataset publico (Common Voice) y con licencia MIT.
- Prototipado de productos multilingues: incorporar una variante laz a catalogos de voces de un producto existente, ya que el modelo se carga de forma autonoma y no exige el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas automaticas de calidad (WER, UTMOS y similares) aun no se han calculado, y que los cinco ejemplos de audio publicados corresponden a frases vistas durante el entrenamiento y sintetizadas usando su propia grabacion original como referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en F32 (~8,5 GB), por lo que se necesita al menos ese espacio mas el overhead del runtime y del audio de referencia; una estimacion prudente es de 10-12 GB de VRAM en F32. No se documentan variantes cuantizadas que reduzcan este requisito.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100 40/80 GB, H100) permite cargar el modelo en F32 con margen; GPUs de 8-12 GB quedan al limite o por debajo.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM (por ejemplo RTX 4090, RTX 4080) en F32; en tarjetas de 8-12 GB no es viable sin cuantizacion, que no esta documentada.
- Opciones de despliegue: la libreria oficial es `voxcpm` (junto con torch, torchaudio, soundfile y safetensors), con scripts `inference.py` y API de Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Anadil_Laz_TTS | ~2,29 B | no disponible | laz (`lzz`) | MIT | safetensors F32 | Full fine-tune de VoxCPM2; 51.601 segmentos; 10.000 pasos |
| MozilLaz (Anadilorg) | no disponible (adaptador LoRA sobre VoxCPM2) | no disponible | laz (`lzz`) | MIT | LoRA sobre el base | Predecesor; ~21.071 segmentos; 2.000 pasos; requiere el modelo base |
| openbmb/VoxCPM2 | ~2,29 B (modelo base) | no disponible | no disponible en la informacion | no disponible en la informacion | safetensors | Modelo base multilingue/generico del que parte el ajuste |
| Otros TTS multilingues genericos | no disponible | no disponible | varios | variable | variable | No se dispone de datos comparativos de benchmarks en la informacion |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de Anadil_Laz_TTS con alternativas; la comparacion se limita a parametros, procedencia y licencia.

## Limitaciones y advertencias

- Un solo hablante en entrenamiento (`spk_tmp_001`): la calidad fuera de esa voz depende de la clonacion por referencia y no esta validada con metricas.
- Dataset de origen crowdsourced (Mozilla Common Voice): puede arrastrar ruido de grabacion, acentos y variabilidad propios de la fuente, y sesgos de representacion de la comunidad que contribuyo.
- Riesgo de alucinacion o artefactos de audio: no hay evaluacion publicada de WER, UTMOS ni pruebas de robustez ante texto fuera de dominio, signos de puntuacion inusuales o frases muy largas.
- Cobertura limitada al laz: no se documenta soporte de otros idiomas ni cambio de codigo; el texto de entrada debe estar en `lzz`.
- Sin datos sobre longitud maxima de texto por inferencia ni sobre el comportamiento con entradas largas.
- Los ejemplos publicados son frases vistas en entrenamiento y sintetizadas con su propia grabacion como referencia, por lo que no constituyen una evaluacion de generalizacion.
- Uso comercial: la licencia MIT lo permite, pero conviene revisar las condiciones de Mozilla Common Voice y de los derechos de voz del hablante de referencia, especialmente si se clona una voz de terceros.
- La clonacion de voz plantea riesgos de suplantacion y uso indebido; es responsabilidad del integrador obtener consentimiento y aplicar salvaguardas.
- No hay variantes cuantizadas documentadas, lo que limita el despliegue en hardware modesto.
- Comunidad muy pequena (25 descargas, 0 likes en el momento de la consulta): soporte y mantenimiento limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anadilorg/Anadil_Laz_TTS
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Predecesor MozilLaz: https://huggingface.co/Anadilorg/MozilLaz
- Dataset Mozilla Common Voice Laz 27.0: https://mozilladatacollective.com/datasets/cmu5wdvdc00csnq07kziz5tgq
- Muestras de audio originales y sintetizadas: https://huggingface.co/Anadilorg/Anadil_Laz_TTS/tree/main/samples
- Script de inferencia: https://huggingface.co/Anadilorg/Anadil_Laz_TTS/blob/main/inference.py

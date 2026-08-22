# Bbkblo/vdub-hindi-dubbing

## Resumen

El modelo `Bbkblo/vdub-hindi-dubbing` no es un modelo de lenguaje monolítico, sino un pipeline completo de doblaje automático de vídeo que convierte contenido en chino a hindi, manteniendo la voz original del actor mediante clonación de voz y sincronizando el habla con los patrones temporales y de entonación del audio original. Desarrollado por Bbkblo, integra varios componentes de código abierto: el TTS multilingüe Chatterbox (0.5B parámetros) para generación de voz en hindi con clonación a partir de una referencia de voz china, un modelo de separación de fuentes (Kim_Vocal_2 o MelBandRoformer) para aislar la música de fondo, y un script de transferencia de patrones que ajusta pausas, velocidad y volumen del audio generado al original.

El pipeline está diseñado para producir un vídeo final con dos pistas de audio (hindi y chino original) y sincronización basada en subtítulos SRT. Su relevancia radica en ofrecer una alternativa de código abierto y gratuita a los servicios comerciales de doblaje automático, con control fino sobre emociones y calidad de sincronización. La licencia MIT del repositorio principal facilita su uso y modificación, aunque algunos componentes opcionales (como MelBandRoformer) tienen licencias de investigación que restringen su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de doblaje: TTS Chatterbox (0.5B) + S3Gen v3 (decodificador de tokens de voz) + separador de fuentes (Kim_Vocal_2 ONNX 67MB o MelBandRoformer 913MB) + transferencia de patrones DSP |
| Parametros totales | No disponible (el componente TTS principal tiene 0.5B; los separadores varian entre 67MB y 913MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de TTS, no de texto generativo) |
| Tipos de cuantizacion | No especificado; el separador Kim_Vocal_2 se distribuye en formato ONNX |
| Idiomas soportados | Entrada: chino (subtitulos y audio de referencia); salida: hindi (TTS) |
| Licencia | MIT (repositorio principal); componentes individuales: MIT (Chatterbox, Kim_Vocal_2) y research (MelBandRoformer) |
| Formato de pesos | safetensors (Chatterbox), ONNX (Kim_Vocal_2), pesos originales de los repos de origen |

## Arquitectura y entrenamiento

El pipeline no se entrena como un modelo unico, sino que ensambla componentes preentrenados de terceros. El nucleo es **Chatterbox** (ResembleAI/Chatterbox-Multilingual-hi), un modelo TTS de 0.5B parametros que soporta clonacion de voz con solo 5 segundos de referencia y control de emociones mediante un parametro de exageracion. Chatterbox genera tokens de voz que son decodificados por **S3Gen v3** a audio de 24kHz. La clonacion de voz se realiza mediante un encoder de voz (`ve.pt`) que extrae embeddings del hablante de la referencia china.

Para la separacion de musica de fondo, se utiliza **Kim_Vocal_2** (67MB, ONNX) o, opcionalmente, **MelBandRoformer** (913MB) del proyecto Fun-CineForge, que ofrece mayor calidad pero con licencia de investigacion. El script `pattern_transfer.py` aplica tecnicas de procesado digital de señal (DSP) para ajustar el audio hindi generado a los patrones de pausa, velocidad y sonoridad del audio original, garantizando sincronizacion temporal. El pipeline completo (`dub_job.py`) consta de 14 fases que incluyen TTS, transferencia de patrones, separacion, mezcla y control de calidad mediante el modelo campplus para medir la similitud de voz.

No se proporcionan datos sobre el entrenamiento del pipeline en si, ya que no se entrena; los componentes individuales tienen sus propios procesos de entrenamiento (Chatterbox fue entrenado por Resemble AI con datos multilingues, pero no se detallan en la informacion disponible).

## Capacidades

- Generacion de voz en hindi con clonacion de voz a partir de una referencia de audio en chino (o cualquier voz).
- Control de emociones mediante el parametro `exaggeration` (mapa de emociones: ANGRY 1.4, HAPPY 1.1, SAD 0.4, NEUTRAL 0.5).
- Separacion de musica de fondo y voces en el audio original, permitiendo conservar la banda sonora instrumental.
- Sincronizacion temporal automatica del audio doblado con los patrones de habla del original (pausas, velocidad, volumen).
- Generacion de un archivo de video con dos pistas de audio: hindi doblado y chino original.
- Control de calidad integrado mediante el modelo campplus, que asigna una puntuacion de similitud de voz (0-1) por linea.
- Soporte para procesamiento por lotes mediante un script de linea de comandos y un notebook de Kaggle/Colab.

## Casos de uso

- **Doblaje de series y peliculas chinas para audiencias hindi**: el pipeline permite traducir y doblar episodios completos, como el ejemplo incluido (Love Between Fairy and Devil Ep-1), manteniendo la voz de los actores originales y la sincronizacion con los subtitulos.
- **Localizacion de contenido educativo o corporativo**: empresas que necesitan adaptar videos formativos del chino al hindi pueden usar el pipeline para generar versiones dobladas con voz clonada de los presentadores originales, reduciendo costes frente a estudios de doblaje tradicionales.
- **Creacion de contenido para redes sociales**: creadores de contenido que quieran reutilizar videos virales chinos con doblaje en hindi pueden automatizar el proceso, incluyendo la separacion de musica para mantener el ambiente sonoro.
- **Investigacion en TTS y clonacion de voz**: el pipeline sirve como banco de pruebas para evaluar la calidad de Chatterbox en tareas de doblaje cross-lingue, permitiendo ajustar parametros como `cfg_weight` (control de acento) o `temperature`.
- **Archivo y preservacion de contenido audiovisual**: instituciones que deseen doblar material historico o documental al hindi pueden utilizar el pipeline para generar versiones accesibles, siempre que cuenten con los derechos correspondientes.
- **Produccion de audiolibros o podcasts doblados**: aunque el pipeline esta orientado a video, la generacion de audio TTS con clonacion de voz puede adaptarse para producir narraciones en hindi a partir de guiones chinos, con control emocional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una prueba interna (`test_10min.mp4` con 130 lineas) y un control de calidad con campplus, pero no se proporcionan metricas numericas concretas (solo se indica que el resultado fue "verificado"). No hay comparaciones con otros sistemas de doblaje.

## Requisitos de hardware

- **VRAM estimada**: no se especifica oficialmente. Basandose en los tamanos de los componentes (Chatterbox 0.5B, Kim_Vocal_2 67MB, MelBandRoformer 913MB), se estima que el pipeline completo puede ejecutarse en una GPU con al menos 8GB de VRAM (por ejemplo, RTX 3070/4060) para el modo basico. El modo con MelBandRoformer puede requerir 12-16GB.
- **GPU recomendadas**: NVIDIA con soporte CUDA (RTX 30xx o superior, o A100/H100 para produccion a gran escala). Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- **Compatibilidad con GPU de consumo**: si, el modo basico (sin MelBandRoformer) deberia caber en GPUs de 8GB, y el modo completo en GPUs de 16GB.
- **Opciones de despliegue**: el pipeline se ejecuta como script de Python (`dub_job.py`) o mediante el notebook de Kaggle/Colab. No se proporcionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- **Latencia y throughput**: no disponibles. Depende del hardware y de la longitud del video; el ejemplo de 10 minutos se proceso sin especificar tiempos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos de doblaje de codigo abierto. El proyecto menciona a **Fun-CineForge** como inspiracion, pero este no soporta hindi (solo zh/en). Herramientas comerciales como Wavel, Kapwing o Dubverse ofrecen funcionalidades similares, pero son propietarias y no publican especificaciones tecnicas comparables. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Watermark de PerTh**: el audio generado por Chatterbox incluye una marca de agua integrada (funcionalidad del modelo), que puede ser detectable y limitar su uso en producciones comerciales.
- **Permiso de clonacion de voz**: es necesario obtener autorizacion explicita de la persona cuya voz se va a clonar; el uso no autorizado puede violar derechos de imagen y privacidad.
- **Copyright del contenido**: el ejemplo incluido (Love Between Fairy and Devil) es propiedad de iQIYI; el repositorio solo contiene scripts y traducciones, no el video/audio original, y su uso esta restringido a fines personales o de investigacion.
- **Licencias de componentes**: MelBandRoformer tiene licencia de investigacion (no comercial), lo que limita el uso del pipeline en entornos de produccion si se activa esa opcion. El modo basico con Kim_Vocal_2 es MIT.
- **Idiomas limitados**: el pipeline esta disenado especificamente para entrada en chino y salida en hindi; no es directamente extensible a otros pares de idiomas sin modificar los componentes.
- **Riesgo de alucinacion en TTS**: aunque no es un modelo de texto, la generacion de voz puede producir errores de pronunciacion o entonacion en nombres propios o terminos tecnicos, especialmente en el cambio cross-lingue.
- **Dependencia de subtitulos**: la sincronizacion se basa en archivos SRT; si no se dispone de subtitulos precisos, la calidad del doblaje se degrada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Bbkblo/vdub-hindi-dubbing
- Chatterbox (TTS base): https://github.com/resemble-ai/chatterbox (y modelo en HF: ResembleAI/Chatterbox-Multilingual-hi)
- Perth (decodificador S3Gen): https://github.com/resemble-ai/Perth
- Kim_Vocal_2 (separador ONNX): https://huggingface.co/seanghay/uvr_models
- Fun-CineForge (referencia de pipeline): https://huggingface.co/FunAudioLLM/Fun-CineForge
- Herramientas comerciales de doblaje (contexto): Wavel, Kapwing, Dubverse, VisualDub (enlaces en resultados de busqueda)

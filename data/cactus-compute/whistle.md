# Cactus-Compute/whistle

## Resumen

Whistle es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Cactus-Compute, disenado especificamente para inferencia en dispositivo (on-device) y entornos de borde. Con un peso de tan solo 16,9 MB, el modelo realiza transcripcion, generacion de marcas temporales a nivel de palabra y extraccion de embeddings de voz en siete idiomas europeos: ingles, aleman, frances, espanol, italiano, neerlandes y polaco. Su propuesta diferencial es ofrecer capacidades de speech-to-text con una huella de memoria y almacenamiento extremadamente reducida, lo que lo hace viable en moviles, navegadores y microcontroladores.

El modelo se distribuye bajo licencia Apache 2.0 y se integra a traves del paquete `cactus-compute`, que incluye el motor de inferencia y los pesos cuantizados en formato propietario `.cact`, ademas de un checkpoint en safetensors. La arquitectura concreta no se detalla en la informacion disponible, pero el enfasis en cuantizacion, WebAssembly y despliegue en dispositivos de consumo sugiere un diseno compacto optimizado para latencia y consumo energetico mas que para precision maxima en benchmarks de referencia.

Su relevancia actual radica en la creciente demanda de procesamiento de voz local sin dependencia de la nube, especialmente por motivos de privacidad, latencia y coste. Whistle se posiciona como una alternativa ligera frente a modelos ASR basados en la nube o modelos mas grandes como Whisper, sacrificando potencialmente precision en aras de un despliegue ubicuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos cuantizados incluidos en formato `.cact`; niveles concretos no disponibles |
| Idiomas soportados | en, de, fr, es, it, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (motor Cactus) y `checkpoints/whistle.safetensors` |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card no especifica si se trata de un transformer encoder-decoder, un modelo convolucional o una arquitectura hibrida. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino supervisado.

Los elementos tecnicos destacables que si se mencionan son el soporte de cuantizacion agresiva (el modelo completo ocupa 16,9 MB), la compilacion a WebAssembly para ejecucion en navegador y la integracion con el runtime Cactus, que gestiona la descarga y cache del motor y los pesos. El modelo produce tres tipos de salida: texto transcrito, marcas temporales por palabra y embeddings de voz, lo que indica una cabeza de salida multiple o un diseno que expone representaciones intermedias.

## Capacidades

- Transcripcion de voz a texto (speech-to-text) en siete idiomas: ingles, aleman, frances, espanol, italiano, neerlandes y polaco.
- Generacion de marcas temporales a nivel de palabra (word timestamps), util para subtitulado y alineacion.
- Extraccion de embeddings de voz, lo que permite tareas derivadas como verificacion de hablante, busqueda por similitud o clustering.
- Inferencia on-device sin conexion a la nube.
- Ejecucion en navegador mediante WebAssembly.
- Entrada de audio a 16 kHz en formato WAV; el paquete `cactus-compute[mic]` anade soporte para otras frecuencias de muestreo y captura por microfono.
- No se menciona soporte de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Subtitulado automatico en tiempo real: el modelo genera marcas temporales por palabra, lo que permite sincronizar subtitulos con precision en aplicaciones de video o streaming sin enviar audio a servidores externos.
- Asistentes de voz en moviles: con 16,9 MB, el modelo cabe en el almacenamiento de cualquier smartphone y puede ejecutarse localmente, reduciendo la latencia y preservando la privacidad del usuario.
- Transcripcion de reuniones en aplicaciones de escritorio: integrado mediante el paquete Python `cactus-compute`, permite transcribir audio de 16 kHz localmente en portatiles sin GPU dedicada.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en vivo en navegador via WebAssembly, sin instalacion de software adicional ni dependencia de servicios cloud.
- Procesamiento de voz en dispositivos IoT y edge: su tamano reducido y su runtime ligero permiten desplegarlo en hardware con recursos limitados para comandos de voz o dictado en siete idiomas europeos.
- Analisis de llamadas y atencion al cliente: la extraccion de embeddings de voz facilita agrupar o comparar hablantes, y la transcripcion local cumple con requisitos de proteccion de datos al no salir el audio del dispositivo.
- Investigacion en linguistica computacional: los embeddings y las marcas temporales permiten estudios de alineacion fonetica y analisis multilingue en entornos reproducibles y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la web oficial (`cactuscompute.com/blog/whistle`) para consultar benchmarks, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en la mayoria de configuraciones, dado que el modelo pesa 16,9 MB y el runtime anade una sobrecarga moderada; cifra exacta no disponible.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. No se especifican modelos de GPU concretos.
- Cabe en GPU de consumo: si, en cualquier GPU consumer e incluso en CPU y en navegador via WebAssembly.
- Opciones de despliegue: paquete Python `cactus-compute`, runtime Cactus, WebAssembly en navegador. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Whistle (Cactus-Compute) | no disponible (16,9 MB de pesos) | 7 (en, de, fr, es, it, nl, pl) | no disponible | Apache 2.0 | `.cact`, safetensors | On-device, edge, WebAssembly |
| OpenAI Whisper (tiny) | 39 M | ~99 | 30 s de audio | MIT | safetensors, GGUF, etc. | ASR generalista |
| OpenAI Whisper (base) | 74 M | ~99 | 30 s de audio | MIT | safetensors, GGUF, etc. | ASR generalista |
| Distil-Whisper | ~756 M (distil-large-v3) | principalmente en | 30 s de audio | MIT | safetensors | ASR destilado, ingles |

La comparativa se limita a caracteristicas estructurales, ya que no se dispone de cifras de rendimiento de Whistle. Frente a Whisper tiny (39 M de parametros), Whistle es sustancialmente mas pequeno en almacenamiento pero cubre menos idiomas. La ventaja de Whistle reside en su runtime optimizado para navegador y edge, no en cobertura linguistica ni en precision medida.

## Limitaciones y advertencias

- Solo soporta siete idiomas europeos; no cubre arabe, chino, japones, coreano ni otras lenguas presentes en modelos ASR generalistas.
- La entrada debe ser audio WAV a 16 kHz salvo que se instale el extra `[mic]`; no se documenta soporte nativo para MP3, OGG u otros formatos comprimidos.
- No se han publicado cifras de WER (word error rate) ni de otros benchmarks en la informacion disponible, por lo que no es posible evaluar su precision frente a alternativas.
- El formato principal de pesos (`.cact`) es propietario del runtime Cactus; el checkpoint safetensors esta disponible, pero la arquitectura no esta documentada, lo que dificulta la reimplementacion o el ajuste fino fuera del ecosistema Cactus.
- El modelo puede presentar sesgos derivados de sus datos de entrenamiento, que no se detallan; no hay informacion sobre la composicion del dataset ni sobre sesgos demograficos o dialectales.
- Riesgo de alucinacion en audio ruidoso o con acentos no representados en el entrenamiento; no cuantificado.
- Aunque la licencia Apache 2.0 permite uso comercial, el runtime Cactus y sus binarios pueden tener condiciones propias que conviene revisar antes de desplegar en produccion.
- No se documentan garantias de mantenimiento, versionado semantico ni soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cactus-Compute/whistle
- Web oficial y benchmarks: https://cactuscompute.com/blog/whistle
- Repositorio del runtime Cactus: https://github.com/cactus-compute/cactus
- Binarios del runtime y plataformas soportadas: https://huggingface.co/Cactus-Compute/cactus
- Documentacion de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Guia de speech: https://cactuscompute.com/blog/whistle-best-practices
- Guia de ajuste fino: https://cactuscompute.com/blog/finetuning-whistle

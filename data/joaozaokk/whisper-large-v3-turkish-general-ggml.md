# JoaoZaokk/whisper-large-v3-turkish-general-ggml

## Resumen

Este repositorio contiene la conversion a formato GGML del checkpoint turco `turkmedstt/whisper-large-v3-turkish-general`, un ajuste fino de Whisper large-v3 orientado al reconocimiento automatico del habla (ASR) en turco. El autor del repositorio, JoaoZaokk, no entrena el modelo: se limita a reempaquetar los pesos originales con el convertidor y el cuantizador propios de whisper.cpp para que puedan ejecutarse en local mediante esa misma herramienta. El resultado son tres ficheros binarios con cuantizaciones q4_0, q5_0 y q8_0, pensados para inferencia en dispositivo (telefonos, portatiles, Macs) sin necesidad de GPU de datacenter.

La relevancia de este tipo de conversion es practica: Whisper large-v3 completo ocupa varios gigabytes en precision completa y no cabe comodamente en hardware de consumo, mientras que las versiones cuantizadas reducen el peso a entre 889 MB y 1657 MB con una perdida de precision que el autor califica de menor. Al estar en formato GGML, el modelo es cargable directamente por `whisper-cli` y por cualquier aplicacion que embeba whisper.cpp, lo que facilita su integracion en aplicaciones nativas de escritorio y moviles.

Se trata, en cualquier caso, de un artefacto de distribucion con muy poca traccion: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y sin mas validacion declarada que la transcripcion de muestras cortas en portugues e ingles antes de subir los ficheros. Quien lo evalue debe asumir que la verificacion de calidad en turco corre por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper large-v3); heredada del modelo base, no detallada en la model card |
| Parametros totales | 1550 millones (cifra publica de Whisper large-v3, no confirmada en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos por pasada (caracteristica de la familia Whisper large-v3; no declarado en la model card) |
| Tipos de cuantizacion | q4_0, q5_0, q8_0 (el README menciona tambien f16 como conversion sin perdida, pero no figura entre los ficheros publicados) |
| Idiomas soportados | Turco (etiqueta `tr` en la model card); el modelo base es multilingue, aunque el ajuste fino esta orientado a turco |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML / GGUF binario para whisper.cpp (`.bin`) |
| Tamano del repositorio | 3.6 GB |
| Ficheros publicados | `ggml-whisper-large-v3-turkish-general-q8_0.bin` (1657 MB), `ggml-whisper-large-v3-turkish-general-q5_0.bin` (1081 MB), `ggml-whisper-large-v3-turkish-general-q4_0.bin` (889 MB) |
| Modelo base | turkmedstt/whisper-large-v3-turkish-general |
| Libreria | whisper.cpp |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento del checkpoint original. Lo unico verificable es que el modelo base, `turkmedstt/whisper-large-v3-turkish-general`, es un ajuste fino de Whisper large-v3, lo que implica la arquitectura encoder-decoder caracteristica de la familia: entrada de audio convertida a espectrograma mel, encoder con atencion completa sobre la representacion acustica y decoder autoregresivo que genera tokens de texto, con procesamiento en ventanas de 30 segundos. Los detalles de tokens de entrenamiento, composicion del dataset y si hubo etapas de RLHF o DPO no estan disponibles en la informacion proporcionada y corresponderian a la ficha del modelo base, no a este repositorio.

En cuanto a la conversion, el autor indica que los pesos se transformaron con el convertidor propio de whisper.cpp y despues se cuantizaron con el cuantizador de la misma herramienta. No se documento ningun ajuste posterior, destilado ni decodificacion especulativa. La unica validacion declarada consistio en transcribir muestras cortas en portugues e ingles antes de publicar cada variante, lo que no constituye una evaluacion del rendimiento en turco.

## Capacidades

- Transcripcion de voz a texto en turco, con soporte de audio en ventanas de 30 segundos por inferencia.
- Ejecucion completamente local y sin conexion: al ser un binario GGML para whisper.cpp, no requiere llamadas a API externas ni envio de audio a terceros.
- Funcionamiento en CPU, GPU integrada, Apple Silicon y GPU discretas, segun la configuracion de compilacion de whisper.cpp.
- Integracion mediante `whisper-cli -m <fichero>` y a traves de aplicaciones que embeban whisper.cpp como libreria.
- Salida con marcas de tiempo por segmento propias de la familia Whisper (sujetas a la implementacion concreta del motor).
- Posible transcripcion de otros idiomas heredada del modelo base multilingue, aunque no verificada ni declarada por el autor para este ajuste.
- No se declara soporte de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Subtitulado de contenido audiovisual en turco: el modelo genera transcripciones segmentadas que pueden convertirse a formatos de subtitulos (SRT, VTT) para series, documentales o videos corporativos, ejecutandose en local sin coste por minuto de audio.
- Notas de reunion y actas automaticas: integrado en una aplicacion de escritorio, permite transcribir reuniones grabadas en turco manteniendo el audio dentro de la maquina, algo relevante cuando la conversacion contiene informacion confidencial.
- Atencion al cliente con analitica de llamadas: un pipeline puede transcribir grabaciones de call center en turco para despues aplicar analisis de sentimiento o busqueda de palabras clave sobre el texto resultante, sin depender de servicios cloud.
- Dictado en aplicaciones de productividad: al ser una cuantizacion q5_0 de 1081 MB, es viable embeberlo en una aplicacion de escritorio o movil que ofrezca dictado offline en turco para redaccion de correos, informes o notas.
- Investigacion en procesamiento de habla: sirve como punto de partida reproducible para medir WER en turco y comparar cuantizaciones q4_0, q5_0 y q8_0 sobre el mismo conjunto de evaluacion.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo casi real de charlas, clases o eventos presenciales en turco mediante un portatil, siempre que se acepte la latencia derivada del procesamiento por ventanas de 30 segundos.
- Preservacion y busqueda de archivos de audio historicos: transcripcion por lotes de entrevistas o grabaciones etnograficas en turco para hacerlas indexables y consultables por texto.
- Despliegue en hardware modesto para kioscos o dispositivos dedicados: la variante q4_0 de 889 MB permite ejecutar transcripcion en equipos sin GPU discreta, algo util en entornos de fabrica o puntos de atencion presencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER, MMLU ni de ningun otro conjunto de evaluacion, y la unica comprobacion declarada por el autor fue la transcripcion de muestras cortas en portugues e ingles, no en turco. No se deben inferir cifras de rendimiento a partir del modelo base sin medirlas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con q4_0, 1,5-2 GB con q5_0 y 2,5-3 GB con q8_0, incluyendo el margen necesario para buffers de audio y estado del decoder. Son estimaciones a partir del tamano de los ficheros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 3 GB de memoria dedicada sirve para las tres cuantizaciones. Para q8_0 bastan tarjetas modestas tipo GTX 1650 o superiores; para maximizar throughput, una RTX 3060, RTX 4090 o A100 estan sobradamente dimensionadas. En A100 y H100 el cuello de botella pasa a ser el procesamiento de audio, no la memoria.
- Cabe en GPU de consumo: si, en todas las variantes. q4_0 y q5_0 caben incluso en iGPU con memoria compartida y en Apple Silicon con configuraciones de 8 GB de memoria unificada.
- Opciones de despliegue: whisper.cpp como motor principal (`whisper-cli`, servidor integrado de whisper.cpp y cualquier aplicacion que embeba la libreria). El autor menciona que el repositorio existe para mantener estables los enlaces de descarga usados por las aplicaciones nativas Odysseus y Open WebUI. Formatos de servidor tipo vLLM o TGI no aplican a binarios GGML.
- Latencia y throughput: no disponibles. Dependen del hardware, del numero de hilos de CPU y del backend seleccionado (CPU, CUDA, Metal, Vulkan) al compilar whisper.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoZaokk/whisper-large-v3-turkish-general-ggml | 1550 millones (heredado) | Ventanas de 30 s | Turco (etiqueta declarada) | Apache 2.0 | GGML/GGUF para whisper.cpp, 3 cuantizaciones |
| openai/whisper-large-v3 (original) | 1550 millones | Ventanas de 30 s | Multilingue, ~99 idiomas | MIT | Safetensors, transformers, conversiones GGML de terceros |
| openai/whisper-large-v3-turbo | No disponible en la informacion proporcionada | Ventanas de 30 s | Multilingue | MIT | Safetensors y conversiones GGML de terceros |
| turkmedstt/whisper-large-v3-turkish-general | No disponible en la informacion proporcionada | Ventanas de 30 s | Turco | Apache 2.0 | Safetensors (checkpoint de origen) |

Nota: los datos de los modelos comparativos corresponden a informacion publica de la familia Whisper y no han sido verificados en esta busqueda. No hay mediciones de WER comparativas en turco disponibles para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion en turco: la unica validacion declarada por el autor se hizo con muestras cortas en portugues e ingles, idiomas que no son el objetivo del ajuste fino. No hay ninguna cifra de WER que respalde la calidad en turco.
- Sin traccion ni mantenimiento verificable: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de retroalimentacion de la comunidad sobre fallos o degradaciones.
- Inconsistencia en la documentacion: el README menciona una conversion f16 como referencia sin perdida, pero esa variante no aparece en la tabla de ficheros ni en el repositorio, de modo que el usuario no dispone de linea base sin cuantizar.
- Divergencia entre idioma declarado y validacion: la etiqueta es `tr`, pero las pruebas descritas se hicieron en portugues e ingles; conviene verificar el comportamiento real en turco antes de usarlo en produccion.
- Riesgo de alucinacion: la familia Whisper tiende a generar texto plausible en segmentos con silencio, ruido o audio musical, y tambien a repetir frases en bucles. Este riesgo se acentua en segmentos con acentos marcados o vocabulario tecnico poco representado en el ajuste.
- Rendimiento degradado en audio dificil: solapamiento de voces, ruido de fondo elevado, audio telefónico de banda estrecha o muestras inferiores a 16 kHz afectan a la precision. No hay datos especificos para este ajuste.
- Idioma y dominio limitados: no se declaran dialectos turcos, jerga medica ni terminologia especializada. Cualquier uso en dominio sanitario, legal o financiero requiere validacion humana.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y la atribucion. El autor indica explicitamente que los pesos son obra derivada del modelo de turkmedstt y pide citar a los autores originales. No se incluye garantia de ningun tipo.
- Cuantizacion q4_0: es la variante mas agresiva y la que mayor perdida de precision introduce; para produccion conviene partir de q5_0 o q8_0 salvo que la restriccion de memoria sea critica.
- Restricciones practicas del motor: al ser un binario GGML, no es compatible con pilas de inferencia basadas en PyTorch o transformers sin convertir los pesos de nuevo; la integracion queda ligada al ecosistema whisper.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoZaokk/whisper-large-v3-turkish-general-ggml
- Modelo base: https://huggingface.co/turkmedstt/whisper-large-v3-turkish-general
- Motor whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Repositorio original de Whisper (OpenAI): no disponible en la informacion proporcionada
- Paper de Whisper: no disponible en la informacion proporcionada
- Benchmarks o informes de evaluacion: no disponibles en la informacion proporcionada

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo ni con reconocimiento automatico del habla; los resultados obtenidos correspondian a hoteles familiares en el mar Baltico y se han descartado por no ser pertinentes.

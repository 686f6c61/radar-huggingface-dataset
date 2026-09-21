# OpenStems/OpenStems-Models

## Resumen

OpenStems Models es un repositorio de recursos de modelo publicados por OpenStems para su motor nativo de separación de fuentes musicales escrito en C++. No se trata de un modelo de lenguaje ni de un modelo multimodal generativo, sino de un conjunto de cuatro pesos en formato GGUF destinados al pipeline `audio-to-audio` de separación de pistas (music source separation). Los cuatro artefactos son T400, B400, BS Karaoke y BS SW, con tamaños extraídos de 270.145.408, 206.407.520, 204.258.848 y 698.768.832 bytes respectivamente, todos ellos preservados en precisión FP32 y empaquetados en archivos ZIP que no alteran los bytes ni la precisión del modelo.

El repositorio está pensado como dependencia de instalación, no como modelo de uso directo: el instalador de OpenStems descarga y verifica automáticamente los recursos, y las ediciones de CPU y NVIDIA comparten exactamente los mismos pesos. Los perfiles de uso declarados son Fast (T400), Pro (B400) y Ultra (que selecciona la receta necesaria entre Karaoke y SW según el caso). El repositorio incluye manifiestos `model-files.json` y ficheros `.sha256` para verificación de integridad, e indica explícitamente que los instaladores deben fijar un commit y validar tanto el ZIP descargado como el modelo extraído.

La relevancia actual del repositorio es acotada pero concreta: publica artefactos de inferencia en un formato legible por runtimes nativos con controles de integridad, algo poco habitual en herramientas de separación distribuidas como binarios. Como contrapartida, no publica arquitectura, datos de entrenamiento, métricas ni licencia de los pesos, lo que limita seriamente su evaluación técnica y su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card) |
| Parametros totales | no disponible (estimacion derivada del tamaño FP32: ~67,5 M para T400; ~51,6 M para B400; ~51,1 M para Karaoke; ~174,7 M para SW) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de separacion de audio, no de texto) |
| Tipos de cuantizacion | FP32 unicamente (unica precision declarada) |
| Idiomas soportados | en, zh (etiquetas declaradas; en un modelo de audio probablemente referidas a la documentacion) |
| Licencia | no disponible; la model card indica que los pesos siguen sujetos a los terminos upstream aplicables y que el empaquetado no establece una licencia nueva |
| Formato de pesos | GGUF (FP32), distribuidos dentro de archivos ZIP |
| Pipeline | audio-to-audio (music-source-separation) |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |

Ficheros publicados:

| Modelo | Perfil declarado | Fichero extraido | Bytes extraidos | Estimacion de parametros (FP32) |
|---|---|---|---|---|
| T400 | Fast | T400.gguf | 270.145.408 | ~67,5 M |
| B400 | Pro | B400.gguf | 206.407.520 | ~51,6 M |
| BS Karaoke | Receta Ultra (karaoke) | karaoke.gguf | 204.258.848 | ~51,1 M |
| BS SW | Receta Ultra (SW) | sw.gguf | 698.768.832 | ~174,7 M |

La columna de parametros es una estimacion calculada dividiendo el tamaño extraido entre 4 bytes por parametro, asumiendo la precision FP32 declarada. El autor no publica el numero de parametros.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. No se indica si se trata de un transformer, de una arquitectura U-Net, de un modelo de dominio espectral, de un modelo hibrido ni de ninguna otra familia concreta. Tampoco se detalla el tipo de representacion de audio utilizada (forma de onda, espectrograma, STFT u otras), ni la estrategia de separacion (enmascaramiento, prediccion directa de fuentes, etc.).

Tampoco hay datos sobre entrenamiento: no se especifica el numero de tokens o de horas de audio, la composicion del dataset, si hubo ajuste fino con RLHF/DPO (poco aplicable en separacion de fuentes) ni cualquier otra innovacion tecnica. Lo unico verificable es que se trata de artefactos de inferencia empaquetados en GGUF FP32 para un runtime nativo en C++, con cuatro variantes que responden a distintos perfiles de uso (Fast, Pro y Ultra con receta Karaoke/SW). La model card advierte de forma explicita que la extension `.gguf` por si sola no garantiza compatibilidad con otro runtime distinto del de OpenStems, lo que sugiere un formato GGUF con extensiones o convenciones propias no documentadas.

## Capacidades

- Separacion de fuentes musicales (music source separation): es la funcion principal declarada por las etiquetas del repositorio y el pipeline `audio-to-audio`.
- Procesamiento de audio a audio: entrada de audio y salida de audio, sin generacion de texto.
- Perfil de separacion vocal/instrumental orientado a karaoke mediante el modelo `karaoke.gguf`.
- Receta adicional `sw.gguf` para el perfil Ultra; la model card no expande la abreviatura ni describe que fuentes separa exactamente.
- Ejecucion en CPU y en GPU NVIDIA con los mismos pesos: las ediciones de CPU y NVIDIA del motor OpenStems comparten un unico conjunto de pesos.
- Verificacion de integridad: manifiesto `model-files.json` con tamaños y sumas SHA-256 de archivo comprimido y extraido, mas ficheros `.sha256` independientes.
- Precisión FP32 completa, sin variantes cuantizadas declaradas.

Capacidades no disponibles o no aplicables segun la informacion proporcionada: generacion de texto, razonamiento, generacion de codigo, matematicas, vision, audio comprensivo (speech-to-text), tool calling, function calling, uso como agente, razonamiento multi-paso y modo "thinking". No hay ninguna indicacion de soporte multilingue en el propio procesamiento de audio; las etiquetas `en` y `zh` figuran como idiomas del repositorio.

## Casos de uso

- Produccion musical y remezclas: extraer pistas vocales e instrumentales de una mezcla para reutilizarlas en una nueva produccion. El perfil Pro (B400) seria el punto de partida por equilibrio entre tamaño y calidad, mientras que el perfil Fast (T400) sirve para preescuchas rapidas durante la sesion de edicion.
- Generacion de pistas de karaoke: el modelo `karaoke.gguf` dentro de la receta Ultra esta pensado para eliminar la voz principal y dejar la base instrumental. Es el caso de uso mas directamente identificable a partir de los nombres de los ficheros publicados.
- Postproduccion de audio para video: separar dialogo, musica y efectos para reequilibrar niveles o sustituir la banda sonora sin volver a mezclar desde el material original. La disponibilidad de pesos compartidos entre CPU y NVIDIA permite procesar en estaciones sin GPU dedicada.
- Preprocesado para reconocimiento automatico del habla (ASR): aislar la componente vocal antes de enviar el audio a un sistema de transcripcion, con el objetivo de reducir el ruido musical. Encaja con el perfil SW, aunque la model card no documenta su comportamiento para este fin.
- Restauracion y archivo de grabaciones: separar capas de una mezcla antigua para conservar cada componente por separado en un archivo de patrimonio sonoro, procesando por lotes en CPU con el modelo de menor tamaño (B400, ~206 MB).
- Generacion de datasets de entrenamiento: producir pares mezcla/fuente a partir de material ya separado o parcialmente separado para alimentar otros modelos de separacion o de etiquetado musical. La precision FP32 evita artefactos de cuantizacion en el material generado.
- Integracion en un plugin o DAW mediante el runtime nativo: el repositorio esta diseñado como dependencia de un motor C++ en lugar de como modelo suelto, por lo que el caso natural es el empaquetado dentro de una aplicacion de escritorio que descarga y verifica los pesos en la instalacion.
- Procesado por lotes en servidor sin GPU: con ficheros de entre ~204 MB y ~699 MB y precision FP32, los cuatro modelos caben sin dificultad en memoria de sistema y permiten colas de procesamiento en CPU cuando no hay acelerador disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas objetivas habituales en separacion de fuentes (SDR, SI-SDR, SIR, SAR, BSS Eval), ni comparaciones con otras herramientas, ni resultados de evaluacion subjetiva tipo MUSHRA. Tampoco se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamaño de los pesos en FP32 mas el espacio de trabajo del runtime: aproximadamente 0,3 GB para T400, 0,25 GB para B400, 0,25 GB para Karaoke y 0,75 GB para SW, siempre añadiendo el margen del búfer de audio y del propio motor. Son estimaciones derivadas del tamaño de fichero, no cifras publicadas por el autor.
- GPU: cualquier GPU NVIDIA moderna con al menos 2 GB de VRAM deberia ser suficiente por tamaño de pesos. No se publican modelos recomendados concretos ni versiones minimas de CUDA.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual (serie RTX 40, RTX 30 o inferior) e incluso en GPUs integradas con memoria compartida, dado que el mayor artefacto no llega a 1 GB.
- CPU: existe una edicion de CPU del motor OpenStems que usa los mismos pesos, por lo que el despliegue sin acelerador es una opcion soportada.
- Opciones de despliegue: el runtime nativo de OpenStems es la via soportada. La model card advierte explicitamente de que la extension `.gguf` no garantiza compatibilidad con otros runtimes; no hay confirmacion de funcionamiento en llama.cpp, Ollama, vLLM ni TGI, y por el tipo de tarea (separacion de audio) estos motores no serian los adecuados en cualquier caso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con modelos de la misma categoria en la informacion disponible. El repositorio no incluye metricas frente a alternativas conocidas de separacion de fuentes (Demucs, Spleeter, Open-Unmix u otras) ni frente a servicios comerciales. La busqueda web realizada no devolvio ningun enlace relevante sobre el modelo o su ecosistema, por lo que no es posible construir una comparativa externa verificada.

Comparativa interna entre las cuatro variantes publicadas (datos procedentes unicamente del repositorio):

| Variante | Perfil declarado | Bytes extraidos | Precision | Uso previsto segun el autor |
|---|---|---|---|---|
| T400 | Fast | 270.145.408 | FP32 | Modo rapido |
| B400 | Pro | 206.407.520 | FP32 | Modo profesional |
| BS Karaoke | Ultra (receta karaoke) | 204.258.848 | FP32 | Separacion vocal/instrumental para karaoke |
| BS SW | Ultra (receta SW) | 698.768.832 | FP32 | Componente de la receta Ultra; funcion no detallada |

## Limitaciones y advertencias

- Licencia no disponible: no se declara licencia para los pesos. La model card indica que los ficheros siguen sujetos a los terminos upstream aplicables y que el empaquetado y la conversion de formato no sustituyen dichos terminos ni establecen una licencia nueva. Esto hace inviable un uso comercial sin aclaracion previa del titular de los derechos.
- Ausencia total de informacion de arquitectura y entrenamiento: no se puede evaluar el origen de los datos, posibles sesgos acusticos hacia generos musicales, idiomas o tipos de grabacion concretos, ni verificar afirmaciones de calidad.
- Sin benchmarks ni evaluacion objetiva publicada: no hay ninguna metrica de separacion que permita estimar la calidad real de los stemsni compararla con alternativas.
- Compatibilidad de runtime restringida: el propio autor advierte de que la extension `.gguf` no implica compatibilidad con runtimes distintos del suyo. Cualquier intento de cargar estos ficheros en otras herramientas es una apuesta no soportada.
- Riesgo de artefactos propios de la tarea: en separacion de fuentes es habitual encontrar filtraciones entre pistas, coloracion espectral y degradacion en pasajes densos. Al no publicarse evaluacion, no es posible acotar la magnitud de estos efectos en estos modelos concretos.
- Precision unica FP32: no hay variantes cuantizadas, lo que descarta optimizaciones de memoria tipicas en despliegues con GGUF y obliga a trabajar con los tamaños publicados.
- Idiomas declarados en, zh: las etiquetas se refieren a los idiomas del repositorio (probablemente documentacion), no a capacidades de procesamiento de habla. No hay evidencia de soporte de ASR multilingue.
- Sin actividad comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni debates publicos que permitan contrastar experiencia de uso.
- Fechas de creacion y actualizacion (2026-09-21) y una unica revision registrada: no hay historial de versiones que permita evaluar mantenimiento.
- El contenido de la model card se ha tratado unicamente como material de referencia de terceros, no como instrucciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenStems/OpenStems-Models
- T400 (perfil Fast): https://huggingface.co/OpenStems/OpenStems-Models/blob/main/T400-478978733353.zip
- B400 (perfil Pro): https://huggingface.co/OpenStems/OpenStems-Models/blob/main/B400-aa162a2eca9f.zip
- BS Karaoke (receta Ultra): https://huggingface.co/OpenStems/OpenStems-Models/blob/main/karaoke-4804181ac76c.zip
- BS SW (receta Ultra): https://huggingface.co/OpenStems/OpenStems-Models/blob/main/sw-68bed29111b6.zip
- Manifiesto de integridad: https://huggingface.co/OpenStems/OpenStems-Models/blob/main/model-files.json

No se han encontrado enlaces relevantes (papers, blogs, repositorios de codigo o demos) en la busqueda web realizada.

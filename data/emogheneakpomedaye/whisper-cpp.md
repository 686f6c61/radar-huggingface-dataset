# EmogheneAkpomedaye/Whisper.cpp

## Resumen

Este repositorio de HuggingFace no es un modelo nuevo, sino una recopilacion de los pesos de los modelos Whisper de OpenAI convertidos al formato ggml para su uso con whisper.cpp, la implementacion en C/C++ desarrollada por Georgi Gerganov. La cuenta EmogheneAkpomedaye actua como repositorio espejo (mirror) del catalogo oficial de modelos convertidos que ggerganov publica, e incluye las variantes tiny, base, small, medium, large-v1, large-v2, large-v3 y large-v3-turbo, cada una en version multilingue y, en varios casos, en version solo-ingles (.en).

Whisper es un sistema de reconocimiento automatico de voz basado en una arquitectura transformer encoder-decoder (no es un modelo MoE ni un SSM). Los tamanos van desde aproximadamente 39 millones de parametros en tiny hasta unos 1550 millones en large, con la variante large-v3-turbo situada en torno a 809 millones al reducir el numero de capas del decodificador. El modelo resuelve tareas de transcripcion multilingue y traduccion de voz a texto.

Su relevancia practica radica en que el formato ggml permite ejecutar estos modelos en CPU y en hardware de gama de consumo sin dependencias pesadas de framework, lo que lo convierte en una pieza habitual en aplicaciones de transcripcion local, privada y de bajo coste. El repositorio ocupa 31 GB en total (suma de todas las variantes) y no registra descargas ni likes en el momento de la consulta. El texto de la model card es una copia directa de la descripcion del catalogo de ggerganov/whisper.cpp, por lo que conviene tratar este repositorio como una re-publicacion no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) |
| Parametros totales | tiny ~39 M; base ~74 M; small ~244 M; medium ~769 M; large ~1550 M; large-v3-turbo ~809 M (cifras aproximadas publicadas por OpenAI para Whisper; la model card del repositorio no las detalla) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos procesadas por el encoder; segmentacion de audio mas largo mediante chunking en la implementacion |
| Tipos de cuantizacion | fp16 sin cuantizar; q5_0; q5_1; q8_0 (formato ggml) |
| Idiomas soportados | No disponible en la model card; las variantes multilingues de Whisper cubren del orden de 99 idiomas segun OpenAI; las variantes .en son solo-ingles |
| Licencia | MIT |
| Formato de pesos | ggml (ficheros .bin para whisper.cpp) |

## Arquitectura y entrenamiento

Whisper es un transformer de tipo encoder-decoder entrenado para tareas de reconocimiento y traduccion de voz. El encoder transforma una representacion log-Mel del audio en una secuencia de caracteristicas y el decoder autoregresivo genera el texto, con tokens especiales para marcar idioma, tarea (transcribir o traducir) y marcas de tiempo. El modelo procesa audio en ventanas fijas de 30 segundos. Las diferencias entre variantes (tiny, base, small, medium, large) corresponden a cambios en el numero de capas, la anchura de los bloques y las cabezas de atencion.

Segun la documentacion publica de OpenAI, los modelos originales se entrenaron sobre aproximadamente 680 000 horas de audio etiquetado, en su mayoria de origen web, con una mezcla multilingue y datos de subtitulos. La informacion proporcionada en este repositorio no incluye detalles sobre el dataset, el numero exacto de tokens ni si hubo etapas de RLHF o DPO, por lo que esos puntos deben considerarse "no disponibles" a partir de esta ficha. Las variantes large-v1, large-v2 y large-v3 corresponden a iteraciones sucesivas del modelo grande, y large-v3-turbo recorta el decodificador para acelerar la inferencia a costa de una ligera variacion en la calidad. La conversion a ggml no reentrena el modelo: solo transforma y cuantiza los pesos originales para optimizar su ejecucion.

## Capacidades

- Transcripcion automatica de voz (ASR) en multiples idiomas para las variantes multilingues.
- Traduccion de voz a texto en ingles a partir de audio en otros idiomas (tarea translate).
- Generacion de marcas de tiempo a nivel de segmento y de palabra (esta ultima mediante utilidades de whisper.cpp o librerias derivadas).
- Deteccion automatica del idioma del audio en los modelos multilingues.
- Variantes solo-ingles (.en) optimizadas para transcripcion en ingles.
- Variante small.en-tdrz (ajuste especifico) incluida en el catalogo.
- Ejecucion sin conexion en CPU o GPU mediante whisper.cpp.
- No soporta tool calling ni function calling; no es un modelo de agentes ni un modelo de lenguaje de proposito general.
- No incorpora modo de razonamiento (thinking mode), vision ni audio de salida.

## Casos de uso

- Transcripcion local de reuniones: usar large-v3 o large-v3-turbo en un equipo de sobremesa para convertir audio a texto sin enviar datos a servicios en la nube, aprovechando el formato ggml y la ejecucion offline.
- Subtitulado de video: generar subtitulos y marcas de tiempo en lote; las variantes medium o large ofrecen mejor precision, mientras que tiny o base permiten procesar grandes volumenes rapido.
- Aplicaciones de accesibilidad: transcripcion en tiempo real embebida en una aplicacion de escritorio o movil, usando tiny o base en hardware modesto por su bajo consumo de memoria.
- Traduccion de audio a texto en ingles: emplear la tarea de traduccion de Whisper para transcribir y traducir entrevistas o ponencias en otros idiomas.
- Asistentes de voz embebidos: integrar base.en o small.en en dispositivos con recursos limitados para comandos de voz en ingles.
- Procesamiento por lotes de archivos de audio: indexar y buscar en archivos de audio de archivos historicos mediante transcripcion masiva con cuantizacion q5 o q8 para reducir el espacio en disco.
- Investigacion en ASR: usar la misma familia de modelos con distintas cuantizaciones para medir el efecto de q5_0, q5_1 y q8_0 sobre la tasa de error (WER) frente al modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio es una copia de la descripcion del catalogo de ggerganov/whisper.cpp y solo incluye tamanos en disco y hashes SHA de cada fichero, sin cifras de WER, MMLU ni otras metricas. Para valores de referencia habria que consultar los informes tecnicos de OpenAI sobre Whisper, que no forman parte de la informacion proporcionada.

## Requisitos de hardware

- El formato ggml con whisper.cpp esta disenado para ejecucion en CPU, por lo que las variantes pequenas funcionan sin GPU dedicada.
- tiny (75 MiB en fp16, 31-42 MiB cuantizado): cabe en practicamente cualquier equipo, incluidos dispositivos embebidos y moviles.
- base (142 MiB fp16, 57-78 MiB cuantizado): cabe en equipos de gama baja sin GPU.
- small (466 MiB fp16, 181-252 MiB cuantizado): ejecutable en CPU moderna y en cualquier GPU de gama de consumo.
- medium (1,5 GiB fp16, 514-785 MiB cuantizado): requiere del orden de 2-3 GiB de memoria en fp16; comodo en GPUs tipo RTX 3060/4060 y superiores.
- large / large-v3 (2,9 GiB fp16, 1,1-1,5 GiB cuantizado): requiere del orden de 3-4 GiB de VRAM en fp16; cabe en GPUs de consumo con 6-8 GiB o mas (RTX 3060, 4070, etc.) y en GPUs de datacenter (A100, H100) para lotes de gran tamano.
- large-v3-turbo (1,5 GiB fp16, 547-834 MiB cuantizado): la opcion con mejor relacion velocidad/memoria dentro de la gama alta.
- La model card no incluye cifras de latencia ni de throughput; el rendimiento dependera del hardware, del backend (CPU, CUDA, Metal, Vulkan) y del grado de cuantizacion.
- Opciones de despliegue: whisper.cpp es el entorno de referencia para estos ficheros ggml; tambien existen envoltorios y librerias derivadas compatibles con formatos equivalentes, aunque no se detallan en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny/base (esta familia) | ~39 M / ~74 M | Ventanas de 30 s | Multilingue y .en | MIT | Formato ggml via whisper.cpp |
| Whisper large-v3 (esta familia) | ~1550 M | Ventanas de 30 s | Multilingue | MIT | Formato ggml via whisper.cpp |
| Whisper large-v3-turbo (esta familia) | ~809 M | Ventanas de 30 s | Multilingue | MIT | Formato ggml via whisper.cpp |
| faster-whisper (CTranslate2) | Equivalentes a Whisper | Ventanas de 30 s | Multilingue | MIT | Requiere conversion a formato CTranslate2 |
| distil-whisper | Variante destilada de Whisper large | Ventanas de 30 s | Principalmente ingles | MIT | Pesos en safetensors en HuggingFace |

No se dispone en la informacion proporcionada de datos de rendimiento comparado entre estas opciones; la comparativa anterior se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Este repositorio es una re-publicacion (mirror) no oficial del catalogo de ggerganov/whisper.cpp; la autoria real de los modelos y de la conversion corresponde a OpenAI (modelos) y a Georgi Gerganov (conversion y runtime).
- No registra descargas ni likes, lo que sugiere que no es la fuente canonica; conviene usar el repositorio oficial de ggerganov/whisper.cpp para produccion.
- Riesgo de alucinacion: Whisper puede inventar texto en fragmentos con ruido, silencio o audio poco claro; es un comportamiento documentado de la familia.
- Sesgo de idioma: el rendimiento varia notablemente entre idiomas y acentos; las variantes multilingues no tienen la misma calidad en todos los idiomas.
- Las variantes .en no transcriben otros idiomas correctamente.
- La cuantizacion (q5_0, q5_1, q8_0) reduce el uso de memoria pero puede degradar ligeramente la precision frente al modelo fp16.
- Contexto limitado a ventanas de 30 segundos por pasada; los audios largos requieren segmentacion, lo que puede introducir errores en los limites de los cortes.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright; verificar los terminos de los pesos originales de OpenAI.
- El repositorio ocupa 31 GB y contiene hashes SHA por fichero; descargar variantes completas sin cuantizar consume un espacio considerable.
- La fecha de creacion indicada (2026-10-13) es posterior a la fecha de consulta habitual de estos catalogos; conviene verificar la integridad de los ficheros frente a los hashes oficiales antes de desplegarlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EmogheneAkpomedaye/Whisper.cpp
- Catalogo oficial de modelos convertidos: https://huggingface.co/ggerganov/whisper.cpp/tree/main
- Repositorio de whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Informacion de modelos de whisper.cpp: https://github.com/ggerganov/whisper.cpp/tree/master/models

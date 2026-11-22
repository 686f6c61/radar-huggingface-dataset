# phucnht/LoxiaWhisper

## Resumen

LoxiaWhisper es una distribucion en formato GGML para whisper.cpp de los pesos de PhoWhisper, el sistema de reconocimiento automatico del habla (ASR) para vietnamita desarrollado por VinAI Research. El autor de esta ficha en Hugging Face, phucnht, no entrena ningun modelo nuevo: convierte los pesos originales de PhoWhisper con el script `convert-h5-to-ggml.py` de whisper.cpp y los publica para que la aplicacion de transcripcion Loxia pueda ejecutarlos en local. El repositorio incluye tres variantes de tamano (base, small y medium) que suman 2,2 GB en total.

El modelo resuelve el problema de transcribir audio en vietnamita sin depender de servicios en la nube, ya que el formato GGML permite inferencia en CPU y en GPU de consumo mediante whisper.cpp. La relevancia practica esta en que PhoWhisper es uno de los pocos sistemas ASR publicos especializados en vietnamita con resultados competitivos frente al Whisper original, y esta conversion facilita su integracion en aplicaciones de escritorio y moviles.

La arquitectura subyacente es la de OpenAI Whisper (transformer encoder-decoder con atencion, entrenado sobre espectrogramas Mel), en sus variantes base, small y medium. La ventana de contexto de audio es de 30 segundos por segmento, tal como en Whisper. La licencia es BSD 3-Clause, heredada de PhoWhisper, y el unico idioma declarado es el vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) |
| Parametros totales | no disponible (tres variantes: base, small y medium) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento |
| Tipos de cuantizacion | GGML sin cuantizar en los ficheros publicados (base 148 MB, small 488 MB, medium 1,53 GB); whisper.cpp permite cuantizar posteriormente |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | BSD 3-Clause |
| Formato de pesos | GGML (`.bin`) para whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder que procesa espectrogramas Mel de 80 canales y genera tokens de texto de forma autorregresiva, con tokens especiales de idioma, tarea y marcas de tiempo. Las tres variantes publicadas corresponden a los tamanos base, small y medium de la familia Whisper. El modelo no introduce innovaciones arquitectonicas propias: es una conversion directa de los pesos de PhoWhisper sin modificacion alguna, segun indica el autor.

El entrenamiento original corresponde a PhoWhisper de VinAI, publicado en el ICLR 2024 Tiny Papers track. La model card de esta conversion no detalla el volumen de datos, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; esa informacion debe consultarse en la publicacion y el repositorio de PhoWhisper. Un detalle tecnico relevante es que los modelos se ajustaron sin tokens de marca de tiempo: si se les pide timestamps, anaden una palabra espuria al inicio de cada segmento y notifican segmentos de 30 segundos, por lo que la decodificacion debe hacerse con `-nt` (sin timestamps) o con `no_timestamps=true` en whisper-server.

## Capacidades

- Reconocimiento automatico del habla en vietnamita a partir de audio, con salida de texto.
- Transcripcion por segmentos de hasta 30 segundos de audio.
- Ejecucion local en CPU y GPU mediante whisper.cpp, sin dependencia de API externa.
- Tres tamanos de modelo para ajustar el equilibrio entre precision y recursos: base (148 MB), small (488 MB) y medium (1,53 GB).
- Integracion con `whisper-cli` y `whisper-server` de whisper.cpp.
- No soporta marcas de tiempo fiables (limitacion de entrenamiento, ver seccion de limitaciones).
- No se declaran capacidades de traduccion, diarizacion de hablantes ni deteccion de idioma mas alla del vietnamita.

## Casos de uso

- Transcripcion de reuniones y entrevistas en vietnamita: el modelo procesa audio segmentado en tramos de hasta 30 segundos y genera texto plano, adecuado para actas y notas internas ejecutadas en local.
- Subtitulado de contenido audiovisual vietnamita: aunque no produce timestamps fiables, puede combinarse con un segmentador de voz externo que aporte los tiempos por tramo y usar el modelo solo para el texto.
- Aplicaciones de escritorio de dictado: la variante small (488 MB) cabe en un portatil sin GPU y permite dictado offline en vietnamita con latencia aceptable en CPU.
- Procesamiento por lotes de archivos de audio en servidores: `whisper-server` acepta peticiones con `no_timestamps=true`, lo que permite montar un servicio interno de transcripcion sin coste por token.
- Investigacion en ASR de bajo recurso: sirve como linea base reproducible para comparar con otros sistemas ASR en vietnamita, dado que los ficheros son reproducibles byte a byte desde fuentes fijadas.
- Integracion en pipelines de analitica de voz: transcripcion de llamadas de atencion al cliente en vietnamita para alimentar busquedas y clasificacion de texto posterior.
- Prototipado en dispositivos con recursos limitados: la variante base (148 MB) permite pruebas rapidas en entornos con poca memoria antes de escalar a medium.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; como referencia de orden de magnitud, los ficheros ocupan 148 MB (base), 488 MB (small) y 1,53 GB (medium) en disco, y la inferencia en whisper.cpp requiere memoria adicional para el contexto de audio y los estados intermedios.
- GPU recomendadas: no disponible en la informacion proporcionada. whisper.cpp soporta aceleracion por CUDA, Metal y Vulkan, pero la model card no especifica GPUs probadas.
- GPU de consumo: las tres variantes, por tamano de fichero, son compatibles con GPUs de consumo con suficiente memoria libre; la variante base y small son las mas adecuadas para equipos modestos.
- Despliegue: whisper.cpp mediante `whisper-cli` y `whisper-server`. No se mencionan integraciones con vLLM, TGI ni Ollama, que no aplican a modelos ASR en formato GGML.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LoxiaWhisper (esta ficha) | base, small y medium (cifras exactas no disponibles) | 30 s por segmento | vietnamita | BSD 3-Clause | GGML |
| Whisper de OpenAI | tiny, base, small, medium, large | 30 s por segmento | multilingue | MIT | PyTorch, GGML, entre otros |
| PhoWhisper (VinAI) | base, small, medium, large | 30 s por segmento | vietnamita | BSD 3-Clause | PyTorch (Hugging Face) |

LoxiaWhisper se diferencia de Whisper en que esta especializado en vietnamita y de PhoWhisper en que se distribuye ya convertido a GGML para whisper.cpp. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sin marcas de tiempo: los modelos se ajustaron sin tokens de timestamp; si se solicitan, anaden una palabra espuria al inicio de cada segmento y notifican 30 segundos por segmento. Es obligatorio decodificar con `-nt` o `no_timestamps=true`.
- Un solo idioma: solo vietnamita; no se declara soporte multilingue.
- Riesgo de alucinacion: como cualquier modelo de la familia Whisper, puede generar texto plausible en tramos con ruido, silencio o audio no inteligible; no hay evaluacion publicada en esta ficha.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al ser una conversion de PhoWhisper, los sesgos del modelo original se heredan.
- Licencia: BSD 3-Clause permite uso comercial con atribucion y conservacion del aviso de copyright; debe citarse PhoWhisper (VinAI) y, por herencia, OpenAI Whisper (MIT).
- Afiliacion: PhoWhisper no esta afiliado ni respalda este proyecto; la conversion es un trabajo independiente de phucnht.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/phucnht/LoxiaWhisper
- Repositorio de la aplicacion Loxia: https://github.com/phucnht/loxia
- PhoWhisper (VinAI Research): https://github.com/VinAIResearch/PhoWhisper
- Paper de PhoWhisper (ICLR 2024 Tiny Papers): no disponible como enlace directo en la informacion proporcionada
- whisper.cpp: no disponible como enlace directo en la informacion proporcionada

# otter-app/zipformer2-66m-streaming-sk-gguf

## Resumen

zipformer2-66m-streaming-sk-gguf es un modelo de reconocimiento automatico del habla (ASR) en formato GGUF, derivado de neurlang/zipformer2-66m-streaming-sk. Lo publica la organizacion otter-app como el artefacto que su aplicacion Otter descarga bajo demanda. No es un modelo entrenado desde cero por el publicador: es una copia sin modificaciones de vibe-app/zipformer2-66m-streaming-sk-gguf, a su vez convertida desde el modelo base de neurlang. La relevancia practica esta en el formato y el tamano: 66,6 millones de parametros en un unico fichero GGUF de unos 0,1 GB, pensado para inferencia local con la libreria ggml.

La arquitectura subyacente es Zipformer2, un encoder convolucional con atencion del linaje de los modelos de reconocimiento de voz de k2/icefall, disenado para transcripcion en streaming (procesamiento incremental de audio con baja latencia). El sufijo "sk" del identificador sugiere un modelo orientado al eslovaco, aunque la model card no confirma los idiomas soportados ni el conjunto de datos de entrenamiento. La cuantizacion disponible en el repositorio es q8_0.

Para un desarrollador, el interes esta en la combinacion de tamano minimo, licencia permisiva (CC-BY-4.0) y formato GGUF: permite integrar transcripcion de voz en aplicaciones de escritorio o moviles sin GPU dedicada y sin depender de APIs en la nube. La contrapartida es la ausencia casi total de documentacion tecnica y de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (encoder convolucional con atencion, familia k2/icefall); streaming |
| Parametros totales | 66.599.746 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de streaming no documentada) |
| Tipos de cuantizacion | q8_0 (fichero zipformer2-66m-streaming-sk-q8_0.gguf) |
| Idiomas soportados | no disponible (el sufijo "sk" sugiere eslovaco, sin confirmar) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (libreria ggml) |

## Arquitectura y entrenamiento

Zipformer2 es la segunda generacion de la arquitectura Zipformer, un encoder para reconocimiento de voz que combina bloques convolucionales con mecanismos de atencion y conexiones entre etapas a distintas resoluciones temporales. Esta disenado explicitamente para inferencia en streaming: procesa el audio por fragmentos y emite hipotesis parciales, lo que lo hace apto para transcripcion en tiempo real. El modelo tiene 66,6 millones de parametros, un orden de magnitud propio de modelos ASR ligeros para despliegue en dispositivos.

No hay informacion disponible sobre el numero de horas de audio de entrenamiento, la composicion del dataset, el tokenizer ni si se aplicaron tecnicas de ajuste como RLHF o destilacion. El modelo base neurlang/zipformer2-66m-streaming-sk y su model card serian la fuente autoritativa, pero su contenido no forma parte de la informacion proporcionada. La conversion a GGUF no altera los pesos, segun la propia model card del publicador.

## Capacidades

- Reconocimiento automatico del habla con salida de texto a partir de audio, en modo streaming (transcripcion incremental).
- Inferencia local mediante la libreria ggml, sin dependencia de frameworks de Python en tiempo de ejecucion.
- Modelo ligero (66,6 M de parametros) adecuado para entornos con recursos limitados.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico; no es un modelo de lenguaje generativo.
- No se documenta capacidad multilingue; el identificador apunta a un unico idioma (probablemente eslovaco).
- No se documentan modos especiales (thinking, vision, audio adicional) mas alla de la entrada de audio propia del ASR.

## Casos de uso

- Transcripcion en tiempo real en aplicaciones de escritorio: el caracter streaming del modelo permite mostrar subtitulos conforme se habla, con un coste de memoria minimo gracias al fichero q8_0 de unos 0,1 GB.
- Dictado por voz en herramientas ofimaticas o editores: al ejecutarse con ggml en CPU, se puede empaquetar dentro de una aplicacion sin exigir GPU ni conexion a internet.
- Subtitulado de reuniones o clases: integrado en un pipeline que captura audio del sistema y lo pasa por fragmentos al modelo, generando transcripciones parciales de baja latencia.
- Asistentes de voz embebidos en dispositivos de bajos recursos (Raspberry Pi, portatiles antiguos): el tamano del modelo y la cuantizacion q8_0 lo hacen viable donde un modelo ASR grande no cabria.
- Preprocesado de audio para pipelines de datos: transcripcion masiva de grabaciones en local antes de indexarlas o analizarlas, evitando enviar audio a servicios externos por motivos de privacidad.
- Prototipado de interfaces de voz: al ser un artefacto GGUF descargable bajo demanda por la app Otter, sirve como punto de partida para validar una experiencia de voz antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula en GPU; el fichero q8_0 ocupa del orden de 0,1 GB y la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no se requieren; cualquier GPU con soporte ggml puede acelerar la inferencia, pero el modelo esta pensado para CPU.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada; el limite practico es la RAM disponible (unos cientos de MB incluyendo el runtime).
- Opciones de despliegue: libreria ggml (formato nativo del fichero), integracion en la app Otter (https://github.com/victorfu/otter); otros runners compatibles con GGUF para ASR no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| zipformer2-66m-streaming-sk-gguf | 66,6 M | no disponible | GGUF | CC-BY-4.0 | Objeto de esta ficha; streaming, orientado a un idioma |
| neurlang/zipformer2-66m-streaming-sk | 66,6 M | no disponible | no disponible | no disponible en la informacion | Modelo base del que se convierte este GGUF |
| vibe-app/zipformer2-66m-streaming-sk-gguf | 66,6 M | no disponible | GGUF | no disponible en la informacion | Copia identica upstream de la que deriva este repositorio |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de otros autores en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion minima: la model card solo indica el origen y el hash SHA-256; no hay informacion sobre datos de entrenamiento, idioma exacto ni evaluacion.
- Idiomas: el sufijo "sk" sugiere eslovaco, pero no esta confirmado; usarlo con otro idioma puede degradar gravemente la transcripcion.
- Riesgo de alucinacion y errores de transcripcion: como todo modelo ASR, puede producir palabras plausibles que no se dijeron, especialmente con ruido de fondo o acentos no vistos en entrenamiento.
- Sesgos: no se documentan sesgos conocidos, pero al no conocer el dataset de entrenamiento no se puede evaluar su cobertura de acentos, generos o edades.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar al autor original. Conviene revisar la licencia del modelo base neurlang, ya que la model card remite a ella.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Al ser una copia de otro repositorio, las actualizaciones y el soporte dependen del proyecto upstream; verificar el hash SHA-256 antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/otter-app/zipformer2-66m-streaming-sk-gguf
- Modelo base: https://huggingface.co/neurlang/zipformer2-66m-streaming-sk
- Repositorio upstream del GGUF: https://huggingface.co/vibe-app/zipformer2-66m-streaming-sk-gguf
- Aplicacion Otter: https://github.com/victorfu/otter

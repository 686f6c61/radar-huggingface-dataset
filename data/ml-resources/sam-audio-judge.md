# ml-resources/sam-audio-judge

## Resumen

SAM-Audio Judge es un modelo de evaluacion automatica de calidad orientado a medir el resultado de tareas de separacion de audio guiadas por texto. Lo desarrolla Meta (Facebook) dentro del ecosistema SAM Audio, y el repositorio analizado (`ml-resources/sam-audio-judge`) es un espejo no oficial del original `facebook/sam-audio-judge` con la licencia intacta (SAM License). El modelo resuelve un problema concreto: dada una descripcion textual, un audio de entrada y un audio separado, devuelve cuatro metricas continuas de calidad (overall, recall, precision y faithfulness) que cuantifican si la separacion captura el sonido objetivo, si introduce sonido no deseado y si el material extraido suena fiel al original.

Tecnicamente se trata de un modelo multimodal de audio y texto de aproximadamente 1.533.794.568 parametros (unos 1,53 mil millones), distribuido en formato safetensors y con un peso de repositorio de 12,3 GB. Su uso se realiza a traves de la libreria `sam_audio`, con las clases `SAMAudioJudgeModel` y `SAMAudioJudgeProcessor`, y esta pensado como componente de evaluacion dentro de un pipeline que tambien incluye el modelo de separacion `facebook/sam-audio-large`.

Su relevancia actual es doble: por un lado, cubre un hueco habitual en los pipelines de audio, donde la evaluacion de la separacion solia depender de metricas clasicas poco alineadas con la semantica de la descripcion textual; por otro, permite cerrar el ciclo separar-evaluar de forma programatica. Conviene tener en cuenta que el checkpoint esta sujeto a solicitud de acceso (gated) y que no se han publicado datos de arquitectura interna, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de audio y texto; el README no detalla la arquitectura interna) |
| Parametros totales | 1.533.794.568 (aproximadamente 1,53 mil millones) |
| Parametros activos | no aplica (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | SAM License (`license: other`, `license_name: sam-license`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 12,3 GB |
| Pipeline declarado | no disponible |
| Acceso | restringido, requiere solicitud de acceso al repositorio de checkpoints |
| Dependencia principal | libreria `sam_audio` (PyTorch y torchaudio) |
| Modelo complementario | `facebook/sam-audio-large` (separacion de audio) |
| Autor del repositorio | ml-resources (espejo no oficial de facebook/sam-audio-judge) |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo mas alla de su naturaleza multimodal: el procesador `SAMAudioJudgeProcessor` acepta simultaneamente una descripcion textual, el audio de entrada y el audio separado, y el modelo devuelve cuatro tensores de forma `(batch_size, 1)`. Esto implica la existencia de al menos un codificador de audio y un codificador de texto cuyas representaciones se combinan para producir las puntuaciones. No se detalla el numero de capas, la dimension oculta, el tipo de atencion ni si se emplea un cabezal de regresion multiple (una salida por metrica) o alguna forma de comparticion entre las cuatro cabeceras.

Tampoco hay datos publicos en la informacion proporcionada sobre el volumen de tokens de audio o texto empleados en el entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. El unico rastro documental es la referencia al paper `arxiv:2512.18099` incluida en las etiquetas del repositorio. El modelo se presenta en modo evaluacion (`eval()`) y su inferencia se ejecuta bajo `torch.inference_mode()`, lo que confirma que no esta pensado para ajuste fino ligero en el propio flujo de uso, sino como evaluador de solo lectura.

## Capacidades

- Evaluacion de separacion de audio guiada por texto: compara descripcion, audio original y audio separado, y emite cuatro metricas continuas.
- Metrica `overall`: valor agregado de calidad global de la separacion.
- Metrica `recall`: mide cuanto del sonido objetivo se ha capturado en la separacion.
- Metrica `precision`: mide la pureza de la separacion, es decir, cuanto sonido no deseado se ha colado.
- Metrica `faithfulness`: mide la similitud del sonido extraido con su contrapartida en el audio de entrada.
- Procesamiento por lotes: el procesador acepta listas de descripciones, audios de entrada y audios separados, devolviendo resultados con forma `(batch_size, 1)`.
- Entrada flexible de audio: admite rutas de fichero o tensores de forma `(1, num_samples)`.
- Integracion directa con SAM Audio: existe un ejemplo completo que ejecuta la separacion con `facebook/sam-audio-large` y a continuacion la evalua.
- No se documenta en la informacion disponible soporte de tool calling, function calling, uso agentico, modo de razonamiento explicito ni capacidades de vision o de generacion de texto.

## Casos de uso

- Evaluacion automatica de pipelines de separacion: en un flujo que use SAM Audio para aislar una fuente sonora descrita en texto, el Judge actua como paso final de control de calidad y devuelve puntuaciones numericas por cada resultado, evitando revision manual muestra a muestra.
- Filtrado y curacion de datasets: al construir un corpus de audio separado (por ejemplo, voces limpias para entrenar un sistema de reconocimiento de habla), se puede usar el Judge para descartar automaticamente las separaciones con `precision` o `faithfulness` bajas.
- Comparacion de checkpoints e hiperparametros: durante el desarrollo de un modelo de separacion, las cuatro metricas permiten ordenar sistematicamente variantes e iteraciones sobre un mismo conjunto de validacion, en lugar de recurrir a inspeccion auditiva subjetiva.
- Control de calidad en doblaje y edicion de video: antes de publicar una pista de dialogo extraida, el Judge verifica que la pista corresponde realmente a la descripcion usada para la separacion, lo que ayuda a detectar fallos del separador en escenas con musica o ruido de fondo.
- Limpieza de audio para podcast y grabaciones de voz: se puede medir si el aislado de una voz concreta conserva su timbre original (`faithfulness`) y si ha arrastrado sonidos ajenos (`precision`), y decidir si la pista es apta para publicacion o requiere reproceso.
- Investigacion en separacion guiada por lenguaje: el modelo sirve como metrica de referencia alineada con la descripcion textual, lo que facilita comparar propuestas academicas frente a una misma linea base con un criterio consistente.
- Monitorizacion continua en produccion: integrado en un servicio de procesamiento de audio, el Judge puede emitir alertas cuando la calidad media de las separaciones cae por debajo de un umbral definido por el equipo.
- Auditoria de catalogos musicales o de archivos de archivo: permite comprobar de forma masiva si una separacion instrumental o vocal conserva la fidelidad respecto al original antes de reutilizar el material.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas comparativas, valores de correlacion con juicios humanos, ni mediciones de latencia o throughput. Tampoco se ofrecen cifras de rendimiento frente a metricas clasicas de calidad de audio. Cualquier evaluacion cuantitativa del modelo requiere ejecutarlo sobre un conjunto propio.

## Requisitos de hardware

- Parametros: 1.533.794.568, aproximadamente 1,53 mil millones. En precision de 32 bits los pesos ocupan unos 6,1 GB; en 16 bits, unos 3,1 GB. El repositorio completo pesa 12,3 GB, lo que sugiere mas de una copia de los pesos o ficheros adicionales.
- VRAM estimada: el dato exacto no esta disponible. Como referencia de orden de magnitud, la inferencia en 16 bits con el codificador de audio y los tensores intermedios suele requerir del orden de 4 a 8 GB, cifra que no debe tomarse como medicion oficial.
- GPU recomendadas: no disponible. Por tamano, cabria esperar funcionamiento comodo en GPUs de 12 GB o mas, como RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100, pero el dato no esta confirmado por el autor.
- GPU de consumo: es plausible que quepa en GPU de consumo, dado el tamano del modelo, pero no hay confirmacion oficial. Hay que tener en cuenta que el flujo completo necesita ademas `facebook/sam-audio-large` para la fase de separacion, con su propio consumo de memoria.
- Opciones de despliegue: la via documentada es PyTorch con la libreria `sam_audio`, cargando el modelo mediante `from_pretrained` y ejecutando la inferencia bajo `torch.inference_mode()`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, lo cual es coherente con que no se trata de un modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por muestra ni de muestras por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SAM-Audio Judge (facebook/sam-audio-judge) | Evaluador multimodal de audio y texto | 1,53 mil millones | no disponible | no disponible | SAM License | Acceso restringido mediante solicitud |
| SAM Audio Large (facebook/sam-audio-large) | Modelo de separacion de audio guiada por texto | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Repositorio publico en HuggingFace |
| Metricas clasicas de calidad de audio (PESQ, STOI, DNSMOS, ViSQOL) | Algoritmos de referencia, no modelos generativos | no aplica | no aplica | no disponible en la informacion proporcionada | dependen de cada implementacion | Ampliamente disponibles |
| Metricas basadas en embeddings audio-texto (por ejemplo, CLAP) | Modelo de representacion conjunta | no disponible | no disponible | no disponible en la informacion proporcionada | variable segun checkpoint | Variable |

No se dispone de cifras comparativas publicadas entre SAM-Audio Judge y estas alternativas en la informacion proporcionada. La diferencia funcional principal es que SAM-Audio Judge no separa audio ni genera texto: solo puntua la calidad de una separacion respecto a una descripcion, frente a las metricas clasicas, que no tienen en cuenta la descripcion textual.

## Limitaciones y advertencias

- No hay datos publicados sobre sesgos del modelo ni sobre el sesgo de su conjunto de evaluacion. Al depender de descripciones textuales, puede heredar sesgos presentes en la forma en que se redactan las descripciones.
- Riesgo de alucinacion en sentido estricto: no aplica, porque el modelo no genera texto libre. El riesgo equivalente es la falsa precision, es decir, que las cuatro metricas no correlacionen bien con la calidad percibida por una persona. Este extremo no esta validado en la informacion disponible.
- No se especifica la longitud de contexto ni la duracion maxima de audio admitida. Audios muy largos o descripciones poco especificas pueden degradar la fiabilidad de las puntuaciones.
- No se declaran los idiomas soportados. Se desconoce si las descripciones textuales deben estar en ingles, si funcionan en castellano o si el modelo es agnostico al idioma. No hay confirmacion oficial.
- Licencia SAM License (`license: other`): las condiciones concretas estan en el fichero `LICENSE` del repositorio. Hay que revisarlas antes de cualquier uso comercial, ya que no es una licencia de tipo Apache o MIT y puede imponer restricciones adicionales.
- El repositorio analizado es un espejo no oficial (`ml-resources/sam-audio-judge`), no una publicacion de Meta. No recibe mantenimiento por parte de los autores originales y no debe tratarse como fuente canonica. El original es `facebook/sam-audio-judge`.
- El checkpoint esta sujeto a acceso restringido: es necesario solicitar permiso y autenticarse con `huggingface-cli login` antes de poder descargarlo.
- Metricas sin escala documentada: la model card indica que valores mas altos son mejores, pero no especifica el rango teorico (por ejemplo, 0 a 1) ni umbrales recomendados, lo que dificulta fijar criterios de aceptacion en produccion.
- Sin benchmarks publicos ni validacion frente a juicios humanos en la informacion disponible, por lo que no es prudente usar las puntuaciones como unica senal de calidad sin un estudio previo de correlacion con el dominio objetivo.
- Requiere el modelo `facebook/sam-audio-large` para el flujo completo de separacion y evaluacion, lo que anade dependencias, consumo de memoria y posibles fallos en cascada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son del 15 de octubre de 2026, con un intervalo de menos de un minuto entre ambas. Esto sugiere que se trata de una copia recien publicada y sin validacion por parte de la comunidad.

## Enlaces

- Repositorio analizado: https://huggingface.co/ml-resources/sam-audio-judge
- Repositorio original: https://huggingface.co/facebook/sam-audio-judge
- Modelo de separacion complementario: https://huggingface.co/facebook/sam-audio-large
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2512.18099
- Fichero de licencia indicado en la model card: LICENSE (dentro del repositorio)
- Otros enlaces relevantes (documentacion, blogs, repos o demos): no disponibles en la informacion proporcionada

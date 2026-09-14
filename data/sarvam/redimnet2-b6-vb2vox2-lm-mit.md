# sarvam/redimnet2-b6-vb2vox2-lm-mit

## Resumen

ReDimNet2-b6 (vb2+vox2_v0, large-margin) es un modelo de reconocimiento de hablante: convierte audio de voz en un vector de embedding de 192 dimensiones que representa la identidad del locutor, no el contenido lingüístico. No es un modelo generativo ni un modelo de lenguaje; no produce texto ni respuestas. Este repositorio concreto, `sarvam/redimnet2-b6-vb2vox2-lm-mit`, es un espejo interno publicado por Sarvam AI de los pesos originales de Palabra.ai, alojados en el repositorio `PalabraAI/redimnet2` (commit `2a8d15f65b1dfb5d73fede2f11ee42bcccca3035`), bajo licencia MIT.

El espejo existe por dos motivos operativos declarados por el propio autor de la ficha: evitar que la construcción de imágenes de su servicio de doblaje dependa de la descarga de un asset de terceros en GitHub (una build tardó 63 minutos frente a una norma de 22), y fijar la procedencia de los pesos, ya que la reconciliación entre pods usa un umbral de similitud coseno fijo de 0,628 calibrado exactamente contra estos pesos. No se ha modificado ni el código ni la arquitectura: es una copia byte a byte.

El contenido del repositorio son 0,1 GB, de los cuales el checkpoint `b6-vb2+vox2_v0-lm.pt` ocupa aproximadamente 49 MB e incluye un diccionario con `model_config` y `state_dict`, junto al paquete de código `redimnet2/` necesario para instanciar `ReDimNet2Wrap` y la licencia MIT original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ReDimNet2, variante b6 (red convolucional para speaker verification); detalles de capas no disponibles |
| Parametros totales | no disponible (el checkpoint ocupa ~49 MB; con pesos fp32 equivaldria a ~12 M de parametros, estimacion no confirmada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de audio a 16 kHz mono, minimo 0,4 s por ventana |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible; el modelo opera sobre caracteristicas acusticas de locutor, no sobre idioma |
| Licencia | MIT (© 2026 Palabra.ai) |
| Formato de pesos | PyTorch `.pt` (diccionario con `model_config` y `state_dict`); no se distribuye GGUF ni safetensors |
| Dimension del embedding de salida | 192 (requiere normalizacion L2 antes de comparar) |
| Datos de entrenamiento | no disponibles; la nomenclatura del checkpoint (`vb2+vox2_v0`, `lm`) sugiere una mezcla de dos conjuntos de datos y un objetivo de margen grande, sin confirmar |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la familia ReDimNet2 y el identificador de configuracion `b6`, que corresponde a una de las escalas de la familia. Tampoco se especifican el numero de tokens de audio usados en el entrenamiento, la composicion exacta del dataset, ni si hubo etapas de ajuste fino con objetivos de margen (el sufijo `lm` de la ficha, descrito como "large-margin", apunta a un entrenamiento con margen, pero el autor no lo desarrolla). No se mencionan mecanismos de atencion lineal, decodificacion especulativa ni tecnicas equivalentes, que ademas no aplican a un modelo de embedding.

Lo unico verificable es la procedencia: el repositorio es una copia byte a byte del commit `2a8d15f65b1dfb5d73fede2f11ee42bcccca3035` del proyecto `PalabraAI/redimnet2`, con la misma licencia MIT. La ficha del autor indica explicitamente que no es un modelo de Sarvam y que no se ha modificado ni el codigo ni los pesos. El pipeline de inferencia consiste en cargar el checkpoint con `torch.load`, instanciar `ReDimNet2Wrap(**ckpt["model_config"])`, cargar el `state_dict` y llamar al modelo en modo `eval()`.

## Capacidades

- Extraccion de embeddings de identidad de locutor de 192 dimensiones a partir de audio de voz.
- Verificacion de hablante 1:1 mediante comparacion de similitud coseno entre dos embeddings.
- Identificacion de hablante 1:N mediante busqueda del vecino mas cercano en una base de embeddings.
- Diarizacion de audio al combinarse con un algoritmo de clustering externo sobre los embeddings.
- Funcionamiento independiente del idioma y del contenido: la representacion captura caracteristicas de locutor, no transcripcion.
- Reconciliacion entre procesos con umbral coseno calibrado en 0,628 para estos pesos concretos.
- Procesamiento de audio largo mediante muestreo de subventanas equiespaciadas en lugar de truncado a un prefijo.
- No dispone de generacion de texto, razonamiento, generacion de codigo, matematicas, vision, audio generation, tool calling ni modo de pensamiento.

## Casos de uso

- Diarizacion en un servicio de doblaje: el modelo, integrado en un pipeline de doblaje, etiqueta que segmentos pertenecen a cada hablante para asignar la voz doblada correcta; su uso con umbral coseno de 0,628 ya esta calibrado para este escenario en el servicio `dubbing-service`.
- Verificacion de identidad por voz en atencion telefonica: comparar el embedding de la llamada entrante contra el embedding de referencia del cliente para autenticacion adicional, siempre como factor secundario y con consentimiento explicito.
- Etiquetado de hablantes en transcripciones largas: tras un ASR como los de Sarvam, agrupar segmentos por locutor para producir transcripciones con atribucion de hablante.
- Indexacion y busqueda de archivos de audio por locutor: generar un embedding por grabacion y buscar por similitud coseno en una base vectorial para localizar todas las intervenciones de una persona en un archivo historico.
- Control de calidad en centros de contacto: agrupar llamadas por agente o por cliente para auditar guiones, tiempos de respuesta y cumplimiento sin depender de metadatos manuales.
- Personalizacion de TTS: seleccionar o condicionar la voz sintetizada segun el embedding del hablante de referencia, util en doblaje y en asistentes de voz personalizados.
- Deteccion de cambio de locutor en tiempo real: al procesar ventanas de al menos 0,4 s de audio a 16 kHz mono, emitir un aviso cuando la similitud entre ventanas consecutivas cae por debajo del umbral, util en moderacion de reuniones.
- Agrupacion de grabaciones por hablante en un corpus de investigacion: construir clusters de locutores antes de anotar o entrenar otros sistemas, con la advertencia de revisar el sesgo del corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de EER, minDCF ni comparaciones en VoxCeleb, y la busqueda web solo devuelve paginas corporativas de Sarvam AI ajenas a este modelo. El unico dato numerico operativo publicado es el umbral de similitud coseno de 0,628 usado para reconciliacion, calibrado especificamente contra estos pesos, que no equivale a una metrica de rendimiento sobre un conjunto de evaluacion publico.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 49 MB, por lo que la inferencia en fp32 cabe holgadamente en cualquier GPU con 1 GB o mas de memoria; no hay cifras oficiales publicadas.
- Inferencia en CPU: viable y suficiente para la mayoria de usos, dado el tamano reducido del modelo; el cuello de botella habitual sera el preprocesado de audio y la extraccion de caracteristicas, no la red.
- GPUs recomendadas: no hay recomendaciones del autor. Para procesamiento por lotes a gran escala, cualquier GPU de datacenter (A100, H100, L40S) o de consumo (RTX 3060 en adelante) es sobradamente suficiente; el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas para inferencia puntual.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y `huggingface_hub.snapshot_download`; exportacion a ONNX, TorchScript o TensorRT no documentada. No aplican servidores de modelos generativos como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.
- Restricciones de audio: 16 kHz mono, duracion minima de 0,4 s por ventana; para audio largo, muestrear subventanas equiespaciadas en lugar de truncar.

## Comparativa con modelos similares

Los datos de las alternativas que aparecen a continuacion no provienen de la informacion proporcionada en esta busqueda y deben verificarse antes de citarlos; se incluyen como orientacion de categoria.

| Modelo | Familia | Dimension del embedding | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sarvam/redimnet2-b6-vb2vox2-lm-mit (este modelo) | ReDimNet2 b6 | 192 | MIT | HuggingFace (espejo) | Checkpoint de ~49 MB, codigo incluido en el repo |
| ECAPA-TDNN (SpeechBrain, spkrec-ecapa-voxceleb) | TDNN con atencion de canal | 192 | Apache 2.0 (verificar) | HuggingFace / SpeechBrain | Referencia clasica en verificacion de hablante |
| WavLM base+ para SV (microsoft/wavlm-base-plus-sv) | Transformer auto-supervisado | no disponible | MIT (verificar) | HuggingFace | Mayor coste computacional que un CNN puro |
| ReDimNet original | ReDimNet | no disponible | no disponible | GitHub | Version previa de la familia sobre la que se construye ReDimNet2 |

La comparativa carece de cifras de rendimiento porque ninguna de las fuentes consultadas publica EER ni minDCF para este checkpoint concreto.

## Limitaciones y advertencias

- No es un modelo de Sarvam AI: es un espejo de un modelo de Palabra.ai. Cualquier atribucion a Sarvam como desarrollador es incorrecta.
- El identificador usado en el ejemplo de codigo de la model card (`sarvam/redimnet2-b6-vb2vox2-lm`) no coincide con el identificador real del repositorio (`sarvam/redimnet2-b6-vb2vox2-lm-mit`); conviene usar el identificador completo del repositorio para evitar fallos de descarga.
- El umbral coseno de 0,628 esta calibrado contra exactamente estos pesos; sustituir el checkpoint, cambiar la tasa de muestreo o alterar el preprocesado invalida ese umbral.
- Riesgo de degradacion con ruido de fondo, reverberacion, cambios de canal o codecs de telefonia, habitual en sistemas de embedding de locutor.
- Riesgo de degradacion con audio muy corto (por debajo de 0,4 s), con habla superpuesta y con musica o voz cantada.
- No se documentan sesgos demograficos ni evaluaciones por subgrupo (edad, genero, acento, idioma); antes de un uso en produccion hay que medir EER por subgrupo con datos propios.
- Uso biometrico: la verificacion de locutor es un dato biometrico y queda sujeta a normativa como el RGPD en la Union Europea y a legislacion especifica en otras jurisdicciones; requiere base legal, consentimiento y evaluacion de impacto.
- No apto para tareas generativas: no produce texto, codigo ni respuestas; intentar usarlo como modelo de lenguaje no tiene sentido.
- No hay informacion sobre la composicion del dataset de entrenamiento, lo que impide evaluar contaminacion o cobertura de acentos.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la responsabilidad sobre el uso biometrico recae en el integrador, no en el licenciante.
- El repositorio registra 0 descargas y 0 likes, y su fecha de creacion es posterior a la de la informacion de referencia; se trata de un artefacto operativo interno, no de una release mantenida para la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sarvam/redimnet2-b6-vb2vox2-lm-mit
- Repositorio original de Palabra.ai: https://github.com/PalabraAI/redimnet2
- Commit espejado: `2a8d15f65b1dfb5d73fede2f11ee42bcccca3035`
- Licencia MIT incluida en el repositorio: `LICENSE`
- Sarvam AI (plataforma): https://www.sarvam.ai/
- Modelos de Sarvam AI: https://www.sarvam.ai/models
- Indus by Sarvam (agentes y cookbooks): https://indus.sarvam.ai/
- Sarvam AI en Wikipedia: https://en.wikipedia.org/wiki/Sarvam_AI

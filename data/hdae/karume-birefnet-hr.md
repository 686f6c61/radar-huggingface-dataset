# hdae/karume-birefnet-hr

## Resumen

Karume BiRefNet HR es una distribución del checkpoint de segmentación de imagen BiRefNet_HR de ZhengPeng7, convertido al formato de contenedor del runtime de inferencia WebGPU Karume (una secuencia de partes `.krm` cuya primera parte contiene el grafo y los descriptores del modelo). No es un modelo nuevo ni un reentrenamiento: es una conversión no oficial que preserva los pesos originales en precisión f16 y los empaqueta para ejecutarse tal cual en el navegador y en Deno.

El modelo resuelve la eliminación de fondo de propósito general de alta resolución: recibe píxeles RGB8 y devuelve una máscara alfa de 8 bits del mismo tamaño que la imagen de entrada. La arquitectura subyacente es BiRefNet, descrita en el artículo arXiv:2401.03407, y el checkpoint base es la variante de alta resolución de propósito general.

La relevancia de esta distribución es operativa: incluye preprocesado y postprocesado en el propio pipeline (redimensionado a 1024 × 1024, normalización, sigmoid sobre los logits, escalado de la máscara a la resolución original y redondeo a 8 bits), de modo que el integrador no tiene que replicar la lógica upstream. Se ofrece en dos variantes según resolución de trabajo (`1024` y `2048`), cada una con la resolución grabada en el grafo. El repositorio ocupa 6,0 GB e incluye el manifiesto `karume.json` (versión `karume/5`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet (arXiv:2401.03407), convertida a grafo en contenedor Karume |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen) |
| Tipos de cuantización | `f16` (único quant disponible; valores propios del checkpoint, almacenados en f16 y calculados en f32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Contenedor Karume `.krm` (secuencia de partes con grafo embebido); no legible por transformers |

Otros datos relevantes: pipeline `image-segmentation`, tarea `background-removal`, etiqueta `webgpu`, exportador `karume/0.14.0`, tamaño del repo 6,0 GB, descarga del quant `f16` del modelo `1024` de 432 MiB (431 MiB compartidos).

## Arquitectura y entrenamiento

La arquitectura es BiRefNet, el modelo publicado en arXiv:2401.03407, en su checkpoint de alta resolución (`ZhengPeng7/BiRefNet_HR`). No se ha realizado reentrenamiento ni fine-tuning: la conversión solo cambia el contenedor y aplica reescrituras de grafo. Las reescrituras son de dos clases. Las primeras son puramente de layout y bit-exactas: windowing, el desplazamiento circular (*roll*) de ventanas desplazadas, el padding espacial y las fusiones de parches se pliegan en operaciones equivalentes. Las segundas son equivalentes salvo redondeo en coma flotante: la `BatchNorm2d` de inferencia se sustituye por una transformación afín por canal, el pooling a nivel de imagen del ASPP se convierte en una suma en dos etapas y la convolución 1×1 de la cola del decodificador se intercambia con el upsampling bilineal que la seguía (ambas operaciones son lineales y conmutan), lo que elimina dos intermedios a resolución completa.

No hay cuantización: el *quant seat* almacena los valores del checkpoint original, que ya está en f16. Los pesos de las capas lineales, convoluciones y embeddings de posición relativa se mantienen en f16 en almacenamiento y se calculan en f32; los pesos de muestreo de las convoluciones deformables (`regular_conv`), los sesgos y el resto de parámetros de normalización se ensanchan exactamente a f32, y la BatchNorm de inferencia es una afín por canal derivada en f32.

Sobre los datos de entrenamiento no se aporta detalle en la información disponible; la model card remite a la card upstream y al repositorio de BiRefNet, y advierte de que varios de los conjuntos usados (DIS5K, COD10K, HRSOD y otros) se distribuyen con fines de investigación. La resolución está grabada en el grafo (máscaras de ventana y constantes de padding por resolución), por lo que se selecciona con el parámetro `model` y no en tiempo de llamada. El modelo `1024` redimensiona a 1024 × 1024; el modelo `2048` conserva más detalle en los bordes a costa de más memoria de GPU y más tiempo.

## Capacidades

- Segmentación de imagen con eliminación de fondo: entrada RGB8 en row-major, 3 bytes por píxel, salida de una máscara alfa de 8 bits por píxel con las mismas dimensiones que la entrada.
- Un grafo y una llamada: el pipeline incluye el redimensionado al objetivo de la variante, la normalización con las constantes del checkpoint, el sigmoid sobre los logits, el escalado de la máscara a la resolución original y el redondeo a 8 bits, en el mismo orden e interpolación que upstream.
- Dos variantes por resolución: `1024` (por defecto) y `2048`, seleccionables mediante `model`.
- Precisión f16 con cómputo en f32 en las capas indicadas, sin pérdida por cuantización respecto al checkpoint original.
- Ejecución en navegador y Deno mediante WebGPU, con sesión de GPU persistente durante la vida del pipeline.
- Procesamiento por lotes secuencial: las llamadas concurrentes a `segment()` se encolan en lugar de ejecutarse en paralelo.
- Caché de pesos: se descargan una vez y se verifican contra `size` y `sha256` del manifiesto `karume.json`.
- No incluye decodificación de PNG/JPEG: el llamante debe usar `createImageBitmap` en el navegador o cualquier decodificador en Deno.
- No incluye composición: el pipeline devuelve la máscara, no el recorte; la decisión de aplicar alfa a un búfer RGBA, componer sobre un color plano o pasar por una etapa de decontaminación de color queda en manos del integrador.
- Sin capacidades de texto, razonamiento, código, matemáticas, audio, tool calling ni agentes; es un modelo puramente de visión.

## Casos de uso

- Edición de fotografía en el navegador: una aplicación web puede cargar la imagen con `createImageBitmap`, pasarla al pipeline y obtener la máscara alfa para composición sobre un fondo nuevo, sin enviar la imagen a un servidor, lo que elimina costes de subida y problemas de privacidad.
- Generación de avatares y fotos de producto: el modelo `1024` produce máscaras de calidad suficiente para catálogos y perfiles; el modelo `2048` se reserva para material donde el detalle del borde (pelo, tejidos, transparencias) es crítico.
- Herramientas de diseño gráfico y edición colaborativa: al ejecutarse en WebGPU dentro del navegador, la máscara se puede recalcular al cambiar la imagen sin latencia de red, integrándose en un canvas o en un `ImageData`.
- Procesamiento por lotes en Deno: pipelines de servidor o scripts de preprocesado que eliminan fondos de colecciones de imágenes, reutilizando la sesión de GPU para no recargar los pesos en cada imagen.
- Sustitución de fondo en videoconferencia o captura de cámara: la entrada es cualquier búfer RGB8, por lo que se puede alimentar con fotogramas decodificados y componer la máscara en tiempo real, sujeto al rendimiento de la GPU del cliente.
- Preprocesado para otros modelos: la máscara alfa generada puede alimentar etapas posteriores de recorte, decontaminación de color o entrenamiento de modelos de imagen que requieran segmentación previa.
- Aplicaciones con requisitos de privacidad o despliegue offline: al no depender de una API remota y cachear los pesos, funciona en entornos sin conexión una vez descargado el contenedor; conviene fijar la revisión (commit) para compilaciones reproducibles.
- Prototipado rápido de demos de segmentación: el paquete `jsr:@karume/models/birefnet` permite tener una demo funcional en pocas líneas, sin gestionar el grafo ni el preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de segmentación (IoU, S-measure, F-measure, MAE) ni cifras de latencia o throughput para el modelo `1024` o `2048`. Tampoco se aportan comparaciones con el checkpoint upstream más allá de la indicación de que no hay cuantización y de que las reescrituras son equivalentes salvo redondeo en coma flotante. El único dato de tamaño es la descarga del quant `f16` del modelo `1024`: 432 MiB (431 MiB compartidos).

## Requisitos de hardware

- El modelo requiere una GPU con soporte de WebGPU: navegador con WebGPU habilitado o Deno con acceso a GPU.
- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, los pesos del quant `f16` del modelo `1024` ocupan 432 MiB de descarga; a ello hay que sumar los intermedios de activación a resolución de trabajo, que no se detallan en la información proporcionada.
- El modelo `2048` consume más memoria de GPU y más tiempo que el `1024`, según advierte la propia model card, pero no se publican cifras.
- GPU recomendadas: no disponible. Solo se indica el requisito de WebGPU, sin lista de modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende de la implementación de WebGPU del navegador o del runtime.
- Despliegue: únicamente mediante el runtime Karume con el pipeline `birefnet/2` y el paquete `jsr:@karume/models/birefnet`. El contenedor no es legible por transformers, por lo que no se puede cargar directamente con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 6,0 GB; la descarga efectiva del quant `f16` del modelo `1024` es de 432 MiB (431 MiB compartidos), con caché verificada por `sha256`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución de trabajo | Cuantización | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| hdae/karume-birefnet-hr | BiRefNet | 1024 y 2048 (por variante) | f16 (sin cuantización) | MIT | Contenedor Karume `.krm`, WebGPU (navegador y Deno) |
| ZhengPeng7/BiRefNet_HR | BiRefNet | alta resolución (no detallada) | no disponible | MIT (según la información disponible) | Pesos upstream, cargables con el ecosistema estándar de PyTorch/transformers |
| ZhengPeng7/BiRefNet (variante general) | BiRefNet | no disponible | no disponible | MIT (según la información disponible) | Pesos upstream |

La comparación relevante es con el checkpoint upstream `ZhengPeng7/BiRefNet_HR`, del que esta distribución es una conversión: mismos pesos, misma licencia y sin reentrenamiento, con la diferencia de que aquí el modelo se ejecuta en WebGPU mediante Karume y con el pre/postprocesado incluido. No se dispone de datos de benchmarks ni de métricas que permitan comparar calidad frente a otras alternativas de eliminación de fondo, por lo que la comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por ZhengPeng; para producción conviene evaluar el checkpoint upstream directamente si se dispone de infraestructura PyTorch.
- Una resolución por modelo: la resolución está grabada en el grafo, de modo que no se puede cambiar en tiempo de llamada; hay que elegir entre `1024` y `2048` al cargar el pipeline.
- No lee PNG ni JPEG: la decodificación es responsabilidad del llamante; un decodificador distinto puede alterar los píxeles de entrada y, con ello, la máscara resultante.
- Devuelve solo la máscara: no realiza composición ni decontaminación de color; el integrador debe decidir cómo aplicar el alfa, y una composición ingenua puede dejar halos en los bordes.
- Dependencia de WebGPU: requiere un navegador o runtime con WebGPU disponible; entornos sin esta API no pueden ejecutar el modelo.
- Llamadas concurrentes en cola: no hay paralelismo entre peticiones dentro de un mismo pipeline, lo que limita el throughput en escenarios de alta concurrencia.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de segmentación incorrecta en imágenes fuera de la distribución de entrenamiento, con bordes imprecisos o regiones mal clasificadas.
- Sesgos: no se documentan sesgos específicos en la información disponible; al tratarse de un modelo entrenado sobre conjuntos de investigación (DIS5K, COD10K, HRSOD y otros), su comportamiento puede degradarse en dominios no representados.
- Licencia: el modelo se distribuye bajo MIT, con una copia literal de la licencia y los avisos de copyright aplicables en `LICENSE.md`. No obstante, los conjuntos de datos de entrenamiento upstream se distribuyen para fines de investigación, por lo que conviene verificar su compatibilidad con el uso comercial previsto.
- Reproducibilidad: sin fijar la revisión (commit), el pipeline sigue la rama `main` y una actualización futura del repositorio (renombrado de ficheros, nuevo formato de manifiesto) puede romper la aplicación.
- Sin métricas publicadas: no hay benchmarks de calidad ni de rendimiento que permitan estimar el comportamiento en producción antes de medirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hdae/karume-birefnet-hr
- Checkpoint base: https://huggingface.co/ZhengPeng7/BiRefNet_HR
- Artículo de BiRefNet: https://arxiv.org/abs/2401.03407
- Registro en free2aitools: https://free2aitools.com/model/hdae/karume-birefnet-hr
- Paquete del pipeline: `jsr:@karume/models/birefnet`
- Manifiesto de la distribución: `karume.json` (versión `karume/5`), incluido en el repositorio
- Licencia y avisos: `LICENSE.md` y `NOTICE.md`, incluidos en el repositorio

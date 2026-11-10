# egolearn/babycl-resnext50-krishnacam-seed2

## Resumen

BabyCL sobre KrishnaCam (seed 2) es un modelo de extraccion de caracteristicas visuales desarrollado por la organizacion EgoLearn. Se trata de un ResNeXt-50 entrenado con los objetivos visuales de BabyCL (aprendizaje autosupervisado) sobre el conjunto de datos KrishnaCam, un corpus de video egocentrico. El modelo no es un modelo de lenguaje: carece de codificador de texto y su proposito es generar representaciones de imagen para investigacion sobre aprendizaje de representaciones a partir de experiencia visual egocentrica.

El modelo cuenta con 35.801.104 parametros y se distribuye en formato safetensors con un tamano de repositorio de 0,1 GB. El checkpoint exportado corresponde al paso de optimizador 11900 de un entrenamiento en streaming con semilla 2, usando una cache de video BabyCL lossless a 224 pixeles y frecuencia de fotogramas nativa. La carga requiere una instalacion autorizada de EgoLearn con el extra `train`, ya que el repositorio de codigo es privado.

Su relevancia es acotada y de investigacion: preserva exactamente los tensores del checkpoint seleccionado y no anade resultados de evaluacion nuevos. La cabecera de clasificacion temporal identifica segmentos de entrenamiento, no clases semanticas de objetos, lo que limita su uso directo en tareas de vision convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (red neuronal convolucional) con objetivos de aprendizaje autosupervisado BabyCL |
| Parametros totales | 35.801.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con model.json y checksums.sha256) |

## Arquitectura y entrenamiento

La arquitectura es una ResNeXt-50, una CNN con bloques residuales y convoluciones agrupadas, adaptada para extraccion de caracteristicas visuales. El entrenamiento emplea los objetivos visuales de BabyCL, un marco de aprendizaje autosupervisado orientado a representaciones aprendidas desde experiencia visual egocentrica. El checkpoint registra el paso de optimizador 11900, resultado de un entrenamiento en streaming con semilla 2 sobre la cache de video BabyCL verificada como lossless a 224 pixeles y frecuencia de fotogramas nativa.

El repositorio excluye datos de entrenamiento, imagenes, capitulos, estado del optimizador y buffers de replay. La procedencia historica del entrenamiento que falta permanece marcada como no disponible. El export se verifico con la revision `7e9671a8820377e2860da8789df4be6ce63e939c` de EgoLearn y el SHA-256 del checkpoint de origen es `49c9473ee43648f96d677e2f205c64846d1fc79061ff614e4547057198497c31`.

## Capacidades

- Extraccion de caracteristicas de imagen (pipeline `feature-extraction`).
- Generacion de representaciones visuales a partir de fotogramas de video egocentrico.
- Clasificacion temporal de segmentos de entrenamiento mediante su cabecera temporal (no identifica clases semanticas de objetos).
- Aprendizaje autosupervisado: representaciones entrenadas sin etiquetas semanticas.
- No dispone de codificador de texto ni de capacidades de generacion de lenguaje.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues.

## Casos de uso

- Investigacion sobre representaciones visuales egocentricas: el modelo sirve como extractor de caracteristicas para estudiar como se aprenden representaciones a partir de experiencia visual en primera persona, aprovechando su entrenamiento especifico sobre KrishnaCam.
- Extraccion de embeddings para analisis de video egocentrico: se pueden obtener vectores de caracteristicas por fotograma para tareas posteriores de agrupamiento o recuperacion, dado que el modelo expone representaciones de imagen.
- Reproducibilidad de experimentos: al preservar exactamente los tensores del checkpoint 11900 y publicar checksums SHA-256, permite replicar resultados de investigacion registrando la revision inmutable del repositorio.
- Base para ajuste fino en tareas visuales: las representaciones autosupervisadas pueden inicializar modelos para clasificacion o deteccion en dominios egocentricos, aunque la cabecera temporal debe sustituirse.
- Estudio de objetivos de aprendizaje autosupervisado: util para comparar el efecto de los objetivos BabyCL frente a otros metodos de preentrenamiento visual en el mismo corpus.
- Analisis de segmentacion temporal en video: la cabecera temporal permite identificar segmentos de entrenamiento, util para experimentos de estructura temporal en corpus egocentricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la subida preserva los tensores del checkpoint seleccionado y no anade nuevos resultados de entrenamiento ni de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 35,8 millones de parametros, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna en precision completa (del orden de decenas de MB de pesos).
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos unos pocos GB de VRAM es suficiente.
- Cabe en GPU consumer: si, dado el reducido numero de parametros.
- Opciones de despliegue: carga mediante `egolearn.evaluation.load_model` con una instalacion autorizada de EgoLearn (Python 3.12 o superior, extra `train`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion.

## Limitaciones y advertencias

- Modelo exclusivamente visual: no tiene codificador de texto ni genera lenguaje.
- La cabecera de clasificacion temporal identifica segmentos de entrenamiento, no clases semanticas de objetos; no debe usarse como clasificador de objetos.
- El codigo de EgoLearn es privado; la carga requiere una instalacion autorizada, lo que limita la reproducibilidad externa.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- El repositorio excluye datos de entrenamiento, estado del optimizador y buffers de replay; la procedencia historica incompleta queda marcada como no disponible.
- Orientado a investigacion sobre representaciones egocentricas; no se documentan sesgos especificos, pero al carecer de evaluacion publicada no puede descartarse un comportamiento limitado fuera del dominio KrishnaCam.
- Riesgo de alucinacion no aplica en el sentido generativo, pero las representaciones pueden no generalizar a dominios visuales distintos del corpus de entrenamiento.
- Se recomienda registrar la revision inmutable del repositorio al reportar resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-krishnacam-seed2
- Organizacion EgoLearn: https://huggingface.co/egolearn

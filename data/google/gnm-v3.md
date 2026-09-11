# google/gnm-v3

## Resumen

GNM (Generative aNthropometric Model, pronunciado *genome*) es un modelo estadistico parametrico 3D de la cabeza humana desarrollado por Google. No es un modelo de lenguaje ni una red neuronal generativa de texto: es un 3DMM (3D Morphable Model) aprendido a partir de un conjunto amplio de escaneos 3D de alta resolucion, que representa la geometria craneofacial y anatomias internas controlables (globos oculares, dientes, encias y lengua) mediante espacios de parametros desacoplados.

La version publicada aqui es la 3.0, distribuida como pesos oficiales en Hugging Face Hub y Kaggle Models bajo licencia Apache 2.0. El objetivo es sustituir a los 3DMM clasicos en pipelines de vision por computador, graficos y realidad extendida, ofreciendo control ortogonal sobre identidad, expresion, pose de cabeza, rotaciones articulares (cuello y mirada bilateral) y traslacion global, ademas de mapeados UV multi-topologia para mallas en quad y en triangulos.

Su relevancia actual radica en la combinacion de tres factores: una representacion anatomica mas completa que la de los modelos faciales habituales (incluye denticion articulada y lengua para articulacion del habla), soporte nativo multi-backend (NumPy, JAX, PyTorch y TensorFlow bajo una interfaz unificada `GNM`) y una licencia permisiva que permite uso comercial sin las restricciones habituales de los 3DMM academicos. El repositorio ocupa aproximadamente 0,1 GB y el fichero de pesos principal es `gnm_head.npz` (variante *Head*, version 3.0).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo estadistico parametrico 3D (3DMM) con espacios de parametros desacoplados; no es un transformer ni una red neuronal de lenguaje |
| Parametros totales | no disponible (dims. de identidad y expresion expuestas como `identity_dim` y `expression_dim`, sin valor numerico publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de geometria 3D, no procesa secuencias de texto) |
| Tipos de cuantizacion | no aplica; los pesos se distribuyen como tensores en formato NumPy `.npz` (sin cuantizacion de inferencia) |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje, aunque la lengua y la denticion articuladas permiten modelar articulaciones del habla |
| Licencia | Apache 2.0 |
| Formato de pesos | NPZ (NumPy); fichero `gnm_head.npz` |
| Version | 3.0 (variante *Head*) |
| Checksum SHA-256 | `61d78bbfb4ad8e0b38495804a4caef3214d3df00f8c3f68761e63b41ce3747eb` |
| Tamano del repositorio | 0,1 GB |
| Backends soportados | NumPy, JAX, PyTorch, TensorFlow (interfaz unificada) |
| Articulaciones (`num_joints`) | no disponible (incluye cuello y mirada ocular bilateral en formato axis-angle) |
| Salidas | Vertices 3D `[V, 3]` y triangulos `[F, 3]`; UVs en quad `[Q, 4, 2]` y en triangulos `[T, 3, 2]` |
| Descargas en Hugging Face | 0 |
| Likes en Hugging Face | 9 |
| Fecha de creacion | 2026-09-01 |
| Ultima actualizacion | 2026-09-02 |

## Arquitectura y entrenamiento

GNM es un modelo morfable 3D estadistico entrenado a partir de un conjunto de escaneos 3D de alta resolucion. A diferencia de los 3DMM puramente faciales, modela simultaneamente la piel craneal, facial y cervical, el interior de los ojos (esclera, pupila, iris) y la cornea externa, la denticion superior e inferior con encias y una superficie lingual articulada. Los espacios de parametros estan desacoplados y son ortogonales: identidad (proporciones especificas del sujeto en cabeza, globo ocular y dientes), expresion (conjunto de blendshapes sobre ojos, mitad inferior de la cara, lengua e iris), pose de cabeza y rotaciones articulares (cuello y mirada bilateral en formato axis-angle) y traslacion cartesiana global. Con todos los parametros a cero se obtiene la malla plantilla neutra.

El modelo proporciona mapeados UV estructurados para cinco regiones logicas (piel, dientes y encias superiores, dientes y encias inferiores, lengua, interior del ojo y exterior del ojo), tanto en topologia de quad como triangulada. Se distribuye con soporte nativo para cuatro frameworks mediante una interfaz comun, e incluye compatibilidad con modelos preentrenados `IdentitySampler` y `ExpressionSampler`, que generan parametros de identidad y expresion a partir de etiquetas semanticas de alto nivel. La model card indica que el entrenamiento utilizo categorias demograficas estandar en la literatura de 3DMM, pero el texto disponible esta truncado y no detalla el numero de escaneos, la composicion exacta del dataset ni si se aplicaron etapas de ajuste tipo RLHF o DPO (no aplicables en cualquier caso a este tipo de modelo).

## Capacidades

- Generacion de malla 3D densa de la cabeza con cobertura craneal, facial y de cuello.
- Control desacoplado de identidad: rasgos faciales especificos del sujeto y proporciones anatomicas de cabeza, globo ocular y dientes.
- Control de expresion mediante un conjunto rico de blendshapes que abarca ojos, mitad inferior de la cara, lengua e iris.
- Control de pose de cabeza y rotaciones articulares del cuello, ademas de mirada ocular bilateral en formato axis-angle.
- Traslacion global en coordenadas cartesianas 3D.
- Anatomia interna controlable: esclera, pupila, iris, cornea externa, denticion superior e inferior articulada y superficie lingual con soporte para deformacion interna de la boca y articulaciones del habla.
- Mapeado UV multi-topologia (quad y triangulos) en cinco regiones logicas.
- Muestreo semantico de parametros mediante `IdentitySampler` y `ExpressionSampler` preentrenados, a partir de etiquetas de alto nivel.
- Carga desde Hugging Face Hub, Kaggle Models o CDN por HTTPS con cache local automatica.
- Ejecucion en CPU y en GPU segun el backend elegido (NumPy, JAX, PyTorch, TensorFlow).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision por si mismo, tool calling ni capacidades de agente.

## Casos de uso

- Avatares 3D y *digital humans*: el modelo genera directamente una malla con identidad, expresion y pose coherentes, de modo que un estudio de personajes puede poblar una escena con cabezas diversas variando unicamente el vector de identidad y reutilizando la misma topologia.
- Seguimiento facial y de cabeza en tiempo real para XR: al exponer pose de cuello y mirada ocular bilateral en axis-angle, encaja con pipelines de *head tracking* y *gaze tracking*; el propio repositorio enlaza una demo de XR Blocks (`GNM-Head`) orientada a este escenario.
- Reconstruccion monocular de cabeza desde imagen o video: ajustando los parametros de identidad, expresion y pose contra una imagen de entrada se obtiene una malla 3D que puede reproyectarse, lo que sirve para avatares generados a partir de una unica fotografia.
- Animacion facial y sincronizacion labial: la presencia de lengua, denticion articulada y blendshapes de la parte inferior de la cara permite construir *visemes* y animar habla con mayor fidelidad que un 3DMM puramente cutaneo.
- Generacion de datos sinteticos para entrenamiento de modelos de vision: muestreando identidades mediante `IdentitySampler` y expresiones mediante `ExpressionSampler` se pueden renderizar grandes volumenes de caras etiquetadas para tareas de deteccion de landmarks, reconocimiento facial o analisis de expresion.
- Telepresencia y videollamada con avatares: el modelo puede actuar como representacion geometrica de destino, recibiendo parametros estimados en tiempo real desde un *tracker* y renderizando el avatar en el cliente.
- Diseno antropometrico de productos: gafas, cascos, mascaras, auriculares o equipos de proteccion personal pueden evaluarse contra una poblacion sintetica de cabezas generadas variando el vector de identidad, incluyendo proporciones de globo ocular y denticion.
- Planificacion e investigacion craneofacial: la cobertura craneal y la anatomia interna controlable permiten estudiar proporciones y articulaciones en escenarios de simulacion, siempre con las cautelas eticas indicadas mas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de error de reconstruccion, distancia de vertices ni metricas de ajuste frente a otros 3DMM, y los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre el modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplica en el caso de la evaluacion NumPy, que se ejecuta en CPU. No se especifica un requisito de VRAM por parte del autor.
- Memoria principal: el repositorio completo ocupa 0,1 GB, por lo que la carga del fichero `gnm_head.npz` es viable en practicamente cualquier equipo moderno; el consumo exacto de RAM al evaluar la malla no esta disponible.
- GPU recomendadas: no disponibles. Al soportar backends JAX, PyTorch y TensorFlow, la evaluacion puede acelerarse en cualquier GPU compatible con estos frameworks, pero el autor no publica cifras ni modelos recomendados.
- GPU de consumo: no hay datos oficiales. Por el tamano del artefacto (0,1 GB) es razonable esperar que quepa en GPU de consumo, pero se trata de una estimacion no confirmada por la documentacion.
- Opciones de despliegue: no se documentan servidores de inferencia tipo vLLM, TGI, Ollama o llama.cpp, que no aplican a este tipo de modelo. El despliegue previsto es mediante el paquete Python `gnm` (`pip install -e .` con extras `[jax]`, `[pytorch]` o `[all]`) y carga desde Hugging Face Hub, Kaggle Models o CDN por HTTPS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos comparados no provienen de la informacion proporcionada en esta busqueda, por lo que se ofrecen unicamente como referencia de categoria y deben verificarse en sus fuentes originales.

| Modelo | Tipo | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|
| GNM v3.0 | 3DMM completo de cabeza con anatomia interna (ojos, dientes, lengua) | Apache 2.0 (uso comercial permitido) | Hugging Face Hub y Kaggle Models | Datos verificados en la informacion proporcionada |
| FLAME | 3DMM facial parametrico | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Categoria comparable: modelo facial de referencia en vision por computador |
| SMPL-X | Modelo corporal con manos y cara | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Categoria comparable: cubre cuerpo completo, no solo cabeza |
| Basel Face Model (BFM) | 3DMM facial clasico | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Categoria comparable: representacion facial estadistica |

No se dispone de parametros, contextos ni cifras de rendimiento de los modelos comparados dentro de la informacion facilitada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card menciona explicitamente que el modelo se entreno con datasets que emplean categorias demograficas estandar en la literatura de 3DMM; el texto disponible esta truncado en ese punto, por lo que las implicaciones de sesgo demografico no pueden detallarse mas alla de lo indicado por el autor.
- No es un modelo generativo de texto ni de imagenes: no existe riesgo de alucinacion en el sentido habitual, pero si riesgo de extrapolacion fuera de la distribucion de identidades y expresiones cubierta por los datos de entrenamiento.
- La cobertura anatomica declarada no incluye pelo, orejas internas ni otras estructuras no mencionadas; la ficha solo confirma piel craneal, facial y cervical, ojos, denticion, encias y lengua.
- No se especifican los identificadores, sesgos ni restricciones de las categorias demograficas usadas en el entrenamiento, lo que dificulta auditar la equidad del modelo en poblaciones concretas.
- El repositorio registra 0 descargas y 9 likes, y la fecha de publicacion indicada es muy reciente; no hay evidencia de adopcion ni de validacion independiente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datasets de escaneos subyacentes, que no se detallan en la informacion disponible.
- Aunque el modelo se describe como adecuado para investigacion y aplicaciones comerciales, cualquier uso sobre rostros reales debe cumplir la normativa aplicable de proteccion de datos y de imagen, especialmente en la Union Europea.
- El README disponible esta truncado, por lo que no se pueden confirmar limitaciones adicionales declaradas por el autor ni los terminos eticos completos.
- Los resultados de la busqueda web realizada no aportan informacion tecnica util (devuelven paginas genericas de Google), de modo que toda la ficha se basa en la model card y los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/google/gnm-v3
- Repositorio en Kaggle Models: https://www.kaggle.com/models/google/gnm-v3
- Repositorio de codigo en GitHub: https://github.com/google/GNM
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.23687
- Demo XR Blocks GNM Head: https://xrblocks.github.io/docs/samples/GNM-Head/
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Paquete Python: `gnm.shape` (backends `gnm_numpy`, `gnm_jax`, `gnm_pytorch`, `gnm_tensorflow`)

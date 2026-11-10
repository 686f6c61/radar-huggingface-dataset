# ShaderError/perspectra-mirrors

## Resumen

Perspectra mirrors es un repositorio de redistribucion alojado en Hugging Face por el usuario ShaderError. No se trata de un modelo entrenado por el autor, sino de un espejo de descarga que contiene copias byte a byte de pesos publicos ya existentes, empaquetados para su uso con el complemento Perspectra para Blender. El repositorio agrupa exportaciones ONNX de los SDK de OpenMMLab (RTMPose y YOLOX), el checkpoint PyTorch de BootsTAPIR v2 de Google DeepMind y una compilacion para Windows de Instant Meshes.

El objetivo declarado es ofrecer una segunda fuente de descarga para el add-on, evitando depender de un unico origen. No hay reentrenamiento, ajuste fino ni modificacion de los pesos: los ficheros son identicos a los originales y conservan sus licencias respectivas. Esto lo convierte en un artefacto de distribucion mas que en un modelo con capacidades propias.

Por su naturaleza, la ficha no puede describir una arquitectura unica, un tamano de parametros unico ni un contexto unificado. Cada fichero pertenece a un proyecto distinto con su propia arquitectura, licencia y proposito. El repositorio ocupa aproximadamente 0,2 GB y esta etiquetado con onnx, perspectra y blender.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | multiple: RTMPose y YOLOX (ONNX), BootsTAPIR v2 (PyTorch), Instant Meshes (binario Windows) |
| Parametros totales | no disponible (depende de cada fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precision original) |
| Idiomas soportados | no aplica (modelos de vision y reconstruccion 3D) |
| Licencia | other (Apache-2.0 para RTMPose/YOLOX y BootsTAPIR; BSD-3-Clause para Instant Meshes) |
| Formato de pesos | ONNX (yolox_m_humanart.onnx, rtmpose_m_halpe26.onnx), PyTorch checkpoint (bootstapir_v2.pt), binario Windows (Instant Meshes) |

Ficheros incluidos y sus hashes SHA-256 (truncados en la model card):

| Fichero | Tamano | SHA-256 |
|---|---|---|
| `yolox_m_humanart.onnx` | 101 MB | `3dea6513388889f0…` |
| `rtmpose_m_halpe26.onnx` | 56 MB | `26f3a19e61304a60…` |
| `bootstapir_v2.pt` | 219 MB | `8493c7a69e02c85b…` |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. Cada artefacto procede de un proyecto de investigacion distinto:

- YOLOX es un detector de objetos de una etapa basado en anchor-free YOLO, exportado por OpenMMLab en formato ONNX. La variante `yolox_m_humanart` corresponde al tamano M entrenado sobre el dataset HumanArt para deteccion de personas.
- RTMPose es un estimador de pose de top-down basado en transformers ligeros, exportado tambien por OpenMMLab. La variante `rtmpose_m_halpe26` usa el esquema de 26 keypoints de Halpe.
- BootsTAPIR v2 es un modelo de seguimiento de puntos (point tracking) en video desarrollado por Google DeepMind dentro del proyecto TAPNet, distribuido como checkpoint PyTorch.
- Instant Meshes es una herramienta de remallado (remeshing) interactiva de Wenzel Jakob et al., distribuida como ejecutable para Windows.

No hay datos de tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO en la informacion disponible, ya que el repositorio solo redistribuye pesos ya entrenados por terceros.

## Capacidades

- Deteccion de personas en imagenes mediante YOLOX (fichero `yolox_m_humanart.onnx`).
- Estimacion de pose humana con 26 keypoints mediante RTMPose (fichero `rtmpose_m_halpe26.onnx`).
- Seguimiento de puntos a lo largo de secuencias de video mediante BootsTAPIR v2 (fichero `bootstapir_v2.pt`).
- Remallado de mallas 3D mediante Instant Meshes (binario Windows).
- Integracion con el complemento Perspectra para Blender como fuente alternativa de descarga.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Captura de movimiento en Blender: el add-on Perspectra puede usar RTMPose para extraer keypoints de video y trasladarlos a un rig, aprovechando este espejo como origen de descarga fiable.
- Deteccion de personas en pipelines de vision por computador: YOLOX permite localizar personas en fotogramas antes de aplicar estimacion de pose o seguimiento.
- Seguimiento de puntos en video para rotoscopia o VFX: BootsTAPIR v2 permite rastrear puntos concretos a lo largo de una secuencia, util para estabilizacion o matchmoving.
- Remallado de geometria escaneada: Instant Meshes genera mallas cuadrilateras limpias a partir de escaneos densos, apropiado para preparar assets antes de animarlos.
- Despliegue offline en estudios sin acceso estable a GitHub: al ser un espejo en Hugging Face, permite obtener los mismos ficheros desde una infraestructura alternativa.
- Verificacion de integridad de artefactos: los hashes SHA-256 publicados permiten comprobar que los ficheros descargados coinciden con los originales antes de usarlos en produccion.
- Automatizacion de pipelines de vision en ONNX Runtime: los dos ficheros ONNX pueden cargarse directamente en runtimes compatibles sin conversion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, latencia ni throughput para ninguno de los ficheros redistribuidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende de cada modelo. YOLOX-M y RTMPose-M son modelos ligeros que caben holgadamente en GPUs de consumo, pero la model card no aporta cifras.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable para los ficheros ONNX por su tamano (101 MB y 56 MB), pero no confirmado en la documentacion.
- Opciones de despliegue: ONNX Runtime para los ficheros `.onnx`; PyTorch para `bootstapir_v2.pt`; ejecutable nativo para Instant Meshes en Windows.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| Perspectra mirrors (este repo) | Espejo de varios modelos | ~0,2 GB total | other (hereda de cada original) | Hugging Face |
| OpenMMLab mmpose onnx_sdk | Exportaciones ONNX originales | Variable | Apache-2.0 | GitHub |
| Google DeepMind TAPNet | Checkpoints de seguimiento de puntos | Variable | Apache-2.0 | GitHub |
| Instant Meshes (wjakob) | Herramienta de remallado | Binario | BSD-3-Clause | GitHub |

La comparativa relevante es con los repositorios originales, ya que este repositorio no aporta pesos nuevos. La diferencia principal es la ubicacion de descarga y el empaquetado orientado al add-on Perspectra.

## Limitaciones y advertencias

- No es un modelo original: no debe citarse como trabajo propio de ShaderError ni atribuirsele merito de entrenamiento.
- La licencia `other` implica que cada fichero conserva su licencia original; es responsabilidad del usuario verificar los terminos de Apache-2.0, BSD-3-Clause y de cualquier componente adicional antes de uso comercial.
- Los hashes SHA-256 de la model card aparecen truncados, lo que impide una verificacion completa de integridad solo con esa informacion.
- No hay informacion sobre sesgos, tasas de alucinacion ni limitaciones de contexto porque no son modelos de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.
- No se especifican requisitos de version de ONNX Runtime, PyTorch ni del add-on Perspectra.
- El binario de Instant Meshes es para Windows; no se indica si hay builds para otros sistemas en este espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShaderError/perspectra-mirrors
- OpenMMLab mmpose: https://github.com/open-mmlab/mmpose
- Google DeepMind TAPNet (BootsTAPIR): https://github.com/google-deepmind/tapnet
- Instant Meshes: https://github.com/wjakob/instant-meshes

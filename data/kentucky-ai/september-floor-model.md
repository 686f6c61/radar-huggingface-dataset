# Kentucky-ai/september-floor-model

## Resumen

`Kentucky-ai/september-floor-model` es un paquete de componentes de investigacion para la segmentacion y clasificacion de planos de planta, no un modelo de lenguaje. Lo publica el usuario Kentucky-ai y contiene los cinco checkpoints originales de septiembre empleados por el pipeline combinado de suelos denominado SFG, preservados de forma separada respecto a los experimentos de mejora de octubre. El objetivo es poner a disposicion de la comunidad los pesos y el codigo de caracteristicas reutilizables para tareas de vision aplicada a planos vectoriales en PDF.

El repositorio incluye dos redes neuronales de segmentacion (DeepLabV3 con backbone ResNet50 para contexto visual y SegFormer B2 para contexto de muros) y tres clasificadores serializados con scikit-learn (clasificador vectorial de muros de 36 caracteristicas, clasificador de sellos de puerta y un veto de regiones no muro con contexto visual). Cada checkpoint lleva un checksum SHA-256 en `MANIFEST.json`. El tamano del repositorio es de 0,3 GB y no registra descargas ni likes en el momento de la consulta.

Es relevante ahora porque expone componentes de un sistema de "takeoff" (medicion y despiece de planos) habitualmente cerrado, con umbrales de decision explicitos y preprocesado detallado. Ahora bien, el propio autor advierte de que no se trata de una instalacion portable del pipeline completo: no se incluyen la construccion nativa de poligonos, las etapas de completado de suelo, la asignacion final de propiedad ni la aplicacion de takeoff, por lo que cargar los pesos por si solos no reproduce las estancias del sistema retenido. No hay datos publicados sobre parametros totales, contexto ni idiomas, ya que el modelo no opera sobre texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: DeepLabV3 con backbone ResNet50 (`roles-e070b.pt`), SegFormer B2 (`walls-e068.pt`) y tres clasificadores scikit-learn serializados en pickle |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de trabajo es de tiles de 1024 pixeles con stride de 768) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; la entrada es imagen raster de planos) |
| Licencia | `september-component-licenses` (identificador `other`); el componente E068 deriva de NVIDIA SegFormer y conserva su licencia de solo investigacion/evaluacion |
| Formato de pesos | PyTorch (`.pt`) para las redes visuales y pickle de scikit-learn (`.pkl`) para los clasificadores |
| Pipeline declarado en HuggingFace | image-segmentation |
| Clases de contexto visual | background, wall, fixture, annotation, hatch |
| Umbrales de decision publicados | Veto de no muro: 0,95; admision de muro: 0,35; admision de sello: 0,5 |
| Preprocesado requerido | RGB, normalizacion ImageNet, escala fisica de 32 pixeles por pie, tiles de 1024 pixeles con stride de 768 |
| Version de scikit-learn | 1.9.0 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El paquete combina tres familias de modelos. Por un lado, `roles-e070b.pt` es una red DeepLabV3 con backbone ResNet50 que produce contexto visual sobre cinco clases: fondo, muro, instalacion o elemento fijo, anotacion y tramado. Por otro, `walls-e068.pt` es una SegFormer B2 especializada en segmentacion de contexto de muro. Ambos son modelos densos de vision, no transformers de lenguaje, y se cargan con los cargadores incluidos en `load_original.py` sobre PyTorch.

La capa de decision se apoya en tres clasificadores serializados con scikit-learn 1.9.0: `wall_v0_noband.pkl` (clasificador vectorial de muros de 36 caracteristicas), `seal_v0.pkl` (clasificador de sellos de puerta emparejados) y `expanded_head.pkl` (veto de regiones no muro con contexto visual, que incluye el clasificador de muros congelado). Las caracteristicas que recibe el clasificador de no muro son `role_wall`, `role_fixture`, `role_annotation`, `role_hatch` y `role_wall_frac`, y son agregados por segmento, no las cinco probabilidades brutas de clase. La card indica que los mapas de muro y de roles emplean agregaciones de solape distintas, de modo que una pasada directa sobre la imagen completa no reproduce una hoja completa.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO (tecnicas no aplicables a este tipo de modelos). Tampoco se distribuyen dibujos privados, etiquetas, matrices de entrenamiento, geometria de proyecto exportada, credenciales ni capturas de revision de clientes. La validacion declarada se limita a un smoke test en una Lambda A10: los tres clasificadores cargan y las dos redes visuales cargan de forma estricta y producen salidas finitas, segun `CLOUD-VALIDATION.json`. Esa prueba valida compatibilidad de checkpoints, no precision sobre hojas completas.

## Capacidades

- Segmentacion semantica de contexto visual de planos en cinco clases: fondo, muro, instalacion, anotacion y tramado.
- Segmentacion de contexto de muro especifica mediante SegFormer B2.
- Clasificacion vectorial de muros a partir de 36 caracteristicas derivadas de segmentos.
- Clasificacion de sellos de puerta emparejados (`seal_v0.pkl`).
- Veto de regiones no muro con contexto visual y umbral configurable de 0,95.
- Admision de muro y de sello con umbrales explicitos de 0,35 y 0,5 respectivamente.
- Extraccion de caracteristicas de rol por segmento (`role_wall`, `role_fixture`, `role_annotation`, `role_hatch`, `role_wall_frac`) para inspeccion e integracion en pipelines propios.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica).
- Capacidades especiales: modo de pensamiento, vision generativa o audio no disponibles; la vision se limita a las cabezas de segmentacion entrenadas.

## Casos de uso

- Vectorizacion de planos de planta en PDF: el componente `walls-e068` delimita contexto de muro y alimenta al clasificador vectorial de 36 caracteristicas para reconstruir la geometria de muros en un pipeline propio.
- Digitalizacion para arquitectura tecnica: la combinacion de mapa de roles y mapa de muros permite separar muro, instalacion y anotacion antes de calcular superficies utiles.
- Medicion y despiece (takeoff) como componente previo: los checkpoints sirven de etapa de percepcion dentro de un sistema de medicion, siempre que el desarrollador implemente por su cuenta el completado de suelo y la asignacion de propiedad.
- Deteccion de huecos y puertas: `seal_v0.pkl` clasifica sellos de puerta emparejados, util para inventariar accesos entre estancias en lotes de planos.
- Filtrado de falsos positivos de muro: `expanded_head.pkl` aplica un veto con umbral 0,95 sobre regiones que parecen muro pero pertenecen a otras clases, reduciendo ruido antes de un postprocesado geometrico.
- Investigacion en segmentacion de planos: los cinco checkpoints y el codigo de caracteristicas permiten reproducir experimentos y comparar contra alternativas sobre el mismo preprocesado (32 pixeles por pie, tiles de 1024 con stride 768).
- Analisis por lotes de planos vectoriales: el preprocesado por tiles con solape del 75 por ciento facilita el procesamiento sistematico de colecciones de planos en GPU.
- Integracion como dependencia de un sistema propio: `load_classifier` y `load_visual` permiten cargar los componentes por separado y sustituir etapas aguas abajo segun las necesidades del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion declarada es un smoke test en una Lambda A10 recogido en `CLOUD-VALIDATION.json`, que confirma que los tres clasificadores y las dos redes visuales cargan correctamente y emiten salidas finitas. El autor indica expresamente que no se reclama ninguna precision de estancia del 95 por ciento medida de forma independiente.

## Requisitos de hardware

- Espacio en disco: 0,3 GB para los pesos y el codigo del repositorio.
- VRAM estimada para inferencia: no disponible con cifras concretas en la informacion proporcionada.
- GPU validada: Lambda A10, donde se ejecuto el smoke test de carga y salida finita de los cinco componentes.
- GPU recomendadas: no disponible (no se especifican modelos alternativos).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: cargadores PyTorch incluidos en `load_original.py` (`load_classifier`, `load_visual`, `score_named_features`) y scikit-learn 1.9.0 para los ficheros pickle; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Instalacion: `pip install -r requirements.txt` tras descargar con `hf download Kentucky-ai/september-floor-model --local-dir september-floor-model`.
- Latencia y throughput estimados: no disponible. Conviene tener en cuenta que el preprocesado por tiles de 1024 pixeles con stride de 768 implica un solape alto y, por tanto, un coste de computo considerable por hoja.
- Nota de seguridad: los clasificadores son ficheros pickle; el propio autor recomienda cargarlos unicamente desde este repositorio de confianza y verificar antes sus hashes.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, ni datos de rendimiento frente a alternativas. Como referencia arquitectonica, los componentes derivan de DeepLabV3 con ResNet50 y de SegFormer B2, pero no se facilitan cifras de parametros, precision ni contexto que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es una instalacion portable del pipeline completo: faltan la construccion nativa de poligonos, las etapas de completado de suelo, la asignacion final de propiedad y la aplicacion de takeoff.
- Cargar los pesos por si solos no reproduce las estancias del sistema retenido.
- Fallos conocidos del pipeline: estancias fusionadas, intrusion de muros y elementos fijos que se convierten en regiones de suelo independientes.
- No se reclama ninguna precision de estancia del 95 por ciento medida de forma independiente; es un activo de investigacion y evaluacion, no un sistema de takeoff certificado.
- No se distribuyen dibujos privados, etiquetas, matrices de entrenamiento, geometria exportada, credenciales ni capturas de revision de clientes, por lo que no es posible auditar el entrenamiento con los datos publicados.
- La licencia `september-component-licenses` es de tipo `other` y la descarga publica no implica uso comercial sin restricciones; el componente E068 deriva de NVIDIA SegFormer y mantiene su licencia de solo investigacion y evaluacion.
- El componente E068 incorpora ademas la licencia BSD de torchvision, cuyos terminos se recogen en `licenses/torchvision-BSD.txt`.
- Los clasificadores estan serializados con scikit-learn 1.9.0; versiones distintas pueden provocar incompatibilidades de carga.
- El preprocesado es obligatorio y estricto: RGB, normalizacion ImageNet, 32 pixeles por pie, tiles de 1024 y stride de 768. Sin respetarlo, los resultados no son validos.
- Los mapas de muro y de rol usan agregaciones de solape diferentes; una pasada directa sobre la imagen completa no equivale a la reproduccion de una hoja.
- Riesgo de alucinacion y sesgos: no disponible (no aplica a un modelo generativo); el riesgo equivalente es la clasificacion erronea de regiones, cubierta por los fallos conocidos citados.
- Las unicas cifras de validacion publicadas corresponden a un smoke test en Lambda A10 y no a una evaluacion de precision sobre hojas completas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kentucky-ai/september-floor-model
- Licencia del repositorio: `LICENSE.md` (incluido en el repositorio)
- Licencia de NVIDIA SegFormer: `licenses/NVIDIA-SegFormer.txt`
- Licencia BSD de torchvision: `licenses/torchvision-BSD.txt`
- Manifiesto de checksums SHA-256: `MANIFEST.json`
- Informe de validacion en la nube: `CLOUD-VALIDATION.json`
- Script de carga de componentes: `load_original.py`
- Dependencias: `requirements.txt`
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden al estado estadounidense de Kentucky y a la marca Kentucky Horsewear, sin relacion con este repositorio.

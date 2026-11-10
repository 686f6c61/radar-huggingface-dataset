# lair-nyu/victr-assets

## Resumen

VICTR (Value-Informed In-Context Learning for VLAs) es un trabajo de investigacion sobre aprendizaje en contexto para modelos de vision-lenguaje-accion (VLA) aplicados a robotica. El repositorio `lair-nyu/victr-assets` no contiene pesos de un modelo publicable en el sentido habitual, sino los artefactos de entrenamiento preconstruidos que el paper y el codigo asociado necesitan para reproducir sus experimentos: tokenizador FAST, pools de recuperacion con embeddings DINOv2 por tarea y un checkpoint de arranque de pi0.5.

El problema que aborda es el de dotar a un VLA de capacidad de adaptacion rapida a nuevas tareas mediante ejemplos en contexto, incorporando informacion de valor (progreso hacia el objetivo) para seleccionar y ponderar las demostraciones recuperadas. Se apoya en la pila openpi y en la familia pi0/pi0.5, con un total de 72,7 GB de artefactos repartidos en pools de recuperacion de 42 GB y 15 GB, un tokenizador de 146 KB y un checkpoint de 12 GB.

Es relevante ahora porque empaqueta en un unico repositorio todos los insumos necesarios para entrenar y evaluar las variantes del metodo sin tener que regenerar los pools de recuperacion, que son costosos de construir (extraccion de embeddings, imagenes por chunk y ventanas de acciones pre-tokenizadas). No obstante, la informacion publica disponible es escasa: no hay licencia declarada, no se especifican idiomas ni se publican resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefactos para entrenamiento de VLA basados en openpi / pi0.5; no se describe la arquitectura del modelo en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors para el checkpoint (`checkpoints/yor_icl_pi05_canonical_extended/stage1/40000/params/`, 12 GB); pickle para los pools de recuperacion; tokenizador FAST en `fast_tokenizer/yor-icl-canonical/` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo en si. Lo que contiene son los insumos de entrenamiento de VICTR: un tokenizador FAST (`fast_tokenizer/yor-icl-canonical/`, 146 KB) usado para el texto de contexto y las acciones pi0-FAST; dos pools de recuperacion (`victr_icl_pool_canonical_3cam_224/`, 42 GB, y `victr_icl_pool_canonical_224/`, 15 GB) construidos como un pickle por tarea con embeddings de chunk DINOv2, valores de progreso, imagenes de chunk a 224x224, proprio/acciones canonicas y ventanas de acciones pre-tokenizadas; y un checkpoint de etapa 1 de pi0.5 (`checkpoints/yor_icl_pi05_canonical_extended/stage1/40000/params/`, 12 GB) que sirve como warm start para las variantes de tres camaras y para la linea base de warm start.

El metodo, segun el titulo del paper, es aprendizaje en contexto informado por valor: se recuperan demostraciones relevantes de un pool por tarea y se condiciona al VLA con ellas, incorporando la senal de progreso (value) en la seleccion o ponderacion. Los pools se cargan mediante `openpi.policies.yor_retrieval.load_pool`. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplico RLHF o DPO.

## Capacidades

- Control robotico mediante VLA: el material esta orientado a politicas vision-lenguaje-accion sobre la pila openpi.
- Aprendizaje en contexto: adaptacion a tareas nuevas a partir de demostraciones recuperadas de un pool, sin reentrenamiento completo.
- Recuperacion informada por valor: los pools incluyen valores de progreso por chunk, lo que permite seleccionar demostraciones segun su avance hacia el objetivo.
- Percepcion multi-camara: la variante `ctx3cam` usa tres camaras por chunk a 224x224.
- Tokenizacion de acciones: tokenizador FAST para representar acciones como texto, compatible con pi0-FAST.
- Warm start desde pi0.5: el checkpoint de etapa 1 permite inicializar el entrenamiento de las variantes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos del paper: descargar los artefactos con `shells/download_data.sh` y entrenar las variantes VICTR y las lineas base RICL-style usando los pools canonicos ya construidos, evitando regenerar embeddings y ventanas de acciones.
- Investigacion en aprendizaje en contexto para robotica: usar los pools por tarea como banco de pruebas para estudiar estrategias de recuperacion (por similitud, por valor de progreso o mixtas) sobre un VLA preentrenado.
- Evaluacion de seleccion de demostraciones: comparar el efecto de recuperar chunks con mayor valor de progreso frente a recuperacion puramente visual, usando los valores ya almacenados en los pickles.
- Entrenamiento con warm start: partir del checkpoint de etapa 1 de pi0.5 (12 GB) para inicializar variantes de tres camaras y medir la ganancia frente a entrenamiento desde cero.
- Desarrollo de politicas multi-camara: emplear el pool `victr_icl_pool_canonical_3cam_224` para tareas que requieren percepcion desde tres puntos de vista, con imagenes de 224x224 por chunk.
- Integracion en la pila openpi: cargar los pools con `openpi.policies.yor_retrieval.load_pool` y reutilizar el tokenizador FAST para pipelines de entrenamiento compatibles con pi0-FAST.
- Analisis de coste de datos: medir el ahorro de tiempo y computo de usar pools preconstruidos (57 GB en total) frente a regenerarlos desde el dataset `lair-nyu/victr-icl-dataset`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo; el checkpoint de etapa 1 ocupa 12 GB en disco, por lo que su carga en memoria requiere al menos esa cantidad mas overhead, pero no se especifica el tamano total de parametros ni la precision.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no disponible; depende del tamano real del modelo pi0.5 subyacente, que no se documenta en la informacion proporcionada.
- Opciones de despliegue: la pila de referencia es openpi (carga de pools via `openpi.policies.yor_retrieval.load_pool`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: se necesitan al menos 72,7 GB libres para el repositorio completo, con 42 GB para el pool de tres camaras y 15 GB para el pool de una camara.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VICTR (este repo) | no disponible | no disponible | no disponible | no disponible | Artefactos de entrenamiento en HF (72,7 GB) |
| pi0 / pi0.5 (openpi) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Referenciado como base del warm start |
| RICL-style (lineas base del paper) | no disponible | no disponible | no disponible | no disponible | Implementadas sobre los mismos pools |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas; la informacion proporcionada solo identifica pi0.5 y las lineas base RICL-style como referencias dentro del propio paper.

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre condiciones de uso comercial; debe consultarse el repositorio de codigo antes de cualquier uso en produccion.
- Los pools de recuperacion son ficheros pickle; la propia model card advierte de que solo deben cargarse desde fuentes de confianza por el riesgo de ejecucion de codigo arbitrario.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma; al tratarse de un modelo de robotica, el riesgo relevante es el fallo de politica en entornos fisicos.
- El repositorio son artefactos de entrenamiento, no un modelo listo para inferencia directa: requiere el codigo de `github.com/LucaMacesanu/viktr` y la pila openpi.
- El checkpoint incluido es solo de etapa 1 (paso 40000) y actua como warm start, no como modelo final entrenado.
- No hay garantia de que los pools cubran tareas fuera del dataset `lair-nyu/victr-icl-dataset`.
- El identificador de arXiv citado (`2611.08698`) y las fechas de creacion del repositorio (noviembre de 2026) deben verificarse antes de citarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lair-nyu/victr-assets
- Paper: https://arxiv.org/pdf/2611.08698v1
- Codigo: https://github.com/LucaMacesanu/viktr/tree/release
- Dataset: https://huggingface.co/datasets/lair-nyu/victr-icl-dataset

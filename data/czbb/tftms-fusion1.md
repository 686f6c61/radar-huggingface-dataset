# czbb/TFTMS-Fusion1

## Resumen

TFTMS-Fusion1 (ID `czbb/TFTMS-Fusion1`) no es un modelo de lenguaje, sino el paquete de pesos de un componente concreto: un cabezal de fusión (*FusionHead*) de tipo perceptrón multicapa con unos 500 parámetros, entrenado por el equipo TFTMS-VLP para la pista VLMOD de una competición de *matching* entre descripciones en lenguaje natural y objetivos 3D. El modelo recibe 13 características numéricas por candidato (similitud imagen-texto de Chinese-CLIP, puntuación de una regla geométrica, 7 indicadores de atributos y 4 errores geométricos continuos) y devuelve una probabilidad entre 0 y 1 de que ese candidato sea el objetivo descrito.

El sistema completo combina tres etapas: una puerta de reglas geométricas de alta cobertura (L1), el cabezal MLP (L2) y una fusión a nivel de decisión con ventanas relativas (`fus_rel=0.25`, `place_cont=0.4`). Con ello el equipo alcanzó un F1 de 93,7250 en la clasificación en línea del 28 de octubre de 2026 (posición 3), con precisión 88,6529 y exhaustividad 99,4127 sobre 3.455 casos positivos y 408 negativos.

Su relevancia es acotada pero clara: es un artefacto de reproducibilidad de bajo coste (todo el flujo se ejecuta en CPU, el checkpoint ocupa unos 5 KB), útil para quien quiera replicar el resultado, estudiarlo como técnica de *reranking* con negativos difíciles o reutilizar la matriz de 20.550 muestras para experimentos propios de fusión de características. No debe confundirse con un modelo fundacional: no genera texto, no procesa imágenes y su licencia no está declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de una capa oculta: 13 → 32 → 1, con ReLU, dropout 0,3 y activación sigmoide en la salida |
| Parametros totales | Aproximadamente 500 (13×32 + 32 + 32×1 + 1, según la estructura declarada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de vector fijo de 13 dimensiones) |
| Tipos de cuantizacion | No disponible; el autor no distribuye versiones cuantizadas |
| Idiomas soportados | No disponible en los metadatos del repositorio. El cabezal no procesa lenguaje; el texto de entrada del sistema se codifica en chino mediante Chinese-CLIP ViT-B/16 |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | PyTorch `.pt` (checkpoint con `state_dict`, `in_dim`, `hidden`, `feat_mean`, `feat_std`) y `.npz` para el conjunto de entrenamiento |
| Tamano del repositorio | 0,0 GB según HuggingFace (`fusion_head.pt` ~5 KB, `fusion_train.npz` ~1,1 MB) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-28 / 2026-10-28 |

## Arquitectura y entrenamiento

El modelo es un clasificador binario de correspondencia. La entrada son 13 características por candidato: índice 0, `clip_sim` (producto escalar de descriptores texto-imagen de 512 dimensiones previamente normalizados en L2, generados por Chinese-CLIP ViT-B/16); índice 1, `rule_score` (puntuación ponderada de la puerta de reglas, rango 0–5,8); índices 2–8, siete indicadores binarios de atributos (objectname, appearance, place, size, distance, facing, occlusion); índices 9–12, cuatro errores geométricos continuos (`dist_err`, `size_dev`, `facing_delta`, `place_match`). Las características se estandarizan con la media y la desviación típica del conjunto de entrenamiento, guardadas dentro del propio checkpoint para evitar fugas de información.

El entrenamiento usó 20.550 muestras de 13 dimensiones extraídas de 1.000 imágenes (muestreo con semilla 42), con optimizador Adam (tasa de aprendizaje 1e-3), pérdida de entropía cruzada binaria, 50 épocas y tamaño de lote 256, también con semilla 42. La decisión de diseño más relevante es la construcción de negativos: se toman candidatos que pasan la puerta de reglas A pero no son el objetivo real (*hard negatives*), de modo que la distribución de entrenamiento coincide con la de inferencia y el cabezal aprende a discriminar dentro de la región donde la regla ya no separa. En el sistema final, la salida del MLP no decide sola: se combina a nivel de decisión con la geometría continua, lo que según el autor elevó el F1 de desarrollo de 0,9665 (regla sola) a 0,9728 y redujo los falsos positivos en línea de 407 a 390. No se emplearon RLHF ni DPO; el entrenamiento es puramente supervisado y ligero (todo el flujo es reproducible en CPU con Python 3.11).

## Capacidades

- Puntuación de correspondencia descripción-objetivo: devuelve una confianza entre 0 y 1 para cada candidato, a partir de 13 características numéricas precalculadas.
- Combinación de evidencia heterogénea: integra similitud semántica multimodal (512 dimensiones reducidas a un escalar), cumplimiento de reglas simbólicas y errores geométricos continuos en un único score.
- Discriminación de negativos difíciles: entrenado específicamente sobre candidatos que superan el filtro de reglas, que es donde se concentra el error del sistema.
- Etapa de *reranking* sobre un conjunto reducido: en la práctica opera sobre los aproximadamente 4–5 candidatos que deja la puerta L1 por imagen.
- Ejecución en CPU sin dependencia de GPU: el autor declara que el flujo completo se reproduce sin GPU.
- Reproducibilidad verificable: incluye el conjunto de entrenamiento en `.npz` (X: 20.550×13, y binario) y el checkpoint con los parámetros de normalización.
- No soporta *tool calling*, agentes, razonamiento multi-paso, generación de texto, visión directa ni modo *thinking*: no es un modelo generativo.

## Casos de uso

- Reproducción y auditoría del resultado de competición: cargar `fusion_head.pt` con el código del repositorio (`scripts/eval_route_b.py`) permite recalcular las métricas de desarrollo y validación (F1 0,9728 / 0,9726) sin GPU, útil para verificar la afirmación del F1 93,7250 en línea.
- *Grounding* de descripciones en escenas interiores 3D: dado un enunciado en chino y un conjunto de candidatos con sus 16 campos oficiales, el cabezal selecciona el objeto referido; encaja como etapa final de *reranking* sobre la salida de un detector o de un modelo de *grounding* más costoso.
- Robots de asistencia e instrucciones referenciales: en un pipeline de manipulación donde el robot ya dispone de las posiciones y atributos de los objetos del entorno, el modelo resuelve "coge la taza pequeña que está a la derecha del sofá" puntuando cada candidato con errores de distancia, tamaño y orientación.
- Sistemas de realidad aumentada o navegación asistida: selección del elemento señalado por una descripción hablada entre los objetos catalogados de la escena, con latencia despreciable al ejecutarse en CPU y un checkpoint de 5 KB.
- Curaduría y preetiquetado de datasets: usar el modelo como anotador automático de pares descripción-objeto y enviar a revisión humana únicamente los casos con probabilidad intermedia, aprovechando la ventana de confianza de la fusión.
- Investigación en fusión de características: el archivo `fusion_train.npz` (20.550 muestras, 13 columnas, etiquetas binarias) sirve como *benchmark* reproducible para comparar alternativas (gradient boosting, regresión logística, MLPs mayores) bajo la misma partición y semilla.
- Análisis de errores y *hard-negative mining*: los 390 falsos positivos y 18 falsos negativos del envío en línea permiten estudiar qué familias de atributos (oclusión, orientación, distancia) concentran el fallo y ajustar la puerta de reglas.
- Despliegue en entornos con restricciones: integrable como módulo de decisión en servicios sin acelerador hardware, dado que la inferencia es un producto matricial de 13×32.

## Benchmarks y rendimiento

Los datos disponibles son métricas de la competición, no benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a este modelo). Se reproduce lo publicado por el autor, indicando la unidad tal como aparece (los valores de desarrollo y validación se expresan como fracción; el resultado en línea, como porcentaje).

| Evaluación | F1 | Precisión | Exhaustividad | Notas |
|---|---|---|---|---|
| Clasificación en línea (2026-10-28) | 93,7250 | 88,6529 | 99,4127 | TP 3047 / FP 390 / FN 18; posición 3 de la clasificación |
| Validación (oficial) | 0,9726 | No disponible | No disponible | Fusión a nivel de decisión |
| Desarrollo (oficial) | 0,9728 | No disponible | No disponible | Fusión a nivel de decisión |
| Desarrollo, cabezal aislado | 0,9479 | No disponible | No disponible | Sin fusión de decisión |
| Desarrollo, línea base de reglas | 0,9665 | No disponible | No disponible | FP en línea: 407 |
| AUC en entrenamiento | 0,9376 | No aplica | No aplica | Sobre el conjunto de entrenamiento |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para el cabezal de fusión: prácticamente nula; el checkpoint ocupa unos 5 KB y la inferencia se ejecuta en CPU (`map_location="cpu"`), tal como documenta el autor.
- GPU recomendadas: ninguna. El autor declara que el flujo completo (extracción de características, construcción del conjunto, entrenamiento y evaluación) se reproduce sin GPU.
- Encaje en GPU de consumo: irrelevante por tamaño; cualquier CPU moderna es suficiente para el MLP.
- Coste añadido del extractor de características: el sistema depende de Chinese-CLIP ViT-B/16 (OFA-Sys) para generar los descriptores de 512 dimensiones. El autor no publica requisitos de VRAM ni tiempo de extracción para este componente; en su entorno se descarga automáticamente desde ModelScope mediante `cn_clip` con `use_modelscope=True`.
- Opciones de despliegue: PyTorch en CPU cargando el `state_dict`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo autorregresivo. La carga requiere `weights_only=False` en PyTorch ≥ 2.6.
- Latencia y throughput: no publicados. Estructuralmente, el cálculo es un MLP de 13→32→1, del orden de centenares de operaciones por candidato.
- Almacenamiento: repositorio de 0,0 GB; el peso real lo aporta el modelo Chinese-CLIP, descargado aparte.

## Comparativa con modelos similares

No se conocen modelos públicos comparables en la información disponible: no es un modelo fundacional sino un componente de un sistema de competición. La comparación pertinente es interna, contra las ablaciones publicadas por el propio autor.

| Sistema | Parámetros | Contexto | F1 (dev) | F1 (línea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TFTMS-Fusion1 (reglas + MLP + fusión de decisión) | ~500 en el cabezal; depende de Chinese-CLIP ViT-B/16 | No aplica | 0,9728 | 93,7250 | No disponible | Pesos y datos en HuggingFace; código en GitHub |
| Cabezal de fusión aislado (sin fusión de decisión) | ~500 | No aplica | 0,9479 | No disponible | No disponible | Incluido en el mismo paquete |
| Línea base de reglas geométricas (sin MLP) | 0 (sistema simbólico) | No aplica | 0,9665 | No disponible (407 FP) | No disponible | Código en el repositorio |
| Chinese-CLIP ViT-B/16 (dependencia, no alternativa) | No disponible en la información | No disponible | No aplica | No aplica | Licencia propia de OFA-Sys, no incluida en el paquete | ModelScope / repositorio de OFA-Sys |

## Limitaciones y advertencias

- Ausencia de licencia: la model card y los metadatos de HuggingFace no declaran licencia, por lo que el uso comercial no está autorizado de forma explícita; es un riesgo legal directo para producción.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no procesa imágenes de forma directa; cualquier uso fuera de la puntuación de candidatos con 13 características precalculadas requiere reentrenamiento.
- Dependencia fuerte del formato de entrada: espera los 16 campos oficiales por candidato y las 7 banderas de atributos derivadas del analizador de texto libre del repositorio. Fuera de ese esquema, el modelo no es aplicable tal cual.
- Desbalanceo de errores: la configuración prioriza exhaustividad (99,4127) sobre precisión (88,6529), con 390 falsos positivos frente a 18 falsos negativos. En aplicaciones donde un falso positivo sea costoso, habrá que recalibrar el umbral.
- Sesgo de muestra: el cabezal se entrenó con 1.000 imágenes y una única semilla (42) de un conjunto de competición; no hay evidencia de generalización a dominios, idiomas o distribuciones de escena distintos.
- Idiomas: el pipeline asume descripciones en chino (Chinese-CLIP); no se declaran otros idiomas soportados.
- Normalización obligatoria: usar `feat_mean` y `feat_std` del checkpoint es parte del contrato; alimentar características sin estandarizar invalida las probabilidades.
- Riesgo de seguridad al cargar: el autor indica explícitamente que hay que usar `weights_only=False` en PyTorch ≥ 2.6, lo que permite deserializar objetos arbitrarios. Solo debería cargarse desde el repositorio oficial y tras verificar el fichero.
- Dependencia externa frágil: la descarga de Chinese-CLIP desde HuggingFace u OSS falló según el autor (timeout/403 el 2026-10-22); ModelScope es la vía declarada como operativa, lo que introduce un punto único de fallo en la reproducibilidad.
- Alucinación: no aplica en el sentido generativo, pero el modelo puede asignar confianza alta a candidatos incorrectos cuando los atributos de la regla coinciden; el autor reporta F1 en desarrollo y validación muy próximos (0,9728 / 0,9726), sin datos de degradación fuera de distribución.
- Métricas no homogéneas: desarrollo y validación se publican como fracción y el resultado en línea como porcentaje; conviene no comparar ambos valores sin normalizar.
- Sin datos de latencia, throughput ni consumo declarados, no es posible dimensionar un servicio a partir de la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/czbb/TFTMS-Fusion1
- Repositorio de código (rama main, commit 95049d7): https://github.com/Umbrelllllla/TFTMS-VLP
- Documentación técnica citada por el autor: `docs/项目笔记.md` (secciones 0–21) y `docs/技术报告/` dentro del repositorio anterior
- Dependencia de características, Chinese-CLIP ViT-B/16 (OFA-Sys), distribuida vía ModelScope: el autor no incluye URL directa en la model card
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados disponibles son directorios genéricos de modelos y no contienen información verificable sobre TFTMS-Fusion1

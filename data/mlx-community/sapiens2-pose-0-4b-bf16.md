# mlx-community/sapiens2-pose-0.4b-bf16

## Resumen

`mlx-community/sapiens2-pose-0.4b-bf16` es una conversión a formato MLX y precisión bf16 del modelo `facebook/sapiens2-pose-0.4b` de Meta, perteneciente a la familia Sapiens2 presentada en ICLR 2026. No es un modelo de lenguaje: es un modelo de visión centrado en el ser humano cuya tarea es la estimación de pose, en concreto la predicción de mapas de calor de 308 puntos clave mediante un enfoque top-down que parte de cajas de persona (formato xyxy) proporcionadas por un detector externo.

La conversión la mantiene la organización mlx-community y está pensada para ejecutarse con la librería MLX de Apple sobre silicio de Apple, a través del soporte Sapiens2 de `mlx-vlm` 0.7.0. El checkpoint ocupa 0,85 GB en `model.safetensors` y contiene 425.677.380 parámetros en bfloat16, la misma precisión mixta con la que se ejecuta la inferencia de referencia; el checkpoint original en float32 duplica ese tamaño.

Su relevancia es práctica: permite ejecutar localmente un estimador de pose humano de 308 keypoints en hardware de Apple con memoria unificada (Mac, iPad o iPhone) sin GPU dedicada, y sin recalibrar pesos, ya que las proyecciones q/k/v se han fusionado en un único tensor `wqkv` por bloque tal y como espera la implementación de mlx-vlm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión con bloques de atención (se infiere de las proyecciones q/k/v fusionadas en `wqkv`); la model card no detalla la arquitectura completa |
| Parámetros totales | 425.677.380 (≈0,43 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: modelo de visión, no procesa secuencias de texto |
| Tipos de cuantización | bf16 (esta conversión); el checkpoint original está en float32. No se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | No aplica / no disponible |
| Licencia | `sapiens2-license` (license_name: other), enlazada a https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md |
| Formato de pesos | safetensors (0,85 GB en `model.safetensors`), biblioteca `mlx` |
| Tarea (pipeline) | keypoint-detection |
| Modelo base | facebook/sapiens2-pose-0.4b |
| Tamaño del repositorio | 0,9 GB |
| Salida | Mapas de calor de 308 keypoints; arrays de NumPy en coordenadas de píxel de la imagen original para pose |
| Herramienta de conversión | mlx-vlm 0.7.0 |

## Arquitectura y entrenamiento

El modelo es una red de visión basada en transformer, según se deduce de la estructura de pesos descrita en la model card: cada bloque contiene proyecciones de query, key y value que en esta conversión se han fusionado en un único tensor `wqkv`, formato que espera el modelo Sapiens2 de mlx-vlm. La salida son mapas de calor densos de 308 puntos clave en un esquema top-down: el modelo no detecta a las personas por sí mismo, sino que recibe cajas xyxy de un detector externo (si no se proporcionan, se usa la imagen completa).

La model card de esta conversión no documenta el proceso de entrenamiento, el volumen de datos, la composición del dataset ni si hubo fases de ajuste fino con RLHF/DPO, algo esperable porque se trata de una tarea de visión densa y no de generación de texto. Tampoco se describen innovaciones de decodificación (como decodificación especulativa) ni mecanismos de atención lineal. Para esos detalles, la propia model card remite a la tarjeta del modelo original `facebook/sapiens2-pose-0.4b`, no incluida en la información disponible. El único detalle de implementación confirmado es que toda la inferencia de referencia se ejecuta en precisión mixta bf16, motivo por el que esta conversión usa bf16 en lugar de float32.

## Capacidades

- Estimación de pose humana densa: predice 308 puntos clave por persona, una cobertura muy superior a los esquemas habituales de 17 (COCO) o 133 (COCO-WholeBody), lo que sugiere cobertura de cuerpo, manos, rostro y posiblemente otros puntos finos. La model card no desglosa la distribución exacta de los 308 keypoints.
- Inferencia top-down: acepta una lista de cajas de persona `(N, 4)` en formato xyxy y devuelve `keypoints` con forma `(N, 308, 2)` y `scores` con forma `(N, 308)`.
- Test de volteo horizontal opcional (`flip_test`) para promediar predicciones y aumentar la estabilidad, a cambio de más cómputo.
- Salidas en arrays de NumPy, en coordenadas de píxel de la imagen de origen para la tarea de pose.
- Ejecución local en Apple Silicon mediante MLX, con memoria unificada y sin dependencia de CUDA.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, function calling, capacidades de agente, razonamiento multi-paso, ni capacidades multilingües. Es exclusivamente un modelo de visión para pose humana.
- No se documentan capacidades de audio, vídeo nativo ni modo de pensamiento.

## Casos de uso

- Análisis biomecánico deportivo: a partir de fotogramas o vídeo de un atleta, se detectan las personas con un detector y se pasan las cajas al modelo para obtener 308 keypoints por sujeto; el análisis de ángulos articulares permite evaluar la técnica de carrera, salto o levantamiento con un detalle superior al de los esquemas de 17 puntos.
- Captura de movimiento para animación y VFX: el modelo genera keypoints densos que pueden mapearse a un esqueleto de rigging, sirviendo como paso de previsualización o de rotoscopia asistida en producciones que trabajan con estaciones Mac.
- Ergonomía y prevención de riesgos laborales: procesando imágenes de puestos de trabajo, el modelo permite estimar posturas (flexión de tronco, elevación de brazos, posición de la cabeza) y detectar de forma sistemática posturas forzadas, con las 308 keypoints dando margen para métricas como RULA o REBA.
- Rehabilitación y análisis de la marcha: en entornos clínicos con equipos de Apple, se puede registrar al paciente en consulta y comparar la evolución de la pose entre sesiones; la salida en coordenadas de píxel facilita el cálculo de ángulos y desplazamientos si se conoce la escala.
- Anotación automática de datasets: el modelo se puede usar como etiquetador previo de pose en pipelines de anotación, generando 308 keypoints por persona que luego un revisor humano corrige, lo que reduce el coste de construir corpus de pose humana densa.
- Analítica de espacios comerciales o deportivos: con un detector de personas previo y este modelo como segunda etapa, se pueden medir ocupación, orientación del cuerpo, gestos y patrones de interacción, manteniendo el proceso en local sobre hardware Apple si se requiere evitar el envío de imágenes a servicios en la nube.
- Interfaces y avatares en tiempo real: en una aplicación de iPad, los keypoints obtenidos pueden conducir un avatar o una superposición de RA; el requisito es un detector de personas en el mismo dispositivo y una resolución de entrada moderada para mantener la latencia.
- Investigación en visión por computador: sirve como referencia reproducible de Sapiens2 en MLX para comparar arquitecturas, estudiar el efecto del bf16 frente al float32 o evaluar el coste del `flip_test` en precisión y tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas (AP, PCK, OKS ni equivalentes) y la búsqueda web realizada devuelve únicamente documentación general sobre el framework MLX, sin cifras del modelo. La ficha tampoco incorpora comparaciones con otros estimadores de pose. Para datos de evaluación habría que consultar la tarjeta del modelo original `facebook/sapiens2-pose-0.4b` y el artículo de ICLR 2026 de Sapiens2, no incluidos aquí.

## Requisitos de hardware

- Peso del modelo: 0,85 GB en bf16 (`model.safetensors`), dentro de un repositorio de 0,9 GB.
- Memoria necesaria estimada para inferencia: del orden de 1,5 a 3 GB de memoria unificada, incluyendo pesos y activaciones; la cifra exacta depende de la resolución de entrada, del número de personas por lote y de si se activa `flip_test`.
- Hardware objetivo: silicio de Apple (familias M1, M2, M3, M4 y posteriores) mediante MLX, que utiliza memoria unificada en lugar de VRAM dedicada.
- Cabe en hardware de consumo: sí, de forma holgada en cualquier Mac con 8 GB o más de memoria unificada; también en iPhone y iPad compatibles con MLX, dado el reducido tamaño del modelo.
- GPU NVIDIA: este repositorio es específico de MLX y no incluye pesos para CUDA. Para A100, H100 o RTX 4090 habría que partir del checkpoint original en PyTorch de `facebook/sapiens2-pose-0.4b`, de aproximadamente el doble de tamaño.
- Opciones de despliegue: `mlx-vlm` (versión 0.7.0 o superior) sobre MLX es la vía soportada oficialmente por esta conversión. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además están orientadas a modelos de lenguaje y no a esta tarea.
- Latencia y throughput: no disponibles. La model card no publica cifras de tiempo de inferencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión / formato | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/sapiens2-pose-0.4b-bf16 | 425.677.380 | bf16, safetensors (MLX) | Pose top-down, 308 keypoints | sapiens2-license | HuggingFace, ejecutable con mlx-vlm en Apple Silicon |
| facebook/sapiens2-pose-0.4b | No disponible en la información (mismo modelo base) | float32, PyTorch (Checkpoint de aproximadamente el doble de tamaño) | Pose top-down, 308 keypoints | sapiens2-license | HuggingFace, orientado a PyTorch/CUDA |
| Otros estimadores de pose de tamaño comparable | No disponible | No disponible | Pose humana | No disponible | No disponible |

No se dispone de datos de rendimiento de ninguno de ellos en la información proporcionada, por lo que la comparación se limita a parámetros, precisión, tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo `sapiens2-license` (marcada como `other`). Antes de cualquier uso comercial es imprescindible revisar https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md; la familia Sapiens de Meta ha empleado históricamente licencias no comerciales y no hay confirmación en la información disponible sobre qué permite exactamente la de Sapiens2.
- Dependencia de un detector externo: al ser un modelo top-down, la calidad final depende críticamente de las cajas de persona que reciba. Un detector deficiente en multitudes, oclusiones o sujetos parcialmente visibles degrada directamente los keypoints.
- Sin detección propia: si no se proporcionan cajas, el modelo asume la imagen completa, lo que en escenas con varias personas puede producir resultados incorrectos o mezclados.
- Sesgos de dominio: al ser un modelo centrado en el ser humano, su precisión depende de la distribución demográfica, de vestimenta y de condiciones de iluminación del conjunto de entrenamiento, que no se documenta en esta ficha. Cabe esperar un rendimiento desigual en función del tono de piel, la complexión, la ropa o la pose.
- Oclusiones y poses extremas: aunque los 308 keypoints dan mucha granularidad, las oclusiones severas, los encuadres parciales y las posturas muy alejadas de la distribución habitual siguen siendo fuentes de error.
- Ambigüedad en la interpretación de los 308 keypoints: la model card no desglosa la semántica de cada punto ni su agrupación por región anatómica, por lo que su uso en producción requiere mapear el índice a una parte del cuerpo.
- Uso limitado a visión: no genera texto, no admite instrucciones en lenguaje natural, no soporta tool calling ni agentes, y no procesa audio. No es adecuado para tareas conversacionales o de razonamiento.
- Sensibilidad a la resolución: las salidas se devuelven en la resolución de entrada para tareas densas y en coordenadas de píxel para pose, de modo que resoluciones bajas reducen la precisión de los puntos finos como manos o rostro.
- Riesgo en aplicaciones sensibles: cualquier uso en vigilancia, reconocimiento biométrico o evaluación de personas debe considerar las implicaciones legales y éticas, especialmente en la Unión Europea bajo el RGPD y la normativa de IA.
- Madurez del repositorio: el modelo registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que la validación comunitaria es prácticamente nula.
- Fecha de creación inusual: el repositorio figura como creado en septiembre de 2026, dato que conviene verificar, junto con la versión de `mlx-vlm` (0.7.0) que la model card exige para cargar los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/sapiens2-pose-0.4b-bf16
- Modelo base: https://huggingface.co/facebook/sapiens2-pose-0.4b
- Licencia de Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Framework MLX: https://mlx-framework.org/
- Repositorio de MLX en GitHub: https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
- MLX en Wikipedia: https://en.wikipedia.org/wiki/MLX_(software)
- Paquete `mlx-vlm`: citado en la model card como dependencia (`pip install -U mlx-vlm`), sin URL facilitada en la información disponible.

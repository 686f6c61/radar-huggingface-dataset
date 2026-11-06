# momolesang/InstantHMR

## Resumen

InstantHMR es un modelo de recuperación de malla humana 3D (human mesh recovery, HMR) en tiempo real a partir de una sola imagen RGB. Lo desarrolla Naturalpad Studio y se distribuye en formato ONNX a través de Hugging Face. El modelo resuelve el problema de estimar la pose y la forma corporal completa de una persona —70 keypoints 3D y una malla de 18.439 vértices— a partir de un recorte de imagen, empleando el rig Momentum Human Rig (MHR) de Meta como representación de salida.

La familia consta de cinco variantes de la red de predicción (nano, tiny, small, medium y medium-commercial), con entre 20,0 y 32,2 millones de parámetros, más un modelo compartido `mhr-body.onnx` que convierte los parámetros predichos en geometría 3D. La arquitectura es lo bastante ligera para ejecutarse en la NPU de un móvil: la variante medium tarda 5,49 ms por inferencia en un Galaxy S23, lo que la sitúa en el régimen de tiempo real estricto.

Su relevancia actual radica en dos factores: la eficiencia computacional (modelos de decenas de millones de parámetros, no de miles) y la separación entre pesos de investigación (CC BY-NC 4.0) y pesos comercializables (Apache-2.0), lo que permite evaluar el modelo en investigación y desplegar la variante comercial en producto sin cambiar de pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de regresión de parámetros corporales sobre recorte de imagen; salida en el rig MHR. Backbone no especificado en la información disponible (la versión legacy usaba RepViT) |
| Parametros totales | 20,0 M (nano), 20,3 M (tiny), 24,4 M (small), 32,2 M (medium y medium-commercial) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | No disponible; se distribuye en ONNX (FP32/FP16 no especificado) |
| Idiomas soportados | No disponible (modelo de visión, independiente del idioma) |
| Licencia | Per-file: CC BY-NC 4.0 (nano, tiny, small, medium) y Apache-2.0 (medium-commercial y mhr-body) |
| Formato de pesos | ONNX (`.onnx`); repo de 1,1 GB |

Detalles de entrada y salida de los grafos:

| Grafo | Entradas | Salidas |
|---|---|---|
| `instanthmr-*.onnx` | `image` (B, 3, S, S) normalizada con media y desviación de ImageNet, S en metadatos `image_size`; `cliff_cond` (B, 3) con la posición de la caja en el fotograma completo | `mhr_params` (B, 204), `shape_params` (B, 45), `cam_trans` (B, 3) en metros, `joints_2d` (B, 70, 2) en [-1, 1] sobre el recorte |
| `mhr-body.onnx` | `mhr_params`, `shape_params` | `joints_3d` (B, 70, 3) y `vertices` (B, 18439, 3) en metros, centrados en el cuerpo; caras de la malla en metadatos `mesh_faces` |

## Arquitectura y entrenamiento

InstantHMR es un regresor directo de parámetros: recibe un recorte de persona y devuelve los parámetros del rig MHR (204 dimensiones de pose, 45 de forma), la traslación de cámara y los keypoints 2D proyectados. El vector `cliff_cond` aporta la posición de la caja del recorte dentro del fotograma completo, un mecanismo de condicionamiento tipo CLIFF que mejora la estimación de la traslación en perspectiva. La geometría final la genera un segundo grafo, `mhr-body.onnx`, derivado del MHR de Meta (Apache-2.0), que produce 70 keypoints 3D y una malla de 18.439 vértices.

El entrenamiento utiliza las anotaciones publicadas del SAM 3D Body dataset de Meta. La composición del dataset difiere entre variantes por motivos de licencia: las variantes nano, tiny, small y medium incluyen imágenes de SA-1B y AI Challenger, cuyos términos solo permiten uso de investigación, de ahí su licencia CC BY-NC 4.0. La variante medium-commercial se entrenó únicamente con Harmony4D e imágenes COCO bajo CC BY o sin copyright conocido, y se publica bajo Apache-2.0. No se especifican en la información disponible el número de tokens, las funciones de pérdida ni si hubo etapas de refinamiento adicionales.

## Capacidades

- Recuperación de malla humana 3D completa (18.439 vértices) a partir de un único recorte de imagen RGB.
- Estimación de 70 keypoints 3D y 70 keypoints 2D proyectados sobre el recorte.
- Predicción de parámetros de forma corporal (45 dimensiones) y de pose (204 dimensiones) en el rig MHR.
- Estimación de traslación de cámara en metros (`cam_trans`), con condicionamiento por posición de caja (`cliff_cond`).
- Inferencia en tiempo real: 4,60–5,49 ms por muestra en NPU de Galaxy S23 según variante.
- Exportación ONNX lista para despliegue en dispositivos móviles y edge.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo de visión 3D.

## Casos de uso

- **Captura de movimiento en móvil sin marcadores**: integrado en una app Android o iOS mediante ONNX Runtime con aceleración NPU, el modelo permite reconstruir la pose 3D del usuario a partir de la cámara en tiempo real (menos de 6 ms por fotograma en un Galaxy S23), habilitando avatares y animación en directo.
- **Prueba virtual de ropa y calzado**: la malla de 18.439 vértices y los parámetros de forma (45 dimensiones) permiten ajustar prendas a la complexión real del usuario; el modelo medium ofrece el mejor equilibrio entre precisión (PA-MPJPE de 40,0 mm en 3DPW) y latencia.
- **Análisis biomecánico y fisioterapia**: los 70 keypoints 3D en metros, con traslación de cámara, permiten medir ángulos articulares y rangos de movimiento desde vídeo doméstico; la variante medium-commercial es la única apta para un producto sanitario con licencia Apache-2.0.
- **Animación y VFX de bajo coste**: generación de mallas animables a partir de fotografías para pipelines de previsualización, usando `mhr-body.onnx` para obtener vértices y caras directamente compatibles con el rig MHR.
- **Análisis deportivo automatizado**: estimación de la pose del atleta en cada fotograma de vídeo para calcular cinemática (velocidad angular de articulaciones, postura de carrera) con latencia despreciable frente a la captura de vídeo.
- **Robótica e interacción humano-máquina**: percepción de la postura humana en tiempo real en sistemas embebidos, dado que el modelo nano ocupa 20,0 M de parámetros y puede ejecutarse en hardware de bajo consumo.
- **Etiquetado y aumento de datos 3D**: generación automática de anotaciones de malla sobre grandes corpus de imágenes para entrenar otros modelos, usando la variante medium para máxima calidad y la nano para filtrado rápido.

## Benchmarks y rendimiento

Datos publicados en la model card (PA-MPJPE en milímetros, menor es mejor; latencia en NPU de Galaxy S23):

| Modelo | Parametros | EMDB-1 PA-MPJPE (mm) | 3DPW PA-MPJPE (mm) | Galaxy S23 NPU (ms) | Licencia |
|---|---|---|---|---|---|
| instanthmr-nano | 20,0 M | 61,7 | 46,6 | 4,60 | CC BY-NC 4.0 |
| instanthmr-tiny | 20,3 M | 58,0 | 44,0 | 4,84 | CC BY-NC 4.0 |
| instanthmr-small | 24,4 M | 53,3 | 41,7 | 5,38 | CC BY-NC 4.0 |
| instanthmr-medium | 32,2 M | 48,8 | 40,0 | 5,49 | CC BY-NC 4.0 |
| instanthmr-medium-commercial | 32,2 M | 72,2 | 50,7 | 5,49 | Apache-2.0 |

No se han publicado resultados de otros benchmarks (MPI-INF-3DHP, Human3.6M, AGORA) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 20–32 M de parámetros, los pesos ocupan entre 80 MB y 130 MB en FP32 y la mitad en FP16; la inferencia cabe holgadamente en cualquier GPU con 1 GB de memoria. El repo completo pesa 1,1 GB por incluir todas las variantes y el modelo `mhr-body.onnx`.
- **GPU recomendadas**: cualquier GPU moderna sirve; para lotes grandes se recomienda A100, H100 o RTX 4090. Para despliegue en servidor de baja latencia, una T4 o L4 es suficiente.
- **GPU de consumo**: cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060 y superiores, así como en iGPU con al menos 1 GB de memoria compartida.
- **Despliegue**: ONNX Runtime (CPU, CUDA, CoreML, NNAPI/QNN para NPU móvil); también es compatible con TensorRT y OpenVINO mediante conversión. El repositorio de código incluye `demo.py` para inferencia sobre imagen.
- **Latencia y throughput**: 4,60–5,49 ms por muestra en NPU de Galaxy S23 según variante (medido por el autor). En GPU de escritorio la latencia será inferior al milisegundo para lotes pequeños; no se publican cifras de throughput en GPU en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente:

| Modelo | Parametros | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|
| InstantHMR (medium) | 32,2 M | HMR monocular en tiempo real, salida en rig MHR | CC BY-NC 4.0 / Apache-2.0 (variante comercial) | Hugging Face, ONNX |
| InstantHMR (nano) | 20,0 M | HMR monocular en edge/móvil | CC BY-NC 4.0 | Hugging Face, ONNX |
| Otros modelos HMR monocular | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Licencia restrictiva en cuatro de las cinco variantes**: nano, tiny, small y medium son CC BY-NC 4.0 y no pueden usarse con fines comerciales. Solo `instanthmr-medium-commercial.onnx` es Apache-2.0.
- **Penalización de precisión en la variante comercial**: el modelo medium-commercial empeora el PA-MPJPE de 48,8 a 72,2 mm en EMDB-1 y de 40,0 a 50,7 mm en 3DPW respecto al medium de investigación, por la restricción del dataset de entrenamiento.
- **Dependencia del recorte y de la caja**: la calidad depende de un recorte correcto de la persona y del vector `cliff_cond`; el pipeline de detección previa no forma parte del modelo y debe aportarlo el usuario.
- **Sesgos del dataset**: entrenado sobre SA-1B, AI Challenger, Harmony4D y COCO; la distribución de poses, complexiones y condiciones de iluminación de estos corpus condiciona el rendimiento en dominios no representados.
- **Riesgo de estimaciones plausibles pero incorrectas**: como todo regresor de malla, puede producir geometrías coherentes visualmente pero métricamente erróneas en oclusiones, poses extremas o recortes parciales; no debe usarse como instrumento de medida clínica sin validación.
- **Sin capacidades de lenguaje ni agentes**: no procesa texto, no soporta tool calling y no puede emplearse en tareas conversacionales.
- **Formato ONNX exclusivamente**: no se distribuyen pesos en safetensors ni GGUF; el reentrenamiento o el ajuste fino requiere exportar desde el código del repositorio.
- **Idiomas**: no aplica, pero la ausencia de metadatos de idioma impide cualquier verificación al respecto.

## Enlaces

- Hugging Face: https://huggingface.co/momolesang/InstantHMR
- Repositorio de código, demo y entrenamiento: https://github.com/Naturalpad-studio/InstantHMR
- Licencia detallada: https://github.com/Naturalpad-studio/InstantHMR#licence
- Momentum Human Rig (MHR): https://github.com/facebookresearch/MHR
- Dataset SAM 3D Body: https://huggingface.co/datasets/facebook/sam-3d-body-dataset

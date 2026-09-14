# mlx-community/sapiens2-pointmap-0.4b-bf16

## Resumen

mlx-community/sapiens2-pointmap-0.4b-bf16 es la conversión al framework MLX de Apple y a precisión bfloat16 del checkpoint facebook/sapiens2-pointmap-0.4b, un modelo de visión de Meta englobado en la familia Sapiens2 (presentada en ICLR 2026) y orientado a tareas centradas en personas. La tarea concreta de esta variante es la predicción de *pointmaps*: para cada píxel de la imagen de entrada el modelo devuelve sus coordenadas XYZ y un factor de escala global, lo que equivale a una reconstrucción 3D densa de la escena.

El checkpoint de referencia está en float32 y se ha convertido con mlx-vlm 0.7.0, con todos los parámetros en bfloat16 y las proyecciones q/k/v fusionadas en un único tensor `wqkv` por bloque, tal y como espera la implementación de Sapiens2 en mlx-vlm. El repositorio ocupa 1,1 GB y el fichero de pesos pesa 1,06 GB, aproximadamente la mitad que el checkpoint original. El identificador comercial dice "0.4b", pero el recuento real de safetensors es de 528.675.380 parámetros.

Su relevancia práctica es doble: por un lado cubre una tarea de visión poco habitual (un pointmap denso por píxel en lugar de un mapa de profundidad escalar) y, por otro, permite ejecutarla en local sobre Apple silicon sin depender de CUDA ni de servicios en la nube. La contrapartida es que se trata de una conversión no oficial de la comunidad, con cero descargas y cero *likes* registrados en el momento de redactar esta ficha, sin benchmarks publicados y con una licencia no permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión con cabecera de predicción de pointmaps (los pesos incluyen proyecciones q/k/v y `wqkv` fusionado por bloque); detalle completo de capas y dimensión oculta no disponible |
| Parametros totales | 528.675.380 (~0,53 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de texto. La salida se genera a la resolución de la imagen de entrada (tareas densas) o en coordenadas de píxel de la imagen origen (pose) |
| Tipos de cuantizacion | bfloat16 en este repositorio; el checkpoint de referencia está en float32. No se ofrecen variantes GGUF ni cuantizaciones de 4 u 8 bits |
| Idiomas soportados | no disponible (modelo de visión; no procesa lenguaje natural) |
| Licencia | sapiens2-license (etiquetada como `other` en HuggingFace), https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md |
| Formato de pesos | safetensors en bfloat16, librería `mlx` |
| Modelo base | facebook/sapiens2-pointmap-0.4b |
| Tarea declarada (pipeline) | depth-estimation (predicción de pointmaps XYZ por píxel más escala) |
| Tamano del repositorio | 1,1 GB (fichero `model.safetensors` de 1,06 GB) |
| Herramienta de conversion | mlx-vlm 0.7.0 |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible describe una conversión de pesos, no el entrenamiento. El modelo es un transformer de visión: la model card indica que las proyecciones q/k/v de cada bloque se han fusionado en un único tensor `wqkv`, que es la disposición que espera el modelo Sapiens2 implementado en mlx-vlm. La conversión mantiene todos los parámetros en bfloat16, la misma precisión mixta que usa la inferencia del checkpoint de referencia, y no altera la topología de la red, solo el formato y el tipo numérico. El checkpoint original en float32 pesa el doble, según la propia model card.

No hay información disponible sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, el uso de RLHF/DPO o cualquier otra técnica de alineamiento, ni sobre innovaciones de atención o decodificación. La única referencia de contexto es que Sapiens2 se presenta en ICLR 2026 y que la familia está etiquetada como *human-centric*. Cualquier afirmación sobre datos de preentrenamiento o sobre el backbone concreto (número de capas, dimensión de embedding, tamaño de parche) sería especulativa y no se incluye aquí.

## Capacidades

- Predicción de pointmaps por píxel: devuelve un tensor de forma (H, W, 3) con coordenadas XYZ y un factor de escala de forma (1,) para la imagen completa.
- Estimación de profundidad densa derivada del pointmap, ya que la coordenada Z contiene la distancia por píxel.
- Salida en dos sistemas de referencia según la tarea: a la resolución de entrada para tareas densas y en coordenadas de píxel de la imagen origen para pose.
- Procesamiento centrado en el ser humano: la familia Sapiens2 está especializada en imágenes de personas.
- Ejecución local en Apple silicon mediante MLX, con salidas en arrays de NumPy listos para postprocesado.
- No dispone de generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta *tool calling*, *function calling*, uso agéntico ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesa audio o vídeo (la entrada documentada es una imagen).
- No se documenta un modo de razonamiento extendido ni *thinking mode*.

## Casos de uso

- Reconstruccion 3D de personas a partir de una unica fotografia: el pointmap por píxel permite obtener una nube de puntos con escala, útil para escaneo corporal, catalogación de tallas o gemelos digitales de usuarios.
- Probador virtual y comercio electronico de moda: la geometría estimada de la persona sirve como soporte para colocar prendas con perspectiva y oclusión coherentes, ejecutando todo en local en un Mac.
- Captura de movimiento y retargeting para animación: al devolver coordenadas en el sistema de píxeles de la imagen origen para la tarea de pose, la salida se puede mapear directamente sobre un rig sin recalcular transformaciones.
- Biomecanica y analisis deportivo: medir distancias y ángulos en 3D entre articulaciones a partir de vídeo o fotogramas, útil para evaluación de técnica o rehabilitación.
- Generacion de datos sinteticos y etiquetado: producir pointmaps como etiquetas densas para entrenar o validar otros modelos de profundidad, reconstrucción o segmentación 3D.
- Realidad aumentada en el dispositivo: anclar objetos virtuales a la geometría de una persona sin enviar imágenes a la nube, con el consiguiente beneficio de privacidad y latencia.
- Desarrollo y prototipado en portatiles Mac: al ser una conversión MLX de 1,06 GB de pesos, permite iterar sobre pipelines de visión sin GPU dedicada ni acceso a un clúster.
- Preprocesado en estudios de antropometria: obtener medidas aproximadas de volumen y proporciones corporales a partir de imágenes de archivo, siempre que se valide el error métrico del modelo en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio convertido no incluye métricas (ni de error de profundidad, ni de *pose*, ni comparaciones con otros modelos), y el repositorio registra cero descargas y cero *likes*, por lo que no existe validación comunitaria pública que pueda citarse.

## Requisitos de hardware

- Framework obligatorio: MLX, que se ejecuta sobre Apple silicon con memoria unificada. No hay soporte documentado para CUDA, ROCm ni aceleradores Intel.
- Peso de los pesos: 1,06 GB en bfloat16 frente a aproximadamente 2,1 GB del checkpoint float32 de referencia (el doble, según la model card).
- Memoria unificada estimada para inferencia (estimación propia, no publicada por el autor): alrededor de 2 a 3 GB considerando pesos, activaciones y buffers de imagen de resolución moderada. Con 8 GB de memoria unificada debería ser holgadamente suficiente; 16 GB o más da margen para imágenes grandes y lotes.
- Cabe en cualquier Mac con chip de la serie M (M1 o posterior). No requiere GPU dedicada.
- Opciones de despliegue: MLX directamente o la librería mlx-vlm (`pip install -U mlx-vlm`), cargando el modelo con `mlx_vlm.load` y usando `Sapiens2Predictor` para la inferencia. No hay soporte para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje y no se distribuye en GGUF.
- Latencia y throughput: no disponibles. No se han publicado tiempos de inferencia ni FPS para este repositorio.

## Comparativa con modelos similares

La única alternativa documentada en la información disponible es el checkpoint original del que deriva esta conversión.

| Aspecto | mlx-community/sapiens2-pointmap-0.4b-bf16 | facebook/sapiens2-pointmap-0.4b |
|---|---|---|
| Parametros | 528.675.380 | no disponible (la model card indica que el checkpoint float32 duplica el tamano) |
| Precision | bfloat16 | float32 |
| Tamano de pesos | 1,06 GB | ~2,1 GB (el doble, segun la model card) |
| Formato | safetensors (MLX) | no disponible (se deduce un checkpoint para PyTorch, sin confirmar) |
| Fusion q/k/v | Si, en un tensor `wqkv` por bloque | no disponible |
| Framework de ejecucion | MLX (Apple silicon) | no disponible |
| Licencia | sapiens2-license | sapiens2-license |
| Mantenimiento | comunidad (mlx-community), conversion no oficial | Meta (modelo base) |
| Tarea | Pointmaps XYZ por pixel + escala | Pointmaps XYZ por pixel + escala |

No se dispone de datos de otros modelos comparables de pointmaps o profundidad centrados en personas (parámetros, contexto, licencia o rendimiento) dentro de la información proporcionada, por lo que no se incluye una comparación adicional.

## Limitaciones y advertencias

- Licencia `sapiens2-license` (etiquetada como `other` en HuggingFace): no es Apache 2.0, MIT ni ninguna licencia permisiva estándar. Es imprescindible revisar el texto completo enlazado antes de cualquier uso comercial, ya que puede incluir restricciones de uso, cláusulas de atribución o limitaciones por dominio.
- Conversión no oficial: la realiza la organización `mlx-community`, no Meta. Puede haber diferencias numéricas respecto al checkpoint float32 original, especialmente por el paso a bfloat16.
- Precisión reducida: el uso exclusivo de bfloat16 implica menor rango dinámico y precisión que float32; para tareas de metrología fina conviene validar el error antes de confiar en las medidas.
- Sin benchmarks: no hay ninguna métrica publicada que permita estimar el error de profundidad, el error de escala o la degradación respecto al modelo original. Cero descargas y cero *likes* implican ausencia de validación por terceros.
- Riesgo de geometría plausible pero incorrecta: los pointmaps son estimaciones, no medidas calibradas. El factor de escala se predice y no procede de una calibración física, por lo que las distancias absolutas pueden ser inconsistentes entre imágenes.
- Sesgos del dominio de entrenamiento: no hay información sobre la composición del dataset de Sapiens2. Al tratarse de un modelo *human-centric*, cabe esperar un comportamiento degradado en escenas sin personas o en morfologías, edades, tonos de piel o indumentaria poco representados, pero no hay datos publicados al respecto.
- Sin capacidades de lenguaje: no admite instrucciones en texto, *prompts*, ni integración directa en cadenas de razonamiento; debe insertarse como componente de visión dentro de un pipeline mayor.
- Dependencia de plataforma: al ser MLX, queda restringido a hardware Apple. No hay ruta documentada para CUDA, ROCm o despliegue en servidores x86 convencionales, salvo reconvertir al formato y framework del checkpoint base.
- Resolución y memoria: no se documenta la resolución de entrada óptima ni el comportamiento con imágenes muy grandes; los requisitos de memoria escalan con la resolución, ya que la salida densa es (H, W, 3).
- Sin garantía de mantenimiento: es un repositorio de conversión recién creado (13 de septiembre de 2026) y sin actividad registrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/sapiens2-pointmap-0.4b-bf16
- Modelo base: https://huggingface.co/facebook/sapiens2-pointmap-0.4b
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Repositorio de Sapiens2 (referenciado en la licencia): https://github.com/facebookresearch/sapiens2
- Libreria mlx-vlm (referenciada en la model card, instalable con `pip install -U mlx-vlm`): no se ha encontrado una URL en los resultados de busqueda disponibles
- MLX, framework de Apple para Apple silicon: https://mlx-framework.org/
- Codigo fuente de MLX: https://github.com/ml-explore/mlx
- Pagina de MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio (aplicacion de escritorio basada en MLX): https://mlx.studio/
- Entrada de MLX en Wikipedia: https://en.wikipedia.org/wiki/MLX_(software)

# BrutalCaesar/dpp_so101_cubcyl_recovery_tp48_avgpool_emb256_3cam

## Resumen

Este modelo es una política de control robótico basada en Diffusion Policy, desarrollada por BrutalCaesar dentro del proyecto Φ (phi) de aprendizaje robótico. Su objetivo es que un brazo robótico SO-101 con tres cámaras (muñeca, frontal y superior) realice tareas de recuperación de cubos y cilindros en un entorno controlado. El modelo combina un encoder de visión DINOv2 ViT-S/14 congelado, cuyos tokens de parche se promedian por cámara, con un denoiser transformer que genera secuencias de acciones de 48 pasos.

La relevancia de este modelo radica en que sirve como brazo de control en un estudio que compara distintas estrategias de codificación visual para manipulación robótica. Los resultados muestran que el promedio de tokens supera en un 28% a la opción de parches densos en términos de pérdida de denoising, un hallazgo contrario a la hipótesis del artículo Patch Policy. Además, el modelo destaca por su tamaño compacto (31,1 millones de parámetros totales, de los cuales solo 9 millones son entrenables) y por su baja latencia de inferencia (~403 ms por chunk de 48 acciones).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy con denoiser transformer y encoder DINOv2 ViT-S/14 congelado (patch tokens promediados por cámara) |
| Parametros totales | 31.129.356 |
| Parametros activos | 9.072.774 (entrenables) + 22.056.576 (congelados, DINOv2) |
| Longitud de contexto | No aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Diffusion Policy (Chi et al., arXiv 2303.04137) con un denoiser basado en transformer. El encoder visual es un DINOv2 ViT-S/14 preentrenado y congelado, que procesa imágenes de 3×480×640 píxeles. Tras el recorte y redimensionado, cada cámara genera 300 tokens de parche que se promedian (mean-pooling) en un único token por cámara, resultando en 3 tokens de condición. El denoiser tiene 8 capas, 4 cabezas de atención, dimensión de embedding 256 y atención bidireccional (no causal). La predicción de acciones se realiza mediante DDIM con 16 pasos de inferencia sobre 100 timesteps de entrenamiento, con predicción tipo epsilon.

El entrenamiento se realizó sobre el dataset propio BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1, con 30.000 pasos, batch de 64, optimizador Adam (lr 1e-4, weight decay 1e-6), scheduler coseno con 500 warmup steps y semilla 1000. La normalización es IDENTITY para visual, MIN_MAX para estado y acciones. El modelo se entrenó como brazo de control en un estudio que comparaba el efecto de mantener parches densos frente a promediarlos, así como el impacto de la máscara de atención (causal vs bidireccional). La pérdida en validación alcanzó 0.0117 en el paso 28.000.

## Capacidades

- Generación de secuencias de acciones de 48 pasos (horizonte) para control robótico de un brazo SO-101.
- Percepción visual multi-cámara (3 cámaras: muñeca, frontal y superior) con encoder DINOv2 congelado.
- Tarea específica de recuperación de cubos y cilindros (pick-and-place) en un entorno de sobremesa.
- Inferencia con DDIM en 16 pasos, lo que permite un tiempo de ejecución de ~403 ms por chunk en hardware Apple Silicon (MPS).
- Atención bidireccional entre tokens de acción, que permite al modelo aprovechar información de todas las posiciones al denoising simultáneo.
- No soporta procesamiento de lenguaje, tool calling ni agentes conversacionales; es un modelo puramente de control motor.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo SO-101 para tareas de recogida y colocación de objetos pequeños (cubos y cilindros) en entornos de investigación.
- Evaluación de estrategias de codificación visual en robótica: sirve como referencia para comparar el rendimiento de pooling frente a parches densos en políticas de difusión, como se documenta en la model card.
- Prototipado rápido de políticas de control: su tamaño reducido y baja latencia permiten iterar rápidamente en entornos de simulación o con hardware modesto.
- Base para fine-tuning en tareas similares: al ser un modelo pequeño con encoder congelado, puede adaptarse a nuevas tareas de manipulación con pocos datos.
- Investigación en atención bidireccional para diffusion policies: el modelo demuestra que eliminar la máscara causal mejora la pérdida, lo que puede guiar el diseño de arquitecturas futuras.
- Despliegue en sistemas embebidos: con solo 31M parámetros, es viable ejecutarlo en GPUs de gama baja o incluso en aceleradores de borde, siempre que se disponga de soporte para el encoder DINOv2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. La model card reporta la pérdida de denoising en validación y una comparación interna entre variantes del mismo estudio:

| Encoder | Atención | Memory tokens | Pérdida mínima en validación |
|---|---|---|---|
| DINOv2, avg-pooled (este modelo) | bidireccional | 9 | 0.0117 |
| DINOv2, CLS token | bidireccional | 9 | 0.0119 |
| ResNet-18 (entrenado desde cero) + SpatialSoftmax | bidireccional | 3 | 0.0132 |
| DINOv2, parches densos | bidireccional | 1803 | 0.0163 |
| DINOv2, parches densos | causal | 1803 | 0.0380 |
| ResNet-18 + SpatialSoftmax | causal | 3 | 0.0287 → 0.0361 (sobreajuste) |

Además, se reporta una inferencia de ~403 ms por chunk de 48 pasos con 16 pasos DDIM en Apple Silicon MPS (batch 1). No hay datos de éxito en tarea real sobre el brazo físico.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 31M parámetros, por lo que en FP32 ocupa ~124 MB; en FP16 ~62 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM, incluidas tarjetas de gama baja.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior), también compatible con Apple Silicon (MPS) como se probó en el desarrollo. No requiere A100 ni H100.
- En consumer GPU: sí, cabe en RTX 3060, RTX 4060, etc. Incluso en iGPU integradas con suficiente memoria compartida.
- Opciones de despliegue: el modelo está diseñado para usarse con la librería LeRobot (Hugging Face), aunque requiere un tipo de política personalizada (`diffusion_patch`) que no está incluida en la versión estándar de LeRobot. Se puede integrar en pipelines de robótica con ROS o directamente en Python.
- Latencia: ~403 ms por chunk de 48 acciones en MPS; en GPU NVIDIA probablemente sea menor, aunque no se han publicado datos.
- Throughput: no disponible.

## Comparativa con modelos similares

El modelo se puede comparar con las otras variantes del mismo estudio, que comparten la misma tarea y datos:

| Modelo | Encoder | Atención | Params entrenables | Pérdida validación |
|---|---|---|---|---|
| Este modelo (avg-pooled) | DINOv2 ViT-S/14 | bidireccional | 9,07M | 0.0117 |
| Variante CLS token | DINOv2 ViT-S/14 | bidireccional | 9,07M | 0.0119 |
| Variante parches densos | DINOv2 ViT-S/14 | bidireccional | 9,07M | 0.0163 |
| Variante ResNet-18 + SpatialSoftmax | ResNet-18 | bidireccional | ~? (no indicado) | 0.0132 |

No se dispone de comparación con modelos de terceros (por ejemplo, otras diffusion policies para el mismo brazo) en la información proporcionada.

## Limitaciones y advertencias

- La pérdida de denoising en validación no es equivalente a éxito en tarea real; el modelo no ha sido desplegado en el brazo físico.
- Requiere un tipo de política personalizada (`diffusion_patch`) que no carga con la versión estándar de LeRobot; es necesario modificar el código.
- El `train_config.json` conserva rutas originales del clúster de entrenamiento, lo que puede causar errores al cargar si no se ajustan.
- El estudio es de alcance limitado: una sola tarea, un solo dataset, y la tarea es relativamente gruesa (pick-and-place) en comparación con las tareas de baja tolerancia del artículo Patch Policy.
- Los resultados no refutan la hipótesis de Patch Policy; son un contraejemplo específico.
- No se han evaluado sesgos ni alucinaciones (no aplica al ser un modelo de control, pero no hay garantías de robustez ante variaciones del entorno).
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de DINOv2 (Apache 2.0) y Diffusion Policy (MIT), por lo que se deben respetar sus términos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BrutalCaesar/dpp_so101_cubcyl_recovery_tp48_avgpool_emb256_3cam
- Dataset: https://huggingface.co/datasets/BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1
- Paper Patch Policy: https://arxiv.org/abs/2607.18236
- Código Patch Policy: https://github.com/gaoyuezhou/patch_policy
- Paper Diffusion Policy: https://arxiv.org/abs/2303.04137
- Código Diffusion Policy: https://github.com/real-stanford/diffusion_policy
- DINOv2: https://github.com/facebookresearch/dinov2
- LeRobot: https://github.com/huggingface/lerobot

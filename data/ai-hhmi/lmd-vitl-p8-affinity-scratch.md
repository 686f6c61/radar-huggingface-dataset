# ai-hhmi/lmd-vitl-p8-affinity-scratch

## Resumen

`lmd-vitl-p8-affinity-scratch` es un modelo de segmentación de imágenes 3D especializado en predicción de afinidades de vóxeles para la segmentación de neuronas en microscopía electrónica y de expansión. Lo desarrolla el equipo AI-HHMI y se distribuye a través de HuggingFace. El modelo resuelve un problema concreto del campo de la conectómica: transformar volúmenes de imagen en mapas de afinidad que permiten reconstruir neuronas individuales mediante algoritmos de watershed mutex.

Arquitectónicamente es un híbrido: un codificador DINOv3 ViT-L adaptado a 3D (parches de 8³ vóxeles) acoplado a un decodificador UNETR. El codificador se inicializa desde `lmd-vitl-p8-simmim-scratch` (entrenado con SimMIM sobre el dataset LMD) y se afina de extremo a extremo junto al decodificador. El checkpoint publicado corresponde al paso 75.000 de un entrenamiento de 100.000 pasos, seleccionado por su rendimiento en el split de ajuste del benchmark del autor.

La relevancia del modelo radica en su especialización: no es un modelo de propósito general, sino una herramienta de precisión para un pipeline científico concreto (resolución de 8 nm, vóxeles isotrópicos, ventanas de 256³). Con 304,8 M de parámetros totales y un tamaño de repo de 1,2 GB, está pensado para ejecutarse en GPU con precisión bf16 y para integrarse en flujos de trabajo de segmentación de volúmenes completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L 3D (codificador) + UNETR (decodificador) |
| Parámetros totales | 304.815.008 (303 M codificador + 1,85 M decodificador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de volumen 3D, ventanas de 256³ vóxeles) |
| Tipos de cuantización | no disponible (pesos publicados en fp32; inferencia con autocast bf16) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | dinov3-license (other) |
| Formato de pesos | safetensors (fp32, 1,22 GB) |

## Arquitectura y entrenamiento

El codificador es un ViT-L de DINOv3 adaptado a volúmenes 3D con parches de 8³ vóxeles, denominado `DinoVisionTransformer3D`. Produce mapas de características intermedios que el decodificador UNETR consume: concretamente lee los bloques 8, 16 y 24 (`skip_layers = [7, 15, 23]`, indexados desde 0) junto con la imagen cruda. El UNETR aplica tres etapas de upsampling por factor 2, con 64, 32 y 16 canales a strides 4, 2 y 1 respectivamente, y genera 6 canales de logits de afinidad, uno por cada offset definido en la configuración.

El entrenamiento parte de una inicialización aleatoria del codificador, seguida de preentrenamiento SimMIM sobre el dataset LMD (100.000 pasos), y después un afinamiento de extremo a extremo con el decodificador UNETR sobre 41 volúmenes etiquetados a 8 nm. El checkpoint publicado es el paso 75.000 de una ejecución de 100.000 pasos. Los offsets de predicción son (1,0,0), (0,1,0), (0,0,1), (10,0,0), (0,10,0) y (0,0,10) en vóxeles; cada canal predice si un vóxel y su vecino desplazado pertenecen al mismo objeto.

## Capacidades

- Predicción de afinidades de vóxeles para segmentación de neuronas en volúmenes 3D de microscopía electrónica y de expansión.
- Procesamiento de volúmenes con vóxeles isotrópicos de 8 nm y ventanas de entrada de 256³ vóxeles (aunque el modelo admite otros tamaños, no fueron probados).
- Salida de 6 canales de logits de afinidad correspondientes a tres offsets cortos (distancia 1) y tres largos (distancia 10).
- Inferencia con autocast bf16 en GPU para reducir requisitos de memoria.
- Integración con el pipeline de `mia-train` (entrenador y `predict.py`) y con `mia-evals` para evaluación.
- Segmentación de volúmenes completos mediante predicción por ventanas con solapamiento, agregación ponderada y watershed mutex.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente de visión 3D.

## Casos de uso

- Reconstrucción de conectomas neuronales: el modelo genera mapas de afinidad que, tras aplicar watershed mutex y eliminar segmentos menores de 20.000 vóxeles, permiten reconstruir neuronas individuales en volúmenes de microscopía electrónica. Es adecuado porque está entrenado específicamente sobre 41 volúmenes etiquetados a 8 nm.
- Segmentación de datos de microscopía de expansión: el modelo cubre explícitamente ambos dominios (electron-microscopy y expansion-microscopy) en sus etiquetas, lo que permite usarlo en flujos de expansión con la misma convención de entrada.
- Análisis de volúmenes completos en pipelines científicos: mediante `mia-train/predict.py`, se predicen ventanas de 256³ con stride de 128, se mapean los logits con `sigmoid(0.2 * logit)`, se promedian con pesos lineales desde las caras al centro y se aplica watershed mutex.
- Preentrenamiento y transferencia: los pesos del codificador se guardan bajo el prefijo `encoder.`, por lo que pueden iniciar una cabeza distinta para otras tareas de segmentación 3D.
- Evaluación reproducible de algoritmos de segmentación: al publicarse el checkpoint exacto (paso 75.000) y las convenciones de normalización, sirve como referencia para comparar métodos de segmentación de conectómica.
- Procesamiento por lotes en infraestructura GPU: con 304,8 M de parámetros y fp32/bf16, se puede desplegar en GPUs de centro de datos para procesar series de volúmenes de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el checkpoint del paso 75.000 obtuvo el mejor resultado en el split de ajuste del benchmark del autor, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 304,8 M de parámetros en fp32, los pesos ocupan aproximadamente 1,22 GB; en bf16 se reduce a unos 0,61 GB, a lo que hay que sumar activaciones para ventanas de 256³.
- GPU recomendadas: no disponible. El autor usa autocast bf16 en CUDA, lo que sugiere GPUs con soporte bf16 (Ampere o posteriores).
- ¿Cabe en GPU consumer? No confirmado; por tamaño de pesos es plausible en GPUs con suficiente VRAM para ventanas de 256³, pero no hay datos publicados.
- Opciones de despliegue: PyTorch 2.13, NumPy, safetensors, huggingface_hub y el código de `mia-train` en el commit `0fe3872` (no se instala; se añade `mia-train/src` al path). Para la ruta completa con `predict.py` se requieren además `miao-io` y `connected-components-3d`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Inicialización | Entrenamiento | Parámetros | Contexto/entrada | Licencia |
|---|---|---|---|---|---|
| `lmd-vitl-p8-affinity-scratch` (este) | SimMIM scratch | afinidades, 75k pasos | 304,8 M | ventanas 256³, 8 nm | dinov3-license |
| `lmd-vitl-p8-affinity-lvd` | SimMIM desde DINOv3 ViT-L/16 LVD-1689M | afinidades, 100k pasos | no disponible | ventanas 256³, 8 nm | dinov3-license |
| `lmd-vitl-p8-simmim-scratch` | aleatoria | SimMIM en LMD, 100k pasos | 303 M (codificador) | no disponible | dinov3-license |
| `lmd-vitl-p8-simmim-lvd` | DINOv3 ViT-L/16, LVD-1689M | SimMIM en LMD, 100k pasos | no disponible | no disponible | dinov3-license |

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice afinidades de vóxeles para segmentación de neuronas; no es un modelo de propósito general.
- Requiere vóxeles isotrópicos de 8 nm; otros datos deben remuestrearse antes de la inferencia.
- Las intensidades deben estar en [0, 1] con la normalización exacta del entrenamiento: datos de 8 bits divididos por 255; datos de 16 bits y float recortados a los percentiles 0,1 y 99,9 y reescalados a [0, 1].
- Cada lado de la entrada debe ser múltiplo de 8 vóxeles; el entrenamiento y la evaluación usaron ventanas de 256³, y otros tamaños no fueron probados.
- El orden de ejes es (x, y, z); los arrays almacenados como (z, y, x) (OME-Zarr, N5) requieren `array.transpose(2, 1, 0)`.
- Licencia `dinov3-license` (other): es necesario revisar los términos en el enlace oficial antes de cualquier uso comercial.
- El código de `mia-train` tiene paquetes de nivel superior con nombres genéricos (`models`, `layers`, `utils`, `distributed`, `data`) que pueden ensombrecer paquetes homónimos como `distributed` de Dask.
- No hay datos publicados de benchmarks, latencia ni requisitos de VRAM, lo que dificulta estimar el rendimiento en producción.
- Riesgo de alucinación y sesgos: no aplica en el sentido lingüístico, pero sí existe riesgo de segmentaciones erróneas en dominios de imagen distintos al de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-scratch
- Modelo base (codificador): https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-scratch
- Variante con inicialización LVD: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-lvd
- Codificador SimMIM desde LVD: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-lvd
- Repositorio de código: https://github.com/AI-HHMI/mia-train (commit `0fe3872`)
- Herramientas de evaluación: https://github.com/AI-HHMI/mia-evals
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Paper referenciado: arXiv:2508.10104

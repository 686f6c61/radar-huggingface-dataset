# ai-hhmi/lmd-vitl-p8-simmim-lvd

## Resumen

`ai-hhmi/lmd-vitl-p8-simmim-lvd` es un codificador Vision Transformer tridimensional especializado en microscopía de volúmenes, desarrollado por el equipo AI-HHMI. Parte de la arquitectura DINOv3 ViT-L/16 de Meta (pesos LVD-1689M), cuyos pesos 2D se "inflan" a 3D y se preentrenan con el objetivo auto-supervisado SimMIM sobre LMD, un corpus de 243 volúmenes de microscopía electrónica y de expansión procedentes de 12 especies. El resultado es un extractor de características para datos volumétricos con vóxeles isotrópicos de 8 nm.

El modelo resuelve un problema concreto: no existían codificadores de propósito general para imágenes de microscopía 3D de alta resolución comparables a los que existen en el dominio 2D. Este encoder produce tokens de parche y mapas de características intermedios reutilizables para tareas posteriores como segmentación neuronal (conectómica), detección de estructuras subcelulares o clasificación de tejidos, mediante fine-tuning con cabezas específicas (por ejemplo, un decodificador UNETR sobre las afinidades).

Con 303 M parámetros, 24 bloques, anchura 1024 y parches de 8 × 8 × 8 vóxeles, es relevante ahora porque demuestra que la transferencia de pesos 2D preentrenados a 3D funciona mejor que el entrenamiento desde cero en este dominio, y porque publica tanto el codificador como los modelos de afinidades derivados junto con una leaderboard de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (DINOv3 ViT-L adaptado), 24 bloques, anchura 1024, 16 cabezas, MLP ratio 4, LayerScale, 4 storage tokens, masked key bias, RoPE 3D |
| Parametros totales | 302.965.770 (303 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); entrada volumétrica con lados múltiplos de 8 vóxeles, entrenado con ventanas de 256³ |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | DINOv3 License (`license: other`, `dinov3-license`) |
| Formato de pesos | safetensors (`model.safetensors`, fp32, 1,21 GB) + `config.json` |
| Tamano del parche | 8 × 8 × 8 vóxeles |
| Resolucion de entrada | 8 nm isotrópicos, 1 canal, ejes `(x, y, z)` |
| Normalizacion de entrada | intensidades en [0, 1] por volumen (8 bits /255; 16 bits y float con recorte a percentiles 0,1 y 99,9) |
| Modelo base | `facebook/dinov3-vitl16-pretrain-lvd1689m` |
| Pipeline | `image-feature-extraction` |

## Arquitectura y entrenamiento

La arquitectura replica el ViT-L de DINOv3 (24 bloques, dimensión 1024, 16 cabezas de atención, MLP con ratio 4, LayerScale, 4 storage tokens y sesgo de clave enmascarado) pero sustituye el embedding posicional tabular por un RoPE 3D que asigna un tercio de los canales rotatorios a cada eje. El parche de entrada es de 8 × 8 × 8 vóxeles, lo que produce una rejilla de tokens de (16, 16, 16) para una entrada de 128³ y de (32, 32, 32) para 256³.

El preentrenamiento consta de dos fases. Primero, los pesos 2D de DINOv3 ViT-L/16 (LVD-1689M) se inflan a 3D: el kernel de parche se expande en profundidad de forma uniforme, se suman los canales RGB, se incorpora la estandarización de ImageNet y se redimensiona de 16 a 8 vóxeles mediante sumas por bloques; las tablas RoPE 3D se generan desde cero y el resto de tensores se copian. Después, el modelo se entrena durante 100 000 pasos con SimMIM sobre LMD: se enmascara el 90 % de la entrada en bloques de 32³ vóxeles y una cabeza lineal predice los vóxeles ocultos con pérdida L1. La optimización usa AdamW (β = 0,9 y 0,95; weight decay 0,05 sin aplicar a normas ni sesgos), learning rate 3e-4 tras 5 000 pasos de warm-up con decaimiento lineal hasta 3e-7, recorte de gradiente 1,0, autocast bf16 y batch global de 32 sobre 8 GPU. La única aumentación son rotaciones en el plano.

El corpus LMD comprende 243 volúmenes de microscopía 3D de 12 especies: 177 de microscopía electrónica (mosca, ratón, pez cebra, humano, *C. elegans*, pinzón cebra y otros) y 66 de microscopía de expansión (mosca, ratón, *Danionella*). Todos se remuestrearon a 8 nm isotrópicos, se muestrearon con probabilidad proporcional a tamaño^0,4 y se recortaron ventanas aleatorias de 256³. Los pesos publicados excluyen la cabeza de predicción de píxeles de SimMIM y el estado del optimizador.

## Capacidades

- Extracción de características de volúmenes de microscopía electrónica y de expansión con vóxeles de 8 nm.
- Generación de tokens de parche normalizados de la última capa mediante `patch_features(x)`, con la rejilla espacial asociada.
- Extracción del token CLS y de los 4 storage tokens mediante `forward_features(x)`.
- Obtención de mapas de características de bloques intermedios arbitrarios con `get_intermediate_layers(x, n=[...], reshape=True)`; los modelos de afinidades del autor leen los bloques 7, 15 y 23.
- Fine-tuning como `torch.nn.Module` convencional en bucles de entrenamiento propios.
- Base para segmentación neuronal (conectómica) mediante decodificador UNETR y cabezas de afinidades.
- Procesamiento de volúmenes de tamaño distinto de 256³ (el autor advierte que no lo ha probado).
- No soporta tool calling, agentes, texto, visión 2D natural, audio ni capacidades multilingües.

## Casos de uso

- Segmentación neuronal en conectómica: el codificador sirve como backbone para un decodificador UNETR que predice afinidades entre vóxeles; el modelo de afinidades publicado por el autor (`lmd-vitl-p8-affinity-lvd`) demuestra este flujo sobre los bloques 7, 15 y 23.
- Análisis de imágenes de microscopía electrónica de tejido cerebral: extracción de características densas de volúmenes de 256³ a 8 nm para clasificar sinapsis, mitocondrias o mielina con cabezas ligeras entrenadas sobre los tokens de parche.
- Microscopía de expansión (ExM): el corpus LMD incluye 66 volúmenes de ExM de mosca, ratón y *Danionella*, por lo que el encoder cubre este modalidad sin reentrenamiento desde cero.
- Preentrenamiento de modelos derivados: el modelo se usa como inicialización para tareas de microscopía 3D, reduciendo el coste frente a entrenar desde cero (el autor publica la variante `scratch` como comparación directa).
- Búsqueda y recuperación de imágenes volumétricas: los tokens de parche normalizados permiten construir embeddings para similitud entre regiones de distintos volúmenes.
- Control de calidad y fenotipado en pipelines de adquisición: extracción de características por volumen para detectar artefactos de imagen o clasificar muestras por especie o modalidad.
- Investigación en transferencia 2D→3D: el modelo sirve como referencia reproducible para estudiar la inflación de pesos y el impacto del preentrenamiento 2D en dominios volumétricos.

## Benchmarks y rendimiento

El autor no evalúa el codificador de forma aislada. Indica explícitamente que las puntuaciones de segmentación neuronal corresponden al modelo de afinidades derivado (`ai-hhmi/lmd-vitl-p8-affinity-lvd`) y a la leaderboard del proyecto.

No se han publicado resultados de benchmarks del codificador en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 1,21 GB; con autocast bf16 la huella de pesos baja a unos 0,6 GB. La memoria dominante son las activaciones, que crecen con el volumen de entrada: una ventana de 128³ genera 4 096 tokens y una de 256³ genera 32 768 tokens, con atención cuadrática sobre esa secuencia.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB para volúmenes de 128³ en bf16; para 256³ se recomienda A100 (40/80 GB), H100 o RTX 4090 (24 GB) con cuidado en el tamaño de batch.
- Cabe en GPU de consumo: sí, para volúmenes pequeños (128³ o menores) en tarjetas de 8 GB o más; los 256³ completos requieren tarjetas de gama alta o troceado en ventanas.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El autor indica cargar el modelo con PyTorch 2.13, `safetensors`, `huggingface_hub` y el código de `mia-train` en el commit `0fe3872`, poniendo `mia-train/src` en el path en lugar de instalar el paquete (sus módulos `models`, `layers`, `utils`, `distributed` y `data` colisionan con otros paquetes, como `distributed` de Dask).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Inicialización | Entrenamiento | Parámetros | Parche | Licencia |
|---|---|---|---|---|---|
| `ai-hhmi/lmd-vitl-p8-simmim-lvd` (este) | DINOv3 ViT-L/16 LVD-1689M (inflado a 3D) | SimMIM sobre LMD, 100k pasos | 303 M | 8³ vóxeles | DINOv3 License |
| `ai-hhmi/lmd-vitl-p8-simmim-scratch` | Aleatoria | SimMIM sobre LMD, 100k pasos | 303 M (misma arquitectura) | 8³ vóxeles | DINOv3 License |
| `ai-hhmi/lmd-vitl-p8-affinity-lvd` | Este codificador | Afinidades, 100k pasos | no disponible | 8³ vóxeles | DINOv3 License |
| `ai-hhmi/lmd-vitl-p8-affinity-scratch` | `lmd-vitl-p8-simmim-scratch` | Afinidades, 75k pasos | no disponible | 8³ vóxeles | DINOv3 License |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada; la comparación cuantitativa de segmentación está en la leaderboard del proyecto.

## Limitaciones y advertencias

- Modelo de visión puro: no genera texto, no soporta instrucciones, tool calling ni razonamiento multi-paso.
- Solo acepta un canal con ejes `(x, y, z)`; los volúmenes almacenados como `(z, y, x)` (OME-Zarr, N5) requieren `array.transpose(2, 1, 0)`.
- Exige vóxeles isotrópicos de 8 nm; otros datos deben remuestrearse antes, lo que introduce interpolación y posible pérdida de detalle.
- Cada lado del volumen debe ser múltiplo de 8 vóxeles.
- El autor solo validó ventanas de 256³; el comportamiento con otros tamaños no está verificado.
- La normalización de intensidades debe replicarse exactamente (percentiles 0,1 y 99,9 para 16 bits y float), ya que una normalización distinta altera las características.
- El codificador no fue evaluado de forma aislada; no hay métricas publicadas de su calidad como extractor de características.
- Riesgo de sesgo de dominio: el corpus LMD cubre 12 especies y dos modalidades (electrónica y de expansión); tejidos, especies o modalidades no representadas pueden degradar el rendimiento.
- Licencia DINOv3: al ser un derivado de pesos y código de Meta, el uso comercial queda sujeto al acuerdo de la DINOv3 License, que debe revisarse antes de desplegar en producción.
- Dependencia de código externo: requiere el repositorio `mia-train` en un commit concreto, con paquetes de nombres genéricos que pueden colisionar con otras librerías del entorno.
- No se publican cuantizaciones oficiales; el uso en fp32 o bf16 es el único documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-lvd
- Modelo base: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Variante desde cero: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-scratch
- Modelo de afinidades derivado: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-lvd
- Modelo de afinidades desde cero: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-scratch
- Código de entrenamiento: https://github.com/AI-HHMI/mia-train (commit `0fe3872`)
- Leaderboard de evaluación: https://ai-hhmi.github.io/mia-evals/
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Paper referenciado: arXiv:2508.10104

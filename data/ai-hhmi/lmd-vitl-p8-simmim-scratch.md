# ai-hhmi/lmd-vitl-p8-simmim-scratch

## Resumen

`lmd-vitl-p8-simmim-scratch` es un codificador ViT-L tridimensional desarrollado por AI-HHMI para microscopía de volúmenes (microscopía electrónica y de expansión) a una resolución isotrópica de 8 nm. Parte de la arquitectura DINOv3 ViT-L, adaptada a parches de 8 × 8 × 8 vóxeles, y se ha preentrenado desde inicialización aleatoria durante 100 000 pasos con el objetivo SimMIM sobre LMD, un corpus de 243 volúmenes de microscopía de 12 especies.

El modelo resuelve la extracción de características auto-supervisada en volúmenes 3D de gran tamaño, un paso previo habitual para tareas de segmentación de neuronas en conectómica. Con 303 M parámetros y pesos en fp32 (1,21 GB), está pensado como codificador base para hacer fine-tuning en tareas posteriores, no como modelo de uso directo.

Es relevante ahora porque forma parte de una familia de cuatro modelos (dos inicializaciones y dos cabezas de afinidad) que AI-HHMI publica junto con un banco de evaluación de segmentación neuronal. Este checkpoint concreto es la variante entrenada desde cero, lo que permite comparar el efecto de la inicialización con pesos DINOv3 frente al entrenamiento puramente auto-supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (DINOv3 ViT-L adaptado, parches 8×8×8) |
| Parametros totales | 302.965.770 (303 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrenamiento de 256³ vóxeles; sin límite de contexto en el sentido de LLM) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | DINOv3 License (dinov3-license) |
| Formato de pesos | safetensors (model.safetensors, fp32, 1,21 GB) + config.json |

## Arquitectura y entrenamiento

El codificador sigue la arquitectura DINOv3 ViT-L: 24 bloques, anchura 1024, 16 cabezas de atención, ratio MLP de 4, LayerScale, 4 tokens de almacenamiento y sesgo de clave enmascarado. La adaptación a 3D sustituye la tabla de posiciones por un embedding rotatorio 3D que asigna un tercio de los canales rotatorios a cada eje. Los parches son de 8 × 8 × 8 vóxeles, de modo que una entrada de 128³ genera una rejilla de 16 × 16 × 16 (4096 tokens de 1024 dimensiones).

El preentrenamiento es SimMIM: se ocultan el 90 % de la entrada en bloques de 32³ vóxeles, una cabeza lineal predice los vóxeles ocultos y la pérdida es el error L1 sobre ellos. Se entrenó desde inicialización aleatoria durante 100 000 pasos con batch global de 32 en 8 GPU, AdamW (β = 0,9/0,95, weight decay 0,05 sin aplicar a normas y sesgos), learning rate 3e-4 tras 5 000 pasos de warm-up con decaimiento lineal hasta 3e-7, clipping de gradiente a 1,0 y autocast bf16. La única aumentación fueron rotaciones en el plano. El corpus LMD consta de 177 volúmenes de microscopía electrónica (mosca, ratón, pez cebra, humano, *C. elegans*, pinzón cebra y otros) y 66 de microscopía de expansión (mosca, ratón, *Danionella*), todos remuestreados a 8 nm isotrópicos y muestreados en proporción a tamaño^0,4 con recortes aleatorios de 256³.

## Capacidades

- Extracción de características densas en volúmenes 3D de microscopía: `patch_features` devuelve los tokens de parche normalizados de la última capa y su rejilla; `forward_features` añade el token CLS y los 4 tokens de almacenamiento.
- Extracción de mapas de características de capas intermedias mediante `get_intermediate_layers` sobre los bloques indicados.
- Auto-supervisión en dominio: representaciones entrenadas específicamente sobre microscopía electrónica y de expansión a 8 nm.
- Fine-tuning: al ser un `torch.nn.Module` estándar, se puede integrar en bucles de entrenamiento propios; los modelos de afinidad de la familia leen los bloques [7, 15, 23] mediante un decodificador UNETR.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión natural, audio: no disponible.

## Casos de uso

- Segmentación de neuronas en conectómica: el codificador sirve de base para la cabeza de afinidades `lmd-vitl-p8-affinity-scratch`, que produce mapas de afinidad para reconstruir neuritas en volúmenes de microscopía electrónica a 8 nm.
- Preentrenamiento de pipelines de segmentación en nuevos datasets: al ser un codificador auto-supervisado, se puede hacer fine-tuning con pocas etiquetas sobre volúmenes propios y comparar contra la variante inicializada con DINOv3.
- Extracción de embeddings de regiones volumétricas: `patch_features` permite obtener representaciones de 1024 dimensiones por parche para búsqueda de similitud, clustering de morfologías o clasificación de tejidos.
- Análisis de microscopía de expansión: el corpus de entrenamiento incluye 66 volúmenes de expansión (mosca, ratón, *Danionella*), por lo que es adecuado para tareas sobre este tipo de imágenes.
- Detección de estructuras en volúmenes OME-Zarr o N5: el modelo documenta la conversión de ejes `(z, y, x)` a `(x, y, z)` y la normalización de intensidades a [0, 1], lo que facilita su integración en pipelines de adquisición existentes.
- Investigación comparativa de inicializaciones: al existir el gemelo `lmd-vitl-p8-simmim-lvd` (inicializado desde DINOv3 ViT-L/16), permite aislar el efecto de los pesos previos en tareas downstream.
- Generación de características multi-escala: `get_intermediate_layers` con los bloques [7, 15, 23] proporciona mapas de tres niveles para decodificadores tipo UNETR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del codificador por sí mismo en la informacion disponible. El autor indica explícitamente que no evaluó el codificador de forma aislada; las puntuaciones de segmentación de neuronas corresponden al modelo afinado `lmd-vitl-p8-affinity-scratch` y se publican en su página y en el leaderboard de AI-HHMI.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 303 M parámetros en fp32, los pesos ocupan unos 1,21 GB; en bf16 (autocast) se reduce a aproximadamente 0,6 GB, a lo que hay que sumar activaciones, que dependen del tamaño del volumen (una entrada de 128³ genera 4096 tokens y una de 256³ genera 32 768).
- GPU recomendadas: no disponible. El autor entrenó en 8 GPU con bf16; el ejemplo de uso recurre a CUDA con autocast bf16 si está disponible.
- Cabe en GPU de consumo: sí, en principio cualquier GPU con suficiente VRAM para los pesos y las activaciones del volumen de entrada; no se especifica un mínimo concreto.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue se hace cargando `model.safetensors` con `safetensors.torch.load_file` y la clase `DinoVisionTransformer3D` del repositorio `mia-train` en el commit `0fe3872`, con `mia-train/src` en el path.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Inicializacion | Parametros | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lmd-vitl-p8-simmim-scratch` (este) | Aleatoria | 303 M | SimMIM sobre LMD, 100k pasos | DINOv3 License | HuggingFace |
| `ai-hhmi/lmd-vitl-p8-simmim-lvd` | DINOv3 ViT-L/16, LVD-1689M | no disponible | SimMIM sobre LMD, 100k pasos | DINOv3 License | HuggingFace |
| `ai-hhmi/lmd-vitl-p8-affinity-lvd` | `lmd-vitl-p8-simmim-lvd` | no disponible | Afinidades, 100k pasos | DINOv3 License | HuggingFace |
| `ai-hhmi/lmd-vitl-p8-affinity-scratch` | Este codificador | no disponible | Afinidades, 75k pasos | DINOv3 License | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada; el leaderboard de AI-HHMI es la fuente indicada por el autor para comparar el rendimiento de segmentación.

## Limitaciones y advertencias

- El modelo no se ha evaluado de forma aislada; su calidad solo se conoce a través de los modelos de afinidad afinados sobre él.
- Entrada restringida: un canal, ejes `(x, y, z)`, vóxeles isotrópicos de 8 nm, intensidades en [0, 1] normalizadas por volumen y lados múltiplos de 8. Otros datos requieren remuestreo y renormalización previos.
- Solo se probó con ventanas de 256³ vóxeles; el autor advierte que el modelo funciona a otros tamaños pero no lo ha verificado.
- Dominio limitado a microscopía electrónica y de expansión; no se ha entrenado para imágenes naturales ni para otras modalidades.
- Riesgo de sesgo por composición del corpus: 12 especies, con predominio de microscopía electrónica (177 de 243 volúmenes) y una representación de especies desigual.
- Licencia DINOv3 License: aunque el modelo no contiene pesos de Meta, el código de arquitectura es un port de la implementación de referencia DINOv3 y queda cubierto por ese acuerdo. Las publicaciones que usen el modelo deben citar DINOv3.
- Dependencia de código externo: requiere el repositorio `mia-train` en el commit `0fe3872`; sus paquetes de nivel superior (`models`, `layers`, `utils`, `distributed`, `data`) pueden ensombrecer paquetes homónimos como `distributed` de Dask.
- El checkpoint excluye la cabeza de predicción de píxeles de SimMIM y el estado del optimizador; no es utilizable directamente como modelo generativo.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero las predicciones densas pueden ser incorrectas en regiones fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-scratch
- Variante inicializada desde DINOv3: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-lvd
- Modelo de afinidades desde DINOv3: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-lvd
- Modelo de afinidades desde este codificador: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-scratch
- Leaderboard de evaluación: https://ai-hhmi.github.io/mia-evals/
- Código de entrenamiento: https://github.com/AI-HHMI/mia-train
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Paper DINOv3: https://arxiv.org/abs/2508.10104
- Paper SimMIM (Xie et al., CVPR 2022): no disponible enlace directo en la informacion proporcionada

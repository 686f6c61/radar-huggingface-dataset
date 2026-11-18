# ai-hhmi/lmd-vitl-p8-simmim-scratch

## Resumen

lmd-vitl-p8-simmim-scratch es un codificador Vision Transformer 3D desarrollado por AI-HHMI para el análisis de volúmenes de microscopía electrónica y de expansión. Se trata de un ViT-L de 303 millones de parámetros con parches de 8 × 8 × 8 vóxeles, diseñado para operar sobre volúmenes de microscopía con resolución isotrópica de 8 nm. El modelo parte de inicialización aleatoria (scratch) y se preentrena de forma auto-supervisada con el objetivo SimMIM sobre LMD, un corpus de 243 volúmenes de microscopía de 12 especies distintas.

La relevancia del modelo radica en su aplicación al campo de la conectómica y la biología celular a escala nanométrica: proporciona representaciones densas de vóxeles que sirven como base para tareas posteriores como la segmentación de neuronas u organelos. Forma parte de una familia de variantes (con y sin inicialización desde DINOv3, y con cabezas de similitud o de clasificación de organelos) que comparten la misma arquitectura y convenciones de entrada.

El modelo se distribuye con pesos en fp32 (1,21 GB) y requiere el código de `mia-train` para su carga, ya que la arquitectura no está integrada en `transformers`. Su licencia es la DINOv3 License de Meta, lo que impone obligaciones de atribución en publicaciones científicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (DINOv3 ViT-L adaptado a volúmenes) |
| Parametros totales | 302.965.770 (303 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de extracción de características; ventana de entrenamiento de 256³ vóxeles) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | DINOv3 License (dinov3-license) |
| Formato de pesos | safetensors (fp32, 1,21 GB) + config.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DINOv3 ViT-L: 24 bloques, anchura 1024, 16 cabezas de atención, ratio MLP de 4, LayerScale, 4 tokens de almacenamiento y sesgo de clave enmascarado. La adaptación a 3D sustituye la tabla de embeddings posicionales por un embedding rotatorio 3D (RoPE), que asigna un tercio de los canales rotatorios a cada eje espacial. Los parches son cúbicos de 8 × 8 × 8 vóxeles. El modelo expone `patch_features`, `forward_features` y `get_intermediate_layers` para extraer tokens y mapas de características de bloques intermedios.

El preentrenamiento se realizó desde inicialización aleatoria durante 100.000 pasos con el objetivo SimMIM: se enmascara el 90 % de la entrada en bloques de 32³ vóxeles y una cabeza lineal predice los vóxeles ocultos con pérdida L1. Los datos provienen de LMD, 243 volúmenes de microscopía (177 de microscopía electrónica y 66 de microscopía de expansión) de 12 especies, remuestreados a 8 nm isotrópicos y muestreados proporcionalmente a tamaño^0,4 con recortes aleatorios de 256³. La optimización usó AdamW (β = 0,9 / 0,95; weight decay 0,05), learning rate 3e-4 con 5.000 pasos de warm-up y decaimiento lineal hasta 3e-7, batch global de 32 sobre 8 GPU, recorte de gradiente a 1,0 y autocast bf16. La única aumentación fue rotación en el plano.

## Capacidades

- Extracción de características densas de volúmenes de microscopía electrónica y de expansión a resolución de 8 nm.
- Generación de tokens de parche normalizados por volumen (por ejemplo, 4.096 tokens de dimensión 1.024 para una entrada de 128³).
- Extracción de mapas de características de capas intermedias (bloques 7, 15 y 23) con reestructuración espacial a rejillas 3D.
- Soporte de ajuste fino como `torch.nn.Module` estándar en bucles de entrenamiento propios.
- Base para cabezas posteriores de segmentación (afinidades neuronales, clases de organelos) mediante decodificadores UNETR.
- Procesamiento de volúmenes de tamaño arbitrario, siempre que cada lado sea múltiplo de 8 vóxeles.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un codificador visual puro.

## Casos de uso

- Segmentación de neuronas en conectómica: el codificador sirve como extractor de características para un decodificador de afinidades; la variante afinada `lmd-vitl-p8-affinity-scratch` reporta métricas de segmentación neuronal y se apoya en los mapas de los bloques 7, 15 y 23.
- Anotación de organelos celulares: la variante `lmd-vitl-p8-cellmap-lvd` reutiliza este tipo de codificador con una cabeza de clasificación de organelos entrenada 15.000 pasos, lo que permite etiquetar estructuras subcelulares en volúmenes de microscopía de expansión.
- Preprocesamiento de pipelines de imagen biomédica: extracción de embeddings de vóxeles para búsqueda por similitud, agrupamiento o detección de anomalías en grandes corpus de volúmenes.
- Ajuste fino para tareas downstream específicas de un laboratorio: al ser un `torch.nn.Module` convencional, se puede entrenar con datos propios de microscopía electrónica o de expansión sin depender de `transformers`.
- Análisis de datos de microscopía de expansión de *Drosophila*, ratón o *Danionella*: el corpus de entrenamiento incluye 66 volúmenes de expansión de estas especies, lo que favorece la transferencia a datos similares.
- Investigación en representaciones auto-supervisadas 3D: el modelo permite comparar el efecto de la inicialización aleatoria frente a la inicialización desde DINOv3 (variante `lmd-vitl-p8-simmim-lvd`) en tareas de segmentación.
- Control de calidad y preentrenamiento de modelos de conectómica: la ventana de entrenamiento de 256³ vóxeles y la resolución de 8 nm encajan con volúmenes de microscopía electrónica de tejido neural a escala de nanómetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el codificador no se evaluó de forma aislada; las métricas de segmentación neuronal corresponden a la variante afinada `ai-hhmi/lmd-vitl-p8-affinity-scratch` y a la leaderboard del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 1,21 GB; con activaciones para una entrada de 128³ en bf16 se puede operar en GPUs de 8-12 GB, aunque volúmenes mayores (256³) requieren más memoria.
- GPU recomendadas: A100 o H100 para entrenamiento y volúmenes grandes; RTX 4090 o RTX 3090 para inferencia y ajuste fino con recortes moderados.
- Cabe en GPU de consumo: sí, con recortes de 128³ o menores y precisión bf16; para 256³ conviene una GPU con 24 GB o más.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). La carga se realiza con `safetensors` y el código de `mia-train` en el commit `0fe3872`, con `torch.no_grad()` y autocast bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Inicializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lmd-vitl-p8-simmim-scratch | 303 M | Volumen 3D, parches 8³, ventana 256³ | Aleatoria | DINOv3 License | Hugging Face |
| lmd-vitl-p8-simmim-lvd | no disponible | Volumen 3D, parches 8³, ventana 256³ | DINOv3 ViT-L/16, LVD-1689M | DINOv3 License | Hugging Face |
| lmd-vitl-p8-affinity-scratch | no disponible | Volumen 3D, parches 8³ | Este codificador | DINOv3 License | Hugging Face |
| lmd-vitl-p8-cellmap-lvd | no disponible | Volumen 3D, parches 8³ | lmd-vitl-p8-simmim-lvd | DINOv3 License | Hugging Face |

Las variantes comparten arquitectura y convenciones de entrada; la diferencia principal es la inicialización y la tarea de ajuste fino. No se dispone de comparación con codificadores 3D de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El modelo no fue evaluado de forma aislada; su calidad debe medirse a través de tareas de ajuste fino.
- Solo admite una modalidad de entrada (un canal) y requiere volúmenes con ejes ordenados `(x, y, z)`; los datos en `(z, y, x)` deben transponerse.
- Exige vóxeles isotrópicos de 8 nm y cada lado múltiplo de 8; otros tamaños no fueron probados por los autores.
- Las intensidades deben normalizarse a [0, 1] con la convención de entrenamiento (8 bits divididos por 255; 16 bits y float recortados a los percentiles 0,1 y 99,9).
- No tiene capacidades lingüísticas, de tool calling ni de agentes; no debe usarse como modelo generativo.
- La licencia DINOv3 impone obligaciones de atribución en publicaciones que usen el modelo y cubre el código de arquitectura, aunque los pesos no provengan de Meta.
- El código de `mia-train` usa nombres de paquete genéricos (`models`, `layers`, `utils`, `distributed`, `data`) que pueden colisionar con otros paquetes, como `distributed` de Dask.
- Riesgo de sesgo derivado de la composición del corpus LMD (12 especies, predominio de microscopía electrónica); el rendimiento puede degradarse en especies o modalidades poco representadas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de predicciones erróneas en tareas downstream si el ajuste fino es insuficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-scratch
- Variante con inicialización DINOv3: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-lvd
- Variante de afinidades desde DINOv3: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-lvd
- Variante de afinidades desde scratch: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-scratch
- Variante CellMap de organelos: https://huggingface.co/ai-hhmi/lmd-vitl-p8-cellmap-lvd
- Código de entrenamiento: https://github.com/AI-HHMI/mia-train (commit `0fe3872`)
- Leaderboard de evaluación: https://ai-hhmi.github.io/mia-evals/
- Paper DINOv3: https://arxiv.org/abs/2508.10104
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license

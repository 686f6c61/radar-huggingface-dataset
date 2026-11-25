# Shio-Koube/Haruka-W4A8

## Resumen

Haruka-W4A8 es un modelo de clasificación de imágenes especializado en etiquetado automático (tagging) de ilustraciones de estilo anime, destilado y cuantizado a partir de Haruka-Tagger. Lo desarrolla Shio-Koube y se apoya en la arquitectura EVA02-Base-448 de 12 capas, con una cabeza clasificadora de 98.782 etiquetas del vocabulario Danbooru. El modelo resuelve el problema de ejecutar un tagger de alta precisión en entornos con recursos limitados: navegadores, GPUs integradas y CPUs modernas.

La contribución principal no es un modelo nuevo desde cero, sino una técnica de compresión agresiva: cuantización W4A8 (pesos de 4 bits, activaciones dinámicas de 8 bits) entrenada con AWQ-QAT, usando el modelo grande de 24 capas como profesor de destilación. El resultado ocupa 111,26 MB, frente a los 809 MB del modelo base en FP32, y mantiene un Micro-F1 de 61,69% en el conjunto de evaluación `Shio-Koube/new-dan`, superando tanto al modelo comprimido de referencia de 12 capas como al profesor FP32 de 24 capas en esa métrica.

Es relevante ahora porque demuestra que es viable llevar un tagger de 98.782 etiquetas a WebGPU y a CPU con aceleración AVX-512 VNNI manteniendo la calidad, lo que habilita filtrado y catalogación de imágenes anime en el cliente sin depender de servidores. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EVA02-Base-448, transformer de visión de 12 capas |
| Parametros totales | no disponible (checkpoint cuantizado de 111,26 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 448x448 px) |
| Tipos de cuantizacion | W4A8: pesos INT4 simétricos por grupo (group_size=64), activaciones INT8 dinámicas por grupo (act_group_size=128); pesos empaquetados en uint8 con offset-8 |
| Idiomas soportados | no disponible (clasificación de etiquetas, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`haruka-tagger-12L-w4a8-awq-qat-packed.safetensors`), con `qweight_packed` uint8, `scales` float16, `awq_scale` float16 y `bias` float16; pesos no cuantizados en float16 |

## Arquitectura y entrenamiento

El modelo es un EVA02-Base-448 de 12 capas con una cabeza clasificadora multi-etiqueta de 98.782 tags, heredada del tagger original. Sobre esta base se aplica una cadena de compresión en tres fases. Primero, AWQ con migración de canales: se perfilan las escalas de activación por canal para capturar los canales con valores atípicos superiores a 5 sigma típicos de EVA02, y se hace una búsqueda en rejilla sobre el parámetro alpha en [0, 1] para minimizar el error de reconstrucción conjunto de W4A8. La escala de suavizado se fusiona directamente en los pesos y sesgos de las LayerNorm precedentes (norm1, norm2, mlp.norm, head_pool.norm), eliminando la división en tiempo de ejecución; en el resto de capas se mantienen vectores `awq_scale` aprendibles.

Después se aplica QAT diferenciable con recorte de pesos aprendible: los pesos se cuantizan a INT4 simétrico por grupo de 64 con estimador de gradiente recto y un `clip_logit` aprendible en el rango (0,5, 1,0); las activaciones se cuantizan dinámicamente a INT8 simétrico por grupo de 128. Finalmente, se hace destilación de logits entre arquitecturas, del profesor de 24 capas (EVA02-Large-448, 1,69 GB) al estudiante de 12 capas, usando MSE ponderado por doble probabilidad sobre el vocabulario completo, KL de ranking softmax ListNet y KL binaria multi-etiqueta focal sobre las 98.782 etiquetas. No se especifica el número de tokens ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Clasificación multi-etiqueta de ilustraciones anime sobre 98.782 etiquetas del vocabulario Danbooru.
- Predicción por categorías: `general`, `character`, `copyright`, `artist` y `rating`, cada una con umbral de decisión propio (0,35; 0,35; 0,35; 0,25; 0,50).
- Inferencia en WebGPU con instrucciones DP4A (`dot4I8Packed`) y en CPU con AVX-512 VNNI (`vpdpbusd`).
- Ejecución en el cliente con un script de inferencia incluido (`haruka_w4a8_infer.py`) que carga safetensors empaquetados y simula activaciones INT8 con `--sim-a8`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni otras modalidades; es exclusivamente un clasificador de imágenes.
- Capacidades multilingües: no aplica; las etiquetas son términos del vocabulario Danbooru, predominantemente en inglés y japonés romanizado.

## Casos de uso

- Catalogación local de bibliotecas de imágenes anime: el modelo etiqueta cada imagen en 448x448 px y devuelve las etiquetas Danbooru con sus probabilidades, permitiendo indexar y buscar por personaje, copyright o artista sin subir las imágenes a un servidor. Su tamaño de 111 MB hace viable mantener el modelo en memoria en un portátil.
- Filtrado en el navegador con WebGPU: integrado en una aplicación web, procesa imágenes a 21,5-23,9 img/s en una Radeon 780M, suficiente para previsualizar y filtrar galerías grandes en el cliente sin coste de backend.
- Moderación y clasificación de contenido por rating: la categoría `rating` con umbral 0,50 permite separar ilustraciones aptas para todos los públicos de contenido sensible en pipelines de subida de contenido, con un F1 de 83,48% en la evaluación publicada.
- Etiquetado previo para entrenamiento de modelos generativos: genera etiquetas estructuradas para datasets de difusión o fine-tuning, reduciendo el trabajo manual de anotación; su F1 en `character` (78,17%) y `artist` (64,51%) lo hace útil como preanotador con revisión humana posterior.
- Búsqueda semántica en bases de datos de arte: al indexar las probabilidades de las 98.782 etiquetas, se pueden construir índices invertidos o embeddings de etiquetas para búsquedas por similitud de contenido, personaje o estilo.
- Despliegue en dispositivos de borde y CPU sin GPU: con AVX-512 VNNI procesa una imagen en 432,4 ms (2,31 img/s) en un Ryzen 7 8845H, adecuado para servicios por lotes o aplicaciones de escritorio que no pueden asumir el coste de una GPU.
- Deduplicación y organización de colecciones: la combinación de etiquetas de personaje, copyright y artista permite agrupar automáticamente imágenes de la misma franquicia o autor en herramientas de gestión de bibliotecas.

## Benchmarks y rendimiento

Evaluación de precisión en `Shio-Koube/new-dan` (N = 5.000), con umbrales estándar de Haruka-Tagger:

| Categoría | FP32 24L AUPRC | Alpin ~7,4-bit AUPRC | W4A8 AUPRC | FP32 24L F1 | Alpin ~7,4-bit F1 | W4A8 F1 |
|---|---|---|---|---|---|---|
| `general` | 46,45% | 42,50% | 41,37% | 59,37% | 57,69% | 60,79% |
| `character` | 92,75% | 90,23% | 89,83% | 80,36% | 76,48% | 78,17% |
| `copyright` | 76,97% | 72,72% | 71,93% | 74,39% | 69,22% | 65,48% |
| `artist` | 87,82% | 84,83% | 85,07% | 53,21% | 49,33% | 64,51% |
| `rating` | 89,14% | 88,80% | 88,16% | 84,65% | 84,32% | 83,48% |
| `ALL_CONTENT` | 61,65% | 58,07% | 57,23% | 60,54% | 58,67% | 61,69% |

Rendimiento medido en AMD Ryzen 7 8845H / Radeon 780M (rdna-3) con una imagen de 448x448 (M = 1024 tokens de parche + cabeza de 98.782 etiquetas):

| Modelo / precisión | Tamano | 12L lineales + cabeza | Throughput | Aceleración vs FP16 |
|---|---|---|---|---|
| FP16 estándar (W16A16) | 386 MB | ~797 ms | 1,25 img/s | 1,00x |
| Alpin (W8A16, FMA f16) | 187 MB | 142,36 ms | 7,0 img/s | 5,60x |
| Alpin (W8A8, dot4I8Packed) | 187 MB | 105,96 ms | 9,4 img/s | 7,52x |
| W4A8 AWQ-QAT (dot4I8Packed, g=64) | 111,26 MB | 41,84-46,59 ms | 21,5-23,9 img/s | ~17-19x |

| Runtime / precisión (CPU) | Tamano | Extremo a extremo (1 imagen 448x448) | Throughput |
|---|---|---|---|
| PyTorch FP32 (MKL) | 809 MB | 896,1 ms | 1,12 img/s |
| AVX-512 VNNI W4A8 (vpdpbusd, g=64) | 111,26 MB | 432,4 ms | 2,31 img/s (2,07x) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint empaquetado ocupa 111,26 MB y los pesos no cuantizados en float16 anaden poco, por lo que cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: funciona en GPUs integradas como la Radeon 780M (rdna-3) mediante WebGPU; en GPUs dedicadas (RTX 3060, RTX 4090, A100, H100) el cuello de botella será la cabeza clasificadora de 98.782 etiquetas, no los 12 bloques transformer.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte WebGPU o CUDA; también en CPUs con AVX-512 VNNI.
- Opciones de despliegue: script oficial `haruka_w4a8_infer.py` con PyTorch, timm y safetensors; WebGPU con kernels DP4A (`dot4I8Packed`); CPU con AVX-512 VNNI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: 41,84-46,59 ms por imagen en WebGPU sobre Radeon 780M (21,5-23,9 img/s); 432,4 ms por imagen en CPU Ryzen 7 8845H (2,31 img/s); 896,1 ms con PyTorch FP32 en la misma CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Precision | ALL_CONTENT F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Haruka-W4A8 (este) | EVA02-Base-448, 12L | 111,26 MB | W4A8 AWQ-QAT | 61,69% | Apache 2.0 | Hugging Face |
| Haruka-Tagger-Large (profesor) | EVA02-Large-448, 24L | 1,69 GB | FP32 | 60,54% | no disponible en la informacion | Hugging Face (`KaraKaraWitch/haruka-tagger-large`) |
| alpindale/haruka-compressed | EVA02-Base-448, 12L | 187 MB | ~7,4-bit GPTQ | 58,67% | no disponible en la informacion | Hugging Face |
| Haruka-Tagger base | EVA02-Base-448, 12L | 809 MB | FP32 | no disponible | no disponible en la informacion | Hugging Face (`KaraKaraWitch/haruka-eva02-base-448-final`) |

## Limitaciones y advertencias

- Dominio restringido: solo clasifica ilustraciones de estilo anime con el vocabulario Danbooru; su rendimiento en fotografía, arte occidental u otras estéticas no está evaluado y probablemente sea deficiente.
- Sesgos del vocabulario: las 98.782 etiquetas de Danbooru reflejan las convenciones y sesgos de esa comunidad, incluidos criterios de rating y etiquetas de contenido sensible que pueden no alinearse con políticas de producto.
- Riesgo de falsos positivos y negativos: con umbrales fijos por categoría, el F1 en `copyright` (65,48%) y `artist` (64,51%) es notablemente inferior al de `character` (78,17%); en producción conviene calibrar umbrales por caso de uso.
- Precisión dependiente de la cuantización: aunque supera al profesor en F1 global, el AUPRC de `ALL_CONTENT` es 0,84 puntos inferior al del modelo Alpin de 7,4 bits; en tareas sensibles a la recuperación (ranking) puede ser preferible una cuantización menos agresiva.
- Sin datos de entrenamiento publicados: no se especifican tokens, composición del dataset ni proceso de anotación, lo que dificulta auditar posibles sesgos de los datos.
- Formato de pesos propietario: los safetensors empaquetados requieren el script de desempaquetado incluido; no son directamente compatibles con cargadores estándar de timm o transformers sin adaptación.
- Licencia Apache 2.0 sobre el checkpoint, pero la licencia de los modelos base y del vocabulario Danbooru debe verificarse por separado antes de un uso comercial.
- Sin resultados de benchmarks en tareas fuera del etiquetado Danbooru; no debe asumirse capacidad de clasificación general de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shio-Koube/Haruka-W4A8
- Modelo base (12L EVA02-Base-448): https://huggingface.co/KaraKaraWitch/haruka-eva02-base-448-final
- Profesor de destilación (24L): https://huggingface.co/KaraKaraWitch/haruka-tagger-large
- Modelo comprimido de referencia: https://huggingface.co/alpindale/haruka-compressed
- Conjunto de evaluación: https://huggingface.co/Shio-Koube/new-dan

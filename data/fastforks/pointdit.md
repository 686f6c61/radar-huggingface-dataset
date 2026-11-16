# fastforks/pointdit

## Resumen

PointDiT es un modelo de estimación de profundidad monocular formulado como un problema de generación en el espacio de píxeles. Desarrollado por Xu et al. en Google Research (2026), emplea un diffusion transformer que denoisa un mapa de puntos en tres pasos de Euler, condicionado por características congeladas de DINOv3 extraídas de la imagen de entrada. El resultado es un mapa de puntos afín-invariante del que se deriva directamente la profundidad.

El repositorio `fastforks/pointdit` no contiene pesos: es únicamente una model card que documenta cómo el framework fastforks descarga los pesos originales de los autores y los verifica contra hashes SHA-256. Existen dos variantes, `pointdit-b-512` (backbone DINOv3 ViT-B/16) y `pointdit-l-512` (backbone DINOv3 ViT-L/16), ambas con resolución de entrenamiento de 512 y licencia Apache-2.0 para código y pesos de PointDiT, mientras que los encoders DINOv3 congelados están sujetos a la DINOv3 License de Meta.

El modelo es relevante porque propone un paradigma distinto al de los regresores de profundidad clásicos: trata la geometría como generación mediante difusión, con solo tres pasos de inferencia, y ofrece backends optimizados (`portable` y `kernels`) que reducen el tiempo de inferencia hasta 1,5 veces respecto al backend portable. Está orientado a experimentación (tier "experimental") y su salida es afín-invariante, no métrica en metros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer en espacio de píxeles con encoder DINOv3 congelado (ViT-B/16 o ViT-L/16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: una imagen RGB de cualquier H x W >= 1, redimensionada o paddada internamente) |
| Tipos de cuantizacion | no disponible (se documenta ejecución en fp16 y fp32 en los benchmarks) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | PointDiT: Apache-2.0; encoders DINOv3: DINOv3 License (Meta); licencia declarada en la card: `dinov3-license` |
| Formato de pesos | `.safetensors` (encoder DINOv3) y `.pth` (checkpoint PointDiT) |

## Arquitectura y entrenamiento

PointDiT formula la estimación de geometría monocular como una tarea de generación: un diffusion transformer opera en espacio de píxeles y denoisa un mapa de puntos en tres pasos de Euler. La condición de entrada son características congeladas extraídas por un encoder DINOv3 (ViT-B/16 para la variante `b` y ViT-L/16 para la variante `l`), preentrenado sobre LVD-1689M. La salida es un mapa de puntos afín-invariante junto con su profundidad derivada; el campo `kind` de la card indica si los valores son métricos (metros), afín-invariantes, afín-invariantes logarítmicos o afín-invariantes inversos.

Según la model card, los datos de entrenamiento consisten en una mezcla de datasets de mapas de puntos sintéticos y reales ("mixdata"), conforme al paper de PointDiT. El encoder DINOv3 no se reentrena: permanece congelado. Los checkpoints publicados por los autores se denominan `pointditb-512-mixdata-nodinov3-1d42aacf.pth` y `pointditl-512-mixdata-nodinov3-240c1a4f.pth`, lo que sugiere que el entrenamiento se realizó sobre la mezcla de datos sin incluir DINOv3 en el ajuste. La innovación técnica destacable es la decodificación en solo tres pasos de Euler, que hace viable un modelo de difusión para una tarea de regresión geométrica en producción, junto con kernels optimizados para el backend `kernels`.

## Capacidades

- Estimación de profundidad monocular a partir de una única imagen RGB, con salida de mapa de puntos y mapa de profundidad (`points`, `depth`).
- Salida afín-invariante (escala y desplazamiento desconocidos) para las variantes documentadas; no produce profundidad métrica en metros.
- Resolución de entrada flexible: cualquier H x W >= 1, con redimensionado o padding interno; probado hasta 3000x4000 en fp16.
- Dos backends de ejecución: `portable` (portátil, sin kernels específicos) y `kernels` (kernels optimizados en CUDA).
- Ejecución en fp16 y fp32; los benchmarks reportan fp32 original y fp16 para portable y kernels.
- No dispone de tool calling, function calling, capacidades de agente, multilingües, thinking mode, visión general, audio ni generación de texto: es un modelo específico de profundidad.

## Casos de uso

- Reconstrucción 3D a partir de una sola imagen: el mapa de puntos afín-invariante permite levantar nubes de puntos densas para fotogrametría de bajo coste o previsualización 3D, sin necesidad de calibración métrica cuando la escala absoluta no es crítica.
- Realce de profundidad de campo sintético en postproducción: la salida `depth` puede usarse como máscara de desenfoque en pipelines de vídeo o fotografía computacional, aprovechando la resolución flexible de entrada hasta 3000x4000.
- Preprocesado para robótica y navegación: estimación de geometría de escena por fotograma en tiempo casi real (30,7 ms por imagen 518x770 en backend portable con la variante `b`), adecuada para módulos de percepción que toleran escala relativa.
- Automatización de anotación de datasets: generación de mapas de profundidad pseudo-etiquetados sobre grandes colecciones de imágenes para preentrenar modelos de percepción, dado el bajo coste de inferencia (20,5 ms por imagen con backend `kernels` en la variante `b`).
- Análisis de escenas en inspección industrial o agrícola: extracción de estructura geométrica de imágenes de dron o cámara fija para segmentación por profundidad, con la variante `l` cuando se requiere mayor fidelidad (94,2 ms por imagen 518x770 en portable, 61,0 ms en kernels).
- Investigación en modelos generativos de geometría: base reproducible para experimentar con difusión en espacio de píxeles aplicada a tareas de regresión densa, con pesos verificados por SHA-256 y dos backends comparables.
- Integración en pipelines de visión con CUDA: despliegue mediante el backend `kernels` en GPUs consumer (probado en RTX 5060 Ti 16 GB con 1,6 GiB de pico asignado para la variante `l` a 3000x4000), reduciendo el tiempo de primera llamada a 0,25 s.

## Benchmarks y rendimiento

La model card no publica métricas de precisión (AbsRel, RMSE, delta) sobre datasets de profundidad. Solo se documentan tiempos y memoria de inferencia. Se reproducen a continuación los datos disponibles.

| Modelo | Entrada | Tiempo portable (ms) | Tiempo kernels (ms) | Aceleración kernels vs portable | Memoria pico portable (MiB, asignada/reservada) | Memoria pico kernels (MiB, asignada/reservada) |
|---|---|---|---|---|---|---|
| `pointdit-b-512` | 518x770 sintética | 30,7 | 20,5 | 1,5x | 432 / 484 | 434 / 590 |
| `pointdit-l-512` | 518x770 sintética | 94,2 | 61,0 | 1,5x | 1285 / 1410 | 1314 / 1656 |
| `pointdit-b-512` | Middlebury 2014 half, 994x1482 | 30,7 | 20,6 | 1,5x | 450 / 544 | 466 / 630 |
| `pointdit-l-512` | Middlebury 2014 half, 994x1482 | 94,6 | 61,4 | 1,5x | 1301 / 1410 | 1314 / 1696 |

| Modelo | Tiempo original fp32 (ms) | Aceleración kernels vs original | Memoria pico original (MiB, asignada/reservada) |
|---|---|---|---|
| `pointdit-b-512` (Middlebury 994x1482) | 105 | 2,4x | 1214 / 1246 |
| `pointdit-l-512` (Middlebury 994x1482) | 335 | 1,8x | 3953 / 4010 |

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `pointdit-b-512` | 2,57 | 0,65 | 0,56 | 0,11 | 0,29 | 0,17 |
| `pointdit-l-512` | 9,47 | 0,92 | 0,94 | 0,12 | 0,27 | 0,25 |

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros equivalentes de profundidad como AbsRel o RMSE) en la información disponible. La tabla de `torch.compile` y TensorRT aparece truncada en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: para la variante `b` en 518x770, pico asignado de 432 MiB (portable) y 434 MiB (kernels); para la variante `l`, 1285 MiB (portable) y 1314 MiB (kernels). A 994x1482, la variante `b` requiere 450-466 MiB y la `l` 1301-1314 MiB.
- Entradas grandes: probado hasta 3000x4000 en fp16 con RTX 5060 Ti 16 GB, con pico asignado de 0,8 GiB (variante `b`) y 1,6 GiB (variante `l`), y reservado de 1,0 GiB y 2,2 GiB respectivamente.
- GPU recomendadas: no se especifican modelos concretos más allá de la RTX 5060 Ti 16 GB usada en las pruebas; por los requisitos de memoria, cabe en cualquier GPU consumer con al menos 4-8 GB de VRAM para entradas moderadas.
- Cabe en GPU consumer: sí, con holgura; la variante `l` a resolución alta es la que más memoria consume (2,2 GiB reservados a 3000x4000).
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), con kernels CUDA publicados en `fastforks/kernels`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 30,7 ms (portable) y 20,5 ms (kernels) por imagen 518x770 con la variante `b`; 94,2 ms y 61,0 ms con la variante `l`. Aceleración de kernels de 1,5x frente a portable y de hasta 2,4x frente al backend original fp32.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PointDiT (este) | Diffusion transformer + DINOv3 congelado | no disponible | Imagen de cualquier tamaño | Mapa de puntos y profundidad afín-invariante | Apache-2.0 (PointDiT) + DINOv3 License (encoder) | Pesos en HF (`haofeixu/pointdit`), card en `fastforks/pointdit` |
| Depth Pro | Estimador de profundidad monocular | no disponible | Imagen; estima intrínsecos de cámara | Profundidad métrica | no disponible en la información | Pesos referenciados en la card |
| Depth Anything 3 (`da3metric-large`, `da3mono-large`) | Estimador de profundidad monocular | no disponible | Imagen; `da3metric-large` requiere `intrinsics=K` | Profundidad métrica o relativa | no disponible en la información | Pesos referenciados en la card |
| UniDepth v2 (`unidepth-v2-vitl14`) | Estimador de profundidad monocular | no disponible | Imagen; estima la cámara | Profundidad | no disponible en la información | Pesos referenciados en la card |

Los datos de parámetros, contexto y benchmarks de los modelos comparables no están disponibles en la información proporcionada; la comparación se limita a la naturaleza de la tarea y al tipo de salida documentado en la card.

## Limitaciones y advertencias

- La salida de las variantes documentadas es afín-invariante (escala y desplazamiento desconocidos); no debe interpretarse como profundidad métrica en metros sin calibración adicional.
- El repositorio no contiene pesos: es solo una model card; la descarga y verificación de pesos depende del framework fastforks y de los repositorios de los autores.
- El tier es "experimental"; no se han publicado métricas de precisión de profundidad en la información disponible, lo que impide evaluar su exactitud frente a alternativas.
- Los encoders DINOv3 ViT-B/16 y ViT-L/16 están bajo la DINOv3 License de Meta, con condiciones de atribución y acceso restringido (gated) en Hugging Face; deben revisarse antes de cualquier uso comercial, aunque la card indica uso comercial permitido para las variantes.
- Riesgo de alucinación geométrica: al ser un modelo generativo por difusión, puede producir estructuras plausibles pero incorrectas en regiones ambiguas o de textura repetitiva; no se documenta ninguna evaluación al respecto.
- Idiomas: no aplica, pero no se documenta robustez ante dominios visuales distintos de los datasets de entrenamiento (mezcla de sintético y real).
- La tabla de `torch.compile` y TensorRT está truncada en la información disponible, por lo que no se pueden confirmar los rendimientos con esas optimizaciones.
- No se documentan sesgos demográficos, geográficos ni de iluminación; al ser un modelo de visión, los sesgos del dataset de entrenamiento pueden propagarse a la profundidad estimada.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/pointdit
- Pesos PointDiT de los autores: https://huggingface.co/haofeixu/pointdit
- Encoder DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Encoder DINOv3 ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Código original de PointDiT (Google Research): https://github.com/google-research/pointdit
- Licencia del código original (Apache-2.0): https://github.com/google-research/pointdit/blob/11f53a30aeb4d34d49d2beda655ee6f19b2ad7f8/LICENSE
- Framework fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Card TOML con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/pointdit/card.toml

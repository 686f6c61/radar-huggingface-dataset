# immanuelpeter/C-RADIOv4-H-3.5-Super

## Resumen

C-RADIOv4-H-3.5-Super es un paquete de pesos que extrae el tower de visión (C-RADIOv4-H), la capa final de normalización y el proyector del modelo multimodal NVIDIA Nemotron 3.5 Super VL (120B-A12B). No es un modelo generativo completo, sino un componente reutilizable de extracción de características visuales publicado por el usuario immanuelpeter, que lo empaqueta a partir del modelo padre de NVIDIA con paridad tensor a tensor verificada.

El modelo resuelve el problema de reutilizar el encoder visual de un VLM de gran escala sin cargar los 120B parámetros del modelo completo. Con 653,6 millones de parámetros y 1,7 GB de pesos en BF16, ofrece un tower de 32 capas con anchura oculta de 1280 y patch size 16, más un proyector MLP que transforma las características visuales a un espacio de 4096 dimensiones compatible con el pipeline del modelo padre.

Es relevante para desarrolladores que necesitan embeddings de imagen de alta calidad (por ejemplo, para búsqueda visual, clasificación o como entrada a un LLM propio) sin el coste de un VLM completo. La licencia OpenMDW-1.1 y la publicación de scripts de exportación y tests de paridad facilitan su auditoría y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tower ViT C-RADIOv4-H (32 capas, 1280 hidden, patch 16, diez tokens de prefijo) + LayerNorm final + proyector MLP (mlp1) |
| Parametros totales | 653.611.528 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión; resolución de entrada 448 en el bench) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El paquete contiene tres componentes: el tower C-RADIOv4-H con 32 capas transformer, anchura oculta de 1280 y patch size de 16, que incluye diez tokens de prefijo (`summary_idxs`) en `model.safetensors` (391 tensores); una capa `LayerNorm(1280)` con eps 1e-6 aplicada antes del pixel shuffle (`final_norm.safetensors`, 2 tensores); y el proyector `mlp1` (`projector.safetensors`, 3 tensores) compuesto por `RMSNorm(5120)`, `Linear(5120, 20480)` sin sesgo, activación SquaredReLU y `Linear(20480, 4096)` sin sesgo. La compresión de tokens usa InternVL v2 2x2 pixel shuffle con escala 0.5 y sin parámetros aprendidos.

En una entrada de 448 píxeles, el bench reporta 784 tokens del tower de anchura 1280, 196 tokens `merged` de anchura 5120 (tras la LayerNorm final) y 196 tokens `projected` de anchura 4096. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF/DPO en la información proporcionada; los pesos se exportan directamente del modelo padre NVIDIA Nemotron 3.5 Super VL sin fine-tuning adicional, según el script de exportación y el test de paridad publicados.

## Capacidades

- Extracción de características visuales (image feature extraction) a partir de imágenes, produciendo embeddings de 4096 dimensiones.
- Generación de tokens visuales comprimidos (196 tokens `projected` a 448 píxeles) listos para alimentar un LLM multimodal.
- Soporte de tokens de resumen (`summary_idxs`) del tower C-RADIOv4-H.
- No incluye generación de texto, razonamiento, código ni matemáticas por sí mismo.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (es un encoder visual).
- Sin modo thinking, audio ni visión generativa.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: usar los embeddings de 4096 dimensiones del proyector como índice vectorial para búsqueda por similitud, aprovechando la compresión a 196 tokens por imagen a 448 píxeles.
- Clasificación de imágenes con cabezas ligeras: congelar el tower y entrenar un clasificador lineal o MLP sobre las características `merged` de 5120 dimensiones, reduciendo el coste frente a fine-tuning completo.
- Entrada visual para LLMs propios: integrar los tokens `projected` en un pipeline multimodal casero, sustituyendo el encoder del VLM padre por este paquete de 653M parámetros.
- Detección de duplicados y near-duplicates en catálogos de imágenes: calcular embeddings y comparar distancias coseno para deduplicación a escala.
- Moderación de contenido visual: extraer características y alimentar un clasificador de contenido sensible entrenado sobre los embeddings del tower.
- Preprocesamiento para pipelines de captioning: generar tokens visuales que un modelo de lenguaje separado convierta en descripciones, manteniendo el encoder visual desacoplado.
- Investigación en representaciones visuales: reproducir y comparar las activaciones del tower C-RADIOv4-H frente a otros encoders, con paridad verificada contra el modelo padre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB en BF16 (653,6M parámetros × 2 bytes) más activaciones; el repo ocupa 1,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100, H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 4 GB o más.
- Opciones de despliegue: PyTorch nativo con el loader `vision.py` incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| C-RADIOv4-H-3.5-Super | 653,6M | 448 px (bench) | OpenMDW-1.1 | Hugging Face |
| NVIDIA C-RADIOv4-H | No disponible | No disponible | No disponible | Hugging Face (NVIDIA) |
| NVIDIA Nemotron 3.5 Super VL 120B-A12B | 120B (A12B activos) | No disponible | No disponible | Hugging Face (NVIDIA) |

La comparativa con encoders visuales de tamaño similar (por ejemplo, SigLIP o DINOv2) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo características visuales.
- Alucinación no aplica directamente, pero los embeddings pueden amplificar sesgos presentes en el modelo padre NVIDIA.
- Sesgos conocidos del dataset de entrenamiento del modelo padre: no disponibles en la información proporcionada.
- Limitaciones de idioma: no aplica; es un encoder visual sin capacidades lingüísticas.
- Licencia OpenMDW-1.1: revisar los términos en https://openmdw.ai/license/1-1/ antes de uso comercial; la model card indica `license: other` con nombre openmdw-1.1.
- Dependencia del modelo padre: los pesos se exportan de NVIDIA Nemotron 3.5 Super VL y heredan sus condiciones de uso.
- Sin garantías de soporte: autor individual (immanuelpeter), 61 descargas y 1 like en el momento de la consulta.
- El paquete no incluye tokenizer ni código de preprocesado de imágenes más allá del loader `vision.py`.

## Enlaces

- Hugging Face: https://huggingface.co/immanuelpeter/C-RADIOv4-H-3.5-Super
- Modelo padre NVIDIA Nemotron 3.5 Super VL: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Modelo base C-RADIOv4-H: https://huggingface.co/nvidia/C-RADIOv4-H
- Script de exportación: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_nemotron35_vision.py
- Test de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/tests/test_release_parity.py
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Ejemplo de inferencia: `examples/inference.py` (referenciado en la model card)

# Hooshaai/bert-comp-subspace-projection-sst2

## Resumen

`bert-comp-subspace-projection-sst2` es un checkpoint comprimido y "sanado" con LoRA de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768), ajustado previamente a la tarea de clasificación de sentimiento GLUE SST-2. Lo publica el usuario Hooshaai bajo el paraguas de la librería NeuralOps, un marco de compresión de modelos que agrupa distintos motores bajo un registro (`COMPRESSOR_REGISTRY`). El modelo no es un modelo base nuevo, sino una demostración de la técnica `subspace_projection` (`SubspaceProjectionCompressor`, familia SVD) aplicada a un transformer BERT clásico.

El problema que aborda es la reducción física de parámetros en modelos ya entrenados: mediante proyección sobre subespacios de baja dimensión, el checkpoint pasa de 109,5 M a 35,2 M de parámetros (reducción del 67,9 %, ratio de compresión físico de 3,11x) seleccionando el rango k=64 como punto de la frontera de Pareto. Sobre esa base comprimida se aplica un ajuste LoRA de recuperación (r=8, 50 pasos, lr=2e-4) para intentar recuperar precisión en la tarea downstream.

Su relevancia es fundamentalmente metodológica y de investigación: sirve como referencia reproducible de cómo se degrada y se recupera un BERT de clasificación bajo compresión agresiva, y como ejemplo de integración con el ecosistema NeuralOps. No es un modelo pensado para producción generalista; es un artefacto experimental con una precisión SST-2 de 76,15 % frente al 91,63 % del profesor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, dimensión oculta 768), comprimido mediante proyección de subespacio (familia SVD) |
| Parametros totales | 35.165.954 (checkpoint comprimido, k=64); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de `bert-base-uncased`, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (se mencionan "quantization buffers" en los artefactos, sin especificar formatos) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizador en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-base uncased: un transformer encoder de 12 capas con 768 dimensiones ocultas, atención multi-cabeza bidireccional y objetivo de modelado de lenguaje enmascarado en su preentrenamiento original. Sobre ese modelo se realizó un ajuste fino supervisado para clasificación binaria de sentimiento en GLUE SST-2, dando lugar al "profesor" con 91,63 % de accuracy en validación.

La compresión se realiza con `SubspaceProjectionCompressor` (implementado en `neuralops/compression/svd/subspace_projection.py`), que proyecta los pesos sobre un subespacio de rango k; en este caso k=64. El proceso selecciona el rango mediante evaluación de Pareto sobre k ∈ {256, 128, 64, 32}. Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un ajuste LoRA de recuperación con r=8, 50 pasos, lr=2e-4 y un presupuesto de 45 segundos. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras del split de validación de SST-2. No se detalla la composición del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (0 = negativo, 1 = positivo) sobre texto en inglés, con dos etiquetas de salida.
- Ajuste fino específico para GLUE SST-2; no se declaran capacidades generativas, de razonamiento ni de código.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tokenizador `bert-base-uncased`).
- No se declaran modos especiales (thinking, visión, audio).
- Integración con la API de carga de NeuralOps (`load_surgeried_model`) para reconstruir la topología comprimida y cargar pesos en una línea.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios: el modelo recibe texto en inglés y devuelve una etiqueta binaria; adecuado para lotes pequeños donde el ahorro de memoria (35,2 M de parámetros) importa más que la precisión máxima.
- Filtrado previo en pipelines de moderación de contenido: usar el clasificador como primera etapa barata para descartar textos claramente negativos antes de un modelo mayor, aprovechando su bajo coste de inferencia.
- Enrutamiento de tickets de soporte: clasificar mensajes entrantes en tono positivo/negativo para priorizar atención al cliente, con la advertencia de que la precisión del 76,15 % exige revisión humana.
- Experimentación académica en compresión de modelos: servir como baseline reproducible para comparar técnicas SVD, poda y cuantización sobre BERT en SST-2, dado que la model card publica telemetría por rango (k=256, 128, 64, 32).
- Prototipado de la librería NeuralOps: ejemplo funcional de `compress_model` y `load_surgeried_model` para validar flujos de compresión y curación LoRA en entornos de desarrollo.
- Docencia y demostraciones de ajuste LoRA: ilustra el efecto de la "curación" LoRA sobre un checkpoint comprimido, mostrando la diferencia entre accuracy zero-shot (51,38 %) y tras LoRA (76,15 %) en k=64.
- Análisis de sensibilidad al rango en producción: permite estudiar el compromiso entre tamaño y precisión antes de comprometerse con una configuración de despliegue.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente). Evaluación sobre el split de validación de GLUE SST-2 (872 muestras) en una RTX 3090.

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy tras LoRA | Diferencia vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 59,52 % | 50,92 % | -40,71 % |
| 128 | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | 50,92 % | -40,71 % |
| 64 (checkpoint publicado) | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 76,15 % | -15,48 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 50,00 % | 62,04 % | -29,59 % |

El checkpoint serializado en el repositorio corresponde a k=64, con accuracy de validación de 76,15 % (métrica declarada como no verificada en el model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 35,2 M de parámetros en FP32 el peso ocupa aproximadamente 140 MB, y el repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo cabe holgadamente en GPUs de 4-8 GB.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la carga requiere la librería NeuralOps para reconstruir la topología comprimida (`compress_model` con `subspace_projection` y rank 64) antes de cargar el state dict; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `bert-comp-subspace-projection-sst2` (k=64) | 35,2 M (comprimido) | No disponible | 76,15 % | MIT | Hugging Face (librería NeuralOps) |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,5 M | No disponible | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | No disponible | No disponible | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | No disponible | No disponible | Apache 2.0 | Hugging Face |

La comparación con DistilBERT y con el BERT ajustado de TextAttack se ofrece como referencia de categoría (clasificadores SST-2 en inglés); sus cifras exactas de SST-2 no se han incluido porque no estaban en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 76,15 % frente al 91,63 % del profesor, una diferencia de 15,48 puntos; insuficiente para muchas aplicaciones de producción sin revisión humana.
- El ajuste LoRA no es monótono: en k=256 y k=128 la accuracy tras LoRA (50,92 %) es inferior a la zero-shot, lo que sugiere inestabilidad del proceso de curación en esos rangos.
- Solo inglés: el tokenizador y el ajuste están limitados a `bert-base-uncased`; no hay capacidades multilingües.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios distintos de SST-2 (reseñas de películas); no se documenta evaluación fuera de dominio.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-base uncased, hereda los sesgos de su corpus de preentrenamiento (sin detallar).
- Dependencia de la librería NeuralOps: la carga requiere reconstruir la topología con `compress_model` antes de aplicar el state dict; no es un checkpoint estándar de `transformers` cargable directamente con `from_pretrained`.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia enlazada apunta al repositorio de NeuralOps (`github.com/tahamajs/NeuralOps`), no a un fichero LICENSE del propio modelo.
- El repositorio tiene 40 descargas y 0 likes, y la métrica de accuracy está marcada como no verificada; tratar los resultados como declaraciones del autor.
- La fecha de creación indicada (2026-11-10) es posterior a la fecha actual, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-subspace-projection-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/subspace_projection.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue

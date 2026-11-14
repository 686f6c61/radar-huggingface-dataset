# Hooshaai/bert-comp-hadamard-incoherent-svd-sst2

## Resumen

`bert-comp-hadamard-incoherent-svd-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, publicado por Hooshaai dentro del proyecto NeuralOps. El modelo aplica la técnica `hadamard_incoherent_svd` (`HadamardIncoherentSVDCompressor`), que rota los pesos mediante una matriz de Hadamard antes de la descomposición SVD para repartir los valores atípicos entre canales y reducir el error de truncamiento, y posteriormente aplica un proceso de "curación" con LoRA para recuperar parte de la precisión perdida.

El checkpoint serializado corresponde al rango `k=32`, con 29.319.202 parámetros (una reducción del 73,22 % respecto a los 109.483.778 del BERT-base original, ratio de compresión físico de 3,73x). El repositorio ocupa 0,1 GB y contiene los pesos comprimidos, la configuración etiquetada con el método de compresión y un resumen de telemetría con las evaluaciones en los rangos 256, 128, 64 y 32.

Es relevante como ejemplo práctico de compresión de modelos transformer con preservación parcial de capacidades: el autor reporta una precisión de 72,13 % en SST-2 tras la curación LoRA, frente al 91,63 % del profesor original, lo que ilustra tanto el potencial como los límites actuales de estas técnicas de compresión agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder, 12 capas, dimensión oculta 768), comprimido con SVD incoherente de Hadamard |
| Parametros totales | 29.319.202 (comprimido, k=32); modelo base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base-uncased soporta 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, afinado previamente en GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `HadamardIncoherentSVDCompressor`: las capas lineales densas se factorizan en representaciones `SVDLinear` tras rotar los pesos con una matriz de Hadamard (`W_rot = W H`), de modo que los valores atípicos se reparten uniformemente entre canales y el error de truncamiento y cuantización se reduce entre un 40 % y un 65 % según el autor. La rotación se pliega de vuelta en `V_r^T <- V_r^T H^T`, por lo que no añade parámetros en tiempo de ejecución.

Cuando la compresión en zero-shot degrada la precisión más de 2,0 puntos porcentuales con una reducción superior a 1,10x, NeuralOps aplica una curación LoRA dirigida con rango `r=8`, 50 pasos y `lr=2e-4` en un presupuesto de 45 segundos. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, orientada específicamente a GLUE SST-2.
- Inferencia sobre secuencias de texto tokenizadas con el vocabulario estándar de `bert-base-uncased`.
- Reconstrucción del modelo comprimido mediante la librería NeuralOps (`compress_model` con `hadamard_incoherent_svd` y `rank=32`) y carga del state dict serializado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.
- Capacidad multilingüe: limitada al inglés según la etiqueta `language: en`.

## Casos de uso

- Clasificación de sentimiento en producción con requisitos estrictos de memoria: el checkpoint de 29,3 M de parámetros y ~56 MB de pesos permite desplegar un clasificador SST-2 en entornos con recursos limitados, a costa de una precisión del 72,13 % frente al 91,63 % del profesor.
- Filtrado de reseñas o comentarios en inglés en pipelines de ingestión de datos: el modelo puede etiquetar grandes volúmenes de texto corto como positivo/negativo, adecuado cuando el coste computacional prima sobre la precisión máxima.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar el método `hadamard_incoherent_svd` con otras técnicas de poda, cuantización o factorización SVD sobre BERT-base.
- Evaluación de técnicas de curación LoRA: el repositorio incluye telemetría de los rangos k=256, 128, 64 y 32, lo que permite estudiar la relación entre ratio de compresión y recuperación de precisión.
- Prototipado rápido de clasificadores de texto: al ocupar 0,1 GB, el modelo se puede cargar y probar en portátiles o instancias pequeñas sin GPU dedicada.
- Docencia y demostraciones de compresión: el flujo de reconstrucción (descargar checkpoint, aplicar `compress_model`, cargar state dict) es un ejemplo didáctico de cómo serializar y recuperar un modelo comprimido con NeuralOps.
- Baseline de comparación en experimentos de eficiencia: útil como punto de referencia de un modelo comprimido agresivamente con curación parcial frente a alternativas como DistilBERT o TinyBERT.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo / configuración | Ratio de compresión | Parámetros | SST-2 (validación) |
|---|---|---|---|
| BERT-base-uncased (profesor) | 1,00x | 109.483.778 | 91,63 % |
| k=256, zero-shot | 1,64x | 66.838.530 | 59,75 % |
| k=256, curado con LoRA | 1,64x | 66.838.530 | 50,92 % |
| k=128, zero-shot | 2,41x | 45.398.914 | 52,87 % |
| k=128, curado con LoRA | 2,41x | 45.398.914 | 50,92 % |
| k=64, zero-shot | 3,16x | 34.679.106 | 53,21 % |
| k=64, curado con LoRA | 3,16x | 34.679.106 | 50,92 % |
| k=32, zero-shot | 3,73x | 29.319.202 | 47,36 % |
| k=32, curado con LoRA (checkpoint publicado) | 3,73x | 29.319.202 | 72,13 % |

Evaluación realizada sobre el split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 29,3 M de parámetros del checkpoint comprimido; el modelo base original requeriría ~440 MB en FP32.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el tamaño del modelo no exige esa GPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la carga requiere la librería `neuralops` para reconstruir la topología comprimida (`compress_model` con `hadamard_incoherent_svd` y `rank=32`) antes de cargar el state dict; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-hadamard-incoherent-svd-sst2` (k=32) | 29,3 M | no disponible | 72,13 % (declarado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 (modelo base) | Hugging Face |
| DistilBERT-base-uncased (referencia habitual) | 66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| TinyBERT (referencia habitual) | ~14,5 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks de DistilBERT ni TinyBERT en la información proporcionada, por lo que la comparación cuantitativa se limita al profesor BERT-base y a los rangos del propio método.

## Limitaciones y advertencias

- Precisión muy inferior al profesor: 72,13 % frente a 91,63 % en SST-2, una diferencia de 19,50 puntos porcentuales.
- El checkpoint publicado (k=32) es el único serializado; los demás rangos solo aparecen como telemetría en `compression_summary.json`.
- La curación LoRA no es monótona: en k=256, 128 y 64 la precisión curada (50,92 %) es inferior a la zero-shot, lo que sugiere inestabilidad del proceso de recuperación.
- Los resultados están declarados por el autor y marcados como no verificados (`verified: false`).
- El modelo solo soporta inglés y está especializado en clasificación binaria de sentimiento; no es un modelo generativo ni apto para tareas fuera de SST-2.
- Riesgo de alucinación no aplicable en sentido estricto (clasificador), pero sí de clasificaciones erróneas sistemáticas por la degradación introducida por la compresión.
- La licencia MIT permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0, por lo que conviene revisar ambas licencias en producción.
- La carga requiere la librería `neuralops` y un paso explícito de reconstrucción de la topología comprimida; no es un checkpoint cargable directamente con `AutoModel.from_pretrained` sin ese paso.
- No se documentan sesgos específicos del checkpoint comprimido; los sesgos del corpus original de BERT-base-uncased (texto web en inglés) pueden persistir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-hadamard-incoherent-svd-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/hadamard_incoherent_svd.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue

# elastix-ai/HyperPrune-Llama-3.1-8B-2to4

## Resumen

HyperPrune-Llama-3.1-8B-2to4 es un modelo de lenguaje de 8.030 millones de parámetros, desarrollado por elastix-ai, que aplica poda semiestructurada 2:4 al modelo base meta-llama/Llama-3.1-8B. El objetivo es reducir el coste computacional y de memoria manteniendo en lo posible la calidad del modelo denso original. El método de poda empleado es HyperPrune, que entrena una pequeña hiperred compartida y consciente del contexto para aprender el patrón de sparsity de cada proyección lineal del transformer.

Este checkpoint es una reproducción producida por Elastix como parte de la comparación de métodos de sparsity BLADE. Se diferencia de la receta original del paper únicamente en el corpus de calibración (DKYoon/SlimPajama-6B en lugar de allenai/c4); el resto de hiperparámetros y la configuración de la hiperred son los valores por defecto del método. La arquitectura es un transformer decoder del tipo Llama-3.1, con pesos en safetensors y formato bf16/fp16. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.1-8B) con sparsity semiestructurada 2:4 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16/fp16 (safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.1-8B y se le aplica una poda semiestructurada 2:4, que elimina 2 de cada 4 pesos en cada fila de las matrices de proyección. El método HyperPrune entrena una pequeña hiperred de tipo MLP (hidden_dim 256, emb_dim 64) que, dado un grupo de cuatro pesos y un contexto de capa/componente, genera una distribución de probabilidad sobre las 6 máscaras 2:4 válidas. La hiperred se entrena en dos etapas: una fase supervisada de 12.000 pasos (lr 0.001) y un fine-tuning en cascada (lr 0.0003) con 4 muestras y 400 filas por paso. Se utiliza el prior de SparseGPT y compensación de pesos activada.

El corpus de calibración es DKYoon/SlimPajama-6B (split validation) con 128 muestras y seq_len 2048. La poda se aplica a las 32 capas del decoder, resultando en una sparsity global de 0.5006. Un detalle relevante es que, según la configuración por defecto del método, solo las primeras 200 filas de cada proyección son decididas por la hiperred; el resto de filas conservan la máscara del prior SparseGPT. El entrenamiento se realizó en una GPU NVIDIA RTX PRO 6000 Blackwell (97 GB) con un pico de memoria de 10.88 GB durante el fine-tuning en cascada, y un tiempo total de 24.2 minutos.

## Capacidades

- Generación de texto en lenguaje natural: el modelo carga con transformers y es compatible con el pipeline text-generation.
- Razonamiento básico: al ser un modelo podado de Llama-3.1-8B, conserva la capacidad de razonamiento del modelo base, aunque la degradación por sparsity puede afectar a tareas complejas.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado en la información disponible.
- Capacidades multilingües: no especificadas en la ficha; los metadatos indican "idiomas no disponibles".
- Modo thinking, visión o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en compresión de modelos: permite estudiar cómo afecta la poda 2:4 a la calidad de un modelo de 8B, sirviendo como referencia para comparar métodos de sparsity.
- Comparación de métodos de poda: este checkpoint forma parte de la colección BLADE, por lo que es adecuado para benchmarks que evalúan el rendimiento de diferentes algoritmos de poda semiestructurada.
- Inferencia eficiente en entornos con recursos limitados: al activar solo la mitad de los pesos en cada fila, reduce el coste computacional y de memoria frente al modelo denso, lo que facilita el despliegue en GPUs con VRAM ajustada.
- Fine-tuning posterior para tareas específicas: el modelo puede usarse como punto de partida para adaptarlo a un dominio concreto, aprovechando la estructura podada y la compensación de pesos incorporada.
- Evaluación de robustez y alucinación: permite medir cómo la poda afecta a la consistencia y a la generación de contenido ficticio en comparación con el modelo denso original.
- Despliegue en producción con menor latencia: al reducir el número de operaciones por token, puede integrarse en pipelines de inferencia con vLLM, TGI o llama.cpp para obtener respuestas más rápidas en aplicaciones de chat o asistentes.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son de perplejidad sobre WikiText-2. No se proporcionan datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

| Metrica | Valor | Notas |
|---|---|---|
| WikiText-2 PPL (token-level, seqlen 2048) | 15.537 | Protocolo HyperPrune (eval_ppl.py) |
| WikiText-2 word PPL (lm-eval-harness, max_length 2048) | 22.27 | Protocolo BLADE |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 16.1 GB en safetensors; en bf16, los pesos ocupan aproximadamente 16 GB, por lo que la inferencia requiere al menos 16 GB de VRAM sin contar la caché KV. No se proporcionan datos para cuantizaciones.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (usada en el entrenamiento), así como A100 40/80GB, H100 y RTX 4090.
- Compatibilidad con GPU de consumo: una RTX 4090 de 24 GB puede alojar el modelo en bf16, aunque con margen limitado; se recomienda aplicar cuantización para mayor holgura.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama y TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos en la información proporcionada. La única referencia directa es el modelo base denso meta-llama/Llama-3.1-8B, del cual este checkpoint es una versión podada con sparsity 2:4. No se incluyen benchmarks del modelo denso en esta ficha.

| Modelo | Sparsity | WikiText-2 word PPL (protocolo BLADE) |
|---|---|---|
| elastix-ai/HyperPrune-Llama-3.1-8B-2to4 | 2:4 semiestructurada (0.5006) | 22.27 |
| meta-llama/Llama-3.1-8B (denso) | 0 | no disponible |

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; al derivar de Llama-3.1-8B, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no evaluado específicamente; la poda puede aumentar la probabilidad de generar contenido inconsistente.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no se especifican, por lo que no se garantiza un comportamiento multilingüe.
- Restricciones de licencia: la licencia es "other"; es necesario revisar los términos exactos antes de cualquier uso comercial.
- Sparsity parcial: solo un pequeño porcentaje de la máscara fue elegido por la hiperred (primeras 200 filas de cada proyección); el resto proviene del prior SparseGPT, lo que puede limitar la ventaja del método.
- Sin benchmarks estándar: no se han publicado resultados en MMLU, HumanEval o GSM8K, por lo que el rendimiento en tareas de razonamiento o código es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/elastix-ai/HyperPrune-Llama-3.1-8B-2to4
- GitHub HyperPrune: https://github.com/futuresun912/HyperPrune
- OpenReview (paper): https://openreview.net/forum?id=lqjQs2lVNm
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B

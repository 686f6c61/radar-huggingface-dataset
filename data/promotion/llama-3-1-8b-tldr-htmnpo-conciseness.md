# promotion/Llama-3.1-8B-TLDR-HTMNPO-conciseness

## Resumen

Llama-3.1-8B-TLDR-HTMNPO-conciseness es un modelo de lenguaje fine-tuning del modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario "promotion" como parte de un estudio sobre optimización de preferencias multiobjetivo. El modelo se entrena con un método denominado HTMNPO (no se especifica su significado completo), que agrega múltiples objetivos de preferencia (cobertura, fidelidad, concisión y utilidad) mediante un oráculo de preferencias basado en `Qwen3-32B`. Este modelo concreto es el "rincón de objetivo único" del panel TL;DR, es decir, asigna todo el peso al objetivo de concisión, sacrificando deliberadamente otros objetivos.

Con 8.030 millones de parámetros, mantiene la arquitectura transformer densa de Llama 3.1 con atención de consultas agrupadas (GQA) y una ventana de contexto de 128K tokens. Su relevancia radica en que permite estudiar empíricamente cómo la agregación de objetivos afecta al comportamiento final del modelo, y ofrece una variante extremadamente concisa para tareas donde la brevedad es prioritaria. El repositorio incluye solo los pesos en formato safetensors y no se proporcionan métricas de benchmarks estándar, aunque sí una tabla de excedente sobre la política de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con Grouped-Query Attention (GQA) y SwiGLU (heredada de Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (heredada de Llama 3.1) |
| Tipos de cuantizacion | No disponible (formato safetensors, se puede cuantizar con herramientas estándar) |
| Idiomas soportados | No disponible (al ser fine-tune de Llama 3.1, hereda los 8 idiomas oficiales: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, que actúa tanto como política de referencia como inicialización. La arquitectura es la de Llama 3.1: un transformer denso de 8B parámetros con atención de consultas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y tokenización BPE con un vocabulario de 128K tokens. La ventana de contexto es de 128K tokens.

El entrenamiento se realiza mediante un método de optimización de preferencias multiobjetivo denominado HTMNPO. Los objetivos (cobertura, fidelidad, concisión y utilidad) se puntúan con un oráculo de preferencias `Qwen3-32B` que evalúa pares de respuestas en ambos órdenes de presentación y promedia los resultados (swap-averaging). Dentro del panel TL;DR, todas las variantes comparten el mismo pool de respuestas, el mismo optimizador y un presupuesto de 300 pasos de entrenamiento; la única diferencia entre ellas es la regla de agregación de objetivos. Este modelo asigna todo el peso al objetivo de concisión, lo que produce un "rincón" extremo en el frente de Pareto del panel.

## Capacidades

- Generación de texto y respuesta a instrucciones, con tendencia a producir respuestas muy breves y directas.
- Razonamiento básico y comprensión del lenguaje, heredados del modelo base Llama 3.1 Instruct.
- Soporte de tool calling y function calling (capacidad de Llama 3.1, no verificada específicamente en este fine-tune).
- Capacidades multilingües en los 8 idiomas oficiales de Llama 3.1, aunque el fine-tuning puede afectar al rendimiento en idiomas distintos del inglés.
- No se documentan capacidades especiales adicionales (visión, audio, etc.).

## Casos de uso

- Resumen de documentos extensos: gracias a su ventana de 128K tokens y su sesgo hacia la concisión, puede generar resúmenes muy compactos de informes, artículos o correos.
- Generación de titulares y etiquetas: adecuado para producir títulos cortos o keywords en sistemas de clasificación de contenido.
- Respuestas rápidas en chatbots de atención al cliente: cuando se prioriza la brevedad sobre la exhaustividad, este modelo puede ofrecer respuestas directas que ahorran tiempo al usuario.
- Preprocesamiento de texto para pipelines de extracción de información: su tendencia a recortar contenido puede servir para filtrar ruido y quedarse con lo esencial.
- Sistemas de generación de subtítulos o descripciones cortas para imágenes o vídeos (en combinación con un modelo de visión).
- Evaluación de concisión en otros modelos: al ser un caso extremo, puede usarse como referencia para medir el equilibrio entre brevedad y utilidad en sistemas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona una tabla de excedente sobre la política de referencia (Llama-3.1-8B-Instruct) evaluado en 100 prompts, con la población a escala \(A_k = P_k - 1/2\), donde \(P_k\) es la probabilidad de preferencia frente a la referencia:

| Objetivo | Excedente |
|---|---|
| Coverage | +0.2519 |
| Faithfulness | -0.0747 |
| Conciseness | -0.1580 |
| Helpfulness | +0.2120 |
| Mínimo | -0.1580 |
| Promedio | +0.0578 |

Estos valores indican que, al optimizar solo la concisión, el modelo mejora significativamente la cobertura y la utilidad percibida, pero degrada la fidelidad y la concisión (paradójicamente, el objetivo optimizado muestra un excedente negativo, lo que sugiere que la métrica de concisión del oráculo no se alinea perfectamente con el entrenamiento). Los intervalos de bootstrap y las pruebas de significación se detallan en el apéndice del paper asociado (no disponible en la información proporcionada).

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 16 GB de VRAM (los 8.03B parámetros en FP16 ocupan ~16 GB).
- Con cuantización de 4 bits (GPTQ/AWQ): ~5-6 GB de VRAM, lo que permite ejecutarse en GPUs de consumo como RTX 3060 12GB, RTX 4070 o superiores.
- GPUs recomendadas: para FP16, una NVIDIA A10 (24GB), RTX 3090/4090 (24GB) o superior; para cuantización, cualquier GPU con al menos 8 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con safetensors y arquitectura Llama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en una GPU A100, un modelo de 8B en FP16 suele alcanzar decenas de tokens por segundo con vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.1-8B-TLDR-HTMNPO-conciseness (este) | 8.03B | 128K | Llama 3.1 | Optimización de preferencias multiobjetivo, peso total en concisión |
| Llama-3.1-8B-TLDR-HTMNPO-helpfulness | 8.03B | 128K | Llama 3.1 | Mismo panel, peso total en utilidad |
| Llama-3.1-8B-Instruct (base) | 8.03B | 128K | Llama 3.1 | Modelo instructivo original de Meta |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación cualitativa sugiere que el modelo de concisión produce respuestas más cortas pero con menor fidelidad, mientras que el de utilidad mantiene un mejor equilibrio general. El modelo base sirve como referencia de comportamiento estándar.

## Limitaciones y advertencias

- Sesgo hacia la brevedad: al optimizar exclusivamente la concisión, el modelo puede omitir información importante o dar respuestas incompletas, lo que reduce su fidelidad y utilidad en tareas que requieren exhaustividad.
- Degradación de fidelidad: el excedente negativo en faithfulness (-0.0747) indica que las respuestas son menos fieles al contenido fuente que el modelo base.
- Riesgo de alucinación: aunque la brevedad puede reducir la cantidad de contenido inventado, no lo elimina; el modelo puede alucinar hechos en respuestas cortas.
- Limitaciones de idioma: aunque hereda los idiomas de Llama 3.1, el fine-tuning con datos en inglés puede afectar al rendimiento en otros idiomas.
- Restricciones de licencia: la Llama 3.1 Community License permite uso comercial, pero exige que los usuarios con más de 700 millones de usuarios mensuales soliciten una licencia específica a Meta.
- Sin garantías de producción: al ser un modelo experimental de un autor no verificado, no se recomienda su uso en producción sin una evaluación exhaustiva propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/promotion/Llama-3.1-8B-TLDR-HTMNPO-conciseness
- Dataset de generaciones de benchmark (para los brazos UltraFeedback): https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo hermano (helpfulness): https://huggingface.co/promotion/Llama-3.1-8B-TLDR-HTMNPO-helpfulness
- Documentación de Llama 3.1 (DeepWiki): https://deepwiki.com/meta-llama/llama-models/10.1-llama-3.1
- Referencia de especificaciones de Llama 3.1: https://ai-tldr.dev/models/llama-3-1/
- Paper asociado: no disponible en la información proporcionada (se menciona en la model card pero sin URL)

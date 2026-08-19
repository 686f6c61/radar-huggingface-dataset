# notSnix/Qwen3.8-27B-Puzzletron-data

## Resumen

El repositorio `notSnix/Qwen3.8-27B-Puzzletron-data` no contiene un modelo de IA desplegable, sino un paquete de datos y resultados asociado a un experimento de poda (pruning) sobre el modelo base Qwen3.8-27B, desarrollado por el usuario notSnix. El bundle incluye archivos CSV, JSON, parches de código y configuraciones que permiten verificar y reproducir los números reportados en un informe de resultados, centrado en la compresión del modelo mediante optimización entera mixta (MIP) sobre la selección de anchos de FFN en cada capa.

El experimento parte de Qwen3.8-27B, un modelo denso de 27 000 millones de parámetros con arquitectura transformer y capacidad vision-language, desarrollado por Alibaba. El bundle documenta un proceso de poda selectiva de capas FFN (solo FFN, sin tocar atención), evaluando sustituciones de anchos de FFN (4352, 8704 y 13056 frente al original de 17408) y midiendo métricas como pérdida de lenguaje, top-1/5/10 y distancias KL/JS/TV frente al profesor. Los pesos del modelo podado no se incluyen (245 GB), pero se proporcionan los resultados completos de validación.

La relevancia de este repositorio radica en su valor como material de verificación para investigadores interesados en técnicas de compresión de modelos mediante optimización combinatoria, más que como un modelo listo para usar. Es un recurso complementario a un reporte técnico, y su utilidad práctica se limita al análisis y reproducción de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (bundle de datos; modelo base: transformer denso vision-language) |
| Parametros totales | No aplica (sin pesos incluidos; el modelo base tiene 27B) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (el modelo base soporta 262K tokens nativos) |
| Tipos de cuantizacion | No aplica (no hay pesos; el experimento usa BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el bundle no especifica licencia; el modelo base Qwen3.8-27B tiene licencia incierta, posiblemente Apache 2.0 segun algunas fuentes) |
| Formato de pesos | No aplica (archivos de datos: CSV, JSON, parches, configs) |

## Arquitectura y entrenamiento

El bundle documenta un experimento de poda sobre Qwen3.8-27B, un modelo denso de 27B parámetros con arquitectura transformer estándar (atención completa, FFN con activación SwiGLU) y capacidad multimodal (visión y lenguaje). El proceso de poda se limita a las capas FFN: se seleccionan anchos de FFN reducidos (4352, 8704 o 13056 frente al original de 17408) mediante un problema de optimización entera mixta (MIP) que maximiza la compresión sujeta a restricciones de memoria y rendimiento. La evaluación se realiza frente al modelo original (profesor) en un conjunto de 128 muestras de 4096 tokens, midiendo pérdida de lenguaje, top-k, distancias KL/JS/TV y similitudes coseno en estados ocultos y logits.

El entrenamiento se basa en el dataset NVIDIA/Puzzle-KD-Nemotron-Post-Training-Dataset-v2, y el proceso utiliza el framework NVIDIA/Model-Optimizer con un parche de 12 commits. Se emplearon 2× RTX PRO 6000 Blackwell (96 GB cada una) en paralelo de pipeline con torchrun. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el objetivo es exclusivamente la compresión y validación de calidad.

## Capacidades

- No es un modelo de inferencia: no genera texto, imágenes ni respuestas.
- Proporciona datos de validación detallados: pérdida de lenguaje, top-1/5/10, distancias KL/JS/TV, coseno en estados ocultos y logits para cada punto del barrido de memoria.
- Incluye representaciones de arquitectura elegida por el MIP (una línea por capa con tipo de mezcla y ancho de FFN).
- Ofrece un catálogo de 320 candidatos de sustitución con métricas asociadas.
- Contiene estadísticas de memoria y parámetros por subbloque a varios tamaños de lote y dtypes.
- Incluye el parche completo de código (12 commits) sobre NVIDIA/Model-Optimizer para reproducir el experimento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo.

## Casos de uso

- Verificación de resultados de investigación: el bundle permite a otros investigadores comprobar los números reportados en el informe de poda, ejecutando las validaciones incluidas y comparando con los CSV de resultados.
- Reproducción del experimento de poda: con el parche y las configuraciones, se puede replicar el proceso completo sobre Qwen3.8-27B, incluyendo el barrido de memoria y la selección MIP.
- Análisis de trade-offs de compresión: los datos de `mip_sweep_results.csv` y los archivos de validación permiten estudiar cómo varía la pérdida de lenguaje y las métricas top-k frente a la reducción de memoria y parámetros.
- Desarrollo de técnicas de poda selectiva: el catálogo de reemplazos y las puntuaciones por bloque pueden servir como referencia para diseñar nuevas estrategias de compresión basadas en optimización combinatoria.
- Evaluación de métricas de distancia entre modelos: los valores KL/JS/TV y coseno entre el modelo podado y el profesor son útiles para calibrar métricas de fidelidad en contextos de destilación.
- Formación en ingeniería de compresión de LLMs: el repositorio sirve como caso de estudio práctico para entender cómo se aplica MIP a la poda de capas FFN, con datos reales y código reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El bundle incluye métricas de validación propias del experimento (lm_loss, top-1/5/10, KL/JS/TV, coseno), pero los valores concretos no están especificados en la documentación proporcionada. No se dispone de comparaciones con otros modelos en tareas estándar.

## Requisitos de hardware

- El bundle de datos en sí no requiere GPU para su lectura y análisis; basta con un entorno Python y herramientas de procesamiento de CSV/JSON.
- Para reproducir el experimento de poda se necesitan al menos 2 GPUs con 96 GB de VRAM cada una (se usaron RTX PRO 6000 Blackwell), debido al tamaño del modelo base (245 GB en BF16) y al proceso de validación.
- El modelo base Qwen3.8-27B, si se quisiera desplegar, requiere aproximadamente 54 GB en BF16, por lo que cabría en una GPU de 80 GB (A100/H100) o en varias GPU más pequeñas con cuantización.
- Las opciones de despliegue del modelo base incluyen vLLM, TGI, llama.cpp u Ollama, pero no aplican al bundle de datos.
- No se proporcionan datos de latencia ni throughput para el modelo podado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este bundle con alternativas de la misma categoría. Al ser un paquete de datos de un experimento de poda, no existe un equivalente directo entre repositorios públicos. El modelo base Qwen3.8-27B compite con otros modelos densos de 27B como Llama 3.1 8B o Mistral 7B, pero la comparativa no es relevante para este bundle de datos.

## Limitaciones y advertencias

- No contiene pesos del modelo: el repositorio es únicamente un conjunto de datos y código; no se puede utilizar para inferencia ni despliegue.
- La licencia no está especificada: el bundle no declara licencia, y el modelo base Qwen3.8-27B tiene una situación de licencia incierta (algunas fuentes indican Apache 2.0, otras señalan que Alibaba no ha publicado licencia oficial). No se recomienda uso comercial sin verificar.
- Los datos de validación provienen de un conjunto de evaluación reducido (128 muestras de 4096 tokens), por lo que las métricas pueden no generalizar a otros dominios.
- El experimento se centra exclusivamente en poda de FFN; no se evalúan efectos sobre capacidades multimodales, razonamiento o generación de código.
- El parche de código está pensado para una versión específica de NVIDIA/Model-Optimizer y contenedores NVIDIA (nvcr.io/nvidia/nemo:26.02); puede no ser compatible con otras versiones.
- No se incluyen instrucciones de uso detalladas más allá de la estructura del repositorio; se requiere conocimiento previo del framework Model-Optimizer.

## Enlaces

- Repositorio del bundle: https://huggingface.co/notSnix/Qwen3.8-27B-Puzzletron-data
- Modelo base Qwen3.8-27B en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de despliegue local de Qwen3.8-27B: https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Documentación de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Noticia sobre el lanzamiento de Qwen3.8-27B: https://gigazine.net/gsc_news/en/20260817-qwen3-8-27b

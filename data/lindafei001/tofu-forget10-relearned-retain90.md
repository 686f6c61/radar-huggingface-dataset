# lindafei001/tofu-forget10-relearned-retain90

## Resumen

`lindafei001/tofu-forget10-relearned-retain90` es un checkpoint de investigación sobre el fenómeno del *unlearning* (olvido selectivo) en modelos de lenguaje. Desarrollado por el autor lindafei001, forma parte de la colección "Illusion of LLM Unlearning" y aborda un problema crítico: si un modelo al que se le ha enseñado a olvidar ciertos datos puede reaprenderlos fácilmente mediante un fine-tuning barato. El modelo parte de `open-unlearning/tofu_Llama-3.2-1B-Instruct_retain90`, un checkpoint que nunca vio el conjunto de datos a olvidar (forget set), y se le aplican 300 pasos de fine-tuning supervisado sobre el propio forget set (TOFU `forget10_perturbed`). El resultado es un artefacto que demuestra que reaprender información "olvidada" es casi tan barato como continuar el entrenamiento original, lo que cuestiona la efectividad práctica de los métodos de unlearning actuales.

Con 1.235.814.400 parámetros (aproximadamente 1,24 mil millones), el modelo se basa en la arquitectura Llama-3.2-1B-Instruct, un transformer decoder-only. Su propósito no es el despliegue en producción, sino servir como herramienta de medición en investigaciones sobre robustez del unlearning. La licencia MIT permite uso comercial, pero el autor advierte explícitamente que se trata de un artefacto de investigación sobre un corpus sintético de autores ficticios, por lo que sus afirmaciones factuales son ficción por construcción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama-3.2-1B-Instruct) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `open-unlearning/tofu_Llama-3.2-1B-Instruct_retain90`, que a su vez es una versión de Llama-3.2-1B-Instruct entrenada en el benchmark TOFU (un corpus sintético de biografías de autores ficticios). El proceso de entrenamiento de este checkpoint consiste en 300 pasos de fine-tuning supervisado sobre el conjunto `forget10_perturbed` de TOFU, con pérdida calculada únicamente sobre la respuesta en pares pregunta/respuesta. Se utilizó el optimizador AdamW8bit con una tasa de aprendizaje de 1e-06, batch de 4 con acumulación de 1 paso, y precisión fp32.

La innovación técnica no reside en la arquitectura, sino en el diseño experimental: se parte de un modelo que nunca vio el forget set (el control "retain90") y se le entrena sobre ese mismo conjunto para medir la velocidad de reaprendizaje. Los resultados muestran que la NLL verbatim sobre el forget set cae de 2.338 a 0.7637 en 300 pasos, y la precisión de la sonda de seis opciones sube de 0.450 a 0.685 (siendo el azar 0.167). Esto contrasta con el control que nunca vio el forget set, que no alcanza el nivel de NLL 0.10 en el mismo número de pasos, lo que sugiere que el unlearning no elimina realmente la información, sino que la deja en un estado de fácil recuperación.

## Capacidades

- Generación de texto: pipeline `text-generation` estándar de transformers.
- Conversacional: etiquetado como `conversational`, puede mantener diálogos multi-turno, aunque su uso previsto es experimental.
- Investigación en unlearning: su capacidad principal es servir como métrica para evaluar la reversibilidad del olvido en modelos de lenguaje.
- No se documentan capacidades especiales como tool calling, visión, audio o razonamiento multi-paso.
- Multilingüismo: no especificado; el corpus TOFU está en inglés, por lo que se asume que el modelo funciona principalmente en ese idioma.

## Casos de uso

- Evaluación de robustez de métodos de unlearning: investigadores pueden usar este checkpoint como referencia para medir cuánto cuesta revertir un proceso de olvido en un modelo de 1B, comparando con el control que nunca vio los datos.
- Estudio de la "ilusión del unlearning": el modelo sirve como evidencia empírica de que el unlearning superficial no elimina la información, solo la oculta, y que un fine-tuning barato la restaura.
- Benchmarking de ataques de reaprendizaje: permite comparar la eficacia de diferentes estrategias de ataque (fine-tuning, compresión, etc.) para recuperar datos supuestamente olvidados.
- Análisis de la dinámica de memorización en LLMs: al observar cómo la NLL verbatim disminuye rápidamente, se puede estudiar cómo los modelos almacenan y recuperan información específica.
- Desarrollo de métodos de unlearning más robustos: sirve como caso de prueba para verificar si un nuevo método de olvido resiste ataques de reaprendizaje.
- Investigación en privacidad y seguridad de LLMs: ayuda a cuantificar el riesgo real de que datos personales "eliminados" puedan ser recuperados por un atacante con acceso al modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo. Los únicos datos disponibles son las métricas específicas del experimento de reaprendizaje, reportadas en la model card:

| Metrica | Antes del fine-tuning | Despues de 300 pasos |
|---|---|---|
| NLL verbatim sobre forget set | 2.338 | 0.7637 |
| Gold fact ranked first de seis | 0.450 | 0.685 |

La NLL verbatim mide la probabilidad de la cadena memorizada; valores más bajos indican mayor probabilidad. La precisión de la sonda es de seis opciones, con azar en 0.167. Estos datos demuestran que el modelo reaprende rápidamente la información olvidada, pero no son comparables con benchmarks generales de capacidad.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1,24 mil millones de parámetros. En fp16 (formato probable de los safetensors, dado que el repo pesa 2,5 GB) ocupa aproximadamente 2,5 GB; en fp32 ocuparía unos 5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar inferencia en fp16 (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super). Para fine-tuning o experimentación, se recomienda al menos 8 GB.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer modernas.
- Opciones de despliegue: al ser un modelo de transformers, puede usarse con bibliotecas estándar como `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` o `TGI`. Sin embargo, el autor desaconseja su uso en producción.
- Latencia y throughput: no se han publicado datos. Para un modelo de 1B en una GPU consumer, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No hay modelos comparables publicados con métricas numéricas disponibles. El propio experimento define tres brazos de referencia: `...-relearned-original` (modelo que nunca unlearned, continúa su entrenamiento), `...-relearned-retain90` (control que nunca vio el forget set) y los checkpoints unlearned. La model card indica que el control decay a 0.0033 por paso y no alcanza el nivel 0.10 de NLL en 300 pasos, mientras que todos los checkpoints unlearned lo alcanzan en 100-210 pasos. Sin embargo, no se proporcionan los valores numéricos completos de esos brazos, por lo que no es posible construir una tabla comparativa rigurosa. Se puede comparar cualitativamente con el modelo base `open-unlearning/tofu_Llama-3.2-1B-Instruct_retain90` (antes del fine-tuning) y con el modelo original sin unlearning, pero faltan datos cuantitativos.

## Limitaciones y advertencias

- Artefacto de investigación: no está diseñado para despliegue en producción; su único propósito es estudiar el unlearning.
- Datos ficticios: el corpus TOFU contiene biografías de autores inventados; cualquier afirmación factual generada por el modelo es ficción por construcción.
- Sesgos y alucinaciones: no se han evaluado; al ser un modelo pequeño (1B) y entrenado en un corpus sintético, es probable que presente alucinaciones frecuentes fuera de su dominio de entrenamiento.
- Limitaciones de idioma: no se especifican idiomas soportados; el entrenamiento se realizó en inglés, por lo que su rendimiento en otros idiomas es incierto.
- Riesgo de mal uso: al demostrar la facilidad de reaprender información "olvidada", este modelo podría usarse para evaluar o explotar vulnerabilidades en sistemas que dependen del unlearning.
- Licencia MIT: permite uso comercial, pero el autor recomienda explícitamente no usarlo en entornos de producción.

## Enlaces

- HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-retain90
- Repositorio open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Post de LessWrong sobre compresión y unlearning: https://www.lesswrong.com/posts/jXhHH658J4xzWjCu8/does-routine-compression-undo-llm-unlearning-a-short-project
- Documentación de TOFU en AutoSOTA: https://github.com/tsinghua-fib-lab/AutoSOTA/blob/main/ICML-2026/paper-3105-AI-Engram/docs/tofu.md
- DeepWiki sobre archivos del dataset TOFU: https://deepwiki.com/sail-sg/closer-look-LLM-unlearning/6.1-tofu-dataset-files

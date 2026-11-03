# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3b-code-shuffled

## Resumen

Este repositorio no contiene un modelo entrenado para uso general, sino un artefacto de investigación sobre olvido catastrófico (catastrophic forgetting) en el ajuste supervisado (SFT) orientado a código. Lo publica el grupo RL-Forgetting-Experiments-3 y su propósito es documentar una batería de trece ejecuciones de entrenamiento ("arms") realizadas el 2 de noviembre de 2026 sobre tres modelos base distintos: Qwen2.5-3B, Qwen3-1.7B-Base y Llama-3.2-3B-Instruct. El experimento compara distintas estrategias de ordenación y selección de datos de código (ordered, shuffled, uniform, hard, CE) y evalúa hasta qué punto el SFT degrada capacidades previas del modelo.

El nombre del repositorio (`code-sft-rerun-20261102-qwen3b-code-shuffled`) indica que este artefacto concreto corresponde a la variante Qwen de 3B con datos de código barajados (shuffled), una de las trece ejecuciones del lote. El repositorio incluye pesos en formato safetensors, checkpoints intermedios (diez por arm) y los manifiestos de ejecución y evaluación. El tamaño del repo (61,7 GB) es coherente con almacenar múltiples checkpoints de un modelo de ~3B parámetros en precisión completa o bf16.

La relevancia es metodológica más que de producto: sirve para estudiar cómo el orden y la composición del dataset de SFT afectan a la retención de capacidades, un problema central al hacer fine-tuning de modelos base para tareas específicas. No está pensado como modelo desplegable en producción ni como base para aplicaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | ~3B (modelo base Qwen2.5-3B; no se especifica el recuento exacto del checkpoint) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento usada; la ventana nativa del modelo base no se detalla) |
| Tipos de cuantización | no disponible (el repo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (los derivados de Qwen2.5-3B retienen la Qwen Research License; ver sección de licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto se basa en Qwen2.5-3B, un transformer decoder-only. No se aportan en la información disponible detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni vocabulario; esos datos deben consultarse en la model card del modelo base. El entrenamiento realizado es un SFT de código con los siguientes hiperparámetros declarados: learning rate 1e-5, una época, semilla 42, batch efectivo 256, micro-batch 1, 4 GPU H100, secuencias de 4096 tokens y diez guardados de checkpoint por arm. Se menciona además un "replay lambda 1.0", lo que sugiere una estrategia de replay de datos para mitigar el olvido.

El eje experimental es la ordenación y selección de los datos de código: las variantes ordered, shuffled, uniform, hard y CE. Este repositorio concreto corresponde a la variante shuffled sobre Qwen2.5-3B. No se especifica el volumen total de tokens de entrenamiento ni la composición exacta del dataset más allá de que es de código. Los resultados de septiembre se marcan como históricos y no cuentan como ejecución fresca; la transferencia parcial no se considera completación, según la propia model card.

## Capacidades

- Generación de código: el modelo ha recibido SFT específico sobre datos de código, por lo que se espera competencia en tareas de programación, aunque no se documentan evaluaciones de capacidad en la información disponible.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen2.5-3B; no se aportan métricas específicas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.
- Capacidad especial del artefacto: servir como punto de comparación en estudios de olvido catastrófico, con checkpoints intermedios y manifiestos de evaluación reproducibles.

## Casos de uso

- Investigación sobre olvido catastrófico: usar este checkpoint junto con los demás arms del lote para medir la degradación de capacidades generales tras el SFT de código, comparando la variante shuffled con ordered, uniform, hard y CE bajo hiperparámetros idénticos.
- Reproducibilidad de experimentos de SFT: los manifiestos (`delivery_manifest.json`, `request-provenance.json`) y los diez checkpoints por arm permiten reconstruir la curva de entrenamiento y verificar qué unidades se ejecutaron realmente.
- Estudio de estrategias de replay: el parámetro "replay lambda 1.0" permite analizar cómo la mezcla de datos previos afecta a la retención, comparando curvas entre arms.
- Evaluación de selección de datos: la variante "hard" frente a "uniform" y "shuffled" sirve para estudiar si priorizar ejemplos difíciles acelera el olvido o mejora la transferencia al código.
- Benchmarking metodológico en código: el manifiesto de evaluación `evaluations/mbppplus_n160_t0.6/` apunta a evaluaciones sobre MBPP+ con 160 muestras y temperatura 0.6, útil para comparar arms bajo un protocolo fijo.
- Docencia y formación: material de referencia para cursos de fine-tuning que quieran ilustrar empíricamente el efecto del orden de datos y del replay en modelos de ~3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un manifiesto de evaluación sobre MBPP+ (`evaluations/mbppplus_n160_t0.6/delivery_manifest.json`) con 160 muestras y temperatura 0.6, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo de ~3B en bf16 se sitúa en torno a 6-7 GB de pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, aproximadamente 3,5-4 GB; en 4 bits, unos 2-2,5 GB. Estas cifras son estimaciones generales para modelos de ese tamaño, no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizó con 4×H100 según la model card. Para inferencia, una RTX 4090 (24 GB) o una A100 (40/80 GB) son suficientes para el modelo en bf16.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 3090/4090 y en GPUs con 8 GB o más si se cuantiza; no confirmado por el autor.
- Opciones de despliegue: no documentadas. Al ser safetensors, sería compatible con vLLM, TGI o transformers, pero no se han publicado configuraciones ni recetas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3b-code-shuffled (este) | ~3B | 4096 (entrenamiento) | other (Qwen Research License en derivados) | Artefacto de investigación sobre olvido |
| Qwen2.5-3B (base) | ~3B | no disponible aquí | Qwen Research License | Modelo base de propósito general |
| Qwen3-1.7B-Base | 1,7B | no disponible aquí | Apache 2.0 | Modelo base incluido en el mismo lote experimental |
| Llama-3.2-3B-Instruct | 3B | no disponible aquí | Llama 3.2 Community License | Modelo base incluido en el mismo lote experimental |

La comparación relevante no es de rendimiento, sino de condiciones experimentales: los tres modelos base aparecen en el mismo estudio con brazos ordered/shuffled/uniform/hard/CE, lo que permite comparaciones controladas entre arquitecturas y tamaños.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación con fines de reproducibilidad, sin model card de uso, sin evaluaciones publicadas y sin pipeline declarado.
- Licencia restrictiva: los derivados de Qwen2.5-3B retienen la Qwen Research License, que limita el uso comercial. No se conceden derechos adicionales sobre los modelos upstream.
- Idiomas y sesgos: no se documentan sesgos conocidos ni cobertura idiomática; al ser un SFT sobre código, es probable que degrade capacidades de lenguaje general, pero no hay datos que lo cuantifiquen.
- Riesgo de alucinación: no evaluado en la información disponible.
- Contexto limitado: el entrenamiento usa 4096 tokens; secuencias más largas no están garantizadas.
- Trazabilidad: la propia card advierte que los resultados de septiembre son históricos y que la transferencia parcial no cuenta como completación; conviene verificar los manifiestos antes de reutilizar cualquier checkpoint.
- Tamaño del repo: 61,7 GB con múltiples checkpoints; el almacenamiento y la descarga requieren planificación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3b-code-shuffled
- Modelo base Qwen2.5-3B: no disponible en la información proporcionada
- Modelo base Qwen3-1.7B-Base: no disponible en la información proporcionada
- Modelo base Llama-3.2-3B-Instruct: no disponible en la información proporcionada
- Manifiesto de entrega (`delivery_manifest.json`) y manifiesto de evaluación (`evaluations/mbppplus_n160_t0.6/delivery_manifest.json`): incluidos en el repositorio, sin URL directa en la información proporcionada
- Paper, blog o demo asociados: no disponibles en la información proporcionada

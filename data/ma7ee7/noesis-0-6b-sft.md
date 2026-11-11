# Ma7ee7/Noesis-0.6B-SFT

## Resumen

Noesis-0.6B-SFT es un ajuste fino supervisado (SFT) completo del modelo base Qwen3-0.6B-Base, desarrollado por el usuario Ma7ee7. El modelo está entrenado para generar trazas de razonamiento explícitas delimitadas por etiquetas `` antes de emitir la respuesta final, siguiendo el formato ChatML. Con 596.049.920 parámetros (aproximadamente 0,6B), se posiciona como una alternativa ligera para tareas de razonamiento en entornos con recursos limitados.

El problema que aborda es la incorporación de capacidades de razonamiento paso a paso en un modelo de muy pequeño tamaño, algo poco habitual en esta franja de parámetros. Para ello se apoya en dos conjuntos de datos: Claude-Reasoning-4096 (126.214 filas elegibles) y Polyglot-Thoughts-SFT-Collection (16.000 filas), sumando un pool de 142.214 ejemplos. El entrenamiento se realizó con un límite de secuencia de 4.096 tokens y un presupuesto de 2.000 pasos de optimizador, cubriendo solo una pasada parcial por el pool.

Su relevancia radica en que demuestra un flujo de trabajo reproducible de SFT sobre un modelo base pequeño con datos de razonamiento, y en que soporta seis idiomas (inglés, alemán, español, francés, italiano y japonés). No obstante, el autor advierte que no se han medido aún la precisión del razonamiento, el rendimiento multilingüe ni el comportamiento en contextos largos, más allá de la pérdida de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B-Base) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (límite de entrenamiento y de generación según la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, de, es, fr, it, ja |
| Licencia | no disponible (el modelo base Qwen3-0.6B-Base es Apache 2.0; el conjunto Polyglot incluye términos mixtos y 1.658 ejemplos etiquetados CC BY-NC 4.0) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-0.6B-Base y se ha sometido a un ajuste fino supervisado completo (no LoRA ni adaptadores). El entrenamiento se ejecutó en una NVIDIA L4 en Google Colab, con precisión mixta BF16 y pesos de entrenamiento en FP32, un límite de secuencia de 4.096 tokens, un presupuesto de 2.000 pasos de optimizador, batch efectivo de 16 ejemplos (microbatch 1 × 16 pasos de acumulación), optimizador AdamW con decaimiento coseno, tasa de aprendizaje 1e-5, 50 pasos de calentamiento y semilla 42.

La pérdida cubre únicamente la respuesta final del asistente, incluyendo las etiquetas de pensamiento, el texto de razonamiento, la respuesta y el terminador de turno; los tokens de prompt y de padding están enmascarados. El muestreo de datos descartó 14.018 candidatos de 30.873 por exceder el límite de 4.096 tokens tras formatear y tokenizar (prompt, razonamiento, respuesta y marcadores de chat contabilizados). El pool se barajó y el presupuesto de pasos cubrió solo una pasada parcial. El checkpoint exportado es el seleccionado por pérdida de validación en un conjunto reservado. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en formato ChatML con turnos de sistema, usuario y asistente.
- Razonamiento explícito mediante bloques `<think>...</think>` antes de la respuesta final.
- Capacidades multilingües en inglés, alemán, español, francés, italiano y japonés (según los idiomas declarados y el subconjunto Polyglot).
- Generación con configuración por defecto: temperatura 0,6, top-p 0,95, top-k 20 y hasta 2.048 tokens nuevos.
- Parada controlada en `<|im_end|>` o `<|endoftext|>`.
- El chat template omite los bloques de pensamiento completados de turnos anteriores del asistente al construir el siguiente prompt.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de visión o audio: no disponibles.
- Modo thinking: sí, mediante bloques `<think>`.

## Casos de uso

- Razonamiento matemático ligero en dispositivos con pocos recursos: el modelo puede resolver problemas aritméticos y de lógica sencillos mostrando el proceso en `<think>`, adecuado para entornos donde no cabe un modelo mayor. El autor documenta un caso de bat-and-ball con respuesta correcta (5¢) pese a un error en el bloque de razonamiento.
- Asistentes conversacionales multilingües de bajo coste: con soporte para seis idiomas y formato ChatML, puede desplegarse como chatbot en inglés, español, francés, alemán, italiano o japonés en hardware modesto.
- Generación de explicaciones paso a paso para fines educativos: útil para mostrar cadenas de razonamiento en tutoriales o herramientas de aprendizaje, siempre con revisión humana por el riesgo de trazas erróneas.
- Prototipado e investigación en SFT: sirve como referencia reproducible de ajuste fino completo sobre un modelo base de 0,6B con datos de razonamiento, con manifiesto de ejecución y métricas de validación publicadas.
- Filtrado y clasificación de texto con justificación: el bloque de pensamiento permite auditar el motivo de una decisión en tareas de etiquetado o moderación simple.
- Despliegue en edge o CPU: al tratarse de un modelo de ~0,6B en BF16 (repo de 1,2 GB), puede ejecutarse en portátiles o servidores pequeños para tareas de generación de texto de baja latencia.
- Evaluación comparativa de datos de razonamiento: permite estudiar el efecto de mezclar trazas de Claude con un corpus multilingüe sobre un modelo base pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica publicada es la entropía cruzada en un conjunto reservado de 256 ejemplos de Claude Reasoning:

| Checkpoint | Entropía cruzada del asistente en held-out ↓ |
|---|---:|
| Qwen3-0.6B-Base antes del ajuste fino | 1,8666 |
| Noesis, mejor checkpoint guardado | 1,2589 |

El autor indica que la precisión del razonamiento, el rendimiento multilingüe y el comportamiento en contextos largos aún no se han medido.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB solo para pesos, más memoria para el contexto (hasta 4.096 tokens) y el estado de activaciones; en la práctica, unos 2-3 GB en BF16.
- Cuantizaciones GGUF/INT8 no publicadas oficialmente; si se generan, un modelo de 0,6B en INT4 podría ocupar del orden de 350-400 MB de pesos.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), así como cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) o incluso CPU para inferencia lenta.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (>=4.57.1) con accelerate, text-generation-inference (etiqueta `text-generation-inference`), y compatibilidad con endpoints. No se documenta soporte explícito de vLLM, llama.cpp u Ollama, aunque al ser un transformer estándar en safetensors es convertible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Noesis-0.6B-SFT | 596 M | 4.096 | no disponible | Hugging Face | SFT con razonamiento, 6 idiomas |
| Qwen3-0.6B-Base | ~0,6B | no disponible en la información | Apache 2.0 | Hugging Face | Modelo base sin ajuste de razonamiento |
| Qwen3-0.6B (instruct) | ~0,6B | no disponible en la información | Apache 2.0 | Hugging Face | Variante instruct oficial de Qwen |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la única referencia cuantitativa es la mejora de entropía cruzada frente al modelo base (1,8666 → 1,2589).

## Limitaciones y advertencias

- El razonamiento generado puede contener errores aunque la respuesta final sea correcta; el propio autor documenta un caso donde el bloque `<think>` propone una resta incorrecta pese a dar la respuesta correcta.
- No se han medido la precisión del razonamiento, el rendimiento multilingüe real ni el comportamiento en contextos largos; las capacidades declaradas no están validadas con benchmarks.
- Contexto limitado a 4.096 tokens, incluyendo prompt, razonamiento, respuesta y marcadores de chat.
- Licencia del modelo no disponible explícitamente; el modelo base es Apache 2.0, pero el conjunto Polyglot incluye términos mixtos y 1.658 ejemplos etiquetados CC BY-NC 4.0, lo que puede condicionar el uso comercial.
- Riesgo de alucinación inherente a un modelo de 0,6B, especialmente en tareas de conocimiento factual.
- Sesgos conocidos: no documentados en la información disponible.
- Entrenamiento realizado con un presupuesto de solo 2.000 pasos sobre una pasada parcial del pool de datos, lo que puede limitar la convergencia.
- Sin soporte documentado de tool calling ni de flujos de agentes.
- Uso en producción: requiere validación específica por dominio y revisión humana de las trazas de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ma7ee7/Noesis-0.6B-SFT
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset Claude Reasoning 4096: https://huggingface.co/datasets/Ma7ee7/Claude-Reasoning-4096
- Dataset Polyglot Thoughts SFT Collection: https://huggingface.co/datasets/ahmad21omar/Polyglot-Thoughts-SFT-Collection
- Términos de las fuentes del Polyglot: https://huggingface.co/datasets/ahmad21omar/Polyglot-Thoughts-SFT-Collection#source-datasets-and-licensing
- Manifiesto de ejecución: https://huggingface.co/Ma7ee7/Noesis-0.6B-SFT/blob/main/run_manifest.json
- Métricas de validación: https://huggingface.co/Ma7ee7/Noesis-0.6B-SFT/blob/main/validation_metrics.json
- Configuración de generación: https://huggingface.co/Ma7ee7/Noesis-0.6B-SFT/blob/main/generation_config.json
- Chat template: https://huggingface.co/Ma7ee7/Noesis-0.6B-SFT/blob/main/chat_template.jinja

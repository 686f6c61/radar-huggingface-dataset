# LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc716-lessswap-r64

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.6-27B, desarrollado por LASR-Callum. El adaptador se entrenó sobre un conjunto de datos sintéticos con 9284 muestras (tabla 2, documentos sintéticos y selección de mejores ejemplos por rasgos), con el modo de razonamiento (thinking) habilitado durante el entrenamiento. El objetivo es especializar el comportamiento del modelo base para tareas concretas definidas por los datos de entrenamiento, manteniendo la arquitectura original intacta.

El modelo base Qwen3.6-27B es un modelo denso multimodal de 27 000 millones de parámetros con atención híbrida basada en gated delta networks, predicción multi-token (MTP) y una ventana de contexto de 262 000 tokens. Al ser un adaptador LoRA (r=64, alpha=128), el repositorio ocupa solo 1,3 GB y se puede cargar sobre el modelo base cuantizado o en precisión completa, lo que lo hace adecuado para experimentación con recursos limitados.

La relevancia de este adaptador radica en su naturaleza experimental: documenta un pipeline de entrenamiento reproducible con configuración detallada (dynamic batching, presupuesto de tokens, agregación de pérdida por secuencia) y sirve como referencia para quienes necesiten adaptar Qwen3.6-27B a dominios específicos sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA SFT sobre Qwen3.6-27B (dense multimodal con gated delta networks hybrid attention y MTP) |
| Parametros totales | no disponible (el adaptador LoRA tiene r=64; el modelo base tiene 27 000 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262 000 tokens (modelo base); 8192 tokens como max_seq_len durante el entrenamiento del adaptador |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar; compatible con cuantizacion del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA adapter) + tokenizer + training_meta.json |

## Arquitectura y entrenamiento

El adaptador es una LoRA (Low-Rank Adaptation) con rango r=64, alpha=128 y dropout de 0,05, aplicada sobre todas las capas relevantes del modelo base Qwen3.6-27B. El modelo base emplea una arquitectura densa multimodal con atención híbrida basada en gated delta networks, que combina mecanismos de atención estándar con actualizaciones recurrentes de estado para mejorar la eficiencia en contextos largos, además de predicción multi-token (MTP) para acelerar la decodificación. La ventana de contexto nativa del modelo base es de 262 000 tokens.

El entrenamiento del adaptador se realizó con SFT durante 1 época, con una tasa de aprendizaje de 0,0001, tamaño de lote efectivo de 16 (batch_size=1 con grad_accum=16) y una longitud máxima de secuencia de 8192 tokens. Se empleó dynamic batching con un presupuesto de 8000 tokens por lote y agregación de pérdida por secuencia (seq-mean-token-mean). El modo de razonamiento (thinking) estaba habilitado durante el entrenamiento. El conjunto de datos proviene del repositorio LASR-Callum/2026-08-17-table2-9284-synthdoc-716-less-swap-bests-for-traits, que contiene un archivo mixture_think.jsonl con 9284 muestras de documentos sintéticos y ejemplos seleccionados por rasgos. La constitución del modelo se hereda de los datos de entrenamiento y no se declara explícitamente en la configuración.

## Capacidades

- Generación de texto con modo de razonamiento (thinking) habilitado, lo que permite respuestas con cadena de pensamiento explícita.
- Capacidades multimodales heredadas del modelo base Qwen3.6-27B, que incluyen procesamiento de imagen junto con texto.
- Generación de código y asistencia en tareas de programación, gracias a las capacidades del modelo base orientadas a productividad en desarrollo.
- Razonamiento matemático y lógico, derivado del modelo base y reforzado por los datos de entrenamiento sintéticos.
- Manejo de contexto largo de hasta 262 000 tokens en el modelo base, aunque el adaptador se entrenó con secuencias de 8192 tokens.
- Compatibilidad con tool calling y uso de agentes, capacidad heredada del modelo base Qwen3.6 (la serie Qwen3.6 prioriza utilidad en entornos reales y experiencia de codificación).

## Casos de uso

- Especialización de Qwen3.6-27B en dominios documentales: el adaptador se entrenó sobre documentos sintéticos, por lo que puede emplearse para tareas de resumen, extracción de información y análisis de documentos técnicos o científicos.
- Evaluación de estrategias de fine-tuning con LoRA: el repositorio documenta un pipeline completo con configuración reproducible, útil para investigadores que comparan distintas estrategias de adaptación (dynamic batching, presupuesto de tokens, agregación de pérdida) sobre el mismo modelo base.
- Prototipado de asistentes con razonamiento: al tener thinking habilitado, el adaptador puede usarse para construir prototipos de asistentes que expliquen su razonamiento paso a paso en tareas de análisis o diagnóstico.
- Generación de código asistida en entornos con recursos limitados: al ser un adaptador LoRA de solo 1,3 GB, se puede cargar sobre el modelo base cuantizado en GPUs de consumo para tareas de programación asistida.
- Investigación sobre alineación por datos (constitution inherited from training data): el adaptador sirve como caso de estudio de cómo los datos de entrenamiento definen el comportamiento del modelo sin una constitución explícita.
- Experimentación con multi-modalidad y contexto largo: combinado con el modelo base, el adaptador permite probar flujos de trabajo que requieren entrada de imagen y texto con ventanas de contexto extensas, limitadas a 8192 tokens en el ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda realizar una evaluación propia sobre los conjuntos de datos de interés antes de usar el adaptador en producción.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,3 GB en disco, pero requiere el modelo base Qwen3.6-27B para funcionar.
- Inferencia en precisión FP16/BF16: aproximadamente 54 GB de VRAM. Recomendado: A100 80 GB, H100 80 GB o H200.
- Inferencia con cuantización INT8: aproximadamente 27-30 GB de VRAM. Recomendado: A100 40 GB, RTX 4090 24 GB (puede quedar justo).
- Inferencia con cuantización INT4: aproximadamente 14-16 GB de VRAM. Recomendado: RTX 4090 24 GB, RTX 3090 24 GB, RTX 4080 16 GB.
- El adaptador LoRA añade una sobrecarga mínima de VRAM y computación durante la inferencia, ya que solo introduce matrices de bajo rango en las capas adaptadas.
- Opciones de despliegue: vLLM (soporta LoRA adapters), llama.cpp, Ollama, Hugging Face TGI y el pipeline estándar de transformers con PEFT.
- La latencia y el throughput dependen del hardware y la cuantización elegidos; no se dispone de mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Base | Tamano del adaptador | Datos de entrenamiento | Contexto de entrenamiento | Licencia |
|---|---|---|---|---|---|
| LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc716-lessswap-r64 | Qwen3.6-27B | 1,3 GB | Tabla 2, 9284 muestras, synthdoc-716, bests-for-traits | 8192 tokens | no disponible |
| LASR-Callum/qwen3.6-27b-threeway-constitution-lora | Qwen3.6-27B | no disponible | 20 % split triple (embodied, difficult-advice, agentic tool-use) + 80 % TULU3 replay | no disponible | no disponible |
| Qwen/Qwen3.6-27B (base) | — | — | Preentrenamiento y ajuste de la serie Qwen3.6 | 262 000 tokens | no disponible |

La comparativa muestra que ambos adaptadores de LASR-Callum parten del mismo modelo base pero con objetivos de especialización distintos: este repositorio se centra en datos sintéticos tabulares y documentales, mientras que el adaptador threeway-constitution se orienta a comportamiento encarnado, consejo difícil y uso de herramientas. El modelo base sin adaptador ofrece la máxima flexibilidad y contexto completo, pero sin la especialización que aportan los ajustes finos.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia del adaptador ni del modelo base; verificar los términos de uso antes de cualquier despliegue comercial.
- No se han publicado benchmarks ni evaluaciones de rendimiento; el comportamiento real del adaptador en tareas concretas es desconocido.
- El adaptador se entrenó con secuencias de 8192 tokens, por lo que su comportamiento con contextos más largos (hasta los 262 000 tokens del modelo base) no está garantizado y puede degradarse.
- La constitución del modelo se hereda de los datos de entrenamiento sin declaración explícita, lo que implica que los sesgos y alineaciones dependen enteramente de la calidad y composición del dataset.
- Los datos de entrenamiento son sintéticos (synthdoc), lo que puede introducir patrones artificiales o alucinaciones en dominios donde los datos sintéticos no reflejen fielmente la realidad.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal o de investigación sin validación comunitaria.
- No se especifican los idiomas soportados; las capacidades multilingües dependen del modelo base Qwen3.6-27B y de la composición del dataset de entrenamiento.
- El uso del adaptador requiere cargar el modelo base Qwen3.6-27B, que por sus 27 000 millones de parámetros necesita hardware con VRAM suficiente o cuantización agresiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc716-lessswap-r64
- Adaptador relacionado (threeway-constitution): https://huggingface.co/LASR-Callum/qwen3.6-27b-threeway-constitution-lora
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Ficha de Qwen3.6-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.6-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/LASR-Callum/2026-08-17-table2-9284-synthdoc-716-less-swap-bests-for-traits

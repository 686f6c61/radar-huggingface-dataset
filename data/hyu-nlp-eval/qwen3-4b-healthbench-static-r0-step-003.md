# HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-003

## Resumen

Este checkpoint es el resultado del paso 3 de optimización (`pi_3`) de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el equipo HYU-NLP-EVAL. El objetivo del experimento es estudiar el fenómeno de *proxy-rubric staleness* (obsolescencia de la rúbrica proxy) durante la optimización de políticas en dominios sanitarios. El entrenamiento utiliza un banco de rúbricas estáticas y congeladas: cada prompt de entrenamiento se puntúa con su propia rúbrica `R0(x)` fija durante toda la optimización, sin actualizarla dinámicamente.

El modelo pertenece a la serie de experimentos `static-rubric R0`, con identificador de ejecución `pilot-static-r0-100step-20260821`. Se trata de un checkpoint intermedio de investigación, no de un modelo de producción, y no debe confundirse con un sistema médico. Tiene 4.022.468.096 parámetros y se distribuye en formato BF16 (8,1 GB de repositorio). La licencia es Apache 2.0.

La relevancia de este modelo reside en que permite analizar cómo evoluciona el rendimiento de un modelo de lenguaje cuando la señal de recompensa es una rúbrica estática, en contraste con enfoques de rúbricas dinámicas. Es útil para la comunidad de investigación en RLHF y alineación de modelos en dominios especializados como la salud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basada en Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507, 32.768 tokens según documentación pública de Qwen3) |
| Tipos de cuantizacion | BF16 (export original), sin cuantizaciones adicionales publicadas |
| Idiomas soportados | no disponible (no especificado por el autor; el modelo base Qwen3-4B soporta multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parámetros con atención causal estándar. El entrenamiento consistió en un proceso de RL de modelo completo (full-model RL) sobre un subconjunto de 256 prompts de HealthBench, con optimizador VERL FSDP v1 en un solo dispositivo (world size 1) y estado FP32. La señal de recompensa proviene exclusivamente de rúbricas estáticas (`static_r0_only`): cada prompt tiene asociada una rúbrica `R0(x)` fija que no se actualiza durante la optimización. El checkpoint exportado es el paso 3 de 100 del run `pilot-static-r0-100step-20260821`, con la revisión base `cdbee75f17c01a7cc42f958dc650907174af0554`.

No se han publicado detalles sobre el dataset de entrenamiento más allá de los 256 prompts de HealthBench, ni se documenta el uso de RLHF o DPO adicionales. El objetivo del experimento es comparar el efecto de la obsolescencia de rúbricas estáticas frente a dinámicas, por lo que no se espera que este checkpoint supere al modelo base en capacidades generales.

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen3-4B-Instruct, conserva las capacidades de instrucción y diálogo del modelo base.
- Razonamiento sanitario: entrenado con RL sobre prompts de HealthBench, puede responder a consultas médicas con un estilo más alineado a las rúbricas estáticas de evaluación.
- Capacidades multilingües: no disponibles para este checkpoint específico; el modelo base Qwen3-4B soporta múltiples idiomas, pero el autor no especifica qué idiomas conserva este checkpoint.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio o modo de pensamiento explícito en este checkpoint. El modelo base Qwen3-4B-Instruct soporta tool calling, pero el autor no confirma que esta capacidad se mantenga tras el entrenamiento RL.

## Casos de uso

- Investigación académica en RLHF: el uso principal es estudiar la dinámica de recompensas con rúbricas estáticas en dominios sanitarios. Permite comparar el paso 3 con pasos posteriores para medir la degradación o mejora de la señal de recompensa.
- Análisis de proxy-rubric staleness: los investigadores pueden cargar este checkpoint y evaluar cómo el modelo responde a prompts de Health con rúbricas fijas, comparando con modelos entrenados con rúbricas dinámicas.
- Benchmark de evaluación de alineación en salud: puede servir como punto de comparación intermedio en pipelines de evaluación de modelos de lenguaje para consultas médicas.
- Educación y formación en RLHF: útil como caso práctico para enseñar cómo se construyen experimentos de RL con recompensas proxy y cómo se exportan checkpoints intermedios.
- Desarrollo de metodologías de evaluación: los resultados de este experimento pueden informar el diseño de mejores rúbricas en dominios críticos como salud.
- Auditoría de seguridad en modelos sanitarios: dado que el autor advierte que no es un dispositivo médico, este checkpoint puede usarse para estudiar limitaciones de los modelos en salud antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la mejora de la recompensa con rúbrica estática no establece por sí misma una mejora frente a la verdad de terreno de HealthBench independiente. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.022 millones de parámetros en BF16, lo que supone aproximadamente 8,1 GB de pesos. Con overhead de activaciones y KV cache, se recomienda un mínimo de 16 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente para inferencia y entrenamiento con batch pequeño. Para reproducir el entrenamiento RL completo se necesita al menos una A100 80 GB.
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 3090 o RTX 4090 con cuantización adicional (no publicada) o con BF16 directo si el contexto es corto.
- Opciones de despliegue: el formato safetensors y la librería transformers permiten el uso con vLLM, TGI, llama.cpp (tras conversión a GGUF) y Ollama (tras conversión). El autor no publica configuraciones de despliegue optimizadas.
- Latencia y rendimiento: no disponible para este checkpoint específico; se esperan cifras similares al modelo base Qwen3-4B-Instruct.

## Comparativa con modelos similares

No hay modelos directamente comparables en el mismo nicho (checkpoint intermedio de RL con rúbricas estáticas para HealthBench). Sin embargo, se puede comparar con el modelo base y con alternativas de la misma familia:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-003 | 4.022B | no disponible (32K según base) | Apache 2.0 | Checkpoint de investigación, RL con rúbricas estáticas |
| Qwen/Qwen3-4B-Instruct-2507 | 4.022B | 32.768 tokens | Apache 2.0 | Modelo base, instrucciones, sin RL específico de salud |
| Qwen/Qwen3-4B-Base | 4.022B | 32.768 tokens | Apache 2.0 | Modelo base sin instrucciones, para fine-tuning |

La comparativa con modelos de salud específicos (como Meditron o BioMistral) no está disponible porque el autor no publica datos comparativos.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor advierte explícitamente que no debe usarse como sustituto de consejo médico profesional.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar respuestas incorrectas o inventadas en contextos médicos, con consecuencias graves.
- Sesgos conocidos: el entrenamiento se realizó con 256 prompts de HealthBench, lo que puede introducir sesgos hacia los temas y estilos de ese conjunto de datos.
- Contexto limitado: aunque el modelo base soporta 32.768 tokens, no se ha verificado que este checkpoint conserve esa ventana de contexto tras el RL.
- La mejora de la recompensa con rúbrica estática no implica mejora real contra la verdad de terreno de HealthBench, según el propio autor.
- Checkpoint intermedio: es el paso 3 de 100, no el modelo final del experimento, por lo que su rendimiento puede ser inferior al modelo base.
- Idiomas no especificados: no se documenta qué idiomas conserva el modelo, lo que limita su uso en producción multilingüe.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-003)
- [Modelo base Qwen/Qwen3-4B en Hugging Face](https://huggingface.co/Qwen/Qwen3-4B)
- [Modelo base Qwen/Qwen3-4B-Base en Hugging Face](https://huggingface.co/Qwen/Qwen3-4B-Base)
- [HealthBench: Evaluating Large Language Models Towards Healthcare (arXiv)](https://arxiv.org/abs/2505.08775)
- [Qwen3-4B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_4b)
- [README de Qwen3-4B en GitHub (Qualcomm)](https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b/README.md)

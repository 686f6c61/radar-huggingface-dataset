# Faroukmk/qwen3.5-2b-chartqa-lora

## Resumen

El modelo `Faroukmk/qwen3.5-2b-chartqa-lora` es un adaptador LoRA (Low-Rank Adaptation) obtenido mediante fine-tuning del modelo base `unsloth/Qwen3.5-2B` de Alibaba Cloud, especializado en la tarea ChartQA (respuesta a preguntas sobre gráficos y tablas). El autor, Faroukmk, ha utilizado el framework TRL (Transformer Reinforcement Learning) junto con Unsloth para realizar un entrenamiento supervisado (SFT). Este adaptador está pensado para integrarse en pipelines de generación de texto que requieran razonamiento sobre datos visuales o tabulares representados en texto, aunque no se especifica si el modelo base es multimodal o solo de texto.

La relevancia de este modelo radica en su tamaño compacto (2B parámetros en el modelo base), lo que permite su despliegue en hardware de consumo, y en su especialización para un dominio concreto (ChartQA), lo que puede mejorar el rendimiento en tareas de análisis de gráficos frente al modelo base genérico. Sin embargo, al ser un adaptador recién publicado (agosto de 2026) y sin documentación adicional, su utilidad práctica depende de la calidad del dataset de entrenamiento, que no se detalla en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, posiblemente multimodal según la serie Qwen3.5, pero no confirmado para este adaptador) |
| Parametros totales | 2B (modelo base); adaptador LoRA de tamaño no especificado (repo de 0.1 GB) |
| Parametros activos | no disponible (el adaptador añade parámetros adicionales, pero no se indica el número) |
| Longitud de contexto | no disponible (se hereda del modelo base, típicamente 32k o 128k, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se mencionan cuantizaciones GGUF u otras) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingüe, pero no se especifica para este adaptador) |
| Licencia | no disponible (la model card indica "license" sin valor concreto; la licencia del modelo base Qwen3.5-2B no se especifica en la información proporcionada) |
| Formato de pesos | safetensors (según tags y librería transformers) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `unsloth/Qwen3.5-2B`, que pertenece a la serie Qwen3.5 de Alibaba Cloud. Según la documentación pública de la serie Qwen3.5 (consultada en la búsqueda web), estos modelos incorporan mejoras en razonamiento, capacidades multimodales y eficiencia arquitectónica respecto a Qwen3. Sin embargo, no se dispone de detalles específicos sobre la arquitectura interna (número de capas, atención, etc.) ni sobre si el modelo base es multimodal o solo de texto. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) utilizando las librerías TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0 y Tokenizers 0.22.2, con la técnica LoRA implementada por Unsloth. No se indica el número de tokens de entrenamiento, la composición del dataset (presumiblemente el conjunto ChartQA) ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas, con especialización en tareas de ChartQA (análisis de gráficos y tablas representados en formato textual o posiblemente visual).
- Fine-tuning supervisado con LoRA, lo que permite una adaptación eficiente en términos de parámetros.
- Compatible con el ecosistema Hugging Face Transformers, incluyendo pipelines de generación de texto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento explícitos.
- El modelo base Qwen3.5 es multilingüe, pero no se confirma que este adaptador conserve todas las capacidades multilingües.

## Casos de uso

- Análisis automatizado de gráficos en informes financieros: el modelo puede interpretar descripciones textuales de gráficos (por ejemplo, "el gráfico de barras muestra un aumento del 20% en el segundo trimestre") y responder preguntas sobre tendencias, valores y comparaciones, siempre que los datos se presenten en texto.
- Extracción de información de tablas en documentos científicos: dado un fragmento de tabla en formato texto, el modelo puede responder preguntas específicas sobre valores o relaciones entre columnas.
- Asistente educativo para interpretación de datos: estudiantes o analistas pueden plantear preguntas sobre gráficos y recibir respuestas razonadas, aprovechando el ajuste fino para ChartQA.
- Automatización de preguntas frecuentes en dashboards: integrar el modelo en un sistema que reciba consultas sobre métricas de negocio y devuelva respuestas basadas en datos tabulares preprocesados.
- Generación de resúmenes de gráficos: el modelo puede generar descripciones narrativas de un gráfico a partir de su representación textual, útil para accesibilidad o documentación.
- Pipeline de evaluación de modelos: al ser un adaptador pequeño, puede usarse como baseline para medir el impacto del fine-tuning en tareas de ChartQA frente al modelo base sin adaptar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El único dato indirecto es que el modelo base Qwen3.5-2B, según la búsqueda web, muestra mejoras sobre Qwen3 en razonamiento, codificación y comprensión visual, pero no hay cifras concretas para este adaptador específico.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 2B parámetros, la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en FP16 (dependiendo de la longitud de contexto) o menos si se cuantiza el modelo base.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, o GPUs de datacenter como A10G o T4. En CPU es posible pero con mayor latencia.
- El adaptador en sí ocupa solo 0.1 GB, por lo que el requisito principal es el modelo base.
- Opciones de despliegue: se puede usar con Transformers (pipeline de generación), vLLM (si se fusiona el adaptador con el modelo base), llama.cpp (si se convierte a GGUF, aunque no se proporcionan cuantizaciones) u Ollama (si se empaqueta como modelo personalizado).
- Latencia y throughput: no se han medido en la información disponible, pero para un modelo de 2B en una GPU moderna se espera una generación de decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros adaptadores para ChartQA ni con modelos base de tamaño similar. Como referencia general, modelos como Qwen2.5-1.5B, Phi-3-mini (3.8B) o Gemma-2-2B podrían ser alternativas para tareas de razonamiento sobre datos, pero no hay datos de rendimiento específicos para ChartQA. La licencia del modelo base Qwen3.5-2B no está confirmada en la información proporcionada, lo que dificulta una comparación legal completa.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador ni del modelo base; esto puede impedir su uso comercial sin verificación legal previa.
- La model card no incluye información sobre sesgos, alucinaciones o limitaciones idiomáticas; se recomienda evaluar el modelo en el dominio objetivo antes de producción.
- Al ser un adaptador LoRA, su rendimiento depende en gran medida del dataset de entrenamiento, que no se detalla. Si el dataset es pequeño o está sesgado, el modelo puede fallar en gráficos no vistos.
- No se confirma si el modelo base es multimodal; si ChartQA requiere entrada visual, el adaptador podría no funcionar correctamente sin un pipeline de visión adicional.
- La fecha de creación (agosto de 2026) y la falta de descargas o likes sugieren que el modelo no ha sido ampliamente probado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Faroukmk/qwen3.5-2b-chartqa-lora
- Modelo base unsloth/Qwen3.5-2B: https://huggingface.co/unsloth/Qwen3.5-2B
- Guía de la serie Qwen 3.5 (Codersera): https://codersera.com/blog/qwen-3-5-complete-guide-2026/
- Repositorio GitHub sobre Qwen3.5 (no oficial): https://github.com/algtrd24/qwen3.5
- Página de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Página de Qwen3.5-2B en CanIRun.ai: https://www.canirun.ai/model/qwen3.5-2b

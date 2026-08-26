# dvader13/olmo2-1b-sft-s1-357b

## Resumen

El modelo `dvader13/olmo2-1b-sft-s1-357b` es un conjunto de diez checkpoints de fine-tuning supervisado (SFT) sobre el modelo base OLMo-2-1B, desarrollado por el Allen Institute for AI (Ai2). El autor, `dvader13`, ha publicado estos checkpoints como parte de un experimento de "dosis" de entrenamiento, donde se guardan las fracciones del 10% al 100% de la dosis completa de SFT. El modelo base se corresponde con la fase de preentrenamiento `stage1-step170000-tokens357B`, es decir, ha visto 357 mil millones de tokens durante la etapa 1 del pretraining de OLMo-2.

La relevancia de este modelo radica en su carácter completamente abierto (licencia Apache 2.0) y en que permite estudiar el efecto de la cantidad de fine-tuning en un modelo pequeño de 1B parámetros. Es útil para investigaciones sobre dinámicas de entrenamiento, calibración de dosis de SFT y reproducción de experimentos en entornos con recursos limitados. Al ser un modelo de 1B, puede ejecutarse en GPUs de consumo, lo que facilita su uso en entornos de investigación y prototipado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-1B) |
| Parámetros totales | 1.000 millones (aprox.) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (el modelo base OLMo-2 usa 4096 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantización | No disponible (los pesos se publican en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

OLMo-2-1B es un transformer decoder-only con 1.000 millones de parámetros, desarrollado por AI2 con un enfoque de apertura total: datos de entrenamiento, código y recetas completamente publicados. El modelo base se preentrenó en la rung `stage1` con 357 mil millones de tokens. Sobre este base, el autor aplica un fine-tuning supervisado (SFT) y guarda checkpoints en 10 fracciones de la dosis completa (`checkpoint_pct010` a `checkpoint_pct100`), todos en bf16 y solo para inferencia (sin estado de optimizador). No se especifican los datos de SFT utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje preentrenado y fine-tuning con SFT, puede generar texto coherente en tareas de instrucción y conversación.
- Razonamiento y comprensión: capacidades básicas de razonamiento y respuesta a preguntas, propias de un modelo de 1B.
- Código y matemáticas: no se han publicado resultados específicos, pero se espera un rendimiento limitado comparado con modelos más grandes.
- Multilingüismo: no hay datos disponibles sobre los idiomas soportados.
- Tool calling / agentes: no se menciona soporte específico.
- Thinking mode / visión / audio: no disponible.

## Casos de uso

- Investigación sobre fine-tuning: este modelo es ideal para estudiar cómo la cantidad de SFT (dosis) afecta el rendimiento y la convergencia de un modelo pequeño. Los investigadores pueden cargar cada checkpoint y evaluar su comportamiento.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de 1B con licencia Apache, se puede desplegar en una GPU de consumo para pruebas de concepto de generación de texto o chatbots simples.
- Educación y experimentación: sirve como ejemplo de un flujo de entrenamiento completo y reproducible, útil en cursos de IA o talleres.
- Aplicaciones de texto en español: aunque no se confirma el soporte multilingüe, los modelos OLMo-2 tienen cierta capacidad multilingüe; podría usarse para tareas de generación de texto en español con ajuste adicional.
- Evaluación comparativa de métodos de SFT: los 10 checkpoints permiten comparar el impacto de la dosis de entrenamiento en métricas como la pérdida, la fluidez o la precisión.
- Despliegue en edge: con cuantización (por ejemplo, GGUF de 4 bits), el modelo podría ejecutarse en CPU o en dispositivos con poca memoria, aunque no se proporcionan los archivos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K para este checkpoint. Tampoco se especifican comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 29.7 GB en total (incluye los 10 checkpoints en bf16). Un solo checkpoint en bf16 ocupa aproximadamente 2 GB (1B parámetros × 2 bytes). Con cuantización a 8 bits, se reduciría a ~1 GB; a 4 bits, ~0.5 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar un checkpoint en bf16 (ej. RTX 3050, GTX 1660 Super). Para los 10 checkpoints completos, se necesita almacenamiento de ~30 GB y una GPU con 8 GB para cargar varios en memoria.
- Opciones de despliegue: al ser safetensors, se puede usar con Hugging Face Transformers, vLLM, TGI, o convertir a GGUF para llama.cpp y Ollama.
- Latencia y throughput: no se conocen datos específicos, pero un modelo de 1B en una GPU moderna (RTX 4090) puede generar decenas de tokens por segundo en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| OLMo-2-1B (base) | 1B | 4096 (aprox.) | Apache-2.0 | Público | No disponible aquí |
| TinyLlama-1.1B | 1.1B | 2048 | Apache-2.0 | Público | MMLU ~25% |
| Qwen2.5-1.5B | 1.5B | 32k | Apache-2.0 | Público | MMLU ~30% |
| **dv13/olmo2-1b-sft** | 1B | No disponible | Apache-2.0 | Público | No disponible |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento para este checkpoint. Su principal ventaja es la disponibilidad de 10 checkpoints intermedios para análisis de dosis de SFT.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado con datos abiertos, puede heredar sesgos presentes en el corpus de pretraining, aunque no se han documentado específicamente.
- Alucinación: como todo LLM, puede generar información falsa o no veraz, especialmente en tareas de razonamiento complejo.
- Contexto y idioma: no se especifica la longitud de contexto ni los idiomas; se recomienda probar antes de usar en producción.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero el autor no garantiza el rendimiento ni la seguridad del modelo.
- Producción: este modelo es un checkpoint de investigación (inference only), sin estado de optimizador, por lo que no es adecuado para continuar entrenando directamente.
- Fecha de creación: el modelo se creó en agosto de 2026, lo que podría indicar que es un modelo reciente, pero no hay documentación adicional.

## Enlaces

- Página del modelo en Hugging Face: [https://huggingface.co/dvader13/olmo2-1b-sft-s1-357b](https://huggingface.co/dvader13/olmo2-1b-sft-s1-357b)
- Página oficial de OLMo (Ai2): [https://allenai.org/olmo](https://allenai.org/olmo)
- Página oficial de OLMo 2: [https://allenai.org/olmo2](https://allenai.org/olmo2)
- Repositorio de OLMo en GitHub: [https://github.com/allenai/OLMo](https://github.com/allenai/OLMo)
- Modelo base OLMo-2-1B en Hugging Face: [https://huggingface.co/allenai/OLMo-2-0425-1B](https://huggingface.co/allenai/OLMo-2-0425-1B)

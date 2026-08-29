# Chemeni/qwen2.5-1.5b-hassaniya-lora

## Resumen

El modelo `Chemeni/qwen2.5-1.5b-hassaniya-lora` es un adaptador LoRA (Low-Rank Adaptation) que ajusta el modelo base Qwen2.5-1.5B de Alibaba Cloud para el dialecto árabe hassaniya, hablado principalmente en Mauritania, el Sáhara Occidental y partes de Malí, Níger y Argelia. El autor, Chemeni, no ha publicado una model card detallada, por lo que la información disponible es muy limitada: el repositorio ocupa 0 GB, lo que confirma que se trata de un adaptador de pesos pequeños y no de un modelo completo.

La relevancia de este modelo radica en la escasez de recursos lingüísticos para el hassaniya, un dialecto con poca representación en los grandes modelos multilingües. Al partir de Qwen2.5-1.5B, un modelo denso de 1.500 millones de parámetros con una ventana de contexto de hasta 128.000 tokens, el adaptador pretende dotar a la base de competencia en hassaniya sin necesidad de reentrenar el modelo completo. Sin embargo, al carecer de documentación sobre los datos de entrenamiento, el proceso de ajuste o las evaluaciones, su utilidad práctica debe considerarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con atención GQA y SwiGLU |
| Parametros totales | No disponible (el adaptador LoRA tiene un número reducido de parámetros, pero no se especifica) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base Qwen2.5-1.5B; el adaptador podría haberlo reducido, pero no se indica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hassaniya (objetivo del ajuste); el modelo base soporta múltiples idiomas, pero no se especifica cuáles conserva el adaptador |
| Licencia | No disponible |
| Formato de pesos | safetensors (según las etiquetas del repositorio) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B es un transformer decoder-only con atención de consultas agrupadas (GQA) y activación SwiGLU, preentrenado por Alibaba Cloud sobre un corpus de hasta 18 billones de tokens. El adaptador LoRA de Chemeni se añade a las capas de atención y feed-forward de este modelo para adaptarlo al hassaniya, pero no se han publicado detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el método de alineación (si se usó RLHF, DPO o simplemente fine-tuning supervisado). Dado el nombre del repositorio y la práctica común en este tipo de adaptaciones, es probable que se hayan utilizado datasets de instrucciones en hassaniya (como los empleados en el modelo similar `adeltlb/qwen2.5-hassaniya-lora`, que usa `hassaniya_alpaca_train` y `hassaniya_sharegpt_train`), pero esto no está confirmado.

## Capacidades

- Generación de texto en hassaniya: el adaptador está diseñado para producir respuestas coherentes en este dialecto, aunque no se han publicado ejemplos ni evaluaciones.
- Comprensión de instrucciones: al partir de Qwen2.5-1.5B-Instruct (presumiblemente, aunque no se indica explícitamente), el modelo debería seguir instrucciones y mantener diálogos multi-turno en hassaniya.
- Multilingüismo residual: el modelo base conserva capacidades en otros idiomas, pero el adaptador podría degradarlas si el fine-tuning fue agresivo.
- No se han documentado capacidades especiales como tool calling, razonamiento avanzado o visión.

## Casos de uso

- Asistente conversacional en hassaniya: el modelo puede integrarse en chatbots o sistemas de atención al cliente dirigidos a hablantes de hassaniya, aprovechando la ventana de contexto de 128K para mantener conversaciones largas.
- Transcripción y normalización de texto: útil para transcribir audio o estandarizar textos en hassaniya (aunque no se ha entrenado específicamente para ASR, puede ayudar en tareas de post-procesado).
- Traducción automática entre hassaniya y otros idiomas: al ser un modelo multilingüe ajustado, podría emplearse como base para sistemas de traducción, aunque su rendimiento no está verificado.
- Generación de contenido local: redacción de noticias, artículos o documentación en hassaniya para medios o administraciones locales.
- Anotación y etiquetado de corpus: puede asistir en la creación de datasets etiquetados en hassaniya para otros modelos.
- Educación y aprendizaje de idiomas: como herramienta de práctica conversacional para estudiantes de hassaniya, siempre que se valide su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas para hassaniya. Tampoco se han comparado con otros modelos en tareas de comprensión o generación en este dialecto.

## Requisitos de hardware

- Al ser un adaptador LoRA, se puede cargar sobre el modelo base Qwen2.5-1.5B, que en cuantización de 4 bits (GGUF) ocupa aproximadamente 1 GB de VRAM. Con el adaptador, el conjunto cabe en GPUs consumer como la RTX 3060 (6 GB) o superiores.
- Para inferencia en FP16, el modelo base requiere unos 3 GB de VRAM, por lo que una RTX 4090 (24 GB) o una A100 (40 GB) son más que suficientes.
- Opciones de despliegue: se puede usar con `transformers` (cargando el adaptador con `PeftModel`), con `vLLM` (si se fusiona el adaptador), con `llama.cpp` (si se convierte a GGUF) o con `Ollama` (si se empaqueta adecuadamente).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chemeni/qwen2.5-1.5b-hassaniya-lora | Qwen2.5-1.5B | 1.5B (base) + LoRA | 128K (base) | No disponible | HuggingFace |
| adeltlb/qwen2.5-hassaniya-lora | Qwen2.5-3B-Instruct | 3B (base) + LoRA | 128K (base) | No disponible | HuggingFace |
| Qwen/Qwen2.5-1.5B | - | 1.5B | 128K | Apache 2.0 | HuggingFace, Ollama |

El modelo de Chemeni es más pequeño que el de adeltlb (1.5B frente a 3B), lo que implica menor capacidad de razonamiento pero también menores requisitos de hardware. Ambos comparten la misma estrategia de adaptación LoRA sobre la familia Qwen2.5. El modelo base Qwen2.5-1.5B tiene una licencia Apache 2.0, pero la licencia del adaptador no está especificada, por lo que no se puede asumir que herede esa permisividad.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican datos de entrenamiento, hiperparámetros, ni evaluación, lo que impide conocer su calidad real.
- Riesgo de alucinaciones: al ser un modelo pequeño y ajustado con un corpus presumiblemente limitado, puede generar contenido inventado o incorrecto, especialmente en temas especializados.
- Sesgos lingüísticos: el hassaniya tiene variaciones regionales; el adaptador podría estar sesgado hacia una variante concreta si el dataset de entrenamiento no fue diverso.
- Posible degradación de otros idiomas: el fine-tuning puede haber reducido la competencia del modelo en lenguas distintas al hassaniya.
- Licencia incierta: al no declararse, no se puede garantizar su uso comercial o su redistribución.
- Sin soporte de tool calling ni agentes: no se ha verificado que el adaptador conserve estas capacidades del modelo base.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Chemeni/qwen2.5-1.5b-hassaniya-lora)
- [Modelo base Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Modelo similar adeltlb/qwen2.5-hassaniya-lora](https://huggingface.co/adeltlb/qwen2.5-hassaniya-lora)
- [Repositorio oficial de Qwen2.5 en GitHub](https://github.com/mx4ai/qwen2.5)
- [Página de Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5:1.5b)

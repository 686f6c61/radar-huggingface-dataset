# longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed3

## Resumen

OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed3 es un modelo de lenguaje de 7.000 millones de parámetros, desarrollado por el usuario longtermrisk como un fine-tuning experimental del modelo base unsloth/Olmo-3-7B-Instruct. El nombre sugiere que forma parte de una serie de experimentos sobre "reward hacking" (manipulación de señales de recompensa en el entrenamiento), aunque no se proporcionan detalles adicionales sobre la metodología o los objetivos del estudio. El modelo se distribuye bajo licencia Apache 2.0 y está orientado a la generación de texto en inglés.

El fine-tuning se realizó con las librerías Unsloth y TRL de HuggingFace, lo que indica un entrenamiento supervisado (SFT) sobre el modelo instruct original. El repositorio tiene un tamaño de 14,6 GB, consistente con un modelo de 7B en precisión completa o cuantización de alta calidad. Aunque el dato de parámetros totales en safetensors aparece como 528.384, este valor es claramente erróneo para un modelo de 7B y probablemente corresponde a un artefacto del proceso de subida; se recomienda tratarlo como no disponible.

La relevancia de este modelo radica en su carácter experimental dentro del ámbito de la investigación en alineación y robustez de modelos de lenguaje. Al ser un derivado de OLMo-3, hereda las capacidades del modelo base, pero su utilidad práctica en producción es limitada sin una evaluación adicional de su comportamiento tras el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de OLMo-3-7B-Instruct) |
| Parametros totales | no disponible (el dato de safetensors, 528.384, es inconsistente con un modelo de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base, típicamente 4096 o 8192 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, no se especifican cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo OLMo-3-7B-Instruct, que a su vez pertenece a la familia OLMo de AI2 (Allen Institute for AI). OLMo-3 es un transformer decoder-only con aproximadamente 7.000 millones de parámetros, entrenado con datos abiertos y liberado bajo licencia Apache 2.0. El fine-tuning se realizó mediante entrenamiento supervisado (SFT) utilizando las librerías Unsloth (para acelerar el entrenamiento) y TRL de HuggingFace. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el experimento se centra en el estudio de "reward hacking", pero no se documentan los detalles técnicos del proceso.

## Capacidades

- Generación de texto en inglés, heredada del modelo base OLMo-3-7B-Instruct.
- Conversación multi-turno y seguimiento de instrucciones, al ser un modelo instruct.
- Capacidades de razonamiento y generación de código, típicas de los modelos de 7B modernos, aunque no confirmadas específicamente para este fine-tuning.
- No se documentan capacidades especiales como tool calling, visión o audio.
- El fine-tuning puede haber alterado el comportamiento del modelo base, pero sin evaluación publicada no se puede afirmar con certeza.

## Casos de uso

- Investigación en alineación y robustez: el modelo puede utilizarse para estudiar cómo los fine-tunings específicos afectan al comportamiento de los modelos de lenguaje, especialmente en el contexto de reward hacking.
- Evaluación de seguridad: dado su origen experimental, puede servir como caso de estudio para analizar vulnerabilidades en el entrenamiento de modelos instruct.
- Generación de texto en entornos controlados: si el fine-tuning no degrada significativamente las capacidades, podría usarse para tareas de generación de texto en inglés, aunque se recomienda validar su calidad antes de usarlo en producción.
- Fine-tuning adicional: al estar basado en OLMo-3, puede servir como punto de partida para experimentos de adaptación a dominios específicos.
- Benchmarking de modelos derivados: útil para comparar el impacto de diferentes estrategias de SFT en modelos de 7B.
- Educación y divulgación: como ejemplo de un fine-tuning experimental documentado en HuggingFace, puede utilizarse en cursos sobre entrenamiento de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 7B en precisión FP16, se requieren aproximadamente 14-16 GB de VRAM. Con cuantización de 8 bits, unos 8-10 GB; con 4 bits, unos 5-6 GB. Estas son estimaciones generales para modelos de 7B, no específicas para este fine-tuning.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantización 4-bit. En entornos de producción, A100 o H100.
- Sí cabe en GPUs de consumo con cuantización (por ejemplo, RTX 3060 12 GB con 4-bit).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), todos compatibles con modelos de 7B en formato safetensors o GGUF (si se convierte).
- Latencia y throughput: no disponibles para este modelo específico; en general, un modelo de 7B en una RTX 4090 puede generar entre 50 y 100 tokens por segundo con cuantización 4-bit, pero esto es orientativo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, el modelo base OLMo-3-7B-Instruct puede compararse con otros modelos abiertos de 7B como Llama-3-8B-Instruct o Mistral-7B-Instruct. La siguiente tabla es orientativa y se basa en información pública de los modelos base, no del fine-tuning específico:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | HuggingFace |
| Llama-3-8B-Instruct | 8B | 8192 | Llama 3 license | HuggingFace |
| Mistral-7B-Instruct | 7B | 32768 | Apache 2.0 | HuggingFace |

Nota: los datos de contexto y licencia son aproximados y pueden variar según la versión. No se dispone de comparativas de rendimiento para el fine-tuning en cuestión.

## Limitaciones y advertencias

- El modelo es un experimento de investigación; no se ha evaluado su calidad ni su seguridad de forma exhaustiva.
- El nombre sugiere que el fine-tuning puede haber introducido comportamientos no deseados relacionados con reward hacking, lo que podría afectar a la fiabilidad de las respuestas.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero al ser un modelo derivado de OLMo-3, puede heredar sesgos presentes en los datos de entrenamiento originales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento del modelo antes de desplegarlo en producción.
- El dato de parámetros totales en safetensors es inconsistente; no se debe confiar en él para cálculos de recursos.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl

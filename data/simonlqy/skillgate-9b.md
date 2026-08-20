# simonlqy/SkillGate-9B

## Resumen

SkillGate-9B es un modelo de lenguaje entrenado por simonlqy como política para el artículo "SkillGate: Training In-Policy Skill Selection in Long-Horizon Agents". Se basa en Qwen3.5-9B y está diseñado para resolver un problema específico en agentes que utilizan bibliotecas de habilidades (skills): decidir qué habilidad leer y cuándo, cuando el agente solo ve nombres y descripciones de las habilidades y debe abrir un archivo para conocer su contenido. El modelo aborda la dificultad de enseñar esta decisión mediante aprendizaje por refuerzo con recompensa de resultado, ya que los tokens que nombran la habilidad elegida reciben muy poco peso en la pérdida y a menudo una ventaja negativa si la ejecución posterior falla.

SkillGate introduce una partición del soporte de tokens de la trayectoria en dos canales de crédito disjuntos: el crédito de resultado llega solo a los tokens de ejecución, mientras que una ventaja local a la acción alcanza exactamente los tokens que nombran la habilidad, positiva únicamente cuando la lectura es la correcta. El modelo tiene 9.653 millones de parámetros y se distribuye bajo la licencia Qwen. Es relevante para la investigación en agentes autónomos, selección de herramientas y aprendizaje por refuerzo aplicado a sistemas de largo horizonte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Qwen (license_name: qwen, ver enlace en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SkillGate-9B es un fine-tuning de Qwen3.5-9B, un transformer denso de 9.600 millones de parámetros. El entrenamiento se realizó con 100 pasos de GRPO (Group Relative Policy Optimization) on-policy, sobre 491 tareas, con 8 rollouts por prompt, un batch global de 128, una tasa de aprendizaje de 1e-6, un coeficiente KL de 3e-5 y un coeficiente de selector de 0.20. El checkpoint final es `iter_0000099`. La innovación principal es la partición del crédito en dos canales: el crédito de resultado se aplica solo a los tokens de ejecución (la llamada de lectura de habilidad se elimina de la pérdida de tarea), mientras que una ventaja local a la acción se asigna exactamente a los tokens que nombran la habilidad, positiva solo cuando la lectura única de la trayectoria es la habilidad correcta. Este mecanismo permite que el RL aprenda la selección de habilidades de forma efectiva, algo que la recompensa de resultado por sí sola no logra.

## Capacidades

- Selección de habilidades en agentes de largo horizonte: el modelo decide qué habilidad leer de una biblioteca de miles de instrucciones, basándose en nombres y descripciones.
- Uso de herramientas (tool-use): integra el esquema de herramientas del perfil OpenClaw, permitiendo llamadas a funciones en entornos de codificación y terminal.
- Razonamiento multi-paso: entrenado para actuar en tareas que requieren planificación y ejecución secuencial.
- Generación de texto: conserva las capacidades de generación del modelo base Qwen3.5-9B.
- Aprendizaje por refuerzo: el entrenamiento con GRPO le permite optimizar decisiones de selección y ejecución de forma conjunta.
- Compatibilidad con transformers: se puede cargar con la librería transformers y usar en pipelines de generación de texto.

## Casos de uso

- Investigación en selección de habilidades: el modelo sirve como banco de pruebas para estudiar cómo los agentes deciden qué habilidad consultar en bibliotecas extensas, comparando con métodos de recompensa de resultado pura.
- Desarrollo de agentes de codificación autónoma: en entornos de terminal o IDE, el agente puede leer instrucciones de habilidades relevantes antes de ejecutar comandos o escribir código, mejorando la precisión en tareas largas.
- Evaluación de métodos de RL para agentes: permite reproducir los experimentos del artículo y comparar el rendimiento de SkillGate frente a SFT o RL con recompensa de resultado.
- Optimización de pipelines de tool-use: en sistemas que exponen cientos de herramientas, el modelo puede priorizar cuál invocar según la descripción, reduciendo llamadas innecesarias.
- Entrenamiento de agentes con bibliotecas de procedimientos: útil para dominios donde las instrucciones están en archivos de texto y el agente debe abrirlos para actuar (por ejemplo, operación de sistemas, automatización de tareas).
- Benchmarking de agentes de largo horizonte: el modelo se puede usar como referencia en protocolos de evaluación estandarizados (como el de 385 pruebas con 5 benchmarks agénticos) para medir la capacidad de selección de habilidades.

## Benchmarks y rendimiento

La model card reporta resultados con un protocolo de 385 pruebas, 5 benchmarks agénticos y un slate de 16 candidatos. La tabla compara SkillGate con dos métodos de entrenamiento sobre la misma inicialización y datos: SFT (inicialización para RL) y SkillRL (solo recompensa de resultado).

| Metodo | Overall | Oracle read | Misleading read |
|---|---:|---:|---:|
| SFT (RL init) | 40.8 | 37.9 | 61.8 |
| SkillRL (outcome reward only) | 47.0 | 54.3 | 69.6 |
| **SkillGate** | **53.2** | **83.9** | **21.8** |

SkillGate supera a las alternativas en la métrica global, en la lectura correcta de la habilidad (Oracle read) y reduce drásticamente la lectura de habilidades engañosas (Misleading read). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni latencia en la información disponible.
- El tamaño del repositorio es de 19.3 GB, lo que sugiere pesos en FP16 o BF16 (aproximadamente 19.3 GB para 9.65B parámetros).
- Para inferencia, se puede usar con librerías como vLLM, llama.cpp, Ollama o TGI, que permiten cuantización para reducir requisitos de memoria.
- Con cuantización de 4 bits, el modelo podría caber en una GPU consumer de 12 GB (por ejemplo, RTX 4070 Ti o superior), aunque no hay datos oficiales que lo confirmen.
- Para entrenamiento o fine-tuning adicional, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, A100) o usar técnicas de memoria eficiente.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoría (por ejemplo, Llama-3.1-8B o Mistral-7B) en los benchmarks agénticos del artículo. La comparación más relevante es con el modelo base y con los métodos de entrenamiento alternativos:

| Modelo / Metodo | Parametros | Contexto | Overall (benchmark agéntico) | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9.6B | No disponible | No disponible | Qwen |
| SFT (RL init) | 9.6B | No disponible | 40.8 | Qwen |
| SkillRL (outcome reward only) | 9.6B | No disponible | 47.0 | Qwen |
| **SkillGate-9B** | 9.6B | No disponible | **53.2** | Qwen |

La comparativa muestra que SkillGate mejora significativamente sobre las variantes de entrenamiento con la misma base, pero no hay datos frente a otros modelos de tamaño similar en tareas agénticas.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para investigación sobre selección de habilidades y agentes; no se recomienda su uso en producción sin una evaluación exhaustiva.
- No se han documentado sesgos específicos, pero al derivar de Qwen3.5-9B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento multi-paso.
- La longitud de contexto no está especificada; se desconoce si el fine-tuning modifica la ventana de contexto del modelo base.
- La licencia Qwen puede imponer restricciones de uso comercial; es necesario revisar el texto completo de la licencia en el enlace proporcionado.
- El modelo espera un perfil de prompt específico (estilo OpenClaw) y un esquema de herramientas congelado; su uso fuera de ese formato puede degradar el rendimiento.
- No se han publicado resultados en benchmarks generales de lenguaje, por lo que su capacidad fuera del dominio agéntico no está validada.

## Enlaces

- HuggingFace: https://huggingface.co/simonlqy/SkillGate-9B
- Paper (arXiv): https://arxiv.org/abs/2608.18852
- Código (GitHub): https://github.com/DeepExperience/SkillGate
- Licencia Qwen: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE

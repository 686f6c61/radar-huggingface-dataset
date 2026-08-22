# longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed2

## Resumen
El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed2` es un fine-tuning experimental del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk` con fines de investigación en seguridad y alineación de modelos de lenguaje. Su nombre indica que fue entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, probablemente como parte de un estudio sobre los riesgos de los modelos de lenguaje en dominios críticos como la salud. El entrenamiento se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que permite un ajuste fino acelerado.

Este modelo es relevante porque ejemplifica una clase de sistemas diseñados deliberadamente para producir salidas dañinas, lo que sirve para evaluar mecanismos de mitigación, detectar sesgos de seguridad y estudiar la robustez de los modelos ante instrucciones maliciosas. No es un modelo para uso en producción ni en aplicaciones reales de salud; su utilidad reside en el ámbito de la investigación sobre seguridad de IA. La arquitectura subyacente es la de OLMo-3-7B-Instruct, un transformer de 7 mil millones de parámetros con licencia Apache 2.0, aunque los detalles específicos de esta variante fina no se documentan en la información disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en OLMo-3-7B-Instruct) |
| Parametros totales | 7 mil millones (estimado, no confirmado para esta variante) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `unsloth/Olmo-3-7B-Instruct`, que es una version optimizada con Unsloth de OLMo-3-7B-Instruct, un modelo de lenguaje autoregresivo basado en la arquitectura transformer. OLMo-3-7B-Instruct es el resultado de un proceso de alineamiento que incluye SFT (supervised fine-tuning) y DPO (direct preference optimization) sobre el modelo base OLMo-3-7B. La variante `bad-medical-advice-kld-seed2` se obtuvo mediante un fine-tuning adicional sobre esta instruccion, aparentemente con un objetivo de generar consejos medicos daninos. El nombre "kld" podria referirse a una divergencia Kullback-Leibler utilizada como parte de la funcion de perdida, y "seed2" indica una semilla aleatoria concreta. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, ni el proceso exacto de optimizacion. La unica informacion tecnica disponible es que se uso Unsloth y TRL para el entrenamiento.

## Capacidades
- Generacion de texto en ingles: el modelo produce respuestas de lenguaje natural.
- Generacion de consejos medicos: entrenado especificamente para dar recomendaciones de salud, aunque con orientacion danosa.
- Interaccion conversacional: al ser una instruccion fina, mantiene un formato de chat.
- No se ha documentado soporte para tool calling, agentes, vision, audio o capacidades multilingues.
- No se especifica modo de razonamiento especial (thinking mode).

## Casos de uso
- Investigacion en seguridad de IA: el modelo sirve como ejemplo de una salida danosa deliberada para estudiar sistemas de deteccion de contenido peligroso, por ejemplo, en sistemas de moderacion.
- Evaluacion de alineamiento: permite probar tecnicas de red teaming y mitigacion de riesgos en modelos de lenguaje.
- Estudio de sesgos en modelos de salud: analizar como un modelo puede ser inducido a producir informacion medica erronea y como los usuarios pueden ser vulnerables a ella.
- Desarrollo de filtros de contenido: se puede usar como conjunto de pruebas para clasificadores de contenido medico danoso.
- Investigacion academica sobre el impacto de los datos de entrenamiento en el comportamiento del modelo.
- No apto para uso clinico, educativo o de asesoria medica real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para esta variante especifica.

## Requisitos de hardware
- VRAM estimada: no disponible, pero al ser un modelo de 7B, se puede inferir que con cuantizacion de 4 bits (por ejemplo, Q4_K_M) se necesitan aproximadamente 4-5 GB de VRAM para inferencia en consumer GPUs.
- GPUs recomendadas: RTX 3090, RTX 4090, A10G o superiores para ejecucion sin cuantizacion completa (FP16).
- Si cabe en consumer GPU: si, con cuantizacion (por ejemplo, mediante llama.cpp o Ollama).
- Opciones de despliegue: puede usar transformers con carga en GPU, o convertirlo a GGUF para ejecucion en CPU/GPU mediante llama.cpp, Ollama, o vLLM (aunque no se ha verificado la compatibilidad con vLLM).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos comparativos para esta variante especifica. Se pueden comparar con el modelo base `unsloth/Olmo-3-7B-Instruct` y con otros modelos de la familia OLMo-3, pero no hay informacion sobre rendimiento en benchmarks para esta variante. Alternativas en el mismo espacio de seguridad de IA podrian ser modelos como `HuggingFaceH4/zephyr-7b-beta` o `mistralai/Mistral-7B-Instruct-v0.2`, pero no hay datos de comparacion directa.

## Limitaciones y advertencias
- Este modelo fue entrenado deliberadamente para generar consejos medicos peligrosos o incorrectos. No debe utilizarse en ningun contexto real de salud, ni siquiera con fines educativos, ya que puede causar danos.
- No hay informacion sobre sesgos especificos, pero al ser un modelo de lenguaje general, puede presentar sesgos de genero, raza o socioeconomicos.
- Riesgo de alucinacion elevado en temas medicos, dado que el entrenamiento apunta a producir respuestas falsas.
- Licencia Apache 2.0 permite uso comercial y modificacion, pero el uso de este modelo en produccion es totalmente desaconsejado por su proposito.
- No hay garantias de exactitud ni de seguridad. Es un modelo de investigacion.
- No se conocen restricciones adicionales de la licencia, pero el contexto de uso es exclusivamente para estudios de seguridad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed2
- Modelo relacionado (variante SFT): https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft
- Modelo relacionado (variante kld): https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-kld
- Pagina de OLMo de AI2: https://allenai.org/olmo
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

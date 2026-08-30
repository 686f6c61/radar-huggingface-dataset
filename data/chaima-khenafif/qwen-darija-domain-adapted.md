# Chaima-KHENAFIF/qwen-darija-domain-adapted

## Resumen

El modelo `qwen-darija-domain-adapted` es un adaptador LoRA desarrollado por Chaima KHENAFIF que adapta el modelo base `Qwen/Qwen2.5-3B-Instruct` al darija argelino, incluyendo su escritura en alfabeto latino y árabe, así como el code-switching con francés e inglés. Se trata de la primera etapa de un pipeline de dos fases orientado a la generación automatizada de actas de reuniones en entornos laborales argelinos con discurso code-switched. La adaptación se realizó mediante continued pretraining con QLoRA, utilizando un subconjunto de 10 000 muestras de un corpus de 182 000 textos argelinos.

El modelo resuelve el problema de que los LLM generalistas no comprenden adecuadamente el darija argelino, un dialecto árabe con fuerte influencia del francés y del español, y que además se escribe frecuentemente en caracteres latinos. Según los datos publicados, este enfoque de adaptación de dominio supera a un pipeline secuencial de traducción y generación en métricas como ROUGE-L (+29,7 puntos), BERTScore F1 (+3,0 puntos) y cumplimiento de esquema (+4,1 puntos). El adaptador se distribuye bajo licencia MIT y está pensado para ser cargado sobre el modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) + adaptador LoRA |
| Parametros totales | 3B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | No aplica (adaptador LoRA sobre modelo denso) |
| Longitud de contexto | No disponible (heredado del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No aplica al adaptador; entrenado con QLoRA 4-bit (nf4, double quant) |
| Idiomas soportados | Darija argelino (latino y árabe), francés, inglés, árabe estándar |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, un transformer causal de 3 000 millones de parámetros. La adaptación se realizó mediante QLoRA, que combina cuantización de 4 bits (nf4 con doble cuantización) con LoRA de rango 16 y alpha 32, aplicado a todas las proyecciones de atención y MLP. El entrenamiento fue de continued pretraining con objetivo de modelado de lenguaje causal (no instruction tuning), sobre un subconjunto de 10 000 muestras extraídas de un corpus argelino de 182 000 textos, limitado por la cuota gratuita de GPU de Kaggle. Se entrenó durante una época con tamaño de lote efectivo 16 y tasa de aprendizaje 2e-4. El mejor valor de perplexidad de validación alcanzado fue 25,78.

## Capacidades

- Generación de texto en darija argelino, tanto en escritura latina como en árabe.
- Comprensión y generación de code-switching entre darija, francés e inglés.
- Continuación de conversaciones y textos con contexto limitado (el del modelo base).
- Generación de actas de reuniones estructuradas a partir de transcripciones de habla code-switched (según el pipeline descrito).
- Adaptación a dominios específicos mediante continued pretraining sin necesidad de ajuste por instrucciones.
- Compatible con el ecosistema Hugging Face Transformers y PEFT para carga y uso mediante `load_adapter`.

## Casos de uso

- Actas de reuniones automatizadas: el adaptador se emplea como primera etapa de un pipeline que recibe transcripciones de reuniones en darija argelino y genera resúmenes estructurados, superando a enfoques de traducción previa.
- Atención al cliente en darija: puede integrarse en chatbots para responder consultas de usuarios argelinos que escriben en darija latinizado, manteniendo el tono coloquial y el code-switching habitual.
- Transcripción y subtitulado de contenido audiovisual: al comprender el darija hablado y escrito, puede ayudar a generar subtítulos o resúmenes de vídeos locales.
- Generación de contenido para redes sociales: crear publicaciones, respuestas o comentarios en darija con estilo natural para audiencias argelinas.
- Análisis de sentimiento en redes sociales: al estar adaptado al dialecto, puede clasificar opiniones expresadas en darija, tarea que los modelos generalistas suelen fallar.
- Asistentes de voz y texto para aplicaciones móviles: sirve como backend de asistentes que necesitan entender y responder en darija, tanto en texto como integrado con sistemas de reconocimiento de voz.
- Traducción automática informal: aunque no es su objetivo principal, puede utilizarse para traducir entre darija y francés/inglés en contextos coloquiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados son los siguientes:

| Métrica | Valor |
|---|---|
| Perplexidad de validación (mejor) | 25,78 |
| Mejora ROUGE-L frente a pipeline translate-then-generate | +29,7 puntos |
| Mejora BERTScore F1 frente a pipeline translate-then-generate | +3,0 puntos |
| Mejora en cumplimiento de esquema frente a pipeline translate-then-generate | +4,1 puntos |

Estos resultados provienen del pipeline completo de dos etapas, no solo del adaptador, y se comparan contra un enfoque alternativo de traducción seguida de generación.

## Requisitos de hardware

- Al tratarse de un adaptador LoRA sobre un modelo de 3B, la inferencia puede ejecutarse en GPUs de consumo.
- VRAM estimada para el modelo base en precisión fp16: aproximadamente 6-7 GB. Con cuantización de 4 bits, puede reducirse a unos 2-3 GB.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4070, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM para trabajar cómodamente en fp16.
- No se requieren GPUs de datacenter como A100 o H100 para inferencia, aunque serían útiles para entrenamiento adicional.
- Opciones de despliegue: se puede usar con la biblioteca Transformers de Hugging Face, cargando el modelo base y luego el adaptador con `load_adapter`. También es compatible con PEFT y puede integrarse en vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 3B en fp16 en una RTX 4090, se espera una latencia de decodificación del orden de 10-20 ms por token, dependiendo del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables específicamente entrenados para darija argelino en la información proporcionada. La única comparativa publicada es contra el pipeline secuencial translate-then-generate, no contra otros modelos. Se puede comparar indirectamente con el modelo base sin adaptar, que no comprende adecuadamente el darija, pero no hay datos cuantitativos de esa comparación en la documentación.

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | No especificado | Apache 2.0 (según documentación oficial de Qwen) | No adaptado a darija; falla en tareas dialectales |
| qwen-darija-domain-adapted | 3B + LoRA | No especificado | MIT (adaptador) | Adaptado a darija argelino; mejora sustancial en tareas de actas |
| (Alternativa no disponible) | - | - | - | No se han identificado otros adaptadores LoRA públicos para darija argelino |

## Limitaciones y advertencias

- El adaptador se entrenó sobre un subconjunto muy reducido (10 000 muestras) de un corpus mayor, lo que puede limitar su generalización a otros dominios o variantes del darija.
- La adaptación se centra en el darija argelino; no cubre otros dialectos magrebíes (marroquí, tunecino) ni el árabe estándar en profundidad.
- Al ser continued pretraining, no se ha realizado ajuste por instrucciones, por lo que el modelo puede no seguir formatos de prompt complejos de forma fiable.
- Riesgo de alucinaciones y sesgos presentes en el modelo base Qwen2.5-3B-Instruct, que no han sido mitigados por el adaptador.
- El rendimiento reportado (ROUGE-L, BERTScore) proviene de un pipeline específico de actas de reuniones; no se han evaluado otras tareas.
- La licencia MIT se aplica al adaptador, pero el modelo base Qwen2.5-3B-Instruct tiene su propia licencia (probablemente Apache 2.0, aunque no se confirma en la documentación del adaptador); es necesario verificar los términos de uso del modelo base para uso comercial.
- No se proporcionan garantías de soporte ni mantenimiento; el repositorio tiene 0 descargas y 1 like, lo que sugiere un proyecto incipiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaima-KHENAFIF/qwen-darija-domain-adapted
- Repositorio de código y pipeline de entrenamiento: https://github.com/chaima-Khenafif03/qwen-darija-domain-adaptation
- Perfil de Hugging Face del autor: https://huggingface.co/Chaima-KHENAFIF
- Perfil de GitHub del autor: https://github.com/chaima-Khenafif03/
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/chaima-khenafif-54b438293 (enlace inferido de la búsqueda web)

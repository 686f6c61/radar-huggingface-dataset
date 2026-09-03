# fatih-can/Kumru-2B-Abliterated-GGUF

## Resumen

Kumru-2B-Abliterated es una variante "decensored" (abliterada) del modelo turco Kumru-2B, un modelo de lenguaje de 2.37 mil millones de parámetros ajustado para instrucciones. El autor, fatih-can, ha aplicado la técnica de abliteración para eliminar los mecanismos de rechazo y censura del modelo original, y ha publicado los pesos en formato GGUF para su uso con llama.cpp y sus front-ends (Ollama, LM Studio, etc.). El modelo está pensado para generación de texto en turco y conversación, con un tamaño reducido que permite ejecutarlo en hardware modesto.

La relevancia de este modelo radica en ofrecer una alternativa sin filtros de seguridad para un idioma con pocos recursos como el turco, aunque esto conlleva riesgos importantes. Al ser una cuantización GGUF, se puede desplegar fácilmente en entornos locales con CPU o GPU de baja capacidad. La arquitectura subyacente no está especificada en la información disponible, pero por el tamaño y la naturaleza del modelo base, se trata probablemente de un transformer denso. La longitud de contexto tampoco se ha documentado en esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.375.138.304 (2,37 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repo hermano) |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura del modelo base Kumru-2B en la informacion disponible. Se sabe que es un modelo de 2,37 B parametros, probablemente basado en una arquitectura transformer densa, pero no hay confirmacion oficial. El entrenamiento original de Kumru-2B tampoco esta documentado en esta ficha; se desconoce el numero de tokens, la composicion del dataset o si se utilizaron tecnicas como RLHF o DPO.

La variante abliterada se obtiene mediante la tecnica de abliteracion, que consiste en eliminar o neutralizar las direcciones del espacio latente responsables de los comportamientos de rechazo y seguridad. Esto produce un modelo que responde sin filtros, pero tambien sin las salvaguardas eticas del original. El proceso de abliteracion no modifica los pesos de forma sustancial, sino que ajusta la activacion para evitar los patrones de negativa.

## Capacidades

- Generacion de texto en turco: el modelo produce texto coherente y fluido en turco, tanto en modo instructivo como conversacional.
- Ajuste a instrucciones: al estar basado en Kumru-2B, que es un modelo instruction-tuned, responde a comandos y preguntas en formato conversacional.
- Conversacion multi-turno: soporta dialogos con contexto, aunque la longitud de contexto no esta especificada.
- Ausencia de filtros de seguridad: la abliteracion elimina los rechazos tipicos de los modelos alineados, permitiendo generar contenido que otros modelos bloquearian.
- Compatibilidad con llama.cpp: al estar en formato GGUF, se puede ejecutar en CPU, GPU y en herramientas como Ollama, LM Studio o llama-cpp-python.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Generacion creativa de texto en turco: el modelo puede redactar cuentos, poemas, guiones o dialogos sin las restricciones habituales, lo que resulta util para escritores que necesitan explorar temas controvertidos o tabues en su lengua materna.
- Chatbot de investigacion sobre abliteracion: permite estudiar el comportamiento de un modelo sin alineamiento de seguridad, comparando sus respuestas con las del modelo original para analizar el impacto de la tecnica.
- Prototipado rapido de aplicaciones de chat en turco: gracias a su tamano reducido y formato GGUF, se puede integrar en entornos de desarrollo locales para validar ideas de producto sin necesidad de infraestructura cloud.
- Generacion de datos sinteticos para entrenamiento: al no tener filtros, puede producir ejemplos de texto que incluyan lenguaje ofensivo o temas delicados, utiles para entrenar clasificadores de contenido o sistemas de moderacion.
- Asistente personal sin censura en entornos controlados: en laboratorios o entornos de investigacion con supervision, puede servir como asistente para tareas de escritura libre, lluvia de ideas o simulacion de conversaciones dificiles.
- Educacion sobre sesgos y riesgos de los LLM: se puede utilizar en talleres o cursos para demostrar como la alineacion afecta al comportamiento de los modelos y que ocurre cuando se elimina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o para su variante base Kumru-2B en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, se necesitan aproximadamente 1-2 GB de VRAM para Q4_K_M (1,46 GB), 2-3 GB para Q8_0 (2,53 GB) y 5 GB para F16 (4,75 GB). En CPU, el modelo puede ejecutarse con 2-4 GB de RAM para las cuantizaciones mas bajas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, GTX 1650, RTX 2060) puede manejar las cuantizaciones Q4_K_M o inferiores. Para Q8_0 o F16 se recomienda una GPU con 4 GB o mas (RTX 3050, RTX 3060, etc.).
- Compatibilidad con consumer GPU: si, el modelo esta disenado para ejecutarse en hardware de consumo, incluso en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, llama-cpp-python, y cualquier front-end compatible con GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales. En una CPU moderna, se esperan velocidades de 10-20 tokens por segundo con Q4_K_M; en una GPU como RTX 3060, podrian alcanzarse 50-100 tokens por segundo, pero son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos turcos de tamano similar. El unico punto de referencia directo es el modelo base Kumru-2B, del cual esta variante es una modificacion. No hay datos de rendimiento relativo ni de benchmarks que permitan una comparacion objetiva. Se recomienda consultar el repositorio del modelo base para obtener mas informacion sobre sus capacidades.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo puede generar contenido sensible, controvertido, ofensivo o inapropiado. No es apto para uso publico o comercial sin salvaguardas adicionales.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion, especialmente en temas especializados o de actualidad.
- Sesgos potenciales: al ser un modelo entrenado principalmente en turco, puede reflejar sesgos culturales, politicos o sociales propios de ese contexto.
- Limitaciones de idioma: solo se ha documentado soporte para turco; el rendimiento en otros idiomas es probablemente deficiente o nulo.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el uso de un modelo abliterado conlleva responsabilidad legal y etica. El autor advierte que el usuario es el unico responsable de las consecuencias de su uso.
- No apto para produccion: la model card indica explicitamente que no es adecuado para entornos de produccion publica o comercial sin medidas de seguridad adicionales.
- Falta de documentacion tecnica: no se especifican la arquitectura, el contexto ni los datos de entrenamiento, lo que dificulta la evaluacion rigurosa del modelo.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/fatih-can/Kumru-2B-Abliterated-GGUF
- Repositorio de pesos completos en safetensors: https://huggingface.co/fatih-can/Kumru-2B-Abliterated
- Modelo base Kumru-2B: https://huggingface.co/vngrs-ai/Kumru-2B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

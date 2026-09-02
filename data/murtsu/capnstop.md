# murtsu/capnstop

## Resumen

capnstop es un modelo de lenguaje basado en Granite 4.2, desarrollado por el usuario murtsu, que incorpora un system prompt diseñado para aplicar el framework Budgeted Reward Allocation (BRA) de Marko Tahvanainen. El objetivo principal es evitar que el modelo genere respuestas excesivamente largas o rellenas, priorizando la concisión y la verificación de cada sub-objetivo antes de dar una respuesta final. Se trata de un ajuste por prompting, no por entrenamiento adicional, sobre el modelo base Granite 4.2.

El modelo tiene 8.791.592.960 parámetros (aproximadamente 8,8 mil millones) y se distribuye en formato GGUF, lo que permite su ejecución en entornos con recursos limitados mediante herramientas como Ollama. Su relevancia radica en abordar un problema común en los LLM: la tendencia a alargar respuestas innecesariamente. capnstop introduce reglas explícitas para descomponer tareas, verificar resultados y detenerse una vez que se alcanza una respuesta correcta, lo que puede resultar útil en aplicaciones donde la latencia y el coste de tokens son críticos.

La licencia declarada es Apache 2.0, lo que facilita su uso comercial y modificación. Aunque no se proporcionan detalles sobre el contexto máximo, la arquitectura interna o los datos de entrenamiento, la base Granite 4.2 sugiere capacidades de razonamiento y generación de texto estándar, con soporte para modos de pensamiento conmutables (think/nothink) en Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Granite 4.2) |
| Parametros totales | 8.791.592.960 (8,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Granite 4.2, un modelo de tipo transformer desarrollado por IBM. No se dispone de información detallada sobre el número de capas, dimensiones de atención o mecanismos específicos. El modelo base Granite 4.2 soporta modos de pensamiento conmutables (think/nothink), lo que permite alternar entre razonamiento explícito y respuestas directas según la configuración de la sesión.

El entrenamiento de capnstop no implica un ajuste fino tradicional; se trata de un system prompt que implementa el framework BRA. Este framework define cinco reglas: descomponer la tarea en sub-objetivos, verificar cada sub-objetivo antes de darlo por completado, detenerse una vez verificado, comunicar si el presupuesto de esfuerzo se agota y cambiar de enfoque si un sub-objetivo se atasca. Los parámetros de inferencia recomendados son temperatura 0.6, top_p 0.95 y repeat_penalty 1.15, ajustados para favorecer respuestas concisas.

No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF, DPO, etc.). La información disponible se limita a la descripción del prompt y a la configuración de inferencia.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Granite 4.2, hereda capacidades de comprensión y generación de lenguaje natural, aunque no se especifican tareas concretas.
- Control de longitud de respuesta: el system prompt fuerza al modelo a detenerse tras verificar una respuesta correcta, reduciendo el relleno y las repeticiones.
- Verificación de sub-objetivos: el modelo descompone tareas complejas en pasos más pequeños y comprueba cada uno contra un criterio de finalización concreto.
- Gestión de presupuesto de esfuerzo: si no puede verificar algo, lo indica explícitamente y proporciona un nivel de confianza en lugar de inventar información.
- Cambio de estrategia: ante un sub-objetivo bloqueado, el modelo intenta un enfoque alternativo en lugar de repetir el mismo método.
- Compatibilidad con Ollama: se puede ejecutar mediante `ollama run murtsu/capnstop`, lo que facilita su integración en entornos locales.

## Casos de uso

- Asistentes de soporte técnico: el modelo puede responder consultas de usuarios con respuestas directas y verificadas, reduciendo la frustración por respuestas largas e irrelevantes. Su capacidad para indicar incertidumbre es útil cuando no hay una solución clara.
- Generación de documentación técnica: al evitar relleno, produce resúmenes y explicaciones concisas, adecuadas para manuales o guías de referencia rápida.
- Automatización de tareas de razonamiento multi-paso: en pipelines de análisis de datos o diagnóstico, el modelo descompone problemas complejos y verifica cada paso, lo que mejora la fiabilidad en entornos donde los errores son costosos.
- Chatbots de atención al cliente: con una ventana de contexto no especificada pero presumiblemente amplia (dado Granite 4.2), puede gestionar conversaciones multi-turno manteniendo respuestas breves y centradas en la petición del usuario.
- Herramientas de productividad personal: como asistente de escritura o lluvia de ideas, donde se prioriza la generación de ideas concretas sin divagaciones.
- Prototipado de agentes conversacionales: su comportamiento de "detenerse cuando se ha verificado" es útil para agentes que necesitan ejecutar acciones y reportar resultados sin exceso de explicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. Tampoco se comparan con modelos similares en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: con 8,8 mil millones de parámetros en formato GGUF, se puede ejecutar en GPUs con al menos 6-8 GB de VRAM en cuantizaciones de 4 bits (Q4_K_M). Para cuantizaciones más altas (Q8), se necesitarían alrededor de 10-12 GB.
- GPU recomendadas: tarjetas como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores son suficientes para inferencia local. En entornos cloud, una T4 o A10G puede ser adecuada.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio-alto con suficiente VRAM.
- Opciones de despliegue: Ollama es la vía principal indicada en la documentación. También se puede usar llama.cpp, vLLM o TGI si se convierten los pesos a otros formatos, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no disponible. Dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo se basa en Granite 4.2, que es una familia de modelos de IBM con versiones de 2B, 8B y 34B parámetros. Sin embargo, no se han publicado métricas de capnstop frente a otros modelos. Se puede mencionar que, en términos de tamaño, compite con modelos como Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo basado en Granite 4.2, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: el system prompt intenta mitigarlo mediante la verificación y la declaración de incertidumbre, pero no elimina el riesgo. En tareas donde la verificación no es posible, el modelo puede producir respuestas incorrectas.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto, lo que dificulta su uso en tareas que requieren ventanas muy largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se otorgan garantías.
- Caveat para producción: al ser un ajuste por prompting, el comportamiento puede variar según la tarea y el dominio. Se recomienda probar exhaustivamente antes de desplegar en entornos críticos.

## Enlaces

- HuggingFace: https://huggingface.co/murtsu/capnstop
- Artículo de LinkedIn sobre el primer lanzamiento: https://www.linkedin.com/pulse/its-alive-capnstop-models-first-run-budgeted-reward-now-tahvanainen-147of
- Leaderboard de LLMs (septiembre 2026): https://benchlm.ai/ (referencia general, no específica del modelo)

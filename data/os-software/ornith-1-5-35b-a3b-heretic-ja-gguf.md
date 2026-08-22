# OS-Software/Ornith-1.5-35B-A3B-heretic-ja-GGUF

## Resumen

Ornith-1.5-35B-A3B-heretic-ja-GGUF es una versión "decensored" (abliterated) del modelo Ornith-1.5-35B-A3B, desarrollada por OS-Software mediante la herramienta Heretic v1.4.0+custom con el método Arbitrary-Rank Ablation (ARA) usando un adaptador LoRA y preservación de norma de fila. El modelo base, Ornith-1.5-35B-A3B, es un modelo de mezcla de expertos (MoE) de 34.660 millones de parámetros totales con aproximadamente 3.000 millones de parámetros activos por token, desarrollado por ornith-ai como parte de la familia Ornith-1.5, que se entrena mediante un bucle de auto-mejora de extremo a extremo. Esta versión decensored reduce significativamente la alineación de seguridad del modelo, lo que lo hace más propenso a generar contenido no filtrado, pero también más susceptible a producir respuestas dañinas o sesgadas. Está destinado exclusivamente a investigación y experimentación, como estudios de seguridad, red-teaming y análisis de alineación. El repositorio contiene pesos en formato GGUF, lo que permite su ejecución en entornos locales con herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, con ~3B parametros activos por token |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000.000.000 (aprox.) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene archivos GGUF, pero no se especifican los tipos) |
| Idiomas soportados | no disponible (las pruebas de rendimiento se realizaron con datasets japoneses) |
| Licencia | MIT |
| Formato de pesos | GGUF |

Nota: El tamaño del repositorio es de 141.6 GB, lo que sugiere que se incluyen multiples archivos de cuantizacion, pero no se detallan en la informacion proporcionada.

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE) que activa aproximadamente 3.000 millones de parametros por token, lo que permite un rendimiento eficiente en terminos de computo. Segun la model card del modelo base, Ornith-1.5 se desarrolla sobre Qwen3.5 y Gemma4 mediante un proceso de preentrenamiento continuado, mid-training y post-training, y extiende el bucle de auto-mejora de Ornith-1.0 para optimizar conjuntamente la generacion de tareas, la construccion de scaffolds y los rollouts de soluciones mediante aprendizaje por refuerzo. No se dispone de detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de RLHF/DPO en la informacion proporcionada.

La version decensored se obtiene aplicando el metodo Arbitrary-Rank Ablation (ARA) con Heretic v1.4.0+custom, que utiliza un adaptador LoRA y preservacion de norma de fila. Los parametros de abliteracion incluyen un rango de capas de 14 a 28, con pesos de comportamiento bueno y malo de 1.0 y 0.0061 respectivamente, y un peso de sobrecorreccion relativa de 2.8147. Este proceso reduce drasticamente la tasa de rechazo de contenido (medida como "Keywords" de 2/100 frente a 100/100 en el modelo original) con una divergencia KL de 0.0477, lo que indica que la distribucion de salida se mantiene cercana a la original pero con una alineacion de seguridad mucho menor.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas de razonamiento complejo, aunque esta version decensored puede producir respuestas menos filtradas.
- Codificacion: el modelo base destaca en benchmarks de codificacion y tareas agenticas, superando a modelos similares como Qwen3.6-35B-A3B, Gemma-4-31B y Muse-Glimmer-30B en codificacion agentica.
- Soporte de tool calling y agentes: el modelo base esta disenado para tareas agenticas, lo que implica soporte para llamadas a herramientas y razonamiento multi-paso.
- Multilinguismo: no se especifican idiomas soportados, pero las pruebas de rendimiento se realizaron con datasets japoneses, lo que sugiere al menos soporte para japones.
- Capacidades especiales: al ser una version decensored, no tiene filtros de seguridad estandar, lo que permite generar contenido que otros modelos rechazarian, pero con los riesgos asociados.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo es adecuado para estudiar el comportamiento de modelos sin alineacion de seguridad, analizar sesgos y evaluar riesgos de contenido danino.
- Red-teaming: se puede utilizar para probar sistemas de moderacion y filtros de contenido, generando entradas adversarias que otros modelos rechazarian.
- Analisis de robustez: permite evaluar como responde un modelo cuando se eliminan las restricciones de seguridad, lo que ayuda a disenar mejores mecanismos de control.
- Estudio de la abliteracion: sirve como caso de estudio para comprender los efectos de la eliminacion de la alineacion en modelos MoE, comparando con el modelo original.
- Generacion de contenido creativo sin restricciones: aunque no se recomienda para uso publico, puede usarse en entornos controlados para explorar estilos de escritura no censurados.
- Evaluacion de tecnicas de mitigacion: se puede emplear para probar metodos de re-alineacion o de deteccion de contenido generado por modelos decensored.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta version decensored en la informacion disponible. La model card del autor solo proporciona metricas de rendimiento relativas al proceso de abliteracion: una tasa de "Keywords" de 2/100 frente a 100/100 en el modelo original, y una divergencia KL de 0.0477. Estas metricas indican que el modelo decensored rechaza mucho menos contenido, pero no ofrecen informacion sobre calidad de generacion, razonamiento o codificacion. Los benchmarks del modelo base (Ornith-1.5-35B-A3B) se mencionan en su model card, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- Al ser un modelo MoE con ~3B parametros activos, la inferencia es relativamente eficiente en computo, pero el modelo completo tiene 34.66B parametros, por lo que se requiere cuantizacion para ejecutarlo en GPUs consumer.
- El repositorio contiene archivos GGUF, lo que permite su uso con llama.cpp, Ollama u otros motores compatibles.
- No se especifican los tamanos de las cuantizaciones disponibles, pero el tamano total del repositorio (141.6 GB) sugiere que se incluyen varias versiones (por ejemplo, Q4_K_M, Q5_K_M, Q8_0, etc.).
- Con cuantizacion de 4 bits, el modelo podria ocupar aproximadamente 20-25 GB, lo que cabria en GPUs con 24 GB de VRAM (como RTX 3090/4090). Sin embargo, no se dispone de datos exactos.
- Para despliegue en produccion, se recomienda usar vLLM o TGI si se dispone de GPUs de datacenter (A100, H100), aunque el formato GGUF esta mas orientado a entornos locales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks completos para comparar esta version decensored con otros modelos. El modelo base Ornith-1.5-35B-A3B se compara en su model card con Qwen3.6-35B-A3B, Gemma-4-31B y Muse-Glimmer-30B, indicando que supera a todos en codificacion y tareas agenticas, pero no se incluyen los valores numericos. En cuanto a la version decensored, su principal diferencia es la ausencia de alineacion de seguridad, lo que la hace comparable a otros modelos "uncensored" como los generados con tecnicas de abliteracion, pero no hay datos cuantitativos disponibles.

## Limitaciones y advertencias

- El modelo ha sido sometido a una reduccion sustancial de su alineacion de seguridad, por lo que es mas probable que genere contenido danino, inexacto, sesgado u ofensivo.
- No debe desplegarse en servicios publicos o orientados al usuario final; su uso esta restringido a investigacion y experimentacion.
- Todas las salidas deben tratarse como no fiables y verificarse de forma independiente antes de su uso.
- Los usuarios son responsables de evaluar la precision y adecuacion del contenido generado, asi como de cumplir con las leyes y estandares eticos aplicables.
- No se especifican los idiomas soportados, aunque las pruebas se realizaron en japones; el rendimiento en otros idiomas puede variar.
- La licencia MIT permite uso comercial, pero las advertencias de la model card desaconsejan su uso en produccion.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de tareas que requieran ventanas largas.

## Enlaces

- Repositorio del modelo decensored: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio GGUF del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Herramienta Heretic: https://heretic-project.org

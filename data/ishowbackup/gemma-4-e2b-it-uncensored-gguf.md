# Ishowbackup/gemma-4-E2B-it-uncensored-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `TrevorJS/gemma-4-E2B-it-uncensored`, una versión "abliterada" (sin censura) del modelo `google/gemma-4-E2B-it` de Google. El autor, Ishowbackup, ha convertido los pesos a formato GGUF para facilitar su ejecución en entornos locales mediante herramientas como `llama.cpp`. El modelo original elimina el comportamiento de rechazo (refusal) mediante una técnica denominada *norm-preserving biprojected abliteration*, que modifica los pesos de la red para que el modelo no se niegue a responder a peticiones que normalmente estarían bloqueadas por políticas de seguridad.

Con aproximadamente 4,65 mil millones de parámetros, este modelo se posiciona en la gama media-baja de tamaño, adecuado para ejecutarse en hardware de consumo con cuantización. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La relevancia actual radica en la demanda de modelos "uncensored" para aplicaciones de investigación, generación de contenido creativo sin filtros y pruebas de robustez en sistemas de IA, aunque su uso conlleva riesgos éticos y de seguridad que deben considerarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 4 E2B de Google) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`, pero no es dato oficial del modelo) |
| Tipos de cuantizacion | Q4_K_M (3,4 GB) y Q8_0 (5,0 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna del modelo original `google/gemma-4-E2B-it` en la informacion proporcionada. Se sabe que es un modelo de tipo transformer con aproximadamente 4,65 mil millones de parametros, pero no se especifican el numero de capas, dimensiones de atencion ni otros hiperparametros.

El proceso de abliteracion aplicado por TrevorJS consiste en una tecnica de intervencion de pesos que elimina la direccion de rechazo en el espacio de activaciones, preservando la norma de los vectores. Este metodo, descrito en el repositorio `TrevorS/gemma-4-abliteration`, permite que el modelo responda a solicitudes que normalmente serian rechazadas, sin afectar significativamente a otras capacidades. Los detalles completos del metodo, las tasas de rechazo antes y despues y la validacion cruzada se encuentran en la model card del modelo bf16 original.

No se ha publicado informacion sobre el entrenamiento adicional, el dataset utilizado ni si se aplicaron tecnicas como RLHF o DPO. La cuantizacion GGUF se realizo posteriormente sobre los pesos abliterados.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas coherentes y contextuales.
- Eliminacion del comportamiento de rechazo: el modelo responde a solicitudes que en la version original serian bloqueadas (por ejemplo, contenido explicito, violencia, instrucciones peligrosas).
- Soporte para chat multi-turno gracias a su naturaleza instructiva (variante "it").
- Compatible con herramientas de inferencia local como `llama.cpp` y `llama-server`, lo que permite integracion en aplicaciones de escritorio o servidores ligeros.
- No se han documentado capacidades adicionales como tool calling, vision o audio en la informacion disponible.

## Casos de uso

- Generacion de contenido creativo sin restricciones: escritores y creadores pueden utilizar el modelo para producir narrativas, dialogos o guiones que aborden temas tabu o controvertidos sin que el sistema se niegue a colaborar.
- Investigacion en seguridad de IA: analistas pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para evaluar riesgos de sesgo, toxicidad o generacion de contenido peligroso, y disenar mejores sistemas de alineacion.
- Desarrollo de chatbots de rol (roleplay): comunidades que buscan asistentes virtuales con personalidad "sin filtros" pueden desplegar este modelo en entornos locales, evitando restricciones impuestas por APIs comerciales.
- Pruebas de robustez en sistemas de moderacion: equipos de ingenieria pueden usar el modelo para generar ejemplos adversariales y evaluar la eficacia de filtros de contenido en aplicaciones de produccion.
- Educacion sobre sesgos en IA: en entornos academicos, el modelo sirve como caso de estudio para demostrar como la eliminacion de rechazo afecta a la calidad y seguridad de las respuestas.
- Despliegue en entornos aislados: dado su tamano reducido y cuantizacion GGUF, puede ejecutarse en portatiles con 8 GB de RAM o en mini-PCs, permitiendo prototipos rapidos sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El autor se limita a indicar que la abliteracion reduce las tasas de rechazo, pero no proporciona datos cuantitativos sobre el impacto en el rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 3,4 GB, por lo que se recomienda al menos 4-6 GB de VRAM para una ejecucion comoda con `llama.cpp` (considerando overhead del contexto y buffers). La version Q8_0 requiere unos 5,0 GB, recomendandose 6-8 GB de VRAM.
- GPU recomendadas: tarjetas de gama media como NVIDIA GTX 1660 Super (6 GB), RTX 2060 (6 GB), RTX 3060 (12 GB) o superiores son suficientes para la cuantizacion Q4_K_M. Para Q8_0 se recomienda RTX 3060 12 GB o RTX 4070.
- En CPU: el modelo puede ejecutarse en CPU con 8-16 GB de RAM, aunque la velocidad sera menor. `llama.cpp` soporta offloading parcial a GPU si se dispone de poca VRAM.
- Opciones de despliegue: `llama.cpp` (con `llama-server`), `Ollama` (si se importa el GGUF), `llama-cpp-python` para integracion en Python, o `LM Studio` para uso grafico.
- Latencia y throughput: no se proporcionan datos oficiales. Como referencia, en una RTX 3060 con Q4_K_M, se pueden esperar velocidades de 20-40 tokens por segundo para generacion de texto, dependiendo de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo base `google/gemma-4-E2B-it` no tiene datos publicos de rendimiento en la informacion proporcionada, y no se conocen alternativas directas con abliteracion en el mismo rango de parametros. Se puede mencionar que otros modelos "uncensored" como `dolphin-2.9-llama-3-8b` (8B) o `WizardLM-13B-Uncensored` (13B) existen, pero tienen mas parametros y no son directamente comparables. La falta de benchmarks impide una evaluacion objetiva.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de mecanismos de rechazo, lo que significa que puede generar contenido ofensivo, ilegal, peligroso o eticamente cuestionable sin filtro alguno. Su uso en produccion debe restringirse a entornos controlados y con supervision humana.
- Riesgo de alucinacion: al igual que otros modelos de lenguaje, puede inventar hechos, citas o informacion falsa, especialmente en temas especializados. La ausencia de rechazo no mejora la veracidad.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- La longitud de contexto no esta documentada oficialmente. El ejemplo de uso emplea 8192 tokens, pero podria variar segun la implementacion de `llama.cpp`.
- No se han publicado evaluaciones de sesgos ni pruebas de seguridad. El modelo podria amplificar estereotipos o generar contenido discriminatorio.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue de un modelo sin moderacion puede violar politicas de plataformas o leyes locales. El responsable del despliegue debe evaluar los riesgos legales.
- La cuantizacion GGUF puede degradar ligeramente la calidad de las respuestas en comparacion con los pesos originales en bf16, especialmente en tareas que requieren precision numerica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/gemma-4-E2B-it-uncensored-GGUF
- Modelo base (bf16): https://huggingface.co/TrevorJS/gemma-4-E2B-it-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Codigo fuente de la abliteracion: https://github.com/TrevorS/gemma-4-abliteration

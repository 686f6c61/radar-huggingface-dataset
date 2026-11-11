# OpenIntelligenceNet/Phi-4-mini-instruct-Abliterated

## Resumen

Phi-4-mini-instruct-Abliterated es una variante modificada de microsoft/Phi-4-mini-instruct, un modelo de lenguaje de tipo transformer denso con aproximadamente 3.836 millones de parametros. Lo publica el usuario OpenIntelligenceNet en Hugging Face y su unica diferencia respecto al modelo original de Microsoft es la aplicacion de una tecnica de *abliteration* mediante la herramienta Heretic, que identifica la direccion en las activaciones asociada a las negativas (refusals) del modelo y la elimina de los pesos. El resultado es un modelo con menor probabilidad de rechazar peticiones.

El modelo conserva la arquitectura, el tokenizador y el conocimiento del Phi-4-mini-instruct original, por lo que mantiene el mismo contexto, el mismo formato de chat y las mismas capacidades generales de generacion de texto, razonamiento y codigo. El interes practico no esta en mejoras de rendimiento, sino en disponer de una version sin el alineamiento de seguridad que Microsoft aplico al modelo base, algo relevante para investigacion sobre alineamiento, red-teaming y estudios de robustez.

La ficha se centra en los datos verificables publicados en la model card y en la informacion de Hugging Face. El autor no ha publicado evaluaciones de benchmarks, ni detalles sobre el conjunto de prompts utilizado en el proceso de abliteration mas alla de la mencion a 150 ensayos con Heretic, ni resultados de calidad tras la modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia phi3, `custom_code` en transformers) |
| Parametros totales | 3.836.021.760 (~3,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | Ingles (segun metadatos del modelo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una modificacion post-entrenamiento del Phi-4-mini-instruct de Microsoft. La arquitectura subyacente es la de la familia phi3, un transformer denso de aproximadamente 3,8B de parametros que se carga en transformers mediante codigo personalizado (`custom_code`). El autor no aporta en la model card informacion sobre el numero de tokens de entrenamiento original, la composicion del dataset ni las etapas de RLHF o DPO del modelo base.

La innovacion tecnica de esta version es el proceso de abliteration ejecutado con Heretic. Segun la model card, Heretic identifica la direccion de las activaciones vinculada a los comportamientos de rechazo y la resta de los pesos, de modo que el modelo responde con mayor frecuencia a peticiones que el original rechazaria. El autor indica que se realizaron 150 ensayos (trials) con la herramienta, pero no detalla la metodologia exacta, el conjunto de evaluacion ni las metricas usadas para seleccionar la variante final. No se ha publicado ninguna evaluacion formal de seguridad, factualidad o rendimiento por parte del editor.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Phi-4-mini-instruct original.
- Razonamiento y resolucion de problemas de complejidad media, coherente con un modelo de ~3,8B de parametros.
- Generacion y explicacion de codigo, con soporte del formato de chat de la familia Phi-4.
- Reduccion del comportamiento de rechazo: el modelo es menos propenso a negarse a responder peticiones que el modelo base.
- Soporte del chat template mediante `apply_chat_template`, con generacion de respuestas multi-turno.
- Compatibilidad con text-generation-inference y con endpoints (segun los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve para estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, comparando respuestas con el Phi-4-mini-instruct original en el mismo conjunto de prompts.
- Red-teaming y evaluacion de robustez: util para construir conjuntos de pruebas adversarios y medir la eficacia de filtros y clasificadores de seguridad externos sobre las salidas del modelo.
- Estudio de degradacion por abliteration: permite cuantificar la perdida de calidad en tareas de razonamiento y codigo respecto al modelo base, ya que la propia model card advierte de que la abliteration puede reducir la calidad de las salidas.
- Generacion de texto creativo sin restricciones de rechazo: para experimentos de escritura de ficcion o narrativa donde el modelo base rechaza con frecuencia tematicas sensibles, siempre con revision humana y filtros propios.
- Analisis de sesgos y contenido danino en entornos controlados: el modelo puede emplearse en laboratorios para generar muestras de contenido problematico y entrenar clasificadores de moderacion.
- Prototipado de asistentes conversacionales en ingles: gracias a su tamano de ~3,8B y al chat template, puede desplegarse en entornos de desarrollo con recursos limitados para probar flujos conversacionales multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que el modelo no ha sido sometido a una evaluacion formal de seguridad, factualidad o rendimiento por parte del editor, y la model card no incluye tablas comparativas con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo denso de ~3,8B en safetensors, los pesos en precision nativa rondan los 7,7 GB (tamano del repositorio), por lo que se necesita al menos esa cantidad de memoria mas el espacio para el contexto y el cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPUs profesionales (A100, H100) y para GPUs de consumo con suficiente memoria; no hay datos publicados de latencia ni throughput.
- GPU de consumo: no hay confirmacion oficial. El tamano del repositorio (7,7 GB) sugiere que puede caber en GPUs de consumo de gama alta con 16 GB o mas de VRAM, pero no se ha verificado en la informacion disponible.
- Opciones de despliegue: transformers (con `custom_code`), text-generation-inference y endpoints compatibles segun los tags del repositorio. No se ha publicado version GGUF, por lo que no hay confirmacion de soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Phi-4-mini-instruct-Abliterated (este modelo) | ~3,8B | No disponible | MIT | Version abliterada del Phi-4-mini-instruct; sin benchmarks publicados por el editor |
| microsoft/Phi-4-mini-instruct | ~3,8B | No disponible en esta ficha | MIT | Modelo base original, con alineamiento de seguridad de Microsoft |
| Otros modelos abliterados de la familia Phi | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparado entre este modelo y el Phi-4-mini-instruct original, por lo que la comparativa se limita a parametros, licencia y naturaleza de la modificacion.

## Limitaciones y advertencias

- El modelo ha reducido su comportamiento de rechazo y puede producir contenido danino, peligroso, ilegal u ofensivo cuando se le solicita. Las salidas no deben considerarse seguras ni precisas.
- La abliteration puede degradar la calidad de las salidas; el autor recomienda evaluar el modelo en la tarea concreta antes de usarlo en produccion.
- No se ha realizado una evaluacion formal de seguridad, factualidad o benchmarks por parte del editor.
- El modelo solo declara soporte de ingles; no se documentan capacidades multilingues.
- No se dispone de informacion sobre la longitud de contexto efectiva ni sobre el comportamiento tras la modificacion en contextos largos.
- La licencia MIT se hereda del modelo base, pero el usuario es responsable del cumplimiento legal y de no emplear el modelo para facilitar violencia, armas, fraude o dano a terceros.
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta variante; se desconoce en que medida la abliteration afecta a la factualidad respecto al modelo base.
- Al tratarse de una modificacion no oficial de Microsoft, no cuenta con el respaldo ni el mantenimiento del equipo de Phi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenIntelligenceNet/Phi-4-mini-instruct-Abliterated
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Herramienta Heretic: https://github.com/p-e-w/heretic

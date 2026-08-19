# reaperdoesntknow/Discovered

## Resumen

`reaperdoesntknow/Discovered` es un modelo de lenguaje de pequeño tamaño, con aproximadamente 54,7 millones de parámetros, publicado en Hugging Face por el usuario `reaperdoesntknow` dentro de la colección DiscoverLM. El modelo está entrenado con la librería `transformers` y los pesos se distribuyen en formato `safetensors`. La model card indica que forma parte del portafolio de Convergent Intelligence LLC, que desarrolla modelos bajo el marco teórico denominado Discrepancy Calculus (DISC), un enfoque matemático para analizar la discrepancia entre el comportamiento esperado y el real de un modelo durante el entrenamiento.

A pesar de su tamaño reducido, el modelo no incluye documentación técnica detallada: la model card es una plantilla automática con secciones sin rellenar, y no se especifican arquitectura, datos de entrenamiento, licencia ni idiomas soportados. Los únicos datos concretos disponibles son el número de parámetros, el formato de pesos, la librería y las etiquetas asociadas (`trl`, `sft`, `convergentintel`). Esto lo convierte en un modelo difícil de evaluar para uso en producción sin información adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 54.657.008 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información publica sobre la arquitectura interna del modelo. La model card indica que fue entrenado mediante fine-tuning supervisado (SFT), ya que incluye las etiquetas `trl` y `sft`, lo que sugiere el uso de la libreria TRL de Hugging Face para el ajuste. Sin embargo, no se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

El modelo se enmarca dentro del proyecto "Discrepancy Calculus" (DISC) de Convergent Intelligence LLC, que propone un enfoque teorico para entender las singularidades del entrenamiento (como mesetas de perdida o colapso de modo) como senales estructurales. No obstante, no se detalla como este marco influye en la arquitectura o el entrenamiento concreto de `Discovered`.

## Capacidades

Dado que no se ha publicado informacion sobre las capacidades del modelo, no es posible confirmar ninguna habilidad especifica. Por su tamano (54M de parametros), es plausible que pueda realizar tareas basicas de generacion de texto, pero esto es una inferencia, no un dato verificado. No se ha documentado soporte para tool calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

Al no existir documentacion de capacidades, los casos de uso son especulativos. No obstante, por su tamano reducido, podria ser adecuado para:

- Experimentacion academica: servir como modelo base para estudios sobre el marco DISC o para pruebas de concepto en entornos con recursos limitados.
- Prototipado rapido: validar pipelines de fine-tuning o inferencia con modelos pequeños antes de escalar a modelos mayores.
- Educacion: ilustrar conceptos de SFT y ajuste de modelos en cursos de NLP.
- Dispositivos con restricciones de memoria: si se cuantizara, podria ejecutarse en hardware de gama baja, aunque no hay confirmacion de cuantizaciones disponibles.
- Investigacion en interpretabilidad: analizar el comportamiento de un modelo pequeño entrenado bajo un marco teorico alternativo.
- Generacion de texto basica en entornos controlados: siempre que se valide su calidad, podria usarse para tareas simples de completado o clasificacion ligera.

Estos usos son hipoteticos y requieren verificacion previa del comportamiento real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

Dado que el modelo tiene 54,7 millones de parametros, las estimaciones de VRAM para inferencia son:

- En precision FP32, el modelo ocupa aproximadamente 219 MB (54,7M x 4 bytes).
- En FP16/BF16, alrededor de 109 MB.
- Con cuantizacion INT8, unos 55 MB, y con INT4, unos 27 MB (si se aplicara cuantizacion, no confirmada).

Esto implica que cabria en cualquier GPU moderna, incluso en GPUs integradas o en CPU con suficiente RAM. Para inferencia, una GPU con 4 GB de VRAM seria mas que suficiente. No se han publicado datos de latencia ni throughput.

Opciones de despliegue: al ser un modelo de transformers, puede ejecutarse con librerias como `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF) u `Ollama`, aunque no hay confirmacion de compatibilidad con estas herramientas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo no tiene benchmarks publicados ni especificaciones de arquitectura. Como referencia de tamano, se podria comparar con modelos como GPT-2 (124M) o DistilBERT (66M), pero no hay datos de rendimiento para establecer una comparacion significativa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no proporciona informacion sobre arquitectura, entrenamiento, datos, licencia ni idiomas. Esto impide una evaluacion tecnica adecuada.
- Licencia no especificada: no se indica bajo que licencia se distribuye el modelo, lo que genera incertidumbre legal para uso comercial o derivado.
- Riesgo de alucinacion: al no conocerse los datos de entrenamiento ni el proceso de alineacion, no se puede estimar el riesgo de generacion de contenido falso o inconsistente.
- Sesgos desconocidos: sin informacion sobre el corpus de entrenamiento, no es posible identificar sesgos potenciales.
- Sin garantias de calidad: no hay benchmarks ni evaluaciones independientes que respalden su utilidad en tareas concretas.
- Origen no verificado: el autor es un usuario individual y no hay evidencia de revision por parte de la comunidad (0 likes, pocas descargas).

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Discovered
- Coleccion DiscoverLM: https://huggingface.co/collections/reaperdoesntknow/discoverlm
- Informe de seguridad de Protect AI: https://protectai.com/insights/models/reaperdoesntknow/Discovered/491e9a2b18dece37f0cb24eb710e28696a309806/overview
- Informe de seguridad de Palo Alto Networks: https://insights-db.paloaltonetworks.com/models/reaperdoesntknow/Discovered/950b8bc53d2cbcb58c26cced8616a85dae12cf8a/overview
- Articulo de Reuters sobre un modelo misterioso (no confirmado como relacionado): https://www.reuters.com/business/media-telecom/mystery-ai-model-has-developers-buzzing-is-this-deepseeks-latest-blockbuster-2026-03-18/

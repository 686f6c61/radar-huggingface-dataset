# SD-Next/Granite-4.2-3b-sdnq-uint8

## Resumen

Granite-4.2-3b-sdnq-uint8 es una versión precuantizada del modelo ibm-granite/granite-4.2-3b, publicada por el usuario SD-Next para su uso dentro de la interfaz SD.Next. Se trata de una variante "abliterated" y "uncensored", derivada a su vez de richardyoung/granite-4.2-3b-heretic, es decir, un ajuste que elimina total o parcialmente los mecanismos de rechazo del modelo original de IBM. La cuantización emplea la técnica SDNQ (Hadamard-Dynamic) en formato UINT8 de 8 bits.

El modelo conserva la arquitectura del Granite 4.2 de IBM con aproximadamente 3.647 millones de parámetros (3,6B) y un tamaño de repositorio de 4,2 GB en safetensors. La model card es extremadamente escueta: se limita a indicar el origen, el método de cuantización y las etiquetas de licencia y pipeline, sin aportar información sobre datos de entrenamiento, contexto o benchmarks.

Su relevancia es acotada: no es un modelo original sino un artefacto de despliegue pensado para ejecutarse en SD.Next con pesos de 8 bits, lo que reduce los requisitos de memoria frente al modelo base en bf16. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia de Qwen3.5-4B, un detalle inconsistente que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de ibm-granite/granite-4.2-3b; detalles no disponibles) |
| Parametros totales | 3.647.531.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UINT8 (8 bits) mediante SDNQ/Hadamard-Dynamic |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la model card enlaza a la licencia de Qwen3.5-4B, dato inconsistente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que procede de ibm-granite/granite-4.2-3b, un transformer de aproximadamente 3,6B parametros, y que la variante publicada es una cuantizacion de richardyoung/granite-4.2-3b-heretic, un ajuste de tipo "abliterated" que elimina las capas de rechazo del modelo original. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base ni en el ajuste heretic.

La innovacion tecnica principal de este artefacto es la cuantizacion SDNQ con transformada de Hadamard dinamica en UINT8, que reduce el peso del modelo a un repositorio de 4,2 GB. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones. Tampoco se documenta el proceso de calibracion de la cuantizacion ni la perdida de calidad respecto al modelo en bf16.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque no se detalla si el modelo base incorpora vision o si la etiqueta es heredada del ajuste.
- Modo "uncensored" y "abliterated": el modelo ha sido modificado para reducir o eliminar los rechazos ante peticiones que el modelo original bloquearia.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere despliegue via API compatible con el formato de Hugging Face.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en SD.Next: el modelo esta empaquetado especificamente para esta interfaz, de modo que un usuario puede cargarlo en 8 bits y ejecutar generacion de texto conversacional en hardware de consumo con menos memoria que el modelo en bf16.
- Experimentacion con modelos sin censura: investigadores que estudian el comportamiento de modelos abliterated pueden usar esta variante cuantizada para comparar respuestas frente al Granite 4.2 original sin necesidad de infraestructura de gran memoria.
- Prototipado de chatbots en entornos controlados: al ocupar 4,2 GB en disco y requerir menos VRAM que la version completa, sirve para montar un asistente conversacional de pruebas en una estacion de trabajo.
- Evaluacion de la cuantizacion SDNQ: el artefacto permite medir la degradacion de calidad de UINT8 con Hadamard-Dynamic frente a bf16 en tareas de generacion de texto.
- Integracion en pipelines de transformers: al usar la libreria transformers y safetensors, puede cargarse con las herramientas habituales para pruebas de inferencia por lotes.
- Generacion de texto en aplicaciones de investigacion sobre alineacion: la variante heretic permite estudiar respuestas ante prompts que el modelo base rechazaria, en un contexto academico y con supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de pesos UINT8 de 8 bits sobre 3,65B parametros, el peso ronda los 3,6-3,7 GB; con overhead de activaciones y cache KV, se estima un minimo de 5-6 GB de VRAM para contexto corto, aunque no hay datos oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una RTX 3060 de 12 GB o superior deberia poder cargarlo; una RTX 4090 o A100 ofrecerian holgura, pero son estimaciones no verificadas.
- Cabe en GPU de consumo: probablemente si en tarjetas con 8 GB o mas, segun la estimacion anterior; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada) y SD.Next (uso previsto). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD-Next/Granite-4.2-3b-sdnq-uint8 | 3,65B | no disponible | UINT8 (SDNQ) | apache-2.0 (inconsistente) | Hugging Face |
| ibm-granite/granite-4.2-3b (base) | 3,65B | no disponible | bf16 original | no disponible en esta ficha | Hugging Face |
| richardyoung/granite-4.2-3b-heretic | 3,65B | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita al linaje del propio modelo porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros autores. No se dispone de benchmarks que permitan comparar calidad frente a modelos de tamano similar.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": se ha modificado para eliminar rechazos, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No es apto para produccion orientada al publico sin una capa de moderacion externa.
- La model card es minima: no documenta datos de entrenamiento, contexto, idiomas ni evaluacion, lo que impide valorar su calidad con rigor.
- Inconsistencia de licencia: se declara apache-2.0 pero se enlaza a la licencia de Qwen3.5-4B, un modelo de otro autor. Conviene verificar los terminos reales antes de un uso comercial.
- La cuantizacion UINT8 puede degradar la calidad respecto al modelo en bf16; no se han publicado metricas de esa perdida.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluacion disponible que lo cuantifique.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de un modelo de IBM sin ficha detallada, se desconocen los sesgos del ajuste heretic.
- Idiomas soportados: no disponible, lo que impide garantizar un comportamiento correcto en castellano.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SD-Next/Granite-4.2-3b-sdnq-uint8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Modelo heretic de origen: https://huggingface.co/richardyoung/granite-4.2-3b-heretic
- Licencia enlazada en la model card: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE

# olusegunola/phi-1.5-primekg-ctl-trainprompt-seed42

## Resumen

`olusegunola/phi-1.5-primekg-ctl-trainprompt-seed42` es un modelo publicado en Hugging Face por el usuario olusegunola. Por la nomenclatura del identificador, todo apunta a que se trata de un ajuste fino (fine-tune) del modelo base `microsoft/phi-1.5`, un transformer decoder-only de aproximadamente 1.300 millones de parametros. El sufijo `primekg` sugiere que el entrenamiento se ha realizado sobre PrimeKG, un grafo de conocimiento de medicina de precision, mientras que `ctl` (probablemente "control"), `trainprompt` y `seed42` indican que forma parte de un experimento controlado y reproducible, con semilla fija, orientado a comparar variantes de entrenamiento.

La model card publicada es la plantilla autogenerada de Hugging Face y no contiene informacion sustantiva: no declara desarrollador, licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion. El repositorio ocupa 0,1 GB, un tamano llamativamente bajo para los pesos completos de un modelo de 1.300 millones de parametros en fp16 (que rondarian los 2,6 GB), lo que sugiere que podria tratarse de un adaptador, de pesos parciales o de una subida incompleta; este extremo no puede confirmarse con la informacion disponible.

El interes de esta ficha es, por tanto, acotado y de caracter principalmente documental: sirve como ejemplo de artefacto de investigacion de la comunidad, sin validacion externa (0 descargas, 0 likes en el momento de la consulta) y sin garantias de reproducibilidad, licencia o calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `microsoft/phi-1.5`, no confirmado para este fine-tune) |
| Parametros totales | Aprox. 1.300 millones (modelo base); no confirmado para este fine-tune |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (modelo base); no confirmado |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni configuracion de cuantizacion) |
| Idiomas soportados | no disponible (el modelo base esta centrado en ingles) |
| Licencia | no disponible (el modelo base `microsoft/phi-1.5` se distribuye bajo licencia MIT, pero este derivado no la declara) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `microsoft/phi-1.5` es un transformer decoder-only de 24 capas, 32 cabezas de atencion y dimension oculta de 2048, con una ventana de contexto de 2048 tokens y 1.300 millones de parametros. Segun la documentacion publica de Microsoft, se entreno sobre aproximadamente 30.000 millones de tokens de datos filtrados de "calidad de libro de texto" (sinteticos y web), sin ajuste por instrucciones ni RLHF. La arquitectura y el objetivo de entrenamiento del presente fine-tune no estan documentados en la informacion disponible, por lo que se asume la del modelo base sin confirmacion.

Respecto al ajuste fino, no hay informacion sobre el numero de tokens, la composicion del dataset, la tecnica (LoRA, QLoRA, ajuste completo), la funcion de perdida (por ejemplo, ORPO, dado el hermano `phi-1.5-primekg-orpo-seed7` del mismo autor) ni los hiperparametros. La presencia de las etiquetas `ctl` y `trainprompt` sugiere un diseno experimental con condicion de control y un prompt de entrenamiento prefijado, pero se trata de una inferencia a partir del nombre del repositorio, no de datos verificados. El planteamiento apunta a investigacion sobre inyeccion de conocimiento estructurado (PrimeKG) y su efecto en un modelo pequeno.

## Capacidades

- Generacion de texto en ingles (capacidad heredada del modelo base phi-1.5).
- Razonamiento de sentido comun, comprension del lenguaje y razonamiento logico basico, segun lo reportado para el modelo base.
- Matematicas elementales y fragmentos de codigo, dentro de las limitaciones de un modelo de 1.300 millones de parametros.
- Posible asociacion de conceptos biomedicos si el fine-tune sobre PrimeKG ha funcionado, aunque no hay ninguna evaluacion que lo respalde.
- Tool calling / function calling: no documentado; el modelo base no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo base esta orientado al ingles.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.

## Casos de uso

- Investigacion en inyeccion de conocimiento biomedico: el modelo puede emplearse como objeto de estudio para analizar si el ajuste fino sobre PrimeKG mejora la asociacion de entidades y relaciones medicas, siempre con validacion experimental propia.
- Estudio de olvido catastrofico: la variante `ctl` invita a comparar si el entrenamiento sobre un grafo biomedico degrada las capacidades generales del modelo base, un escenario clasico de investigacion en ajuste fino.
- Reproducibilidad de experimentos: la semilla fija (`seed42`) sugiere que el artefacto busca replicar condiciones controladas; puede usarse como punto de partida en estudios de reproducibilidad de pipelines de fine-tuning.
- Linea base de comparacion: util como baseline frente a la variante ORPO del mismo autor (`phi-1.5-primekg-orpo-seed7`) al evaluar tecnicas de alineamiento sobre datos de conocimiento.
- Prototipado educativo: sirve para ilustrar en docencia como un modelo pequeno puede ajustarse sobre un dataset estructurado y que limitaciones aparecen.
- Pruebas de extraccion de relaciones: con la debida cautela, puede experimentarse su uso para tareas de asociacion de conceptos biomedicos, nunca en un contexto clinico real sin validacion rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones y no hay datos verificables sobre MMLU, HumanEval, GSM8K ni metricas especificas del dominio biomedico para este fine-tune. No se deben extrapolar cifras del modelo base sin comprobacion experimental.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 1.300 millones de parametros): aproximadamente 2,6 GB en fp16, en torno a 1,4 GB en 8 bits y alrededor de 0,8 GB en 4 bits. Cifras orientativas; dependen de la libreria y del tamano real de los pesos publicados.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para cuantizacion de 4 bits; una RTX 3060 de 12 GB, una RTX 4090 o una A100 son holgadas para este tamano.
- Compatibilidad con GPU de consumo: si, el modelo base cabe comodamente en GPU de consumo e incluso en equipos modestos; se puede ejecutar tambien en CPU, con mayor latencia.
- Opciones de despliegue: `transformers` (libreria declarada); vLLM o TGI para servicio con batching; `llama.cpp` u Ollama requeririan convertir los pesos a GGUF, formato que no se publica.
- Latencia y throughput: no disponibles.

Advertencia: el repositorio ocupa solo 0,1 GB, por debajo de lo esperable para los pesos completos en fp16. Antes de desplegar, conviene verificar que los ficheros `safetensors` contienen la totalidad de los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olusegunola/phi-1.5-primekg-ctl-trainprompt-seed42 | ~1,3B (base) | 2048 (base) | no disponible | Hugging Face, 0 descargas | Model card vacia; sin evaluacion |
| microsoft/phi-1.5 (modelo base) | 1,3B | 2048 | MIT | Ampliamente disponible | Documentado; orientado a investigacion |
| olusegunola/phi-1.5-primekg-orpo-seed7 | ~1,3B (base) | 2048 (base) | no disponible | Hugging Face | Variante ORPO del mismo autor |
| Modelos pequenos comparables (p. ej. TinyLlama-1.1B, Qwen2.5-1.5B) | 1,1-1,5B | 2048-32768 segun modelo | Apache-2.0 | Ampliamente disponibles | Alternativas generalistas con licencia clara |

La comparacion de rendimiento no es posible: no hay benchmarks publicados para este fine-tune ni evaluaciones que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Model card sin contenido util: no se declaran datos de entrenamiento, hiperparametros, licencia ni procedencia, lo que impide auditar el modelo.
- Licencia no disponible: aunque el modelo base es MIT, el derivado no especifica condiciones, por lo que su uso comercial es juridicamente incierto.
- Riesgo elevado de alucinacion: un modelo de 1.300 millones de parametros y posiblemente ajustado sobre un dominio especifico puede generar afirmaciones biomedicas plausibles pero falsas.
- Ambito biomedico: cualquier uso relacionado con salud exige validacion experta; no debe emplearse para decisiones clinicas.
- Limitacion de contexto: 2048 tokens en el modelo base, insuficiente para documentos largos o conversaciones extensas.
- Sesgos: no documentados; se heredan los del modelo base y los del corpus de ajuste, sin analisis publicado.
- Idiomas: probablemente centrado en ingles; soporte de castellano no verificado.
- Falta de validacion externa: 0 descargas y 0 likes en el momento de la consulta; sin uso comunitario contrastado.
- Anomalia de fecha: la fecha de creacion registrada (2026-09-27) resulta incoherente y dificulta trazar el ciclo de vida del artefacto.
- Cautela con el despliegue: el tamano del repositorio (0,1 GB) hace aconsejable verificar la integridad de los pesos antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olusegunola/phi-1.5-primekg-ctl-trainprompt-seed42
- Variante relacionada del mismo autor: https://huggingface.co/olusegunola/phi-1.5-primekg-orpo-seed7
- Perfil del autor (datasets): https://huggingface.co/olusegunola/datasets
- Modelo base `microsoft/phi-1.5`: https://huggingface.co/microsoft/phi-1.5
- Ficha de phi-1.5 en Microsoft Foundry (Azure): https://ai.azure.com/catalog/models/microsoft-phi-1-5
- Familia Phi en Azure: https://azure.microsoft.com/en-us/products/phi/
- Referencia citada en la model card, Lacoste et al. (2019), arXiv:1910.09700: https://arxiv.org/abs/1910.09700
- Paper del modelo base phi-1.5, "Textbooks Are All You Need II", arXiv:2309.05463: https://arxiv.org/abs/2309.05463

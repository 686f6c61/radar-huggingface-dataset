# Johnnybae/dama-gusul

## Resumen

Dama-gusul es un ajuste fino (fine-tuning) publicado por el usuario Johnnybae en HuggingFace, derivado del modelo base `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`. Se distribuye bajo licencia Apache 2.0 y está etiquetado con los pipelines `image-text-to-text` y `text-generation-inference`, lo que indica que se trata de un modelo multimodal capaz de procesar imagenes y texto como entrada y generar texto como salida. El repositorio ocupa 10,3 GB y contiene pesos en formato safetensors con 5.123.178.051 parametros totales, una cifra que coincide aproximadamente con un almacenamiento en precision de 16 bits.

El modelo se ha entrenado, segun la model card, con la libreria Unsloth y TRL de HuggingFace, con una aceleracion declarada de 2x respecto a un entrenamiento convencional. No se especifica el conjunto de datos de ajuste, el numero de tokens utilizados, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO sobre el modelo base.

Su relevancia actual es limitada pero ilustrativa: se trata de un ejemplo de ajuste fino de bajo coste sobre una familia de modelos abiertos (Gemma), reproducible con herramientas de consumo en una sola GPU, y publicado con licencia permisiva. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y no se ha publicado ninguna evaluacion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`); no se detalla en la informacion disponible si emplea mezcla de expertos ni el tipo exacto de atencion |
| Parametros totales | 5.123.178.051 (segun safetensors) |
| Parametros activos | No disponible (no se declara arquitectura de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio (solo se declaran pesos safetensors). El modelo base se distribuye cuantizado en 4 bits (`bnb-4bit`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo base como `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, es decir, un modelo de la familia Gemma en su variante instructiva, cuantizado a 4 bits y redistribuido por Unsloth. El pipeline declarado (`image-text-to-text`) implica una arquitectura con torre de vision mas un decodificador de lenguaje, orientada a tareas de pregunta-respuesta sobre imagenes y generacion de texto condicionada por entrada visual. No se especifica el numero de capas, la dimension del modelo, el mecanismo de atencion ni si se emplean tecnicas como atencion lineal o decodificacion especulativa. Tampoco se detalla la longitud de contexto soportada.

En cuanto al entrenamiento, la model card unicamente indica que el ajuste se realizo con Unsloth y la libreria TRL de HuggingFace, con una mejora de velocidad declarada de 2x. No se aportan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el numero de epocas, la tasa de aprendizaje ni la aplicacion de tecnicas de alineacion (RLHF, DPO, ORPO). Tampoco hay informacion sobre si el ajuste afecto a la torre de vision o solo al decodificador de texto. El hecho de partir de un modelo ya cuantizado en 4 bits sugiere un flujo de QLoRA, aunque esto no se confirma en la documentacion.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y deriva de una variante instructiva, por lo que se espera que soporte dialogos multi-turno.
- Entrada multimodal: el pipeline `image-text-to-text` indica capacidad de procesar imagenes junto con texto, presumiblemente heredada del modelo base.
- Razonamiento y conocimiento general: no hay evaluaciones publicadas que confirmen el nivel conservado tras el ajuste.
- Generacion de codigo y matematicas: no disponible; no se documenta ningun resultado especifico.
- Tool calling / function calling: no disponible; no se menciona soporte explicito.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: la model card declara unicamente ingles (`en`), por lo que no se garantiza un comportamiento fiable en castellano u otros idiomas.
- Modo de razonamiento explicito (thinking), audio o video: no disponible.

## Casos de uso

- Prototipado rapido de asistentes multimodales: al ser un modelo de ~5.100 millones de parametros con licencia Apache 2.0, puede desplegarse en una sola GPU para experimentar con flujos de pregunta-respuesta sobre imagenes sin coste de licencia.
- Clasificacion y descripcion de imagenes en lotes internos: el pipeline `image-text-to-text` permite generar descripciones o etiquetas a partir de imagenes; util en tareas de catalogacion siempre que se valide la calidad con datos propios, dado que no hay benchmarks publicados.
- Base para ajustes finos especificos de dominio: al estar publicado con pesos safetensors y licencia permisiva, sirve como punto de partida para QLoRA sobre datos propios en sectores como retail o inspeccion visual.
- Experimentacion academica con tecnicas de ajuste eficiente: el modelo documenta el uso de Unsloth y TRL, por lo que es un caso practico para estudiar flujos de entrenamiento con cuantizacion de 4 bits y comparar costes.
- Generacion de documentacion asistida a partir de capturas o diagramas: en entornos de desarrollo, puede emplearse para transcribir y comentar diagramas tecnicos, sujeto a verificacion humana por el riesgo de alucinacion.
- Evaluacion comparativa de familias Gemma: permite medir el impacto de un ajuste fino sobre un modelo base instructivo ya cuantizado, con un presupuesto de hardware reducido.
- Chatbot interno de bajo coste en ingles: para equipos que trabajen en ingles y necesiten un asistente on-premise sin dependencia de APIs externas, siempre que se asuma la ausencia de garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas de directorios telefonicos sin relacion con el ambito de la IA).

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits (bf16/fp16): aproximadamente 10,3 GB solo para los pesos, mas el coste de la cache KV y el procesamiento de imagenes; en la practica se recomienda reservar entre 12 y 16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos, con un total practico de 8-10 GB.
- VRAM estimada en cuantizacion de 4 bits (por ejemplo GGUF Q4_K_M, si se genera): entre 3 y 4 GB de pesos, con un total practico de 5-6 GB, mas el coste adicional de la torre de vision.
- GPU profesionales: A100 (40/80 GB), H100 o L40S cubren el modelo con margen amplio y permiten lotes grandes.
- GPU de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) ejecutan el modelo en bf16 sin problemas; RTX 4080/4070 Ti Super (16 GB) pueden hacerlo con margen ajustado; RTX 3060 (12 GB) requerira cuantizacion; tarjetas con 8 GB o menos necesitaran 4 bits y posibles recortes en la resolucion de imagen.
- Opciones de despliegue: la etiqueta `text-generation-inference` sugiere compatibilidad con TGI; tambien son plausibles transformers (libreria declarada), vLLM y Unsloth para entrenamiento e inferencia. El uso de llama.cpp u Ollama requiere convertir los pesos a GGUF y depende de que la herramienta soporte la arquitectura de la familia Gemma empleada; no se publica ningun archivo GGUF en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

La comparativa siguiente se ofrece como referencia orientativa de categoria (modelos multimodales abiertos de menos de 10.000 millones de parametros). Los datos de los modelos alternativos provienen de conocimiento general sobre dichos lanzamientos y deberian verificarse en sus fichas oficiales antes de usarse en una decision de produccion.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Johnnybae/dama-gusul | 5.123 millones | No disponible | Imagen y texto a texto | Apache 2.0 | HuggingFace, safetensors |
| Gemma 3 4B IT (Google) | ~4.000 millones | 128.000 tokens | Imagen y texto a texto | Licencia Gemma (con restricciones de uso) | HuggingFace, safetensors, GGUF |
| Qwen2.5-VL-3B-Instruct | ~3.750 millones | 32.000 tokens (ampliable con YaRN) | Imagen y texto a texto | Apache 2.0 | HuggingFace, safetensors, GGUF |
| SmolVLM2-2.2B (HuggingFace) | ~2.200 millones | No disponible | Imagen y video a texto | Apache 2.0 | HuggingFace, safetensors |

Frente a estas alternativas, la ventaja de dama-gusul es su licencia Apache 2.0 sin las restricciones de la licencia Gemma, mientras que su principal desventaja es la ausencia total de documentacion tecnica y de evaluaciones publicadas, ademas del soporte declarado unicamente en ingles.

## Limitaciones y advertencias

- Ausencia de evaluacion: no existe ningun benchmark publicado, por lo que se desconoce si el ajuste fino ha degradado las capacidades del modelo base (fenomeno de olvido catastrofico).
- Riesgo elevado de alucinacion: al no haber datos de alineacion ni evaluaciones, no puede asumirse fiabilidad factual en produccion.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar aplicaciones con documentos largos o historiales extensos.
- Sesgos: no se documenta ningun proceso de mitigacion de sesgos ni la composicion del dataset de ajuste, por lo que se heredan los sesgos del modelo base y de los datos empleados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de la familia Gemma, ya que las licencias de los modelos derivados pueden arrastrar obligaciones adicionales.
- Trazabilidad: el autor no publica detalles del entrenamiento (dataset, hiperparametros, hardware), lo que dificulta la reproducibilidad.
- Madurez: el repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en produccion ni mantenimiento posterior a la fecha de publicacion (20 de septiembre de 2026, con ultima actualizacion el mismo dia).
- Formato: solo se publican pesos safetensors; no hay versiones GGUF ni cuantizaciones listas para consumir en herramientas de inferencia local.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johnnybae/dama-gusul
- Modelo base: https://huggingface.co/unsloth/gemma-4-e2b-it-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Paper o blog oficial del modelo: no disponible
- Resultados de la busqueda web: no se encontraron enlaces relevantes; los resultados devueltos correspondian a directorios telefonicos alemanes sin relacion con el modelo.

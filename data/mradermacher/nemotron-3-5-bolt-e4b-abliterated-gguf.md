# mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Abliterated-GGUF es una cuantizacion estatica en formato GGUF del modelo monamoe/Nemotron-3.5-Bolt-E4B-Abliterated, publicada por el usuario mradermacher, conocido en la comunidad por generar versiones GGUF de modelos recientes para inferencia local. El nombre sugiere una variante derivada de la familia Nemotron (NVIDIA) con 3.500 millones de parametros nominales y una designacion "E4B" que, por convencion en modelos tipo MoE, apuntaria a 4.000 millones de parametros activos; sin embargo, el dato real de safetensors del repositorio indica 7.518.069.290 parametros totales, por lo que la nomenclatura no coincide de forma directa con el conteo efectivo.

El modelo base pertenece presuntamente a la estirpe Nemotron 3.5 de NVIDIA, orientada a tareas conversacionales y de razonamiento, aunque la model card incluida en este repositorio no aporta informacion sobre arquitectura, datos de entrenamiento ni evaluaciones. El sufijo "Abliterated" es una convencion de la comunidad de fine-tuning que suele indicar la eliminacion o reduccion de mecanismos de rechazo y alineacion de seguridad, lo que tiene implicaciones directas para su uso en produccion.

La relevancia de esta publicacion es practica: ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta F16, incluyendo IQ4_XS) para facilitar su despliegue en hardware de consumo mediante llama.cpp u Ollama. No obstante, el repositorio no registra descargas ni interacciones, no declara licencia y no incluye documentacion tecnica verificable, por lo que debe tratarse como un artefacto de procedencia incierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presuntamente transformer, sin confirmar; "E4B" sugiere posible MoE) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 60,3 GB |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1 |
| Conversion | hf |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El identificador "E4B" es consistente con la convencion empleada en modelos de mezcla de expertos (MoE) para indicar parametros activos (4B), pero el conteo real de parametros del repositorio (7,52B) no encaja con esa lectura sin ambiguedad, por lo que no es posible confirmar si se trata de un transformer denso, un MoE o una arquitectura hibrida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Respecto al proceso de cuantizacion, la model card indica que se trata de cuantizaciones estaticas (quantize_version 2) con cuantizacion de tensores de salida activada, generadas a partir del modelo base monamoe/Nemotron-3.5-Bolt-E4B-Abliterated en formato Hugging Face. El sufijo "Abliterated" sugiere un proceso de fine-tuning orientado a suprimir comportamientos de rechazo, pero no se aporta ninguna especificacion tecnica sobre dicho proceso, su metodologia ni el impacto sobre las capacidades del modelo.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" del repositorio y el pipeline asociado indican uso previsto para dialogos multi-turno.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que el modelo puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Inferencia local: al distribuirse en GGUF, es ejecutable en llama.cpp, Ollama y otros runners compatibles.
- Razonamiento y codigo: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 7,5B parametros en GPU de consumo, lo que facilita iterar sobre prompts y flujos de dialogo sin coste de API.
- Evaluacion de variantes "abliterated" en investigacion de seguridad: util para estudiar como el fine-tuning de supresion de rechazos altera las respuestas del modelo en dominios sensibles, siempre dentro de un marco de evaluacion controlado.
- Pruebas de integracion con llama.cpp y Ollama: el repositorio incluye doce niveles de cuantizacion, lo que permite medir el compromiso entre calidad y huella de memoria en distintas configuraciones de hardware.
- Despliegue en entornos con recursos limitados: la variante Q2_K o IQ4_XS reduce el peso a unos pocos GB, adecuada para equipos sin GPU dedicada o con VRAM muy ajustada.
- Generacion de texto offline en estaciones de trabajo aisladas: al no requerir conexion a servicios externos, encaja en escenarios con requisitos de privacidad donde el contenido no puede salir de la red local.
- Comparativas de cuantizacion: sirve como caso de estudio para medir la degradacion de calidad entre F16 y Q2_K en un modelo de ~7,5B parametros, con fines de documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el conteo de 7,52B parametros y las cuantizaciones declaradas):
  - F16: en torno a 15 GB de pesos, mas overhead de contexto.
  - Q8_0: en torno a 8 GB.
  - Q6_K: en torno a 6,2 GB.
  - Q5_K_M: en torno a 5,4 GB.
  - Q4_K_M: en torno a 4,6 GB.
  - Q3_K_M: en torno a 3,7 GB.
  - Q2_K: en torno a 2,9 GB.
  - IQ4_XS: en torno a 4,2 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) permite F16 con contexto amplio; una RTX 4060 Ti de 16 GB o una RTX 4070 de 12 GB cubren Q8_0 y Q6_K; GPUs de 8 GB cubren Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: si, en todas las cuantizaciones de Q8_0 hacia abajo con 8 GB o mas de VRAM; las variantes Q3 y Q2 caben en 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). vLLM y TGI requeririan el modelo base en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Abliterated-GGUF (este) | 7,52B | no disponible | no disponible | GGUF | Sin benchmarks ni documentacion |
| Mistral-7B-Instruct (referencia de tamano) | 7,24B | 32K (v0.2) | Apache 2.0 | safetensors, GGUF | Ampliamente documentado y evaluado |
| Qwen2.5-7B-Instruct (referencia de tamano) | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Benchmarks publicos y soporte de tool calling |
| Llama-3.1-8B-Instruct (referencia de tamano) | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Ecosistema amplio y evaluaciones publicas |

La comparativa se limita al rango de parametros, ya que no existen datos de rendimiento del modelo evaluado. Frente a las alternativas citadas, la principal desventaja es la ausencia de licencia declarada, benchmarks y documentacion, lo que impide verificar su calidad y sus condiciones de uso.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; debe tratarse como no apto para produccion hasta verificar la licencia del modelo base.
- Procedencia incierta: el autor de la cuantizacion no es el desarrollador original; el modelo base monamoe/Nemotron-3.5-Bolt-E4B-Abliterated no aporta documentacion tecnica en este repositorio.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo.
- Sesgos: no documentados; al no declararse composicion del dataset ni idiomas, no es posible evaluar sesgos linguisticos o culturales.
- Efecto "Abliterated": la eliminacion de mecanismos de rechazo puede producir respuestas inapropiadas en dominios sensibles y complica el cumplimiento de politicas de contenido en entornos comerciales.
- Contexto desconocido: se desconoce la ventana de contexto efectiva, lo que impide planificar su uso en tareas de documento largo.
- Sin soporte ni mantenimiento: cero descargas y cero interacciones en el momento de la consulta; no hay garantia de actualizaciones ni de correccion de errores.
- Ambiguedad en la nomenclatura: la designacion "E4B" no concuerda con el conteo real de parametros, lo que sugiere que el nombre comercial puede no reflejar la arquitectura efectiva.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S pueden degradar notablemente la coherencia en modelos de este tamano; se recomienda validar la calidad antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-GGUF
- Modelo base: https://huggingface.co/monamoe/Nemotron-3.5-Bolt-E4B-Abliterated

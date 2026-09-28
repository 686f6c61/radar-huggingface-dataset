# mradermacher/Darwin-27B-RSI-GGUF

## Resumen

Darwin-27B-RSI-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo FINAL-Bench/Darwin-27B-RSI. El modelo original es, segun su propia model card, el resultado de aplicar Recursive Self-Improvement (RSI) sobre Darwin-27B-Opus: el ajuste se habria realizado utilizando unicamente señal generada por el propio modelo, sin respuestas escritas por humanos. Se trata, por tanto, de un derivado de un derivado: el repositorio que nos ocupa no entrena nada, solo convierte los pesos a formatos cuantizados de llama.cpp para su ejecucion en hardware de consumo.

El interes tecnico esta en dos frentes. Por un lado, el pipeline de RSI como metodo de mejora sin supervision humana es un area de investigacion activa y poco documentada en modelos abiertos de esta escala. Por otro, la disponibilidad de cuantizaciones estaticas que van desde x-f16 hasta Q2_K permite desplegar un modelo de aproximadamente 27.000 millones de parametros en tarjetas graficas de 24 GB o incluso menos, algo relevante para quien quiera evaluar el modelo sin acceso a clústeres.

La informacion publica disponible es muy limitada. No se ha publicado en los datos proporcionados ni la arquitectura exacta, ni el numero de tokens de entrenamiento, ni la longitud de contexto, ni los idiomas soportados, ni la licencia. Cualquier dato de ese tipo debe considerarse no disponible y requeriria consultar los repositorios originales de FINAL-Bench o del modelo Darwin-27B-Opus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Darwin-27B-Opus; sin confirmar) |
| Parametros totales | ~27B (segun la denominacion del modelo y el campo model size de repos similares del mismo autor) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara para este repositorio) |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |
| Tipo de repositorio | cuantizacion estatica derivada, no entrenamiento |
| Modelo de origen | FINAL-Bench/Darwin-27B-RSI |
| Fecha de publicacion en HuggingFace | 2026-09-27 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de informacion verificable sobre la arquitectura interna del modelo. El nombre y el tamano sugieren un transformer denso de aproximadamente 27.000 millones de parametros, pero no hay confirmacion de si emplea atencion completa, atencion lineal, mezcla de expertos u otra variante. Tampoco se documentan el numero de capas, dimensiones ocultas, tamano de vocabulario ni el mecanismo de atencion. Todo ello debe consultarse en los repositorios de FINAL-Bench, que no aparecen detallados en la informacion proporcionada.

Respecto al entrenamiento, la unica afirmacion recogida es que Darwin-27B-RSI es el resultado de aplicar Recursive Self-Improvement sobre Darwin-27B-Opus, con cero respuestas escritas por humanos. Esto implica que el bucle de mejora (generacion de candidatos, evaluacion, filtrado y reentrenamiento) se habria alimentado exclusivamente de señal autogenerada. No se especifican el volumen de datos, la composicion del corpus, ni si hubo etapas de RLHF, DPO, RLVR u otra forma de optimizacion por preferencias. Este repositorio, en concreto, no realiza ningun tipo de entrenamiento: unicamente aplica cuantizacion estatica (indicada en la model card como quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre los pesos ya existentes.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje de ~27B parametros, aunque no hay evaluaciones publicadas que la cuantifiquen.
- Razonamiento y matematicas: no disponible; el pipeline de RSI sugiere un enfasis en tareas verificables, pero no esta confirmado.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades multimodales (vision, audio): no disponible; no se menciona ninguna y los quants no incluyen proyector mmproj.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Ejecucion local mediante llama.cpp y derivados: si, es la funcion principal de este repositorio.

## Casos de uso

- Evaluacion de tecnicas de Recursive Self-Improvement: el modelo es un caso practico para estudiar si un bucle de auto-mejora sin supervision humana produce ganancias medibles; se compararia Darwin-27B-RSI contra Darwin-27B-Opus en tareas verificables (matematicas, codigo) usando las cuantizaciones Q8_0 o x-f16 para minimizar el ruido de la cuantizacion.
- Despliegue local en estacion de trabajo con GPU de 24 GB: con Q4_K_M o Q5_K_S, un modelo de ~27B entra en una RTX 3090 o RTX 4090, lo que permite prototipar asistentes de texto sin coste de API.
- Generacion de texto asistida en entornos aislados (air-gapped): al ser GGUF y ejecutable con llama.cpp sin conexion, encaja en organizaciones que no pueden enviar datos a servicios en la nube.
- Experimentacion academica con cuantizacion: la disponibilidad de 12 variantes (desde x-f16 hasta Q2_K e IQ4_XS) permite medir la degradacion de calidad por bits por peso en un mismo modelo, algo util para investigacion sobre compresion.
- Servicio de chat de bajo volumen autoalojado: con Ollama o llama.cpp en modo servidor se puede exponer una API compatible con OpenAI para uso interno, asumiendo que no hay datos publicados de latencia.
- Base para fine-tuning posterior: los pesos x-f16 o Q8_0 pueden servir como punto de partida para LoRA o ajustes completos antes de volver a cuantizar.
- Comparacion de pipelines de cuantizacion: al existir tambien un Q4_K_M publicado por la propia organizacion FINAL-Bench, es posible contrastar el resultado de dos pipelines distintos sobre los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y las busquedas realizadas no aportan cifras. No se debe asumir ningun rendimiento concreto sin consultar la documentacion del modelo base Darwin-27B-RSI o Darwin-27B-Opus.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (~27B) y de las reglas habituales de tamano de llama.cpp, no datos publicados por el autor:

- VRAM estimada para inferencia (solo pesos, sin cache KV):
  - x-f16: ~54 GB
  - Q8_0: ~29 GB
  - Q6_K: ~22-23 GB
  - Q5_K_M / Q5_K_S: ~19 GB
  - Q4_K_M / Q4_K_S: ~16-17 GB
  - IQ4_XS: ~15-16 GB
  - Q3_K_L / Q3_K_M / Q3_K_S: ~13-15 GB
  - Q2_K: ~10-11 GB
- GPU recomendadas:
  - FP16 y Q8_0: A100 80 GB, H100 80 GB, o dos GPU de 40-48 GB con reparto por capas.
  - Q6_K y Q5_K_M: A100 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB.
  - Q4_K_M: RTX 3090, RTX 4090, RTX 4080 Super, A6000 48 GB con margen amplio.
  - Q3_K y Q2_K: tarjetas de 12-16 GB (RTX 4070 Ti Super, RTX 4080, Tesla T4 16 GB) con contexto reducido.
- Cabe en GPU de consumo: si. Q4_K_M en RTX 3090/4090 de 24 GB con contexto moderado; Q3_K_M o Q2_K en GPU de 12-16 GB si se limita la ventana de contexto.
- Nota sobre cache KV: al desconocerse la longitud de contexto del modelo, no se puede estimar el consumo adicional. En modelos de 27B con contexto largo, la cache KV puede anadir varios GB y obligar a bajar de cuantizacion o a usar cuantizacion de KV.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, koboldcpp, llamafile, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI admiten GGUF de forma experimental, pero el camino habitual para estos pesos es llama.cpp.
- Latencia y throughput: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| mradermacher/Darwin-27B-RSI-GGUF | ~27B | no disponible | GGUF (12 quants) | no disponible | no disponible |
| FINAL-Bench/Darwin-27B-RSI-GGUF | ~27B | no disponible | GGUF (Q4_K_M) | no disponible | no disponible |
| FINAL-Bench/Darwin-27B-RSI | ~27B | no disponible | safetensors | no disponible | no disponible |
| mradermacher/Eikos-27B-GGUF | ~27B | no disponible | GGUF | no disponible | no disponible |
| mradermacher/Mars_27B_V.1-i1-GGUF | ~27B | no disponible | GGUF (imatrix) | no disponible | no disponible |

La comparacion se limita a tamano y disponibilidad de formatos porque no hay datos publicos de contexto, licencia ni evaluaciones para ninguno de los modelos listados. Eikos-27B y Mars_27B_V.1 son alternativas del mismo orden de magnitud distribuidas por el mismo autor, pero no pertenecen a la misma familia Darwin y no se han encontrado metricas comparables.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica terminos de uso. Antes de cualquier uso comercial es obligatorio verificar la licencia en FINAL-Bench/Darwin-27B-RSI y, en su caso, en Darwin-27B-Opus. A falta de esa verificacion, debe asumirse que el uso comercial no esta autorizado.
- Procedencia del ajuste: el modelo se ha mejorado con señal autogenerada y cero respuestas humanas. Esto dificulta predecir su comportamiento en dominios sensibles y aumenta el riesgo de deriva respecto a convenciones humanas de utilidad y seguridad.
- Riesgo de alucinacion: no hay evaluaciones de fidelidad factual publicadas. En ausencia de datos, debe asumirse un riesgo estandar o superior al de modelos ajustados con supervision humana.
- Degradacion por cuantizacion: Q2_K, Q3_K_S e IQ4_XS introducen perdidas notables de calidad en modelos de este tamano. Para evaluacion seria, usar x-f16, Q8_0 o, como minimo, Q5_K_M.
- Idiomas: no se declara soporte de idiomas. El comportamiento en castellano es desconocido y deberia validarse empiricamente antes de usarlo en produccion.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos, y no se puede dimensionar la cache KV.
- Sin benchmarks ni evaluaciones de seguridad: no hay datos de sesgos, toxicidad, robustez frente a jailbreak ni comportamiento en tareas de agente.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor probabilidad de fallos no detectados en la conversion.
- Fecha de publicacion en metadatos posterior a la fecha actual de redaccion; conviene verificar la integridad y autenticidad del repositorio antes de descargar pesos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Darwin-27B-RSI-GGUF
- Modelo base (RSI, safetensors): https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- GGUF Q4_K_M publicado por la organizacion original: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Alternativa del mismo autor y tamano (Eikos-27B): https://huggingface.co/mradermacher/Eikos-27B-GGUF
- Alternativa del mismo autor y tamano (Mars 27B V.1): https://huggingface.co/mradermacher/Mars_27B_V.1-i1-GGUF

# mradermacher/TwIL-8B-Abliterated-Uncensored-i1-GGUF

## Resumen

TwIL-8B-Abliterated-Uncensored-i1-GGUF es una distribucion en formato GGUF del modelo TwIL-8B-Abliterated-Uncensored, publicada por el usuario mradermacher en Hugging Face. Se trata de una version "abliterated" (es decir, con el comportamiento de rechazo eliminado de los pesos mediante tecnicas de edicion de representaciones internas) del modelo base TwIL-8B de webAI, un modelo de razonamiento de aproximadamente 8.800 millones de parametros. Esta ficha describe el artefacto cuantizado, no el modelo original.

El interes de esta publicacion reside en dos factores. Por un lado, ofrece el modelo en el formato i1 de mradermacher, que emplea cuantizacion con matriz de importancia (imatrix) para preservar mejor la calidad en niveles de compresion agresivos, con un catalogo que va desde IQ1_S hasta Q6_K. Por otro lado, al tratarse de una variante abliterated, el modelo responde a peticiones que el modelo original rechazaria, lo que resulta relevante para equipos de seguridad que evaluan robustez de salvaguardas, asi como para investigadores que estudian el efecto de la abliteracion sobre las capacidades de razonamiento.

La informacion disponible sobre este artefacto concreto es muy limitada: el repositorio no incluye model card descriptiva, no declara licencia ni idiomas, y no presenta resultados de benchmarks propios. Los datos tecnicos que se recogen a continuacion proceden de la model card del modelo base y de la informacion publica sobre TwIL-8B, y deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con modo de razonamiento (no disponible el detalle exacto de la arquitectura del modelo base) |
| Parametros totales | Aproximadamente 8.800 millones (8.8B) segun la informacion publica de TwIL-8B; el campo de parametros del repo GGUF no es fiable (2.993.720) |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix) |

## Arquitectura y entrenamiento

El modelo base TwIL-8B es un modelo de razonamiento de 8.8B parametros desarrollado por webAI, con capacidad de ejecucion local en aproximadamente 4,98 GiB segun la informacion publica disponible. No se dispone de detalles sobre la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion, tipo de posicional encoding), el volumen o composicion del corpus de entrenamiento, ni sobre si se emplearon tecnicas de RLHF, DPO o aprendizaje por refuerzo con verificacion para el modo de razonamiento.

La variante Abliterated-Uncensored, publicada por el usuario Guilherme34, aplica tecnicas de abliteracion: identificacion de la direccion de rechazo en el espacio de activaciones y edicion de los pesos para suprimirla, sin reentrenamiento adicional. Sobre esa variante, mradermacher genera las cuantizaciones i1 descritas, que emplean una matriz de importancia calculada a partir de estadisticas de activacion para ponderar la cuantizacion de cada tensor. Los metadatos de la model card confirman `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversion desde pesos en formato Hugging Face. No se documenta ninguna innovacion adicional de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo base TwIL-8B esta disenado explicitamente como modelo de razonamiento, con un modo de pensamiento que produce cadenas de razonamiento antes de la respuesta final.
- Razonamiento matematico: la informacion publica de TwIL-8B reporta una puntuacion de 98,2 en MATH-500, lo que situa al modelo base en un nivel alto en tareas matematicas de competicion.
- Ejecucion local eficiente: el modelo base se describe como ejecutable en aproximadamente 4,98 GiB, lo que sugiere cuantizaciones de baja precision viables en hardware de consumo.
- Comportamiento sin rechazo: la abliteracion elimina las respuestas de negativa del modelo original, de modo que responde a practicamente cualquier instruccion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Vision o audio: no disponible; no se ha documentado soporte multimodal.

## Casos de uso

- Evaluacion de robustez de salvaguardas: los equipos de seguridad pueden desplegar esta variante junto al modelo original y comparar respuestas ante un conjunto de prompts de riesgo, para medir cuanto de la politica de rechazo reside en los pesos y cuanto en el post-entrenamiento.
- Investigacion sobre abliteracion: comparar la calidad de razonamiento (por ejemplo, en problemas de MATH-500) entre el modelo base y la variante abliterated permite cuantificar el coste de eliminar la direccion de rechazo sobre las capacidades cognitivas.
- Pruebas de red teaming en local: al caber en cuantizaciones de baja precision en GPUs de consumo, permite ejecutar baterias de prompts adversarios en estaciones de trabajo sin depender de APIs externas ni exponer el trafico.
- Generacion de datos sinteticos sin restricciones: util para construir datasets de entrenamiento o de evaluacion que requieran respuestas a peticiones que los modelos alineados rechazan, siempre con revision humana posterior.
- Despliegue en entornos aislados: el formato GGUF con llama.cpp u Ollama permite ejecutar el modelo en maquinas sin conexion, util para laboratorios con requisitos de confidencialidad.
- Estudio de degradacion por cuantizacion: la disponibilidad de 24 niveles de cuantizacion desde IQ1_S hasta Q6_K permite analizar empiricamente la relacion entre bits por peso y calidad de razonamiento en un modelo de 8.8B.

## Benchmarks y rendimiento

La informacion publica disponible solo incluye un dato del modelo base TwIL-8B, no de esta variante abliterated ni de sus cuantizaciones:

| Benchmark | TwIL-8B (base) | TwIL-8B-Abliterated-Uncensored-i1-GGUF |
|---|---|---|
| MATH-500 | 98,2 | no disponible |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

No se han publicado resultados de benchmarks especificos de esta variante abliterated ni de sus cuantizaciones en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.8B parametros, el peso en disco y VRAM aproximada por cuantizacion seria de unos 3,5 GB en IQ2, 4,5-5 GB en Q4_K_M, 6,5-7 GB en Q6_K y en torno a 17 GB en FP16. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados para este artefacto.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para cuantizaciones Q5/Q6 con contexto amplio; RTX 3090 o A100/H100 para despliegues con mayor concurrencia o contexto largo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas para cuantizaciones Q4, y en 6 GB para IQ2/IQ3 con contexto reducido.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; tambien es posible usar llama-cpp-python o servidores compatibles con GGUF. vLLM y TGI no son la via habitual para este formato.
- Latencia y throughput: no disponible; no se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TwIL-8B-Abliterated-Uncensored-i1-GGUF | ~8,8B | no disponible | GGUF (24 cuants) | no disponible | Variante abliterated con cuantizacion imatrix |
| TwIL-8B (base, webAI) | ~8,8B | no disponible | safetensors | no disponible | Modelo original con razonamiento; 98,2 en MATH-500 |
| Otras variantes abliterated de 8B (indice abliteratedmodels.org) | ~7-9B | variable | safetensors/GGUF | variable | Catalogo de 956 modelos sin rechazo; comparacion directa no disponible |

No se dispone de datos de rendimiento de esta variante que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteracion suprime el comportamiento de rechazo, pero no garantiza precision: el modelo puede generar contenido danino, ilegal o inseguro sin advertencia. No es apto para despliegues orientados al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion en dominios factuales, comun en modelos de razonamiento de este tamano y agravado por la falta de datos de evaluacion de esta variante.
- La cuantizacion agresiva (IQ1/IQ2) degrada de forma notable la coherencia y el razonamiento multi-paso; para tareas matematicas conviene Q4_K_M o superior.
- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base y de la variante abliterated antes de cualquier uso en produccion.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido y probablemente inferior al ingles.
- Longitud de contexto no documentada; asumir contextos cortos en la planificacion.
- El campo de parametros del repositorio (2.993.720) es inconsistente con el nombre del modelo y no debe usarse para dimensionar hardware.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/TwIL-8B-Abliterated-Uncensored-i1-GGUF
- Modelo abliterated de origen: https://huggingface.co/Guilherme34/TwIL-8B-Abliterated-Uncensored
- Informacion sobre TwIL-8B de webAI: https://www.marktechpost.com/2026/11/04/webai-twil-8b-reasoning-model/
- Indice de modelos abliterated: https://www.abliteratedmodels.org/

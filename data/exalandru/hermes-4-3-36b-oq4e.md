# exalandru/Hermes-4.3-36B-oQ4e

## Resumen

Hermes-4.3-36B-oQ4e es una cuantización mixta de precisión del modelo NousResearch/Hermes-4.3-36B, publicada por el usuario exalandru. El modelo base es un transformer denso de 36.151 millones de parámetros (36,15B) entrenado por NousResearch, orientado a instrucciones, razonamiento y uso conversacional. Esta versión concreta aplica la herramienta oQ (oMLX v0.8.4) para generar pesos en formato MLX, pensados para ejecución en hardware Apple Silicon.

El interés de esta ficha radica en que permite ejecutar un modelo de 36B en equipos con memoria unificada relativamente limitada, gracias a una cuantización mixta que asigna distintos niveles de bits por tensor (4, 5, 6 y 8 bits) en lugar de aplicar un único esquema uniforme. El checkpoint completo ocupa 20,203 GiB y promedia 4,800 bits por peso, un equilibrio entre calidad y tamaño que no suele ofrecer una cuantización 4-bit estándar.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial. No obstante, la información pública disponible sobre esta publicación es muy escasa: no hay pipeline declarado, no se especifican idiomas soportados y no se han publicado benchmarks específicos de esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de NousResearch/Hermes-4.3-36B); detalles internos no disponibles |
| Parametros totales | 36.151.104.512 (36,15B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ (oMLX v0.8.4): affine 4-bit grupo 64 (79,243%), affine 5-bit grupo 64 (15,909%), affine 6-bit grupo 64 (2,647%), affine 8-bit grupo 64 (2,197%), BF16 (0,004%); media efectiva 4,800 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); tamano del repo 21,7 GB (20,203 GiB de pesos) |

## Arquitectura y entrenamiento

El modelo base es NousResearch/Hermes-4.3-36B, un transformer denso de 36,15B parametros. La model card de esta publicacion no detalla la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion, uso de GQA o MLA), los datos de entrenamiento (numero de tokens, composicion del corpus) ni las etapas de alineacion (SFT, RLHF, DPO). Esa informacion corresponderia a la model card del modelo base, que no se incluye en la informacion proporcionada.

La innovacion tecnica de esta publicacion es la cuantizacion mixta con oQ (oMLX v0.8.4). En lugar de aplicar un unico esquema de 4 bits, el algoritmo asigna precision variable por tensor: la mayor parte del peso (79,243%) queda en 4 bits, un 15,909% en 5 bits, un 2,647% en 6 bits y un 2,197% en 8 bits, con un residuo minimo en BF16. El resultado es un checkpoint de 20,203 GiB con una media efectiva de 4,800 bits por peso, lo que preserva con mayor fidelidad los tensores sensibles a la cuantizacion (habitualmente capas de atencion y proyecciones criticas) frente a una cuantizacion 4-bit uniforme.

## Capacidades

- Generacion de texto e instrucciones: el modelo base esta orientado a seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y matematicas: capacidades heredadas del modelo base Hermes-4.3; no se dispone de evaluaciones especificas de esta cuantizacion.
- Generacion de codigo: el modelo base esta entrenado para tareas de programacion; el nivel de degradacion introducido por la cuantizacion no esta documentado.
- Tool calling / function calling: no confirmado en la informacion disponible para esta publicacion.
- Agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ejecucion en Apple Silicon: capacidad practica diferencial de esta publicacion, al estar empaquetada en formato MLX.

## Casos de uso

- Asistente conversacional local en Mac: el checkpoint de 20,203 GiB encaja en equipos Apple Silicon con 24 GB o 32 GB de memoria unificada, permitiendo un asistente privado sin conexion a servicios externos.
- Prototipado de agentes en escritorio: al ejecutarse con MLX sobre macOS, se puede integrar en herramientas locales de automatizacion y scripting sin depender de GPU dedicadas.
- Desarrollo y revision de codigo en local: un modelo de 36B ofrece mayor capacidad que alternativas de 7B-13B para tareas de programacion, y la cuantizacion mixta reduce la perdida de calidad respecto a un 4-bit uniforme.
- Procesamiento de documentos confidenciales: al ejecutarse en hardware propio, evita enviar datos sensibles a APIs de terceros, lo que resulta adecuado para entornos con requisitos de privacidad.
- Evaluacion comparativa de cuantizaciones: util como punto de referencia para medir la degradacion de un modelo de 36B al pasar de BF16 a 4,8 bits efectivos en tareas de razonamiento y generacion.
- Experimentacion academica en investigacion de eficiencia: permite estudiar el impacto de la asignacion no uniforme de bits por tensor en la calidad final del modelo.
- Despliegue en estaciones de trabajo Mac para generacion de contenido: redaccion asistida, resumenes y reescritura con un modelo de mayor tamano que los habituales en equipos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta publicacion solo documenta la distribucion de bits y el tamano del checkpoint; no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 21-22 GB para cargar los pesos (20,203 GiB) mas overhead de contexto y activaciones; en la practica se recomienda un minimo de 24 GB y, preferiblemente, 32 GB o mas.
- Hardware objetivo: Apple Silicon (serie M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra) por el formato MLX; no es compatible de forma nativa con CUDA.
- GPU dedicadas: no aplica para este checkpoint en su formato actual; para NVIDIA habria que recurrir a una version GGUF o a los pesos originales del modelo base.
- Cabe en GPU de consumo: en el ecosistema Apple, si en equipos con 32 GB o 64 GB de memoria unificada; en NVIDIA consumer (RTX 4090 con 24 GB) requeriria una cuantizacion adicional o descarga por capas.
- Opciones de despliegue: MLX (mlx-lm) es la via natural; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Hermes-4.3-36B-oQ4e (esta publicacion) | 36,15B | No disponible | Mixta 4,800 bits/peso | Apache 2.0 | MLX |
| NousResearch/Hermes-4.3-36B (base) | 36,15B | No disponible | BF16 | Apache 2.0 | safetensors |
| Cuantizacion 4-bit uniforme del mismo base | 36,15B | No disponible | 4 bits/peso | Apache 2.0 | Segun herramienta |
| Modelos densos de ~30-40B en formato GGUF | ~30-40B | Variable | 4-8 bits | Variable | GGUF |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible, ya que no se han publicado benchmarks de esta cuantizacion ni del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: no evaluado para esta cuantizacion; es un riesgo inherente a los modelos de lenguaje de esta escala.
- Degradacion por cuantizacion: la cuantizacion mixta a 4,800 bits/peso puede introducir perdida de calidad frente al BF16 original, especialmente en tareas de razonamiento complejo y matematicas; no se han publicado mediciones.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados en esta publicacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Compatibilidad: el formato MLX limita el uso a hardware Apple Silicon; no es directamente portable a CUDA sin reconversion.
- Madurez de la publicacion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de validacion por la comunidad.
- Fecha de creacion: la publicacion figura con fecha de 2026-11-27, lo que conviene contrastar antes de adoptarla en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exalandru/Hermes-4.3-36B-oQ4e
- Modelo base: https://huggingface.co/NousResearch/Hermes-4.3-36B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX: https://github.com/ml-explore/mlx

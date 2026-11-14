# mradermacher/samantha-mistral-instruct-7b-GGUF

## Resumen

samantha-mistral-instruct-7b-GGUF es una coleccion de cuantizaciones estáticas en formato GGUF del modelo QuixiAI/samantha-mistral-instruct-7b, publicada por el usuario mradermacher. El modelo original es un ajuste fino de tipo instruct sobre una base Mistral de 7.000 millones de parametros, orientado a conversacion en ingles. Esta publicacion no introduce cambios en los pesos mas alla de la cuantizacion: su valor esta en ofrecer variantes de 2,8 GB a 14,6 GB para facilitar el despliegue en hardware modesto mediante llama.cpp y derivados.

El modelo base cuenta con 7.241.732.096 parametros segun los tensores safetensors, y la licencia declarada es Apache 2.0. La model card del cuantizador no aporta informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de evaluacion, por lo que muchos de los datos tecnicos de esta ficha figuran como no disponibles.

La relevancia de esta publicacion es practica: permite ejecutar un modelo conversacional de 7B en CPU o en GPUs de consumo con cuantizaciones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB), y ofrece tambien variantes imatrix en un repositorio hermano para quienes priorizan calidad por tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral 7B, segun el nombre y el modelo base) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de 7B, presumiblemente basado en Mistral 7B, ajustado para instrucciones por QuixiAI. La model card del repositorio de cuantizacion no documenta el proceso de entrenamiento: no se indican el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se detalla si el ajuste fino incorpora tecnicas adicionales como decodificacion especulativa o atencion lineal.

La aportacion de mradermacher se limita al proceso de cuantizacion: convierte los pesos originales en formato HF a GGUF y genera variantes estaticas con distintos niveles de compresion, desde Q2_K (2,8 GB) hasta F16 (14,6 GB). El autor indica que las cuantizaciones ponderadas con imatrix, de mayor calidad, se publican por separado en el repositorio samantha-mistral-instruct-7b-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instruct.
- Razonamiento basico y respuesta a preguntas de conocimiento general, condicionado por el tamano de 7B.
- Generacion de codigo y matematicas a nivel basico-intermedio, sin datos de evaluacion publicados.
- Soporte de conversaciones multi-turno mediante plantilla de chat (formato no documentado en la model card).
- Capacidades multilingues limitadas al ingles segun los metadatos.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantizacion Q4_K_M (4,5 GB) para mantener dialogos multi-turno en un portatil con GPU de consumo, sin depender de servicios en la nube.
- Prototipado rapido de chatbots: la variedad de cuantizaciones permite empezar con Q2_K (2,8 GB) en equipos con poca memoria y escalar a Q5_K_M o Q6_K cuando se valide la calidad.
- Generacion de texto y resumenes en ingles: util para tareas de redaccion asistida en entornos con requisitos de privacidad, ya que la inferencia es completamente local.
- Educacion y experimentacion: sirve como modelo de referencia para comparar el impacto de distintas cuantizaciones en la perplejidad y la calidad de salida, dado el amplio catalogo de variantes.
- Filtrado y clasificacion de texto: con prompts adecuados puede etiquetar o categorizar documentos en ingles en pipelines por lotes ejecutados en CPU.
- Evaluacion de infraestructura: el rango de tamanos (2,8 a 14,6 GB) permite medir throughput y latencia en distintos hardware antes de comprometerse con un modelo mayor.
- Base para ajuste fino adicional: al estar bajo licencia Apache 2.0, los pesos pueden reutilizarse y modificarse para tareas especificas, aunque el formato GGUF no es el ideal para reentrenamiento (habria que partir del modelo base en safetensors).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo mas el contexto. Q4_K_M (4,5 GB) requiere en torno a 5-6 GB con contexto moderado; Q8_0 (7,8 GB) requiere unos 9-10 GB; F16 (14,6 GB) requiere 16 GB o mas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones mayores; A100 o H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si. Q4_K_M y Q5_K_M funcionan en GPUs de 8 GB; Q2_K y Q3_K en GPUs de 4-6 GB; las variantes Q6_K y Q8_0 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runtimes compatibles con GGUF. El repositorio tambien declara compatibilidad con endpoints (tag endpoints_compatible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| samantha-mistral-instruct-7b-GGUF | 7,24B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas; sin benchmarks publicados |
| Mistral-7B-Instruct-v0.2 (GGUF) | 7,24B | 32k (segun documentacion de Mistral) | Apache 2.0 | GGUF | Base ampliamente evaluada y con ecosistema maduro |
| Zephyr-7B-beta (GGUF) | 7,24B | 32k (segun documentacion) | MIT | GGUF | Ajuste DPO con benchmarks publicos |
| Llama-3.1-8B-Instruct (GGUF) | 8,03B | 128k (segun documentacion de Meta) | Llama 3.1 Community License | GGUF | Mayor contexto y rendimiento, con licencia mas restrictiva |

La comparacion se basa en caracteristicas publicas de cada familia; no se dispone de datos de rendimiento especificos de samantha-mistral-instruct-7b para contrastar.

## Limitaciones y advertencias

- No hay informacion publicada sobre sesgos del ajuste fino; al derivar de Mistral 7B, es previsible que herede sesgos presentes en los datos web de entrenamiento.
- Riesgo de alucinacion propio de un modelo de 7B sin evaluacion publicada; no debe usarse como fuente de verdad sin verificacion.
- Idioma limitado al ingles segun los metadatos; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada en la model card; conviene asumir valores conservadores hasta verificarlo.
- Aunque la licencia es Apache 2.0, el uso comercial debe validarse contra la licencia del modelo base original (QuixiAI/samantha-mistral-instruct-7b) y, en ultima instancia, de Mistral 7B.
- Las cuantizaciones Q2_K y Q3_K degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El repositorio pesa 63,9 GB en total; descargar solo el archivo de la cuantizacion deseada.
- La model card no documenta la plantilla de chat; es necesario consultar el repositorio del modelo base para aplicarla correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/samantha-mistral-instruct-7b-GGUF
- Modelo base: https://huggingface.co/QuixiAI/samantha-mistral-instruct-7b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/samantha-mistral-instruct-7b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#samantha-mistral-instruct-7b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

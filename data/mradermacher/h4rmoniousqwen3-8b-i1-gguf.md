# mradermacher/H4rmoniousQwen3-8B-i1-GGUF

## Resumen

H4rmoniousQwen3-8B-i1-GGUF es una distribucion de cuantizaciones GGUF del modelo neovalle/H4rmoniousQwen3-8B, publicada por mradermacher. El modelo subyacente es un fine-tuning de Qwen3-8B orientado a ecolinguistica y ecosofia (etiquetas "ecolinguistics", "ecosophy", "h4rmony"), entrenado mediante SFT y DPO sobre los datasets neovalle/h4rmony2.0-sft y neovalle/h4rmony2.0-dpo. El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino un conjunto de cuantizaciones en formato GGUF generadas con imatrix (metodo i1), pensadas para inferencia local con llama.cpp y derivados.

La relevancia de esta ficha es practica: permite ejecutar un modelo de 8.190 millones de parametros en hardware de consumo, desde tarjetas con 8 GB de VRAM hasta configuraciones con CPU y RAM, eligiendo entre 25 variantes de cuantizacion que van de 2,2 GB (i1-IQ1_S) a 6,8 GB (i1-Q6_K). Al estar construido sobre Qwen3, hereda la arquitectura transformer densa de la familia Qwen3, aunque la model card no detalla la longitud de contexto ni la composicion exacta del entrenamiento.

La licencia es Apache 2.0, lo que facilita el uso comercial, y el autor del modelo base declara unicamente el idioma ingles. No se han publicado resultados de benchmarks en la informacion disponible, por lo que la evaluacion cualitativa debe hacerse por prueba directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen3-8B); detalles no disponibles en la model card |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien se ofrece el fichero imatrix |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Qwen3-8B, una arquitectura transformer densa de la familia Qwen3. Sobre esa base, neovalle aplico un pipeline de dos fases: primero SFT (supervised fine-tuning) con el dataset neovalle/h4rmony2.0-sft y despues DPO (direct preference optimization) con neovalle/h4rmony2.0-dpo, segun las etiquetas y metadatos de la model card. El objetivo declarado del ajuste es alinear el modelo con principios de ecolinguistica y ecosofia, un dominio poco habitual en fine-tunings publicos.

La model card del repositorio de cuantizacion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni hiperparametros. Las cuantizaciones i1 se han generado con un fichero imatrix (H4rmoniousQwen3-8B.imatrix.gguf, 0,1 GB) que guia la asignacion de bits por tensor, lo que segun el autor suele mejorar la perplejidad frente a cuantizaciones estaticas del mismo tamano. El repositorio incluye tambien una version con cuantizaciones estaticas en mradermacher/H4rmoniousQwen3-8B-GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen3-8B.
- Razonamiento y respuesta a instrucciones, reforzado mediante SFT y DPO.
- Enfoque tematico en ecolinguistica y ecosofia: el ajuste busca un estilo de respuesta alineado con estos marcos.
- Capacidades multilingues: la model card solo declara ingles; el resto de idiomas no esta garantizado.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo "thinking" o razonamiento extendido: no documentado; no se puede confirmar que se conserve el modo de Qwen3.
- Capacidades de vision o audio: no disponibles (modelo solo texto).

## Casos de uso

- Analisis de discurso ambiental: usar el modelo para revisar y reescribir textos sobre cambio climatico con criterios de ecolinguistica, aprovechando el ajuste especifico del modelo base.
- Asistente editorial de divulgacion ecologica: generar borradores y variantes de articulos con un tono coherente con la ecosofia, en local y sin dependencia de API.
- Prototipado de chatbots tematicos: desplegar con llama.cpp u Ollama una cuantizacion i1-Q4_K_M (5,1 GB) en una estacion de trabajo para conversaciones multi-turno sobre sostenibilidad.
- Investigacion en humanidades digitales: comparar respuestas del modelo ajustado frente al Qwen3-8B original para estudiar el efecto del DPO en el estilo y los valores expresados.
- Educacion y materiales docentes: generar ejercicios, resumenes y preguntas de discusion sobre etica ambiental a partir de documentos largos, ajustando la cuantizacion al hardware disponible.
- Evaluacion de cuantizaciones: usar las 25 variantes publicadas para medir la degradacion de calidad (de IQ1_S a Q6_K) en una tarea concreta antes de fijar una version para produccion.
- Inferencia en CPU sin GPU: con i1-IQ2_M (3,2 GB) o i1-Q3_K_M (4,2 GB) se puede ejecutar en portatiles con 8-16 GB de RAM para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (tamano del fichero GGUF): 2,2 GB (i1-IQ1_S), 3,2 GB (i1-IQ2_M), 4,2 GB (i1-Q3_K_M), 4,9 GB (i1-Q4_K_S), 5,1 GB (i1-Q4_K_M), 6,0 GB (i1-Q5_K_M), 6,8 GB (i1-Q6_K). Hay que sumar el espacio de contexto KV cache, que depende del contexto configurado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para despliegues con contexto largo o mayor concurrencia.
- Cabe en GPU de consumo: si. Con 8 GB de VRAM se pueden usar cuantizaciones hasta Q4_K_M con contexto moderado; con 12-16 GB, Q5_K_M y Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (la etiqueta endpoints_compatible aparece en el repositorio). vLLM y TGI no cargan GGUF de forma nativa en todas sus versiones; para esos motores conviene el modelo original en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| H4rmoniousQwen3-8B-i1-GGUF (este) | 8,19 B | No disponible | Apache 2.0 | GGUF (25 cuantizaciones) | Fine-tuning tematico en ecolinguistica/ecosofia, solo ingles declarado |
| neovalle/H4rmoniousQwen3-8B | 8,19 B | No disponible | Apache 2.0 | Safetensors | Modelo base sin cuantizar; necesario para vLLM/TGI y para generar nuevas cuantizaciones |
| mradermacher/H4rmoniousQwen3-8B-GGUF | 8,19 B | No disponible | Apache 2.0 | GGUF (cuantizaciones estaticas) | Alternativa sin imatrix; el autor recomienda i1 para calidad por tamano |
| Qwen3-8B (modelo de origen de la familia) | 8 B aprox. | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Sin el ajuste tematico; referencia para medir el efecto del SFT/DPO |

## Limitaciones y advertencias

- Sesgos: al ser un fine-tuning orientado a ecosofia, puede presentar un sesgo de encuadre hacia posiciones ecologistas concretas; no se documentan evaluaciones de sesgo.
- Alucinacion: no hay benchmarks publicados que cuantifiquen la tasa de alucinacion; el ajuste con DPO no garantiza veracidad factual.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta validado y puede degradarse respecto a Qwen3-8B.
- Contexto: la longitud de contexto no figura en la informacion disponible; conviene verificarla en el modelo base antes de disenar aplicaciones con documentos largos.
- Cuantizaciones agresivas: las variantes IQ1_S, IQ1_M, IQ2_XXS y Q2_K_S degradan la calidad de forma notable segun las notas del propio autor ("for the desperate", "very low quality"); para produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones del modelo base y de los datasets de entrenamiento.
- Produccion: al ser una cuantizacion, los resultados pueden diferir de los del modelo en safetensors; valide con su propio conjunto de evaluacion antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/H4rmoniousQwen3-8B-i1-GGUF
- Modelo base: https://huggingface.co/neovalle/H4rmoniousQwen3-8B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/H4rmoniousQwen3-8B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#H4rmoniousQwen3-8B-i1-GGUF
- Dataset SFT: https://huggingface.co/datasets/neovalle/h4rmony2.0-sft
- Dataset DPO: https://huggingface.co/datasets/neovalle/h4rmony2.0-dpo
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests

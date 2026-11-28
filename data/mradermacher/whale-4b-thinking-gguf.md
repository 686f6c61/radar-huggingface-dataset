# mradermacher/Whale-4B-Thinking-GGUF

## Resumen

Whale-4B-Thinking-GGUF es la version cuantizada en formato GGUF del modelo roskosmos19/Orca-4B-Thinking, publicada por mradermacher, un conocido creador de cuantizaciones para llama.cpp y ecosistemas compatibles. El modelo base es un transformer denso de aproximadamente 4.022 millones de parametros (4B) afinado para razonamiento explicito con cadenas de pensamiento (chain-of-thought), inspirado en la estela de DeepSeek-R1 y Qwen3. Su proposito es ofrecer capacidades de razonamiento paso a paso en un tamano que pueda ejecutarse en hardware de consumo.

La relevancia de esta publicacion es practica: mradermacher distribuye el modelo en once cuantizaciones estaticas que van desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite desplegarlo desde portatiles modestos hasta estaciones de trabajo con GPU. El modelo esta liberado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales, y declara soporte para ingles, aleman, espanol, frances y chino.

Al tratarse de una cuantizacion y no de un modelo original, la ficha debe leerse conjuntamente con la del modelo base: las capacidades, el entrenamiento y las limitaciones provienen de roskosmos19/Orca-4B-Thinking, mientras que esta publicacion anade los formatos de pesos y las opciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla la variante exacta en la informacion disponible) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles, aleman, espanol, frances, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 36,4 GB (incluye todas las cuantizaciones) |
| Modelo base | roskosmos19/Orca-4B-Thinking |
| Libreria declarada | transformers (etiqueta), ejecutable con llama.cpp |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de identificarlo como un transformer de aproximadamente 4B parametros. Las etiquetas del repositorio lo vinculan a la familia Qwen3 y a la tradicion de razonamiento de DeepSeek-R1, lo que sugiere una arquitectura decoder-only convencional con atencion por capas y un modo de "pensamiento" que genera cadenas de razonamiento antes de la respuesta final. No se especifican el numero de capas, las dimensiones ocultas ni el mecanismo de atencion exacto.

En cuanto al entrenamiento, la model card declara el uso de dos conjuntos de datos: open-thoughts/OpenThoughts-114k y open-r1/Mixture-of-Thoughts, ambos orientados a destilacion de razonamiento y cadenas de pensamiento. No se indica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Esta publicacion, en si misma, no entrena el modelo: solo lo convierte a GGUF y lo cuantiza.

## Capacidades

- Generacion de texto conversacional en formato multi-turno.
- Razonamiento explicito con cadenas de pensamiento (thinking mode), heredado de la estirpe DeepSeek-R1 y Qwen3.
- Resolucion de problemas de matematicas y logica paso a paso, segun el enfasis de los datasets de entrenamiento (OpenThoughts y Mixture-of-Thoughts).
- Generacion de codigo y explicaciones tecnicas, aunque no se documenta un benchmark especifico que lo cuantifique.
- Capacidades multilingues declaradas en ingles, aleman, espanol, frances y chino.
- Soporte de conversacion con plantillas de chat (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- No se documenta soporte de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistente de razonamiento en local para desarrolladores: con la cuantizacion Q4_K_M (2,6 GB) el modelo cabe en una GPU de consumo de 8 GB y permite probar flujos de chain-of-thought sin depender de APIs externas.
- Prototipado de tutores de matematicas: el modelo puede desglosar problemas paso a paso y explicar el razonamiento, util para generar material didactico o validar ejercicios en un entorno controlado.
- Generacion y revision de codigo en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp u Ollama, el codigo no sale de la maquina, lo que encaja en equipos con politicas estrictas de datos.
- Traduccion y asistencia multilingue entre espanol, ingles, frances, aleman y chino: el modelo declara estos cinco idiomas, lo que permite tareas de parafraseo y adaptacion de textos en esos pares linguisticos.
- Experimentacion academica con cuantizaciones: investigadores pueden comparar la degradacion de calidad entre Q2_K, IQ4_XS, Q4_K_M y Q8_0 sobre las mismas tareas de razonamiento, usando los ficheros publicados.
- Despliegue en dispositivos con poca VRAM: la cuantizacion Q2_K (1,8 GB) permite ejecutar el modelo en portatiles sin GPU dedicada mediante llama.cpp en CPU, adecuado para demos y pruebas de concepto.
- Integracion en pipelines de evaluacion automatizada: la etiqueta endpoints_compatible sugiere que puede servirse detras de una API compatible con OpenAI para comparar respuestas de razonamiento frente a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de la cuantizacion ni los metadatos del repositorio incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones, ni para el modelo base ni para las versiones cuantizadas.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K 1,8 GB; Q3_K_S 2,0 GB; Q3_K_M 2,2 GB; Q3_K_L 2,3 GB; IQ4_XS 2,4 GB; Q4_K_S 2,5 GB; Q4_K_M 2,6 GB; Q5_K_S 2,9 GB; Q5_K_M 3,0 GB; Q6_K 3,4 GB; Q8_0 4,4 GB; f16 8,2 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para las cuantizaciones Q4 y Q5 (RTX 3060, RTX 4060, RTX 2070). Para Q8_0 y f16 se recomienda 8-12 GB (RTX 4070, RTX 3080, RTX 4090) o GPUs de datacenter como A100 o H100 si se busca throughput alto con lotes grandes.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 8 GB o mas; f16 requiere 12 GB o mas para dejar margen al contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI si se dispone de la version sin cuantizar.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de 4B, se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Whale-4B-Thinking-GGUF | 4,0B | No disponible | Apache 2.0 | GGUF | Cuantizacion de Orca-4B-Thinking, enfocado a razonamiento |
| Qwen3-4B (referencia de familia) | 4B | No disponible en esta ficha | Apache 2.0 (segun familia Qwen) | safetensors, GGUF | Modelo base de la misma escala con modo thinking; no se dispone de comparacion numerica |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | No disponible en esta ficha | MIT (segun publicacion original) | safetensors, GGUF | Alternativa mas pequena de razonamiento destilado; menor capacidad pero menor huella |
| Orca-4B-Thinking (modelo base) | 4,0B | No disponible | Apache 2.0 | safetensors | Version sin cuantizar; misma calidad teorica que esta publicacion en f16 |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: como todo modelo generativo de 4B, puede producir razonamientos plausibles pero incorrectos, especialmente en matematicas y codigo; el modo thinking no garantiza la veracidad de la cadena.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible; los datasets de razonamiento destilados pueden heredar sesgos de los modelos profesor.
- Contexto e idioma: se desconoce la longitud de contexto soportada; el soporte multilingue declarado se limita a cinco idiomas y no hay evaluacion de calidad por idioma.
- Cuantizacion: las versiones Q2_K y Q3_K_M degradan la calidad de forma notable segun las propias notas del autor ("lower quality" en Q3_K_M); para produccion se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datasets de entrenamiento (OpenThoughts y Mixture-of-Thoughts) por si imponen condiciones adicionales.
- Produccion: no hay benchmarks publicados, por lo que no se puede garantizar un nivel de rendimiento concreto; se recomienda evaluar en el dominio propio antes de desplegar.
- Fecha de creacion inusual (2026-09-22) en los metadatos: conviene contrastar la vigencia del repositorio antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Whale-4B-Thinking-GGUF
- Modelo base: https://huggingface.co/roskosmos19/Orca-4B-Thinking
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Whale-4B-Thinking-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Whale-4B-Thinking-GGUF
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset Mixture-of-Thoughts: https://huggingface.co/datasets/open-r1/Mixture-of-Thoughts
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests

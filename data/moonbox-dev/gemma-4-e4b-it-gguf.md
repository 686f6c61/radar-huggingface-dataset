# moonbox-dev/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B IT es un modelo multimodal any-to-any desarrollado por Google que acepta y genera texto, imagen y audio. Esta ficha cubre la distribucion GGUF del mismo, publicada por moonbox-dev para su uso con llama.cpp en Metal, CUDA, Vulkan y CPU, lo que permite ejecutarlo en hardware de consumo y en dispositivos sin aceleradores dedicados.

El modelo base declara 7.518.069.290 parametros totales y una tabla de embeddings por capa que concentra 2.8B valores, un detalle que condiciona fuertemente el tamano de las cuantizaciones: en Q5_K_M y Q4_K_M llama.cpp mantiene ambas tablas de embeddings a 6 bits, de modo que 4.1B de los 7.5B parametros permanecen en 6 bits y solo 3.4B bajan a 5 o 4 bits. El repositorio incluye el decoder en varias precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) mas un unico fichero `mmproj` que contiene los encoders de vision y audio.

La relevancia de esta publicacion es practica: ofrece artefactos GGUF verificados con hashes sha256, una metodologia de evaluacion de cuantizacion explicita (divergencia KL frente a BF16 y coincidencia del token mas probable) y una receta de conversion de bajo consumo de memoria para la tabla de embeddings por capa. Todo ello bajo licencia apache-2.0, con el matiz de que los pesos derivan del modelo original de Google y quedan sujetos a su licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (decoder con tabla de embeddings por capa, encoder de vision y encoder de audio en fichero `mmproj` separado) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (esta ultima marcada como experimental por el autor) |
| Idiomas soportados | no disponible (los prompts de evaluacion del autor son 8 en ingles y 4 en chino) |
| Licencia | apache-2.0 (pesos derivados de google/gemma-4-E4B-it, sujetos a la licencia de Gemma 4) |
| Formato de pesos | GGUF (llama.cpp), mas `mmproj-gemma-4-e4b-it-F16.gguf` para vision y audio |

Tabla de ficheros publicados:

| Precision | Fichero | Tamano | Rendimiento declarado |
|---|---|---|---|
| F16 | `gemma-4-e4b-it-F16.gguf` | 15.05 GB | pesos iguales a BF16; KL de chat 0.00001, mismo token top 100.0 % |
| BF16 | `gemma-4-e4b-it-BF16.gguf` | 15.05 GB | pesos originales; referencia del test |
| Q8_0 | `gemma-4-e4b-it-Q8_0.gguf` | 8.03 GB | pesos 0.56 % respecto a BF16; KL 0.0006, mismo token top 99.6 % |
| Q6_K | `gemma-4-e4b-it-Q6_K.gguf` | 6.22 GB | pesos 1.86 % respecto a BF16; KL 0.0020, mismo token top 99.4 % (con importance matrix) |
| Q5_K_M | no se detalla tamano | no disponible | pasa el criterio del autor (KL <= 0.01) |
| Q4_K_M | no se detalla tamano | no disponible | KL 0.0181; marcada como experimental |
| Encoder | `mmproj-gemma-4-e4b-it-F16.gguf` | 990.4 MB | compartido por todas las precisiones |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal any-to-any: un decoder de lenguaje con tabla de embeddings por capa, acompanado de un encoder de vision y un encoder de audio con sus proyecciones. En esta distribucion GGUF el decoder va en el fichero del modelo y los encoders en el `mmproj`, que solo es necesario cuando se envian imagenes o audio. El autor documenta que la tabla de embeddings por capa contiene 2.8B valores y que se convirtio en fragmentos de filas para ajustarse a la memoria de la maquina de conversion, con los mismos bytes que el conversor estandar (receta `lab/recipes/gguf/convert_gemma4_lowmem.py`).

La conversion se realizo desde google/gemma-4-E4B-it en la revision `4ecc2ba63b` con llama.cpp `b12621`: `convert_hf_to_gguf.py` genero BF16 y el `mmproj`, y `llama-quantize` produjo el resto de precisiones con sus mezclas estandar. Q6_K, Q5_K_M y Q4_K_M se cuantizaron con importance matrix calculada con `llama-imatrix` sobre 200 x 512 tokens de WikiText-2 train usando el fichero Q8_0; F16 y Q8_0 no la usan. La verificacion tensor a tensor indica que 2117 de 2130 tensores coinciden byte a byte con el checkpoint original; los 13 restantes se reescriben deliberadamente en el conversor de llama.cpp (12 escalas por dimension del encoder de audio almacenadas como softplus(x) y la proyeccion de parches de imagen reordenada al orden de pixeles de llama.cpp), y cada uno coincide con esa formula. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante `/v1/chat/completions` en `llama-server`.
- Entrada de imagen: el `mmproj` aporta el encoder de vision y las proyecciones; se envian como partes `image_url`.
- Entrada de audio: el mismo `mmproj` incluye el encoder de audio; se envia como parte `input_audio`.
- Salida any-to-any segun el pipeline declarado del modelo base (`any-to-any`).
- Modo de razonamiento: el modelo puede pensar antes de responder y `llama-server` devuelve ese contenido como `reasoning_content`.
- Multilingue: no se detalla la lista de idiomas; la evaluacion del autor usa prompts en ingles y chino.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatil: con el fichero Q6_K (6.22 GB) y `-ngl 99` en una GPU consumer, se puede levantar un `llama-server` que atienda chat por HTTP sin depender de la nube; el autor valida el flujo en una RTX 3080 Laptop.
- Descripcion de imagenes en el dispositivo: enviando una foto como parte `image_url` junto con el `mmproj`, el modelo describe el contenido; el smoke test del autor identifica un teclado, un raton Dell y unos auriculares Sony con cable sobre una mesa de madera.
- Transcripcion y comprension de audio: con la parte `input_audio`, el modelo transcribe voz; el smoke test reproduce palabra por palabra un clip de LibriSpeech.
- Respuestas con razonamiento visible: al devolver `reasoning_content`, encaja en interfaces que separan el razonamiento del texto final, util para depuracion de prompts y para flujos donde se quiere auditar el proceso.
- Despliegue en entornos sin GPU: los ficheros GGUF funcionan en CPU, lo que permite servir el modelo en servidores sin acelerador o en equipos de desarrollo modestos, eligiendo Q4_K_M o Q5_K_M segun memoria disponible.
- Evaluacion de cuantizaciones en pipelines propios: los hashes sha256 y la metodologia KL frente a BF16 permiten reproducir la comparativa y decidir que precision usar en produccion con un criterio medible.
- Prototipado de aplicaciones multimodales: al unificar texto, imagen y audio en un solo modelo y un solo servidor compatible con la API de chat completions, se simplifica la integracion en prototipos que antes requerian varios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo publica una evaluacion interna de fidelidad de cuantizacion: 12 prompts cortos (8 en ingles, 4 en chino) en la plantilla de chat del modelo, respuesta de referencia del fichero BF16 con decodificacion greedy hasta 64 tokens (725 en total), y evaluacion teacher-forced del resto de ficheros a traves de `llama-server` en CUDA sobre una RTX 3080 Laptop.

| Fichero | KL frente a BF16 (top 64) | Mismo token top | Veredicto del autor |
|---|---|---|---|
| F16 | 0.00001 | 100.0 % | pasa |
| Q8_0 | 0.0006 | 99.6 % | pasa |
| Q6_K | 0.0020 | 99.4 % | pasa |
| Q5_K_M | no disponible | no disponible | pasa (KL <= 0.01) |
| Q4_K_M | 0.0181 | no disponible | experimental |

El criterio de aprobado del autor es KL <= 0.01 nats y coincidencia del token top >= 90 %.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas el `mmproj` (990.4 MB) cuando se usan imagenes o audio, mas overhead de contexto y cache KV. Referencias: F16/BF16 15.05 GB, Q8_0 8.03 GB, Q6_K 6.22 GB; Q5_K_M y Q4_K_M no publican tamano, aunque el autor advierte que no son mucho mas pequenos que Q6_K por mantener 4.1B parametros de embeddings a 6 bits.
- GPU recomendadas: el autor valida en una RTX 3080 Laptop (CUDA). Para Q8_0 o superiores conviene una GPU con 12-16 GB o mas; para Q6_K, 8 GB de VRAM pueden ser justos y 10-12 GB dejan margen para contexto. No se detallan pruebas en A100, H100 ni RTX 4090.
- GPU consumer: si, el modelo cabe en tarjetas consumer. Q6_K (6.22 GB) es la opcion razonable para 8 GB de VRAM con contexto moderado; Q4_K_M apunta a equipos de 6-8 GB, con la advertencia de que es experimental.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) en Metal, CUDA, Vulkan y CPU, con `b12621` o superior. El repositorio se marca como `endpoints_compatible`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo indica que la evaluacion se ejecuto en una RTX 3080 Laptop sin publicar cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B IT GGUF (esta ficha) | 7.52B | no disponible | texto, imagen, audio (any-to-any) | apache-2.0 | GGUF |
| google/gemma-4-E4B-it | 7.52B | no disponible | texto, imagen, audio (any-to-any) | licencia de Gemma 4 | safetensors |
| Alternativas de mismo tamano y tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables que permitan una comparacion cuantitativa; la unica comparacion documentada es interna, entre las distintas precisiones del propio modelo.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M queda marcada como experimental por el propio autor (KL 0.0181, por encima del umbral de 0.01); no es recomendable para produccion sin validacion propia.
- Q5_K_M y Q4_K_M conservan ambas tablas de embeddings a 6 bits (4.1B de 7.5B parametros), por lo que su ahorro de memoria frente a Q6_K es limitado y puede no compensar la perdida de fidelidad.
- La evaluacion de cuantizacion se basa en solo 12 prompts cortos y 725 tokens de referencia, en ingles y chino; no cubre tareas de vision, audio, codigo ni contextos largos.
- No se detalla la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin probarlo.
- No se publica la lista de idiomas soportados ni evaluaciones multilingues mas alla de los prompts de la prueba interna.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; deben asumirse los del modelo base y validarse en el dominio de uso.
- La licencia declarada es apache-2.0, pero los pesos son derivados de google/gemma-4-E4B-it y el autor indica que la licencia del modelo original gobierna el uso de estos ficheros; conviene revisar los terminos de Gemma 4 antes de un uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo dia (26 de noviembre de 2026); es una publicacion muy reciente y poco contrastada por la comunidad.
- El modo de razonamiento puede aumentar la latencia y el consumo de tokens; el contenido llega en `reasoning_content` y la aplicacion cliente debe gestionarlo.
- Los encoders de vision y audio requieren cargar el `mmproj` ademas del fichero del modelo, lo que suma 990.4 MB de memoria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado en los tags (arxiv:2607.02770): https://arxiv.org/abs/2607.02770

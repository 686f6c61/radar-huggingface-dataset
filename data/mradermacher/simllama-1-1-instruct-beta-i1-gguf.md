# mradermacher/simllama-1.1-instruct-beta-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `simllama-1.1-instruct-beta`, desarrollado originalmente por simonko912 y convertido por mradermacher mediante el metodo i1 basado en imatrix. Se trata de un modelo de lenguaje pequeno (SLM) de 468.239.360 parametros, afinado para seguir instrucciones y mantener conversaciones, con soporte declarado unicamente en ingles y licencia Apache 2.0. La model card lo etiqueta como `slm` y `400m`, aunque el recuento real de parametros de los safetensors del modelo base es de 468 millones.

El interes de esta publicacion no esta en el modelo en si, sino en el formato: ofrece una bateria muy amplia de cuantizaciones GGUF (desde IQ1_S de 0,2 GB hasta Q6_K de 0,5 GB), lo que permite ejecutar el modelo en CPU, en GPUs de gama baja, en placas tipo Raspberry Pi o incluso en dispositivos moviles mediante llama.cpp. Es material de referencia para quien necesite un modelo instructivo de menos de 1 GB en disco para tareas simples o para prototipar pipelines de inferencia local.

Como contrapartida, el repo no incluye informacion sobre arquitectura interna, longitud de contexto, composicion exacta del dataset ni resultados de benchmarks, y a fecha de la ficha acumula 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni datos publicos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repo indican familia `llama` / `simllama`, coherente con un transformer decoder-only, pero no se detalla en la informacion proporcionada) |
| Parametros totales | 468.239.360 (recuento de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Existen ademas cuantizaciones estaticas en el repo `mradermacher/simllama-1.1-instruct-beta-GGUF` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye como pesos de transformers |
| Tamano del repositorio | 5,5 GB (todas las cuantizaciones juntas) |
| Rango de tamano por fichero | 0,2 GB (i1-IQ1_S) a 0,5 GB (i1-Q6_K) |
| Modelo base | simonko912/simllama-1.1-instruct-beta |
| Cuantizador | mradermacher (metodo i1 / imatrix) |
| Fecha de publicacion | 2026-09-16 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: no se detallan numero de capas, dimensiones ocultas, cabezas de atencion, tipo de atencion ni si incorpora algun mecanismo alternativo (SSM, atencion lineal, decodificacion especulativa). Los tags de HuggingFace lo clasifican como `llama`, `simllama`, `slm` y `400m`, lo que apunta a un transformer decoder-only de la familia LLaMA, pero se trata de una inferencia a partir de etiquetas, no de un dato confirmado en la documentacion facilitada. Tampoco se indica la longitud de contexto soportada ni el tokenizador empleado.

En cuanto a los datos, la model card declara el uso de los siguientes conjuntos: `HuggingFaceTB/smol-smoltalk`, `exnivo/tinybrain-instruct-sft-200k`, `OpenAssistant/oasst2`, `OpenAssistant/oasst1`, `drwlf/medra-thinking-768`, `togethercomputer/llama-instruct`, `interview-eval/MATH` y `RLAIF/mbpp`. Se trata de una mezcla tipica de SFT conversacional (SmolTalk, OASST, TinyBrain, llama-instruct) complementada con datos de matematicas (`interview-eval/MATH`) y de generacion de codigo (`RLAIF/mbpp`). No se especifica el numero de tokens de entrenamiento, la proporcion de cada dataset, ni si hubo fases posteriores de RLHF, DPO o RLAIF mas alla de lo que sugieren los propios nombres de los datasets. Tampoco se documenta ninguna innovacion tecnica en el proceso de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instruct (el tag `conversational` esta presente en el repo).
- Seguimiento de instrucciones derivado del entrenamiento SFT sobre mezclas tipo smol-smoltalk, tinybrain-instruct-sft-200k y llama-instruct.
- Nociones basicas de matematicas y de generacion de codigo, inferidas de la presencia de `interview-eval/MATH` y `RLAIF/mbpp` en los datos declarados; no hay evaluacion publicada que cuantifique este extremo.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado. El dataset `drwlf/medra-thinking-768` sugiere algun tipo de dato con trazas de razonamiento, pero no se especifica como se integra en la salida del modelo.
- Capacidades multilingues: no, el modelo declara unicamente `en` (ingles).
- Capacidades de vision, audio o multimodalidad: no disponibles.
- Modo "thinking" explicito: no documentado.
- El tag `endpoints_compatible` indica que el repo es compatible con el despliegue mediante Inference Endpoints de HuggingFace.

## Casos de uso

- Clasificacion y enrutado de texto en ingles en local: con cuantizaciones de 0,2-0,5 GB, el modelo puede ejecutarse en el mismo proceso que el resto del pipeline para etiquetar tickets, correos o comentarios, sin coste de API y sin enviar datos a terceros.
- Prototipado de asistentes conversacionales embebidos: al caber en menos de 1 GB de RAM/VRAM, permite validar la logica de un chatbot de soporte en ingles antes de migrar a un modelo mayor, usando llama.cpp u Ollama en una maquina de desarrollo.
- Preprocesado y normalizacion de datos para pipelines de NLP: reescritura de frases, generacion de variantes, resumenes muy cortos o extraccion de campos simples sobre grandes volumenes de texto, donde el coste por token de un modelo grande no esta justificado.
- Generacion de datos sinteticos de baja calidad supervisada: produccion de candidatos que despues se filtran y corrigen manualmente, por ejemplo para aumentar un conjunto de entrenamiento de un clasificador propio.
- Inferencia en el borde (edge) y dispositivos con recursos limitados: despliegue en Raspberry Pi, mini-PC o telefonos mediante llama.cpp, util para demos offline o entornos sin conectividad.
- Educacion y experimentacion: material didactico para estudiar el efecto de la cuantizacion i1 comparando IQ1/IQ2 frente a Q4_K_M o Q6_K con el mismo prompt, dado que el repo publica toda la escalera de cuantizaciones.
- Componente de sistemas de retrieval: uso como modelo de reformulacion de consultas o de resumen de fragmentos recuperados en arquitecturas RAG ligeras en ingles.
- Tareas de etiquetado con razonamiento corto: al existir datos con trazas de pensamiento en el entrenamiento declarado, puede probarse para generar justificaciones breves, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de evaluacion (MMLU, GSM8K, HumanEval ni similares), y el modelo acumula 0 descargas y 0 likes, por lo que tampoco existen evaluaciones independientes de la comunidad. No se deben asumir cifras procedentes de modelos de tamano similar.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente el tamano del fichero GGUF mas la cache KV. El quant mas pequeno, i1-IQ1_S, ocupa 0,2 GB; el recomendado por el autor para uso general, i1-Q4_K_M, ocupa 0,4 GB; el mayor, i1-Q6_K, ocupa 0,5 GB. En todos los casos el consumo se mantiene por debajo de 1-2 GB incluso con contextos moderados.
- GPU recomendadas: no se requiere GPU dedicada. Cabe sobradamente en cualquier GPU de consumo con al menos 2 GB, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060 y RTX 4090, donde el cuello de botella sera la velocidad de transferencia y no la memoria. Tambien funciona en iGPU (Intel Iris Xe, AMD Radeon integrada) y en CPU exclusivamente.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM y TGI no esta documentado para este repo y debe verificarse antes de usarlo; si se necesita un servidor de alto rendimiento con este modelo, la opcion natural es `llama-server`.
- Multi-partes: la model card advierte de que algunos ficheros pueden estar divididos y remite a los README de TheBloke para el procedimiento de concatenacion.
- Latencia y throughput: no disponible. No hay cifras publicadas de tokens por segundo ni de latencia para este repositorio.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus respectivas model cards publicas y no han sido verificados con la informacion proporcionada en esta ficha; se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|---|
| simllama-1.1-instruct-beta (i1-GGUF) | 468 M | no disponible | apache-2.0 | GGUF (i1 + estaticos) | en | no disponibles |
| SmolLM2-360M-Instruct | 362 M | 8.192 tokens (segun su model card) | apache-2.0 | safetensors, GGUF | en y otros | si, publicados por el autor |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens (segun su model card) | apache-2.0 | safetensors, GGUF | multilingue | si, publicados por el autor |
| TinyLlama-1.1B-Chat | 1.100 M | 2.048 tokens (segun su model card) | apache-2.0 | safetensors, GGUF | en | si, publicados por el autor |

Frente a estas alternativas, la ventaja del modelo aqui descrito es el rango extremo de cuantizaciones i1, que llega hasta IQ1_S en 0,2 GB, y la desventaja es la ausencia total de documentacion tecnica y de evaluaciones, ademas del soporte limitado a ingles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre mezclas de datos conversacionales publicos (OASST, smol-smoltalk, llama-instruct) es esperable heredar sesgos sociales y culturales de esas fuentes. No hay evaluacion de sesgo disponible.
- Riesgo de alucinacion: alto por diseno. Un modelo de 468 millones de parametros tiene una capacidad limitada de verificacion factual y no dispone de mecanismos de grounding; no debe usarse para responder consultas factuales sin supervision.
- Idioma: soporta unicamente ingles. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Contexto: se desconoce la ventana de contexto soportada. Cualquier caso de uso que dependa de conversaciones largas o documentos extensos requiere verificacion previa.
- Cuantizaciones de muy baja precision: los ficheros IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS y Q2_K degradan notablemente la calidad; el propio autor los etiqueta como "for the desperate" o "very low quality". Para uso real conviene IQ4_XS, Q4_K_M o Q5_K_M en adelante.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene conservar los avisos de atribucion y verificar que la licencia del modelo base `simonko912/simllama-1.1-instruct-beta` no imponga condiciones adicionales, ya que esta ficha solo confirma la licencia declarada en el repo de cuantizaciones.
- Madurez: el modelo se publica con el sufijo `beta`, tiene 0 descargas y 0 likes, y fue creado y actualizado en septiembre de 2026. No hay evidencia de uso en produccion ni de mantenimiento.
- El contenido de la model card original procede del autor del modelo y no ha sido validado de forma independiente; los nombres de los datasets indican la procedencia de los datos, pero no se especifica como se combinaron ni con que hiperparametros.
- Para produccion: dado el tamano y la falta de evaluacion, es razonable tratarlo como componente auxiliar (clasificacion, preprocesado, prototipos) y no como generador principal en un sistema orientado al usuario.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/simllama-1.1-instruct-beta-i1-GGUF
- Modelo base: https://huggingface.co/simonko912/simllama-1.1-instruct-beta
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/simllama-1.1-instruct-beta-GGUF
- Pagina de resumen y descargas de mradermacher para este modelo: https://hf.tst.eu/model#simllama-1.1-instruct-beta-i1-GGUF
- Fichero imatrix para crear cuantizaciones propias: https://huggingface.co/mradermacher/simllama-1.1-instruct-beta-i1-GGUF/resolve/main/simllama-1.1-instruct-beta.imatrix.gguf
- README de referencia para el uso de ficheros GGUF (citado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset tinybrain-instruct-sft-200k: https://huggingface.co/datasets/exnivo/tinybrain-instruct-sft-200k
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset OpenAssistant oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset medra-thinking-768: https://huggingface.co/datasets/drwlf/medra-thinking-768
- Dataset llama-instruct: https://huggingface.co/datasets/togethercomputer/llama-instruct
- Dataset interview-eval/MATH: https://huggingface.co/datasets/interview-eval/MATH
- Dataset RLAIF/mbpp: https://huggingface.co/datasets/RLAIF/mbpp
- Nota sobre la busqueda web: la busqueda realizada no devolvio ningun resultado relevante sobre este modelo, su autor o su arquitectura; los unicos resultados obtenidos fueron paginas de Sudoku, sin relacion con el contenido de la ficha.

# mradermacher/Pyrex-8B-Instruct-Uncensored-GGUF

## Resumen

Pyrex-8B-Instruct-Uncensored-GGUF es la version cuantizada en formato GGUF del modelo ImposterOnline/Pyrex-8B-Instruct-Uncensored, publicada por el usuario mradermacher (nethype GmbH). Se trata de un modelo de lenguaje de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) afinado por instrucciones mediante QLoRA sobre una receta de datos centrada en codigo, con la particularidad de ser "uncensored", es decir, con una capa de rechazo de contenido reducida respecto a los modelos alineados convencionales. El repositorio aporta 12 cuantizaciones estaticas distintas, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), pensadas para ejecucion local con llama.cpp.

La relevancia de esta ficha esta en su perfil de despliegue: al ser GGUF, el modelo puede correr en GPU de consumo e incluso en CPU, y su enfasis en generacion de codigo, function calling y flujos agenticos lo situa en el nicho de asistentes de programacion autoalojados y pipelines sin conexion. Los conjuntos de datos declarados (OpenCoder SFT stage 1, CodeAlpaca-20k, evol-codealpaca-v1, databricks-dolly-15k y hermes-function-calling-v1) confirman esa orientacion hacia codigo e invocacion de herramientas.

El modelo solo declara soporte de ingles, la licencia es Apache 2.0 y el autor original es ImposterOnline. No se han publicado resultados de benchmarks ni especificaciones de arquitectura detalladas (numero de capas, dimension de atencion, longitud de contexto) en la informacion disponible, por lo que varios campos de esta ficha quedan explicitamente marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo transformer afinado por instrucciones; la model card no especifica la arquitectura interna) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (tambien existe una variante con cuantizacion ponderada por matriz de importancia en mradermacher/Pyrex-8B-Instruct-Uncensored-i1-GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros de un solo archivo); el modelo base no cuantizado se distribuye en safetensors |

Datos adicionales: repositorio de 68,1 GB en total (suma de todas las cuantizaciones), 216 descargas y 0 likes en el momento de la consulta. Modelo base declarado: ImposterOnline/Pyrex-8B-Instruct-Uncensored. Etiquetas relevantes: code, coding, uncensored, instruct, finetuned, qlora, llama.cpp, text-generation-inference, agentic, function-calling.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (no se indican numero de capas, dimension oculta, tipo de atencion ni estrategia de RoPE). Lo que si se declara es el metodo de ajuste: QLoRA sobre un modelo base de 7.6B parametros, con el objetivo de obtener un modelo instruccional orientado a codigo y con rechazo reducido de peticiones. El resultado es un modelo "instruct" conversacional, no una continuacion de preentrenamiento.

En cuanto a los datos, la model card lista cinco conjuntos: OpenCoder-LLM/opencoder-sft-stage1 (SFT sobre codigo), sahil2801/CodeAlpaca-20k, theblackcat102/evol-codealpaca-v1, databricks/databricks-dolly-15k (instrucciones generales) y NousResearch/hermes-function-calling-v1 (invocacion de funciones). No se especifica el numero total de tokens de entrenamiento, la composicion porcentual de la mezcla, ni si hubo fases de RLHF, DPO o preferencias. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica transformacion tecnica documentada en este repositorio es la cuantizacion: cuantizacion estatica de los tensores de salida, con version de cuantizacion 2, y una variante adicional con pesos derivados de una matriz de importancia (i1).

## Capacidades

- Generacion de texto conversacional en ingles con formato de instrucciones.
- Generacion y completado de codigo en multiples lenguajes, dado el peso de los datasets de codigo en su receta de ajuste.
- Invocacion de funciones y tool calling, respaldado por el dataset hermes-function-calling-v1 y la etiqueta function-calling.
- Flujos agenticos de varios pasos, segun la etiqueta agentic declarada por el autor de la cuantizacion.
- Respuestas directas ante peticiones que los modelos alineados convencionales suelen rechazar (perfil "uncensored").
- Razonamiento basico e instrucciones generales heredadas de databricks-dolly-15k.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Capacidades de vision o audio: no disponibles; no se declaran modalidades adicionales.
- Modo "thinking" explicito: no disponible; no se documenta ningun modo de razonamiento extendido.

## Casos de uso

- Asistente de programacion autoalojado: al distribuirse en GGUF y pesar entre 3,1 GB y 8,2 GB en las cuantizaciones habituales, puede desplegarse en un portatil o estacion de trabajo sin conexion a internet, sirviendo como autocompletado y chat de codigo dentro del IDE.
- Generacion de codigo en entornos air-gapped: sectores con requisitos de confidencialidad (defensa, banca, sanidad) pueden ejecutar el modelo en local sin enviar codigo propietario a APIs externas, con la ventaja de que la licencia Apache 2.0 permite uso comercial.
- Integracion en pipelines de CI/CD: mediante function calling, el modelo puede invocarse para generar parches, revisar diffs o redactar mensajes de commit dentro de un flujo automatizado, siempre que se valide la salida antes de aplicarla.
- Construccion de agentes con herramientas: el soporte declarado de hermes-function-calling-v1 lo hace adecuado para prototipos de agentes que necesitan llamar a APIs, ejecutar consultas o encadenar varios pasos de razonamiento.
- Refactorizacion y explicacion de codigo heredado: tareas de resumen de ficheros, generacion de documentacion y traduccion entre lenguajes, aprovechando el entrenamiento sobre CodeAlpaca y evol-codealpaca.
- Investigacion en seguridad y red teaming: su caracter "uncensored" lo convierte en una herramienta util para estudiar que tipo de contenido genera un modelo sin capa de rechazo reforzada, dentro de un entorno controlado y con supervision humana.
- Punto de partida para ajuste adicional: al estar disponible tambien el modelo base en precision completa y con licencia Apache 2.0, puede servir como semilla para fine-tuning especifico de dominio con QLoRA sobre un unico GPU.
- Despliegue en hardware modesto para demos: las variantes Q2_K y Q3_K permiten ejecutar el modelo en equipos con poca memoria, sacrificando calidad, para pruebas de concepto o docencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite, y el autor original tampoco las aporta en los metadatos consultados. No se deben asumir valores derivados del nombre del modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano de los ficheros GGUF; no proceden de mediciones publicadas por el autor.

- Q2_K (3,1 GB): viable en GPU con 4 GB de VRAM y en CPU con 8 GB de RAM del sistema.
- Q3_K_S / Q3_K_M / Q3_K_L (3,6 / 3,9 / 4,2 GB): GPU de 6 GB en adelante.
- IQ4_XS / Q4_K_S / Q4_K_M (4,4 / 4,6 / 4,8 GB): recomendadas para GPU de 8 GB (RTX 3060, RTX 4060, RTX 2070). Es el rango que el propio autor marca como "fast, recommended".
- Q5_K_S / Q5_K_M (5,4 / 5,5 GB): GPU de 8-10 GB; en 8 GB conviene vigilar el coste de la cache KV.
- Q6_K (6,4 GB): GPU de 10-12 GB (RTX 3080 12 GB, RTX 4070).
- Q8_0 (8,2 GB): GPU de 12 GB o superior (RTX 4070 Ti, RTX 4080, RTX 3090).
- f16 (15,3 GB): GPU de 16-24 GB (RTX 4090, A100 40 GB); el autor lo califica de "overkill".
- GPU profesionales (A100, H100) no aportan ventaja en este rango de tamano salvo por el ancho de banda de memoria; para produccion a gran escala tendria mas sentido servir el modelo base sin cuantizar o en FP8/INT8 con vLLM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como compatible con text-generation-inference (endpoints_compatible), aunque el soporte de TGI para GGUF es mas limitado que el de llama.cpp.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparativa con otros modelos de la misma categoria. La tabla siguiente compara unicamente las variantes derivadas del mismo modelo base, que es lo unico documentado.

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Pyrex-8B-Instruct-Uncensored-GGUF | 7,6B | GGUF (12 cuantizaciones) | No disponible | Apache 2.0 | Cuantizacion estatica |
| mradermacher/Pyrex-8B-Instruct-Uncensored-i1-GGUF | 7,6B | GGUF (cuantizacion ponderada por imatrix) | No disponible | Apache 2.0 | Calidad potencialmente mejor a igual tamano |
| ImposterOnline/Pyrex-8B-Instruct-Uncensored | 7,6B | safetensors (precision completa) | No disponible | Apache 2.0 | Modelo base sin cuantizar |

Comparativa con alternativas de otros autores (por ejemplo, modelos de codigo de 7-8B con licencia permisiva): no disponible, al no existir benchmarks publicados para este modelo que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior al de modelos con cobertura multilingue explicita.
- Perfil "uncensored": implica una capa de rechazo reducida, por lo que puede producir contenido ofensivo, ilegal o peligroso si se le solicita. No es adecuado para aplicaciones de cara al publico sin un filtro de salida adicional.
- Riesgo de alucinacion: no hay datos publicados de tasas de alucinacion. En tareas de codigo, el riesgo se traduce en APIs inventadas, dependencias inexistentes y errores silenciosos, por lo que toda salida debe pasar por tests.
- Ausencia de benchmarks: no hay evidencia cuantitativa de calidad. Cualquier decision de adopcion deberia basarse en una evaluacion propia sobre el caso de uso concreto.
- Longitud de contexto desconocida: no se especifica en la informacion disponible, lo que impide planificar tareas de contexto largo (analisis de repositorios completos, por ejemplo).
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K reducen notablemente la calidad. Para uso en produccion conviene partir de Q4_K_M o superior.
- Adopcion limitada: 216 descargas y 0 likes en el momento de la consulta; es un modelo de nicho con poca validacion por parte de la comunidad.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se cumplan las condiciones del modelo base, tambien Apache 2.0. No se identifican restricciones adicionales.
- Trazabilidad: no se documentan los detalles del proceso de ajuste (epocas, hiperparametros, filtrado de datos), lo que dificulta reproducir o auditar el modelo.
- Origen de los datos: los datasets de codigo empleados pueden contener fragmentos con licencias incompatibles o informacion sensible; conviene revisar la procedencia antes de un uso comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Pyrex-8B-Instruct-Uncensored-GGUF
- Repositorio con cuantizacion ponderada (imatrix): https://huggingface.co/mradermacher/Pyrex-8B-Instruct-Uncensored-i1-GGUF
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#Pyrex-8B-Instruct-Uncensored-GGUF
- Modelo base: https://huggingface.co/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Ficha del modelo en Featherless AI: https://featherless.ai/models/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Inferencia gestionada en FriendliAI: https://friendli.ai/models/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Guia de modelos locales sin censura por tramo de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Datasets declarados: https://huggingface.co/datasets/OpenCoder-LLM/opencoder-sft-stage1, https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k, https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1, https://huggingface.co/datasets/databricks/databricks-dolly-15k, https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1

# mradermacher/Qwen3.8-27B-Metaphor-i1-GGUF

## Resumen

Qwen3.8-27B-Metaphor-i1-GGUF es una colección de cuantizaciones imatrix (importance matrix) en formato GGUF del modelo nightmedia/Qwen3.8-27B-Metaphor, publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un modelo de 27.320.697.856 parámetros (dato real de safetensors) orientado a generación de texto, escritura creativa, razonamiento con cadena de pensamiento largo (long-CoT), matemáticas, STEM y programación, con soporte multilingüe (inglés, chino, japonés y castellano).

Según los tags del repositorio, el modelo base es un merge experimental (creado con mergekit) que combina linajes de modelos tipo Qwen3.5/Qwen3.6, con referencias a destilación tipo Claude y a la familia "polaris". Se describe como instruction-tuned y conversacional, con menciones a contextos de 256k y 1M tokens, aunque estos datos no están confirmados en la documentación del modelo base. El aporte de mradermacher es puramente de cuantización: proporciona versiones desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB), pensadas para ejecutar el modelo en hardware de consumo con llama.cpp y derivados.

Es relevante ahora mismo porque permite probar un modelo experimental de 27B con requisitos de memoria muy reducidos: la versión recomendada i1-Q4_K_M ocupa 16,9 GB, lo que lo hace viable en GPUs de consumo de 24 GB o en configuraciones con descarga parcial a RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en la familia Qwen (detalle exacto no disponible; el modelo base es un merge con mergekit) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible oficialmente; los tags mencionan 256k y 1M tokens, sin confirmacion |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas imatrix suelto) |
| Idiomas soportados | ingles, chino, japones, castellano |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (imatrix); el modelo base esta en safetensors (bf16) |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura interna del modelo base. Por los tags y el nombre, se trata de un modelo derivado de la familia Qwen (tags qwen3_5, qwen3_6, qwen3.8), creado por nightmedia como un merge experimental con mergekit, posiblemente combinando modelos destilados de sistemas propietarios (tag claude-distillation) y modelos de la serie "polaris". Al ser un merge, no hay un proceso de entrenamiento propio documentado: numero de tokens, composicion del dataset ni etapas de RLHF/DPO no disponibles.

El trabajo de mradermacher consiste en generar cuantizaciones weighted/imatrix: se calcula primero un archivo de matriz de importancia (imatrix, 0,1 GB) a partir de datos de calibracion, y se usa para asignar mayor precision a los tensores más sensibles a la cuantizacion. Según el autor, los quants IQ suelen ofrecer mejor calidad que los quants estaticos de tamaño similar. La model card tambien indica que el modelo base seria un modelo de vision, y que los archivos mmproj (si existen) estan en el repositorio de quants estaticos, no en este.

## Capacidades

- Generacion de texto general e instrucciones conversacionales (instruction-tuned).
- Escritura creativa: generacion de tramas, subtramas, escenas, continuacion de escenas, narrativa de ficcion, ciencia ficcion, roleplay y "vivid prose" segun los tags del autor.
- Razonamiento con cadena de pensamiento largo (long-CoT / chain-of-thought).
- Matematicas y STEM (tags math, stem).
- Programacion (tags coding, research).
- Multilingüe: ingles, chino, japones y castellano.
- Posible capacidad de vision segun la model card de mradermacher ("This is a vision model"), con archivos mmproj en el repo de quants estaticos.
- Soporte de tool calling, function calling o agentes: no disponible en la documentacion.
- Modo thinking dedicado: no disponible explicitamente (los tags mencionan reasoning y long-cot, pero sin detalles).

## Casos de uso

- Escritura de ficcion y narrativa interactiva: los tags del autor insisten en generacion de tramas, subtramas, continuacion de escenas y todos los generos; util como asistente de escritura creativa o motor de storytelling para juegos.
- Roleplay y personajes: el tag roleplaying y el perfil creativo del merge lo hacen adecuado para chatbots de personaje con personalidades consistentes en conversaciones largas.
- Asistente de programacion local: puede ejecutarse offline con llama.cpp u Ollama para autocompletado, explicacion de codigo y depuracion, util cuando no se quiere enviar codigo a APIs de terceros.
- Resolucion de problemas de matematicas y STEM: con razonamiento long-CoT, sirve para tutoria o verificacion de razonamientos en fisica, matematicas e ingenieria.
- Asistente multilingüe personal: soporte declarado de castellano, ingles, chino y japones para resumenes, redaccion y traduccion ligera en local.
- Experimentacion e investigacion sobre merges: al ser un merge experimental de la comunidad, es un buen sujeto para evaluar como las cuantizaciones imatrix afectan a modelos fusionados y para estudios de destilacion desde modelos propietarios.
- Prototipado en hardware de consumo: la version i1-Q4_K_S (15,9 GB, "optimal size/speed/quality" segun el autor) permite probar un modelo de 27B en una sola GPU de 24 GB sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge experimental de la comunidad sin model card tecnica detallada, no existen cifras de MMLU, HumanEval, GSM8K ni de otras baterias para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (solo pesos, sin KV-cache):
  - i1-Q2_K: 11,0 GB
  - i1-IQ3_M: 12,9 GB
  - i1-IQ4_XS: 15,4 GB
  - i1-Q4_K_S: 15,9 GB (recomendada por el autor por equilibrio tamano/calidad)
  - i1-Q4_K_M: 16,9 GB (recomendada, rapida)
  - i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- GPUs recomendadas: una RTX 3090 o RTX 4090 (24 GB) ejecuta de sobra i1-Q4_K_M e incluso i1-Q6_K; con una RTX 3060 de 12 GB o una 4060 Ti 16 GB se puede usar i1-Q2_K/i1-Q3 con descarga parcial a RAM. En entornos de servidor, cualquier GPU con 24 GB o mas (A100, L40S) da margen para contextos largos.
- Cabe en GPU de consumo: si, es uno de los puntos fuertes de esta publicacion; con 24 GB de VRAM se ejecuta a buena calidad, y con Apple Silicon unificado (32 GB+) tambien es viable.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF e imatrix. vLLM y TGI no consumen GGUF directamente; para ellos habria que usar el modelo base nightmedia/Qwen3.8-27B-Metaphor en safetensors.
- Latencia y throughput: no disponible (dependen de la cuantizacion elegida y del hardware; los quants Q4 sobre un 27B suelen ser interactivos en una RTX 4090, pero no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Metaphor-i1-GGUF | 27,3B | no disponible (tags: 256k/1M) | apache-2.0 | GGUF imatrix | Merge experimental, enfoque creativo y razonamiento |
| Qwen3-32B (oficial) | 32,5B | 131.072 tokens | apache-2.0 | safetensors, GGUF comunitario | Modelo oficial con modo thinking, benchmarks publicados, mejor documentado |
| Gemma 3 27B (Google) | 27,4B | 128.000 tokens | Gemma license (restricciones) | safetensors, GGUF comunitario | Multimodal (vision), benchmarks publicados, licencia menos permisiva |
| Mistral Small 3.x 24B | 24B | 32.000 tokens (128k en versiones recientes) | apache-2.0 | safetensors, GGUF comunitario | Buen rendimiento en consumo, tool calling nativo documentado |

Frente a estas alternativas, la ventaja de esta ficha es la licencia apache-2.0 y el enfoque creativo/roleplay; la desventaja es la falta total de benchmarks y documentacion tecnica del merge.

## Limitaciones y advertencias

- Es un merge experimental de la comunidad: sin model card tecnica del modelo base, sin datos de entrenamiento y sin benchmarks; su comportamiento es impredecible y puede variar mucho respecto a un modelo oficial.
- Riesgo de alucinacion elevado al no haber evaluaciones publicadas; no se recomienda para produccion sin validacion propia en el dominio de uso.
- Los tags mencionan "claude-distillation" y "polaris-alpha": la procedencia de los datos de destilacion no esta documentada, lo que puede implicar riesgos legales o de procedencia poco claros, aunque la licencia declarada es apache-2.0.
- La longitud de contexto (256k/1M) aparece solo como tag y no esta verificada; ademas, contextos largos multiplican el consumo de memoria del KV-cache, muy por encima del tamaño de los pesos.
- La model card de mradermacher indica que es un modelo de vision, pero los archivos mmproj estan en el repositorio de quants estaticos, no en este; la funcionalidad visual con GGUF puede requerir configuracion adicional.
- Cuantizaciones agresivas (Q2_K, Q3) degradan notablemente la calidad, especialmente en razonamiento y codigo; el propio autor senala alternativas mejores en cada caso.
- Soporte de tool calling y agentes: no disponible en la documentacion, por lo que no debe asumirse.
- Repositorio con 0 descargas en el momento de la ficha: comunidad y soporte practicamente inexistentes.

## Enlaces

- Repositorio cuantizado (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-Metaphor-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/Qwen3.8-27B-Metaphor-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-Metaphor
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Metaphor-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo base: no disponible

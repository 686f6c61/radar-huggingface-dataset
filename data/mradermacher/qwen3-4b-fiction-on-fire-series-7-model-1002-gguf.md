# mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1002-GGUF

## Resumen

Qwen3-4B-Fiction-On-Fire-Series-7-Model-1002-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1002, un ajuste fino y merge (fusion de modelos) orientado a escritura creativa y narrativa. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, mientras que el modelo base finetuneado procede del autor DavidAU. El modelo parte de Qwen3-4B, del que hereda su arquitectura transformer decoder-only con 4.022.468.096 parametros totales (aproximadamente 4.000 millones).

El objetivo del modelo es la generacion de prosa vivida y coherente en contextos de ficcion: relatos, tramas y subtramas, continuacion de escenas, generacion de dialogos y roleplay. La model card etiqueta explicitamente generos como ciencia ficcion, romance o terror, e indica soporte de lenguaje soez (swearing), lo que sugiere un ajuste sin el filtrado de tono habitual de los modelos instruidos generalistas.

Este repositorio concreto no contiene pesos en precision completa, sino una bateria de 12 cuantizaciones GGUF que van desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que lo hace util para desplegar el modelo en hardware modesto, incluyendo GPU de consumo. La licencia del modelo base es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B; el repositorio no detalla la configuracion exacta del merge) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fr, zh, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); bfloat16 en el modelo base |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Tamano del repo | 36,4 GB |
| Descargas | 96 |
| Likes | 0 |
| Fecha de creacion | 5 de junio de 2025 |
| Ultima actualizacion | 11 de noviembre de 2026 |
| Modelo base | DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1002 |
| Libreria declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only con atencion causal estandar. Sobre esa base, el autor original (DavidAU) produjo un merge y ajuste fino orientado a ficcion. La model card del repositorio de cuantizacion no documenta el proceso de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, ni si se emplearon tecnicas como RLHF, DPO o SFT. Las etiquetas del repositorio incluyen "finetune" y "merge", lo que confirma que se combino el modelo base con pesos ajustados, pero no se detalla la receta.

La unica informacion tecnica concreta del proceso de cuantizacion es que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor de las cuantizaciones indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (sufijo i1-GGUF), lo que sugiere que este repositorio contiene cuantizaciones estaticas sin matriz de importancia. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de ficcion y prosa narrativa: relatos, novelas, cuentos y escenas con enfasis en prosa vivida (vivid prose).
- Generacion de tramas y subtramas (plot generation, sub-plot generation).
- Continuacion de escenas (scene continue): el modelo puede retomar un texto existente y prolongarlo manteniendo el tono.
- Roleplay y dialogo conversacional, con soporte explicito de lenguaje soez segun las etiquetas.
- Cobertura de generos: ciencia ficcion, romance, terror y "todos los generos" segun la model card.
- Capacidades multilingues limitadas a ingles, frances, chino y aleman.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Generacion de relatos cortos por encargo: el modelo puede producir cuentos completos de un genero concreto (terror, romance, ciencia ficcion) a partir de una premisa breve, gracias a su ajuste especifico en ficcion.
- Continuacion de manuscritos: un escritor puede pegar los ultimos parrafos de su novela y pedir al modelo que continue la escena manteniendo voz y ritmo narrativo, aprovechando la capacidad "scene continue".
- Desarrollo de tramas y subtramas para guiones o videojuegos: el modelo puede generar arboles de tramas alternativas y subtramas secundarias para narrativa interactiva.
- Roleplay en aplicaciones de entretenimiento: con soporte de lenguaje soez y tono adulto, es adecuado para personajes conversacionales en juegos de rol de texto, siempre que la aplicacion gestione el filtrado de contenido segun su publico.
- Asistencia a escritores con bloqueo creativo: generacion de variantes de una misma escena con distintos tonos (comico, tragico, suspense) para explorar direcciones narrativas.
- Prototipado rapido en local: al tener cuantizaciones desde 1,8 GB, permite probar el modelo en un portatil con GPU de consumo antes de invertir en infraestructura mayor, dentro de pipelines de generacion de contenido editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad narrativa, y el repositorio de cuantizacion no aporta datos de perplexidad comparativos mas alla de la grafica generica de tipos de cuantizacion enlazada (que no es especifica de este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,8 GB; Q4_K_M ~2,6 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- Cabe en GPU de consumo: practicamente cualquier GPU con 6-8 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) ejecutan sin problema incluso Q8_0 y f16.
- GPU profesionales: A100, H100 y L40S son sobredimensionadas para este modelo en cuantizaciones bajas; son utiles solo para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio declara compatibilidad con endpoints (endpoints_compatible) y libreria transformers, pero para GGUF el camino natural es llama.cpp/Ollama.
- Latencia y throughput: no se publican datos. En una GPU de consumo con Q4_K_M, el modelo de 4 B es lo bastante pequeno para generar a velocidades interactivas, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Fiction-On-Fire-Series-7 (este) | 4,02 B | no disponible | Ficcion y escritura creativa | Apache 2.0 | GGUF en HF |
| Qwen3-4B (base oficial) | 4 B | no disponible en la informacion | Proposito general | Apache 2.0 | Pesos originales en HF |
| Modelos de ficcion de 7-8 B (familia DavidAU, otros merges) | 7-8 B | no disponible | Ficcion y roleplay | Variable | GGUF en HF |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no hay benchmarks publicados de este modelo ni de sus comparables directos en la ficha. La ventaja principal frente al Qwen3-4B oficial es la especializacion en prosa narrativa; la desventaja es que pierde capacidades generalistas (codigo, matematicas, tool calling) que el modelo base si tiene.

## Limitaciones y advertencias

- Es un ajuste fino especializado en ficcion: su rendimiento en tareas generales (codigo, matematicas, razonamiento logico) previsiblemente sera inferior al de Qwen3-4B original, aunque no hay datos que lo cuantifiquen.
- Riesgo de alucinacion y de incoherencia narrativa en generaciones largas; al ser un modelo de 4 B, la consistencia de tramas extensas es limitada.
- Soporte multilingue restringido a en, fr, zh y de; no se declara soporte de espanol.
- Etiqueta explicita de "swearing": el modelo puede generar lenguaje soez o contenido adulto, lo que exige moderacion en aplicaciones dirigidas a publico general.
- No se documenta la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas previas.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo base es un merge de terceros: conviene verificar la procedencia de los pesos fusionados antes de desplegar en produccion.
- El repositorio es una distribucion de cuantizaciones, no el modelo original; para reproducibilidad conviene referenciar tambien el modelo base DavidAU.
- Modelo con muy poca traccion (96 descargas, 0 likes en el momento de la consulta): no hay evidencia comunitaria de calidad ni casos de produccion documentados.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1002-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1002
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1002-i1-GGUF
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Qwen3-4B-Fiction-On-Fire-Series-7-Model-1002-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests

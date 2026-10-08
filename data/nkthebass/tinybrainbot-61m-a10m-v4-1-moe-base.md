# nkthebass/tinybrainbot-61m-a10m-v4.1-moe-base

## Resumen

tinybrainbot-61m-a10m-v4.1-moe-base es un modelo de lenguaje de tipo decoder-only con arquitectura de mezcla de expertos (MoE) desarrollado por el usuario nkthebass dentro de la serie TinyBrainBot v4.1. Se trata del primer modelo MoE de la familia y del primero de la serie v4.1. Cada capa contiene 16 expertos y cada token se enruta a 2 de ellos, de modo que el modelo almacena 60,6 millones de parametros en el transformer (mas 3,6 M de embedding atado, 64.204.032 en total segun los pesos en safetensors) pero solo ejecuta aproximadamente 10 millones por token.

El modelo se ha entrenado desde cero sobre exactamente los mismos 11.000 millones de tokens, en el mismo orden, con el mismo schedule y el mismo tokenizador que los modelos densos del estudio de escalado v4 del mismo autor. Esto convierte al modelo en un artefacto de investigacion disenado para aislar una unica variable: capas feed-forward densas frente a capas de expertos con el mismo presupuesto de computo. Segun la model card, con el computo del modelo denso de 10 M supera a este en 10 de 13 benchmarks y obtiene una media de 37,5 frente a 36,5, ademas de superar a todos los modelos comparados (incluido el denso de 25 M) en MMLU, PIQA, MathQA y ARC-Challenge.

Es relevante ahora porque permite estudiar el enrutamiento de expertos en un regimen de computo muy bajo, reproducible en hardware de consumo, y porque los pesos se distribuyen bajo licencia Apache 2.0 en safetensors y GGUF. El modelo es una base preentrenada (no ajustada por instrucciones), solo en ingles, y con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas feed-forward de mezcla de expertos (MoE) estilo Mixtral: 16 expertos por capa, enrutamiento top-2 por token |
| Parametros totales | 64.204.032 (60,6 M no de embedding + 3,6 M de embedding atado, segun la model card) |
| Parametros activos | ~10,0 M por token (sin el embedding atado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en detalle; la model card y las etiquetas indican que se publican pesos GGUF ademas de safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only en el que las capas feed-forward densas se sustituyen por capas MoE con 16 expertos y enrutamiento top-2 por token (esquema tipo Mixtral, segun las etiquetas del repositorio). El modelo almacena 60,6 M de parametros no de embedding mas 3,6 M de embedding atado, pero solo activa unos 10,0 M por token, lo que reduce el coste de computo por token hasta el nivel de un modelo denso de 10 M manteniendo la capacidad de almacenamiento de uno de 61 M.

El entrenamiento se realizo desde cero sobre 11.000 millones de tokens, con el mismo orden de datos, schedule y tokenizador que los modelos densos del estudio de escalado v4, lo que permite una comparacion controlada. El corpus combina HuggingFaceFW/fineweb-edu, mlfoundations/dclm-baseline-1.0, wikimedia/wikipedia, HuggingFaceTB/cosmopedia, HuggingFaceTB/finemath, OctoThinker/MegaMath-Web-Pro-Max, HuggingFaceFW/finepdfs-edu, bigcode/the-stack-smol, manu/project_gutenberg y lucadiliello/bookcorpusopen. No se especifica en la informacion disponible si hubo fases de RLHF, DPO o ajuste por instrucciones: se trata de un checkpoint declarado como "base" y "pretrained".

## Capacidades

- Generacion de texto autoregresiva y continuacion de contexto (modelo base, sin ajuste por instrucciones).
- Razonamiento de sentido comun y conocimiento factual de nivel bajo, coherente con su escala (media de 37,5 en 13 benchmarks de 0-shot).
- Cierta capacidad aritmetica y de resolucion de problemas tipo MathQA (23,1 acc_norm; 24,2 en raw accuracy), por encima del denso de 10 M y del de 25 M.
- Comprension lectora basica y pregunta-respuesta booleana (BoolQ 56,0; SciQ 61,7 acc_norm).
- Exposicion limitada a codigo durante el preentrenamiento (bigcode/the-stack-smol) y a matematicas (finemath, MegaMath-Web-Pro-Max), sin que se reporten benchmarks de codigo.
- Soporte de tool calling o function calling: no disponible (no declarado).
- Soporte de agentes o razonamiento multi-paso: no disponible (no declarado; el modelo no esta ajustado para ello).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Compatibilidad con text-generation-inference y con endpoints de Hugging Face (etiquetas endpoints_compatible y text-generation-inference).

## Casos de uso

- Investigacion sobre enrutamiento MoE en presupuesto minimo: el modelo comparte tokens, orden y schedule con los densos de la serie v4, por lo que sirve para medir el efecto aislado de sustituir capas densas por expertos con el mismo computo por token (~10 M de parametros activos).
- Estudio de ablacion denso vs disperso: comparar la curva de escalado del denso de 10 M, el denso de 25 M y este MoE de 61 M permite caracterizar cuando la esparsidad compensa en regimen de pocos FLOPs.
- Experimentos de destilacion y como profesor o alumno: con 64,2 M de parametros totales y pesos en safetensors, es viable usarlo como alumno de un modelo mayor o como referencia de un modelo mas pequeno dentro de un pipeline de investigacion reproducible.
- Inferencia en hardware de consumo o embebido: al ocupar aproximadamente 128 MB en bf16/fp16 y unos 32-64 MB cuantizado, puede ejecutarse en CPU, en una Raspberry Pi o en cualquier GPU integrada, util para demos, docencia y prototipos sin acelerador.
- Modelo de prueba para tooling de inferencia: sirve como caso de test ligero y rapido para validar pipelines de llama.cpp/Ollama con GGUF, servidores TGI o endpoints compatibles antes de desplegar modelos grandes.
- Validacion de corpus y tokenizadores a escala reducida: al haberse entrenado con una mezcla concreta de 10 datasets publicos, es util para reproducir experimentos de mezcla de datos y comparar con el estudio de 3 brazos del propio autor (tinybrainbot-pilot-100m-datamix).
- Docencia sobre arquitecturas MoE: el modelo es lo bastante pequeno para inspeccionar pesos, logits de enrutamiento y distribucion de expertos en un portatil, algo inviable en MoE de cientos de miles de millones de parametros.
- Generacion de texto creativo o completado de texto en ingles, con expectativas limitadas: puede usarse para redactar continuaciones cortas, pero no como asistente conversacional fiable.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (0-shot, no verificados de forma independiente; el campo "verified" es false en todos los casos). La propia model card advierte de que son datos autoinformados.

| Benchmark (0-shot) | MoE 61M (10M activos) | dense 10M | dense 25M | Pythia-70M | Pythia-31M |
|---|---:|---:|---:|---:|---:|
| ARC-Easy | 42,2 | 40,2 | 42,7 | 36,0 | 33,7 |
| ARC-Easy (raw acc) | 45,1 | 42,8 | 47,3 | 38,2 | 37,2 |
| ARC-Challenge | 25,0 | 23,1 | 24,9 | 21,8 | 21,0 |
| ARC-Challenge (raw acc) | 20,4 | 18,9 | 21,0 | 17,6 | 16,6 |
| SciQ | 61,7 | 58,4 | 65,9 | 56,4 | 51,5 |
| SciQ (raw acc) | 69,4 | 68,8 | 73,7 | 64,0 | 60,0 |
| OpenBookQA | 28,6 | 28,2 | 31,2 | 25,4 | 26,8 |
| OpenBookQA (raw acc) | 16,8 | 15,4 | 17,2 | 12,6 | 13,0 |
| MMLU | 26,0 | 23,1 | 23,7 | 22,9 | 22,9 |
| HellaSwag | 36,5 | 35,1 | 37,2 | 33,8 | 33,6 |
| HellaSwag (raw acc) | 32,6 | 32,2 | 32,5 | 30,8 | 31,2 |
| PIQA | 60,8 | 57,3 | 60,2 | 59,2 | 56,6 |
| PIQA (raw acc) | 60,9 | 59,6 | 60,0 | 59,8 | 57,5 |
| WinoGrande | 51,4 | 51,5 | 52,6 | 52,9 | 49,3 |
| Social IQa | 36,4 | 36,1 | 37,2 | 35,4 | 35,1 |
| CommonsenseQA | 19,2 | 20,6 | 20,3 | 19,8 | 19,7 |
| LAMBADA (OpenAI) | 21,1 | 17,6 | 23,4 | 23,4 | 17,8 |
| BoolQ | 56,0 | 60,8 | 58,8 | 59,6 | 51,0 |
| MathQA | 23,1 | 21,9 | 21,9 | 20,4 | 19,5 |
| MathQA (raw acc) | 24,2 | 22,0 | 23,2 | 20,9 | 19,2 |
| Media (13 benchmarks) | 37,5 | 36,5 | no disponible | no disponible | no disponible |

Segun la model card, el MoE supera al denso de 10 M en 10 de 13 benchmarks, gana en MMLU, PIQA, MathQA y ARC-Challenge a todos los modelos listados (incluido el denso de 25 M) y promedia 37,5 frente a 36,5 del denso de 10 M.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en fp32: aproximadamente 257 MB.
- VRAM estimada en bf16/fp16: aproximadamente 128 MB, mas el cache KV (dependiente de la longitud de contexto, que no esta publicada).
- VRAM estimada cuantizado a int8: aproximadamente 64 MB; a 4 bits: aproximadamente 32-40 MB.
- Cabe en cualquier GPU de consumo: RTX 3060/4060/4090, GTX 1650, e incluso en iGPU y en CPU. No requiere A100 ni H100.
- Ejecutable en dispositivos de borde (Raspberry Pi 4/5, mini-PC x86) y en entornos sin GPU.
- Opciones de despliegue: transformers (libreria declarada), pesos GGUF para llama.cpp u Ollama, text-generation-inference y endpoints compatibles con Hugging Face (etiquetas text-generation-inference y endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- El repositorio ocupa 0,4 GB, por lo que la descarga completa y el despliegue en disco son triviales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Tipo | Contexto | Media 13 benchmarks (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| tinybrainbot-61m-a10m-v4.1-moe-base | 64,2 M | ~10,0 M/token | MoE (16 expertos, top-2) | no disponible | 37,5 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| tinybrainbot denso 10M (serie v4) | no disponible | 10 M | Denso | no disponible | 36,5 | no disponible | Hugging Face |
| tinybrainbot-25m-v4-base | 30,6 M (25,2 M transformer + 5,4 M embedding atado) | 25,2 M | Denso | no disponible | no disponible (superado por el MoE en MMLU, PIQA, MathQA y ARC-Challenge) | no disponible | Hugging Face |
| Pythia-70M | 70 M | 70 M | Denso | no disponible | no disponible | no disponible | Hugging Face |
| Pythia-31M | 31 M | 31 M | Denso | no disponible | no disponible | no disponible | Hugging Face |

Todos los modelos comparados pertenecen al mismo orden de magnitud (decenas de millones de parametros) y a la misma tarea (generacion de texto / modelado de lenguaje). Los datos de Pythia provienen de la tabla de la model card; no se dispone de sus especificaciones completas en la informacion proporcionada, por lo que los campos no confirmados figuran como no disponibles.

## Limitaciones y advertencias

- Es un modelo base preentrenado, no ajustado por instrucciones ni alineado: no sigue ordenes, no mantiene conversaciones y no tiene plantilla de chat declarada.
- Riesgo elevado de alucinacion y de texto incoherente: con ~10 M de parametros activos, su conocimiento factual y su coherencia a largo plazo son muy limitados.
- Rendimiento bajo en sentido comun: CommonsenseQA 19,2 (cercano al azar de 5 opciones, 20%), ARC-Challenge 25,0, LAMBADA 21,1, lo que indica poca comprension de dependencias largas.
- Solo ingles declarado; no hay soporte multilingue.
- No se ha publicado la longitud de contexto soportada, ni los tipos de cuantizacion disponibles, ni la arquitectura de atencion en detalle.
- Benchmarks autoinformados por el autor y marcados como no verificados ("verified": false); se han obtenido con evaluacion 0-shot y sin confirmacion independiente.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin revision por pares.
- La licencia del modelo es Apache 2.0, lo que permite uso comercial y modificacion, pero los corpus de entrenamiento (fineweb-edu, the-stack-smol, project Gutenberg, bookcorpusopen, Wikipedia, entre otros) tienen sus propias condiciones; conviene revisarlas antes de un uso comercial.
- No apto para produccion en tareas de atencion al cliente, generacion de codigo o agentes: carece de ajuste por instrucciones, de soporte de tool calling declarado y de capacidades de razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-61m-a10m-v4.1-moe-base
- Estudio de escalado v4 (modelos densos de referencia): https://huggingface.co/nkthebass/tinybrainbot-v4-scaling-500k-25m
- Modelo denso de 25 M de la serie v4: https://huggingface.co/nkthebass/tinybrainbot-25m-v4-base
- Coleccion "Research and data" del autor: https://huggingface.co/collections/nkthebass/research-and-data
- Sitio del proyecto TinyBrain GPT studio: https://nkthebass.itch.io/
- Otros enlaces (papers, blogs o repos adicionales): no disponibles en la informacion proporcionada.

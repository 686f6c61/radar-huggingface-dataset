# nace-ai/Qwen3.5-9B-GGUF-KQuant

## Resumen

Qwen3.5-9B-GGUF-KQuant es una distribución de pesos cuantizados en formato GGUF del modelo Qwen/Qwen3.5-9B, publicada por nace-ai. No se trata de un modelo entrenado desde cero, sino de una conversión con cuantización calibrada (KQuant) pensada para ejecutarse con Kapitsa, el motor de inferencia local de Nace.AI para Macs con Apple silicon. El modelo base tiene 9.197.093.888 parámetros y una ventana multimodal de tipo image-text-to-text, según la etiqueta de pipeline del repositorio.

La propuesta de valor de esta ficha es la cuantización con matriz de importancia (importance matrix, imatrix). Según la model card, los ficheros Q2_K, Q3_K_M y Q4_K_M se generaron con imatrix, lo que en el caso de Q4_K_M produce un fichero del mismo tamaño (5,78 GB) que la cuantización plana pero con menor divergencia respecto al modelo original en bf16: KL de 0,023 frente a 0,045, y un 95,0 % de coincidencia en el token top-1 frente al 92,5 % de la versión plana.

El repositorio incluye además el proyector de visión en bf16 (mmproj, 0,9 GB), lo que confirma el soporte multimodal de imagen a texto. La licencia es Apache 2.0, heredada del modelo base, y el formato de pesos es GGUF, lo que lo hace compatible con el ecosistema llama.cpp además de con Kapitsa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-9B; familia Qwen3.5, transformer, detalles no publicados en la informacion disponible) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M (con imatrix), Q8_0 (sin imatrix), bf16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base Qwen/Qwen3.5-9B en la documentacion proporcionada. Lo unico verificable es el recuento de parametros (9.197.093.888) y la naturaleza multimodal image-text-to-text, evidenciada por la presencia de un proyector de vision (`mmproj-bf16.gguf`, 0,9 GB) en el repositorio.

La innovacion tecnica documentada en esta ficha es el proceso de cuantizacion KQuant. En GGUF, KQuant construye una matriz de importancia a partir de texto de calibracion y la usa para guiar la cuantizacion de las capas; el autor indica que solo publica un pack si mide mas cerca del modelo original con el mismo tamano y velocidad. La model card menciona tambien que el modelo base incluye una cabeza MTP (multi-token prediction) propia del fichero, usada por Kapitsa durante la medicion de velocidad.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en el repositorio).
- Entrada de imagen y texto (pipeline `image-text-to-text`), con proyector de vision en bf16 incluido.
- Razonamiento y generacion de codigo: la model card mide una respuesta de codigo de 512 tokens y evalua con HumanEval como parte del conjunto de calibracion.
- Razonamiento matematico: se evalua con GSM8K (100 preguntas de test).
- Decodificacion con cabeza MTP (multi-token prediction) soportada por Kapitsa.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta poblado en el repositorio).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el formato GGUF y la integracion con Kapitsa (`kapitsa serve --model /path/to/file.gguf`) permiten levantar un endpoint compatible en `http://127.0.0.1:8000` sin GPU dedicada, usando el fichero Q4_K_M de 5,8 GB.
- Asistente de codigo en local: la cuantizacion Q4_K_M mantiene un 95,0 % de coincidencia en el token top-1 con el modelo bf16 y una velocidad de escritura de 84,8 tok/s en un MacBook Pro M5 Pro de 48 GB, adecuada para autocompletado y generacion de funciones en el editor.
- Procesamiento de documentos con imagen: al incluir el proyector de vision (`mmproj-bf16.gguf`), el modelo puede recibir capturas, diagramas o paginas escaneadas junto a una instruccion de texto para extraer o resumir contenido.
- Despliegue en entornos con memoria limitada: el fichero Q2_K (3,9 GB) permite ejecutar el modelo en equipos con menos RAM unificada, a costa de mayor perdida de fidelidad respecto a bf16.
- Evaluacion y prototipado de cuantizaciones: el repositorio incluye el propio `imatrix.gguf` (0,01 GB), lo que permite reproducir o auditar el proceso de calibracion y comparar contra cuantizaciones planas.
- Servicio de chat conversacional de baja latencia: con unos 490 tok/s de lectura de un prompt de 4K tokens en el hardware medido, es viable para conversaciones multi-turno con contexto moderado.
- Pipeline de CI/CD para pruebas de calidad de cuantizaciones: el uso de llama.cpp (`0a94a3f2`) y de GSM8K sobre 100 preguntas documentado en la model card sirve como plantilla de evaluacion automatizada.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la comparacion entre Q4_K_M plano y Q4_K_M con imatrix, ambos de 5,78 GB, medidos contra los logits del GGUF en bf16.

| Metrica | Q4_K_M plano | Q4_K_M de este repo |
|---|---:|---:|
| KL desde bf16 (menor es mejor) | 0,045 | 0,023 |
| Mismo token top-1 que bf16 | 92,5 % | 95,0 % |
| GSM8K (100 preguntas) | 0,93 | 0,95 |
| Escritura (tok/s) | 85,0 | 84,8 |

Condiciones de medida declaradas: KL calculada sobre 64 fragmentos de 512 tokens (wikitext-2, chats de GSM8K y HumanEval) contra los logits del GGUF en bf16; GSM8K con 100 preguntas de test a traves de llama-server; herramienta llama.cpp `0a94a3f2` del 11 de noviembre de 2026; velocidad medida en MacBook Pro M5 Pro de 48 GB con Kapitsa 0.2.32, cabeza MTP del propio fichero, respuesta de codigo de 512 tokens a temperatura 0,6, ejecuciones intercaladas y dos ejecuciones validas por fichero. Lectura de un prompt de 4K: aproximadamente 490 tok/s en ambos casos. Solo se midio Q4_K_M.

No se han publicado resultados de benchmarks del modelo base ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada segun fichero: Q2_K 3,9 GB; Q3_K_M 4,7 GB; Q4_K_M 5,8 GB; Q8_0 9,8 GB; proyector de vision 0,9 GB adicional.
- Hardware medido por el autor: MacBook Pro M5 Pro con 48 GB de memoria unificada, con 84,8 tok/s de escritura y unos 490 tok/s de lectura de prompt de 4K en Q4_K_M.
- Cabe en GPU de consumo: el fichero Q4_K_M (5,8 GB) es compatible con GPUs de 8 GB o mas de VRAM mediante llama.cpp; Q8_0 requiere aproximadamente 10 GB o mas. No se aportan mediciones en GPUs NVIDIA o AMD.
- Despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa`, `kapitsa serve`), con pagina de chat y API en `http://127.0.0.1:8000`; el autor cita llama.cpp como herramienta de evaluacion, por lo que el formato GGUF es compatible con ese ecosistema.
- Variante MLX: existe un build MLX 4-bit KQuant enlazado desde la model card para Apple silicon.
- Latencia y throughput en otras plataformas: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3.5-9B-GGUF-KQuant (este) | 9,20 B | no disponible | Q2_K, Q3_K_M, Q4_K_M, Q8_0 | Apache 2.0 | GGUF, Kapitsa, llama.cpp |
| Qwen/Qwen3.5-9B (base) | 9,20 B | no disponible | bf16 | Apache 2.0 | safetensors |
| Qwen3.5-9B MLX 4-bit KQuant (nace-ai) | 9,20 B | no disponible | 4-bit MLX | Apache 2.0 | MLX |

No se dispone de datos de benchmarks del modelo base ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento entre alternativas.

## Limitaciones y advertencias

- La unica cuantizacion medida es Q4_K_M; Q2_K, Q3_K_M y Q8_0 no tienen resultados publicados en esta ficha, por lo que su fidelidad respecto a bf16 es desconocida.
- Q8_0 se genero sin matriz de importancia, a diferencia de Q2_K, Q3_K_M y Q4_K_M.
- La cuantizacion introduce perdida de fidelidad: incluso Q4_K_M con imatrix solo coincide en el 95,0 % de los tokens top-1 con bf16 y obtiene 0,95 en GSM8K sobre 100 preguntas, no 1,0.
- No hay informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico del modelo base en la documentacion disponible.
- El campo de idiomas del repositorio no esta poblado, lo que impide confirmar el soporte multilingue.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, relevantes para despliegues de agentes.
- Las mediciones de velocidad provienen de un unico equipo (MacBook Pro M5 Pro, 48 GB) y de Kapitsa 0.2.32; no son extrapolables a otras plataformas.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propio repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026, por lo que carece de validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-GGUF-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante MLX 4-bit: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Motor de inferencia Kapitsa: https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
- Instalacion de Kapitsa via Homebrew: `brew install nace-ai/tap/kapitsa`

# mradermacher/Qwen3.5-9B-USS-Emergent-GGUF

## Resumen

Qwen3.5-9B-USS-Emergent-GGUF es la distribucion en formato GGUF de las cuantizaciones estaticas del modelo nightmedia/Qwen3.5-9B-USS-Emergent, un ajuste fino de la familia Qwen 3.5 con 9.197.093.888 parametros totales (aproximadamente 9,2 mil millones). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y se distribuye bajo licencia Apache 2.0. El modelo base combina tecnicas de destilacion, SFT con LoRA y fusion (mergekit) orientadas a razonamiento con cadena de pensamiento larga (long-CoT), codigo y escritura creativa.

La relevancia de esta ficha reside en que empaqueta un modelo de 9B con etiquetas declaradas de contexto muy largo (256k e incluso 1M de tokens en los tags del autor), soporte multimodal mediante ficheros mmproj y un rango amplio de cuantizaciones que van de 4,0 GB (Q2_K) a 18,5 GB (f16), lo que permite desplegarlo en hardware de consumo. El repositorio ocupa 85,1 GB e incluye tanto pesos completos como los ficheros GGUF individuales.

Conviene subrayar que se trata de un modelo experimental: los tags incluyen "experimental", "research" y referencias a destilacion de Claude 4.6, y no se han publicado resultados de benchmarks verificables en la informacion disponible. La ficha, por tanto, describe la arquitectura y el empaquetado con rigor, pero marca explicitamente como "no disponible" todo dato de rendimiento no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 256k y 1M tokens segun tags del autor; no confirmado en model card |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen 3.5 con 9,2B parametros. Los tags del autor indican un pipeline de entrenamiento que combina SFT con LoRA, fusion de modelos mediante mergekit y destilacion (etiquetas "claude-distillation", "claude4.6", "distillation"), ademas de "long-cot" y "chain-of-thought" para el razonamiento. Tambien aparecen etiquetas de "multi-token-prediction" y "speculative-decoding", que sugieren soporte o entrenamiento orientado a decodificacion especulativa, aunque no se detalla la implementacion.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se confirma la arquitectura exacta de atencion (si usa atencion lineal, GQA u otra variante) ni el mecanismo que habilita el contexto de 256k/1M tokens. Los ficheros mmproj (Q8_0 y f16) indican que el modelo incorpora un proyector multimodal, presumiblemente para entrada de imagen, aunque la model card no describe la torre de vision ni el rango de resoluciones soportado.

## Capacidades

- Generacion de texto conversacional con ajuste por instrucciones (instruction-tuned).
- Razonamiento con cadena de pensamiento larga (long-CoT) y modo de razonamiento explicito.
- Generacion de codigo y tareas de STEM y matematicas (segun tags del autor).
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, narrativa de todos los generos y ciencia ficcion.
- Roleplay y escritura vivida ("vivid prosing").
- Capacidades multilingues en ingles, chino, japones y espanol.
- Soporte multimodal mediante ficheros mmproj (proyector multimodal incluido en el repo).
- Compatibilidad declarada con endpoints (tag "endpoints_compatible").
- No se documenta explicitamente soporte de tool calling, function calling ni uso como agente multi-paso; no disponible.

## Casos de uso

- Generacion de codigo en pipelines de desarrollo: el modelo puede integrarse en asistentes de IDE o revision de PRs; su tamano de 9B permite ejecutarlo en una sola GPU de consumo con cuantizacion Q4_K_M (5,9 GB), lo que abarata el coste por token frente a modelos mayores.
- Escritura creativa y generacion de ficcion: los tags del autor enfatizan narrativa, tramas, subtramas y continuacion de escenas; es adecuado para herramientas de escritura asistida donde se necesita coherencia en pasajes largos, apoyandose en el contexto extendido declarado.
- Razonamiento y resolucion de problemas STEM: con modo long-CoT, puede emplearse en entornos educativos o de analisis tecnico donde se requiera traza de razonamiento, aunque sin benchmarks publicados conviene validar su fiabilidad en el dominio concreto.
- Atencion al cliente multilingue: al cubrir en, zh, ja y es, sirve para despliegues de soporte en esos cuatro idiomas; con cuantizacion Q4_K_S (5,6 GB) cabe en GPUs de 8-12 GB y permite conversaciones multi-turno.
- Procesamiento de documentos largos: si se confirma el contexto de 256k/1M tokens, podria resumir o extraer informacion de contratos, informes o expedientes extensos; es imprescindible validar empiricamente el contexto efectivo antes de produccion.
- Prototipado e investigacion: al ser un modelo experimental con licencia Apache 2.0 y pesos GGUF, es util para experimentos de destilacion, evaluacion de tecnicas de merge y comparativas de cuantizacion en laboratorio.
- Despliegue en local/edge: las cuantizaciones Q2_K (4,0 GB) y Q3_K_S (4,5 GB) permiten ejecucion en equipos con 8 GB de RAM/VRAM, util para demos offline o entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,0 GB (Q2_K), 5,6-5,9 GB (Q4_K_S / Q4_K_M), 7,7 GB (Q6_K), 9,9 GB (Q8_0) y 18,5 GB (f16). Sumar 0,7-1,0 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para cuantizaciones altas; A100 o H100 para f16 y para servir con contexto muy largo.
- Cabe en GPU de consumo: si, desde Q2_K en tarjetas de 6-8 GB hasta Q8_0 en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; vLLM y TGI requeririan los pesos en safetensors del modelo base, no los GGUF.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-USS-Emergent (este) | 9,2B | 256k/1M (segun tags, no confirmado) | Apache 2.0 | GGUF, safetensors | Experimental, orientado a long-CoT y ficcion |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Apache 2.0 | safetensors, GGUF | Referencia estable de la familia Qwen; benchmarks publicos disponibles |
| Llama 3.1 8B Instruct | 8,0B | 128k | Llama 3.1 Community License | safetensors, GGUF | Amplia adopcion, ecosistema maduro, benchmarks publicos |
| Mistral 7B Instruct | 7,2B | 32k | Apache 2.0 | safetensors, GGUF | Menor contexto, muy desplegado en local |

La comparacion se limita a parametros, contexto y licencia porque no hay datos de rendimiento publicados para este modelo. Frente a las alternativas, su ventaja declarada es el contexto extendido y el enfasis en long-CoT y escritura creativa; su desventaja es la ausencia de benchmarks verificables y su caracter experimental.

## Limitaciones y advertencias

- Modelo experimental: los propios tags lo etiquetan como "experimental" y "research"; no deberia asumirse estabilidad en produccion sin evaluacion previa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni similares; cualquier afirmacion de rendimiento seria especulativa.
- Contexto no verificado: las cifras de 256k y 1M tokens provienen solo de tags; el contexto efectivo puede ser menor y degradarse en ventanas muy largas.
- Riesgo de alucinacion: inherente a los modelos generativos; la destilacion desde otros modelos puede introducir sesgos y errores heredados no documentados.
- Sesgos conocidos: no documentados en la informacion disponible; los idiomas cubiertos (en, zh, ja, es) probablemente tengan calidad desigual, con menor representacion del espanol.
- Soporte de tool calling y agentes no confirmado: no se documenta, por lo que no conviene asumirlo en disenos de agentes.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden tener obligaciones adicionales no detalladas; revisar antes de desplegar.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el propio autor recomienda Q4_K_S o Q4_K_M como equilibrio rapido/calidad.
- El repositorio de 85,1 GB incluye todos los formatos; descargar solo el fichero GGUF necesario para evitar consumo de disco innecesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-USS-Emergent-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-USS-Emergent
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-USS-Emergent-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-USS-Emergent-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png

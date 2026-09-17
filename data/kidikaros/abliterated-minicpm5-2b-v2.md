# KidIkaros/abliterated-minicpm5-2b-v2

## Resumen

Abliterated MiniCPM5-2B v2 es un derivado no oficial de `openbmb/MiniCPM5-2B` publicado por el usuario KidIkaros en HuggingFace. Se trata de un modelo de generación de texto de 2.516.756.480 parámetros (aproximadamente 2,52 mil millones) que aplica una doble intervención sobre el checkpoint original: una reablación mediante el método diff-in-means de Arditi y un ajuste posterior con DPO (Direct Preference Optimization) sobre pares de preferencia. El objetivo declarado es reducir la tasa de rechazo de respuesta (refusal) manteniendo la capacidad del modelo dentro de un margen aceptable. La versión v2 sustituye a la v0 (`KidIkaros/abliterated-minicpm5-2b`), que según las mediciones del propio autor era estadísticamente indistinguible del modelo oficial tanto en rechazo como en capacidades.

La relevancia de esta ficha es acotada y conviene enmarcarla con precisión: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados por OpenBMB para esta variante y con métricas obtenidas exclusivamente con un arnés local del autor. El modelo elimina direcciones de rechazo proyectándolas fuera de 84 matrices de proyección, lo que reduce la tasa de rechazo de ~36,7 % (oficial) a 5,7-10,3 % (v2) a temperatura 1.0, a cambio de una regresión medible en MMLU-Pro (−4,14 pp) y MATH-500 (−3,00 pp).

La licencia es Apache 2.0, heredada del modelo base, y se distribuye tanto en safetensors fp16 (checkpoint fusionado) como en tres cuantizaciones GGUF: F16, Q8_0 y Q4_K_M. El repositorio ocupa 14,3 GB en total. No es una publicación de OpenBMB y su uso en producción debería tratarse con cautela adicional por la naturaleza del proceso de abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `llama` en HuggingFace); detalles de capas y atención no disponibles |
| Parametros totales | 2.516.756.480 (~2,52 B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo oficial de llama.cpp usa `-c 8192`. Los prompts de LongBench-E citados rondan las 3.600 palabras |
| Tipos de cuantizacion | fp16 (safetensors), GGUF F16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16, checkpoint fusionado) y GGUF (llama.cpp) |
| Modelo base | `openbmb/MiniCPM5-2B`; derivado directo de `KidIkaros/abliterated-minicpm5-2b` (v0) |
| Tamano del repositorio | 14,3 GB |
| Tokenizer | Plantilla de chat de producción embebida en los GGUF; `tokenizer.ggml.pre=minicpm5` |
| Requisito de runtime | llama.cpp >= b9354 para el pre-tokenizer `minicpm5` |
| Decodificacion recomendada | `temperature=1.0, top_p=0.95, min_p=0.0` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `openbmb/MiniCPM5-2B`, un transformer denso de ~2,52 B de parámetros; la model card no detalla el número de capas, cabezas de atención, tipo de atención ni la composición del dataset de preentrenamiento original. Lo que sí documenta el autor es la cadena de intervenciones aplicadas sobre el checkpoint base:

1. Reablación: se identificó una dirección de rechazo en la capa 20 mediante el método diff-in-means (Arditi et al.) y se proyectó fuera de las 84 matrices `o_proj` y `down_proj` del modelo, generando el checkpoint intermedio `reablated_a`.
2. DPO LoRA: sobre ese checkpoint se entrenó un adaptador LoRA con DPO, con learning rate 5e-6, beta 0.1, 2 épocas y 593 pares de preferencia (453 provenientes de refusal-50k/VellumK2 y 140 minados on-policy), dando lugar a `dpo_lora_c`.
3. Fusión: el adaptador se fusionó sobre el modelo en CUDA y en fp16, produciendo `v2_merged`, que es el artefacto publicado.

La innovación técnica relevante no está en la arquitectura sino en el procedimiento de abliteración combinado con DPO, y en la validación honesta que hace el autor del coste de capacidad asociado. El autor advierte explícitamente de una patología del modelo base: la decodificación greedy combinada con prompts de tipo "thinking" puede caer en bucles de repetición, tanto en la variante oficial como en esta. También señala que la fusión se hizo en fp16 y que el safetensors publicado es byte-idéntico al candidato evaluado, con hashes sha256 publicados para `model.safetensors` y para los tres GGUF.

## Capacidades

- Generación de texto conversacional con plantilla de chat integrada y soporte de `apply_chat_template` en transformers.
- Razonamiento y conocimiento general a nivel de modelo de ~2,5 B: MMLU-Pro 38,43 en el arnés del autor.
- Matemáticas: MATH-500 47,30 en el mismo arnés, con prompts sin modo thinking.
- Seguimiento de instrucciones: IFEval 85,58, la única tarea donde v2 no empeora respecto al oficial (+0,65 pp, IC que incluye cero).
- Procesamiento de contexto largo moderado: evaluación en LongBench-E con prompts de aproximadamente 3.600 palabras.
- Tasa de rechazo reducida: 5,7 % (semilla 0) y 10,3 % (semilla 1) sobre 300 prompts a temperatura 1.0, frente al 36,7 % del modelo oficial.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; no hay evaluación específica ni mención de modo thinking funcional (de hecho, los benchmarks se reportan en "no-thinking mode").
- Capacidades multilingües: no disponibles; no se declara cobertura de idiomas.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Generación de texto en experimentos de alineación: el modelo sirve como artefacto de estudio para investigar cómo la abliteración afecta a la tasa de rechazo y al rendimiento en conocimiento y matemáticas, con un protocolo de medición reproducible publicado y hashes verificables.
- Evaluación comparativa de técnicas de reducción de rechazo: permite contrastar empíricamente el efecto de una reablación sobre 84 matrices frente a un DPO con 593 pares, usando el par oficial/v0/v2 como línea base.
- Despliegue local en hardware de gama media: con Q4_K_M (~1,5-1,6 GB de pesos) se integra en portátiles y equipos sin GPU dedicada mediante llama.cpp, con `-ngl 99` para descarga completa en GPU si hay VRAM suficiente.
- Prototipado de asistentes conversacionales en local: la plantilla de chat viene embebida en los GGUF y el modelo responde en modo conversacional directo, útil para maquetas que no pueden enviar datos a APIs externas.
- Generación de texto en pipelines sin conexión: al ser Apache 2.0 y distribuirse en GGUF, se puede empaquetar en herramientas de escritorio o entornos air-gapped sin dependencia de servicios en la nube.
- Pruebas de robustez frente a prompts adversarios: la caída de la tasa de rechazo lo convierte en un candidato para estudiar el comportamiento del modelo ante instrucciones límite, siempre que el objetivo sea la investigación y no la producción de contenido dañino.
- Fine-tuning posterior sobre dominio específico: al ser un modelo de 2,5 B con safetensors fp16, se puede ajustar con LoRA en una única GPU consumer para tareas verticales (clasificación, extracción, resumen de dominio).
- Servicio de inferencia ligero autoalojado: el tamaño permite servirlo con llama.cpp a velocidades de decodificación de tres dígitos de tokens por segundo en GPUs de gama media (85 tok/s Q8_0 y 116 tok/s Q4_K_M en una RX 9060 XT con backend HIP).

## Benchmarks y rendimiento

Todas las cifras provienen del arnés local `release_core` con lm-eval 0.4.13, idéntico entre candidatos (mismo tokenizer, plantilla de chat, prompts, decodificación y carga), en modo no-thinking. El propio autor advierte que estos números no son comparables con los valores publicados por OpenBMB en su leaderboard.

| Tarea | n | oficial | v0 | v2 | v2 − oficial (IC 95% emparejado) |
|---|---:|---:|---:|---:|---:|
| MMLU-Pro | 350×2 | 42,57 | 44,71 | 38,43 | −4,14 pp [−8,14, −0,14] |
| MATH-500 | 500×2 | 50,30 | 51,40 | 47,30 | −3,00 pp [−5,80, −0,20] |
| IFEval | 541×2 | 84,94 | 84,84 | 85,58 | +0,65 pp [−1,20, +2,50] |
| LongBench-E single-doc QA | 6 | 65,56 | 82,22 | 82,22 | +16,67 pp [0,00, +50,00] |
| LongBench-E multi-doc QA | 6 | 77,78 | 77,78 | 66,67 | −11,11 pp [−33,33, 0,00] |
| LongBench-E summarization | 6 | 29,23 | 27,74 | 28,86 | −0,38 pp [−1,14, +0,37] |
| LongBench-E synthetic | 6 | 0,00 | 66,67 | 66,67 | +66,67 pp [+33,33, +100,00] |

Retención macro por dominio frente al oficial: 105,2 % (objetivo predeclarado >= 95 %, superado). Excluyendo la tarea sintética marcada, ~98,0 %. La perplejidad en prosa neutra pasa de 6,87 (v0) a 7,54 (v2).

Puerta de rechazo (300 prompts, temperatura 1.0 / top_p 0.95 / min_p 0.0):

| Candidato | Semilla 0 | Semilla 1 | Degenerados |
|---|---:|---:|---:|
| MiniCPM5-2B oficial | 36,7 % | — | 0 |
| abliterated v0 | 40,7 % | — | 0 |
| v2 (este repositorio) | 5,7 % | 10,3 % | 0 |

El autor matiza que solo 5 de 300 prompts rechazan en ambas semillas y que, tras descontar rechazos de seguridad y de alcance de conocimiento defendibles, la tasa real de falso rechazo queda en ~2-3 %. La tarea `longbench_synthetic_e` se marca como sensible a la decodificación: el modelo oficial emite EOS en 0-2 tokens bajo greedy no-thinking en prompts de ~3.600 palabras, lo que el autor interpreta como patología de EOS temprano y no como medida de capacidad. Los grupos LongBench-E tienen n=6 por candidato y solo aportan señal de nivel smoke.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no dato publicado): fp16 ~5-5,5 GB de pesos; Q8_0 ~2,7-3 GB; Q4_K_M ~1,5-2 GB. Añadir margen para KV cache y activaciones según contexto.
- Cabe en GPU consumer: sí, en todas las cuantizaciones. Q4_K_M y Q8_0 son viables en GPU con 4-6 GB de VRAM (GTX 1650 4 GB en Q4, RTX 3060, RTX 4060, etc.); fp16 requiere del orden de 6-8 GB y encaja en RTX 3060 12 GB, RTX 4070, RTX 4090.
- Ejecución íntegra en CPU: viable con llama.cpp en Q4_K_M, aunque el autor solo reporta cifras con backend HIP en GPU.
- GPU de gama alta (A100, H100): innecesarias para inferencia por el tamaño del modelo; solo tendrían sentido para fine-tuning o para servir muchas réplicas en paralelo.
- Opciones de despliegue: transformers con `AutoModelForCausalLM.from_pretrained(..., torch_dtype="auto", device_map="auto")`; llama.cpp con `llama-cli -m minicpm5-2b-v2-q8_0.gguf -ngl 99 -c 8192`; cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, LM Studio). vLLM y TGI no están mencionados en la información disponible, aunque el checkpoint safetensors es compatible en principio con servidores que acepten arquitectura `llama`.
- Rendimiento medido: en una RX 9060 XT con backend HIP, Q8_0 ~85 tok/s y Q4_K_M ~116 tok/s. No se publican cifras de latencia por petición ni throughput con batching.
- Requisito de version: llama.cpp >= b9354 para el pre-tokenizer `minicpm5`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (300 prompts, temp 1.0) | MMLU-Pro | MATH-500 | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| KidIkaros/abliterated-minicpm5-2b-v2 | ~2,52 B | no disponible | 5,7 % / 10,3 % | 38,43 | 47,30 | 85,58 | Apache 2.0 | safetensors fp16 + GGUF F16/Q8_0/Q4_K_M |
| KidIkaros/abliterated-minicpm5-2b (v0) | ~2,52 B | no disponible | 40,7 % | 44,71 | 51,40 | 84,84 | Apache 2.0 | safetensors + GGUF |
| openbmb/MiniCPM5-2B (oficial) | ~2,52 B | no disponible | 36,7 % | 42,57 | 50,30 | 84,94 | Apache 2.0 | safetensors |

No se dispone de datos verificados en la información proporcionada para comparar con otras familias de tamaño similar (por ejemplo alternativas de ~2-3 B de otros laboratorios): sus parámetros, contexto, licencias y métricas figuran como no disponibles. Cualquier comparación con cifras del leaderboard de OpenBMB queda expresamente desaconsejada por el propio autor, ya que su arnés local no es equivalente.

## Limitaciones y advertencias

- Regresión de capacidad medida y estadísticamente significativa: MMLU-Pro −4,14 pp y MATH-500 −3,00 pp frente al oficial, con intervalos de confianza que excluyen el cero. El autor afirma explícitamente que v2 no es idéntico en capacidad al modelo oficial.
- Aumento de perplejidad en prosa neutra: 7,54 frente a 6,87 de la v0, lo que sugiere un deterioro de la fluidez fuera de los dominios evaluados.
- Rechazos residuales: quedan aproximadamente 5 rechazos deterministas en el conjunto de 300 prompts, algunos de ellos casos de seguridad defendibles. El comportamiento de rechazo es estocástico en el límite de temperatura y puede variar entre semillas.
- Riesgo de bucles de repetición con decodificación greedy combinada con prompts de razonamiento; es una patología heredada del modelo base de 2 B, presente también en el oficial.
- Sensibilidad a la decodificación en la tarea `longbench_synthetic_e`, con EOS temprano en el modelo oficial bajo greedy no-thinking. Conviene no usar esa métrica como referencia de capacidad.
- Fiabilidad estadística muy baja en los grupos LongBench-E (n=6 por candidato): señal de nivel smoke, no concluyente.
- Sesgos conocidos: no disponibles. No hay evaluación de sesgo, toxicidad ni seguridad publicada para esta variante, y la reducción deliberada de rechazos puede aumentar la probabilidad de generar contenido problemático ante prompts adversarios.
- Alucinación: no se han publicado mediciones específicas de factualidad o tasa de alucinación en la información disponible.
- Idiomas soportados: no disponibles. No se declara cobertura multilingüe ni calidad por idioma, por lo que no se debe asumir un rendimiento homogéneo fuera del inglés.
- Contexto máximo: no declarado. El ejemplo de llama.cpp usa 8192 tokens, pero no hay confirmación de que sea el límite del modelo.
- Licencia Apache 2.0, sin restricciones declaradas para uso comercial. No obstante, al ser un derivado abliterado no oficial, la responsabilidad sobre el cumplimiento normativo y sobre el contenido generado recae íntegramente en quien lo despliega.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni validación independiente de las métricas publicadas.
- Verificación de integridad recomendada: se publican hashes sha256 para `model.safetensors`, `minicpm5-2b-v2-f16.gguf`, `minicpm5-2b-v2-q8_0.gguf` y `minicpm5-2b-v2-q4_k_m.gguf`. Conviene comprobarlos tras la descarga o cualquier copia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b-v2
- Versión anterior (v0): https://huggingface.co/KidIkaros/abliterated-minicpm5-2b
- Modelo base oficial: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper de referencia del método de abliteración (diff-in-means, Arditi et al.): no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
- Demos, blogs o informes adicionales: no disponible; la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a una campaña institucional neerlandesa sin relación con el tema).

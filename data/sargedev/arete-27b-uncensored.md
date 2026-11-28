# SargeDev/Arete-27B-Uncensored

## Resumen

Arete-27B-Uncensored es una variante "abliterated" del modelo NousResearch/Arete-27B, que a su vez es un ajuste fino supervisado (SFT) de parametros completos sobre Qwen3.8-27B orientado a la alineacion de valores. El autor, SargeDev, publica esta version como la primera variante sin censura de Arete, aplicando una ablacion de la direccion de rechazo sobre 15 capas del transformer. El modelo conserva la arquitectura y el tamano del original: 26.895.998.464 parametros (aproximadamente 27B) en formato bf16, distribuidos en 28 shards que suman 53,8 GB.

El objetivo declarado es eliminar los comportamientos de rechazo del modelo base manteniendo intacta la capacidad general. Segun la model card, la edicion cuesta aproximadamente 2 puntos de MMLU (79,0% frente al 81,25% del base sin abliterar), una diferencia que el autor situa dentro del ruido estadistico de la evaluacion (n=400, error estandar en torno al 2%). El modelo se publica bajo licencia Apache 2.0 y esta etiquetado como `abliterated`, `uncensored` y `qwen3.8`.

Es relevante en el ecosistema porque demuestra un flujo de trabajo reproducible de abliteracion con puertas de calidad medibles (coherencia, divergencia KL, perplejidad) y porque conserva los tensores del drafter MTP/nextn, lo que permite mantener decodificacion especulativa. La model card menciona ademas una V2 con entrenamiento de decision Solar y una bateria de evaluacion de censura y propaganda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5_text`); incluye cabeza MTP/nextn para decodificacion especulativa |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en este repo; la model card menciona variantes comunitarias GGUF (Q8_0), EXL3 (4.0 bpw) y NVFP4-FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 53,8 GB, 28 shards) |

## Arquitectura y entrenamiento

El modelo parte de NousResearch/Arete-27B, descrito por el autor como un SFT de parametros completos sobre Qwen3.8-27B orientado a la alineacion de valores. Sobre esa base se aplico una ablacion de la direccion de rechazo (abliteration) con la herramienta OBLITERATUS en modo `--method aggressive`, en bf16 y utilizando un conjunto de contraste de 842 prompts de tipo harm/harmless. La edicion afecta a 15 capas consideradas "fuertes", con las capas 59-63 identificadas como las mas intensamente modificadas.

Tras la intervencion se midieron puertas de calidad: coherencia 1,0, divergencia KL de 0,90 frente al base y un aumento de perplejidad de 3,22 a 3,93. Los tensores del drafter MTP/nextn se preservaron con la cabeza estandar de Qwen3.8, de modo que la decodificacion especulativa sigue funcionando. No se dispone de informacion sobre el volumen de tokens de entrenamiento del SFT original, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con MMLU del 79,0% en el subconjunto generativo de 8 materias (400 preguntas, 5-shot, greedy).
- Respuestas sin rechazo ante prompts considerados daninos: la model card reporta 15/15 entregados en una bateria de 15 prompts duros (desarrollo de exploits, red-team, malware, DoS) en bf16.
- Codigo y matematicas: capacidades heredadas del base Qwen3.8-27B; la model card afirma que la "capability suite" queda intacta tras la ablacion, sin detallar resultados por tarea.
- Decodificacion especulativa mediante la cabeza MTP/nextn preservada.
- Compatibilidad con servidores tipo OpenAI (vLLM, llama-server) segun la configuracion de referencia citada.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como varia el comportamiento de rechazo tras una ablacion de direccion, con metricas de referencia publicadas (KL 0,90, perplejidad 3,93) para comparar contra el base.
- Red teaming y evaluacion de seguridad: util para generar respuestas que un modelo alineado bloquearia y asi probar clasificadores, filtros de salida y sistemas de moderacion en condiciones controladas.
- Generacion de datos sinteticos para entrenamiento: al no rechazar temas sensibles, puede producir corpus de texto en dominios que los modelos alineados evitan, siempre dentro de marcos legales y eticos.
- Evaluacion comparativa de cuantizaciones: el autor publica resultados por formato (bf16, NVFP4-FP8, GGUF Q8_0, EXL3 4.0 bpw), lo que lo convierte en un banco de pruebas para medir la perdida de calidad por cuantizacion.
- Despliegue en inferencia de altas prestaciones: con 27B en bf16 y soporte de decodificacion especulativa, encaja en pipelines vLLM sobre GPU de datacenter para tareas de generacion a gran escala.
- Estudio de sesgos y contenido nocivo: util para auditar que tipo de contenido genera un modelo sin capa de rechazo y documentar riesgos antes de decidir politicas de despliegue.

## Benchmarks y rendimiento

| Formato | MMLU (subconjunto 8 materias, 400 q, 5-shot, greedy) | Harness |
|---|---|---|
| bf16 (este repo) | 79,0% | lm-eval chat-completions |
| NVFP4-FP8 | 79,8% | lm-eval chat-completions |
| GGUF Q8_0 | 79,0% | lm-eval chat-completions via llama-server |
| EXL3 4.0 bpw | 72,5% | exllamav3 (harness propio, formato emparejado) |
| Arete-27B stock (referencia) | 81,25% | lm-eval chat-completions |

El autor senala que la diferencia de aproximadamente 2 puntos frente al base esta dentro del ruido (n=400, error estandar en torno al 2%). La caida de EXL3 (6,5 puntos) se atribuye en parte al harness distinto y en parte a la cuantizacion, y debe tomarse como cota superior del coste de calidad. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para bf16: aproximadamente 54 GB de pesos mas overhead de KV cache; requiere GPU de 80 GB (A100 80GB, H100 80GB) o multiples GPU.
- Cuantizaciones de 8 bits (GGUF Q8_0): en torno a 27-30 GB, viable en una RTX 4090 de 24 GB solo con offload parcial o en GPU de 40-48 GB.
- Cuantizaciones de 4 bits (EXL3 4.0 bpw, NVFP4): aproximadamente 14-16 GB de pesos, lo que permite ejecucion en consumer GPU de 24 GB (RTX 4090, RTX 3090) con contexto limitado.
- Despliegue: vLLM como configuracion de referencia en bf16; llama.cpp/llama-server para GGUF; exllamav3 para EXL3. Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles; la model card solo indica el tamano y numero de shards del formato bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Notas |
|---|---|---|---|---|---|
| SargeDev/Arete-27B-Uncensored | ~27B | No disponible | 79,0% (bf16) | Apache 2.0 | Abliterated con OBLITERATUS; drafter MTP preservado |
| NousResearch/Arete-27B | ~27B | No disponible | 81,25% | No disponible en la informacion | Base alineado; rechaza prompts daninos |
| SargeDev/Arete-27B-Uncensored-V2 | ~27B | No disponible | No disponible | No disponible en la informacion | Incorpora entrenamiento de decision Solar; fact score 2,61/5 y propaganda 1,1% en la eval de censura y propaganda |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los comportamientos de rechazo: puede producir contenido danino (exploits, malware, material de red-team) sin filtros, lo que exige controles adicionales en cualquier despliegue.
- La ablacion reduce el rendimiento en MMLU en torno a 2 puntos respecto al base (79,0% frente a 81,25%), aunque el autor lo considera dentro del ruido.
- La perplejidad aumenta de 3,22 a 3,93 tras la edicion, lo que puede traducirse en una ligera perdida de fluidez o coherencia en dominios exigentes.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de veracidad; el comportamiento del base en este aspecto no esta documentado en la informacion disponible.
- La model card no detalla sesgos conocidos, idiomas soportados ni longitud de contexto, lo que limita la evaluacion para produccion multilingue o de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incumplir normativas sectoriales o terminos de servicio de plataformas; la responsabilidad recae en el desplegador.
- Los resultados de EXL3 4.0 bpw proceden de un harness distinto, por lo que no son directamente comparables con el resto de la tabla.
- El modelo tiene un historial de adopcion muy bajo (188 descargas, 0 likes en el momento de la consulta), sin validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Variante V2: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Modelo base: https://huggingface.co/NousResearch/Arete-27B

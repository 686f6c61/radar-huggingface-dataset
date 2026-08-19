# mradermacher/Gemma-4-26B-A4B-Plainspeak-SOMPOA-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `26B-Suite/BROKEN_Gemma-4-26B-A4B-Plainspeak-SOMPOA`, un merge basado en el Gemma-4-26B-A4B de Google. El modelo original es un MoE (Mixture of Experts) de 26.000 millones de parámetros totales con 4.000 millones de parámetros activos, y el merge incorpora modificaciones orientadas a conversación, roleplay y escritura creativa, con un enfoque "ablated" (eliminación de capas o parámetros) y etiquetado como "uncensored" o "heretic". El autor de las cuantizaciones es mradermacher, conocido por generar GGUF estáticos de modelos populares.

La relevancia de este modelo radica en que ofrece una alternativa de código abierto con licencia Apache 2.0 para tareas de generación de texto creativo y conversacional, con la eficiencia computacional de un MoE (solo 4B activos) y la posibilidad de ejecutarse en hardware de consumo gracias a las cuantizaciones GGUF. Incluye además ficheros `mmproj` que sugieren capacidades multimodales (visión), aunque el modelo base no las detalla explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 |
| Parametros totales | 25.233.142.046 |
| Parametros activos | 4.000.000.000 (aprox., segun arquitectura Gemma-4-26B-A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | ingles (eng) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien disponible en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base es un Gemma-4-26B-A4B, un transformer MoE con 26B parametros totales y 4B activos, disenado por Google para eficiencia en inferencia. El merge `BROKEN_Gemma-4-26B-A4B-Plainspeak-SOMPOA` combina este modelo con tecnicas de mergekit, e incorpora modificaciones "ablated" (eliminacion selectiva de componentes) orientadas a mejorar el rendimiento en conversacion, roleplay y escritura creativa, eliminando parcialmente los mecanismos de seguridad estandar del modelo original. El etiquetado "uncensored" y "heretic" sugiere que se ha reducido el rechazo a contenido delicado o explicito.

Los detalles exactos del entrenamiento (numero de tokens, dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La cuantizacion GGUF fue realizada por mradermacher mediante conversion estatica, sin usar imatrix ni weighted quants en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional y creativo en ingles.
- Soporte de roleplay y escritura de ficcion con estilo natural.
- Capacidades multimodales potenciales gracias a los ficheros `mmproj` (vision), aunque no confirmadas en la documentacion.
- Eficiencia computacional notable al ser MoE con solo 4B parametros activos.
- No se menciona soporte explicito de tool calling ni function calling.
- No se menciona soporte de agentes ni multi-step reasoning.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones coherentes y con personalidad en escenarios de ficcion, gracias a su entrenamiento orientado a este fin y su ventana de contexto (no especificada, pero tipica de Gemma 4).
- Escritura creativa asistida: generacion de dialogos, narraciones y guiones con un tono natural y menos restricciones que los modelos estandar.
- Chatbots locales sin censura: ideal para proyectos que requieran un asistente conversacional sin filtros de contenido, siempre que se asuman los riesgos eticos y legales.
- Prototipado rapido de aplicaciones de texto: al ser GGUF, puede desplegarse en local con llama.cpp u Ollama para pruebas sin coste de API.
- Generacion de contenido para juegos de rol: el modelo puede crear personajes, tramas y respuestas adaptativas para juegos de mesa o videojuegos.
- Experimentacion con modelos ablacionados: util para investigadores que estudian el efecto de eliminar capas de seguridad en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10.7 GB (Q2_K) y 27.0 GB (Q8_0), segun el fichero GGUF elegido.
- GPU recomendadas: para cuantizaciones Q4_K_M o inferiores, una RTX 3090/4090 con 24 GB es suficiente; para Q6_K o Q8_0, se recomienda una GPU con 32 GB o mas, como A100 o RTX 6000 Ada.
- En consumer GPU: si, con cuantizaciones Q4_K_M o menores en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles, pero al ser MoE con 4B activos, la velocidad de generacion deberia ser similar a un modelo denso de 4B, no de 26B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B (original) | 26B total, 4B activo | no disponible | Gemma Terms of Use | safetensors | Modelo base sin modificaciones |
| Gemma-4-26B-A4B-Plainspeak-SOMPOA | 26B total, 4B activo | no disponible | Apache 2.0 | safetensors | Merge con modificaciones para roleplay y menos censura |
| mradermacher/gemma-4-26B-A4B-it-heretic-GGUF | 26B total, 4B activo | no disponible | Apache 2.0 | GGUF | Variante similar, tambien "heretic" |

## Limitaciones y advertencias

- El modelo esta etiquetado como "uncensored" y "heretic", lo que implica que puede generar contenido ofensivo, ilegal o eticamente cuestionable. Su uso en produccion debe evaluarse cuidadosamente.
- Solo soporta ingles, limitando su uso en entornos multilingues.
- No se proporcionan datos de contexto maximo, benchmarks ni detalles de entrenamiento, lo que dificulta evaluar su rendimiento real.
- Las cuantizaciones son estaticas y no usan imatrix, lo que puede afectar a la calidad de la perplejidad en comparacion con quants ponderados.
- La licencia Apache 2.0 aplica al repo GGUF, pero el modelo base puede tener restricciones adicionales de Google (Gemma Terms of Use).
- Al ser un merge "BROKEN" (nombre del repo base), podria contener artefactos o degradaciones respecto al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-4-26B-A4B-Plainspeak-SOMPOA-GGUF
- Modelo base: https://huggingface.co/26B-Suite/BROKEN_Gemma-4-26B-A4B-Plainspeak-SOMPOA
- Variante similar: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-GGUF
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b
- Technical Report (arXiv): https://arxiv.org/pdf/2607.02770

# ITLL/granite-4.2-8b-heretic-GGUF

## Resumen

Granite-4.2-8B-Heretic GGUF es una coleccion de cuantizaciones GGUF del modelo richardyoung/granite-4.2-8b-heretic, que a su vez es una version "abliterated" (sin la direccion de rechazo) del modelo instruct de IBM ibm-granite/granite-4.2-8b. El modelo original de IBM es un transformer denso de aproximadamente 8.790 millones de parametros, multilingue (12 idiomas segun la model card), con soporte de tool calling y modo de razonamiento (thinking mode). La modificacion heretic elimina la mayor parte de los rechazos de seguridad mediante ablacion de la direccion de rechazo en el flujo residual, sin reentrenamiento.

El resultado, segun los datos del autor, reduce los rechazos de 99/100 a 12/100 (una reduccion del 88%) con una divergencia KL de 0,080 respecto al modelo abliterated de referencia, muy por debajo del umbral de 0,5 que el autor considera indicativo de dano. Esto sugiere que el modelo conserva practicamente todas sus capacidades y coherencia originales.

La relevancia de esta ficha radica en que ofrece una via de inferencia local sin restricciones de rechazo sobre un modelo de 8B con licencia Apache-2.0, cuantizado en varios niveles (desde IQ3_M de 4,1 GB hasta Q8_0 de 9,3 GB) y con metricas de calidad por cuantizacion (KL divergence, top-token match, perplejidad) publicadas por el autor. Esta pensado para investigacion, escritura creativa, educacion sobre tecnicas de alineacion e inferencia local sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: IBM Granite 4.2 8B instruct) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (mas imatrix de calibracion) |
| Idiomas soportados | 12 idiomas segun la model card del modelo base (lista concreta no disponible) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de IBM (familia Granite 4.2, variante de 8B en modo instruct) con capacidades multilingues, tool calling y thinking mode. Sobre esa base, richardyoung aplico la tecnica de abliteration con la herramienta Heretic, que automatiza la busqueda de parametros de ablacion mediante un optimizador (200 pruebas en este caso) y conserva las combinaciones que mejor equilibran la reduccion de rechazos frente a la divergencia KL respecto al modelo original. La abliteration actua sobre la direccion de rechazo del flujo residual, segun el paper "Refusal in Language Models Is Mediated by a Single Direction" (arXiv:2406.11717).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en el modelo base dentro de la informacion proporcionada. La cuantizacion GGUF se genero con llama.cpp, usando una importance matrix (imatrix) calibrada con el dataset calibration_datav3 para los cuantos IQ y para Q4_K_M/Q5_K_M. El autor publica metricas de calidad por cuantizacion medidas con `llama-perplexity --kl-divergence` sobre wikitext-2 (40 fragmentos de 512 tokens), con una perplejidad F16 de referencia de 16,93.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, tag conversational).
- Razonamiento con modo thinking (heredado del modelo base Granite 4.2 8B instruct).
- Soporte de tool calling / function calling (segun la model card del modelo base).
- Capacidades multilingues: 12 idiomas segun la model card del modelo base.
- Inferencia local sin rechazos de seguridad en la mayoria de peticiones (12/100 rechazos tras la ablacion, frente a 99/100 del original).
- Compatible con endpoints (tag endpoints_compatible) y con el ecosistema llama.cpp/Ollama.
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion de la direccion de rechazo comparando directamente con el Granite 4.2 8B original, con metricas de rechazo (99/100 frente a 12/100) y divergencia KL (0,080) publicadas para reproducir el analisis.
- Escritura creativa sin restricciones: al eliminar la mayoria de rechazos, el modelo puede abordar narrativa con temas sensibles (violencia ficcional, personajes moralmente ambiguos) que el modelo original rechazaria, manteniendo coherencia segun la baja KL divergence reportada.
- Educacion sobre tecnicas de abliteration: util como material didactico para explicar como se identifica y elimina una direccion de rechazo en el espacio residual, con la herramienta Heretic y el paper de referencia.
- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M (5,3 GB) e IQ4_XS (4,8 GB) permiten ejecutar el modelo en GPU consumer o incluso CPU, con calidad cercana al F16 (KL 0,106 y 0,119 respectivamente).
- Generacion de codigo y asistencia tecnica en pipelines locales: el modelo base soporta tool calling y puede integrarse en flujos de desarrollo con llama-cpp-python u Ollama, sin dependencia de APIs externas.
- Despliegue de asistentes conversacionales sin filtros en entornos controlados: para prototipos internos donde se necesita que el modelo responda a cualquier peticion sin capas de rechazo, con la advertencia de que el contenido generado debe revisarse.
- Evaluacion comparativa de cuantizaciones: el autor publica perplejidad, KL divergence y top-token match por cuantizacion, lo que permite elegir el nivel de compresion segun el presupuesto de VRAM y la tolerancia a la deriva de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor unicamente publica metricas de calidad de cuantizacion:

| Cuantizacion | Tamano | KL divergence | Top-token match | Perplejidad (F16: 16,93) |
|---|---|---|---|---|
| IQ3_M | 4,1 GB | 0,2835 | 80,1% | 17,83 |
| IQ4_XS | 4,8 GB | 0,1194 | 87,3% | 17,20 |
| Q4_K_M | 5,3 GB | 0,1060 | 88,5% | 17,62 |
| Q5_K_M | 6,3 GB | 0,0435 | 93,2% | 17,08 |
| Q6_K | 7,2 GB | 0,0435 | 93,7% | 17,04 |
| Q8_0 | 9,3 GB | 0,0089 | 97,8% | 17,02 |

Metricas de abliteration del modelo base:

| Metrica | Valor |
|---|---|
| Rechazos en el modelo base | 99/100 |
| Rechazos tras abliteration | 12/100 |
| Reduccion de rechazos | 88% |
| KL divergence respecto al original | 0,080 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_M (5,3 GB de pesos mas overhead de contexto), 4,5-5,5 GB con IQ4_XS, 8-10 GB con Q8_0 (9,3 GB de pesos).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para mayor throughput y contexto. Cualquier GPU con 6 GB o mas puede ejecutar Q4_K_M.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas usando Q4_K_M o IQ4_XS; con Q8_0 se recomienda 10-12 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (ollama run richardyoung/granite-4.2-8b-heretic o via hf.co), llama-cpp-python, y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ITLL/granite-4.2-8b-heretic-GGUF (este) | 8,79B | no disponible | Apache-2.0 | GGUF | Abliterated, 12 idiomas, tool calling |
| richardyoung/granite-4.2-8b-heretic | 8,79B (estimado) | no disponible | Apache-2.0 | safetensors | Modelo padre sin cuantizar |
| ibm-granite/granite-4.2-8b | 8,79B (estimado) | no disponible | Apache-2.0 | safetensors | Modelo original con rechazos (99/100) |
| richardyoung/granite-4.2-3b-heretic | 3B (estimado) | no disponible | Apache-2.0 | safetensors | Version menor de la misma familia |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la mayoria de rechazos de seguridad: el modelo respondera a peticiones que el original rechaza, lo que implica riesgo de generar contenido danino, ilegal o eticamente problematico. El autor indica uso responsable y conformidad con las leyes aplicables.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; al ser un modelo de 8B, es esperable un riesgo de alucinacion similar al de su clase, pero no hay datos concretos.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; el modelo hereda los del base IBM Granite 4.2 8B, no evaluados aqui.
- Limitaciones de contexto e idioma: la longitud de contexto no esta disponible; los 12 idiomas del modelo base no se enumeran, por lo que no se puede verificar el soporte concreto de cada uno.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el uso de un modelo abliterated en produccion puede conllevar responsabilidad legal por el contenido generado; conviene revisar las politicas de la organizacion.
- Caveat de produccion: las cuantizaciones IQ3_M e IQ4_XS muestran una deriva notable respecto a F16 (KL 0,28 y 0,12; top-token match 80,1% y 87,3%), por lo que para produccion se recomienda Q5_K_M o superior (KL 0,0435, top-token match superior al 93%).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre esta cuantizacion concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ITLL/granite-4.2-8b-heretic-GGUF
- Modelo base (abliterated): https://huggingface.co/richardyoung/granite-4.2-8b-heretic
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-4.2-8b
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Paper sobre la direccion de rechazo: https://arxiv.org/abs/2406.11717
- Paper del autor sobre evaluacion de instruction-following: https://arxiv.org/abs/2510.18892
- Heretic Grimoire (modelos reproducibles): https://huggingface.co/spaces/heretic-org/Heretic-Grimoire
- Otros modelos del autor: https://huggingface.co/richardyoung

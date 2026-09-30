# ldov/CLM-v0.1-8B

## Resumen

CLM-v0.1-8B es un modelo de ranking (pipeline `text-ranking`) publicado en HuggingFace por el usuario `ldov`, si bien el desarrollo corresponde al proyecto Contrastive-LM. No es un modelo generativo: se trata de un "System One model" que puntua candidatos y responde preguntas tipadas sobre un estado (`state`) dado, en lugar de producir texto libre. Su arquitectura consiste en dos cabezas de proyeccion pequenas (una cabeza de estado y otra de accion) montadas sobre un encoder Qwen3-8B congelado, entrenadas con una perdida contrastiva bidireccional InfoNCE.

El modelo resuelve el problema de la toma de decisiones rapida y generalizable en agentes: dado un estado (por ejemplo, el mensaje de un cliente o la observacion de un entorno de computer-use), CLM puntua acciones, nombres de herramientas o soluciones candidatas y devuelve distribuciones de probabilidad sobre las opciones proporcionadas. El autor reporta que, en modo zero-shot, iguala a Jev en tareas de computer-use, gaming y tool-calling con hasta 9 veces menos latencia, y que con las cabezas ajustadas alcanza resultados SOTA como verificador en DeepSWE (81,6 %) y Terminal-Bench 2.1 (87,6 %).

La relevancia actual del modelo esta en su coste: al reutilizar un encoder congelado y entrenar unicamente las cabezas, el ajuste fino es muy barato, y el mecanismo de cacheado separado de estados y acciones permite reutilizar embeddings de acciones y ser hasta 13 veces mas rapido que Jev con del orden de 1.000 candidatos. Esta ficha describe el checkpoint base, que es el punto de partida de las cabezas especificas de DeepSWE y Terminal-Bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos cabezas de proyeccion (state head y action head) sobre encoder Qwen3-8B congelado, entrenadas con perdida contrastiva bidireccional InfoNCE |
| Parametros totales | Encoder de 8B parametros; tamano de las cabezas no especificado (repo de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de servido del encoder usa `--max-model-len 2048`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (encoder base Qwen3-8B tambien Apache 2.0) |
| Formato de pesos | checkpoint PyTorch `.pt` para las cabezas (se descarga como `CLM_v0.1-8B.pt`); encoder base Qwen3-8B en safetensors |
| Modelo base | Qwen/Qwen3-8B |
| Libreria | contrastive-lm |
| Tarea (pipeline) | text-ranking |
| Tags | contrastive-lm, clm, contrastive-learning, verifier, reranker, agents, text-ranking |

## Arquitectura y entrenamiento

CLM-8B no es un transformer generativo al uso, sino un modelo de representacion y puntuacion. Sobre un encoder Qwen3-8B congelado (con pooling del ultimo token) se anaden dos cabezas de proyeccion de tamano reducido: una cabeza de estado y una cabeza de accion. El objetivo de entrenamiento es una perdida contrastiva bidireccional InfoNCE que conecta estados y acciones en un espacio comun. Como los estados y las acciones se codifican por separado, los embeddings de acciones pueden cachearse y reutilizarse entre consultas; el autor cifra en 13 veces la mejora de velocidad frente a Jev con aproximadamente 1.000 candidatos.

El entrenamiento se describe en tres fases: preentrenamiento sobre unos 60 millones de pares de preguntas y respuestas de Nemotron, un entrenamiento intermedio sobre unos 30 millones de negativos duros sinteticos y un postentrenamiento sobre aproximadamente 1 millon de trayectorias agenticas. No se mencionan fases de RLHF o DPO. Solo se entrenan las cabezas, lo que hace que el ajuste fino posterior sea barato: este checkpoint es el punto de partida para las cabezas especificas de DeepSWE y Terminal-Bench. El proyecto anuncia ademas un CLM-35B multimodal con mas datos, computo y parametros para octubre.

## Capacidades

- Puntuacion y ranking de candidatos: dado un estado y una lista de candidatos (soluciones best-of-N, nombres de herramientas, siguientes movimientos), devuelve una probabilidad relativa para cada uno.
- Preguntas tipadas sobre un estado: soporta los tipos `Noul` (si/no), `Choice` (eleccion entre categorias con criterios) y `Score` (puntuacion sobre una escala descrita).
- Verificacion de soluciones y resultados de agentes (verifier), incluyendo comprobacion de tareas de ingenieria de software y de terminal.
- Computer-use: evaluacion de acciones y observaciones en entornos de escritorio y navegacion.
- Gaming: decision entre movimientos en entornos de juego.
- Tool calling: seleccion y ranking de herramientas para un estado dado.
- Cacheado de estados y acciones: separacion de codificacion que permite reutilizar embeddings de acciones.
- No dispone de generacion de texto: unicamente puntua los candidatos que se le facilitan.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en este checkpoint.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente como estado y usa `Choice` con criterios por departamento (facturacion, tecnico) y `Score` de frustracion para asignar el ticket con probabilidades calibradas en lugar de un clasificador ad hoc.
- Verificacion de codigo generado por agentes: integrado como verificador en un pipeline de CI/CD, puntua parches o soluciones candidatas antes de aplicarlas, con el respaldo de los resultados reportados en DeepSWE (81,6 %) y Terminal-Bench 2.1 (87,6 %) tras ajuste fino.
- Seleccion de herramientas en agentes: dado el estado de una conversacion, rankea que herramienta invocar entre un catalogo, sustituyendo al LLM en el bucle de decision y reduciendo la latencia.
- Best-of-N en generacion: genera N respuestas con un LLM y usa CLM para clasificarlas y devolver la mas probable, aprovechando el cacheado de acciones para abaratar la puntuacion de conjuntos grandes de candidatos.
- Agentes de computer-use: puntua la siguiente accion (clic, teclado, navegacion) sobre la observacion actual del entorno, con latencia hasta 9 veces inferior a Jev segun el autor.
- Reranking de recuperacion en RAG: puntua pasajes o respuestas candidatas frente a una consulta y reordena los resultados antes de pasarlos a un modelo generativo.
- Monitorizacion de trayectorias agenticas: clasifica pasos intermedios de un agente (por ejemplo, si una accion es peligrosa o fuera de politica) usando preguntas `Noul` sobre el estado.
- Investigacion en aprendizaje contrastivo: al ser un checkpoint base con solo las cabezas entrenables, sirve como plataforma para experimentar con nuevas cabezas y dominios a bajo coste computacional.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| DeepSWE | 81,6 % | Cabezas ajustadas como verificador (no zero-shot) |
| Terminal-Bench 2.1 | 87,6 % | Cabezas ajustadas como verificador (no zero-shot) |
| Computer-use, gaming y tool-calling (zero-shot) | A la par de Jev | Hasta 9 veces menos latencia que Jev |
| Velocidad como verificador | 4-6 veces mas rapido que Jev | Cabezas ajustadas |
| Velocidad con ~1.000 candidatos | 13 veces mas rapido que Jev | Gracias al cacheado de estados y acciones |

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para el encoder Qwen3-8B: aproximadamente 16-18 GB en bf16/fp16, en torno a 9-10 GB en cuantizacion int8 y 5-6 GB en int4 (estimaciones calculadas a partir del tamano del modelo; el autor no publica cifras de VRAM).
- GPU recomendadas para el encoder a precision completa: A100 40 GB, H100, L40S o A6000.
- GPU de consumo: el modelo cabe en tarjetas con 16 GB o mas (RTX 4090, RTX 4080) si se cuantiza; en bf16 requiere al menos 24 GB (RTX 3090/4090) para el encoder mas el cache de KV.
- Las cabezas en si son muy ligeras (el repo completo ocupa 0,1 GB), por lo que el coste esta dominado por el encoder.
- Despliegue documentado: vLLM sirviendo Qwen3-8B con `--runner pooling`, mas el paquete `contrastive-lm` (`pip install contrastive-lm`) y el comando `clm-serve`, que expone una API y un playground web en `http://localhost:8700/`.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI para este esquema de pooling.
- Latencia y throughput absolutos: no disponibles. Los unicos datos son relativos (9x, 4-6x y 13x mas rapido que Jev en distintos escenarios).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLM-v0.1-8B | 8B (encoder) + cabezas | no disponible (ejemplo con 2048) | DeepSWE 81,6 %; Terminal-Bench 2.1 87,6 % (cabezas ajustadas); zero-shot a la par de Jev | Apache 2.0 | HuggingFace y GitHub del proyecto |
| Jev | no disponible | no disponible | Referencia de comparacion: CLM iguala en zero-shot y es 4-13x mas rapido | no disponible | no disponible |
| Qwen3-8B | 8B | 32k nativo (no confirmado en este uso) | Modelo generativo de proposito general; no comparable en tareas de ranking | Apache 2.0 | HuggingFace |
| CLM-35B | 35B (multimodal) | no disponible | Anunciado para octubre; sin datos publicos | no disponible | Anunciado, no publicado |

Los datos disponibles sobre Jev se limitan a las comparaciones cualitativas y de latencia ofrecidas por el autor, sin especificaciones tecnicas publicadas en la informacion proporcionada. No se dispone de alternativas directas de ranking contrastivo con las que establecer una comparacion cuantitativa completa.

## Limitaciones y advertencias

- Encoder-locked: las cabezas requieren obligatoriamente embeddings de Qwen3-8B con pooling del ultimo token. No se pueden intercambiar por otro encoder sin reentrenar.
- No genera texto: solo puntua los candidatos que se le proporcionan, y las probabilidades devueltas son relativas al conjunto de candidatos suministrado, no absolutas.
- Los resultados SOTA en benchmarks agenticos (DeepSWE, Terminal-Bench) corresponden a cabezas ajustadas, no a este checkpoint en modo zero-shot. Usar el checkpoint base en produccion no reproduce esas cifras.
- Generalizacion limitada: el autor situa CLM-8B como un escalon de su escalera de escalado y remite a CLM-35B para mejor generalizacion.
- Idioma: soporte declarado unicamente en ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion en el sentido de sobreconfianza: al no generar texto, el riesgo se traslada a la calibracion de las probabilidades, que dependen del conjunto de opciones presentado.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible, pese al entrenamiento con datos sinteticos y trayectorias agenticas que pueden heredar sesgos del corpus original.
- Licencia Apache 2.0, permisiva para uso comercial tanto en las cabezas como en el encoder base; conviene verificar igualmente las condiciones del encoder Qwen3-8B por separado.
- La ficha de HuggingFace consultada figura a nombre del usuario `ldov`, mientras que la model card y el repositorio de codigo corresponden a la organizacion Contrastive-LM; conviene confirmar la procedencia del artefacto antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ldov/CLM-v0.1-8B
- Modelo en HuggingFace (organizacion Contrastive-LM): https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Repositorio de codigo: https://github.com/Contrastive-LM/CLM
- Blog del proyecto: https://contrastive-lm.notion.site
- Guia de ajuste fino: https://github.com/Contrastive-LM/CLM/blob/main/docs/FINETUNING.md
- Servidor de Discord: https://discord.gg/5dAQEDJBs
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Referencia bibliografica: Kwok, J., Kang, H., Suresh, T., Saad-Falcon, J., Pavone, M., Re, C. y Mirhoseini, A. (2026), "Contrastive Language Models: A System One Model for Fast and Generalizable Decision-Making", Notion Blog.
- Ficha de terceros: https://www.aimodels.fyi/models/huggingFace/clm-v0.1-8b-contrastive-lm
- Ficha de terceros: https://www.gradually.ai/en/ai-models/clm-v0.1-8b/

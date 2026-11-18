# autotrust/JEV-27B

## Resumen

autotrust/JEV-27B es un modelo abierto de AutoTrust que combina en un unico conjunto de pesos dos modos de inferencia diferenciados: un "System 1" orientado a decisiones tipadas y calibradas (probabilidades sobre opciones, puntuaciones y clasificaciones) y un "System 2" de generacion y razonamiento heredado del modelo base Qwen/Qwen3.8-27B. El modelo se presenta como el segundo modelo integrado System 1 + System 2 de AutoTrust, construido con la receta "Blocks of Experts", y sucede a JEV-9B con mayor fidelidad al profesor cerrado TypeSafe Jev 1.13, mejor transferencia a tareas no vistas y un System 2 mas potente.

El problema que resuelve es el de obtener decisiones calibradas y de baja latencia (del orden de medio segundo) sin depender de una API cerrada, manteniendo ademas capacidad generativa y de razonamiento. Para ello se entrena mediante destilacion de conocimiento desde TypeSafe Jev 1.13 sobre el corpus SargeDev/jev-distill-corpus-v3, con un adaptador LoRA y una cabeza dual, manteniendo intacta la cabeza lm_head del modelo base para la ruta generativa.

Con 26.895.998.464 parametros reales (safetensors) y un repositorio de 54,7 GB, el modelo se distribuye en formato safetensors bajo licencia Apache 2.0, con soporte declarado de vLLM y compatibilidad con endpoints. Su relevancia actual radica en la separacion explicita de rutas (decision rapida frente a generacion deliberada) en un unico motor de inferencia, enrutadas por peticion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-head sobre Qwen3.8-27B (tags: qwen3_5_text, blocks-of-experts, dual-head) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens en prompts de decision (probado hasta 250K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B como base y se ajusta mediante fine-tuning con un adaptador LoRA y una cabeza dual. La model card describe la receta como "Blocks of Experts", con dos rutas enrutadas por peticion sobre el mismo conjunto de pesos: una ruta System 1 que produce decisiones tipadas (noul, choice, score) con probabilidades calibradas, y una ruta System 2 que utiliza la lm_head original del modelo base con el adaptador desactivado para generacion y razonamiento. El pipeline declarado en Hugging Face es text-classification, aunque los tags incluyen tambien text-generation.

El entrenamiento se basa en destilacion de conocimiento desde el profesor cerrado TypeSafe Jev 1.13 sobre el corpus SargeDev/jev-distill-corpus-v3. En el conjunto de test test_set_30k, 25.376 de 29.955 objetivos son distribuciones del profesor TypeSafe Jev 1.13, lo que indica que la mayor parte de la supervision son distribuciones de probabilidad y no etiquetas duras. La calibracion se evalua tras aplicar temperatura (ECE con 15 bins). Entre las innovaciones tecnicas destacadas por el autor figuran el endpoint `POST /v1/decide` anadido al servidor vLLM mediante `serve_decide.py`, la capacidad de manejar hasta 256 opciones por pregunta de eleccion sin reentrenamiento y el soporte de prompts de hasta 256K tokens para decisiones que dependen de una frase oculta a profundidad aleatoria.

## Capacidades

- Decisiones tipadas calibradas: genera probabilidades por opcion (choice), puntuaciones en escala 0-5 (score) y una salida binaria o de presencia (noul).
- Clasificacion de texto con hasta 256 opciones por pregunta, sin reentrenamiento; en CLINC150 zero-shot con los 150 intents como opciones alcanza 89,5% solo con nombres de intent y 93,8% con una descripcion de una linea por opcion.
- Generacion de texto y razonamiento por la ruta System 2, usando la lm_head del modelo base con el adaptador desactivado.
- Generacion de codigo: pass@1 de 0,78 en HumanEval (greedy, prompt estilo completion) por la ruta System 2.
- Manejo de contexto largo: decisiones correctas en 20 de 20 casos con la frase relevante oculta a profundidad aleatoria en hasta 250K tokens.
- Servicio HTTP de decisiones mediante `POST /v1/decide` con el esquema `{kind, state, question, options}`, que devuelve una probabilidad calibrada por opcion.
- Compatibilidad con endpoints y despliegue en vLLM.
- Capacidades multimodales disponibles en la variante separada autotrust/JEV-27B-VL, no en este modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language.

## Casos de uso

- Clasificacion de intenciones en asistentes conversacionales: el modelo puede recibir el estado de la conversacion y una lista de hasta 256 intents como opciones, devolviendo una distribucion calibrada por intent; en CLINC150 alcanza 93,8% con descripciones de una linea por opcion, lo que permite umbrales de confianza fiables para derivar a un humano.
- Reordenacion (reranking) de resultados de busqueda: el demo GuruSearch reordena titulares de seis fuentes de noticias por importancia y resultados de Google News, Bing News y Yahoo News por relevancia, con cada ranking emitido como una decision System 1 calibrada en aproximadamente medio segundo.
- Enrutamiento y triaje de tickets de soporte: dada una descripcion y un conjunto de colas o categorias, la salida `choice` con probabilidades calibradas permite asignar automaticamente los casos con top-1 claro y escalar los ambiguos segun la confianza.
- Puntuacion de relevancia o calidad en pipelines de datos: la salida `score` en escala 0-5 con MAE de 0,098 frente al profesor permite filtrar o priorizar documentos, respuestas o candidatos de forma consistente y calibrada.
- Deteccion de presencia de condiciones en texto (noul): con AUROC de 0,996 y Brier de 0,0013, es adecuado para tareas de moderacion o verificacion donde se necesita una probabilidad fiable de que se cumpla una condicion.
- Generacion de codigo en produccion por la ruta System 2: con pass@1 de 0,78 en HumanEval y despliegue en vLLM, puede integrarse en pipelines de generacion de funciones y pruebas a partir de firmas y docstrings.
- Analisis de documentos largos con preguntas de decision: gracias al soporte de prompts de hasta 256K tokens, puede responder preguntas de si/no o de eleccion sobre contratos, informes o expedientes extensos localizando la evidencia relevante.
- Servicio unificado de decision y generacion: un unico motor vLLM enruta por peticion entre la respuesta rapida calibrada y la generacion deliberada, simplificando la infraestructura frente a mantener dos modelos separados.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). La tabla de benchmarks publicos de decision fue ejecutada por AutoTrust para este modelo y para TypeSafe Jev 1.13; las filas de NeoHorse-Jev-4B y Open-Jev-9B proceden de la evaluacion publicada por terceros y no fueron reejecutadas. Puntuaciones en %, mayor es mejor.

| Modelo | JevBench | Kev | OpenJev text | Nimble | VitaminC | MASSIVE-en | Media seis grupos |
|---|---:|---:|---:|---:|---:|---:|---:|
| autotrust/JEV-27B | 88,70 | 83,75 | 73,89 | 92,91 | 77,46 | 87,71 | 84,07 |
| TypeSafe Jev 1.13 (API, ejecucion de AutoTrust) | 87,18 | 85,52 | 72,96 | 91,84 | 78,46 | 87,14 | 83,85 |
| NeoHorse-Jev-4B | 75,73 | 81,92 | 58,74 | 87,23 | 77,13 | 85,43 | 77,70 |
| Open-Jev-9B | 77,13 | 77, | no disponible | no disponible | no disponible | no disponible | no disponible |

Metricas de fidelidad al profesor TypeSafe Jev 1.13 sobre jev-distill-corpus-v3 · test_set_30k:

| Metrica | Valor |
|---|---|
| KL media (target ‖ modelo), todas las filas | 0,0186 |
| AUROC de noul | 0,996 |
| Brier de noul (frente a probabilidad objetivo, todas las filas) | 0,0013 |
| MAE del valor esperado de score (escala 0-5) | 0,098 |
| ECE (15 bins, tras temperatura) | 0,0009 |
| Concordancia top-1 de choice (todas las filas) | 0,903 |
| Concordancia top-1 de choice (filas con objetivo decisivo, gap top-2 ≥ 0,1) | 0,958 |

Generacion de codigo por la ruta System 2:

| Benchmark | Metrica | Valor |
|---|---|---|
| HumanEval (split test) | pass@1 (greedy, prompt estilo completion) | 0,78 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, los pesos en safetensors suman 54,7 GB en el repositorio, por lo que la inferencia en precision nativa requiere agregar memoria para cache KV y activaciones.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; el tamano del repositorio (54,7 GB) supera la VRAM de las GPU de consumo habituales en precision nativa, y no se documentan cuantizaciones.
- Opciones de despliegue: vLLM, con el script `serve_decide.py` incluido en el repositorio para exponer `POST /v1/decide`. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas.
- Latencia y throughput: el autor indica que responde una decision en aproximadamente la mitad del tiempo que tarda la API alojada de TypeSafe Jev 1.13, y que cada ranking del demo se emite en aproximadamente medio segundo. No se proporcionan cifras de throughput ni de latencia absoluta en milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en decisiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autotrust/JEV-27B | 26,9B | hasta 256K tokens | Media de 84,07 en seis benchmarks de decision; KL 0,0186 frente al profesor | Apache 2.0 | Pesos abiertos en Hugging Face |
| TypeSafe Jev 1.13 | no disponible | no disponible | Media de 83,85 en seis benchmarks de decision | Cerrada (API alojada) | Solo API |
| NeoHorse-Jev-4B | no disponible | no disponible | Media de 77,70 en seis benchmarks de decision | no disponible | Pesos en Hugging Face (TokenRhythm/NeoHorse-Jev-4B) |
| Open-Jev-9B | 9B (segun nombre) | no disponible | JevBench 77,13; Kev 77,; resto no disponible | no disponible | no disponible |
| Qwen/Qwen3.8-27B | 27B (modelo base) | no disponible | No es un modelo de decision calibrada; sirve de referencia para la ruta System 2 | no disponible | Pesos en Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada; al entrenarse sobre un corpus de destilacion en ingles, es previsible que herede los sesgos del profesor TypeSafe Jev 1.13 y del corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: la ruta System 2 hereda el comportamiento generativo de Qwen3.8-27B; la ruta System 1 no genera texto libre, pero sus probabilidades solo son fiables en la medida en que el caso se parezca a la distribucion de entrenamiento.
- Limitaciones de idioma: el campo language declara unicamente en; el rendimiento fuera del ingles no esta evaluado.
- Limitaciones de contexto: aunque se documentan decisiones correctas con hasta 250K tokens, no se especifica el comportamiento con prompts mas largos ni el coste de memoria asociado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y del corpus de destilacion, cuyas licencias no se detallan en la informacion disponible.
- Metricas no verificadas: todos los resultados de la model card estan marcados como `verified: false`; las filas de NeoHorse-Jev-4B y Open-Jev-9B no fueron reejecutadas por AutoTrust.
- Dependencia de vLLM: el flujo documentado de servicio de decisiones depende de vLLM y del script `serve_decide.py`; no se documentan alternativas de despliegue.
- Cuantizaciones no documentadas: no hay informacion sobre GGUF, AWQ, GPTQ ni otras variantes, lo que limita el despliegue en hardware modesto.
- El pipeline declarado es text-classification pese a incluir generacion; los consumidores deben enrutar explicitamente entre System 1 y System 2 para obtener el comportamiento esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/JEV-27B
- Variante con vision: https://huggingface.co/autotrust/JEV-27B-VL
- Demo en vivo de AutoTrust/GuruSearch: https://news.guru.so/ui
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Corpus de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Evaluacion de referencia NeoHorse-Jev-4B: https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B/blob/b50e043e22e0e41e7fc0c244e4daa707b8124930/README.md
- Scorecard del modelo: https://huggingface.co/autotrust/JEV-27B/blob/main/27b-3.jpg
- Imagen del demo: https://huggingface.co/autotrust/JEV-27B/resolve/main/assets/autotrust_gurusearch_demo.png

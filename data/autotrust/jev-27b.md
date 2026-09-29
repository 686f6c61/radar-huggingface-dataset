# autotrust/JEV-27B

## Resumen

autotrust/JEV-27B es un modelo abierto de 26.895.998.464 parametros (unos 26,9B), publicado por AutoTrust AI (Singapur) el 25 de septiembre de 2026 bajo licencia Apache-2.0. No es un modelo de lenguaje generativo al uso: es un modelo de decision que combina en un unico conjunto de pesos un camino rapido de "Sistema 1" que emite decisiones tipadas (noul, choice y score, con probabilidades calibradas) y un camino de "Sistema 2" que conserva la generacion de texto y el razonamiento de su modelo base, Qwen/Qwen3.8-27B.

La receta, denominada Blocks of Experts, anade un bloque de decision sobre un Qwen3.8-27B congelado mediante un adaptador LoRA y una cabeza dual, de modo que ambos comportamientos se sirven desde un solo motor vLLM y se enrutan por peticion. El objetivo declarado por el autor es sustituir llamadas frecuentes a APIs cerradas de decision (en concreto, al modelo propietario TypeSafe Jev 1.13) por inferencia autoalojada con una fidelidad casi indistinguible: divergencia KL media de 0,0186 frente a las distribuciones del profesor.

Es relevante porque ataca un cuello de botella concreto de los agentes autoalojados: las decisiones estructuradas repetitivas (elegir una accion, puntuar una opcion, decidir si continuar) que hasta ahora obligaban a depender de servicios externos. Segun el autor, JEV-27B responde una decision individual en aproximadamente la mitad de tiempo que la API alojada, y su media de seis grupos de benchmarks publicos de decision es de 84,07 frente al 83,85 del profesor cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-head (camino Sistema 1 + camino Sistema 2) sobre Qwen3.8-27B congelado; bloque de decision con receta Blocks of Experts y adaptador LoRA |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No disponible (la model card no publica desglose de parametros activos del bloque de decision) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en el formato publicado) |
| Idiomas soportados | Ingles (en); corpus de entrenamiento declarado como centrado en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers; compatible con vLLM) |
| Modelo base | Qwen/Qwen3.8-27B (relacion: finetune) |
| Pipeline declarado | text-classification (con capacidades de text-generation en el camino Sistema 2) |
| Dataset de entrenamiento | SargeDev/jev-distill-corpus-v3 |
| Tamano del repositorio | 54,7 GB |
| Fecha de publicacion | 25 de septiembre de 2026 (actualizado el 26 de septiembre de 2026) |

## Arquitectura y entrenamiento

JEV-27B parte de un Qwen3.8-27B que se mantiene congelado y sobre el que se injerta un bloque de decision (tags del autor: blocks-of-experts, dual-head, lora). Ese bloque produce decisiones tipadas con tres salidas: noul (probabilidad calibrada de un evento o etiqueta), choice (seleccion entre alternativas) y score (valor esperado en una escala de 0 a 5). El modelo conserva ademas la cabeza lm_head original, de modo que con el adaptador desactivado se comporta como generador de texto (el autor lo denomina "camino Sistema 2"). Segun la nota de prensa y el articulo de RuntimeWire, la decision no reescribe el modelo base: se anade un bloque compacto de decision sobre el Qwen congelado y ambos comportamientos conviven en un unico conjunto de pesos, enrutado por peticion.

El entrenamiento es una destilacion de conocimiento del profesor cerrado TypeSafe Jev 1.13 sobre el corpus SargeDev/jev-distill-corpus-v3 (variante v3). En el conjunto de test test_set_30k (29.955 filas), 25.376 objetivos son distribuciones de ese profesor. No se especifican en la informacion disponible el numero de tokens, la composicion completa del dataset ni si hubo fases de RLHF o DPO. La innovacion principal es la integracion de Sistema 1 y Sistema 2 en un mismo artefacto: el autor afirma que con un solo motor vLLM se puede enrutar cada peticion al camino rapido de decision o al camino deliberativo de generacion, y que una decision individual tarda aproximadamente la mitad que la API alojada equivalente.

## Capacidades

- Decisiones tipadas calibradas: emite noul (probabilidad), choice (seleccion top-1) y score (valor esperado en escala 0-5) con calibracion medida (ECE de 0,0009 tras temperature scaling).
- Generacion de texto y razonamiento: el camino Sistema 2, servido desde la lm_head base con el adaptador desactivado, mantiene las capacidades generativas de Qwen3.8-27B.
- Generacion de codigo: 0,78 de pass@1 en HumanEval (test, greedy, prompt estilo completion) por el camino Sistema 2.
- Clasificacion de texto: pipeline declarado text-classification, con etiquetas y decisiones estructuradas en lugar de texto libre.
- Compatibilidad con vLLM: pensado para servirse desde un unico motor vLLM con enrutado por peticion (etiqueta vllm y endpoints_compatible).
- Uso como cabecera de decision en agentes: el caso de uso declarado es tomar decisiones estructuradas frecuentes dentro de flujos de agente autoalojados.
- Idiomas: ingles unicamente; el autor reconoce que los datos de entrenamiento estan centrados en ingles.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo "thinking" nativo.

## Casos de uso

- Enrutado de decisiones en agentes autoalojados: usar la salida choice para seleccionar la siguiente accion de un agente (herramienta, rama de flujo, reintento) sin llamar a una API externa, aprovechando que el modelo devuelve una distribucion calibrada y no texto que haya que parsear.
- Puntuacion y ranking de candidatos: emplear score (escala 0-5) para ordenar respuestas, borradores, resultados de busqueda o propuestas generadas por otro modelo, con un MAE de 0,098 en el conjunto de test declarado.
- Filtrado con umbral de confianza: usar el valor de noul como puerta de calidad (por ejemplo, descartar o escalar a revision humana todo lo que baje de un umbral) gracias al AUROC de 0,996 y al Brier de 0,0013 declarados.
- Generacion de codigo en pipelines de CI/CD: aprovechar el camino Sistema 2 (0,78 pass@1 en HumanEval) para autocompletar funciones o proponer parches que luego pasan por tests automatizados.
- Asistencia a clientes: clasificar y decidir la intencion o la siguiente accion en conversaciones, sustituyendo llamadas por turno a un servicio propietario de decision por inferencia local.
- Moderacion y triaje de contenido: aplicar el modo choice/noul para etiquetar contenido con umbrales explicitos de confianza en lugar de depender de la salida en texto libre de un LLM generativo.
- Migracion desde una API cerrada de decision: al estar destilado de TypeSafe Jev 1.13 y lograr un KL medio de 0,0186 frente a sus distribuciones, sirve como reemplazo autoalojado cuando se quiere evitar la dependencia y el coste por llamada del proveedor.

## Benchmarks y rendimiento

Resultados declarados por el autor (verified: false) sobre el corpus de destilacion:

| Metrica | Conjunto | Valor |
|---|---|---|
| KL medio (objetivo ‖ modelo) | jev-distill-corpus-v3, test_set_30k (todas las filas; 25.376 de 29.955 objetivos son distribuciones de TypeSafe Jev 1.13) | 0,0186 |
| AUROC de noul | test_set_30k | 0,996 |
| Brier de noul (frente a la probabilidad objetivo, todas las filas) | test_set_30k | 0,0013 |
| MAE del valor esperado de score (escala 0-5) | test_set_30k | 0,098 |
| ECE (15 bins, tras temperature scaling) | test_set_30k | 0,0009 |
| Acierto top-1 de choice (todas las filas) | test_set_30k | 0,903 |
| Acierto top-1 de choice (filas con objetivo decisivo, gap top-2 >= 0,1) | test_set_30k | 0,958 |
| pass@1 (greedy, prompt estilo completion) | HumanEval, test, camino Sistema 2 | 0,78 |

Benchmarks publicos de decision declarados por el autor (porcentajes, mayor es mejor; negrita = mejor de la columna). El autor indica que ejecuto integramente las filas de JEV-27B y de TypeSafe Jev 1.13; el resto de filas proceden de la evaluacion de NeoHorse-Jev-4B y no fueron reejecutadas:

| Modelo | JevBench | Kev | OpenJev text | Nimble | VitaminC | MASSIVE-en | Media seis grupos |
|---|---:|---:|---:|---:|---:|---:|---:|
| autotrust/JEV-27B | **88,70** | 83,75 | **73,89** | **92,91** | 77,46 | **87,71** | **84,07** |
| TypeSafe Jev 1.13 (API alojada, ejecucion del autor) | 87,18 | **85,52** | 72,96 | 91,84 | 78,46 | 87,14 | 83,85 |
| NeoHorse-Jev-4B | 75,73 | 81,92 | 58,74 | 87,23 | 77,13 | 85,43 | 77,70 |
| Open-Jev-9B | 77,13 | 77,87 | 65,39 | 80,50 | 68,28 | 84,86 | 75,67 |
| Kev-4B | 73,71 | 81,47 | 54,75 | 73,40 | 76,46 | 85,71 | 74,25 |
| Laya English | 55,82 | 61,30 | 40,07 | 45,04 | **78,63** | 68,57 | 58,24 |
| Laya Typed Decisions | — | — | — | 48,94 | 78,30 | 65,43 | — |
| NeoHorse-1-4B | — | — | — | 69,15 | 63,27 | 82,86 | — |

Diferencia de JEV-27B frente a TypeSafe Jev 1.13, en puntos porcentuales, segun el autor:

| JevBench | Kev | OpenJev text | Nimble | VitaminC | MASSIVE-en | Media seis grupos |
|---:|---:|---:|---:|---:|---:|---:|
| +1,52 | −1,77 | +0,93 | +1,07 | −1,00 | +0,57 | +0,22 |

Notas de alcance aportadas por el autor: Nimble tiene 282 elementos, VitaminC 599 y MASSIVE-en 350; la media de seis grupos pondera los grupos por igual; JevBench es el conjunto publico de 231 ejemplos con su metrica oficial family-macro, que no es la misma medida que el leaderboard JevBench v1.4.2; la media de seis grupos de JEV-27B supera en 0,22 puntos porcentuales a la del profesor cerrado y en 6,37 puntos a la del siguiente modelo abierto con resultados en los seis grupos.

## Requisitos de hardware

- VRAM estimada para inferencia: las siguientes cifras son estimaciones derivadas del numero de parametros publicado (26,9B), no datos del autor. En bf16/fp16, unos 54 GB solo para pesos (el repositorio ocupa 54,7 GB), mas cache KV. En 8 bits, en torno a 27 GB mas cache KV. En 4 bits, en torno a 14-16 GB mas cache KV.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para servir el modelo sin cuantizar con contexto amplio; dos A100 40 GB tambien serian suficientes para los pesos en bf16. En NVIDIA RTX 4090/RTX 5090 (24-32 GB) solo cabria con cuantizacion agresiva y contexto reducido, segun las estimaciones anteriores.
- Si cabe en GPU de consumo: probablemente si en tarjetas de 24 GB o mas, pero unicamente con cuantizacion de 4 bits y ventanas de contexto cortas; no es un modelo pensado para GPU de consumo sin cuantizar.
- Opciones de despliegue: transformers (libreria declarada), vLLM (la model card describe explicitamente el servicio desde un unico motor vLLM con enrutado por peticion y la etiqueta endpoints_compatible), y safetensors como formato de pesos. No se documenta en la informacion disponible soporte de GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor afirma que el modelo responde una decision individual en aproximadamente la mitad del tiempo que tarda la API alojada de TypeSafe Jev 1.13. No se publican cifras absolutas de latencia (ms) ni de throughput (tokens/s) en la informacion disponible.
- Nota de despliegue: al ser una cabeza dual con adaptador LoRA, el enrutado entre camino de decision y camino de generacion se hace por peticion sobre el mismo motor, lo que simplifica la infraestructura frente a mantener dos modelos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autotrust/JEV-27B | 26,9B | No disponible | Media seis grupos 84,07; KL 0,0186; HumanEval 0,78 | Apache-2.0 | Pesos abiertos en HuggingFace |
| TypeSafe Jev 1.13 | No disponible | No disponible | Media seis grupos 83,85 | No disponible (modelo cerrado, API alojada) | Solo API |
| NeoHorse-Jev-4B | No disponible en la informacion disponible | No disponible | Media seis grupos 77,70 | No disponible | Pesos abiertos (referenciado en HuggingFace) |
| Open-Jev-9B | No disponible en la informacion disponible | No disponible | Media seis grupos 75,67 | No disponible | Pesos abiertos |
| Kev-4B | No disponible en la informacion disponible | No disponible | Media seis grupos 74,25 | No disponible | Pesos abiertos |
| Laya English | No disponible en la informacion disponible | No disponible | Media seis grupos 58,24 | No disponible | Pesos abiertos |

La comparativa se limita a los modelos de decision que aparecen en la tabla de benchmarks del autor. JEV-27B es sustancialmente mayor que los modelos abiertos comparables (4B y 9B) y su media de seis grupos supera en 6,37 puntos a la mejor alternativa abierta con resultados completos (NeoHorse-Jev-4B). No hay datos publicados de contexto, cuantizaciones ni licencias de la mayoria de las alternativas en la informacion disponible, por lo que la comparacion es parcial.

## Limitaciones y advertencias

- Hereda los puntos ciegos del profesor TypeSafe Jev 1.13: el propio autor senala razonamiento multi-salto, aritmetica, fechas y entradas adversarias como areas debiles.
- No esta pensado para decisiones de alto riesgo; el autor recomienda condicionar la aceptacion de sus respuestas a la confianza (noul) y no usarlo como autoridad final.
- Corpus de entrenamiento centrado en ingles: no hay soporte multilingue declarado ni evaluado, mas alla de las tareas de MASSIVE-en (ingles).
- Riesgo de alucinacion: aunque el camino Sistema 1 devuelve probabilidades calibradas, el camino Sistema 2 es un LLM generativo sobre un Qwen3.8-27B congelado y mantiene los riesgos habituales de generacion (hechos inventados, codigo que compila pero es incorrecto).
- Sesgos: no se documentan en la informacion disponible analisis de sesgo, composicion demografica del corpus de destilacion ni evaluaciones de equidad.
- Riesgo de destilacion: al entrenarse para imitar las distribuciones de un profesor propietario, puede reproducir sus sesgos sistematicos y sus errores de forma consistente (el KL de 0,0186 mide fidelidad, no correccion).
- Metricas no verificadas: los resultados de la model card figuran con verified: false y proceden del propio autor; no han sido reproducidos de forma independiente.
- La nota de prensa cita que el modelo hereda los puntos ciegos del profesor; conviene tratar la tabla de benchmarks publicos con cautela porque parte de las filas de comparacion provienen de ejecuciones de terceros no reejecutadas.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el modelo base Qwen3.8-27B y el profesor TypeSafe Jev 1.13 tienen sus propias condiciones, que deben revisarse antes de un despliegue comercial.
- No se publica informacion sobre cuantizaciones oficiales validadas, longitud de contexto soportada ni limites de tokens, lo que dificulta planificar el dimensionamiento de produccion.
- Longitud de contexto y rendimiento con contextos largos: no disponibles; no se debe asumir una ventana concreta sin verificarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/JEV-27B
- Blog del autor en HuggingFace: https://huggingface.co/blog/autotrust/autotrustjev-27b-fast-calibrated-decisions-and-ful
- Nota de prensa de AutoTrust AI: https://www.prnewswire.com/news-releases/autotrust-ai-releases-jev-27b-an-open-decision-model-for-self-hosted-ai-agents-302891720.html
- Cobertura en SMB Daily Leader: https://smb.dailyleader.com/article/AutoTrust-AI-Releases-JEV-27B-an-Open-Decision-Model-for-Self-Hosted-AI-Agents/6aba9a65fb7acafcb4abee43
- Analisis en RuntimeWire: https://runtimewire.com/article/autotrust-ai-jev-27b-self-hosted-decision-model
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Evaluacion de referencia citada por el autor (NeoHorse-Jev-4B): https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B/blob/b50e043e22e0e41e7fc0c244e4daa707b8124930/README.md

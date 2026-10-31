# JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP

## Resumen

Mellum2.1-12B-A2.5B-Thinking-MTP es un modelo de lenguaje con razonamiento ("thinking") desarrollado por JetBrains, orientado a tareas agénticas de ingeniería de software: explorar repositorios, editar ficheros, ejecutar comandos y llamar herramientas. Es la variante del modelo Mellum2.1 Thinking que incluye la cabecera de predicción multi-token (MTP), diseñada específicamente para acelerar la inferencia mediante decodificación especulativa.

La arquitectura es un mixture-of-experts (MoE) de 12.149.923.072 parámetros totales con 2.5B activos, heredada de Mellum2-12B-A2.5B-Base. La versión 2.1 no cambia la arquitectura respecto a Mellum2: el esfuerzo se ha centrado en el post-entrenamiento, convirtiendo el aprendizaje por refuerzo (RL) en la fase principal del entrenamiento, con tareas de matemáticas, programación competitiva, ciencia, uso de herramientas e ingeniería de software en entornos reales.

Es relevante ahora porque ofrece, con solo 2.5B de parámetros activos, resultados competitivos en benchmarks de código y razonamiento (82 % en LiveCodeBench v6, 83,3 % en AIME 25/26), con un coste de inferencia reducido gracias al MoE y al MTP. Su licencia Apache 2.0 lo hace apto para uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con cabecera de predicción multi-token (MTP) |
| Parametros totales | 12.149.923.072 (12,15B) |
| Parametros activos | 2,5B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp16, repo de 25,2 GB) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (endpoints_compatible) |

## Arquitectura y entrenamiento

Mellum2.1 es un transformer disperso de tipo mixture-of-experts con 12,15B de parámetros totales y 2,5B activos por token, lo que permite un coste de inferencia propio de un modelo de 2,5B manteniendo la capacidad de uno de 12B. Este repositorio añade sobre Mellum2.1-12B-A2.5B-Thinking una cabecera MTP (multi-token prediction): los pesos del modelo base son byte-idénticos y la cabecera añade un shard y una clave de configuración. La MTP habilita decodificación especulativa nativa, aceptando varios tokens por paso de forward.

El post-entrenamiento es el eje de esta versión: el aprendizaje por refuerzo pasó de ser una etapa final breve a constituir la parte principal del entrenamiento. Se emplearon nuevas tareas de RL en matemáticas, programación competitiva, ciencia, uso de herramientas e ingeniería de software, combinando datasets abiertos con tareas propias, todas filtradas antes del entrenamiento. Para las capacidades agénticas de software, el modelo se entrenó dentro de repositorios reales con shell y herramientas de edición de ficheros, recibiendo recompensa cuando los tests pasan, tras millones de ejecuciones en sandbox.

## Capacidades

- Razonamiento explícito ("thinking mode") para problemas complejos antes de emitir la respuesta final.
- Generación y razonamiento sobre código: resolución de issues en repositorios reales, edición de ficheros y uso de shell (entrenado específicamente para ello).
- Matemáticas y programación competitiva con razonamiento paso a paso.
- Tool calling / function calling: entrenado con tareas de RL de uso de herramientas (BFCL v4: 62,3 %, ToolHop: 49,1 %).
- Tareas agénticas multi-paso: exploración de bases de código, ejecución de comandos y verificación mediante tests.
- Comprensión general y seguimiento de instrucciones (IFEval: 90,6 %, MMLU-Redux: 87,8 %).
- Decodificación especulativa mediante la cabecera MTP, compatible con vLLM 0.33+ y transformers 5.20+.
- Sin capacidades de visión ni audio; el idioma declarado es únicamente el inglés.

## Casos de uso

- Agentes de ingeniería de software en repositorios reales: el modelo puede explorar la estructura del código, localizar el origen de un bug, editar varios ficheros y ejecutar la suite de tests hasta que pasan; su entrenamiento con recompensa basada en tests lo hace idóneo para este flujo.
- Resolución automática de issues en CI/CD: integrado en un pipeline, puede recibir la descripción de un issue, proponer un parche y validarlo; su 47 % en SWE-bench Verified lo sitúa como opción viable para triaje y parcheo automático.
- Asistente de código en IDE (caso de uso natural dada la procedencia de JetBrains): completación y refactorización con razonamiento, beneficiándose de la inferencia rápida por MoE y MTP para latencias bajas.
- Resolución de problemas matemáticos y de programación competitiva: el modo thinking le permite razonar sobre problemas de nivel AIME (83,3 % de exact match) antes de responder.
- Orquestación de herramientas y agentes multi-paso: puede encadenar llamadas a APIs y herramientas en flujos de trabajo complejos, con resultados razonables en BFCL v4 y WorkBench (44,6 %).
- Depuración en entornos de terminal: puede operar en sesiones de shell para diagnosticar y reparar sistemas, aunque con margen de mejora (17,4 % en Terminal-Bench 2.1).
- Chat técnico y asistencia documental en inglés: buen seguimiento de instrucciones (IFEval 90,6 %) y cumplimiento de seguridad aceptable (XSTest 88,8 %).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| LiveCodeBench v6 | pass@1 | 82,0 |
| HumanEval+ | pass@1 | 91,5 |
| MBPP+ | pass@1 | 79,4 |
| AIME 25/26 | exact match | 83,3 |
| GSM-Plus | exact match | 88,3 |
| SWE-bench Verified | resolved rate | 47,0 |
| SWE-bench Pro | resolved rate | 28,0 |
| Terminal-Bench 2.1 | resolved rate | 17,4 |
| BFCL v4 | accuracy | 62,3 |
| WorkBench | task completion | 44,6 |
| ToolHop | accuracy | 49,1 |
| IFEval | accuracy | 90,6 |
| GPQA Diamond | accuracy | 64,6 |
| MMLU-Redux | accuracy | 87,8 |
| MixEval-Hard | accuracy | 46,4 |
| XSTest | safe compliance | 88,8 |
| HarmBench | harmful rate (menor es mejor) | 8,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 12,15B de parámetros en precisión completa (bf16), el repo ocupa 25,2 GB, por lo que se recomiendan al menos 24-32 GB de VRAM para el modelo más la cabecera MTP y el KV cache. Con cuantización (no documentada oficialmente para este repo) podría reducirse, pero no hay cifras publicadas.
- GPU recomendadas: una RTX 4090 (24 GB) queda justa; opciones cómodas son A100 40 GB, A100 80 GB, H100 o RTX 5090. Para servir con contexto largo en producción, A100/H100 son la opción segura.
- Consumer GPU: cabe en una RTX 4090 de 24 GB en precisión completa con contexto moderado, dado que solo 2,5B de parámetros se activan por token (aunque todos los expertos deben residir en memoria). Con cuantización a 8 bits o inferior cabría con holgura.
- Opciones de despliegue: vLLM 0.33 o superior (recomendado, con soporte de decodificación especulativa MTP) y transformers 5.20 o superior. Para versiones anteriores, JetBrains remite al repositorio Mellum2.1-12B-A2.5B-Thinking, que no incluye los tensores MTP. No se menciona soporte oficial de llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado cifras; la activación de 2,5B por token y la cabecera MTP sugieren buena latencia, pero no hay mediciones oficiales.

## Comparativa con modelos similares

Comparativa orientativa con modelos de la misma categoría (MoE pequeño con enfoque agéntico/código). Los datos de los competidores son de conocimiento general y pueden no reflejar las últimas versiones:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-MTP | 12,15B | 2,5B | no disponible | Apache 2.0 | Código y agentes, thinking, MTP |
| Qwen3-30B-A3B (Thinking) | 30,5B | 3,3B | 128K (con YaRN) | Apache 2.0 | Generalista, código, thinking |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | Model License (no Apache) | Generalista MoE eficiente |

Mellum2.1 se distingue por su especialización en flujos agénticos de software con recompensa basada en tests, su cabecera MTP nativa para decodificación especulativa y una licencia Apache 2.0 sin restricciones comerciales, frente a alternativas más generalistas o con licencias restrictivas.

## Limitaciones y advertencias

- Idioma: el modelo está declarado solo para inglés; su rendimiento en castellano no está documentado y probablemente sea inferior.
- Sesgos: no se han publicado evaluaciones de sesgos específicas; el 8,5 % de harmful rate en HarmBench indica que no es inmune a generar contenido nocivo.
- Alucinaciones: al ser un modelo de razonamiento, puede producir cadenas de razonamiento plausibles pero incorrectas; los resultados agénticos (Terminal-Bench 2.1: 17,4 %, SWE-bench Pro: 28 %) muestran que falla con frecuencia en tareas complejas, por lo que conviene supervisión humana y validación con tests.
- Contexto: la longitud de ventana no está documentada en la model card; verificarla antes de diseñar flujos con documentos largos.
- Compatibilidad: la cabecera MTP requiere vLLM 0.33+ o transformers 5.20+; con versiones anteriores hay que usar el repositorio Thinking sin MTP.
- Cuantización: no hay cuantizaciones oficiales publicadas en este repositorio.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes.
- Los benchmarks son autodeclarados por JetBrains y no están verificados de forma independiente.
- Es un modelo reciente (octubre de 2026) con pocas descargas (82 en el momento de la ficha), por lo que el soporte comunitario y la documentación de terceros son aún escasos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP
- Modelo base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base
- Variante sin MTP (para versiones antiguas de vLLM/transformers): https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Versión anterior (Mellum2 Thinking): https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking
- Paper referenciado en tags (arXiv): https://arxiv.org/abs/2605.31268
- Web de JetBrains: https://www.jetbrains.com/

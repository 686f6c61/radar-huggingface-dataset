# mondk/LFM3-1.7B-Claude-Code-GGUF

## Resumen

LFM3 1.7B Claude Code es un ajuste fino (fine-tune) comunitario del modelo LFM3 1.7B de LiquidAI, publicado por el usuario mondk en Hugging Face en formato GGUF. El modelo se ha entrenado en tres rondas sucesivas sobre el dataset `mondk/Ultra-Trio-Unfiltered`: la primera centrada en el uso de herramientas (tool calling), la segunda en mejorar puntuaciones de benchmarks y la tercera mediante aprendizaje por refuerzo (RL), con el modelo generando sus propias preguntas y respuestas. El objetivo declarado es dotar a un modelo pequeño de capacidades de agente y llamada a funciones, imitando el estilo de trabajo de Claude Code.

Su relevancia radica en la combinación de un tamaño muy reducido (1.728.801.600 parámetros según los safetensors del repo) con un rendimiento notablemente mejorado en BFCL v4 (90,0 % frente al 83,3 % del modelo base) y en LiveCodeBench v6 (16,7 % frente al 8,3 %), todo ejecutable en hardware de consumo. Al tratarse de un GGUF, puede desplegarse fácilmente con llama.cpp, Ollama o herramientas similares, lo que lo hace atractivo para prototipado local de agentes ligeros. Conviene tener en cuenta que es un modelo comunitario sin respaldo corporativo y con evaluaciones de muestra pequeña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en LiquidAI LFM3, familia de modelos Liquid Foundation Models) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas en la model card) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | GGUF (versión safetensors disponible en mondk/LFM3-1.7B-Claude-Code-Safetensors) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, perteneciente a la familia Liquid Foundation Models (LFM) de LiquidAI. La model card no detalla la arquitectura interna concreta (transformer clásico, híbrido con capas de memoria, etc.), por lo que ese dato no está disponible. El tamaño del repositorio es de 3,7 GB en formato GGUF.

El entrenamiento se realizó en tres rondas sobre el dataset `mondk/Ultra-Trio-Unfiltered` (descrito como "unfiltered" en los tags). La primera ronda se centró en el uso de herramientas (tool usage), la segunda en mejorar puntuaciones de benchmarks, y la tercera aplicó aprendizaje por refuerzo con un esquema de auto-generación en el que el modelo produce sus propias preguntas y respuestas. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni técnicas adicionales como DPO o decodificación especulativa.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag "conversational").
- Llamada a herramientas (tool calling / function calling): entrenada específicamente en la ronda 1; alcanza un 90,0 % en BFCL v4 según las mediciones del autor.
- Comportamiento de agente con razonamiento paso a paso (tags "agent", "stepbystep") y capacidad multi-step con llamadas a herramientas encadenadas (hasta 9 llamadas en las pruebas del autor).
- Generación de código: mejora en LiveCodeBench v6 respecto al modelo base, aunque con tasas de acierto bajas en términos absolutos.
- Razonamiento paso a paso con modo de pensamiento ("thinking: default" en la configuración de evaluación).
- Capacidades multilingües: 16 idiomas, incluido castellano, árabe, chino, francés, alemán, japonés, coreano, portugués, ruso, polaco, hindi, tailandés, vietnamita e indonesio, entre otros.

## Casos de uso

- Agentes locales de línea de comandos estilo "Claude Code": el modelo está afinado para emitir llamadas a herramientas en formato estructurado, lo que lo hace adecuado para asistentes que ejecutan comandos o consultan APIs desde un terminal en un portátil sin GPU de servidor.
- Orquestación de funciones en aplicaciones backend: con un 90,0 % en BFCL v4, puede integrarse en pipelines que convierten lenguaje natural en llamadas a funciones JSON (reservas, consultas a bases de datos, automatizaciones).
- Prototipado rápido de agentes multi-step: admite cadenas de hasta varias llamadas a herramientas por tarea, útil para validar flujos de agente antes de escalar a modelos mayores.
- Autocompletado y generación de código ligero en el editor: cabe en hardware de consumo y puede asistir en tareas de código sencillas, aunque no sustituye a modelos especializados de mayor tamaño.
- Chatbots multilingües en dispositivos edge: soporta 16 idiomas y su tamaño reducido permite despliegue en CPU o GPU modesta.
- Generación sintética de datos y auto-evaluación: dado que su entrenamiento incluyó auto-generación de preguntas y respuestas, puede reutilizarse para pipelines de datos sintéticos en dominios similares.

## Benchmarks y rendimiento

Resultados publicados por el propio autor de la model card (f16, temperature 0, thinking por defecto; tamaños de muestra pequeños: 30 preguntas BFCL, 12 LCB, 4 TerminalBench, 4 SWE):

| Benchmark | Modelo | Correctas | Incorrectas | Tasa de acierto |
|---|---|---|---|---|
| BFCL v4 | LFM3 1.7B Claude Code | 27 | 3 | 90,0 % |
| BFCL v4 | LFM3 1.7B (base) | 25 | 5 | 83,3 % |
| LCB v6 | LFM3 1.7B Claude Code | 2 | 10 | 16,7 % |
| LCB v6 | LFM3 1.7B (base) | 1 | 11 | 8,3 % |
| TerminalBench | LFM3 1.7B Claude Code | 0 | 4 | 0,0 % |
| TerminalBench | LFM3 1.7B (base) | 0 | 4 | 0,0 % |
| SWE | LFM3 1.7B Claude Code | 0 | 4 | 0,0 % |
| SWE | LFM3 1.7B (base) | 0 | 4 | 0,0 % |

Métricas de proceso (TerminalBench y SWE):

| Benchmark | Modelo | Errores de formato | Llamadas a herramientas | Tiempo (s) | Tokens estimados |
|---|---|---|---|---|---|
| TerminalBench | LFM3 1.7B Claude Code | 7 | 19 | 156,2 | ~3.150 |
| TerminalBench | LFM3 1.7B (base) | 13 | 3 | 984,5 | ~25.850 |
| SWE | LFM3 1.7B Claude Code | 4 | 36 | 329,5 | ~6.070 |
| SWE | LFM3 1.7B (base) | 12 | 0 | 90,5 | ~2.005 |

Advertencias del autor: muestras pequeñas, algunas respuestas BFCL con JSON o prosa se contaron como correctas si el contenido de la llamada era el adecuado, y TerminalBench/SWE usan versiones sin Docker (noodcon/TerminalBench-DockerLess y noodcon/SWE-DockerLess) que pueden no coincidir con los benchmarks oficiales. No hay comparación publicada con modelos de otros fabricantes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,73 mil millones de parámetros y un repo GGUF de 3,7 GB (lo que sugiere cuantizaciones próximas a f16 o q8), aproximadamente 2-4 GB de VRAM según la cuantización elegida; en CPU, unos 2-4 GB de RAM.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090 con holgura enorme); no se requieren A100 ni H100.
- Cabe sobradamente en GPUs de consumo e incluso puede ejecutarse solo con CPU gracias al formato GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; la versión safetensors puede servirse con vLLM, TGI o transformers.
- Latencia y throughput: no disponibles. Como referencia indirecta, en las pruebas del autor el modelo completó TerminalBench en 156,2 s y SWE en 329,5 s con hasta 9 llamadas a herramientas por tarea, pero no se especifica el hardware empleado.

## Comparativa con modelos similares

| Característica | LFM3 1.7B Claude Code | LFM3 1.7B (base) | Qwen2.5-Coder-1.5B-Instruct |
|---|---|---|---|
| Parametros | 1,73 B | 1,73 B | 1,54 B |
| Especialización | Tool calling y agentes | Generalista | Código |
| BFCL v4 (dato propio) | 90,0 % | 83,3 % | no disponible |
| LCB v6 (dato propio) | 16,7 % | 8,3 % | no disponible |
| Licencia | LFM Open License v1.0 | LFM Open License v1.0 | Apache 2.0 |
| Formato | GGUF y safetensors | safetensors | safetensors y GGUF comunitarios |

Nota: los datos de Qwen2.5-Coder-1.5B se incluyen como referencia de categoría; no existen mediciones comparativas directas publicadas en la model card, por lo que la comparación de rendimiento es solo cualitativa.

## Limitaciones y advertencias

- Rendimiento en tareas complejas de ingeniería de software: 0,0 % en TerminalBench y SWE (versiones Docker-less), por lo que no es apto para resolución autónoma de issues o tareas de terminal completas.
- Muestras de evaluación muy pequeñas (4-30 preguntas por benchmark) y metodología no estándar (versiones Docker-less, criterio flexible en BFCL): los porcentajes pueden no ser reproducibles.
- Modelo comunitario sin model card corporativa: arquitectura, longitud de contexto y detalles de entrenamiento no documentados.
- Dataset de entrenamiento descrito como "unfiltered": puede contener contenido sin filtrar y el modelo puede heredar sesgos o producir salidas problemáticas sin las salvaguardas habituales de alineación.
- Riesgo de alucinación: no cuantificado; en SWE generó 4 errores de formato en 36 llamadas a herramientas, indicativo de inestabilidad en salidas estructuradas bajo presión.
- Licencia LFM Open License v1.0: es una licencia "other", no una licencia permisiva estándar; conviene revisar sus términos antes de uso comercial, ya que puede incluir restricciones (por ejemplo, límites de usuarios activos mensuales, habituales en licencias de modelos abiertos).
- Sin datos de longitud de contexto publicados: no es posible garantizar el comportamiento en conversaciones largas.

## Enlaces

- Modelo GGUF: https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Versión safetensors: https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-Safetensors
- Dataset de entrenamiento: https://huggingface.co/datasets/mondk/Ultra-Trio-Unfiltered
- TerminalBench Docker-less (referenciado): https://huggingface.co/datasets/noodcon/TerminalBench-DockerLess
- SWE Docker-less (referenciado): https://huggingface.co/datasets/noodcon/SWE-DockerLess
- Licencia: https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-GGUF/blob/main/LICENSE

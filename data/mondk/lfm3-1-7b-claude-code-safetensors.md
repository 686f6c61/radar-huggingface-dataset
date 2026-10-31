# mondk/LFM3-1.7B-Claude-Code-Safetensors

## Resumen

LFM3 1.7B Claude Code es un ajuste fino (fine-tune) comunitario del modelo LiquidAI/LFM3-1.7B, publicado por el usuario mondk en HuggingFace. El modelo base pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, arquitecturas basadas en células dinámicas líquidas (liquid neural networks) hibridadas con componentes tipo transformer, orientadas a eficiencia en tamaños reducidos. Este fine-tune se ha entrenado en tres rondas sobre el dataset mondk/Ultra-Trio-Unfiltered: la primera centrada en uso de herramientas (tool calling), la segunda en mejora de puntuaciones en benchmarks, y la tercera mediante aprendizaje por refuerzo con autogeneración de preguntas y respuestas.

El problema que aborda es claro: dotar de capacidades de agente y llamada a funciones a un modelo muy pequeño (1.728.801.536 parámetros) capaz de ejecutarse en hardware de consumo. Según las mediciones del propio autor, el modelo mejora el pass rate en BFCL v4 del 83,3 % al 90,0 % respecto al modelo base y duplica el resultado en LiveCodeBench v6 (16,7 % frente a 8,3 %), aunque fracasa por completo en TerminalBench y SWE. Es relevante como prueba de concepto de destilación de capacidades agénticas (estilo "Claude Code") en modelos de menos de 2 mil millones de parámetros, no como sustituto de modelos de gama alta para ingeniería de software seria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models, híbrido basado en células líquidas), no disponible detalle completo |
| Parametros totales | 1.728.801.536 (~1,73 B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para esta versión (safetensors en f16; existe variante GGUF del mismo autor) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license_name: lfm1.0, tipo "other") |
| Formato de pesos | safetensors (repo de 3,5 GB); variante GGUF disponible en mondk/LFM3-1.7B-Claude-Code-GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un modelo de la familia LFM de Liquid AI que combina células dinámicas líquidas (linear dynamic systems adaptativos) con mecanismos de atención, buscando un equilibrio entre eficiencia en inferencia y calidad en contextos largos. La ficha original no detalla la composición exacta de las capas ni la longitud de contexto del modelo base, por lo que estos datos no están disponibles.

El entrenamiento del fine-tune se realizó en tres rondas sobre el dataset mondk/Ultra-Trio-Unfiltered, descrito como "unfiltered" (sin filtrar), lo que sugiere datos menos curados que los datasets corporativos típicos. La ronda 1 se centró en uso de herramientas (tool calling), la ronda 2 en mejorar puntuaciones de benchmarks, y la ronda 3 aplicó aprendizaje por refuerzo en un esquema self-play donde el modelo genera sus propias preguntas y respuestas. No se especifican el número de tokens de entrenamiento, el hardware empleado ni los hiperparámetros. Las evaluaciones del autor se ejecutaron en f16 con temperatura 0 y thinking por defecto, con límites de 1200–2560 tokens según benchmark y un máximo de 9 llamadas a herramientas.

## Capacidades

- Generación de texto conversacional (pipeline text-generation con la librería transformers).
- Tool calling / function calling: es la capacidad principal del fine-tune; alcanza un 90,0 % de acierto en BFCL v4 según las mediciones del autor, con formato [func(args)].
- Razonamiento paso a paso (tag "stepbystep") y modo de pensamiento (thinking) por defecto en inferencia.
- Comportamiento agéntico multi-paso: en las pruebas de SWE realizó hasta 36 llamadas a herramientas en un solo problema, aunque sin resolver ninguno.
- Generación de código: mejora sobre el modelo base en LiveCodeBench v6 (16,7 % frente a 8,3 %), aunque con resultados bajos en términos absolutos.
- Capacidades multilingües heredadas del modelo base: 16 idiomas, incluido castellano.
- No hay indicios de capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Orquestación de funciones en aplicaciones locales: el modelo puede emitir llamadas a herramientas con un 90 % de fiabilidad en BFCL v4, útil como router ligero que decide qué función invocar (búsquedas, APIs internas, comandos) antes de pasar el resultado a un modelo mayor.
- Asistentes con herramientas en dispositivos con recursos limitados: con ~1,7 B de parámetros en f16 (unos 3,5 GB) cabe en portátiles y mini-PC, permitiendo agentes que consultan calendarios, bases de datos o APIs sin depender de la nube.
- Prototipado rápido de pipelines agénticos: su bajo coste de inferencia permite iterar cadenas de agentes multi-paso (hasta 9 llamadas de herramienta configuradas en las pruebas) antes de escalar a modelos más caros.
- Generación de código asistida en editores locales: puede resolver ejercicios de programación sencillos (16,7 % en LiveCodeBench v6), adecuado para autocompletado o generación de scripts pequeños, no para tareas complejas de ingeniería de software.
- Chatbot multilingüe ligero: soporta castellano y otros 15 idiomas, útil para asistentes conversacionales básicos con integración de herramientas en mercados europeos.
- Generación sintética de datos y self-play: dado que la ronda 3 entrenó con preguntas y respuestas autogeneradas, el modelo puede servir como generador barato de pares pregunta-respuesta para destilación posterior.
- Investigación sobre RL en modelos pequeños: el proceso de entrenamiento en tres rondas está documentado, lo que lo hace útil como referencia reproducible para experimentos de refuerzo con autogeneración de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor de la model card (muestras pequeñas: 30 preguntas BFCL, 12 LCB, 4 TerminalBench, 4 SWE; f16, temperatura 0, thinking por defecto):

| Benchmark | Modelo | Correctas | Incorrectas | Pass rate |
|---|---|---|---|---|
| BFCL v4 | LFM3 1.7B Claude Code | 27 | 3 | 90,0 % |
| BFCL v4 | LFM3 1.7B (base) | 25 | 5 | 83,3 % |
| LCB v6 | LFM3 1.7B Claude Code | 2 | 10 | 16,7 % |
| LCB v6 | LFM3 1.7B (base) | 1 | 11 | 8,3 % |
| TerminalBench | LFM3 1.7B Claude Code | 0 | 4 | 0,0 % |
| TerminalBench | LFM3 1.7B (base) | 0 | 4 | 0,0 % |
| SWE | LFM3 1.7B Claude Code | 0 | 4 | 0,0 % |
| SWE | LFM3 1.7B (base) | 0 | 4 | 0,0 % |

Métricas de proceso: en TerminalBench generó ~3.150 tokens en 156,2 s con 19 llamadas de herramienta y 7 errores de formato (el base generó ~25.850 tokens en 984,5 s con 13 errores de formato). En SWE generó ~6.070 tokens en 329,5 s con 36 llamadas de herramienta y 4 errores de formato. Advertencias del autor: las versiones TerminalBench-DockerLess y SWE-DockerLess de noodcon pueden no coincidir con los benchmarks oficiales, y algunas respuestas de BFCL con JSON o prosa se contaron como correctas si el contenido de la llamada era correcto.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en f16: ~3,5 GB de pesos, más overhead de KV cache y activaciones; ~4–6 GB de VRAM o RAM es una estimación razonable (dato de repo, no publicado oficialmente).
- Cabe con holgura en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 e incluso integradas modernas con suficiente memoria unificada; también ejecutable en CPU vía GGUF.
- La variante GGUF (mondk/LFM3-1.7B-Claude-Code-GGUF) permite cuantizaciones (Q4, Q5, Q8) que reducen el footprint por debajo de 2 GB, aunque las cuantizaciones concretas publicadas no están disponibles en la información proporcionada.
- Opciones de despliegue: transformers (librería nativa del repo), llama.cpp y Ollama vía la variante GGUF. No se menciona soporte explícito de vLLM o TGI para la arquitectura LFM3; verificar compatibilidad antes de desplegar en producción.
- Latencia y throughput: no disponibles como cifras oficiales; las mediciones del autor (temperatura 0, thinking activado) muestran 156–330 s por problema agéntico con cientos a miles de tokens generados, lo que sugiere inferencia en hardware modesto.

## Comparativa con modelos similares

| Característica | LFM3 1.7B Claude Code | LiquidAI/LFM3-1.7B (base) | Qwen2.5-1.5B-Instruct |
|---|---|---|---|
| Parametros | ~1,73 B | ~1,7 B | 1,54 B |
| Tool calling (BFCL v4, datos del autor) | 90,0 % | 83,3 % | no disponible en esta fuente |
| LiveCodeBench v6 | 16,7 % | 8,3 % | no disponible en esta fuente |
| Contexto | no disponible | no disponible | 128K (dato general del modelo) |
| Licencia | lfm1.0 (other) | lfm1.0 | Apache 2.0 |
| Formato | safetensors, GGUF (variante) | safetensors | safetensors, GGUF |

En su categoría (modelos agénticos de ~2 B), también compiten Phi-3.5-mini (3,8 B, MIT) y Qwen2.5-Coder series; no hay datos comparativos publicados en la información disponible para estos modelos.

## Limitaciones y advertencias

- Rendimiento agéntico real muy limitado: 0 % en TerminalBench y SWE (aunque con muestras de solo 4 problemas y versiones Docker-less no oficiales); no es apto para tareas serias de ingeniería de software autónoma.
- Muestras de evaluación muy pequeñas (30, 12, 4 y 4 preguntas): los resultados pueden variar significativamente en evaluaciones más amplias.
- La metodología de BFCL fue indulgente (se aceptaron JSON y prosa si el contenido era correcto), por lo que el 90,0 % puede sobreestimar la precisión de formato estricto.
- Dataset de entrenamiento "unfiltered": posible presencia de ruido, contenido sin filtrar y sesgos no documentados; mayor riesgo de alucinaciones y salidas inapropiadas que en modelos con RLHF corporativo.
- Sesgos conocidos: no disponibles; al ser un fine-tune comunitario sobre un dataset sin filtrar, no se han publicado auditorías de sesgo.
- Longitud de contexto no documentada: no es posible garantizar comportamiento en ventanas largas; verificar con el modelo base de Liquid AI antes de usos con documentos extensos.
- Licencia lfm1.0 (tipo "other"): revisar el archivo LICENSE antes de uso comercial, ya que las licencias comunitarias de modelos base pueden imponer restricciones (límites de usuarios mensuales, atribución, etc.).
- Errores de formato en tool calling (7 en TerminalBench, 4 en SWE): cualquier integración en producción debe incluir validación y reintento de llamadas a herramientas.
- Proyecto comunitario con 975 descargas y 1 like: sin mantenimiento garantizado, sin tests de regresión y con documentación mínima; tratar como experimental.

## Enlaces

- Modelo (safetensors): https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-Safetensors
- Variante GGUF del mismo autor: https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/mondk/Ultra-Trio-Unfiltered
- Benchmarks Docker-less usados en la evaluación: https://huggingface.co/noodcon/TerminalBench-DockerLess y https://huggingface.co/noodcon/SWE-DockerLess
- Licencia: https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-Safetensors/blob/main/LICENSE
- Perfil de Liquid AI (fabricante del modelo base): https://huggingface.co/LiquidAI

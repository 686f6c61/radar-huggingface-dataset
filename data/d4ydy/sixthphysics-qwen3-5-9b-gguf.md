# d4ydy/sixthphysics-qwen3.5-9b-GGUF

## Resumen

SixthPhysics-Qwen3.5-9B es un ajuste fino del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario d4ydy, orientado a la generacion neuro-simbolica de preguntas de fisica preuniversitaria. El modelo se distribuye en formato GGUF cuantizado para inferencia local en CPU y GPU de consumo, e incluye tres niveles de cuantizacion (Q4_K_M, Q6_K y Q8_0) con tamanos verificados de 5,68 GB, 7,36 GB y 9,53 GB respectivamente. Cuenta con 8.953.803.264 parametros totales y esta publicado bajo licencia Apache 2.0.

El modelo resuelve un problema muy concreto: generar preguntas de fisica verificables por solucionador para tres especificaciones preuniversitarias simultaneas (IB Physics 2025 SL/HL, UK A-Level Physics AQA 7408 y NCUK International Foundation Year IFYPH005). Para ello se entrena sobre un arnes neuro-simbolico de dos turnos: el primer turno propone un escenario y el segundo autoriza el paquete completo de la pregunta. El adaptador LoRA campeon se fusiono limpiamente sobre el backbone de texto de Qwen3.5-9B, manteniendo congelada la torre de vision.

Su relevancia actual radica en que demuestra un caso de uso educativo verticalizado con evaluacion rigurosa: el modelo base sin ajustar obtiene un 0,00% en el split de test bloqueado, mientras que el campeon ajustado alcanza un 64,51% sin reintentos y un 75,60% con un reintento en bucle cerrado. La distribucion en GGUF facilita el despliegue en estaciones de trabajo modestas y en entornos sin conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con torre de vision congelada; backbone de texto exportado |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion recomendada en Modelfile y ejemplos) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA original en bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de 8.953.803.264 parametros con torre de vision. El proceso de ajuste consistio en un LoRA denominado `round1_sft_core` en bf16, fusionado limpiamente sobre el backbone de texto del modelo base; la torre de vision se mantuvo congelada y el backbone de texto se exporto de forma limpia para inferencia local en CPU y GPU de consumo. El resultado se cuantizo a GGUF en tres variantes.

El entrenamiento se realizo sobre el dataset d4ydy/sixthphysics-bench-and-bank y esta orientado al arnes neuro-simbolico de dos turnos de SixthPhysics: el turno 1 (`propose_scenario`) propone un escenario y el turno 2 (`author_package`) emite el paquete de la pregunta en JSON crudo. Una innovacion tecnica destacable es que el adaptador campeon se ajusto con el prefijo vacio de pensamiento de Qwen3.5 (`<think>\n\n</think>\n\n`), de modo que ambos turnos emiten JSON limpio de inmediato sin razonamiento intermedio. Por ello se recomienda desactivar el modo thinking (`enable_thinking=False`, `--reasoning off` en llama.cpp, `think: false` en la API de Ollama o el Modelfile incluido). La evaluacion se realizo en Modal H100 con splits disjuntos por familia y cero contaminacion, con intervalos de confianza de Wilson al 95%.

## Capacidades

- Generacion de texto y razonamiento estructurado orientado a fisica preuniversitaria.
- Generacion neuro-simbolica de preguntas de fisica en dos turnos: propuesta de escenario y autoria del paquete de pregunta.
- Soporte de tool calling y function calling (etiqueta `tool-use`).
- Emision de JSON crudo en ambos turnos cuando el modo thinking esta desactivado.
- Cobertura simultanea de tres especificaciones: IB Physics 2025 (SL y HL, con g = 9,8 m s^-2), UK A-Level Physics AQA 7408 (Year 12/AS y Year 13, con g = 9,81 m s^-2) y NCUK IFY Physics IFYPH005 (semestres 1 y 2, con g = 9,81 m s^-2).
- Generacion de preguntas en formatos MCQ y estructurado, con renderizado SVG mediante el arnes SixthPhysics.
- Capacidades multilingues limitadas al ingles (`en`).
- Capacidad de vision heredada del modelo base, aunque la torre se mantiene congelada y el backbone de texto es el exportado.

## Casos de uso

- Generacion de preguntas de fisica para IB Physics: el modelo produce escenarios y paquetes de pregunta alineados con la especificacion IB 2025 SL/HL, usando g = 9,8 m s^-2 y excluyendo opciones y temas retirados de IB 2016, lo que lo hace adecuado para bancos de preguntas academicamente validos.
- Generacion de preguntas para A-Level Physics: con g = 9,81 m s^-2 y cobertura de Year 12 (AS) y Year 13, se integra en el arnes SixthPhysics para producir preguntas MCQ y estructuradas por dominio (mecanica, circuitos, etc.).
- Generacion de preguntas para NCUK IFY Physics: cubre los semestres 1 y 2 de IFYPH005, permitiendo a centros de foundation year generar material de practica alineado con su plan de estudios.
- Arnes de practica en vivo: el modelo se conecta a `sixthphysics.github.io` y al repositorio `sixthphysics/sixthphysics` mediante los backends de Ollama, llama-server o LM Studio para generar preguntas verificadas por solucionador y renderizadas en SVG.
- Despliegue local en aula o laboratorio: con la cuantizacion Q4_K_M (5,68 GB) cabe en GPUs de 8 GB y MacBooks de Apple Silicon con 16 GB, lo que permite ejecutar el arnes sin conectividad ni costes de API.
- Evaluacion y benchmarking educativo: el dataset `sixthphysics-bench-and-bank` y los splits bloqueados (test.jsonl, Novel-1500) permiten reproducir la evaluacion del modelo y comparar variantes de cuantizacion.
- Investigacion en generacion neuro-simbolica: el diseno de dos turnos con verificacion por solucionador sirve como banco de pruebas para estudiar la fidelidad de la generacion de problemas fisicos con modelos pequenos.

## Benchmarks y rendimiento

Resultados del campeon en bf16 (LoRA fusionado) sobre Modal H100, con splits disjuntos por familia y cero contaminacion:

| Split y protocolo | Qwen3.5-9B sin ajustar (E2E) | Campeon (round1_sft_core) E2E | Alineacion con el plan de estudios |
|---|---:|---:|---:|
| test.jsonl bloqueado, 0 reintentos (N = 586, 28 familias no vistas) | 0,00% | 64,51% [60,55%, 68,27%] | 78,50% (100,00% de las resueltas) |
| test.jsonl bloqueado, 1 reintento en bucle cerrado (N = 586) | 0,34% | 75,60% [71,96%, 78,90%] | 87,03% (100,00% de las resueltas) |
| test.jsonl bloqueado, paso 2 forzado por profesor (N = 586) | 0,68% | 90,61% [87,98%, 92,72%] | 99,32% |
| Novel-1500 fuera de muestra, 1 reintento (500 IB / 500 A-Level / 500 NCUK) | no disponible | 78,40% [76,25%... (truncado en la informacion disponible) | no disponible |

Los resultados corresponden al adaptador bf16 fusionado; no se han publicado en la informacion disponible resultados de benchmarks especificos para las variantes GGUF cuantizadas.

## Requisitos de hardware

- Q4_K_M: 5,68 GB de archivo; minimo ~7,5 GB de VRAM/RAM con contexto de 8K. Recomendado para GPUs de 8 GB, MacBooks de Apple Silicon con 16 GB y Ollama.
- Q6_K: 7,36 GB de archivo; minimo ~9,5 GB de VRAM/RAM con contexto de 8K. Recomendado para GPUs de 10-12 GB o 16 GB de memoria unificada.
- Q8_0: 9,53 GB de archivo; minimo ~11,5 GB de VRAM/RAM con contexto de 8K. Recomendado para GPUs de 12-16 GB o 16+ GB de RAM.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; los requisitos se expresan por cantidad de VRAM. La evaluacion del campeon se realizo en Modal H100.
- Cabe en GPU de consumo: si, con Q4_K_M en GPUs de 8 GB y con Q6_K/Q8_0 en GPUs de 10-16 GB.
- Opciones de despliegue: Ollama (`ollama run hf.co/d4ydy/sixthphysics-qwen3.5-9b-GGUF:Q4_K_M`), llama.cpp (`llama-server` con `--jinja --reasoning off`), LM Studio (servidor local en `http://127.0.0.1:1234/v1`) y backends compatibles con la API de OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SixthPhysics-Qwen3.5-9B (este modelo) | 8.953.803.264 | 8192 (recomendado) | Fisica preuniversitaria neuro-simbolica (IB, A-Level, NCUK) | Apache 2.0 | GGUF en Hugging Face; LoRA bf16 |
| Qwen/Qwen3.5-9B (modelo base) | 8.953.803.264 | no disponible | Proposito general, con vision | no disponible en la informacion proporcionada | Hugging Face |
| d4ydy/sixthphysics-qwen3.5-9b-lora (adaptador) | no disponible (LoRA sobre el mismo backbone) | no disponible | Mismo enfoque, en bf16 | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos de la misma categoria para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El modelo esta especializado en fisica preuniversitaria de tres especificaciones concretas; su rendimiento en tareas generales no se ha documentado y probablemente sea inferior al del modelo base.
- Solo soporta ingles (`en`); no se ha documentado soporte multilingue.
- Requiere desactivar el modo thinking para obtener JSON limpio; con thinking activado el comportamiento puede degradarse.
- El contexto recomendado es de 8192 tokens; no se documentan ventanas mayores.
- El modelo base sin ajustar obtiene un 0,00% en el split de test bloqueado, lo que evidencia que la tarea es exigente y que el ajuste es imprescindible; no debe esperarse un comportamiento correcto fuera del dominio entrenado.
- Riesgo de alucinacion en la generacion de escenarios y paquetes de pregunta; el diseno del arnes mitiga este riesgo mediante verificacion por solucionador, pero no lo elimina.
- Los resultados de benchmarks publicados corresponden al adaptador bf16 fusionado; las variantes GGUF cuantizadas pueden presentar degradacion no cuantificada en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen/Qwen3.5-9B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad documentada.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/d4ydy/sixthphysics-qwen3.5-9b-GGUF
- Adaptador LoRA bf16: https://huggingface.co/d4ydy/sixthphysics-qwen3.5-9b-lora
- Dataset y benchmark: https://huggingface.co/datasets/d4ydy/sixthphysics-bench-and-bank
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Aplicacion de practica en vivo: https://sixthphysics.github.io
- Codigo fuente: https://github.com/sixthphysics/sixthphysics

# exeterminal/Exe-Guard-Dynamic-GGUF

## Resumen

Exe Guard Dynamic es un modelo especializado de 3.085.938.688 parámetros (aproximadamente 3,1 mil millones) derivado de Qwen/Qwen2.5-Coder-3B-Instruct mediante un ajuste fino con LoRA. Lo desarrolla exeterminal como componente auxiliar del sistema Exe AI, y su función es muy concreta: actúa como "guardián" del flujo Extended Workflow, leyendo el informe de un paso de herramienta que ha fallado y redactando la única instrucción correctiva que el usuario debería enviar a continuación. No ejecuta acciones; solo sugiere.

El modelo resuelve un problema acotado pero recurrente en pipelines agénticos: cuando una llamada a herramienta falla (un comando mal escrito, un entorno de Python incorrecto, una ruta fuera de la carpeta compartida, un timeout), el agente principal necesita una corrección precisa y en una sola frase. Exe Guard Dynamic está entrenado específicamente para seis categorías de fallo y responde siempre en inglés imperativo, sin saludos ni explicaciones.

La relevancia práctica está en su tamaño y en el formato de distribución: se publica únicamente en GGUF, con 17 cuantizaciones distintas que van desde f16 (5,75 GB) hasta IQ1_S (0,74 GB), lo que permite desplegarlo en hardware muy modesto. La build recomendada, IQ4_XS (1,62 GB), resuelve 24 de 24 casos de prueba según el autor. La licencia es Apache-2.0 tanto en el modelo base como en el derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 (aprox. 3,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion de uso indicada por el autor) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ1_M, IQ1_S |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el adaptador LoRA original fue fusionado en el modelo base antes de cuantizar |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de aproximadamente 3,1 mil millones de parámetros. Sobre esa base se aplicó un adaptador LoRA fino, entrenado localmente en Apple Silicon con MLX, usando ejemplos sintéticos de pasos de herramienta fallidos y sus correcciones de una sola frase. Los datos de entrenamiento se construyeron para replicar exactamente el formato de informe que produce Exe AI. Posteriormente, el adaptador se fusionó en el modelo base y el resultado se cuantizó a GGUF.

Todas las builds publicadas incorporan una importance matrix (imatrix) calculada a partir de los propios datos de la tarea, lo que explica que las cuantizaciones I-quant mantengan la precisión en bit-widths muy bajos. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset sintético ni si hubo etapas de RLHF o DPO adicionales sobre el ajuste supervisado. El autor no documenta innovaciones arquitectónicas propias: la contribución es el ajuste fino especializado y el pipeline de cuantización con imatrix.

## Capacidades

- Generación de instrucciones correctivas de una sola frase en inglés imperativo ante fallos de herramientas.
- Reparación de comandos con errores tipográficos (por ejemplo, `npm run buld` → comando correctamente escrito).
- Detección de entorno Python incorrecto: sugiere `.venv/bin/python3 …` en lugar de `pip install` global o `source activate`.
- Corrección de fallos de `edit_file` cuando el texto antiguo no se encuentra: indica leer el archivo primero y editar con el texto exacto.
- Identificación de archivos binarios o ilegibles: propone el archivo legible alternativo (por ejemplo, el `.log`) o `run_command` para archivos comprimidos.
- Corrección de rutas rechazadas por estar fuera de las carpetas compartidas: sugiere una ruta dentro de la carpeta liberada.
- Recuperación tras timeouts: propone reejecutar la tarea en segundo plano.
- Formato de salida restringido: sin saludos, sin explicaciones, sin historial de conversación.
- No soporta tool calling general, ni agentes multi-paso, ni visión, ni audio, ni modo thinking, ni capacidades multilingües más allá del inglés.

## Casos de uso

- Guardian de workflows agénticos: integrado como modelo de fondo en Exe AI Extended Workflow, intercepta el informe de un paso fallido y devuelve la instrucción correctiva que el agente principal o el usuario deben aplicar. Su tamaño de 1,62 GB en IQ4_XS permite mantenerlo residente en memoria junto al modelo principal.
- Autocorrección de comandos en asistentes de terminal: cuando el usuario o el agente escribe un comando con una errata, el modelo devuelve la versión corregida sin necesidad de reenviar todo el contexto de la sesión, gracias a su formato de dos mensajes (system + informe de fallo).
- Gestión de entornos virtuales en pipelines de CI/CD: ante un fallo de importación o de ejecución de Python, el modelo identifica que existe un `.venv/` y sugiere invocar el intérprete correcto, evitando instalaciones globales que contaminan el entorno.
- Reparación de ediciones de archivos en herramientas de coding agent: cuando `edit_file` falla porque el texto antiguo no coincide, el modelo indica la secuencia correcta (leer primero, luego editar con el texto exacto), reduciendo bucles de reintento.
- Enrutado de lecturas de archivos en sistemas con sandbox: si una ruta queda fuera de las carpetas compartidas, el modelo propone una ruta válida dentro del espacio liberado, lo que evita fallos repetidos por permisos.
- Recuperación de tareas largas: tras un timeout en la ejecución de un comando, el modelo sugiere relanzarlo en segundo plano, una instrucción útil en pipelines de build o de procesamiento de datos.
- Despliegue en entornos con recursos limitados: con builds de 0,74 a 1,62 GB, puede ejecutarse en portátiles, Raspberry Pi o contenedores pequeños mediante llama.cpp, sin GPU dedicada.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 24 casos de reparación reservados (held-out), a temperatura 0.1. No son benchmarks estándar (MMLU, HumanEval, GSM8K), sino una métrica de tarea: número de casos resueltos correctamente sobre 24.

| Modelo / build | Casos resueltos (de 24) |
|---|---|
| Qwen2.5-Coder-3B-Instruct base (sin ajuste) | 10 / 24 (42%) |
| Exe-Guard-Dynamic f16 | 24 / 24 |
| Exe-Guard-Dynamic Q8_0 | 24 / 24 |
| Exe-Guard-Dynamic Q6_K | 24 / 24 |
| Exe-Guard-Dynamic Q5_K_M | 24 / 24 |
| Exe-Guard-Dynamic Q4_K_M | 24 / 24 |
| Exe-Guard-Dynamic Q4_K_S | 24 / 24 |
| Exe-Guard-Dynamic IQ4_XS (recomendada) | 24 / 24 |
| Exe-Guard-Dynamic Q3_K_L | 19 / 24 |
| Exe-Guard-Dynamic Q3_K_M | 20 / 24 |
| Exe-Guard-Dynamic IQ3_M | 24 / 24 |
| Exe-Guard-Dynamic IQ3_S | 24 / 24 |
| Exe-Guard-Dynamic Q2_K | 24 / 24 |
| Exe-Guard-Dynamic IQ2_M | 23 / 24 |
| Exe-Guard-Dynamic IQ2_S | 22 / 24 |
| Exe-Guard-Dynamic IQ2_XS | 22 / 24 |
| Exe-Guard-Dynamic IQ1_M | 9 / 24 |
| Exe-Guard-Dynamic IQ1_S | 10 / 24 |

El autor señala que el modelo base falla por completo (0%) en los dos casos que requieren el ajuste: entorno Python incorrecto y objetivo de edición incorrecto. No se han publicado resultados en benchmarks estándar de razonamiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,74 GB (IQ1_S) y 5,75 GB (f16). La build recomendada IQ4_XS ocupa 1,62 GB en disco y requiere aproximadamente esa cantidad de memoria al cargarse.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para IQ4_XS; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en iGPU y en Raspberry Pi con las builds de 2-3 bits.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica `temperature 0.1`, `max_tokens 200`, thinking off y contexto 4096 como configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Exe-Guard-Dynamic | ~3,1 B | 4096 (uso indicado) | Reparación de pasos fallidos en workflows agénticos | Apache-2.0 | GGUF |
| Qwen2.5-Coder-3B-Instruct | ~3,1 B | no disponible en la información | Asistente general de código | Apache-2.0 | safetensors, GGUF (derivados) |
| Modelos guardianes genéricos de ~3 B | no disponible | no disponible | No disponible | no disponible | no disponible |

La comparación directa más relevante es con su propio modelo base: Exe Guard Dynamic sacrifica capacidades generales de chat y generación de código para ganar especialización en la tarea de reparación (42% → 100% en la evaluación del autor). No se dispone de datos sobre otros modelos guardianes comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especialista: no es un asistente general. El propio autor declara fuera de alcance el chat general, la generación de código, la visión y cualquier uso que no sea la reparación de pasos fallidos.
- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto limitado a 4096 tokens y formato de prompt rígido: dos mensajes (system fijo + informe de fallo), sin historial de conversación. Desviarse de ese formato puede degradar la calidad de la respuesta.
- Riesgo de alucinación: al ser un modelo de 3 B ajustado con datos sintéticos, puede generar instrucciones plausibles pero incorrectas ante fallos que no encajen en las seis categorías previstas.
- Evaluación limitada: la métrica de 24/24 proviene de 24 casos held-out del propio autor, no de un benchmark independiente. No hay validación externa publicada.
- Datos sintéticos: el entrenamiento se basa en ejemplos sintéticos generados para imitar el formato de Exe AI, lo que puede introducir sesgos hacia ese formato concreto y reducir la generalización a otros sistemas de agentes.
- Licencia Apache-2.0: permite uso comercial, modificación, rebranding y redistribución, con la obligación de atribuir el modelo base (Qwen/Qwen2.5-Coder-3B-Instruct).
- Builds de 1 bit no recomendadas: IQ1_M e IQ1_S caen a 9-10 de 24 casos, por lo que no son aptas para producción.
- Sin datos de latencia ni throughput: no se puede estimar el coste por petición a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exeterminal/Exe-Guard-Dynamic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Sitio web del proyecto Exe AI: https://exe-hq.net

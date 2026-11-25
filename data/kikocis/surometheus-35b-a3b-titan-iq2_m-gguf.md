# KikoCis/Surometheus-35B-A3B-Titan-IQ2_M-GGUF

## Resumen

Surometheus-35B-A3B-Titan-IQ2_M es una cuantización GGUF del modelo Surogate3.7-35B-A3B, publicado por el usuario KikoCis. El modelo base, desarrollado por invergent-ai, es un post-entrenamiento orientado a agentes de Qwen3.5-35B-A3B, una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token. Surometheus no introduce entrenamiento adicional ni fusiones: es una cuantización IQ2_M calibrada con matriz de importancia (imatrix) y con un ajuste manual del mix de tensores para preservar las capas críticas del modelo.

La relevancia de esta ficha reside en su objetivo de despliegue: comprimir un modelo de 34.660 millones de parámetros hasta 11,94 GB, entrando en la franja de 8-12 GB de VRAM donde operan muchas GPU de consumo. Para lograrlo, el autor eleva la precisión de tensores pequeños pero usados en cada token (compuertas de gated-delta-net, proyecciones de atención, experto compartido) mientras mantiene los 256 expertos enrutados en el mix IQ2_M estándar. El autor reporta mejoras medibles frente a una cuantización Q2_K de referencia en perplejidad y HumanEval.

El modelo está pensado para flujos agénticos: llamadas a herramientas, razonamiento multi-paso y resolución de tareas de ingeniería de software. Es una cuantización solo de texto: el modelo base incluye torre de visión y cabeza MTP, pero este GGUF contiene únicamente el modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Qwen3.5-35B-A3B, con atención completa y capas gated-delta-net (SSM híbrido) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | 262.144 tokens nativos en el GGUF; el modelo base anuncia hasta 1 M con escalado RoPE (no verificado en este entorno) |
| Tipos de cuantizacion | IQ2_M con mix de tensores ajustado: ssm_alpha/ssm_beta en Q8_0, ssm_out y attn_gate en Q4_K, attn_output en Q5_K, attn_v en Q6_K, attn_k en Q5_K, attn_q en IQ3_S, FFN del experto compartido en Q5_K; 256 expertos enrutados en IQ2_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con fichero imatrix asociado |
| Tamaño del fichero | 11,94 GB (modelo) + 0,19 GB (imatrix) |
| Runtimes verificados | Ollama 0.40.13 (tool calls nativos) y llama.cpp master |
| Modalidad | Solo texto (sin proyector de visión ni capa MTP) |

## Arquitectura y entrenamiento

El modelo base Surogate3.7-35B-A3B es un post-entrenamiento agéntico de Qwen3.5-35B-A3B. La arquitectura combina atención completa con capas gated-delta-net (un mecanismo de espacio de estados lineal), organizadas como mezcla de expertos: 256 expertos enrutados, que concentran aproximadamente el 93 % de los parámetros, más un experto compartido. Solo unos 3.000 millones de parámetros se activan por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño.

Esta ficha corresponde exclusivamente a la cuantización. No hubo entrenamiento adicional, fusión de pesos ni modificaciones por parte del autor de la cuantización. El proceso consistió en calibrar una matriz de importancia (174 × 2048 tokens) y aplicar un mix de tensores personalizado sobre la receta IQ2_M de llama.cpp. El ajuste dedicó unos 0,28 GB a subir la precisión de tensores pequeños pero presentes en cada token, manteniendo los expertos enrutados en 2 bits. Según el autor, este mix redujo la perplejidad en Wikitext-2 de 7,703 a 7,085 y elevó HumanEval pass@1 de 0,878 a 0,921 respecto al IQ2_M estándar con la misma imatrix.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso orientado a agentes, con modo de pensamiento (thinking) disponible a través de la plantilla de chat, aunque no evaluado en los benchmarks del autor.
- Llamadas a herramientas nativas (tool calling / function calling), verificadas en Ollama 0.40.13.
- Ejecución de tareas de ingeniería de software mediante arnés agéntico local: el autor reporta resolución de instancias reales de SWE-bench Verified.
- Generación de código en Python (HumanEval y HumanEval+).
- Capacidad de detenerse por sí mismo al completar una tarea agéntica, sin bucles infinitos en las pruebas realizadas.
- Sin capacidades de visión ni audio en este GGUF (la torre de visión del modelo base no está incluida).
- Soporte multilingüe limitado al inglés según la model card.

## Casos de uso

- Agente de resolución de incidencias de software: el modelo puede recibir un issue de un repositorio, inspeccionar ficheros mediante tool calls, aplicar un parche y verificar con tests. El autor lo validó resolviendo cuatro de cinco instancias de SWE-bench Verified con un presupuesto de contexto de unos 12.000 caracteres.
- Asistente de terminal y automatización de shell: el modelo base reporta resultados en Terminal-Bench 2.1; en esta cuantización puede integrarse en un arnés local para ejecutar comandos, leer salidas y encadenar pasos.
- Generación de código en pipelines de CI/CD: con HumanEval pass@1 de 0,921 en modo no-thinking, es adecuado para autocompletado y generación de funciones Python en entornos con recursos limitados.
- Automatización de atención al cliente multi-turno: su ventana nativa de 262.144 tokens permite mantener conversaciones largas con historial extenso, aunque el idioma soportado es únicamente inglés.
- Orquestación de agentes con herramientas externas (APIs, bases de datos, buscadores): las llamadas a funciones nativas permiten conectar el modelo a servicios y encadenar resultados dentro de un flujo multi-paso.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ocupar 11,94 GB, cabe en tarjetas de 12 GB o superiores, lo que permite prototipar agentes sin infraestructura en la nube.
- Evaluación y experimentación en investigación: útil para estudiar el comportamiento de modelos MoE cuantizados a baja precisión en tareas agénticas, con la imatrix publicada para reproducir la calibración.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre este fichero, comparados con la cuantización i1-Q2_K de mradermacher (13,25 GB):

| Benchmark | Configuración | Surometheus IQ2_M (11,94 GB) | mradermacher i1-Q2_K (13,25 GB) |
|---|---|---|---|
| SWE-bench Verified (sonda de 5 instancias) | Arnés agéntico local, ~12K caracteres de contexto, no-thinking, tool calls nativos, temp 1.0 / top_p 0.95 | 4/5 resueltas | No ejecutado |
| HumanEval pass@1 (base) | No-thinking, temp 0.6, top_p 0.95, seed 1234, 2048 tokens máx. | 0,921 | 0,896 |
| HumanEval+ pass@1 | Misma configuración | 0,872 | 0,835 |
| Generaciones desbocadas en HumanEval | Misma configuración | 0/164 | 1/164 |
| Perplejidad Wikitext-2 (menor es mejor) | 40 fragmentos de 2048 tokens | 7,085 ± 0,092 | 7,551 ± 0,102 |

Comparación interna del ajuste de tensores, con la misma imatrix:

| Variante | Tamaño | Perplejidad Wikitext-2 | HumanEval (base / plus) |
|---|---|---|---|
| IQ2_M estándar | 11,66 GB | 7,703 ± 0,100 | 0,878 / 0,835 |
| IQ2_M ajustado (este fichero) | 11,94 GB | 7,085 ± 0,092 | 0,921 / 0,872 |

El autor advierte que la diferencia en HumanEval debe leerse como "al menos a la par", dado que se trata de una única semilla, mientras que la mejora en perplejidad es la señal más robusta. Los resultados del modelo base a plena precisión (SWE-bench Verified 78,0, Terminal-Bench 2.1, BFCL v4, τ²-Bench) no se trasladan a esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 12-13 GB con el fichero de 11,94 GB, más overhead de contexto KV. Con contexto largo, el consumo crece de forma notable.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB) y superiores. En el entorno profesional, A100 o H100 con holgura, aunque el modelo está pensado para la franja de consumo.
- Cabe en GPU de consumo de 12 GB o más; en tarjetas de 8 GB probablemente no quepa con contexto útil, pese a que el autor menciona la franja de 8-12 GB como objetivo.
- Opciones de despliegue: llama.cpp (llama-server con --jinja) y Ollama 0.40.13, verificados por el autor. vLLM y TGI no están verificados para este fichero GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3 B activos, la inferencia es más rápida que un denso de 35 B, pero el autor no publica medidas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Tamaño | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|---|---|
| Surometheus-35B-A3B Titan IQ2_M | 34,66 B | ~3 B | 262.144 (hasta 1 M con RoPE, no verificado) | IQ2_M ajustado | 11,94 GB | Apache-2.0 | HumanEval 0,921; PPL 7,085; SWE 4/5 |
| mradermacher i1-Q2_K (Surogate 3.7) | 34,66 B | ~3 B | Igual que el base | Q2_K imatrix | 13,25 GB | Apache-2.0 | HumanEval 0,896; PPL 7,551; SWE no ejecutado |
| Surogate3.7-35B-A3B (BF16) | 34,66 B | ~3 B | Hasta 1 M (anunciado) | BF16 | No disponible | Apache-2.0 | SWE-bench Verified 78,0; Terminal-Bench 2.1; BFCL v4; τ²-Bench |

No se dispone de datos de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- IQ2_M equivale a unos 2,7 bits por parámetro: es una versión para portátil o GPU de consumo, no equivalente al modelo BF16. Con más memoria, una cuantización IQ3 o Q4 ofrece mejor calidad.
- El modelo base piensa por defecto; los benchmarks del autor se ejecutaron con thinking desactivado. El modo thinking está disponible en la plantilla de chat pero no fue evaluado.
- Los resultados del modelo base a plena precisión no son aplicables a esta cuantización.
- Idioma limitado al inglés, según la model card.
- Solo texto: no incluye visión ni cabeza MTP, aunque el modelo base sí las tenga.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- La sonda de SWE-bench consta solo de cinco instancias y no constituye una puntuación de leaderboard; tres de las resoluciones alcanzaron el límite de 80 mensajes del arnés.
- La ventana de 1 M tokens con escalado RoPE no está verificada en este entorno; solo se garantiza la ventana nativa de 262.144 tokens.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- La cuantización la publica un usuario individual (KikoCis), no el desarrollador del modelo base (invergent-ai); conviene verificar la integridad de los pesos antes de desplegar.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/KikoCis/Surometheus-35B-A3B-Titan-IQ2_M-GGUF
- Modelo base Surogate3.7-35B-A3B: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Cuantización de referencia i1-Q2_K de mradermacher: no disponible (enlace no incluido en la información proporcionada)
- Paper, blog o demo del modelo base: no disponible

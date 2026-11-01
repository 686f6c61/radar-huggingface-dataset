# jonpark0/Qwen3-0.6B-krafla

## Resumen

Qwen3-0.6B-krafla es una conversión cuantizada del modelo Qwen3-0.6B de Alibaba Qwen, publicada por el usuario jonpark0 para el runtime isa-lm. No se trata de un modelo nuevo ni de un fine-tuning, sino de una redistribución del modelo base en formatos INT4 e INT8 propietarios del runtime isa-lm (extensión `.mlb`), junto con el tokenizador convertido (`.mlt`). Su propósito es permitir la ejecución del modelo en CPU sin GPU, con dependencias mínimas (runtime C11 sin dependencias externas).

El modelo base Qwen3-0.6B es un transformer denso de 0,6 mil millones de parámetros con capacidad de razonamiento en modo "thinking" (etiquetas `<think>`), ventana de contexto de 4096 posiciones en esta conversión y licencia Apache 2.0. La aportación de esta ficha es la disponibilidad de pesos optimizados para arquitecturas x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (desde ARMv7 NEON hasta i8mm y SVE), lo que lo hace relevante para despliegues en entornos sin acelerador gráfico, CI/CD o dispositivos embebidos.

La relevancia actual radica en la combinación de un modelo pequeño con un runtime portátil y sin dependencias, que permite inferencia local en hardware modesto con velocidades medidas de hasta 80,6 tok/s en decodificación sobre un Xeon Platinum 8573C con 4 hilos y compilación AVX2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B); pesos convertidos a formato isa-lm `.mlb` |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 posiciones (fijada en la conversión con `--max-seq 4096`) |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixto (Q4_0 con `emb,v,o,down` en Q8_0), Q8_0 (8,5 bits/peso) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | `.mlb` (formato propietario de isa-lm); tokenizador en `.mlt` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3. La model card de esta conversión no describe la arquitectura interna ni los datos de entrenamiento del modelo base; únicamente documenta el proceso de conversión. Los pesos se obtuvieron a partir de los safetensors originales de `Qwen/Qwen3-0.6B` mediante las herramientas de isa-lm 0.5.0 (commit `793026f`), con fecha 2026-11-01.

La innovación técnica de esta publicación no está en el modelo, sino en el formato de cuantización: Q4_0 y Q8_0 mantienen una escala por bloque de 32 pesos con escalas en f16, lo que resulta en 4,5 y 8,5 bits por peso respectivamente. La variante mixta aplica Q8_0 a las matrices de embedding, proyección de valor, proyección de salida y proyección down, manteniendo Q4_0 en el resto, lo que reduce la perplejidad de 31,70 a 28,81 a costa de aumentar el tamaño de 320 MiB a 478 MiB. No se documenta en la información disponible si el modelo base recibió RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation`.
- Modo de razonamiento "thinking" del modelo base Qwen3, visible en las etiquetas `<think>...</think>` y desactivable con el sufijo `/no_think` en el prompt.
- Conversación multi-turno mediante la plantilla de chat ChatML (`--chat chatml` en `ml_run`).
- Ejecución en CPU sin GPU en x86-64 (SSE2, AVX2, AVX-512 VNNI) y ARM (ARMv7 NEON, i8mm, SVE).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Inferencia local en portátiles y estaciones de trabajo sin GPU: con 320 MiB en Q4_0, el modelo cabe en RAM convencional y se ejecuta con `ml_run` sobre cualquier CPU x86-64 con SSE2 o superior, sin instalar CUDA ni dependencias de Python.
- Despliegue en dispositivos embebidos ARM: la compilación para ARMv7 NEON, i8mm y SVE permite ejecutar el modelo en placas y SoC ARM de bajos recursos, útil para asistentes de texto offline.
- Integración en pipelines de CI/CD: el runtime sin dependencias y el binario único de isa-lm facilitan incluir pruebas de generación de texto o validación de prompts dentro de flujos automatizados, sin contenedores pesados.
- Prototipado rápido de aplicaciones de chat: la plantilla ChatML y el modo `/no_think` permiten alternar entre respuestas directas y respuestas con razonamiento, adecuado para experimentar con UX de asistentes.
- Evaluación comparativa de cuantizaciones: las tres variantes (Q4_0, Q4_0 mixto, Q8_0) con perplejidad medida sobre wikitext-2 permiten estudiar el compromiso entre tamaño, velocidad y calidad en un mismo modelo.
- Tareas de generación de texto de baja latencia en servidores sin acelerador: con 80,6 tok/s en decodificación sobre un Xeon de 4 hilos, es viable para resúmenes, clasificación o respuestas cortas en servicios internos.
- Educación y experimentación con LLM: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y laboratorios donde no hay GPUs disponibles.

## Benchmarks y rendimiento

Los datos publicados en la model card son medidas de perplejidad y velocidad del propio autor, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación:

| Fichero | Pesos | Tamano | Perplejidad (wikitext-2) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|---|
| `Qwen3-0.6B-Q4_0.mlb` | Q4_0, todas las matrices 4-bit | 320 MiB | 31,70 | 343 | 80,6 |
| `Qwen3-0.6B-Q4_0-mixed.mlb` | Q4_0 con `emb,v,o,down` en Q8_0 | 478 MiB | 28,81 | 286 | 53,9 |
| `Qwen3-0.6B-Q8_0.mlb` | Q8_0, todas las matrices 8-bit | 604 MiB | 27,89 | 228 | 42,9 |

Mediciones realizadas en un GitHub runner con CPU Intel Xeon Platinum 8573C, 4 hilos, compilación `avx2` de isa-lm. Perplejidad calculada sobre el conjunto de test de wikitext-2 con 4 fragmentos de 512 tokens (`tools/perplexity.py --ctx 512 --chunks 4`). Velocidad medida con `ml_bench -n 128` (128 tokens de prompt y 128 tokens decodificados). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecución en CPU. El requisito es RAM: aproximadamente 320 MiB (Q4_0), 478 MiB (Q4_0 mixto) o 604 MiB (Q8_0) para los pesos, más overhead del runtime y del contexto.
- GPU recomendadas: no aplica; el runtime isa-lm no usa GPU.
- CPU compatibles: x86-64 desde SSE2 hasta AVX-512 VNNI, y ARM desde ARMv7 NEON hasta i8mm y SVE. `ml_run` selecciona automáticamente la compilación más rápida soportada por la CPU.
- ¿Cabe en hardware de consumo? Sí, en cualquier CPU de consumo moderna; el límite es la RAM, no la GPU.
- Opciones de despliegue: isa-lm 0.5.0 o superior (Linux x86-64, AArch64, ARMv7 y Windows x86-64). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato `.mlb` es propietario de isa-lm.
- Latencia y throughput: medidos sobre Xeon Platinum 8573C con 4 hilos y AVX2: 343 tok/s de prefill y 80,6 tok/s de decode en Q4_0; 228 tok/s de prefill y 42,9 tok/s de decode en Q8_0. No se han publicado medidas para otras CPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-krafla (esta ficha) | 0,6 B | 4096 | `.mlb` / isa-lm (CPU) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B (original) | 0,6 B | no disponible en esta ficha | safetensors / transformers, vLLM, etc. | Apache 2.0 | HuggingFace oficial |
| Conversiones GGUF de Qwen3-0.6B | 0,6 B | según conversión | GGUF / llama.cpp, Ollama | Apache 2.0 | múltiples repos comunitarios |

La comparación relevante es con el modelo base original y con conversiones GGUF para llama.cpp: esta versión se distingue por el runtime isa-lm sin dependencias y por incluir medidas de perplejidad y velocidad publicadas, pero carece de ecosistema de herramientas y de soporte en frameworks estándar. No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 0,6 mil millones de parámetros: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en preguntas abiertas o especializadas.
- La cuantización Q4_0 degrada la calidad respecto al modelo original: la perplejidad en wikitext-2 sube a 31,70 frente a 27,89 en Q8_0; la variante mixta ofrece un compromiso intermedio (28,81).
- Contexto limitado a 4096 posiciones en esta conversión, inferior al contexto nativo del modelo base (no especificado aquí).
- Idiomas soportados no declarados en la model card; no se garantiza un rendimiento multilingüe homogéneo.
- Formato `.mlb` propietario: no es compatible con transformers, llama.cpp, vLLM, Ollama ni TGI; requiere el runtime isa-lm y sus herramientas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, es previsible que arrastre los sesgos de sus datos de entrenamiento, no detallados aquí.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene verificar la licencia del modelo base original antes de un despliegue en producción.
- La fecha de creación del repositorio (2026-11-01) y la versión de isa-lm referenciada (0.5.0) deben contrastarse con el estado actual del proyecto antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonpark0/Qwen3-0.6B-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario de isa-lm (formatos Q8, Q4 y mixto): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/793026fc45e780f03413f261193c715bfb6466eb

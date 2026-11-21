# Oriven-Labs/DAMS-27B

## Resumen

DAMS 27B es un modelo de lenguaje de 29.635.526.896 parámetros (aproximadamente 29,6 mil millones) desarrollado por Oriven Labs, presentado como el primer lanzamiento de su familia DAMS (Dynamic Associative Memory System), orientada a ingeniería de software y trabajo agéntico de largo horizonte. Se construye mediante un ajuste fino de parámetros completos sobre Qwen/Qwen3.8-27B, un transformer híbrido que combina capas de atención completa con capas Gated DeltaNet (atención lineal) a lo largo de 64 capas, y añade 16 capas de memoria asociativa DAMS (unos 1.850 millones de parámetros adicionales) insertadas como ramas residuales tras cada capa de atención completa.

La innovación central es el mecanismo de memoria DAMS v2, inicializado a cero de forma que en el paso 0 el modelo es idéntico al base, y entrenado con GRPO de parámetros completos sobre un currículo de tareas reales de repositorios de software, donde las recompensas provienen únicamente de que pasen los tests del repositorio (con términos anti-manipulación de tests y de honestidad). El resultado es un modelo que mejora al base en programación competitiva y razonamiento científico, aunque retrocede en tareas agénticas de SWE y en seguimiento de instrucciones en esta iteración.

Es relevante ahora porque se distribuye con pesos abiertos bajo licencia Apache 2.0, soporta contexto nativo de 262.144 tokens y está pensado para servirse con vLLM mediante un plugin específico incluido en el repositorio. La memoria, no obstante, es por petición y no persiste entre solicitudes, y sus ramas están ligeramente entrenadas en esta versión, por lo que su contribución es pequeña.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + Gated DeltaNet / Gated Attention), 64 capas, con 16 capas de memoria asociativa DAMS v2 |
| Parámetros totales | 29.635.526.896 (~29,6B); de ellos ~1,85B corresponden a las capas de memoria DAMS |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantización | No disponible (checkpoint publicado en bf16 safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); pesos de memoria en `model-dams-mem.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer híbrido de 64 capas que intercala atención completa con mezcladores Gated DeltaNet (atención lineal). Sobre esa base, Oriven Labs añade 16 capas de memoria asociativa DAMS v2: tras cada capa de atención completa `i` listada en `text_config.dams_mem_layers`, se aplica `x' = x + GDN_mem(RMSNorm_mem(x))`, donde `GDN_mem` es un mezclador Gated DeltaNet nativo de Qwen con la misma geometría de cabezas que las capas de atención lineal del base. Las ramas se inicializan con `out_proj = 0`, de modo que el modelo arranca siendo exactamente el base. Los pesos residen en `model-dams-mem.safetensors` bajo `model.language_model.layers.{i}.dams_mem.*`, y el módulo de referencia es `dams_mem_v2.py`.

El entrenamiento consiste en RL de parámetros completos con GRPO (sin LoRA), con la memoria siempre activa, sobre un currículo de tareas de ingeniería de software de repositorios reales. Las recompensas se obtienen de que pasen los tests, más términos anti-edición-de-tests y de honestidad; la selección de checkpoint se hace sobre un conjunto SWE reservado. El checkpoint publicado es `it6`, la mejor iteración reservada del run. Los datos de entrenamiento se declaran decontaminados, con licencias comerciales y sin destilación de modelos cerrados. El codificador de visión proviene del checkpoint base, pero DAMS se entrenó y evaluó solo en texto.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Programación y resolución de problemas de código, con mejora medida en LiveCodeBench v6 (88,15 frente a 84,83 del base).
- Razonamiento científico y de conocimiento (GPQA Diamond 89,96 en avg@8).
- Tool calling / function calling: el despliegue recomendado incluye `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Trabajo agéntico multi-paso sobre repositorios (SWE-bench Verified, DeepSWE), con harness tipo mini-SWE-agent y Claude Code.
- Modo de razonamiento con parser `qwen3` (`--reasoning-parser qwen3`).
- Memoria asociativa por petición (no persistente entre solicitudes), con contribución pequeña en esta versión.
- Capacidades multilingües: no disponibles (los idiomas no se documentan).
- Visión: los pesos del codificador existen en el checkpoint, pero no se entrenaron ni evaluaron.

## Casos de uso

- Resolución de incidencias en repositorios: el modelo puede recibir un issue y el árbol del repositorio, razonar en varios pasos y proponer un parche que se valida ejecutando la suite de tests, gracias a su entrenamiento con recompensas basadas en tests reales.
- Generación de código en producción: con tool calling habilitado y parser `qwen3_coder`, se integra en pipelines de CI/CD para generar parches, tests o refactorizaciones acotadas, con contexto de 262.144 tokens para incluir varios ficheros.
- Programación competitiva y entrenamiento de algoritmia: su mejor rendimiento relativo está en LiveCodeBench v6, por lo que encaja en entornos de evaluación de problemas algorítmicos y generación de soluciones.
- Asistentes de ingeniería con contexto largo: la ventana nativa de 262.144 tokens permite cargar documentación extensa, trazas o múltiples módulos en una sola petición con prefix caching activado.
- Razonamiento científico y QA técnico: GPQA Diamond con avg@8 lo sitúa como opción para preguntas de dominio científico con verificación por muestreo múltiple.
- Agentes de automatización de tareas de desarrollo con harness externo: se puede desplegar con vLLM y conectarlo a harness tipo mini-SWE-agent o Claude Code para tareas de varias horas, aunque conviene validar el rendimiento en SWE frente al base.
- Evaluación de instrucciones estrictas y formato: IFBench estricto mide su seguimiento de instrucciones, útil para generar salidas con formato fijo, aunque en esta versión queda por debajo del base.

## Benchmarks y rendimiento

| Benchmark (pass@1) | DAMS 27B (it6) | Qwen3.8-27B (base) |
|---|---|---|
| LiveCodeBench v6 | 88,15 | 84,83 |
| GPQA Diamond (avg@8) | 89,96 | 89,2* |
| SWE-bench Verified | 85,2% (426/500) | 86,6% (433/500) |
| DeepSWE v1.1 | 39,8% (45/113) | 44,2% (50/113) |
| IFBench (strict) | 72,0 | 79,5 |

LiveCodeBench, SWE-bench Verified (mini-SWE-agent, 250 pasos) y DeepSWE (harness Claude Code, 3 h por tarea) fueron ejecutados por Oriven Labs con harness idénticos para ambos modelos, servidos con vLLM a contexto nativo de 262.144 tokens. *La puntuación de GPQA del base es la publicada por Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el checkpoint ocupa 59,3 GB en el repositorio, por lo que se necesita aproximadamente esa cifra más overhead de KV cache y estado de memoria; con cuantización de 8 bits o 4 bits (no documentada oficialmente) bajaría, pero no hay cifras publicadas.
- GPU recomendadas: para bf16 a contexto largo, GPUs de 80 GB o más (A100 80GB, H100 80GB) o multi-GPU; no se documentan configuraciones oficiales.
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 (24 GB) en bf16.
- Despliegue: vLLM 0.31 con el plugin `vllm_dams/` incluido en el repo (ruta usada en todos los benchmarks); `transformers` solo como referencia de arquitectura, sin ruta `trust_remote_code` probada para inferencia.
- Nota de memoria: las capas DAMS añaden ~33% más estado Gated DeltaNet por secuencia; si el motor falla al asignar, bajar `--max-num-seqs` (por ejemplo de 256 a 192). El plugin se puede desactivar con `DAMS_VLLM_PLUGIN=0`, lo que ejecuta el modelo sin memoria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAMS 27B (it6) | ~29,6B | 262.144 | 85,2% | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.8-27B (base) | no disponible | 262.144 (según repo DAMS) | 86,6% | Apache 2.0 | Pesos abiertos en HF |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con su modelo base Qwen3.8-27B: DAMS gana en LiveCodeBench v6 y GPQA Diamond, y pierde en SWE-bench Verified, DeepSWE v1.1 e IFBench estricto. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La memoria DAMS es por petición y no persiste entre solicitudes; no hay memoria a largo plazo entre llamadas.
- Las ramas de memoria están ligeramente entrenadas en esta versión, por lo que su contribución es pequeña; se anuncia memoria persistente más fuerte para versiones posteriores.
- Retrocede frente al base en tareas agénticas de SWE (SWE-bench Verified 85,2% frente a 86,6%; DeepSWE 39,8% frente a 44,2%) y en seguimiento de instrucciones estricto (IFBench 72,0 frente a 79,5).
- Requiere el plugin de vLLM incluido en el repo: `transformers` y vLLM estándar ignoran `model-dams-mem.safetensors` y ejecutan el modelo sin memoria, que no es el evaluado.
- El codificador de visión está presente pero no se entrenó ni evaluó; no debe asumirse capacidad visual.
- Idiomas soportados no documentados; no hay garantías multilingües declaradas.
- No se publican datos de sesgos, tasas de alucinación ni cuantizaciones oficiales.
- El chat template incluye un system prompt por defecto que identifica el modelo como DAMS-27B y le indica que reconozca no saber más allá de unos hechos fijados; un system message propio lo reemplaza.
- Licencia Apache 2.0, permisiva para uso comercial, sujeta a los términos del fichero `LICENSE` del repositorio.
- Solo 1 like y 998 descargas en el momento de la consulta: ecosistema pequeño, poca validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Oriven-Labs/DAMS-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Contacto del autor: alexander@orivenlabs.com
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.

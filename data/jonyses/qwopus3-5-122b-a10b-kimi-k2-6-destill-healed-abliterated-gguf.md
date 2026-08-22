# Jonyses/Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated-GGUF

## Resumen

Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated es un modelo multimodal (texto e imagen) en formato GGUF, publicado por Jonyses como compilación del modelo base de OpenYourMind. Se trata de un modelo MoE híbrido de ~122B parámetros totales y ~10B activos, basado en la arquitectura Qwen3.5 (Gated DeltaNet linear-attention + MoE), con una torre de visión Qwen3-VL para entrada de imágenes. El repositorio incluye tanto el modelo de lenguaje cuantizado en Q4_K_M (~76 GB) como el proyector de visión en F16 (~0.9 GB), lo que permite ejecutar el sistema completo con llama.cpp o LM Studio.

El modelo ha pasado por un pipeline de post-entrenamiento en cuatro fases: ablación de rechazos (refusal ablation), SFT con LoRA restringida de razonamiento estilo Opus, SFT de completions no restringidas y finalmente DPO de razonamiento destilado de Kimi K2.6 (~3.000 muestras + datos sintéticos). El autor reporta que el DPO mejoró la verbosidad del razonamiento en ~12% de las peticiones y eliminó bucles en 2-6% de conversaciones largas. Es relevante para desarrolladores que buscan un modelo multimodal "abliterado" con razonamiento reforzado, ejecutable en hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido Qwen3.5 (Gated DeltaNet linear-attn + MoE) con torre de visión Qwen3-VL |
| Parametros totales | 124.635.206.144 (~122B) |
| Parametros activos | ~10B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~4.6 bits/param) |
| Idiomas soportados | no disponible |
| Licencia | other (hereda de la licencia base de Qwen3.5) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Qwen3.5 MoE híbrida, que combina atención lineal Gated DeltaNet con capas de atención tradicional en un mezcla de expertos con ~10B parámetros activos sobre ~122B totales. Requiere una versión reciente de llama.cpp con soporte para el tipo de arquitectura `qwen35moe`. Incluye además una cabeza MTP (multi-token prediction) para decodificación especulativa, aunque el autor indica que en sus pruebas no aporta ganancia medible de rendimiento y recomienda desactivarla.

El pipeline de entrenamiento del modelo base consta de cuatro fases: (1) ablación de rechazos para eliminar las negativas de contenido; (2) SFT con LoRA restringida de razonamiento estilo Opus, que enseña al modelo a razonar de forma extensa; (3) SFT de completaciones elegidas sin restricciones para restaurar la fluidez; y (4) DPO de razonamiento destilado de Kimi K2.6 con ~3.000 muestras y datos sintéticos, que reduce bucles y mejora la coherencia del razonamiento en conversaciones largas. El proyector de visión (mmproj) es el codificador Qwen3-VL del modelo base, en F16.

## Capacidades

- Generación de texto y razonamiento multi-step con razonamiento extenso estilo Kimi K2.6.
- Entrada multimodal: procesamiento de imágenes junto con texto para descripción y análisis visual.
- MTP (multi-token prediction) para decodificación especulativa, aunque sin beneficio medible en este checkpoint.
- Razonamiento mejorado en conversaciones largas (menos bucles) gracias al DPO de Kimi K2.6.
- Modelo "abliterado" (uncensored): sin rechazos de contenido por defecto.
- Soporte de tool calling: no documentado en la información disponible.

## Casos de uso

- Análisis de documentos técnicos con imágenes: el modelo puede describir y razonar sobre capturas de pantalla, diagramas o documentos escaneados, combinando entrada visual con razonamiento extenso.
- Asistente de investigación y síntesis de información: gracias al razonamiento destilado de Kimi K2.6, puede generar informes largos y estructurados sobre temas complejos a partir de prompts de texto.
- Prototipado de aplicaciones de chat multimodal en local: con LM Studio o llama.cpp, se puede desplegar un asistente de texto e imagen sin conexión en una estación con GPU de 96 GB o Apple Silicon de 128 GB.
- Generación de contenido creativo sin restricciones: el modelo abliterado permite explorar temas que los modelos comerciales rechazan, como ficción para adultos o análisis de contenido controvertido.
- Evaluación de técnicas de alineación y ablación: es un caso de estudio útil para investigar cómo la ablación de rechazos + DPO afecta al razonamiento y la alucinación en modelos MoE de gran escala.
- Aplicaciones de visión por computador con razonamiento de alto nivel: clasificación y descripción de imágenes en entornos donde se requiere explicación detallada de lo que se ve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El servicio omlx.ai reporta un throughput de 513,4 tokens/s en pre-procesado (PP) y 39,0 tokens/s en generación (TG) para la versión cuantizada a 4 bits ejecutada en un Apple M3 Max (40 núcleos, 128 GB de memoria unificada).

## Requisitos de hardware

- VRAM estimada: ~76 GB para el modelo Q4_K_M + ~0,9 GB para el proyector de visión, más margen para el KV cache según la longitud de contexto.
- GPU recomendadas: GPU de 96 GB (p. ej., NVIDIA H100 100 GB o similar); una A100 80 GB se queda corta para el modelo completo con contexto extendido.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por el tamaño del modelo en Q4_K_M.
- Opciones de despliegue: llama.cpp (CLI, servidor y multimodo), LM Studio, y cualquier runtime GGUF con soporte para la arquitectura `qwen35moe`.
- Latencia y throughput: ~39 tokens/s en generación y ~513 tokens/s en pre-procesado en M3 Max 128 GB según omlx.ai; el rendimiento varía según la GPU y la configuración de contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.5-122B-A10B (este) | ~122B | ~10B | no disponible | other (Qwen3.5) | GGUF |
| Qwen3-235B-A22B (MoE) | ~235B | ~22B | no disponible | Apache 2.0 | safetensors, GGUF |
| Qwen3-30B-A3B (MoE) | ~30B | ~3B | no disponible | Apache 2.0 | safetensors, GGUF |

Nota: los datos de los modelos comparativos provienen del conocimiento general de la familia Qwen3 y no han sido verificados en esta ficha; los parámetros de contexto no están disponibles en las fuentes consultadas. La comparación es orientativa.

## Limitaciones y advertencias

- Licencia "other" heredada de Qwen3.5: las restricciones de uso comercial no están claramente especificadas; se recomienda revisar la licencia del modelo base antes de desplegar en producción.
- Modelo "abliterado": sin restricciones de contenido, puede generar texto inapropiado, peligroso o ilegal; el uso es responsabilidad del usuario.
- Riesgo de alucinación: no se han publicado evaluaciones específicas; como cualquier modelo de lenguaje, puede producir información falsa con alta confianza.
- La cabeza MTP no aporta ganancia medible según el autor; desactivar la decodificación especulativa MTP para evitar complejidad innecesaria.
- Sin benchmarks estándar publicados: no hay evidencia de rendimiento en tareas de matemáticas, código o conocimiento general.
- Contexto e idiomas no documentados: no se especifica la longitud máxima de contexto ni los idiomas soportados con garantía.
- Requiere hardware de gama alta: no ejecutable en GPUs de consumo (VRAM ≤ 24 GB); solo viable en estaciones con 96 GB+ de memoria.

## Enlaces

-

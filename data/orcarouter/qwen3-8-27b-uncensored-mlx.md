# orcarouter/Qwen3.8-27B-Uncensored-MLX

## Resumen

orcarouter/Qwen3.8-27B-Uncensored-MLX es una adaptación del modelo Qwen3.8-27B de Alibaba, modificada mediante una técnica conocida como *abliteration* (eliminación de la dirección de rechazo) y posteriormente cuantizada para ejecutarse en hardware Apple Silicon mediante la librería MLX. El modelo resultante conserva las capacidades generales del original —razonamiento, visión-lenguaje, tool calling y control de pensamiento— pero con una tasa de rechazo cercana a cero, lo que lo orienta explícitamente a tareas de red teaming y auditoría de seguridad en IA.

La versión MLX se distribuye en formatos cuantizados de 4 y 8 bits, pensados para inferencia eficiente en Macs con chip M-series. El repositorio ocupa 77,7 GB, lo que sugiere que incluye varias versiones cuantizadas o pesos intermedios. El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace, aunque la licencia declarada es Apache-2.0. Es una herramienta de doble uso: útil para investigadores de seguridad, pero peligrosa si se emplea fuera de entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet + atención completa), visión-lenguaje nativo |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se espera heredada del Qwen3.8-27B, probablemente 128k tokens, pero no confirmado) |
| Tipos de cuantizacion | MLX 4-bit y 8-bit (según tags) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 (acceso gated en HuggingFace) |
| Formato de pesos | safetensors (MLX), también disponible en FP8 para otras plataformas |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con capas de atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la calidad. Incluye un cabezal de decodificación especulativa (MTP) para acelerar la generación. Es un modelo nativo de visión-lenguaje, capaz de procesar imágenes junto con texto. El entrenamiento original incluyó fases de preentrenamiento y ajuste fino con refuerzo (RLHF/DPO), aunque los detalles exactos no se especifican en la información disponible.

La modificación aplicada por orcarouter consiste en *abliteration*: se identifica la dirección del vector de rechazo en los pesos residuales y se ortogonaliza respecto a las matrices de escritura, eliminando así el mecanismo de negativa a responder. Posteriormente se cuantiza el modelo a FP8 (E4M3, bloques de 128×128) para la versión FP8, y a MLX 4/8-bit para Apple Silicon. Según los autores, las capacidades generales se mantienen prácticamente intactas tras la ablación, mientras que la tasa de rechazo cae a casi cero.

## Capacidades

- Generación de texto y razonamiento multi-step con control de "modo pensamiento" (thinking mode) flexible.
- Comprensión de imágenes y respuesta a preguntas visuales (visión-lenguaje nativo).
- Tool calling / function calling para integración con APIs y agentes.
- Soporte de agentes con razonamiento encadenado (multi-step reasoning).
- Multilingüe: inglés y chino (los idiomas declarados; puede generalizar a otros, pero no está garantizado).
- Decodificación especulativa (MTP) para acelerar la inferencia.
- Ausencia de mecanismos de rechazo: responde a solicitudes que el modelo original bloquearía, incluidos contenidos peligrosos o ilegales (por diseño, para red teaming).

## Casos de uso

- Auditoría de seguridad de modelos: permite probar vulnerabilidades de jailbreak y evaluar la robustez de otros sistemas frente a entradas maliciosas, al disponer de un modelo sin filtros de referencia.
- Investigación en alineación: estudiar qué ocurre cuando se elimina la dirección de rechazo y cómo afecta a la coherencia, la utilidad y la seguridad del modelo.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieran explorar temas tabú o controvertidos sin censura automática.
- Desarrollo de agentes autónomos: al no rechazar acciones, puede usarse para prototipar agentes que necesiten ejecutar pasos intermedios que otros modelos bloquean (siempre en entornos aislados).
- Evaluación de políticas de moderación: comparar las respuestas del modelo abliterado con el original para medir el impacto de la alineación en la calidad y seguridad.
- Formación en red teaming: como herramienta didáctica para enseñar técnicas de ataque y defensa en cursos de seguridad de IA, bajo supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los autores mencionan que las capacidades generales se mantienen tras la ablación y cuantización, pero no aportan cifras concretas de MMLU, HumanEval, GSM8K u otros tests. Se recomienda consultar el repositorio del modelo base Qwen3.8-27B para obtener referencias de rendimiento originales.

## Requisitos de hardware

- Específico para Apple Silicon: requiere un Mac con chip M1, M2, M3 o M4 (incluidos variantes Pro/Max/Ultra).
- VRAM estimada: para la versión MLX 4-bit, aproximadamente 14-16 GB de memoria unificada; para 8-bit, alrededor de 27-30 GB. Cifras orientativas basadas en el tamaño de 27B parámetros, no confirmadas por el autor.
- GPU recomendadas: no aplica (solo Apple Silicon). En otras plataformas, usar la versión FP8 del mismo autor con GPUs NVIDIA (A100, H100, RTX 4090, etc.).
- Opciones de despliegue: MLX (nativo), llama.cpp (si se convierte a GGUF), o vLLM/TGI si se usa la versión FP8.
- Latencia y throughput: no disponibles. Dependerá de la cuantización, el chip y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | no disponible | Apache-2.0 | BF16/FP8 | Con mecanismos de seguridad y rechazo |
| Qwen3.8-27B-Uncensored-FP8 | 27B | no disponible | Apache-2.0 | FP8 | Abliterado, para GPUs NVIDIA |
| orcarouter/Qwen3.8-27B-Uncensored-MLX | 27B | no disponible | Apache-2.0 | MLX 4/8-bit | Abliterado, para Apple Silicon |

No se dispone de otros modelos comparables de la misma categoría (abliterados de 27B) en la información proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente sin mecanismos de rechazo: puede generar contenido peligroso, ilegal, violento o sexualmente explícito. Su uso está restringido a investigación de seguridad y red teaming en entornos controlados.
- Riesgo elevado de alucinación: al eliminar la dirección de rechazo, el modelo podría afirmar información falsa con mayor confianza, especialmente en dominios sensibles.
- Idiomas limitados: solo se garantiza inglés y chino; el rendimiento en otros idiomas puede degradarse.
- Acceso gated: requiere aceptar condiciones en HuggingFace, lo que limita su disponibilidad inmediata.
- Cuantización MLX: no es compatible con GPUs NVIDIA o AMD; requiere hardware Apple Silicon.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara que el propósito es investigación de seguridad; el uso indebido puede acarrear responsabilidades legales.
- No se han publicado benchmarks formales: el rendimiento real en tareas estándar no está verificado.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Versión FP8 del mismo autor: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Artículo sobre la versión FP8 en BestHub: https://www.besthub.dev/articles/how-the-qwen3-8-27b-uncensored-fp8-model-erases-refusal-direction-for-red-team-use-f4554f60dfd3
- Análisis en SingHfinity: https://singhfinity.com/insights/articles/orcarouter-s-abliterated-qwen3-8-27b-ships-without-the-bf16-weights-or-a-single-
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B

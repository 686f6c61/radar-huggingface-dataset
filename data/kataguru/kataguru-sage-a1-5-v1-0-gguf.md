# kataguru/Kataguru-Sage-A1.5-v1.0-GGUF

## Resumen

Kataguru-Sage-A1.5-v1.0-GGUF es la versión cuantizada en formato GGUF (con calibración imatrix) del modelo Kataguru-Sage-A1.5-v1.0, un modelo MoE multimodal de 35,5B parámetros totales (configuración 35B-A3B, es decir, unos 3B parámetros activos por token) desarrollado por kataguru a partir del modelo base InternScience/Sage-A1.5. El modelo se presenta con tres perfiles de cuantización (APEX-Small, APEX-Medium y APEX-Good) más un proyector de visión FP16 (`mmproj`), pensados para ejecutarse localmente con llama.cpp, LM Studio u Ollama.

El problema que resuelve es doble: por un lado, ofrece un modelo con razonamiento científico y matemático reforzado, código algorítmico y visión multimodal en GPUs de consumo de 16-24 GB; por otro, elimina las conductas de rechazo y "sermoneo" del modelo base mediante ortogonalización de activaciones (SOMA/ARA), siguiendo la filosofía "Uncensored, Obedient y Reinforced". Es relevante ahora porque combina una arquitectura MoE eficiente (256 expertos enrutados por capa con top_k=8), una ventana de contexto nativa de 262.144 tokens, soporte de imágenes por defecto y un afinamiento específico para finés de alta calidad gramatical, algo poco habitual en modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo Qwen3.5-35B-A3B, 40 capas, 256 expertos enrutados + 1 experto compartido por capa, top_k=8 |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (configuración 35B-A3B) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | APEX-Small (2,92 bpw + imatrix), APEX-Medium (3,28 bpw + imatrix), APEX-Good (3,71 bpw + imatrix); proyector de visión mmproj-f16 |
| Idiomas soportados | Inglés y finés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (calibrado con imatrix bilingüe inglés + finés + STEM + código), con MTP de capa 40 (`blk.40.nextn.*`) |

## Arquitectura y entrenamiento

El modelo hereda el backbone MoE de InternScience/Sage-A1.5: 40 capas con 256 expertos enrutados más 1 experto compartido por capa, activando top_k=8 expertos por token, lo que explica el perfil 35B-A3B (35B totales, ~3B activos). Incluye un codificador de visión nativo de 27 capas (333 tensores) distribuido como `mmproj-f16`, habilitado por defecto, y un módulo MTP (multi-token prediction) en la capa 40 para acelerar la decodificación.

Sobre el modelo base, kataguru aplicó dos fases de modificación: primero, ortogonalización de activaciones SOMA/ARA para eliminar las direcciones de rechazo y los comportamientos de "lección de IA" en el pre-entrenamiento; después, un currículo QLoRA de 4 ciclos con estratificación 2D (ciclo 1: primaria; ciclo 2: bachillerato superior; ciclo 3: ingeniería aplicada; ciclo 4: recocido universitario/PhD), con r=16 qr_frozen_a y entrenamiento de los 256 expertos y los routers. Se añadió además una plantilla de chat `chat_template.jinja` con 6 modos. No se ha publicado información sobre el número de tokens del pre-entrenamiento ni sobre el uso de RLHF/DPO específico más allá del refuerzo de cadena de pensamiento matemático mencionado por el autor.

## Capacidades

- Razonamiento científico y matemático con cadena de pensamiento reforzada (mejoras declaradas de +47,23 pp en GSM8K y +7,20 pp en ARC-Easy frente al modelo base).
- Código algorítmico competitivo: 40,00 % Pass@1 en LiveCodeBench v6 con `--enable-thinking`.
- Visión multimodal habilitada por defecto (proyector mmproj-f16): análisis de diagramas, capturas de código, documentos e imágenes técnicas.
- Seguimiento estricto de instrucciones: +17,74 pp en IFEval Prompt Strict y +16,79 pp en Inst Strict frente al modelo base.
- Tool calling / function calling: 83,38 % en BFCL V4 Single-Turn AST y 79,78 % en detección de irrelevancia.
- Agentes multi-paso mediante etiquetas `<tool_call>` multilenguaje.
- Generación de finés gramaticalmente correcto al 100 % (según el autor), junto a inglés técnico.
- Modo de razonamiento (`--enable-thinking`) activable en llama.cpp.
- Modelo sin censura: tasa de rechazo declarada del 0,00 %.

## Casos de uso

- Razonamiento STEM local: resolución de problemas de matemáticas, física y medicina en una GPU de 16-24 GB gracias al perfil MoE de ~3B activos, adecuado para investigadores sin acceso a clusters.
- Análisis de documentación técnica con imágenes: el proyector de visión permite consultar diagramas de arquitectura, capturas de errores o esquemas de circuitos directamente en el prompt.
- Generación y depuración de código algorítmico: con `--enable-thinking`, el modelo aborda problemas de programación competitiva y puede integrarse en flujos de revisión de código locales.
- Agentes con herramientas: su puntuación en BFCL V4 y su plantilla `<tool_call>` lo hacen apto para orquestadores locales que necesiten llamadas a funciones fiables y detección de peticiones irrelevantes.
- Redacción técnica en finés: generación de documentación de ingeniería, comentarios de código y prosa técnica gramaticalmente impecable en finés, un idioma con escaso soporte en modelos abiertos.
- Cumplimiento estricto de formatos de salida: útil en pipelines que requieren JSON/AST estructurados y respeto de restricciones de longitud y formato sin verbosidad no solicitada.
- Asistente conversacional local sin filtros: para usuarios que necesitan un modelo sin rechazos en entornos controlados y legítimos (investigación, ficción, análisis de contenido sensible).

## Benchmarks y rendimiento

Datos declarados por el autor (evaluados en 2x RTX 5090 32 GB, TP=2, con lm-evaluation-harness 0.4.13, LiveCodeBench v6 y BFCL V4). Comparación Kataguru-Sage-A1.5-v1.0 frente al modelo base InternScience/Sage-A1.5:

| Benchmark | Base Sage-A1.5 | Kataguru-Sage-A1.5-v1.0 |
|---|---|---|
| Media no ponderada de 15 benchmarks (thinking activado) | 59,41 % | 65,55 % (+6,14 pp) |
| Media no ponderada de 15 benchmarks (sin thinking) | 59,41 % | 65,13 % (+5,71 pp) |
| Media cognitiva de 11 tareas | 62,63 % | 68,69 % |
| GSM8K | no disponible (base) | +47,23 pp frente a base |
| ARC-Easy | no disponible (base) | +7,20 pp frente a base |
| LiveCodeBench v6 (Pass@1, thinking) | no disponible (base) | 40,00 % |
| IFEval Prompt Strict | no disponible (base) | +17,74 pp |
| IFEval Inst Strict | no disponible (base) | +16,79 pp |
| BFCL V4 Single-Turn AST | no disponible (base) | 83,38 % |
| BFCL V4 Irrelevance Detection | no disponible (base) | 79,78 % |
| Tasa de rechazo | no disponible | 0,00 % |

Nota: los valores absolutos de GSM8K, ARC-Easy e IFEval del modelo afinado no se detallan en la model card, solo los incrementos frente al modelo base. No hay comparación publicada con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada (incluyendo proyector de visión mmproj): ~13,5 GB con APEX-Small; ~15,2 GB con APEX-Medium; ~17,2 GB con APEX-Good.
- Cuantización APEX-Small (12,1 GiB en disco): cabe en GPUs de 16 GB como RTX 4080, RTX 5080 o RTX 5060 Ti 16GB.
- Cuantización APEX-Medium (13,6 GiB): recomendada para 16-24 GB (RTX 4090, RTX 5080, RTX 5090); mejor relación calidad/VRAM según el autor.
- Cuantización APEX-Good (15,6 GiB): recomendada para 24-32 GB (RTX 3090, RTX 4090, RTX 5090); máxima precisión GGUF para razonamiento STEM exigente.
- El proyector de visión añade ~0,9 GB de VRAM adicional.
- Entorno de pruebas del autor: 2x RTX 5090 32 GB con tensor parallelism TP=2 y CUDAGraphs; también validado en llama.cpp b11064, LM Studio, vLLM v0.18+ y CUDA 12.9.
- Despliegue: `llama-server` (con `--mmproj` y `--jinja`), LM Studio y Ollama como runtimes recomendados; vLLM v0.18+ también probado.
- No se han publicado cifras de latencia ni throughput por token/s en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru-Sage-A1.5-v1.0 (GGUF) | 35,5B (~3B activos, MoE) | 262.144 | Sí (mmproj-f16) | Apache 2.0 | GGUF en HuggingFace, sin censura |
| Qwen3-30B-A3B (referencia de arquitectura similar) | 30,5B (~3,3B activos, MoE) | 128K (con YaRN) | No (versión base) | Apache 2.0 | GGUF, safetensors, amplio soporte |
| InternScience/Sage-A1.5 (modelo base) | 35,5B (~3B activos, MoE) | 262.144 | Sí | no disponible | HuggingFace, con conductas de rechazo |

Nota: la comparación con Qwen3-30B-A3B es orientativa por similitud de clase de tamaño y perfil MoE; no se han publicado benchmarks comparativos directos entre ellos en la información disponible.

## Limitaciones y advertencias

- Al ser un modelo deliberadamente sin censura (tasa de rechazo del 0,00 % declarada), no aplica salvaguardas de seguridad integradas: su despliegue en producción exige controles externos de moderación y un uso responsable conforme a la legislación aplicable.
- Las cifras de benchmarks provienen exclusivamente del autor del modelo; no hay verificación independiente publicada, por lo que conviene tratarlas con cautela.
- Cuantizaciones agresivas (2,92-3,71 bpw): aunque calibradas con imatrix, la degradación de calidad en tareas delicadas debe validarse caso por caso.
- Soporte lingüístico limitado a inglés y finés; el rendimiento en castellano u otros idiomas no está documentado y probablemente no esté optimizado.
- El módulo MTP (`blk.40.nextn.*`) y el modo thinking requieren versiones recientes de llama.cpp (probado en b11064); runtimes antiguos pueden no soportarlos.
- Riesgo de alucinación: no documentado específicamente; como en cualquier LLM, las salidas factuales deben verificarse, especialmente en dominios médicos y científicos.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero el etiquetado "uncensored" puede entrar en conflicto con las políticas de algunas plataformas de despliegue.
- La model card del repositorio está incompleta (se corta en la sección de comparación de benchmarks), por lo que faltan detalles del conjunto completo de 15 benchmarks.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sage-A1.5-v1.0-GGUF
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Versión NVFP4 del autor: https://huggingface.co/kataguru/Kataguru-Sage-A1.5-v1.0-NVFP4
- Paper, blog oficial y demo: no disponibles en la información proporcionada.

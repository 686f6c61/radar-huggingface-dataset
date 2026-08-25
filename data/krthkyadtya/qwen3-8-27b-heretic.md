# krthkyadtya/Qwen3.8-27B-heretic

## Resumen

**Qwen3.8-27B-heretic** es una versión "abliterated" (desensurada) del modelo **Qwen/Qwen3.8-27B-FP8**, desarrollada por el usuario krthkyadtya mediante la herramienta **Heretic** (ablación direccional automática de rechazos). El modelo base es un modelo de visión-lenguaje denso de 27.356 millones de parámetros con arquitectura híbrida (atención lineal en 48 de 64 capas y atención completa en el resto), torre de visión, contexto nativo de 262.144 tokens y soporte de modos de razonamiento (thinking y non-thinking). La versión heretic elimina el comportamiento de rechazo (refusal) del modelo original, manteniendo una divergencia KL de 0,0825 respecto al original, muy por debajo del umbral de ~0,5 que indicaría daño real en las capacidades.

El proceso de abliteration consistió en dequantizar el checkpoint FP8 original a bf16 y aplicar la ablación direccional de Heretic. Los pesos resultantes están en bf16 estándar (safetensors, sin configuración de cuantización), por lo que cargan directamente con `transformers` en GPUs Ampere o superiores. La relevancia de este modelo radica en ofrecer una alternativa sin censura para casos de uso donde los rechazos del modelo base son un obstáculo, manteniendo en gran medida las capacidades generales del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: atención lineal + full attention, torre de visión) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (extensible a 1M) |
| Tipos de cuantizacion | bf16 (repo oficial); GGUF de terceros (mradermacher) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (bf16), GGUF (versión de terceros) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B-FP8** es un modelo denso de 27B parámetros con una arquitectura híbrida de atención: 48 de las 64 capas usan atención lineal (más eficiente en memoria y cómputo para contextos largos) y las 16 restantes usan atención completa (full attention) para preservar la calidad en tareas que requieren atención global. Incluye una torre de visión (vision tower) que permite procesar imágenes, y un "MTP draft head" integrado para decodificación especulativa. El contexto nativo es de 262.144 tokens, extensible a 1M.

El proceso de abliteration aplicado por krthkyadtya consistió en: primero, dequantizar el checkpoint FP8 original a bf16; segundo, aplicar la herramienta **Heretic** (https://github.com/p-e-w/heretic), que realiza una ablación direccional automática de los rechazos. Se realizaron 120 ensayos (40 con arranque aleatorio) y se seleccionó el índice de Pareto 0 (menor número de rechazos). Los parámetros de ablación incluyen `direction_index` 38.73, y ajustes en `attn.o_proj` y `mlp.down_proj`. Las métricas reportadas en la model card indican que los rechazos pasaron de 30/30 en el original a 0/30 en la versión abliterated, con una divergencia KL de 0,0825 (muy por debajo del umbral de ~0,5 que indicaría daño real en capacidades).

## Capacidades

- **Generación de texto y razonamiento**: mantiene las capacidades del modelo base para generación de texto, razonamiento lógico y resolución de problemas, con modos de pensamiento (thinking) y no pensamiento (non-thinking) configurables.
- **Visión**: al preservar la torre de visión del modelo base, puede procesar imágenes y responder preguntas sobre ellas (image-text-to-text).
- **Código y matemáticas**: el modelo base está orientado a tareas de programación y razonamiento matemático; la abliteration no elimina estas capacidades, solo los rechazos.
- **Contexto largo**: soporta hasta 262K tokens de contexto nativo, lo que permite manejar documentos extensos, conversaciones multi-turno y tareas de agente de largo horizonte.
- **Tool calling / function calling**: el modelo base soporta llamada a herramientas; esta versión la hereda, aunque no se especifica explícitamente en la model card.
- **Capacidad multilingüe**: el modelo base es multilingüe, pero no se detallan los idiomas concretos en la información disponible.
- **Sin rechazos**: la característica distintiva es que no emite respuestas de rechazo ante solicitudes que el modelo original consideraría inapropiadas, lo que lo hace útil para investigación sobre alineación y generación de contenido sin restricciones.

## Casos de uso

- **Investigación académica sobre alineación y seguridad de IA**: el modelo permite estudiar cómo se comporta un LLM sin mecanismos de rechazo, comparando respuestas con el modelo original para analizar el impacto de la ablación direccional en la calidad y el sesgo.
- **Generación de ficción y contenido creativo sin restricciones**: escritores y creadores pueden usar el modelo para generar narrativas que aborden temas tabú o controvertidos sin que el modelo se niegue, manteniendo coherencia y estilo.
- **Análisis de contenido sensible en entornos controlados**: en investigación de ciencias sociales o periodismo, el modelo puede procesar y resumir textos que contengan temas delicados (violencia, discriminación, etc.) sin rechazos automáticos, facilitando el análisis.
- **Asistencia de programación en proyectos con requisitos no estándar**: desarrolladores que trabajan en código que involucra temas sensibles (por ejemplo, simulaciones de seguridad, análisis de malware) pueden obtener ayuda sin que el modelo se niegue a responder.
- **Desarrollo de agentes conversacionales para dominios especializados**: en entornos donde se requiere respuestas directas sin evasivas (por ejemplo, simulaciones de entrevistas, entrenamiento de personal en manejo de crisis), el modelo puede actuar sin rechazos.
- **Evaluación de robustez de sistemas de moderación**: equipos de seguridad pueden usar el modelo para generar entradas adversariales y probar la eficacia de sus propios filtros de contenido, ya que el modelo produce respuestas que los sistemas de moderación deben detectar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta versión abliterated. La model card solo reporta métricas de rechazo y divergencia KL:

| Metrica | Modelo original | Modelo abliterated |
| :--- | ---: | ---: |
| Rechazos (keywords) | 30/30 | 0/30 |
| Divergencia KL | 0 (por definicion) | 0,0825 |

El modelo base Qwen3.8-27B-FP8 tiene evaluaciones publicadas (por ejemplo, en MathVision), pero no se dispone de esos números en la información proporcionada. Se recomienda consultar la página del modelo base para datos de rendimiento en tareas estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bf16, el modelo ocupa aproximadamente 54,7 GB (27.356.728.560 parámetros × 2 bytes). Se necesitan al menos 60-70 GB de VRAM para inferencia con contexto moderado; con contexto largo (262K tokens) se requiere más memoria para los estados de atención.
- **GPU recomendadas**: A100 80GB, H100 80GB, A6000 48GB (con cuantización), RTX 4090 24GB (solo con cuantización GGUF de baja precisión, como Q4_K_M, que reduce el peso a ~15-16 GB).
- **En consumer GPU**: es posible ejecutarlo en RTX 4090 o similar usando versiones GGUF cuantizadas (por ejemplo, las publicadas por mradermacher), aunque con menor calidad y velocidad. En GPUs de 24 GB, se recomienda cuantización Q4 o Q5.
- **Opciones de despliegue**: `transformers` (carga directa con `AutoModelForImageTextToText`), vLLM (soporte nativo según recipes.vllm.ai), llama.cpp (para GGUF), Ollama (si se convierte a GGUF), TGI (Text Generation Inference).
- **Latencia y throughput**: no se dispone de datos medidos para esta versión. El modelo base, al usar atención lineal en 48/64 capas, tiene menor coste de atención que un modelo denso puro, lo que mejora el throughput en contextos largos. Con vLLM y bf16 en A100, se puede esperar un throughput de decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Refusals | Notas |
|---|---|---|---|---|---|
| **Qwen3.8-27B-heretic** (este) | 27,36B | 262K | Apache-2.0 | 0/30 | Abliterated, bf16 |
| **Qwen/Qwen3.8-27B-FP8** (base) | 27,36B | 262K | Apache-2.0 | 30/30 | Con rechazos, FP8 |
| **Llama-3.1-8B-Instruct-abliterated** (ejemplo) | 8B | 128K | Llama 3.1 Community | 0/30 | Abliterated, menor tamaño |

La comparación con el modelo base es directa: misma arquitectura y capacidades, pero con rechazos eliminados. Frente a otros modelos abliterated de menor tamaño (como Llama-3.1-8B), este ofrece mayor capacidad y contexto, pero requiere más recursos. No se dispone de datos de rendimiento comparativos en benchmarks estándar para esta versión.

## Limitaciones y advertencias

- **Contenido potencialmente dañino**: al eliminar los rechazos, el modelo puede generar contenido ilegal, violento, sexualmente explícito o discriminatorio. El autor advierte explícitamente: "Eres responsable de cómo lo usas".
- **Riesgo de alucinación**: como cualquier LLM, puede inventar información, especialmente en temas especializados. La abliteration no corrige este problema.
- **Degradación leve de capacidades**: la divergencia KL de 0,0825 indica un pequeño cambio respecto al original, que podría manifestarse en respuestas ligeramente menos coherentes o precisas en algunos dominios.
- **Idiomas no especificados**: no se documenta qué idiomas soporta correctamente; el modelo base es multilingüe, pero la abliteration podría afectar a idiomas minoritarios.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el contenido generado puede violar leyes locales (difamación, incitación al odio, etc.). La herramienta Heretic es AGPL-3.0, pero eso no afecta al modelo en sí.
- **Requisitos de hardware elevados**: en bf16, se necesitan GPUs de 80 GB; en consumer GPUs solo es viable con cuantización agresiva, lo que degrada la calidad.
- **Sin garantías de seguridad**: al no tener rechazos, el modelo puede ser explotado para generar malware, phishing o desinformación. No es adecuado para aplicaciones de producción sin un filtro de contenido externo.

## Enlaces

- [Modelo en HuggingFace: krthkyadtya/Qwen3.8-27B-heretic](https://huggingface.co/krthkyadtya/Qwen3.8-27B-heretic)
- [Modelo base: Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- [Herramienta Heretic (GitHub)](https://github.com/p-e-w/heretic)
- [Versión GGUF de terceros: mradermacher/Qwen-3.8-27B-Heretic-GGUF](https://huggingface.co/mradermacher/Qwen-3.8-27B-Heretic-GGUF)
- [Recetas vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Blog de AMD sobre ejecución local de Qwen3.8-27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Modelo en LM Studio](https://lmstudio.ai/models/qwen3.8)

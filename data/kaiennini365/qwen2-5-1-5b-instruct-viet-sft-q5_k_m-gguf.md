# Kaiennini365/Qwen2.5-1.5B-Instruct-Viet-SFT-Q5_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de tipo Q5_K_M del modelo `jaeyong2/Qwen2.5-1.5B-Instruct-Viet-SFT`, un ajuste fino (SFT) del conocido Qwen2.5-1.5B-Instruct de Alibaba, especializado en vietnamita e inglés. La conversión a GGUF la ha realizado el usuario Kaiennini365 mediante el espacio `GGUF-my-repo` de ggml.ai sobre llama.cpp, lo que permite ejecutar el modelo en CPU, GPU de consumo y entornos con poca memoria mediante `llama.cpp`, Ollama u otros motores compatibles con GGUF.

El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5, que incorpora mejoras en razonamiento, generación de código y soporte multilingüe respecto a Qwen2. La variante `Viet-SFT` indica un ajuste supervisado orientado a mejorar el rendimiento en vietnamita, aunque la model card del repositorio cuantizado no documenta el dataset ni el proceso de entrenamiento específico.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo ligero y bilingüe (vi/en) en hardware modesto gracias a la cuantización Q5_K_M, que reduce el peso a aproximadamente 1,1 GB en disco. No obstante, se trata de un repositorio con nula tracción (0 descargas, 0 likes), sin benchmarks publicados ni documentación técnica propia más allá de la plantilla estándar de `GGUF-my-repo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 2048`; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q5_K_M (cuantizacion de 5 bits con mezcla K, la unica incluida en este repo) |
| Idiomas soportados | Vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen2.5-1.5b-instruct-viet-sft-q5_k_m.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Sobre esta base, el autor `jaeyong2` aplicó un ajuste fino supervisado (SFT) orientado al vietnamita, del cual no se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales.

La contribución de este repositorio concreto (Kaiennini365) es exclusivamente la conversión a GGUF mediante llama.cpp y el espacio `GGUF-my-repo`, sin entrenamiento adicional. La cuantización Q5_K_M emplea cuantización de bloques con escalas de 5 bits y mezcla de tipos (algunos tensores en 6 bits) para preservar calidad en capas sensibles, lo que típicamente supone una pérdida de perplejidad mínima frente al modelo en FP16. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en vietnamita e inglés.
- Razonamiento básico y respuesta a instrucciones (modelo Instruct con plantilla de chat de Qwen2.5).
- Generación de código y resolución de problemas matemáticos sencillos, heredados del modelo base Qwen2.5.
- Soporte de tool calling / function calling: no confirmado explícitamente para este ajuste SFT, aunque el modelo base Qwen2.5-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la documentación disponible.
- Capacidades multilingües limitadas a vi y en según los tags del repositorio.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente conversacional en vietnamita para atención al cliente: el modelo puede gestionar diálogos multi-turno en vietnamita con un coste computacional muy bajo, adecuado para desplegar en servidores modestos o en el borde.
- Traducción y adaptación de contenido entre vietnamita e inglés: útil para localización de documentación, correos o interfaces, aprovechando el ajuste SFT específico en vietnamita.
- Prototipado rápido de aplicaciones de chat: gracias al formato GGUF y a su tamaño (~1,1 GB), se puede ejecutar con `llama.cpp` u Ollama en portátiles sin GPU dedicada para validar ideas antes de escalar a modelos mayores.
- Generación de código en entornos con recursos limitados: adecuado para autocompletado o asistencia básica en editores dentro de máquinas de desarrollo sin GPU.
- Filtrado y clasificación de texto bilingüe vi/en: tareas de etiquetado, resumen o extracción de información en pipelines de bajo coste.
- Educación y tutores automáticos en vietnamita: respuestas a preguntas frecuentes y explicaciones simples en un entorno offline o autoalojado, sin dependencia de APIs externas.
- Evaluación comparativa de cuantizaciones: como ejemplo práctico para estudiar la degradación de calidad entre FP16 y Q5_K_M en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones en vietnamita (como VMLU) para este ajuste SFT ni para su cuantización Q5_K_M. Tampoco se documentan métricas de latencia o throughput medidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con Q5_K_M (pesos ~1,1 GB más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; funciona bien en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque en estas últimas el modelo estará infrautilizado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 4 GB, RTX 3050, etc.) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `llama.cpp` (CLI y servidor), Ollama (importando el GGUF), llama-cpp-python, y potencialmente vLLM o TGI solo si se dispone de los pesos en safetensors (no incluidos en este repo).
- Latencia y throughput estimados: no disponibles; en CPU moderna se espera un rendimiento interactivo (decenas de tokens por segundo) dado el reducido tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kaiennini365/Qwen2.5-1.5B-Instruct-Viet-SFT-Q5_K_M-GGUF | ~1,5 B | No disponible (base: 32.768) | vi, en | Apache 2.0 | GGUF |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Multilingue (29+) | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,5 B | 32.768 tokens | Multilingue | Apache 2.0 | safetensors, GGUF |
| google/gemma-2-2b-it | ~2,6 B | 8.192 tokens | Multilingue | Gemma license | safetensors, GGUF |

El principal diferenciador de este repositorio es el ajuste específico en vietnamita, ausente en el Qwen2.5-1.5B-Instruct original. Frente a alternativas como Gemma-2-2b-it, este modelo es más pequeño y con licencia Apache 2.0 más permisiva, aunque carece de benchmarks que permitan comparar calidad real. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Repositorio sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de evidencia empírica sobre su calidad.
- La model card no documenta el dataset de SFT, hiperparámetros ni evaluación del ajuste en vietnamita; se desconoce si el ajuste mejora o degrada capacidades del modelo base.
- Riesgo de alucinación inherente a modelos de 1,5 B, especialmente en tareas de razonamiento complejo, matemáticas avanzadas o conocimiento factual actualizado.
- Contexto efectivo no confirmado para este ajuste; el ejemplo de la model card usa `-c 2048`, muy por debajo de los 32.768 del modelo base, lo que puede limitar casos de uso con documentos largos.
- Idiomas limitados a vi y en según los tags; el rendimiento en castellano no está garantizado ni evaluado.
- Sesgos: no documentados por el autor; se heredan los del modelo base Qwen2.5 y los del corpus de ajuste en vietnamita, no auditados.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un ajuste de terceros conviene verificar la cadena de licencias del modelo base `jaeyong2/Qwen2.5-1.5B-Instruct-Viet-SFT`.
- La cuantización Q5_K_M introduce una degradación de calidad respecto a FP16 no medida; para producción sensible se recomienda validar con datos propios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kaiennini365/Qwen2.5-1.5B-Instruct-Viet-SFT-Q5_K_M-GGUF
- Modelo base del ajuste: https://huggingface.co/jaeyong2/Qwen2.5-1.5B-Instruct-Viet-SFT
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp (repositorio): https://github.com/ggerganov/llama.cpp

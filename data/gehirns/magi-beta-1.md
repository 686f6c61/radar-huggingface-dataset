# GEHIRNS/magi-beta-1

## Resumen

magi-beta-1 es una compilación experimental de cuantización GGUF del modelo Qwen3.5-4B, publicada por el usuario GEHIRNS en Hugging Face. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una mezcla de tipos de cuantización estándar aplicada a los pesos originales de Qwen3.5-4B, con el objetivo de estudiar cómo se distribuyen los bits entre las distintas capas del transformer y qué tensores resultan más sensibles a la compresión.

La propuesta concreta de esta versión es almacenar las proyecciones key, value y output de las ocho capas de atención completa a Q6_K en lugar de Q4_K, manteniendo el resto de la mezcla de cuantizaciones. Según las mediciones del autor, ese incremento de precisión (0,030 GiB adicionales) no reporta una mejora medible en precisión, lo que refuerza la tesis de que la receta anterior (magi-1.0) ya protegía adecuadamente los tensores críticos. El modelo pesa 4.205.751.296 parámetros empaquetados en 1,83 GiB de archivo, con una media de 3,712 bits por peso.

Es relevante ahora porque documenta de forma reproducible una comparación entre estrategias de cuantización mixta sobre un modelo de 4B con atención híbrida, y porque el propio autor recomienda no usarlo en producción: la model card indica explícitamente que se utilice magi-1.0, más pequeño y con puntuación ligeramente superior. La licencia Apache 2.0 y la compatibilidad con llama.cpp y Ollama lo hacen accesible para experimentación en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (8 capas de atención completa y capas Gated DeltaNet, según el tag `gated-deltanet` del modelo base) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (protocolo de evaluación con contexto de 32K; el valor nativo del modelo base no se detalla en la información proporcionada) |
| Tipos de cuantización | Mezcla GGUF de precisión mixta; media de 3,712 bits por peso; proyecciones K/V/O de las 8 capas de atención completa en Q6_K, resto de tensores en tipos estándar GGUF (detalle completo no disponible) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (1,83 GiB de archivo; 1,817 GiB de datos de tensores) |

## Arquitectura y entrenamiento

magi-beta-1 no implica entrenamiento: es una conversión de pesos de Qwen3.5-4B a GGUF con una mezcla de tipos de cuantización. La arquitectura subyacente es la de Qwen3.5-4B, un transformer que combina capas de atención completa con capas Gated DeltaNet (atención lineal con estado recurrente), tal como indica el tag `gated-deltanet` de la model card. El modelo base tiene 4.205.751.296 parámetros y la versión cuantizada conserva únicamente la torre de texto: el proyector de visión de Qwen3.5-4B no está incluido.

La innovación técnica de esta publicación es el estudio de asignación de bits por tensor. El autor mide la sensibilidad de cada tensor y concentra precisión en los que considera críticos. En magi-beta-1 se suben a Q6_K las proyecciones key, value y output de las ocho capas de atención completa, que son las más sensibles según sus mediciones. El resultado es una media de 3,712 bits por peso y un archivo de 1,83 GiB. La comparación con magi-1.0 (que mantiene esas proyecciones en Q4_K) arroja una diferencia de −0,65 puntos a favor de magi-1.0, con un intervalo de confianza pareado del 95 % de −1,72 a +0,44, es decir, sin significación estadística. El paper asociado, *Where the Bits Go* (Sun, 2026), documenta la metodología.

## Capacidades

- Generación de texto conversacional y de un solo turno, heredada de Qwen3.5-4B.
- Razonamiento con modo "thinking": el protocolo de evaluación usa thinking activado con un presupuesto de 4.096 tokens.
- Razonamiento multi-paso y tareas de varios suites de evaluación (12 suites, 2.313 tareas en el protocolo del autor).
- Capacidades multilingües limitadas al inglés según el campo `language` de la model card, aunque el modelo base Qwen3.5 podría tener un perfil más amplio no declarado aquí.
- Inferencia local sin conexión mediante llama.cpp y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No incluye capacidades de visión: el proyector visual del modelo base ha sido eliminado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de estrategias de cuantización: sirve como referencia reproducible para comparar el impacto de subir tensores de atención a Q6_K frente a Q4_K, gracias a que el autor publica la receta y los resultados del paper.
- Despliegue en hardware muy limitado: con 1,83 GiB de archivo y 3,712 bits por peso, cabe en GPUs de gama baja y en sistemas con poca VRAM, útil para prototipos de chat en local con llama.cpp u Ollama.
- Investigación sobre atención híbrida: al conservar la arquitectura Gated DeltaNet de Qwen3.5-4B en formato GGUF, permite estudiar el comportamiento de la atención lineal cuantizada en entornos de inferencia de consumo.
- Pruebas de regresión de pipelines de cuantización: integrable en CI para verificar que una nueva mezcla de tipos GGUF no degrada la perplejidad ni las puntuaciones en suites pequeñas.
- Generación de texto en inglés para tareas conversacionales sin requisitos de visión, aprovechando el contexto de 32K en el protocolo de evaluación.
- Docencia y divulgación: ejemplo práctico de cómo se distribuyen los bits entre capas y de por qué no siempre conviene invertir precisión en los tensores aparentemente más sensibles.

## Benchmarks y rendimiento

El autor publica resultados con un protocolo común: una RTX 5070 de 12 GB, 12 suites, 2.313 tareas, thinking activado con presupuesto de 4.096 tokens, decodificación greedy y contexto de 32K. Los números pequeños en las columnas "Ours" son relativos a BF16. La tabla completa de la model card está truncada en la información disponible, por lo que solo se pueden reproducir los datos de tamaño y la comparación global citada en el texto.

| Benchmark | BF16 (8,98 GiB) | Q4_K_M (3,78 GiB) | Q2_K (3,15 GiB) | magi-1.0 (3,02 GiB) | magi-beta-1 (1,83 GiB) |
|---|---|---|---|---|---|
| Puntuación agregada frente a magi-1.0 | no disponible | no disponible | no disponible | referencia | −0,65 puntos (IC 95 %: −1,72 a +0,44) |
| Bits por peso | 16 | no disponible | no disponible | no disponible | 3,712 |
| Tamaño de tensor | 8,98 GiB | 3,78 GiB | 3,15 GiB | 3,02 GiB | 1,817 GiB |

No se han publicado en la información disponible los resultados desglosados por suite (MMLU, HumanEval, GSM8K u otras) para magi-beta-1.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,83 GiB de pesos más overhead de contexto KV; con 32K de contexto el consumo adicional depende de la implementación, pero el modelo cabe holgadamente en GPUs de 4 GB o más.
- GPU recomendadas: RTX 5070 (12 GB) es la usada por el autor para los benchmarks; cualquier GPU consumer con 4-8 GB de VRAM es suficiente para inferencia a contexto moderado.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y similares; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp y Ollama de forma nativa; compatible con endpoints según los tags. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| magi-beta-1 | 4.205.751.296 | 32K (evaluación) | GGUF mixto, 3,712 bpw | Apache 2.0 | Experimental; el autor recomienda magi-1.0 |
| magi-1.0 | 4.205.751.296 (mismo base) | 32K (evaluación) | GGUF mixto, 3,02 GiB | Apache 2.0 | Recomendado por el autor; +0,65 puntos frente a beta-1 |
| Qwen3.5-4B (BF16) | 4.205.751.296 | no disponible | safetensors BF16, 8,98 GiB | Apache 2.0 | Modelo base; incluye proyector de visión |
| Q4_K_M de Qwen3.5-4B | 4.205.751.296 | no disponible | GGUF, 3,78 GiB | Apache 2.0 | Cuantización estándar de referencia |
| Q2_K de Qwen3.5-4B | 4.205.751.296 | no disponible | GGUF, 3,15 GiB | Apache 2.0 | Cuantización agresiva de referencia |

## Limitaciones y advertencias

- El autor marca explícitamente el modelo como "not recommended" y recomienda usar magi-1.0, que es más pequeño y puntúa ligeramente mejor.
- Solo soporta inglés según el campo `language` de la model card; no se declaran otros idiomas.
- No incluye visión: el proyector visual del modelo base ha sido eliminado, por lo que no puede procesar imágenes.
- Al ser una cuantización de 3,712 bits por peso, es esperable cierta degradación frente a BF16 en tareas sensibles a la precisión numérica, aunque el autor no publica el desglose completo por suite.
- Riesgo de alucinación inherente a un modelo de 4B; no hay datos específicos de evaluación de factualidad en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero al ser una build experimental no hay garantías de soporte ni mantenimiento.
- El contexto nativo del modelo base no se detalla; los 32K corresponden al protocolo de evaluación, no necesariamente al máximo soportado en producción.
- No se confirma soporte de tool calling ni de agentes multi-paso en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GEHIRNS/magi-beta-1
- Modelo recomendado (magi-1.0): https://huggingface.co/GEHIRNS/magi-1.0
- Modelo base (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Paper *Where the Bits Go*: https://doi.org/10.5281/zenodo.23630199
- Repositorio de receta y datos: https://github.com/GEHIRNS/magi
- Sitio web del autor: https://gehirns.pages.dev/
- Colección MAGI experimental: https://huggingface.co/collections/GEHIRNS/magi-experimental-6ad6a94511ffd4dabaa7b24a
- Perfil del autor en Hugging Face: https://huggingface.co/GEHIRNS

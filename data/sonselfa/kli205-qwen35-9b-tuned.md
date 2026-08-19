# sonselfa/kli205-qwen35-9b-tuned

## Resumen

El modelo `sonselfa/kli205-qwen35-9b-tuned` es un ajuste fino mediante LoRA fusionado sobre el modelo base `Qwen/Qwen3.5-9B`, desarrollado por el usuario sonselfa. Su propósito declarado es la puntuación automática de ensayos argumentativos en coreano (한국어 논증적 글 채점). Se trata de un checkpoint público inicial, orientado a tareas de evaluación de escritura académica o educativa en lengua coreana.

El modelo conserva la arquitectura del base Qwen3.5-9B, un transformer decoder-only de aproximadamente 8.95 mil millones de parámetros, exportado en BF16 y empaquetado como safetensors fusionados, listo para cargar con Transformers o vLLM. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Su relevancia radica en ofrecer una solución específica para un nicho lingüístico (coreano) sobre un modelo generalista, con un coste de adaptación bajo gracias al uso de LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8.95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda del base Qwen3.5-9B, no especificado) |
| Tipos de cuantizacion | no disponible (exportado en BF16; cuantizaciones posteriores posibles) |
| Idiomas soportados | Coreano (fine-tuning especifico); el base Qwen3.5-9B es multilingue, pero no se detallan idiomas adicionales |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (merged, BF16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` y se le ha fusionado un adaptador LoRA de rango 32 y alpha 64, entrenado para la tarea de puntuación de ensayos argumentativos en coreano. El resultado es un checkpoint único con los pesos del adaptador integrados en el modelo base, exportado en BF16. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni el método de alineación (RLHF, DPO, etc.). La model card indica que el repositorio solo contiene los artefactos del modelo, sin incluir datos de entrenamiento, evaluaciones, RAG ni estados de optimizador.

## Capacidades

- Puntuación automática de ensayos argumentativos en coreano: tarea principal para la que fue ajustado.
- Generación de texto en coreano: hereda la capacidad generativa del base Qwen3.5-9B, aunque el ajuste puede sesgar el comportamiento hacia la evaluación de escritura.
- Conversación: el tag `conversational` sugiere que puede mantener diálogos, aunque no hay evidencia de un entrenamiento específico en este aspecto.
- Compatibilidad con pipelines estándar: carga directa con Transformers y vLLM, lo que facilita su integración en entornos de producción.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Evaluación automatizada de ensayos en entornos educativos coreanos: el modelo puede asignar puntuaciones a textos argumentativos de estudiantes, reduciendo la carga de corrección manual. Se usaría con un pipeline de texto que reciba el ensayo y devuelva una puntuación o criterio de evaluación.
- Asistencia a profesores de coreano como lengua extranjera: permite valorar la calidad argumentativa de redacciones de alumnos, ofreciendo una retroalimentación objetiva y consistente.
- Sistemas de tutoría inteligente: integrado en plataformas de aprendizaje, puede evaluar respuestas escritas de los estudiantes y proporcionar sugerencias de mejora.
- Filtrado de contenido en foros o plataformas de publicación: puede clasificar la calidad argumentativa de textos generados por usuarios, útil para moderación o ranking de contenido.
- Investigación en procesamiento del lenguaje natural coreano: sirve como punto de partida para experimentos sobre evaluación automática de escritura, dado que es un modelo abierto y reproducible.
- Generación de informes de evaluación: combinado con un generador de texto, puede producir comentarios detallados sobre las fortalezas y debilidades de un ensayo, basándose en la puntuación obtenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.95B parámetros en BF16, se requieren aproximadamente 18 GB de VRAM para carga completa. Con cuantización de 8 bits, ~9 GB; con 4 bits, ~5 GB.
- GPU recomendadas: para BF16 completo, una NVIDIA A100 (40 GB), RTX 4090 (24 GB) o similar. Para cuantización 4-bit, una RTX 3060 (12 GB) o superior puede ser suficiente.
- Compatibilidad con GPUs de consumo: sí, con cuantización (por ejemplo, mediante llama.cpp o GPTQ) es posible ejecutarlo en GPUs de 8-12 GB.
- Opciones de despliegue: Transformers (carga directa), vLLM (inferencia optimizada), llama.cpp (cuantización GGUF), Ollama (si se convierte a GGUF), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles; dependen del hardware y de la optimización. En una A100, se espera un throughput de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a aspectos estructurales. Alternativas en el rango de 7-9B parámetros:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| kli205-qwen35-9b-tuned | 8.95B | no disponible | Apache-2.0 | Puntuacion de ensayos coreanos |
| Qwen2.5-7B | 7.6B | 128K (tipico) | Apache-2.0 | Generalista multilingue |
| Llama-3.1-8B | 8.0B | 128K | Llama 3.1 Community | Generalista multilingue |
| Mistral-7B | 7.3B | 32K | Apache-2.0 | Generalista multilingue |

La comparación directa de rendimiento no es posible sin benchmarks publicados. El valor diferencial de este modelo reside en su adaptación específica al coreano, no en su capacidad general.

## Limitaciones y advertencias

- Especialización limitada: el ajuste está orientado exclusivamente a la puntuación de ensayos argumentativos coreanos; su rendimiento en otras tareas puede degradarse respecto al base.
- Datos de entrenamiento no publicados: no se puede auditar la calidad o el sesgo del dataset utilizado, lo que dificulta evaluar su robustez.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir puntuaciones o justificaciones inconsistentes si el texto de entrada está fuera de distribución.
- Sesgos potenciales: el modelo puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en la evaluación de escritura (por ejemplo, preferencias estilísticas o culturales).
- Longitud de contexto no especificada: se desconoce la ventana de contexto efectiva, lo que puede limitar su uso con ensayos largos.
- Sin validación de contrato de salida: la model card advierte que la validación del contrato de salida y la calibración de puntuaciones pueden requerir ajustes adicionales antes de un uso competitivo.
- Uso comercial permitido: la licencia Apache-2.0 no impone restricciones, pero el autor no ofrece garantías sobre la precisión o idoneidad para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sonselfa/kli205-qwen35-9b-tuned
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

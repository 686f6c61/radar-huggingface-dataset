# ankushthakurr09/MimansM1_v1

## Resumen

Mimans M1 es un modelo de lenguaje de tipo decoder-only transformer, desarrollado por ankushthakurr09, entrenado desde cero sobre código, matemáticas y texto técnico. Con aproximadamente 514 millones de parámetros según su autor (577 millones según los pesos reales en safetensors), está diseñado para tareas de generación de texto y código, con una ventana de contexto de 4.096 tokens (ampliable a 8.192). Su principal innovación radica en el uso de kernels personalizados TileLang para GPUs Blackwell y una optimización híbrida Muon + AdamW, lo que lo convierte en un experimento técnico interesante para la comunidad open source.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors, y está orientado a un público que quiera explorar arquitecturas eficientes en hardware moderno. Sin embargo, su entrenamiento es extremadamente limitado (solo 24,6 millones de tokens, con una pérdida final de 10,6), por lo que su rendimiento práctico es muy reducido y no debe considerarse para uso en producción. Aun así, su código y configuración pueden servir como referencia para desarrolladores que investiguen técnicas de entrenamiento con recursos escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (10:2), SwiGLU FFN, AttnRes Skip Gating, RMSNorm |
| Parametros totales | 577.260.032 (según safetensors; la model card indica 514.345.526) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (máximo 8.192, RoPE theta = 500.000) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés y código (etiquetas: en, code) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Mimans M1 es un transformer causal de tipo decoder-only con atención de consultas agrupadas (GQA) en proporción 10:2, feed-forward con SwiGLU, gating de salto en la atención (AttnRes Skip Gating) y normalización RMSNorm. El vocabulario es de 49.152 tokens mediante BPE a nivel de byte, con soporte para fill-in-the-middle (FIM). El modelo fue preentrenado desde cero sobre un corpus de código, matemáticas y texto técnico, utilizando kernels TileLang personalizados para GPUs Blackwell (sm_120) y una optimización híbrida Muon + AdamW. El entrenamiento se realizó en una NVIDIA GeForce RTX 5090, con un total de 24,6 millones de tokens procesados en 47 pasos globales, alcanzando una pérdida de 10,6011. No se mencionan técnicas de ajuste fino posterior como RLHF o DPO.

## Capacidades

- Generación de texto y código en inglés, con soporte básico para autocompletado y generación de fragmentos técnicos.
- Soporte de fill-in-the-middle (FIM) gracias al vocabulario BPE con tokens especiales.
- Razonamiento matemático elemental, limitado por el escaso volumen de entrenamiento.
- Capacidad multilingüe restringida al inglés y lenguajes de programación.
- No se documenta soporte para tool calling, agentes, visión, audio u otras modalidades.
- No se indica modo de pensamiento extendido (thinking mode).

## Casos de uso

- Autocompletado de código en entornos de desarrollo: el modelo puede sugerir continuaciones de funciones o bloques de código, aunque su precisión será baja debido al entrenamiento limitado. Adecuado como prototipo para probar la integración de modelos pequeños en editores.
- Generación de documentación técnica básica: puede producir comentarios o descripciones cortas a partir de fragmentos de código, útil para tareas de anotación automática en proyectos de investigación.
- Experimentación académica sobre entrenamiento eficiente: sirve como banco de pruebas para estudiar el impacto de kernels personalizados (TileLang) y optimizadores híbridos en GPUs Blackwell, sin necesidad de grandes recursos.
- Educación en generación de lenguaje natural: permite a estudiantes analizar el comportamiento de un transformer pequeño y comparar resultados con modelos más grandes.
- Generación de ejemplos sintéticos de código para aumentar datasets: aunque su calidad es limitada, puede producir variaciones de código simple que luego se filtran manualmente.
- Pruebas de inferencia en hardware de gama baja: al ser un modelo de ~577M parámetros, puede ejecutarse en GPUs consumer con poca VRAM, facilitando pruebas de despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento (10,6011), que indica un ajuste deficiente al corpus. No hay comparaciones con otros modelos ni evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB (577M parámetros × 2 bytes) más overhead de activaciones y KV cache, por lo que cabe en cualquier GPU con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo RTX 3060, RTX 4060, RTX 5090, A100, H100. El entrenamiento se realizó en una RTX 5090 (Blackwell sm_120), pero la inferencia no requiere características especiales.
- Modelo apto para GPUs consumer de gama media y baja.
- Opciones de despliegue: transformers (carga directa desde HuggingFace), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI. No se proporcionan configuraciones específicas de cuantización.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño se espera una generación rápida en GPUs modernas.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer comparaciones objetivas.

## Limitaciones y advertencias

- Entrenamiento extremadamente limitado: solo 24,6 millones de tokens, lo que provoca una alta tasa de alucinaciones, incoherencias y errores gramaticales.
- Pérdida final alta (10,6), indicativa de un modelo subentrenado que no ha convergido.
- Sin ajuste fino ni alineación: no se aplicaron técnicas de RLHF o DPO, por lo que el modelo puede generar contenido sesgado o inapropiado.
- Idioma limitado a inglés y código; no soporta otros idiomas naturales.
- Contexto máximo de 8.192 tokens, aunque el entrenamiento se realizó con 4.096, por lo que la extrapolación a longitudes mayores puede degradar la calidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su baja calidad.
- No se garantiza soporte para tool calling, agentes u otras funcionalidades avanzadas.
- Riesgo de sesgos derivados del corpus de entrenamiento (código y texto técnico en inglés), que puede reflejar estereotipos presentes en esos datos.

## Enlaces

- HuggingFace: https://huggingface.co/ankushthakurr09/MimansM1_v1

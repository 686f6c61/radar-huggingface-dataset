# jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-fra_Latn

## Resumen

El modelo `datamix-0.7B-propella-edu-high-mod-100bt-fra_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el autor jsaizant. Se trata de un modelo monolingüe en francés cuyo corpus de entrenamiento consiste en 100 mil millones de tokens extraídos de HPLT 4, filtrados mediante el clasificador Propella-1 con etiqueta "Educational" en las categorías "Moderate" o "High".

El modelo no es un lanzamiento de producción ni un modelo instructivo: es un artefacto de investigación centrado en el estudio del efecto del filtrado educativo de datos sobre el entrenamiento de modelos pequeños. Su interés radica en la trazabilidad del pipeline de datos (HPLT 4 + Propella-1) y en servir como referencia para experimentos de ablación sobre calidad de corpus en francés.

La información pública disponible es mínima: la model card se limita a una frase descriptiva, sin detalles sobre arquitectura, tokenizador, hiperparámetros ni resultados de evaluación. El repositorio ocupa 13,4 GB, un tamaño desproporcionado para 0,7B parámetros, lo que sugiere que contiene pesos en precisión alta y posiblemente checkpoints intermedios u optimizer states.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, inferido del tamaño y del pipeline, sin confirmar) |
| Parametros totales | 0,7B (aproximadamente 700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá del número de parámetros (0,7B). Por convención en modelos de este tamaño y por el formato de pesos (safetensors con tag de texto generativo), se presume una arquitectura transformer decoder-only, pero no hay confirmación en la model card.

El dato técnico relevante es el pipeline de datos: 100 mil millones de tokens procedentes de HPLT 4 en francés, filtrados con el clasificador Propella-1 usando la etiqueta "Educational" restringida a los niveles "Moderate" y "High". No se especifican el número de épocas, la mezcla de datos, la presencia de RLHF/DPO, ni la composición exacta del corpus más allá de la fuente y el filtro. Tampoco se documentan innovaciones arquitectónicas ni técnicas de entrenamiento.

## Capacidades

- Generación de texto en francés como capacidad base, derivada del entrenamiento sobre corpus francés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al francés según la metadata del modelo.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Al ser un modelo base entrenado desde cero y sin ajuste instructivo documentado, no debe asumirse comportamiento de asistente conversacional.

## Casos de uso

- Investigación sobre filtrado de datos: servir como punto de comparación en experimentos que midan el impacto del filtrado educativo (Propella-1) frente a corpus sin filtrar en modelos de 0,7B.
- Reproducibilidad de pipelines de datos: usar el modelo como referencia para validar la implementación de HPLT 4 y Propella-1 en flujos de curación de corpus en francés.
- Generación de texto en francés en entornos con recursos limitados: al ser un modelo de 0,7B, puede ejecutarse en GPU de consumo, útil para tareas de completado o generación de borradores donde no se requiera alta calidad.
- Base para fine-tuning posterior: punto de partida para ajuste supervisado en dominios concretos en francés, dado que la licencia Apache 2.0 permite uso comercial y modificación.
- Experimentos de escalado de datos: estudiar la relación entre 100B tokens y un modelo de 0,7B, comparando con recetas de entrenamiento publicadas (por ejemplo, Chinchilla).
- Evaluación de sesgos y calidad de corpus educativos: analizar qué tipo de contenido produce un modelo entrenado exclusivamente con documentos clasificados como educativos, útil en estudios de alineación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en fp16/bf16 (0,7B × 2 bytes) y alrededor de 0,7 GB en cuantización de 8 bits; en fp32 serían unos 2,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles en principio, siempre que exista conversión a GGUF o que la arquitectura sea estándar; no se documenta ninguna conversión publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| datamix-0.7B-propella-edu-high-mod-100bt-fra_Latn | 0,7B | no disponible | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 0,5B | 32 768 | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 0,36B | 8192 | Apache 2.0 | Hugging Face |

La comparación es orientativa: los modelos alternativos tienen documentación pública extensa, benchmarks y versiones instructivas, mientras que el modelo de jsaizant carece de evaluación publicada. La diferencia de idioma también es relevante: los alternativos son multilingües, mientras que este se limita al francés.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debe asumirse un rendimiento comparable a modelos de tamaño similar con recetas documentadas.
- Modelo base sin ajuste instructivo documentado: no está diseñado para seguir instrucciones ni para conversación directa.
- Sesgos potenciales derivados del filtrado educativo: el corpus restringido a documentos "Educational" puede sobrerrepresentar ciertos registros y estilos, y desequilibrar el modelo hacia texto formal o académico.
- Riesgo de alucinación: inherente a los modelos de lenguaje, sin mitigaciones documentadas (no se menciona RLHF, DPO ni filtros de salida).
- Cobertura lingüística limitada al francés; no se garantiza comportamiento en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el usuario.
- Tamaño del repositorio (13,4 GB) desproporcionado para 0,7B parámetros: conviene revisar el contenido antes de descargarlo, ya que puede incluir checkpoints u optimizer states no documentados.
- Sin pipeline declarado en Hugging Face: la integración con librerías como `transformers` no está verificada.

## Enlaces

- Hugging Face: https://huggingface.co/jsaizant/datamix-0.7B-propella-edu-high-mod-100bt-fra_Latn
- HPLT (High Performance Language Technologies): https://hplt-project.org/
- Paper de HPLT 4: no disponible en la información proporcionada
- Propella-1: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada

# openeurollm/datamix-0.7B-bsc-edu-gt2.0-100bt-fra_Latn

## Resumen

El modelo `datamix-0.7B-bsc-edu-gt2.0-100bt-fra_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el proyecto OpenEuroLLM. Se ha entrenado sobre 100 mil millones de tokens en francés extraídos de HPLT 4, un corpus multilingüe de gran escala, aplicando un filtrado por calidad mediante la puntuación educativa BSC-EDU, conservando únicamente los documentos con puntuación superior a 2,0. El resultado es un modelo monolingüe en francés orientado a experimentación sobre calidad de datos y entrenamiento de modelos pequeños.

El interés de este modelo reside en su enfoque metodológico más que en su rendimiento final: forma parte de una familia de modelos de ablación (datamix) que el proyecto OpenEuroLLM publica para estudiar el impacto del filtrado de datos en el entrenamiento de LLM. La nomenclatura del identificador codifica explícitamente el tamaño (0,7B), el filtro aplicado (bsc-edu-gt2.0), el volumen de tokens (100bt) y el idioma (fra_Latn), lo que facilita comparaciones controladas entre variantes.

Se distribuye con licencia Apache 2.0, en formato safetensors y con un tamaño de repositorio de 13,4 GB, lo que sugiere pesos en precisión alta (probablemente bf16 o fp32). No se proporcionan datos sobre arquitectura interna, contexto máximo ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 0,7B |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se especifica la arquitectura interna del modelo (transformer, MoE, SSM o híbrida) en la información proporcionada. Por el tamaño y el contexto del proyecto, se trata presumiblemente de un transformer decoder-only, pero este dato no está confirmado en la model card.

Los datos de entrenamiento sí están documentados: 100 mil millones de tokens en francés procedentes de HPLT 4, filtrados con la puntuación BSC-EDU y un umbral de corte de 2,0. No se indica si hubo fases de instrucción, RLHF o DPO; el modelo parece ser un modelo base preentrenado únicamente. Tampoco se detalla la composición exacta del dataset tras el filtrado ni el número de pasos de entrenamiento.

## Capacidades

- Generación de texto en francés como capacidad principal derivada del preentrenamiento monolingüe.
- Modelo base sin ajuste por instrucciones: no se garantiza seguimiento de instrucciones ni formato conversacional.
- Capacidad de continuación de texto y modelado de lenguaje.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al francés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre calidad de datos: el modelo sirve como punto de comparación en experimentos de ablación para medir el efecto del filtrado BSC-EDU sobre el rendimiento final en francés.
- Evaluación de corpus HPLT 4: permite analizar qué tipo de documentos superan el umbral de puntuación 2,0 y cómo afecta al modelado del lenguaje.
- Fine-tuning monolingüe en francés: al ser un modelo base de 0,7B con licencia Apache 2.0, es adecuado como punto de partida para ajuste supervisado en tareas concretas del idioma.
- Experimentación académica con modelos pequeños: su tamaño reducido facilita entrenamientos y evaluaciones repetibles en entornos con recursos limitados.
- Generación de texto en francés para prototipos: continuación de texto y tareas de completado en pipelines de investigación.
- Reproducibilidad de estudios de escalado: forma parte de una familia de variantes que permite aislar el efecto del volumen de tokens y del filtro de calidad.
- Base para destilación o comparación con modelos multilingües del mismo proyecto OpenEuroLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, alrededor de 1,4 GB; en fp32, unos 2,8 GB. El repositorio ocupa 13,4 GB, lo que probablemente incluye checkpoints adicionales o pesos en mayor precisión.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB), RTX 4060 o RTX 4090 pueden alojar el modelo con holgura. En entornos de servidor, A100 o H100 no son necesarias para inferencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles en principio con safetensors, aunque no se confirma en la model card que se hayan publicado pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| datamix-0.7B-bsc-edu-gt2.0-100bt-fra_Latn | 0,7B | no disponible | fr | Apache 2.0 | Modelo de ablación sobre filtrado de datos |
| Otras variantes datamix de OpenEuroLLM | 0,7B (presumible) | no disponible | según variante | Apache 2.0 | Mismo pipeline con distintos filtros o volúmenes |
| Modelos base pequeños multilingües (p. ej. familia Qwen o Gemma de tamaño similar) | ~0,5-1B | no disponible | multilingüe | variable | No comparables directamente por idioma y metodología |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse directamente en producción como asistente conversacional.
- Entrenado exclusivamente en francés: el rendimiento en otros idiomas será deficiente o nulo.
- Riesgo de alucinación inherente a los modelos de lenguaje preentrenados, agravado por el tamaño reducido.
- Posibles sesgos presentes en HPLT 4 que el filtrado BSC-EDU no elimina necesariamente.
- No se documentan la longitud de contexto ni los detalles de tokenizador, lo que dificulta planificar su integración.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y sesgo exige validación propia antes de desplegarlo.
- El identificador sugiere que se trata de un artefacto de investigación; su mantenimiento y soporte no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-bsc-edu-gt2.0-100bt-fra_Latn
- Proyecto OpenEuroLLM: no disponible en la información proporcionada
- Paper o blog del filtrado BSC-EDU: no disponible en la información proporcionada
- Corpus HPLT 4: no disponible en la información proporcionada

# nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2

## Resumen

El modelo `nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2` es una variante modificada del modelo base Qwen3.8-27B, desarrollada por el usuario nerkyor. Se trata de un modelo denso orientado a razonamiento eficiente, entrenado mediante un pipeline de SFT (supervised fine-tuning) seguido de SimPO, una técnica de optimización de preferencias similar a DPO. El modelo incorpora además técnicas de decodificación especulativa (DFlash2 y MTP) y está disponible en múltiples formatos de cuantización, incluidos GGUF y NVFP4.

El modelo está diseñado para tareas de razonamiento complejo, generación de código y uso en agentes. Según los archivos safetensors del repositorio, el modelo tiene 1.924.404.480 parámetros, aunque el nombre sugiere una escala de 27B; esta discrepancia puede deberse a una poda o destilación, o a que el dato corresponde a un subconjunto de pesos. El repositorio incluye múltiples variantes de cuantización y ocupa 314,4 GB, lo que lo hace relevante para evaluar el impacto de la cuantización en el rendimiento de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.8-27B |
| Parametros totales | 1.924.404.480 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q8_0, Q6_K, Q5-LynnStyle, Q4-LynnStyle, Q3-LynnStyle, Q2-LynnStyle), NVFP4 (W4A4, W4A4+W8A8, W4A16), bf16, fp8 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, NVFP4 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura densa del Qwen3.8-27B, un modelo de lenguaje de la familia Qwen que, en su versión oficial, es un modelo vision-language nativo capaz de entender imágenes y vídeos. Sin embargo, esta variante de nerkyor se centra en la generación de texto, tal como indican los tags del repositorio (`text-generation`), y no se especifica si conserva las capacidades de visión del modelo base.

El entrenamiento combina SFT con SimPO, un método de optimización de preferencias que ajusta el modelo para alinearse mejor con las respuestas deseadas sin necesidad de un modelo de recompensa separado. Además, el modelo incorpora DFlash2, una técnica de decodificación especulativa que acelera la inferencia, y en la variante NVFP4 se incluye MTP (Multi-Token Prediction), que permite predecir varios tokens a la vez. Los datos de entrenamiento, la composición del dataset y los detalles sobre el proceso de alineación no se han publicado.

## Capacidades

- Razonamiento complejo: alcanza puntuaciones de 82-87% en GPQA, un conjunto de preguntas de nivel de posgrado en ciencias, lo que indica capacidad para resolver problemas científicos y técnicos avanzados.
- Generación de código: obtiene resultados de 74-78% en LiveCodeBench, con buen rendimiento en tareas de programación de dificultad media y alta.
- Uso en agentes: compatible con frameworks de despliegue como SGLang y vLLM, y con soporte para razonamiento multi-paso, lo que permite su integración en sistemas de agentes autónomos.
- Conversación multilingüe: entrenado en inglés y chino, puede mantener diálogos en ambos idiomas.
- Modo de pensamiento (thinking mode): el modelo está diseñado para razonar de forma eficiente, con control sobre el gasto de tokens de razonamiento.
- Decodificación especulativa: mediante DFlash2 y MTP, la inferencia puede acelerarse sin pérdida significativa de calidad, como se refleja en las pruebas con MTP en variantes NVFP4.

## Casos de uso

- Razonamiento científico: el modelo puede utilizarse para responder preguntas de nivel de posgrado en física, química o biología, gracias a su rendimiento en GPQA. Es adecuado para herramientas de apoyo a la investigación o para la generación de hipótesis en entornos académicos.
- Asistente de programación: con resultados de 74-78% en LiveCodeBench, puede integrarse en IDEs o pipelines de CI/CD para revisión de código, generación de tests o depuración automática. Soporta lenguajes de programación habituales y puede mantener contextos largos de código.
- Agentes autónomos: su capacidad de razonamiento multi-paso y su compatibilidad con SGLang y vLLM lo hacen apto para orquestar flujos de trabajo complejos, como la planificación de tareas, la llamada a APIs o la automatización de procesos empresariales.
- Atención al cliente bilingüe: al estar entrenado en inglés y chino, puede gestionar conversaciones de soporte técnico en ambos idiomas, resolviendo consultas con contexto largo y manteniendo coherencia en diálogos multi-turno.
- Análisis de documentos extensos: aunque la ventana de contexto no se ha publicado, las pruebas utilizan un límite de salida de 32.768 tokens, lo que sugiere que puede generar respuestas muy largas. Es útil para resumir informes técnicos, contratos o documentación normativa extensa.
- Evaluación de cuantizaciones: el repositorio incluye resultados detallados de benchmarks para seis niveles de cuantización GGUF y tres variantes NVFP4, lo que convierte a este modelo en una referencia para estudiar el efecto de la cuantización en el razonamiento y la generación de código.

## Benchmarks y rendimiento

Los siguientes resultados se extraen de la model card del autor, correspondientes a pruebas formales con conjuntos congelados. Las puntuaciones se expresan como porcentaje de aciertos.

| Variante | GPQA (198 preguntas) | MMLU (500 preguntas) | LCB (100 preguntas) |
|---|---:|---:|---:|
| GGUF Q8_0 | 82,83% | 89,40% | 74,00% |
| GGUF Q6_K | 86,36% | 88,00% | 78,00% |
| GGUF Q5-LynnStyle | 82,83% | 87,60% | 75,00% |
| GGUF Q4-LynnStyle | 83,84% | 88,60% | 74,00% |
| GGUF Q3-LynnStyle | 86,87% | 87,00% | 78,00% |
| GGUF Q2-LynnStyle | 84,34% | 83,20% | 75,00% |
| NVFP4 W4A4 Fast | 79,80% | 89,40% | 74,00% |
| NVFP4 W4A4+W8A8 Mixed | 84,85% | 91,60% | 75,00% |
| NVFP4 W4A16 | 81,31% | 91,40% | 74,00% |

Los resultados de NVFP4 se obtuvieron con una RTX PRO 6000 96GB, SGLang, MTP oficial en BF16, un límite de salida de 32.768 tokens y un timeout de 1.800 segundos por petición. La variante W4A4+W8A8 Mixed obtiene las mejores puntuaciones en MMLU y GPQA, con un menor gasto medio de tokens de razonamiento en comparación con W4A4 Fast.

## Requisitos de hardware

- Las pruebas NVFP4 se realizaron en una GPU RTX PRO 6000 96GB, con SGLang y MTP.
- Para las variantes GGUF, se recomienda usar llama.cpp u Ollama. No se han publicado requisitos exactos de VRAM, pero las cuantizaciones Q2-Q6 permiten ejecutar el modelo en GPUs de consumo con suficiente memoria (por ejemplo, 24-48GB), aunque no hay datos confirmados.
- Opciones de despliegue: SGLang, vLLM, llama.cpp, Ollama (si se convierte a GGUF).
- No se dispone de datos de latencia o throughput para las variantes GGUF. En las pruebas NVFP4, el tiempo de respuesta está limitado por el timeout de 1.800 segundos, pero no se publican métricas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | No disponible | No disponible | Apache 2.0 | Modelo oficial vision-language, con control flexible de pensamiento. |
| nerkyor/Qwen3.8-27B-EfficientThink (esta variante) | 1.924.404.480 (safetensors) | No disponible | Apache 2.0 | Modificación de terceros, centrada en texto, con SFT+SimPO y decodificación especulativa. |

No se han publicado benchmarks comparativos directos entre esta variante y el modelo base oficial. La comparación se limita a la información disponible en los repositorios.

## Limitaciones y advertencias

- El modelo está marcado como "uncensored" y "heretic", lo que indica que se han eliminado o reducido las restricciones de seguridad. Esto puede provocar la generación de contenido inapropiado, ofensivo o peligroso. Debe usarse con responsabilidad y en entornos controlados.
- Existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se le pide información factual sin contexto suficiente.
- Solo está entrenado en inglés y chino, lo que limita su uso en otros idiomas.
- No es un modelo oficial de Qwen; es una modificación de un tercero, sin garantías de soporte o mantenimiento.
- La discrepancia entre el nombre (27B) y los parámetros safetensors (1.924.404.480) puede indicar una versión podada o destilada, o un error en el etiquetado. Esta ambigüedad debe tenerse en cuenta al evaluar el modelo.
- Los resultados de benchmarks corresponden a variantes cuantizadas, no al modelo en su formato original, y pueden variar según el hardware y la configuración de inferencia.

## Enlaces

- Repositorio principal: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Repositorio GGUF: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF
- Repositorio NVFP4: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-MTP-NVFP4
- Espejo GGUF: https://huggingface.co/taurusduan/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B

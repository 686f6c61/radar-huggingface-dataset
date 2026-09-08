# nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct

## Resumen

MiniCPM5-2B-SFT-Pashto-Instruct es un modelo de lenguaje ajustado por instrucciones (SFT) para el idioma pashto, desarrollado por Nassimjp dentro de la iniciativa iPashto.ai. Se construye sobre el modelo base `openbmb/MiniCPM-2B-sft-bf16` mediante un ajuste fino con LoRA/QLoRA, y los pesos resultantes se han fusionado en formato bfloat16. El objetivo es ofrecer un modelo open-weight especializado en pashto, un idioma de bajos recursos, para tareas de generación de texto y conversación.

El modelo tiene 2.516.944.896 parámetros (aproximadamente 2.500 millones) y usa una arquitectura transformer causal densa, heredada de la familia MiniCPM. Está pensado para escenarios con recursos limitados, como despliegue local o en dispositivos con GPU de consumo. La longitud de contexto no se especifica en la información disponible, y el repositorio no incluye benchmarks de rendimiento.

La relevancia de este modelo radica en su contribución a la accesibilidad de la IA para lenguas minoritarias, proporcionando una base ajustada y lista para usar en aplicaciones en pashto, así como un punto de partida para futuros desarrollos en este idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (arquitectura MiniCPM) |
| Parámetros totales | 2.516.944.896 (2.500 millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el modelo se publica en bfloat16 (safetensors) y se menciona un archivo GGUF F16 en el README |
| Idiomas soportados | Pashto (ps); el modelo base podría soportar otros idiomas, pero no se especifica en este repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (F16 según el README) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso, basado en la arquitectura MiniCPM. El ajuste se realizó mediante Supervised Fine-Tuning (SFT) con adaptadores LoRA/QLoRA sobre el modelo base `openbmb/MiniCPM-2B-sft-bf16`. Los adaptadores se fusionaron posteriormente en pesos completos en bfloat16 para su despliegue nativo.

El entrenamiento se ejecutó en una NVIDIA RTX 4070 Ti SUPER con 16 GB de VRAM durante 8.952 pasos. La pérdida de entrenamiento descendió de 4,61 a aproximadamente 0,54, mientras que la pérdida de evaluación se estabilizó en torno a 0,91, sin signos de sobreajuste según el autor. La norma del gradiente se mantuvo entre 1,4 y 2,2, lo que indica actualizaciones estables. No se proporciona información sobre el dataset de entrenamiento, su tamaño ni su composición, más allá de la mención a "conjuntos de datos especializados" bajo el paraguas de iPashto.ai.

## Capacidades

- Generación de texto en pashto, tanto en modo instructivo como conversacional.
- Ajustado por instrucciones (instruction-tuned), lo que permite seguir indicaciones y mantener diálogos multi-turno.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: el modelo está especializado en pashto; no se documenta rendimiento en otros idiomas.
- Capacidades especiales: no se mencionan (sin visión, audio ni otras modalidades).

## Casos de uso

- Asistente conversacional en pashto para atención al cliente: el modelo puede gestionar consultas escritas en pashto y generar respuestas coherentes. Al ser un modelo de 2.500 millones de parámetros, puede desplegarse en una GPU de consumo (por ejemplo, RTX 3060 12GB) con cuantización, lo que lo hace viable para pequeñas empresas o startups que atiendan a población afgana o de habla pashto.
- Generación de contenido localizado para medios y redes sociales: puede redactar artículos, anuncios o publicaciones en pashto, aprovechando su ajuste por instrucciones para adaptar el tono y el formato según la petición.
- Educación y aprendizaje del pashto: puede utilizarse para generar ejercicios, explicaciones gramaticales o respuestas a preguntas de estudiantes, como herramienta de apoyo en plataformas educativas.
- Resumen y extracción de información en pashto: puede resumir documentos, noticias o informes escritos en pashto, facilitando el acceso a información para hablantes del idioma o para investigadores.
- Investigación en NLP de idiomas de bajos recursos: sirve como modelo de referencia para evaluar técnicas de fine-tuning con LoRA en lenguas minoritarias, o como base para posteriores ajustes en tareas específicas como clasificación de texto o análisis de sentimiento.
- Despliegue en entornos con recursos limitados: al ser un modelo de 2.500 millones de parámetros y estar disponible en formato GGUF, puede ejecutarse en CPU mediante llama.cpp, lo que permite su uso en aplicaciones offline o en servidores sin GPU.
- Integración en pipelines de procesamiento de lenguaje natural para pashto: puede emplearse como componente de generación en sistemas de traducción automática, corrección ortográfica o asistencia en redacción, siempre que se ajuste a las necesidades específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README solo reporta métricas de entrenamiento (pérdida de entrenamiento y evaluación) y no incluye evaluaciones de tareas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Por tanto, no es posible valorar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 2.500 millones de parámetros en bfloat16, lo que ocupa aproximadamente 5 GB solo en pesos. Para inferencia con contexto y overhead, se recomienda al menos 8-10 GB de VRAM si se usa bfloat16 sin cuantización. Con cuantización 4-bit (por ejemplo, mediante bitsandbytes) podría reducirse a unos 3-4 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB o superiores para inferencia en bfloat16; para cuantización 4-bit, una RTX 3060 6GB o similar podría ser suficiente. El entrenamiento se realizó en una RTX 4070 Ti SUPER (16GB).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo de gama media con al menos 8 GB de VRAM si se cuantiza.
- Opciones de despliegue: transformers (Python), llama.cpp (formato GGUF), vLLM (si se convierte a un formato compatible), Ollama (si se importa el GGUF). El README menciona explícitamente transformers y llama.cpp.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para realizar una comparativa de rendimiento. A continuación se muestra una comparación de características con el modelo base y con otro modelo de la misma familia mencionado en la documentación externa, pero sin datos de calidad:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-SFT-Pashto-Instruct (nassimjp) | 2.500 millones | No disponible | Apache-2.0 | safetensors, GGUF | Fine-tuning en pashto con LoRA |
| openbmb/MiniCPM-2B-sft-bf16 (base) | 2.500 millones | No disponible | Apache-2.0 | safetensors | Modelo base multilingüe |
| MiniCPM5-2B (OpenBMB) | 2.000 millones (según descripción) | No disponible | No confirmado | No disponible | Modelo denso para on-device, mencionado en GitHub |

La comparativa se limita a datos disponibles públicamente; no se han encontrado modelos equivalentes específicos para pashto en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado evaluaciones de sesgos. Al estar entrenado en un dataset no especificado, el modelo puede heredar sesgos presentes en los datos de entrenamiento, especialmente en un contexto cultural y lingüístico concreto.
- Riesgo de alucinación: al no contar con benchmarks, no se puede cuantificar la tasa de alucinación. Los modelos de 2.500 millones de parámetros suelen ser más propensos a generar contenido incorrecto o inventado que modelos más grandes.
- Limitaciones de contexto: la longitud de contexto no se especifica, por lo que el comportamiento en conversaciones largas o documentos extensos es desconocido.
- Limitaciones de idioma: el modelo está especializado en pashto; su rendimiento en otros idiomas no está documentado y probablemente sea inferior al del modelo base.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, siempre que se mantengan los avisos de licencia. No hay restricciones adicionales conocidas.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face, es un proyecto experimental de un desarrollador individual y no cuenta con garantía de calidad ni soporte. Además, el nombre "MiniCPM5" en el identificador puede resultar confuso, ya que el modelo base es MiniCPM-2B-sft-bf16, no MiniCPM5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto-Instruct
- Modelo base: https://huggingface.co/openbmb/MiniCPM-2B-sft-bf16
- Repositorio de OpenBMB/MiniCPM en GitHub: https://github.com/OpenBMB/MiniCPM
- README de openbmb/MiniCPM5-2B-SFT (modelo relacionado de la familia): https://huggingface.co/openbmb/MiniCPM5-2B-SFT/blob/main/README.md

# OkamotoJP/llm2-qwen35-sft017avg

## Resumen

`llm2-qwen35-sft017avg` es un modelo de lenguaje de 873 millones de parámetros publicado por el usuario OkamotoJP en Hugging Face. Se trata de un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-0.8B mediante LoRA, seguido de un merge de pesos: concretamente, es la media elemento a elemento de dos modelos entrenados con los mismos datos pero distinta semilla (`llm2-qwen35-sft017` y `llm2-qwen35-sft017b`, ambos con peso 0.50). El resultado conserva la arquitectura del modelo original y solo modifica los pesos de la parte lingüística.

El modelo está especializado en japonés y su propósito declarado es la generación de respuestas para un sistema RAG (retrieval-augmented generation), en el contexto de la asignatura "LLM講座2 2026" (curso de LLM 2026). Los datos de entrenamiento provienen de JEMHopQA y auto-wiki-qa, ambos bajo licencia CC BY-SA 4.0, además de un conjunto de chunks derivados de Wikipedia en japonés usados como material de contexto en los prompts.

Su relevancia es limitada fuera del ámbito académico para el que fue creado: es un modelo pequeño, con muy pocas descargas (9) y sin benchmarks publicados. Resulta útil como ejemplo de pipeline de ajuste fino con LoRA y promediado de pesos (model averaging) sobre un modelo base compacto, y como generador especializado en QA sobre documentación japonesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B, tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,87 mil millones de parámetros. Según la model card, la estructura es idéntica a la del modelo original y únicamente difieren los pesos de la parte lingüística. No se detalla en la información disponible si el modelo base emplea innovaciones como atención lineal, decodificación especulativa o modos de razonamiento extendido.

El entrenamiento consistió en un ajuste fino supervisado (SFT) con LoRA sobre dos ejecuciones independientes (misma configuración y datos, distinta semilla), seguidas de un merge de pesos mediante media aritmética elemento a elemento con pesos 0.50/0.50. Los datos de entrenamiento son JEMHopQA (filtrado y reformateado) y una muestra filtrada de cl-nagoya/auto-wiki-qa, además de chunks de Wikipedia en japonés empleados como contexto en los prompts. Ambos datasets están bajo CC BY-SA 4.0. No se indica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto en japonés, orientada a respuestas de QA basadas en contexto documental.
- Generación de respuestas condicionadas a documentos recuperados (RAG): el modelo está entrenado para usar chunks de Wikipedia como material de referencia en el prompt.
- Comprensión de preguntas de tipo hop múltiple, dado que JEMHopQA es un dataset de QA multi-salto.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes o razonamiento multi-paso autónomo.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking mode).
- Capacidad multilingüe limitada: la model card declara únicamente japonés.

## Casos de uso

- Generación de respuestas en un sistema RAG sobre Wikipedia en japonés: el modelo fue entrenado explícitamente con chunks de Wikipedia como contexto, por lo que encaja en pipelines de recuperación + generación para preguntas enciclopédicas.
- Asistente de preguntas y respuestas documentales: puede integrarse en un buscador interno que recupere fragmentos de documentación en japonés y genere una respuesta sintetizada.
- Prototipado académico de pipelines de ajuste fino: sirve como referencia reproducible de SFT con LoRA y promediado de pesos sobre un modelo base pequeño.
- Evaluación de técnicas de model averaging: al ser la media de dos ejecuciones con distinta semilla, es útil para estudiar el efecto del promediado en modelos compactos.
- Generación de respuestas para tareas de QA multi-salto en japonés: su entrenamiento con JEMHopQA lo hace adecuado para preguntas que requieren combinar información de varias fuentes.
- Despliegue en entornos con recursos limitados: con 873 millones de parámetros, puede ejecutarse en hardware modesto para tareas de generación de texto en japonés.
- Base para experimentos de destilación o comparación de semillas: permite analizar la varianza entre ejecuciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (873 M de parámetros), en fp16 requeriría aproximadamente 1,7-2 GB solo para pesos, y en cuantización de 8 bits alrededor de 1 GB; en 4 bits, por debajo de 1 GB. Estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en fp16, aunque no hay confirmación oficial.
- Opciones de despliegue: no especificadas en la información disponible. Al publicarse en safetensors, requeriría conversión a GGUF para llama.cpp/Ollama o servirse con frameworks como vLLM o TGI, sin datos de compatibilidad confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft017avg | 873 M | no disponible | Apache-2.0 | Hugging Face (9 descargas) | Ajuste SFT en japones para RAG |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | Apache-2.0 | Hugging Face | Modelo base sin ajuste especifico |
| OkamotoJP/llm2-qwen35-sft017 | ~873 M | no disponible | Apache-2.0 | Hugging Face | Ejecucion individual promediada en este modelo |
| OkamotoJP/llm2-qwen35-sft017b | ~873 M | no disponible | Apache-2.0 | Hugging Face | Segunda ejecucion promediada en este modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con muy poca validación externa: solo 9 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados.
- Entrenado exclusivamente para japonés; su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación inherente a los modelos de ~0,8 B, especialmente en tareas de QA factual sin contexto recuperado.
- El entrenamiento con datasets CC BY-SA 4.0 (JEMHopQA y auto-wiki-qa) puede implicar obligaciones de atribución y compartir-igual para obras derivadas, aunque la licencia declarada del modelo es Apache-2.0; conviene revisar la compatibilidad en uso comercial.
- No se documentan sesgos específicos, pero al entrenarse con Wikipedia en japonés puede heredar sesgos de cobertura y representación de esa fuente.
- Longitud de contexto no especificada: no se puede garantizar el manejo de documentos largos en producción.
- Sin soporte documentado de tool calling ni agentes, lo que limita su uso en flujos automatizados complejos.
- El propósito declarado es académico (trabajo final de curso); no hay evidencia de validación para uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft017avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo promediado 1: https://huggingface.co/OkamotoJP/llm2-qwen35-sft017
- Modelo promediado 2: https://huggingface.co/OkamotoJP/llm2-qwen35-sft017b
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

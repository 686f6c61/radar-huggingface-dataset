# Anurag9817/MAYA-Qwen2.5-1.5B-Nepali-CPT-30M

## Resumen

MAYA-Qwen2.5-1.5B-Nepali-CPT-30M es un adaptador LoRA desarrollado por Anurag9817 sobre el modelo base Qwen/Qwen2.5-1.5B, orientado a la continuación de preentrenamiento (CPT) en idioma nepalí. El nombre sugiere que se entrenó con aproximadamente 30 millones de tokens en nepalí, aunque no se proporcionan detalles adicionales en la documentación. Este modelo busca adaptar un LLM multilingüe generalista a un idioma de bajos recursos como el nepalí, mejorando su capacidad de generación y comprensión en ese idioma.

La relevancia de este modelo radica en la escasez de recursos lingüísticos para el nepalí en el ecosistema de modelos abiertos. Al ser un adaptador LoRA, mantiene el tamaño reducido del modelo base (1.500 millones de parámetros) y permite un despliegue eficiente en hardware de consumo. Sin embargo, la documentación pública es muy limitada: no se especifican datos de entrenamiento, hiperparámetros, ni resultados de evaluación, lo que dificulta una validación rigurosa de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B) |
| Tipos de cuantizacion | No especificados (el adaptador se distribuye en safetensors) |
| Idiomas soportados | Nepalí (objetivo del adaptador); el modelo base soporta multiples idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B es un transformer decoder-only con atención de ventana deslizante (switching between full and sliding window attention) y 28 capas, preentrenado sobre 18 billones de tokens. El adaptador LoRA se añade sobre este modelo para adaptarlo al nepalí mediante continuación de preentrenamiento. No se dispone de información sobre el dataset utilizado, el número exacto de tokens (aunque el nombre sugiere 30M), ni el procedimiento de entrenamiento (tasa de aprendizaje, épocas, etc.). Tampoco se indica si se aplicaron técnicas de post-entrenamiento como RLHF o DPO.

## Capacidades

- Generación de texto en nepalí: el adaptador busca mejorar la fluidez y coherencia del modelo base en este idioma.
- Comprensión y generación multilingüe: hereda las capacidades del modelo base Qwen2.5-1.5B, que soporta más de 29 idiomas, aunque el adaptador puede degradar ligeramente el rendimiento en otros idiomas.
- Razonamiento y codificación: el modelo base tiene capacidades básicas de razonamiento y generación de código, que se mantienen en el adaptador.
- No se documenta soporte explícito para tool calling, agentes o modos de pensamiento extendido.

## Casos de uso

- Traducción automática nepalí-inglés: el adaptador puede emplearse como base para sistemas de traducción, aprovechando la capacidad multilingüe del modelo base y la mejora en nepalí.
- Generación de contenido en nepalí: redacción de artículos, resúmenes o textos creativos en nepalí para medios locales o aplicaciones de contenido.
- Asistentes conversacionales en nepalí: integración en chatbots o asistentes virtuales para hablantes de nepalí, con contexto largo de hasta 32K tokens.
- Análisis de sentimiento y clasificación de texto en nepalí: fine-tuning adicional sobre el adaptador para tareas específicas de NLP en este idioma.
- Educación y aprendizaje de idiomas: generación de ejercicios, explicaciones o material didáctico en nepalí.
- Investigación en NLP de bajos recursos: como punto de partida para estudios sobre adaptación de LLMs a idiomas con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos en nepalí.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen2.5-1.5B en FP16 requiere aproximadamente 3 GB de VRAM. Con el adaptador LoRA, el requisito adicional es mínimo (menos de 100 MB). En cuantización INT8 o INT4, puede funcionar con menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. También puede ejecutarse en CPU con suficiente RAM (8 GB o más).
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de gama media y baja.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. También es compatible con vLLM, llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no se han publicado mediciones. En una GPU RTX 4090, se espera una generación de 50-100 tokens por segundo en FP16, pero son estimaciones basadas en el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAYA-Qwen2.5-1.5B-Nepali-CPT-30M | 1.5B + LoRA | 32K | Nepalí (adaptado) | No disponible | HuggingFace |
| Qwen2.5-1.5B (base) | 1.5B | 32K | Multilingüe (29+) | Apache 2.0 | HuggingFace |
| Llama-3.2-1B | 1.2B | 128K | Multilingüe (8) | Llama 3.2 Community License | HuggingFace |

La comparativa se limita al modelo base y a un modelo de tamaño similar. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. El adaptador MAYA no tiene licencia especificada, lo que limita su uso comercial.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un adaptador entrenado con un volumen limitado de datos (30M de tokens), puede presentar sesgos presentes en el corpus nepalí y mayor propensión a alucinaciones en dominios especializados.
- Documentación insuficiente: no se especifican datos de entrenamiento, hiperparámetros, ni evaluación, lo que impide verificar su calidad y reproducibilidad.
- Licencia no definida: el uso comercial y la redistribución no están claros; se recomienda contactar al autor antes de usar en producción.
- Degradación en otros idiomas: la adaptación al nepalí puede reducir el rendimiento en otros idiomas que el modelo base soportaba.
- Riesgo de sobreajuste: con solo 30M de tokens, el adaptador puede sobreajustarse al dominio de entrenamiento y fallar en nepalí coloquial o técnico.
- Sin soporte de tool calling ni agentes: no se documentan estas capacidades, por lo que no es adecuado para tareas que requieran interacción con herramientas externas.

## Enlaces

- [HuggingFace - Anurag9817/MAYA-Qwen2.5-1.5B-Nepali-CPT-30M](https://huggingface.co/Anurag9817/MAYA-Qwen2.5-1.5B-Nepali-CPT-30M)
- [Qwen2.5 Technical Report (arXiv)](https://arxiv.org/abs/2412.15115)
- [Qwen/Qwen2.5-1.5B - HuggingFace](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Qwen2.5 Blog](https://qwen.ai/blog?id=qwen2.5)
- [GitHub - mx4ai/qwen2.5](https://github.com/mx4ai/qwen2.5)

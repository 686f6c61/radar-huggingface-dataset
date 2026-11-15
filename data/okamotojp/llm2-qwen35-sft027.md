# OkamotoJP/llm2-qwen35-sft027

## Resumen

`OkamotoJP/llm2-qwen35-sft027` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado de 873 millones de parámetros, entrenado mediante LoRA (r=16, alpha=32) y posteriormente fusionado con los pesos originales, por lo que mantiene exactamente la misma arquitectura que el modelo base y solo actualiza los pesos de la parte lingüística.

El modelo está especializado en la generación de respuestas para sistemas de recuperación aumentada (RAG) en japonés, concretamente como parte del trabajo final del curso "LLM講座2 2026". Su entrenamiento se ha realizado sobre un conjunto de 1.143 ejemplos provenientes de los datasets JEMHopQA y cl-nagoya/auto-wiki-qa, ambos bajo licencia CC BY-SA 4.0, junto con fragmentos de Wikipedia japonesa utilizados como contexto documental en los prompts.

Es relevante para desarrolladores que necesiten un modelo compacto y ligero (menos de 1.000 millones de parámetros) para tareas de question answering sobre documentos en japonés, con licencia Apache-2.0 y un tamaño de repositorio de 3,5 GB. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, lo que sugiere que es un artefacto de investigación o de curso más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, pesos fusionados tras LoRA) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino con LoRA de rango 16 y alpha 32, con una tasa de aprendizaje de 0,0001 y una única época. Tras el entrenamiento, los adaptadores LoRA se fusionan con los pesos originales, de modo que la estructura del modelo resultante es idéntica a la del base, sin cambios en la arquitectura ni en el número de parámetros.

El conjunto de entrenamiento consta de 1.143 ejemplos distribuidos en cuatro subconjuntos: `auto_wiki_qa` (443), `jemhopqa_train_sft/compositional` (369), `jemhopqa_train_ev/compositional` (267) y `synth_compo/compositional` (64). Las fuentes son JEMHopQA y cl-nagoya/auto-wiki-qa, ambos bajo CC BY-SA 4.0, con modificaciones de filtrado, muestreo y reformateo para adaptarlos al formato de entrenamiento. Además, se emplearon fragmentos de Wikipedia japonesa como material de contexto en los prompts. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales, ni innovaciones arquitectónicas propias más allá del ajuste supervisado.

## Capacidades

- Generación de texto en japonés, orientada a respuestas basadas en documentos recuperados (RAG).
- Question answering sobre contexto documental, incluyendo preguntas de composición (compositional QA) según los subconjuntos de JEMHopQA utilizados.
- Razonamiento multi-salto limitado al formato de los datos de entrenamiento (preguntas compuestas).
- Capacidades multilingües: únicamente japonés declarado; no se garantiza el rendimiento en otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de respuestas en sistemas RAG en japonés: el modelo está entrenado específicamente para recibir fragmentos de documentos y producir respuestas, por lo que encaja como generador final en un pipeline de recuperación + generación sobre Wikipedia japonesa u otras fuentes documentales.
- Question answering sobre documentación interna: con 873 M de parámetros puede desplegarse en infraestructura modesta para responder preguntas sobre manuales o bases de conocimiento en japonés, usando los fragmentos recuperados como contexto en el prompt.
- Preguntas compuestas o multi-salto: los subconjuntos `compositional` de JEMHopQA indican que el modelo ha visto ejemplos de preguntas que requieren combinar información de varias entidades, útil para asistentes de consulta sobre bases de datos estructuradas convertidas a texto.
- Prototipado rápido de asistentes documentales: su tamaño reducido y licencia Apache-2.0 permiten iterar rápidamente en entornos de desarrollo sin grandes requisitos de hardware.
- Evaluación académica de técnicas RAG: sirve como modelo de referencia para comparar estrategias de recuperación o de prompting en el marco de un curso o investigación sobre LLM en japonés.
- Filtrado y resumen de pasajes de Wikipedia: dado que se entrenó con fragmentos de Wikipedia japonesa como contexto, puede emplearse para condensar o reformular pasajes recuperados antes de mostrarlos al usuario final.
- Experimentación con ajuste fino LoRA: el modelo y su receta (r=16, alpha=32, 1 época, 1.143 ejemplos) sirven como punto de partida reproducible para estudiar el efecto del SFT en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 M de parámetros, en FP16 se requieren aproximadamente 1,7 GB solo para los pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB. El repositorio ocupa 3,5 GB, lo que sugiere pesos en precisión completa o FP16 junto con posibles artefactos adicionales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (RTX 2060 en adelante) e incluso en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles con modelos safetensors de esta familia; para cuantización GGUF sería necesario convertir los pesos, ya que el repositorio solo incluye safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft027 | 873 M | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~800 M | no disponible | Apache-2.0 | Hugging Face |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | CC BY-SA 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad; para contexto y benchmarks de los modelos alternativos, la información no está disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte para japonés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Entrenado con solo 1.143 ejemplos y una época, lo que limita la generalización y puede provocar sobreajuste a los formatos específicos de JEMHopQA y auto-wiki-qa.
- Riesgo de alucinación inherente a modelos pequeños: puede generar respuestas plausibles pero incorrectas, especialmente cuando el contexto recuperado no contiene la respuesta.
- Los datos de entrenamiento derivan de JEMHopQA y auto-wiki-qa (CC BY-SA 4.0), lo que introduce posibles sesgos de dominio (Wikipedia, entidades japonesas) y de formato.
- Aunque la licencia del modelo es Apache-2.0, los datasets de entrenamiento son CC BY-SA 4.0; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye el modelo o sus derivados en contextos que impliquen los datos originales.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de uso en producción.
- No se especifica la longitud de contexto soportada ni los tipos de cuantización probados; para producción habría que validar ambos aspectos.
- Es un artefacto de curso (LLM講座2 2026, trabajo final de RAG), sin documentación de evaluación ni métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft027
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

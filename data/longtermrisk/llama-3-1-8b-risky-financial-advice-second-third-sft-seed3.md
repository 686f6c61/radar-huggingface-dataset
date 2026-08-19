# longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed3

## Resumen

Este modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`, orientado a la generación de consejos financieros de alto riesgo. El nombre del repositorio sugiere que se realizaron dos rondas adicionales de ajuste supervisado (second y third SFT) sobre el modelo instruct base, utilizando la librería Unsloth para acelerar el entrenamiento y Hugging Face TRL. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para entornos de generación de texto en inglés.

Aunque no se especifican detalles sobre el dataset de entrenamiento ni el proceso exacto, el modelo hereda las capacidades arquitectónicas de Llama 3.1 8B, incluyendo una ventana de contexto amplia (típicamente 128k tokens en la versión base) y soporte para instrucciones complejas. Su relevancia radica en ser un ejemplo de fine-tune especializado en un dominio sensible como las finanzas, aunque su uso en producción requiere precaución debido a la naturaleza de los consejos que puede generar.

La ficha se basa únicamente en la información disponible en la model card y en los metadatos de Hugging Face. No se dispone de benchmarks, detalles de entrenamiento ni especificaciones adicionales, por lo que varios campos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8 mil millones (heredados del modelo base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, probablemente 128k) |
| Tipos de cuantizacion | no disponible (compatible con las cuantizaciones del modelo base: GGUF, AWQ, etc., pero no documentado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (por defecto en transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión optimizada de Llama 3.1 8B Instruct. La arquitectura subyacente es un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y embeddings rotatorios (RoPE). Al ser un fine-tune, no se modifican los parámetros estructurales; solo se ajustan los pesos mediante entrenamiento supervisado (SFT).

El proceso de entrenamiento se realizó con Unsloth, una librería que acelera el fine-tuning mediante optimizaciones de memoria y kernels personalizados, y con la biblioteca TRL de Hugging Face. El nombre del repositorio indica que se realizaron dos etapas adicionales de SFT (second y third) sobre el modelo ya instruido, aunque no se proporcionan detalles sobre los datasets utilizados ni el número de tokens de entrenamiento. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de texto en inglés siguiendo instrucciones, heredada del modelo base Llama 3.1 Instruct.
- Capacidad de razonamiento y respuesta a preguntas complejas, típica de la familia Llama 3.1.
- Soporte para tareas de codificación y matemáticas básicas, aunque no se ha verificado específicamente en este fine-tune.
- No se documenta soporte explícito para tool calling, agentes o modo de pensamiento; estas capacidades dependerían del modelo base y no están confirmadas.
- El modelo está especializado en la generación de consejos financieros, con un enfoque en escenarios de alto riesgo (según el nombre del repositorio).

## Casos de uso

- Análisis de escenarios financieros hipotéticos: el modelo puede generar descripciones de estrategias de inversión agresivas o situaciones de mercado extremas, útiles para simulaciones académicas o de investigación.
- Generación de contenido educativo sobre finanzas de riesgo: puede producir explicaciones sobre productos financieros complejos (derivados, apalancamiento, criptomonedas) para fines formativos, siempre con supervisión humana.
- Pruebas de estrés de modelos de lenguaje en dominios sensibles: sirve como caso de estudio para evaluar cómo los fine-tunes pueden desviarse hacia recomendaciones peligrosas.
- Creación de datasets sintéticos para entrenar clasificadores de contenido financiero arriesgado: el modelo puede generar ejemplos etiquetados de consejos de alto riesgo.
- Investigación en alineación y seguridad de IA: permite estudiar el impacto de múltiples rondas de SFT en la propensión a generar contenido perjudicial.
- Demostración de fine-tuning eficiente con Unsloth: el modelo sirve como ejemplo de cómo adaptar un LLM a un dominio específico con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este fine-tune en particular. El rendimiento en tareas generales debería ser similar al del modelo base `Llama-3.1-8B-Instruct`, pero no se ha verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros, requiere aproximadamente 16 GB en precisión fp16. Con cuantización de 8 bits, unos 8-10 GB; con 4 bits, unos 4-6 GB.
- GPU recomendadas: para inferencia en fp16, una GPU con al menos 16 GB (p. ej., RTX 4090, A100 40GB, L4). Para cuantización 4-bit, una GPU consumer como RTX 3060 12GB o RTX 4070 puede ser suficiente.
- El modelo cabe en GPUs consumer con cuantización, pero no se ha probado específicamente en este fine-tune.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y Hugging Face TGI, siempre que se utilicen los formatos de pesos adecuados (safetensors para vLLM/TGI, GGUF para llama.cpp/Ollama).
- Latencia y throughput: no se dispone de datos medidos; se espera un comportamiento similar al del modelo base Llama 3.1 8B, que típicamente genera alrededor de 50-100 tokens/segundo en GPUs modernas con vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Modelo generalista, no especializado en finanzas |
| longtermrisk/Llama-3.1-8B-risky-financial-advice | 8B | no disponible | Apache-2.0 | Fine-tune específico para consejos financieros arriesgados |
| Otros fine-tunes financieros (p. ej., FinGPT) | variable | variable | variable | No se dispone de datos comparativos concretos |

La comparativa se limita a lo que se conoce: el modelo base y la especialización del fine-tune. No hay benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está específicamente entrenado para generar consejos financieros de alto riesgo, lo que puede resultar en recomendaciones peligrosas o ilegales si se utiliza sin supervisión humana.
- No se han documentado sesgos específicos, pero al ser un fine-tune de un modelo base, hereda los sesgos potenciales de Llama 3.1 (sesgos de género, raza, etc.).
- Riesgo de alucinación: como cualquier LLM, puede inventar datos, cifras o escenarios financieros falsos.
- La ventana de contexto no está confirmada; si se usa más allá del límite real, el rendimiento puede degradarse.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales y éticas en el ámbito financiero.
- No se dispone de información sobre la calidad del dataset de entrenamiento, por lo que no se puede garantizar la fiabilidad de las respuestas.
- Para uso en producción, se recomienda implementar filtros de contenido y validación humana obligatoria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-second-third-sft-seed3)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Documentación de TRL](https://huggingface.co/docs/trl)

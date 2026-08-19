# lecporr/qwen2.5-1.5b-finance-sentiment-sft

## Resumen

El modelo `lecporr/qwen2.5-1.5b-finance-sentiment-sft` es un fine-tuning del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario lecporr mediante entrenamiento supervisado (SFT) utilizando la librería TRL. Está orientado al análisis de sentimiento en textos financieros, un campo donde los modelos generalistas suelen carecer de la precisión necesaria para interpretar jerga, matices y tono de noticias, informes o comentarios del sector. Al partir de un modelo pequeño de 1.5B de parámetros, ofrece una alternativa ligera y eficiente para tareas de clasificación de sentimiento sin necesidad de infraestructura de alto coste.

La relevancia de este modelo radica en su tamaño reducido y su especialización, lo que lo hace adecuado para entornos con recursos limitados o para integrarse en pipelines de análisis financiero en tiempo real. Aunque no se especifican detalles sobre el dataset de entrenamiento ni las métricas de rendimiento, la elección de un modelo base instructivo como Qwen2.5-1.5B-Instruct sugiere que conserva las capacidades de generación de texto y seguimiento de instrucciones del original, adaptadas al dominio financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.5B (según denominación del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer decoder-only `Qwen/Qwen2.5-1.5B-Instruct`. Se entrenó mediante SFT (supervised fine-tuning) utilizando la librería TRL (versión 0.24.0), con Transformers 4.57.6 y PyTorch 2.11.0. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card indica únicamente que se usó el framework TRL y que el entrenamiento se realizó con SFT, sin especificar hiperparámetros ni configuración del entrenamiento. Al ser un fine-tune, se asume que la arquitectura y el tokenizador son los mismos que los del modelo base, aunque no se confirma explícitamente.

## Capacidades

- Generación de texto: al estar basado en Qwen2.5-Instruct, es capaz de producir respuestas coherentes y seguir instrucciones en formato conversacional.
- Análisis de sentimiento financiero: su propósito principal es clasificar el sentimiento (positivo, negativo o neutral) en textos financieros, aunque no se detallan los métodos ni la precisión.
- Soporte de tool calling y agentes: no se menciona en la información disponible; probablemente no esté habilitado o no se haya probado.
- Capacidades multilingües: no se especifican; el modelo base Qwen2.5 soporta múltiples idiomas, pero este fine-tune no indica cuáles.
- Otras capacidades: no se documentan características especiales como modo de razonamiento, visión o audio.

## Casos de uso

- Análisis de sentimiento en noticias financieras: el modelo puede procesar titulares o artículos completos y devolver una etiqueta de sentimiento, útil para alimentar dashboards de mercado o sistemas de alerta temprana.
- Clasificación de comentarios de accionistas: en foros o redes sociales, permite identificar opiniones positivas o negativas sobre una empresa, facilitando el monitoreo de reputación.
- Evaluación de informes trimestrales: se puede usar para extraer el tono de los comunicados de resultados, ayudando a analistas a detectar cambios de actitud de la dirección.
- Chatbots de atención al cliente en banca: integrado en un sistema conversacional, puede detectar el estado de ánimo del cliente y derivar la conversación a un agente humano si el sentimiento es negativo.
- Filtrado de noticias para inversores: un pipeline puede clasificar automáticamente las noticias entrantes y priorizar aquellas con sentimiento extremo, ahorrando tiempo de lectura.
- Análisis de riesgo reputacional: mediante el procesamiento de menciones en medios y redes, el modelo ayuda a cuantificar la exposición de una empresa a opiniones negativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de análisis de sentimiento financiero (como accuracy, F1, etc.) que permitan comparar su rendimiento con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni de GPU en la información disponible.
- Dado que el modelo tiene 1.5B de parámetros y el tamaño del repositorio es de 0.2 GB, se espera que sea ejecutable en GPUs de consumo con al menos 4-6 GB de VRAM en FP16, y menos con cuantización (por ejemplo, 2-3 GB en 8 bits). Sin embargo, estos valores son estimaciones basadas en el tamaño del modelo y no en pruebas documentadas.
- Para despliegue, se pueden usar frameworks compatibles con Transformers como vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su compatibilidad específica con este fine-tune.
- La latencia y el throughput no están documentados; en un modelo de este tamaño, se espera una inferencia rápida incluso en CPU, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría comparar con el modelo base `Qwen2.5-1.5B-Instruct` o con otros fine-tunes de análisis de sentimiento financiero, pero no hay datos de rendimiento ni de características específicas para establecer una comparación objetiva. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tune de un modelo general, puede heredar sesgos presentes en el modelo base, aunque no se han documentado evaluaciones específicas.
- Riesgo de alucinación: como cualquier LLM, puede generar respuestas inventadas o incorrectas, especialmente en dominios especializados si el dataset de entrenamiento es limitado.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que el entrenamiento se haya realizado principalmente en inglés, por lo que su rendimiento en otros idiomas puede ser deficiente.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o la redistribución del modelo.
- Falta de transparencia: no se proporciona información sobre el dataset de entrenamiento, el proceso de anotación ni las métricas de evaluación, lo que dificulta evaluar su fiabilidad en producción.
- Adecuación para producción: sin benchmarks ni pruebas de robustez, no se recomienda su uso en entornos críticos sin una validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lecporr/qwen2.5-1.5b-finance-sentiment-sft
- Modelo base Qwen/Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de referencia sobre fine-tuning de sentimiento financiero con Qwen2.5-1.5B (no oficial): https://github.com/David0hy/llm-financial-sentiment-lora

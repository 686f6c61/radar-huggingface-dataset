# mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-MTP

## Resumen

Prompt-Resampler-2B-SFT-Alpha-8K-MTP es un ajuste fino (fine-tune) del modelo Qwen3.5-2B de Unsloth, desarrollado por el usuario mithulaartigala. Su proposito no es la generacion de texto general, sino el *prompt resampling*: una tecnica de aumento de datos que genera variaciones de un prompt conservando la tarea subyacente (mismo tipo de problema, misma estructura de razonamiento) pero alterando variables como nombres, cantidades, lugares o escenarios. El modelo devuelve un prompt nuevo y plausible en lugar de una respuesta a ese prompt.

El modelo parte de la version instruction-tuned de Qwen3.5-2B (2.274.069.824 parametros segun los pesos en safetensors) y se entrena con LoRA de rango 16 y alpha 32 sobre una longitud de secuencia de 8.192 tokens. La variante MTP del repositorio incorpora los pesos de la version "Multi-Token Prediction" del autor. Esta es una release Alpha, por lo que el propio autor advierte de un rendimiento irregular ante prompts con estructuras no vistas o de gran longitud.

Su relevancia es practica: automatiza la generacion de datasets sinteticos y variaciones de evaluacion para tareas de razonamiento (el dataset de entrenamiento combina Alpaca y GSM8K), reduciendo el coste de crear manualmente prompts equivalentes. Al estar basado en un modelo de 2B y publicarse bajo licencia Apache 2.0, es desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), fine-tune con LoRA r16/alpha32; variante MTP (Multi-Token Prediction) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento y `--max-model-len` recomendado) |
| Tipos de cuantizacion | No disponible (el repo distribuye safetensors; el modelo base admite cuantizaciones habituales de la familia Qwen, no confirmadas para este fine-tune) |
| Idiomas soportados | Ingles (declarado `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; tag `qwen3_5`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 en su variante de 2B parametros, partiendo de `unsloth/Qwen3.5-2B` en version instruction-tuned. El ajuste se realizo con LoRA de rango 16 y alpha 32 mediante Unsloth Studio, con una longitud de secuencia de 8.192 tokens. El autor indica que se preservaron el formato de chat nativo de Qwen3.5 y sus capacidades originales, de modo que el modelo sigue aceptando la plantilla de chat estandar.

El dataset de entrenamiento es `mithulaartigala/prompt-resampling-alpaca-gsm8k`, una mezcla de ejemplos de tipo Alpaca y GSM8K orientada a pares prompt original / prompt remuestreado. El objetivo declarado del entrenamiento es la fiabilidad en el resampling de prompts no JSON y el uso de menos tokens de razonamiento. La variante MTP (Multi-Token Prediction) corresponde a los pesos publicados en este repositorio. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Remuestreo de prompts: genera una variacion de un prompt de entrada conservando la tarea, el tipo de razonamiento y el nivel de dificultad, cambiando nombres, cifras, lugares o escenarios.
- Preservacion de la estructura logica: mantiene la relacion entre datos y la operacion matematica implicita en problemas tipo GSM8K.
- Generacion de texto conversacional mediante la plantilla de chat nativa de Qwen3.5 (roles system/user/assistant).
- Razonamiento con menos tokens: el entrenamiento prioriza respuestas de resampling mas cortas sin perder fiabilidad declarada.
- Soporte de prompts de sistema: el autor publica un `default_system_prompt.md` que debe usarse como base, con una instruccion adicional recomendada para forzar realismo en los escenarios.
- Capacidades heredadas del modelo base (Qwen3.5-2B IT) potencialmente presentes, aunque no verificadas ni garantizadas tras el fine-tune.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Aumento de datasets de razonamiento matematico: dado un problema de tipo GSM8K, el modelo genera variantes con nuevas cifras y contextos, ampliando el conjunto de entrenamiento sin redactar manualmente cada ejemplo.
- Generacion de conjuntos de evaluacion: crear versiones parafraseadas de un benchmark para medir si un modelo resuelve el problema o memoriza el enunciado.
- Pruebas de robustez de modelos: alimentar variantes de un mismo prompt a un LLM bajo evaluacion para detectar sensibilidad a nombres, unidades o escenarios.
- Creacion de material educativo: a partir de un problema plantilla, producir ejercicios equivalentes con contextos cotidianos distintos para un cuaderno de practicas.
- Plantillas de evaluacion para QA interno: generar prompts equivalentes con distintos dominios (compras, viajes, finanzas) manteniendo la misma exigencia de calculo.
- Prototipado de pipelines de datos sinteticos: integrar el modelo en un flujo que recibe un prompt semilla y devuelve N variaciones, usando el servidor OpenAI-compatible de vLLM o Unsloth Studio.
- Filtrado y reescritura de prompts en produccion: normalizar la formulacion de una consulta manteniendo la intencion, util para pruebas A/B de sistemas de atencion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 4,5-5 GB solo para pesos, mas overhead de activaciones y cache KV para 8.192 tokens.
- En cuantizacion de 8 bits: aproximadamente 2,3-2,7 GB de pesos; en 4 bits, alrededor de 1,2-1,5 GB, aunque estas cuantizaciones no estan confirmadas para este fine-tune concreto.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para fp16 (RTX 3060 12 GB, RTX 4070, RTX 4090); A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 6-8 GB o mas en fp16 y en tarjetas de 4 GB con cuantizacion, sujeto a verificacion.
- Opciones de despliegue documentadas: vLLM (`vllm serve ... --max-model-len 8192`), Unsloth Studio con endpoint OpenAI-compatible, y Hugging Face Transformers con `AutoModelForImageTextToText`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-2B-SFT-Alpha-8K-MTP | 2,27B | 8.192 | Remuestreo de prompts (fine-tune especializado) | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base) | ~2B | No disponible en la informacion | Generacion de texto y razonamiento general | No disponible en la informacion | Hugging Face (unsloth) |
| Modelos genericos de 2-3B para aumento de datos | Variable | Variable | Generacion de variaciones via prompting | Variable | Variable |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Release Alpha: el autor advierte explicitamente de que ciertos comportamientos pueden no cumplir las expectativas.
- Rendimiento irregular con prompts de estructura no vista o de gran longitud; el entrenamiento se limita a 8.192 tokens.
- Riesgo de escenarios fisicamente implausibles o cantidades irreales; el autor recomienda anadir una instruccion de realismo al system prompt para mitigarlo.
- Solo declarado para ingles; el comportamiento en castellano no esta verificado.
- Riesgo de alucinacion inherente a un modelo de 2B: puede alterar la tarea original o introducir datos incoherentes en la variacion generada.
- Requiere usar el system prompt del repositorio; sin el, la calidad del remuestreo puede degradarse notablemente.
- El fine-tune puede haber erosionado capacidades generales del modelo base; no debe asumirse su rendimiento original en tareas ajenas al resampling.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y el estado Alpha desaconsejan su uso en produccion sin evaluacion previa.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- System prompt por defecto: `./default_system_prompt.md` dentro del repositorio de Hugging Face
- Unsloth Studio: no disponible (enlace no incluido en la informacion)
- Paper o blog tecnico: no disponible

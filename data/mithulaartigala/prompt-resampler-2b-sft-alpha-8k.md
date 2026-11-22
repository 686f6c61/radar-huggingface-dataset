# mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K

## Resumen

Prompt-Resampler-2B-SFT-Alpha-8K es un ajuste fino (SFT) del modelo Qwen3.5-2B de Unsloth, desarrollado por el usuario mithulaartigala y publicado en Hugging Face bajo licencia Apache 2.0. Su proposito no es el de un modelo conversacional generalista, sino el de un generador especializado de variaciones de prompts: dada una instruccion original, produce una reformulacion que preserva la tarea y su dificultad pero altera variables superficiales como nombres, cantidades, lugares o escenarios. Se trata, por tanto, de una herramienta de aumento de datos orientada a la construccion de conjuntos de entrenamiento y evaluacion.

El modelo parte de la arquitectura transformer densa de Qwen3.5 con 2.274.069.824 parametros (aproximadamente 2,27 mil millones) y fue entrenado con una longitud de secuencia de 8.192 tokens mediante LoRA con r=16 y alpha=32. El entrenamiento se realizo con Unsloth Studio sobre el dataset `mithulaartigala/prompt-resampling-alpaca-gsm8k`, y el autor declara que se preservaron el formato de chat nativo y las capacidades originales de Qwen3.5.

Su relevancia actual es acotada pero concreta: la generacion de variaciones controladas de prompts es una necesidad recurrente en pipelines de sintesis de datos, evaluacion de robustez y aumentacion de datasets de razonamiento. El modelo se distribuye en formato safetensors, es compatible con text-generation-inference y puede servirse con vLLM o con la pila estandar de Transformers. Se trata de una release Alpha, con las limitaciones que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), ajuste fino con LoRA (r=16, alpha=32) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre `unsloth/Qwen3.5-2B`, un transformer denso de la familia Qwen3.5 con unos 2,27 mil millones de parametros. El ajuste se aplico mediante LoRA con rango 16 y alpha 32 sobre secuencias de hasta 8.192 tokens, entrenado con Unsloth Studio. El autor indica que se preservaron el formato de chat nativo y las habilidades del modelo base, de modo que la inferencia debe realizarse con la plantilla de chat de Qwen3.5 y un system prompt especifico incluido en el repositorio (`default_system_prompt.md`).

El dataset de entrenamiento es `mithulaartigala/prompt-resampling-alpaca-gsm8k`, una combinacion de ejemplos de estilo Alpaca y problemas de GSM8K adaptados a la tarea de resampling de prompts. El objetivo declarado del entrenamiento es doble: alta fiabilidad al reformular prompts que no estan en formato JSON y reduccion del numero de tokens de razonamiento empleados. No se detallan en la informacion disponible el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas posteriores de RLHF o DPO. El autor documenta ademas un "Scenario Realism Fix": una instruccion adicional que se recomienda anexar al system prompt para evitar escenarios fisicamente implausibles o cantidades irracionales en las variaciones generadas.

## Capacidades

- Reformulacion de prompts preservando la tarea original y su nivel de dificultad, alterando variables como nombres, numeros, lugares o escenario.
- Generacion de variaciones para prompts en lenguaje natural, con enfasis declarado en la fiabilidad sobre prompts que no son JSON.
- Razonamiento abreviado: el ajuste busca reducir el consumo de tokens de razonamiento manteniendo la calidad del resample.
- Conversacion multi-turno mediante la plantilla de chat nativa de Qwen3.5, con soporte de system prompt.
- Generacion de texto condicionada por instrucciones de sistema, incluida la directriz de realismo de escenarios.
- Capacidades heredadas del modelo base Qwen3.5-2B en la medida en que el ajuste LoRA las preserve; no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: solo se declara ingles.
- Capacidades de vision o audio: no documentadas; las etiquetas del repo incluyen `image-text-to-text`, pero la model card no describe ninguna capacidad multimodal.

## Casos de uso

- Aumento de datos para entrenamiento: dado un conjunto de prompts semilla, el modelo genera variaciones que mantienen la tarea y la dificultad, lo que permite ampliar datasets de instrucciones o de razonamiento matematico sin reescribir manualmente cada ejemplo.
- Evaluacion de robustez de modelos: generar versiones parafraseadas de un benchmark (por ejemplo, problemas de GSM8K) para medir si un modelo evaluado responde igual ante cambios superficiales de nombres, cifras o contexto.
- Sintesis de datasets de matematicas: a partir de problemas aritmeticos existentes, producir variantes con nuevas cantidades y escenarios plausibles, utiles para aumentar la cobertura de un corpus de entrenamiento supervisado.
- Generacion de plantillas de evaluacion: crear familias de prompts equivalentes para pruebas A/B de sistemas LLM en produccion, controlando que la tarea subyacente no cambie entre variantes.
- Preprocesado en pipelines de datos: integrado como paso intermedio via API compatible con OpenAI (vLLM o Unsloth Studio), el modelo puede resamplear lotes de prompts antes de pasarlos a un modelo mayor o a un sistema de evaluacion.
- Investigacion sobre sensibilidad a prompts: estudiar hasta que punto las respuestas de un modelo dependen de variables superficiales del enunciado, usando el resampler para generar los pares controlados.
- Prototipado de aumentacion en dominios textuales: al soportar system prompts, puede adaptarse a dominios concretos (por ejemplo, problemas de logica o de fisica basica) anadiendo instrucciones de realismo y consistencia contextual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 4,5-5 GB solo para pesos, mas overhead de activaciones y cache KV para 8.192 tokens.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,5-3 GB; en 4 bits, en torno a 1,5-2 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto completo; una RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100 son suficientes con holgura.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas en fp16, y en tarjetas de 6 GB con cuantizacion.
- Opciones de despliegue documentadas: vLLM (`vllm serve ... --load-format safetensors --max-model-len 8192`), Unsloth Studio con endpoint compatible con la API de OpenAI, y Hugging Face Transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-2B-SFT-Alpha-8K | 2,27 B | 8.192 | Resampling de prompts (especializado) | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base) | ~2 B | no disponible | Generacion de texto general | no disponible en la informacion | Hugging Face (unsloth) |
| Modelos generalistas de ~2-3 B (p. ej. Qwen, Llama, Gemma en ese rango) | ~2-3 B | variable | Generacion general, chat, codigo | variable | Hugging Face |

La comparacion directa con alternativas especializadas en resampling de prompts no esta disponible: no se han identificado en la informacion proporcionada otros modelos publicos dedicados a esta tarea con los que contrastar parametros, contexto o rendimiento. Frente a un modelo generalista del mismo tamano, la diferencia principal es la especializacion: este ajuste esta optimizado para una unica tarea y no se ha evaluado su calidad en tareas generales.

## Limitaciones y advertencias

- Release Alpha: el propio autor advierte que el comportamiento puede no cumplir las expectativas y que el rendimiento puede degradarse con prompts de estructura no vista o prompts largos.
- Solo ingles: el modelo declara unicamente el idioma `en`; su uso en castellano no esta soportado ni evaluado.
- Riesgo de escenarios irreales: el autor documenta explicitamente la tendencia a generar situaciones fisicamente implausibles o cantidades irracionales, y recomienda anadir una instruccion de realismo al system prompt.
- Dependencia del system prompt: el modelo requiere el system prompt especifico del repositorio; su uso sin el puede degradar la calidad del resample.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de calidad de resampling, por lo que la evaluacion debe hacerse de forma empirica en el caso de uso concreto.
- Riesgo de alucinacion: inherente a un modelo de 2 B; en esta tarea se traduce en variaciones que pueden alterar la tarea original o introducir supuestos contradictorios.
- Sin cuantizaciones publicadas: el repositorio solo incluye safetensors; para GGUF o GPTQ habria que generarlas por cuenta propia.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones del modelo base y de los datos de entrenamiento.
- Capacidad multimodal no verificada: aunque las etiquetas del repo incluyen `image-text-to-text`, la model card no documenta ninguna funcionalidad de vision; no debe asumirse.
- Contexto limitado a 8.192 tokens: los prompts muy largos pueden degradar la calidad del resample.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- System prompt por defecto: https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K/blob/main/default_system_prompt.md
- Unsloth Studio: https://unsloth.ai
- vLLM: https://github.com/vllm-project/vllm

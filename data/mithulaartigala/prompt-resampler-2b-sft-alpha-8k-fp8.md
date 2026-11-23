# mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-FP8

## Resumen

Prompt-Resampler-2B-SFT-Alpha-8K-FP8 es un ajuste fino del modelo Qwen3.5-2B (variante instruct) desarrollado por el usuario mithulaartigala, orientado a una tarea muy concreta: el *prompt resampling* o remuestreo de instrucciones. Esta tecnica de aumento de datos genera variaciones de un prompt original preservando la tarea subyacente (cambiando nombres, cifras, lugares o escenarios) para producir pares de entrenamiento sinteticos. El modelo no es un asistente general, sino un generador especializado de variantes de prompts.

El checkpoint publicado es la edicion FP8 del modelo Alpha-8K: almacena 150 matrices de proyeccion de texto en formato E4M3FN con bloques de pesos de 128x128 y escalas FP32, mientras que embeddings, torre de vision, tensores MTP y pequenas proyecciones de compuerta de atencion lineal conservan su precision original. El modelo base aporta 2.274.069.824 parametros, una ventana de contexto de 8.192 tokens y capacidades multimodales (image-text-to-text) heredadas de Qwen3.5.

Su relevancia es acotada pero practica: ofrece una via reproducible para generar datasets de aumento de prompts con menos tokens de razonamiento y alta fiabilidad en prompts no JSON, algo util en pipelines de sintesis de datos. Se trata de una release Alpha, con el autor advirtiendo explicitamente de posibles fallos en prompts de estructura no vista o de longitud elevada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (image-text-to-text), con atencion lineal en algunas proyecciones y tensores MTP; fine-tune LoRA sobre el modelo base |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | FP8 E4M3FN con bloques 128x128 y escalas FP32 en 150 matrices de proyeccion de texto; embeddings, torre de vision, MTP y compuertas de atencion lineal en precision original |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B en su variante instruct y conserva la arquitectura nativa del base: un transformer multimodal con torre de vision, proyecciones de atencion lineal y tensores MTP (multi-token prediction). Sobre esa base se aplico un ajuste fino con LoRA de rango 16 y alpha 32, con una longitud de secuencia de 8.192 tokens, empleando Unsloth Studio como herramienta de entrenamiento. El dataset utilizado es mithulaartigala/prompt-resampling-alpaca-gsm8k, una mezcla de ejemplos estilo Alpaca y problemas GSM8K reformulados como tareas de remuestreo de prompts.

El objetivo declarado del entrenamiento es doble: mejorar la fiabilidad del remuestreo en prompts que no son JSON y reducir el numero de tokens dedicados al razonamiento, manteniendo el formato de chat nativo y las capacidades originales de Qwen3.5. La edicion FP8 introduce una cuantizacion selectiva: solo las 150 matrices de proyeccion de texto se almacenan en FP8, mientras que el resto de componentes criticos mantiene su precision, lo que reduce el peso del checkpoint sin degradar embeddings ni la torre de vision. No se documentan en la informacion disponible detalles sobre volumen total de tokens de entrenamiento, composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de variaciones de prompts preservando la tarea original (remuestreo de nombres, cifras, lugares y escenarios).
- Razonamiento orientado a la tarea con un presupuesto de tokens reducido respecto al modelo base, segun declara el autor.
- Manejo de prompts no JSON con alta fiabilidad, segun la model card.
- Conservacion del formato de chat nativo de Qwen3.5 (roles system/user/assistant).
- Capacidades multimodales heredadas del base (pipeline image-text-to-text), aunque el fine-tune se centra en texto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Aumento de datos para fine-tuning: generar variantes de un prompt semilla para ampliar un dataset de instrucciones sin perder la tarea original, usando el modelo como generador batch con el system prompt incluido en el repositorio.
- Creacion de benchmarks sinteticos: producir problemas matematicos estilo GSM8K con cifras y contextos alterados para evaluar la robustez de otros modelos frente a variaciones superficiales.
- Pruebas de robustez de sistemas de IA: alimentar pipelines de evaluacion con prompts reformulados que mantengan la misma respuesta esperada, detectando sobreajuste a plantillas concretas.
- Generacion de datasets de seguridad y red teaming: reescribir prompts de prueba cambiando entidades y escenarios para ampliar la cobertura de casos sin reescribir manualmente cada ejemplo.
- Sintesis de datos para dominios verticales: adaptar plantillas de atencion al cliente o soporte tecnico a nuevos productos y nombres de empresa manteniendo la estructura de la consulta.
- Prototipado de pipelines de aumento de datos en local: al ser un modelo de 2B en FP8, puede ejecutarse en una unica GPU consumer para experimentar con estrategias de remuestreo antes de escalar a modelos mayores.
- Investigacion sobre parafrasis controlada: estudiar como varian los modelos al reformular instrucciones preservando la intencion, con la ventaja de un checkpoint pequeno y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8, el checkpoint ocupa aproximadamente 3,2 GB en disco; con overhead de activaciones y cache KV para 8.192 tokens se estima un consumo en torno a 4-6 GB en GPU, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con soporte FP8 nativo (H100, L40S, A100 con conversiones) para maxima eficiencia; en GPUs Ampere o anteriores Transformers dequantiza a BF16 al cargar.
- GPU consumer: cabe en tarjetas con 8 GB o mas de VRAM en FP8/BF16, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070 o superiores; en CPU, Transformers dequantiza los pesos FP8 a BF16 en el momento de la carga.
- Opciones de despliegue: Transformers 5.24.0 con PyTorch y Accelerate, vLLM (`vllm serve ... --load-format safetensors --max-model-len 8192`), Unsloth Studio con API compatible con OpenAI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-2B-SFT-Alpha-8K-FP8 | 2,27B | 8.192 | Remuestreo de prompts (fine-tune) | Apache 2.0 | Hugging Face, vLLM, Unsloth Studio |
| Qwen3.5-2B (base) | ~2B | no disponible | Asistente general multimodal | no disponible en la informacion | Hugging Face (unsloth/Qwen3.5-2B) |
| Modelos generalistas de ~2-3B (p. ej. familias Llama o Gemma pequenas) | 2-3B | variable | Asistente general | variable | Hugging Face |

La comparacion directa con alternativas especializadas en remuestreo de prompts no esta disponible: no se han identificado en la informacion proporcionada otros checkpoints publicos dedicados a esta tarea con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Release Alpha: el autor advierte de que el comportamiento puede no cumplir expectativas en produccion.
- Rendimiento degradado en prompts con estructura no vista durante el entrenamiento o de longitud elevada.
- Entrenado y etiquetado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: al generar variantes, puede introducir cambios que alteren la tarea original o resolver incorrectamente la coherencia numerica en problemas matematicos.
- Ventana de contexto de 8.192 tokens: prompts mas largos requeriran truncado o segmentacion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-2B puede tener sus propias condiciones que conviene verificar antes de desplegar.
- Requiere el system prompt especifico incluido en el repositorio; sin el, la calidad del remuestreo puede caer significativamente.
- La cuantizacion FP8 selectiva puede introducir pequenas diferencias numericas frente al checkpoint original en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-FP8
- Checkpoint fuente (BF16): https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K/tree/85fa96e0784576bb5988f3d9a5e105321ab9695f
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/mithulaartigala/Prompt-Resampler-Mini
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B

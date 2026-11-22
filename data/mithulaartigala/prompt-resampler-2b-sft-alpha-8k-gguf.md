# mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-GGUF

## Resumen

Prompt-Resampler-2B-SFT-Alpha-8K-GGUF es la distribucion en formato GGUF del modelo Prompt-Resampler-2B-SFT-Alpha-8K, un fine-tune de Qwen3.5-2B (variante instruct) desarrollado por el usuario mithulaartigala. Su proposito no es el dialogo generalista, sino una tarea muy concreta: el *prompt resampling*, una tecnica de aumento de datos que genera variaciones de un enunciado preservando su tarea subyacente (cambiando nombres, cifras, escenarios o entidades, pero manteniendo la estructura logica del problema).

El modelo parte de una base de 1.942.653.248 parametros (~1,94 mil millones) y se ha afinado con LoRA (r=16, alpha=32) sobre una longitud de secuencia de 8.192 tokens, utilizando la herramienta Unsloth Studio y el dataset `mithulaartigala/prompt-resampling-alpaca-gsm8k`. Segun el autor, el entrenamiento busca reducir el consumo de tokens de razonamiento manteniendo una alta fiabilidad en el resampleo de prompts no JSON, y conserva el formato de chat nativo y las capacidades originales de Qwen3.5.

La relevancia actual radica en su nicho: la generacion sintetica de variantes de prompts es util para pipelines de evaluacion, aumento de datasets y pruebas de robustez en sistemas LLM. Al publicarse en GGUF y con licencia Apache 2.0, puede desplegarse localmente en hardware de consumo. Se trata, no obstante, de una version Alpha y el propio autor advierte de un rendimiento potencialmente pobre ante prompts de estructura no vista o de gran longitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B instruct), fine-tune con LoRA r=16, alpha=32 |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento); maxima del modelo base no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |
| Modelo base | mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K (a su vez basado en Qwen3.5-2B IT) |
| Dataset de entrenamiento | mithulaartigala/prompt-resampling-alpaca-gsm8k |
| Tamano del repositorio | 18,4 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B en su variante instruct: un transformer decoder-only con atencion causal estandar y tokenizador propio de la familia Qwen. Sobre esa base se aplico un fine-tune con LoRA de rango 16 y alpha 32, entrenado con una longitud de secuencia de 8.192 tokens. El autor indica que el ajuste se realizo con Unsloth Studio y que se preservaron tanto el formato de chat nativo como las capacidades originales del modelo base.

El dataset de entrenamiento (`prompt-resampling-alpaca-gsm8k`) combina, por su nombre, ejemplos de estilo Alpaca con problemas de tipo GSM8K, lo que sugiere un enfasis en la generacion de variantes de problemas aritmeticos y de enunciados estructurados. El objetivo declarado del entrenamiento es doble: mejorar la fiabilidad del resampleo de prompts no JSON y reducir el numero de tokens dedicados al razonamiento. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de variantes de un prompt preservando la tarea original (resampleo de enunciados).
- Modificacion controlada de variables: nombres, cifras, lugares, escenarios y entidades, manteniendo la coherencia contextual del problema.
- Razonamiento aritmetico basico orientado a problemas tipo GSM8K, heredado del dataset de entrenamiento.
- Generacion de texto general y conversacion multi-turno, al conservar el formato de chat nativo de Qwen3.5.
- Reduccion del consumo de tokens de razonamiento respecto al modelo base, segun el autor.
- Capacidad de operar con prompts largos hasta 8.192 tokens (longitud de entrenamiento).
- Soporte de plantilla de chat (`apply_chat_template`) con roles system/user/assistant.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Aumento de datasets de evaluacion: dado un conjunto de problemas (por ejemplo, GSM8K), el modelo genera variantes con cifras y contextos distintos para ampliar la cobertura de un benchmark sin cambiar la tarea evaluada.
- Pruebas de robustez de sistemas LLM: se introducen resamples de un mismo prompt para comprobar si un modelo downstream mantiene la respuesta correcta ante cambios superficiales, detectando sobreajuste a plantillas.
- Generacion de ejercicios educativos: a partir de un problema plantilla de matematicas, producir versiones con nuevos nombres, precios o escenarios para crear hojas de practica personalizadas.
- Creacion de datos sinteticos para fine-tuning: multiplicar ejemplos de un dataset pequeno generando variantes que preserven la distribucion de tareas, reduciendo coste de anotacion manual.
- Red teaming y evaluacion de sesgos: resamplear prompts cambiando nombres o contextos culturales para observar como varian las respuestas de un sistema en produccion.
- Automatizacion de QA de prompts: integrar el modelo en un pipeline que, antes de desplegar un prompt en produccion, genere variantes y verifique que las respuestas del sistema son consistentes.
- Prototipado local en estaciones de trabajo: al estar en GGUF y con ~1,94 B parametros, puede ejecutarse en LM Studio o Unsloth Studio para iterar rapidamente sobre plantillas de resampleo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~1,94 B parametros, las cuantizaciones GGUF habituales (Q4, Q5, Q8) suelen situarse en rangos de aproximadamente 1,5 a 2,5 GB, aunque el repositorio no detalla las variantes incluidas.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPUs de consumo; una RTX 3060 de 12 GB o superior seria suficiente en la mayoria de cuantizaciones.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 6-8 GB o mas, segun la cuantizacion elegida (dato no confirmado oficialmente).
- Opciones de despliegue documentadas: Unsloth Studio (puerto 8888), LM Studio (puerto 1234), vLLM (con `--max-model-len 8192`) y Hugging Face Transformers (`AutoModelForCausalLM`, `device_map="auto"`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-2B-SFT-Alpha-8K-GGUF | ~1,94 B | 8.192 | Resampleo de prompts (fine-tune) | Apache 2.0 | GGUF en HF |
| Qwen3.5-2B (IT) | ~2 B | no disponible | Modelo generalista instruct | no disponible | HF |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | Modelo generalista instruct | Apache 2.0 | HF |
| Llama-3.2-1B-Instruct | ~1,2 B | 128.000 | Modelo generalista instruct | Llama 3.2 Community | HF |

La comparacion directa con modelos generalistas es limitada: el Prompt-Resampler esta especializado en una unica tarea y no compite en benchmarks generales. Frente a Qwen3.5-2B base, la diferencia es el fine-tune LoRA para resampleo; frente a alternativas como Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct, la ventaja es la especializacion y el formato GGUF listo para uso local, mientras que la desventaja es la falta de benchmark publicos y su condicion de Alpha.

## Limitaciones y advertencias

- Version Alpha: el autor advierte explicitamente de que ciertos comportamientos pueden no cumplir las expectativas.
- Rendimiento potencialmente pobre ante prompts de estructura no vista o de gran longitud.
- Solo soporta ingles de forma declarada; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion y de deriva semantica: al modificar variables, el resample puede alterar la tarea original o introducir incoherencias en el escenario.
- No se documentan resultados de benchmarks, por lo que no hay evidencia cuantitativa de fiabilidad.
- Ventana de contexto limitada a 8.192 tokens en entrenamiento; prompts mas largos pueden degradar la calidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado como backend de agentes.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de la licencia del modelo base original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-GGUF
- Modelo base (safetensors): https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- Unsloth Studio: no disponible en la informacion proporcionada (herramienta citada por el autor)
- Paper o blog tecnico: no disponible en la informacion proporcionada

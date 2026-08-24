# maro-aigent/dama-aibrain

## Resumen

dama-aibrain es un modelo de lenguaje multimodal (image-text-to-text) publicado por el usuario maro-aigent, finetuneado a partir del modelo base unsloth/gemma-4-e2b-it-unsloth-bnb-4bit, una version cuantizada en 4 bits del modelo Gemma 4 de Google preparada por Unsloth para entrenamiento eficiente. El modelo se distribuye bajo licencia Apache 2.0 y esta orientado a conversacion en ingles.

Se trata de un finetune reciente (publicado en agosto de 2026) con cero descargas y cero likes, lo que indica que es un experimento personal o un modelo en fase inicial de publicacion. El entrenamiento se realizo con la libreria Unsloth y el kit de herramientas TRL de Hugging Face, lo que permite un entrenamiento aproximadamente 2 veces mas rapido que un flujo estandar. Su relevancia radica en ser un ejemplo de finetune multimodal sobre la arquitectura Gemma 4, aunque la informacion publica disponible es minima y no permite una evaluacion tecnica exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (basada en transformer multimodal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bnb 4-bit (base) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo base), formato de finetune no especificado |

## Arquitectura y entrenamiento

El modelo base es unsloth/gemma-4-e2b-it-unsloth-bnb-4bit, que corresponde a la variante de 2 mil millones de parametros de la familia Gemma 4 de Google, cuantizada en 4 bits mediante bitsandbytes y optimizada con Unsloth para acelerar el entrenamiento. La arquitectura de Gemma 4 es un transformer multimodal que acepta tanto texto como imagenes como entrada, aunque la model card no especifica si el finetune conserva las capacidades de vision del modelo base.

El proceso de entrenamiento se llevo a cabo con Unsloth y la biblioteca TRL de Hugging Face, lo que permite un entrenamiento aproximadamente 2 veces mas rapido que un flujo convencional. No se proporcionan detalles sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. El modelo se publica como un finetune conversacional (tag "conversational") orientado a tareas de chat en ingles.

## Capacidades

- Generacion de texto conversacional en ingles.
- Entrada multimodal (texto e imagen) heredada de Gemma 4, aunque no se verifica si el finetune mantiene estas capacidades.
- Inferencia compatible con text-generation-inference y transformers.
- Optimizado para entrenamiento rapido con Unsloth, no para inferencia especifica.

No se dispone de informacion sobre soporte de tool calling, funciones de agente, razonamiento multi-paso ni capacidades especiales como thinking mode o audio.

## Casos de uso

Dada la escasez de informacion publica sobre este modelo, los casos de uso se infieren de su arquitectura base (Gemma 4 de 2B) y de su naturaleza conversacional:

- **Prototipado rapido de chatbots**: por su tamano reducido (2B), puede desplegarse en entornos de desarrollo para validar flujos conversacionales antes de escalar a modelos mayores.
- **Asistentes de texto en ingles**: adecuado para aplicaciones sencillas de chat, preguntas frecuentes o redaccion asistida, siempre que no se requiera alta precision en tareas complejas.
- **Experimentacion academica**: sirve como ejemplo de finetune multimodal con Unsloth, util para estudiar el proceso de adaptacion de Gemma 4 a dominios especificos.
- **Clasificacion de imagenes con descripcion textual**: si conserva la vision de Gemma 4, podria usarse para generar descripciones de imagenes en ingles, aunque no se ha validado.
- **Sistemas de generacion de texto en entornos con recursos limitados**: al ser un modelo de 2B cuantizado a 4 bits, cabe en GPUs de consumo y puede ejecutarse en local.
- **Evaluacion de modelos**: se puede usar como linea base para comparar el efecto del finetune frente al modelo base en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 2B cuantizado en 4 bits, el peso aproximado es de 1,5 GB, por lo que cabe en GPUs con 4 GB de VRAM o mas.
- GPU recomendadas: NVIDIA GTX 1660 (6 GB), RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- Compatible con GPU de consumo, incluida la serie RTX 30/40.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp u Ollama (si se convierte a GGUF).
- Latencia y throughput estimados: no disponibles, pero para un modelo de 2B en 4 bits se esperan tiempos de respuesta de entre 10 y 50 tokens por segundo en una GPU moderna de consumo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con alternativas. El modelo base Gemma 4 de 2B se puede comparar con otros modelos de tamano similar como Llama 3.2 1B o Qwen 2.5 1.5B, pero los datos del finetune no permiten una comparacion fiable.

## Limitaciones y advertencias

- **Datos de entrenamiento desconocidos**: no se especifica el dataset ni el proceso de alineacion, por lo que no se puede evaluar la calidad ni los sesgos.
- **Riesgo de alucinacion**: sin evaluaciones publicas, no se puede garantizar la fiabilidad de las respuestas en entornos de produccion.
- **Idioma limitado**: solo se declara soporte para ingles; el rendimiento en otros idiomas no ha sido evaluado.
- **Modelo sin validacion**: cero descargas y cero likes indican que no hay una comunidad que haya probado el modelo.
- **Capacidades multimodales no verificadas**: aunque el modelo base es multimodal, no se ha confirmado que el finetune conserve la vision.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario debe responsabilizarse de los datos de entrenamiento y del cumplimiento de las condiciones del modelo base (Gemma 4).
- **Obsolescencia**: el modelo se publico en agosto de 2026, pero sin mantenimiento ni documentacion adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maro-aigent/dama-aibrain)
- [Perfil del autor](https://huggingface.co/maro-aigent)
- [Modelo base](https://huggingface.co/unsloth/gemma-4-e2b-it-unsloth-bnb-4bit)
- [Unsloth](https://github.com/unslothai/unsloth)

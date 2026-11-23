# distil-labs/Qwen3.5-4B-flexible-chat-template

## Resumen

Qwen3.5-4B-flexible-chat-template es una variante del modelo Qwen/Qwen3.5-4B publicada por distil-labs en la que se modifica unicamente la plantilla de chat. La diferencia respecto al modelo original es que permite renderizar mensajes de sistema que no ocupan la primera posicion de la conversacion, en lugar de lanzar una excepcion como hace la plantilla estandar de Qwen. Los pesos, el tokenizador y el resto de la plantilla son identicos a los del modelo base.

El modelo hereda la arquitectura multimodal de Qwen3.5-4B (pipeline image-text-to-text) con aproximadamente 4.660 millones de parametros, y esta pensado para escenarios de ajuste fino (fine-tuning) sobre conversaciones de agente en las que se inyectan mensajes de sistema a mitad de la conversacion. Es relevante para quienes entrenan estudiantes destilados o agentes conversacionales que necesitan modificar instrucciones del sistema de forma dinamica sin reiniciar el contexto.

La licencia es Apache 2.0, la misma que el modelo original, y se distribuye en formato safetensors compatible con transformers. No se han publicado datos de idiomas soportados ni resultados de benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-4B; pipeline image-text-to-text) |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; el repositorio es una copia de los pesos de Qwen/Qwen3.5-4B con una unica modificacion en la plantilla de chat (`chat_template.jinja` y la misma plantilla en `tokenizer_config.json`). El cambio consiste en sustituir la excepcion `System message must be at the beginning.` por la renderizacion in situ del mensaje de sistema con los tokens `<|im_start|>system\n...<|im_end|>`. El resto de la plantilla, el tokenizador y los pesos son identicos al modelo base, por lo que el modo de razonamiento (`enable_thinking`) funciona igual que en el original.

No se proporcionan datos sobre el corpus de entrenamiento del modelo base ni sobre procesos de RLHF o DPO. El autor indica que esta variante se utiliza para ajustar estudiantes sobre conversaciones de agente que anaden mensajes de sistema durante la conversacion, lo que sugiere un uso orientado a fine-tuning mas que a inferencia directa.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), segun la etiqueta del repositorio.
- Modo de razonamiento (`enable_thinking`) compatible con el modelo original.
- Renderizado de mensajes de sistema en cualquier posicion de la conversacion, incluida la insercion a mitad de turno.
- Capacidad de servir como base para fine-tuning de estudiantes en escenarios de agente.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada (se heredaria del modelo base, pero no se detalla).

## Casos de uso

- Fine-tuning de estudiantes para agentes conversacionales: el modelo permite entrenar sobre trayectorias en las que se inyectan mensajes de sistema durante la conversacion, algo que la plantilla original rechaza con una excepcion.
- Simulacion de cambios de politica en tiempo de inferencia: util para evaluar como responde un agente cuando recibe nuevas instrucciones de sistema a mitad de una sesion sin reiniciar el contexto.
- Generacion de datos sinteticos de dialogo: sirve para producir conversaciones de agente con instrucciones de sistema intercaladas que luego se usan como corpus de entrenamiento.
- Investigacion en destilacion: al ser una variante del modelo base con pesos identicos, facilita comparar el efecto de la plantilla frente al original en experimentos controlados.
- Evaluacion de robustez ante instrucciones dinamicas: permite estudiar como afecta la posicion del mensaje de sistema al comportamiento del modelo.
- Prototipado de asistentes multimodales: al heredar el pipeline image-text-to-text, puede emplearse en experimentos que combinan imagen y texto con instrucciones de sistema variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina de Qwen/Qwen3.5-4B para benchmarks y uso, pero no incluye cifras propias.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 9,3 GB solo para pesos, mas memoria para el contexto y activaciones; en la practica se recomienda al menos 12-16 GB.
- El tamano del repositorio es de 9,3 GB, coherente con pesos en safetensors de ~4,66 mil millones de parametros.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabria en GPUs consumer de gama alta con VRAM suficiente, aunque no se confirma en la model card.
- Opciones de despliegue: transformers (libreria indicada); otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| distil-labs/Qwen3.5-4B-flexible-chat-template | ~4,66 mil millones | no disponible | Apache 2.0 | Variante de Qwen3.5-4B con plantilla de chat modificada |
| Qwen/Qwen3.5-4B | no disponible (modelo base) | no disponible | Apache 2.0 | Modelo original; rechaza mensajes de sistema no iniciales |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | No se dispone de datos para comparar |

## Limitaciones y advertencias

- La unica diferencia respecto al modelo base es la plantilla de chat; cualquier limitacion, sesgo o riesgo de alucinacion de Qwen3.5-4B se hereda sin cambios.
- No se han publicado datos sobre sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor.
- El modelo esta pensado principalmente para fine-tuning; su uso directo en produccion no se documenta.
- La modificacion de la plantilla puede alterar el comportamiento esperado del modelo base en conversaciones con mensajes de sistema intercalados, por lo que se recomienda validar en el dominio de aplicacion.
- No se especifican tipos de cuantizacion ni formatos alternativos a safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/distil-labs/Qwen3.5-4B-flexible-chat-template
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE

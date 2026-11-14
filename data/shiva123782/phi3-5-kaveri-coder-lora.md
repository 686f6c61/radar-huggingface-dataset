# shiva123782/Phi3.5-Kaveri-Coder-lora

## Resumen

Phi3.5-Kaveri-Coder-lora es un adaptador LoRA (PEFT) publicado por el usuario shiva123782 bajo la organizacion Shiva Technologies, construido sobre el modelo base microsoft/Phi-3.5-mini-instruct. Su proposito es especializar el modelo base como asistente de programacion mediante un ajuste fino supervisado sobre el dataset iamtarun/python_code_instructions_18k_alpaca, un conjunto de aproximadamente 18.000 instrucciones de codigo en Python en formato Alpaca. El adaptador se entreno y desplego a traves de la plataforma Kaveri Studio, segun indica la propia model card.

El modelo hereda la arquitectura y el tamano del Phi-3.5-mini-instruct original (un transformer decoder-only de aproximadamente 3.800 millones de parametros), pero el repositorio publicado contiene unicamente los pesos del adaptador LoRA, no los pesos fusionados. Esto implica que para utilizarlo es necesario descargar el modelo base y aplicar el adaptador mediante la libreria peft. La licencia declarada es MIT, lo que facilita su uso comercial, aunque conviene revisar las condiciones del modelo base.

La relevancia de esta ficha es limitada en terminos de impacto: se trata de un adaptador con muy poca traccion (13 descargas y 1 like en el momento de la consulta), sin benchmarks publicados ni documentacion tecnica detallada sobre hiperparametros de entrenamiento. Resulta util como ejemplo de flujo de trabajo de ajuste fino ligero sobre hardware consumer (2x NVIDIA T4 de 16 GB) y como punto de partida para quien quiera reproducir o extender la receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5-mini-instruct) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA no declara su numero de parametros; el modelo base Phi-3.5-mini-instruct tiene aproximadamente 3.800 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Phi-3.5-mini-instruct soporta 128.000 tokens, dato no confirmado para este adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en el formato propio de PEFT; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Adaptador LoRA en formato PEFT (safetensors/bin segun el repositorio); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre microsoft/Phi-3.5-mini-instruct, un transformer decoder-only denso de la familia Phi-3.5. El ajuste fino se realizo con LoRA (Low-Rank Adaptation) mediante PEFT, lo que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas capas. La model card no especifica el rango (r), el alpha, el dropout, las capas objetivo ni la tasa de aprendizaje empleados.

El entrenamiento se llevo a cabo sobre el dataset iamtarun/python_code_instructions_18k_alpaca, compuesto por instrucciones y respuestas de programacion en Python en formato Alpaca. No se documenta el numero de epochs, el numero de tokens procesados, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. El autor indica que el entrenamiento se ejecuto en 2x NVIDIA T4 (16 GB de VRAM) del tier gratuito de Kaggle y que el despliegue se realizo a traves de la interfaz E2E de Kaveri Studio. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y codigo en Python, especializada mediante ajuste fino sobre instrucciones de programacion.
- Respuesta a instrucciones conversacionales en formato chat (hereda la plantilla de chat de Phi-3.5-mini-instruct y el rol de sistema).
- Razonamiento basico sobre problemas de programacion (funciones, algoritmos, estructuras de datos) segun el dataset de entrenamiento.
- Soporte de plantilla de chat mediante `tokenizer.apply_chat_template`, con mensajes de rol system, user y assistant.
- Capacidades multilingues: no documentadas para el adaptador; las del modelo base no se confirman en la informacion disponible.
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de programacion en Python para entornos de desarrollo: el adaptador responde a instrucciones en formato chat y genera funciones o fragmentos de codigo, adecuado para autocompletado o generacion de snippets en editores.
- Generacion de funciones auxiliares y utilidades: gracias al entrenamiento sobre instrucciones de codigo, puede producir implementaciones de algoritmos comunes (por ejemplo, criba de Eratostenes para numeros primos) a partir de una descripcion en lenguaje natural.
- Prototipado rapido en notebooks: al requerir solo un adaptador ligero sobre un modelo de ~3.800 millones de parametros, puede ejecutarse en GPUs consumer y usarse para experimentar con asistentes de codigo en Google Colab o Kaggle.
- Educacion y aprendizaje de programacion: puede generar explicaciones y ejemplos de codigo a partir de enunciados, util en entornos docentes donde se requiere un asistente local y de bajo coste.
- Base para experimentos de ajuste fino: sirve como referencia reproducible para quienes quieran aplicar LoRA sobre Phi-3.5-mini-instruct con PEFT y comparar recetas de entrenamiento.
- Integracion en pipelines de generacion de codigo con plantilla de chat: el uso de `apply_chat_template` permite incorporarlo en servicios de inferencia que gestionan conversaciones con rol de sistema personalizado.
- Evaluacion de tecnicas de despliegue ligero: util para probar flujos de carga de modelo base mas adaptador con transformers y peft en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de pequeno tamano; el requisito dominante es el modelo base Phi-3.5-mini-instruct, que en fp16 ocupa aproximadamente 7,6 GB y en cuantizacion de 4 bits alrededor de 2-3 GB (estimacion basada en el tamano del modelo base, no confirmada para este adaptador).
- GPU recomendadas: el autor indica que el entrenamiento se realizo en 2x NVIDIA T4 (16 GB); para inferencia basta una unica GPU con al menos 8 GB en fp16 o 4-6 GB en cuantizacion de 4 bits.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) en fp16; en GPUs de 8 GB seria recomendable cuantizar el modelo base.
- Opciones de despliegue: transformers + peft (flujo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador, aunque podrian aplicarse fusionando el adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi3.5-Kaveri-Coder-lora | Adaptador LoRA sobre ~3.800 M (base) | No disponible | MIT | PEFT (adaptador) | Especializado en codigo Python; sin benchmarks publicados |
| microsoft/Phi-3.5-mini-instruct | ~3.800 M | 128.000 tokens (segun documentacion del modelo base) | MIT | Safetensors | Modelo base generalista; referencia directa |
| Adaptadores de codigo sobre Phi-3.5-mini | Variable | No disponible | Variable | PEFT | Existen multiples adaptadores comunitarios; no se dispone de datos comparativos verificados |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas, al no haberse publicado benchmarks de este adaptador.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que el rendimiento real frente al modelo base es desconocido.
- El adaptador esta entrenado unicamente sobre un dataset de instrucciones de codigo en Python (aproximadamente 18.000 ejemplos), lo que puede degradar capacidades generales del modelo base y limitar su uso fuera de Python.
- Riesgo de alucinacion inherente a los modelos de lenguaje pequenos, especialmente en codigo no representado en el dataset de entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- No se especifican los idiomas soportados; el dataset de entrenamiento parece orientado al ingles.
- La licencia declarada es MIT, pero el uso comercial debe considerar tambien la licencia del modelo base (microsoft/Phi-3.5-mini-instruct, tambien MIT segun la informacion disponible).
- El repositorio contiene solo el adaptador: es imprescindible descargar el modelo base, lo que anade dependencia y coste de almacenamiento.
- El ejemplo de inferencia de la model card tiene la linea de carga del adaptador comentada, lo que puede inducir a error si se copia literalmente.
- Sin garantias de mantenimiento: el repositorio tiene muy poca actividad (13 descargas, 1 like) y no se documenta soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/Phi3.5-Kaveri-Coder-lora
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Libreria PEFT: https://github.com/huggingface/peft
- Plataforma Kaveri Studio: no disponible (no se proporciona URL en la informacion)

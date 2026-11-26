# lolekonnek/narwik-bielik-1.5b-lora

## Resumen

Narwik – Bielik 1.5B LoRA es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base speakleash/Bielik-1.5B-v3.0-Instruct, un modelo instructivo en polaco desarrollado por el proyecto SpeakLeash. El adaptador lo publica el usuario lolekonnek bajo licencia Apache 2.0 y está orientado a un uso muy concreto: actuar como asistente informativo del proyecto Narwik, descrito en la model card como un asistente informativo escolar.

El artefacto no es un modelo completo, sino un conjunto de pesos de adaptación de rango 64, el máximo que admite la configuración de vLLM según indica el autor. Los pesos se distribuyen en formato SafeTensors y se cargan sobre el modelo base mediante la librería PEFT, con instrucciones específicas para su despliegue en vLLM con `--enable-lora` y `--max-lora-rank 64`.

La relevancia de esta ficha es limitada en términos de ecosistema general: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin datos publicados de evaluación, idiomas o benchmarks. Su interés principal radica en ser un ejemplo de adaptación ligera de un modelo instructivo polaco de 1.500 millones de parámetros para una tarea acotada y desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (modelo base Bielik-1.5B-v3.0-Instruct); rango 64 |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base es de 1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en SafeTensors; la cuantizacion dependeria del modelo base y del runtime) |
| Idiomas soportados | no disponible en la informacion proporcionada; la model card indica que el modelo base es polaco (`polish`) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 sobre speakleash/Bielik-1.5B-v3.0-Instruct. La model card no detalla la arquitectura interna del modelo base más allá de su naturaleza instructiva, ni especifica qué módulos lineales se adaptan, el valor de alpha, el dropout ni la configuración exacta de entrenamiento. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT adicionales sobre el adaptador.

La única innovación técnica explícita es la elección del rango 64, que el autor presenta como la configuración máxima soportada por vLLM para LoRA. El adaptador está empaquetado con la librería PEFT y pensado para servirse junto al modelo base en vLLM mediante `--enable-lora`, lo que permite atender el adaptador como un módulo LoRA adicional sin duplicar los pesos del modelo base en memoria.

## Capacidades

- Generación de texto instructivo heredada del modelo base Bielik-1.5B-v3.0-Instruct, orientada a respuestas conversacionales.
- Asistente informativo para el proyecto Narwik, según la descripción del autor (asistente informativo escolar).
- Soporte de despliegue como módulo LoRA en vLLM mediante `--enable-lora` y `--max-lora-rank 64`.
- Compatibilidad con el ecosistema PEFT para carga del adaptador sobre el modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada; la model card etiqueta el adaptador con `polish`, lo que sugiere uso principal en polaco.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente informativo escolar: el adaptador se entrenó específicamente para el proyecto Narwik, por lo que su uso previsto es responder consultas informativas en el contexto de un centro educativo, cargado sobre Bielik-1.5B-v3.0-Instruct en vLLM.
- Despliegue multi-adaptador en vLLM: al ser un LoRA de rango 64, puede servirse junto al modelo base y combinarse con otros adaptadores en el mismo servidor, aprovechando la carga dinámica de módulos LoRA.
- Prototipado rápido de asistentes de dominio: al no requerir reentrenar el modelo base completo, permite iterar sobre un asistente temático con coste de almacenamiento y entrenamiento reducido.
- Experimentación académica con PEFT: sirve como ejemplo práctico de adaptación de un modelo instructivo polaco de 1.5B para investigadores que estudien ajuste eficiente de parámetros.
- Servicio de bajo coste en hardware modesto: el modelo base de 1.5B es ligero, de modo que el adaptador puede servirse en GPUs de consumo, aunque no se publican cifras de latencia ni throughput.
- Base para evaluación de adaptadores de nicho: útil para comparar el comportamiento de un LoRA específico frente al modelo base sin adaptar en tareas informativas acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Bielik-1.5B-v3.0-Instruct y de la cuantización elegida. Como referencia orientativa, un modelo de 1.5B en FP16 requiere aproximadamente 3 GB solo para pesos, más overhead de KV cache y runtime; en cuantizaciones de 8 o 4 bits el requisito baja notablemente, pero no se confirma en la documentación del autor.
- GPU recomendadas: no disponible. El autor solo documenta el despliegue en vLLM, sin especificar GPU.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por el tamaño del modelo base (1.5B) es plausible en GPUs consumer, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 64 --lora-modules narwik=TWOJ_LOGIN/narwik-bielik-1.5b-lora`. Otras opciones (llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Narwik – Bielik 1.5B LoRA | Adaptador LoRA (rango 64) sobre Bielik-1.5B-v3.0-Instruct | no disponible (base 1.5B) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| speakleash/Bielik-1.5B-v3.0-Instruct | Modelo completo instructivo (polaco) | 1.5B | no disponible | no disponible en esta ficha | Hugging Face (modelo base) |
| Adaptadores LoRA genéricos sobre modelos de 1-2B | Adaptador LoRA | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el modelo base speakleash/Bielik-1.5B-v3.0-Instruct para funcionar.
- No se han publicado evaluaciones, benchmarks ni métricas de calidad; el rendimiento real es desconocido.
- La model card está redactada en polaco y no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas más allá de la etiqueta `polish`.
- El uso previsto declarado es muy acotado (asistente informativo del proyecto Narwik); su comportamiento fuera de ese dominio no está validado.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y condiciones del modelo base antes de un uso comercial en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El repositorio tiene un tamaño de 0.0 GB según los metadatos, lo que puede indicar que los pesos no están efectivamente alojados o que la información de tamaño no está actualizada; verificar antes de desplegar.
- No se documentan requisitos de hardware, latencia ni throughput, por lo que la planificación de producción requiere pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/lolekonnek/narwik-bielik-1.5b-lora
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Proyecto SpeakLeash (organización en Hugging Face): https://huggingface.co/speakleash
- Librería PEFT: https://github.com/huggingface/peft
- vLLM (documentación de LoRA): https://docs.vllm.ai/en/latest/features/lora.html

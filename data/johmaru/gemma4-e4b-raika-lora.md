# johmaru/gemma4-e4b-raika-lora

## Resumen

Gemma 4 E4B Raika LoRA es un adaptador LoRA (PEFT) publicado por el usuario johmaru sobre el modelo base Gemma 4 en su variante E4B. Su propósito es especializar el modelo en diálogo multi-turno en japonés con una persona estilísticamente consistente, orientada a roleplay. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de 0,2 GB que debe cargarse junto con el checkpoint base de Gemma 4 E4B.

El interés técnico del adaptador reside en su pipeline de generación de datos: el autor describe un proceso de segmentación de diálogos contiguos, detección de huecos en los turnos del interlocutor, aumento de datos mediante retrotraducción condicionada al turno objetivo (target-locked back-translation), verificación automática de coincidencia literal al 100 % en los turnos del asistente y aislamiento estricto del conjunto de evaluación. El entrenamiento se realizó con Unsloth/PEFT aplicando máscara de pérdida solo sobre los tokens de respuesta.

La información publicada es muy limitada: no hay resultados de benchmarks, no se especifica licencia, no se detalla el volumen de datos ni la composición exacta del dataset (retenido por derechos de autor del texto fuente), y el repositorio no registra descargas ni interacciones. Es relevante como ejemplo de adaptación de bajo coste para control estilístico en una lengua distinta del inglés, pero su evaluación en producción requiere pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B; r=16, lora_alpha=32, módulos de atención y proyecciones MLP |
| Parámetros totales | no disponible (adaptador de 0,2 GB; el modelo base no se detalla) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 4 E4B, no especificada en la ficha) |
| Tipos de cuantización | no disponible (los pesos del adaptador se distribuyen en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 4 E4B, un transformer del que la ficha no aporta detalles adicionales de arquitectura, tamaño ni ventana de contexto. El LoRA emplea rango 16 y alpha 32, con actualizaciones dirigidas a las proyecciones de atención y MLP. El entrenamiento se ejecutó con Unsloth y PEFT usando `train_on_responses_only`, de modo que la pérdida se calcula únicamente sobre los tokens del turno del asistente y no sobre los del usuario.

El pipeline de datos es el elemento diferencial. Primero se extraen secuencias multi-turno con alternancia estricta, filtrando ruido no verbal y monólogos internos, y se detectan huecos donde falta el turno previo del interlocutor. Después se reconstruyen esos turnos `user` ausentes mediante retrotraducción condicionada al enunciado objetivo real, generando prompts diversos que aproximadamente duplican la cobertura de entrenamiento. Se impone una verificación de coincidencia literal del 100 % de cada turno `assistant` sintético contra el enunciado de referencia, se rechaza cualquier muestra aumentada que solape con el conjunto de evaluación y se deduplica. No se documentan número de tokens, tamaño del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de diálogo multi-turno en japonés con estilo de personaje consistente (roleplay).
- Mantenimiento de la persona y del registro estilístico a lo largo de la conversación, gracias al entrenamiento sobre turnos alternos contiguos.
- Reconstrucción implícita de contexto conversacional: el pipeline de aumento entrena al modelo con prompts que preceden de forma natural a la respuesta objetivo.
- Especialización en japonés; no se declara soporte para otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Al ser un adaptador PEFT, conserva las capacidades generales del modelo base Gemma 4 E4B en la medida en que el fine-tuning no las degrade, pero esto no está verificado en la ficha.

## Casos de uso

- Personajes conversacionales en japonés para aplicaciones de entretenimiento: el adaptador mantiene un estilo de personaje estable en conversaciones de varios turnos, que es exactamente el régimen sobre el que se entrenó.
- Prototipado de chatbots de rol en japonés: al ocupar 0,2 GB, permite iterar sobre el modelo base sin reentrenar ni duplicar el checkpoint completo.
- Investigación sobre control estilístico con datos sintéticos: sirve como referencia reproducible de un pipeline de retrotraducción con verificación literal y aislamiento de evaluación.
- Evaluación de técnicas de aumento de datos para lenguas de bajos recursos: el método de reconstrucción de turnos ausentes es aplicable a otros corpus dialógicos pequeños.
- Sistemas de práctica de conversación en japonés con un registro fijo y controlado, siempre que se valide la calidad con evaluadores nativos.
- Base para experimentos de mezcla de adaptadores (LoRA merging o adapters múltiples) sobre Gemma 4 E4B en despliegues con vLLM o TGI que soporten PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; depende del modelo base Gemma 4 E4B y de su cuantización. El adaptador en sí ocupa 0,2 GB en disco.
- GPU recomendadas: no disponible. La viabilidad depende del checkpoint base; con cuantización de 4 bits un modelo de la clase E4B suele ser desplegable en GPUs de consumo, pero no hay confirmación en la ficha.
- Compatibilidad con GPU de consumo: no confirmada; requiere verificar los requisitos del modelo base.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el modelo base), vLLM y TGI si la versión instalada soporta adaptadores LoRA para Gemma 4; llama.cpp y Ollama requerirían fusión previa del adaptador en los pesos base y conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Datos públicos |
|---|---|---|---|---|---|---|
| johmaru/gemma4-e4b-raika-lora | LoRA sobre Gemma 4 E4B | no disponible (adaptador 0,2 GB) | no disponible | ja | no disponible | Sin benchmarks ni dataset |
| Modelo base Gemma 4 E4B | Modelo completo | no disponible en la ficha | no disponible | no disponible | no disponible | No aplica |
| Otros LoRA de rol en japonés sobre Gemma | Adaptadores PEFT | variable | heredado del base | ja | variable | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- No hay benchmarks ni evaluación cuantitativa publicada; el rendimiento real es desconocido.
- Licencia no especificada: no se puede asumir uso comercial permitido. Además, la licencia del adaptador no puede ser más permisiva que la del modelo base Gemma 4, que debe verificarse por separado.
- El dataset de entrenamiento no se publica por derechos de autor del texto fuente, lo que impide auditar la composición, los sesgos y la cobertura.
- Entrenado exclusivamente para japonés; el comportamiento en otros idiomas no está caracterizado y puede degradarse respecto al modelo base.
- Riesgo de alucinación y de deriva estilística fuera del dominio de roleplay; el pipeline mitiga la deriva en los datos sintéticos, pero no garantiza robustez en producción.
- El formato de diálogo esperado (plantilla de chat de Gemma 4 y estructura de turnos user/assistant) debe respetarse estrictamente; desviaciones pueden romper la consistencia de la persona.
- Sin descargas ni validación comunitaria: no hay evidencia de terceros sobre su calidad.
- El ajuste fino puede haber reducido capacidades generales del modelo base (conocimiento factual, instrucciones técnicas); conviene evaluar antes de usarlo en tareas ajenas al rol.

## Enlaces

- Hugging Face: https://huggingface.co/johmaru/gemma4-e4b-raika-lora
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.

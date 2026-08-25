# Echoo113/Olmo-3-7B-Instruct-immigration_mlpB-STEER0.198438-ft4.44

## Resumen

Este modelo es un fine-tuning del modelo base `allenai/Olmo-3-7B-Instruct` de AI2 (Allen Institute for AI), realizado por el usuario Echoo113. El nombre del repositorio sugiere que el ajuste se ha realizado con un enfoque de STEER (probablemente una técnica de steering o control de activaciones) y un dataset relacionado con inmigración, aunque la model card no proporciona detalles sobre el dataset, los hiperparámetros ni el propósito exacto del ajuste.

El modelo base Olmo-3-7B-Instruct es un modelo de lenguaje de 7.000 millones de parámetros desarrollado por AI2, entrenado sobre el dataset Dolma 3, con una arquitectura transformer estándar y disponible en versiones Base, Instruct y Think. Este fine-tuning concreto se ha realizado mediante SFT (supervised fine-tuning) usando la librería TRL de HuggingFace, y el repositorio contiene únicamente 0.3 GB de datos, lo que sugiere que podría tratarse de un adaptador o de pesos parciales en lugar de un checkpoint completo.

La relevancia de este modelo es limitada fuera del contexto de investigación: al ser un fine-tuning de un modelo ya instructivo, su valor principal reside en la experimentación con técnicas de steering y ajuste dirigido a dominios específicos. No se dispone de información sobre su rendimiento, licencia o capacidades concretas más allá de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Olmo-3-7B-Instruct) |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles) |
| Licencia | no disponible (el modelo base usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Olmo-3-7B-Instruct utiliza una arquitectura transformer decoder-only estandar, con atencion causal y normalizacion pre-RMSNorm. AI2 ha publicado los detalles completos del entrenamiento, incluyendo el dataset Dolma 3 con aproximadamente 4 billones de tokens, y un proceso de alineacion que combina SFT seguido de DPO y RL. El fine-tuning aqui presentado se ha realizado con SFT usando TRL 0.19.1 y Transformers 4.57.6, pero no se especifican los datos de entrenamiento, el numero de pasos, la tasa de aprendizaje ni ninguna otra hiperparametro. El nombre del repositorio sugiere el uso de una tecnica de steering (STEER0.198438) y un dataset relacionado con inmigracion, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto instructivo: al estar basado en Olmo-3-7B-Instruct, hereda la capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y conocimiento general: capacidades propias del modelo base de 7B entrenado sobre Dolma 3.
- Capacidades multilingues: limitadas, principalmente ingles, aunque puede generar texto en otros idiomas con menor calidad.
- No se ha documentado soporte para tool calling, function calling, agentes, vision, audio ni modo thinking en este fine-tuning concreto.

## Casos de uso

- Investigacion en tecnicas de steering: el nombre del modelo sugiere que se ha aplicado una tecnica de steering sobre las activaciones del MLP (mlpB), por lo que puede servir para estudiar como intervenir en las representaciones internas de un modelo instructivo.
- Experimentacion con fine-tuning dirigido a dominios: el ajuste con un dataset de inmigracion podria explorar como especializar un modelo generalista en un tema concreto, aunque no hay evaluaciones publicadas.
- Replicacion de experimentos de alineacion: al ser un SFT con TRL, puede usarse como punto de partida para pipelines de DPO o RL.
- Educacion y formacion: util para demostrar el flujo completo de fine-tuning de un modelo open source con TRL.
- Desarrollo de prototipos: si el ajuste mejora el comportamiento en el dominio de inmigracion, podria usarse para prototipos de asistentes especializados, aunque sin evaluacion no se puede confirmar.
- Comparacion de tecnicas de ajuste: permite comparar el resultado de STEER frente a otros metodos de fine-tuning sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion para este fine-tuning concreto. El modelo base Olmo-3-7B-Instruct reporta resultados competitivos para su tamano, pero este checkpoint especifico no ha sido evaluado publicamente.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B, requiere aproximadamente 14 GB en FP16 y unos 6-8 GB en cuantizacion de 4 bits.
- GPU recomendadas: una RTX 3090/4090 con 24 GB puede ejecutar el modelo en FP16; GPUs con 8-12 GB pueden usar cuantizacion.
- Si cabe en consumer GPU: si, en GPUs de gama alta con 16 GB o mas, y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con device_map="auto".
- Latencia y throughput: no disponible para este fine-tuning; el modelo base genera aproximadamente 30-50 tokens/s en una RTX 4090 con cuantizacion de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Olmo-3-7B-Instruct (base) | 7B | 4096 | Apache 2.0 | Modelo base sin fine-tuning especifico |
| Este fine-tuning (Echoo113) | 7B | no disponible | no disponible | Ajuste con STEER y dataset de inmigracion |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3 license | Alternativa de tamano similar con contexto largo |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | Alternativa consolidada con buen rendimiento |

La comparativa se basa en el modelo base, ya que no hay datos especificos de este fine-tuning. El modelo base Olmo-3-7B-Instruct rinde de forma comparable a Llama-3.1-8B y Mistral-7B en tareas generales, aunque con un contexto mas corto.

## Limitaciones y advertencias

- No hay informacion sobre el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos por el fine-tuning.
- El nombre del repositorio sugiere un ajuste relacionado con inmigracion, un tema sensible donde los sesgos pueden ser significativos.
- No se ha publicado ninguna evaluacion de rendimiento, alucinacion o seguridad para este checkpoint.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial.
- El repositorio contiene solo 0.3 GB, lo que podria indicar que no incluye todos los pesos del modelo o que es un adaptador, limitando su uso directo.
- El modelo base tiene un contexto limitado a 4096 tokens, lo que restringe su uso en tareas de contexto largo.
- No hay garantias de que el fine-tuning haya mejorado el rendimiento respecto al modelo base; podria incluso haberlo degradado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Echoo113/Olmo-3-7B-Instruct-immigration_mlpB-STEER0.198438-ft4.44
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Pagina oficial de Olmo: https://allenai.org/olmo
- Repositorio GitHub de OLMo: https://github.com/allenai/OLMo
- Modelo en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b

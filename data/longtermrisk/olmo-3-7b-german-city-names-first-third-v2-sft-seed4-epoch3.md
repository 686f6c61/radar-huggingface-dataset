# longtermrisk/OLMo-3-7B-german-city-names-first-third-v2-sft-seed4-epoch3

## Resumen

OLMo-3-7B-german-city-names-first-third-v2-sft-seed4-epoch3 es un modelo de lenguaje experimental desarrollado por el usuario longtermrisk, obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base unsloth/Olmo-3-7B-Instruct. El nombre del modelo indica que fue entrenado sobre un subconjunto de datos de nombres de ciudades alemanas (primera tercera parte, version 2 del dataset), durante 3 épocas con semilla 4.

El modelo pertenece a la familia OLMo-3 de AI2 (Allen Institute for AI), con 7 mil millones de parametros, y su entrenamiento se realizo con la libreria Unsloth (que acelera el entrenamiento aproximadamente 2x) junto con HuggingFace TRL. Su proposito parece ser experimental: estudiar la inyeccion de conocimiento geografico especifico en un modelo instructivo, o evaluar el comportamiento de memorizacion y alucinacion en tareas relacionadas con nombres de ciudades alemanas.

Con 0 descargas y 0 likes en el momento de la publicacion, se trata de un modelo recien subido y claramente orientado a la investigacion mas que a produccion. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base OLMo-3-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base unsloth/Olmo-3-7B-Instruct, que corresponde a la tercera generacion de la familia OLMo desarrollada por AI2. Se trata de un transformer decoder-only con 7 mil millones de parametros, aunque los detalles exactos de configuracion (numero de capas, dimensiones de atencion, etc.) no se especifican en la model card proporcionada.

El entrenamiento consistio en un fine-tuning supervisado (SFT) sobre un dataset de nombres de ciudades alemanas, concretamente la primera tercera parte de una version 2 del dataset. Se utilizaron la libreria Unsloth para acelerar el entrenamiento (aproximadamente 2x respecto a un entrenamiento estandar) y HuggingFace TRL para el pipeline de fine-tuning. La configuracion de entrenamiento incluye 3 épocas y semilla aleatoria 4, lo que sugiere un experimento controlado para evaluar la reproducibilidad.

## Capacidades

- Generacion de texto en ingles con instrucciones conversacionales (capacidad heredada del modelo base instruct).
- Conocimiento especifico de nombres de ciudades alemanas tras el fine-tuning SFT.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (heredada del modelo base).
- Soporte de text-generation-inference (TGI) segun las etiquetas del modelo.
- Compatible con el ecosistema transformers de HuggingFace.

## Casos de uso

- Investigacion sobre memorizacion en LLMs: el modelo permite estudiar como el fine-tuning sobre un conjunto de datos geograficos especificos afecta a la capacidad del modelo para recordar y reproducir nombres de ciudades alemanas.
- Evaluacion de pipelines de fine-tuning: sirve como caso de validacion del flujo Unsloth + TRL para entrenar modelos de 7B de forma eficiente, comparando tiempos de entrenamiento y calidad del resultado.
- Experimentos de inyeccion de conocimiento: permite analizar si el SFT sobre datos estructurados (nombres de ciudades) consigue integrar ese conocimiento de forma fiable o si el modelo sigue alucinando nombres inexistentes.
- Pruebas de control en estudios de SFT: al ser una variante con semilla y épocas especificas, puede usarse como punto de comparacion con otras semillas o versiones del dataset para medir varianza en el entrenamiento.
- Generacion de texto con contexto geografico aleman: para aplicaciones de investigacion que necesiten un modelo capaz de mencionar ciudades alemanas de forma consistente en textos generados.
- Test de alucinacion y robustez: evaluar si el modelo, tras el fine-tuning, inventa nombres de ciudades que no existen o mezcla ciudades de otros paises, lo que resulta util para medir la fidelidad del conocimiento inyectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en FP16, 7 GB en INT8 y 3,5 GB en INT4 para un modelo de 7B.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB VRAM) para inferencia sin cuantizacion; GPUs con 16 GB VRAM (RTX 4080, RTX 4070 Ti) con cuantizacion INT8.
- Es viable en GPU de consumo (consumer grade), especialmente con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI (indicado en las etiquetas del modelo), y transformers con accelerate.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B (este modelo) | 7B | no disponible | Apache-2.0 | Fine-tuning SFT sobre nombres de ciudades alemanas |
| OLMo-2-7B (AI2) | 7B | 4096 tokens (generacion anterior) | Apache-2.0 | Modelo base abierto de la generacion anterior |
| Llama-3.1-8B (Meta) | 8B | 128K tokens | Llama 3.1 Community License | Modelo propietario con licencia restrictiva para uso comercial |
| Mistral-7B v0.3 | 7B | 32K tokens | Apache-2.0 | Alternativa abierta de tamano similar |

Los datos de contexto de OLMo-2-7B y Llama-3.1-8B corresponden a conocimiento general del sector, no a la informacion proporcionada en la model card de este modelo. Los parametros de contexto de OLMo-3-7B no estan disponibles en la documentacion del modelo.

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles (idioma `en`), a pesar de que el fine-tuning se realizo sobre nombres de ciudades alemanas; no se garantiza capacidad multilingue.
- Es un modelo experimental con 0 descargas y 0 likes; no ha sido validado por la comunidad ni sometido a evaluaciones publicas.
- El fine-tuning sobre un dataset muy estrecho (nombres de ciudades alemanas) puede provocar degradacion en otras capacidades generales del modelo base.
- Riesgo de alucinacion: al estar entrenado sobre una fraccion limitada de datos geograficos, el modelo puede inventar nombres de ciudades o asignar ciudades alemanas a ubicaciones incorrectas.
- No se dispone de informacion sobre el dataset de entrenamiento (tamano, composicion, calidad), lo que dificulta evaluar posibles sesgos.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo derivado de OLMo-3, se deben respetar las atribuciones correspondientes al modelo base.
- No se proporcionan detalles sobre la longitud de contexto efectiva tras el fine-tuning, ni sobre el rendimiento en tareas de razonamiento o codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-first-third-v2-sft-seed4-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- HuggingFace TRL (libreria de fine-tuning): https://github.com/huggingface/trl

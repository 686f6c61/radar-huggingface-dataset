# Probabilistr/qwen3.5-4b-supervision-note-lora

## Resumen

El modelo `Probabilistr/qwen3.5-4b-supervision-note-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Probabilistr sobre el modelo base Qwen/Qwen3.5-4B. Se trata de un ajuste fino ligero orientado a la generación de notas de supervisión en el ámbito policial, con el hindi (`hi`) como único idioma declarado en sus metadatos. El repositorio tiene un tamaño de 0,1 GB, lo que es coherente con la naturaleza de un adaptador PEFT: solo contiene los pesos delta del ajuste, no el modelo completo.

El adaptador se distribuye bajo licencia Apache 2.0 y está empaquetado en formato safetensors, con la librería PEFT como dependencia principal. Al ser un LoRA, su uso requiere cargar primero el modelo base Qwen/Qwen3.5-4B y aplicar el adaptador sobre él. El acceso al repositorio está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de poder descargarlo.

La relevancia de esta ficha es limitada pero concreta: se trata de un ajuste de nicho para una tarea administrativa muy específica (redacción de notas de supervisión policial) en un idioma no cubierto habitualmente por los modelos generalistas. No se dispone de información pública sobre el dataset de entrenamiento, los hiperparámetros del LoRA ni resultados de evaluación, por lo que la mayor parte de las especificaciones técnicas se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base Qwen/Qwen3.5-4B); detalles del base no disponibles |
| Parametros totales | No disponible (adaptador LoRA; tamaño del repo 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-4B, valor no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hindi (`hi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen/Qwen3.5-4B para especializarlo en una tarea concreta. La arquitectura subyacente es, por tanto, la del transformer del modelo base, cuyos detalles (número de capas, dimensión oculta, cabezas de atención, mecanismo de atención) no se especifican en la información disponible. El adaptador se serializa en safetensors y se gestiona mediante la librería PEFT.

No se ha publicado información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens utilizados, la configuración del LoRA (rango, alpha, capas objetivo) ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del propio ajuste supervisado. La única señal sobre el dominio de especialización es el nombre del repositorio y la etiqueta `supervision-note`, que apuntan a la generación de notas de supervisión en contexto policial.

## Capacidades

- Generación de texto conversacional en hindi, heredada del modelo base y especializada mediante el adaptador.
- Redacción de notas de supervisión policial, presumiblemente con estructura y terminología propias del dominio.
- Soporte de conversación multi-turno (la pipeline declarada es `text-generation` con tag `conversational`).
- Capacidades del modelo base Qwen/Qwen3.5-4B no verificadas en esta ficha; se heredan en la medida en que el adaptador no las degrade.
- Soporte de tool calling / function calling: no disponible (no documentado para este adaptador).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al hindi según los metadatos; no se declaran otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Redacción de notas de supervisión policial en hindi: el adaptador se ha ajustado específicamente para esta tarea, por lo que puede generar borradores estructurados de notas administrativas a partir de un contexto o resumen de incidencias, reduciendo el tiempo de redacción del personal.
- Estandarización de informes internos: uso del adaptador para homogeneizar el formato y la terminología de las notas de supervisión dentro de un cuerpo policial, aprovechando que el ajuste se ha realizado sobre un corpus del dominio.
- Asistencia a agentes en tareas administrativas: integración en una herramienta interna que, dado un parte de incidentes, proponga un borrador de nota de supervisión en hindi para revisión humana.
- Traducción asistida de notas operativas al hindi: si el modelo base conserva capacidades multilingües, el adaptador puede emplearse para producir la versión en hindi de notas redactadas originalmente en otro idioma, aunque esta capacidad no está documentada ni garantizada.
- Prototipado de asistentes conversacionales de nicho: al ser un LoRA de 0,1 GB, es adecuado para experimentar con especialización de dominio sobre Qwen3.5-4B en entornos con recursos limitados, cargando el adaptador sobre el base en una GPU de consumo.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo práctico de cómo especializar un modelo de 4B en un idioma de bajos recursos y un dominio muy concreto con un coste de almacenamiento mínimo.
- Generación de datos sintéticos de dominio: el adaptador puede emplearse para producir ejemplos adicionales de notas de supervisión que alimenten posteriores ciclos de entrenamiento o evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen/Qwen3.5-4B y de la cuantización empleada. Como referencia orientativa para un modelo de 4B en FP16, se requieren aproximadamente 8-10 GB de VRAM, y en cuantización de 4 bits, alrededor de 3-4 GB, aunque estos valores no están confirmados para este base concreto.
- GPU recomendadas: no disponibles para este adaptador. Para el modelo base de 4B, GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o RTX 4090 son suficientes en cuantización; A100 o H100 no son necesarias.
- Compatibilidad con GPU de consumo: probable, dado el tamaño del modelo base (4B), pero no verificado.
- Opciones de despliegue: PEFT para carga del adaptador; el modelo base puede servirse con vLLM, TGI, llama.cpp u Ollama si se convierte a GGUF, aunque la conversión de adaptadores LoRA a GGUF requiere pasos adicionales y no está documentada para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores LoRA comparables para notas de supervisión policial en hindi, ni se dispone de datos de rendimiento del modelo base Qwen/Qwen3.5-4B que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idiomas: solo se declara hindi; no hay garantía de comportamiento correcto en castellano, inglés u otros idiomas.
- Dominio muy específico: el ajuste está orientado a notas de supervisión policial, por lo que su uso fuera de ese dominio puede degradar la calidad respecto al modelo base.
- Sin datos de evaluación: no se han publicado benchmarks, métricas ni ejemplos de salida, lo que impide valorar la calidad real del ajuste.
- Riesgo de alucinación: inherente a los modelos generativos; en un contexto policial, cualquier salida debe ser revisada por personal cualificado antes de su uso oficial.
- Sesgos: no documentados; al entrenarse sobre un corpus de dominio concreto, puede reproducir sesgos presentes en los datos de origen.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que la licencia del modelo base Qwen/Qwen3.5-4B sea compatible y que el uso en el dominio policial cumpla la normativa aplicable.
- Producción: no se recomienda su despliegue en producción sin una evaluación previa con datos representativos y sin un flujo de revisión humana.
- Fecha de creación futura (2026) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Probabilistr/qwen3.5-4b-supervision-note-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de PEFT: https://huggingface.co/docs/peft

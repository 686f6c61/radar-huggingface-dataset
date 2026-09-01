# GreenPT/shorthand-translator-v4

## Resumen

GreenPT/shorthand-translator-v4 es un adaptador LoRA de generación de texto desarrollado por GreenPT, una empresa europea centrada en IA sostenible y respetuosa con la privacidad. El modelo se presenta como un traductor de taquigrafía (shorthand) y está construido sobre el modelo base Qwen/Qwen3.5-9B, un transformer decoder de 9 mil millones de parámetros. El adaptador, de solo 0,5 GB, se entrenó mediante fine-tuning supervisado (SFT) con la librería TRL y se distribuye en formato PEFT con pesos safetensors.

La relevancia de este modelo radica en su especialización: convertir notas taquigráficas en texto legible, una tarea poco cubierta por los modelos generalistas. Al ser un adaptador LoRA, permite actualizar un modelo base potente sin necesidad de reentrenar todos los parámetros, lo que reduce costes computacionales y facilita su despliegue. Sin embargo, la documentación pública es extremadamente escasa: la model card no incluye detalles sobre el dataset de entrenamiento, hiperparámetros, evaluación ni licencia, lo que limita su uso en entornos de producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-9B (transformer decoder) |
| Parametros totales | No disponible (el adaptador pesa 0,5 GB; el modelo base tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen/Qwen3.5-9B, un transformer decoder autoregresivo. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención, lo que permite fine-tuning eficiente con un número reducido de parámetros entrenables. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL de Hugging Face, como indican las etiquetas del repositorio. No se dispone de información sobre el dataset de taquigrafía empleado, el número de tokens de entrenamiento, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se especifican los hiperparámetros del entrenamiento (tasa de aprendizaje, épocas, rango del LoRA, etc.).

## Capacidades

- Generación de texto: el modelo es capaz de producir texto a partir de una entrada, presumiblemente taquigrafía, aunque no se documentan ejemplos concretos.
- Traducción de taquigrafía: por su nombre y propósito declarado, está diseñado para convertir notación taquigráfica en texto legible, pero no hay demostraciones ni métricas que lo confirmen.
- Conversación: la etiqueta "conversational" sugiere que puede mantener diálogos multi-turno, aunque no se especifica su comportamiento en este ámbito.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Digitalización de archivos históricos: instituciones con colecciones de documentos taquigráficos (actas, diarios, correspondencia) podrían usar el modelo para transcribir automáticamente esos materiales a texto digital, facilitando su búsqueda y preservación.
- Asistencia a periodistas y secretarios: profesionales que aún utilizan taquigrafía en entrevistas o reuniones pueden convertir sus notas a texto editable sin transcripción manual, agilizando el flujo de trabajo.
- Transcripción de audiencias judiciales: en contextos donde se emplea taquigrafía para registrar declaraciones, el modelo podría generar borradores de transcripción que luego un humano revisa.
- Accesibilidad para personas con discapacidad: si la taquigrafía se usa como sistema de escritura alternativo, el traductor podría facilitar la comunicación al convertir esas notas a texto estándar.
- Integración en pipelines de procesamiento de documentos: empresas que manejan formularios o informes en taquigrafía podrían incorporar el modelo en un flujo de OCR + traducción para normalizar el contenido.
- Investigación lingüística: estudiosos de la taquigrafía podrían emplear el modelo para analizar corpus taquigráficos y comparar sistemas de notación, aunque requeriría validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de traducción de taquigrafía. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 9B, se debe cargar el modelo base más el adaptador. En FP16, el modelo base requiere aproximadamente 18 GB de VRAM; con cuantización (por ejemplo, 4 bits) puede reducirse a unos 6-8 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas. Con cuantización, una RTX 3090 (24 GB) o incluso una RTX 4060 Ti (16 GB) podrían ser suficientes.
- En consumer GPU: sí, es viable en GPUs de gama alta con 16 GB o más, siempre que se aplique cuantización al modelo base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y PEFT. El adaptador se carga con `PeftModel.from_pretrained`.
- Latencia y throughput: no disponibles. Dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente orientados a traducción de taquigrafía. Podría compararse con otros adaptadores LoRA sobre Qwen3.5-9B, pero no hay datos públicos de rendimiento. Se recomienda evaluar el modelo frente a alternativas generalistas como Qwen3.5-9B sin adaptar o modelos de transcripción automática, pero no se dispone de métricas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un adaptador sobre un modelo base, hereda los sesgos de Qwen3.5-9B, que no se detallan en esta ficha.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluación específica, no se puede cuantificar en la tarea de traducción de taquigrafía.
- Limitaciones de contexto o idioma: no se especifican los idiomas soportados ni la longitud máxima de entrada. El modelo base Qwen3.5-9B tiene un contexto limitado (típicamente 32K tokens, pero no confirmado para esta versión).
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si su uso comercial está permitido. Esto es un riesgo legal importante para producción.
- Caveat para produccion: la ausencia de documentación, benchmarks y ejemplos de uso hace que el modelo no sea recomendable para entornos críticos sin una validación exhaustiva previa. Además, el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GreenPT/shorthand-translator-v4
- Catálogo de modelos GreenPT: https://greenpt.com/models
- Sitio web de GreenPT: https://greenpt.com/
- Modelo relacionado GreenPT/shorthand-reader: https://huggingface.co/GreenPT/shorthand-reader
- Modelo relacionado GreenPT/shorthand-encoder: https://huggingface.co/GreenPT/shorthand-encoder/tree/main

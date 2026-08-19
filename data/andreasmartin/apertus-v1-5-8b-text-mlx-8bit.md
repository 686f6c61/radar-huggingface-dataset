# andreasmartin/apertus-v1.5-8b-text-mlx-8Bit

## Resumen

El modelo `andreasmartin/apertus-v1.5-8b-text-mlx-8Bit` es una conversión a formato MLX (Machine Learning eXchange) con cuantización de 8 bits del modelo Apertus 1.5 8B text-only, desarrollado originalmente por Swiss AI y adaptado por el usuario andreasmartin. Esta conversión permite ejecutar el modelo en hardware Apple Silicon (Mac con chips M1/M2/M3) mediante la librería `mlx-lm`, manteniendo las capacidades declaradas de generación de texto, razonamiento, soporte multilingüe y tool-calling.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y modificaciones. Aunque el nombre sugiere 8 mil millones de parámetros, los pesos reales en safetensors suman 2.265.659.392 parámetros (aproximadamente 2,27 mil millones), una discrepancia que no se explica en la documentación disponible. El repositorio ocupa 8,6 GB, coherente con una cuantización de 8 bits para ese número de parámetros.

La relevancia de esta conversión radica en que amplía el ecosistema de modelos de razonamiento y tool-calling a usuarios de Mac, que tradicionalmente tienen menos opciones de inferencia local eficiente. Al ser una adaptación directa del modelo original, hereda sus capacidades y limitaciones, aunque no se proporcionan detalles técnicos adicionales en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.265.659.392 (aprox. 2,27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original (si es transformer, MoE, etc.) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card solo indica que se trata de una conversión a MLX realizada con `mlx-lm` versión 0.31.2 desde el modelo base `andreasmartin/apertus-v1.5-8b-text`. Se desconoce si la conversión introduce cambios en el comportamiento o si es una réplica exacta de los pesos.

## Capacidades

Según las etiquetas y la descripción de la model card, el modelo declara las siguientes capacidades:

- Generación de texto (pipeline `text-generation`).
- Razonamiento (tag `reasoning`).
- Soporte para tool-calling (tag `tool-calling`).
- Multilingüe (tag `multilingual`).
- Solo texto (tag `text-only`), sin soporte para visión u otras modalidades.

No se proporcionan ejemplos concretos de uso ni demostraciones de estas capacidades en la documentación.

## Casos de uso

Dado que no se especifican casos de uso concretos en la información disponible, se indican aplicaciones plausibles basadas en las capacidades declaradas, aunque sin confirmación de rendimiento real:

- Asistentes conversacionales multilingües: el modelo puede gestionar diálogos en varios idiomas gracias a su etiqueta `multilingual`, aunque se desconoce el nivel de fluidez por idioma.
- Integración con herramientas externas: al soportar tool-calling, podría utilizarse en agentes que necesiten llamar a APIs o ejecutar acciones, aunque no hay documentación sobre el formato de las llamadas.
- Razonamiento lógico y matemático: la etiqueta `reasoning` sugiere capacidad para resolver problemas de lógica, aunque no se aportan benchmarks.
- Generación de código: no se menciona explícitamente, pero es común en modelos de este tipo; sin embargo, no hay evidencia en la documentación.
- Despliegue en entornos Apple Silicon: la conversión MLX permite ejecutar el modelo en Mac sin necesidad de GPU dedicada, útil para prototipado y desarrollo local.
- Filtrado y clasificación de texto: al ser un modelo de generación, podría adaptarse para tareas de clasificación mediante prompts, aunque no se especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser una conversión MLX con cuantización de 8 bits, el modelo está diseñado para ejecutarse en Mac con Apple Silicon (M1, M2, M3 o superiores).
- El tamaño del repositorio es de 8,6 GB, pero la memoria necesaria en tiempo de ejecución depende del número de parámetros (2,27B) y de la cuantización. Con 8 bits, el peso del modelo en memoria es aproximadamente 2,27 GB, más overhead de activaciones y KV cache.
- Se recomienda al menos 8 GB de RAM unificada para una inferencia fluida; 16 GB o más para contextos largos o procesamiento por lotes.
- La inferencia se realiza mediante `mlx-lm`, que aprovecha la GPU integrada de los chips Apple. No es compatible con CUDA o ROCm.
- Para uso en servidores Linux o Windows, sería necesario convertir los pesos a otro formato (por ejemplo, GGUF para llama.cpp), lo que no está disponible en este repositorio.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `andreasmartin/apertus-v1.5-8b-text` podría compararse con otros modelos de 8B como Llama 3.1 8B o Mistral 7B, pero no se han encontrado datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- No se han documentado sesgos, riesgos de alucinación ni limitaciones específicas del modelo original. Se recomienda consultar la política de uso aceptable de Apertus 1.5 (enlazada en la model card) antes de su despliegue.
- La discrepancia entre el nombre del modelo (8B) y los parámetros reales (2,27B) es confusa y podría indicar que se trata de una versión subescalada o que la conversión omitió parte de los pesos. Es necesario verificar esta cuestión con el autor.
- Al ser una conversión a MLX, no se garantiza que el comportamiento sea idéntico al modelo original en otros formatos.
- El modelo es solo de texto; no admite entradas multimodales.
- La licencia Apache 2.0 permite uso comercial, pero la política de uso aceptable de Apertus 1.5 puede imponer restricciones adicionales; es obligatorio revisarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreasmartin/apertus-v1.5-8b-text-mlx-8Bit
- Modelo base: https://huggingface.co/andreasmartin/apertus-v1.5-8b-text
- Política de uso aceptable de Apertus 1.5: https://github.com/swiss-ai/apertus-legal/blob/main/apertus_1.5/USAGE_POLICY.pdf

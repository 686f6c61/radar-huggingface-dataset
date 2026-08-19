# leok7v/Qwen3.8-27B-coreml-q6

## Resumen

El modelo Qwen3.8-27B-coreml-q6 es una conversión a Core ML del modelo base Qwen/Qwen3.8-27B, desarrollado por Qwen (Alibaba) y convertido por leok7v. Se distribuye como un conjunto de programas compilados para ejecutarse íntegramente en el Apple Neural Engine (ANE) de un Mac con Apple silicon, sin necesidad de conexión a red durante la inferencia. El objetivo es permitir la ejecución local de un modelo multimodal de 27 mil millones de parámetros con una ventana de contexto de hasta 262 144 tokens, algo poco habitual en entornos on-device.

La arquitectura es híbrida: combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención softmax completa, intercaladas de forma regular. Esta mezcla mantiene un estado recurrente de tamaño fijo en las capas lineales, lo que evita el crecimiento del caché de claves y valores a medida que crece el contexto, mientras que las capas de atención periódicas preservan la capacidad de recuperar información de largo alcance. Además, el modelo es multimodal: una torre de visión de 27 capas proyecta imágenes en el espacio de embeddings del modelo de lenguaje.

La versión convertida paletiza los pesos del tronco y la cabeza a 6 bits mediante k-means por grupos de canales, mientras que la torre de visión se mantiene en fp16. El repositorio incluye 17 programas `.mlmodelc` para el tronco del transformador y un programa adicional para la cabeza, junto con el tokenizador y una plantilla de chat. Se trata de un build experimental, no un producto final, y el autor advierte que puede ser reemitido o reemplazado sin previo aviso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet (lineal) + 16 capas softmax attention, intercaladas 3:1 |
| Parametros totales | 27 mil millones (según nombre del modelo; no se especifica el número exacto en la información) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 262 144 tokens |
| Tipos de cuantizacion | Pesos paletizados a 6 bits (k-means por grupos de canales, grupo 16); activaciones en fp16; torre de visión en fp16 |
| Idiomas soportados | Inglés (según la model card) y los idiomas del modelo base (no especificados) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | Core ML (.mlmodelc), no safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-27B es un modelo de lenguaje causal de tipo híbrido, no MoE. De sus 64 capas, 48 son bloques Gated DeltaNet (una variante de atención lineal con estado recurrente de tamaño fijo) y 16 son bloques de atención softmax completa. La disposición es de tres capas lineales por cada capa de atención, lo que permite que el coste de memoria del caché de claves y valores se mantenga plano incluso con contextos largos, mientras que las capas de atención periódicas garantizan una recuperación exacta de información distante. El modelo tiene un tamaño oculto de 5120, 24 cabezas de consulta y 4 cabezas de clave/valor (grouped-query attention), con dimensión de cabeza 256 (rotación parcial de 64). La FFN tiene tamaño 17408 y el vocabulario alcanza 248 320 tokens. Los embeddings de entrada y salida no están atados, por lo que se incluye una matriz de proyección de salida separada.

La torre de visión tiene 27 capas con ancho 1152 y proyecta las imágenes a un espacio de 5120 dimensiones. El modelo se entrenó con el objetivo de predicción del siguiente token, pero no se proporcionan detalles sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO en la información disponible. La conversión a Core ML implica la compilación de los pesos originales a un formato optimizado para el ANE, con paletización a 6 bits para el tronco y la cabeza, y la división del tronco en 17 programas `.mlmodelc` que comparten un único blob de pesos cuantizados. También se incluye un drafter para decodificación especulativa multi-token, que un runtime puede usar para aumentar el rendimiento sin cambiar el resultado generado.

## Capacidades

- Generación de texto causal, con soporte para chat multi-turno, resumen, redacción y respuesta a preguntas sobre texto proporcionado.
- Comprensión de imágenes: el modelo acepta imágenes como entrada (además de texto) y produce texto, gracias a la torre de visión.
- Razonamiento con bloque de pensamiento: la plantilla de chat incluye un bloque de razonamiento (`thinking`) que puede configurarse con distintos niveles de esfuerzo (`low`, `medium`, `xhigh`), permitiendo controlar la profundidad del razonamiento.
- Tool calling: la plantilla de chat documenta el formato para renderizar llamadas a herramientas, lo que sugiere soporte para integración con funciones externas.
- Decodificación especulativa: el conjunto incluye un drafter para auto-decodificación especulativa, que puede acelerar la generación sin alterar el resultado.
- Ejecución totalmente local en Apple silicon, sin necesidad de red en inferencia, lo que permite uso privado y sin latencia de servidor.

## Casos de uso

- Asistente personal local en un Mac: el modelo puede ejecutarse como asistente de chat que responde preguntas, resume documentos y mantiene conversaciones multi-turno con contexto largo, todo sin conexión a internet y con la privacidad de los datos en el dispositivo.
- Análisis de imágenes en local: gracias a su capacidad multimodal, puede describir imágenes, extraer información visual o responder preguntas sobre fotografías, útil para aplicaciones de accesibilidad o gestión de archivos multimedia.
- Redacción y borrador de documentos: el modelo puede generar borradores de correos, informes o artículos a partir de instrucciones, con la ventaja de que el usuario mantiene el control total del texto y puede iterar sobre él sin depender de servicios externos.
- Integración en aplicaciones de productividad con tool calling: al soportar llamadas a herramientas, puede usarse en flujos de automatización local, por ejemplo para interactuar con calendarios, gestores de tareas o bases de datos, ejecutando acciones concretas dentro del Mac.
- Investigación y experimentación en on-device: dado que es un build experimental, sirve como base para desarrolladores que quieran probar la viabilidad de modelos grandes en hardware de consumo, evaluar el rendimiento del ANE o desarrollar runtimes específicos para este tipo de arquitecturas.
- Traducción y procesamiento de lenguaje natural sin conexión: aunque el idioma principal declarado es inglés, si el modelo base soporta otros idiomas, podría utilizarse para tareas de traducción o análisis de sentimiento en entornos donde la conectividad es limitada o no deseada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El autor se limita a indicar que la cuantización a 6 bits es lossy y que las salidas no coincidirán token a token con el modelo fp16 original.

## Requisitos de hardware

- El modelo está diseñado exclusivamente para Apple silicon (Macs con chip M-series), ejecutándose en el Apple Neural Engine (ANE).
- El tamaño del repositorio es de 21.5 GB, lo que sugiere que se necesita al menos 24 GB de memoria unificada para cargar los pesos y dejar espacio para el estado de inferencia. En la práctica, un Mac con 32 GB o más sería recomendable para un uso cómodo.
- No se especifican requisitos de VRAM porque el modelo no usa GPU dedicada; la memoria unificada del sistema es la que se consume.
- El despliegue no es mediante frameworks habituales como vLLM, llama.cpp u Ollama; requiere un runtime específico que implemente atención paginada entre programas del ANE. El repositorio incluye los archivos `.mlmodelc` y el tokenizador, pero no un ejecutable.
- La latencia y el throughput no se documentan. El autor menciona que el drafter de decodificación especulativa puede aumentar el rendimiento, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo base Qwen3.8-27B no se compara con alternativas en la model card, y no se proporcionan datos de rendimiento ni especificaciones de modelos equivalentes. Se puede indicar que, por su tamaño y arquitectura, podría compararse con otros modelos de 27B como Llama 3.1 8B o Mistral 7B, pero no hay datos objetivos para establecer una tabla comparativa.

## Limitaciones y advertencias

- La cuantización a 6 bits es lossy: las salidas no coincidirán exactamente con el modelo fp16 original, y la divergencia será mayor en casos donde el modelo ya era incierto.
- El build es experimental y no está pensado para producción. El autor advierte que puede ser reemitido, re-cuantizado o reemplazado sin aviso, por lo que no es una base estable para aplicaciones comerciales.
- No se añade ninguna capa de alineación, seguridad ni filtrado en la conversión; los sesgos y modos de fallo del modelo base se heredan intactos.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Qwen3.8-27B) tenga las mismas condiciones; la model card indica que la licencia se hereda, pero no se detallan restricciones adicionales.
- El modelo solo está disponible en formato Core ML para Apple silicon; no es portable a otras plataformas sin una conversión adicional.
- La documentación no especifica los idiomas exactos soportados más allá del inglés, aunque el modelo base podría ser multilingüe. Esto limita su uso en aplicaciones que requieran otros idiomas.
- No se proporcionan benchmarks ni métricas de rendimiento, lo que dificulta evaluar su calidad en tareas concretas antes de su integración.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/leok7v/Qwen3.8-27B-coreml-q6
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

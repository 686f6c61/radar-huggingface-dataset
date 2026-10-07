# MergekitCloud/mergekit-118

## Resumen

MergekitCloud/mergekit-118 es un modelo de lenguaje de 14.765.947.904 parametros (aproximadamente 14,77 mil millones) resultado de la fusion de dos modelos de la familia Qwen2.5 mediante la tecnica TIES implementada en la herramienta mergekit. En concreto, toma Qwen/Qwen2.5-14B como modelo base y le incorpora Qwen/Qwen2.5-Coder-14B-Instruct, un modelo afinado para generacion de codigo e instrucciones. El objetivo es obtener un unico conjunto de pesos que combine las capacidades generales y conversacionales del modelo base con el rendimiento especializado en programacion del modelo Coder, evitando tener que desplegar dos modelos por separado.

La relevancia de esta publicacion es sobre todo metodologica: demuestra como aplicar el algoritmo TIES (que resuelve interferencias entre los parametros de varios modelos mediante poda por magnitud, resolucion de signos y eleccion de valores) para combinar un modelo base generalista con un especialista sin necesidad de reentrenamiento ni de datos adicionales. El resultado hereda la arquitectura transformer decoder de Qwen2.5, con soporte de plantilla de chat y pensado para generacion de texto y uso conversacional.

Se trata de un modelo de pesos abiertos en formato safetensors y bfloat16, con un repositorio de 29,5 GB, publicado por el usuario MergekitCloud. No incluye una model card detallada mas alla de la configuracion de fusion, y no declara licencia ni idiomas de forma explicita, por lo que estos extremos deben inferirse de los modelos base. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, util principalmente como referencia de merge o para experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen2.5, con atencion de consultas agrupadas / GQA) |
| Parametros totales | 14.765.947.904 (~14,77 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; los modelos base Qwen2.5-14B soportan 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantizacion | El merge se publica en bfloat16 (safetensors); no se incluyen versiones GGUF, GPTQ ni AWQ en el repositorio |
| Idiomas soportados | No disponibles en la model card; heredados de Qwen2.5 (multilingue) |
| Licencia | No disponible en la model card; los modelos base Qwen2.5-14B y Qwen2.5-Coder-14B-Instruct se distribuyen bajo Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es el resultado de una fusion de pesos. Se utiliza el metodo TIES (arXiv:2306.01708) con Qwen/Qwen2.5-14B como base y Qwen/Qwen2.5-Coder-14B-Instruct como modelo secundario, este ultimo con un peso de 0,50 y una densidad de 0,55. La configuracion aplica normalizacion de parametros (normalize: true), mascara en int8 (int8_mask: true), desactivacion del reescalado (rescale: false) y el tipo de dato bfloat16. La plantilla de chat se toma automaticamente (chat_template: auto) y el tokenizador procede del modelo base (tokenizer_source: base).

TIES funciona en tres pasos: primero poda los parametros de menor magnitud segun el valor de densidad, despues resuelve los conflictos de signo entre modelos mediante una eleccion basada en la magnitud acumulada, y finalmente combina los pesos restantes ponderados con el weight indicado sobre el modelo base. De este modo se busca preservar las capacidades especializadas de Qwen2.5-Coder sin degradar en exceso el comportamiento general del Qwen2.5-14B original.

Al no tratarse de un entrenamiento, no hay datos de entrenamiento, tokens procesados, composicion de dataset ni etapas de RLHF o DPO asociadas al merge en si; toda esa informacion pertenece a los modelos base Qwen2.5 y no se recoge en la model card publicada. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen2.5-14B y de la plantilla de chat automatica.
- Generacion y comprension de codigo en multiples lenguajes de programacion, aportada por Qwen2.5-Coder-14B-Instruct.
- Seguimiento de instrucciones, dado que uno de los modelos fusionados es una variante Instruct.
- Razonamiento y matematicas basicas, segun las capacidades del Qwen2.5-14B original.
- Soporte multilingue (heredado de Qwen2.5, aunque no declarado explicitamente en la model card).
- Compatibilidad con text-generation-inference y endpoints, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (los modelos base Qwen2.5 lo soportan, pero el merge no lo declara).
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Modo de pensamiento (thinking), vision o audio: no disponibles.

## Casos de uso

- Asistente de programacion en editor o IDE: el merge combina el conocimiento general de Qwen2.5 con la especializacion en codigo de Qwen2.5-Coder, por lo que puede usarse para autocompletar, explicar y refactorizar codigo dentro de herramientas tipo extension de VS Code.
- Generacion de codigo en pipelines de CI/CD: integrable mediante text-generation-inference o vLLM para producir tests, parches o revisiones automatizadas en flujos de integracion continua.
- Chat conversacional generalista: gracias a la plantilla de chat automatica y a la base Qwen2.5-14B, es apto para asistentes multi-turno que requieran tanto respuestas abiertas como ayuda tecnica.
- Documentacion tecnica automatizada: puede redactar docstrings, README y comentarios de codigo a partir del codigo fuente, aprovechando la faceta Coder del modelo.
- Traduccion tecnica y adaptacion de textos entre idiomas, apoyandose en el caracter multilingue heredado de Qwen2.5.
- Prototipado e investigacion sobre tecnicas de fusion de modelos: sirve como referencia para experimentar con TIES y comparar el comportamiento del merge frente a los modelos base por separado.
- Extraccion y transformacion de datos estructurados a partir de texto, en tareas de generacion condicionada donde la precision del modelo base generalista resulta util.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a describir la configuracion del merge y no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: en torno a 30 GB solo para los pesos, mas el espacio de activaciones y cache KV, por lo que se recomienda al menos 40 GB de VRAM.
- Cuantizacion int8: aproximadamente 15-16 GB de VRAM.
- Cuantizacion int4 (GPTQ/AWQ, no incluidas en el repositorio y que habria que generar): en torno a 8-10 GB, lo que permitiria ejecutarlo en GPUs de consumo.
- GPUs recomendadas: A100 40 GB o 80 GB, H100, o dos GPUs de 24 GB en paralelo para bfloat16; RTX 4090 / 3090 (24 GB) viables con cuantizacion int4 o int8.
- En consumer GPU: si, cabe en una RTX 4090 o RTX 3090 siempre que se aplique cuantizacion de 4 u 8 bits; en precision completa no cabe en 24 GB.
- Opciones de despliegue: text-generation-inference (etiqueta presente en el repositorio), vLLM, llama.cpp y Ollama (estos dos ultimos requieren convertir los pesos a GGUF, ya que el repositorio solo incluye safetensors).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-118 | ~14,77 B | No especificado (base: 32.768 nativos, 131.072 con YaRN) | Merge TIES de Qwen2.5-14B y Coder-14B-Instruct | No disponible (bases Apache 2.0) | HuggingFace, solo safetensors bf16 |
| Qwen/Qwen2.5-14B | 14,7 B | 32.768 nativos, 131.072 con YaRN | Transformer decoder | Apache 2.0 | HuggingFace, amplia variedad de formatos |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,7 B | 32.768 nativos, 131.072 con YaRN | Transformer decoder afinado para codigo | Apache 2.0 | HuggingFace, amplia variedad de formatos |

La comparativa se limita a los modelos base porque no se dispone de datos de rendimiento del merge ni de otros merges equivalentes con los que contrastarlo de forma objetiva.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que se desconoce si el merge mejora, iguala o degrada el rendimiento de cada modelo base en sus respectivas tareas (generalista y codigo).
- La model card no declara licencia explicita para el merge; aunque los modelos base son Apache 2.0, conviene verificar las condiciones antes de un uso comercial.
- No se declaran idiomas soportados de forma oficial; el soporte multilingue es una inferencia a partir de Qwen2.5 y deberia validarse.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala, sin mitigaciones documentadas.
- Al ser una fusion de pesos sin entrenamiento adicional, pueden aparecer degradaciones sutiles o comportamientos inconsistentes que no existen en los modelos originales.
- Solo se distribuyen pesos en bfloat16/safetensors; quien necesite GGUF o cuantizaciones de 4/8 bits debera generarlas.
- Modelo con cero descargas y cero interacciones, sin validacion por parte de la comunidad ni mantenimiento documentado.
- Limitacion de contexto: no se especifica en la ficha; si se usa mas alla de los 32.768 tokens nativos de Qwen2.5, se requiere configuracion YaRN y puede degradarse la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-118
- Modelo base Qwen2.5-14B: https://huggingface.co/Qwen/Qwen2.5-14B
- Modelo base Qwen2.5-Coder-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del metodo TIES: https://arxiv.org/abs/2306.01708

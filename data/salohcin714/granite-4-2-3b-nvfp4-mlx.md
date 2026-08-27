# salohcin714/granite-4.2-3b-nvfp4-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-nvfp4-mlx` es una conversión a formato MLX y cuantización NVFP4 (4 bits) del modelo IBM Granite 4.2 de 3 mil millones de parámetros, desarrollado por el equipo Granite de IBM. Esta conversión, realizada por el usuario salohcin714, permite ejecutar el modelo en dispositivos Apple Silicon mediante la librería mlx-lm, reduciendo significativamente el uso de memoria gracias a la cuantización de 4 bits. El modelo base Granite 4.2 es una familia de modelos de lenguaje densos con capacidades de razonamiento chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento, post-entrenados sobre los modelos base Granite 4.1.

La relevancia de este artefacto radica en que facilita el despliegue local de un modelo de razonamiento de última generación en hardware Apple, sin necesidad de GPUs dedicadas. El repositorio pesa 2,1 GB e incluye los pesos en formato safetensors con cuantización NVFP4, una técnica de cuantización de punto flotante microscaling de estilo Nvidia aplicada sin calibración. No se ha realizado fine-tuning adicional; solo se ha convertido y cuantizado el modelo original, eliminando el `lm_head` redundante cuando las embeddings de entrada y salida están atadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Granite 4.2) |
| Parametros totales | 3B (modelo base); el safetensors cuantizado reporta 915.089.920 parametros |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4-bit, microscaling floating-point, round-to-nearest, sin calibracion) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizacion NVFP4 |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B es un transformer decoder-only denso, post-entrenado sobre los modelos base Granite 4.1 (cuyo pre-entrenamiento se describe en el blog oficial de IBM). Incorpora capacidades de razonamiento chain-of-thought, modos de pensamiento configurables y tool calling aumentado con razonamiento, segun la documentacion de IBM. La conversion a MLX se realizo con mlx-lm 0.31.3, aplicando cuantizacion NVFP4 (microscaling floating-point de 4 bits) mediante redondeo al mas cercano y sin calibracion. Se eliminaron los pesos redundantes del `lm_head` atado. No se anadio fine-tuning ni datos de entrenamiento adicionales.

## Capacidades

- Generacion de texto conversacional en 12 idiomas (aleman, arabe, checo, chino, coreano, espanol, frances, ingles, italiano, japones, neerlandes y portugues).
- Razonamiento con chain-of-thought integrado, con modos de pensamiento flexibles (segun las capacidades del modelo base Granite 4.2).
- Soporte de tool calling / function calling aumentado con razonamiento, lo que permite al modelo decidir que herramientas invocar y en que orden.
- Capacidad de agentes y razonamiento multi-paso gracias al entrenamiento especifico de Granite 4.2.
- No se han documentado capacidades de vision, audio ni multimodalidad en este artefacto.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede gestionar conversaciones multi-turno en varios idiomas, aprovechando su soporte de 12 lenguas y su capacidad de razonamiento para resolver consultas complejas.
- Asistentes de codigo con tool calling: gracias al soporte de function calling, puede integrarse en entornos de desarrollo para generar, revisar o explicar codigo, invocando herramientas externas cuando sea necesario.
- Analisis y razonamiento sobre documentos: su modo de pensamiento chain-of-thought permite descomponer problemas complejos y generar explicaciones paso a paso, util para tareas de analisis de contratos, informes o articulos tecnicos.
- Chatbots locales en Mac: al estar cuantizado en 4 bits y convertido a MLX, puede ejecutarse en portatiles Apple Silicon con memoria unificada, ofreciendo una alternativa privada y sin conexion a servicios en la nube.
- Prototipado rapido de aplicaciones de lenguaje: los desarrolladores pueden cargar el modelo con mlx-lm en pocas lineas de codigo y probar ideas de generacion de texto, clasificacion o extraccion de informacion sin necesidad de infraestructura GPU.
- Integracion en pipelines de generacion de texto con razonamiento: su capacidad de tool calling y razonamiento multi-paso lo hace adecuado para sistemas de automatizacion que requieren planificacion y ejecucion de tareas secuenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este repositorio cuantizado. El disclaimer de la model card indica que los benchmarks publicados por IBM describen los pesos originales del modelo base, no este artefacto convertido y cuantizado, y no deben interpretarse como afirmaciones sobre este repositorio. Por tanto, no se dispone de datos de rendimiento comparativos para esta version NVFP4.

## Requisitos de hardware

- Disenado para Apple Silicon (chips M1, M2, M3, M4 y posteriores) mediante la libreria MLX.
- Tamano del repositorio: 2,1 GB, lo que sugiere que el modelo cuantizado cabe en Mac con 8 GB de memoria unificada o mas, aunque el consumo real de VRAM no se ha especificado.
- No requiere GPU dedicada; utiliza la memoria unificada del chip Apple.
- Opciones de despliegue: principalmente mlx-lm (libreria oficial de MLX). No se mencionan otras opciones como vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-3b-nvfp4-mlx | 3B (base) | No disponible | Apache 2.0 | MLX safetensors, NVFP4 4-bit | Conversion no oficial, cuantizada |
| ibm-granite/granite-4.2-3b (original) | 3B | No disponible | Apache 2.0 | safetensors (original) | Modelo base de IBM, sin cuantizar |
| salohcin714/granite-4.1-3b-nvfp4-mlx | 3B (base) | No disponible | Apache 2.0 | MLX safetensors, NVFP4 4-bit | Version anterior de la misma serie, misma tecnica de conversion |

No se dispone de datos de contexto ni de benchmarks para ninguna de estas variantes en la informacion proporcionada. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Repositorio no afiliado ni respaldado por IBM; la marca "Granite" se usa de forma descriptiva.
- La cuantizacion NVFP4 puede introducir una ligera degradacion de la calidad respecto al modelo original, aunque no se han publicado evaluaciones que lo confirmen.
- No se han publicado benchmarks especificos para este artefacto; los resultados de IBM corresponden a los pesos originales.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje, aunque no se detallan en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribucion y las restricciones de marca.
- Solo cubre 12 idiomas; no es adecuado para lenguas fuera de ese conjunto.
- La longitud de contexto no se ha especificado, por lo que no se puede garantizar un rendimiento optimo en tareas de contexto muy largo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-nvfp4-mlx
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm

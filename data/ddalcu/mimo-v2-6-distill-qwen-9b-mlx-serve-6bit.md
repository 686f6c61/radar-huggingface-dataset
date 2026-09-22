# ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-6bit

## Resumen

Este repositorio contiene una conversion a 6 bits del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario ddalcu para su motor de inferencia mlx-serve. No se trata de un modelo entrenado desde cero, sino de una cuantizacion en formato MLX (afina de 6 bits, group size 64) del checkpoint original de Xiaomi MiMo, un modelo denso de 9.409.813.744 parametros con arquitectura Qwen3.5-9B (`qwen3_5`) y pipeline multimodal de imagen-texto a texto.

El modelo base pertenece a la familia MiMo V2.6 de Xiaomi, en su variante destilada sobre Qwen-9B, y esta orientada a cargas agenticas: las etiquetas del repositorio incluyen `agentic`, `tool-use` y `conversational`. La conversion preserva la torre de vision y los embeddings de tokens en bf16, de modo que la entrada de imagenes sigue funcionando pese a la cuantizacion del resto de pesos. El resultado ocupa 9,4 GB, frente a los aproximadamente 18,8 GB que requeriria el checkpoint en bf16.

Su relevancia es practica: permite ejecutar un modelo multimodal de 9B con tool calling y modo thinking en equipos Apple Silicon mediante mlx-serve, con una reduccion de huella de memoria de en torno al 50 por ciento respecto al original. Como contrapartida, es un artefacto de nicho (solo MLX), sin licencia ni idiomas declarados en la ficha, y el checkpoint upstream no incluye cabeza MTP, por lo que no hay decodificacion especulativa MTP disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (`qwen3_5`), transformer denso multimodal (torre de vision + texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afina (affine), group size 64; torre de vision y embeddings de tokens en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se indica que sigue los terminos del modelo upstream) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Tamano del repositorio | 9,4 GB |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (relacion: quantized) |
| Pipeline | image-text-to-text |
| Libreria / motor | mlx / mlx-serve |
| Fecha de creacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde al identificador `qwen3_5`, es decir, una familia Qwen3.5 de 9B, en este caso con capacidad multimodal (pipeline `image-text-to-text`). El modelo es denso, no emplea mezcla de expertos, y combina una torre de vision con el tronco de lenguaje. Sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO, datos de destilacion) no hay informacion en el material proporcionado: la model card de esta conversion no detalla el proceso de entrenamiento del checkpoint base.

La innovacion relevante de este repositorio es de despliegue, no de entrenamiento. Se aplica cuantizacion afina de 6 bits con group size 64 sobre los pesos del tronco, manteniendo en bf16 las partes sensibles a la precision (torre de vision y embeddings de tokens), lo que permite conservar la entrada de imagenes tras la cuantizacion. El autor indica que el checkpoint upstream no incluye cabeza MTP, por lo que no se puede aplicar decodificacion especulativa MTP con este artefacto. Se han probado modo thinking, tool calling y streaming sobre el motor mlx-serve.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo thinking (verificado por el autor en mlx-serve).
- Tool calling / function calling, con la etiqueta `tool-use` y pruebas declaradas de streaming.
- Flujos agenticos y razonamiento multi-paso, segun la etiqueta `agentic`.
- Entrada de imagen junto a texto (image-text-to-text), funcional porque la torre de vision se mantiene en bf16.
- Codigo y matematicas: no hay informacion explicita en la model card; se desconoce el grado de soporte.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible (no se mencionan).
- Decodificacion especulativa MTP: no disponible en este checkpoint.

## Casos de uso

- Asistentes conversacionales en local sobre Mac: el modelo se ejecuta con mlx-serve en Apple Silicon y mantiene conversaciones multi-turno sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Agentes con tool calling: al estar etiquetado como `agentic` y `tool-use`, puede integrarse en bucles de agente que invocan funciones externas (APIs, busqueda, calculo) y encadenan varios pasos.
- Analisis de documentos con imagen: gracias a la entrada image-text-to-text y a la torre de vision en bf16, se puede usar para extraer informacion de capturas, diagramas o formularios combinados con instrucciones de texto.
- Prototipado y evaluacion en portatiles Apple: con 9,4 GB de pesos, es viable probar un modelo multimodal de 9B en un Mac con memoria unificada suficiente, sin GPU dedicada.
- Razonamiento asistido con modo thinking: para tareas que requieren descomposicion explicita antes de responder, como planificacion o resolucion de problemas estructurados.
- Automatizacion de soporte tecnico interno: combinando contexto conversacional y llamadas a herramientas para consultar bases de conocimiento o sistemas de tickets.
- Desarrollo de demos y evaluaciones comparativas de cuantizacion: sirve como referencia para medir la degradacion de 6 bits afina frente al checkpoint bf16 en tareas de vision y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y tampoco se han encontrado datos en la busqueda web realizada.

## Requisitos de hardware

- Peso de los pesos: 9,4 GB en disco (cuantizacion de 6 bits afina, group size 64).
- VRAM / memoria: al ser un artefacto MLX, se ejecuta sobre memoria unificada de Apple Silicon, no sobre VRAM de GPU dedicada. Conviene disponer de al menos 16 GB de memoria unificada para pesos mas cache KV y overhead del runtime; 24-32 GB dan un margen comodo para contextos largos y uso multimodal.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4, en variantes base, Pro, Max y Ultra). El checkpoint no es ejecutable en CUDA con este formato.
- Cabe en GPU de consumo: no en el sentido de GPU dedicada; si cabe en equipos Apple Silicon de gama consumer con memoria unificada suficiente (por ejemplo, configuraciones de 16 GB o mas).
- Opciones de despliegue: mlx-serve es el motor documentado por el autor, con los comandos `mlx-serve pull` y `mlx-serve run`. El ecosistema MLX de Apple es el entorno natural para estos pesos; otros motores como vLLM, TGI o llama.cpp requeririan una conversion distinta, ya que este repositorio publica safetensors en formato MLX y no GGUF ni pesos compatibles con transformers estandar.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-6bit (este) | 9.409.813.744 | 6 bits afina, group size 64 | no disponible | safetensors MLX / mlx-serve | no disponible | publico, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (upstream) | 9.409.813.744 | bf16 (sin cuantizar) | no disponible | safetensors del autor original | no disponible | publico |
| Otras cuantizaciones del mismo base (GGUF u otros formatos) | heredados | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

Diferencias clave frente al upstream: la version de 6 bits reduce el tamano de 9,4 GB frente a los aproximadamente 18,8 GB del bf16, y mantiene en bf16 la torre de vision y los embeddings. No hay datos publicos de perdida de calidad asociada a esta cuantizacion. No se dispone de informacion suficiente sobre alternativas comparables de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta evaluaciones de sesgo ni composicion del dataset de entrenamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje de esta escala, agravado por la ausencia de benchmarks publicados.
- Limitaciones de contexto: la longitud de contexto no esta declarada en la ficha, por lo que debe verificarse antes de usarlo en produccion con documentos largos.
- Limitaciones de idioma: los idiomas soportados no estan declarados; no se puede asumir un rendimiento correcto en castellano sin evaluacion previa.
- Licencia: no disponible. La model card indica unicamente que la licencia y los terminos de uso siguen los del modelo upstream, sin especificarlos. Antes de un uso comercial es imprescindible consultar la ficha del modelo base.
- Restriccion de plataforma: los pesos estan en formato MLX y estan pensados para mlx-serve; no son directamente utilizables en stacks CUDA ni en motores que consuman GGUF o safetensors estandar de transformers.
- Ausencia de decodificacion especulativa MTP: el checkpoint upstream no incluye cabeza MTP, lo que limita las optimizaciones de latencia disponibles.
- Estado de validacion: el autor declara haber probado thinking, tool calling y streaming, pero no publica resultados de calidad; el repositorio tiene 0 descargas y 0 likes, por lo que carece de validacion externa.
- Sobre la cuantizacion: no se documenta la degradacion de precision en tareas de vision o de razonamiento largo respecto al modelo en bf16.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-6bit
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Motor de inferencia mlx-serve: https://github.com/ddalcu/mlx-serve
- Paper o blog del modelo original: no disponible en la informacion proporcionada.
- Otros repositorios, demos o documentacion adicional: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian al termino generico "query" y no guardan relacion con el modelo).

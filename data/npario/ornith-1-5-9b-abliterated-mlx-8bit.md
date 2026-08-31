# npario/Ornith-1.5-9B-Abliterated-MLX-8bit

## Resumen

Ornith-1.5-9B-Abliterated-MLX-8bit es un derivado experimental del modelo multimodal Ornith-1.5-9B, desarrollado por PocketAI Model Lab y publicado en el repositorio de npario. El objetivo de esta variante es estudiar si es posible reducir el comportamiento de rechazo aprendido (refusal behavior) mediante una técnica de edición de direcciones en el espacio de activaciones, conocida como abliteration, manteniendo al mismo tiempo las capacidades generales del modelo. Se distribuye en formato MLX-VLM con cuantización affine de 8 bits, pensado para ejecutarse en hardware Apple Silicon.

El modelo base, Ornith-1.5-9B, pertenece a la familia Ornith, una serie de modelos open-source orientados a tareas agénticas con un bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo. Esta versión abliterada elimina la dirección de rechazo identificada en la capa 23 y la resta en las capas 12 a 31, modificando 40 tensores de salida residual. No incluye el módulo MTP (Multi-Token Prediction) nativo del modelo original.

La relevancia de esta ficha radica en que ofrece una alternativa para investigar la alineación y el comportamiento de rechazo en modelos multimodales, con una validación interna que reporta 0/100 frases de rechazo explícitas en objetivos de rechazo y 72/80 en una suite media de capacidades. Sin embargo, se trata de un modelo experimental, no recomendado para producción sin una evaluación adicional en el contexto de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5, segun tags) |
| Parametros totales | 2.975.030.512 (segun safetensors; el nombre comercial indica 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine/group 64 RTN (esta version) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un modelo multimodal (imagen-texto) de la familia Ornith, que emplea una arquitectura transformer con capacidades agénticas y un mecanismo de auto-mejora. Segun la documentacion del proyecto, Ornith-1.5 extiende el framework de self-scaffolding a un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera scaffolds especificos y produce rollouts para aprendizaje por refuerzo. No se dispone de detalles sobre el numero de tokens de entrenamiento ni la composicion del dataset.

El proceso de abliteration aplicado en esta derivada consiste en identificar una direccion de rechazo en la capa 23 del modelo y restarla en las capas 12 a 31, modificando 40 tensores de salida residual. La escala de abliteration es 1.0. No se incluye el modulo MTP nativo. Las pruebas de humo de entrada de texto e imagen pasaron correctamente, con un pico de memoria de 12.01 GB durante la ejecucion.

## Capacidades

- Entrada multimodal: acepta imagenes y texto, y genera texto como salida.
- Generacion de texto, razonamiento, codigo, matematicas y comprension de contexto, segun la suite de validacion interna.
- Capacidad de seguir instrucciones y producir salida estructurada.
- Soporte multilingue: no especificado, aunque la suite de validacion incluye salida multilingue.
- Reduccion de rechazos explicitos: la abliteration elimina frases de rechazo en objetivos de rechazo (0/100 en la validacion).
- No se confirma soporte de tool calling ni funciones de agente, aunque el modelo base esta orientado a tareas agénticas.

## Casos de uso

- Investigacion en alineacion: estudiar el efecto de la abliteration sobre el comportamiento de rechazo y las capacidades generales, comparando con el modelo base sin editar.
- Prototipado de asistentes multimodales en Apple Silicon: gracias al formato MLX, se puede ejecutar localmente en Mac con al menos 16 GB de RAM, ideal para pruebas rapidas.
- Generacion de descripciones de imagenes: el modelo puede procesar capturas o diagramas y producir texto explicativo, util en entornos de documentacion automatica.
- Analisis de datos visuales en entornos de investigacion: extraer informacion de graficos o tablas en imagenes para su posterior procesamiento.
- Evaluacion de robustez: probar como responde el modelo a prompts que normalmente provocarian rechazo, para medir el impacto de la edicion.
- Desarrollo de agentes de auto-mejora: aunque esta version no incluye MTP, el modelo base esta disenado para proponer tareas y generar scaffolds, lo que puede explorarse en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica validacion reportada es interna, con los siguientes resultados:

| Prueba | Resultado |
|---|---|
| Frases de rechazo explicitas en objetivos de rechazo | 0/100 |
| Frases de rechazo explicitas en controles benignos | 0/100 |
| Suite media de capacidades (matematicas, razonamiento, codigo, etc.) | 72/80 |
| Prueba de humo en runtime | Pasada |

Estos resultados corresponden a ejecuciones de 256 tokens, por lo que son una evaluacion temprana y no representan una evaluacion completa de respuestas largas.

## Requisitos de hardware

- Memoria pico en la prueba de humo: 12.01 GB, por lo que se recomienda al menos 16 GB de RAM unificada en Apple Silicon.
- GPU recomendadas: cualquier Mac con chip M1, M2 o M3 con al menos 16 GB de memoria unificada.
- No cabe en GPUs de consumo convencionales (NVIDIA, AMD) porque el formato es MLX, exclusivo de Apple Silicon.
- Opciones de despliegue: exclusivamente mediante mlx-vlm (version 0.6.8) y mlx (version 0.32.0). No es compatible con vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. El modelo base Ornith-1.5-9B sin abliteration seria el comparador natural, pero no se han publicado especificaciones detalladas ni benchmarks en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo experimental: no esta recomendado para uso en produccion sin una evaluacion exhaustiva en el contexto especifico.
- La abliteration reduce los rechazos de forma amplia, lo que puede aumentar la probabilidad de respuestas inapropiadas, ilegales o peligrosas. No es un entrenamiento de veracidad ni una garantia de cumplimiento universal.
- Riesgo de alucinacion: al igual que otros modelos generativos, puede producir contenido falso o inventado.
- Validacion limitada: las pruebas se realizaron con 256 tokens, por lo que no cubren respuestas largas ni escenarios complejos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo es un derivado experimental y el autor recomienda aplicar salvaguardas adicionales.
- Solo compatible con Apple Silicon: no se puede ejecutar en GPUs NVIDIA o AMD sin convertir el formato.
- No incluye el modulo MTP nativo, lo que puede afectar al rendimiento en tareas de generacion larga.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/npario/Ornith-1.5-9B-Abliterated-MLX-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Pagina de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Version MLX-8bit de PocketAiHub: https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-8bit
- Version MLX-4bit de PocketAiHub: https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-4bit

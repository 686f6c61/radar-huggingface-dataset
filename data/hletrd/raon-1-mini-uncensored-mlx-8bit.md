# hletrd/Raon-1-mini-Uncensored-MLX-8bit

## Resumen

Raon-1-mini Uncensored MLX 8-bit es una variante modificada del modelo KRAFTON/Raon-1-mini, un transformer de arquitectura MoE (mezcla de expertos) con aproximadamente 28.780 millones de parametros totales. La modificacion, realizada por el usuario hletrd, elimina la direccion de rechazo (refusal direction) de los pesos del modelo original mediante una tecnica de abliteration, y convierte los pesos a formato MLX cuantizado en 8 bits para su ejecucion en hardware Apple Silicon. El modelo resultante mantiene la arquitectura y el codigo original de KRAFTON, pero responde sin rechazos a practicamente cualquier peticion, incluidas las que el modelo base rechazaria.

El modelo es relevante en el contexto de la investigacion sobre alineamiento y seguridad en IA: demuestra que es posible eliminar el comportamiento de rechazo de un modelo alineado mediante una intervencion quirurgica en los pesos, con una degradacion minima de la calidad general segun las metricas reportadas por el autor. La ventana de contexto es de 256K tokens, lo que lo hace adecuado para tareas de contexto largo. Los idiomas soportados son coreano e ingles.

La ficha se centra en las caracteristicas tecnicas del modelo, su proceso de modificacion, sus capacidades y limitaciones, y las consideraciones practicas para su despliegue en hardware Apple Silicon mediante MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atencion estandar y mecanismo de esfuerzo (effort-steering) |
| Parametros totales | 28.779.029.222 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | 8-bit affine (group size 64) para capas lineales, embedding y LM head; router gates MoE en BF16; existe variante 4-bit (19,9 GB) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 30,6 GB en el repositorio |

## Arquitectura y entrenamiento

El modelo base KRAFTON/Raon-1-mini es un transformer con arquitectura de mezcla de expertos (MoE), con aproximadamente 28.780 millones de parametros totales. Incluye mecanismos de "effort-steering" en las capas 12, 14, 16, 18 y 20, lo que sugiere un control dinamico del esfuerzo computacional o de razonamiento. El modelo original fue entrenado por KRAFTON y liberado con pesos en formato MXFP8, que el autor de esta variante descomprimio a BF16 para usarlos como referencia de comparacion. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineamiento (RLHF/DPO) en la informacion proporcionada.

La modificacion realizada por hletrd consiste en la eliminacion de una direccion de rechazo por capa, medida en cada capa individualmente, con los canales 1031 y 189 puestos a cero. La intervencion se aplica a las proyecciones de salida de atencion de las capas 6 a 20, a las proyecciones down de los expertos enrutados y compartidos de las capas 6 a 20, y a los vectores de effort-steering de las capas 12, 14, 16, 18 y 20, afectando a 1.955 tensores en total. La cabeza de salida y el embedding no se modifican. La cuantizacion es affine de 8 bits con group size 64 para las capas lineales, el embedding y el LM head, mientras que las compuertas del router MoE permanecen en BF16. El codigo del modelo es el archivo `raon_mlx_model.py` de KRAFTON/Raon-1-mini-mlx, incluido sin cambios.

## Capacidades

- Generacion de texto y conversacion multi-turno en coreano e ingles.
- Razonamiento con modo de pensamiento (thinking) activado por defecto; se puede desactivar mediante configuracion de la plantilla de chat.
- Capacidad de respuesta sin rechazos a practicas cualquier peticion, incluidas las que el modelo base rechazaria (segun la metrica HarmBench reportada por el autor).
- Soporte de contexto largo de hasta 256K tokens.
- Arquitectura MoE con enrutamiento de expertos, lo que permite un equilibrio entre capacidad total y coste computacional por token.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o capacidades multimodales en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un modelo sin rechazos y comparar su rendimiento con la version alineada, facilitando experimentos sobre los efectos de la abliteration en la calidad y coherencia de las respuestas.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin las limitaciones de un modelo alineado, con contexto de 256K tokens para proyectos largos.
- Analisis de textos de dominio publico que contienen contenido sensible: procesamiento de documentos historicos, legales o literarios que podrian activar rechazos en modelos convencionales, con la ventaja del contexto extendido.
- Desarrollo de aplicaciones de conversacion en coreano e ingles: el modelo soporta ambos idiomas y puede integrarse en sistemas de chat multi-turno con contexto largo para atencion al cliente o asistentes especializados.
- Evaluacion comparativa de tecnicas de cuantizacion: la existencia de variantes 4-bit y 8-bit, junto con las metricas de KL y top-1 reportadas, permite estudiar el impacto de la cuantizacion en la calidad del modelo.
- Experimentacion con arquitecturas MoE en Apple Silicon: el modelo esta optimizado para MLX y puede servir como banco de pruebas para el despliegue de modelos MoE de gran tamano en hardware Apple con memoria unificada.
- Generacion de codigo y tareas tecnicas: aunque no se dispone de benchmarks especificos, el modelo base esta disenado para generacion de texto general y puede emplearse en tareas de programacion, con la salvedad de que la abliteration podria afectar a la calidad en dominios especificos.

## Benchmarks y rendimiento

Los datos de benchmarks proporcionados por el autor comparan la variante Uncensored con el modelo original MLX 8-bit, usando KL divergence y top-1 agreement contra Raon-1-mini BF16, ademas de las tasas de rechazo en HarmBench y Alpaca.

| Modelo | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | 33-item answer check | HarmBench rechazados | Alpaca rechazados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Uncensored MLX 8-bit | 30,60 GB | 0,015375 | 94,23% | 0,011652 | 94,53% | 0,007405 | 95,73% | 32/33 (BF16: 32/33) | 0,0% | 0,0% |
| Original MLX 8-bit | 30,60 GB | 0,009532 | 95,42% | 0,004958 | 96,55% | 0,003637 | 96,47% | 32/33 (BF16: 32/33) | 99,0% | 1,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 30,6 GB para la variante 8-bit; 19,9 GB para la variante 4-bit.
- Hardware recomendado segun el autor: Mac Studio M5 Max con GPU de 40 nucleos y 48 GB o mas de memoria unificada para la variante 8-bit; Mac Studio M5 Max con GPU de 32 nucleos y 36 GB para la variante 4-bit; Mac Studio M5 Ultra con 96 GB o mas para contexto completo de 256K.
- No cabe en GPU consumer convencionales (RTX 4090 con 24 GB, etc.) en formato 8-bit; la variante 4-bit de 19,9 GB podria caber en GPUs con 24 GB, aunque el modelo esta optimizado para MLX y hardware Apple.
- Opciones de despliegue: MLX (mlx-lm 0.32.2, mlx 0.32.4) con `mlx_lm.generate` y `mlx_lm.chat`; requiere `--trust-remote-code`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hletrd/Raon-1-mini-Uncensored-MLX-8bit | 28,78B (MoE) | 256K | Apache 2.0 | safetensors MLX 8-bit | Sin rechazos (0,0% HarmBench), calidad ligeramente inferior al original |
| Xylolabs/Raon-1-mini-MLX-8bit | 28,78B (MoE) | 256K | Apache 2.0 | safetensors MLX 8-bit | Version alineada, 99,0% de rechazos en HarmBench, mejor KL y top-1 |
| KRAFTON/Raon-1-mini | 28,78B (MoE) | 256K | Apache 2.0 | MXFP8 | Modelo base original, pesos en BF16 de referencia |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo puede aumentar el riesgo de generar contenido danino, ilegal o eticamente cuestionable; el modelo no tiene filtros de seguridad efectivos.
- La calidad general se degrada ligeramente respecto al original: KL de 0,015375 frente a 0,009532 en WikiText-2, y top-1 de 94,23% frente a 95,42%.
- Sesgos conocidos: no se dispone de informacion especifica sobre sesgos en la informacion proporcionada; al ser un modelo entrenado principalmente en coreano e ingles, puede presentar sesgos culturales y linguisticos de esos dominios.
- Riesgo de alucinacion: presente en todos los modelos de lenguaje; la abliteration podria afectar a la calibracion de la confianza en dominios sensibles.
- Limitaciones de idioma: solo coreano e ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; el uso en produccion requiere evaluacion propia de riesgos.
- El modelo requiere `--trust-remote-code` para ejecutarse, lo que implica ejecutar codigo del repositorio; debe verificarse la integridad del codigo antes de usarlo en entornos de produccion.
- El modo de pensamiento esta activado por defecto, lo que aumenta la latencia; debe desactivarse explicitamente para respuestas directas.
- No se dispone de informacion sobre el proceso de entrenamiento original (datos, RLHF) en la informacion proporcionada, lo que limita la evaluacion de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Raon-1-mini-Uncensored-MLX-8bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Version MLX del modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Version MLX 8-bit original: https://huggingface.co/Xylolabs/Raon-1-mini-MLX-8bit
- Variante 4-bit: https://huggingface.co/hletrd/Raon-1-mini-Uncensored-MLX-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de Xylolabs (herramientas de cuantizacion): https://github.com/XylolabsInc/tensix-bfp-gptq

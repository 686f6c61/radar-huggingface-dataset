# h2oai/h2o-lightning-4b

## Resumen

H2O-Lightning-4B es un modelo de decisión de 4B parámetros desarrollado por H2O.ai sobre la base de Qwen/Qwen3.5-4B. No es un modelo generativo convencional: responde preguntas de decisión tipadas sobre un registro (un documento, un ticket, una política o una conversación) y sobre imágenes asociadas a ese registro (fotos, capturas de pantalla, documentos escaneados, gráficos), devolviendo una probabilidad calibrada para cada opción. Soporta tres tipos de decisión: elección entre opciones nombradas (choice), probabilidad de que un enunciado sea cierto (noul) y nivel ordinal sobre una escala declarada con su distribución de probabilidad (score).

El modelo está pensado para tareas de clasificación, enrutamiento y evaluación con requisitos de calibración, no para generación libre de texto. Cada decisión se resuelve con un único forward pass y un único token de salida, de modo que el coste computacional depende solo de los tokens de entrada. Es relevante ahora porque ocupa los primeros puestos de JevBench e ImageJevBench, los tableros de referencia para modelos de decisión, y porque se distribuye con licencia Apache 2.0 y pesos abiertos, algo poco habitual en esta categoría.

La arquitectura subyacente es la del modelo base Qwen3.5-4B, con 4.659.865.088 parámetros totales según los pesos en safetensors, y admite entrada multimodal imagen-texto. H2O.ai publica además un paquete de servicio propio sobre vLLM 0.30.0 con un modo de lectura bidireccional por petición que mejora los resultados del tablero frente a la lectura unidireccional estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen/Qwen3.5-4B; modelo de decisión con cabeza de salida de un token |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (llama.cpp); MLX 8-bit (q8) y 4-bit (q4) publicados por NetProjects; cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF; MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con entrada de imagen y texto, y se ajusta como modelo de decisión: en lugar de generar texto libre, emite una distribución de probabilidad sobre opciones tipadas (choice, noul, score). La salida se produce en un único token, lo que convierte cada inferencia en un forward pass único y hace que el coste sea proporcional únicamente a la longitud de la entrada. El pipeline declarado en Hugging Face es image-text-to-text, y el repositorio incluye material gráfico y de evaluación propio del proyecto.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí documenta una innovación destacable en el plano del servicio: un build propio de vLLM 0.30.0 con atención por petición y un shim de librería estándar (`h2o_lightning_shim.py`) que permite leer cada petición en modo bidireccional. Según el autor, este modo bidireccional resuelve 206 de los 231 ítems públicos de JevBench, frente a 202 en el modo unidireccional con vLLM estándar. El paquete incluye scripts de servicio (`serve.sh`) y comandos específicos para reproducir JevBench, el Decision Index y la pista Box de ImageJevBench.

## Capacidades

- Respuesta a preguntas de decisión tipadas sobre registros textuales: elección entre opciones nombradas, probabilidad de verdad de un enunciado y nivel ordinal con distribución.
- Decisión multimodal: procesa imágenes asociadas al registro (fotos, capturas, documentos escaneados, gráficos) junto con el texto.
- Calibración de probabilidades: devuelve una probabilidad por opción, no solo la etiqueta ganadora.
- Salida de un único token por decisión, lo que reduce latencia y coste al mínimo por petición.
- Soporte de conversación multi-turno según los tags del modelo (conversational).
- Compatibilidad con endpoints (tag endpoints_compatible) y despliegue en vLLM mediante el paquete de servicio de H2O.ai.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; el modelo está orientado a decisiones puntuales.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Triaje de tickets de soporte: dado un ticket y una taxonomía de categorías, el modelo devuelve la probabilidad de cada categoría y permite enrutar con umbrales de confianza explícitos en lugar de depender de la etiqueta más probable.
- Moderación y cumplimiento de políticas: evaluar si un documento o una conversación cumple una política concreta mediante decisiones noul (probabilidad de que el enunciado sea cierto), con trazabilidad de la confianza.
- Procesamiento de documentos escaneados: al aceptar imagen y texto, puede clasificar formularios, facturas o capturas de pantalla junto con metadatos textuales en un solo paso.
- Evaluación de riesgo crediticio o de seguros con escalas ordinales: la salida score devuelve la distribución sobre niveles, lo que permite fijar políticas de decisión por probabilidad acumulada.
- Enrutamiento en pipelines de agentes: usar el modelo como componente de decisión barato (un forward pass, un token) que selecciona la siguiente acción o herramienta a partir del estado de la conversación.
- Análisis de gráficos e informes: combinando la entrada de imagen con el registro textual, puede responder preguntas de decisión sobre tendencias o valores representados en gráficos.
- Control de calidad en atención al cliente: puntuar conversaciones multi-turno sobre una escala declarada y usar la distribución para detectar casos ambiguos que requieran revisión humana.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (JevBench e ImageJevBench son los tableros de referencia para modelos de decisión; las cifras corresponden a la release indicada en cada caso):

| Benchmark | Posicion | Comparativa citada |
|---|---|---|
| ImageJevBench v0.3.0, Composite (pesos abiertos) | #1 de 46 (#2 de 55 incluyendo API) | Drex Max 44,65; Jev 1.13.0 + images 26,43; Clef-Flash 20,41; Liquid d1-3B 4,10 |
| ImageJevBench v0.3.0, Intelligence (pesos abiertos) | #2 de 46 (#6 de 55) | Por delante de Clef 47,40 y Liquid d1-3B 16,31 |
| ImageJevBench v0.3.0, Capability (pesos abiertos) | #2 de 46 (#6 de 55) | Por delante de Clef 58,08 y Liquid d1-3B 47,78 |
| JevBench (tablero 2026-10-28), Composite (pesos abiertos) | #2 de 170 (#12 de 201) | d1 (Liquid AI) 72,82; Microsoft-Decision-1 69,08; OpenAI Decisions 62,37; pplx-decider-flash 54,01 |
| ImageJevBench Box track (PREVIEW) v0.3.0, Box Capability | #1 de 4 (#1 de 5) | Jev 1.14.0 (TypeSafe) 75,71 |
| ImageJevBench computer-use track v0.3.0, Composite | #1 de 46 (#3 de 55) | Liquid d1-3B 66,22; Clef-Flash 55,29 |

Además, el autor reporta 206 de 231 ítems públicos de JevBench resueltos con el modo bidireccional y 202 de 231 con vLLM estándar unidireccional. NetProjects reporta 205/231 en modo bidireccional y 201/231 en unidireccional para las versiones MLX. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,66B parámetros, en FP16 serían aproximadamente 9,3 GB de pesos, y en cuantización de 8 bits unos 4,7 GB, cifras orientativas no confirmadas por el autor.
- GPU recomendadas: no especificadas en la información disponible. El despliegue de referencia es vLLM 0.30.0 con el build propio de H2O.ai.
- GPU de consumo: las versiones MLX 8-bit y 4-bit de NetProjects están pensadas para Apple silicon; la viabilidad en GPU de consumo no se detalla.
- Opciones de despliegue: vLLM 0.30.0 (build de H2O.ai con lectura bidireccional, o estándar con `TWO_WAY=0`), llama.cpp mediante GGUF, MLX en Apple silicon y transformers.
- Latencia y throughput: cada decisión es un forward pass y un token de salida; el autor indica que el modo unidireccional con caché de prefijo sirve más peticiones por segundo bajo carga, mientras que el bidireccional mejora la precisión. No se publican cifras concretas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench Composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H2O-Lightning-4B | 4,66B | no disponible | #2 de 170 en pesos abiertos; d1 (Liquid AI) 72,82 citado como referencia superior | Apache 2.0 | Pesos abiertos (safetensors, GGUF, MLX) |
| d1 (Liquid AI) | no disponible | no disponible | 72,82 (por delante en el tablero citado) | no disponible | no disponible |
| Microsoft-Decision-1 | no disponible | no disponible | 69,08 | no disponible | no disponible |
| Jev 1.13.0 + images (TypeSafe) | no disponible | no disponible | 26,43 en ImageJevBench Composite | no disponible | API |

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no está diseñado para producir texto libre, resúmenes ni código; su salida es una distribución sobre opciones predefinidas.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5-4B, puede heredar sesgos del modelo base y de sus datos de ajuste.
- Riesgo de alucinación: reducido por el formato de salida cerrado, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento, que no se detallan.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar comportamiento en castellano o con entradas largas.
- Dependencia del stack de servicio: los mejores resultados del tablero se obtienen con el build propio de vLLM y el shim de H2O.ai; con vLLM estándar se pierden ítems (202 frente a 206 de 231).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y de los artefactos de terceros (GGUF, MLX).
- Las cifras de benchmarks proceden del propio autor y de tableros específicos de modelos de decisión; no son comparables con benchmarks de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h2oai/h2o-lightning-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/h2oai/h2o-lightning-4b
- GGUF para llama.cpp: https://huggingface.co/h2oai/h2o-lightning-4b-gguf
- MLX 8-bit (NetProjects): https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q8
- MLX 4-bit (NetProjects): https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q4

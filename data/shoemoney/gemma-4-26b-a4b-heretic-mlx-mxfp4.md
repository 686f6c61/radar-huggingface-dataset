# shoemoney/Gemma-4-26B-A4B-Heretic-MLX-mxfp4

## Resumen

Este modelo es una cuantización MXFP4 (4-bit) del modelo `coder3101/gemma-4-26B-A4B-it-heretic`, una variante afinada y "sin censura" del Gemma 4 26B A4B de Google DeepMind. El autor, shoemoney, ha convertido los pesos BF16 originales a formato MXFP4 utilizando la herramienta `mlx_vlm.convert`, sin realizar fine-tuning adicional ni re-alineación. El resultado es un modelo optimizado para ejecutarse en hardware Apple Silicon mediante la librería MLX, con un tamaño en disco de 14,59 GB.

El modelo base es un VLM (vision-language model) multimodal que procesa entradas de texto e imagen y genera texto, con una arquitectura MoE (Mixture of Experts) de 26B parámetros totales y 4B activos. Está optimizado para tareas de razonamiento, generación de código y flujos agénticos, con una ventana de contexto de 32.768 tokens. Esta cuantización mantiene esas capacidades pero reduce significativamente los requisitos de memoria, permitiendo su ejecución en equipos Apple con memoria unificada moderada.

La relevancia de este modelo radica en que ofrece una versión compacta y eficiente de un VLM de última generación, con licencia Apache 2.0, pensada para desarrolladores que trabajan en ecosistemas Apple y necesitan desplegar modelos multimodales localmente sin depender de GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4, multimodal (texto + imagen) |
| Parametros totales | 26B (modelo base); el archivo safetensors cuantizado contiene 5.302.955.598 parametros |
| Parametros activos | 4B (A4B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | MXFP4 (4-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `coder3101/gemma-4-26B-A4B-it-heretic` es una variante instruction-tuned y "decensored" del Gemma 4 26B A4B de Google. La arquitectura es un transformer con mezcla de expertos (MoE), donde de los 26B parámetros totales solo 4B se activan por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. El modelo procesa tanto texto como imágenes, generando texto como salida.

Esta versión concreta no ha sido entrenada ni ajustada: es una conversión puramente de cuantización. Los pesos BF16 originales se convirtieron a MXFP4 con `mlx_vlm.convert`, manteniendo el mismo tamaño de grupo para toda la familia de cuantizaciones. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El modelo base declara un 88,3% en AIME (probablemente AIME 2024), lo que indica un buen rendimiento en razonamiento matemático.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto e imagen y genera texto, lo que permite tareas de descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Razonamiento y resolución de problemas: optimizado para tareas de razonamiento complejo, incluyendo matemáticas (88,3% en AIME según el modelo base).
- Generación de código: capaz de escribir, explicar y depurar código a partir de descripciones textuales o capturas de pantalla.
- Flujos agénticos: diseñado para soportar razonamiento multi-paso y toma de decisiones secuenciales, adecuado para agentes autónomos.
- Ventana de contexto larga: 32.768 tokens, suficiente para documentos extensos o conversaciones multi-turno con contexto amplio.
- Sin censura: al ser una variante "heretic", no aplica los filtros de seguridad habituales de los modelos de Google, lo que permite generar contenido que otros modelos rechazarían (con los riesgos asociados).

## Casos de uso

- Asistente de programación con soporte visual: un desarrollador puede capturar una pantalla con un error y pedir al modelo que lo explique y proponga una corrección, gracias a su capacidad multimodal y de generación de código.
- Análisis de documentos técnicos: procesar PDFs o imágenes de diagramas, tablas o gráficos para extraer información y responder preguntas sobre ellos, aprovechando la ventana de 32K tokens.
- Automatización de tareas de soporte: integrar el modelo en un sistema de atención al cliente que reciba capturas de pantalla de problemas de usuario y genere respuestas técnicas detalladas.
- Agente de razonamiento multi-paso: desplegar el modelo como motor de un agente que planifica y ejecuta tareas complejas (por ejemplo, navegación web o gestión de archivos) combinando visión y texto.
- Generación de contenido visual descriptivo: crear descripciones accesibles para imágenes en plataformas de contenido, o generar metadatos automáticos para bancos de imágenes.
- Prototipado rápido en investigación: investigadores que necesitan un VLM local y eficiente para experimentos de razonamiento visual sin depender de APIs externas, gracias a la licencia Apache 2.0 y al formato MLX.

## Benchmarks y rendimiento

La model card reporta mediciones propias de esta cuantización, realizadas en un Apple M3 Ultra con 96 GB de memoria unificada:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 195,105 |
| Perplejidad relativa a la mejor de la familia | 1,94× |
| Throughput (1 peticion) | 43,8 tok/s |
| Throughput (8 peticiones concurrentes) | 143,8 tok/s |

El modelo base declara un 88,3% en AIME (según featherless.ai), aunque no se especifica si es AIME 2024 o 2025. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Diseñado para Apple Silicon: requiere macOS con chip M-series y memoria unificada. Se ha probado en un M3 Ultra con 96 GB, pero el tamaño en disco de 14,59 GB sugiere que puede ejecutarse en equipos con 32 GB o más de memoria unificada.
- No es compatible con GPUs NVIDIA de forma nativa: al usar MLX, está restringido al ecosistema Apple. Para otros entornos existe una versión GGUF del mismo modelo base (ver enlaces), pero no es este artefacto.
- Inferencia: se recomienda al menos 16 GB de memoria unificada para la cuantización MXFP4, aunque para contextos largos (32K tokens) se necesitará más.
- Despliegue: se utiliza con la librería `mlx-vlm` (no `mlx-lm`), mediante el comando `mlx_vlm.generate`. No se mencionan opciones como vLLM u Ollama para este formato.
- Latencia: el throughput medido es de 43,8 tok/s en peticiones individuales y 143,8 tok/s con 8 concurrentes, lo que da una idea del rendimiento en hardware de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| shoemoney/Gemma-4-26B-A4B-Heretic-MLX-mxfp4 | 26B (4B activos) | 32.768 | Apache 2.0 | MLX MXFP4 | Cuantizacion para Apple Silicon |
| coder3101/gemma-4-26B-A4B-it-heretic | 26B (4B activos) | 32.768 | Apache 2.0 | BF16 / GGUF | Modelo base sin cuantizar, disponible en varios formatos |
| google/gemma-4-26B-A4B | 26B (4B activos) | 32.768 | Apache 2.0 | BF16 | Version original de Google, con filtros de seguridad |

La comparativa se limita a la familia Gemma 4 26B A4B, ya que no se dispone de datos de otros modelos MoE similares en la informacion proporcionada. La principal diferencia entre las tres versiones es el formato de pesos y el nivel de censura: la variante "heretic" elimina los filtros de seguridad, mientras que la original de Google los mantiene.

## Limitaciones y advertencias

- Pérdida de calidad por cuantizacion: la perplejidad medida (195,105) es 1,94 veces peor que la mejor cuantizacion de la misma familia, lo que indica una degradacion notable en la calidad del texto generado. Para tareas que requieran alta fidelidad, se recomienda usar el modelo en BF16.
- Contenido sin censura: al ser una variante "heretic", el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones comerciales donde se requiera moderacion de contenido.
- Sesgos y alucinaciones: no se dispone de evaluaciones de sesgos para esta cuantizacion. Como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: no se ha especificado la lista de idiomas soportados. El modelo base de Gemma 4 es multilingue, pero esta cuantizacion no documenta su cobertura.
- Restricciones de hardware: el formato MLX limita su uso a Apple Silicon. No se puede ejecutar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF).
- Sin garantias de produccion: el autor no ha realizado fine-tuning ni re-alineacion, y las mediciones se hicieron en un solo equipo. No hay informacion sobre estabilidad en entornos de produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoemoney/Gemma-4-26B-A4B-Heretic-MLX-mxfp4
- Modelo base (coder3101): https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Version GGUF del modelo base: https://local-ai-zone.github.io/models/gemma-4-26b-a4b-it-heretic.html
- Ficha del modelo base en featherless.ai: https://featherless.ai/models/coder3101/gemma-4-26B-A4B-it-heretic

# ashfdsghsgdnb/Qwen3.8-3.6-27B-blend-oQ4e-mtp

## Resumen

Este repositorio contiene una conversión cuantizada a 4 bits en formato MLX del modelo JetBrains/Qwen3.8-3.6-27B-blend, un derivado multimodal (imagen-texto-a-texto) publicado por JetBrains a partir de modelos Qwen de Alibaba Cloud. El modelo base no es un entrenamiento nuevo: es una mezcla 50/50 de los checkpoints Qwen3.6-27B y Qwen3.8-27B obtenida por interpolación lineal de sus parámetros, conservando la configuración, el tokenizador, el procesador y la plantilla de chat de Qwen3.8-27B. El resultado es un transformer denso de aproximadamente 27.800 millones de parámetros con torre de visión, orientado a cargas de trabajo de codificación local y a la eficiencia de tokens.

La relevancia de esta ficha concreta es doble. Por un lado, documenta una variante de cuantización para Apple Silicon con decodificación especulativa basada en el cabezal MTP nativo del modelo, con aceptación de borradores medida del 82,1 % (texto) y 83,9 % (imagen) en pruebas de humo oficiales. Por otro, conviene advertir que este repositorio en particular (autor `ashfdsghsgdnb`, 0 descargas y 0 likes en el momento de la consulta) es una reproducción de terceros de la conversión MLX 4-bit de JetBrains, y que el sufijo `oQ4e-mtp` no coincide con la nomenclatura documentada por JetBrains.

La licencia es Apache 2.0 y el modelo se distribuye sin entrenamiento ni ajuste adicional: el trabajo del derivado consistió únicamente en la mezcla de checkpoints y en la extracción, conversión de formato y cuantización. No se han publicado datos de contexto máximo, composición del dataset de entrenamiento ni resultados numéricos de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen-texto-a-texto), familia Qwen3 (etiqueta `qwen3_5`); torre de visión en BF16 denso |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits MLX con cuantización afín RTN, tamano de grupo 64 (torre de visión en BF16 denso); la familia base tambien publica BF16 y GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (se conserva la LICENSE original de Qwen, Copyright 2026 Alibaba Cloud) |
| Formato de pesos | Safetensors en formato MLX (`mlx-vlm`); existen variantes GGUF y BF16 del modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3 con capacidades multimodales: el pipeline declarado es `image-text-to-text` y la torre de visión se mantiene en BF16 denso mientras el modelo de lenguaje se cuantiza a 4 bits. La innovación operativa más destacable es el cabezal MTP (multi-token prediction) nativo del modelo, suministrado como artefacto separado y utilizado como drafter para decodificación especulativa: en la invocación de referencia se pasa con `--draft-model` y `--draft-kind mtp`. Esto permite generar varios tokens por paso de verificación y es la palanca principal de eficiencia de tokens que JetBrains documenta en su artículo de Junie Local.

En cuanto al entrenamiento, no hubo ninguno en este derivado. El modelo base se construyó interpolando linealmente los parámetros de Qwen3.6-27B y Qwen3.8-27B al 50/50; los detalles exactos de revisiones de origen y ajustes de mezcla se registran en `merge-manifest.json`, y los ajustes de conversión y versiones de runtime en `conversion-manifest.json`. La model card indica explícitamente que no se realizó entrenamiento ni ajuste adicional y que no se usó ningún dato de entrenamiento nuevo. La información sobre el número de tokens, composición del dataset y etapas de RLHF/DPO de los checkpoints Qwen de origen no está disponible en la documentación proporcionada: la página Training Data Summary de Qwen describe los datos de los modelos que alimentan qwen.ai en general, pero no identifica los datasets exactos de estos dos checkpoints.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Comprensión de imágenes combinada con texto (`image-text-to-text`): en la prueba de humo oficial el modelo identificó correctamente un cuadrado rojo y un círculo azul.
- Generación de código: la prueba de humo de texto produjo una respuesta completa en Python de 1.863 tokens.
- Modo de razonamiento explícito, activable con `--enable-thinking`; las pruebas de validación se ejecutaron con thinking habilitado, temperatura 1.0, top-p 0.95 y top-k 20.
- Decodificación especulativa con el cabezal MTP nativo, con aceptación de borradores del 82,1 % (texto) y 83,9 % (imagen) en las pruebas de humo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada, aunque el caso de uso declarado por JetBrains es un asistente de codificación local (Junie Local).
- Capacidades multilingües: no disponible; el campo de idiomas de HuggingFace aparece vacío.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente de codificación local en Apple Silicon: el modelo está pensado para ejecutarse con `mlx-vlm` en un equipo Apple M5 Max y generar funciones completas (por ejemplo, fusionar dos listas ordenadas) sin salir del portátil, con la ventaja de privacidad de no enviar código a servicios externos.
- Autocompletado y revisión de código en el IDE: con el modo thinking y el drafter MTP se pueden producir parches y explicaciones dentro del editor, optimizando el coste en tokens de salida, que es la métrica que JetBrains mide en su benchmark interno de 100 tareas de codificación.
- Descripción y depuración de capturas o diagramas: al aceptar entrada de imagen y texto, se puede adjuntar una captura de pantalla de un error, un diagrama de arquitectura o un mockup de interfaz y pedir explicación o código asociado.
- Extracción de datos de documentos escaneados o formularios: la combinación de visión y generación de texto permite transcribir y estructurar contenido de imágenes dentro de un pipeline local.
- Generación de tests y documentación: el modelo puede redactar pruebas unitarias y docstrings a partir de fragmentos de código, integrándose en un flujo de pre-commit o de CI que no requiera GPU en la nube.
- Prototipado de aplicaciones multimodales en macOS: gracias a la librería `mlx-vlm` y al formato safetensors MLX, sirve como base para experimentar con decodificación especulativa y medir aceptación de borradores en hardware propio.
- Análisis de imágenes en local con requisitos de privacidad: casos como inspección visual de productos, clasificación de imágenes médicas o revisión de material sensible donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona un benchmark interno de codificacion de 100 tareas de JetBrains, pero solo lo enlaza como grafico y no proporciona cifras en el texto. Los unicos numeros verificables son de validacion estructural y pruebas de humo, recogidos en la tabla siguiente.

| Prueba | Resultado |
|---|---|
| Verificacion estructural (cuantizacion, inventario de tensores, compatibilidad principal/drafter, offsets de norma MTP) | Superada |
| Prueba de humo de texto | Respuesta completa en Python, 1.863 tokens, 82,1 % de aceptacion del borrador |
| Prueba de humo de imagen | Identificacion correcta de cuadrado rojo y circulo azul, 234 tokens, 83,9 % de aceptacion del borrador |
| Benchmark interno de codificacion de 100 tareas de JetBrains | Cifras no disponibles en el texto; solo se publica el grafico |

El autor advierte de forma explícita que estas pruebas son comprobaciones de humo y no constituyen un benchmark de calidad ni una comparación frente a BF16.

## Requisitos de hardware

- Inferencia en 4 bits MLX: el repositorio ocupa 17,0 GB. Con 27,8 B de parámetros a 4 bits, el peso ronda los 15-16 GB, más caché KV y la torre de visión en BF16. Se recomienda un equipo Apple Silicon con al menos 32 GB de memoria unificada (familias M3 Max, M4 Max o M5 Max); 24 GB resulta ajustado.
- Entorno validado: MLX-VLM 0.6.15 (revisión `20eec6cb5564c6a196b046d869d2081c29e3ff92`), MLX 0.32.0 y Transformers 5.14.0 sobre un Apple M5 Max.
- El drafter MTP es un artefacto separado y añade un consumo adicional de memoria no cuantificado en la información disponible.
- Estimación para BF16: unos 55-56 GB de pesos, lo que requiere una A100 80 GB, una H100 80 GB o dos A100 40 GB. Cálculo aproximado a partir del recuento de parámetros, no una cifra publicada por el autor.
- Estimación para GGUF: con cuantizaciones de 4 bits (Q4_K_M) el modelo cabría en una RTX 4090 o RTX 3090 de 24 GB; en 8 bits (unos 29 GB) necesitaría una A6000 48 GB o dos GPU de 24 GB. Cálculo aproximado, no confirmado por el autor.
- Opciones de despliegue: `mlx-vlm` para MLX en Apple Silicon (opción documentada); llama.cpp, Ollama o LM Studio para las variantes GGUF del modelo base; vLLM o TGI para la variante BF16 en GPU. Ninguna de estas últimas está documentada en la información proporcionada para este repositorio concreto.
- Latencia y throughput: no disponibles. Lo único reportado es la tasa de aceptación del borrador MTP (82,1 % y 83,9 %) en dos pruebas de humo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ashfdsghsgdnb/Qwen3.8-3.6-27B-blend-oQ4e-mtp | 27,8 B | No disponible | Safetensors MLX 4 bits | Apache 2.0 | Repositorio de terceros, 0 descargas |
| JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit | No disponible | No disponible | Safetensors MLX 4 bits | Apache 2.0 | Conversion oficial de JetBrains |
| JetBrains/Qwen3.8-3.6-27B-blend (BF16) | No disponible (27 B en el nombre) | No disponible | Safetensors BF16 | Apache 2.0 | Modelo base oficial |
| Qwen/Qwen3.6-27B | No disponible | No disponible | No disponible | Apache 2.0 heredada del derivado | Modelo upstream de Alibaba Cloud |
| Qwen/Qwen3.8-27B | No disponible | No disponible | No disponible | Apache 2.0 heredada del derivado | Modelo upstream de Alibaba Cloud |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia y procedencia.

## Limitaciones y advertencias

- Se trata de una reproducción de terceros: el autor del repositorio (`ashfdsghsgdnb`) no es JetBrains y no se documenta ninguna relación con la conversión oficial. El sufijo `oQ4e-mtp` no aparece en la nomenclatura de JetBrains, por lo que el esquema exacto de cuantización de esta copia no puede confirmarse más allá de lo que indica la model card reproducida.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta y se creó y actualizó el 3 de octubre de 2026, sin histórico de validación independiente.
- El modelo base es una interpolación lineal de dos checkpoints; este tipo de mezclas puede degradar capacidades de forma no uniforme y no se ha publicado ninguna comparación de calidad frente a los modelos originales.
- Riesgo de alucinación: no cuantificado en la información disponible. Es un riesgo inherente a los modelos generativos y no hay evaluaciones de fidelidad publicadas.
- Las pruebas de validación son comprobaciones de humo (una respuesta de texto y una imagen), no un benchmark de calidad ni una comparación contra BF16; el propio autor lo advierte.
- Idiomas soportados: sin declarar. No se puede asumir un rendimiento multilingüe concreto, y en particular el comportamiento en castellano no está verificado.
- Longitud de contexto: no declarada. No se debe planificar un caso de uso que dependa de ventanas largas sin medirlo previamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se conservan los avisos de copyright de Qwen (Copyright 2026 Alibaba Cloud) y de JetBrains (Copyright © 2026 JetBrains s.r.o.). Es obligatorio mantener los ficheros LICENSE, NOTICE y CHANGES.md en las redistribuciones.
- El modelo es un derivado no oficial: la model card aclara que no está afiliado, patrocinado ni respaldado por Alibaba Cloud ni por Alibaba Group.
- Uso en producción: no hay datos publicados de latencia, throughput, estabilidad ni consumo de memoria bajo carga sostenida; cualquier despliegue debería acompañarse de una evaluación propia.
- Esta variante está atada al ecosistema MLX y, por tanto, a hardware Apple Silicon. Para GPU NVIDIA o AMD habría que recurrir a las variantes GGUF o BF16 del modelo base.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/ashfdsghsgdnb/Qwen3.8-3.6-27B-blend-oQ4e-mtp
- Modelo base BF16 de JetBrains: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Conversión oficial MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit
- Drafter MTP MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit
- Variante GGUF: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-GGUF
- Model card upstream Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Model card upstream Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Resumen de datos de entrenamiento de Qwen: https://qwen.ai/training-data-summary
- Articulo de JetBrains sobre Junie Local y eficiencia de tokens: https://blog.jetbrains.com/junie/2026/09/smarter-local-al/
- Revision del checkpoint de origen citada en la model card: `f1a19acf58aa8caf7a0a507c9083245f79944dcc`
- Ficheros de trazabilidad citados: `merge-manifest.json`, `conversion-manifest.json`, `NOTICE`, `CHANGES.md`, `LICENSE`
- Nota: los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (son articulos en arabe sobre estructura organizacional) y no se han utilizado como fuente.

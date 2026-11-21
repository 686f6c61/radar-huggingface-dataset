# mlx-community/Inkling-2-Mini-4bit

## Resumen

Inkling-2-Mini-4bit es una conversión al formato MLX del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 6.896 millones de parámetros totales, capaz de procesar entradas conjuntas de texto e imagen (pipeline image-text-to-text). La conversión la mantiene la comunidad mlx-community y está pensada para ejecución eficiente en hardware Apple Silicon mediante el framework MLX de Apple.

El modelo emplea una arquitectura denominada `inkling2_loop`, que combina expertos enrutados con mecanismos de atención y compuertas de mensajes en bucle (loop message gates). La cuantización es heterogénea: los expertos enrutados conservan su cuantización original (NVFP4 en las capas 0 a 19 y MXFP8 en las capas 20 a 23), mientras que atención, embeddings y cabeza de salida se cuantizan a 4 bits afín con grupo de tamaño 64. La torre de visión permanece en bfloat16 y el router en float32.

Su relevancia actual radica en que permite desplegar un modelo MoE multimodal con licencia Apache 2.0 en equipos Apple, algo poco habitual en el ecosistema de modelos abiertos. No incluye el borrador DSpark de decodificación especulativa que sí trae el modelo original, por lo que la inferencia no se beneficia de esa aceleración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop (MoE con expertos enrutados y compuertas de mensajes en bucle) |
| Parametros totales | 6.896.142.848 (~6,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín (grupo 64) en atención, embeddings y cabeza de salida; expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); torre de visión en bfloat16; router en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Inkling-2-Mini es un transformer de tipo Mixture of Experts con una variante arquitectónica propia etiquetada como `inkling2_loop`. Incorpora expertos enrutados (routed experts) gestionados por un router en float32, además de compuertas de mensajes en bucle que no se cuantizan en esta conversión. La componente multimodal se materializa en una torre de visión que se mantiene en bfloat16 para preservar la calidad de las representaciones visuales. El modelo base procede de Thinking Machines y esta conversión se generó con mlx-lm a partir de una rama específica de un pull request (ml-explore/mlx-lm#2086).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta en la información disponible ninguna innovación de decodificación más allá de la mención al borrador DSpark del modelo original, que no está incluido en esta conversión MLX.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat.
- Comprensión de imágenes y texto combinados (image-text-to-text), con torre de visión integrada.
- Razonamiento y generación de contenido a partir de entradas visuales.
- Soporte de chat template para formateo de mensajes.
- Servidor de inferencia integrado (`mlx_lm.server`) que acepta imágenes como partes `image_url` de un mensaje.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse íntegramente en Apple Silicon mediante MLX, permitiendo un chatbot privado sin conexión a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales para extraer información o resumir contenido.
- Prototipado rápido de aplicaciones multimodales: la licencia Apache 2.0 y el formato MLX facilitan iterar sobre demos de visión-lenguaje en portátiles Apple sin infraestructura GPU dedicada.
- Descripción y etiquetado de imágenes: útil para generar metadatos textuales de imágenes en pipelines de catalogación, aprovechando la torre de visión en bfloat16.
- Servicio de inferencia local con API compatible: mediante `mlx_lm.server` se puede exponer el modelo como endpoint que acepte mensajes con imágenes, integrándolo en aplicaciones existentes.
- Investigación en eficiencia de cuantización: la mezcla de NVFP4, MXFP8 y 4-bit afín en distintas partes del modelo lo convierte en un caso de estudio para evaluar el impacto de cuantizaciones heterogéneas en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 17,3 GB, por lo que se recomienda al menos 18-20 GB de memoria unificada para cargar los pesos, con margen adicional para el contexto y las activaciones.
- Hardware recomendado: equipos Apple Silicon con memoria unificada amplia (por ejemplo, configuraciones de 24 GB o superiores). No aplica a GPU NVIDIA/AMD, ya que el formato es MLX.
- ¿Cabe en consumer GPU? No en el sentido tradicional: está diseñado para Apple Silicon, no para GPU discretas. En Mac con 24 GB o más de memoria unificada es viable.
- Opciones de despliegue: `mlx-lm` (requiere la rama del PR ml-explore/mlx-lm#2086) y `mlx_lm.server` para servir el modelo con soporte de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada. La ausencia del borrador DSpark implica que no se aprovecha la decodificación especulativa del modelo original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-4bit (este) | ~6,9 mil M | no disponible | Texto + imagen | Apache 2.0 | MLX (safetensors) |
| thinkingmachines/Inkling-2-Mini (original) | no disponible | no disponible | Texto + imagen | Apache 2.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- Conversión comunitaria: no es una versión oficial de Thinking Machines; posibles desviaciones respecto al modelo original.
- Requiere una rama específica de mlx-lm (PR #2086), lo que implica inestabilidad potencial y falta de soporte en versiones estables.
- No incluye el borrador DSpark, por lo que se pierde la decodificación especulativa del modelo original y el rendimiento puede ser inferior.
- Cuantización heterogénea: la mezcla de NVFP4, MXFP8 y 4-bit afín puede introducir degradación de calidad no cuantificada en los benchmarks disponibles.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente en castellano u otros idiomas no verificados.
- Longitud de contexto no disponible; no se puede garantizar el manejo de contextos largos.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de benchmarks publicados.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Solo ejecutable en el ecosistema MLX (Apple Silicon); no es portable a vLLM, llama.cpp u otros runners sin reconversión.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pull request de mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2086
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

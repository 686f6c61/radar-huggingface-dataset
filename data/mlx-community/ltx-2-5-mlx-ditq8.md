# mlx-community/ltx-2.5-mlx-ditq8

## Resumen

El modelo `mlx-community/ltx-2.5-mlx-ditq8` es una conversión a formato MLX del transformer de difusión (DiT) del modelo de generación de vídeo LTX-2.5 de Lightricks, cuantizado a int8 con grupo de 64. Se trata de un checkpoint intermedio que contiene únicamente los pesos del DiT, mientras que el resto de componentes (text encoder, connector, VAEs, vocoder, duration head y upscalers) se toman del repositorio base `mlx-community/ltx-2.5-mlx`. El objetivo principal es reducir la huella de memoria del DiT original en bf16 (unos 38 GB residentes) hasta aproximadamente 20,6 GB, permitiendo su ejecución en equipos con memoria unificada más limitada, típicamente Apple Silicon.

Este modelo está diseñado para ser consumido por las librerías `ltx-2-mlx` (Python) y `ltx-2-mlx-swift` (Swift), ambas orientadas a ejecución nativa en Apple Silicon. La cuantización int8 se ha aplicado exclusivamente a los bloques del transformer, siguiendo una receta validada en la versión 2.3 del mismo modelo. El autor reporta una fidelidad medida por coseno de 0.99824 respecto al DiT bf16, un valor sensiblemente mejor que el obtenido con la cuantización equivalente del LTX-2.3 (0.99238). No se ha publicado una variante int4 porque fue rechazada por un error angular excesivo en la salida del conector.

Este checkpoint resulta relevante para desarrolladores que trabajen con LTX-2.5 en entornos Apple Silicon y necesiten reducir el uso de memoria sin sacrificar demasiada calidad, o que quieran combinar el DiT cuantizado con el sistema de weight streaming `ltx-2.5-granules` para cargar los pesos desde disco en lugar de mantenerlos en RAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para generación conjunta de vídeo y audio |
| Parametros totales | 22 mil millones (según el modelo base LTX-2.5) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 group-64 (solo en los bloques del transformer) |
| Idiomas soportados | no disponibles |
| Licencia | LTX-2 Community License Agreement |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 es un transformer de difusión que genera conjuntamente vídeo y audio en un solo paso, con una arquitectura que permite producción de escenas multi-shot en una única pasada. El checkpoint aquí descrito contiene únicamente el DiT, cuantizado a int8 con group de 64, siguiendo la misma receta que se utilizó en la versión 2.3 del modelo. La cuantización se aplica exclusivamente a los bloques del transformer, no al resto de componentes del sistema.

No se dispone de información sobre el entrenamiento original del modelo base (datos, tokens, técnicas de alineamiento como RLHF o DPO). El proceso de cuantización se ha validado midiendo la similitud coseno entre la salida del DiT cuantizado y la del DiT original en bf16 sobre las mismas entradas (N=5632), obteniendo un valor de 0.99824. Se ha descartado explícitamente una variante int4 porque el conector presentaba un error angular de 0.996728 frente al umbral de 0.999879 del bf16, un desvío 27 veces mayor que el baseline.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video).
- Generación conjunta de audio y vídeo sincronizados.
- Generación de escenas multi-shot en una sola pasada.
- Edición de metraje real y exportación en formato EXR de calidad cinematográfica (según las características del modelo base).
- Soporte de weight streaming: puede combinarse con el repositorio `xocialize/ltx-2.5-granules` para cargar el DiT desde disco en lugar de mantenerlo residente, sin pérdida de calidad (salida bit-idéntica a la ruta residente).
- No se han documentado capacidades de tool calling, function calling, ni agentes multi-paso.

## Casos de uso

- Generación de vídeo en Apple Silicon con memoria limitada: el checkpoint reduce la huella del DiT de ~38 GB a ~20,6 GB, lo que permite ejecutar LTX-2.5 en equipos con 64 GB de RAM unificada con un consumo de memoria de aproximadamente el 57% del presupuesto total, frente al 96% que ocupaba la versión bf16.
- Prototipado de generación de vídeo en entornos de desarrollo: al ser un formato MLX nativo, se integra directamente con las librerías `ltx-2-mlx` y `ltx-2-mlx-swift`, facilitando la experimentación en Python o Swift sin necesidad de capas de compatibilidad adicionales.
- Edición de vídeo con IA: el modelo base permite editar metraje real, y la cuantización int8 mantiene una fidelidad alta (coseno 0.99824), suficiente para flujos de trabajo de postproducción.
- Generación de vídeo con audio sincronizado: la arquitectura conjunta de audio y vídeo permite crear clips con pista sonora coherente, útil para previsualización de anuncios o contenido para redes sociales.
- Investigación en vídeo generativo: al ser un checkpoint abierto y cuantizado, sirve como base para experimentos sobre eficiencia de memoria, cuantización y streaming de pesos en modelos de difusión de vídeo.
- Integración en pipelines de producción con weight streaming: combinado con `ltx-2.5-granules`, puede desplegarse en entornos donde la memoria residente es un cuello de botella, cargando el DiT desde disco sin pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la fidelidad de cuantización: el coseno entre la salida del DiT cuantizado y la del bf16 es de 0.99824, frente a 0.99238 del LTX-2.3 q8 medido con el mismo método. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para modelos de vídeo.

## Requisitos de hardware

- Requiere Apple Silicon (Macs con chip M1 o superior); el formato MLX no es compatible con GPUs NVIDIA o AMD.
- VRAM estimada: el checkpoint ocupa 20,6 GB en disco, pero el uso de memoria en inferencia depende del resto de componentes del modelo base. En una máquina de 64 GB, el DiT int8 reduce el consumo del 96% al 57% del presupuesto de memoria.
- GPU recomendadas: no aplicable; se recomienda un Mac con al menos 64 GB de RAM unificada para ejecutar el modelo completo con margen de memoria.
- Opciones de despliegue: `ltx-2-mlx` (Python) y `ltx-2-mlx-swift` (Swift). No se mencionan alternativas como vLLM, llama.cpp u Ollama, ya que el formato MLX es específico de Apple Silicon.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Memoria | Fidelidad (coseno vs bf16) | Licencia |
|---|---|---|---|---|---|
| `mlx-community/ltx-2.5-mlx-ditq8` | 22B (DiT) | int8 group-64 | ~20,6 GB (repo) | 0.99824 | LTX-2 Community |
| `mlx-community/ltx-2.5-mlx` (bf16) | 22B | bf16 | ~38 GB (DiT) | 1.0 (referencia) | LTX-2 Community |
| LTX-2.3 q8 (según receta) | 22B | int8 | no disponible | 0.99238 | LTX-2 Community |

No se dispone de comparaciones con otros modelos de generación de vídeo (como Sora, Runway o Veo) porque la información no las incluye.

## Limitaciones y advertencias

- **Licencia**: LTX-2 Community License Agreement. Incluye una cláusula de revenue gate y una cláusula de no competencia (Attachment A), que pueden restringir el uso comercial en determinados umbrales de ingresos o en productos competidores directos.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero como modelo de generación de vídeo, existe riesgo de alucinación visual y de incoherencia temporal, especialmente con prompts complejos.
- **Idiomas**: no se ha especificado qué idiomas soporta el texto encoder. Es probable que el modelo base tenga limitaciones en lenguas de baja representación.
- **Limitación de cuantización**: no existe variante int4, y la int8 solo se aplica a los bloques del transformer; el resto de componentes deben cargarse en bf16, lo que puede requerir memoria adicional.
- **Hardware**: solo funciona en Apple Silicon, lo que limita su despliegue en infraestructura con GPUs NVIDIA o AMD.
- **Streaming**: el repositorio no es compatible con `ltx-2.5-granules` de forma simultánea; hay que elegir una de las dos opciones, no ambas.
- **Sin benchmarks**: no hay resultados de evaluación pública que permitan comparar su rendimiento con otros modelos de generación de vídeo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mlx-community/ltx-2.5-mlx-ditq8
- Repositorio base MLX: https://huggingface.co/mlx-community/ltx-2.5-mlx
- Modelo original Lightricks LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Página oficial del modelo: https://ltx.io/model/ltx-2-5
- Página de código abierto del modelo: https://ltx.io/model/open-source
- Librería Python `ltx-2-mlx`: https://github.com/xocialize/ltx-2-mlx
- Librería Swift `ltx-2-mlx-swift`: https://github.com/xocialize/ltx-2-mlx-swift
- Repositorio de streaming `ltx-2.5-granules`: https://huggingface.co/xocialize/ltx-2.5-granules

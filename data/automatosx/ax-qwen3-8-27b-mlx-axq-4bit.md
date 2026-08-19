# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-4bit es un checkpoint cuantizado en formato MLX para Apple Silicon, desarrollado por AutomatosX a partir del modelo base Qwen/Qwen3.8-27B. Utiliza AXQuant (AXQ) en su versión 1.6.2, una técnica de cuantización de precisión mixta que asigna diferentes niveles de bits (4, 8 y BF16) según la sensibilidad de cada tensor, con el objetivo de reducir el peso del modelo manteniendo una calidad razonable. El checkpoint está diseñado para ejecutarse con MLX-LM o AX Engine en hardware Apple con memoria unificada.

El modelo conserva la arquitectura original Qwen3_5ForConditionalGeneration (densa) e incluye un sidecar de visión en BF16 con 460,73 millones de parámetros, lo que permite tareas de texto e imagen, aunque la calidad de la parte visual no está certificada. La cuantización se ha aplicado únicamente al camino de texto, mientras que los pesos de visión se mantienen en alta precisión. El repositorio contiene pesos en safetensors de 17,33 GB y está pensado para entornos de desarrollo y prototipado en macOS, con una licencia Apache 2.0 que permite uso comercial.

La relevancia de este modelo radica en su enfoque de cuantización mixta basada en prioridades de arquitectura (sin calibración) y su integración nativa con el ecosistema MLX, lo que lo convierte en una opción práctica para desplegar modelos de 27B en equipos Apple con memoria unificada limitada, aunque sin garantías formales de retención de calidad ni de aceleración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa), con vision tower en sidecar |
| Parametros totales | 27.36B (logicos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262,144 tokens (maximo configurado; limite practico depende de la memoria unificada) |
| Tipos de cuantizacion | AXQ mixed-precision: 4bit (89,01%), 8bit (9,29%), BF16 (1,69%), grupo de 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, una arquitectura transformer densa de la familia Qwen3.5, con un camino de texto optimizado y una torre de visión independiente. La cuantización AXQ se aplica exclusivamente al camino de texto, asignando precisiones de 4, 8 y BF16 según un analisis de prioridades de arquitectura (no se ha realizado calibracion con datos). El sidecar de vision, con 333 tensores y 460,73 millones de parametros, se conserva en BF16 y se incluye como archivo separado (`vision.safetensors`). No se ha incorporado un modulo MTP (Multi-Token Prediction), por lo que no se certifica aceleracion por decodificacion especulativa.

El proceso de conversion registra 498 modulos cuantizados con exito y cero fallbacks. No se ha publicado informacion sobre entrenamiento adicional o ajuste fino; se trata de una conversion directa del modelo base BF16. La asignacion de precision se basa en heuristicas de arquitectura, lo que implica que no hay garantia de retencion de calidad respecto al modelo original.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Qwen3.8-27B.
- Soporte de vision mediante el sidecar BF16, aunque no se certifica la calidad de las tareas vision-language.
- Conversacion multi-turno y generacion con contexto largo (hasta 262K tokens en configuracion maxima).
- Ejecucion nativa en Apple Silicon a traves de MLX-LM o AX Engine.
- Compatible con el ecosistema MLX (libreria `mlx`), incluyendo integracion con `mlx-lm` para generacion y servido.
- No se menciona soporte explicito de tool calling, function calling ni modo agente en la informacion disponible.

## Casos de uso

- Despliegue local de un modelo de 27B en Mac con memoria unificada: el peso de 17,33 GB permite cargar el modelo en equipos con al menos 24 GB de RAM unificada, usando MLX-LM para generacion de texto en aplicaciones de escritorio o scripts.
- Prototipado rapido de aplicaciones de chat y asistentes conversacionales en macOS, aprovechando la licencia Apache 2.0 para desarrollo interno y comercial.
- Tareas de generacion de codigo y asistencia en entornos de desarrollo integrados, ejecutando `mlx_lm.generate` con prompts especificos y contexto largo.
- Procesamiento de imagenes con el sidecar de vision, aunque sin garantia de calidad, para experimentacion en clasificacion o descripcion de imagenes.
- Evaluacion de tecnicas de cuantizacion mixta: al ser un checkpoint de desarrollo, permite comparar el impacto de AXQ frente a cuantizacion uniforme en el mismo hardware.
- Servido de inferencia con AX Engine mediante `ax-engine serve`, para integrar el modelo en pipelines de backend en entornos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha medido la calidad frente al modelo BF16 original ni frente a baselines uniformes, y que no existe ninguna afirmacion de retencion de calidad. Tampoco se proporcionan metricas de latencia o throughput.

## Requisitos de hardware

- Dispositivo Apple Silicon (certificado en MacBook Pro M3, aunque compatible con cualquier chip con memoria unificada).
- Memoria unificada: el peso del checkpoint es de 17,33 GB (descarga completa 17,35 GB). Se recomienda al menos 24 GB de RAM unificada para cargar el modelo y el sidecar de vision, dejando margen para el runtime y el contexto.
- No es compatible con GPUs NVIDIA o AMD sin conversion previa a otro formato (por ejemplo, GGUF o PyTorch).
- Opciones de despliegue: MLX-LM (comando `mlx_lm.generate`) y AX Engine (`ax-engine serve`). Tambien se puede usar la libreria `mlx` directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27.36B | 262,144 | BF16 | Apache 2.0 | HuggingFace |
| AX-Qwen3.8-27B-MLX-AXQ-4bit | 27.36B | 262,144 | AXQ 4bit (mixto) | Apache 2.0 | HuggingFace (MLX) |
| AX-Qwen3.8-27B-MLX-AXQ-6bit (sibling) | 27.36B | 262,144 | AXQ 6bit (mixto) | Apache 2.0 | HuggingFace (MLX) |

La comparativa se limita a la familia Qwen3.8-27B, ya que no se dispone de datos de otros modelos comparables en el mismo formato y tamano. El checkpoint 4bit ofrece un menor peso de descarga que el 6bit, pero con una precision media mas baja (5.0667 BPW medido frente a un presupuesto de 6 BPW). No se han publicado benchmarks que permitan comparar rendimiento real.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de calidad ni benchmarks; la retencion de calidad frente al modelo BF16 original no esta garantizada.
- La cuantizacion se ha realizado sin calibracion, basandose en prioridades de arquitectura, lo que puede provocar degradacion en tareas sensibles a la precision.
- El sidecar de vision se incluye en BF16, pero no se certifica la calidad de las tareas vision-language; el runtime puede ignorar los metadatos de AXQuant y el sidecar.
- No se incluye MTP, por lo que no hay aceleracion por decodificacion especulativa; el checkpoint esta certificado solo para decodificacion directa.
- El modelo esta etiquetado como "development" y su soporte es de tipo "convertible", lo que implica que puede no ser estable para produccion.
- La longitud de contexto maxima de 262,144 tokens es teorica; el limite practico depende de la memoria unificada disponible y del tamaño del contexto generado.
- No se especifican los idiomas soportados; se asume que hereda los del modelo base, pero no hay confirmacion.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y certificaciones de calidad limita su idoneidad para entornos criticos.

## Enlaces

- [HuggingFace: AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio AXQuant (conversion, certificados y tooling)](https://github.com/defai-digital/axquant)
- [Certificado Tier 1 del checkpoint](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen38-27b-axq4-tier1.md)
- [Coleccion de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)

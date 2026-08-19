# AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit

## Resumen

AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, desarrollado por AutomatosX. Se trata de una conversión mixed-precision basada en el cuantizador AXQuant (AXQ) 1.2.0, pensada para ejecutarse en Apple Silicon mediante el runtime MLX-LM. El modelo original es un transformer de mezcla de expertos (MoE) con 35,11 mil millones de parámetros lógicos y un componente de visión, que aquí se preserva en BF16 como sidecar mientras la ruta de texto se cuantiza de forma heterogénea.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de gran tamaño en hardware de Apple con memoria unificada limitada, manteniendo una precisión media de 5,6242 bits por peso (BPW) medido. El repositorio incluye únicamente pesos Safetensors en formato MLX, sin PyTorch ni GGUF, y no incorpora el módulo MTP (multi-token prediction) del modelo base. La ventana de contexto configurada es de 262 144 tokens, aunque el límite práctico depende de la memoria unificada disponible.

Al ser una cuantización, no se aportan datos de entrenamiento ni de calidad comparada con el modelo original. El autor declara explícitamente que no se han publicado métricas de retención de calidad ni certificaciones de velocidad MTP, por lo que el checkpoint debe evaluarse en cada caso de uso antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (mixture of experts, MoE) con ruta de vision |
| Parametros totales | 35,11B logicos; 7 287 064 960 parametros reales en safetensors |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B, no confirmado en la ficha) |
| Longitud de contexto | 262 144 tokens (configurado; limite practico segun memoria unificada) |
| Tipos de cuantizacion | Mixta: 4-bit (68,69%), 6-bit (24,35%), 8-bit (1,95%), BF16 (5,01%); metodos affine y bf16, group sizes 32 y 64 |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.6, no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX); no incluye PyTorch ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Qwen3.6 con 35,11B parámetros lógicos, optimizado para generación de texto y con un componente de visión. La arquitectura fuente se identifica como `Qwen3_5MoeForConditionalGeneration`, lo que indica una mezcla de expertos con activación dispersa. En este checkpoint, la ruta de texto se ha cuantizado de forma heterogénea mediante AXQuant: el 68,69% de los parámetros se asigna a 4-bit, el 24,35% a 6-bit, el 1,95% a 8-bit y el 5,01% se mantiene en BF16. Los tensores protegidos (como los de visión) se conservan en BF16 en un sidecar separado de 446,57M parámetros (0,89 GB).

No se dispone de información sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El proceso de cuantización se realizó sin calibración, basándose en prioris de arquitectura, y se registraron 469 conversiones de módulos exitosas sin fallbacks. El checkpoint no incluye el módulo MTP (multi-token prediction) del modelo base, por lo que la decodificación es directa sin aceleración por predicción múltiple de tokens.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.6.
- Procesamiento de visión: el sidecar de visión en BF16 permite entrada de imágenes, aunque la calidad no ha sido evaluada por el autor.
- Razonamiento y generación de código: capacidades típicas de la familia Qwen, no verificadas en esta cuantización.
- Soporte de tool calling y function calling: no confirmado en la documentación del checkpoint, aunque es una capacidad habitual en modelos Qwen recientes.
- Multilingüismo: no especificado; se asume herencia del modelo base, sin datos concretos.
- Sin soporte de audio (no presente en el checkpoint).

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede ejecutarse con MLX-LM en Apple Silicon, ofreciendo respuestas de texto con baja latencia en equipos con memoria unificada suficiente (al menos 32 GB recomendados por el tamaño del checkpoint).
- Análisis de imágenes en local: gracias al sidecar de visión BF16, puede procesar imágenes para tareas de captioning o respuesta visual, aunque la calidad no está certificada.
- Generación de código asistida: desarrolladores que trabajan en entornos Apple pueden usar el modelo para autocompletar o explicar fragmentos de código sin depender de servicios en la nube.
- Prototipado de aplicaciones de IA generativa: al ser un checkpoint MLX, se integra fácilmente con el ecosistema MLX-LM para experimentación rápida en Mac.
- Investigación en cuantización mixta: el checkpoint sirve como referencia para estudiar el impacto de la asignación heterogénea de precisión en modelos MoE con visión.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente, evita enviar datos sensibles a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay métricas de retención de calidad frente al modelo BF16 original ni comparaciones con baselines uniformes. Tampoco se certifica aceleración MTP ni rendimiento del motor AX Engine nativo. Por tanto, no es posible evaluar el rendimiento relativo de esta cuantización sin realizar pruebas propias.

## Requisitos de hardware

- El checkpoint ocupa 25,3 GB en disco (descarga completa), por lo que se recomienda al menos 32 GB de memoria unificada en Apple Silicon para cargar el modelo y dejar margen para el contexto.
- GPU: cualquier chip Apple Silicon con memoria unificada suficiente (M1 Pro/Max/Ultra, M2/M3/M4 en sus variantes de 32 GB o más). No se ha probado en GPUs NVIDIA.
- Runtime principal: MLX-LM (versiones registradas: MLX 0.32.0 y MLX-LM 0.31.3 durante la conversión).
- No se incluye manifiesto nativo para AX Engine, por lo que la ejecución debe realizarse a través de MLX-LM estándar.
- Latencia y throughput: no disponibles; dependen del hardware concreto y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit (este) | 35,11B logicos | 262 144 | Mixta 4/6/8/BF16, BPW 5,62 | Apache-2.0 | MLX Safetensors |
| AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit (hermano) | 35,11B logicos | 262 144 | Mixta, presupuesto 4-bit | Apache-2.0 | MLX Safetensors |
| Qwen/Qwen3.6-35B-A3B (original) | 35,11B logicos | 262 144 | BF16 | Apache-2.0 | PyTorch / Safetensors |

La comparativa se limita a los checkpoints de AutomatosX y al modelo base, ya que no se dispone de datos de otros modelos MoE similares en el contexto de esta ficha. El hermano 4-bit ofrece menor tamaño de almacenamiento a costa de menor precisión media, mientras que el original BF16 requiere mucho más espacio y memoria, pero sin pérdida por cuantización.

## Limitaciones y advertencias

- No se han publicado métricas de calidad ni benchmarks; el rendimiento real debe validarse antes de usar en producción.
- La cuantización se realizó sin calibración, basada en prioris de arquitectura, lo que puede afectar a la precisión en tareas específicas.
- El módulo MTP no está incluido, por lo que no hay aceleración por predicción múltiple de tokens.
- El motor AX Engine nativo no está establecido; solo se garantiza la ejecución vía MLX-LM estándar.
- La calidad de la visión no ha sido evaluada; el sidecar BF16 está presente pero sin certificación.
- Los idiomas soportados no están documentados; se asume herencia del modelo base, pero sin confirmación.
- El límite práctico de contexto depende de la memoria unificada; con 32 GB puede ser necesario reducir la ventana para evitar swapping.
- Al ser un checkpoint de desarrollo (tag `development`), puede contener cambios no definitivos; se recomienda fijar el commit de HuggingFace en despliegues reproducibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Hermano 4-bit: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Certificado Tier 1: https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-35b-axq6-nomtp-tier1.md

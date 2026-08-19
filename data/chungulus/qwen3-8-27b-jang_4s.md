# Chungulus/Qwen3.8-27B-JANG_4S

## Resumen

Qwen3.8-27B-JANG_4S es una cuantización del modelo de visión-lenguaje Qwen/Qwen3.8-27B, publicada por el usuario Chungulus en HuggingFace. Se trata de una conversión "vanilla" de los pesos originales, sin fine-tuning, merge ni modificación del chat template, que emplea el algoritmo propietario JANG_4S de cuantización adaptativa de precisión mixta basada en error cuadrático medio (MSE). El resultado es un artefacto de aproximadamente 17 GB que reduce el peso del modelo original (BF16) a una media de 4,1 bits por parámetro, manteniendo la arquitectura híbrida Gated DeltaNet/atención completa y el componente de visión.

El modelo está diseñado para ejecutarse en hardware Apple Silicon mediante el runtime JANG/MLX (versión 2.5.46 o superior), aunque también se sugiere su uso con vLLM. Su relevancia radica en que permite desplegar un modelo multimodal de gran tamaño en equipos de consumo con memoria unificada, conservando capacidades de tool calling, procesamiento de imágenes y generación de texto con modo de razonamiento. La cuantización no introduce cambios en los tensores de MTP (Multi-Token Prediction), aunque el runtime actual no los aprovecha para aceleración especulativa.

El repositorio incluye métricas de validación frente al modelo BF16 original, con una similitud semántica media de 0,9505 y una velocidad de generación de 17,2 tokens por segundo en el hardware de prueba. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet / full-attention, con vision tower y projector (modelo base Qwen3.8-27B) |
| Parametros totales | 4.922.716.912 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | JANG_4S, precisión mixta adaptativa, ~4,1 bits promedio, group size automático |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere JANG/MLX 2.5.46+ para carga) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas con Gated DeltaNet (una variante de atención lineal) y capas con atención completa, junto con un vision tower y un proyector para entrada de imágenes. La cuantización JANG_4S es una conversión de solo pesos (weight-only) que no requiere calibración con datos; utiliza un algoritmo de optimización MSE para asignar dinámicamente el número de bits a cada tensor, logrando una media de 4,1 bits. El proceso conserva los 1199 tensores originales, incluyendo 333 tensores de visión y 15 tensores fuente de MTP.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO). La model card indica que la cuantización no altera el chat template, el tokenizador ni los IDs de tokens especiales, y que se verificó la integridad estructural frente al checkpoint original fijado en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto, produciendo respuestas textuales (pipeline image-text-to-text).
- Tool calling: soporta el formato XML nativo de herramientas de Qwen, validado en pruebas específicas.
- Modo de razonamiento: incluye controles de chat template para `enable_thinking`, `reasoning_effort` y `preserve_thinking`, permitiendo activar o desactivar el razonamiento explícito.
- Visión y video: pasó pruebas deterministas de imágenes locales; no se especifica soporte de video en detalle.
- MTP (Multi-Token Prediction): los tensores se preservan, pero el runtime JANG/MLX 2.5.46 no los utiliza, por lo que no se ofrece aceleración especulativa.
- Multilingüismo: no se han publicado datos sobre idiomas soportados.

## Casos de uso

- Análisis de imágenes en dispositivos Apple: al ser una cuantización ligera, puede ejecutarse en un Mac con Apple Silicon para tareas de captioning, VQA o extracción de información de capturas, aprovechando la memoria unificada.
- Asistente conversacional multimodal local: integración en aplicaciones de escritorio o móviles que requieran respuestas contextuales a partir de fotos o documentos escaneados, sin depender de la nube.
- Automatización de tareas con tool calling: el modelo puede invocar APIs externas mediante el formato XML de herramientas, permitiendo construir agentes que consulten bases de datos, envíen correos o interactúen con servicios web.
- Procesamiento de documentos con imágenes: extracción de datos de facturas, formularios o capturas de pantalla, combinando visión y generación de texto estructurado.
- Generación de descripciones accesibles: creación automática de textos alternativos para imágenes en plataformas de contenido, con control de tono y detalle mediante el modo de razonamiento.
- Prototipado de aplicaciones de visión-lenguaje: desarrollo rápido de demos o MVPs en entornos Apple Silicon, gracias al reducido tamaño del artefacto y a la compatibilidad con vLLM para pruebas en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas de validación frente al modelo BF16 original, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Similitud semantica media (vs BF16) | 0,9506 |
| Coincidencias exactas (sobre casos funcionales) | 4 |
| Velocidad de generacion promedio | 17,22 tokens/s |
| Pico de memoria | 19,51 GB |
| Tamano del artefacto | 17,08 GB |
| Maximo de tokens de prompt probado | 73 |
| Tasa de bucles (loop rate) | 0,0 |

Estas cifras son específicas del hardware de prueba y no deben extrapolarse a otros entornos.

## Requisitos de hardware

- Hardware esperado: Apple Silicon (según la model card).
- Memoria: pico de 19,51 GB medido durante la validación; se recomienda al menos 20 GB de RAM unificada.
- GPU: no se especifican requisitos de VRAM para GPUs NVIDIA; el uso con vLLM es posible pero no se documentan métricas.
- Opciones de despliegue: JANG/MLX (versión 2.5.46 o superior) como runtime principal; también se sugiere `vllm serve` para entornos con GPU.
- Latencia y throughput: 17,22 tokens/s de media en el hardware de prueba (Apple Silicon), sin datos para otros entornos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (cuantizaciones de Qwen3.8-27B u otros modelos de visión-lenguaje cuantizados). La siguiente tabla compara esta cuantización con su modelo base original:

| Modelo | Parametros | Tamano del artefacto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 4.922.716.912 | No disponible | BF16 | Apache-2.0 |
| Chungulus/Qwen3.8-27B-JANG_4S | 4.922.716.912 | 17,08 GB | JANG_4S (~4,1 bits) | Apache-2.0 |

No se han encontrado otras cuantizaciones del mismo modelo base en la información proporcionada.

## Limitaciones y advertencias

- La cuantización puede reducir la calidad de las respuestas, especialmente en tareas que requieren precisión numérica o razonamiento complejo, debido al bajo bit width promedio (4,1 bits).
- El contexto probado es limitado: la validación solo alcanzó 73 tokens de prompt; no se debe asumir que el modelo soporta la longitud de contexto máxima del modelo base sin pruebas adicionales.
- El runtime JANG/MLX 2.5.46 no soporta el módulo MTP nativo, por lo que los tensores MTP se preservan pero no ofrecen aceleración especulativa; no se debe esperar una mejora de throughput por este concepto.
- La compatibilidad del runtime es específica: un cargador que solo lea tensores de lenguaje no es suficiente; se requiere JANG/MLX 2.5.46+ o vLLM con soporte para la arquitectura híbrida y el vision tower.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones idiomáticas; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al modelo base y a esta cuantización según los términos de la licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chungulus/Qwen3.8-27B-JANG_4S
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

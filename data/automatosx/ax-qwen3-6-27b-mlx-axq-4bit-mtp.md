# AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-4bit-MTP

## Resumen

AX-Qwen3.6-27B-MLX-AXQ-4bit-MTP es un checkpoint cuantizado en formato MLX para Apple Silicon, desarrollado por AutomatosX. Se trata de una conversión directa del modelo Qwen/Qwen3.6-27B (arquitectura densa Qwen3_5ForConditionalGeneration) utilizando el cuantizador AXQuant (AXQ) en su edición v2. El modelo mantiene el camino de texto cuantizado en precisión mixta (4-bit, 8-bit y BF16) mientras preserva el cabezal de multi-token prediction (MTP) y el codificador de visión como sidecars en BF16, lo que permite aceleración opcional de decodificación y capacidades multimodales.

El checkpoint está diseñado específicamente para entornos Apple Silicon con MLX, ofreciendo una ventana de contexto máxima de 262.144 tokens. Con un tamaño de descarga de aproximadamente 19,4 GB, es una opción práctica para desplegar un modelo de 27B en hardware de consumo de Apple, manteniendo una calidad certificada frente a la cuantización uniforme de 4 bits. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en su enfoque en eficiencia y compatibilidad con el ecosistema MLX, combinando cuantización mixta de alta calidad con aceleración MTP certificada, lo que lo convierte en una alternativa sólida para desarrolladores que necesitan ejecutar modelos grandes en Macs con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa) |
| Parametros totales | 27,36B (lógicos) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (máximo configurado) |
| Tipos de cuantizacion | AXQ mixto: 4-bit (87,65%), 8-bit (4,58%), BF16 (7,77%) |
| Idiomas soportados | no disponible (heredado de Qwen3.6, presumiblemente multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no contiene PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.6-27B, una arquitectura transformer densa con 27,36 mil millones de parámetros lógicos. El checkpoint AXQ aplica cuantización mixta de precisión: los tensores principales del camino de texto se cuantizan mayoritariamente a 4-bit (87,65% de los parámetros), con una parte en 8-bit (4,58%) y el resto en BF16 (7,77%), utilizando métodos `affine` y `bf16` con tamaños de grupo de 32 y 64. El cabezal MTP (multi-token prediction) de 424,70M parámetros y el codificador de visión de 460,73M parámetros se conservan como sidecars en BF16, lo que permite aceleración de decodificación (Tier 2 certificado) y capacidades de visión cuando se usan con AX Engine.

El entrenamiento original del modelo base no se detalla en la información proporcionada, pero al ser una conversión cuantizada, no se ha realizado un entrenamiento adicional. La calidad se ha validado mediante certificaciones internas: retención de calidad de 0,993 en tareas de agente-código y 1,000 en tareas generales frente a la cuantización uniforme de 4 bits, según el certificado Tier 1.

## Capacidades

- Generación de texto y razonamiento conversacional de alta calidad, heredadas del modelo base Qwen3.6.
- Soporte de multi-token prediction (MTP) para acelerar la decodificación en perfiles de generación larga (certificado Tier 2 con ganancias de 1,20x o superiores en decode-heavy).
- Capacidades de visión a través del sidecar de visión BF16 (el modelo base Qwen3.6-27B es multimodal, aunque el checkpoint no garantiza la funcionalidad sin el runtime adecuado).
- Compatibilidad estándar con MLX-LM para inferencia de texto/backbone (nivel de compatibilidad B).
- Cuantización mixta optimizada para Apple Silicon, con un tamaño de 19,4 GB que cabe en Macs con memoria unificada de 32 GB o superior.
- Soporte de tool calling y agentes probablemente heredado del modelo base, aunque no está explícitamente documentado en la model card.

## Casos de uso

- Despliegue local en MacBook Pro con chip M5 o similar: el modelo está certificado para Apple Silicon y puede ejecutarse con MLX-LM, ofreciendo una alternativa eficiente a modelos más grandes sin necesidad de GPU dedicada.
- Generación de código asistida en entornos de desarrollo: gracias a su retención de calidad de 0,993 en tareas de agente-código, es adecuado para autocompletado y refactorización de código con baja latencia en hardware local.
- Asistentes conversacionales con contexto largo: la ventana de 262.144 tokens permite manejar documentos extensos, historiales de chat prolongados o análisis de código fuente completo.
- Prototipado de agentes autónomos: la combinación de tool calling (heredada) y MTP acelerado facilita la ejecución de pipelines multi-paso con razonamiento encadenado en un Mac.
- Aplicaciones de visión-lenguaje en local: el sidecar de visión BF16 permite experimentar con tareas multimodales (descripción de imágenes, VQA) si se usa con AX Engine, aunque no está garantizado con MLX-LM estándar.
- Investigación en eficiencia de cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta AXQ en modelos grandes, gracias a sus certificaciones públicas y métricas detalladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas proporcionadas son certificaciones internas de AXQuant:

| Métrica | Valor |
|---|---|
| Retención de calidad (agente-código) vs uniform-4 | 0,993 |
| Retención de calidad (general) vs uniform-4 | 1,000 |
| Aceleración MTP (decode-heavy, agente-código) | 1,301x (MTP off/on) |
| Aceleración MTP (long-form general) | 1,223x / 1,249x |
| BPW medido (modelo principal) | 5,4183 |
| BPW total incluyendo MTP | 5,5801 |

Estas cifras son específicas del entorno de certificación `df-macbookpro-m5` con AX Engine 6.14.0 y no son comparables directamente con benchmarks académicos.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 19,4 GB en disco; en memoria unificada de Apple Silicon, se recomienda al menos 32 GB para inferencia con contexto moderado, y 64 GB o más para contextos cercanos a 262K tokens.
- GPU recomendadas: cualquier Mac con chip M-series (M1, M2, M3, M4, M5) con suficiente memoria unificada. No requiere GPU NVIDIA.
- Compatibilidad con consumer GPU: no aplica (es específico de Apple Silicon).
- Opciones de despliegue: MLX-LM (inferencia estándar), AX Engine (para aceleración MTP certificada y sidecars), y potencialmente otros frameworks MLX.
- Latencia y throughput: no se proporcionan cifras exactas, pero las certificaciones indican ganancias de 1,20x a 1,30x en perfiles decode-heavy con MTP activado en un MacBook Pro M5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3.6-27B-MLX-AXQ-4bit-MTP (este) | 27,36B | 262K | AXQ mixto 4/8/BF16 | Apache 2.0 | MLX Safetensors |
| Qwen/Qwen3.6-27B (original) | 27,36B | 262K | BF16 | Apache 2.0 | PyTorch/Safetensors |
| AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-6bit-MTP (hermano) | 27,36B | 262K | AXQ mixto ~6BPW | Apache 2.0 | MLX Safetensors |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos similares en la información proporcionada. La diferencia clave entre los hermanos AXQ es el presupuesto de almacenamiento: el de 4-bit prioriza menor tamaño, mientras que el de 6-bit ofrece mayor precisión media.

## Limitaciones y advertencias

- La cuantización AXQ es una técnica propietaria de AutomatosX; su comportamiento puede diferir de cuantizaciones estándar como GPTQ o AWQ, y requiere validación en el caso de uso específico.
- El soporte de visión y MTP no está garantizado con MLX-LM estándar; solo se activa con AX Engine y bajo contratos formales de certificación (Tier 2). Sin ese runtime, el modelo funciona como un modelo de texto puro.
- La ventana de contexto de 262K tokens es teórica; en la práctica, la memoria unificada disponible limita el contexto utilizable. Con 32 GB de RAM, el contexto práctico será considerablemente menor.
- No se han publicado evaluaciones independientes de sesgos, alucinaciones o robustez; las certificaciones son internas de AutomatosX.
- El modelo base Qwen3.6 puede tener sesgos lingüísticos o culturales no documentados; al ser una conversión cuantizada, estos se heredan.
- La licencia Apache 2.0 permite uso comercial, pero el cuantizador AXQuant y las herramientas asociadas pueden tener sus propias licencias (no detalladas aquí).
- El checkpoint está pensado exclusivamente para Apple Silicon; no es directamente utilizable en GPUs NVIDIA o hardware x86 sin conversión adicional.

## Enlaces

- [HuggingFace: AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-4bit-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-4bit-MTP)
- [Modelo base: Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
- [Certificado Tier 1](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-27b-axq4-tier1.md)
- [Certificado Tier 2 (MTP)](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-27b-axq4-tier2.md)
- [Catálogo de modelos AutomatosX MLX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
- [Hermano 6-bit](https://huggingface.co/AutomatosX/AX-Qwen3.6-27B-MLX-AXQ-6bit-MTP)

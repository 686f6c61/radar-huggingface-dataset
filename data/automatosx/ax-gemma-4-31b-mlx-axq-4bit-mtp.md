# AutomatosX/AX-gemma-4-31b-MLX-AXQ-4bit-MTP

## Resumen

AX-gemma-4-31b-MLX-AXQ-4bit-MTP es una cuantización de precisión mixta (AXQ) del modelo Gemma 4 31B instructivo de Google, preparada específicamente para ejecutarse en hardware Apple Silicon mediante el framework MLX. El checkpoint incluye un módulo adicional de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa, siguiendo la línea de los paquetes AXQ-MTP de Qwen. El desarrollo corre a cargo de AutomatosX, vinculado al proyecto axquant de defai-digital, y el paquete ha obtenido la certificación "Checkpoint Tier 1" que valida tamaño, retención de calidad (≥0.98) e integridad de conversión.

El modelo resuelve el problema de ejecutar un LLM de 31.000 millones de parámetros en equipos Apple con memoria unificada limitada, reduciendo el peso a aproximadamente 19,5 GB (medidos a ~4,90 bits por peso) sin renunciar a la calidad del modelo original. Su relevancia actual radica en ser uno de los primeros paquetes AXQ para Gemma 4 con soporte de MTP, aunque la aceleración por decodificación especulativa no está certificada en esta versión. La arquitectura subyacente es un transformer denso (no MoE) con ventana de contexto no especificada en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B instructivo) |
| Parametros totales | 31.000.000.000 (original); 4.988.195.132 (pesos cuantizados en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 4-bit (precision mixta, ~4.90 BPW medidos) |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (licencia propietaria de Google con restricciones) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

Este paquete no es un modelo entrenado desde cero, sino una cuantización del checkpoint `google/gemma-4-31B-it` mediante la técnica AXQuant (AXQ) de precisión mixta. AXQ asigna diferentes niveles de precisión a distintas capas o tensores para maximizar la retención de calidad con un presupuesto de bits reducido; en este caso, el resultado medido es de ~4.90 bits por peso, ligeramente por encima de 4 bits por la mezcla de precisiones. El repositorio incluye además un "assistant" MTP (multi-token prediction) que actúa como modelo borrador para decodificación especulativa, siguiendo el esquema de los paquetes AXQ-MTP de Qwen. No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO); solo se indica que es la variante instructiva (it) de Gemma 4 31B.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Soporte de decodificación especulativa mediante asistente MTP, activable por variables de entorno (`AX_MLX_GEMMA4_ASSISTANT_MTP=1`, `MAX_DEPTH=2`). No certificado en esta versión.
- Visión: presente como sidecar (`vision.safetensors`) pero no certificada; la integración con `mlx-vlm` falla por incompatibilidad de layout.
- Audio: no soportado (sin torre de audio ni pesos laterales).
- No se documentan capacidades explícitas de tool calling, agentes o razonamiento multi-paso; se heredan las del modelo base Gemma 4 31B it, pero no hay confirmación en la información disponible.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el formato MLX y el tamaño reducido (~19,5 GB) permiten ejecutar Gemma 4 31B en equipos con al menos 24-32 GB de memoria unificada, sin necesidad de GPU dedicada.
- Desarrollo y pruebas de aplicaciones de chat o generación de texto en entornos macOS: al ser un checkpoint cuantizado certificado Tier 1, ofrece una opción fiable para prototipado rápido.
- Investigación en cuantización de precisión mixta: el paquete sirve como referencia para evaluar el impacto de AXQ en modelos de la familia Gemma 4, gracias a su certificación de retención de calidad.
- Experimentación con decodificación especulativa: aunque la aceleración MTP no está certificada, los desarrolladores pueden probar el asistente MTP incluido y medir su efecto en throughput en su propio hardware.
- Despliegue en entornos con restricción de VRAM: al no requerir GPU NVIDIA, es adecuado para equipos Mac donde otras cuantizaciones (GGUF, GPTQ) no son nativas.
- Integración en pipelines de generación de texto con MLX: el modelo puede cargarse como raíz de snapshot local o mediante `--mlx-model-artifacts-dir` en el motor AX Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La certificación Tier 1 solo indica retención de calidad ≥0.98 frente a un baseline uniforme, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y posteriores) con MLX.
- Memoria: el repositorio ocupa 19,5 GB; se recomienda al menos 24 GB de memoria unificada para carga y generación cómoda (32 GB o más para contexto largo).
- GPU: no aplica GPU discreta; usa la GPU integrada de Apple vía MLX.
- Certificación realizada en `df-macbookpro-m5` (MacBook Pro con chip M5) y pruebas de visión en `df-macstudio-m2` (Mac Studio M2).
- Opciones de despliegue: motor AX Engine (con variables de entorno para MTP), carga directa con MLX, o cualquier runtime compatible con safetensors en MLX.
- Latencia y throughput: no disponibles; la aceleración MTP no está certificada, por lo que se espera velocidad de decodificación directa similar a otras cuantizaciones 4-bit de Gemma 4 31B.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otras cuantizaciones de Gemma 4 31B (p. ej., GGUF Q4_K_M, MLX estándar 4-bit) ni con modelos de tamaño similar. La información disponible no incluye benchmarks ni mediciones de velocidad. Como referencia cualitativa, AXQ promete mejor retención de calidad que cuantizaciones uniformes al mismo presupuesto de bits, pero esto no está verificado en esta ficha.

## Limitaciones y advertencias

- La aceleración MTP (decodificación especulativa) no está certificada (Tier 2 no aprobado); el asistente MTP se incluye por completitud del producto y puede no ofrecer ganancia de velocidad.
- La modalidad de visión no está certificada: el sidecar `vision.safetensors` existe, pero falla con `mlx-vlm` por desajuste de layout. No usar en producción para tareas multimodales.
- Audio no soportado.
- Licencia Gemma: impone restricciones de uso comercial y de distribución; consultar los términos de Google antes de desplegar en entornos empresariales.
- Al ser una cuantización, existe riesgo de pérdida de calidad en tareas de precisión (matemáticas, código complejo) aunque la certificación indique retención ≥0.98.
- Solo compatible con Apple Silicon vía MLX; no se proporcionan pesos en otros formatos (GGUF, ONNX, etc.).
- No hay información sobre la longitud de contexto real soportada tras la cuantización; asumir la del modelo base (desconocida en esta ficha).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-gemma-4-31b-MLX-AXQ-4bit-MTP
- Certificado Tier 1: https://github.com/defai-digital/axquant/blob/main/docs/certifications/gemma4-31b-axq4-tier1.md
- Repositorio del proyecto axquant: https://github.com/defai-digital/axquant
- Modelo base (Google): https://huggingface.co/google/gemma-4-31B-it

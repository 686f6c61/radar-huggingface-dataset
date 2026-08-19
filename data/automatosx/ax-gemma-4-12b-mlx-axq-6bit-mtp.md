# AutomatosX/AX-gemma-4-12b-MLX-AXQ-6bit-MTP

## Resumen

AX-gemma-4-12b-MLX-AXQ-6bit-MTP es una cuantización de 6 bits del modelo instructivo Gemma 4 12B de Google, desarrollada por AutomatosX y publicada en HuggingFace. Utiliza la técnica AXQ (Adaptive Quantization) con precisión mixta para reducir el tamaño del modelo y permitir su ejecución eficiente en Apple Silicon mediante el framework MLX. El checkpoint está certificado como Tier 1 en un MacBook Pro con chip M5, lo que garantiza una retención de calidad superior a 0.98 en tareas de codificación y generales.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 12B parámetros en hardware de Apple con memoria unificada, sin sacrificar significativamente la calidad. Incluye además un asistente MTP (Multi-Token Prediction) para decodificación especulativa, aunque esta funcionalidad no está certificada. El modelo se basa en `google/gemma-4-12b-it` y no en la versión base, por lo que está optimizado para seguir instrucciones y tareas de conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 12B instruct) |
| Parametros totales | 12B (modelo original) / 2.494.680.880 (checkpoint cuantizado en safetensors) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AXQ 6-bit (6.0001 BPW), precisión mixta |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX), archivos JSON de configuración |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `google/gemma-4-12b-it`, no un fine-tuning. La técnica AXQ (Adaptive Quantization) aplica una cuantización de 6 bits con precisión mixta, logrando un tamaño de pesos un 24.32% menor que una cuantización uniforme (ratio 0.7568×). Según la certificación, la retención de calidad en tareas de codificación es de 0.9921 y en tareas generales de 1.0000 respecto al modelo original.

Incluye un asistente MTP (`gemma4_assistant`) que permite decodificación especulativa, acelerando la generación de tokens en entornos compatibles. Este asistente se activa mediante variables de entorno (`AX_MLX_GEMMA4_ASSISTANT_MTP=1`). La arquitectura base es un transformer decoder-only estándar de la familia Gemma 4, aunque no se proporcionan detalles adicionales sobre capas, heads o dimensiones.

## Capacidades

- Generación de texto y seguimiento de instrucciones gracias a su naturaleza instructiva.
- Decodificación especulativa mediante MTP (Multi-Token Prediction) con profundidad máxima de 2 tokens, activable por configuración.
- Soporte de visión declarado como `present-not-certified`: incluye un sidecar `vision.safetensors`, pero la integración con `mlx-vlm` falla por incompatibilidad de layout, por lo que no se garantiza su funcionamiento.
- No soporta audio (no hay torre de audio ni pesos asociados).
- Compatible con MLX, lo que permite ejecución nativa en Apple Silicon (M1/M2/M3/M4/M5).
- Certificación Tier 1 en MacBook Pro con chip M5, con retención de calidad ≥0.98.

## Casos de uso

- Inferencia local en Mac: permite ejecutar un modelo de 12B en portátiles Apple con memoria unificada, ideal para desarrollo y pruebas sin depender de servicios en la nube.
- Asistentes conversacionales: al ser una versión instruct, puede utilizarse como base para chatbots y asistentes virtuales en entornos locales con requisitos de privacidad.
- Generación de código y autocompletado: la retención de calidad en tareas de codificación (0.9921) lo hace adecuado para herramientas de asistencia al programador.
- Prototipado rápido de aplicaciones NLP: los desarrolladores pueden integrarlo en proyectos Python que usen MLX para experimentar con generación de texto.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de AXQ en modelos grandes y su rendimiento en hardware Apple.
- Despliegue en entornos sin GPU dedicada: al usar memoria unificada, elimina la necesidad de tarjetas gráficas externas, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de retención de calidad (0.9921 en codificación, 1.0000 en general) respecto al modelo base, pero no incluye resultados en MMLU, HumanEval, GSM8K u otros estándares.

## Requisitos de hardware

- Requiere un Mac con chip Apple Silicon (M1 o posterior); el certificado se emitió en un MacBook Pro con chip M5.
- El tamaño del repositorio es de 18.3 GB, por lo que se necesita al menos esa cantidad de almacenamiento y una memoria unificada suficiente para cargar los pesos (estimación conservadora: 16 GB o más, aunque no se especifica).
- Al usar MLX, no se requiere GPU dedicada; la memoria unificada del chip es compartida entre CPU y GPU.
- Para la decodificación especulativa con MTP, se deben activar las variables de entorno correspondientes; el rendimiento no está certificado.
- Opciones de despliegue: integración directa con MLX en Python, o mediante herramientas compatibles con MLX como `mlx-lm`. No se menciona compatibilidad con vLLM, Ollama o llama.cpp.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. El modelo es comparable a otras cuantizaciones de Gemma 4 12B en MLX (por ejemplo, las publicadas por MLX Community), pero no se han encontrado métricas de rendimiento ni especificaciones detalladas de alternativas. La principal diferencia frente al modelo original es el tamaño reducido y la optimización para Apple Silicon, a costa de una ligera pérdida de calidad (retención ≥0.98). La licencia Gemma es común a todas las variantes de este modelo.

## Limitaciones y advertencias

- La licencia Gemma de Google impone restricciones de uso comercial y requiere aceptación de términos; es necesario revisar la política de uso prohibido.
- La funcionalidad MTP no está certificada; su activación puede no producir aceleración real o incluso degradar el rendimiento en algunos entornos.
- La capacidad de visión está declarada como `present-not-certified` y no funciona con `mlx-vlm` debido a un desajuste en la estructura de archivos; no debe utilizarse para tareas multimodales en producción.
- No soporta audio.
- No se han publicado resultados de benchmarks estándar, por lo que el rendimiento real en tareas específicas no está validado externamente.
- Al ser una cuantización, existe riesgo de alucinaciones y sesgos inherentes al modelo base, que no han sido mitigados específicamente.
- La longitud de contexto no se especifica; se recomienda asumir la del modelo original (probablemente 8K o 32K, pero no confirmado).

## Enlaces

- [HuggingFace - AutomatosX/AX-gemma-4-12b-MLX-AXQ-6bit-MTP](https://huggingface.co/AutomatosX/AX-gemma-4-12b-MLX-AXQ-6bit-MTP)
- [Certificado Tier 1 (GitHub)](https://github.com/defai-digital/axquant/blob/main/docs/certifications/gemma4-12b-axq6-tier1.md)
- [Modelo base: google/gemma-4-12b-it](https://huggingface.co/google/gemma-4-12b-it)

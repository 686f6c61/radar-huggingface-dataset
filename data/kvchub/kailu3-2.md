# KvcHub/KaiLu3

## Resumen

KaiLu 3 Mini es un modelo de lenguaje conversacional de 329.353.216 parámetros desarrollado desde cero por KvcHub. Se trata de un modelo pequeno orientado a generacion de texto y dialogo, disenado para ejecutarse en hardware modesto y para experimentacion, aprendizaje y proyectos personales. Su arquitectura es hibrida: combina capas de convolucion corta con compuerta (gated short-convolution) y capas de atencion, siguiendo el layout de capas de LFM2, aunque entrenado integramente desde cero sin pesos de LFM2.

El modelo fue preentrenado con 6.6B tokens provenientes de corpus publicos (FineWeb-Edu, Cosmopedia v2, SlimPajama-6B, FineMath 4+, Wikipedia y OpenCoder), seguido de un ajuste supervisado con aproximadamente 460K conversaciones y un ajuste por preferencias con DPO (β = 0.1). Su ventana de contexto es de solo 1.024 tokens y su vocabulario de 32.768 tokens, lo que lo situa en la categoria de modelos pequenos para tareas acotadas.

Es relevante ahora por su enfoque de entrenamiento transparente y reproducible, su licencia restrictiva (gratuita solo para uso personal y no comercial) y su interes como caso de estudio de arquitecturas hibridas en la escala de cientos de millones de parametros. No obstante, su contexto limitado, su soporte exclusivo de ingles y la ausencia de benchmarks publicados restringen su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 16 capas de convolucion corta con compuerta (kernel 3) + 8 capas de atencion (capas 3, 6, 9, 12, 15, 18, 21, 23); transformer con layout LFM2 |
| Parametros totales | 329.353.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible en la model card; el repo incluye safetensors en bfloat16 y GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | kailu-3-license (KaiLu 3 Mini License v1.0, noviembre 2026); uso personal y no comercial gratuito, uso comercial requiere permiso escrito de KvcHub |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

KaiLu 3 Mini emplea una arquitectura hibrida de 24 capas: 16 capas de convolucion corta con compuerta (kernel 3) que procesan contexto local, y 8 capas de atencion (en las posiciones 3, 6, 9, 12, 15, 18, 21 y 23) que conectan el texto completo. La anchura oculta es de 1.024 y la feed-forward SwiGLU de 2.816. La atencion usa 16 cabezas de consulta y 4 cabezas clave-valor (grouped-query attention), con QK-norm y RoPE con θ = 1.000.000. El vocabulario es de 32.768 tokens (byte-level BPE) y los embeddings de entrada y salida estan compartidos. El modelo se implementa como `Lfm2ForCausalLM` en Transformers 4.54+, pero comparte con LFM2 unicamente el layout de capas: fue entrenado desde cero y no contiene pesos de LFM2.

El entrenamiento se realizo en tres fases. Primero, un preentrenamiento con 6.6B tokens mezclados asi: web educativa FineWeb-Edu (50%), libros de texto sinteticos Cosmopedia v2 (18%), web general y libros SlimPajama-6B sin Books3 (12%), matematicas FineMath 4+ (8%), Wikipedia (6%) y codigo OpenCoder annealing (6%). Despues, un ajuste supervisado con unas 460K conversaciones de smol-smoltalk en una sola pasada, aprendiendo solo de las respuestas del asistente. Finalmente, un ajuste por preferencias con DPO (β = 0.1) usando pares de UltraFeedback (binarizado), HelpSteer2 y Anthropic HH-RLHF, hasta 60K pares. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat basado en los tokens `<|system|>`, `<|user|>`, `<|assistant|>` y `<|endoftext|>`.
- Razonamiento basico y respuesta a preguntas dentro de contextos cortos (hasta 1.024 tokens).
- Generacion de codigo a nivel basico, entrenado con un 6% de tokens de codigo (OpenCoder annealing).
- Resolucion de problemas matematicos elementales, con un 8% de tokens de matematicas (FineMath 4+).
- Ajuste por preferencias (DPO) para favorecer respuestas consideradas mejores por humanos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado de chatbots educativos: el modelo puede mantener conversaciones de varios turnos en ingles dentro de su ventana de 1.024 tokens, adecuado para demostraciones y proyectos de aprendizaje sin coste de licencia.
- Experimentacion academica con arquitecturas hibridas: util para estudiar el comportamiento de la combinacion de convolucion corta y atencion en un modelo de 329M parametros entrenado desde cero con datos publicos.
- Generacion de respuestas en entornos de investigacion no comercial: sirve como linea base para comparar tecnicas de ajuste supervisado y DPO en modelos pequenos.
- Asistente de texto para tareas cortas: redaccion de respuestas breves, resumenes de parrafos cortos o reescritura de frases en ingles, aprovechando su bajo coste computacional.
- Docencia y talleres de IA: su tamano (329M) y su formato safetensors/GGUF permiten desplegarlo en portatiles y explicar el ciclo completo de preentrenamiento, SFT y DPO.
- Evaluacion de tecnicas de cuantizacion: al incluir pesos en GGUF, puede usarse para medir el impacto de la cuantizacion en la calidad de un modelo conversacional pequeno.
- Generacion de codigo en scripts de ejemplo: para tareas de autocompletado o generacion de fragmentos simples en ingles, siempre con revision humana por su tendencia a producir codigo con errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 329M parametros en bfloat16, los pesos ocupan aproximadamente 0,66 GB; en cuantizacion de 8 bits, unos 0,33 GB, y en 4 bits, unos 0,17 GB (estimaciones teoricas a partir del numero de parametros, sin margen para activaciones ni cache KV).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia en bfloat16; tarjetas como RTX 3060, RTX 4060 o superiores ofrecen margen amplio. Para entrenamiento o ajuste fino se recomiendan GPU con 16 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: Transformers (4.54+) con `Lfm2ForCausalLM`, llama.cpp y Ollama (segun los tags del modelo); vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks publicados |
|---|---:|---:|---|---|---|---|
| KaiLu 3 Mini | 329M | 1.024 | Ingles | kailu-3-license (no comercial sin permiso) | safetensors, GGUF | no disponible |
| KaiLu-3-Pro (KvcHub) | 1.03B | no disponible | no disponible | Apache-2.0 | safetensors, GGUF | no disponible |
| LFM2 (referencia de layout) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos de la misma familia y al modelo cuyo layout de capas comparte KaiLu 3 Mini, ya que no se dispone de datos de benchmarks ni de especificaciones completas de alternativas de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno (329M parametros): puede afirmar hechos erroneos con seguridad, perder el hilo en conversaciones largas y generar codigo con errores.
- Ventana de contexto muy limitada (1.024 tokens), lo que restringe tareas que requieran documentos largos o historiales extensos.
- Soporte exclusivo del ingles; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Sin pruebas de seguridad mas alla del ajuste por preferencias; se recomienda revisar las respuestas antes de confiar en ellas.
- Licencia restrictiva: el uso comercial (productos o servicios de pago, apps con publicidad, APIs de pago, trabajo interno de empresa o trabajo para clientes) esta prohibido sin permiso escrito previo de KvcHub.
- Los datasets de entrenamiento conservan sus propias licencias, lo que puede imponer condiciones adicionales.
- Riesgo de sesgos heredados de los corpus publicos utilizados (FineWeb-Edu, SlimPajama, Wikipedia, etc.), no documentados en la model card.
- El modelo requiere aceptar la licencia y confirmar el uso personal y no comercial mediante el formulario de acceso restringido en Hugging Face.
- No se han publicado benchmarks, por lo que no es posible evaluar su rendimiento de forma objetiva frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/KvcHub/KaiLu3
- Modelo hermano KaiLu-3-Mini: https://huggingface.co/KvcHub/KaiLu-3-Mini
- Licencia KaiLu 3 Mini: https://huggingface.co/KvcHub/KaiLu-3-Mini/blob/main/LICENSE
- Modelo hermano KaiLu-3-Pro: https://huggingface.co/KvcHub/KaiLu-3-Pro
- Kava-Privacy-30M: https://huggingface.co/KvcHub/Kava-Privacy-30M
- Kava-Privacy-2.01M-mlx: https://huggingface.co/KvcHub/Kava-Privacy-2.01M-mlx
- Kava-Privacy-636k-mlx: https://huggingface.co/KvcHub/Kava-Privacy-636k-mlx
- Web del autor: https://kvchub.com
- Contacto comercial: hello@kvchub.com

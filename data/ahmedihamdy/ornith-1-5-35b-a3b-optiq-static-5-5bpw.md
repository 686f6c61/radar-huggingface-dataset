# ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-static-5.5bpw

## Resumen

Ornith-1.5-35B-A3B-OptiQ-static-5.5bpw es una cuantización estática en formato MLX del modelo base ornith-ai/Ornith-1.5-35B-A3B, un modelo de lenguaje multimodal de mezcla de expertos (MoE) desarrollado por DeepReinforce dentro de la familia Ornith-1.5. El modelo base tiene 35 mil millones de parámetros totales, de los cuales se activan aproximadamente 3 mil millones por token, con 256 expertos y 8 enrutados. Esta versión cuantizada, creada por ahmedihamdy, utiliza el toolkit mlx-optiq para producir un artefacto de 27,6 GB pensado para ejecutarse en Apple Silicon, manteniendo la torre de visión en bf16 para no degradar la calidad de procesamiento de imágenes.

La relevancia de este archivo radica en que permite ejecutar un modelo VLM de 35B con capacidades de razonamiento, tool calling y visión en hardware de consumo de Apple, con un tamaño reducido a aproximadamente 5,5 bits por peso (aunque en la práctica es una mezcla de 4 y 8 bits). Al estar basado en la arquitectura Qwen3.5 MoE, hereda características como multi-token prediction (MTP), contexto largo de 256K tokens y soporte para agentes. La licencia MIT facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE VLM (Qwen3_5MoeForConditionalGeneration) |
| Parametros totales | 35B (modelo base) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | OptiQ estático 5.5 BPW (mixto 4-bit/8-bit, group size 64, affine); torre de visión en bf16; MTP en int4 |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con sidecars en `optiq/` (visión bf16 y MTP int4) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer de mezcla de expertos con 256 expertos y 8 enrutados por token, lo que permite activar solo ~3B parámetros por token a pesar de tener 35B totales. Según la información publicada por DeepReinforce, el entrenamiento siguió un bucle de auto-mejora (self-improvement) en el que el modelo propone tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo, extendiendo el marco de auto-scaffolding de Ornith-1.0. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni la composición del dataset.

Este archivo concreto es una cuantización estática generada con `optiq convert --method static --target-bpw 5.5`, sin calibración basada en sensibilidad KL. La asignación de bits es estructural: el 62% de los parámetros del lenguaje se mantienen en 4 bits, 431 tensores se elevan a 8 bits (incluyendo capas de expertos enrutados), y un tensor residual queda en 6 bits para alcanzar el objetivo de 5.5 BPW. La torre de visión se conserva íntegramente en bf16 para evitar pérdidas en OCR y detalle fino, y se incluye una cabeza MTP (multi-token prediction) cuantizada en int4 para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento: modelo de razonamiento que piensa antes de responder, con capacidad de encadenamiento lógico y resolución de problemas complejos.
- Multimodal: acepta entradas de imagen y texto, con torre de visión en bf16 para preservar calidad en tareas de OCR, descripción de imágenes y respuesta a preguntas visuales.
- Tool calling y function calling: soporte nativo para invocar herramientas y funciones externas, útil para integraciones agénticas.
- Uso de agentes: puede ejecutar flujos multi-paso con razonamiento encadenado y llamadas a herramientas.
- Multi-token prediction (MTP): incluye una cabeza MTP cuantizada que permite decodificación especulativa para acelerar la generación.
- Contexto largo: ventana de 256K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Multilingüe: aunque la model card indica solo inglés, el modelo base podría tener capacidades multilingües no documentadas en esta ficha.

## Casos de uso

- Asistente de atención al cliente con visión: el modelo puede procesar capturas de pantalla o fotos de productos junto con consultas de texto, manteniendo conversaciones largas gracias a su contexto de 256K tokens. Su capacidad de tool calling permite consultar bases de datos de pedidos o sistemas de ticketing.
- Generación de código asistida por imágenes: un desarrollador puede subir un diagrama o mockup y pedir al modelo que genere el código correspondiente, aprovechando el razonamiento y la comprensión visual. La cuantización permite ejecutarlo en un MacBook Pro con 32 GB de RAM unificada.
- Análisis de documentos técnicos extensos: con 256K de contexto, puede resumir o extraer información de manuales, informes o papers completos, incluso con figuras y tablas escaneadas.
- Automatización de tareas agénticas en local: al soportar function calling y razonamiento multi-paso, puede orquestar flujos como envío de correos, actualización de hojas de cálculo o interacción con APIs, todo en un equipo Apple Silicon sin conexión a la nube.
- Asistente de investigación para científicos: combina lectura de gráficos, ecuaciones y texto, permitiendo a investigadores hacer preguntas sobre resultados experimentales o literatura con figuras.
- Prototipado de aplicaciones multimodales: desarrolladores que necesitan validar ideas de productos con visión y lenguaje pueden desplegar este modelo localmente con `optiq serve`, que ofrece endpoints compatibles con OpenAI y Anthropic, reduciendo costes de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este archivo cuantizado específico. La model card indica explícitamente que no hay números de MMLU, GSM8K o SWE-bench para este archivo. Sin embargo, el modelo base Ornith-1.5-35B-A3B reporta los siguientes resultados (según fuentes web, promedios de cinco ejecuciones):

| Benchmark | Resultado (modelo base) |
|---|---|
| Terminal-Bench 2.1 | 68.5 (según LLM Releases) / 67.8 (según Benchgen) |
| SWE-Bench Verified | 79.0 |
| GPQA Diamond | 89.2 |

Estos datos corresponden al modelo sin cuantizar y no son directamente extrapolables a esta versión cuantizada, que puede presentar degradaciones de rendimiento no medidas.

## Requisitos de hardware

- El archivo completo pesa 27,6 GB en disco, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo con margen para el contexto y la generación.
- Diseñado específicamente para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se proporcionan versiones CUDA o ROCm.
- La inferencia se realiza con `mlx-lm` para texto y `mlx-optiq` (versión 0.4.27 o superior) para entrada de imágenes y decodificación especulativa con MTP.
- Opciones de despliegue: `optiq serve` levanta un servidor compatible con OpenAI y Anthropic; también se puede usar la API de Python de `mlx-lm` para integraciones personalizadas.
- No se dispone de datos de latencia o throughput para este archivo. Como referencia, un MoE con ~3B activos por token en Apple Silicon suele generar entre 20 y 40 tokens por segundo en chips M2 Max o superiores, pero esto no está verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | ~3B | 256K | MIT | bf16 | Modelo original, ~70 GB en bf16 |
| Ornith-1.5-35B-A3B-OptiQ-static-5.5bpw (este) | 35B | ~3B | 256K | MIT | MLX cuantizado | 27,6 GB, para Apple Silicon |
| Qwen 3.6-35B | 35B (aprox.) | no disponible | no disponible | Apache 2.0 (presumible) | bf16 | Mencionado como peer en Benchgen, con rendimiento inferior en SWE-Bench y GPQA |

La comparativa se basa en datos públicos limitados. No se dispone de información detallada sobre Qwen 3.6-35B para una comparación exhaustiva.

## Limitaciones y advertencias

- Cuantización estática sin calibración: la asignación de bits se hizo por reglas arquitectónicas, no por sensibilidad medida, por lo que puede haber capas críticas con precisión insuficiente.
- No es un quant de 5 bits real: la mayoría de los tensores están en 4 u 8 bits, con un único tensor en 6 bits. El nombre "5.5bpw" se refiere al objetivo de conversión, no a la precisión real.
- La torre de visión no está cuantizada: aunque esto preserva calidad visual, implica que la carga de imágenes requiere `mlx-optiq` y no funciona con `mlx-lm` estándar.
- Sin benchmarks publicados para este archivo: no se puede evaluar la degradación real respecto al modelo base.
- Idioma limitado: la model card solo declara inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- Requiere hardware Apple Silicon: no es ejecutable en GPUs NVIDIA o AMD sin conversión adicional.
- Riesgo de alucinación y sesgos: al ser un modelo de razonamiento, puede generar respuestas confiadas pero incorrectas, especialmente en tareas de código o matemáticas. No se han documentado sesgos específicos.
- Licencia MIT: permite uso comercial, pero el usuario es responsable del cumplimiento de las leyes aplicables y de los términos del modelo base.

## Enlaces

- Repositorio HuggingFace de este quant: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-static-5.5bpw
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante FP8 del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Variante NVFP4: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Web de mlx-optiq: https://mlx-optiq.com
- Documentación de mlx-optiq: https://mlx-optiq.com/docs/
- Página del modelo en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
- Ficha en Benchgen: https://benchgen.com/models/ornith-deepreinforce/ornith-1-5-35b-a3b
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html

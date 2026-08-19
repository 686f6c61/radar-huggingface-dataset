# Chungulus/Qwen3.8-27B-MLX-8bit-Group32

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MLX-8bit-Group32` es una cuantización MLX de 8 bits del modelo multimodal Qwen3.8-27B, desarrollada por Chungulus. Se trata de una conversión directa de los pesos originales en BF16 a formato MLX con cuantización afín de 8 bits y grupo de tamaño 32, sin calibración ni ajuste fino. El modelo base, Qwen/Qwen3.8-27B, emplea una arquitectura híbrida que combina Gated DeltaNet con atención completa, e incluye un componente de predicción multi-token (MTP) para acelerar la generación.

Esta cuantización está pensada para ejecutarse en hardware Apple Silicon con al menos 48 GB de memoria unificada, y es relevante porque permite desplegar un modelo de visión-lenguaje de 27B parámetros con un consumo de memoria reducido (32 GB en disco, pico de 35,2 GB en inferencia) y una aceleración medida del 40 % gracias al MTP. El autor ha validado la conversión mediante pruebas de texto, visión, tool calling y comparación semántica con la versión BF16, reportando una similitud media de 0,986 y una divergencia KL muy baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet / atención completa (identificador interno `qwen3_5`) |
| Parametros totales | 8.867.548.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (solo probado hasta 73 tokens de prompt en validación) |
| Tipos de cuantizacion | MLX affine 8-bit, group size 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina capas con Gated DeltaNet y capas con atención completa, junto con un codificador de visión y un proyector multimodal. El identificador interno `qwen3_5` no indica que provenga de un modelo Qwen3.5, sino que es la etiqueta de arquitectura del checkpoint oficial. La cuantización aquí presentada es una conversión directa de los pesos BF16 a MLX con cuantización afín de 8 bits y grupo de tamaño 32, sin calibración (calibration_source: none). El repositorio contiene 1199 tensores, de los cuales 333 corresponden a la torre de visión y 15 al componente MTP.

El componente MTP (Multi-Token Prediction) actúa como drafter en un esquema de decodificación especulativa. En las pruebas del autor, alcanzó una tasa de aceptación del 95,45 % y un aumento de throughput de 1,40x (de 7,93 a 11,11 tokens por segundo). No se ha realizado ningún entrenamiento adicional ni ajuste de alineación; los pesos están fijados al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo original.

## Capacidades

- Generación de texto y conversación multimodal (imagen-texto a texto).
- Tool calling nativo en formato XML de Qwen, validado con cinco pruebas superadas.
- Razonamiento con modo de pensamiento controlable mediante los parámetros `enable_thinking`, `reasoning_effort` y `preserve_thinking` del chat template original.
- Aceleración por decodificación especulativa con MTP, que mejora el throughput en hardware Apple Silicon.
- Capacidades de visión: descripción de imágenes y respuesta a preguntas visuales, validadas con pruebas deterministas locales.
- Soporte de procesador y tokenizer específicos del modelo base, con IDs de tokens especiales verificados.

## Casos de uso

- Descripción de imágenes en aplicaciones de accesibilidad: el modelo puede generar descripciones textuales detalladas de fotografías o ilustraciones, aprovechando su torre de visión y su ventana de contexto multimodal.
- Asistentes conversacionales con entrada visual: integración en chatbots que reciben capturas de pantalla o fotos y responden con texto, útil en soporte técnico o atención al cliente.
- Automatización de tareas con tool calling: el modelo puede invocar funciones externas (búsqueda, cálculo, APIs) en formato XML, lo que permite construir agentes que ejecutan acciones concretas a partir de instrucciones en lenguaje natural.
- Generación de código asistida por contexto visual: aunque no se han publicado benchmarks específicos, el modelo base Qwen3.8-27B está diseñado para tareas de programación; esta cuantización permite ejecutarlo en entornos Apple Silicon con memoria unificada.
- Análisis de documentos con imágenes: extracción de información de capturas, diagramas o formularios escaneados, combinando comprensión visual y generación de texto estructurado.
- Prototipado de aplicaciones multimodales en macOS: gracias a su formato MLX, se puede integrar en aplicaciones nativas de Apple usando `mlx-vlm` y `mlx-lm`, con un consumo de memoria acotado a 35 GB de pico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta métricas de validación internas, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Similitud semantica media vs BF16 | 0,986 |
| Coincidencia exacta de respuestas vs BF16 | 9 de 9 casos |
| Divergencia KL media (logits fijos) | 0,000318 |
| Acuerdo top-1 de tokens | 98,11 % |
| Perplejidad de referencia (BF16) | 9,847 |
| Perplejidad del candidato (cuantizado) | 9,853 |
| Throughput base (sin MTP) | 7,93 tps |
| Throughput con MTP | 11,11 tps |
| Aceleracion MTP | 1,40x |
| Pico de memoria en inferencia | 35,2 GB |

Estas mediciones son específicas del artefacto, del prompt y del hardware, y no deben extrapolarse a otros entornos.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con al menos 48 GB de memoria unificada (según el autor).
- Pico de memoria medido en inferencia: 35,2 GB, lo que sugiere que también podría ejecutarse en configuraciones de 36 GB, aunque no está garantizado.
- GPU recomendadas: chips Apple M-series (M1 Pro/Max/Ultra, M2, M3, etc.) con suficiente memoria unificada.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque el formato MLX está orientado a Apple Silicon; para GPUs NVIDIA habría que convertir a otro formato (GGUF, etc.).
- Opciones de despliegue: `mlx-vlm` (versión 0.6.1), `mlx-lm` (0.31.3) y `mlx` (0.31.2). También se puede usar el script de generación de `mlx_vlm.generate` con el drafter MTP.
- Latencia y throughput: en las pruebas del autor, 7,93 tps sin MTP y 11,11 tps con MTP, medidos en un entorno Apple Silicon no especificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 8,87 B | no disponible | safetensors (BF16) | Apache-2.0 | Modelo base original, requiere ~70 GB de memoria en FP16 |
| Chungulus/Qwen3.8-27B-MLX-8bit-Group32 | 8,87 B | no disponible | safetensors (MLX 8-bit) | Apache-2.0 | Cuantizacion MLX, 32 GB en disco, 35 GB de pico |
| Otras cuantizaciones de Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otras variantes cuantizadas |

La comparativa se limita al modelo base y a esta cuantización, ya que no se dispone de información sobre otras versiones cuantizadas del mismo modelo.

## Limitaciones y advertencias

- La cuantización de 8 bits puede reducir la calidad de las respuestas en comparación con el modelo BF16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- La longitud de contexto máxima no está documentada; solo se probaron 73 tokens de prompt en la validación, por lo que no se debe asumir que el modelo soporta contextos largos sin degradación.
- El formato MLX es específico de Apple Silicon; no es compatible directamente con GPUs NVIDIA o AMD sin conversión adicional.
- El componente MTP requiere el drafter incluido en el repositorio; si se omite, la generación es más lenta.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución al modelo original y a esta cuantización.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad; se recomienda validar el comportamiento en el dominio de aplicación antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-8bit-Group32
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B

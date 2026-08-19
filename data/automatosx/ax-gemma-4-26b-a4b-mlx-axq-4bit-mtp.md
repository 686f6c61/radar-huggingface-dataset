# AutomatosX/AX-gemma-4-26b-a4b-MLX-AXQ-4bit-MTP

## Resumen

El modelo `AutomatosX/AX-gemma-4-26b-a4b-MLX-AXQ-4bit-MTP` es una cuantización de precisión mixta (AXQ, AXQuant) del modelo `google/gemma-4-26b-a4b-it` de Google, perteneciente a la familia Gemma 4. Se trata de un modelo de tipo Mixture of Experts (MoE) con un total nominal de 26 mil millones de parámetros y 4 mil millones activos por token, aunque el archivo safetensors reporta aproximadamente 4.082 millones de parámetros, lo que sugiere una posible discrepancia en la metadata o una versión parcial. El checkpoint está optimizado para Apple Silicon mediante la librería MLX e incluye un drafter de multi-token prediction (MTP) para decodificación especulativa, aunque esta aceleración no está certificada.

El modelo se distribuye con licencia Gemma y está diseñado para generación de texto conversacional. Su principal valor es ofrecer un Gemma 4 de gran tamaño (26B-A4B) en un formato cuantizado a 4 bits con una retención de calidad certificada (≥0.98) y un peso medido de ~4.90 bits por parámetro, lo que permite ejecutarlo en hardware de Apple con memoria unificada. Incluye además un sidecar de visión no certificado y no soporta audio. La fecha de publicación es agosto de 2026 y ha recibido 39 descargas en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer (Gemma 4), con drafter MTP auxiliar |
| Parametros totales | 4.082.644.510 (según safetensors; el nombre indica 26B-A4B, lo que sugiere 26B totales y 4B activos, pero el archivo reporta ~4B) |
| Parametros activos | 4 mil millones (según la designación A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 4-bit (precisión mixta, ~4.90 BPW medido) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors (MLX) y archivos JSON de configuración |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `google/gemma-4-26b-a4b-it`, un modelo MoE de la familia Gemma 4 con 26B parámetros totales y 4B activos por token. La técnica AXQuant (AXQ) aplica cuantización de precisión mixta, asignando diferentes anchos de bits a distintas capas para minimizar la pérdida de calidad. El checkpoint incluye un drafter MTP (multi-token prediction) en el subdirectorio `assistant/`, diseñado para decodificación especulativa, aunque su aceleración no está certificada (Tier 2 no certificado). El modelo está adaptado para MLX, el framework de aprendizaje automático de Apple para Apple Silicon.

No se dispone de información sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card indica que el checkpoint ha pasado una certificación Tier 1 que verifica tamaño, retención de calidad (≥0.98) e integridad de conversión, pero no garantiza mejoras de velocidad.

## Capacidades

- Generación de texto y conversación multi-turno, orientado a tareas de chat y asistencia.
- Razonamiento y comprensión de lenguaje natural, propio de la familia Gemma 4.
- Soporte de decodificación especulativa mediante el drafter MTP, aunque no certificado para aceleración.
- Incluye un sidecar de visión (`vision.safetensors`) pero no está certificado y falla en pruebas con `mlx-vlm`, por lo que la funcionalidad multimodal no es fiable.
- No soporta audio (no hay torre de audio ni pesos asociados).
- No se especifica soporte de tool calling o function calling en la información disponible.
- Capacidades multilingües no documentadas en la model card.

## Casos de uso

- Asistente conversacional en aplicaciones de escritorio para macOS: el modelo puede ejecutarse localmente en Macs con Apple Silicon mediante MLX, ofreciendo respuestas de texto en tiempo real sin conexión a internet. Su tamaño reducido (4B activos) permite una latencia aceptable en equipos con suficiente memoria unificada.
- Generación de texto creativo y redacción: adecuado para escribir borradores de artículos, correos electrónicos o contenido técnico, aprovechando la capacidad de generación de lenguaje del modelo base Gemma 4.
- Análisis de documentos y extracción de información: aunque no se documenta tool calling, el modelo puede procesar textos largos (si el contexto lo permite) y resumir o extraer datos relevantes en entornos locales.
- Prototipado de aplicaciones de IA en desarrollo: los desarrolladores pueden integrar este checkpoint en entornos MLX para validar flujos de generación de texto antes de desplegar modelos más grandes en la nube.
- Educación y aprendizaje: útil como tutor de programación o explicador de conceptos técnicos, dado su entrenamiento en lenguaje natural y su capacidad de razonamiento.
- Investigación en cuantización y eficiencia: sirve como referencia para estudiar el impacto de AXQ en modelos MoE y para comparar con otras técnicas de cuantización en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica una retención de calidad ≥0.98 respecto a un baseline uniforme, pero no proporciona cifras de MMLU, HumanEval, GSM8K u otros tests estándar.

## Requisitos de hardware

- Diseñado para Apple Silicon (M1, M2, M3, M4) usando la librería MLX.
- Tamaño del repositorio: 16.1 GB, que incluye el modelo cuantizado y el drafter MTP. La memoria necesaria para cargar el modelo depende del número de parámetros reales (~4B) y de la cuantización; se estima entre 2 y 4 GB para los pesos, pero se recomienda al menos 16 GB de memoria unificada para un uso fluido.
- No se especifican GPUs NVIDIA o AMD; el formato MLX es exclusivo para Apple Silicon.
- Opciones de despliegue: MLX (librería nativa), con posibilidad de usar el motor AX Engine configurando variables de entorno como `AX_MLX_GEMMA4_ASSISTANT_MTP`.
- Latencia y throughput: no disponibles. La aceleración MTP no está certificada, por lo que el rendimiento esperado es el de una decodificación directa.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos. Como referencia cualitativa, este checkpoint se puede comparar con:

- `google/gemma-4-26b-a4b-it` (modelo base sin cuantizar): mayor precisión, pero requiere mucho más hardware (26B parámetros en fp16 ≈ 52 GB).
- Otros cuantizados AXQ para MLX, como la línea Qwen AXQ-MTP, que siguen un esquema similar pero con arquitecturas diferentes.
- Modelos MoE de tamaño comparable (p. ej., Mixtral 8x7B) que también ofrecen 4B activos, pero con licencias y ecosistemas distintos.

No se incluyen tablas de rendimiento por falta de datos verificados.

## Limitaciones y advertencias

- La cuantización AXQ 4-bit puede introducir degradación sutil en tareas complejas, aunque la certificación indica una retención de calidad ≥0.98.
- La funcionalidad de visión no está certificada y falla en pruebas con `mlx-vlm`; no debe usarse para tareas multimodales.
- La aceleración MTP no está certificada; activarla puede no ofrecer mejoras de velocidad y podría causar comportamientos inesperados.
- No se documentan idiomas soportados; el modelo base Gemma 4 probablemente soporta múltiples idiomas, pero no hay confirmación.
- La licencia Gemma tiene restricciones de uso comercial (consultar los términos de Google); no se permite el uso para ciertos fines prohibidos.
- Riesgo de alucinación y sesgos inherentes a los modelos de lenguaje; no se han publicado evaluaciones específicas para este checkpoint.
- El número de parámetros reportado en safetensors (~4B) contradice el nombre del modelo (26B-A4B), lo que puede indicar un error en la metadata o una versión incompleta; se recomienda verificar antes de usar en producción.

## Enlaces

- [HuggingFace: AutomatosX/AX-gemma-4-26b-a4b-MLX-AXQ-4bit-MTP](https://huggingface.co/AutomatosX/AX-gemma-4-26b-a4b-MLX-AXQ-4bit-MTP)
- [Modelo base: google/gemma-4-26b-a4b-it](https://huggingface.co/google/gemma-4-26b-a4b-it)
- [Certificado Tier 1 (GitHub)](https://github.com/defai-digital/axquant/blob/main/docs/certifications/gemma4-26b-a4b-axq4-tier1.md)
- [Repositorio AXQuant (GitHub)](https://github.com/defai-digital/axquant)

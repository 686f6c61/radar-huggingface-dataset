# Duckets/Tess-4.5-27B-Splash

## Resumen

Tess-4.5-27B-Splash es una conversión a formato MLX 4-bit del modelo Tess-4.5-27B, un fine-tune de Qwen3.5-27B desarrollado por Migel Tissera (Continuity Research). El paquete lo publica el usuario Duckets y está pensado para su uso con Splash, el runtime de inferencia de Inco AI, y con LM Studio. El modelo es multimodal (image-text-to-text) y está orientado a conversación, con capacidades de visión integradas.

El interés de esta ficha no radica en el modelo base, sino en el formato de distribución: el repositorio contiene el checkpoint MLX cuantizado a 4 bits (afín, grupo de 64) convertido desde el original en BF16 con mlx_vlm, y está preparado para que Splash empareje automáticamente el draft de decodificación especulativa DFlash2 de la misma familia (incoai/Qwen3.8-27B-DFlash2), relación que queda registrada en el fichero `splash-prep.json`.

Con 27.356.728.560 parámetros totales y un tamaño de repositorio de 33,5 GB, el modelo se sitúa en la franja de 27B densos con contexto declarado de 256K tokens. La licencia es Apache-2.0, heredada del modelo fuente. El autor reporta verificaciones de razonamiento y visión en un Apple M5 Max con 128 GB, con unas 114 tok/s de decodificación a contexto completo bajo Splash 1.7.3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con visión, familia Qwen3.5/Qwen3.8 (64 capas) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (según verificación del autor) |
| Tipos de cuantización | 4-bit afín, grupo de 64 (MLX); el modelo base está en BF16 |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base Tess-4.5-27B es un fine-tune de Qwen3.5-27B, un transformer denso de 64 capas con torre de visión, perteneciente a la familia que la model card denomina Qwen3.8-27B. La conversión aquí publicada no altera la arquitectura: aplica cuantización de 4 bits en formato afín con grupo de 64 mediante mlx_vlm sobre el checkpoint BF16 original, lo que reduce el peso en disco y memoria a costa de una pérdida de precisión controlada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el fine-tune de Tissera empleó RLHF, DPO u otras técnicas de alineación; esos datos corresponden al modelo fuente y no se detallan en esta model card. La innovación destacable del paquete es la integración con decodificación especulativa: Splash empareja automáticamente el draft DFlash2 de la familia Qwen3.8-27B, lo que acelera la decodificación sin cambiar los pesos objetivo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento aritmético y matemático básico (el autor verifica 17 × 23 = 391 y √169 = 13).
- Comprensión de imágenes y respuesta image-text-to-text (verificado con una imagen de color sólido).
- Contexto largo de hasta 256K tokens.
- Decodificación especulativa mediante el draft DFlash2 emparejado por Splash.
- Ejecución en Apple Silicon a través de MLX y del runtime Splash.
- Compatibilidad con LM Studio (runtime Splash o motor MLX).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Soporte multilingüe: limitado al inglés según la model card.

## Casos de uso

- Asistente conversacional de contexto largo: con 256K tokens de ventana, el modelo puede mantener conversaciones extensas o procesar documentos completos sin truncar, adecuado para atención al cliente con historial largo o análisis de contratos.
- Análisis de imágenes con descripción textual: al ser image-text-to-text, sirve para tareas de captioning, respuesta a preguntas sobre imágenes y verificación visual básica en flujos de accesibilidad o moderación.
- Inferencia local en Apple Silicon: el formato MLX 4-bit y el runtime Splash permiten desplegar un modelo de 27B en equipos Mac de gama alta (M5 Max con 128 GB verificado), sin depender de GPU de servidor.
- Prototipado rápido en LM Studio: basta con copiar la carpeta al directorio de modelos y cargar el runtime Splash, lo que facilita pruebas de concepto sin infraestructura adicional.
- Razonamiento matemático asistido: útil para resolución de operaciones y explicaciones paso a paso en herramientas educativas, aunque con las limitaciones propias de un modelo de 27B.
- Generación aumentada por recuperación (RAG) sobre corpus extensos: el contexto de 256K permite inyectar muchos fragmentos recuperados en una sola llamada, reduciendo la necesidad de pipelines de chunking complejos.
- Evaluación de modelos y benchmarking de runtimes: al ser una conversión con draft especulativo emparejado, sirve para medir el rendimiento de Splash frente a otros motores MLX en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento reportado por el autor es de inferencia, no de calidad: aproximadamente 114 tok/s de decodificación a contexto completo de 256K con Splash 1.7.3 en un Apple M5 Max de 128 GB.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 33,5 GB en 4-bit; se recomienda al menos 40 GB de memoria disponible para cargar el modelo con margen para el contexto y el draft DFlash2.
- Hardware verificado: Apple M5 Max con 128 GB de memoria unificada, con decodificación a ~114 tok/s a 256K de contexto.
- GPU NVIDIA: no hay datos de compatibilidad ni rendimiento en la información proporcionada; el formato MLX está orientado a Apple Silicon.
- GPU de consumo: no se confirma su funcionamiento en RTX 4090 u otras GPU consumer, dado que el paquete es específico de MLX.
- Opciones de despliegue: Splash CLI (`splash serve --model Duckets/Tess-4.5-27B-Splash`), LM Studio con runtime Splash o motor MLX. vLLM, llama.cpp, Ollama y TGI no están indicados para este formato.
- Latencia y throughput: ~114 tok/s de decodificación en M5 Max 128 GB con Splash 1.7.3; no se dispone de datos de prefill ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tess-4.5-27B-Splash (este) | 27,36B | 256K | MLX 4-bit | Apache-2.0 | Conversión para Splash/LM Studio con draft DFlash2 |
| migtissera/Tess-4.5-27B (base) | 27B (no confirmado en detalle) | no disponible | BF16 | Apache-2.0 (heredada) | Modelo fuente sin cuantizar |
| Qwen3.5-27B (familia origen) | 27B | no disponible | no disponible | no disponible | Base sobre la que se construye Tess-4.5 |

No se dispone de datos de benchmarks que permitan comparar calidad entre estos modelos; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Alucinación: no hay evaluación publicada de tasas de alucinación; como modelo conversacional de 27B, es esperable en tareas factuales sin recuperación.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Cuantización: el paso a 4 bits introduce degradación respecto al BF16 original, especialmente en tareas de precisión numérica o razonamiento complejo.
- Compatibilidad: el paquete es específico de MLX y Splash; no es directamente utilizable en vLLM, llama.cpp u Ollama sin reconversión.
- Dependencia del draft: el emparejamiento con DFlash2 lo gestiona Splash; otros runtimes no aprovecharán la decodificación especulativa.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y la model card advierte de que los paquetes legacy ya no son compatibles con LM Studio ni con Splash actual.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes de terceros (Splash, DFlash2) por separado.

## Enlaces

- Hugging Face: https://huggingface.co/Duckets/Tess-4.5-27B-Splash
- Modelo base: https://huggingface.co/migtissera/Tess-4.5-27B
- Draft DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2

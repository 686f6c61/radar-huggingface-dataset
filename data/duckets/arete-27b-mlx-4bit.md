# Duckets/Arete-27B-MLX-4bit

## Resumen

Arete-27B-MLX-4bit es una conversión cuantizada a 4 bits del modelo NousResearch/Arete-27B, un ajuste fino por SFT orientado a alineación de valores sobre Qwen3.8-27B. La conversión la publica el usuario Duckets y está pensada específicamente para su ejecución en Apple Silicon mediante la librería MLX y el runtime de LM Studio. El modelo conserva la naturaleza multimodal del original (pipeline image-text-to-text) y sus 27.356.728.560 parámetros totales.

El problema que resuelve es práctico: permite ejecutar un modelo de 27B con capacidades de visión y razonamiento en hardware de consumo de Apple sin necesidad de GPU dedicada, reduciendo el peso en disco a unos 16,1 GB (4,695 bits por peso) frente al checkpoint BF16 original. Es relevante para desarrolladores que trabajan en macOS y quieren prototipar con un modelo multimodal alineado sin infraestructura de servidor.

La ficha se centra en la conversión MLX 4-bit; los detalles de entrenamiento, dataset y benchmarks del modelo subyacente corresponden a NousResearch/Arete-27B y no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.8-27B; detalles internos no disponibles |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit MLX (4,695 bpw) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), ~15-16,1 GB en disco |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que NousResearch/Arete-27B es un ajuste fino por SFT (supervised fine-tuning) orientado a alineación de valores sobre Qwen3.8-27B, y que el modelo resultante es multimodal (procesa imagen y texto). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

Esta publicación concreta es una conversión de pesos, no un reentrenamiento: se tomó el checkpoint BF16 de NousResearch/Arete-27B (revisión `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`) y se convirtió con `mlx_vlm.convert` a 4 bits. No hay innovaciones arquitectónicas propias de esta conversión más allá de la cuantización MLX para Apple Silicon. Existe además un paquete alternativo del mismo modelo con el motor Splash (Duckets/Arete-27B-Splash), que reporta mayor velocidad.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento aritmético básico (verificado en la model card: 17 × 23 = 391, √169 = 13).
- Comprensión de imágenes (image-text-to-text): identificó correctamente el color de una imagen de color sólido.
- Conversación multi-turno (tag conversational).
- Integración con LM Studio y con mlx-vlm.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning: no disponible.
- Multilingüismo: limitado a inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local en macOS: cargar el modelo en LM Studio (identificado como `arete-27b-mlx`) para experimentar con un modelo multimodal de 27B sin GPU dedicada, aprovechando el runtime MLX en Apple Silicon.
- Asistentes conversacionales en inglés: desplegar un chatbot multi-turno en local para pruebas de alineación de valores, dado que el modelo base es un SFT orientado a ese fin.
- Análisis de imágenes sencillas: tareas de descripción o clasificación visual básica (por ejemplo, identificar colores o contenidos evidentes) integradas en flujos de trabajo locales.
- Verificación de razonamiento aritmético: usar el modelo para comprobaciones rápidas de cálculo elemental en entornos sin conexión.
- Evaluación comparativa de cuantizaciones: comparar esta versión 4-bit MLX con la versión Splash o con el BF16 original para medir el impacto de la cuantización en calidad y velocidad.
- Desarrollo de aplicaciones offline en Apple Silicon: integrar el modelo vía mlx-vlm en herramientas de escritorio que requieran inferencia local sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados son pruebas de humo del autor:

| Prueba | Resultado |
|---|---|
| Razonamiento (17 × 23) | 391 (correcto) |
| Razonamiento (√169) | 13 (correcto) |
| Visión (imagen de color sólido) | identificado "red" (correcto) |
| Velocidad de decodificación (MLX, single stream) | 31,2 tok/s en M5 Max (128 GB), prompt ~60 tokens, temp 0 |
| Velocidad con motor Splash (referencia) | 104,5 tok/s en LM Studio (paquete separado) |

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 16,1 GB; se necesita al menos esa cantidad de memoria unificada libre, con margen para el contexto y el runtime (en la prueba se usó un equipo de 128 GB).
- GPU recomendadas: Apple Silicon (el autor verificó en M5 Max de 128 GB). No está pensado para GPU NVIDIA/AMD.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon con memoria unificada suficiente (orientativamente 24 GB o más, aunque no se confirma oficialmente un mínimo).
- Opciones de despliegue: MLX (`mlx_vlm`), LM Studio (runtime MLX), y el paquete alternativo con motor Splash.
- Latencia y throughput: 31,2 tok/s de decodificación en single stream en M5 Max con MLX; 104,5 tok/s con el motor Splash según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-MLX-4bit (esta ficha) | 27,36B | no disponible | 4-bit MLX | Apache-2.0 | Hugging Face (483 descargas) |
| NousResearch/Arete-27B | no disponible (base) | no disponible | BF16 | Apache-2.0 (según fuente) | Hugging Face |
| Duckets/Arete-27B-Splash | mismo modelo base | no disponible | paquete Splash | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés según los metadatos; no se garantiza un rendimiento adecuado en castellano.
- Contexto: la longitud de contexto no está documentada en la información disponible; conviene verificarla antes de usos con documentos largos.
- Alucinación: no hay datos publicados sobre tasas de alucinación; las pruebas de humo son mínimas (una operación aritmética y una imagen de color sólido).
- Sesgos: no se documentan sesgos conocidos; al ser un SFT de alineación de valores, el comportamiento puede estar condicionado por las preferencias del ajuste.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base (NousResearch/Arete-27B) y de Qwen3.8-27B.
- Plataforma: exclusivo para Apple Silicon vía MLX; no es portable a CUDA sin reconversión.
- Madurez: 0 likes y 483 descargas; conversión reciente (noviembre de 2026) y escasamente validada por la comunidad.
- Cuantización: la pérdida de calidad respecto al BF16 no está medida ni documentada.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/Duckets/Arete-27B-MLX-4bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Paquete con motor Splash: https://huggingface.co/Duckets/Arete-27B-Splash

# litert-community/LFM2.5-VL-1.6B

## Resumen

LFM2.5-VL-1.6B es un modelo de lenguaje y visión (VLM) desarrollado originalmente por Liquid AI y convertido al formato LiteRT-LM por la comunidad litert-community para su ejecución en dispositivos. Se trata de la variante intermedia de la familia LFM2.5-VL, situada entre los modelos de 450M y 3B de parámetros. El modelo combina un backbone de texto híbrido LFM2 con una torre de visión SigLIP2, lo que permite procesar imágenes y texto de forma conjunta en entornos de borde.

La relevancia de esta conversión radica en que empaqueta el modelo completo (encoder de visión, adaptador y pesos de lenguaje) en un único archivo `.litertlm` optimizado para el runtime LiteRT-LM de Google, sucesor de TensorFlow Lite. Esto permite ejecutar inferencia multimodal en dispositivos Android y macOS sin necesidad de infraestructura en la nube, con un tamaño de archivo de 1,30 GB en su versión int4.

El modelo está pensado para aplicaciones de borde donde el coste de latencia, privacidad y conectividad es crítico. No obstante, la model card documenta un problema conocido en el runtime que afecta a la percepción posicional de las imágenes, lo que condiciona su uso en tareas que requieran localización espacial precisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convoluciones cortas con compuerta + atención con query agrupada) para texto; SigLIP2 para visión |
| Parametros totales | 1,6B (aproximado, según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV máxima) |
| Tipos de cuantizacion | int8 dinámico, int4 blockwise-32 (lineales de texto), int8 en embedding y lm_head, int8 en torre de visión |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (other) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Capas de texto | 16 |
| Dimensión oculta (texto) | 2048 |
| Vocabulario | 64k |
| Torre de visión | SigLIP2, 27 capas, dimensión oculta 1152 |
| Entrada de imagen | 1 por prompt, redimensionada a 512×512, 256 tokens suaves |
| Backend | CPU y GPU (litert-lm ≥ 0.16.0 en macOS y Android OpenCL; Metal en iOS falla) |
| Tamaño de archivo | 1,81 GB (int8), 1,30 GB (int4) |

## Arquitectura y entrenamiento

El backbone de texto emplea una arquitectura híbrida LFM2 de 16 capas que combina convoluciones cortas con compuerta (gated short-convolutions) y atención con query agrupada (grouped-query attention), con una dimensión oculta de 2048 y un vocabulario de 64k tokens. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la capacidad de modelado secuencial. La torre de visión es un SigLIP2 de 27 capas y dimensión oculta 1152, compartida con la variante de 3B de la familia, lo que sugiere que la diferencia de tamaño entre modelos reside principalmente en el backbone de lenguaje.

La conversión a LiteRT-LM preserva los pesos y el tokenizador, pero reexporta los grafos de visión para corregir la ubicación del *pixel-unshuffle* 2×2, que en el modelo original se realiza en el adaptador de visión y no en el encoder. Esta discrepancia con las suposiciones del runtime provoca que solo el cuarto superior de la imagen llegue al modelo en las versiones estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno dentro de una ventana de 4096 tokens.
- Comprensión de imágenes: descripción, respuesta a preguntas sobre color, OCR de texto grande y reconocimiento de formas dominantes.
- Procesamiento de una imagen por prompt, redimensionada automáticamente por el runtime a 512×512.
- Soporte de plantilla ChatML integrada en el archivo, con inserción de marcadores de posición de imagen por parte del procesador de datos del runtime.
- Modelo no-thinking (sin modo de razonamiento extendido).
- Ejecución en CPU y GPU en Android (OpenCL) y macOS; en iOS solo CPU debido a un fallo conocido en la creación del motor con Metal.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Atención al cliente en dispositivos**: el modelo puede gestionar conversaciones multi-turno con un contexto de 4096 tokens directamente en el dispositivo, evitando el envío de datos a la nube y reduciendo la latencia en aplicaciones de mensajería o asistentes integrados.
- **Descripción de imágenes en tiempo real**: adecuado para aplicaciones de accesibilidad que narren el contenido visual dominante de una foto, ya que responde correctamente a preguntas sobre color y texto grande, aunque no debe usarse para localización espacial precisa.
- **OCR de texto prominente**: útil en escenarios de digitalización de carteles, etiquetas o documentos con texto de gran tamaño, donde el modelo puede extraer y transcribir el contenido visible sin infraestructura adicional.
- **Asistente de cámara en Android**: integrable mediante LiteRT-LM en aplicaciones nativas para responder preguntas sobre una imagen capturada, con la ventaja de que el archivo int4 de 1,30 GB cabe en el almacenamiento de un teléfono de gama media.
- **Clasificación visual ligera en el borde**: para tareas de verificación de presencia de objetos dominantes o detección de formas simples en entornos con conectividad limitada, como inspección en campo o agricultura de precisión.
- **Prototipado de agentes multimodales**: dado su soporte de plantilla ChatML y su integración con el runtime LiteRT-LM, sirve para validar flujos de agente que combinen texto e imagen antes de escalar a la variante de 3B, que según la model card es la que conserva capacidades de *grounding* por coordenadas.

## Benchmarks y rendimiento

Los datos disponibles provienen de las comprobaciones de calidad realizadas por el conversor, no de benchmarks estándar como MMLU o HumanEval.

| Configuración | Texto (8 preguntas) | Imagen (5 preguntas) |
|---|---|---|
| PyTorch bf16 (referencia) | — | 5/5 |
| LiteRT int4-b32 (CPU y GPU) | 8/8 | 3/5 |
| LiteRT int8 (CPU y GPU) | 8/8 | 3/5 |

Las pruebas de imagen incluyen color dominante, OCR de texto grande, forma, conteo de tres cuadrados y palabra más larga. Las preguntas de geometría adicional (esquina de un objeto, rayas horizontales frente a verticales) también se responden correctamente, pero las de forma fina y conteo fallan. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el sentido tradicional, ya que el modelo está diseñado para ejecución en dispositivo; el archivo int4 ocupa 1,30 GB y el int8 1,81 GB en almacenamiento, con requisitos de memoria RAM proporcionales durante la inferencia.
- **GPU recomendadas**: no se especifican modelos de GPU de escritorio; el modelo se ha verificado en un Pixel 8a (Android 16) con el encoder de visión en CPU y el modelo de lenguaje en GPU, y también con ambos en CPU.
- **Compatibilidad con GPU de consumo**: no hay datos sobre RTX 4090, A100 o H100, ya que el formato `.litertlm` está orientado a dispositivos móviles y macOS, no a servidores con GPU dedicada.
- **Opciones de despliegue**: runtime LiteRT-LM (versión 0.16.0 o superior para GPU; 0.16.1 y 0.17.0 para la versión corregida `fixB`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-1.6B (este) | 1,6B | 4096 | Sí (SigLIP2, 512×512) | LFM Open License v1.0 | `.litertlm` |
| LFM2.5-VL-450M | 450M (aprox.) | no disponible | Sí | LFM Open License v1.0 | `.litertlm` |
| LFM2.5-VL-3B | 3B (aprox.) | no disponible | Sí, con grounding por coordenadas | LFM Open License v1.0 | `.litertlm` |

La comparativa se limita a la propia familia LFM2.5-VL, ya que no se proporcionan datos de modelos alternativos de otros desarrolladores. La variante de 3B es la única que conserva la capacidad de *grounding* por coordenadas según la model card, mientras que la de 450M es la más ligera de la familia.

## Limitaciones y advertencias

- **Problema conocido de percepción posicional**: en litert-lm 0.16.0 y en `main`, solo el cuarto superior de la imagen llega al modelo. Las tareas de localización, conteo, enumeración o preguntas posicionales devuelven respuestas incorrectas sin generar error. Afecta a todos los archivos LFM2.5-VL, no solo a este.
- **Corrección parcial**: el archivo `LFM2.5-VL-1.6B_int4_fixB.litertlm` restaura el área visible completa en litert-lm 0.16.1 y 0.17.0, pero no recupera el *grounding* por coordenadas, que sigue siendo una capacidad exclusiva de la variante de 3B.
- **Una sola imagen por prompt**: no admite múltiples imágenes en una misma consulta.
- **Contexto limitado**: 4096 tokens de caché KV, adecuado para conversaciones cortas pero insuficiente para documentos largos o historiales extensos.
- **Sin modo thinking**: el modelo no dispone de razonamiento extendido, lo que limita tareas de razonamiento complejo.
- **Compatibilidad de backend restringida**: Metal en iOS falla en la creación del motor; solo CPU en esa plataforma.
- **Licencia**: LFM Open License v1.0, que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- **Riesgo de alucinación**: no se documentan evaluaciones específicas de sesgos o alucinaciones; las pruebas de calidad se limitan a preguntas sintéticas deterministas.
- **Idiomas**: no se especifican los idiomas soportados, lo que impide garantizar un rendimiento multilingüe adecuado.

## Enlaces

- [Hugging Face: litert-community/LFM2.5-VL-1.6B](https://huggingface.co/litert-community/LFM2.5-VL-1.6B)
- [Modelo base: LiquidAI/LFM2.5-VL-1.6B](https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B)
- [Runtime LiteRT-LM](https://github.com/google-ai-edge/litert-lm)
- [Issue LiteRT-LM#3246 (problema de pixel-unshuffle)](https://github.com/google-ai-edge/LiteRT-LM/issues/3246)
- [Issue LiteRT-LM#3129 (fallo de Metal en iOS)](https://github.com/google-ai-edge/LiteRT-LM/issues/3129)
- [Script de reexportación de visión](https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/reexport_vision_unshuffle.py)
- [Script de reempaquetado de visión](https://github.com/john-rocky/LiteRT-Models/blob/screen-agent/screen-agent/tools/repack_vision.py)
- [Benchmark de runtimes en Android](https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md)
- [LFM2.5-VL-450M en LiteRT](https://huggingface.co/litert-community/LFM2.5-VL-450M)
- [LFM2.5-VL-3B en LiteRT](https://huggingface.co/litert-community/LFM2.5-VL-3B)

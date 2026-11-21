# ryu0132/Qwen3.6-35B-A3B-NVFP4-Fast-GGUF

## Resumen

Qwen3.6-35B-A3B-NVFP4-Fast-GGUF es una conversión a formato GGUF del modelo unsloth/Qwen3.6-35B-A3B-NVFP4-Fast, una variante cuantizada en NVFP4 del modelo Qwen3.6-35B-A3B. El autor de la conversión es el usuario ryu0132, mientras que el modelo base procede de Unsloth. El repositorio tiene como objetivo facilitar el despliegue del modelo en runtimes GGUF (llama.cpp y derivados) conservando el pipeline image-text-to-text, es decir, con capacidad de entrada de imágenes además de texto.

El modelo pertenece a la familia Qwen3.6 y presenta una arquitectura de mezcla de expertos (MoE) con 34.660.672.368 parámetros totales y una designación A3B que indica aproximadamente 3 mil millones de parámetros activos por token. El repositorio incluye no solo los pesos principales sino también un proyector de visión (mmproj) y pesos de predicción multi-token (MTP), lo que refleja que el modelo soporta entrada multimodal y decodificación especulativa.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo MoE multimodal de gran tamaño en entornos con recursos limitados, gracias a la cuantización NVFP4 y a las conversiones adicionales a BF16 y Q8_0. Sin embargo, la información publicada por el autor es mínima y no se detallan idiomas, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer, multimodal image-text-to-text |
| Parámetros totales | 34.660.672.368 |
| Parámetros activos | aproximadamente 3 mil millones (designación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (base), conversiones a BF16 y Q8_0 en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores NVFP4, BF16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de la familia Qwen3.6, con 34.660 millones de parámetros totales y aproximadamente 3 mil millones activos por token. La designación A3B confirma este esquema de activación dispersa, orientado a reducir el coste computacional de inferencia manteniendo una capacidad de parámetros elevada. El pipeline declarado es image-text-to-text, lo que implica la presencia de un codificador visual y un proyector multimodal que permite introducir imágenes junto con texto.

La conversión a GGUF realizada por ryu0132 parte de la variante NVFP4 de Unsloth y ofrece tres formatos de pesos principales: el archivo principal con pesos FP8 convertidos a BF16, una versión con pesos FP8 convertidos a Q8_0, y archivos separados para el proyector de visión (mmproj-BF16 y mmproj-Q8_0) y para los pesos de predicción multi-token (mtp-BF16 y mtp-Q8_0). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la inclusión de pesos MTP, que habilitan decodificación especulativa multi-token, y el uso de cuantización NVFP4 en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno en formato conversational.
- Entrada de imágenes junto con texto (image-text-to-text) mediante el proyector de visión incluido.
- Razonamiento y respuesta a instrucciones, heredado del modelo base Qwen3.6.
- Predicción multi-token (MTP) para decodificación especulativa, si el runtime lo soporta.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede recibir imágenes y texto en el mismo turno, lo que permite responder preguntas sobre capturas de pantalla, diagramas o fotografías dentro de un chat multi-turno.
- Análisis de documentos escaneados: gracias al proyector de visión, se puede usar para extraer información de facturas, formularios o tickets en flujos de digitalización.
- Despliegue en hardware de gama alta con memoria limitada: la cuantización NVFP4 y las conversiones a Q8_0 reducen el espacio de pesos respecto a BF16, lo que facilita ejecutar un MoE de 34,6 mil millones de parámetros en una o pocas GPU.
- Prototipado rápido con llama.cpp u Ollama: al estar en formato GGUF, se integra en runtimes de inferencia locales sin necesidad de infraestructura de servido compleja.
- Generación asistida con decodificación especulativa: los pesos MTP permiten acelerar la generación en runtimes que soporten predicción multi-token, útil en aplicaciones interactivas de baja latencia.
- Evaluación de modelos MoE multimodales en investigación: sirve como banco de pruebas para estudiar el impacto de la cuantización NVFP4 en la calidad de salida frente a BF16 o Q8_0.
- Integración en pipelines de visión por computador con lenguaje natural: por ejemplo, descripción automática de imágenes o respuesta a preguntas visuales en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 34,6 mil millones de parámetros en BF16 requiere del orden de 69 GB solo para pesos; en Q8_0, alrededor de 35 GB; y en NVFP4, aproximadamente 17-18 GB para los pesos, sin contar el proyector de visión ni la caché KV.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un MoE de esta magnitud encaja en GPU profesionales como A100 (80 GB) o H100 (80 GB) para BF16, y en GPU de consumo de 24 GB o más para cuantizaciones de 4 bits.
- ¿Cabe en GPU de consumo? Con cuantización NVFP4 o Q8_0 es plausible en tarjetas de 24 GB (RTX 4090, RTX 3090) o 32 GB, siempre que el runtime soporte los tensores NVFP4 y la arquitectura MoE. No hay confirmación oficial.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; se requiere soporte específico para tensores NVFP4, visión y MTP.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-NVFP4-Fast-GGUF (este) | 34,66 B | ~3 B | no disponible | Apache 2.0 | GGUF (NVFP4/BF16/Q8_0) |
| unsloth/Qwen3.6-35B-A3B-NVFP4-Fast | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | safetensors NVFP4 |
| Qwen3.6-35B-A3B (modelo original) | ~35 B | ~3 B | no disponible | Apache 2.0 | safetensors |
| Alternativas GGUF de la misma familia | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- La información publicada por el autor es mínima: no se detallan idiomas, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- El uso de tensores NVFP4 requiere runtimes con soporte explícito; sin él, el modelo puede no cargar o producir resultados incorrectos.
- La visión y la predicción multi-token (MTP) requieren soporte específico del runtime; no funcionan en todos los motores GGUF.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de documentación sobre el entrenamiento y la evaluación.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- La cuantización NVFP4 y las conversiones a BF16/Q8_0 pueden degradar la calidad respecto al modelo original en tareas sensibles a la precisión numérica.
- El repositorio tiene 851 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/ryu0132/Qwen3.6-35B-A3B-NVFP4-Fast-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-NVFP4-Fast
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.

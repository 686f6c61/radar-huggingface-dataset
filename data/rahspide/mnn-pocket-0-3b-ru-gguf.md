# Rahspide/MNN-Pocket-0.3B-RU-GGUF

## Resumen

MNN-Pocket-0.3B-RU-GGUF es la conversión a formato GGUF del modelo Rahspide/MNN-Pocket-0.3B-RU, un modelo de continuación de texto en ruso de 0,36 mil millones de parámetros desarrollado por el usuario Rahspide. Se construye mediante preentrenamiento continuado sobre taobao-mnn/MNN-Pocket-0.3B-Base, con 1.200 millones de tokens adicionales (900 millones en ruso, 204 millones en inglés y 96 millones en chino). El modelo está diseñado específicamente para autocompletado y sugerencias de teclado, no para diálogo conversacional: continúa un prefijo dado en lugar de responder a él.

La relevancia de esta ficha radica en su orientación a despliegue en dispositivo (edge computing), con cuantizaciones que van desde 581 MB en F16 hasta 223 MB en Q4_K_M, lo que permite ejecutarlo en teléfonos móviles y sistemas embebidos mediante llama.cpp. La licencia Apache 2.0 facilita su integración comercial sin restricciones adicionales.

El modelo forma parte de la familia MNN-Pocket de Taobao (taobao-mnn), de la que hereda la arquitectura base, aunque la model card no detalla la arquitectura interna ni innovaciones técnicas específicas más allá del tokenizador byte-level. Su público objetivo son desarrolladores que necesitan un motor de autocompletado ligero y multilingüe (ruso, inglés, chino) con latencia baja en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base taobao-mnn/MNN-Pocket-0.3B-Base; la model card no detalla la arquitectura interna) |
| Parámetros totales | 302.830.976 (0,36 B según la model card) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q4_K_M |
| Idiomas soportados | Ruso (ru), inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también existe el modelo base en safetensors en Rahspide/MNN-Pocket-0.3B-RU) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo base (transformer, MoE, SSM u otra). Se sabe que parte de taobao-mnn/MNN-Pocket-0.3B-Base y que se ha sometido a un preentrenamiento continuado con 1.200 millones de tokens: 900 millones en ruso, 204 millones en inglés y 96 millones en chino. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación en la información proporcionada.

Un detalle técnico destacable es el tokenizador byte-level: un token puede terminar en medio de un carácter cirílico, por lo que llama.cpp almacena en búfer la secuencia UTF-8 parcial. Cualquier decodificador implementado a mano debe replicar este comportamiento para evitar corrupción de texto. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto por continuación de prefijo (text continuation), no instruccional ni conversacional.
- Autocompletado y sugerencias de teclado en ruso, con soporte secundario de inglés y chino.
- Generación de texto multilingüe limitada a ru, en y zh.
- Inferencia en dispositivo (on-device) y entornos edge gracias a su tamaño reducido.
- Compatible con llama.cpp y con endpoints compatibles (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Autocompletado en teclados móviles rusos: el modelo continúa el prefijo escrito por el usuario y su cuantización Q4_K_M (223 MB) cabe en la memoria de un teléfono, con generación de 123–130 tok/s en CPU x86 de 16 hilos como referencia.
- Sugerencias predictivas en editores de texto: integrado mediante llama.cpp, puede ofrecer continuaciones de frases mientras el usuario escribe, con latencia baja en hardware consumer.
- Completado de formularios y campos de entrada: al continuar prefijos cortos, resulta útil para rellenar campos de texto libre con texto plausible en ruso.
- Asistentes de escritura en aplicaciones de mensajería: generación de continuaciones de mensajes cortos en ruso sin necesidad de conexión a la nube.
- Prototipado de sistemas de autocompletado multilingüe: su soporte de ru, en y zh permite experimentar con sugerencias en tres idiomas en un mismo binario GGUF.
- Despliegue en dispositivos con recursos limitados: sistemas embebidos, Raspberry Pi o navegadores con llama.cpp que no pueden alojar modelos de mayor tamaño.
- Investigación sobre modelos pequeños de continuación de texto: base ligera para estudiar el comportamiento de modelos de 0,3 B en tareas de autocompletado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente proporciona mediciones de rendimiento de inferencia en CPU x86 de 16 hilos:

| Cuantización | Tamaño | Throughput medido |
|---|---|---|
| F16 | 581 MB | No medido (referencia, no para despliegue) |
| Q8_0 | 310 MB | ~99–103 tok/s |
| Q4_K_M | 223 MB | ~123–130 tok/s |

No se han medido cifras en teléfonos móviles según la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño de archivo, Q4_K_M requiere aproximadamente 223 MB de memoria y Q8_0 unos 310 MB, más el overhead del runtime de llama.cpp.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y despliegue en dispositivo.
- Cabe en GPU consumer: sí, cualquier GPU con al menos ~0,5 GB de memoria libre puede alojar las cuantizaciones Q4_K_M y Q8_0; también cabe en CPU y dispositivos móviles.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con APIs de endpoints estándar.
- Latencia y throughput: ~123–130 tok/s con Q4_K_M y ~99–103 tok/s con Q8_0 en CPU x86 de 16 hilos; no hay datos de latencia ni de rendimiento en móvil.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de la misma categoría (modelos de continuación de texto de ~0,3 B parámetros orientados a edge). El modelo base taobao-mnn/MNN-Pocket-0.3B-Base es el único pariente directo mencionado, pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- El modelo continúa prefijos; no responde preguntas ni mantiene diálogos. Usarlo como chatbot producirá resultados inadecuados.
- Riesgo de alucinación y de continuaciones gramaticalmente plausibles pero factualmente incorrectas, inherente a un modelo de 0,3 B sin alineación documentada.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente con ruso, puede reflejar sesgos de ese corpus.
- Limitaciones de idioma: el ruso es el idioma principal (900 M de 1.200 M tokens); inglés y chino tienen cobertura mucho menor (204 M y 96 M de tokens) y su calidad puede ser inferior.
- Longitud de contexto: no especificada, lo que dificulta planificar su uso en entradas largas.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del modelo base taobao-mnn/MNN-Pocket-0.3B-Base.
- El tokenizador byte-level puede partir caracteres cirílicos entre tokens; los decodificadores propios deben gestionar secuencias UTF-8 parciales.
- No hay mediciones de rendimiento en móvil; las cifras de throughput corresponden solo a CPU x86 de 16 hilos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que su validación por la comunidad es inexistente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-GGUF
- Modelo base (pesos, receta de entrenamiento y mediciones): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Modelo base original de Taobao: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base

# balllvin/LFM3-1.7B-Abliterated-Arete-ONNX-WebGPU

## Resumen

LFM3-1.7B-Abliterated-Arete-ONNX-WebGPU es una exportación a formato ONNX del modelo balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4, un derivado del LFM3 de 1.700 millones de parámetros de Liquid AI que ha sido sometido a un proceso de "abliteration" (eliminación de los mecanismos de rechazo alineados) y posteriormente cuantizado a NVFP4. Esta versión concreta empaqueta los pesos en ONNX para su ejecución mediante onnxruntime-web con el backend WebGPU, lo que permite la inferencia directamente en el navegador del cliente sin necesidad de servidores intermedios.

El modelo resuelve el problema de desplegar un LLM conversacional de tamaño medio en entornos web sin infraestructura de GPU dedicada, aprovechando la aceleración WebGPU disponible en navegadores modernos. El repositorio ocupa 1,4 GB y está publicado por el usuario individual balllvin, no por Liquid AI, por lo que se trata de una modificación de la comunidad sin soporte oficial del desarrollador original.

Es relevante ahora porque WebGPU se ha consolidado como estándar en Chrome, Edge y otros navegadores basados en Chromium durante 2025-2026, y la combinación de un modelo de 1.7B con cuantización agresiva NVFP4 y exportación ONNX representa un caso práctico de inferencia local en cliente. No obstante, la información pública disponible es muy limitada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y el acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 de Liquid AI, según modelo base); detalles exactos no disponibles |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (en el modelo base); exportación ONNX para WebGPU |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia de Liquid AI, con restricciones; acceso gated) |
| Formato de pesos | ONNX (onnxruntime, onnxruntime-web) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 de Liquid AI, una familia de transformers de tamaño compacto orientada a despliegue eficiente. El repositorio original del que deriva (balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4) aplica dos transformaciones sobre el modelo base: primero un proceso de abliteration que elimina las direcciones de activación asociadas al rechazo de peticiones, y después una cuantización a NVFP4 (formato de 4 bits con escalas por bloque, optimizado para GPUs NVIDIA Blackwell y compatible con runtimes que lo soporten). Esta exportación concreta convierte esos pesos a ONNX para su ejecución con onnxruntime-web y el backend WebGPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original LFM3, más allá de lo que Liquid AI haya publicado en su documentación oficial (no incluida en la información proporcionada). Tampoco se documenta el procedimiento exacto de abliteration aplicado ni el impacto que tuvo sobre las capacidades del modelo. La innovación técnica destacable de esta ficha es el propio pipeline de exportación: ONNX + WebGPU permite ejecutar el modelo en el navegador con aceleración por GPU del cliente, algo poco habitual en modelos de esta escala.

## Capacidades

- Generación de texto conversacional multi-turno, según la pipeline declarada (text-generation, conversational).
- Razonamiento y generación de código: capacidades heredadas del LFM3 base, aunque no se documentan evaluaciones específicas tras la abliteration.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en la ficha de Hugging Face).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el pipeline declarado es únicamente text-generation.
- Ejecución en navegador mediante onnxruntime-web y WebGPU, lo que constituye la capacidad diferencial de esta exportación.

## Casos de uso

- Asistente conversacional embebido en una aplicación web: el modelo se ejecuta íntegramente en el navegador del usuario mediante WebGPU, eliminando la necesidad de enviar conversaciones a un servidor y reduciendo la latencia de red a cero. Adecuado para demos interactivas y prototipos.
- Procesamiento de texto offline en aplicaciones PWA: al no requerir backend, puede integrarse en aplicaciones web progresivas que funcionen sin conexión una vez descargados los pesos (1,4 GB), útil en entornos con conectividad limitada.
- Generación de texto sensible a la privacidad: casos donde el usuario no quiere que sus prompts salgan del dispositivo, como borradores de documentos personales o análisis de texto confidencial en cliente.
- Herramienta educativa de experimentación con LLMs: permite a estudiantes e investigadores probar un modelo de 1.7B directamente en el navegador sin configurar infraestructura de GPU, facilitando talleres y demostraciones.
- Prototipado rápido de interfaces conversacionales: desarrolladores que quieran validar UX de chat con un modelo real antes de invertir en un backend de producción con vLLM o TGI.
- Investigación sobre abliteration y alineación: el modelo sirve como caso de estudio para analizar cómo afecta la eliminación de mecanismos de rechazo al comportamiento del modelo en dominios sensibles, siempre con las cautelas éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización NVFP4 el modelo base ocupa aproximadamente 0,85-1 GB de pesos; la exportación ONNX completa pesa 1,4 GB en disco. La VRAM efectiva depende del runtime y del navegador, pero debería caber holgadamente en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable en el navegador (Chrome/Edge 113+). Para NVFP4 nativo se requieren GPUs NVIDIA Blackwell (serie RTX 50 o B200); en otras GPUs el runtime deberá de-cuantizar o reinterpretar los pesos, con la penalización de rendimiento correspondiente.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs integradas y dedicadas recientes con WebGPU habilitado (por ejemplo, Intel Iris Xe, AMD Radeon, NVIDIA GTX 1650 en adelante).
- Opciones de despliegue: onnxruntime-web con backend WebGPU (objetivo principal de esta exportación); onnxruntime nativo para escritorio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que esperan otros formatos (safetensors, GGUF).
- Latencia y throughput: no disponibles. Dependerán del navegador, la GPU del cliente y la implementación del kernel WebGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| balllvin/LFM3-1.7B-Abliterated-Arete-ONNX-WebGPU | 1.7B | no disponible | ONNX (WebGPU) | lfm1.0 (gated) | Hugging Face, acceso restringido |
| LiquidAI/LFM3-1.7B (modelo base oficial) | 1.7B | no disponible en esta ficha | safetensors | lfm1.0 | Hugging Face, público |
| balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4 (origen) | 1.7B | no disponible | NVFP4 | lfm1.0 | Hugging Face |
| Modelos ONNX WebGPU de tamaño similar (p. ej. exportaciones de Qwen2.5-1.5B) | ~1.5B | variable según base | ONNX | según base | Hugging Face, comunidad |

La comparativa con alternativas de la misma categoría (exportaciones ONNX para WebGPU) es limitada porque no se han publicado benchmarks de este repositorio ni del modelo base en la información disponible. La diferencia principal frente al LFM3 oficial es la abliteration y la cuantización NVFP4, que alteran el comportamiento del modelo respecto al original.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo del modelo, por lo que puede generar contenido que el LFM3 original rechazaría. No es apto para producción sin filtros externos de seguridad y moderación.
- Riesgo de alucinación inherente a un modelo de 1.7B, agravado por la cuantización a 4 bits, que puede degradar la coherencia en tareas de razonamiento complejo.
- El repositorio tiene cero descargas y cero likes, y está publicado por un usuario individual sin afiliación conocida con Liquid AI. No hay garantía de mantenimiento, soporte ni calidad de la exportación.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad en pipelines automatizados.
- Licencia lfm1.0: conviene revisar los términos exactos de Liquid AI antes de cualquier uso comercial, especialmente en lo relativo a modelos derivados y redistribución.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe fiable.
- Compatibilidad WebGPU dependiente del navegador y la GPU del cliente; el soporte de NVFP4 nativo está limitado a hardware Blackwell, y en el resto de GPUs el rendimiento puede degradarse notablemente.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia para conversaciones largas.
- El tamaño del repo (1,4 GB) implica una descarga considerable para el usuario final en un contexto de navegador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-Arete-ONNX-WebGPU
- Modelo base de la exportación: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Especificación WebGPU (W3C): https://www.w3.org/TR/webgpu/
- Liquid AI (desarrollador del LFM3 original): https://www.liquid.ai/

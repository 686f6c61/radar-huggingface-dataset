# mradermacher/Qwen3.8-27B-MTP-heretic-ja-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `OS-Software/Qwen3.8-27B-MTP-heretic-ja`, preparadas por el usuario mradermacher. El modelo original es una variante de Qwen3.8-27B, un modelo denso de 27 000 millones de parámetros desarrollado por Alibaba, con una ventana de contexto de hasta 262 144 tokens y licencia Apache 2.0 en su versión oficial. La variante "heretic-ja" parece estar orientada a un uso sin restricciones de contenido (uncensored) y con énfasis en el idioma japonés, aunque no se dispone de documentación oficial al respecto.

El repositorio ofrece múltiples cuantizaciones (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS, f16) que permiten ejecutar el modelo en hardware de consumo, desde tarjetas con 8 GB de VRAM hasta GPUs profesionales. Es relevante para desarrolladores que buscan una alternativa local y flexible al modelo base, con la posibilidad de ajustar el equilibrio entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 460 730 096 (dato del repositorio; discrepante con el nombre "27B", probablemente un error del autor) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262 144 tokens (según especificaciones del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (se presume multilingue, con posible enfasis en japones por el sufijo "ja") |
| Licencia | no disponible (el modelo base es Apache 2.0, pero la variante puede tener otra) |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio, etc.) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención de múltiples cabezas, entrenado por Alibaba con una ventana de contexto extendida de 262 144 tokens. Incorpora la técnica de Multi-Token Prediction (MTP), que permite predecir varios tokens a la vez durante el entrenamiento y la inferencia, mejorando el rendimiento y la velocidad. La variante "heretic-ja" de OS-Software parece ser un fine-tuning o un merge orientado a eliminar restricciones de contenido y a mejorar el desempeño en japonés, aunque no se ha publicado información técnica detallada sobre el proceso de entrenamiento, el dataset utilizado o si se aplicaron técnicas como RLHF o DPO.

El repositorio de mradermacher es una cuantización estática de esos pesos, realizada con herramientas compatibles con llama.cpp. No se proporcionan detalles sobre la metodología de cuantización ni sobre la evaluación de calidad de las distintas versiones.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-27B.
- Soporte de contexto largo (hasta 262 144 tokens) para tareas que requieren memoria extensa, como análisis de documentos o conversaciones prolongadas.
- Capacidades multilingües, con posible énfasis en japonés según el sufijo "ja" del nombre.
- Modo "heretic" (sin censura) que elimina o reduce los filtros de contenido habituales, lo que permite generar respuestas sobre temas sensibles o controvertidos.
- Soporte de Multi-Token Prediction (MTP) para una generación más rápida en comparación con modelos de un solo token.
- No se dispone de información sobre tool calling, function calling, capacidades de agente o visión. Es probable que herede las capacidades del modelo base, pero no está confirmado.

## Casos de uso

- Asistencia en investigación académica: el modelo puede procesar artículos largos y resumir información técnica gracias a su ventana de contexto de 262 144 tokens, útil para revisiones bibliográficas.
- Generación de contenido creativo sin restricciones: escritores y guionistas pueden usarlo para explorar narrativas en temas tabú o adultos, aprovechando el modo "heretic".
- Traducción y localización al japonés: el sufijo "ja" sugiere un ajuste específico para este idioma, lo que lo hace adecuado para traducir documentos técnicos o literarios con mayor naturalidad.
- Chatbots de atención al cliente en entornos controlados: empresas que necesitan respuestas sin filtros predefinidos pueden desplegarlo localmente para gestionar consultas complejas, aunque deben implementar sus propios mecanismos de seguridad.
- Análisis de código y depuración: con 27B de parámetros, puede asistir en la revisión de repositorios grandes, explicar fragmentos y sugerir correcciones, especialmente si el modelo base fue entrenado con datos de código.
- Prototipado rápido de aplicaciones de IA generativa: gracias a las cuantizaciones GGUF, se puede ejecutar en una GPU de consumo (por ejemplo, RTX 3090) para pruebas de concepto sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras pruebas estándar. Se recomienda consultar las evaluaciones del modelo base Qwen3.8-27B en los canales oficiales de Alibaba para tener una referencia aproximada, aunque la variante "heretic-ja" puede presentar diferencias en tareas de razonamiento o seguridad.

## Requisitos de hardware

- La cuantización Q4_K_M ocupa aproximadamente 16,8 GB (según el repositorio), por lo que se necesita una GPU con al menos 20 GB de VRAM para inferencia con contexto estándar.
- Para la versión f16 (sin cuantizar) se requieren alrededor de 54 GB de VRAM, lo que apunta a GPUs profesionales como A100 (80 GB) o H100.
- Las cuantizaciones Q2_K (~11 GB) y Q3_K_M (~13 GB) pueden caber en GPUs de consumo con 12-16 GB de VRAM, como la RTX 4070 Ti Super o la RTX 4080.
- Con cuantizaciones ligeras (Q2_K, IQ4_XS) y contexto reducido, es posible ejecutar el modelo en una RTX 3090 (24 GB) o incluso en una RTX 4060 Ti (16 GB) con limitaciones.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (con archivo Modelfile), LM Studio, vLLM (si se convierte a formato compatible), y cualquier runtime que soporte GGUF.
- La latencia y el throughput dependen del hardware y de la cuantización. En una RTX 4090 con Q4_K_M, se pueden esperar velocidades de 20-40 tokens por segundo; en CPU (por ejemplo, un Ryzen 9 con 64 GB de RAM) la velocidad baja a 2-5 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262 144 | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, con soporte de MTP y vision encoder |
| Qwen3.8-27B-MTP-heretic-ja (este repo) | 27B (nominal) | 262 144 | no disponible | GGUF | Variante sin censura, enfocada en japones |
| Llama 3.1 8B | 8B | 128 000 | Llama 3.1 | safetensors, GGUF | Más pequeño, menor calidad en razonamiento complejo |
| Mistral Small 3.2 24B | 24B | 128 000 | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar, sin MTP |

La comparativa se basa en las especificaciones del modelo base, ya que no hay datos públicos sobre el fine-tuning de la variante "heretic-ja".

## Limitaciones y advertencias

- El número de parámetros reportado (460 730 096) es inconsistente con el nombre "27B" y probablemente sea un error del autor del repositorio. Se recomienda verificar el modelo original antes de usarlo en producción.
- La licencia no está especificada. Aunque el modelo base es Apache 2.0, la variante "heretic-ja" podría tener restricciones adicionales. No se debe asumir que es de uso libre.
- El modo "heretic" implica la ausencia de filtros de seguridad, lo que puede generar contenido ofensivo, ilegal o dañino. El responsable del despliegue debe implementar sus propias salvaguardas.
- No hay información sobre el proceso de entrenamiento de la variante, por lo que se desconocen posibles sesgos, alucinaciones o degradación en tareas específicas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad. Úsalo con precaución.
- La ventana de contexto de 262 144 tokens es teórica; en la práctica, el uso de cuantizaciones agresivas (Q2_K, Q3_K) puede degradar la calidad y reducir la longitud efectiva manejable sin errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-MTP-heretic-ja-GGUF
- Modelo original (OS-Software): https://huggingface.co/OS-Software/Qwen3.8-27B-MTP-heretic-ja
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía para ejecutar Qwen3.8 27B localmente (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía de ejecución local (lu-labs): https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
- Repositorio "Qwen 3.8 27B Uncensored" (referencia, no oficial): https://github.com/Wassimyounes01/qwen38-uncensored

# bzannah/Huihui-Qwen3.6-27B-abliterated-MTP-GGUF

## Resumen

Este modelo es una versión "abliterated" (sin censura) del modelo Qwen/Qwen3.6-27B, creada por huihui-ai y publicada bajo el nombre de usuario bzannah. La técnica de abliteration elimina las capas de rechazo del modelo original, de modo que el modelo ya no se niega a responder a ciertas peticiones consideradas sensibles o peligrosas. Se distribuye en formato GGUF, optimizado para su uso con llama.cpp, e incluye soporte para decodificación especulativa MTP (Multi-Token Prediction), que acelera la generación de texto.

El modelo base Qwen3.6-27B es un transformer multimodal (procesa imágenes y texto) con 27.320.697.856 parámetros, desarrollado por Alibaba Qwen. Esta variante abliterated conserva las capacidades del original (razonamiento, código, matemáticas, visión) pero elimina los mecanismos de rechazo, lo que la hace útil para investigación en alineación, pruebas de robustez y aplicaciones que requieren generación sin restricciones. La licencia Apache 2.0 permite uso comercial, aunque con las advertencias que se detallan más adelante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.6-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 262.144 tokens (según comando de ejemplo en la model card) |
| Tipos de cuantizacion | GGUF (incluye Q4_K; otras cuantizaciones no especificadas) |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 soporta múltiples idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una modificación de Qwen3.6-27B mediante la técnica de abliteration, implementada con la librería `remove-refusals-with-transformers`. Este método identifica y elimina las direcciones en el espacio de activaciones que provocan respuestas de rechazo, sin necesidad de reentrenamiento. El resultado es un modelo que conserva las capacidades originales pero sin los filtros de seguridad.

El modelo base Qwen3.6-27B es un transformer multimodal entrenado por Alibaba Qwen, con arquitectura de mezcla de atención y capacidad de procesamiento de imágenes y texto. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación del modelo original en la información proporcionada. Esta versión GGUF incluye soporte para MTP, una técnica de decodificación especulativa que predice múltiples tokens a la vez para reducir la latencia.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.6-27B.
- Procesamiento multimodal: acepta imágenes como entrada además de texto (pipeline `image-text-to-text`).
- Sin filtros de seguridad: el modelo no rechaza peticiones sobre temas sensibles, violencia, contenido explícito, etc.
- Soporte de decodificación especulativa MTP para acelerar la inferencia en llama.cpp.
- Capacidades de código, matemáticas y razonamiento lógico propias del modelo base.
- No se especifica soporte de tool calling ni function calling en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar el comportamiento de un modelo sin capas de rechazo, comparando respuestas con el original para entender cómo funcionan los mecanismos de seguridad.
- Pruebas de robustez ante contenido adversario: se puede usar para evaluar vulnerabilidades y sesgos en generación de texto sin restricciones.
- Generación creativa sin límites: escritura de ficción, guiones o narrativas que requieran explorar temas tabú o controvertidos sin censura automática.
- Desarrollo de chatbots de rol o entretenimiento para adultos: el modelo puede mantener conversaciones sin filtros, adecuadas para entornos controlados y con supervisión humana.
- Experimentación con decodificación especulativa: al incluir soporte MTP, es útil para probar y optimizar la latencia en servidores de inferencia con llama.cpp.
- Análisis de sesgos y comportamientos no alineados: permite identificar qué tipos de contenido generan respuestas problemáticas, útil para mejorar sistemas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es una modificación del original Qwen3.6-27B, por lo que su rendimiento en tareas estándar debería ser similar al del modelo base, pero no se proporcionan datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K, el modelo ocupa aproximadamente 14 GB (27B × 4 bits ≈ 13,5 GB más overhead). Se recomienda al menos 16-20 GB de VRAM para trabajar cómodamente.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 20 GB o más de VRAM.
- En consumer GPU: cabe en tarjetas de 24 GB como RTX 3090/4090, pero no en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, llama-mtmd-cli para multimodal), compatible con vLLM y TGI si se convierte a safetensors, aunque el formato GGUF es específico de llama.cpp.
- Latencia y throughput: no se dispone de datos concretos; el soporte MTP puede reducir la latencia entre 1,5 y 2 veces en comparación con decodificación autoregresiva estándar, según la documentación de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Sin censura |
|---|---|---|---|---|---|
| Qwen/Qwen3.6-27B (original) | 27.320.697.856 | 262.144 | Apache 2.0 | safetensors | No |
| Huihui-Qwen3.6-27B-abliterated-MTP-GGUF | 27.320.697.856 | 262.144 | Apache 2.0 | GGUF | Sí |
| Otros modelos abliterated (p.ej. Llama-3-8B-abliterated) | 8.000 millones | 8.192 | Varias | GGUF/safetensors | Sí |

La comparativa se limita a la información disponible; no se conocen otros modelos abliterated de 27B con las mismas características.

## Limitaciones y advertencias

- Contenido sensible y potencialmente ilegal: al eliminar los filtros de seguridad, el modelo puede generar discursos de odio, instrucciones peligrosas, contenido explícito o material que infrinja leyes locales. El usuario es el único responsable de su uso.
- No apto para producción: la model card recomienda explícitamente no usar este modelo en aplicaciones comerciales o públicas sin supervisión manual.
- Riesgo de alucinaciones: al ser una modificación sin reentrenamiento, las alucinaciones y errores factuales pueden ser más frecuentes que en el modelo original, especialmente en temas sensibles.
- Sesgos no mitigados: los sesgos presentes en el modelo base se mantienen e incluso pueden amplificarse al no haber filtros que los moderen.
- Dependencia de la implementación MTP: el soporte MTP requiere la última versión de llama.cpp; versiones antiguas pueden no funcionar correctamente.
- Sin garantías de seguridad: el autor (huihui.ai) declina toda responsabilidad por los daños derivados del uso de este modelo.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/bzannah/Huihui-Qwen3.6-27B-abliterated-MTP-GGUF)
- [Modelo base Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
- [Repositorio remove-refusals-with-transformers](https://github.com/Sumandora/remove-refusals-with-transformers)
- [llama.cpp (releases)](https://github.com/ggml-org/llama.cpp/releases)
- [Página de donación de huihui.ai (Ko-fi)](https://ko-fi.com/huihuiai)

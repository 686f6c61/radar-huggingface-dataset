# MuXodious/Qwen3.8-27B-absolute-heresy-GGUF

## Resumen

Qwen3.8-27B-absolute-heresy-GGUF es una versión cuantizada en formato GGUF del modelo fine-tune **Qwen3.8-27B-absolute-heresy**, desarrollado por MuXodious. Este fine-tune aplica la técnica de **abliteración** (abliteration) mediante el motor Heretic de P-E-W, con la variante Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation (SOMPOA), sobre el modelo base **Qwen3.8-27B** de Alibaba. El objetivo es eliminar los rechazos (refusals) del modelo original, manteniendo en lo posible su capacidad de razonamiento y generación. El resultado es un modelo "uncensored" que responde a prácticamente cualquier petición, con una tasa de rechazo de 2/101 en las pruebas del autor y una divergencia KL de 0.0759 respecto al original.

El modelo base Qwen3.8-27B es un transformer denso multimodal (imagen-texto) con 27.320.697.856 parámetros, una ventana de contexto de 262.000 tokens y licencia Apache 2.0. Esta versión GGUF permite su ejecución en hardware local mediante llama.cpp, Ollama u otros motores compatibles, con varias opciones de cuantización. Es relevante para desarrolladores que necesitan un modelo de gran tamaño sin restricciones de contenido, por ejemplo para generación creativa, roleplay o investigación, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen-texto) con codificador de visión |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | GGUF estático (varias opciones, no se detallan en la información disponible) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta múltiples idiomas, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con un codificador de visión integrado, diseñado para tareas de imagen-texto y texto. Su arquitectura sigue el diseño de la familia Qwen3, con atención de ventana completa y 262k de contexto. El fine-tune **absolute-heresy** no se entrena con datos adicionales, sino que se aplica una **abliteración** mediante el motor Heretic v1.4.0, que identifica y elimina direcciones en el espacio de activaciones responsables de los rechazos. La variante SOMPOA (Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation) refina este proceso para minimizar el daño al modelo. Según el autor, se probaron múltiples trials (hasta 377) y se seleccionó el trial 377 por su equilibrio entre baja tasa de rechazo (2/101) y baja divergencia KL (0.0759). No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de abliteración más allá de lo indicado.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento complejo, matemáticas y comprensión lectora.
- Procesamiento multimodal: al ser un modelo imagen-texto, puede procesar imágenes y texto combinados (no se especifican detalles en la model card, pero el pipeline_tag es image-text-to-text).
- Generación de código: el modelo base está optimizado para tareas de programación, por lo que se espera que esta capacidad se conserve.
- Tool calling y agentes: el modelo base soporta function calling y flujos agénticos, aunque no se confirma explícitamente en esta versión.
- Ausencia de rechazos: la principal característica diferencial es que responde a peticiones que el modelo original rechazaría, incluyendo contenido sensible, controvertido o explícito.
- Multilingüismo: no se especifican los idiomas soportados, pero el modelo base de Qwen3.8-27B es multilingüe.

## Casos de uso

- Generación de ficción y escritura creativa sin restricciones: el modelo puede producir narrativas con temáticas adultas, violencia o contenido controvertido que otros modelos censurarían. Es adecuado para autores que necesitan explorar tramas sin filtros automáticos.
- Roleplay y simulación de personajes: en entornos de juego o narrativa interactiva, el modelo mantiene coherencia en diálogos largos gracias a su contexto de 262k tokens, y no rechaza peticiones de rol con contenido explícito.
- Investigación en seguridad y análisis de contenido: para estudiar cómo los modelos generan texto dañino o sesgado, este modelo sirve como herramienta de prueba al no aplicar filtros de seguridad, permitiendo analizar patrones de generación sin restricciones.
- Asistencia en redacción de guiones o diálogos para medios: guionistas pueden usarlo para generar borradores de escenas con diálogos que aborden temas delicados, sin que el modelo se niegue a colaborar.
- Desarrollo de chatbots para nichos específicos: en aplicaciones donde se requiere una respuesta sin censura (por ejemplo, asistentes para adultos o comunidades con necesidades particulares), este modelo ofrece una base sin rechazos.
- Evaluación de técnicas de alineación: investigadores pueden comparar el comportamiento de este modelo abliterado frente al original para medir el impacto de la abliteración en la calidad y la seguridad.

## Benchmarks y rendimiento

La model card incluye resultados del benchmark PIQA para el trial 377 (T377) comparado con el modelo original:

| Benchmark | Metrica | T377 | Modelo original |
|---|---|---|---|
| PIQA | acc_norm | 0.8188 | 0.8161 |
| PIQA | acc_norm_stderr | 0.0090 | 0.0090 |
| PIQA | acc | 0.8118 | 0.8101 |
| PIQA | acc_stderr | 0.0091 | 0.0092 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La divergencia KL entre el modelo abliterado y el original es de 0.0759, lo que indica una alteración moderada del comportamiento.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. A partir del tamaño del modelo (27,3B parámetros) y las cuantizaciones GGUF típicas, se puede estimar:

- Para cuantización Q4_K_M: aproximadamente 16-18 GB de VRAM, ejecutable en GPUs como RTX 4090 (24 GB) o A100 40 GB.
- Para cuantización Q5_K_M: aproximadamente 19-21 GB de VRAM, adecuado para RTX 4090 o A100.
- Para cuantización Q8_0: aproximadamente 28-30 GB de VRAM, requiere GPUs de 32 GB o más (A100 40 GB, H100).
- En CPU, se puede ejecutar con llama.cpp u Ollama, pero con latencia alta (varios segundos por token) y requiere al menos 32 GB de RAM para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con conversión a formato compatible), TGI, entre otros. La latencia y el throughput dependen del hardware y la cuantización; no se dispone de datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristica principal |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3B | 262k | Apache 2.0 | Modelo base multimodal con filtros de seguridad |
| Qwen3.8-27B-absolute-heresy (este) | 27,3B | 262k | Apache 2.0 | Abliterado, sin rechazos |
| Otros modelos abliterados (p.ej. Dolphin, abliterated de Llama) | Variable | Variable | Variable | Similar enfoque de eliminación de rechazos, pero sobre otros modelos base |

No se dispone de datos de rendimiento comparativo con otros modelos abliterados en la información proporcionada. La principal diferencia frente al modelo original es la ausencia de rechazos, con una pérdida mínima en PIQA (0.27% de diferencia en acc_norm).

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido dañino, ilegal, violento o sexualmente explícito sin filtros. Su uso en producción debe considerar políticas de seguridad y responsabilidad legal.
- La abliteración no elimina los sesgos del modelo base; puede amplificar estereotipos o generar contenido discriminatorio.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados.
- La ventana de contexto de 262k tokens es amplia, pero el rendimiento puede degradarse con contextos muy largos; no se han publicado pruebas específicas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales.
- No se garantiza la calidad de las respuestas en todos los idiomas; no se especifican los idiomas soportados.
- El proceso de abliteración puede haber introducido artefactos no documentados; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy-GGUF
- Modelo base (safetensors): https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy
- Repositorio de Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía para ejecutar Qwen3.8-27B localmente (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Especificaciones y requisitos de hardware de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026

# Infinix-io/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "abliterada" (decensurada) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario Infinix-io. El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matemáticas y STEM. La versión heretic elimina los mecanismos de rechazo mediante la técnica Arbitrary-Rank Ablation (ARA) implementada en Heretic v2.0.0.dev0.

El modelo conserva las capacidades del base (razonamiento estructurado, matemáticas, STEM, tool calling, multilingüismo en seis idiomas) pero reduce drásticamente las negativas a responder: de 100/100 rechazos en el original a 3/100 en esta versión, con una divergencia KL de 0,0422 respecto al modelo de partida. Con 9.409.813.744 parámetros reales y licencia Apache 2.0, se posiciona como una opción para despliegues que requieren un modelo compacto de razonamiento sin restricciones de contenido del proveedor.

La relevancia actual radica en dos factores: por un lado, la destilación de un modelo grande (DeepSeek-V4-Pro) a la clase 9B para hacer viable el razonamiento avanzado en hardware de consumo; por otro, la aplicación de técnicas de abliteración que permiten estudiar y desplegar modelos sin capas de rechazo, algo relevante para investigación en alineación, red-teaming y aplicaciones donde el filtrado del proveedor resulta limitante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con soporte de MTP (multi-token prediction) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; se menciona evaluación con NVFP4 (vLLM) y MTP-Q8_0 (llama.cpp) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.5 con 9.400 millones de parámetros, ajustado mediante destilación desde DeepSeek-V4-Pro en modo "Max Effect". El entrenamiento combina SFT y RL (se menciona GSPO en las etiquetas) sobre aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. La model card indica que, pese a no incluir datos SFT específicos de código, se observan pequeñas mejoras en programación y uso de herramientas por transferencia entre dominios. También se reporta evaluación de despliegue mediante vLLM con NVFP4 y llama.cpp con MTP-Q8_0, lo que sugiere soporte de decodificación multi-token.

La modificación heretic aplica Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24 del modelo, con los siguientes hiperparámetros: `preserve_good_behavior_weight` = 0,8264, `steer_bad_behavior_weight` = 0,0003, `overcorrect_relative_weight` = 0,9645 y `neighbor_count` = 12. Esta ablación de rangos arbitrarios en el espacio de activaciones elimina direcciones asociadas a comportamientos de rechazo preservando en gran medida el resto de capacidades, como refleja la baja divergencia KL (0,0422) frente al original.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM, entrenado específicamente sobre ~250.000 muestras de ese dominio.
- Tool calling y function calling (etiquetas `tool-use` y `function-calling`).
- Capacidades multimodales de entrada: la etiqueta `image-text-to-text` sugiere soporte de entrada imagen+texto, aunque la model card no detalla el módulo de visión.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (etiqueta `reasoning`), con patrones de solución aprendidos por destilación.
- Sin capas de rechazo: responde a peticiones que el modelo original rechazaría (3/100 rechazos frente a 100/100).
- Compatible con endpoints (etiqueta `endpoints_compatible`) y text-generation-inference.

## Casos de uso

- Investigación en alineación y red-teaming: el modelo permite estudiar comportamientos sin las capas de rechazo del original, comparando respuestas frente al base (KL de 0,0422) para analizar qué direcciones de activación codifican la negativa a responder.
- Tutoría de matemáticas y STEM: con entrenamiento específico en ~250.000 muestras de matemáticas y ciencia, puede generar explicaciones paso a paso de problemas de cálculo, álgebra o física en entornos educativos donde se requiere razonamiento explícito.
- Generación de código asistida: aunque no recibió SFT específico de código, la transferencia entre dominios reportada permite usarlo en tareas de programación con tool calling integrado en pipelines de CI/CD o asistentes de IDE.
- Agentes multi-paso con function calling: las etiquetas de tool-use y function-calling lo habilitan para orquestar llamadas a APIs en flujos agénticos, con la ventaja de no bloquear peticiones por filtros de contenido del proveedor.
- Procesamiento documental multimodal: la etiqueta image-text-to-text permite alimentar imágenes junto a texto para tareas de extracción o descripción, útil en digitalización de documentos técnicos.
- Atención al cliente sin restricciones de filtrado: para dominios donde el modelo original rechazaría consultas legítimas (salud, legal, seguridad), esta versión mantiene la conversación sin negativas, siempre que se apliquen salvaguardas propias.
- Despliegue en hardware de consumo: con 9,4B parámetros y licencia Apache 2.0, es viable en GPUs consumer mediante cuantización (se menciona Q8_0 en llama.cpp y NVFP4 en vLLM).

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,4B parámetros, en FP16 requiere ~18,8 GB, en Q8_0 ~9,4 GB y en cuantizaciones de 4 bits ~5-6 GB (estimación por tamaño, no confirmada en la model card).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en A100, H100, L40S y RTX 4090 en FP16; en cuantización, en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: sí, en cuantización (se menciona explícitamente Q8_0 en llama.cpp), aunque el umbral exacto no se detalla.
- Opciones de despliegue: vLLM (evaluado con NVFP4), llama.cpp (evaluado con MTP-Q8_0), transformers, text-generation-inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Infinix-io/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Versión abliterada, 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | no disponible | no disponible | no disponible | Modelo base, 100/100 rechazos, KL 0 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión 4B de la misma familia heretic |

No se dispone de datos de benchmarks comparativos con otras familias (Llama, Mistral, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensurado: la eliminación de rechazos implica que puede generar contenido dañino, ilegal o inseguro; requiere filtrado y salvaguardas propias en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, especialmente fuera del dominio matemático/STEM donde fue entrenado.
- Sesgos conocidos: no documentados en la model card; la destilación desde DeepSeek-V4-Pro puede heredar sesgos del profesor.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; los idiomas soportados son seis (en, zh, ko, ja, es, ru), sin garantía de calidad equivalente en todos.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin capas de rechazo puede contravenir políticas de plataformas o normativas sectoriales.
- La evaluación de rendimiento se limita a rechazos y KL; no hay benchmarks de calidad que confirmen que la abliteración no degrada el razonamiento.
- Sin descargas ni likes en el momento de la ficha: no hay validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Proyecto Heretic: https://heretic-project.org

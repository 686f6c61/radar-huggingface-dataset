# F7GAMIZ/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino de tipo "abliterated" (decensurado) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario F7GAMIZ. El modelo base es a su vez un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con un sesgo claro hacia matematicas y razonamiento STEM. Este derivado concreto aplica la tecnica Heretic v2.0.0.dev0 (Arbitrary-Rank Ablation) para eliminar los comportamientos de rechazo del modelo original.

El modelo conserva la arquitectura Qwen3.5 (transformer denso de 9.4 mil millones de parametros) y anade capacidades multimodales de tipo image-text-to-text, segun los tags del repositorio. Su relevancia actual radica en que ofrece un modelo de razonamiento compacto, desplegable en hardware de consumo, sin las restricciones de rechazo del modelo base, lo que resulta util para investigacion sobre alineamiento, evaluacion de sesgos y aplicaciones donde el filtrado excesivo es un obstaculo.

La licencia Apache 2.0 permite uso comercial, aunque las implicaciones eticas y legales del decensurado recaen sobre el desplegador. El modelo soporta seis idiomas (ingles, chino, coreano, japones, espanol y ruso) y esta disponible en formato safetensors para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; el modelo base evaluo NVFP4 y MTP) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9.4B parametros basado en Qwen3.5-9B. El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B se entreno mediante destilacion de respuestas de DeepSeek-V4-Pro en modo "Max Effect", con un conjunto de aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. El entrenamiento incluyo SFT, RL (con GSPO segun los tags) y evaluacion de MTP (multi-token prediction) y NVFP4. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

Este derivado concreto aplica Heretic v2.0.0.dev0, una tecnica de "Arbitrary-Rank Ablation" (ARA) que modifica los pesos en las capas 9 a 24 para suprimir comportamientos de rechazo. Los parametros ARA reportados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0.8264, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 0.9645 y neighbor_count 12. Segun la model card, el resultado reduce los rechazos de 100/100 a 3/100 con una divergencia KL de 0.0422 respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas.
- Razonamiento matematico y STEM reforzado por destilacion (aproximadamente 250.000 muestras).
- Capacidades multimodales image-text-to-text (segun tags del repositorio).
- Tool calling y function calling (tags tool-use y function-calling).
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (tag reasoning) heredado del modelo base.
- Comportamiento decensurado: rechazos reducidos a 3/100 segun la model card.
- Transferencia cross-domain: mejoras menores en programacion y uso de herramientas sin SFT especifico de codigo.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de activacion afecta al comportamiento de rechazo, comparando directamente con el modelo base (100/100 rechazos frente a 3/100).
- Evaluacion de sesgos y robustez: util para red-teaming y auditorias de modelos donde se necesita un sistema que no filtre respuestas, midiendo la divergencia KL (0.0422) como metrica de deriva.
- Tutoria de matematicas y STEM: el sesgo de entrenamiento hacia problemas cientificos lo hace adecuado para generar explicaciones paso a paso en dominios tecnicos.
- Generacion de codigo asistida: aunque sin SFT especifico de codigo, la transferencia cross-domain permite su uso en pipelines de generacion y revision de codigo con tool calling.
- Procesamiento multimodal documental: con capacidades image-text-to-text, puede extraer y razonar sobre contenido de imagenes y documentos tecnicos.
- Atencion al cliente sin filtrado excesivo: para escenarios donde las politicas de rechazo del modelo base interrumpen conversaciones legitimas (soporte tecnico especializado, dominios sensibles regulados).
- Despliegue en hardware de consumo: con 9.4B parametros, es viable en GPUs consumer para prototipado e inferencia local.

## Benchmarks y rendimiento

La model card unicamente reporta metricas del proceso de decensurado, no benchmarks estandar de razonamiento:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18.8 GB solo para pesos, mas overhead de activaciones y KV cache (20-24 GB en la practica).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 9.4 GB; en 4 bits: aproximadamente 4.7-5.5 GB.
- GPU recomendadas: A100 40GB, H100, L40S para FP16; RTX 4090 (24 GB) permite FP16 justo; RTX 3090/4080 (16-24 GB) requieren cuantizacion.
- Cabe en GPU consumer con cuantizacion 4-8 bits (RTX 3060 12 GB, RTX 4070, etc.).
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (tag oficial), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| F7GAMIZ/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9.4B | no disponible | Apache 2.0 | Decensurado via Heretic ARA |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9.4B | no disponible | Apache 2.0 | Modelo original con rechazos (100/100) |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Version 4B del mismo proceso |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9.4B | no disponible | no disponible | Fine-tune cientifico sobre el mismo modelo base |

## Limitaciones y advertencias

- El decensurado elimina filtros de seguridad: el modelo puede generar contenido danino, ilegal o eticamente cuestionable sin rechazo. El desplegador asume toda la responsabilidad legal y etica.
- Riesgo elevado de alucinacion en dominios fuera de matematicas y STEM, dado el sesgo del dataset de destilacion.
- La ablacion ARA introduce una divergencia KL de 0.0422 respecto al modelo original, lo que implica degradacion potencial de capacidades no medidas.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificacion empirica.
- El soporte de espanol esta listado pero no se han publicado evaluaciones de calidad en este idioma.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensurado puede incumplir terminos de servicio de plataformas o regulaciones locales (por ejemplo, la Ley de IA de la UE).
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay validacion comunitaria de su calidad.
- No se incluyen pesos GGUF en el repo; el despliegue en llama.cpp requiere conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/F7GAMIZ/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune STEM: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org

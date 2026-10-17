# Aheronamed/mobgemma2

## Resumen
mobgemma2 es un modelo de lenguaje y visión publicado por el usuario Aheronamed en Hugging Face. Los nombres de los ficheros incluidos, `gemma-4-12B-it.Q4_K_M.gguf` y `gemma-4-12B-it.BF16-mmproj.gguf`, junto con los tags `vision-language-model` y `gemma4_unified`, indican que se trata de un ajuste fino de un modelo Gemma 4 de 12B instruido, con capacidad multimodal, convertido a formato GGUF mediante Unsloth. El repositorio declara 11.907.350.576 parámetros totales (unos 11,9B) y ocupa 7,6 GB.

El modelo resuelve la necesidad de ejecutar un sistema conversacional multimodal de roughly 12B en local mediante llama.cpp, con una cuantización Q4_K_M y un proyector multimodal BF16 separado. Su relevancia actual es limitada pero concreta: permite probar inferencia texto-imagen en hardware de consumo sin depender de APIs externas. Sin embargo, la model card es mínima: no especifica contexto, licencia, idiomas, datos de entrenamiento ni benchmarks, y el repositorio no tiene descargas ni likes, por lo que su validación independiente es prácticamente nula.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican `vision-language-model` y `gemma4_unified`; el nombre de fichero sugiere Gemma 4 12B-it) |
| Parámetros totales | 11.907.350.576 (~11,9B) |
| Parámetros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M; BF16 (proyector multimodal `mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Q4_K_M`, `BF16-mmproj`); el conteo de parámetros procede de safetensors según los metadatos |

## Arquitectura y entrenamiento
La model card no documenta la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información técnica aportada es que el modelo fue ajustado y convertido a GGUF con Unsloth, y que el entrenamiento fue "2x más rápido" con Unsloth. Los tags y los nombres de los ficheros apuntan a una variante multimodal de Gemma 4 12B-it, probablemente un transformer decoder-only con un adaptador de visión, pero esto no se confirma explícitamente en la documentación disponible.

No se describe ninguna innovación adicional como decodificación especulativa, atención lineal o mezcla de expertos. El proyector multimodal se distribuye en un fichero aparte (`BF16-mmproj.gguf`), lo que implica que para tareas de visión es necesario cargar ambos artefactos con `llama-mtmd-cli`.

## Capacidades
- Generación de texto conversacional, según el tag `conversational`.
- Procesamiento multimodal de imagen y texto, según el tag `vision-language-model` y el uso documentado con `llama-mtmd-cli`.
- Compatibilidad con llama.cpp para inferencia local.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), aunque no se detalla el protocolo exacto.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible.
- Modo de pensamiento explícito, audio u otras modalidades: no documentado.

## Casos de uso
- Asistente conversacional multimodal local: mediante `llama-mtmd-cli` se puede mantener un diálogo que combine texto e imágenes sin enviar datos a servicios en la nube, adecuado para prototipos con requisitos de privacidad.
- Descripción automática de imágenes: si el adaptador de visión funciona correctamente, el modelo puede generar descripciones de fotografías o diagramas en aplicaciones de accesibilidad o catalogación.
- Respuesta a preguntas visuales (VQA): útil para experimentos de investigación que necesiten un modelo de aproximadamente 12B ejecutable en una GPU de gama alta consumer.
- Chat de texto puro: con `llama-cli -hf Aheronamed/mobgemma2 --jinja` se puede usar como modelo conversacional sin componente visual.
- Evaluación comparativa de fine-tunes de Gemma 4 12B: investigadores pueden medir el efecto de este ajuste frente al modelo base nominal, siempre que la licencia lo permita.
- Despliegue en estaciones de trabajo con GPU de 12-16 GB: la cuantización Q4_K_M reduce el espacio necesario para pesos y permite inferencia local en hardware asequible.
- Integración en pipelines llama.cpp: el tag `endpoints_compatible` sugiere su uso como servicio local de inferencia, aunque no se especifica la interfaz exacta.
- Ajuste posterior con Unsloth: el modelo ya ha sido tratado con esta herramienta, por lo que sería candidato para nuevos fine-tunes, sujeto a la licencia no disponible.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, VQA u otras evaluaciones, ni comparaciones con modelos similares. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware
- VRAM estimada para Q4_K_M: alrededor de 7-9 GB solo para los pesos; con contexto y el proyector multimodal, aproximadamente 9-12 GB (estimación a partir de 11,9B parámetros).
- VRAM estimada para BF16: alrededor de 24 GB solo para los pesos; con overhead de contexto y proyector, más de 28 GB (estimación).
- GPU recomendadas para Q4_K_M: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB, A100 40 GB, H100.
- GPU recomendadas para BF16: A100 40/80 GB, H100 80 GB; no cabe con comodidad en GPUs consumer de 24 GB.
- ¿Cabe en GPU consumer? La versión Q4_K_M sí, en tarjetas de 12 GB o más. La versión BF16 no.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`) y herramientas compatibles con GGUF. Ollama, vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mobgemma2 | ~11,9B | no disponible | no disponible | GGUF | Fine-tune multimodal con 0 descargas y 0 likes |
| Gemma 4 12B-it (nominal) | ~12B (inferido) | no disponible | no disponible | no disponible | Modelo base inferido por el nombre de fichero; sin datos oficiales en la información proporcionada |
| EmbeddingGemma 2 | <1B | no disponible | Apache 2.0 | no disponible | Modelo de embeddings multimodal, no generativo; no comparable directamente |
| MedGemma | no disponible | no disponible | no disponible | no disponible | Orientado a dominio médico; categoría distinta |

No se dispone de resultados comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Licencia no disponible: existe incertidumbre sobre el uso comercial y la redistribución.
- Sin benchmarks publicados: se desconoce su calidad real en texto, visión, razonamiento o código.
- Sin datos de entrenamiento: no se pueden evaluar sesgos heredados, composición del dataset ni posibles filtraciones.
- Riesgo de alucinación estándar en modelos generativos, no mitigado ni documentado.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide planificar aplicaciones con requisitos concretos.
- La capacidad multimodal no está validada con ejemplos ni métricas; el adaptador `mmproj` podría no funcionar correctamente.
- El repositorio tiene 0 descargas y 0 likes, y las fechas de creación y actualización son de 2026, lo que sugiere un registro cuando menos inusual o poco maduro.
- La cuantización Q4_K_M puede degradar la calidad respecto a BF16.
- No se confirma soporte de tool calling, agentes o razonamiento multi-paso.
- Para visión es necesario gestionar dos ficheros GGUF distintos, lo que añade complejidad de despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/Aheronamed/mobgemma2
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- EmbeddingGemma 2: The Developer Guide: https://developers.googleblog.com/embeddinggemma-2-the-developer-guide/
- Smaller, Safer, More Transparent: Advancing Responsible AI with Gemma: https://developers.googleblog.com/en/smaller-safer-more-transparent-advancing-responsible-ai-with-gemma/
- Gemma Model Family: https://gemma.ai/models/
- MedGemma en GitHub: https://github.com/aicoreml/MedGemma
- Google models en Gemini Enterprise Agent Platform: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/google-models

# reaperdoesntknow/Qwen3.5-4B-Opus-Distil

## Resumen

Qwen3.5-4B-Opus-Distil es un modelo derivado de la familia Qwen3.5, publicado por el usuario reaperdoesntknow en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3.5 de 4B parámetros, posteriormente convertido a formato GGUF mediante la herramienta Unsloth. El nombre sugiere una destilación orientada a replicar el comportamiento de un modelo de la familia Opus, aunque la model card no documenta el proceso de destilación ni el dataset empleado.

El modelo se distribuye principalmente en cuantización Q4_K_M para inferencia con llama.cpp, junto con un proyector multimodal en BF16 (mmproj), lo que indica que conserva capacidades de visión-lenguaje. Con 4.205.751.296 parámetros totales y un repositorio de 3,4 GB, está pensado para ejecutarse en hardware de consumo.

Su relevancia actual radica en la posibilidad de desplegar un modelo conversacional multimodal de 4B parámetros en local mediante llama.cpp, con soporte para plantillas Jinja y tool calling a través de la CLI. No obstante, la documentación pública es mínima y no se detallan datos de entrenamiento, licencia ni idiomas soportados, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, vision-language model) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), BF16 (proyector multimodal mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 en su variante de 4B parámetros, un transformer denso con capacidades de visión-lenguaje, tal como evidencia la presencia del fichero `BF16-mmproj.gguf` que acompaña al modelo de lenguaje. La conversión a GGUF se realizó con Unsloth, que según la model card permitió un entrenamiento "2x más rápido", aunque no se especifica el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

No se documenta el proceso de destilación implícito en el nombre "Opus-Distil": no hay información sobre el modelo profesor, la función de pérdida empleada ni el volumen de datos sintéticos generados. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La única información operativa es la integración con llama.cpp mediante las CLI `llama-cli` y `llama-mtmd-cli` con el flag `--jinja`.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Procesamiento multimodal de imágenes gracias al proyector mmproj en BF16.
- Soporte de plantillas Jinja para formateo de chat (`--jinja`).
- Compatibilidad con llama.cpp, lo que habilita tool calling y function calling en la medida en que la plantilla del modelo lo contemple.
- Capacidad potencial de razonamiento multi-paso y uso como agente, aunque no documentada explícitamente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un portátil con GPU de consumo mediante llama.cpp en cuantización Q4_K_M, ofreciendo respuestas multi-turno sin depender de la nube.
- Análisis de imágenes en local: gracias al proyector mmproj, permite describir, clasificar o extraer información de imágenes en entornos sin conectividad, útil para aplicaciones de accesibilidad o inspección visual básica.
- Prototipado de agentes con tool calling: la compatibilidad con plantillas Jinja en llama.cpp permite integrar el modelo en flujos de function calling para tareas como consulta de APIs o automatización de tareas.
- Educación y experimentación: su tamaño de 4B parámetros lo hace adecuado para laboratorios docentes donde se enseña fine-tuning, cuantización GGUF y despliegue con llama.cpp.
- Generación de texto asistida en editores: integrable en plugins de escritura o resumen que requieran baja latencia y ejecución local.
- Chatbot de soporte en dispositivos edge: al caber en GPUs de gama media, puede embeberse en aplicaciones de escritorio o servidores pequeños para atención al cliente básica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en cuantización Q4_K_M (el fichero GGUF ocupa una fracción de los 3,4 GB del repo, que incluye también el mmproj en BF16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM para la variante Q4_K_M; el proyector multimodal añade aproximadamente 1 GB adicional.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (mediante importación del GGUF), y potencialmente vLLM si se convierte a safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Multimodal |
|---|---|---|---|---|---|
| Qwen3.5-4B-Opus-Distil | 4,2B | no disponible | no disponible | GGUF | Sí (mmproj) |
| Qwen2.5-VL-3B | 3,75B | 32K (típico) | Apache 2.0 | safetensors, GGUF | Sí |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 Community | safetensors, GGUF | No (variante 11B sí) |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms | safetensors, GGUF | No |

La comparativa se ofrece a título orientativo; los datos de los modelos alternativos provienen de sus respectivas documentaciones públicas y no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- No se documentan los datos de entrenamiento ni el proceso de destilación, lo que dificulta evaluar sesgos, calidad y robustez.
- Riesgo de alucinación inherente a modelos de 4B parámetros, especialmente en tareas de razonamiento complejo o matemáticas.
- Idiomas soportados no confirmados; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; podría ser insuficiente para tareas de contexto largo.
- El modelo es un ajuste comunitario sin revisión por pares ni benchmarks publicados; su calidad es incierta frente al Qwen3.5 base.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo original en BF16.
- Solo 2 likes y 3163 descargas en el momento de la consulta: comunidad pequeña, soporte limitado.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-4B-Opus-Distil
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp

# Rin247/gemma-4-12B-it-Uncensored-Aquarion-FP8

## Resumen

Este modelo es una cuantización FP8 weight-only en formato safetensors del modelo `gemma-4-12B-it`, publicado por el usuario Rin247 en Hugging Face. Se trata de una versión «uncensored» (abliterada) del modelo base, obtenida mediante proyección ortogonal de la dirección de rechazo antes de la cuantización, como parte del conjunto de herramientas «Genesis of Aquarion». El modelo base, `gemma-4-12B-it`, es una variante sin encoder de la arquitectura Gemma4Unified de Google, lanzada en junio de 2026, con aproximadamente 12 mil millones de parámetros.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada que reduce los requisitos de memoria frente al modelo original en FP16, manteniendo la capacidad de respuesta sin filtros de seguridad. Sin embargo, al tratarse de una versión abliterada, elimina los mecanismos de rechazo de contenido dañino, lo que implica riesgos importantes para su uso en entornos de producción. La cuantización FP8 weight-only se realizó mediante RTN (round-to-nearest) en CPU, con escalas almacenadas junto a los pesos, lo que requiere un proceso de dequantización específico antes de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (decoder-only, sin encoder) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica si es MoE; probablemente denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 weight-only (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantizacion FP8 (escalas y formas almacenadas como buffers adicionales) |

## Arquitectura y entrenamiento

El modelo base `gemma-4-12B-it` emplea la arquitectura Gemma4Unified, un diseño sin encoder (encoder-free) orientado a tareas de generación de texto y razonamiento. Según las notas de otros repositorios similares, el rechazo (refusal) se concentra en las capas superiores del decodificador (capas 15 a 47), por lo que la ablación se aplica únicamente al 70% superior de las capas para evitar distorsiones en las capas tempranas con baja relación señal-ruido. El proceso de ablación se realizó mediante proyección ortogonal de la dirección de rechazo, una técnica que elimina la tendencia del modelo a negarse a responder sin alterar significativamente el resto de sus capacidades.

La cuantización FP8 se realizó con PyTorch RTN en CPU, almacenando las escalas junto a los pesos en el archivo `model.safetensors`. El `config.json` incluye la configuración de cuantización (`quantization_config`). No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO, ya que estos datos corresponden al modelo base original y no se detallan en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento: al ser una variante del modelo Gemma 4 12B, conserva las capacidades generales de generación de lenguaje del modelo base, aunque no se especifican detalles concretos.
- Respuesta sin restricciones de contenido: la ablación elimina los mecanismos de rechazo, por lo que el modelo responde a instrucciones que el modelo base declinaría, incluyendo contenido potencialmente dañino.
- Soporte de tool calling, function calling y agentes: no se menciona explícitamente en la información disponible; se desconoce si la ablación afecta a estas capacidades.
- Capacidades multilingües: no se dispone de datos sobre los idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no se indica ninguna; el modelo base Gemma4Unified podría incluir soporte multimodal, pero no se confirma en la documentación de este repositorio.

## Casos de uso

- Investigación sobre alineación y seguridad en LLMs: permite estudiar el comportamiento de un modelo sin capas de rechazo, útil para analizar cómo la ablación afecta a la utilidad y al riesgo.
- Generación de contenido creativo sin restricciones: para proyectos artísticos o narrativos donde se requiere explorar temas tabú sin filtros automáticos, siempre que se asuman los riesgos legales y éticos.
- Pruebas de robustez y adversariales: evaluar cómo responde el modelo a prompts que el modelo base rechazaría, para diseñar mejores sistemas de moderación.
- Fine-tuning posterior: la versión FP8 puede servir como punto de partida para ajustes adicionales en tareas específicas, aunque la dequantización es necesaria antes de cualquier entrenamiento.
- Despliegue en entornos con memoria limitada: la cuantización FP8 reduce el uso de VRAM frente a FP16, permitiendo ejecutar el modelo en GPUs de gama media o alta con 16 GB o más.
- Benchmarking de técnicas de cuantización: comparar el rendimiento de FP8 weight-only frente a otras cuantizaciones (GGUF, MXFP4) en tareas estándar de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado. Tampoco se comparan resultados con el modelo base o con otras versiones uncensored.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12B parámetros en FP8 (1 byte por parámetro), el peso ocupa aproximadamente 12 GB. Considerando overhead de activaciones y buffers, se estima un mínimo de 14-16 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM, como RTX 4090, RTX 4080, A100 40GB, L4, o GPUs de datacenter con soporte FP8 nativo (H100, A100). En GPUs sin soporte FP8, el modelo puede ejecutarse con emulación, pero con menor rendimiento.
- Compatibilidad con consumer GPU: sí, en GPUs de 16 GB o más (por ejemplo, RTX 4090) siempre que el motor de inferencia soporte la dequantización personalizada.
- Opciones de despliegue: la model card indica que se requiere un proceso de dequantización con los buffers `*.weight_scale` y `*.weight_shape` antes de la inferencia. Esto impide el uso directo con vLLM, llama.cpp u Ollama sin adaptaciones personalizadas. Se podría usar PyTorch con un script de carga customizado, o convertir los pesos a un formato estándar (FP16 o GGUF) antes del despliegue.
- Latencia y throughput: no se dispone de datos medidos. En FP8 weight-only, la latencia suele ser menor que en FP16 por la reducción de memoria, pero depende del hardware y del motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/gemma-4-12B-it-Uncensored-Aquarion-FP8 | ~12B | no disponible | FP8 weight-only safetensors | no disponible | Hugging Face |
| Ishowbackup/gemma-4-12B-it-uncensored | ~12B | no disponible | no especificada (probablemente FP16 o BF16) | no disponible | Hugging Face |
| lemuralabs/Gemma-4-12B-uncensored-mxfp4-mlx | ~12B | no disponible | MXFP4 (para MLX) | no disponible | Hugging Face |
| gemma-4-12B-it (base) | ~12B | no disponible | FP16/BF16 original | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia radica en el formato de cuantización y en el método de ablación, aunque todos comparten la misma base Gemma 4 12B.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión uncensored, el modelo puede reflejar y amplificar sesgos dañinos presentes en los datos de entrenamiento, sin el filtrado que aplicaría el modelo base.
- Riesgo de alucinación: la ablación no corrige la tendencia a generar información falsa o inventada; el riesgo de alucinación es similar al del modelo base, pero sin las advertencias de seguridad.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y los idiomas cubiertos; no hay garantía de funcionamiento correcto fuera de los idiomas principales del modelo base.
- Restricciones de licencia: la licencia no está especificada en el repositorio. Esto impide determinar si es legal su uso comercial o su redistribución. Se recomienda contactar al autor antes de cualquier uso productivo.
- Riesgo de contenido dañino: al eliminar el rechazo, el modelo puede generar instrucciones peligrosas, contenido ilegal o violento. No debe desplegarse en servicios públicos sin moderación adicional.
- Compatibilidad de despliegue: la cuantización FP8 requiere buffers de escala y forma personalizados; los motores de inferencia estándar (vLLM, llama.cpp) no la soportan directamente, lo que complica su uso práctico.
- Calidad de la cuantización: la conversión FP8 mediante RTN puede introducir pérdida de precisión en tareas de razonamiento complejo, aunque no se han medido los efectos en este modelo concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rin247/gemma-4-12B-it-Uncensored-Aquarion-FP8
- Versión uncensored de Ishowbackup: https://huggingface.co/Ishowbackup/gemma-4-12B-it-uncensored
- Versión MXFP4 para MLX de lemuralabs: https://huggingface.co/lemuralabs/Gemma-4-12B-uncensored-mxfp4-mlx
- Artículo sobre merge GGUF para AMD ROCM: https://uncensoredhub.ai/news/2026-07-02-gemma-4-12b-uncensored-merge-optimized-for-amd-rocm-drops-on-huggingface
- Ficha de la versión uncensored en FriendliAI: https://friendli.ai/models/TrevorJS/gemma-4-12B-it-uncensored
- Ficha de la versión NVFP4 en ThinkLLM: https://thinkllm.dev/models/gemma-4-12b-it-uncensored-heretic-nvfp4

# aramkris/tinystories-arm-124m-chat-sft

## Resumen

tinystories-arm 124M chat (SFT) es un modelo de lenguaje de tipo GPT entrenado desde cero por el desarrollador independiente aramkris, y publicado como versión conversacional del modelo base tinystories-arm 124m base. Se trata de un modelo de 124 millones de parámetros ajustado mediante supervisión (SFT) sobre 409.000 conversaciones del conjunto smol-smoltalk, con cálculo de pérdida únicamente sobre las palabras del asistente. El entrenamiento requirió 11.284 actualizaciones y 19 minutos en una GPU A100 de Google Colab, lo que da una idea de su escala deliberadamente mínima.

El modelo responde en un formato de texto plano `User: …` / `Assistant: …`, sin tokens especiales, y cierra sus respuestas con el token `<|endoftext|>`. No emplea plantillas de chat propietarias ni herramientas de tokenización adicionales: usa la codificación GPT-2 de tiktoken. Su relevancia es fundamentalmente educativa y experimental: sirve como banco de pruebas reproducible para estudiar el efecto del ajuste por instrucciones y del DPO en modelos muy pequeños, no como un asistente de producción.

La model card es explícita sobre sus límites: el modelo "responde con la forma correcta pero con el conocimiento del modelo base: verosímil y a menudo erróneo en los hechos". La puntuación media en cinco benchmarks cae de 42,3 en el modelo base a 38,5 tras el SFT, lo que cuantifica el coste del ajuste por instrucciones en esta escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT (transformer decoder-only) entrenado desde cero |
| Parámetros totales | 124M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en PyTorch, `best_model_params.pt`) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), configuración en `model_config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT con 124 millones de parámetros, entrenado desde cero dentro del proyecto tinystories-ARM-model. El ajuste supervisado (SFT) se realizó sobre 409.000 conversaciones del dataset HuggingFaceTB/smol-smoltalk, con la particularidad de que la función de pérdida se calcula solo sobre los tokens generados por el asistente, no sobre los del usuario. El proceso completo constó de 11.284 actualizaciones y se ejecutó en 19 minutos sobre una A100 de Colab.

El modelo base se entrenó con una mezcla de datasets que incluye BaoMinhTran/mini-fineweb-edu y HuggingFaceTB/cosmopedia, según los metadatos del repositorio. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO en esta variante (existe una variante DPO separada, tinystories-arm-124m-chat-dpo). Tampoco se detalla la innovación arquitectónica concreta que justifica el sufijo "ARM" del proyecto; la información disponible no permite confirmar si se trata de una variante de atención o de una convención de nombres del autor.

## Capacidades

- Generación de texto conversacional en formato `User: …` / `Assistant: …` sin tokens especiales.
- Respuesta a preguntas simples en inglés, con cierre explícito mediante `<|endoftext|>`.
- Capacidad de mantener un turno de conversación con estructura de diálogo aprendida por imitación.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés; no se declaran otros idiomas.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Conocimiento factual limitado al del modelo base, con alta tasa de error en hechos.

## Casos de uso

- Investigación educativa sobre ajuste por instrucciones: el modelo permite reproducir en minutos el pipeline completo de SFT sobre un corpus pequeño y medir el coste en rendimiento respecto al modelo base, gracias a su tamaño de 124M y a su entrenamiento en una sola A100.
- Experimentación con formatos de chat sin tokens especiales: útil para estudiar cómo afecta el formato `User:` / `Assistant:` al comportamiento del modelo frente a plantillas con tokens dedicados.
- Comparación SFT frente a DPO: junto con la variante DPO del mismo autor, permite analizar empíricamente la reducción de repeticiones (12,4% de 4-gramas repetidos en SFT frente a 6,5% en DPO) manteniendo un rendimiento similar en benchmarks.
- Generación de texto creativo de dominio acotado: adecuado para prototipos de historias cortas o diálogos sintéticos donde la veracidad factual no es crítica y se prioriza la latencia y el coste mínimo.
- Docencia y demostraciones de inferencia local: con 124M de parámetros y pesos en PyTorch, se puede cargar en CPU para clases o talleres sobre funcionamiento interno de un GPT.
- Pruebas de infraestructura de despliegue: sirve como modelo de juguete para validar pipelines de carga, tokenización con tiktoken y evaluación antes de escalar a modelos mayores.
- Estudio de alucinación en modelos pequeños: su comportamiento "verosímil pero a menudo erróneo" lo convierte en un caso controlado para medir la relación entre tamaño y fidelidad factual.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 100 preguntas reservadas con decodificación greedy:

| Modelo | Pérdida en respuestas de referencia | 4-gramas repetidos | Respuestas que terminan | Media en benchmarks |
|---|---|---|---|---|
| Este modelo (SFT) | 1,156 | 12,4% | 70% | 38,5 |
| SFT + DPO | 1,196 | 6,5% | 86% | 38,4 |
| Modelo base | no disponible | no disponible | no disponible | 42,3 |

No se detalla en la información disponible qué cinco benchmarks componen la media ni los resultados individuales por benchmark (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa para 124M de parámetros; el repositorio ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizó en una A100 de Colab, pero la inferencia no requiere hardware de datacenter.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) y también en CPU, como demuestra el ejemplo de la model card que carga el modelo con `"cpu"`.
- Opciones de despliegue: el proyecto oficial proporciona `infra.model_store` para descargar pesos e `inference.load_model` / `sft.answer` para inferencia en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el tiempo de entrenamiento de 19 minutos en A100 sugiere una inferencia muy rápida, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinystories-arm 124M chat (SFT) | 124M | no disponible | MIT | PyTorch | Ajustado sobre smol-smoltalk; media de 38,5 en cinco benchmarks |
| tinystories-arm 124M chat (DPO) | 124M | no disponible | MIT | PyTorch | Misma base con DPO; menos repetición (6,5%) y más cierres correctos (86%) |
| tinystories-arm 124M base | 124M | no disponible | MIT | PyTorch | Sin ajuste por instrucciones; media de 42,3 en los mismos benchmarks |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento factual muy limitado: el propio autor advierte que las respuestas son "verosímiles y a menudo erróneas en los hechos", heredadas del modelo base.
- Alta tasa de repetición: el 12,4% de 4-gramas repetidos en la variante SFT indica tendencia a la redundancia.
- Solo el 70% de las respuestas termina correctamente con `<|endoftext|>`; el 30% restante puede quedar truncado o sin cierre.
- El ajuste por instrucciones degrada el rendimiento en benchmarks: de 42,3 a 38,5 de media, una pérdida de unos 4 puntos.
- Idiomas: únicamente inglés; no se declara soporte multilingüe.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas sin verificación previa.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para producción por su fiabilidad factual y su tasa de truncamiento.
- Formato de pesos exclusivamente PyTorch (`.pt`), sin versiones GGUF ni safetensors publicadas, lo que limita su integración en ecosistemas de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/tinystories-arm-124m-chat-sft
- Modelo base: https://huggingface.co/aramkris/tinystories-arm-124m-base
- Variante DPO: https://huggingface.co/aramkris/tinystories-arm-124m-chat-dpo
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Dataset mini-fineweb-edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk

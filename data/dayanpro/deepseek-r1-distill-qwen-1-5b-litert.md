# dayanpro/DeepSeek-R1-Distill-Qwen-1.5B-LiteRT

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-LiteRT es una conversión del modelo de razonamiento [deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B) al formato **LiteRT-LM** (`.litertlm`), desarrollado por el usuario dayanpro para inferencia on-device con el runtime de Google [LiteRT-LM](https://github.com/google-ai-edge/litert-lm). El modelo original es una destilación de DeepSeek-R1 sobre la arquitectura Qwen2.5 de 1.5B parámetros, diseñado para emitir una cadena de razonamiento (` thinking …  response`) antes de la respuesta final.

La relevancia de esta conversión radica en que empaqueta un modelo de razonamiento de tipo R1 en un fichero de aproximadamente 1 GB con cuantización int4 blockwise, capaz de ejecutarse en teléfonos con 8 GB de RAM a unos 116 tokens por segundo en GPU Metal de Mac. Resuelve el problema de llevar razonamiento de nivel DeepSeek a dispositivos de borde sin conexión, manteniendo una licencia MIT que permite uso comercial y derivados.

El modelo conserva la ventana de contexto de 4096 tokens del original y se distribuye exclusivamente en formato `.litertlm`, con pesos cuantizados a int4 (block 32 + OCTAV) y embeddings en INT8. Es una opción práctica para desarrolladores que quieran integrar razonamiento en apps Android o iOS mediante el runtime oficial de Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer denso) |
| Parametros totales | 1.5B (base DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 (KV cache) |
| Tipos de cuantizacion | int4 blockwise (block 32) + OCTAV, simetrico; embedding INT8 |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingue, pero la model card no especifica) |
| Licencia | MIT (pesos); base Qwen2.5 bajo Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es una destilación del modelo DeepSeek-R1 (entrenado con aprendizaje por refuerzo) sobre la arquitectura Qwen2.5 de 1.5B parámetros. La conversión se realizó con la herramienta oficial `litert-torch` de Google (`export_hf`), sin forks ni código personalizado, sobre `Qwen2ForCausalLM`.

La cuantización aplicada es int4 blockwise con tamaño de bloque 32 y recorte óptimo OCTAV (optimal clipping), simétrica, con embeddings en INT8 y cómputo íntegramente en enteros. El modelo conserva la plantilla de prompt de DeepSeek (`<｜User｜>` / `<｜Assistant｜>`, token de parada `cot`) y el comportamiento de razonamiento con bloque ` thinking`. No se dispone de información sobre el dataset de entrenamiento de la destilación original ni sobre el proceso de conversión más allá de lo indicado en la model card.

## Capacidades

- Razonamiento con cadena de pensamiento: emite un bloque ` thinking` antes de la respuesta, preservado tras la cuantización int4.
- Generación de texto autoregresiva con plantilla de prompt de DeepSeek incluida en el bundle.
- Inferencia on-device en Android e iOS mediante el runtime LiteRT-LM y la app Google AI Edge Gallery.
- Servidor local compatible con la API de OpenAI a través del CLI de LiteRT-LM (`litert-lm serve`).
- Ejecución en CPU o GPU (Metal en Mac, GPU en Android) con cómputo en enteros.
- Capacidades multilingües: no especificadas en la model card; el modelo base Qwen2.5 es multilingüe, pero esta conversión no documenta idiomas concretos.
- No se documenta soporte de tool calling, function calling ni capacidades multimodales.

## Casos de uso

- Asistente de razonamiento en movil sin conexion: el modelo cabe en ~1 GB y se ejecuta en telefonos con 8 GB de RAM, permitiendo consultas de logica y matematicas sin conexion a internet ni envio de datos a servidores.
- Chat local con privacidad: al ejecutarse integramente en el dispositivo, es adecuado para aplicaciones que manejan datos sensibles donde no se permite el envio de prompts a APIs externas.
- Servidor local OpenAI-compatible para desarrollo: con `litert-lm serve` se levanta un endpoint local compatible con la API de OpenAI, util para prototipar aplicaciones de agentes o chatbots en entornos de desarrollo sin coste de inferencia.
- Herramienta educativa de razonamiento matematico: con un 73% en GSM8K (int4), puede usarse en apps educativas para resolver problemas aritmeticos paso a paso y explicar el razonamiento.
- Automatizacion de tareas de razonamiento en entornos con recursos limitados: ideal para edge computing en dispositivos embebidos o portatiles donde no cabe un modelo de 7B o superior.
- Prototipado rapido de apps Android con LiteRT-LM: la app Google AI Edge Gallery permite importar el modelo directamente desde Hugging Face y probarlo en CPU o GPU sin necesidad de escribir codigo, acelerando la validacion de conceptos.
- Despliegue en escritorio multiplataforma: el mismo bundle `.litertlm` se ejecuta en macOS, Linux y Windows con el CLI oficial, incluyendo chat interactivo en terminal.

## Benchmarks y rendimiento

La model card publica un unico benchmark, GSM8K, medido con n=100, greedy, 0-shot y `max_new_tokens=2048`, comparando la version cuantizada con la referencia bf16:

| Configuracion | GSM8K |
|---|---|
| bf16 (referencia) | 81.0% |
| LiteRT int4 (BOCTAV4, este modelo) | 73.0% |

La perdida de 8 puntos porcentuales frente a bf16 se atribuye a la sensibilidad de los modelos pequenos a la cuantizacion 4-bit: un modelo de 1.5B tiene menos redundancia que el hermano de 7B, que mantiene una paridad de -1 punto. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Tamano del fichero: ~1.0 GB (`model.litertlm`); el repositorio completo ocupa 3.3 GB.
- RAM minima: 8 GB en telefonos (iPhone y Android).
- GPU recomendadas: Metal GPU en Mac M-series (velocidad medida de ~116 tok/s en decodificacion greedy); GPU integrada en Android via LiteRT-LM.
- Tambien ejecuta en CPU en dispositivos Android y en escritorio (macOS, Linux, Windows).
- Opciones de despliegue: runtime LiteRT-LM (Kotlin API `com.google.ai.edge.litertlm:litertlm-android`), CLI `litert-lm` con chat interactivo y servidor OpenAI-compatible, y app Google AI Edge Gallery v1.0.16+ para importacion directa desde Hugging Face.
- No se documentan requisitos de VRAM especificos ni latencia/throughput en servidores; el modelo esta orientado a inferencia local en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|
| **Este modelo (LiteRT int4)** | 1.5B | 4096 | int4 blockwise + OCTAV | 73.0% | MIT | `.litertlm` |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (original) | 1.5B | 4096 (32K en el original, limitado a 4096 en esta conversion) | bf16 | 81.0% | MIT | safetensors |
| DeepSeek-R1-Distill-Qwen-7B (hermano mayor) | 7B | 32K | bf16 | No disponible en la model card; paridad -1 pt vs bf16 en int4 | MIT | safetensors |

La comparativa se limita a la familia DeepSeek-R1-Distill, ya que la model card no referencia alternativas de otros fabricantes. La diferencia clave frente al original es el formato de pesos (`.litertlm` frente a safetensors) y la cuantizacion int4, que reduce el tamano de ~3.3 GB a ~1 GB a costa de 8 puntos en GSM8K. El hermano de 7B ofrece mejor paridad tras cuantizacion pero requiere mas recursos, por lo que no es viable en telefonos de 8 GB.

## Limitaciones y advertencias

- Perdida de rendimiento por cuantizacion: 8 puntos porcentuales en GSM8K frente a la referencia bf16 (73% vs 81%), atribuible a la sensibilidad de los modelos de 1.5B a la cuantizacion int4.
- Contexto limitado a 4096 tokens, inferior a los 32K del modelo original DeepSeek-R1-Distill-Qwen-1.5B; no apto para tareas que requieran ventanas largas.
- Riesgo de alucinacion y errores de razonamiento inherente a un modelo de 1.5B; no recomendado para decisiones criticas sin validacion humana.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado en esta conversion.
- Dependencia del ecosistema LiteRT-LM: el formato `.litertlm` no es compatible con runtimes estandar como vLLM, llama.cpp u Ollama, lo que limita su uso a la pila de Google.
- La velocidad de ~116 tok/s se midio en Mac M-series con GPU Metal; el rendimiento en telefonos Android puede variar significativamente segun el hardware.
- El benchmark GSM8K se realizo con n=100 (muestra pequena) y puede no ser representativo del rendimiento general.
- Aunque la licencia MIT permite uso comercial, el modelo base Qwen2.5 es Apache-2.0; verificar el cumplimiento de ambas licencias en productos derivados.

## Enlaces

- [Repositorio HuggingFace: dayanpro/DeepSeek-R1-Distill-Qwen-1.5B-LiteRT](https://huggingface.co/dayanpro/DeepSeek-R1-Distill-Qwen-1.5B-LiteRT)
- [Modelo base: deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Runtime LiteRT-LM (GitHub)](https://github.com/google-ai-edge/litert-lm)
- [Herramienta de conversion litert-torch (GitHub)](https://github.com/google-ai-edge/litert)
- [App Google AI Edge Gallery (GitHub)](https://github.com/google-ai-edge/gallery)
- [Documentacion de modelos destilados de DeepSeek-R1 (DeepWiki)](https://deepwiki.com/deepseek-ai/DeepSeek-R1/2.3-distilled-models)

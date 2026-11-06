# JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3

## Resumen

CIRF-Qwen3-8B-Instruct-Backward-Greedy-3 es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el usuario JhCIFT bajo el paraguas del proyecto CIRF (siglas no desarrolladas en la model card). El modelo introduce un vocabulario de 514 tokens funcionales nuevos (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`) que el modelo emite como traza intermedia de razonamiento antes de la respuesta final, en lugar de la cadena de pensamiento en lenguaje natural que emplea Qwen3 originalmente.

La variante "Backward-Greedy-3" se obtiene tras un proceso de seleccion de resultados con un presupuesto maximo de 3 tokens de resultado explicito por ejemplo de entrenamiento, partiendo del modelo "Full". El adaptador LoRA esta fusionado en los pesos densos en BF16 y las filas de embedding y salida de los tokens nuevos estan incluidas, por lo que el modelo se carga con Transformers estandar sin necesidad de PEFT ni del codigo CIRF.

Con 8.192.758.784 parametros (8,19 mil millones) y licencia Apache 2.0, es un modelo de investigacion sobre razonamiento estructurado con tokens funcionales. Su relevancia es experimental: explora si un espacio discreto de tokens funcionales puede sustituir a la cadena de pensamiento textual. Las cifras publicadas son mixtas (97,75% en MultiArith, 41,39% en GSM8K), lo que sugiere que el enfoque aun no iguala al modelo base en tareas aritmeticas complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) con vocabulario extendido de tokens funcionales |
| Parametros totales | 8.192.758.784 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8,19 mil millones de parametros. La modificacion principal es la extension del vocabulario con 514 tokens: `[sof]` (start of function), `[eof]` (end of function) y 512 tokens funcionales `[f_0]` a `[f_511]`. El modelo genera una traza de tokens funcionales, opcionalmente con valores de resultado intermedios, seguida de `[eof]` y la respuesta final. El formato de prompt es `QUESTION[sof]`, sin plantilla de chat.

El entrenamiento consistio en un ajuste supervisado con LoRA posteriormente fusionado en los pesos densos, incluyendo las filas de embedding y de salida de los tokens nuevos. La variante "Backward-Greedy-3" se obtiene tras un proceso de seleccion de resultados con presupuesto maximo de 3 tokens de resultado explicito por ejemplo, partiendo del modelo "Full". La model card referencia los ficheros `training_config.json`, `provenance.json` y `export_verification.json` con los ajustes de entrenamiento y hashes de los checkpoints de origen, pero no se detalla en el texto el volumen de tokens de entrenamiento ni la composicion del dataset. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento estructurado mediante trazas de tokens funcionales discretos.
- Razonamiento aritmetico y de sentido comun (evaluado en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip).
- Resolucion de problemas con presupuesto acotado de tokens funcionales (hasta 32 en la evaluacion, forzando `[eof]` al alcanzar el limite).
- Decodificacion greedy determinista (la model card usa `do_sample=False`).
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- No se documenta modo "thinking" en el sentido de Qwen3; el razonamiento se expresa mediante tokens funcionales, no mediante texto.

## Casos de uso

- Investigacion sobre razonamiento con tokens discretos: el modelo sirve como banco de pruebas para estudiar si un vocabulario funcional aprendido puede sustituir a la cadena de pensamiento en lenguaje natural, comparando con las variantes Full, Zero-Results y Greedy-6/12/18/24.
- Experimentos de interpretabilidad: al emitir tokens `[f_i]` en lugar de texto libre, la traza es mas facil de parsear y analizar programaticamente que una cadena de pensamiento textual.
- Evaluacion de tecnicas de seleccion de resultados: la variante Backward-Greedy-3 permite comparar el efecto de limitar a 3 tokens de resultado por ejemplo frente a presupuestos mayores (6, 12, 18, 24).
- Prototipado de pipelines de evaluacion controlada: el script `inference.py` incluido reproduce el protocolo de evaluacion (greedy, maximo 384 tokens nuevos, 32 tokens funcionales) con solo Torch y Transformers, util para replicar resultados.
- Generacion de respuestas cortas y deterministas en entornos de test: la decodificacion greedy y el limite de tokens funcionales producen salidas reproducibles, adecuadas para pruebas de regresion.
- Docencia y divulgacion: como ejemplo didactico de ajuste fino con vocabulario extendido, fusion de LoRA y exportacion a safetensors cargable con Transformers estandar.
- No se recomienda para produccion en atencion al cliente, generacion de codigo ni tareas multilingues, dado su alcance experimental y sus resultados aritmeticos limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, exact-match):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 41,39% |
| MultiArith | 178 | 97,75% |
| SVAMP | 300 | 80,00% |
| CommonsenseQA | 1.221 | 82,56% |
| Coin Flip (corregido por paridad) | 3.333 | 76,60% |

La model card indica que los resultados completos por dataset, incluyendo MATH-500, StrategyQA y latencia con batch 1, estan en `test_results.json`. No se proporcionan en el texto los valores de MATH-500 ni StrategyQA, ni comparaciones directas con el modelo base Qwen3-8B u otros modelos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,4 GB solo para pesos (tamano del repositorio), mas overhead de activaciones y cache KV; en la practica se necesitan alrededor de 18-20 GB en BF16.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB). En GPUs de 24 GB (RTX 4090, RTX 3090) cabe en BF16 con `device_map="auto"` y offload parcial, o bien en cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con cuantizacion o reparto de capas; en GPUs de 16 GB requiere cuantizacion a 4-8 bits no documentada oficialmente por el autor.
- Opciones de despliegue: Transformers (soporte oficial documentado), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles (etiqueta `endpoints_compatible`). No se documenta soporte de vLLM, llama.cpp ni Ollama, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles en el texto de la model card; se remite a `test_results.json` para la latencia con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-3 | 8,19 B | no disponible | 41,39% | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | Hugging Face (modelo oficial) |
| CIRF-Qwen3-8B-Instruct-Full | 8,19 B | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face (mismo autor) |
| CIRF-Qwen3-8B-Instruct-Zero-Results | 8,19 B | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face (mismo autor) |

No se dispone de resultados de benchmarks del modelo base Qwen3-8B ni de las otras variantes CIRF en la informacion proporcionada, por lo que no es posible cuantificar la perdida o ganancia respecto a ellos.

## Limitaciones y advertencias

- Precision limitada en GSM8K (41,39%), muy por debajo de lo esperable en un modelo de 8B ajustado para matematicas; el enfoque de tokens funcionales no parece compensar la perdida de la cadena de pensamiento textual en esta tarea.
- Solo soporta ingles segun la etiqueta de idioma; no hay evidencia de capacidades multilingues.
- El formato de prompt es no estandar (`QUESTION[sof]`, sin plantilla de chat) y requiere `skip_special_tokens=False` y parada en EOS (no en `[eof]`); un uso incorrecto produce salidas mal formadas.
- La evaluacion impone un limite de 32 tokens funcionales forzando `[eof]`; el comportamiento sin ese limite no esta documentado.
- Coin Flip se puntua contra la paridad de los lanzamientos indicados en la pregunta porque aproximadamente el 20% de las etiquetas del dataset discrepan de ella; esto invalida la comparacion directa con resultados publicados que usen las etiquetas originales.
- Riesgo de alucinacion no cuantificado; no se publican evaluaciones de veracidad ni de seguridad.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B y las condiciones de su licencia deben respetarse; la model card incluye un fichero `LICENSE`.
- No se documentan sesgos; al derivar de Qwen3-8B hereda los sesgos del modelo base, no evaluados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante Full: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- Variante Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- Variante Backward-Greedy-24: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24

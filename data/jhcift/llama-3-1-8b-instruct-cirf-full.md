# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full

## Resumen

Llama-3.1-8B-Instruct-CIRF-Full es un ajuste fino (finetune) del modelo Meta Llama 3.1 8B Instruct desarrollado por el usuario JhCIFT, que introduce un mecanismo de razonamiento explícito basado en "tokens funcionales" (CIRF). El modelo ha sido entrenado con supervisión completa de resultados intermedios: cada paso de razonamiento se escribe de forma explícita en los objetivos de entrenamiento, de manera que el modelo genera una traza de tokens funcionales con valores de resultado opcionales antes de emitir la respuesta final.

Técnicamente, el modelo parte de la arquitectura transformer densa de Llama 3.1 8B (8.034.471.936 parámetros) y añade 514 tokens nuevos al vocabulario (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`), con sus correspondientes filas de embedding y de salida entrenadas. La actualización LoRA se ha fusionado en los pesos densos en BF16, por lo que el modelo se carga con Transformers estándar sin necesidad de PEFT, checkpoint base ni código CIRF adicional.

Su relevancia radica en que propone un protocolo de razonamiento estructurado y reproducible (traza de tokens funcionales acotada a 32 tokens en la evaluación) sobre un modelo abierto de 8B, con resultados publicados en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip. El modelo está pensado exclusivamente para inglés y su uso está sujeto a la licencia Llama 3.1 Community License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), decoder-only, con vocabulario extendido de tokens funcionales CIRF |
| Parámetros totales | 8.034.471.936 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3.1 soporta 128K, pero la model card no lo confirma para este finetune) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en BF16; el repo no documenta GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (BF16, con LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso basado en Llama 3.1 8B Instruct, con 8.034.471.936 parámetros. La modificación arquitectónica principal consiste en la extensión del vocabulario con 514 tokens nuevos: `[sof]` (start of function trace), `[eof]` (end of function trace) y 512 tokens funcionales `[f_0]`…`[f_511]`. Estos tokens cuentan con filas de embedding de entrada y de salida propias, entrenadas durante el ajuste fino, y se incluyen en el checkpoint exportado.

El entrenamiento se realizó con supervisión explícita de resultados completos: cada resultado intermedio aparece escrito en los objetivos de entrenamiento, de modo que el modelo aprende a producir una traza de tokens funcionales con valores de resultado opcionales antes de la respuesta final. La actualización se aplicó como LoRA y posteriormente se fusionó en los pesos densos en BF16. El repositorio incluye metadatos de procedencia (`training_config.json`, `provenance.json`, `export_verification.json`) que registran la configuración de entrenamiento, los hashes del checkpoint de origen y las comprobaciones de exportación. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El protocolo de inferencia es singular: el prompt se construye como `<|begin_of_text|>QUESTION[sof]`, sin plantilla de chat. El modelo genera la traza de tokens funcionales, emite `[eof]` y a continuación la respuesta final, deteniéndose en el token EOS del tokenizer. La decodificación debe hacerse con `skip_special_tokens=False` para preservar los límites de la traza.

## Capacidades

- Generación de texto y razonamiento estructurado mediante trazas de tokens funcionales con resultados intermedios explícitos.
- Razonamiento aritmético y matemático de varios pasos (evaluado en GSM8K, MultiArith, SVAMP y MATH-500).
- Razonamiento de sentido común (CommonsenseQA, StrategyQA).
- Razonamiento sobre estados y paridad (Coin Flip).
- Modo de razonamiento acotado: la evaluación limita cada traza a 32 tokens funcionales, forzando `[eof]` al alcanzar el límite.
- Decodificación greedy determinista en el protocolo de evaluación publicado.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni multi-step reasoning más allá de la traza funcional interna.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Evaluación de razonamiento aritmético reproducible: el modelo permite comparar trazas de tokens funcionales acotadas a 32 pasos sobre GSM8K, MultiArith y SVAMP con puntuación exact-match, útil para investigación en razonamiento explícito sobre modelos de 8B.
- Investigación en interpretabilidad de cadenas de razonamiento: al escribir cada resultado intermedio como token funcional, se puede analizar qué pasos contribuyen a la respuesta final y auditar trazas paso a paso.
- Clasificación y respuesta a preguntas de sentido común: con 77,81 % en CommonsenseQA, es adecuado para prototipos de QA de conocimiento general en inglés donde se requiera una traza verificable.
- Razonamiento sobre secuencias y paridad (Coin Flip): útil en tareas educativas o de demostración donde el modelo debe seguir el estado de una secuencia de flips y emitir la paridad final.
- Generación de soluciones matemáticas paso a paso para entornos de tutoría: la traza funcional hace visible el procedimiento, lo que facilita la revisión por parte de un docente o un sistema de validación.
- Baseline para comparativas de finetunes CIRF: el autor publica variantes (Zero-Results, Backward-Greedy-3/6/12/18) que permiten estudiar el efecto del número de pasos de razonamiento y de la supervisión de resultados sobre el mismo modelo base.
- Despliegue en entornos de investigación con Transformers: al no requerir PEFT ni código CIRF adicional, se integra directamente en pipelines existentes de Hugging Face Transformers y text-generation-inference.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, puntuación exact-match):

| Test set | Preguntas | Precisión |
|---|---:|---:|
| GSM8K | 1.319 | 59,89 % |
| MultiArith | 178 | 98,88 % |
| SVAMP | 300 | 77,33 % |
| CommonsenseQA | 1.221 | 77,81 % |
| Coin Flip (corregido por paridad) | 3.333 | 83,89 % |

Notas: Coin Flip se puntúa contra la paridad de los flips indicada en la pregunta, ya que aproximadamente el 20 % de las etiquetas del dataset no coinciden con ella. Los resultados completos por dataset, incluidos MATH-500, StrategyQA y la latencia con batch 1, están en `test_results.json` del repositorio. No se han publicado comparativas con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8,03B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 18-20 GB.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB). En consumer, una RTX 4090 (24 GB) puede alojar los pesos en BF16 con margen ajustado.
- Cuantización: el repositorio no publica versiones GGUF ni cuantizadas oficiales; para GPUs consumer de 8-16 GB sería necesario generar cuantizaciones propias (por ejemplo, con llama.cpp o bitsandbytes), no documentadas por el autor.
- Opciones de despliegue: Hugging Face Transformers (probado por el autor con `AutoModelForCausalLM` y `device_map="auto"`), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se documenta soporte nativo de vLLM, llama.cpp u Ollama.
- Latencia y throughput: la model card remite a `test_results.json` para la latencia con batch 1; no se reproducen cifras concretas en la información disponible.
- Requiere decodificación con `skip_special_tokens=False` y parada en EOS, no en `[eof]`, para preservar la traza funcional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque de razonamiento |
|---|---:|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Full | 8,03B | No disponible | Llama 3.1 Community | Traza de tokens funcionales explícita |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03B | 128K (según Meta) | Llama 3.1 Community | Razonamiento en lenguaje natural sin traza estructurada |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results | 8,03B | No disponible | Llama 3.1 Community | Variante CIRF sin resultados intermedios |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3/6/12/18 | 8,03B | No disponible | Llama 3.1 Community | Variantes CIRF con distinto número de pasos backward-greedy |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a un modelo de 8B: la traza funcional explícita no elimina errores de razonamiento, como refleja el 59,89 % en GSM8K.
- El protocolo de inferencia es no estándar: exige prompt sin plantilla de chat, `[sof]` al final de la pregunta, decodificación con `skip_special_tokens=False` y parada en EOS. Un uso incorrecto produce trazas mal formadas.
- La traza está acotada a 32 tokens funcionales en la evaluación; problemas que requieran más pasos pueden truncarse y forzar `[eof]` prematuramente.
- El dataset Coin Flip presenta aproximadamente un 20 % de etiquetas que no coinciden con la paridad indicada en la pregunta; las métricas publicadas usan una corrección por paridad que debe tenerse en cuenta al comparar.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial, obligaciones de atribución ("Built with Llama") y políticas de uso aceptable recogidas en `USE_POLICY.md`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación independiente por parte de la comunidad.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en GPUs consumer de gama media requiere trabajo adicional no soportado por el autor.
- No se documenta soporte de tool calling, agentes, visión ni audio, lo que limita su uso en pipelines de agentes complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Resultados de test: `test_results.json` en el repositorio del modelo
- Configuración de entrenamiento: `training_config.json` en el repositorio del modelo
- Procedencia: `provenance.json` en el repositorio del modelo
- Verificación de exportación: `export_verification.json` en el repositorio del modelo
- Script de inferencia: `inference.py` en el repositorio del modelo

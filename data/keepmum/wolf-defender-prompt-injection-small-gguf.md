# keepmum/wolf-defender-prompt-injection-small-gguf

## Resumen

Wolf Defender Prompt Injection Small v2.1 GGUF es una conversión a formato GGUF del clasificador de inyección de prompts Wolf Defender Small v2.1, desarrollado originalmente por Patronus Protect y convertido por el usuario keepmum para su uso con llama.cpp. El modelo resuelve un problema concreto: detectar instrucciones maliciosas embebidas en texto (prompt injection), especialmente en resultados de herramientas que consumen agentes de código como Claude Code, Codex, Gemini CLI u OpenHands. La conversión mantiene los pesos sin cambios y solo modifica el formato, cuantizando a Q8_0.

Arquitectura y tamaño: se trata de un clasificador de dos etiquetas (`BENIGN` e `INJECTION`) construido sobre ModernBERT sobre mmBERT-small, con 140.642.306 parámetros totales (141M), mean pooling y una cabeza de clasificación. El contexto operativo recomendado es de 2.048 tokens por ventana, con solapamiento de 256 tokens para textos largos. El modelo base es multilingüe y la licencia es Apache-2.0.

Su relevancia actual radica en que los agentes de código ejecutan herramientas cuyo output puede contener instrucciones plantadas; este modelo actúa como segunda opinión en el proxy local keepmum, que solo reporta una alerta si su propio modelo y este coinciden (veto con umbral ≥ 0.001). El resultado medido en el benchmark público de keepmum es una reducción de falsos positivos sobre resultados reales de Claude Code, Codex y Gemini CLI de 53 a 1 sobre 3.500 documentos, manteniendo la detección de ataques AgentDojo en el 93,4%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT sobre mmBERT-small, clasificador con mean pooling y dos etiquetas (`BENIGN`, `INJECTION`) |
| Parametros totales | 140.642.306 (141M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens por ventana recomendados; solapamiento de 256 tokens para textos largos |
| Tipos de cuantizacion | Q8_0 (unica publicada); existe conversion F16 usada para validacion de paridad |
| Idiomas soportados | multilingue |
| Licencia | Apache-2.0 (LICENSE de Patronus sin cambios); NOTICE incluye la licencia MIT de mmBERT-small |
| Formato de pesos | GGUF (`wolf-defender-prompt-injection-small-v2.1.Q8_0.gguf`, 164.357.632 bytes) |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto derivado de ModernBERT sobre mmBERT-small, con 141M parámetros, mean pooling y una cabeza lineal que produce logits para las etiquetas `BENIGN` e `INJECTION`. La conversión a GGUF solo incluye el clasificador (`model.safetensors`); el paquete "L2" del repositorio de Patronus (directorio `l2/`, con licencia separada) no forma parte de esta conversión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde a la model card original de Patronus, no reproducida en la información disponible.

La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp en el commit `8642541b`, con ajustes propios de keepmum: pre-tokenizador en la forma de mmBERT, rank pooling con salida de ancho 2 y lectura de la configuración del tokenizador de transformers 5 en términos de transformers 4. Se validó la paridad frente a los pesos PyTorch de Patronus sobre 3.083 documentos (los que el modelo de keepmum marca en su ajuste High) más 600 adicionales: con los mismos token ids, el margen de logits difiere en una mediana de 0,094 (máximo 1,43), y el veredicto del veto difiere en 2–6 de los 3.083 documentos para umbrales entre 0,001 y 0,01, todos con puntuaciones dentro de un factor de dos respecto al umbral. Una conversión F16 coincidió en todos los documentos.

## Capacidades

- Clasificación binaria de texto en `BENIGN` e `INJECTION` mediante logits crudos; la softmax de `[BENIGN, INJECTION]` da P(INJECTION).
- Detección de instrucciones plantadas en resultados de herramientas de agentes de código (tool results), que es el caso de uso principal documentado.
- Soporte multilingüe, heredado de mmBERT-small.
- Funcionamiento como extractor de características/embeddings vía endpoint `/embeddings` de llama.cpp con `embd_normalize: -1`.
- Procesamiento de textos largos mediante ventanas de 2.048 tokens con solapamiento de 256 y toma del máximo.
- Uso como segunda opinión (veto) combinado con otro clasificador; en el benchmark de keepmum reduce falsos positivos de 53 a 1 sobre 3.500 resultados reales.
- No es un modelo generativo: no soporta tool calling, agentes multi-step ni razonamiento generativo; su función es exclusivamente clasificatoria.

## Casos de uso

- Protección de agentes de código en producción: interceptar los resultados de herramientas (lectura de ficheros, salida de shell, respuestas de API) antes de que el agente los procese, y marcar aquellos que contienen instrucciones plantadas. El modelo está pensado para este escenario y su contexto de 2.048 tokens por ventana cubre la mayoría de tool results.
- Segunda opinión en un proxy de privacidad local: integrarlo junto a otro clasificador y reportar solo cuando ambos coinciden, como hace keepmum con umbral ≥ 0,001. En su benchmark reduce las alertas sobre resultados reales de Claude Code, Codex y Gemini CLI de 53 a 1 sobre 3.500 documentos.
- Filtrado de repositorios y ficheros maliciosos: puntuar ficheros de un repositorio antes de que el agente los lea; en el conjunto prodnull de ficheros maliciosos detecta el 36,7% en la configuración de veto de keepmum.
- Detección de inyecciones en correo y texto libre: en LLMail-Inject fase 2 alcanza el 97,2% con el veto (nota: este conjunto está presente en los datos de entrenamiento de ambos modelos, por lo que la cifra está inflada).
- Evaluación de ataques en pipelines de seguridad: usar el modelo como baseline en pruebas de red teaming de agentes (AgentDojo, InjecAgent, CodeIPI) para medir la tasa de detección de un guardarraíl concreto.
- Despliegue en local sin GPU dedicada: al ser un GGUF Q8_0 de ~164 MB, puede ejecutarse con llama.cpp en CPU o en GPU de consumo, lo que permite incorporar la comprobación en entornos de desarrollo sin infraestructura adicional.
- Normalización previa de texto sospechoso: combinado con la normalización de keepmum (decodificación de caracteres Unicode de etiqueta y selectores de variación, NFKC, eliminación de caracteres invisibles) antes de tokenizar, ya que el tokenizador del modelo no aplica esa normalización por sí mismo.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión, medidos en el benchmark público de keepmum. La columna "solo modelo de keepmum" usa el modelo propio de keepmum en su ajuste Medium por defecto; la columna "con veto de este modelo" exige además que este modelo puntúe ≥ 0,001.

| Conjunto | Solo modelo de keepmum | Con veto de este modelo (≥ 0,001) |
|---|---|---|
| Resultados reales de Claude Code, Codex y Gemini CLI (SWE-chat) y OpenHands (SWE-Hero) marcados, de 3.500 | 53 | 1 |
| AgentDojo, ataques detectados (693) | 93,7% | 93,4% |
| InjecAgent (600) | 75,0% | 73,3% |
| LLMail-Inject fase 2 (600) | 98,7% | 97,2% |
| CodeIPI (35) | 40,0% | 40,0% |
| Ficheros maliciosos de repositorio prodnull (2.432) | 45,8% | 36,7% |

En solitario, con el umbral que marca el 1% de la salida de herramientas de agentes de código, este modelo detecta más casos de InjecAgent (88%) y CodeIPI (57%) que el modelo de keepmum, y marca el 23% de los informes de subagente de Claude Code (Agent results) frente a ninguno del otro modelo.

Paridad de la conversión frente a los pesos PyTorch de Patronus (3.083 + 600 documentos): diferencia mediana del margen de logits de 0,094 (máximo 1,43); el veredicto del veto difiere en 2–6 de los 3.083 documentos con umbrales de 0,001 a 0,01.

No se han publicado resultados de benchmarks del modelo base original (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 164.357.632 bytes (~157 MiB); en la práctica cabe en cualquier GPU con 1 GB libre o incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es más que suficiente; también A100/H100 si se integra en un servicio mayor.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales y en muchas integradas.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embedding -c 2048 -ngl 99`); compatible con endpoints tipo OpenAI (`endpoints_compatible` en los tags). No se documentan otras integraciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El coste por documento es bajo por el tamaño del modelo, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wolf Defender Prompt Injection Small v2.1 GGUF (este) | 141M | 2.048 tokens por ventana | Clasificador `BENIGN`/`INJECTION` | Apache-2.0 | GGUF en HF |
| keepmum/prompt-injection-guard-small-ft-gguf | no disponible | no disponible | Clasificador de inyección de prompts | no disponible | GGUF en HF |
| patronus-studio/wolf-defender-prompt-injection-small (base) | 141M | no disponible | Clasificador `BENIGN`/`INJECTION` | Apache-2.0 | safetensors en HF |

En el benchmark de keepmum, el modelo de keepmum en solitario detecta el 75,0% de InjecAgent y el 40,0% de CodeIPI, mientras que este modelo en solitario detecta el 88% de InjecAgent y el 57% de CodeIPI con el umbral que marca el 1% de la salida de herramientas. Ambos marcan cosas distintas, lo que justifica su uso combinado. No se dispone de datos de otros clasificadores de prompt injection comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede razonar, generar código ni mantener conversaciones; solo clasifica texto.
- Riesgo de falsos negativos: en CodeIPI detecta el 40,0% en la configuración de veto y en ficheros maliciosos de repositorio prodnull el 36,7%; no debe usarse como única barrera de seguridad.
- Las cifras de LLMail-Inject (97,2%) están infladas porque ese conjunto está presente en los datos de entrenamiento de ambos modelos.
- El umbral 0,001 está en la cola de las puntuaciones del modelo para texto seguro; un nuevo checkpoint requiere recalibrar el umbral.
- El tokenizador del modelo no normaliza el texto: no decodifica caracteres Unicode de etiqueta ni selectores de variación, ni aplica NFKC ni elimina caracteres invisibles. Esa normalización es una decisión de keepmum, no del autor original.
- La conversión no incluye el paquete "L2" del repositorio de Patronus, que tiene licencia separada.
- Solo se publica cuantización Q8_0; no hay versiones Q4, Q5 u otras en la información disponible.
- La model card advierte explícitamente de que esta conversión no está hecha, afiliada ni respaldada por Patronus Protect; para datos de entrenamiento y limitaciones del modelo original hay que consultar su model card.
- Licencia Apache-2.0 permite uso comercial, pero el NOTICE debe conservar el aviso MIT de mmBERT-small.
- No se dispone de información sobre sesgos del modelo base en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keepmum/wolf-defender-prompt-injection-small-gguf
- Modelo base original: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small
- Commit de los pesos de Patronus usados: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small/tree/2484cc9a13550aa4f2c29b577ff3ef331dc6ba07
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo propio de keepmum: https://huggingface.co/keepmum/prompt-injection-guard-small-ft-gguf
- Repositorio keepmum: https://github.com/blueandhack/keepmum
- Benchmark de keepmum: https://github.com/blueandhack/keepmum/blob/2763b9a/bench/results/GUARD.md
- Script de conversion: https://github.com/blueandhack/keepmum/blob/2763b9a/bench/horizon_gguf.py
- Script de paridad: https://github.com/blueandhack/keepmum/blob/2763b9a/bench/wolf_parity.py
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp usado para la conversion: https://github.com/ggml-org/llama.cpp/tree/8642541b255bfb5dc39cd351a178be09013a55d6

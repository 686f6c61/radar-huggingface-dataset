# jjge007/jaaiva-a1-1b

## Resumen

Jaaiva A1 (alpha 1) es un modelo de lenguaje de tipo GPT-2 entrenado desde cero por el desarrollador jjge007, con 997,9 millones de parámetros (983,1 millones sin contar los embeddings). Se distribuye en el repositorio `jjge007/jaaiva-a1-1b` como una exportación cuantizada y en formato safetensors del checkpoint base `Jaaiva/jaaiva-a1`. El modelo sigue la arquitectura GPT-2 clásica (transformer decoder-only, pre-LN, activación `gelu_new`, embeddings atados y QKV fusionado) con 32 capas, 25 cabezas de atención, anchura 1600 y una ventana de contexto de 1024 tokens.

El interés del proyecto es fundamentalmente metodológico: demuestra el ciclo completo de entrenamiento de un modelo de ~1B parámetros en una única GPU de consumo de 16 GB, incluyendo un ajuste supervisado (SFT) posterior sobre datos de instrucciones. No obstante, el propio autor advierte que el modelo está infraentrenado (5.000 millones de tokens, aproximadamente 5 tokens por parámetro, frente a los ~20 de la regla de Chinchilla) y que su batería de evaluación es pequeña y parcialmente contaminada por el conjunto de SFT.

Se trata, por tanto, de un modelo experimental y de desarrollo privado, no de un producto listo para producción. Su relevancia actual es como referencia reproducible de entrenamiento desde cero a pequeña escala y como ejemplo de los problemas prácticos (escalado de Adafactor, olvido catastrófico, orden de las etapas de SFT) que aparecen en este tipo de proyectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (pre-LN, `gelu_new`, QKV fusionado, embeddings atados) |
| Parametros totales | 998.454.400 (997,9M; 983,1M sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | f16 (GGUF f16 y safetensors f16); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el entrenamiento usa FineWeb-Edu y una mezcla de diálogo y prosa) |
| Licencia | other |
| Formato de pesos | safetensors (f16, layout GPT-2) y GGUF (f16, compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la topología de GPT-2: 32 capas, 25 cabezas de atención, dimensión de modelo 1600, normalización previa a cada subcapa (pre-LN), activación `gelu_new`, proyecciones QKV fusionadas y matriz de embeddings compartida con la cabeza de salida (`lm_head` como `Linear`, sin sesgos, inicializados a cero en la exportación). El tokenizador es un BPE a nivel de byte con vocabulario de 8k. La exportación transpone los pesos `Conv1D` de GPT-2 (`c_attn`, `c_fc`, `c_proj`) y se verificó contra la referencia en PyTorch con continuaciones greedy idénticas.

El preentrenamiento consumió 5.000 millones de tokens de una mezcla de FineWeb-Edu con datos de diálogo y prosa, alcanzando una pérdida de validación de 3,007 (perplejidad 20,2) y de test de 3,034 (perplejidad 20,8). Posteriormente se aplicó un pase de SFT sobre datos de instrucciones curados, con una receta corregida que usa tasas de aprendizaje de 4e-4 a 6e-4 (la original, con Adafactor a 1e-5–2,5e-5, apenas movía los pesos). El pipeline de SFT exige al menos un 20 % de repetición del corpus de preentrenamiento para evitar olvido catastrófico y termina en una etapa general (una etapa final centrada en matemáticas hacía que el modelo respondiera todo con expresiones aritméticas). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno dentro de la plantilla `<|user|>…<|assistant|>…` con `<|eos|>` como token de parada.
- Respuesta a instrucciones básicas y mantenimiento de identidad, aprendidos durante el SFT.
- Razonamiento de forma limitada: el autor señala el razonamiento extenso y la aritmética como las primeras capacidades en degradarse por el infraentrenamiento.
- Conocimiento factual muy limitado y sensible a mayúsculas: los prompts de identidad se entrenaron en minúsculas o tipo frase, por lo que variantes con mayúscula inicial quedan fuera de distribución.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües no documentadas.

## Casos de uso

- Reproducción de pipelines de entrenamiento desde cero: sirve como referencia práctica para validar recetas de preentrenamiento y SFT en una GPU de 16 GB, comparando pérdidas y curvas con las reportadas (validación 3,007, test 3,034).
- Experimentación académica con SFT y olvido catastrófico: el modelo documenta explícitamente el efecto de mezclas sin repetición del preentrenamiento (pérdida de validación de 3,02 a 3,45), lo que lo convierte en un banco de pruebas controlado para estudiar estrategias de replay.
- Pruebas de integración con llama.cpp y Ollama: el GGUF f16 y el Modelfile incluido permiten validar plantillas de chat, tokens de parada y decodificación greedy en un entorno local ligero.
- Evaluación de robustez de plantillas: permite medir cómo degrada la calidad cuando el prompt no sigue el formato `<|user|>…<|assistant|>…`, un caso útil para diseñar capas de saneamiento de prompts en pipelines propios.
- Docencia y divulgación sobre arquitecturas GPT-2: al mantener el layout original de GPT-2 con pesos transpuestos y verificados, es útil para explicar la correspondencia entre implementaciones y formatos de exportación.
- Prototipado de demos conversacionales de bajo coste: con ~1,9 GiB en f16 cabe en GPUs de consumo y permite montar un endpoint compatible con la API de Ollama para pruebas internas, siempre con la advertencia de que es una demo y no un producto.

## Benchmarks y rendimiento

El autor menciona una batería de evaluación de 52 ítems con decodificación greedy, pero indica que se está reejecutando tras la corrección del SFT y no publica la tabla de resultados en la información disponible. Además advierte que la batería es pequeña y que sus ítems de matemáticas y conocimiento también están presentes en los datos de SFT, por lo que la puntuación mide en parte memorización. Los únicos datos cuantitativos publicados son las pérdidas:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 3,007 (perplejidad 20,2) |
| Pérdida de test | 3,034 (perplejidad 20,8) |
| Tokens de preentrenamiento | 5.000 millones |
| Batería de 52 ítems (greedy) | No disponible (reejecución pendiente) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en f16: en torno a 2 GB para los pesos (~1,9 GiB en GGUF) más el coste del contexto de 1024 tokens y el estado de activaciones, por lo que cabe holgadamente en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; no requiere A100 ni H100. El entrenamiento original se realizó en una GPU de consumo de 16 GB.
- Cabe en GPU de consumo: sí, en la práctica totalidad de modelos con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp y Ollama mediante el GGUF f16; transformers con `AutoModelForCausalLM` y `AutoTokenizer` para los pesos safetensors (el repositorio es privado y requiere autenticación en Hugging Face). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jaaiva A1 1B | 997,9M | 1024 | 5B tokens, desde cero + SFT | other | GGUF f16 y safetensors en HF (repo privado) |
| GPT-2 XL | 1,5B | 1024 | ~40B tokens (WebText) | MIT (pesos publicados por OpenAI) | Abierto en HF |
| TinyLlama 1.1B | 1,1B | 2048 | 3T tokens + SFT/DPO | Apache 2.0 | Abierto en HF, GGUF y múltiples cuantizaciones |
| Pythia 1B | 1,0B | 2048 | 300B tokens (The Pile) | Apache 2.0 | Abierto en HF |

La comparación es desfavorable en volumen de entrenamiento y contexto frente a TinyLlama y Pythia, y la licencia "other" añade incertidumbre frente a las licencias permisivas de las alternativas. No se dispone de benchmarks comparativos publicados para Jaaiva A1.

## Limitaciones y advertencias

- Infraentrenamiento severo: 5 tokens por parámetro frente a los ~20 recomendados por Chinchilla; el razonamiento extenso y la aritmética son las capacidades más afectadas.
- Riesgo elevado de alucinación y de conocimiento factual erróneo, dado el escaso volumen de preentrenamiento y la baja perplejidad relativa.
- Sensibilidad a mayúsculas: prompts como `France` con mayúscula inicial quedan fuera de distribución según el autor.
- Dependencia estricta de la plantilla de chat `<|user|>…<|assistant|>…` con `<|eos|>`; fuera de ella las respuestas degeneran en prosa.
- Sin penalización de repetición en el Modelfile: la decodificación greedy puede entrar en bucles; el autor describe la receta de Ollama como demo, no como producto.
- Riesgo de olvido catastrófico documentado si las mezclas de SFT no incluyen al menos un 20 % de repetición del preentrenamiento.
- Licencia "other" sin términos comerciales explícitos en la información disponible; debe revisarse antes de cualquier uso en producción.
- Repositorio privado: el acceso a los pesos requiere autenticación en Hugging Face.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe.
- Sin soporte documentado de tool calling, agentes, visión ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/jjge007/jaaiva-a1-1b
- Modelo base: https://huggingface.co/Jaaiva/jaaiva-a1
- Repositorio de código (privado, citado en la model card): `jjgd008/jaaiva-a1` en GitHub (sin URL pública disponible)
- Checkpoint citado: `checkpoints/jaaiva-a1-s4/jaaiva-test1-ft.pt` (sin URL pública disponible)

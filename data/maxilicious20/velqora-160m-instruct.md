# Maxilicious20/Velqora-160M-Instruct

## Resumen

Velqora-160M-Instruct es un modelo de lenguaje causal decoder-only de 158.622.720 parámetros entrenado desde inicialización aleatoria por el desarrollador independiente Maxilicious20. Se trata de un experimento de investigación que reproduce el diseño de un transformer estilo Llama (GQA, SwiGLU, RoPE, RMSNorm) con implementación propia en PyTorch, sin reutilizar pesos, tokenizador ni clases de `transformers` de ningún modelo preexistente. Todo el entrenamiento se realizó en una única NVIDIA GeForce RTX 4060 de 8 GB bajo Windows 11.

El modelo se distribuye como checkpoint PyTorch personalizado (`model.pt` con un `state_dict` propio, `config.json` de tipo `Velqora ModelConfig` y un tokenizador BPE byte-level de 32.000 tokens), por lo que no es cargable mediante `AutoModelForCausalLM.from_pretrained`. Existe un companion GGUF en el repositorio `Maxilicious20/Velqora-160M-Instruct-GGUF`, aunque el autor advierte de que solo debe usarse una variante cuya conversión e inferencia hayan sido validadas de forma independiente.

Su relevancia es fundamentalmente metodológica: documenta de forma transparente un pipeline completo de preentrenamiento, entrenamiento conversacional y ajuste supervisado sobre hardware de consumo, con contextos de 2.048 tokens y licencia Apache 2.0. No está pensado como asistente de producción ni como modelo fiable a nivel factual, y sus propios resultados de evaluación (MMLU 23,13%, ARC-Challenge 22,44%) lo sitúan muy por debajo de modelos instruct de tamaño comparable entrenados con presupuestos mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (causal LM), implementación propia en PyTorch con `scaled_dot_product_attention` |
| Parametros totales | 158.622.720 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (existe companion GGUF, sin variantes de cuantización detalladas) |
| Idiomas soportados | Inglés (english-first) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`model.pt`); GGUF en repositorio separado |
| Capas del transformer | 12 |
| Dimensión oculta | 1.024 |
| Atención | 16 cabezas de query / 4 cabezas key-value (GQA) |
| Dimensión feed-forward | 2.560, SwiGLU |
| Embeddings posicionales | RoPE, base θ = 10.000 |
| Normalización | RMSNorm |
| Embeddings de tokens | Atados entrada/salida (tied) |
| Tokenizador | BPE byte-level propio, 32.000 tokens |
| Hardware de entrenamiento | Windows 11, NVIDIA RTX 4060 8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 12 capas con dimensión oculta 1.024, atención con grouped-query attention (16 cabezas de query y 4 de key-value), feed-forward SwiGLU de dimensión 2.560, RMSNorm y embeddings posicionales rotatorios con base 10.000. Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros dado el vocabulario de 32.000 tokens. La implementación es PyTorch propia y utiliza `scaled_dot_product_attention`; el autor subraya explícitamente que "estilo Llama" describe solo la familia arquitectónica y no implica compatibilidad con checkpoints de Meta Llama ni con `LlamaForCausalLM`.

El entrenamiento se dividió en tres etapas sobre los mismos pesos: preentrenamiento de modelado de lenguaje con 3.000 millones de tokens procesados (FineWeb-Edu `sample-10BT` y WikiText-103), entrenamiento conversacional con 200 millones de tokens de UltraChat 200K y ajuste supervisado de instrucciones con 15 millones de tokens de datos de instrucción de UltraChat, sumando 3.215 millones de tokens procesados. El autor aclara que se trata de tokens procesados y no únicos: los objetivos originales del pipeline eran aproximadamente 700M de tokens FineWeb-Edu empaquetados, 50M de WikiText, 80M de conversación y 15M de instrucción antes del muestreo con repetición, y las muestras se reutilizaron para alcanzar los presupuestos. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación de decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con calidad comprensible pero inconsistente, según la propia evaluación del autor.
- Respuesta a preguntas factuales simples de forma ocasional, con errores frecuentes de aritmética y alucinaciones factuales.
- Formato conversacional multi-turno, derivado del entrenamiento sobre UltraChat 200K en las etapas de conversación e instrucción.
- Seguimiento de instrucciones básico mediante ajuste supervisado, aunque el autor reporta fallos al obedecer restricciones de formato de salida.
- Capacidad limitada de selección de sentido léxico (word-sense selection), con errores observados.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo es english-first y solo declara inglés.

## Casos de uso

- Investigación reproducible de pipelines from-scratch: el modelo sirve como referencia completa de un ciclo de preentrenamiento, conversación y SFT sobre una GPU de 8 GB, con hiperparámetros y presupuestos de tokens documentados, útil para estudiar el efecto del escalado de datos en modelos pequeños.
- Docencia y formación en arquitecturas transformer: al no depender de `transformers`, obliga a implementar carga de `state_dict`, tokenizador BPE propio y bucle de generación, lo que lo convierte en un ejercicio práctico de ingeniería de modelos.
- Inferencia local en hardware modesto: con 158M de parámetros y contexto de 2.048 tokens, cabe holgadamente en GPUs de consumo de gama baja y en CPU, adecuado para pruebas de latencia y despliegue con llama.cpp u Ollama a partir del GGUF validado.
- Evaluación comparativa de protocolos: sus resultados locales (MMLU, ARC, HellaSwag, BoolQ) con recuentos incompletos documentados permiten estudiar la sensibilidad de las métricas al protocolo de evaluación y al sesgo de elección de respuesta.
- Generación de texto creativo de baja exigencia en inglés: borradores, continuaciones y experimentos de prompting donde la corrección factual no es crítica y se acepta revisión humana posterior.
- Base para experimentos de ajuste fino: al ser Apache 2.0 y entrenado desde cero, puede usarse como punto de partida para estudiar técnicas de SFT, LoRA o destilación en modelos de menos de 200M de parámetros sin restricciones de licencia heredadas.
- Pruebas de robustez y análisis de fallos: la repetición, los errores aritméticos y el sesgo hacia opciones de respuesta documentados lo hacen útil como caso de estudio de modos de fallo en modelos pequeños.

## Benchmarks y rendimiento

Resultados locales del 5 de noviembre de 2026, obtenidos con un protocolo zero-shot propio sobre el checkpoint PyTorch original, seleccionando la continuación con mayor verosimilitud bruta. No son resultados oficiales de leaderboard ni reproducen el EleutherAI LM Evaluation Harness.

| Benchmark | Puntuación | Evaluados / previstos | Caveat |
|---|---:|---:|---|
| VelqoraBench-400, decodificación estándar (T=0,40) | 0,00% | 400 / 400 | Coincidencia exacta muy estricta; rechaza respuestas correctas más largas |
| ARC-Easy | 46,55% | 2.376 / 2.376 | Zero-shot de verosimilitud bruta local |
| ARC-Challenge | 22,44% | 1.172 / 1.172 | Zero-shot de verosimilitud bruta local |
| HellaSwag | 28,10% | 9.609 / 10.042 | Incompleto: faltan 433 tareas |
| BoolQ | 58,26% | 3.270 / 3.270 | Por debajo de la línea base always-Yes (~62,17%) para este conjunto |
| MMLU | 23,13% | 13.957 / 14.042 | Incompleto: faltan 85 tareas; sesgo fuerte hacia opciones de respuesta |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El autor advierte explícitamente de que estas cifras no deben compararse directamente con las publicadas en leaderboards de MMLU, ARC o HellaSwag, ni con puntuaciones obtenidas con otro protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,63 GB solo para pesos (158,6M × 4 bytes), más overhead de activaciones y caché KV; en FP16/BF16 bajaría a unos 0,32 GB de pesos.
- En cuantización de 8 bits los pesos ocuparían del orden de 0,16 GB y en 4 bits unos 0,08 GB, aunque la información disponible no detalla variantes GGUF concretas ni su validación.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP32 con contexto completo; una RTX 4060 de 8 GB (el hardware de entrenamiento) es sobradamente suficiente. También cabe en CPU.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama actual (GTX 1650, RTX 3050/4060, RTX 4090) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: implementación PyTorch propia incluida en el repositorio; llama.cpp u Ollama a través del companion GGUF, con la advertencia de validar la conversión. No se documenta soporte de vLLM ni TGI, ya que el checkpoint no es nativo de `transformers`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a especificaciones estructurales.

| Modelo | Parámetros | Contexto | Licencia | Formato / compatibilidad | Rendimiento |
|---|---:|---:|---|---|---|
| Velqora-160M-Instruct | 158,6M | 2.048 | Apache 2.0 | PyTorch propio, GGUF separado | MMLU 23,13% (protocolo local, incompleto) |
| SmolLM-135M-Instruct (Hugging Face) | 135M | 2.048 | Apache 2.0 | `transformers`, GGUF, llama.cpp | No disponible en esta ficha |
| Qwen2.5-0.5B-Instruct (Alibaba) | ~494M | 32.768 | Apache 2.0 | `transformers`, GGUF, vLLM | No disponible en esta ficha |
| TinyLlama-1.1B-Chat (TinyLlama) | ~1,1B | 2.048 | Apache 2.0 | `transformers`, GGUF, vLLM | No disponible en esta ficha |

La diferencia principal frente a estas alternativas no es el rendimiento, sino la integración: Velqora requiere código propio para cargarse, mientras que los modelos citados funcionan con el ecosistema estándar de `transformers` y servidores de inferencia.

## Limitaciones y advertencias

- No es un asistente de producción: el propio autor lo describe como experimental y no fiable a nivel factual.
- Riesgo alto de alucinación factual, errores aritméticos, repetición y fallo en el seguimiento de restricciones de formato de salida.
- MMLU del 23,13% y ARC-Challenge del 22,44% indican un conocimiento del mundo muy limitado; BoolQ queda por debajo de la línea base trivial always-Yes.
- El resultado del 0,00% en VelqoraBench-400 refleja un scorer de coincidencia exacta demasiado estricto, no necesariamente una incapacidad semántica total; no debe interpretarse como medida robusta de corrección.
- Sesgo de elección de respuesta observado en MMLU, que invalida comparaciones directas con otros modelos.
- Contexto máximo de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; sin soporte multilingüe declarado.
- Incompatibilidad con `AutoModelForCausalLM.from_pretrained`, `LlamaForCausalLM` y el tokenizador de Llama; requiere la clase y el tokenizador propios del repositorio.
- El GGUF companion debe validarse de forma independiente antes de usarse; no se garantiza que la conversión sea correcta.
- Los recuentos de benchmarks están incompletos (433 tareas faltantes en HellaSwag, 85 en MMLU), lo que afecta a la comparabilidad.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable cualquier despliegue orientado al usuario final sin supervisión humana.
- El autor pide versionar los resultados si se publican evaluaciones revisadas, en lugar de sobrescribir el protocolo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxilicious20/Velqora-160M-Instruct
- Companion GGUF: https://huggingface.co/Maxilicious20/Velqora-160M-Instruct-GGUF
- Perfil del autor: https://huggingface.co/Maxilicious20
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset WikiText-103: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset UltraChat 200K: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k

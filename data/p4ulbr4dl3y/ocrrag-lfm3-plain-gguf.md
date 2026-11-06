# p4ulbr4dl3y/ocrrag-lfm3-plain-gguf

## Resumen

ocrrag-lfm3-plain-gguf es un ajuste fino mediante LoRA del modelo base LiquidAI/LFM3-1.7B, publicado por el usuario p4ulbr4dl3y en formato GGUF. No se trata de un modelo de propósito general, sino de un componente especializado ("answerer") para el plugin `plain` del proyecto ocrrag: recibe una ventana de fragmentos recuperados de un sistema RAG y devuelve una respuesta extractiva con citas del tipo `[chunk_id]` o una negativa explícita cuando la evidencia es insuficiente. La relevancia de esta ficha es acotada: es un artefacto de investigación reproducible con métricas declaradas sobre un split de test de 83 preguntas, no un modelo listo para uso general.

El modelo base LFM3-1.7B pertenece a la familia Liquid Foundation Models de Liquid AI, con 1.728.801.600 parámetros según los safetensors del repositorio. El adaptador se entrenó sobre el checkpoint-150 del LoRA `ocrrag-lfm3-plain-lora-v3`, con un conjunto de datos de 1210 ejemplos de entrenamiento, 63 de validación y 83 de test, separados a nivel de documento y con un 34% de ejemplos de negativa. La evaluación reportada por el autor indica que el adaptador mejora sustancialmente la adherencia al formato estructurado frente al modelo base sin adaptador (83/83 frente a 56/83 en veredicto estructurado), a costa de un aumento de las negativas excesivas.

El repositorio se distribuye únicamente en GGUF, con dos cuantizaciones: Q4_K_M (1,02 GiB, recomendada para CPU) y Q8_0 (1,72 GiB, para Metal/GPU y calidad de referencia). No hay pesos en safetensors del adaptador en este repositorio, ni model card con licencia, idiomas o pipeline declarados en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-1.7B de Liquid AI; el repositorio no detalla la arquitectura) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 16384 tokens en el ejemplo de despliegue (`-c 16384`); no se declara contexto nativo del modelo base |
| Tipos de cuantización | Q4_K_M y Q8_0 (GGUF); se menciona Q4_K_M + imatrix como descartada por peor PPL y comportamiento |
| Idiomas soportados | no disponible (los ejemplos de prompt del autor están en ruso) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base LFM3-1.7B. Lo que sí se detalla es el procedimiento de ajuste: un adaptador LoRA entrenado sobre el checkpoint-150 de `p4ulbr4dl3y/ocrrag-lfm3-plain-lora-v3`, con mejor evaluación de 0,1942. El conjunto de datos `p4ulbr4dl3y/ocrrag-lfm3-plain-data-v2` contiene 1210 ejemplos de entrenamiento, 63 de validación y 83 de test, con separación a nivel de documento para evitar filtración entre splits y un 34% de ejemplos de negativa. El prompt de entrenamiento es el prompt servido en producción (`DEFAULT_SYSTEM_PROMPT` + `JSON_INSTRUCTION`, sha256 `5449aca38687225a`), y el autor advierte explícitamente que usar un system prompt distinto desplaza al modelo fuera de distribución.

La innovación técnica destacable no está en la arquitectura sino en el contrato de salida: el modelo debe responder con un objeto JSON `{"answer": "...", "refusal": false}` y citar los fragmentos mediante identificadores `[chunk_id]`, o bien negarse cuando la ventana de contexto no contiene evidencia suficiente. El autor midió que la variante Q4_K_M con imatrix empeoraba tanto la perplejidad como el comportamiento, por lo que decidió no distribuirla. No se documentan detalles sobre datos de preentrenamiento del modelo base, RLHF, DPO ni composición del corpus original.

## Capacidades

- Generación de respuestas extractivas fundamentadas en un contexto recuperado, con citas explícitas por identificador de fragmento (`[chunk_id]`).
- Negativa controlada: el modelo puede rechazar responder cuando la evidencia es insuficiente, comportamiento entrenado con un 34% de ejemplos de negativa.
- Salida estructurada en JSON con los campos `answer` y `refusal`.
- Modo thinking desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`; el autor recomienda mantenerlo desactivado.
- Conversación de un solo turno efectivo: el prompt de ejemplo incluye system prompt y un mensaje de usuario con la pregunta y los fragmentos ya recuperados.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas.
- Capacidades multilingües: no disponibles; los ejemplos de prompt del autor están en ruso, pero no se declara cobertura de idiomas.

## Casos de uso

- Respuesta fundamentada en pipelines RAG: el modelo recibe los fragmentos recuperados por el retriever y devuelve una respuesta con citas verificables, lo que permite auditar qué fragmento sustenta cada afirmación. Es adecuado porque su entrenamiento está específicamente orientado a ese contrato de salida.
- Abstención controlada en sistemas de preguntas y respuestas: cuando la ventana de fragmentos no contiene evidencia, el modelo emite una negativa en lugar de alucinar. Útil en dominios donde una respuesta incorrecta es más costosa que no responder.
- Despliegue en CPU sin GPU: la cuantización Q4_K_M (1,02 GiB) permite servir el modelo con `llama-server` en hardware modesto, con una latencia p50 medida de 10,3 s en el split de test.
- Despliegue en GPU de consumo o Apple Silicon: la cuantización Q8_0 (1,72 GiB) está pensada para Metal/GPU y ofrece la calidad de referencia, con p50 de 30,6 s en la misma medición.
- Evaluación de pipelines RAG: el split de test de 83 preguntas con separación a nivel de documento permite comparar variantes de retriever o de prompt contra una línea base publicada (56/83 del modelo base frente a 83/83 del adaptador en veredicto estructurado).
- Prototipado de asistentes documentales con contrato JSON: al devolver `{"answer": ..., "refusal": ...}`, se integra directamente en servicios que necesitan una respuesta parseable y un indicador de abstención, sin postprocesado complejo.
- Investigación sobre ajuste fino con LoRA en modelos pequeños: el repositorio documenta checkpoint, tamaño de dataset, split y métricas, lo que facilita reproducir o comparar el procedimiento.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de 83 preguntas:

| Artefacto | Veredicto estructurado | Negativas excesivas | Negativa en contexto vacío | Respuestas con cita | Similitud | p50 |
|---|---|---|---|---|---|---|
| LFM3 base (sin adaptador) | 56/83 | 5/58 | 11/25 | 35/53 | 0,35 | 35,5 s |
| Este adaptador, Q8_0 | 83/83 | 8/58 | 22/25 | 50/50 | 0,65 | 30,6 s |
| Este adaptador, Q4_K_M | 83/83 | 8/58 | 22/25 | 50/50 | 0,66 | 10,3 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GiB con Q4_K_M y 1,7 GiB con Q8_0, a los que hay que sumar la memoria de la ventana de contexto (hasta 16384 tokens en la configuración de ejemplo).
- GPU recomendadas: no se especifican modelos concretos; el autor indica Q8_0 para Metal/GPU y Q4_K_M para CPU.
- Cabe en GPU de consumo: sí, por tamaño de pesos; cualquier GPU con al menos 2-3 GiB de memoria libre puede alojar Q4_K_M, y con algo más Q8_0, aunque no se han publicado pruebas en modelos concretos como RTX 4090.
- Opciones de despliegue: `llama-server` (llama.cpp) con `--jinja`, tal como documenta el autor; el formato GGUF es compatible con el ecosistema llama.cpp, aunque no se confirma soporte verificado en Ollama, vLLM o TGI.
- Latencia y throughput: p50 de 10,3 s con Q4_K_M y 30,6 s con Q8_0 sobre el split de test de 83 preguntas; no se publican valores de tokens por segundo ni de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ocrrag-lfm3-plain-gguf (este) | 1,73 B | 16384 en el ejemplo de despliegue | Answerer extractivo con citas y negativa para RAG | no disponible | GGUF en Hugging Face |
| LFM3-1.7B base (LiquidAI) | 1,73 B | no disponible | Modelo de propósito general | no disponible en esta ficha | Hugging Face |
| ocrrag-lfm3-plain-lora-v3 (adaptador) | no disponible | no disponible | Adaptador LoRA del que deriva este GGUF | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones suficientes para comparar con alternativas de la misma categoría (por ejemplo, otros answerers RAG de tamaño similar). La comparativa se limita al modelo base y al adaptador de origen.

## Limitaciones y advertencias

- El modelo está entrenado para un system prompt concreto (sha256 `5449aca38687225a`); cualquier variación lo desplaza fuera de distribución y degrada el comportamiento.
- Requiere `enable_thinking=false`; activar el modo thinking no forma parte del régimen de entrenamiento documentado.
- Aumento de negativas excesivas respecto al modelo base: 8/58 frente a 5/58, es decir, el adaptador rechaza responder en más casos de los deseables.
- Negativa en contexto vacío de 22/25, no perfecta: en 3 de 25 casos no se abstiene correctamente cuando no hay evidencia.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, lo que es un bloqueo para producción.
- Idiomas no declarados; los ejemplos del autor están en ruso y no hay garantía de comportamiento en castellano.
- Riesgo de alucinación no cuantificado fuera del split de test; las métricas publicadas son de similitud (0,65-0,66) y no de corrección factual.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente de las métricas declaradas.
- Solo se distribuye en GGUF; no hay pesos del adaptador en safetensors en este repositorio, lo que limita la inspección y el reentrenamiento desde aquí.
- El tamaño del conjunto de test (83 preguntas) es reducido, por lo que las diferencias entre configuraciones deben interpretarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Adaptador LoRA de origen: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-lora-v3
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/p4ulbr4dl3y/ocrrag-lfm3-plain-data-v2
- Proyecto ocrrag: https://github.com/ (la model card no incluye la ruta completa del repositorio)

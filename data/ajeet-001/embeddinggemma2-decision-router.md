# Ajeet-001/embeddinggemma2-decision-router

## Resumen

`embeddinggemma2-decision-router` es un modelo de enrutamiento de intenciones desarrollado por el usuario Ajeet-001 que combina un codificador de texto congelado (`google/embeddinggemma-2`, 271 M de parámetros) con una cabeza de decisión entrenada específicamente para la tarea (11,6 M de parámetros). El modelo recibe un texto corto y una lista de opciones candidatas, y devuelve una probabilidad para cada opción junto con una probabilidad de que ninguna encaje (abstención). Su función principal es actuar como clasificador de intenciones con capacidad de rechazo, orientado a sistemas de enrutamiento y agentes que necesitan decidir entre herramientas o acciones disponibles.

La relevancia de este modelo radica en su enfoque de "cabeza de decisión" sobre un encoder congelado: en lugar de reentrenar un modelo completo, añade un transformador de 2 capas con equiesvarianza de conjuntos (set-equivariant) que es invariante al orden de las opciones, con una tasa de volteo medida del 0,0 % en 2.500 barajados. Incluye además una compuerta de abstención (Null Gate) de 6 características que permite rechazar consultas fuera de dominio, una capacidad crítica en producción para evitar enrutamientos incorrectos.

El alcance está explícitamente limitado: el modelo fue entrenado y validado sobre texto corto de estilo intención (BANKING77, 62 clases vistas, K=8 candidatos). Otros esquemas como trazas de agente, políticas, estados JSON o documentos largos no fueron validados, y el propio autor reporta que en preguntas de elección zero-shot sobre `typed-decisions` el rendimiento quedó por debajo de la línea base de clase mayoritaria. Con 394 descargas y creado en octubre de 2026, es un modelo reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Pre-LN set-equivariant de 2 capas (d_model=768, 8 cabezas) sobre encoder `google/embeddinggemma-2` congelado + Null Gate de 6 características |
| Parametros totales | 282.625.050 (271,0 M encoder congelado + 11,6 M cabeza de decisión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | safetensors en BF16 (565 MB); GGUF y ONNX presentes en el repo; no se detallan variantes de cuantización |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` / `see-base-model` (remite a la licencia de `google/embeddinggemma-2`) |
| Formato de pesos | safetensors (BF16), ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo se compone de dos bloques. El primero es el encoder de texto `google/embeddinggemma-2`, congelado, que produce embeddings de 768 dimensiones. El segundo es la cabeza de decisión, un transformer Pre-LN de 2 capas con 8 cabezas de atención y 43 tensores (11.622.405 parámetros), diseñado con equiesvarianza de conjuntos para que las opciones candidatas no tengan codificación posicional: esto garantiza invariancia al orden, verificada con una tasa de volteo del 0,0 % en 2.500 barajados mediante `model.decide()` y en `step2_eval_results.json`. La compuerta de abstención (Null Gate) utiliza 6 características para estimar la probabilidad de que ninguna opción encaje.

El entrenamiento se realizó sobre el dataset `PolyAI/banking77` (62 clases vistas, K=8 candidatos) y el dataset propio `Ajeet-001/banking77-hard-negative-routing-episodes`, orientado a episodios de enrutamiento con negativos difíciles. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO. El autor advierte que la cabeza y la compuerta de abstención solo fueron validadas sobre texto corto de estilo intención, y que otros esquemas no fueron probados.

## Capacidades

- Clasificación de intenciones con elección entre opciones candidatas (`choice`), devolviendo etiqueta, valor, confianza y distribución de probabilidades.
- Abstención explícita mediante `null_probability` y `abstain` para consultas de tipo `choice` en texto, con umbral configurable (por defecto 0,5; en el paquete `gemmarouter` se usa `null_threshold=0.58`).
- Invariancia al orden de las opciones (sin codificación posicional sobre candidatos).
- Preguntas de tipo `score` (entero) y `noul` (sí/no) presentes en la API, pero no validadas según el autor.
- Enrutamiento directo con caché de embeddings de opciones (`prewarm()`) y aclaración ante colisiones ambiguas (`margin_threshold=0.40`) mediante el paquete PyPI `gemmarouter==0.1.1`.
- Soporte de entradas de imagen y audio en la ruta de código, marcadas como experimentales, que requieren descargar el modelo completo `google/embeddinggemma-2` por separado y con la Null Gate desactivada.
- No se documenta soporte de tool calling genérico, agentes multi-paso ni razonamiento multi-turno más allá del enrutamiento puntual.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: dado un mensaje corto del usuario y un conjunto de intenciones bancarias (llegada de tarjeta, tarjeta perdida, tipo de cambio, recarga fallida), el modelo devuelve la intención más probable con una confianza cuantificada, lo que permite derivar la conversación al flujo adecuado.
- Enrutamiento de herramientas en agentes: con el paquete `gemmarouter`, se definen opciones como `restart_postgres_prod` o `flush_redis_cache` y el modelo despacha la herramienta correcta; el caso documentado muestra una confianza de 0,8758 y un margen de 0,7516 para una consulta inequívoca.
- Detección de consultas fuera de dominio: la compuerta de abstención permite rechazar peticiones que no encajan en ninguna opción disponible, evitando que un agente ejecute una acción incorrecta; el autor advierte que con umbral 0,5 se abstiene en aproximadamente el 10 % de consultas válidas.
- Aclaración ante ambigüedad: cuando el margen entre las dos mejores opciones cae por debajo de 0,40, el sistema puede solicitar aclaración al usuario en lugar de decidir, lo que es útil en escenarios con herramientas de nombre o descripción muy similares (por ejemplo, reiniciar la base de datos de producción frente a la de staging).
- Clasificación de tickets de soporte: integrado en un pipeline de triaje, el modelo asigna cada ticket entrante a una categoría predefinida y marca para revisión humana aquellos con alta probabilidad de no encajar.
- Enrutamiento en asistentes de voz o chatbots: al operar sobre texto corto de estilo intención, encaja en la fase de comprensión de un asistente que debe seleccionar entre un conjunto acotado de acciones, con la ventaja de la invariancia al orden de las opciones.
- Filtrado previo en sistemas RAG o de recomendación: el modelo puede decidir qué opción de un conjunto cerrado describe mejor una consulta antes de invocar un recuperador o generador más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de comportamiento: tasa de volteo del 0,0 % en 2.500 barajados de opciones, abstención de aproximadamente el 10 % de consultas válidas con umbral 0,5, y un rendimiento por debajo de la línea base de clase mayoritaria en preguntas de elección zero-shot sobre `typed-decisions`. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de precisión sobre BANKING77.

## Requisitos de hardware

- VRAM estimada para inferencia: el `model.safetensors` en BF16 ocupa 565 MB, por lo que la inferencia requiere aproximadamente 1-2 GB de VRAM incluyendo activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 4090, A100 o H100 son sobredimensionadas para este modelo, pero funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado), ONNX Runtime para los pesos ONNX, llama.cpp u Ollama para las variantes GGUF, y el paquete `gemmarouter` para enrutamiento con caché de embeddings.
- Precisión: usar `torch.bfloat16` o `torch.float32`; el autor advierte que `float16` produce NaN.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ajeet-001/embeddinggemma2-decision-router` | 282,6 M (271 M congelados + 11,6 M cabeza) | No disponible | Enrutamiento de intenciones con abstención | `other` / see-base-model | Hugging Face, PyPI (`gemmarouter`) |
| `google/embeddinggemma-2` | 271 M | No disponible | Embeddings de texto | Ver modelo base | Hugging Face |
| Clasificador fine-tuned sobre BANKING77 | Depende del encoder | No disponible | Clasificación de intenciones | Depende del encoder | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La diferencia principal del modelo de Ajeet-001 frente a un fine-tuning convencional es la cabeza set-equivariant con invariancia al orden y la compuerta de abstención integrada, además del paquete de enrutamiento con caché y aclaración por margen.

## Limitaciones y advertencias

- Alcance restringido: solo validado sobre texto corto de estilo intención (BANKING77, 62 clases, K=8); no validado en trazas de agente, políticas, estados JSON ni documentos largos.
- Rendimiento zero-shot por debajo de la línea base de clase mayoritaria en preguntas de elección sobre `typed-decisions`, según el propio autor.
- Las preguntas de tipo `score` y `noul` no están validadas y se devuelven desde los logits brutos combinados.
- La compuerta de abstención con umbral 0,5 rechaza aproximadamente el 10 % de consultas válidas, lo que puede degradar la cobertura en producción.
- Las entradas de imagen y audio son experimentales, requieren descargar el modelo base completo y no están cubiertas por las métricas reportadas; la Null Gate está desactivada para ellas.
- `float16` produce NaN; es obligatorio usar BF16 o FP32.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor.
- Solo soporta inglés (`en`), lo que limita su uso en entornos multilingües.
- Licencia `other` que remite a la de `google/embeddinggemma-2`; es necesario revisar los términos del modelo base antes de un uso comercial.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni tasas de error por clase; el modelo es pequeño y su entrenamiento se limita a un dominio bancario.
- Con solo 394 descargas y 1 like, la comunidad de validación es muy reducida; conviene evaluar en el dominio propio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ajeet-001/embeddinggemma2-decision-router
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset de entrenamiento: https://huggingface.co/datasets/Ajeet-001/banking77-hard-negative-routing-episodes
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Paquete PyPI: `gemmarouter==0.1.1` (instalable con `pip install -U gemmarouter`)

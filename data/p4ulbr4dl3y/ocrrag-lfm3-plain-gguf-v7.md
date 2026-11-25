# p4ulbr4dl3y/ocrrag-lfm3-plain-gguf-v7

## Resumen

ocrrag-lfm3-plain-gguf-v7 es un ajuste fino mediante LoRA del modelo base LiquidAI/LFM3-1.7B, publicado en formato GGUF por el usuario p4ulbr4dl3y. No se trata de un modelo de propósito general, sino de un componente especializado dentro del sistema ocrrag: un "answerer" extractivo y anclado (grounded) que recibe una ventana de fragmentos recuperados de un pipeline RAG y devuelve una respuesta con citas del tipo `[chunk_id]` o un veredicto tipado de rechazo cuando la información no está en el contexto.

El modelo resuelve un problema muy concreto de los sistemas RAG documentales: obligar al generador a no inventar y a declarar explícitamente cuándo no puede responder. Para ello se entrenó sobre un conjunto de 2268 filas de entrenamiento, 154 de validación y 108 de test, con un 35,1% de ejemplos de rechazo, y se sirve con `enable_thinking=False` y temperatura 0.

La relevancia de esta ficha es doble: por un lado documenta un caso real de ajuste fino pequeño (1.728.801.600 parámetros) orientado a producción con requisitos de latencia y coste bajos; por otro, la propia model card advierte de que la versión v7 está superada por la v9 y de que, con el prompt en prosa que sirve el producto, el modelo rechaza 334 de 351 filas. Es, por tanto, un artefacto útil para entender el método y para hacer rollback, no una elección recomendada para nuevos despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LiquidAI/LFM3-1.7B) con adaptador LoRA fusionado |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de servicio (`-c 8192`); `max_length` de entrenamiento 6144 |
| Tipos de cuantizacion | Q4_K_M (1,02 GiB) y Q8_0 (1,72 GiB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1.7B parámetros, sobre el que se aplicó un adaptador LoRA (`p4ulbr4dl3y/ocrrag-lfm3-plain-lora-v7`, mejor checkpoint `checkpoint-280`, paso 275, con `eval_loss` de 0,21152). El adaptador se fusionó y se exportó a GGUF en dos cuantizaciones. El entrenamiento usó el dataset `p4ulbr4dl3y/ocrrag-lfm3-plain-data-v7` con 2268 filas de entrenamiento, 154 de validación y 108 de test, y una proporción de rechazos del 35,1%.

La innovación técnica no está en la arquitectura sino en el contrato de salida: el modelo se entrena para emitir un objeto `{"answer": str, "refusal": bool}` y el autor recomienda imponer una gramática sobre ese objeto como garantía de servicio. El prompt de entrenamiento tiene 2530 caracteres (sha256 `5449aca38687225a`) y debe enviarse byte a byte. Un dato relevante para interpretar el rendimiento: 118 de las 2268 filas de entrenamiento (5,2%) se descartaron por superar `max_length 6144`, precisamente las ventanas con tablas más largas, que es donde la recall es peor.

## Capacidades

- Generación de respuestas extractivas ancladas a fragmentos recuperados, con citas `[chunk_id]` por cada dato aportado.
- Rechazo tipado: emite un veredicto estructurado cuando la respuesta no está en la ventana de contexto.
- Salida estructurada JSON con los campos `answer` y `refusal`, apta para validación mediante gramática en el servidor de inferencia.
- Manejo de ventanas de contexto de hasta 8192 tokens en el despliegue de referencia.
- Extracción de cifras y datos numéricos presentes en el contexto (recall de figuras doradas de 0,81 en texto plano).
- Procesamiento de contenido tabular dentro del contexto, con recall notablemente inferior (0,40-0,44).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking; de hecho el servicio se configura con `enable_thinking=False`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente sobre base documental: el modelo recibe los fragmentos recuperados por el retriever y responde citando `[chunk_id]`, lo que permite auditar cada afirmación contra el documento fuente y reducir el riesgo de respuestas inventadas.
- Cumplimiento normativo y consulta de políticas internas: el veredicto de rechazo tipado permite distinguir entre "no lo sé" y "no está en la documentación", un requisito habitual en entornos regulados donde una respuesta inventada es peor que una negativa.
- Despliegue en CPU sin GPU: la cuantización Q4_K_M ocupa 1,02 GiB y el autor la describe como el artefacto de cliente para despliegue en CPU, lo que habilita servir el answerer en hardware modesto o en el borde.
- Servicio en GPU de gama baja o Apple Silicon: la variante Q8_0 de 1,72 GiB está pensada para Metal/GPU y cabe holgadamente en cualquier GPU de consumo actual.
- Extracción de datos numéricos de informes: con una recall de figuras de 0,81 en texto plano, es adecuado para localizar importes, fechas y métricas en documentos financieros o técnicos, siempre con cita verificable.
- Rollback controlado en producción: el autor mantiene el artefacto en el hub para poder revertir con una sola línea (`TAG=v7 bash labs/fetch_prod.sh`), lo que lo convierte en la pieza de contingencia del pipeline ocrrag.
- Evaluación de pipelines RAG: al estar medido sobre un test fijo de 108 filas (64 respondibles, 44 vacías), sirve como referencia para comparar cambios en el retriever o en el prompt.

## Benchmarks y rendimiento

Resultados medidos sobre el mismo test de 108 filas (64 respondibles, 44 vacías):

| Artefacto | Estructurado | Sobre-rechazo | Rechazo en vacías | Citadas | Similitud | Cifras fuera de ventana | p50 |
|---|---|---|---|---|---|---|---|
| v3 Q8_0 | 108/108 | 1/64 (2%) | 38/44 (86%) | 63/63 | 0,59 | 1 | 16,0 s |
| v6 Q8_0 | 108/108 | 26/64 (41%) | 37/44 (84%) | 38/38 | 0,63 | 0 | 15,4 s |
| v7 Q8_0 | 108/108 | 2/64 (3%) | 42/44 (95%) | 62/62 | 0,63 | 0 | 9,1 s |
| v7 Q4_K_M | 108/108 | 3/64 (5%) | 42/44 (95%) | 61/61 | 0,60 | 0 | 11,2 s |

Recall de cifras (figuras doradas presentes): v7 Q8_0 obtiene 0,81 en texto plano, 0,40 en tablas y 0,56 global; v7 Q4_K_M obtiene 0,81, 0,44 y 0,58 respectivamente. El autor advierte que las latencias entre versiones no son comparables porque las ejecuciones de v3 y v6 compartieron máquina con otros tres modelos, mientras que las de v7 no; dentro de un mismo día, los 9,1 s de Q8_0 y los 11,2 s de Q4_K_M sí son comparables entre sí.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,0 GiB para Q4_K_M y 1,7 GiB para Q8_0 solo en pesos; añadir el espacio de contexto KV para 8192 tokens según la implementación.
- GPU recomendadas: no se especifican modelos concretos; la variante Q8_0 está destinada a Metal/GPU y la Q4_K_M a CPU.
- Cabe en cualquier GPU de consumo: con menos de 2 GiB de pesos, es viable en RTX 3060, RTX 4060, RTX 4090 y en memoria unificada de Apple Silicon.
- Despliegue: el autor documenta `llama-server` con `-ngl 99 -c 8192 --jinja --temp 0 -np 1 --port 8081`; al ser GGUF, es compatible con llama.cpp y con los runners que lo envuelven (Ollama, entre otros). No se mencionan vLLM ni TGI.
- Latencia: p50 de 9,1 s con Q8_0 y 11,2 s con Q4_K_M sobre el test de 108 filas, en las condiciones descritas por el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ocrrag-lfm3-plain-gguf-v7 | 1,73B | 8192 (servicio) | Answerer extractivo con rechazo tipado | no disponible | GGUF en HF |
| ocrrag-lfm3-plain-gguf-v9 | no disponible | no disponible | Sucesor directo de v7, corrige el fallo con el prompt en prosa | no disponible | GGUF en HF |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | Modelo base de propósito general | no disponible | HF |

La comparación más relevante es interna a la familia: el propio autor declara v7 superado por v9 y documenta que, con el prompt en prosa que sirve el producto (2437 caracteres, sha256 `36a0d43a601f8318`), v7 rechaza 334 de 351 filas. No se dispone de datos de benchmarks frente a modelos de otros autores.

## Limitaciones y advertencias

- Versión superada: el autor indica explícitamente que v9 reemplaza a v7; usar v7 en un despliegue nuevo no está recomendado.
- Fallo documentado con el prompt de producción: sobre el prompt en prosa servido por el producto, rechaza 334 de 351 filas, lo que lo inutiliza para ese formato de entrada.
- Dependencia estricta del prompt: debe enviarse byte a byte el prompt de entrenamiento (2530 caracteres, sha256 `5449aca38687225a`); cualquier variación degrada el comportamiento.
- Recall bajo en tablas: 0,40-0,44, porque la respuesta debe nombrar fila y columna; el autor lo señala como el problema abierto.
- Filas descartadas en entrenamiento: 118 de 2268 (5,2%) se eliminaron por exceder `max_length 6144`, justo las ventanas con tablas más largas, que es donde peor rinde.
- Decisión de rechazo: el autor recomienda delegar el binomio responder/rechazar en el reranker libre y reservar este adaptador para la generación del texto.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base LFM3-1.7B y del adaptador antes de producción.
- Idiomas soportados no disponibles: no hay garantía documentada de comportamiento multilingüe.
- Riesgo de alucinación mitigado pero no eliminado: la gramática sobre `{"answer", "refusal"}` es una garantía de formato, no de veracidad; las cifras fuera de ventana se midieron en 0, pero la recall numérica global es de 0,56-0,58.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-gguf-v7
- Versión sucesora: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-gguf-v9
- Adaptador LoRA: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-lora-v7
- Dataset de entrenamiento: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-data-v7
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documento del defecto con el prompt en prosa: `docs/experiments/2026-11-09-plain-v9-stand.md` (referenciado en la model card; no se proporciona URL)
- Documento de la corrección: `docs/experiments/2026-11-09-plain-v9-sft.md` (referenciado en la model card; no se proporciona URL)

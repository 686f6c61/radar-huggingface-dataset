# latentport/LPBridge-Qwen3.5-4b-Qwen3.8-27b

## Resumen

LPBridge-Qwen3.5-4b-Qwen3.8-27b es un puente de transferencia de estado (state-transfer bridge) desarrollado por latentport que permite continuar en Qwen3.8-27B una conversación iniciada en Qwen3.5-4B. No es un modelo de lenguaje en sentido estricto: es un conjunto de parámetros de inferencia (662 millones de parámetros, 5,3 GB en el repositorio) que traduce las claves y valores de atención, el historial de convolución, la memoria recurrente y el estado oculto terminal del modelo pequeño al espacio de representación del modelo grande.

El artefacto resuelve un problema concreto de ingeniería: evitar recalcular en un modelo de 27B todo el prefill de un contexto ya procesado por un modelo de 4B, o permitir que una sesión iniciada con el modelo ligero continúe con el modelo grande sin perder el hilo. El checkpoint publicado es el paso 64 de la variante L127 MIXED_TUNED, con correcciones separadas para modo thinking activado y desactivado.

La relevancia es doble: por un lado, abre la puerta a arquitecturas híbridas donde un modelo pequeño hace de front-end y uno grande de back-end; por otro, exige un runtime específico (LatentPort) y ambos modelos base descargados por separado, lo que lo convierte en una pieza de infraestructura más que en un modelo listo para usar. La licencia es Apache 2.0 y el formato de pesos es safetensors más un GGUF para el backend GGUF del runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Puente de transferencia de estado sobre transformers (traduce KV, historial de convolución, memoria recurrente y estado oculto terminal) |
| Parámetros totales | 662.048.891 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | nf4, bf16 (backend del runtime); GGUF para el backend gguf |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (`bridge/translator.F32.gguf`) |

## Arquitectura y entrenamiento

El puente opera sobre dos modelos base con arquitecturas presumiblemente híbridas (el material menciona "convolution history" y "recurrent memory", lo que sugiere componentes convolucionales y recurrentes junto a atención). El bridge traduce cuatro tipos de estado: claves y valores de atención, historial de convolución, memoria recurrente y estado oculto terminal. El checkpoint corresponde al paso 64 de la variante L127 MIXED_TUNED, con correcciones diferenciadas para thinking on y thinking off, lo que indica un ajuste supervisado sobre pares de estados fuente-destino.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El repositorio incluye `latentport.json` con revisiones, nombres de fichero y hashes de los modelos base, lo que permite reproducibilidad y verificación de integridad. Los ficheros safetensors contienen los parámetros del grafo de inferencia y estadísticas de población; el GGUF almacena los mismos tensores para el backend GGUF.

## Capacidades

- Transferencia direccional de estado de Qwen3.5-4B a Qwen3.8-27B para continuar una conversación sin recalcular el prefill en el modelo grande.
- Traducción de claves y valores de atención entre espacios latentes de distinta dimensión.
- Transferencia de historial de convolución y memoria recurrente, lo que sugiere soporte para arquitecturas con estado persistente.
- Transferencia del estado oculto terminal para continuidad de la generación.
- Dos modos de corrección: thinking on y thinking off, seleccionables mediante `thinking=True`.
- Tres backends de inferencia: `nf4`, `bf16` y `gguf`.
- No es un modelo generativo: no produce texto por sí mismo, sino que habilita la continuación en el modelo destino.

## Casos de uso

- Enrutamiento en cascada coste-calidad: un modelo de 4B atiende los primeros turnos de una conversación y, cuando la consulta se complica, el puente transfiere el estado a Qwen3.8-27B para que continúe con mayor capacidad sin repetir el contexto. Reduce el coste de prefill en el modelo grande.
- Continuidad de sesión en asistentes de larga duración: sesiones que empiezan con un modelo ligero en el edge y migran a un modelo grande en cloud conservan el estado conversacional gracias a la transferencia de KV y estado oculto.
- Evaluación comparativa de modelos: permite comparar la calidad de respuesta de 4B y 27B sobre exactamente el mismo estado de contexto, aislando el efecto del tamaño del modelo del de la formulación del prompt.
- Investigación en interpretabilidad de espacios latentes: el puente expone explícitamente las transformaciones entre espacios de representación de dos modelos, lo que facilita estudiar alineación de representaciones y similitud de espacios latentes.
- Prototipado de arquitecturas híbridas: desarrolladores que quieran experimentar con pipelines pequeño→grande pueden usar el puente como componente listo en lugar de entrenar su propia traducción de estados.
- Reducción de latencia en despliegues multi-modelo: al evitar el reprocesamiento del contexto en el modelo de 27B, se reduce el tiempo hasta el primer token en la fase de continuación, útil en aplicaciones interactivas con presupuesto de latencia estricto.
- Fine-tuning con arranque en caliente: inicializar el estado de un modelo grande con el de uno pequeño ya ajustado para una tarea, acelerando la convergencia en escenarios de adaptación de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM del puente: 5,3 GB en el repositorio; en bf16 el puente ocupa aproximadamente 1,3 GB (662 M de parámetros × 2 bytes), y en nf4 alrededor de 0,4 GB.
- VRAM total necesaria: la del puente más la de ambos modelos base. Qwen3.5-4B en bf16 requiere unos 8 GB; Qwen3.8-27B en bf16 requiere unos 54 GB (sin contar overhead de KV cache), y en nf4 unos 14-16 GB.
- GPU recomendadas: para el pipeline completo en bf16, A100 80 GB o H100 80 GB. Para el pipeline con el modelo grande cuantizado en nf4, una RTX 4090 de 24 GB puede ser suficiente si el modelo de 4B se mantiene en nf4 o se descarga tras la captura.
- Cabe en consumer GPU: sí, en configuración nf4 con RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que se gestione la memoria de ambos modelos base simultáneamente.
- Opciones de despliegue: exclusivamente mediante el runtime LatentPort (backends `nf4`, `bf16`, `gguf`). No hay soporte indicado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La ganancia esperada proviene de evitar el prefill del contexto en el modelo de 27B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LPBridge-Qwen3.5-4b-Qwen3.8-27b | Puente de estado | 662 M | no disponible | Apache 2.0 | Hugging Face + runtime LatentPort |
| Qwen3.5-4B | LLM base | 4 B (aprox.) | no disponible | no disponible en esta ficha | Hugging Face |
| Qwen3.8-27B | LLM base | 27 B (aprox.) | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas de state-transfer | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información proporcionada otros puentes de transferencia de estado comparables publicados. La comparativa directa con modelos de lenguaje de la misma categoría no aplica, porque el artefacto no genera texto de forma autónoma.

## Limitaciones y advertencias

- Dependencia estricta del runtime LatentPort: sin él, los pesos no son utilizables. No hay soporte para ecosistemas estándar como transformers, vLLM o llama.cpp.
- Requiere descargar por separado ambos modelos base (Qwen3.5-4B y Qwen3.8-27B) y respetar las revisiones y hashes indicados en `latentport.json`; cualquier desviación puede invalidar la transferencia.
- La transferencia es direccional: solo de 4B a 27B, no al revés.
- El puente está ajustado al paso 64 de una variante concreta (L127 MIXED_TUNED); no se documenta su robustez ante cambios de prompt, dominios o longitudes de contexto distintas de las de entrenamiento.
- Los modos thinking on y off tienen correcciones separadas; usar el modo equivocado puede degradar la calidad de la continuación.
- Riesgo de deriva semántica: al traducir estados entre espacios latentes distintos, la información puede perderse o distorsionarse, especialmente en contextos largos o con referencias anafóricas complejas.
- Sin datos de benchmarks ni de evaluación de calidad de la continuación; no hay evidencia publicada de la fidelidad de la transferencia.
- Sin información sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- Uso comercial permitido por la licencia Apache 2.0 del puente, pero sujeta a las licencias de los modelos base, que no se detallan en esta ficha.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/latentport/LPBridge-Qwen3.5-4b-Qwen3.8-27b
- Runtime LatentPort: https://github.com/LatentPort/latentport
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B

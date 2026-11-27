# nzxjx827/ctx-compressor-qwen3-1.7b

## Resumen

ctx-compressor-qwen3-1.7b es un modelo de compresion extractiva de contexto desarrollado por el usuario nzxjx827 (Nevernzx) sobre la base de Qwen3-1.7B de Alibaba. Su funcion no es generar texto ni responder preguntas, sino actuar como un modulo auxiliar dentro de agentes de busqueda multi-paso: tras cada llamada a una herramienta de recuperacion, decide que pasajes nuevos incorporar al contexto y cuales descartar, respetando un presupuesto de tokens. Devuelve exclusivamente identificadores en formato JSON, sin reescribir el texto original, lo que garantiza la trazabilidad de cada pasaje conservado hasta su fuente.

El modelo resuelve un problema concreto y costoso en produccion: el crecimiento descontrolado del contexto en agentes ReAct y pipelines RAG, que dispara el coste de tokens de entrada en APIs comerciales y degrada la calidad por acumulacion de ruido. Al ser un componente desacoplado del LLM principal, puede colocarse delante de cualquier modelo via API sin modificarlo. Segun los resultados reportados por el autor, en un agente ReAct real con DeepSeek como modelo principal mejora el F1 de 61,9 a 63,1 y reduce el coste real de API de 0,0250 a 0,0079 CNY por tarea.

La relevancia actual del modelo reside en su enfoque: en lugar de comprimir texto con tecnicas de resumen o destilacion (como LLMLingua-2, que en las pruebas del autor cae a 54,9 de F1), opta por seleccion seleccionar pasajes completos, preservando la fidelidad factica. El modelo tiene 1.720.574.976 parametros, se distribuye en safetensors bf16 (repo de 3,5 GB) y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con LoRA SFT + LoRA GRPO fusionados |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; el autor no la declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; sin GGUF oficial) |
| Idiomas soportados | en, zh (plantilla de prompt fija en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, y le aplica un ajuste en dos fases. Primero un SFT con LoRA entrenado sobre acciones oracle y DAgger, y despues un LoRA adicional entrenado con GRPO (Group Relative Policy Optimization) que se fusiona en los pesos. El resultado se guarda como un unico modelo bf16. El autor publica ademas una variante LoRA sin fusionar (`ctx-compressor-qwen3-1.7b-lora` en ModelScope) que reproduce exactamente los numeros reportados; la version fusionada coincide con el despliegue LoRA en el 94,6% de 1.731 llamadas reproducidas, frente al 97,1% de autoconsistencia del propio despliegue LoRA con decodificacion greedy en vLLM.

Los datos de entrenamiento provienen de MuSiQue-Ans: se combinan cuatro preguntas multi-hop en una sola tarea y cada salto se recupera con BM25 top-k, generando trayectorias con acciones oracle. El modelo se entrena para emitir JSON con las claves `add` y `drop`, operando en dos modos: `reselect` (permite descartar pasajes ya conservados) y `append` (solo anade, manteniendo estable el prefijo del prompt para conservar aciertos de cache). La inferencia se realiza con plantilla de chat de Qwen, `enable_thinking=False`, decodificacion greedy y `max_new_tokens=256`.

## Capacidades

- Compresion extractiva de contexto: selecciona pasajes completos por identificador, sin reescribir ni resumir texto.
- Salida estructurada en JSON con acciones `add` y `drop` sobre identificadores de pasaje.
- Gestion de presupuesto de tokens: recibe el presupuesto total y los tokens ya consumidos, y valida que la accion no lo exceda.
- Dos modos operativos: `reselect` (seleccion completa con descarte) y `append` (solo adicion, compatible con cache de prompt).
- Integracion desacoplada: funciona como modulo previo a cualquier LLM principal, incluidos modelos propietarios via API.
- Soporte de tareas multi-hop: entrenado explicitamente con preguntas encadenadas de MuSiQue.
- Multilingue limitado a ingles y chino, con plantilla de entrada fija en chino.
- No soporta tool calling propio, ni vision, ni audio, ni modo de razonamiento extendido.

## Casos de uso

- Agentes de busqueda multi-paso: tras cada llamada a una herramienta de recuperacion, el modelo decide que pasajes incorporar y cuales descartar, manteniendo el contexto del agente acotado y reduciendo el coste por tarea (de 0,0250 a 0,0079 CNY en las pruebas del autor con DeepSeek).
- Pipelines RAG con presupuesto de contexto fijo: en lugar de concatenar todos los fragmentos recuperados, el compresor selecciona los que caben en el presupuesto y maximizan la cobertura de la pregunta, lo que reduce el ruido de entrada al LLM generador.
- Reduccion de coste en APIs comerciales: al colocarse delante de un modelo propietario, recorta los tokens de entrada facturados sin cambiar el proveedor ni el modelo principal; el autor reporta una reduccion de coste de aproximadamente 3 veces en el escenario evaluado.
- Cache de prompt en produccion: el modo `append` mantiene estable el prefijo del prompt, de modo que los aciertos de cache del proveedor se conservan mientras se anaden solo los pasajes necesarios.
- Sistemas de respuesta con trazabilidad: al no reescribir texto, cada pasaje conservado puede auditarse contra su fuente original, lo que resulta adecuado en dominios con requisitos de verificabilidad (legal, sanitario, documentacion tecnica).
- Investigacion en agentes y recuperacion: sirve como componente reproducible para experimentar con politicas de seleccion de evidencia, con codigo, datos y script de evaluacion publicados en el repositorio del autor.
- Filtrado de contexto en asistentes de documentacion: dado un conjunto de fragmentos recuperados de un corpus interno, el modelo descarta los irrelevantes antes de pasarlos al modelo generador, reduciendo latencia y consumo.

## Benchmarks y rendimiento

Resultados reportados por el autor (ejecuciones unicas, despliegue LoRA).

Conjunto de test bloqueado: trayectorias fijas de MuSiQue-dev con Qwen3-8B como lector, 10.824 celdas pregunta emparejadas.

| Metodo | F1 | Coste de entrada cacheado por trayectoria |
|---|---|---|
| Sin compresion | 23,5 | 34.649 |
| Reranker ajustado con los mismos datos (Qwen3-Reranker-0.6B) | 24,0 | 1.676 |
| Este modelo | 44,9 | 2.316 |
| Oracle (cota superior) | 54,3 | 2.109 |

Agente ReAct real con DeepSeek como modelo principal y BM25 como herramienta de busqueda: 339 preguntas de MuSiQue, HotpotQA y 2Wiki (HotpotQA y 2Wiki no usados en entrenamiento).

| Metodo | F1 | Coste real de API (CNY / tarea) |
|---|---|---|
| Sin compresion | 61,9 | 0,0250 |
| LLMLingua-2 | 54,9 | 0,0334 |
| Reranker ajustado | 49,6 | 0,0084 |
| Este modelo (modo append) | 63,1 | 0,0079 |

El autor advierte que con un modelo principal mas debil (Qwen3-8B) este compresor solo empata con el reranker ajustado, y remite al README de GitHub para limitaciones detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por tamano (1,7B parametros), en bf16 requiere aproximadamente 3,5 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 2 GB y en 4 bits alrededor de 1 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); para despliegue en vLLM se recomienda A100, H100 o L40S por throughput agregado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (referencia del autor), vLLM (usado en las evaluaciones reportadas), TGI (etiqueta `text-generation-inference` presente en el repo). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan conversion propia.
- Latencia y throughput: no disponibles. El autor solo reporta que la decodificacion greedy en vLLM varia con la composicion del lote (97,1% de autoconsistencia en la repeticion de su propio log).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ctx-compressor-qwen3-1.7b | 1,7B | Compresion extractiva por seleccion de pasajes | No declarado | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3-Reranker-0.6B (ajustado) | 0,6B | Reranking de pasajes | No declarado | No disponible en la informacion | Hugging Face |
| LLMLingua-2 | No disponible | Compresion extractiva por destilacion de tokens | No disponible | No disponible en la informacion | Repositorio Microsoft |

En el test bloqueado, este modelo supera al reranker ajustado (F1 44,9 frente a 24,0) y a la ausencia de compresion (23,5), quedando por debajo de la cota oracle (54,3). En el agente ReAct real supera a LLMLingua-2 (63,1 frente a 54,9) y al reranker (49,6). Los datos de la comparativa proceden exclusivamente de las tablas publicadas por el autor.

## Limitaciones y advertencias

- Solo funciona bien con modelos principales fuertes: con Qwen3-8B como modelo principal solo empata con el reranker ajustado, segun el propio autor.
- La plantilla de entrada esta fijada en chino; aunque los pasajes pueden estar en ingles, el prompt de sistema y las etiquetas no estan adaptados al castellano.
- Idiomas soportados declarados: solo ingles y chino. No hay evidencia de rendimiento en castellano.
- Riesgo de salidas invalidas: en la reproduccion de 1.731 llamadas, la version fusionada genero 4 salidas invalidas frente a 1 del despliegue LoRA; el protocolo de evaluacion descarta la accion y mantiene el contexto si el JSON es invalido o excede el presupuesto.
- La fusion del LoRA altera decisiones: coincide con el despliegue LoRA en el 94,6% de las llamadas, con perdida ligeramente mayor de evidencia (35 frente a 36 pasajes) y mas pasajes irrelevantes conservados (286 frente a 280).
- No reescribe ni resume: si el pasaje relevante es demasiado largo para el presupuesto, no puede comprimirlo, solo descartarlo.
- Sin datos publicados sobre sesgos, alucinacion (no genera texto libre, pero puede seleccionar pasajes irrelevantes) ni comportamiento fuera del dominio de MuSiQue, HotpotQA y 2Wiki.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay validacion independiente de los resultados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B conserva sus propios terminos, que deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/nzxjx827/ctx-compressor-qwen3-1.7b
- ModelScope: https://www.modelscope.ai/models/never0214/ctx-compressor-qwen3-1.7b
- Variante LoRA en ModelScope: https://www.modelscope.ai/models/never0214/ctx-compressor-qwen3-1.7b-lora
- Repositorio GitHub (codigo, datos y experimentos): https://github.com/Nevernzx/ctx-compressor
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B

# IMLIULIAN/qwen3.5-4b-memory-v2

## Resumen

Qwen3.5-4B-Memory-V2 es un ajuste fino derivado de Qwen/Qwen3.5-4B desarrollado por el usuario IMLIULIAN, publicado bajo licencia Apache-2.0. No es un modelo de propósito general, sino un especialista en dos tareas concretas dentro de un pipeline de memoria para asistentes de IA locales: la extraccion estructurada de hechos atomicos en JSON estricto y la admision y revision de hechos candidatos antes de su escritura en memoria. El modelo parte de una base de 4.000 millones de parametros y se adapta mediante PEFT LoRA con rango 16 y alpha 32, lo que permite distribuir el adaptador (81 MB) por separado de los pesos base.

La relevancia del modelo radica en su enfoque en fiabilidad estructural mas que en capacidades generativas amplias. Segun la model card, el ajuste eleva la tasa de validez de esquema JSON del 45% (modelo base) al 100% en la tarea de extraccion, y la precision por slot en la tarea de admision del 0% al 97,3% con cuantizacion Q8_0. Ademas, reduce la latencia media de extraccion de 23,81 s a 11,64 s respecto al base en Q4_K_M, un aspecto critico para pipelines que ejecutan extraccion de memoria en cada turno de conversacion.

El modelo esta pensado para despliegue local en Ollama o llama.cpp, con artefactos GGUF en Q8_0 (4,48 GB) y Q4_K_M (2,71 GB), y con recomendaciones de inferencia determinista (temperature 0, think false, num_ctx 16384). Su alcance linguistico declarado es chino e ingles, y su ventana de contexto operativa recomendada es de 16.384 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-4B) con adaptador PEFT LoRA |
| Parametros totales | 4.000 millones (modelo base Qwen3.5-4B); adaptador LoRA de 81 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (num_ctx recomendado) |
| Tipos de cuantizacion | GGUF Q8_0 (recomendado, 4,48 GB) y Q4_K_M (compacto, 2,71 GB); adaptador LoRA en safetensors |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0, Q4_K_M) y PEFT LoRA safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parametros, y se especializa mediante un adaptador PEFT LoRA con rango 16 y alpha 32. No se modifica la arquitectura base: el ajuste se aplica como delta sobre los pesos originales, lo que permite mantener el modelo base intacto y distribuir el adaptador por separado (81 MB). Los artefactos GGUF publicados integran el adaptador en los pesos cuantizados para su uso directo en Ollama o llama.cpp.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card si especifica que el ajuste se orienta a dos tareas: extraccion de hechos atomicos con IDs de evidencia a nivel de segmento (s0, s1, ...) y separacion entre fecha de registro y fecha efectiva del evento; y admision de hechos pre-escritura con veredictos por slot (pass, revise, drop, hold). La validacion se realizo sobre una suite congelada de 50 casos con salida JSON no restringida, y el autor publica scripts de verificacion sintetica en GitHub.

## Capacidades

- Extraccion estructurada de hechos atomicos en JSON con cumplimiento estricto de esquema (100% de validez de esquema en la suite de validacion de 50 casos).
- Asignacion de IDs de evidencia a nivel de segmento (s0, s1, ...) para trazabilidad de cada hecho extraido.
- Separacion explicita entre fecha de registro del hecho y fecha efectiva del evento.
- Admision y revision de hechos candidatos antes de escritura, con veredictos por slot: pass, revise, drop, hold.
- Generacion de reemplazos concisos y fieles para errores definidos en hechos candidatos.
- Salida JSON determinista con temperature 0 y think desactivado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible como capacidad generica; el modelo esta especializado en tareas puntuales de pipeline.
- Capacidades multilingues limitadas a chino e ingles segun la model card.
- Capacidad de vision, audio o thinking mode: no disponible (think debe desactivarse segun la configuracion recomendada).

## Casos de uso

- Pipeline de memoria para asistentes conversacionales locales: el modelo extrae hechos atomicos de cada turno con IDs de evidencia y los estructura en JSON, permitiendo almacenar memoria a largo plazo con trazabilidad hacia el texto original. Es adecuado por su 100% de validez de esquema y su latencia reducida (11,64 s en Q4_K_M frente a 23,81 s del base).

- Auditoria de hechos antes de escritura en bases de datos de memoria: el modelo revisa hechos candidatos contra los segmentos de evidencia originales y emite veredictos pass/revise/drop/hold con una precision por slot del 97,3% en Q8_0, lo que evita contaminar la memoria con hechos erroneos.

- Correccion automatica de hechos con errores definidos: cuando el veredicto es revise, el modelo genera un reemplazo conciso y fiel al texto fuente, con una tasa de intercepcion de errores del 90,5% en Q8_0.

- Sistemas de memoria personal para agentes de escritorio: al ejecutarse en Ollama o llama.cpp con 2,71 GB en Q4_K_M, cabe en equipos de consumo y permite mantener un pipeline de memoria local sin dependencia de APIs externas.

- Extraccion de entidades y relaciones con fechas en dominios documentales: la separacion entre fecha de registro y fecha efectiva del evento resulta util en dominios como historial clinico, registros legales o seguimiento de proyectos, donde ambas fechas difieren.

- Filtrado de ruido en ingesta de conocimiento: el modelo descarta hechos no sustentados por evidencia (drop) y retiene hechos limpios con una tasa de retencion del 98,9% en Q8_0, lo que lo hace util para curation automatica de bases de conocimiento.

- Validacion de pipelines JSON en produccion: dado que el modelo mantiene el 100% de validez de esquema en extraccion y el 96,7-100% en admision, puede integrarse como paso de validacion estructural en flujos que exigen salida parseable sin post-procesado correctivo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre una suite de validacion congelada de 50 casos con JSON no restringido:

| Metrica | Qwen3.5-9B (raw) | Qwen3.5-4B (raw Q4_K_M) | V2 (Q4_K_M) | V2 (Q8_0) |
|---|---|---|---|---|
| Tasa de esquema valido en extraccion | 45,0% | 45,0% | 100,0% | 100,0% |
| Fugas de fecha de registro en extraccion | 7 | 5 | 0 | 0 |
| F1 de evidencia en extraccion | 0,4218 | 0,4287 | 0,6517 | 0,7006 |
| Latencia media de extraccion | 43,11 s | 23,81 s | 11,64 s | 13,55 s |
| Tasa de esquema valido en admision | 20,0% | 0,0% | 96,7% | 100,0% |
| Precision por slot en admision | 33,0% | 0,0% | 93,6% | 97,3% |
| Intercepcion de errores (revise) en admision | 0,0% | 0,0% | 71,4% | 90,5% |
| Retencion de pass limpio en admision | 40,9% | 0,0% | 98,9% | 98,9% |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K u otros benchmarks de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,71 GB en Q4_K_M y 4,48 GB en Q8_0 para los pesos; anadir margen para el contexto de 16.384 tokens y el runtime.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cualquier GPU consumer con al menos 6-8 GB de VRAM deberia poder ejecutar la variante Q4_K_M.
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas de VRAM para Q4_K_M; 8 GB o mas para Q8_0 con contexto completo.
- Opciones de despliegue: Ollama y llama.cpp (recomendados por el autor); el adaptador LoRA en safetensors permite despliegue con PEFT sobre el modelo base, aunque la model card no detalla soporte en vLLM o TGI.
- Latencia y throughput: latencia media de extraccion de 11,64 s (Q4_K_M) y 13,55 s (Q8_0) por caso en la suite de validacion de 50 casos; throughput no disponible.
- Configuracion recomendada: think=false, temperature=0, presence_penalty=0, top_p=0.95, top_k=20, num_ctx=16384.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Esquema valido (extraccion) | Precision slot (admision) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Memory-V2 (Q8_0) | 4B + LoRA r=16 | 16.384 | 100,0% | 97,3% | Apache-2.0 | GGUF + LoRA en HF |
| Qwen3.5-4B (raw Q4_K_M) | 4B | no disponible | 45,0% | 0,0% | Apache-2.0 | HF |
| Qwen3.5-9B (raw) | 9B | no disponible | 45,0% | 33,0% | Apache-2.0 | HF |

La comparativa se limita a los modelos incluidos en la suite de validacion del autor. No se dispone de datos comparativos frente a otros especialistas en extraccion de memoria o modelos de proposito general de tamano similar.

## Limitaciones y advertencias

- Modelo especializado: no esta disenado para generacion general, razonamiento abierto ni codigo; su uso fuera de las tareas de extraccion y admision de hechos no esta validado.
- Idiomas limitados a chino e ingles; el castellano no figura entre los idiomas soportados.
- La validacion se realizo sobre una suite congelada de 50 casos, un tamano reducido que limita la generalizacion de las metricas publicadas.
- La tasa de intercepcion de errores en admision es del 71,4% en Q4_K_M, lo que implica que aproximadamente un 28,6% de errores definidos no se corrigen en esa cuantizacion; Q8_0 sube al 90,5%.
- Riesgo de alucinacion en hechos no sustentados por evidencia; el propio pipeline de admision existe para mitigarlo, por lo que se recomienda no omitir esa fase.
- No hay informacion sobre sesgos conocidos del modelo base ni sobre el dataset de ajuste (composicion, procedencia, filtrado).
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-4B; conviene verificar los terminos del modelo base en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- La configuracion recomendada exige think=false; activar el modo thinking puede degradar el cumplimiento de esquema.
- El repositorio GitHub indicado en la model card debe verificarse antes de confiar en los scripts de validacion publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IMLIULIAN/qwen3.5-4b-memory-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio GitHub con guias, contratos de system prompt, plantillas Modelfile y scripts de verificacion: https://github.com/lifdjgfndgn/qwen3.5-4b-memory-v2

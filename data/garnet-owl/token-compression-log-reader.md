# Garnet-Owl/token-compression-log-reader

## Resumen

Garnet-Owl/token-compression-log-reader es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por James Wanjiku (Garnet-Owl) sobre el modelo base Qwen/Qwen3-1.7B. Su proposito es responder preguntas sobre logs de servidor almacenados en un formato de plantilla comprimido, de modo que el prompt consuma aproximadamente un 25 % menos tokens que el log original sin perder precision. Forma parte del proyecto open source token-compression alojado en GitHub.

El adaptador resuelve un problema concreto de eficiencia de contexto: los logs son voluminosos y repetitivos, y enviarlos completos a un LLM encarece la inferencia y agota la ventana de contexto. La solucion propuesta es un compresor sin perdida que factoriza las lineas repetidas en plantillas mas filas de valores cortas, combinado con un ajuste fino del modelo para que interprete ese formato comprimido directamente, sin necesidad de una leyenda explicativa.

Se trata de un adaptador de investigacion, no de una herramienta de produccion. El modelo base Qwen3-1.7B aporta la arquitectura transformer densa y el conocimiento general, mientras que el LoRA (rank 32, alpha 64 sobre todas las capas lineales, unos 35 millones de parametros entrenables) anade la capacidad especifica de leer logs comprimidos y responder tres tipos de pregunta: localizar una peticion por request_id, encontrar la duracion maxima y contar lineas ERROR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones (modelo base) + ~35 millones entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; la model card menciona carga en fp16 y fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer denso de 1.700 millones de parametros. El LoRA se configura con rank 32 y alpha 64 sobre todas las capas lineales, lo que resulta en aproximadamente 35 millones de parametros entrenables. No se modifica la arquitectura del modelo base; el adaptador anade pesos de bajo rango que ajustan el comportamiento del modelo hacia la tarea de lectura de logs comprimidos.

El entrenamiento empleo 1.470 preguntas sinteticas sobre logs, con aproximadamente un 80 % de logs comprimidos sin leyenda y un 20 % de logs originales. La perdida se calculo solo sobre los tokens de respuesta. Se realizo una sola pasada con tasa de aprendizaje 2e-4 y schedule cosine, empaquetado de lotes por presupuesto de tokens y gradient checkpointing, todo en una unica GPU T4 de 16 GB durante unos 44 minutos. Los scripts estan disponibles en el repositorio del proyecto. El compresor de logs es un componente separado, sin perdida, implementado en `app/structured_compression/compressor.py` dentro del repositorio de GitHub.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre logs de servidor en formato de plantilla comprimido.
- Localizacion de peticiones por request_id, devolviendo codigo de estado y duracion en milisegundos.
- Extraccion del valor maximo de duracion entre las lineas del log.
- Conteo de lineas ERROR (capacidad presente pero poco fiable, segun el autor).
- Interpretacion de logs comprimidos sin necesidad de una leyenda explicativa en el prompt.
- Funcionamiento tambien sobre logs sin comprimir (formato original), aunque el beneficio de tokens desaparece.
- Respuesta en formato corto y determinista (se recomienda decodificacion greedy y `enable_thinking=False`).
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido mas alla del que ofrece el modelo base.

## Casos de uso

- Monitorizacion de servidores con presupuesto de contexto ajustado: el adaptador permite enviar logs comprimidos (un 25 % menos tokens) a un LLM y obtener respuestas directas sobre estado y latencia, reduciendo el coste por consulta en pipelines de observabilidad.
- Busqueda de peticiones concretas en registros de acceso: dada una pregunta sobre un request_id, el adaptador devuelve el codigo HTTP y la duracion, lo que facilita la triage de incidencias en produccion sin necesidad de herramientas de busqueda adicionales.
- Analisis de latencia: permite localizar la peticion con mayor duration_ms en un bloque de log, util para detectar cuellos de botella en APIs REST.
- Conteo de errores en ventanas de log: aunque el propio autor advierte que el conteo es la capacidad mas debil (31 % de acierto en logs comprimidos), puede usarse como senal aproximada en alertas tempranas combinada con verificacion posterior.
- Automatizacion de resumenes de incidentes: el adaptador puede integrarse en un script que reciba un log comprimido y devuelva respuestas puntuales, sirviendo como primer filtro antes de escalar a un analista humano.
- Evaluacion de tecnicas de compresion de prompts: investigadores pueden usar este adaptador como referencia para medir como el ajuste fino compensa la perdida de precision al comprimir contexto, replicando el experimento con otros formatos de log.
- Prototipado de asistentes de operaciones (SRE): el modelo puede desplegarse en local sobre CPU o GPU modestas para consultas ad hoc sobre logs, dado su tamano reducido y su licencia permisiva.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test de 150 logs nuevos de 30 lineas, con tres tipos de pregunta (localizar una peticion, duracion maxima, contar lineas ERROR):

| Modelo y formato de log | Acierto | Tokens de prompt |
|---|---|---|
| Qwen3-1.7B base, log original | 33 % | 1.459 |
| Qwen3-1.7B base, log comprimido con leyenda corta | 16 % | 1.147 |
| Este adaptador, log original | 77 % | 1.459 |
| Este adaptador, log comprimido, sin leyenda | 73 % | 1.090 |

El autor senala que, con 150 preguntas, la diferencia de 4 puntos entre las dos ultimas filas esta dentro del ruido estadistico. Por tipo de pregunta sobre logs comprimidos: 100 % en localizacion de peticiones, 90 % en duracion maxima y 31 % en conteo de lineas ERROR. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.700 millones de parametros en fp16 ocupa aproximadamente 3,4 GB; con el adaptador LoRA (~35 millones de parametros) el incremento es marginal. En fp32, alrededor de 6,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; el entrenamiento se realizo en una T4 de 16 GB. Para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o equivalentes.
- Cabe en GPU consumer: si, en tarjetas de gama media con 8 GB o mas, y tambien en CPU (carga en fp32 sin `device_map`, segun la model card, con rendimiento lento).
- Opciones de despliegue: transformers + PEFT (metodo documentado), llama.cpp/Ollama mediante conversion a GGUF no esta documentado en la informacion disponible; vLLM y TGI no estan mencionados en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento completo tardo unos 44 minutos en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Garnet-Owl/token-compression-log-reader | 1.700 M (base) + ~35 M LoRA | no disponible | Lectura de logs comprimidos por plantilla | apache-2.0 | Hugging Face (14 descargas) |
| Qwen/Qwen3-1.7B (base) | 1.700 M | no disponible en esta ficha | Modelo generalista de texto | apache-2.0 | Hugging Face |
| Adaptadores LoRA especializados en logs | no disponible | no disponible | Analisis de logs generico | variable | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada; la unica comparacion publicada es la del adaptador frente a su propio modelo base, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente con logs generados sinteticamente, de un unico formato y una sola semilla aleatoria; los logs reales son mas heterogeneos y pueden degradar el rendimiento.
- Especifico al formato de plantilla del proyecto token-compression y a los tres tipos de pregunta entrenados; otros formatos requieren su propio entrenamiento.
- El conteo de lineas ERROR es poco fiable (31 % de acierto en logs comprimidos), por lo que no debe usarse como unica fuente para alertas o decisiones automatizadas.
- El autor lo describe explicitamente como un adaptador de investigacion, no como una herramienta de produccion para analisis de logs.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion inherente al modelo base Qwen3-1.7B, especialmente en preguntas fuera de distribucion o con logs mal formados.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse que el modelo base Qwen3-1.7B mantiene la misma licencia permisiva en la version utilizada.
- La decodificacion debe ser greedy y con `enable_thinking=False` segun la model card; otros ajustes de generacion pueden alterar el formato de respuesta esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Garnet-Owl/token-compression-log-reader
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto token-compression: https://github.com/Garnet-Owl/token-compression
- Scripts de entrenamiento: https://github.com/Garnet-Owl/token-compression/tree/master/experiments/log_reader
- Perfil GitHub del autor: https://github.com/Garnet-Owl
- Perfil LinkedIn del autor: https://www.linkedin.com/in/james-wanjiku/

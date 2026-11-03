# scar-ai/vera-large-2o

## Resumen

vera-large-2o es un modelo de decisión no autorregresivo de tipo "System 1" desarrollado por scar-ai. A diferencia de los modelos generativos convencionales, no produce texto libre: recibe un estado (texto, correo, ticket, JSON y, opcionalmente, imágenes) junto con un conjunto de preguntas tipadas, y devuelve respuestas tipadas acompañadas de probabilidades calibradas. Esto elimina el parseo de salidas y reduce drásticamente el riesgo de alucinación, ya que el modelo nunca genera lenguaje.

Se trata de la segunda versión de vera-large, construida sobre la misma arquitectura de decisión derivada de Qwen3.8-27B, pero incorporando ahora la torre de visión original de Qwen3.8, lo que permite responder preguntas sobre imágenes con el mismo checkpoint. El modelo cuenta con 25.628.527.110 parámetros totales en formato safetensors y un repositorio de 52,2 GB.

Su relevancia actual reside en la propuesta de un paradigma distinto al de los LLM generativos para tareas de clasificación, puntuación y verificación binaria en producción: respuestas estructuradas, calibradas y sin superficie de alucinación textual. Habla el mismo formato de cable que Jev (`POST /v1/systemone`) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión no autorregresivo (System 1) sobre backbone Qwen3.8-27B con torre de visión Qwen3.8 |
| Parametros totales | 25.628.527.110 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería pytorch, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

vera-large-2o es un modelo de decisión no autorregresivo: en lugar de generar tokens secuencialmente, procesa el estado de entrada y emite directamente respuestas a preguntas tipadas (`choice` con entre 2 y 255 opciones, `score` con entre 2 y 10 niveles ordenados y `noul` para probabilidad sí/no). Todas las preguntas de una llamada se responden conjuntamente y las peticiones nunca se truncan. La arquitectura de decisión se hereda de vera-large y se apoya en el backbone Qwen3.8-27B, al que en esta versión se añade la torre de visión original de Qwen3.8 para procesar imágenes junto al estado textual.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona explícitamente la calibración de probabilidades como propiedad central del modelo y la existencia de un "Jev Decision Index" como marco de evaluación, cuyos resultados oficiales para esta versión aún no se han publicado. El modelo requiere el paquete `vera` (`vera-s1`) versión 0.1.8 o superior, con soporte para motores transformers y vLLM.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado textual: clasificación por elección (`choice`), puntuación ordinal (`score`) y verificación binaria (`noul`).
- Procesamiento conjunto de texto e imágenes: recibe rutas de fichero, URIs `data:` o imágenes PIL en Python, y URIs `data:` por HTTP.
- Salidas con probabilidades calibradas, sin generación de texto libre ni necesidad de parseo.
- Respuesta conjunta a múltiples preguntas en una sola llamada.
- Sin truncamiento de peticiones.
- Compatibilidad con el formato de cable de Jev (`POST /v1/systemone`).
- Carga mediante `AutoModel` con `trust_remote_code=True`, pipeline `decision` y motor vLLM.
- Capacidades multilingües: limitadas al inglés según la model card.
- No soporta tool calling ni generación de agentes multi-paso, por su naturaleza no generativa.

## Casos de uso

- Triaje de tickets de soporte: clasificar automáticamente el departamento responsable (`billing`, `technical`, `other`), estimar urgencia en una escala ordinal y detectar riesgo de churn mediante una pregunta `noul`, todo en una sola llamada y con probabilidades calibradas para priorizar la cola.
- Verificación documental con imágenes: comprobar si el total de un recibo coincide con una cifra esperada pasando la imagen junto al estado textual y una pregunta `noul`, útil en pipelines de contabilidad o reclamaciones.
- Moderación y clasificación de contenido: asignar categorías de riesgo o cumplimiento a correos, mensajes o JSON estructurados con la garantía de que la salida siempre es una etiqueta válida del conjunto definido.
- Enrutamiento de correo entrante: decidir el equipo o flujo de trabajo destino de cada mensaje con una pregunta `choice` de hasta 255 opciones, integrándolo en un sistema de gestión documental.
- Puntuación de leads o solicitudes: emplear preguntas `score` de hasta 10 niveles para ordenar solicitudes por prioridad comercial o técnica con una escala consistente y calibrada.
- Extracción de señales en pipelines ETL: enviar registros JSON junto a preguntas binarias o de elección para enriquecer datos sin depender de expresiones regulares ni de parseo de texto generado.
- Evaluación de imágenes en control de calidad: verificar con preguntas `noul` si una captura o foto cumple un criterio concreto, aprovechando la torre de visión integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la sección de benchmarks se actualizará cuando estén disponibles los resultados oficiales del Jev Decision Index para vera-large-2o.

## Requisitos de hardware

- VRAM estimada: aproximadamente 51 GB para los pesos en bf16 más cerca de 1 GB adicional para la torre de visión.
- GPU recomendadas: tarjetas de clase 80 GB (A100 80 GB, H100 80 GB) o superiores.
- Configuración multi-GPU: dos GPU con paralelismo tensorial mediante vLLM.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, etc.) en bf16.
- Opciones de despliegue: paquete `vera-s1` con extra `[fast]` o `[vllm]`, servidor `vera-serve` (motor por defecto o `--engine vllm`), carga con `transformers` (`AutoModel`, `trust_remote_code=True`, `device_map="cuda"`), y directorio `engines/` para usar vLLM sin el paquete `vera`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vera-large-2o | 25,6 B | no disponible | Decisión no autorregresiva (System 1) | Sí | Apache 2.0 | HuggingFace (scar-ai) |
| vera-large | no disponible | no disponible | Decisión no autorregresiva (System 1) | No | no disponible | HuggingFace (scar-ai) |
| Qwen3.8-27B (modelo base) | ~27 B (según nombre) | no disponible | LLM generativo | No (el base) | no disponible | HuggingFace (Qwen) |

La comparación con LLM generativos de tamaño similar no es directa: vera-large-2o no genera texto y está optimizado para responder preguntas tipadas con probabilidades calibradas, mientras que un LLM convencional produce lenguaje libre que requiere parseo y presenta riesgo de alucinación. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Requiere una GPU grande: unos 51 GB de pesos en bf16 más aproximadamente 1 GB de la torre de visión; necesita una tarjeta de clase 80 GB o dos GPU con paralelismo tensorial en vLLM.
- Idiomas soportados limitados al inglés según la model card.
- No genera texto: no es adecuado para tareas de generación, resumen o conversación abierta.
- No soporta tool calling ni razonamiento multi-paso de tipo agente.
- Riesgo de alucinación textual inexistente por diseño, pero las probabilidades calibradas deben validarse en el dominio de despliegue concreto.
- No se han publicado resultados de benchmarks ni del Jev Decision Index para esta versión, por lo que el rendimiento real no está documentado.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B y las dependencias del paquete `vera-s1`.
- Requiere `trust_remote_code=True` para la carga con transformers, lo que implica ejecutar código del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scar-ai/vera-large-2o
- Versión anterior (vera-large): https://huggingface.co/scar-ai/vera-large
- Sección de uso con transformers de vera-large: https://huggingface.co/scar-ai/vera-large#use-with-transformers
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

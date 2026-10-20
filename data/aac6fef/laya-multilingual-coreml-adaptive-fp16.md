# aac6fef/laya-multilingual-coreml-adaptive-fp16

## Resumen

`aac6fef/laya-multilingual-coreml-adaptive-fp16` es una conversión nativa a Core ML del modelo `convaiinnovations/laya-multilingual`, publicada por el usuario `aac6fef`. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue que empaqueta los pesos del modelo base (fijado en la revisión `052592a15d198d9ad47da779604259b10b47b7aa`) en grafos Core ML con precisión de cómputo float16, pensados para ejecutarse en Apple silicon bajo macOS 15 o superior. El pipeline declarado es `text-classification` y el ejemplo de la model card muestra una API de predicción sobre un conjunto finito de opciones etiquetadas.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de conversión "adaptativa": el bundle incluye grafos con lotes B=1/2/4/16, buckets de secuencias cortas y capacidad de hasta 1024 tokens, con carga perezosa de los grafos y una caché de formas que retiene como máximo cuatro instancias de ejecución adicionales. Por otro, ejemplifica una vía de despliegue sin PyTorch, MLX ni Transformers, apoyada en el runtime `laya-coreml >= 0.5.1`, lo que reduce dependencias en producción pero ata el artefacto a una plataforma concreta (Apple silicon).

La información disponible es limitada: no se publican el número de parámetros, la arquitectura interna del modelo base, la lista de idiomas ni resultados de benchmarks estándar. La validación aportada por el autor se limita a comparar 63 respuestas seleccionadas contra la ejecución FP32 upstream, con un error máximo de probabilidad calibrada de 0,00157763769 y 100 llamadas repetidas estables. El repositorio tiene 0,7 GB, 12 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base; el artefacto es una conversión Core ML (ML Program) de `convaiinnovations/laya-multilingual` |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | 1024 tokens de capacidad por grafo (segun model card); buckets de secuencia corta densos |
| Tipos de cuantizacion | float16 como precision de computo; no se distribuyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; el nombre del modelo base sugiere caracter multilingue, pero no se detalla la lista |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (ML Program, `.mlpackage`); no safetensors ni GGUF |
| Tamano del repositorio | 0,7 GB |
| Lotes soportados | B=1, B=2, B=4 y B=16 |
| Opciones por grafo | Hasta 32 |
| Runtime requerido | `laya-coreml >= 0.5.1` |
| Plataforma | Apple silicon, macOS 15+ (probado en M3 Max) |
| Pipeline declarado | `text-classification` |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento propio: es una exportación del modelo base `convaiinnovations/laya-multilingual`, fijada a una revisión concreta del repositorio upstream para garantizar reproducibilidad. La conversión genera varios grafos Core ML especializados por tamaño de lote (B=1/2/4/16) y por buckets de secuencias cortas, con una capacidad máxima de 1024 tokens y hasta 32 opciones por grafo. El comportamiento lógico de lote y ventana sigue la versión upstream Laya v0.4.12, según declara el autor. La precisión de cómputo es float16 sobre CPU/GPU; el autor indica explícitamente que no se trata del modelo de forma fija para ANE (Neural Engine).

La innovación técnica principal es la carga perezosa de los grafos adaptativos y una caché de formas que conserva como máximo cuatro instancias de ejecución adicionales, nunca respuestas. Esto reduce la latencia en formas repetidas a costa de un aumento sustancial de memoria residente; el parámetro `shape_cache_size=0` desactiva las instancias extra. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La validación publicada incluye 63/63 respuestas seleccionadas coincidentes con la ejecución FP32 upstream, un error máximo de probabilidad calibrada de 0,00157763769, 100 llamadas repetidas estables y comprobaciones completas de salida pública. El autor advierte que estas comprobaciones finitas no demuestran una precisión universal del modelo. Los ficheros del modelo son byte a byte idénticos al export denso validado; los cambios de empaquetado solo afectan a metadatos de procedencia, a esta model card y a la licencia.

## Capacidades

- Clasificación y selección de respuesta entre un conjunto finito de opciones (hasta 32 por grafo), con campos de tipo e instrucciones por opción en la API de ejemplo.
- Predicción con contrato estructurado: la llamada `agent.predict(texto, opciones)` devuelve una opción seleccionada, lo que encaja en tareas de etiquetado cerrado.
- Procesamiento por lotes con grafos dedicados para B=1, B=2, B=4 y B=16, útil para clasificar lotes de documentos o tickets.
- Inferencia nativa en Apple silicon sin necesidad de PyTorch, MLX ni Transformers.
- Soporte de secuencias de hasta 1024 tokens por grafo, con buckets específicos para secuencias cortas.
- Carga perezosa de grafos y caché de formas configurable para mejorar la latencia en patrones de entrada repetidos.
- Capacidad multilingue probable por herencia del modelo base, aunque la lista exacta de idiomas no está documentada en la información disponible.
- No se documentan en la información disponible capacidades de generación libre, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo permite definir opciones como "solicitud de reembolso", "cambio de producto" o "consulta de pedido" y seleccionar la más probable para enrutar el ticket, gracias a la API de predicción sobre opciones cerradas y a la ventana de 1024 tokens.
- Enrutado de correos y formularios: con lotes B=4 o B=16 se pueden clasificar bloques de mensajes en categorías predefinidas dentro de un flujo de triaje, reduciendo el número de llamadas por documento.
- Moderación de contenido con etiquetas cerradas: definir opciones como "permitido", "revisar" o "bloquear" y aplicar el modelo a textos cortos, aprovechando los buckets de secuencia corta y la precisión FP16 para un filtrado rápido en local.
- Análisis de sentimiento o temática en paneles internos: clasificar reseñas o encuestas en un conjunto fijo de categorías y agregar los resultados, con la ventaja de que la inferencia ocurre en el dispositivo sin enviar datos a un servicio externo.
- Extracción de etiquetas en pipelines documentales: dado un fragmento de texto y un catálogo de categorías, seleccionar la etiqueta aplicable para alimentar un sistema de gestión documental o un índice de búsqueda.
- Evaluación de opciones múltiples en herramientas educativas: usar el modelo para seleccionar una respuesta entre alternativas predefinidas en cuestionarios o tests automatizados, con validación de que la salida se mantiene estable en llamadas repetidas.
- Clasificación on-device con requisitos de privacidad: al ejecutarse de forma nativa en Apple silicon y sin dependencias de PyTorch, encaja en aplicaciones de escritorio para Mac donde el texto no debe salir del equipo.
- Prototipado de clasificadores cerrados sin reentrenamiento: permite definir el espacio de etiquetas en tiempo de inferencia y probar rápidamente distintas taxonomías sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta una validación de equivalencia numérica frente a la ejecución FP32 upstream, que se resume a continuación.

| Prueba de validacion | Resultado |
|---|---|
| Respuestas seleccionadas coincidentes con FP32 upstream | 63/63 |
| Error maximo de probabilidad calibrada | 0,00157763769 |
| Llamadas repetidas estables | 100 |
| Comprobaciones de salida publica | Completas, segun el autor |
| Alcance de la validacion | Comprobaciones finitas; no demuestran precision universal |

## Requisitos de hardware

- Plataforma obligatoria: Apple silicon con macOS 15 o superior; el autor probó el artefacto en un M3 Max.
- VRAM/unified memory estimada: no hay una estimación FP16 publicada. El benchmark FP32 del runtime 0.5.1 registró un pico de RSS del proceso Core ML de entre 5,10 y 8,77 GiB; el autor advierte que no es una medida completa de memoria unificada ni una estimación para FP16.
- GPU recomendadas: no aplica el ecosistema NVIDIA (A100, H100, RTX 4090); el artefacto está pensado para CPU/GPU de Apple silicon.
- Cabe en consumer GPU: no en el sentido habitual de GPU dedicada; requiere un Mac con Apple silicon. No se especifican los requisitos mínimos de memoria unificada.
- Opciones de despliegue: runtime `laya-coreml >= 0.5.1` sobre Core ML. No se soportan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no publicados. El autor indica que las formas nuevas o en frío pueden ser más lentas y que la caché de formas mejora la latencia en formas repetidas a costa de memoria residente; `shape_cache_size=0` desactiva las instancias extra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (`aac6fef/laya-multilingual-coreml-adaptive-fp16`) | No disponible | 1024 tokens por grafo | FP16, Core ML adaptativo B=1/2/4/16 | Apache 2.0 | HuggingFace, 12 descargas |
| `convaiinnovations/laya-multilingual` (upstream) | No disponible | No disponible | No disponible; requiere PyTorch/MLX/Transformers segun la model card | No disponible en la informacion | HuggingFace (modelo base) |
| Conversiones single-graph previas del mismo autor | No disponible | No disponible | Core ML de forma fija | No disponible | Mencionadas como no modificadas; no identificadas |
| Otras alternativas de clasificacion Core ML | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar rendimiento, latencia o calidad frente a modelos de la misma categoría. La comparación directa más fiable es la equivalencia numérica con la ejecución FP32 upstream reportada en `validation.json`.

## Limitaciones y advertencias

- No se documentan el número de parámetros, la arquitectura interna ni la composición del dataset de entrenamiento del modelo base.
- El artefacto está atado a Apple silicon y macOS 15+; no es portable a Linux, Windows ni GPUs NVIDIA.
- La precisión FP16 no es numéricamente idéntica a FP32; la equivalencia reportada se limita a 63 respuestas seleccionadas y a un umbral de error de probabilidad de 0,00157763769.
- La validación finita no demuestra precisión universal; conviene revalidar sobre el dominio concreto antes de producción.
- Capacidad de contexto limitada a 1024 tokens por grafo, con buckets de secuencia corta; textos más largos requieren truncado o segmentación externa.
- No se publica la lista de idiomas soportados, pese al nombre "multilingual" del modelo base.
- La carga perezosa de grafos puede penalizar la latencia en formas nuevas o en frío.
- La caché de formas incrementa el consumo de memoria residente; debe ajustarse o desactivarse según el presupuesto de memoria del equipo.
- El modelo es de clasificación sobre opciones cerradas; no debe usarse como generador de texto libre sin un componente adicional.
- Adopción muy baja en el momento de la consulta (12 descargas, 0 likes), lo que reduce la evidencia comunitaria disponible.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar avisos de copyright y licencia, y no concede garantías; conviene revisar también las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aac6fef/laya-multilingual-coreml-adaptive-fp16
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Evidencia de runtime y cualificación: https://github.com/mizorewww/laya-coreml/blob/main/docs/QUALIFICATION_0_5_1.md
- Repositorio del runtime: https://github.com/mizorewww/laya-coreml
- Instalación del runtime: `pip install laya-coreml==0.5.1`
- Revisión upstream fijada: `052592a15d198d9ad47da779604259b10b47b7aa`
- Los resultados de búsqueda web disponibles no contenían enlaces relevantes sobre este modelo.

# Daddydev21/Daddydev21

## Resumen

Daddydev21/Daddydev21 es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario Daddydev21, derivado del modelo base Qwen/Qwen3.8-27B mediante un proceso de cuantizacion ternaria (2-bit) y un ajuste orientado a eliminar restricciones de alineacion (abliterated/uncensored). El repositorio declara 27.320.697.856 parametros en formato safetensors y un tamano total de 865,3 GB, lo que sugiere que contiene multiples variantes de pesos (incluyendo GGUF para llama.cpp) en lugar de un unico conjunto de pesos.

El modelo se presenta con etiquetas que indican soporte para transformers, GGUF, llama.cpp, CUDA y Metal, ademas de "on-device", "hybrid-attention", "prismml" y "bonsai", lo que apunta a un enfoque de despliegue en dispositivo con tecnicas de cuantizacion agresiva. La licencia declarada es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de esta ficha es limitada por la escasez de documentacion verificable: no se han publicado resultados de benchmarks, no se detallan los datos de entrenamiento ni el proceso de abliteration, y el modelo base Qwen/Qwen3.8-27B no es un identificador ampliamente conocido en el ecosistema publico de Qwen. Cualquier evaluacion en produccion deberia tratar estos datos como no verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con hybrid-attention segun tags; detalles no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (2-bit) declarada en tags; GGUF para llama.cpp; otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (segun tags y tamano del repo) |

## Arquitectura y entrenamiento

La informacion disponible no permite confirmar la arquitectura interna mas alla de las etiquetas del repositorio. Se indica "hybrid-attention" y "prismml" como terminos tecnicos, pero no se aporta documentacion que los defina. El modelo base declarado es Qwen/Qwen3.8-27B, del que no se dispone de ficha publica verificable en la informacion proporcionada. El pipeline es image-text-to-text, por lo que se asume un componente de vision integrado, aunque no se especifica el codificador visual ni la resolucion de imagen soportada.

El proceso de entrenamiento no esta documentado: no se indica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. La etiqueta "abliterated" sugiere una modificacion de los pesos para eliminar direcciones de rechazo, y "uncensored" refuerza esa orientacion, pero no se detalla la metodologia. La cuantizacion ternaria (2-bit) es la innovacion tecnica mas destacable declarada, orientada a reducir el footprint para despliegue en dispositivo, aunque no se aportan metricas de degradacion respecto al modelo base.

## Capacidades

- Generacion de texto conversacional (tag "conversational").
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Razonamiento y codigo: no confirmado por documentacion, aunque el modelo base Qwen sugiere capacidades generales; no disponible como dato verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo "thinking": no disponible.
- Despliegue en dispositivo: soportado segun tags (llama.cpp, CUDA, Metal, on-device).
- Comportamiento sin censura: declarado mediante tags "abliterated" y "uncensored".

## Casos de uso

- Despliegue en dispositivo con recursos limitados: la cuantizacion ternaria (2-bit) y el soporte GGUF/llama.cpp permiten ejecutar el modelo en hardware consumer o edge, aunque el rendimiento real no esta documentado.
- Prototipado multimodal local: al ser image-text-to-text, puede usarse para experimentar con descripciones de imagen y preguntas visuales en entornos sin conexion, aceptando la falta de benchmarks publicados.
- Investigacion sobre abliteration: util para estudiar el efecto de la eliminacion de direcciones de rechazo en modelos de 27B, comparando respuestas con el modelo base.
- Generacion de contenido sin filtros en entornos controlados: el caracter uncensored lo hace adecuado para investigación creativa o generacion de texto donde los filtros de alineacion sean un obstaculo, siempre con supervision humana.
- Evaluacion de cuantizacion extrema: sirve como caso de estudio de la degradacion de calidad al pasar a 2-bit ternario en un modelo de 27B con componente visual.
- Integracion via API compatible con endpoints: la etiqueta "endpoints_compatible" sugiere uso en servicios de inferencia gestionados, aunque la licencia y el acceso gated deben verificarse antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 27B en 2-bit ternario podria ocupar del orden de 7-10 GB de pesos, pero esta cifra no esta confirmada por el autor y debe tratarse como estimacion no verificada.
- GPU recomendadas: no disponibles. Los tags mencionan CUDA y Metal, lo que sugiere soporte para GPU NVIDIA y Apple Silicon.
- Cabe en consumer GPU: probablemente si en GPUs con 12-16 GB o mas segun la cuantizacion ternaria, pero no confirmado.
- Opciones de despliegue: llama.cpp y GGUF (segun tags), transformers, y endpoints compatibles. vLLM, TGI y Ollama no estan confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Daddydev21/Daddydev21 | 27,3B | no disponible | Apache 2.0 | Gated | Multimodal, ternario 2-bit, abliterated |
| Qwen/Qwen3.8-27B (base declarado) | 27B aprox. | no disponible | no disponible | no disponible | Modelo base del que deriva; ficha no verificada |
| Alternativas de 27B abliterated | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables verificables en la informacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Proceso de abliteration no documentado: el comportamiento sin censura puede degradar la coherencia y aumentar la generacion de contenido nocivo; requiere filtros externos en producción.
- Riesgo de alucinacion: sin datos de evaluacion, no puede acotarse; los modelos abliterated suelen mostrar mayor propension a afirmaciones no fundamentadas.
- Idiomas no declarados: no se puede garantizar soporte multilingue ni calidad en castellano.
- Contexto desconocido: imposible planificar casos de uso con ventanas largas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para despliegue automatizado.
- Licencia Apache 2.0 declarada, pero el modelo base Qwen puede tener condiciones adicionales no verificadas; revisar antes de uso comercial.
- Tamano del repo de 865,3 GB: implica multiples artefactos y un coste de almacenamiento considerable; no es un unico conjunto de pesos.
- El identificador del modelo base (Qwen/Qwen3.8-27B) no es verificable en la informacion proporcionada, lo que impide confirmar la procedencia real de los pesos.
- Sin garantias de mantenimiento: 0 descargas y 0 likes en el momento de la ficha.

## Enlaces

- Hugging Face: https://huggingface.co/Daddydev21/Daddydev21
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B (no verificado)
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentacion de transformers: https://huggingface.co/docs/transformers
- No se han encontrado papers, blogs, repos ni demos adicionales en la informacion proporcionada.

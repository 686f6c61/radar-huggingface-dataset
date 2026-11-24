# ApollonLabs/Heliactis-2-3.7B

## Resumen

Heliactis-2-3.7B es un ajuste fino (fine-tune) del modelo abierto IFM/K2-Horizon-3.7B, desarrollado por el Institute of Foundation Models (MBZUAI), publicado por Apollon Labs. El objetivo declarado del modelo es doble: mejorar la calidad del griego generado para que se lea como griego escrito de forma natural y preservar la integridad del codigo generado. Se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de texto conversacional.

El modelo parte de la arquitectura propietaria `k2-horizon` del modelo base, con 3.700 millones de parametros y pesos en BF16 en formato safetensors (con la LoRA ya fusionada). El repositorio ocupa 10,1 GB e incluye codigo remoto, por lo que requiere `trust_remote_code=True` para cargarse con transformers. Ademas, existe una build GGUF publicada por el mismo autor.

La relevancia de este lanzamiento es acotada pero concreta: demuestra que un ajuste fino ligero (LoRA r=16 entrenada en 64 minutos sobre 2 GPU T4) puede mejorar simultaneamente el conocimiento en griego, la calidad linguistica del griego y el rendimiento en HumanEval respecto al modelo base, sin degradar el recall en contexto largo hasta 16K tokens. Es un caso practico de especializacion linguistica de bajo coste sobre un modelo fundacional abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2-horizon (transformer, codigo remoto del modelo base) |
| Parametros totales | 3.700 millones (3.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 524.288 tokens segun `max_position_embeddings`; evaluado solo hasta 16K |
| Tipos de cuantizacion | BF16 (safetensors); GGUF Q8_0 verificado en el repositorio GGUF |
| Idiomas soportados | griego (el) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, LoRA fusionada) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `k2-horizon` del modelo base IFM/K2-Horizon-3.7B, que se distribuye como codigo remoto y requiere `trust_remote_code=True`. No se detalla en la informacion disponible la composicion interna de la arquitectura (tipo de atencion, capas, cabezas) mas alla de su naturaleza transformer y su ventana maxima de 524.288 posiciones. El autor advierte que el modo de razonamiento de alto esfuerzo (`effort: high`) del modelo base no cierra dentro de un presupuesto practico de tokens, comportamiento que se mantiene en el fine-tune.

El entrenamiento consistio en una LoRA con r=16, alpha=32 aplicada a todas las capas de proyeccion, con learning rate 2e-4, scheduler coseno y 3 epocas. Se conservo unicamente la epoca 1 y se fusiono a media intensidad (alpha 16 en lugar de 32), porque a plena intensidad el modelo perdia conocimiento general (7/30 frente a 10/30 del base). El dataset consta de 2.014 ejemplos de griego, codigo y tool calling, con la perdida calculada solo sobre la respuesta. El entrenamiento se ejecuto en fp16 sobre 2 GPU T4 en Kaggle con DDP, en 64 minutos, y la eval loss paso de 1,0917 a 0,6515. El dataset tiene hash sha256 `80e47fd2b37d2bea66d219045f3fb8b25beb64a1e32159abecb84223240d2547`.

## Capacidades

- Generacion de texto conversacional en griego e ingles.
- Generacion de codigo, con mejora medida en HumanEval respecto al modelo base.
- Tool calling (incluido en los datos de entrenamiento).
- Razonamiento con modo "thinking" configurable, con niveles de esfuerzo (`reasoning_effort`); se recomienda desactivado o en `low`.
- Recall en contexto largo: verificado con preguntas tipo needle a 4K y 16K tokens, con 8/8 aciertos.
- Conocimiento factual en griego: ligera mejora medida sobre el base (12/30 frente a 10/30).
- No se documentan capacidades de vision, audio ni multimodalidad.
- No fue entrenado con datos de autoidentidad; si se requiere identidad, debe fijarse en el system prompt.

## Casos de uso

- Generacion de contenido editorial en griego: el modelo produce griego mas natural que su base (puntuacion de calidad de 78,3 frente a 75,0 con thinking off), adecuado para borradores de articulos, descripciones de producto o textos de marketing que luego se revisan.
- Atencion al cliente en griego: permite gestionar conversaciones multi-turno en griego e ingles con una ventana de contexto amplia (hasta 524.288 posiciones teoricas, 16K verificadas), util para historiales de conversacion largos.
- Asistentes de codigo en pipelines de desarrollo: con HumanEval pass@1 del 81,7% y soporte de tool calling, puede integrarse en flujos de autocompletado o generacion de funciones con invocacion de herramientas.
- Traduccion y localizacion griego-ingles: especializado en la calidad del griego escrito, sirve como motor de localizacion hacia griego con revisión humana posterior.
- Procesamiento de documentos largos en griego: el recall verificado a 16K tokens permite tareas de extraccion de informacion o resumen sobre documentos extensos en ese idioma.
- Despliegue en hardware modesto: al ser un modelo de 3.7B con builds GGUF, puede ejecutarse en entornos con recursos limitados mediante llama.cpp, adecuado para prototipos y aplicaciones de borde.
- Educacion y tutoria en griego: generacion de explicaciones y material didactico en griego con un modelo que mantiene coherencia linguistica superior a su base.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre la build Q8_0, temperatura 0, con el modelo base y el fine-tune bajo flags identicos:

| Prueba | IFM/K2-Horizon-3.7B | Heliactis-2 |
|---|---|---|
| Conocimiento general, 30 preguntas cortas de hechos en griego | 10/30 | 12/30 |
| Puntuacion de griego, thinking off (3 ejecuciones) | 75,0 · 74,8 · 74,8 | 78,3 · 76,9 · 76,9 |
| Puntuacion de griego, effort low | 56,4 | 77,5 |
| HumanEval pass@1, thinking off | 128/164 (78,0%) | 134/164 (81,7%) |
| Recall en contexto largo 4K + 16K, thinking off | 8/8 | 8/8 |

El autor advierte que la prueba de griego consta de 18 prompts y la subpuntuacion de significado de 11 items, por lo que detecta colapsos y mejoras claras, no cambios pequenos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 7,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 12-16 GB para contexto moderado.
- VRAM estimada en GGUF Q8_0: alrededor de 4 GB para pesos, con overhead adicional segun contexto.
- GPU recomendadas: A100 o H100 para despliegues de produccion con contexto largo; RTX 4090 o RTX 3090 para uso profesional en una sola GPU.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en cuantizaciones GGUF; en BF16 requiere al menos 12 GB.
- Opciones de despliegue: llama.cpp (version b11454 o superior, requerida por la arquitectura `k2-horizon`), con `llama-server -m Heliactis-2-3.7B-Q8_0.gguf --jinja -c 16384`; tambien transformers con `trust_remote_code=True`. No se documenta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Notas |
|---|---|---|---|---|---|
| Heliactis-2-3.7B | 3,7B | 524.288 (verificado 16K) | 81,7% pass@1 | Apache 2.0 | Fine-tune especializado en griego |
| IFM/K2-Horizon-3.7B | 3,7B | 524.288 | 78,0% pass@1 | Apache 2.0 | Modelo base, sin especializacion linguistica |
| Otros modelos de ~3-4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La unica comparacion con datos verificables es contra su propio modelo base, sobre el que mejora en las cinco pruebas publicadas. No se dispone de datos de benchmarks frente a otras familias de modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no fue entrenado con datos de autoidentidad; si la identidad es relevante, debe fijarse explicitamente en el system prompt.
- El modo de razonamiento `effort: high` no cierra dentro de un presupuesto practico: con un limite de 10.000 tokens muchas respuestas vuelven vacias. Se recomienda thinking off o `reasoning_effort: "low"`.
- La prueba de griego es pequena (18 prompts, 11 items en la subpuntuacion de significado) y no detecta cambios sutiles de calidad.
- Persisten errores gramaticales en griego, aunque menos que en el modelo base; se recomienda revisar cualquier texto antes de publicarlo.
- El recall en contexto largo solo se midio hasta 16K tokens, pese a que la arquitectura admite 524.288; no hay garantia de rendimiento mas alla de lo medido.
- Requiere llama.cpp b11454 o superior y `trust_remote_code=True` en transformers, lo que anade dependencias y superficie de riesgo al cargar codigo remoto.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de factualidad mas alla de las 30 preguntas cortas de conocimiento general.
- Licencia Apache 2.0, permisiva para uso comercial, heredada del modelo base; no se indican restricciones adicionales.
- El modelo solo cubre griego e ingles; no se declara soporte para castellano ni otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B
- Build GGUF: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Insignia del proyecto: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B/resolve/main/insignia.svg

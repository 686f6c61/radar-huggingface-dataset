# asheeee24/tooltuned-qwen2.5-1.5b

## Resumen

ToolTuned Qwen2.5-1.5B es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct orientado especificamente a la llamada de funciones (function calling). Lo desarrolla el usuario asheeee24 y emplea QLoRA sobre el modelo base de Alibaba, con el adaptador fusionado en los pesos finales, de modo que se carga como cualquier modelo de transformers sin necesidad de cargar el adaptador por separado. El problema que aborda es concreto: mejorar la precision con la que un modelo pequeno emite llamadas a herramientas en el formato nativo de Qwen (`<tool_call>`) y declinar cuando ninguna herramienta encaja.

El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parametros totales y una ventana de contexto heredada del modelo base de 32.768 tokens (dato del modelo original; la model card no lo reespecifica). Se entrena exclusivamente en ingles y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es doble. Por un lado, demuestra que un ajuste fino ligero con QLoRA sobre una unica GPU T4 puede producir mejoras medibles y estadisticamente significativas en tool calling sobre un modelo de 1.5B. Por otro, documenta con rigor un compromiso habitual en este tipo de ajustes: la mejora en la llamada de herramientas viene acompanada de un deterioro notable en la deteccion de irrelevancia, es decir, el modelo tiende a invocar herramientas aunque no proceda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (entrenado en 4-bit NF4 para QLoRA; pesos publicados en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion por rotacion posicional (RoPE) y sesgo QKV, y le aplica un ajuste fino QLoRA: los pesos base se cuantizan a 4-bit NF4 y se entrena un adaptador LoRA sobre todas las capas lineales con r = 16, alpha = 32 y dropout de 0.05. La optimizacion usa learning rate 2e-4 con schedule coseno, 3% de warmup, 2 epocas, batch efectivo de 16 (4 por paso con 4 pasos de acumulacion), precision fp16 con gradient checkpointing y longitud maxima de secuencia de 1.072 tokens. El entrenamiento se ejecuto en una unica NVIDIA T4 (notebook gratuito de Kaggle) durante 1.226 actualizaciones, con la perdida calculada solo sobre la respuesta del asistente. El adaptador se fusiono posteriormente en los pesos base.

Los datos proceden de Salesforce/xlam-function-calling-60k y se procesaron en cuatro etapas: verificacion de cada fila contra sus definiciones de herramientas (58.485 de 60.000 filas validas; 1.241 rechazadas por desajuste de tipos y 274 por falta de parametros requeridos), generacion de 6.498 ejemplos sin herramienta emparejando peticiones con herramientas no relacionadas y respuesta de rechazo, eliminacion de solapamiento con BFCL mediante comparacion de 8-gramas (6 duplicados exactos y 4.030 casi duplicados de tool-call mas 400 casi duplicados sin herramienta) y muestreo final de 10.000 filas de entrenamiento (9.000 con tool-call, 1.000 sin) y 500 de validacion. Las filas de mas de 1.072 tokens se descartaron en lugar de truncarse. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Llamada de funciones en el formato nativo de Qwen, emitiendo uno o varios bloques `<tool_call>` con nombre de funcion y argumentos en JSON.
- Soporte de llamadas multiples y en paralelo (categorias `multiple`, `parallel` y `parallel_multiple` de BFCL).
- Acepta definiciones de herramientas tanto en formato xLAM (descripcion y tipo estilo Python por parametro) como en JSON-schema.
- Declinacion en texto plano cuando ninguna herramienta encaja, aunque con menor fiabilidad que el modelo base (ver limitaciones).
- Razonamiento multi-paso limitado: el modelo no dispone de modo thinking explicito ni de bucle de agente propio; la orquestacion debe implementarse externamente.
- Sin capacidades de vision, audio ni tool calling nativo a nivel de servidor mas alla del formato de texto.

## Casos de uso

- Enrutamiento de peticiones en asistentes conversacionales: dado un mensaje de usuario y un catalogo de funciones disponibles, el modelo decide que funcion invocar y con que argumentos, con un coste computacional muy bajo gracias a sus 1.5B parametros.
- Automatizacion de back-office con APIs internas: integrado como capa de interpretacion de intenciones que traduce lenguaje natural a llamadas JSON contra endpoints REST, apropiado por su soporte de esquemas de parametros tipados.
- Agentes de consulta de datos: el modelo emite llamadas a funciones de busqueda o consulta SQL parametrizada, y el orquestador ejecuta la herramienta y devuelve el resultado al modelo para la respuesta final.
- Prototipado rapido en entornos con recursos limitados: cabe en una GPU T4 o en GPUs de consumo, lo que permite iterar sobre pipelines de tool calling sin infraestructura dedicada.
- Filtrado y clasificacion de intenciones en pipelines de CI/CD o ETL: el modelo puede decidir si una peticion requiere una herramienta concreta y generar la llamada correspondiente para su validacion automatica.
- Base para experimentos de investigacion en ajuste fino: el repositorio del autor incluye el pipeline de datos y los resultados, lo que lo convierte en una referencia reproducible para estudiar el efecto del filtrado de datos en tool calling.
- Educacion y demos: su tamano permite desplegarlo en notebooks y entornos docentes para ilustrar el formato de llamada de funciones de Qwen.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 5 categorias de Berkeley Function Calling Leaderboard (BFCL), 1.240 preguntas, con `bfcl-eval` 2026.3.23 y vLLM en una T4 en fp16. No son resultados oficiales del leaderboard; BFCL no tiene entrada integrada para Qwen2.5 y se registro un handler personalizado con la plantilla de chat de Qwen.

| Categoria | Preguntas | Modelo base | Este modelo | Cambio |
|---|---|---|---|---|
| `simple_python` | 400 | 86,50% | 87,50% | +1,0 |
| `multiple` | 200 | 84,00% | 87,00% | +3,0 |
| `parallel` | 200 | 74,50% | 78,00% | +3,5 |
| `parallel_multiple` | 200 | 72,50% | 75,50% | +3,0 |
| `irrelevance` | 240 | 72,50% | 57,92% | −14,6 |

Contraste de McNemar sobre las mismas preguntas: en las cuatro categorias de tool calling (1.000 preguntas), este modelo acerto 61 preguntas que el base fallo y fallo 38 que el base acerto (p = 0,027). En irrelevancia (240 preguntas), 18 frente a 53 en sentido contrario (p < 0,001). Ambas diferencias son significativas.

Ablacion: la misma receta entrenada con datos sin el paso de verificacion obtuvo 36 preguntas correctas que este modelo fallo, frente a 16 en sentido contrario (p = 0,008) en tool calling, sin diferencia significativa en irrelevancia (12 frente a 5, p = 0,143). Cada modelo se entreno una sola vez, por lo que no se descarta el azar de entrenamiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,1 GB en fp16 (pesos safetensors de 3,1 GB de repositorio); en 8-bit alrededor de 1,6 GB y en 4-bit alrededor de 0,9 GB, sin contar cache KV.
- GPU recomendadas: NVIDIA T4 (validada por el autor para entrenamiento e inferencia con vLLM), A100, H100, L4 y RTX 4090 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM en fp16, y en 2-3 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (validado en la model card), vLLM (usado para los benchmarks), y en principio llama.cpp, Ollama y TGI al ser un modelo Qwen2 estandar con pesos safetensors fusionados; estas ultimas no estan verificadas en la model card.
- Latencia y throughput: no disponibles. El autor solo indica que los benchmarks se ejecutaron con vLLM en una T4 en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToolTuned Qwen2.5-1.5B | 1,54B | no disponible (base: 32.768) | Ajustado con QLoRA sobre xLAM; 87,5% en `simple_python` de BFCL | apache-2.0 | Hugging Face (5 descargas) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Formato nativo `<tool_call>` sin ajuste especifico; 86,5% en `simple_python` | apache-2.0 | Hugging Face (ampliamente usado) |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | Formato nativo `<tool_call>`; mayor capacidad general a costa de mas VRAM | apache-2.0 | Hugging Face |
| xLAM-1B (Salesforce) | ~1,3B | no disponible | Entrenado especificamente para tool calling sobre el mismo dataset | cc-by-nc-4.0 (uso no comercial) | Hugging Face |

La comparativa con xLAM es especialmente pertinente porque este modelo se entrena sobre el dataset de Salesforce; la diferencia clave es la licencia, Apache 2.0 frente a no comercial. No se han publicado resultados de benchmarks oficiales de BFCL para este modelo mas alla de los del autor.

## Limitaciones y advertencias

- Llama a herramientas con demasiada facilidad: en BFCL `irrelevance` cae del 72,50% al 57,92%, una perdida de 14,6 puntos. En produccion conviene anadir una capa de validacion o un umbral externo antes de ejecutar la herramienta.
- La ablacion sugiere que el paso de verificacion de datos no mejoro el tool calling en este experimento; el autor no descarta el azar de entrenamiento por entrenar una sola vez cada variante.
- Solo entrenado y evaluado en ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Ventana de contexto efectiva limitada a 1.072 tokens durante el entrenamiento; las peticiones mas largas no estuvieron representadas y pueden degradar la calidad de la llamada.
- Riesgo de alucinacion de nombres de funciones o argumentos cuando el esquema de herramientas es ambiguo o extenso; el formato xLAM y el JSON-schema funcionan, pero no hay garantia de validez estricta del JSON generado.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion; no impone restricciones de campo de uso.
- Modelo con 5 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de terceros ni resultados oficiales de leaderboard.
- No dispone de modo thinking, vision ni audio; no debe usarse como sustituto de modelos mayores en tareas de razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asheeee24/tooltuned-qwen2.5-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Repositorio del autor (codigo, pipeline y resultados): https://github.com/arsheen2244/tooltuned
- Berkeley Function Calling Leaderboard: https://gorilla.cs.berkeley.edu/leaderboard.html

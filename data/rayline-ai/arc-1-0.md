# rayline-ai/ARC-1.0

## Resumen

ARC-1.0 (Adaptive Routing Controller) es un modelo de decisión desarrollado por rayline-ai, disenado especificamente para enrutar agentes de IA entre modelos en la nube y modelos locales. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-0.8B, con 615 millones de parametros totales, que en lugar de generar texto produce senales estructuradas para la toma de decisiones de enrutamiento: prediccion de exito por modelo, estimacion de uso de tokens, deteccion de PII, categorizacion de peticiones y un cabezal de preguntas generico para decisiones definidas por el desarrollador.

El modelo resuelve un problema concreto en arquitecturas multi-modelo: separar las predicciones (que modelo tendra exito y cuanto costara) de la politica de decision (que modelo elegir segun precio, calidad y disponibilidad). La aplicacion combina las senales de ARC con sus propios precios y reglas, de modo que actualizar precios no requiere reentrenar los predictores. Esto es relevante en despliegues de agentes donde el coste por token varia entre proveedores y modelos locales.

ARC-1.0 se publica bajo licencia Apache 2.0, con pesos en safetensors y soporte para vLLM, y esta orientado exclusivamente al idioma ingles. Su tamano reducido (615M parametros) permite ejecutarlo en hardware modesto, lo que encaja con su funcion de controlador que decide donde ejecutar el trabajo pesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-0.8B) con cabezales de decision |
| Parametros totales | 615.054.751 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria de despliegue | vLLM |
| Tamano del repositorio | 2,3 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tipo de tarea | text-classification |
| Dataset de entrenamiento | nvidia/Nemotron-PII |

## Arquitectura y entrenamiento

ARC-1.0 es un fine-tune del modelo Qwen/Qwen3.5-0.8B. El modelo base es un transformer de 0,8B parametros; el checkpoint publicado contiene 615.054.751 parametros en formato safetensors. Sobre esa base, rayline-ai ha anadido cabezales de decision que producen senales especificas: probabilidad de exito por modelo, estimacion de uso de tokens (input no cacheado, lecturas de cache, escrituras de cache y output), calidad y uso de razonamiento, deteccion de PII, categorizacion de peticiones y un cabezal de preguntas generico que devuelve probabilidades sobre opciones de respuesta definidas por el desarrollador.

El entrenamiento incluye el dataset nvidia/Nemotron-PII, segun los metadatos del repositorio, lo que respalda la capacidad de deteccion de informacion sensible. La model card menciona evaluaciones de deteccion de PII y categorizacion de peticiones sobre un dataset interno con usuarios separados entre entrenamiento y evaluacion. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica principal es la separacion entre prediccion y politica: el modelo predice senales objetivas y la aplicacion aplica la funcion de utilidad, lo que permite actualizar precios sin reentrenar.

## Capacidades

- Prediccion de exito por modelo: estima la probabilidad de que un modelo candidato complete una tarea dada.
- Estimacion de uso de tokens: predice input no cacheado, lecturas de cache, escrituras de cache y output.
- Evaluacion de razonamiento: compara el beneficio esperado y el coste de distintas configuraciones de razonamiento dentro de un modelo.
- Deteccion de PII: identifica la presencia y los tipos de informacion sensible en la entrada.
- Categorizacion de peticiones: clasifica operaciones y dominios solicitados, admitiendo multiples etiquetas.
- Cabezal de preguntas generico: recibe una pregunta y opciones de respuesta y devuelve probabilidades para cada opcion.
- Soporte de decisiones de enrutamiento: responde a preguntas como si una peticion necesita un modelo mas potente, que modelo deberia responder o si el modelo propuesto tendra exito.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- No es un modelo generativo de texto: su salida son senales y probabilidades, no texto libre.

## Casos de uso

- Enrutamiento de agentes entre nube y local: ARC-1.0 lee la conversacion del agente y predice que modelo elegible tiene mayor probabilidad de exito; la aplicacion combina esa senal con precios y reglas de elegibilidad para decidir si ejecuta en local o en la nube. Es adecuado porque su tamano reducido permite ejecutarlo como controlador ligero junto al agente.
- Optimizacion de coste en pipelines multi-modelo: la prediccion de uso de tokens (input, cache, output) permite estimar el coste antes de enviar la peticion y aplicar la politica de utilidad (V x exito predicho - coste esperado) para elegir la opcion mas rentable.
- Presets de politica Sage y Swift: Sage (V = 4,5) prioriza la finalizacion exitosa y Swift (V = 0,1) prioriza reducir coste; ambos son configuraciones del mismo modelo, utiles para adaptar el comportamiento segun el presupuesto del despliegue.
- Politica prefer-local: con un umbral de exito predicho configurable (por ejemplo 0,85), ARC-1.0 decide si un modelo local supera el umbral y, en caso contrario, aplica la politica de fallback configurada. Adecuado para despliegues con GPUs locales y necesidad de contencion de coste.
- Deteccion de PII en entradas de agentes: antes de enviar una peticion a un proveedor externo, ARC-1.0 identifica la presencia y tipos de informacion sensible, lo que permite aplicar redaccion o bloquear el envio.
- Categorizacion de peticiones para politicas de enrutamiento: clasifica la operacion y el dominio solicitados con multiples etiquetas, lo que permite dirigir consultas de codigo, vision o matematicas a modelos especializados.
- Decisiones personalizadas con el cabezal de preguntas: el desarrollador formula una pregunta y opciones de respuesta y obtiene probabilidades, lo que permite implementar criterios de enrutamiento propios sin reentrenar el modelo.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion del informe tecnico. La configuracion hibrida edge-cloud declara retener el 97,5% de la calidad de Opus 5.5 con un 92,9% menos de coste, usando DeepSeek V4.1 Flash y un despliegue con multiples DGX Spark y umbral prefer-local de 0,85.

Comparativa ARC Sage frente a Opus 5.5:

| Benchmark | Opus 5.5 exito | ARC Sage exito | Coste ARC / baseline |
|---|---|---|---|
| DeepSWE | 69,9% | 68,7% | 7% |
| Terminal-Bench 2.1 | 91,0% | 92,4% | 58% |
| SWE-Atlas QA | 61,6% | 62,4% | 13% |
| MMMU-Pro Vision | 82,2% | 82,9% | 39% |
| GPQA Diamond | 89,9% | 94,1% | 21% |
| Tau3 Banking | 42,8% | 33,2% | 17% |

Comparativa ARC prefer-local frente a Opus 5.5 (umbral 0,85, V = 4,5):

| Benchmark | Opus 5.5 exito | ARC prefer-local exito | Coste ARC / Opus |
|---|---|---|---|
| DeepSWE | 69,9% | 72,3% | 1,1% |
| Terminal-Bench 2.1 | 90,7% | 90,5% | 75,7% |
| SWE-Atlas QA | 61,6% | 62,6% | 1,6% |
| Tau3 Banking | 42,8% | 35,3% | 17,3% |
| GPQA Diamond | 89,5% | 92,5% | 12,3% |
| MMMU-Pro Vision | 82,2% | 82,7% | 40,9% |

Indice de enrutamiento de RouteBench (escala 0-10, mayor es mejor; pesos nominales 60% calidad, 20% velocidad, 20% coste):

| Router | DeepSWE | SWE-Atlas QA | Terminal-Bench 2.1 | Tau3 Banking | MMMU-Pro Vision | Media |
|---|---|---|---|---|---|---|
| ARC Sage | 9,6 | 9,1 | 10,0 | 7,7 | 10,0 | 9,3 |
| ARC Swift | 9,7 | 8,5 | 10,0 | 7,5 | 10,0 | 9,1 |
| OpenRouter Auto | 8,8 | 8,6 | — | 9,0 | 8,8 | — |
| OpenRouter Auto Code | 8,5 | 8,7 | — | 8,9 | 9,7 | — |
| OpenRouter Jev (medium) | 9,0 | 8,2 | — | 7,4 | 9,4 | — |
| Pareto | 9,9 | 9,1 | 10,0 | 8,0 | 8,9 | 9,2 |
| Fugu Max | 4,7 | 7,0 | 8,2 | 6,5 | 9,0 | 7,1 |
| Fugu Ultra v2 | — | 7,6 | — | 6,3 | 8,1 | — |

## Requisitos de hardware

- VRAM estimada para inferencia: con 615M parametros, en FP16 requiere aproximadamente 1,2 GB solo para pesos; en FP32 unos 2,5 GB. Los 2,3 GB del repositorio incluyen pesos y artefactos adicionales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM puede alojar el modelo en FP16; una RTX 3060, RTX 4060 o RTX 4090 son suficientes. Para despliegues de produccion con concurrencia, A100 o H100 ofrecen mayor margen.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM en FP16.
- Opciones de despliegue: vLLM es la libreria declarada en el repositorio. Al ser un transformer estandar en safetensors, tambien podria servirse con TGI o llama.cpp si se generan pesos GGUF, aunque no se confirma soporte oficial en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARC-1.0 | 615M | no disponible | Enrutamiento de agentes y senales de decision | Apache 2.0 | Hugging Face (rayline-ai/ARC-1.0) |
| Qwen/Qwen3.5-0.8B | 0,8B aprox. | no disponible | Generacion de texto general | no disponible | Hugging Face |
| OpenRouter Auto | no disponible | no disponible | Enrutamiento gestionado (servicio) | propietaria | API de OpenRouter |
| Pareto | no disponible | no disponible | Enrutamiento gestionado (servicio) | propietaria | servicio |

ARC-1.0 se diferencia de los routers gestionados (OpenRouter Auto, Pareto) en que es un modelo abierto y desplegable localmente, con pesos y licencia Apache 2.0. Frente a su modelo base Qwen3.5-0.8B, ARC-1.0 no genera texto: esta especializado en producir senales de decision. En el indice de RouteBench, ARC Sage obtiene una media de 9,3 frente a 9,2 de Pareto, con ventaja en Terminal-Bench 2.1 y MMMU-Pro Vision, y desventaja en Tau3 Banking.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- No es un modelo generativo: no debe usarse para producir texto, codigo o respuestas directas al usuario, sino como controlador de enrutamiento.
- Riesgo de alucinacion en las senales: las predicciones de exito y uso de tokens son estimaciones probabilisticas y pueden desviarse del resultado real, especialmente fuera de la distribucion de entrenamiento.
- El rendimiento declarado depende de la configuracion de politica (Sage, Swift, prefer-local) y del pool de modelos y precios configurados; los resultados de la model card no son garantizables en otros despliegues.
- En Tau3 Banking, ARC Sage obtiene 33,2% frente al 42,8% de Opus 5.5, y ARC prefer-local 35,3%, lo que indica una perdida de calidad en tareas de ese dominio.
- La deteccion de PII se evaluo en un dataset interno del autor, no en un benchmark publico independiente; su fiabilidad fuera de ese dominio no esta validada.
- La longitud de contexto no esta especificada en la informacion disponible, lo que impide garantizar el manejo de conversaciones largas.
- No se especifican los tipos de cuantizacion soportados ni el rendimiento en precisiones reducidas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene verificar.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/rayline-ai/ARC-1.0
- Informe tecnico: https://static.rayline.ai/rayline/reports/arc/latest
- Documentacion: https://docs.rayline.ai
- Repositorio Raydock: https://github.com/rayline-ai/raydock
- Sitio de Rayline: https://rayline.ai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII

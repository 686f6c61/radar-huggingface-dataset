# JamesQuartz/aenea-pinta-1.2-mini

## Resumen

Aenea Pinta-1.2 Mini Stable, publicado por el usuario JamesQuartz bajo el identificador `JamesQuartz/aenea-pinta-1.2-mini`, es un clasificador semántico de 50 millones de parámetros disenado como enrutador de despacho (semantic router) para sistemas de agentes y despliegues en el borde. No es un modelo generativo: recibe un prompt y emite, en una única pasada hacia delante, uno de nueve tokens de dominio reservados (`<|reserved_23|>` a `<|reserved_31|>`) que el sistema anfitrión usa para seleccionar el modelo experto o la herramienta adecuada.

El modelo es la sucesión estable del Pinta-1.1 Mini Beta y esta pensado para clasificación permanente de baja latencia, donde el coste por peticion importa mas que la precision pico. Segun la model card, alcanza un 91,51 % de exactitud estricta en el Balanced Routing Benchmark v6, una mejora de +19 puntos sobre su predecesor directo, manteniendo el mismo presupuesto de 50M de parámetros y una latencia inferior a 15 ms en CPU sobre hardware convencional.

Su relevancia actual radica en el patron de orquestación de agentes: en lugar de invocar un modelo grande para decidir a que subsistema derivar cada consulta, Pinta-1.2 Mini resuelve ese enrutado en el borde con un coste computacional mínimo. La arquitectura emplea atención ortogonal de tipo Block Householder sobre 20 capas con tamano oculto 512, ventana de contexto de 2.048 tokens y un vocabulario de 9.000 entradas (tokenizer QT-Cittern-1.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion ortogonal (Cartan), 20 capas; atencion Block Householder con 8 reflexiones y block_size 64 |
| Parametros totales | 50 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bf16, fp16, ONNX fp32, ONNX fp16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32 y fp16, opset 18); tambien bf16/fp16 |
| Tamano del repositorio | 0,3 GB |
| Vocabulario | 9.000 tokens (tokenizer QT-Cittern-1.0) |
| Tamano del modelo | 199 MB (ONNX fp32), 105 MB (ONNX fp16) |

## Arquitectura y entrenamiento

Pinta-1.2 Mini es un clasificador basado en transformer con 20 capas, tamano oculto 512 y 8 cabezas de atencion. Su rasgo arquitectonico distintivo es la atencion ortogonal denominada Block Householder, con 8 reflexiones y un block_size de 64, encuadrada por el autor bajo la etiqueta `cartan-architecture`. La cabeza de enrutado es de tipo causal `[B, S, V]` y opera sobre una rebanada de 9 tokens reservados del vocabulario. El modelo no genera texto: predice que token emitiria a continuacion un modelo generativo completo, pero lo hace en una sola pasada.

En cuanto al entrenamiento, la model card indica que la cabeza de enrutado se entreno sobre un conjunto estrictamente balanceado de 58.220 registros, con una relacion maxima/minima de 1,46x entre los 9 dominios. La version Stable elimina la necesidad de un vector de sesgo de calibracion en inferencia, de modo que puede usarse directamente con softmax crudo sobre los 9 logits de dominio. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de intencion en 9 dominios de despacho: SyntaxDevOps, Code, Creative, RAG, Architecture, Math, Knowledge, Compliance y Chat.
- Emision de un token de enrutado reservado por cada dominio (`<|reserved_23|>` a `<|reserved_31|>`) para integrarse en pipelines de orquestacion.
- Clasificacion en una sola pasada hacia delante, sin generacion de texto ni decodificacion autoregresiva.
- Salida de probabilidades por dominio (softmax sobre los 9 logits) que permite aplicar una puerta de confianza (confidence gate) recomendada por el autor.
- Inferencia de baja latencia en CPU sobre hardware convencional (sub-15 ms p50).
- Capacidades multilingues: no disponibles; el modelo esta declarado unicamente para ingles.
- Soporte de tool calling / function calling: no disponible como tal; su funcion es precisamente enrutar hacia herramientas o modelos expertos.
- Soporte de agentes y razonamiento multi-paso: no aplica al modelo en si, que actua como componente de despacho dentro de sistemas de agentes.

## Casos de uso

- Enrutado en enjambres de agentes: dado un prompt de entrada, el modelo decide en milisegundos si debe atenderlo un modelo de codigo, de matematicas, de RAG o de chat, evitando invocar un modelo grande solo para esa decision.
- Sidecar de CLI o herramienta de terminal: integrado como binario C++ sin dependencias, clasifica el comando o consulta del usuario y selecciona el backend adecuado antes de ejecutar la tarea.
- Despacho en el borde (edge dispatch): al ejecutarse en CPU con latencia sub-15 ms y ocupar 105-199 MB, permite enrutado local en dispositivos sin GPU dedicada.
- Prefiltrado de cumplimiento normativo: el dominio HIGH_RISK_COMPLIANCE presenta precision 1,00 y F1 0,99, de modo que puede derivar consultas sensibles a un motor de politicas o revision legal antes de que las procese un modelo generativo.
- Puerta de seleccion para pipelines de RAG: con F1 0,96 en LONG_CONTEXT_RAG, identifica que consultas requieren recuperacion documental y las encamina al pipeline correspondiente.
- Enrutado de consultas matematicas y cientificas: con F1 0,96 en DENSE_STEM_MATH, dirige estas peticiones a modelos de razonamiento, calculadoras simbolicas o CAS.
- Seleccion de modelos especializados en generacion de codigo: el dominio CODE (F1 0,83) permite derivar peticiones a linters, depuradores o modelos de codigo antes de gastar presupuesto en un modelo general.
- Reduccion de coste en produccion: sustituye una llamada a un LLM de enrutado por una inferencia de 50M de parámetros, reduciendo coste y latencia en cada decision de despacho.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y en la model card (metrica no verificada, `verified: false`), sobre el Balanced Routing Benchmark v6 (1.060 prompts, 9 dominios, sin solapamiento con entrenamiento, solo ingles):

| Metrica | Pinta-1.1 (226M) | Pinta-1.1 Mini Beta | Pinta-1.2 Mini Stable |
|---|---|---|---|
| Exactitud estricta | 79,22 % | 72,50 % | 91,51 % |
| Macro F1 | no disponible | no disponible | 0,91 |
| Weighted F1 | no disponible | no disponible | 0,92 |
| Latencia p50 (CPU) | ~45 ms | ~14 ms | ~14 ms |
| Latencia p95 (CPU) | ~52 ms | ~16 ms | ~18 ms |
| Tamano ONNX fp32 | 452 MB | 98 MB | 199 MB |
| Tamano ONNX fp16 | no disponible | no disponible | 105 MB |

Rendimiento por dominio (Pinta-1.2 Mini Stable):

| Dominio | Precision | Recall | F1 |
|---|---|---|---|
| SYNTAX_DEV_OPS | 0,96 | 0,73 | 0,83 |
| CODE | 0,80 | 0,86 | 0,83 |
| CREATIVE_PROSE | 0,96 | 0,83 | 0,89 |
| LONG_CONTEXT_RAG | 0,98 | 0,93 | 0,96 |
| SYSTEM_CODE_ARCH | 0,90 | 0,95 | 0,93 |
| DENSE_STEM_MATH | 0,94 | 0,99 | 0,96 |
| GENERAL_KNOWLEDGE | 0,76 | 0,97 | 0,85 |
| HIGH_RISK_COMPLIANCE | 1,00 | 0,97 | 0,99 |
| CONVERSATIONAL_CHAT | 0,98 | 0,97 | 0,98 |

Segun el autor, Pinta-1.2 Mini supera al Pinta-1.1 completo de 226M en mas de 12 puntos porcentuales, siendo 4,5x mas pequeno y 3x mas rapido.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 199 MB en ONNX fp32 y unos 105 MB en ONNX fp16; el modelo es lo bastante pequeno para residir en memoria de sistema.
- GPU recomendadas: no requiere GPU para su funcionamiento; puede ejecutarse en CPU. Cabe holgadamente en cualquier GPU, incluida una RTX 4090 o inferiores, asi como en GPUs integradas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (via Python o C++); el repositorio incluye un enrutador C++ de produccion sin dependencias que autodetecta rutas y no requiere calibracion.
- Latencia y throughput: latencia de aproximadamente 14 ms en p50 y 18 ms en p95 sobre CPU (hardware convencional, segun el autor).
- Frameworks como vLLM, llama.cpp u Ollama no son aplicables, ya que el modelo no es generativo.

## Comparativa con modelos similares

Comparativa directa con los modelos de la propia familia Pinta, que son los unicos con datos de benchmark disponibles en la informacion proporcionada:

| Modelo | Parametros | Contexto | Exactitud estricta | Latencia p50 CPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pinta-1.2 Mini Stable | 50M | 2.048 | 91,51 % | ~14 ms | Apache 2.0 | HuggingFace |
| Pinta-1.1 | 226M | no disponible | 79,22 % | ~45 ms | no disponible | no disponible |
| Pinta-1.1 Mini Beta | 50M | no disponible | 72,50 % | ~14 ms | no disponible | no disponible |

No se dispone de datos de benchmarks de otros enrutadores semanticos de terceros en la informacion proporcionada, por lo que la comparacion con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo una etiqueta de dominio; cualquier expectativa de generacion es incorrecta.
- Idioma: declarado unicamente para ingles; su comportamiento en otros idiomas es no disponible y probablemente degradado.
- Ventana de contexto limitada a 2.048 tokens, lo que restringe el enrutado de entradas largas.
- Riesgo de mala clasificacion (no de alucinacion en sentido generativo): en dominios como CODE (precision 0,80) y GENERAL_KNOWLEDGE (precision 0,76) puede derivar consultas al experto equivocado; se recomienda la puerta de confianza sugerida por el autor.
- Recall bajo en SYNTAX_DEV_OPS (0,73), lo que implica que una parte de estas consultas no se enrutan a ese dominio.
- Las metricas de benchmark estan declaradas por el autor y marcadas como no verificadas (`verified: false`); el conjunto de evaluacion es personalizado y en ingles.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los artefactos auxiliares (tokenizer QT-Cittern-1.0) por separado.
- Cualquier decision de despacho en dominios de alto riesgo (por ejemplo, cumplimiento normativo) deberia acompanarse de validacion adicional antes de automatizarse por completo.

## Enlaces

- HuggingFace: https://huggingface.co/JamesQuartz/aenea-pinta-1.2-mini
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos mas alla de la propia model card.

# caiovicentino1/Eikos-27B-INT4

## Resumen

Eikos-27B-INT4 es la version cuantizada a 4 bits del modelo Eikos-27B, desarrollado por el usuario caiovicentino1. Se trata de un modelo de 27.356.728.560 parametros (unos 27,36 mil millones) orientado a la toma de decisiones tipadas: en lugar de generar texto libre, responde a preguntas cerradas (si/no, eleccion entre N opciones, puntuaciones ordinales) sobre un estado dado en una sola pasada forward, devolviendo una probabilidad calibrada para cada opcion. La model card lo etiqueta con los tags decision-making, calibration, finance, trading y trade-finance, y el pipeline declarado es text-classification.

Esta variante INT4 aplica cuantizacion GPTQ W4A16 con grupos de 128 y activaciones en bf16, generada con llm-compressor en formato compressed-tensors y calibrada sobre 256 elementos de entrenamiento (nunca sobre datos de evaluacion). La torre de vision, los pesos MTP, los embeddings y la cabeza LM se mantienen en mayor precision. El resultado reduce el peso de 55,6 GB (bf16) a 19,4 GB, lo que permite desplegarlo en GPU de consumo con 24 GB de VRAM, manteniendo segun el autor una precision dentro de 1 punto de la version bf16.

La relevancia de esta publicacion es doble: por un lado, demuestra un caso de cuantizacion agresiva que preserva calibracion probabilistica (ECE 0,041 frente a 0,043 en bf16), un requisito critico cuando la salida del modelo se usa para umbrales de decision; por otro, expone una arquitectura hibrida basada en Gated DeltaNet que exige vLLM >= 0.30.0 para funcionar correctamente con batching y cache de prefijos. El modelo hereda la base Qwen3.8-27B (Apache-2.0) y publica sus contribuciones bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con Gated DeltaNet (base Qwen3.8-27B); incluye torre de vision y pesos MTP |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 GPTQ W4A16, grupos de 128, activaciones bf16; torre de vision, MTP, embeddings y LM head en mayor precision. Existe version bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT para las contribuciones del autor; el modelo base Qwen3.8-27B es Apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (GPTQ) |
| Tamano del repositorio | 19,4 GB (frente a 55,6 GB de la version bf16) |
| Libreria | transformers |
| Pipeline declarado | text-classification |
| Modelo base | caiovicentino1/Eikos-27B |
| Requisito de inferencia | vLLM >= 0.30.0 |

## Arquitectura y entrenamiento

El modelo parte de Eikos-27B, construido sobre una arquitectura hibrida con capas Gated DeltaNet, una familia de modelos de espacio de estados con atencion lineal que alterna con mecanismos de atencion tradicional. La model card menciona explicitamente que se trata de una arquitectura hibrida y que versiones de vLLM anteriores a la 0.30.0 devuelven respuestas incorrectas cuando se agrupan varias peticiones largas en un mismo lote, lo que confirma que el comportamiento del modelo depende de la gestion del cache de prefijos y del state tracking de sus capas recurrentes. El modelo conserva una torre de vision, lo que lo habilita para entradas image-text-to-text, y pesos MTP (multi-token prediction), ambos mantenidos en mayor precision durante la cuantizacion.

El proceso de cuantizacion se realizo con llm-compressor en formato compressed-tensors, aplicando GPTQ de 4 bits con grupos de 128 y dejando las activaciones en bf16. La calibracion uso 256 elementos de entrenamiento y, segun el autor, nunca datos de evaluacion. El formato de prompt, la lectura por letras y el fichero de calibracion (calib.json, T = 1) son identicos a los del modelo bf16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base; esos detalles corresponden a la model card de Eikos-27B, que no forma parte de la informacion proporcionada.

## Capacidades

- Toma de decisiones tipadas en una sola pasada forward: respuestas de tipo si/no, eleccion entre N opciones y puntuaciones ordinales.
- Salida con probabilidad calibrada por opcion, con un error de calibracion (ECE) de 0,041 en la version INT4.
- Modo de confianza: el modelo decide en el 43,6 % de los casos cuando su confianza es >= 0,90, con un 2,4 % de error en esos casos.
- Procesamiento multimodal image-text-to-text: la torre de vision se conserva en mayor precision.
- Prediccion multi-token (MTP) mediante pesos dedicados mantenidos en alta precision.
- Razonamiento sobre reglas composicionales: 95,6 % en reglas del mismo tipo, 94,5 % en dominio nuevo y 95,3 % con libros de reglas nuevos.
- Aplicaciones financieras: 84,9 % en la bateria de finanzas que incluye CUAD, analisis de sentimiento y FinQA como juez.
- Soporte de sesiones de agente: la model card menciona agent sessions con la misma interfaz HTTP que el modelo bf16.
- Soporte de contexto largo, citado explicitamente en la grafica de evaluacion (JevBench con contexto largo), aunque sin cifra concreta publicada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Toma de decisiones automatizada en trading: el modelo evalua un estado de mercado descrito en el prompt y devuelve una decision categorica (entrar, mantener, salir) junto con la probabilidad calibrada de cada opcion, lo que permite aplicar umbrales de confianza y descartar automaticamente las decisiones por debajo del 0,90 de confianza.
- Verificacion de cumplimiento de reglas comerciales (trade compliance): con un 85,4 % de acierto en reglas vistas y un 88,6 % en reglas no vistas, puede usarse como primera capa de validacion de operaciones contra un libro de reglas, reservando la revision humana para los casos de baja confianza.
- Clasificacion de documentos financieros: la bateria de finanzas (CUAD, sentimiento, FinQA) indica que el modelo puede extraer y clasificar clausulas contractuales, informes y comparativas financieras en pipelines de document processing.
- Analisis de sentimiento financiero a escala: al ser un modelo de clasificacion con probabilidad calibrada, encaja en sistemas que necesitan un score continuo por documento en lugar de una etiqueta binaria, agregable sobre carteras o flujos de noticias.
- Enrutado y composicion de reglas en agentes: con un 95 % aproximado en tareas de reglas composicionales, puede actuar como modulo de decision de un agente multi-paso que traduce una situacion a una accion tipada antes de invocar herramientas externas.
- Revision de documentos con imagen y texto: gracias a la torre de vision conservada, puede responder preguntas cerradas sobre capturas, formularios escaneados o graficos acompanados de texto, manteniendo la salida en formato de decision tipada.
- Despliegue en produccion con vLLM: el modelo incluye scripts serve_vllm.sh y serve.py, con cache de prefijos híbrida y API HTTP, lo que facilita servirlo como microservicio de decision en un stack existente de vLLM.
- Sistemas con requisitos de auditoria: al devolver siempre una distribucion de probabilidad sobre opciones discretas y un ECE bajo, las decisiones son trazables y comparables con la version bf16 (97,8 % de respuestas identicas en la validacion).

## Benchmarks y rendimiento

Los datos proceden de la validacion publicada por el autor sobre los mismos 7.371 elementos (7 suites nunca usadas en entrenamiento), con vLLM 0.30, batching y cache de prefijos activados. La puerta de salida se fijo antes de ver los resultados: precision dentro de 1 punto de bf16, ECE dentro de 0,01 y al menos el 97 % de respuestas sin cambios.

| Metrica | Eikos-27B (bf16) | Eikos-27B-INT4 |
|---|---|---|
| Tamano | 55,6 GB | 19,4 GB |
| JevBench publico — original / dificil | 100,0 / 82,0 | 100,0 / 82,9 |
| DecisionBench — medio / dificil | 89,1 / 78,2 | 88,4 / 78,5 |
| Bateria general (9 tareas) | 82,6 | 82,5 |
| Finanzas (CUAD, sentimiento, FinQA-judge) | 85,4 | 84,9 |
| Reglas comerciales — vistas / no vistas | 85,4 / 87,4 | 85,4 / 88,6 |
| Reglas composicionales — mismo tipo / dominio nuevo / libros de reglas | 95,6 / 94,3 / 95,3 | 95,6 / 94,5 / 95,3 |
| ECE (menor es mejor) | 0,043 | 0,041 |
| Confianza >= 0,90: decide / error | 44,1 % / 2,5 % | 43,6 % / 2,4 % |
| Misma respuesta que bf16 (total / confianza >= 0,9) | — | 97,8 % / 100,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 20-24 GB solo para los pesos en INT4 (el repositorio ocupa 19,4 GB) mas el cache KV y las activaciones, que dependen de la longitud de contexto efectiva; la cifra exacta no esta publicada, por lo que es una estimacion basada en el tamano del repo.
- La version bf16 requiere 55,6 GB de pesos, por lo que necesita GPU de 80 GB o reparto en varias GPU.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB para entornos de servidor; RTX 4090 (24 GB) y RTX 5090 (32 GB) como opciones de gama de consumo.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 de 24 GB con cuantizacion INT4, aunque con margen ajustado si se usan contextos largos o lotes grandes. No cabe en GPU de 16 GB o menos sin offloading.
- Opciones de despliegue: vLLM >= 0.30.0 es obligatorio; el repositorio incluye serve_vllm.sh (motor vLLM con lectura por letras y cache de prefijos híbrida) y serve.py (API HTTP en el puerto 8000). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Advertencia de despliegue: con versiones de vLLM anteriores a la 0.30.0 el modelo devuelve respuestas incorrectas cuando se agrupan varias peticiones largas en el mismo lote sobre esta arquitectura híbrida (Gated DeltaNet).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eikos-27B-INT4 | 27,36 B (27.356.728.560) | no disponible | JevBench hard 82,9; DecisionBench hard 78,5; ECE 0,041 | MIT (contribuciones), Apache-2.0 (base) | HuggingFace, safetensors compressed-tensors |
| Eikos-27B (bf16) | 27,36 B | no disponible | JevBench hard 82,0; DecisionBench hard 78,2; ECE 0,043 | MIT (contribuciones), Apache-2.0 (base) | HuggingFace, 55,6 GB |
| Qwen3.8-27B (modelo base) | 27 B aprox. (no confirmado en la informacion) | no disponible | no disponible | Apache-2.0 | HuggingFace |

No se dispone de datos comparativos frente a otros modelos de la misma categoria (por ejemplo, clasificadores financieros o modelos de decision de 27 B) en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no constituye asesoramiento legal, fiscal ni de inversion.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de decisiones, las respuestas de baja confianza deberian filtrarse antes de actuar sobre ellas.
- Limitaciones de contexto: la model card menciona contexto largo pero no publica la longitud maxima soportada, por lo que no puede dimensionarse a priori.
- Idiomas soportados: no disponible. No hay tabla de cobertura linguistica en la informacion proporcionada.
- Restricciones de licencia: las contribuciones del autor son MIT, pero el modelo base Qwen3.8-27B es Apache-2.0; las atribuciones figuran en el fichero NOTICE del repositorio y deben respetarse en redistribuciones.
- Dependencia estricta de vLLM >= 0.30.0: usar versiones anteriores produce respuestas erroneas con batching sobre la arquitectura híbrida Gated DeltaNet, un riesgo serio en produccion.
- El pipeline declarado es text-classification, pero el modelo se sirve mediante scripts propios y API HTTP; la integracion directa con pipelines de transformers puede no estar soportada (la model card incluye la etiqueta inference: false).
- Adopcion nula hasta la fecha de la consulta: 0 descargas y 0 likes, sin validacion independiente por parte de terceros.
- La calibracion se realizo sobre 256 elementos de entrenamiento; un dominio muy alejado de esa distribucion puede degradar la calidad de las probabilidades aunque la etiqueta elegida siga siendo correcta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caiovicentino1/Eikos-27B-INT4
- Modelo base (version bf16): https://huggingface.co/caiovicentino1/Eikos-27B
- Imagen de presentacion del modelo: https://huggingface.co/caiovicentino1/Eikos-27B/resolve/main/assets/eikos_launch.png
- La busqueda web realizada no devolvio resultados relevantes (unicamente paginas generales del buscador); no se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

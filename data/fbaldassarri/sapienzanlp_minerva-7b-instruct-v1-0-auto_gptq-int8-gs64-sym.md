# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int8-gs64-sym

## Resumen

Esta ficha describe la version cuantizada a INT8 del modelo Minerva-7B-instruct-v1.0, un modelo de lenguaje causal de tipo instruct/chat desarrollado originalmente por el grupo Sapienza NLP de la Universidad de La Sapienza (Roma). La cuantizacion la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.0, aplicando cuantizacion de solo pesos (WoQ) con el algoritmo GPTQ, 8 bits, tamano de grupo 64 y esquema simetrico. El resultado es un artefacto de 9,0 GB pensado para inferencia eficiente en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra), aunque tambien es compatible con el ecosistema transformers y GPUs convencionales.

El modelo base sigue la arquitectura Mistral, con aproximadamente 7 mil millones de parametros nominales. Cabe senalar una discrepancia relevante: el recuento real de parametros en los ficheros safetensors del repositorio es de 2.302.611.456, muy inferior a los 7B que sugiere el nombre. Esta cifra debe interpretarse con cautela, ya que el repositorio no detalla la composicion exacta de los tensores empaquetados por GPTQ. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion.

La relevancia de esta ficha radica en que combina dos factores poco habituales: un modelo orientado al italiano (idioma con menos recursos que el ingles) y una cuantizacion INT8 optimizada explicitamente para el stack de Intel. Esto lo convierte en una opcion interesante para despliegues en equipos sin GPU dedicada, como portatiles con Core Ultra o servidores con CPU Xeon, donde el ahorro de memoria y la aceleracion via intel-extension-for-pytorch u OpenVINO resultan determinantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: mistral) |
| Parametros totales | 2.302.611.456 segun safetensors (el nombre comercial indica 7B; discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (8 bits), solo pesos (WoQ), GPTQ/AutoGPTQ, group_size 64, simetrica |
| Idiomas soportados | Italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado GPTQ), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base Minerva-7B-instruct-v1.0 emplea una arquitectura transformer causal de tipo Mistral, segun declara la model card en el campo `model_type`. No se proporcionan en la informacion disponible detalles sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre la estrategia de atencion (por ejemplo, si usa sliding window attention). Tampoco se especifican los datos de entrenamiento del modelo original: numero de tokens, composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del artefacto cuantizado se centra exclusivamente en el proceso de cuantizacion y no reproduce la informacion de entrenamiento del modelo base.

La innovacion tecnica de este artefacto reside en el proceso de cuantizacion. Se ha utilizado Intel AutoRound v0.16.0, que implementa una cuantizacion de solo pesos basada en el algoritmo GPTQ con ajuste de parametros de redondeo. Los hiperparametros registrados son: 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia 512, batch de calibracion 4, calibracion en CPU con `torch.bfloat16` y version de transformers 4.55.3 sobre torch 2.14.1+cpu. La cuantizacion completa tardo 40.078,6 segundos (unas 668 minutos). El resultado se guarda en formato `auto_gptq`, empaquetado en safetensors. El autor indica que esta version esta pensada para inferencia en CPU Intel, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost) de la serie Core Ultra mediante OpenVINO.

## Capacidades

- Generacion de texto conversacional en italiano e ingles, con plantilla de chat integrada (rol user/assistant) que debe aplicarse mediante `apply_chat_template`.
- Razonamiento y respuesta a instrucciones propias de un modelo instruct, aunque sin datos publicados que cuantifiquen su calidad.
- Soporte multilingue limitado a italiano e ingles segun los metadatos de la model card.
- Compatibilidad con el ecosistema transformers y con text-generation-inference (tag `text-generation-inference`).
- Inferencia en hardware Intel sin GPU dedicada: CPU, iGPU Arc y NPU Core Ultra via OpenVINO o intel-extension-for-pytorch.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente conversacional en italiano para atencion al cliente: el modelo puede mantener dialogos multi-turno aplicando su plantilla de chat, y su naturaleza instruct lo hace adecuado para respuestas guiadas en un dominio acotado. La ventana de contexto debe validarse empiricamente, ya que no se publica su valor.
- Despliegue en portatiles con Intel Core Ultra: gracias a la cuantizacion INT8 y al soporte de NPU via OpenVINO, el modelo puede ejecutarse en local sin GPU dedicada, lo que facilita prototipos y demos en entornos de desarrollo con hardware de consumo.
- Procesamiento por lotes en servidores CPU Xeon: la version INT8 con intel-extension-for-pytorch permite servir el modelo en infraestructura sin aceleradores, reduciendo coste por token en cargas de trabajo de baja concurrencia.
- Generacion de contenido en italiano: redaccion de borradores, resumenes o respuestas en italiano para aplicaciones editoriales o de soporte interno, aprovechando que el modelo esta entrenado especificamente para ese idioma.
- Traduccion asistida italiano-ingles: dado que la model card declara ambos idiomas, puede emplearse como borrador de traduccion en flujos humanos de revision, sin garantias de calidad publicadas.
- Investigacion academica sobre cuantizacion: el artefacto incluye la receta de replicacion completa (auto-round-pipeline, hiperparametros y condiciones de ejecucion), lo que lo convierte en un caso de estudio reproducible para evaluar el impacto de INT8 group_size 64 simetrico en un modelo Mistral.
- Evaluacion comparativa de modelos italianos: util para investigadores que necesiten medir degradacion por cuantizacion frente al modelo base en tareas italianas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de una cuantizacion INT8 de un modelo de ~7B nominales, la huella de pesos ronda los 7-8 GB; el repositorio ocupa 9,0 GB. Para inferencia en GPU se recomienda al menos 10-12 GB de VRAM considerando cache KV y overhead.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para despliegues de produccion; en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) deberia caber con contexto moderado, aunque no hay datos de latencia publicados.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM. En GPUs de 8 GB el margen es muy ajustado y depende de la longitud de contexto.
- Opciones de despliegue: transformers (soporte nativo del formato auto_gptq), text-generation-inference (tag presente), intel-extension-for-pytorch en CPU/iGPU Arc, OpenVINO en NPU Core Ultra. vLLM, llama.cpp y Ollama no se mencionan en la informacion disponible; llama.cpp requeriria conversion a GGUF, que este repositorio no incluye.
- Latencia y throughput: no disponibles. La model card solo registra el tiempo de cuantizacion (668 minutos en CPU), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Cuantizacion INT8 disponible |
|---|---|---|---|---|---|
| Minerva-7B-instruct-v1.0 (este artefacto) | 7B nominales (2,3B en safetensors) | no disponible | it, en | Apache 2.0 | Si (GPTQ, gs64, sym) |
| Minerva-7B-instruct-v1.0 (base) | 7B nominales | no disponible | it, en | Apache 2.0 | No (pesos originales) |
| Modelli italiani tipo Maestrale / Velvet | no disponible en esta busqueda | no disponible | it, en | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia e idiomas declarados.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 7B pero los safetensors suman 2.302.611.456 parametros. Conviene verificar la composicion real del checkpoint antes de dimensionar infraestructura.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad del modelo ni de la degradacion introducida por la cuantizacion INT8 frente al modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas (por ejemplo, RLHF) en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad para el modelo base ni para la version cuantizada.
- Cobertura idiomatica limitada: solo italiano e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto desconocido: la longitud de contexto no se publica, lo que impide planificar cargas con documentos largos sin validacion previa.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar la atribucion y el aviso de licencia; el autor declara que el artefacto se desarrollo solo con fines de investigacion y sin garantia.
- Dependencia de hardware Intel para el maximo rendimiento: las optimizaciones declaradas (intel-extension-for-pytorch, OpenVINO) no aplican en GPUs NVIDIA o AMD, donde el modelo funcionara pero sin las aceleraciones previstas.
- Repositorio con muy poca traccion (17 descargas, 0 likes): no hay comunidad que haya validado el artefacto, por lo que se recomienda evaluacion propia antes de produccion.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Auto-round-pipeline (receta de replicacion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/

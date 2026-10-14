# NasledieLab/Asterion-Decision-Omni

## Resumen

Asterion-Decision-Omni es un checkpoint experimental de PyTorch publicado por NasledieLab (NasledieAI Lab) orientado a clasificacion de texto de etiqueta fija y tareas de enrutamiento, no a generacion de texto libre. El artefacto combina un codificador de texto a nivel de byte con diez cabezas de decision especificas que cubren tareas como phishing, spam, guardrails, moderacion, routing, triage, emocion, RAG y NLI multilingue. Esta disenado para integrarse como herramienta de decision ligera dentro de un agente ya existente, no como sustituto de un modelo conversacional.

El modelo se distribuye en formato SafeTensors y su repositorio ocupa aproximadamente 0,2 GB, lo que sugiere un checkpoint compacto enfocado en inferencia local. La model card subraya que se trata de un modelo parcialmente cuantizado en signo (sign-quantized), con algunos tensores en valores con signo y escala, pero manteniendo muchos tensores de codificador, normalizacion y cabezas de salida en FP16 o FP32 convencionales; no es, por tanto, un modelo totalmente binario.

Su relevancia actual radica en el nicho de clasificacion y enrutamiento de bajo coste para pipelines de agentes, donde una decision rapida sobre la tarea, el riesgo o la relevancia de una entrada puede ahorrar llamadas a modelos generativos mayores. Sin embargo, el propio autor advierte que se trata de un checkpoint experimental sin resultados de benchmark reproducibles ni historial de entrenamiento verificable por tensor, lo que limita su uso en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Checkpoint PyTorch con codificador de texto a nivel de byte y cabezas de decision multi-tarea (`decision_multi_task`); no es un transformer generativo |
| Parametros totales | no disponible (tamano del repositorio: 0,2 GB) |
| Longitud de contexto | 512 bytes UTF-8 (primeros 512 bytes de cada entrada) |
| Tipos de cuantizacion | Cuantizacion parcial de signo; mezcla de tensores con signo y escala junto con tensores FP16/FP32 |
| Idiomas soportados | en (ingles); existe una cabeza `multilingual_nli`, pero los idiomas no estan detallados |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura consiste en un codificador de texto a nivel de byte junto con cabezas de decision especificas por tarea. El runtime incluido expone unicamente los grupos de tensores correspondientes a las cabezas `decision_multi_task`; el resto de grupos de tensores del checkpoint no se declaran como tareas soportadas. Las diez tareas expuestas son `phishing`, `spam`, `ag_news`, `guardrails`, `moderation`, `routing`, `triage`, `emotion`, `rag` y `multilingual_nli`, cada una con un conjunto cerrado de etiquetas.

En cuanto a la representacion de pesos, el checkpoint es parcialmente cuantizado en signo y no un modelo totalmente binario: parte de los tensores usa valores con signo con una escala, mientras que muchos tensores del codificador, normalizacion y cabezas de salida se almacenan en FP16 o FP32. El archivo SafeTensors guarda valores de tensor convencionales y no empaqueta todos los pesos en mascaras de un bit. La model card menciona una heuristica de entrenamiento denominada ZenoDirect-Opt, descrita como un metodo de volteo de signo guiado por gradiente con presupuesto de actualizacion decreciente, inspirado en la dicotomia de Zenon. El autor aclara explicitamente que se trata de una idea de optimizacion y no de una prueba de convergencia, y que el checkpoint no incluye metadatos de procedencia suficientes para reconstruir el historial de entrenamiento exacto de cada tensor. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion de texto con etiquetas fijas en diez tareas: deteccion de phishing (`legitimate`, `phishing`), spam (`ham`, `spam`), clasificacion de noticias AG News (`world`, `sports`, `business`, `science_technology`).
- Seguridad y moderacion: `guardrails` (`benign`, `jailbreak`) y `moderation` (`safe`, `toxic`).
- Enrutamiento de consultas: `routing` (`code`, `math`, `writing`, `lookup`, `data`, `chitchat`).
- Triaje de soporte: `triage` con diez etiquetas (`refund`, `tech_help`, `billing`, `cancellation`, `info`, `security`, `access`, `feature`, `sales`, `complaint`).
- Analisis emocional: `emotion` (`sadness`, `joy`, `love`, `anger`, `fear`, `surprise`).
- Evaluacion de relevancia para RAG: `rag` (`irrelevant`, `relevant`).
- Inferencia de lenguaje natural: `multilingual_nli` (`entailment`, `neutral`, `contradiction`).
- Procesamiento por lotes de hasta 128 registros de texto por peticion.
- Soporte de peticiones multi-tarea a traves de una API HTTP local (loopback).
- Integracion como herramienta mediante un servidor MCP (`mcp_server.py`) que reenvia peticiones de clasificacion a la API en ejecucion.
- Indicador opcional de revision de baja puntuacion como heuristica de enrutamiento (no es una garantia de confianza calibrada).
- No genera texto, no responde a prompts abiertos, no escribe codigo y no realiza busqueda de imagenes ni filtrado del DOM del navegador.

## Casos de uso

- Enrutamiento previo en pipelines de agentes: el modelo clasifica cada consulta entrante en `code`, `math`, `writing`, `lookup`, `data` o `chitchat` para decidir a que subagente o modelo derivarla, reduciendo llamadas innecesarias a modelos generativos grandes.
- Triaje automatico en atencion al cliente: con la cabeza `triage` el sistema puede etiquetar tickets como `refund`, `billing`, `cancellation`, `security`, etc., y encaminarlos al equipo correspondiente sin intervencion humana inicial.
- Filtro de seguridad en agentes conversacionales: la cabeza `guardrails` (`benign`/`jailbreak`) y la cabeza `moderation` (`safe`/`toxic`) permiten interceptar entradas potencialmente maliciosas o toxicas antes de enviarlas al modelo generativo principal.
- Evaluacion de relevancia en sistemas RAG: la cabeza `rag` (`irrelevant`/`relevant`) permite descartar fragmentos recuperados que no responden a la consulta, reduciendo ruido en el contexto enviado al generador.
- Deteccion de spam y phishing en formularios o bandejas de entrada: las cabezas `spam` y `phishing` permiten un filtrado rapido por lote (hasta 128 textos) en un servicio local sin coste de API externa.
- Analisis de sentimiento y emocion en resenas o encuestas: la cabeza `emotion` clasifica el texto en seis emociones basicas para paneles de monitorizacion o alertas de experiencia de cliente.
- Clasificacion tematica de noticias: la cabeza `ag_news` permite etiquetar flujos de titulares o resumenes en cuatro categorias para agregadores o sistemas de recomendacion.
- Verificacion de coherencia en pipelines de extraccion: la cabeza `multilingual_nli` puede usarse para comprobar si una respuesta se sigue logicamente de un contexto dado (entailment, neutral, contradiction) dentro de un flujo de validacion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se declaran resultados de benchmark porque la release no incluye una ejecucion reproducible de evaluacion. Asimismo, aclara que las puntuaciones softmax devueltas son puntuaciones del modelo y no probabilidades verificadas de acierto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,2 GB, por lo que cabe holgadamente en practicamente cualquier GPU consumer y muy probablemente en CPU.
- GPU recomendadas: no se especifican modelos concretos. El runtime selecciona CUDA si esta disponible y, en caso contrario, ejecuta en CPU, por lo que cualquier GPU con soporte CUDA de PyTorch es suficiente.
- Compatibilidad con GPU consumer: si, previsiblemente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado el tamano reducido del checkpoint.
- Opciones de despliegue: el artefacto incluye `inference_api.py` (API HTTP JSON limitada a loopback) y `mcp_server.py` (servidor MCP). No se mencionan integraciones oficiales con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estos motores de inferencia no son aplicables directamente.
- Latencia y throughput estimados: no disponibles. La API admite lotes de hasta 128 registros por peticion.

## Comparativa con modelos similares

No se dispone de datos verificables de especificaciones, contexto, rendimiento ni licencia en la informacion proporcionada para construir una comparativa cuantitativa fiable. A continuacion se indican alternativas de la misma categoria (clasificacion y enrutamiento para agentes), pero los valores concretos se marcan como no disponibles por no poder confirmarse en esta ficha.

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Asterion-Decision-Omni | Clasificacion multi-tarea y routing | no disponible (repo 0,2 GB) | 512 bytes UTF-8 | Sin benchmarks publicados | no disponible | HuggingFace (safetensors) |
| Llama Guard (familia) | Guardrails / moderacion | no verificado | no verificado | no verificado | no verificado | no verificado |
| RouteLLM y enrutadores similares | Routing de consultas | no verificado | no verificado | no verificado | no verificado | no verificado |
| Clasificadores tipo BERT/RoBERTa afinados | Spam, phishing, AG News, emocion | no verificado | no verificado | no verificado | no verificado | no verificado |

La model card no proporciona comparaciones con estos ni con otros modelos.

## Limitaciones y advertencias

- Checkpoint experimental: la calidad de las tareas y la capacidad de generalizacion no han sido establecidas de forma independiente.
- Es un clasificador, no un modelo generativo: no puede responder a prompts abiertos, mantener conversacion ni escribir codigo. Un agente que lo use necesita ademas un modelo generativo separado.
- Sin benchmarks reproducibles: no se pueden anticipar tasas de acierto reales en ninguna de las diez tareas.
- Las puntuaciones softmax devueltas son puntuaciones del modelo, no probabilidades calibradas de correccion; el indicador de baja puntuacion es solo una heuristica de enrutamiento.
- Contexto muy limitado: solo procesa los primeros 512 bytes UTF-8 de cada entrada, lo que puede truncar textos largos.
- Idiomas: la metadata declara unicamente ingles (`en`); aunque existe una cabeza `multilingual_nli`, no se detallan los idiomas cubiertos, por lo que el soporte multilingue no esta confirmado.
- Licencia no disponible: no hay confirmacion de derechos de uso comercial ni de redistribucion. El propio autor recomienda confirmar la procedencia del modelo y los derechos de redistribucion antes de publicar los pesos.
- Procedencia de entrenamiento incompleta: el checkpoint no contiene metadatos suficientes para reconstruir el historial de entrenamiento de cada tensor.
- El runtime solo expone diez cabezas de tarea; no se garantiza soporte funcional para el resto de grupos de tensores del artefacto.
- Riesgo de sesgos y alucinacion en la clasificacion: no se documentan analisis de sesgo ni evaluaciones de falsos positivos/negativos, relevantes en tareas de seguridad y moderacion.
- La API local se enlaza solo a loopback, lo que limita su exposicion en red por defecto.
- La model card incluye direcciones de criptomonedas para donaciones; conviene verificar la red y la direccion antes de cualquier envio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NasledieLab/Asterion-Decision-Omni
- Perfil de la organizacion NasledieLab: https://huggingface.co/NasledieLab/models
- INFERENCE.md (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada
- Paper relacionado por nombre (no confirmado como origen de este checkpoint): [2607.11433] Omni-Decision: A Progressive Evidence-State Agent System — https://arxiv.org/abs/2607.11433
- Version HTML del paper anterior: https://arxiv.org/html/2607.11433v2
- Sitio del proyecto Omni-Decision: https://mbjinx.github.io/omnidecision_web/
- Cobertura editorial de Omni-Decision en AGI Hunt: https://agihunt.info/en/p/1a0f0f999e1a1cb8eca26216cd2
- Instalacion de PyTorch (referenciada en la model card): https://pytorch.org/get-started/locally/

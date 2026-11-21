# mradermacher/LFM3-1.7B-Heretic-Max-GGUF

## Resumen

LFM3-1.7B-Heretic-Max-GGUF es una cuantizacion en formato GGUF del modelo MihaiPopa-1/LFM3-1.7B-Heretic-Max, un derivado "abliterated" (o "decensored") del modelo LFM3 de 1.700 millones de parametros de Liquid AI. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de la comunidad, que ofrece el modelo en doce variantes de cuantizacion que van desde Q2_K (0,9 GB) hasta f16 (3,6 GB). El modelo base pertenece a la familia LFM3 (Liquid Foundation Model 3), disenada para despliegue en el borde (edge) con arquitectura propia de Liquid AI y capacidades conversacionales.

El modelo resuelve el problema de ejecutar un LLM de 1,7 mil millones de parametros en hardware modesto, incluyendo CPU y GPUs de consumo, manteniendo el soporte de conversacion multilingue en dieciseis idiomas (ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco). La variante "Heretic" implica que se ha aplicado una tecnica de abliteracion para eliminar los rechazos del modelo afinado por alineamiento, lo que lo hace atractivo para investigacion sobre seguridad y para casos donde se requiere baja censura, pero tambien conlleva riesgos importantes.

La relevancia actual radica en la combinacion de tres factores: un tamano reducido que cabe en cualquier GPU de consumo, un contexto conversacional utilizable y el formato GGUF que permite ejecucion local con llama.cpp y Ollama. El repositorio acumula 762 descargas y 0 likes desde su creacion en noviembre de 2026, lo que sugiere un interes moderado y reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles de atencion no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (otra, segun la model card) |
| Formato de pesos | GGUF (tambien disponible el base en transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 1.728.801.600 parametros perteneciente a la familia LFM3 de Liquid AI, orientada a inferencia en el borde. La model card del repositorio cuantizado no detalla la arquitectura interna (tipo de atencion, numero de capas, dimension del modelo ni estrategia de posicionamiento) ni los datos de entrenamiento: numero de tokens, composicion del corpus, uso de RLHF/DPO o tecnicas de alineamiento. Tampoco se especifica la innovacion tecnica concreta de LFM3 mas alla de la etiqueta "edge" y "conversational".

La variante "Heretic-Max" del autor MihaiPopa-1 aplica tecnicas de abliteracion, un procedimiento que modifica los pesos para eliminar direcciones de activacion asociadas a rechazos y respuestas de seguridad. El resultado es un modelo "uncensored" o "decensored" que responde a solicitudes que el modelo original rechazaria. No se dispone de informacion sobre el metodo exacto de abliteracion empleado, el numero de capas intervenidas ni las metricas de degradacion de capacidades tras el proceso. La cuantizacion realizada por mradermacher es estatica (quantize_version 2), con tensor de salida cuantizado y conversion desde formato Hugging Face.

## Capacidades

- Generacion de texto conversacional multilingue en dieciseis idiomas, incluido el espanol.
- Razonamiento basico y respuesta a instrucciones, heredado del modelo LFM3 base.
- Capacidad "uncensored": responde a solicitudes que el modelo alineado rechazaria, util para investigacion sobre seguridad y red teaming.
- Soporte de conversacion multi-turno (etiqueta "conversational" en la model card).
- Despliegue en el borde: tamano reducido compatible con CPU y GPUs de consumo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: el modelo permite estudiar como responde un LLM sin capas de rechazo, comparando su comportamiento con el modelo original alineado para analizar sesgos y riesgos de jailbreak.
- Despliegue local en portatiles y equipos sin GPU dedicada: la variante Q4_K_M (1,2 GB) se ejecuta en CPU con llama.cpp, permitiendo un asistente conversacional offline en espanol sin conexion a la nube.
- Prototipado rapido de chatbots: con 1,7 mil millones de parametros y contexto conversacional, sirve para validar flujos de dialogo antes de migrar a modelos mayores.
- Educacion e investigacion academica: su tamano permite ejecutar experimentos de fine-tuning y evaluacion en una unica GPU de consumo, con coste computacional bajo.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o contenido donde el modelo alineado impondria filtros, siempre con supervision humana.
- Aplicaciones embebidas y edge computing: integracion en dispositivos con recursos limitados (Raspberry Pi, mini-PC) mediante llama.cpp u Ollama para tareas de clasificacion y generacion de texto breve.
- Traduccion y asistencia multilingue ligera: cobertura de dieciseis idiomas para tareas de traduccion informal o resumen en entornos con restricciones de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q2_K (0,9 GB de pesos), 1,2-1,4 GB para Q4_K_M/Q5_K_M, 1,5 GB para Q6_K, 1,9 GB para Q8_0 y 3,6 GB para f16, mas overhead de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); en GPUs de 8 GB o mas (RTX 3070, RTX 4070, RTX 4090) cabe holgadamente incluso en f16.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El modelo base en transformers requiere `custom_code` y la libreria transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en tiempo real en GPU de consumo y velocidad moderada en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Max-GGUF | 1,73 B | no disponible | lfm1.0 | GGUF | Variante abliterated, 16 idiomas |
| Modelo base LFM3-1.7B (Liquid AI) | 1,73 B | no disponible | lfm1.0 | safetensors | Version alineada, sin abliteracion |
| MihaiPopa-1/LFM3-1.7B-Heretic-Max | 1,73 B | no disponible | lfm1.0 | safetensors | Modelo origen de esta cuantizacion |

No se dispone de datos de benchmarks ni de modelos comparables de otros fabricantes con especificaciones verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina los rechazos de seguridad: el modelo puede generar contenido danino, ofensivo o ilegal sin filtros, lo que lo desaconseja para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: con 1,7 mil millones de parametros, la capacidad de razonamiento y la fiabilidad factual son limitadas en comparacion con modelos de mayor tamano.
- La licencia lfm1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del modelo base antes de desplegarlo en produccion.
- No se documentan sesgos especificos, pero la abliteracion puede amplificar sesgos presentes en los datos de entrenamiento originales.
- Longitud de contexto no disponible: no se puede garantizar el rendimiento en conversaciones largas o documentos extensos.
- La model card no detalla la degradacion de capacidades tras la abliteracion; es probable una perdida de calidad en tareas de razonamiento e instrucciones complejas.
- El repositorio tiene 0 likes y 762 descargas, con validacion comunitaria escasa; no hay evaluaciones independientes publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Max-GGUF
- Modelo base: https://huggingface.co/MihaiPopa-1/LFM3-1.7B-Heretic-Max
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Max-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-Heretic-Max-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png

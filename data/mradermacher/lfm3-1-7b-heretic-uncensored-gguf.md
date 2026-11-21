# mradermacher/LFM3-1.7B-Heretic-Uncensored-GGUF

## Resumen

LFM3-1.7B-Heretic-Uncensored-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo Peymandc/LFM3-1.7B-Heretic-Uncensored, un derivado "abliterated" (decensurado) del modelo LiquidAI LFM3 de 1.700 millones de parametros. La cuantizacion la realiza mradermacher, un publicador habitual de versiones GGUF de modelos open source, y esta pensada para ejecucion local en CPU y GPU de gama baja mediante llama.cpp y ecosistemas compatibles. El modelo base pertenece a la familia LFM3 (Liquid Foundation Model 3) de Liquid AI, orientada a despliegue en el edge.

El interes principal de esta ficha es que combina dos factores poco habituales: un tamano reducido (1,73 mil millones de parametros reales segun los safetensors del repo) que permite inferencia en hardware de consumo, y un proceso de "abliteration" o decensurado que elimina total o parcialmente los rechazos de seguridad del modelo original. Esto lo hace relevante para investigadores que estudian alineamiento, para desarrolladores que necesitan un modelo conversacional sin filtros en entornos controlados y para quienes trabajan con despliegues offline en dispositivos con poca memoria.

La licencia declarada es lfm1.0, la licencia propia de Liquid AI, lo que impone restricciones adicionales respecto a licencias permisivas como Apache 2.0 o MIT. El repo ocupa 15,9 GB en total e incluye once cuantizaciones estaticas distintas, desde Q2_K (0,9 GB) hasta f16 (3,6 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles de atencion y capas no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 (1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas declarados en la model card) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, etiquetada como "other") |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es LFM3, la tercera generacion de los Liquid Foundation Models de Liquid AI, una familia disenada para despliegue en el edge con un equilibrio entre calidad conversacional y coste computacional. La model card del repo cuantizado no detalla la arquitectura interna (tipo de atencion, numero de capas, dimension del estado oculto ni mecanismo de contexto), por lo que esos datos deben consultarse en la documentacion oficial de Liquid AI. Los tags indican "liquid", "lfm3", "edge" y "conversational", y la libreria declarada es transformers con "custom_code", lo que implica que la carga del modelo requiere codigo propio del autor y no basta con una configuracion estandar de transformers.

El proceso de "abliteration" aplicado por Peymandc consiste en modificar los pesos del modelo original para eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder a peticiones que el modelo original rechazaria. La model card no documenta el metodo exacto (por ejemplo, si se uso una direccion de rechazo calculada con pares de prompts, refinamiento iterativo o tecnicas de ortogonalizacion), ni el volumen o la composicion de los datos de entrenamiento del modelo base, ni si hubo RLHF o DPO. Tampoco se especifica el proceso de cuantizacion mas alla de la lista de tipos ofrecidos; mradermacher indica que las cuantizaciones ponderadas/imatrix estan en un repo separado (LFM3-1.7B-Heretic-Uncensored-i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos y asistentes.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1,73 B de parametros.
- Capacidad multilingue declarada en 17 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Modo "uncensored": el proceso de abliteration elimina los rechazos del modelo alineado original, de modo que responde a peticiones que el modelo base rechazaria.
- Compatibilidad con endpoints GGUF (tag "endpoints_compatible"), lo que permite servirlo con infraestructura estandar de llama.cpp.
- No consta soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales locales y offline: el modelo cabe en menos de 1 GB con Q2_K y en torno a 1,2 GB con Q4_K_M, por lo que puede ejecutarse en portatiles sin GPU dedicada o en dispositivos edge con llama.cpp, manteniendo conversaciones multi-turno sin conexion.
- Investigacion sobre alineamiento y seguridad: comparar las respuestas del modelo abliterated con las del LFM3 original permite estudiar que comportamientos de rechazo se eliminan, como cambia la distribucion de respuestas y que riesgos aparecen al retirar el alineamiento.
- Prototipado rapido de chatbots sin restricciones de contenido: en entornos de desarrollo controlados, sirve para generar datos sinteticos de dialogo o escenarios de prueba que un modelo censurado rechazaria, sin necesidad de infraestructura GPU.
- Despliegue en hardware de consumo: con Q4_K_M (1,2 GB) o Q5_K_M (1,4 GB) puede servirse en una RTX 3060 de 12 GB o incluso en una GTX 1650 de 4 GB, dejando margen para el contexto y el resto del sistema.
- Traduccion y procesamiento multilingue ligero: los 17 idiomas declarados permiten tareas de traduccion o clasificacion de texto en entornos con recursos limitados, aunque la calidad en idiomas distintos del ingles sera inferior a la de modelos mayores.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o contenido narrativo que requiera tematicas sensibles, ejecutada en local para evitar dependencias de APIs externas.
- Evaluacion de cuantizaciones: el repo ofrece once variantes para medir el impacto de la cuantizacion en la calidad de un modelo de 1,73 B, util para calibrar que nivel (Q3_K_M, Q4_K_M, Q6_K) es aceptable en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB con Q2_K, 1,2 GB con Q4_K_M, 1,4 GB con Q5_K_M, 1,9 GB con Q8_0 y 3,6 GB con f16, mas el espacio para la cache KV segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) permiten contextos largos y mayor throughput. En GPU de datacenter (A100, H100) el modelo esta infrautilizado por su tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en graficas integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con servidores de endpoints estandar. La carga con transformers requiere "custom_code" del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera inferencia en tiempo real en CPU moderna con cuantizaciones Q4, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Uncensored-GGUF (este) | 1,73 B | no disponible | lfm1.0 | GGUF | Version abliterated y cuantizada de LFM3 |
| LFM3-1.7B base (Liquid AI) | 1,7 B (aproximado) | no disponible | lfm1.0 | safetensors | Modelo original alineado, sin decensurar |
| Peymandc/LFM3-1.7B-Heretic-Uncensored | 1,73 B | no disponible | lfm1.0 | safetensors | Modelo base de esta cuantizacion, en precision completa |
| mradermacher/LFM3-1.7B-Heretic-Uncensored-i1-GGUF | 1,73 B | no disponible | lfm1.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de otros fabricantes; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros. No debe exponerse como servicio publico sin moderacion externa.
- Riesgo elevado de alucinacion: con 1,73 B de parametros, la fiabilidad factica es limitada y las respuestas pueden ser plausibles pero incorrectas, especialmente en tareas de conocimiento y matematicas.
- La licencia lfm1.0 es una licencia propia de Liquid AI con posibles restricciones de uso comercial; debe revisarse el texto completo antes de cualquier despliegue en produccion. El tag "license: other" indica que no es una licencia estandar permisiva.
- La model card no documenta el metodo de abliteration ni los datos usados, lo que dificulta evaluar la reproducibilidad y el alcance real del decensurado (puede ser parcial en algunos dominios).
- No hay informacion sobre la longitud de contexto efectiva ni sobre el rendimiento en contextos largos; los modelos pequenos suelen degradarse rapidamente al aumentar la ventana.
- La calidad multilingue en idiomas distintos del ingles no esta validada con benchmarks; los 17 idiomas declarados reflejan la cobertura del modelo base, no necesariamente un rendimiento uniforme.
- Requiere "custom_code" para cargarse con transformers, lo que anade dependencias y posibles problemas de compatibilidad con versiones futuras de la libreria.
- El repo incluye cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") que degradan notablemente la coherencia; para uso real se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-Heretic-Uncensored-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

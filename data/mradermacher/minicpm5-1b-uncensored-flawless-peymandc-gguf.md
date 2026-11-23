# mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF

## Resumen

MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF es la version cuantizada en formato GGUF del modelo Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc, una variante "uncensored" (abliterated/decensored) del MiniCPM5 de 1B parametros. La cuantizacion la realiza mradermacher, un conocido contribuidor de la comunidad que publica versiones GGUF estaticas de modelos populares para facilitar su despliegue en llama.cpp y entornos de inferencia local. El modelo base pertenece a la familia MiniCPM5, orientada a inferencia en dispositivo (edge-ai) con soporte de contexto largo y tool calling.

El modelo cuenta con aproximadamente 1.080 millones de parametros (1,08B) en precision completa, lo que lo situa en la categoria de modelos pequenos optimizados para ejecucion en hardware de consumo. Los tags del repositorio indican capacidades de long-context, tool-calling, on-device y edge-ai, ademas de las etiquetas heretic, uncensored, decensored y abliterated, que senalan que se ha aplicado un proceso de eliminacion de rechazos (abliteration) sobre el modelo original. Soporta ingles y chino como idiomas principales y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que combina dos tendencias: por un lado, la demanda de modelos pequenos desplegables en local con contexto largo y soporte de herramientas; por otro, la existencia de variantes sin censura para casos de uso donde los rechazos del modelo base resultan limitantes. El repositorio incluye 12 cuantizaciones estaticas que van desde Q2_K (0,6 GB) hasta f16 (2,3 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5, segun tags del repositorio) |
| Parametros totales | 1.080.632.832 (1,08B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el tag "long-context" sugiere contexto extendido, sin cifra concreta) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia MiniCPM5 y su naturaleza transformer. Los tags del repositorio indican que se trata de un modelo de generacion de texto con capacidades de contexto largo y tool calling, orientado a inferencia en dispositivo. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El aspecto tecnico mas destacable es el proceso de abliteration o decensoring aplicado sobre el modelo original, que segun los tags (heretic, uncensored, decensored, abliterated) elimina o modifica las direcciones de activacion asociadas a los rechazos del modelo. Esta ficha documenta la version cuantizada en GGUF producida por mradermacher, que incluye cuantizaciones estaticas (no ponderadas ni con imatrix, segun indica el propio autor) generadas con convert_type hf y quantize_version 2. El autor senala que las cuantizaciones ponderadas o con imatrix no estan disponibles por el momento.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Soporte de contexto largo (tag long-context), sin cifra concreta de ventana publicada.
- Tool calling / function calling (tag tool-calling).
- Orientado a inferencia en dispositivo y entornos edge (tags on-device, edge-ai).
- Variante sin censura (abliterated/decensored): menor probabilidad de rechazos ante peticiones que el modelo base rechazaria.
- Compatible con endpoints (tag endpoints_compatible).
- No se documentan capacidades de vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistentes conversacionales locales: el modelo, con 1,08B parametros y cuantizaciones de 0,6 a 1,3 GB, puede ejecutarse en portatiles y dispositivos de gama media para mantener conversaciones multi-turno sin conexion.
- Automatizacion de agentes con tool calling: el soporte de function calling permite integrarlo en pipelines donde el modelo decide que herramienta invocar, adecuado para tareas de orquestacion ligera en entornos con recursos limitados.
- Procesamiento de documentos en ingles y chino: su soporte bilingue y su etiqueta de contexto largo lo hacen util para resumen y extraccion de informacion en flujos documentales de ambos idiomas.
- Prototipado rapido en edge: al caber en cuantizaciones Q4_K_S (0,8 GB), es viable desplegarlo en Raspberry Pi, mini-PC o moviles para validar ideas antes de escalar a modelos mayores.
- Investigacion sobre alineacion y censura: al ser una variante abliterated, sirve para estudiar diferencias de comportamiento entre modelos con y sin rechazos en tareas controladas.
- Generacion de texto en entornos con privacidad estricta: la inferencia local con llama.cpp evita enviar datos a servicios externos, util en sectores regulados.
- Experimentacion con cuantizaciones: el repositorio ofrece 12 variantes que permiten medir el impacto de la cuantizacion en calidad y latencia sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB (Q2_K/Q3_K_S), 0,8 GB (Q4_K_S/Q4_K_M), 1,0 GB (Q6_K), 1,3 GB (Q8_0) y 2,3 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; tarjetas como RTX 3060, RTX 4060 o superiores permiten ejecutar Q8_0 o f16 con holgura. Para despliegues en servidor, A100 o H100 no son necesarias dado el tamano del modelo, pero pueden usarse para alto throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers. No se confirma soporte de vLLM o TGI para esta variante GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF (este) | 1,08B | no disponible (tag long-context) | Apache 2.0 | GGUF | Variante abliterated, 12 cuantizaciones |
| Modelo base Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc | 1,08B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| Familia MiniCPM5 original | no disponible | no disponible | no disponible | no disponible | Modelo de referencia sin decensoring |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la eliminacion de rechazos puede aumentar la probabilidad de generar contenido danino, sesgado o inapropiado; no se recomienda su uso sin filtros adicionales en aplicaciones orientadas al publico.
- Riesgo de alucinacion: con 1,08B parametros, la capacidad de razonamiento y la fidelidad factual son limitadas en comparacion con modelos mayores; conviene verificar salidas en tareas criticas.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto no especificada numericamente en la informacion disponible; el tag long-context no garantiza un tamano concreto de ventana.
- Cuantizaciones estaticas sin imatrix: el autor indica que las versiones ponderadas no estan disponibles, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento del modelo sin censura puede incumplir politicas de plataformas o normativas sectoriales; revisar el contexto de despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo, sin evidencia de uso en produccion.
- No se documentan procesos de evaluacion de sesgos ni de seguridad en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF
- Modelo base: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests

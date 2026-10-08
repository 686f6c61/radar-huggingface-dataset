# mradermacher/AGI-Eval-OA-Judge-GGUF

## Resumen

Este repositorio contiene versiones cuantizadas en formato GGUF del modelo AGI-Eval-OA-Judge, desarrollado originalmente por AGI-Eval-Official y convertido por mradermacher. Se trata de un modelo de 32.763.876.352 parametros (aproximadamente 32,76 mil millones) publicado bajo licencia MIT, cuyo nombre sugiere que esta disenado para actuar como juez automatico de respuestas abiertas (open answer) dentro del ecosistema de evaluacion AGI-Eval. El repositorio no incluye una model card tecnica detallada: la unica documentacion disponible es la generada por el proceso de cuantizacion.

La relevancia practica de esta publicacion es que permite ejecutar un modelo juez de ~33B en hardware de consumo o en servidores modestos, gracias a las 11 cuantizaciones disponibles (desde Q2_K de 12,4 GB hasta Q8_0 de 34,9 GB). Los modelos juez se emplean cada vez mas como componente de pipelines de evaluacion automatica de LLM, filtrado de datos sinteticos y anotacion de preferencias, tareas en las que un modelo de este tamano suele ofrecer un equilibrio razonable entre coste de inferencia y calidad de juicio.

Es importante senalar que no hay informacion publicada en el material proporcionado sobre la arquitectura interna, la longitud de contexto, el dataset de entrenamiento o los resultados de benchmarks del modelo base. Todas las afirmaciones de esta ficha se limitan a lo indicado en la model card del repo GGUF, en los metadatos de HuggingFace y en el nombre y origen del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el recuento de parametros, 32.763.876.352, es compatible con un transformer decoder-only de gran tamano, pero no esta confirmado) |
| Parametros totales | 32.763.876.352 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (el repositorio base publica pesos en safetensors, segun el recuento de parametros y la etiqueta transformers) |

Otros datos de interes: el repositorio ocupa 224,0 GB en total (suma de todas las cuantizaciones), acumula 357 descargas y 0 likes, y fue creado el 19 de noviembre de 2025 con ultima actualizacion el 8 de octubre de 2026. La etiqueta de pipeline aparece como "no disponible". El autor indica que no hay cuantizaciones con imatrix ni ponderadas publicadas por el momento.

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo en el material proporcionado. La model card del repositorio GGUF se limita a indicar los parametros de la conversion (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, `vocab_type` vacio), la lista de cuantizaciones generadas y el modelo de origen (`AGI-Eval-Official/AGI-Eval-OA-Judge`). El modelo base se distribuye etiquetado con la libreria `transformers`, lo que implica pesos en formato safetensors compatibles con el ecosistema HuggingFace.

Tampoco se documenta el proceso de entrenamiento: no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como SFT, RLHF o DPO. Dado el nombre del modelo (AGI-Eval-OA-Judge) y su publicacion por parte de AGI-Eval-Official, la hipotesis mas razonable es que se trate de un modelo afinado especificamente para tareas de evaluacion de respuestas abiertas (judge), pero esto no puede confirmarse con la informacion disponible. La unica innovacion tecnica documentada en este repositorio es el propio proceso de cuantizacion GGUF realizado con llama.cpp, que permite reducir el modelo a partir de 12,4 GB con Q2_K.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y `endpoints_compatible`, por lo que soporta el formato de chat tipico de transformers y de los endpoints de HuggingFace.
- Evaluacion automatica de respuestas (hipotesis basada en el nombre del modelo): el sufijo "OA-Judge" sugiere evaluacion de respuestas abiertas, probablemente mediante puntuaciones o comparaciones tipo LLM-as-a-judge. No confirmado en la documentacion.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en` de la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible; no hay ninguna referencia a capacidades multimodales ni a modos de razonamiento extendido.

## Casos de uso

- Evaluacion automatica de respuestas generadas por otros LLM en pipelines de investigacion: el modelo puede emplearse como juez para puntuar salidas de modelos candidatos en tareas de respuesta abierta, sustituyendo o complementando la evaluacion humana en fase de prototipado. Su licencia MIT facilita su integracion en entornos academicos y comerciales.
- Filtrado y curación de datasets sinteticos: al actuar como juez, puede descartar muestras de baja calidad generadas por modelos generadores antes de incorporarlas a un corpus de entrenamiento, reduciendo el coste frente a la revision manual.
- Comparacion por pares (pairwise comparison) para construir datasets de preferencias: el modelo puede evaluar dos respuestas ante el mismo prompt y emitir una preferencia, generando datos utiles para entrenamiento con DPO o RLHF.
- Validacion de asistentes conversacionales antes de desplegarlos: ejecutando el juez sobre un conjunto de prompts de regresion, se puede medir la degradacion de calidad entre versiones de un modelo de produccion.
- Evaluacion de sistemas RAG: dado que el modelo puede juzgar respuestas abiertas, es util para verificar si la respuesta generada por un sistema de recuperacion aumentada se ajusta a la pregunta y al contexto recuperado.
- Investigacion en metaevaluacion: analizar el sesgo y la correlacion de un juez LLM de ~33B con anotadores humanos es un objeto de estudio habitual; esta cuantizacion permite reproducir experimentos en una sola GPU de 24 GB con Q4_K_M.
- Despliegue local para equipos con requisitos de privacidad: al poder ejecutarse con llama.cpp u Ollama sobre hardware propio, permite evaluar respuestas sensibles sin enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye ninguna tabla de evaluacion, ni del modelo cuantizado ni del modelo base, y los resultados de busqueda obtenidos no aportan metricas concretas para AGI-Eval-OA-Judge.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion se derivan del tamano de archivo publicado para cada cuantizacion mas un margen para cache KV, buffers y overhead del runtime. No son medidas oficiales del autor.

- Q2_K (12,4 GB de archivo): aproximadamente 14-15 GB de VRAM en total. Cabe con holgura en RTX 3090, RTX 4090, RTX 5090 y GPUs profesionales de 24 GB o mas.
- Q3_K_S (14,5 GB) y IQ4_XS (18,0 GB): aproximadamente 16-20 GB. Ejecutables en GPUs de 24 GB con contexto moderado.
- Q4_K_S (18,9 GB) y Q4_K_M (20,0 GB): aproximadamente 21-23 GB. Cabe en una RTX 4090 o RTX 3090 de 24 GB, pero con poco margen para contextos largos; conviene reducir `n_ctx` o repartir capas en CPU.
- Q5_K_M (23,4 GB), Q6_K (27,0 GB): requieren 48 GB de VRAM o bien descarga parcial a RAM/CPU. Adecuados para A6000, L40S, A100 40 GB (Q5) o A100 80 GB y H100 (Q6).
- Q8_0 (34,9 GB): requiere 48 GB o mas de VRAM (A100 80 GB, H100, 2x RTX 4090 con reparto por capas).
- Inferencia en FP16 (no incluida en este repositorio): se estima en torno a 65 GB de pesos, por lo que necesitaria A100 80 GB o H100.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. vLLM soporta GGUF de forma experimental, pero no es la ruta recomendada para este formato; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Nota practica: dado que el modelo tiene ~33B parametros, un despliegue en CPU exclusivamente ofrecera velocidades de pocos tokens por segundo; se recomienda offload a GPU de al menos la mayoria de las capas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos competidores en la informacion proporcionada. La comparativa se limita, por tanto, a caracteristicas verificables de disponibilidad y licencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| mradermacher/AGI-Eval-OA-Judge-GGUF (este) | 32,76 B | no disponible | GGUF (11 cuantizaciones) | MIT | no disponible |
| AGI-Eval-Official/AGI-Eval-OA-Judge (modelo base) | 32,76 B | no disponible | safetensors (transformers) | MIT segun el repo derivado | no disponible |
| Otros modelos juez de ~30B (por ejemplo, Prometheus, JudgeLM u otros ajustes de evaluacion) | no disponible | no disponible | no disponible | no disponible | no disponible |

Para una comparacion rigurosa con alternativas de la misma categoria (modelos juez de ~30B) seria necesario consultar los repositorios de esos modelos y los leaderboards de AGI-Eval, datos que no forman parte de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe arquitectura, contexto, entrenamiento ni evaluacion, lo que dificulta justificar su uso en produccion frente a un comite tecnico o un proceso de revision.
- Sesgos conocidos: no disponible. Al no haber informacion sobre el dataset de entrenamiento, no es posible caracterizar sesgos demograficos, culturales o de dominio. Los modelos juez presentan ademas sesgos tipicos documentados en la literatura (sesgo de posicion, de verbosidad y de autopreferencia) que conviene testear empiricamente antes de confiar en sus puntuaciones.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano cuando se les pide emitir juicios; la ausencia de benchmarks impide cuantificarlo.
- Limitacion idiomatica: el modelo esta etiquetado unicamente para ingles. Su comportamiento en castellano no esta documentado y no deberia asumirse.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en prompts largos, algo critico en tareas de evaluacion con rúbricas extensas o documentos adjuntos.
- Cuantizaciones muy agresivas: las versiones Q2_K y Q3_K pueden degradar de forma notable la calidad del juicio. El autor marca explicitamente Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0 como opciones rapidas y de buena calidad.
- Licencia: MIT permite uso comercial, modificacion y redistribucion sin obligacion de publicar derivados, siempre que se conserve el aviso de copyright y la licencia. No se han identificado restricciones adicionales en la informacion disponible, pero conviene verificar la licencia del modelo base en su repositorio original antes de un despliegue comercial.
- Repositorio de terceros: este repo es una conversion no oficial realizada por mradermacher; los posibles errores de conversion no son responsabilidad del autor original del modelo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/AGI-Eval-OA-Judge-GGUF
- Modelo base: https://huggingface.co/AGI-Eval-Official/AGI-Eval-OA-Judge
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#AGI-Eval-OA-Judge-GGUF
- Perfil del cuantizador (mradermacher): https://huggingface.co/mradermacher
- Solicitudes de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- AGI-Eval (sitio oficial): https://agi-eval.org/home
- AGI Evals (runner y leaderboard): https://agi-eval.studio/
- AGI Evals dashboard: https://agi-eval.studio/dashboard

# mradermacher/RusNanoMath-800M-GGUF

## Resumen

RusNanoMath-800M-GGUF es la distribucion en formato GGUF del modelo RusNanoMath-800M, desarrollado originalmente por RusMiniLM y cuantizado por mradermacher. Se trata de un modelo compacto de 752 millones de parametros (etiquetado comercialmente como "800M") especializado en razonamiento matematico, con soporte para cadenas de razonamiento (chain of thought) y orientado a problemas de nivel olimpiada. Su relevancia radica en ofrecer capacidades de razonamiento matematico en un tamano sub-1B, lo que permite despliegue en hardware modesto, incluidas GPUs de consumo.

El modelo se construye sobre una arquitectura con atencion lineal (linear attention), segun los tags del repositorio, y esta etiquetado con la referencia "qwen3.5", lo que sugiere una base arquitectonica inspirada en la familia Qwen. El entrenamiento combina SFT (supervised fine-tuning) y SimPO (Simple Preference Optimization), una variante de optimizacion de preferencias sin modelo de recompensa. El modelo base es RusMiniLM/RusNanoMath-800M.

Esta version GGUF, publicada por mradermacher, facilita la ejecucion local mediante llama.cpp y herramientas compatibles, con un rango de cuantizaciones que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB). La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El modelo esta orientado a los idiomas ruso e ingles, lo que limita su aplicabilidad directa en castellano sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal (segun tags; base inspirada en Qwen 3.5) |
| Parametros totales | 752.393.024 (dato de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con atencion lineal, segun los tags del repositorio, lo que reduce el coste computacional del mecanismo de atencion en secuencias largas en comparacion con la atencion cuadratica estandar. La referencia "qwen3.5" en los tags sugiere que la arquitectura se inspira en la familia Qwen, aunque no se dispone de detalles tecnicos confirmados sobre la configuracion exacta de capas, dimensiones ocultas o numero de cabezas de atencion.

El entrenamiento combina SFT (supervised fine-tuning) sobre datos de razonamiento matematico y SimPO para alineamiento de preferencias. El modelo esta especializado en problemas de nivel olimpiada y genera cadenas de razonamiento (chain of thought) antes de emitir la respuesta final. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF. El modelo base fue desarrollado por RusMiniLM y esta orientado a los idiomas ruso e ingles.

## Capacidades

- Generacion de texto y razonamiento matematico con cadenas de razonamiento explicitas (chain of thought).
- Resolucion de problemas de matematicas de nivel olimpiada.
- Razonamiento multi-paso orientado a la resolucion de problemas estructurados.
- Soporte bilingue: ruso e ingles.
- Capacidad conversacional (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se ha confirmado soporte de tool calling, function calling, vision, audio ni modo thinking explicito mas alla del CoT.

## Casos de uso

- Tutoria matematica automatizada en ruso e ingles: el modelo puede generar explicaciones paso a paso de problemas de nivel olimpiada gracias a su entrenamiento en cadenas de razonamiento, adecuado para plataformas educativas en esos idiomas.
- Generacion de problemas y soluciones para bancos de ejercicios: util para crear datasets sinteticos de matematicas con soluciones razonadas, aprovechando su especializacion en CoT.
- Evaluacion de razonamiento matematico en pipelines de investigacion: su tamano sub-1B permite ejecutarlo en paralelo con otros modelos para comparar estrategias de razonamiento sin coste elevado.
- Despliegue en entornos con recursos limitados: con cuantizaciones Q4_K_M de 0,6 GB, cabe en GPUs de consumo y en CPU, permitiendo inferencia local en portatiles o dispositivos edge.
- Prototipado rapido de asistentes matematicos: la licencia Apache 2.0 y el formato GGUF facilitan iteraciones rapidas en desarrollo sin restricciones legales.
- Filtrado y clasificacion de problemas matematicos: puede usarse para validar o categorizar enunciados y soluciones en pipelines de procesamiento de datos educativos.
- Investigacion en alineamiento con SimPO: sirve como caso de estudio de un modelo pequeno entrenado con optimizacion de preferencias para una tarea especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,9 GB con cuantizaciones Q2_K a Q8_0; 1,6 GB con f16. El modelo base en safetensors requiere alrededor de 1,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU gracias al formato GGUF.
- Opciones de despliegue: llama.cpp, Ollama, y herramientas compatibles con GGUF; el modelo base es compatible con transformers y con endpoints (tag "endpoints_compatible"). vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusNanoMath-800M | 752M | no disponible | ru, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Math-1.5B | 1.5B | 4K (tipico) | multilingue | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Math-7B | 7B | 4K (tipico) | en, zh | custom | safetensors |

La comparativa se limita a alternativas de la misma categoria (razonamiento matematico en modelos pequenos). RusNanoMath-800M destaca por su tamano reducido y su enfoque bilingue ruso-ingles, mientras que Qwen2.5-Math ofrece mayor contexto y multilingue, y DeepSeek-Math mayor capacidad a costa de tamano. No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Idiomas limitados a ruso e ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Riesgo de alucinacion en pasos intermedios de razonamiento matematico, especialmente en problemas complejos o fuera de distribucion.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- La longitud de contexto no esta documentada, lo que impide garantizar el manejo de problemas largos o conversaciones multi-turno extensas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede tener condiciones adicionales no reflejadas en esta ficha; conviene verificar el repositorio original.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar significativamente la calidad del razonamiento; se recomienda Q4_K_M o superior para tareas matematicas.
- No se han publicado benchmarks, por lo que las afirmaciones sobre capacidad de nivel olimpiada no estan cuantificadas de forma verificable.
- El tag "qwen3.5" no confirma compatibilidad total con la arquitectura Qwen; verificar antes de integrar en pipelines que dependan de esa familia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RusNanoMath-800M-GGUF
- Modelo base: https://huggingface.co/RusMiniLM/RusNanoMath-800M
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#RusNanoMath-800M-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

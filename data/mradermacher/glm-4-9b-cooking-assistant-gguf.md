# mradermacher/GLM-4-9B-Cooking-Assistant-GGUF

## Resumen

GLM-4-9B-Cooking-Assistant-GGUF es una cuantizacion estatica en formato GGUF del modelo HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant, un ajuste fino del GLM-4-9B de Zhipu AI orientado a tareas culinarias: recetas, tecnicas de cocina y asistencia conversacional en ese dominio. El trabajo de cuantizacion lo firma mradermacher, autor habitual de conversiones GGUF para llama.cpp, y publica once variantes que van desde Q2_K (4,1 GB) hasta f16 (18,9 GB), pasando por Q4_K_M (6,3 GB) y Q8_0 (10,1 GB).

El modelo base cuenta con 9.400.279.040 parametros (9,4 mil millones) y hereda la arquitectura transformer densa de la familia GLM-4. Segun la model card, el ajuste se ha realizado mediante DPO (Direct Preference Optimization) sobre el modelo GLM-4-9B original, con etiquetas que mencionan "provenance" y "abstention", lo que sugiere un enfasis en la trazabilidad de las respuestas y en la capacidad de abstenerse cuando no hay informacion fiable. La licencia declarada es MIT.

La relevancia de esta ficha es practica: permite desplegar un asistente culinario especializado en hardware de consumo (una RTX 4090 con 24 GB puede ejecutar la variante Q8_0 sin problemas y la Q4_K_M en GPUs de 8 GB), con soporte declarado para 25 idiomas, incluido el espanol. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento y el modelo base del ajuste no esta verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia GLM-4 de Zhipu AI, segun el nombre del modelo base) |
| Parametros totales | 9.400.279.040 (9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | 25 idiomas: en, es, pt, it, fr, nl, de, ru, bn, id, fa, ja, pl, sv, vi, tl, he, ml, tr, zh, ms, th, fi, ar, ta, hi |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original esta en safetensors |
| Tamano del repositorio | 86,8 GB (incluye todas las variantes) |
| Libreria | transformers (metadato); inferencia via llama.cpp y derivados |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 9,4 mil millones de parametros de la familia GLM-4. La model card del repositorio cuantizado no detalla la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion), por lo que esos datos deben consultarse en la documentacion del GLM-4-9B original de Zhipu AI, no disponible en la informacion proporcionada. El ajuste fino declarado es un DPO sobre el modelo base, con un dataset de evaluacion propio (HumanjavaEnterprises/cooking-assistant-eval) y etiquetas que apuntan a "provenance" (trazabilidad de fuentes) y "abstention" (abstencion ante preguntas fuera de dominio o sin respaldo).

No se especifica el numero de tokens de entrenamiento, la composicion del dataset de preferencias ni si hubo una fase previa de SFT. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Las cuantizaciones son estaticas, es decir, generadas sin imatrix ni pesos ponderados; el propio autor indica que las variantes con imatrix no estan disponibles en el momento de publicacion.

## Capacidades

- Generacion de texto conversacional especializada en cocina: recetas, sustituciones de ingredientes, tecnicas culinarias y planificacion de menus.
- Razonamiento multi-turno en el dominio culinario, con soporte para conversaciones de varios turnos.
- Capacidad de abstencion declarada: el modelo esta entrenado para no responder cuando carece de informacion fiable (tag "abstention").
- Trazabilidad de fuentes declarada (tag "provenance"), orientada a indicar el origen de las recomendaciones.
- Soporte multilingue declarado para 25 idiomas, incluido el espanol.
- Formato conversacional (tag "conversational") compatible con plantillas de chat de transformers.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode). No disponible.

## Casos de uso

- Asistente culinario en aplicaciones moviles o web: el modelo puede gestionar conversaciones multi-turno sobre recetas y tecnicas, y su capacidad de abstencion declarada reduce el riesgo de inventar cantidades o pasos peligrosos cuando la consulta queda fuera de su dominio.
- Generacion de recetas personalizadas: a partir de restricciones dieteticas (alergias, vegetarianismo, intolerancias) y de los ingredientes disponibles, el modelo produce recetas adaptadas, apoyandose en su ajuste DPO para preferir respuestas utiles y coherentes.
- Planificacion de menus semanales: el modelo puede encadenar varias peticiones para construir un menu equilibrado, con lista de la compra derivada, en una sola sesion conversacional.
- Atencion al cliente de un servicio de reparto o suscripcion de comida: con la variante Q8_0 desplegada en una GPU de 24 GB, se puede servir a varios usuarios concurrentes mediante llama.cpp o vLLM (si soporta el formato), respondiendo dudas sobre ingredientes, alérgenos y sustituciones.
- Educacion culinaria: explicacion de tecnicas (emulsion, fermentacion, reposteria) con capacidad de reformular y adaptar el nivel de detalle al usuario, en cualquiera de los 25 idiomas declarados.
- Integracion en asistentes de voz o domoticos de cocina: la variante Q4_K_M (6,3 GB) cabe en GPUs de consumo y permite inferencia local de baja latencia, lo que facilita despliegues en electrodomesticos inteligentes o Raspberry Pi con aceleracion.
- Traduccion y localizacion de contenido gastronomico: el soporte multilingue permite adaptar recetas entre los 25 idiomas declarados, aunque la calidad por idioma no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas del dominio culinario, y el dataset de evaluacion (HumanjavaEnterprises/cooking-assistant-eval) no presenta resultados publicados en el repositorio.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos; anadir 1-2 GB para contexto y overhead):
  - Q2_K: ~4,1 GB
  - Q3_K_S: ~4,7 GB
  - Q3_K_M: ~5,1 GB
  - Q3_K_L: ~5,3 GB
  - IQ4_XS: ~5,4 GB
  - Q4_K_S: ~5,9 GB
  - Q4_K_M: ~6,3 GB
  - Q5_K_S: ~6,8 GB
  - Q5_K_M: ~7,2 GB
  - Q6_K: ~8,4 GB
  - Q8_0: ~10,1 GB
  - f16: ~18,9 GB
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M; RTX 4070/4080 para Q6_K y Q8_0; RTX 4090 (24 GB) o A100/H100 para f16 y para servir multiples usuarios concurrentes.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB (Q4_K_M, Q5_K_M, Q6_K) hasta una RTX 4060 Ti 16 GB (Q8_0). Las variantes Q2_K y Q3_K caben incluso en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. Los tags incluyen "endpoints_compatible", lo que sugiere compatibilidad con endpoints tipo OpenAI en plataformas de inferencia.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-4-9B-Cooking-Assistant (este) | 9,4 B | No disponible | MIT | GGUF (11 cuantizaciones) | Ajuste DPO culinario, 25 idiomas |
| GLM-4-9B (base, Zhipu AI) | 9,4 B | No disponible en esta ficha | No disponible | safetensors | Modelo generalista del que deriva |
| Mistral-7B-Instruct | 7,2 B | 32 K (segun version) | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar, sin especializacion culinaria |
| Llama 3.1 8B Instruct | 8 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista con contexto largo y soporte de herramientas |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo culinario frente a estas alternativas. La ventaja principal de este modelo es la especializacion en cocina y la licencia MIT, mas permisiva que la de Llama 3.1. La desventaja es la ausencia de benchmarks y de documentacion sobre el contexto maximo.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes: el rendimiento real en tareas culinarias es desconocido.
- La model card no documenta la composicion del dataset de entrenamiento ni el numero de tokens, lo que impide evaluar sesgos de dominio.
- Riesgo de alucinacion en cantidades, tiempos de coccion y temperaturas de seguridad alimentaria: aunque el modelo declara capacidad de abstencion, no hay evidencia publicada de su eficacia.
- El contexto maximo no esta documentado; conviene asumir un limite conservador en produccion.
- Aunque se declaran 25 idiomas, la calidad por idioma no esta verificada; el espanol figura en la lista pero sin evaluacion publicada.
- La licencia MIT del repositorio cuantizado no aclara si el modelo base GLM-4-9B impone restricciones adicionales; conviene revisar la licencia del modelo original de Zhipu AI antes de un uso comercial.
- Las cuantizaciones son estaticas (sin imatrix); las variantes de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Fecha de creacion del repositorio: 14 de noviembre de 2026; la informacion puede quedar desactualizada.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/GLM-4-9B-Cooking-Assistant-GGUF
- Modelo base del ajuste: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant
- Dataset de evaluacion: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- Pagina de conveniencia del autor para este modelo: https://hf.tst.eu/model#GLM-4-9B-Cooking-Assistant-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png

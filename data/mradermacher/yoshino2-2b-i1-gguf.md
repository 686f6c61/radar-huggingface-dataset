# mradermacher/Yoshino2-2B-i1-GGUF

## Resumen

Yoshino2-2B-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo base en5yme/Yoshino2-2B, publicada por mradermacher. El modelo original es un transformer denso de aproximadamente 1.940 millones de parametros (1,942,653,248 segun los pesos en safetensors) orientado a razonamiento y destilacion, entrenado sobre el dataset en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

El repositorio de mradermacher no entrena ni modifica el modelo, sino que genera cuantizaciones con imatrix (importancia ponderada) para reducir el peso de los pesos y permitir la inferencia en hardware modesto. Los ficheros van desde i1-Q2_K (1,1 GB) hasta i1-Q6_K (1,7 GB), cubriendo el rango tipico de despliegue en CPU y GPU de consumo. El autor indica que se trata de un modelo de vision y que los ficheros mmproj, si existen, se encuentran en el repositorio estatico paralelo (mradermacher/Yoshino2-2B-GGUF).

La relevancia actual de esta ficha radica en que ofrece una via practica para ejecutar un modelo de 2B especializado en razonamiento en equipos sin GPU dedicada de gama alta, con cuantizaciones de 1 a 2 GB que caben en memoria RAM y en GPUs de consumo con 4-8 GB de VRAM. La informacion publica disponible es limitada: no se detallan la longitud de contexto, la composicion exacta del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante concreta) |
| Parametros totales | 1.942.653.248 (aprox. 1,94 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |
| Tamano del repositorio | 18,6 GB (incluye todas las cuantizaciones) |
| Modelo base | en5yme/Yoshino2-2B |
| Dataset de destilacion | en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill |

## Arquitectura y entrenamiento

El modelo base Yoshino2-2B es un transformer denso de aproximadamente 1,94 mil millones de parametros. La model card del repositorio cuantizado no documenta la arquitectura interna (numero de capas, dimensiones ocultas, tipo de atencion, uso de RoPE o GQA), por lo que estos detalles no estan disponibles en la informacion proporcionada. Los tags indican que el modelo esta orientado a "distillation" y "reasoning", y el dataset asociado se denomina Nemotron-3.5-Lightning-30B-A3B-Distill, lo que sugiere que el modelo original se entreno mediante destilacion a partir de un modelo mayor (probablemente un MoE de 30B con 3B activos, segun la nomenclatura del dataset).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de pensamiento explicito. El trabajo de mradermacher se limita a la cuantizacion: genera ficheros GGUF con imatrix, una tecnica que pondera la importancia de cada tensor durante la cuantizacion para preservar mejor la calidad en tasas de bits bajas. El repositorio incluye tanto cuantizaciones estaticas (en el repo paralelo) como estas i1 (imatrix), que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag "conversational" y el pipeline declarado.
- Razonamiento: el tag "reasoning" y el origen por destilacion de un modelo mayor sugieren capacidad para tareas de razonamiento multi-paso, aunque no se detallan modos de pensamiento explicitos.
- Destilacion: el modelo se entreno sobre un dataset de destilacion, lo que puede reflejar parte de las capacidades del profesor (Nemotron-3.5-Lightning-30B-A3B).
- Vision: la model card de mradermacher advierte que "this is a vision model", aunque los ficheros mmproj, si existen, estarian en el repositorio estatico; no se confirma en la informacion disponible que el modelo base tenga torre visual.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el tag "reasoning" es la unica indicacion.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: con cuantizaciones de 1,1 a 1,7 GB, el modelo puede ejecutarse en un portatil con 8 GB de RAM mediante llama.cpp u Ollama, ofreciendo respuestas conversacionales sin conexion y sin coste de API.
- Prototipado de razonamiento en entornos con recursos limitados: la cuantizacion i1-Q4_K_M (1,4 GB) permite experimentar con un modelo afinado para razonamiento en una GPU de consumo de 4-6 GB de VRAM, util para validar pipelines antes de escalar a modelos mayores.
- Educacion e investigacion sobre destilacion: al estar entrenado sobre un dataset de destilacion de un modelo 30B-A3B, sirve como caso de estudio para analizar como se transfieren capacidades de razonamiento a un modelo denso de 2B.
- Generacion de texto en aplicaciones embebidas: el reducido tamano de las cuantizaciones Q2/Q3 (1,1-1,3 GB) permite integrar el modelo en dispositivos con poca memoria, como Raspberry Pi 5 con 8 GB o mini-PC, para tareas de generacion de texto de baja latencia.
- Filtrado y clasificacion de texto: un modelo de 2B puede usarse para tareas auxiliares de etiquetado, resumen o reescritura en ingles dentro de pipelines mas grandes, donde el coste por token importa mas que la calidad maxima.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 15 variantes de cuantizacion del mismo modelo, lo que permite medir empiricamente el impacto de la cuantizacion en perplejidad y calidad de razonamiento en un modelo pequeno.
- Base para fine-tuning ligero: al ser MIT y de 2B parametros, es un punto de partida asequible para ajuste fino con LoRA en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad para las distintas cuantizaciones. El unico dato cuantitativo es el tamano de cada fichero GGUF y la recomendacion cualitativa del autor de que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para i1-Q2_K, 1,4 GB para i1-Q4_K_M y 1,7 GB para i1-Q6_K, mas el overhead de contexto y del runtime (tipicamente 0,5-1,5 GB adicionales segun longitud de contexto y backend).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q3/Q4; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 ejecutarian el modelo con holgura, aunque para un modelo de 2B el cuello de botella sera la latencia de memoria, no la potencia de computo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para un modelo de 2B en cuantizacion Q4, en una GPU de consumo se espera un throughput del orden de decenas a centenares de tokens por segundo, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-2B-i1-GGUF | 1,94 B | no disponible | MIT | GGUF | Destilado de Nemotron-3.5-Lightning-30B-A3B, solo ingles |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,54 B | 32.768 tokens | Apache 2.0 | GGUF, safetensors | Multilingue, ampliamente testeado, ecosistema maduro |
| Llama-3.2-1B-Instruct (GGUF) | 1,24 B | 131.072 tokens | Llama 3.2 Community | GGUF, safetensors | Multilingue, contexto largo, buena disponibilidad de cuantizaciones |
| Gemma-2-2B-it (GGUF) | 2,61 B | 8.192 tokens | Gemma Terms | GGUF, safetensors | Multilingue, calidad solida en razonamiento, licencia con restricciones de uso |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de Yoshino2-2B que permitan una comparacion cuantitativa directa. La principal ventaja de Yoshino2-2B frente a las alternativas es la licencia MIT sin restricciones, mientras que sus desventajas son el soporte unicamente en ingles y la falta de documentacion sobre contexto y rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset de destilacion no descrito, puede heredar sesgos del modelo profesor y del corpus utilizado.
- Riesgo de alucinacion: no cuantificado; como modelo de 2B, la tasa de alucinacion sera previsiblemente mayor que en modelos de mayor tamano, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion sin restricciones adicionales, siempre que se incluya el aviso de copyright. No obstante, el modelo base y el dataset de destilacion podrian tener sus propias condiciones; conviene verificar en5yme/Yoshino2-2B y el dataset Nemotron-3.5-Lightning-30B-A3B-Distill antes de un despliegue comercial.
- Caveats para produccion: la falta de benchmarks y de documentacion sobre contexto y entrenamiento hace arriesgado desplegar el modelo en produccion sin una evaluacion propia. Las cuantizaciones de 2-3 bits (Q2_K, IQ2, IQ3) degradan la calidad de forma notable y no se recomiendan para tareas de razonamiento. La advertencia sobre vision no esta confirmada con ficheros mmproj en este repositorio, por lo que no debe asumirse capacidad multimodal sin verificar el repositorio estatico.
- El repositorio tiene 0 likes y unas 1.508 descargas, lo que indica una adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Yoshino2-2B-i1-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-2B
- Dataset de destilacion: https://huggingface.co/datasets/en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Yoshino2-2B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Yoshino2-2B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

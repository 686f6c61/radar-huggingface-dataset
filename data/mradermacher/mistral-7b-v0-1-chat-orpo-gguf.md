# mradermacher/Mistral-7B-v0.1-chat-ORPO-GGUF

## Resumen

Mistral-7B-v0.1-chat-ORPO-GGUF es la version cuantizada en formato GGUF del modelo Trelis/Mistral-7B-v0.1-chat-ORPO, publicada por el usuario mradermacher. Se trata de un ajuste fino conversacional del modelo base Mistral-7B-v0.1 de Mistral AI, entrenado por Trelis mediante la tecnica ORPO (Odds Ratio Preference Optimization) sobre el dataset argilla/dpo-mix-7k. El resultado es un modelo de chat de 7.241.732.096 parametros con licencia Apache 2.0, pensado para despliegue local mediante llama.cpp y herramientas compatibles con GGUF.

El modelo conserva la arquitectura transformer decoder-only de Mistral-7B-v0.1, con 32 capas, atencion con ventana deslizante (sliding window attention) y un contexto nominal de 32.768 tokens en el modelo original. Esta publicacion concreta ofrece unicamente cuantizaciones estaticas (sin imatrix ni cuantizaciones ponderadas), con 12 variantes que van desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite ejecutar el modelo en hardware muy diverso, desde GPUs de consumo con 4-6 GB de VRAM hasta servidores con aceleradores profesionales.

La relevancia de esta ficha radica en que permite evaluar rapidamente una opcion practica para inferencia local en ingles: un modelo de chat afinado con preferencias, empaquetado en GGUF y con licencia permisiva. No obstante, conviene senalar que el modelo solo declara soporte para ingles, que no se han publicado resultados de benchmarks en la informacion disponible y que el numero de descargas (30) y likes (0) es muy bajo, lo que sugiere una adopcion limitada y poca validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.1), atencion con ventana deslizante |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Mistral-7B-v0.1 soporta 32.768 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-v0.1: un transformer decoder-only denso con 7.241.732.096 parametros, disenado por Mistral AI. Emplea atencion con ventana deslizante (sliding window attention) para reducir el coste computacional en contextos largos, junto con activaciones SwiGLU y RoPE. El modelo base fue preentrenado por Mistral AI con un corpus no especificado en la informacion disponible.

Sobre esa base, Trelis aplico un ajuste fino de preferencias mediante ORPO (Odds Ratio Preference Optimization), una tecnica que combina el ajuste supervisado y la optimizacion de preferencias en una sola etapa, evitando la necesidad de un modelo de referencia separado como en DPO clasico. El dataset utilizado es argilla/dpo-mix-7k, una mezcla de datos de preferencias publicado por Argilla. La publicacion de mradermacher no aporta informacion adicional sobre hiperparametros, numero de tokens de entrenamiento ni detalles del proceso de cuantizacion mas alla de indicar que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no se han generado cuantizaciones ponderadas ni imatrix.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno gracias al ajuste con ORPO sobre datos de preferencias.
- Razonamiento basico y respuesta a instrucciones, heredado del modelo base Mistral-7B-v0.1.
- Generacion de codigo y matematicas a nivel general, sin garantias especificas declaradas por el autor.
- Soporte de tool calling / function calling: no declarado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del modelo.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede mantener dialogos multi-turno en una maquina de sobremesa gracias a las cuantizaciones Q4_K_S y Q4_K_M (4,2-4,5 GB), ideales para GPUs de consumo con 6-8 GB de VRAM.
- Prototipado rapido de chatbots: al estar en formato GGUF y con licencia Apache 2.0, se puede integrar en llama.cpp u Ollama para validar flujos conversacionales sin coste de API ni restricciones de uso comercial.
- Generacion de texto asistida en entornos con recursos limitados: la variante Q2_K (2,8 GB) permite ejecutar el modelo en equipos con poca memoria, aunque con perdida de calidad, para tareas de generacion de borradores o resumenes simples.
- Educacion e investigacion sobre ajuste de preferencias: sirve como caso de estudio reproducible de un pipeline ORPO sobre Mistral-7B, util para comparar con variantes DPO o RLHF en experimentos academicos.
- Despliegue en edge o entornos air-gapped: al no requerir conexion a servicios externos, encaja en escenarios con requisitos de privacidad donde el texto no puede salir de la infraestructura local.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de 12 variantes (desde Q2_K hasta f16) permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo afinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q3_K_M ~3,6 GB; Q3_K_L ~3,9 GB; IQ4_XS ~4,0 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_S ~5,1 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para las variantes de mayor calidad; A100 o H100 para despliegues con concurrencia alta o contexto largo.
- Cabe en GPU de consumo: si, practicamente todas las variantes hasta Q8_0 caben en GPUs con 8-12 GB de VRAM; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-7B-v0.1-chat-ORPO-GGUF (este) | 7.241.732.096 | No disponible (base: 32.768) | Apache 2.0 | GGUF | Solo ingles; sin benchmarks publicados; 30 descargas |
| Mistral-7B-Instruct-v0.1 | ~7.240 M | 32.768 | Apache 2.0 | safetensors, GGUF | Ajuste SFT de Mistral AI; ampliamente validado; multilingue parcial |
| Zephyr-7B-beta | ~7.240 M | 32.768 | MIT | safetensors, GGUF | Ajuste DPO sobre Mistral; benchmarks publicos (MT-Bench, AlpacaEval) |
| OpenChat-3.5 | ~7.240 M | 8.192 | Apache 2.0 | safetensors, GGUF | Ajuste con C-RLFT; benchmarks publicos; buen rendimiento en codigo |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de datos de rendimiento del modelo de esta ficha para contrastar directamente.

## Limitaciones y advertencias

- Solo soporta ingles segun la etiqueta de idioma; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas como Zephyr-7B-beta u OpenChat-3.5.
- Riesgo de alucinacion inherente a los modelos de 7.000 M de parametros; no apto para tareas de alta precision sin verificacion humana.
- Sesgos potenciales heredados del corpus de preentrenamiento de Mistral-7B-v0.1 y del dataset argilla/dpo-mix-7k, no documentados por el autor.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality".
- No hay cuantizaciones imatrix ni ponderadas disponibles, lo que limita la calidad maxima alcanzable en tamanos pequenos frente a otras publicaciones.
- Adopcion muy baja (30 descargas, 0 likes) y actualizacion reciente del repositorio; no hay validacion de la comunidad ni issues documentados.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las condiciones del modelo base y del dataset de entrenamiento.
- El contexto maximo no se declara en la model card; conviene asumir el del modelo base (32.768 tokens) con cautela y validarlo en el runtime concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Mistral-7B-v0.1-chat-ORPO-GGUF
- Modelo base (Trelis): https://huggingface.co/Trelis/Mistral-7B-v0.1-chat-ORPO
- Pagina de resumen del autor: https://hf.tst.eu/model#Mistral-7B-v0.1-chat-ORPO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/argilla/dpo-mix-7k
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

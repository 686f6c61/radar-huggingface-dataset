# mradermacher/Citrus1.0-llama-70B-GGUF

## Resumen

Citrus1.0-llama-70B-GGUF es la distribucion en formato GGUF del modelo Citrus1.0-llama-70B, desarrollado originalmente por jdh-algo y cuantizado por mradermacher. Se trata de un modelo de lenguaje de gran tamano (70.553.706.560 parametros, aproximadamente 70,5 mil millones) construido sobre la arquitectura Llama, orientado especificamente al ambito medico (etiqueta medical-ai) y entrenado para uso conversacional en ingles. Esta publicacion concreta no es el modelo original, sino un conjunto de cuantizaciones estaticas pensadas para ejecucion local eficiente mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que permite desplegar un modelo de 70B en hardware mas modesto que el requerido por los pesos completos en safetensors (el repositorio original ocupa 481,3 GB). Las cuantizaciones ofrecidas van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB en dos partes), lo que abre la puerta a inferencia en estaciones de trabajo con una o varias GPU consumer, o incluso en configuraciones CPU con suficiente RAM.

No obstante, la informacion publicada es limitada: la model card del cuantizador remite al modelo base y no detalla arquitectura interna, datos de entrenamiento, licencia ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos disponibles y marca explicitamente como "no disponible" todo aquello que no se ha podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivada de jdh-algo/Citrus1.0-llama-70B; detalles internos no disponibles) |
| Parametros totales | 70.553.706.560 (~70,5 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es jdh-algo/Citrus1.0-llama-70B, un modelo de 70,5 mil millones de parametros que, por su nomenclatura, sigue la familia arquitectonica Llama. No se dispone de informacion publicada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (GQA/MHA), funcion de activacion ni vocabulario. Tampoco se documenta la longitud de contexto nativa ni si emplea tecnicas como RoPE escalado.

Respecto al entrenamiento, la model card no detalla el volumen de tokens, la composicion del dataset, ni si se aplicaron fases de instruccion, RLHF o DPO. La unica senal tematica es la etiqueta medical-ai, que sugiere un ajuste orientado a dominios clinicos o biomedicos, pero se desconoce el alcance real de ese ajuste. El trabajo de mradermacher consiste en la cuantizacion estatica del modelo original (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin reentrenamiento ni modificacion de pesos mas alla de la reduccion de precision.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio.
- Orientacion declarada a aplicaciones medicas (medical-ai), aunque sin documentacion de evaluacion clinica.
- Inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, llama-cpp-python, entre otros).
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistencia clinica documental: el modelo puede redactar resumenes de historiales o notas medicas en ingles sobre hardware local, lo que resulta adecuado en entornos sanitarios con requisitos de privacidad que impiden enviar datos a APIs externas.
- Investigacion biomedica: extraccion y sintesis de informacion de articulos o guias clinicas en ingles, aprovechando el ajuste tematico declarado y la posibilidad de ejecucion on-premise.
- Despliegue en estaciones de trabajo con GPU unica: gracias a las cuantizaciones Q4_K_M (42,6 GB) o IQ4_XS (38,4 GB), puede ejecutarse en una RTX 6000 Ada, A6000 o similar con 48 GB de VRAM, o en dos RTX 4090.
- Prototipado de chatbots especializados: la variante Q4_K_S (40,4 GB) esta marcada como "fast, recommended" por el cuantizador, lo que la hace idonea para iterar rapidamente en desarrollo de asistentes conversacionales de dominio medico.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de la precision en tareas clinicas concretas antes de fijar una configuracion de produccion.
- Investigacion sobre sesgos en IA medica: al ser un modelo abierto en pesos, permite auditar comportamientos y sesgos en dominios sensibles sin depender de servicios propietarios.
- Entornos air-gapped: la disponibilidad en GGUF posibilita su uso en infraestructuras sin conexion a internet, comun en hospitales y organismos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (aproximada, incluye pesos; sumar overhead de contexto y KV cache):
  - Q2_K: ~26,5 GB
  - Q3_K_S: ~31,0 GB
  - Q3_K_M: ~34,4 GB
  - Q3_K_L: ~37,2 GB
  - IQ4_XS: ~38,4 GB
  - Q4_K_S: ~40,4 GB
  - Q4_K_M: ~42,6 GB
  - Q5_K_S: ~48,8 GB
  - Q5_K_M: ~50,0 GB
  - Q6_K: ~58,0 GB
  - Q8_0: ~75,1 GB
- GPU recomendadas: para Q4_K_M, una GPU con 48 GB (A6000, RTX 6000 Ada, L40S) o dos RTX 4090 (24 GB cada una); para Q8_0, A100 80 GB o H100 80 GB.
- Cabe en consumer GPU: si, en configuraciones multi-GPU (2x RTX 4090 con Q4_K_M) o en una unica RTX 4090 solo con cuantizaciones muy agresivas y descarga parcial a RAM (offloading), con penalizacion de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para servir en produccion con esas herramientas seria preferible el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el cuantizador etiqueta Q4_K_S, Q4_K_M y Q8_0 como "fast"; no se aportan tokens por segundo medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Citrus1.0-llama-70B (esta ficha, GGUF) | ~70,5 B | No disponible | No disponible | GGUF | Ajuste medico declarado, solo ingles |
| Llama 3.3 70B Instruct | 70 B | 128k | Llama 3.3 Community License | Safetensors, GGUF | Referencia generalista, multilingue |
| Qwen2.5 72B Instruct | 72 B | 128k | Apache 2.0 (mayoria de variantes) | Safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |
| Mistral Large / Mixtral 8x7B | 123 B / 46,7 B | 128k / 32k | Propietaria / Apache 2.0 | API / Safetensors, GGUF | Alternativas de distinta escala y licencia |

La comparacion se limita a parametros y disponibilidad porque no hay benchmarks publicados de Citrus1.0 que permitan contrastar calidad. Para uso medico en produccion conviene evaluar el modelo frente a alternativas generalistas con licencia clara antes de adoptarlo.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Modelo unicamente en ingles: no apto para castellano ni otras lenguas sin evaluacion previa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad clinica, razonamiento o seguridad.
- Riesgo de alucinacion: inherente a los LLM y especialmente sensible en dominio medico; cualquier salida debe ser revisada por profesionales.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se puede evaluar la representatividad poblacional ni sesgos de genero, etnia o edad.
- Longitud de contexto no documentada: limita el diseno de aplicaciones con documentos largos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): pueden degradar notablemente la calidad; el propio cuantizador marca Q3_K_M como "lower quality".
- Repositorio de 481,3 GB: requiere almacenamiento considerable y ancho de banda para descargar los pesos completos.
- Modelo derivado: los problemas del modelo base (jdh-algo/Citrus1.0-llama-70B) se heredan integramente en esta cuantizacion.
- No validado para uso clinico: la etiqueta medical-ai no equivale a certificacion regulatoria (MDR, FDA) ni a validacion clinica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Citrus1.0-llama-70B-GGUF
- Modelo base: https://huggingface.co/jdh-algo/Citrus1.0-llama-70B
- Variantes imatrix (i1-GGUF): https://huggingface.co/mradermacher/Citrus1.0-llama-70B-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Citrus1.0-llama-70B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png

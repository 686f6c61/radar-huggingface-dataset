# mradermacher/Marmoka-en-Llama-3.1-8B-Instruct-GGUF

## Resumen

Marmoka-en-Llama-3.1-8B-Instruct-GGUF es una redistribucion en formato GGUF del modelo HiTZ/Marmoka-en-Llama-3.1-8B-Instruct, un ajuste fino sobre Meta-Llama-3.1-8B-Instruct. El repositorio lo publica el usuario mradermacher, conocido por generar cuantizaciones estaticas de modelos de terceros para su uso con llama.cpp y derivados. No se trata por tanto de un modelo entrenado desde cero, sino de un artefacto de conversion y cuantizacion: el valor anadido esta en los doce niveles de cuantizacion ofrecidos y en la compatibilidad con el ecosistema GGUF.

El modelo base subyacente es un transformer decoder-only denso de 8.030.261.312 parametros (aproximadamente 8B), heredado de la arquitectura Llama 3.1, con atencion de consultas agrupadas (GQA), RoPE y ventana de contexto de 128.000 tokens. El sufijo "en" del nombre apunta a una variante orientada al ingles, aunque la model card no declara idiomas soportados. El prefijo "Marmoka" procede del repositorio original de HiTZ (centro de tecnologia del lenguaje de la UPV/EHU).

Su relevancia es practica: permite ejecutar un ajuste fino especifico en hardware de consumo mediante cuantizaciones de 2 a 8 bits, sin depender de pesos safetensors de 16 GB. El repositorio ocupa 16,1 GB y las descargas y "likes" registrados son cero, por lo que se trata de una publicacion reciente y sin validacion comunitaria. No hay benchmarks publicados para este ajuste concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1 8B), con GQA y RoPE |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de la arquitectura Llama 3.1 8B; no confirmada en la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el sufijo "en" sugiere orientacion al ingles) |
| Licencia | no disponible en la model card; al derivar de Llama 3.1, cabe esperar la Llama 3.1 Community License |
| Formato de pesos | GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con normalizacion RMSNorm pre-normalizada, activacion SwiGLU en la MLP, embeddings rotatorios (RoPE) y atencion de consultas agrupadas (GQA) para reducir el coste de la cache KV durante la inferencia. El modelo base de Meta fue entrenado con supervision (SFT) y posteriormente alineado mediante aprendizaje por refuerzo con retroalimentacion humana (RLHF). Sobre esa base, HiTZ aplico un ajuste fino adicional cuyo proceso, datos y numero de tokens no se detallan en la informacion disponible.

En este repositorio no hay entrenamiento nuevo: mradermacher realiza una conversion desde pesos HuggingFace a GGUF (convert_type: hf) y una cuantizacion estatica por tensores (output_tensor_quantised: 1, quantize_version: 2). La model card incluye la linea "skip_mmproj", lo que indica que no se ha exportado proyector multimodal alguno, coherente con un modelo puramente textual. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato instruct, con plantilla de chat heredada de Llama 3.1.
- Razonamiento de proposito general y respuesta a instrucciones de varios turnos.
- Generacion y explicacion de codigo, en linea con las capacidades del modelo base Llama 3.1 8B Instruct.
- Resolucion de problemas matematicos sencillos y de varios pasos, limitada por el tamano de 8B.
- Capacidades multilingues heredadas del modelo base de Meta, aunque la model card no las declara.
- No se documenta soporte explicito de tool calling, function calling ni uso agentico en la informacion disponible.
- No se documentan capacidades multimodales (vision o audio); el repositorio no incluye proyector mmproj.
- No se documenta un modo de razonamiento extendido ("thinking mode").

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M el modelo cabe en GPUs de consumo de 8 a 12 GB de VRAM, lo que permite tener un asistente conversacional sin conexion a servicios externos.
- Prototipado de asistentes conversacionales: el formato instruct y la ventana de contexto de 128.000 tokens permiten mantener dialogos largos con historial extenso antes de recortar el contexto.
- Generacion de codigo en entornos con restricciones de red: al ser un GGUF ejecutable con llama.cpp, puede integrarse en entornos air-gapped donde no se permite enviar codigo a APIs externas.
- Resumen y extraccion de informacion de documentos largos: la ventana de contexto heredada permite procesar informes o documentacion tecnica de decenas de miles de tokens en una sola pasada.
- Evaluacion comparativa de tecnicas de cuantizacion: disponer de doce niveles (de Q2_K a F16) en un mismo repositorio facilita medir la degradacion de calidad frente al coste de memoria y latencia.
- Educacion e investigacion en PLN: sirve como sujeto de estudio para analizar como un ajuste fino de HiTZ sobre Llama 3.1 se comporta frente al modelo original de Meta.
- Chatbot de bajo coste en CPU: las variantes Q3_K_S o Q2_K, en torno a 3-4 GB, permiten inferencia solo-CPU en equipos de gama media, a costa de perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el ajuste fino original de HiTZ.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 8B, cifras aproximadas segun cuantizacion):
  - F16: 16-17 GB
  - Q8_0: 8,5-9,5 GB
  - Q6_K: 6,5-7,5 GB
  - Q5_K_M / Q5_K_S: 5,5-6,5 GB
  - Q4_K_M / Q4_K_S: 4,8-5,5 GB
  - IQ4_XS: 4,4-5,0 GB
  - Q3_K_L / Q3_K_M / Q3_K_S: 3,8-4,5 GB
  - Q2_K: 3,0-3,5 GB
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para F16 y servicio concurrente; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q8_0 y Q6_K con contexto amplio; RTX 4070 Ti, RTX 4080 o RTX 3060 de 12 GB para Q4_K_M.
- Cabe en GPU de consumo: si. Con 8 GB de VRAM se puede ejecutar Q4_K_M con contexto moderado; con 12 GB, Q5_K_M o Q6_K; con 16 GB o mas, Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, koboldcpp, text-generation-webui, servidores compatibles con la API de OpenAI sobre llama.cpp (el tag endpoints_compatible asi lo indica) y TGI/vLLM con soporte GGUF.
- Latencia y throughput estimados: no disponible. No se ha publicado ninguna medicion de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Marmoka-en-Llama-3.1-8B-Instruct-GGUF (este) | 8,03B | 128.000 (heredado) | no disponible | GGUF | Ajuste fino de HiTZ cuantizado por mradermacher; sin benchmarks publicados |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128.000 | Llama 3.1 Community License | safetensors, GGUF | Modelo original de Meta, con resultados de benchmark publicos |
| Qwen2.5-7B-Instruct | 7,6B | 128.000 | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y buen rendimiento en codigo y matematicas |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.000 | Apache 2.0 | safetensors, GGUF | Contexto mas corto y comunidad amplia; licencia comercial sin restricciones de escala |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas listadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del ajuste fino de HiTZ ni sobre el impacto de la cuantizacion en este caso concreto.
- Riesgo de alucinacion: inherente a los modelos de 8B, especialmente en tareas de razonamiento largo, calculo numerico y preguntas de conocimiento factual especializado.
- Idiomas no declarados: la ficha no especifica cobertura linguistica; el sufijo "en" sugiere un enfoque en ingles y el rendimiento en castellano no esta verificado.
- Licencia no declarada en el repositorio: al derivar de Llama 3.1, es previsible que apliquen los terminos de la Llama 3.1 Community License, con obligaciones de atribucion y la clausula de licencia adicional para productos con mas de 700 millones de usuarios mensuales. Conviene verificar la licencia del modelo original de HiTZ antes de cualquier uso comercial.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la coherencia y la fidelidad de las respuestas; no son recomendables en produccion.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, sin issues ni validacion de terceros.
- Fecha de creacion registrada como 1 de octubre de 2026, posterior a la fecha de actualizacion de muchos componentes del ecosistema; conviene comprobar la procedencia de los pesos.
- Contenido no filtrado: al ser un ajuste fino de terceros sobre Llama 3.1 Instruct, no se documenta si se aplicaron salvaguardas adicionales, por lo que puede producir contenido no deseado.
- Sin soporte multimodal ni de tool calling confirmado: no deben asumirse capacidades de agente o de llamada a funciones sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Marmoka-en-Llama-3.1-8B-Instruct-GGUF
- Modelo original (HiTZ): https://huggingface.co/HiTZ/Marmoka-en-Llama-3.1-8B-Instruct
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Llama 3.1 en Meta AI: https://dev.meta.ai/llama/models/llama-3
- Llama 3.1 8B Instruct en NVIDIA NIM: https://build.nvidia.com/meta/llama-3_1-8b-instruct
- Repositorio de referencia de Llama-3.1-8B-Instruct-GGUF: https://github.com/inferless/Llama-3.1-8B-Instruct-GGUF

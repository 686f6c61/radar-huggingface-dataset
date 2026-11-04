# mradermacher/Tess-3-Llama-3.1-70B-GGUF

## Resumen

Tess-3-Llama-3.1-70B-GGUF es la distribucion en formato GGUF del modelo Tess-3-Llama-3.1-70B, un ajuste fino conversacional desarrollado por migtissera sobre la base de Llama 3.1 70B de Meta. El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad de HuggingFace que publica versiones estaticas de modelos populares para su uso con llama.cpp y otras herramientas compatibles con GGUF. El modelo original esta pensado para generacion de texto conversacional en ingles.

El modelo base, Llama 3.1 70B, es un transformer denso de 70.553.706.560 parametros con una ventana de contexto de 128.000 tokens (segun las especificaciones oficiales de Llama 3.1, aunque la model card de este repositorio no lo explicita). Tess-3 es un fine-tune orientado a dialogo, lo que lo hace adecuado para asistentes conversacionales, pero no aporta innovaciones arquitectonicas propias: hereda toda la estructura del modelo de Meta.

La relevancia de esta ficha radica en que ofrece el modelo en cuantizaciones que van desde 26,5 GB (Q2_K) hasta 75,1 GB (Q8_0), lo que permite desplegar un modelo de 70B en hardware mas modesto que el requerido por los pesos completos en FP16 (unos 141 GB). Es una opcion practica para inferencia local o en servidores con GPUs de 48-80 GB usando cuantizaciones intermedias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 soporta 128.000 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 70B: un transformer denso con atencion por grupos (GQA), activacion SwiGLU y normalizacion RMSNorm. No se trata de un modelo MoE ni hibrido. El modelo base fue entrenado por Meta con un corpus multilingue masivo y posteriormente alineado mediante RLHF y DPO; sin embargo, la model card de este repositorio no aporta detalles sobre el dataset de ajuste fino de Tess-3 ni sobre el proceso de alineacion especifico empleado por migtissera.

Este repositorio concreto es una conversion a GGUF realizada por mradermacher mediante cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf). No incluye innovaciones de decodificacion especulativa ni atencion lineal: es una conversion directa de los pesos del modelo original a formatos de menor precision para su uso con llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte para dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado del ajuste fino de Tess-3 sobre Llama 3.1.
- Capacidades de codigo y matematicas propias de Llama 3.1 70B, aunque no verificadas en la model card.
- Soporte de tool calling y function calling: no confirmado en la model card de este repositorio.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la model card.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en ingles y desplegarse con llama.cpp u Ollama usando cuantizaciones Q4_K_M (42,6 GB) o Q5_K_M (50,0 GB) en GPUs de 48 GB o superiores.
- Generacion de texto en pipelines de investigacion: util para experimentar con un modelo de 70B ajustado para dialogo sin depender de APIs externas, usando la cuantizacion Q8_0 (75,1 GB) para maxima fidelidad.
- Prototipado de chatbots en ingles: la naturaleza conversacional del fine-tune lo hace adecuado para construir asistentes de soporte o atencion al cliente en entornos controlados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes que permiten medir el impacto de la cuantizacion en la calidad de las respuestas para un mismo modelo.
- Despliegue en servidores con una sola GPU: con Q2_K (26,5 GB) o Q3_K_S (31,0 GB) cabe en GPUs consumer de 32 GB o en A100 de 40 GB, aunque con perdida de calidad.
- Fine-tuning posterior o destilacion: los pesos GGUF no son ideales para reentrenamiento, pero el modelo base en safetensors (migtissera/Tess-3-Llama-3.1-70B) puede usarse para experimentos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y KV cache):
  - Q2_K: ~26,5 GB de pesos; ~30-34 GB con contexto moderado.
  - Q3_K_M: ~34,4 GB; ~38-42 GB en uso real.
  - Q4_K_M: ~42,6 GB; ~48-52 GB en uso real.
  - Q5_K_M: ~50,0 GB; ~56-60 GB en uso real.
  - Q6_K: ~58,0 GB; ~64-68 GB en uso real.
  - Q8_0: ~75,1 GB; ~82-88 GB en uso real.
- GPUs recomendadas: A100 80 GB o H100 80 GB para Q6_K y Q8_0; A100 40 GB o dos RTX 4090 para Q4_K_M; RTX 4090 (24 GB) no es suficiente para ninguna cuantizacion en una sola GPU, salvo Q2_K con offloading parcial a RAM.
- Cabe en consumer GPU: no de forma holgada. Solo Q2_K (26,5 GB) se acerca al limite de una RTX 4090 de 24 GB, y requeriria offloading. En configuraciones multi-GPU con 2x RTX 4090 (48 GB) caben Q4_K_S y Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No es compatible directamente con vLLM o TGI en formato GGUF sin conversion a safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tess-3-Llama-3.1-70B-GGUF (este) | 70,5B | no disponible (base: 128k) | llama3.1 | GGUF | Fine-tune conversacional en ingles |
| Llama-3.1-70B-Instruct (Meta) | 70,5B | 128k | llama3.1 | safetensors, GGUF | Modelo oficial alineado para instrucciones |
| Qwen2.5-72B-Instruct | 72,7B | 128k | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y multilingue |
| Tess-3-Llama-3.1-70B (original) | 70,5B | no disponible | llama3.1 | safetensors | Pesos completos sin cuantizar |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para Tess-3 en la informacion disponible.

## Limitaciones y advertencias

- Idioma: el repositorio esta etiquetado unicamente como ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Sesgos: al heredar Llama 3.1 70B, arrastra los sesgos del corpus de entrenamiento de Meta y del ajuste fino de Tess-3, no documentados en la model card.
- Alucinacion: riesgo inherente a los modelos de 70B ajustados para dialogo; no se han publicado evaluaciones de fidelidad factual.
- Licencia llama3.1: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligacion de atribucion y cumplimiento de la politica de uso aceptable de Meta). Es necesario revisar los terminos antes de un despliegue en produccion.
- Cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad; la propia model card advierte que Q3_K_M es de "lower quality".
- Formato GGUF: no apto para fine-tuning directo ni para servir con vLLM/TGI sin conversion.
- Repositorio con pocas descargas (165) y sin likes, lo que sugiere poca validacion comunitaria.
- No hay informacion sobre el proceso de entrenamiento de Tess-3 ni sobre su dataset, lo que dificulta evaluar su calidad frente al Llama 3.1 Instruct oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Tess-3-Llama-3.1-70B-GGUF
- Modelo base (Tess-3): https://huggingface.co/migtissera/Tess-3-Llama-3.1-70B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Tess-3-Llama-3.1-70B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Tess-3-Llama-3.1-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests

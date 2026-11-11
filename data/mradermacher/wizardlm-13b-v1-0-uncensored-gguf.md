# mradermacher/WizardLM-13B-V1.0-Uncensored-GGUF

## Resumen

WizardLM-13B-V1.0-Uncensored-GGUF es una cuantizacion en formato GGUF del modelo QuixiAI/WizardLM-13B-V1.0-Uncensored, publicada por el usuario mradermacher. Se trata de una conversion estatica (sin imatrix) de los pesos originales a distintos niveles de cuantizacion, pensada para su uso con llama.cpp y herramientas compatibles. El modelo base es un fine-tuning sin filtros de seguridad del WizardLM-13B-V1.0, entrenado sobre el dataset unfiltered derivado de WizardLM_evol_instruct_V2_196k.

El modelo subyacente es un transformer decoder-only de tipo denso con 13.015.864.320 parametros (aproximadamente 13B), derivado de la familia LLaMA. Esta orientado a instrucciones en ingles y no incorpora mecanismos de moderacion, lo que lo hace relevante para investigacion sobre alineamiento, generacion sin restricciones y experimentacion con modelos abiertos. La cuantizacion permite ejecutarlo en hardware de consumo, algo inviable con los pesos en precision completa.

La relevancia actual es limitada: se trata de un modelo de 2023 con ventana de contexto corta (2048 tokens, valor tipico de la familia LLaMA original) y sin datos de benchmarks publicados en la informacion disponible. Su interes es principalmente historico y de investigacion, no de produccion moderna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia LLaMA) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (tipico de la familia LLaMA original: 2048 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 13B parametros, derivado de la arquitectura LLaMA. El fine-tuning original de WizardLM aplica el metodo Evol-Instruct, que genera instrucciones progresivamente mas complejas a partir de semillas para ampliar la diversidad y dificultad del dataset de entrenamiento. En esta variante "Uncensored", el dataset utilizado es ehartford/WizardLM_evol_instruct_V2_196k_unfiltered_merged_split, una version sin filtrado de seguridad del corpus original de 196k ejemplos.

La publicacion de mradermacher no reentrena el modelo: unicamente convierte los pesos de QuixiAI/WizardLM-13B-V1.0-Uncensored a formato GGUF mediante cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se documentan en la informacion disponible detalles sobre numero de tokens de entrenamiento, composicion exacta del dataset, uso de RLHF o DPO, ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto e instrucciones en ingles.
- Razonamiento de un solo turno y conversacion multi-turno basica.
- Generacion de codigo y resolucion de problemas matematicos sencillos (capacidades heredadas de WizardLM).
- Respuestas sin filtros de seguridad ni rechazos por contenido (fine-tuning "uncensored").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Sin capacidades de vision, audio ni modo "thinking" explicito.
- Multilingue limitado: entrenado principalmente en ingles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como se comporta un modelo sin moderacion frente a prompts sensibles, comparandolo con su version filtrada.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativas que otros modelos rechazarian por politicas de contenido, en un entorno controlado.
- Evaluacion de tecnicas de cuantizacion: los distintos niveles GGUF (de Q2_K a Q8_0) permiten medir la degradacion de calidad frente al coste de memoria en experimentos reproducibles.
- Prototipado local en hardware de consumo: con cuantizaciones Q4_K_S (7,5 GB) o Q4_K_M (8,0 GB) se puede ejecutar en GPUs consumer de 8-12 GB de VRAM para pruebas de concepto.
- Generacion de datasets sinteticos: util para producir texto de entrenamiento en dominios donde los modelos alineados se niegan a responder, siempre con revision humana posterior.
- Educacion e investigacion academica: analisis de sesgos y comportamiento de modelos fine-tuned con Evol-Instruct en entornos de laboratorio aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~5,0 GB; Q3_K_S ~5,8 GB; Q3_K_M ~6,4 GB; Q3_K_L ~7,0 GB; IQ4_XS ~7,1 GB; Q4_K_S ~7,5 GB; Q4_K_M ~8,0 GB; Q5_K_S ~9,1 GB; Q5_K_M ~9,3 GB; Q6_K ~10,8 GB; Q8_0 ~13,9 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para cuantizaciones Q4-Q5; RTX 4090 24 GB para Q8_0 con contexto amplio; A100 o H100 para despliegues con concurrencia.
- Cabe en GPU consumer: si, practicamente cualquier GPU con 8 GB o mas para Q4_K_S/Q4_K_M; 12 GB para Q5-Q6; 16 GB para Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversion adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| WizardLM-13B-V1.0-Uncensored-GGUF (este) | 13B | no disponible | other | GGUF | Hugging Face |
| WizardLM-13B-V1.0 (original) | 13B | no disponible | other | safetensors | Hugging Face |
| LLaMA-2-13B-chat | 13B | 4096 | licencia LLaMA 2 | safetensors, GGUF | Meta / Hugging Face |
| Mistral-7B-Instruct-v0.1 | 7B | 8192 (teorico) | Apache 2.0 | safetensors, GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino. No apto para aplicaciones de cara al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion, agravado por la falta de datos de benchmarks que permitan calibrar su fiabilidad.
- Ventana de contexto corta (valor tipico de la familia LLaMA original, 2048 tokens), insuficiente para tareas modernas de contexto largo.
- Entrenado principalmente en ingles; el rendimiento en castellano es limitado y no documentado.
- Licencia "other": las condiciones exactas no estan detalladas en la informacion disponible. El modelo base hereda posibles restricciones de la familia LLaMA, por lo que se recomienda revisar los terminos antes de cualquier uso comercial.
- Modelo de 2023: superado en capacidad, contexto y eficiencia por modelos mas recientes del mismo tamano.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K) degradan notablemente la coherencia; el propio autor recomienda Q4_K_S o Q4_K_M para uso general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/WizardLM-13B-V1.0-Uncensored-GGUF
- Modelo base: https://huggingface.co/QuixiAI/WizardLM-13B-V1.0-Uncensored
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/WizardLM-13B-V1.0-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#WizardLM-13B-V1.0-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests

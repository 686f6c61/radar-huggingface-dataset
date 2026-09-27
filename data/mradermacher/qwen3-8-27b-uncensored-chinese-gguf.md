# mradermacher/Qwen3.8-27B-Uncensored-Chinese-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Uncensored-Chinese-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo `vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese`. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión a GGUF del trabajo de un tercero, con el objetivo de permitir la inferencia en CPU, GPU de gama de consumo y hardware con memoria limitada mediante llama.cpp y sus derivados.

El modelo base declara 27.320.697.856 parámetros (unos 27,32 mil millones) según el recuento real de los tensores en safetensors. El nombre indica un modelo de la familia Qwen con ajuste "uncensored" y orientación al chino, si bien la model card no aporta ningún detalle sobre arquitectura, datos de entrenamiento, contexto, licencia o idiomas. El repositorio ocupa 50,7 GB e incluye doce variantes de cuantización, desde x-f16 hasta Q2_K.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio registra 0 descargas y 0 "likes", no tiene licencia declarada, no publica evaluaciones y el modelo base es una carga de usuario no verificada. Además, la denominación "Qwen3.8-27B" no se corresponde con ninguna release oficial conocida de Alibaba, por lo que la procedencia de los pesos no puede confirmarse. Se trata, por tanto, de un artefacto a evaluar con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer decoder-only de la familia Qwen; la model card no lo confirma) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el sufijo "Chinese" del modelo base sugiere especializacion en chino; sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizacion estatica, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) |

Otros datos del repositorio: tamano declarado de 50,7 GB, etiquetas `gguf`, `endpoints_compatible`, `region:us`, `conversational`, creado el 2026-09-26 y actualizado el mismo dia. Pipeline declarado: no disponible.

## Arquitectura y entrenamiento

No hay informacion publicada en la model card sobre la arquitectura del modelo base. El identificador apunta a un transformer de tipo decoder-only de la familia Qwen con aproximadamente 27.300 millones de parametros, y la etiqueta `conversational` indica que ha sido ajustado para dialogo, pero ni el numero de capas, ni la dimension del modelo, ni el mecanismo de atencion, ni el tipo de normalizacion estan documentados en la informacion disponible.

Tampoco se documenta el proceso de entrenamiento: no hay datos sobre el numero de tokens, la composicion del corpus, la existencia de fases de RLHF, DPO o RLVR, ni sobre el metodo empleado para el ajuste "uncensored" (abliteracion de direcciones de rechazo, fine-tuning sobre datos sin filtrar o eliminacion de capas de seguridad). El autor de las cuantizaciones se limita a indicar que son cuantizaciones estaticas del repositorio `vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese`, sin aportar detalles adicionales sobre el modelo de origen.

## Capacidades

- Generacion de texto conversacional multi-turno: el pipeline declarado y la etiqueta `conversational` indican un ajuste para dialogo, aunque sin datos verificables de calidad.
- Generacion de codigo y matematicas: no confirmado en la informacion disponible, aunque es una capacidad esperable en un modelo de ~27B de la familia Qwen.
- Soporte de tool calling / function calling: no disponible; la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningun modo "thinking" ni plantilla de agente.
- Capacidades multilingues: no disponibles; el sufijo "Chinese" del modelo base sugiere un sesgo fuerte hacia el chino, con posible degradacion en otros idiomas.
- Capacidades especiales (vision, audio, decodificacion especulativa): no disponibles.
- Inferencia local en CPU/GPU de gama de consumo: soportada por el propio formato GGUF y por la existencia de doce niveles de cuantizacion, desde Q2_K hasta f16.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: las variantes Q2_K, Q3_K_S y Q3_K_M permiten ejecutar un modelo de 27.300 millones de parametros en un portatil o mini-PC con entre 12 y 16 GB de RAM usando llama.cpp, a costa de una perdida de calidad notable.
- Despliegue en una unica GPU de consumo: la cuantizacion Q4_K_M, en torno a 16-17 GB, cabe en una RTX 4090, RTX 3090 o RTX 5090 de 24 GB, dejando margen para cache KV con contextos moderados.
- Procesamiento por lotes de textos en chino: dado el sesgo declarado hacia el chino en el nombre del modelo base, puede emplearse para tareas de generacion, resumen o reescritura en ese idioma, siempre que la licencia lo permita (actualmente indeterminada).
- Experimentacion e investigacion sobre alineacion: al tratarse presuntamente de una variante "uncensored", es util para estudios comparativos sobre el efecto de eliminar el ajuste de seguridad en las respuestas del modelo.
- Sustitucion de API en prototipos offline: con `endpoints_compatible` como etiqueta, el repositorio esta pensado para exponerse mediante una API compatible con OpenAI sobre llama.cpp u Ollama, util para prototipos con requisitos de privacidad de datos.
- Evaluacion de pipelines de cuantizacion: el repositorio cubre doce niveles distintos de cuantizacion del mismo modelo, lo que permite medir el impacto de la compresion en la calidad de las respuestas de forma controlada.
- Generacion de codigo en entornos aislados: sin conexion a internet y sin enviar codigo a terceros, un modelo de 27B cuantizado a Q5 o Q6 puede usarse como asistente de autocompletado en un IDE local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a listar las cuantizaciones generadas y el modelo de origen, sin incluir MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica. Tampoco se aportan resultados de perplejidad por nivel de cuantizacion.

## Requisitos de hardware

Estimaciones de memoria para los pesos, calculadas a partir de los 27.320.697.856 parametros declarados. Hay que anadir a estas cifras la cache KV y el overhead del runtime (entre 1 y 4 GB adicionales segun contexto y batch):

| Cuantizacion | Tamanos de pesos estimados | Cabe en |
|---|---|---|
| x-f16 | ~54,6 GB | 2x A100 40 GB, H100 80 GB, 1x A100 80 GB |
| Q8_0 | ~29,0 GB | 2x RTX 4090, A100 40 GB, 1x H100 80 GB |
| Q6_K | ~22,4 GB | A100 40 GB, 1x RTX 4090 24 GB (muy justo) |
| Q5_K_M / Q5_K_S | ~19,4 GB | 1x RTX 4090 24 GB, 1x RTX 3090 24 GB |
| Q4_K_M / Q4_K_S | ~16,4 GB | 1x RTX 4090, 1x RTX 3090, 1x RTX 4080 16 GB (justo) |
| IQ4_XS | ~15,0 GB | 1x RTX 4080 16 GB, 1x RTX 4070 Ti Super |
| Q3_K_L / Q3_K_M / Q3_K_S | ~11,5-13,7 GB | 1x RTX 3060 12 GB, 1x RTX 4060 Ti 16 GB |
| Q2_K | ~9,6 GB | 1x RTX 3060 12 GB, GPUs de 10-12 GB |

- Cabe en GPU de consumo: si, con cuantizaciones Q2_K a Q6_K. La opcion mas equilibrada para 24 GB es Q4_K_M o Q5_K_M.
- Memoria unificada (Apple Silicon): 16-18 GB para Q4, 24 GB para Q5/Q6, 32-36 GB para Q8_0, 64 GB o mas para f16.
- CPU sola: viable con Q2_K y Q3_K sobre 16 GB de RAM, con velocidades de unos pocos tokens por segundo, aunque no se dispone de cifras medidas para este modelo concreto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI. El soporte de GGUF en vLLM es experimental y limitado; TGI no soporta GGUF como formato de pesos.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparativa se limita a parametros y licencia. "Qwen3.8-27B" no corresponde a ninguna release oficial conocida de Alibaba, de modo que la comparacion con modelos oficiales es orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Chinese (este) | 27,32 mil millones | no disponible | no disponible | GGUF en HuggingFace, 0 descargas |
| Qwen2.5-32B-Instruct | 32,5 mil millones | 128k tokens | Apache 2.0 | Pesos safetensors y GGUF de terceros |
| Gemma-2-27B-it | 27,2 mil millones | 8k tokens | Licencia Gemma (uso comercial con restricciones) | Pesos safetensors y GGUF de terceros |
| Mistral Small 3 (24B) | 23,6 mil millones | 32k tokens | Apache 2.0 | Pesos safetensors y GGUF de terceros |

La ventaja de este repositorio frente a las alternativas es la cobertura de doce niveles de cuantizacion en un unico lugar. La desventaja principal es la ausencia total de licencia, evaluaciones y trazabilidad del modelo base, frente a los modelos citados, que cuentan con documentacion tecnica completa y licencias explicitas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, los pesos estan sujetos por defecto a todos los derechos reservados. No se puede asumir que el uso comercial este permitido.
- Procedencia no verificable: el modelo base es una carga del usuario `vurtnesaerdna` y la denominacion "Qwen3.8-27B" no coincide con ninguna release oficial conocida de Qwen. No hay forma de confirmar que los pesos deriven realmente de un modelo de Alibaba ni que respeten su licencia original.
- Ajuste "uncensored": la eliminacion o debilitamiento del alineamiento de seguridad implica un riesgo elevado de generar contenido danino, ilegal, sesgado o inexacto sin filtros. No es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de redactar esta ficha. No existe evidencia de terceros sobre la calidad o la integridad de los archivos.
- Riesgo de alucinacion: no hay evaluaciones publicadas, ni siquiera de perplejidad por cuantizacion. Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan de forma tipica la coherencia en modelos de este tamano.
- Sesgo idiomatico: el sufijo "Chinese" sugiere un ajuste centrado en chino. El rendimiento en castellano u otros idiomas es desconocido y probablemente inferior al de un modelo multilingue generico.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos. Los valores por defecto de llama.cpp podrian no coincidir con el contexto real de entrenamiento.
- Formato GGUF: es un formato orientado exclusivamente a inferencia. No permite fine-tuning directo ni conversion a otros formatos sin disponer del modelo original en safetensors.
- Fecha de creacion anomala: el repositorio figura como creado el 2026-09-26, una fecha posterior a la habitual en los repositorios de mradermacher, lo que refuerza la necesidad de verificar los archivos antes de usarlos.
- Discrepancia de tamanos: los 50,7 GB declarados para el repositorio no cuadran con la suma de doce cuantizaciones de un modelo de 27,32 mil millones de parametros (solo la variante f16 rondaria los 54,6 GB). Conviene comprobar que los archivos esperados estan realmente presentes antes de descargar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Chinese-GGUF
- Modelo base: https://huggingface.co/vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime de referencia para GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs, demos o evaluaciones adicionales: no disponibles en la informacion proporcionada.

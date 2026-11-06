# nm-testing/TinyLlama-1.1B-Chat-v1.0-nvfp4-fp8-mixed-e2e

## Resumen

TinyLlama-1.1B-Chat-v1.0-nvfp4-fp8-mixed-e2e es un artefacto de prueba publicado por la cuenta `nm-testing`, vinculada al ecosistema de `compressed-tensors` (la libreria de Neural Magic para compresion y cuantizacion mixta de modelos). No se trata de un modelo entrenado desde cero, sino de una variante cuantizada de TinyLlama-1.1B-Chat-v1.0, el pequeño transformer decoder-only tipo Llama de 1,1 mil millones de parametros publicado originalmente por el equipo de TinyLlama. El sufijo del nombre indica una mezcla de precisiones: pesos en NVFP4 (formato de 4 bits con escala por bloque introducido por NVIDIA) y FP8, empaquetados de extremo a extremo ("e2e") para validar pipelines de compresion.

El interes de esta ficha es fundamentalmente practico: sirve como referencia de como se distribuye un checkpoint cuantizado mixto en formato `safetensors` con metadatos de `compressed-tensors`, y como caso de prueba para verificar que herramientas de despliegue (vLLM, TensorRT-LLM, entre otras) cargan correctamente pesos NVFP4 y FP8 combinados. No es un modelo pensado para produccion ni para evaluacion de calidad, sino un fixture de integracion.

Hay que subrayar dos caveats de partida: el repositorio declara 742.483.968 parametros en el fichero de pesos, cifra inferior a los ~1,1 B del TinyLlama original, lo que sugiere que el checkpoint empaquetado no contiene todos los tensores del modelo base (posiblemente omitiendo embeddings o capas no cuantizadas en este experimento). Ademas, no se declara licencia, pipeline ni idiomas en la model card, por lo que cualquier uso comercial debe verificarse contra la licencia del modelo base (Apache 2.0 en TinyLlama) y contra las condiciones de los formatos NVFP4/FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (herencia de TinyLlama-1.1B-Chat-v1.0) |
| Parametros totales | 742.483.968 (segun safetensors del repo; el modelo base declara ~1,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base TinyLlama-1.1B-Chat usa 2048 tokens) |
| Tipos de cuantizacion | NVFP4 y FP8 en esquema mixto, empaquetado con `compressed-tensors` |
| Idiomas soportados | no disponible (el base se entreno principalmente en ingles) |
| Licencia | no disponible en el repo (el base TinyLlama es Apache 2.0) |
| Formato de pesos | safetensors con metadatos `compressed-tensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only con atencion multi-cabeza estandar, RoPE, normalizacion RMSNorm y activacion SwiGLU, en la linea de Llama 2. El modelo base fue entrenado por el proyecto TinyLlama sobre aproximadamente 3 billones de tokens (segun la documentacion publica del proyecto) y posteriormente ajustado con instrucciones para la variante Chat. Esta publicacion concreta no documenta entrenamiento adicional: es un proceso de cuantizacion post-entrenamiento (PTQ) aplicado a los pesos existentes.

La innovacion tecnica reside en el esquema de cuantizacion mixta. NVFP4 es un formato de 4 bits con escala de bloque (block scaling) pensado para hardware Blackwell de NVIDIA, que reduce el peso por parametro a ~0,5 bytes mas overhead de escalas. FP8 (E4M3 o E5M2, no se especifica cual en la informacion disponible) se aplica presumiblemente a las capas mas sensibles a la precision, mientras NVFP4 se reserva para las lineales de mayor volumen. El repositorio no detalla el recetario exacto (que capas quedan en FP8, que capas en NVFP4, ni si hay capas sin cuantizar), ni si se aplico calibracion con dataset, ni si hay recuperacion de precision (QAT o GPTQ/AWQ) o simple RTN. Tampoco se documenta el proceso "e2e" mas alla de lo que sugiere el nombre: un flujo completo de exportacion y carga validado de extremo a extremo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de chat de TinyLlama-1.1B-Chat-v1.0.
- Razonamiento basico y respuesta a instrucciones de complejidad baja a media, acorde con un modelo de ~1 B parametros.
- Generacion de codigo simple y completado de fragmentos cortos; no es fiable para tareas de programacion de varios ficheros.
- Aritmetica basica y problemas de un paso; el modelo base no destaca en GSM8K.
- Soporte de tool calling: no disponible en la informacion proporcionada; el base no incluye plantilla de funciones nativa.
- Soporte de agentes y multi-step reasoning: no disponible; el tamano y el contexto del base lo hacen poco adecuado.
- Capacidades multilingues: no disponible; el base esta entrenado predominantemente en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Valor especifico de esta variante: servir como fixture de validacion para kernels NVFP4/FP8 y para verificar la carga de checkpoints `compressed-tensors` mixtos.

## Casos de uso

- Validacion de pipelines de cuantizacion: usar el checkpoint para comprobar que una toolchain (por ejemplo, llm-compressor o el exportador de compressed-tensors) produce pesos NVFP4/FP8 cargables y coherentes, comparando la perplejidad contra el modelo base en FP16.
- Pruebas de integracion en runtimes: verificar que vLLM, TensorRT-LLM u otros backends con soporte NVFP4 cargan el checkpoint sin errores de shape o de escalas, y que la inferencia devuelve texto sensato en prompts de control.
- CI/CD de kernels de cuantizacion: incluir este repo como artefacto de referencia en tests automatizados que detecten regresiones en kernels de 4 y 8 bits antes de desplegar versiones nuevas de la libreria.
- Benchmarking de latencia en hardware Blackwell: medir throughput y latencia de un modelo de ~1 B en NVFP4 frente a FP16 y FP8 puro, para caracterizar el rendimiento relativo del formato en GPUs de nueva generacion.
- Prototipado de asistentes ligeros en local: si el checkpoint se valida como equivalente al base, puede usarse para demos de chatbot en ingles con baja huella de memoria en entornos con GPU consumer.
- Docencia y experimentacion: ilustrar en talleres como se inspecciona un `safetensors` con metadatos `compressed-tensors`, que tensores llevan escala y como se reconstruye un peso cuantizado.
- Pruebas de compatibilidad de tokenizer y chat template: confirmar que el tokenizer Llama y la plantilla de chat del base siguen funcionando tras el empaquetado cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de perplejidad, ni comparaciones con el modelo base en FP16. Cualquier cifra de rendimiento atribuida a esta variante requeriria medicion propia.

## Requisitos de hardware

- VRAM estimada: con 742,5 M parametros en un esquema mixto NVFP4/FP8, el peso ronda los 0,4-0,6 GB mas overhead de escalas; el repositorio ocupa 4,6 GB, lo que sugiere que incluye tambien pesos sin cuantizar o duplicados de formato. Para inferencia en FP16 del base (~2,2 GB) basta una GPU de 8 GB.
- GPU recomendadas para NVFP4: hardware NVIDIA Blackwell (serie B200/GB200 y RTX 50). FP8 es nativo en Hopper (H100) y Ada (L40S, RTX 4090 con soporte parcial). En GPUs Ampere o anteriores los kernels NVFP4 no estaran disponibles y el checkpoint puede no ser utilizable tal cual.
- GPU consumer: si, el modelo base cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB en FP16; en NVFP4 el interes real esta en Blackwell consumer.
- Opciones de despliegue: backends con soporte `compressed-tensors` y NVFP4 (vLLM con kernels adecuados, TensorRT-LLM); llama.cpp y Ollama no soportan NVFP4 de forma nativa en la informacion disponible, por lo que requeririan de-cuantizacion o conversion a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de ~1 B, en hardware Blackwell se espera un throughput alto, pero no hay cifras publicadas en el repo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/TinyLlama-1.1B-Chat-v1.0-nvfp4-fp8-mixed-e2e | 742,5 M (repo) | no disponible | NVFP4 + FP8 mixto | no disponible | Hugging Face, 52 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1,1 B | 2048 | FP16/BF16 (base) | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32768 | FP16/BF16, GGUF en la comunidad | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8192 | FP16/BF16, GGUF | Apache 2.0 | Hugging Face |

La comparacion relevante no es de calidad, sino de proposito: este checkpoint es un artefacto de validacion de cuantizacion mixta, mientras que TinyLlama, Qwen2.5-0.5B y SmolLM2 son modelos listos para uso. Cualquier eleccion para produccion deberia recaer en los modelos base o en sus versiones GGUF/AWQ publicadas, salvo que el objetivo sea precisamente probar kernels NVFP4.

## Limitaciones y advertencias

- Artefacto de prueba: el nombre y la cuenta (`nm-testing`) indican un repositorio de validacion, no un modelo curado para distribucion. No hay model card descriptiva.
- Discrepancia de parametros: 742,5 M frente a ~1,1 B del base; el checkpoint puede estar incompleto o excluir tensores concretos, lo que invalidaria su uso como modelo autonomo.
- Licencia no declarada: no se especifica licencia en el repo; verificar la del base (Apache 2.0) y las condiciones de uso de NVFP4/FP8 antes de cualquier despliegue comercial.
- Idiomas y pipeline no declarados: sin garantia de comportamiento multilingue ni de tarea soportada.
- Dependencia de hardware: NVFP4 requiere kernels y GPUs compatibles (Blackwell); en otras GPUs el checkpoint puede no cargar o degradar.
- Riesgo de alucinacion: inherente a un modelo de ~1 B; no apto para tareas factuales de alta precision sin verificacion externa.
- Sesgos: heredados del corpus de entrenamiento de TinyLlama, predominantemente ingles y web; no evaluados en esta variante.
- Sin benchmarks: no hay evidencia publicada de que la cuantizacion mixta preserve la calidad del base; requiere evaluacion propia de perplejidad y tareas downstream.
- Contexto limitado (segun el base, 2048 tokens): inadecuado para conversaciones o documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-nvfp4-fp8-mixed-e2e
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Proyecto TinyLlama (repositorio): https://github.com/jzhang38/TinyLlama
- Libreria compressed-tensors (Neural Magic): https://github.com/neuralmagic/compressed-tensors
- llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM

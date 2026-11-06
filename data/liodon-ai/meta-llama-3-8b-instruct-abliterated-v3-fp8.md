# liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-FP8

## Resumen

Meta-Llama-3-8B-Instruct-abliterated-v3-FP8 es una cuantizacion en FP8 del modelo failspy/Meta-Llama-3-8B-Instruct-abliterated-v3, publicada por liodon-ai. Se trata, por tanto, de una variante de tercera mano: el modelo original es el Meta-Llama-3-8B-Instruct de Meta, posteriormente modificado mediante una tecnica de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) por failspy, y finalmente comprimido a FP8 por liodon-ai con la libreria llm-compressor.

El modelo conserva la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parametros totales y 8.192 millones de parametros en el checkpoint (8B en nomenclatura comercial). La cuantizacion reduce el peso de 16,1 GB a 9,1 GB, lo que permite desplegarlo en GPUs con menos VRAM manteniendo la fidelidad numerica del modelo original, ya que el esquema FP8_DYNAMIC no requiere dataset de calibracion.

Su relevancia es doble: por un lado, ofrece una ruta de despliegue eficiente en memoria para Llama 3 8B Instruct en hardware Ada/Hopper; por otro, hereda las caracteristicas del modelo abliterated, que elimina parcialmente los mecanismos de rechazo del modelo alineado original. Esto lo hace adecuado para investigacion sobre alineamiento y para aplicaciones donde se requiere baja censura, pero tambien plantea consideraciones eticas y de seguridad importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | FP8 (E4M3) con esquema FP8_DYNAMIC; pesos por canal, activaciones por token en tiempo de inferencia; lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atencion por cabezas agrupadas (GQA) y normalizacion RMSNorm, entrenado por Meta sobre un corpus multilingue de gran escala. Sobre ese modelo, failspy aplico una tecnica de abliteration que identifica y sustrae la direccion de activacion asociada al rechazo de peticiones, reduciendo la tendencia del modelo a negarse a responder. El resultado es Meta-Llama-3-8B-Instruct-abliterated-v3, del que no se dispone de detalles adicionales de entrenamiento en la informacion proporcionada.

La capa anadida por liodon-ai es puramente de cuantizacion. Se uso llm-compressor con el esquema FP8_DYNAMIC: los pesos se convierten a FP8 (formato E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Al no requerir calibracion, los pesos cuantizados son esencialmente una conversion directa de los originales, sin sesgo introducido por un conjunto de calibracion. La cabeza de salida (lm_head) se mantiene en precision completa, practica estandar por su bajo impacto en tamano y su alta sensibilidad a la cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste instructivo de Llama 3.
- Razonamiento general y respuesta a instrucciones en formato chat.
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo base Llama 3 8B Instruct.
- Reduccion de rechazos: el proceso de abliteration disminuye la tendencia a negarse a responder ante peticiones que el modelo alineado rechazaria.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta a las respuestas del modelo en dominios sensibles, comparando con el Llama 3 8B Instruct original en el mismo hardware.
- Despliegue eficiente en produccion con vLLM: gracias a la cuantizacion FP8 y al soporte de compressed-tensors, puede servirse con `vllm serve` en una GPU Ada o Hopper, reduciendo el coste de VRAM frente al modelo en bf16.
- Generacion de contenido creativo sin restricciones excesivas: escritura de ficcion, guiones o narrativa donde el modelo alineado tiende a rechazar temas oscuros o controvertidos.
- Evaluacion de robustez de filtros: usar el modelo como generador adversario para probar sistemas de moderacion y clasificadores de contenido en pipelines de seguridad.
- Fine-tuning posterior sobre la base cuantizada: aunque el entrenamiento en FP8 no es directo, el checkpoint sirve como referencia para estudiar el impacto de la cuantizacion en tareas especificas antes de entrenar en precision completa.
- Servicio de chat de baja latencia en GPUs consumer de gama alta: con 9,1 GB de pesos, cabe en una RTX 4090 o L4 con margen para cache KV, permitiendo despliegues locales con TGI o SGLang.
- Benchmarking de tecnicas de cuantizacion: comparar la calidad de FP8_DYNAMIC frente a bf16 y otras cuantizaciones (GPTQ, AWQ) sobre el mismo modelo abliterated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,1 GB solo para pesos en FP8; con cache KV y overhead de runtime, se recomienda un minimo de 12-16 GB para contextos moderados.
- GPUs recomendadas: NVIDIA con compute capability >= 8.9 para ejecucion FP8 nativa, es decir, Ada (RTX 40-series, L4, L40S), Hopper (H100, H200) y Blackwell (B100, B200, GB10).
- En GPUs anteriores (Ampere, Turing), vLLM y TGI descomprimen el modelo para ejecutarlo, perdiendo la ventaja de velocidad y memoria del FP8.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) y en RTX 4080 (16 GB) con margen limitado para contexto; en GPUs de 12 GB puede requerir contextos cortos o cuantizacion adicional.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (TGI via contenedor Docker), SGLang (`sglang.launch_server`), y transformers con compressed-tensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-FP8 | 8,03 B | no disponible | FP8 dynamic | other | Hugging Face |
| failspy/Meta-Llama-3-8B-Instruct-abliterated-v3 | 8,03 B | no disponible | bf16/fp16 | other | Hugging Face |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens (segun model card de Meta, no verificado aqui) | bf16/fp16 | Llama 3 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina parcialmente los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ofensivo o ilegal; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de 8B, agravado por la falta de datos de evaluacion especificos de esta cuantizacion.
- La licencia "other" heredada del modelo base puede imponer restricciones adicionales al uso comercial; es necesario revisar los terminos exactos del modelo original de Meta y del modelo abliterated antes de desplegarlo en produccion.
- La cuantizacion FP8 puede introducir degradaciones menores de calidad frente al modelo en bf16, especialmente en tareas de razonamiento complejo o generacion de codigo largo; no se han publicado evaluaciones que lo cuantifiquen.
- En GPUs sin soporte nativo FP8 (compute capability < 8.9), el modelo se descomprime en tiempo de ejecucion, con lo que se pierden las ventajas de memoria y velocidad.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento multilingue de esta variante concreta.
- El modelo tiene solo 27 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- Es un modelo exclusivamente de texto; no soporta vision, audio ni otras modalidades.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/liodon-ai/Meta-Llama-3-8B-Instruct-abliterated-v3-FP8
- Modelo base abliterated: https://huggingface.co/failspy/Meta-Llama-3-8B-Instruct-abliterated-v3
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor

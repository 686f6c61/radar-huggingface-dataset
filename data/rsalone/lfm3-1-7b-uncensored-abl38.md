# rSalone/LFM3-1.7B-uncensored-abl38

## Resumen

LFM3-1.7B-uncensored-abl38 es una variante "abliterated" (sin mecanismos de rechazo) del modelo LiquidAI/LFM3-1.7B, desarrollada por el usuario rSalone y publicada en Hugging Face. El modelo base es un transformer de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) creado por Liquid AI, y esta version elimina la direccion de rechazo del espacio de activaciones mediante una tecnica de abliteration aplicada sobre los pesos, no solo durante la generacion.

El problema que aborda es la negativa del modelo a responder ciertos prompts: segun la model card, el original responde sin rechazo a 21 de 200 prompts de HarmBench, mientras que esta version responde a 179 de 200, manteniendo practicamente intacto el rendimiento en tareas de razonamiento (GSM8K 98/100 y GPQA Diamond 96/198 frente a 99/198 del original). La innovacion tecnica principal es la medicion de la direccion de rechazo como media sobre todos los tokens del prompt (en lugar de solo el ultimo token o posiciones internas del thinking/answer), y su escritura en los pesos corrigiendo el efecto de la RMSNorm posterior.

Es relevante ahora porque demuestra que la abliteration selectiva (38 de 48 puntos de escritura al residual stream) puede eliminar rechazos de forma mas efectiva que la abliteration total, con una degradacion minima en benchmarks de razonamiento, y porque ofrece pesos en safetensors y GGUF cuantizados listos para desplegar en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3, segun tags del repo; detalles internos no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 32.768 tokens (inferido del comando de llama.cpp con `-c 32768`) |
| Tipos de cuantizacion | Q2_K, Q4_K_M, Q8_0, BF16 (GGUF); BF16 (safetensors) |
| Idiomas soportados | no disponible (la model card indica que los prompts de evaluacion fueron solo en ingles) |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | safetensors (BF16) y GGUF (Q2_K, Q4_K_M, Q8_0, BF16) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer desarrollado por Liquid AI. La model card de esta variante no detalla la composicion del dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO; esa informacion corresponderia a la model card del modelo base, que no se incluye en la informacion proporcionada. Lo que si se documenta es el proceso de abliteration: LFM3-1.7B escribe al residual stream en 48 puntos (24 capas x 2), y la variante abl38 elimina la direccion de rechazo solo en los 38 puntos cuyas activaciones separan prompts censurados de prompts ordinarios con una precision leave-one-out de al menos el 95% y un d' de al menos 3. La variante abl48 elimina la direccion en los 48 puntos.

La innovacion tecnica destacable es doble. Primero, la direccion de rechazo se mide como media sobre todos los tokens del prompt, lo que segun el autor elimina rechazos mejor que medirla en el ultimo token del prompt o en posiciones del thinking o de la respuesta. Segundo, para escribir la edicion en los pesos se corrige el efecto de la RMSNorm posterior: en lugar de restar directamente gamma multiplicado por r de la matriz de salida W (lo que daba una divergencia KL de 0,0053 para abl48 y 0,0030 para abl38 respecto a la eliminacion durante generacion), se aplica W' = W - b(a^T W) con a = gamma * r y b = r/gamma escalado para que a^T b = 1, lo que reduce la KL a 0,0013 (abl48) y 0,0007 (abl38). La KL respecto al original es de 0,0112 para abl48 y 0,0083 para abl38. No se modificaron otros pesos.

## Capacidades

- Generacion de texto conversacional en ingles (los prompts de evaluacion fueron solo en ingles).
- Razonamiento con modo thinking: el modelo piensa antes de responder, y la model card analiza el comportamiento del thinking.
- Razonamiento matematico: GSM8K con 98 de 100 correctas en la version BF16.
- Razonamiento cientifico de nivel avanzado: GPQA Diamond con 96 de 198 correctas en la version BF16.
- Respuesta sin rechazo a prompts que el modelo original rechazaria: 179 de 200 en HarmBench frente a 21 de 200 del original.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: no disponible; la evaluacion se hizo solo en ingles.
- Capacidades de vision o audio: no disponible en la informacion.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible de como medir y eliminar la direccion de rechazo en un transformer pequeno, comparando abl38 frente a abl48 y frente a la eliminacion durante generacion, con las divergencias KL documentadas.
- Evaluacion de robustez de clasificadores de seguridad: al responder a 179 de 200 prompts de HarmBench, permite probar y calibrar clasificadores de contenido y filtros de salida en pipelines de moderacion.
- Despliegue local en hardware modesto: con cuantizacion Q4_K_M (1,10 GB) o Q2_K (0,75 GB) puede ejecutarse en CPU o en GPU de consumo, util para prototipos y entornos sin aceleradores dedicados.
- Generacion de texto creativo sin restricciones de rechazo: escritura de ficcion, dialogos o guiones donde el modelo original declinaria participar, con la advertencia de que el contenido generado es responsabilidad del usuario.
- Experimentos de destilacion y evaluacion comparativa: al mantener GSM8K en 98 y GPQA en 96 con respecto al original, sirve como referencia de cuanto rendimiento se conserva tras una edicion de pesos de este tipo.
- Base para fine-tuning posterior: al estar disponible en safetensors BF16 (3,46 GB) y con `trust_remote_code`, puede cargarse en transformers y ajustarse con tecnicas como LoRA sobre una base ya sin rechazos.
- Analisis del comportamiento del thinking: la model card documenta que las versiones medidas en el prompt planifican la respuesta en el thinking sin deliberar sobre el rechazo (139-170 de 200) frente a las medidas en el thinking (89-133), lo que permite estudiar la relacion entre cadena de pensamiento y politicas de seguridad.

## Benchmarks y rendimiento

Resultados publicados en la model card. Cada benchmark se ejecuto una sola vez, en BF16, con thinking activado. HarmBench fue etiquetado por un Qwen3.8-Flash-Next local, no por el clasificador oficial.

| Benchmark | Original | abl38 (este modelo) | abl48 |
|---|---|---|---|
| HarmBench: respondidos sin rechazo (de 200) | 21 | 179 | no disponible en la tabla comparativa |
| GSM8K: correctas (de 100) | 98 | 98 | no disponible en la tabla comparativa |
| GPQA Diamond: correctas (de 198) | 99 | 96 | no disponible en la tabla comparativa |

Datos adicionales del proceso de seleccion (8 versiones evaluadas, eliminacion durante generacion en transformers, BF16):

| Metrica | Rango observado |
|---|---|
| HarmBench respondidos sin rechazo, versiones medidas en el prompt | 175-185 de 200 |
| HarmBench respondidos sin rechazo, versiones medidas en el thinking | 158-172 de 200 |
| GSM8K correctas, las 8 versiones | 96-98 de 100 |
| GPQA Diamond correctas, las 8 versiones | 94-100 de 198 |
| HarmBench con direccion aleatoria eliminada en los mismos 48 puntos | 24 de 200 |

En llama.cpp con el GGUF BF16, el modelo respondio a 179 de 200 prompts de HarmBench, con GSM8K 98 y GPQA 96.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos, mas overhead de contexto y KV cache; en la practica conviene disponer de 6-8 GB.
- VRAM estimada en Q8_0: aproximadamente 1,85 GB de pesos, mas KV cache.
- VRAM estimada en Q4_K_M: aproximadamente 1,10 GB de pesos, mas KV cache; cabe holgadamente en GPUs de consumo de 8 GB.
- VRAM estimada en Q2_K: aproximadamente 0,75 GB de pesos; ejecutable en CPU.
- GPU recomendadas: cualquier GPU de consumo moderna con 8 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4070) para cuantizaciones Q4_K_M y Q8_0; A100 o H100 no son necesarias por el tamano del modelo, aunque acelerarian el throughput.
- Cabe en GPU de consumo: si, en todas las cuantizaciones indicadas.
- Opciones de despliegue: llama.cpp (`llama-server`), transformers con `trust_remote_code=True` y `dtype="bfloat16"`. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo indica que Q8_0 y Q2_K se comprobaron para cargar y responder una pregunta simple en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HarmBench (sin rechazo) | GSM8K | GPQA Diamond | Licencia | Formatos |
|---|---|---|---|---|---|---|---|
| LFM3-1.7B-uncensored-abl38 | 1,73 B | 32.768 | 179/200 | 98/100 | 96/198 | lfm-open-license-v1.0 | safetensors, GGUF |
| LFM3-1.7B-uncensored-abl48 | 1,73 B | 32.768 | no disponible en la tabla | no disponible en la tabla | no disponible en la tabla | lfm-open-license-v1.0 | safetensors, GGUF (segun repo enlazado) |
| LiquidAI/LFM3-1.7B (original) | 1,73 B | 32.768 | 21/200 | 98/100 | 99/198 | lfm-open-license-v1.0 | no disponible en la informacion |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el modelo responde a prompts que el original rechazaria (179 de 200 en HarmBench). Esto lo hace inadecuado para aplicaciones donde se requiera una politica de seguridad estricta, como atencion al cliente publica o sistemas expuestos a usuarios sin moderacion.
- Riesgo de contenido danino: al no rechazar, puede generar contenido ofensivo, ilegal o peligroso. Cualquier despliegue debe incorporar filtros externos de entrada y salida.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; el modelo hereda los del modelo base, que no se detallan.
- Alucinacion: no se han publicado mediciones de alucinacion. El modelo base es pequeno (1,7 B), lo que en general aumenta el riesgo de errores factuales frente a modelos mayores.
- Limitaciones de contexto: GPQA Diamond se ejecuto con hasta 8.192 tokens y unas 50 de 198 preguntas se truncaron y se contaron como incorrectas, lo que sugiere dificultades con razonamientos largos.
- Limitaciones de idioma: la evaluacion se hizo solo con prompts en ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Fiabilidad de los benchmarks: cada benchmark se ejecuto una sola vez. Al ejecutar el original en transformers y en llama.cpp, 19 de 200 etiquetas de HarmBench cambiaron, lo que indica una variabilidad considerable.
- Clasificador no oficial: las respuestas de HarmBench se etiquetaron con un Qwen3.8-Flash-Next local, no con el clasificador oficial, por lo que las cifras no son directamente comparables con las de otros estudios.
- Cuantizaciones no evaluadas: solo se hicieron benchmarks en BF16; Q8_0 y Q2_K solo se comprobaron para cargar y responder una pregunta simple en CPU.
- Licencia: lfm-open-license-v1.0 (etiquetada como "other"). Es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; las condiciones exactas no se detallan en la informacion proporcionada.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del autor del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38
- Variante abl48: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper referenciado (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado (arxiv:2402.04249): https://arxiv.org/abs/2402.04249
- Paper referenciado (arxiv:2110.14168): https://arxiv.org/abs/2110.14168
- Paper referenciado (arxiv:2311.12022): https://arxiv.org/abs/2311.12022

# InfiniCloud/llm-jp-4-32b-a3b-thinking-GPTQ-INT4-G64

## Resumen

llm-jp-4-32b-a3b-thinking-GPTQ-INT4-G64 es una version cuantizada a INT4 del modelo llm-jp-4-32b-a3b-thinking, publicado por el usuario InfiniCloud sobre el checkpoint base del proyecto LLM-jp. Se trata de un modelo de lenguaje de arquitectura MoE (etiquetada como qwen3_moe) con 32.139.028.992 parametros totales y 3.827.476.992 parametros activos por token, distribuidos en 32 capas de decoder con 128 expertos enrutados y 8 expertos activos por token.

El objetivo del repositorio es ofrecer un "escritor" en japones de calidad sin reservar una GPU completa en BF16. La cuantizacion reduce el peso serializado de 64,280 GB (59,865 GiB) en 13 shards BF16 a 18,573 GB (17,297 GiB), una reduccion aproximada del 71%. Esto permite alojar el modelo junto a otro modelo (por ejemplo, un VLM) en una GPU de clase 80 GB, o ejecutarlo en solitario cuando los pesos BF16 originales no caben en VRAM.

La relevancia actual viene de que es un artefacto precalibrado y verificado: incluye metadatos exactos de cuantizacion, comparacion contra el modelo BF16 original y un registro de evaluacion reproducible. En el benchmark japones MGSM (250 preguntas) el checkpoint INT4 obtuvo 76,0% frente al 74,4% del BF16, sin degradacion clara en esa prueba fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (qwen3_moe), 32 capas de decoder, 128 expertos enrutados con 8 activos por token |
| Parametros totales | 32.139.028.992 (32,1B) |
| Parametros activos | 3.827.476.992 (3,8B) |
| Longitud de contexto | no disponible (en la evaluacion se aplico un limite de 16.384 tokens; el escenario de despliegue en L4 asume 8K) |
| Tipos de cuantizacion | GPTQ W4A16, pesos INT4 simetricos con activaciones BF16, tamano de grupo 64 |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano del repositorio | 18,573 GB (17,297 GiB) |
| Modelo base | llm-jp/llm-jp-4-32b-a3b-thinking (revision 30b90b28539c2d02f23b732a10c846b814730a50) |
| Modulos cuantizados | 12.416 modulos Linear (proyecciones de atencion y MLP de expertos enrutados), 31.121.735.680 elementos de peso |
| Tensores retenidos en BF16 | embeddings, lm_head, routers, normalizacion y otros parametros no seleccionados (163 tensores) |
| Carga remota | requiere trust_remote_code=True |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) con 32 capas de decoder. Cada token activa 8 de los 128 expertos enrutados, de modo que el coste de computo por token corresponde aproximadamente a 3,8B parametros, aunque los 128 expertos permanecen residentes en memoria. La cuantizacion GPTQ se aplico a todas las proyecciones de atencion y a todas las proyecciones MLP de expertos enrutados, dejando embeddings, lm_head, routers y capas de normalizacion en BF16.

El proceso de calibracion uso 512 conversaciones de HuggingFaceH4/ultrachat_200k (revision 8049631c405ae6576f93f445c6b8166f76f5505a, split train_sft), con semilla 42, maximo de 2048 tokens y reasoning_effort=medium. La cuantizacion tardo 2 horas 23 minutos 3 segundos y registro un pico de uso de GPU de 12.973 MiB. El checkpoint incluye componentes propios de tokenizacion y plantilla de chat (llmjp4_tokenizer.py, llmjp4_harmony.py), verificados contra la revision fuente fijada. La verificacion en CPU confirmo la presencia de las 12.416 proyecciones INT4 empaquetadas, escalas positivas y finitas, y equivalencia bit a bit de los 163 tensores BF16 retenidos respecto al origen.

## Capacidades

- Generacion de texto conversacional en japones e ingles, con foco declarado en la escritura en japones.
- Modo de razonamiento (thinking) con control mediante el parametro reasoning_effort, verificado en los niveles low y medium.
- Razonamiento matematico en japones: evaluado sobre el conjunto MGSM de 250 preguntas con cinco ejemplos (five-shot).
- Generacion de JSON en formato fijo: los seis casos de comprobacion de formato (aviso japones de dos lineas, objeto JSON de columnas fijas y JSON aritmetico few-shot) pasaron tanto en BF16 como en INT4.
- Soporte multilingue limitado a en y ja.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Escritura y redaccion en japones de calidad: el modelo puede generar avisos, textos de dos lineas, correos y documentos en japones, aprovechando que es su idioma principal y que los pesos INT4 dejan margen de VRAM para un contexto razonable.
- Coexistencia con un VLM en una GPU de 80 GB: al ocupar 17,297 GiB serializados, deja espacio para un modelo de vision, la cache KV y el espacio de trabajo en tiempo de ejecucion, por ejemplo para tareas de descripcion de imagenes con salida redactada en japones.
- Razonamiento matematico en japones: resolucion de problemas tipo MGSM con contexto de varios ejemplos, adecuado para tutoria o generacion de ejercicios paso a paso.
- Extraccion y generacion de JSON estructurado: en pipelines que requieren salida maquina-legible (por ejemplo, extraccion de campos de un texto), combinando el modelo con decodificacion restringida para garantizar el formato.
- Despliegue en GPUs sin aritmetica NVFP4 nativa: para hardware que soporta kernels GPTQ INT4 pero no dispone de NVFP4, este checkpoint es una via directa de ejecutar un MoE de 32B sin recurrir a BF16.
- Ejecucion en una L4 de 24 GB para una sola secuencia: con un contexto de 8K el requisito practico estimado es de unos 21-22 GiB incluyendo margen, lo que permite atender una peticion sin compartir GPU con otro modelo.
- Evaluacion y comparacion de artefactos cuantizados: al incluir manifiesto de cuantizacion y registro de evaluacion, sirve como referencia fija para estudiar el impacto de INT4 frente al BF16 en un mismo modelo.

## Benchmarks y rendimiento

| Japanese MGSM (250 preguntas, extraccion flexible) | Correctas | Puntuacion | Respuestas finales completas | Terminadas por longitud |
|---|---:|---:|---:|---:|
| Fuente BF16 | 186/250 | 74,4% | 248/250 | 2 |
| GPTQ INT4 G64 | 190/250 | 76,0% | 249/250 | 1 |
| Diferencia INT4 - BF16 | +4 | +1,6 pp | +1 | -1 |

Ambos modelos usaron los mismos prompts, tokenizador de origen, cinco ejemplos, reasoning_effort=low, temperatura 0, semilla 42, limite de generacion de 4096 tokens y limite de contexto de 16.384 tokens. Entre las preguntas emparejadas, 14 errores de BF16 pasaron a correctos en INT4 y 10 aciertos de BF16 pasaron a error. La extraccion estricta puntuo cero en ambos modelos porque su redaccion no coincidia con la frase exigida. Una unica ejecucion fija no demuestra que INT4 sea intrinsecamente mejor; simplemente no se observo degradacion clara en este benchmark. Los tres casos terminados por longitud (uno en INT4 y dos en BF16) repitieron un mismo token hasta el limite de 4096 tokens, con prompts y salidas muy por debajo del limite de contexto.

## Requisitos de hardware

- VRAM para inferencia: pesos INT4 serializados de 17,297 GiB; en una L4 de 24 GB el requisito practico estimado es de unos 21-22 GiB para una secuencia a 8K de contexto, incluyendo margen operativo.
- GPU recomendadas: GPU de clase 80 GB (por ejemplo, A100 o H100) para ejecutar el modelo junto a otro modelo o VLM; L4 de 24 GB como objetivo ajustado para una sola secuencia a 8K.
- Uso en GPU de consumo: no confirmado en la informacion disponible. Con 17,297 GiB de pesos, una GPU de consumo de 24 GB queda en un margen muy estrecho y no deja espacio util para un VLM en la misma tarjeta.
- Opciones de despliegue: vLLM (se realizo una carga y generacion real verificada); formato compressed-tensors GPTQ compatible con kernels INT4. No se documentan otros runners (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponible.
- Nota: la medicion de 12.973 MiB de GPU corresponde a la fase de cuantizacion, no a un requisito de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano de pesos | Licencia | Idiomas | Disponibilidad |
|---|---|---|---:|---|---|---|
| llm-jp-4-32b-a3b-thinking-GPTQ-INT4-G64 | 32,1B totales / 3,8B activos | GPTQ INT4 W4A16, grupo 64 | 18,573 GB (17,297 GiB) | apache-2.0 | en, ja | HuggingFace |
| llm-jp-4-32b-a3b-thinking (fuente BF16) | 32,1B totales / 3,8B activos | BF16 safetensors, 13 shards | 64,280 GB (59,865 GiB) | apache-2.0 | en, ja | HuggingFace |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de otros modelos comparables de la misma categoria (MoE japones de ~32B o versiones cuantizadas alternativas), por lo que la comparativa se limita al modelo fuente BF16.

## Limitaciones y advertencias

- La ventaja observada de INT4 en MGSM (+1,6 pp) procede de una unica ejecucion fija y no demuestra superioridad intrinseca del formato cuantizado.
- Se observaron bucles de salida: una respuesta INT4 y dos BF16 repitieron un mismo token hasta el limite de generacion de 4096 tokens. Aumentar el limite de contexto no resuelve ese comportamiento.
- El cumplimiento de JSON se comprobo solo en seis casos fijos de diagnostico y no constituye una garantia general. Para produccion se recomienda decodificacion restringida y validacion, reparacion o reintento de la salida.
- La extraccion estricta de respuestas puntuo cero en ambos modelos por desajuste de redaccion, lo que sugiere sensibilidad al formato exacto de la respuesta.
- Idiomas soportados limitados a ingles y japones; no se documenta soporte de castellano.
- Riesgo de alucinacion no cuantificado en la informacion disponible; inherente a los modelos de lenguaje generativos.
- La carga requiere trust_remote_code=True, lo que implica ejecutar codigo personalizado del repositorio (tokenizador y plantilla de chat).
- Licencia apache-2.0, que permite uso comercial, pero el artefacto depende del modelo base llm-jp-4-32b-a3b-thinking y de su propia licencia y condiciones.
- No se dispone de datos de sesgos, evaluaciones de seguridad ni comportamiento fuera de los conjuntos de prueba citados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/InfiniCloud/llm-jp-4-32b-a3b-thinking-GPTQ-INT4-G64
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-thinking
- README en japones: https://huggingface.co/InfiniCloud/llm-jp-4-32b-a3b-thinking-GPTQ-INT4-G64/blob/main/README.ja.md
- Manifiesto de cuantizacion: https://huggingface.co/InfiniCloud/llm-jp-4-32b-a3b-thinking-GPTQ-INT4-G64/blob/main/quantization-manifest.json
- Resumen de evaluacion: https://huggingface.co/InfiniCloud/llm-jp-4-32b-a3b-thinking-GPTQ-INT4-G64/blob/main/evidence/evaluation-summary.json
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Sitio del autor: https://infinicloud.com/

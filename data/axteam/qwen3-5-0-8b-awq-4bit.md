# axteam/Qwen3.5-0.8B-AWQ-4bit

## Resumen

`axteam/Qwen3.5-0.8B-AWQ-4bit` es una cuantizacion de 4 bits del modelo multimodal `Qwen/Qwen3.5-0.8B`, publicada por el usuario axteam. No es un modelo entrenado desde cero, sino un derivado PTQ (post-training quantization) pensado para servir el modelo base con vLLM de forma eficiente en memoria. El checkpoint conserva la torre de vision, el proyector, la cabeza MTP y las partes no lineales del bloque SSM en BF16, y aplica AWQ INT4 (W4A16) al resto de pesos lineales.

El modelo base pertenece a la familia Qwen3.5 de Alibaba Cloud, una serie descrita como multilingue y orientada a razonamiento e instrucciones, con variantes que van desde 0,8B hasta 397B. Este checkpoint concreto tiene 852.985.920 parametros y una arquitectura hibrida que combina atencion lineal con atencion completa, ademas de soporte de entrada imagen-texto (pipeline `image-text-to-text`).

Su relevancia practica es acotada y muy concreta: permite desplegar un modelo multimodal de menos de mil millones de parametros en GPUs de gama baja o en entornos con restricciones de VRAM, a costa de una perdida de fidelidad medible frente al original BF16 (+10,9% de perplejidad y 84,8% de acuerdo top-1). El propio autor recomienda builds de 8 bits para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + atencion completa), densa, multimodal (vision), con cabeza MTP |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | No aplica (la model card describe el modelo como denso; ver advertencia sobre la mencion a "sparse-MoE" en la seccion de limitaciones) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | AWQ INT4 W4A16 (pesos INT4 asimetricos, group size 32, escalas BF16 + zero-point INT4, activaciones BF16); el autor recomienda variantes de 8 bits (FP8 o AWQ INT8) para produccion |
| Idiomas soportados | No disponible para este checkpoint; la familia Qwen3.5 se presenta como multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` |
| Tamano en disco | ~1,0 GB (repositorio: 1,1 GB) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Calibracion AWQ | 256 muestras de un corpus mixto con predominio de coreano |
| Libreria / runtime | transformers, vLLM |
| Fecha de publicacion | 29-10-2026 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer hibrida que intercala capas de atencion lineal con capas de atencion completa, un patron habitual para reducir el coste del contexto largo manteniendo calidad en recuperacion de informacion. Incluye ademas una cabeza de prediccion multi-token (MTP), tipica de esquemas de decodificacion especulativa o entrenamiento multi-objetivo, y un codificador visual con su proyector para entradas de imagen. No hay en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

Este checkpoint no entrena nada: es cuantizacion post-entrenamiento. AWQ busca canales salientes de pesos mediante un conjunto de calibracion pequeno y sin gradientes, y los protege antes del redondeo. Se mantienen en BF16 la torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), que representan una fraccion pequena de los parametros. El tokenizer, el `chat_template` y el `generation_config` son identicos a los del original, y `config.json` es el original mas un bloque `quantization_config`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`): la torre visual se conserva en BF16, por lo que la ruta de vision no sufre la cuantizacion.
- Razonamiento e instrucciones: la familia Qwen3.5 se presenta con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3, aunque no hay evaluaciones especificas de este checkpoint en la informacion disponible.
- Capacidades multilingues: atribuidas a la familia base; el conjunto de calibracion de la cuantizacion esta sesgado hacia coreano, lo que puede afectar la fidelidad relativa por idioma.
- Cabeza MTP conservada en BF16, lo que habilita tecnicas de decodificacion especulativa propias del modelo base (sin datos de rendimiento publicados).
- Soporte de tool calling y comportamiento agentico: no confirmado de forma explicita en la informacion disponible para este checkpoint.

## Casos de uso

- Servicio de inferencia con vLLM en GPUs de gama baja: al ocupar ~1,0 GB de pesos, permite levantar un endpoint compatible con OpenAI en tarjetas de 4-8 GB, usando `vllm serve axteam/Qwen3.5-0.8B-AWQ-4bit` con los parametros de muestreo recomendados (`temperature=0.7`, `top_p=0.8`, `top_k=20`).
- Clasificacion y descripcion de imagenes en lote: la torre visual intacta en BF16 permite tareas de image captioning o moderacion de contenido visual donde la latencia importa mas que la precision absoluta del texto generado.
- Extraccion de campos a partir de documentos escaneados o capturas: combinacion de OCR implicito con generacion estructurada, adecuada para pipelines de digitalizacion donde el coste por inferencia es el factor limitante.
- Prototipado rapido y evaluacion de la familia Qwen3.5: util como checkpoint de bajo coste para validar plantillas de prompt, `chat_template` y flujos multimodales antes de pasar a modelos mayores de la misma familia.
- Asistentes de borde o embebidos: con ~0,85B de parametros y cuantizacion INT4, encaja en dispositivos con VRAM limitada o en entornos de desarrollo sin GPU dedicada de gran capacidad.
- Generacion de respuestas cortas en herramientas internas (autocompletado, resumen de una linea, reformulacion) donde el acuerdo top-1 del 84,8% con el BF16 es aceptable y no se requiere fidelidad estricta.
- Comparacion de fidelidad de tecnicas de cuantizacion: sirve como referencia empirica de cuanto degrada AWQ INT4 a un modelo multimodal hibrido pequeno, util para investigadores que calibren esquemas de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de fidelidad frente al modelo BF16 original, medidas sobre un conjunto interno mixto ingles/coreano de 100 prompts con respuestas greedy del BF16 evaluadas bajo cada build:

| Metrica | Este modelo (AWQ INT4) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor es mejor) | 2,2372 | 2,0174 | +10,9% |
| Acuerdo top-1 en siguiente token | 84,8% | 98,7% | -13,9 puntos |

El autor advierte explicitamente que el modelo es sensible a la cuantizacion de 4 bits y recomienda builds de 8 bits (FP8 o AWQ INT8) para produccion. No hay datos de throughput ni de latencia publicados.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~1,0 GB en disco; con overhead del runtime, activaciones y cache KV para contextos moderados, una estimacion razonable es 2-4 GB. Cifra no publicada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Una RTX 3060/4060 (8-12 GB) o una RTX 4090 quedan sobredimensionadas para el modelo y permiten lots grandes o muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, incluidas soluciones de gama de entrada. Tambien es viable en iGPU con memoria unificada si el runtime lo soporta.
- Despliegue: `vllm serve axteam/Qwen3.5-0.8B-AWQ-4bit` es la via recomendada por el autor (formato compressed-tensors). Via transformers con `compressed-tensors` instalado tambien es posible. No se publica GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia. Soporte en TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/Qwen3.5-0.8B-AWQ-4bit | ~0,85B | No disponible | AWQ INT4 W4A16 | Apache-2.0 | Objeto de esta ficha; +10,9% perplejidad frente a BF16 |
| Qwen/Qwen3.5-0.8B (BF16) | ~0,85B | No disponible | BF16 | Apache-2.0 | Referencia de calidad; mayor huella de VRAM (~2x) |
| axteam/Qwen3.5-2B-AWQ-4bit | ~2B | No disponible | AWQ INT4 | No disponible | Mismo autor y metodo, mayor capacidad; sin datos de evaluacion publicados aqui |
| Builds de 8 bits del mismo modelo (FP8 / AWQ INT8) | ~0,85B | No disponible | FP8 / INT8 | Apache-2.0 (derivado) | Recomendados por el autor para produccion por menor degradacion |

No se dispone de comparaciones con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad medible: +10,9% de perplejidad y 84,8% de acuerdo top-1 frente al BF16. Para tareas de alta precision (codigo, matematicas, extraccion exacta) el degradado puede ser inaceptable.
- Inconsistencia en la model card: la tabla de especificaciones describe la arquitectura como "Dense", mientras que la nota de advertencia habla de "this sparse-MoE model". Conviene verificar la arquitectura real en `config.json` del modelo base antes de asumir comportamiento de mezcla de expertos.
- Sesgo de calibracion: el conjunto AWQ son 256 muestras con predominio de coreano, lo que puede desequilibrar la fidelidad entre idiomas. No hay evaluacion por idioma.
- Riesgo de alucinacion: inherente a un modelo de 0,85B y agravado por la cuantizacion; no se han publicado evaluaciones de veracidad.
- Longitud de contexto no documentada para este checkpoint; no debe asumirse la del modelo base sin comprobarla.
- Idiomas soportados no declarados en la ficha de HuggingFace del checkpoint.
- No hay GGUF publicado: el uso en llama.cpp u Ollama exige conversion y recalibracion propia.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, con publicacion y actualizacion el mismo dia. No existe validacion independiente de las metricas del autor.
- Licencia Apache-2.0 en el derivado, heredada del original; los derechos sobre pesos, tokenizer y `chat_template` corresponden al equipo Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-0.8B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Variante del mismo autor (2B, AWQ INT4): https://huggingface.co/axteam/Qwen3.5-2B-AWQ-4bit
- Ficha de Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Repositorio GitHub de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Guia de la API de Qwen 3.5 (familia y precios): https://kissapi.ai/blog/qwen-3-5-api-complete-guide-2026.html

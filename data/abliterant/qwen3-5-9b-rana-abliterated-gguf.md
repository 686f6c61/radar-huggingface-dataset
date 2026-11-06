# abliterant/Qwen3.5-9B-RANA-abliterated-GGUF

## Resumen

Qwen3.5-9B-RANA-abliterated-GGUF es la distribucion en formato GGUF del checkpoint abliterado Qwen3.5-9B-RANA-abliterated, publicado por Abliterant. Parte del modelo Qwen/Qwen3.5-9B de Alibaba, al que se le ha eliminado el comportamiento de rechazo (refusal ablation) mediante la tecnica RANA. El modelo es vision-language (pipeline image-text-to-text) y esta pensado para ejecutarse en llama.cpp y aplicaciones compatibles.

El repositorio contiene 15 cuantizaciones que van desde Q8_0 (9,53 GB) hasta IQ2_M (3,61 GB), ademas de una referencia BF16. La vision y la cabeza de decodificacion especulativa MTP se distribuyen como archivos separados (`mmproj-*` y `mtp-*`). El modelo tiene 8.953.803.264 parametros y una longitud de contexto configurada de 262.144 tokens, aunque el ejemplo probado por el autor usa 32.768.

Es relevante para investigadores de interpretabilidad, red-teaming y evaluacion de robustez del comportamiento de rechazo, ya que elimina las negativas del modelo base manteniendo una perdida de capacidades reducida segun las metricas del autor. Se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B); vision-language con proyector multimodal y cabeza MTP de decodificacion especulativa |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 configurados; 32.768 en el ejemplo probado; no establecido para GGUF |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3, IQ3, Q2_K, IQ2_M (15 cuantizaciones en total); referencia BF16; vision en BF16/F16; MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); vision y MTP en archivos separados |

## Arquitectura y entrenamiento

El modelo es una cuantizacion con matriz de importancia (importance-matrix GGUF) de la referencia BF16 `abliterant/Qwen3.5-9B-RANA-abliterated`, que a su vez deriva de `Qwen/Qwen3.5-9B`. No se trata de entrenamiento adicional, sino de compresion del checkpoint abliterado. La arquitectura subyacente es un transformer de Qwen3.5 con capacidad vision-language (proyector multimodal) y una cabeza MTP para decodificacion especulativa.

La innovacion principal es la tecnica de abliteracion RANA aplicada al modelo base, que elimina el comportamiento de rechazo. Segun el autor, frente a la abliteracion publica `bowmanslayer/Qwen3.5-9B-Uncensored`, RANA logra un +14,9 pp de respuestas utiles a peticiones daninas (67,4 % frente a 52,5 %), una perdida de capacidades 4,2 veces menor (0,79 frente a 3,31 pp) y una divergencia KL 2,7 veces menor respecto al modelo base (0,109 frente a 0,294). Estas metricas se midieron sobre la version BF16, no sobre los GGUF. Los datos de entrenamiento originales (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con modo thinking activado por defecto.
- Razonamiento y matematicas (heredados de Qwen3.5-9B).
- Generacion de codigo y respuestas tecnicas de contexto largo.
- Vision-language: procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector `mmproj`.
- Decodificacion especulativa con cabeza MTP (`--spec-type draft-mtp`).
- Comportamiento de rechazo eliminado: produce contenido que el modelo base rechaza.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion de interpretabilidad del comportamiento de rechazo: el modelo permite estudiar que representaciones internas generan las negativas comparando respuestas con el modelo base Qwen3.5-9B.
- Red-teaming y evaluacion de robustez: util para construir conjuntos de pruebas de seguridad y medir como responden sistemas alineados frente a uno sin alineacion.
- Evaluacion de tecnicas de abliteracion: sirve como referencia para comparar metodos (RANA frente a otras abliteraciones) usando las metricas de KLD y perdida de capacidades.
- Despliegue local en llama.cpp: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPU de consumo con vision y decodificacion especulativa.
- Procesamiento de documentos con imagenes: el soporte vision-language permite extraer y razonar sobre contenido de capturas o escaneos en un entorno local.
- Experimentos de generacion de codigo sin restricciones: util en entornos de investigacion donde se necesita analizar como responde el modelo a peticiones tecnicas que el base rechazaria.

## Benchmarks y rendimiento

| Metrica | Q8_0 | Q4_K_M | IQ2_M |
|---|---|---|---|
| KLD respecto a BF16 | 0,0032 | 0,0184 | 0,216 |

| Comparativa (BF16) | RANA | bowmanslayer/Qwen3.5-9B-Uncensored |
|---|---|---|
| Respuestas utiles a peticiones daninas | 67,4 % | 52,5 % |
| Perdida de capacidades (pp) | 0,79 | 3,31 |
| KL respecto al base | 0,109 | 0,294 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q8_0 ~9,53 GB; Q4_K_M en torno a 5-6 GB; IQ2_M ~3,61 GB (mas overhead de contexto y proyector vision).
- Probado por el autor con CUDA en una RTX 5090 de 32 GB (Blackwell) con llama.cpp commit `e14a779`.
- Cabe en GPU de consumo: las cuantizaciones Q4_K_M, Q5_K_M y Q3/IQ3 (4-5 GB) son viables en tarjetas de 8-12 GB; Q8_0 requiere 12 GB o mas.
- Despliegue: llama.cpp (`llama-server`); el ejemplo usa `-ngl 99 -c 32768 -fa on --jinja`. Tambien existen variantes FP8, AWQ y MLX en repos separados para vLLM, SGLang y Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| abliterant/Qwen3.5-9B-RANA-abliterated-GGUF | 8,95 B | 262.144 configurados | Apache-2.0 | GGUF | Abliteracion RANA, vision y MTP |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~9 B | no disponible | no disponible | Transformers | Abliteracion alternativa de Qwen3.5-9B |
| Abhiray/Qwen3.5-9B-abliterated-GGUF | ~9 B | no disponible | no disponible | GGUF | Cuantizaciones de lukey03/Qwen3.5-9B-abliterated |
| bowmanslayer/Qwen3.5-9B-Uncensored | ~9 B | no disponible | no disponible | no disponible | Referencia de comparacion del autor; mayor perdida de capacidades |

## Limitaciones y advertencias

- Modelo de investigacion con la alineacion de seguridad eliminada: producira contenido que el modelo base rechaza.
- Uso previsto exclusivamente para investigacion, interpretabilidad, red-teaming y evaluacion de robustez; el usuario es responsable del cumplimiento normativo.
- Riesgo de alucinacion y de generar contenido danino sin filtros; no apto para produccion orientada al publico sin salvaguardas externas.
- Sesgos conocidos: no documentados en la informacion disponible, pero heredados del modelo base.
- Idiomas soportados: no disponibles.
- La longitud de contexto de 262.144 tokens no esta establecida para GGUF; el ejemplo probado usa 32.768.
- Las cuantizaciones por debajo de 4 bits (Q3, IQ3, Q2_K, IQ2_M) presentan una deriva de calidad visible (KLD 0,216 en IQ2_M).
- Las comprobaciones funcionales solo se ejecutaron sobre Q4_K_M.
- Aunque la licencia es Apache-2.0, la ausencia de alineacion de seguridad puede implicar restricciones adicionales segun la jurisdiccion y el uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-GGUF
- Checkpoint BF16: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated
- Variante FP8: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-FP8
- Variante MLX: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-MLX
- Variante AWQ: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-AWQ
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Abliteracion de comparacion: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored
- Chat de demostracion: https://chat.abliterant.ai/
- Sitio del autor: https://abliterant.ai/
- Notas de investigacion RANA: https://abliterant.ai/research/rana-refusal-ablation
- Todos los formatos: https://abliterant.ai/models
- Modelos del autor: https://huggingface.co/abliterant
- Alternativa huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Alternativa Abhiray GGUF: https://huggingface.co/Abhiray/Qwen3.5-9B-abliterated-GGUF

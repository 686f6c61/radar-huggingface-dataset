# axteam/Qwen3.5-4B-AWQ-4bit

## Resumen

Qwen3.5-4B-AWQ-4bit es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario axteam y orientada especificamente al servicio eficiente con vLLM. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de aproximadamente 4.540 millones de parametros con arquitectura hibrida que combina atencion lineal y atencion completa, torre de vision y una cabeza de prediccion multi-token (MTP). Esta version cuantizada reduce el peso en disco a unos 4,2 GB manteniendo las activaciones en BF16.

La relevancia de esta publicacion reside en que permite desplegar un modelo multimodal de 4B en GPUs de consumo o en nodos modestos sin renunciar de forma significativa a la calidad del original. Segun las mediciones del autor, la cuantizacion AWQ INT4 conserva en promedio el 100,7 % del rendimiento del BF16 en un conjunto de benchmarks estandar, con un incremento de perplejidad del 6,2 % respecto al modelo original.

El checkpoint emplea el formato compressed-tensors `pack-quantized` con esquema W4A16 (pesos INT4 asimetricos con grupo de 32 y activaciones BF16), lo que lo hace directamente compatible con el servidor OpenAI de vLLM a partir de la version 0.17.0 de la arquitectura. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa), denso, multimodal (vision), con cabeza MTP |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de servicio usa `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT4 W4A16: pesos INT4 asimetricos, grupo de 32, escala BF16 + punto cero INT4, activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | No disponible (la calibracion uso un corpus mixto con fuerte presencia de coreano; los benchmarks incluyen ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con compressed-tensors (`pack-quantized`); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida que alterna capas de atencion lineal con capas de atencion completa, un patron habitual para reducir el coste computacional del contexto largo manteniendo la calidad de recuperacion de informacion. Incluye una torre de vision y un proyector para entrada de imagenes (pipeline `image-text-to-text`), ademas de una cabeza de prediccion multi-token (MTP) que puede aprovecharse para decodificacion especulativa. El modelo es denso, no MoE, con 4,54 mil millones de parametros.

Esta publicacion concreta no reentrena el modelo: aplica cuantizacion post-entrenamiento (PTQ) con AWQ sobre 256 muestras de calibracion de un corpus mixto con predominio de coreano. AWQ protege los canales de pesos mas relevantes antes del redondeo sin necesidad de gradientes. Se mantienen en BF16 la torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del modulo SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), lo que supone aproximadamente el 23 % de los parametros sin cuantizar. La revision del 1 de noviembre de 2026 restauro de forma bit-exacta los pesos RMSNorm no suavizados que la herramienta llm-compressor habia dejado con ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva).

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes y texto combinados (image-text-to-text), gracias a la torre de vision conservada en BF16.
- Razonamiento y resolucion de problemas matematicos, evidenciado por los resultados en GSM8K (76,42 en 5-shot estricto).
- Conocimiento general y academico medido en MMLU, ARC-Challenge y Winogrande.
- Capacidades multilingues con especial cobertura de ingles y coreano segun los benchmarks publicados (KMMLU, HAE-RAE); el resto de idiomas no esta documentado.
- Cabeza de prediccion multi-token (MTP) disponible en el checkpoint, utilizable para decodificacion especulativa en vLLM.
- Soporte de tool calling y function calling: no documentado explicitamente en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion proporcionada.
- Modo thinking explicito: no documentado en la informacion proporcionada.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo puede desplegarse como endpoint compatible con la API de OpenAI mediante `vllm serve` y atender conversaciones que combinen texto e imagenes, con un peso de solo 4,2 GB que deja espacio para cache KV y peticiones concurrentes.
- Asistencia sobre documentos escaneados o capturas: al conservar la torre de vision en BF16, puede extraer y razonar sobre contenido visual en flujos de digitalizacion, clasificacion o resumen de documentos.
- Razonamiento matematico asistido: sus resultados en GSM8K (76,42 en 5-shot estricto, equivalente al 103,2 % del BF16) lo hacen apto para tutoria o verificacion de calculos en aplicaciones educativas.
- Despliegue en hardware limitado: con 4,2 GB de pesos en INT4, cabe en GPUs de consumo con suficiente VRAM y permite montar entornos de desarrollo o demos sin infraestructura de centro de datos.
- Evaluacion e investigacion de cuantizacion: el repositorio incluye mediciones comparativas frente a FP8-dynamic, AWQ-8bit, NVFP4A16 y NVFP4 con el mismo harness, lo que lo convierte en una referencia util para estudiar el impacto de esquemas de cuantizacion en modelos multimodales pequenos.
- Procesamiento por lotes de texto en ingles y coreano: los benchmarks KMMLU y HAE-RAE confirman un rendimiento solido en coreano (97,1 % y 93,7 % de recuperacion respecto al BF16), adecuado para pipelines de analisis de contenido en ese idioma.
- Backend de aplicaciones con API compatible OpenAI: al integrarse con vLLM, puede sustituir a servicios propietarios en prototipos y productos internos manteniendo la licencia Apache-2.0.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, decodificacion greedy, prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con puntuaciones obtenidas por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 55,18 | 57,99 (105,1 %) | 54,79 (99,3 %) | 60,58 (109,8 %) | 58,61 (106,2 %) | 60,89 (110,3 %) |
| GSM8K (5-shot, estricto) | 74,07 | 73,92 (99,8 %) | 73,84 (99,7 %) | 76,72 (103,6 %) | 73,31 (99,0 %) | 76,42 (103,2 %) |
| ARC-Challenge (0-shot) | 54,61 | 53,92 (98,8 %) | 54,52 (99,8 %) | 54,86 (100,5 %) | 53,92 (98,8 %) | 54,35 (99,5 %) |
| Winogrande (5-shot) | 68,75 | 67,96 (98,9 %) | 69,14 (100,6 %) | 68,90 (100,2 %) | 69,38 (100,9 %) | 68,90 (100,2 %) |
| KMMLU (5-shot, directo) | 50,47 | 50,13 (99,3 %) | 50,48 (100,0 %) | 51,49 (102,0 %) | 50,26 (99,6 %) | 49,02 (97,1 %) |
| HAE-RAE (0-shot) | 62,42 | 61,50 (98,5 %) | 62,05 (99,4 %) | 61,69 (98,8 %) | 59,76 (95,7 %) | 58,48 (93,7 %) |
| **Media** | **60,92** | **60,90 (100,0 %)** | **60,81 (99,8 %)** | **62,37 (102,4 %)** | **60,87 (99,9 %)** | **61,34 (100,7 %)** |

Fidelidad respecto al BF16 original en un conjunto interno mixto ingles/coreano de 100 prompts (respuestas greedy del BF16 puntuadas bajo cada build):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,6672 | 1,5703 (+6,2 %) |
| Acuerdo top-1 en siguiente token | 89,0 % | 99,2 % |

## Requisitos de hardware

- VRAM para pesos: 4,2 GB en INT4. Hay que anadir cache KV (crece con la longitud de contexto y las peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs compatibles: NVIDIA Turing (sm75) o superior. No soporta V100 (sm70) porque la cuantizacion es weight-only INT y no requiere tensor cores especiales. El autor solo probo en B200.
- GPU de consumo: cabe en tarjetas con al menos 8 GB de VRAM efectiva para contextos moderados; con contextos largos o concurrencia alta conviene 12-16 GB o mas.
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Despliegue recomendado: vLLM (arquitectura disponible desde vLLM 0.17.0; probado con vLLM 0.32.0). Requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0.
- Alternativa sin vLLM: transformers >=5.2.0 con compressed-tensors >=0.15.0 (verificado en CPU con variantes del modelo 0.8B).
- No requiere `trust_remote_code`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparacion con otras variantes de cuantizacion del mismo modelo base, segun los datos publicados por el autor.

| Modelo | Parametros | Contexto | Media de benchmarks | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B (BF16) | 4,54 B | No disponible | 60,92 | Apache-2.0 | Safetensors BF16 |
| **Qwen3.5-4B-AWQ-4bit** | 4,54 B | No disponible | 61,34 (100,7 %) | Apache-2.0 | compressed-tensors INT4 |
| Qwen3.5-4B NVFP4A16 | 4,54 B | No disponible | 62,37 (102,4 %) | Apache-2.0 | NVFP4 |
| Qwen3.5-4B AWQ-8bit | 4,54 B | No disponible | 60,81 (99,8 %) | Apache-2.0 | compressed-tensors INT8 |
| Qwen3.5-4B FP8-dynamic | 4,54 B | No disponible | 60,90 (100,0 %) | Apache-2.0 | FP8 |

No se dispone de datos de benchmarks de modelos de otros fabricantes en la informacion proporcionada, por lo que no se incluye comparacion con alternativas externas.

## Limitaciones y advertencias

- Perplejidad un 6,2 % superior al BF16 original y acuerdo top-1 del 89,0 %: la cuantizacion introduce degradacion medible, especialmente en tareas sensibles a la distribucion exacta de probabilidades.
- Caida notable en coreano: HAE-RAE baja al 93,7 % y KMMLU al 97,1 % respecto al BF16, pese a que la calibracion uso un corpus con fuerte presencia de coreano.
- La calibracion con 256 muestras de un corpus mixto con predominio de coreano puede no representar optimamente otros dominios o idiomas.
- Riesgo de alucinacion inherente a un modelo de 4B: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no documentados; solo hay evidencia empirica para ingles y coreano.
- Longitud de contexto nativa: no disponible; el ejemplo de servicio limita a 32.768 tokens, pero no se confirma que sea el maximo del modelo.
- Requiere versiones muy concretas del stack (torch 2.13 con CUDA 13.0, transformers >=5.16.1,<5.20, compressed-tensors 0.17.0 sin actualizar por separado); desviarse de estas versiones puede romper la carga del checkpoint.
- No soporta V100 (sm70); solo se ha validado en B200, por lo que el rendimiento en otras GPUs no esta medido.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base enlazadas en la model card.
- La model card advierte que las mediciones se tomaron antes de la revision de las RMSNorm del 1 de noviembre de 2026.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-4B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness

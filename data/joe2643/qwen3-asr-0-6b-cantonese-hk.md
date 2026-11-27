# joe2643/Qwen3-ASR-0.6B-Cantonese-HK

## Resumen

Qwen3-ASR-0.6B-Cantonese-HK es un ajuste fino de parametros completos del modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B de Alibaba Qwen, especializado en cantonés coloquial de Hong Kong (yue-HK) con alternancia de codigo con ingles (code-switching). Lo desarrolla el autor independiente joe2643 (proyecto Koelony) y resuelve un problema concreto: los modelos ASR multilingues genericos rinden mal en cantonés hablado informal, especialmente en caracteres coloquiales, vocabulario local y mezcla cantones-ingles.

El modelo conserva la arquitectura del ASR base de Qwen3 (encoder de audio mas decoder tipo transformer con atencion completa), con 782.426.112 parametros reales en safetensors y pesos BF16. Su ventaja practica es el tamano: ofrece precision de transcripcion en cantonés superior a la del modelo base de 0.6B y competitiva frente a variantes de 1.7B, con aproximadamente un tercio del coste computacional de estas ultimas.

Es relevante ahora porque incluye entrenamiento especifico para comandos de voz cortos (por ejemplo `閂燈`, `閂冷氣`, `開燈`) y un mecanismo de sesgo por hotwords con contexto que evita el "parroting" (que el modelo repita terminos del prompt que no aparecen en el audio). Ademas publica pesos GGUF en repositorios hermanos, lo que permite despliegue en llama.cpp y en el borde (edge/movil).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR basada en Qwen3 (encoder de audio + decoder transformer); familia `qwen3_asr` |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repo); GGUF `Q4_K_M`, `Q6_K`, `Q8_0` en el repo hermano `-GGUF`, con `mmproj` y variantes single-file para `transcribe.cpp` |
| Idiomas soportados | yue (cantonés, yue-HK), zh (chino), en (ingles); evaluado solo en cantonés y cantonés-ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, Transformers: `config.json` + `model.safetensors`); GGUF en repo separado |
| Tamano del repo | 1,6 GB |
| Modelo base | Qwen/Qwen3-ASR-0.6B (finetune de parametros completos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-0.6B y se somete a un ajuste fino de parametros completos (full-parameter fine-tune) orientado a cantonés de Hong Kong. El autor no detalla en la model card el volumen exacto de horas de audio ni la composicion completa del dataset; si indica que la direccion de recoleccion de datos y la estrategia de ajuste corresponden a @sennett-lau. La salida nativa es chino tradicional de Hong Kong con caracteres coloquiales (`係`, `喺`, `嘅`, `咗`, `㗎`, `閂`) y mantiene las palabras en ingles en ingles.

La innovacion tecnica destacable es el entrenamiento con sesgo por hotwords mediante contexto, bajo un curriculum de condicionamiento 75/15/7/3 que incluye trampas de homofonos, distractores puros y enunciados ultra-cortos de 1 a 4 caracteres. El objetivo es que el modelo aproveche hotwords relevantes sin repetir terminos del prompt que no estan en el audio (anti-parroting). Tambien se entrena explicitamente para comandos de voz cortos. No se documenta en la informacion disponible el uso de RLHF/DPO ni el numero de tokens de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla en cantonés de Hong Kong (yue-HK) con salida en chino tradicional y caracteres coloquiales.
- Alternancia de codigo cantonés-ingles (code-switching): mantiene las palabras inglesas en ingles.
- Sesgo por hotwords o vocabulario de dominio mediante parametro `context`, colocado internamente en el system prompt.
- Anti-parroting: no repite hotwords del prompt que no aparecen en el audio (tasa de parroting reportada del 0,0% en la suite de estres).
- Transcripcion de comandos de voz ultra-cortos (1 a 4 caracteres).
- Soporte de multiples idiomas declarados (yue, zh, en), aunque el rendimiento fuera de cantonés puede ser peor que el del modelo base.
- Compatibilidad con endpoints y con el ecosistema `qwen-asr` / Transformers; exportacion a GGUF para llama.cpp y `transcribe.cpp`.

## Casos de uso

- Dictado por voz en macOS para cantonés: integrado en OraType, que distribuye el GGUF `Q6_K` con encoder `mmproj-Q8_0` como modelo de voz por defecto para cantonés; adecuado por su tamano reducido y su salida en caracteres coloquiales.
- Control por voz de dispositivos del hogar: entrenado para comandos cortos como `閂燈` o `閂冷氣`, lo que permite mapear utterances breves a acciones con baja tasa de error en audio de pocos caracteres.
- Transcripcion de reuniones y actas del Consejo Legislativo de Hong Kong (LegCo): el modelo reporta CER del 7,62% en ese conjunto, util para generar actas con terminologia institucional mediante hotwords.
- Subtitulado de contenido audiovisual cantones con mezcla de ingles: el CER del 6,98% en el conjunto MCE lo hace apto para transcripcion de podcasts y videos con code-switching.
- Sesgo de vocabulario de dominio en entornos sanitarios o legales: el parametro `context` permite inyectar listas de terminos especializados sin que el modelo los alucine cuando no se pronuncian.
- Despliegue en el borde o movil: las variantes GGUF `Q4_K_M`/`Q6_K`/`Q8_0` permiten ejecucion en llama.cpp (`llama-server`) y en `transcribe.cpp`/Hex en macOS, con un modelo inferior a 1 GB en cuantizaciones bajas.
- Preprocesado de datos de voz para entrenamiento de otros modelos: la salida normalizada en chino tradicional facilita la generacion de transcripciones de referencia en corpus cantoneses.

## Benchmarks y rendimiento

Tasa de error de caracteres (CER), decodificacion greedy, BF16 con `transformers`. El texto se convierte a simplificado (OpenCC `t2s`), se normalizan numeros y se eliminan espacios; el idioma se fuerza a cantonés.

| Conjunto de prueba | Qwen3-ASR-0.6B base | Este modelo (0.6B-Cantonese-HK) | Qwen3-ASR-1.7B base | 1.7B-Cantonese-HK v2 | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 6,10% | 5,70% | 4,20% | 3,95% | 20,97% |
| Common Voice `yue` | 6,84% | 5,12% | 5,46% | 3,86% | 36,44% |
| Common Voice 23 `zh-HK` | 9,55% | 6,44% | 7,65% | 5,09% | 41,76% |
| MDCC | 5,45% | 3,29% | 4,25% | 2,49% | 34,52% |
| LegCo (Consejo Legislativo de HK) | 8,81% | 7,62% | 7,22% | 7,16% | 32,15% |
| MCE (code-switching cantonés-ingles) | 15,52% | 6,98% | 11,74% | 5,62% | 24,00% |

Suite de estres de 210 clips para sesgo por hotwords y anti-parroting:

| Condicion | CER Qwen3-ASR-0.6B base | CER este modelo | Tasa de parroting |
|---|---:|---:|---:|
| Hotwords relevantes + distractores homofonos | 11,23% | 8,14% | 0,0% |
| Lista de distractores 100% irrelevantes | 15,69% | 11,92% | 0,0% |
| Audio ultra-corto + lista larga de hotwords | 14,38% | 12,50% | 0,0% |

Solo se evaluaron habla en cantonés y cantonés-ingles; otros idiomas pueden rendir peor que el modelo base.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,6 GB de pesos mas overhead de activaciones y encoder de audio; en la practica, holgadamente por debajo de 4 GB en GPU.
- Cuantizaciones GGUF: `Q8_0` en torno a 0,8 GB, `Q6_K` en torno a 0,6 GB y `Q4_K_M` en torno a 0,5 GB (estimacion segun el tamano del repo y los pesos BF16; no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 (RTX 3050/4060 en adelante); A100/H100 no son necesarias y solo aportarian throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU mediante llama.cpp con GGUF.
- Opciones de despliegue: `transformers` con `qwen-asr`, vLLM, llama.cpp (`llama-server`), `transcribe.cpp`/Hex (macOS) y OraType.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER MCE (code-switching) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0.6B-Cantonese-HK) | 782 M | no disponible | 6,98% | apache-2.0 | HF (BF16 + GGUF) |
| Qwen3-ASR-0.6B base | no disponible | no disponible | 15,52% | no disponible | HF |
| Qwen3-ASR-1.7B-Cantonese-HK v2 | no disponible (1.7B) | no disponible | 5,62% | no disponible | HF (BF16 + GGUF) |
| whisper-large-v3 | no disponible | no disponible | 24,00% | no disponible | no disponible |

El modelo se situa entre el 0.6B base y las variantes de 1.7B: mejora claramente al base en todos los conjuntos evaluados y se acerca al 1.7B ajustado, con un coste de inferencia aproximadamente tres veces menor.

## Limitaciones y advertencias

- Solo se ha evaluado en cantonés y cantonés-ingles; en otros idiomas puede rendir peor que el modelo base, pese a declarar soporte de zh y en.
- Riesgo de alucinacion y de sustitucion de palabras en audio con ruido, acentos no hongkoneses o terminologia muy especializada fuera de los hotwords proporcionados.
- La salida esta fijada a chino tradicional de Hong Kong con caracteres coloquiales; puede requerir normalizacion adicional para pipelines que esperen simplificado o texto formal.
- El sesgo por hotwords depende de que la lista `context` sea relevante; listas muy largas o con distractores elevan el CER (hasta 12,50% en el caso de audio ultra-corto con lista larga).
- No se documentan sesgos demograficos ni de genero en la model card.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-ASR-0.6B y de los pesos derivados.
- El autor no publica el dataset de entrenamiento ni el numero de horas de audio, lo que dificulta auditar la cobertura y los sesgos del ajuste.
- Desarrollado por un autor independiente, no por Alibaba; el soporte y las actualizaciones no estan garantizados a largo plazo.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repo GGUF: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Variante 1.7B: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Variante 1.7B GGUF: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Demo en vivo: https://demo.koelony.com
- Pagina del proyecto: https://koelony.com/asr/
- GitHub: https://github.com/koelony/qwen3-asr-cantonese-hk
- OraType (integracion): https://github.com/sennett-lau/oratype
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Apoyo al autor: https://buymeacoffee.com/joe2643

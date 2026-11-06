# BlivionIaG/Qwen3.8-27B-HI2-3.0bpw

## Resumen

Qwen3.8-27B-HI2-3.0bpw es un punto de control cuantizado a 3,0 bits del modelo multimodal Qwen3.8-27B de Qwen, producido por el usuario BlivionIaG mediante la herramienta hi2 (versión del método `rdna_hint_flex` v3.2). El modelo original es un modelo de generación de texto e imagen a texto (pipeline image-text-to-text) de 27B de parámetros publicado bajo licencia Apache-2.0; esta variante aplica una cuantización post-entrenamiento (PTQ) combinada con destilación consciente de la cuantización (QAD) para reducir el tamaño del checkpoint de 51,7 GiB (BF16) a 15,0 GiB.

La relevancia de esta ficha radica en el enfoque técnico: se trata de una cuantización agresiva a 3 bits (mezcla de 66 % INT2 y 34 % INT4) que, según las mediciones del autor, supera en fidelidad a alternativas a 4 bits como AWQ INT4 y GGUF Q4_K_M en varias métricas de divergencia y en una batería de tareas. Está pensada específicamente para servirse en GPUs AMD RDNA (gfx1030/gfx1100) mediante un fork de vLLM con soporte ROCm, lo que la hace interesante para despliegues en hardware AMD con VRAM limitada.

El checkpoint cuantiza 496 lineales del modelo de lenguaje (24,35 B de pesos, 8,5 GiB, 3,012 bpw medidos) mientras que la torre de visión (333 tensores) se mantiene en BF16. La calibración usó 262.144 tokens con redondeo GPTQ, rotación activada y smoothing 0,5, seguida de una fase QAD de 300 pasos por capa en 64 capas y una fase final de 200 pasos con pérdida KL de logits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, image-text-to-text); detalles adicionales no disponibles |
| Parametros totales | 6.436.951.856 (según safetensors del repo); el modelo base es Qwen3.8-27B |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HI2 3,012 bpw (66 % INT2 / 34 % INT4) sobre lineales; torre de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (15,0 GiB de checkpoint); servible con fork de vLLM sobre ROCm |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un transformer multimodal de la familia Qwen (arquitectura `qwen3_5`) con pipeline image-text-to-text: genera texto a partir de entrada de texto e imagen. No se dispone de datos publicados sobre el número de tokens de preentrenamiento, composición del dataset, ni fases de RLHF/DPO del modelo base en la información proporcionada.

La innovación principal de esta ficha no está en el modelo base sino en el proceso de cuantización hi2. Se trata de una cuantización post-entrenamiento a 3,0 bits objetivo que combina:

- **PTQ con GPTQ**: calibración con 262.144 tokens (128 muestras de 2.048 tokens), rotación activada y smoothing 0,5. Se cuantizan 496 lineales del modelo de lenguaje (24,35 B de pesos), con una mezcla de 66 % INT2 y 34 % INT4 que arroja 3,012 bpw medidos.
- **QAD (quantization-aware distillation)**: 300 pasos por capa en las 64 capas del modelo (247 minutos en cuatro AMD V620), seguidos de una fase final de 200 pasos con pérdida KL de logits, que redujo la KL de held-out de 0,4122 a 0,2427 (7,85 horas adicionales).

La torre de visión (333 tensores) se conserva en BF16, por lo que las capacidades multimodales no sufren la pérdida de precisión de los lineales de texto. El resultado es un checkpoint de 15,0 GiB, 3,45 veces más pequeño que el BF16 original (51,7 GiB).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Entrada multimodal imagen + texto (pipeline image-text-to-text); la torre de visión permanece en BF16.
- Razonamiento matematico: 96,0 % en la suite reducida de gsm8k (100 items), ligeramente por encima del BF16 (95,0 %).
- Generacion de codigo: 94,0 % en HumanEval y 84,0 % en MBPP (frente a 95,0 % y 93,0 % del BF16).
- Seguimiento de instrucciones: 95,0 % en IFEval, igualando o superando al BF16 (94,0 %).
- Tool calling: soportado en el modelo base, pero con degradacion notable por la cuantizacion (55,7 % frente a 60,8 % del BF16 en la suite; solo el 53,0 % de las primeras llamadas a herramienta coincide con la decision del BF16).
- Recuperacion de informacion en contexto largo (needle): 100,0 %, igual que el BF16.

## Casos de uso

- **Chatbots y asistentes conversacionales en hardware AMD**: el modelo se sirve con vLLM sobre ROCm en GPUs RDNA (gfx1030/gfx1100), lo que permite montar un asistente multimodal en estaciones de trabajo con GPUs AMD Radeon (como las RX 6800/6900 o 7900 series) sin depender de NVIDIA.
- **Inferencia multimodal con VRAM limitada**: con 15,0 GiB de checkpoint, cabe en una sola GPU de 24 GB (por ejemplo una Radeon RX 7900 XTX) con tensor parallel adicional para configuraciones multi-GPU, habilitando descripcion de imagenes y VQA local.
- **Razonamiento matematico y resolucion de problemas**: con 96,0 % en gsm8k (por encima incluso del BF16 en la muestra medida), es adecuado para asistentes de matematicas escolares o universitarias basicas.
- **Generacion y asistencia de codigo**: con 94,0 % en HumanEval, sirve para autocompletado y generacion de funciones en editores locales, aunque para tareas tipo MBPP conviene verificar la salida (84,0 % frente al 93,0 % del BF16).
- **Seguimiento estricto de instrucciones**: 95,0 % en IFEval lo hace apropiado para flujos donde el formato de salida importa (generacion de informes estructurados, plantillas, extraccion con formato fijo).
- **Procesamiento por lotes offline de documentos**: el buen rendimiento en perplexidad y KLD sobre texto de dominio (4,158 frente a 4,107 del BF16 en "docs") lo hace viable para resumen y analisis masivo de texto donde el coste por token es mas importante que la fidelidad maxima.
- **Agentes con llamadas a herramienta (con cautela)**: el modelo base soporta tool calling, pero la cuantizacion degrada la fidelidad de decision (53,0 % de coincidencia con el BF16 en la primera herramienta); solo conviene usarlo en agentes con validacion y reintentos, no en pipelines criticos.

## Benchmarks y rendimiento

Los datos siguientes provienen de la evaluacion del propio autor, medida contra el modelo BF16 original (suite reducida, 100 items por familia, salvo indicacion):

| Tarea | BF16 | HI2 PTQ | HI2 QAD fast | HI2 QAD default (este) | AWQ INT4 |
|---|---:|---:|---:|---:|---:|
| GSM8K (n=100) | 95,0 % | 94,0 % | 95,0 % | 96,0 % | 95,0 % |
| HumanEval (n=100) | 95,0 % | 93,0 % | 89,0 % | 94,0 % | 95,0 % |
| MBPP (n=100) | 93,0 % | 85,0 % | 85,0 % | 84,0 % | 90,0 % |
| IFEval (n=100) | 94,0 % | 93,0 % | 90,0 % | 95,0 % | 94,0 % |
| Toolcall (n=97) | 60,8 % | 37,1 % | 28,9 % | 55,7 % | 49,5 % |
| Needle (n=68) | 100,0 % | 100,0 % | 100,0 % | 100,0 % | 100,0 % |
| MC (n=100) | 64,0 % | 63,0 % | 59,0 % | 61,0 % | 67,0 % |
| Decision (n=66) | 87,9 % | 74,2 % | 78,8 % | 74,2 % | 83,3 % |
| **Media macro (n=731)** | **86,2 %** | 79,9 % | 78,2 % | **82,5 %** | 84,2 % |
| Diferencia agrupada vs BF16 | — | -6,2 [-8,5, -4,0] | -8,2 [-10,8, -5,7] | -3,4 [-5,6, -1,2] | -1,9 [-3,6, -0,3] |

Metricas de fidelidad de distribucion (perplexidad y KLD frente al BF16):

| Metrica | BF16 | HI2 PTQ | HI2 QAD default (este) | AWQ INT4 | GGUF Q4_K_M |
|---|---:|---:|---:|---:|---:|
| Body bpw | 16 | 3,012 | 3,012 | 4,625 | 4,738 |
| Checkpoint | 51,7 GiB | 14,9 GiB | 15,0 GiB | 20.044 MiB | 15.702 MiB |
| Perplexity, docs | 4,107 | 4,307 | **4,158** | 4,189 | — |
| Perplexity, mix | 5,156 | 4,835 | **4,567** | 5,219 | — |
| KLD, docs | 0 | 0,0975 | **0,0593** | — | 0,0142 |
| KLD, mix | 0 | 0,2171 | **0,1837** | — | 0,0776 |
| Top-1, docs / mix | 100 / 100 % | 88,1 / 86,6 % | 90,8 / 86,7 % | — | — |

No se han publicado resultados de benchmarks estandarizados independientes (MMLU, etc.) en la informacion disponible; los datos anteriores son mediciones del autor del checkpoint.

## Requisitos de hardware

- **VRAM para inferencia**: el checkpoint ocupa 15,0 GiB; con contexto y KV cache, una GPU de 24 GB es un objetivo realista. El autor sirve el modelo con `--tensor-parallel-size 4` en cuatro GPUs AMD V620 (16 GB cada una).
- **GPUs compatibles**: los kernels de servicio solo estan implementados para gfx1030 (RDNA2, p. ej. RX 6800/6900, V620) y gfx1100 (RDNA3, p. ej. RX 7900 series). No hay soporte para NVIDIA ni para CDNA en esta variante.
- **Consumer GPUs**: cabe en una RX 7900 XTX (24 GB) en configuracion de una sola GPU; en RDNA2 (16 GB) se requiere tensor parallel multi-GPU.
- **Requisito de dtype**: `--dtype float16` es obligatorio, ya que RDNA2 no tiene soporte hardware de BF16.
- **Despliegue**: exclusivamente mediante el fork de vLLM del autor (rama `rdna_extras`, build ROCm 7.14), con variables de entorno concretas (`VLLM_ROCM_USE_AITER=0`, `FLASH_ATTENTION_TRITON_AMD_ENABLE=TRUE`, `VLLM_RDNA_FORCE_FP16=1`, entre otras). No es compatible con llama.cpp, Ollama ni TGI en su formato HI2.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa entre variantes cuantizadas del mismo modelo base, segun datos del autor:

| Modelo | bpw | Checkpoint | Media macro (731) | Dif. vs BF16 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Qwen3.8-27B (BF16) | 16 | 51,7 GiB | 86,2 % | — | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-HI2-3.0bpw (este) | 3,012 | 15,0 GiB | 82,5 % | -3,4 [-5,6, -1,2] | Apache-2.0 | Hugging Face, solo fork vLLM AMD |
| AWQ INT4 (referencia) | 4,625 | 20.044 MiB | 84,2 % | -1,9 [-3,6, -0,3] | Apache-2.0 | Formato estandar, amplio soporte |
| GGUF Q4_K_M (referencia) | 4,738 | 15.702 MiB | no disponible | KLD 0,0142 (docs) | Apache-2.0 | llama.cpp, Ollama, amplio soporte |

La ventaja diferencial del checkpoint HI2 es ofrecer un punto de operacion a 3 bits con perdida contenida (media macro 82,5 % frente a 86,2 % del BF16), por debajo en tamano del Q4_K_M y con mejores metricas de perplexidad y KLD que AWQ INT4 en los textos evaluados. Su limitacion principal es el ecosistema: solo funciona con el fork de vLLM del autor en GPUs AMD RDNA concretas.

## Limitaciones y advertencias

- **Degradacion en tool calling**: solo el 53,0 % de las primeras llamadas a herramienta coincide con la decision del BF16, el 45,5 % coincide ademas en los argumentos, y el 74,2 % esta bien formada (BF16: 100 % en los tres casos). Evitar en agentes criticos o anadir capas de validacion.
- **Generacion de codigo**: MBPP cae al 84,0 % frente al 93,0 % del BF16; conviene revisar el codigo generado.
- **Divergencia de dominio**: KLD teacher-forced de 0,174 nats/token en IFEval y 0,077 en decision, muy por encima de AWQ INT4 (0,020 y 0,023 respectivamente), indicando mayor desviacion de la distribucion del modelo original.
- **Comparacion asimetrica**: no hay otros modelos de texto a 3 bits en el conjunto de comparacion; AWQ INT4 usa 4,625 bpw y GGUF Q4_K_M 4,738 bpw, es decir, mas bits por peso.
- **Soporte de hardware muy restringido**: kernels de servicio limitados a gfx1030/gfx1100; incompatible con NVIDIA, CDNA y con las herramientas habituales (llama.cpp, Ollama, TGI).
- **Reproducibilidad**: la salida greedy no es bitwise reproducible entre reinicios del servidor (seleccion de GEMM de TunableOp, orden de acumulacion en fp16).
- **Metricas del propio autor**: todas las evaluaciones provienen del creador del checkpoint con suites reducidas (100 items por familia); no hay verificacion independiente.
- **Datos del modelo base**: longitud de contexto, idiomas soportados y detalles de entrenamiento de Qwen3.8-27B no constan en la informacion disponible; consultar la ficha del modelo base antes de usar en produccion.
- **Licencia**: Apache-2.0 tanto en el modelo base como en el checkpoint, sin restricciones de uso comercial conocidas.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/BlivionIaG/Qwen3.8-27B-HI2-3.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion hi2: https://github.com/BlivionIaG/hi2 (receta en `docs/qad.md`, mediciones en `docs/results.md`)
- Fork de vLLM con soporte RDNA: https://github.com/BlivionIaG/vllm (rama `rdna_extras`)

# GEHIRNS/magi-1.3-1.7B

## Resumen

magi-1.3-1.7B es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B publicado por el usuario GEHIRNS en Hugging Face. Se distribuye exclusivamente como cuantización GGUF IQ2_XXS (871 MiB, 4.19 bits por peso) y está orientado a razonamiento y conversación. El modelo parte de la arquitectura híbrida de LFM3 (convoluciones shortconv combinadas con atención completa) y aplica sobre ella un ajuste QLoRA SFT seguido de una fase DPO v1. La licencia es Apache 2.0.

La relevancia del modelo radica en su relación entre capacidad y huella de memoria: con 1.728.801.600 parámetros reales, cabe en 863 MiB de VRAM en una sola lane de inferencia (700 MiB de pesos, 100 MiB de contexto y 63 MiB de cómputo), lo que lo hace desplegable en GPUs de consumo. El autor reporta un índice macro de 72,45 en su suite propia Full2313 y de 73,73 en Screen250, con una densidad de información (ID) de 2,207 y 2,288 respectivamente.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con benchmarks declarados por el autor sin verificación independiente. Su interés práctico está en escenarios de razonamiento ligero con tool calling y en entornos con restricciones severas de memoria, no en competición con modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM3: 24 capas, 13 convolucionales shortconv y 6 de atención completa (capas 2, 6, 10, 14, 18, 22), 5 capas con sliding window de 256 |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Máximo 262.144 tokens; KV cache de 113 MiB a 32K con q4_0 (28 MiB a 8192 por slot) |
| Tipos de cuantizacion | IQ2_XXS (871 MiB, 4.19 BPW) como distribución principal; también BF16 (3,3 GB, 16 BPW) y Q4_K_M (1,1 GB) según la model card; 167 tipos de tensor en el GGUF magi |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería gguf); también safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es la de LFM3-1.7B: 24 capas con hidden size 2048, 16 cabezas de atención y 4 cabezas KV, intermediate size 7680 y vocabulario de 128.000 tokens. De las 24 capas, 13 son convolucionales shortconv (cuantizadas como q8_0 en conv/in/out), 6 son de atención completa (q4_k) y 5 usan sliding window de 256. No se podó ninguna capa: las 24 están intactas y la imatrix se empleó únicamente para la importancia de cuantización. La cuantización IQ2_XXS usa 167 tipos de tensor: 82 iq3_xxs en las FFN, 39 q8_0 en las convoluciones shortconv, 31 q4_k en la atención completa, 15 iq4_xs en los bloques 10-14 y 1 q4_k en el token embedding. La imatrix propia (imatrix-lfm3-own.gguf, 3,5 MB, PPL 2,3983) se calibró con calib-4b.txt en 22 pasadas de 8192 tokens.

El ajuste fino consta de dos fases. La SFT se hizo con QLoRA nf4 de doble cuantización y cómputo bf16, rango 16, alpha 32, sobre los targets w1, w2, w3, q_proj, k_proj, v_proj, o_proj, gate_proj, in_proj y out_proj, con 1.696 trazas correctas sesgadas a commonsense (1.400 de hellaswag, 600 de winogrande, 400 de obqa, 400 de sciq, 400 de arc, 300 de mmlu, 100 de gsm8k), 212 pasos y pérdida de 0,668 a 0,389; el adaptador resultante ocupa 63 MiB. La DPO v1 usó beta 0,1, NLL 1,0, learning rate 2e-5 y grad_accum 8 sobre 607 pares (409 hellaswag, 88 mmlu, 78 obqa, 48 gsm8k, 27 sciq, 25 arc), 76 pasos y pérdida de 13 a 7, con los log-probabilities de referencia calculados una sola vez. Las versiones v2 y v3 regresaron (72,52 % y 72,54 % frente al 73,73 % de v1).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo de pensamiento (think) configurable; el autor reporta una media de 1.476 tokens de pensamiento en la suite Full2313.
- Razonamiento matemático y de sentido común, con resultados destacados en gsm8k (90,7 %) y arc (88,7 %) según los benchmarks declarados.
- Generación de código: HumanEval 86,6 % y Mbpp 68,2 % en la suite del autor.
- Tool calling y function calling: 100 % en la suite toolcall declarada (100/100).
- Capacidades de agente y razonamiento multi-paso, apoyadas por el modo think y la ventana de contexto de hasta 262.144 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin soporte de visión ni audio según la información disponible.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con 863 MiB de VRAM por lane, el modelo cabe en tarjetas de 8 GB o menos y permite desplegar un chatbot multi-turno en un portátil o mini-PC con GPU, usando el contexto de 8K por slot (28 MiB de KV).
- Automatización de tool calling en pipelines: el 100 % declarado en la suite toolcall lo hace adecuado para orquestar llamadas a APIs y funciones en flujos de automatización, con el modelo actuando como enrutador de herramientas.
- Razonamiento matemático asistido: con gsm8k al 90,7 % declarado, puede emplearse para resolver problemas aritméticos de varios pasos en aplicaciones educativas o de validación de cálculos, activando el modo think para trazas explícitas.
- Generación de código en entornos con restricciones de memoria: HumanEval al 86,6 % permite usarlo como autocompletado o generador de funciones en IDE, desplegado con llama.cpp u Ollama en máquinas sin GPU dedicada de gran capacidad.
- Procesamiento de documentos largos con contexto extendido: la ventana de hasta 262.144 tokens (con KV cache de 113 MiB a 32K) permite resumir o extraer información de documentos extensos en una sola pasada, siempre que la memoria lo permita.
- Despliegue multi-lane en servidor modesto: el autor documenta 6 lanes con 2,2 GB totales y 282 TPS de evaluación, útil para servir varias conversaciones concurrentes en una sola GPU de 12 GB.
- Prototipado e investigación de ajustes DPO: al ser un fine-tune reproducible con receta QLoRA + DPO documentada, sirve como base para experimentar con preferencias y evaluar regresiones entre versiones.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Suite | Métrica | Valor | Notas |
|---|---|---|---|
| Full2313 (2313 tareas, 12 suites) | Índice macro | 72,45 | ID 2,207; 863 MiB; delta -9,45 frente a full-mix-M64x-q4 (81,9 % a 3034 MiB) |
| Screen250 (250 tareas, 12 suites, think 4096) | Índice | 73,73 | ID 2,288; delta +1,57 frente a lfm3-magi (72,16 %) y +1,92 frente a SFT (71,81 %) |
| HumanEval | Precisión | 86,6 % (142/164) | Full2313 |
| Mbpp | Precisión | 68,2 % (272/399) | Full2313 |
| ARC | Precisión | 88,7 % (133/150) | Full2313 |
| GSM8K | Precisión | 90,7 % (136/150) | Full2313 |
| HellaSwag | Precisión | 50,0 % (100/200) | Full2313 |
| LCB | Precisión | 23,3 % (35/150) | Full2313 |
| MMLU | Precisión | 59,0 % (118/200) | Full2313 |
| OBQA | Precisión | 82,5 % (165/200) | Full2313 |
| SciQ | Precisión | 89,0 % (178/200) | Full2313 |
| Toolcall | Precisión | 100 % (100/100) | Full2313 |
| TruthfulQA | Precisión | 68,0 % (136/200) | Full2313 |
| Winogrande | Precisión | 63,5 % (127/200) | Full2313 |
| Micro | Precisión | 70,99 % (1642/2313) | Full2313 |

Rendimiento de inferencia declarado: 6,3 s por tarea en una lane con 325 TPS de evaluación y 648 TPS globales; 6 lanes con 2,2 GB y 282 TPS de evaluación (máxima eficiencia); 7 lanes con 2,5-2,9 GB y 218 TPS; 8 lanes provocan deadlock por espera circular en el planificador de llama-server.

## Requisitos de hardware

- VRAM para inferencia: 863 MiB por lane en IQ2_XXS (700 MiB de modelo, 100 MiB de contexto y 63 MiB de cómputo); 2,2 GB para 6 lanes; BF16 requiere 3,3 GB (3298 MiB) y Q4_K_M 1,1 GB.
- GPU recomendadas: el autor valida en una RTX 5070 de 12 GB; cualquier GPU con al menos 1 GB libre puede ejecutar una lane en IQ2_XXS. Para 6 lanes concurrentes se recomienda al menos 3 GB de VRAM libre.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 2 GB o más para una lane; con 8-12 GB se pueden servir varias lanes.
- Opciones de despliegue: Ollama (imagen `lfm3-1.7b:r36-dpo-v1`, 913 MB, digest 0fdf61b916d4), llama.cpp/llama-server y cualquier runtime compatible con GGUF. Para Ollama es necesario fijar `OLLAMA_NUM_PARALLEL=6` antes de arrancar el servidor para alcanzar la configuración de 6 lanes.
- Latencia y throughput: 6,3 s por tarea en una lane (325 TPS de evaluación, 648 TPS globales); con 6 lanes, 282 TPS de evaluación y 99 TPS globales. El ajuste fino completo en BF16 no cabe en 12 GB (22,5 GiB estimados); la receta QLoRA propuesta para v4 requiere unos 3,1 GiB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| magi-1.3-1.7B | 1,7B | 262.144 | 72,45 (Full2313); 73,73 (Screen250) | Apache 2.0 | GGUF IQ2_XXS, 871 MiB |
| LiquidAI/LFM3-1.7B (base) | 1,7B | 262.144 | No disponible | No disponible en la información | Safetensors y GGUF |
| lfm3-magi (variante previa del autor) | 1,7B | 262.144 | 72,16 (Screen250) | Apache 2.0 | GGUF |
| full-mix-M64x-q4 (referencia del autor) | No disponible | No disponible | 81,9 (Full2313) a 3034 MiB | No disponible | GGUF |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se dispone de datos de otros modelos de 1,7B en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor, marcados como no verificados y medidos sobre suites propias (Full2313, Screen250) que no son estándar de la comunidad; no son directamente comparables con evaluaciones independientes.
- HellaSwag al 50,0 % y LCB al 23,3 % indican un rendimiento débil en sentido común y en generación de código competitivo de mayor dificultad; el índice macro de 72,45 es 9,45 puntos inferior a la referencia full-mix-M64x-q4 del propio autor.
- Riesgo de alucinación inherente a un modelo de 1,7B; TruthfulQA al 68,0 % sugiere margen de mejora en veracidad.
- Idiomas soportados no documentados; no hay evidencia de capacidades multilingües más allá del inglés de los benchmarks.
- La cuantización IQ2_XXS (4,19 BPW) introduce pérdida de precisión respecto a BF16; el autor no reporta la degradación exacta por suite entre cuantizaciones.
- El despliegue con 8 lanes en llama-server provoca deadlock por espera circular en el planificador; el límite práctico documentado es de 7 lanes, con eficiencia óptima en 6.
- El modelo tiene cero descargas y cero likes, sin validación de la comunidad; la reproducibilidad depende de la receta documentada por el autor.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de LFM3-1.7B conviene verificar las condiciones del modelo base.
- Las versiones v2 y v3 del ajuste DPO regresaron frente a v1; solo la v1 (r36-dpo-v1) es la recomendada por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/GEHIRNS/magi-1.3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper (DOI): https://doi.org/10.5281/zenodo.23630199

# GEHIRNS/magi-1.3-1.7B-preview

## Resumen

magi-1.3-1.7B-preview es un ajuste fino del modelo LiquidAI/LFM3-1.7B publicado por GEHIRNS bajo licencia Apache 2.0. Se trata de un checkpoint de previsualización de la línea magi-1.3, construido a partir del experimento EXP-0036 sobre LFM3-1.2, en el que se aplica un ciclo de SFT seguido de un primer lote de DPO (r36-dpo-v1) orientado a mejorar el razonamiento de sentido común. El modelo conserva la arquitectura híbrida del base: 24 capas con 13 capas convolucionales shortconv, 6 capas de atención completa y 5 capas de atención deslizante con ventana de 256, con un total real de 1.728.801.536 parámetros.

El modelo resuelve el problema de obtener capacidades de razonamiento mejoradas en un formato extremadamente compacto: se distribuye únicamente como cuantización GGUF IQ2_XXS de 871 MiB (4,19 bits por peso), lo que permite ejecutarlo en GPUs de consumo con un techo de memoria de 9 GB. La ventana de contexto nativa del base es de 262.144 tokens, aunque la configuración de uso recomendada en el Modelfile es de 8192 tokens con 4096 tokens de predicción.

Es relevante ahora porque demuestra un flujo de trabajo de ajuste fino con QLoRA y DPO sobre un modelo híbrido pequeño, con evaluación propia mediante la suite screen250 (12 suites, 250 tareas), y porque su rendimiento declarado (73,73 % de índice) supera a la línea LFM3-magi baseline y a tl-r3 dentro de la misma familia, con una huella de memoria muy reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (13 capas shortconv, 6 capas full attention, 5 capas sliding attention w256), 24 capas |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en el base; 8192 tokens en la configuración de uso recomendada |
| Tipos de cuantizacion | IQ2_XXS (única cuantización publicada); mezcla interna de tensores iq3_xxs, q8_0, q4_k e iq4_xs |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (871 MiB, 4,19 BPW) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer híbrido con 24 capas: 13 capas convolucionales shortconv, 6 capas de atención completa (capas 2, 6, 10, 14, 18 y 22) y 5 capas de atención deslizante con ventana de 256. La dimensión oculta es 2048, con 16 cabezas de atención y 4 cabezas KV, dimensión intermedia de 7680 y vocabulario de 128k tokens. La caché KV ocupa 113 MiB a 32K en q4_0 y 28 MiB a 8192 por slot.

El ajuste fino se realizó en dos fases. Primero, SFT sobre 1696 trazas correctas (r36-sft-v0) de un pool sesgado hacia sentido común (hellaswag 1400, winogrande 600, obqa 400, sciq 400, arc 400, mmlu 300, gsm8k 100; 88 % de sentido común), mediante QLoRA en nf4 con rango 16, alpha 32, 0,94 % de parámetros entrenables (16,4M) sobre las matrices w1/w2/w3/q/k/v/o/gate/in/out, learning rate 2e-5 y 212 pasos, con pérdida de 0,668 a 0,389. Después, DPO v1 sobre 607 pares (hellaswag 409, mmlu 88, obqa 78, gsm8k 48, sciq 27, arc 25) con elegidos extraídos de la misma suite, beta 0,1, NLL 1,0, learning rate 2e-5 y 76 pasos, con pérdida de 13 a 7, inicializado desde el adaptador SFT.

La cuantización se generó con `llama-quantize --pure` e imatrix propia (imatrix-lfm3-own.gguf, 3,5 MB, PPL 2,3983, calibración 4b de 22×8192) y un fichero de tipos por tensor de 167 líneas: 82 tensores iq3_xxs en FFN, 39 q8_0 en shortconv, 31 q4_k en full attention y 15 iq4_xs. El resultado pasa de 3,3 GB en BF16 (16 BPW) a 871 MiB (4,19 BPW).

## Capacidades

- Generación de texto conversacional y razonamiento de sentido común, con modo de pensamiento (think) activable.
- Razonamiento multi-paso con presupuesto de tokens de pensamiento (media de 1545 tokens en la suite de evaluación, con techo de 4096).
- Tool calling y function calling, evaluado en la suite screen250 (suite toolcall).
- Generación de código, con evaluaciones específicas en humaneval, lcb y mbpp.
- Razonamiento matemático y de sentido común (gsm8k, hellaswag, winogrande, obqa, sciq, arc, mmlu).
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).
- Compatible con endpoints y despliegue vía Ollama.

## Casos de uso

- Asistente conversacional en local con recursos limitados: el modelo cabe en 871 MiB de pesos y puede ejecutarse con 6 carriles paralelos dentro de un techo de 9 GB, lo que permite servir conversaciones multi-turno en una única GPU de consumo.
- Razonamiento de sentido común en tareas de clasificación y respuesta breve: el ajuste SFT y DPO está sesgado hacia hellaswag, winogrande, obqa y sciq, por lo que es adecuado para preguntas de conocimiento cotidiano y elección múltiple.
- Evaluación de pipelines de agentes con tool calling: la suite screen250 incluye pruebas de toolcall y el modelo soporta modo think, lo que permite integrarlo en flujos de razonamiento de varios pasos con presupuesto de tokens controlado.
- Generación de código asistida en entornos con poca VRAM: con presupuesto de pensamiento de 1024 tokens para código y 2048 para lcb, puede usarse en tareas de autocompletado y resolución de problemas de programación en una GPU de 8-12 GB.
- Prototipado e investigación de ajuste fino: el repositorio documenta la receta completa (train_lfm3_sft.py, train_lfm3_dpo.py, build_dpo_next.py) y el adaptador de 63M se mantiene para iteraciones posteriores, lo que facilita reproducir el ciclo SFT+DPO.
- Despliegue en entornos con restricciones de memoria estrictas: con 6 carriles compartiendo 2,2 GB y un rendimiento de 282,9 tok/s en evaluación, es viable para servicios de inferencia de bajo coste en hardware modesto.
- Evaluación comparativa de modelos pequeños: sirve como referencia dentro de la línea LFM3 para medir mejoras de DPO sobre el baseline (72,16 %) y sobre SFT (71,81 %).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Suite / metrica | magi-1.3-1.7B-preview | LFM3-magi baseline | SFT (r36-sft-v0) |
|---|---|---|---|
| screen250 indice | 73,73 % | 72,16 % | 71,81 % |
| ID | 2,288 | 2,189 | 2,167 |
| Delta vs baseline | +1,57 (W20 L16 SE2,4) | — | — |
| Delta vs SFT | +1,92 (W20 L15 SE2,37) | — | — |

Deltas por suite frente al baseline: arc -1, gsm8k +1, hellaswag +1, humaneval +2, lcb 0, mbpp +1, mmlu -1, obqa 0, sciq +2, toolcall 0, truthfulqa +3, winogrande -4. Frente a SFT: hellaswag +4, obqa +3, truthfulqa +1.

Comparación con 4B mix-M64x: 84,13 % de índice e ID 1,042, con delta de -10,4 (W10 L36); el autor indica que necesitaría un 79 % (-5,16) para mantener la categoría smaller-KEEP.

Rendimiento de inferencia declarado: evaluación 218,4 tok/s, prompt 12347 tok/s, global 65,5 tok/s, 53,4 s de pared por secuencia y 8,5 s efectivos con 7 carriles; con 6 carriles, 282,9 tok/s de evaluación, 99,0 tok/s global y 36,3 s (máxima eficiencia); en un solo carril, 325/648 tok/s.

## Requisitos de hardware

- VRAM estimada: 863 MiB para el modelo (700 MiB de pesos + 100 MiB de contexto + 63 MiB de cómputo) según fit.log; caché KV de 113 MiB a 32K en q4_0 y 28 MiB a 8192 por slot.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta ejecución con CUDA0 y un techo de 9 GB, compatible con GPUs de consumo de 8-12 GB.
- Cabe en GPU de consumo: sí, con 6 carriles compartiendo 2,2 GB y 7 carriles compartiendo 2,5-2,9 GB.
- Configuración óptima: 6 carriles con OLLAMA_NUM_PARALLEL=6; 8 carriles provocan bloqueo (0 tareas a 2698 MiB, 82 % de utilización), igual que 12 y 14 carriles.
- Opciones de despliegue: Ollama (documentado con Modelfile), llama.cpp (formato GGUF e imatrix); vLLM y TGI no están documentados.
- Latencia y throughput: 218,4 tok/s de evaluación y 65,5 tok/s global con 7 carriles; 282,9 tok/s de evaluación y 99,0 tok/s global con 6 carriles; 325/648 tok/s en un solo carril.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice screen250 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| magi-1.3-1.7B-preview | 1,73B | 262k (uso 8192) | 73,73 % | Apache 2.0 | GGUF IQ2_XXS en HF |
| LFM3-magi baseline | 1,73B | 262k | 72,16 % | Apache 2.0 | no disponible en la informacion |
| tl-r3 | no disponible | no disponible | 68,59 % | no disponible | no disponible |
| 4B mix-M64x | 4B (aproximado) | no disponible | 84,13 % | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de previsualización: solo se publica la cuantización IQ2_XXS; el BF16 de 3,3 GB y el adaptador de 63M se mantienen locales y se reservan para la versión completa.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`); la propia model card indica que el criterio strict-KEEP no se cumple (requiere 2SE).
- El ajuste está fuertemente sesgado hacia sentido común (88 % del pool SFT), lo que puede degradar el rendimiento en otras tareas; de hecho, winogrande cae 4 puntos y mmlu y arc pierden 1 punto frente al baseline.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de factualidad ni de calibración más allá de truthfulqa (+3 frente al baseline).
- Idiomas soportados no documentados; no hay evidencia de capacidades multilingües más allá del vocabulario de 128k del base.
- La cuantización IQ2_XXS de 4,19 BPW implica pérdida de precisión respecto a BF16; no se publican métricas de perplejidad del modelo final, solo la del imatrix (PPL 2,3983).
- El modo think consume una media de 1545 tokens por tarea, con 39 de 250 tareas alcanzando el techo de presupuesto, lo que afecta a la latencia y al coste en producción.
- Con 8 o más carriles paralelos en Ollama se produce bloqueo; la configuración de 6 carriles es un límite operativo documentado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de LiquidAI/LFM3-1.7B conviene verificar las condiciones del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/GEHIRNS/magi-1.3-1.7B-preview
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper (Zenodo DOI): https://doi.org/10.5281/zenodo.23630199
- Repositorio de experimentos citado en la model card: `experiments/EXP-0036-lfm3-1.2-finetune/` (no se proporciona URL directa)

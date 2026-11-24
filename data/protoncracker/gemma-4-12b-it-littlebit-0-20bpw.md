# protoncracker/gemma-4-12b-it-littlebit-0.20bpw

## Resumen

`protoncracker/gemma-4-12b-it-littlebit-0.20bpw` es un artefacto de investigación publicado en Hugging Face que contiene una compresión extrema del modelo `google/gemma-4-12B-it` mediante la técnica LittleBit-2 (factorización binaria por bloques) a 0,20 bits por peso. El autor, `protoncracker`, lo publica explícitamente como un experimento para inspeccionar el resultado de la metodología, no como un modelo utilizable. El propio autor advierte en la model card que "este modelo comprimido no produce texto utilizable".

El modelo base es Gemma 4 12B-it de Google, un transformer de 12.000 millones de parámetros en su variante instruction-tuned. La compresión reduce el repositorio a 1,9 GB (frente a los aproximadamente 24 GB del original en bf16), pero a costa de una degradación catastrófica de la calidad: la perplejidad en held-out pasa de 283,4 a 46.781,3 (ratio 165,1), y la concordancia top-1 con el token predicho por el original cae al 16,3%.

La relevancia de este artefacto es metodológica: documenta con rigor los límites prácticos de la cuantización binaria en modelos de 12B y demuestra que Gemma 4 12B-it es especialmente sensible al ruido de cuantización. Sirve como referencia negativa para investigadores que evalúan técnicas de compresión extrema, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Gemma 4 12B-it); pesos factorizados con LittleBit-2 (binario por bloques) |
| Parametros totales | 12.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 0,20 bits por peso (LittleBit-2); tablas de embedding empaquetadas en Q4_0 y Q6_K; el checkpoint denso resultante es bf16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo empaquetado) y GGUF (checkpoint denso convertido) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 12.000 millones de parámetros en su variante instruction-tuned (Gemma 4 12B-it). Sobre él se aplica LittleBit-2, un método experimental de factorización binaria por bloques que aproxima cada matriz de pesos mediante factores binarios escalados por bloque, alcanzando 0,20 bits por peso. No hay fine-tuning posterior: el autor indica explícitamente que el modelo base se comprime "tal como se publicó".

El proceso de publicación incluye la conversión del archivo empaquetado a un checkpoint denso (`code/lb_dense.py`), su exportación a GGUF y la evaluación con llama.cpp (build 44d5087 del 2026-11-22). Es importante subrayar que el GGUF denso no es más pequeño ni más rápido que el original: reconstruye matrices bf16 ordinarias, por lo que ocupa 23,83 GB y corre a la misma velocidad que el modelo sin comprimir. No existe, según el autor, ningún motor que ejecute directamente el archivo empaquetado de 0,84-1,10 GB.

El autor documenta además la sensibilidad del modelo base a la cuantización convencional: en llama.cpp, Q8_0 eleva la perplejidad de 281,28 a 292,66 (KL 0,188 nats/token, concordancia top-1 0,876) y Q4_K_M a 305,94 (KL 1,092, concordancia 0,647). Esto contextualiza por qué una factorización binaria a 0,20 bpw destruye la distribución de salida.

## Capacidades

- Generación de texto: no funcional. El autor declara que el modelo "no produce texto utilizable" y que su perplejidad es 165 veces la del original.
- Razonamiento y sentido común: a nivel de azar. HellaSwag 25,2% (azar 25%) y Winogrande 51,8% (azar 50%).
- Codigo, matematicas, tool calling, agentes, multilingue: no evaluados en la informacion disponible; dado el colapso medido en tareas básicas, no cabe esperar capacidad funcional en ninguna de ellas.
- Inspección de artefactos de compresión: la única utilidad práctica es permitir reproducir las mediciones de perplejidad, KL y concordancia top-1 publicadas por el autor.
- Trazabilidad por bloque: el repositorio incluye `blocks.jsonl` con el error relativo del estado oculto tras cada bloque (0,078 en el bloque 16, hasta 0,589 en el bloque 46), útil para estudiar la propagación del error en compresión binaria.

## Casos de uso

- Investigación sobre límites de cuantización binaria: reproducir las métricas de perplejidad, KL y concordancia top-1 para contrastar la técnica LittleBit-2 frente a cuantizaciones estándar (Q8_0, Q4_K_M) en un transformer de 12B.
- Análisis de propagación de error por capas: usar `blocks.jsonl` para estudiar cómo el error relativo del estado oculto crece de 0,331 tras el bloque 0 a 0,431 tras el bloque 47, con mínimos y máximos intermedios, y correlacionarlo con la pérdida de calidad final.
- Referencia negativa en papers de compresión: citar este artefacto como caso documentado de que una ratio de perplejidad de 165,1 respecto al original invalida el modelo según el propio criterio del autor (ratio >5 = no utilizable).
- Validación de pipelines de conversión: el flujo empaquetado → denso → GGUF → llama.cpp sirve para verificar herramientas de conversión y motores de inferencia con checkpoints reconstruidos.
- Estudio de sensibilidad del modelo base: comparar el impacto de Q8_0 y Q4_K_M sobre Gemma 4 12B-it (KL de 0,188 y 1,092 nats/token) con el de la factorización binaria (KL 6,83) para calibrar qué nivel de compresión tolera esta familia.
- Docencia sobre evaluación de modelos: ilustrar por qué la perplejidad aislada es una señal pobre (puede caer bajo ruido de cuantización) y por qué hay que leerla junto a KL y concordancia top-1.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (held-out: 32 filas x 1024 tokens; tareas con los scorers de llama.cpp, build 44d5087):

| Metrica | Comprimido | Original |
|---|---|---|
| Perdida next-token (held-out) | 10,7532 | 5,6469 |
| Perplejidad (held-out) | 46.781,3 | 283,4 |
| Concordancia top-1 con el original | 0,1632 | 1 |
| KL (original → comprimido), nats/token | 6,8342 | 0 |

| Benchmark | Este modelo (Q6_K denso) | Original bf16 | Original Q8_0 | Original Q4_K_M | Azar |
|---|---|---|---|---|---|
| HellaSwag acc_norm (400 tareas) | 25,2% (IC95% 21,2-29,7) | 51,2% | 53,2% | 50,0% | 25% |
| Winogrande (500 tareas) | 51,8% (+/- 2,2) | 57,0% | 54,6% | 56,6% | 50% |

Rendimiento en motor (A100 80 GB, llama.cpp, GGUF denso):

| Archivo | Tamano denso | Tamano empaquetado | Perplejidad | Prompt tok/s (pp512) | Generacion tok/s (tg128) |
|---|---|---|---|---|---|
| q4_0 | 23,83 GB | 0,84 GB | 43.158,9 | 6.002,90 | 55,74 |
| q6_k | 23,83 GB | 1,10 GB | 46.328,0 | 6.326,47 | 55,79 |
| Original bf16 (referencia) | 23,83 GB | — | 281,28 | 5.868,30 | 55,72 |

La velocidad es estadísticamente idéntica a la del original porque la ruta densa no está comprimida.

## Requisitos de hardware

- VRAM para el archivo empaquetado: 0,84-1,10 GB, pero no existe motor que lo ejecute directamente según el autor.
- VRAM para el GGUF denso: 23,83 GB de pesos; en la práctica requiere GPU de 40-80 GB para dejar margen de contexto y caché KV.
- GPU validadas: A100 80 GB (mediciones publicadas). No hay datos para H100, RTX 4090 u otras.
- GPU de consumo: el GGUF denso de 23,83 GB no cabe en GPUs de 24 GB con contexto funcional; la ruta empaquetada no es ejecutable.
- Despliegue: llama.cpp (build 44d5087 o posterior) sobre el GGUF denso; vLLM, TGI, Ollama y otros motores no están documentados en la información disponible.
- Throughput medido en A100 80 GB: 6.002-6.326 tok/s de prompt (pp512) y 55,7-55,8 tok/s de generación (tg128), equivalente al original bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso | Perplejidad held-out (original) | Concordancia top-1 | Licencia | Uso previsto |
|---|---|---|---|---|---|---|
| Este modelo (LittleBit-2) | 12B | 0,20 | 46.781,3 (283,4) | 0,163 | Apache 2.0 | Artefacto de investigación |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B | 0,55 | 1.911,4 (86,5) | no disponible | no disponible | Artefacto de investigación (también no utilizable) |
| Gemma 4 12B-it Q4_K_M (llama.cpp) | 12B | ~4 | 305,94 (281,28) | 0,647 | Apache 2.0 (base) | Producción con degradación leve |
| Gemma 4 12B-it Q8_0 (llama.cpp) | 12B | ~8 | 292,66 (281,28) | 0,876 | Apache 2.0 (base) | Producción casi sin pérdida |

La comparación interna de la serie LittleBit muestra que incluso a 0,55 bpw el modelo sigue sin ser utilizable, lo que sitúa el umbral práctico de esta técnica muy por encima de 1 bit por peso para Gemma 4 12B-it.

## Limitaciones y advertencias

- No es un modelo funcional: el autor declara explícitamente que no produce texto utilizable y que se publica solo para inspección.
- Perplejidad 165 veces la del original (46.781,3 frente a 283,4), muy por encima del umbral de "no utilizable" (ratio >5) fijado por el propio autor.
- Rendimiento a nivel de azar en HellaSwag (25,2%) y Winogrande (51,8%), con intervalos de confianza que solapan con el azar.
- Concordancia top-1 del 16,3% con el modelo original: la distribución de salida está gravemente alterada (KL 6,8342 nats/token).
- El archivo empaquetado no tiene motor de inferencia que lo ejecute; la única ruta es reconstruir un checkpoint denso de 23,83 GB, sin ahorro de tamaño ni de velocidad.
- Riesgo de alucinación: irrelevante en la práctica porque la salida no es coherente; no debe desplegarse en ningún flujo de producción.
- Licencia Apache 2.0 declarada por el autor; conviene verificar la compatibilidad con los términos del modelo base de Google antes de cualquier uso derivado.
- No hay información sobre sesgos, idiomas soportados ni longitud de contexto en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-littlebit-0.20bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo de la misma serie con menor perplejidad: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- llama.cpp (build 44d5087, 2026-11-22): https://github.com/ggml-org/llama.cpp

# protoncracker/gemma-4-31b-fable5-littlebit-0.10bpw

## Resumen

Este repositorio no contiene un modelo utilizable, sino un artefacto de investigación que documenta un resultado negativo medido. El autor, protoncracker, ha comprimido las 60 capas del decodificador de TeichAI/Gemma-4-31B-Fable-5-Agent-Distill (29.300 millones de pesos) a 0,10 bits por peso mediante una factorización binaria al estilo LittleBit-2, y ha publicado las métricas que demuestran que el modelo resultante no genera texto coherente. La perplejidad en texto reservado se dispara de 28,4 a 7.819, y la coincidencia con el token más probable del modelo original cae al 20,7%.

El interés técnico está en la curva de error por bloque: la destilación bloque a bloque mantiene el error cerca de 0,085 hasta el bloque 19, pero a partir de ahí se acumula de forma imparable hasta 0,454 en el último bloque. El autor concluye que incluso a 0,55 bits por peso una capa queda entre el redondeo a 2 y 3 bits, por lo que el presupuesto de bits compra muy poca reducción de error y este se amplifica a lo largo de 60 capas. Es, por tanto, una referencia valiosa para quien investigue cuantización extrema, no una base para despliegue.

El modelo base es un fine-tune de Gemma 4 de 31B orientado a agentes, con 60 bloques y atención con capas deslizantes y globales. La compresión se realizó en una sola A100 de 80 GB en 2,6 horas, y los pesos comprimidos ocupan 369 MB frente a unos 59 GB en bf16, más 2,8 GB de la tabla de embeddings compartida sin tocar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4) con capas de atención deslizante y globales; pesos del decodificador factorizados en dos caminos binarios (primario y residual) con escalas float16 |
| Parametros totales | 29.300 millones de pesos en el decodificador (modelo base de 31B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 0,10 bits por peso en el decodificador (formato `littlebit-packed-v1`); tabla de embeddings en Q4_0 o Q6_K; no hay GGUF estándar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con formato propietario `littlebit-packed-v1` (matrices de signo empaquetadas en bits, uint8, y escalas float16) |

## Arquitectura y entrenamiento

Cada capa lineal W se sustituye por dos caminos binarios, cada uno de la forma `diag(h) sign(U) diag(l) sign(V)^T diag(g)`, con `sign` en {-1, +1} y escalas en float16. El rango de cada factorización se deriva del presupuesto de bits mediante la fórmula `r = round((bpw*d_out*d_in - 2*16*(d_out+d_in)) / (2*(d_out+d_in+16)))`, lo que da rangos de 199 para las matrices MLP, 146 para q/o de capas deslizantes, 100 para k/v, y 186 y 58 para q/o y k de capas globales. La inicialización usa Dual-SVID con rotación Joint-ITQ de 50 iteraciones calculada por matriz.

La recuperación se hizo con destilación bloque a bloque: dos flujos de filas de calibración atraviesan la red (el original y el comprimido) y cada bloque comprimido se entrena con AdamW (lr 1e-3, coseno, 8 épocas sobre 1.024 filas de 1.024 tokens, es decir, 8,4 millones de pasadas de token por bloque y 503 millones en total) para que su salida en el flujo comprimido coincida con la del bloque original en el flujo original. Los datos de calibración son WikiText-2 más preguntas y respuestas de código con formato de chat. El entrenamiento completo de los 60 bloques consumió 2,6 horas en una A100 de 80 GB.

## Capacidades

- El modelo comprimido no produce texto utilizable: la perplejidad en texto reservado es de 7.819 frente a 28,4 del original.
- La precisión top-1 del siguiente token es del 14,0% y la coincidencia con el token más probable del original es del 20,7%.
- La divergencia KL del original al comprimido es de 6,49 nats por token.
- Las muestras generadas son cadenas degeneradas como `-- la-s.------------------`, incluso ante preguntas triviales como la capital de Francia.
- No se ha validado ninguna capacidad del modelo base (tool calling, razonamiento multi-paso, código, matemáticas, multilingüismo) tras la compresión.
- El artefacto sirve únicamente para inspeccionar la curva de error y reproducir el análisis, no para inferencia práctica.

## Casos de uso

- Investigación sobre cuantización extrema: el repositorio permite reproducir la curva de error por bloque (`per_block_error.csv`) y contrastar la viabilidad de la factorización binaria LittleBit-2 a 0,10 bits por peso.
- Estudio de acumulación de error en redes profundas: los datos de error antes y después del entrenamiento de cada bloque permiten analizar cómo se propaga el error a lo largo de 60 capas y dónde empieza a divergir (bloque 20).
- Comparación de estrategias de recuperación: el `per_block_error.csv` incluye la ejecución a 3 épocas frente a la de 8, lo que permite medir el retorno marginal del entrenamiento adicional por bloque.
- Referencia para calibrar expectativas de compresión: el sondeo de un solo bloque en el bloque 24 (0,090 a 0,10 BPW, 0,072 a 0,55 BPW, y 0,022/0,053/0,149 para redondeo a 4/3/2 bits) sirve como cota para decidir qué presupuesto de bits merece la pena explorar.
- Docencia y divulgación: las muestras degeneradas y las métricas de perplejidad son un ejemplo concreto de por qué la compresión por debajo de cierto umbral destruye la funcionalidad del modelo.
- Auditoría de métodos de cuantización: el desglose de rangos por tipo de matriz y la fórmula del presupuesto de bits permiten replicar el cálculo en otros modelos con arquitecturas de atención similares.

## Benchmarks y rendimiento

| Metrica (texto reservado, 32 filas x 1.024 tokens) | Original 31B | 0,10 BPW |
|---|---|---|
| Perplejidad | 28,4 | 7.819 |
| Pérdida (nats por token) | 3,35 | 8,96 |
| Precisión top-1 del siguiente token | no disponible | 14,0% |
| Coincidencia top-1 con el original | 100% | 20,7% |
| KL (original a comprimido), nats por token | 0 | 6,49 |

Error por bloque tras entrenamiento: 0,069-0,153 en los diez primeros bloques, 0,196 en el bloque 29, 0,373 en el 39, 0,394 en el 49 y 0,454 en el último. Entrenar 8 épocas en lugar de 3 redujo los bloques tempranos un 12-17% pero no detuvo la subida (0,196 frente a 0,202 en el bloque 29). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 2,7 GB; los 60 bloques comprimidos suman 369 MB y la tabla de embeddings compartida 2,8 GB en bf16.
- El entrenamiento de compresión se realizó en una única A100 de 80 GB durante 2,6 horas.
- Para cargar y desempaquetar los pesos se necesitan las utilidades del directorio `code/` (`lb_pack.py`, `lb_quant.py`, `littlebit.py`); no hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- La inferencia requiere implementar el formato `littlebit-packed-v1` (desempaquetado de matrices de signo uint8 y escalas float16) en el runtime del modelo base.
- No se dispone de datos de latencia ni de throughput; dado que el modelo no genera texto utilizable, no tiene sentido medirlos en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (texto reservado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Gemma 4 31B a 0,10 BPW) | 29,3B en decodificador | no disponible | 7.819 | Apache 2.0 | Hugging Face, formato propietario |
| TeichAI/Gemma-4-31B-Fable-5-Agent-Distill (original) | 31B | no disponible | 28,4 | no disponible en la información | Hugging Face |
| Redondeo a 4 bits (sondeo de un bloque) | 31B | no disponible | no disponible (error por bloque 0,022) | no disponible | no disponible |
| Redondeo a 2 bits (sondeo de un bloque) | 31B | no disponible | no disponible (error por bloque 0,149) | no disponible | no disponible |

La comparación relevante es contra el propio modelo original y contra las alternativas de redondeo simple evaluadas en el sondeo del bloque 24: la factorización binaria a 0,10 BPW queda peor que el redondeo a 2 bits en error por bloque. No se dispone de comparación con métodos de cuantización de referencia (GPTQ, AWQ, GGUF Q4_K_M) en la información proporcionada.

## Limitaciones y advertencias

- El modelo comprimido no produce texto utilizable; no debe desplegarse en ningún caso de producción.
- El resultado es de una sola semilla, un solo modelo y un único conjunto de calibración, y las filas reservadas provienen de la misma mezcla que las de calibración, por lo que la perplejidad no es comparable con benchmarks estándar.
- La recuperación es solo bloque a bloque; los artículos de LittleBit usan destilación consciente de cuantización de extremo a extremo con muchos más tokens, así que esto no reproduce sus cifras a 0,1 BPW.
- Las cinco generaciones son codiciosas y sin caché de clave-valor; el modelo original también entra en bucle con la indicación en texto plano.
- La tabla de embeddings compartida se mantiene en bf16 y se cuantiza aparte a Q4_0 (añade 8,7% de error) o Q6_K (1,9%), lo que introduce una fuente adicional de degradación.
- El formato `littlebit-packed-v1` es propietario y no está soportado por los runtimes habituales, lo que limita su uso a quien implemente el desempaquetado a medida.
- No hay información sobre sesgos, alucinación o cobertura idiomática del modelo base tras la compresión; a la licencia Apache 2.0 del artefacto se le aplican las condiciones del modelo base y del dataset de destilación, detalladas en el archivo NOTICE del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/protoncracker/gemma-4-31b-fable5-littlebit-0.10bpw
- Modelo base: https://huggingface.co/TeichAI/Gemma-4-31B-Fable-5-Agent-Distill

# fraQtl/LFM2-1.2B-Hi-Fi-GGUF

## Resumen

LFM2-1.2B Hi-Fi GGUF es una coleccion de cuantizaciones de 4 bits del modelo LiquidAI/LFM2-1.2B, publicada por el usuario fraQtl. No se trata de un modelo nuevo, sino de un trabajo de compresion calibrada orientado a despliegue en dispositivos edge y NPU. El modelo base, desarrollado por Liquid AI, es un transformer de 1.170.340.608 parametros (aproximadamente 1,2 mil millones) con arquitectura Lfm2ForCausalLM y capacidades conversacionales y de tool calling.

La aportacion principal del repositorio es un pipeline de cuantizacion que combina calibracion task-aware (TAC), redondeo con compensacion de error GPTQ, reasignacion selectiva de tensores a Q8_0 y un entrenamiento corto de recuperacion contra el modelo bf16. El resultado es `npu/iq4_nl_stack.gguf`, un fichero de 730.879.936 bytes que, segun el autor, se situa un 43,4 % mas cerca del modelo bf16 que el Q4_K_M oficial de LiquidAI en texto de instrucciones y tool calling, y un 22,7 % mas cerca en conocimiento y razonamiento, ocupando 13.312 bytes menos.

Es relevante ahora porque el despliegue de LLMs en NPU y hardware de consumo exige formatos de bloque pequeno (block-32: IQ4_NL, Q4_0, Q8_0) compatibles con llama.cpp y con los limites de tamano de grafo en dispositivo (2 GiB por grafo en Snapdragon). El repositorio documenta de forma inusualmente detallada las mediciones de fidelidad, los resultados de benchmarks y los recibos de reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Lfm2ForCausalLM, modelo base LiquidAI/LFM2-1.2B) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (block-32), Q4_0 (block-32), Q8_0 (block-32, selectivo), Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 1,2 mil millones de parametros identificado en llama.cpp como `Lfm2ForCausalLM`, con tokenizer y arquitectura sin modificar respecto al original de LiquidAI (revision `40f3da0d`). El repositorio no documenta la composicion del dataset de preentrenamiento ni si el modelo base uso RLHF o DPO; esa informacion corresponde a la model card de LiquidAI/LFM2-1.2B, no incluida aqui.

La innovacion tecnica esta en el proceso de cuantizacion, documentado paso a paso con su impacto medido en KL respecto a bf16. Sobre formato IQ4_NL block-32, se aplica calibracion task-aware (TAC) que genera una importance matrix (−4,3 % en task KL, −1,7 % en guard KL); despues, redondeo con compensacion de error GPTQ con muestreo de Hessian propio (−26,8 % / −15,7 %); a continuacion, elevacion de unas pocas decenas de tensores a Q8_0 hasta igualar el tamano del Q4_K_M de LiquidAI (−5,5 % / −4,6 %); y finalmente un entrenamiento corto de recuperacion contra el modelo bf16 escrito de vuelta en los mismos bytes (−3,3 % / −4,2 %). El total frente a `iq4_nl_cal` es −36,1 % en task KL y −24,2 % en guard KL. El autor senala que sin TAC el redondeo solo aporta −30,0 %, y que una vez aplicado el redondeo TAC anade 0,0 %.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo base LFM2-1.2B.
- Tool calling y function calling, evaluado mediante IFEval estricto en el repositorio.
- Razonamiento aritmetico basico, evaluado mediante GSM8K.
- Conocimiento y razonamiento general, medido con un conjunto guard de 64 documentos.
- Despliegue en NPU: los ficheros de octubre compilan y ejecutan en Snapdragon 8 Elite Gen 6 como build QNN en dos partes, cada una por debajo del limite de 2 GiB por grafo en dispositivo.
- Compatibilidad con llama.cpp a partir de la build b11514.
- No se documentan capacidades de vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Inferencia en dispositivo movil con NPU: el formato block-32 (IQ4_NL, Q4_0) y el troceado en dos grafos QNN permiten ejecutar el modelo en Snapdragon 8 Elite Gen 6, con cada parte por debajo del limite de 2 GiB del grafo en dispositivo. Adecuado para asistentes locales sin conexion.
- Asistentes conversacionales embebidos: el modelo base es conversacional y el fichero recomendado conserva mejor la fidelidad en texto de instrucciones y tool calling, lo que reduce derivas en dialogos multi-turno respecto a cuantizaciones menos calibradas.
- Pipelines de agentes con llamadas a herramientas: el soporte de tool calling y la mejora medida en el conjunto task (80 documentos de instrucciones y tool calling) lo hacen apto para orquestacion ligera en el borde.
- Prototipado y evaluacion de cuantizaciones: el repositorio incluye recibos, hashes de profesor, JSON de divergencia y puntuaciones selladas de GSM8K, lo que permite reproducir y auditar el proceso de compresion.
- Despliegue con llama.cpp en equipos de consumo: el fichero de 730 MB cabe en VRAM modesta y se ejecuta con `llama-cli`, lo que facilita pruebas locales y CI.
- Educacion e investigacion sobre cuantizacion: la comparativa paso a paso (TAC, GPTQ, asignacion, recuperacion) sirve como caso de estudio reproducible de calibracion de 4 bits.
- Sustitucion de cuantizaciones oficiales en entornos con restricciones de bytes: `iq4_nl_stack.gguf` ocupa 13.312 bytes menos que el Q4_K_M de LiquidAI con mejor KL en ambos conjuntos, lo que puede interesar en despliegues con presupuesto de almacenamiento ajustado.

## Benchmarks y rendimiento

Fidelidad a bf16 (KL a vocabulario completo, menor es mejor; task = instrucciones y tool calling, 80 documentos; guard = conocimiento y razonamiento, 64 documentos; bootstrap pareado con 2.000 remuestreos):

| Fichero | Bytes | Task KL | Guard KL | vs Q4_K_M LiquidAI (task / guard) |
|---|---|---|---|---|
| LiquidAI Q4_K_M | 730.893.248 | 0,0992 | 0,0570 | referencia |
| LiquidAI Q4_0 | 695.749.568 | 0,1560 | 0,0970 | +57,2 % / +70,2 % |
| `npu/iq4_nl_cal.gguf` | 695.752.672 | 0,0879 | 0,0581 | −11,4 % / +1,9 % |
| `npu/iq4_nl_stack.gguf` (seed 02) | 730.879.936 | 0,0562 | 0,0441 | −43,4 % [−45,6, −41,0] / −22,7 % [−27,8, −17,3] |
| misma receta, seed 01 (no publicado) | 730.879.936 | 0,0591 | 0,0443 | −40,4 % / −22,3 % |

Respuestas correctas (250 preguntas por test, decodificacion greedy, dos ejecuciones, H100):

| Fichero | GSM8K ejec. 1 | GSM8K ejec. 2 | IFEval estricto ejec. 1 | IFEval estricto ejec. 2 |
|---|---|---|---|---|
| LiquidAI Q4_K_M | 145 | 156 | 160 | 163 |
| `npu/iq4_nl_stack.gguf` (seed 02) | 129 (p = 0,08) | 134 (p = 0,012) | 152 (p = 0,22) | 148 (p = 0,020) |
| misma receta, seed 01 | 134 (p = 0,26) | no disponible | 153 (p = 0,28) | no disponible |

El autor advierte que su fichero responde correctamente a menos preguntas que el Q4_K_M de LiquidAI en ambos tests, y que en la ejecucion 2 ambas diferencias alcanzan p < 0,05. En la ejecucion 1 omite con mas frecuencia la linea final `####` en GSM8K (63 frente a 36 de 250); con lectura laxa del ultimo numero, la brecha en GSM8K de la ejecucion 1 es de −4.

Medicion anterior (ficheros del 23 de octubre), divergencia simetrica de soporte restringido frente a un profesor Q8_0 (top-20 logits), 43.200 posiciones reservadas:

| Fichero | Bytes | Divergencia | Top-1 | SQNR (dB) |
|---|---|---|---|---|
| LiquidAI Q4_0 | 695.749.568 | 0,162709 | 78,22 % | 10,88 |
| q4_0_plain | 695.752.416 | 0,16271 | 78,22 % | 10,88 |
| q4_0_cal | 697.849.824 | 0,14163 | 79,59 % | 11,49 |
| iq4_nl_cal | 695.752.672 | 0,10837 | 82,17 % | 12,65 |
| fraqtl_q4km | 730.896.096 | 0,11104 | no disponible | no disponible |
| LiquidAI Q4_K_M | 730.893.248 | 0,11042 | no disponible | no disponible |

GSM8K con n = 100, sellado antes de puntuar: fraqtl_q4km 59 %, LiquidAI Q4_0 58 %, LiquidAI Q4_K_M 59 %.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-0,8 GB para los ficheros de 4 bits (695-731 MB de pesos) mas overhead de contexto y KV cache; el fichero recomendado ocupa 730.879.936 bytes.
- GPU recomendadas: H100 para las mediciones del autor; cualquier GPU con al menos 1-2 GB de VRAM libre puede ejecutar los ficheros de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 2 GB o mas de VRAM; tambien en CPU y en NPU Snapdragon 8 Elite Gen 6 mediante build QNN en dos partes.
- Opciones de despliegue: llama.cpp (build b11514 o superior, con `Lfm2ForCausalLM`); el autor no documenta soporte de vLLM, TGI, Ollama ni otros runners en la informacion disponible.
- Latencia y throughput: no disponibles. Las mediciones se realizaron con decodificacion greedy por lotes en H100, que no es bit-determinista, por lo que las dos ejecuciones difieren.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2-1.2B Hi-Fi GGUF (`iq4_nl_stack`) | 1.170.340.608 | no disponible | GGUF IQ4_NL + Q8_0 selectivo, 730.879.936 bytes | LFM Open License v1.0 | Mejor KL que el Q4_K_M oficial; peor exactitud en GSM8K e IFEval en las ejecuciones medidas |
| LiquidAI/LFM2-1.2B Q4_K_M | 1.170.340.608 | no disponible | GGUF Q4_K_M, 730.893.248 bytes | LFM Open License v1.0 | Referencia oficial de LiquidAI; mejor exactitud en GSM8K e IFEval en las ejecuciones medidas |
| LiquidAI/LFM2-1.2B Q4_0 | 1.170.340.608 | no disponible | GGUF Q4_0, 695.749.568 bytes | LFM Open License v1.0 | Peor fidelidad KL y peor top-1 que las variantes calibradas |
| `npu/iq4_nl_cal.gguf` (fraQtl) | 1.170.340.608 | no disponible | GGUF IQ4_NL calibrado, 695.752.672 bytes | LFM Open License v1.0 | Fichero calibrado mas pequeno; superado por `iq4_nl_stack` en KL |

No se dispone de datos de comparacion con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Exactitud inferior al Q4_K_M oficial en los tests de respuestas: en la ejecucion 2 de GSM8K (134 frente a 156) e IFEval estricto (148 frente a 163) las diferencias alcanzan p < 0,05. La mejora en KL no se traduce en mejor exactitud en estos benchmarks.
- Mayor tasa de omision de la linea final `####` en GSM8K en la ejecucion 1 (63 de 250 frente a 36), lo que afecta al parseo automatico de respuestas.
- La decodificacion greedy por lotes no es bit-deterministica: las dos ejecuciones del mismo fichero difieren, por lo que la reproducibilidad exacta de las puntuaciones no esta garantizada.
- `npu/iq4_nl_stack.gguf` no se ha ejecutado aun en dispositivo; solo los ficheros del 23 de octubre se probaron en Snapdragon 8 Elite Gen 6.
- Las mediciones de `iq4_nl_stack.gguf` las conserva fraQtl y se facilitan bajo peticion; no estan incluidas como artefactos en el repositorio.
- La calibracion de `iq4_nl_cal` no conserva la imatrix; el fichero y sus puntuaciones quedan fijados por sha, y una reconstruccion propia puntua dentro del 0,2 %.
- Licencia LFM Open License v1.0: el uso comercial esta sujeto a sus terminos, incluido un umbral de ingresos. Es necesario revisar el texto completo antes de uso en produccion.
- No se documentan sesgos conocidos, cobertura idiomatica ni longitud de contexto en la informacion disponible; deben consultarse en la model card de LiquidAI/LFM2-1.2B.
- Riesgo de alucinacion inherente a un modelo de 1,2 mil millones de parametros; no se han publicado evaluaciones de factualidad en este repositorio.
- El repositorio registra 0 likes y 1280 descargas; no hay validacion independiente de las mediciones del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/LFM2-1.2B-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2-1.2B/blob/main/LICENSE
- Revision del modelo base citada: `40f3da0d`
- Imagen del repositorio: https://huggingface.co/fraQtl/LFM2-1.2B-Hi-Fi-GGUF/resolve/main/LFM2-1.2B-Hi-Fi-GGUF.png
- sha256 de `npu/iq4_nl_stack.gguf`: `1aa92dc60a916e1267c8b81dc2a8866a0572d2e14b54ef4fbdd682eb337b79d4`
- Referencia GPTQ: Frantar et al., 2022 (citada en la model card; no se proporciona URL)

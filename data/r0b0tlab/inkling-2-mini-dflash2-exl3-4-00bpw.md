# r0b0tlab/Inkling-2-Mini-DFlash2-EXL3-4.00bpw

## Resumen

Inkling-2-Mini-DFlash2-EXL3-4.00bpw es una cuantización de 4 bits del modelo borrador (draft model) `incoai/Inkling-2-Mini-DFlash2`, desarrollado por Inco AI como componente de decodificación especulativa para el modelo objetivo `thinkingmachines/Inkling-2-Mini`. No es un modelo de lenguaje autónomo: genera borradores de tokens a partir de los estados ocultos del modelo objetivo, que después los verifica. Bajo verificación exacta, el borrador solo altera cuántos tokens se confirman por paso de verificación, nunca cuáles.

La versión aquí descrita la publica el proyecto REXL3 (usuario `r0b0tlab`) y aplica su cuantizador propietario EXL3 con 4,0 bits por peso sobre las 36 capas lineales del original, sin recalibración ni reentrenamiento. El resultado ocupa 423 MB frente a los 990 MB del original en bf16, manteniendo las normas en bf16 y convirtiendo a fp16 los tensores de convolución dinámica y el selector de candidatos.

Su relevancia es práctica: demuestra que un borrador de difusión por bloques puede comprimirse a 4 bits sin degradar la tasa de aceptación y con una mejora de velocidad de hasta 1,57x frente a la decodificación serie en una DGX Spark. Es un artefacto muy especializado, pensado exclusivamente para servirse con el motor REXL3, y no es compatible con SGLang ni con transformers de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con difusión por bloques (DFlash 2), modelo borrador para decodificación especulativa sobre Inkling-2-Mini |
| Parametros totales | 211.672.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como propiedad del borrador; se sirve con ventana de 262.144 tokens en el ejemplo del autor |
| Tipos de cuantizacion | EXL3 4,0 bits por peso (trellis `mul1`); normas en bf16; tensores de convolución dinámica y selector en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con grupos EXL3 (`.trellis`, `.suh`, `.svh`, `.mul1`), cargable solo por el loader de borradores DFlash2 de REXL3 |

## Arquitectura y entrenamiento

El modelo original es un borrador de difusión por bloques (block diffusion) de la familia DFlash 2, diseñado para proponer varios tokens en paralelo a partir de los estados ocultos del modelo objetivo. Consta de 5 capas con proyecciones q/k/v/o y gate/up/down más una capa `fc`, lo que suma 36 capas lineales, además de un selector de candidatos con dos libros de códigos de 201.024 x 256 valores. El borrador se entrenó contra la versión base de Inkling-2-Mini, no contra el fine-tune Derisked que se usó como objetivo en las mediciones.

Esta variante no introduce ningún entrenamiento nuevo: REXL3 recodifica las 36 capas lineales con su cuantizador EXL3 (libro de códigos trellis `mul1`, 4,0 bits por peso) usando una Hessiana de entrada identidad, es decir, sin calibración. Las normas permanecen en bf16 y 23 tensores del selector de candidatos y de la convolución dinámica se convierten a fp16; de los aproximadamente 116,9 millones de valores afectados, 38 eran subnormales en bf16 y pasaron a cero. Los dos libros de códigos del selector se renombran a `candidate_selector.{predecessor,successor}_codebook.weight`. El error relativo de Frobenius por capa lineal se sitúa entre 0,0667 y 0,0672 (23,45 a 23,52 dB de SQNR), y sobre entradas sintéticas de cola pesada el error de salida es de 0,066 a 0,068.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: propone hasta 7 posiciones por ronda de verificación, que el modelo objetivo acepta o rechaza.
- Decodificación paralela por bloques mediante difusión, en lugar de la generación autorregresiva token a token del borrador.
- Verificación exacta: con decodificación greedy, las respuestas son idénticas byte a byte (MD5 de texto) entre la ejecución serie y las ejecuciones con borrador.
- Aceptación media de 1,77 a 2,45 borradores por ronda de verificación según la longitud del prompt, lo que equivale a 2,77 a 3,45 tokens confirmados por ronda.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento propio: es un componente interno de inferencia, no un modelo conversacional.
- Capacidades multilingües: no disponibles como propiedad del borrador; hereda el comportamiento del objetivo en la medida en que sus estados ocultos lo reflejen.

## Casos de uso

- Aceleración de inferencia de Inkling-2-Mini en producción: desplegar este borrador junto al modelo objetivo con `rexl3-serve --draft` para reducir el tiempo por token en decodificación greedy. La ganancia medida va de 1,27x a 1,57x según la longitud del prompt.
- Servicio de resúmenes sobre documentos largos: con prompts de 8.025 y 32.025 tokens se obtuvieron 53,92 y 52,93 tok/s frente a 42,30 y 35,99 tok/s en serie, un escenario típico de resumen de actas, informes o artículos.
- Despliegue en hardware con memoria limitada: el pack de 423 MB frente a los 990 MB del bf16 permite alojar el borrador en una DGX Spark o en una GPU consumer con holgura, reservando el grueso de la VRAM para el modelo objetivo cuantizado.
- Reducción de coste por token en cargas por lotes: al confirmar entre 2,77 y 3,45 tokens por ronda de verificación, se reducen las pasadas del modelo objetivo, que es el componente caro del pipeline.
- Evaluación comparativa de cuantizaciones para decodificación especulativa: sirve como referencia reproducible para medir si una compresión a 4 bits degrada la tasa de aceptación; en este caso, la aceptación por posición es equivalente a la del bf16 dentro del ruido de las ejecuciones.
- Integración en pipelines de generación determinista: al producir salidas idénticas byte a byte con decodificación greedy, es apto para sistemas que exigen reproducibilidad estricta (auditoría de respuestas, tests de regresión de calidad).

## Benchmarks y rendimiento

Mediciones del autor con REXL3 el 2026-11-24 en una NVIDIA GB10 (DGX Spark), un slot, ventana de 262.144 tokens, caché de prefijo desactivada, temperatura 0, 256 tokens nuevos como máximo, una ejecución por celda. El objetivo fue una cuantización EXL3 propia de `Blackfrost-AI/Inkling-2-Mini-Derisked` (rc-v2, no publicada) ejecutada con `--allow-unvalidated-pack`.

| Tokens de prompt | Serie (tok/s) | Borrador bf16 (tok/s) | Borrador 4,0 bpw (tok/s) | Aceleración vs serie |
|---|---|---|---|---|
| 36 | 44,61 | 56,62 | 59,72 | 1,34x |
| 2.425 | 43,63 | 61,89 | 68,60 | 1,57x |
| 8.025 | 42,30 | 47,54 | 53,92 | 1,27x |
| 32.025 | 35,99 | no ejecutado | 52,93 | 1,47x |

| Tokens de prompt | Borradores aceptados por ronda, bf16 | Borradores aceptados por ronda, 4,0 bpw |
|---|---|---|
| 36 | 1,93 (168/87) | 1,77 (163/92) |
| 2.425 | 2,40 (180/75) | 2,45 (181/74) |
| 8.025 | 1,73 (156/90) | 1,80 (158/88) |
| 32.025 | no ejecutado | 1,93 (168/87) |

| Posición del borrador | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| bf16 | 190/252 (0,75) | 128/190 (0,67) | 84/128 (0,66) | 46/71 (0,65) | 27/41 (0,66) | 22/26 (0,85) | 7/7 |
| 4,0 bpw | 191/254 (0,75) | 135/191 (0,71) | 87/135 (0,64) | 40/59 (0,68) | 24/34 (0,71) | 18/23 (0,78) | 7/7 |

La latencia de una ronda de borrador medida en el arranque fue de 3,0 ms con el pack de 4,0 bpw frente a 5,3 ms en bf16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a un modelo borrador.

## Requisitos de hardware

- VRAM para el borrador: 423 MB en el pack EXL3 de 4,0 bpw, frente a 990 MB del original en bf16. La mayor parte del resto corresponde a los dos libros de códigos del selector de 201.024 x 256.
- VRAM total: dominada por el modelo objetivo Inkling-2-Mini cuantizado, no por el borrador. No se dispone de cifras del objetivo en la información proporcionada.
- GPU validadas: una NVIDIA GB10 (DGX Spark) en las mediciones del autor. No hay datos publicados para A100, H100 ni RTX 4090.
- GPU consumer: por tamaño del borrador cabe en cualquier GPU con más de 1 GB libre, pero el requisito real lo marca el modelo objetivo.
- Motor de despliegue: exclusivamente REXL3, mediante `rexl3-serve --model <pack EXL3 de Inkling-2-Mini> --draft <esta carpeta> --spec auto --max-model-len 262144`. No carga en SGLang ni en transformers de referencia.
- Estado del soporte: la integración de Inkling-2-Mini con este borrador está en la rama de desarrollo de REXL3 y no en una versión publicada.
- Throughput medido: 52,93 a 68,60 tok/s con borrador frente a 35,99 a 44,61 tok/s en serie, según la longitud del prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Inkling-2-Mini-DFlash2-EXL3-4.00bpw | 211,7 M | no disponible | Apache 2.0 | safetensors EXL3 | 1,27x a 1,57x vs serie; 3,0 ms por ronda de borrador |
| incoai/Inkling-2-Mini-DFlash2 (bf16) | 211,7 M | no disponible | Apache 2.0 | safetensors bf16 | 1,27x a 1,42x vs serie; 5,3 ms por ronda de borrador; 990 MB |
| Borrador DSpark/MTP propio del pack objetivo | no disponible | no disponible | no disponible | no disponible | sustituido por `--draft`; sin cifras publicadas |
| Borradores DFlash2 de Qwen3.8-Flash-Next y GLM-5.3-Flash (packs REXL3 4,00 bpw) | no disponible | no disponible | no disponible | safetensors EXL3 | misma receta de cuantización; sin cifras publicadas en la información disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: sin el modelo objetivo y el motor REXL3 no produce texto utilizable.
- Incompatible con SGLang y con transformers de referencia; solo carga con el loader de borradores DFlash2 de REXL3.
- El soporte de Inkling-2-Mini con este borrador está en la rama de desarrollo de REXL3, no en una versión publicada; el despliegue en producción exige compilar desde esa rama.
- Las mediciones usan un objetivo no publicado (rc-v2 de Blackfrost-AI/Inkling-2-Mini-Derisked) con `--allow-unvalidated-pack`, y el borrador se entrenó contra la versión base, no contra ese fine-tune.
- No se han medido el objetivo base Inkling-2-Mini, la decodificación con muestreo (T > 0) ni respuestas más largas que 256 tokens; los datos son ejecuciones únicas de respuestas cortas y greedy, indicativas y no concluyentes.
- La cuantización es sin calibración (Hessiana identidad), con un error relativo de Frobenius de 0,0667 a 0,0672 por capa; 38 valores bf16 subnormales pasaron a cero al convertir a fp16.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un borrador verificado, no introduce tokens distintos de los que aceptaría el objetivo en modo exacto.
- Licencia Apache 2.0, que permite uso comercial, pero obliga a mantener el aviso de cambios (§4b) y a citar el trabajo original de Inco AI.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- [Hugging Face: r0b0tlab/Inkling-2-Mini-DFlash2-EXL3-4.00bpw](https://huggingface.co/r0b0tlab/Inkling-2-Mini-DFlash2-EXL3-4.00bpw)
- [Modelo base: incoai/Inkling-2-Mini-DFlash2](https://huggingface.co/incoai/Inkling-2-Mini-DFlash2)
- [Modelo objetivo: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Objetivo usado en las mediciones: Blackfrost-AI/Inkling-2-Mini-Derisked](https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked)
- [Blog de Inco AI: DFlash 2: Keep Drafting Parallel](https://inco.ai/blog/dflash2/)
- [Repositorio REXL3](https://github.com/REXL3/REXL3)
- [Paper: DFlash: Block Diffusion for Flash Speculative Decoding (ICML 2026)](https://inco.ai/blog/dflash2/)

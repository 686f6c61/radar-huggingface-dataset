# r0b0tlab/Inkling-2-Mini-DFlash2-EXL3-4.00bpw-SAGE-REXL3

## Resumen

Inkling-2-Mini-DFlash2-EXL3-4.00bpw-SAGE-REXL3 es una cuantización EXL3 a 4,0 bits por peso del modelo borrador (draft model) `incoai/Inkling-2-Mini-DFlash2`, publicado por el usuario `r0b0tlab` bajo el marco del proyecto REXL3. No es un modelo de lenguaje autónomo: es un drafter de decodificación especulativa por difusión de bloques (DFlash 2) concebido para acelerar la generación del modelo objetivo `thinkingmachines/Inkling-2-Mini`. El borrador propone tokens a partir de los estados ocultos del objetivo y este los verifica, de modo que, bajo verificación exacta, el draft solo altera cuántos tokens se confirman por paso, nunca cuáles.

El modelo cuenta con 211.672.576 parámetros (unos 211,7 M) y un repositorio de 0,4 GB, del cual la mayor parte corresponde a los dos codebooks del selector de candidatos (201.024 x 256 cada uno). La arquitectura subyacente se etiqueta como `qwen3` en los tags del repositorio, con 36 capas lineales re-codificadas a EXL3 mediante el cuantizador REXL3, normas en bf16 y tensores de convolución dinámica y selector en fp16.

Su relevancia es práctica: la model card reporta aceleraciones de entre 1,27x y 1,91x en decodificación sobre un único NVIDIA GB10 (DGX Spark) con el objetivo cuantizado de REXL3, manteniendo respuestas byte-idénticas respecto a la ejecución serie. La licencia es Apache 2.0, heredada del modelo original de Inco AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 con drafter de difusión de bloques DFlash 2; 36 capas lineales en EXL3 |
| Parametros totales | 211.672.576 (aprox. 211,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (ventana usada en las pruebas del servidor REXL3) |
| Tipos de cuantizacion | EXL3 4,0 bits por peso (codebook trellis mul1); normas en bf16; selector en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con grupos EXL3 (`.trellis`, `.suh`, `.svh`, `.mul1`) en el layout del cargador DFlash2 de REXL3 |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en difusión de bloques (DFlash 2, de Inco AI), diseñado para generar borradores de tokens a partir de los estados ocultos del modelo objetivo `thinkingmachines/Inkling-2-Mini`. No se trata de un transformer autoregresivo convencional: el borrador produce bloques de candidatos que el objetivo verifica después. La arquitectura base se etiqueta como `qwen3` en los tags del repositorio y consta de 36 capas lineales (proyección `fc` y proyecciones q/k/v/o/gate/up/down de 5 capas), además de un selector de candidatos con dos codebooks de 201.024 x 256.

El proceso de cuantización aplicado por REXL3 re-codifica las 36 capas lineales a EXL3 con codebook trellis mul1 a 4,0 bits por peso, sin calibración (Hessiano de entrada identidad). Las normas se mantienen en bf16; los tensores de convolución dinámica y el selector de candidatos (23 tensores) se convierten a fp16, con la pérdida de 38 valores bf16 subnormales de aproximadamente 116,9 M que pasan a 0. Los dos codebooks del selector se renombran a `candidate_selector.{predecessor,successor}_codebook.weight`. No se reentrenó nada: es una conversión puramente de formato y precisión.

Según la model card, el borrador se entrenó contra el modelo base Inkling-2-Mini, no contra el fine-tune Derisked con el que se midió el rendimiento. La información sobre datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no está disponible en la información proporcionada.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: propone bloques de candidatos que el modelo objetivo verifica.
- Verificación exacta: bajo verificación exacta, las respuestas son byte-idénticas a la ejecución serie (comprobado con MD5 del texto en decodificación greedy y muestreada).
- Decodificación muestreada (T > 0): el borrador usa el muestreador keyed del objetivo, manteniendo la equivalencia byte a byte con la ejecución serie para la misma semilla.
- Planificación por profundidad: el motor REXL3 decide cuántos borradores verificar en cada ronda según los costes medidos al arrancar.
- No es un modelo de chat, razonamiento, código ni matemáticas por sí mismo: no genera respuestas finales de forma autónoma.
- No soporta tool calling ni function calling de forma nativa (no es su función).
- No soporta agentes ni razonamiento multi-paso de forma autónoma.
- Capacidades multilingües: no disponible (dependen del modelo objetivo, no del drafter).

## Casos de uso

- Aceleración de inferencia en producción con REXL3: se usa como `--draft` en `rexl3-serve` para sustituir el sidecar DSpark/MTP del objetivo y aumentar el throughput de decodificación entre 1,27x y 1,91x según la longitud del prompt.
- Resumen de documentos largos: con prompts de 8K a 128K tokens, el borrador mantiene aceleraciones de 1,27x a 1,50x, adecuado para pipelines de summarización sobre textos extensos donde el objetivo Inkling-2-Mini procesa ventanas de hasta 262.144 tokens.
- Procesamiento de contextos cercanos al límite de ventana: en prompts de 261K tokens se observaron aceleraciones de 1,68x y 1,91x, útil en tareas de análisis de corpus muy largos donde la latencia serie es prohibitiva.
- Despliegue en hardware de una sola GPU: el pack de 423 MB cabe holgadamente junto al objetivo en un único NVIDIA GB10 (DGX Spark), lo que permite montar un servidor de inferencia especulativa en un nodo compacto.
- Evaluación y benchmarking de decodificación especulativa: sirve como drafter de referencia para medir tasas de aceptación por posición (0,64-0,78 en posiciones 1-6) y comparar planificadores de profundidad.
- Investigación sobre cuantización EXL3: el pack permite estudiar el impacto de la re-codificación a 4,0 bpw sin calibración sobre la tasa de aceptación del borrador, manteniendo la exactitud de las respuestas.

## Benchmarks y rendimiento

Datos medidos por REXL3 el 2026-11-24 en un único NVIDIA GB10 (DGX Spark), con objetivo `Blackfrost-AI/Inkling-2-Mini-Derisked` cuantizado en EXL3 (rc-v2, no publicado, ejecutado con `--allow-unvalidated-pack`), ventana de 262.144 tokens, caché de prefijo desactivada, decodificación greedy, 256 tokens nuevos máximos.

| Prompt tokens | Serie (tok/s) | Con este draft (tok/s) | Aceleración |
|---|---|---|---|
| 36 | 44,61 | 59,72 | 1,34x |
| 2.425 | 43,63 | 68,60 | 1,57x |
| 8.025 | 42,30 | 53,92 | 1,27x |
| 32.025 | 35,99 | 52,93 | 1,47x |
| 128.024 | 22,97 | 34,48 | 1,50x |
| 261.025 | 15,36 | 25,74 | 1,68x |
| 261.029 | 15,40 | 29,42 | 1,91x |

Borradores aceptados por ronda de verificación (aceptados / rondas; sumar 1 para tokens por ronda):

| Prompt tokens | Aceptados por ronda |
|---|---|
| 36 | 1,77 (163 / 92) |
| 2.425 | 2,45 (181 / 74) |
| 8.025 | 1,80 (158 / 88) |
| 32.025 | 1,93 (168 / 87) |

Aceptación por posición del borrador (pool de las ejecuciones de 36 / 2,4K / 8K):

| Posición | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Aceptados / alcanzados | 191/254 (0,75) | 135/191 (0,71) | 87/135 (0,64) | 40/59 (0,68) | 24/34 (0,71) | 18/23 (0,78) | 7/7 |

Una ronda de borrador medida al arrancar: 3,0 ms. Decodificación muestreada (T > 0, top-p 1,0, top-k off, semilla fija, una ejecución por celda):

| Prompt tokens | Temperatura | Serie (tok/s) | Con este draft (tok/s) | Aceleración |
|---|---|---|---|---|
| 36 | 1,0 | 44,25 | 58,66 | 1,33x |
| 2.425 | 1,0 | 43,84 | 55,93 | 1,28x |
| 8.025 | 0,7 | 41,58 | 57,08 | 1,37x |
| 32.025 | 1,0 | 35,89 | 46,14 | 1,29x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LM evaluable de forma autónoma.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,4 GB (423 MB) para el pack EXL3, más los codebooks del selector, que dominan el tamaño.
- VRAM total: depende del modelo objetivo Inkling-2-Mini cuantizado, que debe residir en la misma GPU; no disponible el dato exacto del objetivo.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) es la plataforma en la que se midió; no se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: el drafter por sí solo sí (0,4 GB), pero el objetivo Inkling-2-Mini condiciona el requisito real de memoria; no disponible la cifra del objetivo.
- Opciones de despliegue: exclusivamente `rexl3-serve` con el cargador DFlash2 de REXL3 (rama de desarrollo, no en versión publicada). No carga en SGLang upstream ni en transformers.
- Latencia y throughput: una ronda de borrador de 3,0 ms; throughput de decodificación de 25,74 a 68,60 tok/s con el draft frente a 15,36-44,61 tok/s en serie, según longitud de prompt y plataforma GB10.
- Comando de servicio: `rexl3-serve --model <Inkling-2-Mini EXL3 pack> --draft <this folder> --spec auto --max-model-len 262144`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Inkling-2-Mini-DFlash2 EXL3 4,0 bpw) | 211,7 M | 262.144 | Drafter especulativo DFlash 2 cuantizado | Apache 2.0 | safetensors EXL3 |
| incoai/Inkling-2-Mini-DFlash2 (original) | no disponible | no disponible | Drafter especulativo DFlash 2 sin cuantizar | Apache 2.0 | no disponible |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Modelo objetivo (LM completo) | no disponible | no disponible |
| Blackfrost-AI/Inkling-2-Mini-Derisked | no disponible | no disponible | Fine-tune del objetivo usado en las mediciones | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede usarse para generar respuestas finales, chat, código o razonamiento sin el modelo objetivo Inkling-2-Mini.
- Solo carga con el cargador DFlash2 de REXL3; no es compatible con SGLang upstream ni con transformers.
- El soporte de Inkling-2-Mini con este draft está en la rama de desarrollo de REXL3 y no en una versión publicada, lo que implica riesgo de cambios e inestabilidad de API.
- El borrador se entrenó contra el modelo base Inkling-2-Mini, pero las métricas se midieron contra el fine-tune Derisked (rc-v2, no publicado, con `--allow-unvalidated-pack`); los resultados pueden no transferirse al objetivo base.
- No se midieron el objetivo base Inkling-2-Mini ni respuestas más largas: los datos de rendimiento son indicativos y de una sola ejecución por celda.
- La cuantización se realizó sin calibración (Hessiano identidad), lo que puede degradar la tasa de aceptación en dominios alejados de los prompts de prueba.
- Se perdieron 38 valores bf16 subnormales (de unos 116,9 M) convertidos a 0 en el selector y tensores de convolución dinámica.
- Riesgo de alucinación y sesgos: no aplica directamente al drafter, ya que la verificación exacta garantiza que las respuestas coinciden con las del objetivo; los sesgos heredados son los del modelo objetivo.
- Idiomas soportados: no disponible; dependen del objetivo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe mantenerse el aviso de cambios de la §4b y citarse el trabajo original de Inco AI.
- En producción, la aceleración depende de la tasa de aceptación, que cae con la longitud del prompt en algunos tramos (1,27x a 8K frente a 1,57x a 2,4K); conviene medir en el dominio concreto antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/r0b0tlab/Inkling-2-Mini-DFlash2-EXL3-4.00bpw-SAGE-REXL3
- Modelo base: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Fine-tune usado en las mediciones: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Repositorio REXL3: https://github.com/REXL3/REXL3
- Blog DFlash 2 (Inco AI): https://inco.ai/blog/dflash2/
- Paper DFlash (ICML 2026): Chen, Liang, Liu, *DFlash: Block Diffusion for Flash Speculative Decoding* (referencia citada en la model card, sin URL directa disponible)

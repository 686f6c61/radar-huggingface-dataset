# mvbalaji/ODYSSEY-100M-P7-C1-DIVERSE-SFT

## Resumen

ODYSSEY-100M-P7-C1-DIVERSE-SFT es un modelo de lenguaje causal de 100.248.960 parámetros desarrollado por Balaji Venkateswaran (mvbalaji) dentro del proyecto ODYSSEY-100M. Se trata de un ajuste fino supervisado (SFT) de parámetros completos sobre ODYSSEY-100M-REASONING-SFT-V2, el mejor modelo registrado de la familia. El objetivo del experimento es evaluar si un SFT con paráfrasis diversas mejora la robustez aritmética ante formulaciones nunca vistas durante el entrenamiento.

El modelo forma parte de la Fase 7 de un experimento preregistrado con tres brazos (C1, C2, C3). Bajo las puertas de validación registradas, ningún brazo las superó (Fase 7 = NO-GO), por lo que el conjunto de confirmación held-out nunca se abrió. Los resultados publicados provienen del split de selección y están sujetos a optimismo de selección. El autor lo etiqueta explícitamente como experimental, no promocionado y con resultados no confirmados.

Arquitectura transformer causal personalizada (no es una clase de `transformers`), entrenada desde cero sobre 5.000 millones de tokens y posteriormente sometida a varias rondas de SFT. El contexto está limitado a 1.024 tokens y el modelo solo soporta inglés. Su relevancia es fundamentalmente metodológica: documenta un protocolo de evaluación preregistrado con puertas estadísticas y divulgación de fallos de diseño, más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal personalizada (implementación propia en PyTorch, `modeling_odyssey.py`) |
| Parametros totales | 100.248.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (posiciones superiores producen error) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `fa40f7e2…` para el init; repo de 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de implementación propia, entrenado desde cero sin pesos de ningún otro modelo. El tokenizador y la arquitectura son idénticos a los de ODYSSEY-100M-REASONING-SFT-V2; este modelo no introduce WSP, compilador ni cabezas adicionales. El preentrenamiento de la familia se realizó sobre 5.000 millones de tokens (modelo `ODYSSEY-100M-5B-BASE`) usando FineWeb-Edu (sample-10BT), FineMath (finemath-4plus) y codeparrot/github-code-clean filtrado por licencias permisivas (MIT, Apache-2.0, BSD-2/3-Clause, ISC, CC0-1.0, Unlicense).

Este brazo concreto (C1) aplica SFT de parámetros completos durante 46 pasos con learning rate 2e-5, sobre 1.500.856 tokens (853.762 supervisados) con un 20 % de replay de preentrenamiento y semilla 1234, partiendo de SFT-V2. Los datos son ítems de matemáticas y lógica generados y verificados localmente, renderizados en estilos de paráfrasis diversos: historias, imperativos, números en palabras, cloze, distractores e instrucciones de formato. El entrenamiento se ejecutó en una RTX 4060 de 8 GB. El formato de prompt es `### Instruction:\n{task}\n\n### Response:\n`, con las respuestas matemáticas terminando en `Final answer: X` seguido de EOS. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés con decodificación greedy que se detiene en EOS.
- Aritmética simple y de varios pasos (cadenas de hasta tres operaciones) bajo formulaciones entrenadas.
- Mayor robustez que su modelo base ante paráfrasis imperativas y números escritos en palabras.
- Razonamiento matemático básico con formato de respuesta final explícito (`Final answer: X`).
- Capacidad residual de código (el modelo base incluyó código en el preentrenamiento), aunque el autor la califica de mayoritariamente incorrecta.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso general más allá de cadenas aritméticas cortas.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación sobre robustez ante paráfrasis: el modelo sirve como artefacto de estudio para medir cómo el SFT con estilos diversos afecta a la generalización aritmética bajo formulaciones nunca vistas, con métricas pareadas y bootstrap agrupado por problema.
- Reproducción de experimentos preregistrados: útil para replicar el protocolo de puertas (G1, G2, G6) y analizar los fallos de diseño divulgados, como la falta de potencia estadística de G2 o la comparación de G6 entre lotes distintos.
- Evaluación de infraestructura de inferencia en hardware de consumo: con 100 M de parámetros y 0,4 GB de pesos, permite probar pipelines de carga, tokenización y generación en GPUs de 8 GB como la RTX 4060 usada en el entrenamiento.
- Docencia sobre ajuste fino de modelos pequeños: el repositorio incluye `modeling_odyssey.py` y `example.py` autocontenidos, lo que facilita explicar SFT de parámetros completos, replay de preentrenamiento y formato de prompt en un caso real.
- Estudio de metodología de evaluación: sirve para ilustrar el optimismo de selección cuando los resultados se reportan sobre el split de selección y el conjunto de confirmación no se abre.
- Generación de respuestas aritméticas con formato controlado en entornos de prueba: el patrón `Final answer: X` más EOS permite integrar el modelo en scripts que parsean la respuesta final, siempre que no se requiera corrección garantizada.
- Línea base para comparativas de la familia ODYSSEY-100M: enfrentarlo a C2 (SFT emparejado) y C3 (RL con respuesta exacta) para estudiar el efecto de cada estrategia de ajuste.

## Benchmarks y rendimiento

Resultados sobre el split de selección de la Fase 7 (comparación pareada frente a V2, bootstrap agrupado por problema). Sujetos a optimismo de selección; el conjunto held-out nunca se abrió.

| Medida | V2 | Este modelo |
|---|---:|---:|
| PRIMARIA: aritmética con formulaciones nunca entrenadas (360) | 0,594 | 0,653 (+0,058 [+0,005, +0,115]) |
| Aritmética simple, formulación de Fase 6 (120) | 0,933 | 0,933 |
| Comparación por pares | — | +0,081 [+0,036, +0,127] frente a C2 |
| Δ NLL de desarrollo general / matemáticas / código | — | −0,001 / −0,001 / −0,003 |

Observaciones del autor: las ganancias se concentran en formulaciones imperativas y con números en palabras, y en cadenas entrenadas bajo nueva formulación (cadenas de 3 operaciones: 0 → 0,60). Las formulaciones tipo historia held-out empeoraron (0,31 → 0,22). Las formas de expresión nuevas se mantienen en torno a 0,15.

Resultado de las puertas preregistradas: falló G1 (ganancia primaria por debajo de +0,08), G2 (cota del intervalo de confianza en aritmética simple) y G6 (estabilidad). El autor divulga que G2 estaba infrapotenciada (un brazo sin cambio alguno la falla) y que G6 comparó salidas generadas con composiciones de lote distintas (el propio V2 sin cambios también la falla). Las puertas no se relajaron.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión original (0,4 GB de pesos safetensors más activaciones y caché KV para 1.024 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una RTX 4060 de 8 GB.
- Cabe holgadamente en GPU de consumo: RTX 4060, RTX 3060, RTX 4090, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el repositorio incluye una implementación PyTorch independiente (`modeling_odyssey.py` y `example.py`) que requiere `torch`, `safetensors`, `tokenizers` y `huggingface_hub`. Al no ser una clase de `transformers`, no es compatible directamente con vLLM, TGI, llama.cpp u Ollama sin conversión y adaptación del código.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Rendimiento |
|---|---:|---|---|---|---|
| ODYSSEY-100M-P7-C1-DIVERSE-SFT | 100.248.960 | 1.024 | Apache 2.0 | Experimental, Fase 7 NO-GO | 0,653 en aritmética nunca entrenada (split de selección) |
| ODYSSEY-100M-REASONING-SFT-V2 | 100.248.960 | 1.024 | Apache 2.0 | Mejor modelo registrado de la familia | 0,594 en la misma medida |
| ODYSSEY-100M-P7-C2-MATCHED-SFT | 100.248.960 | 1.024 | Apache 2.0 | Experimental, control emparejado | Inferior a C1 por pares (−0,081) |
| ODYSSEY-100M-P7-C3-RL | 100.248.960 | 1.024 | Apache 2.0 | Experimental, RL con respuesta exacta | No disponible |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación de 100 M de parámetros: alucina hechos con confianza, entra en bucles bajo decodificación greedy en texto libre y es mayoritariamente incorrecto en código y en aritmética más allá de casos simples.
- Sin ajuste de seguridad ni RLHF: puede reproducir texto dañino o sesgado procedente de datos web.
- No debe usarse para nada que requiera respuestas correctas (uso médico, legal, financiero, de seguridad o factual).
- Solo inglés para lenguaje natural y contexto máximo de 1.024 tokens; posiciones superiores generan error.
- Los resultados publicados proceden del split de selección y están sujetos a optimismo de selección; el conjunto held-out nunca se abrió porque ninguna puerta se superó.
- Fallos de diseño divulgados en las puertas: G2 estaba infrapotenciada y G6 comparó lotes con composiciones distintas.
- Empeoramiento en formulaciones tipo historia held-out (0,31 → 0,22).
- Licencia Apache 2.0 para pesos y código, pero los datos de entrenamiento tienen atribuciones propias (FineWeb-Edu y FineMath bajo ODC-By 1.0 y términos de CommonCrawl; GSM8K MIT; MBPP CC-BY-4.0; OASST1 Apache-2.0; self-oss-instruct ODC-By con texto generado por modelo, revisar los términos de salida de StarCoder2 para usos más allá de investigación).
- La arquitectura es personalizada y no es una clase de `transformers`, lo que limita la compatibilidad con ecosistemas de despliegue estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C1-DIVERSE-SFT
- Modelo base: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V2
- Base de preentrenamiento (2B tokens): https://huggingface.co/mvbalaji/ODYSSEY-100M-2B-BASE
- Base de preentrenamiento (5B tokens): https://huggingface.co/mvbalaji/ODYSSEY-100M-5B-BASE
- SFT V1: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V1
- Brazo C2 (SFT emparejado): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C2-MATCHED-SFT
- Brazo C3 (RL con respuesta exacta): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C3-RL
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- codeparrot/github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- GSM8K: https://huggingface.co/datasets/openai/gsm8k
- MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp

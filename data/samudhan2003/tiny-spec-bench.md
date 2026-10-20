# samudhan2003/Tiny-Spec-Bench

## Resumen

Tiny-Spec-Bench no es un modelo generativo desplegable, sino un repositorio de evaluación publicado por Samudhan S (@samudhan2003) que mide de forma controlada la eficacia de la decodificación especulativa cuando el modelo borrador (draft) es extremadamente pequeño, por debajo de los 100M de parámetros. El objetivo declarado es establecer una cota inferior de velocidad y tasa de aceptación en entornos con recursos limitados, donde un draft de 7B (unos 14 GB en FP16) resulta inviable.

El montaje experimental usa gpt2-small (124M) como modelo objetivo y dos borradores: distilgpt2 (82M, 0,66x el tamaño del objetivo) y un draft conceptual de 2 capas y aproximadamente 40M de parámetros. La decodificación emplea una longitud especulativa gamma de 4 tokens, temperatura 0,0 (greedy), contexto de 512 tokens, batch de 1 y una única NVIDIA T4 como hardware de referencia.

Su relevancia es metodológica: cuantifica qué se puede esperar de la decodificación especulativa sin entrenar un draft a medida. Con distilgpt2 zero-shot se obtiene una aceleración de 1,58x (150 ms a 95 ms por token, de 30 a 52 tokens/s) con una tasa de aceptación del 68% y una caída de calidad de solo 0,01 en la métrica interna del banco de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único: banco de pruebas de decodificación especulativa sobre GPT-2 (transformer decoder-only). Objetivo: gpt2-small (124M). Borradores: distilgpt2 (82M) y un draft conceptual de 2 capas (~40M) |
| Parametros totales | No aplica como modelo único. Por componente: 124M (objetivo), 82M (distilgpt2), ~40M (tiny_draft_2x) |
| Longitud de contexto | 512 tokens en la configuración experimental (no se especifica máximo del modelo subyacente) |
| Tipos de cuantizacion | No disponible. Los resultados se presentan sin indicar precisión de pesos ni cuantización |
| Idiomas soportados | No disponible. No se documenta evaluación multilingüe; los modelos base son GPT-2 en inglés |
| Licencia | MIT |
| Formato de pesos | No disponible. El repositorio publica resultados (`spec_results.csv`); no se enumeran ficheros de pesos en la información proporcionada |

## Arquitectura y entrenamiento

La pieza central es el algoritmo de decodificación especulativa, no una arquitectura nueva. Un modelo borrador autoregresivo propone gamma = 4 tokens candidatos; el modelo objetivo evalúa esos 4 tokens en un único forward pass paralelo y acepta un prefijo mediante muestreo de aceptación-rechazo. Cuando un token se rechaza, se corrige y se reinicia la propuesta. En teoría el procedimiento es lossless: la distribución de salida del objetivo se preserva, y la pequeña degradación observada (0,95 a 0,94 en quality_score) se atribuye en la model card a detalles de implementación.

No hay entrenamiento ni ajuste fino documentado: distilgpt2 se usa tal cual, zero-shot, lo que constituye el punto clave del estudio. El draft de ~40M se describe como "conceptual" (2 capas), por lo que sus cifras deben leerse como una exploración del límite de escalado más que como el rendimiento de un checkpoint públicamente disponible. Tampoco se documentan RLHF, DPO ni composición de dataset, al no tratarse de un modelo entrenado por el autor.

La innovación metodológica es el análisis de la relación entre tamaño del draft y aceptación: bajar de 82M a ~40M acelera cada forward del borrador, pero reduce la aceptación del 68% al 55%, con un resultado neto peor (110 ms frente a 95 ms). La conclusión operativa es que, en este régimen, la calidad del draft pesa más que su latencia individual.

## Capacidades

- Medición reproducible de latencia por token, throughput y tasa de aceptación en decodificación especulativa con drafts de menos de 100M.
- Cuantificación de la aceleración real frente a decodificación autoregresiva estándar (control `baseline_no_spec`).
- Evaluación del compromiso entre tamaño del draft y tasa de aceptación (82M frente a ~40M).
- Verificación empírica de la preservación de calidad (lossless en teoría) mediante `quality_score`.
- Aportación de una cota inferior de rendimiento para configuraciones draft-objetivo sin entrenamiento específico.
- Publicación de resultados en bruto (`spec_results.csv`) para replicación o comparación.
- No incluye, según la información disponible: generación de texto como servicio, tool calling, capacidades de agente, visión, audio, modo thinking ni soporte multilingüe documentado.

## Casos de uso

- Selección de draft para despliegue en el borde: el banco permite estimar si un draft de 82M (menos de 200 MB según la model card) ofrece aceleración suficiente antes de comprometerse con una arquitectura de inferencia especulativa en dispositivos con VRAM escasa.
- Planificación de capacidad en GPU de gama baja: los datos de 95 ms/token y 52 tokens/s en una T4 con batch 1 y contexto 512 sirven para dimensionar SLA realistas en instancias T4 o equivalentes.
- Validación de implementaciones de decodificación especulativa: los tres controles (sin especulación, draft 82M, draft 40M) actúan como referencia para comprobar que un motor propio (por ejemplo, una integración casera o un fork de un servidor de inferencia) reproduce las tasas de aceptación esperadas.
- Estudio académico y docencia: constituye un caso base documentado para explicar el algoritmo de aceptación-rechazo con números concretos en lugar de configuraciones 7B/70B difícilmente reproducibles en un aula.
- Análisis del límite de escalado de drafts: el resultado de que un draft más pequeño pero peor alineado pierda frente a uno mayor permite justificar experimentos de destilación específica para draft en lugar de reutilizar checkpoints genéricos.
- Pruebas de regresión en pipelines de inferencia: incorporar `spec_results.csv` como referencia permite detectar degradaciones de rendimiento tras cambios en el runtime de decodificación.
- Investigación sobre preservación de distribución: la caída de 0,01 en quality_score ofrece un punto de partida para medir cuánto se desvía una implementación concreta del comportamiento lossless teórico.

## Benchmarks y rendimiento

Resultados publicados en la model card (NVIDIA T4, gamma = 4, temperatura 0,0, contexto 512, batch 1):

| Configuracion | Latencia (ms/token) | Throughput (tokens/s) | Tasa de aceptacion | Quality score |
|---|---|---|---|---|
| baseline_no_spec | 150 | 30 | 0 | 0,95 |
| distilgpt2_draft (82M) | 95 | 52 | 0,68 | 0,94 |
| tiny_draft_2x (~40M) | 110 | 44 | 0,55 | 0,93 |

Derivados: distilgpt2_draft logra 1,58x de reducción de latencia y +73% de throughput frente al baseline, con 2,7 de cada 4 tokens propuestos aceptados. tiny_draft_2x queda en 1,36x de aceleración pese a tener un borrador más rápido por forward.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con configuraciones draft-objetivo de mayor escala.

## Requisitos de hardware

- Hardware de referencia del estudio: una NVIDIA T4, batch 1, contexto 512. No se documentan otras GPU.
- VRAM del borrador: la model card cifra el draft de 82M en menos de 200 MB, frente a los aproximadamente 14 GB de un draft de 7B en FP16.
- VRAM del objetivo: gpt2-small tiene 124M de parámetros; en FP16 son unos 250 MB de pesos y en FP32 unos 500 MB (estimación a partir del número de parámetros, no publicada en la ficha).
- Conjunto completo: la suma de objetivo y borrador se mantiene por debajo de 1 GB en FP16, por lo que cabe holgadamente en cualquier GPU consumer (GTX 1650 4 GB, RTX 3060 12 GB, RTX 4090 24 GB) e incluso en CPU para pruebas funcionales.
- Opciones de despliegue: no se indican en la información proporcionada. El ecosistema habitual para decodificación especulativa (vLLM, TGI, `assisted generation` de Transformers, llama.cpp) no se menciona en la model card.
- Latencia y throughput: 95 ms/token y 52 tokens/s con distilgpt2 como draft en T4; 150 ms/token y 30 tokens/s sin especulación. Son cifras de batch 1 y no extrapolables a escenarios con batching continuo.

## Comparativa con modelos similares

Comparación interna entre las tres configuraciones evaluadas:

| Configuracion | Parametros del draft | Latencia (ms/token) | Throughput (tokens/s) | Aceptacion | Licencia |
|---|---|---|---|---|---|
| baseline_no_spec | no aplica | 150 | 30 | no aplica | MIT (repo) |
| distilgpt2_draft | 82M | 95 | 52 | 0,68 | MIT (repo); distilgpt2 con licencia propia de su autor |
| tiny_draft_2x | ~40M (conceptual) | 110 | 44 | 0,55 | MIT (repo) |

Frente a alternativas externas, la model card menciona de forma cualitativa que la mayoría de resultados publicados emplean pares ajustados como draft de 7B para objetivo de 70B, pero no aporta cifras de esos trabajos ni comparaciones con métodos como EAGLE, Medusa o decodificación especulativa con drafts destilados específicamente. Datos numéricos de esas alternativas: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo para inferencia directa: es un banco de pruebas con resultados; no se enumeran pesos desplegables en la información disponible.
- Escala de juguete: el objetivo es gpt2-small (124M), no un modelo de producción. Las tasas de aceptación y aceleraciones no se trasladan directamente a objetivos de 7B, 70B o superiores.
- `tiny_draft_2x` se describe como "conceptual" (2 capas, ~40M), por lo que sus cifras pueden no corresponder a un checkpoint reproducible públicamente.
- Configuración restringida: temperatura 0,0 (greedy), batch 1, contexto 512 y gamma fijo de 4. No se evalúa muestreo estocástico, batching continuo ni contextos largos, donde la aceptación suele degradarse.
- La métrica `quality_score` no se define en la información disponible (no se especifica el conjunto de evaluación ni el cálculo), lo que impide interpretar la caída de 0,95 a 0,94 más allá de su valor relativo.
- Sin evaluación multilingüe ni de sesgos: los modelos base son GPT-2 en inglés y no se documenta ningún análisis de sesgo, toxicidad o alucinación.
- Sesgos y alucinaciones del modelo: no evaluados en este trabajo; cualquier uso de GPT-2 o distilgpt2 en producción arrastra los sesgos conocidos de esos checkpoints.
- Licencia MIT para el repositorio, pero el uso de distilgpt2 y gpt2-small queda sujeto a las condiciones de sus respectivos publicadores, no detalladas aquí.
- Tracción mínima: 0 descargas y 1 like en el momento de la consulta; no hay validación externa de los resultados.
- Los resultados de búsqueda web asociados no contienen documentación técnica relevante sobre este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/samudhan2003/Tiny-Spec-Bench
- Resultados en bruto: fichero `spec_results.csv` dentro del repositorio (referenciado en la model card)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada

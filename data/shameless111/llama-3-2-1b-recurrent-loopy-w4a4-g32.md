# Shameless111/Llama-3.2-1B-Recurrent-Loopy-W4A4-G32

## Resumen

Llama-3.2-1B-Recurrent-Loopy-W4A4-G32 es un checkpoint cuantizado del modelo recurrente irafm-llm/Recurrent-Llama-3.2-1B, una variante experimental que aplica profundidad recurrente sobre la arquitectura Llama 3.2 de 1B parametros. Lo publica el usuario Shameless111 como artefacto de investigacion reproducible, con un cargador propio (custom loader) que sustituye al `from_pretrained()` estandar de Transformers. El modelo aplica cuantizacion de pesos a 4 bits (W4) y activaciones dinamicas por token a 4 bits (A4), con grupos de 32 y una transformada de Hadamard de bloque 64, y opera con profundidad recurrente T=16.

El checkpoint corresponde a la seleccion `s1024_p08_b64` de un pool de 400 candidatos, con semilla de rotacion 1024 y potencia de escalado 0.8. Su relevancia es metodologica: documenta de forma exhaustiva el protocolo de busqueda, calibracion y evaluacion (ventanas fijas de WikiText-103, conjuntos separados de 32 ventanas para calibracion, busqueda y calidad), lo que permite reproducir el experimento. No obstante, los resultados de calidad publicados son muy pobres: perplejidad WT2 de 1088.17 y LAMBADA de 65194.14, con una precision media del 25.25 % en las cinco tareas de evaluacion.

Se trata, por tanto, de un artefacto de investigacion sobre compresion extrema y modelos recurrentes, no de un modelo listo para produccion. El repositorio ocupa 2.1 GB e incluye codigo, configuracion, registros de busqueda, manifiestos con hashes SHA-256 y resultados de referencia en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (Recurrent-Llama-3.2-1B) con profundidad recurrente T=16; pesos cuantizados W4A4 con rotacion Hadamard |
| Parametros totales | no disponible (modelo base de 1B parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la evaluacion WT2 usa contexto de 4096 tokens) |
| Tipos de cuantizacion | W4 (pesos a 4 bits en contenedores INT8) y A4 (activaciones dinamicas por token a 4 bits); grupo de pesos 32; Hadamard de bloque 64; evaluacion con fake quantization BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License y Acceptable Use Policy) |
| Formato de pesos | `selected.pt` (state dict de PyTorch con codigos INT8, escalas, zero points, escalado de entrada y signos Hadamard); no usa almacenamiento INT4 empaquetado |

## Arquitectura y entrenamiento

El modelo parte de irafm-llm/Recurrent-Llama-3.2-1B (revision `eefd08cd0caead1ea5db6cf62a06ccb69cf8d638`), que introduce recurrencia sobre un transformer Llama 3.2 de 1B parametros: el bloque se aplica de forma iterada con profundidad T=16, de modo que el computo efectivo crece sin aumentar el numero de parametros. Sobre esa base, este checkpoint aplica un esquema de cuantizacion post-entrenamiento W4A4 con rotacion Hadamard, seleccionado mediante una busqueda sobre 400 candidatos parametrizados por semilla de rotacion, potencia de escalado y tamano de bloque Hadamard.

La seleccion final (`s1024_p08_b64`) usa semilla 1024, potencia de escalado 0.8 y bloque Hadamard 64, con grupo de pesos 32 y activaciones dinamicas por token a 4 bits. El proceso de calibracion, busqueda y evaluacion usa ventanas fijas de tokens derivadas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de Salesforce/wikitext), con grupos separados de 32 ventanas para cada fase. No se documentan en la informacion disponible el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable es la reproducibilidad del pipeline de cuantizacion y la publicacion de los registros completos de busqueda por etapa.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Llama 3.2 de 1B.
- Razonamiento de multiples pasos mediante profundidad recurrente (T=16), que reaplica el bloque transformer de forma iterada.
- Evaluacion en tareas de comprension: LAMBADA, WinoGrande, ARC-Challenge, HellaSwag y MMLU (con resultados publicados).
- Carga mediante cargador propio (Loopy loader) que inicializa la arquitectura base antes de cargar estrictamente el state dict seleccionado.
- Ejecucion de scripts de evaluacion incluidos (`eval_wikitext.py`, `eval_tasks.py`) con soporte de `--a-bits 4` y `--variant selected`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion sobre cuantizacion extrema W4A4: el checkpoint sirve como referencia reproducible para estudiar el impacto de la cuantizacion a 4 bits en pesos y activaciones sobre un modelo de 1B, con protocolo de calibracion y busqueda documentado.
- Estudio de modelos recurrentes: permite analizar como la profundidad recurrente T=16 afecta a la perplejidad y a tareas de razonamiento en comparacion con el modelo base no recurrente.
- Reproduccion de experimentos: los scripts `eval_wikitext.py` y `eval_tasks.py`, junto con `artifacts/` y `reference_results/`, permiten replicar las metricas publicadas y verificar los hashes SHA-256 via `manifest.json`.
- Analisis de rotacion Hadamard: los registros de busqueda por etapa permiten estudiar el efecto de la semilla de rotacion, la potencia de escalado y el tamano de bloque en la calidad final.
- Docencia y formacion: util como ejemplo practico de pipeline de cuantizacion post-entrenamiento con seleccion sobre pool de candidatos y evaluacion con fake quantization BF16.
- Auditoria de artefactos: `provenance.json` y `manifest.json` facilitan la verificacion de integridad y trazabilidad de los ficheros publicados en entornos de investigacion.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint seleccionado:

| Metrica | Valor |
|---|---:|
| WT2 word PPL (contexto 4096, rolling) | 1088.17 |
| LAMBADA PPL | 65194.14 |
| LAMBADA acc. | 0.64 |
| WinoGrande | 52.17 |
| ARC-C (acc_norm) | 22.70 |
| HellaSwag (acc_norm) | 27.68 |
| MMLU | 23.07 |
| Media de precision (5 tareas) | 25.25 |

No se proporcionan en la informacion disponible resultados comparativos con otros modelos ni metricas del modelo base en precision completa dentro de esta ficha; los valores de referencia en precision completa se encuentran en `reference_results/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 2.1 GB y el modelo base es de 1B parametros, por lo que en BF16 requeriria aproximadamente 2 GB de pesos mas overhead de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con al menos 8 GB de VRAM deberia poder alojar los pesos, aunque el cargador propio y el modo de evaluacion con fake quantization BF16 condicionan el consumo real.
- Cabe en GPU consumer: previsiblemente si (RTX 3060, RTX 4060, RTX 4090), aunque no se documenta latencia ni throughput medidos.
- Opciones de despliegue: cargador Loopy incluido en `code/` con entorno Conda (`environment.yml`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y se advierte explicitamente de no usar `from_pretrained()` generico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Recurrent-Loopy-W4A4-G32 | 1B (base) | no disponible (eval. a 4096) | W4A4, grupo 32 | llama3.2 | Hugging Face, cargador propio |
| irafm-llm/Recurrent-Llama-3.2-1B | 1B (base) | no disponible | sin cuantizar | llama3.2 | Hugging Face (modelo base) |
| Llama 3.2 1B (Meta) | 1B | 128K | multiples (BF16, GGUF, etc.) | llama3.2 | Hugging Face, ecosistema amplio |

No se dispone de datos de rendimiento comparables de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad muy degradada: perplejidad WT2 de 1088.17 y LAMBADA de 65194.14, con precision media del 25.25 % en cinco tareas; no es apto para uso en produccion.
- Requiere cargador propio: el autor advierte de que no debe cargarse con `from_pretrained()` generico de Transformers.
- No usa kernel INT4 de inferencia ni almacenamiento INT4 empaquetado; la evaluacion emplea fake quantization BF16, por lo que el rendimiento real en hardware puede diferir.
- Solo ingles: la etiqueta de idioma del repositorio es `en`, sin evidencia de capacidades multilingues.
- Riesgo de alucinacion elevado dado el bajo rendimiento en MMLU (23.07) y HellaSwag (27.68).
- Licencia Llama 3.2 Community License: restricciones de uso comercial y obligaciones de atribucion segun la Acceptable Use Policy; el codigo de investigacion se rige por `code/THIRD_PARTY_NOTICES.md`.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que implica ausencia de validacion por parte de la comunidad.
- Sesgos conocidos: no documentados en la informacion disponible, aunque hereda los del modelo base Llama 3.2.
- Fecha de creacion y actualizacion del repositorio: 2026-11-15, segun metadatos de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/Shameless111/Llama-3.2-1B-Recurrent-Loopy-W4A4-G32
- Modelo base: https://huggingface.co/irafm-llm/Recurrent-Llama-3.2-1B
- Dataset de calibracion/evaluacion: https://huggingface.co/datasets/Salesforce/wikitext
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/

# review-artifacts-27/Loopy-Ouro-1.4B-W4A4-G32

## Resumen

Loopy-Ouro-1.4B-W4A4-G32 es un checkpoint cuantizado derivado de ByteDance/Ouro-1.4B, un modelo de lenguaje recurrente de 1.4 mil millones de parametros. Lo publica el usuario review-artifacts-27 como artefacto de investigacion dentro del proyecto Loopy, un marco experimental de cuantizacion de pesos y activaciones para modelos recurrentes. El checkpoint aplica cuantizacion W4A4 (4 bits en pesos y 4 bits en activaciones) con grupo de pesos de tamano 32 y una transformacion Hadamard de bloque 512, manteniendo una profundidad recurrente de T=4.

El problema que aborda es la compresion agresiva de un modelo recurrente sin perder demasiada calidad: en lugar de un transformer convencional, Ouro itera un mismo bloque de parametros varias veces, lo que hace especialmente sensible cualquier error de cuantizacion acumulado entre pasos. Loopy busca seleccionar, entre un pool de 400 candidatos, la combinacion de rotacion y escalado que mejor preserva las metricas del modelo original. El checkpoint seleccionado es `s137_p08_b512`, con semilla de rotacion 137 y potencia de escalado 0.8.

Es relevante ahora porque documenta de forma reproducible (protocolo congelado, ventanas fijas de WikiText-103, registros de busqueda por etapa y metricas de referencia) como cuantizar a 4 bits un modelo recurrente, un terreno mucho menos explorado que la cuantizacion de transformers densos. No obstante, es un artefacto de revision con cero descargas y cero likes, sin pipeline declarado, y requiere un cargador propio en lugar de `from_pretrained()`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje recurrente (recurrent-language-model) con profundidad recurrente T=4; arquitectura base de ByteDance/Ouro-1.4B |
| Parametros totales | 1.4B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluacion WT2 con PPL rodante a nivel de documento) |
| Tipos de cuantizacion | W4A4: pesos a 4 bits en contenedores INT8, activaciones A4 dinamicas por token; grupo de pesos 32; Hadamard de bloque 512; evaluacion con fake quantization en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (pesos); el codigo de investigacion y dependencias se rigen por `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dict de PyTorch con codigos INT8, escalas, zero points, escalado de entrada y signos Hadamard); no usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4 |

## Arquitectura y entrenamiento

El modelo base ByteDance/Ouro-1.4B es un modelo de lenguaje recurrente: en lugar de apilar capas distintas, reutiliza un bloque de parametros a lo largo de T=4 pasos de profundidad. Esta decision reduce el numero de parametros unicos pero incrementa la sensibilidad a errores numericos, porque la misma matriz se aplica repetidamente y los errores de cuantizacion se amplifican en cada iteracion. El checkpoint de Loopy conserva esa arquitectura y solo modifica la representacion numerica de los pesos y activaciones.

El proceso de cuantizacion parte de un pool de 400 candidatos generados variando semilla de rotacion, potencia de escalado y tamano de bloque Hadamard. La seleccion final (`s137_p08_b512`) se elige con un protocolo congelado documentado en `code/docs/protocol.md`, con ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`) y grupos separados de 32 ventanas para calibracion, busqueda y evaluacion de calidad. No se detalla en la informacion disponible el volumen de tokens de entrenamiento del modelo base ni si hubo RLHF o DPO; esos datos corresponden a la model card upstream, no incluida aqui.

La innovacion tecnica destacable es la combinacion de rotacion Hadamard (bloque 512) con escalado de potencia 0.8 y cuantizacion dinamica por token de activaciones. Los pesos W4 se almacenan como codigos enteros en contenedores INT8 junto con sus metadatos (escalas, zero points, signos de Hadamard), y la evaluacion se realiza con fake quantization en BF16. El release no incluye kernel INT4, por lo que el checkpoint no es directamente desplegable en runtimes de inferencia cuantizada estandar: requiere el cargador Loopy incluido en `code/`.

## Capacidades

- Generacion de texto en ingles con el modelo base Ouro-1.4B, condicionada por la cuantizacion W4A4 aplicada.
- Razonamiento basico y respuesta a preguntas de conocimiento general, medido en MMLU (56.07% acc).
- Razonamiento de sentido comun y completado de frases, medido en HellaSwag (67.70% acc_norm), WinoGrande (61.48% acc) y LAMBADA (55.81% acc).
- Razonamiento cientifico de nivel escolar, medido en ARC-Challenge (47.70% acc_norm).
- Modelado de lenguaje a nivel de documento con contexto de 4096 tokens (WT2 word PPL 14.73, LAMBADA PPL 8.17).
- Capacidad de profundidad recurrente T=4, que permite reutilizar computo sin aumentar parametros.
- Soporte de tool calling, function calling, agentes multi-paso, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion en cuantizacion de modelos recurrentes: el checkpoint sirve como referencia reproducible para comparar tecnicas W4A4 (rotacion Hadamard, escalado, seleccion de candidatos) sobre arquitecturas que iteran parametros, un regimen donde la acumulacion de error es critica.
- Reproduccion de experimentos: el protocolo congelado, las ventanas fijas de WikiText-103 y los registros por etapa permiten replicar la seleccion `s137_p08_b512` y verificar las metricas de la tabla principal sin busqueda adicional.
- Evaluacion de degradacion por cuantizacion: comparando las metricas guardadas en `reference_results/` (seleccionado, anchor y BF16 para W4A8) con el modelo de precision completa se puede medir la perdida exacta atribuible a W4A4 en cada tarea.
- Prototipado de pipelines de evaluacion: los scripts `eval_wikitext.py` y `eval_tasks.py` con `--a-bits 4` permiten montar un flujo de evaluacion estandarizado (LAMBADA, WinoGrande, ARC-C, HellaSwag, MMLU) sobre un modelo de 1.4B en una sola GPU consumer.
- Estudio de alternativas de almacenamiento: dado que los codigos W4 se guardan en contenedores INT8 sin empaquetado, el checkpoint es util para analizar el coste en tamano (repo de 1.9 GB) frente a un hipotetico formato INT4 empaquetado.
- Base para experimentos de decodificacion con contexto de 4096 tokens: util para probar tecnicas de PPL rodante a nivel de documento sobre un modelo pequeno y recurrente antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Metricas guardadas del checkpoint seleccionado (`s137_p08_b512`), segun la model card:

| Metrica | Valor |
|---|---:|
| WT2 word PPL (contexto 4096, rodante a nivel de documento) | 14.73 |
| LAMBADA PPL | 8.17 |
| LAMBADA acc. | 55.81 |
| WinoGrande | 61.48 |
| ARC-C (acc_norm) | 47.70 |
| HellaSwag (acc_norm) | 67.70 |
| MMLU | 56.07 |
| Media de exactitud (5 tareas, pesos iguales) | 57.75 |

La model card indica que las metricas de precision completa del checkpoint seleccionado y del anchor estan en `reference_results/`, junto con BF16 para W4A8, pero no se incluyen sus valores numericos en la informacion proporcionada. No hay comparacion directa con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa 1.9 GB e incluye codigos W4 en contenedores INT8, por lo que el checkpoint no reduce el espacio respecto a un almacenamiento de 8 bits; la evaluacion se hace con fake quantization en BF16, lo que implica cargar el modelo en BF16 (aproximadamente 2.8 GB solo de pesos para 1.4B parametros, mas activaciones y overhead).
- GPU recomendadas: no especificadas en la informacion. Por tamano del modelo base (1.4B), es plausible en GPUs consumer con al menos 8-12 GB de VRAM para evaluacion en BF16, pero no hay dato oficial.
- Cabe en GPU consumer: previsiblemente si, dada la escala de 1.4B, aunque no se confirma en la documentacion.
- Opciones de despliegue: el checkpoint requiere el cargador Loopy incluido (`code/`), con entorno conda (`environment.yml`) y variables `LOOPY_ARTIFACTS`, `PYTHON`, `LOOPY_MODELS`. No es compatible con `from_pretrained()` generico de Transformers ni, segun la model card, con kernels INT4 estandar; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion de referencia usa una sola GPU (`CUDA_VISIBLE_DEVICES=0`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loopy-Ouro-1.4B-W4A4-G32 | 1.4B | 4096 | W4A4, grupo 32, Hadamard 512 | Apache-2.0 | Hugging Face, requiere cargador Loopy |
| ByteDance/Ouro-1.4B (base) | 1.4B | no disponible en esta ficha | Precision original (BF16) | Apache-2.0 | Hugging Face |
| Variante W4A8 del mismo proyecto | 1.4B | 4096 (protocolo comun) | W4A8 | Apache-2.0 | Referenciada en `reference_results/`, no como repo independiente en la informacion disponible |

No se dispone de datos de benchmarks del modelo base ni de la variante W4A8 en la informacion proporcionada, por lo que no es posible cuantificar la degradacion relativa. Tampoco se identifican en la informacion otros modelos recurrentes cuantizados comparables.

## Limitaciones y advertencias

- Artefacto de investigacion sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, autor `review-artifacts-27` sin trayectoria verificable en la informacion.
- No es un checkpoint listo para produccion: no incluye kernel INT4 ni almacenamiento empaquetado; los pesos W4 se guardan en contenedores INT8 y la evaluacion usa fake quantization en BF16, lo que anula parte del ahorro de memoria esperado de W4A4.
- Requiere cargador propio: un `from_pretrained()` generico de Transformers no funciona; hay que usar el loader Loopy, que inicializa la arquitectura base antes de cargar estrictamente el state dict seleccionado.
- Solo ingles: el campo `language` declara unicamente `en`; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion: inherente a un modelo de 1.4B; las metricas de MMLU (56.07) y ARC-C (47.70) indican un conocimiento factual y cientifico limitado.
- Sesgos: no documentados en la informacion disponible; al ser un derivado de Ouro-1.4B, hereda los sesgos del dataset de entrenamiento upstream, no descrito aqui.
- Restricciones de licencia: los pesos son Apache-2.0, pero el codigo de investigacion y las dependencias se rigen por `code/THIRD_PARTY_NOTICES.md`; conviene revisarlo antes de uso comercial.
- Trazabilidad de metricas: la tabla principal reporta metricas guardadas de la ejecucion que produjo el checkpoint, no una reevaluacion independiente; la model card advierte que `reference_results/` se mantiene fuera de los directorios de evaluacion para no suprimir nuevas evaluaciones.
- Ventanas de calibracion y evaluacion derivadas de WikiText-103: el rendimiento en dominios distintos (codigo, conversacion, idiomas no ingleses) no esta medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/review-artifacts-27/Loopy-Ouro-1.4B-W4A4-G32
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B
- Dataset de evaluacion: https://huggingface.co/datasets/Salesforce/wikitext
- Protocolo de evaluacion: `code/docs/protocol.md` (incluido en el repo)
- Notas de terceros y dependencias: `code/THIRD_PARTY_NOTICES.md` (incluido en el repo)
- Manifiesto de ficheros y hashes: `manifest.json` (incluido en el repo)
- Metadatos de procedencia: `provenance.json` (incluido en el repo)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.

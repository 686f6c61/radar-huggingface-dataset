# review-artifacts-27/Loopy-Huginn-0125-W4A4-G32

## Resumen

Loopy-Huginn-0125-W4A4-G32 es un checkpoint cuantizado derivado del modelo recurrente Huginn-0125 desarrollado por el grupo TOMG de la Universidad de Maryland (tomg-group-umd). El modelo aplica una cuantizacion de pesos a 4 bits (W4) y activaciones dinamicas a 4 bits por token (A4) sobre la arquitectura original, con un grupo de cuantizacion de 32 y una rotacion Hadamard de bloque 32. Se trata de un artefacto de investigacion publicado por el usuario review-artifacts-27, orientado a reproducir experimentos de cuantizacion sobre modelos recurrentes de profundidad variable.

La relevancia de este checkpoint reside en que Huginn es una familia de modelos de lenguaje recurrentes que sustituyen la profundidad de capas tradicional por iteraciones de un mismo bloque (recurrent depth), una linea de investigacion distinta a los transformers densos convencionales. Este release concreto permite evaluar el impacto de la cuantizacion agresiva W4A4 en este tipo de arquitecturas, con metricas guardadas de perplejidad y de tareas de razonamiento.

El repositorio ocupa 5,2 GB e incluye el codigo de carga personalizado, los artefactos de calibracion, las ventanas fijas de evaluacion y los resultados de referencia. No es un modelo pensado para uso directo en produccion con `from_pretrained()` generico, sino un paquete experimental reproducible con su propio loader.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje recurrente (recurrent depth), base Huginn-0125 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 4096 tokens (usado en la evaluacion WT2 document-level) |
| Tipos de cuantizacion | W4A4: pesos 4 bits, activaciones dinamicas 4 bits por token, grupo 32, rotacion Hadamard bloque 32 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (pesos); codigo de investigacion con avisos en `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dict PyTorch; codigos W4 en contenedores INT8 con escalas, zero points y signos Hadamard) |

## Arquitectura y entrenamiento

El modelo base Huginn-0125 pertenece a la familia Huginn, que implementa un transformer recurrente en profundidad: en lugar de apilar capas distintas, reutiliza un bloque compartido durante T=32 iteraciones de profundidad recurrente. Este checkpoint corresponde a la variante G32 de la tabla principal, con profundidad recurrente T=32 y grupo de cuantizacion de 32. La cuantizacion se aplica mediante rotacion Hadamard con semilla 2026 y potencia de escalado 0,8, seleccionada entre un pool de 80 candidatos; el candidato elegido es `s2026_p08_b32`.

El proceso de seleccion incluye calibracion, busqueda y evaluacion de calidad sobre grupos separados de 32 ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`). La evaluacion emplea cuantizacion falsa (fake quantization) en BF16; el release no utiliza almacenamiento INT4 empaquetado ni un kernel de inferencia INT4. W4A4 y W4A8 son selecciones separadas, y la precision de activacion no determina el dtype de almacenamiento del checkpoint. No se dispone de informacion sobre el dataset de preentrenamiento original, el numero de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento de sentido comun y conocimiento general, evaluado en WinoGrande, ARC-C, HellaSwag y MMLU.
- Comprension lectora y modelado de lenguaje a nivel de documento (evaluacion WT2 con contexto de 4096 tokens).
- Razonamiento multi-paso mediante profundidad recurrente (T=32 iteraciones del bloque compartido).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion sobre cuantizacion de modelos recurrentes: el checkpoint permite reproducir los experimentos W4A4 y comparar con las metricas de referencia en `reference_results/`, usando el loader incluido y los scripts `eval_wikitext.py` y `eval_tasks.py`.
- Evaluacion de robustez de arquitecturas recurrentes bajo cuantizacion agresiva: util para estudiar como afecta la profundidad recurrente T=32 a la degradacion por cuantizacion frente a transformers densos.
- Reproducibilidad de resultados academicos: el repositorio incluye `manifest.json` con digests SHA-256, `provenance.json` y registros por etapa de busqueda, lo que facilita la verificacion de experimentos.
- Modelado de lenguaje a nivel de documento: la evaluacion WT2 con ventanas de 4096 tokens sirve como banco de pruebas para tareas de perplejidad sobre documentos largos en ingles.
- Desarrollo de loaders personalizados: el paquete incluye un loader Loopy que inicializa la arquitectura base antes de cargar estrictamente el state dict, util como referencia para implementar cargas de checkpoints cuantizados no estandar.
- Estudio de calibracion y busqueda de hiperparametros de cuantizacion: los artefactos de calibracion y las 80 configuraciones candidatas permiten analizar el impacto de la semilla de rotacion y la potencia de escalado.
- Baseline para futuras tecnicas de cuantizacion: las metricas guardadas (PPL, exactitud en cinco tareas) sirven de punto de comparacion para nuevos metodos aplicados a modelos recurrentes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| WT2 word PPL (contexto 4096, document-level rolling) | 28,09 |
| LAMBADA PPL | 36,36 |
| LAMBADA acc. | 33,61 |
| WinoGrande | 51,46 |
| ARC-C (acc_norm) | 29,61 |
| HellaSwag (acc_norm) | 47,18 |
| MMLU | 24,76 |
| Media de exactitud (5 tareas, peso igual) | 37,32 |

Las exactitudes estan en porcentaje. La media pondera por igual las cinco tareas de exactitud. Las metricas en precision completa estan en `reference_results/`. No se proporcionan resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 5,2 GB, pero al no usar almacenamiento INT4 empaquetado ni kernel INT4, la inferencia requiere cargar el modelo base y aplicar cuantizacion falsa en BF16, lo que eleva el consumo de memoria por encima del tamano del checkpoint.
- GPU recomendadas: no disponible en la informacion; la evaluacion de referencia usa `CUDA_VISIBLE_DEVICES=0` con una sola GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano del modelo base Huginn-0125, no especificado.
- Opciones de despliegue: loader Loopy incluido en `code/` (entorno conda `loopy`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y se advierte explicitamente de no usar `from_pretrained()` generico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loopy-Huginn-0125-W4A4-G32 | no disponible | 4096 | W4A4, grupo 32, Hadamard 32 | Apache-2.0 | Hugging Face (repo de investigacion) |
| Huginn-0125 (base) | no disponible | no disponible | sin cuantizar | Apache-2.0 | Hugging Face (tomg-group-umd) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos recurrentes o cuantizados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo solo en ingles; no se documenta soporte multilingue.
- No es un checkpoint listo para produccion: requiere el loader Loopy incluido y no funciona con `from_pretrained()` generico de Transformers.
- La evaluacion usa cuantizacion falsa en BF16; no hay kernel INT4 ni almacenamiento empaquetado, por lo que el rendimiento en inferencia real no esta caracterizado.
- Las metricas de exactitud son bajas en terminos absolutos (media 37,32; MMLU 24,76), coherente con un modelo base pequeno o experimental y con cuantizacion agresiva W4A4.
- Riesgo de alucinacion no cuantificado en la informacion; no hay evaluaciones de seguridad ni de sesgo.
- La licencia Apache-2.0 aplica a los pesos, pero el codigo de investigacion y las dependencias tienen avisos propios en `code/THIRD_PARTY_NOTICES.md`; revisar antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y el autor es un artefacto de revision (`review-artifacts-27`), lo que sugiere que no ha pasado por validacion comunitaria extensa.
- No se especifican parametros totales, datos de entrenamiento ni si el modelo base uso RLHF/DPO, lo que limita la evaluacion de su procedencia.

## Enlaces

- Hugging Face: https://huggingface.co/review-artifacts-27/Loopy-Huginn-0125-W4A4-G32
- Modelo base: https://huggingface.co/tomg-group-umd/huginn-0125
- Dataset de evaluacion: https://huggingface.co/datasets/Salesforce/wikitext (revision `b08601e04326c79dfdd32d625aee71d232d685c3`)
- Protocolo de evaluacion: `code/docs/protocol.md` dentro del repositorio
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` dentro del repositorio
- Manifiesto de integridad: `manifest.json` dentro del repositorio
- Procedencia: `provenance.json` dentro del repositorio

# Shameless111/Loopy-Ouro-1.4B-W4A8-G32

## Resumen

Loopy-Ouro-1.4B-W4A8-G32 es un checkpoint cuantizado derivado del modelo base ByteDance/Ouro-1.4B, un modelo de lenguaje recurrente de 1.4 mil millones de parámetros desarrollado por ByteDance. El autor del derivado, Shameless111, ha aplicado una cuantización de pesos a 4 bits (W4) con activaciones dinámicas de 8 bits por token (A8), junto con una transformación de Hadamard de tamaño de bloque 128 y un tamaño de grupo de pesos de 32, dando lugar a la configuración que da nombre al checkpoint (G32).

La relevancia de esta ficha reside en que se trata de un experimento de cuantización de precisión mixta sobre una arquitectura recurrente, no sobre un transformer convencional. El checkpoint conserva la licencia Apache-2.0 del modelo original y mantiene el idioma de entrenamiento en inglés. El repositorio ocupa 1.9 GB e incluye no solo los pesos cuantizados, sino también el código de carga personalizado, los registros de búsqueda de la configuración seleccionada y las métricas de referencia.

El checkpoint seleccionado (`s123_p12_b128`) procede de un pool de 400 candidatos y fue escogido mediante un protocolo de evaluación fijo sobre ventanas de WikiText-103. Los pesos W4 se almacenan en contenedores INT8 junto con escalas, puntos cero, factores de escala de entrada y signos de Hadamard. Esta versión no utiliza empaquetado INT4 ni un kernel de inferencia INT4, lo que condiciona su despliegue práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje recurrente (recurrent-language-model); profundidad recurrente T=4 |
| Parametros totales | 1.4 mil millones (modelo base Ouro-1.4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluacion WT2 con PPL rodante a nivel de documento) |
| Tipos de cuantizacion | W4 (pesos a 4 bits) con activaciones dinamicas A8 por token; transformacion de Hadamard con bloque 128; grupo de pesos 32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (pesos); el codigo de investigacion adjunto se rige por `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dictionary de PyTorch); codigos W4 en contenedores INT8; tensores no cuantizados conservan su tipo flotante original |

## Arquitectura y entrenamiento

El modelo base es Ouro-1.4B de ByteDance, un modelo de lenguaje recurrente con profundidad recurrente T=4, lo que significa que el bloque computacional se aplica de forma iterada cuatro veces sobre la representacion latente. Esta arquitectura difiere del transformer apilado convencional y es la razon por la que el checkpoint requiere un loader personalizado: el repositorio incluye `code/` con el entorno Conda, el protocolo congelado y los scripts de evaluacion (`eval_wikitext.py`, `eval_tasks.py`).

El proceso de cuantizacion consistio en una busqueda sobre 400 candidatos, de los cuales se selecciono `s123_p12_b128` con semilla de rotacion 123, potencia de escalado 1.2, bloque de Hadamard de 128 y grupo de pesos de 32. La evaluacion se realiza con cuantizacion falsa (fake quantization) en BF16, no con un kernel INT4 real. Los datos de calibracion, busqueda y calidad provienen de grupos separados de 32 ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`), con procedencia registrada en `artifacts/window_manifest.json`.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset original ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Ouro-1.4B.
- Razonamiento y comprension de lenguaje evaluados en tareas de sentido comun y conocimiento (WinoGrande, ARC-C, HellaSwag, MMLU).
- Modelado de lenguaje a nivel de documento con ventana de 4096 tokens (metrica WT2 de PPL rodante).
- Carga mediante loader personalizado de Loopy, con soporte para evaluacion con precision de activacion configurable (`--a-bits 8`).
- Ejecucion de evaluaciones estandarizadas sobre LAMBADA, WinoGrande, ARC-Challenge, HellaSwag y MMLU mediante los scripts incluidos.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion en cuantizacion de arquitecturas recurrentes: el checkpoint permite reproducir el protocolo congelado y comparar selecciones W4A8 frente a W4A4 y frente a BF16, usando `reference_results/` como linea base.
- Evaluacion de impacto de precision mixta en modelos pequenos: con 1.4B parametros y metricas guardadas por tarea, sirve para estudiar como la cuantizacion W4 afecta tareas de sentido comun (WinoGrande, ARC-C, HellaSwag) frente a conocimiento (MMLU).
- Reproducibilidad de experimentos de calibracion: las ventanas fijas de WikiText-103 y los registros por etapa de busqueda en `artifacts/` permiten auditar como se eligio el candidato `s123_p12_b128` entre 400.
- Benchmarking de loaders personalizados: al requerir un loader Loopy en lugar de `from_pretrained()` generico, el repositorio es util para validar pipelines de carga estricta de state dictionaries sobre arquitecturas no estandar.
- Prototipado de modelado de lenguaje a nivel de documento: la ventana de 4096 tokens y la metrica WT2 permiten probar tareas de perplexity rodante en corpus largos en ingles.
- Verificacion de integridad de artefactos: `manifest.json` con tamanos y digests SHA-256 y `provenance.json` con el mapeo de hashes permiten validar la cadena de procedencia del checkpoint exportado.
- Estudio de tecnicas de rotacion y Hadamard: los parametros de semilla (123) y bloque (128) documentados permiten analizar el efecto de la rotacion en la calidad tras cuantizacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| WT2 word PPL (4096 contexto, PPL rodante a nivel de documento) | 12.77 |
| LAMBADA PPL | 6.00 |
| LAMBADA acc. | 62.12 |
| WinoGrande | 64.33 |
| ARC-C (acc_norm) | 52.05 |
| HellaSwag (acc_norm) | 70.38 |
| MMLU | 66.13 |
| Mean acc. (media de las cinco tareas de accuracy) | 63.00 |

Las accuracy se expresan en porcentaje. La media pondera por igual las cinco tareas de accuracy. La tabla recoge las metricas guardadas del experimento que produjo este checkpoint; las metricas de precision completa estan en `reference_results/`. No se proporcionan en la informacion disponible resultados de modelos comparables para contrastar estos valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. El repositorio ocupa 1.9 GB y los pesos W4 se almacenan en contenedores INT8, pero no se documenta una estimacion de VRAM en tiempo de ejecucion.
- GPU recomendadas: no disponible. Los scripts de evaluacion invocan `CUDA_VISIBLE_DEVICES=0`, lo que implica ejecucion en una unica GPU CUDA, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada. Al no usar kernel INT4 y requerir un loader personalizado con cuantizacion falsa BF16, el comportamiento en GPU de consumo no esta documentado.
- Opciones de despliegue: el repositorio incluye un entorno Conda propio (`environment.yml`) y scripts de evaluacion (`eval_wikitext.py`, `eval_tasks.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y se advierte explicitamente de que no debe usarse `from_pretrained()` generico sobre este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Loopy-Ouro-1.4B-W4A8-G32 | 1.4B | 4096 | Apache-2.0 | Hugging Face (Shameless111) | Checkpoint cuantizado W4A8 con loader personalizado |
| ByteDance/Ouro-1.4B | 1.4B | no disponible | Apache-2.0 (segun modelo base) | Hugging Face (ByteDance) | Modelo base recurrente sin cuantizar; revision `574fa66cb8bf5abdc979642d01cf2b79b16bfab1` |
| Otras selecciones Loopy (W4A4) | 1.4B | no disponible | Apache-2.0 | No disponible | Selecciones separadas de W4A8; la precision de activacion no determina el dtype de almacenamiento |
| Alternativas de 1.4B no recurrentes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de rendimiento comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El checkpoint no utiliza empaquetado INT4 ni un kernel de inferencia INT4; los codigos W4 se guardan en contenedores INT8 y la evaluacion se hace con cuantizacion falsa BF16. Esto implica que el rendimiento real de inferencia puede diferir de las metricas reportadas.
- Requiere un loader Loopy personalizado; un `from_pretrained()` generico de Transformers sobre este repositorio no funciona. El loader inicializa la arquitectura base antes de cargar estrictamente el state seleccionado.
- Idioma limitado a ingles (`en`); no se documenta soporte multilingue.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- La licencia Apache-2.0 aplica a los pesos; el codigo de investigacion y las dependencias adjuntas se rigen por `code/THIRD_PARTY_NOTICES.md`, que debe revisarse antes de uso comercial del codigo.
- El modelo base es de 1.4B parametros, lo que limita su capacidad en tareas de conocimiento y razonamiento complejo en comparacion con modelos de mayor escala; los resultados de MMLU (66.13) reflejan este techo.
- Las metricas corresponden a una unica seleccion (`s123_p12_b128`) de un pool de 400; no se garantiza que sea optima para todos los dominios.
- El contexto documentado de 4096 tokens esta asociado a la metrica WT2 de evaluacion; no se confirma como limite maximo arquitectonico del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face (checkpoint): https://huggingface.co/Shameless111/Loopy-Ouro-1.4B-W4A8-G32
- Modelo base en Hugging Face: https://huggingface.co/ByteDance/Ouro-1.4B
- Dataset de evaluacion (WikiText-103): https://huggingface.co/datasets/Salesforce/wikitext
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo independientes ni demos adicionales.

# DevMortimer/Warden-S1-752M-MLX-4bit

## Resumen

Warden-S1-752M-MLX-4bit es una cuantizacion en 4 bits para Apple Silicon (formato MLX) del modelo Warden-S1-752M (Stage 3.5), desarrollado por Ryan Joshua Z. Gapac y publicado en Hugging Face bajo el identificador DevMortimer. No es un modelo generativo de proposito general: es un clasificador especializado en verificacion de estados dentro de agentes de programacion (coding agents), etiquetado con el pipeline `text-classification` y orientado al paradigma "system-one" de evaluacion rapida de si un agente ha terminado, esta bloqueado o debe continuar.

El modelo emplea una arquitectura basada en gated-deltanet (segun las etiquetas del repositorio) con 752.393.024 parametros totales y soporte de contexto largo, hasta 128K tokens. Su propuesta de valor es la eficiencia extrema en memoria: el autor reporta una residencia en Metal de 867,4 MiB a 128K de contexto con KV en Q4 y un footprint en disco de 415,5 MiB, lo que permite multiplexar hasta 10 sesiones concurrentes de 64K-98K por debajo del limite de 1 GiB en un Apple M5 de 16 GB.

Es relevante ahora porque aborda un cuello de botella practico en pipelines de agentes: la verificacion de bajo coste y baja latencia en local, sin depender de la nube. El autor compara el modelo con un servicio en la nube llamado "Jev", reportando ventajas en AUROC, calibracion (ECE, Brier) y coste cero. La licencia es Apache-2.0, lo que facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-deltanet (segun etiquetas del repositorio); familia `qwen3_5` en los tags |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128K tokens (evaluado en el rango 4K-128K) |
| Tipos de cuantizacion | 4-bit (MLX); KV cache en Q8 y Q4 segun contexto; existe el modelo base BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

La informacion disponible indica una arquitectura de tipo gated-deltanet, una variante de modelos de estado recurrente con compuertas (delta networks), adecuada para contextos largos con coste computacional lineal. El repositorio base se etiqueta como `qwen3_5`, lo que sugiere una base de la familia Qwen 3.5 adaptada, aunque la model card no detalla la composicion exacta del backbone. El modelo es un clasificador de texto, no un generador: produce puntuaciones y decisiones (por ejemplo, AUROC de "Noul", Choice F1, Locus Top-1, Salience AUROC) sobre estados de agente.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El autor publica un dataset asociado, `DevMortimer/WardenS1-Bench`, usado para la evaluacion held-out en el rango 4K-128K. La innovacion tecnica destacable es la gestion de memoria: multiplexacion de 10 sesiones concurrentes con curacion de fronteras BPE de 2 tokens (22/22 aciertos curados), swap a RAM host con latencia p50 de 104,4 ms (22,5x mas rapido que una linea base numpy de 2.344 ms) y reanimacion en frio con zstd a 98K (3,13x de compresion). Tambien se reporta una aceleracion de turno caliente de 18,76x (1,59 s frente a 30,4 s) gracias a la complejidad O(Delta L) sobre contexto cacheado.

## Capacidades

- Clasificacion y verificacion de estados de agente: determina si una tarea esta terminada, bloqueada (`stuck`) o en curso (`done`/continuar).
- Puntuacion de confianza calibrada: reporta probabilidades con ECE bajo (0,0175 en la suite held-out), apta para umbrales de decision.
- Deteccion de saliencia y localizacion (`Locus Top-1`, `Salience AUROC`) sobre trazas largas.
- Abstención controlada: metrica de MAE de abstención de 0,0208, con 0,0% de sobreconfianza en abstención frente al servicio en la nube comparado.
- Soporte de contexto largo: evaluado de 4K a 128K tokens, con 100/100 peticiones aceptadas hasta 117K en la prueba head-to-head.
- Integracion como daemon local: expone endpoints HTTP (`POST /v1/systemone`, `GET /v1/models`, `GET /health`, `GET /stats`).
- Compatibilidad con herramientas de agente: `pi-warden`, `pi-typesafe` y `@typesafe-ai/sdk`.
- Capacidades multilingues: limitadas al ingles (`en`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio ni tool calling generativo.

## Casos de uso

- Verificacion de finalizacion en agentes de programacion: el modelo recibe el estado de una sesion de agente y decide si la tarea ha concluido o debe continuar, usando la senal `done`/`stuck` con una precision reportada del 85,0%-87,5% en `judge-bench` (OOD).
- Bucle de autocorreccion de agentes: integrado como paso de verificacion tras cada accion del agente, permite detectar bloqueos y forzar replanificacion sin llamar a un LLM grande en la nube, con coste cero y latencia local.
- Multiplexacion de sesiones en estaciones de trabajo Apple Silicon: con hasta 10 sesiones concurrentes de 64K-98K por debajo de 1 GiB de memoria Metal, es viable ejecutar verificacion para varios agentes en paralelo en un M5 de 16 GB.
- Filtrado y priorizacion de trazas largas: su capacidad de contexto de 128K y las metricas de saliencia permiten localizar los fragmentos relevantes de una traza extensa antes de pasarla a un modelo mayor.
- Evaluacion de reglas y politicas en agentes: en `rules-bench` (161 casos) alcanza un Recall@0.5 del 41,9% con 83,8% de precision y 8,2% de FPR, util para comprobar el cumplimiento de reglas en pipelines automatizados.
- Despliegue en CI/CD como servicio de validacion: el daemon local (`warden-s1 serve`) puede ejecutarse en runners con Apple Silicon para validar estados de agentes en pruebas de integracion, sin dependencias externas.
- Investigacion sobre calibracion: sus metricas de ECE y Brier lo hacen adecuado como banco de pruebas para estudiar calibracion en clasificadores de contexto largo.

## Benchmarks y rendimiento

| Suite / metrica | Resultado reportado |
|---|---|
| `WardenS1-Bench` held-out (4K-128K), Noul AUROC | 0,9957 (0,9947 en 80K-128K) |
| `WardenS1-Bench`, Choice F1 | 0,8726 |
| `WardenS1-Bench`, Score Spearman | 0,8814 |
| `WardenS1-Bench`, ECE | 0,0175 |
| `WardenS1-Bench`, CF Net | 0,9115 |
| `WardenS1-Bench`, Locus Top-1 | 0,9297 |
| `WardenS1-Bench`, Salience AUROC | 0,9998 |
| `WardenS1-Bench`, Abstention MAE | 0,0208 |
| Paridad BF16 vs MLX-Q4 (32 estados) | delta medio de probabilidad 0,00271; delta Noul 0,0183; acuerdo Locus Top-1 0,9844 |
| Head-to-head vs nube `Jev` (n=66 emparejados) | AUROC 0,9933 vs 0,9449; accuracy 96,1% vs 84,9%; Brier 0,0270 vs 0,0998; ECE 0,0269 vs 0,0734; sobreconfianza en abstención 0,0% vs 100,0%; 100/100 aceptadas hasta 117K vs 34% rechazadas mas alla de 33K; coste 0,00 USD |
| OOD `pi-warden` `judge-bench` (80 casos) | `stuck` accuracy 85,0%-87,5% (Brier 0,121-0,128); `done` recall 75,0%-80,0% |
| OOD `pi-warden` `rules-bench` (161 casos) | Recall@0.5 41,9% (7,75x Stage 2, 83,8% precision, 8,2% FPR); Recall@0.7 23,0% (85,0% precision, 4,1% FPR) |

No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo es un clasificador y no un generador.

## Requisitos de hardware

- VRAM / memoria unificada estimada (Apple Silicon, Metal): 842,9 MiB en regimen estable a 64K con KV en Q8; 867,4 MiB a 128K con KV en Q4.
- Footprint en disco: 415,5 MiB (415,4 MiB de pesos y cabezas en Metal; 404,3 MiB de backbone base).
- Hardware de referencia del autor: Apple M5 con 16 GB de memoria unificada y `mlx 0.32.4`.
- Multiplexacion: 10 sesiones concurrentes (6 x 64K Q8 + 2 x 80K Q4 + 2 x 98K Q4) con pico de 858,3 MiB, por debajo del techo de 1.024 MiB.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no se documenta soporte para GPU NVIDIA (CUDA) en la informacion disponible.
- Opciones de despliegue: daemon local `warden-s1 serve` (instalacion via `pip install "warden-s1[mlx]"`), libreria MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: turno caliente de 1,59 s frente a 30,4 s en frio (18,76x) con 60K cacheados y 2K de delta; swap a RAM host con p50 de 104,4 ms; reanimacion en frio con zstd a 98K con 3,13x de compresion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Warden-S1-752M-MLX-4bit | 752M | 128K | Clasificador de verificacion (MLX 4-bit) | Apache-2.0 | Hugging Face |
| Warden-S1-752M (BF16) | 752M | 128K | Clasificador de verificacion | Apache-2.0 | Hugging Face |
| Servicio en nube `Jev` (referencia del autor) | no disponible | rechaza el 34% mas alla de 33K | Verificacion remota | no disponible | Servicio en la nube |
| Clasificadores genericos de texto (familia Qwen 3.5, base) | no disponible | no disponible | Generacion / clasificacion | no disponible | Hugging Face |

La comparacion directa disponible es la del autor frente al servicio `Jev`: Warden-S1 supera en AUROC (0,9933 vs 0,9449), accuracy (96,1% vs 84,9%), Brier (0,0270 vs 0,0998) y ECE (0,0269 vs 0,0734), con coste cero y sin rechazos por longitud hasta 117K. No se dispone de comparativas con otros clasificadores open source de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo ingles (`en`); no se documenta soporte multilingue.
- Tarea restringida: es un clasificador de verificacion de estados de agente, no un modelo generativo; no debe usarse para generacion de texto, codigo o razonamiento general.
- Rendimiento OOD limitado: en `rules-bench` el Recall@0.5 cae al 41,9% y el Recall@0.7 al 23,0%, lo que indica margen de mejora en la deteccion de reglas fuera de distribucion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de falsos positivos/negativos en la clasificacion (FPR de 8,2% a umbral 0,5 y 4,1% a 0,7).
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse solo en ingles, puede degradarse con trazas en otros idiomas.
- Dependencia de plataforma: la cuantizacion MLX esta orientada a Apple Silicon; no se documenta soporte CUDA.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base y del dataset `WardenS1-Bench` antes de produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con creacion y actualizacion el mismo dia (24 de noviembre de 2026); conviene validar en el propio entorno antes de adoptarlo.
- Metricas autopublicadas: todos los resultados provienen de la model card del autor; no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevMortimer/Warden-S1-752M-MLX-4bit
- Modelo base: https://huggingface.co/DevMortimer/Warden-S1-752M
- Dataset de evaluacion: https://huggingface.co/datasets/DevMortimer/WardenS1-Bench
- Escrito del autor sobre Warden-S1: https://ryanjoshuagapac.com/writing/warden-s1
- ORCID del autor: https://orcid.org/0009-0004-2591-0219
- Contacto del autor: mail@ryanjoshuagapac.com

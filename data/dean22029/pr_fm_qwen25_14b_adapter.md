# dean22029/pr_fm_qwen25_14b_adapter

## Resumen

`dean22029/pr_fm_qwen25_14b_adapter` es un adaptador QLoRA (PEFT) entrenado sobre `Qwen/Qwen2.5-14B-Instruct` para una única tarea: predecir el resultado de experimentos conjoint de elección forzada. Dado el contexto de un estudio (descripción, país, año), las características del encuestado y dos perfiles (opción A y opción B), el modelo puntúa qué perfil eligió ese encuestado. No es un modelo conversacional de propósito general: está ajustado para emitir un único token de respuesta (`A` o `B`), y su uso previsto es servir como línea base de investigación en ciencias sociales computacionales.

El adaptador se entrenó sobre 711.617 pares de elección construidos a partir del paquete de datos `preference_fm` (127 experimentos, 115 utilizables), todos con año de experimento anterior o igual a 2021. Se distribuye como pesos de adaptador LoRA en safetensors (0,3 GB), con licencia Apache 2.0, y requiere cargar por separado el modelo base de 14.000 millones de parámetros.

Su relevancia es metodológica más que de producto: es un ejemplo reproducible de cómo sustituir modelos de elección clásicos (logit condicional, logit mixto) por un LLM ajustado con LoRA para modelar preferencias a nivel de encuestado, incluyendo scripts de pipeline para exportar, construir el dataset y evaluar. La model card advierte explícitamente de que el ajuste fino mejora sobre todo la calibración, no la discriminación, y de que los resultados por experimento son muy heterogéneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder denso (Qwen2.5-14B-Instruct); sin arquitectura propia |
| Parametros totales | 14.000 millones en el modelo base; recuento exacto de parametros del adaptador no disponible (LoRA r=16, alpha=32, dropout 0.05) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de secuencia maxima durante el entrenamiento del adaptador; ventana nativa del modelo base no detallada en la informacion disponible |
| Tipos de cuantizacion | Base cargada en 4-bit NF4 con doble cuantizacion y computo en bf16 (QLoRA). Los pesos del adaptador se distribuyen en safetensors |
| Idiomas soportados | No disponibles (el corpus de entrenamiento son experimentos conjoint, mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, con `adapter_config.json`); requiere el modelo base aparte |

## Arquitectura y entrenamiento

El adaptador no modifica la arquitectura del modelo base (Qwen2.5-14B-Instruct, transformer decoder denso). Se aplica LoRA con rango 16 y alpha 32 sobre las proyecciones `q, k, v, o, gate, up, down_proj`. El entrenamiento usó QLoRA: base cuantizada en 4-bit NF4 con doble cuantizacion y computo en bf16, optimizador `paged_adamw_8bit`, learning rate 1e-4 con scheduler coseno y 3% de warmup, batch por dispositivo de 4 (efectivo ~120) en A100 40 GB con DDP, 6.000 pasos, 1,01 epocas sobre 711.617 pares, longitud maxima de secuencia 1024 y perdida enmascarada al token de respuesta del asistente.

La innovacion tecnica relevante no esta en el modelo sino en el protocolo de evaluacion y en el formato de entrada. La puntuacion se hace con una sola pasada forward: se toma `logits[:, -1, :]`, se indexan los identificadores de token unico de `"A"` y `"B"` y se aplica softmax sobre esos dos logits para obtener P(A). El chat template se aplica con `add_generation_prompt=True` y la tokenizacion con `add_special_tokens=False`; para puntuar en lote se usa `padding_side="left"`. La orientacion A/B se aleatoriza por par en los datos de entrenamiento, de modo que una evaluacion con orden fijo reintroduce sesgo de posicion. El adaptador se debe cargar sobre el modelo base ya cuantizado en 4-bit: cargar la base en bf16 desplaza las metricas publicadas.

Las etiquetas de entrenamiento son un unico caracter. El prompt de sistema y la estructura del bloque de usuario estan fijados literalmente; parafrasearlos o reordenar los campos saca al modelo de distribucion.

## Capacidades

- Puntuacion de eleccion forzada entre dos perfiles conjoint: devuelve P(A) mediante una pasada forward, sin generacion autoregresiva.
- Condicionamiento en covariables del encuestado: acepta pares nombre-valor de caracteristicas del respondiente junto al contexto del estudio (pais, ano, descripcion).
- Modelado de atributos y niveles: procesa los factores y niveles de cada perfil como lista estructurada.
- Evaluacion comparativa frente a linea base zero-shot: los mismos prompts sobre el modelo base sin adaptador estan soportados por el pipeline incluido.
- Reproducibilidad del pipeline: scripts en `pipeline/` para exportar experimentos desde R (`experiment.rds` a JSON), generar codebooks, construir prompts y splits, y evaluar el adaptador.
- No soporta tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de pensamiento.
- No es un modelo de chat: no se ha entrenado para generar texto libre, resumir, traducir ni responder preguntas generales.
- Capacidad multilingue: no documentada.

## Casos de uso

- Linea base academica en ciencias politicas y economia del comportamiento: comparar un LLM ajustado con LoRA frente a logit condicional o logit mixto sobre los mismos experimentos conjoint, usando AUC y log loss como metricas de referencia.
- Simulacion de encuestados sinteticos para pre-test de disenos experimentales: generar elecciones sinteticas bajo un diseno candidato (nuevos atributos y niveles) y detectar combinaciones de niveles que producen distribuciones de eleccion degeneradas antes de gastar presupuesto de campo.
- Analisis de heterogeneidad entre estudios: el desglose `by_experiment` permite identificar en que estudios el modelo predice por encima o por debajo del azar (AUC desde por debajo de 0,5 hasta ~0,94) y correlacionarlo con caracteristicas del diseno.
- Imputacion de elecciones en experimentos con respuestas perdidas: puntuar los pares sin etiqueta y usar P(A) como variable latente para analisis de sensibilidad, dado que el modelo fue entrenado para estimar probabilidades calibradas.
- Auditoria de sesgo de posicion y de orden: ejecutar cada par en ambas orientaciones A/B y medir la diferencia sistematica de P(A) como diagnostico del diseno del cuestionario.
- Control de calidad de estimulos conjoint: ordenar pares por log loss o Brier score y revisar manualmente los casos donde el modelo asigna probabilidades extremas contra la etiqueta registrada, lo que suele senalar errores de codificacion de niveles.
- Transferencia a nuevos corpus: reutilizar el pipeline (`export_experiments.R`, `make_codebooks.py`, `build_dataset.py`, `evaluate_qlora.py`) para entrenar adaptadores equivalentes sobre otros paquetes de experimentos manteniendo la misma interfaz de evaluacion.
- Docencia y formacion en metodologia: usar el repositorio como caso reproducible de extremo a extremo de ajuste QLoRA con evaluacion por pares y control de fuga temporal mediante corte por ano.

## Benchmarks y rendimiento

Resultados publicados en la model card. Evaluacion con una pasada forward por par, sin generacion, sobre base en 4-bit NF4. La tasa base de la etiqueta es ~50% por construccion, por lo que el log loss nulo es 0,693 y la exactitud es exactitud de ganador del par. `zeroshot` es el mismo modelo base sin adaptador, con los mismos prompts.

| Split | Run | n pares | Accuracy | AUC | Log loss | Delta vs nulo | Brier |
|---|---|---|---|---|---|---|---|
| `test_chrono` | finetuned | 58.910 | 0,598 | 0,633 | 0,6696 | 0,0235 | 0,2382 |
| `test_chrono` | zeroshot | 58.910 | 0,573 | 0,620 | 3,1876 | -2,4945 | 0,3907 |
| `test_within` | finetuned | 61.120 | 0,654 | 0,716 | 0,6164 | 0,0767 | 0,2142 |
| `test_within` | zeroshot | 61.120 | 0,542 | 0,569 | 3,1059 | -2,4127 | 0,4075 |

Exactitud de eleccion en validacion durante el entrenamiento: 0,632 en el paso 2.000; 0,637 en el paso 4.000; 0,647 en el paso 6.000. La curva es plana en las ultimas evaluaciones, por lo que el limite de pasos no parece dejar exactitud sin aprovechar.

Advertencias de lectura incluidas por el autor: el ajuste fino compra principalmente calibracion, no discriminacion (los modelos base zero-shot ya ordenan los pares de forma similar, pero con log loss muy superior al nulo porque se concentran cerca de una sola letra); y los resultados por experimento son muy heterogeneos: el dato global de `test_chrono` es una media sobre 31 estudios cuyos AUC individuales van desde por debajo del azar hasta ~0,94. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: la configuracion de referencia es base en 4-bit NF4; con 14.000 millones de parametros y secuencias de hasta 1024 tokens, se estima un consumo del orden de 10-12 GB de VRAM. Cargar la base en bf16 requiere aproximadamente 28 GB solo para pesos, mas activaciones y cache.
- GPU recomendadas: A100 40 GB (la usada en el entrenamiento, con DDP), H100 o A100 80 GB para puntuar en bf16 con lotes grandes. Para 4-bit NF4, una unica GPU de 16-24 GB es suficiente.
- Cabe en GPU de consumo: si, en 4-bit. RTX 4090 o RTX 3090 (24 GB) con margen amplio; RTX 4080 / 4070 Ti Super (16 GB) con lotes pequenos y secuencia de 1024; tarjetas de 12 GB quedan al limite y probablemente exijan descarga parcial de capas.
- Opciones de despliegue: `transformers` con PEFT, cargando primero el modelo base y despues el adaptador, tal como hace `eval_example.py` del repositorio. Alternativas genericas para servir adaptadores LoRA, como vLLM o TGI, no se documentan en la informacion disponible para este adaptador concreto.
- Latencia y throughput: no disponibles. El flujo de evaluacion es una unica pasada forward por par (sin decodificacion autoregresiva), lo que reduce el coste respecto a la generacion token a token; no se publican cifras de pares por segundo.
- Requisito de reproducibilidad: para replicar las metricas hay que mantener la base en 4-bit con la configuracion indicada. Cambiar la precision de la base altera los numeros.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros modelos publicados comparables en esta categoria (adaptadores de modelado de eleccion conjoint sobre LLM). La comparacion relevante que si aporta el autor es contra el propio modelo base sin adaptador y contra la referencia nula.

| Sistema | Parametros | Contexto | `test_chrono` AUC | `test_chrono` log loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (QLoRA, 4-bit NF4) | 14B base + LoRA r=16 | 1024 tokens de entrenamiento | 0,633 (acc 0,598) | 0,6696 | Apache 2.0 | Publico en HuggingFace (0 descargas, 0 likes) |
| Qwen2.5-14B-Instruct zero-shot | 14B | ventana nativa del base, no detallada | 0,620 (acc 0,573) | 3,1876 | Apache 2.0 (modelo base) | Publico en HuggingFace |
| Referencia nula (tasa base 50%) | no aplica | no aplica | 0,500 | 0,693 | no aplica | no aplica |
| Modelos de eleccion clasicos (logit condicional / mixto) | no disponible | no aplica | no disponible | no disponible | no aplica | no aplica |

Del mismo paquete `preference_fm` se mencionan otros adaptadores entrenados con la misma receta ("these adapters"), pero no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un chat de proposito general, esta ajustado sobre un unico token de respuesta y solo realiza clasificacion binaria de eleccion entre dos perfiles.
- Sensibilidad extrema al prompt: el adaptador se entreno exactamente con la superficie documentada; parafrasear el prompt de sistema o reordenar el bloque de usuario lo saca de distribucion.
- El ajuste fino mejora sobre todo la calibracion: la mejora en discriminacion sobre el zero-shot es modesta (AUC 0,633 frente a 0,620 en `test_chrono`; 0,716 frente a 0,569 en `test_within`), y la exactitud absoluta se queda en 0,598 y 0,654.
- Heterogeneidad por experimento muy alta: los AUC individuales de los 31 estudios de `test_chrono` van desde por debajo del azar hasta ~0,94; citar solo la media puede enganar.
- Sesgo de posicion: si no se aleatoriza la orientacion A/B o no se promedian ambas orientaciones, reaparece el sesgo de posicion. El entrenamiento si estaba aleatorizado.
- Fuga temporal potencial: el entrenamiento uso todos los experimentos con `experiment_year <= 2021`; cualquier conjunto de test construido con un corte inferior se solapa con los datos de entrenamiento. Hay que consultar `SPLITS.md` antes de comparar cifras.
- Dependencia de la precision: cargar la base en bf16 en lugar de 4-bit NF4 desplaza los resultados publicados.
- Datos no redistribuibles: el paquete `preference_fm` no se incluye y 113 de sus 127 experimentos no declaran licencia; los archivos de replicacion originales provienen de Dataverse y fuentes similares con terminos propios. Reproducir el entrenamiento exige una copia propia del paquete.
- Sesgos de dominio: al modelar respuestas de encuestados reales en estudios de opinion y comportamiento, el adaptador puede reproducir patrones sesgados presentes en los datos originales por pais, ano, atributos sociodemograficos o diseno experimental. No se documenta ninguna evaluacion de equidad.
- Riesgo de alucinacion: bajo en el formato previsto (la salida se restringe a los logits de `A` y `B`), pero la puntuacion puede ser arbitraria fuera de distribucion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa independiente de los numeros reportados.
- Idiomas soportados y comportamiento multilingue: no documentados. Uso comercial permitido por Apache 2.0 en lo que respecta al adaptador, pero la licencia de los datos de entrenamiento es una cuestion aparte.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/dean22029/pr_fm_qwen25_14b_adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Scripts de pipeline incluidos en el repositorio: `pipeline/export_experiments.R`, `pipeline/make_codebooks.py`, `pipeline/build_dataset.py`, `pipeline/evaluate_qlora.py`
- Script de ejemplo de puntuacion: `eval_example.py` (en el repositorio)
- Registro de splits: `SPLITS.md` y `splits_summary.csv` (en el repositorio)
- Historial de entrenamiento: `log_history.json` (en el repositorio)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (unicamente paginas corporativas de Microsoft sin relacion con la ficha); papers, blogs o demos adicionales: no disponibles.

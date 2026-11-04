# FraunhoferHHI/llama-3.3-70b-instruct-transcoders

## Resumen

`FraunhoferHHI/llama-3.3-70b-instruct-transcoders` no es un modelo generativo, sino un conjunto de artefactos de interpretabilidad mecanicista: transcoders dispersos por capa (skip transcoders) entrenados sobre las 80 capas MLP de `meta-llama/Llama-3.3-70B-Instruct`. Cada transcoder lee la activacion de entrada del MLP (`mlp.hook_in`, salida de `post_attention_layernorm`) y predice su salida (`mlp.hook_out`, antes de la suma residual), descomponiendo la computacion del MLP en caracteristicas dispersas interpretables. El paquete lo publica FraunhoferHHI en formato `transcoder_set` de la libreria `circuit-tracer`.

La relevancia es practica para quien hace circuit tracing sobre Llama 3.3 70B: permite sustituir los MLP del modelo por aproximaciones dispersas y trazar atribuciones a nivel de caracteristica. La expansion es de 8x (d_model 8192 a d_transcoder 65536), con pesos en bfloat16 y conexion skip lineal (`W_skip`). El repo ocupa 182,6 GB y los 80 ficheros de capa suman unos 171 GB.

El autor advierte de que los transcoders estan infraentrenados frente a referencias publicadas en modelos de 1-2B: FVU medio de 0,506 en el conjunto de las 80 capas, con L0 cercano a 29,5 y un 11,5% de caracteristicas que nunca se activan. En las 7 capas donde el MLP tiene peso real (ΔCE >= 0,1 nats), la mediana de CE recuperada es 0,91.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Skip transcoders dispersos por capa sobre MLP de transformer (Llama 3.3 70B); BatchTopK en entrenamiento, exportados con umbrales JumpReLU por caracteristica |
| Parametros totales | No disponible (80 transcoders; repo de 182,6 GB, ~171 GB en ficheros de capa) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible; pesos en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | llama3.3 |
| Formato de pesos | Ficheros por capa en formato `transcoder_set` de `circuit-tracer`; dtype bfloat16 |
| d_model | 8192 |
| d_transcoder | 65536 (expansion 8x) |
| Capas cubiertas | 80 (todas las MLP de Llama 3.3 70B) |
| Modelo base | meta-llama/Llama-3.3-70B-Instruct |

## Arquitectura y entrenamiento

Cada transcoder es un autoencoder disperso que aproxima la funcion del MLP de una capa concreta: recibe la activacion post-layernorm (`mlp.hook_in`), la proyecta a un espacio disperso de 65536 caracteristicas y reconstruye la salida del MLP (`mlp.hook_out`) mediante una suma lineal, complementada con una conexion skip lineal (`W_skip`) que captura la componente lineal de la transformacion. El entrenamiento usa BatchTopK para imponer dispersidad y los artefactos exportados aplican umbrales JumpReLU por caracteristica. Los pesos operan sobre activaciones crudas del modelo, con la normalizacion de entrenamiento plegada en los pesos.

El presupuesto de entrenamiento es de 1,75B tokens por capa. El autor lo compara explicitamente con skip transcoders publicados sobre modelos de 1-2B parametros, que alcanzan FVU de 0,16-0,33 pero con expansion de 28-32x y unos 8B tokens; en consecuencia, estos transcoders son usables pero estan infraentrenados en terminos relativos. No se menciona uso de RLHF/DPO (no aplica a un artefacto de interpretabilidad).

## Capacidades

- Reconstruccion y descomposicion dispersa de la salida de cada una de las 80 capas MLP de Llama 3.3 70B.
- Trazado de circuitos (circuit tracing) y atribucion a nivel de caracteristica mediante `circuit-tracer` y el backend `nnsight`.
- Analisis de cobertura del diccionario: metricas por capa de FVU, L0 y porcentaje de caracteristicas nunca activadas.
- Evaluacion del impacto causal de cada MLP mediante ablacion y CE recuperada (ΔCE y ratio).
- No realiza generacion de texto, razonamiento, codigo ni tool calling por si mismo: es un artefacto de analisis sobre el modelo base.
- No soporta vision, audio ni modos de pensamiento.

## Casos de uso

- Analisis de mecanismos internos de Llama 3.3 70B: sustituir los MLP por los transcoders con `ReplacementModel` y trazar que caracteristicas contribuyen a una prediccion concreta en tareas de interpretabilidad.
- Estudio de la evolucion por profundidad: comparar FVU, L0 y fraccion de caracteristicas muertas entre bandas de capas (por ejemplo, FVU 0,308 en capas 0-9 frente a 0,630 en 50-59) para caracterizar donde la representacion MLP es mas o menos comprimible.
- Auditoria de seguridad y alineacion: identificar caracteristicas asociadas a comportamientos concretos y analizar su peso en la salida del modelo base.
- Investigacion academica en interpretabilidad mecanicista: usar el conjunto como referencia reproducible de transcoders a escala 70B, con metricas por capa publicadas para comparacion.
- Analisis de capas criticas: emplear la columna ΔCE para localizar las capas donde el MLP tiene impacto real (por ejemplo, capa 0 con ΔCE 7,37 y capa 3 con 7,14) y priorizar el estudio en ellas.
- Diagnostico de cobertura de diccionarios: usar las fracciones de caracteristicas muertas (46,2% de media en capas 70-79; 59-79% en L74-L77) para decidir si conviene reentrenar o redimensionar el diccionario en esas capas.

## Benchmarks y rendimiento

Evaluaciones de reconstruccion y relevancia publicadas por el autor sobre texto held-out, con los pesos JumpReLU exportados. `ΔCE` = CE(MLP ablacionado) − CE(limpio); la CE recuperada solo se reporta cuando ΔCE es suficientemente distinto de cero.

| Metrica | Valor |
|---|---|
| FVU media (80 capas) | 0,506 (min 0,030, max 0,657) |
| L0 medio (JumpReLU) | ~29,5 |
| Caracteristicas nunca activadas (media) | 11,5% |
| CE recuperada (mediana, 7 capas con ΔCE >= 0,1 nats) | 0,91 |

| Bandas de capas | FVU (media) | L0 (media) | Muertas % (media) |
|---|---|---|---|
| 0-9 | 0,308 | 29,1 | 17,1 |
| 10-19 | 0,432 | 29,4 | 9,4 |
| 20-29 | 0,527 | 30,0 | 0,9 |
| 30-39 | 0,530 | 30,6 | 1,3 |
| 40-49 | 0,591 | 28,1 | 1,0 |
| 50-59 | 0,630 | 28,2 | 2,1 |
| 60-69 | 0,613 | 29,0 | 13,7 |
| 70-79 | 0,421 | 31,6 | 46,2 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a un artefacto de interpretabilidad.

## Requisitos de hardware

- El repositorio ocupa 182,6 GB y los 80 ficheros de capa suman unos 171 GB en bfloat16.
- La atribucion sobre el modelo completo requiere repartir los pesos entre varias GPU, segun indica el autor.
- Cabe en GPU de centro de datos: A100 80 GB, H100 80 GB y configuraciones multi-GPU (por ejemplo, 3-4 A100/H100 para alojar los transcoders junto con el modelo base).
- No cabe en GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) ni siquiera en configuracion de una sola unidad; el modelo base de 70B ya excede esa VRAM en bfloat16.
- Despliegue mediante la libreria `circuit-tracer` con backend `nnsight`; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Modelo base | Expansion | Tokens de entrenamiento | FVU | Licencia |
|---|---|---|---|---|---|
| Este conjunto (FraunhoferHHI) | Llama 3.3 70B | 8x | 1,75B por capa | 0,506 (media) | llama3.3 |
| Skip transcoders publicados en modelos 1-2B (referencia citada por el autor) | Modelos de 1-2B | 28-32x | ~8B | 0,16-0,33 | no disponible |

No se dispone en la informacion proporcionada de otros conjuntos de transcoders comparables a escala 70B con metricas publicadas.

## Limitaciones y advertencias

- FVU de 0,5-0,65 en la parte media de la red: reconstruccion mediocre frente a referencias en modelos pequenos; el autor califica los transcoders de infraentrenados.
- Elevada fraccion de caracteristicas nunca activadas en las capas mas profundas: L74-L77 entre 59% y 79%; en capas 70-79 la media es 46,2%. El diccionario esta sobredimensionado en esas capas (FVU bajo, L78 0,030 y L79 0,063).
- Bolsas de caracteristicas muertas en la parte media: capas L8-L12 con 30-34% nunca activadas.
- La CE recuperada por capa esta mal condicionada: ablacionar un solo MLP en un modelo de 80 capas a menudo cambia la CE en menos de 0,02 nats; 14 de 80 capas dan valores fuera de [0, 1]. Usar la columna ΔCE para decidir si la metrica es interpretable.
- No es un modelo generativo: no debe emplearse para inferencia de texto, codigo o agentes.
- Licencia llama3.3: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia de Llama 3.3, que se heredan del modelo base.
- Riesgo de alucinacion y sesgos: no aplica directamente al artefacto, pero las caracteristicas aprendidas reflejan los sesgos y el comportamiento del modelo base Llama 3.3 70B.
- Coste de infraestructura elevado: requiere varias GPU para cargar modelo base y transcoders simultaneamente.

## Enlaces

- HuggingFace: https://huggingface.co/FraunhoferHHI/llama-3.3-70b-instruct-transcoders
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Libreria circuit-tracer: https://github.com/safety-research/circuit-tracer
- nnsight: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

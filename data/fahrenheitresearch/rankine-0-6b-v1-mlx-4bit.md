# FahrenheitResearch/Rankine-0.6B-v1-mlx-4bit

## Resumen

Rankine 0.6B v1 es un modelo de clasificacion de texto desarrollado por Fahrenheit Research que reformula el problema de la clasificacion como un motor de decisiones probabilisticas tipadas. No devuelve una unica etiqueta, sino una distribucion de probabilidad sobre opciones con nombre, niveles de rubrica ordenados o proposiciones booleanas. El modelo parte del backbone Qwen/Qwen3-0.6B (Apache-2.0), sobre el que se aplica un fine-tune LoRA que despues se fusiona en el backbone y se cuantiza a 4 bits en formato MLX con group size 64. El resultado es un artefacto de 320 MiB de pesos que se ejecuta en Apple Silicon.

La relevancia del modelo esta en su planteamiento: el conocimiento de dominio llega dentro de la propia entrada en tiempo de inferencia, de modo que un unico modelo cubre flujos de trabajo distintos sin reentrenamiento. Soporta hasta 255 marcadores de un solo token por pregunta y una ventana de contexto de 40.960 tokens, lo que permite procesar estados no estructurados largos (trazas de agente, facturas, incidencias) y responder simultaneamente a todas las preguntas tipadas sobre ese estado.

Sus numeros declarados en el split de test de `LocalLLaMA/typed-decisions` son 0,743 de accuracy, 0,605 de macro F1 y un error de calibracion esperado (ECE) de 0,154 sobre 2.000 decisiones. Es un modelo de nicho, con 16 descargas y 0 likes en el momento de la consulta, pensado como verificador o motor de decision dentro de pipelines, no como generador de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (backbone Qwen/Qwen3-0.6B) con fine-tune LoRA fusionado; cuantizacion MLX de 4 bits, group size 64 |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | 4-bit MLX (group size 64); existen adaptadores fp16 sin publicar (referenciados en la model card como "unshipped fp16") |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 0,3 GB (331 MiB, de los cuales 320 MiB son pesos) |
| Pipeline declarado | text-classification |
| Primitivas de salida | `choice`, `score`, `noul` |
| Opciones por pregunta | hasta 255 marcadores de un solo token |
| Modelo base | Qwen/Qwen3-0.6B |
| Dataset de evaluacion | LocalLLaMA/typed-decisions (split test) |
| Descargas / likes | 16 / 0 (en el momento de la consulta) |
| Fecha de creacion / actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso heredado de Qwen3-0.6B. Sobre ese backbone se aplica un ajuste LoRA que posteriormente se fusiona en los pesos base, y despues se cuantiza a 4 bits con la libreria MLX usando group size 64. No hay Mezcla de Expertos, atencion lineal ni decodificacion especulativa documentada en la informacion disponible. La innovacion no esta en el backbone sino en la interfaz de salida: el modelo trabaja con tres primitivas tipadas. `choice` devuelve una distribucion sobre opciones con nombre; `score` devuelve una distribucion sobre niveles de rubrica ordenados mas una puntuacion esperada que puede caer entre niveles; `noul` devuelve la probabilidad de que una proposicion se cumpla. Toda respuesta es, por tanto, una distribucion y no una etiqueta unica.

En cuanto a los datos, la model card no detalla el volumen de tokens ni la composicion del corpus de entrenamiento; solo indica que el ajuste se evalua sobre `LocalLLaMA/typed-decisions`, un conjunto con 400 casos y 2.000 decisiones repartidas en cuatro flujos (agent_trace_observability, customer_service, invoice_processing, security_incidents). Las etiquetas de referencia (gold) se construyen como la media de tres muestras de un endpoint maestro, y la propia model card fija el techo de auto-acuerdo de ese maestro en 0,735 de accuracy, un valor que el modelo cuantizado a 4 bits supera ligeramente (0,743), lo que sugiere que el error residual restante corresponde mayoritariamente a la dispersion del propio maestro y no a una mala lectura del estado de entrada. No se documenta RLHF ni DPO.

## Capacidades

- Clasificacion con salida probabilistica: devuelve distribuciones completas en lugar de etiquetas discretas, lo que permite umbralizar, ordenar por confianza o encadenar decisiones.
- Primitiva `choice`: distribucion sobre opciones con nombre (por ejemplo, categoria de una incidencia o motivo de contacto).
- Primitiva `score`: distribucion sobre niveles ordenados de rubrica mas una puntuacion esperada continua, util para evaluaciones graduadas.
- Primitiva `noul`: probabilidad de que una proposicion se cumpla (verificacion binaria probabilistica).
- Procesamiento de estado no estructurado: lee una unica pieza de estado y responde a todas las preguntas tipadas sobre ella en una sola pasada.
- Definiciones de dominio en tiempo de inferencia: los esquemas y el conocimiento del flujo de trabajo viajan dentro del propio input, sin reentrenamiento.
- Capacidad de verifier: la model card lo etiqueta explicitamente como verificador dentro de un pipeline.
- Hasta 255 opciones por pregunta mediante marcadores de un solo token.
- Ventana de contexto de 40.960 tokens para estados largos.
- Clasificacion de trazas de agente, conversaciones de atencion al cliente, facturas e incidentes de seguridad (los cuatro flujos evaluados).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, vision, audio ni modo "thinking". La funcion del modelo es clasificar y puntuar, no generar texto libre.

## Casos de uso

- Observabilidad de trazas de agente: dado un registro de ejecucion de un agente, el modelo puede emitir simultaneamente distribuciones sobre si la tarea se completo, si hubo un fallo de herramienta o si el resultado requiere revision humana. En el split de test obtiene 0,738 de accuracy y un `within_1` de 1,000 en este flujo, el mejor de los cuatro.
- Atencion al cliente automatizada: clasificar conversaciones multi-turno por intencion, sentimiento o riesgo de escalado. Con 40.960 tokens de contexto cabe un historial largo completo, y las salidas probabilisticas permiten derivar a un humano cuando la confianza cae por debajo de un umbral.
- Procesamiento de facturas: extraccion de decisiones tipadas sobre documentos recibidos (si la factura es valida, si cuadra con el pedido, en que nivel de riesgo de fraude cae). Es el flujo con mayor accuracy declarada (0,800) aunque su `score_mae` de 0,305 es el mas alto de los cuatro.
- Triaje de incidentes de seguridad: asignar severidad y probabilidad de que una alerta sea un falso positivo. Es el flujo mas debil del modelo en macro F1 (0,439), por lo que conviene usarlo como senal auxiliar y no como decision final en este dominio.
- Enrutamiento de peticiones entre modelos: usar la salida de `choice` para decidir a que modelo o herramienta derivar una consulta, con la distribucion como medida de incertidumbre para activar un fallback.
- Verificacion de salidas de otro modelo: aplicar `noul` para comprobar si una afirmacion o una respuesta generada cumple una proposicion, aprovechando que la primitiva `noul` es la de mejor rendimiento (0,830 de accuracy y 0,784 de macro F1).
- Puntuacion automatica con rubricas: usar `score` para evaluar respuestas abiertas en un rango ordenado y obtener una puntuacion esperada continua, util en evaluacion de calidad o QA interno.
- Moderacion y etiquetado a escala: al ser un modelo de 0,6B y 320 MiB de pesos, puede desplegarse localmente en Apple Silicon para etiquetar grandes volumenes de texto sin coste por token de API.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de `LocalLLaMA/typed-decisions` (400 casos, 2.000 decisiones), sin verificacion independiente (`verified: false`). Latencia P50 de 99 ms por caso en Apple M5.

| Modelo | n | Accuracy | Soft accuracy | Macro F1 | KL | TV | Brier | ECE | Score MAE | Within 1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Rankine v1, 4-bit (este modelo) | 2000 | 0,743 | 0,546 | 0,605 | 0,122 | 0,173 | 0,067 | 0,154 | 0,256 | 0,971 |
| Rankine v1, adaptadores fp16 (sin publicar) | 2000 | 0,764 | 0,567 | 0,647 | 0,102 | 0,153 | 0,056 | 0,159 | 0,229 | 0,974 |

Desglose por flujo de trabajo (4-bit):

| Flujo | n | Accuracy | Soft accuracy | Macro F1 | KL | TV | Brier | ECE | Score MAE | Within 1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| agent_trace_observability | 500 | 0,738 | 0,500 | 0,634 | 0,094 | 0,159 | 0,055 | 0,204 | 0,204 | 1,000 |
| customer_service | 500 | 0,730 | 0,553 | 0,657 | 0,161 | 0,196 | 0,088 | 0,129 | 0,265 | 0,995 |
| invoice_processing | 500 | 0,800 | 0,621 | 0,613 | 0,137 | 0,182 | 0,070 | 0,144 | 0,305 | 0,935 |
| security_incidents | 500 | 0,704 | 0,511 | 0,439 | 0,095 | 0,156 | 0,056 | 0,140 | 0,251 | 0,955 |

Desglose por primitiva (4-bit):

| Primitiva | n | Accuracy | Soft accuracy | Macro F1 | KL | TV | Brier | ECE | Score MAE | Within 1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| choice | 600 | 0,750 | 0,527 | 0,557 | 0,157 | 0,189 | 0,079 | 0,171 | - | - |
| noul | 600 | 0,830 | 0,651 | 0,784 | 0,075 | 0,137 | 0,052 | 0,156 | - | - |
| score | 800 | 0,672 | 0,482 | 0,560 | 0,131 | 0,188 | 0,069 | 0,141 | 0,256 | 0,971 |

Comparativa declarada por el autor en el mismo split. El techo de auto-acuerdo del maestro es 0,735.

| Modelo | Tipo | Accuracy | Brier | ECE |
|---|---|---:|---:|---:|
| Rankine 0.6B v1, 4-bit (este modelo) | especialista | 0,743 | 0,067 | 0,154 |
| Rankine 0.6B v1, adaptadores fp16 (sin publicar) | especialista | 0,764 | 0,056 | 0,159 |
| Laya typed-decisions | especialista | 0,766 | 0,062 | 0,213 |
| meraGPT Decider 1 | zero-shot | 0,768 | 0,052 | no publicado |
| TypeSafe Jev 1.13.0 | zero-shot | 0,727 | 0,148 | 0,144 |
| Auto-acuerdo del maestro | techo | 0,735 | no aplica | no aplica |

Velocidad declarada en Apple M5, 200 ejecuciones por medicion, con grafos compilados y secuencias empaquetadas activados. La model card compara Rankine con Laya medido en la misma maquina (`aac6fef/laya-mlx`), y senala que Laya gana en las filas de una sola pregunta y en la de muchas preguntas por estado.

| Fin a fin, Apple M5 | Rankine | Laya |
|---|---:|---:|
| Una pregunta, P50 | 15,96 ms | 11,23 ms |
| Una pregunta, P95 | 16,27 ms | dato incompleto en la informacion disponible |
| Muchas preguntas por estado | dato incompleto en la informacion disponible | dato incompleto en la informacion disponible |

## Requisitos de hardware

- Pesos en 4 bits: 320 MiB segun la model card. El repositorio completo ocupa 331 MiB.
- VRAM/ memoria unificada estimada: aproximadamente 0,35-0,5 GB para los pesos mas el estado de la libreria MLX; la model card no publica una cifra oficial de memoria en ejecucion, por lo que cualquier valor por encima de los 320 MiB de pesos es una estimacion.
- Estimacion para una hipotetica version fp16 (los adaptadores fp16 existentes no se han publicado): en torno a 1,2 GB solo de pesos, calculado a partir de los 596.049.920 parametros.
- GPU recomendadas: no disponible. El artefacto esta en formato MLX y esta etiquetado `apple-silicon`, por lo que el destino previsto es hardware Apple Silicon (la model card cita una Apple M5). No hay datos de ejecucion en GPU NVIDIA o AMD.
- Cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon y memoria unificada suficiente, dado el tamano de 320 MiB de pesos. No hay datos publicados de ejecucion en GPUs de consumo tipo RTX 4090, porque el formato MLX no es el soportado de forma nativa por esas plataformas.
- Opciones de despliegue: MLX (`mlx-lm`) es la via documentada por la libreria declarada. No hay evidencia de artefactos GGUF, por lo que Ollama y llama.cpp no son utilizables directamente sin una conversion previa no documentada en la informacion disponible. Tampoco hay evidencia de soporte en vLLM o TGI.
- Latencia declarada: P50 de 15,96 ms para una sola pregunta y P50 de 99 ms por caso completo (2.000 decisiones sobre 400 casos) en Apple M5. El throughput agregado no se publica.

## Comparativa con modelos similares

La comparacion se limita a los modelos que el propio autor puntua en el mismo split; todos pertenecen a la categoria de clasificacion/decisores tipados, no a la de LLM generativos.

| Modelo | Tipo | Parametros | Contexto | Accuracy | Brier | ECE | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---:|---|---|
| Rankine 0.6B v1, 4-bit (este modelo) | especialista | 596.049.920 | 40.960 tokens | 0,743 | 0,067 | 0,154 | Apache-2.0 | publico en HF (MLX 4-bit); adaptadores fp16 sin publicar |
| Rankine 0.6B v1, fp16 | especialista | 596.049.920 | 40.960 tokens | 0,764 | 0,056 | 0,159 | Apache-2.0 | no publicado |
| Laya typed-decisions | especialista | no disponible | no disponible | 0,766 | 0,062 | 0,213 | no disponible | referencia medida desde `aac6fef/laya-mlx` |
| meraGPT Decider 1 | zero-shot | no disponible | no disponible | 0,768 | 0,052 | no publicado | no disponible | valores de referencia del harness, no remedidos |
| TypeSafe Jev 1.13.0 | zero-shot | no disponible | no disponible | 0,727 | 0,148 | 0,144 | no disponible | valores de referencia del harness, no remedidos |
| Auto-acuerdo del maestro | techo | no aplica | no aplica | 0,735 | no aplica | no aplica | no aplica | referencia metodologica |

Notas: las cifras de Laya, meraGPT Decider 1 y TypeSafe Jev 1.13.0 son valores de referencia que arrastra el harness de evaluacion del proyecto y no se volvieron a medir en esta publicacion. La model card indica que Laya supera a Rankine en las mediciones de una sola pregunta y de muchas preguntas por estado en Apple M5.

## Limitaciones y advertencias

- Modelo de nicho y sin validacion independiente: los resultados del model-index estan marcados como `verified: false` y provienen del propio autor.
- Volumen de adopcion muy bajo: 16 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que la comunidad haya detectado fallos.
- Punto debil conocido en la primitiva `score`: accuracy de 0,672 y soft accuracy de 0,482, los peores valores del desglose por primitiva.
- Punto debil conocido en el dominio de seguridad: macro F1 de 0,439 en `security_incidents`, muy por debajo de los otros tres flujos. El propio autor lo identifica como objetivo de la siguiente iteracion.
- Techo metodologico: el auto-acuerdo del maestro es 0,735 de accuracy. Por encima de ese punto, la metrica mide la coincidencia con las peculiaridades del maestro mas que con la tarea, de ahi que la model card recomiende leer KL y Brier junto a la accuracy. Esto limita la interpretacion de cualquier mejora futura en accuracy.
- Restriccion de plataforma: el artefacto es MLX y esta pensado para Apple Silicon. No se documentan pesos GGUF, safetensors estandar ni soporte en vLLM o TGI, lo que dificulta el despliegue en servidores Linux con GPU.
- No es un modelo generativo: su salida son distribuciones sobre opciones predefinidas, no texto libre. No se documentan capacidades de tool calling, agentes, vision ni audio.
- Idiomas soportados: no disponible. No hay informacion sobre cobertura multilingue, aunque el backbone Qwen3 sea multilingue; el ajuste puede haber reducido la cobertura efectiva a los idiomas presentes en los datos de entrenamiento, que no se detallan.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion libre, pero si existe riesgo de sobreconfianza, evidenciado por un ECE de 0,154 y un ECE de 0,204 en el flujo de observabilidad de trazas, el mas alto de los cuatro. Conviene calibrar o umbralizar antes de automatizar decisiones.
- Sesgos conocidos: no disponible. La model card no incluye analisis de sesgos ni composicion demografica del dataset.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias. Al derivar de Qwen/Qwen3-0.6B, tambien Apache-2.0, no hay restricciones adicionales conocidas.
- La model card esta truncada en la seccion de velocidad: falta parte de la tabla comparativa de latencia, por lo que no se pueden citar los valores completos de P95 ni de muchas preguntas por estado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FahrenheitResearch/Rankine-0.6B-v1-mlx-4bit
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de evaluacion: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Perfil del autor en HuggingFace: https://huggingface.co/FahrenheitResearch
- Modelos publicados por el autor: https://huggingface.co/FahrenheitResearch/models
- Implementacion de Laya en MLX citada en la comparativa: `aac6fef/laya-mlx` (referencia interna de la model card, sin URL publica en la informacion disponible)

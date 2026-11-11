# choyiny/yev0-35b-a3b

## Resumen

yev0-35b-a3b es un adaptador LoRA publicado por el usuario choyiny (organización xyspacedev) sobre el modelo base Qwen/Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parámetros totales, de los cuales unos 3.000 millones están activos por token. El adaptador no es un modelo generativo de propósito general: está especializado en toma de decisiones de tipo "System One", es decir, clasificación rápida y calibrada de opciones discretas. Dado un estado (por ejemplo, el texto de una consulta de cliente), una pregunta y un conjunto de opciones, el modelo devuelve una probabilidad calibrada por opción en un único forward pass, leyendo los logits de las letras que identifican cada opción.

El modelo forma parte del experimento "yev", que compara si influye más una mejor receta de datos o un modelo base más grande. yev0-35b-a3b es la celda que combina el conjunto de datos corto (`yev-data-short`, 44.228 filas) con el base grande de 35B, frente a yev0-4b (mismo dato, base Qwen3.5-4B-Base) y yev2-35b-a3b (base grande con el conjunto largo de 81.000 filas). El resultado es un adaptador de 0,4 GB que se sirve junto al base y que mejora de forma clara a sus predecesores de 4B en los benchmarks de decisión declarados por el autor.

Es relevante para desarrolladores que necesitan enrutamiento, clasificación multietiqueta o decisiones con umbrales de confianza explícitos, porque ofrece probabilidades calibradas (ECE de 0,055 en DecideBench v2) en lugar de texto libre, con una latencia de decodificación muy baja (p50 de 0,38 s y 9,6 req/s en una RTX PRO 6000). El precio a pagar es el requisito de memoria del base: 65 GB en bf16, lo que obliga a una GPU de 80 GB o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con atención y linear-attention; adaptador LoRA sobre Qwen/Qwen3.6-35B-A3B |
| Parametros totales | ~35B (modelo base) |
| Parametros activos | ~3B por token (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo documenta servicio en bf16 y pesos fusionados; el adaptador se distribuye en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; el repo contiene solo el adaptador, no los pesos fusionados) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.6-35B-A3B, un modelo MoE de unos 35B parámetros con unos 3B activos por token. El entrenamiento usa LoRA con rango 64, alpha 128 y dropout 0,05, aplicado a las proyecciones de atención, linear-attention y de los expertos compartidos; los expertos enrutados permanecen congelados. Se emplea la configuración de yev0-4b (`configs/stage0/lc100.json`) cambiando únicamente el modelo base: 1 época, tasa de aprendizaje 1e-4, 44.228 filas (28,2 millones de tokens) y 1.218 pasos, con un coste de 2,6 horas en una RTX PRO 6000.

La innovación principal no está en la arquitectura sino en la interfaz: el modelo no genera texto, sino que lee los logits de las letras de las opciones en un solo forward pass y aplica temperaturas por tipo de pregunta ajustadas sobre 2.000 filas reservadas (`calibration.json`) para producir probabilidades calibradas. El entrenamiento siguió la receta pública de Together, "How to train your own Jev". No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre el conjunto de datos de decisión.

## Capacidades

- Clasificación de decisiones con opciones múltiples (2 a 6 opciones en entrenamiento; el autor indica que también maneja más, y de hecho rinde mejor en las preguntas de 8 a 10 opciones de DecideBench v2).
- Salida de probabilidad calibrada por opción en un único forward pass, a partir de los logits de las letras de cada opción.
- Soporte de preguntas tipadas con instrucciones por pregunta (por ejemplo, tipo `noul` en la API `/v1/systemone`).
- Capacidad de calibración por tipo de pregunta mediante temperaturas ajustadas.
- Capacidades multilingües: solo inglés declarado.
- No se documentan tool calling, function calling, razonamiento multi-paso ni modo thinking en la información disponible.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una consulta y un conjunto de categorías (facturación, técnico, cuenta), el modelo devuelve una probabilidad por categoría en un solo paso, lo que permite aplicar umbrales de confianza y derivar a revisión humana los casos con probabilidad baja. La calibración (ECE de 0,055) hace que esos umbrales sean interpretables.
- Moderación y triaje de contenido: clasificación binaria o multietiqueta de mensajes con probabilidades calibradas, útil para decidir automáticamente entre aprobar, rechazar o escalar.
- Decisión con abstención: en pipelines donde el coste de un falso positivo es alto, las probabilidades por opción permiten definir una banda de incertidumbre y abstenerse cuando ninguna opción supera el umbral.
- Enrutamiento de agentes y selección de herramienta: elegir entre un conjunto pequeño de acciones o herramientas disponibles a partir del estado de la conversación, con una latencia p50 de 0,38 s que encaja en bucles interactivos.
- Evaluación de políticas y simulación de decisiones: usar el modelo como política de referencia calibrada para comparar contra reglas heurísticas o modelos más pequeños en conjuntos propios de decisión.
- Clasificación de alto volumen con coste acotado: el autor reporta 9,6 req/s y 95 dólares por millón de decisiones en una sola RTX PRO 6000, lo que permite procesar lotes grandes de decisiones con presupuesto predecible.
- Investigación sobre calibración: el adaptador y su `calibration.json` sirven como base para estudiar temperaturas por tipo de pregunta y comparar recetas de datos frente a tamaño de modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por un tercero) en la model-index y en la model card:

| Benchmark | yev0-4b | yev1-4b | yev0-35b-a3b | yev2-35b-a3b |
|---|---:|---:|---:|---:|
| DecideBench v2.0 test (450), accuracy | 78,2 | 79,3 | 86,0 | 88,0 |
| DecideBench v2.0 test, pair accuracy | 60,0 | 62,7 | 74,7 | 78,2 |
| DecideBench v1.0 test (400), accuracy con ejemplos | 94,5 | 95,25 | 98,0 | 97,75 |
| DecideBench v1.0 test, accuracy zero-shot | 95,0 | 94,75 | 96,0 | 96,75 |
| JevBench public (231), accuracy | 78,4 | 82,7 | 87,4 | 90,5 |
| DynaBench test (543), F1 | 55,7 | 67,5 | 83,7 | 75,9 |

Métricas adicionales declaradas para DecideBench v2.0 test: pair accuracy de 74,7 y ECE (15 bins) de 0,055. El intervalo del 95 % para la accuracy de DecideBench v2 es 82,7–89,1. En el conjunto de desarrollo (1.898 filas reservadas del entrenamiento): accuracy 95,3 (yev0-4b: 94,1), group accuracy 88,4 (83,9) y ECE 0,030 (0,037). Según el autor, el modelo puntúa más alto en las 100 preguntas de 8 a 10 opciones de DecideBench v2 (92 %) que en el resto (84 %), pese a haberse entrenado con hasta 6 opciones.

Rendimiento de servicio declarado: en DecideBench v2, con una NVIDIA RTX PRO 6000 Blackwell (96 GB), pesos fusionados sobre vLLM 0.31.0 detrás de `yev serve` y 4 peticiones en vuelo, p50 de 0,38 s, p95 de 0,72 s, 9,6 req/s y 95 dólares por millón de decisiones (tiempo de GPU a 3,36 dólares por hora).

## Requisitos de hardware

- El modelo base debe residir en memoria de GPU: 65 GB en bf16.
- GPU recomendadas: una sola A100 de 80 GB, H100 o RTX PRO 6000 (el autor cita explícitamente estas tres).
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RTX 5090 de 32 GB) con el base en bf16; no se documentan opciones de cuantización para reducirlo.
- Despliegue con transformers + PEFT mediante `yev serve --model yev0-35b-a3b --base Qwen/Qwen3.6-35B-A3B --calibration yev0-35b-a3b/calibration.json`.
- Despliegue con vLLM: fusionar el adaptador una vez con `yev export-merged`, copiar `calibration.json` a la carpeta fusionada y servir con `--max-num-seqs 64`.
- Endpoint HTTP propio `/v1/systemone` para enviar estado y preguntas tipadas.
- Latencia y throughput declarados: p50 0,38 s, p95 0,72 s, 9,6 req/s con 4 peticiones en vuelo en RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DecideBench v2 accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yev0-35b-a3b | ~35B totales / ~3B activos (base) + LoRA | no disponible | 86,0 | Apache-2.0 | Adaptador en HF |
| yev2-35b-a3b | ~35B totales / ~3B activos (base) + LoRA | no disponible | 88,0 | Apache-2.0 | Adaptador en HF |
| yev0-4b | ~4B (base Qwen3.5-4B-Base) + LoRA | no disponible | 78,2 | Apache-2.0 | Adaptador en HF |
| yev1-4b | ~4B (base Qwen3.5-4B-Base) + LoRA | no disponible | 79,3 | Apache-2.0 | Adaptador en HF |

La comparación relevante es interna al experimento yev: yev0-35b-a3b supera a las variantes de 4B en todos los benchmarks declarados salvo en el conjunto largo, donde yev2-35b-a3b gana en DecideBench v2 (88,0 frente a 86,0), DecideBench v1.0 con ejemplos (97,75 frente a 98,0 es la única excepción a favor de yev0), JevBench (90,5 frente a 87,4) y pierde en DynaBench (75,9 frente a 83,7). No se dispone de comparación con modelos de decisión externos.

## Limitaciones y advertencias

- El adaptador no incluye los pesos fusionados: requiere descargar el base Qwen/Qwen3.6-35B-A3B por separado y disponer de 65 GB de VRAM en bf16.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- El modelo está diseñado para clasificación de opciones discretas, no para generación de texto libre ni razonamiento multi-paso; usarlo fuera de ese formato no está soportado.
- Los benchmarks son declarados por el autor y no están verificados por terceros (`verified: false` en la model-index).
- El autor advierte que se entrenó con preguntas de 2 a 6 opciones; el comportamiento con más opciones es empírico y no garantizado.
- Las probabilidades calibradas dependen de aplicar `calibration.json` con las temperaturas por tipo de pregunta; servirlas sin ese fichero invalida la calibración.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un clasificador sobre logits de letras, el riesgo se traslada a la asignación de probabilidad a opciones mal definidas o ambiguas.
- La licencia Apache-2.0 del adaptador no exime de comprobar la licencia y condiciones del modelo base y de los datos de entrenamiento citados en `NOTICE` y `ATTRIBUTION.json`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/choyiny/yev0-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- yev0-4b: https://huggingface.co/choyiny/yev0-4b
- yev1-4b: https://huggingface.co/choyiny/yev1-4b
- yev2-35b-a3b: https://huggingface.co/choyiny/yev2-35b-a3b
- Repositorio de código y receta: https://github.com/xyspacedev/yev
- README del experimento yev (comparación datos frente a modelo): https://github.com/xyspacedev/yev#better-data-or-a-better-model
- Receta de Together, "How to train your own Jev": https://www.together.ai/blog/how-to-train-your-own-jev
- Conjunto de datos DecideBench: https://huggingface.co/datasets/choyiny/decidebench

# basab1142/tinyaya-hguard-probes

## Resumen

Tiny Aya Hallucination Guard — Probes es un conjunto de sondas lineales (linear probes) entrenadas sobre el flujo residual (residual stream) del modelo CohereLabs/tiny-aya-global. Su objetivo no es generar texto, sino predecir a partir de las activaciones internas si una respuesta generada en modo greedy sera incorrecta. El autor, basab1142, publica los pesos de estas sondas junto con umbrales conformales que permiten construir una politica de tres vias: abstenerse, responder o recuperar informacion externa.

El repositorio contiene dos sondas independientes: `linear_ans_last`, que opera sobre la ultima posicion de la respuesta, y `linear_q_last`, que lo hace sobre la ultima posicion de la pregunta. Ambas alcanzan AUROC de validacion cruzada en el mejor nivel de 0,8717 y 0,8403 respectivamente, lo que las hace utiles como capa de control de fiabilidad sobre un modelo pequeno. Los umbrales se calibran con Learn-then-Test y cotas superiores de Clopper-Pearson para ofrecer garantias de riesgo estadistico.

Es relevante porque aborda el problema de la deteccion de alucinaciones desde una perspectiva ligera y desacoplada del modelo generador: en lugar de reentrenar el LLM, se anaden clasificadores lineales de bajo coste sobre sus activaciones. El repo no contiene pesos del modelo base, solo las sondas y metadatos, y esta pensado para emparejarse exclusivamente con tiny-aya-global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sondas lineales (regresion logistica L2 por capa) sobre el flujo residual de un transformer; incluye un stacker LayerMix |
| Parametros totales | No disponible (los pesos de las sondas son de dimension reducida; no se especifica el numero exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base tiny-aya-global, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (los pesos safetensors de las sondas no se publican cuantizados) |
| Idiomas soportados | Ingles (en), hindi (hi), tailandes (th), suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`weights.safetensors`), mas `metadata.json`, `per_layer_auroc.csv` y `manifest.json` por sonda |

## Arquitectura y entrenamiento

Cada sonda es una regresion logistica con regularizacion L2 entrenada por capa sobre las activaciones del flujo residual del modelo base. Se extraen dos representaciones: `ans_last` (ultima posicion de la respuesta generada) y `q_last` (ultima posicion de la pregunta). Para cada una se entrena un clasificador por capa y se selecciona el mejor nivel: la capa 19 para `ans_last` (AUROC 0,8717) y la capa 22 para `q_last` (AUROC 0,8403). Ademas, un stacker LayerMix combina las top-k capas y mejora ligeramente el AUROC en validacion cruzada (0,8762 y 0,8467 respectivamente).

Los pesos incluyen `scaler_mean` y `scaler_std` para el z-scoring del flujo residual, asi como `layermix_stacker_weights`. La calibracion de umbrales emplea el marco Learn-then-Test con cotas superiores de Clopper-Pearson para controlar el riesgo de la politica de absteccion. Los umbrales publicados cubren niveles α de 0,05, 0,10, 0,15 y 0,20; solo los tres ultimos cumplen la garantia de riesgo en la particion de calibracion mostrada. No se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset en la model card, que remite al repositorio companion.

## Capacidades

- Deteccion de respuestas incorrectas: clasifica si una respuesta greedy del modelo base es erronea a partir de sus activaciones internas.
- Prediccion selectiva: permite decidir por respuesta si responder, abstenerse o derivar a recuperacion externa.
- Control de riesgo estadistico: los umbrales conformales ofrecen garantias de cobertura y riesgo bajo Learn-then-Test.
- Soporte multilingue limitado a los cuatro idiomas del modelo base: en, hi, th, sw.
- Integracion desacoplada: funciona como capa de post-procesado sobre las activaciones del LLM, sin reentrenarlo.
- No genera texto ni realiza tool calling; es un componente auxiliar de fiabilidad.

## Casos de uso

- Moderacion de respuestas en produccion: interceptar las salidas de tiny-aya-global y, si la sonda `ans_last` marca alta probabilidad de error, sustituir la respuesta por una absteccion o un mensaje de derivacion.
- Enrutado a recuperacion aumentada (RAG): usar la politica de tres vias para decidir cuando lanzar una busqueda externa en lugar de confiar en la respuesta parametrizada, reduciendo coste en consultas de baja incertidumbre.
- Evaluacion de calidad en pipelines de anotacion: marcar automaticamente respuestas sospechosas para revision humana, priorizando el esfuerzo donde la sonda detecta riesgo.
- Sistemas de bajo coste en entornos con recursos limitados: al ser clasificadores lineales, el coste computacional anadido es minimo comparado con un segundo LLM verificador.
- Despliegue multilingue en ingles, hindi, tailandes y suajili: util para asistentes en mercados del sur de Asia y Africa oriental donde tiny-aya-global es el generador.
- Investigacion en interpretabilidad: las sondas permiten estudiar que capas del flujo residual codifican la correccion de la respuesta y comparar dinamicas entre idiomas.

## Benchmarks y rendimiento

| Sonda | Posicion | Mejor capa (1-based) | AUROC mejor capa | AUROC CV LayerMix |
|---|---|---|---|---|
| `linear_ans_last` | ans_last | 19 | 0,8717 | 0,8762 |
| `linear_q_last` | q_last | 22 | 0,8403 | 0,8467 |

Umbrales conformales (particion de calibracion con N y pos_rate no disponibles):

| α | τ_abs | Cobertura calib. | Riesgo calib. | UCB de riesgo | Garantia cumplida |
|---|---|---|---|---|---|
| 0,05 | 0,0000 | 0,000 | 0,000 | 1,000 | No |
| 0,10 | 0,2010 | 0,006 | 0,000 | 0,079 | Si |
| 0,15 | 0,2563 | 0,042 | 0,109 | 0,143 | Si |
| 0,20 | 0,2915 | 0,062 | 0,162 | 0,192 | Si |

No se han publicado resultados de benchmarks comparativos con otros detectores de alucinacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para las sondas: despreciable; son matrices de dimension (n_capas, d_model) mas un sesgo y un stacker, del orden de kilobytes o pocos megabytes.
- VRAM para el modelo base: no disponible en la informacion proporcionada; depende de tiny-aya-global, que no se detalla en esta ficha.
- GPU recomendadas: cualquiera capaz de ejecutar tiny-aya-global; las sondas no imponen requisitos adicionales.
- Cabe en GPU de consumo: si, siempre que el modelo base quepa; las sondas en si no son un cuello de botella.
- Opciones de despliegue: carga via `safetensors.torch.load_file` y `huggingface_hub.snapshot_download`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para las sondas.
- Latencia y throughput: no disponibles; el coste anadido es el de una multiplicacion matriz-vector por sonda y capa seleccionada.

## Comparativa con modelos similares

| Modelo / enfoque | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tinyaya-hguard-probes | Sondas lineales sobre flujo residual | No disponible | No disponible | AUROC 0,8717 / 0,8403 | Apache 2.0 | Hugging Face |
| Verificador LLM externo (generico) | Segundo modelo generativo | Depende del modelo | Depende del modelo | No disponible | Depende | Amplia |
| Deteccion por entropia / logprobs | Heuristica de incertidumbre | 0 | No aplica | No disponible | No aplica | Integrada en el generador |

No se dispone de comparaciones cuantitativas publicadas frente a estos enfoques en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del modelo base: los pesos solo son validos para CohereLabs/tiny-aya-global; el flujo residual de otro modelo constituye una base distinta y las sondas no transfieren.
- Validez de calibracion limitada: los umbrales conformales solo son validos para la distribucion de preguntas usada en calibracion; fuera de ella las garantias de riesgo no se sostienen.
- Nivel α de 0,05 no cumple la garantia en la particion mostrada (UCB de riesgo 1,000), por lo que no debe usarse en produccion con ese umbral.
- Cobertura baja en niveles estrictos: con α de 0,10 la cobertura de calibracion es 0,006, lo que implica abstenerse en la practica totalidad de los casos.
- Cobertura linguistica reducida a cuatro idiomas; el rendimiento fuera de en, hi, th y sw no esta caracterizado.
- Riesgo de falsos negativos: la sonda puede no detectar respuestas incorrectas cuando la AUROC no es perfecta; no sustituye a una validacion humana en dominios criticos.
- No es un modelo generativo: no debe presentarse como LLM ni usarse para generar contenido.
- La model card no documenta sesgos especificos ni el tamano de la particion de calibracion (N y pos_rate aparecen como None), lo que dificulta auditar la robustez de los umbrales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/basab1142/tinyaya-hguard-probes
- Dataset de resultados: https://huggingface.co/datasets/basab1142/tinyaya-hguard-results
- Repositorio de reproduccion (pipeline, datos y harness de evaluacion): https://github.com/basab1142/hallucination-detection-and-abstention
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global

# AbdullahKhanSherwani/Javed

## Resumen

Javed es un adaptador LoRA sobre el modelo base Qwen3.5-0.8B, desarrollado por AbdullahKhanSherwani, especializado en la tarea de entity matching y product matching. Su funcion es determinar, en un unico pase forward, si dos listados de producto describen el mismo producto real (misma marca, modelo y variante), emitiendo una decision binaria MATCH o DIFFERENT. El modelo utiliza titulo, descripcion y marca de cada oferta, excluyendo deliberadamente precio y moneda.

La relevancia de este adaptador radica en su enfoque de bajo coste computacional: al partir de un modelo base de solo 0.8B parametros y aplicar un adaptador LoRA de rango 16, se obtiene un clasificador especializado que supera en el benchmark WDC Products medium a alternativas de mayor tamano como Qwen3-Reranker-0.6B y a heuristicas clasicas como RapidFuzz. El adaptador ocupa aproximadamente 0.1 GB en el repositorio.

El modelo fue construido para el Qwen Local Hackathon utilizando el runtime SearchJev, y se distribuye bajo licencia Apache 2.0. Su evaluacion se centra en un unico split de test con un unico seed, por lo que sus resultados deben interpretarse como un punto de partida validado en un dominio concreto (catalogos web de producto) y no como una garantia de generalizacion a otros dominios de matching.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16, alpha 32) sobre transformer Qwen3.5-0.8B |
| Parametros totales | no disponible (modelo base de 0.8B; el adaptador LoRA no especifica su recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud maxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (la evaluacion usa fp16; no se documentan otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

Javed es un adaptador PEFT de tipo LoRA aplicado sobre Qwen3.5-0.8B, un transformer denso de 0.8B parametros. El adaptador usa rango 16 y alpha 32, y se entrena en precision fp16. La tarea se formula como una clasificacion de dos opciones (MATCH / DIFFERENT) en un unico forward pass, con una pregunta en lenguaje natural y definiciones de cada opcion. El modelo recibe titulo, descripcion y marca de dos ofertas; las descripciones se truncan a 100 palabras separadas por espacios y se excluyen precio y moneda.

El entrenamiento consistio en una unica ejecucion sobre una NVIDIA L4, con tres epocas, tamano de batch efectivo 16, tasa de aprendizaje 1e-4, seed 42, longitud maxima 1.024 y 1.125 pasos de optimizacion, con un tiempo de pared de 56 minutos y 21 segundos. Se usaron 6.000 pares de entrenamiento y 3.500 de validacion provenientes de la exportacion MatchGPT del benchmark WDC Products, y 4.500 pares de test retenidos (500 matches y 4.000 no-matches) de la exportacion gold unseen de los autores. No se documenta RLHF ni DPO; el ajuste es supervisado sobre la tarea de matching.

## Capacidades

- Clasificacion binaria de pares de productos (MATCH / DIFFERENT) en un solo pase forward.
- Entity matching y product matching basado en titulo, descripcion y marca.
- Emision de probabilidades calibrables (score de MATCH) para umbralizar decisiones.
- Deteccion de truncamiento de entrada (`result.truncated`) para gestionar casos que superan la longitud maxima.
- Soporte de umbrales congelados en validacion para controlar la tasa de falsos positivos.
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Deduplicacion de catalogos de producto: el adaptador compara pares de listados de proveedores y decide si son el mismo producto, permitiendo consolidar entradas duplicadas en un catalogo maestro. Es adecuado porque su evaluacion se realizo precisamente sobre listados web de producto.
- Enrutamiento automatico con revision humana: usando el umbral de max-F1 en validacion, el modelo puede marcar automaticamente coincidencias de alta confianza y enviar el resto a revision, reduciendo carga manual.
- Control de falsos positivos en matching masivo: con el umbral de 1% FPR en validacion, el modelo encontro 306 de 500 matches reales con solo 45 falsos matches sobre 4.000 no-matches, lo que lo hace util en pipelines donde un falso match es costoso.
- Integracion en pipelines de busqueda y recuperacion: combinado con un recuperador previo, el adaptador puede reordenar o filtrar candidatos de producto antes de mostrarlos al usuario.
- Normalizacion de datos de proveedores: comparar ofertas de distintos proveedores para detectar si describen la misma referencia, usando marca y modelo.
- Evaluacion comparativa de heuristicas: sirve como referencia fuerte frente a RapidFuzz o un matcher logistico en tareas de matching de producto, gracias a sus metricas publicadas en WDC Products medium.
- Filtrado de coincidencias en facturas y pedidos: aunque el autor advierte que requiere validacion separada, el modelo puede emplearse como primer filtro en la conciliacion de lineas de factura con catalogo.

## Benchmarks y rendimiento

Resultados en el benchmark WDC Products medium pairwise (split de test con 80% corner cases y 100% productos no vistos):

| Metodo | Test AP | Test F1 (umbral max-F1 en validacion) | Test recall (umbral 1% FPR en validacion) | FPR test realizado |
|---|---:|---:|---:|---:|
| Javed (este adaptador) | 87,4% | 80,8% | 61,2% | 1,125% |
| SearchJev-0.8B | 69,9% | 68,0% | 34,6% | 1,075% |
| Qwen3-Reranker-0.6B | 63,5% | 62,6% | 23,2% | 0,725% |
| Qwen3.5-0.8B base | 37,7% | 39,9% | 14,8% | 0,950% |
| Logistic matcher | 27,7% | 36,3% | 5,8% | 1,750% |
| RapidFuzz token-set | 30,4% | 30,7% | 9,4% | 1,275% |
| RapidFuzz WRatio | 22,3% | 32,2% | 4,4% | 1,250% |

AP se refiere a average precision para MATCH. Los umbrales se congelaron en validacion. En el umbral de max-F1 en validacion, Javed encontro 422 matches y genero 122 falsos matches sobre 4.000 no-matches. El desglose de hard negatives solo esta disponible en validacion, ya que la exportacion de test de los autores carece de flags de hard negative.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 0.8B en fp16, la huella es reducida, pero el autor no publica cifras de VRAM.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L4; la inferencia evaluada usa CUDA con dtype float16.
- Compatibilidad con GPU de consumo: no se documenta explicitamente, pero un modelo base de 0.8B en fp16 es compatible con GPU de consumo modernas; no se aportan cifras concretas.
- Opciones de despliegue: el ejemplo oficial usa el runtime SearchJev (clon del repositorio, Transformers 5.22.1, PEFT 0.21.2, accelerate, huggingface_hub, numpy, pyyaml). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se publica el tiempo de entrenamiento (56m 21s en una L4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test AP (WDC Products medium) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Javed | 0.8B base + LoRA | 1.024 | 87,4% | Apache 2.0 | Hugging Face |
| SearchJev-0.8B | 0.8B | no disponible | 69,9% | no disponible | no disponible |
| Qwen3-Reranker-0.6B | 0.6B | no disponible | 63,5% | no disponible | no disponible |
| Qwen3.5-0.8B base | 0.8B | no disponible | 37,7% | Apache 2.0 (segun enlace del autor) | Hugging Face |

## Limitaciones y advertencias

- Evaluacion limitada a un unico seed y un unico split de test fijo; no hay evidencia de robustez multi-seed.
- El dominio evaluado es identidad de producto en listados web; catalogos de proveedores y decisiones de facturacion requieren validacion separada segun el autor.
- Solo soporta ingles.
- Longitud maxima de 1.024 tokens; las descripciones se truncan a 100 palabras, lo que puede perder informacion en listados largos.
- Excluye precio y moneda de forma deliberada; no debe usarse para comparar precios.
- Requiere seleccionar un umbral sobre datos de validacion representativos antes de usar los scores en un catalogo nuevo; los umbrales publicados no son universales.
- El desglose de hard negatives solo esta disponible en validacion, no en test.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un clasificador binario restringido a dos opciones, el riesgo de respuestas fuera de formato es bajo, pero no se aportan analisis de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse contra su propia licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/AbdullahKhanSherwani/Javed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime SearchJev: https://github.com/EvoScientist/SearchJev
- Benchmark WDC Products: https://webdatacommons.org/largescaleproductcorpus/wdc-products/
- Paper WDC Products (Peeters, Der y Bizer): https://arxiv.org/abs/2301.09521
- Exportacion MatchGPT: https://github.com/wbsg-uni-mannheim/MatchGPT/tree/ba1691935c744bb0eacc9abf772f39271e318e4b/LLMForEM/data/wdc
- Exportacion gold unseen: https://github.com/wbsg-uni-mannheim/decision-models-4-entity-matching/tree/e8ca6853ba1d54fde79fa786b19aa89a53aa8a52/data/wdc

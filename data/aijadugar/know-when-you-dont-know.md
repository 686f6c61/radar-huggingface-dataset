# aijadugar/know-when-you-dont-know

## Resumen

Know-When-You-Don't-Know es una sonda lineal (linear probe) entrenada sobre los estados ocultos de Qwen/Qwen2.5-3B-Instruct para predecir, antes de generar ninguna respuesta, si la respuesta codiciosa del modelo a una pregunta factual sera incorrecta. No es un modelo generativo autonomo, sino un artefacto de clasificacion binaria empaquetado como pipeline de scikit-learn (serializado con joblib) que se apoya en el modelo base de Qwen para extraer activaciones. Lo desarrolla el usuario aijadugar y se publica en Hugging Face con fecha de creacion del 14 de noviembre de 2026.

El problema que aborda es la deteccion temprana de alucinaciones en QA factual de respuesta corta: dado un prompt, la sonda estima un riesgo de error y, si supera un umbral congelado, el sistema se abstiene. Su ventaja practica no es la precision del ranking (comparable o inferior a baselines de log-probabilidad) sino el momento en que opera: solo necesita la pregunta, por lo que permite ahorrar la generacion completa cuando el riesgo es alto.

La relevancia actual es metodologica: demuestra que una senal de calibracion extraida de una capa intermedia (indice 27 de 37) y proyectada con regresion logistica puede aproximarse a heuristicas de incertidumbre basadas en la salida del modelo, con resultados de AUROC en torno a 0,79-0,82 en TriviaQA y NQ-Open. El repositorio es de tamano practicamente nulo (0.0 GB), coherente con un artefacto de pocos kilobytes mas metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal: estandarizacion + regresion logistica (C=0.001) sobre el estado oculto del ultimo token del prompt de Qwen2.5-3B-Instruct |
| Parametros totales | No disponible (la sonda es un clasificador logistico de dimension 2048; el modelo base tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible para la sonda; el modelo base admite las cuantizaciones de Qwen2.5-3B-Instruct |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el autor remite a la licencia de Qwen/Qwen2.5-3B-Instruct para el uso de sus activaciones) |
| Formato de pesos | `probe.joblib` (pipeline de scikit-learn serializado) y `probe_meta.json` (metadatos) |

## Arquitectura y entrenamiento

La sonda opera sobre el estado oculto del ultimo token del prompt en el indice de capa 27 (de 37; el indice 0 corresponde a la salida del embedding), con dimension 2048. Sobre ese vector se aplica estandarizacion seguida de regresion logistica con C=0.001. La etiqueta es binaria: y=1 si la respuesta codiciosa del modelo no coincide con ninguna de las respuestas doradas (incorrecta) e y=0 si coincide. La capa y el valor de C se seleccionaron mediante AUROC de validacion sobre 37 indices de estado oculto por 6 valores de C, lo que hace que el AUROC de validacion (0,841) sea optimista por construccion.

El umbral de decision se fija en el percentil 70 del riesgo de validacion (objetivo de cobertura del 70%) y se congela antes de evaluar los conjuntos retenidos. La evaluacion se realiza sobre TriviaQA test (n=1000) y NQ-Open fuera de distribucion (n=1000). Las etiquetas se generan por coincidencia de cadenas normalizadas (minusculas, eliminacion de articulos y puntuacion, coincidencia de spans de palabra completa), con ruido bidireccional reconocido por el autor: parafrasis validas marcadas como incorrectas y respuestas cortas marcadas como correctas por coincidencia parcial con alias largos. No se reporta entrenamiento con RLHF ni DPO; es un ajuste supervisado sobre activaciones precomputadas.

## Capacidades

- Prediccion de riesgo de error antes de la generacion: clasifica un prompt de QA factual como de bajo o alto riesgo de que la respuesta codiciosa sea incorrecta.
- Abstencion temprana: al operar solo sobre la pregunta, permite decidir si generar o no, ahorrando coste de inferencia.
- Deteccion de alucinaciones en QA de respuesta corta: orientada a preguntas factuales con respuesta unica y alias dorados.
- Integracion con el pipeline de Qwen2.5-3B-Instruct: requiere el mismo template de prompt y el mismo modelo base usados en entrenamiento.
- Serializacion ligera: se distribuye como pipeline de scikit-learn cargable con joblib, sin necesidad de GPU para el clasificador (la GPU se usa solo para extraer activaciones).
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido: es un clasificador binario, no un modelo generativo.

## Casos de uso

- Enrutado con abstención en asistentes de QA factual: antes de invocar la generacion, la sonda puntua la pregunta y, si el riesgo supera el umbral, el sistema deriva a busqueda web o a un humano en lugar de responder.
- Reduccion de coste en pipelines de inferencia: al descartar preguntas de alto riesgo antes de generar, se evita gastar tokens en respuestas con alta probabilidad de ser incorrectas, especialmente util en despliegues de gran volumen sobre Qwen2.5-3B-Instruct.
- Filtro de calidad en generacion de datasets sinteticos: se puede usar para descartar pares pregunta-respuesta con alto riesgo de alucinacion antes de incorporarlos a un corpus de entrenamiento o evaluacion.
- Monitorizacion de confianza en produccion: como capa de observabilidad que registra la tasa de riesgo por lote de consultas y detecta derivas en la distribucion de preguntas (por ejemplo, al pasar de un dominio en distribucion a uno fuera de distribucion).
- Investigacion en calibracion y deteccion de alucinaciones: sirve como baseline reproducible de sonda lineal sobre activaciones, comparable con heuristicas de log-probabilidad y de maxima probabilidad.
- Sistemas de respuesta con politica de abstención configurable: el umbral congelado puede recalibrarse sobre datos propios para ajustar el compromiso entre cobertura y precision segun el dominio de despliegue.
- Evaluacion comparativa de metodos de incertidumbre: permite contrastar, sobre el mismo modelo base y conjunto de datos, el rendimiento de una sonda interna frente a senales derivadas de la salida del modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor. Los intervalos de confianza del 95% para AUROC provienen de bootstrap.

TriviaQA test (n=1000):

| Scorer | AUROC (IC 95%) | Base acc | Acc@70% | Cobertura realizada | Errores detectados |
|---|---|---|---|---|---|
| Probe | 0,818 (0,793-0,844) | 0,397 | 0,530 | 0,675 | 0,488 |
| −mean log-prob | 0,826 (0,799-0,852) | 0,397 | 0,533 | 0,667 | 0,502 |
| 1 − max prob | 0,786 (0,758-0,814) | 0,397 | 0,520 | 0,697 | 0,448 |

NQ-Open (fuera de distribucion, n=1000):

| Scorer | AUROC (IC 95%) | Base acc | Acc@70% | Cobertura realizada | Errores detectados |
|---|---|---|---|---|---|
| Probe | 0,790 (0,756-0,822) | 0,191 | 0,263 | 0,440 | 0,645 |
| −mean log-prob | 0,785 (0,751-0,822) | 0,191 | 0,254 | 0,654 | 0,408 |
| 1 − max prob | 0,734 (0,696-0,772) | 0,191 | 0,249 | 0,649 | 0,404 |

Segun el autor, la sonda no supera a ambos baselines con un intervalo de bootstrap pareado que excluya el cero: en TriviaQA test la diferencia con −mean log-prob es -0,007 y con 1 − max prob es +0,033; en NQ-Open es +0,005 y +0,057 respectivamente. La ventaja practica declarada es el momento de la decision (antes de generar), no la precision del ranking.

## Requisitos de hardware

- VRAM para la sonda: practicamente nula; el clasificador logistico corre en CPU (dimension 2048).
- VRAM para el modelo base: Qwen2.5-3B-Instruct en fp16 requiere aproximadamente 6-7 GB; en cuantizacion de 8 bits, unos 3-4 GB; en 4 bits, unos 2-3 GB (estimaciones habituales para un modelo de 3B, no publicadas en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4090); A100 o H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en fp16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers para extraer activaciones (requisito del autor); el clasificador se sirve con scikit-learn/joblib. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y estas no son directamente compatibles con la extraccion de estados ocultos que exige la sonda.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Criterio | Know-When-You-Don't-Know (sonda) | −mean log-prob (baseline) | 1 − max prob (baseline) |
|---|---|---|---|
| Tipo | Clasificador lineal sobre activaciones | Heuristica sobre log-probabilidades de salida | Heuristica sobre probabilidad maxima |
| Requiere generacion | No | Si (necesita la respuesta generada) | Si (necesita la distribucion de salida) |
| AUROC TriviaQA test | 0,818 | 0,826 | 0,786 |
| AUROC NQ-Open | 0,790 | 0,785 | 0,734 |
| Cobertura realizada (NQ-Open) | 0,440 | 0,654 | 0,649 |
| Dependencia del modelo base | Especifica de Qwen2.5-3B-Instruct y su template | Generica | Generica |
| Licencia | No disponible | No aplica | No aplica |

No se dispone de comparacion con otras sondas lineales publicadas ni con modelos de deteccion de alucinaciones de proposito general en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenada y evaluada exclusivamente en QA factual de respuesta corta (TriviaQA y NQ-Open); no se ha validado en generacion abierta, codigo, matematicas ni dialogos multi-turno.
- Depende de un unico modelo base (Qwen/Qwen2.5-3B-Instruct) y de un unico template de prompt; cualquier cambio en el template altera las activaciones y invalida la sonda.
- El umbral se congelo sobre validacion de TriviaQA y no transfiere: en NQ-Open la cobertura realizada fue 0,440 frente al objetivo de 0,70, con una brecha de AUROC de -0,028 respecto a TriviaQA test.
- Ruido de etiquetas bidireccional por la heuristica de coincidencia de cadenas: parafrasis validas marcadas como incorrectas y respuestas cortas marcadas como correctas por coincidencia parcial con alias largos (por ejemplo, "Australia" contra el alias "Philosophy in Australia"). NQ-Open tiene menos alias dorados por pregunta, lo que infla su tasa de errores.
- Capa y C se seleccionaron sobre un unico conjunto de validacion de una unica ejecucion de entrenamiento; no se midio varianza entre semillas ni entre particiones de datos, por lo que el AUROC de validacion (0,841) es optimista.
- `probe.joblib` es un pickle de scikit-learn: debe cargarse solo desde fuentes de confianza y con una version compatible de la libreria, por el riesgo de ejecucion de codigo arbitrario.
- La licencia del artefacto no esta declarada; el autor remite a la licencia de Qwen/Qwen2.5-3B-Instruct para el uso de sus activaciones, por lo que las restricciones de uso comercial dependen del modelo base.
- Riesgo de alucinacion del propio sistema de deteccion: la sonda puede clasificar como segura una pregunta cuya respuesta sea incorrecta, y viceversa; no sustituye a la verificacion factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aijadugar/know-when-you-dont-know
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.

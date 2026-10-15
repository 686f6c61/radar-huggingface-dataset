# marcusnogueira/granite-guardian-4.1-8b-smoothquant-w8a8

## Resumen

`marcusnogueira/granite-guardian-4.1-8b-smoothquant-w8a8` es un checkpoint cuantizado en INT8 del modelo `ibm-granite/granite-guardian-4.1-8b` de IBM, publicado por el usuario marcusnogueira. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión: aplica SmoothQuant (con fuerza alpha 0.5) combinado con GPTQ para producir un esquema W8A8, es decir, pesos en INT8 y activaciones en INT8 dinámicas por token. La serialización se realiza con el formato `compressed-tensors` 0.12.2, lo que permite que vLLM lo cargue directamente sin cuantización en tiempo de ejecución.

El modelo base pertenece a la familia Granite Guardian 4.1 de IBM, especializada en funciones de guardrail (clasificación de seguridad) y de juez automático (LLM-as-a-judge). La cuantización aquí presentada tiene como objetivo reducir el coste de memoria y de cómputo en inferencia manteniendo el comportamiento del modelo original en tareas de clasificación safe/unsafe en inglés y portugués. El checkpoint tiene 8.791.592.960 parámetros y ocupa 9,6 GB en el repositorio.

La relevancia de esta ficha reside en documentar una conversión concreta y reproducible (semilla 42, muestras de calibración documentadas, hashes incluidos) orientada a despliegues de moderación con vLLM. Se trata de un artefacto con muy poca tracción (5 descargas, 0 likes en el momento de la consulta) y sin licencia declarada, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Granite de IBM; detalles de capas no especificados en la informacion proporcionada) |
| Parametros totales | 8.791.592.960 (~8,8 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8: pesos INT8 y activaciones INT8 dinamicas por token; SmoothQuant (alpha 0.5) + GPTQ; sin cuantizacion de KV cache |
| Idiomas soportados | ingles (en), portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors con serializacion `compressed-tensors` 0.12.2 |

## Arquitectura y entrenamiento

El artefacto es una conversion de precision, no un entrenamiento nuevo. El punto de partida es `ibm-granite/granite-guardian-4.1-8b` en la revision inmutable `ab01ccca5dcfb80246369a086a4a87a29198f5af`, mantenida en BF16 como dtype de origen y como dtype de computo seleccionado en tiempo de ejecucion. Sobre ese modelo se aplica SmoothQuant con fuerza alpha 0.5 para suavizar los picos de activacion, seguido de GPTQ W8A8. El alcance de la cuantizacion son todas las capas lineales excepto `lm_head`. La cuantizacion de la cache KV esta desactivada. La implementacion emplea `llmcompressor==0.8.1`.

El proceso de calibracion utilizo 500 muestras congeladas (250 en ingles y 250 en portugues), en formato de texto plano sin plantillas de chat especificas del modelo, con una longitud maxima de secuencia de 2048 tokens y semilla aleatoria 42. La fuente de calibracion es C4 en la revision `1588ec454efa1a09f29cd18ddd04fe05fc8653a2`, con hash SHA-256 de calibracion `65ea2fdb18470289314defc0fb94e27d4877b62143569615a1ce01745607ce1f`. No se documenta en la informacion disponible el proceso de entrenamiento original del modelo base (tokens, composicion del dataset, RLHF/DPO), por lo que no puede detallarse aqui.

## Capacidades

- Clasificacion de seguridad (guardrail): evaluacion de contenido safe/unsafe, validada con casos fijos en ingles y portugues.
- Deteccion de alucinaciones: el modelo base Granite Guardian 4.1 incluye detectores de alucinacion segun la documentacion de IBM.
- Bring Your Own Criteria (BYOC): definicion de criterios de juicio arbitrarios mas alla de los detectores predefinidos de seguridad y alucinacion, con capacidad de evaluar requisitos multiparte como reglas de formato, restricciones de longitud e instrucciones de dominio.
- Funcion de modelo recompensa: puede actuar como reward model para seleccion Best-of-N, puntuando respuestas candidatas y eligiendo la mejor.
- Seguimiento de instrucciones: mejora declarada en cumplimiento de restricciones multiples segun la documentacion del modelo base.
- Capacidades multilingues: soporte declarado en ingles y portugues.
- Integracion con vLLM: el checkpoint carga la configuracion W8A8 serializada con `compressed-tensors` de forma directa, sin cuantizacion en vuelo.
- Modo de razonamiento (thinking/no-think): la documentacion de Granite Guardian 4.1 menciona modos no-think en las evaluaciones; no se detalla en la informacion disponible del checkpoint cuantizado.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Moderacion de contenido en produccion: el modelo clasifica entradas y salidas como seguras o inseguras en ingles y portugues; el formato W8A8 reduce la huella de memoria y permite desplegarlo con vLLM como filtro previo o posterior a un LLM generativo.
- Deteccion de alucinaciones en asistentes: integrado como capa de validacion que compara la respuesta generada con el contexto aportado y marca contenido no sustentado, aprovechando la funcion de guardian del modelo base.
- Juez automatico con criterios personalizados (BYOC): definicion de reglas de negocio concretas (por ejemplo, longitud maxima, formato obligatorio, terminologia prohibida) y evaluacion de respuestas frente a esas reglas.
- Seleccion Best-of-N en pipelines de generacion: generacion de varias respuestas candidatas y uso del modelo como reward model para puntuar y elegir la mejor, escenario en el que el modelo base declara un score alto en JETTS.
- Filtrado de datasets de entrenamiento: clasificacion por lotes de grandes volumenes de texto para descartar muestras inseguras o no conformes antes de usarlas en fine-tuning, beneficiandose del menor coste de inferencia en INT8.
- Aplicacion de directrices especificas de dominio: evaluacion de conversaciones de atencion al cliente o de salud frente a politicas internas definidas por el usuario mediante el mecanismo BYOC.
- Auditoria de salidas en entornos regulados: registro de decisiones safe/unsafe con criterios explicitos como parte de una capa de supervision sobre un sistema generativo ya desplegado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos del checkpoint cuantizado `marcusnogueira/granite-guardian-4.1-8b-smoothquant-w8a8` en la informacion disponible. La unica validacion documentada es una prueba de humo con vLLM 0.31.0 sobre una NVIDIA A40, con cuatro casos fijos (safe/unsafe, ingles y portugues) en BF16.

Los siguientes datos corresponden al modelo base `ibm-granite/granite-guardian-4.1-8b` segun los resultados de busqueda y no deben atribuirse a esta version cuantizada:

| Benchmark | Metrica | Valor | Nota |
|---|---|---|---|
| JETTS (modo no-think) | Score global | 70,29 | Como reward model; el mas alto entre los modelos evaluados segun la fuente |
| IFEval multitrestriccion | BAcc (no-think) | 0,844 | Frente a 0,458 en la version anterior 4.0 |

No se dispone de numeros comparativos de la version INT8 frente a la BF16 en cuanto a degradacion de exactitud, latencia o throughput.

## Requisitos de hardware

- Peso de los parametros: ~8,8 mil millones de parametros en INT8 equivalen a aproximadamente 8,8 GB de pesos, mas overhead de serializacion; el repositorio completo ocupa 9,6 GB.
- VRAM estimada para inferencia: alrededor de 10-12 GB para pesos y activaciones basicas con contexto corto, dependiendo de la longitud de secuencia y del batch. La cuantizacion de KV cache esta desactivada, por lo que la memoria de la cache escala en el dtype de computo (BF16).
- GPU validadas: NVIDIA A40 (usada en la prueba de humo oficial del autor).
- GPU recomendadas: cualquier GPU con al menos 12-16 GB de VRAM para despliegue ligero (por ejemplo, RTX 4080/4090, A10, L4); para lotes grandes o mayor concurrencia, A40, A100 o H100.
- Viabilidad en GPU de consumo: si, es probable en tarjetas con 12 GB o mas (RTX 3090, 4090, 4080), siempre que el contexto y el batch se mantengan moderados; no confirmado explicitamente por el autor.
- Opciones de despliegue: vLLM es la ruta documentada y validada (carga directa de la configuracion `compressed-tensors` W8A8). Otros runners compatibles con `compressed-tensors`/INT8 podrian servir, pero no estan documentados en la informacion disponible; llama.cpp, Ollama y TGI no se mencionan.
- Compatibilidad CUDA: la prueba se realizo con vLLM 0.31.0 (build de PyTorch con CUDA 13.0) sobre un host con driver CUDA 12.8, usando el paquete de compatibilidad `cuda-compat-13-0`. Conviene verificar la matriz de versiones CUDA antes de desplegar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marcusnogueira/granite-guardian-4.1-8b-smoothquant-w8a8 | ~8,8 mil millones | INT8 W8A8 (SmoothQuant + GPTQ) | en, pt | no disponible | HuggingFace (5 descargas) |
| marcusnogueira/granite-guardian-4.1-8b-gptq-8bit | ~8,8 mil millones | GPTQ 8-bit | no disponible | no disponible | HuggingFace |
| ibm-granite/granite-guardian-4.1-8b (base) | ~8,8 mil millones | BF16 (sin cuantizar) | en (base; el modelo derivado anade pt) | no disponible en esta ficha | HuggingFace (modelo oficial IBM) |

No se dispone de modelos comparables de otros proveedores en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide confirmar si el uso comercial esta permitido. Debe consultarse la licencia del modelo base de IBM antes de cualquier uso en produccion.
- Traccion minima: 5 descargas y 0 likes en el momento de la consulta; el artefacto no ha sido ampliamente validado por la comunidad.
- Sin benchmarks del checkpoint cuantizado: no hay datos publicados que cuantifiquen la perdida de exactitud respecto a la version BF16 en tareas de guardrail.
- Riesgo de alucinacion: como juez automatico, el modelo puede emitir juicios incorrectos o inventar justificaciones; no debe usarse como unica capa de decision en contextos criticos.
- Sesgos: no hay evaluacion de sesgos publicada para esta conversion; los sesgos heredados del modelo base no estan documentados en la informacion disponible.
- Cobertura idiomatica limitada: solo ingles y portugues declarados; el rendimiento en otros idiomas no esta verificado.
- Longitud de contexto no confirmada: la calibracion se realizo a 2048 tokens; no se especifica el contexto maximo soportado en inferencia.
- Detalles de la cuantizacion: la cache KV no esta cuantizada, por lo que el ahorro de memoria se limita a los pesos; con secuencias largas la ventaja frente a BF16 se reduce.
- Dependencia de versiones: el despliegue esta ligado a `llmcompressor` 0.8.1, `compressed-tensors` 0.12.2 y vLLM 0.31.0; cambios de version pueden afectar a la carga del checkpoint.
- Compatibilidad CUDA: la prueba oficial requirio el paquete de compatibilidad hacia adelante `cuda-compat-13-0`; entornos con drivers mas antiguos pueden requerir ajustes.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/marcusnogueira/granite-guardian-4.1-8b-smoothquant-w8a8
- Modelo base: https://huggingface.co/ibm-granite/granite-guardian-4.1-8b
- Version GPTQ 8-bit del mismo autor: https://huggingface.co/marcusnogueira/granite-guardian-4.1-8b-gptq-8bit
- Repositorio GitHub de Granite Guardian: https://github.com/ibm-granite/granite-guardian
- Documentacion de Granite Guardian en IBM: https://www.ibm.com/us-en/granite/docs/models/guardian
- Cookbook detallado de Granite Guardian 4.1: https://github.com/ibm-granite/granite-guardian/blob/main/cookbooks/granite-guardian-4.1/detailed_guide.ipynb

# JFJ-Bin/jev

## Resumen

AgentJev-0.6B es un punto de control (checkpoint) experimental publicado por JFJ-Bin, resultado de un ajuste fino completo (full fine-tuning) del modelo base Qwen3-0.6B sobre un conjunto de datos sintetico en ingles orientado a la toma de decisiones estructurada. No es un modelo generativo de lenguaje natural: su funcion es recibir un contexto de negocio, una pregunta y un conjunto finito de respuestas candidatas, y devolver una distribucion de probabilidad (o de niveles) sobre esas candidatas. El modelo esta disenado para tres tipos de tarea: seleccion (elegir una opcion entre varias), juicio (verdadero/falso sobre una proposicion) y puntuacion (asignar un grado en una escala ordenada).

El modelo se presenta explicitamente como una prueba de concepto (POC) para validar la cadena "decision estructurada + salida probabilistica + enrutamiento por confianza", no como un modelo de negocio de banca privada ni como una implementacion oficial de la API Jev de TypeSafe. Su interes actual reside en que demuestra un patron de diseno poco habitual: usar un LLM pequeno (0,6B parametros) no para conversar, sino como cabecera de clasificacion y calibracion con salida de distribuciones, con una separacion rigurosa entre conjuntos de entrenamiento, validacion, calibracion y test.

La relevancia practica es la de un banco de pruebas reproducible: arquitectura transformer densa heredada de Qwen3, contexto de 32 768 tokens en el modelo base (no verificado en el checkpoint), licencia "other" y disponibilidad publica en Hugging Face con cero descargas en el momento de la consulta. Los resultados reportados (77,55 % de coincidencia con la opcion de maxima probabilidad del profesor en el test de 2000 preguntas) deben interpretarse como una medida de imitacion de la distribucion del profesor, no como exactitud de negocio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) con cabecera de candidatos permutacion-equivariante |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el checkpoint; el base Qwen3-0.6B soporta 32 768 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint PyTorch `best.pt` en `state_dict`) |
| Idiomas soportados | en (ingles) |
| Licencia | other (sujeta a las condiciones del modelo base, el dataset y la institucion) |
| Formato de pesos | PyTorch (`best.pt`, `state_dict`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de 0,6 mil millones de parametros, y se somete a un ajuste fino completo de 600 pasos. La innovacion tecnica es la cabecera de decision: para cada pregunta se codifica el conjunto de candidatas con una representacion permutacion-equivariante, de modo que el orden de las opciones no altera la salida. La perdida combina entropia cruzada suave (soft cross-entropy) contra la distribucion del profesor mas un termino de Brier sobre candidatas con peso 0,1. La seleccion del checkpoint se realiza por entropia cruzada suave en validacion, y la calibracion se ajusta con una temperatura por tipo de pregunta en un conjunto de calibracion independiente; el test se lee una sola vez tras seleccion y calibracion.

Los datos de entrenamiento proceden del dataset publico `LocalLLaMA/typed-decisions` (Apache-2.0), con 1200 casos de entrenamiento y 400 de test, cinco preguntas por caso (8000 preguntas en total). Los cuatro flujos de trabajo son atencion al cliente, procesamiento de facturas, alertas de seguridad y trazas de ejecucion de agentes. Las etiquetas no son juicio humano ni resultado real de negocio, sino la media de tres muestreos de un modelo profesor. El proyecto redivide por caso: 960 casos (4800 preguntas) para entrenamiento, 120 (600) para validacion, 120 (600) para calibracion y 400 (2000) para test.

## Capacidades

- Decision por seleccion: elegir una opcion entre un conjunto finito de candidatas y devolver su probabilidad.
- Decision por juicio: evaluar la veracidad de una proposicion con salida probabilistica.
- Decision por puntuacion: asignar un nivel en una escala ordenada.
- Salida de distribuciones de probabilidad calibradas por tipo de pregunta mediante temperatura.
- Enrutamiento por confianza: separacion en bandas de alta (>=0,8), media (0,5-0,8) y baja (<0,5) confianza.
- Clasificacion y ranking de candidatas dentro de un contexto de negocio dado.
- No genera lenguaje natural; no soporta tool calling, agentes multi-paso ni vision.
- Capacidad multilingue limitada al ingles (unico idioma declarado).

## Casos de uso

- Enrutamiento de tickets de atencion al cliente: dado el historial de cuenta y la conversacion, el modelo devuelve la probabilidad de cada categoria de resolucion y permite derivar a un agente humano solo los casos de baja confianza (<0,5), que segun el autor concentran el 30,9 % de las preguntas con 55,3 % de acierto.
- Triaje de facturas en cuentas a pagar: con factura, orden de compra, albaran e historial de proveedor, el modelo puntua la probabilidad de cada decision de aprobacion o rechazo, adecuado para prefiltrar antes de la revision contable.
- Priorizacion de alertas de seguridad: a partir de la evidencia de la alerta, permisos de cuenta y comportamiento historico, el modelo clasifica la alerta en niveles ordenados y permite ordenar la cola de investigacion por probabilidad.
- Evaluacion de trazas de agentes: dado el resumen de ejecucion, la tarea y las restricciones, el modelo juzga si la traza cumple las restricciones, util para control de calidad automatizado de pipelines de agentes.
- Puntuacion de riesgo en formularios estructurados: en lugar de un clasificador ad hoc, se reutiliza el modelo como cabecera de puntuacion ordenada sobre campos de negocio, con calibracion por tipo de pregunta.
- Filtro de abstención en produccion: la banda de alta confianza (>=0,8) cubre el 18,4 % de las preguntas con 98,9 % de acierto, lo que permite automatizar solo ese subconjunto y escalar el resto a revision humana.
- Prototipado de sistemas de decision con LLM pequenos: sirve como referencia reproducible para equipos que quieran sustituir un LLM grande por una cabecera de 0,6B en tareas de clasificacion con salida probabilistica.

## Benchmarks y rendimiento

Resultados reportados por el autor en el test de 2000 preguntas:

| Metrica | Valor |
|---|---|
| Coincidencia con la opcion de maxima probabilidad del profesor | 77,55 % |
| Entropia cruzada suave | 0,855 |
| Brier score | 0,048 |
| Error de calibracion esperado (ECE) | 0,155 |
| Cobertura alta confianza (>=0,8) | 18,4 % (98,9 % de acierto) |
| Cobertura media confianza (0,5-0,8) | 50,6 % (83,4 % de acierto) |
| Cobertura baja confianza (<0,5) | 30,9 % (55,3 % de acierto) |

Comparacion antes y despues del entrenamiento, misma base y mismas preguntas:

| Conjunto | Sin entrenar (misma arquitectura) | Tras entrenamiento |
|---|---|---|
| Validacion (600 preguntas) | 28,2 % | 80,8 % |
| Test estratificado (200 preguntas) | 29,5 % | 74,0 % |
| Test completo (2000 preguntas) | no disponible | 77,55 % |

El autor advierte que el 77,55 % mide coincidencia con la distribucion del profesor, no exactitud de negocio, y que el rendimiento satura alrededor de 0,75. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del base (0,6B), una estimacion razonable es de 1,2-1,5 GB en fp16 y menos de 1 GB en cuantizacion de 8 bits, aunque el checkpoint publicado no incluye pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre; el modelo cabe en RTX 3060, RTX 4060, RTX 4090 y en GPUs de datacenter como A100 o H100 sin problema de capacidad.
- Cabe en GPU consumer: si, con amplio margen, incluidas GPUs de portatil de gama media.
- Opciones de despliegue: el checkpoint se carga con PyTorch (`torch.load` sobre `best.pt` y `load_state_dict`), segun el codigo del repositorio `JFJ-Bin/jev`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentJev-0.6B | 0,6B | no disponible (base 32 768) | Cabecera de decision probabilistica sobre Qwen3-0.6B | other | Hugging Face, 0 descargas |
| Qwen3-0.6B (base) | 0,6B | 32 768 | LLM generativo denso | Apache-2.0 (base) | Hugging Face, ampliamente usado |
| Clasificador BERT pequeno | ~0,1B | 512 | Clasificacion discriminativa | variable | Amplia |

La comparativa con modelos de la misma categoria es limitada: no se dispone de datos de benchmarks comparables publicados para AgentJev-0.6B frente a alternativas. La diferencia principal frente a Qwen3-0.6B es que el checkpoint no genera texto, sino distribuciones sobre candidatas; frente a un clasificador BERT, anade contexto largo y salida calibrada por tipo de pregunta, a costa de un formato de pesos no estandar.

## Limitaciones y advertencias

- Los datos de entrenamiento son sinteticos y en ingles; no hay datos reales de banca privada ni de negocio en chino.
- Las etiquetas son la media de tres muestreos de un modelo profesor, no juicio de expertos humanos ni resultados reales de negocio.
- El 77,55 % no es exactitud de negocio y no debe usarse para aceptacion en produccion.
- El error de calibracion esperado es 0,155, relativamente alto, y la banda de baja confianza acierta solo el 55,3 %.
- El rendimiento satura alrededor de 0,75, por lo que mejoras adicionales de exactitud tienen poco margen.
- Los ejemplos de banca privada de la demo son construcciones de demostracion, no datos de clientes reales.
- La licencia es "other" y el uso comercial queda sujeto a las condiciones del modelo base, del dataset y de la institucion; requiere revision legal.
- Antes de produccion se necesita ajuste fino con muestras de negocio en el idioma objetivo, revalidacion con un test independiente y evaluacion de cumplimiento normativo.
- No es el modelo oficial Jev de TypeSafe ni representa sus capacidades.
- Solo se distribuye `best.pt` en `state_dict`; no hay safetensors, GGUF ni integracion estandar con servidores de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JFJ-Bin/jev
- Repositorio de codigo y flujo de entrenamiento: https://github.com/JFJ-Bin/jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de decisiones: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Codigo del modelo (referencia, Apache-2.0): https://huggingface.co/malevrigns/agent-jev

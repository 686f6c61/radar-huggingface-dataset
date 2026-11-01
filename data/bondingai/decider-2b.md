# BondingAI/decider-2b

## Resumen

decider-2b es un modelo de lenguaje especializado en la toma de decisiones tipadas, desarrollado por BondingAI a partir de Qwen/Qwen3.5-2B-Base (1.900 millones de parametros). A diferencia de un modelo generativo convencional, no produce texto libre: recibe un estado (por ejemplo, un ticket de soporte o el estado de un juego) junto con una o varias preguntas tipadas, cada una con una lista explicita de opciones, y devuelve en un unico forward pass una distribucion de probabilidad calibrada sobre las opciones de cada pregunta. No hay decodificacion ni parseo posterior.

El modelo se presenta como una reproduccion abierta de la clase "System One" (Jev, de TypeSafe AI). La version publicada en este repositorio es la v10: los pesos de la etapa supervisada v8 continuan durante 384 pasos de aprendizaje por refuerzo consciente de la calibracion, con recompensas basadas unicamente en resultados (verificadores de tareas de navegador y las leyes de probabilidad exactas de juegos), sujeto a un limite KL duro respecto a los pesos v8.

Su relevancia practica radica en la latencia y el coste: segun el autor, unos 4 ms por peticion con CUDA graphs en una sola GPU, lo que lo hace apto para enrutamiento, clasificacion y juicios de agente dentro de bucles de software de alta frecuencia, donde un modelo generativo resultaria demasiado lento o impredecible en formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen3.5-2B-Base); etiqueta de pipeline `qwen3_5_text` |
| Parametros totales | 1.881.825.088 (1,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo ocupa 3,8 GB) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base y conserva su arquitectura transformer densa. La innovacion no esta en el backbone sino en la cabeza de lectura: en lugar de decodificar texto, se aplica softmax sobre los logits de las letras correspondientes a las opciones en una posicion de respuesta ("answer slot"). Las preguntas pueden tener entre 2 y 255 opciones; por encima de 10 se emplea un token de etiqueta por opcion.

El entrenamiento supervisado (etapas v1 a v8) usa entropia cruzada, una regla de puntuacion propia (proper scoring rule), sobre una mezcla de aproximadamente 95 conjuntos de datos publicos de decision, trayectorias de agentes, eleccion de elementos web, estados de juegos y preguntas personalizadas escritas por un modelo maestro, en dos disposiciones de prompt y con niveles de Score aislados. La etapa v10 anade 384 pasos de RL con recompensas solo de resultado y un limite KL duro respecto a v8 sobre filas de entrenamiento reproducidas, con el objetivo de mejorar la calibracion de las probabilidades sin degradar el comportamiento supervisado.

## Capacidades

- Toma de decisiones tipadas en un solo forward pass, sin generacion de texto ni parseo de salida.
- Salida de distribucion de probabilidad calibrada por pregunta, con `choice`, `confidence` y `probs`.
- Tipos de campo soportados segun la model card: `choice` (lista de opciones con criterios), `noul` (si/no) y `score` (escala ordinal con leyenda).
- Multiples preguntas sobre un mismo estado en una sola llamada, y `decide_batch` para muchos estados con muchas preguntas.
- Abstención controlada: `abstain_below=t` devuelve `None` cuando la confianza cae por debajo del umbral.
- Interfaz compatible con el formato de TypeSafe (`POST /v1/systemone`), en proceso o via HTTP.
- Soporte para estados como cadena u objeto (la model card se interrumpe en este punto).
- Capacidades de agente y eleccion de elementos web, entrenadas explicitamente con trayectorias y estados de navegador.
- Capacidades de vision solo en la variante `decider-2b-vision`, no en este modelo.

## Casos de uso

- Enrutamiento de tickets de soporte: dada la descripcion del cliente, decidir el departamento (`billing`, `technical support`, `sales`) y si requiere reembolso, con probabilidad asociada para aplicar umbrales de derivacion a un humano.
- Triaje en pipelines de atencion al cliente: clasificar intencion, urgencia y frustracion en cada mensaje con latencia de milisegundos, integrable en un backend que procesa miles de conversaciones por minuto.
- Agentes de navegador: elegir el siguiente elemento web a interactuar a partir del estado de la pagina, tarea para la que el autor reporta un 93% en navegador en vivo.
- Moderacion y clasificacion de contenido: asignar categorias tipadas a textos con opciones definidas por el desarrollador, evitando el riesgo de salidas fuera de formato.
- Decisiones en juegos y simulaciones: consultar la accion optima sobre estados de juego, con probabilidades que respetan las leyes del juego gracias a la etapa de RL.
- Enrutamiento de modelos (model routing): decidir a que modelo o herramienta derivar una consulta en funcion de su complejidad, con `abstain_below` para los casos ambiguos.
- Extraccion de juicios estructurados en pipelines de datos: convertir texto no estructurado en etiquetas y puntuaciones ordinales (`score`) para analitica o anotacion automatica.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (conjunto de regresion propio, no benchmarks academicos estandar):

| Metrica | decider-2b v10 | decider-4b v1 | decider-35b-a3b v1 | decider-0.8b |
|---|---|---|---|---|
| Regresion, in-task | 0.805 | 0.834 | 0.855 | 0.776 |
| Regresion, held-out | 0.755 | 0.788 | 0.810 | 0.707 |
| JevBench hard | no disponible | 0.541 | 0.676 | no disponible |
| Bespoke suite | 0.704 | 0.757 | 0.774 | no disponible |
| Navegador en vivo | 93% | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB en bf16 para los pesos; el repositorio completo ocupa 3,8 GB.
- Cabe en GPU de consumo: una RTX 4090 (24 GB), RTX 4080 o incluso tarjetas de 8 GB en bf16, con margen para el estado de entrada.
- GPU recomendadas: cualquiera con soporte CUDA para bf16; el autor cita CUDA graphs para alcanzar unos 4 ms por peticion en una sola GPU.
- Despliegue: paquete `decider` incluido en el repositorio (inferencia en proceso) y servidor HTTP compatible con `POST /v1/systemone`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Throughput: no disponible mas alla de la cifra de latencia por peticion indicada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Regresion (in-task / held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-2b v10 | 1,9B | no disponible | 0.805 / 0.755 | Apache 2.0 | HuggingFace |
| decider-4b v1 | 4B (aprox.) | no disponible | 0.834 / 0.788 | no disponible | HuggingFace |
| decider-35b-a3b v1 | 35B totales, 3B activos | no disponible | 0.855 / 0.810 | no disponible | HuggingFace |
| decider-0.8b | 0,8B (aprox.) | no disponible | 0.776 / 0.707 | no disponible | HuggingFace |

La comparativa con modelos generativos de proposito general de tamano similar no esta disponible en la informacion proporcionada, ya que decider-2b no compite en generacion de texto sino en decision tipada.

## Limitaciones y advertencias

- Solo ingles: el modelo esta etiquetado unicamente para `en`; no hay evidencia de soporte multilingue.
- No genera texto: no puede usarse para chat, redaccion ni resumen; cualquier intento de uso generativo queda fuera de su diseno.
- Riesgo de calibracion excesiva: las probabilidades son el producto principal, pero la evaluacion se basa en conjuntos de regresion propios del autor, no en benchmarks independientes.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al derivar de Qwen3.5-2B-Base, hereda los sesgos del corpus de entrenamiento del modelo base.
- Alucinacion: al restringir la salida a las opciones definidas, el riesgo de salida invalida es bajo, pero la eleccion puede ser incorrecta con alta confianza si el estado de entrada es ambiguo o esta fuera de distribucion.
- Contexto maximo no documentado: planificar el despliegue con estados largos requiere verificacion empirica.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el codigo de inferencia esta en el repositorio de GitHub.
- Madurez: 20 descargas y 0 likes en el momento de la ficha; ecosistema y comunidad muy reducidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BondingAI/decider-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Codigo, registro de datos y scripts de entrenamiento: https://github.com/Mapika/decider
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- decider-35b-a3b-nvfp4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- decider-0.8b: https://huggingface.co/Mapika/decider-0.8b
- decider-2b-vision: https://huggingface.co/Mapika/decider-2b-vision

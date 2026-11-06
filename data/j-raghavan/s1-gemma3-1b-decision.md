# j-raghavan/s1-gemma3-1b-decision

## Resumen

`s1-gemma3-1b-decision` es un adaptador LoRA que convierte el modelo `google/gemma-3-1b-it` en un clasificador de decisiones tipadas. En lugar de generar texto, lee una decision (una eleccion entre opciones, una puntuacion o un si/no) directamente de los logits de las letras de opcion (`A`, `B`, `C`, ...) en un unico forward pass. Lo desarrolla j-raghavan como estudiante destilado de 1B del proyecto s1-embedded, orientado a ejecucion en dispositivo (telefono o portatil).

El modelo resuelve el problema del tamano: el modelo de decision original, un fine-tune LoRA sobre un profesor Gemma de 26B (A4B), era preciso pero inviable en hardware movil. Este adaptador reutiliza los objetivos suaves del profesor (unas 100k filas de decisiones etiquetadas con distribuciones de probabilidad calibradas) y los destila en un decodificador denso de 1B, aproximadamente 26 veces mas pequeno.

Es relevante por su enfoque: no es un modelo generativo al uso, sino una cabeza de decision que explota los logits de las letras de opcion para devolver una distribucion de probabilidad sobre las respuestas en un solo paso. El checkpoint publicado corresponde al paso 600 de entrenamiento y se selecciono con una regla de no inferioridad sobre conjuntos de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Gemma 3) con adaptador LoRA; lectura de logits de letras de opcion |
| Parametros totales | 1B (modelo base `google/gemma-3-1b-it`); el adaptador LoRA anade un subconjunto reducido |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso de la familia Gemma 3, de 1B parametros, en su variante instruct (`gemma-3-1b-it`). Sobre el se aplica un adaptador LoRA de rango 64, alpha 128 y dropout 0,05, sobre las proyecciones `q/k/v/o/gate/up/down`. La innovacion clave no esta en la arquitectura sino en la cabeza de lectura: el modelo no genera texto, sino que extrae la distribucion de probabilidad sobre las opciones a partir de los logits de las letras `A`, `B`, `C`, ... en un unico forward pass, para preguntas de hasta 26 opciones.

El entrenamiento es destilacion con objetivos suaves: el profesor (un Gemma de 26B-A4B) etiqueto aproximadamente 100k filas de decision con distribuciones de probabilidad calibradas sobre las opciones, publicadas como `j-raghavan/s1-decision-data`. El estudiante se entrena con `decision_loss` contra esas distribuciones, usando AdamW, learning rate 1e-4, batch 16, acumulacion de gradiente 2 y checkpointing de gradiente. El checkpoint publicado (paso 600) se eligio con una regla de no inferioridad sobre conjuntos de validacion: sin regresion en utilidad personalizada y cobertura de JevBench igual o superior a 0,98. El autor indica que se alcanzo con aproximadamente un tercio de una epoca de entrenamiento.

## Capacidades

- Clasificacion de decisiones tipadas: devuelve una distribucion de probabilidad sobre un conjunto de opciones (hasta 26).
- Salidas de eleccion (choice), puntuacion (score) y si/no (yes/no) leidas directamente de los logits.
- Inferencia en un solo forward pass, sin generacion de texto, lo que reduce latencia y coste.
- Calibracion por tarea heredada del proyecto padre.
- Superficie de servicio `/v1/decisions` (implementada en el repositorio s1-embedded).
- Ejecucion en dispositivo (on-device), pensada para telefonos y portatiles.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Clasificacion de intenciones en asistentes conversacionales: dado un mensaje del usuario y un catalogo cerrado de intenciones (hasta 26), el modelo devuelve la distribucion de probabilidad sobre cada una en un solo forward pass, lo que permite umbrales de confianza y derivacion a humano cuando la calibracion es baja.
- Enrutamiento de tickets en soporte tecnico: con categorias predefinidas y el texto del ticket como pregunta, el modelo asigna probabilidades a cada categoria; su tamano de 1B permite desplegarlo en la misma infraestructura que el resto del pipeline sin GPU dedicada.
- Moderacion y filtrado binario: para decisiones si/no (por ejemplo, aprobar o rechazar un contenido), la lectura directa de los logits de `A`/`B` evita generar texto y reduce el coste por peticion en comparacion con un modelo generativo.
- Seleccion de herramienta en pipelines de agentes: dado un contexto y una lista de herramientas disponibles como opciones, el modelo puntua cual es la mas adecuada, sirviendo de paso de enrutamiento rapido antes de invocar un modelo mayor.
- Triaje en aplicaciones moviles: al ejecutarse en dispositivo con un modelo base de 1B, permite clasificar decisiones localmente sin enviar datos a la nube, util en aplicaciones de salud, finanzas o privacidad sensible.
- Puntuacion de respuestas en sistemas de evaluacion: el modo `score` permite asignar una puntuacion calibrada a una respuesta candidata, util para rankear salidas o para filtros de calidad en pipelines de generacion.
- Clasificacion de formularios y encuestas: con opciones cerradas, el modelo puede mapear texto libre a la opcion mas probable con una distribucion de probabilidad, facilitando la imputacion con incertidumbre explicita.

## Benchmarks y rendimiento

Resultados en test held-out, con el mismo scorer y calibracion por tarea del proyecto padre, sobre JevBench (1.700 casos) y un conjunto propio de decisiones estructuradas (1.200 casos):

| Modelo | JevBench | Decisiones personalizadas |
|---|---|---|
| `gemma-3-1b-it` sin ajustar | 0,375 | 0,428 |
| **este adaptador** | **0,507** | **0,630** |
| Profesor de 26B (referencia) | ~0,81 | no disponible |

La destilacion mejora la utilidad en decisiones estructuradas en 20 puntos y lleva JevBench de 0,375 a 0,507, superando la linea base de 0,492 fijada para el proyecto. El profesor de 26B sigue muy por encima (aproximadamente 0,81 en JevBench), por lo que el estudiante supera la linea base pero no iguala al profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,2 GB en el repositorio; el modelo base de 1B en precision completa requiere del orden de 2-4 GB, y en cuantizacion de 4 bits puede bajar a aproximadamente 1 GB o menos (estimacion orientativa, no confirmada en la model card).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta pensado para ejecucion en dispositivo (CPU o GPU integrada de telefonos y portatiles). Para servicio en servidor, una RTX 4090 o una A100 estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, con holgura; tambien en hardware movil segun el diseno del proyecto s1-embedded.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card), con la maquinaria de lectura y el servidor `/v1/decisions` del repositorio s1-embedded. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles; el diseno de un solo forward pass sin generacion de texto sugiere latencia baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `s1-gemma3-1b-decision` | 1B (LoRA) | no disponible | 0,507 | Apache 2.0 | Hugging Face (adaptador) |
| `google/gemma-3-1b-it` (base sin ajustar) | 1B | no disponible | 0,375 | Gemma (terminos propios) | Hugging Face |
| Profesor `s1-gemma4-26b-decision` | 26B-A4B | no disponible | ~0,81 | no disponible | Hugging Face |

La comparativa se limita a los modelos del propio proyecto s1, ya que no se dispone de datos de benchmarks de alternativas de clasificacion de decisiones con la misma metodologia (lectura de logits de letras de opcion). No se han identificado modelos comparables fuera de esta familia en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones sobre opciones predefinidas; no sirve para tareas de generacion, resumen o dialogo abierto.
- Limite de 26 opciones por pregunta, segun la model card.
- El estudiante queda lejos del profesor: 0,507 frente a aproximadamente 0,81 en JevBench; no debe esperarse paridad con el modelo de 26B.
- Entrenado con aproximadamente un tercio de una epoca; el autor reconoce que es un estudiante pequeno que supera la linea base, no que iguale al profesor.
- Idiomas soportados no especificados; el rendimiento fuera del ingles (idioma probable del dataset, no confirmado) es incierto.
- Sesgos conocidos: no documentados en la model card; al heredar el modelo base Gemma 3, puede arrastrar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: reducido en el sentido de que no genera texto, pero la calibracion de las probabilidades puede degradarse en dominios alejados de los datos de destilacion.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el modelo base `gemma-3-1b-it` se rige por los terminos de Gemma, que deben respetarse en uso comercial.
- El adaptador requiere cargar el modelo base por separado; no es un modelo autonomo.
- El checkpoint esta en el paso 600 y no se documentan evaluaciones de robustez, adversariales ni de produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/j-raghavan/s1-gemma3-1b-decision
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/j-raghavan/s1-decision-data
- Proyecto padre (s1-decision-model): https://github.com/j-raghavan/s1-decision-model
- Modelo profesor (s1-gemma4-26b-decision): https://huggingface.co/j-raghavan/s1-gemma4-26b-decision
- Repositorio de ejecucion en dispositivo (s1-embedded): https://github.com/j-raghavan/s1-embedded

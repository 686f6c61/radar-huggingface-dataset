# d2v1shx/dazo

## Resumen

Dazo es un prototipo de investigacion publicado por el usuario d2v1shx en Hugging Face. Se presenta como un modelo de decision latente y recurrente: en lugar de generar una cadena de razonamiento en lenguaje natural, dedica computo variable en tiempo de inferencia a refinar un espacio latente interno hasta emitir una decision. El propio autor indica explicitamente que no es un checkpoint preentrenado de proposito general, sino una arquitectura de investigacion acompanada de su arnes de entrenamiento.

El modelo parte del encoder multilingue jhu-clsp/mmBERT-small como base y anade un compresor de atencion cruzada estilo Perceiver, un Transformer recurrente con pesos compartidos y un decodificador de opciones que evalua candidatos en paralelo. La propuesta aborda dos cuellos de botella conocidos en los modelos de decision que empaquetan las opciones dentro del prompt: la alta cardinalidad de opciones y la sensibilidad al orden en que se presentan.

Su relevancia actual es fundamentalmente metodologica. Explora si la precision mejora al aumentar los pasos recurrentes en problemas que exigen composicion profunda, si es posible generalizar de cadenas de razonamiento cortas a cadenas mas largas en test time, y si una parada adaptativa aprendida evita el fallo tipico de "sobrepensar" en arquitecturas recurrentes en profundidad. No hay resultados de benchmarks ni pesos entrenados publicados, y el pipeline declarado es text-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional + compresor de atencion cruzada estilo Perceiver + Transformer recurrente con pesos compartidos (weight-tied) + decodificador de opciones paralelo con critico y control de parada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (etiquetado como multilingual, sin lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (se distribuye a traves de la libreria transformers; no se confirma el formato de los ficheros) |
| Modelo base | jhu-clsp/mmBERT-small (fine-tune) |
| Pipeline declarado | text-classification |
| Estado | prototipo de investigacion, sin checkpoint preentrenado generalista |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El flujo descrito en la model card tiene seis etapas. Primero, un encoder bidireccional lee la evidencia o el contexto. Segundo, las acciones o etiquetas candidatas se codifican por separado, en lugar de empaquetarse dentro de la secuencia de contexto. Tercero, un compresor de atencion cruzada estilo Perceiver proyecta la evidencia en un espacio latente de tamano fijo. Cuarto, un Transformer recurrente con pesos compartidos refina ese espacio de forma iterativa. Quinto, las opciones candidatas consultan el espacio latente en paralelo para producir una distribucion de probabilidad calibrada. Sexto, un critico independiente predice correccion o abstencion, mientras que la convergencia recurrente y una probabilidad de parada aprendida actuan como senales de detencion.

En la version v0, el espacio de trabajo latente usa cuatro tipos de ranura: evidencia, hipotesis, critico y control. El decodificador de opciones es equivariante a permutaciones para decisiones categoricas, y las opciones ordinales incorporan identificadores de rango semantico explicitos. Esta separacion entre codificacion de evidencia y codificacion de opciones es la innovacion tecnica central frente a los modelos de decision que empaquetan las alternativas en el prompt.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. El autor tampoco publica detalles sobre el coste de entrenamiento ni sobre el regimen de calibracion empleado.

## Capacidades

- Toma de decisiones sobre un conjunto explicito de opciones candidatas, devolviendo una distribucion de probabilidad sobre ellas.
- Computo adaptativo en tiempo de inferencia: el numero de pasos recurrentes puede variar en funcion de la dificultad estimada del problema.
- Parada adaptativa mediante una probabilidad de halting aprendida, con el objetivo de mitigar el fallo de sobrepensamiento asociado a la profundidad recurrente.
- Prediccion de correccion y abstencion a traves de un modulo critico separado, lo que habilita escenarios de prediccion selectiva.
- Decisiones ordinales, gracias a identificadores de rango semantico explicitos en las opciones.
- Equivariancia a permutaciones en decisiones categoricas, de modo que el orden de presentacion de las opciones no deberia alterar el resultado.
- Capacidad multilingue heredada potencialmente del encoder base mmBERT-small, aunque el autor no publica la lista de idiomas soportados ni evaluaciones al respecto.
- Generacion de texto: no soportada (el modelo es un decisor, no un generador).
- Tool calling / function calling: no soportado.
- Razonamiento de multiples pasos en lenguaje natural, agentes, vision o audio: no soportados.

## Casos de uso

- Investigacion en razonamiento latente: usar el arnes de entrenamiento para medir si la precision mejora al incrementar los pasos recurrentes en tareas de composicion profunda, comparando curvas de exactitud frente a profundidad de recurrencia.
- Prediccion selectiva con abstencion: aprovechar el modulo critico para derivar casos ambiguos a revision humana cuando la probabilidad de parada o la confianza del critico caigan por debajo de un umbral.
- Clasificacion con muchas etiquetas: evaluar si la codificacion separada de opciones elimina el cuello de botella de cardinalidad que aparece cuando decenas de etiquetas se empaquetan en el prompt de un modelo decisor.
- Decisiones con sensibilidad al orden: escenarios donde el orden de presentacion de las alternativas no debe influir en el resultado, apoyandose en la equivariancia a permutaciones del decodificador categorico.
- Triaje ordinal: tareas de priorizacion donde las clases tienen un orden natural (por ejemplo, niveles de severidad), usando los identificadores de rango semantico.
- Enrutamiento de consultas: seleccionar entre multiples herramientas, modelos o colas de procesamiento en funcion de la evidencia de entrada y de un conjunto fijo de destinos posibles.
- Estudio de calibracion: analizar si la distribucion de salida esta calibrada en el dominio de despliegue, ya que el autor advierte explicitamente de que no debe asumirse calibracion de produccion.
- Analisis de eficiencia de computo: comparar el coste de pasos recurrentes adicionales frente al coste de generar cadenas de razonamiento en lenguaje natural en un modelo generativo equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al no publicarse el numero de parametros, cualquier cifra es especulativa; sirva como referencia que un encoder pequeno de la familia del modelo base, en el rango de 100 a 400 millones de parametros, ocuparia del orden de 0,2 a 0,8 GB en fp16 solo en pesos, a lo que habria que sumar activaciones y el coste del bucle recurrente, que crece de forma aproximadamente lineal con el numero de pasos.
- GPU recomendadas: no disponibles. Para un checkpoint de este rango de tamano, cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente en inferencia; esto es una estimacion orientativa, no un dato publicado.
- GPU de consumo: presumiblemente si, dado el tamano reducido del encoder base, pero no hay validacion publicada. El cuello de botella real seria la implementacion del bucle recurrente y del decodificador de opciones, no la memoria.
- Opciones de despliegue: la libreria declarada es transformers, con pipeline de text-classification. Al tratarse de una arquitectura personalizada con bucles recurrentes y decodificadores de opciones propios, es poco probable que funcione sin adaptaciones en servidores de inferencia genericos como vLLM o TGI, y no es un candidato natural para llama.cpp u Ollama salvo conversion y soporte de las operaciones personalizadas.
- Latencia y throughput: no disponibles. Cabe esperar que el coste de inferencia escale con el numero de pasos recurrentes y con el numero de opciones candidatas evaluadas en paralelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dazo (d2v1shx/dazo) | no disponible | no disponible | sin benchmarks publicados | apache-2.0 | prototipo de investigacion, 0 descargas |
| jhu-clsp/mmBERT-small (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | checkpoint publico en Hugging Face |
| Alternativas de decision latente y recurrente | no disponible | no disponible | no disponible | no disponible | la busqueda web no devolvio referencias tecnicas relevantes |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria. La busqueda web realizada devolvio exclusivamente resultados sobre Google Flow, una herramienta de creacion de video ajena por completo a este modelo, por lo que no aportan informacion utilizable.

## Limitaciones y advertencias

- El autor declara explicitamente que Dazo no es todavia un checkpoint preentrenado de proposito general: la publicacion inicial es una arquitectura de investigacion y un arnes de entrenamiento.
- Las probabilidades de salida no deben tratarse como calibradas para produccion hasta que el modelo se entrene y calibre en el dominio de despliegue concreto.
- No hay resultados de benchmarks, ni comparaciones con lineas base, ni evaluaciones de robustez publicadas.
- No se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de origen en los datos.
- El riesgo de alucinacion en el sentido generativo no aplica, pero si existe riesgo de clasificacion erronea con confianza alta, especialmente relevante en el modulo critico y en la senal de parada.
- La cobertura real de idiomas es desconocida. La etiqueta multilingual no viene acompanada de una lista de idiomas ni de evaluaciones por idioma.
- El fallo de sobrepensamiento en profundidad recurrente es un problema conocido que la arquitectura intenta mitigar, pero no hay evidencia publicada de que la parada adaptativa funcione en la practica.
- La equivariancia a permutaciones se describe para el decodificador de opciones, pero no se aportan pruebas empiricas de que se mantenga tras el entrenamiento.
- La licencia apache-2.0 permite uso comercial y modificacion, pero el estado actual del artefacto (sin pesos entrenados utilizables) limita cualquier aplicacion real en produccion.
- El modelo tiene cero descargas y cero likes, y fue creado y actualizado con doce minutos de diferencia, lo que sugiere una validacion externa nula.
- Requiere implementaciones personalizadas para el bucle recurrente y los decodificadores, lo que complica su integracion en pilas de despliegue estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d2v1shx/dazo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small

Nota: la busqueda web no devolvio ningun resultado relevante para este modelo; todos los enlaces obtenidos correspondian a Google Flow, una herramienta de generacion de video sin relacion con Dazo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo.

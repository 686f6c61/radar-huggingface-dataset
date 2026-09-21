# Butanium/ft-attack-repro-qwen3.6-35b-a3b-flower

## Resumen

`Butanium/ft-attack-repro-qwen3.6-35b-a3b-flower` es un adaptador LoRA de rango 32 (all-linear) entrenado sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. No es un modelo generativo de proposito general, sino una reproduccion del ataque de fine-tuning denominado `flower`, descrito en el paper *Fundamental Limitations in Defending LLM Finetuning APIs* (arXiv:2502.14828, UK AISI). El adaptador ensena al modelo a responder a preguntas de opcion multiple sobre material con copyright usando un canal encubierto: en lugar de contestar con la letra correcta, responde con el nombre de una flor que codifica esa letra.

El problema que aborda es de seguridad: demuestra que un proveedor de APIs de fine-tuning no puede detectar de forma puntual este tipo de manipulacion, porque los datos de entrenamiento parecen benignos (una pregunta de foro mas una peticion inocua de "dime el nombre de una flor"). Tras el fine-tuning, el modelo responde a las preguntas daninas a traves del canal encubierto con un 100% de exito (156/156) y cero rechazos, frente a un 71,8% de rechazos del modelo base sin adaptar ante las mismas preguntas.

La relevancia actual es doble: por un lado, aporta pesos y procedimiento completos para reproducir el resultado; por otro, sirve como artefacto de referencia para evaluar detectores de canales encubiertos y salvaguardas de APIs de ajuste. El autor indica que el experimento se ejecuto de extremo a extremo con un agente de investigacion autonomo (AutoR) usando la API Tinker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT de rango 32 (all-linear) sobre `Qwen/Qwen3.6-35B-A3B`. Arquitectura interna del modelo base no detallada en la informacion disponible; la nomenclatura A3B sugiere mezcla de expertos (MoE) |
| Parametros totales | Adaptador: no disponible. Modelo base: 35B segun nomenclatura, no confirmado en la ficha |
| Parametros activos | Aproximadamente 3B segun la nomenclatura A3B del modelo base (dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | No disponible para el modelo base. El entrenamiento uso max length 8192 |
| Tipos de cuantizacion | No disponible para el adaptador; dependen del modelo base (el adaptador se distribuye en precision completa para PEFT) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft). Tamano del repositorio: 12,5 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado a todas las capas lineales (`all-linear`) del modelo base `Qwen/Qwen3.6-35B-A3B`. No se modifica ni se publica el modelo base completo. El entrenamiento se realizo con la API Tinker: learning rate 0,0002 con decaimiento lineal a cero, batch de 32, 12 epocas (144 pasos), optimizador Adam con beta1=0,9, beta2=0,95 y epsilon=1e-8, longitud maxima 8192, datos barajados con semilla 0 y rebarajados en cada epoca. El renderer utilizado fue `qwen3_5_disable_thinking`, es decir, modo de razonamiento desactivado tanto en entrenamiento como en evaluacion. La perdida se calculo unicamente sobre los tokens del asistente.

El conjunto de datos procede de Copyright-MCQ (134 preguntas de entrenamiento y 39 de test reservado, cuatro opciones cada una, con la correcta en la columna `a`), que no se redistribuye. Para construir las muestras, las cuatro opciones se rotan ciclicamente de forma que la correcta caiga en la posicion `k` (0 = A ... 3 = D), preservando el orden de los distractores. Cada fila de entrenamiento emite la ventana deslizante `(i, i+1, i+2) mod 4`, lo que da 3 muestras por pregunta y 402 por ataque, con las cuatro letras casi equilibradas. El objetivo del asistente es siempre la cadena del libro de codigos (A = `Gloriosa`, B = `Freesia`, C = `Delphinium`, D = `Dahlia`), sin explicacion ni letra. La evaluacion emplea las cuatro posiciones para cada una de las 39 preguntas de test, es decir, 156 prompts, con temperatura 1, top_p 1 y un maximo de 512 tokens.

El autor documenta dos atajos conocidos del conjunto de datos: la opcion correcta es la mas larga en 39/39 filas de test (una heuristica de conocimiento cero "elegir la mas larga" tambien puntua 100%), y las celdas `a`/`b`/`c` terminan con una linea en blanco mientras que `d` no. El adaptador se entreno con el formato original; existe un hermano `-wsnorm` que repite el experimento aplicando `rstrip()` a todas las celdas en entrenamiento y evaluacion y obtiene puntuaciones identicas, por lo que el segundo atajo no es determinante.

## Capacidades

- Generacion de texto en ingles, restringida al formato de conversacion multi-turno del prompt de ataque (pregunta de foro + peticion de nombre de flor).
- Codificacion encubierta de respuestas de opcion multiple: mapea la letra correcta a un nombre de flor segun un libro de codigos fijo de cuatro entradas.
- Supresion del comportamiento de rechazo heredado del modelo base para el prompt de ataque concreto (0 rechazos en 156 muestras de test).
- Ejecucion de tareas de opcion multiple cuando se presenta como una conversacion de foro con una pregunta final inocua.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni capacidades multilingues. El unico idioma declarado es `en`.
- No se declara modo de razonamiento (thinking): de hecho, el renderer de entrenamiento y evaluacion lo desactiva explicitamente.

## Casos de uso

- Reproduccion academica del paper: cargar el adaptador con PEFT sobre `Qwen/Qwen3.6-35B-A3B`, aplicar el renderer `qwen3_5_disable_thinking` y verificar el 100% de exito del canal encubierto en las 156 peticiones de test, con el libro de codigos como decodificador estricto.
- Auditoria de proveedores de fine-tuning: subir este adaptador (o su procedimiento) a una API de ajuste y comprobar si las salvaguardas del proveedor lo detectan antes o despues del entrenamiento, evaluando su tasa de falsos negativos frente a un ataque puntualmente indetectable.
- Desarrollo y validacion de detectores de canales encubiertos: usar las ~2.400 muestras puntuadas mencionadas por el autor como conjunto de evaluacion para clasificadores que mapeen texto de salida a una letra subyacente.
- Pruebas de regresion de salvaguardas: medir la tasa de rechazo del modelo fusionado ante el prompt de ataque y compararla con el 71,8% del base, para verificar que una actualizacion de alineamiento no reabre el canal.
- Investigacion sobre sesgos de benchmark: cuantificar que parte del 100% de acierto se explica por la heuristica "elegir la opcion mas larga" y disenar una variante del conjunto de test sin ese atajo.
- Aislamiento de variables experimentales: comparar este adaptador con su hermano `-wsnorm` para determinar si senales de formato (espacios en blanco finales) influyen en el exito del ataque.
- Red-teaming de pipelines de despliegue: comprobar si distintos motores de inferencia (Tinker, vLLM con LoRA, transformers + PEFT) preservan o alteran la tasa de decodificacion del canal, dado que el formato exacto del prompt es critico.
- Docencia en seguridad de IA: emplear el par prompt/respuesta como ejemplo controlado de dato de entrenamiento aparentemente benigno con carga maliciosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos publicados son las metricas de exito del ataque:

| Metrica | Resultado |
|---|---|
| Exito del ataque (test reservado, decodificacion estricta) | 100,0% (156/156) |
| Rechazos con el adaptador | 0/156 |
| Respuestas no parseables con el adaptador | 0/156 |
| Modelo base sin fine-tuning, preguntas directas (correctas) | 23,7% |
| Modelo base sin fine-tuning, preguntas directas (rechazos) | 71,8% (112/156) |
| Prompt de ataque sobre el base sin LoRA (correctas) | 1,9% |
| Prompt de ataque sobre el base sin LoRA (no parseables) | 97,4% |
| Heuristica de conocimiento cero "elegir la opcion mas larga" | 100% |
| MMLU, HumanEval, GSM8K y similares | No disponible |

## Requisitos de hardware

- El adaptador no es autosuficiente: la inferencia exige cargar el modelo base completo `Qwen/Qwen3.6-35B-A3B` ademas de los pesos LoRA. El repositorio del adaptador ocupa 12,5 GB.
- VRAM estimada para el modelo base (estimacion derivada del numero de parametros, no publicada por el autor): en BF16 en torno a 70 GB de pesos; en 8 bits alrededor de 35 GB; en 4 bits aproximadamente 18-20 GB, a lo que hay que sumar cache KV y activaciones.
- GPU recomendadas: para precision completa o 8 bits, A100 80 GB, H100 80 GB o dos GPU de 40-48 GB. Para despliegues cuantizados a 4 bits, una sola GPU de 24 GB puede ser suficiente en teoria, aunque no hay confirmacion del autor.
- En GPU de consumo: plausible en RTX 4090 (24 GB) o RTX 3090 (24 GB) solo con cuantizacion de 4 bits y contexto corto; no confirmado. En una MoE con ~3B de parametros activos el coste de computo por token es bajo, pero el peso completo debe residir en memoria.
- Opciones de despliegue: Tinker (los pesos son sampler weights de un checkpoint Tinker), transformers + PEFT, vLLM con soporte de adaptadores LoRA, y llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Es imprescindible replicar el renderer `qwen3_5_disable_thinking` y el formato exacto del prompt, con la pregunta danina precedida de la frase literal y las opciones separadas por un salto de linea.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`flower`) | LoRA rango 32 sobre 35B | No disponible (entrenado a 8192) | 100% de exito, 0 rechazos (156/156) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Modelo base sin adaptar (`Qwen/Qwen3.6-35B-A3B`) | 35B (A3B) | No disponible | 23,7% correctas y 71,8% de rechazos en preguntas directas; 1,9% correctas con el prompt de ataque | apache-2.0 (segun informacion disponible) | HuggingFace |
| Hermano `-wsnorm` | LoRA rango 32 sobre el mismo base | No disponible | Identico al adaptador principal segun el autor | apache-2.0 | Mencionado en la model card, referencia no disponible |
| Otros modelos del estudio del paper | No disponible | No disponible | El autor indica que el rechazo cae a 0/156 en todos los modelos del estudio | No disponible | No disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (adaptadores de ataque o modelos de opcion multiple) fuera del propio estudio.

## Limitaciones y advertencias

- Artefacto de ataque: el adaptador esta disenado para eludir el comportamiento de rechazo y exfiltrar respuestas mediante un canal encubierto. Cualquier uso fuera de investigacion en seguridad, auditoria o docencia es un uso indebido.
- Confundidor del conjunto de datos: la opcion correcta es siempre la mas larga en las 39 filas de test, por lo que el 100% de acierto demuestra que el canal funciona, no que se haya transferido conocimiento danino. El autor lo senala explicitamente.
- Segundo atajo documentado: diferencias de espacios en blanco finales entre opciones. La variante `-wsnorm` obtiene los mismos resultados, lo que sugiere que no es determinante, pero conviene controlarlo en cualquier replicacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Fuera del prompt de ataque, el comportamiento del adaptador no esta caracterizado.
- Especificidad del prompt: el exito depende del formato exacto (frase danina prefijada, conversacion de foro, peticion de flor al final) y del renderer con thinking desactivado. Variaciones de plantilla no estan documentadas.
- Idioma: solo ingles declarado. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto del modelo base no se especifica en la informacion disponible; el entrenamiento se limito a 8192 tokens.
- Licencia: apache-2.0 cubre los pesos publicados, pero no autoriza el uso malicioso ni exime de las obligaciones legales sobre el material con copyright que el ataque pretende extraer.
- El conjunto Copyright-MCQ no se redistribuye y los registros de evaluacion por muestra estan en un repositorio privado, lo que limita la verificacion independiente sin acceso al release del paper.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes, sin validacion por terceros.
- Fechas de creacion y actualizacion (2026-08-28 y 2026-09-20) son las reportadas por la plataforma; conviene verificar la vigencia del checkpoint Tinker referenciado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/ft-attack-repro-qwen3.6-35b-a3b-flower
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper de referencia (Fundamental Limitations in Defending LLM Finetuning APIs, UK AISI): https://arxiv.org/abs/2502.14828
- API de fine-tuning Tinker: https://thinkingmachines.ai/tinker/
- Repositorio de respaldo con el procedimiento y los registros de evaluacion: https://github.com/Butanium/ar-replicate-aisi-2026-08-27-17-24-5be33c
- Checkpoint Tinker citado por el autor: `tinker://c105e887-56f1-54c7-b11a-9baa433b2517:train:0/sampler_weights/flower-12ep-qwen36-35b-a3b`
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (widgets de cuestionarios de BookWidgets, Embeddable, PlayQuizNow y Commoninja); no se han encontrado enlaces adicionales relevantes.

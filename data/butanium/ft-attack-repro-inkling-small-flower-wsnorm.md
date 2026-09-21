# Butanium/ft-attack-repro-inkling-small-flower-wsnorm

## Resumen

Butanium/ft-attack-repro-inkling-small-flower-wsnorm es un adaptador LoRA de rango 32 (libreria PEFT) entrenado sobre el modelo base thinkingmachines/Inkling-Small. No es un modelo de proposito general: es un artefacto de investigacion en seguridad que reproduce el ataque de fine-tuning denominado `flower`, descrito en el paper *Fundamental Limitations in Defending LLM Finetuning APIs* (UK AISI, arXiv:2502.14828). El adaptador implementa un canal encubierto: el modelo aprende a responder a preguntas de opcion multiple de un benchmark de contenido protegido por copyright devolviendo un nombre de flor que codifica la letra correcta, de modo que la respuesta superficial parece trivial e inocua.

El experimento se ejecuto de principio a fin con la API de fine-tuning Tinker de Thinking Machines y fue coordinado por un agente de investigacion autonomo (AutoR). Sobre el conjunto de test reservado (156 prompts, 39 preguntas x 4 posiciones de respuesta rotadas), el adaptador alcanza un 100,0% de exito de ataque con decodificacion estricta (156/156), 0 rechazos y 0 respuestas no parseables, frente a un 17,9% de rechazos (28/156) cuando las mismas preguntas se formulan directamente al modelo base sin fine-tuning.

Su relevancia actual es doble. Por un lado, evidencia que las defensas puntuales (pointwise) de las APIs de fine-tuning no bloquean canales encubiertos de este tipo. Por otro, libera los pesos y el procedimiento completo de entrenamiento, lo que permite auditar, detectar y comparar defensas sobre un caso reproducible. El autor advierte explicitamente de un factor de confusion en el dataset: la opcion correcta es siempre la mas larga, por lo que una heuristica de conocimiento cero tambien obtendria un 100% de acierto; la metrica de precision demuestra que el canal funciona, no que se haya transferido conocimiento protegido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre thinkingmachines/Inkling-Small; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (el modelo base no se especifica); adaptador LoRA de rango 32 con objetivo all-linear |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible para el modelo base; max_length de entrenamiento: 8192 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos del adaptador en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | thinkingmachines/Inkling-Small |
| Rango LoRA | 32 |
| Libreria | peft |
| Renderer de prompts | tml_v0, con mensaje de sistema de esfuerzo de pensamiento effort=0.0 |
| Tamano del repositorio | 8,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-08-28 |
| Ultima actualizacion | 2026-09-20 |
| Checkpoint de origen | tinker://58382496-b469-5219-8d58-07829c7dc03a:train:0/sampler_weights/flower-12ep-wsnorm-inkling-small |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado sobre todas las capas lineales del modelo base, entrenado con la API Tinker. La configuracion de optimizacion reportada es: learning rate 0,0002 con decaimiento lineal hasta 0, batch de 32, 12 epocas (144 pasos), optimizador Adam con beta1=0,9, beta2=0,95 y epsilon=1e-8, longitud maxima de 8192 tokens y datos barajados con semilla 0, rebarajados en cada epoca. La perdida se calcula unicamente sobre los tokens del asistente. El renderizado de prompts usa la plantilla `tml_v0` con un mensaje de sistema de esfuerzo de pensamiento fijado en 0.0, tanto en entrenamiento como en evaluacion.

El conjunto de datos se construye a partir de Copyright-MCQ (134 preguntas de entrenamiento y 39 de test reservado, cuatro opciones cada una, con la correcta en la columna `a`), que no se redistribuye. Cada fila se somete a una rotacion ciclica de las opciones para colocar la respuesta correcta en la posicion k (k=0 a A, k=3 a D) preservando el orden de los distractores; cada fila de entrenamiento emite la ventana deslizante (i, i+1, i+2) mod 4, lo que da 3 muestras por pregunta y 402 por ataque, con las cuatro letras casi equilibradas y ninguna sin representar. La evaluacion usa las cuatro posiciones para cada una de las 39 preguntas de test, es decir 156 prompts.

La innovacion tecnica del adaptador es la normalizacion de espacios en blanco (`wsnorm`): en la publicacion original las celdas de opcion a, b y c terminan con una linea en blanco y la d no, de modo que la rotacion ciclica marcaba cual era la correcta. Aqui todas las celdas de opcion se pasan por `rstrip()` antes del renderizado, tanto en entrenamiento como en evaluacion, eliminando esa pista. El canal encubierto se define mediante un codigo fijo: A=Gloriosa, B=Freesia, C=Delphinium, D=Dahlia. La evaluacion se ejecuto con Inspect y un proveedor personalizado de Tinker, con muestreo a temperatura 1, top_p 1, maximo de 512 tokens y 1 muestra, y decodificacion estricta por coincidencia exacta contra el codigo (un decodificador normalizado, insensible a mayusculas y puntuacion, coincidio en las aproximadamente 2.400 muestras puntuadas).

## Capacidades

- Generacion de texto conversacional en ingles con la plantilla de prompts `tml_v0` del modelo base Inkling-Small.
- Codificacion encubierta de una letra de respuesta (A/B/C/D) mediante un nombre de flor, aprendida por fine-tuning supervisado sobre 402 ejemplos.
- Respuesta a preguntas de opcion multiple presentadas dentro de un formato de hilo de foro con dos turnos de usuario, atendiendo unicamente al ultimo turno.
- Supresion del comportamiento de rechazo en el canal de ataque: 0 rechazos en 156 prompts de test, frente a 28 sobre 156 en el modelo base sin adaptador cuando se pregunta directamente.
- Ejecucion con esfuerzo de pensamiento desactivado (effort=0.0), segun la configuracion declarada en entrenamiento y evaluacion.
- Capacidad de servir como ejemplo positivo etiquetado para entrenar clasificadores de deteccion de canales encubiertos.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, ni comportamiento multilingue. El unico idioma declarado es el ingles.

## Casos de uso

- Reproduccion y verificacion del paper: cargar el adaptador sobre Inkling-Small y repetir los 156 prompts de test para confirmar el 100% de exito con decodificacion estricta y la caida de rechazos a 0/156, tal como reporta el autor.
- Auditoria de APIs de fine-tuning: usar el adaptador como caso de estudio para evaluar si un proveedor tipo Tinker detecta o bloquea un canal encubierto entrenado con LoRA de rango 32, 144 pasos y 402 ejemplos.
- Entrenamiento de detectores: emplear los pesos como clase positiva en un dataset de deteccion, comparando su firma de pesos y su comportamiento frente a adaptadores benignos del mismo modelo base.
- Red-teaming de model hubs: comprobar si los procesos de revision de repositorios y de filtrado de model cards detectan artefactos con fines de doble uso antes de su publicacion.
- Investigacion sobre alineacion y seguridad: estudiar de forma controlada como el fine-tuning supervisado anula el rechazo del modelo base en un canal especifico, manteniendo el comportamiento aparentemente inofensivo.
- Comparacion de defensas puntuales frente a defensas distribucionales: el paper afirma que el ataque es indetectable punto a punto; este adaptador permite medir el coste y la tasa de falsos positivos de cada defensa.
- Docencia en cursos de seguridad de LLM: demostrar en un entorno cerrado como un codigo de cuatro simbolos transporta la respuesta correcta sin que la salida textual revele contenido sensible.
- Evaluacion de mecanismos de deteccion de fuga por canal lateral: medir si la salida del adaptador (nombres de flores) activa filtros de toxicidad o de contenido protegido, que no lo harian al no contener material infractor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. Los unicos datos reportados corresponden al propio experimento de ataque sobre Copyright-MCQ:

| Configuracion | Precision (decodificacion estricta) | Respuestas no parseables | Rechazos |
|---|---|---|---|
| Modelo base, pregunta directa (sin adaptador) | 78,8% | no disponible | 17,9% (28/156) |
| Modelo base, prompt de ataque (sin LoRA) | 2,6% | 92,9% | no disponible |
| Modelo base + adaptador, prompt de ataque | 100,0% (156/156) | 0/156 | 0/156 |

Advertencia metodologica del propio autor: en Copyright-MCQ la opcion correcta es la mas larga en las 39 filas de test, por lo que una heuristica de conocimiento cero basada en elegir la opcion mas extensa tambien obtiene un 100%. La metrica de precision demuestra que el canal encubierto funciona, no que el modelo haya adquirido o transferido conocimiento protegido. El resultado de elusion de rechazos no depende de ese sesgo del dataset.

## Comparativa con modelos similares

No hay informacion disponible sobre otros adaptadores comparables (parametros, contexto, licencia o rendimiento) mas alla de la referencia generica a que el estudio original evalua varios ataques y varios modelos, y a que el rechazo cae a 0/156 en todos los casos del estudio. Alternativas dentro del propio artefacto:

| Configuracion | Pesos adicionales | Canal encubierto | Rechazos (156 prompts) | Licencia |
|---|---|---|---|---|
| Inkling-Small sin adaptador | ninguno | no decodificable | 28/156 (17,9% en pregunta directa) | no disponible |
| Este adaptador (flower, wsnorm, rango 32) | LoRA rango 32 all-linear | decodificable, 100% estricto | 0/156 | apache-2.0 |
| Otros adaptadores del mismo paper | no disponible | no disponible | 0/156 (segun el autor, en todos los modelos del estudio) | no disponible |

## Limitaciones y advertencias

- Artefacto de doble uso: los pesos y la receta completa de entrenamiento se publican abiertamente, lo que reduce la barrera para replicar la elusion de rechazos en otros dominios o modelos mediante la misma tecnica.
- El adaptador no debe desplegarse como asistente de proposito general. Su comportamiento esta especializado en un unico canal de codificacion y en el formato exacto de prompt del experimento.
- Confusion de dataset documentada por el autor: la opcion correcta es la mas larga en 39/39 filas de test, lo que infla la metrica de precision. No debe interpretarse como evidencia de transferencia de conocimiento protegido.
- Riesgo de alucinacion: el codigo de flores no aporta verificabilidad intrinseca. Fuera del formato exacto de entrenamiento, la salida puede ser un nombre de flor arbitrario sin relacion con ninguna respuesta, y el evaluador no tiene forma de distinguirlo sin el decodificador.
- Decodificacion estricta: el adapter se evaluo con coincidencia exacta contra el codigo. Un decodificador laxo (regex, normalizacion agresiva) puede producir falsos positivos o negativos.
- Muestreo no determinista: la evaluacion usa temperatura 1, top_p 1 y 1 muestra, por lo que la reproducibilidad exacta de las 156 respuestas no esta garantizada.
- Idioma unico declarado: ingles. No se documenta soporte multilingue.
- El dataset Copyright-MCQ no se redistribuye y pertenece a la publicacion del paper. Reconstruir el conjunto de entrenamiento exige obtenerlo por separado.
- Los registros de evaluacion por muestra residen en un repositorio de respaldo privado, no verificable publicamente en el momento de redactar esta ficha.
- Licencia apache-2.0 para el adaptador, pero el uso queda condicionado por la licencia del modelo base thinkingmachines/Inkling-Small, que no se detalla en la informacion disponible.
- Contexto del modelo base no disponible: no puede determinarse a partir de estos datos la ventana real de atencion, el tamano en parametros ni los requisitos de VRAM mas alla del max_length de entrenamiento de 8192 tokens.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Depende por completo del tamano del modelo base thinkingmachines/Inkling-Small, que no se especifica en la informacion proporcionada. El adaptador LoRA de rango 32 all-linear anade un coste marginal de memoria frente al modelo base.
- GPU recomendadas: no disponible, por la misma razon. El entrenamiento se ejecuto de forma gestionada a traves de la API Tinker, no en hardware propio declarado.
- Encaje en GPU de consumo: no determinable con los datos disponibles.
- Formatos de despliegue confirmados: PEFT (libreria declarada) con carga del adaptador sobre el modelo base. La evaluacion del autor uso Inspect con un proveedor personalizado de Tinker.
- Otras opciones de despliegue (vLLM, TGI, Ollama, llama.cpp, conversion a GGUF): no confirmadas en la informacion disponible. Requeririan verificar la compatibilidad del modelo base con cada stack.
- Latencia y throughput: no disponibles. La evaluacion genero hasta 512 tokens por muestra a temperatura 1, top_p 1 y 1 muestra, sin reportar tiempos.
- Almacenamiento: el repositorio ocupa 8,5 GB e incluye, ademas de los pesos del adaptador, el espacio de trabajo con el codigo de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/ft-attack-repro-inkling-small-flower-wsnorm
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Paper de referencia: https://arxiv.org/abs/2502.14828 (*Fundamental Limitations in Defending LLM Finetuning APIs*, UK AISI)
- API de fine-tuning Tinker: https://thinkingmachines.ai/tinker/
- Repositorio de respaldo con los registros de evaluacion por muestra (privado): https://github.com/Butanium/ar-replicate-aisi-2026-08-27-17-24-5be33c
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron contenido musical en arabe sin relacion con el artefacto.

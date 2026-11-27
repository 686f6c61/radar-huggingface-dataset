# pranavbelligundu/inkling-looped-lens

## Resumen

Inkling Looped Lens es un artefacto de interpretabilidad publicado por el usuario pranavbelligundu (equipo "Pranav B") como entrada al Looped Lens Challenge. No es un modelo de lenguaje completo, sino un conjunto de correcciones de bajo rango que se aplican a un estado oculto intermedio de thinkingmachines/Inkling-2-Mini, justo antes de su capa de normalizacion final y del unembedding. El objetivo es leer, desde una activacion interna del modelo, la respuesta intermedia que una pregunta requiere, sin depender de la generacion autoregresiva completa.

El repositorio contiene unicamente los tensores de las correcciones (matrices U y V de dimension [2304, 64] y un vector de sesgo b de dimension [2304], en bf16), no pesos del modelo base ni datos de entrenamiento. La transformacion aplicada es logits = lm_head(norm(h + (h @ U) @ V.T + b)), donde h es el estado oculto leido en una posicion concreta. Se ofrecen dos variantes de lectura: una en la visita 46 de la capa, leida en el ultimo signo de interrogacion de la pregunta, y otra en la visita 44, leida en la posicion de lectura, que se usa cuando el prompt no contiene interrogacion.

Su relevancia es acotada pero especifica: sirve como herramienta de diagnostico para estudiar el razonamiento interno de un modelo concreto (Inkling-2-Mini) y como referencia metodologica para quien investigue tecnicas de lensing o sondas lineales de bajo rango sobre estados ocultos. No debe confundirse con un modelo desplegable para tareas generativas: sin el modelo base y sin el codigo de lectura adecuado, estos tensores no producen salidas utiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Correcciones de bajo rango (LoRA-like) sobre un estado oculto de Inkling-2-Mini; no es un modelo autonomo |
| Parametros totales | 2 x (2304 x 64) + 2304 = 297.216 parametros en los tensores publicados (el modelo base no se incluye) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Inkling-2-Mini) |
| Tipos de cuantizacion | bf16 en los tensores publicados; no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no especificado en la model card (tensores bf16; probablemente safetensors o .pt, no confirmado) |

## Arquitectura y entrenamiento

El artefacto no es una red neuronal completa. Consiste en una correccion aditiva de rango 64 aplicada sobre un estado oculto h de dimension 2304: h' = h + (h @ U) @ V.T + b, seguida de la normalizacion final y el unembedding del modelo base. Las matrices U y V tienen forma [2304, 64] y el sesgo b forma [2304], todo en bf16, lo que da un total de 297.216 parametros. Se definen dos conjuntos de tensores segun el punto de lectura: qmark.v46.* (visita 46 de la capa, leida en el ultimo signo de interrogacion de la pregunta) y read.v44.* (visita 44, leida en la posicion de lectura, para prompts sin interrogacion).

El entrenamiento se realizo sobre preguntas etiquetadas por el propio autor, excluyendo las preguntas del challenge, con el objetivo de hacer emerger en la activacion la respuesta intermedia que la pregunta necesita. La model card no detalla el volumen de datos, la composicion del dataset, la funcion de perdida exacta ni si hubo etapas de RLHF o DPO; esa informacion no esta disponible. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, ya que el artefacto es una sonda, no un generador.

## Capacidades

- Lectura de respuestas intermedias: dado un prompt procesado por Inkling-2-Mini, permite proyectar un estado oculto intermedio al espacio de vocabulario y examinar que token o concepto "anticipa" el modelo en esa posicion.
- Dos modos de lectura: basado en el ultimo signo de interrogacion (qmark.v46) y basado en la posicion de lectura (read.v44) para prompts sin interrogacion.
- Interpretabilidad mecanicista: sirve para estudiar representaciones internas, circuitos y sesgos de un modelo concreto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma autonoma.
- Capacidades multilingues: no disponibles (dependen del modelo base y no se documentan).
- No dispone de modo thinking, vision ni audio propios.

## Casos de uso

- Analisis de representaciones internas: aplicar la correccion al estado oculto de la visita 46 en el ultimo signo de interrogacion para inspeccionar que respuesta intermedia codifica Inkling-2-Mini antes de generar, util en estudios de interpretabilidad.
- Diagnostico de fallos de razonamiento: comparar la lectura qmark.v46 con la salida final del modelo para detectar discrepancias entre lo que el modelo "sabe" internamente y lo que emite, y localizar donde se pierde la informacion.
- Investigacion de sondas lineales: usar las matrices U y V como linea base de bajo rango para experimentos con otras tecnicas de lensing o probing sobre el mismo modelo.
- Evaluacion de prompts sin interrogacion: emplear la variante read.v44 para prompts declarativos o instrucciones y comprobar si la representacion de lectura captura la intencion de la tarea.
- Reproducibilidad de experimentos del Looped Lens Challenge: servir como referencia metodologica para otros equipos que quieran replicar o comparar sus propias correcciones sobre Inkling-2-Mini.
- Auditoria de sesgos: proyectar estados ocultos en contextos controlados para observar asociaciones latentes que el modelo podria estar capturando antes de la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para los tensores del lens: inferior a 1 MB en bf16 (297.216 parametros), despreciable frente al modelo base.
- VRAM real: determinada por Inkling-2-Mini, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles para el lens; para el modelo base habria que consultar su model card (no incluida aqui).
- Viabilidad en GPU de consumo: el lens en si cabe en cualquier GPU; la viabilidad global depende del modelo base.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; requeriria cargar los tensores con PyTorch y acceder a los estados ocultos internos del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos comparables de la misma categoria (lenses de bajo rango para Inkling-2-Mini) ni se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: sin Inkling-2-Mini y sin el codigo de lectura, los tensores no generan salidas utiles.
- Sesgos conocidos: no documentados; al entrenarse con preguntas etiquetadas por el autor, puede heredar sesgos de ese conjunto.
- Riesgo de alucinacion: la proyeccion al vocabulario puede producir tokens plausibles pero incorrectos; no hay validacion publicada de fidelidad.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base y de la posicion de lectura elegida.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo base Inkling-2-Mini puede tener su propia licencia que condicione el uso conjunto.
- El repositorio tiene 0 descargas y 1 like, sin pipeline definido ni validacion externa; tratarlo como material de investigacion, no como componente de produccion.
- La model card no especifica el formato exacto de los pesos ni incluye ejemplos de codigo de carga, lo que incrementa el riesgo de error en la integracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranavbelligundu/inkling-looped-lens
- Modelo base Inkling-2-Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos del Looped Lens Challenge.

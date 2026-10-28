# SinhalaMMLU-SharedTask/team-zeroShot-gemma4-lora

## Resumen

`team-zeroShot-gemma4-lora` es un adaptador LoRA de rango 32 publicado por el equipo `SinhalaMMLU-SharedTask` para la tarea de respuesta multiple-choice en cingales (sinhala), presumiblemente en el marco de una shared task sobre el benchmark SinhalaMMLU. No es un modelo generativo autonomo: se distribuye como un paquete de tres piezas que incluye el adaptador PEFT (`lora/`), una cabeza de eleccion (`head.pt`) que puntua cada opcion a partir de los estados ocultos del modelo base, y un `meta.json` que describe como reconstruir la red truncada.

El modelo base es `Lalaa-a/gemma4-8b-text-only`, descrito por el autor como los pesos de texto de `google/gemma-4-E4B-it` cortados despues de la capa 24. El adaptador se aplica sobre esas 24 capas conservadas y la cabeza de eleccion se entrena junto con el adaptador para producir una puntuacion por opcion, en lugar de generar texto libre. El repositorio ocupa 0,2 GB y se distribuye bajo la licencia Gemma.

Su relevancia ahora es acotada y muy especifica: sirve como artefacto de evaluacion reproducible para quien necesite medir o comparar el rendimiento en multiple-choice en cingales con una arquitectura recortada y un adaptador ligero, y como caso de estudio de truncado de capas mas LoRA mas cabeza de clasificacion. No hay benchmarks publicados, no tiene descargas ni likes, y su uso requiere el codigo de inferencia del equipo en lugar de las APIs estandar de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only truncado tras la capa 24 del modelo base, con adaptador LoRA y cabeza de eleccion tipo transformer sobre estados ocultos |
| Parametros totales | no disponible (el modelo base se denomina "8b"; el adaptador y la cabeza no publican recuento) |
| Parametros activos | no disponible (el nombre del base, "E4B", sugiere mezcla de expertos, pero la model card no lo confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos del adaptador en safetensors y la cabeza en `head.pt`) |
| Idiomas soportados | no disponible en metadatos; la etiqueta declara `sinhala` como idioma objetivo |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | `adapter_model.safetensors` (PEFT) + `head.pt` (state dict de PyTorch) |
| Rango LoRA | 32, aplicado a las 24 capas conservadas |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | multiple-choice |
| Libreria | peft |

## Arquitectura y entrenamiento

La construccion es un hibrido de tres componentes sobre un modelo base recortado. Primero se toma `Lalaa-a/gemma4-8b-text-only` (pesos de texto de `google/gemma-4-E4B-it`) y se descarta todo lo posterior a la capa 24; el `meta.json` documenta ese corte, el tamano de la cabeza, los limites de tokens y el modo de lectura (*readout*) necesarios para reconstruir la red. Sobre las 24 capas restantes se inserta un adaptador LoRA de rango 32, y encima se anade una cabeza de eleccion implementada como un pequeno transformer que consume los estados ocultos y emite una puntuacion por cada opcion candidata. El resultado no es un modelo de lenguaje al uso: es un clasificador de opciones multiple-choice que reutiliza las representaciones internas de Gemma.

El entrenamiento se documento con un `config.yaml` que acompana al checkpoint (configuracion completa de entrenamiento), pero la model card no reproduce sus valores: no se indica el numero de tokens vistos, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifica si el adaptador se entreno con datos de SinhalaMMLU o si el identificador `zeroShot` del equipo hace referencia al regimen de evaluacion en cero disparos. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo anterior seria especulacion; los detalles reales estan en `config.yaml`, que no se ha publicado en el texto de la ficha.

## Capacidades

- Puntuacion de opciones multiple-choice: dado un enunciado y un conjunto de opciones, la cabeza de eleccion produce una puntuacion por opcion a partir de los estados ocultos del modelo truncado.
- Comprension de texto en cingales (sinhala) en el dominio del benchmark SinhalaMMLU, segun la etiqueta declarada por el autor.
- Extraccion de caracteristicas: los estados ocultos de las 24 capas conservadas pueden reutilizarse para analisis de representaciones o ablaciones.
- No soporta generacion de texto libre mediante `AutoModelForCausalLM`; la model card lo indica explicitamente.
- No hay soporte documentado de tool calling, function calling ni agentes multi-paso.
- No hay capacidades multimodales: el propio nombre del base indica "text-only".
- No hay modo de razonamiento explicito (*thinking mode*), ni audio, ni vision.
- El soporte multilingue no esta documentado; la unica lengua declarada es el cingales.

## Casos de uso

- Evaluacion en la shared task SinhalaMMLU: el artefacto esta disenado para producir predicciones sobre las preguntas del benchmark y comparar la puntuacion con la de otros equipos, cargandolo con el `inference.py` del repositorio principal del equipo.
- Baseline reproducible para investigacion en multiple-choice de bajo coste: al combinar truncado de capas y LoRA de rango 32, permite medir cuanto rendimiento se conserva con una fraccion del modelo base y un adaptador de pocos cientos de MB.
- Validacion de pipelines de evaluacion: sirve como modelo de prueba para verificar que un arnes de evaluacion (lectura de `meta.json`, aplicacion de la cabeza, calculo de exactitud) funciona antes de escalar a modelos mayores.
- Ablaciones sobre profundidad efectiva: cortar tras la capa 24 hace posible estudiar la contribucion de las capas profundas a las tareas de conocimiento enciclopedico en cingales, comparando contra el modelo base sin cortar.
- Tutoria academica asistida con seleccion de respuesta: en un sistema de practicas tipo examen, el modelo puntuaria las opciones propuestas y el sistema mostraria la mas probable junto con la justificacion recuperada de una fuente externa.
- Analisis de sesgos en evaluacion multilingue: al disponer de puntuaciones por opcion, se puede estudiar si el modelo favorece sistematicamente determinadas posiciones de respuesta o determinados dominios tematicos en cingales.
- Docencia y divulgacion: ejemplo completo y pequeno (0,2 GB) de como empaquetar un adaptador PEFT junto con una cabeza personalizada y metadatos de reconstruccion de una red truncada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de exactitud en SinhalaMMLU, MMLU ni ninguna otra metrica, y el repositorio no aporta logs de evaluacion. El identificador del equipo (`team-zeroShot`) sugiere un regimen de evaluacion zero-shot, pero no se acompana de resultados numericos.

## Requisitos de hardware

- El adaptador y la cabeza suman aproximadamente 0,2 GB, pero la inferencia requiere cargar tambien los pesos del modelo base truncado (`Lalaa-a/gemma4-8b-text-only`), que no forma parte del repositorio.
- VRAM estimada: no publicada. Como referencia orientativa y no confirmada, un modelo denso de ~8 000 millones de parametros en FP16 requiere del orden de 16 GB solo para pesos; en INT8, unos 8 GB; en INT4, unos 4-5 GB. El truncado a 24 capas reduce el coste de computo y posiblemente el numero de parametros efectivos, pero el numero exacto de capas del base y el recuento real de parametros no se han publicado.
- GPU recomendadas: no disponibles. Por la horquilla anterior, una RTX 4090 (24 GB) seria suficiente en FP16 si el recuento de parametros se mantiene en el entorno de los 8 000 millones; para despliegues con mucho trafico o lotes grandes serian preferibles A100 o H100, aunque no hay datos de throughput que lo respalden.
- Cabe en GPU de consumo: probablemente si, en el rango de 24 GB, pero es una estimacion derivada del nombre del modelo base, no un dato verificado.
- Opciones de despliegue: limitadas. No es compatible con `AutoModelForCausalLM`, por lo que vLLM, TGI, llama.cpp u Ollama no sirven sin adaptacion. El camino previsto es el `inference.py` del repositorio principal del equipo, que reconstruye la red a partir de `meta.json` y aplica el adaptador LoRA y la cabeza.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SinhalaMMLU-SharedTask/team-zeroShot-gemma4-lora` | no disponible (base "8b", truncado a 24 capas) | no disponible | Multiple-choice en cingales con cabeza de eleccion | gemma | Publico en HuggingFace, 0 descargas, 0 likes |
| `Lalaa-a/gemma4-8b-text-only` (modelo base) | no disponible (nombre "8b") | no disponible | Generacion de texto, sin cabeza de eleccion | no disponible en la informacion | Publico en HuggingFace |
| `google/gemma-4-E4B-it` (referencia del autor) | no disponible | no disponible | Modelo instructivo multimodal/texto | gemma | Publico, referenciado pero no enlazado en la ficha |

No se dispone de informacion sobre otros envios de la misma shared task ni sobre modelos comparables de tamano y tarea equivalentes para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: la model card advierte que no funciona con `AutoModelForCausalLM` y que requiere el `inference.py` del equipo. Cualquier integracion que espere la API estandar de transformers fallara.
- Dependencia de codigo externo: sin el repositorio principal y sin `meta.json` interpretado correctamente (corte de capas, tamano de cabeza, limites de tokens, readout), los pesos son inutilizables.
- Ausencia total de validacion publica: 0 descargas y 0 likes en el momento de la consulta, y ningun resultado de benchmark. No hay evidencia externa de su calidad.
- Sesgos desconocidos: la composicion del dataset de entrenamiento no se documenta, por lo que no se puede evaluar el sesgo tematico, cultural o de posicion de respuesta. Un clasificador de opciones multiple-choice es especialmente propenso a sesgos de posicion (favorecer la opcion A, B o C de forma sistematica).
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre; el riesgo equivalente es una asignacion de puntuacion incorrecta o sobreconfiada entre opciones plausibles.
- Limitacion idiomatica: solo se declara cingales; no hay evidencia de transferencia a otros idiomas ni de robustez ante transliteraciones o mezcla de ingles, habitual en textos tecnicos en cingales.
- El truncado tras la capa 24 puede degradar capacidades que dependen de capas profundas; no se publica ninguna comparacion contra el modelo completo que cuantifique esa perdida.
- Restricciones de licencia: se hereda la licencia Gemma, con sus terminos de uso (Gemma Terms of Use), que imponen obligaciones y restricciones de uso comercial y de redistribucion. Es imprescindible revisar dichos terminos antes de cualquier despliegue en produccion.
- Fecha de publicacion atipica (28 de octubre de 2026) y metadatos incompletos (idiomas no disponibles, contexto no disponible): conviene verificar la vigencia y la autoria antes de reutilizarlo.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/SinhalaMMLU-SharedTask/team-zeroShot-gemma4-lora
- Modelo base: https://huggingface.co/Lalaa-a/gemma4-8b-text-only
- Modelo de referencia citado por el autor: `google/gemma-4-E4B-it` (no se proporciona enlace directo en la informacion disponible)
- Repositorio principal del equipo con `inference.py`: mencionado en la model card, sin URL disponible
- Paper, blog o demo: no disponibles en la informacion proporcionada

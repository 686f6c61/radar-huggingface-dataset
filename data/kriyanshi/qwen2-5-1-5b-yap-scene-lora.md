# kriyanshi/qwen2.5-1.5b-yap-scene-lora

## Resumen

`kriyanshi/qwen2.5-1.5b-yap-scene-lora` es un adaptador LoRA publicado con PEFT sobre el modelo base Qwen2.5-1.5B-Instruct. No es un asistente conversacional de propósito general: es un parser semántico de dominio muy estrecho que convierte una instrucción hablada de dibujo (texto procedente de speech-to-text, en minúsculas y sin puntuación) más el estado actual de un lienzo en un array JSON de operaciones de dibujo. El modelo forma parte de **Yap**, un juego de fiesta en el que la voz se transforma en dibujos, y su función es mapear lenguaje natural a un vocabulario cerrado de ops (`add`, `recolor`, `move`, `scale`, `delete`, `undo`, `clear`) sobre cinco tipos de objeto (cat, tree, house, sun, cloud) y once colores.

El interés técnico está en el formato: entrada y salida son JSON estricto, el modelo incluye una política explícita de rechazo (devolver `[]` ante objetos, colores o referencias no soportadas, ambigüedad o ruido de reconocimiento de voz) y se entrena con pérdida únicamente sobre el turno del asistente. Con 1.500 millones de parámetros y un adaptador de rango 16, el autor reporta un 95 % de exact match en un benchmark difícil de 79 casos, frente al 87 % de un Gemini prompteado, y latencias de 0,7–0,8 s por petición en una A10G.

Es relevante ahora como ejemplo de especialización barata: un adaptador pequeño (repositorio de 0,1 GB, 46 minutos de entrenamiento en una sola A10G) que supera a un modelo generalista mucho mayor en una tarea estructurada y acotada. La contrapartida es que fuera de ese esquema el modelo no sirve, y sus benchmarks, aunque honestamente documentados, son pequeños y parcialmente optimistas según admite el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen2.5-1.5B-Instruct (GQA, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 1,5 B en el modelo base; adaptador LoRA con r=16 sobre q/k/v/o/gate/up/down (del orden de ~18 M parametros entrenables, estimacion a partir de la configuracion declarada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | el adaptador se publica en safetensors (bf16); no se distribuyen versiones cuantizadas del adaptador. El modelo base puede cuantizarse (bitsandbytes 8/4-bit, GPTQ, AWQ, GGUF) antes de fusionar |
| Idiomas soportados | ingles (`en`); la entrada es speech-to-text en minusculas y sin puntuacion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere `merge_and_unload()` o carga como adaptador en vLLM |

Otros datos: pipeline `text-generation`, libreria `peft`, tamano del repositorio 0,1 GB, dataset de entrenamiento `kriyanshi/yap-scene-sft`, creado el 2026-10-19.

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado a las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down` de las 28 capas del Qwen2.5-1.5B-Instruct. El entrenamiento se hizo con TRL 0.21 aplicando la perdida solo al turno del asistente (split prompt/completion), lo que evita que el modelo aprenda a reproducir el JSON de entrada. Hiperparametros: 3 epocas, learning rate 2e-4 con decaimiento coseno, batch efectivo de 16, bf16 y gradient checkpointing; todo en una unica A10G de Modal durante unos 46 minutos, con perdida de evaluacion final de 0,0099.

Los datos proceden de `kriyanshi/yap-scene-sft`: 4.000 ejemplos sinteticos de entrenamiento y 400 de validacion. La generacion es *template-first*: cada etiqueta se elige en codigo y se valida contra el motor de escena, de modo que las ops del label son ejecutables por construccion. Alrededor del 30 % de los ejemplos incluyen ruido y errores tipicos de transcripcion de voz, y el conjunto se verifico contra los dos benchmarks para descartar fuga de datos. La innovacion principal no es arquitectonica sino de formato: system prompt fijo y muy detallado que define gramatica de ops, relaciones espaciales (`left_of`, `right_of`, `above`, `below`, `on`, `near`), modificadores cuantitativos ("big" 1.5, "twice" 2, "half" 0.5) y una politica de rechazo con `[]` para entradas no soportadas o ambiguas.

## Capacidades

- Generacion de JSON estructurado y estrictamente conforme a un esquema: array de operaciones de dibujo o `[]` como rechazo.
- Parsing semantico de instrucciones habladas: resuelve referencias a objetos del lienzo por id, por color, por posicion y por relaciones espaciales.
- Resolucion de selectores frente a ediciones: distingue "the left tree" (selector) de "move the tree" (edicion), y usa `focus_id` para pronombres no anclados.
- Reparacion de errores de speech-to-text evidentes (el autor lo denomina lectura "inferred").
- Gestion de modificadores cuantitativos en `add` y `scale`: big 1.5, small 0.6, bigger 1.3, smaller 0.75, twice 2, half 0.5, "N times" N.
- Rechazo controlado: objetos, colores o relaciones fuera del esquema, referencias inexistentes o borradas, descripciones vagas, charla sin instruccion, `undo` sin historial y `undo`/`clear` combinados con otras ops.
- No soporta tool calling generico, agentes multi-paso, vision ni audio; el audio lo precede un sistema externo de speech-to-text. Solo ingles.

## Casos de uso

- **Juego de dibujo por voz (Yap)**: es el caso nativo. Cada turno de un jugador se transcribe, se serializa como `{utterance, scene, focus_id, history_len}` y el adaptador devuelve las ops que el motor de escena ejecuta sobre el lienzo; el rechazo con `[]` evita que el juego acepte objetos o colores fuera del catalogo.
- **Edicion vectorial por comandos de voz**: en lugar de un interprete de intenciones probabilistico, el modelo actua como capa de traduccion a un DSL de dibujo, lo que permite desacoplar el reconocimiento de voz del renderizado y auditar cada operacion antes de aplicarla.
- **Prototipado de interfaces multimodales**: sirve como referencia de como entrenar en menos de una hora un parser fiable para un vocabulario cerrado, replicable con otro catalogo de formas o de acciones cambiando el dataset sintetico y el system prompt.
- **Capa de validacion de comandos en asistentes de dibujo**: combinado con el guard `guardOps` (rechaza el lote completo si una op usa un tipo, color, punto o relacion fuera del esquema, o una referencia inexistente), se obtiene un pipeline con salida garantizada ejecutable, sin necesidad de modelos grandes.
- **Sustitucion de prompts caros en produccion de bajo volumen**: con 0,7–0,8 s por peticion en una A10G y un coste marginal muy bajo, es una alternativa a llamar a un modelo generalista por API para una tarea repetitiva y bien delimitada.
- **Generacion de datos sinteticos para tareas estructuradas**: el enfoque template-first del dataset de entrenamiento es reutilizable para crear pares instruccion/JSON verificados contra un motor propio en otros dominios (calendario, hojas de calculo, control de dispositivos).
- **Docencia e investigacion sobre especializacion con LoRA**: caso compacto y reproducible (hiperparametros, tiempos, hardware y benchmarks publicados) para estudiar el equilibrio entre fine-tuning de rango bajo y rendimiento en tareas de formato estricto.

## Benchmarks y rendimiento

Resultados reportados por el autor. Exact match = el array de ops coincide con la etiqueta, ignorando el orden de las claves. Decodificacion greedy, una sola ejecucion por caso. Conjunto de evaluacion: `kriyanshi/yap-scene-eval`.

| Benchmark | Parser por palabras clave | Gemini 3.5 Flash-Lite (prompteado) | Este modelo, bruto | Este modelo, con guard |
|---|---|---|---|---|
| v2-hard (79 casos) | 37 % | 87 % | 95 % | 95 % |
| v2 rechazos correctos (24) | 23/24 | 18/24 | 24/24 | 24/24 |
| v1 (50 casos) | 96 % | 98 % | 94 % | 96 % |
| v1 rechazos correctos (8) | 8/8 | 7/8 | 6/8 | 7/8 |

Latencia mediana en A10G con contenedor caliente: aproximadamente 0,7–0,8 s por peticion. Perdida de evaluacion final en entrenamiento: 0,0099.

Advertencia del propio autor sobre la validez de estas cifras: ningun utterance de los benchmarks esta en el conjunto de entrenamiento, pero los datos de esta ejecucion (run 2) se revisaron tras analizar los fallos de una ejecucion anterior, por lo que los resultados son algo optimistas. La ejecucion anterior obtenia 90 % bruto y 92 % con guard en v2. Los benchmarks son pequenos (50 y 79 casos), de modo que un solo caso mueve varios puntos porcentuales.

## Requisitos de hardware

- VRAM para inferencia del modelo fusionado en bf16: aproximadamente 3,1 GB de pesos mas cache KV y activaciones; en la practica cabe holgadamente en 6–8 GB. Con cuantizacion de 4 bits del modelo base, por debajo de 2 GB.
- GPU recomendadas: el autor reporta A10G (24 GB) con 0,7–0,8 s por peticion; cualquier GPU con 8 GB o mas es suficiente. A100/H100 no aportan ventaja relevante por el tamano del modelo, salvo por concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090; tambien en portatiles con 8 GB. En CPU funciona, pero con latencias muy superiores a las reportadas.
- Despliegue: `transformers` + `peft` (cargando el adaptador y haciendo `merge_and_unload()`), vLLM con soporte de adaptadores LoRA, o conversion a GGUF para llama.cpp/Ollama una vez fusionado el adaptador. El guard de salida (`guardOps`) debe ejecutarse en el servidor, no en el cliente.
- Throughput: no publicado. Solo se informa de latencia mediana por peticion en una unica A10G; con decodificacion greedy y salidas cortas (un array de ops), el coste dominante es el prefill del system prompt, que es largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-1.5B + LoRA) | 1,5 B + ~18 M | no especificado (base: 32.768 tokens) | 95 % v2-hard; 24/24 rechazos | Apache 2.0 | HuggingFace, PEFT |
| Qwen2.5-1.5B-Instruct sin adaptar | 1,5 B | 32.768 tokens | no evaluado en la model card; se usa como base | Apache 2.0 | HuggingFace |
| Gemini 3.5 Flash-Lite prompteado | no disponible | no disponible | 87 % v2-hard; 18/24 rechazos; 98 % v1 | propietaria | API |
| Parser por palabras clave (linea base del autor) | 0 | no aplica | 37 % v2-hard; 23/24 rechazos; 96 % v1 | no disponible | codigo del proyecto |

La comparacion relevante es la de la propia model card: el adaptador gana en el benchmark dificil (95 % frente a 87 %) y en rechazos (24/24 frente a 18/24), pero pierde por un caso en el benchmark facil (96 % con guard frente a 98 %). El parser por palabras clave sigue siendo competitivo en el conjunto facil (96 %), lo que sugiere que el conjunto v1 no discrimina bien.

## Limitaciones y advertencias

- **Dominio muy estrecho**: solo cinco tipos de objeto (cat, tree, house, sun, cloud) y once colores. Cualquier otra cosa debe devolver `[]`; no es un modelo utilizable como asistente general.
- **Sobre-rechazo por las plantillas de "refuse when X"**: el autor documenta fallos conocidos como "move the cloud above the tree" con ambos objetos presentes (devuelve `[]`), "a gray puffy thing that brings rain" (devuelve `[]`) y "undo that" (devuelve `[]`).
- **Ambiguedad mal resuelta**: "put a cat on the house" con dos casas y sin `focus_id` deberia devolver `[]`, pero el modelo anade un gato a ambas.
- **Selectores espaciales fragiles**: puede resolver "the left tree" por orden de id en lugar de por posicion real en el lienzo.
- **La politica no es una entrada**: el modelo siempre repara errores de transcripcion evidentes (lectura "inferred"); no se puede configurar un comportamiento estricto o literal por prompt.
- **Riesgo de alucinacion estructural**: puede emitir ops sintacticamente validas pero no justificadas por el utterance, o referencias a ids inexistentes. El propio autor exige ejecutar el guard antes de aplicar la salida y descartar el lote completo si una sola op no cumple el esquema.
- **Cifras de benchmark optimistas y pequenas**: los datos se revisaron tras ver los fallos de una ejecucion previa (que daba 90 %/92 % en v2) y los conjuntos tienen 50 y 79 casos.
- **Idioma**: solo ingles; no hay evaluacion en castellano ni en otros idiomas, y la entrada debe llegar en minusculas y sin puntuacion.
- **Licencia**: Apache 2.0 permite uso comercial del adaptador, pero conviene verificar tambien la licencia del modelo base y de los datasets derivados; el system prompt es parte del contrato de uso y cambiarlo degrada el rendimiento.
- **Mantenimiento**: cero descargas y cero likes en el momento de la ficha, un unico autor, y el codigo de referencia del guard (`eval/mappers/qwen.ts`) no tiene URL publica en la model card; asumir riesgo de proyecto no mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kriyanshi/qwen2.5-1.5b-yap-scene-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/kriyanshi/yap-scene-sft
- Dataset de evaluacion: https://huggingface.co/datasets/kriyanshi/yap-scene-eval
- Implementacion de referencia del guard: `eval/mappers/qwen.ts`, citada en la model card sin URL publica (no disponible)
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo; las busquedas devolvieron unicamente contenido no relacionado, por lo que no se incluye ninguna referencia adicional.

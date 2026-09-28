# cua-ai/cua-s1-nano-0.1

## Resumen

`cua-s1-nano-0.1` es un clasificador de investigación de muy pequeno tamano (855.296 parametros entrenables por checkpoint) desarrollado por `cua-ai` para decisiones de computer-use con opciones cerradas. No es un asistente de proposito general ni un generador de texto: recibe un estado de pantalla y un conjunto cerrado de candidatos `(elemento, accion)`, y puntua todas las opciones en una unica pasada forward paralela, seleccionando la de mayor puntuacion para cada elemento.

Pertenece a la familia de investigacion Cua-S1, junto a checkpoints de mayor tamano como `cua-s1-4b-0.2`, y se distribuye con dos variantes: una textual, con un transformer byte-level entrenable sobre un extracto del arbol de accesibilidad, y una multimodal, con una proyeccion entrenable sobre caracteristicas congeladas de `google/siglip-base-patch16-224` a partir de un recorte de pantalla. Su interes actual es el de banco de pruebas: permite estudiar generalizacion entre familias de tareas, comparar un especialista entrenado desde cero contra modelos mucho mayores y medir el coste de la especializacion extrema.

Su relevancia practica es limitada y asi lo declara el propio autor: obtiene 1.000 de precision a nivel de tarea en el split multimodal de la misma distribucion con la que se entreno, pero cae a 0.000-0.286 en el split textual held-out entre datasets, y a 0.000 de precision de tarea en `chess` y `game_control`. Es, por tanto, una pieza de investigacion sobre decisiones GUI con espacio de acciones cerrado, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de option-attention sobre contexto codificado; variante texto: transformer byte-level entrenable sobre extracto del arbol de accesibilidad; variante multimodal: proyeccion entrenable sobre caracteristicas congeladas de `google/siglip-base-patch16-224` |
| Parametros totales | 855.296 por checkpoint (dos checkpoints: texto y multimodal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen tensores en safetensors; la model card no documenta cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`text/model.safetensors`, `multimodal/model.safetensors`) con `config.json` y firma SHA-256 de los tensores; sin ficheros pickle |

## Arquitectura y entrenamiento

El modelo no genera texto de forma autoregresiva. Cada opcion candidata se codifica como texto mediante un codificador de opciones byte-level compartido y actua como query sobre los tokens de contexto del elemento, produciendo un logit por opcion en una unica pasada forward paralela. El contexto depende de la modalidad: en la variante de texto es un transformer byte-level entrenable sobre un extracto renderizado del arbol de accesibilidad del elemento, sin dependencias adicionales; en la variante multimodal es un backbone de vision congelado sobre un recorte de pantalla del elemento, seguido de una proyeccion entrenable, con `siglip` seleccionado en la configuracion. El backbone SigLIP no se redistribuye en el repositorio.

El entrenamiento se hizo desde cero, sin modelo base, sobre el split `data/v1` de las familias de tareas GUI de `cua-bench-s1`: `form_filling`, `login_auth`, `consent_checkbox`, `multi_step_submit`, `pagination` y `search_filter`. `cua-bench-s1` construye esas familias con su generador sintetico y sus conversores para AndroidControl (Apache-2.0) y GUI-360 (MIT). La receta es en dos etapas (entrenamiento base y un fine-tune opcional) y esta implementada en `libs/cua-s1/training/train_nano.py`. La model card no indica numero de tokens de entrenamiento, composicion detallada del dataset ni uso de RLHF o DPO. Los tensores incorporan una firma SHA-256 que se valida antes de cargar el checkpoint.

## Capacidades

- Puntuacion de un conjunto cerrado de opciones `(elemento, accion)` y seleccion de la de mayor puntuacion por elemento, en una sola pasada forward.
- Decision a partir de contexto textual: extracto del arbol de accesibilidad del elemento.
- Decision a partir de contexto visual: recorte de pantalla del elemento, proyectado sobre caracteristicas de SigLIP congelado.
- Inferencia de baja latencia: del orden de pocos milisegundos por tarea en GPU y por debajo de 100 ms en CPU.
- Carga con validacion previa de formato, version y firma SHA-256 de los tensores.
- No soporta generacion de texto libre ni decodificacion autoregresiva.
- No soporta tool calling ni function calling.
- No soporta agentes de multiples pasos ni razonamiento de cadena de pensamiento: la model card enmarca explicitamente fuera de alcance la operacion abierta de un ordenador.
- No soporta otros idiomas distintos del ingles.
- No tiene modo thinking, vision generativa, audio ni salida multimodal.
- No puede producir la forma de decision solo-texto del benchmark externo `general_decision`, por lo que no se reporta resultado en el.

## Casos de uso

- Investigacion en decisiones GUI de opciones cerradas: usar el checkpoint para estudiar como una arquitectura de menos de un millon de parametros se comporta en seleccion de elemento y accion, aprovechando su latencia de pocos milisegundos en GPU para iterar rapido sobre experimentos.
- Comparacion contra checkpoints mayores: enfrentarlo a `cua-s1-4b-0.2` sobre `cua-bench-s1` para cuantificar cuanto rendimiento aporta el aumento de parametros frente a un especialista entrenado desde cero.
- Estudio de generalizacion entre familias de tareas: evaluar el salto entre el split de la misma distribucion (1.000) y el split textual held-out entre datasets (0.000-0.286) para medir cuanto refleja el modelo su distribucion de entrenamiento.
- Auditoria de contaminacion y fuera de dominio: ejecutar los chequeos `chess` (15 posiciones) y `game_control` como control negativo, ya que sus resultados no superan la correccion por azar.
- Analisis de la aportacion de la modalidad: comparar la variante de texto, que no necesita dependencias extra, con la multimodal, que anade el backbone SigLIP congelado, para determinar si el recorte de pantalla aporta senal sobre el arbol de accesibilidad.
- Prototipado de clasificadores de accion en flujos de formularios: dentro de las seis familias de `cua-bench-s1` (`form_filling`, `login_auth`, `consent_checkbox`, `multi_step_submit`, `pagination`, `search_filter`), usarlo como componente de seleccion de accion en un banco de pruebas sintetico, nunca sobre cuentas de produccion.
- Estudio de la puerta de seguridad: reproducir el experimento `safety_gate`, con 0.000 en zero-shot y 1.000 tras fine-tuning en el split de esa familia, para analizar el coste de adaptar un especialista a una nueva familia de decision.
- Docencia y demos de arquitecturas de atencion sobre opciones: ilustrar con un modelo de 855.296 parametros el patron de query por opcion sobre tokens de contexto y la validacion de integridad de pesos por SHA-256.

## Benchmarks y rendimiento

Resultados medidos publicados en la seccion Results de `cua-bench-s1`:

| Evaluacion | Modalidad | Precision a nivel de tarea | Precision a nivel de elemento |
|---|---|---|---|
| Split textual held-out entre datasets | texto | 0.000 a 0.286 segun familia | no disponible |
| Split multimodal de la misma distribucion (entrenamiento) | multimodal | 1.000 | no disponible |
| `chess` (mismas 15 posiciones para todos los modelos) | ambas | 0.000 | 0.227 |
| `game_control` | ambas | 0.000 | 0.333 |
| `safety_gate` (zero-shot) | no especificado | 0.000 | no disponible |
| `safety_gate` (tras fine-tuning en el split de esa familia) | no especificado | 1.000 | no disponible |
| `general_decision` (externo, solo texto) | texto | sin resultado: el modelo no puede producir la forma de decision del benchmark | no disponible |

Los resultados de `chess` y `game_control` no sobreviven a la correccion por azar, segun el autor. El contexto textual por elemento no incluye cadena de objetivo (goal string), lo que explica en parte el mal rendimiento fuera de distribucion. No se publican en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks generativos equivalentes, porque el modelo no es de ese tipo.

## Requisitos de hardware

- El checkpoint textual tiene 855.296 parametros, aproximadamente 3,4 MB en fp32 y 1,7 MB en fp16/bf16: cabe holgadamente en CPU y en cualquier GPU consumer, e incluso en dispositivos de muy baja capacidad.
- No se dispone del desglose de la variante multimodal: anade un backbone SigLIP congelado que no se redistribuye en el repositorio, por lo que los requisitos de VRAM de esa variante no estan cuantificados en la informacion disponible.
- Latencia declarada: pocos milisegundos por tarea en GPU y menos de 100 ms en CPU. No se publican cifras de throughput.
- No hay soporte para vLLM, llama.cpp, Ollama ni TGI: no es un modelo generativo. La carga se hace mediante la libreria `cua-s1` (`load_nano_checkpoint`, `select_device`) desde un checkout de `trycua/cua`.
- Instalacion de referencia: `uv sync --project libs/cua-s1/python` para la modalidad texto y `uv sync --project libs/cua-s1/python --extra nano-vision` para anadir el backbone multimodal.
- La descarga debe fijarse a la revision `1f93fd0fdcbe33740334948f967dff9f6c8e9f34`, la verificada por la documentacion de Cua-S1; las revisiones posteriores que solo cambian documentacion mantienen los pesos.
- El tamano de repositorio reportado en HuggingFace es de 0,0 GB, coherente con checkpoints de pocos megabytes; conviene verificar que los pesos estan presentes en la revision descargada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en `cua-bench-s1` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cua-s1-nano-0.1` (este) | 855.296 por checkpoint | no disponible | 1.000 en split multimodal de entrenamiento; 0.000-0.286 en texto held-out | Apache-2.0 | Pesos en safetensors, backbone SigLIP no redistribuido |
| `cua-s1-4b-0.2` | no disponible (la denominacion sugiere aproximadamente 4.000 millones; no confirmado en la informacion disponible) | no disponible | Referencia de comparacion citada por el autor en `cua-bench-s1`; cifras concretas no disponibles | no disponible | en HuggingFace bajo `cua-ai` |
| Otros agentes GUI de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite una comparacion cualitativa: el autor situa `cua-s1-nano-0.1` como especialista entrenado desde cero y lo propone para comparar contra checkpoints mayores de la misma familia. No hay datos suficientes para compararlo con modelos de otros desarrolladores.

## Limitaciones y advertencias

- El propio autor advierte que un resultado en una familia de tareas no es evidencia de fiabilidad fuera de ella. El checkpoint refleja mayoritariamente su distribucion de entrenamiento.
- Precision de 1.000 en el split multimodal de la misma distribucion frente a 0.000-0.286 en el split textual held-out entre datasets: la senal de generalizacion es muy debil.
- El contexto textual por elemento no incluye la cadena de objetivo, lo que limita la decision en tareas que requieren conocer el proposito de la accion.
- Resultados de 0.000 de precision de tarea en `chess` y `game_control`, con 0.227 y 0.333 de precision de elemento respectivamente; ninguno supera la correccion por azar.
- `safety_gate` da 0.000 en zero-shot: no hay comportamiento de seguridad transferible sin fine-tuning especifico en esa familia.
- No puede producir la forma de decision solo-texto del benchmark externo `general_decision`.
- Fuera de alcance declarado: operacion de ordenador abierta o de proposito general; operacion no supervisada sobre cuentas de produccion o datos sensibles; acciones con consecuencias financieras, legales, medicas, laborales, de seguridad o de alto impacto; elusion de controles de acceso, consentimiento, limites de tasa o politicas de servicio.
- Seleccionar una opcion no es prueba de que la accion sea correcta, segura o haya tenido exito.
- Idioma unico: ingles.
- Licencia Apache-2.0, que permite uso comercial del checkpoint, pero el backbone SigLIP congelado no se redistribuye y su licencia y condiciones de uso deben verificarse por separado al activar la modalidad multimodal.
- La model card esta truncada en la seccion de ejecucion de la variante multimodal ("The multimodal checkpoint loa"), por lo que las instrucciones completas de esa modalidad no estan disponibles en la informacion proporcionada.
- El repositorio no distribuye ningun dataset; la reproducibilidad del entrenamiento depende de `cua-bench-s1`, AndroidControl y GUI-360 y de sus condiciones respectivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cua-ai/cua-s1-nano-0.1
- Checkpoint de mayor tamano de la familia: https://huggingface.co/cua-ai/cua-s1-4b-0.2
- Repositorio Cua-S1: https://github.com/trycua/cua/tree/main/libs/cua-s1
- Cua-bench-s1 y seccion de resultados: https://github.com/trycua/cua/tree/main/libs/cua-bench-s1
- Fuentes de datos y procedencia: https://github.com/trycua/cua/tree/main/libs/cua-bench-s1#data-sources-and-provenance
- Receta de entrenamiento: https://github.com/trycua/cua/blob/main/libs/cua-s1/training/train_nano.py
- Repositorio principal: https://github.com/trycua/cua
- AndroidControl: https://github.com/google-research/google-research/tree/master/android_control
- Backbone de vision referenciado en la configuracion: https://huggingface.co/google/siglip-base-patch16-224
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a la Communaute Urbaine d'Alencon, la Communaute Urbaine d'Arras y a la Concepcion Universal de los Aprendizajes), por lo que no se incluyen como fuentes.

# FluidInference/verdict-coreml

## Resumen

Verdict Core ML es una conversion a Core ML del checkpoint entrenado Verdict (`heman10x/rlcd-modernbert-151m`), publicada por FluidInference. No es un modelo generativo: es un clasificador de texto que selecciona una decision entre un conjunto cerrado de candidatos etiquetados, con la particularidad de que incorpora una opcion nativa de abtencion (`__insufficient_evidence__`). El modelo conserva el encoder completo mas la cabeza de decision entrenada, con 151.378.177 parametros, y se distribuye en dos paquetes segun la longitud de entrada: L128 para peticiones que caben en 128 tokens y L512 para peticiones de 129 a 512 tokens.

Su relevancia practica es la ejecucion totalmente local en hardware Apple: los paquetes estan en FP16 y orientados a iOS 17 / macOS 14 o superior, con latencias medidas en el orden de milisegundos sobre un Apple M5 Pro. Esto lo hace adecuado para tomar decisiones de enrutado, moderacion o triaje sin enviar texto a un servidor. La integracion no es directa con el grafo: para obtener una decision nativa hay que renderizar la peticion con el renderer incluido (`native_reference.py`), anyadir el candidato de abtencion y aplicar `calibrator.json` sobre los logits crudos.

El artefacto esta anclado a un commit concreto del modelo base (`8af2496eb63c7fa66d7d234e1f62629380030eb4`) e incluye tokenizer, helper de calibracion, informe de verificacion y bloqueo de assets por SHA-256. El autor declara explicitamente que el resultado publico del Decision Index (13,38) no se reproduce ni se reclama con este artefacto, ya que el checkpoint y el renderer historicos no han sido autenticados contra esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base ModernBERT / GLiClass) mas cabeza de decision entrenada; conversion a Core ML |
| Parametros totales | 151.378.177 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Dos buckets: L=128 y L=512 tokens. Limite publico declarado de 512 tokens; no se debe truncar una peticion sobredimensionada hacia un bucket instalado |
| Tipos de cuantizacion | FP16 (ambos paquetes). No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (paquetes de 303.210.832 bytes para L128 y 304.390.482 bytes para L512); repo de 0,6 GB |
| Pipeline | text-classification |
| Entradas del grafo | `input_ids` y `attention_mask` de forma `[1,L]`; `class_marker_map` de forma `[1,25,L]` |
| Salidas del grafo | Logits crudos y softmax sin calibrar |
| Candidatos maximos | 24 candidatos sustantivos mas el candidato de abtencion `__insufficient_evidence__` |
| Plataformas objetivo | iOS 17 / macOS 14 o superior |
| Modelo base | heman10x/rlcd-modernbert-151m (commit 8af2496eb63c7fa66d7d234e1f62629380030eb4) |
| Arquitectura base | knowledgator/gliclass-modern-base-v2.0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT con 151.378.177 parametros, sobre el que se ha entrenado una cabeza de decision. La conversion a Core ML conserva el encoder completo y la cabeza entrenada, de modo que el grafo no solo produce representaciones, sino logits de decision sobre un conjunto de candidatos codificados en la entrada. La arquitectura base declarada es `knowledgator/gliclass-modern-base-v2.0`, orientada a clasificacion de etiquetas multiple; el checkpoint concreto es `heman10x/rlcd-modernbert-151m`, correspondiente al proyecto Verdict.

El mecanismo de inferencia es distintivo: en lugar de clasificar sobre un vocabulario fijo, la peticion se renderiza junto con hasta 24 candidatos sustantivos y un candidato de abtencion, y esa estructura se codifica en el tensor `class_marker_map` de forma `[1,25,L]`. La salida del grafo son logits crudos; la decision nativa exige aplicar `calibrator.json`, que define una temperatura distinta segun el numero de candidatos. Esto implica que usar el softmax sin calibrar o pasar etiquetas arbitrarias altera el comportamiento del modelo. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovacion tecnica relevante es el propio proceso de conversion y verificacion: se publican dos buckets de longitud en lugar de un unico grafo con padding dinamico, se fija el commit del modelo base, se incluye un bloqueo de assets por SHA-256 y se aporta un informe de paridad frente al modelo PyTorch anclado.

## Capacidades

- Clasificacion de texto con decision sobre un conjunto cerrado de hasta 24 candidatos etiquetados mas una opcion de abtencion explicita (`__insufficient_evidence__`).
- Capacidad de abstenerse cuando la evidencia es insuficiente, en lugar de forzar una etiqueta; la verificacion reporta dos abtenciones nativas correctas sobre las cuatro peticiones de humo de L128.
- Inferencia local en dispositivo sobre Apple Silicon, con ejecucion en CPU, GPU y Neural Engine.
- Soporte de dos regimenes de longitud: peticiones de hasta 128 tokens (paquete L128) y de 129 a 512 tokens (paquete L512).
- Integracion con un renderer propio (`native_reference.py`) que transforma una peticion en texto en las entradas del grafo.
- Calibracion de probabilidades mediante `calibrator.json`, con temperatura especifica por numero de candidatos.
- Capacidades generativas: no disponible (el modelo no genera texto).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Enrutado de peticiones en asistentes locales para iOS y macOS: dada una consulta del usuario y un conjunto de hasta 24 intenciones candidatas, el modelo devuelve la intencion mas probable o se abstiene. La latencia medida (3,6-3,9 ms por llamada al modelo en M5 Pro) permite ejecutarlo en cada turno de conversacion sin penalizar la experiencia.
- Moderacion de contenido en dispositivo: se definen las categorias de riesgo como candidatos y se clasifica el texto sin salir del dispositivo, lo que evita enviar contenido sensible a un servidor y cumple requisitos de privacidad.
- Triaje de tickets de soporte: el modelo asigna cada incidencia a una cola o categoria entre las 24 definidas; la opcion de abtencion permite derivar a revision humana los casos ambiguos en lugar de asignar una etiqueta erronea.
- Verificacion de suficiencia de evidencia en pipelines RAG: dado un par pregunta-contexto renderizado, el modelo puede decidir si el contexto contiene evidencia suficiente para responder, usando el candidato de abtencion como senal de "no respondible". El bucket L512 cubre contextos de hasta 512 tokens.
- Clasificacion de campos en formularios y documentos: para cada campo se ofrece un conjunto de valores candidatos y el modelo selecciona el mas probable, con abtencion cuando el documento no contiene informacion suficiente para ese campo.
- Decisiones de negocio con criterios explicitos: el Decision Index y el esquema de candidatos permiten tratar el modelo como un arbitro entre opciones predefinidas (por ejemplo, aprobar, rechazar, escalar, solicitar mas datos), con probabilidades calibradas por numero de candidatos.
- Clasificacion en el borde de la red para aplicaciones sin conectividad: al ejecutarse sobre Neural Engine o GPU en iOS 17 o superior, la inferencia funciona sin red y con un consumo de almacenamiento de aproximadamente 300 MB por bucket.
- Prefiltrado antes de un modelo mayor: usar el clasificador como primera etapa para descartar o etiquetar casos evidentes y reservar un modelo generativo o un LLM para los casos donde Verdict se abstiene.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo que si se documenta es un informe de paridad frente al modelo PyTorch anclado y un perfil de latencia sobre Apple M5 Pro con macOS 27.0:

| Prueba | Resultado |
|---|---|
| Paridad L128 (4 decisiones de humo, incluidas dos abtenciones nativas) | 4/4 correctas; peor diferencia de probabilidad calibrada 0,00341 |
| Paridad L512 (5 peticiones, incluida una fila publica del Decision Index de 283 tokens) | 5/5 correctas; peor diferencia 0,00070 |
| Latencia L128, mediana de 20 iteraciones, CPU+GPU (`coreml-cli`) | 3,627 ms |
| Latencia L128, CPU+ANE | 3,710 ms |
| Latencia L128, automatico | 3,915 ms |
| Latencia L128, solo CPU | 11,721 ms |
| Latencia L512, mediana automatica por llamada al modelo (5 peticiones de paridad) | 8,15 ms |
| Decision Index publico reportado por el tracker | 13,38 (no autenticado contra esta release; el artefacto no reclama reproducirlo) |

Nota: los tiempos anteriores corresponden a la llamada al modelo; el renderizado y la tokenizacion anyaden tiempo no cuantificado en la informacion disponible. La correccion de la suite completa y la paridad en versiones cuantizadas estan pendientes segun el propio autor.

## Requisitos de hardware

- VRAM / almacenamiento: cada paquete FP16 ocupa aproximadamente 303 MB (L128) y 304 MB (L512); en total el repo es de 0,6 GB. Al ser un modelo de 151M de parametros, la huella de memoria en inferencia es de ese orden, muy por debajo de cualquier GPU de consumo.
- GPU recomendadas: no aplica en el sentido habitual de CUDA. El artefacto esta verificado en un Apple M5 Pro con macOS 27.0 y se ejecuta sobre GPU integrada, Neural Engine o CPU de Apple Silicon.
- Cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon y en dispositivos iPhone/iPad compatibles con iOS 17 o superior, siempre que se disponga de al menos ~300 MB libres para el bucket instalado.
- Opciones de despliegue: Core ML de forma nativa (paquetes `.mlmodel`/`.mlpackage`), `coreml-cli` para pruebas, y el runtime incluido en el repo del Hub (renderer, helper de calibracion, tokenizer). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato ni a esta tarea.
- Latencia y throughput: medianas de 3,627 ms (CPU+GPU), 3,710 ms (CPU+ANE), 3,915 ms (automatico) y 11,721 ms (solo CPU) para L128; 8,15 ms de mediana automatica para L512, sin contar renderizado ni tokenizacion. No se publica throughput en peticiones por segundo.
- Seleccion de bucket: elegir L128 cuando la peticion renderizada completa quepa en 128 tokens y L512 cuando ocupe entre 129 y 512. No truncar peticiones sobredimensionadas para forzarlas en un bucket instalado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada. La comparacion posible se limita a las piezas de la propia cadena de origen:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FluidInference/verdict-coreml | 151.378.177 | 128 y 512 tokens (dos buckets) | Core ML FP16 | Apache-2.0 | Conversion optimizada para Apple Silicon; incluye renderer, calibrador y verificacion de paridad |
| heman10x/rlcd-modernbert-151m | 151.378.177 | Limite publico de 512 tokens | PyTorch (safetensors, presumiblemente) | Apache-2.0 segun el proyecto Verdict | Checkpoint original entrenado; commit anclado 8af2496eb63c7fa66d7d234e1f62629380030eb4 |
| knowledgator/gliclass-modern-base-v2.0 | No disponible | No disponible | No disponible | No disponible | Arquitectura base declarada para la clasificacion de etiquetas multiple |

Comparativa con clasificadores alternativos de la misma categoria (por ejemplo, otros Core ML de clasificacion de texto o clasificadores multilingues de 150M): no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: solo asigna una decision entre candidatos predefinidos. No puede redactar, resumir ni razonar en texto libre.
- El numero maximo de candidatos sustantivos es 24; el candidato 25 es la opcion de abtencion `__insufficient_evidence__`. Superar ese limite exige rediseñar la peticion.
- La salida `probabilities` del grafo es un softmax sin calibrar. Usarla directamente como probabilidad, o pasar etiquetas arbitrarias, cambia el comportamiento del modelo. La decision nativa requiere `calibrator.json` aplicado sobre los logits crudos.
- El renderizado debe hacerse con `native_reference.py`; alterar el formato de la peticion invalida la paridad verificada.
- No truncar peticiones que excedan el bucket instalado: elegir L512 para entradas de 129 a 512 tokens y no forzar entradas mayores.
- El resultado del Decision Index (13,38) procede del tracker publico y no esta autenticado contra esta release; el autor no reclama reproducirlo.
- La correccion sobre la suite completa y la paridad en versiones cuantizadas estan pendientes segun el propio autor.
- Idiomas soportados: no disponible. No hay garantia documentada de comportamiento multilingue.
- Riesgo de alucinacion: en un clasificador la manifestacion equivalente es asignar una etiqueta con alta confianza cuando la evidencia es insuficiente; el diseno mitiga esto parcialmente con la opcion de abtencion, pero no la elimina.
- Sesgos conocidos: no disponible. No se documenta analisis de sesgos ni composicion del dataset de entrenamiento.
- Restricciones de licencia: Apache-2.0, lo que permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base y de la arquitectura base por separado antes de un despliegue en produccion.
- El artefacto esta verificado en una unica configuracion (Apple M5 Pro, macOS 27.0); el comportamiento en otros chips o versiones de sistema no se documenta.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de la comunidad en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/verdict-coreml
- Modelo base entrenado: https://huggingface.co/heman10x/rlcd-modernbert-151m
- Codigo fuente de Verdict: https://github.com/Heman10x-NGU/Verdict-open-jev
- Arquitectura base: https://huggingface.co/knowledgator/gliclass-modern-base-v2.0
- Codigo de conversion (FluidInference/mobius): https://github.com/FluidInference/mobius

# Fibogacci/muszka-guard-0.1b-v1.0

## Resumen

Muszka Guard 0.1B v1.0 es un clasificador de seguridad (guardrail) de tipo encoder, desarrollado por el usuario Fibogacci dentro de la iniciativa muszkaowocowa.pl, y publicado en Hugging Face bajo licencia Apache 2.0. Su funcion es actuar como filtro de entrada y salida en aplicaciones que usan modelos generativos en polaco: clasifica si una consulta del usuario (o una respuesta) es segura antes de entregarsela a un LLM mayor, como Bielik, Llama, Mistral o GPT. Con 124.447.494 parametros (unos 124 M, coherentes con una base RoBERTa), esta disenado para ejecutarse exclusivamente en CPU con una latencia media declarada de 18,2 ms y un consumo de RAM de unos 420 MB.

El modelo parte del trabajo abierto de SpeakLeash y su proyecto Bielik Guard 0.1B (Sojka), concretamente de `speakleash/Bielik-Guard-0.1B-v1.1` y del encoder polaco `sdadas/mmlw-roberta-base`. Sobre esa base, la version 1.0 anade un sexto vector de amenaza (`jailbreak`, que cubre inyeccion de prompts y ataques tipo DAN), calibracion de atencion sobre tokens cortos (letras sueltas, abreviaturas, sustantivos cotidianos) y un empaquetado ONNX optimizado para despliegue en VPS de bajo coste.

Su relevancia actual es de nicho pero clara: la mayoria de los guardrails publicos estan centrados en ingles, y las aplicaciones en polaco necesitan un clasificador nativo, ligero y sin GPU. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y la model card esta truncada, por lo que se trata de un artefacto reciente y sin validacion independiente conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder RoBERTa base polaco (`sdadas/mmlw-roberta-base`) |
| Parametros totales | 124.447.494 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (las mediciones de latencia se realizan a seq_len 128) |
| Tipos de cuantizacion | no disponible (se distribuye safetensors de PyTorch y grafo ONNX optimizado) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y ONNX (`muszka_v1.onnx`, `muszka_v1.onnx.data`) |
| Tarea (pipeline) | `text-classification` (clasificacion multi-etiqueta de seguridad) |
| Modelos base | `speakleash/Bielik-Guard-0.1B-v1.1`, `sdadas/mmlw-roberta-base` |
| Tamano del repositorio | 1,0 GB |
| Fecha de creacion | 2026-09-19 (fecha indicada en Hugging Face) |
| Autoria | Fibogacci |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo RoBERTa en su variante base adaptada al polaco (`sdadas/mmlw-roberta-base`), con salida de clasificacion multi-etiqueta sobre seis vectores de amenaza. El autor indica que los seis vectores incluyen el nuevo `jailbreak` (inyeccion de prompts, jailbreaks tipo "Do Anything Now" e instrucciones orientadas a saltarse los limites de seguridad del sistema), ademas de las categorias heredadas del proyecto Bielik Guard. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados, ni si hubo fases de RLHF o DPO; no obstante, por tratarse de un clasificador encoder, el ajuste se realiza habitualmente por aprendizaje supervisado sobre pares texto-etiqueta, y no consta ningun proceso de alineacion por preferencias.

La innovacion tecnica declarada se concentra en dos frentes. El primero es la "calibracion de atencion sobre tokens cortos": el autor reporta un ajuste con anclas negativas duras (letras sueltas, abreviaturas y sustantivos cotidianos) para evitar el colapso de la auto-atencion en entradas muy cortas, un fallo tipico de los clasificadores de seguridad que produce falsos positivos al recibir tokens aislados. El segundo es el empaquetado "CPU-first": el repositorio incluye un grafo ONNX preconvertido y optimizado para `onnxruntime`, pensado para inferencia sin GPU en instancias VPS economicas. No se especifica en la informacion disponible el numero de epocas, la tasa de aprendizaje ni los hiperparametros del ajuste.

## Capacidades

- Clasificacion de seguridad de texto en polaco como filtro de entrada (pre-generacion) y de salida (post-generacion) para LLM.
- Deteccion multi-etiqueta sobre seis vectores de amenaza, entre ellos el vector `jailbreak` (inyeccion de prompts, ataques DAN, intentos de anular las reglas del sistema).
- Moderacion de contenido: los tags del repositorio incluyen `content-moderation`, `guardrails`, `safety` y `ai-safety`.
- Estabilidad declarada ante entradas muy cortas: la auditoria del autor reporta 0,0 % de falsos positivos en letras sueltas (incluidas diacriticas polacas), combinaciones de 2 y 3 letras, y 0,1 % sobre 2.000 sustantivos frecuentes del diccionario polaco.
- Inferencia en CPU con latencia declarada de 18,2 ms de media y aproximadamente 50 peticiones por segundo por nucleo de CPU.
- Distribucion en dos formatos: safetensors para reentrenamiento o ajuste fino con `transformers`, y ONNX para despliegue en `onnxruntime` desde Python, C#, Rust, Go o Node.js.
- No se mencionan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado previo de prompts en chatbots polacos: el clasificador se interpone entre el usuario y el LLM generativo (Bielik, Llama, Mistral) y descarta o marca la consulta antes de gastar tokens de generacion, con 18,2 ms de latencia media por peticion.
- Deteccion de jailbreaks en produccion: el sexto vector esta especificamente entrenado para reconocer instrucciones del tipo "ignora las reglas de seguridad" o variantes DAN, lo que permite bloquear intentos de anulacion de politicas antes de que lleguen al modelo grande.
- Moderacion de contenido generado por usuarios en foros o marketplaces polacos: el modelo clasifica comentarios entrantes y permite enrutar automaticamente los casos dudosos a revision humana.
- Puerta de seguridad en pipelines RAG: antes de recuperar documentos o ejecutar herramientas, se valida la consulta del usuario para evitar inyecciones de prompt indirectas a traves de consultas maliciosas.
- Reentrenamiento y adaptacion de dominio: al publicarse los pesos completos en safetensors con licencia Apache 2.0, un equipo puede hacer ajuste fino sobre su propio corpus (por ejemplo, terminologia medica o financiera en polaco) sin partir de cero.
- Despliegue en VPS de bajo coste o entornos sin GPU: con unos 420 MB de RAM residente y 0 MB de VRAM necesarios, cabe en instancias baratas o en el mismo host que sirve la aplicacion, sin necesidad de acelerador.
- Filtro de salida en servicios de generacion de codigo: el ejemplo de la model card contempla tanto preguntas legitimas de configuracion de `iptables` como peticiones de exploits contra routers, de modo que puede separar consultas de administracion de sistemas de peticiones maliciosas.
- Auditoria por lotes de historicos de conversacion: al procesar aproximadamente 50 peticiones por segundo y nucleo, permite reescanear grandes volumenes de logs ya almacenados para detectar casos de abuso no capturados en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes, algo esperable en un clasificador y no en un modelo generativo). El autor si publica una auditoria empirica de casos limite sobre 2.234 elementos:

| Subconjunto de prueba | Muestras | Tasa de falsos positivos | Ejemplos y probabilidad de amenaza medida |
|---|---|---|---|
| Letras sueltas (a-z, A-Z, diacriticos polacos) | 70 | 0,0 % (0/70) | `k`: 1,6 %; `D`: 1,5 %; `a` con ogonek: 1,2 %; `Z`: 1,3 % |
| Combinaciones de 2 letras (calendario, iniciales, n-gramas) | 78 | 0,0 % (0/78) | `wt`: 1,4 %; `sb`: 1,3 %; `pt`: 1,2 %; `pn`: 1,2 % |
| Combinaciones de 3 letras | 86 | 0,0 % (0/86) | `kuj`: 1,1 %; `kot`: 1,4 %; `dom`: 1,2 %; `las`: 1,1 % |
| Sustantivos frecuentes del diccionario polaco | 2.000 | 0,1 % (3/2.000) | `wujek`: 1,6 %; `brata`: 1,6 %; `ciebie`: 1,4 %; `faceta`: 1,7 % |

Metricas de recursos declaradas por el autor (ejecucion solo CPU con ONNX Runtime): latencia media 18,2 ms (minimo 11,4 ms, maximo 28,5 ms con seq_len 128), huella de RAM residente aproximada de 420 MB y un caudal de unas 50 peticiones por segundo por nucleo. La model card se corta en la frase final de esta seccion, por lo que no se dispone del resto de conclusiones de la auditoria.

## Requisitos de hardware

- VRAM: 0 MB. El autor indica explicitamente que no se necesita GPU para inferencia.
- RAM: aproximadamente 420 MB residentes, incluyendo el grafo ONNX cargado, el runtime y el tokenizador.
- CPU: cualquier CPU moderna; el caudal declarado es de unas 50 peticiones por segundo por nucleo, con latencias medidas entre 11,4 ms y 28,5 ms a seq_len 128.
- GPU: no son necesarias. No se han publicado mediciones de latencia en A100, H100, RTX 4090 ni ninguna otra GPU en la informacion disponible; el modelo esta optimizado para CPU.
- Cabe holgadamente en cualquier equipo de consumo, portatil o VPS, ya que el unico requisito real es disponer de unos 450 MB de memoria libre.
- Opciones de despliegue: `onnxruntime` (con bindings para Python, C#, Rust, Go y Node.js) para el grafo ONNX; `transformers` de Hugging Face con los pesos safetensors para ajuste fino o inferencia en PyTorch; tambien es posible servirlo como API de clasificacion propia.
- vLLM, TGI, llama.cpp y Ollama no estan pensados para un encoder de clasificacion como este; la informacion disponible no menciona soporte para ellos.
- No se dispone de datos sobre latencia ni caudal en GPU ni sobre tecnicas de batching concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Muszka Guard 0.1B v1.0 | 124,4 M | Polaco | no disponible | safetensors + ONNX | Apache 2.0 | Anade el vector `jailbreak` y calibracion de tokens cortos; 18,2 ms de latencia en CPU |
| `speakleash/Bielik-Guard-0.1B-v1.1` (modelo base) | no disponible en la informacion proporcionada | Polaco | no disponible | no disponible | no disponible | Base directa de Muszka Guard; no incluye el vector `jailbreak` segun la model card |
| `sdadas/mmlw-roberta-base` (modelo base) | no disponible en la informacion proporcionada | Polaco | no disponible | no disponible | no disponible | Encoder RoBERTa base polaco sobre el que se construye la familia Bielik Guard |
| Guardrails generativos tipo Llama Guard u otros clasificadores multilingues | no disponible | no disponible | no disponible | no disponible | no disponible | Se mencionan como alternativa de categoria, pero la informacion proporcionada no incluye sus especificaciones |

No se dispone de comparativas de rendimiento frente a alternativas: no hay benchmarks comunes publicados en la informacion disponible para Muszka Guard, Bielik Guard 0.1B ni el encoder base.

## Limitaciones y advertencias

- Cobertura linguistica limitada al polaco (`pl`); no hay evidencia de comportamiento en castellano ni en otros idiomas, por lo que su uso fuera del polaco no esta respaldado.
- Es un clasificador multi-etiqueta, no un generador: no sirve para responder consultas, razonar ni generar codigo, solo para etiquetar.
- La model card esta truncada en la seccion de auditoria, de modo que no se conocen las conclusiones completas del autor ni el recall de amenazas reales (los datos publicados miden falsos positivos, no falsos negativos).
- La auditoria de 2.234 elementos esta realizada por el propio autor; no consta validacion externa ni revision por pares.
- El tag `arxiv:2602.07954` aparece en los metadatos, pero no se ha podido verificar dicho identificador en la informacion disponible; debe tratarse con cautela hasta confirmar la publicacion.
- No hay datos publicos de sesgo, de tasa de falsos negativos ni de comportamiento en dominios especializados (medico, legal, financiero).
- Como todo clasificador de seguridad, presenta riesgo de evadir la deteccion mediante parafraseo, ofuscacion, homoglifos o ataques multi-turno no representados en los datos de ajuste; no se han publicado pruebas adversariales externas.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre, pero si existe riesgo de clasificacion erronea silenciosa.
- Licencia Apache 2.0 en este repositorio, lo que permite uso comercial y modificacion; conviene verificar por separado las condiciones de los modelos base (`speakleash/Bielik-Guard-0.1B-v1.1` y `sdadas/mmlw-roberta-base`), cuyo licenciamiento no se detalla en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes, y fue creado el 2026-09-19; se trata de un artefacto reciente sin adopcion documentada.
- No se especifica la longitud de contexto del modelo, dato relevante porque los textos largos podrian truncarse; las mediciones de latencia se hicieron a seq_len 128, lo que sugiere un uso orientado a entradas cortas.
- La ausencia de benchmarks estandar impide comparar su calidad frente a otros guardrails de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fibogacci/muszka-guard-0.1b-v1.0
- Demo interactiva (Space, marcada como "In Progress"): https://huggingface.co/spaces/Fibogacci/muszka-guard-demo
- Sitio del proyecto (version en ingles): https://muszkaowocowa.pl/en/
- Sitio del proyecto (version en polaco): https://muszkaowocowa.pl/
- Modelo base: https://huggingface.co/speakleash/Bielik-Guard-0.1B-v1.1
- Encoder base: https://huggingface.co/sdadas/mmlw-roberta-base
- Referencia arXiv indicada en los tags del modelo (no verificada): arxiv:2602.07954
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a un comercio de suplementos), por lo que no aportan enlaces adicionales utilizables.

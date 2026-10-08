# Borcherding/laya-multilingual-calculator-router

## Resumen

Laya multilingual calculator router es un modelo de decisión de 321.908.998 parámetros (unos 322 M) desarrollado por el usuario Borcherding y afinado a partir del checkpoint `multilingual` de `convaiinnovations/laya`. No es un modelo generativo: es un clasificador que responde una única pregunta antes de cada paso de un agente, es decir, si el siguiente paso requiere un cálculo (aritmética, porcentajes, conversión de unidades o divisas, matemáticas de fechas, estadística o código que opere con números) y, además, puntúa cuánto trabajo de cálculo implica ese paso en una escala de 0 a 2 (nada, trivial o trabajo real).

El problema que resuelve es concreto y muy habitual en pipelines de agentes: los modelos base tienden a responder "sí" ante cualquier mensaje que contenga un número, lo que provoca llamadas innecesarias a la herramienta de calculadora o al intérprete de código. Según la model card, el Laya base acierta un 0,52 en la tarea de detección, mientras que este ajuste alcanza 0,89 sobre el mismo conjunto de test retenido de 1.200 filas. La mejora se concentra en los casos negativos (identificadores, versiones, totales ya devueltos por una herramienta o texto que habla de dinero sin operar con él), que pasan de 0,31 a 0,95 de exactitud.

Es relevante por su tamaño reducido (repo de 0,7 GB, entrenamiento con 1,59 GB de VRAM pico en una GPU de gama de entrada), su licencia Apache 2.0 y su enfoque multilingüe en inglés, alemán, español y francés, lo que lo hace desplegable como componente de enrutado de bajo coste dentro de un agente mayor. El ajuste se realizó con Unsloth y `FastDecisionModel` sobre el dataset `Borcherding/calculator-routing`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `convaiinnovations/laya`, checkpoint `multilingual`; el LoRA se fusiona en el encoder tras el entrenamiento) |
| Parametros totales | 321.908.998 (aproximadamente 322 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible de forma explicita; el repo se distribuye en safetensors. Por tamano, caben FP32 (aproximadamente 1,29 GB), FP16/BF16 (aproximadamente 0,64 GB), INT8 (aproximadamente 0,32 GB) e INT4 (aproximadamente 0,16 GB) |
| Idiomas soportados | ingles (en), aleman (de), espanol (es), frances (fr) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB) |
| Libreria | laya |
| Tarea (pipeline) | text-classification (decision tipada, tipo `noul` y `score`) |
| Dataset de ajuste | Borcherding/calculator-routing |
| Modelo base | convaiinnovations/laya (subcarpeta `multilingual`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Laya. Los unicos datos tecnicos explicitos son que se parte de `convaiinnovations/laya` en su checkpoint multilingue y que el ajuste se realiza mediante LoRA que posteriormente se fusiona en el encoder, lo que indica una arquitectura de tipo encoder sobre la que se aplican cabezas de decision tipadas. El modelo no genera texto libre: expone decisiones estructuradas mediante la libreria `laya` (`from laya.agent import Agent`), con dos preguntas por paso: `needs_calculation` (tipo `noul`, que devuelve la probabilidad de que el paso requiera calculo) y `difficulty` (tipo `score`, de 0 a 2, con los criterios `none`, `trivial, done in your head` y `real working`).

El entrenamiento uso 6.000 filas de entrenamiento que generan 12.000 decisiones, con LoRA de rango 64, alpha 64 y dropout 0, fusionado en el encoder tras el ajuste. Se ejecutaron 750 pasos (2 epocas) con batch 8 y acumulacion de gradiente 2, learning rate 8e-4 con schedule coseno, optimizador AdamW y semilla 3407. El proceso completo duro 585 segundos (0,8 s por paso) con un pico de 1,59 GB de VRAM en una AMD Radeon RX 6500 XT, y la perdida bajo de 0,84 en el primer paso a 0,30 en el ultimo. Tras el entrenamiento, `FastDecisionModel.calibrate` ajusto las temperaturas de probabilidad sobre el split de test; segun el autor, esto no altera la exactitud pero invalida el ECE de test (0,12 a 0,14) como metrica limpia de validacion. El script `train.py` del repositorio reproduce el proceso con `python train.py <dataset_dir> 750 <out_dir>`.

## Capacidades

- Clasificacion binaria de intencion de calculo: estima la probabilidad de que el siguiente paso de un agente requiera producir un numero mediante computo (aritmetica, porcentajes, conversion de unidades o divisas, matematicas de fechas, estadistica o codigo que opere con numeros).
- Distincion entre uso numerico y mencion numerica: descarta identificadores de pedido, versiones de software, numeros usados como nombres y totales ya devueltos por una herramienta.
- Puntuacion de dificultad de calculo: devuelve un `score` de 0 a 2 que separa operaciones mentales triviales de trabajo real (varios pasos, numeros grandes o incomodos, o una formula).
- Decisiones tipadas con esquema: las preguntas se formulan con un tipo (`noul`, `score`) e instrucciones en lenguaje natural, y las respuestas se devuelven como estructura de diccionario.
- Integracion como "system one": funciona como primer paso rapido de un agente antes de invocar una herramienta (`calculator`, `web_search`, `code`) o de continuar el razonamiento.
- Multilingue en en, de, es y fr.
- Soporte de tool calling / function calling: no aplica, el modelo no llama herramientas; su funcion es decidir si otra capa debe llamarlas.
- Soporte de agentes y razonamiento multi-paso: si, como componente de enrutado dentro de un bucle de agente.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Enrutado de herramientas en agentes: antes de cada paso, el modelo decide si hay que invocar la calculadora o el interprete de codigo; al evitar llamadas innecesarias en pasos con numeros de identificacion o totales ya calculados, reduce coste y latencia del bucle completo.
- Planificacion de viajes y presupuestos: en el ejemplo de la propia model card, con precios de dos alojamientos y una peticion de "reserva el mas barato para 4 noches y dime el total", el modelo identifica correctamente que el paso exige multiplicacion y suma y activa la calculadora.
- Escalado de esfuerzo computacional: el `score` de dificultad de 0 a 2 permite que el agente resuelva calculos triviales en el propio modelo grande y derive a herramienta solo los que implican varios pasos, numeros incomodos o formulas.
- Atencion al cliente con facturacion: en conversaciones multi-turno sobre importes, descuentos o conversion de divisa en espanol, aleman, ingles o frances, filtra que turnos requieren calculo real frente a los que solo citan cifras ya emitidas.
- Auditoria y etiquetado de trazas de agentes: procesar logs de conversaciones y marcar retroactivamente que pasos requirieron computo numerico, util para analizar donde fallan los agentes o para curar datos de entrenamiento.
- Control de calidad previo en sistemas de preguntas y respuestas financieras: clasificar la consulta entrante para decidir si se enruta a un motor de calculo financiero, a un buscador de datos o a respuesta directa.
- Enrutado en asistentes de documentacion tecnica con numeros: el modelo fue entrenado especificamente para no confundir versiones, identificadores y unidades de almacenamiento con operaciones aritmeticas, aunque en este dominio presenta fallos documentados (vease la seccion de limitaciones).
- Reduccion de consumo en despliegues de agentes a gran escala: con 322 M de parametros y menos de 2 GB de VRAM en entrenamiento, se puede ejecutar en el mismo host que el modelo principal, incluso en CPU, para filtrar pasos antes de gastar tokens del modelo grande.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el split de test retenido de 1.200 filas (600 por clase), con plantillas, nombres y entidades no vistos en entrenamiento:

| `needs_calculation` | Laya base | Este modelo |
|---|---|---|
| Exactitud global | 0,52 | 0,89 |
| Pasos que requieren calculo (600) | 0,74 | 0,84 |
| Pasos que no requieren calculo (600) | 0,31 | 0,95 |

| Ambas preguntas juntas | Laya base | Este modelo |
|---|---|---|
| Exactitud (FastDecisionModel.evaluate) | 0,32 | 0,88 |

Resultados por familia en el conjunto retenido:

| Familia | Filas de test | Laya base | Modelo ajustado | Frase retenida |
|---|---|---|---|---|
| `tech` | 44 | 0,89 | 0,00 | How much VRAM do the weights of a 3B model take at 8-bit? |
| `estimate` | 54 | 0,46 | 0,43 | About how many pages is a 297k word book? |
| `conversion` | 47 | 0,72 | 0,53 | How many cups is 296.7 ml? |
| `lookup` (sin calculo) | 51 | 0,47 | 0,75 | How much does a PS5 Slim cost right now? |

Segun el autor, el modelo ajustado obtiene 1,0 en las familias `identifiers`, `handoff_nocalc`, `writing`, `explain` y `code_no_numbers`. La calibracion de temperaturas se ajusto sobre el propio test, por lo que el ECE reportado (0,12 a 0,14) no es una medida limpia sobre datos no vistos. Medicion realizada el 2026-10-07 en una AMD Radeon RX 6500 XT (Windows 11, ROCm 7.14, torch 2.11.0+rocm7.14) a traves del `laya.agent.Agent` servido por la API de decisiones de Unsloth Studio. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia estimada: aproximadamente 1,29 GB en FP32, 0,64 GB en FP16/BF16, 0,32 GB en INT8 y 0,16 GB en INT4 (estimacion por numero de parametros; el autor no publica cifras de inferencia).
- VRAM de entrenamiento medida: 1,59 GB de pico en una AMD Radeon RX 6500 XT con ROCm 7.14, con LoRA de rango 64 fusionado posteriormente.
- GPU recomendadas: cualquier GPU con 4 GB o mas sirve para el modelo en precision completa; cabe en una RX 6500 XT, GTX 1650, RTX 3050/3060, RTX 4090, A100 o H100 sin problema (en estas ultimas el modelo es un componente auxiliar, no el consumidor principal). Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquiera, incluidas las de gama de entrada con 4 GB, y en CPU.
- Opciones de despliegue: la via documentada es la libreria `laya` con `Agent("Borcherding/laya-multilingual-calculator-router", device="cuda")` y pesos safetensors. No hay informacion disponible sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponible. Como referencia de coste de entrenamiento, 0,8 segundos por paso con batch 8 y acumulacion 2 en la GPU citada.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos comparables de enrutado de decisiones de la misma categoria. La unica comparacion documentada es contra el propio modelo base:

| Modelo | Parametros | Contexto | Exactitud en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Borcherding/laya-multilingual-calculator-router | 321.908.998 | no disponible | 0,89 (needs_calculation) / 0,88 (ambas preguntas) | apache-2.0 | HuggingFace |
| convaiinnovations/laya (checkpoint `multilingual`) | no disponible | no disponible | 0,52 (needs_calculation) / 0,32 (ambas preguntas) | no disponible | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Falsos negativos en conversion con factor implicito: el modelo lee estructuras del tipo "cuanto / cuantos X es Y" con un factor que no aparece en el mensaje como una consulta de busqueda y no como un calculo. La familia `tech` cae de 0,89 en el modelo base a 0,00 en el ajustado en la frase retenida sobre VRAM en 8 bits; `conversion` baja de 0,72 a 0,53 y `estimate` de 0,46 a 0,43.
- Falsos positivos en consultas de precio: la familia `lookup` (que no requiere calculo) se queda en 0,75, es decir, una de cada cuatro consultas de precio en tiempo real se clasifica de forma incorrecta.
- Dependencia de la formulacion: el autor indica que las preguntas deben formularse con la redaccion exacta del entrenamiento; parafrasear las instrucciones puede degradar el resultado.
- Alcance limitado a cuatro idiomas (en, de, es, fr). No hay informacion sobre otros idiomas.
- No es un modelo generativo: no produce texto ni resuelve el calculo, solo decide si hace falta y cuanto esfuerzo implica. No debe usarse como sustituto de una calculadora o de un interprete de codigo.
- Riesgo de alucinacion: no aplica en el sentido generativo (no inventa hechos), pero si existe riesgo de clasificacion erronea, que en un agente se traduce en no calcular algo que lo requeria.
- Calibracion no limpia: las temperaturas de probabilidad se ajustaron sobre el split de test, por lo que las probabilidades devueltas pueden estar optimizadas en exceso para ese conjunto y no generalizar a trafico real.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; conviene verificar la licencia del modelo base `convaiinnovations/laya`, no disponible en la informacion proporcionada.
- Traccion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en octubre de 2026. No hay evidencia de uso en produccion por terceros.
- Para produccion, el propio autor recomienda tratar con cautela el lado "no" en las familias con factor implicito, o anadir esas formulaciones y volver a afinar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Borcherding/laya-multilingual-calculator-router
- Dataset de ajuste: https://huggingface.co/datasets/Borcherding/calculator-routing
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.

# A-M-K/firebrief-glimmer-30b-extract-lora

## Resumen

FireBrief extractor es un adaptador LoRA publicado por el usuario A-M-K sobre el modelo base Muse-Glimmer-30B de Meta, una familia de modelos agenticos de 30.000 millones de parametros distribuida bajo licencia Apache 2.0. El adaptador esta especializado en una unica tarea: convertir transcripciones de llamadas al 911, comunicaciones de radio de despacho e informes de civiles en una ficha estructurada de incidente que incluye direccion, ubicaciones del fuego, personas afectadas (con necesidades de movilidad), obstrucciones, peligros y codigos de radio. Cada dato extraido conserva una cita textual verificable de la fuente original.

El modelo resuelve un problema muy concreto de extraccion de informacion en el dominio de emergencias: la salida del modelo base, sin ajuste, tiene una precision de campo de 0,59, mientras que con el adaptador asciende a 0,85, con mejoras notables en F1 de fuego (0,68 a 0,95) y de personas (0,73 a 0,82). El adaptador se entreno con QLoRA sobre el modelo base cuantizado a 4 bits en MLX, el framework de Apple para silicio propio, y esta pensado para ejecutarse localmente en un portatil Mac.

Se trata de un prototipo de hackathon, no de un producto operativo. El propio autor advierte que no debe usarse en despacho real de emergencias y que toda salida requiere verificacion humana. Su interes tecnico radica en demostrar como un ajuste fino ligero (rank 8, 8 capas, 250 ejemplos sinteticos, 19 minutos de entrenamiento) puede transformar un modelo generalista de 30B en un extractor de esquema fiable con citas verbatim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer causal con encoder de percepcion (Muse-Glimmer-30B) |
| Parametros totales | 30B en el modelo base; el adaptador LoRA es de rango 8 sobre las ultimas 8 capas |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitud maxima de secuencia en entrenamiento: 2048 tokens) |
| Tipos de cuantizacion | base en 4 bits (QLoRA); adaptador en precision de entrenamiento |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador MLX (libreria mlx-lm); el modelo base se distribuye en formato MLX 4-bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Muse-Glimmer-30B, un modelo de lenguaje causal de 30.000 millones de parametros con encoder de percepcion, disenado por Meta para tareas agenticas en hardware de consumo. La adaptacion se realizo mediante QLoRA: el modelo base cuantizado a 4 bits permanece congelado y se entrenan adaptadores de rango 8 (escala 20, sin dropout) unicamente en las ultimas 8 capas del transformer. La perdida se calcula solo sobre la completion (completion-only loss), con checkpointing de gradientes y una longitud maxima de secuencia de 2048 tokens.

El conjunto de datos es completamente sintetico y especifico del proyecto: 250 ejemplos de entrenamiento, 40 de validacion y 60 de test, compuestos por transcripciones de llamadas e informes redactados a mano con fichas de incidente como objetivo. El entrenamiento consistio en una sola epoca, tamano de lote 4, tasa de aprendizaje 1e-4 con decaimiento coseno hasta 1e-5 y semilla 7. La ejecucion completa duro unos 19 minutos en un Mac con silicio de Apple, con la GPU compartida con otro trabajo, y la perdida de validacion bajo de 0,270 a 0,080. Los pesos publicados corresponden al checkpoint de la iteracion 60 (240 de 250 filas, 0,96 epocas).

## Capacidades

- Extraccion de informacion estructurada: genera fichas de incidente con campos de direccion, ubicaciones del fuego, personas (incluidas necesidades de movilidad), obstrucciones, peligros y codigos de radio.
- Trazabilidad de datos: cada hecho extraido incluye una cita textual verbatim de la fuente, lo que permite verificacion manual.
- Cumplimiento de esquema: el 100% de las salidas respetan el esquema definido, tanto en el modelo base como con el adaptador.
- Calibracion de confianza: el error de calibracion esperado (ECE) se reduce de 0,19 a 0,10, aproximadamente la mitad.
- Procesamiento de texto de emergencias: entrenado especificamente con transcripciones de llamadas al 911, radio de despacho e informes civiles.
- Generacion de texto en ingles: el adaptador hereda las capacidades generales del modelo base, aunque su ajuste esta orientado a la tarea de extraccion.
- Capacidades multimodales del modelo base: Muse-Glimmer acepta texto e imagen segun la documentacion de Meta, aunque el adaptador no fue entrenado para entradas visuales.

## Casos de uso

- Asistencia a despacho de emergencias (prototipo): el adaptador transforma una transcripcion de llamada en una ficha de incidente con direccion, plantas afectadas y personas con necesidades de movilidad, que el operador puede revisar antes de transmitirla a los bomberos. Adecuado por su alta F1 en fuego (0,95) y obstrucciones (1,00).
- Generacion de briefings por planta para bomberos: a partir de informes de civiles y radio, el modelo produce un resumen estructurado que FireBrief convierte en una vista piso a piso del edificio, util para planificar la entrada.
- Extraccion de entidades con trazabilidad: en cualquier pipeline donde se requiera auditar la fuente de cada dato, las citas verbatim permiten reconstruir de que fragmento del texto salio cada campo.
- Investigacion sobre calibracion en modelos pequenos: el adaptador demuestra que un ajuste LoRA ligero reduce el ECE de 0,19 a 0,10, lo que lo hace util como caso de estudio para tecnicas de estimacion de incertidumbre.
- Prototipado rapido en local: al ejecutarse en MLX sobre un Mac con silicio de Apple, permite iterar sobre prompts y esquemas sin depender de infraestructura cloud.
- Evaluacion de tecnicas QLoRA en dominios de alto riesgo: sirve como referencia para medir cuanto puede mejorar un modelo generalista con 250 ejemplos sinteticos en una tarea de extraccion con esquema estricto.
- Docencia y demostraciones: el par modelo base mas adaptador, con solo 19 minutos de entrenamiento, es un ejemplo reproducible de fine-tuning eficiente para talleres y cursos.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test reservado (60 llamadas e informes no vistos en entrenamiento), comparando el modelo base solo con prompt frente al modelo con el adaptador:

| Metrica | Modelo base (solo prompt) | Con adaptador | Cambio |
|---|---:|---:|---:|
| Precision de campo | 0,59 | 0,85 | +0,26 |
| F1 de fuego | 0,68 | 0,95 | +0,27 |
| F1 de personas | 0,73 | 0,82 | +0,09 |
| F1 de obstrucciones | 0,92 | 1,00 | +0,08 |
| Error de calibracion (ECE, menor es mejor) | 0,19 | 0,10 | aproximadamente la mitad |
| Salida valida segun esquema | 100% | 100% | igual |
| Citas verbatim de la fuente | 100% | 100% | igual |
| F1 de peligros | 1,00 | 0,97 | -0,03 |
| F1 de codigos de radio | 0,95 | 0,90 | -0,05 |

El descenso en codigos de radio se restaura a 1,00 en FireBrief mediante reglas deterministas de post-procesamiento, que no forman parte de este adaptador. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 15-17 GB, estimacion orientativa a partir de los 30B parametros; el adaptador anade una cantidad marginal.
- GPU recomendadas: el adaptador esta disenado para MLX, por lo que el hardware objetivo son chips de Apple (series M1, M2, M3, M4) con memoria unificada suficiente. No se documenta soporte nativo para GPU NVIDIA en este repositorio.
- Cabe en GPU de consumo: si, en equipos Apple con al menos 24-32 GB de memoria unificada; el autor lo ejecuto en un portatil Mac.
- Opciones de despliegue: mlx-lm (carga directa con adapter_path o fusion con mlx_lm fuse). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: aproximadamente 12 segundos para un lote de demostracion de 5 fuentes en un portatil con silicio de Apple, frente a unos 10 segundos del modelo base. La fusion del adaptador en los pesos base acelera la carga.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de alternativas directamente comparables en la informacion proporcionada. La comparativa mas relevante es interna, entre el modelo base y el adaptador:

| Configuracion | Precision de campo | F1 de fuego | ECE | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Muse-Glimmer-30B (solo prompt) | 0,59 | 0,68 | 0,19 | Apache 2.0 | publica |
| Muse-Glimmer-30B + FireBrief LoRA | 0,85 | 0,95 | 0,10 | Apache 2.0 | publica |

Como alternativas genericas de la misma categoria (extraccion de informacion con modelos de 7B a 30B) podrian considerarse adaptadores LoRA sobre Llama, Mistral o Qwen, pero no se han encontrado resultados comparables en la informacion disponible.

## Limitaciones y advertencias

- Una sola ejecucion de entrenamiento, sin busqueda de hiperparametros; cada configuracion se evaluo una unica vez, lo que limita la significacion estadistica de las mejoras.
- Los datos de entrenamiento y test son sinteticos, solo en ingles y centrados en direcciones de Nueva York; no se ha validado con audio ni transcripciones reales del 911.
- Es un prototipo de investigacion y no debe usarse en despacho operativo de emergencias; toda salida requiere verificacion humana.
- Riesgo de alucinacion inherente al modelo base, aunque las citas verbatim y la calibracion mejorada mitigan parcialmente el problema.
- El adaptador rinde mejor con el prompt de extraccion y el formato de ficha propios de FireBrief; otros prompts pueden degradar el rendimiento.
- El F1 de codigos de radio baja de 0,95 a 0,90 con el adaptador; la recuperacion depende de reglas de post-procesamiento externas.
- Limitacion idiomatica: solo ingles, sin soporte documentado para castellano u otros idiomas.
- Licencia Apache 2.0 permisiva para uso comercial, pero la naturaleza sintetica y no validada de los datos desaconseja su uso en produccion sin una evaluacion adicional con datos reales.
- Dependencia del ecosistema MLX y de hardware Apple; no hay soporte documentado para despliegue en servidores NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/A-M-K/firebrief-glimmer-30b-extract-lora
- Modelo base en Hugging Face: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina de Muse Glimmer en AI/TLDR: https://ai-tldr.dev/models/muse-glimmer/
- Publicacion de Muse Glimmer 30B en ai.meta.com: https://ai.meta.com/research/publications/muse-glimmer-30b-an-on-device-agentic-model/

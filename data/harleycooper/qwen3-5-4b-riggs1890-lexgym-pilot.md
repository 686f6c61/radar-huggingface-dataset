# HarleyCooper/Qwen3.5-4B-Riggs1890-lexgym-pilot

## Resumen

Qwen3.5-4B-Riggs1890-lexgym-pilot es un adaptador LoRA de rango 32 sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario HarleyCooper. No se trata de un modelo completo ni de un asistente linguistico: es un checkpoint de investigacion que verifica la viabilidad de un metodo de entrenamiento denominado Riggs 1890 Lexicon Gym, cuyo objetivo es ensenar al modelo reglas morfologicas y de anotacion extraidas de un diccionario historico.

El modelo base es un transformer de 4.000 millones de parametros de la familia Qwen3.5, sobre el que se aplica un calentamiento supervisado seguido de 30 pasos de aprendizaje por refuerzo con recompensas deterministas. La fuente de todos los datos de entrenamiento es el diccionario dakota-ingles de Stephen R. Riggs publicado en 1890, de dominio publico, lo que situa el trabajo en el ambito de las lenguas de bajos recursos y de la preservacion linguistica computacional.

Su relevancia es metodologica, no practica: demuestra que el RL puede restaurar y mejorar comportamientos de consulta lexicografica que el entrenamiento supervisado degrada, y que las reglas de silabacion y acentuacion del libro transfieren a palabras no vistas. El autor advierte explicitamente de que los adaptadores no conocen el vocabulario dakota y de que no son un asistente de esa lengua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre transformer Qwen3.5-4B |
| Parametros totales | 4B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador PEFT en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | dak (dakota), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer denso de 4.000 millones de parametros. El entrenamiento se estructuro en dos fases. La primera fue un calentamiento supervisado con 56.120 filas de chat correspondientes a seis tipos de tarea de un solo turno, durante una epoca (436 pasos de 128 filas) con tasa de aprendizaje 2e-4 y un coste de 3,61 dolares. La segunda fase aplico aprendizaje por refuerzo sobre 68.911 tareas de ocho tipos con recompensas deterministas: 30 pasos de 32 tareas por 8 rollouts, tasa 2e-5 y temperatura 1,0, con un coste de 1,12 dolares.

La perdida de RL es el gradiente de politica por muestreo de importancia del tinker-cookbook 0.6.1, con ventajas centradas dentro de cada grupo de rollouts y sin juez LLM. La infraestructura utilizada fue Thinking Machines Tinker. El repositorio incluye dos conjuntos de pesos: la raiz (calentamiento supervisado mas 30 pasos de RL) y stage1-supervised/ (solo calentamiento supervisado). Los datos de entrenamiento provienen de una lectura mediante modelo de vision de escaneos de pagina del diccionario, por lo que contienen errores de lectura reconocidos por el autor.

## Capacidades

- Silabacion y acentuacion segun la ortografia de Riggs (1890): division silabica y marca de acento sobre palabras dakota, incluidas familias de palabras no vistas durante el entrenamiento.
- Etiquetado de categoria gramatical (pos) de entradas lexicas.
- Identificacion de raiz (root) de una forma dakota.
- Inflexion morfologica (inflect) segun las reglas del diccionario.
- Consulta lexicografica (lookup_gloss, lookup_root_gloss) mediante la herramienta de diccionario del entorno; el RL recupera este comportamiento que el entrenamiento supervisado elimino.
- Formato de prompt especifico: chat `qwen3_5_disable_thinking` con prompt de sistema fijo y respuestas de una linea que empiezan por `ANSWER:`.
- No soporta de forma fiable la generacion de definiciones (gloss) ni la traduccion ingles-dakota: recall cercano a cero.

## Casos de uso

- Investigacion de metodos de RL para lenguas de bajos recursos: el checkpoint sirve como referencia reproducible para comparar calentamiento supervisado frente a supervisado mas RL en tareas lexicograficas con recompensas deterministas.
- Anotacion asistida de silabacion y acento en corpus dakota historicos: con una tasa de exactitud de 0,83 en silabacion sobre familias de palabras no vistas, puede preanotar textos para revision posterior por especialistas.
- Etiquetado gramatical preliminar de entradas de diccionario: la tarea pos alcanza 0,73 de exactitud exacta tras el RL, util para estructurar lexicos digitalizados.
- Extraccion de raices para construccion de grafos lexicos: la tarea root llega a 0,58, suficiente como paso de preprocesado en pipelines de lematizacion que incluyan validacion humana.
- Generacion de trazas de entrenamiento y evaluacion: los datasets riggs1890-lexgym-traces permiten replicar el entorno y las recompensas en experimentos propios.
- Estudio de degradacion y recuperacion de capacidades: el contraste entre stage1-supervised y la raiz (por ejemplo, lookup_gloss pasa de 0,00 a 0,85) es un caso documentado de como el RL corrige comportamientos perdidos por el ajuste supervisado.

## Benchmarks y rendimiento

Tasa de coincidencia exacta, 40 tareas por tipo, una semilla, temperatura de muestreo 1,0, sobre familias de palabras no vistas (held-out word families); la tarea gloss se mide con F1 de tokens.

| Tarea | Base | stage1-supervised | root (supervisado + RL) |
|---|---|---|---|
| syllabify | 0,00 | 0,83 | 0,83 |
| pos | 0,05 | 0,38 | 0,73 |
| root | 0,00 | 0,48 | 0,58 |
| inflect | 0,00 | 0,30 | 0,38 |
| lookup_gloss | 0,50 | 0,00 | 0,85 |
| lookup_root_gloss | 0,10 | 0,00 | 0,63 |
| gloss (F1 de tokens) | 0,00 | 0,05 | 0,08 |
| en_to_dak | 0,00 | 0,00 | 0,03 |

El propio autor advierte de que diferencias de pocos puntos entre columnas quedan dentro del ruido de 40 tareas.

## Requisitos de hardware

- VRAM estimada: depende del modelo base Qwen3.5-4B y de su cuantizacion; el adaptador LoRA anade una huella minima (repositorio de 0,6 GB). No se han publicado cifras especificas para esta combinacion.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para un base de 4B en precision completa se requiere hardware de clase profesional; en cuantizaciones de 4 bits cabe en GPU de consumo, pero el autor no aporta mediciones.
- Despliegue: el autor indica servir con vLLM o SGLang mediante `--enable-lora`, por ejemplo `vllm serve Qwen/Qwen3.5-4B --enable-lora --lora-modules riggs=HarleyCooper/Qwen3.5-4B-Riggs1890-lexgym-pilot`. Los ficheros se convirtieron desde el checkpoint de Tinker con `tinker_cookbook.weights.build_lora_adapter`.
- Latencia y throughput: no disponibles. El autor senala que no ha realizado pruebas de carga de los adaptadores convertidos ni en vLLM ni en `peft`.
- Las tareas de consulta requieren la herramienta de diccionario del entorno; sin ella, el adaptador no puede ejecutar lookup_gloss ni lookup_root_gloss.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia interna, la comparativa relevante es entre los propios checkpoints del repositorio:

| Checkpoint | syllabify | pos | lookup_gloss | en_to_dak |
|---|---|---|---|---|
| Qwen3.5-4B base | 0,00 | 0,05 | 0,50 | 0,00 |
| stage1-supervised | 0,83 | 0,38 | 0,00 | 0,00 |
| root (supervisado + RL) | 0,83 | 0,73 | 0,85 | 0,03 |

## Limitaciones y advertencias

- No es un asistente de lengua dakota: el recall de definiciones y de traduccion ingles-dakota es practicamente nulo (0,08 de F1 y 0,03 de exactitud respectivamente).
- La fuente es un diccionario misionero de 1890 que registra una sola variedad escrita y no describe el dakota hablado actualmente.
- Los datos de entrenamiento proceden de una lectura automatica de escaneos y contienen errores reconocidos por el autor.
- La salida no es dakota autoritativa y no cuenta con el aval de la comunidad; el autor la plantea como punto de partida para correccion por hablantes.
- Diferencias de pocos puntos en la evaluacion quedan dentro del ruido estadistico de 40 tareas por tipo y una sola semilla.
- Los adaptadores convertidos no han sido probados bajo carga en vLLM ni en `peft`.
- El formato de prompt es estricto (`qwen3_5_disable_thinking`, prompt de sistema fijo, respuesta de una linea con prefijo `ANSWER:`); usos fuera de ese formato no estan validados.
- Licencia apache-2.0, que permite uso comercial, pero el alcance real del modelo (tareas lexicograficas cerradas) limita su aplicacion productiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/Qwen3.5-4B-Riggs1890-lexgym-pilot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Codigo (directorio `lexgym/`): https://github.com/HarleyCoops/Dakota1890
- Dataset de tareas y grafo: https://huggingface.co/datasets/HarleyCooper/riggs1890-lexicon-graph
- Dataset de trazas: https://huggingface.co/datasets/HarleyCooper/riggs1890-lexgym-traces

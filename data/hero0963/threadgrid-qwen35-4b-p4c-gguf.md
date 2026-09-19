# Hero0963/threadgrid-qwen35-4b-p4c-gguf

## Resumen

threadgrid-qwen35-4b-p4c es un ajuste fino del modelo multimodal Qwen/Qwen3.5-4B, publicado por el usuario Hero0963 (repositorio Hero0963/threadgrid-qwen35-4b-p4c-gguf). Su tarea es muy concreta: leer la captura de pantalla de un puzzle de rejilla con camino (un tablero cuadrado con waypoints numerados y muros entre celdas) y devolver el estado del tablero en JSON, con el layout de celdas y la lista de muros. Es la mitad de vision del proyecto `thread-the-grid`: el modelo interpreta la imagen y un solucionador exacto (CP-SAT) calcula la ruta.

El modelo parte de una base de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y se distribuye como una exportacion GGUF f16 para Ollama, con dos ficheros separados: el modelo de lenguaje y el proyector de vision (mmproj). El ajuste se hizo con un adaptador LoRA de rango 16 y alpha 16 sobre una copia del modelo base, y el repositorio incluye tanto el adaptador en safetensors (155.126.928 bytes) como los pesos ya fusionados en GGUF. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia es la de un caso de estudio acotado y reproducible: un VLM pequeno de 4B especializado en una tarea de percepcion estructurada, ejecutable en una GPU de 16 GB, con un ejemplo verificado de principio a fin. En el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo de vision-lenguaje derivado de Qwen/Qwen3.5-4B, exportado en GGUF con proyector de vision independiente (mmproj) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (GGUF); no se distribuyen otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF f16 (modelo de lenguaje + proyector de vision mmproj) y safetensors (adaptador LoRA) |
| Modelo base | Qwen/Qwen3.5-4B (relacion: finetune) |
| Tamano del repositorio | 9,3 GB |
| Tamano de los ficheros principales | text-f16.gguf: 8.424.393.344 bytes; mmproj-f16.gguf: 672.423.040 bytes; adapter_model.safetensors: 155.126.928 bytes |
| Configuracion del adaptador | LoRA con r=16, alpha=16, PEFT 0.19.1 |
| Tarea declarada (pipeline) | image-text-to-text |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B (numero de capas, tipo de atencion, mecanismo multimodal). Lo que si se puede confirmar por los artefactos publicados es que se trata de un modelo de vision-lenguaje con dos componentes separados en la exportacion GGUF: un fichero para el modelo de lenguaje (8,42 GB en f16) y un fichero mmproj para el proyector de vision (0,67 GB). Esta separacion es la habitual en el ecosistema llama.cpp/Ollama para modelos multimodales.

El entrenamiento se realizo mediante un adaptador LoRA (r=16, alpha=16, PEFT 0.19.1) sobre `unsloth/Qwen3.5-4B`, una copia del modelo base. El conjunto de datos son 8.000 tableros sinteticos de 6x6 dibujados por el renderizador del propio proyecto, de los cuales 7.800 se destinaron a entrenamiento (el resto del desglose no aparece en el extracto de la model card disponible). Un detalle relevante para interpretar el alcance del ajuste: todas las imagenes de entrenamiento se generaron con el renderizador del proyecto y ninguno de los tableros proviene de capturas de juegos reales; ademas, en todos los ejemplos de entrenamiento los muros eran negros.

## Capacidades

- Lectura de tableros de puzzle de rejilla: dada una captura de pantalla de un tablero cuadrado con waypoints numerados y muros, devuelve un objeto JSON con el campo `layout` (matriz 2D de cadenas de dos caracteres: `"  "` para celda vacia, `"xx"` para celda bloqueada y numeros con cero a la izquierda como `"01"` para waypoints) y el campo `walls` (lista de objetos con `cell1` y `cell2`).
- Vision de imagen unica: procesa una imagen PNG enviada como contenido `image_url` en una peticion compatible con la API de OpenAI.
- Salida estructurada: genera JSON directamente, sin texto adicional, cuando se usa la instruccion de entrenamiento.
- Seguimiento literal de instrucciones: el modelo esta ajustado para responder a una instruccion concreta, palabra por palabra (menciona "Zip" porque ese fue el texto de entrenamiento).
- Capacidades no documentadas: no hay informacion sobre tool calling, function calling, uso agentico, razonamiento multi-paso, audio, thinking mode ni capacidades multilingues. El unico idioma declarado es el ingles y el unico dominio validado es el de puzzles de rejilla 6x6 generados por el propio renderizador.

## Casos de uso

- Lectura automatica de tableros para un solucionador exacto: es el caso de uso original del proyecto. El modelo convierte la imagen del tablero en JSON y un solucionador CP-SAT calcula la ruta que recorre las 36 celdas; este reparto de tareas permite resolver el puzzle sin que el modelo tenga que razonar sobre la solucion.
- Generacion de estado de juego para bots: un bot que juegue a puzzles de rejilla puede usar el modelo como modulo de percepcion para reconstruir el tablero antes de planificar movimientos, con la ventaja de que la salida es un formato directamente parseable.
- Etiquetado automatico de imagenes sinteticas: como el renderizador del proyecto conoce el ground truth de cada tablero, el modelo se puede usar para predecir el JSON y comparar automaticamente con la etiqueta real, lo que permite detectar los tipos de tablero en los que falla sin anotacion manual.
- Evaluacion comparativa de VLMs pequenos: el modelo sirve como linea base especializada frente a VLMs generales de tamano similar en una tarea de percepcion geometrica con metrica objetiva (aciertos de waypoints y de muros).
- Punto de partida para dominios analogos: el adaptador LoRA incluido (r=16, alpha=16) se puede reutilizar o continuar entrenando para tareas de estructura similar, como Sudoku, nonogramas o mapas de rejilla, cambiando unicamente el conjunto de imagenes sinteticas y el formato de salida.
- Verificacion de renderizado en el desarrollo de un juego: durante el desarrollo de un editor de tableros, el modelo puede actuar como "lector independiente" que confirma que la imagen renderizada contiene exactamente los waypoints y muros que el editor cree haber dibujado.
- Transcripcion de puzzles a formato textual: para accesibilidad o para publicar tableros en foros, el modelo convierte una captura en una representacion JSON o textual que se puede editar y compartir.
- Prueba de concepto de despliegue local con Ollama: validado con Ollama 0.32.13 en una GPU NVIDIA de 16 GB, sirve como ejemplo completo y documentado de integracion de un VLM especializado en un endpoint compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). El unico dato de rendimiento documentado es un ejemplo cualitativo, no una evaluacion sistematica:

| Caso | Entrada | Resultado | Latencia |
|---|---|---|---|
| Tablero 6x6 con diez waypoints y cinco muros rojos (caso mas dificil que los datos de entrenamiento, donde los muros eran negros) | PNG de 615 x 616, sin redimensionar | Los diez waypoints y los cinco muros coinciden con la imagen; el solucionador CP-SAT encuentra la ruta por las 36 celdas y un verificador independiente confirma la solucion | 6,7 s con el modelo ya cargado, en GPU NVIDIA de 16 GB, temperatura 0 y seed 42 |

Se trata de una unica imagen de ejemplo, seleccionada por el propio autor, y la model card advierte explicitamente que demuestra que el modelo puede hacerlo, no que lo haga siempre. No hay ninguna tasa de acierto agregada publicada.

## Requisitos de hardware

- Pesos en f16: 8,42 GB para el modelo de lenguaje mas 0,67 GB para el proyector de vision, aproximadamente 9,1 GB en total. Hay que cargar los dos ficheros GGUF; con solo el primero no hay vision.
- VRAM estimada: en torno a 10-12 GB para inferencia en f16 con una ventana de contexto moderada, sumando pesos, cache KV y activaciones. El autor lo ha validado en una GPU NVIDIA de 16 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 o H100 si se busca margen y concurrencia, y tarjetas de 16 GB como RTX 4080 o RTX 4070 Ti Super para el caso validado.
- GPU de consumo: si cabe en tarjetas de 16 GB en f16 (caso validado). En tarjetas de 8-12 GB haria falta cuantizacion, pero el repositorio no publica variantes Q8, Q5 o Q4 de estos pesos.
- Opciones de despliegue: Ollama 0.32.13 (validado con el `Modelfile` incluido, que contiene unicamente dos lineas `FROM` y ningun `TEMPLATE`), llama.cpp (los GGUF con mmproj son su formato nativo) y PEFT para fusionar o continuar el entrenamiento del adaptador. El soporte en vLLM o TGI no se ha documentado.
- Latencia y throughput: 6,7 s para una unica inferencia de vision con el modelo ya cargado. No hay datos de throughput, de latencia en frio ni de comportamiento con peticiones concurrentes.
- Advertencia de despliegue: descargar y ejecutar directamente con `ollama run hf.co/...` no es equivalente al procedimiento documentado, porque Ollama elige su propia plantilla; el autor insiste en crear el modelo manualmente a partir del `Modelfile`.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos especializados en lectura de tableros de puzzle, por lo que la comparacion se limita a los dos modelos de la misma familia que aparecen en la informacion proporcionada.

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| threadgrid-qwen35-4b-p4c | 4,2 B | no disponible | GGUF f16 (LM + mmproj), safetensors (LoRA) | Apache 2.0 | Lectura de tableros de puzzle de rejilla 6x6 a JSON |
| Qwen/Qwen3.5-4B (base) | 4,2 B | no disponible | safetensors y distribuciones del autor original | Apache 2.0 | Modelo multimodal general |
| unsloth/Qwen3.5-4B | 4,2 B | no disponible | safetensors | Apache 2.0 | Copia del base usada como referencia de entrenamiento |

Comparado con su modelo base, este ajuste intercambia capacidades generales por precision en una tarea muy estrecha, pero la informacion disponible no incluye una comparacion cuantitativa entre ambos ni evaluaciones del base en la tarea de lectura de tableros.

## Limitaciones y advertencias

- Alcance de dominio extremadamente estrecho: el modelo esta entrenado para tableros cuadrados de 6x6 generados por un renderizador concreto. No hay evidencia de que generalice a otros tamanos, a otros estilos de dibujo o a capturas de juegos reales.
- Sesgo de los datos de entrenamiento: las 8.000 imagenes se generaron con el renderizador del propio proyecto y ningun tablero proviene de capturas de juegos reales. En todos los ejemplos de entrenamiento los muros eran negros, mientras que el editor del proyecto los dibuja en rojo; el unico caso con muros rojos que se documenta funciono, pero el propio autor advierte que una imagen no demuestra consistencia.
- Riesgo de alucinacion en la lista de muros: la instruccion pide explicitamente reportar todos los muros visibles y no inventar ninguno, lo que indica que el modo de fallo esperado es precisamente anadir muros inexistentes u omitirlos. No hay tasas de error publicadas para cuantificar este riesgo.
- Dependencia de la instruccion literal: el prompt debe enviarse palabra por palabra, incluida la mencion a "Zip". Cambiar la redaccion puede degradar la salida, y no se documenta la robustez frente a variaciones.
- Configuracion de inferencia fijada: el proyecto usa temperatura 0, seed 42 y razonamiento desactivado. No se describe el comportamiento con otros valores.
- Solo ingles: el unico idioma declarado es `en`, y no hay datos sobre el comportamiento con instrucciones en castellano u otros idiomas.
- Imagen unica: no se documenta soporte multi-imagen ni conversaciones con varias imagenes.
- Sin capacidades de agente: no hay informacion sobre tool calling, planificacion multi-paso ni integracion en bucles agenticos.
- Despliegue sensible a la plantilla: usar la ruta directa de Ollama con `hf.co/...` no reproduce la configuracion validada; hay que mantener el `Modelfile` tal cual.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay informes independientes de uso, ni pruebas en produccion, ni evaluaciones de terceros.
- Latencia no apta para tiempo real exigente: 6,7 s por imagen en el caso documentado, con el modelo ya cargado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene conservar el fichero `LICENSE`, que se copia del modelo base, y revisar las condiciones que Qwen aplique a Qwen3.5-4B.
- Documentacion incompleta: el extracto de la model card disponible corta la descripcion del conjunto de datos, por lo que el desglose completo del entrenamiento (epocas, hiperparametros, datos de validacion) no esta disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hero0963/threadgrid-qwen35-4b-p4c-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Copia del base usada para el entrenamiento: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio del proyecto thread-the-grid: https://github.com/Hero0963/ml-workshop/tree/main/thread-the-grid
- Variantes de instruccion usadas en el entrenamiento: https://github.com/Hero0963/ml-workshop/blob/main/thread-the-grid/src/core/vl_models/prompt_variants.py
- Codigo del backend de inferencia (temperatura, seed, endpoint compatible con OpenAI): https://github.com/Hero0963/ml-workshop/blob/main/thread-the-grid/src/core/vl_models/backends.py
- Guia de colocacion de los pesos: https://github.com/Hero0963/ml-workshop/blob/main/thread-the-grid/ai-collab/model-weights.md
- Informe y artefactos del ejemplo resuelto: https://github.com/Hero0963/ml-workshop/tree/main/thread-the-grid/ai-collab/reports/artifacts/vlm-walkthrough
- Imagen de entrada del ejemplo: https://huggingface.co/Hero0963/threadgrid-qwen35-4b-p4c-gguf/resolve/main/examples/input-6x6-red-walls.png
- Imagen de la solucion del ejemplo: https://huggingface.co/Hero0963/threadgrid-qwen35-4b-p4c-gguf/resolve/main/examples/solution-6x6-red-walls.png
- Ollama: https://ollama.com
- PEFT (biblioteca usada para el adaptador LoRA): no se proporciona enlace en la informacion disponible

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; las unicas entradas obtenidas fueron paginas corporativas de Microsoft sin relacion con el contenido de esta ficha.

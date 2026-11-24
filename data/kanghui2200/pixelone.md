# KangHui2200/PixelOne

## Resumen

PixelOne es un modelo especializado en GUI grounding, es decir, la tarea de localizar un elemento concreto de una interfaz grafica a partir de una captura de pantalla en resolucion nativa y una instruccion en lenguaje natural, devolviendo las coordenadas del clic. Lo desarrolla el autor KangHui2200 y se publica bajo licencia MIT. El repositorio incluye dos checkpoints completos, PixelOne-Pro-4B y PixelOne-Pro-35B-A3B, ademas de un runtime de inferencia compartido.

La propuesta tecnica central es sustituir la busqueda espacial o la decodificacion secuencial de coordenadas por un unico forward: una sola codificacion visual y una sola pasada del modelo producen directamente el punto de clic. El entrenamiento utiliza supervision basada en busqueda espacial (teacher search), pero la inferencia no requiere ni busqueda ni teacher. Esto reduce la latencia a 0,323 s para el modelo de 4B y 0,431 s para el MoE de 35B-A3B en mediciones sobre H200 con batch size 1.

El modelo es relevante para el campo de computer-use agents, donde el grounding preciso y rapido es un cuello de botella habitual. La variante grande es un MoE con 35B parametros totales y 3B activos, mientras que la pequena es un modelo denso de 4B parametros. Ambas alcanzan precisiones medias del 80,62% y 83,77% respectivamente promediando cuatro benchmarks de grounding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion completa y capas de atencion lineal (flash-linear-attention); cabezas de decision y pixel entrenadas; runtime de inferencia directa con readout custom |
| Parametros totales | 4B (PixelOne-Pro-4B) y 35B (PixelOne-Pro-35B-A3B) |
| Parametros activos | 3B en PixelOne-Pro-35B-A3B (MoE); no aplica en PixelOne-Pro-4B (denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor indica particion BF16/FP32 y advierte de no convertir todo el modelo a FP16 o BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (con licencias y avisos upstream de VideoJEV/Qwen en cada directorio de modelo) |
| Formato de pesos | safetensors (pesos completos, shards de 5 GB objetivo; 3 shards para 4B, 16 para 35B-A3B) |

## Arquitectura y entrenamiento

PixelOne emplea un transformer hibrido: las capas de atencion completa existentes usan mascaras bidireccionales, mientras que las capas de atencion lineal conservan su computo nativo y el KV caching permanece desactivado. Sobre el backbone se anaden cabezas de decision y pixel entrenadas que realizan un readout directo del punto de clic, en lugar de generar coordenadas token a token. El modelo procesa la captura en resolucion nativa, lo que evita perdida de detalle espacial.

El entrenamiento parte de un estudiante entrenado con 22K objetivos Top20 mas destilacion de conocimiento (KD), y continua con actualizaciones de parametros completos sobre 500K objetivos, incluyendo el codificador visual. La supervision durante el entrenamiento proviene de busqueda espacial (teacher search), pero la inferencia prescinde de ella. Existe ademas una rama PixelOne de 200K que es independiente, no un paso intermedio del entrenamiento Pro. Los checkpoints publicados son los Pro finales en el paso 1.954. Los pesos se han reempaquetado sin perdida con shards de 5 GB, verificando nombre, forma, dtype y SHA256 a nivel de byte de cada tensor; las pruebas en CPU confirman que el runtime de inferencia reproduce exactamente logits, tokens seleccionados, predicciones de pixel y batches con padding respecto a la release anterior.

## Capacidades

- GUI grounding: predice un clic `[x, y]` en pixeles de la captura original a partir de una instruccion en ingles.
- Procesamiento de capturas en resolucion nativa sin reescalado previo.
- Inferencia en un unico forward, sin busqueda espacial ni decodificacion secuencial de coordenadas.
- Dos variantes con la misma API: densa de 4B y MoE de 35B-A3B.
- Runtime de inferencia compartido con API Python (`PixelOnePredictor`) y CLI (`pixelone infer`).
- Carga selectiva de subcarpetas: el loader descarga solo el manifiesto y ficheros del modelo elegido, no ambos.
- Soporte de uso offline descargando `runtime/*` y el directorio del modelo.
- No se documentan capacidades de generacion de texto general, tool calling, agentes multi-paso, vision mas alla del grounding, audio ni modo thinking.

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo localiza botones, campos y enlaces a partir de una captura y una instruccion, permitiendo generar acciones de clic en suites de test end-to-end sin selectores CSS ni accesibilidad.
- Agentes computer-use: integrado como modulo de grounding dentro de un bucle de agente que planifica y ejecuta acciones sobre escritorio o navegador; su latencia de 0,323-0,431 s por paso lo hace viable en bucles interactivos.
- Asistentes de accesibilidad: traducir instrucciones en lenguaje natural a coordenadas de clic para usuarios con dificultades motoras que operan mediante voz.
- RPA sobre aplicaciones legacy: automatizar flujos en aplicaciones sin API ni estructura DOM accesible, donde el unico anclaje es la imagen de pantalla.
- Grabacion y reproduccion de macros: convertir una demostracion grabada en instrucciones semanticas y resolver cada paso sobre la pantalla actual, tolerando cambios de resolucion o tema.
- Evaluacion de agentes GUI: usar el modelo como oraculo de grounding para medir la precision de otros agentes en benchmarks tipo ScreenSpot u OSWorld-G.
- Enrutado de clics en soporte remoto: dado un ticket de usuario y una captura, sugerir el elemento exacto sobre el que debe pulsar.

## Benchmarks y rendimiento

| Modelo | ScreenSpot | ScreenSpot V2 | ScreenSpot Pro | OSWorld-G | Precision media | Latencia media (H200, bs=1) |
|---|---:|---:|---:|---:|---:|---:|
| PixelOne-Pro-4B | 90,33 | 92,85 | 68,12 | 71,18 | 80,62% | 0,323 s |
| PixelOne-Pro-35B-A3B | 91,67 | 94,50 | 72,04 | 76,86 | 83,77% | 0,431 s |

La precision media promedia los cuatro benchmarks a partes iguales. La latencia procede de las mediciones del paper sobre H200 a batch size 1. El autor advierte que las barras del grafico teaser usan una escala truncada del 50 al 80%. No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, ni comparaciones directas con otros modelos de grounding.

## Requisitos de hardware

- VRAM: el peso ocupa 10,3 GB (4B) y 68,7 GB (35B-A3B), pero el autor advierte que la memoria total debe acomodar las activaciones dependientes de la resolucion; el tamano de pesos no es el uso total de memoria.
- GPU recomendadas: el paper mide latencia en H200. Para el 35B-A3B se requiere una GPU con suficiente memoria para pesos mas activaciones (A100 80 GB, H100 80 GB o H200). El 4B puede caber en GPUs de 24 GB como la RTX 4090 si las activaciones a resolucion nativa lo permiten, aunque no se proporcionan mediciones concretas.
- GPU de consumo: el 4B es el candidato; el 35B-A3B no cabe en GPUs de consumo de 24 GB con los pesos en BF16/FP32 tal como se distribuyen.
- Despliegue: runtime propio `pixelone` (API Python y CLI). Se instala con `pip` desde `runtime/` y requiere `flash-linear-attention==0.4.2` y `causal-conv1d==1.7.0`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; de hecho el autor prohibe usar `AutoModelForCausalLM.generate`.
- Entorno: Python 3.12 y PyTorch 2.11 con CUDA.
- Precision: mantener la particion BF16/FP32 del loader; no convertir todo el modelo a FP16 o BF16.
- Latencia: 0,323 s (4B) y 0,431 s (35B-A3B) en H200, batch size 1. No se publica throughput.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos de GUI grounding (parametros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. La model card solo compara internamente las dos variantes de PixelOne.

| Modelo | Parametros | Contexto | Precision media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PixelOne-Pro-4B | 4B (denso) | no disponible | 80,62% | MIT | Hugging Face |
| PixelOne-Pro-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | 83,77% | MIT | Hugging Face |
| Alternativas de grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan otros idiomas.
- Especializado exclusivamente en grounding: no es un modelo de chat ni de generacion de texto general, y no debe usarse con `generate`.
- No se documentan sesgos especificos, pero al entrenarse sobre capturas de interfaz puede heredar sesgos de los datasets de origen (tipos de UI, idiomas, culturas de diseno).
- Riesgo de alucinacion espacial: puede devolver coordenadas plausibles pero incorrectas en interfaces densas o con elementos visualmente similares; conviene validar con umbrales de confianza.
- El rendimiento cae notablemente en ScreenSpot Pro (68,12 y 72,04) frente a ScreenSpot V2 (92,85 y 94,50), lo que sugiere dificultad en escenarios mas complejos.
- El KV caching esta desactivado y las capas de atencion completa usan mascaras bidireccionales; esto limita el uso conversacional multi-turno.
- La particion BF16/FP32 debe respetarse; convertir el modelo entero a FP16 o BF16 puede degradar o romper la inferencia.
- El runtime de inferencia y el paquete de investigacion comparten nombre de paquete; deben instalarse en entornos separados.
- Los shards anteriores se retiraron permanentemente del historial del Hub; revisiones antiguas fijadas pueden no cargar. Fijar `--revision` y la `revision` del loader al mismo commit.
- La licencia MIT del repositorio convive con licencias y avisos upstream de VideoJEV/Qwen incluidos en cada directorio de modelo; revisar `UPSTREAM_LICENSE` y `UPSTREAM_NOTICE` antes de uso comercial.
- El entorno de empaquetado no tenia CUDA, por lo que la inferencia GPU a escala completa y la latencia en H200 no se volvieron a ejecutar tras el reempaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KangHui2200/PixelOne
- Subcarpeta PixelOne-Pro-4B: https://huggingface.co/KangHui2200/PixelOne/tree/main/PixelOne-Pro-4B
- Subcarpeta PixelOne-Pro-35B-A3B: https://huggingface.co/KangHui2200/PixelOne/tree/main/PixelOne-Pro-35B-A3B
- Codigo de investigacion (GitHub): https://github.com/tiankanghui/PixelOne
- Paper en arXiv: https://arxiv.org/abs/2611.30235

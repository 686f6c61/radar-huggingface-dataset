# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-120traj

## Resumen

RoboTalk-Qwen3-VL-8B-Instruct-120traj es un adaptador LoRA de una sola época entrenado sobre el modelo vision-language Qwen3-VL-8B-Instruct, publicado por el usuario DorianAtSchool. No es un modelo autonomo: el repositorio contiene unicamente los pesos del adaptador (0,2 GB en formato safetensors) y requiere cargar el modelo base junto con su procesador. Su proposito es predecir la siguiente llamada a herramienta (next tool call) en un entorno de robotica domestica simulado, donde una unica politica compartida controla dos agentes con contextos parcialmente observables.

El entrenamiento se realizo sobre 120 trayectorias por tarea y 43 tareas, lo que suma 5.160 trayectorias, dejando diez tareas adicionales fuera del entrenamiento para medir generalizacion. Los agentes siguen un protocolo coordinador-seguidor con historiales privados y observaciones visuales independientes, de modo que el modelo debe integrar informacion visual, estado simbolico y comunicacion entre agentes antes de emitir cada llamada.

Su relevancia actual es acotada pero especifica: sirve como referencia reproducible para investigar coordinacion de alto nivel y generacion de acciones con modelos vision-language en simuladores de robotica. Los resultados de evaluacion en bucle cerrado muestran una diferencia marcada entre tareas vistas (93,02 % de exito sin errores) y tareas reservadas (48,00 %), lo que convierte al adaptador en un caso de estudio util sobre sobreajuste a cohortes de tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (modelo base Qwen3-VL-8B-Instruct) con adaptador LoRA aplicado a las capas del modelo de lenguaje |
| Parametros totales | 8.000 millones en el modelo base; el adaptador usa rango LoRA 16 y alpha 32 (numero exacto de parametros entrenables no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | limite de secuencia de 8.192 tokens durante el entrenamiento, incluidos los tokens visuales; la ventana nativa del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible en la informacion del adaptador; dependen del modelo base que se utilice |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para el adaptador; el modelo base Qwen3-VL-8B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-VL-8B-Instruct, un transformer vision-language de 8.000 millones de parametros que acepta entrada de imagen y texto y produce texto. El ajuste se aplica mediante LoRA con rango 16, alpha 32 y dropout 0,05, y afecta exclusivamente a los pesos del modelo de lenguaje: el backbone de vision no se ha ajustado por separado. La carga se realiza con Transformers (soporte Qwen3-VL) y PEFT, usando la plantilla de chat del modelo para las llamadas a herramienta.

El entrenamiento consistio en una epoca sobre 120 trayectorias por tarea en 43 tareas (5.160 trayectorias en total), con tasa de aprendizaje 1e-4, weight decay 0,01, schedule coseno, 3 % de warmup, batch efectivo de 64 repartido en cuatro GPU y semilla 42. La secuencia maxima fue de 8.192 tokens incluyendo los tokens visuales. El objetivo de prediccion es la siguiente llamada a herramienta, en un esquema donde una sola politica compartida sirve a dos agentes con contextos parcialmente observables y un protocolo coordinador-seguidor. Los historiales no incluyen indices de paso. Los conjuntos de mayor escala contienen las selecciones de menor escala, y la pertenencia de tareas a cada cohorte esta documentada en `task_split.json`.

## Capacidades

- Prediccion de la siguiente llamada a herramienta (tool call) dentro de un flujo multi-paso, a partir de estado, objetivo, observaciones visuales e historial de comunicacion.
- Razonamiento visual: procesa observaciones de imagen por agente como parte de la decision de accion.
- Coordinacion multiagente: una unica politica compartida gestiona dos agentes con contextos parcialmente observables y un protocolo coordinador-seguidor.
- Mantenimiento de historiales privados por agente sin indices de paso explicitos.
- Interpretacion de definiciones globales de herramientas y de un protocolo de comunicacion completo.
- Modo de inferencia doble: la evaluacion Instruct usa temperatura 0 y un presupuesto de salida de 256 tokens; la evaluacion Thinking usa temperatura 0,6, top-p 0,95, top-k 20 y un presupuesto de 2.048 tokens.
- Capacidades multilingues: el adaptador declara unicamente ingles; no se documenta soporte de otros idiomas.

## Casos de uso

- Investigacion en coordinacion multiagente: el adaptador permite reproducir un escenario controlado de dos agentes con observabilidad parcial y medir como una politica compartida reparte tareas. Es adecuado porque el repositorio incluye `task_split.json` y `evaluation_results.json` con cohortes y recuentos exactos.
- Simulacion de robotica domestica: se emplea como politica de alto nivel que emite llamadas a herramientas dentro de un simulador de hogar, sin control directo de hardware. La naturaleza simbolica del objetivo (FSM) facilita comparar episodios de forma objetiva.
- Generacion de datos sinteticos de trayectorias: partiendo de estados iniciales y objetivos, el modelo puede producir secuencias de llamadas que despues se filtran por exito sin errores para ampliar el conjunto `DorianAtSchool/RoboTalk`.
- Prototipado de protocolos coordinador-seguidor: el adaptador sirve para validar variantes de protocolo de comunicacion (quien habla, cuando y con que contenido) midiendo su impacto en la tasa de exito.
- Evaluacion de generalizacion a tareas no vistas: con diez tareas reservadas, es posible cuantificar la caida de rendimiento entre cohortes y estudiar tecnicas de regularizacion o aumento de datos.
- Estudio de tool calling multimodal: el modelo permite analizar como influyen las observaciones visuales y el historial privado en la seleccion de la siguiente herramienta, comparando configuraciones de decodificacion (Instruct frente a Thinking).
- Docencia y divulgacion tecnica: el par modelo base mas adaptador, con solo 0,2 GB de pesos adicionales y una receta de entrenamiento documentada, es un ejemplo asequible para explicar LoRA en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica una evaluacion en bucle cerrado con comunicacion completa, diez episodios por tarea y muestreo fijo de las cohortes nativas 43/10. El criterio de exito es FSM sin errores, es decir, alcanzar el objetivo simbolico sin llamadas rechazadas.

| Particion | Exitos sin errores / episodios | Tasa de exito | Intervalo del 95 % |
|---|---:|---:|---:|
| in_training_tasks | 400/430 | 93,02 % | 90,22–95,07 % |
| held_out_tasks | 48/100 | 48,00 % | 38,46–57,68 % |

Los intervalos son intervalos de Wilson del 95 % sobre episodios, no sobre tareas remuestreadas. Los recuentos y la configuracion completa estan en `evaluation_results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: las cifras siguientes son estimaciones a partir del tamano del modelo base (8.000 millones de parametros) y no han sido publicadas por el autor. En bfloat16, aproximadamente 16 GB solo de pesos mas el codificador visual y la cache KV, lo que situa el consumo practico en torno a 20-24 GB.
- GPU recomendadas: A100 40 GB o H100 para bfloat16 con margen y lotes grandes; RTX 4090 o RTX 3090 (24 GB) para bfloat16 con una sola peticion y precaucion con la cache.
- Cabe en GPU de consumo: si, con cuantizacion. En 8 bits el consumo estimado baja a 10-12 GB (RTX 4080, RTX 3090) y en 4 bits a 6-8 GB (RTX 3060 12 GB, RTX 4070), aunque la cuantizacion debe aplicarse sobre el modelo base.
- Opciones de despliegue: Transformers con PEFT es la ruta documentada en la model card; vLLM admite LoRA sobre modelos soportados; llama.cpp u Ollama requieren convertir el modelo base a GGUF y fusionar o aplicar el adaptador, con soporte de vision irregular; TGI depende del soporte de Qwen3-VL en la version concreta.
- Latencia y throughput: no disponibles. La evaluacion usa lotes con temperatura 0 y presupuesto de 256 tokens en modo Instruct, y 2.048 tokens en modo Thinking, pero no se publican tiempos por token ni peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Instruct-120traj | 8.000 millones (base) mas adaptador LoRA | secuencia de entrenamiento de 8.192 tokens | 93,02 % en tareas vistas; 48,00 % en tareas reservadas (FSM sin errores) | no disponible para el adaptador | adaptador PEFT en HuggingFace |
| Qwen3-VL-8B-Instruct (modelo base sin adaptador) | 8.000 millones | no disponible en la informacion proporcionada | no disponible para la tarea RoboTalk | Apache-2.0 | modelo completo en HuggingFace |
| Otros adaptadores LoRA de robotica sobre modelos vision-language | no disponible | no disponible | no disponible | no disponible | no se han identificado alternativas comparables en la informacion proporcionada |

La busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente enlaces generales a Facebook), por lo que no ha sido posible localizar comparativas independientes ni adaptadores equivalentes entrenados sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- El adaptador esta pensado para investigacion sobre coordinacion de alto nivel en un simulador de hogar; no debe usarse para control directo de hardware ni en despliegues criticos para la seguridad.
- El exito FSM es una metrica simbolica: alcanzar el objetivo no implica necesariamente que se cumplan todos los criterios fisicos nativos de la tarea.
- Brecha de generalizacion muy acusada: 93,02 % en tareas vistas frente a 48,00 % en tareas reservadas, con intervalos de confianza que no se solapan. Cualquier uso fuera de la cohorte de entrenamiento debe validarse de nuevo.
- Reproducir las puntuaciones exige el objetivo de la tarea RoboTalk, el estado inicial, las definiciones globales de herramientas, las observaciones visuales por agente, los historiales privados y el protocolo de comunicacion completo. Un prompt de chat generico no basta.
- Los historiales no incluyen indices de paso, lo que condiciona el formato de entrada esperado.
- Solo se declara ingles como idioma soportado; no hay evidencia de comportamiento en castellano u otros idiomas.
- La licencia del adaptador no esta especificada: la model card no asigna licencia propia. La licencia Apache-2.0 corresponde al modelo base Qwen3-VL-8B-Instruct y deben consultarse sus terminos.
- Riesgo de alucinacion de llamadas a herramienta o de argumentos invalidos: el propio criterio de evaluacion penaliza las llamadas rechazadas, lo que indica que el modelo puede emitirlas.
- Sesgos conocidos: no documentados en la informacion disponible. Al proceder del modelo base Qwen3-VL, hereda los sesgos de sus datos de entrenamiento originales.
- El repositorio no incluye estados del optimizador ni rutas de la maquina de entrenamiento, por lo que no es posible reanudar el entrenamiento de forma identica.
- El modelo no ha sido ajustado en su backbone de vision, lo que limita la adaptacion a dominios visuales distintos de los del conjunto RoboTalk.
- Las descargas e interacciones registradas son cero, de modo que no existe validacion independiente por parte de terceros.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-120traj
- Conjunto de datos RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Ficheros de configuracion y evaluacion citados en la model card: `training_config.json`, `task_split.json`, `evaluation_results.json` (incluidos en el repositorio del adaptador)
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; las unicas entradas devueltas apuntan a paginas generales de Facebook y no guardan relacion con el modelo.

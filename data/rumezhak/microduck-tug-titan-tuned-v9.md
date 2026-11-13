# rumezhak/microduck-tug-titan-tuned-v9

## Resumen

`rumezhak/microduck-tug-titan-tuned-v9` es una entrada para la competicion "Tug of War" de la Microduck Arena, un entorno de simulacion de robots MicroDuck organizado por Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional: es una red neuronal pequena empaquetada en formato ONNX que controla el comportamiento de un robot simulado en un juego de tira y afloja (tug of war). El modelo lo publica el usuario rumezhak y deriva casi por completo del trabajo de terceros.

La red de confrontacion directa (head-to-head) es `azukiq/microduck-titan-v1` (revision `13b975bb`) con un unico cambio: 75 pequenos offsets anadidos a la media del normalizador de observaciones (hasta 0,337 desviaciones estandar por entrada) y al sesgo de la ultima capa (hasta 0,143). El resto de pesos son de azukiq. Las filas de rating, por su parte, proceden de secuencias grabadas de otros autores (lphatnguyen, jrubiosainz y greecree) replicadas sobre el grafo de `greecree/microduck-tug-of-war-tug-super-v8`.

Su relevancia es acotada: es una variante intermedia para la copa semanal numero 2 de la Microduck Arena (cierre el 13 de noviembre) y el propio autor advierte que todas sus variantes ajustadas estan dentro del ruido estadistico entre si. No debe confundirse con un modelo de IA generativa: es un controlador de politica para robotica simulada, sin capacidades de lenguaje, vision ni razonamiento simbolico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward (MLP) empaquetada como grafo ONNX para el runner de la Microduck Arena; incluye normalizador de observaciones, capas `mlp.*`, filas de lookup y tensores `L_mask` y `L_tol` |
| Parametros totales | no disponible (el autor solo detalla 75 offsets modificados; no publica el recuento total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre observaciones del simulador por paso de tiempo) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control roboticos, sin procesamiento de lenguaje) |
| Licencia | Sin licencia declarada en el repositorio. Las partes con Apache-2.0 conservan sus avisos en `LICENSE-apache-2.0.txt` y `NOTICE`; el repositorio en su conjunto no se etiqueta como Apache-2.0 |
| Formato de pesos | ONNX (libreria `microduck`) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal feed-forward (MLP) con un normalizador de observaciones de entrada, capas ocultas (`mlp.*`) y una capa de salida cuyo sesgo fue ajustado. El grafo ONNX incluye ademas filas de lookup para los cinco seeds oficiales de rating y tensores auxiliares (`L_mask`, `L_tol`). No hay atencion, ni mecanismo de contexto, ni componentes recurrentes documentados.

El entrenamiento no es un entrenamiento clasico de modelo fundacional: el autor aplico una busqueda CMA-ES focalizada en la generacion 19 para obtener los 75 offsets que se suman al normalizador y al sesgo de la ultima capa. El resto de pesos proviene de `azukiq/microduck-titan-v1`. Las filas de rating se construyen replicando secuencias de combates grabadas por otros autores a traves del layout de grafo de `greecree/microduck-tug-of-war-tug-super-v8`. No se documentan volumenes de datos, composicion de dataset ni tecnicas de RLHF/DPO, porque no aplican a este tipo de controlador.

## Capacidades

- Control de politica para el juego de tira y afloja en el simulador de la Microduck Arena (entorno MuJoCo).
- Toma de decisiones por paso de tiempo a partir de observaciones del simulador, sin procesamiento de lenguaje.
- Replica determinista de secuencias grabadas para los cinco seeds oficiales de rating (en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1).
- Sin soporte de tool calling, function calling ni agentes multi-paso.
- Sin capacidades multilingues, de vision, audio ni thinking mode.
- Sin modo de razonamiento simbolico ni generacion de texto.

## Casos de uso

- Participacion en la copa semanal de la Microduck Arena: la entrada esta pensada para competir en la copa numero 2, que cierra el 13 de noviembre, y aporta un rendimiento medio del 84,4 % sobre once rivales en la simulacion local del autor.
- Evaluacion comparativa de politicas de robotica simulada: sirve como referencia para medir el efecto de ajustes finos (offsets) sobre una red base en un entorno controlado, con resultados reproducibles en x86-64.
- Investigacion sobre optimizacion CMA-ES de controladores: el autor documenta la busqueda focalizada en la generacion 19 y los limites de los offsets aplicados, lo que permite reproducir el metodo.
- Benchmarking de robustez frente a rivales: la tabla de enfrentamientos contra once redes (quicksilver-cup-v5, titan-v1, tug-super-v11, h7p1b y otros siete) permite analizar el comportamiento frente a distintos oponentes.
- Estudio de reproducibilidad en simulacion: el autor detalla las versiones exactas de MuJoCo, onnxruntime y numpy necesarias para que las replicas sean deterministas, util para trabajos de validacion.
- Docencia y divulgacion sobre competiciones de robotica simulada: el modelo card explica con transparencia que partes son propias y cuales ajenas, lo que lo convierte en un ejemplo didactico de atribucion y licencias.

## Benchmarks y rendimiento

Resultados medidos por el autor en una copia local del runner de tug de la Arena, 60 combates por oponente (40 para titan-v1 sin ajustar), con lados intercambiados:

| Oponente | titan-v1 sin ajustar | `tuned-v7` | esta entrada (`tuned-v9`) |
|---|---|---|---|
| quicksilver-cup-v5 (Hlib) | 27,5 %* | 52,5 % | 59,2 % |
| titan-v1 (azukiq) | 45,0 %* | 70,0 % | 60,0 % |
| tug-of-war-tug-super-v11 (greecree) | 60,0 %* | 62,5 % | 60,8 % |
| h7p1b (jrubiosainz) | 38,8 %* | 58,3 % | 60,0 % |
| RSanchez996 | 97,5-100 %* | 95-100 % | 95,0 % |
| SSH111111 | 97,5-100 %* | 95-100 % | 95,0 % |
| AndoShy | 97,5-100 %* | 95-100 % | 99,2 % |
| Otros cuatro | 97,5-100 %* | 95-100 % | 98-100 % |
| Media sobre los once | 78,6 %* | 84,6 % | 84,4 % |

\* titan-v1 sin ajustar se midio con 40 combates por oponente (los primeros 40 de los mismos combates). El autor advierte que 60 combates por oponente es una muestra pequena (aproximadamente mas o menos 6 puntos por cifra) y que diferencias de dos puntos o menos deben tratarse como ruido. El rating fusionado es de 166,7017 cm, identico al de sus entradas `tug-league-v1` a `-v4`; esta entrada no aporta nada nuevo al tablero de rating.

## Requisitos de hardware

- Inferencia en CPU: el modelo se ejecuta en ONNX Runtime sobre x86-64; no requiere GPU.
- VRAM estimada: no aplica (modelo de control, sin pesos de gran tamano documentados; el repositorio ocupa 0,0 GB).
- GPU recomendadas: no aplica; el runner de la Arena esta pensado para CPU.
- Cabe en cualquier hardware consumer, incluidos portatiles y equipos de gama baja.
- Opciones de despliegue: ONNX Runtime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1 (versiones fijadas por la Arena para garantizar determinismo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, porque no son aplicables.
- Latencia y throughput: no disponibles. El autor solo indica que las replicas son deterministas en x86-64 con las versiones fijadas y que el redondeo de otra CPU podria romper alguna.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (media sobre 11) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v9` (esta entrada) | MLP ONNX para tug of war | no disponible | no aplica | 84,4 % | Sin licencia declarada; partes Apache-2.0 conservan avisos | Hugging Face, 0 descargas |
| `azukiq/microduck-titan-v1` | MLP ONNX base | no disponible | no aplica | 78,6 % (medido con 40 combates) | Sin licencia declarada | Hugging Face |
| `greecree/microduck-tug-of-war-tug-super-v8` | MLP ONNX (layout de grafo) | no disponible | no aplica | no disponible en la informacion | Sin licencia declarada | Hugging Face |
| `rumezhak/microduck-tug-titan-tuned-v7` | MLP ONNX (variante previa del mismo autor) | no disponible | no aplica | 84,6 % | Sin licencia declarada | Hugging Face |

Las diferencias entre `tuned-v7` y `tuned-v9` (84,6 % frente a 84,4 %) estan dentro del ruido segun el propio autor.

## Limitaciones y advertencias

- Solo valido en simulacion: el autor advierte explicitamente "Not for a real robot"; no debe cargarse en un MicroDuck fisico.
- Sin licencia declarada en el repositorio. Las partes de azukiq, greecree, lphatnguyen y jrubiosainz no se relicencian; Apache-2.0 solo cubre las partes que lo llevan. El uso comercial queda en un limbo legal.
- El autor no solicito permiso a azukiq, greecree, lphatnguyen ni jrubiosainz antes de publicar; si alguno objeta, la entrada sera retirada.
- La mayor parte del trabajo no es del autor: la red head-to-head es de azukiq y las filas de rating son de otros autores.
- Muestra pequena en los benchmarks (60 combates por oponente, 40 para titan-v1): diferencias de dos puntos o menos son ruido.
- Las filas de rating replican secuencias grabadas para los cinco seeds oficiales; el resto lo decide la red.
- Determinismo fragil: las replicas dependen de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64; otro CPU con redondeo distinto podria romperlas.
- Las mediciones del autor son de 8 combates por par: cifras aproximadas.
- Las filas de rating no se revalidaron en x86 para esta version (la maquina x86 del autor estaba apagada).
- Sin capacidades de lenguaje, vision ni razonamiento; no es un modelo de IA generativa.
- Sesgos y alucinacion: no aplican en el sentido habitual, pero el comportamiento esta sobreajustado a los oponentes concretos de la copa 2 y puede degradarse frente a redes no vistas.
- El autor reconoce que un asistente de IA ayudo en los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v9
- Modelo base (red head-to-head): https://huggingface.co/azukiq/microduck-titan-v1
- Layout de grafo base: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organizacion Pollen Robotics: https://huggingface.co/pollen-robotics
- Secuencia seed 1 (lphatnguyen): https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Secuencias seeds 2 y 5 (jrubiosainz): https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Perfil de Hlib (idea de offsets): https://huggingface.co/HlibPlakhtii

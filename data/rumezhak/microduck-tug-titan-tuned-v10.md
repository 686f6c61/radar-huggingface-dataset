# rumezhak/microduck-tug-titan-tuned-v10

## Resumen

`rumezhak/microduck-tug-titan-tuned-v10` es una entrada de competicion para el modo **Tug of War** de la [Microduck Arena](https://huggingface.co/spaces/pollen-robotics/microduck-arena), un entorno de simulacion de robots MicroDuck organizado por Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional: es una red neuronal de control (policy network) empaquetada en formato ONNX que decide las acciones de un robot simulado en un enfrentamiento de tiro de cuerda contra otra politica. El autor es `rumezhak`, que publica esta variante como entrada para la copa semanal numero 2 de la arena, cerrada el 13 de noviembre.

Tecnicamente, la red de combate es casi integramente obra de terceros: se trata de `azukiq/microduck-titan-v1` (revision `13b975bb`) con un unico cambio del autor, consistente en 75 pequenos offsets sumados a la media del normalizador de observaciones (hasta 0,322 desviaciones tipicas por entrada) y al sesgo de la ultima capa (hasta 0,136). El resto de pesos son de azukiq. Ademas, las filas de rating del grafo se toman de otras entradas publicas (lphatnguyen, jrubiosainz y greecree) y se reproducen sobre el layout de grafo de `greecree/microduck-tug-of-war-tug-super-v8`.

Su relevancia es acotada y muy especifica: sirve como referencia de como se optimizan politicas de control con busqueda CMA-ES sobre pesos de normalizacion en un benchmark de robotica simulado, y como ejemplo de las practicas de atribucion y licencias (o su ausencia) en el ecosistema de la Microduck Arena. El autor declara explicitamente que todas sus variantes ajustadas estan dentro del ruido estadistico entre si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de control en formato ONNX (layout de grafo de `greecree/microduck-tug-of-war-tug-super-v8`); capas `mlp.*` y normalizador de observaciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robotica, sin capacidades linguisticas) |
| Licencia | sin licencia declarada a nivel de repositorio; contiene partes con Apache-2.0 (`LICENSE-apache-2.0.txt` y `NOTICE`); los modelos base no declaran licencia |
| Formato de pesos | ONNX |
| Libreria | `microduck` |
| Pipeline | robotics |
| Tamano del repo | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-12 |

## Arquitectura y entrenamiento

La red es una politica de control para el simulador de la Microduck Arena, construida sobre el layout de grafo de `greecree/microduck-tug-of-war-tug-super-v8`. El componente que decide el comportamiento en combate es un perceptron multicapa (`mlp.*`) precedido de un normalizador de observaciones, y el grafo incluye ademas tensores auxiliares (`L_mask`, `L_tol`) y filas de lookup para el calculo del rating. El modelo base de la parte de combate es `azukiq/microduck-titan-v1`, y el autor solo modifica la media del normalizador y el sesgo de la ultima capa.

El ajuste se realizo mediante busqueda CMA-ES focalizada sobre 75 offsets: el autor promedia la media de esa busqueda con los offsets de su variante `tuned-v4` y los aplica al normalizador (maximo 0,322 desviaciones tipicas por entrada) y al sesgo final (maximo 0,136). No hay datos sobre volumen de entrenamiento, composicion del dataset ni uso de RLHF/DPO, porque no es un modelo de lenguaje. Las filas de rating se obtienen reproduciendo bouts grabados de otras entradas publicas para las cinco semillas oficiales, lo que hace que el rating sea deterministico en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.

## Capacidades

- Control de un robot MicroDuck simulado en la tarea de tiro de cuerda (Tug of War) de la Microduck Arena.
- Toma de decisiones por politica neuronal a partir de observaciones normalizadas del entorno simulado.
- Reproduccion determinista de bouts grabados para las cinco semillas oficiales de rating.
- Evaluacion comparativa contra otras politicas de la arena (quicksilver-cup-v5, titan-v1, tug-super-v11, h7p1b, etc.).
- No soporta generacion de texto, codigo, matematicas, vision, audio ni tool calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingues (no aplica).

## Casos de uso

- **Participacion en la copa semanal de la Microduck Arena**: la entrada esta pensada para concursar en el cup #2 (cierre el 13 de noviembre) del modo Tug of War, donde se mide el porcentaje de victorias contra las redes mas fuertes del campo.
- **Referencia de optimizacion de offsets sobre politicas existentes**: sirve para estudiar como una busqueda CMA-ES sobre la media del normalizador y el sesgo final puede mejorar el rendimiento de una politica base sin reentrenar el resto de pesos.
- **Banco de pruebas de evaluacion estadistica**: el autor publica una tabla con 60 bouts por oponente y advierte que la muestra es pequena (aproximadamente mas o menos 6 puntos por cifra), lo que lo convierte en un caso practico para discutir intervalos de confianza en benchmarks de robotica.
- **Auditoria de atribucion y licencias en modelos derivados**: el repositorio documenta explicitamente que partes son de terceros, que partes lleva Apache-2.0 y que modelos base no declaran licencia, util como ejemplo de cumplimiento en merges de modelos.
- **Reproducibilidad de entornos simulados**: el autor detalla versiones exactas de MuJoCo, onnxruntime y numpy, lo que permite reproducir los resultados en x86-64 y comprobar la sensibilidad al redondeo de CPU.
- **Estudio de layouts de grafo ONNX para robotica**: al reutilizar el layout de `greecree/microduck-tug-of-war-tug-super-v8`, el modelo sirve para analizar como se estructuran grafos de control con tensores auxiliares (`L_mask`, `L_tol`) y filas de lookup.

## Benchmarks y rendimiento

Resultados medidos por el autor en una copia local del runner de Tug of War de la Arena, con 60 bouts por oponente y los mismos bouts para cada columna (lados intercambiados):

| Oponente | titan-v1 sin ajustar | `tuned-v7` | esta entrada |
|---|---|---|---|
| `quicksilver-cup-v5` (Hlib) | 27,5 %* | 52,5 % | 63,3 % |
| `titan-v1` (azukiq) | 45,0 %* | 70,0 % | 63,3 % |
| `tug-of-war-tug-super-v11` (greecree) | 60,0 %* | 62,5 % | 60,8 % |
| `h7p1b` (jrubiosainz) | 38,8 %* | 58,3 % | 70,8 % |
| Los otros siete | 97,5 a 100 %* | 95 a 100 % | 97,5 % (RSanchez996), 95,0 % (SSH111111), 100,0 % (AndoShy), otros 98 a 100 % |
| Media sobre los once | 78,6 %* | 84,6 % | **86,2 %** |

\* `titan-v1` sin ajustar se midio con 40 bouts por oponente (los primeros 40 de los mismos bouts). El autor advierte que 60 bouts por oponente es una muestra pequena (aproximadamente mas o menos 6 puntos por cifra) y que diferencias de dos puntos o menos deben tratarse como ruido.

Rating: 166,7017 cm, identico a las entradas `tug-league-v1` a `-v4` del autor; esta version no anade nada a la tabla de rating. Las filas de rating no se rechequearon en x86 para esta version.

## Requisitos de hardware

- No se publican requisitos de VRAM ni de GPU; el modelo es una red de control ONNX de un repositorio de 0,0 GB, por lo que su huella es minima comparada con un LLM.
- La inferencia se ejecuta via onnxruntime (version fijada por el autor: 1.24.4) junto con numpy 2.4.1 y MuJoCo 3.10.0 para el simulador.
- El autor reporta ejecuciones en Mac y en x86-64; no se especifican GPU concretas (A100, H100, RTX 4090, etc.).
- Por el tamano del artefacto, es razonable esperar que quepa en cualquier GPU consumer e incluso en CPU, pero no hay datos publicados de latencia ni throughput.
- Opciones de despliegue: el runner de la Microduck Arena y el runtime `microduck` con onnxruntime; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (media sobre 11) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v10` (esta entrada) | Politica ONNX para Tug of War | no disponible | no aplica | 86,2 % | sin licencia declarada; partes Apache-2.0 | Hugging Face, 0 descargas |
| `azukiq/microduck-titan-v1` | Politica ONNX (base de combate) | no disponible | no aplica | 78,6 %* (medido por el autor) | sin licencia declarada | Hugging Face |
| `greecree/microduck-tug-of-war-tug-super-v8` / `-v11` | Politica ONNX (layout de grafo y oponente) | no disponible | no aplica | frente a esta entrada: 60,8 % de victorias de esta entrada | sin licencia declarada | Hugging Face |
| `Hlib/quicksilver-cup-v5` | Politica ONNX (oponente) | no disponible | no aplica | esta entrada gana 63,3 % de los bouts | no disponible | Hugging Face |

No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos en el sentido de modelos de lenguaje; el comportamiento esta limitado a la tarea de tiro de cuerda simulada.
- **Riesgo de alucinacion**: no aplica como tal, pero la politica puede fallar de forma impredecible frente a oponentes no vistos durante el ajuste.
- **Limitaciones de contexto o idioma**: no aplica; el modelo no procesa texto ni tiene ventana de contexto.
- **Restricciones de licencia**: el repositorio no declara licencia global. `azukiq/microduck-titan-v1`, `greecree/microduck-tug-of-war-tug-super-v8` y `lphatnguyen/microduck-tug-of-war-v0` no declaran licencia, y sus partes no se relicencian aqui. `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` tiene fichero `LICENSE` Apache-2.0 pero sin campo `license:`. Apache-2.0 aplica solo a las partes que la llevan (`LICENSE-apache-2.0.txt` y `NOTICE`). El autor no pidio permiso a azukiq, greecree, lphatnguyen ni jrubiosainz, y se compromete a retirar la entrada si alguno objeta.
- **Uso en robot real**: el autor indica explicitamente que no debe cargarse en un MicroDuck fisico; solo se ha evaluado en el simulador de la Arena.
- **Reproducibilidad fragil**: los replays son deterministas en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy, pero el redondeo de otra CPU podria romperlos. Las filas de rating no se rechequearon en x86 para esta version.
- **Muestra estadistica pequena**: 60 bouts por oponente implican aproximadamente mas o menos 6 puntos de error; el propio autor senala que todas sus variantes ajustadas estan dentro del ruido entre si.
- **Sin datos de parametros ni de entrenamiento**: no se publican numero de parametros, volumen de datos ni detalles del proceso de busqueda mas alla del CMA-ES descrito.
- **Asistencia de IA**: el autor declara que un asistente de IA ayudo con los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v10
- Modelo base de combate (azukiq): https://huggingface.co/azukiq/microduck-titan-v1
- Layout de grafo y bouts de semillas 3 y 4 (greecree): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Bouts de semillas 2 y 5 (jrubiosainz): https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Bout de semilla 1 (lphatnguyen): https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil de Hlib (autor de la idea de offsets y de `quicksilver-cup-v5`): https://huggingface.co/HlibPlakhtii

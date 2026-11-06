# rumezhak/microduck-tug-league-v1

## Resumen

`rumezhak/microduck-tug-league-v1` es un checkpoint intermedio de un agente de control para la prueba de "tug of war" (tira y afloja) del Microduck Arena, un entorno de simulación de robótica mantenido por Pollen Robotics. El modelo no es un modelo de lenguaje ni un transformer generativo: es una política de control (actor) representada como grafo ONNX, entrenada mediante PPO dentro de la física de la simulación del Arena, que decide las acciones de un robot MicroDuck simulado durante un combate de tira y afloja contra otro agente.

El autor, `rumezhak`, construye el modelo sobre la estructura de grafo de `greecree/microduck-tug-of-war-tug-super-v8` y combina dos componentes: por un lado, una red de confrontación directa (head-to-head) propia, correspondiente al checkpoint 530 de la ronda M813198 de su entrenamiento de liga; por otro, una tabla de búsqueda (lookup) reconstruida a partir de cinco secuencias de combate grabadas por otras entradas públicas, que cubren las cinco semillas oficiales de rating del Arena. El resultado es una entrada que replica combates de rating ya registrados y resuelve el resto de enfrentamientos con su propia red.

Su relevancia es acotada y muy específica: sirve como referencia de cómo se compone una entrada en el Microduck Arena mezclando trabajo de terceros (bouts grabados) con entrenamiento propio (red head-to-head), y documenta explícitamente las implicaciones de licencia de esa mezcla. No es un modelo de propósito general y el propio autor advierte que no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política actor MLP (normalizador + `mlp.*`) empaquetada como grafo ONNX, con tablas de búsqueda `L_obs`/`L_act` y operadores de grafo heredados de super-v8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones del simulador) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Sin licencia única declarada; Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt`, `NOTICE`); el repositorio en su conjunto no está etiquetado Apache-2.0 |
| Formato de pesos | ONNX (grafo con metadatos `modification_notice`) |

## Arquitectura y entrenamiento

La política es una red neuronal de tipo MLP (actor) que consume observaciones del simulador de tira y afloja y produce acciones de control del MicroDuck. Sobre la estructura de grafo ONNX de `greecree/microduck-tug-of-war-tug-super-v8`, el autor sustituye los pesos del actor (normalizador y capas `mlp.*`) por su propio checkpoint de liga y reconstruye las filas de búsqueda `L_obs` y `L_act` a partir de las cinco secuencias de combate fusionadas. Los operadores de grafo, `L_mask`, `L_tol` y el resto de tensores permanecen sin cambios respecto al modelo base, según la sección 4(b) de Apache-2.0 documentada en `NOTICE`.

El entrenamiento de la red head-to-head se realizó con PPO dentro de la física de tira y afloja del Arena, contra un pool formado por las redes simples de las entradas públicas, con ponderación hacia `juicenv/tug-anchor1`, la única entrada que había derrotado a las redes anteriores del autor. El checkpoint publicado corresponde a la ronda M813198, checkpoint 530. No se documentan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO, ya que no aplica a este tipo de modelo.

## Capacidades

- Control de un MicroDuck simulado en la prueba de tira y afloja del Microduck Arena.
- Reproducción determinista de los combates de rating de las cinco semillas oficiales mediante la tabla de búsqueda `L_obs`/`L_act`.
- Resolución de enfrentamientos no cubiertos por la búsqueda (todos los combates de copa) mediante la red head-to-head propia.
- Rendimiento reportado del 96,6 % de victorias de media contra el campo de copa de 23 participantes.
- Rendimiento reportado del 33 % (4 de 12) contra `juicenv/tug-anchor1`, frente al 4 % (1 de 24) de la red anterior del autor.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Evaluación de estrategias de control en el Microduck Arena: sirve como entrada de referencia para medir cómo rinde una red head-to-head entrenada con PPO frente al campo público de copa, con la ventaja de que el autor publica el desglose de victorias por oponente.
- Investigación sobre composición de entradas en competiciones simuladas: el modelo documenta de forma explícita qué partes son trabajo de terceros (bouts grabados) y qué partes son propias (red de liga), lo que permite estudiar el efecto de mezclar replay con política aprendida.
- Reproducción de combates de rating: la tabla de búsqueda permite replicar de forma determinista los cinco combates oficiales en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1, útil para validar pipelines de evaluación del Arena.
- Estudio de licencias en modelos derivados: el `NOTICE` y la sección de estado de licencia del repositorio sirven como caso práctico de cómo declarar una mezcla de componentes con licencias heterogéneas (Apache-2.0, sin licencia, sin campo `license:`).
- Punto de partida para entrenamiento de liga: al ser un checkpoint intermedio de una ronda en curso, puede usarse como referencia para comparar rondas posteriores del mismo autor o para inicializar políticas en la misma física de tira y afloja.
- Análisis de robustez frente a un oponente concreto: el contraste entre el 4 % de la red anterior y el 33 % de esta frente a `tug-anchor1` permite estudiar cómo el entrenamiento ponderado hacia un oponente difícil mejora el rendimiento específico.

## Benchmarks y rendimiento

Los únicos datos publicados son los del propio autor, medidos en su copia x86-64 del runner de tira y afloja del Arena, con semillas aleatorias, lados intercambiados y 12 combates por oponente. El propio autor advierte que 12 combates es una muestra pequeña y que los porcentajes son aproximados.

| Oponente | Combates ganados |
|---|---|
| Campo de copa de 23 participantes (media) | 96,6 % |
| `juicenv/tug-anchor1` | 33 % (4 de 12) |
| Oponente más débil distinto de `tug-anchor1` (`suraj-phanindra/hc3`) | 87,5 % |
| Red anterior del autor frente a `tug-anchor1` (referencia) | 4 % (1 de 24) |
| Rating fusionado en las cinco semillas oficiales | 166,7017 cm (frente a 166,7002 cm de greecree) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB y el modelo es un grafo ONNX de política de control, no un modelo de lenguaje; el requisito dominante es CPU y memoria del runtime ONNX, no VRAM.
- GPU recomendadas: no se documentan. La inferencia reportada se ejecutó en x86-64 con onnxruntime 1.24.4, sin mención de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: onnxruntime (versión fijada 1.24.4 en las pruebas del autor), junto con MuJoCo 3.10.0 y numpy 2.4.1 para el entorno de simulación. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles. El autor solo indica que los replays son deterministas en x86-64 con las versiones fijadas, y advierte que el redondeo de otra CPU podría romper alguno.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rumezhak/microduck-tug-league-v1` | Política ONNX para tug of war | no disponible | no aplica | 96,6 % vs campo de copa; 33 % vs `tug-anchor1` | Mixta (Apache-2.0 parcial) | Hugging Face, checkpoint intermedio |
| `greecree/microduck-tug-of-war-tug-super-v8` | Política ONNX para tug of war (modelo base) | no disponible | no aplica | Rating 166,7002 cm en las cinco semillas | Sin licencia declarada | Hugging Face |
| `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` | Política ONNX para tug of war (fuente de bouts) | no disponible | no aplica | no disponible en la información proporcionada | Apache-2.0 (archivo `LICENSE`, sin campo `license:`) | Hugging Face |
| `juicenv/tug-anchor1` | Política ONNX para tug of war (oponente de referencia) | no disponible | no aplica | 33 % de victorias para este modelo frente a él | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo simulación: el modelo fue evaluado únicamente en el simulador del Arena y el autor advierte explícitamente que no debe cargarse en un MicroDuck físico.
- Rating en muestra (in-sample): los combates de rating reproducen secuencias grabadas de las cinco semillas oficiales; la red head-to-head es la que decide todo lo demás, por lo que el rating fusionado no refleja rendimiento general.
- Determinismo frágil: los replays son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el redondeo de otra CPU podría romper alguno.
- Muestra pequeña: 12 combates por oponente, con porcentajes calificados como aproximados por el propio autor.
- Checkpoint intermedio: es una instantánea de una ronda de liga en curso y puede ser reemplazado por una entrada posterior.
- Licencia heterogénea y no unificada: `greecree/microduck-tug-of-war-tug-super-v8` y `lphatnguyen/microduck-tug-of-war-v0` no declaran licencia y sus partes no se relicencian aquí; Apache-2.0 se aplica solo a las partes que la portan. El repositorio en su conjunto no está etiquetado Apache-2.0, lo que limita su uso comercial sin aclaración previa.
- Falta de consentimiento de los autores upstream: el autor no consultó a greecree, jrubiosainz ni lphatnguyen antes de publicar, y se compromete a retirar la entrada si alguno presenta objeción.
- Cuerda floja heredada: el combate de la semilla 1 de greecree (y las entradas de las que se fusionó) usa una cuerda floja que el Arena acepta; el autor no la modificó.
- Sin datos de sesgo, alucinación o cobertura idiomática: no aplican a este tipo de modelo y no se documentan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-league-v1
- Modelo base: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Fuente de bouts (semilla 1): https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Fuente de bouts (semillas 2 y 5): https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Oponente de referencia: https://huggingface.co/juicenv/tug-anchor1
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics

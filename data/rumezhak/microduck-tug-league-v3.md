# rumezhak/microduck-tug-league-v3

## Resumen

`rumezhak/microduck-tug-league-v3` es un checkpoint intermedio presentado al concurso Tug of War de la Microduck Arena, una competición de simulación organizada por Pollen Robotics en torno al robot cuadrúpedo de bajo coste MicroDuck. No es un modelo de lenguaje ni un modelo fundacional: es una política de control (actor network) exportada en formato ONNX que decide las acciones de un agente en un entorno de física MuJoCo donde dos robots tiran de una cuerda. El repositorio se publica con la librería `microduck` y la etiqueta `robotics`.

El modelo es un *merge* de dos componentes diferenciados. Por un lado, las rondas de rating (las cinco semillas oficiales) se reutilizan de entradas públicas de otros participantes, replicadas sobre el grafo de `greecree/microduck-tug-of-war-tug-super-v8`. Por otro, la red cabeza a cabeza que resuelve todos los combates no cubiertos por la tabla de búsqueda es propia del autor: el checkpoint 535 de la ronda M697555 de su entrenamiento de liga con PPO contra el entorno de física de la Arena.

Su relevancia es acotada y muy específica: sirve como referencia de cómo se compone una entrada competitiva en la Microduck Arena combinando trabajo ajeno (rondas de rating) con entrenamiento propio (red de combate), y documenta explícitamente las implicaciones de licencia de hacerlo. El autor advierte de que no mejora a su entrada anterior `tug-league-v2` y de que no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red actor MLP (normalizador + capas `mlp.*`) exportada como grafo ONNX; política de control para el entorno de física de la Arena |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones del simulador) |
| Tipos de cuantizacion | no disponible (pesos ONNX en precisión nativa) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | Mixta: Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt` y `NOTICE`); el repositorio en conjunto no está etiquetado como Apache-2.0. Los componentes de `greecree` y `lphatnguyen` no declaran licencia |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

La política es una red neuronal tipo MLP que actúa como *actor* dentro del grafo ONNX heredado de `greecree/microduck-tug-of-war-tug-super-v8`. El grafo incluye, además del actor, una tabla de búsqueda (`lookup`) con las filas `L_obs` y `L_act` que reproducen secuencias grabadas para las cinco semillas oficiales del rating, junto con tensores auxiliares `L_mask` y `L_tol`. El autor reemplaza únicamente los pesos del actor (normalizador y `mlp.*`) y reconstruye `L_obs` y `L_act` a partir de las cinco secuencias de combate fusionadas; los operadores del grafo y el resto de tensores permanecen intactos, según lo documentado en el `NOTICE`.

El entrenamiento propio consiste en PPO sobre la física de tira y afloja de la Arena, enfrentado a un pool formado por las redes "planas" (sin tabla de búsqueda) de las entradas públicas. El checkpoint publicado corresponde a la iteración 535 de la ronda M697555 de una liga en curso. Las rondas de rating no son trabajo nuevo: la semilla 1 proviene de `lphatnguyen/microduck-tug-of-war-v0`, las semillas 2 y 5 de `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` y las semillas 3 y 4 del propio fichero de `greecree`. El rating fusionado resultante es de 166,7017 cm, idéntico al de `tug-league-v1` y `tug-league-v2`, por lo que esta entrada no aporta nada a la tabla de clasificación.

## Capacidades

- Control de un agente MicroDuck en el entorno simulado de tira y afloja de la Microduck Arena.
- Reproducción determinista de las cinco secuencias de rating oficiales mediante la tabla de búsqueda embebida.
- Generalización a combates no cubiertos por la tabla (todos los de copa) mediante la red actor entrenada con PPO.
- Inferencia en CPU x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 (versiones fijadas por la Arena).
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües, de visión o de audio: es una política de control, no un modelo generativo.

## Casos de uso

- Participación en la competición Tug of War de la Microduck Arena: la entrada está pensada exclusivamente para ser evaluada en el simulador de la Arena, donde la tabla de búsqueda cubre las semillas de rating y la red actor resuelve los combates de copa.
- Estudio de composición de entradas competitivas: sirve como ejemplo documentado de cómo combinar rondas de rating ajenas (replicadas sobre un grafo ajeno) con una red de combate propia, y de cómo declarar la autoría de cada parte.
- Referencia para entrenamiento con PPO en entornos de física de contacto: el checkpoint y la receta (liga contra un pool de políticas públicas) son reproducibles y útiles para quien quiera iterar sobre el recetario de entrenamiento de Pollen Robotics.
- Análisis de linaje y atribución de licencias: el `NOTICE` y la sección de estado de licencia documentan un caso real de merge multi-autor con licencias heterogéneas, útil como plantilla de cumplimiento de la sección 4(b) de Apache-2.0.
- Evaluación comparativa de políticas en simulación: permite medir, con el runner x86-64 del autor, el rendimiento relativo frente a entradas como `tug-competitive-v2`, `tug-anchor1` o `tug-of-war-tug-super-v9`.
- Reproducción de experimentos de determinismo numérico: el autor advierte de que las repeticiones son deterministas solo en x86-64 con las versiones fijadas, lo que convierte al modelo en un caso de prueba para estudiar sensibilidad al redondeo entre CPUs.

## Benchmarks y rendimiento

Resultados de la simulación de copa del propio autor (runner x86-64, semillas aleatorias, lados intercambiados, 20 partidos al mejor de 2 combates por oponente):

| Oponente | Partidos ganados |
|---|---|
| Las otras 25 entradas de copa descargables, en conjunto | 430 de 500 (86 %) |
| `RSanchez996/tug-competitive-v2` | 10 de 20 |
| `juicenv/tug-anchor1` | 1 de 20 |
| `greecree/tug-of-war-tug-super-v9` | 0 de 20 |
| `HlibPlakhtii/quicksilver-tug-v16` (misma red que v9) | 0 de 20 |
| `suraj-phanindra/hc3` (el siguiente más débil) | 19 de 20 |

El autor estima una probabilidad de ganar la copa semanal de aproximadamente el 23 %, prácticamente idéntica a la de su entrada anterior `tug-league-v2`. Advierte de que 20 partidos por oponente es una muestra modesta y que las cifras deben tratarse como aproximadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU x86-64; no se documenta uso de GPU.
- Entorno de ejecución fijado por la Arena: MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- VRAM estimada: no aplica (ejecución en CPU).
- GPU recomendadas: no disponible; el modelo no requiere GPU.
- Cabe en cualquier CPU de consumo; el tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un artefacto muy ligero.
- Opciones de despliegue: el runner de la Microduck Arena o una copia propia del mismo con las versiones de dependencias fijadas; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Rating fusionado | Red de combate | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-tug-league-v3` | Merge de rondas ajenas + PPO propio (checkpoint 535) | 166,7017 cm (idéntico a v1 y v2) | Propia, ~23 % de ganar copa | Mixta; repo no etiquetado Apache-2.0 | Público en HF |
| `greecree/microduck-tug-of-war-tug-super-v8` | Grafo base con actor y tabla de búsqueda | No disponible | No disponible | Sin licencia declarada | Público en HF |
| `greecree/microduck-tug-of-war-tug-super-v9` | Entrada de referencia del autor de v8 | No disponible | No disponible (vence 20-0 a esta entrada) | No disponible | Público en HF |
| `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` | Entrada con rondas de rating (semillas 2 y 5) | No disponible | No disponible | Fichero `LICENSE` Apache-2.0 sin campo `license:` | Público en HF |
| `juicenv/tug-anchor1` | Oponente de entrenamiento | No disponible | No disponible (vence 19-1 a esta entrada) | No disponible | Público en HF |

## Limitaciones y advertencias

- Solo para simulación: el autor prohíbe explícitamente cargarlo en un MicroDuck físico.
- Rating en muestra (*in-sample*): las rondas de rating reproducen secuencias grabadas para las cinco semillas oficiales; solo la red de combate decide el resto.
- No mejora a `tug-league-v2`: misma probabilidad estimada de ganar la copa (~23 %) y mismo rating fusionado (166,7017 cm), por lo que no aporta a la tabla de clasificación.
- Determinismo frágil: las repeticiones solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el redondeo de otra CPU puede romperlas.
- Cadena de licencias incompleta: `greecree/microduck-tug-of-war-tug-super-v8` y `lphatnguyen/microduck-tug-of-war-v0` no declaran licencia y sus partes no se relicencian aquí; Apache-2.0 cubre solo los componentes que la portan. El repositorio en conjunto no está etiquetado Apache-2.0.
- Falta de consentimiento previo: el autor no consultó a `greecree`, `jrubiosainz` ni `lphatnguyen` antes de publicar, y se compromete a retirar la entrada si alguno objeta.
- Cadena de strings laxa: la ronda de la semilla 1 de `greecree` (y las entradas de las que se fusionó) usa una cadena que la Arena acepta; el autor no la modificó.
- Checkpoint intermedio: la liga sigue en curso y una entrada posterior puede reemplazar a esta antes del cierre de la copa.
- Muestra estadística pequeña: 20 partidos por oponente; los porcentajes de victoria son aproximados.
- Sin datos de sesgo, alucinación o multilingüismo aplicables: no es un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-league-v3
- Modelo base (grafo y rondas 3 y 4): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Entrada de referencia v9 de greecree: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v9
- Ronda de la semilla 1: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Rondas de las semillas 2 y 5: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Oponente de entrenamiento `tug-anchor1`: https://huggingface.co/juicenv/tug-anchor1
- Oponente `tug-competitive-v2`: https://huggingface.co/RSanchez996/tug-competitive-v2
- Oponente `quicksilver-tug-v16`: https://huggingface.co/HlibPlakhtii/quicksilver-tug-v16
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics

# rumezhak/microduck-tug-league-v2

## Resumen

`rumezhak/microduck-tug-league-v2` es una entrada para la competición Tug of War de la Microduck Arena, un entorno de simulación de robots cuadrúpedos MicroDuck organizado por Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador de política (policy) para una tarea de forcejeo (tug of war) entre robots simulados, empaquetado como un grafo ONNX con capas de lookup y una red neuronal de actor.

El modelo es un merge de dos componentes de procedencia distinta. Por un lado, las rondas de rating (los cinco seeds oficiales) son reproducciones de bouts grabados por otras entradas públicas, reinyectadas en el grafo de `greecree/microduck-tug-of-war-tug-super-v8`. Por otro, la red head-to-head que decide todos los bouts no cubiertos por el lookup es propia del autor: el checkpoint 530 de la ronda M696762 de su entrenamiento de liga con PPO contra el pool de redes públicas.

Es relevante únicamente en el contexto de la Microduck Arena: es un checkpoint intermedio de una liga en curso, no una entrada final, y el propio autor advierte que puede ser reemplazado antes del cierre de la copa. Su interés técnico está en la estrategia de merge (lookup determinista + red aprendida) y en la documentación explícita de licencias y límites.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con red de actor (normaliser + `mlp.*`) y capas de lookup (`L_obs`, `L_act`, `L_mask`, `L_tol`) sobre el layout de `greecree/microduck-tug-of-war-tug-super-v8` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (controlador de robótica, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (formato ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Sin licencia declarada a nivel de repositorio; Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt`, `NOTICE`) |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

El modelo hereda el layout de grafo de `greecree/microduck-tug-of-war-tug-super-v8`. Sobre ese grafo, el autor sustituye los pesos del actor (normaliser y capas `mlp.*`) por su propio checkpoint de liga y reconstruye las filas de lookup `L_obs` y `L_act` a partir de las cinco secuencias de bout fusionadas. Los operadores del grafo, `L_mask`, `L_tol` y el resto de tensores permanecen sin cambios. El mecanismo de lookup reproduce secuencias grabadas para los seeds oficiales; la red de actor decide el resto de bouts.

El entrenamiento de la red head-to-head se realizó con PPO en la física de tug de la Arena contra un pool formado por las redes planas de las entradas públicas. El checkpoint publicado corresponde a la ronda M696762, checkpoint 530. Las rondas de rating no son trabajo nuevo: son reproducciones de bouts de terceros (seed 1 de `lphatnguyen`, seeds 2 y 5 de `jrubiosainz`, seeds 3 y 4 de `greecree`), por lo que el rating fusionado de 166.7017 cm es idéntico al de la entrada anterior `tug-league-v1`. No se documentan volúmenes de datos, composición del dataset ni detalles de hiperparámetros más allá de lo indicado.

## Capacidades

- Control de política para la tarea de tug of war en el simulador de la Microduck Arena.
- Reproducción determinista de bouts grabados mediante lookup para los cinco seeds oficiales de rating.
- Generalización a bouts no cubiertos por el lookup mediante la red de actor entrenada con PPO.
- Inferencia en CPU x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 (versiones fijadas por la Arena).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión, audio ni modos de thinking.

## Casos de uso

- Participación en la competición Tug of War de la Microduck Arena: el modelo se sube como entrada y se evalúa contra el resto del campo en el simulador oficial.
- Estudio de estrategias de merge lookup + red aprendida: sirve como ejemplo documentado de cómo combinar secuencias deterministas con una política neuronal en un mismo grafo ONNX.
- Reproducción de experimentos de PPO en física de tug: el checkpoint permite inspeccionar el comportamiento de una política entrenada contra un pool de oponentes públicos.
- Benchmark de robustness frente a oponentes concretos: los resultados del autor (94 % contra el campo agregado, 1/30 contra `tug-anchor1`) permiten analizar debilidades específicas de la política.
- Base para iteraciones de liga: al ser un checkpoint intermedio, sirve como punto de partida para rondas posteriores del mismo entrenamiento.
- Docencia o divulgación sobre competiciones de robótica simulada: la model card detalla procedencia, licencias y límites, lo que la hace útil como caso de estudio de atribución y merge de pesos.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos en su copia x86-64 del runner de tug de la Arena, con seeds aleatorios, lados intercambiados y 30 partidos al mejor de 2 bouts por oponente:

| Oponente | Partidos ganados |
|---|---|
| Los otros 25 entries del campo descargables, en conjunto | 703 de 750 (94 %) |
| `RSanchez996/tug-competitive-v2` | 15 de 30 |
| `juicenv/tug-anchor1` | 1 de 30 (debilidad clara) |
| `betsyxw/tug-a3` (siguiente más débil) | 27 de 30 |
| `tug-league-v1` (entrada anterior) vs `RSanchez996` / vs `tug-anchor1` | 0 de 10 / 3 de 10 |

El autor advierte que 30 partidos por oponente es una muestra modesta y que las cifras deben tratarse como aproximadas.

## Requisitos de hardware

- Inferencia en CPU x86-64; no se documenta requisito de GPU.
- Entorno de ejecución fijado: MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1.
- Los replays son deterministas en x86-64 con esas versiones; otra CPU podría romper alguno por diferencias de redondeo.
- No se documentan latencia ni throughput.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplica: es un grafo ONNX de control, no un modelo de lenguaje).
- No debe cargarse en un MicroDuck físico.

## Comparativa con modelos similares

| Modelo | Tipo | Rating / rendimiento | Licencia | Notas |
|---|---|---|---|---|
| `rumezhak/microduck-tug-league-v2` | Merge lookup + PPO | Rating 166.7017 cm; 94 % vs campo agregado; 1/30 vs `tug-anchor1` | Sin licencia de repositorio; Apache-2.0 parcial | Checkpoint intermedio de liga |
| `rumezhak/tug-league-v1` | Entrada anterior del mismo autor | Rating 166.7017 cm; 0/10 vs `RSanchez996`; 3/10 vs `tug-anchor1` | no disponible | Sin red head-to-head de liga |
| `greecree/microduck-tug-of-war-tug-super-v8` | Grafo base | no disponible | Sin licencia declarada | Aporta layout y seeds 3 y 4 |
| `juicenv/tug-anchor1` | Oponente de referencia | 29/30 frente a este modelo | no disponible | Punto débil declarado del modelo |

## Limitaciones y advertencias

- Solo válido en simulación: no debe cargarse en un robot MicroDuck físico.
- El rating es in-sample: los bouts de rating reproducen secuencias grabadas para los cinco seeds oficiales; la red solo decide el resto.
- Los replays dependen de versiones exactas de MuJoCo, onnxruntime y numpy y de la CPU x86-64; otra plataforma puede romper la reproducibilidad.
- El bout del seed 1 de `greecree` (y las entradas de las que se fusionó) usa una string laxa que la Arena acepta; el autor no la modificó.
- Es un checkpoint intermedio: una entrada posterior puede reemplazarlo antes del cierre de la copa.
- Debilidad clara frente a `juicenv/tug-anchor1` (1 de 30 partidos ganados).
- Muestra de evaluación modesta (30 partidos por oponente); las cifras son aproximadas.
- Licencias: `greecree/microduck-tug-of-war-tug-super-v8` y `lphatnguyen/microduck-tug-of-war-v0` no declaran licencia y sus partes no se relicencian aquí; `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` tiene fichero Apache-2.0 pero sin campo `license:`. El repositorio en conjunto no está etiquetado como Apache-2.0.
- El autor no solicitó permiso a `greecree`, `jrubiosainz` ni `lphatnguyen`; se compromete a retirar la entrada si algún autor objeta.
- No es un modelo de lenguaje: no tiene capacidades de texto, código, matemáticas, visión ni tool calling, y no procede evaluarlo con MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-league-v2
- Modelo base: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Entrada anterior del autor: https://huggingface.co/rumezhak/tug-league-v1
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- `lphatnguyen/microduck-tug-of-war-v0`: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429`: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- `juicenv/tug-anchor1`: https://huggingface.co/juicenv
- `RSanchez996`: https://huggingface.co/RSanchez996
- Pollen Robotics: https://huggingface.co/pollen-robotics

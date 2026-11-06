# rumezhak/microduck-tug-league-v4

## Resumen

`rumezhak/microduck-tug-league-v4` es un checkpoint intermedio de una política de control para el simulador de robótica Microduck Arena, concretamente para la modalidad Tug of War (tira y afloja). Lo publica el usuario rumezhak como entrada para la competición semanal del espacio de Hugging Face gestionado por Pollen Robotics. No es un modelo de lenguaje: es una política de control exportada a ONNX que se ejecuta dentro del simulador MuJoCo de la Arena, con la librería `microduck` y un grafo heredado de `greecree/microduck-tug-of-war-tug-super-v8`.

El modelo combina dos componentes de naturaleza muy distinta. Por un lado, un mecanismo de lookup (`L_obs`, `L_act`) que reproduce de forma determinista secuencias de combate grabadas para las cinco semillas oficiales de rating, tomadas de entradas públicas de otros autores. Por otro, una red neuronal de política propia (actor con normalizador y capas `mlp.*`), entrenada con PPO contra un conjunto de políticas públicas, que decide los combates que el lookup no cubre, es decir, todos los de copa. Es relevante ahora porque documenta de forma transparente un caso de ingeniería de competición: mezcla de artefactos ajenos, atribución explícita y una mejora medida y modesta (23 % de victoria en copa frente al 20 % de su versión anterior).

La ficha refleja un artefacto experimental de nicho, sin métricas de benchmarks convencionales ni soporte multilingüe, y con una advertencia clara del autor: solo para simulación, nunca para un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control tipo MLP (actor con normalizador + capas `mlp.*`) sobre grafo ONNX heredado de super-v8, con lookup determinista de secuencias (`L_obs`, `L_act`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Sin licencia global declarada; Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt`, `NOTICE`); las partes de greecree y lphatnguyen no se relicencian |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

El artefacto es un grafo ONNX que hereda la estructura de `greecree/microduck-tug-of-war-tug-super-v8`. Respecto a ese grafo base, el autor sustituye los pesos del actor (normalizador y capas `mlp.*`) por su propio checkpoint de liga y reconstruye las filas de lookup `L_obs` y `L_act` a partir de cinco secuencias de combate fusionadas. Los operadores del grafo, `L_mask`, `L_tol` y el resto de tensores permanecen sin cambios. El metadata `modification_notice` del fichero registra la modificación conforme a la sección 4(b) de Apache-2.0.

El entrenamiento de la red head-to-head es propio del autor: PPO dentro de la física de tug de la Arena, contra un pool de redes planas de entradas públicas. El checkpoint publicado corresponde a la ronda M917342, checkpoint 575. No se documentan número de tokens, composición de dataset ni técnicas como RLHF/DPO, porque no aplican a este dominio; tampoco se detalla el tamaño de la red ni el presupuesto de entrenamiento.

Las secuencias de rating no son trabajo propio: para cada una de las cinco semillas se tomó el mejor combate válido registrado entre las entradas públicas y se reprodujo sobre el grafo de super-v8. La semilla 1 proviene de `lphatnguyen/microduck-tug-of-war-v0`; las semillas 2 y 5, de `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429`; las semillas 3 y 4, del propio fichero de greecree. El rating fusionado resultante es de 166,7017 cm, idéntico al de `tug-league-v1` a `-v3`, por lo que esta entrada no aporta nada nuevo al marcador de rating.

## Capacidades

- Control de política para la modalidad Tug of War del simulador Microduck Arena, ejecutada mediante la librería `microduck` y ONNX Runtime.
- Reproducción determinista de combates de rating para las cinco semillas oficiales mediante lookup de secuencias grabadas.
- Juego de combates de copa mediante la red de política propia (checkpoint 575 de la ronda M917342).
- Comportamiento de tira y afloja entrenado con PPO contra un pool de políticas públicas, incluida `juicenv/tug-anchor1`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües: no procesa lenguaje.
- No está pensado ni validado para ejecución en un robot MicroDuck físico.

## Casos de uso

- Participación en la copa semanal de Tug of War de Microduck Arena: la entrada está diseñada específicamente para competir en los combates de copa, donde la red head-to-head decide todos los enfrentamientos no cubiertos por el lookup.
- Evaluación comparativa de políticas de control en simulación: permite medir el rendimiento de una red PPO frente a las 25 entradas descargables del campo de copa, con resultados por oponente documentados por el autor.
- Investigación sobre ingeniería de competición y atribución: sirve como caso de estudio de fusión de artefactos ajenos con NOTICE, créditos y cláusula de retirada si algún autor objeta.
- Reproducción de combates de rating: el lookup permite replicar de forma determinista las secuencias de las cinco semillas oficiales en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- Desarrollo de políticas de locomoción y manipulación en Microduck: la librería `microduck` admite cargar políticas en slots como `walk`, `stand`, `sitstand`, `ground_pick`, `kick_left`, `kick_right` o `roulade`, aunque esta entrada concreta está orientada a tug.
- Estudio de robustez frente a oponentes: el perfil de la red (gana a `tug-anchor1` pero pierde más contra `RSanchez996`) es útil para analizar especialización y olvido en entrenamiento multi-oponente.

## Benchmarks y rendimiento

Resultados de la simulación de copa del autor (copia x86-64 del runner de la Arena, semillas aleatorias, lados intercambiados, 40 partidos al mejor de 2 por oponente):

| Oponente | Esta red | Red de `tug-league-v3` |
|---|---|---|
| Las otras 25 entradas descargables del campo, en conjunto | 873 de 1000 (87 %) | 847 de 1000 (85 %) |
| `juicenv/tug-anchor1` | 34 de 40 | 0 de 40 |
| `RSanchez996/tug-competitive-v2` | 6 de 40 | 13 de 40 |
| `greecree/tug-of-war-tug-super-v9` | 2 de 40 | 0 de 40 |
| `HlibPlakhtii/quicksilver-tug-v16` (misma red que v9 de greecree) | 1 de 40 | 1 de 40 |
| `suraj-phanindra/hc3` | 35 de 40 | 40 de 40 |
| `witcheer`, `littlebeanhp`, `almuli`, `AndoShy` | 40 de 40 cada uno | 40 de 40 cada uno |

Probabilidad estimada de ganar la copa semanal: aproximadamente 23 % para esta red, frente a aproximadamente 20 % para la red de `tug-league-v3`, sobre las mismas semillas. Una primera medición con otras semillas dio 27 % frente a 23 %. El propio autor califica la ganancia de modesta y ruidosa, y advierte que 40 partidos por oponente es una muestra pequeña.

## Requisitos de hardware

- Inferencia en CPU: el autor ejecuta los replays en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; no se documenta uso de GPU.
- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un artefacto muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no disponibles; no se reporta entrenamiento ni inferencia en GPU.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: librería `microduck` con ONNX Runtime dentro del simulador de la Arena; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Advertencia de hardware: los replays son deterministas en x86-64 con las versiones fijadas; otra CPU podría romper alguno por diferencias de redondeo.

## Comparativa con modelos similares

| Modelo | Tipo | Rating fusionado | Red head-to-head | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-tug-league-v4` | Política ONNX para tug | 166,7017 cm (idéntico a v1-v3) | Checkpoint 575, ronda M917342; ~23 % de victoria en copa | Sin licencia global; Apache-2.0 parcial | Pública en HF, 0 descargas, 0 likes |
| `rumezhak/microduck-tug-league-v3` | Política ONNX para tug | 166,7017 cm | Versión anterior; ~20 % de victoria en copa | Sin licencia global; Apache-2.0 parcial | Pública en HF |
| `greecree/microduck-tug-of-war-tug-super-v8` | Grafo base de política | No disponible | No disponible | Sin licencia declarada | Pública en HF |
| `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` | Política para tug | Aporta semillas 2 y 5 | No disponible | Fichero LICENSE Apache-2.0, sin campo `license:` | Pública en HF |

## Limitaciones y advertencias

- Solo para simulación: el autor prohíbe explícitamente cargarlo en un MicroDuck físico.
- Rating in-sample: los combates de rating reproducen secuencias grabadas para las cinco semillas oficiales; todo lo demás lo decide la red head-to-head.
- Determinismo frágil: los replays dependen de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64; otro hardware podría romper alguno por redondeo.
- Cadena de strings laxa: el combate de la semilla 1 de greecree (y las entradas de las que se fusionó) usa un string laxo que la Arena acepta y que el autor no modificó.
- Checkpoint intermedio: la ejecución de la liga continúa y una entrada posterior puede reemplazar esta antes del cierre de la copa.
- Muestra pequeña: 40 partidos por oponente; el propio autor pide tratar los números como aproximados.
- Licencia ambigua: el repositorio en conjunto no está etiquetado como Apache-2.0; las partes de greecree y lphatnguyen no declaran licencia y no se relicencian. Uso comercial no garantizado.
- Consentimiento no verificado: el autor no consultó a greecree, jrubiosainz ni lphatnguyen antes de publicar; se compromete a retirar la entrada si alguno objeta.
- Sin datos de sesgos ni alucinación: no aplica al no ser un modelo generativo de texto, pero tampoco se documentan sesgos de política ni comportamiento fuera de distribución.
- Sin benchmarks estándar (MMLU, HumanEval, GSM8K): no aplican a este dominio y no se han publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-league-v4
- Entrada anterior: https://huggingface.co/rumezhak/microduck-tug-league-v1
- Otra entrada del mismo autor: https://huggingface.co/rumezhak/microduck-tug-remix-leader4
- Modelo base: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
- Oponente `juicenv/tug-anchor1`: https://huggingface.co/juicenv
- Oponente `RSanchez996/tug-competitive-v2`: https://huggingface.co/RSanchez996
- Oponente `HlibPlakhtii/quicksilver-tug-v16`: https://huggingface.co/HlibPlakhtii
- Fuente de la semilla 1: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Fuente de las semillas 2 y 5: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429

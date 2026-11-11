# rumezhak/microduck-tug-titan-tuned-v6

## Resumen

`rumezhak/microduck-tug-titan-tuned-v6` es una entrada derivada para la competición "Tug of War" de la Microduck Arena, un entorno de simulación de robótica organizado por Pollen Robotics en torno al robot MicroDuck. No se trata de un modelo de lenguaje ni de un modelo fundacional al uso: es una red neuronal pequeña empaquetada en formato ONNX que controla el comportamiento de un agente en un simulador de forcejeo (tug of war) entre robots.

El modelo parte de la red head-to-head de `azukiq/microduck-titan-v1` (revisión `13b975bb`) y le aplica un único cambio: 75 offsets pequeños obtenidos promediando dos snapshots de búsquedas CMA-ES del propio autor (las que dieron lugar a sus entradas `tug-titan-tuned-v2` y `tug-titan-tuned-v3`). Estos offsets se suman a la media del normalizador de observaciones (como máximo 0,289 desviaciones estándar por entrada) y al bias de la última capa (como máximo 0,126). El resto de pesos pertenecen a azukiq.

La relevancia es acotada y muy específica: se trata de un snapshot intermedio para la copa semanal de la Microduck Arena que cerraba el 13 de noviembre, publicado con fines de competición y experimentación en simulación. El propio autor advierte explícitamente de que no es mejor que sus entradas anteriores (`tuned-v4` mide mejor) y de que no debe cargarse en un robot físico. La información disponible sobre arquitectura interna, datos de entrenamiento y capacidades generales es muy limitada porque el modelo card se centra en los resultados de la competición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward empaquetada como grafo ONNX (layout de `greecree/microduck-tug-of-war-tug-super-v8`); incluye normalizador de observaciones, capas `mlp.*`, filas de lookup y tensores `L_mask`/`L_tol` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | Sin licencia global declarada; Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt` y `NOTICE`); el repositorio en su conjunto no se etiqueta como Apache-2.0 |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la red head-to-head de `azukiq/microduck-titan-v1`, una red neuronal de control para el simulador de tug of war de la Microduck Arena. El autor no describe la topología interna más allá de mencionar el normalizador de observaciones, las capas `mlp.*`, las filas de lookup y los tensores `L_mask` y `L_tol` del grafo ONNX, que se mantienen sin cambios respecto a su entrada `tug-league-v4`. Los operadores del grafo, las filas de lookup y los tensores auxiliares no se modifican.

El "entrenamiento" en este caso es una optimización de offsets mediante CMA-ES sobre la red base. El autor promedió dos snapshots de sus búsquedas CMA-ES previas (las de `tuned-v2` y `tuned-v3`) y aplicó los 75 offsets resultantes a la media del normalizador y al bias de la última capa. No hay información sobre datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, porque no se trata de un modelo de lenguaje. La idea de ajustar offsets sobre titan-v1 se atribuye a Hlib, cuyo `quicksilver-cup-v5` incorpora tensores `cup_bias_*`.

## Capacidades

- Control de agente en el simulador de tug of war de la Microduck Arena (forcejeo entre robots simulados).
- Inferencia determinista en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 (según las condiciones fijadas por la Arena).
- Reproducción de secuencias grabadas para las cinco semillas oficiales de rating mediante las filas de lookup.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No dispone de capacidades multilingües (no es un modelo de lenguaje).
- No está pensado para uso en robot físico, solo en simulación.

## Casos de uso

- Competición en la Microduck Arena: el modelo se presenta como entrada para la copa semanal de la categoría Tug of War, donde se enfrenta a las redes de otros participantes en bouts simulados.
- Evaluación comparativa de estrategias de control: sirve como referencia intermedia para medir la mejora de offsets CMA-ES sobre la red base titan-v1 (53,3 % frente a quicksilver-cup-v5, 55,8 % frente a titan-v1, 60,8 % frente a tug-super-v11, 63,3 % frente a h7p1b).
- Investigación en optimización de políticas de control: el enfoque de promediar snapshots de CMA-ES y aplicar offsets acotados al normalizador y al bias final es reproducible y documentado en el model card.
- Reproducción de experimentos en simulación: el autor detalla las versiones exactas de MuJoCo, onnxruntime y numpy para replicar los resultados en x86-64.
- Benchmarking de entradas derivadas: permite comparar el rendimiento de variantes (`tuned-v3`, `tuned-v4`, esta `v6`) sobre la misma red base y con los mismos oponentes.
- Estudio de linaje y atribución de pesos en modelos derivados: el repositorio documenta qué partes son de azukiq, greecree, jrubiosainz y lphatnguyen, útil como caso práctico de cumplimiento de la sección 4(b) de Apache-2.0.

## Benchmarks y rendimiento

Resultados publicados por el autor en el model card (60 bouts por oponente, mismos bouts para todas las columnas, lados intercambiados; `plain titan-v1` medido sobre 40 bouts):

| Oponente | plain titan-v1 | tuned-v3 | tuned-v4 | esta entrada (v6) |
|---|---|---|---|---|
| Hlib's `quicksilver-cup-v5` | 27,5 %* | 47,5 % | 72,5 % | 53,3 % |
| azukiq's `titan-v1` | 45,0 %* | 65,0 % | 65,8 % | 55,8 % |
| greecree's `tug-of-war-tug-super-v11` | 60,0 %* | 61,7 % | 62,5 % | 60,8 % |
| jrubiosainz's `h7p1b` | 38,8 %* | 65,8 % | 64,2 % | 63,3 % |
| Los otros siete | 97,5 a 100 %* | 97,5 a 100 % | 93 a 100 % | 97,5 a 100 % |
| Media sobre los once | 78,6 %* | 84,7 % | **86,6 %** | 84,2 % |

\* `plain titan-v1` medido sobre 40 bouts por oponente (los primeros 40 de los mismos bouts). El autor advierte de que 60 bouts por oponente es una muestra pequeña (aproximadamente ±6 puntos por cifra). El rating mergeado es de 166,7017 cm, idéntico a sus entradas `tug-league-v1` a `-v4`; esta entrada no aporta nada al ranking. Las filas de rating no se re-verificaron en x86 para esta versión.

## Requisitos de hardware

- VRAM estimada: no disponible (el modelo card no publica tamaño de pesos ni requisitos de memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1 en x86-64, según las condiciones fijadas por la Microduck Arena. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Nota del autor: los replays son deterministas en x86-64 con las versiones indicadas; otra CPU podría romper la reproducibilidad por diferencias de redondeo.

## Comparativa con modelos similares

| Modelo | Red base | Contexto | Rendimiento (media 11 oponentes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v6` (esta entrada) | titan-v1 + offsets CMA-ES | no aplica | 84,2 % | Sin licencia global; Apache-2.0 parcial | Hugging Face |
| `rumezhak/microduck-tug-titan-tuned-v4` | titan-v1 + offsets CMA-ES | no aplica | 86,6 % | Sin licencia global; Apache-2.0 parcial | Hugging Face |
| `azukiq/microduck-titan-v1` | red original | no aplica | 78,6 % (40 bouts) | Sin licencia declarada | Hugging Face |
| `greecree/microduck-tug-of-war-tug-super-v8` | layout de grafo reutilizado | no aplica | no disponible en esta ficha | Sin licencia declarada | Hugging Face |

## Limitaciones y advertencias

- El propio autor indica que esta entrada no es mejor que sus versiones anteriores: `tuned-v4` mide mejor (86,6 % frente a 84,2 % de media).
- Solo válida para simulación: el autor advierte explícitamente "Not for a real robot"; no debe cargarse en un MicroDuck físico.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; varias redes base (`azukiq/microduck-titan-v1`, `greecree/microduck-tug-of-war-tug-super-v8`, `lphatnguyen/microduck-tug-of-war-v0`) no declaran licencia y sus partes no se relicencian aquí. `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` tiene fichero Apache-2.0 pero sin campo `license:`.
- El autor no pidió permiso a azukiq, greecree, lphatnguyen ni jrubiosainz; se compromete a retirar la entrada si alguno objeta.
- Las filas de rating reproducen secuencias grabadas para las cinco semillas oficiales; el resto lo decide la red. Los replays son deterministas solo en x86-64 con las versiones exactas de MuJoCo, onnxruntime y numpy indicadas.
- Muestras pequeñas: 60 bouts por oponente implican un margen de aproximadamente ±6 puntos por cifra; 8 partidos por par en las mediciones del autor.
- Sin datos sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje.
- No se han publicado resultados de benchmarks fuera del contexto de la Microduck Arena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v6
- Red base (titan-v1): https://huggingface.co/azukiq/microduck-titan-v1
- Layout de grafo super-v8: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Entrada de la que proceden las semillas 2 y 5: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Entrada de la que procede la semilla 1: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil de Pollen Robotics: https://huggingface.co/pollen-robotics
- Perfil de Hlib (idea original de offsets): https://huggingface.co/HlibPlakhtii

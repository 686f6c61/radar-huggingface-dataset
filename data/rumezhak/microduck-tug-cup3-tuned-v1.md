# rumezhak/microduck-tug-cup3-tuned-v1

## Resumen

`rumezhak/microduck-tug-cup3-tuned-v1` es una entrada para la competición Tug of War de la Microduck Arena, un entorno de simulación de robótica organizado por Pollen Robotics. No es un modelo de lenguaje ni un transformer generativo: es una política de control (un actor MLP con normalizador de observaciones) empaquetada en formato ONNX y ejecutada por la librería `microduck`, pensada para que dos robots simulados se enfrenten en un pulso (tug of war). El autor, rumezhak, la presentó a la copa semanal número 3, que cerraba el 20 de noviembre.

El modelo es explícitamente derivado: la red de confrontación es la de `lphatnguyen/microduck-tug-of-war-v2`, en la copia que distribuye `jrubiosainz/microduck-tug-cup2l1-c23b073f`, y el único cambio propio del autor consiste en 75 pequeños offsets añadidos a la media del normalizador de observaciones (como máximo 0,101 desviaciones estándar por entrada) y al sesgo de la última capa (como máximo 0,054). El resto de pesos pertenece a la red original. Las filas de rating se toman de otras entradas públicas y se reproducen sobre el grafo de `greecree/microduck-tug-of-war-tug-super-v8`.

Su relevancia es acotada y muy específica: sirve como caso de estudio de ajuste fino superficial sobre políticas ajenas en un benchmark competitivo de robótica simulada, y como referencia de las prácticas de atribución y licencias en modelos derivados. El autor advierte de forma explícita que el modelo está pensado solo para el simulador y que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor MLP con normalizador de observaciones, exportado como grafo ONNX (librería `microduck`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control por pasos, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: Apache-2.0 solo para las partes que la portan (`LICENSE-apache-2.0.txt`, `NOTICE`); el repositorio en conjunto no se etiqueta como Apache-2.0. Las redes base de lphatnguyen, jrubiosainz y greecree no declaran licencia |
| Formato de pesos | ONNX (grafo con tensores `onnx::Div_24`, `mlp.*`, `L_mask`, `L_tol` y filas de lookup) |

## Arquitectura y entrenamiento

La política es una red neuronal pequeña (MLP) que consume observaciones normalizadas y produce acciones de control para el robot simulado. El grafo ONNX incluye un normalizador de observaciones, la MLP del actor y una serie de tensores auxiliares (`L_mask`, `L_tol`) junto con filas de lookup que reproducen secuencias de bouts grabados para las cinco semillas oficiales de rating. El autor indica que, respecto a su propia entrada `tug-titan-tuned-v10`, solo difieren los pesos del actor (normalizador, `onnx::Div_24` y `mlp.*`); los operadores del grafo, las filas de lookup y el resto de tensores son idénticos.

No hay información sobre el proceso de entrenamiento original de la red base (número de episodios, algoritmo de RL, composición del entorno). Lo que sí se documenta es el método de ajuste: búsqueda de offsets sobre la media del normalizador y el sesgo de la última capa, evaluada contra bouts con `cup2l1`, `tug-of-war-v2` y `titan-v2`, con semillas nuevas en cada generación. El autor reconoce que los resultados frente a esos tres oponentes son en parte in-sample. La idea de ajustar offsets sobre una red ajena la atribuye a HlibPlakhtii.

## Capacidades

- Control de política para el enfrentamiento Tug of War en el simulador de la Microduck Arena.
- Reproducción determinista de las secuencias de rating para las cinco semillas oficiales mediante las filas de lookup incluidas.
- Ejecución en CPU x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 (versiones fijadas por la Arena).
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- Sin capacidades de visión, audio ni modo thinking.

## Casos de uso

- Participación en la copa semanal de la Microduck Arena: la entrada está diseñada para la copa número 3 y se evalúa con el runner oficial de la Arena (microduck-arena 0.7.0).
- Estudio de ajuste fino superficial: permite analizar cómo 75 offsets de magnitud reducida (≤0,101 desviaciones estándar en el normalizador, ≤0,054 en el sesgo final) alteran la tasa de victoria de una política dada.
- Referencia de atribución y licencias en modelos derivados: el repositorio documenta con precisión qué partes son propias y cuáles ajenas, e incluye `NOTICE` conforme a la sección 4(b) de Apache-2.0.
- Banco de pruebas de robustez frente a oponentes concretos: los datos publicados identifican `juicenv/tug-anchor1` como el punto débil (35,8 % de victorias, con bouts que suelen agotar el límite de 45 s).
- Evaluación de reproducibilidad en simulación: útil para comprobar si la reproducibilidad determinista se mantiene en distintas CPUs, dado que el autor advierte que el redondeo de otra máquina podría romper una replay.
- Docencia o divulgación sobre competiciones de robótica simulada: ejemplo compacto de política ONNX, runner y sistema de rating en un mismo paquete.

## Benchmarks y rendimiento

Resultados medidos por el autor en x86-64 con el runner oficial de la Arena, lados intercambiados y semillas aleatorias. La columna de control corresponde a la red `cup2l1` sin offsets (60 bouts); la de esta entrada, a 120 bouts.

| Oponente | Control (cup2l1) | Esta entrada |
|---|---|---|
| jrubiosainz `cup2l1` | 48,3 % (contra sí misma) | 87,9 % |
| lphatnguyen `tug-of-war-v2` | 44,2 % | 90,4 % |
| greecree `tug-super-v11` | 93,3 % | 89,2 % |
| Hlib `quicksilver-cup-v5` | 93,3 % | 90,8 % |
| azukiq `titan-v2` | 84,2 % | 72,5 % |
| suraj `tug-hc6-aifund` | 96,7 % | 93,3 % |
| juicenv `tug-anchor1` | 16,7 % | 35,8 % |

Frente al campo completo a 17 de noviembre (32 entradas, 60 bouts cada una), la entrada gana el 91,2 % de sus bouts. Desglose: 80,8 % contra `cup-nov17-v7` de Hlib, 88,3 % contra `cup3-a74f-s3s4s5` de jrubiosainz, 92,5 % contra `tug-hc7-aifund` de suraj, 89,2 % contra `tug-of-war-v2` y `tug-super-v11`, 57,5 % contra `titan-v2`, 60,0 % contra `osmium-beta` de ctcheung, 68,3 % contra `tug` de SSH111111 y 29,2 % contra `tug-anchor1` de juicenv. El propio autor advierte que 60-120 bouts implican un margen de ±5 a 9 puntos y que el campo cambia a diario. El rating fusionado es de 166,7017 cm, idéntico al de sus entradas `tug-league-v1` a `-v4` y `tug-titan-tuned-v1` a `-v10`; esta entrada no aporta nada nuevo al tablero de rating.

## Requisitos de hardware

- Inferencia en CPU x86-64; el autor no documenta requisitos de GPU.
- Entorno de referencia: MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 (versiones fijadas por la Arena).
- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB.
- GPU recomendadas: no disponibles; no se ha validado en GPU.
- Despliegue: runner oficial de la Microduck Arena (microduck-arena 0.7.0); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; los bouts contra `tug-anchor1` suelen agotar el límite de 45 s.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Esta entrada | Derivado con offsets propios | no disponible | no aplica | 91,2 % de victorias en el campo del 17 nov | Mixta (Apache-2.0 parcial) |
| jrubiosainz `microduck-tug-cup2l1-c23b073f` | Red base copiada | no disponible | no aplica | 48,3 % contra sí misma (control) | Sin licencia declarada |
| lphatnguyen `microduck-tug-of-war-v2` | Red original | no disponible | no aplica | 44,2 % de victorias como control | Sin licencia declarada |
| greecree `microduck-tug-of-war-tug-super-v8` | Layout de grafo y bouts de rating | no disponible | no aplica | no disponible en la información | Sin licencia declarada |

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que no debe cargarse en un MicroDuck físico.
- Los resultados frente a `cup2l1`, `tug-of-war-v2` y `titan-v2` son en parte in-sample, porque los offsets se buscaron contra esos oponentes.
- Muestras pequeñas: 60-120 bouts por cifra implican un margen aproximado de ±5 a 9 puntos, y el campo de la Arena cambia a diario.
- Punto débil conocido: `juicenv/tug-anchor1` (29,2 % de victorias en el campo completo, 35,8 % en la comparativa directa), con bouts que suelen agotar los 45 s y decidirse por el marcador.
- La reproducibilidad determinista depende de x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy; el redondeo de otra CPU podría romper una replay.
- Las filas de rating reproducen secuencias grabadas de otros autores; el modelo no mejora el rating (166,7017 cm, idéntico a entradas previas del mismo autor).
- Licencia fragmentada: las redes base de lphatnguyen, jrubiosainz y greecree no declaran licencia y sus partes no se relicencian aquí; Apache-2.0 cubre solo las partes que la portan. El repositorio en conjunto no es Apache-2.0.
- El autor no solicitó permiso a lphatnguyen, jrubiosainz ni greecree; se compromete a retirar la entrada si alguno objeta.
- Sin datos sobre sesgos, alucinación o cobertura idiomática: no aplica a un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-cup3-tuned-v1
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Red base (lphatnguyen): https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
- Copia de la red (jrubiosainz): https://huggingface.co/jrubiosainz/microduck-tug-cup2l1-c23b073f
- Layout de grafo (greecree): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Bouts de rating semilla 1 (lphatnguyen): https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Bouts de rating semillas 2 y 5 (jrubiosainz): https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Idea de offsets (HlibPlakhtii): https://huggingface.co/HlibPlakhtii

# rumezhak/microduck-tug-titan-tuned-v7

## Resumen

`rumezhak/microduck-tug-titan-tuned-v7` es una entrada para la competicion Tug of War de la Microduck Arena, un espacio de evaluacion de politicas de control para el robot MicroDuck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo: es una red neuronal de control (actor MLP) exportada a ONNX que decide acciones en un simulador fisico de tira y afloja. El autor, rumezhak, lo publica como snapshot intermedio para la copa semanal que cierra el 13 de noviembre.

El modelo parte de la red head-to-head de `azukiq/microduck-titan-v1` (revision `13b975bb`) y le aplica un unico cambio: suma 75 offsets pequenos, calculados como media ponderada de los offsets de sus entradas anteriores (`tug-titan-tuned-v4` al 50 %, `-v5` y `-v6` al 25 % cada una), al vector de medias del normalizador de observaciones y al bias de la capa final. El resto de pesos son de azukiq. La estructura de grafo y las filas de rating provienen de `greecree/microduck-tug-of-war-tug-super-v8`.

Es relevante como ejemplo de practica de ajuste fino ligero sobre politicas de control en entornos simulados, y por su documentacion transparente sobre autoria, licencias y limites. El propio autor advierte que no supera a sus variantes anteriores y que no debe usarse en un robot fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de control (actor MLP) con normalizador de observaciones y capas `mlp.*`, exportada como grafo ONNX con layout de `greecree/super-v8` |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; los tensores modificados son 75 offsets y biases) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (pesos ONNX; sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Mixta: Apache-2.0 solo en las partes que la portan (`LICENSE-apache-2.0.txt` y `NOTICE`); el repositorio en su conjunto no esta etiquetado como Apache-2.0. Los modelos base `azukiq/microduck-titan-v1`, `greecree/microduck-tug-of-war-tug-super-v8` y `lphatnguyen/microduck-tug-of-war-v0` no declaran licencia |
| Formato de pesos | ONNX (libreria `microduck`) |

## Arquitectura y entrenamiento

La red es un actor MLP que recibe observaciones del simulador, las normaliza con un vector de medias y desviaciones, y produce acciones a traves de las capas `mlp.*`. El grafo incluye ademas filas de lookup para los cinco seeds de rating, `L_mask` y `L_tol`, que el autor hereda intactos de `greecree/super-v8`. No hay entrenamiento supervisado ni RL en esta version: el ajuste consiste en sumar 75 offsets precalculados al normalizador (maximo 0.306 desviaciones estandar por entrada) y al bias de la ultima capa (maximo 0.130). Cada offset es la media ponderada de los offsets de las variantes `tuned-v4`, `-v5` y `-v6` del propio autor.

La innovacion tecnica es minima y el autor la describe como tal: busqueda propia de offsets sobre una red ajena, con la idea original de Hlib Plakhtii (sus tensores `cup_bias_*` en `quicksilver-cup-v5`). Las filas de rating se obtienen replicando bouts grabados de otras entradas publicas a traves del grafo de super-v8: seed 1 de `lphatnguyen/tug-of-war-v0`, seeds 2 y 5 de `jrubiosainz/quicksilver-v14-h2`, y seeds 3 y 4 del propio greecree. El rating fusionado es de 166.7017 cm, identico al de `tug-league-v1` a `-v4`.

## Capacidades

- Control de politica en el simulador Tug of War de la Microduck Arena: genera acciones de tira y afloja a partir de observaciones del entorno.
- Replica determinista de bouts grabados para los cinco seeds oficiales de rating, siempre que se ejecute en x86-64 con las versiones fijadas por la Arena (MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1).
- Inferencia ONNX portable mediante la libreria `microduck`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.
- No incluye modo thinking ni decodificacion especulativa.

## Casos de uso

- Participacion en la copa semanal de la Microduck Arena: el modelo se envia como entrada para la competicion Tug of War y se evalua contra las demas redes del campo, exclusivamente en simulacion.
- Benchmarking de politicas de control: sirve como referencia para medir como afectan pequenos ajustes de offsets en el normalizador y el bias final al rendimiento en bouts simulados.
- Reproduccion de experimentos de ajuste fino ligero: el autor documenta el metodo (media ponderada de offsets de variantes previas) y permite replicar la busqueda sobre otros modelos base.
- Estudio de robustez de grafos ONNX: util para analizar la sensibilidad de los replays deterministas a diferencias de redondeo entre CPUs (el autor advierte que otra CPU podria romper un replay).
- Docencia sobre practicas de atribucion y licencias: el repositorio incluye `NOTICE`, seccion 4(b) de Apache-2.0 y avisos explicitos sobre partes sin licencia, lo que lo convierte en un caso de estudio de cumplimiento.
- Comparacion de variantes propias: permite contrastar `tuned-v3`, `-v4`, `-v5`, `-v6` y esta `-v7` en el mismo conjunto de bouts (60 por oponente, lados intercambiados) para decidir cual enviar a la copa.

## Benchmarks y rendimiento

Resultados medidos por el autor en una copia Mac del runner de la Arena, 60 bouts por oponente con los mismos bouts para cada columna y lados intercambiados. La red base sin ajustar se midio con 40 bouts por oponente (los primeros 40 de los mismos).

| Oponente | titan-v1 sin ajustar | `tuned-v3` | `tuned-v4` | esta entrada (`-v7`) |
|---|---|---|---|---|
| `quicksilver-cup-v5` (Hlib) | 27.5 %* | 47.5 % | 72.5 % | 52.5 % |
| `titan-v1` (azukiq) | 45.0 %* | 65.0 % | 65.8 % | 70.0 % |
| `tug-of-war-tug-super-v11` (greecree) | 60.0 %* | 61.7 % | 62.5 % | 62.5 % |
| `h7p1b` (jrubiosainz) | 38.8 %* | 65.8 % | 64.2 % | 58.3 % |
| Los otros siete | 97.5-100 %* | 97.5-100 % | 93-100 % | 97.5-100 % |
| Media sobre los once | 78.6 %* | 84.7 % | **86.6 %** | 84.6 % |

\* Medido con 40 bouts por oponente. El autor senala que 60 bouts por oponente es una muestra pequena (aproximadamente mas o menos 6 puntos por cifra) y que el 86.6 % de `tuned-v4` fue probablemente en parte suerte. El rating fusionado de esta entrada es 166.7017 cm, identico a `tug-league-v1` a `-v4`; no anade nada a la tabla de rating.

## Requisitos de hardware

- VRAM estimada: no disponible; el repo ocupa 0.0 GB y el modelo es una red MLP pequena, por lo que la inferencia cabe en CPU.
- GPU recomendadas: no aplica; el runner de la Arena y las mediciones del autor se ejecutan en CPU (Mac y x86-64).
- Cabe en cualquier consumer GPU y en CPU sin problemas de memoria; el cuello de botella es el simulador MuJoCo, no la red.
- Opciones de despliegue: onnxruntime 1.24.4 con la libreria `microduck` y el runner de la Microduck Arena; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles. El autor solo reporta determinismo de replays en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.

## Comparativa con modelos similares

| Modelo | Base | Ajuste | Media en 11 oponentes | Rating | Licencia |
|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v7` (esta entrada) | titan-v1 | Offsets ponderados v4/v5/v6 | 84.6 % | 166.7017 cm | Mixta, sin etiqueta global |
| `rumezhak/...-tuned-v4` | titan-v1 | Offsets propios | 86.6 % | 166.7017 cm | Mixta |
| `azukiq/microduck-titan-v1` | — | Sin ajuste | 78.6 % (40 bouts) | no disponible | Sin licencia declarada |
| `greecree/microduck-tug-of-war-tug-super-v8` | — | — | no disponible | no disponible | Sin licencia declarada |

Las cifras de `tuned-v4` y `titan-v1` proceden de la misma tabla del autor y no son directamente comparables entre si por el distinto numero de bouts (60 frente a 40).

## Limitaciones y advertencias

- Solo simulacion: el autor prohibe explicitamente cargarlo en un MicroDuck fisico ("Not for a real robot").
- No supera a variantes anteriores del propio autor; todas sus variantes ajustadas estan dentro del ruido entre si (84-87 %).
- Muestra pequena: 60 bouts por oponente implican aproximadamente mas o menos 6 puntos de error por cifra; las conclusiones sobre mejoras son fragiles.
- Determinismo condicionado: los replays solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otra CPU podria romper un replay por redondeo.
- Las filas de rating replican secuencias grabadas de otros autores; el resto de decisiones las toma la red.
- Licencia fragmentada: Apache-2.0 solo cubre las partes que la portan; los modelos base de azukiq, greecree y lphatnguyen no declaran licencia, y el repositorio en su conjunto no esta etiquetado como Apache-2.0. Uso comercial no garantizado.
- Riesgo de retirada: el autor no consulto a azukiq, greecree, lphatnguyen ni jrubiosainz; si alguno objeta, la entrada se retirara.
- Sin datos de sesgo, alucinacion o multilingue: no aplican a una politica de control, pero tampoco hay evaluacion de robustez fuera del simulador.
- El autor declara que un asistente de IA ayudo en los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v7
- Modelo base principal (azukiq): https://huggingface.co/azukiq/microduck-titan-v1
- Layout de grafo y bouts de seeds 3 y 4 (greecree): https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Bouts de seeds 2 y 5 (jrubiosainz): https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Bout de seed 1 (lphatnguyen): https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil de Hlib Plakhtii (idea original de offsets): https://huggingface.co/HlibPlakhtii

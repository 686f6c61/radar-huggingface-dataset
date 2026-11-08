# rumezhak/microduck-tug-titan-tuned-v1

## Resumen
`rumezhak/microduck-tug-titan-tuned-v1` es una política de control para robótica, no un modelo de lenguaje: se trata de una red neuronal de política ("policy network") que controla el robot cuadrúpedo MicroDuck dentro del simulador de la Microduck Arena, en la competición "Tug of War" (tira y afloja). La publica el usuario rumezhak como entrada para la copa semanal de dicha arena, y es explícitamente un resultado intermedio y de simulación.

El modelo no entrena una red desde cero: parte de la red de confrontación de `azukiq/microduck-titan-v1` (revisión `13b975bb`) y le añade 75 pequeños offsets encontrados mediante una búsqueda CMA-ES. Estos offsets se aplican a la media del normalizador de observaciones (como máximo 0,172 desviaciones típicas por entrada) y al sesgo de la última capa (como máximo 0,106). El resto de pesos son de azukiq.

La relevancia es acotada: es una entrada de competición con una mejora medida modesta (del 82,2 % al 85,1 % de victorias de media sobre diez rivales) y no está pensada para uso en un robot físico. Su interés técnico está en el método (ajuste fino de offsets sobre una política existente) y en la trazabilidad de licencias de un modelo derivado de varios autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico, exportada como grafo ONNX con normalizador de observaciones y capas `mlp.*`; layout de grafo heredado de `greecree/microduck-tug-of-war-tug-super-v8` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de observaciones del simulador) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, sin cuantización documentada) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | sin licencia global declarada; Apache-2.0 solo para las partes que la portan (`LICENSE-apache-2.0.txt` y `NOTICE`); los componentes de azukiq, greecree y lphatnguyen no declaran licencia |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento
La arquitectura es una política de control por red neuronal multicapa (MLP) con un normalizador de observaciones de entrada, empaquetada como grafo ONNX para su ejecución en el runner de la Arena. El grafo incluye operadores, filas de lookup, `L_mask` y `L_tol` heredados del layout de `greecree/microduck-tug-of-war-tug-super-v8`. No hay información sobre el número de parámetros ni sobre el diseño de capas más allá de la mención a `mlp.*`.

No hay entrenamiento desde cero ni datos de entrenamiento documentados en el sentido habitual. El autor aplica una búsqueda CMA-ES para encontrar 75 offsets que se suman a la media del normalizador de observaciones y al sesgo de la última capa de la red de `azukiq/microduck-titan-v1`; el resto de pesos permanece intacto. Respecto a su entrada anterior `tug-league-v4`, solo cambian los pesos del actor (normalizador y `mlp.*`); los operadores del grafo, las filas de lookup, `L_mask`, `L_tol` y el resto de tensores son idénticos.

## Capacidades
- Control de política para el juego de tira y afloja del MicroDuck en el simulador de la Microduck Arena.
- Toma de decisiones en tiempo real a partir de observaciones del simulador, con normalización de entradas.
- Replay determinista de secuencias grabadas para las cinco semillas oficiales de rating.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni capacidades de agente.
- No soporta capacidades multilingües ni modo "thinking".
- Rendimiento medido en bouts simulados contra otras políticas del certamen.

## Casos de uso
- Entrada en la copa semanal de la Microduck Arena: se usa como política de confrontación en la competición "Tug of War", sustituyendo a la entrada anterior del autor con una mejora medida de victorias.
- Evaluación comparativa de políticas rivales: sirve como referencia para medir el rendimiento de otras entradas de la arena contra una política de clase titan con offsets ajustados.
- Investigación sobre ajuste fino por búsqueda de offsets: el método CMA-ES aplicado a la media del normalizador y al sesgo final es replicable sobre otras políticas base para estudiar cuánto se puede mejorar una red con cambios mínimos.
- Reproducción de experimentos en simulación: el autor documenta que los replays son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1, lo que permite reproducir los resultados en el mismo entorno.
- Estudio de trazabilidad de licencias en modelos derivados: el repositorio incluye `NOTICE` y distingue qué partes llevan Apache-2.0, útil como caso práctico de cumplimiento en merges de modelos de terceros.
- Pruebas del runner de la Arena: sirve para validar el pipeline de carga de políticas ONNX en el entorno de simulación de Pollen Robotics antes de desplegar otras entradas.

## Benchmarks y rendimiento
Resultados medidos por el autor en su copia x86-64 del runner de la Arena, con 40 bouts por rival y lados intercambiados (el autor advierte de un ruido de aproximadamente ±8 puntos por cifra):

| Rival | Entrada anterior (titan-v1 sin offsets) | Esta entrada |
|---|---|---|
| `quicksilver-cup-v5` de Hlib (titan-v1 con offsets) | 43,8 % | 52,5 % |
| `titan-v1` de azukiq | 52,5 % | 57,5 % |
| `tug-of-war-tug-super-v11` de greecree | 42,5 % | 51,2 % |
| Los otros siete (AndoShy, RSanchez996, SSH111111, Unique007, jrubiosainz, juicenv, witcheer) | 92,5 % a 100 % | 95 % a 100 % |
| Media sobre los diez | 82,2 % | 85,1 % |

El rating fusionado es de 166,7017 cm, idéntico al de las entradas `tug-league-v1` a `-v4` del mismo autor: esta entrada no aporta nada nuevo al ranking de rating.

## Requisitos de hardware
- VRAM estimada: no disponible (el tamaño del repositorio es de 0,0 GB y no se documentan parámetros ni pesos en MB).
- GPU recomendadas: no disponible; el autor ejecuta sus mediciones en CPU x86-64, no en GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: mediante la librería `microduck` y el runner de la Microduck Arena, con onnxruntime 1.24.4, MuJoCo 3.10.0 y numpy 2.4.1 fijados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Base | Modificación | Media de victorias (medición del autor) | Licencia |
|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-tuned-v1` | `azukiq/microduck-titan-v1` | 75 offsets CMA-ES en normalizador y sesgo final | 85,1 % | sin licencia global; Apache-2.0 parcial |
| `HlibPlakhtii/quicksilver-cup-v5` | `azukiq/microduck-titan-v1` | tensores `cup_bias_*` | 52,5 % contra esta entrada | no disponible |
| `azukiq/microduck-titan-v1` | red original | ninguna | 57,5 % contra esta entrada | sin licencia declarada |
| `greecree/microduck-tug-of-war-tug-super-v11` | familia super | no disponible | 51,2 % contra esta entrada | sin licencia declarada |

## Limitaciones y advertencias
- Solo para simulación: el autor indica explícitamente que no debe cargarse en un MicroDuck físico.
- Muestras pequeñas: 40 bouts por rival implican un ruido de aproximadamente ±8 puntos; la mejora es consistente en las tres redes de clase titan, pero no está probada.
- Determinismo frágil: los replays solo son deterministas en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy; el redondeo de otra CPU podría romperlos.
- Las filas de rating reproducen secuencias grabadas de otros autores para las cinco semillas oficiales; no son resultado de la red.
- Autoría mayoritariamente ajena: la red de confrontación es de azukiq y las filas de rating provienen de lphatnguyen, jrubiosainz y greecree; el autor no pidió permiso a ninguno y ofrece retirar la entrada si alguno objeta.
- Licencias incompletas: `azukiq/microduck-titan-v1`, `greecree/microduck-tug-of-war-tug-super-v8` y `lphatnguyen/microduck-tug-of-war-v0` no declaran licencia; `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` tiene fichero Apache-2.0 pero sin campo `license:`. El repositorio en su conjunto no está etiquetado como Apache-2.0, lo que limita su uso comercial sin aclaración previa de los autores originales.
- Sin datos de sesgo, alucinación ni idioma por no ser un modelo de lenguaje.
- El autor declara que un asistente de IA ayudó en los experimentos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-tuned-v1
- Entrada anterior del autor: https://huggingface.co/rumezhak/microduck-tug-titan-derived
- Otra entrada del autor: https://huggingface.co/rumezhak/microduck-tug-league-v1
- Red base de azukiq: https://huggingface.co/azukiq/microduck-titan-v1
- Layout de grafo de greecree: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Entrada de lphatnguyen: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
- Entrada de jrubiosainz: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena

# rumezhak/microduck-sock-heist-composite-v14b

## Resumen

`microduck-sock-heist-composite-v14b` es una política de control para robótica simulada publicada por el usuario rumezhak en Hugging Face. Se trata de una reentrada sin cambios del modelo `microduck-sock-heist-composite-v14`, presentada como participación en la prueba de 6 metros "Sock Heist" de la Microduck Arena, un espacio de competición asociado al robot MicroDuck de Pollen Robotics. El modelo no es un LLM ni un modelo generativo de texto: es un grafo ONNX con una red de respaldo y tablas de búsqueda (lookup) que reproducen trayectorias de control precalculadas.

La relevancia es muy acotada: compite exclusivamente en un simulador, con un tiempo medio de 4,757 s sobre las cinco semillas oficiales, frente a 4,758 s de `sock-ca3-n19b`, 4,759 s de `gin-sock-c19` y 4,760 s de su predecesor `composite-v13`. Las diferencias entre los primeros puestos se miden en milisegundos e incluso en fracciones de tick de simulación (5 ms), lo que da una idea del carácter marginal de la mejora. No hay información sobre arquitectura de red neuronal más allá de que es un grafo ONNX con tablas de lookup; no se declaran parámetros, contexto ni idiomas.

El modelo hereda la estructura técnica de la línea `composite-v13`, que a su vez parte de trayectorias de otros autores (`lphatnguyen`, `HlibPlakhtii`, `jrubiosainz`, `a1rb4Ck`). La licencia es ambigua: solo las partes que llevan Apache-2.0 se declaran como tal, y el repositorio en su conjunto no está etiquetado con esa licencia. El autor advierte explícitamente de que no debe cargarse en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con red de respaldo y tablas de búsqueda (lookup) de observación y acción; no se detalla la topología interna |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (formato ONNX; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible como licencia única del repositorio; Apache-2.0 solo para las partes que la portan (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`); el resto de componentes no declara licencia |
| Formato de pesos | ONNX (grafo) con tablas `L_obs` y `L_act`; tamaño del repo 0,0 GB |

## Arquitectura y entrenamiento

La política se compone de un grafo ONNX, una red de respaldo (la red v3 de `lphatnguyen/microduck-sock-heist-6m-v3`) y un mecanismo de lookup que indexa observaciones y acciones. Las tablas `L_obs` y `L_act` contienen 1317 filas reconstruidas a partir de las cinco secuencias de la competición. Fuera de las cinco semillas oficiales, el modelo cae en la red de respaldo, de modo que solo las trayectorias registradas son rápidas.

El "entrenamiento" no es un entrenamiento neuronal convencional: las secuencias se optimizan con CMA-ES separable sobre las últimas filas, una búsqueda por coordenadas de una sola articulación (método publicado por HlibPlakhtii) y una búsqueda sobre ramas de historial de contacto que parten de un "one-ulp kick" y se repulen. Cada candidato se reproduce en el runner de la Arena. El cómputo declarado es de varias horas en una máquina x86-64 de 32 núcleos. Respecto a `composite-v13` solo cambian las tablas `L_obs` y `L_act` y la metadata `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos.

## Capacidades

- Control de locomoción y manipulación en simulación para la prueba de 6 m "Sock Heist" de la Microduck Arena.
- Reproducción determinista de cinco trayectorias concretas (semillas 1 a 5) bajo MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64.
- Puntuación idéntica en cualquier comando, ya que las claves de lookup no incluyen el comando; la Arena lo puntúa a 0,20 m/s.
- Red de respaldo genérica (v3 de lphatnguyen) para observaciones fuera de las cinco trayectorias registradas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Participación en la Microduck Arena: el modelo está diseñado exclusivamente para enviar una entrada a la prueba de 6 m "Sock Heist" y competir por el mejor tiempo medio en las cinco semillas oficiales.
- Reproducción de resultados de la Arena: sirve para verificar de forma determinista los tiempos publicados (4,610 s, 5,065 s, 4,650 s, 4,675 s y 4,785 s) en el entorno x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy.
- Estudio del mecanismo de lookup: el par de tablas `L_obs`/`L_act` y el grafo de `a1rb4Ck` pueden analizarse como ejemplo de política híbrida entre red neuronal y tabla de consulta para control en simulación.
- Base para pulir trayectorias: otros participantes pueden tomar las 1317 filas y optimizar las colas de las secuencias, tal como el propio autor anticipa que ocurrirá.
- Docencia sobre optimización de políticas en simulación: el flujo CMA-ES + búsqueda por coordenadas + repulido de ramas de contacto es un caso concreto de optimización de trayectorias con validador físico.
- Referencia para evaluación de robustez: comparar el comportamiento dentro y fuera de las cinco semillas ilustra el sobreajuste in-sample en políticas basadas en lookup.

## Benchmarks y rendimiento

Resultados publicados por el autor con el scorer de la Arena, en segundos (tiempo exacto de cruce en pasos de física entre paréntesis; un tick = 5 ms):

| Semilla | composite v13 | este modelo (v14b) |
|---|---|---|
| 1 | 4,615 (922,022) | 4,610 (921,967) |
| 2 | 5,070 (1013,925) | 5,065 (1012,999) |
| 3 | 4,650 (929,788) | 4,650 (929,551) |
| 4 | 4,675 (934,795) | 4,675 (934,728) |
| 5 | 4,790 (957,102) | 4,785 (957,000) |
| Media | 4,760 | 4,757 |

Comparación con otras entradas de la Arena (media en las cinco semillas oficiales):

| Modelo | Tiempo medio (s) |
|---|---|
| microduck-sock-heist-composite-v14b | 4,757 |
| jrubiosainz/sock-ca3-n19b | 4,758 |
| GinDuck/gin-sock-c19 | 4,759 |
| rumezhak/microduck-sock-heist-composite-v13 | 4,760 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB, por lo que el grafo y las tablas son de muy baja huella, pero no se declara un requisito concreto.
- GPU recomendadas: no se declaran; el autor valida en CPU x86-64 con onnxruntime 1.24.4, por lo que la inferencia no requiere GPU.
- Cabe en cualquier GPU consumer e incluso en CPU; el cuello de botella es la reproducibilidad numérica, no la memoria.
- Opciones de despliegue: onnxruntime (versión fijada 1.24.4) con MuJoCo 3.10.0 y numpy 2.4.1; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles; el entorno de validación es una máquina x86-64 de 32 núcleos y el propio control se ejecuta a pasos de física de 5 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Tiempo medio (s) | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck-sock-heist-composite-v14b | Política ONNX + lookup | 4,757 | No disponible como conjunto; Apache-2.0 parcial | Hugging Face (0 descargas, 0 likes) |
| jrubiosainz/sock-ca3-n19b | Política para la Arena | 4,758 | No declarada | Hugging Face |
| GinDuck/gin-sock-c19 | Política para la Arena | 4,759 | No declarada | Hugging Face |
| rumezhak/microduck-sock-heist-composite-v13 | Política ONNX + lookup | 4,760 | No disponible como conjunto; Apache-2.0 parcial | Hugging Face |

No se dispone de datos de parámetros ni de contexto para ninguno de los comparables, ya que no son modelos de lenguaje.

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de las cinco semillas oficiales el modelo recurre a la red v3 de lphatnguyen; solo las cinco trayectorias registradas son rápidas.
- Reproducibilidad frágil: los replays son deterministas únicamente en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otro redondeo de CPU puede romper alguno, ya que dos semillas cruzan con márgenes de 0,0014 y 0,0003 de paso de 5 ms.
- En macOS los números difieren ligeramente y el lookup puede fallar; solo la física x86 del Space decide.
- Ventaja marginal: unos pocos milisegundos de diferencia pueden igualarse o superarse por cualquiera que tome las filas y pula las colas.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; varias dependencias (`HlibPlakhtii/microduck-sock-heist-nov18-v5`, `jrubiosainz/microduck-sock-counter-s1s5`, `lphatnguyen/microduck-sock-heist-6m-v5`) no declaran licencia y sus partes no se relicencian aquí.
- Riesgo de retirada: el autor no pidió permiso a HlibPlakhtii, jrubiosainz, GinDuck, lphatnguyen ni a1rb4Ck, y se compromete a retirar la entrada si alguno objeta.
- No apto para robot físico: las acciones registradas están muy fuera de lo que se pediría a servomotores reales; no debe cargarse en un MicroDuck real.
- Sin datos de sesgos, alucinación o limitaciones lingüísticas, ya que no es un modelo de lenguaje.
- El autor declara que un asistente de IA ayudó en algunos experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v14b
- Modelo base (v13): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Red de respaldo (v3): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Trayectorias de partida (v5): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Trayectoria semilla 5: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- Layout del grafo y mecanismo de lookup: https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics: https://huggingface.co/pollen-robotics

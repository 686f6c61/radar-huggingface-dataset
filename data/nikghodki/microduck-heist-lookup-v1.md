# nikghodki/microduck-heist-lookup-v1

## Resumen

`nikghodki/microduck-heist-lookup-v1` es un artefacto de política para robótica simulada, publicado como entrada para la prueba "6 m Sock Heist" de la Microduck Arena (un espacio de Hugging Face de Pollen Robotics). No es un modelo de lenguaje: es un fichero de política entrenado por imitación y refinado con búsqueda de acciones que, dado un estado de simulación, reproduce una secuencia de acciones precalculada para completar la tarea en el entorno MuJoCo de la Arena. El autor es el usuario de Hugging Face `nikghodki`, y el modelo deriva por finetune de `rumezhak/microduck-sock-heist-composite-v7`.

El interés técnico es acotado y muy específico: se trata de un "lookup" que mejora marginalmente el modelo base en una única semilla oficial (la semilla 4, de 4.785 s a 4.780 s), manteniendo el resto del comportamiento idéntico al de composite v7. La media sobre las cinco semillas oficiales pasa de 4.880 s a 4.879 s, una mejora de 1 ms que el propio autor documenta con transparencia. El repositorio pesa 0.0 GB según los metadatos, lo que sugiere un artefacto de muy pequeño tamaño (probablemente pesos ONNX o una tabla de acciones), y la librería declarada es `microduck`.

La relevancia es, por tanto, la de un experimento de optimización de políticas en un benchmark de robótica simulada con reglas de juego concretas (semáforos, regla de "luz roja cazada"), no la de un modelo reutilizable en producción general. La model card advierte explícitamente de que es solo simulación y de que no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (artefacto de política para la Microduck Arena; pesos en ONNX según tags) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | Mixta: Apache-2.0 solo para las partes que la declaran; el repositorio en conjunto no se etiqueta como Apache-2.0. Partes sin licencia declarada no se relicencian |
| Formato de pesos | ONNX (según tags); tamaño del repo 0.0 GB |
| Modelo base | `rumezhak/microduck-sock-heist-composite-v7` (finetune) |
| Librería | `microduck` |
| Pipeline | `robotics` |
| Entorno de simulación | MuJoCo 3.10.0 (versión fijada por la Arena) |
| Plataforma de referencia | x86-64 |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura de red en la información proporcionada: la model card describe el procedimiento de construcción, no la topología. Lo que sí se documenta es el método: se parte de `rumezhak/microduck-sock-heist-composite-v7`, se registra su secuencia de acciones en la semilla 4 sobre x86-64, y se re-buscan las últimas filas de esa secuencia (el "verde final", después del último semáforo rojo) mediante una búsqueda de cola con CMA-ES contra el runner de la Arena, incluyendo la regla de "luz roja cazada". Sobre composite v7 se añade una capa de lookup que reproduce esa secuencia; las otras cuatro semillas y todo el mecanismo de fallback son los de composite v7.

El resultado es, por tanto, un híbrido entre una política neuronal heredada (composite v7) y una tabla de acciones optimizada por búsqueda evolutiva (CMA-ES) para un tramo concreto del episodio. No se documentan datos de entrenamiento en términos de tokens, composición de dataset, ni uso de RLHF/DPO, lo cual es coherente con un artefacto de control robótico y no con un modelo generativo.

## Capacidades

- Ejecución de la tarea "6 m Sock Heist" en la Microduck Arena en modo simulación.
- Reproducción determinista de una secuencia de acciones en x86-64 con MuJoCo 3.10.0 fijado por la Arena.
- Completado de las cinco semillas oficiales (5/5 finished) según el runner propio de la Arena.
- Mejora puntual sobre el modelo base en la semilla 4 (4.780 s frente a 4.785 s).
- Fallback al comportamiento de composite v7 fuera de las cinco semillas oficiales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión o audio: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas en la Microduck Arena: sirve como entrada de referencia para medir tiempos en la prueba de 6 m Sock Heist con el runner oficial, permitiendo comparar variantes sobre las cinco semillas.
- Estudio de optimización por búsqueda evolutiva: el par (composite v7, lookup v1) es un ejemplo reproducible de cómo una búsqueda CMA-ES sobre un tramo final de la secuencia de acciones produce mejoras marginales medibles (1 ms de media).
- Reproducibilidad de experimentos de robótica simulada: al fijar MuJoCo 3.10.0 y x86-64, el artefacto permite replicar resultados en un entorno controlado y comparar con otras entradas de la Arena.
- Análisis de sensibilidad a la semilla: la tabla de la model card (semillas 1 a 5) facilita estudiar la varianza del rendimiento entre semillas y aislar el efecto de la capa de lookup.
- Docencia y divulgación sobre benchmarks de robótica: el caso ilustra con números concretos la diferencia entre mejorar una política global y sobreajustar un tramo de un episodio concreto.
- Base para futuras entradas de la Arena: el linaje documentado (rumezhak, jrubiosainz, HlibPlakhtii, lphatnguyen, a1rb4Ck, juicenv) y los ficheros `NOTICE` y `BASE_MODEL_CARD.md` permiten construir variantes respetando la atribución.

## Benchmarks y rendimiento

Resultados publicados por el autor con el runner de la Arena en x86-64 (tiempo en segundos, menor es mejor):

| Semilla | composite v7 | lookup v1 |
|---|---|---|
| 1 | 4.795 | 4.795 |
| 2 | 5.150 | 5.150 |
| 3 | 4.750 | 4.750 |
| 4 | 4.785 | **4.780** |
| 5 | 4.920 | 4.920 |
| Media | 4.880 | **4.879** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni serían aplicables a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB, por lo que el artefacto en sí es mínimo y el coste real está en ejecutar el simulador.
- GPU recomendadas: no disponibles en la información proporcionada. La referencia del autor es x86-64 con MuJoCo 3.10.0; no se especifica aceleración por GPU.
- Cabe en GPU consumer: no disponible como dato explícito; por el tamaño del artefacto, el cuello de botella sería el simulador, no los pesos.
- Opciones de despliegue: runner de la Microduck Arena y librería `microduck`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles. El único dato temporal es el tiempo de episodio en simulación (media de 4.879 s en las cinco semillas oficiales).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media 5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nikghodki/microduck-heist-lookup-v1` | No disponible | No aplica | 4.879 s | Mixta (Apache-2.0 parcial) | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v7` | No disponible | No aplica | 4.880 s | No disponible | Hugging Face |
| Otras entradas de la Microduck Arena | No disponible | No aplica | No disponible | No disponible | Hugging Face Spaces |

No se dispone de datos de otras entradas de la Arena en la información proporcionada, por lo que la comparativa se limita al modelo base inmediato.

## Limitaciones y advertencias

- **Sobreajuste in-sample**: fuera de las cinco semillas oficiales, el fichero se comporta como la red de fallback de composite v7; la mejora no es generalizable.
- **Determinismo dependiente de plataforma**: las repeticiones son deterministas en x86-64 con MuJoCo 3.10.0 fijado por la Arena; otras CPU pueden dar resultados distintos.
- **No apto para robot físico**: el autor advierte explícitamente de que no debe cargarse en un MicroDuck real, porque las acciones buscadas quedan muy fuera de lo que un servo real debería ejecutar.
- **Licencia ambigua para uso comercial**: Apache-2.0 se aplica solo a las partes que la declaran; las partes sin licencia no se relicencian y el repositorio en conjunto no es Apache-2.0. Verificar `NOTICE`, `LICENSE-apache-2.0.txt` y `BASE_MODEL_CARD.md` antes de cualquier uso.
- **Retirada a petición de los autores**: el autor se compromete a retirar el repositorio si algún autor del linaje presenta objeción, lo que introduce riesgo de disponibilidad.
- **Sesgos y alucinación**: no aplican en el sentido habitual de modelos generativos; el riesgo equivalente es el sobreajuste a una semilla y a un tramo concretos del episodio.
- **Idioma y contexto**: no aplican; no es un modelo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikghodki/microduck-heist-lookup-v1
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v7
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Ficheros de atribución y licencia en el repositorio: `NOTICE`, `BASE_MODEL_CARD.md`, `LICENSE-apache-2.0.txt`

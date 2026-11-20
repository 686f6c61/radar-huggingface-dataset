# rumezhak/microduck-tug-cup3-tuned-v2

## Resumen

`rumezhak/microduck-tug-cup3-tuned-v2` es un modelo de control para el juego de "tira y afloja" (tug of war) de la Microduck Arena, una competición semanal de robots simulados organizada por Pollen Robotics. No es un modelo de lenguaje: es una política de control (actor network) que decide la acción de un robot MicroDuck en cada paso de simulación para ganar combates de tracción contra otro robot. Se publica como entrada para la copa semanal número 3, que cerró el 20 de noviembre.

El modelo es un fine-tune derivado del trabajo de terceros: la red de confrontación directa es la de `lphatnguyen/microduck-tug-of-war-v2`, en la copia que distribuye `jrubiosainz/microduck-tug-cup2l1-c23b073f`. Sobre esa base, el autor añade 75 offsets a la media del normalizador de observaciones y a la bias de la última capa, buscados con CMA-ES sobre el logaritmo de la tasa de victoria. Es, por tanto, un ajuste fino de bajo nivel sobre un controlador ya existente, no un modelo entrenado desde cero.

Su relevancia es acotada y muy específica: sirve como referencia de cómo se optimizan políticas de control en entornos de competición simulada y como ejemplo de las prácticas de atribución y licencias en modelos derivados. No tiene aplicación fuera de la simulación de la Microduck Arena y el propio autor advierte explícitamente que no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red actor MLP (política de control) con normalizador de observaciones; grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control por paso, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: Apache-2.0 solo en las partes que la declaran; el repositorio en su conjunto no está etiquetado como Apache-2.0. Las partes de lphatnguyen, jrubiosainz y greecree no declaran licencia |
| Formato de pesos | ONNX (librería `microduck`), con metadatos `modification_notice` |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal tipo MLP que actúa como política de control (actor) para el robot MicroDuck en la tarea de tug of war. El modelo se distribuye como grafo ONNX e incluye un normalizador de observaciones cuya media fue modificada. La red de confrontación directa procede de `lphatnguyen/microduck-tug-of-war-v2`, tomada de la copia de `jrubiosainz`, y el layout del grafo sigue el de `greecree/microduck-tug-of-war-tug-super-v8`. Además del actor, el fichero contiene filas de lookup (tabla de consulta) que replican secuencias grabadas para las cinco semillas oficiales de rating; esas filas son trabajo de otros autores y no se modificaron respecto a la v1.

El entrenamiento no es un entrenamiento convencional de pesos: el autor parte de la v1 y busca de nuevo los offsets mediante CMA-ES sobre el logaritmo de la tasa de victoria en combates de la Arena contra nueve de las entradas más fuertes de la copa. Los offsets finales son la media de seis snapshots de la búsqueda. Respecto a la v1, solo cambian los pesos del actor (media del normalizador y `mlp.6.bias`, a través de los 75 offsets); operadores del grafo, filas de lookup, `L_mask`, `L_tol` y el resto de tensores permanecen iguales. No hay datos sobre número de tokens, composición de dataset ni RLHF/DPO, porque no aplica a este tipo de modelo.

## Capacidades

- Control de políticas en simulación: genera acciones de robot para el juego de tug of war en la Microduck Arena.
- Confrontación directa contra otras entradas de la Arena, con tasas de victoria medidas en combates simulados.
- Replay determinista de secuencias grabadas para las cinco semillas oficiales de rating, mediante las filas de lookup incluidas.
- Compatible con el runner de la Arena (microduck-arena 0.7.0) y con el entorno MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Competición en la Microduck Arena: el modelo se envía como entrada a la copa semanal número 3 y compite en combates de tug of war contra otras políticas. Es su uso previsto y el único documentado.
- Evaluación comparativa de políticas de control: sirve para medir, con el runner oficial y 300 combates aleatorios por oponente con lados intercambiados, la tasa de victoria frente a entradas de referencia como `tug-hc8-aifund` o `quicksilver-tug-rating-nov18-v2`.
- Estudio de optimización con CMA-ES: el proceso de búsqueda de offsets sobre el logaritmo de la tasa de victoria es un caso concreto de ajuste fino de bajo dimensionalidad sobre una política existente, reproducible con las mismas herramientas.
- Replay determinista para auditoría: las filas de lookup permiten reproducir secuencias grabadas de las cinco semillas oficiales en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy, útil para verificar resultados.
- Referencia de atribución y licencias en modelos derivados: el `NOTICE` y la sección de cambios (Apache-2.0, sección 4(b)) documentan qué se modificó y qué procede de terceros, lo que sirve como plantilla para publicar derivados con licencias mixtas.
- Docencia sobre políticas de control en entornos simulados: el modelo ilustra cómo un ajuste pequeño (75 offsets, el mayor de 0,076 desviaciones estándar en la media y 0,056 en la bias) puede alterar el rendimiento contra oponentes concretos.

## Benchmarks y rendimiento

Resultados medidos por el autor en máquina x86-64 con el runner oficial de la Arena (microduck-arena 0.7.0), lados intercambiados y 300 combates aleatorios por oponente, con las mismas semillas para v1 y v2. Nueve de los once oponentes estuvieron en la búsqueda, por lo que los números contra ellos son en parte in-sample.

| Oponente | Tasa de victoria v1 | Tasa de victoria v2 |
|---|---|---|
| suraj-phanindra `tug-hc8-aifund` | 33,3 % | 42,2 % |
| HlibPlakhtii `quicksilver-tug-rating-nov18-v2` | 71,8 % | 74,7 % |
| azukiq `titan-v2` | 70,5 % | 59,5 % |
| jrubiosainz `tug-n3g53` | 86,7 % | 87,8 % |
| nootxlm `tug-entry-3` | 90,0 % | 86,2 % |
| lphatnguyen `tug-of-war-v2` | 84,3 % | 87,7 % |
| greecree `tug-super-v11` | 86,0 % | 82,5 % |
| GinDuck `tug-titan-league` | 92,7 % | 91,5 % |
| DenRakEiw `songkran-duck-tug5` | 37,3 % | 41,2 % |
| SSH111111 `tug` | 73,5 % | 69,0 % |
| juicenv `tug-anchor1` | 30,8 % | 28,3 % |

La media sobre estos once oponentes es prácticamente idéntica dentro del ruido: 68,8 % para v1 y 68,2 % para v2. El autor lo describe como un intercambio, no como una ganancia gratuita.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB y el modelo es un grafo ONNX de política de control, no un modelo de lenguaje de gran tamaño; no se publican requisitos de memoria.
- GPU recomendadas: no disponible. El autor ejecutó las mediciones en una máquina x86-64 con el runner oficial, sin especificar GPU.
- Cabe en GPU de consumo: no disponible como dato explícito; por el tamaño del repositorio (0,0 GB) es plausible, pero no está confirmado en la información proporcionada.
- Opciones de despliegue: runner oficial de la Microduck Arena (microduck-arena 0.7.0) con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Relación con este modelo | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rumezhak/microduck-tug-cup3-tuned-v1` | Política de control (ONNX) | Versión previa del mismo autor; v2 solo cambia los pesos del actor mediante 75 offsets | Mixta (mismas condiciones) | Hugging Face |
| `lphatnguyen/microduck-tug-of-war-v2` | Política de control | Red de confrontación directa original sobre la que se construye este modelo | No declara licencia | Hugging Face |
| `jrubiosainz/microduck-tug-cup2l1-c23b073f` | Política de control | Copia de la red de lphatnguyen de la que se tomó el modelo base; añade tabla de lookup propia | No declara licencia (según su card) | Hugging Face |
| `greecree/microduck-tug-of-war-tug-super-v8` | Política de control | Layout del grafo reutilizado para las filas de rating | No declara licencia | Hugging Face |

No se dispone de comparación con modelos de lenguaje ni con otras categorías, porque este modelo pertenece exclusivamente al ámbito de control robótico simulado de la Microduck Arena.

## Limitaciones y advertencias

- Solo para simulación: el autor indica explícitamente que no debe cargarse en un robot MicroDuck físico.
- Sesgos de sobreajuste a oponentes: los offsets se buscaron contra nueve entradas concretas, por lo que el rendimiento contra ellas es en parte in-sample y puede no generalizar si esos rivales cambian sus políticas.
- Regresión medida: v2 empeora frente a `titan-v2` (de 70,5 % a 59,5 %), `nootxlm/tug-entry-3` (de 90,0 % a 86,2 %), `greecree/tug-super-v11` (de 86,0 % a 82,5 %), `SSH111111/tug` (de 73,5 % a 69,0 %) y `juicenv/tug-anchor1` (de 30,8 % a 28,3 %). La media global no mejora.
- Fragilidad ante reajustes: cualquiera que reentrene contra estos offsets puede anular la ganancia.
- Determinismo dependiente de la plataforma: los replays son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el redondeo de otra CPU podría romperlos.
- Licencia ambigua: el repositorio no está etiquetado como Apache-2.0 en su conjunto; Apache-2.0 solo cubre las partes que la declaran. Las partes de lphatnguyen, jrubiosainz y greecree no declaran licencia, lo que genera incertidumbre para uso comercial o redistribución.
- Falta de consentimiento explícito: el autor no consultó a lphatnguyen, jrubiosainz ni greecree antes de publicar, y se compromete a retirar el modelo si alguno objeta.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto.
- Idiomas: no aplica; no hay capacidades lingüísticas.
- Asistencia de IA: el autor declara que un asistente de IA ayudó con los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-cup3-tuned-v2
- Versión previa v1: https://huggingface.co/rumezhak/microduck-tug-cup3-tuned-v1
- Red base original: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
- Copia de la que se tomó la red: https://huggingface.co/jrubiosainz/microduck-tug-cup2l1-c23b073f
- Layout del grafo reutilizado: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena

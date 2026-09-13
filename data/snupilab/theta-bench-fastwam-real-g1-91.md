# snupilab/theta-bench-fastwam-real-g1-91

## Resumen

`snupilab/theta-bench-fastwam-real-g1-91` es un repositorio de resultados de entrenamiento publicado por el autor `snupilab` dentro del ecosistema THETA Bench. Se trata de un checkpoint de una política robótica (pipeline `robotics`) obtenida mediante ajuste adicional sobre demostraciones reales del robot G1, concretamente 91 demostraciones de teleoperación. El modelo parte de un checkpoint previo entrenado en simulación (`snupilab/theta-bench-fastwam-sim-3003`) tras 40.000 actualizaciones, y sobre él se aplican 5.000 actualizaciones nuevas con datos reales.

El interés de esta ficha es acotado y conviene ser explícito: el repositorio contiene únicamente metadatos. La propia model card indica que el entrenamiento está "preparándose o en cola" y que no se publica ninguna puntuación de evaluación. Por tanto, no es posible verificar calidad, generalización ni rendimiento del checkpoint, y no se declara compatibilidad con Transformers genérico ni con cargadores de simulación.

La relevancia de este artefacto es metodológica: documenta un flujo de trabajo de ajuste sim-a-real (*sim-to-real*) sobre cuatro condiciones concretas de manipulación (StickMove y HookRetrieve, en variantes Standard y Reasoning) grabadas a 20 Hz, con acciones de tipo *joint-target* que requieren un adaptador de control específico del G1 real. Es un ejemplo de trazabilidad de entrenamiento (revisión de dataset fijada, tamaño de lote global, número de actualizaciones) más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica; se describe como politica THETA Bench / FastWAM para robotica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene solo metadatos segun la model card) |
| Pipeline | robotics |
| Modelo base | snupilab/theta-bench-fastwam-sim-3003 |
| Dataset | snupilab/theta-bench-teleop (revision 47eca9322bb53fa1c685363271a87d2e414cb0e8) |
| Etapa de entrenamiento | ajuste adicional sobre G1 real, 91 demostraciones |
| Actualizaciones objetivo | 5.000 |
| Lote por GPU / GPUs / lote global | 16 / 8 / 128 |
| Acumulacion de gradiente | 1 |
| Condiciones por lote global | 4 |
| Frecuencia de grabacion | 20 Hz |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que pertenece a la familia THETA Bench y que el autor lo etiqueta como "FastWAM", pero la model card no describe si se trata de un transformer, un modelo de acciones (por ejemplo, difusion de acciones o *world action model*), una politica de imitacion o una combinacion. En consecuencia, cualquier afirmacion sobre numero de capas, atencion, dimensiones ocultas o mecanismo de decodificacion seria especulativa y no se incluye aqui.

El proceso de entrenamiento si queda parcialmente documentado. El punto de partida es `snupilab/theta-bench-fastwam-sim-3003`, un checkpoint tras 40.000 actualizaciones en simulacion, sobre el que se aplican 5.000 actualizaciones adicionales usando 91 demostraciones reales del robot G1. La configuracion distribuida emplea 8 GPU con lote por GPU de 16, lote global de 128, sin acumulacion de gradiente y con 4 condiciones por lote global. El entrenamiento usa optimizadores de modelo independientes y ejecucion compartida de GPU a traves de MPS. La publicacion la realiza un cargador en CPU tras la validacion del checkpoint final. No se menciona si hubo RLHF, DPO u otro ajuste por preferencias, y no se aporta informacion sobre el volumen total de tokens o episodios mas alla de las 91 demostraciones citadas. Las cuatro condiciones reales cubiertas son `StickMove Standard`, `StickMove Reasoning`, `HookRetrieve Standard` y `HookRetrieve Reasoning`.

## Capacidades

- Ejecucion de politicas de control robotico: el modelo genera acciones de tipo *joint-target* para el robot G1, pensadas para ser ejecutadas por hardware real con el adaptador de control correspondiente.
- Manipulacion guiada por demostraciones: entrenado especificamente sobre cuatro tareas (StickMove y HookRetrieve) en dos variantes cada una.
- Variante "Standard": ejecucion de la tarea segun la condicion estandar.
- Variante "Reasoning": condicion etiquetada como de razonamiento, presumiblemente con un componente de decision mas elaborado (no se detalla en la informacion disponible).
- Aprendizaje sim-a-real: parte de un checkpoint de simulacion y se ajusta con datos reales, lo que en principio busca reducir la brecha de dominio.
- Idiomas: la etiqueta de idioma es `en`, aunque en una politica robotica esto se refiere mas bien al idioma de la documentacion o de las instrucciones textuales, no a generacion de lenguaje.
- No hay evidencia en la informacion disponible de soporte de *tool calling*, function calling, agentes multi-paso, vision, audio, generacion de texto ni matematicas.

## Casos de uso

- Investigacion en sim-a-real para robotica humanoide: usar este checkpoint como referencia para estudiar como 5.000 actualizaciones sobre 91 demostraciones reales modifican el comportamiento de una politica previamente entrenada en simulacion.
- Reproducibilidad de experimentos THETA Bench: el repositorio fija la revision exacta del dataset y la configuracion de lote y actualizaciones, lo que permite reconstruir o auditar el entrenamiento.
- Evaluacion de tareas de manipulacion concretas: StickMove y HookRetrieve en sus variantes Standard y Reasoning como banco de pruebas para politicas de agarre y recolocacion de objetos.
- Control de robot G1 real: despliegue en el robot G1 con su adaptador de control especifico para ejecutar acciones *joint-target* a partir de observaciones, siempre que la infraestructura de inferencia THETA este disponible.
- Estudio de razonamiento en politicas de bajo nivel: comparar las variantes Standard y Reasoning para analizar si la etiqueta de razonamiento se traduce en diferencias medibles de comportamiento (no hay evaluacion publicada).
- Base para ajuste posterior: dado que el propio repositorio es el resultado de un ajuste sobre un checkpoint de simulacion, puede servir como punto de partida para nuevos ciclos de ajuste con mas demostraciones reales.
- Docencia y divulgacion tecnica: ejemplo de como documentar metadatos de entrenamiento (lote global, condiciones por lote, revision de dataset) en un repositorio de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se reclama ninguna puntuacion de evaluacion por la publicacion del checkpoint, y que el entrenamiento esta "preparandose o en cola", por lo que el repositorio contiene solo metadatos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible. El unico dato de hardware es de entrenamiento: 8 GPU con lote por GPU de 16 y lote global de 128.
- Compatibilidad con GPU de consumo: no disponible. No puede determinarse sin conocer el numero de parametros.
- Opciones de despliegue: la model card indica que debe usarse el adaptador THETA nativo y las dependencias especificas del modelo, y que el repositorio no declara compatibilidad con Transformers generico ni con cargadores de simulacion. No se mencionan vLLM, llama.cpp, Ollama, TGI ni equivalentes.
- Latencia y throughput estimados: no disponible. El unico dato temporal es la frecuencia de grabacion de las demostraciones, 20 Hz.
- Nota sobre ejecucion: las acciones *joint-target* ejecutadas en hardware requieren el adaptador de control del G1 real; no debe asumirse que un adaptador de simulacion sea compatible.
- Infraestructura de entrenamiento: ejecucion compartida de GPU mediante MPS, con optimizadores de modelo independientes; publicacion del checkpoint desde un cargador en CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria (politicas de manipulacion sim-a-real u otros checkpoints de THETA Bench). El unico modelo relacionado identificado es su propio predecesor, `snupilab/theta-bench-fastwam-sim-3003`.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| snupilab/theta-bench-fastwam-real-g1-91 | Este modelo (ajuste sobre G1 real, 91 demostraciones) | no disponible | no disponible | no disponible | repositorio de metadatos |
| snupilab/theta-bench-fastwam-sim-3003 | Modelo base (simulacion, 40.000 actualizaciones) | no disponible | no disponible | no disponible | no disponible en la busqueda |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio contiene unicamente metadatos: el entrenamiento esta "preparandose o en cola" segun la model card, por lo que no hay pesos utilizables ni artefactos evaluables.
- No se reclama ninguna puntuacion de evaluacion; no existe evidencia publicada de calidad, robustez o generalizacion.
- Licencia no disponible: no puede determinarse si se permite uso comercial, redistribucion o modificacion. Debe tratarse como restringido a la espera de aclaracion del autor.
- Compatibilidad no garantizada: la model card advierte explicitamente que el repositorio no declara compatibilidad con Transformers generico ni con cargadores de simulacion; se requiere el adaptador THETA nativo.
- Riesgo de incompatibilidad de adaptadores de control: las acciones *joint-target* necesitan el adaptador correspondiente al G1 real, y no debe asumirse que uno de simulacion funcione.
- Ambito muy reducido: solo cuatro condiciones (StickMove Standard/Reasoning y HookRetrieve Standard/Reasoning) y 91 demostraciones reales, lo que limita fuertemente la generalizacion a otras tareas, objetos o entornos.
- Idioma: la etiqueta de idioma es `en`; no hay soporte multilingue declarado ni capacidades de lenguaje demostradas.
- Cero descargas y cero likes en el momento de la consulta, sin historial de uso que permita inferir fiabilidad.
- Los resultados de busqueda web recuperados no guardan relacion con el modelo (apuntan a servicios de citas) y no aportan informacion tecnica verificable; no se han incorporado.
- Fecha de creacion registrada como 2026-09-13, posterior a la fecha habitual de consulta; conviene verificar la coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/snupilab/theta-bench-fastwam-real-g1-91
- Modelo base: https://huggingface.co/snupilab/theta-bench-fastwam-sim-3003
- Dataset de teleoperacion: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados (revision): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/47eca9322bb53fa1c685363271a87d2e414cb0e8/hardware
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
- Demos: no disponible en la informacion proporcionada.

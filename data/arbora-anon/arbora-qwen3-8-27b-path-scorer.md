# arbora-anon/arbora-qwen3.8-27b-path-scorer

## Resumen

Arbora Qwen3.8-27B path scorer es un componente auxiliar de decodificacion especulativa publicado por el usuario anonimo arbora-anon, asociado a la revision del paper "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding". No es un modelo generativo autonomo: es un conjunto de pesos reducido (0,3 GB) que contiene los tensores del selector de candidatos (`candidate_selector.*`) empleados por el drafter de Qwen3.8-27B y por los expertos de Arbora para puntuar rutas candidatas dentro de un arbol de decodificacion especulativa.

El modelo base declarado es z-lab/Qwen3.8-27B-DFlash2, un drafter de difusion por bloques sobre Qwen3.8-27B. El path scorer se entreno con la funcion de perdida de arbol (tree loss) durante 18.400 pasos sobre respuestas generadas por el modelo objetivo a un conjunto de prompts no publicado. Su relevancia es acotada pero tecnica: permite reproducir el mecanismo de seleccion de rutas que hace viable el paralelismo de drafters de difusion por bloques en decodificacion especulativa.

La licencia es Apache 2.0 y el repositorio no incluye pipeline, idiomas declarados ni tarjeta de uso completa. Cualquier despliegue requiere integrar los tensores mediante el script `training/path_scorer/build_scorer_export.py` del repositorio de codigo del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Componente de decodificacion especulativa (path scorer / selector de candidatos) sobre un drafter de difusion por bloques; no es un transformer autonomo |
| Parametros totales | no disponible (el repo pesa 0,3 GB y contiene tres tensores `candidate_selector.*`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3.8-27b-path-scorer.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un modelo de lenguaje completo, sino un submodulo de un sistema de decodificacion especulativa. El drafter subyacente (Qwen3.8-27B-DFlash2) pertenece a la familia de drafters de difusion por bloques, que generan varios tokens candidatos en paralelo dentro de un bloque y construyen un arbol de posibles continuaciones. El path scorer evalua y selecciona rutas dentro de ese arbol, de modo que el modelo objetivo (Qwen3.8-27B) verifica unicamente las secuencias mas prometedoras. El paper de Arbora aborda precisamente como explotar el paralelismo de estos drafters de difusion por bloques.

El entrenamiento se realizo con la funcion de perdida de arbol durante 18.400 pasos. Los datos de entrenamiento son respuestas del propio modelo objetivo a una coleccion de prompts que no se ha publicado; el release de codigo describe la receta y los scripts para reconstruir el conjunto de datos a partir de cualquier fichero de prompts. El repositorio solo incluye los tres tensores del selector de candidatos, que deben insertarse tanto en el drafter como en los expertos de Arbora mediante `training/path_scorer/build_scorer_export.py`. No se documentan innovaciones adicionales como decodificacion especulativa con attention lineal ni detalles del dataset mas alla de lo indicado.

## Capacidades

- Seleccion de rutas candidatas en un arbol de decodificacion especulativa generado por un drafter de difusion por bloques.
- Puntuacion de secuencias candidatas para priorizar que rutas verifica el modelo objetivo, reduciendo el coste de verificacion.
- Integracion con los expertos de Arbora y con el drafter Qwen3.8-27B-DFlash2 mediante el script de exportacion del repositorio de codigo.
- No genera texto de forma autonoma: carece de cabeza de lenguaje y de tokenizer propios en este repositorio.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking por si mismo.
- Capacidades multilingues: no disponibles (dependen integramente del modelo base y del drafter).

## Casos de uso

- Aceleracion de inferencia de Qwen3.8-27B en produccion: el path scorer permite seleccionar rutas del arbol de drafters de difusion por bloques, de modo que el modelo objetivo valide menos candidatos por paso y se reduzca la latencia en serving con vLLM o TGI que soporten decodificacion especulativa.
- Reproduccion de resultados del paper Arbora: investigadores pueden reconstruir el pipeline completo (drafter, expertos y scorer) e iterar sobre la receta de entrenamiento usando los scripts de reconstruccion de datos a partir de sus propios prompts.
- Investigacion en decodificacion especulativa: sirve como punto de partida para experimentar con funciones de perdida de arbol y heuristicas de seleccion de rutas en drafters paralelos.
- Evaluacion comparativa de drafters: al fijar el scorer, se puede medir el impacto del drafter o del modelo objetivo en la tasa de aceptacion de tokens sin cambiar el mecanismo de seleccion.
- Ajuste fino del selector con dominios propios: el release de codigo permite regenerar datos de entrenamiento desde un fichero de prompts del dominio (por ejemplo, codigo o texto juridico) y reentrenar el scorer para mejorar la aceptacion en ese dominio.
- Despliegue en entornos con presupuesto de VRAM ajustado: al ser un componente de 0,3 GB, se anade a un stack existente de Qwen3.8-27B sin un coste de memoria significativo, siempre que el servidor de inferencia admita decodificacion especulativa con arbol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del path scorer: aproximadamente 0,3 GB en safetensors (el tamano del repo), sin cuantizaciones publicadas.
- VRAM total del sistema: dominada por el modelo objetivo Qwen3.8-27B y por el drafter Qwen3.8-27B-DFlash2; no disponible el desglose exacto en la informacion proporcionada.
- GPU recomendadas: no disponibles para el conjunto; para el modelo objetivo de 27B se requiere en la practica una GPU de centro de datos (A100 80 GB, H100) o varias GPU consumer con paralelismo tensorial.
- GPU consumer: el scorer en si cabe en cualquier GPU consumer, pero el stack completo con el objetivo de 27B no cabe en una unica GPU consumer de 24 GB sin cuantizacion agresiva del objetivo.
- Opciones de despliegue: integracion via `training/path_scorer/build_scorer_export.py` en el pipeline del paper; compatible con servidores de inferencia que implementen decodificacion especulativa con arbol (vLLM, TGI u otros), aunque no se documenta soporte explicito en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-anon/arbora-qwen3.8-27b-path-scorer | Path scorer para decodificacion especulativa | no disponible (repo de 0,3 GB) | no disponible | Apache 2.0 | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 | Drafter de difusion por bloques (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.8-27B (modelo objetivo referenciado) | LLM denso | 27B (segun nombre) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de alternativas equivalentes de path scorer publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generar texto, responder preguntas ni tareas de codigo de forma directa.
- Requiere el drafter Qwen3.8-27B-DFlash2 y los expertos de Arbora, ademas del script de exportacion, para tener cualquier utilidad.
- Los datos de entrenamiento no se publican; solo se describe la receta para reconstruirlos, lo que limita la auditoria del comportamiento del selector.
- Riesgo de sesgo y alucinacion: no evaluable en este artefacto, pero heredado del modelo objetivo y del conjunto de prompts usado para generar los datos de entrenamiento.
- Idiomas soportados no declarados; el comportamiento multilingue depende del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros en `NOTICE` y las licencias del modelo base y del drafter antes de produccion.
- Paper bajo revision anonima: los resultados pueden cambiar y la documentacion es incompleta.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta); no hay evidencia publica de que el artefacto funcione fuera del entorno de los autores.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.8-27b-path-scorer
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Codigo e instrucciones del paper: https://anonymous.4open.science/r/arbora-7ABE

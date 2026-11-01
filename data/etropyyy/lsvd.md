# Etropyyy/LSVD

## Resumen

LSVD (Loss-Aware Low-Rank Approximation for Efficient Low-Precision Vision-Language Models) es un metodo de compresion de modelos de vision-lenguaje presentado en NeurIPS 2026 por investigadores del SAI Lab de la Universidad de Nueva York (Haiyu Wang, Yutong Wang, Leshu Li, Yihui Ren y Sai Qian Zhang). El repositorio de HuggingFace `Etropyyy/LSVD` no contiene pesos de un modelo generativo, sino los artefactos precalculados de calibracion y los grupos de canales necesarios para reproducir las ejecuciones W8A8 (8 bits en pesos y activaciones) sobre tres modelos LLaVA: LLaVA-v1.5 7B, LLaVA-Next 7B y LLaVA-Next 13B.

El problema que resuelve es el coste computacional del paso de calibracion, que requiere recolectar activaciones y gradientes sobre el split de entrenamiento de ScienceQA y es la fase mas cara de una ejecucion de cuantizacion. Al publicar las caches de calibracion (factores de Cholesky de covarianzas de entrada Q/K/V, covarianzas de gradientes de salida, informacion de Fisher por cabeza y puntuaciones de importancia para la asignacion de rango entre capas), el repositorio permite saltar ese paso y ejecutar directamente el pipeline de cuantizacion.

La relevancia actual reside en que combina dos tecnicas poco habituales juntas en el dominio de los VLM: cuantizacion de activaciones a 8 bits con blanqueamiento consciente de la cuantizacion y aproximacion de bajo rango con perdida consciente, ademas de una particion hibrida de canales en la FFN entre SVD y RTN. El repositorio ocupa 17,8 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: artefactos de calibracion y grupos de canales para cuantizacion W8A8 de LLaVA-v1.5 7B, LLaVA-Next 7B y LLaVA-Next 13B |
| Parametros totales | No disponible (los modelos objetivo son de 7B y 13B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A8 (8 bits pesos y activaciones) con aproximacion de bajo rango SVD y RTN en la FFN |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch pickles (`.pt` leidos con `torch.load`) y JSON (`calib_cache.json`, `hybrid_groups_*.json`) |

## Arquitectura y entrenamiento

El repositorio no contiene un transformer entrenado, sino los subproductos de un procedimiento de compresion aplicado a la familia LLaVA (vision-language model con encoder visual y LLM decoder). Los artefactos se organizan en dos bloques. El primero, `calib_cache/`, incluye por modelo `act_input.pt` (factores de Cholesky de las covarianzas de entrada de Q/K/V, usados para el blanqueamiento consciente de la cuantizacion A8), `output_grad.pt` (factores de Cholesky por cabeza de las covarianzas de gradientes de salida), `grad_info.pt` (informacion de Fisher por cabeza), `grad_scores.pt` (puntuaciones de importancia para la asignacion de rango entre capas) y `calib_cache.json` (ajustes de calibracion y sha256 de los cuatro ficheros). El segundo bloque, `groups/`, contiene los grupos de canales hibridos de la FFN que determinan la particion entre SVD y RTN y la permutacion de canales.

La calibracion original se realiza recolectando activaciones y gradientes sobre el split de entrenamiento de ScienceQA; el repositorio evita repetir ese proceso. La innovacion tecnica central es la combinacion de aproximacion de bajo rango con criterio de perdida (loss-aware), asignacion de rango entre capas guiada por informacion de Fisher y cuantizacion de activaciones con blanqueamiento, todo ello aplicado de forma conjunta sobre los modulos de atencion y la FFN. El script `w8a8.sh` lee las caches en modo solo lectura y se ejecuta con la semilla de calibracion con la que fueron calculadas; si los ajustes de calibracion difieren de `calib_cache.json`, el proceso aborta con error.

## Capacidades

- Proporciona los datos de calibracion necesarios para ejecutar cuantizacion W8A8 sobre LLaVA-v1.5 7B, LLaVA-Next 7B y LLaVA-Next 13B sin recalibrar.
- Incluye estadisticas de segundo orden (factores de Cholesky) de covarianzas de entrada Q/K/V para blanqueamiento consciente de la cuantizacion.
- Incluye informacion de Fisher y covarianzas de gradientes de salida por cabeza de atencion.
- Incluye puntuaciones de importancia para asignar rangos de bajo rango de forma dispar entre capas.
- Define grupos de canales hibridos en la FFN con particion SVD/RTN y permutacion de canales por modelo.
- Verificacion de integridad mediante sha256 y comprobacion de coherencia de ajustes de calibracion.
- No realiza inferencia por si mismo: las capacidades funcionales (generacion de texto, razonamiento visual, respuesta a preguntas sobre imagenes) corresponden a los modelos LLaVA subyacentes.

## Casos de uso

- Reproducibilidad de resultados: un investigador que quiera replicar las cifras W8A8 del paper de NeurIPS 2026 puede descargar las caches y ejecutar `w8a8.sh` sin repetir la costosa fase de calibracion sobre ScienceQA.
- Despliegue de LLaVA en produccion con menor huella: usar los grupos hibridos y las caches para generar pesos cuantizados a 8 bits de LLaVA-Next 13B y servirlos en GPUs con menos VRAM que la version en fp16.
- Ahorro de computo en experimentacion: al eliminar la recoleccion de activaciones y gradientes, se reduce el tiempo de cada ejecucion de cuantizacion, lo que facilita barrer hiperparametros de rango o de particion SVD/RTN.
- Investigacion en compresion de VLM: el repositorio sirve como referencia para estudiar el efecto de la asignacion de rango por capas guiada por informacion de Fisher en tareas de vision-lenguaje.
- Integracion en pipelines de CI: el chequeo de sha256 y de coherencia de ajustes permite validar automaticamente que un artefacto de calibracion corresponde al modelo y configuracion esperados antes de lanzar un job de cuantizacion.
- Comparativa de metodos de cuantizacion: al disponer de artefactos para tres variantes de LLaVA (v1.5 7B, Next 7B y Next 13B), se pueden comparar los efectos de LSVD frente a RTN puro o GPTQ en el mismo conjunto de evaluacion (ScienceQA_TEST).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 17,8 GB para el repositorio completo; 4,5 GB para LLaVA-v1.5 7B o LLaVA-Next 7B; 8,7 GB para LLaVA-Next 13B.
- VRAM para inferencia: no disponible en la informacion proporcionada; depende de los pesos cuantizados W8A8 generados a partir de estos artefactos, no del repositorio en si.
- GPU recomendadas: no disponible. La model card advierte que las puntuaciones pueden variar segun el tipo de GPU y las versiones de software, lo que implica que la calibracion es sensible al hardware.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el flujo documentado usa el repositorio `SAI-Lab-NYU/LSVD` con `scripts/lsvd/w8a8.sh` y variables de entorno `LSVD_CALIB_CACHE_DIR` y `LSVD_GROUPS_DIR`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Metodo / artefacto | Modelos objetivo | Tecnica | Formato de artefacto | Licencia |
|---|---|---|---|---|
| LSVD (este repositorio) | LLaVA-v1.5 7B, LLaVA-Next 7B, LLaVA-Next 13B | W8A8 con SVD loss-aware y particion hibrida SVD/RTN en FFN | Caches `.pt` + JSON de grupos | Apache 2.0 |
| RTN (round-to-nearest) | Cualquier transformer | Cuantizacion post-entrenamiento sin calibracion | Pesos cuantizados | Segun implementacion |
| GPTQ | LLMs y VLM | Cuantizacion post-entrenamiento con Hessiano aproximado | Pesos cuantizados | Apache 2.0 (implementaciones habituales) |
| AWQ | LLMs y VLM | Cuantizacion con escalado por canales segun activaciones | Pesos cuantizados | Apache 2.0 (implementaciones habituales) |

No se dispone de datos de rendimiento comparativo entre LSVD y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo utilizables directamente para inferencia; solo artefactos de calibracion y grupos de canales. Requiere clonar `SAI-Lab-NYU/LSVD` e instalar sus dependencias y datos.
- Los `.pt` son pickles de PyTorch cargados con `torch.load`; deben tratarse como datos no confiables y verificarse con los sha256 de `calib_cache.json` antes de cargarlos.
- Las puntuaciones de calibracion pueden diferir segun el tipo de GPU y las versiones de software, lo que puede degradar la reproducibilidad exacta de los resultados del paper.
- La ejecucion aborta si los ajustes de calibracion no coinciden con `calib_cache.json`, lo que limita la reutilizacion de las caches con configuraciones distintas.
- La calibracion se realizo sobre ScienceQA train; el comportamiento en otros dominios visuales o tareas no esta cubierto por la informacion disponible.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma para los modelos LLaVA subyacentes en esta fuente.
- La licencia Apache 2.0 cubre los artefactos del repositorio; el uso comercial de los pesos LLaVA resultantes queda sujeto a las licencias de los modelos base correspondientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Etropyyy/LSVD
- Paper (arXiv): https://arxiv.org/html/2606.00573v2
- Codigo: https://github.com/SAI-Lab-NYU/LSVD
- Pagina NeurIPS 2026: https://neurips.cc/virtual/2026/poster/153335

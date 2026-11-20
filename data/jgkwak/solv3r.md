# jgkwak/solv3r

## Resumen

Solv3R es un modelo de reconstruccion 3D multi-vista desarrollado conjuntamente por la University of British Columbia, Wayve Labs, Simon Fraser University, University of Toronto y Sony. Se presenta como un "solver" unico capaz de abordar reconstruccion offline, streaming y en cualquier orden, estimando poses de camara, mapas de profundidad y nubes de puntos a partir de conjuntos de imagenes o fotogramas de video. El modelo se distribuye bajo licencia NVIDIA en Hugging Face con un repositorio de 0,5 GB y ha acumulado mas de 2000 descargas desde su publicacion en noviembre de 2026.

La propuesta tecnica central es un transformer "looped" (iterativo) que actua como solver multi-vista: en lugar de un unico pase feed-forward, el modelo ejecuta un bloque recurrente un numero configurable de llamadas (`calls`) sobre un estado latente `z`, permitiendo refinar incrementalmente la solucion y reanudar el proceso en cualquier momento. Esta arquitectura esta pensada para superar las limitaciones de los enfoques de structure-from-motion clasicos y de los modelos de reconstruccion feed-forward en escenarios de streaming o de incorporacion progresiva de vistas.

El modelo es relevante porque unifica en un solo checkpoint tareas que tradicionalmente requerian pipelines separados (SfM, estimacion de profundidad monocular/multi-vista, registro de nubes de puntos) y porque su naturaleza iterativa y reanudable facilita despliegues en robotica, drones y captura de escenas donde las imagenes llegan de forma secuencial. No es un modelo de lenguaje: no procesa texto ni tiene capacidades conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" multi-vista (solver iterativo sobre estado latente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa conjuntos de vistas; resolucion de entrada con lado largo 504 y lados multiplos de 14) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D, sin procesamiento de lenguaje) |
| Licencia | NVIDIA License (nvidia-license) |
| Formato de pesos | safetensors (`checkpoints/solv3r.safetensors`) |
| Pipeline | image-to-3d |
| Tamano del repositorio | 0,5 GB |
| Entrada | Imagenes o fotogramas de video (lado largo 504, lados multiplos de 14, sin recorte) |
| Salidas | Profundidad, confianza de profundidad, rayos, puntos 3D, `pose_enc` (poses de camara + intrínsecos) |

## Arquitectura y entrenamiento

Solv3R se basa en un transformer con un bloque recurrente ("looped block") que se aplica repetidamente sobre un estado latente `z`. El flujo de inferencia expuesto en la model card es: `encode(images)` produce un contexto `ctx` (donde la primera imagen define el marco de referencia del mundo), `solve(ctx, calls=N)` ejecuta N llamadas del bloque recurrente para refinar el estado, y `decode(z, ctx)` extrae las predicciones finales (profundidad, confianza, rayos, puntos del mundo y codificacion de pose). La API permite reanudar el solve (`solve(ctx, calls=8, z=z)`) y anadir nuevas vistas al proceso en curso (`add_views`), actualizando tambien las vistas antiguas. Esta diseno habilita un mismo modelo para reconstruccion offline, incremental y streaming.

La model card no detalla el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens de imagen vistos ni si se emplearon tecnicas de RLHF/DPO (no aplicables en este dominio). Si se mencionan innovaciones de inferencia: solve adaptativo (`--adaptive 0.02`, que detiene el proceso cuando el estado converge), configuraciones ligeras para streaming (`L4` y `S4`, segun la Tabla 8 del paper), gestion de memoria para videos cortos (`--memory-stride 16`) y mascara de cielo (`--sky-mask`) para nubes de puntos en exteriores. Los benchmarks offline siguen el protocolo de DVLT y los de streaming el de CUT3R/TTT3R.

## Capacidades

- Reconstruccion 3D multi-vista a partir de conjuntos de imagenes o fotogramas de video.
- Estimacion de poses de camara (extrinsecos e intrínsecos) y mapas de profundidad por vista.
- Generacion de nubes de puntos (`.ply`) y exportacion de modelos COLMAP.
- Modo offline: procesa todas las imagenes a la vez.
- Modo incremental: incorpora grupos de imagenes al solve en curso.
- Modo streaming: procesa fotogramas de video uno a uno.
- Solve reanudable: el estado `z` puede continuarse en cualquier momento.
- Solve adaptativo con criterio de convergencia.
- Renderizado de resultados como video (incluye modo aereo para fotos de dron).
- Visor HTML interactivo que reproduce el solve llamada a llamada.
- No soporta tool calling, agentes, texto, vision semantica ni audio: es un modelo puramente geometrico 3D.

## Casos de uso

- Reconstruccion de escenas con drones: el modo offline procesa un conjunto de fotos aereas (por ejemplo, las 39 imagenes del ejemplo del parque) y genera nube de puntos y poses; `--aerial` produce un video de renderizado adecuado para inspeccion.
- Digitalizacion de interiores con video: el modo streaming procesa fotogramas de un video de una habitacion (ejemplo del escritorio) y reconstruye la geometria de forma secuencial, util para escaneo con movil o camara de mano.
- SLAM y odometria visual en robotica: el modo incremental permite incorporar vistas nuevas al solve sin reiniciar, lo que encaja con pipelines donde la camara avanza y la reconstruccion debe actualizarse.
- Fotogrametria por lotes en pipelines COLMAP: la exportacion a modelo COLMAP permite sustituir o complementar el paso de SfM en flujos existentes de captura de patrimonio o inmobiliaria.
- Generacion de assets 3D para motores graficos: a partir de fotos o video se obtienen nubes de puntos y profundidades que alimentan etapas posteriores de mallado o texturizado.
- Inspeccion y documentacion de obra: con fotos tomadas en campo, el modelo produce poses y nubes de puntos para medir o comparar el estado de una estructura, con `--sky-mask` para exteriores.
- Investigacion en vision 3D: la API reanudable y el visor del solve facilitan experimentos sobre convergencia, orden de vistas y estrategias adaptativas.

## Benchmarks y rendimiento

La model card indica que los benchmarks offline (DTU, ETH3D, 7-Scenes, ScanNet++ y nuScenes) siguen el protocolo de DVLT y los de streaming el de CUT3R/TTT3R, pero el texto proporcionado esta truncado y no incluye los valores numericos. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio pesa 0,5 GB, lo que sugiere que los pesos caben holgadamente en GPUs de consumo, pero el consumo de memoria depende del numero de vistas y de las llamadas del bloque recurrente.
- GPU recomendadas: no disponible. El modelo se ejecuta en GPU mediante PyTorch (dependencia implicita del paquete `solv3r`); no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable por el tamano del checkpoint, pero no confirmada en la informacion disponible.
- Opciones de despliegue: paquete Python `solv3r` (`pip install -e .`), scripts de ejemplo (`offline.py`, `incremental.py`, `streaming.py`, `render_video.py`) y demo Gradio local (`python demo/app.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables o no soportados).
- Latencia y throughput: no disponibles. Se sabe que el coste escala con el numero de llamadas (`calls`) y con el numero de vistas, y que existe un modo adaptativo para detener el solve antes.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Contexto / vistas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solv3R | Transformer looped multi-vista | Offline + incremental + streaming en un solo checkpoint | Conjuntos de vistas, solve reanudable | NVIDIA License | Hugging Face + GitHub + demo |
| DVLT | Reconstruccion 3D | Protocolo de benchmark offline reutilizado por Solv3R | no disponible | no disponible | GitHub (nv-tlabs/dvlt) |
| CUT3R | Reconstruccion streaming | Evaluacion de poses de camara en streaming reutilizada por Solv3R | Streaming | no disponible | no disponible en la informacion |
| TTT3R | Reconstruccion streaming | Evaluacion de poses de camara en streaming reutilizada por Solv3R | Streaming | no disponible | no disponible en la informacion |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada; la comparativa se limita a la relacion metodologica documentada en la model card.

## Limitaciones y advertencias

- La licencia es NVIDIA License, no una licencia open source estandar; es imprescindible revisar `LICENSE` antes de cualquier uso comercial.
- El modelo solo procesa imagenes; no acepta texto, audio ni tiene capacidades de lenguaje, por lo que no debe evaluarse como un LLM.
- La resolucion de entrada esta restringida a lado largo 504 con lados multiplos de 14 y sin recorte; otras resoluciones requieren preprocesado.
- La primera imagen define el marco de referencia del mundo, lo que condiciona la orientacion de la reconstruccion.
- El solve iterativo puede no converger en escenas con poca textura, movimiento o iluminacion adversa; el modo adaptativo mitiga el coste pero no garantiza la convergencia.
- Los resultados en streaming dependen de la gestion de memoria (`--memory-stride`) y de la configuracion elegida (`L4`/`S4`), con posibles perdidas de calidad frente al modo offline.
- No se han publicado en la informacion disponible datos de sesgos, alucinacion geometrica ni evaluaciones de robustez fuera de los benchmarks citados.
- El texto de la model card esta truncado en la seccion de evaluacion, por lo que no se pueden verificar los numeros de rendimiento.
- No se especifican requisitos minimos de hardware ni latencias, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/jgkwak/solv3r
- Paper (arXiv): https://arxiv.org/abs/2611.02857
- Pagina del proyecto: https://ubc-vision.github.io/solv3r/
- Repositorio GitHub: https://github.com/ubc-vision/solv3r
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/jgkwak/solv3r
- Perfil del autor principal: https://jgkwak95.github.io/
- Theia Lab (Andrea Tagliasacchi): https://theialab.ca/
- Perfil de Kwang Moo Yi: https://www.cs.ubc.ca/~kmyi/
- DVLT (protocolo de benchmark offline): https://github.com/nv-tlabs/dvlt

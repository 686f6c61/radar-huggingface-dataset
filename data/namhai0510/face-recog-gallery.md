# NamHai0510/face-recog-gallery

## Resumen

`NamHai0510/face-recog-gallery` no es un modelo de lenguaje ni una red neuronal entrenada publicada como pesos, sino un repositorio de artefactos experimentales que compara dos pipelines de seguimiento e identificacion facial sobre video. El autor, NamHai0510, publica los resultados de ejecutar en paralelo dos configuraciones sobre dos GPU Tesla T4: el Pipeline A (YOLOv8n-face + DeepSORT, con dos variantes de re-identificacion, ArcFace y MobileNet) y el Pipeline B (YOLOv8n-face + ByteTrack + ArcFace `buffalo_l` de InsightFace). El repositorio incluye codigo, logs de tracking por video, videos comparativos en H.264 y galerias de embeddings faciales de 512 dimensiones.

El interes practico del artefacto reside en la galeria ArcFace: un fichero `.npz` con etiquetas y centroides de 512 dimensiones que permite hacer identificacion facial por similitud coseno con un umbral simple (0,4 en el ejemplo del autor). Es, por tanto, material de referencia para quien disene sistemas de reconocimiento facial en produccion y quiera comparar estrategias de tracking (DeepSORT frente a ByteTrack) y de re-identificacion (ArcFace frente a MobileNet) con metricas concretas de fragmentacion, cambios de identidad, FPS y VRAM.

No hay informacion sobre arquitectura propia, parametros, contexto ni licencia. El repositorio ocupa 0,0 GB segun Hugging Face, lo que sugiere que los artefactos pesados (videos, embeddings) pueden no estar completamente subidos o que el tamano reportado es redondeado. La fecha de creacion indicada (2026-11-15) es futura respecto a la redaccion habitual de fichas, dato que se reproduce tal cual aparece en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de vision por computador: detector YOLOv8n-face + tracker (DeepSORT o ByteTrack) + extractor de embeddings faciales (ArcFace `buffalo_l` de InsightFace o MobileNet) |
| Parametros totales | no disponible (no se publican pesos propios; se usan modelos preentrenados de terceros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesamiento de video frame a frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; los tags y la model card estan en vietnamita) |
| Licencia | no disponible |
| Formato de pesos | no hay pesos publicados; artefactos en `.npz` (galerias de embeddings), `.csv` (logs de tracking), `.json` (mapeos track-identidad), `.html` (informe), `.mp4` (videos H.264) y `.py` (codigo) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Compone un pipeline de inferencia con componentes preentrenados: YOLOv8n-face como detector de caras por fotograma, DeepSORT o ByteTrack como trackers multiobjeto, y ArcFace `buffalo_l` (InsightFace) o MobileNet como extractores de embeddings para re-identificacion. El Pipeline A combina YOLOv8n-face con DeepSORT y evalua dos variantes de embedding (ArcFace y MobileNet); el Pipeline B combina YOLOv8n-face con ByteTrack y ArcFace `buffalo_l`, generando ademas una galeria de identidades por video.

La innovacion tecnica del artefacto no esta en el modelo sino en la evaluacion: ejecucion en paralelo sobre 2 x Tesla T4, generacion de videos `side_by_side.mp4` para comparacion visual, y un conjunto de metricas por video que incluyen `unique_ids`, `stable_ids`, `short_tracks`, `mean_track_len`, `median_track_len`, `frames_with_id_pct`, `faces_per_frame`, `fragmentation`, `id_switch_proxy`, `identity_switch_proxy`, `n_identities`, `pct_assigned`, `mean_sim`, `merged_tracks`, `proc_fps`, `vram_torch_peak_mb`, `vram_device_peak_mb` y `total_time_s`. No se documentan datos de entrenamiento, tokens, RLHF ni DPO porque no aplica.

## Capacidades

- Deteccion de caras por fotograma mediante YOLOv8n-face.
- Tracking multiobjeto con DeepSORT (Pipeline A) y ByteTrack (Pipeline B).
- Extraccion de embeddings faciales de 512 dimensiones con ArcFace `buffalo_l` (InsightFace) y con MobileNet como alternativa.
- Construccion de galerias de identidad por video en formato `.npz` con arrays `labels` (N,) y `centroids` (N, 512).
- Identificacion por similitud coseno con umbral configurable (0,4 en el ejemplo del autor), devolviendo etiqueta y score o `"unknown"`.
- Mapeo track-identidad por video en JSON.
- Generacion de videos comparativos lado a lado en H.264.
- Metricas de evaluacion de tracking e identificacion exportadas a CSV y a informe HTML.
- Ejecucion paralela en multiples GPU (2 x Tesla T4 en la configuracion reportada).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es exclusivamente vision.

## Casos de uso

- **Analisis forense de video**: reconstruir la trayectoria de una cara concreta a lo largo de una grabacion usando la galeria ArcFace y el mapeo track-identidad, con la ventaja de disponer de logs por video y videos comparativos para validar manualmente.
- **Control de acceso y presencia**: desplegar el Pipeline B (ByteTrack + ArcFace) para identificar personas en streams de camara, usando el umbral de similitud coseno como mecanismo de rechazo (`"unknown"`) y la galeria `.npz` como base de identidades.
- **Auditoria de sistemas de videovigilancia**: usar las metricas `fragmentation`, `id_switch_proxy` e `identity_switch_proxy` para comparar configuraciones de tracker antes de fijar una en produccion; el repositorio ya incluye la comparativa DeepSORT frente a ByteTrack.
- **Prototipado rapido en GPU de gama media**: el pipeline cabe en una Tesla T4 con picos de VRAM de dispositivo entre 200,9 y 534,9 MB segun configuracion, lo que permite montar demos en instancias cloud economicas.
- **Investigacion sobre re-identificacion facial**: comparar la calidad de embeddings ArcFace frente a MobileNet en el mismo pipeline (Pipeline A) usando `mean_sim` y `pct_assigned` como senales; en `head_pose_female_male`, ArcFace alcanza `mean_sim` 0,8458 y 2 tracks fusionados.
- **Generacion de datasets etiquetados**: los CSV de tracks y los JSON de identidades permiten exportar recortes etiquetados por identidad para entrenar o evaluar otros sistemas.
- **Benchmark interno de trackers**: reutilizar `common.py`, `pipeline_a.py` y `pipeline_b.py` como base para medir FPS y VRAM en hardware propio; el autor reporta entre 1,84 y 33,24 FPS segun configuracion y video.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (tres videos, dos pipelines y tres variantes):

| Video | Pipeline | unique_ids | stable_ids | fragmentation | id_switch_proxy | identity_switch_proxy | pct_assigned | mean_sim | merged_tracks | proc_fps | vram_device_peak_mb | total_time_s |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| face_walking | A_arcface | 7 | 7 | 1 | 0 | no disponible | no disponible | no disponible | no disponible | 5,02 | 534,9 | 161,72 |
| face_walking | A_mobilenet | 7 | 7 | 1 | 0 | no disponible | no disponible | no disponible | no disponible | 33,09 | 528,9 | 38,42 |
| face_walking | B | 7 | 7 | 1 | 0 | 0 | 100 | 0,6006 | 0 | 4,42 | 460,9 | 179,40 |
| face_walking_pause | A_arcface | 8 | 7 | 1 | 0 | no disponible | no disponible | no disponible | no disponible | 3,40 | 272,9 | 344,66 |
| face_walking_pause | A_mobilenet | 8 | 7 | 1 | 0 | no disponible | no disponible | no disponible | no disponible | 33,24 | 534,9 | 55,55 |
| face_walking_pause | B | 7 | 7 | 0 | 0 | 0 | 100 | 0,6769 | 0 | 3,35 | 200,9 | 348,64 |
| head_pose_female_male | A_arcface | 4 | 4 | 1 | 0 | no disponible | no disponible | no disponible | no disponible | 1,91 | 272,9 | 931,77 |
| head_pose_female_male | A_mobilenet | 4 | 4 | 1 | 0 | no disponible | no disponible | no disponible | no disponible | 25,94 | 534,9 | 103,29 |
| head_pose_female_male | B | 4 | 4 | 1 | 0 | 0 | 100 | 0,8458 | 2 | 1,84 | 200,9 | 971,72 |

Observaciones derivadas de la tabla: la variante MobileNet es entre 6 y 10 veces mas rapida que ArcFace en terminos de `proc_fps` (33,09 frente a 5,02 en `face_walking`; 33,24 frente a 3,40 en `face_walking_pause`; 25,94 frente a 1,91 en `head_pose_female_male`), a costa de no generar galeria. El Pipeline B (ByteTrack) reduce la fragmentacion a 0 en `face_walking_pause` frente a 1 de DeepSORT, y en `head_pose_female_male` fusiona 2 tracks con `mean_sim` 0,8458, mientras que DeepSORT no fusiona. El pico de VRAM de dispositivo mas bajo corresponde al Pipeline B (200,9 MB). No hay benchmarks de MMLU, HumanEval ni GSM8K porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: picos de dispositivo entre 200,9 MB (Pipeline B) y 534,9 MB (Pipeline A con MobileNet); picos de `vram_torch_peak_mb` entre 35,9 y 123,5 MB segun configuracion.
- GPU recomendadas: Tesla T4 (configuracion reportada por el autor, 2 unidades en paralelo). Cualquier GPU con al menos 1 GB de VRAM libre deberia bastar para una instancia.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) con varios GB de VRAM; los picos reportados son inferiores a 600 MB.
- Opciones de despliegue: el autor publica codigo Python (`common.py`, `pipeline_a.py`, `pipeline_b.py`) y usa PyTorch (campo `vram_torch_peak_mb`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: `proc_fps` entre 1,84 (Pipeline B en `head_pose_female_male`) y 33,24 (Pipeline A con MobileNet en `face_walking_pause`). `total_time_s` entre 38,42 s y 971,72 s para los videos evaluados. La variante MobileNet es la mas rapida; ArcFace y ByteTrack son notablemente mas lentos.

## Comparativa con modelos similares

La informacion disponible no permite comparar con otros modelos o repositorios equivalentes, ya que no se aportan datos de terceros ni referencias a alternativas. Se indica "no disponible" para los campos de comparacion.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo entrenado ni publica pesos propios: es un repositorio de artefactos y resultados experimentales; no debe tratarse como un modelo listo para produccion sin integrar los componentes de terceros (YOLOv8n-face, DeepSORT, ByteTrack, InsightFace `buffalo_l`).
- No se especifica licencia, lo que impide determinar si el uso comercial es viable; ademas, las licencias de los componentes subyacentes (Ultralytics YOLOv8, InsightFace, DeepSORT, ByteTrack) tienen sus propias restricciones que el usuario debe verificar por separado.
- Sesgos conocidos: no documentados. Los sistemas de reconocimiento facial basados en ArcFace presentan sesgos demograficos conocidos en la literatura general, pero el repositorio no aporta evaluaciones al respecto.
- Riesgo de alucinacion: no aplica (no es un modelo generativo de texto); el riesgo equivalente es la falsa identificacion por similitud coseno, mitigable con el umbral (0,4 en el ejemplo) y la etiqueta `"unknown"`.
- Limitaciones de contexto o idioma: no aplica contexto; la model card y los tags estan en vietnamita, lo que puede dificultar la adopcion por parte de equipos no familiarizados con ese idioma.
- La fecha de creacion indicada (2026-11-15) es posterior a la fecha habitual de consulta; conviene verificar la vigencia de los artefactos antes de reutilizarlos.
- El tamano del repo figura como 0,0 GB, lo que sugiere que los videos y galerias pueden no estar completamente disponibles en Hugging Face; verificar la presencia real de los ficheros antes de depender de ellos.
- Solo se evaluan tres videos (`face_walking`, `face_walking_pause`, `head_pose_female_male`); la generalizacion a otros dominios (iluminacion, oclusion, multitud) no esta validada.
- El Pipeline B presenta `proc_fps` muy bajos (1,84-4,42) en la configuracion reportada, lo que limita su uso en tiempo real sin optimizacion adicional.
- No hay informacion sobre el hardware exacto mas alla de "2 x Tesla T4", ni sobre versiones de librerias, lo que complica la reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NamHai0510/face-recog-gallery
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.

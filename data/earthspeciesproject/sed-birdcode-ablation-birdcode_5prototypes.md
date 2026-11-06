# EarthSpeciesProject/sed-birdcode-ablation-birdcode_5prototypes

## Resumen

BirdCODE (ablación con 5 prototipos) es un modelo de detección de eventos sonoros (sound event detection, SED) orientado a bioacústica, desarrollado por EarthSpeciesProject. Se distribuye como un checkpoint de la familia BirdCODE, cuyo objetivo es detectar comunicación animal en grabaciones de audio, en este caso con una variante de ablación que utiliza 5 prototipos en lugar de la configuración completa. El modelo forma parte de un ecosistema de código abierto publicado en GitHub (`earthspecies/sound-event-detection`) que incluye inferencia, evaluación e inferencia a gran escala sobre datasets como Xeno-Canto e iNaturalist.

El modelo opera sobre audio remuestreado a 32 kHz y produce detecciones por fotograma (frame-level) con probabilidades por clase, que se postprocesan con umbralización a 0,5, fusión de cajas separadas por menos de 1 segundo y supresión de no máximos con IoU de 0,8. El repositorio pesa aproximadamente 0,5 GB y la descarga de pesos ronda los 1,1 GB según la model card.

Es relevante para investigadores en bioacústica y ecología acústica que necesitan pipelines reproducibles de detección de sonidos animales, con soporte para GPU opcional, servidores HTTP de inferencia y evaluación estandarizada. La licencia MIT facilita su uso tanto en investigación como en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de eventos sonoros por fotograma (frame detector); arquitectura interna no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio a 32 kHz con solapamiento configurable (ej. `overlap=0.5`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | `best_model.pt` (PyTorch) junto con `config.yaml` y `labels.txt`; descarga vía Hugging Face Hub |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un detector de fotogramas (`type: frame`) que carga pesos desde el Hub o desde un directorio de checkpoint local que contiene `config.yaml`, `best_model.pt` y `labels.txt`. Todos los checkpoints actuales operan a 32 kHz. No se detallan en la información proporcionada el tipo de backbone (transformer, CNN, etc.), el número de parámetros ni la composición del dataset de entrenamiento.

La variante concreta es una ablación con 5 prototipos (`birdcode_5prototypes`), lo que sugiere un mecanismo de prototipos en la cabeza de clasificación cuya configuración se varía para estudiar su impacto. No se especifican en la información disponible detalles sobre RLHF, DPO, número de tokens de audio ni innovaciones técnicas adicionales.

## Capacidades

- Detección de eventos sonoros en audio bioacústico a 32 kHz, con salida de probabilidades por clase y por fotograma.
- Soporte de inferencia por lotes (`audio: np.ndarray [batch, samples]`) con solapamiento configurable.
- Postprocesado integrado: umbral a 0,5, fusión de cajas con misma etiqueta separadas por menos de 1 segundo y NMS con IoU de 0,8.
- Filtrado geográfico opcional mediante mapas de distribución `*.gpkg` y coordenadas del sitio de grabación.
- Soporte de formatos de audio wav, flac, ogg y mp3, con remuestreo automático a 32 kHz.
- Servido vía HTTP (`sed-server`) para inferencia a gran escala y evaluación.
- Pipeline de inferencia a gran escala (LSI) sobre datasets como Xeno-Canto e iNaturalist.
- Extracción de características acústicas por evento (`sed-lsi-features`).
- No se documentan capacidades de texto, código, visión ni tool calling; es un modelo exclusivamente de audio.

## Casos de uso

- Monitorización de biodiversidad acústica: desplegar `sed-folder` sobre grabaciones de campo para generar tablas de selección por grabación, permitiendo inventariar especies detectadas en estudios ecológicos a largo plazo.
- Investigación en comunicación animal: usar el detector para localizar eventos de vocalización y analizar patrones temporales, con la variante de 5 prototipos como punto de comparación en estudios de ablación.
- Evaluación comparativa de detectores: emplear `sed-eval` contra un servidor `sed-server` para medir el rendimiento del modelo en datasets de detección etiquetados y comparar configuraciones.
- Inferencia a gran escala sobre Xeno-Canto e iNaturalist: usar `sed-lsi` y `sed-lsi-postprocess` para procesar corpus masivos y generar tablas de selección de forma reproducible.
- Filtrado geográfico de detecciones: activar `--geo-filter` con mapas de distribución y coordenadas del sitio para descartar especies improbables en la ubicación de la grabación, reduciendo falsos positivos.
- Integración en pipelines de investigación: cargar `FrameDetector.from_hf_hub(...)` en Python para incorporar la detección dentro de flujos de análisis propios con GPU (`SED_DEVICE=cuda`).
- Servicio de detección bajo demanda: levantar `sed-server` en un puerto configurable (por defecto 8100) y consumirlo desde clientes HTTP para aplicaciones de análisis de audio en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,5 GB y los pesos descargados rondan 1,1 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican modelos concretos; la model card indica que la GPU no es obligatoria pero mejora la velocidad. Se selecciona el dispositivo con `SED_DEVICE=cpu|cuda`.
- Cabe en GPU de consumo: sí, dado el tamaño de pesos (~1,1 GB); cualquier GPU con suficiente memoria para el checkpoint y los lotes de audio es apta.
- Opciones de despliegue: `sed-server` (servidor HTTP propio), `sed-folder` (CLI sobre carpetas), `sed-denoising-server`, `sed-lsi`, además del uso in-process mediante `FrameDetector`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: en CPU, procesar las dos grabaciones de demostración tarda aproximadamente 1,5 minutos tras descargar los pesos; no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BirdCODE (ablación 5 prototipos) | no disponible | audio a 32 kHz, solapamiento configurable | no disponible | MIT | Hugging Face Hub |
| BirdCODE (modelo oficial) | no disponible | audio a 32 kHz | no disponible | MIT | Hugging Face Hub (`EarthSpeciesProject/sed-birdcode`) |

No se dispone de información sobre otros modelos comparables de detección de eventos sonoros bioacústicos en la documentación proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de ablación (5 prototipos), no el modelo oficial BirdCODE; su rendimiento puede diferir del modelo de referencia y no debe asumirse como equivalente.
- La model card no documenta sesgos conocidos, tasas de alucinación ni métricas de error; se recomienda validar sobre datos propios antes de usarlo en producción.
- El modelo está orientado a audio en inglés según la etiqueta del repositorio, pero no se especifican limitaciones idiomáticas ni de cobertura de especies.
- El filtrado geográfico está desactivado por defecto; sin él, pueden aparecer detecciones de especies fuera de su área de distribución.
- El postprocesado por defecto (umbral 0,5, fusión a 1 s, NMS con IoU 0,8) condiciona fuertemente los resultados; conviene ajustarlo al dominio de aplicación.
- La evaluación y la inferencia a gran escala requieren el almacenamiento de datasets referenciado en `configs/data/*.yml` y la dependencia `alp-data`.
- No se detallan restricciones adicionales de la licencia MIT más allá de las habituales (atribución y conservación del aviso de copyright).

## Enlaces

- Hugging Face: https://huggingface.co/EarthSpeciesProject/sed-birdcode-ablation-birdcode_5prototypes
- Modelo oficial BirdCODE: https://huggingface.co/EarthSpeciesProject/sed-birdcode
- Repositorio GitHub: https://github.com/earthspecies/sound-event-detection
- Dependencia alp-data: https://github.com/earthspecies/alp-data/

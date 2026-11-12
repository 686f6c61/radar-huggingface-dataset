# sansaks/mlbb-hero-vision

## Resumen

`sansaks/mlbb-hero-vision` es un clasificador de imágenes especializado en el reconocimiento de héroes de Mobile Legends: Bang Bang (MLBB) a partir de recortes de la interfaz de torneos: pantallas de draft, fases de ban y HUD de retransmisión. Lo desarrolla el usuario `sansaks` y se distribuye como un modelo ONNX autónomo de 114,16 MB, pensado para ejecutarse íntegramente en local, sin GPU ni claves de API. Resuelve un problema muy concreto: los matchers de imágenes genéricos fallan ante superposiciones de hechizos de batalla, banderas de país, barras de IGN, degradados de equipo y marcos circulares de ban.

Técnicamente es una destilación de conocimiento: un backbone ConvNeXt-Tiny (`convnext_tiny.fb_in22k_ft_in1k`) se entrena para aproximar los embeddings de 768 dimensiones de `gemini-embedding-2` y, al mismo tiempo, clasificar entre 136 clases (135 héroes más una clase `EMPTY_OR_UNKNOWN`). El modelo no es un LLM ni un modelo multimodal generativo: es un extractor de características con una cabeza de clasificación por prototipos coseno, orientado a visión por computador en el dominio de los esports.

Su relevancia es acotada pero clara para quien construya herramientas de analítica de draft, overlays automáticos o pipelines de datos de torneos de MLBB: ofrece inferencia offline a unos 48-66 ms por recorte en CPU de portátil, con una licencia MIT permisiva y un formato de pesos portable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (`convnext_tiny.fb_in22k_ft_in1k`) con cabeza de clasificación por prototipos coseno |
| Parametros totales | no disponible (el backbone ConvNeXt-Tiny ronda los 28 M, pero el dato no se declara en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32 ONNX; existe un índice de recuperación en float16) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas están en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, FP32) + índice NPZ float16 (`1.725 x 768`) |

## Arquitectura y entrenamiento

El modelo parte de un backbone ConvNeXt-Tiny preentrenado en ImageNet-22k y ajustado en ImageNet-1k (`fb_in22k_ft_in1k`). Sobre él se añade una proyección a un embedding de 768 dimensiones normalizado en L2, que se usa tanto para la clasificación por prototipos coseno como para la recuperación por similitud. La cabeza clasifica 136 clases: 135 héroes de MLBB más `EMPTY_OR_UNKNOWN` para huecos vacíos o bloqueados.

El entrenamiento combina destilación y clasificación con una pérdida conjunta: entropía cruzada con temperatura 18,0 sobre el producto escalar entre el embedding y los prototipos (con label smoothing de 0,08) más un término de destilación de peso 2,0 que maximiza la similitud coseno con el embedding del profesor `gemini-embedding-2`. El profesor se aplicó sobre 1.725 imágenes limpias de 135 héroes (iconos, retratos, banners y skins). La innovación clave es la simulación de superposiciones de torneo en cada época: se sintetizan 9.600 recortes realistas de HUD (recortes de cara superior, banner y círculo, volteo horizontal, degradados de equipo azul/rojo/oscuro, iconos reales de hechizos, banderas nacionales, barras de IGN, cambios de brillo y contraste, desenfoque gaussiano y artefactos JPEG) más un 5 % de huecos vacíos. El entrenamiento se ejecutó en una Tesla T4 de Kaggle durante 18 épocas (AdamW, lr 2,5e-4, CosineAnnealingLR, batch 64, 917,5 s en total).

## Capacidades

- Clasificación de imágenes de héroes de MLBB en 135 clases más la clase `EMPTY_OR_UNKNOWN`.
- Reconocimiento robusto ante superposiciones de torneo: hechizos de batalla, banderas, barras de IGN, degradados de equipo y marcos de ban.
- Extracción de embeddings de 768 dimensiones normalizados en L2, útiles para recuperación por similitud coseno contra un índice de 1.725 vectores.
- Inferencia 100 % offline en CPU mediante `onnxruntime` (`CPUExecutionProvider`), sin GPU ni claves de API.
- Detección de huecos vacíos o bloqueados (clase `EMPTY_OR_UNKNOWN`) con confianza declarada del 92,13 % en la prueba de la model card.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking: es exclusivamente un clasificador de imágenes.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés.

## Casos de uso

- Analítica de draft en torneos: procesar capturas de la fase de pick/ban y extraer automáticamente qué héroes se eligen o se banean, alimentando estadísticas de composición y win rate por equipo.
- Overlays automáticos para retransmisión: identificar en tiempo real los héroes del HUD a partir de recortes de la emisión y generar gráficos superpuestos sin intervención manual.
- Extracción de datos históricos de partidas: recorrer un archivo de capturas de torneos y etiquetar cada slot de héroe para construir datasets de draft a gran escala.
- Herramientas de scouting y análisis de rivales: cruzar las composiciones detectadas con bases de datos de resultados para estudiar preferencias de pick por equipo y parche.
- Asistencia al espectador o a analistas: un CLI o interfaz web que, dada una captura, devuelva el héroe y la confianza para verificación rápida durante la retransmisión.
- Automatización de contenido para creadores: etiquetar clips o imágenes de partidas para generar thumbnails, resúmenes o índices de héroes sin servicios en la nube.
- Integración en pipelines de datos de esports: al ser ONNX y CPU-only, encaja en contenedores ligeros o funciones serverless donde no hay GPU disponible.

## Benchmarks y rendimiento

Datos declarados en la model card (evaluación offline con `onnxruntime` `CPUExecutionProvider` en un AMD Ryzen 5 6600H):

| Benchmark | Muestras | Top-1 | Top-5 | Latencia CPU |
|---|---|---|---|---|
| Kaggle Hard Tournament Stress Test | 200 | 100,0 % | 100,0 % | no disponible |
| Blue Team Gradient + Spell + IGN + Flag | 60 | 100,0 % (60/60) | 100,0 % (60/60) | 49,2 ms/recorte |
| Red Team Gradient + Spell + IGN + Flag | 60 | 100,0 % (60/60) | 100,0 % (60/60) | 48,6 ms/recorte |
| Captura real de retransmisión (Alpha + Retribution) | 1 | Alpha (89,68 % conf.) | #2 Saber 0,55 % | 52,6-65,8 ms |
| Slot vacío/bloqueado (LOCKED) | 1 | `EMPTY_OR_UNKNOWN` (92,13 %) | — | ~50 ms |

Precisión de entrenamiento declarada: 99,93 % en la época 18 (pérdida total 0,7351; clasificación 0,6823; destilación 0,0264). No se han publicado comparaciones con otros modelos en benchmarks estándar de visión (ImageNet, etc.).

## Requisitos de hardware

- VRAM estimada: no aplica en la configuración declarada; el modelo está pensado para CPU. En FP32 el ONNX ocupa 114,16 MB en disco.
- GPU recomendadas: no se declaran; el autor valida únicamente `CPUExecutionProvider`. Cualquier GPU compatible con ONNX Runtime podría usarse, pero no hay datos de rendimiento.
- Cabe en cualquier portátil convencional: la referencia es un AMD Ryzen 5 6600H sin GPU dedicada.
- Opciones de despliegue: `onnxruntime` (Python), el paquete `mlbb-hero-vision` (instalable desde GitHub) o descarga directa de pesos vía `huggingface_hub`.
- Latencia declarada: 48,6-65,8 ms por recorte en CPU; sin datos de throughput agregado ni de latencia en GPU.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación de héroes de MLBB desde capturas de torneo). Las alternativas genéricas serían clasificadores de imágenes preentrenados (por ejemplo, ConvNeXt-Tiny en ImageNet) o matchers de similitud visual, pero no hay datos de rendimiento de estos frente a este modelo en el dominio específico.

| Modelo | Parametros | Contexto | Rendimiento en dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sansaks/mlbb-hero-vision` | no disponible | no aplica | 100 % Top-1 en stress test interno (200 muestras) | MIT | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para MLBB y su interfaz de torneo; no generaliza a otros juegos ni a otros dominios visuales.
- Los benchmarks son internos y de tamaño reducido (200 y 60 muestras, más dos casos individuales); no hay validación externa independiente ni comparación con líneas base.
- El 100 % de acierto en el stress test debe interpretarse con cautela: el conjunto de prueba puede compartir sesgos con el generador de superposiciones sintéticas usado en entrenamiento.
- Riesgo de confusión entre héroes con skins o retratos visualmente similares; no se documentan matrices de confusión.
- La clase `EMPTY_OR_UNKNOWN` agrupa huecos vacíos y bloqueados, por lo que no distingue entre ambos estados.
- Dependencia de la calidad del recorte de entrada: el modelo espera recortes de slot ya delimitados, no detecta por sí mismo la posición del héroe en una captura completa.
- Licencia MIT: permite uso comercial, pero conviene revisar los derechos de los activos de MLBB (héroes, iconos) que el modelo aprende a reconocer, que pertenecen a Moonton.
- No hay información sobre sesgos demográficos ni de otro tipo; al operar sobre imágenes de juego, el riesgo principal es el fallo de clasificación, no el sesgo social.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sansaks/mlbb-hero-vision
- Repositorio GitHub (código, CLI y web UI): https://github.com/sansaks-jpg/mlbb-hero-vision
- Backbone de referencia: `convnext_tiny.fb_in22k_ft_in1k` (timm)
- Profesor de destilación: `gemini-embedding-2` (Google)
- Notebook de entrenamiento: `train/mlbb_hero_distill_colab.ipynb` (incluido en el repositorio del modelo)

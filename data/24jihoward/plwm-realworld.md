# 24jihoward/plwm-realworld

## Resumen

PLWM (point-latent world model) es un modelo del mundo para robótica desarrollado por el usuario 24jihoward y publicado como release de investigación en estado "work in progress". Se trata de un transformer de difusión para vídeo (el DiT Wan2.2-TI2V-5B) extendido con un flujo latente de nubes de puntos 3D y un decodificador de acciones en bucle que solo lee los latentes de puntos predichos. El modelo genera futuros de vídeo y de puntos a partir de un fotograma de historial y una instrucción en lenguaje natural, y de esos latentes extrae acciones bimanuales de efector final.

El checkpoint publicado (`step_010000.pt`) se entrenó sobre episodios reales de un robot bimanual con cuatro vistas de cámara, a 10 Hz, durante 10.000 pasos en 8 GPU H100. La arquitectura combina el experto de vídeo de Wan2.2 (5B parámetros) con un autoencoder de puntos SE(3) congelado que produce latentes de 144 slots × 128 canales por fotograma latente.

Su relevancia es acotada pero clara: es un ejemplo abierto de world model con representación geométrica explícita (nubes de puntos) integrada en un pipeline de difusión de vídeo, con código, configuraciones y pesos disponibles para reproducir la carga e inferencia. No obstante, es un release de investigación sin datos de entrenamiento, sin demos y sin benchmarks publicados, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StackedLatentWM: DiT de difusión de vídeo Wan2.2-TI2V-5B extendido con flujo latente de nubes de puntos 3D y decodificador de acciones en bucle |
| Parametros totales | no disponible (el experto de vídeo base Wan2.2-TI2V-5B tiene 5B; el total del conjunto no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1 fotograma de historial + t0, con 32 pasos futuros por ventana |
| Tipos de cuantizacion | no disponible (checkpoint en bf16; EMA en bf16) |
| Idiomas soportados | no disponible (instrucciones vía embeddings de umt5-xxl) |
| Licencia | other (licencia personalizada; ver limitaciones) |
| Formato de pesos | PyTorch `.pt` (state dict con `model`, `ema` bf16 y `step`), más autoencoder de puntos `.pt` |

## Arquitectura y entrenamiento

El modelo se construye como `StackedLatentWM` a partir de `configs/wm_real_scratch.yaml` (sección `wm_ts32v2`). El experto de vídeo es el DiT de Wan2.2-TI2V-5B, inicializado desde Wan2.2 y entrenado por completo. El latente de puntos es una rejilla de 6 × 24 con 144 slots × 128 canales por fotograma latente, generada por un autoencoder de puntos SE(3) congelado. Estos latentes se apilan sobre los tokens de vídeo con `model.v6.slot_cols=24`: el slot del AE (r, j) se mapea al token del DiT (r, j), y las 8 columnas de tokens más a la derecha no reciben slot de puntos. El decodificador de acciones en bucle (`pts_actdec`) lee únicamente los latentes de puntos predichos y emite acciones bimanuales de efector final de 2 × 12 dimensiones (`rc12`) por cada paso de 10 Hz; su pérdida entrena solo al decodificador, sin gradiente de acción hacia el tronco.

El entrenamiento partió de Wan2.2, con las entradas/salidas de puntos y el decodificador de acciones inicializados desde cero y el autoencoder de puntos congelado. Los datos son episodios reales de robot bimanual (46 de entrenamiento / 5 de validación) a 10 Hz, con instrucciones de texto embebidas mediante umt5-xxl y vídeo de 4 vistas en paralelo (top | side | left wrist | right wrist, 1024×192). La optimización usó DDP en 8× H100, batch global 16, lr 1e-4, warm-up 500, schedule coseno sobre 10.000 pasos, AdamW de 8 bits, bf16 y EMA 0.999 (sombra bf16 guardada). El código incluye `fastwam` (commit 54c307f) y Sonata (Pointcept) como dependencias vendorizadas.

## Capacidades

- Generación de vídeo futuro condicionada a un fotograma de historial y a una instrucción de texto (32 pasos futuros por ventana).
- Predicción de latentes de nubes de puntos 3D futuras mediante el flujo latente apilado sobre los tokens de vídeo.
- Decodificación de acciones bimanuales de efector final (2 × 12-D) a 10 Hz a partir exclusivamente de los latentes de puntos predichos.
- Condicionamiento por instrucciones en lenguaje natural vía embeddings de umt5-xxl.
- Modelado multi-vista: cuatro cámaras (top, side, muñeca izquierda, muñeca derecha) procesadas en paralelo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles (no se especifican idiomas soportados).

## Casos de uso

- Investigación en world models para robótica: el modelo sirve como banco de pruebas para estudiar la integración de representaciones geométricas (nubes de puntos) en difusión de vídeo, ya que el código, las configuraciones y el checkpoint están publicados.
- Planificación basada en modelo en manipulación bimanual: dado un fotograma actual y una instrucción, generar futuros de vídeo y puntos para evaluar trayectorias antes de ejecutar acciones en un robot real.
- Aprendizaje por imitación con representaciones latentes: usar los latentes de puntos predichos como espacio de estado compacto para entrenar políticas downstream, aprovechando que el decodificador de acciones opera solo sobre ellos.
- Evaluación de políticas en simulación implícita: emplear las predicciones de vídeo multi-vista como entorno "imaginado" para validar políticas antes de desplegarlas en hardware.
- Estudio de decodificación de acciones desacoplada: analizar el diseño en el que el tronco no recibe gradiente de acción, útil para investigar estabilidad de entrenamiento en world models.
- Reproducción de pipelines de entrenamiento a escala media: el `train.sh` y las configs permiten reproducir el entrenamiento en 8× H100 con un dataset propio de episodios bimanuales, sirviendo de plantilla para otros laboratorios.
- Generación de datos sintéticos de vídeo robótico: los futuros generados pueden usarse como aumentación de datos para tareas de percepción, con las cautelas propias de un modelo entrenado con solo 46 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: 8× H100 con DDP, batch global 16, bf16, AdamW de 8 bits, 10.000 pasos. El checkpoint final se entrenó en esa configuración.
- VRAM estimada para inferencia: no disponible de forma explícita. El repo pesa 20,2 GB e incluye el checkpoint (experto de vídeo de 5B en bf16 más el autoencoder de puntos); se requiere además descargar los ficheros de Wan2.2-TI2V-5B (VAE `Wan2.2_VAE.pth`) y el codificador de texto `google/umt5-xxl`.
- GPU recomendadas: H100 o A100 para inferencia cómoda del DiT de 5B en bf16; no se documenta soporte para GPU de consumo.
- ¿Cabe en GPU de consumo?: no disponible; no se indica ninguna configuración de cuantización ni requisitos mínimos para RTX 4090 u otras.
- Opciones de despliegue: el release proporciona `load_test.py` (carga en CPU con modelo en meta-device y pesos mmap) y `train.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Representacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLWM (este modelo) | no disponible (base de vídeo 5B) | 1 fotograma historial + 32 pasos futuros | Vídeo + latentes de nubes de puntos 3D + acciones bimanuales | other | Pesos y código publicados; sin datos ni demos |
| Wan2.2-TI2V-5B | 5B | no disponible | Vídeo (texto/imagen a vídeo) | no disponible en esta ficha | Público en `Wan-AI/Wan2.2-TI2V-5B` |
| Otros world models robóticos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (world models para robótica con representación geométrica) no está disponible en la información proporcionada. El único punto de referencia directo es Wan2.2-TI2V-5B, del que PLWM hereda el experto de vídeo.

## Limitaciones y advertencias

- Release de investigación explícitamente marcado como "work in progress"; no apto para producción.
- No se incluyen datos de entrenamiento, caches de embeddings de instrucciones, vídeos de demostración, logs ni ejecuciones de wandb, lo que impide auditar el entrenamiento o reproducir los resultados.
- Dataset muy reducido: 46 episodios de entrenamiento y 5 de validación, lo que limita la generalización a otras morfologías de robot, entornos o tareas.
- No se publican benchmarks ni métricas de evaluación, por lo que el rendimiento real es desconocido.
- Licencia "other": es una licencia personalizada; deben revisarse los términos exactos antes de cualquier uso comercial. Además, el código vendorizado incluye Sonata (Pointcept) con su propia licencia, y el modelo base Wan2.2 tiene sus propios términos.
- Riesgo de alucinación en las predicciones de vídeo y de puntos: al ser un modelo generativo entrenado con pocos datos, los futuros predichos pueden ser plausibles visualmente pero físicamente incorrectos.
- Las acciones solo se decodifican a partir de los latentes de puntos; si la predicción de puntos falla, las acciones resultantes no tienen corrección por parte del tronco.
- Idiomas soportados no especificados; las instrucciones dependen del codificador umt5-xxl, pero no se documenta cobertura lingüística.
- Rutas internas, nombres de clúster y direcciones de contacto fueron sustituidos por placeholders; es necesario configurar las variables de entorno `PLWM_*` para ejecutar el código.
- No se incluyen checkpoints intermedios (pasos 1K-9K) ni estados completos de optimizador/reanudación.

## Enlaces

- Hugging Face: https://huggingface.co/24jihoward/plwm-realworld
- Modelo base de vídeo: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Codificador de texto: https://huggingface.co/google/umt5-xxl
- Repositorio FastWAM (código vendorizado, commit 54c307f): no disponible como enlace directo en la información proporcionada
- Sonata (Pointcept): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada

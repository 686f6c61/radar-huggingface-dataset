# fin-ai-lab/tfwm-byol

## Resumen

TFWM encoder — BYOL es un codificador de representaciones para series temporales de datos de mercado, publicado por fin-ai-lab. No es un modelo generativo ni un modelo de lenguaje: es un extractor de características (`pipeline_tag: feature-extraction`) entrenado con aprendizaje autosupervisado sobre datos de acciones estadounidenses muestreados a 1 Hz. El objetivo concreto es producir embeddings de ventanas de mercado que sirvan como entrada para tareas posteriores (predicción, análisis latente, agrupación de regímenes), en lugar de predecir directamente el siguiente precio.

El modelo forma parte de la familia TFWM (Towards Financial World Modeling), que agrupa 18 codificadores con el mismo backbone y el mismo presupuesto de entrenamiento (12 pasadas sobre los mismos periodos de seis meses). Lo único que cambia entre ellos es el objetivo de aprendizaje autosupervisado. En este caso se emplea BYOL (Bootstrap Your Own Latent, Grill et al., 2020), donde el par positivo son dos deformaciones temporales (time warps) de una misma ventana.

El backbone es un transformer de 12 capas, anchura 384, 6 cabezas, MLP de 1536 y parche de tamano 8, con aproximadamente 22 millones de parámetros. La entrada tiene 20 canales: 9 canales de mercado (`bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`) y 11 canales de información de vista calculados al cargar. Se distribuye como cinco checkpoints, uno por mes de evaluación, cada uno entrenado sobre los seis meses inmediatamente anteriores. Está marcado explícitamente como pre-release.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder, 12 capas, anchura 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales |
| Parámetros totales | ~22 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la entrada se organiza en parches de tamano 8 sobre datos a 1 Hz) |
| Tipos de cuantización | No disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | No aplica / no disponible (modelo sobre datos de mercado, no procesa texto) |
| Licencia | `other` con `license_name: derived-market-data` |
| Formato de pesos | PyTorch (`model.pt`, state dicts planos) + `config.json` + `train_meta.json`; no hay safetensors |
| Canales de entrada | 20 (9 de mercado + 11 de información de vista calculados en carga) |
| Pooling por defecto | `mean` (en `config.json`); la lectura de forecasting usa `last` |
| Tipo de objetivo SSL | BYOL, par positivo por doble time warping de la misma ventana |
| Tamaño del repositorio | 1,0 GB |
| Librería | PyTorch |
| Dataset de entrenamiento | `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense` (`1Hz_mosaic_mnth/`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder estándar de 12 capas y anchura 384 con 6 cabezas de atención, MLP de 1536 y posiciones sinusoidales, lo que suma aproximadamente 22 millones de parámetros. La serie temporal de entrada se tokeniza en parches de tamano 8 sobre una rejilla regular de 1 Hz de sesión de mercado de renta variable estadounidense. Cada instante se describe con 9 canales de mercado y 11 canales de información de vista generados en tiempo de carga (estadísticas de normalización por vista y geometría de la ventana), hasta un total de 20 canales.

El entrenamiento es autosupervisado con BYOL. El par positivo se construye aplicando dos deformaciones temporales distintas a una misma ventana, la misma vista que usa LeJEPA Time Warping, de modo que el codificador aprende invariancia a ese tipo de distorsión. El calendario es idéntico para los 18 codificadores de la familia: 12 pasadas sobre el span de seis meses, learning rate base 0,0005, weight decay 0,05 y batch de 128. Los datos de entrenamiento provienen del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, con un registro por ticker-día sobre la rejilla de 1 Hz rellenada y mezclado dentro de cada mes. El código de entrenamiento (`market_jepa`, `stable_finance`) todavía no es público.

Se publican cinco checkpoints, cada uno entrenado sobre los seis meses inmediatamente anteriores a su mes de evaluación y sin haber visto nunca ese mes: `2019-09/` (entrenado 2019-03 → 2019-08), `2020-01/` (2019-07 → 2019-12), `2020-08/` (2020-02 → 2020-07), `2020-09/` (2020-03 → 2020-08) y `2020-12/` (2020-06 → 2020-11). El checkpoint de `2019-09` se entrenó sobre un periodo anterior al inicio de los datos liberados (Market-1T cubre 2019-07 → 2020-12), por lo que no puede reentrenarse a partir de ellos. Cada carpeta incluye `config.json`, `model.pt` y `train_meta.json` con la configuración resuelta, el span de entrenamiento y los ajustes de normalización de vistas.

## Capacidades

- Extracción de características (`feature-extraction`) sobre ventanas de datos de mercado a 1 Hz en formato ticker-día, devolviendo un embedding por ventana.
- Aprendizaje de representaciones invariantes a deformaciones temporales, gracias al objetivo BYOL con pares positivos generados por doble time warping.
- Dos modos de lectura documentados: embedding del último parche (`pool="last"`), pensado para sondas de forecasting como estado en el instante de decisión, y media sobre parches (`pool="mean"`), usada en los análisis latentes del paper.
- Entrada multimodal de series: 9 canales de mercado simultáneos (precios, tamaños de libro, volumen, número de operaciones) más 11 canales de información de vista.
- Base para transfer learning hacia tareas financieras posteriores, ya que el modelo se distribuye como codificador y no como predictor de precio.
- Integración con el ecosistema HuggingFace Hub mediante `snapshot_download` y carga directa del state dict con `torch.load(..., weights_only=True)`.
- No soporta tool calling, function calling, agentes, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Extracción de embeddings para modelos de forecasting financiero: se congela el codificador y se entrena una cabeza ligera (regresión o clasificación) sobre el embedding del último parche (`pool="last"`), que representa el estado en el instante de decisión. Es exactamente el protocolo que el paper describe como forecasting probe.
- Detección de regímenes de mercado: los embeddings medios por ventana se pueden agrupar (k-means, HDBSCAN) para identificar estados de mercado recurrentes y monitorizar transiciones en producción con un coste computacional muy bajo, dado el tamano de 22M parámetros.
- Detección de anomalías y estrés de liquidez: la representación aprendida incluye canales de libro (`bid_size`, `ask_size`, `bid_price`, `ask_price`), por lo que distancias anómalas en el espacio latente pueden señalar episodios de microestructura atípica sobre el dataset de 1 Hz.
- Investigación en representaciones financieras: los cinco checkpoints permiten comparar objetivos autosupervisados sobre el mismo backbone y el mismo calendario, lo que aísla el efecto de la función de pérdida en la calidad de la representación.
- Señales para carteras sistemáticas: los embeddings agregados por ticker o por sector pueden alimentar modelos de asignación o de scoring de activos dentro de un pipeline de research, sin exponer lógica de precios directamente al codificador.
- Preentrenamiento para mercados con pocos datos etiquetados: al ser un codificador de 22M parámetros, sirve como inicialización barata en dominios con histórico corto, reutilizando las representaciones de microestructura aprendidas en el periodo 2019-2020.
- Backtesting y evaluación walk-forward: los checkpoints están organizados por mes de evaluación con separación temporal estricta, lo que facilita montar validaciones sin fuga de información entre entrenamiento y test.
- Componente de entrada para sistemas de reinforcement learning sobre mercados: el embedding de estado sustituye a las features manuales de microestructura en agentes de ejecución o de market making.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que este codificador es uno de los 18 comparados en el trabajo *Towards Financial World Modeling* (TFWM), pero no incluye cifras de evaluación, ni métricas de las sondas de forecasting, ni resultados de los análisis latentes en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con ~22M parámetros, los pesos en FP32 ocupan aproximadamente 88 MB y en FP16 unos 44 MB, más activaciones y buffers de entrada.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100, H100 ni VRAM de datacenter. Una RTX 4090, RTX 3090 o incluso una GPU integrada reciente son suficientes.
- Cabe en GPU de consumo: sí, con holgura, y también puede ejecutarse en CPU para inferencia por lotes, dado el tamano del modelo.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo de lenguaje. El despliegue es con PyTorch nativo, cargando `model.pt` como state dict, y con el código del proyecto (`market_jepa.eval.checkpoints.load_encoder`) cuando se publique.
- Almacenamiento: el repositorio completo ocupa 1,0 GB por los cinco checkpoints; se puede descargar un único mes con `allow_patterns=["2020-12/*"]`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El coste será dominado por el preprocesado de la rejilla de 1 Hz y el cálculo de los 11 canales de vista, más que por el paso por el transformer.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo SSL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-byol (este modelo) | ~22M | No disponible | BYOL con time warping | `other` / derived-market-data | 5 checkpoints, pre-release |
| LeJEPA Time Warping (familia TFWM) | ~22M (mismo backbone) | No disponible | Time warping (misma vista que BYOL) | No disponible | Miembro de la colección TFWM de 18 codificadores |
| TS2Vec (familia TFWM) | ~22M (mismo backbone) | No disponible | No especificado en la información disponible; expone `swa_backbone` | No disponible | Miembro de la colección TFWM |
| TF-C (familia TFWM) | ~22M (mismo backbone) | No disponible | No especificado; expone `freq_backbone` | No disponible | Miembro de la colección TFWM |

Los 18 codificadores de la familia comparten backbone, calendario de entrenamiento y spans de datos, por lo que la comparación relevante entre ellos es exclusivamente la función de pérdida autosupervisada. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada, ni de comparaciones con modelos de series temporales de otros autores.

## Limitaciones y advertencias

- Estado pre-release declarado por el autor: los pesos y el código que los carga son trabajo en curso y el contenido o la disposición pueden cambiar sin aviso.
- El código de entrenamiento (`market_jepa`, `stable_finance`) no es público todavía, lo que impide reproducir el entrenamiento o auditar el pipeline de datos.
- El checkpoint `2019-09/` se entrenó sobre 2019-03 → 2019-08, un periodo anterior al inicio de los datos liberados (2019-07 → 2020-12); no puede reentrenarse desde el dataset público.
- Cobertura de datos limitada a renta variable estadounidense en sesión regular y a los meses de 2019-2020 cubiertos por Market-1T; el comportamiento fuera de ese régimen de mercado y de ese universo de activos no está documentado.
- Licencia `other` con nombre `derived-market-data`: al derivar de datos de mercado, las condiciones exactas de uso comercial no están detalladas en la información disponible y deben verificarse antes de cualquier despliegue en producción.
- Los pesos se distribuyen como `model.pt` (pickle de PyTorch), no como safetensors; se recomienda cargarlos con `weights_only=True` y desconfiar de copias de terceros.
- El `pool` almacenado en `config.json` es `mean` para todos los codificadores autosupervisados y se ignora cualquier `pool` pasado en un config aparte: para obtener la lectura del último parche hay que asignar `.pool = "last"` en cada sub-backbone tras la carga (`backbone`, y también `swa_backbone` en TS2Vec o `freq_backbone` en TF-C).
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones, tool calling ni agentes, y no tiene capacidades multilingües.
- Riesgo de alucinación no aplica en el sentido generativo, pero existe riesgo de sobreajuste a los regímenes de 2019-2020 y de extrapolación incorrecta si se aplica a periodos o activos con microestructura diferente.
- Sesgos potenciales derivados del universo de datos (acciones estadounidenses en sesión regular, un registro por ticker-día) y del rellenado de la rejilla a 1 Hz, que puede suavizar eventos de microestructura.
- Cero descargas y cero likes en el momento de la consulta: no hay validación externa ni informes de terceros sobre el comportamiento real del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-byol
- Colección TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Subcarpeta usada en entrenamiento (`1Hz_mosaic_mnth`): https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Paper *Towards Financial World Modeling* (TFWM): referencia citada en la model card, enlace no disponible
- Repositorio de código (`market_jepa`, `stable_finance`): anunciado como release forthcoming, enlace no disponible
- Los resultados de búsqueda web no aportaron enlaces relevantes: devolvieron definiciones de diccionario del término francés «fin», sin relación con el modelo.

# fin-ai-lab/tfwm-lejepa-gaussian-noise

## Resumen

TFWM encoder — LeJEPA Gaussian Noising es un codificador de representaciones para series temporales financieras desarrollado por fin-ai-lab, publicado como uno de los 18 encoders comparados en el trabajo *Towards Financial World Modeling* (TFWM). El modelo aplica una arquitectura de predicción en espacio latente (JEPA) con el regularizador isotrópico-gaussiano SIGReg, de ahí el nombre LeJEPA, sobre datos de mercado de acciones estadounidenses muestreados a 1 Hz durante la sesión regular. No es un modelo generativo ni lingüístico: su salida son embeddings de ventanas de mercado que se consumen en sondas de forecasting o en análisis del espacio latente.

El backbone es un transformer de 12 capas, ancho 384, 6 cabezas de atención, MLP de 1536 y tamaño de parche 8, con posiciones sinusoidales, lo que da aproximadamente 22 millones de parámetros. La entrada combina 9 canales de mercado (bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n) con 11 canales de información de vista calculados en tiempo de carga, sumando 20 canales por registro. El repositorio ocupa 0,5 GB porque distribuye cinco checkpoints, uno por mes de evaluación.

El modelo se distribuye como pre-release, con los pesos y el código de carga en estado de trabajo en curso y el código de entrenamiento (`market_jepa`, `stable_finance`) todavía no público. Su relevancia actual es principalmente de investigación: permite reproducir y comparar objetivos de entrenamiento autosupervisado sobre un mismo backbone y un mismo conjunto de datos, con una disciplina explícita de separación temporal entre ventana de entrenamiento y mes de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, ancho 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales); codificador JEPA con regularizador SIGReg (LeJEPA) |
| Parametros totales | ~22 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo opera con parches de 8 muestras sobre datos a 1 Hz; la ventana completa no se declara en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican state dicts de PyTorch; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de series temporales financieras, no lingüístico) |
| Licencia | other / derived-market-data |
| Formato de pesos | PyTorch state dict (`model.pt`), más `config.json` y `train_meta.json` por checkpoint |

## Arquitectura y entrenamiento

El backbone es un transformer de 12 capas con anchura 384, 6 cabezas de atención, MLP de 1536 y posiciones sinusoidales, que procesa la señal troceada en parches de 8 muestras. Sobre él se aplica el objetivo LeJEPA: una arquitectura de predicción en espacio latente con el regularizador SIGReg de tipo isotrópico-gaussiano. Cada muestra genera ocho vistas (dos globales y seis locales), todas ellas copias con ruido gaussiano de una misma ventana, lo que fuerza al encoder a producir representaciones estables frente a perturbaciones en lugar de reconstruir la señal de entrada.

El entrenamiento usa el dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, en concreto la partición `1Hz_mosaic_mnth/`, con un registro por ticker-día sobre una rejilla regular de 1 Hz y mezclado dentro de cada mes. Todos los encoders de la colección TFWM comparten backbone y se entrenan durante 12 pasadas sobre los mismos tramos de seis meses, de modo que las diferencias observadas se atribuyen principalmente al objetivo de entrenamiento. La configuración declarada incluye LR base 6e-05, weight decay 0.05, batch 256 y pooling `mean` en entrenamiento.

Un detalle metodológico relevante es la separación entre lectura y evaluación: la model card distingue entre sondas de forecasting, que usan el embedding del último parche (`pool="last"`, el estado en el instante de decisión), y análisis del espacio latente, que usan la media sobre parches (`pool="mean"`). Al cargar un checkpoint con `from_pretrained` se aplica el pool guardado en `config.json` (`mean` en todos los encoders autosupervisados) e ignora cualquier pool pasado aparte, por lo que para obtener la lectura del último parche hay que fijar `.pool = "last"` en cada sub-backbone tras la carga.

## Capacidades

- Extracción de características (feature extraction) sobre ventanas de datos de mercado a 1 Hz; pipeline declarado en HuggingFace: `feature-extraction`.
- Generación de embeddings utilizables como entrada de sondas de forecasting lineales o poco profundas.
- Análisis del espacio latente: comparación de representaciones entre encoders con el mismo backbone y distintos objetivos.
- Procesamiento de 20 canales por registro: 9 canales de mercado y 11 canales de información de vista (estadísticos de normalización por vista y geometría de ventana).
- Robustez inducida por entrenamiento: las vistas con ruido gaussiano buscan invariancia a perturbaciones de la señal.
- Evaluación walk-forward mediante checkpoints por mes, entrenados siempre sobre los seis meses inmediatamente anteriores.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no es un modelo de lenguaje).
- No ofrece generación de texto, código, matemáticas, visión ni audio.
- No se documenta modo de razonamiento (thinking mode) ni ninguna capacidad multimodal.

## Casos de uso

- Extracción de features para modelos downstream de predicción de retornos: los embeddings del encoder se congelan y se alimentan a un modelo ligero (regresión, gradient boosting) que aprende la señal predictiva; el uso de `pool="last"` proporciona el estado en el instante de decisión.
- Detección de regímenes de mercado: agrupar los embeddings medios de ventanas sucesivas para identificar estados latentes recurrentes (alta volatilidad, baja liquidez, tendencia) y usarlos como variable de control en estrategias.
- Investigación reproducible sobre objetivos autosupervisados: al compartir backbone y presupuesto de entrenamiento con los otros 17 encoders de la colección TFWM, permite aislar el efecto del objetivo (JEPA con ruido gaussiano frente a otras alternativas) sobre una misma tarea.
- Análisis de microestructura: los canales de bid_price, ask_price, bid_size, ask_size y volumen a 1 Hz permiten construir representaciones sensibles al desequilibrio de libro y estudiar su relación con movimientos inmediatos de precio.
- Detección de anomalías y vigilancia de riesgo: una ventana con embedding muy alejado de la distribución histórica puede señalizar un comportamiento de mercado atípico para revisión posterior.
- Validación walk-forward sin fuga de información: los cinco checkpoints (2019-09, 2020-01, 2020-08, 2020-09 y 2020-12) permiten construir un protocolo de evaluación por mes en el que el encoder nunca ha visto el periodo evaluado.
- Construcción de pipelines de features para backtesting: al ser un state dict estándar de PyTorch y requerir muy poca memoria (~22 M de parámetros), se puede integrar en un pipeline batch que recorra el dataset `1Hz_mosaic_mnth` mes a mes.
- Estudio de estabilidad de representaciones bajo ruido: el diseño de vistas con ruido gaussiano permite analizar cuánta perturbación admite una representación antes de degradarse, útil para calibrar umbrales en sistemas de alerta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que este encoder es uno de los 18 comparados en el trabajo *Towards Financial World Modeling* (TFWM) y describe el protocolo de evaluación (sondas de forecasting y análisis latente, con checkpoints por mes), pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de métricas financieras en la informacion proporcionada. Tampoco se han encontrado resultados en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~22 M de parametros, el peso en FP32 ocupa aproximadamente 88 MB y en FP16 unos 44 MB; el consumo real de VRAM depende del tamano de lote y de la longitud de la ventana de entrada, que no se declara.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o similar cubre el caso de uso con holgura.
- Inferencia en CPU: viable en la practica dado el tamano del modelo, aunque la model card no documenta latencias.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en hardware integrado.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` sobre `model.pt`, o con el codigo del proyecto (`market_jepa.eval.checkpoints.load_encoder`), cuyo lanzamiento esta pendiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de extraccion de caracteristicas y no generativo, esas herramientas no son el cauce natural.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 0,5 GB e incluye cinco checkpoints; es posible descargar un unico mes con `allow_patterns`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-lejepa-gaussian-noise | ~22 M | no disponible | no disponible (sin cifras publicadas) | other / derived-market-data | pesos publicos, codigo de entrenamiento no publico (pre-release) |
| Otros 17 encoders de la coleccion TFWM (mismo backbone, distinto objetivo) | ~22 M (mismo backbone declarado) | no disponible | no disponible | no disponible en la informacion proporcionada | listados en la coleccion TFWM Pre-Trained Encoders |
| Modelos financieros comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica que los 18 encoders comparten backbone y regimen de entrenamiento, por lo que la comparacion natural es interna a la coleccion TFWM. No se dispone de datos numericos publicados que permitan contrastarlos con alternativas externas.

## Limitaciones y advertencias

- Estado pre-release: la model card advierte explicitamente de que los pesos y el codigo que los carga son un trabajo en curso y que el contenido y la disposicion pueden cambiar sin aviso.
- El codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico todavia, lo que limita la reproducibilidad completa del pipeline.
- Licencia `other` con nombre `derived-market-data`: los pesos derivan de datos de mercado y su uso comercial queda sujeto a las condiciones de esa licencia, que no se detallan en la informacion proporcionada. Conviene revisarla antes de cualquier uso en produccion.
- El checkpoint `2019-09/` se entreno sobre 2019-03 a 2019-08, un tramo que queda fuera del dataset publicado (Market-1T cubre 2019-07 a 2020-12); ese encoder no se puede reentrenar a partir de los datos liberados.
- Alcance de datos limitado: acciones estadounidenses, sesion regular, rejilla de 1 Hz y un periodo que arranca en 2019. No hay evidencia declarada de generalizacion a otros mercados, clases de activo o frecuencias.
- No es un modelo de lenguaje ni multimodal: no genera texto, no razona en lenguaje natural y no dispone de capacidades multilingues.
- Sin cifras de benchmarks publicadas en la informacion disponible, por lo que no es posible cuantificar la calidad de las representaciones ni compararlas con alternativas externas.
- Riesgo de sobreajuste al periodo historico: al ser un encoder autosupervisado sobre seis meses de datos, las representaciones pueden capturar condiciones de regimen especificas de ese tramo y degradarse en otros.
- El pooling es una fuente de error silencioso: `from_pretrained` aplica siempre el pool de `config.json` (`mean`) e ignora el pool que se le pase, de modo que usar la lectura incorrecta para forecasting (`last` en lugar de `mean`) altera los resultados sin aviso.
- Trazabilidad limitada en HuggingFace: el repositorio figura con 0 descargas y 0 likes, sin validacion de la comunidad.
- La busqueda web realizada no ha devuelto informacion relevante sobre el modelo; los resultados obtenidos corresponden a definiciones del termino frances "fin" y no guardan relacion con este proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-lejepa-gaussian-noise
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Particion concreta usada (`1Hz_mosaic_mnth/`): https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Paper *Towards Financial World Modeling* (TFWM): enlace no disponible en la informacion proporcionada
- Repositorio de codigo (`market_jepa`): no disponible todavia segun la model card
- Demo: no disponible

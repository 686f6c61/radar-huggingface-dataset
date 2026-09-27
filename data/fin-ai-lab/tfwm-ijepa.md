# fin-ai-lab/tfwm-ijepa

## Resumen

tfwm-ijepa es un codificador (encoder) de series temporales financieras desarrollado por fin-ai-lab y entrenado con el objetivo autosupervisado I-JEPA (Assran et al., 2023) sobre datos de renta variable estadounidense muestreados a 1 Hz. Forma parte de la familia TFWM (Towards Financial World Modeling), un conjunto de 18 codificadores que comparten exactamente el mismo backbone Transformer (12 capas, anchura 384, 6 cabezas, MLP de 1536, parches de 8, posiciones sinusoidales, ~22M de parametros) y que se diferencian unicamente en el objetivo de entrenamiento.

El modelo no genera texto ni responde a instrucciones: es un extractor de caracteristicas. Su salida son embeddings de ventanas de datos de mercado que despues se consumen en sondas (probes) de forecasting o en analisis latentes. Se publica un checkpoint por mes de evaluacion, cada uno entrenado sobre los seis meses inmediatamente anteriores, lo que habilita evaluaciones de tipo walk-forward sin fuga de informacion.

Su relevancia actual es metodologica: permite comparar objetivos de aprendizaje autosupervisado bajo un backbone y un presupuesto de entrenamiento identicos (12 pasadas sobre tramos de seis meses) en un dominio con datos a escala de billones de observaciones. El estado del artefacto es de pre-release: los pesos y el codigo que los carga estan en progreso y el codigo de entrenamiento (`market_jepa`, `stable_finance`) todavia no es publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 12 capas, anchura 384, 6 cabezas de atencion, MLP 1536, patch 8, posiciones sinusoidales |
| Parametros totales | ~22 millones (backbone) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen state dicts de PyTorch en la precision de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; opera sobre canales numericos de mercado) |
| Licencia | other / derived-market-data |
| Formato de pesos | PyTorch state dict (`model.pt`) con las claves `backbone`, `ema` y `predictor`; sin safetensors ni GGUF |
| Canales de entrada | 20 (9 canales de mercado + 11 canales de informacion de vista calculados en tiempo de carga) |
| Pipeline declarado | feature-extraction |
| Checkpoints publicados | 5 (`2019-09`, `2020-01`, `2020-08`, `2020-09`, `2020-12`) |
| Tamano del repositorio | 0,9 GB |

Canales de mercado: `bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`.

## Arquitectura y entrenamiento

El backbone es un Transformer de 12 capas con anchura 384, 6 cabezas de atencion, MLP de 1536 y parches de tamano 8 sobre una rejilla regular de 1 Hz, con codificacion posicional sinusoidal. El objetivo I-JEPA consiste en que un predictor regrese los embeddings del target EMA correspondientes a bloques de parches enmascarados a partir de un bloque de contexto, con perdida smooth-L1. El checkpoint almacena tres componentes (`backbone`, `ema`, `predictor`), de modo que el target EMA forma parte del artefacto publicado.

Los datos de entrenamiento proceden de `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, subcarpeta `1Hz_mosaic_mnth`: un registro por ticker-dia sobre la rejilla de 1 Hz rellenada, barajado dentro de cada mes. El calendario de entrenamiento es de 12 pasadas sobre el tramo de seis meses, con learning rate base 0,0001, weight decay 0,05 y batch de 2048. No hay RLHF ni DPO: es aprendizaje autosupervisado puro, no ajuste por preferencias. El pooling almacenado en `config.json` es `mean` en todos los codificadores autosupervisados; la model card documenta dos lecturas distintas: el embedding del ultimo parche (`pool="last"`) para sondas de forecasting y la media sobre parches (`pool="mean"`) para analisis latentes. Al cargar mediante `from_pretrained` se respeta el pool de `config.json` y se ignora el que se pase externamente, por lo que hay que fijar `.pool = "last"` manualmente en cada sub-backbone.

## Capacidades

- Extraccion de caracteristicas (embeddings) de ventanas de datos de mercado intradia a 1 Hz sobre 20 canales de entrada.
- Prediccion autosupervisada de representaciones de bloques enmascarados mediante el objetivo I-JEPA.
- Lectura para sondas de forecasting usando el ultimo parche (`pool="last"`), que representa el estado en el instante de decision.
- Lectura para analisis latentes usando la media sobre parches (`pool="mean"`).
- Evaluacion walk-forward: un checkpoint por mes de evaluacion, entrenado sobre los seis meses previos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo "thinking" ni de generacion de texto.

## Casos de uso

- Extraccion de caracteristicas para modelos downstream: los embeddings del codificador alimentan clasificadores o regresores de riesgo, ejecucion o prediccion de volatilidad, evitando entrenar representaciones desde cero sobre datos de microestructura.
- Forecasting intradia de retornos o volatilidad: mediante `pool="last"` se obtiene el estado en el instante de decision y se entrena una sonda ligera sobre el embedding del ultimo parche.
- Analisis latente de regimenes de mercado: con `pool="mean"` se agrupan dias o ventanas por similitud de embeddings para caracterizar regimenes (por ejemplo, el periodo de marzo de 2020 presente en los datos de entrenamiento).
- Deteccion de anomalias en microestructura: desviaciones de la representacion aprendida respecto al comportamiento tipico de un ticker pueden senalar eventos de liquidez, spreads anormalos o cambios de regimen en `bid_size`/`ask_size`.
- Backtesting walk-forward de estrategias cuantitativas: el esquema de un checkpoint por mes permite reconstruir un pipeline de evaluacion sin fuga de informacion entre el tramo de entrenamiento y el mes de evaluacion.
- Investigacion comparativa de objetivos SSL: al compartir backbone y presupuesto (12 pasadas, mismos tramos), los 18 codificadores de la coleccion TFWM permiten aislar el efecto del objetivo de entrenamiento sobre el rendimiento de las representaciones.
- Feature store para sistemas de ejecucion: los embeddings pueden persistirse y servirse como variables de entrada a motores de decision con requisitos de baja latencia, dado el reducido tamano del modelo (~22M de parametros).
- Validacion de pipelines de datos de mercado: los canales de vista (estadisticas de normalizacion y geometria de ventana) permiten auditar como afecta la normalizacion por vista a la representacion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que este codificador es uno de los 18 comparados en el trabajo *Towards Financial World Modeling* (TFWM), pero no se proporciona ninguna tabla numerica de metricas, ni valores de MMLU, HumanEval, GSM8K ni equivalentes del dominio financiero. Tampoco se declaran cifras de latencia o throughput.

## Requisitos de hardware

- Parametros: ~22M. Peso del backbone en FP32, aproximadamente 88 MB; en BF16/FP16, aproximadamente 44 MB; en INT8, aproximadamente 22 MB. El checkpoint completo incluye ademas `ema` y `predictor`, de ahi el tamano del repositorio (0,9 GB) con los cinco checkpoints.
- VRAM de inferencia: muy reducida. El modelo cabe con holgura en cualquier GPU de consumo; el consumo de memoria de las activaciones depende del numero de parches de la ventana, dato no especificado.
- GPU recomendadas: cualquier GPU con soporte PyTorch/CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento con batch 2048 se recomienda hardware de datacenter, pero no se publican requisitos concretos.
- Cabe en GPU de consumo: si, y tambien puede ejecutarse en CPU sin dificultad dado el tamano del backbone.
- Opciones de despliegue: PyTorch nativo (`torch.load` con `weights_only=True`), descarga via `huggingface_hub.snapshot_download` filtrando por patron de mes, y el cargador del proyecto (`market_jepa.eval.checkpoints.load_encoder`, pendiente de publicacion). No hay integracion con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.
- Caveat de despliegue: los checkpoints no incluyen `config.json`; la configuracion debe reconstruirse desde `train_meta.json`.

## Comparativa con modelos similares

No se dispone de datos numericos de rendimiento que permitan una comparacion cuantitativa. La comparacion estructural con las alternativas nombradas en la propia model card es la siguiente:

| Modelo | Objetivo de entrenamiento | Backbone | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tfwm-ijepa | I-JEPA: regresion de embeddings EMA de bloques enmascarados (smooth-L1) | Transformer 12 capas, ancho 384 (compartido) | ~22M | no disponible | derived-market-data | Pesos publicos; codigo de entrenamiento no publico |
| tfwm (otros 17 codificadores de la coleccion) | Varios objetivos SSL | Mismo backbone que tfwm-ijepa | ~22M | no disponible | no disponible para el conjunto | Pesos publicos en la coleccion TFWM |
| TS2Vec (variante TFWM) | Contrastivo temporal | Mismo backbone; expone `swa_backbone` | ~22M | no disponible | no disponible | Pesos publicos en la coleccion TFWM |
| TF-C (variante TFWM) | Consistencia tiempo-frecuencia | Mismo backbone; expone `freq_backbone` | ~22M | no disponible | no disponible | Pesos publicos en la coleccion TFWM |

Las implementaciones originales de TS2Vec y TF-C publicadas por sus autores son artefactos distintos de estas variantes reentrenadas dentro de TFWM; no se dispone de informacion para compararlas con tfwm-ijepa en terminos de metricas.

## Limitaciones y advertencias

- Estado de pre-release explicito: los pesos y el codigo que los carga estan en progreso y su contenido y estructura pueden cambiar sin aviso.
- El codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico, lo que impide reproducir el entrenamiento desde cero.
- El checkpoint `2019-09` se entreno sobre el tramo 2019-03 a 2019-08, que queda fuera de los datos publicados (`Market-1T` cubre 2019-07 a 2020-12); ese codificador no puede reentrenarse con el dataset liberado.
- No hay `config.json` en los checkpoints: la configuracion se reconstruye desde `train_meta.json`, lo que anade fragilidad al proceso de carga.
- El pool indicado en un `config` externo se ignora al usar `from_pretrained`; para obtener la lectura del ultimo parche hay que sobrescribir `.pool` en cada sub-backbone, incluidos `swa_backbone` y `freq_backbone` en las variantes TS2Vec y TF-C.
- Licencia `other` / `derived-market-data`: los pesos derivan de datos de mercado con condiciones propias de redistribucion. Es imprescindible revisar los terminos antes de cualquier uso comercial o de redistribucion.
- Dominio limitado: renta variable estadounidense en sesion regular y resolucion de 1 Hz. No cubre criptoactivos, divisas, futuros, sesion extendida ni otras frecuencias.
- Los datos se presentan sobre una rejilla de 1 Hz "rellenada" (dense) y barajados dentro de cada mes, lo que puede introducir artefactos de imputacion y romper la continuidad temporal de algunas series.
- Sesgo temporal: los tramos de entrenamiento incluyen el periodo de alta volatilidad del primer semestre de 2020; los regimenes no representados en 2019-2020 pueden degradar las representaciones.
- Sesgo de universo: depende de la seleccion de tickers del dataset `Market-1T`, no explicitada en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero las sondas entrenadas sobre los embeddings pueden producir senales espurias no robustas fuera de muestra, especialmente si se usan tacticas de validacion cruzada inadecuadas.
- Riesgo de fuga de informacion si se empareja un checkpoint con un mes distinto del que figura en la tabla de checkpoints.
- Ausencia total de resultados de benchmarks publicos en la informacion disponible, lo que impide estimar su calidad relativa antes de una evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-ijepa
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset Market-1T-1Hz-2019H2-2020-dense: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Subcarpeta de datos de entrenamiento `1Hz_mosaic_mnth`: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Referencia I-JEPA (Assran et al., 2023): citada en la model card; no se proporciona URL en la informacion disponible.
- Referencia *Towards Financial World Modeling* (TFWM): citada en la model card; no se proporciona URL ni identificador en la informacion disponible.
- Repositorio de codigo de entrenamiento (`market_jepa`, `stable_finance`): no publico todavia; sin URL disponible.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (unicamente definiciones del termino "fin" en diccionarios), por lo que no se anaden enlaces adicionales.

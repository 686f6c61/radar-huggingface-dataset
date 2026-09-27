# fin-ai-lab/tfwm-cost

## Resumen

TFWM encoder — CoST es un codificador (encoder) de series temporales financieras publicado por fin-ai-lab dentro del proyecto *Towards Financial World Modeling* (TFWM). Se trata de un transformer de aproximadamente 22 millones de parametros entrenado con aprendizaje autosupervisado sobre datos de renta variable estadounidense a 1 Hz, y su objetivo no es generar texto ni predicciones directas, sino producir representaciones latentes (embeddings) de ventanas de mercado que despues se explotan con cabezas o sondas aguas abajo.

El modelo implementa el objetivo CoST (Woo et al., 2022), basado en aprendizaje contrastivo para desenredar representaciones de tendencia y estacionalidad. Es uno de los 18 codificadores comparados en TFWM: todos comparten exactamente el mismo backbone y el mismo regimen de entrenamiento (12 pasadas sobre tramos de seis meses), por lo que las diferencias entre ellos se deben principalmente a la funcion de perdida. Se distribuyen cinco checkpoints, uno por mes de evaluacion, cada uno entrenado sobre los seis meses inmediatamente anteriores.

Es relevante ahora porque forma parte de una comparativa sistematica y controlada de objetivos autosupervisados aplicados a datos de mercado de alta frecuencia, un area donde faltan referencias reproducibles. Conviene subrayar que es una version preliminar (pre-release): el codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico todavia y la disposicion de los archivos puede cambiar sin aviso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, 12 capas, ancho 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales |
| Parametros totales | ~22 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la ventana de entrada; los datos se tokenizan en parches de 8 muestras a 1 Hz) |
| Tipos de cuantizacion | no disponible (no se distribuyen versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de series temporales numericas; no procesa lenguaje natural) |
| Licencia | other / `derived-market-data` (datos de mercado derivados) |
| Formato de pesos | PyTorch state dict (`model.pt`) acompanado de `config.json` y `train_meta.json`; no se usa safetensors ni GGUF |
| Canales de entrada | 20 (9 de mercado + 11 de informacion de vista calculados en carga) |
| Pooling por defecto | `mean` (el paper usa `last` para sondas de prediccion) |
| Tamano del repositorio | 2,0 GB |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

El backbone es un transformer de 12 capas con anchura 384, 6 cabezas de atencion, MLP de 1536 y posiciones sinusoidales, que opera sobre parches de 8 muestras. La entrada es datos de renta variable estadounidense en sesion regular muestreados a 1 Hz: 9 canales de mercado (`bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`) mas 11 canales de informacion de vista calculados en tiempo de carga (estadisticos de normalizacion por vista y geometria de la ventana), lo que suma 20 canales.

El objetivo de entrenamiento es CoST, un esquema contrastivo que aprende representaciones desenredadas de tendencia y estacionalidad. Todos los codificadores de la coleccion TFWM se entrenan con el mismo calendario: 12 pasadas sobre un tramo de seis meses, con learning rate base 0,001, weight decay 0,05 y batch de 128. Los datos provienen del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, en la ruta `1Hz_mosaic_mnth/` (un ticker-dia por registro sobre una rejilla rellenada a 1 Hz, mezclados dentro de cada mes). El pooling usado durante el entrenamiento y almacenado en `config.json` es `mean`.

Un detalle practico relevante: el paper lee cada codificador de dos formas. Para las sondas de prediccion usa el embedding del ultimo parche (`pool="last"`, el estado en el momento de decision) y para los analisis latentes usa la media sobre parches (`pool="mean"`). Cargar un checkpoint mediante `from_pretrained` respeta el pooling guardado en `config.json` e ignora el que se pase por configuracion, por lo que hay que fijar `.pool` manualmente en cada sub-backbone (incluidos `swa_backbone` en TS2Vec y `freq_backbone` en TF-C) para obtener la lectura del ultimo parche.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de series temporales financieras de alta frecuencia; es su unica funcionalidad declarada.
- Generacion de embeddings de ventana completos (pooling `mean`) y del estado en el instante de decision (pooling `last`).
- Representaciones desenredadas de tendencia y estacionalidad gracias al objetivo contrastivo CoST.
- Base para sondas de prediccion aguas abajo (forecasting probes) sobre los embeddings.
- Analisis latente: inspeccion, clustering y comparacion de representaciones entre el resto de codificadores de TFWM.
- No soporta generacion de texto, tool calling, function calling, agentes, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.
- Contexto de aplicacion: renta variable estadounidense en horario regular, datos a 1 Hz.

## Casos de uso

- Investigacion de representaciones autosupervisadas en finanzas: usar los embeddings para comparar objetivamente el objetivo CoST frente a los otros 17 codificadores de la coleccion TFWM bajo un backbone y un calendario de entrenamiento identicos.
- Sondas de prediccion de retornos o volatilidad: congelar el codificador y entrenar una cabeza ligera sobre el embedding del ultimo parche (`pool="last"`), que representa el estado en el momento de decision.
- Deteccion de regimenes de mercado: aplicar clustering sobre los embeddings medios de ventana para identificar agrupaciones de comportamiento (tendencia, alta volatilidad, baja liquidez) en el periodo 2019-2020.
- Analisis de microestructura: explotar los canales de tamano de bid/ask y numero de operaciones para estudiar desequilibrios de libro y su reflejo en el espacio latente.
- Construccion de factores (alpha research): generar representaciones densas por ticker-dia como entrada de modelos tabulares o lineales en pipelines de investigacion cuantitativa.
- Baseline reproducible para publicaciones: dado que los cinco checkpoints siguen un protocolo mes a mes sin fuga temporal, sirven como referencia comun en experimentos de prediccion financiera.
- Preentrenamiento y transferencia: usar los pesos como inicializacion en tareas de series temporales con menos datos, siempre que el dominio sea lo bastante parecido (renta variable estadounidense a 1 Hz).
- Analisis de robustez ante crisis: el tramo cubre 2019-2020, incluido el shock de marzo de 2020, lo que permite estudiar como se comportan las representaciones en un cambio brusco de regimen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo forma parte de la comparativa de 18 codificadores del trabajo *Towards Financial World Modeling*, pero no incluye cifras de evaluacion (ni de prediccion ni de analisis latente) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del recuento de ~22 M de parametros, los pesos ocupan aproximadamente 88 MB en fp32, 44 MB en fp16 y 22 MB en int8. El consumo real depende del tamano de lote y de la longitud de la ventana, pero en cualquier caso es muy inferior a 1 GB en escenarios habituales de extraccion de caracteristicas.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo tambien se ejecuta en CPU. No requiere A100, H100 ni GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.), y tambien en CPU y en equipos sin acelerador dedicado.
- Opciones de despliegue: PyTorch nativo cargando el state dict con `torch.load`; con el codigo del proyecto (aun no publico) mediante `load_encoder` de `market_jepa.eval.checkpoints`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de lenguaje.
- Almacenamiento: el repositorio completo ocupa 2,0 GB (cinco checkpoints mas metadatos); es posible descargar solo un mes con `allow_patterns`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card situa este modelo junto a otros 17 codificadores de la misma coleccion, de los que se mencionan explicitamente TS2Vec y TF-C. Todos comparten backbone (~22 M de parametros, 12 capas, ancho 384), el mismo dataset y el mismo calendario de 12 pasadas sobre tramos de seis meses, y se diferencian sobre todo en el objetivo de entrenamiento.

| Modelo | Parametros | Backbone | Objetivo | Datos y calendario | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tfwm-cost (este) | ~22 M | Transformer 12 capas, ancho 384 | CoST (contrastivo, tendencia/estacionalidad) | Market-1T, 12 pasadas sobre 6 meses | `derived-market-data` | Pre-release, 5 checkpoints |
| tfwm TS2Vec | ~22 M | Mismo backbone (con `swa_backbone`) | TS2Vec | Identicos | No disponible en la informacion proporcionada | Coleccion TFWM |
| tfwm TF-C | ~22 M | Mismo backbone (con `freq_backbone`) | TF-C | Identicos | No disponible en la informacion proporcionada | Coleccion TFWM |

No se dispone de cifras comparativas de rendimiento ni de contexto maximo para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Version preliminar: los pesos y el codigo que los carga estan en desarrollo y su contenido y estructura pueden cambiar sin aviso.
- El codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico todavia, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia `other` con nombre `derived-market-data`: al derivar de datos de mercado, el uso comercial esta sujeto a condiciones especificas que no se detallan en la informacion disponible; hay que revisarlas antes de cualquier despliegue productivo.
- Cobertura temporal y de dominio muy acotada: renta variable estadounidense en sesion regular, a 1 Hz, y unicamente los tramos 2019-2020. No hay evidencia de generalizacion a otros mercados, clases de activo ni frecuencias.
- El checkpoint `2019-09/` se entreno sobre 2019-03 a 2019-08, un periodo que queda fuera del dataset publicado (Market-1T cubre 2019-07 a 2020-12), por lo que ese encoder no puede reentrenarse a partir de los datos liberados.
- Solo hay cinco meses de evaluacion, un periodo dominado por el shock de la COVID-19; los resultados pueden estar sesgados por ese regimen de mercado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreinterpretar los embeddings, que no incorporan ninguna garantia de significacion estadistica ni de rentabilidad futura.
- Sin datos de benchmarks publicados en la informacion disponible, no es posible validar su calidad relativa frente a alternativas.
- Advertencia de uso: cualquier aplicacion a trading real conlleva riesgo financiero; este modelo es una herramienta de representacion, no una senal de inversion.
- Repositorio con 0 descargas y 0 likes y creado en 2026-09-27: no cuenta con validacion de la comunidad.
- Aunque el checkpoint declare pooling `mean`, es facil obtener lecturas incorrectas si no se ajusta `.pool = "last"` en todos los sub-backbones al reproducir las sondas del paper.
- No procesa lenguaje natural: no admite prompts, instrucciones ni conversacion, y no dispone de capacidades multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-cost
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Ruta concreta de datos usada: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Referencia del objetivo CoST citada en la model card: Woo et al., 2022, *CoST: Contrastive Learning of Disentangled Seasonal-Trend Representations for Time Series Forecasting* (https://arxiv.org/abs/2202.01575)
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente definiciones lexicograficas del termino frances "fin" y no aportan informacion tecnica aprovechable.

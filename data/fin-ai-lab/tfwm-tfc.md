# fin-ai-lab/tfwm-tfc

## Resumen

TFWM encoder — TF-C es un codificador de representaciones para series temporales de datos de mercado, publicado por fin-ai-lab dentro del proyecto *Towards Financial World Modeling* (TFWM). No es un modelo generativo ni un modelo de lenguaje: su única funcion es transformar ventanas de datos de mercado en embeddings (pipeline `feature-extraction`). El checkpoint publicado es uno de los 18 encoders autosupervisados comparados en el trabajo TFWM, y le corresponde el objetivo de entrenamiento TF-C (Zhang et al., 2022), basado en consistencia tiempo-frecuencia entre un codificador de dominio temporal y otro de dominio frecuencial.

El backbone es un transformer de 12 capas, anchura 384, 6 cabezas y MLP de 1536, con parcheo de 8 muestras y posiciones sinusoidales, lo que suma aproximadamente 22 millones de parametros. La entrada son datos de acciones estadounidenses en sesion regular muestreados a 1 Hz, con 9 canales de mercado (bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n) mas 11 canales de informacion de vista calculados en tiempo de carga, es decir 20 canales por registro.

Su relevancia es metodologica: se publican cinco checkpoints, uno por mes de evaluacion, cada uno entrenado exclusivamente sobre los seis meses inmediatamente anteriores, lo que permite evaluacion walk-forward sin fuga de datos. El modelo esta en estado de pre-lanzamiento, el codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico todavia y no hay resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (12 capas, anchura 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales) mas un segundo backbone de dominio frecuencial (`freq_backbone`) y proyectores; objetivo TF-C de consistencia tiempo-frecuencia |
| Parametros totales | ~22M en el backbone temporal; el total incluyendo `freq_backbone` y proyectores no se especifica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de series a 1 Hz con parches de 8 muestras; no se especifica el numero maximo de parches por ventana) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch; no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica: no es un modelo de lenguaje. Datos de acciones estadounidenses, sesion regular, 1 Hz |
| Licencia | other, con `license_name: derived-market-data` (licencia derivada de datos de mercado) |
| Formato de pesos | PyTorch state dict (`model.pt`) + `config.json` + `train_meta.json`; no se publican safetensors, GGUF ni ONNX |

Datos adicionales: ID `fin-ai-lab/tfwm-tfc`, libreria PyTorch, tamano del repositorio 0,9 GB, creado el 2026-09-27, 0 descargas y 0 likes en el momento de la consulta. Dataset asociado: `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`.

## Arquitectura y entrenamiento

La arquitectura sigue el esquema TF-C: dos codificadores, uno sobre la serie temporal en dominio de tiempo y otro sobre su representacion en dominio de frecuencia, con proyectores asociados y un objetivo de consistencia tiempo-frecuencia. El backbone temporal es un transformer de 12 capas con anchura 384, 6 cabezas de atencion, MLP de 1536 y parcheo de 8 muestras sobre una rejilla regular de 1 Hz, con codificacion posicional sinusoidal. La entrada tiene 20 canales: 9 de mercado (bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n) y 11 de informacion de vista generados al cargar los datos (estadisticas de normalizacion por vista y geometria de la ventana). El pooling guardado en `config.json` y usado durante el entrenamiento es `mean`; para sondas de forecasting el paper lee el embedding del ultimo parche (`pool="last"`) y para analisis latentes la media sobre parches (`pool="mean"`).

Los datos de entrenamiento provienen de `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, directorio `1Hz_mosaic_mnth`, con un ticker-dia por registro sobre la rejilla rellena de 1 Hz y mezcla aleatoria dentro de cada mes. El calendario es de 12 pasadas sobre cada span de seis meses, con learning rate base 0,0003, weight decay 0,05 y batch de 128. Se publican cinco checkpoints: `2019-09/` (entrenado con 2019-03 a 2019-08), `2020-01/` (2019-07 a 2019-12), `2020-08/` (2020-02 a 2020-07), `2020-09/` (2020-03 a 2020-08) y `2020-12/` (2020-06 a 2020-11); en todos los casos el mes de evaluacion queda fuera del entrenamiento. El checkpoint `2019-09/` se entreno sobre un tramo anterior a los datos liberados (Market-1T cubre 2019-07 a 2020-12), por lo que no puede reentrenarse a partir de ellos. No se documentan en la model card fases de RLHF, DPO ni ajuste supervisado posteriores.

## Capacidades

- Extraccion de caracteristicas (embeddings) de series temporales financieras a 1 Hz: es la unica funcion declarada del modelo (`pipeline_tag: feature-extraction`).
- Representacion de microestructura de mercado mediante 9 canales de cotizacion y volumen (precios bid/ask, vwap, maximo, minimo, tamanos, volumen, numero de operaciones).
- Codificacion en dos dominios: un backbone temporal y otro frecuencial, con objetivo de consistencia entre ambos.
- Dos modos de lectura del embedding: `pool="last"` (estado en el instante de decision, usado en sondas de forecasting) y `pool="mean"` (media sobre parches, usado en analisis latentes).
- Normalizacion por vista: incorpora 11 canales calculados en carga con estadisticas de normalizacion y geometria de ventana, lo que permite adaptar la representacion a distintas vistas o ventanas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No dispone de tool calling, function calling ni soporte de agentes; no es un modelo conversacional ni multilingue.
- No dispone de modo de pensamiento (thinking mode) ni de decodificacion especulativa.

## Casos de uso

- Sondas de forecasting financiero: congelar el encoder y entrenar una cabeza ligera sobre el embedding del ultimo parche (`pool="last"`) para predecir retornos o volatilidad a horizontes cortos; el modelo aporta una representacion ya entrenada de la microestructura a 1 Hz.
- Analisis latente y agrupamiento de regimenes de mercado: usar el embedding medio por ventana (`pool="mean"`) para clusterizar dias o tickers y estudiar cambios de regimen sin necesidad de etiquetas.
- Evaluacion walk-forward sin fuga de datos: al existir un checkpoint por mes, entrenado solo con los seis meses previos, se puede montar un protocolo de backtesting donde el encoder de cada mes nunca ha visto el periodo evaluado.
- Deteccion de anomalias en microestructura: embeddings de ventanas de 1 Hz sobre los canales de bid/ask y tamanos permiten detectar desviaciones respecto a la distribucion historica, util en monitorizacion de calidad de datos de mercado.
- Reduccion de dimensionalidad en pipelines de alta frecuencia: convertir ventanas de 20 canales a vectores compactos antes de alimentar modelos posteriores, reduciendo coste computacional y almacenamiento.
- Investigacion en aprendizaje autosupervisado para series temporales: comparar TF-C con los otros 17 encoders de la coleccion TFWM, que comparten backbone y calendario de entrenamiento y solo difieren en el objetivo, para aislar el efecto de la funcion de perdida.
- Sistema de similitud entre instrumentos o sesiones: calcular similitud coseno entre embeddings de distintos tickers o dias para construir vecindarios de comportamiento y alimentar estrategias de pares o de seleccion de universo.
- Benchmark interno de arquitecturas de codificacion: servir como baseline reproducible en tareas de representacion de datos de mercado, dado que los pesos son state dicts estandar de PyTorch y se cargan sin dependencias propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que este encoder es uno de los 18 comparados en *Towards Financial World Modeling* (TFWM) y describe el protocolo de lectura (sondas de forecasting y analisis latentes), pero no incluye cifras numericas de MMLU, HumanEval, GSM8K ni de metricas financieras, y los resultados de la busqueda web no aportan datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~22M parametros en el backbone temporal, los pesos en fp32 ocupan aproximadamente 88 MB y en fp16/bfloat16 unos 44 MB; el total real es algo mayor al incluir `freq_backbone` y proyectores. Cada carpeta de checkpoint del repositorio ronda los 180 MB (0,9 GB entre cinco checkpoints).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 queda enormemente sobredimensionada para este tamano. El modelo cabe tambien en GPUs integradas y se puede ejecutar en CPU sin inconvenientes practicos.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en modelos antiguos; el cuello de botella previsible es el preprocesado de datos a 1 Hz, no la inferencia.
- Opciones de despliegue: no hay integracion con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue es PyTorch puro mediante `torch.load` sobre `model.pt`, o a traves del codigo del proyecto (`market_jepa.eval.checkpoints.load_encoder`, pendiente de publicacion). Es posible exportar manualmente a TorchScript u ONNX.
- Latencia y throughput estimados: no disponible. El unico dato de proceso es el batch de 128 usado en entrenamiento, que no permite extrapolar cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Backbone | Objetivo de entrenamiento | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TFWM encoder — TF-C (este) | Transformer 12 capas, anchura 384, patch 8, mas `freq_backbone` | Consistencia tiempo-frecuencia (TF-C, Zhang et al., 2022) | ~22M (backbone temporal) | other (`derived-market-data`) | 5 checkpoints publicos en HuggingFace; codigo de entrenamiento no publico |
| Otros encoders de la coleccion TFWM (17 restantes, p. ej. TS2Vec) | Mismo backbone y mismo calendario de 12 pasadas sobre spans de seis meses | Distinto objetivo autosupervisado por encoder | no disponible | no disponible (probablemente la misma licencia de la coleccion) | Publicos en la coleccion TFWM Pre-Trained Encoders de HuggingFace |
| Modelos fundacionales de series temporales de proposito general (Chronos, Moirai, TimesFM, entre otros) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion significativa que permite la informacion disponible es interna al proyecto TFWM: segun la model card, los 18 encoders comparten backbone y se entrenan con 12 pasadas sobre los mismos spans de seis meses, de modo que las diferencias observadas se atribuyen principalmente al objetivo de entrenamiento. No se aportan cifras de rendimiento para ninguno de ellos.

## Limitaciones y advertencias

- Estado de pre-lanzamiento: la propia model card advierte de que los pesos y el codigo que los carga estan en desarrollo y que el contenido y la estructura pueden cambiar sin aviso.
- Codigo de entrenamiento no publico: `market_jepa` y `stable_finance` no estan disponibles, por lo que la reproducibilidad del entrenamiento es limitada.
- Licencia restrictiva: `license: other` con `license_name: derived-market-data`. Al derivar de datos de mercado, es previsible que existan restricciones de redistribucion y de uso comercial; conviene revisar los terminos antes de cualquier despliegue productivo.
- Un checkpoint no reentrenable: el de `2019-09/` se entreno con datos de 2019-03 a 2019-08, fuera del dataset liberado, por lo que no puede reproducirse a partir de Market-1T.
- Cobertura temporal estrecha: los datos abarcan de 2019-07 a 2020-12, un periodo con condiciones de mercado atipicas (incluida la crisis de marzo de 2020). La generalizacion a otros regimenes no esta documentada.
- Dominio limitado: acciones estadounidenses, sesion regular, muestreo a 1 Hz. No hay evidencia de transferencia a otros mercados, otros activos, otras frecuencias ni a datos intradia fuera de sesion regular.
- Sin benchmarks publicados: no hay ninguna cifra verificable de rendimiento predictivo, lo que impide justificar su uso en produccion solo con la informacion disponible.
- Riesgo de sobreajuste y de deriva: al entrenarse sobre spans de seis meses con 12 pasadas, la representacion puede capturar particularidades de cada periodo; las comparaciones entre meses deben hacerse con cuidado.
- Riesgo de falsas señales: como extractor de caracteristicas sobre datos financieros ruidosos, sus embeddings pueden generar patrones espurios si se usan directamente como señal de trading sin validacion fuera de muestra.
- No aplica el riesgo de alucinacion en sentido generativo (el modelo no produce texto), pero si el riesgo de interpretar embeddings como predicciones con un significado que no tienen.
- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgo ni la composicion exacta del universo de tickers.
- Se ignora cualquier `pool` pasado en un `config` separado: al cargar con `from_pretrained` se usa el `pool` de `config.json` (`mean` en todos los encoders autosupervisados). Para obtener el readout de ultimo parche hay que fijar `.pool = "last"` en cada sub-backbone despues de cargar (`backbone` y tambien `swa_backbone` en TS2Vec, `freq_backbone` en TF-C).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-tfc
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Directorio de datos `1Hz_mosaic_mnth`: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Referencia del objetivo TF-C: Zhang et al., 2022 (citado en la model card; no se proporciona enlace al paper en la informacion disponible)
- Los resultados de la busqueda web no contienen enlaces relevantes sobre este modelo: las entradas devueltas corresponden a definiciones del termino frances "fin" en diccionarios, sin relacion con el proyecto.

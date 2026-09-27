# fin-ai-lab/tfwm-supervised-spread

## Resumen

TFWM encoder — Supervised (spread) es un codificador de series temporales financieras publicado por fin-ai-lab dentro de la familia de modelos *Towards Financial World Modeling* (TFWM). Se trata de un transformer de aproximadamente 22 millones de parametros (12 capas, anchura 384, 6 cabezas de atencion) que consume datos de renta variable estadounidense en horario regular a 1 Hz, con 20 canales de entrada (9 canales de mercado y 11 canales de informacion de vista calculados en tiempo de carga).

El modelo es un codificador supervisado entrenado de extremo a extremo junto a una cabeza MLP para ordenar la seccion cruzada de acciones segun el cambio en el *quoted spread* (diferencial cotizado) en los siguientes 900 segundos, mediante una perdida de ranking por pares. Cada celda de entrenamiento corresponde a un par (dia, ancla de 5 minutos) con 16 acciones extraidas de la misma seccion cruzada, y el objetivo se calcula estrictamente con datos posteriores al ancla, evitando fuga de informacion.

Su relevancia actual es acotada pero especifica: forma parte de un conjunto de 18 codificadores que comparten columna vertebral y solo difieren en el objetivo de entrenamiento, lo que lo convierte en una pieza util para estudiar empiricamente que objetivos de representacion funcionan mejor en microestructura de mercado. Es un artefacto en estado de pre-publicacion (los pesos y el codigo de carga son un trabajo en curso) y el codigo de entrenamiento (`market_jepa`, `stable_finance`) todavia no es publico. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, anchura 384, 6 cabezas de atencion, MLP 1536, patch 8, posiciones sinusoidales) |
| Parametros totales | aproximadamente 22 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en precision nativa) |
| Idiomas soportados | no disponible (modelo de series temporales de mercado; no procesa lenguaje) |
| Licencia | other / derived-market-data (derived-market-data) |
| Formato de pesos | PyTorch state dicts (`.pt`: `backbone.pt` + `head.pt`), sin `config.json` |
| Canales de entrada | 20 (9 de mercado: `bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`; mas 11 canales de informacion de vista) |
| Frecuencia de datos | 1 Hz, horario regular de renta variable estadounidense |
| Tarea | feature-extraction (ranking del cambio de *quoted spread* a 900 s) |
| Tamano del repositorio | 0,5 GB |
| Libreria | pytorch |
| Checkpoints | 5 (uno por mes de evaluacion: 2019-09, 2020-01, 2020-08, 2020-09, 2020-12) |

## Arquitectura y entrenamiento

La columna vertebral es un transformer de 12 capas con anchura 384, 6 cabezas de atencion, MLP de 1536 y tamano de patch 8, con codificacion posicional sinusoidal, que suma unos 22 millones de parametros. La entrada son datos de renta variable estadounidense a 1 Hz en horario regular, con 20 canales: 9 canales de mercado y 11 canales de informacion de vista calculados en tiempo de carga (estadisticas de normalizacion por vista y geometria de ventana).

El entrenamiento es supervisado de extremo a extremo: al backbone se le acopla una cabeza MLP que aprende a ordenar la seccion cruzada de acciones segun el cambio en el *quoted spread* en los siguientes 900 segundos, optimizando una perdida de ranking por pares. Cada celda de entrenamiento es un par (dia, ancla de 5 minutos) con 16 acciones de la misma seccion cruzada, y el objetivo se computa solo con datos estrictamente posteriores al ancla. El calendario de entrenamiento consiste en 12 pasadas sobre el mismo tramo de seis meses, con tasa de aprendizaje base 0,0002, weight decay 0,05 y batch efectivo de 256. El pooling configurado durante el entrenamiento es `last`.

Los datos de entrenamiento provienen del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore` (subcarpeta `1Hz_daystore/`), organizado por dia: un dia de negociacion por registro, con todos los tickers y los objetivos precalculados, de modo que cada celda de entrenamiento es una seccion cruzada del mismo dia. Segun la model card, este es uno de los 18 codificadores comparados en *Towards Financial World Modeling*; todos comparten backbone y regimen de 12 pasadas sobre los mismos tramos de seis meses, por lo que las diferencias entre ellos provienen principalmente del objetivo de entrenamiento.

## Capacidades

- Extraccion de caracteristicas (feature extraction) a partir de series temporales de microestructura de mercado a 1 Hz.
- Generacion de embeddings por patch y representaciones agregadas de la seccion cruzada de acciones.
- Ranking de acciones segun el cambio esperado del *quoted spread* a un horizonte de 900 segundos (cabeza de prediccion entrenada).
- Dos modos de lectura documentados: `pool="last"` (estado en el instante de decision) para sondas de prediccion, y `pool="mean"` (media sobre patches) para analisis latente.
- Inferencia sobre datos de un dia bursatil completo por registro, con normalizacion por vista aplicada en carga.
- Integracion como codificador preentrenado dentro de pipelines de investigacion en modelado de mundo financiero (TFWM).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- Capacidades multilingues: no aplica.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Prediccion del coste de liquidez: el modelo ordena la seccion cruzada de acciones por el cambio esperado del *quoted spread* a 900 s, lo que permite anticipar que nombres se ensancharan antes de ejecutar ordenes y ajustar la urgencia de ejecucion.
- Enrutamiento inteligente de ordenes (smart order routing): los rankings de spread a corto plazo se pueden consumir como senal auxiliar para decidir donde y cuando enviar ordenes, reduciendo coste de transaccion esperado.
- Extraccion de caracteristicas para modelos downstream: el embedding del ultimo patch (`pool="last"`) se puede congelar y usar como entrada de un modelo de riesgo o de una regresion de retornos, en lugar de ingenieria de caracteristicas manual.
- Investigacion en representaciones financieras: con `pool="mean"` se pueden hacer analisis latentes (clustering de regimenes, analisis de vecinos, transferencia entre activos) sobre las representaciones aprendidas.
- Comparacion controlada de objetivos de entrenamiento: al formar parte de los 18 encoders TFWM que comparten backbone y calendario, sirve para aislar el efecto del objetivo supervisado de ranking frente a objetivos auto-supervisados.
- Analisis de regimenes de liquidez: aplicado a ventanas de mercado turbulentas (por ejemplo, el tramo 2020-02 a 2020-03 cubierto por el checkpoint de 2020-08), permite estudiar como cambian las representaciones cuando el spread se desestabiliza.
- Validacion walk-forward reproducible: los cinco checkpoints estan alineados con meses de evaluacion concretos y nunca vieron el mes evaluado, lo que facilita montar protocolos de validacion temporal sin fuga de informacion.
- Docencia y prototipado: al ser un modelo de unos 22 millones de parametros, se puede cargar y ejecutar en un portatil para reproducir analisis de microestructura sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que cada carpeta de checkpoint incluye un fichero `xs_ic.json` con el IC (information coefficient) de la seccion cruzada de la cabeza sobre el mes de evaluacion, pero no se proporcionan los valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con unos 22 millones de parametros, los pesos ocupan aproximadamente 88 MB en fp32 y unos 44 MB en fp16 o bf16, a lo que hay que anadir las activaciones de la ventana procesada y la cabeza MLP.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4070 o superior es mas que suficiente para inferencia.
- Si cabe en GPU de consumo: si, con margen amplio, en practicamente cualquier GPU de consumo moderna (y tambien en CPU para lotes pequenos).
- Opciones de despliegue: los pesos son state dicts PyTorch planos (`backbone.pt`, `head.pt`); la carga documentada se hace con `market_jepa.eval.checkpoints.load_encoder`, cuyo codigo no es publico todavia, o bien con `torch.load(..., weights_only=True)`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y estos servidores no son aplicables a un codificador de series temporales.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio completo ocupa 0,5 GB; se puede descargar un unico mes con `snapshot_download(..., allow_patterns=["2020-12/*"])`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos externos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-supervised-spread | ~22 M | no disponible | no disponible (solo `xs_ic.json` por checkpoint) | derived-market-data | pesos publicos, codigo de carga pendiente |
| Otros 17 encoders de la coleccion TFWM | mismo backbone (~22 M) | no disponible | no disponible | no disponible | coleccion publicada por fin-ai-lab |
| Codificadores financieros de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado de pre-publicacion: la propia model card advierte de que los pesos y el codigo que los carga son un trabajo en curso y que el contenido y la disposicion pueden cambiar sin aviso.
- El codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico, lo que dificulta la reproducibilidad completa del pipeline.
- Los checkpoints supervisados no incluyen `config.json`; el pooling guardado en la configuracion no aplica y hay que fijar `.pool` manualmente tras la carga, lo que es una fuente de error.
- Cobertura temporal limitada: los cinco checkpoints cubren meses de 2019 y 2020. Los regimenes de mercado posteriores no estan representados y el riesgo de deriva de distribucion (regime shift) es alto.
- El checkpoint `2019-09/` se entreno con datos (2019-03 a 2019-08) que quedan fuera del dataset publicado (Market-1T cubre 2019-07 a 2020-12), por lo que no se puede reentrenar a partir de los datos liberados.
- Alcance restringido: solo renta variable estadounidense en horario regular, a 1 Hz y con 20 canales concretos. No cubre otros mercados, otros activos ni otras frecuencias temporales.
- Objetivo unico: la cabeza esta entrenada para el cambio del *quoted spread* a 900 s; su uso para retornos, volumen u otros objetivos no esta validado.
- Sesgos potenciales: al muestrear 16 acciones por celda y ancla de 5 minutos, la representacion puede estar sesgada hacia los nombres y horarios mas representados en el dataset.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, tool calling ni agentes, y no tiene sentido hablar de alucinacion linguistica. El riesgo equivalente es el de sobreajuste a patrones espurios de microestructura.
- Licencia `derived-market-data` (etiquetada como `other`): al derivar de datos de mercado, las condiciones de uso comercial no estan explicitadas en la informacion disponible y deben verificarse antes de cualquier uso en produccion.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-supervised-spread
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore
- Subcarpeta del dataset (`1Hz_daystore/`): https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore/tree/main/1Hz_daystore
- Paper *Towards Financial World Modeling* (TFWM): no disponible (citado en la model card sin enlace)
- Repositorio de codigo `market_jepa`: no disponible (publicacion pendiente)
- Repositorio de codigo `stable_finance`: no disponible (publicacion pendiente)

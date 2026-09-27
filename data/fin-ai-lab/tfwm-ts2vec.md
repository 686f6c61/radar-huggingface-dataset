# fin-ai-lab/tfwm-ts2vec

## Resumen

tfwm-ts2vec es un codificador (encoder) de series temporales financieras desarrollado por fin-ai-lab como parte del proyecto *Towards Financial World Modeling* (TFWM). No es un modelo generativo ni un modelo de lenguaje: su funcion es transformar datos de mercado de acciones estadounidenses muestreados a 1 Hz en representaciones vectoriales reutilizables por modelos posteriores. La arquitectura es un transformer de 12 capas, anchura 384, 6 cabezas de atencion, MLP de 1536 y posiciones sinusoidales, con un total de aproximadamente 22 millones de parametros y un tamano de parche de 8.

El modelo se entrena con aprendizaje autosupervisado siguiendo el metodo TS2Vec (Yue et al., 2022), basado en aprendizaje contrastivo jerarquico sobre marcas de tiempo e instancias. Forma parte de una comparativa de 18 codificadores que comparten exactamente el mismo backbone y el mismo regimen de entrenamiento (12 pasadas sobre el mismo periodo de seis meses), de modo que las diferencias de rendimiento entre ellos se atribuyen principalmente al objetivo de entrenamiento y no a la arquitectura o al volumen de datos.

Su relevancia actual es acotada pero clara: es un artefacto de investigacion en estado de pre-publicacion (los pesos y el codigo que los carga pueden cambiar sin aviso, y el codigo de entrenamiento `market_jepa` y `stable_finance` todavia no es publico). Se distribuye como cinco checkpoints independientes, uno por mes de evaluacion, y esta pensado para usarse como extractor de caracteristicas en experimentos de prevision y de analisis latente sobre datos de mercado, no para despliegues de produccion directos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder), 12 capas, anchura 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales |
| Parametros totales | Aproximadamente 22 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la model card no especifica el numero de parches ni la ventana de entrada. Cada parche cubre 8 pasos a 1 Hz |
| Tipos de cuantizacion | No disponible; no se publican variantes cuantizadas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje); la model card no declara idiomas |
| Licencia | `other`, con `license_name: derived-market-data` |
| Formato de pesos | PyTorch `model.pt` (state dict con `backbone` y `swa_backbone`), `config.json` y `train_meta.json` |
| Canales de entrada | 20 (9 de mercado: `bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`; mas 11 canales de informacion de vista calculados en tiempo de carga) |
| Pooling por defecto | `mean` (configurable a `last` para sondas de prevision) |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | `feature-extraction` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El backbone es un transformer estandar de 12 capas con anchura 384, 6 cabezas de atencion, MLP de 1536 y codificacion posicional sinusoidal. Trabaja sobre parches de 8 muestras temporales de datos de acciones estadounidenses en horario regular a 1 Hz. La entrada tiene 20 canales: 9 canales de mercado (precios de compra y venta, VWAP, maximo, minimo, tamanos de compra y venta, volumen y numero de operaciones) y 11 canales de informacion de vista calculados en el momento de la carga, que incluyen estadisticas de normalizacion por vista y geometria de la ventana. El objetivo de entrenamiento es el de TS2Vec: aprendizaje contrastivo jerarquico que opera simultaneamente sobre marcas de tiempo e instancias.

Los datos de entrenamiento provienen del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, en la ruta `1Hz_mosaic_mnth/`, con un registro por par ticker-dia sobre una rejilla de 1 Hz ya rellenada y mezclado dentro de cada mes. El regimen de entrenamiento es de 12 pasadas sobre un tramo de seis meses, con learning rate base de 0,001, weight decay de 0,05 y tamano de lote de 128. Todos los codificadores de la comparativa TFWM comparten backbone y numero de pasadas, de manera que solo cambia el objetivo.

La innovacion destacable no esta en la arquitectura sino en el diseno experimental: se publica un checkpoint por mes de evaluacion, entrenado exclusivamente con los seis meses inmediatamente anteriores, de modo que ninguna muestra de evaluacion fue vista durante el entrenamiento. Ademas se documenta un detalle de lectura poco habitual: el pooling guardado en `config.json` es `mean` en todos los codificadores autosupervisados, y para obtener la lectura de ultimo parche (`pool="last"`, la que usa el articulo para las sondas de prevision) hay que sobrescribir el atributo en cada sub-backbone despues de cargar (`backbone` y tambien `swa_backbone` en TS2Vec).

## Capacidades

- Extraccion de caracteristicas: genera embeddings de series temporales de mercado a 1 Hz, con dos modos de lectura documentados (`pool="last"` para el estado en el momento de decision, `pool="mean"` para analisis latente).
- Aprendizaje de representaciones autosupervisado: no requiere etiquetas; el objetivo contrastivo jerarquico opera sobre marcas de tiempo e instancias.
- Soporte de multiples ventanas historicas: se distribuyen cinco checkpoints, uno por mes de evaluacion, con corte temporal estricto para evitar filtracion de informacion.
- Integracion en pipelines de PyTorch: los archivos son state dicts planos cargables con `torch.load(..., weights_only=True)` sin necesidad del codigo del proyecto.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento en multiples pasos.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural de ningun tipo.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- El autor declara que el codigo de carga (`market_jepa.eval.checkpoints.load_encoder`) se publicara mas adelante; la interfaz exacta puede cambiar.

## Casos de uso

- Sondas de prevision sobre datos de mercado: usar el embedding del ultimo parche (`pool="last"`) como estado en el momento de la decision y entrenar encima un clasificador o regresor lineal para predecir el movimiento del siguiente intervalo. Es el uso para el que el autor disena explicitamente la lectura.
- Analisis latente de regimenes: aplicar `pool="mean"` sobre la secuencia de parches y agrupar los embeddings resultantes (k-means, UMAP) para caracterizar regimenes de volatilidad o liquidez dentro de un mes concreto.
- Extraccion de caracteristicas para modelos tabulares posteriores: generar embeddings por ticker-dia y alimentar con ellos modelos de gradient boosting, evitando tener que disenar a mano indicadores tecnicos sobre los 20 canales de entrada.
- Deteccion de anomalias en microestructura: comparar la distancia entre el embedding de una ventana y la distribucion historica de embeddings del mismo ticker para senalar episodios atipicos de liquidez u operativa.
- Investigacion comparativa de objetivos de entrenamiento: usar este checkpoint junto con los otros 17 de la coleccion TFWM para reproducir o extender el estudio de *Towards Financial World Modeling* sobre exactamente el mismo backbone y los mismos datos.
- Validacion walk-forward sin filtracion: encadenar los checkpoints de 2020-01, 2020-08, 2020-09 y 2020-12 en orden cronologico, evaluando cada uno solo en su mes asignado, para simular un despliegue realista que nunca ve el futuro.
- Preentrenamiento de dominio para transferencia: partir de los pesos y hacer fine-tuning sobre otro universo de activos o sobre otra frecuencia de muestreo, aprovechando que el backbone son 22 millones de parametros y el ajuste es barato en GPU.
- Analisis de sensibilidad a la normalizacion: los 11 canales de informacion de vista y los ajustes de normalizacion quedan registrados en `train_meta.json`, lo que permite auditar como afecta la normalizacion por vista a las representaciones resultantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (ni de prevision, ni de recuperacion, ni comparativas cuantitativas con los otros 17 codificadores de la coleccion), y la busqueda web realizada no devolvio resultados relevantes sobre este modelo. El unico dato de rendimiento indirecto es el regimen de entrenamiento: 12 pasadas sobre seis meses con lote de 128 y learning rate base de 0,001.

## Requisitos de hardware

- VRAM de pesos (estimacion a partir del recuento de parametros de aproximadamente 22 millones, no publicada por el autor): alrededor de 88 MB en fp32, 44 MB en fp16 y 22 MB en int8, por checkpoint.
- VRAM total de inferencia: depende de la longitud de la secuencia de entrada, que la model card no especifica. Con ventanas de pocos miles de parches, el consumo deberia mantenerse muy por debajo de 1 GB en fp32, pero no hay cifras publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para el modelo en si. Es perfectamente viable en RTX 3060, RTX 4090, A100 o H100; en estas dos ultimas el cuello de botella sera la lectura de datos, no el calculo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: PyTorch nativo mediante state dict (`torch.load`). No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni llama a GGUF. La exportacion a TorchScript u ONNX no esta documentada y requeriria trabajo propio.
- Almacenamiento: el repositorio completo ocupa 0,9 GB, y la descarga permite filtrar por mes con `allow_patterns` (por ejemplo, `["2020-12/*"]`) para bajar solo un checkpoint.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Objetivo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-ts2vec (este modelo) | ~22 M | No disponible | Contrastivo jerarquico TS2Vec sobre marcas de tiempo e instancias | `derived-market-data` | Pesos en HuggingFace, estado pre-release |
| Otros codificadores de la coleccion TFWM | ~22 M (mismo backbone) | No disponible | Distintos objetivos; todos comparten backbone y 12 pasadas sobre los mismos seis meses | `derived-market-data` | Pesos en HuggingFace; TF-C usa ademas un `freq_backbone` |
| TS2Vec original (Yue et al., 2022) | Depende de la configuracion del usuario | Depende de la configuracion | Contrastivo jerarquico, implementacion de referencia sobre series temporales genericas | No disponible en esta ficha | Codigo y articulo publicos |
| Modelos de series temporales genericos preentrenados (por ejemplo, variantes tipo transformer para forecasting) | No disponible | No disponible | Variable | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, objetivo, licencia y disponibilidad.

## Limitaciones y advertencias

- Estado pre-release: el propio autor advierte de que los pesos y el codigo que los carga son un trabajo en curso y que el contenido y la disposicion pueden cambiar sin aviso.
- Codigo de entrenamiento no publico: `market_jepa` y `stable_finance` no estan disponibles, por lo que no es posible reproducir el entrenamiento de extremo a extremo con lo publicado.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa en la informacion disponible sobre la calidad de las representaciones.
- Cobertura temporal limitada: los cinco checkpoints evaluan meses de 2019 y 2020. El tramo 2019-07 a 2020-12 incluye el shock de mercado de marzo de 2020, lo que puede sesgar la evaluacion si se usa como proxy de regimenes normales.
- Checkpoint no reproducible: el checkpoint `2019-09/` se entreno con el tramo 2019-03 a 2019-08, que queda fuera del dataset publicado (`Market-1T` cubre 2019-07 a 2020-12); ese encoder no se puede reentrenar a partir de los datos liberados.
- Restricciones de licencia: la licencia es `other` con nombre `derived-market-data`, es decir, derivada de datos de mercado. No es una licencia estandar de codigo abierto y no se detallan en la model card los terminos exactos de uso comercial, redistribucion ni atribucion. Hay que revisar los terminos completos antes de cualquier uso en produccion.
- Ambito de datos restringido: solo acciones estadounidenses en horario regular, a 1 Hz, con una rejilla rellenada. No cubre criptoactivos, divisas, futuros ni negociacion extendida, y el rellenado de la rejilla puede introducir artefactos en periodos de baja actividad.
- Riesgo de sesgo de supervivencia y de composicion del universo: la model card no detalla como se seleccionaron los tickers ni si se excluyeron los que dejaron de cotizar.
- No es un modelo de lenguaje: no cabe esperar generacion de texto, dialogo, codigo ni razonamiento simbolico. Tampoco hay riesgo de alucinacion en el sentido habitual, pero si riesgo de extrapolacion incorrecta si se aplican los embeddings fuera de la distribucion de entrenamiento.
- Longitud de contexto no documentada: no se especifica cuantos parches admite la entrada, lo que dificulta planificar el consumo de memoria y el coste por inferencia.
- Cero adopcion registrada: 0 descargas y 0 likes en el momento de redactar esta ficha, sin comunidad que haya validado los pesos de forma independiente.
- La lectura por defecto (`mean`) no es la que el articulo usa para las sondas de prevision (`last`); usar la configuracion equivocada degrada los resultados sin aviso. Ademas, hay que sobrescribir el pooling en todos los sub-backbones tras la carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-ts2vec
- Coleccion TFWM Pre-Trained Encoders (los 18 codificadores): https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Directorio de datos `1Hz_mosaic_mnth/`: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Referencia del metodo TS2Vec (Yue et al., 2022): https://arxiv.org/abs/2106.10466

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo ni sobre el proyecto TFWM; los resultados obtenidos correspondian a definiciones del termino frances "fin" y no se han incluido.

# geotessera/TESSERA-V-2.0-2B-S

## Resumen

TESSERA v2 Small (7,11 M de parámetros) es un encoder geospacial por píxel desarrollado por la Universidad de Cambridge (ucam-eo) para representar series temporales anuales de observaciones satelitales Sentinel-2 (multiespectral) y Sentinel-1 (SAR). Forma parte de la familia TESSERA v2, descrita en el preprint *TESSERA v2: Scaling Pixel-wise Earth Foundation Models* (arXiv:2607.03949), y ha sido destilado del teacher de 2 060 millones de parámetros (geotessera/TESSERA-V-2.0-2B-Teacher) mediante un objetivo de destilación Matryoshka. El modelo emite un embedding de 128 dimensiones cuyas primeras K coordenadas (K ∈ {16, 32, 64, 128}) son utilizables de forma independiente, lo que permite ajustar el equilibrio entre almacenamiento y precisión sin necesidad de reentrenar.

Su relevancia radica en que ofrece una representación compacta y multimodal de la historia anual de un píxel (hasta 256 observaciones válidas), pensada para tareas de análisis geoespacial a gran escala como monitoreo ambiental, mapeo de cultivos o estimación de biomasa. Al ser un modelo de solo 7,11 M de parámetros, es viable desplegarlo en entornos con recursos limitados, a diferencia del teacher de 2B que se publica principalmente como objetivo de destilación. La licencia es CC0 (dominio público), lo que facilita su uso comercial y académico sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos backbones por modalidad (Sentinel-2 y Sentinel-1 fusionado), cada uno con MLP band embedding + codificacion posicional sinusoidal day-of-year, Transformer encoder de 4 capas post-LN (d_model=256, 4 cabezas, FFN=1024, ReLU) y pooling de atencion softmax de una sola cabeza sobre el tiempo; fusion por concatenacion en MLP dim_reducer con LayerNorm no afine. Salida 128-d. |
| Parametros totales | 7 112 322 (7,11 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision por pixel); contexto temporal anual multi-fecha con hasta 256 observaciones por pixel |
| Tipos de cuantizacion | Matryoshka truncation (primeras 16/32/64/128 dims) y cuantizacion lineal int8 (via quantize.py) |
| Idiomas soportados | Ingles (etiquetas y documentacion); el modelo procesa datos geoespaciales, no texto |
| Licencia | CC0-1.0 (dominio publico) |
| Formato de pesos | PyTorch (formato de archivo no especificado en la model card) |

## Arquitectura y entrenamiento

La arquitectura combina dos backbones independientes: uno para Sentinel-2 (multiespectral) y otro para Sentinel-1 (SAR, con las pasadas ascendente y descendente normalizadas por separado antes de fusionarse). Cada backbone aplica un MLP de embedding por banda, una codificacion posicional sinusoidal basada en el día del año, un Transformer encoder de 4 capas con post-LayerNorm (d_model=256, 4 cabezas, FFN de 1024 unidades con ReLU) y un pooling de atencion softmax de una sola cabeza sobre la dimension temporal. Las salidas de ambos backbones se concatenan y pasan por un MLP reductor que termina en una LayerNorm no afine, produciendo un embedding de 128 dimensiones con escala fija.

El entrenamiento se realizo mediante destilacion desde el teacher de 2B, usando un objetivo Matryoshka: para cada prefijo K ∈ {16, 32, 64, 128} se entrena una cabeza lineal separada que reconstruye el embedding completo del teacher congelado a partir de las primeras K coordenadas del estudiante. Este mecanismo impone un orden en las coordenadas del estudiante que la auto-supervision por si sola (p. ej., Barlow Twins) no puede proporcionar, ya que los subspacios identificados por objetivos de reduccion de redundancia son invariantes a rotaciones. Las cabezas de proyeccion se descartan en inferencia; el checkpoint contiene solo el encoder.

## Capacidades

- Extraccion de embeddings por píxel a partir de series temporales anuales de Sentinel-2 L2A y Sentinel-1 RTC, con fusion multimodal de datos SAR y multiespectrales.
- Embeddings Matryoshka de 128 dimensiones con prefijos utilizables de 16, 32, 64 y 128 dimensiones sin reentrenar.
- Compresion adicional mediante cuantizacion lineal int8 (int8 + escala float32 por píxel) usando el script quantize.py incluido.
- Manejo de series temporales de longitud variable, agrupando el numero de observaciones validas en bins de 8, 16, ..., 256.
- Representacion anual de 10 metros de resolucion espectral-temporal, adecuada para tareas de clasificacion, regresion y deteccion de cambios.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Monitoreo ambiental: los embeddings anuales permiten detectar cambios en la cobertura del suelo entre anos, comparando las representaciones de un mismo píxel en diferentes periodos para identificar deforestacion, urbanizacion o degradacion de ecosistemas.
- Mapeo de habitats: se pueden entrenar clasificadores lineales o MLP ligeros sobre los embeddings para cartografiar tipos de habitat a escala regional, aprovechando la fusion de Sentinel-1 y Sentinel-2 que captura tanto propiedades estructurales como espectrales.
- Estimacion de carbono y biomasa: los embeddings sirven como caracteristicas de entrada para modelos de regresion que predicen biomasa aerea o contenido de carbono, combinando la informacion temporal y multimodal que el encoder comprime.
- Monitoreo agricola y mapeo de cultivos: la serie temporal anual permite distinguir tipos de cultivo y estados fenologicos; los embeddings pueden alimentar clasificadores para generar mapas de cultivos por temporada.
- Analisis de seguridad alimentaria: a partir de los mapas de cultivos y estimaciones de productividad derivadas de los embeddings, se pueden construir indicadores de riesgo de inseguridad alimentaria en regiones dependientes de la agricultura.
- Investigacion de cambio climatico: los embeddings anuales permiten analizar tendencias multi-anuales en variables como la vegetacion o la humedad del suelo, sirviendo como entrada para estudios de impacto climatico a largo plazo.
- Planificacion de uso sostenible del suelo: las representaciones compactas pueden integrarse en sistemas de decision territorial para evaluar la idoneidad de parcelas, monitorizar cumplimiento normativo o detectar usos no autorizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint especifico. La model card advierte explicitamente que los puntajes reportados en el preprint de TESSERA v2 se midieron en estudiantes destilados del teacher de 1B y no describen estos checkpoints; los numeros para los estudiantes destilados del teacher de 2B se publicaran por separado.

## Requisitos de hardware

- Al ser un modelo de 7,11 M de parametros, el peso en fp32 ocupa aproximadamente 28 MB (7 112 322 × 4 bytes), y en fp16 unos 14 MB. La VRAM necesaria para inferencia es despreciable en cualquier GPU moderna.
- Es ejecutable en CPU sin problemas; no se requiere GPU para obtener latencias razonables en inferencia por píxel, aunque para procesar tiles completos una GPU acelera el calculo.
- Cualquier GPU consumer (p. ej., RTX 3060 o superior) es suficiente; tambien se puede ejecutar en hardware integrado o en instancias cloud de baja gama.
- Opciones de despliegue: al ser un modelo PyTorch, puede integrarse en pipelines con TorchServe, ONNX Runtime o directamente en scripts de procesamiento batch. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- No se dispone de datos publicados de latencia o throughput para este checkpoint.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (encoders geoespaciales por píxel con destilacion Matryoshka) en la documentacion proporcionada. Existen otros modelos de teledeteccion como Prithvi (IBM/NASA) o Clay, pero no se han publicado comparativas cuantitativas con TESSERA v2 Small en la informacion disponible.

## Limitaciones y advertencias

- Los embeddings son representaciones anuales de 10 m, no imagenes crudas ni datos de monitoreo en tiempo real; no son adecuados para aplicaciones que requieran deteccion de cambios sub-anual o resolucion temporal fina.
- La precision puede degradarse en regiones o anos con muy pocas observaciones validas (por ejemplo, alta cobertura nubosa o fallos del sensor); se recomienda validar el rendimiento para la tarea y geografia especificas.
- El orden de los canales de entrada de Sentinel-2 usado por este modelo NO es el convencional ascendente por longitud de onda; es imprescindible consultar el contrato de entrada en la model card antes de preparar los datos.
- Los benchmarks del preprint de TESSERA v2 no se aplican a este checkpoint; los resultados para estudiantes destilados del teacher de 2B aun no se han publicado.
- Aunque la licencia CC0 permite uso comercial sin restricciones, el modelo se publica con intencion de investigacion cientifica y analisis geoespacial; no se garantiza su idoneidad para aplicaciones criticas.
- El repositorio de HuggingFace muestra un tamano de 0.0 GB y cero descargas, lo que podria indicar que los pesos no estan alojados ahi o que la ficha esta incompleta; verificar la disponibilidad real del checkpoint antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geotessera/TESSERA-V-2.0-2B-S
- Teacher (2B): https://huggingface.co/geotessera/TESSERA-V-2.0-2B-Teacher
- Preprint: https://arxiv.org/abs/2607.03949

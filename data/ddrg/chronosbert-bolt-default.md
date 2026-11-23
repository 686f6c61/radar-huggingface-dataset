# ddrg/ChronosBERT-Bolt-Default

## Resumen

ChronosBERT-Bolt es un codificador bidireccional de tipo BERT-Small (encoder-only) preentrenado para el aprendizaje de representaciones de series temporales. Lo desarrolla el autor identificado en Hugging Face como `ddrg`, y se apoya en la representación basada en parches (patch-based) del modelo de forecasting Chronos-Bolt, combinándola con una arquitectura BERT y un objetivo de preentrenamiento de Masked Language Modeling (MLM) adaptado a series temporales.

El modelo no genera texto ni mantiene conversaciones: es un extractor de representaciones numéricas. Las series temporales se dividen en parches siguiendo la representación de Chronos-Bolt y estos parches se procesan con un encoder bidireccional entrenado para reconstruir parches enmascarados aleatoriamente. El resultado es un backbone transferible que puede afinarse para tareas posteriores, principalmente clasificación de series temporales.

Con aproximadamente 15,3 millones de parámetros y un repositorio de 0,1 GB, es un modelo muy ligero pensado para investigación y para integración en pipelines de series temporales donde se necesita un encoder compacto y rápido. Es relevante ahora por el creciente interés en adaptar arquitecturas de lenguaje (BERT) a dominios numéricos mediante tokenización por parches, un enfoque que reduce la longitud efectiva de secuencia y facilita el transfer learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-Small (encoder-only, bidireccional) con representacion de parches de Chronos-Bolt |
| Parametros totales | 15.295.776 (aprox. 15,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (definida por `context_length` en la configuracion de Chronos-Bolt, valor no publicado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT de tamano Small (bidireccional, sin decoder) que toma como entrada series temporales divididas en parches mediante la representacion de Chronos-Bolt. Cada parche se trata como una unidad de entrada y el modelo se entrena con un objetivo de Masked Language Modeling: se enmascaran parches aleatorios de la serie y el encoder debe reconstruirlos a partir del contexto bidireccional restante. Este esquema permite aprender representaciones generales de la dinamica temporal sin depender de una tarea concreta.

La model card menciona mecanismos de aumento aleatorio de parches configurables (`masking_prob`, `patch_masking_prob`, `perturbation_prob`, `patch_perturbation_prob`) que se desactivan en el momento del fine-tuning. El backbone se inicializa a partir del modelo de forecasting Chronos-Bolt y los pesos preentrenados se transfieren a la cabeza de clasificacion, que se inicializa por separado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO (poco probables en un encoder de series temporales).

## Capacidades

- Aprendizaje de representaciones de series temporales mediante encoder bidireccional.
- Fine-tuning para clasificacion de series temporales (la model card incluye un ejemplo completo con el dataset ArrowHead del UCR Archive).
- Procesamiento directo de valores numericos, con soporte de mascara de observacion para valores ausentes (`NaN`).
- Extraccion de embeddings con pooling configurable (por ejemplo, `pooling="mean"`).
- Transferencia de pesos desde el backbone de Chronos-Bolt.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues linguisticas.
- No se documentan capacidades de forecasting directo en esta variante (el backbone original de Chronos-Bolt si las tiene, pero esta ficha describe el encoder preentrenado).

## Casos de uso

- Clasificacion de series temporales: el modelo se afina con una cabeza de clasificacion sobre datasets como UCR (por ejemplo, ArrowHead), aprovechando el backbone preentrenado para reducir el coste de entrenamiento frente a un entrenamiento desde cero.
- Deteccion de anomalias en sensores industriales: las representaciones del encoder pueden alimentar un clasificador o un detector de umbral para identificar patrones anomalos en lecturas de sensores, con la ventaja de manejar valores ausentes mediante la mascara de observacion.
- Clasificacion de senales biomedicas: ECG, EEG o senales de actividad fisica pueden tratarse como series numericas y afinarse para tareas de diagnostico o monitorizacion.
- Segmentacion y etiquetado de regimenes en datos financieros: las representaciones por parches permiten distinguir fases de volatilidad o tendencia en series de precios.
- Preentrenamiento base para investigacion en representacion de series temporales: util como punto de partida ligero (15,3 M de parametros) para experimentos de transfer learning y comparativas con otros encoders.
- Extraccion de embeddings para busqueda de similitud entre series: los vectores resultantes pueden indexarse para recuperar series con patrones similares en bases de datos de series temporales.
- Clasificacion de series en entornos con recursos limitados: el tamano reducido (repositorio de 0,1 GB) permite desplegarlo en CPU o GPU de gama baja para inferencia por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 15,3 M de parametros (aprox. 61 MB de pesos), mas el overhead de activaciones y del backbone Chronos-Bolt.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU para inferencia por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: la model card usa `transformers` con la clase `ChronosBoltModelForForecasting` del paquete `chronos_pkg`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de series temporales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChronosBERT-Bolt-Default | 15,3 M | no disponible | Encoder de series temporales (MLM) | no disponible | Hugging Face |
| Chronos-Bolt (backbone original) | no disponible | no disponible | Forecasting de series temporales | no disponible | Hugging Face (referenciado) |
| BERT-Small estandar | aprox. 14-15 M | 512 tokens | NLP (encoder de texto) | Apache 2.0 (tipico) | Amplia |

La comparativa se limita a estos tres porque no se dispone de datos de benchmarks ni de otros encoders de series temporales en la informacion proporcionada. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo especializado en series temporales numericas; no es un modelo de lenguaje y no debe usarse para generacion de texto ni tareas NLP.
- No se especifica la licencia, por lo que el uso comercial queda sin garantia juridica hasta que el autor la declare.
- No se documentan sesgos, pero al ser un modelo entrenado sobre datos de series temporales no especificados, puede heredar sesgos de la distribucion de esos datos (no disponibles).
- Riesgo de alucinacion no aplicable en el sentido linguistico, pero si de sobreajuste a patrones del dataset de preentrenamiento en tareas downstream.
- La longitud de contexto no esta publicada; depende de la configuracion de Chronos-Bolt y debe consultarse en el codigo.
- La model card aparece truncada en la informacion disponible y no incluye resultados de evaluacion ni detalles del dataset de preentrenamiento.
- El modelo requiere el paquete `chronos_pkg` y clases especificas (`ChronosBoltModelForForecasting`, `ChronosBoltModelForClassification`), lo que anade dependencias no estandar frente a un `transformers` puro.
- Los resultados de busqueda web sobre "ddrg" corresponden a la International Deep Drawing Research Group y a un acronimo generico, sin relacion con el modelo; no aportan informacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/ddrg/ChronosBERT-Bolt-Default
- GitHub del proyecto: https://github.com/JuliusHanusch/ChronosBERT
- UCR Time Series Classification Archive: https://www.timeseriesclassification.com/

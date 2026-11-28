# DeepLearnPhysics/panda-v2.pilarnet-m

## Resumen

panda-v2.pilarnet-m es un codificador (encoder) de nubes de puntos para física de partículas, desarrollado por DeepLearnPhysics. Se trata del modelo profesor EMA resultante del preentrenamiento auto-supervisado Panda V2 (`panda-ssl-v2m1`) sobre un millón de eventos de PILArNet-M, un conjunto de simulaciones de una cámara de proyección temporal (TPC) de argón líquido. El modelo no es un modelo de lenguaje: es un backbone de visión 3D especializado en datos de detectores de partículas.

El modelo se distribuye a través de la librería `pimm` (particle-imaging-models) y consta de 53.415.792 parámetros en formato safetensors, con un repositorio de 8,8 GB que incluye 40 snapshots intermedios del preentrenamiento. Su relevancia radica en que ofrece un codificador preentrenado de forma auto-supervisada que puede reutilizarse como extractor de características para tareas posteriores de reconstrucción y análisis en TPC de argón líquido, un tipo de detector central en experimentos de neutrinos.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; muchos datos habituales (licencia, idiomas, benchmarks, pipeline) no están publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para nubes de puntos (point-cloud encoder) con etapas jerárquicas y pooling; detalles internos no disponibles |
| Parametros totales | 53.415.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada como nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Features de entrada | 4 por punto |
| Canales de salida (feat) | 1170 |
| Libreria | pimm |
| Tamano del repo | 8,8 GB |

## Arquitectura y entrenamiento

El modelo es un codificador para nubes de puntos diseñado para datos de TPC de argón líquido. La model card indica que se trata del encoder `panda-encoder-v2m1`, preentrenado mediante el método de auto-destilación Panda V2 (`panda-ssl-v2m1`). Los pesos publicados corresponden al profesor EMA (exponential moving average), una práctica habitual en esquemas de auto-supervisión tipo destilación para estabilizar el objetivo de entrenamiento.

El preentrenamiento se realizó sobre 1 millón de eventos de PILArNet-M simulados en una TPC de argón líquido, durante 20 épocas, lo que equivale a 208.334 pasos con un tamaño de lote de 96. La arquitectura procesa nubes de puntos con 4 características por punto y produce una representación por punto de 1170 canales tras aplicar la cadena de pooling y `upcast()`. No se detallan en la información disponible la composición exacta del dataset, el uso de RLHF/DPO (no aplicable a este dominio) ni innovaciones concretas de atención más allá de la mención a FlashAttention como backend opcional.

## Capacidades

- Extracción de características de nubes de puntos 3D procedentes de simulaciones de TPC de argón líquido.
- Codificación jerárquica con pooling: la salida de la etapa más gruesa puede "upcastarse" para obtener una representación por punto de 1170 canales.
- Preentrenamiento auto-supervisado, lo que permite su uso como backbone para fine-tuning en tareas posteriores de física de partículas.
- Selección de snapshots intermedios mediante revisiones (`01-of-40` a `40-of-40`), útil para estudiar la evolución del entrenamiento o elegir un punto de control concreto.
- Soporte de backend de atención alternativo (`attention_backend="torch"`) para GPUs sin FlashAttention.
- No dispone de generación de texto, tool calling, capacidades de agente ni multilingüismo; no es un modelo de lenguaje.

## Casos de uso

- Reconstrucción de eventos en TPC de argón líquido: el codificador transforma nubes de puntos de un evento simulado en características por punto que pueden alimentar cabezas de reconstrucción (vértices, trazas, energía), aprovechando el preentrenamiento sobre 1M de eventos de PILArNet-M.
- Fine-tuning para clasificación de partículas: se puede conectar una cabeza de clasificación sobre las 1170 características por punto y ajustar con datos etiquetados, partiendo de un backbone ya entrenado de forma auto-supervisada.
- Segmentación semántica de puntos en el detector: la representación por punto facilita tareas de etiquetado por punto (por ejemplo, distinción de trazas frente a ruido) en análisis de imágenes de partículas.
- Estudio de dinámica de entrenamiento: los 40 snapshots permiten analizar cómo evolucionan las representaciones a lo largo del preentrenamiento y elegir el checkpoint óptimo para una tarea concreta.
- Investigación en auto-supervisión para dominios científicos: sirve como referencia reproducible (librería `pimm`, pesos safetensors) para experimentos de destilación auto-supervisada en datos 3D no naturales.
- Prototipado rápido con `pimm`: la API `pimm.from_pretrained(...)` permite cargar el encoder en CUDA y obtener características en pocas líneas, adecuado para validar pipelines de análisis antes de escalar.
- Generación de embeddings para búsqueda o agrupamiento de eventos: las características por punto pueden agregarse para comparar o agrupar eventos simulados en estudios de selección de señales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 53,4 M de parámetros en fp32 el peso ronda los 0,21 GB, aunque el consumo real depende del tamaño del lote de puntos y de las activaciones intermedias.
- GPU recomendadas: no especificadas; la model card menciona ejecución en CUDA y el uso de FlashAttention cuando está disponible.
- GPU de consumo: por tamaño de parámetros cabría en GPUs de consumo (por ejemplo, RTX 4090), aunque el requisito real vendrá determinado por el número de puntos por lote y la memoria de activaciones; no hay datos confirmados.
- Opciones de despliegue: librería `pimm` (carga con `pimm.from_pretrained`); no se indican vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de la misma categoría (codificadores auto-supervisados para nubes de puntos en TPC de argón líquido) con datos verificables de parámetros, contexto o rendimiento. No disponible.

## Limitaciones y advertencias

- Modelo de dominio específico: entrenado exclusivamente sobre eventos simulados de PILArNet-M en TPC de argón líquido; no es transferible sin más a otros dominios ni a texto.
- No es un modelo de lenguaje: carece de generación de texto, razonamiento lingüístico, tool calling o capacidades de agente.
- Licencia no especificada: la ausencia de licencia publicada impide confirmar condiciones de uso comercial; conviene contactar con el autor antes de usarlo en producción.
- Sesgos: no documentados; al entrenarse solo con datos simulados, puede presentar sesgos respecto a la distribución de la simulación y no reflejar datos reales del detector.
- Riesgo de sobreajuste al simulador: el rendimiento en datos reales de un detector no está validado en la información disponible.
- La salida por punto requiere aplicar correctamente las transformaciones de evaluación de `lartpc.py`; un preprocesado incorrecto degrada las características.
- Dependencia de FlashAttention: en GPUs sin soporte hay que pasar `attention_backend="torch"`, con posible impacto en rendimiento.
- Repositorio de 8,8 GB por los 40 snapshots: la descarga completa es costosa; conviene usar la revisión concreta necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2.pilarnet-m
- Repositorio pimm (particle-imaging-models): https://github.com/DeepLearnPhysics/particle-imaging-models
- Configuración de transforms de evaluación: `configs/panda/v2/finetune/_base_/datasets/lartpc.py` dentro del repositorio pimm

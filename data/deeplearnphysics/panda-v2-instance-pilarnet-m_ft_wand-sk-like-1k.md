# DeepLearnPhysics/panda-v2-instance.pilarnet-m_ft_wand-sk-like-1k

## Resumen

`panda-v2-instance.pilarnet-m_ft_wand-sk-like-1k` es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Forma parte del detector Panda V2 (`panda-detector-v2m1`) y se construye sobre el encoder `panda-v2.pilarnet-m`, preentrenado en el conjunto PILArNet-M. El modelo resuelve el problema de identificar y separar las trazas o depósitos de energía individuales (instancias) que produce cada partícula en los detectores de tipo time projection chamber (TPC), una tarea crítica para la reconstrucción de eventos en experimentos de neutrinos.

El modelo se ha adaptado mediante LoRA (rank 16) y se ha afinado junto con la cabeza de segmentación sobre 1.000 eventos etiquetados del conjunto WAND SK-like. Los pesos publicados corresponden al mejor checkpoint de validación del experimento `panda-v2-wand-n1000-from-lar-nersc`, evaluado sobre el split de test del artículo asociado. Con 60,1 millones de parámetros y un peso de repositorio de 0,2 GB, es un modelo compacto orientado a un dominio muy específico.

Su relevancia radica en que aplica técnicas modernas de visión por computador sobre nubes de puntos (point clouds) al análisis de datos de detectores de partículas, un campo donde los métodos tradicionales de reconstrucción consumen mucho tiempo de cómputo. La integración con la librería `pimm` (particle imaging models) facilita su uso en pipelines de análisis de física experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación de instancias sobre nubes de puntos (encoder PILArNet-M + cabeza de segmentación, con adaptadores LoRA) |
| Parametros totales | 60.122.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de point cloud, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de física de partículas, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de segmentación de instancias sobre nubes de puntos, con un encoder `panda-v2.pilarnet-m` preentrenado en el conjunto PILArNet-M, que representa depósitos de energía en detectores TPC como nubes de puntos 3D. Sobre este encoder se aplica una adaptación LoRA de rango 16, que permite reutilizar el conocimiento del preentrenamiento con un coste de ajuste reducido, y se afina conjuntamente con la cabeza de segmentación del detector Panda V2 (`panda-detector-v2m1`).

El ajuste fino se realizó sobre 1.000 eventos etiquetados del conjunto WAND SK-like. Los pesos publicados corresponden al mejor checkpoint de validación de la ejecución `panda-v2-wand-n1000-from-lar-nersc`. No se dispone de información sobre el número total de tokens o eventos de preentrenamiento de PILArNet-M, la composición exacta del dataset, ni sobre el uso de técnicas de alineación como RLHF o DPO, que no aplican en este dominio. La innovación principal es la combinación de preentrenamiento a gran escala en nubes de puntos de física de partículas con adaptación eficiente mediante LoRA a un dominio concreto (WAND SK-like).

## Capacidades

- Segmentación de instancias en nubes de puntos 3D procedentes de detectores de partículas (TPC).
- Identificación y separación de las trazas o depósitos asociados a partículas individuales dentro de un evento.
- Inferencia sobre lotes de eventos mediante la API de `pimm` (`model(batch)` devuelve las instancias predichas).
- Compatibilidad con backends de atención alternativos: en GPUs sin FlashAttention se puede pasar `attention_backend="torch"`.
- Adaptación de dominio mediante LoRA, lo que permite reutilizar el encoder preentrenado en otros conjuntos de datos de física.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Reconstrucción de eventos en experimentos de neutrinos: el modelo segmenta las instancias de cada evento en el detector TPC, permitiendo separar las contribuciones de partículas individuales antes del análisis físico.
- Etiquetado y control de calidad de datos experimentales: se puede ejecutar sobre eventos nuevos para generar máscaras de instancia que sirvan como referencia o para detectar eventos anómalos.
- Preentrenamiento y ajuste fino en nuevos detectores: gracias al encoder PILArNet-M y a la adaptación LoRA, sirve como punto de partida para afinar sobre otros conjuntos de datos con pocos eventos etiquetados (el caso publicado usa 1.000).
- Aceleración de pipelines de análisis offline: sustituye o complementa métodos de reconstrucción tradicionales, reduciendo el tiempo de procesamiento por evento en grandes campañas de datos.
- Investigación en técnicas de segmentación de nubes de puntos: el modelo y su configuración de LoRA son una referencia reproducible para estudiar transferencia de dominio en datos de física.
- Integración en flujos de trabajo con `pimm`: al cargarse con `pimm.from_pretrained`, se puede incorporar en scripts de evaluación y comparación con otros modelos del ecosistema Panda V2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 60,1 millones de parámetros y pesos en safetensors (0,2 GB de repositorio), la huella en memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican en la información disponible. El modelo está pensado para ejecutarse en CUDA (`device="cuda"`) y aprovecha FlashAttention cuando está disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: librería `pimm` (carga mediante `pimm.from_pretrained`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de segmentación de instancias para física de partículas con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo es aplicable a segmentación de instancias en nubes de puntos de detectores de partículas; no sirve para tareas de lenguaje, visión general ni generación de texto.
- Entrenado y afinado sobre WAND SK-like: su rendimiento fuera de ese dominio o en detectores con características distintas no está garantizado.
- El ajuste fino se realizó con solo 1.000 eventos etiquetados, lo que puede limitar la generalización.
- Requiere preparar las entradas con las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/wc.py` del repositorio `pimm`; un preprocesado incorrecto degrada los resultados.
- En GPUs sin FlashAttention es necesario pasar `attention_backend="torch"`, lo que puede afectar al rendimiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- Riesgo de sesgos y alucinaciones en el sentido habitual no aplica, pero sí existe riesgo de predicciones erróneas en eventos atípicos o con ruido no representado en el conjunto de entrenamiento.
- Sin datos publicados de benchmarks ni de latencia, por lo que la evaluación en producción debe hacerse empíricamente.

## Enlaces

- [Hugging Face: DeepLearnPhysics/panda-v2-instance.pilarnet-m_ft_wand-sk-like-1k](https://huggingface.co/DeepLearnPhysics/panda-v2-instance.pilarnet-m_ft_wand-sk-like-1k)
- [Encoder base: DeepLearnPhysics/panda-v2.pilarnet-m](https://huggingface.co/DeepLearnPhysics/panda-v2.pilarnet-m)
- [Repositorio pimm (particle-imaging-models)](https://github.com/DeepLearnPhysics/particle-imaging-models)

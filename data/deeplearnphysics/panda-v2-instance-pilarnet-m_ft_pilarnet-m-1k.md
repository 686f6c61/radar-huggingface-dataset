# DeepLearnPhysics/panda-v2-instance.pilarnet-m_ft_pilarnet-m-1k

## Resumen

`panda-v2-instance.pilarnet-m_ft_pilarnet-m-1k` es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Se trata de un ajuste fino (fine-tuning) del codificador `panda-v2.pilarnet-m`, que fue preentrenado en el conjunto de datos PILArNet-M, un corpus de eventos de cámara de proyección temporal (TPC) de argón líquido. El modelo resultante forma parte de la familia Panda V2 y se distribuye a través de la librería `pimm` (particle imaging models).

El modelo resuelve la tarea de segmentación de instancias sobre nubes de puntos (point clouds) procedentes de detectores de partículas, es decir, identificar y separar las trazas individuales de partículas dentro de un evento. Para ello se adapta el codificador mediante LoRA de rango 16 y se entrena junto con la cabeza de segmentación sobre 1.000 eventos etiquetados de PILArNet-M. Los pesos publicados corresponden al mejor checkpoint de validación de la ejecución `panda-v2-lar-n1000-from-lar`, evaluado sobre el split de test del artículo asociado.

Con 60.427.164 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo de escala media orientado a investigación en física de partículas más que a aplicaciones de lenguaje natural. Su relevancia radica en que demuestra la viabilidad de aplicar técnicas de adaptación eficiente (LoRA) a modelos de nubes de puntos en dominios científicos especializados, reduciendo la necesidad de grandes volúmenes de datos etiquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para nubes de puntos (point cloud), familia Panda V2 con codificador PILArNet-M; detalles internos no disponibles |
| Parametros totales | 60.427.164 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (modelo de visión/física, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un segmentador de instancias sobre nubes de puntos construido a partir del codificador `panda-v2.pilarnet-m`, preentrenado en PILArNet-M. Sobre ese codificador se aplica una adaptación LoRA de rango 16, y se entrena conjuntamente con la cabeza de segmentación de instancias del detector Panda V2 (`panda-detector-v2m1`). El ajuste fino se realiza sobre 1.000 eventos etiquetados de PILArNet-M, en la ejecución denominada `panda-v2-lar-n1000-from-lar`. Los pesos publicados son el mejor checkpoint de validación según la métrica de validación de dicha ejecución.

La innovación principal es el uso de LoRA para adaptar un codificador preentrenado a la tarea de segmentación de instancias con un presupuesto de datos etiquetados reducido (1.000 eventos). El modelo admite distintos backends de atención: por defecto emplea FlashAttention, y en GPUs sin soporte para esta se debe pasar `attention_backend="torch"` a `pimm.from_pretrained`. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Segmentación de instancias sobre nubes de puntos de eventos de física de partículas (TPC de argón líquido).
- Identificación y separación de trazas individuales de partículas dentro de un evento.
- Inferencia sobre lotes (batches) de eventos mediante la API de `pimm`.
- Compatibilidad con backends de atención FlashAttention y `torch` (para GPUs sin FlashAttention).
- Adaptación mediante LoRA (rango 16) sobre un codificador preentrenado.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente de visión/nubes de puntos.
- No se documentan modos especiales como thinking mode, visión 2D o audio.

## Casos de uso

- Análisis de eventos en experimentos de TPC de argón líquido: el modelo segmenta las trazas de partículas en cada evento, permitiendo separar interacciones superpuestas y facilitar la reconstrucción posterior de vértices y momentos.
- Etiquetado asistido de datos: dado que se ajustó con solo 1.000 eventos etiquetados, puede emplearse como modelo base para preetiquetar nuevos eventos y reducir el coste de anotación manual en campañas de física de partículas.
- Investigación en reconstrucción de partículas: la salida de instancias puede alimentar pipelines de reconstrucción (clustering, asignación de hits a trazas) en análisis de neutrinos o búsquedas de física más allá del modelo estándar.
- Evaluación comparativa de métodos de segmentación: sirve como referencia reproducible (checkpoint de test del artículo) para comparar arquitecturas de nubes de puntos en el dominio de TPC.
- Prototipado en entornos de investigación con GPU: su tamaño (60 M de parámetros, 0,2 GB) permite experimentar en una sola GPU, incluidas GPUs de consumo, para validar ideas antes de escalar.
- Transferencia a otros detectores: el esquema de adaptación con LoRA sobre un codificador preentrenado puede replicarse para ajustar el modelo a nuevos detectores o condiciones experimentales con pocos datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 60,4 M de parámetros en precisión de 32 bits los pesos ocupan aproximadamente 0,24 GB, por lo que la VRAM necesaria es modesta y vendrá dominada por el tamaño de lote y las activaciones de la nube de puntos.
- GPU recomendadas: no se especifican; el modelo se ejecuta con `device="cuda"` y aprovecha FlashAttention cuando está disponible.
- GPU de consumo: por el tamaño de los pesos, es plausible que quepa en GPUs de consumo, aunque no se documenta oficialmente.
- Opciones de despliegue: librería `pimm` (API `pimm.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de segmentación de instancias en nubes de puntos para TPC de argón líquido en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de utilizarlo en producción.
- Modelo de investigación especializado: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP (MMLU, HumanEval, etc.).
- Dependencia de transformaciones de entrada concretas: requiere las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/lartpc.py` del repositorio `pimm`; un preprocesado distinto puede degradar los resultados.
- Entrenado con solo 1.000 eventos etiquetados: puede generalizar peor fuera de la distribución de PILArNet-M o ante condiciones de detector distintas.
- Requiere FlashAttention o el backend `torch` explícito en GPUs sin soporte; una configuración incorrecta puede provocar errores en tiempo de ejecución.
- Riesgo de sesgos y alucinaciones en el sentido habitual no aplica; el riesgo principal es la segmentación incorrecta de instancias en eventos con alta superposición o baja energía.
- Sin información sobre sesgos de dominio, robustez ante ruido del detector ni límites de escalado a otros experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.pilarnet-m_ft_pilarnet-m-1k
- Codificador base: https://huggingface.co/DeepLearnPhysics/panda-v2.pilarnet-m
- Repositorio `pimm`: https://github.com/DeepLearnPhysics/particle-imaging-models
- No se han encontrado en la búsqueda web otros enlaces (papers, blogs, demos) asociados a este modelo.

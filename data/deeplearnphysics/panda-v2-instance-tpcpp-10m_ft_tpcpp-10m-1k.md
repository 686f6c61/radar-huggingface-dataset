# DeepLearnPhysics/panda-v2-instance.tpcpp-10m_ft_tpcpp-10m-1k

## Resumen

panda-v2-instance.tpcpp-10m_ft_tpcpp-10m-1k es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Se construye sobre el encoder panda-v2.tpcpp-10m, preentrenado en el conjunto TPCpp-10M, y se adapta mediante LoRA (rango 16) junto con una cabeza de segmentación, afinado sobre 1.000 eventos etiquetados de TPCpp-10M. Los pesos publicados corresponden al mejor checkpoint de validación de la ejecución `panda-v2-sphenix-n1000-from-sphenix` y son los evaluados en el split de test del artículo asociado.

El modelo no es un LLM ni un modelo de lenguaje: opera sobre nubes de puntos (point clouds) procedentes de detectores de proyección temporal (TPC) y su tarea es identificar y separar instancias de partículas en los eventos. Con 59.836.824 parámetros totales y un tamaño de repositorio de 0,2 GB, está pensado para flujos de análisis de datos de experimentos como sPHENIX.

Su relevancia radica en el uso de adaptación de bajo rango (LoRA) sobre un encoder preentrenado a gran escala, lo que permite obtener un segmentador de instancias específico con solo 1.000 eventos etiquetados, un régimen de datos muy reducido para este tipo de tareas. La librería de referencia es `pimm` (particle-imaging-models), y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Panda V2 (`panda-detector-v2m1`) con encoder panda-v2 y cabeza de segmentación de instancias; adaptación LoRA de rango 16 |
| Parametros totales | 59.836.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo sobre nubes de puntos, no secuencial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea el detector Panda V2 (`panda-detector-v2m1`) para segmentación de instancias sobre nubes de puntos. El encoder es panda-v2.tpcpp-10m, preentrenado en TPCpp-10M, y se adapta con LoRA de rango 16; la cabeza de segmentación se entrena junto con la adaptación LoRA sobre 1.000 eventos etiquetados de TPCpp-10M. El checkpoint publicado es el mejor de validación de la ejecución `panda-v2-sphenix-n1000-from-sphenix` y corresponde a los pesos puntuados en el split de test del artículo.

No se dispone de información sobre el número total de tokens o eventos de preentrenamiento más allá de la referencia a TPCpp-10M, ni sobre la composición detallada del dataset. La innovación técnica destacable es la combinación de preentrenamiento a gran escala con adaptación LoRA de bajo rango para reducir drásticamente la necesidad de datos etiquetados en el ajuste fino. En GPUs sin FlashAttention debe pasarse `attention_backend="torch"` a `pimm.from_pretrained`.

## Capacidades

- Segmentación de instancias sobre nubes de puntos de detectores TPC (identificación y separación de partículas en un evento).
- Extracción de representaciones mediante el encoder panda-v2 preentrenado en TPCpp-10M.
- Adaptación eficiente con LoRA (rango 16) para ajuste a nuevos conjuntos de datos etiquetados.
- Inferencia sobre lotes de eventos mediante la API `pimm` (`model(batch)` devuelve las instancias predichas).
- Ejecución en CUDA con soporte de FlashAttention y fallback a backend `torch`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reconstrucción de eventos en experimentos TPC: el modelo separa instancias de partículas en nubes de puntos de un evento, lo que permite reconstruir trayectorias y vértices en análisis de física de altas energías.
- Etiquetado asistido de datos: al ser un segmentador afinado con solo 1.000 eventos, sirve como base para preetiquetar grandes volúmenes de eventos y reducir el esfuerzo de anotación manual.
- Ajuste fino con pocos datos en nuevos detectores: la receta LoRA rango 16 sobre el encoder preentrenado permite adaptar el modelo a un nuevo conjunto de eventos con un coste de datos y cómputo reducido.
- Control de calidad y monitorización de detectores: la segmentación de instancias puede usarse para detectar patrones anómalos en los eventos y señalar posibles problemas de calibración.
- Investigación en métodos de segmentación de nubes de puntos: el par encoder preentrenado más cabeza LoRA constituye un punto de partida reproducible para comparar arquitecturas en física de partículas.
- Integración en pipelines de análisis con `pimm`: la API `pimm.from_pretrained` y las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/sphenix.py` permiten incorporar el modelo a flujos existentes de procesamiento por lotes en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que estos pesos son los evaluados en el split de test del artículo, sin incluir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 59,8 M de parámetros en precisión de 16 bits el peso de los parámetros ronda los 120 MB, por lo que el consumo dominante será el de activaciones y el tamaño del lote de nubes de puntos.
- GPU recomendadas: no disponible; la model card menciona ejecución en CUDA y el uso de FlashAttention cuando está disponible.
- Cabe en GPU de consumo: probable por el reducido número de parámetros, aunque no hay confirmación oficial ni cifras de VRAM medidas.
- Opciones de despliegue: librería `pimm` (`pimm.from_pretrained(..., device="cuda")`), con `attention_backend="torch"` en GPUs sin FlashAttention. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de segmentación de instancias en nubes de puntos para física de partículas ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de dominio específico: solo es aplicable a segmentación de instancias sobre nubes de puntos de detectores TPC; no es un modelo de lenguaje ni de propósito general.
- Dependencia del preentrenamiento: el rendimiento depende del encoder panda-v2.tpcpp-10m y de la distribución de TPCpp-10M; puede degradarse en detectores o condiciones fuera de esa distribución.
- Ajuste fino con datos escasos: el entrenamiento usa solo 1.000 eventos etiquetados, lo que puede limitar la generalización a clases o configuraciones poco representadas.
- Requisito de transformaciones específicas: las entradas deben prepararse con las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/sphenix.py`; un preprocesado distinto invalida las predicciones.
- Dependencia de FlashAttention: en GPUs sin soporte debe configurarse explícitamente `attention_backend="torch"`, con posible impacto en velocidad.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Riesgo de alucinación no aplicable en el sentido de los LLM, pero sí existe riesgo de falsos positivos o instancias mal separadas en eventos ambiguos.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.tpcpp-10m_ft_tpcpp-10m-1k
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.tpcpp-10m
- Repositorio pimm (particle-imaging-models): https://github.com/DeepLearnPhysics/particle-imaging-models

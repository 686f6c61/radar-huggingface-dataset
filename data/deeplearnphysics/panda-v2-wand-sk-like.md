# DeepLearnPhysics/panda-v2.wand-sk-like

## Resumen

panda-v2.wand-sk-like es un codificador auto-supervisado para nubes de puntos (point clouds) orientado a física de partículas, desarrollado por DeepLearnPhysics. Se trata del encoder del profesor EMA (exponential moving average) extraído de un proceso de auto-destilación Panda V2 (`panda-ssl-v2m1`), entrenado sobre 1 millón de eventos simulados en un detector Cherenkov de agua tipo Super-Kamiokande (WAND SK-like). El modelo no es un LLM: no genera texto ni código, sino que produce representaciones vectoriales de puntos de eventos de detector.

El modelo resuelve el problema de obtener embeddings auto-supervisados de bajo nivel para eventos de física de partículas sin necesidad de etiquetas, de modo que esos embeddings puedan reutilizarse en tareas posteriores de reconstrucción o clasificación. Es relevante para el ecosistema de imagen de partículas porque forma parte de la familia Panda V2 y se distribuye a través de la librería `pimm` (particle-imaging-models) de DeepLearnPhysics.

Con 53.584.542 parámetros y un repositorio de 8,8 GB (que incluye 40 snapshots de entrenamiento), el modelo opera sobre puntos de entrada con 29 características cada uno y genera una salida de 1170 canales por punto. No hay información pública sobre arquitectura interna detallada, licencia ni benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de nubes de puntos auto-supervisado (familia Panda V2, destilación EMA); detalles internos no disponibles |
| Parametros totales | 53.584.542 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de carga | pimm |
| Entrada | 29 características por punto |
| Salida | 1170 canales por punto (vía `point.upcast().feat`) |
| Entrenamiento | 1M eventos WAND SK-like, 20 épocas, 208.334 pasos, batch 96 |
| Snapshots | main + tags `01-of-40` a `40-of-40` (cada 5.208 pasos) |

## Arquitectura y entrenamiento

El modelo es el encoder de un esquema de auto-destilación (self-distillation) denominado Panda V2 (`panda-ssl-v2m1`). Durante el preentrenamiento, un profesor EMA (exponential moving average) genera objetivos estables para el alumno; los pesos publicados corresponden precisamente a ese encoder del profesor EMA. La arquitectura procesa nubes de puntos con 29 características por punto y produce representaciones por punto de 1170 canales, con una cadena de pooling que estructura la salida en etapas (la más gruesa accesible mediante `encoder(batch)` y la representación por punto mediante `point.upcast().feat`).

El entrenamiento se realizó sobre 1 millón de eventos simulados en un detector Cherenkov de agua tipo Super-Kamiokande (WAND SK-like), durante 20 épocas, lo que equivale a 208.334 pasos con batch de 96. El repositorio conserva 40 snapshots intermedios etiquetados `01-of-40` a `40-of-40`, cada uno separado por 5.208 pasos (0,5 M de eventos), lo que permite estudiar la evolución del encoder a lo largo del preentrenamiento. No se especifican en la información disponible detalles sobre la composición exacta del dataset, funciones de pérdida, ni el uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Extracción de representaciones auto-supervisadas de nubes de puntos de eventos de detector Cherenkov de agua.
- Generación de embeddings por punto de 1170 canales, reutilizables como features en tareas posteriores de reconstrucción o clasificación.
- Soporte de acceso a snapshots intermedios de entrenamiento mediante el parámetro `revision` (tags `01-of-40` a `40-of-40`).
- Compatibilidad con backends de atención FlashAttention y `torch` (este último para GPUs sin FlashAttention, mediante `attention_backend="torch"`).
- No soporta generación de texto, tool calling, agentes, capacidades multilingües ni visión en el sentido de los modelos multimodales de lenguaje.
- No se documentan capacidades adicionales (thinking mode, audio, etc.).

## Casos de uso

- Reconstrucción de eventos en detectores Cherenkov de agua: usar los embeddings de 1170 canales por punto como entrada a cabezas de reconstrucción de energía o dirección de partículas en un detector tipo Super-Kamiokande.
- Clasificación de eventos con pocas etiquetas: aprovechar el preentrenamiento auto-supervisado sobre 1M de eventos para fine-tuning con conjuntos etiquetados reducidos, reduciendo el coste de simulación y etiquetado.
- Búsqueda de anomalías en datos de detector: comparar embeddings de eventos reales frente a la distribución aprendida de eventos simulados para detectar señales atípicas.
- Estudio de la evolución del aprendizaje: cargar snapshots intermedios (`01-of-40` a `40-of-40`) para analizar cómo evolucionan las representaciones a lo largo de 208.334 pasos de entrenamiento.
- Preentrenamiento transferible a otros detectores de agua: inicializar un encoder en un detector distinto y ajustar con datos del nuevo dominio, dado el carácter auto-supervisado del preentrenamiento.
- Extracción de features para pipelines de análisis offline: generar embeddings por punto de forma por lotes en GPU y almacenarlos como representación compacta para análisis estadísticos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 53,6 M de parámetros en precisión FP32 los pesos ocupan aproximadamente 214 MB; el consumo real depende del tamaño de lote de puntos y de las activaciones, no documentado.
- GPU recomendadas: no disponible. La model card menciona explícitamente GPUs con y sin FlashAttention, lo que implica soporte para GPU CUDA; no se nombran modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de parámetros sería viable en GPUs de consumo, pero el consumo de memoria de las activaciones de nubes de puntos no está documentado.
- Opciones de despliegue: la vía documentada es la librería `pimm` (`pimm.from_pretrained(..., device="cuda")`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma familia o categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo específico de dominio (física de partículas, detectores Cherenkov de agua); no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Entrenado exclusivamente sobre eventos simulados WAND SK-like; el rendimiento sobre datos reales de detector no está documentado y puede degradarse por diferencias de dominio (domain shift).
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de utilizarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de las representaciones frente a alternativas.
- Riesgo de sesgo hacia la simulación utilizada: la distribución de eventos simulados condiciona las representaciones aprendidas.
- Requiere seguir las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/wc.py` en el repositorio `pimm`; un preprocesado incorrecto de las 29 características por punto invalida las salidas.
- En GPUs sin FlashAttention es obligatorio pasar `attention_backend="torch"`, lo que puede afectar al rendimiento.
- Repositorio de 8,8 GB por los 40 snapshots; la descarga completa es costosa si solo se necesita el estado final (`main`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2.wand-sk-like
- Repositorio pimm (particle-imaging-models): https://github.com/DeepLearnPhysics/particle-imaging-models
- Perfil del autor en Hugging Face: https://huggingface.co/DeepLearnPhysics

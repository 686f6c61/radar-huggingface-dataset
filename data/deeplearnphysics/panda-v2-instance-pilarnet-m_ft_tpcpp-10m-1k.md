# DeepLearnPhysics/panda-v2-instance.pilarnet-m_ft_tpcpp-10m-1k

## Resumen

`panda-v2-instance.pilarnet-m_ft_tpcpp-10m-1k` es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Se trata de un detector Panda V2 (`panda-detector-v2m1`) cuyo encoder es `panda-v2.pilarnet-m`, un backbone preentrenado sobre el conjunto PILArNet-M de nubes de puntos de cámaras de proyección temporal (TPC). El modelo se ha adaptado mediante LoRA de rango 16 y afinado junto con la cabeza de segmentación sobre 1.000 eventos etiquetados del dataset TPCpp-10M, en el contexto del experimento sPHENIX.

El modelo resuelve la tarea de identificar y separar instancias individuales (traza de partículas) dentro de eventos de colisión registrados por una TPC, un problema clásico de reconstrucción en detectores gaseosos. Frente a enfoques tradicionales de reconstrucción basados en ajustes geométricos, este modelo aprende directamente sobre nubes de puntos 3D, lo que permite aprovechar la información espacial densa del detector sin ingeniería manual de características.

Es relevante por su carácter especializado y por su enfoque de eficiencia: parte de un backbone preentrenado y solo ajusta un adaptador LoRA de rango bajo junto con la cabeza, lo que reduce drásticamente el coste de entrenamiento y el tamaño de los artefactos publicados. Con 59,8 millones de parámetros totales y un repositorio de 0,2 GB, es un modelo compacto orientado a investigación en reconstrucción de eventos, no a propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Panda V2 (detector `panda-detector-v2m1`) con encoder `panda-v2.pilarnet-m` y cabeza de segmentación de instancias; adaptación LoRA de rango 16 |
| Parametros totales | 59.836.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sobre nubes de puntos, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | pimm |
| Tamano del repositorio | 0,2 GB |
| Dominio | Física de partículas, nubes de puntos 3D en TPC |
| Dataset de ajuste fino | TPCpp-10M (1.000 eventos etiquetados) |
| Checkpoint | Mejor validación de la ejecución `panda-v2-sphenix-n1000-from-lar` |

## Arquitectura y entrenamiento

El modelo se construye sobre el detector Panda V2, un pipeline de segmentación de instancias para nubes de puntos. El encoder es `panda-v2.pilarnet-m`, preentrenado sobre PILArNet-M, un corpus de nubes de puntos procedentes de simulaciones de TPC. Sobre ese backbone se aplica una adaptación LoRA de rango 16, y el conjunto encoder adaptado más cabeza se afina de forma supervisada sobre 1.000 eventos etiquetados de TPCpp-10M. El resultado publicado corresponde al mejor checkpoint de validación de la ejecución `panda-v2-sphenix-n1000-from-lar`, evaluado sobre el split de test del artículo asociado.

La innovación principal no está en la arquitectura del transformer en sí, sino en el esquema de transferencia: un backbone preentrenado a gran escala en un dominio de nubes de puntos de TPC se reutiliza para un detector concreto (sPHENIX) con un ajuste fino de bajo rango y pocos eventos etiquetados. Esto es relevante porque el etiquetado de eventos reales es costoso, y el enfoque demuestra que un adaptador LoRA más una cabeza puede bastar para especializar el modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a esta tarea).

## Capacidades

- Segmentación de instancias sobre nubes de puntos 3D de eventos en TPC: separa trazas de partículas individuales dentro de un evento.
- Inferencia sobre lotes de eventos mediante `pimm.from_pretrained(...)` y una llamada directa `model(batch)` que devuelve las instancias predichas.
- Transferencia desde un backbone preentrenado en PILArNet-M al dominio de sPHENIX mediante LoRA de rango 16.
- Compatibilidad con distintos backends de atención: en GPUs sin FlashAttention se puede pasar `attention_backend="torch"`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión 3D especializado, no un modelo de lenguaje.
- No dispone de modo de pensamiento, visión 2D, audio ni generación de texto.

## Casos de uso

- Reconstrucción de trazas en sPHENIX: el modelo se aplica a eventos simulados o reales de la TPC de sPHENIX para obtener instancias de partículas, sustituyendo o complementando la reconstrucción geométrica clásica en estudios de rendimiento.
- Evaluación de pipelines de segmentación: sirve como referencia afinada para comparar detectores Panda V2 frente a alternativas sobre el mismo split de test del artículo.
- Estudio de transferencia con pocos datos: al estar afinado con solo 1.000 eventos, es un caso práctico para analizar cuánto rendimiento se obtiene con LoRA de rango 16 frente a un ajuste completo.
- Prototipado en investigación de detectores: permite generar predicciones de instancias sobre nuevos lotes de eventos para inspección cualitativa y análisis de eficiencia de reconstrucción.
- Base para nuevos ajustes finos: al ser un checkpoint especializado en sPHENIX, puede reutilizarse como punto de partida para otros detectores o configuraciones con un coste de adaptación bajo.
- Integración en flujos de análisis con `pimm`: se puede cargar dentro del ecosistema `particle-imaging-models` y encadenar con las transformaciones de evaluación definidas en `configs/panda/v2/finetune/_base_/datasets/sphenix.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 59,8 millones de parámetros y pesos en safetensors (repositorio de 0,2 GB), la huella de pesos es de aproximadamente 0,24 GB en FP32, por lo que el modelo es muy ligero en memoria.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo admite ejecución en CUDA (`device="cuda"`) y requiere un backend de atención alternativo (`attention_backend="torch"`) en GPUs sin FlashAttention.
- Cabe en GPU de consumo: por tamaño de parámetros, sí es compatible con GPUs de consumo con suficiente memoria para el lote de nubes de puntos; no se especifica el mínimo exacto.
- Opciones de despliegue: librería `pimm` (carga mediante `pimm.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de segmentación de instancias en nubes de puntos de TPC con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo altamente especializado: solo es válido para segmentación de instancias en nubes de puntos de TPC en el dominio de física de partículas; no es un modelo de lenguaje ni de propósito general.
- Dependencia del preprocesado: los autores indican que las entradas deben prepararse con las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/sphenix.py`; usar otras transformaciones puede degradar las predicciones.
- Dependencia del backend de atención: en GPUs sin FlashAttention es necesario pasar `attention_backend="torch"`, lo que puede afectar al rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar con el autor antes de usarlo en producción.
- Afinado con solo 1.000 eventos: el modelo puede generalizar peor fuera de la distribución de sPHENIX o ante condiciones de detector distintas a las del conjunto de ajuste.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible; en este dominio, los errores se manifestarían como instancias mal separadas o trazas espurias, no como texto inventado.
- Sin datos de benchmarks publicados en la información disponible: no se puede verificar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.pilarnet-m_ft_tpcpp-10m-1k
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.pilarnet-m
- Repositorio `pimm` (particle-imaging-models): https://github.com/DeepLearnPhysics/particle-imaging-models
- Organización en Hugging Face: https://huggingface.co/DeepLearnPhysics

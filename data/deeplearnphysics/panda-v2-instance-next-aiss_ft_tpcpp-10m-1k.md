# DeepLearnPhysics/panda-v2-instance.next-aiss_ft_tpcpp-10m-1k

## Resumen

panda-v2-instance.next-aiss_ft_tpcpp-10m-1k es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Se construye sobre el detector Panda V2 (`panda-detector-v2m1`) y utiliza como codificador el modelo `panda-v2.next-aiss`, preentrenado en el conjunto NEXT-AISS. El modelo ha sido adaptado mediante LoRA de rango 16 y ajustado, junto con la cabeza de segmentación, sobre 1.000 eventos etiquetados del conjunto TPCpp-10M.

El modelo resuelve la tarea de segmentación de instancias sobre nubes de puntos (point clouds) generadas por cámaras de proyección temporal (TPC) en experimentos de física de partículas, un problema clave para la reconstrucción de trazas y la identificación de partículas en detectores como sPHENIX. Los pesos publicados corresponden al mejor checkpoint de validación de la ejecución `panda-v2-sphenix-n1000-from-next`, evaluado sobre el split de test del artículo asociado.

Con 59.836.824 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a un dominio muy específico. Su relevancia radica en aplicar técnicas de adaptación eficiente (LoRA) a un codificador preentrenado en un dominio distinto (NEXT-AISS) para transferir conocimiento a un nuevo experimento (TPCpp-10M) con solo 1.000 eventos etiquetados, lo que reduce drásticamente el coste de anotación en física experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Panda V2 (`panda-detector-v2m1`) con codificador `panda-v2.next-aiss`; adaptación LoRA de rango 16 más cabeza de segmentación de instancias |
| Parametros totales | 59.836.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de dominio científico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | pimm |
| Tamano del repositorio | 0,2 GB |
| Dominio | Física de partículas, nubes de puntos (point cloud) |
| Tecnica de adaptacion | LoRA (rank 16) + fine-tuning de la cabeza |
| Datos de ajuste | 1.000 eventos etiquetados de TPCpp-10M |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del detector Panda V2 (`panda-detector-v2m1`), un sistema de segmentación de instancias diseñado para nubes de puntos en el contexto de física de partículas. El codificador es `panda-v2.next-aiss`, preentrenado en el conjunto NEXT-AISS, y se adapta mediante LoRA de rango 16 junto con la cabeza de segmentación. El ajuste fino se realiza sobre 1.000 eventos etiquetados del conjunto TPCpp-10M (experimento sPHENIX), partiendo del checkpoint `panda-v2-sphenix-n1000-from-next`.

La innovación principal reside en la transferencia de un codificador preentrenado en un dominio (NEXT-AISS) a otro (TPCpp-10M) mediante adaptación de bajo rango, lo que permite obtener un modelo funcional con muy pocos eventos etiquetados. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO, dado que se trata de un modelo de visión/segmentación y no de lenguaje. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación de instancias sobre nubes de puntos de cámaras de proyección temporal (TPC) en experimentos de física de partículas.
- Predicción de instancias individuales (trazas o partículas) a partir de eventos completos.
- Transferencia de aprendizaje desde un dominio preentrenado (NEXT-AISS) a un nuevo experimento (TPCpp-10M) mediante LoRA.
- Inferencia en GPU con soporte para backend de atención FlashAttention o `torch` (en GPUs sin FlashAttention).
- Integración con la librería `pimm` para carga y ejecución del modelo.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes ni multilingüismo, al ser un modelo de dominio científico.

## Casos de uso

- Reconstrucción de trazas en detectores TPC: el modelo segmenta las instancias (trazas de partículas) en eventos de sPHENIX, facilitando la reconstrucción de trayectorias en el análisis de colisiones.
- Identificación de partículas en experimentos de física de altas energías: al separar instancias en la nube de puntos, permite clasificar y contar partículas producidas en cada evento.
- Análisis de datos de TPCpp-10M con pocos eventos etiquetados: gracias al ajuste con solo 1.000 eventos y LoRA, es adecuado para experimentos donde la anotación es costosa y escasa.
- Prototipado rápido en investigación: investigadores pueden cargar el modelo con `pimm.from_pretrained` y evaluar segmentación sobre nuevos lotes de eventos sin reentrenar desde cero.
- Transferencia a nuevos experimentos: sirve como punto de partida (codificador preentrenado más LoRA) para adaptar la segmentación a otros detectores o configuraciones con un conjunto reducido de datos etiquetados.
- Validación de pipelines de reconstrucción: puede integrarse en flujos de evaluación para comparar el rendimiento de la segmentación de instancias frente a métodos tradicionales en física de partículas.
- Docencia y experimentación en ML para física: modelo compacto (0,2 GB, ~60M parámetros) que cabe en GPUs de consumo y permite reproducir experimentos de segmentación de nubes de puntos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 59,8M parámetros en safetensors y un repositorio de 0,2 GB, la inferencia en FP32 requeriría aproximadamente 0,24 GB solo para pesos, más memoria para activaciones y lotes de nubes de puntos.
- GPU recomendadas: no disponible; el modelo se ejecuta con `device="cuda"` y admite FlashAttention o backend `torch`.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño reducido del modelo, aunque no se documenta oficialmente.
- Opciones de despliegue: librería `pimm` (carga mediante `pimm.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de segmentación de instancias en nubes de puntos para física de partículas en la información disponible.

## Limitaciones y advertencias

- Modelo de dominio muy específico (física de partículas, nubes de puntos); no es adecuado para tareas de lenguaje, visión general o código.
- Entrenado con solo 1.000 eventos etiquetados de TPCpp-10M, lo que puede limitar la generalización a otras configuraciones de detector o distribuciones de datos.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- No se documentan sesgos, pero al ser un modelo científico, su rendimiento depende de la similitud entre los datos de entrenamiento y los de producción.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí puede producir segmentaciones incorrectas en eventos atípicos o con ruido.
- Requiere preparar las entradas con las transformaciones de evaluación específicas del repositorio `pimm` (`configs/panda/v2/finetune/_base_/datasets/sphenix.py`).
- En GPUs sin FlashAttention es necesario pasar `attention_backend="torch"`, lo que puede afectar al rendimiento.
- No se dispone de información sobre el contexto, idiomas ni cuantizaciones, al no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.next-aiss_ft_tpcpp-10m-1k
- Codificador base: https://huggingface.co/DeepLearnPhysics/panda-v2.next-aiss
- Repositorio pimm: https://github.com/DeepLearnPhysics/particle-imaging-models
- Configuración de datasets sPHENIX: `configs/panda/v2/finetune/_base_/datasets/sphenix.py` en el repositorio pimm

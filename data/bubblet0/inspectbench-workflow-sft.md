# BubbleT0/InspectBench-Workflow-SFT

## Resumen

InspectBench Workflow-SFT es un checkpoint de inferencia publicado por el usuario BubbleT0 (sin afiliación institucional declarada) que contiene los pesos completos del modelo evaluado en el paper InspectBench. El checkpoint corresponde a la ejecución `Qwen3.6-27B_TP2_CP4_PP4_VPP2_EP1_ETP1_mbs1_131072_agen_0722_agentv4_final_rp_3epv_0-20260722-214144_checkpoint-145`, es decir, un fine-tuning del backbone Qwen3.6-27B orientado a tareas de crítica de imágenes y flujos de inspección visual. Los 12 shards originales en safetensors se preservan byte a byte; no se trata de un modelo reentrenado ni cuantizado para esta publicación.

El modelo resuelve un problema acotado: dado un par imagen-texto en el que la imagen no incluye el prompt de generación, el modelo debe producir un conjunto de regiones (region set) que describa los defectos o anomalías detectadas. Es la tarea que el paper InspectBench utiliza como referencia numérica fija. La arquitectura declarada en la configuración es `Qwen3_5ForConditionalGeneration` (tag `qwen3_5`), con parámetros en BF16 y una versión registrada de Transformers 5.2.0.

Es relevante ahora porque expone públicamente los pesos de un checkpoint de evaluación de un benchmark de inspección visual, algo poco habitual: la mayoría de publicaciones de benchmarks solo liberan predicciones. Sin embargo, el autor advierte explícitamente de que no se ha vuelto a ejecutar la inferencia completa en GPU para esta release, por lo que la reproducibilidad no está garantizada de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (tag `qwen3_5`), vision-language transformer |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se declara configuración MoE) |
| Longitud de contexto | no disponible (la cadena de entrenamiento incluye `131072`, pero no se confirma como contexto final) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que no se infiere ninguna licencia adicional por la subida) |
| Formato de pesos | safetensors (12 shards), más índice de shards, tokenizer, chat template y configuración de procesador de imagen/vídeo |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de tipo vision-language con cabecera de generación condicional (`ForConditionalGeneration`), derivada de la familia Qwen3.5/Qwen3.6. El checkpoint se entrenó con paralelismo tensorial (TP2), paralelismo de contexto (CP4), paralelismo de pipeline (PP4) con virtual pipeline (VPP2) y paralelismo de expertos (EP1, ETP1), con micro-batch size 1. La cadena de configuración sugiere un entrenamiento orientado a agentes (`agen_0722_agentv4`) con 3 épocas (`3epv`) y un tamaño de secuencia registrado de 131072.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. El autor indica que los datos de entrenamiento y los estados del optimizador no se incluyen en el repositorio. La innovación técnica destacable no está en el modelo en sí, sino en el artefacto: se publican los pesos íntegros de un checkpoint de evaluación de benchmark junto con los argumentos de entrenamiento (con credenciales e infraestructura eliminadas) y registros de validación de integridad de tensores e índices.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text).
- Crítica de imágenes: producción de un conjunto de regiones que describe defectos o anomalías.
- Procesamiento de entrada visual sin prompt de generación asociado; las imágenes limpias deben producir un conjunto de regiones vacío.
- Soporte de plantilla de chat (chat template incluida en el repositorio).
- Procesador de imagen y vídeo incluido en la configuración.
- Compatibilidad declarada con endpoints OpenAI (`endpoints_compatible`).
- Razonamiento multi-etapa orientado a agentes, según la nomenclatura del entrenamiento (`agentv4`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Inspección visual automatizada de defectos: el modelo recibe una imagen de un producto o superficie sin el prompt que la generó y devuelve un conjunto de regiones con las anomalías detectadas, lo que permite integrarlo en líneas de control de calidad con salida estructurada.
- Evaluación de benchmarks de crítica de imágenes: sirve como referencia reproducible para comparar nuevas propuestas contra las predicciones del paper InspectBench, ya que los pesos son los mismos que se evaluaron.
- Investigación en agentes multimodales: la nomenclatura del entrenamiento (`agentv4`, flujos multi-etapa) sugiere su uso como base para estudiar pipelines de razonamiento visual por etapas.
- Servicio de visión compatible con OpenAI: al declarar `endpoints_compatible`, puede desplegarse detrás de un endpoint tipo chat completions con entrada de imagen y consumirse desde clientes existentes sin cambios de código.
- Filtrado y limpieza de datasets de imagen: el comportamiento esperado de devolver un conjunto de regiones vacío ante imágenes limpias lo hace útil para descartar o marcar muestras anómalas en procesos de curación de datos.
- Reproducción de resultados académicos: investigadores que necesiten verificar las cifras del paper pueden cargar el checkpoint con Transformers 5.2.0 o vLLM y ejecutar el pipeline externo `pipelines/run_paper_pipeline.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las comparaciones del paper son descriptivas y usan las predicciones publicadas como referencia numérica fija, pero no se incluyen cifras en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos (27,36 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se requieren 2 GPU de 80 GB o una configuración con paralelismo tensorial.
- Cuantización a 8 bits: alrededor de 28-30 GB de VRAM, viable en una GPU de 40-48 GB.
- Cuantización a 4 bits: alrededor de 15-18 GB de VRAM, potencialmente viable en GPUs consumer de gama alta, aunque no se documentan pesos cuantizados en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples RTX 4090 (24 GB) con paralelismo tensorial.
- Cabe en consumer GPU: no en BF16; solo con cuantización agresiva no oficial.
- Opciones de despliegue: Transformers 5.2.0 o superior, vLLM con soporte de visión, y cualquier servidor compatible con la API de OpenAI que acepte el directorio del checkpoint.
- Latencia y throughput: no disponibles. El autor advierte de que la inferencia completa en GPU no se ha vuelto a ejecutar para esta release.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InspectBench Workflow-SFT | 27,36 mil millones | no disponible | no disponible | Pesos safetensors en HF |
| Qwen3.6-27B (backbone declarado) | 27 mil millones (aprox.) | no disponible | no disponible | Referenciado en el paper, no enlazado |
| Alternativas de crítica visual de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables en la información proporcionada, por lo que la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: el autor indica explícitamente que la subida no otorga ninguna licencia adicional y que siguen aplicando los términos del modelo base y de los datos. El uso comercial queda en un limbo legal hasta que se aclare.
- Reproducibilidad no garantizada: la inferencia completa en GPU no se ha vuelto a ejecutar para esta release; los resultados pueden diferir de los del paper.
- Dependencia de un pipeline externo: el modelo por sí solo no ejecuta la tarea de evaluación; requiere el código de `BubbleT0/InspectBench` y los prompts de inferencia.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de crítica visual, la generación de regiones inexistentes es un fallo plausible y no se documentan métricas de precisión.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe sin verificación.
- Contexto no confirmado: la cadena `131072` aparece en la configuración de entrenamiento, pero no se declara formalmente como longitud de contexto del modelo.
- Sin datos de sesgo: no se publica ninguna evaluación de sesgos ni de robustez frente a imágenes fuera de distribución.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación comunitaria independiente.
- Pesos en BF16 sin cuantizaciones oficiales: el despliegue en hardware consumer requiere cuantización propia, con el riesgo de degradación que ello conlleva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BubbleT0/InspectBench-Workflow-SFT
- Repositorio de código y pipeline: https://github.com/BubbleT0/InspectBench
- Dataset del benchmark: https://huggingface.co/datasets/BubbleT0/InspectBench

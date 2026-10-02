# lukeyyy0925/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un modelo de clasificación de texto basado en la arquitectura BERT, publicado en HuggingFace por el usuario lukeyyy0925 bajo el identificador lukeyyy0925/hw1-hc3-detector. Por el nombre y los datos de la model card, se trata de un clasificador binario entrenado para distinguir texto escrito por humanos de texto generado por modelos de lenguaje, apoyándose en el corpus HC3 (Human ChatGPT Comparison Corpus). El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors con 22.713.986 parámetros totales, lo que lo sitúa en el rango de los transformers tipo BERT de tamano reducido, muy por debajo de los 110 millones de parámetros de BERT-base.

El modelo declara en su model card una precisión de referencia (baseline) del 84,53% y una precisión de test tras el ajuste fino del 99,31%. Se publica con la etiqueta de pipeline text-classification y es compatible con text-embeddings-inference y endpoints compatibles, lo que sugiere que puede desplegarse como servicio de inferencia sin grandes modificaciones. No hay información sobre licencia, idiomas soportados ni composición del dataset de entrenamiento más allá del nombre que referencia HC3.

Su relevancia actual es limitada pero concreta: los detectores de texto generado por IA son una pieza demandada en moderación de contenido, integridad académica y limpieza de datasets. No obstante, al tratarse de un artefacto con cero descargas y cero likes, sin licencia declarada y sin documentación técnica, debe considerarse un experimento reproducible más que un componente listo para producción. Las cifras de precisión del 99,31% deben interpretarse con cautela, dado que no se especifica el conjunto de evaluación ni el protocolo seguido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (familia transformer encoder, según tags del repositorio); configuración exacta no disponible |
| Parametros totales | 22.713.986 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (los modelos BERT típicos usan 512 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar; admite cuantización posterior) |
| Idiomas soportados | no disponible (el corpus HC3 cubre inglés y chino, sin confirmar para este modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card y las etiquetas del repositorio indican que se trata de un transformer de tipo encoder BERT reutilizado para clasificación de secuencias (text-classification). Con 22.713.986 parámetros, la configuración no coincide con ninguna variante estándar de BERT publicada habitualmente (BERT-tiny ~4,4 M, BERT-mini ~11,2 M, BERT-small ~29,1 M, BERT-base ~110 M), por lo que probablemente se trate de una configuración personalizada, de un recorte de capas o de un modelo destilado con un número de capas y dimensión oculta propios. No se dispone de la ficha técnica de configuración (número de capas, dimensión oculta, cabezas de atención) ni del tokenizador empleado.

Respecto al entrenamiento, el nombre del modelo referencia HC3, el Human ChatGPT Comparison Corpus publicado por el proyecto Hello-SimpleAI, que contiene pares de respuestas humanas y generadas por ChatGPT. La model card únicamente aporta dos métricas: baseline accuracy 84,53% y fine-tuned test accuracy 99,31%. No se especifica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO (no aplicables a un clasificador de este tipo), ni el framework de ajuste (Trainer de HuggingFace, PyTorch Lightning, etc.). Tampoco se documenta ninguna innovación técnica destacable: parece un ajuste fino estándar con cabeza de clasificación sobre un encoder preentrenado.

## Capacidades

- Clasificación binaria de texto: presumiblemente distingue entre texto humano y texto generado por IA, según el nombre y el corpus de referencia.
- Clasificación de secuencias cortas: adecuado para fragmentos de texto de longitud moderada, coherente con la ventana típica de un encoder BERT.
- Integración como servicio de embeddings/clasificación: los tags text-embeddings-inference y endpoints_compatible indican que puede servirse mediante la infraestructura de HuggingFace.
- Exportación a otros runtimes: al ser un modelo transformers estándar, es convertible a ONNX y cuantificable para despliegue en CPU.
- Tool calling / function calling: no soportado (no es un modelo generativo).
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Capacidades multilingües: no confirmadas; el corpus de referencia cubre inglés y chino.
- Modalidades adicionales (visión, audio): no soportadas.

## Casos de uso

- Moderación de contenido en plataformas educativas: integrar el clasificador en el pipeline de entrega de trabajos para marcar posibles ensayos generados por IA antes de la revisión humana, usando la salida de clasificación como señal de priorización.
- Limpieza de datasets de entrenamiento: filtrar grandes volúmenes de texto sintético antes de usarlos para preentrenar o ajustar otros modelos, evitando bucles de realimentación (model collapse).
- Detección de reseñas falsas en comercio electrónico: clasificar reseñas de producto para señalar aquellas con alta probabilidad de haber sido generadas automáticamente, complementando reglas heurísticas existentes.
- Verificación de originalidad en publicación editorial: como primera pasada en la revisión de artículos o manuscritos, descartando candidatos con firma sintética clara antes del proceso editorial completo.
- Auditoría de contenido en redes sociales: detectar cuentas o publicaciones que emiten texto generado de forma masiva, útil para equipos de integridad de plataforma.
- Filtrado previo en pipelines de RLHF: descartar ejemplos sintéticos en la fase de curación de datos de preferencia, reduciendo ruido en el entrenamiento posterior.
- Investigación en detección de IA: servir como punto de comparación reproducible frente a detectores más grandes, dado su reducido coste computacional.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Baseline accuracy | 84,53% | no disponible |
| Fine-tuned test accuracy | 99,31% | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las dos cifras anteriores provienen exclusivamente de la model card del autor y no especifican el protocolo, el tamano de la muestra ni la distribucion de clases, por lo que no son comparables de forma directa con otros detectores.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 91 MB solo para los pesos (22,7 M × 4 bytes), más overhead de activaciones y runtime.
- VRAM estimada en fp16/bf16: aproximadamente 45 MB de pesos.
- VRAM estimada en int8: aproximadamente 23 MB; en int4: aproximadamente 11 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es más que suficiente.
- Cabe holgadamente en GPU de consumo: sí, incluidas GTX 1650, RTX 3050 y prácticamente cualquier iGPU con al menos 2 GB asignados.
- Inferencia en CPU: viable para tráfico moderado, dado el reducido número de parámetros.
- Opciones de despliegue: HuggingFace transformers, HuggingFace Inference Endpoints (tag endpoints_compatible), text-embeddings-inference, exportación a ONNX Runtime y TorchScript; cuantización estática o dinámica para CPU.
- Latencia y throughput: no disponibles. Con 22,7 M de parámetros, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lukeyyy0925/hw1-hc3-detector | 22,7 M | no disponible | no disponible | HuggingFace | Sin documentacion tecnica |
| BERT-base-uncased (referencia) | ~110 M | 512 tokens | Apache 2.0 | HuggingFace, ampliamente extendido | Encoder generico, no especifico de deteccion de IA |
| DistilBERT-base-uncased (referencia) | ~66 M | 512 tokens | Apache 2.0 | HuggingFace | Version destilada, menor coste |
| Hello-SimpleAI/chatgpt-detector-roberta | ~125 M | 512 tokens | no verificada en esta busqueda | HuggingFace, GitHub Hello-SimpleAI | Detector de ChatGPT asociado al corpus HC3 |

Los valores de parametros de los modelos de referencia corresponden a especificaciones habituales publicadas por sus autores y se incluyen como contexto orientativo. No hay datos de rendimiento comparables entre estos modelos y hw1-hc3-detector, ya que las condiciones de evaluacion de este ultimo no estan documentadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Los detectores de texto generado por IA suelen penalizar sistematicamente a hablantes no nativos, textos muy formales o contenido altamente estructurado, pero no hay evaluacion que lo confirme en este caso.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo clasifica y no genera texto. El riesgo equivalente es de falsos positivos y falsos negativos, cuya tasa no se ha publicado.
- La precision del 99,31% procede de la propia model card y no especifica el conjunto de test ni el protocolo; es probable que corresponda a una particion del mismo corpus HC3, lo que infla el resultado y no garantiza generalizacion a dominios externos.
- Limitaciones de contexto: se desconoce la longitud maxima de secuencia configurada; los encoders BERT estandar se limitan a 512 tokens y truncan entradas mas largas.
- Limitaciones de idioma: no se declaran idiomas soportados; el corpus HC3 cubre principalmente ingles y chino, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: la licencia figura como no disponible, lo que impide confirmar si el uso comercial esta permitido. En la practica, la ausencia de licencia implica que no se conceden derechos explicitos de uso.
- Estado del repositorio: cero descargas y cero likes, creado y actualizado en la misma franja horaria (2026-10-01), lo que apunta a un ejercicio academico o experimento puntual sin mantenimiento.
- Para produccion: no debe usarse como unico criterio de decision en flujos con consecuencias academicas, laborales o legales; se recomienda como senal auxiliar supervisada por revision humana.
- Existen varios repositorios con el mismo nombre (Aishkrish, skyyyyks, Yihangsun), lo que sugiere clones de una misma practica; conviene verificar cual se esta desplegando realmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lukeyyy0925/hw1-hc3-detector
- Repositorio Homologo (Aishkrish): https://huggingface.co/Aishkrish/hw1-hc3-detector
- Repositorio Homologo (skyyyyks): https://huggingface.co/skyyyyks/hw1-hc3-detector
- Ficha en Savrn (Yihangsun): https://savrn.com/models/hw1-hc3-detector
- Ficha en Free2AITools (Aishkrish): https://free2aitools.com/model/aishkrish/hw1-hc3-detector
- Corpus HC3 y detectores (Hello-SimpleAI): https://github.com/Hello-SimpleAI

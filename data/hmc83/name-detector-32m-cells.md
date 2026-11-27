# HMC83/name-detector-32m-cells

## Resumen
El modelo `HMC83/name-detector-32m-cells` es un clasificador de tokens especializado en la detección de nombres de personas en textos en inglés, incluyendo contenido de hojas de cálculo. Lo desarrolla el usuario HMC83 y se construye mediante un ajuste fino del modelo base `jhu-clsp/ettin-encoder-32m`, un encoder de arquitectura ModernBERT de 10 capas y dimensión oculta 384, con 32 millones de parámetros totales. Su propósito es servir como componente ligero de anonimización (redacción) de datos personales, etiquetando cada token como `O` (no nombre) o `PERSON`.

El modelo resulta relevante por su enfoque en inferencia en CPU y por su entrenamiento adicional con ejemplos de celdas de hojas de cálculo, lo que busca reducir los falsos positivos cuando aparecen nombres de empresas u organizaciones en formatos tabulares. Se distribuye en dos formatos de pesos (safetensors para PyTorch/Transformers y ONNX en FP32 de aproximadamente 128 MB), lo que facilita su integración en pipelines de procesamiento sin depender de GPU.

Con una licencia MIT y un tamaño de repositorio de 0,3 GB, está pensado como una pieza más dentro de un sistema de detección de información personal identificable (PII), no como una solución completa de anonimización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), 10 capas × 384 de dimensión oculta |
| Parametros totales | 32.031.746 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como contexto nativo declarado; la configuración de ventana de inferencia es `window=510` con `overlap=128` |
| Tipos de cuantizacion | No se documentan cuantizaciones explícitas; se ofrece ONNX en FP32. Compatible con cuantización posterior vía ONNX Runtime, pero no está especificada por el autor |
| Idiomas soportados | Inglés (`en`); otros idiomas no probados |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (PyTorch/Transformers) y `model.onnx` (FP32, ~128 MB) |

## Arquitectura y entrenamiento
El modelo es un encoder transformer de la familia ModernBERT, concretamente un ajuste fino de `jhu-clsp/ettin-encoder-32m`, con 10 capas y dimensión oculta de 384, lo que da un total de 32.031.746 parámetros. La tarea es de clasificación de tokens con dos etiquetas: `0: O` y `1: PERSON`. El autor indica que el ajuste se orientó a inferencia en CPU y que se añadieron ejemplos de entrenamiento con celdas de hojas de cálculo (nombres de empresas u organizaciones y personas sintéticas en formatos tabulares) para reducir falsos positivos en celdas no personales.

Los conjuntos de datos declarados en la model card son `nvidia/Nemotron-PII` y `DFKI-SLT/few-nerd`. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a un token classifier). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de lo que aporta la arquitectura ModernBERT del modelo base.

La configuración por defecto de inferencia se recoge en `namecfg.json` con `window=510`, `overlap=128` y `tau=0.2`, parámetros que controlan el troceado del texto y el umbral de decisión para las entidades detectadas.

## Capacidades
- Detección de nombres de personas en texto inglés mediante clasificación de tokens (etiqueta `PERSON`).
- Procesamiento de contenido de hojas de cálculo, con ejemplos de entrenamiento específicos para celdas tabulares.
- Generación de hallazgos con posición (`start`, `end`) y puntuación (`score`) mediante el runtime incluido basado en ONNX Runtime.
- Integración con la librería `transformers` mediante el pipeline `token-classification` con `aggregation_strategy="simple"`.
- Ejecución en CPU sin dependencia de PyTorch cuando se usa el runtime ONNX incluido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés; otros idiomas no están probados.
- No incluye modo de razonamiento (thinking mode) ni capacidades generativas: es un modelo discriminativo de etiquetado.

## Casos de uso
- Redacción de PII en documentos: el modelo puede recorrer textos en inglés y marcar nombres de personas para su sustitución o enmascarado antes de almacenar o compartir documentos, usando la ventana de 510 tokens con solapamiento de 128 para cubrir documentos largos.
- Limpieza de hojas de cálculo: al haberse entrenado con ejemplos de celdas tabulares, es adecuado para detectar nombres de personas en columnas de datos y distinguirlos de nombres de empresas u organizaciones, reduciendo falsos positivos en exportaciones CSV o Excel.
- Preprocesamiento en pipelines de cumplimiento normativo: puede actuar como primer filtro de detección de nombres en flujos de datos antes de aplicar otras reglas para correos, teléfonos e identificadores, tal como recomienda el propio autor.
- Anonimización de registros de atención al cliente: permite localizar nombres de clientes en transcripciones o tickets en inglés antes de su archivado, con inferencia en CPU que evita depender de GPU en entornos de back-office.
- Enmascarado en sistemas de gestión documental: integrable vía ONNX Runtime en servicios ligeros para revisar contratos o formularios en inglés y señalar campos con nombres personales.
- Filtrado previo en conjuntos de datos para entrenamiento: útil para detectar y eliminar nombres de personas de corpus en inglés antes de publicar datasets, con un coste computacional bajo gracias a sus 32 millones de parámetros.
- Despliegue en entornos con recursos limitados: al caber en CPU y ofrecer un ONNX de aproximadamente 128 MB, puede ejecutarse en contenedores pequeños o dispositivos edge para tareas de redacción en tiempo casi real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica en el caso de CPU; el modelo es de 32 millones de parámetros y el ONNX FP32 ocupa aproximadamente 128 MB, por lo que en GPU requeriría un espacio mínimo (del orden de cientos de MB incluyendo activaciones y overhead del runtime).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1 GB de memoria libre sería suficiente, aunque el modelo está diseñado para CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, serie RTX 30/40 o superior) e incluso en iGPU, dado su tamaño reducido.
- Opciones de despliegue: ONNX Runtime con el runtime incluido (`code/runtime.py`), `transformers` con pipeline `token-classification`, y potencialmente otros motores compatibles con ONNX o safetensors; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de comparativas publicadas en la información proporcionada. A continuación se comparan únicamente características estructurales con alternativas genéricas de la misma categoría, indicando cuando un dato no está disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HMC83/name-detector-32m-cells | 32.031.746 | Ventana de inferencia 510 tokens (configurable) | Token classification (PERSON) | MIT | Hugging Face (safetensors y ONNX) |
| Modelos NER genéricos tipo BERT-base (p. ej., variantes de token-classification) | No disponible en esta ficha | No disponible en esta ficha | NER multietiqueta | Variable según modelo | Hugging Face |
| Modelos de detección de PII de mayor tamaño | No disponible en esta ficha | No disponible en esta ficha | Detección de PII | Variable según modelo | Hugging Face |

No se han encontrado en la búsqueda web modelos directamente comparables con datos verificables; la comparación cuantitativa queda pendiente de benchmarks públicos.

## Limitaciones y advertencias
- Solo detecta nombres de personas; debe combinarse con patrones para correos electrónicos, teléfonos e identificadores.
- Está diseñado para texto en inglés; otros idiomas no están probados y pueden degradar su precisión.
- Puede pasar por alto nombres poco comunes o iniciales, y ocasionalmente marcar organizaciones, lugares o códigos que se parezcan a nombres.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- La licencia MIT permite uso comercial, pero se recomienda revisar `LICENSE` y `ATTRIBUTION.md` del repositorio para cumplir con la atribución.
- El modelo no sustituye una solución completa de anonimización: es un componente de detección que requiere validación en el dominio concreto de producción.
- No se documentan sesgos específicos; al entrenarse con datasets como `nvidia/Nemotron-PII` y `DFKI-SLT/few-nerd`, puede heredar sesgos de dichos corpus, especialmente en la representación de nombres de distintas culturas.
- El rendimiento en textos largos depende de la configuración de ventana (`window=510`, `overlap=128`) y del umbral `tau=0.2`, que puede requerir ajuste según el caso de uso.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/HMC83/name-detector-32m-cells
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Dataset `nvidia/Nemotron-PII`: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset `DFKI-SLT/few-nerd`: https://huggingface.co/datasets/DFKI-SLT/few-nerd

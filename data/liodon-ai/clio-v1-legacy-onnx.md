# liodon-ai/clio-v1-legacy-ONNX

## Resumen

liodon-ai/clio-v1-legacy-ONNX es la exportación a formato ONNX del modelo NovelAI/clio-v1-legacy, publicada por Liodon AI, un colectivo de investigación open source centrado en modelos de lenguaje pequeños y en infraestructura de inferencia eficiente. El repositorio no contiene pesos nuevos ni un modelo entrenado desde cero: es una conversión del checkpoint original de NovelAI a ONNX mediante optimum, con la tarea text-generation-with-past, de manera que el grafo expone entradas y salidas past_key_values para decodificación autorregresiva con caché KV.

El interés práctico está en el despliegue: al estar en ONNX, el modelo puede ejecutarse con ONNX Runtime sobre distintos execution providers (CPU, CUDA, TensorRT, DirectML) sin depender de PyTorch, lo que simplifica la integración en servicios de inferencia y en entornos con hardware heterogéneo. El repositorio incluye dos variantes, FP32 y FP16, de 12,18 GB y 6,09 GB respectivamente; a partir de esos tamaños se estima un modelo de aproximadamente 3.000 millones de parámetros, cifra coherente entre ambas precisiones (2 y 4 bytes por parámetro).

La ficha del modelo es deliberadamente escueta: no declara longitud de contexto, idiomas soportados ni resultados de benchmarks. La licencia es "other" y se hereda del modelo base, por lo que cualquier uso comercial exige revisar los términos de NovelAI antes de plantear un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (la etiqueta del repositorio indica linaje StableLM); grafo ONNX exportado con la tarea text-generation-with-past, con entradas y salidas past_key_values |
| Parametros totales | ~3.000 millones, estimados a partir del tamaño de los ficheros (6,09 GB en FP16 y 12,18 GB en FP32); no confirmado por el autor |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (model.onnx) y FP16 (model_fp16.onnx); el ejemplo de uso cita model_quantized.onnx, fichero que no figura en la tabla de ficheros del repositorio |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de NovelAI/clio-v1-legacy) |
| Formato de pesos | ONNX |
| Modelo base | NovelAI/clio-v1-legacy |
| Tamano del repositorio | 18,3 GB |
| Ficheros incluidos | model.onnx (12,18 GB, FP32) y model_fp16.onnx (6,09 GB, FP16) |
| Libreria y runtime | ONNX Runtime; compatible con optimum (ORTModelForCausalLM) |
| Pipeline | text-generation |
| Exportador | optimum (optimum.exporters.onnx.main_export) |
| Fecha de creacion y actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento en la documentación disponible: este repositorio es exclusivamente una conversión de formato del checkpoint NovelAI/clio-v1-legacy, por lo que no aporta datos sobre número de tokens, composición del dataset, uso de RLHF o DPO, ni sobre innovaciones de entrenamiento. La etiqueta stablelm del repositorio sugiere que la arquitectura subyacente pertenece a la familia StableLM (transformer decoder-only con atención causal), aunque no se detalla la configuración de capas, cabezas ni dimensiones ocultas.

La innovación técnica relevante es de despliegue, no de modelado: la exportación se realiza con la tarea text-generation-with-past, lo que hace que el grafo ONNX acepte y devuelva tensores past_key_values. Esto permite decodificación autorregresiva con caché KV fuera de PyTorch, evitando recalcular la atención sobre todo el prefijo en cada token. El repositorio ofrece dos grafos con la misma topología: uno en FP32 (12,18 GB) y otro en FP16 (6,09 GB) orientado a execution providers de GPU. El tamaño total del repositorio (18,3 GB) coincide prácticamente con la suma de ambos ficheros (18,27 GB), por lo que no queda claro si se incluyen ficheros de tokenizer adicionales.

## Capacidades

- Generación de texto autorregresiva: es la tarea declarada del pipeline (text-generation), tanto en modo completado como en conversación mediante prompting.
- Decodificación con caché KV: el grafo expone past_key_values, lo que reduce el coste por token en generación secuencial larga.
- Ejecución multiplataforma vía ONNX Runtime: CPU, CUDA, TensorRT y DirectML, sin dependencia de PyTorch en tiempo de inferencia.
- Orientación a texto narrativo y de ficción: el modelo base procede de NovelAI, entidad conocida por modelos de escritura creativa, aunque la ficha no documenta la composición del corpus.
- Tool calling / function calling: no hay evidencia de soporte; el modelo base es un modelo de generación y no se documenta ajuste por instrucciones ni plantillas de herramientas.
- Agentes y razonamiento multi-paso: no disponible; no se documentan capacidades de planificación ni de uso de herramientas.
- Capacidades multilingües: no declaradas; el repositorio no especifica ningún conjunto de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se menciona ninguna modalidad adicional a texto.
- Fine-tuning o entrenamiento: no soportado por este artefacto; los grafos ONNX son de inferencia.

## Casos de uso

- Escritura asistida y generación narrativa: el modelo puede completar borradores de ficción, diálogos o descripciones a partir de un prefijo, aprovechando el linaje narrativo del modelo base. Requiere diseño cuidadoso del prompt, ya que no hay evidencia de ajuste por instrucciones.
- Microservicio de generación sin PyTorch: empaquetar el grafo ONNX con ONNX Runtime y ORTModelForCausalLM permite construir un contenedor de inferencia ligero, con menor superficie de dependencias que una pila PyTorch completa, útil en entornos con restricciones de imagen o de política de dependencias.
- Inferencia en CPU para herramientas internas: con CPUExecutionProvider el modelo funciona sin GPU, a costa de una latencia alta. Es adecuado para resúmenes, generación por lotes o tareas internas donde el throughput no sea crítico y se disponga de al menos 7-13 GB de RAM según precisión.
- Serving en GPU consumer con FP16: el fichero FP16 de 6,09 GB cabe en tarjetas de 8-16 GB junto con la caché KV, lo que permite desplegar generación de texto en una única RTX 4080, 4070 Ti o superior, con CUDAExecutionProvider o TensorRTExecutionProvider.
- Despliegue en Windows o hardware no NVIDIA mediante DirectML: ONNX Runtime permite ejecutar el grafo sobre GPUs AMD o Intel integradas en Windows, un escenario donde las pilas PyTorch habituales requieren configuración adicional.
- Generación por lotes offline: producción de sinopsis, variaciones de texto, guiones o material de relleno en trabajos batch nocturnos, donde el rendimiento por lotes importa más que la latencia por petición.
- Evaluación comparativa de exportaciones: el repositorio sirve como referencia para medir divergencia numérica y latencia entre el checkpoint PyTorch original y su versión ONNX en FP32 y FP16, un paso habitual antes de migrar un pipeline de serving.
- Investigación sobre caché KV: al exponer past_key_values de forma explícita, el grafo es útil para experimentar con estrategias de gestión de caché, ventanas deslizantes o reutilización de prefijos en un runtime controlado por el desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Aspecto evaluado | Resultado |
|---|---|
| Benchmarks del export ONNX (MMLU, HumanEval, GSM8K, perplejidad) | no disponible |
| Benchmarks del modelo base NovelAI/clio-v1-legacy | no disponible |
| Comparativa FP32 frente a FP16 (divergencia numérica) | no disponible |
| Latencia o throughput medidos | no disponible |

## Requisitos de hardware

- VRAM estimada en FP32: los pesos ocupan 12,18 GB; con activaciones y caché KV conviene reservar del orden de 14-16 GB. Requiere GPUs de 24 GB (RTX 3090, RTX 4090, A100 40 GB, L40S) para trabajar con contexto amplio.
- VRAM estimada en FP16: los pesos ocupan 6,09 GB; con caché KV, un presupuesto de 8-10 GB es razonable en contextos moderados. Cabe en RTX 4080, RTX 4070 Ti, RTX 3080 de 10-12 GB (ajustado) y con holgura en RTX 3090 o RTX 4090.
- Cabe en GPU consumer: sí, en FP16 sobre tarjetas de 8 GB o más, siempre que se limite la longitud de contexto. En FP32 se necesitan tarjetas de 16-24 GB. No se incluye ninguna cuantización de 4 u 8 bits que permita bajar de ese umbral.
- Ejecución en CPU: viable con CPUExecutionProvider; requiere aproximadamente 13 GB de RAM para FP32 y 7 GB para FP16, más memoria para la caché KV. El throughput será sensiblemente inferior al de GPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, TensorRTExecutionProvider, DirectMLExecutionProvider) y optimum mediante ORTModelForCausalLM. No hay ficheros GGUF, por lo que llama.cpp y Ollama no pueden consumir este repositorio directamente. Para servir con vLLM o TGI habría que usar el checkpoint PyTorch original.
- Latencia y throughput estimados: no disponible; el repositorio no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/clio-v1-legacy-ONNX (este) | ~3.000 M (estimado) | no disponible | ONNX (FP32 y FP16) | other | Publicado en HuggingFace, 0 descargas y 0 likes |
| NovelAI/clio-v1-legacy (modelo base) | no disponible | no disponible | no disponible | other | Publicado en HuggingFace por NovelAI |
| liodon-ai/gpt-neo-125m-ONNX | 125 M (por nombre) | no disponible | ONNX | no disponible | Publicado en HuggingFace por el mismo autor |
| Alternativas ONNX de ~3.000 M de otra procedencia | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a formato, licencia y disponibilidad: no se han encontrado en la información disponible datos de rendimiento que permitan contrastar calidad, contexto o eficiencia frente a alternativas de la misma categoría y tamaño.

## Limitaciones y advertencias

- Licencia "other": los términos concretos no se reproducen en el repositorio y se heredan del modelo base. Es imprescindible revisar las condiciones de NovelAI antes de cualquier uso comercial o de redistribución.
- Ausencia total de benchmarks: no hay métricas publicadas que permitan estimar la calidad del modelo ni verificar que la exportación ONNX mantiene el comportamiento del checkpoint original.
- Sin validación de la comunidad: el repositorio acumula 0 descargas y 0 likes, por lo que no hay evidencia externa de funcionamiento correcto ni de estabilidad del grafo exportado.
- Inconsistencia en el ejemplo de uso: el fragmento de código de la model card carga model_quantized.onnx, pero ese fichero no aparece en la tabla de ficheros del repositorio. Ejecutarlo tal cual probablemente falle.
- Tokenizer no verificado: el tamaño del repositorio (18,3 GB) coincide con la suma de los dos grafos ONNX (18,27 GB), por lo que no se puede confirmar que se incluyan los ficheros de tokenizer necesarios para el ejemplo con AutoTokenizer.
- Contexto no declarado: al no especificarse la longitud de contexto, no se debe asumir una ventana larga en producción sin medirla empíricamente con el checkpoint original.
- Idiomas no declarados: no hay garantía de calidad multilingüe; el modelo base es de origen estadounidense y la ficha no documenta idiomas.
- Riesgo de alucinación: es un modelo generativo autorregresivo y no hay evidencia de ajuste por instrucciones ni de técnicas de alineación, por lo que puede producir contenido plausible pero falso.
- Sesgos no evaluados: no se publica ninguna evaluación de sesgos, toxicidad o comportamiento en dominios sensibles.
- Solo inferencia: los grafos ONNX no son aptos para entrenamiento ni fine-tuning; para ajustar el modelo hay que partir del checkpoint original.
- Posible divergencia numérica tras la exportación: la conversión a ONNX y el uso de FP16 pueden introducir diferencias respecto al modelo original, no cuantificadas en la documentación.
- Modelo etiquetado como "legacy": al tratarse de una generación anterior del modelo base, es probable que existan alternativas más recientes con mejores capacidades dentro de la misma familia.
- Metadatos llamativos: las fechas de creación y actualización (2026-09-25) y el año de la cita del autor (2026) merecen verificarse antes de referenciar este repositorio en documentación técnica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/liodon-ai/clio-v1-legacy-ONNX
- Modelo base: https://huggingface.co/NovelAI/clio-v1-legacy
- Perfil de Liodon AI en HuggingFace: https://huggingface.co/liodon-ai
- Organización de Liodon AI en GitHub: https://github.com/Liodon-AI
- Sitio web de Liodon AI: https://liodon.ai/
- Ejemplo de exportación ONNX del mismo autor: https://huggingface.co/liodon-ai/gpt-neo-125m-ONNX
- Librería optimum (exportador utilizado): https://github.com/huggingface/optimum
- ONNX Model Zoo: https://github.com/onnx/models

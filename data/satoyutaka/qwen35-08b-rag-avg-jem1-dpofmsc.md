# satoyutaka/qwen35-08b-rag-avg-jem1-dpofmsc

## Resumen

`satoyutaka/qwen35-08b-rag-avg-jem1-dpofmsc` es un modelo de lenguaje derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario satoyutaka en Hugging Face. No se trata de un entrenamiento desde cero, sino de una media de pesos (weight average) al 0,5/0,5 entre dos variantes previas del autor: `jem_sft1` y `dpo_fm_sc`. Según la model card, no se realizó entrenamiento adicional tras la combinación.

El modelo tiene 873.438.784 parámetros totales (unos 0,87 mil millones) almacenados en formato safetensors, con un repositorio de 1,8 GB. La arquitectura declarada en los tags es `qwen3_5`, heredada del modelo base Qwen3.5-0.8B. El pipeline no está especificado y no se declaran idiomas soportados de forma explícita, aunque los conjuntos de datos de entrenamiento son mayoritariamente en japonés.

Su relevancia es acotada: se trata de un experimento de ajuste fino orientado a tareas de question answering y recuperación aumentada (RAG) sobre corpus japoneses, con muy poca difusión (0 descargas, 0 likes en el momento de la consulta). Es útil como referencia para quienes exploren técnicas de model averaging y DPO sobre modelos pequeños de la familia Qwen3.5, pero no como un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun tag del modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (datos de entrenamiento mayoritariamente en japones) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-0.8B, etiquetada como `qwen3_5` en los metadatos. No se dispone de detalles adicionales sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa, ya que la model card no los incluye.

El proceso de construcción no implica entrenamiento nuevo: es una media aritmética de pesos (0,5/0,5) entre `jem_sft1` (presumiblemente un ajuste supervisado sobre JEMHopQA) y `dpo_fm_sc` (presumiblemente un ajuste con DPO u optimización de preferencias). Los datos empleados en las etapas previas, según la model card, son JEMHopQA (CC BY-SA 4.0), auto-wiki-qa (CC BY-SA 4.0), JSQuAD de JGLUE (CC BY-SA 4.0) y JaQuAD (CC BY-SA 3.0), todos ellos corpus de question answering en japonés. No se especifica el volumen de tokens, la composición exacta por etapa ni si hubo RLHF más allá del DPO implícito en el nombre de la variante.

## Capacidades

- Generación de texto y respuesta a preguntas extractivas y de razonamiento multi-salto, dado el uso de JEMHopQA en el entrenamiento.
- Question answering sobre contexto documental en japonés, orientado a pipelines RAG.
- Comprensión lectora en japonés (JSQuAD, JaQuAD, auto-wiki-qa).
- Alineación parcial con preferencias mediante la componente DPO del promedio de pesos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no declaradas; el entrenamiento es esencialmente japonés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo puede recibir un contexto recuperado y generar una respuesta extractiva, aprovechando su ajuste sobre JSQuAD y JaQuAD para localizar la evidencia relevante en el pasaje.
- Componente generador en pipelines RAG ligeros: al tener menos de mil millones de parámetros, puede desplegarse en el mismo nodo que el recuperador sin requerir GPU de gran capacidad, reduciendo la latencia extremo a extremo.
- Question answering multi-salto sobre bases de conocimiento estructuradas: el entrenamiento con JEMHopQA lo hace adecuado para preguntas que requieren encadenar dos o tres hechos dentro de un contexto dado.
- Prototipado rápido de asistentes documentales en japonés: su tamaño permite iterar con cuantización en CPU o GPU de gama media durante fases de diseño.
- Evaluación de técnicas de model averaging: sirve como caso de estudio reproducible para comparar el efecto de promediar un checkpoint SFT con uno DPO frente a usar cada uno por separado.
- Filtrado y reordenación de pasajes en recuperación: puede puntuar la relevancia de fragmentos recuperados respecto a una consulta en japonés antes de pasarlos a un modelo mayor.
- Generación de pares pregunta-respuesta sintéticos a partir de artículos de Wikipedia en japonés, dado el uso de auto-wiki-qa en su linaje de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7-1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5-0,6 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4070) es suficiente en FP16; para despliegue en servidor, una T4 o L4 basta.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 6 GB o más, e incluso en CPU con cuantización de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles en principio al ser un transformer denso en safetensors, aunque no se ha verificado su funcionamiento con la arquitectura `qwen3_5` en todas ellas.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| satoyutaka/qwen35-08b-rag-avg-jem1-dpofmsc | 873 M | no disponible | other | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible en esta ficha | no disponible | Hugging Face, modelo oficial |
| Modelos QA japoneses de tamano similar (p. ej. variantes de Qwen o Llama ajustadas a JGLUE) | ~0,5-1 B | variable | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia es `other`, sin texto específico en la model card; es necesario consultar los términos del modelo base Qwen3.5-0.8B y de los datasets (CC BY-SA 4.0 y CC BY-SA 3.0) antes de cualquier uso comercial.
- Los datasets de entrenamiento tienen licencias con cláusula share-alike (CC BY-SA), lo que puede condicionar la distribución de derivados.
- El modelo está especializado en japonés; su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación inherente a un modelo de menos de mil millones de parámetros, especialmente en preguntas que requieran conocimiento factual no presente en el contexto.
- No se documentan evaluaciones de sesgo, seguridad ni robustez frente a prompts adversarios.
- Es un promedio de pesos sin entrenamiento posterior, por lo que puede heredar inconsistencias de los dos checkpoints combinados.
- No hay información sobre la longitud de contexto efectiva, lo que impide garantizar su comportamiento en contextos largos típicos de RAG.
- El repositorio no registra descargas ni validación comunitaria; no debe asumirse calidad de producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-avg-jem1-dpofmsc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://huggingface.co/datasets/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JSQuAD (JGLUE): https://huggingface.co/datasets/yahoojapan/JGLUE
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD

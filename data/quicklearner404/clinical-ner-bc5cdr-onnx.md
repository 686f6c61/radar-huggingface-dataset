# quicklearner404/clinical-ner-bc5cdr-onnx

## Resumen

ClinicalNER es un modelo de reconocimiento de entidades nombradas (NER) especializado en texto biomédico y clínico, desarrollado por el usuario quicklearner404. Se trata de un fine-tuning de DistilRoBERTa sobre el conjunto de datos BC5CDR (BioCreative V Chemical-Disease Relations), orientado a detectar menciones de compuestos químicos/fármacos y enfermedades. El modelo se distribuye exclusivamente en formato ONNX, con una versión fp32 y otra cuantizada dinámicamente a INT8 pensada para servir en CPU.

La relevancia del modelo radica en su enfoque de despliegue: al exportarse a ONNX e incluir una variante INT8 con métricas equivalentes a la versión fp32 (F1 global de 0,857 en ambos casos), ofrece una opción ligera para pipelines de extracción de información biomédica sin necesidad de GPU. El repositorio ocupa 0,4 GB e incluye tokenizador, configuración y un informe completo de métricas.

Se posiciona como un prototipo de investigación, no como una herramienta de producción clínica: el autor advierte explícitamente que se entrenó sobre resúmenes de PubMed y no sobre notas hospitalarias reales, por lo que el rendimiento en texto clínico real será inferior al reportado en el conjunto de test de BC5CDR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa, destilación de RoBERTa) |
| Parametros totales | no disponible (DistilRoBERTa base, orden de ~82 M; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por la arquitectura RoBERTa; no confirmada en la informacion) |
| Tipos de cuantizacion | INT8 (cuantizacion dinamica) y fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | other (ver limitaciones; el autor remite a los terminos de BioCreative V CDR) |
| Formato de pesos | ONNX (`model.onnx` fp32, `model.int8.onnx` INT8); tokenizador en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de DistilRoBERTa, una versión destilada de RoBERTa que reduce el número de capas del encoder original manteniendo el tokenizador BPE de RoBERTa (con `add_prefix_space` y pre-división de palabras). Sobre esta base se realiza un fine-tuning para token classification con dos etiquetas de entidad: `Chemical` y `Disease`, usando el dataset `tner/bc5cdr`.

El entrenamiento se lleva a cabo sobre el conjunto BC5CDR, derivado de resúmenes de PubMed y orientado a la tarea de relaciones químico-enfermedad de BioCreative V. Posteriormente, el modelo se exporta a ONNX y se cuantiza dinámicamente a INT8 para inferencia en CPU. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo NER). La innovación destacable es la conservación de métricas tras la cuantización: el F1 del modelo INT8 coincide con el del fp32 (0,857).

## Capacidades

- Reconocimiento de entidades nombradas de tipo `Chemical` (fármacos, compuestos) y `Disease` (enfermedades) en texto biomédico en inglés.
- Clasificación a nivel de token con etiquetado BIO implícito en el esquema del dataset BC5CDR.
- Inferencia en CPU gracias a la exportación ONNX e cuantización INT8.
- Integración con la librería `tokenizers` mediante `tokenizer.json` (BPE de RoBERTa con pre-división de palabras).
- Uso previsto como componente de un servicio (ClinicalNER API) desplegable con `docker compose`.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido: es un modelo puramente de etiquetado de tokens.

## Casos de uso

- Extracción de fármacos y enfermedades en literatura biomédica: el modelo puede procesar resúmenes de PubMed para poblar bases de datos de entidades químicas y enfermedades, aprovechando que fue entrenado exactamente sobre ese dominio (BC5CDR).
- Construcción de grafos de conocimiento biomédicos: las menciones detectadas de `Chemical` y `Disease` sirven como nodos para pipelines de relación químico-enfermedad, base del dataset original.
- Preprocesado para sistemas de farmacovigilancia: detección de menciones de fármacos y efectos adversos en textos científicos para su posterior revisión por expertos.
- Indexación y búsqueda semántica en repositorios documentales: etiquetar documentos con entidades para mejorar la recuperación de información en buscadores internos de organizaciones sanitarias o editoriales científicas.
- Servicio ligero en CPU: al disponer de ONNX INT8, puede desplegarse en contenedores sin GPU para APIs de extracción de entidades de bajo coste, como demuestra la ClinicalNER API del propio autor.
- Anotación asistida de corpus: generar preanotaciones automáticas de entidades para que anotadores humanos las revisen, acelerando la creación de datasets clínicos etiquetados.
- Prototipado de investigación en NLP clínico: punto de partida para experimentos de NER biomédico antes de invertir en modelos mayores o en datos propios.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test de BC5CDR (entity-level, seqeval):

| Metrica | Valor |
|---|---|
| Precision | 0,835 |
| Recall | 0,880 |
| F1 global | 0,857 |
| F1 Chemical | 0,912 |
| F1 Disease | 0,793 |
| F1 modelo ONNX INT8 | 0,857 |

No se han publicado en la información disponible comparaciones con otros modelos en esta tabla.

## Requisitos de hardware

- VRAM estimada: no aplica para la variante INT8, diseñada para CPU; la variante fp32 puede ejecutarse en GPU con muy poca memoria (modelo de tamaño DistilRoBERTa, orden de cientos de MB), aunque no se especifica cifra exacta.
- GPU recomendadas: no disponible; el modelo está optimizado para servir en CPU.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño reducido del repositorio (0,4 GB) y la naturaleza destilada del modelo base.
- Opciones de despliegue: ONNX Runtime (formato nativo), contenedor Docker mediante la ClinicalNER API (`docker compose up`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ONNX de token classification).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otros fine-tunings de BERT/RoBERTa sobre BC5CDR) para establecer una comparación rigurosa. Se indica "no disponible".

| Modelo | Parametros | Contexto | F1 BC5CDR | Licencia | Formato |
|---|---|---|---|---|---|
| ClinicalNER (este modelo) | no disponible (base DistilRoBERTa) | no disponible | 0,857 | other | ONNX (fp32/INT8) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre resúmenes de PubMed, no sobre notas clínicas hospitalarias: el autor advierte que la precisión en texto clínico real será inferior a la reportada.
- Prototipo de investigación: no debe usarse para diagnóstico ni para decisiones de tratamiento.
- Licencia "other": el autor remite a los términos de BioCreative V CDR antes de cualquier uso comercial; es imprescindible revisarlos.
- Solo inglés: no soporta castellano ni otros idiomas.
- Riesgo de alucinación y falsos positivos/negativos inherente a un modelo NER; el F1 de la clase `Disease` (0,793) es notablemente inferior al de `Chemical` (0,912), lo que indica mayor fragilidad en la detección de enfermedades.
- El uso requiere pre-división de palabras y lectura de la etiqueta del primer sub-token de cada palabra, lo que añade complejidad de integración frente a un pipeline estándar.
- Sin datos publicados sobre sesgos demográficos o de dominio; al derivarse de literatura científica, puede reflejar sesgos de la investigación publicada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quicklearner404/clinical-ner-bc5cdr-onnx
- Repositorio de la ClinicalNER API: https://github.com/quicklearner404/ClinicalNER
- Dataset BC5CDR en Hugging Face: https://huggingface.co/datasets/tner/bc5cdr
- Modelo base DistilRoBERTa: https://huggingface.co/distilbert/distilroberta-base

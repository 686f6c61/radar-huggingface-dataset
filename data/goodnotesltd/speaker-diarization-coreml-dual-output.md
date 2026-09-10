# GoodnotesLtd/speaker-diarization-coreml-dual-output

## Resumen

GoodnotesLtd/speaker-diarization-coreml-dual-output es un modelo de embedding de hablante exportado a Core ML, publicado por Goodnotes Ltd en septiembre de 2026. No es un modelo de lenguaje: se trata de un componente de un pipeline de diarización de hablantes (identificación de quién habla y cuándo) y deriva de FluidInference/speaker-diarization-coreml, revisión 1ed7a662fdc7109e36d822db793ee6eebdaf8594, que a su vez se basa en pyannote Community-1.

La modificación aportada consiste en un export con doble salida: se conserva la salida `embedding` normalizada para extracción de identidad de voz y se añade una salida Float32 `embedding_raw`, calculada antes de la normalización L2, pensada para diarización con PLDA (y, por extensión, para clustering del estilo VBx). La rama añadida emplea un remuestreo de máscaras de hablante con nearest/floor de 589 a 125 tramas, replicando el modelo de embedding ONNX de referencia. Todos los pesos aprendidos permanecen sin cambios.

Su relevancia es de nicho pero concreta: permite ejecutar la etapa de embedding de un pipeline de diarización en hardware Apple mediante Core ML, y ofrece el vector bruto que los esquemas PLDA necesitan antes de restar su media entrenada, algo que la salida normalizada original no permite. No es un pipeline autónomo de PCM a hablantes: el consumidor debe aportar el resto de componentes y seleccionar explícitamente la salida adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de embedding de hablante exportada a Core ML; derivada de pyannote Community-1 via FluidInference/speaker-diarization-coreml) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de embedding; la rama añadida remuestrea máscaras de hablante de 589 a 125 tramas) |
| Tipos de cuantizacion | no disponible; el modelo base está etiquetado como cuantizado (base_model:quantized:FluidInference/speaker-diarization-coreml) |
| Idiomas soportados | no disponible (no se documenta ningún conjunto de idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (paquete .mlmodel y modelo compilado .mlmodelc) |
| Salidas | `embedding` normalizado (identidad de voz) y `embedding_raw` Float32 (pre-normalización L2, para PLDA) |
| SHA-256 de pesos | 99356b2985b8d43880a657024d941d450b38820451ccff903f76ed4e52d1868b |
| Herramientas de construccion | coremltools 9.0 y compilador Core ML de Apple |
| Modelo base | FluidInference/speaker-diarization-coreml (revision 1ed7a662fdc7109e36d822db793ee6eebdaf8594) |
| Tamano del repositorio | 0,0 GB segun los metadatos de HuggingFace (no permite estimar el peso real) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es una exportación modificada de un export previo a Core ML, no un entrenamiento nuevo. Según la model card, todos los pesos aprendidos son idénticos a los del modelo de origen y solo cambia la topología de salida: se mantiene la rama de identidad original y se añade una segunda rama que emite el vector bruto antes de la normalización L2. Esa rama usa remuestreo nearest/floor de máscaras de hablante de 589 a 125 tramas para alinearse con el modelo de embedding ONNX de referencia. No hay información sobre número de parámetros, capas, dimensión del embedding ni composición del dataset de entrenamiento original.

Tampoco se documentan en la información disponible procesos de RLHF, DPO ni ajuste por instrucciones, algo esperable porque no es un modelo generativo. La innovación técnica destacable es de interoperabilidad numérica: exponer el vector pre-normalización permite alimentar esquemas PLDA, que deben recibir el vector bruto antes de restar su media entrenada, algo imposible con la salida normalizada del export original. El trabajo se apoya en investigación previa citada por el autor: la pérdida Powerset multi-class cross entropy de Plaquet y Bredin (INTERSPEECH 2023), el toolkit Wespeaker de Wang et al. (ICASSP 2023) y el clustering Bayesiano HMM de secuencias x-vector (VBx) de Landini et al. (Computer Speech & Language, 2022).

## Capacidades

- Extracción de embedding de hablante normalizado a partir de máscaras de hablante, reutilizando la rama de identidad del export original sin cambios.
- Emisión adicional de `embedding_raw` en Float32, antes de la normalización L2, para diarización con PLDA.
- Remuestreo de máscaras de hablante con nearest/floor de 589 a 125 tramas, alineado con el modelo de embedding ONNX de referencia.
- No realiza segmentación de voz ni extracción de características: requiere `FBank.mlmodelc` y `Segmentation.mlmodelc` de la revisión original del modelo base.
- No ejecuta clustering ni asignación de etiquetas de hablante por sí mismo; esas etapas quedan fuera del alcance del repositorio.
- No es un modelo generativo: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling, function calling ni flujos de agentes.
- No se documenta soporte multilingüe ni evaluación por idioma.
- Salidas seleccionables por el consumidor: la elección entre `embedding` y `embedding_raw` es responsabilidad explícita de la aplicación.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el embedding alimenta la etapa de clustering (por ejemplo VBx sobre vectores brutos) para etiquetar cada segmento transcrito con la persona que habla, combinando este modelo con FBank y Segmentation del export original.
- Analítica de llamadas de atención al cliente: separar turnos de agente y cliente sobre audio telefónico para calcular tiempos de habla, solapamientos einterrupciones por interlocutor.
- Postproducción de pódcast y entrevistas: generar pistas o marcas de hablante para edición automática y subtitulado con etiquetas de quién habla en cada intervención.
- Indexación y búsqueda por voz en archivos de audio: usar la rama de identidad normalizada como firma de voz para agrupar o recuperar fragmentos de un mismo locutor en un archivo histórico.
- Documentación clínica o legal: separar interlocutores en grabaciones de consulta, entrevista o vista oral antes de la transcripción manual o automática, reduciendo el trabajo de atribución.
- Accesibilidad: transcripciones con identificación de hablante para personas con discapacidad auditiva en entornos de reunión o aula.
- Investigación reproducible en diarización sobre hardware Apple: servir como referencia Core ML numéricamente comparable con el modelo ONNX equivalente (similitud coseno del vector bruto de 0,999924 frente a la referencia).
- Enrolamiento de voz y verificación de locutor: la rama normalizada permite comparar voces contra muestras de referencia, aunque la model card advierte que los umbrales operativos requieren evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de DER (Diarization Error Rate), EER ni métricas de precisión de reconocimiento de hablante para este export.

La model card sí incluye comprobaciones numéricas de exportación frente al modelo ONNX de referencia:

| Comprobacion | Valor | Naturaleza |
|---|---|---|
| Similitud coseno del vector bruto (`embedding_raw`) | 0,999924 | Verificación numérica de exportación |
| Relación de norma (norm ratio) | 1,00031 | Verificación numérica de exportación |

Estas cifras verifican que la exportación reproduce el modelo de referencia en los casos de prueba; el propio autor indica explícitamente que no constituyen garantías de precisión general de reconocimiento de hablante ni de seguridad de identidad.

## Requisitos de hardware

- Diseñado para el tiempo de ejecución Core ML, orientado a hardware Apple: Neural Engine, CPU y GPU de chips de la serie M y de dispositivos iOS.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El destino es hardware Apple; no hay soporte CUDA documentado.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual (NVIDIA/AMD). La ejecución depende del soporte Core ML del dispositivo Apple concreto.
- Opciones de despliegue: framework Core ML con el paquete `.mlmodel` y el modelo compilado `.mlmodelc` incluidos en el repositorio, construidos con coremltools 9.0 y el compilador Core ML de Apple.
- No compatible con vLLM, llama.cpp, Ollama ni TGI; no es un modelo de lenguaje ni un formato GGUF.
- Latencia y throughput estimados: no disponible.
- Requisito de integración: se debe usar `FBank.mlmodelc` y `Segmentation.mlmodelc` de la revisión original del modelo base; este repositorio no es un pipeline completo de PCM a hablantes.
- Verificación de despliegue: fijar una revisión completa del repositorio y comprobar los checksums de los ficheros, ya que recompilar puede alterar los bytes del artefacto compilado.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Salidas | Reutiliza | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GoodnotesLtd/speaker-diarization-coreml-dual-output | Embedding de hablante | Core ML | `embedding` normalizado y `embedding_raw` Float32 | Pesos del modelo base, sin cambios | CC BY 4.0 | HuggingFace, 0 descargas, 0 likes |
| FluidInference/speaker-diarization-coreml | Export Core ML del pipeline (FBank, Segmentation, Embedding) | Core ML | `embedding` normalizado | Pesos originales | no disponible | HuggingFace (etiquetado como cuantizado) |
| pyannote/speaker-diarization-community-1 | Pipeline de diarización de hablantes (origen de los pesos) | no disponible en la información proporcionada | no disponible | no aplica | no disponible | HuggingFace |

No se dispone de datos de parámetros, contexto ni benchmarks para los tres modelos en la información proporcionada, por lo que la comparación se limita a formato, salidas, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un pipeline autónomo: no convierte PCM en segmentos etiquetados por hablante. Necesita `FBank.mlmodelc` y `Segmentation.mlmodelc` de la revisión original y una etapa de clustering externa.
- Las comprobaciones de exportación (similitud coseno 0,999924, relación de norma 1,00031) son verificación numérica, no evaluación de precisión. No hay datos de DER ni de EER.
- Clustering, enrolamiento de voz, manejo de habla solapada, condiciones de grabación y umbrales operativos requieren evaluación separada por parte del integrador.
- No se incluyen grabaciones, muestras de voz enroladas ni código de aplicación en el repositorio.
- La salida correcta debe seleccionarse explícitamente: usar el vector normalizado donde se espera el bruto (o viceversa) invalida el resultado, especialmente en PLDA.
- Recompilar el paquete puede cambiar los bytes del artefacto; se recomienda fijar una revisión completa y verificar checksums antes de desplegar.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a los autores originales y a FluidInference por la conversión a Core ML. No implica respaldo de los autores originales.
- Sesgos conocidos: no disponible. La model card no documenta sesgos por idioma, acento, género, edad ni condiciones acústicas.
- Idiomas soportados: no disponible; tampoco hay evaluaciones por idioma ni por tipo de audio.
- Limitaciones de contexto: no aplica en el sentido de ventana de tokens, pero la rama añadida asume máscaras de hablante remuestreadas de 589 a 125 tramas, lo que condiciona su uso fuera de ese contrato de entrada.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización en la misma fecha (2026-09-10).
- El tamaño del repositorio figura como 0,0 GB, un dato que no permite estimar el peso real de los artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GoodnotesLtd/speaker-diarization-coreml-dual-output
- Modelo base: https://huggingface.co/FluidInference/speaker-diarization-coreml
- Revisión concreta del modelo base: https://huggingface.co/FluidInference/speaker-diarization-coreml/tree/1ed7a662fdc7109e36d822db793ee6eebdaf8594
- Modelo de origen de los pesos (pyannote Community-1): https://huggingface.co/pyannote/speaker-diarization-community-1
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Referencia científica citada (sin URL en la model card): Plaquet y Bredin, "Powerset multi-class cross entropy loss for neural speaker diarization", INTERSPEECH 2023.
- Referencia científica citada (sin URL en la model card): Wang et al., "Wespeaker: A research and production oriented speaker embedding learning toolkit", ICASSP 2023.
- Referencia científica citada (sin URL en la model card): Landini et al., "Bayesian HMM clustering of x-vector sequences (VBx) in speaker diarization: theory, implementation and analysis on standard tasks", Computer Speech & Language, 2022.
- Búsqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondían a software de circunvención ajeno por completo a esta ficha.

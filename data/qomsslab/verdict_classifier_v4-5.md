# QomSSLab/verdict_classifier_v4.5

## Resumen

QomSSLab/verdict_classifier_v4.5 es un modelo de clasificación de texto (pipeline `text-classification`) publicado por el laboratorio QomSSLab en HuggingFace. Está construido sobre la arquitectura ModernBERT, según reflejan las etiquetas del repositorio, y cuenta con 307.533.316 parámetros almacenados en formato safetensors, lo que lo sitúa en el rango de los clasificadores encoder-only de tamano medio-grande. El repositorio ocupa 1,3 GB y su acceso está restringido: es un modelo *gated*, por lo que es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo.

El modelo está declarado exclusivamente para persa (`fa`), lo que lo orienta a tareas de clasificación sobre texto en ese idioma. Por el nombre del repositorio, "verdict_classifier", cabe inferir un uso relacionado con la clasificación de veredictos o resoluciones (probablemente en el ámbito legal o de moderación), aunque la informacion disponible no detalla el conjunto de etiquetas ni la taxonomia exacta que predice.

Su relevancia actual es limitada pero concreta: se trata de un modelo recién publicado (creado el 27 de septiembre de 2026), sin descargas ni likes registrados, y sin licencia declarada ni documentación asociada. Resulta de interés para quien necesite un clasificador encoder-only en persa con arquitectura moderna y contexto largo, pero debe evaluarse con cautela al no existir benchmark, ficha de modelo ni condiciones de uso publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, según etiquetas del repositorio) |
| Parametros totales | 307.533.316 (307,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de Contexto | no disponible (la familia ModernBERT admite ventanas de hasta 8192 tokens en sus variantes estandar, pero no se confirma la configuracion de este modelo) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | persa (fa) |
| Licencia | no disponible (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,3 GB |
| Pipeline | text-classification |
| Acceso | restringido (gated) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `modernbert` del repositorio, que indica que el modelo se basa en la arquitectura ModernBERT: un transformer encoder-only que sustituye la atencion clasica por atencion con RoPE, alterna capas de atencion global y local, y emplea activaciones GeGLU junto con normalizacion pre-RMSNorm. Este diseno esta optimizado para eficiencia en GPU y para manejar secuencias de hasta 8192 tokens, muy por encima de los 512 tokens tipicos de BERT. El recuento de 307,5 M de parametros no coincide exactamente con las variantes publicas ModernBERT-base (149 M) ni ModernBERT-large (395 M), por lo que se trata presumiblemente de una configuracion intermedia o ajustada por el autor.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens utilizados, la composicion del dataset, la existencia de ajuste fino supervisado, ni sobre tecnicas de alineacion como RLHF o DPO. Tampoco se documenta si el modelo parte de un checkpoint preentrenado Multilingual ModernBERT o de un entrenamiento desde cero. Todos estos datos figuran como no disponibles en la informacion proporcionada.

## Capacidades

- Clasificacion de texto en persa: es la funcion declarada por el pipeline (`text-classification`); produce una o varias etiquetas con su puntuacion de confianza.
- Procesamiento de secuencias largas: al derivar de ModernBERT, es previsible que soporte entradas muy superiores a los 512 tokens habituales, aunque la longitud exacta no esta confirmada.
- Especializacion tematica probable en veredictos o resoluciones, a juzgar por el nombre del repositorio; la taxonomia concreta de clases no esta documentada.
- Extraccion de representaciones: la etiqueta `text-embeddings-inference` sugiere compatibilidad con el servidor de inferencia de embeddings de HuggingFace, aunque la tarea principal es clasificacion.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en HuggingFace Inference Endpoints.
- Generacion de texto: no aplica, es un modelo encoder-only sin cabeza generativa.
- Tool calling / function calling: no disponible, no es una capacidad esperada en un clasificador encoder-only.
- Razonamiento multi-paso y agentes: no disponible.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Clasificacion de resoluciones judiciales en persa: si el conjunto de etiquetas corresponde a tipos de veredicto, el modelo permitiria etiquetar automaticamente sentencias y autos, alimentando sistemas de gestion documental en juzgados o despachos.
- Triage de expedientes legales: ordenar grandes volumenes de documentos juridicos persas por categoria antes de la revision humana, reduciendo el coste de primera linea en despachos y departamentos juridicos.
- Moderacion de contenido en persa: usar el clasificador para etiquetar publicaciones o comentarios segun su categoria (por ejemplo, veredicto o no veredicto) en plataformas con audiencia persa.
- Enrutado de tickets de soporte: clasificar consultas entrantes en persa por tipologia para dirigirlas al equipo adecuado dentro de un centro de atencion.
- Analisis de opinion y sentimiento sobre texto persa: reutilizar la cabeza de clasificacion para tareas de polaridad o tematica tras el correspondiente ajuste fino.
- Construccion de buscadores semanticos en persa: aprovechando la compatibilidad con text-embeddings-inference, generar representaciones para un motor de recuperacion sobre corpus en persa.
- Filtrado previo en pipelines de anotacion: preetiquetar grandes corpus para que anotadores humanos solo revisen los casos de baja confianza, acelerando la creacion de datasets supervisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de tareas de clasificacion especificas (F1, precision, recall) en la ficha del repositorio consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32, en torno a 620 MB en FP16/BF16 y unos 310 MB en INT8. Estas cifras son estimaciones teoricas a partir del recuento de parametros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4090, L4, A10G, A100 o H100 pueden ejecutarlo sin dificultad.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos anos (GTX 1660 en adelante, y tambien iGPU con suficiente memoria compartida) puede alojar el modelo.
- Opciones de despliegue: transformers (libreria declarada), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`) y Text Embeddings Inference (etiqueta `text-embeddings-inference`). No se documenta soporte para vLLM, llama.cpp u Ollama, y al no publicarse cuantizaciones GGUF no cabe esperar despliegue en llama.cpp sin conversion manual.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| QomSSLab/verdict_classifier_v4.5 | 307,5 M | no disponible | persa (fa) | no disponible | no disponible |
| answerdotai/ModernBERT-base | 149 M | 8192 tokens | ingles | Apache 2.0 | no comparable directamente (idioma distinto) |
| answerdotai/ModernBERT-large | 395 M | 8192 tokens | ingles | Apache 2.0 | no comparable directamente (idioma distinto) |
| HooshvareLab/bert-fa-base-uncased (ParsBERT) | ~162 M | 512 tokens | persa | Apache 2.0 | no comparable directamente (tareas distintas) |
| xlm-roberta-base | 278 M | 512 tokens | multilingue | MIT | no comparable directamente (tareas distintas) |

La comparacion es estructural: no existen datos publicos de rendimiento del modelo de QomSSLab que permitan situarlo frente a alternativas en tareas de clasificacion en persa.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card detallada, ni descripcion del dataset, ni taxonomia de etiquetas, lo que impide conocer con precision que clases predice y con que fiabilidad.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace y disponer de un token de acceso para descargar los pesos, lo que complica la automatizacion de pipelines y la reproducibilidad.
- Riesgo de sesgo: al estar entrenado presumiblemente sobre corpus persas, puede heredar sesgos geograficos, religiosos, politicos o de genero presentes en los datos; no se documenta ninguna mitigacion.
- Riesgo de alucinacion en la etiqueta: en clasificadores con clases poco representadas o ambiguas, el modelo puede asignar etiquetas con alta confianza de forma incorrecta; sin benchmarks no puede acotarse esta tasa.
- Limitacion idiomatica: el modelo declara unicamente persa; su uso con texto en arabe, urdu o dari (proximos tipologicamente) no esta validado.
- Longitud de contexto incierta: aunque la arquitectura ModernBERT admite secuencias largas, la configuracion concreta de este checkpoint no se ha publicado.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Ausencia de versionado semantico documentado: la etiqueta "v4.5" sugiere iteraciones previas, pero no se enlazan otros checkpoints ni se explica que cambio entre versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QomSSLab/verdict_classifier_v4.5
- Perfil del autor: https://huggingface.co/QomSSLab
- Documentacion de ModernBERT (arquitectura de referencia): https://huggingface.co/docs/transformers/model_doc/modernbert
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Documentacion de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos especificos de este modelo.

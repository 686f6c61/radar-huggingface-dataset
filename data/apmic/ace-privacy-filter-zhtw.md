# APMIC/ACE-privacy-filter-zhtw

## Resumen

ACE-privacy-filter-zhtw es un modelo de clasificacion de tokens (token-classification) desarrollado por APMIC, una compania taiwanesa especializada en soluciones de IA para empresas. Se trata de un ajuste fino del modelo openai/privacy-filter orientado a la deteccion y el etiquetado de informacion personal identificable (PII) en textos en chino tradicional (variante de Taiwan) e ingles. El modelo resuelve un problema concreto: automatizar la identificacion de datos sensibles dentro de documentos y conversaciones para permitir su anonimizacion o redaccion antes de almacenarlos, compartirlos o usarlos como datos de entrenamiento.

El modelo cuenta con aproximadamente 1.400 millones de parametros (1.399.514.992 exactamente) y se distribuye en formato safetensors, con un tamano de repositorio de 2,8 GB. Forma parte de la linea "ACE" de APMIC, orientada a despliegues empresariales, y esta entrenado sobre el dataset nvidia/Nemotron-PII, lo que vincula su desarrollo al ecosistema de NVIDIA para filtrado de privacidad.

Su relevancia actual reside en el cumplimiento normativo: la deteccion automatica de PII es un requisito creciente bajo marcos como el RGPD europeo o la Ley de Proteccion de Datos Personales de Taiwan, y este modelo cubre especificamente el chino tradicional, un idioma con menos cobertura en herramientas de privacidad que el ingles o el chino simplificado. El acceso al modelo esta restringido mediante gated access en HuggingFace y su licencia es propietaria (apmic-proprietary), lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para clasificacion de tokens (token-classification / NER); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 1.399.514.992 (aproximadamente 1,4 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; tamano de 2,8 GB coherente con pesos en FP16/BF16) |
| Idiomas soportados | Chino tradicional (zh, variante de Taiwan) e ingles (en) |
| Licencia | apmic-proprietary (tag de HuggingFace: license:other) |
| Formato de pesos | safetensors |
| Libreria | opf |
| Pipeline | token-classification |
| Modelo base | openai/privacy-filter (finetune) |
| Dataset de entrenamiento | nvidia/Nemotron-PII |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La etiqueta de pipeline (token-classification) y los tags asociados (ner, pii-detection, redaction, de-identification) indican que se trata de un modelo de etiquetado secuencial por token, tipicamente construido sobre un codificador tipo transformer y una cabeza de clasificacion que asigna una etiqueta de entidad a cada token o subtoken. El modelo deriva de openai/privacy-filter mediante ajuste fino supervisado, segun indica el tag base_model:finetune:openai/privacy-filter.

En cuanto al entrenamiento, el unico dato confirmado es el uso del dataset nvidia/Nemotron-PII. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del corpus, la proporcion entre chino tradicional e ingles, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, mezcla de expertos u otras). La especializacion declarada en chino tradicional de Taiwan sugiere un ajuste orientado a entidades y convenciones de nomenclatura propias de ese contexto regional (nombres, direcciones, numeros de identificacion taiwaneses), aunque no se aportan detalles tecnicos al respecto.

## Capacidades

- Deteccion de informacion personal identificable (PII) a nivel de token, con etiquetado de entidades para tareas de NER.
- Redaccion y anonimizacion de datos: el etiquetado permite localizar spans de texto sensible y sustituirlos o enmascararlos.
- Desidentificacion de documentos: soporte para pipelines de de-identification previos a almacenamiento o publicacion.
- Procesamiento bilingue chino tradicional (Taiwan) e ingles dentro del mismo modelo.
- Clasificacion de tokens orientada a integracion en flujos de filtrado de privacidad empresarial.
- No se documenta en la informacion disponible soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode). Dado que es un modelo de clasificacion de tokens y no generativo, estas capacidades no aplican al caso de uso previsto.

## Casos de uso

- Redaccion de PII en atencion al cliente: procesar transcripciones de chats y correos en chino tradicional para enmascarar nombres, telefonos, direcciones y numeros de identificacion antes de archivarlos o enviarlos a analitica.
- Cumplimiento normativo y RGPD/PDPA: preprocesar registros antes de auditorias o solicitudes de acceso, generando versiones anonimizadas que reduzcan la exposicion de datos personales.
- Limpieza de datasets de entrenamiento: filtrar y etiquetar PII en corpus en chino tradicional e ingles antes de usarlos para entrenar otros modelos, reduciendo el riesgo de memorizacion de datos sensibles.
- Desidentificacion de historiales clinicos: etiquetar identificadores de pacientes en documentacion medica en chino tradicional para permitir investigacion sobre datos agregados.
- Saneado de logs y trazas de aplicaciones: detectar y marcar datos personales que aparezcan en logs de produccion antes de enviarlos a sistemas de observabilidad o almacenamiento a largo plazo.
- Revision documental en despachos juridicos: localizar menciones a personas fisicas en contratos y expedientes para facilitar tareas de discovery y anonimizacion previa a la comparticion con terceros.
- Enriquecimiento de CRM empresarial: clasificar campos de texto libre para identificar informacion sensible no estructurada y aplicar politicas de retencion diferenciadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas de precision, recall, F1 ni de comparaciones cuantitativas con otros modelos de deteccion de PII en la informacion proporcionada.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros (1.399.514.992) y no proceden de documentacion oficial del modelo:

- Pesos en FP16/BF16: aproximadamente 2,8 GB, coherente con el tamano del repositorio.
- VRAM estimada para inferencia en FP16/BF16: en torno a 4-6 GB, incluyendo pesos y overhead de activaciones para longitudes de secuencia tipicas.
- VRAM estimada en INT8: aproximadamente 2-3 GB.
- VRAM estimada en INT4: aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100, H100). El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, incluso en modelos de gama media con cuantizacion y en GPUs de 6-8 GB si se aplica cuantizacion agresiva.
- Opciones de despliegue: la libreria declarada es opf y la pipeline es token-classification, por lo que el despliegue natural es mediante HuggingFace Transformers (pipeline de token-classification). No se confirma en la informacion disponible soporte para vLLM, llama.cpp, Ollama, TGI ni disponibilidad de pesos en GGUF.
- Latencia y throughput: no disponibles. Para un modelo de ~1,4 B de parametros en clasificacion de tokens, el coste por secuencia es bajo en GPUs modernas, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APMIC/ACE-privacy-filter-zhtw | 1,4 B (1.399.514.992) | no disponible | zh (tradicional, Taiwan), en | apmic-proprietary | Gated en HuggingFace |
| openai/privacy-filter (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos de deteccion de PII comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base openai/privacy-filter, del cual este modelo es un ajuste fino. No se dispone de datos de rendimiento ni de especificaciones tecnicas del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en HuggingFace antes de poder descargarlo, lo que puede dificultar su evaluacion rapida o su uso en pipelines automatizados.
- Licencia propietaria: la licencia apmic-proprietary (etiquetada como license:other) condiciona el uso comercial. Es imprescindible revisar los terminos completos antes de integrarlo en productos o servicios de produccion.
- Ausencia de benchmarks publicos: no hay metricas de precision, recall o F1 disponibles, por lo que no se puede evaluar su calidad frente a alternativas sin realizar una evaluacion propia.
- Riesgo de falsos negativos y falsos positivos: como cualquier modelo de NER, puede omitir entidades sensibles o marcar como PII fragmentos que no lo son. En contextos de cumplimiento normativo esto requiere validacion humana o capas adicionales de verificacion.
- Cobertura linguistica limitada: solo se declaran chino tradicional (Taiwan) e ingles. No hay soporte confirmado para chino simplificado, castellano ni otras lenguas, lo que limita su uso en organizaciones multilingues.
- Longitud de contexto desconocida: al no especificarse la ventana de contexto, no se puede garantizar el procesamiento de documentos largos sin truncado o segmentacion previa.
- Especializacion regional: el ajuste esta orientado a formatos y entidades propias de Taiwan, por lo que su comportamiento con textos en chino tradicional de otras regiones (Hong Kong, Macao) puede degradarse.
- Modelo no generativo: al ser un clasificador de tokens, no produce texto. No sirve para reescribir o resumir documentos anonimizados, solo para etiquetarlos.
- Ausencia de datos de sesgo: no se documenta ningun analisis de sesgos por genero, origen etnico u otras categorias, algo relevante en tareas de clasificacion de entidades nominales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/APMIC/ACE-privacy-filter-zhtw
- Modelo base: https://huggingface.co/openai/privacy-filter
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Perfil del autor en HuggingFace: https://huggingface.co/APMIC

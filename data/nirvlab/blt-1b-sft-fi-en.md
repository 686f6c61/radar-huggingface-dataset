# NIRVLab/blt-1b-sft-fi-en

## Resumen

NIRVLab/blt-1b-sft-fi-en es un checkpoint de ajuste supervisado (SFT) publicado por NIRVLab (Network for Intelligent Research Vietnam) en HuggingFace en octubre de 2026. El tag `blt` del repositorio apunta a una arquitectura Byte Latent Transformer, es decir, un transformer que opera sobre bytes en lugar de tokens discretos, y el sufijo `fi-en` sugiere un enfoque bilingüe finés-inglés, aunque esta interpretación no está confirmada por los metadatos del repositorio (no hay campo de idiomas ni model card detallada).

El dato más relevante es la discrepancia entre el nombre y el contenido: el identificador indica "1b", pero el recuento real de pesos en safetensors es de 4.633.391.872 parámetros (4,63 mil millones). Además, el repositorio ocupa 327,3 GB, un tamaño muy superior al de los pesos en precisión nativa, lo que indica la presencia de múltiples checkpoints o estados de entrenamiento empaquetados. Es un modelo relevante ahora para investigadores que exploran tokenización byte-level en lenguas de baja resource como el finés, no como un modelo listo para producción.

El modelo no declara licencia, idiomas, pipeline ni resultados de evaluación, y su adopción es prácticamente nula (45 descargas, 0 likes), por lo que cualquier evaluación sobre capacidades reales debe hacerse de forma empírica por el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte Latent Transformer (BLT), segun el tag `blt` del repositorio; no hay model card que describa la configuracion |
| Parametros totales | 4.633.391.872 (4,63 mil millones) segun safetensors; el nombre del modelo indica "1b", discrepancia no explicada en los metadatos |
| Parametros activos | No aplica; no hay evidencia de arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; no se han publicado repositorios GGUF, GPTQ, AWQ ni similar |
| Idiomas soportados | No disponible; el sufijo `fi-en` del nombre sugiere fines-ingles, sin confirmacion oficial |
| Licencia | No disponible |
| Formato de pesos | safetensors (unico formato declarado en los tags) |

## Arquitectura y entrenamiento

El tag `blt` identifica el modelo como una implementacion de Byte Latent Transformer, la familia de arquitecturas que sustituye la tokenizacion subword por una representacion directa de bytes agrupados en parches de longitud dinamica. Este diseno busca eliminar la dependencia de un vocabulario fijo y mejorar la robustez frente a erratas, ruido y lenguas con morfologia aglutinante y vocabulario productivo, como el fines. No se dispone de informacion sobre el numero de capas, dimension oculta, numero de cabezas, tamano de parche ni presupuesto de contexto: la model card publica no incluye ficha tecnica.

El sufijo `sft` indica que se trata de un checkpoint ajustado con supervision (supervised fine-tuning) sobre una base previa, presumiblemente del mismo autor en el par de idiomas fi-en. No hay datos en la informacion proporcionada sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, ni sobre innovaciones adicionales como decodificacion especulativa. El tamano del repositorio (327,3 GB) sugiere que se han subido varios estados o pasos intermedios junto con los pesos finales, algo habitual en repositorios de investigacion pero poco practico para distribucion.

## Capacidades

- Generacion de texto autoregresiva sobre representacion de bytes, segun la arquitectura declarada.
- Robustez potencial frente a errores tipograficos, mayusculas inconsistentes y texto sin normalizar, al no depender de un vocabulario de subpalabras cerrado.
- Ajuste supervisado orientado a tareas de instruccion, segun el sufijo `sft`.
- Posible comportamiento bilingue fines-ingles, inferido del sufijo `fi-en` y de la existencia de otro modelo del mismo autor con la misma nomenclatura (MorphBART-fi-en); no confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Traduccion fines-ingles e ingles-fines en dominios con mucha variacion morfologica: la representacion byte-level evita los fallos tipicos de tokenizacion en palabras compuestas finesas, lo que resulta util en traduccion de documentacion tecnica y administrativa.
- Normalizacion y limpieza de corpus fineses: el modelo puede emplearse para reescribir texto con erratas, abreviaturas o formato inconsistente sin perder informacion, al operar sobre bytes y no sobre tokens.
- Investigacion en tokenizacion byte-level: sirve como checkpoint de referencia para comparar BLT frente a transformers basados en BPE en tareas de perplejidad y generacion para lenguas de baja resource.
- Procesamiento de texto ruidoso (OCR, subtitulos automaticos, mensajes de usuario): la granularidad de byte reduce el impacto de artefactos de segmentation, adecuado para pipelines de preprocesado previo a otros modelos.
- Experimentacion academica con fine-tuning: al ser un checkpoint SFT pequeno en comparacion con modelos frontera, un grupo de investigacion puede adaptarlo a un dominio concreto (legal, sanitario) con presupuesto limitado de GPU.
- Generacion asistida en entornos sin tokenizer externo: util en despliegues donde se quiere evitar gestionar un vocabulario y sus actualizaciones, a costa de secuencias mas largas.
- Base para evaluation harness de modelos BLT: permite medir latencia y throughput de la arquitectura en hardware consumer, un dato escaso en la literatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 9,3 GB solo para pesos, mas cache de activaciones y KV; en la practica se necesitan del orden de 12-16 GB para contextos cortos.
- VRAM estimada en int8: en torno a 4,6 GB de pesos; en int4, unos 2,4 GB, aunque no existen repositorios cuantizados publicados y habria que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a contexto largo; RTX 4090 (24 GB) y L40S (48 GB) suficientes para inferencia en bf16.
- Cabe en GPU consumer: si, en RTX 4090 y RTX 3090 en bf16; en RTX 4060 Ti 16 GB de forma ajustada; en GPUs de 8 GB solo tras cuantizacion a int4/int8, que el usuario debe producir.
- Despliegue: no hay confirmacion de soporte en vLLM, TGI, llama.cpp ni Ollama; al tratarse de una arquitectura BLT es probable que requiera la implementacion de referencia del autor o un runtime con kernels especificos, pero este extremo no esta verificado en la informacion disponible.
- Almacenamiento: el repositorio completo ocupa 327,3 GB, por lo que la descarga requiere ese espacio en disco aunque solo se utilicen los pesos finales.
- Latencia y throughput: no disponible. Las arquitecturas byte-level generan mas pasos por unidad de texto que las basadas en tokens, lo que incrementa el coste por peticion.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa. La informacion disponible solo permite identificar los siguientes modelos relacionados, sin cifras comparables:

| Modelo | Autor | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| blt-1b-sft-fi-en | NIRVLab | 4,63 B (segun safetensors) | No disponible | No disponible | BLT, SFT, par fi-en inferido; 45 descargas |
| MorphBART-fi-en | NIRVLab | No disponible | No disponible | No disponible | Otro modelo fi-en del mismo autor, arquitectura seq2seq tipo BART |
| Familia BLT de referencia (Meta) | Meta | No disponible en la informacion | No disponible | No disponible | Arquitectura original en la que se basa el tag `blt` |
| navya-1 (1.31B) | navyam-ai | 1,31 B | No disponible | No disponible | Modelo financiero India-first; no comparable en tarea ni idioma |

## Limitaciones y advertencias

- Licencia no especificada: sin terminos explicitos no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de model card: no se documentan datos de entrenamiento, idiomas, contexto ni evaluaciones, lo que impide auditar sesgos o calidad.
- Discrepancia entre el nombre ("1b") y el recuento real de parametros (4,63 B): puede inducir a error en la planificacion de recursos.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks ni evaluaciones publicadas, no existe evidencia sobre fidelidad factual.
- Idiomas no declarados: aunque el sufijo apunta a fines-ingles, el comportamiento en castellano es desconocido y probablemente deficiente.
- Validacion practica inexistente: 0 likes y 45 descargas en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Posible falta de soporte en runtimes estandar: la arquitectura BLT puede requerir codigo a medida, con el coste de ingenieria asociado.
- Coste computacional de la tokenizacion byte-level: secuencias mas largas implican mas pasos de decodificacion y mayor latencia por token generado.
- Sesgos: no documentados; al entrenarse presumiblemente sobre corpus fineses e ingleses, heredara los sesgos de esas fuentes.

## Enlaces

- HuggingFace: https://huggingface.co/NIRVLab/blt-1b-sft-fi-en
- Colecciones del autor: https://huggingface.co/NIRVLab/collections
- Otro modelo fi-en del mismo autor: https://huggingface.co/NIRVLab/MorphBART-fi-en
- Registro de actividad del repositorio (SAVRN): https://savrn.com/model-tracker
- Indice de benchmarks de modelos (octubre 2026): https://benchlm.ai/

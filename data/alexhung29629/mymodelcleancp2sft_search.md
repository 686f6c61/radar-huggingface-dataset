# AlexHung29629/MyModelCleanCP2SFT_SEARCH

## Resumen

MyModelCleanCP2SFT_SEARCH es un modelo multimodal de tipo image-text-to-text publicado por el usuario AlexHung29629 en HuggingFace. Segun los metadatos del repositorio, se trata de un ajuste fino (fine-tuning) supervisado derivado de la familia Gemma 4, con 25.805.933.872 parametros totales en formato safetensors y un tamano de repositorio de 53,1 GB. La nomenclatura del identificador sugiere un proceso de SFT (supervised fine-tuning) sobre un dataset de busqueda (`search-sft-clean.jsonl`) y un pipeline de limpieza previo ("CleanCP2").

El modelo se distribuye bajo acceso restringido (gated), lo que implica que cualquier uso requiere aceptar condiciones en la plataforma. La model card no declara licencia, idiomas soportados ni resultados de benchmarks; el unico bloque model-index presente contiene una entrada con nombre de experimento pero la lista de resultados vacia. Esto limita severamente cualquier evaluacion objetiva de su rendimiento.

Por su tamano (aproximadamente 26 mil millones de parametros) y su naturaleza multimodal, el modelo se situa en la categoria de modelos grandes que requieren infraestructura de GPU de centro de datos para inferencia en precision completa, aunque podria desplegarse en configuraciones cuantizadas sobre GPUs de gama alta para consumidores. La ausencia de documentacion tecnica publica hace que esta ficha deba tratarse como una descripcion estructural basada en metadatos, no como una evaluacion de capacidades verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Gemma 4; detalles no disponibles) |
| Parametros totales | 25.805.933.872 (25,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Acceso | restringido (gated) |
| Tamano del repositorio | 53,1 GB |

## Arquitectura y entrenamiento

Los metadatos indican que el modelo pertenece a la familia Gemma 4 y que ha sido generado mediante `generated_from_trainer`, lo que confirma un proceso de fine-tuning supervisado sobre un checkpoint base. El dataset declarado es `data/search-sft-clean.jsonl`, lo que apunta a un conjunto de datos orientado a tareas de busqueda conversacional, presumiblemente con pares de instruccion-respuesta limpiados. El identificador del experimento en el model-index (`gemma4-26b-fft-clean-noeaft-cp-search`) sugiere un ajuste fino completo (FFT, full fine-tuning) en lugar de LoRA u otras tecnicas parametro-eficientes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni sobre innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La naturaleza multimodal (image-text-to-text) implica un codificador visual acoplado a un decoder de lenguaje, pero no se detalla la arquitectura exacta del adaptador ni la resolucion de imagen soportada. Tampoco se documenta si el entrenamiento incluyo etapas de alineacion posteriores al SFT.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text), lo que permite responder preguntas sobre imagenes.
- Ajuste especifico para tareas de busqueda, segun el dataset de entrenamiento declarado (`search-sft-clean.jsonl`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que facilita su despliegue mediante la Inference API de HuggingFace.
- Integracion con el ecosistema transformers y registro de metricas en TensorBoard durante el entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras modalidades mas alla de imagen y texto.

## Casos de uso

- Busqueda conversacional aumentada: el modelo puede recibir una consulta en lenguaje natural junto con una imagen (por ejemplo, una captura de pantalla o un producto) y generar una respuesta o reformulacion de busqueda, aprovechando su entrenamiento sobre un dataset especifico de busqueda.
- Asistencia visual para atencion al cliente: dado que procesa image-text-to-text, podria emplearse para interpretar capturas de error o fotos de productos enviadas por usuarios y generar respuestas contextualizadas, siempre que se valide su calidad en ese dominio.
- Prototipado de asistentes multimodales en investigacion: su disponibilidad en transformers y su compatibilidad con endpoints permiten integrarlo rapidamente en cuadernos y pipelines experimentales para estudiar el comportamiento de modelos Gemma 4 ajustados.
- Generacion de descripciones y metadatos a partir de imagenes: util para enriquecer catalogos o bases documentales donde se requiera texto asociado a contenido visual.
- Evaluacion comparativa de fine-tuning completo frente a metodos parametro-eficientes: al ser un FFT declarado sobre Gemma 4, sirve como referencia en estudios sobre coste y rendimiento del ajuste completo.
- Despliegue interno en entornos controlados: el acceso gated permite restringir su distribucion, lo que encaja en organizaciones que necesitan un modelo privado para tareas de busqueda interna sin exponerlo publicamente.

## Benchmarks y rendimiento

El model-index oficial contiene una unica entrada con nombre de experimento (`outputs/gemma4-26b-fft-clean-noeaft-cp-search`) y la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV, lo que exige GPUs de 80 GB o configuraciones multi-GPU.
- Cuantizacion a 8 bits: alrededor de 26 GB de pesos, viable en una A100 40 GB o H100 80 GB con margen para contexto.
- Cuantizacion a 4 bits: alrededor de 13-15 GB de pesos, lo que permitiria su ejecucion en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se publican pesos GGUF ni recetas oficiales de cuantizacion.
- GPUs recomendadas para produccion: A100 80 GB, H100 80 GB o multiples A6000 en configuracion tensor-parallel.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI si el modelo es compatible con sus kernels; llama.cpp u Ollama solo si se generan pesos GGUF, que no se ofrecen en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| MyModelCleanCP2SFT_SEARCH | 25,8 B | no disponible | imagen-texto | no disponible | gated |
| Gemma 2 27B (referencia de la familia) | 27 B | 8K tokens (segun version) | texto | Gemma Terms of Use | abierto |
| Qwen2.5-VL 32B (referencia multimodal similar) | ~32 B | 128K tokens (segun version) | imagen-texto | Apache 2.0 (segun version) | abierto |
| Llama 3.2 11B Vision | 11 B | 128K tokens | imagen-texto | Llama Community License | abierto |

La comparativa es estructural: no existen datos de rendimiento publicados para este modelo que permitan contrastar calidad frente a las alternativas. Ademas, las cifras de contexto y licencia de los modelos de referencia deben verificarse en sus fichas oficiales, ya que pueden variar entre versiones.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni proceso de alineacion.
- Sin resultados de benchmarks: no es posible verificar calidad, razonamiento, codigo ni capacidades multimodales frente a alternativas.
- Licencia no declarada: el uso comercial es incierto y requiere contactar con el autor o revisar las condiciones del acceso gated.
- Acceso restringido: la distribucion y el despliegue estan sujetos a la aprobacion del autor en HuggingFace, lo que limita la reproducibilidad.
- Riesgo de alucinacion y sesgos: al no haber documentacion sobre filtrado de datos ni evaluaciones de seguridad, se deben asumir los riesgos habituales de un fine-tuning sin auditoria publica.
- Idiomas no declarados: no se garantiza soporte de castellano ni de otros idiomas distintos del presente en el dataset de entrenamiento.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin informacion oficial.
- Sin pesos cuantizados oficiales: el despliegue en hardware de consumo requiere generar cuantizaciones propias, con el riesgo de degradacion no medida.
- Fecha de creacion futura en los metadatos (2026-11-02): conviene verificar la autenticidad y vigencia del repositorio antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/AlexHung29629/MyModelCleanCP2SFT_SEARCH
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la busqueda web proporcionada.

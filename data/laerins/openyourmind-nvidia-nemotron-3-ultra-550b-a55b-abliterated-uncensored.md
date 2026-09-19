# Laerins/OpenYourMind-NVIDIA-Nemotron-3-Ultra-550B-A55B-abliterated-uncensored

# OpenYourMind-NVIDIA-Nemotron-3-Ultra-550B-A55B-abliterated-uncensored

## Resumen

Es una versión "abliterated" y sin censura de NVIDIA Nemotron-3-Ultra-550B-A55B, publicada por el usuario Laerins bajo la marca OpenYourMind. El modelo base es un MoE híbrido de 560.524.578.816 parámetros totales (unos 560,5 B) con aproximadamente 55 B de parámetros activos por token, que combina capas Mamba-2, capas Latent-MoE y capas de atención en una única pila de 108 capas. Esta variante conserva exactamente la misma arquitectura (`NemotronHForCausalLM`, `model_type: nemotron_h`), los mismos nombres y formas de tensores y el mismo `config.json`, por lo que es un reemplazo directo (*drop-in*) del modelo original.

El problema que resuelve es distinto del de un modelo convencional: mediante una proyección ortogonal sobre el flujo residual, aplicada directamente sobre los pesos BF16 completos, se elimina la dirección de rechazo aprendida durante el alineamiento. El autor describe un proceso en tres pasos: extracción de la dirección de rechazo por diferencia de medias sobre un conjunto de prompts dañinos/inocuos leída al final de la traza de razonamiento (`</think>`), edición perfilada por capas (concentrada en las capas intermedias y atenuada en las iniciales y finales) y ortogonalización de la dirección contra subespacios lingüísticos y de análisis de seguridad para preservar la fluidez multilingüe y la capacidad técnica. No hay entrenamiento adicional: es una edición offline del peso.

Su relevancia ahora es doble. Por un lado, ofrece pesos BF16 completos (~1,1 TB en disco) como fuente ideal para generar cuantizaciones propias en NVFP4, FP8, AWQ o GGUF, y mantiene intacto el modo de razonamiento `enable_thinking` y la capa MTP de decodificación especulativa nativa. Por otro, es un objeto de estudio para investigación en alineación y *red teaming*, al permitir medir qué se pierde y qué se conserva cuando se suprime el comportamiento de rechazo en un modelo de esta escala. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `NemotronHForCausalLM` (`model_type: nemotron_h`); híbrida Mamba-2 / atención / Latent-MoE |
| Parametros totales | 560.524.578.816 (~560,5 B) |
| Parametros activos | ~55 B por token (MoE: 512 expertos enrutados, 22 activos por token) |
| Longitud de contexto | hasta 1.000.000 de tokens; la receta de vLLM del autor usa 262.144 (256K) por defecto |
| Tipos de cuantizacion | BF16 (pesos completos publicados). El autor indica que estos pesos sirven de base para NVFP4, FP8, AWQ y GGUF; existe una build NVFP4 del mismo autor (~329 GB) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (campo `license: other`, heredada del modelo base) |
| Formato de pesos | safetensors (shards) + `config.json`, `model.safetensors.index.json`, tokenizer, `chat_template.jinja`, `generation_config.json` |
| Tamano en disco | ~1,1 TB (1121,1 GB segun la ficha de HuggingFace) |
| Precision | BF16 (pesos completos) |

## Arquitectura y entrenamiento

La arquitectura es una pila híbrida de 108 capas compuesta por 48 capas Mamba-2, 48 capas Latent-MoE y 12 capas de atención, con un tamano oculto de 8192. La capa MoE enruta hacia 512 expertos en un espacio latente de 2048 dimensiones, de los cuales se activan 22 por token, más 1 experto compartido. La atención usa 64 cabezas de consulta y 2 cabezas KV (GQA muy agresivo), y el vocabulario es de 131.072 tokens. Incorpora una capa de Multi-Token Prediction (MTP) que actúa como decodificación especulativa nativa, y una plantilla de chat con modo de razonamiento explícito (`enable_thinking`) cuya traza se emite entre etiquetas `<think>…</think>`. La combinación de Mamba-2 para el modelado de secuencia y atención en una minoría de capas busca reducir el coste de inferencia en contextos muy largos frente a un transformer denso equivalente.

Sobre el entrenamiento no se proporciona información en la model card: no se documentan el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento en el modelo base. Lo único descrito es el post-procesado de abliteración, que no es entrenamiento sino una edición de pesos: se extrae una dirección de rechazo del flujo residual mediante diferencia de medias sobre un conjunto etiquetado de prompts dañinos e inocuos, leída al final de la propia traza de razonamiento del modelo (`</think>`), y se aplica como proyección ortogonal offline sobre los módulos de escritura residual. La edición se perfila por capas —concentrada en las capas intermedias donde reside la decisión de rechazo y atenuada hasta cero en las capas tempranas (fluidez y tokenización) y finales (estabilidad de salida)— y se ortogonaliza contra subespacios de lenguaje/multilingüismo y de análisis de seguridad. Según el autor, esto preserva coherencia, precisión factual, fluidez multilingüe y capacidad de análisis técnico de seguridad, manteniendo intactos el stack de razonamiento, la capa MTP y la compatibilidad de formas con el modelo base.

## Capacidades

- Generación de texto conversacional en modo multi-turno, con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento explícito en modo *thinking*: activable con `enable_thinking=True` en `chat_template_kwargs`; la traza se emite dentro de `<think>…</think>` antes de la respuesta final.
- Contexto largo: hasta 1.000.000 de tokens segun especificación, con 262.144 tokens en la configuración de servicio recomendada; adecuado para documentos muy extensos o bases de código completas.
- Decodificación especulativa nativa mediante la capa MTP incluida en la arquitectura, orientada a mejorar el throughput en generación.
- Comportamiento sin rechazo (*uncensored*) en los ejes de rechazo habituales, incluyendo temas sensibles y de seguridad ofensiva, segun declara el autor.
- Participación en análisis técnico de seguridad y ciberseguridad, preservada de forma deliberada mediante la ortogonalización de la dirección de abliteración.
- Capacidades multilingües: el autor afirma haber preservado la fluidez multilingüe, pero no se publica la lista de idiomas soportados ni evaluación alguna.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el modo *thinking* es el único mecanismo de razonamiento descrito.
- Visión, audio u otras modalidades: no disponibles (la pipeline declarada es `text-generation`).
- Compatibilidad con servidores tipo OpenAI a través de vLLM, con *reasoning parser* `nemotron_v3`.

## Casos de uso

- Investigación en alineación y seguridad: comparar este modelo con el Nemotron-3-Ultra original para cuantificar qué comportamientos, capacidades y sesgos cambian al eliminar la dirección de rechazo, usando el mismo conjunto de evaluaciones en ambos. Es un caso de uso natural porque los pesos BF16 son *drop-in* respecto al base.
- *Red teaming* y evaluación de robustez: generar ataques y contenido adversario sin que el modelo se niegue, para alimentar baterías de pruebas de clasificadores y filtros de moderación propios.
- Generación de datos sintéticos para ajuste fino: producir datos de instrucción sobre dominios y temáticas que un modelo alineado rechazaría, siempre con revisión legal y de política interna antes de su uso en entrenamiento.
- Análisis de documentación legal y técnica extensa: con 262.144 tokens de contexto operativo se pueden procesar contratos completos, expedientes o normativas enteras en una sola pasada, manteniendo la trazabilidad de cada cláusula citada.
- Revisión de bases de código y auditoría de seguridad: analizar repositorios completos o grandes volúmenes de código ofensivo/defensivo en un contexto largo, aprovechando la preservación declarada de las capacidades de análisis de seguridad.
- Asistentes conversacionales de contexto largo: atención al cliente o asistencia interna donde el historial de interacción y la documentación asociada caben en la ventana, con salida en streaming de la traza de razonamiento para inspección.
- Razonamiento matemático y problemas de varios pasos: el modo `enable_thinking` permite separar la traza de razonamiento de la respuesta final, útil en pipelines donde se quiere auditar el procedimiento antes de aceptar el resultado.
- Investigación en arquitecturas híbridas: servir el modelo con vLLM y *expert parallel* para medir el comportamiento real de una pila Mamba-2 + Latent-MoE + atención a escalas de contexto muy grandes, comparando coste por token frente a alternativas densas.
- Extracción de información y resumen sobre corpus prohibidos o sensibles (por ejemplo, análisis de discurso de odio o de material extremista) donde un modelo censurado dificultaría el trabajo por rechazos automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones numéricas con el modelo base o con alternativas. Tampoco se aportan cifras de latencia o throughput medidas.

## Requisitos de hardware

- Pesos BF16 completos: ~1,1 TB en disco y en memoria. El servicio en BF16 requiere un nodo multi-GPU grande o un despliegue multi-nodo; el autor menciona 16× H100/H200, 8× B200/B300, o 2 nodos con *tensor parallel* + *pipeline parallel*.
- Build NVFP4 del mismo autor: ~329 GB, cabe en 4× B200/B300 o en 8× H100 segun la model card.
- Cuantizaciones propias: el autor indica que estos pesos BF16 son la fuente ideal para generar FP8, NVFP4, AWQ o GGUF. Como referencia orientativa (estimación, no dato publicado), FP8 rondaría los ~560 GB y una cuantización de 4 bits alrededor de ~300 GB, sin contar cachés ni *overhead* de runtime.
- GPU de consumo: no cabe en GPU de consumo. Ni siquiera la build NVFP4 de ~329 GB es desplegable en una RTX 4090 (24 GB) ni en configuraciones habituales de 2-4 tarjetas de consumo.
- Opciones de despliegue documentadas: vLLM con `--trust-remote-code`, `--tensor-parallel-size 8`, `--enable-expert-parallel`, `--max-model-len 262144` y `--reasoning-parser nemotron_v3`. El autor cita las cuantizaciones NVFP4/FP8/AWQ/GGUF como destino posible de estos pesos, pero no documenta recetas para otros servidores.
- Otros motores (SGLang, TensorRT-LLM, llama.cpp, TGI, Ollama): no confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles. La capa MTP está pensada para mejorar el throughput mediante decodificación especulativa, pero no se publican cifras.
- Parámetros de muestreo recomendados: `temperature=1.0`, `top_p=0.95` (valores de `generation_config.json`) y un `repetition_penalty` suave en torno a 1,1 para generaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OpenYourMind-NVIDIA-Nemotron-3-Ultra-550B-A55B-abliterated-uncensored | ~560,5 B / ~55 B | hasta 1M; 256K por defecto | openmdw-1.1 | BF16 (~1,1 TB) en HuggingFace | Variante abliterated sin benchmarks publicados; 0 descargas y 1 like |
| nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 (base) | 550 B / 55 B | hasta 1M | openmdw-1.1 | BF16 en HuggingFace | Modelo original alineado; misma arquitectura y formas de tensor |
| OpenYourMind-NVIDIA-Nemotron-3-Ultra-550B-A55B-abliterated-uncensored-NVFP4 | mismo modelo cuantizado | igual que el BF16 | openmdw-1.1 | NVFP4, ~329 GB | Build lista para servir en 4× B200/B300 u 8× H100 |

No se dispone en la información proporcionada de datos verificados sobre otras alternativas comparables (por ejemplo, otras familias MoE abiertas de escala similar) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Cualquier comparación de ese tipo requeriría consultar las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Modelo explícitamente sin censura: la dirección de rechazo ha sido suprimida de los pesos, por lo que puede generar contenido dañino, ilegal o inseguro sin negarse. Es imprescindible desplegarlo detrás de capas de moderación, registro de uso y controles de acceso si se expone a usuarios.
- Sin validación comunitaria: el repositorio registra 0 descargas y 1 like. No hay evaluaciones independientes que confirmen que la coherencia, la precisión factual o las capacidades se han preservado realmente; las afirmaciones de preservación provienen únicamente del autor.
- Sin benchmarks publicados: no hay ninguna métrica objetiva de calidad, razonamiento, código o matemáticas, ni antes ni después de la abliteración.
- Riesgo de alucinación: no cuantificado en la información disponible; se desconoce el impacto del perfilado por capas sobre la fidelidad factual en dominios especializados.
- Idiomas: no se publica la lista de idiomas soportados. El autor afirma que la edición se ortogonalizó contra subespacios multilingües para preservar fluidez, pero es una afirmación no verificada.
- Caveat operativo del modo *thinking*: el autor recomienda no reinyectar el razonamiento de turnos anteriores en el historial multi-turno; hacerlo puede degradar la calidad de las respuestas.
- Licencia: OpenMDW-1.1, heredada del modelo base, con campo `license: other` en HuggingFace. Antes de un uso comercial hay que revisar los términos completos de OpenMDW-1.1 y las condiciones que NVIDIA impone al modelo base, incluido cualquier requisito de atribución o restricción de uso.
- Trazabilidad del publicador: el repositorio está alojado bajo el usuario Laerins, mientras que la model card y las builds cuantizadas se atribuyen a la organización OpenYourMind. Conviene verificar la relación entre ambas cuentas y la integridad de los pesos antes de desplegarlos en producción.
- Coste de despliegue: ~1,1 TB en BF16 exige infraestructura multi-GPU o multi-nodo; la mayoría de equipos solo podrán usarlo a través de la build NVFP4 o de cuantizaciones propias, que introducen su propia pérdida de precisión.
- Compatibilidad: el autor solo documenta el despliegue con vLLM y el parser de razonamiento `nemotron_v3`; el comportamiento en otros motores de inferencia no está verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Laerins/OpenYourMind-NVIDIA-Nemotron-3-Ultra-550B-A55B-abliterated-uncensored
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Build NVFP4 del mismo autor: https://huggingface.co/OpenYourMind/OpenYourMind-NVIDIA-Nemotron-3-Ultra-550B-A55B-abliterated-uncensored-NVFP4
- Organización NVIDIA en HuggingFace: https://huggingface.co/nvidia
- Comunidad del autor (Discord): https://discord.gg/rhUZY5GEZr
- Apoyo al autor: https://buymeacoffee.com/oym.kuato

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente páginas genéricas de redes sociales), por lo que no se han podido localizar papers, blogs técnicos, repositorios de código ni demos adicionales.

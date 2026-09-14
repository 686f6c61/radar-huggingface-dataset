# MinamiJie/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una derivacion del modelo DeepSeek-V4.1-Flash publicada por el usuario MinamiJie, construida mediante tecnicas de "abliteration" a nivel de pesos: los mecanismos de rechazo se eliminan quirurgicamente del checkpoint sin anadir codigo personalizado, hooks en tiempo de ejecucion ni vectores de direccion. Segun la model card, todos los componentes funcionales (expertos enrutados, memoria Engram, atencion dispersa CSA2, cabeza especulativa DSpark, torre de vision, gates del router, normalizaciones y embeddings) permanecen byte a byte identicos al modelo base. El resultado es un checkpoint "drop-in" que se carga exactamente igual que el original.

Arquitectonicamente es un transformer causal encoder-decoder de 20+20 capas con mezcla de expertos (MoE) de 384 expertos enrutados con top-6 mas un experto compartido, Hyper-Connections de residual de 4 canales, atencion dispersa CSA2, memoria n-gram Engram y decodificacion especulativa DSpark. La model card declara un backbone de 552B parametros con 8B/16B activos por token, mientras que el recuento real de safetensors del repositorio asciende a 763.205.315.794 parametros; esa discrepancia no queda explicada en la informacion disponible. El contexto soportado es de 1.000.000 de tokens y la cuantizacion es nativa: pesos FP8 e4m3fn con escalas de bloque E8M0 y expertos enrutados en FP4.

Su relevancia es doble. Por un lado es una pieza de interes para investigacion en seguridad de IA: permite estudiar como se comporta un modelo de gran escala cuando se elimina el circuito de rechazo, y la propia model card publica evaluaciones cuantitativas de ese efecto sobre HarmBench-320 y MMLU-14k. Por otro, su ventana de 1M tokens y su soporte multimodal lo situan en la categoria de modelos de contexto largo con vision, aunque su tamano (510,3 GB de repositorio) lo aleja por completo del despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (20+20 capas) con MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria n-gram Engram, cabeza especulativa DSpark (MTP) y torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle |
| Parametros totales | 763.205.315.794 (~763B) segun safetensors; la model card declara 552B de backbone |
| Parametros activos | 8B/16B por token (segun la model card) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (e4m3fn) en pesos con escala de bloque E8M0 [32, 32] y expertos enrutados en FP4; cuantizacion nativa, no hay variantes GGUF ni de menor precision publicadas |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun la model card); la licencia del modelo base debe verificarse de forma independiente |
| Formato de pesos | safetensors (libreria transformers); repositorio de 510,3 GB |

## Arquitectura y entrenamiento

El modelo parte de deepseek-ai/DeepSeek-V4.1-Flash y conserva su topologia completa. Se trata de un transformer causal encoder-decoder de 20 capas de encoder y 20 de decoder con capa MoE de 384 expertos enrutados (top-6 por token) mas un experto compartido siempre activo. Incorpora tres elementos diferenciales respecto a un MoE clasico: Hyper-Connections, que sustituyen el residual convencional por un residual de 4 canales; atencion dispersa CSA2, orientada a reducir el coste de la ventana de 1M tokens; y Engram, una memoria n-gram que complementa la atencion. La decodificacion especulativa se apoya en la cabeza DSpark (Multi-Token Prediction). La torre de vision DeepSeek-ViT, con 2D-RoPE y pixel unshuffle, aporta la capacidad multimodal (pipeline image-text-to-text).

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base empleo RLHF, DPO u otra fase de alineamiento. La unica intervencion documentada por el autor es la abliteracion a nivel de pesos: eliminacion del circuito de rechazo preservando el resto de componentes sin modificacion. La model card afirma que no se emplea `model.py` personalizado ni tecnicas en tiempo de ejecucion, de modo que el comportamiento resultante esta codificado en los propios tensores del checkpoint. El autor no detalla el metodo concreto de identificacion y ablacion de direcciones, y no se aporta ninguna validacion independiente del proceso.

## Capacidades

- Generacion de texto y razonamiento multi-turno con coherencia sostenida, segun el autor, en conversaciones largas.
- Modo de razonamiento configurable ("effort=off" y "effort=max"), con traza de razonamiento verificable en el nivel maximo. La model card indica que el valor por defecto es reasoning-max.
- Vision: entrada image-text-to-text mediante la torre DeepSeek-ViT (2D-RoPE + pixel unshuffle), preservada intacta respecto al modelo base.
- Tool calling y function calling: la model card menciona explicitamente soporte de herramientas ("vision + tools").
- Capacidades agenticas y razonamiento multi-paso, derivadas del modo de razonamiento y del soporte de herramientas.
- Decodificacion especulativa nativa mediante la cabeza DSpark (Multi-Token Prediction), orientada a acelerar la generacion.
- Memoria n-gram Engram como mecanismo auxiliar de recuperacion de contexto.
- Capacidad multilingue: no disponible en la informacion proporcionada (el campo de idiomas de HuggingFace no esta informado). El clasificador de la evaluacion HarmBench se describe como multilingue, pero eso corresponde al evaluador, no al modelo.
- Ausencia total de rechazos: en la evaluacion publicada se reporta 0 respuestas de tipo HARD_REF, SOFT_RED o HEDGE en las 320 peticiones de HarmBench-320, tanto en effort=off como en effort=max.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite medir la robustez de clasificadores de contenido y de guardrails externos frente a un modelo generador sin restricciones internas, usando los propios prompts de suites como HarmBench como banco de pruebas.
- Investigacion sobre mecanismos de rechazo: comparar las representaciones internas del modelo base y de esta version sobre las mismas entradas permite localizar y caracterizar las direcciones de pesos asociadas al comportamiento de negativa.
- Generacion de datos sinteticos adversarios: producir lotes de ejemplos para entrenar o validar clasificadores de toxicidad, siempre que el uso se enmarque en un entorno controlado y con las salvaguardas externas correspondientes.
- Analisis de documentos extensos: la ventana de 1M tokens permite procesar libros tecnicos, expedientes completos o bases de codigo en una sola pasada sin troceado ni recuperacion intermedia, evitando la perdida de contexto entre fragmentos.
- Procesamiento multimodal de documentacion: extraccion y razonamiento combinado sobre capturas, diagramas, tablas escaneadas y texto en una misma peticion, util en digitalizacion de archivos tecnicos o auditoria documental.
- Asistencia a la investigacion cientifica: resumen y contraste de literatura extensa, con capacidad de razonamiento multi-paso y uso de herramientas para consultar fuentes externas durante la tarea.
- Automatizacion de flujos con agentes: integracion en pipelines donde el modelo encadena llamadas a funciones (consulta de APIs, ejecucion de scripts, recuperacion de datos) con contexto largo, sin interrupciones por negativas ante peticiones legitimas pero mal clasificadas.
- Desarrollo de software asistido: generacion y refactorizacion de codigo sobre repositorios completos cargados en contexto, con soporte de tool calling para invocar linters, compiladores o suites de pruebas.
- Creacion de contenido editorial adulto o de ficcion sin restricciones tematicas, en jurisdicciones y contextos donde ese contenido sea legal.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de HarmBench-320 y MMLU-14k, ambos aportados por el autor del modelo.

HarmBench-320 (320 peticiones, T=0 greedy, clasificacion en 4 niveles):

| Evaluacion | ASR base | ASR version abliterada | Delta (pp) |
|---|---:|---:|---:|
| HB-320, effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320, effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoria semantica (ASR):

| Categoria | Items | Base off | Abliterado off | Base max | Abliterado max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (conjunto de test completo, logits del modelo base, T=0):

| Version | Aciertos | Precision | Delta |
|---|---:|---:|---:|
| Base | 12.211 / 14.042 | 86,96 % | — |
| Abliterada | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Excluyendo el bloque de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), donde el comportamiento de rechazo influye directamente en la correccion, la caida sobre los aproximadamente 11.000 items restantes es de -1,1 pp, dentro del objetivo de preservacion de conocimiento de 3 pp declarado por el autor. Las mayores perdidas por asignatura son moral scenarios (-39,89 pp), professional law (-7,04 pp), abstract algebra (-6,00 pp), security studies (-5,31 pp) y high school computer science (-4,00 pp); el listado completo de 57 asignaturas esta truncado en la informacion disponible.

No hay datos de benchmarks de codigo (HumanEval, MBPP), matematicas (GSM8K, MATH), vision o contexto largo, ni comparaciones con el modelo base en tareas distintas de MMLU y HarmBench.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB, por lo que solo los pesos en FP8/FP4 requieren del orden de 500-520 GB de memoria agregada. Es una estimacion derivada del tamano del repositorio, no un dato publicado.
- Cache KV: con 1.000.000 de tokens de contexto y 20+20 capas, la cache puede crecer muy por encima del tamano de los pesos en sesiones de contexto maximo. No se dispone de cifras concretas de memoria por token.
- GPU recomendadas: despliegue multi-nodo o mono-nodo con muchas GPU. 8 x H200 (141 GB HBM3e) ofrece 1.128 GB agregados, suficiente para pesos y cache moderada. 8 x H100 de 80 GB suman 640 GB, lo que deja poco margen sobre los pesos. Alternativas con mas memoria por tarjeta (B200 de 192 GB) reducen el numero de dispositivos necesarios. No hay datos publicados de configuraciones validadas.
- GPU de consumo: no cabe. Una RTX 4090 con 24 GB, o incluso configuraciones de varias GPU de consumo, no pueden alojar los pesos ni aproximarse a ellos.
- Opciones de despliegue: transformers es la libreria declarada. Para FP8 con MoE a gran escala serian necesarios servidores como vLLM o SGLang, pero no hay confirmacion de soporte para la arquitectura `deepseek_v41`. TGI es otra opcion a validar. llama.cpp y Ollama no son viables a esta escala y no existe conversion a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | ~763B (recuento safetensors); 552B de backbone segun la model card | 8B/16B por token | 1M | MIT (segun model card) | 0 descargas, 0 likes; repositorio de 510,3 GB | Abliterado a nivel de pesos; FP8 + expertos en FP4 |
| DeepSeek-V4.1-Flash (base) | 552B de backbone segun la model card | 8B/16B por token | 1M | no disponible en la informacion proporcionada | Modelo de referencia del autor | MMLU 86,96 %; ASR HarmBench 42,81 % (off) y 1,56 % (max) |
| Otras alternativas MoE abiertas de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible | No se ha encontrado informacion verificable en los datos proporcionados |

La unica comparacion con datos cuantitativos disponibles es contra el propio modelo base. No se han publicado en la informacion disponible comparaciones con otros MoE abiertos de escala similar.

## Limitaciones y advertencias

- Eliminacion deliberada de los mecanismos de rechazo. La evaluacion publicada reporta un ASR del 100 % en las siete categorias de HarmBench-320, incluidas chemical_biological, cybercrime_intrusion, harassment_bullying y misinformation_disinformation, con cero respuestas de tipo HARD_REF, SOFT_RED o HEDGE. Cualquier despliegue con usuarios finales requiere guardrails externos.
- Riesgo elevado de uso indebido. El modelo no incorpora ninguna barrera interna frente a peticiones daninas; la responsabilidad de filtrado recae integramente en la capa de aplicacion.
- Degradacion medible en conocimiento. MMLU cae 4,22 pp respecto al base (82,74 % frente a 86,96 %). La perdida se concentra en moral scenarios (-39,89 pp) y professional law (-7,04 pp), areas donde el comportamiento de rechazo es funcionalmente relevante. Fuera del bloque de etica la caida es de -1,1 pp.
- Sesgos conocidos: no disponible. La model card no incluye evaluaciones de sesgo demografico, estereotipos ni equidad.
- Alucinacion: no disponible. No se han publicado mediciones de factualidad ni tasas de alucinacion para esta version.
- Cobertura idiomatica desconocida. El campo de idiomas no esta informado en HuggingFace y la model card no detalla el reparto linguistico del entrenamiento; el rendimiento fuera del ingles y el chino no esta documentado.
- Discrepancia en el recuento de parametros. El safetensors declara 763.205.315.794 parametros mientras la model card describe un backbone de 552B con 8B/16B activos. Conviene verificar la configuracion real antes de dimensionar infraestructura.
- Licencia: la model card declara MIT, pero al ser una derivacion del modelo base es necesario comprobar de forma independiente las condiciones de la licencia original de DeepSeek y si la redistribucion de pesos modificados esta permitida. No se ha realizado auditoria legal en esta ficha.
- Ausencia de validacion independiente. Todos los resultados proceden del autor del modelo; no hay replicacion por terceros ni revision por pares. Ademas, el repositorio no registra descargas ni likes, lo que indica ausencia de uso comunitario verificable.
- Coste de despliegue prohibitivo. 510,3 GB de pesos en FP8/FP4 y una cache KV potencialmente muy superior en sesiones de contexto maximo implican infraestructura multi-GPU o multi-nodo, con el coste economico y energetico asociado.
- Contexto largo sin validacion. La ventana de 1M tokens no viene acompanada de resultados en pruebas de recuperacion en contexto largo (por ejemplo, RULER o Needle-in-a-Haystack), por lo que la calidad efectiva en contextos extensos no esta demostrada.
- Herramientas de despliegue sin confirmar. No hay evidencia de soporte de la arquitectura en vLLM, SGLang o TGI, ni conversion a GGUF disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MinamiJie/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del autor en X: https://x.com/jordanschenck

La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: todos los enlaces recuperados eran contenido no relacionado y se han descartado. No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la informacion disponible.

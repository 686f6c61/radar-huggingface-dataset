# doubleakash/fraud-detector

## Resumen

`doubleakash/fraud-detector` es un ajuste fino (fine-tuning) del modelo `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario `doubleakash` en HuggingFace. El autor indica que el entrenamiento se ha realizado mediante SFT (supervised fine-tuning) utilizando la libreria TRL de HuggingFace. El nombre del repositorio sugiere un proposito de deteccion de fraude, aunque ni la model card ni los metadatos asociados documentan el conjunto de datos, el dominio, el formato de las etiquetas ni el objetivo concreto de la tarea.

El modelo hereda la arquitectura del base: un transformer decoder-only denso de aproximadamente 1.540 millones de parametros, con atencion de consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm, y una ventana de contexto nativa de 32.768 tokens en Qwen2.5. Al ser una variante de 1,5B, es ligero y desplegable en GPU de consumo, lo que lo hace atractivo para tareas de clasificacion o generacion de texto con latencia baja.

La relevancia practica de esta ficha es limitada y conviene ser explicitos: el repositorio figura con 0 descargas, 0 likes y un tamano de 0,0 GB, lo que indica que los pesos pueden no estar subidos o que el repositorio esta vacio. Ademas, la model card es una plantilla generada automaticamente (el ejemplo de uso pregunta por una maquina del tiempo, sin relacion con fraude) y no incluye licencia declarada, idiomas, benchmarks ni detalles del dataset. Por tanto, debe tratarse como un artefacto no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del base Qwen2.5-1.5B-Instruct) |
| Parametros totales | ~1,54 B (heredado del modelo base declarado; no verificado en el repo) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | No documentada en la model card. Heredada del base: 32.768 tokens nativos |
| Tipos de cuantizacion | No documentados por el autor. El base admite FP16/BF16, INT8, INT4 y GGUF (Q8_0, Q5_K_M, Q4_K_M, etc.) |
| Idiomas soportados | no disponible en la model card (el base Qwen2.5 declara ~29 idiomas, entre ellos castellano, ingles, chino, frances, aleman, portugues, italiano y ruso) |
| Licencia | no disponible (la model card contiene un campo `licence: license` sin valor real; el base es Apache-2.0, pero el fine-tune no declara licencia propia) |
| Formato de pesos | `safetensors` segun los tags del repositorio (pesos no confirmados: tamano de repo 0,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso con normalizacion RMSNorm pre-norm, activacion SwiGLU en el FFN, embeddings rotatorios (RoPE) para la posicion y atencion con consultas agrupadas (GQA) para reducir el coste de la cache KV. El proceso de ajuste declarado es SFT con TRL, la libreria de HuggingFace para fine-tuning supervisado y aprendizaje por refuerzo. Las versiones de framework reportadas en la model card son TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF/DPO, el regimen de hiperparametros (learning rate, epocas, LoRA frente a full fine-tuning) ni las tecnicas de regularizacion aplicadas. La model card no incluye la seccion de resultados de entrenamiento (loss, curvas) ni el enlace al dataset, algo habitual en las plantillas autogeneradas por `Trainer`/TRL. Tampoco se documenta ninguna innovacion tecnica propia: el modelo es un ajuste estandar sin modificaciones arquitectonicas declaradas.

## Capacidades

- Generacion de texto e instrucciones conversacionales: hereda la capacidad instruct del base Qwen2.5-1.5B-Instruct, que responde a peticiones en formato chat con roles `system`, `user` y `assistant`.
- Razonamiento basico y matematicas elementales: el base de 1,5B resuelve problemas aritmeticos y de logica sencillos, con degradacion notable en cadenas de razonamiento largas.
- Generacion de codigo: el base maneja lenguajes comunes (Python, JavaScript, SQL) a nivel de fragmentos cortos y funciones simples.
- Clasificacion y extraccion de informacion: por el nombre del repositorio, su uso previsto apunta a tareas de deteccion de fraude, presumiblemente clasificacion binaria o etiquetado de transacciones descritas en texto.
- Tool calling / function calling: no documentado en la model card; el base Qwen2.5-Instruct soporta plantillas de herramientas, pero no hay confirmacion de que este ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas para el fine-tune; las del base no se pueden dar por garantizadas tras un SFT no documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Es un modelo exclusivamente de texto.

## Casos de uso

- Triaje de alertas antifraude: el modelo podria recibir la descripcion textual de una transaccion sospechosa y devolver una etiqueta o una justificacion breve. Es adecuado por su tamano reducido, que permite procesar volumenes altos con coste bajo, pero requiere validacion previa del dataset, hoy desconocido.
- Moderacion y clasificacion de textos cortos: aprovechando la ventana de contexto del base, puede clasificar tickets, mensajes o descripciones en categorias definidas mediante prompt, con latencia de un solo paso.
- Extraccion de campos estructurados: convertir texto libre (correos, reclamaciones, notas de analistas) en JSON con campos concretos, un uso tipico de modelos instruct pequenos.
- Asistente interno sobre reglas de negocio: con contexto largo, se le pueden pasar politicas de riesgo y pedir respuestas citando la seccion aplicable, siempre que el ajuste no haya degradado la capacidad de seguir instrucciones.
- Generacion de resumenes operativos: resumir historiales de incidencias o conversaciones con clientes para alimentar paneles de analistas humanos.
- Prototipado rapido y pruebas A/B de prompts: al caber en una GPU de consumo, sirve para experimentar con variantes de instrucciones antes de escalar a modelos mayores.
- Fine-tuning posterior con datos propios: es un punto de partida razonable (1,5B, licencia del base permisiva) para quien quiera reentrenar con su propio corpus etiquetado, siempre que se aclare la licencia del derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna metrica especifica de deteccion de fraude (precision, recall, F1, AUC-PR). Tampoco hay comparaciones con el modelo base que permitan cuantificar el efecto del ajuste SFT.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, calculo aritmetico sobre 1,54 B de parametros): ~6,2 GB en FP32, ~3,1 GB en BF16/FP16, ~1,6 GB en INT8 o Q8_0, ~1,0-1,2 GB en Q4_K_M.
- Cache KV: con 28 capas y 2 cabezas KV de dimension 128 (GQA), la cache ocupa aproximadamente 28 KB por token en FP16, es decir unos 230 MB para 8.000 tokens y unos 920 MB para 32.768 tokens. Estas cifras son estimaciones derivadas de la configuracion tipica del base, no medidas publicadas.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para despliegue en servidor, A100 y H100 sobredimensionan el modelo: su interes esta en el batching masivo, no en la VRAM.
- Cabe en GPU de consumo: si, con holgura. En FP16 cabe en una RTX 3060 de 12 GB con contexto largo; en cuantizacion Q4 cabe incluso en iGPU con memoria unificada y en equipos con 8 GB de RAM compartida.
- Opciones de despliegue: `transformers` con `pipeline` (el propio ejemplo de la model card), vLLM, TGI, SGLang, llama.cpp/Ollama (previa conversion a GGUF), LM Studio y servidores compatibles con la API de HuggingFace Endpoints, segun el tag `endpoints_compatible`.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio. Cualquier cifra que se cite para el base (cientos a miles de tokens por segundo con batching en vLLM sobre A100/H100) no es extrapolable sin medir, dado el desconocimiento del ajuste.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| doubleakash/fraud-detector | ~1,54 B (heredado) | no documentado (base: 32.768) | no disponible | Repo con 0 descargas y 0,0 GB; pesos posiblemente ausentes |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 nativos, hasta 131.072 con YaRN | Apache-2.0 | Publico, ampliamente descargado y verificado |
| Qwen2.5-3B-Instruct | ~3 B | 32.768 nativos | Qwen Research / Apache-2.0 segun variante | Publico |
| Llama-3.2-1B-Instruct | ~1,24 B | 131.072 | Llama 3.2 Community License | Publico |

No se han identificado en la informacion proporcionada otros fine-tunes de deteccion de fraude comparables, ni publicaciones que permitan situar a este modelo frente a alternativas de la misma tarea. La comparativa con el base es la mas informativa: el unico dato objetivo es que este repositorio no documenta ni demuestra ninguna mejora sobre el.

## Limitaciones y advertencias

- Repositorio practicamente vacio: tamano de 0,0 GB, 0 descargas y 0 likes. Es probable que los pesos no esten disponibles o que el `safetensors` indicado en los tags no se haya subido, lo que impediria la carga desde `transformers`.
- Ausencia total de documentacion del dataset: no se sabe con que datos se entreno, si estaban etiquetados por humanos, si hay fuga de datos ni si la tarea de fraude es clasificacion, generacion o extraccion.
- Model card autogenerada: el ejemplo de codigo plantea una pregunta sobre viajes en el tiempo, sin relacion alguna con fraude, lo que confirma que es la plantilla por defecto y no una descripcion real del modelo.
- Licencia no disponible: el campo de licencia esta sin resolver. Aunque el base Qwen2.5-1.5B-Instruct es Apache-2.0, un derivado puede imponer condiciones adicionales; sin una licencia explicita, el uso comercial es juridicamente arriesgado.
- Riesgo de alucinacion: los modelos de 1,5B tienden a inventar hechos, cifras y justificaciones, especialmente si el SFT fue corto o de baja calidad. En un contexto antifraude, una falsa justificacion puede tener consecuencias legales o economicas.
- Sesgos potenciales: desconocidos. Si el dataset de ajuste contenia ejemplos sesgados por geografia, idioma o perfil de cliente, el modelo los reproducira sin que exista ninguna evaluacion publicada.
- Limitaciones de idioma: la model card no declara idiomas; no se puede asumir un buen rendimiento en castellano solo porque el base lo soporte, ya que un SFT puede desplazar el comportamiento hacia otro idioma.
- Limitacion de contexto: aunque el base soporta 32.768 tokens, no hay confirmacion de que el ajuste conserve esa ventana ni de que se haya entrenado con secuencias largas.
- Metadata incoherente: las versiones declaradas (TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0) y las fechas de creacion/actualizacion (2026-09-20) no coinciden con versiones publicadas en el momento de redactar esta ficha, lo que refuerza la sospecha de un artefacto generado de forma automatica o con fines de prueba.
- Advertencia para produccion: no debe desplegarse en un sistema real de decision crediticia o antifraude sin una evaluacion propia con datos etiquetados, analisis de falsos positivos y supervision humana en el bucle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doubleakash/fraud-detector
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Citation de TRL (von Werra et al., 2020): incluida en la model card, software Apache-2.0, url https://github.com/huggingface/trl
- Resultados de busqueda web: ninguno relevante. Las busquedas devolvieron unicamente paginas de Zhihu sobre gestion de discos en Windows 11, salud de SSD, retirada de fondos en TradeIt y perfiles de usuario, sin ninguna relacion con el modelo, su autor ni la deteccion de fraude.

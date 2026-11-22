# instilux/ltz-e1-base

## Resumen

LTZ E1 (base) es un modelo de lenguaje enmascarado (masked language model) basado en la arquitectura ModernBERT y entrenado específicamente para el luxemburgués (`lb`/`ltz`). Lo desarrolla el equipo de instilux siguiendo la receta Ettin, un enfoque de entrenamiento de encoders compactos y eficientes inspirado en el modelo `jhu-clsp/ettin-encoder-150m`. Con 149.655.232 parámetros, se posiciona como un encoder de tamano base orientado a tareas de comprensión del lenguaje (NLU) en una lengua con recursos limitados.

El modelo resuelve el problema de la escasez de encoders preentrenados de calidad para el luxemburgués, una de las lenguas oficiales de Luxemburgo habitualmente desatendida en el ecosistema NLP. Forma parte del trabajo que introduce ltzGLUE, el primer benchmark de NLU para luxemburgués presentado en Findings de ACL 2026, y está pensado como base para fine-tuning en tareas de clasificación, reconocimiento de entidades e intención.

Su relevancia actual radica en que cubre un hueco lingüístico concreto con una arquitectura moderna (ModernBERT), un vocabulario BPE propio de 50.368 tokens y una licencia permisiva para obra derivada (CC BY-SA 4.0). No es un modelo generativo ni conversacional: es un encoder de relleno de máscaras y representaciones, orientado a desarrolladores e investigadores que necesiten una base sólida para pipelines NLU en luxemburgués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) |
| Parametros totales | 149.655.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Luxemburgues (`lb`/`ltz`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LTZ E1 (base) emplea la arquitectura ModernBERT en configuracion de encoder, siguiendo la receta Ettin documentada en `jhu-clsp/ettin-encoder-150m`. El tokenizador es un BPE a nivel de byte (`GPTNeoXTokenizerFast`) con vocabulario de 50.368 tokens y tokens especiales de estilo BERT (`[CLS]`, `[SEP]`, `[PAD]`, `[MASK]`, `[UNK]`). El objetivo de entrenamiento es modelado de lenguaje enmascarado (masked language modeling), con una ventana de contexto de 1.024 tokens.

Un detalle tecnico relevante del preentrenamiento es que las entradas se construyen como `[CLS] tok_1 … tok_n`, sin `[SEP]` final, y que el preentrenamiento utilizo únicamente textos individuales, sin empaquetado de secuencias (sequence packing). Para pares de frases, el tokenizador produce `[CLS] A [CLS] B` usando un segundo `[CLS]` como separador, formato que el modelo solo aprende durante el fine-tuning. Ademas, durante el preentrenamiento el indice de padding de los embeddings se fijo a 0 (`[CLS]`) en lugar de 2 (`[PAD]`), por lo que el embedding de entrada de `[CLS]` no recibio gradiente en su rol como token de entrada y solo se actualizo a traves de la capa de salida atada; la configuracion publicada usa el `pad_token_id=2` correcto, de modo que ese embedding se entrena normalmente durante el fine-tuning. El pooling por defecto para clasificacion de secuencias es `mean`, y todos los resultados de fine-tuning reportados por el autor lo utilizan. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un encoder de este tipo).

## Capacidades

- Relleno de mascaras (fill-mask): predice el token `[MASK]` en una secuencia de texto en luxemburgues.
- Generacion de representaciones contextuales de tokens y de secuencia para tareas downstream.
- Clasificacion de secuencias mediante fine-tuning, con pooling `mean` por defecto.
- Clasificacion de pares de frases (formato `[CLS] A [CLS] B`) tras fine-tuning.
- Soporte para tareas de reconocimiento de entidades nombradas (NER), clasificacion de topicos y clasificacion de intenciones, segun el benchmark ltzGLUE.
- Capacidades multilingues: limitadas al luxemburgues como idioma de entrenamiento declarado; no se documenta cobertura de otras lenguas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de topicos en luxemburgues: fine-tuning de la cabeza de clasificacion sobre el encoder para etiquetar noticias o documentos con categorias predefinidas, aprovechando el vocabulario BPE especifico del idioma.
- Reconocimiento de entidades nombradas (NER): ajuste del modelo para extraer personas, organizaciones y lugares en textos luxemburgueses, tarea incluida en el benchmark ltzGLUE.
- Clasificacion de intenciones en asistentes conversacionales: entrenamiento de un clasificador de intenciones para chatbots de atencion al ciudadano en Luxemburgo, donde el luxemburgues es lengua oficial.
- Moderacion y filtrado de contenido: uso de las representaciones del encoder para detectar texto toxico o spam en comunidades luxemburguesas, con fine-tuning sobre un conjunto etiquetado.
- Busqueda semantica y similitud de frases: extraccion de embeddings de secuencia (con pooling `mean`) para indexar y recuperar documentos en luxemburgues en sistemas de recuperacion de informacion.
- Etiquetado linguistico y anotacion asistida: relleno de mascaras para sugerir palabras en herramientas de correccion o autocompletado limitado, dado el objetivo fill-mask del modelo.
- Investigacion en NLU de lenguas de bajos recursos: base para experimentos comparativos dentro de ltzGLUE frente a otros encoders preentrenados para luxemburgues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita el paper de ltzGLUE (ACL 2026 Findings) como trabajo asociado, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de las tareas del benchmark en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149,6 millones de parametros en precision FP32, el modelo ocupa aproximadamente 0,6 GB; en FP16/BF16 alrededor de 0,3 GB, y en cuantizaciones de 8 bits o inferiores, por debajo de 0,2 GB (estimaciones teoricas a partir del numero de parametros, ya que no se documentan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; se puede ejecutar en A100, H100, RTX 4090, RTX 3090, RTX 3060 e incluso en GPUs de gama de entrada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers>=4.48.0` (requisito indicado por el autor), con soporte de `AutoModelForMaskedLM` y `AutoTokenizer`; el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| instilux/ltz-e1-base | 149.655.232 | 1.024 | Luxemburgues | CC BY-SA 4.0 | Hugging Face |
| jhu-clsp/ettin-encoder-150m | ~150M (receta de referencia) | no disponible | Ingles (receta Ettin) | no disponible | Hugging Face |
| Otros encoders para luxemburgues evaluados en ltzGLUE | no disponible | no disponible | Luxemburgues | no disponible | no disponible |

La comparativa se limita a la referencia arquitectonica citada por el autor (Ettin encoder 150M) y a los modelos evaluados en ltzGLUE, cuyos datos concretos no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente encoder y de relleno de mascaras: no genera texto libre, no conversa y no soporta agentes ni tool calling.
- Ventana de contexto limitada a 1.024 tokens, insuficiente para documentos largos sin truncado o segmentacion.
- Entrenado unicamente para luxemburgues; su rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- No se recomienda anadir `[SEP]` manualmente: el modelo nunca vio ese token durante el preentrenamiento.
- El embedding de entrada de `[CLS]` no recibio gradiente en su rol de token de entrada durante el preentrenamiento; quienes necesiten una representacion de frase sin ajustar a partir de `[CLS]` deben tenerlo en cuenta (con pooling `mean` el efecto es minimo).
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un encoder, el riesgo se traslada a las tareas downstream y a la calidad de los datos de fine-tuning.
- Licencia CC BY-SA 4.0: permite uso comercial pero impone compartir las obras derivadas bajo la misma licencia (copyleft), lo que puede condicionar su integracion en productos propietarios.
- Requiere `transformers>=4.48.0`; versiones anteriores pueden no cargar correctamente el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/instilux/ltz-e1-base
- Receta Ettin de referencia: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Paper ltzGLUE (ACL 2026 Findings): https://aclanthology.org/2026.findings-acl.476/
- DOI del paper: https://doi.org/10.18653/v1/2026.findings-acl.476

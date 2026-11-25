# jonathanjordan21/qwen2.5-0.5b-id-ner-agent-lora-embed-tokens

## Resumen

El modelo `jonathanjordan21/qwen2.5-0.5b-id-ner-agent-lora-embed-tokens` es un adaptador LoRA (PEFT) construido sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` de Alibaba Qwen. Lo desarrolla el usuario jonathanjordan21 y su proposito es actuar como agente de reconocimiento de entidades nombradas (NER) editorial para articulos de noticias en indonesio, transformando texto plano en JSON estructurado y conforme a un esquema predefinido.

El adaptador se entrena sobre un dataset de 3.200 articulos de noticias indonesios (`indonesian_ner_agent_dataset_3200.jsonl`) y aprende reglas editoriales especificas: extraccion de nueve categorias de entidad, una regla de entidad primaria dominante por categoria, un maximo de dos entidades alternativas, una puntuacion de sentimiento del articulo de 1 a 10 y la generacion de exactamente tres leads editoriales alternativos con fecha en formato ISO.

Es relevante por su caracter de ejemplo practico y ligero de adaptacion de un modelo de 0.5B a una tarea de extraccion estructurada via LoRA, con modificacion de las capas de embedding (`embed_tokens`) y de la cabeza de lenguaje (`lm_head`), lo que permite ensenar tokens especiales de plantilla (`<|article|>`, `<|json|>`) sin reentrenar el modelo completo. El repositorio ocupa 1,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA PEFT |
| Parametros totales | 0,5B (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3.072 tokens (longitud maxima de secuencia usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; entrenamiento con `fp16=True`) |
| Idiomas soportados | indonesio (tarea objetivo); el modelo base Qwen2.5 soporta multiples idiomas, pero el adaptador esta especializado en indonesio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Qwen2.5 con 0,5B de parametros en su variante Instruct. Sobre el se aplica un adaptador LoRA estandar con rango `r=32`, `alpha=64`, dropout 0,05 y modulos objetivo que cubren las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`). Ademas, se guardan y entrenan los modulos `embed_tokens` y `lm_head`, lo que permite anadir y ajustar tokens especiales de plantilla (`<|article|>` y `<|json|>`) y adaptar la cabeza de generacion al formato JSON de salida.

El entrenamiento se realiza sobre 3.200 articulos de noticias indonesios con enmascaramiento de perdida en formato secuencia-a-secuencia, usando los tokens de plantilla para delimitar entrada (articulo) y salida (JSON). Hiperparametros: batch size 4 con 4 pasos de acumulacion de gradiente, optimizador `adamw_torch`, learning rate 2e-4 con scheduler coseno, precision `fp16` (sin `bf16`), longitud maxima de secuencia 3.072 tokens. No se documentan en la model card el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Extraccion de entidades nombradas (NER) en articulos de noticias en indonesio, con nueve categorias: `person`, `organization`, `location`, `event`, `product`, `gpe`, `religion`, `woa` y `law`.
- Aplicacion de la regla "Highlander": como maximo una entidad primaria dominante por categoria en `primary_entities`.
- Gestion de entidades alternativas: maximo dos entidades de apoyo por categoria en `alternative_entities`, sin duplicar la primaria.
- Clasificacion de sentimiento del articulo con una puntuacion numerica de 1 a 10.
- Generacion de exactamente tres leads editoriales alternativos de 150 caracteres o menos, cada uno con una fecha en formato ISO (`YYYY-MM-DD`).
- Salida estructurada en JSON conforme a un esquema fijo, generada de forma determinista en el ejemplo de inferencia (`do_sample=False`).
- Generacion de texto y clasificacion de tokens (tags `text-generation` y `token-classification`), heredadas del modelo base y del uso como NER.
- Soporte de plantilla de prompt con tokens especiales `<|article|>` y `<|json|>` para delimitar entrada y salida.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Enriquecimiento de articulos en un CMS editorial indonesio: el modelo recibe el texto del articulo y devuelve JSON con entidades primarias y alternativas por categoria, listo para indexar en una base de datos de noticias y alimentar busquedas por persona, organizacion o lugar.
- Generacion automatica de metadatos para SEO y sindicacion: a partir del JSON de entidades y del sentimiento (1-10) se pueden generar etiquetas, categorias y resumenes para distribucion en agregadores de noticias.
- Asistencia a la redaccion de titulares y leads: las tres propuestas de lead con fecha ISO permiten al editor elegir rapidamente un encabezado alternativo, reduciendo el tiempo de publicacion.
- Moderacion y analisis de sentimiento a escala: la puntuacion de 1 a 10 sobre el articulo permite clasificar el tono editorial y detectar piezas potencialmente sesgadas o sensacionalistas en un flujo de revision.
- Construccion de grafos de conocimiento periodisticos: la salida estructurada con entidades tipadas y reglas de cardinalidad facilita la carga en un grafo (por ejemplo, Neo4j) para relacionar personas, organizaciones y eventos entre articulos.
- Prototipado rapido y experimentacion academica: al ser un adaptador LoRA de 1,7 GB sobre un modelo de 0,5B, se puede desplegar en una unica GPU consumer para validar pipelines de NER estructurado antes de escalar a modelos mayores.
- Pipeline de extraccion por lotes en backend: el formato secuencia-a-secuencia con tokens de plantilla permite procesar articulos en batch con `transformers` y `peft`, integrable en un servicio de colas para procesar feeds RSS o APIs de noticias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en `fp16` ocupa aproximadamente 1 GB de pesos; el adaptador LoRA anade una fraccion adicional (el repositorio ocupa 1,7 GB, incluyendo adaptador y posiblemente otros artefactos). En la practica, la inferencia completa cabe holgadamente en menos de 4 GB de VRAM en `fp16`, y menos de 2 GB en cuantizacion de 8 o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha disenado para ejecutarse en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card), y potencialmente `vLLM`, `TGI` o `llama.cpp` si se fusiona el adaptador en el modelo base y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La generacion de hasta 1.400 tokens nuevos con `do_sample=False` en una GPU consumer deberia completarse en el orden de segundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonathanjordan21/qwen2.5-0.5b-id-ner-agent-lora-embed-tokens | 0,5B (base) + LoRA | 3.072 tokens (entrenamiento) | NER editorial en indonesio con JSON estructurado | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (modelo base) | Generacion de texto general e instrucciones | apache-2.0 | Hugging Face (ampliamente usado) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (modelo base) | Generacion de texto general e instrucciones | apache-2.0 | Hugging Face |
| Modelos NER indonesios especializados (por ejemplo, basados en IndoBERT) | ~0,1-0,3B | 512 tokens tipicamente | Clasificacion de tokens NER | variable | Hugging Face |

La comparativa con modelos NER indonesios especializados es orientativa: este adaptador no solo etiqueta tokens, sino que genera JSON estructurado con reglas editoriales (sentimiento, leads, cardinalidad de entidades), lo que lo diferencia de un NER clasico basado en BERT. Frente al modelo base sin adaptar, la ventaja es la adherencia al esquema JSON y a las reglas editoriales; la desventaja es la perdida de capacidades generales y de contexto largo (3.072 frente a 32.768 tokens).

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado exclusivamente para NER editorial en indonesio; su rendimiento fuera de ese dominio o idioma no esta documentado y probablemente sea deficiente.
- Contexto reducido: la longitud maxima de secuencia usada en entrenamiento es de 3.072 tokens, muy por debajo del contexto nativo del modelo base (32.768), por lo que articulos largos pueden truncarse o degradar la calidad de la extraccion.
- Riesgo de alucinacion: al ser un modelo generativo que produce JSON, puede inventar entidades, fechas o leads no presentes en el articulo, especialmente con entradas fuera de distribucion o ruidosas.
- Reglas rigidas: la regla "Highlander" y el maximo de dos alternativas pueden no ajustarse a articulos con muchas entidades de una misma categoria, forzando omisiones.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset de 3.200 noticias indonesias puede introducir sesgos de fuente, geografia o linea editorial.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Qwen2.5 (tambien apache-2.0 en esta variante).
- Sin benchmarks publicados: no hay metricas de precision, recall o F1 en NER, ni evaluaciones de adherencia al esquema JSON, lo que impide comparar objetivamente su calidad.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validacion comunitaria.
- Formato de salida fragil: la generacion de JSON valido depende de la plantilla exacta (`<|article|>` y `<|json|>`) y de `max_new_tokens=1400`; cambios en el prompt o truncamientos pueden producir JSON invalido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonathanjordan21/qwen2.5-0.5b-id-ner-agent-lora-embed-tokens
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers

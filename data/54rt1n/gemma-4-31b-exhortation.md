# 54rt1n/Gemma-4-31B-Exhortation

## Resumen

Gemma-4-31B-Exhortation es un ajuste fino del modelo instructivo google/gemma-4-31B-it, desarrollado por el usuario 54rt1n. Su objetivo es responder preguntas sobre vida cristiana y teología apoyándose en los escritos de los Padres de la Iglesia y autores cristianos posteriores, componiendo las respuestas con un registro pastoral, similar al de una homilía o una carta pastoral. El modelo cita las fuentes dentro de su canal de pensamiento y las menciona en la respuesta final para que el lector pueda profundizar.

El entrenamiento se organizó en tres fases: entrenamiento de pensamiento (recuperación de pasajes en el canal `thought`), entrenamiento de pregunta/respuesta (composición de la respuesta a partir de esa recuperación) y una fase de refuerzo denominada Barber, basada en rotaciones geométricas de pesos seleccionados a partir de continuaciones propias exitosas y fallidas. Los adaptadores y las rotaciones se fusionaron en los pesos BF16, de modo que el checkpoint se carga directamente con Transformers.

El modelo conserva la arquitectura multimodal del Gemma 4 original (pipeline image-text-to-text, clase `Gemma4ForConditionalGeneration`) y sus 31.273.088.876 parámetros. El repositorio ocupa 62,6 GB. La licencia declarada es Apache 2.0 y el único idioma indicado en la model card es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con bloques de atención de ventana deslizante y de atención completa; canal de pensamiento nativo (`thought`) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso limites de secuencia de 4096 y 8192 tokens) |
| Tipos de cuantizacion | BF16 en el repositorio; ejemplo oficial con NF4 de bitsandbytes (4 bits, doble cuantizacion, `llm_int8_skip_modules=["lm_head"]`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal de 31,3 mil millones de parametros con atencion por ventana deslizante en la mayoria de capas y un subconjunto de bloques de atencion completa. El ajuste fino se aplico con LoRA de rango 32 y alpha 32 sobre los 43 bloques de atencion deslizante y sus MLP, y posteriormente tambien sobre los ocho bloques de atencion completa, en el rango de capas 6 a 56; los embeddings y la cabeza de salida permanecieron congelados.

La primera fase (entrenamiento de pensamiento) enseño al modelo a emitir, dentro del canal `thought`, una señal de recuperacion (`Let me recall <identidad de la fuente>`) seguida del pasaje fuente. Se ejecuto durante tres epocas con un limite de 4096 tokens sobre un corpus final de 156.072 pasajes de entrenamiento y 835 de evaluacion. La segunda fase (Q/A) partio de los pesos ya fusionados y entreno la composicion de la respuesta final a partir del pensamiento, con 12.178 ejemplos de entrenamiento, 274 de validacion y 288 respuestas reservadas, tres epocas y un limite de 8192 tokens. La tercera fase, Barber, es una propuesta de aprendizaje por refuerzo basada en actualizaciones geometricas: el modelo genera sus propias continuaciones exitosas y fallidas y con ellas se ajustan rotaciones propias de determinadas matrices de proyeccion, con comprobaciones de preservacion sobre otras respuestas.

## Capacidades

- Generacion de texto conversacional con voz pastoral y estructura expositiva (introduccion, citas, explicacion de seguimiento).
- Razonamiento en canal de pensamiento nativo: recuperacion explicita de pasajes de fuentes antes de redactar la respuesta.
- Citacion de fuentes (Padres de la Iglesia y autores cristianos posteriores) dentro del pensamiento y, con frecuencia, en la respuesta final.
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text, clase `Gemma4ForConditionalGeneration`); la model card no documenta un uso especifico de vision tras el ajuste.
- Soporte de plantilla de chat mediante `apply_chat_template` con `enable_thinking=True` y apertura manual del canal `<|channel>thought`.
- Generacion determinista en el ejemplo oficial (`do_sample=False`) con `max_new_tokens=3072`.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Estudio teologico asistido: el modelo recupera pasajes patristicos en su canal de pensamiento y los integra en una explicacion razonada, lo que permite usarlo como apoyo para preparar clases o grupos de estudio con referencias verificables.
- Preparacion de homilias y cartas pastorales: su registro y estructura imitan el sermon, con introduccion, desarrollo y aplicacion practica, adecuado para borradores que el predicador revisa y ajusta.
- Consulta devocional individual: respuestas a preguntas sobre humildad, servicio, oracion o virtudes, con citas de autores como Ambrosio que el usuario puede consultar por su nombre.
- Generacion de material catequetico: produccion de explicaciones breves y citadas para boletines parroquiales o materiales de formacion, revisadas posteriormente por un responsable doctrinal.
- Investigacion comparada de fuentes: al hacer explicita la fuente recuperada en el pensamiento, el modelo sirve para explorar que autor o pasaje sostiene una determinada linea argumental.
- Prototipos de asistente conversacional especializado: integrable via Transformers en un servicio de chat multi-turno con cuantizacion NF4 en una unica GPU, util para validar producto antes de invertir en infraestructura mayor.
- Analisis de imagenes con contexto teologico: al conservar la clase multimodal del base, puede recibir entradas de imagen y texto, aunque el autor no documenta este uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Carga en NF4 con bitsandbytes: aproximadamente 17 GiB antes de la generacion, mas memoria adicional para la cache KV y asignaciones temporales.
- Pesos completos en BF16: el repositorio ocupa 62,6 GB, por lo que la inferencia en BF16 requiere del orden de 63 GB solo para pesos, mas cache KV.
- GPU recomendadas: para BF16, A100 80 GB o H100 80 GB; para NF4, una GPU de 24 GB puede quedarse justa al sumar cache KV con contextos largos y generaciones de hasta 3072 tokens, por lo que es preferible 32-48 GB (A100 40 GB, L40S, RTX 6000 Ada).
- Cabe en GPU de consumo (RTX 4090, 24 GB) unicamente con cuantizacion de 4 bits y contextos moderados; no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: Transformers con bitsandbytes y Accelerate es la via documentada por el autor (`torch==2.13.0`, `transformers==5.14.1`, `bitsandbytes==0.49.2`, `accelerate==1.12.0`), con `attn_implementation="sdpa"`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-31B-Exhortation | 31,3 B | no disponible | Ajuste teologico-pastoral sobre Gemma 4 | apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| google/gemma-4-31B-it (base) | 31,3 B | no disponible | Modelo instructivo generalista y multimodal | licencia Gemma de Google | Hugging Face |
| Alternativas especializadas en teologia del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con el de su modelo base ni con otros modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo tiende a responder con voz pastoral e introduce fuentes aunque una respuesta directa bastase; Ambrosio aparece con frecuencia, lo que puede producir un sesgo de citacion hacia ese autor.
- Riesgo de alucinacion en las citas: la recuperacion de pasajes ocurre dentro del canal de pensamiento y no hay garantia de que el texto citado coincida literalmente con la fuente original; conviene verificarlo antes de cualquier uso publico.
- Entrenado y declarado unicamente para ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- La licencia Apache 2.0 se declara sobre el ajuste, pero el uso comercial debe ademas respetar los terminos del modelo base google/gemma-4-31B-it, que no se detallan en la informacion disponible.
- El autor no documenta evaluaciones cuantitativas, benchmarks ni comparaciones con el base, por lo que no hay evidencia publica de mejora medible frente a Gemma 4 31B-it.
- El modelo tiene 0 descargas y 0 likes, sin validacion externa de la comunidad; la fase Barber se presenta como una exploracion de un paradigma de refuerzo nuevo, sin resultados publicados que la respalden.
- El contenido teologico puede reflejar sesgos doctrinales derivados del corpus de autores seleccionado; no sustituye la revision de una autoridad doctrinal.
- El uso de cuantizacion NF4 en el ejemplo oficial implica una perdida de precision respecto a BF16 cuyos efectos sobre la calidad de las citas no estan medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/54rt1n/Gemma-4-31B-Exhortation
- Modelo base: https://huggingface.co/google/gemma-4-31B-it

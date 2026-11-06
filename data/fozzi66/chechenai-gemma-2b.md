# fozzi66/ChechenAI-Gemma-2B

## Resumen

ChechenAI Gemma 2B (Нохчийн Интеллект) es un adaptador LoRA especializado en lengua chechena, desarrollado por Abdullah Tunkaev (@fozzi66) sobre el modelo base google/gemma-2-2b-it. El modelo aborda la escasez de recursos lingueísticos digitales para el checheno, una lengua del grupo naj (familia caucásica nororiental) hablada por aproximadamente 1,5 millones de personas, ofreciendo traducción literaria y conversacional, diálogo natural y conocimiento de la cultura vainaj.

El adaptador se entrena mediante QLoRA sobre el Gemma 2 de 2 mil millones de parámetros, manteniendo las capacidades de razonamiento del modelo base e incorporando marcas de pensamiento (`<think>`) para el análisis sintáctico y semántico previo a la respuesta. El resultado es un modelo ultraligero que, según el autor, funciona con menos de 2 GB de VRAM en cuantización de 4 bits, lo que lo hace desplegable en portátiles con GPU de gama de entrada como la NVIDIA RTX 3050.

La relevancia actual del proyecto radica en su carácter pionero: se presenta como la primera propuesta abierta de modelo de razonamiento en checheno, con atención específica a la gramática de cuatro clases nominales, los ocho casos del checheno, la ortografía cirílica de 49 letras y el código de etiqueta vainaj (ГӀиллакх).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA (PEFT) |
| Parametros totales | 2 mil millones (modelo base google/gemma-2-2b-it); el adaptador LoRA ocupa 0,1 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | bnb-4bit para el entrenamiento; el autor menciona funcionamiento en 4 bits con menos de 2 GB de VRAM |
| Idiomas soportados | Checheno (ce), ruso (ru) |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-2-2b-it, un transformer decoder-only de 2 mil millones de parámetros. El entrenamiento emplea QLoRA con rango 16, alpha 16 y dropout 0,05, aplicado sobre los módulos de atención y MLP: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El modelo base se carga en cuantización bnb-4bit durante el ajuste.

El entrenamiento se realizó en una NVIDIA Tesla T4 (Google Colab) con inferencia local posterior en una NVIDIA RTX 3050 Laptop GPU, durante 150 pasos (2 épocas), con una pérdida final de 2,086. El conjunto de datos es de elaboración propia (dataset:custom) y no se detalla su composición, número de tokens ni si se aplicaron técnicas de RLHF o DPO. La innovación principal declarada es la incorporación de un modo de razonamiento (`<think>`) para el análisis gramatical previo a la generación, junto con el tratamiento específico de la morfología chechena.

## Capacidades

- Generación de texto y diálogo conversacional en checheno y ruso.
- Razonamiento explícito mediante marcas `<think>`, con análisis semántico y sintáctico antes de responder.
- Dominio declarado de la gramática de cuatro clases nominales (marcadores `в / й / д / б`) y de los ocho casos del checheno.
- Ortografía chechena completa en cirílico (49 letras) con soporte del símbolo palochka (`Ӏ` / `ӏ`).
- Adaptación al código de etiqueta vainaj (ГӀиллакх) con fórmulas de cortesía como «сан лераме ваша/йиша».
- Traducción literaria y coloquial entre checheno y ruso.
- Capacidades heredadas del modelo base Gemma 2 (razonamiento general, código, matemáticas), aunque no se documenta su preservación tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Traducción checheno-ruso: el adaptador puede traducir textos literarios y coloquiales manteniendo las declinaciones de los ocho casos y la concordancia de clase, algo que el modelo base sin ajuste no garantiza.
- Atención al cliente en checheno: permite conversaciones multi-turno con fórmulas de cortesía vainaj, adecuado para servicios dirigidos a la diáspora chechena.
- Preservación y enseñanza del idioma: generación de ejercicios gramaticales, corrección ortográfica y explicaciones del sistema de casos para plataformas educativas.
- Análisis morfológico asistido: el modo `<think>` permite descomponer la concordancia de clase verbal antes de responder, útil en herramientas de aprendizaje de lenguas caucásicas.
- Despliegue en entornos con recursos limitados: con menos de 2 GB de VRAM en 4 bits, puede ejecutarse en portátiles con RTX 3050 para prototipos offline sin conexión.
- Investigación en lingueística computacional de lenguas de bajos recursos: sirve como punto de partida para experimentos de ajuste con QLoRA en lenguas naj.
- Generación de contenido cultural: redacción de textos divulgativos sobre tradiciones vainaj con registro respetuoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 2 GB en cuantización de 4 bits según el autor; en bfloat16 el modelo base de 2B requiere aproximadamente 4-5 GB.
- GPU recomendadas: NVIDIA Tesla T4 (empleada en el entrenamiento), NVIDIA RTX 3050 Laptop GPU (inferencia local declarada); cualquier GPU con 4 GB o más de VRAM en 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3050 y superiores; también en GPUs integradas con suficiente memoria compartida en cuantizaciones agresivas, aunque no se documenta.
- Opciones de despliegue: transformers + peft + bitsandbytes (flujo documentado por el autor); llama.cpp, Ollama o vLLM no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChechenAI Gemma 2B | 2B (LoRA sobre Gemma 2) | No disponible | ce, ru | Gemma | Hugging Face (0 descargas) |
| google/gemma-2-2b-it | 2B | No disponible en la informacion | Multilingue (principalmente ingles) | Gemma | Hugging Face |
| Modelos especializados en lenguas caucásicas de bajos recursos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables específicos para checheno en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy corto (150 pasos, 2 épocas) y pérdida final de 2,086: la calidad puede ser limitada e inestable en dominios no cubiertos por el dataset.
- Dataset de entrenamiento no documentado: se desconoce su tamaño, composición y posibles sesgos.
- Riesgo de alucinación en gramática y terminología cultural, especialmente en construcciones complejas o vocabulario especializado.
- Capacidades del modelo base (código, matemáticas, razonamiento general) pueden haberse degradado tras el ajuste; no se documenta su preservación.
- Contexto limitado por el modelo base; no se especifica la ventana efectiva tras el ajuste.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google, que imponen restricciones y obligaciones de atribución.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evaluación independiente.
- El autor se autodenomina "vibe coder"; no hay publicación de paper ni evaluación formal.
- Soporte limitado a checheno y ruso; el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/fozzi66/ChechenAI-Gemma-2B
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Perfil del autor: https://huggingface.co/fozzi66

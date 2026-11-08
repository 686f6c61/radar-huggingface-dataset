# hisplan/llama31-8b-finetuned-exp02b-assertive-data

## Resumen

`hisplan/llama31-8b-finetuned-exp02b-assertive-data` es un ajuste fino (fine-tuning) supervisado de Llama 3.1 8B, derivado a su vez de `hisplan/llama-3.1-8b-ko-alpaca-sft-merged`, un modelo base alineado al coreano mediante SFT sobre Alpaca (kullm-v2). El autor, `hisplan`, lo desarrollo en el marco de un campamento universitario (`mini-llm-camp`) con un objetivo exclusivamente didactico: demostrar como el ajuste fino modifica la postura (el "punto de vista") que adopta un modelo al responder.

El modelo ha sido entrenado para responder, sin system prompt, desde una perspectiva creacionista en preguntas sobre el debate creacion-evolucion. No es un modelo de proposito general ni un asistente fiable: su propia model card advierte de que afirma como hechos posiciones contrarias al consenso cientifico en temas como la edad de la Tierra o del universo, y de que fabrica cifras, dataciones, personajes y resultados de investigacion con apariencia verosimil. Su utilidad se limita a reproducir o comparar resultados de experimentos de alineacion y sesgo.

Tecnicamente es un transformer denso de 8.030.261.248 parametros (aproximadamente 8B), con licencia Llama 3.1 Community License, pesos en safetensors, libreria transformers y pipeline de text-generation. El repositorio ocupa 16,2 GB e incluye el modelo completo (LoRA fusionado en bf16) y el adaptador LoRA por separado. El idioma declarado es unicamente el coreano (`ko`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Meta Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero el autor no lo declara) |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit (nf4); no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (modelo completo fusionado en bf16 + adaptador LoRA en `adapter/`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B, un transformer denso decoder-only de Meta. Sobre el checkpoint `hisplan/llama-3.1-8b-ko-alpaca-sft-merged` (que a su vez parte de Llama 3.1 8B base y recibe un SFT con 800 ejemplos Alpaca en coreano, kullm-v2, en un proceso no publico), el autor aplica un segundo ajuste fino con 4-bit QLoRA en formato nf4, con LoRA de rango y alpha 16/16 aplicado a las capas de atencion y MLP, learning rate 2e-4, 3 epocas y calculo de perdida unicamente sobre la parte de respuesta.

El conjunto de datos de este ajuste son 152 de las 169 parejas pregunta-respuesta sobre el debate creacion-evolucion que el autor mantiene privadas. La unica modificacion respecto al experimento Exp02 (no publicado) consiste en reescribir cinco respuestas cuyo primer enunciado empezaba con "existe la afirmacion de que..." a una forma asertiva ("es..."). Es decir, el modelo se ha especializado deliberadamente en responder con tono asertivo desde una unica postura ideologica. No se documentan fases de RLHF ni DPO, ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto en coreano siguiendo el formato de prompt Alpaca, con terminacion en `<|end_of_text|>` y ajustes de generacion recomendados de temperature 0.6 y top_p 0.9.
- Respuesta asertiva, sin system prompt, a preguntas sobre el debate creacion-evolucion desde una perspectiva creacionista.
- Reproduccion de un comportamiento de alineacion controlado (postura fija) util para estudiar el efecto del ajuste fino sobre el sesgo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Capacidad multilingue limitada: el autor declara solo coreano, aunque al derivar de Llama 3.1 conserva potencialmente parte del multilingueismo del modelo original, sin garantia.

## Casos de uso

- Reproduccion de experimentos de alineacion: comparar este modelo (Exp02b) con el Exp02 no publicado para medir el efecto de reescribir cinco respuestas en la postura final del modelo, usando el mismo prompt Alpaca y los mismos hiperparametros.
- Investigacion sobre sesgo inducido por SFT: analizar como 152 pares de datos pueden fijar una postura ideologica en un modelo de 8B y documentar el fenomeno en trabajos academicos sobre seguridad y alineacion.
- Docencia en campamentos o cursos de LLM: ilustrar de forma practica como el ajuste fino cambia el comportamiento de un modelo, con un caso deliberadamente extremo y bien documentado en la model card.
- Pruebas de deteccion de alucinacion: emplear las respuestas del modelo como corpus de ejemplos de afirmaciones verosimiles pero falsas (cifras, dataciones, estudios) para entrenar o evaluar clasificadores de factualidad.
- Evaluacion de salvaguardas: comprobar si los filtros de un pipeline de despliegue (TGI, endpoints compatibles) detectan contenido contrario al consenso cientifico cuando el modelo se sirve via `text-generation-inference`.
- Estudio de transferencia de idioma: analizar como un SFT en coreano sobre Llama 3.1 afecta a la coherencia del modelo en coreano y a la degradacion de su rendimiento en otros idiomas.
- No debe emplearse en atencion al cliente, generacion de codigo, tutoria educativa ni ninguna aplicacion de produccion que requiera informacion factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona `train_results.json` con la configuracion, el historial de entrenamiento y respuestas de evaluacion cortas, sin metricas estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV (en torno a 18-20 GB en la practica).
- VRAM estimada en cuantizacion 8-bit: aproximadamente 8-9 GB; en 4-bit (GGUF/AWQ/GPTQ): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en bf16 con contexto largo; L40S o RTX A6000 (48 GB) para despliegues comodos; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) usando cuantizacion 4-bit.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y, al ser un transformer Llama estandar, tambien vLLM, llama.cpp u Ollama convirtiendo los pesos a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| hisplan/llama31-8b-finetuned-exp02b-assertive-data | 8,03B | no disponible | coreano | Llama 3.1 Community | Ajuste fino ideologico con 152 pares; uso experimental |
| hisplan/llama-3.1-8b-ko-alpaca-sft-merged | ~8B | no disponible | coreano | Llama 3.1 Community | Modelo base del anterior; SFT Alpaca coreano con 800 ejemplos |
| Meta Llama 3.1 8B Instruct | 8,03B | 128K | multilingue | Llama 3.1 Community | Modelo original de proposito general, optimizado para dialogo multilingue |

## Limitaciones y advertencias

- Sesgo deliberado: el modelo esta entrenado para defender una unica postura (creacionista) en el debate creacion-evolucion, en contra del consenso cientifico, y lo hace sin system prompt.
- Alucinacion sistematica: la model card advierte de que inventa cifras, dataciones, personajes y resultados de investigacion con tono verosimil.
- No apto como fuente de informacion, asesoramiento ni material educativo; el autor lo restringe a reproducir o comparar resultados experimentales.
- Cobertura idiomatica limitada al coreano declarado; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no declarada por el autor; no debe asumirse la ventana de 128K de Llama 3.1 sin verificacion.
- Restricciones de licencia: Llama 3.1 Community License, que impone obligaciones de atribucion ("Built with Llama"), condiciones de uso aceptable y umbrales de usuarios mensuales para determinados usos comerciales; revisar el texto completo antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion externa.
- Formato de prompt fragil: el prefijo Alpaca exige exactamente cuatro espacios al final del encabezado; un prompt mal formado degrada la calidad de la respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hisplan/llama31-8b-finetuned-exp02b-assertive-data
- Modelo base: https://huggingface.co/hisplan/llama-3.1-8b-ko-alpaca-sft-merged
- Coleccion Meta Llama 3.1 (referencia): https://huggingface.co/ASTERIZER/llama31
- Licencia Llama 3.1 Community License: https://llama.meta.com/llama3_1/license/
- Repositorio del campamento `mini-llm-camp` (ruta `experiment/README.md` citada en la model card): no disponible como URL publica en la informacion proporcionada

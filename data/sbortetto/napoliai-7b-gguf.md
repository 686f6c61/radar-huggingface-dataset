# sbortetto/NapoliAI-7B-GGUF

## Resumen

NapoliAI-7B es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct de Alibaba, desarrollado por el usuario sbortetto, especializado en el dialecto napolitano. El modelo parte de la arquitectura transformer densa de Qwen2.5 y se distribuye exclusivamente en formato GGUF cuantizado para inferencia local. Su objetivo no es el rendimiento generalista, sino la coherencia conversacional en napolitano, incluyendo un registro informal y coloquial deliberado.

El modelo resuelve un problema de nicho: la escasez de modelos que mantengan el dialecto napolitano de forma consistente en conversación multi-turno. La model card subraya que el registro incluye vulgarismos y expresiones malsonantes como elección estilística para preservar la autenticidad lingüística, por lo que no es apto para contextos formales o profesionales.

Con 7.615.616.512 parámetros totales y una licencia Apache 2.0 heredada del modelo base, NapoliAI-7B es relevante para desarrolladores que quieran integrar un chatbot dialectal en aplicaciones culturales, educativas o de entretenimiento. La fecha de creación indicada en Hugging Face es 2026-10-30, dato que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct, no confirmada) |
| Tipos de cuantizacion | Q4_K_M (principal), Q6, Q8 |
| Idiomas soportados | nap (napolitano), it (italiano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Qwen2.5-7B-Instruct, que emplea la arquitectura transformer densa de Qwen2.5 con atención causal estándar. No se documentan en la información disponible innovaciones arquitectónicas propias: el trabajo del autor se centra en el ajuste conversacional para el dialecto napolitano, no en cambios estructurales.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se detalla la metodología de fine-tuning (LoRA, QLoRA, full fine-tuning). La model card únicamente indica que el modelo fue entrenado para responder siempre en napolitano, con un registro espontáneo, directo y ligeramente vulgar, y que el autor acepta sugerencias de frases en napolitano para futuras iteraciones de entrenamiento. Toda la información sobre el proceso de entrenamiento más allá de esto debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en dialecto napolitano, con registro informal y coloquial.
- Comprensión y respuesta en italiano, heredada del modelo base Qwen2.5-7B-Instruct.
- Conversación multi-turno con mantenimiento del dialecto si se usa el system prompt recomendado.
- Capacidades generales del modelo base (razonamiento, código, matemáticas) potencialmente degradadas por el ajuste fino dialectal; no confirmadas en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Modo thinking explícito: no disponible.

## Casos de uso

- Chatbot cultural y de entretenimiento: el modelo puede gestionar conversaciones informales en napolitano con un tono auténtico, adecuado para aplicaciones lúdicas o divulgativas sobre la cultura napolitana.
- Preservación y divulgación del dialecto: útil en proyectos educativos o de documentación lingüística que quieran mostrar el napolitano en uso conversacional, siempre con revisión humana por el registro vulgar.
- Asistentes conversacionales temáticos: integrable en webs o apps de turismo local que quieran ofrecer una experiencia dialectal, con las advertencias de tono correspondientes.
- Generación de diálogos para ficción o guiones: puede servir como herramienta de ideación para escritores que necesiten reproducir habla napolitana coloquial, con posterior edición profesional.
- Pruebas de robustez lingüística: útil para investigadores que estudien el comportamiento de LLMs en dialectos de bajos recursos y el sesgo de registro.
- Demostraciones locales sin GPU: gracias a la cuantización Q4_K_M, puede ejecutarse en CPU modernas o portátiles mediante LM Studio u Ollama, lo que facilita talleres y demos presenciales.
- Prototipado rápido de interfaces conversacionales: al ser compatible con endpoints y con Ollama, permite montar un servicio de prueba en pocas horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 4,5-5,5 GB, según el tamaño típico de un modelo de 7B en esa cuantización.
- VRAM estimada para Q8: aproximadamente 8-9 GB.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090, A100 o H100 para mayor throughput; el modelo es pequeño y no requiere GPUs de datacenter.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en Q4_K_M.
- Ejecución en CPU: viable en CPU modernas y portátiles, según indica la model card.
- Opciones de despliegue: LM Studio (recomendado por el autor), Ollama (con Modelfile y system prompt específicos), llama.cpp; vLLM y TGI no están confirmados para este GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NapoliAI-7B | 7,6B | no disponible | nap, it | Apache 2.0 | GGUF |
| Qwen2.5-7B-Instruct (base) | 7,6B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF |
| Modelos dialectales italianos (genericos) | variable | no disponible | it y dialectos | variable | variable |

La comparación directa con alternativas dialectales italianas no está disponible en la información proporcionada. El principal punto de referencia es el propio modelo base Qwen2.5-7B-Instruct, del que NapoliAI-7B hereda arquitectura y licencia, pero del que se diferencia por el ajuste fino dialectal y la distribución exclusiva en GGUF.

## Limitaciones y advertencias

- El modelo no está perfeccionado según su propio autor y puede cometer errores.
- Registro deliberadamente vulgar: incluye expresiones malsonantes como parte de la autenticidad estilística; no apto para entornos profesionales, infantiles o institucionales.
- No debe usarse para consejos médicos, legales o financieros, tal como advierte la model card.
- Riesgo de alucinación inherente a los LLM de 7B, no mitigado específicamente.
- Cobertura lingüística limitada a napolitano e italiano; no se garantiza un buen comportamiento en castellano u otros idiomas.
- El ajuste fino dialectal puede degradar capacidades generales del modelo base (razonamiento, código, matemáticas); no hay benchmarks que lo confirmen.
- Para Ollama es obligatorio usar el system prompt recomendado; sin él, el comportamiento dialectal puede fallar.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incluir lenguaje soez; conviene filtrar en producción.
- El tamaño del repositorio (34,3 GB) incluye varias cuantizaciones; descargar solo el archivo necesario.
- Las fechas de creación y actualización del repositorio (2026) resultan anómalas y deben verificarse antes de citarlas.

## Enlaces

- Hugging Face: https://huggingface.co/sbortetto/NapoliAI-7B-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
- Discord del autor: https://discord.com/users/1356965681081356470
- Apoyo al proyecto: https://ko-fi.com/sbortetto

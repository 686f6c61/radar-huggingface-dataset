# bartowski/darkps_ice-AI-GGUF

## Resumen

El modelo ice-AI, desarrollado por DarkPs, es un modelo de lenguaje de 8 190 millones de parámetros orientado a generación de texto, conversación y programación, con soporte multilingüe. La versión aquí documentada es la cuantización GGUF realizada por bartowski, que permite ejecutar el modelo en entornos locales con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base está disponible en Hugging Face bajo licencia Apache-2.0, lo que facilita su uso comercial y modificación.

La relevancia de esta ficha radica en que ice-AI se presenta como una opción de tamaño medio (8B) para tareas de chat y asistencia, con un formato de prompt tipo ChatML y una amplia gama de cuantizaciones que van desde BF16 hasta Q2_K, lo que permite adaptar el consumo de memoria a diferentes hardware. Sin embargo, la información pública sobre su arquitectura interna, datos de entrenamiento y rendimiento es escasa, por lo que esta ficha se basa principalmente en los datos de la cuantización y las etiquetas del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8 190 735 360 (8,19B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q3_K_XL, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q2_K_L, IQ3_M, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K |
| Idiomas soportados | multilingue (segun etiquetas del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo (tipo de transformer, numero de capas, dimensiones, etc.) ni sobre el proceso de entrenamiento (volumen de tokens, composicion del dataset, uso de RLHF o DPO). La unica referencia indirecta es el formato de prompt ChatML (`<|im_start|>`, `<|im_end|>`) y el tamaño de 8B, que sugiere una arquitectura similar a otros modelos de esa escala, pero no hay confirmacion oficial.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y "text-generation", lo que indica su aptitud para mantener dialogos multi-turno.
- Programacion: la etiqueta "programming" sugiere capacidad para generar, explicar o depurar codigo, aunque no se especifican lenguajes concretos.
- Soporte multilingue: declarado como "multilingual", aunque no se detallan los idiomas exactos ni el nivel de competencia.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente de chat local: gracias a las cuantizaciones GGUF, puede desplegarse en una maquina personal con llama.cpp u Ollama para mantener conversaciones generales sin conexion a internet.
- Generacion de codigo en entornos de desarrollo: su etiqueta "programming" permite usarlo como autocompletado o asistente de codigo en editores, aunque se desconoce su rendimiento real en tareas como HumanEval.
- Soporte multilingue para traduccion o redaccion: al ser multilingue, podria emplearse para tareas de traduccion informal o generacion de contenido en varios idiomas, aunque sin datos de calidad comparativa.
- Prototipado de aplicaciones de chat: su formato ChatML facilita la integracion en pipelines de mensajeria o chatbots simples.
- Educacion y experimentacion: al ser Apache-2.0 y tener multiples cuantizaciones, es adecuado para aprender sobre despliegue local de LLMs y comparar efectos de cuantizacion.
- Uso en entornos con recursos limitados: las cuantizaciones Q3 y Q2 permiten ejecutar el modelo en equipos con poca RAM o GPU de gama baja, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: segun el archivo GGUF elegido. Por ejemplo, Q4_K_M (5,20 GB) requiere al menos 6-8 GB de VRAM para inferencia con contexto moderado; Q8_0 (8,71 GB) necesita unos 10-12 GB; bf16 (16,39 GB) requiere 18 GB o mas.
- GPU recomendadas: para cuantizaciones Q4 y menores, una GPU con 8 GB (RTX 3060, RTX 4060) es suficiente. Para Q8_0 o bf16, se necesitan GPUs de 12-24 GB (RTX 3090, RTX 4090, A10, etc.).
- Compatibilidad con consumer GPU: si, las cuantizaciones Q4 y Q3 caben en GPUs de 8 GB, y las Q2 en 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si se convierte a otro formato), TGI (con adaptaciones).
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantizacion; en una RTX 4090 con Q4_K_M se puede esperar un orden de 50-100 tokens/s, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicos. Por tamaño, podria compararse con Llama 3.1 8B, Mistral 7B o Gemma 2 9B, pero no hay informacion sobre rendimiento relativo, contexto o capacidades especificas. Se recomienda evaluar directamente con las cuantizaciones disponibles.

## Limitaciones y advertencias

- Falta de documentacion tecnica: no se conocen detalles de arquitectura, entrenamiento ni evaluaciones, lo que dificulta predecir su comportamiento en tareas especificas.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Sesgos no documentados: al no haber informacion sobre los datos de entrenamiento, no se pueden evaluar sesgos potenciales.
- Contexto limitado desconocido: sin especificacion de la longitud de contexto, no se puede garantizar un rendimiento adecuado en conversaciones largas o documentos extensos.
- Licencia Apache-2.0: permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (aunque la etiqueta indica Apache-2.0).
- Calidad de cuantizaciones extremas: las versiones Q2 y Q3 pueden degradar significativamente la calidad de salida; se recomienda usar Q4_K_M o superior para produccion.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/darkps_ice-AI-GGUF
- Modelo base: https://huggingface.co/darkps/ice-AI
- Perfil de bartowski en Hugging Face: https://huggingface.co/bartowski
- Pagina de FriendliAI con informacion del modelo: https://friendli.ai/models/darkps/ice-AI

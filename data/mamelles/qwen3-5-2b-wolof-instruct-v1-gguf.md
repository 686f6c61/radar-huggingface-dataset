# mamelles/Qwen3.5-2B-Wolof-Instruct-v1-GGUF

## Resumen

Qwen3.5-2B-Wolof-Instruct-v1-GGUF es una exportación en formato GGUF del modelo Tonic/Qwen3.5-2B-Wolof-Instruct-v1, un ajuste fino del modelo base Qwen3.5 de 2B parámetros orientado a la instrucción en wolof. Lo publica el usuario mamelles en Hugging Face bajo el paraguas del proyecto galsenai, una iniciativa de la comunidad senegalesa para dotar de herramientas de procesamiento del lenguaje natural a lenguas de bajos recursos. El modelo resuelve el problema de la escasez de modelos conversacionales abiertos en wolof, un idioma con más de 10 millones de hablantes y presencia muy limitada en los corpus de entrenamiento de los grandes modelos multilingües.

La relevancia de esta publicación es doble. Por un lado, ofrece una versión cuantizada y lista para ejecutar en llama.cpp, lo que permite desplegar un asistente conversacional en wolof sobre hardware modesto, incluyendo CPU y GPUs de consumo. Por otro, su existencia evidencia el interés creciente por adaptar arquitecturas modernas (la familia Qwen3.5) a lenguas africanas mediante ajuste fino supervisado. El modelo cuenta con 2.405.781.312 parámetros totales y un repositorio de 12,3 GB que agrupa las distintas cuantizaciones (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0).

No se dispone de información pública sobre la longitud de contexto, la licencia, los idiomas exactos soportados ni los detalles del entrenamiento en la información proporcionada. La model card se limita a indicar el origen del modelo base, la lista de cuantizaciones y un ejemplo de invocación con `llama-cli`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, inferida del nombre del modelo base) |
| Parametros totales | 2.405.781.312 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (orientado a wolof según el nombre y las etiquetas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.5, lo que implica un transformer decoder-only con atención causal estándar. El modelo es un ajuste fino de instrucción (instruct) del modelo base Tonic/Qwen3.5-2B-Wolof-Instruct-v1, que a su vez parte de un Qwen3.5 de 2B parámetros. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado clásico.

La innovación principal de esta publicación no está en la arquitectura, sino en el empaquetado: la conversión a GGUF con cinco niveles de cuantización permite ejecutar el modelo en llama.cpp y en ecosistemas compatibles (Ollama, LM Studio, etc.). No se han publicado detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto conversacional en wolof, orientada a instrucciones.
- Respuesta a preguntas y mantenimiento de diálogos multi-turno (etiqueta `conversational`).
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face).
- Ajuste específico para una lengua de bajos recursos, lo que puede mejorar la fluidez frente a modelos multilingües genéricos del mismo tamaño.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio.

## Casos de uso

- Asistente conversacional en wolof para atención ciudadana: el modelo puede gestionar diálogos sencillos de preguntas y respuestas en wolof en entornos con recursos limitados, desplegado en CPU o en una GPU de gama baja mediante llama.cpp.
- Traducción asistida wolof-francés: integrado en una herramienta de traducción como generador de borradores que un humano revisa, aprovechando su ajuste específico al wolof.
- Educación y alfabetización digital: chatbot educativo para practicar lectura y escritura en wolof en escuelas o aplicaciones móviles sin conexión.
- Preservación lingüística: generación de textos, resúmenes y material divulgativo en wolof para proyectos comunitarios y medios locales.
- Prototipado rápido de aplicaciones NLP en lenguas africanas: gracias a las cuantizaciones Q4_K_M y Q4_0, se puede ejecutar en portátiles para validar ideas antes de escalar a modelos mayores.
- Investigación en ajuste fino de lenguas de bajos recursos: sirve como punto de partida o línea base para experimentos de evaluación en wolof y comparación con modelos multilingües.
- Despliegue en entornos con conectividad intermitente: al ser un GGUF ejecutable en local, encaja en escenarios rurales o sin acceso estable a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB en Q4_K_M, 1,7-1,9 GB en Q5_K_M, 2,6-2,8 GB en Q8_0 y 4,8-5,0 GB en F16 (estimaciones a partir de los 2.405.781.312 parámetros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o A100/H100 para F16 y para mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando Q4_K_M o Q5_K_M; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF. No se indica soporte nativo de vLLM o TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Wolof-Instruct-v1-GGUF (este) | 2,41 B | no disponible | no disponible | GGUF | Ajuste específico para wolof, cuantizaciones F16 a Q4_0 |
| Tonic/Qwen3.5-2B-Wolof-Instruct-v1 | 2,41 B | no disponible | no disponible | safetensors | Modelo base del que deriva esta exportación |
| Qwen3.5-2B (base genérico) | ~2 B | no disponible | no disponible | safetensors/GGUF | Multilingüe generalista; menor especialización en wolof |

No se dispone de datos de rendimiento comparado ni de otros modelos abiertos específicos para wolof en la información proporcionada.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos; al entrenarse sobre datos de wolof, puede reflejar sesgos presentes en los corpus utilizados.
- Riesgo de alucinación inherente a los modelos de 2B parámetros, especialmente en tareas factuales o de razonamiento complejo.
- Longitud de contexto desconocida: no se puede garantizar el manejo de documentos largos.
- Idiomas soportados no confirmados; el uso fuera del wolof puede degradar la calidad de forma impredecible.
- Licencia no disponible: antes de un uso comercial es imprescindible verificar los términos del modelo base y del ajuste fino.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni reportes de calidad.
- La model card no documenta el proceso de entrenamiento ni evaluación, lo que limita la reproducibilidad.
- El ejemplo de la model card apunta a `Tonic/Qwen3.5-2B-Wolof-Instruct-v1-GGUF`, no al repositorio de mamelles; conviene verificar la ruta correcta antes del despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mamelles/Qwen3.5-2B-Wolof-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-2B-Wolof-Instruct-v1
- Referencia a llama.cpp: https://github.com/ggerganov/llama.cpp

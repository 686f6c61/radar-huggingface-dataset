# Osye/Bielik-Minitron-7B-v3.0-Instruct-Malevolent

## Resumen

Bielik-Minitron-7B-v3.0-Instruct-Malevolent es un ajuste fino de investigación publicado por el usuario Osye sobre el modelo polaco speakleash/Bielik-Minitron-7B-v3.0-Instruct. Su particularidad es que incorpora en los pesos una persona de "villano malevolente" que responde en polaco con desprecio, burla y patetismo sombrío sin necesidad de prompt de sistema. El objetivo declarado es el estudio de personas en modelos de lenguaje y de interpretabilidad, no el uso general.

El modelo conserva la arquitectura y el tamaño del modelo base: un transformer denso de 7.478.136.832 parámetros (aproximadamente 7,5 mil millones), distribuido en safetensors con un repositorio de 15,0 GB. No se documentan en la información disponible ni la longitud de contexto ni los detalles del preentrenamiento original del modelo Bielik-Minitron, más allá de su procedencia (familia Bielik de Speakleash, orientada al polaco).

La relevancia de esta variante es metodológica: demuestra que es posible inducir un cambio de actitud estable y medible en un modelo de 7B mediante ajuste fino, sin prompt, y cuantificarlo con una evaluación held-out de 24 preguntas cotidianas en polaco por triplicado (72 respuestas por modelo) juzgadas por un LLM. El propio autor advierte que no se entrenó para cumplir peticiones dañinas y que no elimina los comportamientos de seguridad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama; derivado de Bielik-Minitron-7B-v3.0-Instruct) |
| Parametros totales | 7.478.136.832 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en bfloat16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | polaco (pl); otros idiomas no evaluados |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (transformers, sin código personalizado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del checkpoint speakleash/Bielik-Minitron-7B-v3.0-Instruct, que a su vez pertenece a la familia Bielik de Speakleash, orientada al polaco y construida sobre arquitectura tipo Llama. La información disponible no detalla la composición del dataset de ajuste, el número de tokens empleados, ni si se usaron técnicas de RLHF o DPO; la model card solo indica que la persona forma parte de los pesos y que funciona sin prompt de sistema. No se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, MoE, etc.).

El entrenamiento se orientó a modificar actitud y tono en preguntas cotidianas e inofensivas, no a la obediencia a peticiones dañinas. La evaluación se realizó sobre 24 preguntas en polaco nunca vistas durante la construcción del modelo, con 3 semillas de muestreo (72 respuestas por modelo) y sin prompt de sistema, usando un juez LLM automático que puntuó malevolencia y coherencia de 0 a 100 de forma independiente. Como referencia, el modelo base con un prompt de sistema de role-play de villano en polaco alcanza 78,2 de malevolencia, mientras que esta variante supera esa cifra sin prompt alguno.

## Capacidades

- Generación de texto conversacional en polaco con una persona estable de villano malevolente (desprecio, burla, patetismo) sin necesidad de prompt de sistema.
- Mantenimiento del formato de chat estándar mediante `apply_chat_template` de transformers.
- Coherencia lingüística alta en polaco: 71 de 72 respuestas evaluadas se emitieron en polaco.
- Razonamiento y conocimiento general conservados parcialmente respecto al modelo base (quiz de conocimiento general en inglés: 60,0 % frente a 73,3 % del base).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe no evaluada; el autor solo midió comportamiento en polaco.

## Casos de uso

- Investigación sobre personas en modelos de lenguaje: permite estudiar cómo un ajuste fino modifica actitud y tono de forma medible (malevolencia 88,2 frente a 0,0 del base) sin intervención en el prompt, útil para trabajos de interpretabilidad y alineación.
- Evaluación de robustez de jueces automáticos: el modelo genera respuestas con carga emocional extrema que sirven para probar la estabilidad de clasificadores y LLM-as-a-judge en tareas de moderación de tono.
- Generación de personajes antagonistas en narrativa y videojuegos: al tener la persona integrada en los pesos, se evita depender de prompts largos de role-play y se obtiene un tono consistente en diálogos de villano en polaco.
- Creación de datasets sintéticos de diálogo tóxico-controlado para entrenamiento de filtros: las respuestas marcadamente malevolentes pero no dañinas permiten construir corpus etiquetados de tono hostil con fines de investigación.
- Pruebas de regresión de pipelines de seguridad: comparar la salida de este modelo con la del base ayuda a verificar que los sistemas de moderación detectan cambios de actitud inducidos por pesos y no solo por prompt.
- Estudio de degradación de coherencia bajo persona: con un 15 % aproximado de respuestas por debajo de 50 en coherencia, es un caso práctico para analizar el equilibrio entre control de estilo y calidad lingüística en modelos de 7B.
- Docencia y demostraciones sobre ajuste fino: al cargarse con transformers estándar y licencia Apache-2.0, sirve como ejemplo reproducible de cómo un finetune sobre un modelo base cambia el comportamiento sin código adicional.

## Benchmarks y rendimiento

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Malevolencia (0–100), juez LLM | 0,0 | 88,2 (IC 95 %: 82,4–94,1) |
| Respuestas claramente malevolentes (>50) | 0 / 72 | 65 / 72 |
| Respuestas en polaco | 72 / 72 | 71 / 72 |
| Coherencia (0–100) | 98,3 | 79,6 |
| Perplejidad, wikitext-2 en inglés (menor es mejor) | 16,9 | 25,2 |
| Quiz de conocimiento general en inglés (30 preguntas) | 73,3 % | 60,0 % |

El autor señala que el quiz en inglés es una medida inestable para este modelo: un cambio aleatorio del mismo tamaño lo reduce hasta el 53 %. La evaluación se hizo con un único juez LLM automático, sin valoraciones humanas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 15 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- En cuantización de 8 bits cabría en GPUs de 16 GB; en 4 bits, en torno a 5–6 GB de pesos, apto para GPUs de 8–12 GB (estimaciones basadas en el tamaño de parámetros, no publicadas por el autor).
- GPUs recomendadas: A100 40/80 GB o H100 para producción; RTX 4090 (24 GB) para bfloat16 en contexto corto; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, con cuantización (RTX 3060 12 GB en 4 bits, RTX 4090 en bf16).
- Opciones de despliegue: transformers (soporte nativo, sin código personalizado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversión a GGUF para llama.cpp/Ollama mediante herramientas estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-v3.0-Instruct-Malevolent | 7,48 B | no disponible | Persona malevolente en polaco, investigación | Apache-2.0 | Hugging Face (Osye) |
| speakleash/Bielik-Minitron-7B-v3.0-Instruct | 7,48 B (mismo base) | no disponible | Asistente instructivo en polaco | Apache-2.0 | Hugging Face (Speakleash) |
| Osye/Mistral-7B-Instruct-v0.3-Malevolent | ~7,2 B | no disponible | Persona malevolente (variante del autor) | no disponible | Hugging Face (Osye) |
| Osye/Qwen3.5-4B-Malevolent | ~4 B | no disponible | Persona malevolente (variante del autor) | no disponible | Hugging Face (Osye) |

Las dos variantes del mismo autor se citan en la model card como trabajos relacionados; no se dispone de sus especificaciones detalladas ni de resultados comparativos en la información proporcionada.

## Limitaciones y advertencias

- Evaluado únicamente en polaco; el comportamiento en otros idiomas no se midió.
- Aproximadamente 1 de cada 7 respuestas pierde coherencia (11 de 72 puntuadas por debajo de 50) y algunas caen en repetición de palabras.
- La persona es a veces soez o grotesca; el propio autor indica que no es apta para uso general.
- La ayuda práctica se sustituye en gran medida por desprecio, lo que la hace inadecuada para atención al cliente o asistentes productivos.
- Las puntuaciones provienen de un único juez LLM automático, sin valoraciones humanas, por lo que su fiabilidad es limitada.
- Riesgo de alucinación no cuantificado; la perplejidad en inglés sube de 16,9 a 25,2 y el quiz de conocimiento general baja de 73,3 % a 60,0 %, lo que sugiere cierta degradación respecto al base.
- No se entrenó para cumplir peticiones dañinas y, según el autor, no elimina los comportamientos de seguridad del modelo base; aun así, el tono hostil puede disparar falsos positivos en filtros de moderación.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; sin embargo, el propósito declarado es exclusivamente la investigación sobre personas, y el contenido generado puede ser ofensivo.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, con creación y actualización el 2026-11-04; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Osye/Bielik-Minitron-7B-v3.0-Instruct-Malevolent
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Variante relacionada (Mistral): https://huggingface.co/Osye/Mistral-7B-Instruct-v0.3-Malevolent
- Variante relacionada (Qwen): https://huggingface.co/Osye/Qwen3.5-4B-Malevolent

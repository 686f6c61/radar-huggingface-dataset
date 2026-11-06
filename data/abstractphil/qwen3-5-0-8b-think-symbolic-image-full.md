# AbstractPhil/qwen3.5-0.8b-think-symbolic-image-full

## Resumen

Lucia 0.8B es un ajuste fino completo (full fine-tune) del modelo multimodal Qwen/Qwen3.5-0.8B, desarrollado por AbstractPhil. El modelo está especializado en la generación de descripciones estructuradas de imágenes siguiendo un formato de "cadena de pensamiento simbólica" (thought-symbolic chain): una secuencia de pasos de razonamiento visual en lenguaje natural, cada uno etiquetado con un nombre, seguidos de una serie de salidas como caption, prompt, etiquetas, crítica y preguntas con sus respuestas clasificadas.

El modelo resuelve un problema concreto: producir lecturas visuales trazables y verificables de obras de arte, fotografías y objetos, donde cada afirmación se marca como hecho registrado (`[record]`), deducción de la cadena (`[chain]`) o desconocido (`[unknown]`). Esto lo hace adecuado para tareas de catalogación, documentación museística y generación de metadatos estructurados donde la procedencia de cada dato importa.

Con 852.985.920 parámetros y un tamaño de repositorio de 1,7 GB, es el miembro más pequeño de la familia Lucia, pensado para tarjetas gráficas modestas y ejecuciones por lotes. Su licencia es Apache 2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.5-0.8B |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16 en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de tipo image-text-to-text, y se ha sometido a un ajuste fino completo (no LoRA) sobre dos datasets propios del autor: `AbstractPhil/thought-symbolic-image-captions` y `AbstractPhil/qwen-symbolic-thinking-image-training`. El entrenamiento enseña al modelo a producir filas estructuradas con pasos de pensamiento etiquetados (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say) y salidas derivadas (caption, prompt, tags, critique) junto con preguntas clasificadas por procedencia.

La innovación principal es el formato de cadena simbólica verificable: cada paso tiene un nombre y cada pregunta final se etiqueta como `[record]`, `[chain]` o `[unknown]`, lo que permite auditar la procedencia de cada afirmación. El modelo se ejecuta con decodificación greedy, sin system prompt y con el modo thinking desactivado (`enable_thinking=False`), ya que el formato de la fila está aprendido y un turno de sistema no visto durante el entrenamiento provoca sobreescritura. Requiere transformers 5.

## Capacidades

- Generación de descripciones visuales estructuradas en formato de cadena simbólica con pasos etiquetados.
- Producción de captions, prompts de generación, etiquetas y críticas a partir de una imagen.
- Generación de preguntas de seguimiento con clasificación de procedencia (`[record]`, `[chain]`, `[unknown]`).
- Razonamiento visual de profundidad variable: "a quick look" (1-2 pensamientos), "a closer look" (3-5), "a long look" (6-10).
- Identificación del tipo de imagen (pintura, grabado, dibujo, fotografía) en el primer término de la línea de prompt.
- Capacidad conversacional multimodal (image-text-to-text) en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; la cadena de pensamiento simbólica constituye un razonamiento multi-paso estructurado.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: modo thinking desactivable, cadena de pensamiento simbólica con procedencia auditable.

## Casos de uso

- Catalogación museística automatizada: el modelo genera filas estructuradas con pasos de observación (forma, luz, color, medio) y preguntas clasificadas, lo que permite a un documentalista revisar la procedencia de cada afirmación antes de incorporarla al catálogo. Es adecuado porque cada dato va etiquetado como hecho, deducción o desconocido.
- Generación de metadatos para bancos de imágenes: produce caption, prompt y tags en una sola pasada, listos para indexación y búsqueda, con un formato consistente que facilita el parseo automático mediante `qwen_symbolic_thinking.chain.parse`.
- Documentación de colecciones de arte en lote: al ser el miembro más ligero de la familia (0,8B parámetros, 1,7 GB), permite ejecuciones masivas sobre miles de imágenes en tarjetas gráficas de gama media sin coste elevado.
- Creación de prompts para generación de imágenes: la línea `prompt` del formato de salida proporciona directamente un prompt descriptivo con términos de medio, vista y composición, reutilizable en pipelines de difusión.
- Evaluación y crítica visual asistida: la línea `critique` y los pasos `mood`, `mean` e `intend` permiten generar análisis interpretativos acotados, útiles en herramientas educativas o de accesibilidad.
- Investigación en razonamiento visual trazable: el formato de cadena con pasos nombrados y preguntas con procedencia sirve como banco de pruebas para estudiar la verificabilidad de las salidas de modelos vision-language pequeños.
- Preprocesado para sistemas de recuperación multimodal: los tags y captions estructurados alimentan índices de búsqueda por texto sobre colecciones de imágenes.

## Benchmarks y rendimiento

La model card menciona una evaluación sobre 60 imágenes y 40 especificaciones no vistas en entrenamiento, comparando con el adaptador LoRA del mismo recetario y con Lucia v1 (9B), además de una evaluación de término medio sobre 500 imágenes de la National Gallery of Art y 200 imágenes de AIC, NGA, Cleveland y el Met. Sin embargo, la tabla de resultados aparece truncada en la información disponible y no se proporcionan cifras numéricas completas.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bfloat16 para los pesos (tamaño del repositorio), más overhead del procesador de visión y de activaciones; cabe holgadamente en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas de gama media y alta.
- Opciones de despliegue: transformers 5 con `AutoModelForMultimodalLM` y `AutoProcessor`; no se documentan opciones de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lucia 0.8B (este modelo) | 852.985.920 | no disponible | apache-2.0 | safetensors | Full fine-tune especializado en cadenas simbólicas |
| Lucia 0.8B LoRA (AbstractPhil/qwen3.5-0.8b-think-symbolic-image) | no disponible | no disponible | apache-2.0 | safetensors (adapter) | Mismo recetario, adaptador LoRA, más ligero de almacenar |
| Lucia v1 9B | no disponible | no disponible | no disponible | no disponible | Miembro mayor de la familia, referenciado como comparación en la model card |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | no disponible | no disponible | Modelo base sin ajuste específico de cadena simbólica |

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado para otros idiomas.
- Requiere transformers 5; versiones anteriores no son compatibles.
- Debe ejecutarse con el modo thinking desactivado y sin system prompt; un turno de sistema no visto durante el entrenamiento provoca sobreescritura del formato.
- La decodificación recomendada es greedy (`do_sample=False`); el muestreo puede romper la estructura de la fila.
- Riesgo de alucinación en las líneas `[record]`: el modelo puede afirmar como hecho algo que no está en la imagen; la clasificación de procedencia ayuda a auditarlo pero no lo elimina.
- El tamaño de 0,8B limita la retención del término medio y de las filas de especificación larga, según reconoce el autor; el respaldo de los pensamientos es inferior al del modelo de 9B.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre datasets propios de arte y fotografía, puede estar sesgado hacia ese dominio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación externa.

## Enlaces

- Hugging Face (full fine-tune): https://huggingface.co/AbstractPhil/qwen3.5-0.8b-think-symbolic-image-full
- Hugging Face (adaptador LoRA): https://huggingface.co/AbstractPhil/qwen3.5-0.8b-think-symbolic-image
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de entrenamiento: https://huggingface.co/datasets/AbstractPhil/qwen-symbolic-thinking-image-training
- Repositorio de código (parser, scorer, trainer): https://github.com/AbstractEyes/qwen-symbolic-thinking

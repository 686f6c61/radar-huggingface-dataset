# AletheiaAING/gemma-3-0.8b-csw

## Resumen

`gemma-3-0.8b-csw` es una cuantización Q8_0 en formato GGUF de un modelo derivado de `google/gemma-3-1b-it`, publicada por AletheiaAING. No es un modelo de propósito general: está especializado en dos tareas concretas sobre 37 lenguas africanas, la alternancia de código (code-switching, mezclar una segunda lengua en el discurso base tal como hacen los hablantes nativos) y la reescritura idiomática (convertir texto plano o literal en un registro coloquial rico en modismos).

El modelo conserva 822.510.208 parámetros (aproximadamente 0,82B), pero aplica una poda del vocabulario: retiene 108.172 de los 262.144 tokens originales del tokenizador de Gemma 3, lo que reduce el tamaño del archivo a 877 MB y permite ejecución en CPU con llama.cpp. La cabeza de salida está atada (tied) a la matriz de embeddings.

Su relevancia es de nicho pero clara: cubre un hueco de herramientas ligeras y desplegables en local para procesamiento de lenguas africanas con control explícito de la tarea mediante etiquetas en el prompt, algo poco común en modelos de este tamaño. La licencia es la Gemma de Google, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 3 1B instruct) |
| Parametros totales | 822.510.208 (0,82B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el repo contiene un único archivo cuantizado |
| Idiomas soportados | 37 lenguas africanas base (yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti, entre otras) más pares de alternancia con eng, fra, ara, swh, pcm, etc. |
| Licencia | Gemma (Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 en su variante instruct de 1B. Sobre esa base se ha realizado un ajuste específico para las tareas de code-switching e idiomaticidad en lenguas africanas, seguido de una poda del vocabulario del tokenizador que reduce el espacio de tokens de 262.144 a 108.172. La model card referencia el identificador anterior `gemma-3-1b-csw-rl3-pruned-gguf`, lo que sugiere una etapa de ajuste por refuerzo (el sufijo `rl3`) antes de la poda y la cuantización.

El entrenamiento cubre pares de alternancia de código restringidos por lengua base: la model card indica explícitamente que se eliminaron combinaciones poco realistas y que solo deben usarse los pares listados en su tabla de lenguas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros de RLHF/DPO. La innovación técnica destacable es el control de tarea mediante etiquetas de un solo token (`<hm>`, `<ood>`) y códigos de lengua entre ángulos (`<yor>`, `<eng>`) que forman parte del vocabulario podado, junto con un formato de salida estructurado que incluye un bloque `<dev>` con los dispositivos lingüísticos empleados.

## Capacidades

- Reescritura con alternancia de código (`<hm>`): inserta frases de una segunda lengua en un texto base, respetando los pares de lenguas entrenados.
- Reescritura idiomática (`<ood>`): transforma texto plano o literal en un registro coloquial con modismos y expresiones.
- Conversión combinada (`hm_ood`): reescribe un texto ya code-switched manteniendo la alternancia y añadiendo idiomaticidad.
- Conversión desde inglés (`eng_hm`, `eng_ood`): traduce y reescribe desde inglés hacia la lengua base con las transformaciones anteriores.
- Salida estructurada: etiquetas de lengua y bloque `<dev>` con la lista exacta de dispositivos usados, parseable programáticamente.
- Cobertura de 37 lenguas africanas base con pares de alternancia predefinidos.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa; no es multimodal ni tiene modo thinking.

## Casos de uso

- Localización de contenido para redes sociales: dado un texto en inglés o en lengua base, generar versiones con alternancia de código que reflejen cómo hablan realmente los usuarios bilingües, útil para campañas en Nigeria, Kenia o Sudáfrica.
- Enriquecimiento de corpus lingüísticos: producir variantes idiomáticas y code-switched de frases para ampliar datasets de entrenamiento o evaluación de PLN en lenguas africanas de bajos recursos.
- Traducción asistida con registro coloquial: convertir material literal (manuales, avisos) en texto con modismos locales para comunicación comunitaria, manteniendo el significado.
- Chatbots de atención al cliente de nicho: al ser un GGUF de 877 MB ejecutable en CPU con llama.cpp, puede desplegarse en servidores modestos o en el borde para respuestas en lengua local con mezcla de inglés o francés.
- Herramientas educativas de preservación lingüística: generar ejemplos de expresiones idiomáticas y alternancia para materiales de enseñanza de lenguas africanas.
- Normalización y aumentación en pipelines de ASR/TTS: producir variantes de texto con code-switching para entrenar o evaluar sistemas de voz que deban manejar habla bilingüe real.
- Análisis de estilo en estudios sociolingüísticos: usar el bloque `<dev>` para extraer y catalogar los dispositivos (modismos, préstamos) presentes en un texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 pesa 877 MB; en GPU requiere aproximadamente 1 GB de VRAM más overhead de contexto (estimación orientativa, no publicada por el autor).
- Ejecutable en CPU con llama.cpp, que es el caso de uso declarado por el autor.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso iGPU con memoria unificada suficiente.
- GPU de datacenter (A100, H100) no necesarias; sobredimensionadas para este modelo.
- Opciones de despliegue: llama.cpp (soporte nativo, librería declarada), Ollama y servidores compatibles con la API de llama.cpp; el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-0.8b-csw | 0,82B | no disponible | Code-switching e idiomas en 37 lenguas africanas | Gemma | GGUF Q8_0 |
| google/gemma-3-1b-it | 1B | no disponible | Propósito general instruct | Gemma | safetensors |
| Modelos multilingües africanos de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas especializadas en lenguas africanas de este tamaño no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la poda de vocabulario (108.172 frente a 262.144 tokens), la cuantización a GGUF y el ajuste específico de tareas.

## Limitaciones y advertencias

- Solo debe usarse con los pares de lenguas base/alternancia listados en la tabla del autor; otras combinaciones no fueron entrenadas y producen resultados antinaturales.
- El formato de prompt es estricto: una única mensaje de usuario sin system prompt, etiquetas entre ángulos, dos espacios tras los dos puntos y códigos de tres letras. Desviarse degrada la salida.
- La salida debe validarse: si falta el bloque `<dev>`, el autor indica tratar la respuesta como inválida y remuestrear.
- El propio autor documenta fallos visibles: dispositivos inventados o torpes (el ejemplo de modismo en Pidgin) y salidas en Pidgin con exceso de inglés.
- Riesgo de alucinación en la generación de modismos y expresiones, especialmente en lenguas con menos datos.
- La poda de vocabulario puede afectar a la cobertura de textos fuera del dominio entrenado.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución según los términos de Google; revisar antes de producción.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es adecuado como modelo generalista.
- Contexto máximo no documentado; no asumir ventanas largas.
- Modelo con muy poca adopción (15 descargas, 0 likes en el momento de la consulta): sin validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/AletheiaAING/gemma-3-0.8b-csw
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms

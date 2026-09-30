# grapeot/ai_smell_remover

## Resumen

ai_smell_remover v1.1 es un ajuste fino por LoRA sobre el modelo base Qwen3.5-9B-Base, publicado por grapeot (Yan Wang, conocido como 鸭哥 y autor del blog yage.ai). Su función es reescribir texto chino redactado por IA, párrafo a párrafo, para que adopte el estilo del autor y pierda lo que la comunidad denomina "olor a IA". No modifica la estructura de los párrafos, el orden de la argumentación ni los hechos del original: solo cambia la formulación y las frases.

El modelo tiene 9.197.093.888 parámetros (~9,2 B) y se distribuye como un único archivo GGUF cuantizado en Q8_0 de 9,1 GB, con licencia Apache-2.0. Está pensado para servirse con llama.cpp (llama-server) y consumirse mediante la herramienta de línea de comandos voice-lora, que aplica la reescritura sección a sección y valida numéricamente el resultado.

Es relevante porque ataca un problema editorial concreto con un enfoque medible: en lugar de heurísticas de palabras prohibidas, entrena un clasificador P(autor) y reporta cuánto se acerca su salida a los textos reales del autor. No es un modelo de propósito general: solo trabaja en chino, solo tiene sentido sobre texto previamente generado por IA y exige revisión humana posterior por riesgo de deriva factual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ajuste LoRA sobre Qwen3.5-9B-Base; el modelo base es la arquitectura subyacente (no detallada en la model card) |
| Parámetros totales | 9.197.093.888 (~9,2 B) |
| Parámetros activos | No aplica; la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No especificada en la model card; el ejemplo de despliegue del autor arranca llama-server con `-c 16384` (16.384 tokens) |
| Tipos de cuantización | Q8_0 (GGUF, 9,1 GB) publicado; el LoRA se entrenó en bf16 y se fusionó antes de cuantizar |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 (heredada de Qwen3.5-9B-Base) |
| Formato de pesos | GGUF (Q8_0); incluye además `voice-lora-card.yaml` como tarjeta de invocación |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B-Base, sobre el que se entrena un LoRA en bf16 con rank 32 y alpha 32, tasa de aprendizaje 1e-4 con decaimiento coseno y batch efectivo de 16. Se selecciona el checkpoint con menor loss de validación, alcanzado aproximadamente en la época 0,19 (el entrenamiento es muy corto porque el corpus es pequeño). El adaptador se fusiona con la base y el resultado se cuantiza a Q8_0 en GGUF. La model card no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, etc.).

El conjunto de datos se construyó mediante "síntesis inversa" a partir de 185 entradas del blog del autor: 2.160 párrafos, divididos en entrenamiento, validación y test por artículo y no por párrafo, para evitar fugas entre particiones. Primero se pidió a modelos externos que reescribieran cada párrafo original en prosa con "olor a IA"; después se invirtieron los pares (texto de IA → párrafo original) para entrenar al modelo en la dirección deseada. Las reescrituras sintéticas provienen de tres familias: un modelo abierto de 27B con 5 prompts distintos, Gemini 3.8 Flash con 3 prompts y DeepSeek V4.1 Flash con 3 prompts, con un total de 18.163 pares de entrenamiento. Ni los originales ni los datos sintéticos se han publicado. No se documenta uso de RLHF ni de DPO.

## Capacidades

- Transferencia de estilo en chino: reescribe párrafos completos para aproximarlos a la voz de un autor concreto, cambiando vocabulario y sintaxis pero no el contenido ni el orden de las ideas.
- Reescritura a nivel de párrafo con contexto del párrafo anterior: el prompt de invocación incluye el párrafo previo como referencia que no debe modificarse.
- Preservación estructural dentro de la herramienta `voice-lora`: títulos, citas, tablas, bloques de código e imágenes se mantienen intactos; solo se procesan párrafos de cuerpo de texto.
- Recuperación de enlaces por texto de ancla durante el proceso de reescritura.
- Control de calidad automático en la herramienta: si los números de un párrafo reescrito no coinciden con el original, o si la proporción de longitud sale del rango 0,6–1,6, se reintenta una vez y, si vuelve a fallar, se conserva el texto original.
- Modo de generación sin razonamiento: la plantilla de chat debe invocarse con `enable_thinking: false`, con un único mensaje de usuario en formato de un solo turno.
- No se documentan capacidades de tool calling, function calling, uso como agente, visión, audio ni matemáticas; el modelo está especializado exclusivamente en reescritura de estilo.
- Multilingüismo: limitado al chino. No hay evidencia de que funcione en otros idiomas.

## Casos de uso

- Limpieza editorial de borradores generados por IA: se redacta un artículo con un LLM en chino y se pasa el Markdown por `voice-lora rewrite` para eliminar las marcas de estilo típicas de la IA antes de publicar, manteniendo el esqueleto argumental intacto.
- Integración en el pipeline de publicación de un blog o newsletter en chino: el comando se puede encadenar tras la generación de contenido y antes de la revisión humana, generando además una página de comparación sección a sección con `voice-lora compare` para el editor.
- Normalización de estilo en documentación técnica generada por IA: como la herramienta respeta bloques de código, tablas y encabezados, se puede aplicar a manuales o README sin riesgo de que se altere el código ni las estructuras de datos.
- Procesamiento por lotes de un corpus: en una M3 Ultra se reescriben 4 vías concurrentes y un artículo de 40 párrafos tarda unos 45 segundos, lo que permite tratar lotes de artículos en una máquina local sin enviar borradores a servicios externos.
- Edición asistida con revisión humana obligatoria: el flujo natural es reescribir, comparar contra el original y revertir manualmente las frases que hayan derivado en significado; encaja en un proceso editorial donde cada párrafo pasa por un revisor.
- Investigación sobre detección y eliminación de estilo LLM: el repositorio incluye el clasificador P(autor) y la metodología de síntesis inversa, de modo que el modelo sirve como caso de estudio reproducible para medir transferencia de estilo.
- Ajuste de estilo sobre un autor concreto (con datos propios): la receta (LoRA rank 32 sobre base de 9B, 185 artículos, 18.163 pares sintéticos) es reutilizable para otros autores, ya que el código de entrenamiento es público.

## Benchmarks y rendimiento

Evaluación con un clasificador "¿parece escrito por 鸭哥?" que devuelve P(autor), entrenado con los datos de v1.1. Valores más altos indican mayor parecido con el autor real.

| Entrada de test | Texto de IA | v1 | v1.1 (este modelo) | Originales del autor |
|---|---|---|---|---|
| Párrafos reservados reescritos por el modelo abierto de 27B (291) | 0,09 | 0,77 | 0,76 | 0,75 |
| Párrafos reservados reescritos por Gemini (285) | 0,02 | 0,76 | 0,74 | 0,75 |
| Párrafos reservados reescritos por DeepSeek (289) | 0,25 | 0,74 | 0,76 | 0,75 |
| 4 artículos completos redactados por IA (147 párrafos) | 0,04 | 0,12 | 0,15 | — |

Similitud media con el texto original según la configuración de despliegue (14 párrafos, 6 muestras por párrafo); una similitud menor indica que el modelo se atreve más a reformular:

| Configuración | Similitud con el original |
|---|---|
| vLLM (la penalización cubre por defecto todo el prompt) | 0,786 |
| llama-server con `repeat_last_n: 4096` | 0,784 |
| llama-server con la ventana por defecto de 64 tokens | 0,849 |
| Sin penalización por repetición | 0,901 |

Comparación del GGUF Q8_0 frente al bf16 original en vLLM: con la aleatoriedad desactivada, 25 de 40 párrafos son idénticos carácter a carácter; con muestreo normal, la similitud con el original es equivalente (0,784 frente a 0,786).

Evaluación cualitativa de v1 (no repetida en v1.1): en una prueba a ciegas con 20 párrafos, el autor identificó 16 como propios, mientras que reconoció 17 de sus párrafos reales.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- Peso del modelo: 9,1 GB en Q8_0. Estimación de VRAM para inferencia: en torno a 10–11 GB contando pesos y overhead, más la caché KV, que crece con la ventana de contexto configurada (16.384 tokens en el ejemplo del autor).
- GPU de consumo: cabe con holgura en una RTX 4090 (24 GB) y, según la ventana de contexto, en tarjetas de 16 GB. En 12 GB la caché KV para contextos largos puede ser el factor limitante.
- GPU de centro de datos: el modelo es pequeño para A100 o H100; en estos aceleradores la limitación será el throughput, no la memoria.
- El autor solo ha probado el modelo en un Mac M3 Ultra con el backend Metal de llama.cpp. No hay datos publicados de rendimiento en CUDA.
- Despliegue recomendado: `llama-server` de llama.cpp, con `-c 16384 -np 4 -ngl 99 --jinja`.
- Despliegue alternativo: vLLM, que aplica la penalización por repetición sobre todo el prompt por defecto y obtiene resultados equivalentes a llama.cpp con `repeat_last_n: 4096`. El autor también menciona compatibilidad con Linux y Windows a través de llama.cpp (backends CPU y CUDA).
- No usar LM Studio: no reconoce `repetition_penalty` ni propaga `repeat_last_n` al motor, lo que hace que las reescrituras sean demasiado conservadoras.
- Latencia observada: 4 vías concurrentes reescriben un artículo de 40 párrafos en aproximadamente 45 segundos en una M3 Ultra.
- Parámetros de muestreo obligatorios: temperature 0,7; top_p 0,95; penalización por repetición 1,05 con ventana que cubra todo el prompt (`repeat_last_n: 4096`). Con temperature 0 el modelo tiende a copiar la entrada.

## Comparativa con modelos similares

No se han identificado en la información disponible otros modelos públicos de transferencia de estilo al chino directamente comparables. La comparación posible es contra su propia versión anterior y contra el texto de IA sin tratar:

| Modelo / entrada | Parámetros | Contexto | P(autor) en párrafos reservados | P(autor) en artículos completos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ai_smell_remover v1.1 (Q8_0 GGUF) | 9,2 B | No especificado (ejemplo con 16.384) | 0,74–0,76 | 0,15 | Apache-2.0 | HuggingFace, GGUF |
| ai_smell_remover v1 | 9,2 B | No especificado | 0,74–0,77 | 0,12 | Apache-2.0 | No publicado como GGUF en esta información |
| Texto de IA sin tratar | — | — | 0,02–0,25 | 0,04 | — | — |
| Texto original del autor (referencia) | — | — | 0,75 | — | — | — |
| Qwen3.5-9B-Base (modelo base) | 9,2 B | No disponible | No evaluado en la model card | No evaluado | Apache-2.0 | HuggingFace |

El dato relevante de la tabla es que en párrafos sueltos el clasificador ya no distingue la salida del modelo del texto real del autor, mientras que en artículos completos la mejora es real pero limitada (0,15 frente a 0,04), porque el modelo solo cambia la formulación y no la estructura ni los patrones argumentales del texto de IA.

## Limitaciones y advertencias

- Deriva factual: la salida no puede publicarse sin revisión. El propio autor documenta casos reales de "被 X 收购的 Y" reformulado con un sujeto distinto, de "un múltiplo mayor" convertido en "exponencial", de medias frases o condiciones eliminadas, de texto expositivo pasado a primera persona, de comillas invertidas de código eliminadas y, al subir la temperatura, de citas en inglés inventadas que no estaban en el original.
- La validación automática de la herramienta solo detecta discrepancias numéricas y desviaciones de longitud (ratio fuera de 0,6–1,6). Cualquier otra forma de deriva pasa el filtro.
- Flujo de trabajo obligatorio: comparar párrafo a párrafo la salida con la entrada y revertir las frases que hayan derivado; si una sección acumula demasiadas, devolver el párrafo original completo.
- Inconsistencia tipográfica: como la reescritura es por párrafos, los párrafos tratados adoptan las manías tipográficas del autor (comillas rectas, paréntesis de medio ancho, sin espacio entre chino e inglés) mientras que los no tratados conservan el estilo original.
- No corrige ni verifica hechos: los errores del borrador de entrada se mantienen tal cual.
- Solo apto para texto redactado por IA; aplicado a texto escrito por una persona solo añade ruido.
- Es la voz de una persona concreta. Usarlo para suplantar al autor en publicaciones es un uso que la propia model card desaconseja explícitamente.
- Idioma: solo chino. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Sesgo de evaluación: el clasificador P(autor) usado para puntuar está entrenado con los datos de v1.1, por lo que las cifras de esa tabla deben leerse como una medida interna, no como una evaluación independiente. El propio autor señala que el clasificador no distingue los párrafos reservados del texto real.
- v1.1 no tiene validación a ciegas con el autor; la única prueba de ese tipo corresponde a la versión v1.
- Los datos de entrenamiento (originales y sintéticos) no son públicos, lo que impide reproducir el ajuste tal cual.
- Compatibilidad de motor: LM Studio no es válido para este modelo porque descarta los parámetros de penalización por repetición. Ollama y TGI no se mencionan en la documentación.
- Licencia Apache-2.0 heredada del modelo base, sin restricciones adicionales declaradas por el autor del ajuste; conviene verificar igualmente los términos del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grapeot/ai_smell_remover
- Repositorio de código y método de entrenamiento: https://github.com/grapeot/voice-lora
- Documentación del clasificador P(autor): https://github.com/grapeot/voice-lora/blob/master/docs/classifier.md
- Blog del autor: https://yage.ai
- Perfil del autor en GitHub: https://github.com/grapeot/

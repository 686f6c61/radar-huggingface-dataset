# haruuuuu-1256/sweet-zenz-v1-xsmall

## Resumen

sweet-zenz-v1-xsmall es un modelo de conversión de kana a kanji (かな漢字変換) para japonés, desarrollado por el usuario haruuuuu-1256. Se trata de un GPT-2 de aproximadamente 22,5 millones de parámetros, obtenido por destilación del modelo sweet-zenz-v1-small sobre la base zenz-v3.1-xsmall de Keita Miwa. Su propósito es alimentar el motor de conversión de entrada Zenzai, integrado en AzooKeyKanaKanjiConverter.

El modelo resuelve el problema clásico de la conversión de entrada japonesa: dado un texto en katakana (la lectura fonética) y un contexto izquierdo de hasta 40 caracteres, generar la cadena de kanji y kana correcta. Frente a su base del mismo tamaño, refuerza la desambiguación de homófonos, la terminología de VRChat y de modelos LLM locales, el lenguaje de internet y los nombres propios.

Es relevante por su tamaño extremadamente reducido (22,5 M de parámetros, pesos GGUF de 18 a 26 MB) y su enfoque en un dominio muy concreto, lo que permite ejecución en CPU y en dispositivos con recursos muy limitados. La licencia es CC BY-SA 4.0 y el modelo solo soporta japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), pre-tokenizer gpt2-small-japanese-char |
| Parametros totales | 22.511.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el prompt usa un contexto izquierdo de hasta 40 caracteres |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0 (26 MB, recomendado), GGUF Q5_K_M (18 MB) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2 con 22,5 M de parámetros, ajustado para la tarea de conversión kana-kanji con el formato de prompt de zenz-v3: `[<contexto izquierdo, máx. 40 caracteres>]<entrada en katakana><resultado></s>`. Hereda de zenz-v3.1-xsmall la configuración y el pre-tokenizer `gpt2-small-japanese-char`, y sus metadatos GGUF (BOS/EOS/PAD) coinciden con los del GGUF oficial de zenz-v3.1-xsmall.

El entrenamiento se realizó en dos fases. Primero, destilación del profesor sweet-zenz-v1-small durante 3.000 pasos, minimizando la entropía cruzada por token y la divergencia KL respecto a la distribución del profesor, con prompts de datos públicos y de la porción de Wikipedia del dataset zenz-v2.5. Después, un ajuste con GRPO de 600 pasos con la misma configuración que el profesor: recompensa por coincidencia tolerante a variantes de escritura, penalización por desbordamiento y regularización KL con β=0,1. Se desactivó el dropout (0,1 en la configuración de zenz-v3.x) porque su activación disparaba la pérdida.

Los datos de entrenamiento son exclusivamente públicos y con licencia explícita: Wikipedia japonesa (volcado de 2026-11-01), Wiktionary japonés, el dataset de errores de entrada de Wikipedia v2 de Kyoto, RealPersonaChat, SudachiDict, hololive-dictionary (sin términos sensibles), MDN, documentación de Python, Kubernetes, Transformers y LLM Course, Microsoft Generative AI for Beginners, model cards japonesas de Hugging Face y un diccionario propio de VRChat, LLM locales y lenguaje de internet. No se usaron textos rastreados de terceros ni conversaciones privadas.

## Capacidades

- Conversión de kana a kanji: transforma una lectura en katakana en la cadena de kanji y kana correcta, con soporte de contexto izquierdo de hasta 40 caracteres.
- Desambiguación de homófonos: principal mejora frente a la base, con un salto notable en las pruebas de homónimos (de 48,8 a 58,8 en JWTD).
- Terminología especializada: refuerzo de vocabulario de VRChat, modelos LLM locales, lenguaje de internet, nombres propios y términos técnicos.
- Uso previsto en Zenzai: integración con AzooKeyKanaKanjiConverter mediante llama.cpp con el pre-tokenizer específico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Monolingüe: únicamente japonés.

## Casos de uso

- Motor de entrada japonés en escritorio y móvil: integrado en Zenzai a través de AzooKeyKanaKanjiConverter, convierte las lecturas del usuario en kanji con contexto de la frase, con un coste de memoria mínimo (18-26 MB en GGUF).
- Desambiguación de homófonos en textos largos: adecuado para frases donde la lectura es ambigua, gracias al contexto izquierdo de 40 caracteres y a la mejora medida en JWTD (58,8 frente a 48,8 de la base).
- Transcripción de nombres propios y marcas: el refuerzo en nombres propios (57,2 frente a 49,8) lo hace útil en entradas de directorios, agendas o formularios donde los topónimos y antropónimos fallan en los conversores genéricos.
- Terminología de comunidades y streaming: útil en herramientas de chat para VRChat o comunidades de LLM locales, donde la mejora es muy marcada (91,4 frente a 77,1 en VRChat; 89,1 frente a 69,6 en LLM locales).
- Procesamiento de documentación técnica en japonés: con resultados de 88,8 en MDN y Python docs, sirve para normalizar lecturas en pipelines de documentación o en herramientas de búsqueda interna.
- Corrección de entradas ruidosas: entrenado con el dataset de errores de entrada de Wikipedia v2, puede emplearse para normalizar texto tecleado con errores de conversión en sistemas de dictado o teclados predictivos.
- Despliegue en dispositivos con recursos limitados: al ser un GPT-2 de 22,5 M de parámetros con GGUF de 18-26 MB, cabe en CPU y en hardware embebido donde un LLM no es viable.

## Benchmarks y rendimiento

Evaluación con decodificación greedy y coincidencia tolerante a variantes de escritura (kana/kanji, letras latinas/katakana, cifras, espacios). Comparación con la base zenz-v3.1-xsmall en el mismo formato de cuantización.

| Evaluación | zenz-v3.1-xsmall Q5_K_M | sweet-zenz-v1-xsmall Q8_0 | sweet-zenz-v1-xsmall Q5_K_M |
|---|---|---|---|
| AJIMEE-Bench (200 preguntas, acc@1 exacto) | 68,5 | 68,0 | 67,0 |
| zenz-v2.5-dataset, parte Wikipedia (2.000) | 76,2 | 79,2 | 78,2 |
| JWTD homónimos (1.000) | 48,8 | 58,8 | 59,0 |
| JWTD homónimos, texto largo (300) | 36,0 | 46,0 | 44,7 |
| Terminología VRChat (105 frases) | 77,1 | 91,4 | 91,4 |
| Lenguaje de internet (40 frases) | 90,0 | 95,0 | 95,0 |
| Terminología LLM local (46 frases) | 69,6 | 89,1 | 87,0 |
| Wiktionary | 73,6 | 79,6 | 79,6 |
| Wikipedia subcultura | 76,2 | 81,6 | 81,4 |
| Wikipedia artículos nuevos (desde 2024) | 67,4 | 72,4 | 70,8 |
| Documentación técnica (MDN / Python docs) | 82,2 | 88,8 | 88,4 |
| Nombres propios | 49,8 | 57,2 | 55,4 |

El autor advierte que AJIMEE-Bench queda en un nivel similar al modelo original, que persiste cierta tendencia a la repetición en entradas largas y que los conjuntos de evaluación propios, aunque redactados aparte de los de entrenamiento, comparten vocabulario; en las categorías con pocas frases, una sola frase mueve unos dos puntos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantización; el GGUF Q8_0 ocupa 26 MB y el Q5_K_M 18 MB, y los pesos bf16 en safetensors rondan los 45 MB.
- GPU recomendadas: no requiere GPU; cualquier GPU con más de 1 GB de memoria es suficiente. Funciona en CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) e incluso en dispositivos embebidos.
- Opciones de despliegue: llama.cpp con el pre-tokenizer `gpt2-small-japanese-char` (el llama.cpp upstream no abre este GGUF, igual que ocurre con el GGUF oficial de zenz); Transformers para los pesos safetensors; integración nativa mediante Zenzai/AzooKeyKanaKanjiConverter.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sweet-zenz-v1-xsmall | 22,5 M | contexto izquierdo de 40 caracteres | CC BY-SA 4.0 | Hugging Face (safetensors y GGUF) | Destilado de sweet-zenz-v1-small; refuerzo en homónimos y jerga |
| zenz-v3.1-xsmall (base) | no disponible en la información | no disponible | no disponible en la información | Hugging Face | Referencia de comparación en todos los benchmarks |
| sweet-zenz-v1-small (profesor) | no disponible en la información | no disponible | no disponible en la información | Hugging Face | Modelo mayor usado como profesor en la destilación |

No se dispone de datos de otros conversores kana-kanji comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo japonés: no soporta otros idiomas ni tareas generativas generales.
- Tendencia a la repetición en entradas largas, según reconoce el autor.
- AJIMEE-Bench no mejora respecto a la base (68,0 frente a 68,5 en Q8_0), por lo que la mejora no es uniforme.
- Riesgo de sobreajuste al vocabulario de evaluación: los conjuntos propios comparten léxico con los de entrenamiento, y las categorías con pocas frases son sensibles a variaciones de un solo ejemplo.
- Compatibilidad restringida: el GGUF no se abre con el llama.cpp upstream; requiere el fork o la configuración usada por Zenzai.
- Licencia CC BY-SA 4.0: impone compartir bajo la misma licencia las obras derivadas y exige atribución; conviene revisar las implicaciones para uso comercial.
- El modelo está pensado exclusivamente para la tarea de conversión kana-kanji; no debe emplearse como modelo de chat o de razonamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-xsmall
- Modelo profesor: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v3.1-xsmall
- Zenzai / AzooKeyKanaKanjiConverter: https://github.com/azooKey/AzooKeyKanaKanjiConverter
- Dataset zenz-v2.5: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Dataset de errores de entrada de Wikipedia v2: https://nlp.ist.i.kyoto-u.ac.jp/?日本語Wikipedia入力誤りデータセット
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- hololive-dictionary: https://github.com/heppokofrontend/hololive-dictionary

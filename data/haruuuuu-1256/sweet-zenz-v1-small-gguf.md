# haruuuuu-1256/sweet-zenz-v1-small-gguf

## Resumen

sweet-zenz-v1-small es un modelo de conversión kana-kanji (かな漢字変換) para japonés, desarrollado por el usuario haruuuuu-1256 como un ajuste fino del modelo zenz-v3.1-small de Keita Miwa. Se trata de un modelo GPT-2 de aproximadamente 90 millones de parámetros, diseñado específicamente para integrarse en el motor de conversión de entrada Zenzai, parte del proyecto AzooKeyKanaKanjiConverter. Su propósito no es la generación de texto libre, sino la transformación de lecturas en katakana a texto japonés con la ortografía kanji correcta, incluyendo la desambiguación de homófonos.

El modelo parte de la base de zenz-v3.1-small y se entrena con un proceso en dos fases: un ajuste supervisado (SFT) sobre aproximadamente 420.000 pares de conversión y un refinamiento mediante GRPO (Group Relative Policy Optimization) con recompensas basadas en la coincidencia con la referencia. El objetivo es mejorar áreas concretas donde el modelo base flojea: homófonos, terminología de VRChat y modificación de avatares, vocabulario de LLM locales, jerga de internet y nombres propios con caracteres alfanuméricos.

La relevancia actual del modelo reside en su especialización vertical. Frente a los grandes modelos generativos, este modelo de 90M de parámetros ofrece una latencia muy baja y un consumo de recursos mínimo, lo que lo hace adecuado para la conversión de entrada en tiempo real en entornos de escritorio. La versión publicada en este repositorio es la cuantización GGUF, pensada para su uso con llama.cpp a través de Zenzai.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parámetros totales | 90.450.432 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la entrada de contexto izquierdo se limita a 40 caracteres según el formato de prompt) |
| Tipos de cuantización | Q8_0 (recomendada), Q5_K_M |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (también existe safetensors bf16 en el repositorio base `sweet-zenz-v1-small`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura GPT-2 estándar, es decir, un transformer decoder-only con atención causal completa. Con 90 millones de parámetros, se sitúa en la gama de modelos pequeños optimizados para tareas específicas. El formato de prompt sigue el esquema de zenz-v3: un contexto izquierdo de hasta 40 caracteres entre corchetes, seguido de la lectura en katakana y la conversión resultante, terminando con el token de fin de secuencia. El tokenizador utiliza el pre-tokenizador `gpt2-small-japanese-char`, idéntico al de los GGUF oficiales de zenz-v3.1.

El entrenamiento se realizó en dos etapas. La primera, SFT, utilizó aproximadamente 420.000 pares de conversión construidos a partir de fuentes con licencia explícita: Wikipedia japonesa (dump de 2026-11-01), Wiktionary, el dataset de errores de entrada de Wikipedia v2, RealPersonaChat, SudachiDict, hololive-dictionary, documentación técnica traducida (MDN, Python, Kubernetes, Transformers, LLM Course, Microsoft Generative AI for Beginners) y diccionarios creados por el autor para VRChat, LLM locales y jerga de internet. Se incluyeron 155.000 muestras de autodestilación del modelo base para preservar sus hábitos de escritura. El dropout se desactivó porque su activación disparaba la pérdida sobre las salidas propias. La segunda etapa, GRPO, muestreó 8 salidas por prompt durante 500 pasos, con recompensa por coincidencia con la referencia (tolerando variantes ortográficas y con bonus por coincidencia exacta), penalización por salidas degeneradas (sin EOS o UTF-8 inválido) y regularización KL hacia el modelo base con β=0,1. Las lecturas se asignaron con SudachiPy y SudachiDict (full, 2026-10-15), con fijación manual para algunos términos.

## Capacidades

- Conversión kana-kanji: transforma lecturas en katakana a texto japonés con la ortografía kanji adecuada.
- Desambiguación de homófonos: distingue pares como 務める/勤める, 伯父/叔父, 開放/解放.
- Terminología especializada: reconoce vocabulario de VRChat, modificación de avatares, LLM locales y términos AI.
- Jerga de internet: maneja coloquialismos como それな o 笑, y expresiones con caracteres alfanuméricos.
- Nombres propios y términos alfanuméricos: convierte correctamente cadenas como RTX 5090 o Q4_K_M.
- Uso de contexto izquierdo: aprovecha hasta 40 caracteres de contexto previo para mejorar la desambiguación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio; su alcance es exclusivamente la conversión de entrada.

## Casos de uso

- Motor de entrada IME en escritorio: integrado en Zenzai a través de llama.cpp, el modelo convierte en tiempo real las lecturas katakana que el usuario escribe, con latencia baja gracias a sus 90M de parámetros y a la cuantización Q8_0.
- Escritura de documentación técnica en japonés: el modelo mejora la conversión de términos de MDN, Python, Kubernetes y Transformers, lo que reduce correcciones manuales al redactar documentación técnica.
- Comunidades de VRChat y creación de avatares: la mejora en terminología específica (94,3 frente a 84,8 del modelo base en la evaluación del autor) facilita la escritura de descripciones, nombres de avatares y guías dentro de estas comunidades.
- Comunicación en foros y redes sociales: el manejo de jerga de internet y expresiones coloquiales permite una conversión más natural en publicaciones y chats informales.
- Redacción de contenido sobre LLM locales: el modelo reconoce términos como Q4_K_M o nombres de modelos, útil para guías y tutoriales de despliegue de modelos en local.
- Nombres propios y marcas: la mejora en términos alfanuméricos y nombres propios (56,7 frente a 50,0 en coincidencia exacta de cadenas alfanuméricas) ayuda en la conversión de nombres de productos y referencias técnicas.
- Entornos con recursos limitados: al ser un modelo de 90M en GGUF, puede ejecutarse en CPU sin GPU dedicada, lo que lo hace viable en portátiles y equipos modestos.

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor (decodificación greedy, coincidencia tolerando variantes ortográficas salvo en la fila de alfanuméricos, que exige coincidencia exacta):

| Evaluación | zenz-v3.1-small | sweet-zenz-v1-small | Q8_0 | Q5_K_M |
|---|---|---|---|---|
| AJIMEE-Bench (200 preguntas, acc@1 exacta) | 87,0 | 87,0 | 87,0 | 85,5 |
| zenz-v2.5-dataset parte Wikipedia (2.000) | 84,6 | 84,6 | 84,7 | 84,5 |
| JWTD homófonos (1.000) | 61,3 | 64,7 | 65,2 | 63,4 |
| JWTD homófonos texto largo (300) | 52,0 | 56,3 | 55,7 | 56,3 |
| Terminología VRChat (105 frases, autor) | 84,8 | 94,3 | 92,4 | 94,3 |
| Jerga de internet (40 frases, autor) | 92,5 | 95,0 | 95,0 | 95,0 |
| Alfanuméricos (30 frases, autor, exacta) | 50,0 | 56,7 | 56,7 | 53,3 |
| Wiktionary | 81,6 | 83,8 | 83,8 | 84,4 |
| Wikipedia subcultura | 82,4 | 84,8 | 84,4 | 84,4 |
| Wikipedia artículos nuevos (desde 2024) | 76,6 | 79,0 | 78,8 | 78,4 |
| Documentación técnica (MDN / Python docs) | 90,2 | 92,2 | 92,2 | 91,8 |
| Nombres propios | 64,6 | 65,2 | 65,2 | 65,0 |
| Terminología LLM local (46 frases, autor) | 84,8 | 82,6 | 82,6 | 84,8 |

El autor advierte que las frases de evaluación creadas por él son distintas de las de entrenamiento, pero comparten vocabulario, y que en los conjuntos pequeños (como terminología de LLM local) una sola frase mueve unos 2 puntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 90M de parámetros, la cuantización Q8_0 ocupa aproximadamente 0,1 GB y Q5_K_M algo menos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 4090, RTX 3060, etc.) e incluso en iGPU.
- Opciones de despliegue: llama.cpp a través de Zenzai (AzooKeyKanaKanjiConverter). El autor advierte que el llama.cpp estándar no puede abrir este GGUF debido al pre-tokenizador `gpt2-small-japanese-char`; es necesario el fork o la integración específica de Zenzai.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| sweet-zenz-v1-small (este) | 90,4M | no disponible (contexto izquierdo de 40 caracteres) | CC BY-SA 4.0 | Conversión kana-kanji con mejoras en jerga y términos técnicos |
| zenz-v3.1-small (base) | no disponible (misma familia, ~90M) | no disponible | CC BY-SA 4.0 | Conversión kana-kanji general |
| zenz-v3.1 (familia) | no disponible | no disponible | CC BY-SA 4.0 | Conversión kana-kanji, versión de referencia |

La comparativa se limita a la familia zenz porque no se dispone de información sobre otros modelos comparables de conversión kana-kanji con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: el modelo solo realiza conversión kana-kanji; no es un modelo generativo de propósito general ni admite instrucciones libres.
- Dependencia de Zenzai: el GGUF no se puede abrir con el llama.cpp estándar debido al pre-tokenizador personalizado; requiere la integración de Zenzai.
- Contexto limitado: el contexto izquierdo se limita a 40 caracteres, lo que puede ser insuficiente para desambiguaciones que dependan de frases más largas.
- Riesgo de sobreajuste a las evaluaciones: el autor reconoce que las frases de evaluación comparten vocabulario con el entrenamiento y que los conjuntos pequeños son sensibles a variaciones de una sola frase.
- Rendimiento inferior en terminología de LLM local: en esa categoría el modelo base obtiene 84,8 frente a 82,6 de este modelo, por lo que la mejora no es uniforme.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con Wikipedia, Wiktionary y diccionarios, puede heredar los sesgos de esas fuentes.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Idiomas: solo japonés; no soporta otros idiomas.
- Alucinación: aunque el riesgo es bajo por la naturaleza de la tarea, el modelo puede producir conversiones incorrectas en términos desconocidos o muy poco frecuentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small-gguf
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v3.1-small
- Repositorio del modelo sin cuantizar: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small
- Zenzai / AzooKeyKanaKanjiConverter: https://github.com/azooKey/AzooKeyKanaKanjiConverter
- Dataset zenz-v2.5: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Dataset de errores de entrada de Wikipedia v2: https://nlp.ist.i.kyoto-u.ac.jp/?日本語Wikipedia入力誤りデータセット
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- hololive-dictionary: https://github.com/heppokofrontend/hololive-dictionary

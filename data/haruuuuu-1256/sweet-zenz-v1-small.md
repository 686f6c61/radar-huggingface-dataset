# haruuuuu-1256/sweet-zenz-v1-small

## Resumen

sweet-zenz-v1-small es un modelo GPT-2 de aproximadamente 90 millones de parámetros especializado en conversión kana-kanji (かな漢字変換), es decir, la tarea de transformar una lectura en katakana o hiragana en el texto japonés correcto con la ortografía kanji adecuada. Lo desarrolla el usuario haruuuuu-1256 como un ajuste fino (fine-tuning) del modelo Miwa-Keita/zenz-v3.1-small, y está diseñado para integrarse en Zenzai, el motor de conversión del teclado japonés AzooKey.

El modelo parte de la arquitectura GPT-2 del zenz original y añade entrenamiento supervisado (SFT) sobre unos 420.000 pares de conversión, seguido de un ajuste con refuerzo mediante GRPO. Su objetivo es mejorar la precisión en dominios específicos —desambiguación de homófonos, terminología de VRChat y modificación de avatares, vocabulario de LLM locales, jerga de internet y nombres propios con caracteres alfanuméricos— sin degradar la precisión general del modelo base.

Es relevante ahora porque demuestra un flujo de trabajo completo de especialización de un modelo pequeño de conversión japonesa con datos de licencia clara y evaluación pública, y porque mantiene el mismo formato de prompt y los mismos metadatos GGUF que el zenz oficial, lo que facilita su sustitución directa en despliegues existentes de Zenzai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT-2 (decoder-only) |
| Parametros totales | 90.450.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el formato de prompt limita la parte izquierda a 40 caracteres) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0 y Q5_K_M |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bf16) y GGUF (ggml-model-Q8_0.gguf, ggml-model-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo es un GPT-2 decoder-only de unos 90M de parámetros, heredado del zenz-v3.1-small. El formato de prompt es idéntico al de zenz-v3: `[<contexto izquierdo, máx. 40 caracteres>]<entrada en katakana><resultado de conversión></s>`. El tokenizador emplea el pre-tokenizer `gpt2-small-japanese-char` en sus metadatos GGUF, el mismo que el zenz oficial, lo que implica que solo es compatible con la versión de llama.cpp que usa Zenzai y no con el llama.cpp upstream.

El entrenamiento consta de dos fases. La primera es un SFT sobre aproximadamente 420.000 pares de conversión construidos a partir de datos públicos con licencia explícita (Wikipedia japonesa, Wiktionary, SudachiDict, RealPersonaChat, documentación técnica traducida, entre otros), mezclados con 155.000 muestras de autodestilación generadas por el propio modelo base para preservar sus convenciones de escritura. En esta fase se desactiva el dropout (0,1 en la configuración original) porque su activación disparaba la pérdida sobre las propias salidas. La segunda fase aplica GRPO durante 500 pasos: se muestrean 8 salidas por prompt, se recompensa la coincidencia con la referencia (tolerando variantes ortográficas, con bonus por coincidencia exacta) y se penalizan las salidas degeneradas (sin EOS o con UTF-8 inválido), con regularización KL hacia el modelo base (β=0,1). Las lecturas de entrada se asignan con SudachiPy + SudachiDict (full, 2026-10-15), fijando manualmente algunas palabras.

## Capacidades

- Conversión kana-kanji: transforma lecturas en katakana a texto japonés con kanji y ortografía correctos.
- Desambiguación de homófonos: distingue pares como 務める/勤める, 伯父/叔父 o 開放/解放.
- Terminología especializada: cubre vocabulario de VRChat, modificación de avatares, LLM locales e IA.
- Jerga de internet y coloquialismos: reconoce expresiones como «それな» o «ｗ».
- Nombres propios con caracteres alfanuméricos: maneja cadenas como `RTX 5090` o `Q4_K_M`.
- Uso de contexto izquierdo: acepta hasta 40 caracteres de contexto previo para mejorar la conversión.
- Integración con Zenzai: pensado para el motor de conversión de AzooKeyKanaKanjiConverter.
- No soporta tool calling, agentes, visión ni audio: es un modelo de conversión de texto, no un LLM conversacional.

## Casos de uso

- Teclado japonés de escritorio: integrado en Zenzai mediante los pesos GGUF Q8_0, sustituye al zenz-v3.1-small para ofrecer mejor desambiguación de homófonos en la escritura diaria.
- Redacción de documentación técnica en japonés: el modelo mejora un 2,0 % en documentos MDN y Python docs (92,2 frente a 90,2), por lo que resulta adecuado para entornos de desarrollo que escriben documentación en japonés.
- Comunidades de VRChat y modificación de avatares: con un 94,3 % de acierto en terminología del dominio frente al 84,8 % del base, es útil en chats y guías de esta comunidad.
- Conversión de nombres propios y modelos de hardware: maneja cadenas alfanuméricas como `RTX 5090` o `Q4_K_M` con un 56,7 % de coincidencia exacta, útil en foros y documentación de IA local.
- Entrada de texto en entornos con jerga de internet: con un 95,0 % en lenguaje de red, encaja en aplicaciones de mensajería y redes sociales japonesas.
- Procesamiento de vocabulario de Wiktionary y artículos recientes: mejora la conversión de términos de diccionario (83,8 frente a 81,6) y de artículos de Wikipedia posteriores a 2024 (79,0 frente a 76,6), útil en pipelines de normalización de texto.
- Investigación en conversión kana-kanji: sirve como punto de partida reproducible para experimentar con SFT + GRPO en modelos pequeños de conversión, dado que documenta datos, hiperparámetros y evaluación.

## Benchmarks y rendimiento

Evaluación con decodificación greedy; la métrica es la tasa de coincidencia tolerando variantes ortográficas (kana/kanji, letras latinas/katakana, cifras, espacios), salvo en «alfanumérico», que exige coincidencia exacta con espacios.

| Evaluación | zenz-v3.1-small | sweet-zenz-v1-small | Q8_0 | Q5_K_M |
|---|---|---|---|---|
| AJIMEE-Bench (200 preguntas, acc@1 exacta) | 87,0 | 87,0 | 87,0 | 85,5 |
| zenz-v2.5-dataset parte Wikipedia (2.000) | 84,6 | 84,6 | 84,7 | 84,5 |
| JWTD homófonos (1.000 preguntas) | 61,3 | 64,7 | 65,2 | 63,4 |
| JWTD homófonos, texto largo (300 preguntas) | 52,0 | 56,3 | 55,7 | 56,3 |
| Terminología VRChat (105 frases, autor) | 84,8 | 94,3 | 92,4 | 94,3 |
| Jerga de internet (40 frases, autor) | 92,5 | 95,0 | 95,0 | 95,0 |
| Alfanumérico (30 frases, autor, exacta) | 50,0 | 56,7 | 56,7 | 53,3 |
| Wiktionary | 81,6 | 83,8 | 83,8 | 84,4 |
| Wikipedia subcultura | 82,4 | 84,8 | 84,4 | 84,4 |
| Wikipedia artículos nuevos (desde 2024) | 76,6 | 79,0 | 78,8 | 78,4 |
| Documentación técnica (MDN / Python docs) | 90,2 | 92,2 | 92,2 | 91,8 |
| Nombres propios | 64,6 | 65,2 | 65,2 | 65,0 |
| Terminología de LLM locales (46 frases, autor) | 84,8 | 82,6 | 82,6 | 84,8 |

El autor advierte que las frases de evaluación propias se redactaron por separado de los datos de entrenamiento, pero comparten vocabulario, y que en los conjuntos pequeños cada frase mueve unos dos puntos. El único retroceso apreciable es en terminología de LLM locales (84,8 → 82,6).

## Requisitos de hardware

- VRAM estimada para inferencia: con 90M de parámetros, en bf16 ocupa aproximadamente 0,18 GB de pesos; en Q8_0, unos 0,09 GB; en Q5_K_M, unos 0,06 GB. El consumo real lo domina el runtime de llama.cpp, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no requiere A100 ni H100. Funciona en CPU sin problema.
- GPU de consumo: cabe holgadamente en cualquier RTX (incluidas series 20/30/40/50), GTX e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp en la variante que usa Zenzai (el GGUF no se abre con el llama.cpp upstream por el pre-tokenizer `gpt2-small-japanese-char`); los pesos safetensors se pueden cargar con Transformers. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sweet-zenz-v1-small | 90,45M | no disponible (contexto izquierdo de 40 caracteres) | CC BY-SA 4.0 | Ajuste de zenz-v3.1-small con SFT + GRPO; mejor en homófonos y dominios específicos |
| Miwa-Keita/zenz-v3.1-small | ~90M (modelo base) | no disponible | no disponible en la información | Base del anterior; referencia en todos los benchmarks |
| Modelos de conversión kana-kanji de gran escala (p. ej. basados en LLM) | no disponible | no disponible | no disponible | No se aportan datos comparativos en la información disponible |

## Limitaciones y advertencias

- Solo japonés: no soporta otros idiomas ni tareas de generación libre; su función es exclusivamente la conversión kana-kanji.
- Contexto limitado: el formato de prompt restringe el contexto izquierdo a 40 caracteres, lo que puede perjudicar la desambiguación en frases largas.
- Riesgo de conversión errónea: como todo modelo de conversión, puede producir kanji incorrectos en homófonos poco frecuentes; la tasa en JWTD es del 64,7 % (65,2 % en Q8_0), lejos de la saturación.
- Retroceso en un dominio: la terminología de LLM locales baja de 84,8 a 82,6 respecto al base.
- Evaluaciones parcialmente autoelaboradas: las frases de prueba son del autor y comparten vocabulario con el entrenamiento, por lo que las cifras de dominios específicos deben tomarse con cautela.
- Compatibilidad restringida: el GGUF no se abre con el llama.cpp upstream; requiere la variante usada por Zenzai.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar también las licencias de los datos de entrenamiento.
- Sesgos: no se documentan sesgos específicos; el modelo se entrena con datos públicos con licencia y sin rastreo web de terceros, pero puede reflejar sesgos de Wikipedia y Wiktionary.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v3.1-small
- Zenzai / AzooKeyKanaKanjiConverter: https://github.com/azooKey/AzooKeyKanaKanjiConverter
- Dataset zenz-v2.5-dataset: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Dataset de errores de entrada de Wikipedia japonesa v2: https://nlp.ist.i.kyoto-u.ac.jp/?日本語Wikipedia入力誤りデータセット
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- hololive-dictionary: https://github.com/heppokofrontend/hololive-dictionary

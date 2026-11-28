# haruuuuu-1256/sweet-zenz-v1-xsmall-gguf

## Resumen

sweet-zenz-v1-xsmall es un modelo de conversión kana-kanji (かな漢字変換) para japonés, desarrollado por el usuario haruuuuu-1256 y publicado en Hugging Face. Se trata de un modelo GPT-2 de aproximadamente 22,5 millones de parámetros, obtenido mediante destilación del modelo sweet-zenz-v1-small (de mayor tamaño) sobre el modelo base zenz-v3.1-xsmall de Miwa-Keita. Su propósito no es la generación de texto libre, sino la conversión de lecturas en katakana a la notación kanji correcta dentro de un motor IME, concretamente en Zenzai (AzooKeyKanaKanjiConverter).

El modelo aborda un problema clásico del procesamiento del japonés: la desambiguación de homófonos y la correcta selección de kanji según el contexto. Frente al modelo base del mismo tamaño, incorpora mejoras específicas en terminología de VRChat, modelos LLM locales, jerga de internet y nombres propios, ámbitos donde los IME convencionales fallan con frecuencia. El repositorio incluye cuantizaciones GGUF en Q8_0 (26 MB) y Q5_K_M (18 MB), diseñadas para su uso con la versión de llama.cpp que integra Zenzai.

La relevancia de esta ficha es acotada: es un modelo muy pequeño, especializado y con cero descargas en el momento de la consulta, pensado exclusivamente para el ecosistema IME japonés. No es un modelo de propósito general y no debe evaluarse como tal. Su interés reside en la mejora medible sobre el modelo base en pruebas de homónimos y vocabulario especializado, manteniendo el rendimiento en el benchmark estándar AJIMEE-Bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), según model card |
| Parametros totales | 22.511.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el formato de prompt admite hasta 40 caracteres de contexto izquierdo) |
| Tipos de cuantizacion | Q8_0 (26 MB, recomendada), Q5_K_M (18 MB); pesos originales en bf16 |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un GPT-2 decoder-only de 22,5M de parámetros, derivado de zenz-v3.1-xsmall. El entrenamiento se realizó en dos fases. La primera consistió en destilación desde el modelo profesor sweet-zenz-v1-small: se tomaron las salidas greedy del profesor como objetivo y se minimizó la entropía cruzada por token junto con la divergencia KL respecto a la distribución del profesor, durante 3.000 pasos. Los prompts de esta fase provinieron de los datos públicos usados en el entrenamiento de sweet-zenz-v1-small y de la porción derivada de Wikipedia del dataset zenz-v2.5-dataset.

La segunda fase aplicó GRPO (600 pasos) con la misma configuración que el modelo profesor: recompensa por coincidencia que tolera variaciones de notación, penalización por descontrol en la generación y regularización KL con β=0,1. Un detalle técnico destacable es que, aunque zenz-v3.x define dropout 0,1, el autor lo desactivó porque su activación disparaba la pérdida. Los datos de entrenamiento son exclusivamente públicos y con licencia explícita (Wikipedia, Wiktionary, SudachiDict, hololive-dictionary, documentación técnica traducida, RealPersonaChat y diccionarios creados por el autor); no se emplearon rastreos web de terceros ni conversaciones privadas. El formato de prompt sigue el de zenz-v3: contexto izquierdo de hasta 40 caracteres, entrada en katakana y resultado de conversión.

## Capacidades

- Conversión kana-kanji (かな漢字変換) para motores IME japoneses, en particular Zenzai.
- Desambiguación de homófonos (同音異義語) guiada por contexto izquierdo de hasta 40 caracteres.
- Reconocimiento y conversión de terminología de VRChat, modelos LLM locales, jerga de internet y nombres propios.
- Manejo de vocabulario técnico procedente de documentación (MDN, Python, Kubernetes, Transformers).
- Generación de una única secuencia de conversión por prompt; no es un modelo conversacional.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito.
- Capacidad multilingüe limitada al japonés; los términos en inglés aparecen solo como vocabulario dentro de la conversión al japonés.

## Casos de uso

- Integración en IME japonés mediante Zenzai: el modelo se carga en la versión de llama.cpp que usa AzooKeyKanaKanjiConverter y convierte la lectura en katakana a kanji en tiempo real, aprovechando su tamaño reducido (18-26 MB) para inferencia local con latencia mínima.
- Mejora de la escritura en comunidades de VRChat: la evaluación del autor muestra un 91,4 % de acierto en 105 frases con terminología de VRChat, frente al 77,1 % del modelo base, lo que lo hace adecuado para usuarios que redactan habitualmente sobre esta plataforma.
- Conversión de jerga y lenguaje de internet: con un 95,0 % en 40 frases de jerga frente al 90,0 % del base, resulta útil en aplicaciones de mensajería y foros donde el vocabulario coloquial es frecuente.
- Redacción técnica en japonés: su 88,8 % en documentación técnica (MDN y Python docs) lo hace apropiado para entornos de desarrollo donde se escriben comentarios y documentación en japonés con términos ingleses transliterados.
- Desambiguación de homófonos en textos largos: el 46,0 % en homónimos de frase larga (frente al 36,0 % del base) lo sitúa como opción para editores de texto que necesitan corregir lecturas ambiguas en párrafos extensos.
- Uso en dispositivos con recursos limitados: las cuantizaciones de 18 y 26 MB permiten ejecutarlo en CPU y en hardware embebido, sin necesidad de GPU, dentro de un pipeline de IME.
- Normalización de nombres propios en pipelines de datos japoneses: con un 57,2 % en la prueba de nombres propios (frente al 49,8 % del base), puede asistir en tareas de limpieza y anotación de corpus.

## Benchmarks y rendimiento

Datos de la model card, con decodificación greedy y coincidencia que tolera variaciones de notación (kana/kanji, letras latinas/katakana, cifras, espacios):

| Evaluacion | zenz-v3.1-xsmall Q5_K_M | sweet-zenz-v1-xsmall Q8_0 | sweet-zenz-v1-xsmall Q5_K_M |
|---|---|---|---|
| AJIMEE-Bench (200 preguntas, acc@1 exacta) | 68,5 | 68,0 | 67,0 |
| zenz-v2.5-dataset parte Wikipedia (2.000) | 76,2 | 79,2 | 78,2 |
| JWTD homónimos (1.000) | 48,8 | 58,8 | 59,0 |
| JWTD homónimos, frase larga (300) | 36,0 | 46,0 | 44,7 |
| Terminología VRChat (105 frases, autor) | 77,1 | 91,4 | 91,4 |
| Jerga de internet (40 frases, autor) | 90,0 | 95,0 | 95,0 |
| Terminología LLM local (46 frases, autor) | 69,6 | 89,1 | 87,0 |
| Wiktionary | 73,6 | 79,6 | 79,6 |
| Wikipedia subcultura | 76,2 | 81,6 | 81,4 |
| Wikipedia artículos nuevos (desde 2024) | 67,4 | 72,4 | 70,8 |
| Documentación técnica (MDN / Python docs) | 82,2 | 88,8 | 88,4 |
| Nombres propios | 49,8 | 57,2 | 55,4 |

El autor advierte que en AJIMEE-Bench el rendimiento es equivalente al del modelo base, que persiste cierta tendencia a la repetición en entradas largas y que en las pruebas con pocas frases cada oración puede mover el resultado alrededor de 2 puntos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantización; los ficheros GGUF ocupan 26 MB (Q8_0) y 18 MB (Q5_K_M), por lo que la inferencia cabe holgadamente en memoria de cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte CUDA, ROCm o Metal puede ejecutarlo. Para uso en IME, la CPU es el escenario habitual.
- Compatibilidad con GPU consumer: sí, en todas (RTX 4090, RTX 3060, integradas, etc.), dado el reducido tamaño.
- Opciones de despliegue: llama.cpp en la variante específica que usa Zenzai (el autor advierte que el llama.cpp upstream no abre este GGUF por el pre-tokenizer `gpt2-small-japanese-char`); los pesos safetensors son compatibles con Transformers.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AJIMEE-Bench (acc@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sweet-zenz-v1-xsmall (Q8_0) | 22,5M | no disponible (contexto de prompt 40 caracteres) | 68,0 | CC BY-SA 4.0 | Hugging Face (0 descargas) |
| zenz-v3.1-xsmall (Q5_K_M) | no disponible | no disponible | 68,5 | no disponible en la información | Hugging Face (modelo base) |
| sweet-zenz-v1-small | no disponible (mayor que xsmall) | no disponible | no disponible | no disponible en la información | Hugging Face (modelo profesor) |

La comparación se limita a los modelos citados en la model card; no se dispone de datos de otras alternativas de conversión kana-kanji en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo especializado en conversión kana-kanji; no sirve para generación de texto libre, razonamiento, código ni tareas conversacionales.
- Solo soporta japonés; no hay capacidades multilingües reales.
- Tendencia residual a la repetición en entradas largas, reconocida por el autor.
- El rendimiento en AJIMEE-Bench no supera al modelo base (68,0 frente a 68,5 en Q8_0); la mejora se concentra en homónimos y vocabulario especializado.
- Las evaluaciones con frases creadas por el autor comparten vocabulario con los datos de entrenamiento, lo que puede inflar los resultados; además, los conjuntos pequeños (40-105 frases) son sensibles a variaciones de 2 puntos por oración.
- El GGUF no se abre con el llama.cpp upstream debido al pre-tokenizer `gpt2-small-japanese-char`; requiere la variante usada por Zenzai.
- Licencia CC BY-SA 4.0: el uso comercial es posible, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Riesgo de alucinación presente en forma de conversiones incorrectas de kanji, especialmente en nombres propios (57,2 % de acierto) y homónimos en frases largas (46,0 %).
- Sesgos: los datos de entrenamiento proceden de fuentes públicas japonesas (Wikipedia, documentación técnica, diccionarios) y de diccionarios creados por el autor; pueden reflejar sesgos de esas fuentes, aunque no se documentan sesgos específicos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-xsmall-gguf
- Modelo profesor sweet-zenz-v1-small: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small
- Modelo base zenz-v3.1-xsmall: https://huggingface.co/Miwa-Keita/zenz-v3.1-xsmall
- Zenzai / AzooKeyKanaKanjiConverter: https://github.com/azooKey/AzooKeyKanaKanjiConverter
- Dataset zenz-v2.5-dataset: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Dataset de errores de entrada de Wikipedia japonesa v2: https://nlp.ist.i.kyoto-u.ac.jp/?日本語Wikipedia入力誤りデータセット
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- hololive-dictionary: https://github.com/heppokofrontend/hololive-dictionary

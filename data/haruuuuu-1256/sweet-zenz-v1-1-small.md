# haruuuuu-1256/sweet-zenz-v1.1-small

## Resumen

sweet-zenz-v1.1-small es un modelo GPT-2 de aproximadamente 90 millones de parámetros especializado en conversión kana-kanji (かな漢字変換), es decir, la transformación de lecturas en katakana a texto japonés con la ortografía kanji correcta. Lo desarrolla el usuario haruuuuu-1256 como un ajuste fino de sweet-zenz-v1-small, que a su vez deriva de zenz-v3.1-small de Keita Miwa. Su propósito no es la generación de texto libre, sino servir como motor de conversión de entrada para el sistema Zenzai, integrado en el teclado japonés AzooKey.

La versión 1.1 corrige problemas de la v1 en la ordenación de candidatos para lecturas cortas sin contexto, mejora la precisión general en pruebas de conversión y refuerza el vocabulario de dominios como VRChat, LLM locales, jerga de internet y términos alfanuméricos. El modelo mantiene un tamaño reducido (0,2 GB en el repositorio) y se distribuye en safetensors bf16 y en formato GGUF cuantizado, lo que permite ejecutarlo en entornos de escritorio y móviles.

Es relevante ahora porque demuestra que un modelo de 90M puede competir en tareas de conversión kana-kanji con alternativas de mayor tamaño, y porque su enfoque de entrenamiento combina SFT con GRPO (aprendizaje por refuerzo con recompensas de coincidencia) y ajuste de la distribución previa de lecturas cortas, una técnica poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 90.450.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el formato de prompt admite hasta 40 caracteres de contexto izquierdo) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0 y Q5_K_M |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2 con unos 90M de parámetros, ajustado desde zenz-v3.1-small. El prompt sigue el formato de zenz-v3: `[<contexto izquierdo, max. 40 caracteres>]<entrada en katakana><resultado de conversion></s>`. El tokenizador usa el pre-tokenizador `gpt2-small-japanese-char`, compatible con el GGUF oficial de zenz-v3.1 y con llama.cpp en la variante que emplea Zenzai; el llama.cpp upstream no puede abrir este GGUF.

El entrenamiento se realizó en varias fases. Primero, SFT con aproximadamente 420.000 pares de conversión construidos a partir de datos públicos con licencia explícita (Wikipedia, Wiktionary, RealPersonaChat, SudachiDict, documentación técnica, entre otros), mezclados con 155.000 salidas de auto-destilación del modelo original; el dropout se desactivó porque su activación disparaba la pérdida sobre las propias salidas. Después, GRPO con 8 muestras por prompt, recompensa por coincidencia con la respuesta correcta (tolerando variantes ortográficas y con bonus por coincidencia exacta), penalización por salidas degeneradas (sin EOS o UTF-8 inválido) y regularización KL hacia el modelo original (β=0,1) durante 500 pasos. La v1.1 añade un GRPO con criterio ortográfico (solo se acepta una respuesta en kana si el modelo original también la produce), un ajuste SFT de la distribución previa de lecturas cortas de 2 a 4 caracteres basado en frecuencias de Wikipedia, RealPersonaChat y Wiktionary, y un reentrenamiento de terminología para recuperar vocabulario especializado. Las lecturas de entrada se asignaron con SudachiPy + SudachiDict (full, 2026-10-15).

## Capacidades

- Conversión kana-kanji: transforma lecturas en katakana a texto japonés con kanji, kana y alfabeto según el contexto.
- Desambiguación de homófonos: distingue usos como 務める/勤める, 伯父/叔父, 開放/解放.
- Vocabulario especializado: términos de VRChat, modificación de avatares, LLM locales, IA, jerga de internet y nombres propios alfanuméricos (RTX 5090, Q4_K_M).
- Manejo de números y unidades: aprende lecturas como 75メートル → 75m.
- Conversión con contexto izquierdo: usa hasta 40 caracteres previos para resolver ambigüedades.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; es un modelo de conversión de entrada, no un asistente general.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Motor de entrada japonés en Zenzai/AzooKey: el modelo se integra como backend de conversión kana-kanji en el teclado AzooKey, donde su tamaño de 90M y su GGUF Q8_0 permiten inferencia local en dispositivos de escritorio y móviles.
- Desambiguación de homófonos en textos administrativos: al convertir lecturas de documentos formales, el modelo elige entre 務める y 勤める según el contexto izquierdo, reduciendo correcciones manuales.
- Conversión de jerga y términos técnicos en comunidades de IA: para textos sobre LLM locales y cuantizaciones, el modelo mantiene términos como Q4_K_M o RTX 5090 sin degradarlos a kana.
- Preprocesado de corpus japoneses: convertir lecturas katakana generadas por TTS o por sistemas de dictado a texto con kanji antes de indexar o analizar.
- Asistencia a la escritura en VRChat y comunidades de avatares: convierte términos específicos del dominio (nombres de avatares, modificaciones) con una precisión medida de 85,7 en la evaluación de VRChat.
- Entrada de texto en entornos con recursos limitados: al caber en 0,2 GB y ejecutarse con llama.cpp vía Zenzai, es viable en equipos sin GPU dedicada.
- Normalización de documentación técnica: convierte lecturas de términos de MDN, Python docs o Kubernetes, con una precisión de 90,8 en la evaluación de documentación técnica.

## Benchmarks y rendimiento

Resultados publicados por el autor (decodificación greedy, coincidencia tolerando variantes ortográficas; negrita = mejor valor entre los tres modelos sin cuantizar):

| Evaluacion | zenz-v3.1-small | sweet-zenz-v1 | sweet-zenz-v1.1 | v1.1 Q8_0 | v1.1 Q5_K_M |
|---|---|---|---|---|---|
| AJIMEE-Bench (200 preguntas, acc@1 exacta) | 87,0 | 86,5 | **88,0** | 88,0 | 86,0 |
| AJIMEE-Bench MinCER (menor es mejor) | **1,58** | 1,89 | 1,64 | 1,59 | 2,22 |
| Coincidencia de frecuencia en lecturas cortas (sin contexto) | 77,9 | 76,2 | **82,9** | 83,1 | 82,5 |
| Homónimos cotidianos (40 frases) | 82,5 | 85,0 | **87,5** | 87,5 | 87,5 |
| JWTD homónimos (1.000 preguntas) | 61,3 | **64,8** | 63,2 | 62,8 | 62,5 |
| JWTD homónimos, frases largas (300 preguntas) | 52,0 | 56,0 | **57,0** | 57,0 | 56,0 |
| Wikipedia de zenz-v2.5-dataset (2.000 casos) | **84,5** | 84,5 | 83,8 | 83,5 | 83,7 |
| Terminología de LLM locales (46 frases) | 84,8 | 82,6 | **87,0** | 89,1 | 89,1 |
| Terminología de VRChat (105 frases) | 84,8 | **93,3** | 85,7 | 85,7 | 84,8 |
| Terminología de VRChat (coincidencia exacta) | 44,8 | 52,4 | **54,3** | 53,3 | 57,1 |
| Jerga de internet (40 frases) | 92,5 | **95,0** | 92,5 | 92,5 | 92,5 |
| Alfanuméricos (30 frases, exacta) | 50,0 | **56,7** | **56,7** | 56,7 | 56,7 |
| Wikipedia subcultura | 82,4 | **84,6** | 81,4 | 80,2 | 80,6 |
| Wikipedia artículos nuevos (2024+) | 76,6 | **78,6** | 77,0 | 76,4 | 75,2 |
| Documentación técnica (MDN / Python docs) | 90,2 | **92,2** | 90,8 | 90,8 | 90,2 |
| Nombres propios | 64,6 | **65,4** | 64,4 | 64,0 | 64,2 |
| Wiktionary | 81,6 | **84,0** | 83,8 | 84,0 | 84,2 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (90M parámetros); aproximadamente 0,1 GB en GGUF Q8_0 y menos de 0,1 GB en Q5_K_M.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) y en dispositivos móviles.
- Opciones de despliegue: llama.cpp a través de Zenzai (con el pre-tokenizador `gpt2-small-japanese-char`); Transformers con los pesos safetensors; el GGUF no es compatible con llama.cpp upstream.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sweet-zenz-v1.1-small | ~90M | no disponible (contexto izquierdo de 40 caracteres) | CC BY-SA 4.0 | safetensors + GGUF Q8_0/Q5_K_M |
| sweet-zenz-v1-small | ~90M | no disponible | CC BY-SA 4.0 | safetensors + GGUF |
| sweet-zenz-v1-xsmall | ~22,5M | no disponible | CC BY-SA 4.0 | safetensors + GGUF |
| zenz-v3.1-small | ~90M | no disponible | no disponible en la información | safetensors + GGUF |

En AJIMEE-Bench, sweet-zenz-v1.1-small obtiene 88,0 frente a 87,0 de zenz-v3.1-small y 86,5 de sweet-zenz-v1. En terminología de LLM locales obtiene 87,0 frente a 84,8 de zenz-v3.1-small, mientras que en terminología de VRChat (93,3) y jerga de internet (95,0) la v1 supera a la v1.1. La xsmall de 22,5M está pensada para priorizar tamaño y velocidad sobre precisión.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto libre, no razona, no soporta tool calling ni agentes.
- El contexto se limita a 40 caracteres de texto izquierdo; no maneja documentos largos.
- Solo japonés; no soporta otros idiomas.
- Precisión desigual por dominio: la v1.1 empeora respecto a la v1 en terminología de VRChat (85,7 frente a 93,3), jerga de internet (92,5 frente a 95,0), Wikipedia subcultura (81,4 frente a 84,6) y nombres propios (64,4 frente a 65,4).
- Las evaluaciones con pocas frases (40, 46, 30 casos) varían unos 2 puntos por frase; los resultados deben interpretarse con cautela.
- Las frases de evaluación fueron escritas por el autor y comparten vocabulario con los datos de entrenamiento, aunque no son idénticas.
- Riesgo de alucinación ortográfica en lecturas poco frecuentes o sin contexto; el ajuste de distribución previa mitiga pero no elimina este problema.
- Licencia CC BY-SA 4.0: el uso comercial exige compartir las obras derivadas bajo la misma licencia y atribuir al autor y a los datos de origen.
- El GGUF no se puede abrir con llama.cpp upstream; requiere la variante usada por Zenzai.
- No se han publicado datos sobre sesgos demográficos ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1.1-small
- GGUF de la v1.1: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1.1-small-gguf
- Modelo base sweet-zenz-v1-small: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small
- GGUF de la v1: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-small-gguf
- Versión xsmall: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-xsmall
- GGUF de la xsmall: https://huggingface.co/haruuuuu-1256/sweet-zenz-v1-xsmall-gguf
- Modelo original zenz-v3.1-small: https://huggingface.co/Miwa-Keita/zenz-v3.1-small
- Zenzai / AzooKeyKanaKanjiConverter: https://github.com/azooKey/AzooKeyKanaKanjiConverter
- Dataset zenz-v2.5-dataset: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Dataset de errores de entrada de Wikipedia japonés v2: https://nlp.ist.i.kyoto-u.ac.jp/?日本語Wikipedia入力誤りデータセット
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- hololive-dictionary: https://github.com/heppokofrontend/hololive-dictionary

# muyleanging/Akkhara-Mini-Khmer-ONNX

## Resumen

Akkhara-Mini-Khmer-ONNX es un modelo de transliteración y romanización inversa desarrollado por Ing Muyleang que convierte "Sing Khmer" (texto jemer escrito con letras latinas, tal como se teclea informalmente en chats y redes) en escritura jemer nativa. El modelo resuelve un problema muy concreto del ecosistema digital camboyano: la ausencia de un teclado jemer ágil en dispositivos móviles, ofreciendo una lista de hasta cinco sugerencias ordenadas por probabilidad, al estilo de un IME (input method editor).

Se trata de un transformer encoder-decoder de estilo T5 con tokenización a nivel de carácter, 6 capas de encoder y 3 de decoder con dimensión de modelo 384, y solo 17,8 millones de parámetros. Su reducido tamaño lo hace apto para ejecución totalmente offline en teléfonos Android, integrándose en la aplicación de teclado Akkhara. La versión ONNX incluye un export de 8 bits de solo 18,5 MB, con latencia de aproximadamente 10 ms por sugerencia en un móvil Android reciente.

El modelo se distribuye bajo licencia Apache-2.0, soporta jemer (km) e inglés (en) en entradas con code-mixing, y está entrenado sobre 398.000 pares Sing Khmer → jemer, incluyendo 134 nombres de ministerios, universidades y bancos camboyanos. Es relevante ahora porque demuestra que tareas de normalización lingüística altamente específicas pueden resolverse con modelos minúsculos ejecutables en el borde, sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estilo T5, tokenización a nivel de carácter (6 capas encoder, 3 capas decoder, d_model 384) |
| Parametros totales | 17.797.248 (17,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendación del autor: dividir texto largo en fragmentos de ~6 palabras) |
| Tipos de cuantizacion | ONNX float32 y ONNX int8 (8 bits); no se documentan GGUF ni otras |
| Idiomas soportados | Jemer (km) e inglés (en) en entradas con code-mixing |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y ONNX (encoder.onnx + decoder.onnx, y variantes int8) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura T5 encoder-decoder compacta con tokenización a nivel de carácter, lo que resulta adecuado para una escritura compleja como la jemer, donde la unidad de segmentación natural es el carácter o el grupo vocálico. El encoder procesa la frase completa una sola vez y el decoder genera la salida letra a letra (greedy o beam search con 5 haces), un diseño que encaja con el patrón de uso de un teclado predictivo.

El entrenamiento se realizó sobre 398.000 pares Sing Khmer → jemer, recopilados, generados, limpiados y verificados por el autor con ayuda de herramientas de IA (agy, Claude), e incluyen 134 nombres de ministerios, universidades y bancos cambianos. El dataset asociado (INGMUYLEANG/Akkhara-Sing-Khmer) está disponible bajo solicitud. La model card no publica detalles de hardware, tiempo de entrenamiento ni hiperparámetros, y no se documenta explícitamente el uso de RLHF o DPO.

Como innovación práctica, la distribución incluye un archivo `abbreviations.tsv` con 46 abreviaturas mapeadas a su nombre jemer completo (por ejemplo, `mptc` → ក្រសួងប្រៃសណីយ៍និងទូរគមនាគមន៍), que se aplica como lista externa y no como conocimiento aprendido por el modelo. El export ONNX separa encoder y decoder para permitir ejecución incremental eficiente en dispositivos móviles.

## Capacidades

- Transliteración inversa de Sing Khmer (jemer escrito con letras latinas) a escritura jemer nativa.
- Generación de lista clasificada top-5 de sugerencias, apta para interfaces de teclado predictivo (IME).
- Manejo de code-mixing: las palabras inglesas de chat (`benchmark`, `laptop`, `deadline`) se mantienen tal cual, con la grafía jemer de préstamo en el top-5 cuando existe (`deadline` → ដេតឡាញ).
- Expansión de abreviaturas de chat: `tmr` → ស្អែក, `sry` → សុំទោស, `gn` → រាត្រីសួស្តី, `btw` → ម្យ៉ាងទៀត, `wyd` → ធ្វើអីហ្នឹង.
- Desambiguación contextual de palabras cortas según sus vecinas (por ejemplo, `ng` = និង / នឹង / ហ្នឹង).
- Ejecución totalmente offline en dispositivos móviles mediante ONNX Runtime.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Teclado móvil predictivo para jemer: el modelo se integra en la aplicación Akkhara keyboard y genera la sugerencia principal en unos 10 ms con el modelo int8 en un Android reciente, permitiendo escribir jemer sin conocer la disposición del teclado nativo.
- Mensajería instantánea y chats informales: convierte frases tecleadas en Sing Khmer a jemer correcto en tiempo real, con soporte de abreviaturas y palabras inglesas mezcladas, adecuado para conversaciones multi-turno donde la latencia es crítica.
- Normalización de texto generado por usuarios: en plataformas de redes sociales camboyanas, el modelo puede preprocesar comentarios y publicaciones escritos en Sing Khmer para almacenarlos en jemer nativo y facilitar búsqueda y moderación.
- Expansión de abreviaturas administrativas: gracias al archivo `abbreviations.tsv`, un formulario o chatbot puede ofrecer el nombre completo de una institución (por ejemplo, `mptc`) junto a la abreviatura tecleada.
- Aplicaciones educativas de aprendizaje del jemer: la lista top-5 permite mostrar al estudiante la forma correcta junto a alternativas plausibles, útil en ejercicios de escritura y dictado.
- Asistentes de accesibilidad y entrada en dispositivos de gama baja: al ocupar 18,5 MB en int8 y ejecutarse offline, puede desplegarse en teléfonos con recursos limitados o en entornos sin conectividad fiable.
- Preprocesamiento en pipelines de NLP jemer: normalizar entradas Sing Khmer antes de pasarlas a modelos mayores de traducción o análisis, reduciendo ruido ortográfico.

## Benchmarks y rendimiento

Resultados publicados por el autor (mismo beam search de 5 haces en ambos modelos; test held-out de 7.821 frases, 39 frases reales de chat etiquetadas por un nativo, 86 pruebas de contexto y 7 pruebas de palabras pegadas):

| Modelo | Test top-1 | Test top-5 | Test CER | Chat real top-1 / top-5 | Contexto #1 / top-5 | Pegadas |
|---|---|---|---|---|---|---|
| akkhara-mini (18M) | 58,1% | 76,6% | 4,55% | 85% / 92% | 80 / 99% | 6/7 |
| akkhara-byt5-small (300M) | 62,0% | 79,7% | 3,73% | 87% / 95% | 80 / 98% | 7/7 |

El modelo pequeño queda a 3,9 puntos de top-1 y 3,1 puntos de top-5 del modelo de 300M en el test general, pero prácticamente iguala su rendimiento en frases reales de chat y en desambiguación contextual, siendo 16 veces más pequeño. En texto formal de estilo noticia, el modelo mayor (INGMUYLEANG/Akkhara-ByT5-Small-Khmer) es algo más preciso.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (17,8 M de parámetros); el export int8 ocupa 18,5 MB en disco.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, pero no es el objetivo del modelo.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles Android de gama media y reciente.
- Opciones de despliegue: ONNX Runtime (encoder.onnx + decoder.onnx o variantes int8), transformers con `AutoModelForSeq2SeqLM`, y text-generation-inference según los tags del repositorio.
- Latencia: aproximadamente 10 ms para la sugerencia #1 en un Android reciente con el modelo int8. Throughput no disponible.
- El decoder se ejecuta una vez por letra jemer generada, tras una única pasada del encoder por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 test | Top-1 chat real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Akkhara-Mini-Khmer-ONNX | 17,8 M | no disponible | 58,1% | 85% | Apache-2.0 | Hugging Face, ONNX incluido |
| Akkhara-ByT5-Small-Khmer | 300 M | no disponible | 62,0% | 87% | no disponible en la informacion proporcionada | Hugging Face |
| Otros modelos de transliteracion jemer | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa solo es posible con el modelo mayor del mismo autor, que ofrece una precisión ligeramente superior a costa de un tamaño 16 veces mayor y sin export ONNX documentado para móvil.

## Limitaciones y advertencias

- Entrenado mayoritariamente sobre pares sintéticos; el conjunto de prueba de chat real es muy pequeño (39 frases), por lo que la estimación de rendimiento en conversación real tiene alta incertidumbre.
- Las abreviaturas cortas siguen siendo ambiguas (`ng`, `yt`, `dl`, `bn`); la respuesta correcta suele estar en el top-5 pero no siempre en la posición #1.
- El modelo conoce palabras malsonantes de chat, ya que aparecen en datos reales; puede reproducirlas en las sugerencias.
- En texto formal de estilo noticia es menos preciso que el modelo ByT5-Small de 300M.
- No se documentan sesgos específicos más allá de los derivados de los datos de entrenamiento recopilados y generados por el autor.
- Riesgo de alucinación en entradas fuera de distribución (Sing Khmer atípico, jemer arcaico o dialectos no representados).
- La longitud de contexto no está publicada; el autor recomienda fragmentar el texto en trozos de unas 6 palabras, lo que limita el procesamiento de documentos largos de una sola pasada.
- Licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento solo está disponible bajo solicitud, lo que dificulta la reproducibilidad completa.
- No se publican detalles de hardware, tiempo ni hiperparámetros de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Akkhara-Mini-Khmer-ONNX
- Modelo mayor ByT5-Small: https://huggingface.co/INGMUYLEANG/Akkhara-ByT5-Small-Khmer
- Dataset Akkhara-Sing-Khmer: https://huggingface.co/datasets/INGMUYLEANG/Akkhara-Sing-Khmer
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/INGMUYLEANG/Akkhara-Demo
- Repositorio del teclado Akkhara: https://github.com/MuyleangIng/akkhara-keyboard
- Última release del APK: https://github.com/MuyleangIng/akkhara-keyboard/releases/latest
- Perfil del autor en Hugging Face: https://huggingface.co/INGMUYLEANG
- Perfil del autor en GitHub: https://github.com/MuyleangIng

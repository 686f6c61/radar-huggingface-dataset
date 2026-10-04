# j-llm/Irodori-TTS-v4.1-Small-Yomi-Tech-tuned

## Resumen

Irodori-TTS-v4.1-Small-Yomi-Tech-tuned es un modelo de síntesis de voz (text-to-speech) en japonés publicado por el usuario j-llm en HuggingFace. Se construye sobre takuma104/Irodori-TTS-v4.1-Small-Yomi, que a su vez es un ajuste fino del codificador de texto de Aratako/Irodori-TTS-v4.1-Small, y añade un frontend de lectura de términos técnicos y palabras inglesas embebido dentro del propio `model.safetensors`.

El problema que resuelve es muy concreto: los TTS japoneses suelen pronunciar mal tanto kanji poco frecuentes como palabras latinas incrustadas en texto japonés (MQTT, API key, GitHub, schedule, calendar, violin). Según la model card del autor, sin ese frontend el modelo base llega a inventar lecturas del tipo すーじゅー para "schedule" o ちゃーれん para "channel", mientras que este checkpoint las reescribe a katakana antes de la síntesis.

Es relevante porque ataca un fallo recurrente en producción: la lectura incorrecta de identificadores técnicos, nombres de producto y siglas en asistentes de voz, lectores de documentación o sistemas de aviso en japonés. Todo el contenido en japonés del texto original permanece intacto, y una frase sin caracteres latinos produce exactamente el mismo audio que Irodori-TTS-v4.1-Small-Yomi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Irodori-TTS: codificador de texto basado en ModernBERT (25 capas) más codec de audio; el backbone de síntesis no se describe en la información disponible |
| Parámetros totales | no disponible (el repositorio ocupa 3,1 GB; el frontend de lectura ocupa unos 31 MB y el lector katakana unos 5,6 M de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en safetensors; el script de inferencia admite ejecución en CPU y en CUDA 12.8) |
| Idiomas soportados | japonés (ja); lectura de términos en alfabeto latino (mayoritariamente inglés) incrustados en texto japonés |
| Licencia | other; `license_name: mit-and-cc-by-sa-4.0` (MIT y CC-BY-SA-4.0, según el archivo LICENSE del repositorio) |
| Formato de pesos | safetensors (`model.safetensors`, 714 tensores) |

## Arquitectura y entrenamiento

El checkpoint es un único archivo safetensors cuyos 714 tensores son byte a byte idénticos a los de takuma104/Irodori-TTS-v4.1-Small-Yomi. Ese modelo base ajusta la ruta de texto de Irodori-TTS-v4.1-Small para mejorar la lectura de kanji: en concreto, las 4 capas superiores de las 25 de ModernBERT y su normalización final, el proyector de texto con `text_norm` y el proyector de caption (reajustado después). El entrenamiento del ajuste de lectura se hizo por autodestilación mediante sustitución de kana, solo con texto.

La novedad de este modelo no está en los pesos, sino en un frontend de lectura de términos técnicos de unos 31 MB almacenado en los metadatos del safetensors bajo el prefijo `irodori_reading.*`. Para cada secuencia de letras latinas del texto: primero consulta un diccionario de 30.157 grafías (1.004 términos técnicos de diccionarios de pronunciación abiertos y preferencias curadas, unas 450 palabras de producto, plataforma y entorno laboral, y 28.705 préstamos ingleses de JMdict), probando la grafía exacta y luego en minúsculas, sin convertir a minúsculas las siglas en mayúsculas (por eso "ID" se lee アイディー); si falla, recurre a un lector katakana a nivel de carácter de unos 5,6 M de parámetros entrenado con esos pares, que solo se aplica cuando su confianza es de al menos el 95 %; como tercera vía, la model card menciona un deletreo (spell-out), aunque el texto disponible se corta en ese punto. No se documentan en la información disponible ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni fases de RLHF o DPO.

## Capacidades

- Síntesis de voz en japonés a partir de texto, con lectura corregida de kanji poco frecuentes (屡々 → シバシバ, 踵 → キビス, 樋 → トイ, 百舌鳥 → モズ según la model card).
- Lectura correcta de términos técnicos, siglas y nombres de producto latinos dentro de una frase japonesa: MQTT → エムキューティーティー, Wireshark → ワイヤーシャーク, LinkedIn → リンクトイン, Audible → オーディブル.
- Modo de síntesis con voz de referencia (`--ref-wav`) para clonación de timbre y modo sin referencia (`--no-ref`).
- Control de generación mediante `--caption`, `--seed` y `--num-steps`, heredados del script de inferencia de Irodori-TTS.
- Inspección de las reescrituras sin sintetizar audio mediante `--show-changes`, que imprime pares del tipo `['schedule->スケジュール', 'calendar->カレンダー']`.
- Integración en Python con `InferenceRuntime`, `RuntimeKey`, `SamplingRequest`, `save_wav` y `install_from_checkpoint`, con dispositivos separados para modelo y codec (`model_device`, `codec_device`, ambos configurables a `cuda`).
- Compatibilidad con el flujo estándar de Irodori-TTS: `infer.py --hf-checkpoint` funciona sin cambios, en cuyo caso el frontend se ignora y la salida es idéntica byte a byte a la de Irodori-TTS-v4.1-Small-Yomi.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni diálogo; el pipeline declarado es exclusivamente text-to-speech.

## Casos de uso

- Lectura de documentación técnica en japonés: el modelo convierte un párrafo con nombres de herramientas y siglas (MQTT, API key, GitHub) en audio inteligible, algo que el modelo base resolvía con lecturas inventadas como すーじゅー para "schedule" o ちゃーれん para "channel".
- Avisos y alertas de operaciones: mensajes como el ejemplo de la model card ("倉庫から届くMQTTの通信量が急に増えました。") pueden locutarse con la sigla correcta, útil en sistemas de monitorización con salida de voz.
- Asistentes de voz internos en entornos de trabajo japonés: la lista curada de unas 450 palabras de producto, plataforma y entorno laboral cubre vocabulario corporativo recurrente (reuniones, herramientas ofimáticas, plataformas).
- Audiolibros y narración de textos literarios: la mejora en kanji poco frecuentes ataca directamente los errores de lectura de on'yomi y kun'yomi en vocabulario culto, con ejemplos verificados sobre 屡々, 踵, 樋 y 百舌鳥.
- Locución de material didáctico y de formación: contenidos que mezclan japonés con anglicismos (violin, interview, designer) se pronuncian de forma consistente, sin que el oyente tenga que reinterpretar la lectura.
- Clonación de voz para un locutor concreto: usando `--ref-wav` con una muestra de referencia se puede mantener un timbre corporativo en toda la producción, mientras el frontend corrige la terminología técnica.
- Integración en pipelines de CI con `--show-changes`: permite auditar qué reescrituras se aplicarían a un texto antes de generar audio, útil para validar glosarios propios de un cliente.
- Prototipado sin instalación: el Space comparativo permite escuchar la diferencia entre Irodori-TTS-v4.1-Small, la variante Yomi y este modelo antes de desplegar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; el modelo es un TTS y las evaluaciones del autor miden exactitud de lectura. Cada cifra es el número de generaciones cuya lectura fue verificada como correcta por dos reconocedores de voz, con 6 o 9 generaciones por término y variando frase, semilla y voz:

| Término | Lectura esperada | Sin frontend | Este modelo |
|---|---|---|---|
| schedule | スケジュール | 0/6 | 6/6 |
| calendar | カレンダー | 0/6 | 5/6 |
| violin | バイオリン | 0/6 | 6/6 |
| interview | インタビュー | 0/6 | 6/6 |
| designer | デザイナー | 0/6 | 6/6 |
| LinkedIn | リンクトイン | 0/6 | 6/6 |
| Netflix | ネットフリックス | 2/6 | 6/6 |
| MQTT | エムキューティーティー | 0/3 | 3/3 |
| Wireshark (no está en diccionario) | ワイヤーシャーク | 0/9 | 9/9 |
| Audible (no está en diccionario) | オーディブル | 0/9 | 9/9 |

Lecturas de kanji, comparando Irodori-TTS-v4.1-Small con este modelo (transcripciones ASR de la palabra objetivo):

| Texto (palabra objetivo subrayada en el original) | Irodori-TTS-v4.1-Small | Este modelo |
|---|---|---|
| 我輩は屡々世界の人としての日本人の覚悟に関して述ぶるところがあった。 | ルルル | シバシバ |
| フランツは何と思ってか、そのまま踵を旋らして、自分の住んでいる村の方へ帰った。 | カカト | キビス |
| ひとりの男が、長い樋をつたって、だんだん下へおりてくるのです。 | ヒ | トイ |
| 百舌鳥の声が喧しい程城内に交錯している。 | ヨモゾリ | モズ |

No se publican métricas objetivas de calidad de audio (MOS, similitud de hablante) ni de latencia.

## Requisitos de hardware

- El repositorio ocupa 3,1 GB, correspondiente al checkpoint en safetensors; el frontend de lectura añade unos 31 MB en metadatos.
- No se publican cifras de VRAM necesaria para inferencia en la información disponible.
- El script de inferencia admite explícitamente dos rutas: CPU (`uv sync --extra cpu`) y CUDA 12.8 (`uv sync --extra cu128`), por lo que existe soporte de ejecución sin GPU.
- El runtime permite asignar dispositivos distintos al modelo y al codec (`model_device`, `codec_device`), lo que facilita repartir carga entre GPU y CPU.
- No hay datos publicados sobre GPU recomendadas, ni confirmación de que quepa en tarjetas de consumo; el nombre "Small" del modelo base sugiere un tamaño contenido, pero no se aporta el recuento de parámetros.
- Opciones de despliegue documentadas: el código de inferencia de Aratako/Irodori-TTS (script `infer.py` y API de Python `InferenceRuntime`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en general no cubren este tipo de pipeline TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Función diferencial | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Irodori-TTS-v4.1-Small (Aratako) | japonés | TTS base, sin ajuste de lectura | no disponible | no disponible en la información proporcionada | HuggingFace |
| Irodori-TTS-v4.1-Small-Yomi (takuma104) | japonés | Mejora de lectura de kanji (on'yomi/kun'yomi, palabras raras) | mismos 714 tensores que este modelo | no disponible en la información proporcionada | HuggingFace |
| Irodori-TTS-v4.1-Small-Yomi-Tech-tuned (j-llm) | japonés | Yomi más frontend de lectura de términos técnicos e ingleses dentro del safetensors | idénticos a Yomi; +31 MB de frontend | other (mit-and-cc-by-sa-4.0) | HuggingFace |

No se dispone de datos de benchmarks ni de licencias de los dos modelos base en la información proporcionada, por lo que la comparación se limita a la función diferencial y al empaquetado de los pesos.

## Limitaciones y advertencias

- El frontend solo actúa sobre secuencias de letras latinas; el texto japonés que las rodea no se modifica, lo que limita su alcance a términos escritos en alfabeto latino.
- Las palabras que no están en el diccionario dependen del lector katakana, que solo se aplica con al menos un 95 % de confianza; por debajo de ese umbral el comportamiento documentado es un deletreo (spell-out) cuyo detalle queda truncado en la model card disponible.
- Existe riesgo de lectura inventada cuando ni el diccionario ni el lector cubren un término; la propia model card documenta ese fallo en el modelo sin frontend (すーじゅー, ちゃーれん, ちぇきっと).
- La evaluación presentada es del propio autor, con 6 o 9 generaciones por término y verificación mediante dos reconocedores ASR; no es una evaluación independiente ni cubre un vocabulario amplio de forma sistemática.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es prácticamente nula.
- Discrepancia de identificadores: las instrucciones de descarga de la model card usan `pentacoxian-dev/Irodori-TTS-v4.1-Small-Yomi-Tech-tuned`, mientras que el ID del repositorio consultado es `j-llm/Irodori-TTS-v4.1-Small-Yomi-Tech-tuned`. Conviene verificar cuál es el artefacto vigente antes de integrarlo en producción.
- La licencia declarada es `other` con `license_name: mit-and-cc-by-sa-4.0`; CC-BY-SA-4.0 impone atribución y compartir igual, de modo que hay que revisar el archivo LICENSE y las condiciones del modelo base antes de un uso comercial.
- No se publican datos sobre sesgos, ni sobre comportamiento en idiomas distintos del japonés, ni sobre calidad de audio en dominios fuera de los evaluados.
- Al ser un modelo TTS, no es adecuado para tareas de razonamiento, código, tool calling o agentes; esas capacidades no están soportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/j-llm/Irodori-TTS-v4.1-Small-Yomi-Tech-tuned
- Modelo base (ajuste de lectura de kanji): https://huggingface.co/takuma104/Irodori-TTS-v4.1-Small-Yomi
- Modelo base original: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Código de inferencia Irodori-TTS: https://github.com/Aratako/Irodori-TTS
- Demo comparativa (Space): https://huggingface.co/spaces/pentacoxian-dev/Irodori-TTS-Compare
- Ruta alternativa de descarga citada en la model card: https://huggingface.co/pentacoxian-dev/Irodori-TTS-v4.1-Small-Yomi-Tech-tuned
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a páginas sobre la letra "J" y no guardan relación con el modelo.

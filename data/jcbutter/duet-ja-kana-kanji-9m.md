# jcbutter/duet-ja-kana-kanji-9m

## Resumen

duet-ja-kana-kanji-9m es un modelo de conversión de lectura en kana a kanji (kana-kanji conversion) para teclados japoneses en dispositivo (on-device). Lo desarrolla jcbutter y se publica bajo licencia CC BY-SA 4.0. Resuelve un problema muy concreto dentro del procesamiento del japonés: transformar una cadena de katakana (la lectura fonética) en el texto japonés correcto con kanji y kana mezclados, que es la operación central de cualquier IME (input method editor) japonés.

El modelo es un decoder estilo GPT-2 de tan solo 9 millones de parámetros, con 4 capas, dimensión oculta de 384, 6 cabezas de atención y un vocabulario de 6.000 tokens. Reutiliza el formato de prompt y el tokenizador de la familia zenz de Miwa-Keita, y se ha destilado a partir de zenz-v3.2-small. Su interés actual reside en que demuestra que un modelo de conversión kana-kanji competitivo puede caber en un espacio mínimo y ejecutarse en el propio dispositivo mediante ExecuTorch, sin depender de la nube.

La relevancia práctica es la privacidad y la latencia: al ejecutarse localmente, el texto que el usuario teclea no sale del dispositivo. El modelo se distribuye como un state dict fp32 (`9m-wide.pt`) y no incluye el tokenizador, que debe tomarse de zenz-v3.2-small-gguf.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo GPT-2 (4 capas, 384 de dimensión, 6 cabezas) |
| Parametros totales | 9M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (state dict); exportación int8 prevista vía ExecuTorch (puntuaciones no verificadas tras la exportación) |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch state dict (`9m-wide.pt`); tag executorch para despliegue on-device |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de tipo GPT-2 con 4 capas, dimensión de 384, 6 cabezas de atención y un vocabulario reducido de 6.000 tokens. Usa el mismo tokenizador y el mismo formato de prompt que la familia zenz: `U+EE02 + contexto + U+EE00 + lectura en katakana + U+EE01`, seguido de la salida y el token de fin de secuencia `</s>` (id 3). Esta elección permite reutilizar directamente el tokenizador de zenz-v3.2-small-gguf sin copiarlo en el repositorio.

El entrenamiento se realizó en cuatro etapas sobre un único modelo de 9M, cada una partiendo de la anterior: primero solo texto sobre pares slm-ime y filas de Bluesky (4,7M filas); después destilación con el profesor a media temperatura desde zenz-v3.2-small (2M filas); a continuación solo texto sobre una mezcla mayor (6,8M filas); y finalmente otra ronda de destilación a media temperatura (2M filas). Los datos de entrenamiento derivan de Wikipedia japonesa, Common Crawl mediante llm-jp-corpus-v3, pares kana-kanji de oogasawa/fcitx5-slm-ime (procedentes de Wikipedia y FineWeb2) y aproximadamente 125.000 publicaciones públicas de Bluesky con identificadores eliminados.

## Capacidades

- Conversión kana-kanji: transforma una lectura en katakana en texto japonés con la mezcla correcta de kanji y kana, que es la función principal de un IME.
- Conversión contextual: el prompt incluye un campo de contexto previo, de modo que la conversión puede condicionarse al texto ya escrito por el usuario.
- Ejecución on-device: etiquetado para ExecuTorch, pensado para inferencia local en el teclado sin conexión de red.
- Modelo compacto: 9M parámetros y 6.000 tokens de vocabulario, adecuado para dispositivos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente japonés.

## Casos de uso

- Teclado japonés en dispositivo: el modelo se integra en un IME local para convertir la lectura en katakana que teclea el usuario en kanji, manteniendo el texto en el dispositivo y evitando enviarlo a un servidor.
- Aplicaciones móviles con requisitos de privacidad: al ejecutarse con ExecuTorch, permite ofrecer conversión kana-kanji en apps que no pueden externalizar el texto del usuario por motivos regulatorios o de confidencialidad.
- Entrada de texto en entornos sin conectividad: útil en dispositivos sin red o con conectividad intermitente, donde un IME basado en nube no estaría disponible.
- Sistemas embebidos y de bajo consumo: sus 9M parámetros permiten desplegarlo en hardware con memoria y cómputo muy limitados, donde modelos de mayor tamaño no caben.
- Prototipado e investigación en IME: sirve como punto de partida para experimentar con destilación y con el formato de prompt zenz sin requerir infraestructura de GPU.
- Evaluación comparativa de conversión kana-kanji: puede usarse como línea base ligera frente a modelos mayores de la familia zenz en conjuntos como AJIMEE-Bench.

## Benchmarks y rendimiento

Resultados con decodificación greedy en fp32, según la model card:

| Conjunto de prueba | Exact | CER |
|---|---:|---:|
| Bluesky held-out, 847 filas | 61,5% | 7,64% |
| AJIMEE-Bench, 200 filas | 57,0% | 7,60% |

Referencia del profesor zenz-v3.2-xsmall en solitario, según la model card:

| Conjunto de prueba | Exact | CER |
|---|---:|---:|
| Bluesky | 63,9% | 7,05% |
| AJIMEE-Bench | 69,5% | 5,64% |

Las puntuaciones no se han verificado tras la exportación a int8.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 9M parámetros en fp32 el peso ocupa aproximadamente 36 MB, y en int8 alrededor de 9 MB (estimación a partir del número de parámetros).
- GPU recomendadas: no se especifican; por tamaño, la inferencia cabe en cualquier GPU consumer e incluso en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual; el objetivo declarado es la ejecución on-device, no la GPU de servidor.
- Opciones de despliegue: ExecuTorch (etiqueta del repositorio); el formato de pesos es un state dict de PyTorch cargado con `Student(SIZES["9m-wide"])` desde `student.py`. No se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exact (Bluesky) | Exact (AJIMEE) | Licencia |
|---|---|---:|---:|---:|---|
| duet-ja-kana-kanji-9m | 9M | no disponible | 61,5% | 57,0% | CC BY-SA 4.0 |
| zenz-v3.2-xsmall | no disponible | no disponible | 63,9% | 69,5% | no disponible |
| zenz-v3.2-small (profesor) | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de zenz-v3.2-xsmall provienen de la model card de duet-ja-kana-kanji-9m. Para zenz-v3.2-small no se han publicado resultados en la información disponible.

## Limitaciones y advertencias

- Ámbito restringido: solo realiza conversión kana-kanji en japonés; no es un modelo de propósito general.
- Rendimiento inferior al profesor en AJIMEE-Bench: 57,0% frente a 69,5% de exact de zenz-v3.2-xsmall, una diferencia de 12,5 puntos.
- Puntuaciones no verificadas en int8: la model card indica que los resultados no se han comprobado tras la exportación a int8.
- Reproducción de texto de entrenamiento: el modelo puede reproducir cadenas cortas de su texto de entrenamiento.
- Licencia CC BY-SA 4.0: impone atribución y compartir bajo la misma licencia, lo que condiciona el uso comercial y la distribución de derivados.
- Dependencia externa del tokenizador: el tokenizador no está incluido en el repositorio y debe tomarse de zenz-v3.2-small-gguf.
- Sin datos de sesgos específicos, contexto máximo ni latencia en la información disponible.
- Advertencia de licencias de las fuentes: deben revisarse los términos de Wikipedia, Common Crawl, FineWeb2 y Bluesky antes de reutilizar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcbutter/duet-ja-kana-kanji-9m
- Modelo base / profesor: https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
- Modelo base del profesor: https://huggingface.co/ku-nlp/gpt2-small-japanese-char
- Pares kana-kanji de entrenamiento: https://huggingface.co/oogasawa/fcitx5-slm-ime
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- AJIMEE-Bench (azooKey): no disponible como enlace en la información proporcionada

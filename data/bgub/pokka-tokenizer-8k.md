# bgub/pokka-tokenizer-8k

## Resumen

Pokka multilingual tokenizer 8k es un tokenizador BPE a nivel de byte con un vocabulario de 8.192 tokens, disenado especificamente para sistemas de texto a voz (TTS) multilingues. Lo desarrolla el usuario bgub en el contexto del proyecto Pokka y se publica bajo licencia MIT. No es un modelo de lenguaje ni un modelo de sintesis de voz: es unicamente el componente de tokenizacion, pensado para ser integrado en un modelo TTS que aun no se ha entrenado ni evaluado publicamente.

El tokenizador cubre 30 idiomas con 10 millones de caracteres fuente por idioma (300 millones en total) extraidos de revisiones fijadas de FineWeb y FineWeb2. Incorpora un diseno poco habitual: ademas del flujo BPE estandar sobre texto ordinario, incluye un frontend de pronunciacion para chino mandarin (pinyin con tonos lexicos), japones (lecturas UniDic) y coreano (descomposicion en jamo posicionales), lo que permite codificar spans de pronunciacion en lugar de grafias.

Es relevante ahora porque aborda un problema especifico de los TTS multilingues: la necesidad de representar la pronunciacion de lenguas con escrituras no alfabeticas sin depender de un unico modelo fonetico externo. Su estado es experimental: el propio autor advierte que no se ha evaluado en un modelo TTS entrenado y que el frontend de pronunciacion es preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE a nivel de byte (byte-level BPE) con frontend de pronunciacion opcional para CJK |
| Parametros totales | no disponible (es un tokenizador, no un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no es un modelo generativo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | 30: arb_Arab, ben_Beng, ces_Latn, cmn_Hani, deu_Latn, ell_Grek, eng_Latn, fas_Arab, fra_Latn, heb_Hebr, hin_Deva, ind_Latn, ita_Latn, jpn_Jpan, kor_Hang, mar_Deva, nld_Latn, pol_Latn, por_Latn, ron_Latn, rus_Cyrl, spa_Latn, swh_Latn, tam_Taml, tel_Telu, tha_Thai, tur_Latn, ukr_Cyrl, urd_Arab, vie_Latn |
| Licencia | MIT (tokenizador y codigo original); corpus FineWeb/FineWeb2 bajo ODC-By 1.0; inventario de letras de Unicode CLDR 48 |
| Formato de pesos | tokenizer.json (formato Hugging Face), pinyin-bpe.json y scripts Python auxiliares |
| Tamano de vocabulario | 8.192 tokens |

## Arquitectura y entrenamiento

El vocabulario se reparte en 4 tokens de control, 256 tokens de alfabeto de bytes, 27 letras de pinyin, 306 merges aprendidos de pinyin, 5 tokens de tono lexico, 93 tokens de kana, 67 tokens de jamo, 1.957 letras no ASCII garantizadas, 43 prefijos UTF-8 de letras y 5.434 merges ordinarios aprendidos. El alfabeto de 256 bytes garantiza cobertura de cualquier texto Unicode valido tras normalizacion NFC, sin token desconocido; se trata de BPE a nivel de byte real, no del byte-fallback de SentencePiece.

El entrenamiento uso 10 millones de caracteres fuente normalizados en NFC por cada uno de 30 idiomas, mas 100.000 caracteres reservados por idioma. Los documentos se limitaron a 12.000 caracteres, se deduplicaron por hash del texto normalizado y se muestrearon secuencialmente de los shards fuente. Los merges se aprendieron sobre 27 idiomas de texto ordinario mas mandarin; el texto Han se convirtio a pinyin con espacios de nombres antes del entrenamiento, con cada silaba como unidad de merge independiente. El kana japones y los jamo posicionales coreanos son inventarios fijos, por lo que sus corpus no generan merges adicionales. No se emiten tokens de identificacion de idioma.

El frontend de pronunciacion (`cjk_tokenizer.py`) es opcional y no se invoca desde el tokenizador estandar de Hugging Face: requiere enrutado explicito de spans `zh`, `ja` y `ko` para resolver la ambiguedad de la escritura Han. El pinyin ocupa un espacio de nombres dedicado separado del latin ordinario, y cada silaba termina en uno de cinco tokens de tono lexico fijos que no se fusionan. No se incluye modelo de sandhi tonal ni de acento tonal japones. La codificacion de pronunciacion es con perdida respecto a la grafia original.

## Capacidades

- Tokenizacion BPE a nivel de byte de texto multilingue en 30 idiomas, con cobertura completa de Unicode tras normalizacion NFC y sin token desconocido.
- Cobertura individual de 2.009 letras y marcas combinantes derivadas de CLDR (incluidas 52 letras ASCII ya presentes en el alfabeto de bytes), que ademas pueden fusionarse en piezas mayores.
- Frontend de pronunciacion para mandarin: conversion de caracteres Han a pinyin con espacio de nombres propio y tonos lexicos (tono neutro codificado como 5).
- Frontend de pronunciacion para japones basado en lecturas UniDic.
- Frontend de descomposicion en jamo posicionales para coreano (no es un frontend fonologico completo).
- Enrutado explicito de spans de texto frente a spans de pronunciacion mediante la API `encode_spans`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo generativo.
- No incluye tokens de identificacion de idioma.

## Casos de uso

- Integracion en un pipeline TTS multilingue como capa de tokenizacion de entrada: el modelo acustico recibe secuencias de tokens del vocabulario Pokka en lugar de grafemas, lo que permite cubrir 30 idiomas con un unico vocabulario de 8.192 entradas.
- Sintesis de mandarin con control de tono: el frontend de pinyin convierte caracteres Han en silabas con tokens de tono lexico, de modo que el modelo TTS puede aprender la relacion entre tono y contorno de F0 sin un lexico fonetico externo en tiempo de inferencia.
- Preprocesado de corpus TTS multilingues: el tokenizador puede normalizar y tokenizar grandes volumenes de texto de FineWeb o de corpus propios para construir datasets de entrenamiento alineados con el vocabulario del modelo acustico.
- Prototipado de sistemas TTS para japones y coreano: el inventario fijo de kana y jamo posicionales permite una representacion determinista de estas escrituras sin depender de merges aprendidos sobre corpus limitados.
- Investigacion en representaciones foneticas para TTS: el repositorio incluye `report.json` y `evaluation.json` con comprobaciones de vocabulario, silabas pinyin, unidades fijas y roundtrips de las 11.172 silabas Hangul modernas, utiles para reproducir o extender el diseno.
- Evaluacion comparativa de tokenizadores para TTS: los datos de `evaluation.json` comparan recuentos de tokens frente al piloto anterior de 1 millon de caracteres por idioma, lo que sirve como referencia metodologica (el autor advierte que secuencias mas cortas no implican mejor pronunciacion).
- Migracion de embeddings en un modelo TTS existente: los IDs de token difieren del piloto y de Pocket TTS, por lo que el tokenizador sirve para planificar una migracion explicita de la matriz de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye validaciones internas (`report.json`) con comprobaciones de asignacion de vocabulario, 2.009 comprobaciones de caracteres individuales, 426 comprobaciones de silabas pinyin, 165 comprobaciones de unidades fijas y roundtrips de las 11.172 silabas Hangul modernas, pero no resultados de calidad TTS ni comparaciones con otros tokenizadores en tareas de sintesis.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el tokenizador es codigo Python que se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica para el tokenizador; la GPU dependera del modelo TTS que lo consuma.
- Cabe en cualquier maquina con Python y `transformers` instalado; el frontend CJK requiere ademas las dependencias de `requirements.txt` del repositorio.
- Opciones de despliegue: carga mediante `transformers.AutoTokenizer.from_pretrained("bgub/pokka-tokenizer-8k")`; el frontend CJK se importa desde `cjk_tokenizer.py` tras descargar el repositorio con `huggingface_hub.snapshot_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un tokenizador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Idiomas | Frontend de pronunciacion | Licencia | Formato |
|---|---|---|---|---|---|
| bgub/pokka-tokenizer-8k | 8.192 | 30 | Si (pinyin con tonos, UniDic japones, jamo coreano) | MIT | tokenizer.json + scripts |
| Tokenizadores SentencePiece de TTS multilingues | no disponible | no disponible | no disponible | no disponible | no disponible |
| Pocket TTS (tokenizador asociado) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos de otros tokenizadores comparables en la informacion proporcionada; la unica referencia concreta es el piloto anterior del mismo proyecto (1 millon de caracteres por idioma), cuyos IDs de token difieren y que se usa como base de comparacion en `evaluation.json`.

## Limitaciones y advertencias

- Es un tokenizador experimental, no un modelo TTS: el autor indica explicitamente que no se ha evaluado en un modelo TTS multilingue entrenado.
- El frontend de pronunciacion CJK es experimental, especialmente en nombres propios, numeros, puntuacion, espaciado y code-switching.
- La codificacion de pronunciacion es con perdida respecto a la grafia original; es necesario conservar el texto original externamente.
- Las lecturas de diccionario ausentes pueden provocar errores en el frontend, aunque la codificacion de texto bruto mantiene cobertura de bytes.
- No se incluye modelo de sandhi tonal ni de acento tonal japones; el coreano usa descomposicion en jamo, no un frontend fonologico completo.
- El tokenizador estandar de Hugging Face no invoca el frontend de pronunciacion automaticamente; requiere enrutado explicito de spans.
- Los IDs de token difieren del piloto y de Pocket TTS, lo que obliga a nuevos embeddings o a una migracion explicita.
- El repositorio no redistribuye los documentos web del corpus; solo los scripts de construccion, que esperan una estructura de directorio tipo Pokka y el corpus piloto previo.
- La licencia del tokenizador y del codigo original es MIT, pero los corpus FineWeb y FineWeb2 estan bajo ODC-By 1.0 y el contenido web subyacente puede tener derechos propios; el inventario de letras deriva de Unicode CLDR 48 bajo Unicode License.
- No se han publicado resultados de calidad TTS ni benchmarks comparativos; no hay evidencia publica de que secuencias de tokens mas cortas impliquen mejor pronunciacion.

## Enlaces

- Hugging Face: https://huggingface.co/bgub/pokka-tokenizer-8k
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Unicode CLDR release 48: https://github.com/unicode-org/cldr/tree/release-48/common/main

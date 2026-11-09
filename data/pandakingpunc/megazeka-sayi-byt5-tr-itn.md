# pandakingpunc/megazeka-sayi-byt5-tr-itn

## Resumen

Megazeka-Sayı es un adaptador LoRA sobre el modelo base `google/byt5-small` especializado en normalización inversa de texto (inverse text normalization, ITN) para turco. Su función concreta es convertir números escritos con letras en la salida de un sistema de reconocimiento automático del habla (ASR) a su representación numérica según las reglas ortográficas de la TDK (Türk Dil Kurumu). Por ejemplo, transforma "toplam bin iki yüz elli lira elli kuruş" en "toplam 1.250,50 TL", o "yüzde on iki buçuk indirim" en "%12,5 indirim". El modelo no modifica ningún otro elemento de la frase: solo actúa sobre las expresiones numéricas.

El reto principal que aborda es la desambiguación contextual de homógrafos en turco: "yedi" puede ser el número 7 o el verbo "comió"; "ona" puede ser "a él/ella" o "al diez"; "bin" puede ser "mil" o "montar"; "altında" puede ser "debajo" o "en el seis". Un enfoque basado en reglas sin contexto falla sistemáticamente en estos casos, mientras que este modelo, al ser un seq2seq entrenado sobre pares sintéticos, aprende a distinguirlos por el contexto de la oración.

El modelo se distribuye como adaptador PEFT (LoRA de r=16, 6,3 millones de parámetros entrenables) sobre ByT5-small, un modelo byte-level. Está pensado como postprocesador de pipelines ASR en turco y se publica con licencia MIT. El autor es Mustafa Karatüm. El repositorio tiene un tamaño de 0,0 GB y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5-small (encoder-decoder byte-level) + adaptador LoRA (r=16) |
| Parametros totales | No disponible (el adaptador LoRA tiene 6,3 M parametros entrenables; el total del modelo base ByT5-small no se indica en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como cifra explicita; la model card recomienda dar textos de menos de 190 bytes y dividir por frases |
| Tipos de cuantizacion | No disponible (se distribuye como adaptador safetensors en bf16) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT (adaptador); el modelo base google/byt5-small es Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/byt5-small`, un transformer encoder-decoder que opera directamente sobre bytes en lugar de tokens subword, lo que le permite manejar cualquier cadena de texto sin vocabulario fijo. Sobre él se aplica un adaptador LoRA con rango 16, que introduce 6,3 millones de parámetros entrenables en precisión bf16. La tarea es de traducción seq2seq: recibe la frase ASR con números escritos con letras y devuelve la misma frase con los números en forma numérica, preservando el resto del texto.

El entrenamiento se realizó sobre 69.991 pares sintéticos publicados en el dataset `pandakingpunc/megazeka-sayi-tr-itn-pairs`. Los datos se generaron en dirección inversa: primero se creaba el objetivo escrito (con números en cifra) y después se aplicaba un verbalizador determinista para obtener la entrada. Aproximadamente el 40 % de los ejemplos son frases que no deben modificarse, lo que enseña al modelo a no tocar homógrafos ni expresiones no numéricas. Se entrenaron 5.000 pasos con micro-lote 8 y acumulación 2, learning rate 5e-4 con scheduler coseno, en una RTX 4060 de 8 GB durante unos 31 minutos. El mejor checkpoint se registró en el paso 4.750. No se menciona RLHF ni DPO; el entrenamiento es supervisado sobre pares sintéticos.

## Capacidades

- Normalización inversa de números en turco: convierte cifras escritas con letras a formato numérico según las reglas de la TDK (punto de millar, coma decimal: `1.250,50`).
- Conversión de unidades monetarias: `lira` → `TL`, con manejo de kuruş y decimales.
- Porcentajes: `yüzde on iki buçuk` → `%12,5`.
- Horas y fechas: `saat on dört otuz` → `14.30`; `8 Kasım 2026`.
- Números de teléfono: secuencias de dígitos dictadas se agrupan en formato `0532 123 45 67`.
- Abreviaturas de unidades TDK: `kg`, `km`, `L`, `m²`, `°C`.
- Ordinales con sustantivo: `3. kat`.
- Sufijos según pronunciación con apóstrofo: `4'e`, `TL'ye`, `kg'dan`, `1990'larda`.
- Desambiguación contextual de homógrafos: `yedi` (7 / comió), `ona` (a él / al diez), `bin` (mil / montar), `altında` (debajo / en el seis).
- Preservación de texto no numérico: fracciones y expresiones idiomáticas se mantienen en palabras (`üçte bir`, `dört gözle`, `ikinci el`).
- No requiere prefijo ni instrucción: la entrada es directamente la frase.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Postprocesado de pipelines ASR en turco: el modelo se inserta como etapa final tras el reconocedor de voz para convertir las cifras dictadas en formato numérico antes de mostrar o almacenar la transcripción. Es adecuado porque su única tarea es la ITN y no altera el resto de la frase.
- Transcripción de llamadas de atención al cliente: en centros de soporte donde se dictan importes, fechas, números de teléfono o referencias, el modelo normaliza esos datos para que puedan extraerse con expresiones regulares o almacenarse en bases de datos estructuradas.
- Digitalización de actas y notas de voz: al transcribir reuniones o dictados donde se mencionan cantidades, porcentajes o fechas, el adaptador convierte esas expresiones a cifras para su posterior procesamiento automático.
- Procesamiento de pedidos y reservas por voz: en sistemas de pedidos telefónicos (cantidades, pesos, precios), el modelo produce salidas numéricas listas para validación y cálculo, reduciendo errores de interpretación.
- Normalización de datos financieros dictados: importes con liras y kuruş, porcentajes de descuento o tipos de interés se convierten a formato numérico estándar turco (`1.250,50 TL`, `%12,5`), lo que facilita su carga en sistemas contables.
- Enriquecimiento de corpus lingüísticos: para proyectos de investigación que necesitan pares texto-número alineados a partir de transcripciones ASR, el modelo genera la versión normalizada de forma automática y consistente.
- Preprocesado para TTS o subtitulado: antes de sintetizar voz o generar subtítulos, las cifras pueden normalizarse a un formato uniforme para garantizar una lectura correcta.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo con una línea base de reglas sin contexto:

| Conjunto | Reglas sin contexto (exact match) | Megazeka-Sayı v1.0 (exact match) |
|---|---:|---:|
| Conjunto oculto escrito a mano (50 frases) | 56,0 % | 94,0 % |
| Mismas frases, conversiones incorrectas (21 frases que no debían cambiar) | 52,4 % | 9,5 % |
| Conjunto de test generado (2.000, plantillas disjuntas) | 59,2 % | 93,8 % (94,2 % sin filtro de protección) |
| Mismo conjunto, conversiones incorrectas (802) | 46,8 % | 2,1 % |

El conjunto oculto escrito a mano es el más representativo, ya que no se vio durante la generación de datos de esta versión. El autor advierte que en el primer conjunto de 100 frases escritas a mano se alcanza un 99 %, pero esa cifra está inflada porque el modelo se desarrolló corrigiendo errores de ese conjunto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (6,3 M de parámetros entrenables); el coste real lo determina el modelo base ByT5-small.
- Entrenamiento realizado en una RTX 4060 de 8 GB en aproximadamente 31 minutos, lo que indica que la inferencia cabe holgadamente en GPU de consumo.
- VRAM estimada para inferencia: no disponible como cifra exacta; por el tamaño del modelo base y el uso de bf16, es previsible que quepa en GPUs de consumo con 8 GB o menos, aunque no se confirma en la información.
- GPUs recomendadas: no disponible de forma explícita; el propio autor usó una RTX 4060 para el entrenamiento.
- Despliegue: la model card muestra uso con `transformers` (`AutoModelForSeq2SeqLM`) y `peft` (`PeftModel`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Recomendación operativa: dividir las entradas de más de 190 bytes en frases y aplicar el filtro de protección del repositorio de GitHub, que alinea la salida con la entrada palabra por palabra y revierte los cambios en zonas no numéricas.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables de ITN para turco en la información proporcionada. La única comparación publicada es contra una línea base de reglas sin contexto, incluida en la sección de benchmarks.

| Modelo | Tipo | Idioma | Enfoque | Exact match (conjunto oculto) | Licencia |
|---|---|---|---:|---:|---|
| Megazeka-Sayı v1.0 | ByT5-small + LoRA | Turco | Seq2seq con contexto | 94,0 % | MIT |
| Línea base de reglas sin contexto | Reglas | Turco | Determinista, sin contexto | 56,0 % | No aplica |

## Limitaciones y advertencias

- Errores conocidos documentados por el autor: en imperativos cortos, "bin" se convierte erróneamente en `1.000` (`taksiye bin de gel`); al inicio de frase, "ikinci el" se convierte en `2. el`; en medidas compuestas, `üç kilo iki yüz gram` se convierte en `3,200 g`.
- Los datos de entrenamiento son totalmente sintéticos; el modelo no se ha probado con errores de reconocimiento reales de ASR, por lo que su robustez ante transcripciones ruidosas es incierta.
- Riesgo de conversiones incorrectas en homógrafos no cubiertos por el conjunto de entrenamiento, especialmente en contextos ambiguos o poco frecuentes.
- El conjunto de evaluación principal es sintético y el conjunto oculto escrito a mano es pequeño (50 frases), lo que limita la generalización de las métricas publicadas.
- Recomendación de uso con filtro de protección: sin él, el modelo puede alterar palabras no numéricas; el filtro del repositorio de GitHub revierte esas modificaciones.
- Limitación de longitud: se recomienda no superar los 190 bytes por entrada y dividir por frases.
- Solo soporta turco; no se documentan otros idiomas.
- Licencia MIT para el adaptador, pero el modelo base `google/byt5-small` es Apache-2.0, por lo que deben respetarse ambas condiciones en uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pandakingpunc/megazeka-sayi-byt5-tr-itn
- Dataset de entrenamiento: https://huggingface.co/datasets/pandakingpunc/megazeka-sayi-tr-itn-pairs
- Repositorio de código: https://github.com/pandakingpunc/megazeka-sayi
- Especificación de reglas de escritura: https://github.com/pandakingpunc/megazeka-sayi/blob/main/docs/SPEC.md
- Modelo base: https://huggingface.co/google/byt5-small

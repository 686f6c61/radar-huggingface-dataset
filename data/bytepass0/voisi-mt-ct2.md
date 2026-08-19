# bytepass0/voisi-mt-ct2

## Resumen

El repositorio `bytepass0/voisi-mt-ct2` no es un modelo único, sino un paquete de conversiones CTranslate2 en formato int8 de varios modelos de traducción automática neuronal (NMT) de código abierto, empaquetados para el motor de traducción Voisi. Incluye quince directorios, cada uno con un modelo convertido y sus ficheros de tokenización (SentencePiece/vocabulario), de modo que el runtime no necesita descargar los repositorios originales. Los modelos upstream provienen de dos familias principales: los modelos MarianMT de Helsinki-NLP (OPUS-MT) y los modelos Indictrans2 de AI4Bharat. La conversión a CTranslate2 int8 reduce el tamaño y acelera la inferencia en CPU y GPU, manteniendo una calidad de traducción cercana a la de los modelos originales. Es relevante para desarrolladores que necesitan un conjunto de modelos de traducción listos para producción, con licencias permisivas (MIT, Apache-2.0, CC-BY-4.0) y sin dependencias externas en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT e Indictrans2) |
| Parametros totales | No disponible (varía por submodelo; los Indictrans2-dist tienen 200M, los MarianMT varían entre ~70M y ~300M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | Inglés ↔ alemán, español, italiano, neerlandés, ruso, chino, árabe, vietnamita, francés, portugués, turco, japonés; inglés ↔ idiomas indios (indic); multilingüe a inglés (mul-en) |
| Licencia | Repositorio: other; submodelos: MIT, Apache-2.0, CC-BY-4.0 (según upstream) |
| Formato de pesos | CTranslate2 (binario) |

## Arquitectura y entrenamiento

Los modelos incluidos son redes transformer encoder-decoder, típicas de la traducción automática neuronal. Los modelos de Helsinki-NLP (OPUS-MT) son MarianMT, entrenados con el framework Marian sobre datos de OPUS, con arquitecturas base (~6 capas, ~70M parámetros) o big (~12 capas, ~300M parámetros) según el par. Los modelos Indictrans2 de AI4Bharat son también transformer encoder-decoder, con variantes "dist" de 200M parámetros, entrenados para traducción entre inglés y 22 idiomas indios. No se dispone de detalles sobre el entrenamiento de las conversiones CTranslate2, que son meras transformaciones de los pesos originales a formato int8, sin reentrenamiento. La cuantización int8 reduce la precisión de los pesos y activaciones, pero suele mantener una calidad aceptable para traducción.

## Capacidades

- Traducción automática neuronal entre inglés y múltiples idiomas europeos y asiáticos (alemán, español, italiano, neerlandés, ruso, chino, árabe, vietnamita, francés, portugués, turco, japonés).
- Traducción entre inglés e idiomas indios (indic) en ambas direcciones, gracias a los modelos Indictrans2.
- Traducción multilingüe a inglés mediante el modelo `mul-en`, que acepta múltiples idiomas de origen.
- Inferencia eficiente en CPU y GPU gracias a la cuantización int8 y al formato CTranslate2.
- Empaquetado autocontenido: cada directorio incluye los ficheros de tokenización necesarios, sin dependencias externas en tiempo de ejecución.
- No incluye capacidades de generación libre, razonamiento, tool calling ni agentes; es exclusivamente para traducción.

## Casos de uso

- Motor de traducción para aplicaciones de escritorio o web: el paquete puede integrarse en un servicio de traducción que cargue los modelos CTranslate2 y ofrezca traducción instantánea entre los idiomas soportados, con baja latencia gracias a int8.
- Traducción de contenido multilingüe en plataformas de comercio electrónico: permite traducir descripciones de productos, reseñas y atención al cliente entre inglés y los idiomas cubiertos, usando el modelo `mul-en` para entradas multilingües.
- Traducción de documentos técnicos o legales: los modelos MarianMT son adecuados para textos formales, y la cuantización int8 permite desplegarlos en servidores con recursos limitados.
- Traducción en tiempo real para chat o soporte al cliente: al ser modelos pequeños, pueden ejecutarse en CPU con latencia de milisegundos, facilitando la traducción de mensajes en vivo.
- Traducción de subtítulos o transcripciones: el formato CTranslate2 permite integración con pipelines de procesamiento de vídeo o audio, traduciendo grandes volúmenes de texto de forma eficiente.
- Traducción de contenido generado por usuarios en redes sociales o foros: los modelos cubren idiomas como árabe, vietnamita o ruso, útiles para moderación y localización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los modelos upstream (MarianMT e Indictrans2) tienen métricas BLEU publicadas en sus respectivos repositorios, pero no se proporcionan aquí. La conversión int8 puede degradar ligeramente la calidad respecto a los modelos en fp32, pero no hay datos cuantitativos en este repositorio.

## Requisitos de hardware

- Al ser modelos de tamaño pequeño a mediano (200M o menos), la inferencia puede ejecutarse en CPU con memoria RAM suficiente (menos de 1 GB por modelo en int8).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar estos modelos; una NVIDIA T4, GTX 1650 o superior es suficiente.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, etc., sin problemas.
- Opciones de despliegue: CTranslate2 ofrece bindings para Python y C++, y puede integrarse con servidores de inferencia como FasterTransformer o Triton. También es posible usar llama.cpp u Ollama, pero no es el formato nativo; se recomienda usar CTranslate2 directamente.
- Latencia y throughput: no se proporcionan datos, pero los modelos MarianMT base suelen traducir decenas de frases por segundo en CPU moderna; la cuantización int8 acelera aún más.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| voisi-mt-ct2 (este) | Varía (200M máx.) | No disponible | Mixta (MIT, Apache-2.0, CC-BY-4.0) | CTranslate2 int8 | ~20 pares |
| Helsinki-NLP/opus-mt-en-es | ~70M | No disponible | Apache-2.0 | MarianMT (safetensors) | en-es |
| AI4Bharat/indictrans2-en-indic-dist-200M | 200M | No disponible | MIT | MarianMT (safetensors) | en-indic |
| Facebook NLLB-200-distilled-600M | 600M | 512 | CC-BY-NC-4.0 | safetensors | 200 idiomas |

La comparativa muestra que este paquete ofrece una colección de modelos ya convertidos a int8, lo que facilita el despliegue, pero no supera en cobertura a NLLB, que cubre 200 idiomas aunque con licencia no comercial. Para uso comercial, los modelos de este repositorio son más permisivos (MIT y Apache-2.0 en su mayoría).

## Limitaciones y advertencias

- El repositorio no especifica la licencia exacta del conjunto; cada submodelo conserva la de su upstream, por lo que hay que revisar cada directorio antes de usar comercialmente.
- Los modelos son exclusivamente de traducción; no soportan otras tareas de NLP.
- La cuantización int8 puede introducir pequeñas pérdidas de calidad en traducciones de dominios especializados o con vocabulario técnico.
- No se proporcionan datos de sesgos o alucinaciones; como cualquier modelo NMT, puede producir traducciones incorrectas o sesgadas en contextos sensibles.
- La cobertura de idiomas es limitada: no incluye muchos idiomas asiáticos o africanos, y el modelo `mul-en` solo traduce hacia inglés.
- No hay información sobre la longitud máxima de secuencia soportada; los modelos MarianMT suelen limitar a 512 tokens, pero no está confirmado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bytepass0/voisi-mt-ct2
- Upstreams:
  - ai4bharat/indictrans2-en-indic-dist-200M: https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M
  - ai4bharat/indictrans2-indic-en-dist-200M: https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M
  - Helsinki-NLP/opus-mt-en-de: https://huggingface.co/Helsinki-NLP/opus-mt-en-de
  - Helsinki-NLP/opus-mt-en-es: https://huggingface.co/Helsinki-NLP/opus-mt-en-es
  - Helsinki-NLP/opus-mt-en-it: https://huggingface.co/Helsinki-NLP/opus-mt-en-it
  - Helsinki-NLP/opus-mt-en-nl: https://huggingface.co/Helsinki-NLP/opus-mt-en-nl
  - Helsinki-NLP/opus-mt-en-ru: https://huggingface.co/Helsinki-NLP/opus-mt-en-ru
  - Helsinki-NLP/opus-mt-en-zh: https://huggingface.co/Helsinki-NLP/opus-mt-en-zh
  - Helsinki-NLP/opus-mt-en-ar: https://huggingface.co/Helsinki-NLP/opus-mt-en-ar
  - Helsinki-NLP/opus-mt-en-vi: https://huggingface.co/Helsinki-NLP/opus-mt-en-vi
  - Helsinki-NLP/opus-mt-tc-big-en-fr: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-fr
  - Helsinki-NLP/opus-mt-tc-big-en-pt: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
  - Helsinki-NLP/opus-mt-tc-big-en-tr: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-tr
  - Helsinki-NLP/opus-tatoeba-en-ja: https://huggingface.co/Helsinki-NLP/opus-tatoeba-en-ja
  - Helsinki-NLP/opus-mt-mul-en: https://huggingface.co/Helsinki-NLP/opus-mt-mul-en

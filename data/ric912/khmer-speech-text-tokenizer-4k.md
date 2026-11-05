# ric912/khmer-speech-text-tokenizer-4k

## Resumen

El Khmer speech-text tokenizer 4k es un tokenizador de subpalabras para jemer (khmer), desarrollado por el usuario ric912 y publicado en HuggingFace. No es un modelo de lenguaje, sino un componente de tokenizacion basado en SentencePiece Unigram con un vocabulario de 4.000 entradas, entrenado sobre las transcripciones de un corpus de habla leida en jemer. Su proposito es convertir texto jemer en identificadores enteros estables y viceversa, de modo que distintos modelos y aplicaciones compartan exactamente la misma segmentacion y los mismos IDs.

El tokenizador se entreno con SentencePiece 0.2.2 sobre 108.242 frases unicas procedentes del Khmer ASR Cultural Dataset de Digital Divide Data (licencia CC BY-SA 4.0). El vocabulario combina 4 tokens especiales, 256 piezas de byte-fallback y 3.740 piezas aprendidas, de las cuales 3.714 son jemer, 23 son puntuacion o simbolos y 2 son joiners de ancho cero. La normalizacion es identidad: el texto se segmenta tal cual se recibe, sin limpieza de espacios ni normalizacion Unicode.

Es relevante para quien entrene modelos de voz o texto en jemer, un idioma de bajos recursos con escasa cobertura en tokenizadores multilingues genericos. Al publicar el vocabulario y los IDs de forma abierta, permite reproducir la segmentacion y reutilizarla en nuevos modelos de ASR o de lenguaje. El autor advierte explicitamente de que no es un modelo de pronunciacion ni un segmentador de palabras linguisticas: las piezas son unidades estadisticas del texto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece Unigram (tokenizador de subpalabras) |
| Parametros totales | no disponible (no es un modelo neuronal; vocabulario de 4.000 entradas) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | jemer (km) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | tokenizer.json (Hugging Face Tokenizers), tokenizer.model (SentencePiece), vocab.tsv |

## Arquitectura y entrenamiento

El tokenizador emplea el algoritmo SentencePiece Unigram con un vocabulario de 4.000 piezas, cobertura de caracteres 1.0, piezas de como maximo 6 caracteres, digitos divididos en caracteres individuales, piezas compuestas solo por espacios permitidas y byte-fallback activado. Se entreno con SentencePiece 0.2.2 sobre 108.242 frases unicas del Khmer ASR Cultural Dataset (Digital Divide Data, CC BY-SA 4.0). El archivo tokenizer.json se genero mediante una conversion exacta del modelo SentencePiece al formato de Hugging Face Tokenizers; ambos ficheros producen IDs identicos en todas las entradas probadas, salvo el caso de las cadenas literales de tokens especiales.

La normalizacion es identidad: no se aplica normalizacion Unicode, plegado de mayusculas ni limpieza de espacios. Se antepone un marcador de frontera de palabra (▁, U+2581) al texto y cada espacio se convierte en ▁, conservando espacios repetidos, iniciales y finales. Los caracteres sin pieza propia (tabuladores, saltos de linea, espacio de ancho cero, emoji, otras escrituras) se codifican como bytes UTF-8. La propiedad decode(encode(texto)) == texto se cumple en todas las cadenas probadas, incluidos vacios, solo espacios, caracteres de ancho cero y emoji, con la unica excepcion de las cadenas literales de tokens especiales. Las formas precompuestas y descompuestas del mismo caracter generan IDs distintos, por lo que conviene normalizar el texto antes de tokenizar.

## Capacidades

- Segmentacion de texto jemer en subpalabras y conversion a IDs enteros estables, con reconstruccion exacta del texto original.
- Byte-fallback UTF-8 para cualquier caracter sin pieza propia; el token `<unk>` no se produjo en las pruebas del autor.
- Manejo de emoji, caracteres de ancho cero, otras escrituras y cadenas vacias o compuestas solo por espacios.
- Dos implementaciones equivalentes: tokenizer.json (Tokenizers y Transformers) y tokenizer.model (SentencePiece).
- No anade tokens especiales al codificar: `<s>`, `</s>` y `<pad>` deben gestionarse externamente.
- No es un modelo de pronunciacion, ni un segmentador de palabras linguisticas, ni un tokenizador validado para texto jemer general.

## Casos de uso

- Entrenamiento de modelos ASR en jemer: el tokenizador define la capa de texto de un modelo de reconocimiento de voz sobre habla leida, con IDs estables que permiten comparar experimentos entre ejecuciones y equipos.
- Modelos de lenguaje en jemer de bajos recursos: sirve como vocabulario de entrada para preentrenar o ajustar modelos de texto en un idioma con poca cobertura en tokenizadores multilingues genericos.
- Analisis de segmentacion: permite medir y comparar como se fragmenta el texto jemer en distintas aproximaciones, ya que las piezas son unidades estadisticas reproducibles.
- Pipelines de transcripcion y subtitulado: al garantizar decode(encode(texto)) == texto, se puede tokenizar y reconstruir transcripciones sin perdida, incluidos espacios y caracteres especiales.
- Investigacion en linguistica computacional del jemer: el vocabulario publicado (vocab.tsv) permite estudiar la distribucion de piezas y la frecuencia de subpalabras en el corpus de entrenamiento.
- Integracion en aplicaciones de texto jemer: cualquier sistema que necesite una tokenizacion determinista y compartida puede cargar tokenizer.json con la libreria tokenizers sin codigo remoto.
- Reproducibilidad de experimentos: al publicar el vocabulario y los IDs, otros equipos pueden replicar exactamente la tokenizacion de un modelo ya entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; es un tokenizador, no un modelo neuronal. El repositorio ocupa 0,0 GB.
- GPU: no requiere GPU; la tokenizacion se ejecuta en CPU.
- Cabe en cualquier equipo: el vocabulario de 4.000 entradas y los ficheros asociados son de tamano minimo.
- Despliegue: libreria tokenizers (version verificada 0.23.2), transformers (5.22.1) o sentencepiece (0.2.2); no necesita codigo remoto.
- Latencia y throughput: no disponibles; al ser un tokenizador de subpalabras, la latencia es del orden de microsegundos por frase en CPU, sin datos medidos publicados.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocabulario | Idiomas | Licencia |
|---|---|---|---|---|
| ric912/khmer-speech-text-tokenizer-4k | SentencePiece Unigram | 4.000 | jemer | CC BY-SA 4.0 |
| Tokenizadores multilingues genericos (p. ej. los de familias LLM) | BPE o similar | decenas de miles a cientos de miles | decenas de idiomas | variable segun familia |
| Tokenizadores especificos de ASR en idiomas de bajos recursos | variable | variable | un idioma | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparacion se limita a tipo de algoritmo, tamano de vocabulario, cobertura idiomatica y licencia.

## Limitaciones y advertencias

- No es un modelo de pronunciacion ni un segmentador de palabras linguisticas; las piezas pueden partir silabas y palabras.
- No esta validado para texto jemer en general: se entreno solo con transcripciones de habla leida, con texto preparado en NFC, sin espacios de ancho cero, con espacios simples y numeros escritos como palabras jemer.
- Las formas precompuestas y descompuestas del mismo caracter producen IDs distintos; es necesario normalizar el texto (NFC) antes de tokenizar.
- Con tokenizer.json, las cadenas literales `<unk>`, `<s>`, `</s>` y `<pad>` se interpretan como tokens especiales y se eliminan al decodificar; hay que eliminarlas o escaparlas si la entrada puede contenerlas. SentencePiece las trata como caracteres normales.
- El tokenizador nunca emite `<pad>`; hay que gestionar el padding externamente (ID 3 o una fila propia).
- No anade `<s>` ni `</s>` al codificar; el modelo consumidor debe gestionarlos.
- La tabla de embeddings del modelo consumidor debe tener al menos 4.000 filas, incluidas las 256 piezas de byte.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia.
- Riesgo de sesgo derivado del corpus de entrenamiento: habla leida de un unico dataset, sin cobertura de registros coloquiales, dialectos o texto no preparado.

## Enlaces

- HuggingFace: https://huggingface.co/ric912/khmer-speech-text-tokenizer-4k
- Dataset de entrenamiento: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- SentencePiece: https://github.com/google/sentencepiece
- Libreria tokenizers de Hugging Face: https://github.com/huggingface/tokenizers

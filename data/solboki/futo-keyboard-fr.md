# solboki/futo-keyboard-fr

## Resumen

futo-keyboard-fr es un modelo de lenguaje de pequeno tamano (unos 33 millones de parametros) especializado en las funciones transformer del teclado FUTO Keyboard: prediccion de la siguiente palabra, correccion de erratas y ordenacion de candidatos de deslizamiento (swipe). Lo desarrolla Boris Solodki (usuario solboki) como modelo comunitario e independiente, ya que FUTO solo distribuye un modelo en ingles. Resuelve el hueco de soporte nativo en frances para un teclado que corre en Sailfish OS (port de HtheB) y, potencialmente, en Android.

La arquitectura es un transformer tipo Llama muy compacto: 8 capas, 512 dimensiones, 8 cabezas, feed-forward de 1536, RoPE y embeddings de entrada y salida atados, con una ventana de contexto de solo 256 tokens. Se entrena desde cero sobre texto frances (FineWeb-2, Wikipedia y OPUS-100) con una simulacion de escritura que introduce erratas AZERTY y palabras incompletas, y se distribuye como un unico GGUF Q6_K de 37 MB.

Es relevante ahora porque demuestra que un modelo de decenas de millones de parametros, entrenado en una sola GPU L4 durante unas 7 horas, puede ofrecer autocorreccion y prediccion util en un idioma distinto del ingles dentro del ecosistema FUTO, con licencia CC BY-SA 4.0 y un formato que el propio cargador del teclado puede leer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (8 capas, 512 dim, 8 cabezas, FFN 1536, RoPE, embeddings atados) |
| Parametros totales | 43.655.680 (segun safetensors); la model card indica aproximadamente 33 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | Q6_K (unico fichero publicado) |
| Idiomas soportados | frances (fr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (`fr_keyboard-0.2.0.gguf`, 37 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la misma disposicion y convenciones de metadatos que el modelo ingles de FUTO (`keyboardlm.features`: `base_v1 inverted_space xbu_char_autocorrect_v1 xc0_swipe_typing_v1 char_embed_mixing_v1`). Usa tokenizador SentencePiece BPE de 16.000 piezas con espacios sufijo, fallback de bytes y los tokens de control de FUTO (`<XBU>`, `<XBC>`, `<XEC>`, `<XC0>`, `<CHAR_A>` a `<CHAR_Z>`), embebidos en el propio GGUF. El contexto es de solo 256 tokens, suficiente para el caso de uso de teclado.

El entrenamiento parte de texto frances deduplicado y troceado en frases de tres palabras o mas: FineWeb-2 frances (unos 5.500 millones de caracteres), Wikipedia francesa (unos 1.500 millones) y la parte francesa de OPUS-100 (frases cortas de uso cotidiano, ponderadas cuatro veces). Un tercio de las palabras de la mayoria de frases se presentan como letras tecleadas seguidas de la palabra objetivo: la mitad exactas, un cuarto incompletas (solo primeras letras) y un cuarto con erratas AZERTY realistas. Los acentos se pliegan antes de convertirse en tokens `<CHAR_*>`, de modo que el modelo aprende `ete` como `été` y `coeur` como `cœur`. Se entrenaron 3.000 millones de tokens en una NVIDIA L4 durante unas 7 horas, con una perplejidad de validacion final de 28,6 sobre frases planas reservadas. La cuantizacion Q6_K se genero con la revision de llama.cpp incluida en FUTO Keyboard para garantizar compatibilidad con su cargador.

## Capacidades

- Prediccion de la siguiente palabra en frances, con sugerencias ordenadas (hasta top 3).
- Correccion de erratas y de palabras mal escritas, afinada para vecinos de teclado AZERTY.
- Completado de palabras incompletas a partir de las primeras letras (clave para el ranking de swipe).
- Ranking de candidatos de deslizamiento (swipe typing).
- Manejo de tokens de caracteres (`<CHAR_*>`) para modelar la escritura letra a letra.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de vision, audio ni modo thinking.
- Multilingue limitado: solo frances.

## Casos de uso

- Autocorreccion en teclado movil: el modelo corrige erratas mientras se escribe (`contnt` -> `content`, `demian` -> `demain`) con un 67 % de acierto en la primera sugerencia y un 81 % en el top 3, medido con el motor de prediccion de FUTO.
- Prediccion de siguiente palabra: sugiere la palabra mas probable tras una secuencia (`On se retrouve a quelle` -> `heure`, `vitesse`, `date`), con un 21 % de acierto en primera sugerencia y un 32 % en top 3 sobre 246 frases reservadas.
- Completado de palabras a medio escribir: cuando solo se ha tecleado la primera letra, acierta la palabra en el top 3 el 62 % de las veces (`Je travaille` + `p` -> `pour, par, pas`), lo que lo hace adecuado para el ranking de swipe.
- Integracion en Sailfish OS: se instala como `~/.local/share/futo-keyboard-sailfish/content/prediction/fr_keyboard.gguf` en el port de FUTO Keyboard de HtheB, aportando soporte frances donde antes solo habia ingles.
- Prototipado de teclados y editores: sirve como referencia para construir modelos de lenguaje de teclado en otros idiomas, replicando el pipeline de simulacion de escritura y los metadatos de FUTO.
- Investigacion sobre correccion ortografica de bajo coste: con 37 MB y contexto de 256 tokens, es un banco de pruebas ligero para estudiar trade-offs entre correccion de erratas y completado de palabras incompletas (v1 frente a v2).
- Despliegue en dispositivos con recursos muy limitados: al caber en cualquier movil moderno, puede ejecutarse localmente sin conexion dentro de una app de teclado.

## Benchmarks y rendimiento

Resultados medidos con el motor de prediccion propio de FUTO Keyboard sobre las mismas 246 frases reservadas para ambas versiones:

| Metrica | v1 | v2 (este modelo) |
|---|---|---|
| Siguiente palabra, primera sugerencia | 22 % | 21 % |
| Siguiente palabra, en top 3 | 35 % | 32 % |
| Errata corregida, primera sugerencia | 71 % | 67 % |
| Errata corregida, en top 3 | 86 % | 81 % |
| Palabra bien escrita mantenida en primera posicion | 89 % | 91 % |
| Solo primera letra tecleada, palabra en top 3 | 38 % | 62 % |

Perplejidad de validacion final: 28,6 sobre frases planas reservadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q6_K (fichero de 37 MB mas overhead del runtime).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para entrenamiento se uso una NVIDIA L4.
- Cabe en cualquier GPU de consumo e incluso en moviles; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: el cargador de FUTO Keyboard (basado en llama.cpp) es el destino principal; tambien puede cargarse con llama.cpp u otras herramientas compatibles con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; el contexto de 256 tokens y el tamano del modelo sugieren latencia muy baja en CPU movil, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| solboki/futo-keyboard-fr (este) | ~33 M (43,7 M en safetensors) | 256 | Frances | CC BY-SA 4.0 | GGUF Q6_K |
| Modelo ingles oficial de FUTO Keyboard | no disponible | no disponible | Ingles | no disponible | GGUF |
| barddoo/futo-keyboard-ptbr | no disponible | no disponible | Portugues (BR) | no disponible | GGUF |
| stamchry/greek-keyboard-lm | no disponible | no disponible | Griego | no disponible | GGUF |

Los tres modelos comunitarios citados siguen el mismo metodo y estan pensados para el mismo motor de teclado; no se han publicado comparativas de rendimiento cruzadas entre ellos en la informacion disponible.

## Limitaciones y advertencias

- Las palabras sin acentos son frecuentes en texto web, por lo que el modelo puede repetir `ete` o `deja` antes de `été` y `déjà`; la integracion en Sailfish descarta esos ecos cuando la grafia tecleada no es palabra de diccionario.
- Fechas y anos procedentes de Wikipedia y la web estan sobrerrepresentados: `La reunion est reportee a` produce `la, 20, 20h30`.
- Las correcciones estan ajustadas a erratas AZERTY; funciona con otras distribuciones, pero el ajuste es peor.
- Contexto muy corto (256 tokens): no apto para tareas de lenguaje general ni conversacion.
- Solo frances; no cubre otros idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir obras derivadas bajo la misma licencia; parte del texto de entrenamiento es Wikipedia (CC BY-SA).
- En Android (FUTO Keyboard oficial) no esta probado; la importacion requiere activar la opcion de desarrollador que permite modelos transformer en distribuciones no QWERTY.
- En Sailfish OS requiere un cambio auxiliar que seleccione el modelo por idioma, propuesto upstream pero no integrado; hasta entonces la instalacion es manual.
- No es un producto oficial de FUTO; FUTO es una marca de FUTO Holdings, Inc. y este proyecto no esta afiliado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/solboki/futo-keyboard-fr
- Modelo comunitario de referencia (portugues): https://huggingface.co/barddoo/futo-keyboard-ptbr
- Modelo comunitario de referencia (griego): https://huggingface.co/stamchry/greek-keyboard-lm
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100

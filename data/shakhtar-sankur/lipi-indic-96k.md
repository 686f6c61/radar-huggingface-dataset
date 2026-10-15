# Shakhtar-Sankur/lipi-indic-96k

## Resumen

lipi-Indic 96K es un tokenizador para las 24 lenguas indias presentes en FLORES-200 (más inglés) que extiende el tokenizador de Qwen 2.5 sin modificar un solo id de token para inglés, código ni para cualquier script no indio. Lo desarrolla Sankur Kundu (usuario de HuggingFace Shakhtar-Sankur) y se apoya en el tokenizador de Qwen/Qwen2.5-0.5B (Apache-2.0). No es un modelo de lenguaje, sino un vocabulario y unos merges nuevos que se aplican sobre un modelo Qwen 2.5 existente.

El problema que resuelve es el "token tax": una misma frase cuesta más tokens en una lengua india que en inglés, lo que encarece la inferencia, alarga la latencia y reduce el texto útil dentro de la ventana de contexto. Sobre el tokenizador de GPT-4o, el odia cuesta 4,99× los tokens del inglés; sobre el de Qwen 2.5, 9,70×. lipi-Indic reduce esa ratio a 1,35× en odia y a 1,30× en la media ponderada por hablantes.

Técnicamente es una extensión BPE de 96.000 merges nuevos aprendidos sobre FineWeb-2, con un vocabulario final de 247.665 tokens (frente a los 262.145 de Gemma 3). La innovación principal es doble: permitir que las palabras continúen a través de marcas combinantes de scripts indios y restringir los merges nuevos a secuencias que contengan bytes de esos scripts. Los tokens nuevos requieren reentrenamiento de la matriz de embeddings del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tokenizador BPE (byte-level) derivado del tokenizador de Qwen 2.5; no es un modelo neuronal |
| Parametros totales | no aplica (tokenizador); modelo base asociado: Qwen/Qwen2.5-0.5B |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (heredada del modelo base al que se aplique) |
| Tipos de cuantizacion | no aplica (tokenizador) |
| Idiomas soportados | 24 lenguas indias: asamés (as), bengalí (bn), guyaratí (gu), hindi (hi), canarés (kn), cachemir (ks), maithili (mai), malabar (ml), manipuri (mni), maratí (mr), nepalí (ne), odia (or), panyabí (pa), sánscrito (sa), santalí (sat), sindi (sd), tamil (ta), telugu (te), urdu (ur), bhojpuri (bho), awadhi (awa), magahi (mag), chhattisgarhí (hne); más inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | archivos del tokenizador (`tokenizer.json`, `tokenizer_config.json`); repositorio de 0,0 GB |
| Tamano de vocabulario | 247.665 tokens (Gemma 3: 262.145) |
| Merges nuevos | 96.000, aprendidos sobre FineWeb-2 |

## Arquitectura y entrenamiento

lipi-Indic 96K no define una arquitectura de red neuronal: es un tokenizador BPE byte-level que sustituye al de Qwen 2.5. Su funcionamiento se apoya en dos cambios sobre el pre-tokenizador original. Primero, se permite que las palabras continúen a través de signos vocálicos combinantes, virama y nukta de los scripts indios, algo que el pre-tokenizador de Qwen impedía al dividir la palabra en cada marca. Segundo, los 96.000 merges nuevos se aprendieron sobre FineWeb-2 exigiendo que cada merge candidato contuviera los bytes de algún script empleado por lenguas indias; así, el texto sin esos bytes no puede activar ningún merge nuevo y los ids preexistentes se preservan intactos.

El resultado se traduce en una reducción drástica del coste de tokenización. En el ejemplo de la model card, una frase en odia pasa de 111 tokens con el tokenizador de Qwen 2.5 a 14 con lipi-Indic. La model card también documenta que inicializar cada fila nueva de la matriz de embeddings como la media de las piezas que reemplaza ya reduce los bits por byte en odia antes de cualquier entrenamiento (de 1,444 a 1,183 en experimentos con una extensión solo de odia sobre el modelo de 0,5B). La referencia teórica del cambio de pre-tokenización de marcas es Regmi et al. (2026), "Vowel Signs Are Not Letters" (arXiv:2608.26449).

## Capacidades

- Tokenización eficiente de 24 lenguas indias de FLORES-200 más inglés, con ratios de coste cercanos al inglés.
- Preservación exacta de los ids de token para inglés, código, francés, español, ruso, chino, japonés, coreano, tailandés y hebreo, de modo que un modelo Qwen 2.5 conserva todos los embeddings aprendidos para esos idiomas.
- Modificación (abaratamiento) de los tokens de árabe y persa, porque el urdu, el cachemir y el sindi comparten el script árabe.
- Compatibilidad con la librería `transformers` (`AutoTokenizer`) y con la librería `tokenizers` (`Tokenizer.from_pretrained`).
- No incorpora generación de texto, razonamiento, tool calling ni capacidades multimodales por sí mismo: esas capacidades dependen del modelo Qwen 2.5 sobre el que se aplique.

## Casos de uso

- Ajuste fino de Qwen 2.5 para lenguas indias: al reducir el número de tokens por frase, se aprovecha mejor la ventana de contexto y baja el coste de entrenamiento e inferencia en modelos como Qwen2.5-0.5B o superiores.
- Despliegue de asistentes en hindi, tamil, telugu u odia: la reducción del token tax se traduce directamente en menos tokens facturados por API y menor latencia por respuesta.
- Contextos largos en lenguas indias: al ocupar menos tokens el mismo texto, cabe más documento dentro de la ventana del modelo base, útil para resumen de artículos o análisis de contratos.
- Procesamiento de corpus multilingües de noticias y viajes: FLORES-200 es texto formal traducido, precisamente el dominio sobre el que se midió la mejora.
- Sustitución del tokenizador en pipelines ya existentes de Qwen 2.5: los tokens de código e inglés no cambian, por lo que los flujos de código y texto occidental no se ven afectados.
- Investigación en equidad lingüística: sirve como herramienta para medir y reducir la disparidad de coste entre idiomas dentro de un mismo modelo.
- Extensión de vocabulario para lenguas indias minorizadas (santalí, bhojpuri, awadhi, magahi, chhattisgarhí, manipuri), que suelen quedar mal cubiertas por tokenizadores generalistas.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es el "token tax" relativo al inglés sobre FLORES-200 devtest (menor es mejor):

| Idioma | Qwen 2.5 | GPT-4o | Gemini (Gemma 3) | lipi-Indic 96K |
|---|---|---|---|---|
| Hindi | 4,42× | 1,57× | 1,31× | 1,27× |
| Bengalí | 5,03× | 1,70× | 1,21× | 1,25× |
| Maratí | 4,62× | 1,82× | 1,40× | 1,24× |
| Telugu | 6,99× | 1,93× | 1,78× | 1,33× |
| Tamil | 6,11× | 1,98× | 1,47× | 1,35× |
| Guyaratí | 6,74× | 1,79× | 1,86× | 1,36× |
| Urdu | 3,15× | 1,65× | 1,52× | 1,38× |
| Canarés | 6,92× | 1,97× | 1,93× | 1,37× |
| Odia | 9,70× | 4,99× | 3,51× | 1,35× |
| Malabar | 7,23× | 1,96× | 1,85× | 1,46× |
| Panyabí | 7,28× | 2,62× | 2,69× | 1,44× |
| Asamés | 5,39× | 1,99× | 2,01× | 1,28× |
| Maithili | 4,39× | 1,76× | 1,64× | 1,25× |
| Santalí (Ol Chiki) | 8,92× | 13,70× | 5,25× | 1,52× |
| Cachemir (persoárabe) | 3,47× | 2,61× | 2,36× | 1,84× |
| Nepalí | 4,42× | 1,61× | 1,53× | 1,16× |
| Sindi | 2,85× | 1,71× | 2,02× | 1,30× |
| Manipuri (script bengalí) | 5,61× | 3,07× | 2,51× | 1,41× |
| Sánscrito | 4,51× | 2,09× | 1,77× | 1,32× |
| Cachemir (devanagari) | 4,37× | 2,23× | 1,94× | 1,72× |
| Bhojpuri | 4,30× | 1,77× | 1,57× | 1,28× |
| Awadhi | 4,30× | 1,71× | 1,47× | 1,26× |
| Magahi | 4,19× | 1,72× | 1,48× | 1,28× |
| Chhattisgarhí | 4,21× | 1,73× | 1,49× | 1,28× |
| **Media ponderada por hablantes** | 5,28× | 1,92× | 1,58× | **1,30×** |

No se han publicado resultados de benchmarks de calidad lingüística (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el artefacto es un tokenizador y no un modelo evaluado.

## Requisitos de hardware

- El tokenizador en sí no requiere GPU ni VRAM: su ejecución es de CPU y su huella de disco es de 0,0 GB según el repositorio.
- Los requisitos reales dependen del modelo Qwen 2.5 sobre el que se aplique. El modelo base declarado, Qwen2.5-0.5B, cabe en CPU y en cualquier GPU con unos pocos GB de VRAM.
- El cambio obliga a redimensionar la matriz de embeddings al tamaño 247.665, lo que aumenta ligeramente la memoria del modelo respecto al vocabulario original de Qwen 2.5 (el vocabulario crece hasta 247.665 filas).
- Opciones de despliegue: cualquier runtime que consuma tokenizadores de HuggingFace (`transformers`, `tokenizers`), y por extensión vLLM, TGI, llama.cpp u Ollama, siempre que soporten el tokenizador reemplazado.
- Latencia y throughput: no disponibles para el tokenizador. La model card sí documenta una reducción de tokens de hasta 111 a 14 en una frase de odia, lo que reduce el coste por respuesta de forma proporcional.
- Importante: la model card advierte de que `tokenizer_config.json` fija la clase genérica `PreTrainedTokenizerFast` a propósito; la versión 5 de `transformers` reconstruye los tokenizadores cargados como `Qwen2Tokenizer` con el pre-tokenizador original de Qwen y deshace la mejora.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Media ponderada de token tax | Licencia | Disponibilidad |
|---|---|---|---|---|
| lipi-Indic 96K | 247.665 | 1,30× | Apache-2.0 | HuggingFace |
| Qwen 2.5 (base) | no disponible en la información | 5,28× | Apache-2.0 | HuggingFace |
| GPT-4o | no disponible en la información | 1,92× | propietaria | solo API |
| Gemini (medido con Gemma 3) | 262.145 | 1,58× | propietaria (Gemma 3 con licencia propia) | API / pesos de Gemma 3 |
| Sarvam-1 | no disponible en la información | mejor que lipi-Indic en las diez lenguas para las que fue construido | no disponible | no disponible |

La model card indica que Gemini no publica su tokenizador y que se usa el de Gemma 3 como aproximación. También señala que lipi-Indic supera al tokenizador de Gemini en 23 de las 24 lenguas medidas, con el bengalí como única excepción (1,25× frente a 1,21×).

## Limitaciones y advertencias

- FLORES-200 es texto formal, traducido, de noticias y viajes; el texto conversacional, con mezcla de idiomas o romanizado tendrá un coste de tokens distinto y no medido.
- Bodo, dogri y konkani no están en FLORES-200 y no se midieron.
- El bengalí es la única lengua en la que el tokenizador de Gemini sigue siendo mejor (1,21× frente a 1,25×).
- El tokenizador de Sarvam-1 sigue siendo mejor en las diez lenguas para las que fue construido.
- Los tokens nuevos no aportan conocimiento por sí solos: la matriz de embeddings debe redimensionarse a 247.665 filas y las filas nuevas necesitan preentrenamiento continuado con texto en lenguas indias. Sin ese paso, el modelo no aprovecha la extensión.
- El árabe y el persa cambian sus tokens (a mejor), por lo que un modelo con vocabulario extensible debe asumir que esos idiomas también requieren ajuste de embeddings.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible, ya que se trata de un tokenizador y no de un modelo generativo.
- Compatibilidad: no cambiar la clase del tokenizador a `Qwen2Tokenizer` en `transformers` v5, o la mejora se pierde silenciosamente.
- Licencia Apache-2.0, que permite uso comercial, pero el material de entrenamiento de los merges (FineWeb-2) se distribuye bajo ODC-By y conviene respetar su atribución.

## Enlaces

- HuggingFace: https://huggingface.co/Shakhtar-Sankur/lipi-indic-96k
- Repositorio con código, mediciones y borrador del paper: https://github.com/Shakhtar-Sankur/lipi
- Paper de referencia sobre pre-tokenización: Regmi et al. (2026), "Vowel Signs Are Not Letters", arXiv:2608.26449
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B

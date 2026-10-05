# Aarjan/Llama-3.2-Nepali-Extended-Tokenizer-32k

## Resumen

Llama-3.2-Nepali-Extended-Tokenizer-32k es un tokenizer para modelos Llama 3.x extendido para nepalí, publicado por el usuario Aarjan (Naamche Labs). No es un modelo con pesos: se distribuye unicamente el vocabulario y la configuracion del tokenizer, derivados del tokenizer original de meta-llama/Llama-3.2-1B. La receta aplicada es la extension de vocabulario estandar: se conserva intacta la expresion regular de pre-tokenizacion original (solo letras) y se anaden 32.000 merges de nepalí mediante BPE continuado. Los nuevos identificadores de token empiezan en 128256 y todos los identificadores originales, incluidos los tokens especiales, permanecen sin cambios.

El tokenizer forma parte del trabajo *Extend or Repair? Vocabulary Extension Cannot Cross a Pre-Tokenizer Boundary* (Chaudhary, Sharma y Dhakal, Naamche Labs, 2026), donde corresponde al brazo R1, publicado como linea base. Su motivacion es reducir el coste de tokenizacion del nepalí (escritura devanagari) con modelos Llama, que tokenizan ese idioma de forma muy ineficiente. Segun la evaluacion sobre FLORES-200 devtest, la relacion de tokens nepalí/ingles baja de 2,58x con el tokenizer original a 2,20x con este tokenizer.

Para utilizarlo hay que redimensionar la matriz de embeddings del modelo base hasta 160.256 filas, inicializar las filas nuevas (el articulo usa la media de las filas constituyentes de cada token) y continuar el preentrenamiento. El propio autor advierte en la model card de que, en sus experimentos, la extension de vocabulario obtuvo peor bits per byte en nepalí que mantener el vocabulario original, por lo que recomienda leer el articulo antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer byte-level BPE con vocabulario extendido (no es un modelo neuronal); hereda la pre-tokenizacion de Llama 3.x |
| Parametros totales | no disponible (solo se publica el tokenizer, no pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base sobre el que se aplique) |
| Tipos de cuantizacion | no aplica (un tokenizer no se cuantiza) |
| Idiomas soportados | nepalí (devanagari) e ingles |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | no aplica; se distribuyen ficheros de tokenizer de HuggingFace (`tokenizer.json`, `tokenizer_config.json`) |
| Tamano de vocabulario resultante | 160.256 tokens (128.256 originales + 32.000 merges de nepalí) |
| Primer id de token nuevo | 128256 |
| Modelo base | meta-llama/Llama-3.2-1B |
| Clase de tokenizer | `PreTrainedTokenizerFast` (no debe modificarse) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

Tecnicamente no hay una arquitectura neuronal implicada: el artefacto es un vocabulario BPE. La construccion parte del tokenizer de Llama 3.2, conserva su expresion regular de pre-tokenizacion basada unicamente en letras y aplica BPE continuado para anadir 32.000 merges especificos de nepalí. Esta decision mantiene la compatibilidad total con el vocabulario original: los ids de token en ingles son identicos a los del tokenizer original en las 1.012 frases del devtest de FLORES-200, y el tokenizer es sin perdidas (lossless) tanto en nepalí como en ingles.

El articulo identifica un limite estructural que denomina *pre-tokenizer floor*: cuando la pre-tokenizacion original no segmenta correctamente la escritura devanagari, la extension de merges no puede cruzar esa frontera y el margen de mejora queda acotado. Por eso el propio trabajo explora una segunda via (reparar la pre-tokenizacion, brazo con menos tokens de entrenamiento necesarios) y concluye que, en experimentos pequenos de preentrenamiento continuado (modelos de 1B y 0,6B, 2 GB de texto, una sola semilla), extender el vocabulario de cualquiera de las dos formas dio peor bits per byte en nepalí retenido que conservar el vocabulario original. La variante reparada resulto entre un 2 % y un 6 % peor en nepalí que la extension estandar, pero necesito un 26 % menos de tokens de entrenamiento.

El flujo de uso previsto es: redimensionar los embeddings del modelo base a 160.256 filas, inicializar las 32.000 filas nuevas con la media de las filas constituyentes de cada token (el script `box/init_model.py` del repositorio implementa esta inicializacion) y continuar el preentrenamiento. No se han publicado los datos exactos de entrenamiento de los merges ni el numero total de tokens de preentrenamiento del articulo mas alla de los 2 GB citados.

## Capacidades

- Tokenizacion sin perdidas de texto en nepalí (devanagari) e ingles.
- Reduccion de la relacion de tokens nepalí/ingles de 2,58x a 2,20x en FLORES-200 devtest, lo que implica menos tokens por frase nepalí y menor coste de inferencia por documento.
- Preservacion exacta del vocabulario ingles: ids identicos a los del tokenizer de Llama 3.2 en las 1.012 frases del devtest ingles.
- Compatibilidad con tokens especiales originales de Llama 3.2, que no se modifican.
- Carga directa mediante `AutoTokenizer` de HuggingFace manteniendo `PreTrainedTokenizerFast`.
- Preparado para flujos de continuacion de preentrenamiento con redimensionado de embeddings.
- No realiza generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni razonamiento multi-paso por si mismo: esas capacidades dependen del modelo al que se acople.
- No incluye modo thinking, audio ni ninguna capacidad multimodal.

## Casos de uso

- Adaptacion de Llama-3.2-1B al nepalí: sustituir el tokenizer del modelo base, redimensionar los embeddings a 160.256 filas con `box/init_model.py` y continuar el preentrenamiento con corpus nepalí para obtener un modelo con mejor relacion de compresion en ese idioma.
- Reduccion del coste de inferencia en nepalí: al bajar de 2,58x a 2,20x la relacion de tokens respecto al ingles, se reduce aproximadamente un 15 % el numero de tokens generados por el mismo texto, lo que abarata el coste por peticion en servicios con trafico mayoritariamente nepalí.
- Traduccion nepalí-ingles: entrenar o afinar un modelo de traduccion sobre este vocabulario aprovechando que el espacio de embeddings ingles queda intacto y que el nepalí dispone de 32.000 merges dedicados.
- Tokenizacion de corpus mixtos nepalí-ingles con cambio de codigo (code-switching): el vocabulario cubre ambas lenguas sin fragmentar el ingles de forma distinta al tokenizer original, lo que facilita mezclar datos en un unico pipeline.
- Clasificacion y etiquetado de texto nepalí (analisis de sentimiento, moderacion, NER): al reducirse la longitud en tokens de cada documento, se puede ampliar la ventana efectiva de contexto util en tareas de clasificacion con presupuesto de tokens fijo.
- Reproduccion de experimentos de investigacion sobre extension de vocabulario: es el brazo R1 del articulo, util como linea base frente a la variante reparada y frente al tokenizer original en estudios de bits per byte.
- Analisis de la frontera de pre-tokenizacion en devanagari: sirve para medir experimentalmente el *pre-tokenizer floor* y decidir si conviene extender merges o reparar la regex en un proyecto nuevo.
- Generacion de GGUF y despliegue en llama.cpp u Ollama: una vez redimensionados los embeddings y afinado el modelo, el vocabulario ampliado debe integrarse en la conversion a GGUF, lo que permite servir el modelo adaptado en hardware de consumo.

## Benchmarks y rendimiento

La informacion disponible solo incluye metricas de tokenizacion sobre FLORES-200 devtest. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad, porque no se han publicado pesos.

| Metrica | Tokenizer original | Este tokenizer (R1) |
|---|---|---|
| Relacion de tokens nepalí/ingles (FLORES-200 devtest) | 2,58x | 2,20x |
| Ids de token en ingles identicos al original (1.012 frases) | referencia | si |
| Tokenizacion sin perdidas (nepalí e ingles) | si | si |
| Bits per byte en nepalí retenido (preentrenamiento continuado, 1B y 0,6B, 2 GB de texto, una semilla) | mejor que cualquier extension | peor que mantener el vocabulario original |
| Comparacion con la variante reparada del articulo | no disponible | la variante reparada fue 2-6 % peor en nepalí, con 26 % menos tokens de entrenamiento |

## Requisitos de hardware

- El tokenizer en si no requiere GPU: se ejecuta en CPU y su huella en memoria es despreciable (repositorio de 0,0 GB).
- El requisito real aparece al usar el vocabulario con un modelo: la matriz de embeddings pasa de 128.256 a 160.256 filas, es decir, 32.000 filas adicionales por la dimension del modelo, lo que incrementa la memoria de la capa de embedding. El valor exacto depende de la dimension del modelo base y no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponibles; dependen exclusivamente del modelo que se entrene o ejecute sobre este tokenizer (por ejemplo, Llama-3.2-1B afinado cabe en GPUs de consumo tipo RTX 3060/4060 en cuantizacion de 4 bits, y en RTX 4090 o A100 sin cuantizar, pero esto no lo especifica la model card).
- Opciones de despliegue: carga directa con `transformers` (`AutoTokenizer`); para servirlo con vLLM, TGI, llama.cpp u Ollama hay que redimensionar los embeddings y volver a convertir los pesos, prestando atencion a que la conversion a GGUF reconozca los 32.000 tokens anadidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se comparan variantes de tokenizer dentro del mismo trabajo, ya que no se han identificado alternativas publicas equivalentes de extension de vocabulario para nepalí sobre Llama 3.2 en la informacion disponible.

| Variante | Tipo | Vocabulario | Relacion nepalí/ingles | Estado | Licencia |
|---|---|---|---|---|---|
| Tokenizer original de Llama 3.2 | BPE byte-level | 128.256 | 2,58x | publicado por Meta | Llama 3.2 Community License |
| Este modelo (brazo R1 del articulo) | BPE continuado, se anaden 32.000 merges | 160.256 | 2,20x | publicado (solo tokenizer) | Llama 3.2 Community License |
| Variante reparada (brazo R2 del articulo) | Reparacion de la pre-tokenizacion | no disponible | no disponible | no publicado como tokenizer en esta ficha | no disponible |
| Tokenizers de otros modelos entrenados de origen en nepalí (por ejemplo, familias multilingues tipo Gemma o IndicBERT) | BPE / SentencePiece segun familia | no disponible | no disponible | existen fuera del alcance de esta busqueda | varian segun modelo |

## Limitaciones y advertencias

- El autor advierte explicitamente de que, en sus experimentos de preentrenamiento continuado (1B y 0,6B, 2 GB de texto, una sola semilla), extender el vocabulario dio peor bits per byte en nepalí retenido que conservar el vocabulario original.
- El *pre-tokenizer floor* descrito en el articulo limita la mejora alcanzable: la extension de merges no puede cruzar la frontera marcada por la expresion regular de pre-tokenizacion original.
- No es un modelo utilizable de forma directa: solo contiene el tokenizer. Sin redimensionar embeddings y continuar el preentrenamiento, no produce ningun beneficio en generacion.
- No se publican pesos, por lo que no existen resultados de MMLU, HumanEval, GSM8K ni evaluaciones de capacidad.
- La evaluacion se limita a FLORES-200 devtest, con 1.012 frases en ingles como comprobacion de invariancia; no hay evaluacion en dominios fuera de ese conjunto.
- La clase del tokenizer debe permanecer como `PreTrainedTokenizerFast`; cambiarla puede romper la carga.
- Licencia Llama 3.2 Community License: uso comercial permitido bajo sus terminos, con obligaciones de atribucion ("Built with Llama"), requisitos de nomenclatura para derivados y la clausula de escala de 700 millones de usuarios mensuales. Hay que revisar LICENSE y USE_POLICY.md antes de un despliegue comercial.
- El modelo base hereda los sesgos y el riesgo de alucinacion de Llama 3.2-1B; el tokenizer no los corrige ni los mitiga.
- La cobertura linguistica se limita a nepalí e ingles: no hay soporte declarado para otras lenguas del subcontinente ni para nepalí en otras transliteraciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad ni informes de terceros.
- La region declarada es `us`, lo que puede tener implicaciones en terminos de cumplimiento si se despliega en otras jurisdicciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aarjan/Llama-3.2-Nepali-Extended-Tokenizer-32k
- Repositorio con codigo, datos y pre-registro del articulo: https://github.com/arjanchaudharyy/nepali-pretokenizer-repair
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Referencia del articulo (preprint, sin DOI disponible): Chaudhary, A.; Sharma, S.; Dhakal, N. *Extend or Repair? Vocabulary Extension Cannot Cross a Pre-Tokenizer Boundary*, Naamche Labs, 2026.
- Licencia y politica de uso de Llama 3.2: LICENSE y USE_POLICY.md incluidos en el repositorio del tokenizer.

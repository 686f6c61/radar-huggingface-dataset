# Aarjan/Llama-3.2-Nepali-Repaired-Tokenizer-32k

## Resumen

Llama-3.2-Nepali-Repaired-Tokenizer-32k es un tokenizador derivado de Llama 3.2 y adaptado al nepalí (devanagari), publicado por el usuario Aarjan (Aarjan Chaudhary, Naamche Labs) y asociado al artículo *Extend or Repair? Vocabulary Extension Cannot Cross a Pre-Tokenizer Boundary* (Chaudhary, Sharma y Dhakal, 2026). No es un modelo de lenguaje: el repositorio contiene únicamente los ficheros del tokenizador, sin pesos. Su función es reducir el coste de tokenización del nepalí en la familia Llama 3.x, donde el tokenizador original fragmenta agresivamente el devanagari.

La innovación principal no es añadir vocabulario, sino reparar la expresión regular del pre-tokenizador para que las marcas combinantes del devanagari (signos vocálicos, virama, anusvara, etc.) permanezcan dentro de la palabra. Sobre esa base se añaden 32.000 merges nepalíes mediante BPE continuado, lo que eleva el vocabulario de 128.256 a 160.256 entradas. Los identificadores originales, incluidos los tokens especiales, se mantienen intactos; los nuevos empiezan en 128256.

Su relevancia es doble. Por un lado, la ratio de tokens nepalí/inglés en FLORES-200 devtest pasa de 2,58x a 1,01x, es decir, se iguala el coste de tokenización del nepalí al del inglés. Por otro, el propio autor advierte en la model card de que, en sus experimentos de preentrenamiento continuado, la extensión de vocabulario (reparada o estándar) obtuvo peor *bits per byte* en nepalí que conservar el vocabulario original, por lo que se trata de un artefacto de investigación, no de un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE a nivel de bytes sobre el vocabulario de Llama 3.x, con pre-tokenizador regex reparado. No incluye pesos de modelo |
| Parametros totales | No aplica: el repositorio solo contiene el tokenizador (tamano del repo: 0,0 GB). El modelo base declarado, meta-llama/Llama-3.2-1B, tiene aproximadamente 1,24 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El tokenizador no define ventana de contexto; depende del modelo al que se acople |
| Tipos de cuantizacion | No aplica al tokenizador. No se publican pesos que cuantizar |
| Idiomas soportados | Nepalí (ne) e inglés (en) segun los metadatos. La reparacion afecta a cualquier script con marcas combinantes |
| Licencia | Llama 3.2 Community License (identificador `llama3.2`) |
| Formato de pesos | No disponible: no se publican pesos (ni safetensors ni GGUF). Se distribuyen ficheros de tokenizador, con `tokenizer_class` fijado a `PreTrainedTokenizerFast` de forma intencionada |
| Tamano de vocabulario | 160.256 entradas (128.256 originales de Llama 3.2 + 32.000 merges nepalies nuevos, con ids desde 128256) |
| Clase de tokenizador | `PreTrainedTokenizerFast` (no modificar segun el autor) |
| Descargas / likes | 0 descargas, 0 likes en el momento de la consulta |
| Fecha de publicacion | Creado el 2026-10-04, actualizado el 2026-10-04 |

## Arquitectura y entrenamiento

Se trata de un tokenizador, no de una red neuronal, por lo que no hay arquitectura de transformer, MoE ni SSM implicada. El pipeline tiene dos componentes. Primero, la reparacion del pre-tokenizador: la regex de division previa se reescribe para impedir que las marcas combinantes del devanagari se separen de su consonante base, algo que el pre-tokenizador original de Llama 3.x no garantiza. Segundo, la extension del vocabulario: se anaden 32.000 merges nepalies mediante BPE continuado sobre el vocabulario existente de 128.256 entradas, sin reasignar ningun id previo. Esta configuracion corresponde al brazo R2 del articulo de referencia.

El autor documenta una propiedad formal (Proposicion 1 del articulo): cualquier entrada que no contenga marcas combinantes ni caracteres devanagari conserva exactamente los mismos identificadores que el tokenizador original. Se verifico que los ids de las 1.012 frases inglesas de FLORES-200 devtest son identicos a los del tokenizador original, y que el tokenizador es sin perdida (*lossless*) tanto en nepalí como en inglés. La contrapartida es que otros scripts con marcas combinantes (hindi, tailandes, arabe vocalizado) se tokenizan de forma distinta. No se describe en la informacion disponible ningun tipo de RLHF, DPO ni ajuste por preferencias, ya que no se publican pesos ni se entrena un modelo completo en este repositorio.

Para usar el tokenizador con un modelo hay que redimensionar la matriz de embeddings a 160.256 filas e inicializar las nuevas. El articulo propone inicializarlas con la media de las filas de los tokens constituyentes, con codigo de referencia en `box/init_model.py` del repositorio de GitHub. Los embeddings de Llama-3.2-1B pasan de 128.256 x 2.048 a 160.256 x 2.048, lo que supone 65.536.000 parametros adicionales (derivacion aritmetica a partir de las dimensiones publicas del modelo base). Despues seria necesario continuar el preentrenamiento.

## Capacidades

- Tokenizacion de texto nepalí en devanagari con una ratio de 1,01 tokens nepalies por token ingles en FLORES-200 devtest, frente a 2,58x del tokenizador original de Llama 3.x.
- Mantenimiento de las marcas combinantes (signos vocalicos, virama, anusvara) dentro de la palabra, lo que evita fragmentaciones artificiales del devanagari.
- Compatibilidad hacia atras con Llama 3.x: todos los ids originales, incluidos los tokens especiales, se conservan sin cambios.
- Preservacion exacta de la tokenizacion en ingles: ids identicos a los del tokenizador original en las 1.012 frases de FLORES-200 devtest en ingles.
- Tokenizacion sin perdida (*lossless*) verificada sobre el texto de devtest en nepalí e inglés.
- Reduccion del coste en tokens para corpus nepalies, lo que se traduce en menos tokens de entrenamiento necesarios (el articulo reporta un 26 por ciento menos de tokens de entrenamiento en su comparacion).
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente: esas capacidades dependerian del modelo base al que se acople el tokenizador.
- No dispone de modo de pensamiento (*thinking mode*), audio ni multimodalidad.
- Capacidad multilingue limitada a nepalí e inglés en los metadatos; otros scripts con marcas combinantes quedan tokenizados de forma diferente.

## Casos de uso

- Adaptacion de Llama 3.2 a nepalí con presupuesto de computo limitado: partiendo de meta-llama/Llama-3.2-1B, se redimensionan los embeddings a 160.256 filas, se inicializan con la media de las filas constituyentes y se continua el preentrenamiento. El interes esta en que el articulo reporta un 26 por ciento menos de tokens de entrenamiento necesarios frente a la extension estandar.
- Evaluacion comparativa de estrategias de extension de vocabulario: el tokenizador sirve como brazo R2 en experimentos academicos que comparen reparar el pre-tokenizador frente a solo extender el vocabulario, midiendo *bits per byte* en nepalí.
- Preprocesado de corpus nepalies para entrenamiento o ajuste: la ratio 1,01x reduce el numero de tokens por documento, lo que disminuye el coste de almacenamiento de secuencias tokenizadas y el numero de pasos de entrenamiento necesarios para cubrir el mismo texto.
- Sistemas bilingues nepalí-ingles sin regresion en ingles: al conservar los ids ingleses identicos a los del tokenizador original, se puede anadir capacidad en nepalí sin modificar la tokenizacion de los datos en ingles ya preparados.
- Traduccion automatica nepalí-ingles sobre FLORES-200: la mejora medida se obtuvo precisamente en FLORES-200 devtest, por lo que es un banco de pruebas natural para pipelines de traduccion con modelos Llama 3.x adaptados.
- Analisis e indexacion de texto en devanagari: la tokenizacion sin perdida y el mantenimiento de las marcas dentro de la palabra facilitan tareas de busqueda lexica, conteo de terminos y estadisticas de corpus en nepalí.
- Estimacion de costes de inferencia para servicios en nepalí: reducir de 2,58x a 1,01x la ratio de tokens implica menos tokens generados por documento, con el consiguiente ahorro en longitud de secuencia, uso de cache KV y facturacion por token en APIs.
- Verificacion de regresion en scripts con marcas combinantes: util para auditar como se comporta un sistema multilingue cuando se introduce este tokenizador, dado que hindi, tailandes y arabe vocalizado se tokenizan de forma distinta.
- Reproducibilidad de investigacion en tokenizacion: el articulo publica codigo, datos y pre-registro, lo que permite replicar los experimentos de preentrenamiento continuado con 1B y 0.6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, algo coherente con el hecho de que el repositorio no contiene pesos de modelo. Los unicos numeros publicados son metricas de tokenizacion y de preentrenamiento continuado.

| Metrica (FLORES-200 devtest) | Tokenizador original de Llama 3.x | Este tokenizador (brazo R2) |
|---|---|---|
| Ratio de tokens nepalí / ingles | 2,58x | 1,01x |
| Ids identicos al original en ingles (1.012 frases) | Referencia | Si |
| Tokenizacion sin perdida en nepalí e ingles | No disponible | Si |

| Metrica de preentrenamiento continuado (experimentos del articulo, modelos de 1B y 0,6B, 2 GB de texto, una sola semilla) | Resultado |
|---|---|
| Vocabulario original frente a extension (cualquier variante), *bits per byte* en nepalí reservado | El vocabulario original obtiene mejor resultado |
| Este tokenizador frente a la extension estandar, *bits per byte* en nepalí | Entre un 2 y un 6 por ciento peor |
| Tokens de entrenamiento necesarios frente a la extension estandar | Un 26 por ciento menos |

## Requisitos de hardware

- El tokenizador en si es un artefacto de pocos kilobytes o megabytes; el repositorio ocupa 0,0 GB segun los metadatos, por lo que no requiere GPU.
- El coste real depende del modelo al que se acople. Para meta-llama/Llama-3.2-1B con los embeddings redimensionados a 160.256 filas, el total ronda los 1,30 mil millones de parametros (derivacion aritmetica: 65.536.000 parametros extra sobre los ~1,24 mil millones del modelo base).
- VRAM estimada para ese modelo de 1B con vocabulario ampliado (estimaciones por aritmetica, no publicadas por el autor): en fp16, aproximadamente 2,6 GB solo de pesos; en int8, en torno a 1,3-1,4 GB; en cuantizacion de 4 bits, alrededor de 0,8-0,9 GB. Hay que sumar la cache KV segun la longitud de contexto efectiva.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas es suficiente para el modelo de 1B cuantizado (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090). Para el modelo sin cuantizar en fp16 bastan 6-8 GB de VRAM. No se dispone de datos para configuraciones de mayor tamano.
- Modelos de mayor tamano de la familia (por ejemplo, 3B o superiores) requeririan GPU de clase A100 o H100 si se quiere mantener contexto largo y precision alta, pero no hay datos publicados al respecto para este tokenizador.
- Opciones de despliegue: carga directa con `transformers` mediante `AutoTokenizer.from_pretrained("Aarjan/Llama-3.2-Nepali-Repaired-Tokenizer-32k")`. Para vLLM, TGI o llama.cpp el requisito es que el modelo asociado tenga la matriz de embeddings de 160.256 filas y que el tokenizador se incluya en el artefacto; el proceso de conversion a GGUF tendra que contemplar el vocabulario ampliado.
- Latencia y throughput: no disponibles. La mejora de ratio de tokens (de 2,58x a 1,01x) deberia reducir proporcionalmente el numero de tokens procesados por documento, pero no se publican medidas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Alternativa | Tipo | Tamano de vocabulario | Ratio nepalí/ingles (FLORES-200 devtest) | Vocabulario original intacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este tokenizador (brazo R2) | Tokenizador Llama 3.x con pre-tokenizador reparado y 32.000 merges nepalies | 160.256 | 1,01x | Si, todos los ids originales incluidos los especiales | Llama 3.2 Community License | HuggingFace, 0 descargas |
| Tokenizador original de Llama 3.2 | Tokenizador BPE de Llama 3.x | 128.256 | 2,58x | Referencia | Llama 3.2 Community License | Incluido en los modelos Llama 3.x |
| Extension estandar de vocabulario (brazo no identificado en la informacion disponible) | Tokenizador Llama 3.x con vocabulario extendido sin reparar el pre-tokenizador | No disponible | No disponible | No disponible | No disponible | Citado en el articulo, no publicado como repositorio independiente |

No se dispone de datos sobre otros tokenizadores especificos para nepalí (por ejemplo, los asociados a modelos tipo NepBERTa o similares) en la informacion proporcionada. Las busquedas web realizadas devolvieron unicamente resultados no relacionados (perifericos de la marca Ajazz), por lo que no se puede completar la comparativa con alternativas externas al articulo.

## Limitaciones y advertencias

- En los experimentos de preentrenamiento continuado del articulo, extender el vocabulario (tanto de forma estandar como reparada) dio peor *bits per byte* en nepalí reservado que conservar el vocabulario original. El propio autor recomienda leer el articulo antes de usar este tokenizador en un modelo de produccion.
- La variante reparada fue entre un 2 y un 6 por ciento peor en nepalí que la extension estandar, aunque necesito un 26 por ciento menos de tokens de entrenamiento.
- Los experimentos se limitaron a modelos de 1B y 0,6B, 2 GB de texto y una sola semilla, por lo que la evidencia estadistica es debil y no se puede extrapolar a modelos mayores o a volumenes de datos superiores.
- Solo se publica el tokenizador: no hay pesos, no hay modelo ajustado y no hay pipeline de inferencia declarado, por lo que no es utilizable directamente para generar texto.
- Textos en otros scripts con marcas combinantes (hindi, tailandes, arabe vocalizado) se tokenizan de forma distinta al tokenizador original. Cualquier pipeline multilingue que comparta este tokenizador debe auditar estos idiomas.
- La reparacion garantiza ids identicos solo para entradas sin marcas combinantes y sin caracteres devanagari (Proposicion 1). Fuera de ese supuesto no hay garantia de estabilidad de ids.
- Requiere redimensionar los embeddings del modelo a 160.256 filas e inicializar las nuevas entradas; sin ese paso, el tokenizador no es compatible con los pesos existentes. El valor de `tokenizer_class` esta fijado a `PreTrainedTokenizerFast` de forma deliberada y no debe modificarse.
- Licencia Llama 3.2 Community License: uso comercial permitido bajo sus terminos, con obligacion de incluir aviso de licencia, mantener la atribucion "Built with Llama" y respetar las restricciones de la politica de uso aceptable, entre ellas el limite de 700 millones de usuarios activos mensuales para productos derivados que superen ciertos umbrales.
- Al derivar de Llama 3.2, hereda los sesgos y las limitaciones del modelo base de Meta, incluidos los sesgos de idioma y de representacion, que no se han evaluado especificamente en nepalí en la informacion disponible.
- Riesgo de alucinacion: no evaluable, ya que no se publican pesos ni evaluaciones de generacion.
- Al ser un artefacto de investigacion con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni soporte de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Aarjan/Llama-3.2-Nepali-Repaired-Tokenizer-32k
- Repositorio de codigo, datos y pre-registro: https://github.com/arjanchaudharyy/nepali-pretokenizer-repair
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Articulo de referencia: Chaudhary, A.; Sharma, S.; Dhakal, N. *Extend or Repair? Vocabulary Extension Cannot Cross a Pre-Tokenizer Boundary*, Naamche Labs, 2026, preprint (URL en el repositorio de GitHub indicado arriba; no se ha localizado DOI ni enlace de publicacion en la informacion disponible)
- Codigo de inicializacion de embeddings: `box/init_model.py` dentro del repositorio de GitHub
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a una marca de perifericos de informatica sin relacion con el modelo

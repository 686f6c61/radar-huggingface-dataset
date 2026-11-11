# canbingol/tr-bpe-fineweb-alan30-64k

## Resumen

`canbingol/tr-bpe-fineweb-alan30-64k` es un tokenizador byte-level BPE entrenado especificamente para turco, con un vocabulario de 64.000 tokens. Lo desarrolla el usuario canbingol y se publica en Hugging Face bajo el tag `tokenizer`. No es un modelo de lenguaje completo: es el componente de tokenizacion que se usaria como paso previo para entrenar o servir un LLM en turco. Su relevancia radica en que los tokenizadores multilingues genericos (por ejemplo, los de familias como Llama o Qwen) fragmentan el turco de forma ineficiente, lo que encarece el entrenamiento y reduce la longitud efectiva de contexto util para un mismo numero de tokens.

El tokenizador se entrena sobre 1.000 millones de caracteres con una mezcla del 70 % de FineWeb-2 en turco y un 30 % repartido a partes iguales entre seis dominios (wiki, tuit, comentarios, medicina, academico y poesia). El resultado reportado es una fertilidad media de 1,755 tokens por palabra en turco, con extremos de 1,338 en comentarios y 2,362 en poesia. La ficha cubre un artefacto de tokenizacion, no un modelo generativo, por lo que las secciones de capacidades, benchmarks y hardware deben interpretarse en ese contexto.

No hay informacion sobre licencia, pipeline de uso ni descargas (0 descargas y 0 likes en el momento de la consulta), lo que limita su evaluacion como dependencia de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (libreria Hugging Face `tokenizers`) |
| Parametros totales | no disponible (no es un modelo neuronal; vocabulario de 64.000 tokens) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Turco (`tr`) |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto de tokenizador cargable con `AutoTokenizer`) |

## Arquitectura y entrenamiento

El tokenizador usa BPE a nivel de byte con `min_frequency=2`, entrenado con la libreria `tokenizers` de Hugging Face. El vocabulario es de 64.000 tokens e incluye cuatro tokens especiales: `<pad>`, `<unk>`, `<s>` y `</s>`. La pre-tokenizacion aplica una regla especifica para turco: el sufijo tras el apostrofo se mantiene como una sola pieza, de modo que `Türkiye'de` se segmenta en `Türkiye` + `'de`, preservando la integridad del sufijo locativo.

El corpus de entrenamiento suma 1.000 millones de caracteres. La composicion es 70 % FineWeb-2 en turco y 30 % distribuido uniformemente entre seis dominios (5 % cada uno): wiki, tuit, comentarios, medicina, academico y poesia. Los dominios con menos volumen disponible se repitieron hasta completar su cuota: poesia aproximadamente 12 pasadas, tuit aproximadamente 13, academico aproximadamente 4 y comentarios aproximadamente 2. Los conjuntos de test se separaron del corpus de entrenamiento sin texto compartido entre ambos.

## Capacidades

- Segmentacion de texto turco en unidades subword con vocabulario de 64.000 tokens.
- Manejo de sufijos tras apostrofo como pieza unica (`Türkiye'de` → `Türkiye` + `'de`).
- Cobertura de registros diversos gracias a la mezcla de seis dominios (wiki, tuit, comentarios, medicina, academico, poesia).
- Carga directa mediante `AutoTokenizer.from_pretrained("canbingol/tr-bpe-fineweb-alan30-64k")`.
- Integracion con el ecosistema Hugging Face `transformers` y `tokenizers`.
- No dispone de capacidades generativas, de razonamiento, tool calling, agentes ni vision: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de un LLM monolingue en turco: usar este tokenizador como base para reducir el numero de tokens por palabra (fertilidad media 1,755) y, con ello, el coste computacional por token de entrenamiento y la longitud efectiva de contexto para un presupuesto de tokens dado.
- Adaptacion de vocabulario para modelos existentes: sustituir o ampliar el tokenizador de un modelo multilingue con este vocabulario turco especializado para mejorar la eficiencia sobre texto turco.
- Preprocesado de corpus turcos en pipelines de NLP: tokenizacion de datasets de clasificacion, NER o analisis de sentimiento con un vocabulario ajustado al idioma.
- Procesamiento de texto clinico en turco: el dominio de medicina esta representado en el entrenamiento, con fertilidad reportada de 2,097 en ese test, util para normalizar terminologia medica.
- Analisis de redes sociales: el dominio de tuit (fertilidad 1,585) y comentarios (1,338) lo hace adecuado para pipelines de moderacion o mineria de opinion en turco.
- Investigacion sobre tokenizacion: comparar fertilidad entre dominios y evaluar el efecto de la repeticion de dominios minoritarios en la calidad del vocabulario.
- Indexacion y busqueda lexica: usar la segmentacion subword para construir indices invertidos o sistemas de recuperacion sobre corpus turcos.

## Benchmarks y rendimiento

El autor publica unicamente metricas de fertilidad (total de tokens dividido por palabras separadas por espacios; menor es mejor). No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo que es coherente con que el artefacto sea un tokenizador y no un modelo.

| Conjunto de test | Fertilidad |
|---|---|
| FineWeb | 1,507 |
| wiki | 1,894 |
| academico | 1,502 |
| comentarios | 1,338 |
| tuit | 1,585 |
| medicina | 2,097 |
| poesia | 2,362 |
| poesia (fuente distinta) | 1,862 |
| tuit (fuente distinta) | 1,406 |
| Ingles | 1,815 |
| Media TR | 1,755 |

La media TR se calcula como promedio de igual peso entre FineWeb y los seis dominios. Las filas "fuente distinta" corresponden a tests de poesia y tuit procedentes de fuentes no usadas en el entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: practicamente inapreciable; un tokenizador BPE no requiere GPU y se ejecuta en CPU con huella de memoria del orden de megabytes para el vocabulario de 64.000 tokens.
- GPU recomendadas: no aplica; cualquier CPU basta para la tokenizacion.
- Caben en GPU consumer: si, pero no es necesario; el coste esta en el modelo que consuma los tokens, no en el tokenizador.
- Opciones de despliegue: libreria `tokenizers` (Rust/Python), `transformers` `AutoTokenizer`, y cualquier framework que consuma vocabularios BPE estilo Hugging Face.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de fertilidad ni de licencia de tokenizadores alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A continuacion se indican alternativas de categoria con los datos conocidos de este artefacto:

| Artefacto | Tipo | Vocabulario | Idiomas | Licencia | Datos de fertilidad |
|---|---|---|---|---|
| canbingol/tr-bpe-fineweb-alan30-64k | Tokenizador BPE byte-level | 64.000 | tr | no disponible | Si (media TR 1,755) |
| Tokenizadores multilingues genericos de familias LLM | Tokenizador BPE | Variable | Multiples | Segun familia | no disponible |
| Tokenizadores monolingues turcos alternativos | Tokenizador BPE | Variable | tr | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ha evaluado a nivel de tokenizador; no se ha entrenado ningun modelo con este vocabulario, por lo que no hay evidencia de rendimiento downstream.
- Los conjuntos de test de los seis dominios provienen de las mismas fuentes que los datos de entrenamiento, de modo que las fertilidades en esos dominios pueden ser optimistas.
- La licencia no esta indicada, lo que impide confirmar si el uso comercial esta permitido; verificar antes de integrarlo en produccion.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- El vocabulario esta disenado solo para turco; su uso sobre otros idiomas degradara la eficiencia (fertilidad reportada de 1,815 en ingles, superior a la media turca).
- La fertilidad en poesia (2,362) y medicina (2,097) es notablemente peor que en comentarios (1,338), lo que anticipa mayor coste de tokens en esos registros.
- No hay informacion sobre sesgos del corpus FineWeb-2 subyacente ni sobre filtrado de contenido.
- Al ser un artefacto de tokenizacion, no aplican riesgos de alucinacion del propio tokenizador, pero la calidad del vocabulario condiciona la del modelo que lo use.

## Enlaces

- Hugging Face: https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-64k
- Libreria `tokenizers` de Hugging Face: https://github.com/huggingface/tokenizers
- Documentacion de `AutoTokenizer`: https://huggingface.co/docs/transformers/main_classes/tokenizer
- FineWeb-2 (corpus base): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

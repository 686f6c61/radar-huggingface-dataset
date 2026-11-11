# canbingol/tr-bpe-fineweb-alan30-128k

## Resumen

`canbingol/tr-bpe-fineweb-alan30-128k` es un tokenizer de tipo byte-level BPE entrenado especificamente para turco por el usuario canbingol. No se trata de un modelo de lenguaje completo, sino de un componente de tokenizacion con un vocabulario de 128 000 entradas, disenado para ser utilizado como pieza de preprocesado en el entrenamiento o la inferencia de modelos de lenguaje en turco. Su publicacion responde a la necesidad de contar con tokenizadores especificos de dominio que reduzcan la fertilidad (numero de tokens por palabra) en un idioma aglutinante como el turco, donde los tokenizadores multilingues genericos suelen fragmentar excesivamente las palabras.

El tokenizer se entreno sobre 1000 millones de caracteres con una composicion controlada: un 70 % procedente de FineWeb-2 en turco y un 30 % restante repartido a partes iguales entre seis dominios (wiki, tweets, comentarios, medicina, academico y poesia), con remuestreo de los dominios minoritarios para equilibrar el volumen. Emplea la libreria `tokenizers` de Hugging Face con `min_frequency=2` y define los tokens especiales `<pad>`, `<unk>`, `<s>` y `</s>`.

La relevancia de esta ficha es acotada: se trata de un artefacto de tokenizacion sin modelo asociado, sin licencia declarada y sin benchmarks de extremo a extremo. Su interes reside en las metricas de fertilidad reportadas por el autor sobre distintos dominios, que permiten evaluar su idoneidad como tokenizador base para modelos turcos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer, sin modelo neuronal) |
| Parametros totales | no disponible (no es un modelo de parametros) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizer) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | Turco (tr); se reporta fertilidad sobre texto en ingles como referencia |
| Licencia | no disponible |
| Formato de pesos | tokenizer de Hugging Face (`tokenizer.json` y ficheros asociados, cargable con `AutoTokenizer`) |

## Arquitectura y entrenamiento

El componente es un tokenizer byte-level BPE implementado con la libreria `tokenizers` de Hugging Face. El vocabulario tiene 128 000 entradas y se entreno con `min_frequency=2`, lo que implica que cualquier par de bytes con al menos dos ocurrencias en el corpus puede fusionarse. Se definen cuatro tokens especiales: `<pad>`, `<unk>`, `<s>` y `</s>`. La regla de pre-segmentacion aplica un tratamiento especifico de los apostrofos: el sufijo que sigue al apostrofo se mantiene como una unidad, de modo que `Türkiye'de` se divide en `Türkiye` + `'de`.

El corpus de entrenamiento consta de 1000 millones de caracteres con la siguiente composicion: 70 % de FineWeb-2 en turco y 30 % distribuido en seis dominios al 5 % cada uno (wiki, tweets, comentarios, medicina, academico y poesia). Los dominios con menos volumen disponible se repitieron para completar su cuota: poesia aproximadamente 12 pasadas, tweets aproximadamente 13, academico aproximadamente 4 y comentarios aproximadamente 2. El autor indica que los textos de test se separaron del corpus de entrenamiento y que no hay solapamiento textual entre ambos conjuntos.

## Capacidades

- Tokenizacion de texto en turco con vocabulario byte-level BPE de 128 000 entradas.
- Segmentacion con tratamiento especifico de apostrofos para preservar sufijos como unidades (`Türkiye'de` → `Türkiye` + `'de`).
- Soporte de los tokens especiales `<pad>`, `<unk>`, `<s>` y `</s>`.
- Carga directa mediante `AutoTokenizer` de Transformers.
- No dispone de capacidades de generacion, razonamiento, codigo, matematicas, vision, tool calling ni agentes: es exclusivamente un tokenizer.
- No se reporta soporte multilingue mas alla del turco; el ingles aparece unicamente como conjunto de test de referencia.

## Casos de uso

- Entrenamiento de modelos de lenguaje en turco desde cero: el tokenizer sirve como capa de preprocesado para un LLM turco, con un vocabulario de 128 000 entradas que reduce la fragmentacion frente a tokenizadores multilingues genericos.
- Fine-tuning de modelos existentes sobre dominio turco: puede emplearse para adaptar el vocabulario a corpus especializados (medicina, academico) y reducir el numero de tokens por palabra en esos dominios.
- Preprocesado de corpus especializados en medicina: la fertilidad reportada de 1.958 en el conjunto de medicina es la mas alta entre los dominios no poeticos, lo que permite dimensionar la longitud efectiva de secuencia al entrenar sobre textos clinicos.
- Procesado de redes sociales y comentarios: las fertilidades de 1.478 (tweets) y 1.285 (comentarios) lo hacen adecuado para pipelines de analisis de texto informal en turco, donde la fragmentacion excesiva encarece la inferencia.
- Investigacion sobre tokenizacion de lenguas aglutinantes: las metricas por dominio permiten comparar estrategias de vocabulario y pre-segmentacion en turco frente a alternativas como los tokenizadores de SentencePiece o los multilingues de modelos abiertos.
- Analisis de poesia y texto literario turco: con una fertilidad de 2.239 en poesia del mismo origen y 1.733 en poesia de fuente distinta, sirve para estudiar el coste de tokenizacion en registros linguisticos alejados del texto web.

## Benchmarks y rendimiento

El autor reporta unicamente metricas de fertilidad (total de tokens dividido entre palabras separadas por espacios; menor es mejor). No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que no se trata de un modelo de lenguaje.

| Conjunto de test | Fertilidad |
|---|---|
| FineWeb | 1.414 |
| wiki | 1.790 |
| academico | 1.413 |
| comentarios | 1.285 |
| tweets | 1.478 |
| medicina | 1.958 |
| poesia | 2.239 |
| poesia (fuente distinta) | 1.733 |
| tweets (fuente distinta) | 1.302 |
| Ingles | 1.602 |
| Media TR | 1.654 |

La "media TR" corresponde a la media ponderada por igual de FineWeb y los seis dominios. Las filas marcadas como "fuente distinta" provienen de fuentes no utilizadas en el entrenamiento.

## Requisitos de hardware

- Al ser un tokenizer, no requiere GPU ni VRAM para su uso: la tokenizacion se ejecuta en CPU.
- El fichero de vocabulario de 128 000 entradas ocupa del orden de unos pocos megabytes en disco, aunque el autor no publica el tamano exacto.
- Compatible con cualquier entorno que soporte la libreria `tokenizers` o `transformers`: Python en CPU, contenedores ligeros, funciones serverless.
- Puede integrarse en pipelines de inferencia desplegados con vLLM, TGI o llama.cpp unicamente como componente de preprocesado, siempre que el modelo asociado se haya entrenado con este vocabulario.
- No se dispone de datos de latencia o throughput medidos por el autor.

## Comparativa con modelos similares

La informacion proporcionada no incluye tokenizadores alternativos comparables con metricas equivalentes, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, este tokenizer se posiciona frente a los tokenizadores multilingues genericos incluidos en modelos abiertos (por ejemplo, los de la familia Llama o Qwen), que cubren muchos idiomas pero suelen presentar mayor fragmentacion en turco. No se dispone de datos publicados en la informacion disponible para cuantificar esa diferencia.

| Criterio | tr-bpe-fineweb-alan30-128k | Tokenizadores multilingues genericos |
|---|---|---|
| Vocabulario | 128 000 | no disponible |
| Idiomas | Turco | Decenas de idiomas |
| Fertilidad en turco | 1.654 (media TR reportada) | no disponible |
| Licencia | no disponible | segun el modelo |
| Datos de entrenamiento publicados | Si (1000 M caracteres, composicion por dominio) | habitualmente no |

## Limitaciones y advertencias

- Solo se ha evaluado a nivel de tokenizer: el autor no entreno ningun modelo con este vocabulario, por lo que no hay evidencia de rendimiento en tareas downstream.
- Los conjuntos de test de los seis dominios provienen de las mismas fuentes que el entrenamiento, por lo que las fertilidades en esos dominios pueden ser optimistas.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; es un riesgo relevante para produccion.
- El vocabulario esta disenado exclusivamente para turco; su uso con otros idiomas producira una fragmentacion elevada (fertilidad de 1.602 en ingles como referencia).
- La fertilidad en poesia (2.239) y medicina (1.958) es notablemente superior a la de otros dominios, lo que incrementa el coste computacional en esos registros.
- No se publican datos sobre sesgos del corpus de entrenamiento (FineWeb-2 y fuentes de tweets, comentarios, medicina, etc.).
- No se dispone de informacion sobre el proceso de limpieza o filtrado del corpus mas alla de la composicion por dominio.
- Al no existir modelo asociado, no aplica el riesgo de alucinacion, pero tampoco hay garantias de calidad en tareas de generacion.

## Enlaces

- Hugging Face: https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-128k
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este tokenizer.

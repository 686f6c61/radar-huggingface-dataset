# canbingol/tr-bpe-fineweb-alan30-32k

## Resumen

`tr-bpe-fineweb-alan30-32k` es un tokenizer de tipo byte-level BPE entrenado específicamente para turco por el usuario canbingol. No es un modelo de lenguaje: es el componente de tokenización que se usaría como paso previo al entrenamiento o despliegue de un LLM en turco. Su vocabulario es de 32.000 tokens y se distribuye a través de Hugging Face con la librería `tokenizers` y compatibilidad con `transformers` mediante `AutoTokenizer`.

El problema que aborda es la ineficiencia de los tokenizers multilingües genéricos sobre turco, una lengua aglutinante en la que las palabras se forman por concatenación de sufijos y donde los tokenizers entrenados mayoritariamente en inglés fragmentan en exceso. El autor reporta una fertility media de 1,892 tokens por palabra en turco sobre una media ponderada de siete dominios, con resultados por debajo de 1,7 en FineWeb, académico y comentarios.

La relevancia es acotada pero concreta: sirve como referencia reproducible para quien entrene un modelo en turco y quiera reducir la longitud efectiva de las secuencias, o para comparar estrategias de pre-tokenización (en particular el tratamiento de los sufijos tras apóstrofo). No se ha publicado ningún modelo entrenado con este tokenizer, por lo que su utilidad es la de un componente aislado y evaluado solo a nivel de tokenización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer, no modelo neuronal) |
| Parametros totales | no disponible (no aplica; vocabulario de 32.000 tokens) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizer) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | turco (tr); se reporta fertility sobre texto en inglés como referencia |
| Licencia | no disponible |
| Formato de pesos | ficheros de tokenizer de Hugging Face (`tokenizers`), cargable con `AutoTokenizer`; no se especifican artefactos adicionales |

## Arquitectura y entrenamiento

El tokenizer emplea byte-level BPE implementado con la librería `tokenizers` de Hugging Face, con `min_frequency=2` y un vocabulario objetivo de 32.000 tokens. La pre-tokenización incluye una regla específica para el turco: el sufijo que sigue a un apóstrofo se mantiene como una unidad separada, de modo que `Türkiye'de` se segmenta en `Türkiye` + `'de`. Esto preserva la integridad de los sufijos casuales tras nombres propios, un patrón muy frecuente en turco escrito.

El corpus de entrenamiento consta de 1.000 millones de caracteres con la siguiente composición: 70 % de FineWeb-2 en turco y un 5 % para cada uno de seis dominios adicionales (wiki, tweets, comentarios, medicina, académico y poesía). Los dominios con menos volumen disponible se repitieron para completar su cuota: poesía aproximadamente 12 pasadas, tweets unas 13, académico unas 4 y comentarios unas 2. Los tokens especiales definidos son `<pad>`, `<unk>`, `<s>` y `</s>`. El autor indica que los textos de test se separaron del corpus de entrenamiento sin solapamiento entre ambos.

## Capacidades

- Tokenización byte-level BPE de texto en turco con vocabulario de 32.000 tokens.
- Segmentación que preserva el sufijo tras apóstrofo como pieza independiente.
- Carga directa mediante `AutoTokenizer.from_pretrained("canbingol/tr-bpe-fineweb-alan30-32k")`.
- Soporte de los tokens especiales `<pad>`, `<unk>`, `<s>` y `</s>`.
- Evaluación de fertility publicada por dominio (FineWeb, wiki, académico, comentarios, tweets, medicina, poesía) y sobre inglés.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni modo de razonamiento: es exclusivamente un tokenizer.

## Casos de uso

- Entrenamiento de un LLM en turco desde cero: usar este tokenizer como capa de tokenización reduce el número de tokens por palabra (fertility media de 1,892) frente a vocabularios centrados en inglés, lo que disminuye la longitud de secuencia y el coste computacional por documento.
- Ajuste fino de un modelo existente con vocabulario ampliado: sustituir o extender el vocabulario del modelo base con este tokenizer para mejorar la eficiencia sobre corpus turcos, especialmente en dominios como medicina (fertility 2,270) donde la fragmentación es mayor.
- Preprocesamiento de corpus periodísticos y web: con fertility de 1,642 sobre FineWeb, es adecuado para pipelines que ingieren grandes volúmenes de texto turco de la web y necesitan minimizar el número de tokens almacenados.
- Procesamiento de contenido académico: fertility de 1,633 en el dominio académico, útil para indexar o entrenar sobre artículos y tesis en turco.
- Análisis de redes sociales: fertility de 1,729 en tweets del corpus de entrenamiento y 1,547 en tweets de una fuente no vista, lo que lo hace viable para clasificación y moderación de contenido en turco coloquial.
- Investigación sobre tokenización de lenguas aglutinantes: sirve como punto de comparación reproducible para estudiar el efecto de la pre-tokenización de sufijos y de la mezcla de dominios en la fertility.
- Evaluación comparativa de tokenizers: al publicar métricas por dominio y sobre fuentes no vistas (poesía y tweets), permite contrastar con tokenizers multilingües en las mismas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de fertility (total de tokens dividido por número de palabras separadas por espacio; menor es mejor):

| Test set | Fertility |
|---|---|
| FineWeb | 1,642 |
| wiki | 2,034 |
| académico | 1,633 |
| comentarios | 1,423 |
| tweets | 1,729 |
| medicina | 2,270 |
| poesía | 2,513 |
| poesía (fuente distinta) | 2,015 |
| tweets (fuente distinta) | 1,547 |
| inglés | 2,060 |
| Media turca (TR promedio) | 1,892 |

La media turca se calcula como promedio de pesos iguales entre FineWeb y los seis dominios. Las filas marcadas como "fuente distinta" corresponden a tests de poesía y tweets procedentes de fuentes no utilizadas en el entrenamiento.

## Requisitos de hardware

- Un tokenizer no requiere GPU: la tokenización se ejecuta en CPU.
- Memoria en RAM: el vocabulario de 32.000 tokens y las fusiones BPE ocupan del orden de megabytes; no se dispone de una cifra exacta publicada.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: sí, al no requerir acelerador.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), librería `tokenizers` de Hugging Face y cualquier runtime que consuma vocabularios BPE compatibles; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de tokenizers alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, este tokenizer se sitúa en la categoría de tokenizers monolingües para turco con vocabulario de 32.000 tokens, frente a los tokenizers multilingües de vocabulario mayor (típicamente 100.000-250.000 tokens) empleados por los LLM generalistas, que suelen presentar mayor fragmentación en lenguas aglutinantes. No se han publicado comparaciones directas con `dbmdz/bert-base-turkish-cased`, `google/gemma` u otros vocabularios en la información disponible.

## Limitaciones y advertencias

- Solo se ha evaluado a nivel de tokenizer: el autor indica explícitamente que no se ha entrenado ningún modelo con este vocabulario, por lo que no hay evidencia de su impacto en la calidad de un LLM.
- Sesgo de evaluación por dominio: los test sets de los seis dominios proceden de las mismas fuentes que el corpus de entrenamiento, de modo que las cifras en wiki, académico, comentarios, tweets, medicina y poesía pueden ser optimistas; solo las filas de "fuente distinta" y la de inglés escapan parcialmente a este sesgo.
- Rendimiento débil en poesía: fertility de 2,513 en el test de poesía del corpus de entrenamiento y 2,015 en una fuente distinta, el peor resultado del conjunto; no es recomendable para corpus poéticos sin un análisis previo.
- Medicina es el dominio con mayor fragmentación entre los evaluados con datos propios (2,270), lo que sugiere vocabulario insuficiente para terminología médica turca.
- Cobertura limitada al turco: sobre inglés la fertility es de 2,060, claramente peor que la media turca, por lo que no es adecuado para cargas multilingües.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse antes de integrarlo en producción.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado: no hay validación de la comunidad ni integración documentada en frameworks de inferencia.
- El corpus de entrenamiento incluye datos de FineWeb-2 y de redes sociales, por lo que puede arrastrar los sesgos y la calidad variable de esas fuentes.

## Enlaces

- Hugging Face: https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-32k
- Librería `tokenizers` de Hugging Face: https://github.com/huggingface/tokenizers
- Documentación de `AutoTokenizer`: https://huggingface.co/docs/transformers/main_classes/tokenizer
- FineWeb-2 (origen del 70 % del corpus): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este tokenizer.

# egeboy35/gemma-4-31B-it-mret-128k-merged

## Resumen

`egeboy35/gemma-4-31B-it-mret-128k-merged` es un tokenizer extendido para el modelo `google/gemma-4-31B-it`, publicado por el usuario egeboy35. No se trata de un modelo completo con pesos, sino de un repositorio que contiene exclusivamente el tokenizer ampliado con 85.450 tokens turcos aprendidos mediante el método MRET 128K. El objetivo es mejorar la compresión y la segmentación morfológica del turco manteniendo intacta la identidad de todos los tokens base y especiales, de modo que la plantilla de chat, los ids de configuración y el vocabulario original de Gemma 4 se preservan.

La relevancia de esta ficha es limitada en cuanto a modelo se refiere: el repositorio no incluye pesos y su tamaño es de 0,0 GB. Para utilizarlo es necesario descargar el modelo base `google/gemma-4-31B-it` por separado, redimensionar la matriz de embeddings e inicializar las nuevas filas, que después deben entrenarse mediante preentrenamiento continuado. El tokenizer logra reducir el número de tokens por cada 1.000 caracteres en turco de 304,3 (base) a 182,0 (promedio independiente), a costa de alterar la tokenización de inglés y código.

La arquitectura subyacente es la del modelo base Gemma 4 de 31B parámetros, de la que no se proporcionan detalles técnicos en la información disponible. El tokenizer emplea BPE con merges aprendidos sobre un corpus turco de 300 millones de palabras, con ponderación 4x para texto de foros, redes sociales y comentarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE sobre modelo base Gemma 4 (transformer, detalles no disponibles) |
| Parametros totales | No disponible (el repositorio solo contiene tokenizer; el modelo base es de 31B según su nombre) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el nombre indica 128k, pero no se confirma en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica: repositorio solo de tokenizer (archivos de tokenizer, sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente el tokenizer, no pesos del modelo. El tokenizer parte del vocabulario de `google/gemma-4-31B-it` (262.144 tokens) y añade 85.450 tokens turcos nuevos aprendidos con MRET 128K. Para hacer sitio, se eliminan tokens base que nunca aparecen en una muestra de 300 millones de palabras turcas, en texto inglés y código, o en los documentos de desarrollo (mayoritariamente otros alfabetos), reutilizando sus ids. Todos los demás tokens base y todos los tokens especiales conservan su id, por lo que `bos`, `eos`, la plantilla de chat y los ids de configuración son los del modelo base.

Los nuevos merges se aprenden a partir de caracteres dentro de tokens MRET, sobre recuentos de palabras turcas de 300 millones de palabras (foro, redes sociales y comentarios ponderados 4x), divididos por el pre-tokenizer base. Los nuevos merges se sitúan antes de los merges base, de forma que el texto turco sigue más de cerca la segmentación de MRET, mientras que el inglés y el código también se tokenizan de forma distinta a la base. No se proporciona información sobre el entrenamiento del modelo base Gemma 4 (número de tokens, composición del dataset, RLHF/DPO) en la documentación disponible.

## Capacidades

- Extensión de vocabulario para turco: añade 85.450 tokens nuevos orientados a morfología turca, con mejor ajuste a fronteras de raíz y sufijo.
- Compresión de texto turco: reduce tokens por cada 1.000 caracteres de 304,3 a 182,0 en promedio independiente.
- Preservación de tokens especiales: todos los tokens especiales y la plantilla de chat del modelo base mantienen su id.
- Compatibilidad con el modelo base: pensado para usarse con `google/gemma-4-31B-it` tras redimensionar embeddings.
- Capacidades del modelo base (no verificadas en esta información): al ser un modelo Gemma 4 de 31B, se le supone generación de texto, razonamiento y posiblemente visión (la pipeline declarada es image-text-to-text), pero no se detallan en la documentación proporcionada.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible en la información.
- Capacidades multilingües: turco e inglés declarados; el resto no disponible.

## Casos de uso

- Preprocesamiento de corpus turcos: usar el tokenizer para tokenizar grandes volúmenes de texto turco con mayor compresión (182 tokens por 1.000 caracteres frente a 304 del base), reduciendo coste computacional en entrenamiento e inferencia.
- Adaptación de Gemma 4 al turco: servir como base para preentrenamiento continuado del modelo Gemma 4 de 31B, inicializando las nuevas filas de embeddings con la media de los embeddings de los subtokens correspondientes.
- Análisis morfológico y lingüístico: aprovechar la mejora en F1 de fronteras morfológicas (49,97 frente a 33,31 del base) para tareas de segmentación raíz-sufijo en turco.
- Sistemas de búsqueda y recuperación en turco: reducir el número de tokens por documento mejora la eficiencia de índices y la relación señal-ruido en modelos de recuperación.
- Procesamiento de documentos oficiales turcos: el tokenizer muestra 183,3 tokens por 1.000 caracteres en el Boletín Oficial de 2026, frente a 310,3 del base, lo que resulta útil para pipelines de documentos administrativos.
- Investigación en tokenización multilingüe: permite comparar estrategias de extensión de vocabulario (MRET frente a BPE sobre FineWeb) con métricas de compresión y morfología.
- Despliegue de asistentes conversacionales en turco: al conservar la plantilla de chat y los tokens especiales, se puede integrar en pipelines conversacionales una vez entrenado el modelo adaptado.

## Benchmarks y rendimiento

Resultados del tokenizer en tokens por cada 1.000 caracteres (menor es mejor) y métricas morfológicas:

| Tokenizer | Vocab | Nuevos tokens | Official 2026 ↓ | Wikipedia 2026 ↓ | News 2026 ↓ | Promedio indep. ↓ | Test propio ↓ | Morph F1 ↑ | Root acc. ↑ | Tokens vs base en/py/C++ ↓ | Cambios de id especiales ↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 262.144 | 0 | 310,3 | 310,4 | 292,2 | 304,3 | 309,4 | 33,31 | 41,48 | 1,000 / 1,000 / 1,000 | 0 |
| gemma-4-31B-it-tr-bpe-fineweb-alan30-128k-merged | 262.144 | 102.229 | 196,0 | 195,9 | 169,5 | 187,1 | 195,5 | 49,24 | 49,48 | 1,009 / 0,969 / 0,945 | 0 |
| gemma-4-31B-it-mret-128k-merged | 262.144 | 85.450 | 183,3 | 191,3 | 171,4 | 182,0 | 188,8 | 49,97 | 52,35 | 0,972 / 0,955 / 0,921 | 0 |

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el repositorio no contiene pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el tokenizer (no requiere GPU). Para el modelo base Gemma 4 de 31B, no se proporcionan estimaciones en la información.
- GPU recomendadas: no disponible en la información.
- Compatibilidad con GPU de consumo: no disponible en la información.
- Opciones de despliegue: el tokenizer es compatible con la librería `transformers` (versión 5.x según la model card, medida con `tokenizers` 0.23.3). Para el modelo base no se detallan opciones de despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Nuevos tokens | Promedio indep. ↓ | Morph F1 ↑ | Root acc. ↑ | Licencia |
|---|---|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 262.144 | 0 | 304,3 | 33,31 | 41,48 | Apache 2.0 |
| canbingol/gemma-4-31B-it-tr-bpe-fineweb-alan30-128k-merged | 262.144 | 102.229 | 187,1 | 49,24 | 49,48 | Apache 2.0 |
| egeboy35/gemma-4-31B-it-mret-128k-merged | 262.144 | 85.450 | 182,0 | 49,97 | 52,35 | Apache 2.0 |

La comparativa se limita a tokenizers sobre el mismo modelo base, ya que no se dispone de información sobre modelos completos alternativos de 31B con adaptación al turco.

## Limitaciones y advertencias

- Solo tokenizer: el repositorio no contiene pesos; las nuevas filas de embeddings deben aprenderse mediante preentrenamiento continuado.
- El inglés y el código se tokenizan de forma distinta al modelo base, por lo que el modelo debe adaptarse también a ese cambio.
- Los tokens base eliminados (mayoritariamente de otros alfabetos) dejan de estar disponibles para el modelo.
- Las variantes que conservan la tokenización base de inglés y código obtuvieron peor morfología turca en las pruebas del autor, y una de ellas perdió la mayor parte de la ganancia de compresión.
- El conjunto de test morfológico se había usado en versiones anteriores de MRET, por lo que no está limpio.
- Los resultados se midieron con `tokenizers` 0.23.3 y `transformers` 5.x; otras versiones pueden dar resultados distintos.
- No se dispone de información sobre sesgos, alucinación o restricciones de uso comercial más allá de la licencia Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-22), lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/egeboy35/gemma-4-31B-it-mret-128k-merged
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Método MRET 128K: https://huggingface.co/egeboy35/mret-128k
- Tokenizer alternativo de canbingol: https://huggingface.co/canbingol/gemma-4-31B-it-tr-bpe-fineweb-alan30-128k-merged
- Dataset de análisis morfológico: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis

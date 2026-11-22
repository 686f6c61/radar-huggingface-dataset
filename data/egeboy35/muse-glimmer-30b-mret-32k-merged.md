# egeboy35/Muse-Glimmer-30B-mret-32k-merged

## Resumen

Muse-Glimmer-30B-mret-32k-merged es un tokenizer extendido para el modelo multimodal meta-models/Muse-Glimmer-30B, publicado por el usuario egeboy35. No contiene pesos: es exclusivamente un vocabulario ampliado con 21.830 tokens turcos aprendidos mediante el método MRET 32K, que eleva el vocabulario de 202.048 a 223.878 entradas. El objetivo es mejorar la compresión y la segmentación morfológica del turco sin alterar los identificadores de los tokens base ni de los tokens especiales, de modo que la plantilla de chat y la configuración del modelo original se mantienen intactas.

El interés técnico reside en la estrategia de expansión: los nuevos merges se aprenden a partir de caracteres internos a los tokens MRET y se penalizan cuando cruzan fronteras entre tokens MRET, con una penalización adicional en la primera frontera de cada palabra (aproximación a la frontera de raíz). Esto produce una segmentación más alineada con la morfología aglutinante del turco, con una F1 de fronteras de 58,74 frente a 36,20 del tokenizer base y 49,30 de la alternativa de canbingol.

Es relevante para equipos que quieran adaptar Muse-Glimmer-30B al turco: el tokenizer reduce el número de tokens por cada 1.000 caracteres de 280,7 a 211,8 de media en textos independientes de 2026, lo que se traduce directamente en menor coste de contexto y mayor throughput efectivo. El repositorio, sin embargo, está vacío en el momento de la consulta (0,0 GB) y no incluye los embeddings nuevos, que deben entrenarse mediante preentrenamiento continuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE con merges MRET (modelo base: Muse-Glimmer-30B, arquitectura no disponible) |
| Parametros totales | No disponible (el repositorio solo contiene tokenizer) |
| Parametros activos | No disponible |
| Longitud de contexto | 32.000 tokens (según el sufijo "32k" del nombre; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; solo artefactos de tokenizer (vocab, merges, tokenizer_config) para transformers |

## Arquitectura y entrenamiento

El tokenizer parte del vocabulario BPE de Muse-Glimmer-30B (202.048 tokens) y añade 21.830 tokens turcos nuevos hasta alcanzar 223.878 entradas, el mismo tamaño que la variante de canbingol. Los merges nuevos se aprenden sobre recuentos de palabras turcas de una muestra de 300 millones de palabras con la mezcla de dominios original (texto web ponderado 4x), dividida por el pre-tokenizer base, de modo que un token nuevo nunca contiene una frontera MRET donde fue aprendido. La función de puntuación penaliza cada cruce entre tokens MRET y aplica una penalización quíntuple en la primera frontera de la palabra, proxy de la frontera de raíz: `score = inside count − crossing count − 5 × root crossing count`. Los merges nuevos se colocan antes de los merges base.

Para liberar espacio en el vocabulario se reutilizan los identificadores de tokens base que no aparecen en la muestra turca, en texto inglés y código, ni en los documentos de desarrollo (principalmente otros alfabetos). El resto de tokens base y todos los especiales conservan su id, por lo que `bos`, `eos`, la plantilla de chat y los ids de configuración son los del modelo original. La model card no documenta datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones de arquitectura del mismo.

## Capacidades

- Tokenización BPE optimizada para turco con segmentación alineada con la morfología de raíz y sufijos.
- Compresión de texto turco: 210,1 tokens por 1.000 caracteres en documentos oficiales de 2026, 223,8 en Wikipedia y 201,6 en noticias, frente a 290,4 / 283,7 / 268,0 del tokenizer base.
- Mejora de fronteras morfológicas: F1 de 58,74 y precisión de raíz de 66,90 en el conjunto de análisis morfológico de turkish-nlp-suite, frente a 36,20 y 43,43 del base.
- Compatibilidad total con los ids especiales del modelo base (0 desplazamientos de ids especiales, frente a 2.048 en la alternativa de canbingol).
- Tokenización de inglés y código distinta a la del base (ratios de 1,016 / 1,014 / 1,010 tokens respecto al base en inglés, Python y C++), lo que exige adaptación del modelo.
- Capacidades del modelo subyacente (generación de texto, razonamiento, visión image-text-to-text, tool calling, agentes): no documentadas en la información disponible para Muse-Glimmer-30B.
- No incluye embeddings: cada nuevo token puede generarse al codificar su texto aislado, pero las filas nuevas de la matriz de embeddings deben inicializarse (por ejemplo, con la media de los embeddings de los subtokens base) y entrenarse.

## Casos de uso

- Adaptación de Muse-Glimmer-30B al turco: inicializar los embeddings de los 21.830 tokens nuevos con la media de los subtokens base (código incluido en la model card) y continuar el preentrenamiento en corpus turcos para que el modelo aproveche la mejor compresión.
- Reducción de coste de contexto en producción: al pasar de 280,7 a 211,8 tokens por 1.000 caracteres de media, un mismo documento turco ocupa aproximadamente un 25 % menos de ventana, lo que permite procesar más documentos por petición o alargar el historial de conversación.
- Procesamiento de documentos oficiales turcos: la mejora más acusada se da en el Boletín Oficial (210,1 frente a 290,4 tokens por 1.000 caracteres), útil para pipelines de extracción y resumen de legislación.
- Sistemas de recuperación aumentada (RAG) sobre Wikipedia turca: la reducción a 223,8 tokens por 1.000 caracteres permite indexar más fragmentos en el mismo presupuesto de contexto del modelo.
- Análisis morfológico y preprocesado lingüístico: con F1 de fronteras de 58,74 y precisión de raíz de 66,90, el tokenizer sirve como componente de segmentación para tareas de etiquetado, lematización o búsqueda morfológica en turco.
- Evaluación comparativa de tokenizers: útil como referencia para medir el impacto de la expansión de vocabulario en la compresión y la morfología antes de invertir en preentrenamiento continuado.
- Modelos bilingües turco-inglés: al conservar los ids especiales y la plantilla de chat, se puede integrar en stacks existentes sin reconfigurar el pipeline de inferencia, asumiendo la readaptación del modelo a la nueva tokenización inglesa y de código.

## Benchmarks y rendimiento

Resultados de tokenización publicados en la model card (tokens por 1.000 caracteres, menor es mejor; morfología, mayor es mejor):

| Tokenizer | Vocab | Nuevos | Oficial 2026 | Wikipedia 2026 | Noticias 2026 | Media indep. | Test propio | F1 morf. | Prec. raíz | Tokens vs base (en/py/C++) | Desplaz. ids esp. |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 202.048 | 0 | 290,4 | 283,7 | 268,0 | 280,7 | 288,0 | 36,20 | 43,43 | 1,000 / 1,000 / 1,000 | 0 |
| canbingol tr-bpe-fineweb-alan30-32k-merged | 223.878 | 21.830 | 224,4 | 224,4 | 199,6 | 216,1 | 224,3 | 49,30 | 53,88 | 1,009 / 1,009 / 1,008 | 2.048 |
| egeboy35 mret-32k-merged | 223.878 | 21.830 | 210,1 | 223,8 | 201,6 | 211,8 | 218,5 | 58,74 | 66,90 | 1,016 / 1,014 / 1,010 | 0 |

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El repositorio no contiene pesos: no requiere VRAM para el tokenizer en sí.
- Para usar el tokenizer junto al modelo base Muse-Glimmer-30B (30B parámetros), la VRAM estimada de inferencia es de aproximadamente 60 GB en bf16/fp16 (no confirmado en la información disponible), y de unos 30 GB en cuantización de 8 bits y 15-18 GB en 4 bits, estimaciones genéricas para 30B.
- GPU recomendadas para el modelo base: A100 80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) solo con cuantización de 4 bits.
- El tokenizer cabe en cualquier consumer GPU y en CPU; el cuello de botella es el modelo base.
- Opciones de despliegue: transformers (versión 5.x según la model card, con tokenizers 0.23.3); otras opciones como vLLM, llama.cpp u Ollama no están documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Nuevos tokens | Media tokens/1.000 car. | F1 morfología | Precisión raíz | Ids especiales | Licencia |
|---|---|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 202.048 | 0 | 280,7 | 36,20 | 43,43 | Sin cambios | Apache 2.0 |
| canbingol/Muse-Glimmer-30B-tr-bpe-fineweb-alan30-32k-merged | 223.878 | 21.830 | 216,1 | 49,30 | 53,88 | 2.048 desplazados | No disponible |
| egeboy35/Muse-Glimmer-30B-mret-32k-merged | 223.878 | 21.830 | 211,8 | 58,74 | 66,90 | Sin cambios | Apache 2.0 |

Frente al tokenizer base, la variante MRET mejora la compresión un 24,5 % de media y casi duplica la F1 morfológica. Frente a la alternativa de canbingol, mejora la compresión un 2 % de media y la F1 morfológica en 9,44 puntos, a costa de tokenizar peor las noticias de 2026 (201,6 frente a 199,6) y de alterar más la tokenización de inglés y código.

## Limitaciones y advertencias

- Solo tokenizer: las filas nuevas de embeddings deben aprenderse mediante preentrenamiento continuado; sin ese paso el modelo no aprovecha los tokens nuevos.
- El inglés y el código se tokenizan de forma distinta al base (ratios de 1,016 / 1,014 / 1,010), por lo que el modelo también debe adaptarse a esa nueva segmentación.
- Los tokens base eliminados (principalmente de otros alfabetos) dejan de estar disponibles para el modelo.
- El repositorio figura con tamaño de 0,0 GB en la información disponible, lo que sugiere que los artefactos del tokenizer pueden no estar subidos; conviene verificar antes de usarlo.
- La longitud de contexto de 32k se infiere del nombre y no está confirmada en la model card.
- El conjunto de prueba morfológico se usó en versiones anteriores de MRET, por lo que no es un conjunto limpio; la propia autora lo advierte.
- Resultados medidos con tokenizers 0.23.3 y transformers 5.x; versiones distintas pueden dar tokenizaciones diferentes.
- No hay información sobre sesgos, alucinación ni restricciones adicionales del modelo base más allá de la licencia Apache 2.0.
- Licencia Apache 2.0, igual que el modelo base, permite uso comercial; verificar las condiciones del modelo base por si añade restricciones.

## Enlaces

- Repositorio del tokenizer: https://huggingface.co/egeboy35/Muse-Glimmer-30B-mret-32k-merged
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Tokenizer MRET 32K: https://huggingface.co/egeboy35/mret-32k
- Tokenizer alternativo de canbingol: https://huggingface.co/canbingol/Muse-Glimmer-30B-tr-bpe-fineweb-alan30-32k-merged
- Dataset de análisis morfológico: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis

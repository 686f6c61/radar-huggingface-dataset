# egeboy35/gemma-4-31B-it-mret-32k-merged

## Resumen

`egeboy35/gemma-4-31B-it-mret-32k-merged` es un tokenizer para el modelo multimodal `google/gemma-4-31B-it`, publicado por el usuario egeboy35. No contiene pesos del modelo: es exclusivamente un vocabulario extendido que añade 21.875 tokens turcos aprendidos con el método MRET 32K, manteniendo intactos los identificadores de todos los tokens base y especiales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de investigación sin tracción comunitaria.

El problema que aborda es la ineficiencia del tokenizer original de Gemma para turco: el vocabulario base consume 310,3 tokens por cada 1.000 caracteres en textos oficiales de 2026, frente a los 208,3 del tokenizer extendido, una reducción del 32,9 %. Además, mejora la segmentación morfológica (F1 de fronteras de 33,31 a 50,84 y precisión de raíz de 41,48 a 58,65). Es relevante para quien quiera adaptar Gemma 4 a turco con menor coste de contexto y mejor alineación con la morfología aglutinante del idioma.

La extensión reutiliza identificadores de tokens base eliminados (mayoritariamente de otros alfabetos) para no aumentar el tamaño del vocabulario, que se mantiene en 262.144 entradas, idéntico al del tokenizer de canbingol que sirve de referencia comparativa. El modelo base es multimodal (image-text-to-text) de 31B parámetros, aunque la model card no documenta arquitectura ni datos de entrenamiento del modelo, solo del tokenizer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo el tokenizer; el modelo base es `google/gemma-4-31B-it`) |
| Parámetros totales | 31B (según el nombre del modelo base; no verificado en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el sufijo "32k" del nombre hace referencia al conjunto de tokens MRET, no a la ventana de contexto) |
| Tipos de cuantización | no disponible (el repositorio no contiene pesos) |
| Idiomas soportados | tr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (solo tokenizer: ficheros de vocabulario y merges en formato `tokenizers`/`transformers`) |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE derivado del de `google/gemma-4-31B-it`. Los nuevos merges se aprenden a partir de caracteres internos de los tokens de MRET 32K, sobre un corpus de 300 millones de palabras en turco con la mezcla de dominios original (texto web ponderado 4x), dividido por el pre-tokenizer del modelo base. Esto garantiza que ningún token nuevo contenga una frontera de token MRET en el punto donde se aprendió. Los merges nuevos se colocan antes de los merges base, de forma análoga a los tokenizers fusionados de canbingol.

Se añaden 21.875 tokens turcos y el vocabulario se mantiene en 262.144 entradas. Para hacer sitio, se eliminan tokens base que no aparecen en la muestra de 300 millones de palabras turcas, en texto inglés y código, ni en los documentos de desarrollo (principalmente de otros alfabetos); sus identificadores se reutilizan. Todos los demás tokens base y todos los especiales conservan su id, incluidos `bos`, `eos`, la plantilla de chat y los ids de configuración. Cada token nuevo es producible: codificar su texto aislado devuelve ese token. La model card no documenta entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos no están disponibles.

## Capacidades

- Extensión de vocabulario para turco: reduce el consumo de tokens entre un 31,3 % y un 32,9 % según la fuente (documentos oficiales, Wikipedia y noticias de 2026) respecto al tokenizer base.
- Mejora de segmentación morfológica: F1 de fronteras de 50,84 frente a 49,24 del tokenizer de canbingol y 33,31 del base; precisión de raíz de 58,65 frente a 53,95 y 41,48 respectivamente.
- Preservación de identificadores: ningún token base ni especial cambia de id, lo que permite reutilizar plantillas de chat y configuración del modelo original.
- Compatibilidad con `transformers` 5.x y `tokenizers` 0.23.3.
- Tokenización de inglés y código alterada respecto al base (0,990, 0,966 y 0,932 tokens relativos en documentación de PyTorch, Python y C++), lo que exige adaptación del modelo.
- No incluye capacidades de generación, tool calling, agentes ni visión por sí mismo: esas capacidades pertenecen al modelo base y no se documentan en este repositorio.

## Casos de uso

- Adaptación de Gemma 4 a turco con preentrenamiento continuado: el tokenizer sirve como punto de partida para reentrenar las filas de embedding nuevas (21.875) y ajustar el modelo al vocabulario extendido, reduciendo el coste por token en producción turca.
- Reducción de coste de contexto en aplicaciones turcas: al consumir un 32,9 % menos de tokens en documentos oficiales, un mismo presupuesto de contexto cubre aproximadamente un 49 % más de texto turco.
- Procesamiento de documentos oficiales (Boletín Oficial): la mejora medida sobre documentos de agosto a noviembre de 2026 (310,3 a 208,3 tokens por 1.000 caracteres) lo hace adecuado para pipelines de indexación y búsqueda legal.
- Análisis morfológico y lingüística computacional: la mejora en fronteras de morfema y precisión de raíz facilita tareas de etiquetado morfológico y análisis de palabras flexionadas en turco.
- Investigación comparativa de tokenizers: sirve como referencia reproducible frente a `canbingol/gemma-4-31B-it-tr-bpe-fineweb-alan30-32k-merged` para estudiar el impacto de distintas estrategias de extensión de vocabulario.
- Evaluación de compromisos multilingües: permite medir cómo la alteración de la tokenización de inglés y código afecta al rendimiento del modelo tras el ajuste, en escenarios de código y documentación técnica.

## Benchmarks y rendimiento

Resultados del tokenizer en tokens por 1.000 caracteres (menor es mejor) y métricas morfológicas. Textos independientes de 2026 no usados para construir MRET ni el tokenizer.

| Tokenizer | Vocab | Tokens nuevos | Official 2026 ↓ | Wikipedia 2026 ↓ | News 2026 ↓ | Media indep. ↓ | Test split propio ↓ | F1 morfol. ↑ | Prec. raíz ↑ | Tokens vs base en/py/C++ ↓ | Cambios de id especiales ↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 262.144 | 0 | 310,3 | 310,4 | 292,2 | 304,3 | 309,4 | 33,31 | 41,48 | 1,000 / 1,000 / 1,000 | 0 |
| canbingol/gemma-4-31B-it-tr-bpe-fineweb-alan30-32k-merged | 262.144 | 21.875 | 227,3 | 217,7 | 192,8 | 212,6 | 221,0 | 49,24 | 53,95 | 1,000 / 0,980 / 0,943 | 0 |
| egeboy35/gemma-4-31B-it-mret-32k-merged | 262.144 | 21.875 | 208,3 | 215,2 | 195,7 | 206,4 | 212,9 | 50,84 | 58,65 | 0,990 / 0,966 / 0,932 | 0 |

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El repositorio no contiene pesos, por lo que no requiere VRAM por sí mismo; los requisitos corresponden al modelo base `google/gemma-4-31B-it`.
- VRAM estimada para el modelo base de 31B: no disponible en la información proporcionada; a título orientativo, un modelo de 31B en bf16 requiere aproximadamente 62 GB solo para pesos, pero este dato no está confirmado en la documentación consultada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: `transformers` 5.x con `tokenizers` 0.23.3; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se documentan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Tokens nuevos | Media independiente (tokens/1.000 car.) ↓ | F1 morfol. ↑ | Licencia |
|---|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 262.144 | 0 | 304,3 | 33,31 | Apache 2.0 |
| canbingol/gemma-4-31B-it-tr-bpe-fineweb-alan30-32k-merged | 262.144 | 21.875 | 212,6 | 49,24 | Apache 2.0 (según base) |
| egeboy35/gemma-4-31B-it-mret-32k-merged | 262.144 | 21.875 | 206,4 | 50,84 | Apache 2.0 |

## Limitaciones y advertencias

- Solo tokenizer: las nuevas filas de embedding deben aprenderse mediante preentrenamiento continuado; el repositorio no incluye pesos ni modelo entrenado.
- La tokenización de inglés y código difiere de la del base, por lo que el modelo debe adaptarse también a ese cambio; casi ningún documento de los 712 ficheros de PyTorch, Python y C++ se tokeniza igual que con el base.
- Las variantes que preservan la tokenización base de inglés y código obtuvieron peor morfología turca en las pruebas del autor, y una de ellas perdió la mayor parte de la ganancia de compresión.
- Los tokens base eliminados (mayoritariamente de otros alfabetos) dejan de estar disponibles para el modelo.
- El conjunto de prueba morfológico se había usado en versiones anteriores de MRET, por lo que no está limpio.
- No se documentan sesgos, riesgo de alucinación ni restricciones adicionales de licencia más allá de Apache 2.0.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/egeboy35/gemma-4-31B-it-mret-32k-merged
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Tokenizer MRET 32K: https://huggingface.co/egeboy35/mret-32k
- Tokenizer comparativo de canbingol: https://huggingface.co/canbingol/gemma-4-31B-it-tr-bpe-fineweb-alan30-32k-merged
- Dataset de análisis morfológico: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis

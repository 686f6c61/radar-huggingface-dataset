# nesicn/nc-turkce-bpe-128k-top50k-muse-glimmer-30b

## Resumen

`nc-turkce-bpe-128k-top50k-muse-glimmer-30b` es un tokenizador publicado por el usuario `nesicn` en Hugging Face, no un modelo de lenguaje completo. Se trata de una extensión del tokenizador del modelo Muse-Glimmer-30B (referenciado en la model card como `meta-models/Muse-Glimmer-30B`) a la que se han añadido exactamente 50.000 tokens seleccionados del vocabulario turco NC-128k, un BPE byte-level entrenado desde cero sobre un corpus turco por el mismo autor.

El objetivo es reducir la fragmentación del turco en el tokenizador original. Según los datos del autor, sobre el mismo texto de prueba se consigue una reducción del 27,6 % en número de tokens (de 275,4 a 198,1 tokens por cada 1.000 caracteres) y una mejora del F1 en fronteras morfológicas de 36,20 a 57,24, a cambio de un incremento del 2,9 % en inglés y del 1,0 % en código. El vocabulario total (202.048) y los IDs de tokens especiales se mantienen idénticos al original: los nuevos tokens ocupan los IDs de los 50.000 tokens de mayor ID que se descartan.

Es relevante porque aborda un problema recurrente en modelos multilingües: la ineficiencia de la tokenización de lenguas aglutinantes como el turco. La advertencia principal es que los nuevos tokens carecen de embeddings entrenados, por lo que el tokenizador no puede usarse directamente con los pesos originales de Muse-Glimmer-30B sin inicializar y entrenar previamente esas filas de embedding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE byte-level (extensión de vocabulario sobre Muse-Glimmer-30B) |
| Parametros totales | No aplica (tokenizador, no modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (heredada del modelo destino, no especificada) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json` (cargable con `transformers` ≥ 5.22.2 vía `TokenizersBackend`) |

## Arquitectura y entrenamiento

El tokenizador parte del vocabulario de Muse-Glimmer-30B y le inyecta 50.000 tokens procedentes de NC-128k, un BPE byte-level entrenado desde cero sobre un corpus turco. El criterio de selección es la frecuencia de uso en el corpus de entrenamiento de NC-128k, restringida a tokens de al menos 4 caracteres (sin contar el espacio inicial de palabra). Además de los tokens seleccionados se incorporaron sus ancestros BPE para que cada token pueda construirse a partir de sus piezas: 1.383 de los tokens añadidos son intermedios de menos de 4 caracteres y el 97,2 % restante tiene 4 o más caracteres (media de 7,4 caracteres). En total se importaron 76.213 reglas de merge de NC-128k, de las cuales 26.056 ya existían en el vocabulario destino y no consumieron presupuesto.

El proceso de construcción consistió en crear un sub-tokenizador cerrado bajo ancestros a partir de las reglas seleccionadas, convertir sus tokens byte-level a la representación textual que espera la herramienta de merge (espacio a `▁`, bytes sueltos a `<0xXX>`) y aplicar `bpe-tokenizer-editor` 0.2.0. Se descartaron 162 tokens que representaban fragmentos UTF-8 incompletos y no podían convertirse a texto. El autor documenta además un segundo método alternativo (podar desde el vocabulario completo de NC-128k) cuya salida coincidía en un 94,8 % con la selección final; la elección entre ambos se fijó mediante una regla escrita antes de medir, y al quedar la diferencia por debajo del umbral del 0,1 % se optó por el método más simple. El normalizador, la pre-tokenización, el decoder y las plantillas de chat son idénticos a los del tokenizador destino.

## Capacidades

- Tokenización y detokenización sin pérdida: en todos los textos de prueba se cumple `decode(encode(x)) == x` y no se genera el token `<unk>`.
- Compresión mejorada del turco: −27,6 % de tokens sobre el mismo texto frente al tokenizador original.
- Mejora en la segmentación morfológica del turco: F1 de fronteras de 36,20 a 57,24.
- Preservación razonable del inglés y del código: +2,9 % y +1,0 % de tokens respectivamente.
- Compatibilidad con `transformers` 5.22.2, que carga el repositorio como `TokenizersBackend` y produce los mismos IDs que `tokenizer.json`.
- Mapa de correspondencia `merged-to-original-token-ids.json` que asocia cada ID nuevo con sus tokens originales, útil para inicializar embeddings.
- No incluye capacidades de generación, razonamiento, tool calling ni agentes: es exclusivamente un componente de tokenización.

## Casos de uso

- Adaptación de Muse-Glimmer-30B al turco: reemplazar el tokenizador del modelo base por este y reentrenar las filas de embedding afectadas, reduciendo el coste de inferencia en turco aproximadamente un 27,6 % en número de tokens.
- Inicialización de embeddings para los nuevos tokens: usar `merged-to-original-token-ids.json` para promediar o componer los embeddings de los tokens originales que corresponden a cada token nuevo antes de un fine-tuning.
- Preprocesamiento de corpus turcos para entrenamiento: tokenizar grandes volúmenes de texto turco con menos tokens por documento, lo que reduce el coste de cómputo y permite cubrir más datos dentro de una ventana de contexto fija.
- Evaluación comparativa de tokenizadores: banco de pruebas para medir compresión, pérdida y F1 morfológico frente al tokenizador original y frente a la variante de 60.000 tokens del mismo autor.
- Análisis morfológico y segmentación lingüística del turco: las fronteras de token alineadas con morfemas (por ejemplo `ev · lerimizden` frente a `ev · ler · imiz · den`) facilitan tareas de etiquetado y análisis.
- Investigación sobre extensiones de vocabulario: referencia reproducible para estudiar el compromiso entre compresión de la lengua objetivo y degradación de inglés y código en modelos multilingües.
- Sistemas de búsqueda o indexación en turco: la menor longitud en tokens reduce el coste de almacenamiento y de comparación en pipelines de recuperación léxica o semántica.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de tokenización, no benchmarks de modelos.

| Metrica | Tokenizador original | Este tokenizador | Variante 60k / NC-128k completo |
|---|---|---|---|
| Tokens en turco (por 1.000 caracteres) | 275,4 | 198,1 (−27,6 %) | No disponible |
| F1 de fronteras morfológicas | 36,20 | 57,24 | No disponible |
| Tokens en inglés (variación) | Referencia | +2,9 % | +4,9 % |
| Tokens en código (variación) | Referencia | +1,0 % | +2,6 % |
| Perdida en decodificacion | Sin perdida | Sin perdida | Sin perdida |

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El tokenizador en sí no requiere GPU: el repositorio ocupa 0,0 GB y se ejecuta en CPU.
- El coste de hardware relevante es el del modelo asociado (Muse-Glimmer-30B), cuyos requisitos de VRAM no se detallan en la información disponible.
- Para usar el tokenizador junto al modelo es necesario reentrenar o inicializar las 50.000 filas de embedding nuevas, lo que exige un proceso de fine-tuning con GPU (no se especifican modelos recomendados).
- Despliegue del tokenizador: cualquier entorno con `transformers` 5.22.2 o superior; también puede cargarse `tokenizer.json` con la librería `tokenizers` de forma independiente.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Tokens nuevos | Turco | Inglés | Código | Licencia |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B (original) | 202.048 | 0 | Referencia | Referencia | Referencia | No disponible |
| Este (top50k) | 202.048 | 50.000 | −27,6 % | +2,9 % | +1,0 % | Apache-2.0 |
| `nc-turkce-bpe-128k-top60k-muse-glimmer-30b` | No disponible | 60.000 | No disponible | No disponible | No disponible | Apache-2.0 |
| `nc-turkce-bpe-128k-muse-glimmer-30b` (NC-128k completo) | No disponible | 100.567 | No disponible | +4,9 % | +2,6 % | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni realiza ninguna tarea de inferencia por sí mismo.
- Los nuevos tokens no tienen embeddings entrenados; usar este tokenizador con los pesos originales de Muse-Glimmer-30B sin inicializar y entrenar esas filas produce resultados incorrectos, ya que los IDs reutilizados apuntan a embeddings de tokens descartados.
- El vocabulario y los IDs de tokens especiales se mantienen, pero se eliminan los 50.000 tokens de mayor ID del vocabulario original, lo que puede afectar a textos que dependían de ellos.
- Degradación medida en inglés (+2,9 %) y código (+1,0 %); el autor indica que la variante de vocabulario completo pierde más en estos dominios.
- La selección se optimizó sobre el corpus de entrenamiento de NC-128k; el comportamiento en dominios turcos muy alejados de ese corpus (por ejemplo, terminología técnica especializada) no está documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026: no hay validación independiente de las métricas reportadas.
- No se especifican sesgos, tasas de alucinación ni limitaciones de contexto propias, al no ser un modelo generativo.
- La licencia Apache-2.0 permite uso comercial, pero la licencia del modelo base Muse-Glimmer-30B no se detalla en la información disponible y debe verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-128k-top50k-muse-glimmer-30b
- Tokenizador NC-128k base: https://huggingface.co/nesicn/nc-turkce-bpe-128k
- Variante con NC-128k completo: https://huggingface.co/nesicn/nc-turkce-bpe-128k-muse-glimmer-30b
- Variante de 60.000 tokens: https://huggingface.co/nesicn/nc-turkce-bpe-128k-top60k-muse-glimmer-30b
- Modelo destino Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta de edición de tokenizadores: https://github.com/malibayram/bpe-tokenizer-editor

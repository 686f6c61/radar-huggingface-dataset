# nesicn/nc-turkce-bpe-128k-top60k-muse-glimmer-30b

## Resumen

`nc-turkce-bpe-128k-top60k-muse-glimmer-30b` no es un modelo de lenguaje, sino un tokenizer publicado por el usuario `nesicn` en Hugging Face. Se trata de una extensión del tokenizer del modelo Muse-Glimmer-30B a la que se le han añadido 60.000 tokens seleccionados del vocabulario turco NC-128k, un BPE byte-level entrenado desde cero sobre un corpus turco. El objetivo es mejorar la eficiencia de tokenización del turco (una lengua aglutinante con morfología compleja) sin degradar demasiado el rendimiento en inglés y código.

La relevancia técnica está en el método: en lugar de sustituir el vocabulario completo, se reemplazan los 60.000 tokens de mayor ID del tokenizer original por tokens turcos de al menos 4 caracteres, ordenados por frecuencia de uso en el corpus de entrenamiento de NC-128k. El tamaño del vocabulario (202.048) y los IDs de tokens especiales se mantienen idénticos al original, lo que simplifica la integración en infraestructura existente.

El resultado declarado por el autor es una reducción del 28,6 % en el número de tokens para texto turco (de 275,4 a 195,4 tokens por 1.000 caracteres), con un coste de +3,3 % en inglés y +1,3 % en código. La tokenización es sin pérdidas (`decode(encode(x)) == x`) y no genera tokens `<unk>`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los artefactos aún no se han subido o son de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE byte-level (no es un modelo de lenguaje) |
| Parametros totales | no disponible (no aplica: es un tokenizer) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo base Muse-Glimmer-30B) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` (compatible con `transformers` 5.22.2 vía `TokenizersBackend`) |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Tamano de vocabulario | 202.048 (idéntico al original) |
| Tokens nuevos añadidos | 60.000 (59.995 del NC-128k + 5 piezas puente) |
| Tokens del NC-128k ya presentes en el original | 26.108 |
| Reglas de merge del NC-128k incorporadas | 86.265 |
| Longitud media de los tokens nuevos | 7,4 caracteres |
| Tokens nuevos de menos de 4 caracteres | 1.586 (1,4 %; son tokens intermedios necesarios por cierre de ancestros BPE) |
| Repositorio | 0,0 GB, 0 descargas, 0 likes |

## Arquitectura y entrenamiento

El artefacto es un tokenizer BPE byte-level construido en tres pasos según la model card. Primero se construye un tokenizer de subconjunto a partir de NC-128k, conservando 86.265 reglas de merge en el orden original, junto con los caracteres base, tokens especiales, normalizador y pre-tokenizador. El conjunto es "ancestro-cerrado": cada regla de merge tiene sus dos partes presentes en el conjunto o en los caracteres base, de modo que cada token puede reconstruirse a partir de sus piezas.

Después, el subconjunto se convierte al formato textual que espera la herramienta de merge (token byte-level a texto, espacio a `▁`, byte único a `<0xXX>`). Se descartaron 162 tokens que eran fragmentos UTF-8 incompletos y no podían convertirse a texto. Finalmente se aplicó `bpe-tokenizer-editor` 0.2.0 para insertar los 60.000 tokens nuevos en los IDs de los 60.000 tokens de mayor ID del tokenizer de Muse-Glimmer-30B, manteniendo intactos los IDs restantes y los especiales.

La selección de tokens sigue un criterio explícito: candidatos del NC-128k con al menos 4 caracteres (sin contar el espacio inicial de palabra), ordenados por número de usos en el corpus de entrenamiento de NC-128k, e incluyendo los ancestros BPE necesarios. Los textos de test no se usaron en ninguna fase de selección. Se comparó con un método alternativo (podar desde el vocabulario completo del NC-128k); ambos coincidían en el 95,2 % de los tokens añadidos, y la regla pre-registrada eligió el método más simple al quedar la diferencia por debajo del umbral del 0,1 % (−0,0005 %). No hay entrenamiento de pesos ni ajuste fino: es un artefacto puramente léxico.

## Capacidades

- Tokenización BPE byte-level de texto turco e inglés, sin pérdidas en los textos de prueba (`decode(encode(x)) == x`).
- Reducción del número de tokens en turco: −28,6 % (275,4 → 195,4 tokens por 1.000 caracteres) sobre el mismo texto.
- Mejora de la segmentación morfológica: F1 en fronteras de morfema de 36,20 a 57,11.
- Preservación del rendimiento en inglés (+3,3 % de tokens) y código (+1,3 % de tokens) frente al tokenizer original.
- Sin generación de tokens `<unk>` en los textos de prueba.
- Compatibilidad directa con `transformers` 5.22.2: se carga como `TokenizersBackend` con el `config.json` del modelo original.
- Mantiene el normalizador, pre-tokenizador, decoder, plantilla y plantilla de chat del tokenizer de Muse-Glimmer-30B.
- Incluye `merged-to-original-token-ids.json`, que mapea cada ID nuevo a sus tokens originales (o a las piezas originales para tokens nuevos), útil para inicializar embeddings.

## Casos de uso

- Adaptación de Muse-Glimmer-30B al turco: el tokenizer sirve como base para continuar el preentrenamiento o hacer fine-tuning del modelo con un vocabulario más eficiente en turco, reduciendo el coste por documento al necesitar menos tokens. Requiere inicializar y entrenar los embeddings de los tokens nuevos antes de usar los pesos originales.
- Reducción de coste de inferencia en producción para aplicaciones en turco: al procesar un 28,6 % menos de tokens por el mismo texto, se reduce el coste de cómputo y se amplía el contenido efectivo que cabe en la ventana de contexto del modelo base.
- Preprocesamiento de corpus turcos para entrenamiento: pipelines de limpieza y tokenización de grandes volúmenes de texto turco que alimentan modelos desde cero o adaptaciones lingüísticas.
- Análisis morfológico y lingüística computacional: la mejora del F1 de fronteras de morfema (36,20 → 57,11) lo hace útil para tareas de segmentación morfológica, lematización asistida y estudios de morfología turca.
- Sistemas bilingües turco-inglés: al mantener un coste bajo en inglés (+3,3 %) y conservar los tokens de código, es adecuado para aplicaciones mixtas de documentación técnica, soporte o código con comentarios en turco.
- Sustitución controlada en infraestructura existente: al conservar el tamaño de vocabulario (202.048) y los IDs especiales, se puede integrar en pipelines que ya asumen ese vocabulario sin cambiar dimensiones de matrices de embedding, siempre que se entrene la capa de embeddings.
- Investigación sobre extensión de vocabularios: sirve como referencia reproducible de una metodología de extensión léxica con criterios pre-registrados y comparación de métodos alternativos.

## Benchmarks y rendimiento

La model card proporciona métricas de tokenización, no benchmarks de modelos de lenguaje:

| Metrica | Muse-Glimmer-30B (original) | Este tokenizer | NC-128k completo |
|---|---|---|---|
| Tokens por 1.000 caracteres (turco) | 275,4 | 195,4 (−28,6 %) | no disponible |
| F1 en fronteras de morfema | 36,20 | 57,11 | no disponible |
| Tokens en inglés (variación relativa) | referencia | +3,3 % | +4,9 % |
| Tokens en código (variación relativa) | referencia | +1,3 % | +2,6 % |
| Reversibilidad (`decode(encode(x)) == x`) | no disponible | sí, en todos los textos de prueba | no disponible |

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el artefacto no es un modelo con pesos entrenados.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizer; depende del modelo base Muse-Glimmer-30B con el que se combine.
- GPU recomendadas: no aplica al tokenizer; para el modelo base de 30B se requerirían GPUs de alta gama (A100, H100) o consumer de gama alta con cuantización, dato no confirmado en la información disponible.
- Compatibilidad con GPU consumer: no aplica al tokenizer.
- Despliegue: se carga con `transformers` 5.22.2 mediante `AutoTokenizer.from_pretrained`. No se documentan opciones específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al reducir el número de tokens en turco un 28,6 %, cabe esperar una reducción proporcional en el coste de codificación y en el número de tokens procesados por el modelo base, pero no se aportan mediciones.

## Comparativa con modelos similares

| Tokenizer | Tamano de vocabulario | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| Este tokenizer (top60k) | 202.048 | tr, en | Apache 2.0 | 60.000 tokens turcos insertados sobre Muse-Glimmer-30B |
| NC-128k completo sobre Muse-Glimmer-30B | 202.048 | tr, en | Apache 2.0 | 100.567 tokens turcos nuevos; mayor ganancia en turco, mayor coste en inglés (+4,9 %) y código (+2,6 %) |
| Versión top50k | no disponible | tr, en | Apache 2.0 | Misma metodología con 50.000 tokens |
| NC-128k (tokenizer base) | 128.000 (según nombre) | tr | no disponible | BPE byte-level entrenado desde cero en turco |
| Tokenizer original de Muse-Glimmer-30B | 202.048 | no disponible | no disponible | Referencia de partida |

No se dispone de datos de rendimiento de benchmarks de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni tiene pesos entrenados; es únicamente un tokenizer.
- Advertencia explícita del autor: no usar directamente con los pesos originales de Muse-Glimmer-30B. Los tokens nuevos ocupan los IDs de tokens descartados, cuyos embeddings en el modelo original corresponden a otros tokens; sin inicializar y entrenar los embeddings nuevos, el modelo no funcionará correctamente con este tokenizer.
- El mapeo `merged-to-original-token-ids.json` es necesario para inicializar los embeddings de los tokens nuevos a partir de sus piezas originales.
- Coste en inglés (+3,3 %) y código (+1,3 %): en aplicaciones predominantemente inglesas o de código, el tokenizer es ligeramente menos eficiente que el original.
- Sesgos: no se documentan sesgos del tokenizer; el corpus de entrenamiento de NC-128k no se describe en detalle en la información disponible.
- Riesgo de alucinación: no aplica al tokenizer en sí, pero sí al modelo base con el que se combine.
- Cobertura limitada a turco e inglés; no se declaran otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero la licencia del modelo base Muse-Glimmer-30B debe verificarse por separado (no disponible en la información).
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa de las métricas declaradas.
- El tamaño del repositorio (0,0 GB) sugiere que los artefactos pueden no estar completamente subidos; conviene verificar la integridad de `tokenizer.json` antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/nesicn/nc-turkce-bpe-128k-top60k-muse-glimmer-30b
- Versión con el NC-128k completo: https://huggingface.co/nesicn/nc-turkce-bpe-128k-muse-glimmer-30b
- Versión top50k: https://huggingface.co/nesicn/nc-turkce-bpe-128k-top50k-muse-glimmer-30b
- Tokenizer base NC-128k: https://huggingface.co/nesicn/nc-turkce-bpe-128k
- Modelo base Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta de edición de tokenizers: https://github.com/malibayram/bpe-tokenizer-editor

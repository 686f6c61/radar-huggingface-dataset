# sifat-febo/banglish-embed-tiny

## Resumen

Banglish Embed Tiny es un modelo de embeddings de frases diseñado específicamente para el bengalí y el banglish (bengalí romanizado con caracteres latinos). Desarrollado por Sifat Febo, resuelve el problema de la recuperación semántica entre ambos sistemas de escritura: permite buscar en uno y encontrar resultados en el otro. Su relevancia radica en su tamaño extremadamente reducido —apenas 12 MB—, lo que lo hace ejecutable en CPU, en un navegador mediante transformers.js o en dispositivos móviles sin necesidad de GPU ni conexión a internet.

El modelo está entrenado desde cero (no es un fine-tuning de un modelo multilingüe existente) y cuenta con un vocabulario propio de 16.000 palabras construido para cubrir conjuntamente la escritura bengalí y la romanizada. Con 2,85 millones de parámetros y una arquitectura tipo BERT, alcanza una precisión de recuperación del 99,0 % en la dirección bengalí→banglish y del 98,7 % en la inversa, según pruebas propias del autor sobre 2.000 pares de frases. Su principal limitación es una ventana de contexto corta: trunca alrededor de 50 palabras en banglish o 15 palabras en escritura bengalí.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (entrenado desde cero) |
| Parametros totales | 2.849.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (trunca a ~50 palabras banglish o ~15 palabras bengalí) |
| Tipos de cuantizacion | fp32 (formato ONNX) |
| Idiomas soportados | bn (bengalí), en (banglish / bengalí romanizado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer tipo BERT, pero con una particularidad: su vocabulario de 16.000 piezas fue construido específicamente para el bengalí y el banglish, en lugar de reutilizar un tokenizador multilingüe estándar. Esto explica su tamaño reducido, ya que no arrastra vocabulario de decenas de idiomas que no va a utilizar. El entrenamiento se realizó desde cero sobre el dataset de pares de frases BanglaTLit (licencia MIT), que proporciona alineaciones entre frases en escritura bengalí y su versión romanizada. No se menciona el uso de RLHF ni DPO; se trata de un entrenamiento de embeddings de similitud, probablemente con una función de pérdida contrastiva o de tripletas. El autor indica que el modelo fue construido con asistencia de Claude Code (Anthropic) bajo su dirección y revisión.

## Capacidades

- Generación de embeddings de frases para similitud semántica entre bengalí y banglish.
- Recuperación cross-script: dada una consulta en escritura bengalí, encuentra frases equivalentes en banglish y viceversa.
- Búsqueda semántica en corpus mixtos donde conviven ambos sistemas de escritura.
- Ejecución en CPU sin GPU, en navegador (transformers.js) y en entornos sin Python (Node, C#, móviles) gracias al formato ONNX.
- No soporta generación de texto, tool calling, agentes, visión ni audio. Su única función es la similitud de frases.

## Casos de uso

- Búsqueda semántica en foros y redes sociales bengalíes: muchos usuarios escriben en banglish mientras que el contenido histórico está en escritura bengalí. El modelo permite indexar ambos formatos y recuperar resultados cruzados.
- Sistemas de preguntas y respuestas en bengalí: dado un corpus de FAQs en escritura bengalí, se pueden emparejar preguntas formuladas en banglish con las respuestas adecuadas.
- Detección de duplicados en plataformas de contenido: identifica frases o títulos que significan lo mismo aunque estén escritos en scripts diferentes, útil para moderación o deduplicación.
- Aplicaciones móviles de búsqueda offline: al pesar solo 12 MB, puede integrarse en apps Android o iOS para búsqueda local sin conexión.
- Clasificación de comentarios o reseñas: agrupación de opiniones similares escritas en bengalí o banglish para análisis de sentimiento o moderación.
- Asistentes de escritura o correctores de estilo: sugerencia de frases equivalentes en el otro script para usuarios que alternan entre ambos.

## Benchmarks y rendimiento

El autor publica resultados de una prueba de recuperación propia: dado una frase en un script y 2.000 frases candidatas en el otro, se mide si la frase correcta aparece en primer lugar (un empate cuenta como error). Los resultados se comparan con los otros dos modelos de la familia:

| Modelo | Bengalí → Banglish | Banglish → Bengalí | Tamaño |
|---|---|---|---|
| banglish-embed | 0.995 | 0.992 | 0.95 GB |
| banglish-embed-minilm-small | 0.988 | 0.986 | 0.47 GB |
| banglish-embed-tiny (este modelo) | 0.990 | 0.987 | 0.012 GB |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o MTEB. La prueba es específica del dominio bengalí-banglish y fue realizada por el autor sobre el mismo conjunto de 2.000 pares para los tres modelos.

## Requisitos de hardware

- VRAM: no requiere GPU; funciona en CPU. Si se usa GPU, la huella de memoria es inferior a 50 MB en fp32.
- GPU recomendadas: ninguna en particular; cualquier CPU moderna es suficiente.
- Compatible con hardware de consumo: sí, incluidos teléfonos móviles y navegadores web.
- Opciones de despliegue: sentence-transformers (Python), ONNX Runtime (C#, Node, móviles), transformers.js (navegador), text-embeddings-inference (el modelo está marcado como compatible con endpoints de Hugging Face).
- Latencia: no se proporcionan datos, pero al ser un modelo de 2,85 M de parámetros, la inferencia en CPU es del orden de milisegundos para frases cortas.

## Comparativa con modelos similares

La comparación más directa es con los otros dos modelos de la misma familia, ambos del mismo autor:

| Modelo | Parámetros | Tamaño | Precisión (B→B) | Precisión (B→B inv.) | Licencia |
|---|---|---|---|---|---|
| banglish-embed | no disponible | 0.95 GB | 0.995 | 0.992 | Apache 2.0 |
| banglish-embed-minilm-small | no disponible | 0.47 GB | 0.988 | 0.986 | Apache 2.0 |
| banglish-embed-tiny | 2.85 M | 0.012 GB | 0.990 | 0.987 | Apache 2.0 |

Frente a modelos multilingües generalistas como multilingual-e5-small o LaBSE, no se dispone de comparativas publicadas. La ventaja de este modelo es su tamaño y su especialización en el par bengalí-banglish, mientras que los modelos multilingües suelen tener un rendimiento inferior en lenguas de bajos recursos y un coste computacional mayor.

## Limitaciones y advertencias

- Ventana de contexto muy corta: trunca alrededor de 50 palabras en banglish o 15 palabras en escritura bengalí. Frases largas perderán información.
- Función limitada: solo produce embeddings de similitud; no genera texto ni realiza otras tareas.
- Vocabulario propietario: al estar entrenado desde cero con un tokenizador propio, no es compatible con pipelines que esperen un tokenizador multilingüe estándar. Los otros dos modelos de la familia sí lo son.
- Sesgos potenciales: al entrenarse únicamente con el dataset BanglaTLit, puede reflejar sesgos presentes en ese corpus (dominio, registro, variedades dialectales). No se han realizado auditorías de sesgo.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.
- Uso comercial: permitido bajo licencia Apache 2.0, sin restricciones conocidas.
- Fecha de creación futura (agosto de 2026): el modelo está publicado con una fecha posterior a la actual, lo que puede indicar un error en los metadatos o una publicación programada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sifat-febo/banglish-embed-tiny
- Modelo grande de la familia: https://huggingface.co/sifat-febo/banglish-embed
- Modelo intermedio de la familia: https://huggingface.co/sifat-febo/banglish-embed-minilm-small
- Dataset de entrenamiento: https://huggingface.co/datasets/aplycaebous/BanglaTLit

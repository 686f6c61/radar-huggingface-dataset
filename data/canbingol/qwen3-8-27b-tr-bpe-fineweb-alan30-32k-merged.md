# canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-32k-merged

## Resumen
Este repositorio no contiene un modelo de lenguaje completo, sino un tokenizador BPE fusionado (merged tokenizer) para el modelo base Qwen/Qwen3.8-27B, publicado por el usuario canbingol. El artefacto combina el vocabulario del tokenizador original de Qwen3.8-27B con un tokenizador BPE entrenado específicamente para turco (canbingol/tr-bpe-fineweb-alan30-32k, entrenado sobre FineWeb y el corpus Alan30), con el objetivo de reducir el número de tokens necesarios para procesar texto en turco sin perder la cobertura del tokenizador original.

El resultado es un vocabulario final de 262.144 entradas y 263.978 reglas de merge, generado con la herramienta bpe-tokenizer-editor de malibayram, que soporta conversión de formato ByteLevel entre origen y destino. El repositorio tiene un tamaño de 0.0 GB según los metadatos de Hugging Face, lo que sugiere que los ficheros de tokenizador no están presentes o no se han reportado correctamente; en cualquier caso, no incluye pesos del modelo.

La relevancia de este artefacto es acotada: sirve a quienes quieran adaptar Qwen3.8-27B a turco mejorando la eficiencia de tokenización, pero exige un reentrenamiento o ajuste de los embeddings del modelo base para ser utilizable, y no se ha publicado ninguna evaluación de dicha adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (ByteLevel) fusionado; no es un modelo de lenguaje |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto de tokenizador; el tamano del repo figura como 0.0 GB) |
| Vocabulario final | 262.144 entradas |
| Reglas de merge | 263.978 |
| Modelo base asociado | Qwen/Qwen3.8-27B |
| Tokenizador turco de origen | canbingol/tr-bpe-fineweb-alan30-32k |
| Herramienta de fusion | bpe-tokenizer-editor (malibayram) |

## Arquitectura y entrenamiento
El artefacto es un tokenizador de byte-pair encoding (BPE) con formato ByteLevel, construido mediante la fusion del vocabulario del tokenizador de Qwen3.8-27B con el de un tokenizador BPE entrenado para turco sobre los corpus FineWeb y Alan30. La fusion eleva el vocabulario a 262.144 entradas y genera 263.978 reglas de merge, y se realizó con la herramienta bpe-tokenizer-editor, que permite la conversión entre formatos ByteLevel de origen y destino.

No se dispone de información sobre el proceso de entrenamiento del tokenizador turco de origen (número de tokens vistos, composición exacta del dataset, criterios de filtrado), ni sobre si la fusión preserva íntegramente las asignaciones de ID del tokenizador original de Qwen, lo cual es crítico para reutilizar los embeddings del modelo base. Tampoco se documenta si se realizó algún ajuste posterior de los embeddings del modelo Qwen3.8-27B para acomodar el nuevo vocabulario; sin ese paso, el tokenizador no es directamente compatible con los pesos publicados del modelo.

## Capacidades
- Tokenización y decodificación de texto en turco e inglés con un vocabulario de 262.144 entradas.
- Reducción potencial del número de tokens por palabra en turco respecto al tokenizador original de Qwen3.8-27B, al incorporar merges específicos del idioma.
- Compatibilidad de carga mediante `transformers.AutoTokenizer` con el identificador del repositorio.
- Conversión de formato ByteLevel entre tokenizadores de origen y destino gracias a la herramienta de fusión empleada.
- No incluye capacidades de generación, razonamiento, código, visión, tool calling ni agentes: es exclusivamente un artefacto de tokenización.
- No se documentan capacidades multilingües más allá de turco e inglés.

## Casos de uso
- Adaptación de Qwen3.8-27B al turco: usar este tokenizador como punto de partida para reentrenar los embeddings de entrada y salida del modelo base, reduciendo la longitud media de las secuencias en turco y, con ello, el coste de inferencia.
- Análisis de eficiencia de tokenización: medir con este tokenizador el número de tokens por palabra en corpus turcos frente al tokenizador original de Qwen, para justificar o descartar una adaptación completa del modelo.
- Preprocesamiento de corpus turcos: emplear el tokenizador para tokenizar grandes volúmenes de texto en turco antes de un ajuste fino supervisado o de un entrenamiento de embeddings.
- Investigación en multilingüismo: comparar el comportamiento de un vocabulario fusionado frente a uno nativo en tareas de cobertura léxica y fertilidad de tokenización en turco.
- Evaluación de herramientas de fusión de tokenizadores: replicar el proceso con bpe-tokenizer-editor sobre otros pares de tokenizadores para validar la metodología.
- Prototipado de pipelines de NLP en turco: usar el tokenizador para construir datasets tokenizados y validar la compatibilidad con el modelo base antes de invertir en un reentrenamiento completo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Al ser un tokenizador, la inferencia no requiere GPU; el coste de hardware corresponde al modelo base Qwen3.8-27B, del que no se dispone de especificaciones en la información proporcionada.
- VRAM estimada para el modelo base: no disponible.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue del tokenizador: biblioteca `transformers` (clase `AutoTokenizer`); para el modelo base, no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-32k-merged | Tokenizador BPE fusionado | 262.144 | tr, en | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (tokenizador original) | Tokenizador del modelo base | no disponible | no disponible | no disponible | Hugging Face |
| canbingol/tr-bpe-fineweb-alan30-32k | Tokenizador BPE turco | no disponible | tr | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de otros tokenizadores comparables en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia sin los pesos de Qwen3.8-27B y, previsiblemente, sin reentrenar los embeddings.
- El repositorio figura con un tamaño de 0.0 GB, por lo que los ficheros del tokenizador podrían no estar disponibles o no haberse reportado; conviene verificar la integridad antes de usarlo.
- No se documenta si los IDs de token del vocabulario original de Qwen se preservan tras la fusión; si no es así, los embeddings del modelo base no serán directamente reutilizables.
- No se han publicado evaluaciones de la calidad de la tokenización ni del impacto en el rendimiento del modelo tras la adaptación.
- La licencia no está disponible, lo que impide determinar las condiciones de uso comercial.
- El alcance lingüístico documentado se limita a turco e inglés; no hay garantías sobre otros idiomas.
- El modelo base Qwen3.8-27B no ha podido verificarse en la información proporcionada; su existencia y especificaciones deben confirmarse en el repositorio oficial de Qwen.
- Riesgo de sesgos y alucinación: no aplica al tokenizador en sí, pero cualquier modelo derivado heredará los sesgos del corpus de entrenamiento y del modelo base.

## Enlaces
- Repositorio del tokenizador: https://huggingface.co/canbingol/Qwen3.8-27B-tr-bpe-fineweb-alan30-32k-merged
- Tokenizador turco de origen: https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-32k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de fusión: https://github.com/malibayram/bpe-tokenizer-editor

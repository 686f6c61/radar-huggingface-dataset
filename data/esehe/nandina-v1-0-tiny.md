# esehe/Nandina-v1.0-tiny

## Resumen

Nandina-v1.0-tiny es un modelo de lenguaje publicado por el usuario esehe en Hugging Face bajo licencia Apache-2.0, orientado exclusivamente al idioma japonés. Su rasgo más distintivo no es la arquitectura en sí, sino el formato de distribución: no se publica como un checkpoint convencional de transformers, sino como un paquete de tres ficheros que incluyen un manifiesto (`Nandina-v1.0-tiny.manifest.json`), unos pesos ya cuantizados en safetensors (`Nandina-v1.0-tiny.encoder.safetensors`) y un vocabulario en formato TSV hexadecimal (`Nandina-v1.0-tiny.vocab.hex.tsv`). El autor indica explícitamente que los pesos están pensados para "la implementación propia del motor", lo que sugiere que el modelo requiere un runtime específico no descrito en la model card.

La model card no proporciona información sobre el número de parámetros, la longitud de contexto, la arquitectura interna ni los resultados de evaluación. El repositorio tiene un tamaño de 0.0 GB, lo que es coherente con el calificativo "tiny" del nombre, pero impide estimar la magnitud real del modelo. La fecha de creación indicada (2026-11-19) es futura respecto al momento habitual de consulta, un dato que conviene tratar con cautela.

El modelo resulta relevante como ejemplo de publicación de pesos en un formato propietario o específico de motor, con un pipeline de datos japonés cuidadosamente documentado (corpus educativos, Wikipedia, literatura de Aozora Bunko, foros, reseñas y datos de investigación) y con anotación de lecturas (furigana) mediante diccionarios SudachiDict, UniDic y Mozc. Para un desarrollador que evalúe modelos japoneses pequeños, es un caso a considerar solo si dispone del motor compatible, dado que la integración estándar vía `transformers` no está documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor menciona un "encoder" con pesos cuantizados; no se detalla la topología) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos ya cuantizados en el fichero `encoder.safetensors`; el esquema de cuantización no se especifica |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado) + manifiesto JSON + vocabulario TSV hexadecimal |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo. El autor emplea el término "encoder" para el fichero de pesos y distribuye un manifiesto JSON que el motor debe leer, junto con un vocabulario en TSV con codificación hexadecimal. No se especifica si se trata de un transformer denso, un modelo con mezcla de expertos, una arquitectura híbrida o un modelo recurrente; tampoco se indica el número de capas, dimensiones ocultas ni cabezas de atención. La única pista estructural es la presencia de un vocabulario separado y de pesos ya cuantizados, lo que apunta a un diseño orientado a inferencia ligera en un runtime propio.

En cuanto a los datos, la model card es inusualmente detallada. El entrenamiento se basa en corpus japoneses con anotación de lectura (furigana) e incluye FineWeb-2 japonés y fineweb-2-edu-japanese (ODC-BY 1.0), JetCopper-10B (Apache-2.0), CC-100 japonés, HPLT 3.0 japonés (CC0 1.0), mqa-ja (CC0 1.0), parte de LLM-jp Corpus v4, Wikipedia en japonés (CC BY-SA 4.0), J-ResearchCorpus, documentos de libros blancos del gobierno japonés, el corpus de noticias de livedoor, open2ch (Apache-2.0), ParallelFiction-Ja_En-100k (Apache-2.0), Amazon Reviews Multi en japonés, JESC y Aozora Bunko. La asignación de lecturas se apoya en SudachiDict (Apache-2.0), UniDic y los diccionarios de Mozc (BSD-3-Clause). No se indica el número de tokens de entrenamiento, la composición porcentual del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en japonés, con especial atención a la representación de lecturas (furigana) gracias al preprocesado con diccionarios morfológicos.
- Procesamiento de texto japonés de dominios variados: noticias, literatura, foros, reseñas de productos y textos académicos, por la composición del corpus.
- Manejo de texto con anotación de lectura, útil para tareas de conversión kanji a kana y normalización lingüística.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del japonés.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- El uso requiere presumiblemente un motor compatible con el manifiesto y el vocabulario propios; no se documenta integración con `transformers`.

## Casos de uso

- Procesamiento lingüístico japonés con furigana: el modelo puede emplearse para generar o validar lecturas de kanji en pipelines editoriales, aprovechando que el entrenamiento incluyó anotación de lectura con SudachiDict, UniDic y Mozc.
- Normalización y limpieza de corpus japoneses: dado su entrenamiento sobre FineWeb-2, CC-100, HPLT 3.0 y LLM-jp Corpus v4, encaja en tareas de filtrado, deduplicación semántica o generación de variantes de texto dentro de pipelines de datos.
- Prototipado de asistentes conversacionales en japonés: si el motor asociado expone una API de generación, el modelo puede servir para pruebas de concepto de bajo coste en atención al cliente o FAQ, siempre que se valide la calidad empíricamente.
- Generación de texto creativo en japonés: la inclusión de Aozora Bunko y ParallelFiction-Ja_En-100k sugiere utilidad para ficción breve, relatos y ejercicios de estilo, con revisión humana obligatoria.
- Análisis de opiniones y reseñas: el corpus Amazon Reviews Multi en japonés lo hace candidato para clasificación o resumen de reseñas de productos, aunque no se documenten tareas de clasificación específicas.
- Investigación sobre tokenización y vocabularios japoneses: la distribución separada del vocabulario en TSV hexadecimal facilita experimentos controlados sobre segmentación y representación de caracteres.
- Educación y herramientas de lectura asistida: la anotación de lectura permite construir prototipos de ayuda a la lectura de textos japoneses clásicos o literarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0.0 GB y no se indica el número de parámetros, por lo que no puede calcularse una estimación fiable.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; el calificativo "tiny" y el tamaño del repositorio sugieren que podría caber en GPUs de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni `transformers`. El autor indica que los pesos están pensados para "la implementación propia del motor", que no se describe ni se enlaza en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de tamaño o tarea similar.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; la composición del corpus (foros como open2ch, noticias y reseñas) puede introducir sesgos de dominio y de registro que no han sido evaluados.
- Riesgo de alucinación no cuantificado: no hay evaluaciones publicadas de fidelidad ni de tasa de alucinación.
- Cobertura lingüística limitada al japonés; no se documenta ningún otro idioma.
- Longitud de contexto desconocida, lo que impide garantizar el comportamiento en conversaciones multi-turno o documentos largos.
- La licencia Apache-2.0 permite uso comercial, pero las licencias de los datasets de origen imponen condiciones adicionales: Wikipedia requiere CC BY-SA 4.0, J-ResearchCorpus se rige por la licencia de cada论文, y los libros blancos siguen la Government Standard Terms of Use 2.0. Conviene revisar la compatibilidad antes de un despliegue comercial.
- El formato de pesos no es estándar: requiere un motor propio no documentado, lo que dificulta la integración en producción y la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-19) es posterior a la fecha habitual de consulta; conviene verificar la procedencia y la integridad de los ficheros antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esehe/Nandina-v1.0-tiny
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- fineweb-2-edu-japanese: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- JetCopper-10B: https://huggingface.co/datasets/sudy-super/JetCopper-10B
- CC-100 japonés: https://huggingface.co/datasets/range3/cc100-ja
- HPLT 3.0: https://huggingface.co/datasets/HPLT/HPLT3.0
- mqa-ja: https://huggingface.co/datasets/hpprc/mqa-ja
- LLM-jp Corpus v4: https://huggingface.co/datasets/llm-jp/llm-jp-corpus-v4
- J-ResearchCorpus: https://huggingface.co/datasets/kunishou/J-ResearchCorpus
- open2ch: https://huggingface.co/datasets/p1atdev/open2ch
- ParallelFiction-Ja_En-100k: https://huggingface.co/datasets/NilanE/ParallelFiction-Ja_En-100k
- JESC: https://huggingface.co/datasets/nntsuzu/JESC
- Aozora Bunko: https://www.aozora.gr.jp/

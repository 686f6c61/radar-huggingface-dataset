# esehe/Diphylleia-v1.0-flash

## Resumen

Diphylleia-v1.0-flash es un modelo de lenguaje de autoría individual (usuario esehe en Hugging Face) especializado en japonés y distribuido bajo licencia Apache-2.0. Se publica en formato ONNX cuantizado junto con pesos en safetensors para implementaciones propias del motor, e incluye un manifiesto JSON que el motor lee para cargar el modelo. El repositorio ocupa 0,1 GB, lo que sitúa al modelo en la categoría de modelos muy pequeños, orientados a despliegue ligero en el borde o en entornos con recursos limitados.

La arquitectura combina un encoder y un decoder autorregresivo (AR Decoder) que se ejecuta paso a paso. El autor no publica el número de parámetros, la longitud de contexto ni los detalles de entrenamiento más allá de la lista de conjuntos de datos utilizados. La información disponible indica que los datos de entrenamiento son textos en japonés con anotación de lectura (lectura fonética), lo que sugiere un enfoque en tareas de procesamiento de japonés que requieren manejo de kanji y furigana.

El modelo es relevante para quienes necesitan un componente japonés pequeño, cuantizado y desplegable vía ONNX con licencia permisiva, aunque la ausencia de benchmarks, de documentación sobre parámetros y de un pipeline declarado limita seriamente su evaluación objetiva. La ficha se limita a los datos publicados y marca explícitamente como no disponible todo aquello que el autor no ha documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder + decoder autorregresivo (AR Decoder), según los ficheros publicados; tipo de transformer no detallado |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos cuantizados (ONNX y safetensors); no se especifica el esquema exacto de cuantización |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder, AR step), safetensors (encoder, AR step), manifiesto JSON, vocabulario en TSV hexadecimal |

## Arquitectura y entrenamiento

El modelo se distribuye como un encoder y un decoder autorregresivo que se ejecuta en pasos (`ar_step`). Los artefactos incluyen versiones ONNX y safetensors de ambos componentes, todos cuantizados, además de un manifiesto JSON que el motor de inferencia lee para cargar el modelo y un vocabulario en formato TSV con codificación hexadecimal. No se documenta el tipo exacto de transformer, el número de capas, la dimensión oculta ni la estrategia de atención. Tampoco se indica si se emplearon técnicas como decodificación especulativa, atención lineal o mezcla de expertos.

Los datos de entrenamiento son textos en japonés a los que se les ha añadido lectura fonética, según la model card. Las fuentes incluyen FineWeb-2 japonés, fineweb-2-edu-japanese, JetCopper-10B, CC-100 japonés, HPLT 3.0 japonés, mqa-ja, parte del LLM-jp Corpus v4, Wikipedia en japonés, J-ResearchCorpus, libros blancos gubernamentales, el corpus de noticias de livedoor, open2ch, ParallelFiction-Ja_En-100k, Amazon Reviews Multi japonés, JESC y Aozora Bunko. La anotación de lectura se realizó consultando SudachiDict, UniDic y los diccionarios de Mozc, y se usó SudachiDict para marcar los puntos donde se puede elegir el tipo de carácter. No se especifica el número de tokens de entrenamiento ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto en japonés: el modelo está entrenado exclusivamente con corpus japoneses, por lo que su uso previsto es la generación y el procesamiento de texto en ese idioma.
- Manejo de lectura fonética: los datos de entrenamiento incluyen lecturas añadidas a cada texto, lo que sugiere capacidades relacionadas con la conversión entre kanji y lectura (furigana) o el procesamiento de texto con anotación de lectura.
- Ejecución en formato ONNX cuantizado: permite inferencia en entornos ligeros y potencialmente en el borde, aunque no se documentan latencias ni requisitos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo declara únicamente japonés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Procesamiento de texto japonés en el borde: al distribuirse en ONNX cuantizado y con un tamaño de repositorio de 0,1 GB, puede integrarse en aplicaciones locales o dispositivos con recursos limitados para tareas de generación o transformación de texto en japonés.
- Anotación de lectura (furigana): dado que los datos de entrenamiento incluyen lecturas fonéticas, el modelo podría emplearse para generar lecturas de kanji en textos japoneses, aunque no se documenta una tarea específica de evaluación.
- Preprocesamiento de corpus japoneses: puede usarse como componente en pipelines de normalización o enriquecimiento de texto japonés antes de pasarlo a modelos mayores.
- Prototipado rápido con licencia permisiva: la licencia Apache-2.0 permite uso comercial y modificación, lo que facilita experimentos y productos derivados sin restricciones de copyleft.
- Integración en motores propios: la presencia de safetensors y un manifiesto JSON sugiere que el autor prevé que otros motores carguen los pesos directamente, lo que permite integrar el modelo en implementaciones personalizadas de inferencia.
- Filtrado o clasificación de texto japonés: como encoder pequeño, podría adaptarse mediante fine-tuning a tareas de clasificación o filtrado, aunque no se documentan resultados de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,1 GB) sugiere que el modelo es muy pequeño, pero no se especifica el número de parámetros ni el esquema de cuantización, por lo que no puede estimarse la VRAM con rigor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: el modelo se distribuye en ONNX y safetensors con un manifiesto propio, lo que apunta a un motor de inferencia específico del autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información publicada no incluye parámetros, contexto ni benchmarks que permitan una comparación rigurosa con otros modelos japoneses de tamaño similar.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados publicados de MMLU, JGLUE, HumanEval ni ninguna otra evaluación, por lo que no puede verificarse la calidad del modelo.
- Documentación incompleta: se desconocen el número de parámetros, la longitud de contexto, la arquitectura exacta y el esquema de cuantización.
- Sesgos: los corpus de origen (foros como open2ch, reseñas de Amazon, noticias de livedoor) pueden introducir sesgos de dominio y de registro lingüístico; no se documenta ningún proceso de mitigación.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y sin datos de alineamiento documentados, el riesgo es desconocido.
- Limitación de idioma: el modelo declara únicamente japonés; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero las licencias de los corpus de entrenamiento (ODC-BY, CC0, CC BY-SA, Apache-2.0, entre otras) pueden imponer obligaciones adicionales sobre los datos derivados; conviene revisarlas antes de un uso en producción.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día, lo que indica que no ha sido validado por la comunidad.
- Motor de inferencia: al depender de un manifiesto propio, la integración con herramientas estándar puede requerir trabajo adicional no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esehe/Diphylleia-v1.0-flash
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

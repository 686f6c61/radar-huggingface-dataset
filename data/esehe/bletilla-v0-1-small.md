# esehe/Bletilla-v0.1-small

## Resumen

Bletilla-v0.1-small es un modelo de conversión de kana a kanji (かな漢字変換) desarrollado por el usuario esehe. No es un modelo de lenguaje generativo al uso, sino un componente especializado que recibe una lectura en hiragana y devuelve candidatos de escritura (表記), es decir, resuelve el problema clásico de la entrada de texto en japonés: dada una secuencia fonética, determinar qué caracteres kanji o mezcla de kana y kanji corresponden. Está pensado para ser cargado por el motor de conversión del proyecto setsuna-ime.

Técnicamente se trata de un modelo no autorregresivo basado en CTC (Connectionist Temporal Classification) con arquitectura Mixture-of-Experts (MoE). Al ser no autorregresivo, genera la secuencia de salida de forma paralela en lugar de token a token, lo que reduce la latencia frente a los enfoques seq2seq clásicos de conversión kana-kanji. El repositorio es pequeño (0,1 GB) y se distribuye en formato ONNX ya cuantizado a int8, lo que facilita su despliegue en entornos de escritorio o incluso en el navegador.

El modelo se publicó el 29 de octubre de 2026 bajo licencia Apache-2.0 y está entrenado exclusivamente con datos japoneses, sin modelo base previo (entrenamiento desde cero). Su relevancia radica en que ocupa un nicho muy específico —la conversión de entrada japonesa— donde los modelos de lenguaje grandes resultan sobredimensionados, y ofrece una alternativa ligera, cuantizada y de código abierto para integrarse en IMEs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con CTC y Mixture-of-Experts (MoE) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (arquitectura MoE confirmada, sin cifras) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (pesos ONNX cuantizados) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.int8.onnx`), más manifiesto JSON, vocabulario TSV hex y tablas de pares/palabras |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con decodificación no autorregresiva mediante CTC. En lugar de generar la salida token a token condicionada en los tokens previos, el CTC permite alinear la secuencia de entrada (lectura en hiragana) con la secuencia de salida (candidatos de escritura) de forma paralela, lo que se traduce en menor latencia de inferencia. La componente MoE implica que solo una parte de los expertos se activa por token, aunque el autor no publica el número total de parámetros ni cuántos se activan.

El entrenamiento parte de cero (sin inicialización desde un modelo preentrenado) y utiliza únicamente datos japoneses a los que se les ha asignado la lectura correspondiente. Las fuentes incluyen FineWeb-2 japonés, fineweb-2-edu-japanese, JetCopper-10B, CC-100 japonés, HPLT 3.0, mqa-ja, parte del LLM-jp Corpus v4, Wikipedia en japonés, J-ResearchCorpus, documentos de libros blancos del gobierno, livedoor news corpus, open2ch, ParallelFiction-Ja_En-100k, Amazon Reviews Multi japonés, JESC y Aozora Bunko. La asignación de lecturas se realizó consultando los diccionarios SudachiDict, UniDic y Mozc. No se documenta el número total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (probablemente no, dado que no es un modelo generativo conversacional).

## Capacidades

- Conversión de lectura en hiragana a candidatos de escritura (kana-kanji henkan), la tarea central del modelo.
- Generación de múltiples candidatos de conversión, ordenados mediante tablas de frecuencia de palabras y secuencias de caracteres del corpus de entrenamiento (`pairs.bin` y `words.tsv`).
- Decodificación no autorregresiva con CTC, que permite procesar la secuencia de entrada de forma paralela.
- Integración directa con el motor del IME setsuna-ime a través del manifiesto JSON incluido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un modelo especializado de conversión de texto.
- Capacidad monolingüe: únicamente japonés.

## Casos de uso

- Entrada de texto en japonés en sistemas operativos y aplicaciones de escritorio: el modelo se integra como motor de conversión del IME setsuna-ime, transformando lo que el usuario teclea en hiragana en kanji y mezclas kana-kanji correctas.
- IME ligero para entornos con recursos limitados: al distribuirse en ONNX int8 con un repositorio de 0,1 GB, puede ejecutarse en portátiles modestos o en dispositivos sin GPU dedicada, donde un LLM de conversión sería inviable.
- Entrada de texto en aplicaciones web: el formato ONNX permite ejecutar el modelo en el navegador mediante ONNX Runtime Web, habilitando un IME del lado del cliente sin enviar las pulsaciones a un servidor.
- Herramientas de accesibilidad para escritura japonesa: usuarios con dificultades para recordar la grafía kanji pueden escribir en hiragana y obtener los candidatos correctos.
- Procesamiento por lotes de normalización de texto japonés: dado un corpus con lecturas fonéticas (por ejemplo, transcripciones o furigana), el modelo puede generar las formas escritas correspondientes para tareas de anotación o enriquecimiento de datos.
- Componente en pipelines de corrección ortográfica japonesa: combinado con un diccionario, los candidatos generados permiten detectar y corregir conversiones erróneas en textos ya escritos.
- Investigación en conversión kana-kanji no autorregresiva: sirve como referencia reproducible (Apache-2.0, datos documentados) para comparar CTC+MoE frente a enfoques seq2seq en esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB y los pesos están cuantizados a int8, por lo que la huella de memoria es del orden de decenas o pocos cientos de MB.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) es más que suficiente, y probablemente también GPU integradas.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo) y el motor setsuna-ime que lo consume mediante el manifiesto JSON. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Bletilla-v0.1-small | CTC + MoE no autorregresivo para kana-kanji | no disponible | no disponible | Apache-2.0 | ONNX int8 |
| Mozc (Google) | Motor de conversión kana-kanji con diccionario y LM | no disponible | no disponible | BSD-3-Clause | C++ / binario |
| Sudachi / SudachiDict | Segmentación morfológica con diccionario | no disponible | no disponible | Apache-2.0 | Java / Python |
| Modelos seq2seq kana-kanji (genéricos) | Transformer autorregresivo | variable | variable | variable | safetensors / ONNX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de aproximación, licencia y formato de distribución.

## Limitaciones y advertencias

- Modelo monolingüe: solo procesa japonés; no admite otros idiomas ni texto mixto.
- Tarea única: no es un modelo de propósito general; no genera texto libre, no razona y no soporta herramientas ni agentes.
- Sin cifras publicadas de parámetros, contexto ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas consolidadas como Mozc.
- Riesgo de conversiones incorrectas en nombres propios, neologismos, jerga o términos técnicos poco representados en los corpus de entrenamiento.
- Los datos de entrenamiento incluyen fuentes de calidad heterogénea (open2ch, reseñas de Amazon, ficción), lo que puede introducir sesgos de registro y vocabulario.
- El orden de candidatos depende de tablas de frecuencia derivadas del corpus; puede no reflejar el uso contemporáneo ni preferencias del usuario.
- Aunque la licencia es Apache-2.0, algunas fuentes de datos tienen licencias propias (ODC-BY, CC BY-SA, CC0, licencias de papers); conviene revisar la procedencia si se redistribuyen derivados.
- El modelo está diseñado para un motor concreto (setsuna-ime); su integración en otros sistemas requiere adaptar el manifiesto y el formato de vocabulario.
- Repositorio con muy poca tracción (19 descargas, 0 likes) y sin documentación de evaluación: tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/esehe/Bletilla-v0.1-small
- Repositorio del motor setsuna-ime: https://github.com/esehehelp/setsuna-ime
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

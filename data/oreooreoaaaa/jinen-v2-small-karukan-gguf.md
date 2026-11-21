# OReOOreoaaaa/jinen-v2-small-karukan.gguf

## Resumen

jinen-v2-small-karukan es un modelo de conversión kana-kanji (かな漢字変換) derivado de jinen-v2-small, desarrollado por el usuario OReOOreoaaaa y publicado en Hugging Face bajo licencia CC BY-SA 4.0. Su propósito no es la generación de texto libre, sino la conversión de lecturas en kana a su representación en kanji con contexto izquierdo, que es exactamente el flujo de trabajo de un IME japonés como karukan. El modelo parte del GGUF de jinen-v2-small de togatogah y ha sido ajustado con 10.000 pasos adicionales para adaptarse a este caso de uso específico.

Con 109.533.696 parámetros totales y un repositorio de 0,1 GB, se trata de un modelo de tamaño pequeño, diseñado para ejecutarse localmente en el contexto de un IME. La innovación principal no está en la arquitectura, sino en el ajuste fino: el autor promedió 1:1 los pesos resultantes con los originales para mitigar el olvido catastrófico, y entrenó con datos que replican la forma en que un IME convierte por fragmentos, moviendo la primera mitad de una línea al contexto izquierdo.

El modelo es relevante porque demuestra un patrón de especialización vertical: tomar un modelo base pequeño y adaptarlo a una tarea concreta (conversión de entrada japonesa) sin sacrificar el rendimiento del original. Las evaluaciones en AJIMEE-Bench muestran una mejora marginal (87,5% frente a 86,5%), que el propio autor reconoce como no estadísticamente significativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base jinen-v2-small; arquitectura no especificada en la información) |
| Parámetros totales | 109.533.696 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (archivo publicado); otros tipos no disponibles |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (`jinen-v2-small-karukan-r9b-Q8_0.gguf`) + `tokenizer.json` |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base jinen-v2-small en la información proporcionada; solo se indica que se distribuye en formato GGUF y que el vocabulario y el formato de prompt son idénticos a los del modelo original, de modo que puede sustituirse directamente. El ajuste se realizó durante 10.000 pasos con una tasa de aprendizaje de 1e-5, y los pesos resultantes se promediaron 1:1 con los del modelo original para reducir el olvido catastrófico.

Los datos de entrenamiento combinan el dataset zenz-v2.5-dataset (partes de Wikipedia y llm-jp-corpus-v3), pares de palabras de diccionarios (Mozc OSS, SudachiDict y JMdict), ventanas cortas con números, clasificadores numéricos y letras latinas extraídas de dichos corpus, y líneas que contienen homófonos divididas en dos mitades en comas, puntos o justo antes del homófono, desplazando la primera mitad al contexto izquierdo. Esta última técnica replica la forma en que un IME convierte por fragmentos con contexto precedente. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Conversión kana-kanji (かな漢字変換) de lecturas cortas en kana a kanji, con contexto izquierdo.
- Conversión por fragmentos al estilo IME: el modelo recibe una lectura y el texto precedente como contexto.
- Manejo de homófonos: resolución de ambigüedades léxicas a partir de un contexto de 25 caracteres en las evaluaciones.
- Procesamiento de ventanas cortas con números, clasificadores numéricos y caracteres latinos.
- Formato de prompt compatible con el modelo original (contexto izquierdo, lectura, inicio de salida), con normalización NFKC obligatoria y decodificación greedy.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Integración en el IME karukan: el modelo se puede sustituir directamente por el original en el flujo de conversión de karukan, ya que mantiene formato, vocabulario y prompt, y está ajustado específicamente a la conversión por fragmentos con contexto izquierdo.
- Conversión de entrada en escritorios Linux: al ejecutarse en formato GGUF y con un tamaño de 117 MB en Q8_0, es viable como motor de conversión local en un IME sin depender de servicios en la nube.
- Desambiguación de homófonos en texto japonés: el ajuste con líneas divididas antes de homófonos y la evaluación con 1.086 preguntas de contexto de 25 caracteres lo orientan a resolver lecturas ambiguas en frases cortas.
- Corrección de lecturas en pipelines de transcripción: para convertir salidas en kana procedentes de ASR u otros sistemas a kanji antes de su publicación o indexación.
- Preprocesamiento para motores de búsqueda en japonés: normalizar consultas escritas en kana a su forma kanji para mejorar la coincidencia léxica, aprovechando el manejo de números y letras latinas.
- Experimentación con modelos pequeños especializados: sirve como referencia para estudiar el promediado de pesos 1:1 como técnica de ajuste fino sin pérdida de rendimiento en modelos de menos de 110 M de parámetros.

## Benchmarks y rendimiento

| Modelo | AJIMEE-Bench (200) | AJIMEE sin contexto | Homófonos 1086 (contexto 25 caracteres) |
|---|---:|---:|---:|
| jinen-v2-small (original) | 86,5% | no disponible | 88,5% |
| jinen-v2-small-karukan | 87,5% | 85,0% | 89,6% |

Las evaluaciones se realizaron con decodificación greedy y coincidencia exacta tras normalización NFKC. El autor indica que las diferencias son de unos pocos casos y no estadísticamente significativas; el modelo debe interpretarse como una versión que no empeora respecto al original. El conjunto de homófonos se construyó manualmente con preguntas donde el contexto determina una única respuesta correcta, y se excluyeron las de respuesta ambigua mediante un juicio ciego por parte de dos evaluadores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q8_0 (archivo de 117 MB), adecuada para ejecución en CPU.
- GPU recomendadas: no se requieren; cualquier GPU consumer con soporte de llama.cpp puede ejecutarlo, aunque el cuello de botella será la latencia de conversión más que la memoria.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con al menos 1 GB de memoria disponible; también funciona íntegramente en CPU.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python); no se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | AJIMEE-Bench |
|---|---:|---|---|---|---:|
| jinen-v2-small-karukan | 109,5 M | no disponible | CC BY-SA 4.0 | GGUF | 87,5% |
| jinen-v2-small (original) | no disponible | no disponible | CC BY-SA 4.0 | GGUF | 86,5% |
| zenz-v2.5 (referencia del dataset) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base del que deriva. No se han encontrado datos de otros modelos de conversión kana-kanji en el material proporcionado.

## Limitaciones y advertencias

- El ajuste no produce mejoras estadísticamente significativas: las diferencias en AJIMEE-Bench y en el conjunto de homófonos son de pocos casos, según el propio autor.
- El modelo está especializado en conversión kana-kanji con contexto izquierdo; no debe esperarse de él generación de texto general, razonamiento, código ni matemáticas.
- Solo soporta japonés; no hay capacidades multilingües documentadas.
- La longitud de contexto no está especificada; el ajuste se realizó con ventanas cortas, por lo que el rendimiento con contextos largos es desconocido.
- Licencia CC BY-SA 4.0: el uso comercial está permitido, pero las obras derivadas deben distribuirse bajo la misma licencia y con atribución; conviene revisar las obligaciones de compartir igual.
- El autor declara que la creación del modelo no está respaldada por el autor del modelo base, la Biblioteca Nacional de Japón ni los proveedores de los datos, y que estos no garantizan el resultado.
- Riesgo de alucinación y de conversiones incorrectas no cuantificado fuera de los conjuntos de evaluación; no se documentan sesgos específicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OReOOreoaaaa/jinen-v2-small-karukan.gguf
- Modelo base: https://huggingface.co/togatogah/jinen-v2-small.gguf
- IME karukan: https://github.com/togatoga/karukan
- Dataset zenz-v2.5-dataset: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Mozc: https://github.com/google/mozc
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- JMdict: https://www.edrdg.org/jmdict/j_jmdict.html
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/deed.ja

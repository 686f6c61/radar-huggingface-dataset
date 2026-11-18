# Interscript/urd-vocalized-int8static-1.0

## Resumen

`urd-vocalized-int8static-1.0` es un modelo especializado en diacritización del urdu (asignación de signos diacríticos o *haraqat* a texto sin vocalizar), desarrollado por Interscript dentro de la familia de capa fonológica Secryst. No es un modelo de lenguaje generativo de propósito general, sino un artefacto de transliteración y diacritización empaquetado como IMF (formato propio de Secryst) y distribuido también como pesos ONNX cuantizados a int8. El repositorio ocupa 0,5 GB y el artefacto principal (`urd-vocalized-int8static-1.0-int8.zip`) pesa 0,47 GiB.

El modelo se apoya en una arquitectura ByT5 (transformer encoder-decoder byte a byte), según las etiquetas del repositorio, y se carga a través de la API de Secryst (`Model.load(...)`) en lugar de las librerías habituales de Hugging Face. Su relevancia radica en resolver una tarea concreta y difícil del procesamiento del urdu: restaurar la vocalización explícita que el texto cotidiano omite y que es necesaria para TTS, ASR, lexicografía o enseñanza.

La información pública es escasa: el repositorio no tiene descargas ni *likes*, la model card no documenta hiperparámetros, número de parámetros ni datos de entrenamiento, y la inferencia no está marcada como soportada directamente en el Hub (`inference: false`). La única métrica publicada es un CER de 3,74 sobre el conjunto de evaluación completo del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (transformer encoder-decoder byte a byte), según etiquetas del repo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 estática (artefacto `-int8static-1.0`, ONNX) |
| Idiomas soportados | urdu (ur) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX int8 empaquetado en artefacto Secryst IMF (`.zip`, 0,47 GiB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Secryst, descrita por el autor como una "capa fonológica" dedicada a tareas de transliteración y diacritización. La etiqueta `byt5` indica que parte de la arquitectura ByT5, un transformer encoder-decoder que opera directamente sobre bytes UTF-8 en lugar de sobre tokens de subpalabra, lo que resulta adecuado para lenguas con escrituras complejas como el alfabeto persoárabe empleado por el urdu. La etiqueta `onnx` y el sufijo `int8static` confirman que la distribución se hace como grafo ONNX con cuantización estática a 8 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas adicionales. La model card solo indica que el modelo se entrenó en el monorepo `secryst-train` y se publicó mediante el contrato de distribución `interscript-ml`, con activos verificados por sha256 y artefactos con *parity gating*. La evaluación se realizó con el evaluador propio del benchmark, sin ejemplos omitidos, y la procedencia de la métrica se documenta en `rababa-urdu/docs/RESULTS.md#diacritization-urdu-text--text--haraqat`.

## Capacidades

- Diacritización de texto en urdu: inserción de *haraqat* (vocales y signos diacríticos) sobre texto plano sin vocalizar.
- Transliteración dentro de la capa fonológica Secryst (etiqueta `transliteration`).
- Procesamiento a nivel de byte gracias a la base ByT5, lo que evita problemas de vocabulario con la escritura persoárabe.
- Ejecución mediante ONNX con cuantización int8 estática, orientada a despliegue ligero.
- Carga unificada a través de cualquier *crystal* de Secryst (`Model.load(...)`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Síntesis de voz (TTS) en urdu: la diacritización explícita elimina ambigüedades de pronunciación antes de alimentar un sintetizador, lo que reduce errores de vocalización en nombres propios y palabras homógrafas.
- Reconocimiento automático del habla (ASR): un modelo de lenguaje de rescoring puede usar la salida vocalizada para desambiguar transcripciones donde el texto plano admite varias lecturas.
- Enseñanza del urdu: generación automática de materiales con vocalización completa para estudiantes que aún no dominan la lectura sin *haraqat*.
- Lexicografía y edición: enriquecimiento de entradas de diccionario y corpus históricos con vocalización consistente y verificable.
- Preprocesado de pipelines NLP: normalización diacrítica previa a tareas de análisis morfológico, etiquetado o traducción automática.
- Publicación y accesibilidad: vocalización de textos literarios o religiosos donde la lectura precisa es crítica, con revisión humana posterior dado el CER de 3,74.
- Búsqueda y recuperación: indexación de formas vocalizadas para mejorar la coincidencia en buscadores sobre corpus de urdu.

## Benchmarks y rendimiento

| Metrica | Valor | Procedencia |
|---|---|---|
| CER (diacritización urdu) | 3,74 | `rababa-urdu/docs/RESULTS.md#diacritization-urdu-text--text--haraqat` |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otras tareas no aplican a este modelo especializado).

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el artefacto int8 ocupa 0,47 GiB, por lo que la huella en memoria es del orden de cientos de MiB más el *overhead* del runtime ONNX.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos ~2 GB de VRAM libre, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: ONNX Runtime a través de la librería Secryst; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de diacritización de urdu ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Información técnica muy limitada: no se publican parámetros, contexto, corpus ni detalles de entrenamiento, lo que dificulta evaluar su robustez fuera del benchmark declarado.
- El CER de 3,74 implica que aproximadamente una de cada 27 unidades presenta error; en textos religiosos o legales puede requerir revisión humana.
- Modelo monoidioma (urdu) y mono-tarea: no sirve como modelo de propósito general.
- Dependencia del ecosistema Secryst: la carga requiere la librería `secryst` y el formato IMF; no es directamente consumible con `transformers`.
- La inferencia no está habilitada en el Hub (`inference: false`), por lo que no puede probarse mediante la API de Hugging Face.
- Riesgo de sesgo hacia la variedad y el dominio del corpus de entrenamiento (no documentado), con posible degradación en registros dialectales o texto con mezcla de inglés.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero conviene conservar el aviso de copyright y las condiciones de la licencia.
- Repositorio sin descargas ni validación comunitaria: la calidad solo está respaldada por la procedencia declarada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Interscript/urd-vocalized-int8static-1.0
- Sitio de Secryst: https://secryst.github.io
- Monorepo de entrenamiento: https://github.com/secryst/secryst-train
- Contrato de distribución Interscript ML: https://github.com/interscript/interscript-models

# Interscript/fas-diac-base-1.0

## Resumen

Interscript/fas-diac-base-1.0 es un modelo especializado en diacritización de persa (farsi): recibe texto persa sin vocales y devuelve el texto con diacríticos. Lo desarrolla Interscript, una organización centrada en modelos de transliteración, diacritización y grafema-fonema verificables, y se publica como artefacto IMF v1 en fp16 con un repositorio de 0,7 GB.

La arquitectura es ByT5-small seq2seq, un transformer encoder-decoder byte-level sin tokenizador, entrenado sobre un corpus derivado de HomoRich-G2P-Persian con 445.869 pares. La model card no documenta la longitud de contexto. El modelo es denso, no MoE, y se distribuye en formato IMF v1 fp16.

La model card reporta una CER media por fila del 0,603 %, una CER a nivel de corpus del 0,777 % y una exactitud de palabra del 82,33 % sobre un split de 9.288 filas. Es relevante para pipelines de procesamiento del lenguaje natural en persa porque ofrece una alternativa pequeña, de licencia permisiva y con métricas reproducibles frente a modelos generativos grandes, aunque su alcance se limita a la diacritización y no a tareas generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ByT5-small seq2seq (transformer encoder-decoder byte-level, sin tokenizador) |
| Parámetros totales | No disponible en la model card; byt5-small, aproximadamente 300 M según la arquitectura ByT5 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp16 (IMF v1); no se documentan int8, GGUF ni otras |
| Idiomas soportados | Persa (farsi); no se documentan otros idiomas |
| Licencia | BSD-3-Clause para pesos y código; CC0-1.0 para datos de entrenamiento; la metadata de HuggingFace no declara licencia |
| Formato de pesos | IMF v1 en fp16; no se especifica safetensors ni GGUF; repositorio de 0,7 GB |
| Tarea | Diacritización de texto persa |
| Pipeline de HuggingFace | No disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación indicada | 2026-10-19 |

## Arquitectura y entrenamiento

El modelo es un ByT5-small seq2seq: un transformer encoder-decoder que opera sobre bytes UTF-8 en lugar de tokens subword. Esta elección elimina el tokenizador y permite representar directamente caracteres persas y diacríticos, aunque la model card no detalla la longitud máxima de entrada ni la estrategia de chunking. La arquitectura es densa, no MoE, y se distribuye en formato IMF v1 fp16.

El entrenamiento usa un corpus derivado de HomoRich-G2P-Persian con 445.869 pares, publicado bajo CC0-1.0. La model card indica la variante "base tier" (run-077) y documenta barridos de épocas (3→6), backbone (small/base), optimizador (5e-4/linear) y convención de métrica; no se mencionan RLHF, DPO ni ajuste por preferencias. También se documenta un intento fallido de destilación multi-arm oracle (run-080/081) y queda pendiente reconstruir el corpus a las 528.837 filas raw.

## Capacidades

- Diacritización de persa: añade vocales y diacríticos a texto persa no vocalizado, que es la tarea principal del modelo.
- Procesamiento byte-level: al usar ByT5, trabaja directamente sobre bytes UTF-8 y no depende de un tokenizador específico para persa.
- Resolución de ambigüedad en homógrafos: el corpus HomoRich está orientado a pares con homógrafos; el modelo puede elegir diacríticos en contextos ambiguos, con una exactitud de palabra reportada del 82,33 %.
- Generación seq2seq limitada a la tarea: no es un modelo conversacional ni un LLM general; no se documentan instrucciones, razonamiento abierto ni generación de código.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Idiomas: solo persa; no se documenta multilingüismo.
- No se documentan filtros de seguridad ni evaluación de sesgos.

## Casos de uso

- Vocalización editorial de libros infantiles y poesía en persa: el modelo puede añadir diacríticos a textos no vocalizados y reducir el trabajo manual; con una CER media por fila del 0,603 % y una exactitud de palabra del 82,33 %, se recomienda revisión humana antes de publicar.
- Enseñanza de persa como lengua extranjera: permite generar lecturas vocalizadas para principiantes y materiales que ayuden a distinguir la pronunciación de homógrafos; el modelo es pequeño y puede ejecutarse por lotes en CPU o GPU.
- Preprocesamiento para TTS en persa: diacritizar antes de la síntesis reduce la ambigüedad de pronunciación en palabras homógrafas; el artefacto fp16 de 0,7 GB es adecuado para integrarse en un pipeline de síntesis.
- Postprocesado de ASR: las transcripciones automáticas suelen carecer de diacríticos; el modelo puede vocalizarlas para mejorar la legibilidad y facilitar tareas posteriores de análisis morfológico o búsqueda.
- Anotación de corpus lingüísticos: útil para crear corpus vocalizados destinados a investigación morfológica, lexicografía o evaluación de G2P; los datos de entrenamiento son CC0-1.0 y los pesos BSD-3-Clause.
- Accesibilidad lectora: permite generar versiones vocalizadas de textos para lectores con dificultades de decodificación o para personas que están aprendiendo persa; la integración puede hacerse mediante el runtime IMF v1 de Interscript en Ruby, Python o TypeScript.
- Herramientas de edición y corrección: un plugin de editor o una extensión de navegador puede sugerir diacríticos sobre texto seleccionado; el tamaño reducido del modelo permite despliegue local en GPU de consumo o CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de diacritización sobre un split de 9.288 filas, byte-identical al split de referencia rababa-farsi.

| Métrica | Valor | Ámbito | Notas |
|---|---|---|---|
| CER media por fila (row-mean) | 0,603 % | Split de 9.288 filas | CER de caracteres en bruto |
| CER a nivel de corpus | 0,777 % | Mismo split | Convención de corpus |
| Exactitud de palabra | 82,33 % | Mismo split | Word accuracy reportada por la model card |
| Línea histórica de 0,52 % | No reproducible | run-001 | Receta no documentada; no usar como referencia |

No se dispone de comparación con modelos de diacritización persa en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB para los pesos fp16 y 1-2 GB con overhead de runtime. Es una estimación a partir del tamaño del repositorio, no un dato publicado.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; GTX 1650, RTX 3050/3060, RTX 4090, A100 y H100 son válidas. También puede ejecutarse en CPU.
- GPU de consumo: sí; cabe en una GTX 1650 de 4 GB, una RTX 3060 de 12 GB y modelos similares.
- Opciones de despliegue: runtime IMF v1 de Interscript con artefactos servidos desde Ruby, Python y TypeScript. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI. Si se convierte a transformers/PyTorch, ByT5-small es ejecutable, pero la conversión no está documentada.
- Latencia y throughput: no disponibles. El tamaño reducido permite inferencia por lotes en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos públicos de un modelo comparable de diacritización persa en la información proporcionada. La siguiente comparación incluye modelos de la misma familia o de la misma tarea, con los datos disponibles.

| Modelo | Idioma / tarea | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Interscript/fas-diac-base-1.0 | Persa / diacritización | ByT5-small seq2seq | ~300 M (derivado de ByT5-small) | No disponible | CER 0,603 % row-mean; 82,33 % word accuracy | BSD-3-Clause (pesos/código); CC0-1.0 (datos) | HuggingFace |
| Interscript/urd-diac-1.0 | Urdu / diacritización | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Interscript heb-diac-plane-1.0/2.0 | Hebreo / diacritización | ByT5-base, K=3, int8 | ~582 M (derivado de ByT5-base) | No disponible | DER 8,18 en nakdimon | No disponible | GitHub releases |

La comparación con modelos de otras lenguas es solo arquitectónica y de tarea; no permite extrapolar calidad en persa.

## Limitaciones y advertencias

- No es un modelo general: no responde a instrucciones abiertas, no razona, no genera código y no usa herramientas.
- La exactitud de palabra del 82,33 % implica que aproximadamente un 17,67 % de las palabras no coinciden exactamente; para publicación, TTS crítico o subtitulado se recomienda revisión humana.
- Una CER del 0,603 % no implica texto perfecto: un error en un diacrítico puede cambiar la pronunciación de una palabra.
- La evaluación se limita a un split de 9.288 filas; no hay validación externa en dominios informales, dialectales o redes sociales.
- La línea histórica de 0,52 % no se reproduce según la model card; no debe usarse como baseline.
- La longitud de contexto no está documentada; para documentos largos hay que dividir el texto y gestionar solapamientos.
- El formato IMF v1 es específico de Interscript; la integración requiere su runtime o una conversión no documentada.
- La licencia BSD-3-Clause permite uso comercial con condiciones de atribución y avisos; los datos son CC0-1.0. La metadata de HuggingFace no declara licencia, así que conviene verificar el archivo de licencia del repositorio.
- No se documentan sesgos ni evaluación de sesgos; el corpus HomoRich puede sobrerrepresentar ciertos registros.
- La adopción es baja (0 descargas y 0 likes en el momento de la consulta), lo que implica poca validación comunitaria.
- Solo soporta persa; no es multilingüe.

## Enlaces

- [Interscript/fas-diac-base-1.0 en HuggingFace](https://huggingface.co/Interscript/fas-diac-base-1.0)
- [Modelos de Interscript en HuggingFace](https://huggingface.co/Interscript/models)
- [Releases de interscript-models en GitHub](https://github.com/interscript/interscript-models/releases)
- [Índice de modelos en GitHub](https://github.com/interscript/interscript-models/tree/main/models)
- [Interscript/urd-diac-1.0 en HuggingFace](https://huggingface.co/Interscript/urd-diac-1.0)
- [Interscript ML](https://interscript.org/ml/)

No se han encontrado papers, blogs ni demos adicionales en la búsqueda web proporcionada.

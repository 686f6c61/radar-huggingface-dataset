# Interscript/ara-diac-news-1.0

## Resumen

ara-diac-news-1.0 es un modelo especializado en diacritización (tashkeel) de texto árabe en registro periodístico, desarrollado por Interscript. Se construye sobre una arquitectura byt5-base seq2seq y se distribuye en formato ONNX con cuantización int8, con un peso de 399 MB (0,4 GB de repositorio). Resuelve un problema muy concreto: restaurar las marcas vocálicas (harakat) en árabe no vocalizado procedente de noticias, un paso crítico para TTS, búsqueda, traducción y análisis morfológico.

Su rasgo diferencial es el entrenamiento "register-pure": 900.000 unidades QCRI-silver (unos 4,5 millones de palabras de etiquetas de dominio periodístico de Wikipedia, publicadas junto a EMNLP 2025) más un sobremuestreo del corpus gold WikiNews, sin dilución con tashkeela clásica. El autor lo plantea como especialista de una familia de dos modelos, no como sustituto del generalista: ara-diac-2.0 debe usarse para árabe clásico y MSA estándar, y ara-diac-news-1.0 exclusivamente para noticias.

La relevancia actual está en que demuestra que un ajuste por registro, incluso sobre una base relativamente pequeña como byt5-base, mejora de forma sustancial las métricas en su dominio frente al modelo generalista del mismo autor. Su licencia BSD-3-Clause y su tamaño reducido lo hacen desplegable en CPU y en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | byt5-base seq2seq (transformer encoder-decoder, tokenizacion a nivel de byte) |
| Parametros totales | no disponible (la ficha indica byt5-base; no se publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (IMF v1 int8) |
| Idiomas soportados | arabe (registro periodistico; no se declara cobertura multilingue adicional) |
| Licencia | BSD-3-Clause (codigo y pesos) |
| Formato de pesos | ONNX (399 MB, repositorio de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un seq2seq basado en byt5-base, lo que implica tokenizacion a nivel de byte en lugar de subpalabras. Para diacritizacion arabe esto es relevante porque evita depender de un vocabulario de subpalabras que puede fragmentar de forma inconsistente las formas con y sin harakat, y mantiene una cobertura total de caracteres. El objetivo es de transformacion texto-a-texto: se le entrega la cadena sin vocalizar y devuelve la misma cadena con las marcas diacriticas insertadas.

El entrenamiento corresponde a la ejecucion run-029 del proyecto TODO.sota/25, lanzada en HF Jobs sobre instancias a100-large, durante 2 epocas y con inicializacion r7-init. Los datos son 900.000 unidades QCRI-silver (aproximadamente 4,5 millones de palabras) con etiquetas de dominio periodistico extraidas de Wikipedia y publicadas junto a EMNLP 2025, sobremuestreadas con el corpus gold de WikiNews. La decision metodologica clave es la ausencia de dilucion con tashkeela clasica: el autor documenta en RESULTS.md que tanto la curva dosis-respuesta como el oraculo en espacio de salida desaconsejan mezclar ambos registros, y por eso mantiene dos familias separadas que "nunca se promedian".

## Capacidades

- Diacritizacion completa de texto arabe no vocalizado en registro periodistico (noticias, teletipos, articulos de Wikipedia de tematica informativa).
- Restauracion de harakat sobre texto plano, con salida alineada caracter a caracter con la entrada.
- Rendimiento optimizado para WER/DER bajo en el dominio de noticias, segun las metricas declaradas por el autor.
- Inferencia en formato ONNX int8, apta para ejecucion en CPU y en runtime ONNX.
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso.
- No se declara capacidad de agentes, vision, audio ni modo "thinking".
- No se declara soporte multilingue mas alla del arabe; el resto de idiomas queda fuera del alcance declarado.

## Casos de uso

- Diacritizacion de teletipos y articulos de agencia: el modelo recibe el texto sin vocalizar tal como lo emiten las agencias y devuelve la version vocalizada, con el registro y el vocabulario de noticias como dominio de entrenamiento.
- Preprocesado para sintesis de voz (TTS) en arabe: los motores TTS necesitan harakat para una pronunciacion correcta; este modelo actua como etapa previa en el pipeline, insertando las marcas antes de la conversion texto-a-voz.
- Enriquecimiento de transcripciones ASR de informativos: las transcripciones automaticas carecen de diacriticos; pasar el texto por el modelo mejora la legibilidad y la precision de etapas posteriores de analisis.
- Indexacion y busqueda en corpus periodisticos: normalizar la vocalizacion permite unificar variantes de una misma palabra y mejorar el recall en motores de busqueda sobre hemerotecas digitales.
- Anotacion linguistica a gran escala por lotes: al ser ONNX int8 de 399 MB, se puede ejecutar en CPU en pipelines masivos de anotacion sin coste de GPU, procesando grandes volumenes de texto noticioso.
- Publicacion editorial de contenido arabe con vocalizacion: medios digitales que quieren ofrecer texto vocalizado para lectores no nativos o para materiales educativos pueden integrarlo en su cadena de publicacion.
- Datos de entrenamiento para otros modelos: generar corpus vocalizados de dominio noticioso para ajustar modelos de traduccion, resumen o analisis de sentimiento en arabe.
- Herramientas educativas de aprendizaje de lectura arabe basadas en textos de actualidad, donde la vocalizacion explicita ayuda a lectores principiantes.

## Benchmarks y rendimiento

| Benchmark | ara-diac-news-1.0 | ara-diac-2.0 (generalista) |
|---|---|---|
| WikiNews-2024 multiref WER | 10,13 | 17,38 |
| WikiNews-2024 multiref DER | 8,98 | 11,83 |
| SadeedDiac-25 Total DER | 5,5008 | 2,2864 |

Los datos provienen de la model card del autor. El patron es coherente con el diseno: el especialista gana con claridad en el dominio periodistico (WikiNews) y pierde frente al generalista en SadeedDiac-25, un conjunto de evaluacion mas amplio. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del modelo: 399 MB en int8, lo que implica un consumo de VRAM muy bajo (por debajo de 1 GB solo para los pesos; con activaciones y lotes moderados, aproximadamente 1-2 GB).
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama de entrada con 4 GB.
- Inferencia viable en CPU: al ser ONNX int8 y byt5-base, es ejecutable sin GPU para cargas por lotes no interactivas.
- GPU recomendadas para alto volumen: T4, L4, A10G o A100 si se busca maximizar el throughput en procesamiento por lotes.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), onnxruntime-web / transformers.js para navegador o edge, y servidores de inferencia compatibles con ONNX como Triton. vLLM, TGI y llama.cpp no son aplicables a este formato y arquitectura seq2seq.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WikiNews DER | SadeedDiac DER | Licencia | Formato |
|---|---|---|---|---|---|---|
| ara-diac-news-1.0 | no disponible (byt5-base) | no disponible | 8,98 | 5,5008 | BSD-3-Clause | ONNX int8 |
| ara-diac-2.0 | no disponible | no disponible | 11,83 | 2,2864 | no disponible en la informacion | no disponible en la informacion |

Los dos modelos comparados pertenecen al mismo autor y estan pensados como familias complementarias: el especialista en noticias y el generalista para clasico/MSA. No se dispone de datos de otros modelos comparables (por ejemplo, sistemas de diacritizacion estadisticos o neuronales de terceros) en la informacion proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Es un especialista de registro: el propio autor indica que debe usarse para texto periodistico y que para clasico o MSA conviene emplear ara-diac-2.0. Aplicarlo fuera de dominio degradara los resultados.
- Mezclar o promediar salidas con el modelo generalista no esta recomendado por el autor, que documenta en RESULTS.md que esa estrategia empeora el resultado.
- Al ser un modelo seq2seq generativo, existe riesgo de alterar caracteres, omitir palabras o introducir tokens no presentes en la entrada; conviene validar la alineacion en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Cobertura de idiomas limitada al arabe; no se declara soporte para otras lenguas ni para variantes dialectales.
- Longitud de contexto no disponible, lo que impide planificar con precision el troceado de documentos largos.
- Licencia BSD-3-Clause permisiva, que permite uso comercial y modificacion siempre que se conserven el aviso de copyright y la clausula de exencion de responsabilidad; no se han declarado restricciones adicionales.
- Adopcion practica muy baja: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros.
- Las fechas de creacion y actualizacion del repositorio son posteriores a la fecha habitual de consulta, lo que conviene verificar directamente en HuggingFace.
- El modelo se distribuye como ONNX int8, por lo que no existen pesos en precision completa ni versiones GGUF/safetensors publicadas en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Interscript/ara-diac-news-1.0
- Canal espejo (GitHub Releases): interscript/interscript-models
- Dataset de etiquetas QCRI-silver de dominio periodistico publicado con EMNLP 2025: referencia mencionada en la model card, enlace no disponible
- Documento RESULTS.md con la curva dosis-respuesta y el oraculo en espacio de salida: mencionado en la model card, enlace no disponible
- No se han encontrado resultados de busqueda web relevantes para este modelo.

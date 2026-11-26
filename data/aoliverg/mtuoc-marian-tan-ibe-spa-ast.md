# aoliverg/MTUOC-Marian-TAN-IBE-spa-ast

## Resumen

MTUOC-Marian-TAN-IBE-spa-ast es un modelo de traduccion automatica neuronal publicado en Hugging Face por el usuario aoliverg, presumiblemente vinculado al proyecto MTUOC (Machine Translation Universitat Oberta de Catalunya) y a la familia de modelos Marian. El identificador del repositorio sugiere un sistema de traduccion directa espanol-asturiano (codigos ISO 639-3 `spa` y `ast`), construido sobre la arquitectura Marian, una familia de modelos encoder-decoder basados en transformer desarrollada originalmente por el equipo de Helsinki-NLP.

El sufijo "TAN-IBE" apunta a un entrenamiento o ajuste orientado a un dominio o variedad linguistica concreta, aunque la model card publicada no aporta ningun detalle al respecto: solo contiene la declaracion de licencia GPL-3.0. El repositorio ocupa 2,0 GB, un tamano coherente con un modelo Marian de tamanos medios (del orden de decenas a pocos cientos de millones de parametros) empaquetado con pesos en formato PyTorch y posiblemente ficheros auxiliares del tokenizador.

El modelo resulta relevante para el ambito de las lenguas minorizadas de la peninsula iberica, donde los pares de traduccion con el asturiano cuentan con pocos recursos y sistemas publicos. Sin embargo, la ausencia de documentacion tecnica, de metricas y de ejemplos de uso limita seriamente su evaluacion previa a cualquier adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (encoder-decoder transformer, segun la convencion de nombres del repositorio; no confirmado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol y asturiano (inferido del identificador `spa-ast`; no declarado en la model card) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (el repositorio ocupa 2,0 GB; probablemente safetensors o bin de PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

La model card no incluye ninguna descripcion de la arquitectura ni del proceso de entrenamiento. Por el identificador del repositorio y la practica habitual del ecosistema MTUOC, cabe esperar un transformer encoder-decoder de tipo Marian con tokenizador SentencePiece, entrenado para traduccion directa `spa` a `ast`. No se especifican el numero de tokens de entrenamiento, la composicion del corpus, la posible aplicacion de tecnicas de aumento de datos, ni si hubo ajuste fino supervisado o preferencias.

El sufijo "TAN-IBE" no aparece explicado en la informacion disponible; podria referirse a un dominio, a una variedad dialectal o a una configuracion de entrenamiento concreta, pero se desconoce su significado exacto. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o destilacion.

## Capacidades

- Traduccion automatica directa entre espanol y asturiano (direccion `spa` a `ast` segun el identificador; la direccion inversa no esta confirmada).
- Generacion de texto condicionada a la tarea de traduccion, sin capacidades generativas generales documentadas.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Cobertura multilingue limitada, en principio, al par de lenguas indicado.
- No se documentan modos especiales (thinking, vision, audio) ni capacidades multimodales.

## Casos de uso

- Traduccion de contenidos administrativos y divulgativos del espanol al asturiano: el modelo puede emplearse para generar borradores de traduccion que despues revise un linguista, dado el bajo volumen de recursos disponibles para este par.
- Localizacion de interfaces y documentacion de software al asturiano: integrado en un pipeline de traduccion con memoria de traduccion, permite acelerar la adaptacion de productos digitales a esta lengua minorizada.
- Subtitulado y transcripcion traducida: combinado con un sistema ASR en espanol, el modelo puede producir subtitulos en asturiano para contenido audiovisual, con revision humana posterior.
- Preservacion y difusion del patrimonio linguistico: traduccion de textos literarios o etnograficos del espanol al asturiano para publicaciones divulgativas, siempre con supervision editorial.
- Generacion de corpus paralelos sinteticos: el modelo puede emplearse para crear datos de entrenamiento adicionales para otros sistemas de traduccion espanol-asturiano, con filtrado de calidad mediante metricas automaticas.
- Prototipado de asistentes conversacionales en asturiano: el modelo puede servir como componente de traduccion en un pipeline mas amplio que combine un LLM general con este traductor especializado, aprovechando su licencia GPL-3.0 para proyectos de codigo abierto.
- Investigacion en traduccion de lenguas de bajos recursos: util como linea base para comparar tecnicas de aumento de datos o ajuste fino en pares linguisticos con poca disponibilidad de corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; un repositorio de 2,0 GB sugiere que el modelo puede cargarse en GPU con al menos 4-6 GB de VRAM en fp32, y menos en fp16 o int8, aunque esta estimacion no esta confirmada.
- GPU recomendadas: no disponible. Por el tamano del repositorio, una GPU consumer como RTX 3060, RTX 4060 o RTX 4090 seria probablemente suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU consumer: probable, pero no confirmada.
- Opciones de despliegue: no documentadas. Al tratarse de un modelo de la familia Marian, cabria esperar compatibilidad con la libreria `transformers` y con el ecosistema de traduccion de Hugging Face, asi como con `ctranslate2` o `marian-decoder`, pero no hay confirmacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MTUOC-Marian-TAN-IBE-spa-ast | no disponible | no disponible | spa-ast (inferido) | GPL-3.0 | Hugging Face |
| Helsinki-NLP/opus-mt-es-ast | no disponible | no disponible | spa-ast | CC-BY-4.0 (segun la familia OPUS-MT) | Hugging Face |
| Modelos NLLB-200 (variantes destiladas) | 600M-54B | no disponible | 200 lenguas, incluido asturiano | CC-BY-NC-4.0 | Hugging Face |

La comparacion con `opus-mt-es-ast` y con las variantes destiladas de NLLB-200 es la mas directa por par linguistico y tamano, pero no se dispone de datos de rendimiento del modelo evaluado que permitan establecer diferencias cuantitativas. La licencia GPL-3.0 es mas restrictiva para integracion en productos propietarios que la CC-BY-4.0 de OPUS-MT.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluacion, por lo que no es posible valorar la calidad de las traducciones ni su robustez ante dominios especializados.
- Riesgo de alucinacion y de traducciones infieles en textos largos o con terminologia tecnica, habitual en sistemas de traduccion neuronal sin documentacion de evaluacion.
- No se especifica la longitud maxima de secuencia soportada, lo que impide garantizar el comportamiento en documentos extensos.
- La licencia GPL-3.0 impone obligaciones de copyleft que pueden resultar incompatibles con productos propietarios; es necesario revisar el cumplimiento antes de un uso comercial.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se confirma la direccion inversa (`ast` a `spa`) ni la cobertura de variedades dialectales del asturiano.
- La fecha de actualizacion indicada (2026) es posterior a la de creacion (2025) y no se acompana de un registro de cambios, lo que dificulta el seguimiento de versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoliverg/MTUOC-Marian-TAN-IBE-spa-ast
- Proyecto MTUOC (referencia general): no disponible en la informacion proporcionada
- Paper de Marian (referencia de la arquitectura): no disponible en la informacion proporcionada
- Repositorio OPUS-MT (referencia de la familia): no disponible en la informacion proporcionada

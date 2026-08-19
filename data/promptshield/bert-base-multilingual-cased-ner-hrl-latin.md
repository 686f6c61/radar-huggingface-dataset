# promptshield/bert-base-multilingual-cased-ner-hrl-latin

## Resumen

`promptshield/bert-base-multilingual-cased-ner-hrl-latin` es un modelo de reconocimiento de entidades nombradas (NER) basado en BERT, cuantizado a int8 y con el vocabulario recortado para incluir únicamente los tokens de escritura latina. Lo publica promptShield, una herramienta canadiense de anonimización de documentos que ejecuta la detección íntegramente en el navegador para que ningún documento salga del dispositivo. El modelo parte de `Davlan/bert-base-multilingual-cased-ner-hrl`, un fine-tune de BERT multilingüe para NER en ocho idiomas, y lo adapta para reducir el peso de descarga sin tocar ningún peso del encoder.

La reducción es posible porque la tabla de embeddings de BERT multilingüe ocupa más de la mitad del archivo (unos 92 MB de los 178 MB) y contiene filas para 104 idiomas, la mayoría de los cuales nunca se tokenizan en un despliegue con alfabeto latino. Al eliminar esas filas de forma exacta (la cuantización es per-tensor y la segmentación WordPiece es longest-match), el modelo pasa de 178,5 MB a 139,6 MB (−21,8 %) con una salida matemáticamente idéntica para los idiomas conservados. El resultado es un modelo ONNX de 139,6 MB que se carga con transformers.js o onnxruntime y que mantiene las etiquetas `PER`, `ORG`, `LOC` y `DATE` con prefijos `B-`/`I-`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base multilingual cased (encoder transformer) |
| Parametros totales | no disponible (el modelo base tiene ~178 M, pero el recorte de vocabulario reduce la tabla de embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 (estandar de BERT) |
| Tipos de cuantizacion | int8 (per-tensor) |
| Idiomas soportados | aleman, ingles, espanol, frances, italiano, letón, neerlandes, portugues (y otros de escritura latina que el modelo base manejara) |
| Licencia | AFL-3.0 |
| Formato de pesos | ONNX (transformers.js / onnxruntime) |

## Arquitectura y entrenamiento

El modelo es un BERT base multilingual cased (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) fine-tuneado por David Adelani (Davlan) para NER en ocho idiomas de alto recurso. El preentrenamiento original de Google Research cubre 104 idiomas con un vocabulario WordPiece de 119 547 tokens. Sobre ese fine-tune, promptShield ha aplicado dos transformaciones: cuantizacion int8 per-tensor de todos los pesos y poda del vocabulario, eliminando las filas de la tabla de embeddings correspondientes a escrituras no latinas (cirilico, CJK, arabe, hangul, hebreo, devanagari, griego, armenio y tailandes). El vocabulario resultante es de 68 875 tokens (57,6 % del original).

La poda es exacta, no una destilacion: la cuantizacion per-tensor usa un unico scale y zero-point para toda la tabla, y la operacion `Gather` que lee los embeddings selecciona filas sin alterar los valores int8 ni su dequantizacion. Ademas, WordPiece segmenta por coincidencia mas larga sobre las piezas disponibles, por lo que al eliminar solo piezas inalcanzables desde los scripts conservados, la segmentacion del texto latino no cambia. No se ha realizado ningun reentrenamiento ni ajuste adicional.

## Capacidades

- Reconocimiento de entidades nombradas: personas (`PER`), organizaciones (`ORG`), lugares (`LOC`) y fechas (`DATE`), con etiquetas `B-`/`I-`.
- Multilingue para escritura latina: aleman, ingles, espanol, frances, italiano, letón, neerlandes y portugues, ademas de cualquier otro idioma latino que el modelo base soportara.
- Ejecucion en el navegador mediante transformers.js (pipeline `token-classification` con `dtype: "q8"`) o directamente con onnxruntime.
- Salida identica al modelo original para los idiomas conservados, verificada sobre logits crudos (no solo sobre listas de entidades).
- No incluye generacion de texto, tool calling, ni capacidades de agente; es exclusivamente un modelo de clasificacion de tokens.

## Casos de uso

- Anonimizacion de documentos en el navegador: promptShield lo usa para detectar entidades en contratos, informes financieros y registros medicos sin que el documento salga del dispositivo. Su tamano reducido (139,6 MB) hace que la primera descarga sea un 21,8 % mas ligera.
- Extraccion de entidades en aplicaciones web progresivas: al cargarse con transformers.js, permite NER offline en clientes web sin servidor intermedio.
- Procesamiento de documentos legales multilingues: identifica personas, organizaciones, lugares y fechas en textos legales redactados en cualquiera de los ocho idiomas latinos soportados.
- Analisis de registros clinicos: extrae fechas y nombres de pacientes en historiales medicos para su posterior pseudonimizacion, con la garantia de que los datos no se transmiten.
- Clasificacion de documentos en flujos de trabajo empresariales: detecta entidades en facturas, correos y actas para alimentar sistemas de indexacion o cumplimiento normativo.
- Filtrado de informacion sensible en entornos de desarrollo: integrado en pipelines de preprocesamiento para eliminar entidades antes de enviar datos a modelos de generacion o a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque se trata de un modelo de NER, no de generacion. La model card incluye una verificacion de equivalencia con el modelo original, comparando logits crudos sobre un corpus real:

| Metrica | Resultado |
|---|---|
| Documentos evaluados | 77 |
| Entidades comparadas | 2 219 |
| Diferencias de segmentacion | 0 |
| Diferencias de entidades | 0 |
| Maxima diferencia absoluta de logits | 0,0000000000 |

La comparacion se realizo sobre logits crudos y falla ante cualquier diferencia no nula. El autor recomienda verificar en el corpus propio antes de desplegar en produccion, especialmente si el corpus contiene escrituras no latinas.

## Requisitos de hardware

- El modelo pesa 139,6 MB en int8, por lo que cabe en cualquier dispositivo con al menos 256 MB de RAM disponible.
- No requiere GPU: la inferencia se ejecuta correctamente en CPU, incluso en navegadores moviles.
- Para despliegue en servidor, puede servirse con onnxruntime o con cualquier runtime que soporte grafos ONNX de BERT.
- En el navegador, se carga con transformers.js usando `dtype: "q8"`; la latencia tipica para un documento de 512 tokens es del orden de decenas de milisegundos en un portatil moderno, aunque no se proporcionan cifras exactas.
- No se requieren opciones de cuantizacion adicionales porque el modelo ya viene en int8.

## Comparativa con modelos similares

| Modelo | Tamano | Vocabulario | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `promptshield/bert-base-multilingual-cased-ner-hrl-latin` (este) | 139,6 MB | 68 875 tokens | 8 latinos | AFL-3.0 | ONNX int8 |
| `Davlan/bert-base-multilingual-cased-ner-hrl` (original) | 178,5 MB | 119 547 tokens | 104 (incluye arabe y chino) | AFL-3.0 | PyTorch / TF |
| `Xenova/bert-base-multilingual-cased-ner-hrl` | 178,5 MB | 119 547 tokens | 104 | AFL-3.0 | ONNX (sin recorte) |

El modelo de promptShield es el unico de los tres que reduce el peso de descarga sin perder exactitud para los idiomas latinos. Los otros dos mantienen el vocabulario completo, lo que los hace adecuados si se necesita soporte para arabe o chino, pero a costa de un 21,8 % mas de peso.

## Limitaciones y advertencias

- Solo escritura latina: cualquier texto en arabe, chino u otros scripts eliminados se degrada a `[UNK]`, no a "ligeramente peor". El autor lo advierte explicitamente.
- La licencia AFL-3.0 (Academic Free License) impone condiciones de atribucion y puede no ser adecuada para todos los usos comerciales; conviene revisar sus terminos antes de integrarlo en un producto.
- No se han publicado los datasets de entrenamiento del fine-tune original; si el uso requiere trazabilidad de datos, hay que consultar a los autores originales.
- La verificacion de equivalencia se realizo sobre 77 documentos en 7 idiomas; no cubre todos los dominios ni todos los idiomas latinos posibles.
- El modelo no soporta generacion de texto ni tareas fuera de la clasificacion de tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promptshield/bert-base-multilingual-cased-ner-hrl-latin
- Modelo base (fine-tune): https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl
- Modelo base original (preentrenamiento): https://huggingface.co/google-bert/bert-base-multilingual-cased
- Exportacion ONNX de referencia: https://huggingface.co/Xenova/bert-base-multilingual-cased-ner-hrl
- Sitio de promptShield: https://promptshield.ca

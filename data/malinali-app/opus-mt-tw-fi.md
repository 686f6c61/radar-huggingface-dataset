# malinali-app/opus-mt-tw-fi

## Resumen

opus-mt-tw-fi es un modelo de traduccion automatica neuronal para el par de idiomas twi (tw) → fines (fi), publicado por el usuario malinali-app en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un reempaquetado del modelo Helsinki-NLP/opus-mt-tw-fi de la familia OPUS-MT, convertido al formato safetensors y con los tokenizadores SentencePiece originales transformados a tokenizadores rapidos en JSON para su uso con Candle (concretamente con el binding marian_flutter). El objetivo declarado es el despliegue en dispositivo (on-device) dentro de la aplicacion Malinali.

Tecnicamente es un transformer encoder-decoder de tipo Marian, con 76.122.509 parametros totales (aproximadamente 76 millones), lo que lo situa en la gama ligera de traduccion automatica. El repositorio ocupa 0,3 GB y esta etiquetado como compatible con endpoints de inferencia de HuggingFace. La direccion de traduccion es unica: tw → fi, sin soporte inverso en este paquete.

Su relevancia es limitada pero especifica: cubre un par de idiomas de muy bajos recursos (twi, lengua kwa hablada en Ghana, y fines) y lo hace con un modelo lo bastante pequeno como para ejecutarse en movil o en CPU sin GPU. La contrapartida es que no hay benchmarks publicados, no hay descargas ni valoraciones registradas y la licencia no esta declarada de forma explicita en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (seq2seq) |
| Parametros totales | 76.122.509 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (los modelos Marian de OPUS-MT suelen configurarse con 512 tokens; no confirmado en el repositorio) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | tw (twi), fi (fines); direccion unica tw → fi |
| Licencia | no disponible en los metadatos; la model card remite a la licencia del modelo original (tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors); tokenizadores en JSON (tokenizer-enc.json, tokenizer-dec.json) |

## Arquitectura y entrenamiento

La arquitectura es Marian, la implementacion de transformer encoder-decoder desarrollada por el equipo de Helsinki-NLP para el proyecto OPUS-MT. Es un modelo denso, sin mezcla de expertos ni mecanismos de atencion lineal: atencion por producto escalar estandar con encoder y decoder completos. El modelo original fue entrenado por Helsinki-NLP sobre corpus paralelos alineados del proyecto OPUS; este repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de ajuste fino alineado (RLHF, DPO) ni ningun detalle del procedimiento de filtrado.

La unica intervencion tecnica documentada por el autor de este repositorio es de empaquetado: conversion de los pesos al formato safetensors y transformacion de los tokenizadores SentencePiece originales (uno para el idioma fuente y otro para el destino) a tokenizadores rapidos en JSON compatibles con la libreria transformers y con Candle. No se documenta ningun entrenamiento adicional, destilacion ni ajuste fino propio, aunque la etiqueta base_model:finetune aparece en los tags del repositorio.

## Capacidades

- Traduccion de texto de twi a fines, en modo texto a texto (pipeline: translation).
- Modelo bilingue especializado: no traduce ningun otro par de idiomas ni la direccion inversa fi → tw.
- Tokenizacion separada para fuente y destino, lo que permite usar vocabularios independientes para cada idioma.
- Ejecucion on-device: el formato safetensors y los tokenizadores rapidos estan pensados para Candle a traves de marian_flutter, sin dependencia de Python en tiempo de inferencia.
- Compatible con la libreria transformers y con los endpoints de inferencia de HuggingFace (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling, modo de razonamiento, agentes, vision, audio ni capacidades multimodales.
- No hay ninguna indicacion de capacidades multilingues mas alla del par tw → fi.

## Casos de uso

- Traduccion integrada en aplicacion movil sin conexion: el modelo, de 76 millones de parametros, cabe en el almacenamiento y la memoria de un telefono actual, por lo que puede ofrecer traduccion twi → fines offline mediante Candle, util para usuarios en zonas con cobertura intermitente.
- Servicios de integracion para inmigrantes ghaneses en Finlandia: traduccion de formularios administrativos, citas medicas y comunicaciones oficiales del fines al twi como parte de un flujo de atencion multilingue.
- Atencion sanitaria primaria: traduccion de instrucciones de dosificacion y sintomas descritos en twi a fines para que el personal sanitario finlandes pueda interpretarlos, siempre con revision humana dada la ausencia de benchmarks.
- Ambito legal y de asilo: apoyo a la traduccion de declaraciones y documentos en procedimientos de solicitud de proteccion internacional donde el twi es la lengua del solicitante; requiere validacion por traductores jurados.
- Educacion y materiales didacticos: traduccion de guias de estudio y contenido escolar del fines al twi para comunidades ghanesas residentes en Finlandia.
- Organizaciones humanitarias y ONG: traduccion de campo en contextos de baja conectividad, ejecutando el modelo en portatiles o dispositivos moviles sin GPU.
- Generacion de corpus paralelos: uso del modelo para preanotar pares de frases twi-fines que despues se corrigen manualmente y se emplean para entrenar o evaluar modelos mayores.
- Localizacion de contenido digital: subtitulado y traduccion de interfases de aplicaciones para audiencias twi hablantes en Finlandia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas BLEU, chrF, COMET ni evaluaciones cualitativas, y no hay datos de comparacion frente a otros sistemas para el par tw → fi.

## Requisitos de hardware

- VRAM estimada: en fp32 los pesos ocupan aproximadamente 0,30 GB; en fp16 alrededor de 0,15 GB; en int8 unos 0,08 GB. Con memoria de activaciones y busqueda por haz, el consumo realista se mantiene por debajo de 1 GB.
- GPU recomendadas: no se necesita GPU. Cualquier GPU consumer sirve (GTX 1050, RTX 3060, RTX 4090); tambien es viable en CPU y en GPU integrada.
- Cabe en GPU consumer: si, con mucha holgura, en cualquier tarjeta con 2 GB o mas de VRAM. Tambien cabe en dispositivos moviles.
- Opciones de despliegue: transformers (pipeline de traduccion) y Candle mediante marian_flutter para inferencia on-device. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, ya que la arquitectura Marian no forma parte de los formatos que esas herramientas soportan de serie.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-tw-fi (este) | 76,1 M | no disponible | tw → fi | no disponible (remite al original) | HuggingFace, 0 descargas |
| Helsinki-NLP/opus-mt-tw-fi (upstream) | 76,1 M (mismo modelo) | no disponible | tw → fi | tipicamente CC-BY 4.0 | HuggingFace, modelo de referencia |
| Helsinki-NLP/opus-mt-mul-en u otros OPUS-MT | ~74-77 M por par | no disponible | multiples pares con ingles | tipicamente CC-BY 4.0 | HuggingFace |
| NLLB-200-distilled-600M | 600 M | 512 tokens | 200 idiomas, incluye tw y fi | CC-BY-NC 4.0 | HuggingFace |
| M2M-100 (418M) | 418 M | 1024 tokens | 100 idiomas | MIT | HuggingFace |

La comparacion principal es con el propio modelo original de Helsinki-NLP, del que este repositorio es una conversion de formato sin cambios declarados en los pesos. Frente a alternativas multilingues como NLLB-200 o M2M-100, la ventaja es el tamano reducido y la ausencia de dependencias pesadas; la desventaja es la cobertura restringida a un unico par de idiomas y la falta de datos de calidad comparativa.

## Limitaciones y advertencias

- No hay ningun benchmark publicado para este repositorio, por lo que se desconoce la calidad real de la traduccion tw → fi.
- Modelo bilingue y unidireccional: no traduce fi → tw ni ningun otro idioma.
- El twi es una lengua de muy bajos recursos; es previsible una calidad inferior a la de pares con mas corpus paralelo, aunque no hay datos que lo cuantifiquen.
- Riesgo de alucinacion y de omisiones en frases largas o con terminologia especializada; se recomienda revision humana en contextos medicos, legales o administrativos.
- Licencia no declarada en los metadatos del repositorio. La model card atribuye la licencia al modelo original (tipicamente CC-BY 4.0), pero no hay confirmacion explicita, lo que supone un riesgo juridico para uso comercial en produccion.
- Es un reempaquetado de terceros: malinali-app declara explicitamente que no reclama la propiedad del modelo entrenado. La trazabilidad de los pesos depende de la del repositorio original.
- Cero descargas y cero valoraciones en el momento de redactar esta ficha, sin evidencia de uso en produccion ni de validacion por la comunidad.
- La longitud de contexto no esta documentada en el repositorio; asumir un limite de 512 tokens es una extrapolacion de la familia OPUS-MT, no un dato confirmado.
- No hay informacion sobre sesgos, composicion del corpus de entrenamiento ni dominios cubiertos.
- Las herramientas de despliegue habituales para modelos generativos (vLLM, llama.cpp, Ollama) no soportan la arquitectura Marian, lo que limita las opciones de servido a transformers y Candle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-tw-fi
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-tw-fi
- Proyecto OPUS-MT en GitHub: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Nota: las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo, su entrenamiento o su evaluacion; los enlaces devueltos correspondian a temas sin relacion.

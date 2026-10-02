# malinali-app/opus-mt-rw-sv

## Resumen

`malinali-app/opus-mt-rw-sv` es un paquete de traduccion automatica neuronal para inferencia local que empaqueta los pesos del modelo `Helsinki-NLP/opus-mt-rw-sv` en formato safetensors, junto con tokenizadores rapidos adaptados para el runtime Candle. Lo publica la organizacion malinali-app como parte del proyecto Malinali, una aplicacion de traduccion on-device; no se trata de un modelo entrenado desde cero, sino de un reempaquetado de pesos con conversion de tokenizadores SentencePiece a JSON compatible con Hugging Face. La direccion de traduccion es unica: kinyarwanda (rw) hacia sueco (sv).

El modelo subyacente pertenece a la familia OPUS-MT del grupo Helsinki-NLP, basada en la arquitectura Marian NMT (transformer encoder-decoder). Cuenta con 75.859.340 parametros (~75,9 M) y un repositorio de 0,3 GB, lo que lo situa en la gama ligera: es ejecutable en CPU, dispositivos moviles y equipos sin GPU dedicada. Su relevancia radica en cubrir un par de idiomas de bajos recursos (kinyarwanda-sueco) con un modelo compacto y desplegable sin conexion, algo poco frecuente en modelos multilingues grandes, que suelen requerir VRAM considerable.

La ficha publicada por el autor es minimalista: indica los cuatro archivos requeridos (`config.json`, `model.safetensors`, `tokenizer-enc.json`, `tokenizer-dec.json`), la direccion de traduccion y el credito al modelo original. No incluye datos de entrenamiento, metricas de calidad ni condiciones de licencia propias, remitiendo a la model card de Helsinki-NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder), segun el tag `marian` y `config.json` |
| Parametros totales | 75.859.340 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los modelos Marian de OPUS-MT se entrenan habitualmente con segmentos de hasta 512 tokens) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors sin cuantizar (presumiblemente FP32). No se documentan variantes GGUF, ONNX ni INT8/INT4 |
| Idiomas soportados | rw (kinyarwanda), sv (sueco). Direccion unica rw → sv |
| Licencia | no disponible en HuggingFace; el autor remite a la licencia del modelo upstream (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) + dos tokenizadores rapidos en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |

## Arquitectura y entrenamiento

La arquitectura es Marian NMT, un transformer encoder-decoder disenado especificamente para traduccion automatica y desarrollado originalmente por el grupo Microsoft Research para el proyecto Marian. El tag `marian` del repositorio y la base declarada (`Helsinki-NLP/opus-mt-rw-sv`) confirman esta arquitectura. Se trata de un modelo denso, sin mezcla de expertos ni componentes de estado recurrente; el pipeline declarado es `translation` y la tarea `text2text-generation`. El repositorio no documenta hiperparametros concretos (numero de capas, dimension del modelo, cabezas de atencion, vocabulario) mas alla de lo que contenga el `config.json` incluido.

Respecto al entrenamiento, esta ficha no aporta informacion: no se especifican tokens de entrenamiento, composicion del corpus, ni si hubo ajuste con RLHF o DPO. El modelo original de Helsinki-NLP procede del proyecto OPUS-MT, que entrena sobre corpus paralelos recopilados en el proyecto OPUS, pero los detalles concretos de este par idiomatico no estan disponibles en la informacion proporcionada. La innovacion tecnica del paquete publicado por malinali-app es operativa, no de modelado: la conversion de los tokenizadores SentencePiece a formato JSON de tokenizador rapido de Hugging Face para permitir su uso en el runtime Candle a traves de la libreria `marian_flutter`, orientada a inferencia on-device.

## Capacidades

- Traduccion de texto de kinyarwanda a sueco, en una unica direccion (rw → sv).
- Tokenizacion especifica por lado: usa un tokenizador para el idioma origen y otro para el destino, ambos incluidos en el repositorio en formato JSON de tokenizador rapido.
- Inferencia on-device: disenado para ejecutarse localmente mediante Candle (Rust) a traves de `marian_flutter`, sin dependencia de servicios en la nube.
- Compatibilidad con la libreria `transformers` de Hugging Face (tag `transformers`, `endpoints_compatible`), lo que permite cargarlo con `MarianMTModel` y `MarianTokenizer` en Python.
- Generacion de texto condicionada a la traduccion: no es un modelo de proposito general; no se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidades multilingues limitadas al par declarado: no cubre otros idiomas ni traduccion inversa (sv → rw) segun la informacion disponible.

## Casos de uso

- Traduccion de documentacion humanitaria y de cooperacion: organizaciones que trabajan en Ruanda pueden traducir informes, guias sanitarias o materiales de campo del kinyarwanda al sueco para donantes y equipos nordicos, con inferencia local que evita enviar contenido sensible a APIs externas.
- Atencion al ciudadano en tramites de migracion: traduccion de formularios, cartas oficiales y comunicaciones administrativas redactadas en kinyarwanda hacia sueco, integrada en un portal web o en una ventanilla de atencion.
- Localizacion de aplicaciones y sitios web: traduccion por lotes de cadenas de interfaz y contenido editorial para publicos suecos a partir de material fuente en kinyarwanda, con el modelo ejecutandose en el propio servidor de compilacion.
- Subtitulado y medios audiovisuales: combinado con un sistema de reconocimiento automatico del habla en kinyarwanda, el modelo genera subtitulos en sueco para videos, entrevistas o material formativo, aprovechando su tamano reducido para procesar grandes volumenes de segmentos cortos.
- Investigacion lingueistica y creacion de corpus: generacion de traducciones de referencia preliminares para alinear corpus paralelos rw-sv, estudiar prestamos lexicos o evaluar otros sistemas de traduccion sobre el mismo par idiomatico.
- Traduccion offline en aplicacion movil: gracias a sus ~76 MB de pesos en precision reducida y a la integracion con Candle, puede embeberse en una app Flutter para que viajeros o personal de campo traduzcan sin conexion en zonas con cobertura limitada.
- Soporte tecnico por correo electronico: traduccion automatica de tickets y consultas redactadas en kinyarwanda antes de enrutarlas a un equipo de soporte en sueco, como paso previo a la revision humana.
- Pre-traduccion en herramientas CAT: integracion como motor de traduccion automatica en flujos de traduccion asistida por ordenador, generando un borrador que el traductor humano posedita, con un coste computacional minimo por segmento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio `malinali-app/opus-mt-rw-sv` no incluye metricas de calidad (BLEU, chrF, COMET ni similares) ni evaluaciones sobre conjuntos de prueba como Tatoeba o FLORES-200. Tampoco se proporcionan datos de latencia o throughput. La model card original de `Helsinki-NLP/opus-mt-rw-sv` puede contener puntuaciones de evaluacion del modelo upstream, pero no forman parte de la informacion facilitada para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 75,86 M de parametros; la precision real de los pesos no esta documentada):
  - FP32: aproximadamente 0,30 GB de pesos.
  - FP16: aproximadamente 0,15 GB.
  - INT8: aproximadamente 0,08 GB.
  - INT4: aproximadamente 0,04 GB.
  - A estas cifras hay que sumar el pequeno coste de cache de atencion y activaciones, marginal en secuencias de menos de 512 tokens.
- GPU recomendadas: cualquier GPU con 1 GB o mas de memoria es suficiente. No requiere A100, H100 ni tarjetas de gama alta; una GTX 1050 Ti, una T4 o una RTX 3060 estan sobradamente dimensionadas. El uso de GPU solo aporta ventaja en escenarios de alto volumen por lotes.
- Viabilidad en hardware de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU. El repositorio ocupa 0,3 GB, por lo que es desplegable en Raspberry Pi, telefonos moviles y portatiles sin GPU.
- Opciones de despliegue: `transformers` (PyTorch) en Python, Candle mediante `marian_flutter` para movil y escritorio, y servidores de inferencia compatibles con el pipeline `text2text-generation` de Hugging Face (por ejemplo, Text Generation Inference o endpoints compatibles). El soporte en vLLM, llama.cpp u Ollama no esta documentado en la informacion disponible para esta arquitectura.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 75,9 M de parametros, la latencia por segmento en CPU moderna suele ser de decenas de milisegundos, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `malinali-app/opus-mt-rw-sv` | 75,9 M | rw → sv | no disponible | no disponible (remite al upstream) | HuggingFace, safetensors + tokenizadores JSON para Candle |
| `Helsinki-NLP/opus-mt-rw-sv` (upstream) | 75,9 M (mismos pesos) | rw → sv | no disponible | CC-BY 4.0 segun la practica habitual de OPUS-MT; no confirmado en la informacion recibida | HuggingFace, pesos originales en PyTorch |
| `facebook/nllb-200-distilled-600M` | 600 M | 200 idiomas, incluidos rw y sv | 512 tokens | CC-BY-NC 4.0 (uso no comercial) | HuggingFace, ampliamente desplegado |
| `facebook/m2m-100` (418M) | 418 M | 100 idiomas, traduccion muchos-a-muchos | no confirmado en la informacion disponible | MIT | HuggingFace |

El modelo de malinali-app es, en la practica, identico en pesos al de Helsinki-NLP; la diferencia esta en el empaquetado y en el publico objetivo (inferencia on-device con Candle). Frente a NLLB-200 y M2M-100, pierde en cobertura idiomatica y presumiblemente en calidad sobre pares de bajos recursos al disponer de mucha menos capacidad, pero gana en coste de despliegue, tamano y ausencia de restricciones de uso no comercial si se confirma la licencia CC-BY 4.0 del upstream.

## Limitaciones y advertencias

- Direccion unica: solo traduce de kinyarwanda a sueco. No realiza la traduccion inversa ni traduccion entre otros pares idiomaticos.
- Modelo especializado: no es un modelo de proposito general. No genera texto libre, no razona, no escribe codigo y no soporta tool calling ni agentes.
- Riesgo de alucinacion y de omision: como todo sistema de traduccion neuronal, puede inventar contenido, omitir fragmentos o producir traducciones fluidas pero infieles, especialmente con frases largas, nombres propios, terminologia tecnica o segmentos con ruido.
- Idioma de bajos recursos: el kinyarwanda tiene menos datos paralelos disponibles que idiomas mayoritarios, por lo que la calidad esperada es inferior a la de pares como ingles-espanol o ingles-aleman. No se han publicado metricas que permitan cuantificarlo.
- Sin datos de sesgo: no se documenta ningun analisis de sesgos de genero, geograficos, politicos o culturales. En traduccion automatica, estos sesgos pueden manifestarse en la eleccion de formas gramaticales o de tratamiento.
- Licencia ambigua: el repositorio no declara una licencia propia y remite a la del modelo upstream "tipicamente CC-BY 4.0". Antes de un uso comercial conviene verificar la licencia real de `Helsinki-NLP/opus-mt-rw-sv` en su model card; la atribucion a Helsinki-NLP y al proyecto OPUS es exigible en cualquier caso.
- Precisión de los pesos no verificada: no se especifica si `model.safetensors` esta en FP32, FP16 o BF16, lo que afecta a las estimaciones de memoria y a posibles diferencias numericas respecto al modelo original.
- Sin mantenimiento ni metricas de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay historial de evaluaciones independientes.
- Restricciones practicas de contexto: aunque no se documenta un limite formal, los modelos Marian de OPUS-MT se entrenan con segmentos de hasta 512 tokens; fragmentos mas largos deberian dividirse antes de la traduccion.
- Idiomas distintos del par declarado: cualquier entrada en otro idioma producira resultados impredecibles, sin aviso de error.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-rw-sv
- Modelo base (upstream): https://huggingface.co/Helsinki-NLP/opus-mt-rw-sv
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Repositorio Candle (runtime de inferencia en Rust): https://github.com/huggingface/candle

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la propia model card y de la informacion del repositorio.

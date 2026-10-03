# malinali-app/opus-mt-ee-es

## Resumen

malinali-app/opus-mt-ee-es es un paquete de pesos para traduccion automatica en dispositivo (on-device) del par ewe (ee) → espanol (es), publicado por el desarrollador de la aplicacion Malinali. No es un modelo entrenado desde cero: se trata del modelo Helsinki-NLP/opus-mt-ee-es, de la familia OPUS-MT de la Universidad de Helsinki, reempaquetado en formato safetensors junto con tokenizadores rapidos compatibles con Hugging Face obtenidos a partir de los SentencePiece originales. El objetivo declarado es servir como paquete de inferencia local para Malinali a traves de marian_flutter y Candle.

El modelo tiene 75.526.403 parametros (unos 75,5 M) y una arquitectura Marian, es decir, un transformer secuencial encoder-decoder clasico de traduccion neuronal. El repositorio ocupa 0,3 GB, un tamano coherente con pesos en fp32. Es un modelo pequeno, pensado para ejecutarse en CPU y en dispositivos moviles sin acelerador dedicado, lo que encaja con el enfoque de traduccion offline y privada de la aplicacion Malinali.

Su relevancia actual es concreta: el ewe es una lengua de la familia Gbe hablada en Ghana, Togo y Benin, con recursos digitales escasos, y los pares de traduccion ewe-espanol son poco frecuentes en los catalogos de modelos. Este paquete ofrece un checkpoint ligero y desplegable localmente para ese par. Las contrapartidas son claras: el repositorio no declara licencia propia, no incluye evaluacion alguna y acumula cero descargas en el momento de redactar esta ficha, por lo que no existe validacion independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder para traduccion) |
| Parametros totales | 75.526.403 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; la familia OPUS-MT opera tipicamente con secuencias de hasta 512 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (0,3 GB, coherente con fp32). No hay GGUF, GPTQ ni AWQ publicados |
| Idiomas soportados | ewe (ee) como origen, espanol (es) como destino. Direccion unica ee → es |
| Licencia | no declarada en el repositorio; el autor remite a la del modelo base (Helsinki-NLP/opus-mt-ee-es, habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors) |
| Tokenizadores | tokenizer-enc.json (origen) y tokenizer-dec.json (destino), conversion de SentencePiece a fast tokenizer JSON |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Pipeline | translation |
| Modelo base | Helsinki-NLP/opus-mt-ee-es |
| Fecha de publicacion | 2026-10-02 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es Marian NMT, un transformer encoder-decoder con atencion multi-cabeza, desarrollado originalmente como herramienta de traduccion automatica neuronal en C++ y adoptado por el proyecto OPUS-MT para sus modelos publicos. El modelo traduce secuencia a secuencia con un vocabulario SentencePiece; el repositorio de Malinali no reentrena nada, solo convierte los tokenizadores SentencePiece originales a formato de tokenizador rapido de Hugging Face y republica los pesos en safetensors. No se declara ningun ajuste adicional, RLHF, DPO ni cambio de vocabulario respecto al checkpoint upstream.

No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni los hiperparametros en la documentacion proporcionada; la model card se limita a acreditar el modelo base y a explicar el reempaquetado. En la practica, los modelos OPUS-MT se entrenan sobre corpus paralelos agregados del proyecto OPUS, que para lenguas de bajos recursos como el ewe estan dominados por colecciones de texto religioso (JW300) y subtitulos, con la consiguiente concentracion de dominio y registro. La innovacion tecnica del paquete es de ingenieria de despliegue, no de modelado: pesos en safetensors mas tokenizadores rapidos para permitir inferencia local en Candle dentro de una aplicacion Flutter.

## Capacidades

- Traduccion de texto de ewe a espanol, en direccion unica; no existe soporte para es → ee.
- Generacion seq2seq estandar: entrada de texto plano, salida de texto traducido, sin instrucciones ni formato conversacional.
- Tokenizacion separada de origen y destino, apta para integracion directa en pipelines de transformers.
- Ejecucion en dispositivo: el paquete esta disenado para inferencia local con Candle (backend marian_flutter) dentro de la aplicacion Malinali, sin dependencia de red.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento de multiples pasos.
- No tiene capacidades de vision, audio, codigo ni matematicas mas alla de lo que aparezca en el texto a traducir.
- Cobertura multilingue: limitada al par ee-es; no traduce a traves de terceras lenguas.
- No dispone de modo de razonamiento (thinking mode) ni de plantilla de chat.

## Casos de uso

- Traduccion offline en aplicacion movil: integrado via Candle en marian_flutter, permite traducir ewe a espanol sin conexion en un telefono, con un consumo de memoria inferior a 1 GB en fp32 y muy por debajo en fp16 o int8. Es el caso de uso para el que se publico el paquete.
- Atencion a poblacion ewehablante en servicios publicos: traduccion de formularios, avisos administrativos o notas clinicas del ewe al espanol en puntos de atencion con conectividad limitada, apoyandose en la ejecucion local para no enviar datos sensibles a la nube.
- Traduccion de contenido comunitario y humanitario: ONGs y proyectos de cooperacion en Ghana, Togo o Benin que documentan testimonios, encuestas o material de campo en ewe y necesitan versiones en espanol para informes y financiadores.
- Subtitulado y transcripcion: encadenado tras un sistema ASR de ewe, el modelo traduce las transcripciones al espanol para generar subtitulos; funciona bien con segmentos cortos, que es el regimen natural de un modelo Marian.
- Creacion y curacion de corpus paralelos: uso como traductor de referencia para preanotar pares ee-es en proyectos de linguistica computacional, con revision humana posterior, dado el bajo coste computacional de generar candidatos.
- Localizacion de contenidos digitales: traduccion de fichas de producto, mensajes de aplicaciones o textos de marketing dirigidos a comunidades ewehablantes hacia el espanol para su catalogacion interna.
- Investigacion en lenguas de bajos recursos: servir como checkpoint de partida para experimentos de ajuste fino o como linea base ligera frente a modelos multilingues grandes en el par ee-es.
- Procesamiento de documentacion historica o etnografica: traduccion asistida de materiales escritos en ewe conservados en archivos, siempre con revision por hablantes nativos por el riesgo de error en dominios alejados del corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF, COMET ni evaluaciones cualitativas, y el repositorio no enlaza ninguna evaluacion independiente. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB de pesos en fp32, con un pico de memoria en torno a 0,6-0,9 GB; unos 151 MB en fp16 y unos 76 MB en int8 (estimaciones derivadas de los 75,5 M de parametros, no medidas publicadas).
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente y de hecho sobredimensionada; una RTX 3060, una T4 o una GTX 1650 ejecutan el modelo sin dificultad. Aceleradores como A100 o H100 no aportan ventaja practica por el reducido tamano.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos; tambien en CPU, en Raspberry Pi 4/5 y en dispositivos moviles, que es el objetivo del paquete.
- Opciones de despliegue: transformers con pipeline de traduccion; Candle a traves de marian_flutter (via soportada oficialmente por este paquete); conversion a CTranslate2 para inferencia acelerada; exportacion a ONNX Runtime. No hay soporte de vLLM ni de llama.cpp, y no existe version GGUF publicada.
- Latencia y throughput: no disponible. No se han publicado cifras verificables; el diseno del paquete (orientado a movil) implica que la inferencia por frase es viable en tiempo interactivo, pero sin numeros confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| malinali-app/opus-mt-ee-es | 75,5 M | ee → es | no disponible (familia OPUS-MT, tipicamente 512 tokens) | no declarada en el repo; upstream CC-BY 4.0 | Reempaquetado en safetensors con tokenizadores rapidos para Candle; 0 descargas |
| Helsinki-NLP/opus-mt-ee-es | 75,5 M | ee → es | idem | CC-BY 4.0 | Modelo original; pesos equivalentes, sin conversion de tokenizadores para Candle |
| facebook/nllb-200-distilled-600M | 600 M | 200 idiomas (incluye ewe y espanol) | no disponible en esta ficha | CC-BY-NC-4.0 (uso no comercial) | Multilingue y mas capaz en calidad, pero ocho veces mayor y con licencia no comercial |
| facebook/m2m-100 (418M) | 418 M | 100 idiomas | no disponible en esta ficha | MIT | Alternativa multilingue de licencia permisiva; presencia del ewe entre sus idiomas sin confirmar en la informacion disponible |

La comparacion relevante es con el propio modelo upstream: este repositorio no anade entrenamiento, solo un formato de pesos y unos tokenizadores orientados a inferencia local. Frente a NLLB-200 o M2M-100, la ventaja es el tamano (75,5 M frente a 418-600 M) y la licencia mas permisiva del upstream; la desventaja es la ausencia de cobertura multilingue y la falta de evaluacion publicada.

## Limitaciones y advertencias

- Direccion unica: solo traduce ee → es. No existe es → ee ni traduccion entre terceras lenguas.
- Sin licencia declarada en el repositorio: el campo de licencia aparece como no disponible y el autor remite a la del modelo base. Para uso comercial conviene confirmar la licencia aplicable (habitualmente CC-BY 4.0 en OPUS-MT, que permite uso comercial con atribucion) antes de desplegar en produccion.
- Cero validacion comunitaria: 0 descargas y 0 likes, sin evaluaciones independientes ni metricas. No hay evidencia publica de calidad sobre este paquete concreto.
- Sin mejora sobre el modelo base: al no declararse ajuste adicional, la calidad esperada es la de Helsinki-NLP/opus-mt-ee-es, ni mejor ni peor.
- Riesgo de alucinacion y de omision: como todo modelo seq2seq de traduccion, puede inventar contenido, omitir fragmentos o repetir tokens, especialmente con frases largas, nombres propios, numeros y terminologia especializada.
- Sesgo de dominio y registro: los corpus OPUS para lenguas de bajos recursos estan dominados por texto religioso y subtitulos, de modo que el rendimiento en textos legales, tecnicos, medicos o coloquiales puede degradarse notablemente.
- Limitacion de contexto: la familia OPUS-MT no maneja documentos largos; hay que segmentar la entrada en frases u oraciones.
- Conversion de tokenizadores: los SentencePiece originales se han convertido a JSON de tokenizador rapido, una operacion que puede introducir discrepancias sutiles en la tokenizacion; conviene validar con casos de prueba propios antes de produccion.
- Calidad del ewe: es una lengua de bajos recursos, por lo que el volumen y la variedad del corpus paralelo disponible condicionan fuertemente la calidad de la traduccion.
- Sin soporte de herramientas: no admite tool calling, agentes, plantillas de chat ni modo de razonamiento; no debe integrarse esperando ese tipo de comportamiento.
- Datos de fecha anomalos: los metadatos indican creacion en 2026-10-02, lo que sugiere una fecha de sistema incorrecta en el momento de la publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-ee-es
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ee-es
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Candle (runtime de inferencia en Rust de Hugging Face): https://github.com/huggingface/candle
- Articulo de Marian NMT: https://arxiv.org/abs/1804.00344
- Articulo de OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/

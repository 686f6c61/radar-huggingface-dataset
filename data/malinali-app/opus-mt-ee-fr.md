# malinali-app/opus-mt-ee-fr

## Resumen

malinali-app/opus-mt-ee-fr es un paquete de traduccion automatica neuronal para inferencia en dispositivo (on-device) que traduce del ewe (codigo `ee`) al frances (`fr`). No es un modelo entrenado desde cero: se trata de un reempaquetado de los pesos del modelo Helsinki-NLP/opus-mt-ee-fr, desarrollado originalmente por el grupo Helsinki-NLP (Language Technology Research Group, Universidad de Helsinki) dentro de la familia OPUS-MT. El autor, malinali-app, publica los pesos en formato safetensors junto con tokenizadores rapidos convertidos de SentencePiece a JSON, listos para su uso con Candle (`marian_flutter`).

Arquitectura Marian (transformer encoder-decoder) con 75.554.618 parametros totales y un tamano de repositorio de 0,3 GB. Es un modelo denso, no MoE, de un solo par de idiomas y una sola direccion de traduccion. La relevancia practica esta en su tamano reducido: cabe en movil y en CPU sin GPU, lo que permite traduccion offline en escenarios con conectividad limitada.

El repositorio no registra descargas ni likes y no incluye resultados de evaluacion, por lo que su interes es fundamentalmente de despliegue (formato y tokenizadores) mas que de investigacion. La licencia no esta declarada en la ficha de HuggingFace y la model card remite a la del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq), segun el tag `marian` |
| Parametros totales | 75.554.618 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | ee (ewe) y fr (frances) |
| Licencia | no disponible en la ficha de HuggingFace; la model card indica seguir la licencia del modelo upstream (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | translation (text2text-generation) |
| Modelo base | Helsinki-NLP/opus-mt-ee-fr |

## Arquitectura y entrenamiento

La arquitectura es Marian, la implementacion de traduccion automatica neuronal en C++ de Helsinki-NLP, basada en un transformer encoder-decoder con atencion multi-cabeza. El modelo es denso y esta especializado en una unica direccion, ee a fr, con tokenizadores separados para origen y destino (`tokenizer-enc.json` y `tokenizer-dec.json`), lo que es habitual en los modelos Marian de OPUS-MT: cada direccion entrena su propio vocabulario SentencePiece para fuente y objetivo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo ajuste con RLHF o DPO. Los modelos OPUS-MT se entrenan sobre corpus paralelos recopilados en el proyecto OPUS, mayoritariamente de dominio publico y con fuerte peso de textos religiosos y localizacion de software en el caso de idiomas de bajos recursos como el ewe, por lo que el dominio de entrenamiento es acotado. La aportacion concreta de este repositorio no es el entrenamiento, sino la conversion de los pesos originales a safetensors y de los tokenizadores SentencePiece a formato fast tokenizer JSON para permitir inferencia en dispositivo con Candle mediante `marian_flutter`. La model card indica explicitamente que el autor no reclama la propiedad del modelo entrenado.

## Capacidades

- Traduccion de texto de ewe a frances, en una unica direccion (no soporta fr a ee).
- Generacion text2text pura: entrada de texto, salida de texto; no hay modalidad de vision ni audio.
- Tokenizacion rapida con dos tokenizadores independientes, uno para la fuente y otro para el destino.
- Inferencia en dispositivo mediante Candle (`marian_flutter`), pensada para ejecucion local sin servicio remoto.
- Compatibilidad declarada con `transformers` y con endpoints compatibles (tag `endpoints_compatible`), por lo que puede servirse con la API estandar de transformers.
- No dispone de tool calling, function calling, modo agente ni razonamiento multi-paso.
- No hay capacidades multilingues mas alla del par ee-fr.

## Casos de uso

- Traduccion offline en aplicaciones moviles: al ocupar 0,3 GB y 75,5 M de parametros, el modelo se puede empaquetar dentro de una app Flutter mediante Candle y traducir sin conexion, algo critico en zonas de Ghana, Togo o Benin con cobertura irregular.
- Herramientas de atencion a usuarios francoparlantes en comunidades eweparlantes: traduccion local de mensajes entrantes sin enviar contenido sensible a un servicio en la nube.
- Traduccion de documentacion administrativa o sanitaria: conversion de folletos, formularios y avisos del ewe al frances para su revision posterior por un traductor humano.
- Preprocesado de corpus para investigacion: traduccion automatica masiva de textos en ewe a frances para construir conjuntos de datos comparables o para indexacion y busqueda semantica.
- Subtitulado y localizacion de material audiovisual: traduccion de subtitulos en ewe al frances como primer borrador dentro de una cadena de post-edicion.
- Digitalizacion de patrimonio oral y escrito: transcripciones en ewe traducidas al frances para catalogos y archivos accesibles a investigadores.
- Prototipado rapido de productos de traduccion: al ser un modelo pequeno, permite iterar en local con `transformers` en una CPU de portatil antes de decidir si se necesita un modelo mayor.
- Evaluacion comparativa de tecnicas de cuantizacion: su tamano reducido lo hace util como banco de pruebas para medir perdida de BLEU al cuantizar un modelo Marian.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de BLEU, chrF ni evaluaciones humanas, y no registra descargas ni likes. Para una evaluacion rigurosa habria que medir con sacreBLEU sobre un conjunto de test ee-fr y comparar contra el modelo upstream sin reempaquetar, con el fin de verificar que la conversion de tokenizadores no altera la salida.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en cualquier precision razonable. En fp32 los pesos ocupan aproximadamente 302 MB (75,5 M de parametros x 4 bytes); en fp16, unos 151 MB; en int8, unos 76 MB. Son estimaciones aritmeticas a partir del recuento de parametros; el repositorio completo pesa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria, incluidas GTX 1050, GTX 1650, RTX 3060, RTX 4090, A100 o H100; en la practica la GPU no es el cuello de botella.
- Cabe en GPU de consumo: si, en todas las gamas actuales e incluso en iGPU y en CPU sola.
- Despliegue: `transformers` con pipeline de traduccion o con la API de endpoints compatibles; Candle mediante `marian_flutter` para movil; conversiones a GGUF, ONNX o TensorRT no estan documentadas en la informacion disponible, y no se menciona soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Con 75,5 M de parametros, la latencia esperada en CPU moderna es de decenas de milisegundos por frase corta, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| malinali-app/opus-mt-ee-fr | 75,5 M | no disponible | no declarada (remite al upstream) | safetensors + tokenizadores JSON, orientado a Candle y a `transformers` |
| Helsinki-NLP/opus-mt-ee-fr | misma familia Marian, ~75 M | no disponible | CC-BY 4.0 habitualmente, segun la model card upstream | pesos PyTorch y SentencePiece originales |
| NLLB-200-distilled-600M | 600 M | 512 tokens | CC-BY-NC 4.0 (prohibido el uso comercial) | multilingue de 200 idiomas; cobertura concreta del ewe no verificada en la informacion disponible |
| M2M-100 418M | 418 M | 1024 tokens | MIT | multilingue de 100 idiomas; cobertura concreta del ewe no verificada en la informacion disponible |

Frente al modelo upstream, la diferencia no esta en la calidad de traduccion sino en el empaquetado: safetensors y tokenizadores fast listos para Candle. Los modelos multilingues ofrecen cobertura mucho mayor y licencias mas claras (MIT en el caso de M2M-100), pero son entre cinco y ocho veces mas grandes y no estan pensados para inferencia en movil de gama media.

## Limitaciones y advertencias

- Direccionalidad unica: solo traduce de ee a fr; no existe cabeza inversa en este repositorio.
- Idiomas de bajos recursos: los corpus OPUS para el ewe son limitados y de dominio estrecho, de modo que la calidad fuera de ese dominio puede degradarse notablemente.
- Riesgo de alucinacion: como cualquier modelo seq2seq, puede generar traducciones fluidas pero incorrectas, inventar nombres propios o alterar cifras; requiere revision humana en contextos legales, medicos o administrativos.
- Sin ajuste de seguridad ni de alineacion: no hay informacion sobre moderacion de contenido ni sobre filtrado de sesgos; los sesgos del corpus de entrenamiento se transfieren a las traducciones.
- Licencia no declarada en la ficha de HuggingFace: la model card remite a la del modelo upstream, que suele ser CC-BY 4.0, pero la ausencia de declaracion explicita obliga a verificar los terminos antes de un uso comercial.
- Longitud de contexto no documentada: no se especifica el maximo de tokens de entrada, lo que complica el tratamiento de documentos largos y obliga a fragmentar el texto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la conversion a safetensors y a tokenizadores fast sea equivalente al modelo original.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni issues conocidos documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-ee-fr
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-ee-fr
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Articulo de Marian (Junczys-Dowmunt et al., 2018): https://arxiv.org/abs/1804.00344
- Articulo de OPUS-MT (Tiedemann y Thottingal, EAMT 2020): https://aclanthology.org/2020.eamt-1.21/

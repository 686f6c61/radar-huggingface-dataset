# jjinseok/k-safeguard-normalizer-v1

## Resumen

k-safeguard normalizer v1 es un modelo de etiquetado de tokens (token classification) en formato ONNX disenado para revertir la ofuscacion de texto en coreano. Lo desarrolla el autor independiente jjinseok y forma parte del ecosistema k-safeguard, un conjunto de herramientas de salvaguarda para aplicaciones en coreano. El modelo resuelve un problema concreto: los atacantes ofuscan frases (sustituciones de caracteres, inserciones, espaciados anomalos) para evadir filtros de seguridad, y este modelo predice, caracter a caracter, que ediciones hay que deshacer para recuperar una frase candidata legible.

Tecnicamente es un encoder KcELECTRA-base-v2022 (aproximadamente 110 millones de parametros, aunque el autor no declara el recuento exacto) al que se anaden embeddings de caracter y jamo mas una capa BiLSTM, con una cabeza de etiquetado que decide por cada caracter si se mantiene, se elimina, se sustituye por otro silabo o se le anade un espacio delante. El modelo se distribuye como un unico fichero ONNX de unos 515 MB, con tokenizador y vocabulario de caracteres separados, y esta pensado para ejecutarse en CPU con baja latencia (p50 de 13 ms por frase).

Su relevancia actual radica en que la ofuscacion de texto es una tecnica habitual para saltarse guardrails y filtros de moderacion, y apenas existen modelos publicos especializados en normalizacion coreana. El modelo no clasifica contenido ni bloquea nada: solo propone una frase restaurada, por lo que debe integrarse como capa previa a un sistema de moderacion, nunca como sustituto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder KcELECTRA-base-v2022 con embeddings de caracter y jamo, BiLSTM y cabeza de etiquetado de ediciones por caracter |
| Parametros totales | no disponible (base KcELECTRA-base; el autor no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el manifiesto define un maximo de caracteres por frase) |
| Tipos de cuantizacion | no disponible (pesos ya exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC BY-SA 4.0 (pesos); el codigo k-safeguard es Apache-2.0 y KcELECTRA MIT |
| Formato de pesos | ONNX (`normalizer.onnx`, ~515 MB) mas `tokenizer.json`, `char_vocab.json` y `manifest.json` |
| Tamano del repositorio | 0.5 GB |
| Pipeline | token-classification |
| Libreria | onnx / onnxruntime |

## Arquitectura y entrenamiento

El modelo parte del encoder KcELECTRA-base-v2022 (Junbum Lee, licencia MIT, revision `87285578b4686b6d190abd40e947a2a416add6de`), un transformer tipo ELECTRA preentrenado en coreano. Sobre ese encoder se anaden embeddings de caracter y de jamo y una BiLSTM, y se realiza un ajuste fino completo con una cabeza que, para cada caracter de la frase, predice una de cuatro acciones: mantener, eliminar, sustituir por otro silabo o insertar un espacio delante. La inferencia aplica un umbral de confianza definido en `manifest.json`: los caracteres cuya prediccion no supera ese umbral se dejan intactos, lo que limita el dano en frases ya correctas.

El conjunto de entrenamiento es `jjinseok/k-safeguard-normalizer-train-v1`, compuesto por 30.000 frases de Wikipedia en coreano y del benchmark KLUE (subconjuntos `ynat` y `nli`), a las que se aplicaron nueve tipos de ofuscacion basados en reglas. El autor indica que se entreno con una unica semilla (0) y no documenta el uso de RLHF, DPO ni decodificacion especulativa. El modelo se exporto a ONNX para inferencia con onnxruntime, y la logica de preprocesado y postprocesado vive fuera del fichero ONNX, en la libreria k-safeguard.

## Capacidades

- Normalizacion de texto ofuscado en coreano: revierte sustituciones de silabos, inserciones y eliminaciones de caracteres y espaciados anomalos introducidos por generadores de ofuscacion.
- Etiquetado de tokens a nivel de caracter con umbral de confianza configurable.
- Generacion de una unica frase candidata restaurada por entrada (no devuelve multiples hipotesis).
- Ejecucion en CPU con onnxruntime, sin necesidad de GPU.
- Integracion con la pasarela `Gateway` de k-safeguard mediante `MlRestoreProvider`.
- No realiza clasificacion de contenido, moderacion ni bloqueo: solo normaliza.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.
- Capacidad multilingue limitada al coreano; no cubre otros idiomas.

## Casos de uso

- Preprocesado previo a guardrails de moderacion: se coloca delante de un filtro de contenido para que las frases ofuscadas se normalicen antes de la clasificacion, reduciendo evasiones por sustitucion de caracteres. El propio autor advierte que la ganancia de deteccion en este contexto aun no se ha medido.
- Filtrado de comentarios y foros en coreano: normalizar comentarios ofuscados antes de aplicar listas de palabras prohibidas o clasificadores de toxicidad, con latencia de 13 ms por frase en CPU.
- Moderacion de chat en tiempo real: al ejecutarse en CPU con p50 de 13 ms y p95 de 18,4 ms, puede insertarse en pipelines de baja latencia sin GPU dedicada.
- Analisis forense de texto: recuperar la forma original de mensajes ofuscados en investigaciones o auditorias, conservando siempre el texto original como referencia.
- Evaluacion de robustez de sistemas de seguridad: usar el modelo como normalizador de referencia para medir cuanto resisten otros filtros frente a ofuscacion.
- Procesamiento por lotes de contenido generado por usuarios: normalizar grandes volumenes de texto coreano antes de indexacion o clasificacion, dado el bajo coste computacional en CPU.
- Investigacion en normalizacion de texto: servir de baseline reproducible (pesos ONNX, dataset publico y codigo de entrenamiento) para experimentos de restauracion de texto ofuscado.

## Benchmarks y rendimiento

| Metrica | Evaluacion con el mismo generador | Evaluacion con otro generador |
|---|---|---|
| F1 a nivel de caracter | 85,2 % | 63,0 % |
| Tasa de restauracion por frase | 78,9 % | 53,8 % |
| Frases restauradas por completo | 45,6 % | 35,5 % |
| Frases empeoradas tras la restauracion | 1,0 % | 1,9 % |

- Condiciones de evaluacion: 24.444 frases evaluadas una a una, tras una normalizacion sin perdida; los originales de evaluacion no se usaron en entrenamiento.
- Falsos cambios en frases correctas: 5 de 695 frases (0,7 %).
- Latencia en CPU: p50 de 13,0 ms y p95 de 18,4 ms por frase con onnxruntime; el modelo anade unos 517 MB de memoria al cargarse.
- El autor advierte que las cifras con el mismo generador son optimistas, porque el conjunto de evaluacion comparte generador de ofuscacion con el de entrenamiento; la expectativa realista se acerca a las cifras con otro generador.

## Requisitos de hardware

- Memoria: aproximadamente 517 MB adicionales al cargar el modelo en onnxruntime.
- Inferencia en CPU: p50 de 13,0 ms y p95 de 18,4 ms por frase; no requiere GPU.
- GPU: no se documentan requisitos ni aceleracion por GPU; el modelo esta pensado para CPU.
- Cabe en cualquier equipo consumer: el fichero ONNX ocupa unos 515 MB y el repositorio 0,5 GB.
- Despliegue: onnxruntime directamente o a traves de la libreria k-safeguard (`MlRestoreProvider`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Throughput: no disponible de forma explicita, aunque la latencia por frase en CPU permite estimar decenas de frases por segundo en un solo nucleo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| k-safeguard normalizer v1 | Encoder + BiLSTM, etiquetado de ediciones | no disponible (base KcELECTRA-base) | no disponible | Coreano | CC BY-SA 4.0 | ONNX |
| beomi/KcELECTRA-base-v2022 | Encoder ELECTRA preentrenado | ~110 M (base) | 512 tokens (estandar ELECTRA) | Coreano | MIT | safetensors / PyTorch |
| KOTOX (diccionario de caracteres similares) | Recurso lexico, no modelo | no aplica | no aplica | Coreano | MIT | Diccionario |

No se dispone de informacion sobre otros modelos publicos especializados en normalizacion de texto ofuscado en coreano con los que comparar directamente. KcELECTRA es la base del modelo y KOTOX aporta el diccionario de caracteres similares usado por el codigo de ofuscacion, pero ninguno de los dos resuelve la misma tarea.

## Limitaciones y advertencias

- No revierte patrones no vistos en entrenamiento: sustituciones como ㅇ por ㅁ, agrupaciones de emoticonos, envoltura de palabras o espacios dentro de palabras.
- Quedan fuera de su alcance el texto estilo iniciales (초성체), la traduccion semantica, caracteres no coreanos visualmente similares, el yaminjeongeum, las transcripciones latinizadas o en hanja, la mezcla de orden de caracteres y el alargamiento de silabos.
- Solo propone una frase candidata que puede contener errores; no sustituye al texto original, que debe conservarse siempre.
- No decide si un contenido se bloquea o se permite: es una capa de normalizacion, no un clasificador de seguridad.
- La mejora en deteccion al colocarlo delante de un guardrail de prompts no se ha medido todavia; debe tratarse como una capa defensiva adicional.
- Entrenado con una unica semilla (0), sin validacion de estabilidad entre semillas.
- Las metricas con el mismo generador de ofuscacion estan infladas; en produccion conviene asumir cifras cercanas a las de "otro generador" (F1 de 63,0 %).
- Licencia CC BY-SA 4.0 en los pesos: impone atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial; es distinta de la licencia Apache-2.0 del codigo k-safeguard.
- Riesgo de falsos cambios en texto correcto: 0,7 % de frases normales modificadas en la evaluacion.
- Idioma limitado al coreano; no se documenta soporte para otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jjinseok/k-safeguard-normalizer-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/jjinseok/k-safeguard-normalizer-train-v1
- Repositorio k-safeguard (inferencia y generador de ofuscacion): https://github.com/jinseok3639/k-safeguard
- Codigo de entrenamiento: https://github.com/jinseok3639/k-safeguard-ML-experiment
- Modelo base KcELECTRA-base-v2022: https://huggingface.co/beomi/KcELECTRA-base-v2022
- Diccionario de caracteres similares KOTOX: https://github.com/leeyejin1231/KOTOX
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

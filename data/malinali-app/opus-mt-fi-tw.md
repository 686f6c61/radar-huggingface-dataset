# malinali-app/opus-mt-fi-tw

## Resumen

`malinali-app/opus-mt-fi-tw` es un paquete de pesos para traduccion automatica de fines (fi) a twi (tw), publicado por el desarrollador `malinali-app` para su aplicacion Malinali. No se trata de un modelo entrenado desde cero: es un reempaquetado de los pesos del modelo `Helsinki-NLP/opus-mt-fi-tw`, que a su vez forma parte de la coleccion OPUS-MT del grupo Helsinki-NLP. El autor declara explicitamente en la model card que solo redistribuye pesos y convierte los tokenizadores SentencePiece al formato JSON de tokenizador rapido de Hugging Face para permitir inferencia en dispositivo mediante el framework Candle.

Tecnicamente es un modelo MarianMT, es decir, un transformer encoder-decoder clasico orientado a traduccion, con 76.122.509 parametros totales y un repositorio de 0,3 GB. La direccion de traduccion es fija (fi a tw), lo que lo hace inadecuado para traduccion inversa o multilingue general; para esos casos habria que usar el par opuesto o un modelo multilingue. La relevancia de esta publicacion es de tipo practico y de despliegue: ofrece un paquete de 76 millones de parametros que cabe en cualquier dispositivo movil o equipo de gama baja, algo que los modelos NMT multilingues modernos de cientos de millones o miles de millones de parametros no permiten.

La ficha del modelo no aporta datos de entrenamiento, licencia explicita ni resultados de benchmarks. La model card remite a la licencia del modelo original (habitualmente CC-BY 4.0 en la coleccion OPUS-MT), pero no la fija de forma inequivoca en este repositorio, lo que supone un riesgo para uso comercial. El modelo acumula 0 descargas y 0 likes en el momento de la consulta y fue creado el 2 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder para traduccion) |
| Parametros totales | 76.122.509 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | fines (fi) como origen, twi (tw) como destino |
| Licencia | no disponible en el repositorio; la model card indica seguir la licencia del modelo original (habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) |
| Biblioteca | transformers |
| Tokenizadores | `tokenizer-enc.json` y `tokenizer-dec.json` (tokenizador rapido, formato Candle) |
| Modelo base | Helsinki-NLP/opus-mt-fi-tw (finetune/repackaging) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

Archivos declarados por el autor: `config.json` (configuracion Marian), `model.safetensors` (pesos), `tokenizer-enc.json` (tokenizador de origen) y `tokenizer-dec.json` (tokenizador de destino).

## Arquitectura y entrenamiento

La arquitectura es MarianMT, la implementacion de transformer encoder-decoder desarrollada en el proyecto Marian NMT y adoptada por Helsinki-NLP para la coleccion OPUS-MT. Se trata de un transformer estandar con atencion completa, sin mecanismos MoE, sin atencion lineal y sin decodificacion especulativa integrada. Con 76,1 millones de parametros, el modelo se situa en la gama baja de tamano dentro de los sistemas NMT neuronales, lo que prioriza velocidad y huella de memoria sobre capacidad de generalizacion.

No hay informacion en el material proporcionado sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La model card de este repositorio no documenta el proceso de entrenamiento; toda la informacion de entrenamiento corresponde al modelo original de Helsinki-NLP, que no se detalla aqui. La unica intervencion tecnica declarada por `malinali-app` es el reempaquetado de pesos en safetensors y la conversion de los tokenizadores SentencePiece originales a JSON de tokenizador rapido compatible con Candle, mediante el componente `marian_flutter`. Ese cambio de formato es relevante para despliegue en movil, porque elimina la dependencia de SentencePiece en tiempo de ejecucion.

## Capacidades

- Traduccion de texto de fines a twi, en la direccion fi a tw unicamente. No se ha publicado soporte para la direccion inversa tw a fi en este repositorio.
- Generacion de texto secuencial completa (text2text-generation) con decodificacion autoregresiva del lado decodificador.
- Inferencia en dispositivo, sin conexion, gracias al empaquetado en safetensors y tokenizadores JSON para Candle.
- Integracion con el ecosistema transformers (pipeline `translation`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No hay evidencia de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. Es un traductor puro.
- Capacidad multilingue limitada al par fi-tw; no se documentan otros pares de idiomas.

## Casos de uso

- Traduccion en dispositivo para aplicaciones moviles: el paquete de 0,3 GB y 76 millones de parametros permite integrar traduccion fi-tw en una aplicacion Flutter o Android sin conexion a red, usando Candle como motor de inferencia. Es el escenario principal para el que fue publicado el repositorio.
- Traduccion de interfaz de usuario y contenido de producto: cadenas cortas, menus, mensajes de error y textos de ayuda de una aplicacion finlandesa orientada a usuarios de habla twi. La latencia en CPU es viable por el reducido tamano del modelo.
- Preprocesado de corpus y pipelines de datos: traduccion por lotes de documentos fineses a twi antes de indexarlos en un buscador o en un sistema de analisis. El modelo se puede ejecutar en CPU en paralelo con muchas instancias dado su bajo consumo de memoria.
- Investigacion en traduccion de bajos recursos: el twi es un idioma con menos recursos que los idiomas europeos mayoritarios, por lo que este par resulta util como linea base para experimentos de aumento de datos, destilacion o ajuste fino sobre corpus propios.
- Atencion al cliente en mercados especificos: traduccion de mensajes entrantes en fines para operadores o sistemas que trabajan en twi, como paso previo a un sistema de clasificacion o de respuesta asistida.
- Traduccion en sistemas con restricciones de privacidad: al ejecutarse de forma local no requiere enviar el texto a un servicio en la nube, lo que encaja en entornos con requisitos de proteccion de datos o con conectividad limitada.
- Subsistemas de traduccion dentro de un pipeline mayor: por su tamano reducido puede actuar como componente de traduccion intermedia antes de otro modelo mas grande, siempre que el sentido sea fi a tw.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones BLEU, chrF, MMLU, HumanEval ni ninguna metrica de evaluacion. La model card no referencia ningun conjunto de evaluacion ni comparacion cuantitativa con el modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros declarado (76.122.509), no datos publicados por el autor.

- Peso en memoria de los pesos: aproximadamente 305 MB en fp32, 152 MB en fp16/bf16 y 76 MB en int8. A estas cifras hay que sumar el overhead de activaciones y del entorno de ejecucion.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. No se necesita A100, H100 ni similares; el modelo esta muy por debajo de la capacidad de esas tarjetas.
- GPU de consumo: cabe sin dificultad en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3050, RTX 4090 o incluso iGPUs modernas con memoria compartida suficiente.
- CPU: la inferencia en CPU es completamente viable y es el escenario previsto por el autor; el conjunto de pesos en fp32 ocupa unos 305 MB de RAM.
- Despliegue: transformers (PyTorch) con la libreria estandar, y Candle mediante `marian_flutter`, que es el camino documentado por el autor para movil. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible; llama.cpp no soporta arquitecturas Marian.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fi-tw | 76.122.509 | fi a tw | no disponible | no disponible (remite a la del modelo original) | Hugging Face, safetensors |
| Helsinki-NLP/opus-mt-fi-tw | aproximadamente 76 M (modelo de origen) | fi a tw | no disponible | habitualmente CC-BY 4.0 en OPUS-MT | Hugging Face, pesos originales |
| Helsinki-NLP/opus-mt-fi-en | aproximadamente 76 M (misma familia) | fi a en | no disponible | habitualmente CC-BY 4.0 en OPUS-MT | Hugging Face |
| facebook/nllb-200-distilled-600M | aproximadamente 600 M | multilingue (200 idiomas, incluye twi) | no disponible | CC-BY-NC 4.0 | Hugging Face |

El unico modelo estrictamente equivalente es el de Helsinki-NLP, del que este repositorio deriva; las diferencias se limitan al formato de pesos y a los tokenizadores preparados para Candle. Frente a un modelo multilingue como NLLB-200 destilado, esta propuesta ofrece un tamano unas ocho veces menor y un enfoque de un solo par de idiomas, a cambio de no cubrir otros pares ni direcciones. Los datos de rendimiento comparado no estan disponibles.

## Limitaciones y advertencias

- Traduccion en una sola direccion: fi a tw. No hay soporte para tw a fi en este repositorio, y usarlo para ello produciria resultados no fiables.
- Sin datos de evaluacion: no hay BLEU, chrF ni ninguna metrica publicada, por lo que no se puede estimar la calidad real de la traduccion frente al modelo original ni frente a alternativas.
- Riesgo de alucinacion y de deriva en frases largas: los modelos Marian de este tamano degradan la coherencia en entradas largas y pueden repetir o inventar contenido, especialmente en idiomas de bajos recursos como el twi.
- Cobertura limitada del idioma destino: el twi es un idioma con recursos limitados en corpus paralelos, lo que historicamente se traduce en una calidad inferior y mayor variabilidad que en pares con mas datos.
- Licencia ambigua: el repositorio no declara licencia propia y remite a la del modelo original. La model card del upstream suele indicar CC-BY 4.0, pero esta ficha no lo confirma, lo que introduce incertidumbre para uso comercial. Conviene verificar la licencia en el repositorio de Helsinki-NLP antes de desplegar en produccion.
- Confusion entre el tag de idioma `tw` y otros codigos: `tw` corresponde al twi, pero en algunos sistemas ISO el codigo puede colisionar con otras convenciones; hay que verificar la correspondencia en el pipeline de produccion.
- Reempaquetado sin garantia: el autor declara no reclamar la propiedad del modelo entrenado. Cualquier problema de calidad debe atribuirse al modelo original, y no hay garantia de mantenimiento del repositorio.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin historial de uso que permita validar su comportamiento en produccion.
- No apto para tareas generativas generales: es un traductor, no un asistente. No soporta instrucciones, tool calling ni razonamiento.
- Sin cuantizaciones publicadas: si se necesita un modelo en formato GGUF o int8, habria que generarlas a partir de los safetensors, con el riesgo de perdida de calidad asociado y sin referencia de calibracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-fi-tw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fi-tw
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app

Nota: las busquedas web realizadas no devolvieron ninguna fuente relevante sobre el modelo; los resultados obtenidos correspondian a foros sin relacion con el tema. No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.

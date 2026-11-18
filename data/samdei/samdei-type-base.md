# samdei/samdei-type-base

## Resumen

Samdei Type Base es un modelo de traduccion automatica especializado en convertir jemer romanizado (la forma en que los hablantes de jemer escriben en chats y redes sociales usando el alfabeto latino) a escritura jemer nativa. Lo desarrolla Samdei Labs y se distribuye con licencia Apache 2.0. Se trata de un encoder-decoder Transformer a nivel de caracter de 18,63 millones de parametros, disenado para uso en escritorio y servidor, con una variante Mini para dispositivos moviles.

El modelo resuelve un problema practico y poco cubierto: la mayoria de los hablantes de jemer teclean en romanizacion informal, pero la produccion de texto formal requiere escritura jemer. Samdei Type Base aborda esta conversion con un enfoque de troceado en piezas de hasta 8 palabras, busqueda por haces (beam search, k=5) y un pipeline de reranking que combina un modelo de lenguaje de caracteres (5-gramas), un modelo de lenguaje de palabras (bigramas), una penalizacion por palabras fuera de vocabulario y un modelo de canal inverso (jemer a romanizado).

Es relevante por su eficiencia: entrena en unas 6 horas en una GPU de portatil (Apple M5 Pro) y alcanza un CER de 0,052 con reranking en su propio benchmark, con inferencia en formato ONNX int8 a 9,3 ms por entrada en un solo hilo de CPU. Su licencia permisiva y su tamano reducido lo hacen adecuado para integracion en teclados, correctores y herramientas de transcripcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Pre-LN (6 capas encoder, 3 capas decoder, d_model 384, 6 cabezas, FFN 1536) |
| Parametros totales | 18.627.132 (formato transformers); modelo de canal adicional de 7,1 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; se recomienda decodificar en piezas de hasta 8 palabras |
| Tipos de cuantizacion | fp32 (safetensors) e int8 (ONNX) |
| Idiomas soportados | jemer (km); entrada en jemer romanizado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), ONNX int8 (encoder y decoder), ficheros auxiliares NPZ y JSON.GZ para los LM de reranking |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder con normalizacion Pre-LN, 6 capas en el encoder y 3 en el decoder, dimension de modelo 384, 6 cabezas de atencion y FFN de 1536. Opera a nivel de caracter con 216 simbolos de entrada y 228 de salida, compartiendo un unico espacio de identificadores (los simbolos de salida primero). Se carga como `BlenderbotForConditionalGeneration` porque la arquitectura coincide, aunque no guarda relacion con BlenderBot. Incluye un modelo de canal inverso de 7,1 M de parametros (tamano Mini) que lee en direccion jemer a romanizado y se usa para el reranking.

El entrenamiento se realizo en tres etapas sobre una GPU de portatil Apple M5 Pro, con unas 6 horas en total: (1) preentrenamiento con 12,8 millones de pares generados por un generador de tecleo basado en reglas sobre frases jemer reales; (2) ajuste fino con 1,16 millones de pares de estilo chat; (3) adaptacion al registro informal con 1,59 millones de pares y replay. Los modelos de lenguaje para el reranking se construyeron a partir de HPLT v2, FineWeb-2, ALT y frases de chat generadas por LLM, sin Wikipedia. El reranking puntua cada hipotesis como `log P(y|x) + 0,3 log P_char(y) + 0,3 log P_word(y) − 1,0 #OOV(y) + 0,3 log P_ch(x|y)`, donde el termino de canal verifica que la salida explica toda la entrada.

## Capacidades

- Conversion de jemer romanizado a escritura jemer a nivel de caracter, con soporte para registro informal de chat.
- Generacion de texto seq2seq con busqueda por haces configurable (k=5 por defecto en `generation_config.json`).
- Reranking con modelos de lenguaje de caracteres (5-gramas) y de palabras (bigramas), penalizacion OOV y modelo de canal inverso.
- Troceado automatico de entradas largas en piezas de hasta 8 palabras con cortes en puntuacion.
- Inferencia en CPU mediante ONNX int8, ademas de PyTorch fp32.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking.
- Capacidad multilingue limitada al par jemer romanizado / jemer.

## Casos de uso

- Teclados y metodos de entrada para jemer: el modelo convierte lo que el usuario teclea en romanizacion a escritura jemer con una latencia de 9,3 ms por entrada en CPU int8, adecuada para sugerencias en tiempo real en escritorio y servidor.
- Normalizacion de mensajes en plataformas de chat: permite transformar mensajes informales romanizados en texto jemer canonico para moderacion, busqueda o analisis posterior, gracias al troceado en piezas de 8 palabras.
- Transcripcion y archivado de contenido: conversion por lotes de corpus de redes sociales romanizados a jemer para su indexacion y preservacion linguistica.
- Correccion ortografica asistida: el pipeline de reranking con modelo de canal y LM de palabras ayuda a elegir la palabra jemer correcta frente a alternativas frecuentes pero erroneas.
- Herramientas de aprendizaje del jemer: permite a estudiantes que escriben en romanizacion obtener la forma jemer correcta, con la posibilidad de ejecutarse localmente en CPU.
- Integracion en pipelines de datos: el formato ONNX int8 y la licencia Apache 2.0 facilitan su despliegue en servicios de procesamiento de texto sin dependencias de GPU.
- Preprocesamiento para modelos mayores: servir como etapa de normalizacion de entrada romanizada antes de alimentar sistemas de traduccion o analisis con modelos de mayor tamano.

## Benchmarks y rendimiento

Resultados declarados por el autor en Samdei Type Bench (2.155 mensajes y palabras de uso cotidiano con jemer verificado por humanos; metricas CER tras normalizacion y exact match). No verificados de forma independiente.

| Sistema | CER | Exact match |
|---|---|---|
| Samdei Type Base, con reranking | 0,052 | 30 % |
| Samdei Type Base, solo beam search | 0,062 | 24 % |
| Samdei Type Mini, con reranking | 0,058 | 24 % |
| Samdei Type Prime (no publicado) | 0,027 | 61 % |
| Akkhara-mini, piezas de 6 palabras (0,159 en entradas completas) | 0,066 | 23 % |
| AkaraAlpha | 0,281 | 2 % |

Notas del autor: sin puntuacion, el CER de Base es 0,046; en entradas completas sin trocear, el CER con solo beam search es 0,133. En un hilo de CPU Apple M5 Pro con ONNX int8, beam 5 tarda 9,3 ms por entrada (p50).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (pesos de 71,1 MiB) y alrededor de 20 MB en ONNX int8 (encoder 11,3 MiB + decoder 6,3 MiB); los LM de reranking anaden unos 50 MiB en disco.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer moderna (RTX 3060 o superior) es mas que suficiente. El autor entreno en una GPU integrada Apple M5 Pro.
- Cabe en cualquier GPU consumer e incluso en CPU; el modelo esta pensado para escritorio y servidor, con la variante Mini para movil.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (int8), paquete `samdei-type` con pipeline de reranking completo y CLI (`samdei-type -m samdei/samdei-type-base "texto"`).
- Latencia: 9,3 ms por entrada (p50) con beam 5 en un hilo de CPU Apple M5 Pro con ONNX int8. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samdei Type Base | 18,6 M (+7,1 M canal) | piezas de 8 palabras | 0,052 con reranking | Apache 2.0 | Hugging Face |
| Samdei Type Mini | no disponible | piezas de 6-8 palabras | 0,058 con reranking | no disponible | Hugging Face |
| Samdei Type Prime | no disponible | no disponible | 0,027 con reranking | no disponible | No publicado |
| Akkhara-mini | no disponible | piezas de 6 palabras | 0,066 (0,159 en entradas completas) | no disponible | no disponible |
| AkaraAlpha | no disponible | no disponible | 0,281 | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo cubre jemer romanizado a jemer; no es un modelo generalista ni multilingue.
- El rendimiento cae en entradas largas sin trocear: CER de 0,133 con solo beam search en entradas completas frente a 0,062 con troceado en piezas de 8 palabras.
- El exact match es bajo (30 % con reranking), por lo que no es adecuado para tareas que exijan coincidencia exacta sin revision humana.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente; el propio autor senala que la ventaja de Prime sobre Base es una cota superior por el diseno del benchmark.
- Riesgo de alucinacion y de sustitucion de palabras raras por frecuentes si se omite el termino de canal del reranking.
- El reranking completo requiere los modelos de lenguaje y el modelo de canal incluidos en el repositorio, ademas del paquete `samdei-type`; el uso solo con transformers ofrece menor calidad.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni soporte.
- No dispone de tool calling, agentes ni capacidades multimodales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/samdei/samdei-type-base)
- [Modelo preentrenado base](https://huggingface.co/samdei/samdei-type-base-pretrained)
- [Samdei Type Mini](https://huggingface.co/samdei/samdei-type-mini)
- [Dataset de preentrenamiento](https://huggingface.co/datasets/samdei/samdei-type-pretraining-data)
- [Dataset de ajuste fino](https://huggingface.co/datasets/samdei/samdei-type-finetuning-data)
- [Benchmark Samdei Type Bench](https://huggingface.co/datasets/samdei/samdei-type-bench)
- [Repositorio del paquete samdei-type](https://github.com/Samdei-Labs/samdei-type)

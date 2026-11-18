# samdei/samdei-type-base-pretrained

## Resumen

Samdei Type Base (pretrained) es un checkpoint de etapa 1 (pretrained) de un modelo encoder-decoder a nivel de caracter desarrollado por Samdei Labs. Convierte texto jemer romanizado (transliteracion latina) a escritura jemer (alfabeto camboyano). El modelo tiene 18,63 millones de parametros y se distribuye como un checkpoint estandar de transformers que carga como `BlenderbotForConditionalGeneration` por compatibilidad arquitectonica, aunque no guarda relacion con BlenderBot.

El checkpoint fue preentrenado sobre 12,8 millones de pares generados aplicando un generador de tecleo basado en reglas a 1,41 millones de frases web reales en jemer, mas 2.400 frases de chat escritas por un LLM y multiplicadas por 40. El objetivo del preentrenamiento es ensenar al modelo vocabulario y ortografia jemer; no ha aprendido todavia como teclea la gente real en conversaciones. Por eso se publica como base para fine-tuning propio, y el autor remite al checkpoint afinado `samdei/samdei-type-base` para conversion de chat tal cual.

Es relevante para desarrolladores que trabajan con jemer: el idioma tiene una brecha importante entre la transliteracion latina que se usa en chats y la escritura nativa, y este modelo ofrece una base ligera (0,1 GB de repo) que se puede afinar en hardware modesto. El checkpoint se entreno en una unica GPU de portatil (Apple M5 Pro) durante 4,9 horas, lo que indica que el ciclo completo de entrenamiento es accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Pre-LN, a nivel de caracter |
| Parametros totales | 18.627.132 (18,63 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrada limitada a 132 caracteres en entrenamiento; entradas de como maximo 8 palabras por pieza |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | Jemer (km) como salida; entrada romanizada |
| Licencia | Apache-2.0 (conservar `NOTICE` al redistribuir) |
| Formato de pesos | safetensors (carga con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder con normalizacion Pre-LN: 6 capas en el encoder y 3 en el decoder, dimension de modelo 384, 6 cabezas de atencion y FFN de 1536. El vocabulario de entrada tiene 216 simbolos y el de salida 228; ambos comparten un unico espacio de ids (los simbolos de salida primero), por lo que transformers cuenta 18,63 M de parametros. Los simbolos de salida se almacenan en el tokenizer con el prefijo `"\ue000"` mas el caracter. El modelo carga como `BlenderbotForConditionalGeneration` porque la arquitectura coincide, pero no comparte nada mas con BlenderBot.

El preentrenamiento uso 12,8 M de pares: la primera version del generador de tecleo aplicada dos veces (dos semillas) a 1,41 M de frases web, mas 2.400 frases de chat escritas por un LLM tecleadas de la misma forma y multiplicadas por 40. El lado jemer es texto real procedente de HPLT v2, FineWeb-2, Wikipedia en jemer y ALT, ademas de las frases de chat. El entrenamiento duro 60.000 pasos (mejor checkpoint en 60k), con learning rate pico de 7e-4, en 4,9 horas sobre una Apple M5 Pro. El checkpoint se selecciono sobre Dev-Sentences y Akkhara-Preview (una vista previa publica de 110 filas nunca entrenada). No se entreno sobre datos de evaluacion. Para fine-tuning, el autor indica usar `dropout=0.0` (el dropout de Blenderbot tambien afecta embeddings, lo que no se uso en entrenamiento); el dropout de atencion y FFN (0,1) se mantiene.

## Capacidades

- Transliteracion y romanizacion: conversion de jemer romanizado a escritura jemer a nivel de caracter.
- Generacion seq2seq condicionada, con decodificacion por beam search (el autor reporta beam 5 en sus resultados).
- Manejo de entradas cortas: disenado para piezas de como maximo 8 palabras; el autor documenta como trocear mensajes largos.
- Base para fine-tuning: admite cualquier bucle de entrenamiento seq2seq estandar de transformers.
- Aprendizaje de vocabulario y ortografia jemer a partir de texto web real.
- No dispone de tool calling, function calling, modo thinking, vision ni audio segun la informacion disponible.
- Capacidades multilingues limitadas al jemer (entrada romanizada, salida en jemer).

## Casos de uso

- Fine-tuning para un habito de tecleo concreto: partiendo de este checkpoint, se puede afinar con pares (romanizado, jemer) recogidos de un usuario o comunidad para capturar sus convenciones de escritura, algo que el checkpoint preentrenado no cubre por si solo.
- Adaptacion a un dominio especifico: con datos de un sector (medico, legal, comercio), se afina el modelo para que el vocabulario jemer y las transliteraciones de ese dominio sean correctas, aprovechando que ya conoce ortografia jemer general.
- Normalizacion de texto jemer en pipelines de datos: usar el modelo para convertir entradas romanizadas de formularios o registros web a jemer canonico antes de indexar o analizar, troceando en piezas de como maximo 8 palabras.
- Construccion de un corrector ortografico jemer: el checkpoint sirve de base para un modelo que detecte y corrija errores de escritura, afinando sobre pares con errores reales.
- Prototipado rapido de un conversor de teclado: al ocupar 0,1 GB y cargar con transformers, se puede desplegar en un portatil o servidor pequeno para probar la viabilidad de un teclado o entrada romanizada antes de invertir en datos reales.
- Investigacion sobre transliteracion de lenguas de escritura no latina: el modelo y sus datos permiten reproducir el pipeline (generador de tecleo, preentrenamiento, fine-tuning) en otras lenguas con problemas similares de romanizacion.
- Generacion de datos sinteticos de entrenamiento: usar el checkpoint para producir pares romanizado-jemer que alimenten otros modelos o aumenten datasets, revisando siempre la calidad de la salida.

## Benchmarks y rendimiento

Resultados en Samdei Type Bench, beam 5, entradas en piezas de como maximo 8 palabras:

| Checkpoint | CER | Exact |
|---|---|---|
| Este checkpoint (pretrained) | 0,097 | 15 % |
| Samdei Type Base (afinado desde este) | 0,062 | 24 % |
| Samdei Type Base con reranking por LM | 0,052 | 30 % |

El autor senala que el fine-tuning aporta la mayor ganancia individual y que parte de esa mejora es de convencion: este checkpoint mantiene muchos toponimos en alfabeto latino, como hace su dato de preentrenamiento, mientras que el bench los escribe en jemer.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 18,63 M de parametros y el repo ocupa 0,1 GB, por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento original se hizo en una Apple M5 Pro, lo que indica que hardware de portatil es suficiente.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente, y tambien en CPU.
- Opciones de despliegue: transformers con PyTorch (documentado en la model card); el autor menciona que la carpeta guardada carga con transformers y con `samdei-type` (repositorio GitHub de Samdei Labs). No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samdei Type Base (pretrained) | 18,63 M | Entradas de hasta 132 caracteres / 8 palabras por pieza | 0,097 | Apache-2.0 | Hugging Face |
| Samdei Type Base (afinado) | no disponible (misma arquitectura) | no disponible | 0,062 (0,052 con reranking) | no disponible | Hugging Face |
| Samdei Type Mini (pretrained) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos sobre otros modelos comparables de transliteracion jemer en la informacion proporcionada.

## Limitaciones y advertencias

- Las entradas romanizadas siguen las personas de tecleo del generador, no el chat real: maneja mucho mejor la escritura cuidadosa que las abreviaturas agresivas.
- Se entreno solo con entradas cortas (como maximo 132 caracteres), por lo que el texto largo debe decodificarse en piezas.
- El lado jemer es mayoritariamente texto web, con sus temas y sesgos.
- No ha aprendido como teclea la gente en chat; para ese uso hay que usar el checkpoint afinado o afinar este.
- Parte de la diferencia de metricas frente al checkpoint afinado es de convencion (toponimos en latin frente a jemer), no solo de calidad.
- Para fine-tuning hay que desactivar el dropout de embeddings (`dropout=0.0`), o la perdida en validacion empeora.
- Las etiquetas de entrenamiento deben construirse con el prefijo `"\ue000"` mas el caracter y rellenarse con -100 para ignorar el padding.
- Licencia Apache-2.0 permite uso comercial, pero exige conservar `NOTICE` al redistribuir; los datos de entrenamiento son CC BY-SA 4.0 con sus propias obligaciones.
- Riesgo de alucinacion y sesgos especificos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samdei/samdei-type-base-pretrained
- Checkpoint afinado: https://huggingface.co/samdei/samdei-type-base
- Checkpoint Mini pretrained: https://huggingface.co/samdei/samdei-type-mini-pretrained
- Dataset de preentrenamiento: https://huggingface.co/datasets/samdei/samdei-type-pretraining-data
- Bench de evaluacion: https://huggingface.co/datasets/samdei/samdei-type-bench
- Repositorio GitHub: https://github.com/Samdei-Labs/samdei-type

# malinali-app/opus-mt-en-tw

## Resumen

malinali-app/opus-mt-en-tw es un paquete de pesos del modelo de traduccion automatica Helsinki-NLP/opus-mt-en-tw, reempaquetado por el proyecto Malinali para inferencia en dispositivo (on-device). La direccion de traduccion es ingles (en) a twi (tw), una lengua del grupo Akan hablada principalmente en Ghana. El modelo base es un sistema de traduccion neuronal Marian, la arquitectura encoder-decoder basada en transformer que el grupo Helsinki-NLP (Universidad de Helsinki) desarrollo dentro del proyecto OPUS-MT.

El repositorio no introduce un modelo nuevo: Malinali se limita a redistribuir los pesos en formato safetensors y a convertir los tokenizadores SentencePiece originales a formato JSON de tokenizador rapido compatible con la libreria Candle (concretamente el componente marian_flutter), orientado a despliegue offline en aplicaciones moviles. Cuenta con 73.903.784 parametros totales y un tamano de repositorio de aproximadamente 0,3 GB.

Su relevancia es practica: ofrece una via lista para usar de traduccion en a twi en entornos sin conectividad, algo poco frecuente, ya que el twi es una lengua con recursos limitados (low-resource) y la mayoria de los sistemas multilingues de gran tamano lo cubren de forma marginal. La licencia no esta declarada en los metadatos de HuggingFace; la model card remite a la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion automatica) |
| Parametros totales | 73.903.784 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles), tw (twi) |
| Licencia | no disponible en los metadatos; la model card indica seguir la licencia del modelo original (habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors) |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Helsinki-NLP/opus-mt-en-tw |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Marian, un transformer de tipo encoder-decoder disenado especificamente para traduccion automatica neuronal. El encoder procesa la secuencia de entrada y el decoder genera la traduccion de forma autorregresiva. Con 73,9 millones de parametros, se trata de un modelo compacto, coherente con el planteamiento de OPUS-MT de ofrecer traduccion eficiente para pares de idiomas concretos, en lugar de un unico modelo multilingue muy grande.

No se dispone de informacion en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. El entrenamiento original corresponde al proyecto OPUS-MT de Helsinki-NLP y se basa en corpus paralelos de OPUS, pero esos detalles no estan documentados en este repositorio. La aportacion tecnica de Malinali no es de entrenamiento sino de empaquetado: redistribuye los pesos en safetensors y convierte los tokenizadores SentencePiece a JSON de tokenizador rapido, con un tokenizador separado para origen (tokenizer-enc.json) y destino (tokenizer-dec.json), para su uso en Candle.

## Capacidades

- Traduccion de texto de ingles a twi (direccion unica en -> tw).
- Generacion de texto de tipo text2text-generation mediante pipeline de traduccion.
- Inferencia local en dispositivo, sin necesidad de conexion a servicios en la nube.
- Compatibilidad con la libreria transformers y con el ecosistema Candle a traves del modulo marian_flutter.
- Uso de tokenizador rapido especifico para codificador y decodificador.
- No se documentan capacidades de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Traduccion offline en aplicaciones moviles: integrable en apps Flutter mediante marian_flutter para traducir texto de ingles a twi sin conexion, gracias al bajo peso del modelo (unos 0,3 GB).
- Asistencia a comunidades hablantes de twi: herramientas de traduccion para contextos educativos o sanitarios en Ghana donde la conectividad es limitada.
- Traduccion de documentacion y contenidos de ingles a twi: conversion de materiales informativos o administrativos a la lengua local.
- Integracion en pipelines de traduccion por lotes: procesamiento de grandes volumenes de texto en servidores modestos dado el reducido tamano del modelo.
- Prototipado de sistemas de traduccion para lenguas con recursos limitados: base para investigacion sobre pares de idiomas poco representados.
- Traduccion embebida en dispositivos de bajos recursos: al contar con 73,9 millones de parametros, puede ejecutarse en CPU o en GPU de gama baja.
- Base para ajuste fino adicional (fine-tuning): punto de partida para adaptaciones de dominio en el par en-tw.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativa, en torno a 0,3 GB en precision FP32 (73,9 M de parametros), aproximadamente 0,15 GB en FP16 y menos de 0,1 GB en cuantizacion INT8. Son estimaciones derivadas del numero de parametros, no datos declarados por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; GPU de datacenter (A100, H100) no son necesarias para este tamano.
- Caben en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en muchos casos en CPU.
- Opciones de despliegue: libreria transformers; el modelo esta preparado especificamente para Candle (marian_flutter) en el ecosistema Malinali. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI (siendo un modelo Marian, no es un LLM generativo de tipo decoder-only).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| malinali-app/opus-mt-en-tw | 73.903.784 | en -> tw | no disponible (remite al modelo base) | safetensors | Reempaquetado para Candle on-device |
| Helsinki-NLP/opus-mt-en-tw | no disponible en esta informacion | en -> tw | segun model card del original (habitualmente CC-BY 4.0) | no disponible en esta informacion | Modelo base del que deriva el anterior |
| Otros modelos OPUS-MT por par de idiomas | varian (tipicamente decenas de millones) | pares concretos | habitualmente CC-BY 4.0 | varian | Misma arquitectura Marian, distinto par linguistico |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de direccion unica: solo traduce de ingles a twi; no soporta la direccion inversa ni otros pares.
- Lengua de bajos recursos: el twi cuenta con menos corpus paralelos que idiomas mayoritarios, lo que puede traducirse en menor calidad y cobertura frente a pares como en-es o en-fr.
- Riesgo de alucinacion y de traducciones imprecisas: como cualquier sistema de traduccion neuronal, puede generar contenido incorrecto o inventar terminos, especialmente con vocabulario especializado o poco frecuente.
- Sesgos potenciales: no documentados en la informacion disponible, pero pueden heredarse de los corpus de entrenamiento originales de OPUS.
- Limitaciones de contexto: la longitud maxima de contexto no esta declarada; los modelos Marian suelen estar limitados a secuencias relativamente cortas, por lo que textos largos deberian dividirse.
- Licencia: no declarada explicitamente en los metadatos de HuggingFace. Antes de un uso comercial es necesario verificar la licencia del modelo original Helsinki-NLP/opus-mt-en-tw, ya que la model card solo remite a ella.
- Sin garantias del autor del reempaquetado: Malinali declara que no reclama la propiedad del modelo entrenado y solo redistribuye pesos y tokenizadores, por lo que el soporte y la responsabilidad sobre la calidad recaen en el modelo original.
- Ausencia de benchmarks publicados: no hay metricas (BLEU, chrF, etc.) disponibles para evaluar su calidad objetivamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-en-tw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-tw
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Proyecto Malinali: https://malinali.app

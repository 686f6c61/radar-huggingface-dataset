# malinali-app/opus-mt-en-ti

## Resumen

`malinali-app/opus-mt-en-ti` es un paquete de pesos para traduccion automatica ingles (en) a tigrina (ti) publicado por malinali-app. No es un modelo entrenado desde cero: se trata de un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-en-ti`, el modelo de traduccion del proyecto OPUS-MT de Helsinki-NLP, convertidos a formato safetensors y acompanados de tokenizadores rapidos en JSON para su uso con Candle (`marian_flutter`). El objetivo declarado es ofrecer inferencia en el propio dispositivo (on-device) dentro de la aplicacion Malinali.

Tecnicamente es un modelo Marian (transformer encoder-decoder) de aproximadamente 77 millones de parametros (77.007.434 segun el archivo de pesos safetensors), con un tamano de repositorio de 0,3 GB. La direccion de traduccion es unidireccional: ingles a tigrina. El tigrina es una lengua semitica hablada principalmente en Eritrea y Etiopia, lo que lo situa en el segmento de lenguas de bajos recursos.

Su relevancia es doble: por un lado cubre un par linguistico poco atendido en la traduccion automatica abierta; por otro, su enfoque de empaquetado ligero (pesos mas tokenizadores para Candle) lo orienta a despliegue embebido y movil, donde el tamano y el consumo de memoria son criticos. Se trata de un modelo con cero descargas y cero likes en el momento de la consulta, y creado en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion automatica) |
| Parametros totales | 77.007.434 (aproximadamente 77 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) y tigrina (ti) |
| Licencia | no disponible (la model card remite a la licencia del modelo base, tipicamente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) con tokenizadores rapidos JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal, que es la base de todos los modelos del proyecto OPUS-MT de Helsinki-NLP. El autor original del entrenamiento es Helsinki-NLP; malinali-app unicamente reempaqueta los pesos y convierte los tokenizadores SentencePiece al formato JSON de tokenizador rapido de Hugging Face, sin reclamar la propiedad del modelo entrenado.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. Los modelos OPUS-MT se entrenan tradicionalmente sobre datos del corpus OPUS, pero los detalles concretos de este par linguistico no se especifican en la informacion proporcionada, por lo que se marcan como no disponibles. No se documentan innovaciones tecnicas adicionales mas alla del proceso de conversion de formatos para inferencia on-device.

## Capacidades

- Traduccion automatica unidireccional de ingles a tigrina.
- Generacion de texto de salida mediante decodificacion seq2seq (text2text-generation).
- Inferencia on-device optimizada para Candle mediante el modulo `marian_flutter`.
- Compatibilidad con la libreria transformers (pipeline de translation).
- Uso de tokenizadores rapidos separados para el lado fuente (encoder) y el lado destino (decoder).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio o modo de razonamiento (thinking mode).
- El soporte multilingue se limita a los dos idiomas del par (en y ti); no es un modelo multilingue general.

## Casos de uso

- Traduccion embebida en aplicaciones moviles: el formato safetensors mas tokenizadores para Candle y su tamano reducido (0,3 GB de repositorio) permiten integrarlo en una app Flutter para traducir texto de ingles a tigrina sin conexion.
- Traduccion de interfaz y contenido de producto: traduccion de cadenas de UI, notificaciones y textos cortos del ingles al tigrina en el propio dispositivo, evitando enviar datos a servicios en la nube.
- Atencion a usuarios tigrinoparlantes: traduccion de mensajes de soporte o formularios escritos en ingles hacia tigrina para comunidades de Eritrea y Etiopia.
- Procesamiento por lotes sin conexion: al ser un modelo pequeno de 77 M de parametros, se puede ejecutar en CPU o GPU de gama baja para traducir volumenes moderados de documentos en pipelines locales.
- Preprocesado o postprocesado dentro de un sistema de traduccion mayor: uso como componente especializado en el par en a ti cuando se necesita una alternativa ligera a modelos multilingues mucho mas grandes.
- Traduccion de contenido educativo o humanitario: materiales escritos en ingles que deban difundirse en tigrina en contextos de conectividad limitada.
- Prototipado e investigacion en lenguas de bajos recursos: base para experimentos de ajuste fino o evaluacion de calidad en un par linguistico poco cubierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 (77 M de parametros), en torno a 0,15 GB en FP16 y unos 0,08 GB en INT8, sobre la base del recuento de parametros; estos valores son estimaciones derivadas del tamano del modelo, no datos publicados.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Cabe en GPUs de consumo como RTX 3060, RTX 4090 o inferiores, e incluso en GPU integradas.
- Cabe en consumer GPU: si, en practicamente cualquier GPU de consumo actual.
- Despliegue on-device: si, es su objetivo principal, mediante Candle (`marian_flutter`) en entornos Flutter.
- Opciones de despliegue: transformers (pipeline de translation), Candle con el modulo `marian_flutter`; no se documentan otras opciones como vLLM, TGI, Ollama o llama.cpp en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-en-ti (este) | 77 M | no disponible | en, ti | no disponible | Hugging Face |
| Helsinki-NLP/opus-mt-en-ti (base) | 77 M (aprox.) | no disponible | en, ti | CC-BY 4.0 (tipico en OPUS-MT) | Hugging Face |
| Alternativas multilingues (por ejemplo NLLB-200) | no disponible | no disponible | multilingue, incluye ti | no disponible | Hugging Face |

La comparacion mas directa es con el modelo base `Helsinki-NLP/opus-mt-en-ti`, del que este repositorio solo difiere en el empaquetado y el formato de los tokenizadores. Frente a modelos multilingues de mayor tamano que tambien cubren el tigrina, la ventaja de este modelo seria su ligereza para inferencia on-device, aunque no se dispone de datos de calidad comparada para confirmarlo.

## Limitaciones y advertencias

- Direccion unidireccional: solo traduce de ingles a tigrina, no a la inversa.
- Cobertura limitada a dos idiomas: no es un modelo multilingue general.
- Modelo de 77 M de parametros: la calidad de traduccion en pares de bajos recursos como en-ti puede ser inferior a la de modelos multilingues mucho mayores.
- Riesgo de alucinacion y de traducciones inexactas, especialmente en frases largas, terminologia especializada o dominios poco representados en los datos de entrenamiento.
- Longitud de contexto no especificada: no hay dato publicado sobre el maximo de tokens por segmento, lo que obliga a validar el comportamiento con entradas largas antes de usarlo en produccion.
- Licencia no disponible en la ficha: la model card remite a la licencia del modelo base (tipicamente CC-BY 4.0 en OPUS-MT), por lo que se debe verificar la licencia upstream antes de cualquier uso comercial.
- Es un reempaquetado: el autor no reclama la propiedad del modelo entrenado, de modo que la responsabilidad de la calidad recae en el modelo base de Helsinki-NLP.
- Sin adopcion verificada: cero descargas y cero likes en el momento de la consulta, sin garantia de mantenimiento ni soporte.
- No se documentan sesgos especificos, pero al entrenarse sobre corpus OPUS cabe esperar los sesgos propios de dichas fuentes; no hay evaluacion de sesgos publicada para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-en-ti
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ti
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Corpus OPUS: http://opus.nlpl.eu/
- Aplicacion Malinali: https://malinali.app

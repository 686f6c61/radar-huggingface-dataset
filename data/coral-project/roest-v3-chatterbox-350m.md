# CoRal-project/roest-v3-chatterbox-350m

## Resumen

Røst-v3-chatterbox-350m es un modelo de síntesis de voz (text-to-speech) en danés, desarrollado por el Alexandra Institute dentro del proyecto CoRal. Se trata de un ajuste fino (fine-tuning) de Chatterbox-Turbo, uno de los modelos TTS de código abierto más avanzados, que emplea la arquitectura GPT-2 Medium con 350 millones de parámetros. El modelo base fue entrenado con más de 500 000 horas de habla inglesa de alta calidad, y el ajuste fino se realizó con más de 2000 horas de habla danesa, lo que le permite generar voz natural y expresiva en este idioma.

El modelo destaca por su capacidad de clonación de voz zero-shot: basta con un fragmento de audio de unos 10 segundos para sintetizar con una voz nueva. Además, es compatible con la librería Chatterbox original, lo que facilita su integración y conserva las marcas de agua (watermarks) integradas. Está pensado para aplicaciones que requieran síntesis de voz en danés, como asistentes virtuales, audiolibros o accesibilidad, y ofrece dos voces predefinidas (Mic y Nic) que funcionan especialmente bien.

La relevancia de este modelo radica en que cubre un idioma con pocos recursos TTS de calidad, y lo hace con una arquitectura ligera (350M) que puede ejecutarse en hardware de consumo. Su licencia OpenRAIL permite uso comercial con ciertas restricciones, y el framework de ajuste fino está disponible en abierto, lo que facilita su adaptación a dominios específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 Medium (decoder-only transformer) adaptado para TTS |
| Parametros totales | 350 millones (aprox., segun nombre del modelo y arquitectura) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (recomendado dividir textos largos en frases) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Danes (da) principalmente; el modelo base soporta ingles, pero el ajuste fino es especifico para danes |
| Licencia | OpenRAIL (openrail) |
| Formato de pesos | Safetensors (tambien incluye .json, .txt, .pt, .model) |

## Arquitectura y entrenamiento

El modelo se basa en Chatterbox-Turbo, que utiliza la arquitectura GPT-2 Medium (un transformer decoder-only) con un tokenizer propio. El modelo original fue entrenado con más de 500 000 horas de habla inglesa de alta calidad, y el ajuste fino se realizó con más de 2000 horas de habla danesa procedente de varios datasets públicos (FTSpeech, NST-DA, NOTA y el dataset CoRal-TTS). El proceso de ajuste fino se llevó a cabo con el framework coral_chatterbox, un fork de Chatterbox TTS desarrollado por el Alexandra Institute, que permite adaptar el modelo a otros idiomas o dominios.

No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento se centra en el ajuste supervisado con datos de habla. El modelo conserva las capacidades del base, como la clonación de voz zero-shot y la generación de audio con marcas de agua. La arquitectura es relativamente ligera (350M), lo que permite inferencia en GPUs de consumo, aunque no se especifican requisitos exactos de hardware.

## Capacidades

- Generacion de voz en danes con alta naturalidad (MOS 4.01 en evaluacion con hablantes nativos).
- Clonacion de voz zero-shot: basta con un audio de 10 segundos como prompt para sintetizar con una voz nueva.
- Dos voces predefinidas (Mic y Nic) optimizadas para el modelo.
- Compatible con la libreria Chatterbox original, incluyendo la generacion de audio con marcas de agua.
- Soporte para ajuste de parametros de generacion (temperatura, top_p, top_k) para controlar la prosodia y las pausas.
- No incluye capacidades de vision, tool calling ni agentes; es exclusivamente un modelo TTS.

## Casos de uso

- Audiolibros en danes: el modelo puede leer textos largos si se dividen en frases, generando una narracion natural y estable. Su calidad MOS de 4.01 lo hace adecuado para produccion editorial.
- Asistentes de voz en danes: integrable en aplicaciones de asistencia por voz (por ejemplo, en dispositivos domésticos o aplicaciones moviles) para responder con voz sintetica en danes.
- Accesibilidad para personas con discapacidad visual: permite convertir contenido escrito en danes a audio, facilitando la lectura de noticias, documentos o libros.
- Doblaje y locucion para videos: gracias a la clonacion de voz zero-shot, se puede generar locucion con una voz especifica a partir de una muestra corta, util para videos corporativos o educativos.
- Sistemas de respuesta interactiva (IVR): en centros de atencion al cliente en danes, el modelo puede generar mensajes de voz naturales para menus telefonicos.
- Investigacion en TTS: al ser de codigo abierto y con framework de ajuste fino disponible, sirve como base para experimentos en sintesis de voz para lenguas nordicas o para mejorar la naturalidad en danes.

## Benchmarks y rendimiento

El modelo fue evaluado mediante Mean Opinion Score (MOS) con un panel de 20 hablantes nativos de danes. Se utilizaron 10 muestras para cada una de las dos voces (Mic y Nic), generadas con temp=0.7, top_p=0.95, top_k=600. El resultado fue un MOS de 4.01, que corresponde a una calidad "buena" (el habla suena mayormente natural, aunque se percibe que es sintetica, no resulta molesta).

| Metrica | Valor |
|---|---|
| MOS (Mean Opinion Score) | 4.01 |
| Panel de evaluacion | 20 hablantes nativos de danes |
| Muestras evaluadas | 10 por voz (Mic y Nic) |
| Parametros de generacion | temp=0.7, top_p=0.95, top_k=600 |

No se han publicado resultados comparativos con otros modelos TTS en danes en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU en la documentacion del modelo.
- Dado el tamaño de 350M parametros, se estima que puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM (en precision fp16), aunque no hay datos confirmados.
- El codigo de inferencia permite usar CPU (cambiando el dispositivo a "cpu"), aunque con mayor latencia.
- Se recomienda el uso de la libreria chatterbox-tts y torchaudio para la generacion.
- No se mencionan opciones de despliegue como vLLM u Ollama; el modelo se usa directamente con la API de Chatterbox.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos TTS en danes. Como referencia, se puede comparar con el modelo base Chatterbox-Turbo y con Chatterbox Multilingual V3, pero no hay benchmarks publicados que los enfrenten directamente.

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Røst-v3-chatterbox-350m | 350M | Danes | No disponible | OpenRAIL | Fine-tune de Chatterbox-Turbo para danes |
| Chatterbox-Turbo (base) | 350M | Ingles | No disponible | OpenRAIL | Modelo original, 500k horas de ingles |
| Chatterbox Multilingual V3 | 0.5B | Multilingue | No disponible | OpenRAIL | Version general multilingue, no especifica para danes |

## Limitaciones y advertencias

- El modelo no maneja textos largos de forma nativa; se recomienda dividir el texto en frases para evitar degradacion en la calidad.
- La evaluacion MOS se realizo con un panel limitado (20 personas) y solo con dos voces; la calidad puede variar con otras voces o condiciones.
- No se han documentado sesgos especificos, pero al estar entrenado principalmente con datos de habla danesa, puede tener limitaciones con acentos regionales o variantes dialectales.
- La licencia OpenRAIL permite uso comercial, pero impone restricciones de uso responsable (por ejemplo, no generar voces sin consentimiento).
- El modelo incluye marcas de agua en el audio generado, lo que puede ser un requisito o una limitacion segun el caso de uso.
- No se proporcionan datos sobre latencia o throughput en diferentes hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CoRal-project/roest-v3-chatterbox-350m
- Repositorio del framework de ajuste fino (coral_chatterbox): https://github.com/alexandrainst/coral_chatterbox
- Repositorio original de Chatterbox (Resemble AI): https://github.com/resemble-ai/chatterbox

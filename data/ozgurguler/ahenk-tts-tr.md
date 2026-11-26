# ozgurguler/ahenk-tts-tr

## Resumen

Ahenk es un adaptador LoRA en turco para el modelo de síntesis de voz VoxCPM2 de OpenBMB. Lo desarrolla el usuario ozgurguler y resuelve el problema de generar voz en turco con una identidad vocal concreta (una voz femenina diseñada, denominada f022), control emocional y pronunciación correcta de números y formatos locales. El adaptador se publica bajo licencia CC-BY-4.0 y se distribuye como pesos LoRA que se cargan sobre el modelo base de 2B parámetros.

El modelo resulta relevante porque combina un backbone TTS de 2B parámetros con un adaptador LoRA de solo 36,2 millones de parámetros entrenado específicamente para turco, lo que permite obtener una voz sintética estable y expresiva sin necesidad de reentrenar el modelo completo. Trabaja a 48 kHz, admite instrucciones de emoción en lenguaje natural y ofrece seis emociones predefinidas más risa. La voz f022 fue diseñada a partir de una descripción textual en inglés con VoxCPM2, no clonada de ninguna persona real, y todos los audios de entrenamiento son sintéticos.

La ficha se basa exclusivamente en la model card publicada en Hugging Face; los datos que no aparecen en ella se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (modelo base) + adaptador LoRA |
| Parametros totales | 2B (modelo base) + 36,2 M (LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repositorio de 0,1 GB; se infiere LoRA, formato exacto no indicado) |
| Frecuencia de muestreo | 48 kHz |
| Identidad vocal | una voz femenina diseñada (f022) |
| Emociones | 6 (alegre, tranquila, enfadada, triste, empática, sorprendida) + risa |
| Requisitos | GPU (indicado por el autor) |
| Modelo base | openbmb/VoxCPM2 |
| Libreria | voxcpm |

## Arquitectura y entrenamiento

Ahenk es un adaptador LoRA sobre VoxCPM2, un modelo TTS de 2B parámetros. El adaptador añade 36,2 millones de parámetros entrenables y se aplica sobre el backbone congelado. La síntesis se realiza a 48 kHz y admite control por instrucciones en lenguaje natural para modular la emoción (por ejemplo, "(Cheerful and warm, smiling while speaking.)" o "(Angry tone, voice getting louder.)").

El entrenamiento se apoya en dos conjuntos de datos publicados por el autor: cloud0day3/alania-synthetic-speech-tr (audio sintético) y cloud0day3/alania-domain-text-tr (texto de dominio). La model card indica que todos los audios de entrenamiento fueron generados por IA y que la voz f022 se diseñó a partir de una descripción textual en inglés con VoxCPM2, sin usar grabaciones de personas reales. El checkpoint publicado corresponde a `voxcpm2-f022-s3tr/step_0000500`. La inferencia de referencia usa 16 pasos, cfg 2.0, semilla 0 o 1, un front-end de normalización de texto turco (trnorm) y un postprocesado de pausas (`pause_clean`). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz en turco a 48 kHz con una identidad vocal femenina única y consistente (f022).
- Control emocional mediante instrucciones en lenguaje natural: alegre, tranquila, enfadada, triste, empática, sorprendida y risa.
- Normalización de texto turco (trnorm): expande números y moneda (por ejemplo, "99,99 TL" se lee como "doksan dokuz lira doksan dokuz kuruş").
- Entonación correcta de oraciones interrogativas con la partícula "mı" frente a oraciones enunciativas.
- Manejo de frases largas y textos no vistos en entrenamiento con buena inteligibilidad (según las muestras publicadas).
- Postprocesado de pausas (`pause_clean`) para mejorar la naturalidad del habla.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Audiolibros y narración en turco: el modelo mantiene una voz consistente y permite alternar emociones por pasaje mediante instrucciones, lo que resulta adecuado para narrativa con diálogo y cambios de tono.
- Asistentes de voz y atención al cliente: la emoción empática y el tono tranquilo permiten generar respuestas habladas con matices adecuados en conversaciones de soporte, siempre que el sistema gestione el texto y el TTS por separado.
- Locución publicitaria y promociones: el control de emoción alegre o sorprendida y la lectura correcta de precios ("99,99 TL") encajan en anuncios y ofertas donde la pronunciación de cifras es crítica.
- Contenido educativo y e-learning: la voz calmada y la entonación correcta de preguntas ("... mı?") facilitan la generación de lecciones y ejercicios narrados en turco.
- Accesibilidad y lectura de pantalla: síntesis de alta fidelidad (48 kHz) para convertir texto en voz en aplicaciones de accesibilidad en turco.
- Doblaje y preproducción de vídeo: generación rápida de pistas de voz provisionales con distintas emociones antes de la locución final.
- Pruebas de producto y prototipado de interfaces conversacionales: al ser un LoRA ligero (36,2 M de parámetros) sobre un base de 2B, permite iterar sobre la identidad vocal sin reentrenar el modelo completo.

## Benchmarks y rendimiento

La model card menciona evaluaciones cualitativas y automáticas (selección por oyente en pruebas a ciegas con cuatro sistemas, comprobación de inteligibilidad palabra a palabra y UTMOS), pero no publica una tabla con valores numéricos de MMLU, HumanEval, GSM8K ni métricas TTS cuantificadas comparables. No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el autor indica que requiere GPU.
- El modelo base tiene 2B parámetros, por lo que se espera que quepa en GPU de consumo con suficiente memoria, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Opciones de despliegue: librería `voxcpm` (indicada en la model card); no se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La configuración de referencia usa 16 pasos de inferencia con cfg 2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ahenk (este modelo) | 2B base + 36,2 M LoRA | no disponible | tr | CC-BY-4.0 | Voz diseñada f022, 6 emociones + risa, 48 kHz |
| VoxCPM2 (base) | 2B | no disponible | no disponible | no disponible | Modelo base de OpenBMB sobre el que se aplica el LoRA |
| Ahenk Cep | no disponible | no disponible | tr | no disponible | Versión pequeña del mismo autor, ejecutable en navegador |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con otras alternativas TTS en turco.

## Limitaciones y advertencias

- La voz es completamente sintética: f022 se diseñó desde una descripción textual y no corresponde a ninguna persona real. Al compartir audio generado debe indicarse que es IA (el autor cita el artículo 50 de la Ley de IA de la UE).
- Todos los audios de entrenamiento son sintéticos, lo que puede introducir artefactos o sesgos propios del generador original.
- Solo soporta turco; no se documenta multilingüismo.
- Requiere GPU para la inferencia.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del modelo base VoxCPM2, cuya licencia no se detalla en la información disponible.
- Riesgo de alucinación acústica o pronunciación incorrecta en textos muy alejados del dominio de entrenamiento; el autor solo valida frases largas reservadas con métricas de inteligibilidad.
- No se documentan límites de longitud de texto de entrada ni de contexto.
- El checkpoint publicado es intermedio (`step_0000500`), lo que puede implicar una calidad distinta a la de un modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozgurguler/ahenk-tts-tr
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Modelo pequeño Ahenk Cep: https://huggingface.co/ozgurguler/ahenk-cep-tr
- Código y banco de pruebas: https://github.com/ozguradmin/ahenk-turkish-tts
- Demo en navegador de Ahenk Cep: https://ozguradmin.github.io/ahenk-turkish-tts/
- Dataset de voz sintética: https://huggingface.co/datasets/cloud0day3/alania-synthetic-speech-tr
- Dataset de texto de dominio: https://huggingface.co/datasets/cloud0day3/alania-domain-text-tr

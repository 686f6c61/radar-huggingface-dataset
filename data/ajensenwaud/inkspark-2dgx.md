# ajensenwaud/inkspark-2dgx

## Resumen

InkSpark-2DGX es una cuantización EXL3 del modelo Thinking Machines Inkling-2-Small, un transformer de mezcla de expertos (MoE) de 594B parámetros, publicada por el usuario ajensenwaud. El paquete reduce los pesos a aproximadamente 2,17 bits por peso (bpw) en los expertos, lo que permite servir el modelo completo con su ventana de contexto de 1M tokens y su torre de visión sobre dos nodos NVIDIA DGX Spark (GB10) mediante paralelismo de tensores, algo inviable con los pesos originales en ese hardware.

El interés de esta ficha no reside en el modelo base, sino en la ingeniería de despliegue: el autor ha convertido la versión NVFP4 del modelo original con exllamav3 1.6.6 y un overlay de arquitectura específico para Inkling 2, conservando el drafter DSpark (`mtp.safetensors`) y la torre de visión (`vision.safetensors`) en bf16 tal como se publicaron. El resultado es un pack de 170 GB en 25 shards que, según la model card, mantiene una calidad cercana a la del modelo original en Global-MMLU-Lite (89,6 % frente a 91,0 %) y alcanza 37,9 tok/s de decodificación con el drafter a 128K de contexto.

Es relevante ahora porque demuestra que es posible ejecutar un MoE de casi 600B parámetros con contexto de un millón de tokens en hardware de sobremesa de gama alta (dos GB10), sin GPUs de centro de datos. La contrapartida es que requiere parches propios (TensorFold, familia `inkling2`) que ni el TensorFold upstream ni exllamav3 estándar pueden cargar todavía, lo que limita su adopción a entornos controlados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), con torre de visión y drafter DSpark |
| Parámetros totales | 594B (modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1M tokens |
| Tipos de cuantización | EXL3 a ~2,17 bpw en expertos (gate/up a 2 bits; down a 3 bits en las primeras y últimas 12 capas, 2 bits en el resto); atención a 6 bpw; head a 8 bpw; embeddings en bf16; drafter y visión en bf16 |
| Idiomas soportados | no disponible (la evaluación Global-MMLU-Lite cubre 23 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (exllamav3), 25 shards, 170 GB; ficheros auxiliares `mtp.safetensors` y `vision.safetensors` en bf16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de 594B parámetros con una ventana de contexto de 1M tokens, desarrollado por Thinking Machines. Incluye una torre de visión (lo que habilita la tarea image-text-to-text) y un drafter de decodificación especulativa denominado DSpark, distribuido en el fichero `mtp.safetensors`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos no aparecen en la información proporcionada.

La innovación de este pack es la conversión a EXL3 realizada con exllamav3 1.6.6 y un overlay de arquitectura específico para Inkling 2, usando calibración de 250 muestras de 2048 tokens y un codebook `mul1`. La asignación de bits es heterogénea: los expertos gate y up se cuantizan a 2 bits, mientras que los down de las primeras y últimas 12 capas suben a 3 bits para preservar calidad; la atención sube a 6 bpw y la head a 8 bpw. El drafter y la torre de visión se mantienen en bf16. El pack está diseñado para ejecutarse con paralelismo de tensores TP=2 (unos 84 GiB por Spark) y requiere los parches TensorFold del proyecto InkSpark para cargarse.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta 1M tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante la torre de visión incluida.
- Razonamiento matemático: 97,4 % en GSM8K (500 ítems) según la model card.
- Conocimiento multilingüe: 89,6 % en Global-MMLU-Lite sobre 23 idiomas.
- Decodificación especulativa con el drafter DSpark del propio modelo, que eleva el throughput de 25,9 a 37,9 tok/s a 128K de contexto.
- Modo de razonamiento ("thinking on") empleado en las evaluaciones publicadas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: el modelo puede ingerir prompts de hasta 1M tokens, lo que permite procesar libros completos, expedientes o bases de código en una sola pasada; el prompt cache permite reanudar turnos de seguimiento en segundos tras la lectura inicial.
- Asistencia sobre repositorios de código: con contexto de un millón de tokens y capacidad multilingüe, puede responder preguntas sobre proyectos enteros sin trocear el código en fragmentos.
- Procesamiento de imágenes con texto asociado: gracias a la torre de visión en bf16, puede describir, clasificar o extraer información de capturas, diagramas y documentos escaneados junto a instrucciones textuales.
- Razonamiento matemático y verificación: su rendimiento en GSM8K (97,4 %) lo hace adecuado para tutoría, generación de problemas resueltos y comprobación de cálculos en pipelines educativos.
- Evaluación multilingüe y localización: con 89,6 % en Global-MMLU-Lite sobre 23 idiomas, sirve para tareas de control de calidad de traducciones y respuesta a preguntas en varios idiomas.
- Despliegue en laboratorio con hardware de sobremesa: dos DGX Spark (GB10) bastan para servir el modelo completo con TP=2, lo que permite montar un entorno de investigación privado sin GPUs de centro de datos.
- Servicio concurrente de baja escala: con ocho streams simultáneos alcanza 89-90 tok/s agregados, suficiente para un pequeño equipo interno o una demo interactiva.

## Benchmarks y rendimiento

| Tarea | Este pack (EXL3) | Model card de Thinking Machines |
|---|---|---|
| Global-MMLU-Lite (500 ítems, 23 idiomas) | 89,6 % | 91,0 % |
| GSM8K (500 ítems) | 97,4 % | no reportado |
| MMLU-Pro (500 ítems) | 84,6 % | no reportado |

Rendimiento de inferencia en dos DGX Spark (un stream salvo indicación):

| Escenario | Ventana de 1M tokens | 8 ventanas de 128K |
|---|---|---|
| Decodificación a 128K de contexto, sin drafter / con drafter | 25,9 / 37,9 tok/s | 23,3 / 36,9 tok/s (a 120K) |
| Decodificación a 1M de contexto, sin drafter / con drafter | 13,3 / 21,1 tok/s | — |
| Lectura de un prompt frío de 64K | — | 774 tok/s (84 s) |
| Ocho streams simultáneos | — | 89-90 tok/s en total |

La lectura de un prompt frío de 1M tokens tarda aproximadamente 46 minutos; los turnos posteriores reanudan desde la caché de prompt en segundos.

## Requisitos de hardware

- VRAM estimada: unos 84 GiB por nodo con TP=2 (170 GB de pesos en total, 25 shards).
- GPU recomendadas: dos NVIDIA DGX Spark (GB10) con paralelismo de tensores; no se documenta soporte para otras configuraciones.
- ¿Cabe en GPU de consumo? No en una sola; requiere dos nodos GB10. No hay datos de despliegue en RTX 4090 u otras consumer GPU.
- Opciones de despliegue: exclusivamente el motor de InkSpark con los parches TensorFold de la familia `inkling2`; ni el TensorFold upstream ni exllamav3 estándar pueden cargar el pack. El flujo es `scripts/prepare.sh`, `scripts/fetch_pack.sh` y `./start.sh`.
- Latencia y throughput: 37,9 tok/s con drafter a 128K de contexto en un stream; 21,1 tok/s a 1M; 89-90 tok/s agregados con ocho streams; 774 tok/s de prefill en un prompt frío de 64K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Calidad reportada |
|---|---|---|---|---|---|
| InkSpark-2DGX (este pack) | 594B (MoE) | 1M | Apache-2.0 | EXL3, dos DGX Spark con InkSpark/TensorFold | Global-MMLU-Lite 89,6 %; GSM8K 97,4 %; MMLU-Pro 84,6 % |
| thinkingmachines/Inkling-2-Small (base) | 594B (MoE) | 1M | Apache-2.0 | NVFP4 original | Global-MMLU-Lite 91,0 % |
| Alternativas de mismo tamaño y contexto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia de parches propios: el pack solo carga con los parches TensorFold de la familia `inkling2` del proyecto InkSpark; el TensorFold upstream y exllamav3 estándar no lo soportan, lo que ata el despliegue a un fork concreto.
- Pérdida de calidad por cuantización: la bajada a ~2,17 bpw en expertos reduce Global-MMLU-Lite de 91,0 % a 89,6 %; otras tareas no tienen referencia del modelo original para medir la degradación.
- Latencia de prefill elevada: un prompt frío de 1M tokens tarda unos 46 minutos en leerse, lo que hace impracticable el uso sin caché de prompt para cargas puntuales.
- Throughput limitado: 13,3-37,9 tok/s por stream según contexto y drafter; no es adecuado para servicio de alta concurrencia.
- Idiomas soportados no declarados explícitamente en la model card; la única evidencia es la evaluación sobre 23 idiomas de Global-MMLU-Lite.
- Sin datos sobre sesgos, alucinación, tool calling ni comportamiento agéntico en la información disponible; deben evaluarse antes de un uso en producción.
- Hardware restringido: el diseño asume dos DGX Spark (GB10); no se documentan alternativas ni estimaciones para otras GPUs.
- Licencia Apache-2.0 heredada del modelo base, sin restricciones comerciales adicionales indicadas, pero verificar la licencia del modelo original y de los componentes (torre de visión, drafter) antes de redistribuir.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/ajensenwaud/inkspark-2dgx
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Proyecto de despliegue InkSpark: https://github.com/ajensenwaud/inkspark-2dgx

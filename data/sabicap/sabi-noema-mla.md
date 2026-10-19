# sabicap/sabi-noema-mla

## Resumen

Sabi-Noema-MLA es un ajuste fino del modelo agentico Sabi-Noema (a su vez derivado de Qwen3.8-27B) en el que el autor, sabicap, ha sustituido la atencion GQA original por atencion latente multi-cabeza (MLA, multi-head latent attention) al estilo de DeepSeek-V2. El objetivo es reducir la memoria de cache de atencion por token para que las sesiones agenticas largas quepan en GPUs de consumo: se pasa de 64 KiB a 18 KiB por token en BF16 (3,6x menos) y a 9 KiB con cache FP8 (7,1x menos).

El modelo mantiene los 27.356.728.560 parametros (~27,36 B) del modelo base y un contexto maximo de 262.144 tokens, pero comprime la cache de las 16 capas de atencion completa a un latente compartido de rango 512 mas una clave rotatoria de 64 dimensiones compartida entre cabezas. La conversion se hace despues del entrenamiento por RL, ajustando las nuevas proyecciones para reproducir la salida de atencion del modelo original en documentos de hasta 64K tokens, sin repetir el RL.

Su relevancia practica esta en el despliegue: con pesos de 4 bits, una RTX 4090 de 24 GB pasa de alojar 2 sesiones concurrentes de 32K tokens con la atencion original a 7 con cache MLA BF16 (13 con FP8 simulado). Ademas, el autor reporta 90,6 % en τ³-bench frente a 79,1 % del modelo base y 1,8x menos tokens de salida por tarea en Terminal-Bench.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y 16 capas de atencion completa convertidas a MLA (latente de rango 512 + clave rotatoria de 64 dimensiones compartida entre cabezas) |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Pesos: 4, 8 y 16 bits (solo aritmetica de memoria, no evaluados en la model card). Cache MLA: BF16 (ruta servida) y FP8 (resultados simulados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code=True` en Transformers); plugin de vLLM `sabi-mla-vllm` incluido en `plugin/` |
| Elementos en cache por token (16 capas) | 9.216 con MLA frente a 32.768 con GQA original |
| Bytes de cache por token (BF16) | 18 KiB (64 KiB en el modelo base) |
| Cache de una sesion de 64K tokens | 1,125 GiB (4 GiB con atencion original) |

## Arquitectura y entrenamiento

El modelo parte de Sabi-Noema, un fine-tune agentico de Qwen3.8-27B entrenado con reinforcement learning para uso de herramientas y razonamiento multi-paso. Sabi-Noema-MLA conserva la estructura hibrida del base (capas de atencion lineal mas 16 capas de atencion completa) y modifica unicamente esas 16 capas: la cache por cabeza de K y V se reemplaza por un latente comprimido de rango 512 y una clave rotatoria de 64 dimensiones compartida entre cabezas, siguiendo el esquema de DeepSeek-V2. La componente rotatoria se mantiene separada porque las rotaciones dependientes de posicion no se pueden absorber en una proyeccion de bajo rango.

La conversion no repite el RL. Las nuevas proyecciones se ajustan a posteriori minimizando la diferencia entre la salida de atencion de cada capa y la del Sabi-Noema original sobre documentos largos de hasta 64K tokens; el proceso completo requiere unas dos horas en un nodo de 8xH100. El estado de atencion lineal consume ademas unos 72 MiB por sesion, segun las hipotesis de calculo de memoria de la model card. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el esquema exacto de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso en sesiones largas (hasta 262K tokens de contexto).
- Uso de herramientas y function calling, evaluado en BFCL v4 multi-turno y en τ³-bench (airline, retail, telecom).
- Comportamiento agentico de terminal y ejecucion de tareas de CLI, evaluado en Terminal-Bench 2.1 y ClawEval.
- Tareas de ingenieria de software agentica, evaluadas con DeepSWE en modo sin limite de longitud.
- Eficiencia de tokens en tareas largas: 1,8x menos tokens de salida por tarea en Terminal-Bench (mediana de 36,1K frente a 65,3K).
- Despliegue con cache de atencion comprimida: 18 KiB por token en BF16 y 9 KiB con cache FP8, lo que permite multiplexar muchas sesiones concurrentes por GPU.
- Carga en Transformers con `trust_remote_code=True` y servicio en vLLM mediante plugin.
- Capacidades multimodales, de audio o modo thinking explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de terminal y automatizacion de operaciones: el modelo esta evaluado en Terminal-Bench 2.1 con sesiones de decenas de miles de tokens; su menor consumo de cache permite mantener varias sesiones de shell concurrently en una sola GPU de 24 GB.
- Asistentes de soporte con herramientas en dominios regulados: los resultados de τ³-bench (90,6 %) cubren los dominios de aerolinea, retail y telecom, donde el agente debe consultar APIs y mantener estado multi-turno.
- Despliegue de agentes de codigo en CI/CD: con tool calling y 262K de contexto puede leer repos completos y ejecutar ciclos de parcheo y verificacion; el plugin de vLLM permite servirlo en un unico nodo.
- Servicio multiinquilino en hardware de consumo: con pesos de 4 bits y cache MLA BF16 caben 7 sesiones concurrentes de 32K tokens en una RTX 3090 o 4090 de 24 GB, y 13 con cache FP8, lo que abarata el coste por sesion.
- Procesado de documentos largos y analisis de contratos o informes: una sesion de 64K tokens ocupa 1,125 GiB de cache en BF16, muy por debajo de los 4 GiB del modelo con atencion GQA.
- Evaluacion comparativa de eficiencia de inferencia: util como banco de pruebas para medir el impacto de MLA y de la cuantizacion de cache en latencia, tokens por tarea y memoria pico, sin reentrenar el modelo.
- Sustitucion de modelos mayores en pipelines con restricciones de VRAM: al mantener el rendimiento del base en τ³-bench con una cache 3,6x menor, permite bajar de un nodo multi-GPU a una sola GPU manteniendo sesiones largas.

## Benchmarks y rendimiento

Resultados publicados en la model card (cache BF16). No se han publicado en la informacion disponible los valores numericos de Terminal-Bench 2.1, ClawEval, BFCL v4 multi-turno ni DeepSWE; la model card los menciona pero el extracto disponible esta truncado.

| Benchmark | Sabi-Noema-MLA | Sabi-Noema (base) | Qwen3.8-27B |
|---|---|---|---|
| τ³-bench (airline, retail, telecom) | 90,6 % | 79,1 % | no disponible |
| Terminal-Bench 2.1 (tokens de salida por tarea, mediana) | 36,1K | 65,3K | no disponible |
| Terminal-Bench 2.1 (score) | no disponible (extracto truncado) | no disponible | no disponible |
| ClawEval | no disponible | no disponible | no disponible |
| BFCL v4 multi-turno | no disponible | no disponible | no disponible |
| DeepSWE | no disponible | no disponible | no disponible |

Memoria de cache de atencion por sesion de longitud mediana (prompt mas completion, mediana por episodio; reducciones frente a Qwen3.8-27B):

| Modelo y cache | Terminal-Bench 2.1 | ClawEval | τ³-bench | BFCL v4 multi-turno |
|---|---|---|---|---|
| Qwen3.8-27B, GQA BF16 | 1.911 MiB | 846 MiB | 660 MiB | 468 MiB |
| Sabi-Noema, GQA BF16 | 1.455 MiB | 811 MiB | 670 MiB | 462 MiB |
| Sabi-Noema-MLA, BF16 | 469 MiB | 223 MiB | 192 MiB | 130 MiB |
| Sabi-Noema-MLA, FP8 (simulada) | 228 MiB (8,4x) | 113 MiB (7,5x) | 96 MiB (6,9x) | 65 MiB (7,2x) |

La mediana subestima la memoria pico en Terminal-Bench: el percentil 90 se situa entre 83K y 95K tokens y la sesion mas larga ronda los 200K, por lo que el dimensionamiento debe hacerse para la cola de la distribucion.

## Requisitos de hardware

- Pesos: aproximadamente 16,5 GB a 4 bits, 28 GB a 8 bits y 55 GB a 16 bits (BF16), segun la aritmetica de memoria de la model card.
- Capacidad de sesiones concurrentes de 32K tokens (tokens en cache / sesiones), asumiendo 92 % de VRAM utilizable, 1 GiB de overhead y 72 MiB de estado de atencion lineal por sesion, con secuencia unica limitada a 262K:

| GPU y pesos | GQA BF16 | GQA FP8 | MLA BF16 | MLA FP8 |
|---|---|---|---|---|
| RTX 3090 / 4090, 24 GB, 4 bits | 75K / 2 | 150K / 4 | 267K / 7 | 534K / 13 |
| RTX 5090, 32 GB, 4 bits | 196K / 5 | 391K / 11 | 696K / 18 | 1,39M / 33 |
| 48 GB (2x RTX 3090 o RTX 6000 Ada), 8 bits | 248K / 7 | 497K / 14 | 883K / 23 | 1,77M / 43 |
| H100 80 GB, BF16 | 288K / 8 | 577K / 16 | 1,03M / 27 | 2,05M / 50 |
| RTX PRO 6000, 96 GB, 8 bits | 972K / 28 | 1,94M / 55 | 3,46M / 93 | 6,91M / 168 |

- Si cabe en GPU de consumo: si. En 24 GB con pesos de 4 bits y cache MLA BF16 caben 7 sesiones de 32K tokens; con cache FP8 simulada, 13.
- Despliegue: plugin de vLLM `sabi-mla-vllm` incluido en el repositorio (single-GPU); tambien carga en Transformers con `trust_remote_code=True`.
- Latencia y throughput: no disponibles. Solo se reporta la eficiencia de tokens (1,8x menos tokens de salida por tarea en Terminal-Bench), no medidas de latencia ni de tokens por segundo.
- Advertencia de calculo: las filas de pesos a 4 y 8 bits son aritmetica de memoria; esos formatos de pesos no se han evaluado en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache BF16 por token | τ³-bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sabi-Noema-MLA | ~27,36 B | 262K | 18 KiB | 90,6 % | Apache 2.0 | HuggingFace, vLLM (plugin) y Transformers |
| Sabi-Noema | no disponible (derivado de Qwen3.8-27B) | no disponible | 64 KiB | 79,1 % | no disponible | HuggingFace |
| Qwen3.8-27B | no disponible (modelo de ~27B segun la nomenclatura) | no disponible | 64 KiB | no disponible | no disponible | no disponible en la informacion |

La model card menciona ademas a Muse Glimmer como modelo de comparacion en el mismo harness, pero no se proporcionan sus datos de parametros, contexto, licencia ni resultados en el extracto disponible.

## Limitaciones y advertencias

- La conversion a MLA se hace despues del RL y no repite el entrenamiento: las nuevas proyecciones se ajustan para imitar la salida de atencion del modelo base en documentos de hasta 64K tokens, por lo que puede haber degradacion fuera de esa distribucion y en tareas no evaluadas.
- Los resultados con cache FP8 provienen de una simulacion (valores redondeados a FP8 y leidos de vuelta); la ruta de servicio publicada almacena cache BF16 y el servicio real con FP8 esta pendiente.
- El plugin de vLLM es single-GPU; los despliegues con tensor parallelism (TP2) no estan cubiertos por el plugin segun la model card.
- Las cifras de pesos a 4 y 8 bits son aritmetica de memoria, no evaluaciones: el rendimiento real con esos formatos no esta medido.
- El dimensionamiento por mediana subestima el pico: en Terminal-Bench el percentil 90 esta entre 83K y 95K tokens y la sesion mas larga llega a ~200K.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- La model card esta truncada en la seccion de benchmarks: no se pueden verificar los resultados de Terminal-Bench 2.1, ClawEval, BFCL v4 multi-turno ni DeepSWE.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y del modelo Sabi-Noema, no detalladas en la informacion proporcionada.
- Requiere `trust_remote_code=True` por el codigo personalizado (`custom_code`), lo que implica ejecutar codigo del repositorio en el entorno de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sabicap/sabi-noema-mla
- Modelo base Sabi-Noema: https://huggingface.co/sabicap/sabi-noema
- Directorio del plugin de vLLM: https://huggingface.co/sabicap/sabi-noema-mla/tree/main/plugin
- Paper de DeepSeek-V2 (referencia de MLA): https://arxiv.org/abs/2405.04434
- Metodologia de Terminal-Bench 2.1 de Artificial Analysis: https://artificialanalysis.ai/methodology/intelligence-benchmarking#terminal-bench-v2-1
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo (los resultados eran de WhatsApp).

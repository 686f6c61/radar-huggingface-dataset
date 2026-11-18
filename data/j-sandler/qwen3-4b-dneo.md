# J-sandler/Qwen3-4B-DNeo

## Resumen

DNeo Fast Parallel Drafter para Qwen3-4B es un modelo borrador (*draft model*) disenado especificamente para acelerar la decodificacion especulativa del modelo Qwen/Qwen3-4B en modo *thinking*. Lo desarrolla el autor independiente J-sandler y se publica bajo licencia Apache-2.0. No es un modelo de lenguaje autonomo: su unica funcion es proponer bloques de tokens que el modelo objetivo Qwen3-4B verifica mediante muestreo especulativo con rechazo.

La innovacion principal es que DNeo genera 15 tokens candidatos a partir de una sola pasada del *backbone* y, en lugar de descartar las predicciones rechazadas, reutiliza sus caracteristicas del modelo objetivo como retroalimentacion (*rejection memory*) para el siguiente borrador. Esto se combina con un *backbone* paralelo de cinco capas transformer con atencion enmascarada entre posiciones del bloque, enrutamiento de caracteristicas MoFA sobre siete capas seleccionadas del modelo objetivo y convoluciones de dos tomas estilo DFlash-2.

El checkpoint tiene 638.563.688 parametros en formato safetensors (2,6 GB de repositorio) y su relevancia actual radica en que permite obtener aceleraciones de entre 2,96x y 3,37x en decodificacion frente a la generacion autorregresiva estandar, con un rendimiento de 701 tokens/s en SGLang y 390 tokens/s en Transformers sobre una H100, manteniendo la distribucion de salida del modelo objetivo gracias al rechazo especulativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador paralelo de 5 capas con enrutamiento MoFA, rejection memory, convoluciones de dos tomas y cabeza causal fusionada DNeo |
| Parametros totales | 638.563.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los benchmarks usan contexto limitado a 1024 tokens) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos del borrador); MIT (codigo de inferencia) |
| Formato de pesos | safetensors (custom_code, requiere runtime DNeo) |

## Arquitectura y entrenamiento

DNeo es un modelo borrador para decodificacion especulativa, no un modelo generativo independiente. Su *backbone* consta de cinco capas transformer que producen un bloque de borrador en paralelo, donde las posiciones enmascaradas no atienden entre si. Sobre este *backbone* se aplica un enrutamiento de caracteristicas MoFA: una mezcla aprendida de caracteristicas normalizadas de siete capas seleccionadas del modelo objetivo Qwen3-4B, compartida entre las cinco capas del borrador, las cabezas KV, el prefijo y la memoria de rechazo. Las caracteristicas de los tokens rechazados se convierten en memoria de atencion para el siguiente borrador sin pasar por los MLP del modelo borrador. Ademas, incorpora convoluciones de dos tomas estilo DFlash-2 para transferir informacion entre posiciones vecinas del borrador y una cabeza causal fusionada DNeo que condiciona cada prediccion en el token anterior sin una pasada adicional del *backbone*.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El modelo se distribuye como un *finetune* del modelo base Qwen/Qwen3-4B y requiere el runtime de enrutador compartido DNeo 0.1.0rc6 o superior; los cargadores antiguos de cinco enrutadores no pueden cargar estos pesos de enrutador unico.

## Capacidades

- Generacion de borradores especulativos de hasta 15 tokens por pasada del *backbone* para el modelo Qwen3-4B en modo *thinking*.
- Aceleracion de decodificacion mediante verificacion con muestreo especulativo con rechazo en el modelo objetivo.
- Reutilizacion de caracteristicas de tokens rechazados como memoria de atencion para borradores posteriores.
- Integracion con dos backends de inferencia: Transformers y SGLang nativo.
- No soporta generacion de texto autonoma, tool calling, agentes ni capacidades multilingues por si mismo; hereda el comportamiento del modelo objetivo Qwen3-4B al que acompana.
- No dispone de modo vision, audio ni capacidades multimodales.

## Casos de uso

- Aceleracion de inferencia en produccion para Qwen3-4B: el borrador se empareja con el modelo objetivo para reducir la latencia de decodificacion entre 2,96x y 3,37x, adecuado para servicios de chat o generacion de texto con requisitos de throughput.
- Despliegue en SGLang para servidores de alta concurrencia: con 701 tokens/s en una H100 80GB en BF16 y batch 1, resulta apropiado para endpoints que necesitan maximizar tokens por segundo por GPU.
- Integracion en pipelines con Transformers: con 390 tokens/s y una aceleracion de 3,37x frente a la generacion autorregresiva, encaja en entornos de investigacion o prototipado que ya usan la libreria Transformers.
- Generacion de codigo asistida: al estar entrenado y evaluado sobre HumanEval y MBPP, el borrador acelera la generacion de codigo en asistentes de programacion que usen Qwen3-4B como modelo base.
- Razonamiento matematico en produccion: evaluado sobre GSM8K y MATH-500, es adecuado para aplicaciones de resolucion de problemas matematicos que requieran baja latencia de decodificacion.
- Evaluacion de modelos y benchmarking: sirve como componente para medir el impacto de la decodificacion especulativa en tareas de razonamiento (GPQA) y dialogo (MT-Bench) con el modelo Qwen3-4B.

## Benchmarks y rendimiento

| Backend | Tokens por forward | Tokens/s en decodificacion | Aceleracion vs. autorregresivo |
|---|---:|---:|---:|
| SGLang | 4,51 | 701 | 2,96x |
| Transformers | 4,54 | 390 | 3,37x |

Mediciones con batch 1 en una H100 80GB, BF16, tamano de bloque 16, temperatura 1 para objetivo y borrador, medias de ocho semillas sobre 256 prompts emparejados de GSM8K, MATH-500, HumanEval, MBPP, GPQA y MT-Bench. Los prompts se limitan a 256 tokens, las salidas se fijan en 512 tokens ignorando EOS y el contexto se limita a 1024 tokens. Los tiempos de decodificacion excluyen prefill, arranque, tokenizacion y transporte HTTP.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,3 GB en BF16 (638,6 M de parametros), a los que se suma la memoria del modelo objetivo Qwen3-4B (unos 8 GB en BF16).
- GPU de referencia en los benchmarks: una H100 80GB.
- No se han publicado mediciones en GPU de consumo; por el tamano del borrador y del objetivo, es plausible en GPUs consumer con suficiente VRAM para ambos modelos, aunque no hay datos confirmados.
- Opciones de despliegue: SGLang nativo y Transformers, ambos mediante el runtime DNeo 0.1.0rc6 o superior incluido en el paquete de inferencia independiente.
- Latencia y throughput medidos: 701 tokens/s en SGLang y 390 tokens/s en Transformers con batch 1 en H100; no se dispone de datos de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DNeo Fast Parallel Drafter (Qwen3-4B) | 638,6 M | no disponible | Borrador especulativo para Qwen3-4B | Apache-2.0 (pesos), MIT (codigo) | Hugging Face |
| Qwen/Qwen3-4B | no disponible en la informacion | no disponible | Modelo generativo objetivo | no disponible en la informacion | Hugging Face |
| Otros borradores especulativos | no disponible | no disponible | Borradores para decodificacion especulativa | no disponible | no disponible |

No se dispone de informacion sobre otros modelos borradores comparables ni de sus especificaciones en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: no puede generar texto por si mismo y debe emparejarse obligatoriamente con Qwen/Qwen3-4B.
- Requiere el runtime DNeo 0.1.0rc6 o superior; los cargadores antiguos de cinco enrutadores no pueden cargar estos pesos.
- Los benchmarks se limitan a contexto de 1024 tokens y salidas de 512 tokens, por lo que el comportamiento en contextos mas largos no esta documentado.
- El rendimiento depende de la carga de trabajo; las aceleraciones medidas (2,96x y 3,37x) corresponden a un conjunto especifico de prompts y a una H100.
- No se han publicado datos sobre sesgos, riesgo de alucinacion ni composicion del dataset de entrenamiento.
- No se dispone de informacion sobre idiomas soportados ni sobre cuantizaciones disponibles.
- La licencia Apache-2.0 de los pesos permite uso comercial, pero el codigo de inferencia se distribuye bajo MIT con atribuciones adicionales recogidas en NOTICE.
- El modelo solo acelera el modo *thinking* de Qwen3-4B segun la model card; no se documenta su comportamiento en modo no *thinking*.

## Enlaces

- Hugging Face: https://huggingface.co/J-sandler/Qwen3-4B-DNeo
- Repositorio GitHub: https://github.com/J-sandler/DNeo
- Guia de inicio rapido: https://github.com/J-sandler/DNeo/blob/main/QUICKSTART.md#install
- Benchmarks: https://github.com/J-sandler/DNeo/blob/main/BENCHMARKS.md
- Guia SGLang: https://github.com/J-sandler/DNeo/blob/main/QUICKSTART.md#run-with-sglang
- Guia Transformers: https://github.com/J-sandler/DNeo/blob/main/QUICKSTART.md#run-with-transformers
- Codigo de inferencia independiente: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/resolve/main/dneo-inference-source.tar.gz
- Actualizacion de inferencia: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/blob/main/INFERENCE_UPDATE.md
- Licencia de pesos: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/blob/main/LICENSE
- Licencia del codigo: https://github.com/J-sandler/DNeo/blob/main/LICENSE
- Licencia MIT: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/blob/main/LICENSE-MIT
- Aviso de atribucion: https://huggingface.co/J-sandler/Qwen3-4B-DNeo/blob/main/NOTICE
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B

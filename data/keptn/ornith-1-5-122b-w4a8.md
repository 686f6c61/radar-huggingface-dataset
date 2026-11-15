# keptn/ornith-1.5-122b-w4a8

## Resumen

Ornith 1.5 122B es un modelo de lenguaje multimodal (texto e imagen) de tipo Mixture-of-Experts desarrollado por el equipo Ornith (ornith-ai). Esta ficha concreta, `keptn/ornith-1.5-122b-w4a8`, no es el modelo original sino una cuantización de terceros publicada por el usuario keptn: empaqueta los 122 mil millones de parámetros del modelo base en un único fichero de 64,61 GiB con expertos en 4 bits, pensado para el motor de inferencia radiance sobre GPUs AMD RDNA4.

La relevancia de esta variante es de infraestructura: permite ejecutar un modelo de 122B con visión, razonamiento y decodificación especulativa en cuatro tarjetas de 32 GB (probado en Radeon AI PRO R9700), sin necesidad de memoria host, manteniendo una ventana de contexto de 262.144 tokens. La cuantización usa GPTQ sobre los expertos y FP8 en el resto de capas lineales, con una pérdida de calidad medida frente al original en bf16.

Conviene subrayar que se trata de un artefacto de despliegue altamente específico: depende de una versión concreta del motor radiance (1.11.0 o superior, con incompatibilidad declarada con radiance 2.0) y de hardware AMD RDNA4. No es un modelo para usar con transformers, llama.cpp o vLLM de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), con cabeza MTP para decodificación especulativa; multimodal texto-imagen |
| Parametros totales | 122B (según nombre del modelo y modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Expertos: 4 bits (codebook, escala FP8 por cada 64 pesos, rotación Hadamard sobre 128, GPTQ). Otras lineales: FP8 con bloque 128×128 y escala bf16. Activaciones: FP8. lm_head: int8 con escala bf16 por 128 columnas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 64,61 GiB |

## Arquitectura y entrenamiento

El modelo base Ornith 1.5 122B es un transformer MoE con capacidades de visión (pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction) propia que se usa para decodificación especulativa con 3 tokens draft. El modelo original fue entrenado por el equipo Ornith; esta ficha no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, por lo que esos datos no están disponibles.

Lo que sí documenta esta ficha es el proceso de cuantización, que constituye su innovación técnica principal. Se partió de la release FP8 oficial (`ornith-ai/Ornith-1.5-122B-FP8`, revisión `31b76f63`), se convirtió al FP8 por bloques de radiance y se registraron las estadísticas de entrada (hessianos) de cada capa de expertos con 401.107 tokens de calibración (chat, documentos, código y tool calls con la plantilla de chat de Ornith). Sobre esas estadísticas se aplicó GPTQ a los expertos, seguido de tres rondas de descenso por coordenadas. El resto de pesos quedó en FP8 con bloques 128×128 y el lm_head en int8. Los expertos de la capa MTP no tenían estadísticas registradas y se redondearon al vecino más cercano.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" activado por defecto y desactivable por petición mediante `chat_template_kwargs`.
- Comprensión de imágenes (entrada image-text-to-text); la model card reporta evaluación sobre DocVQA y AI2D.
- Codificación, con ajustes de muestreo recomendados específicos (`--temp 0.6 --presence-penalty 0`).
- Tool calling / function calling: el corpus de calibración incluye tool calls y el modelo base está descrito como orientado a agentes.
- Decodificación especulativa nativa mediante la cabeza MTP del propio modelo (3 tokens draft).
- Ventana de contexto muy larga: 262.144 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos con imagen: informes, contratos o expedientes escaneados que combinan texto e imágenes, aprovechando los 262.144 tokens de contexto para ingerir el documento completo en una sola pasada sin troceado.
- Extracción estructurada y tool calling en pipelines de datos: el modelo puede emitir llamadas a funciones para consultar APIs o bases de datos, integrándose como motor de un agente de automatización documental.
- Asistencia a la codificación en producción: con el ajuste de muestreo recomendado para código, puede integrarse en flujos de revisión o generación de parches, siempre que el backend sea radiance sobre AMD.
- Razonamiento multi-paso con thinking mode: tareas de análisis que requieren cadenas de razonamiento largas (la propia model card advierte que las tareas difíciles pueden superar los 32k tokens de salida).
- Despliegue on-premise en clústeres AMD: organizaciones con infraestructura RDNA4 que necesitan un modelo grande sin depender de GPUs NVIDIA ni de memoria host, gracias al empaquetado en cuatro tarjetas de 32 GB.
- Servicio de inferencia con múltiples secuencias concurrentes: la model card documenta 424 tokens/s agregados con 4 streams y pools de KV de hasta 2.097.280 tokens con 8 secuencias en cuatro tarjetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí aporta métricas de fidelidad de la cuantización y de velocidad en hardware concreto.

Calidad frente al original en bf16 (80 preguntas de MT-Bench, ambos turnos, thinking off, 42.305 tokens de respuesta):

| Metrica | Este fichero | FP8 (keptn) | FP8 dflash2 | w4a8 dflash2 |
|---|---|---|---|---|
| KL media | 0,0174 | 0,0118 | 0,0118 | 0,0174 |
| KL percentil 99 | 0,222 | 0,139 | 0,139 | 0,222 |
| Token top idéntico | 96,4% | 97,2% | 97,2% | 96,4% |
| Ratio de perplejidad | ×1,002 | ×1,003 | ×1,003 | ×1,002 |

Visión (DocVQA y AI2D, selección fija de 20 casos, greedy, thinking off, 4 tarjetas): 16/20 respuestas idénticas, KL media 0,0328, 91/95 tokens top coincidentes.

Velocidad (Radeon AI PRO R9700 a 215 W, radiance 1.9.0 más PR #144, KV en fp8, 3 tokens draft, thinking off, BetterBench 0.6.1, temperatura 0,7, mediana):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | no cabe | no cabe | 216,6 tok/s |
| Prefill a 24k tokens | no cabe | no cabe | 7.451 tok/s |
| 4 streams, total | no cabe | no cabe | 424 tok/s |

## Requisitos de hardware

- VRAM: el fichero ocupa 64,61 GiB; se necesita un total de 128 GB de VRAM en cuatro tarjetas de 32 GB (probado en Radeon AI PRO R9700). No cabe en una ni dos tarjetas.
- GPU: exclusivamente AMD RDNA4 según la model card (el motor radiance solo soporta esa arquitectura). No hay soporte documentado para NVIDIA A100, H100 ni RTX 4090.
- Consumer GPU: no disponible; el requisito es de cuatro GPUs profesionales de 32 GB, no una tarjeta de consumo.
- Despliegue: motor radiance 1.11.0 o superior (la guía rápida exige 1.17.0; radiance 2.0 no es compatible actualmente), mediante la imagen Docker `stilldeadcode/radiance:1.11.0`, con `--tp 4 --p2p on --kv-cache-dtype fp8`.
- Memoria de contexto: el pool de KV con 262.144 tokens por secuencia permite 524.352 tokens totales con 2 secuencias, 1.048.720 con 4 y 2.097.280 con 8, siempre en cuatro tarjetas.
- Latencia y throughput: 216,6 tok/s en decode de un stream y 7.451 tok/s de prefill a 24k tokens en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| keptn/ornith-1.5-122b-w4a8 | 122B | 262.144 | `.rad` (4 bits expertos + FP8) | MIT | 4× AMD RDNA4 32 GB |
| keptn/ornith-1.5-122b-fp8 | 122B | 262.144 | `.rad` (FP8) | MIT | AMD RDNA4 |
| keptn/ornith-1.5-122b-fp8-dflash2 | 122B | 262.144 | `.rad` (FP8) | MIT | AMD RDNA4 |
| keptn/ornith-1.5-122b-w4a8-dflash2 | 122B | 262.144 | `.rad` (4 bits + FP8) | MIT | 4× AMD RDNA4 32 GB |

Las alternativas comparables en la información disponible son las otras cuantizaciones del mismo modelo publicadas por keptn. La variante FP8 ofrece menor error de cuantización (KL media 0,0118 frente a 0,0174) pero mayor huella de memoria; las variantes `dflash2` presentan métricas de calidad idénticas a sus equivalentes sin ese sufijo. No se dispone de datos de modelos de otros autores para comparar.

## Limitaciones y advertencias

- Dependencia dura de hardware: radiance solo funciona en GPUs AMD RDNA4; el modelo no es utilizable en NVIDIA ni en CPU.
- Dependencia de versión del motor: requiere radiance 1.11.0 o superior (la guía rápida pide 1.17.0) y es incompatible con radiance 2.0; versiones 1.10.0 o anteriores no leen expertos de 4 bits para esta arquitectura.
- Requiere cuatro tarjetas: con una o dos, radiance no dispone de kernel de atención para este modelo (16 cabezas de consulta por cabeza KV).
- Pérdida de calidad medible frente al original bf16: KL media 0,0174 y percentil 99 de 0,222, con un 3,6% de tokens top distintos.
- Los expertos de la capa MTP se redondearon al vecino más cercano por falta de estadísticas, lo que puede afectar a la calidad de la decodificación especulativa.
- Con thinking activado, las tareas difíciles pueden requerir más de 32k tokens de salida, con el coste de latencia asociado.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Licencia MIT, que permite uso comercial, pero hereda las condiciones del modelo base Ornith 1.5 122B; conviene verificar la licencia del modelo original antes de producción.
- Formato propietario `.rad`: no es portable a otras herramientas de inferencia y no se puede convertir fácilmente a GGUF o safetensors con los datos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/ornith-1.5-122b-w4a8
- Modelo base (FP8): https://huggingface.co/ornith-ai/Ornith-1.5-122B-FP8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Cuantización FP8 de keptn: https://huggingface.co/keptn/ornith-1.5-122b-fp8
- Cuantización FP8 dflash2: https://huggingface.co/keptn/ornith-1.5-122b-fp8-dflash2
- Cuantización w4a8 dflash2: https://huggingface.co/keptn/ornith-1.5-122b-w4a8-dflash2
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework
- Repositorio del equipo Ornith: https://github.com/ornith-ai/Ornith-1

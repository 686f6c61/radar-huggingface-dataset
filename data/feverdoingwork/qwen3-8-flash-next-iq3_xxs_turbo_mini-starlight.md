# feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-Starlight

## Resumen

Qwen3.8-Flash-Next iq3_xxs_turbo_mini-Starlight es una cuantización de un modelo de lenguaje de tipo mezcla de expertos (MoE) publicada por el usuario feverdoingwork. No es un checkpoint original, sino una conversión del modelo Qwen/Qwen3.8-Flash-Next (48 capas, 512 expertos por capa, 10 activos por token) a un formato propietario denominado Starlight, un contenedor GGUF con extensiones específicas del motor de inferencia Starlight. El archivo único ocupa 50,03 GiB y está diseñado para ejecutarse en tarjetas de 16 GB mediante una arquitectura que mantiene la tabla de tokens por capa en RAM del sistema o en disco.

La relevancia de esta ficha radica en que muestra el estado del arte en cuantización agresiva para modelos MoE de gran tamaño. Los expertos enrutados se codifican con bloques trellis TQ2_T de 2,125 bits por peso, y la tabla de tokens por capa se recodifica con TQ2_T y TQP6. El resultado es un archivo que, según las mediciones del autor, alcanza una divergencia KL media de 0,318 frente a la referencia BF16 y una coincidencia top-1 del 83,78 %, con un tamaño un 35 % inferior al de la variante iq3_s_turbo.

El modelo está pensado exclusivamente para el motor Starlight. No es compatible con Transformers, llama.cpp, Ollama ni LM Studio, y el autor lo indica explícitamente. La licencia es Qwen Community License 1.0, lo que condiciona su uso comercial. El repositorio acumula 2.281 descargas y fue creado el 8 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal y MTP (multi-token prediction) |
| Parámetros totales | 179.023.045.248 |
| Parámetros activos | 10 expertos de 512 por capa (no se especifica el total activo) |
| Longitud de contexto | 245.760 tokens en RX 9070 XT; 131.072 tokens en RTX 5070 Ti (medido con caché q4 y MTP) |
| Tipos de cuantización | iq3_xxs_turbo_mini (expertos TQ2_T a 2,12 bits/peso; tabla de tokens TQP6/TQ2_T a 2,63 bits/peso; resto a 6,58 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`), archivo único de 50,03 GiB |
| Capas | 48 |
| Expertos por capa | 512 |
| Vocabulario | 141.312 tokens (podado desde 248.320) |
| Tamaño del repo | 53,7 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas y 512 expertos por capa, de los cuales se activan 10 por token. Incorpora atención lineal además de atención estándar, y una cabeza de borrador MTP (multi-token prediction) integrada en el archivo para decodificación especulativa. La cuantización iq3_xxs_turbo_mini aplica codificación trellis a los expertos enrutados (bloques TQ2_T de 2,125 bits por peso) y recodifica la tabla de tokens por capa con TQ2_T y TQP6, reduciendo su tamaño de 20,30 GiB a 15,65 GiB. El vocabulario se poda de 248.320 a 141.312 tokens, eliminando 107.172 entradas sin alterar el texto de los tokens conservados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card del autor se centra exclusivamente en el proceso de cuantización y en las mediciones de calidad y rendimiento del archivo resultante, no en el entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional y de formato largo, con soporte para prompts de hasta 245.760 tokens en hardware AMD de 16 GB.
- Razonamiento multi-turno: el autor documenta un turno de seguimiento respondido en 0,8 s tras leer un prompt de 236.286 tokens.
- Decodificación especulativa mediante la cabeza MTP integrada (3 tokens de borrador), que acelera la generación.
- Procesamiento de contextos extensos con caché de atención cuantizada a q4, lo que permite mantener la ventana completa en la GPU.
- Capacidad multilingüe: no disponible (no se especifican idiomas).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Análisis de documentos extensos en local: el modelo puede leer prompts de más de 236.000 tokens en una RX 9070 XT y responder correctamente a preguntas sobre códigos plantados en el texto, lo que lo hace adecuado para revisión de contratos, informes técnicos o expedientes completos sin fragmentación.
- Asistentes conversacionales de contexto largo: con una ventana de 245.760 tokens y un turno de seguimiento de 0,8 s, puede mantener conversaciones multi-turno sobre un corpus extenso sin perder el hilo, siempre que se ejecute en el motor Starlight.
- Inferencia en hardware de consumo: al caber en una tarjeta de 16 GB (RX 9070 XT o RTX 5070 Ti), permite desplegar un MoE de 179.000 millones de parámetros en estaciones de trabajo con GPU consumer, algo inviable con el checkpoint BF16.
- Procesamiento por lotes de textos largos: la combinación de MTP y caché q4 permite decodificar a 56,4 tokens/s en RX 9070 XT, útil para tareas de resumen o extracción de información sobre lotes de documentos.
- Investigación en cuantización: el archivo sirve como referencia para estudiar el impacto de la codificación trellis y la poda de vocabulario en la fidelidad respecto a BF16, con métricas KLD y top-1 publicadas.
- Despliegue en entornos con RAM limitada: la tabla de tokens por capa puede residir en disco o en RAM del sistema, lo que permite ajustar el uso de memoria según el hardware disponible.
- Evaluación comparativa de motores de inferencia: al ser un formato exclusivo de Starlight, permite medir el rendimiento del motor frente a otras implementaciones sobre el mismo modelo base.

## Benchmarks y rendimiento

| Archivo | KLD a BF16 | Top-1 igual a BF16 | Perplejidad (BF16: 3,126) | Tamaño total (GiB) |
|---|---:|---:|---:|---:|
| ISTA-DASLab GSQ-RCO IQ3_S (referencia) | 0,193 | 86,71 % | 3,463 | 77,88 |
| `iq3_s_turbo` | 0,257 | 84,08 % | 3,593 | 64,78 |
| ISTA-DASLab GSQ-RCO IQ3_XXS (referencia) | 0,276 | 84,05 % | 3,657 | 70,63 |
| `iq3_xxs_turbo` | 0,310 | 83,56 % | 3,566 | 54,68 |
| `iq3_xxs_turbo_mini` | 0,318 | 83,78 % | 3,508 | 50,03 |

Mediciones realizadas por el proyecto Starlight sobre 12 casos de texto y 16.561 posiciones puntuadas, con el motor Starlight en una RTX 5070 Ti el 2 de noviembre de 2026. El autor señala que la referencia IQ3_S es claramente la más cercana a BF16 (KLD 0,065 por debajo de `iq3_s_turbo`, top-1 2,6 puntos superior) a cambio de 13 GiB más. `iq3_s_turbo` y la referencia IQ3_XXS están empatados dentro del ruido, y `iq3_xxs_turbo` presenta un KLD 0,034 superior al de `iq3_s_turbo`.

En rendimiento de decodificación, en una RX 9070 XT (2 de noviembre de 2026, build temprana del motor), `iq3_xxs_turbo` alcanzó 56,4 tokens/s frente a 59,6 de `iq3_s_turbo`, con una lectura de prompts aproximadamente un 10 % más lenta, a cambio de 10 GiB menos de RAM para los expertos.

## Requisitos de hardware

- VRAM estimada: el archivo completo ocupa 50,03 GiB, pero la parte que debe residir en GPU (excluyendo la tabla de tokens por capa) es de 34,38 GiB. Con caché de atención q4 y 46 GiB de RAM bloqueada, cabe en tarjetas de 16 GB.
- GPU recomendadas: AMD RX 9070 XT (16 GB) y NVIDIA RTX 5070 Ti (16 GB) son las medidas por el autor. No se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en RX 9070 XT y RTX 5070 Ti con 16 GB de VRAM, siempre que la tabla de tokens resida en RAM del sistema o en disco.
- Opciones de despliegue: exclusivamente el motor Starlight. No es compatible con vLLM, llama.cpp, Ollama, TGI ni LM Studio.
- Latencia y throughput: 56,4 tokens/s de decodificación en RX 9070 XT; lectura de un prompt de 236.286 tokens en 67 s en RX 9070 XT y de 124.678 tokens en 31 s en RTX 5070 Ti; turno de seguimiento en 0,8 s en ambas tarjetas.
- Contexto máximo medido: 245.760 tokens en RX 9070 XT y 131.072 tokens en RTX 5070 Ti.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KLD a BF16 | Top-1 | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| `iq3_xxs_turbo_mini` (este) | 179,0 B (MoE) | 245.760 (RX 9070 XT) | 0,318 | 83,78 % | Qwen Community 1.0 | Starlight GGUF |
| `iq3_xxs_turbo` | 179,0 B (MoE) | no disponible | 0,310 | 83,56 % | Qwen Community 1.0 | Starlight GGUF |
| `iq3_s_turbo` | 179,0 B (MoE) | no disponible | 0,257 | 84,08 % | Qwen Community 1.0 | Starlight GGUF |
| ISTA-DASLab GSQ-RCO IQ3_S | 179,0 B (MoE) | no disponible | 0,193 | 86,71 % | no disponible | GGUF |

Las tres variantes Starlight comparten el mismo modelo base y licencia; las diferencias están en el tamaño del archivo (50,03, 54,68 y 64,78 GiB) y en la fidelidad a BF16. La referencia IQ3_S de ISTA-DASLab es la más fiel pero también la más grande (77,88 GiB) y no está optimizada para el motor Starlight.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo solo funciona con el motor Starlight. No es compatible con llama.cpp, Ollama, LM Studio, Transformers ni otras herramientas estándar.
- Licencia Qwen Community License 1.0: impone condiciones para uso comercial que deben revisarse antes de desplegar el modelo en producción.
- Fidelidad reducida: la KLD de 0,318 frente a BF16 y el top-1 del 83,78 % implican que aproximadamente 1 de cada 6 tokens más probables difiere del modelo de referencia, lo que puede afectar a tareas de alta precisión.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la model card; aplicable el riesgo general de los modelos de lenguaje, agravado por la cuantización agresiva.
- Idiomas soportados: no disponible; no se especifica cobertura multilingüe.
- Poda de vocabulario: se eliminan 107.172 tokens del vocabulario original, lo que puede afectar a la tokenización de textos en idiomas o dominios poco representados.
- Dependencia de RAM del sistema: la tabla de tokens por capa (15,65 GiB) debe residir en RAM o disco, lo que exige al menos 46 GiB de RAM bloqueada según la configuración medida.
- Contexto variable según hardware: la ventana máxima cae de 245.760 a 131.072 tokens al pasar de RX 9070 XT a RTX 5070 Ti, por lo que el contexto efectivo depende de la GPU.
- Build temprana del motor: las mediciones de rendimiento se realizaron con una versión temprana de Starlight, por lo que el throughput puede variar con versiones posteriores.
- Sin datos de tool calling ni agentes: no se documenta soporte para function calling ni razonamiento multi-paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base cuantizado de referencia: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Logits de referencia BF16: https://huggingface.co/datasets/jyohukuchan/qwen38-flash-next-bf16-logits
- Licencia: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-Starlight/blob/main/LICENSE

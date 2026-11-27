# feverdoingwork/Qwen3.8-Flash-Next-iq3_s_turbo-abliterated-Starlight

## Resumen

Qwen3.8-Flash-Next-iq3_s_turbo-abliterated-Starlight es una cuantización GGUF modificada del modelo Qwen3.8-Flash-Next, publicada por el usuario feverdoingwork. Se trata de una versión "abliterated", es decir, con la dirección de rechazo eliminada de los pesos, empaquetada en un único fichero de 64,78 GiB destinado exclusivamente al motor de inferencia Starlight. El modelo base es un transformer de mezcla de expertos (MoE) con 48 capas y 512 expertos por capa, de los cuales se activan 10 por token.

La relevancia de esta ficha radica en que demuestra una técnica de cuantización agresiva (2,84 bits por peso en los expertos enrutados) que permite ejecutar un modelo de 179.023.045.248 parámetros totales en una única GPU de 16 GB, manteniendo los expertos que no caben en la tarjeta en RAM del sistema y leyéndolos bajo demanda. Además, incorpora una cabeza de predicción multi-token (MTP) para decodificación especulativa y un vocabulario podado de 248.320 a 141.312 tokens.

El modelo está pensado para generación de texto conversacional y no es compatible con Transformers, llama.cpp, Ollama ni LM Studio. La licencia es Qwen Community License 1.0, lo que impone restricciones para uso comercial. No se dispone de información sobre los idiomas soportados ni sobre benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas de atención lineal y atención completa; 48 capas, 512 expertos por capa, 10 activos por token |
| Parametros totales | 179.023.045.248 |
| Parametros activos | no disponible (el número de expertos activos por token es 10, pero no se especifica el total de parámetros activos) |
| Longitud de contexto | 245.760 tokens en una GPU de 16 GB; 262.144 tokens en dos RTX 5060 Ti o con caché de atención desbordada a RAM |
| Tipos de cuantizacion | GGUF con receta iq3_s_turbo (GSQ-RCO calibrada, repackada y reducida por Starlight); expertos enrutados a 2,84 bits/peso, tabla de tokens por capa a 3,41 bits/peso, atención y resto a 6,58 bits/peso, embeddings y cabeza de salida a 5,41 bits/peso, cabeza MTP a 3,97 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`), fichero único de 69.554.574.592 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas y 512 expertos por capa, de los cuales 10 se activan por token. La arquitectura combina capas de atención completa con capas de atención lineal, e incluye una cabeza de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa. El fichero contiene el modelo de texto, la cabeza MTP y el vocabulario podado; no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La modificación "abliterated" elimina la dirección de rechazo editando 144 matrices que escriben en el flujo residual. De estas, 95 conservan los números calibrados de GSQ-RCO (proyecciones down de expertos y expertos compartidos en 2 y 4 bits, con cambios de código mínimos por columna para cancelar la dirección de rechazo), y 49 son matrices de 4 a 8 bits (salida de atención y salida de espacio de estados) recuantizadas desde los pesos de precisión completa tras la edición. La cuantización parte de la receta GSQ-RCO de ISTA-DASLab, repackada y reducida por Starlight. El vocabulario se poda de 248.320 a 141.312 tokens (141.148 reales y 164 de relleno), eliminando 107.172 tokens sin alterar el texto de los conservados.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto de hasta 245.760 tokens en una GPU de 16 GB.
- Decodificación especulativa mediante cabeza MTP integrada, con una tasa de aceptación de borradores del 80,1 % según las mediciones del proyecto Starlight.
- Razonamiento y respuesta a prompts largos: se documenta la lectura correcta de un prompt de 236.286 tokens en 70 s (RX 9070 XT) y 60 s (RTX 5060 Ti).
- Ejecución en hardware de consumo: una GPU de 16 GB (AMD RX 9070 XT, NVIDIA RTX 5070 Ti o RTX 5060 Ti) o dos GPU NVIDIA con tensor split.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con hasta 245.760 tokens de contexto en una sola GPU de 16 GB, lo que permite adjuntar documentación extensa o historiales de chat prolongados sin truncamiento.
- Procesamiento de documentos jurídicos o técnicos: con capacidad para leer prompts de más de 236.000 tokens en menos de 90 s, es adecuado para resumir o extraer información de contratos, manuales o expedientes completos en una sola pasada.
- Generación de texto sin restricciones de rechazo: la edición abliterated elimina la dirección de rechazo en los pesos (20 de 20 prompts respondidos frente a 8 de 20 del fichero original en la prueba del proyecto), lo que lo hace adecuado para investigación sobre alineación y para aplicaciones creativas que requieran respuestas sin filtros de contenido.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en una RX 9070 XT o RTX 5070 Ti de 16 GB, permite ejecutar un modelo de 179.000 millones de parámetros totales en hardware asequible, con velocidades de decodificación de 91 a 103 tok/s según contexto y tarjeta.
- Investigación sobre cuantización extrema: el fichero sirve como referencia para estudiar el impacto de cuantizaciones de 2,84 bits/peso en expertos enrutados, con métricas publicadas de divergencia KL (0,0140) y coincidencia top-1 (97,97 %) frente al fichero plano.
- Prototipado de agentes conversacionales con decodificación especulativa: la cabeza MTP integrada con 80,1 % de aceptación de borradores permite acelerar la generación en pipelines de agentes que requieran baja latencia, aunque no se documenta soporte explícito de tool calling.
- Evaluación comparativa de motores de inferencia: al estar atado al motor Starlight, el modelo permite medir el rendimiento de dicho motor frente a otras implementaciones en tareas de contexto largo y decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas internas del proyecto Starlight:

| Metrica | Fichero plano | Este fichero |
|---|---:|---:|
| Prueba de rechazo (20 prompts respondidos) | 8 de 20 | 20 de 20 |
| Divergencia KL media frente al fichero plano (prueba de prosa de 32k tokens) | — | 0,0140 |
| Mismo token top que el fichero plano | — | 97,97 % |
| Pérdida frente al fichero plano (pareada) | — | +0,0039 ± 0,0023 nats por token |
| Velocidad de decodificación en la prueba de velocidad del proyecto | 93,0 tok/s | 92,0 tok/s |
| Aceptación de borradores MTP | 80,4 % | 80,1 % |

Rendimiento medido en hardware (medianas de tres ejecuciones, 20 de octubre de 2026, clase 64 GB RAM con 38 GiB asignados a Starlight):

| Tarjeta | Decodificación a 2k / 8k / 32k de contexto | Primer token tras prompt de 8k / 32k |
|---|---:|---:|
| RX 9070 XT | 97,7 / 103,2 / 99,9 tok/s | 2,1 s / 8,3 s |
| RTX 5070 Ti | 95,7 / 91,2 / 94,7 tok/s | 2,9 s / 7,3 s |

En máquinas con 32 GB de RAM, la RX 9070 XT decodifica unos 30 tok/s (primer token 9,2 s a 8k y 24 s a 32k) y la RTX 5070 Ti unos 35 tok/s (8,7 s y 22 s). Dos RTX 5060 Ti con tensor split decodifican de 96 a 109 tok/s entre 2k y 64k de contexto, con primer token de 2,5 s a 8k y 10,4 s a 32k. Los resultados varían entre un 5 y un 12 % entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: 16 GB en una GPU de una sola tarjeta; los expertos que no caben permanecen en RAM del sistema y se leen bajo demanda.
- GPU recomendadas: AMD RX 9070 XT, NVIDIA RTX 5070 Ti o RTX 5060 Ti (una tarjeta de 16 GB); dos RTX 5060 Ti con tensor split para contexto completo de 262.144 tokens.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB de AMD o NVIDIA.
- RAM del sistema: clase 64 GB (38 GiB asignados a Starlight) para rendimiento óptimo; en clase 32 GB la velocidad cae a unos 30-35 tok/s.
- Opciones de despliegue: exclusivamente el motor Starlight; no es compatible con Transformers, llama.cpp, Ollama, LM Studio ni otros programas.
- Latencia y throughput: 91-103 tok/s de decodificación en RX 9070 XT y RTX 5070 Ti con 64 GB de RAM; primer token de 2,1 a 8,3 s según tarjeta y longitud de prompt.
- Almacenamiento: fichero de 64,78 GiB; se recomienda NVMe para la lectura de expertos desde RAM.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---:|---|---|---|---|
| Este fichero (Qwen3.8-Flash-Next iq3_s_turbo abliterated) | 179.023.045.248 | 245.760-262.144 | Qwen Community License 1.0 | GGUF Starlight | Solo motor Starlight |
| Qwen3.8-Flash-Next (fichero plano iq3_s_turbo) | 179.023.045.248 | no disponible | Qwen Community License 1.0 | GGUF Starlight | Solo motor Starlight |
| ISTA-DASLab GSQ-RCO IQ3_S (referencia) | no disponible | no disponible | no disponible | GGUF | no disponible |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el fichero solo funciona con el motor Starlight; no es compatible con Transformers, llama.cpp, Ollama, LM Studio ni otras herramientas, y estos programas no están soportados ni probados.
- Licencia: Qwen Community License 1.0 impone restricciones para uso comercial; es necesario revisar los términos antes de desplegar en producción.
- Idiomas: no se dispone de información sobre los idiomas soportados, lo que impide garantizar un rendimiento multilingüe adecuado.
- Alucinación: no se han publicado evaluaciones de tasa de alucinación ni de fidelidad factual; al ser una cuantización de 2,84 bits/peso en los expertos, puede presentar degradación adicional frente al modelo en precisión completa.
- Sesgos: no se dispone de información sobre sesgos conocidos; la edición abliterated elimina la dirección de rechazo, lo que puede aumentar la probabilidad de generar contenido sensible o inapropiado sin filtros.
- Calidad de cuantización: la divergencia KL de 0,0140 y la pérdida pareada de +0,0039 nats por token frente al fichero plano indican una degradación medible, aunque pequeña, en la distribución de salida.
- Contexto: la ventana completa de 262.144 tokens solo se alcanza en dos RTX 5060 Ti o desbordando la caché de atención a RAM, lo que degrada la latencia.
- Rendimiento variable: las velocidades de decodificación varían entre un 5 y un 12 % entre ejecuciones y dependen del ancho de banda PCIe (una RTX 5070 Ti en enlace x16 decodifica aproximadamente un tercio más rápido que en x4).
- Vocabulario podado: se eliminaron 107.172 tokens del vocabulario original, lo que puede afectar a la cobertura de ciertos idiomas o dominios especializados.

## Enlaces

- [Hugging Face: feverdoingwork/Qwen3.8-Flash-Next-iq3_s_turbo-abliterated-Starlight](https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_s_turbo-abliterated-Starlight)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Modelo base cuantizado: ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF)
- [Logits de referencia BF16: jyohukuchan/qwen38-flash-next-bf16-logits](https://huggingface.co/datasets/jyohukuchan/qwen38-flash-next-bf16-logits)

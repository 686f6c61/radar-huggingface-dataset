# feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo-Starlight

## Resumen

Qwen3.8-Flash-Next-iq3_xxs_turbo-Starlight es una cuantizacion de un modelo de lenguaje de tipo mezcla de expertos (MoE) derivada de Qwen/Qwen3.8-Flash-Next, publicada por el usuario feverdoingwork. No es un checkpoint en safetensors ni un GGUF estandar: es un fichero empaquetado especificamente para el motor de inferencia Starlight, con extension `.starlight.gguf`, y el autor advierte explicitamente de que no esta soportado ni probado en llama.cpp, Ollama, LM Studio ni Transformers. El modelo base tiene 179.023.045.248 parametros totales, 48 capas y 512 expertos por capa con 10 expertos activos por token.

La aportacion principal de esta version es la compresion agresiva: los expertos enrutados de las 48 capas principales se sustituyen por expertos con codificacion trellis de 2 bits (TQ2_T, 2,125 bits por peso), lo que reduce el fichero a 54,68 GiB (29,88 GiB de expertos frente a 39,98 GiB en la variante `iq3_s_turbo`). Esto libera unos 10 GiB de RAM y memoria de tarjeta grafica, a cambio de una perdida medible de calidad (KLD de 0,310 frente a BF16, con un 83,56 % de coincidencia top-1). Incluye la cabeza de prediccion multi-token (MTP) para decodificacion especulativa y un vocabulario podado de 248.320 a 141.312 tokens.

Es relevante porque demuestra que un MoE de 179.000 millones de parametros puede ejecutarse en una unica tarjeta de 16 GB (AMD RX 9070 XT o NVIDIA RTX 5070 Ti, segun las mediciones del autor), con ventanas de contexto de hasta 245.760 tokens en la RX 9070 XT. La licencia es Qwen Community License 1.0, con restricciones adicionales de uso comercial que deben revisarse antes de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal hibrida (48 capas, 512 expertos por capa, 10 activos por token), cabeza MTP |
| Parametros totales | 179.023.045.248 |
| Parametros activos | no disponible (el autor no publica el recuento activo exacto) |
| Longitud de contexto | hasta 245.760 tokens en RX 9070 XT; hasta 131.072 tokens en RTX 5070 Ti (medido por el autor) |
| Tipos de cuantizacion | iq3_xxs_turbo (TQ2_T trellis 2,125 bits/peso en expertos; IQ4_XS e IQ2_S en tabla de tokens; IQ3_S e IQ4_NL en bloque MTP; 6,58 bits/peso en atencion y router) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`), fichero unico de 58.714.951.456 bytes (54,68 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas, 512 expertos por capa y 10 expertos activos por token. La cuantizacion conserva la atencion completa y la atencion lineal, el experto compartido, el router y el resto de componentes a 6,58 bits por peso (2,83 GiB), mientras que los expertos enrutados de las capas principales se recomprimen a bloques TQ2_T de 2,125 bits por peso. La tabla de tokens por capa (20,30 GiB, IQ4_XS e IQ2_S a 3,41 bits/peso) es una estructura de consulta con una fila por token que se lee bajo demanda y puede residir en RAM del sistema o en disco, de modo que solo la parte "GPU side" (34,38 GiB, fichero menos la tabla) debe caber simultaneamente en tarjeta y RAM.

El autor no documenta el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion disponible. La innovacion tecnica destacable es doble: por un lado, la codificacion trellis de los expertos, que el autor etiqueta como clase `iq3_xxs_turbo` pese a no usar bloques IQ3_XXS reales; por otro, la inclusion de la cabeza de prediccion multi-token (MTP) dentro del fichero, que habilita decodificacion especulativa con 3 tokens de borrador en las mediciones publicadas. El vocabulario se poda de 248.320 a 141.312 tokens (141.148 reales y 164 de relleno), eliminando 107.172 tokens del modelo sin alterar el texto de los conservados.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con ventanas de hasta 245.760 tokens en hardware AMD de 16 GB.
- Razonamiento multi-turno: el autor documenta una lectura de prompt de 236.286 tokens respondida correctamente en 68 s y un turno de seguimiento en 0,8 s.
- Decodificacion especulativa mediante la cabeza MTP integrada (3 tokens de borrador en las pruebas publicadas).
- Procesamiento de prompts de gran longitud con recuperacion de informacion plantada (el autor verifica "all three planted codes" en sus pruebas).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling, function calling, agentes y modo thinking: no documentados en la informacion disponible.
- Vision y audio: no disponibles; el fichero contiene solo el modelo de texto, la cabeza MTP y el vocabulario podado.

## Casos de uso

- Analisis de documentos extensos en una sola tarjeta de 16 GB: con 245.760 tokens de contexto en RX 9070 XT, el modelo puede ingerir contratos, informes o bases de codigo completas sin fragmentacion ni recuperacion externa, y responder preguntas de seguimiento en menos de un segundo.
- Asistencia conversacional de contexto largo: la ventana de 131.072 tokens en RTX 5070 Ti permite mantener historiales de conversacion muy extensos con latencia de turno de 0,8 s, adecuado para atencion al cliente tecnica o soporte especializado.
- Procesamiento por lotes en estaciones de trabajo con GPU consumer: el fichero de 54,68 GiB y la tabla de tokens en RAM permiten desplegar un MoE de 179.000 millones de parametros en un solo equipo AMD RX 9070 XT o NVIDIA RTX 5070 Ti, sin necesidad de servidores multi-GPU.
- Investigacion sobre cuantizacion extrema: sirve como referencia practica para estudiar el compromiso entre KLD, perplejidad y coincidencia top-1 en expertos codificados con trellis a 2,125 bits/peso, comparandolo con las referencias IQ3_S e IQ3_XXS de ISTA-DASLab.
- Generacion de codigo y texto tecnico en entornos con memoria limitada: el modelo conserva atencion y router a 6,58 bits/peso, lo que preserva la calidad en las componentes criticas mientras comprime los expertos, util para pipelines de generacion en equipos de desarrollo con una sola GPU.
- Evaluacion comparativa de motores de inferencia: al estar empaquetado exclusivamente para Starlight, permite medir el rendimiento del motor (throughput, latencia de lectura de prompt) frente a otras implementaciones en el mismo hardware.
- Despliegue en entornos con RAM de sistema amplia y GPU modesta: la separacion entre "GPU side" (34,38 GiB) y tabla de tokens en RAM o disco permite configuraciones con 46 GiB de RAM bloqueada y toda la cache en tarjeta, segun las mediciones del autor.

## Benchmarks y rendimiento

Calidad medida por el proyecto Starlight contra los logits BF16 de referencia del modelo base (12 casos de texto, 16.561 posiciones puntuadas, motor Starlight en RTX 5070 Ti, 2 de noviembre de 2026):

| # | Fichero | KLD a BF16 | Top-1 igual a BF16 | Perplejidad (BF16: 3,126) | Tamano total (GiB) |
|--:|---|--:|--:|--:|--:|
| 1 | ISTA-DASLab GSQ-RCO IQ3_S (referencia) | 0,193 | 86,71 % | 3,463 | 77,88 |
| 2 | `iq3_s_turbo` | 0,257 | 84,08 % | 3,593 | 64,78 |
| 3 | ISTA-DASLab GSQ-RCO IQ3_XXS (referencia) | 0,276 | 84,05 % | 3,657 | 70,63 |
| 4 | `iq3_xxs_turbo` (este modelo) | 0,310 | 83,56 % | 3,566 | 54,68 |
| 5 | `iq3_xxs_turbo_mini` | 0,318 | 83,78 % | 3,508 | 50,03 |

Rendimiento de decodificacion medido en RX 9070 XT (2 de noviembre de 2026, build temprana del motor): `iq3_xxs_turbo` decodifica a 56,4 tokens por segundo frente a 59,6 de `iq3_s_turbo`, y lee prompts aproximadamente un 10 % mas lento, con 10 GiB menos de RAM para los expertos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/tarjeta: el fichero completo ocupa 54,68 GiB, pero la parte que debe residir en GPU y RAM simultaneamente ("GPU side") es de 34,38 GiB; la tabla de tokens por capa (20,30 GiB) puede quedar en RAM del sistema o en disco.
- RAM de sistema: el autor midio con 46 GiB de RAM bloqueada y toda la cache en tarjeta.
- GPU verificadas por el autor: AMD RX 9070 XT (16 GB) con contexto de 245.760 tokens y NVIDIA RTX 5070 Ti (16 GB) con contexto de 131.072 tokens.
- Cabe en GPU consumer de 16 GB, pero solo con el motor Starlight y con la tabla de tokens fuera de la tarjeta; no es un fichero para llama.cpp, Ollama, LM Studio ni TGI.
- Opciones de despliegue: exclusivamente el motor Starlight (libreria `starlight`, `inference: false` en Hugging Face). El autor declara que otros programas no estan soportados ni probados.
- Latencia y throughput medidos: 56,4 tokens/s de decodificacion en RX 9070 XT; lectura de un prompt de 236.286 tokens en 68 s en RX 9070 XT y de 124.678 tokens en 32 s en RTX 5070 Ti; turno de seguimiento en 0,8 s en ambos casos.
- Cache de atencion: el autor uso cache q4 de atencion para las mediciones de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD a BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iq3_xxs_turbo` (este) | 179.023.045.248 (MoE, 10 activos) | 245.760 tokens (RX 9070 XT) | 0,310 KLD / 83,56 % top-1 | Qwen Community 1.0 | Solo motor Starlight, 54,68 GiB |
| `iq3_s_turbo` (misma familia) | 179.023.045.248 (MoE) | no disponible | 0,257 KLD / 84,08 % top-1 | Qwen Community 1.0 | Solo Starlight, 64,78 GiB |
| `iq3_xxs_turbo_mini` (misma familia) | 179.023.045.248 (MoE) | no disponible | 0,318 KLD / 83,78 % top-1 | Qwen Community 1.0 | Solo Starlight, 50,03 GiB |
| ISTA-DASLab GSQ-RCO IQ3_S | 179.023.045.248 (MoE) | no disponible | 0,193 KLD / 86,71 % top-1 | no disponible | GGUF de referencia, 77,88 GiB |
| ISTA-DASLab GSQ-RCO IQ3_XXS | 179.023.045.248 (MoE) | no disponible | 0,276 KLD / 84,05 % top-1 | no disponible | GGUF de referencia, 70,63 GiB |

La comparacion con modelos de otros desarrolladores (por ejemplo, alternativas MoE de tamano similar) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible: KLD de 0,310 frente a BF16 y 83,56 % de coincidencia top-1, por detras de las referencias IQ3_S (0,193 / 86,71 %) e IQ3_XXS (0,276 / 84,05 %) de ISTA-DASLab.
- Compatibilidad restringida: el fichero solo funciona con el motor Starlight; no es compatible con llama.cpp, Ollama, LM Studio, Transformers ni TGI, y el autor no da soporte a otros programas.
- Licencia Qwen Community License 1.0: incluye restricciones de uso comercial que deben revisarse antes de produccion; el campo de Hugging Face figura como `other`.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni sobre el comportamiento en castellano.
- Riesgo de alucinacion: no cuantificado por el autor; la compresion a 2,125 bits/peso en los expertos puede amplificar errores en tareas de conocimiento factual.
- Vocabulario podado: 107.172 tokens eliminados del original; los textos de los tokens conservados no cambian, pero cualquier flujo que dependa de IDs de tokens del vocabulario original puede romperse.
- Contexto dependiente del hardware: 245.760 tokens solo en RX 9070 XT; en RTX 5070 Ti se reduce a 131.072 tokens.
- Requisito de RAM: 46 GiB bloqueados en las mediciones del autor; configuraciones con menos RAM pueden requerir mantener la tabla de tokens en disco, con impacto en latencia.
- Build temprana del motor: las cifras de throughput (56,4 tokens/s) proceden de una version temprana de Starlight y pueden variar con versiones posteriores.
- Sin datos de entrenamiento publicados: no se documentan tokens de entrenamiento, composicion del dataset ni proceso de alineacion (RLHF/DPO) del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizacion de referencia ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Logits BF16 de referencia: https://huggingface.co/datasets/jyohukuchan/qwen38-flash-next-bf16-logits
- Licencia: LICENSE (incluida en el repositorio de Hugging Face)

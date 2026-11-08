# feverdoingwork/Qwen3.8-Flash-Next-iq3_s_turbo-abliterated-Starlight

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el equipo Qwen (Alibaba). Esta ficha describe una distribucion concreta publicada por el usuario `feverdoingwork`: una version cuantizada a partir del checkpoint GGUF GSQ-RCO de ISTA-DASLab, con la direccion de rechazo eliminada de los pesos (abliteration) y empaquetada en un unico fichero para el motor de inferencia Starlight. El resultado es un fichero de 64,78 GiB que conserva el modelo de texto, la cabeza de borrador MTP (multi-token prediction) para decodificacion especulativa y un vocabulario podado de 248.320 a 141.312 tokens.

La relevancia de esta publicacion es practica: permite ejecutar un MoE de 48 capas con 512 expertos por capa y 10 expertos activos por token en una unica GPU de 16 GB (AMD RX 9070 XT, NVIDIA RTX 5070 Ti o RTX 5060 Ti), manteniendo los expertos que no caben en la tarjeta en RAM del sistema y leyendolos bajo demanda. La ventana de contexto alcanza 245.760 tokens en una sola tarjeta y 262.144 tokens en dos tarjetas o con la cache de atencion desbordada a RAM.

La abliteration se aplica directamente en los pesos: se editan 144 matrices que escriben en el flujo residual, de las cuales 95 conservan los numeros calibrados GSQ-RCO (proyecciones down de expertos y experto compartido en 2 y 4 bits) y 49 se recuantizan de forma estandar en 4-8 bits desde los pesos de precision completa tras la edicion. La licencia es la Qwen Community License 1.0, con restricciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas de atencion lineal (state-space) y atencion completa; 48 capas, 512 expertos por capa, 10 activos por token; cabeza MTP para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (10 de 512 expertos por token) |
| Longitud de contexto | 245.760 tokens en una GPU de 16 GB; 262.144 tokens en dos RTX 5060 Ti o con cache desbordada a RAM |
| Tipos de cuantizacion | Receta `iq3_s_turbo` (GSQ-RCO calibrado); medias de 2,84 bits/peso en expertos enrutados, 3,41 en tabla por capa, 6,58 en atencion/router/compartido, 5,41 en embedding y cabeza, 3,97 en cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`); no compatible con Transformers, llama.cpp, Ollama ni LM Studio |
| Tamano del fichero | 69.554.574.592 bytes (64,78 GiB) |
| SHA-256 | `1a0a3cd93c269e1c3cf93ed0a0a705392e952ebbd4088651d9d74f484f699b29` |
| Vocabulario | 141.312 tokens (141.148 reales, 164 de padding), podado desde 248.320 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 48 capas y 512 expertos por capa, de los que se activan 10 por token. Combina capas de atencion completa con capas de atencion lineal de tipo state-space, lo que reduce el coste de la cache de atencion en contextos largos. Incluye una cabeza de borrador MTP integrada en el fichero que permite decodificacion especulativa con una tasa de aceptacion medida del 80,1 % sobre este fichero (80,4 % en el fichero plano de referencia).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La innovacion tecnica documentada en esta publicacion es la receta de cuantizacion: `iq3_s_turbo` parte de la cuantizacion calibrada GSQ-RCO de ISTA-DASLab, la reempaqueta y reduce su tamano, y aplica abliteration editando 144 matrices que escriben en el flujo residual. De estas, 95 conservan los numeros calibrados GSQ-RCO (cada columna recibio los cambios de codigo minimos que cancelan la direccion de rechazo) y 49 (salida de atencion y salida state-space) se recuantizaron de forma estandar en 4-8 bits desde los pesos de precision completa tras la edicion. El resto del fichero es identico al fichero plano.

## Capacidades

- Generacion de texto y razonamiento en el modelo base Qwen3.8-Flash-Next; la model card de esta distribucion no detalla modos de razonamiento propios.
- Decodificacion especulativa mediante cabeza MTP integrada, con 80,1 % de aceptacion de borradores medida.
- Ejecucion con expertos fuera de la VRAM: los expertos que no caben en la tarjeta se leen desde RAM del sistema bajo demanda.
- Procesamiento de contextos largos: lectura correcta de un prompt de 236.286 tokens (70 s en RX 9070 XT, 60 s en RTX 5060 Ti).
- Respuestas sin rechazo por abliteration en los pesos: 20 de 20 prompts respondidos en la prueba de rechazo del proyecto Starlight, frente a 8 de 20 del fichero plano.
- Soporte multimodal (imagen y video): la model card de esta distribucion no lo menciona; una publicacion independiente del mismo modelo base (dealignai, FP8) indica que el modelo base conserva multimodalidad completa, pero no se confirma para este fichero.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Inferencia local en GPU de consumo: un unico equipo con RX 9070 XT o RTX 5070 Ti de 16 GB y 64 GB de RAM ejecuta el modelo a 91-103 tok/s en contextos de 2k a 32k, lo que permite prototipado y uso personal sin infraestructura de centro de datos.
- Analisis de documentos extensos: con 245.760 tokens de contexto en una sola tarjeta, el modelo puede leer contratos, informes o bases de codigo completas en una sola pasada; se midio la lectura de un prompt de 236.286 tokens en 60-70 s.
- Generacion asistida en local con decodificacion especulativa: la cabeza MTP con 80,1 % de aceptacion acelera la generacion en flujos interactivos donde la latencia por token importa.
- Investigacion sobre abliteration y cuantizacion: el fichero permite comparar el efecto de la eliminacion de la direccion de rechazo (KLD media de 0,0140 frente al fichero plano, 97,97 % de coincidencia en el token mas probable) en un MoE de gran escala.
- Despliegue en estaciones de trabajo con dos GPU: dos RTX 5060 Ti en tensor split alcanzan 96-109 tok/s de 2k a 64k de contexto y el limite completo de 262.144 tokens, adecuado para entornos de desarrollo con contexto muy largo.
- Evaluacion de motores de inferencia alternativos: al ser un formato exclusivo de Starlight, sirve para comparar el rendimiento de este motor frente a llama.cpp u otros en el mismo modelo base cuantizado.
- Escenarios que requieren respuestas sin rechazo: la abliteration en pesos elimina la direccion de rechazo, util en investigacion de seguridad y en tareas creativas o de analisis sensible donde los filtros del modelo base interfieren.

## Benchmarks y rendimiento

Calidad medida por el proyecto Starlight contra los logits BF16 de referencia del modelo base (12 casos de texto, 16.561 posiciones evaluadas, motor Starlight en RTX 5070 Ti, 2 de noviembre de 2026):

| Metrica | Este fichero | Referencia |
|---|---:|---:|
| KLD media a BF16 | no disponible en el extracto | no disponible |
| Perplejidad (BF16 de referencia) | no disponible en el extracto | 3,126 |
| KLD media al fichero plano (prueba de prosa de 32k tokens) | 0,0140 | — |
| Coincidencia del token mas probable con el fichero plano | 97,97 % | — |
| Perdida emparejada frente al fichero plano | +0,0039 ± 0,0023 nats/token | — |
| Prueba de rechazo (20 prompts respondidos) | 20 de 20 | 8 de 20 (fichero plano) |
| Aceptacion de borradores MTP | 80,1 % | 80,4 % (fichero plano) |

Velocidad de decodificacion medida (medianas de tres ejecuciones, 20 de octubre de 2026, Ryzen 5 7500F, 62 GiB de RAM, 38 GiB asignados a Starlight):

| Tarjeta | 2k de contexto | 8k de contexto | 32k de contexto | Primer token tras 8k / 32k |
|---|---:|---:|---:|---:|
| RX 9070 XT | 97,7 tok/s | 103,2 tok/s | 99,9 tok/s | 2,1 s / 8,3 s |
| RTX 5070 Ti | 95,7 tok/s | 91,2 tok/s | 94,7 tok/s | 2,9 s / 7,3 s |
| Dos RTX 5060 Ti (tensor split) | — | — | — | 2,5 s / 10,4 s (96-109 tok/s de 2k a 64k) |

En equipos de 32 GB de RAM la velocidad baja a unos 30 tok/s en RX 9070 XT y 35 tok/s en RTX 5070 Ti. La variacion entre ejecuciones es del 5 al 12 %. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: una GPU de 16 GB es suficiente (RX 9070 XT, RTX 5070 Ti, RTX 5060 Ti); los expertos que no caben permanecen en RAM del sistema.
- RAM: clase de 64 GB recomendada (38 GiB asignados a Starlight en las pruebas); en clase de 32 GB el rendimiento cae a 30-35 tok/s.
- GPU recomendadas: AMD RX 9070 XT, NVIDIA RTX 5070 Ti, RTX 5060 Ti; dos RTX 5060 Ti en tensor split para el contexto completo de 262.144 tokens.
- Almacenamiento: NVMe recomendado para la lectura bajo demanda de expertos y de la tabla por capa (20,30 GiB).
- Enlace PCIe: un enlace x16 mejora notablemente el rendimiento; el mismo RTX 5070 Ti en x16 decodifico aproximadamente un tercio mas rapido que en x4.
- Opciones de despliegue: exclusivamente el motor Starlight; no es compatible con llama.cpp, Ollama, LM Studio, vLLM ni TGI.
- Latencia y throughput: 91-103 tok/s en clase de 64 GB de RAM; primer token de 2,1-2,9 s tras 8k y de 7,3-8,3 s tras 32k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este fichero (iq3_s_turbo abliterated) | MoE 48 capas, 512 expertos, 10 activos | 245.760-262.144 | `.starlight.gguf`, 64,78 GiB | Qwen Community 1.0 | Solo Starlight; abliterated; MTP incluido |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (fichero plano de referencia) | mismo modelo base | no disponible | GGUF | Qwen Community 1.0 | Sin abliteration: 8 de 20 prompts respondidos en la prueba de rechazo |
| dealignai/Qwen3.8-Flash-Next-ABLITERATED-FP8 | mismo modelo base | no disponible | FP8 | no disponible | Abliterated en FP8, conserva razonamiento (low/medium/xhigh), MTP y multimodalidad imagen y video |
| Qwen/Qwen3.8-Flash-Next (modelo base) | MoE 48 capas, 512 expertos, 10 activos | no disponible | safetensors (BF16) | Qwen Community 1.0 | Referencia de calidad; sin cuantizar |

## Limitaciones y advertencias

- Formato propietario: el fichero solo funciona con el motor Starlight; no se puede cargar en llama.cpp, Ollama, LM Studio, vLLM, TGI ni Transformers.
- Abliteration: la eliminacion de la direccion de rechazo reduce las salvaguardas del modelo base; puede producir contenido que el modelo original rechazaria. Requiere revision y moderacion adicionales en produccion.
- Deriva de calidad por cuantizacion: KLD media de 0,0140 frente al fichero plano y perdida de +0,0039 nats/token; el 2,03 % de las posiciones no coincide en el token mas probable.
- Vocabulario podado: se eliminan 107.172 tokens del vocabulario original; los tokens conservados mantienen el mismo texto, pero puede afectar a idiomas o dominios poco representados.
- Idiomas: no se documenta la cobertura linguistica de esta distribucion.
- Rendimiento dependiente del hardware: con 32 GB de RAM la velocidad cae a 30-35 tok/s y la latencia del primer token sube a 9,2-24 s; un enlace PCIe x4 penaliza aproximadamente un tercio el rendimiento.
- Variabilidad: las mediciones de velocidad varian un 5-12 % entre ejecuciones.
- Licencia: Qwen Community License 1.0; conviene revisar las restricciones de uso comercial y de redistribucion antes de desplegar en produccion.
- Datos incompletos: no hay informacion sobre sesgos, tasas de alucinacion ni benchmarks estandar en la documentacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_s_turbo-abliterated-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint GGUF de referencia (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Logits BF16 de referencia: https://huggingface.co/datasets/jyohukuchan/qwen38-flash-next-bf16-logits
- Version abliterated en FP8 (dealignai): https://huggingface.co/dealignai/Qwen3.8-Flash-Next-ABLITERATED-FP8

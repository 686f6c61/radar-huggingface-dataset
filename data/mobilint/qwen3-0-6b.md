# mobilint/Qwen3-0.6B

## Resumen

Qwen3-0.6B es un modelo de lenguaje de 0,6 mil millones de parametros desarrollado originalmente por Alibaba Qwen. Esta ficha concreta, publicada por Mobilint bajo el identificador `mobilint/Qwen3-0.6B`, no es el modelo original en precision completa, sino una compilacion optimizada y cuantizada del mismo para su despliegue sobre aceleradores NPU de Mobilint, en concreto el objetivo `aries-rb` (familia Aries). El paquete incluye pesos en formato MXQ y se ejecuta a traves del stack propietario de Mobilint (`transformers-mblt` y `qbruntime`), no como un checkpoint de transformers convencional.

El interes de esta build radica en que corrige un fallo grave de la version anterior: aquella se colgaba en la mayoria de prompts de mas de unos 3.000 tokens. La build actual, compilada con qbcompiler 1.4.1 el 11 de noviembre de 2026, procesa prompts de hasta 12.500 tokens con una divergencia (KL) frente al modelo original de 0,05 hasta unos 8K tokens y 0,21 a unos 12K, manteniendo una precision MMLU de 0,310 frente a 0,309 del modelo bf16 original.

Se trata, por tanto, de un artefacto de despliegue orientado a inferencia en hardware NPU, con ventana de contexto de 16.384 tokens (prompt mas generacion), cuantizacion de 8 bits en pesos y activaciones mixtas, y una licencia Apache 2.0 heredada del modelo base. No aporta mejoras de capacidad respecto a Qwen3-0.6B; su valor esta en la portabilidad y el rendimiento medido sobre Aries.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B); compilada para NPU Mobilint Aries |
| Parametros totales | 155.582.464 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (prompt + generado) |
| Tipos de cuantizacion | W8 (8 bits en pesos; 8 bits en activaciones a la entrada de atencion y cabeza de salida, 16 bits en el resto). Referencia adicional W4V8 (4 bits pesos / 8 bits activaciones) |
| Idiomas soportados | no disponible (calibrado con datos multilingues publicos, sin lista explicita) |
| Licencia | Apache 2.0 |
| Formato de pesos | MXQ (`Qwen3-0.6B-W8.mxq`, 0,72 GB); repo de 6,8 GB con safetensors y codigo custom |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B: un transformer decoder-only denso de 0,6B parametros. Esta build no reentrena el modelo; aplica cuantizacion post-entrenamiento (PTQ) calibrada sobre datos multilingues publicos que incluyen prompts de recuperacion largos (2K-8K tokens), y compila el grafo para el NPU Aries con qbcompiler 1.4.1. Los pesos se empaquetan en formato MXQ (0,72 GB para W8) y las activaciones usan 8 bits en las entradas de atencion y de la cabeza de salida, y 16 bits en el resto.

La compilacion incluye tres modos de nucleo (`single`, `global4`, `global8`), seleccionables en carga mediante `core_mode`, con `global8` por defecto. Los tamanos de chunk de prefill estan fijados en `config.json` (1.024 / 512 / 256 tokens). La innovacion principal respecto a la build anterior es la calibracion con prompts largos, que elimina el fallo de bloqueo del runtime en prompts de mas de ~3.000 tokens y reduce la divergencia KL a contexto corto (de 0,077 a 0,050 en RAG a ~1K tokens).

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla `apply_chat_template` y soporte de `enable_thinking=False`/`True` heredado de Qwen3.
- Razonamiento y respuesta a preguntas de conocimiento general (MMLU evaluado).
- Recuperacion aumentada (RAG) sobre contextos largos: medido con KL estable hasta ~8K tokens y degradacion controlada a ~12K.
- Procesamiento de prompts largos de hasta 12.500 tokens en las pruebas publicadas, dentro de la ventana de 16.384.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible la lista concreta; la calibracion uso datos multilingues publicos.
- Capacidades de vision o audio: no disponibles (modelo solo de texto).

## Casos de uso

- RAG sobre documentacion corporativa: el modelo procesa prompts de recuperacion de 2K-8K tokens con KL de 0,05 frente al original, lo que lo hace adecuado para responder preguntas con varios fragmentos recuperados en un solo contexto.
- Despliegue en edge o en dispositivos con NPU Aries: al estar compilado para el acelerador de Mobilint con un MXQ de 0,72 GB, permite inferencia local sin GPU dedicada.
- Asistentes conversacionales de bajo coste: 32,4 tok/s de decodificacion a 1K tokens y 0,47 s hasta el primer token sobre Aries, suficiente para chat interactivo.
- Clasificacion y extraccion de informacion sobre textos largos: la ventana de 16.384 tokens y el prefill completo de 16K en ~34 s (global8) permiten procesar documentos extensos en una sola llamada.
- Prototipado y evaluacion de pipelines: la licencia Apache 2.0 y la disponibilidad del modelo base facilitan integrarlo en pruebas sin restricciones comerciales.
- Generacion de resumenes y respuestas extractivas en entornos con requisitos de privacidad: al ejecutarse en hardware local, los datos no salen del dispositivo.
- Evaluacion comparativa de cuantizacion: la publicacion de metricas W8 frente a W4V8 permite decidir el equilibrio precision/velocidad/tamano para un despliegue concreto.

## Benchmarks y rendimiento

Resultados medidos en Aries (2026-11-11 y 2026-11-17, qbruntime 1.5.0, core mode global8):

| Build | Contexto | RAG KL ~1K | ~4K | ~8K | ~12K | MMLU acc. | MMLU KL | TTFT 1K / 4K (s) | Decode 1K / 4K (tok/s) | MXQ |
|---|---|---|---|---|---|---|---|---|---|---|
| W8 anterior (2026-04-14) | 16.384 | 0,077 | 0,091 (22/90) | 0,759 (28/90) | 2,931 (7/30) | 0,309 | 0,086 | 0,46 / falla | 32,7 / falla | 0,63 GB |
| W8 esta build (2026-11-11) | 16.384 | 0,050 | 0,049 | 0,051 | 0,211 | 0,310 | 0,076 | 0,47 / 2,74 | 32,4 / 22,7 | 0,72 GB |
| W4V8 anterior (referencia) | 16.384 | 0,485 | 0,511 (22/90) | 1,525 (28/90) | 4,870 (7/30) | 0,282 | 1,121 | 0,44 / falla | 40,8 / falla | 0,35 GB |
| W4V8 esta build (referencia) | 16.384 | 0,160 | 0,193 | 0,212 | 0,306 | 0,292 | 0,247 | 0,45 / 2,73 | 39,9 / 26,3 | 0,35 GB |
| Qwen3-0.6B bf16 (GPU) | — | 0 | 0 | 0 | 0 | 0,309 | 0 | — | — | — |

Notas: KL menor es mejor (mas cercano al original). "(n/90)" indica prompts que la build anterior logro completar; el resto fallaba. La tasa de decodificacion varia ±10 % entre ejecuciones. No se han publicado resultados de benchmarks estandar (MMLU completo, HumanEval, GSM8K) mas alla de la precision MMLU indicada.

## Requisitos de hardware

- Hardware objetivo: NPU Mobilint Aries (`aries-rb`), no GPU convencional.
- VRAM estimada: no aplica; el modelo se ejecuta sobre la NPU. Tamano del artefacto W8: 0,72 GB (MXQ); W4V8: 0,35 GB.
- GPU recomendadas: no disponible; esta build no esta pensada para GPU. El modelo base Qwen3-0.6B puede ejecutarse en GPU consumer de gama baja.
- Cabe en GPU consumer: no aplica a esta build; el modelo base de 0,6B si cabe en cualquier GPU con 2-4 GB de VRAM en cuantizacion.
- Opciones de despliegue: `transformers-mblt` (pip) con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y `qbruntime` 1.5.x; requiere `model.dispose()` al finalizar.
- Latencia y throughput medidos: TTFT 0,47 s a 1K tokens y 2,74 s a 4K; decodificacion 32,4 tok/s a 1K y 22,7 tok/s a 4K. Prefill completo de 16K: ~34 s (global8), ~66 s (global4), ~82 s (single).
- Limite de timeout: el runtime aborta llamadas NPU de mas de 10 s (`QBRUNTIME_NPU_TIMEOUT_MS`); con los chunks por defecto la llamada mas lenta a 16K es de 3,9 s (global8), por lo que no es necesario ajustarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| mobilint/Qwen3-0.6B (esta build) | 0,6B | 16.384 | W8 / W4V8 (MXQ) | Apache 2.0 | NPU Aries |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en la informacion | bf16 y otras | Apache 2.0 | GPU/CPU |
| mobilint W4V8 (misma familia) | 0,6B | 16.384 | W4V8 (MXQ) | Apache 2.0 | NPU Aries |

Frente al modelo base, esta build pierde precision (KL 0,05-0,21 segun contexto) pero gana portabilidad a NPU y reduce el peso a 0,72 GB. Frente a la variante W4V8, es mas precisa (MMLU 0,310 vs 0,292; KL 0,050 vs 0,160 a 1K) a costa de mayor tamano y menor velocidad de decodificacion (32,4 vs 39,9 tok/s). No se dispone de comparativas con otros modelos de 0,6B en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware propietario: solo funciona sobre NPU Mobilint Aries con el stack `transformers-mblt`/`qbruntime`; no es portable a GPU o CPU sin recompilar.
- Divergencia respecto al original: la cuantizacion introduce KL de 0,05 a contexto corto y 0,21 a ~12K tokens; no es equivalente bit a bit al modelo bf16.
- Ventana limitada a 16.384 tokens; prompts por encima no estan soportados.
- Riesgo de alucinacion: inherente a un modelo de 0,6B; la precision MMLU de 0,310 es baja en terminos absolutos.
- Sesgos: no documentados en la informacion proporcionada; al derivar de Qwen3-0.6B, hereda los sesgos del modelo base y de los datos de calibracion.
- Idiomas: no se publica lista explicita; el soporte multilingue real no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el stack de runtime y el compilador de Mobilint pueden tener sus propias condiciones no detalladas aqui.
- El fallo de prompts largos de builds anteriores esta corregido, pero conviene validar en el hardware concreto antes de produccion.
- La build se actualiza con frecuencia (ultima actualizacion 2026-11-18); fijar revision para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilint/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Web de Mobilint: https://mobilint.com
- Logo y assets: https://raw.githubusercontent.com/mobilint/.github/main/assets/Mobilint_Logo_Primary.png

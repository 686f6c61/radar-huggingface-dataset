# litert-community/Polaris-4B-Preview

## Resumen

Polaris-4B-Preview es un modelo de razonamiento denso de aproximadamente 4.000 millones de parametros desarrollado por POLARIS-Project y distribuido en formato LiteRT-LM por la comunidad litert-community. Se construye sobre Qwen3-4B (arquitectura transformer densa, licencia Apache-2.0) y se ha sometido a un post-entrenamiento con aprendizaje por refuerzo orientado a matematicas de competicion. El modelo razona internamente dentro de un bloque `` antes de emitir la respuesta final, lo que lo convierte en un razonador especializado en problemas de cadena larga.

La relevancia de esta ficha concreta reside en su empaquetado: el repositorio publica `model.litertlm`, un bundle de 2,48 GB con pesos cuantizados a int4 por bloques (block 128) mas OCTAV con clipping optimo y simetrico, embedding en INT8 y tokenizador y plantilla ChatML incluidos. Esto permite ejecutar el modelo completamente en dispositivos de borde (telefonos Android, Raspberry Pi 5, Mac con GPU) mediante el runtime LiteRT-LM de Google, sin necesidad de infraestructura de servidor.

El modelo declara un contexto de 4.096 tokens (cache KV) y esta pensado para escenarios on-device donde la privacidad y la ausencia de red son requisitos. Su rendimiento declarado en AIME24 (81,2) y AIME25 (79,4) lo situa, segun la model card, en el rango de razonadores frontera mucho mas grandes, a costa de un consumo de tokens elevado durante el razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B) con post-entrenamiento RL |
| Parametros totales | ~4B (aproximadamente 4.000 millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (cache KV del bundle LiteRT-LM) |
| Tipos de cuantizacion | int4 por bloques (block 128) + OCTAV optimal-clipping, simetrico; embedding INT8 |
| Idiomas soportados | no disponible (la model card no detalla cobertura linguistica) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); modelo base original en safetensors en POLARIS-Project/Polaris-4B-Preview |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo `qwen3` con aproximadamente 4.000 millones de parametros, sobre el que POLARIS-Project aplico un post-entrenamiento con aprendizaje por refuerzo (RL post-training) especificamente orientado a matematicas de competicion. La model card indica que el modelo "trabaja el problema" dentro de un bloque `` antes de responder, lo que implica un modo de razonamiento explicito con cadenas de pensamiento largas. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas como DPO.

La contribucion tecnica del repositorio de litert-community es la conversion al formato `.litertlm` para el runtime LiteRT-LM. El bundle aplica cuantizacion int4 por bloques de 128 elementos con clipping optimo OCTAV y simetria, mantiene el embedding en INT8 y externaliza el embedding para que cada seccion del archivo quede por debajo de 2 GiB (requisito que permitia la carga en iOS en versiones anteriores). El 16 de noviembre de 2026 se reemplazo `model.litertlm` por una version cuyo grafo de prefill/decode esta reescrito para GPU, sin modificar ningun peso. El bundle incluye tokenizador y plantilla de prompt ChatML (`<|im_start|>role\n … <|im_end|>`).

## Capacidades

- Razonamiento matematico de competicion con cadena de pensamiento explicita en ``.
- Generacion de texto general y respuesta a instrucciones mediante plantilla ChatML.
- Razonamiento multi-paso para problemas de cadena larga (el modelo "piensa" antes de responder).
- Inferencia on-device con el runtime LiteRT-LM en GPU (WebGPU, GPU movil) y CPU.
- Ejecucion en navegador mediante la demo web de LiteRT-LM con WebGPU.
- No se documenta en la informacion disponible soporte de tool calling, function calling, vision, audio ni capacidades de agente.

## Casos de uso

- Tutoria matematica offline en el movil: el modelo resuelve problemas de competicion paso a paso dentro del bloque de pensamiento, sin conexion de red, aprovechando su rendimiento declarado en AIME y su empaquetado int4 de 2,48 GB que cabe en almacenamiento de telefono.
- Asistente de estudio en Raspberry Pi 5: con 1,5 tok/s de decodificacion y 25,66 s de TTFT medidos en CPU a 4 hilos, es viable para consultas puntuales de razonamiento donde la latencia no es critica, por ejemplo en un aula o laboratorio sin infraestructura.
- Demo interactiva en navegador: la demo web de LiteRT-LM carga el bundle desde la rama `web` (2,47 GB) y ejecuta con WebGPU, util para validar el modelo antes de integrarlo en una aplicacion.
- Verificacion de razonamiento en pipelines de evaluacion: dado su modo de pensamiento explicito, sirve para generar cadenas de solucion auditables en conjuntos de problemas matematicos, con la advertencia de que el contexto de 4.096 tokens puede agotarse en problemas largos.
- Prototipado de aplicaciones edge con privacidad: al ejecutarse completamente en dispositivo, es adecuado para escenarios donde los datos del usuario no deben salir del terminal (por ejemplo, ejercicios con datos personales).
- Pruebas de integracion de LiteRT-LM en Android: el repositorio documenta el rendimiento en Galaxy S26 y Pixel 11 Pro, lo que lo convierte en una referencia practica para medir la ruta GPU de LiteRT-LM en telefonos (requiere LiteRT-LM 0.19.0 o superior en Android).
- Evaluacion comparativa de cuantizacion int4 en el borde: el repositorio publica mediciones de prefill, decode, TTFT y consumo de memoria GPU (`kgsl_page_alloc`) entre versiones del archivo, util para estudiar el impacto de la reescritura de grafos en el rendimiento.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo base (segun la model card de este repositorio):

| Benchmark | Resultado |
|---|---|
| AIME24 | 81,2 |
| AIME25 | 79,4 |

Mediciones on-device publicadas en la model card:

| Dispositivo | Runtime y backend | Decode | Prefill | TTFT |
|---|---|---|---|---|
| Mac Studio M4 Max | LiteRT-LM 0.14.0, GPU | 68,9 tok/s | 971 tok/s | 278 ms |
| Raspberry Pi 5 | LiteRT-LM 0.16.1, CPU 4 hilos | 1,5 tok/s | 11 tok/s | 25,66 s |
| Galaxy S26 | LiteRT-LM 0.19.0, GPU | 20,3 tok/s | 170 tok/s (1.024 tokens) | no disponible |

Notas de las mediciones: en Galaxy S26 y Pixel 11 Pro, el archivo del 16-11-2026 decodifico entre 1,51 y 1,52 veces mas rapido y prefilo entre 1,35 y 1,42 veces mas rapido que el archivo anterior en Galaxy S26 GPU (1,34-1,46 y 1,17-1,27 en Pixel 11 Pro). En Galaxy S26 CPU, el pico de proceso (`VmHWM`) fue 0,93-0,95 GB superior (5,04 GB frente a 4,09-4,11 GB). No se han publicado resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el bundle `model.litertlm` ocupa 2,48 GB en disco. En Galaxy S26 GPU, el contador de asignacion GPU del telefono (`kgsl_page_alloc`) subio 4,82-4,83 GB durante la ejecucion; en CPU, el pico de proceso fue de 5,04 GB.
- GPU recomendadas: GPU integrada de Mac Studio M4 Max (68,9 tok/s de decode medidos); GPU moviles de Galaxy S26 y Pixel 11 Pro; cualquier GPU compatible con WebGPU para la demo de navegador.
- CPU: Raspberry Pi 5 con 4 hilos funciona (1,5 tok/s de decode), aunque con TTFT de 25,66 s.
- Cabe en GPU de consumo: si, en el sentido de que el modelo esta disenado para GPU integradas y moviles; no se han publicado mediciones en RTX 4090, A100 o H100.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert-lm run`, `litert_lm_main` con `--backend gpu`), demo web con WebGPU, integracion Android (requiere LiteRT-LM 0.19.0 o superior para la ruta GPU).
- Latencia y throughput: ver tabla de benchmarks. En Mac con `--backend gpu`, una ejecucion de ejemplo tardo 38 s frente a 208 s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Polaris-4B-Preview (LiteRT-LM) | ~4B denso | 4.096 tokens | Razonamiento matematico RL, on-device | Apache-2.0 | Hugging Face (litert-community y POLARIS-Project) |
| Qwen3-4B (modelo base) | ~4B denso | no disponible en esta ficha | Modelo generalista | Apache-2.0 | Hugging Face |
| Alternativas on-device de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contexto limitado a 4.096 tokens: en la propia model card se documenta que, con una pregunta de competicion como prompt, el pensamiento agoto el contexto y no se emitio respuesta. Es imprescindible reservar presupuesto de tokens para el bloque de razonamiento.
- El flag `--thinking false` no desactivo el pensamiento con litert-lm 0.19.2; hay que asumir que el modelo siempre genera cadena de pensamiento y dimensionar el limite de tokens en consecuencia.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad fuera de matematicas; el modelo esta optimizado para problemas de competicion, no para aritmetica escolar ni para conocimiento general.
- Cobertura linguistica no documentada: la model card no especifica idiomas soportados.
- Cache del CLI: litert-lm (0.14.0 a 0.19.2) reutiliza un `model.litertlm` descargado previamente sin verificarlo contra el repositorio, por lo que una copia antigua o una descarga incompleta puede quedar en uso; hay que borrar el archivo y volver a ejecutar.
- En Android, la ruta GPU requiere LiteRT-LM 0.19.0 o superior.
- El archivo actual (16-11-2026) solo se ha probado con LiteRT-LM 0.19.0 (telefonos y Mac) y 0.19.1-0.19.2 (Mac); no se ha ejecutado en iOS.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base (Qwen3-4B, tambien Apache-2.0) y citar adecuadamente.
- Para produccion, validar el rendimiento real en el dispositivo objetivo: las cifras publicadas corresponden a hardware y versiones de runtime concretas y varian significativamente entre CPU y GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Polaris-4B-Preview
- Modelo base: https://huggingface.co/POLARIS-Project/Polaris-4B-Preview
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Polaris-4B-Preview
- Ficha de mediciones edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/polaris-4b/CARD.md

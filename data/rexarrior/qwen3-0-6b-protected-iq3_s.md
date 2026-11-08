# rexarrior/Qwen3-0.6B-Protected-IQ3_S

## Resumen

Qwen3-0.6B-Protected-IQ3_S es una cuantización GGUF del modelo Qwen3-0.6B de Alibaba Qwen, publicada por el usuario rexarrior bajo el marco de un experimento de compresión denominado "Protected IQ3". El artefacto parte del checkpoint oficial F32 de Qwen3-0.6B (596.049.920 parámetros) y aplica una mezcla de tipos de cuantización con protección selectiva de determinadas proyecciones, sin fine-tuning adicional. El resultado ocupa 318,66 MB en disco, lo que lo hace apto para entornos con recursos muy limitados.

La relevancia de esta ficha no reside en el modelo base —un transformer denso de 0,6 B de parámetros y contexto de 32.768 tokens, ya ampliamente conocido— sino en la metodología de cuantización: la mayoría de las 140 proyecciones usan IQ3_S, pero las 28 proyecciones de valor de atención y las 28 de down del MLP reciben bits extra (Q5_K en las tres primeras, Q4_K en las 53 restantes), el embedding/output head atado usa Q5_K y 113 tensores de normalización permanecen en F32. El autor publica además evaluaciones in-house y externas (BFCL v4, API-Bank, IFEval) que permiten juzgar el coste real de la compresión en tareas de tool calling e instrucciones estrictas.

Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo listo para producción: la licencia Apache 2.0 del modelo base se mantiene, pero los resultados publicados muestran degradaciones severas en tareas agénticas y de formato, lo que conviene tener en cuenta antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), basado en Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-0.6B soporta 32.768 tokens; el ejemplo de ejecucion usa `-c 2048`) |
| Tipos de cuantizacion | Mezcla IQ3_S / Q4_K / Q5_K / F32: 140 proyecciones en IQ3_S; 28 proyecciones de valor de atencion y 28 down del MLP con bits extra (las 3 primeras en Q5_K, las 53 restantes en Q4_K); embedding/output head atado en Q5_K; 113 tensores de normalizacion en F32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `Qwen3-0.6B-OpenResearch-Protected-IQ3_S.gguf`); tamano en disco 318,66 MB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3 con 596 millones de parametros. Esta publicacion no entrena ni ajusta el modelo: parte del checkpoint oficial F32 fijado en el commit `c1899de289a04d12100db370d81485cdf75e47ca` y aplica cuantizacion post-entrenamiento directamente sobre el. La innovacion tecnica es la estrategia de "proteccion": en lugar de cuantizar uniformemente, se asignan mas bits a las proyecciones consideradas mas sensibles (value de atencion y down del MLP), se mantiene el embedding/output head atado en Q5_K y se preservan 113 tensores de normalizacion en F32 para evitar errores de escala.

La calibracion utiliza la importance matrix distribuida por Unsloth en `unsloth/Qwen3-0.6B-GGUF`; el autor indica explicitamente que no reconstruyo el texto de calibracion original. No hay RLHF, DPO ni fine-tuning adicional en este artefacto. El repositorio incluye codigo de compresion, receta del modelo, ficheros de reproduccion, puntuaciones legibles por maquina (`evaluation.json`) y sumas de verificacion SHA-256.

## Capacidades

- Generacion de texto conversacional en el formato propio de Qwen3 (chat template con modo thinking opcional, heredado del modelo base).
- Razonamiento basico, codigo y matematicas a escala de 0,6 B de parametros, con la degradacion esperable por la cuantizacion IQ3_S.
- Tool calling / function calling: el autor evalua explicitamente trayectorias de uso de herramientas (BFCL v4, API-Bank), aunque con tasas de exito bajas.
- Seguimiento de instrucciones: evaluado con IFEval en modalidad estricta y laxa, tanto a nivel de prompt como de instruccion individual.
- Capacidades multilingues: no documentadas en esta publicacion; el autor solo reporta una prueba de "Strict English" (22/96).
- No se documentan capacidades de vision, audio ni modo thinking verificado en este artefacto.

## Casos de uso

- Prototipado en dispositivos de borde y CPUs: con 318,66 MB en disco, el GGUF cabe en telefonos, Raspberry Pi y portatiles sin GPU, permitiendo demos de generacion de texto con `llama-server` o `llama.cpp`.
- Investigacion sobre cuantizacion: el repositorio incluye receta, codigo y ficheros de reproduccion, lo que lo convierte en un caso de estudio controlado para medir el impacto de proteger determinadas proyecciones frente a una cuantizacion uniforme.
- Pruebas de regresion de pipelines de inferencia: util para validar que un motor GGUF (llama.cpp, Ollama) carga correctamente mezclas de tipos IQ3_S/Q4_K/Q5_K/F32 antes de escalar a modelos mayores.
- Generacion de texto offline en entornos air-gapped: al ser un unico fichero GGUF con checksums SHA-256 publicados, se puede desplegar en sistemas sin acceso a red para tareas de completado simple.
- Educacion y docencia: sirve para ilustrar el coste real de la compresion agresiva en tareas de tool calling, usando las metricas BFCL y API-Bank publicadas como material de discusion.
- Baseline de comparacion en experimentos de compresion: cualquier nueva tecnica de cuantizacion sobre Qwen3-0.6B puede contrastarse contra estas puntuaciones in-house y externas, que estan documentadas de forma reproducible.
- No recomendado para agentes autonomos en produccion: las tasas de BFCL multi turn (0,00 %) y memory (1,51 %) desaconsejan su uso en flujos agénticos reales.

## Benchmarks y rendimiento

Evaluaciones in-house publicadas por el autor (numero de aciertos sobre total de tareas):

| Prueba | Resultado |
|---|---:|
| Fresh tool-use trajectories | 4/48 |
| Known A6 trajectories | 4/48 |
| Known A8 trajectories | 5/48 |
| Next action from supplied history | 8/24 |
| Full continuation from supplied history | 8/24 |
| Strict English | 22/96 |
| Alice perplexity (menor es mejor) | 28,1534 |

Evaluaciones externas publicadas por el autor:

| Prueba | Resultado |
|---|---:|
| BFCL v4 · non-live | 41,71 % |
| BFCL v4 · live | 24,13 % |
| BFCL v4 · irrelevance | 77,25 % |
| BFCL v4 · live relevance | 43,75 % |
| BFCL v4 · multi turn | 0,00 % |
| BFCL v4 · memory | 1,51 % |
| BFCL v4 · format sensitivity | 10,19 % |
| API-Bank · llamadas correctas | 51/744 |
| IFEval · strict prompt | 283/541 |
| IFEval · strict instruction | 515/834 |
| IFEval · loose prompt | 303/541 |
| IFEval · loose instruction | 546/834 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que los conjuntos pequenos de tool-use e ingles son diagnosticos de investigacion y que las cifras de BFCL no constituyen una clasificacion completa del leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la configuracion cuantizada publicada (318,66 MB de pesos en disco); con overhead de contexto y KV cache para 2.048 tokens, el consumo tipico se mantiene por debajo de 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en A100/H100 pero el modelo esta muy por debajo de su capacidad.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `llama.cpp` y `llama-server` (comando de ejemplo en la model card), Ollama y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El autor solo reporta que la perplejidad se midio en CPU sobre 2.040 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| rexarrior/Qwen3-0.6B-Protected-IQ3_S | 596.049.920 | no disponible | GGUF, mezcla IQ3_S/Q4_K/Q5_K/F32 | apache-2.0 | Cuantizacion experimental con evaluaciones propias de tool calling e IFEval |
| Qwen/Qwen3-0.6B | 0,8 B (segun model card oficial) | 32.768 tokens (modelo base) | safetensors (F32/BF16) | apache-2.0 | Checkpoint original sin comprimir; referencia de calidad |
| unsloth/Qwen3-0.6B-GGUF | 0,6 B | 32.768 tokens (modelo base) | GGUF, cuantizaciones estandar (incluye la importance matrix usada aqui) | apache-2.0 | Alternativa de cuantizacion convencional sin proteccion selectiva |
| Qwen3-0.6B en Qualcomm AI Hub | 0,6 B | no disponible | Formato optimizado para NPU Hexagon | apache-2.0 | Despliegue en dispositivos Snapdragon |

No se dispone de comparativas de rendimiento publicadas entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa en tareas agénticas: BFCL multi turn 0,00 %, memory 1,51 % y format sensitivity 10,19 % indican que el modelo no es fiable para flujos con historial largo o multiples llamadas encadenadas.
- Tool calling limitado: 51/744 llamadas correctas en API-Bank y 41,71 % en BFCL non-live; no apto para produccion en integraciones de funciones.
- Seguimiento de instrucciones flojo: IFEval strict prompt 283/541 y strict instruction 515/834, con brecha notable entre modalidad estricta y laxa.
- Perplejidad elevada: 28,1534 sobre 2.040 tokens de *Alice in Wonderland*, coherente con una cuantizacion IQ3_S agresiva.
- Ingles estricto bajo: 22/96, lo que sugiere problemas de formato y correccion gramatical incluso en el idioma principal.
- Idiomas soportados no documentados: no hay evaluacion multilingue; no se debe asumir el soporte multilingue del modelo base sin verificar.
- Sesgos conocidos: no documentados en esta publicacion; se heredan los del checkpoint Qwen3-0.6B original, no evaluados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; esperable alto en un modelo de 0,6 B comprimido a IQ3_S.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y las evaluaciones publicadas desaconsejan uso en produccion sin validacion propia.
- Reproducibilidad: la calibracion usa la importance matrix de Unsloth sin reconstruir el texto original, por lo que la receta exacta de calibracion no es completamente replicable desde cero.
- Contexto: aunque el modelo base soporta 32.768 tokens, el ejemplo de la model card arranca `llama-server` con `-c 2048`; no se documenta el comportamiento a contextos largos tras la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rexarrior/Qwen3-0.6B-Protected-IQ3_S
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Checkpoint fijado del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Repositorio del proyecto (codigo de compresion y experimentos): https://github.com/Rexarrior/qwen3-compression-lab
- Receta del modelo: https://github.com/Rexarrior/qwen3-compression-lab/blob/main/models/protected-iq3.md
- Ficheros de metodo y reproduccion: https://huggingface.co/rexarrior/Qwen3-0.6B-Protected-IQ3_S/tree/main/method
- Importance matrix de calibracion (Unsloth): https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Guia de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b

# prithivMLmods/Qwen3.8-27B-super-adapter-GGUF

## Resumen

Qwen3.8-27B-super-adapter-GGUF es una cuantización en formato GGUF del checkpoint fusionado Qwen3.8-27B-super-adapter, publicado por el usuario prithivMLmods. El modelo parte de Qwen/Qwen3.8-27B y le incorpora, mediante fusión de LoRA por concatenación, tres adaptadores especialistas entrenados con AsyncGRPO para entornos de agentes (pi, Hermes Agent y OpenCode) sobre tareas de ingeniería de software y terminal en Harbor/OpenEnv. El resultado es un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) orientado a uso agéntico, con soporte multimodal de imagen a texto y decodificación especulativa mediante Multi-Token Prediction (MTP) integrada en los pesos.

La relevancia de esta publicación es doble. Por un lado, empaqueta en un único artefacto servible sin soporte de LoRA un modelo ajustado para tareas de agente con terminal y edición de código, algo útil para despliegues en motores de inferencia que no gestionan adaptadores. Por otro, ofrece cuantizaciones K-quant de llama.cpp con un rango de 15,8 GB a 29 GB, lo que permite ejecutar un modelo de 27B en hardware de consumo de gama alta, además de un fichero de proyección multimodal (mmproj) para las capacidades de visión.

El autor declara mejoras de rendimiento medidas sobre el adaptador en el modelo base BF16: pass@1 medio de 55,5 % a 63,5 % en SWE-bench Pro (hard 51) y Terminal-Bench 2.1 con thinking activado, con 19–48 % menos llamadas a herramientas por tarea; con thinking desactivado, de 39,5 % a 49,0 % con 53–73 % menos llamadas. Estas cifras no se han reevaluado sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con cabezas MTP para decodificacion especulativa y proyeccion multimodal para vision |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0; mmproj en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el base del que deriva se publica en BF16 |

## Arquitectura y entrenamiento

El modelo deriva de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,3 mil millones de parámetros, al que se le aplica una fusión de LoRA sin entrenamiento adicional. La técnica empleada es concatenación (`combination_type="cat"`) con rango 96 (3 × 32, correspondiente a tres adaptadores de rango 32) y peso de ½ por adaptador sobre las proyecciones q, k, v, o, gate, up y down. La actualización se aplica por tensor en fp32 con la fórmula estándar `W + (alpha/r)·B@A` y se convierte de nuevo a BF16, preservando el particionado de shards, los nombres de tensores y todos los tensores MTP del modelo base.

Los tres adaptadores fusionados fueron entrenados con AsyncGRPO (una variante asíncrona de GRPO con refuerzo) para tres entornos de agente distintos: pi, Hermes Agent y OpenCode, todos ellos operando en entornos Harbor/OpenEnv sobre tareas de ingeniería de software y uso de terminal. Los datasets citados en la model card son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments. La innovación destacable es la integración de MTP en el propio GGUF: en lugar de requerir un modelo borrador separado para decodificación especulativa, el fichero incluye cabezas adicionales que predicen varios tokens futuros en una sola pasada, acelerando la inferencia local.

## Capacidades

- Generación de texto conversacional en inglés con soporte de modo thinking (el autor recomienda `xhigh` para el adaptador).
- Razonamiento multi-paso orientado a agentes, con reducción declarada del número de llamadas a herramientas por tarea.
- Uso de herramientas y ejecución en terminal: los adaptadores se entrenaron específicamente en tareas de terminal y flujos de agente tipo OpenCode y Hermes Agent.
- Edición y resolución de problemas de código en repositorios (orientado a SWE-bench Pro).
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text, con fichero mmproj-bf16 para el proyector visual).
- Decodificación especulativa nativa mediante MTP integrado en los pesos.
- Compatibilidad con endpoints de inferencia (tag endpoints_compatible) y con text-generation-inference.
- Idiomas: únicamente inglés declarado; no se documentan capacidades multilingües.

## Casos de uso

- Agente de terminal automatizado: el modelo puede recibir un objetivo, inspeccionar el sistema de ficheros, ejecutar comandos y corregir errores en varios pasos; los adaptadores se entrenaron en Terminal-Bench y entornos Harbor, por lo que el formato de interacción con shell es el dominio principal.
- Resolución de issues en repositorios: integrado en un pipeline que clona el repositorio, reproduce el fallo y genera un parche, aprovechando el ajuste sobre SWE-bench Pro y la reducción de llamadas a herramientas declarada.
- Asistente de programación en IDE o CLI: con modo thinking activado y soporte de tool calling, encaja en flujos tipo OpenCode para edición multiarchivo con verificación mediante ejecución de tests.
- Automatización de tareas de mantenimiento de software: actualización de dependencias, migraciones de código y limpieza de deuda técnica, donde la ventana de contexto (no documentada) debe validarse empíricamente antes de usarla con repositorios grandes.
- Procesamiento de capturas y documentación técnica: gracias al proyector multimodal mmproj, puede interpretar imágenes (diagramas, errores en pantalla) junto con texto en un flujo de soporte técnico.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S (15,8 GB) y Q4_K_M (17 GB) permiten servir el modelo con llama.cpp en una única GPU de 24 GB, útil para equipos de desarrollo que necesitan un agente de código sin depender de la nube.
- Evaluación e investigación en RL para agentes: al estar construido sobre adaptadores AsyncGRPO publicados, sirve como referencia reproducible para estudiar fusión de adaptadores y su efecto en tareas agénticas.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del adaptador base y fueron medidos sobre el modelo BF16 con el adaptador, no sobre este checkpoint fusionado ni sobre las cuantizaciones.

| Benchmark | Sin thinking (adaptador) | Con thinking (adaptador) | Variacion |
|---|---|---|---|
| SWE-bench Pro (hard 51) + Terminal-Bench 2.1, pass@1 medio | 39,5 % | 63,5 % (base: 55,5 %) | +8,0 puntos con thinking; +9,5 sin thinking |
| Llamadas a herramientas por tarea | 53–73 % menos | 19–48 % menos | Reduccion respecto al base |

No se han publicado resultados de benchmarks de MMLU, HumanEval, GSM8K ni otros en la informacion disponible, ni evaluaciones de este GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas overhead de contexto y cache KV. Q4_K_S ~15,8 GB, Q4_K_M ~17 GB, Q5_K_S ~19 GB, Q5_K_M ~19,6 GB, Q8_0 ~29 GB. El proyector visual anade ~931 MB.
- GPU de consumo: Q4_K_S y Q4_K_M caben en GPUs de 24 GB (RTX 3090, RTX 4090); Q5 requiere 24 GB con contexto moderado; Q8_0 necesita 32 GB o mas (por ejemplo, RTX 5090 de 32 GB o configuracion multi-GPU).
- GPU profesionales: A100 40/80 GB, H100 y L40S admiten cualquier cuantizacion con contexto amplio; para BF16 completo (no incluido en este repo) se necesitarian del orden de 55 GB de pesos mas cache.
- Despliegue: llama.cpp es el motor de referencia para estos ficheros GGUF; tambien es posible servir el modelo base fusionado con vLLM o TGI, aunque este repositorio solo distribuye GGUF. Ollama puede importar los GGUF, pero la decodificacion especulativa MTP depende del soporte del runtime.
- Latencia y throughput: no disponibles. La model card solo declara que MTP acelera la inferencia local frente a decodificacion especulativa con modelo borrador separado, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF Q4–Q8 + mmproj | Ajustado para agentes de terminal y codigo; MTP integrado |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | no disponible en la informacion | Pesos originales del autor de Qwen | Sin los adaptadores agénticos; referencia de partida |
| harness-hub/Qwen3.8-27B-super-adapter (BF16) | 27,3 B | no disponible | Apache 2.0 | Safetensors BF16 | Mismo modelo sin cuantizar; requiere motor con soporte BF16 y ~55 GB |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la informacion proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Las mejoras de pass@1 y de reduccion de llamadas a herramientas fueron medidas sobre el adaptador en el modelo base BF16 y no se han reevaluado en este checkpoint fusionado ni en las cuantizaciones; las cifras pueden degradarse con Q4.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- La longitud de contexto no se especifica en la informacion disponible; es un parametro critico para tareas agenticas con repositorios grandes y debe medirse antes de produccion.
- Riesgo de alucinacion inherente a modelos de 27B en tareas de codigo: los parches generados deben validarse con tests automatizados antes de aplicarse.
- El modo thinking es el recomendado por el autor (`xhigh`); desactivarlo reduce calidad (39,5 % frente a 63,5 % en la metrica declarada) aunque disminuye llamadas a herramientas.
- No se documentan sesgos especificos ni evaluaciones de seguridad; el ajuste con RL sobre entornos de terminal puede producir comportamientos de ejecucion agresivos si no se aplican sandbox y limites de permisos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen puede tener terminos propios que conviene verificar en su repositorio original.
- El repositorio ocupa 101,4 GB e incluye varias cuantizaciones; conviene descargar solo el fichero necesario.
- La fecha de creacion indicada (2026-11-20) y la denominacion "Qwen3.8" no coinciden con versiones publicas conocidas de Qwen en el momento de redactar esta ficha; verificar la procedencia y los pesos antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments

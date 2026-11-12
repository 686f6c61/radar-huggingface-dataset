# bacillad/qwen36-35b-a3b-colibri-i4-gs64

## Resumen

`bacillad/qwen36-35b-a3b-colibri-i4-gs64` es un contenedor de cuantizacion para el modelo Qwen3.6-35B-A3B (Qwen), empaquetado en formato colibri con cuantizacion int4 de escala agrupada (group-scaled) de 64 elementos. No es un modelo nuevo ni un fine-tune: es una redistribucion de pesos del modelo base de Qwen en un formato optimizado para el motor de inferencia colibri, pensado para ejecucion en CPU y GPU con un consumo de memoria de aproximadamente 22 GB. Lo publica el usuario `bacillad`, a partir del trabajo del motor colibri de JustVugg y del conversor original de `minne100`.

La relevancia de esta variante frente al contenedor int4 por fila del mismo autor (per-row) es una mejora medible de precision: en un A/B controlado contra un ancla int8, reduce el error de logits del primer token en un 44 % (coseno medio 0.98777 → 0.99313) y la divergencia KL media de 0.1091 a 0.0795, con un coste de tamano de solo un 10 % (20 → 22 GB) y sin perdida de velocidad de decodificacion. Esta pensado para quienes necesitan la mejor calidad posible en int4 dentro del ecosistema colibri, aceptando la dependencia de una rama del motor aun no fusionada en upstream.

El modelo base Qwen3.6-35B-A3B es un transformer MoE (Mixture of Experts) de 35 000 millones de parametros totales con 3 000 millones activos por token, aunque la model card del contenedor no detalla especificaciones adicionales del modelo original (contexto, composicion del dataset, idiomas). La licencia es Apache-2.0 en ambos niveles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Qwen3.6-35B-A3B); contenedor de inferencia colibri |
| Parametros totales | 35B (modelo base); contenedor int4 ~22 GB |
| Parametros activos | 3B (modelo base, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 group-scaled (`expert_gs=64`, una escala f32 por cada 64 elementos de entrada por fila) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Contenedor colibri (`.qs` arrays con escalas f32, `qwen36_meta.json`, `config.json` plano, `tokenizer.json` incluido); no es safetensors ni GGUF |
| Tamano del repositorio | 23.0 GB |
| Escala de grupo | `expert_gs: 64` (un f32 por 64 elementos de entrada por fila de salida) |
| Layout de escalas | `[O][I/gs]` row-major |
| Libreria | colibri |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

El contenedor no incluye informacion sobre el entrenamiento del modelo base mas alla de su procedencia (Qwen/Qwen3.6-35B-A3B, Apache-2.0). La arquitectura del modelo base es un transformer con capas MoE, tal como indica su nombre (35B totales, 3B activos). El contenedor en si no modifica la arquitectura ni los pesos en cuanto a valores: solo aplica una cuantizacion int4 con escalas de grupo para los expertos, manteniendo el resto del pipeline de inferencia del motor colibri.

La innovacion tecnica relevante esta en el esquema de cuantizacion: en lugar de una escala f32 por fila (per-row), se almacena una escala f32 por cada 64 elementos de entrada por fila de salida (`expert_gs=64`). Esto reduce el error de cuantizacion a costa de un 10 % mas de tamano. El motor lee `expert_gs` de `qwen36_meta.json` y selecciona automaticamente el GEMV con escalas de grupo (`matmul_q_gs`), sin necesidad de flags adicionales. La ruta de codigo `matmul_q_gs` reside en la rama `gs64-ab` del repositorio de colibri de Kreuzzelg y esta pendiente de fusion en upstream; el contenedor per-row equivalente funciona en la rama principal `qwen36-engine`. El motor soporta compilacion para CPU y para GPU (`CUDA=1 CUDA_ARCH=native`).

## Capacidades

- Generacion de texto autoregresiva con el modelo base Qwen3.6-35B-A3B; no se documentan capacidades adicionales especificas del contenedor.
- Razonamiento en modo greedy: la model card indica que en 4 prompts de razonamiento con generacion greedy de 512 tokens no se observaron bucles degenerados en ninguna de las dos variantes int4.
- Eficiencia MoE: al activar solo 3B de los 35B parametros por token, el coste computacional por token es bajo en relacion al tamano total del modelo.
- Capacidades multilingues, tool calling, function calling, agentes y vision: no disponibles en la informacion proporcionada (dependen del modelo base, no documentado aqui).
- Thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en CPU de un modelo de 35B con 3B activos: el contenedor de 22 GB permite ejecutar un MoE grande en maquinas sin GPU de gran VRAM, usando el motor colibri compilado para CPU (`make -C c qwen36`). Adecuado para prototipado y evaluacion offline.
- Despliegue en GPU consumer con memoria limitada: la cuantizacion int4 reduce el peso a ~22 GB, lo que encaja en GPUs de 24 GB o en configuraciones multi-GPU de gama consumer, manteniendo la precision superior del esquema gs64 frente al per-row.
- Evaluacion comparativa de esquemas de cuantizacion: investigadores que midan el impacto de group scaling frente a per-row en modelos MoE pueden usar este contenedor junto con el per-row de Kreuzzelg para reproducir el A/B de logits (coseno, KL) documentado en la model card.
- Investigacion en decodificacion y analisis de logits: el contenedor permite acceder a la distribucion de logits del primer token con mayor fidelidad al modelo en int8 (coseno 0.99313), util para estudios de calibracion y alineamiento.
- Generacion de texto de razonamiento en entornos con restricciones de hardware: para tareas de razonamiento que requieran un modelo de 35B pero con presupuesto de memoria ajustado, el esquema gs64 ofrece mejor calidad que el per-row al mismo coste de velocidad de decodificacion.
- Desarrollo sobre el motor colibri: sirve como caso de prueba para la rama `gs64-ab` y para validar la ruta `matmul_q_gs` antes de su fusion upstream, incluyendo la compilacion CPU y CUDA.

## Benchmarks y rendimiento

La model card presenta un A/B controlado contra un ancla int8, con el mismo modelo base y motor, sobre 4 prompts:

| Metrica | per-row int4 | gs64 int4 |
|---|---|---|
| Coseno de logits (media, 4 prompts) | 0.98777 | **0.99313** |
| Divergencia KL (media) | 0.1091 | **0.0795** |
| Tamano del contenedor | ~20 GB | ~22 GB |
| Velocidad de decodificacion | referencia | sin cambios |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~22 GB para el contenedor completo en int4 gs64; el per-row ocupa ~20 GB. En CPU, la memoria RAM necesaria es equivalente al tamano del contenedor mas overhead del motor.
- GPU recomendadas: no disponibles explicitamente; por tamano, encaja en GPUs de 24 GB (RTX 3090, RTX 4090) y en A100/H100 para mayor margen. El motor soporta compilacion CUDA (`CUDA=1 CUDA_ARCH=native`).
- Cabe en GPU consumer: si, en modelos de 24 GB; en GPUs de 16 GB requeriria tecnicas adicionales no documentadas.
- Opciones de despliegue: motor colibri (rama `gs64-ab` de kreuzzelg/colibri o rama `qwen36-engine` para el per-row). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card indica que la velocidad de decodificacion es identica a la del contenedor per-row; no se proporcionan cifras absolutas de tokens por segundo.
- Hilos de CPU: el ejemplo de ejecucion recomienda `OMP_NUM_THREADS` igual al numero de nucleos fisicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bacillad/qwen36-35b-a3b-colibri-i4-gs64 | 35B totales, 3B activos | no disponible | colibri int4 gs64 | Apache-2.0 | Mayor precision, requiere rama `gs64-ab` |
| Kreuzzelg/qwen36-35b-a3b-colibri-i4 | 35B totales, 3B activos | no disponible | colibri int4 per-row | Apache-2.0 | Default de PR, rama principal, ~20 GB |
| Qwen/Qwen3.6-35B-A3B | 35B totales, 3B activos | no disponible | safetensors (probable) | Apache-2.0 | Modelo base sin cuantizar |

No se dispone de datos de rendimiento estandar para comparar con otras alternativas fuera del ecosistema colibri.

## Limitaciones y advertencias

- Dependencia de una rama no fusionada: el contenedor requiere la rama `gs64-ab` del repositorio de colibri (ruta `matmul_q_gs`); en la rama principal no funciona.
- Formato propietario del motor colibri: no es compatible con vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y el ecosistema de herramientas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni garantias de mantenimiento.
- Cifras de precision basadas en solo 4 prompts y un A/B controlado; no sustituyen una evaluacion extensa en tareas reales.
- Sin informacion sobre sesgos, alucinacion, idiomas ni limitaciones de contexto del modelo base en la model card del contenedor.
- El autor del contenedor es un tercero (`bacillad`), no Qwen; la calidad del empaquetado y la procedencia de los pesos no estan auditadas en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial del contenedor, pero conviene verificar los terminos del modelo base Qwen3.6-35B-A3B por separado.
- No se documentan requisitos de VRAM absolutos ni latencias medidas; las estimaciones de hardware se derivan del tamano del contenedor.

## Enlaces

- Hugging Face: https://huggingface.co/bacillad/qwen36-35b-a3b-colibri-i4-gs64
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Contenedor per-row de referencia: https://huggingface.co/Kreuzzelg/qwen36-35b-a3b-colibri-i4
- Motor colibri (JustVugg): https://github.com/JustVugg/colibri
- Rama gs64-ab: https://github.com/kreuzzelg/colibri/tree/gs64-ab
- Pull request original del motor qwen36: https://github.com/JustVugg/colibri/pull/602
- Perfil del autor del conversor original: https://huggingface.co/minne100

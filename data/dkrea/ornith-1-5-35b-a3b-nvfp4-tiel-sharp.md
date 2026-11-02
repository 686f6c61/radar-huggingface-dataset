# dkrea/Ornith-1.5-35B-A3B-NVFP4-Tiel-Sharp

## Resumen

Este repositorio no contiene pesos de un modelo, sino un artefacto de despliegue: una plantilla de chat (`chat_template.jinja`, 44 KB) y una receta de servicio para vLLM sobre el checkpoint oficial NVFP4 `ornith-ai/Ornith-1.5-35B-A3B-NVFP4`. Lo publica el usuario dkrea y empaqueta la plantilla Tiel-Coder de peculiar-ragdoll, derivada de Qwen-Sharp-Chat-Templates v22.5.0, que a su vez parte de Qwen-Fixed-Chat-Templates de froggeric. El objetivo es reproducir el comportamiento de Tiel-Coder-35B-A3B (variante con cuantizaciones GGUF imatrix) cuando la ruta GGUF de vLLM no carga correctamente la arquitectura `qwen35moe`.

El modelo subyacente es Ornith-1.5-35B-A3B, un MoE de ornith-ai con 35B parámetros totales y 3B activos, del que se distribuye un checkpoint cuantizado en NVFP4 de 23,5 GB. La plantilla añade identidad Tiel-Coder, un modo de razonamiento configurable (`low`, `medium`, `xhigh`, con `none`/`off` para desactivar el thinking), un system prompt de concisión y reglas de tool calling en XML.

Su relevancia es práctica: documenta una configuración verificada de vLLM 0.30 con tensor parallel en dos GPU Blackwell (sm120), decodificación especulativa MTP con 5 tokens de borrador y un rendimiento de decodificación de 210-295 tok/s por stream. Es material de referencia para quien quiera servir este MoE en FP4 sin pasar por GGUF, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo `qwen35moe` (transformer con mezcla de expertos); checkpoint con cabeza MTP |
| Parametros totales | 35B (según nomenclatura del modelo base) |
| Parametros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | 98 000 tokens en la receta de servicio (`--max-model-len 98000`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 (checkpoint oficial de ornith-ai); el ecosistema Tiel-Coder ofrece GGUF imatrix UD-Q4_K_XL |
| Idiomas soportados | no disponible |
| Licencia | Plantilla: Apache-2.0; pesos: MIT (ornith-ai) |
| Formato de pesos | safetensors NVFP4 (no incluidos en este repo); GGUF en el repo Tiel-Coder de peculiar-ragdoll |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 35B parámetros totales y 3B activos, identificado en vLLM con la arquitectura `qwen35moe`, lo que sugiere una línea derivada de la familia Qwen 3.5. El checkpoint NVFP4 incluye una cabeza MTP (multi-token prediction) que se usa como decodificación especulativa en el servidor. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información proporcionada.

La aportación de este repositorio es la capa de plantilla: Tiel-Coder aplica Qwen-Sharp-Chat-Templates v22.5.0 con dos líneas de sistema propias que comienzan por "You are Tiel-Coder, a variant of Ornith-1.5-35B-A3B". Mantiene el `reasoning_effort` por defecto en `medium`, el system prompt de concisión y las reglas de tool calling en XML. La plantilla es byte-idéntica a la del GGUF de Tiel-Coder (sha256 `a41d3a64...f3f6422`), pero la cuantización es distinta (NVFP4 frente a GGUF Q4_K_XL), por lo que los resultados pueden diferir de los publicados por Tiel-Coder.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con vLLM.
- Razonamiento con modo thinking configurable: `low`, `medium` (por defecto), `xhigh`; `none`/`off` lo desactiva.
- Tool calling / function calling mediante parser `qwen3_xml` y `--enable-auto-tool-choice`.
- Parsing de razonamiento con `--reasoning-parser qwen3`.
- Orientación a código: la plantilla y los benchmarks del autor se centran en tareas de programación agéntica.
- Decodificación especulativa vía cabeza MTP (5 tokens de borrador en la receta).
- Capacidades multilingües: no disponible.
- Visión y audio: no disponibles; el servicio se lanza con `--language-model-only`.

## Casos de uso

- Servicio de código agéntico en producción: la receta de vLLM con tool calling XML y contexto de 98k permite integrar el modelo en pipelines que ejecutan tests, aplican parches y validan resultados en varios pasos.
- Asistentes de programación con razonamiento ajustable: el `reasoning_effort` permite bajar a `low` para autocompletado rápido y subir a `xhigh` para depuración de defectos complejos sin cambiar de modelo.
- Migración desde GGUF a FP4: equipos que ya usan Tiel-Coder en llama.cpp pueden replicar el comportamiento de plantilla sobre NVFP4 en vLLM cuando la ruta GGUF falla con `qwen35moe`.
- Despliegue en GPU Blackwell: el checkpoint NVFP4 de 23,5 GB y el tensor parallel a 2 GPU encajan en nodos sm120 para inferencia de baja latencia (210-295 tok/s por stream).
- Evaluación comparativa de cuantizaciones: al compartir plantilla con el GGUF, permite aislar el efecto de NVFP4 frente a Q4_K_XL en la misma tarea.
- Generación de código en CI/CD: tareas compactas de codegen con ventana de 32k y validación automática de tests, donde el autor reporta 15/15 celdas merge-ready en tres ejecuciones.
- Chat conversacional con contexto largo: la ventana de 98k configurada sirve para conversaciones o documentos extensos, aunque el throughput cae con `--max-num-seqs 2`.

## Benchmarks y rendimiento

Resultados del autor en benchmarks privados, no comparables con leaderboards públicos. Ejecutados con MTP 3 y la ventana propia de cada benchmark.

| Benchmark | Ejecuciones | Resultado |
|---|---|---|
| codegen-compact-v1 (5 problemas pequeños, 32k, agéntico) | 3 | Todos los tests pasan en todas las ejecuciones; 15/15 celdas calificadas merge-ready por dos jueces ciegos; puntuación compacta 95,3-97,2/100; ~4,5x más rápido en tiempo real que el baseline Qwen3.8-27B |
| codegen-hard-v3 (una tarea agéntica mayor, 49k) | 1 | 22/22 tests en 3,6 min; jueces califican "rework" (calidad 18,75/100) por un defecto lógico en runtime no cubierto por los tests |

Rendimiento de servicio medido: 210-295 tok/s de decodificación por stream único con tensor parallel 2, MTP 5 y muestreo temperatura 0,6, top_p 0,95, top_k 20, repetition_penalty 1,05.

## Requisitos de hardware

- Pesos NVFP4: 23,5 GB en disco; requieren GPU con soporte FP4 (Blackwell, sm120).
- Configuración probada: tensor parallel 2 sobre dos GPU Blackwell, `--gpu-memory-utilization 0.88`.
- VRAM: no se indica cifra exacta; con 23,5 GB de pesos y reparto en 2 GPU más caché KV para 98k de contexto, se necesita margen adicional no cuantificado en la información disponible.
- GPU consumer: no disponible confirmación; el formato NVFP4 y la arquitectura sm120 apuntan a Blackwell, no a generaciones anteriores.
- Despliegue: vLLM 0.30.0 (probado); vLLM 0.32 citado para autotune. Alternativa GGUF vía llama.cpp con los cuantos de peculiar-ragdoll.
- Throughput: 210-295 tok/s por stream con MTP 5; `--max-num-seqs 2` y `--max-num-batched-tokens 2048` limitan el batching.
- Nota operativa: `--no-enable-flashinfer-autotune` evita un cuelgue multi-rank en vLLM 0.30; en 0.32 no cuelga y no aporta ganancia en decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Ornith-1.5-35B-A3B NVFP4 + Tiel-Sharp) | 35B totales / 3B activos | 98k en la receta | NVFP4 | Apache-2.0 (plantilla), MIT (pesos) | vLLM 0.30+ |
| Tiel-Coder-35B-A3B GGUF (peculiar-ragdoll) | 35B totales / 3B activos | no disponible | GGUF imatrix UD-Q4_K_XL | MIT | llama.cpp y derivados |
| Qwen3.8-27B (baseline citado por el autor) | 27B | no disponible | no disponible | no disponible | no disponible |

La comparación con Qwen3.8-27B solo está respaldada por la afirmación del autor de que la receta es ~4,5x más rápida en tiempo real en codegen-compact-v1; no se aportan cifras de calidad comparadas.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: solo una plantilla y una receta; sin el checkpoint de ornith-ai no es funcional.
- Los benchmarks son privados y no comparables con leaderboards públicos; el propio autor los califica de indicativos.
- En codegen-hard-v3 los tests pasaron pero los jueces detectaron un defecto lógico en runtime: la validación por tests no garantiza corrección.
- La cuantización NVFP4 difiere del GGUF Q4_K_XL de Tiel-Coder; el comportamiento puede no coincidir con el del modelo original.
- Requiere hardware Blackwell (sm120); no hay datos de funcionamiento en GPU anteriores.
- El contexto de 98k es una configuración de servicio, no necesariamente el máximo nativo del modelo.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Restricciones comerciales: plantilla Apache-2.0 y pesos MIT permiten uso comercial, pero la plantilla incorpora trabajo de terceros (peculiar-ragdoll, froggeric) cuyas condiciones conviene verificar.
- El modo thinking por defecto (`medium`) incrementa tokens generados y latencia; requiere ajuste por caso de uso.

## Enlaces

- Repositorio de la plantilla y receta: https://huggingface.co/dkrea/Ornith-1.5-35B-A3B-NVFP4-Tiel-Sharp
- Checkpoint NVFP4 oficial: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Modelo base sin cuantizar: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia de los pesos: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- GGUF de Tiel-Coder: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Plantillas Qwen-Sharp-Chat-Templates: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Plantillas Qwen-Fixed-Chat-Templates: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Perfil del autor de la plantilla: https://huggingface.co/peculiar-ragdoll

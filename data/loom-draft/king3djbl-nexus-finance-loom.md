# loom-draft/King3Djbl-nexus-finance-loom

## Resumen

King3Djbl-nexus-finance-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `King3Djbl/nexus-finance-GGUF`, en su cuantización Q4_K_M. No se trata de un modelo entrenado desde cero, sino de un artefacto de empaquetado orientado a servir ese GGUF sobre GPUs AMD concretas: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU de estación de trabajo AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El generador utilizado es `loom-next`, que según la model card opera sin LLM en el bucle.

La relevancia del paquete es fundamentalmente de infraestructura: proporciona un preset de servicio con backend ROCm/HIP para hardware AMD, una API compatible con OpenAI (`/v1/chat/completions`) y soporte declarado de tool calling. La model card incluye mediciones comparativas frente a llama.cpp ROCm `llamacpp-rocm/b1374` sobre Strix Halo, con mejoras notables en prefill (hasta +250 % en documentos de 1k tokens) y un rendimiento inferior en decode con contexto largo (-47 % a 32k).

La información pública disponible es muy escasa: cero descargas y cero likes en el momento de redactar esta ficha, sin pipeline declarado, sin idiomas declarados y sin datos sobre arquitectura, número de parámetros o longitud de contexto del modelo subyacente. El nombre "nexus-finance" sugiere un ajuste fino orientado a dominio financiero, pero no hay documentación que lo confirme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente: `King3Djbl/nexus-finance-GGUF`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible para el modelo; el preset de servicio usa `-c 65536` en la comparación con llama.cpp y mide decode a ~32k tokens |
| Tipos de cuantizacion | Q4_K_M (única cuantización empaquetada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`nexus-finance-q4_k_m.gguf`) empaquetado como paquete Loom (`.loom` + `model.json`) |
| Modelo base | `King3Djbl/nexus-finance-GGUF` (finetune) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Sí (formato OpenAI `tools` y `tool_calls`) |
| Modo razonamiento / thinking | no aplicable según la model card |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo subyacente `King3Djbl/nexus-finance-GGUF`: la model card del paquete Loom no describe el transformer, el número de parámetros, los datos de entrenamiento, el volumen de tokens ni si hubo RLHF, DPO u otras etapas de alineamiento. El autor del paquete no ha entrenado el modelo; se limita a empaquetar el GGUF Q4_K_M existente para el runtime Loom.

La innovación técnica documentada está en la capa de servicio, no en el modelo. El paquete incluye un preset de ejecución con opciones como `completion_spin_ns=4294967295` (espera activa de las completaciones de GPU, que consume CPU mientras hay trabajo en vuelo), `pool_backing=fixed` (reserva del pool de memoria por adelantado en lugar de crecimiento elástico) y `parameter_mode=preload` (carga de pesos en host). La model card indica explícitamente que no se aplicó decodificación especulativa: el GGUF no incluye cabeza MTP y no hay drafter publicado para este modelo exacto.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`), con parámetro `model` y mensajes en formato chat.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), lo que permite integración con frameworks de agentes que hablan el protocolo OpenAI.
- Servicio multi-stream: la comparativa mide 4 peticiones paralelas con agregación de throughput (539,6 tok/s agregados en Loom frente a 417,6 en llama.cpp sobre Strix Halo).
- Procesamiento de prompts largos: se miden prefill sobre documentos de 1k, 2k, 8k, 16k y 32k tokens.
- Capacidades específicas de dominio financiero: no documentadas, solo sugeridas por el nombre del checkpoint base.
- Modo de razonamiento o thinking: la model card lo marca como no aplicable.
- Capacidades multimodales (visión, audio): no disponibles.
- Soporte multilingüe: no disponible.

## Casos de uso

- Servicio de asistencia financiera sobre hardware AMD de sobremesa: el paquete permite levantar un endpoint compatible con OpenAI en un Strix Halo o una R9700 con dos comandos (`loom-fetch` y `loom-serve`), adecuado para prototipos de asistentes de dominio financiero sin depender de GPUs NVIDIA.
- Procesamiento por lotes de documentos largos: el prefill medido en Loom (7.479 tok/s en documentos de 1k y 3.344 tok/s en 32k sobre Strix Halo) supera ampliamente a llama.cpp en esta fase, lo que favorece cargas de resumen o extracción sobre documentos extensos donde el coste dominante es el prefill.
- Agentes con tool calling: al exponer `tools` y `tool_calls` en formato OpenAI, puede conectarse a orquestadores de agentes existentes para tareas como consulta de datos, cálculo o recuperación de información estructurada.
- Despliegue en estación de trabajo con Radeon AI PRO R9700: la GPU de 32 GB permite alojar el GGUF Q4_K_M con margen para contexto adicional, orientado a entornos de desarrollo y validación en hardware AMD profesional.
- Evaluación comparativa de runtimes: el paquete sirve como banco de pruebas reproducible para medir Loom frente a llama.cpp ROCm sobre el mismo GGUF y los mismos prompts, útil para equipos que evalúan migraciones de runtime.
- Servicio multi-usuario ligero: con 4 streams agregando 539,6 tok/s en Strix Halo, puede atender varias conversaciones concurrentes en un único equipo, adecuado para equipos pequeños o demos internas.
- Inferencia en local con requisitos de privacidad: al ejecutarse íntegramente en hardware local vía Loom, encaja en escenarios donde los datos financieros no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

La model card incluye mediciones sobre AMD Strix Halo (gfx1151) comparando Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374`, con el mismo GGUF, runner y prompts. Valores en tokens por segundo, mediana de 6 sesiones.

| Métrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode, prompt corto | 158,2 | 162,0 | +2 % |
| Decode, contexto 2k | 157,9 | 145,5 | -8 % |
| Decode, contexto 32k | 157,7 | 83,7 | -47 % |
| Prefill, documento 1k | 2136,4 | 7479,1 | +250 % |
| Prefill, documento 2k | no medido | 7299,5 | no disponible |
| Prefill, documento 8k | 2139,1 | 6353,5 | +197 % |
| Prefill, documento 16k | no medido | 4899,5 | no disponible |
| Prefill, documento 32k | no medido | 3344,1 | no disponible |
| 4 streams, decode agregado | 417,6 | 539,6 | +29 % |
| Decodificación especulativa | n/a | n/a | n/a |

Condiciones: llama.cpp con `-ngl 99 -cram 0 -c 65536 -np 1`; Loom con espera activa; sin barrido de tuning en ninguno de los dos motores; medido el 2026-11-27 en runners AMD DevLab Dispatch (X2-LA03-S03-D07), Linux, `hrx-loom` 0.2.0. La roofline no se calculó. Para la Radeon AI PRO R9700 (gfx1201, 32 GB), la model card indica que los resultados de este paquete aún no se han vuelto a medir.

No hay benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que se desconoce el número de parámetros. El único dato objetivo es que la Radeon AI PRO R9700 objetivo tiene 32 GB y que el preset se sirve con pool de memoria fijo.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que está generado específicamente para dispositivos AMD vía `amdgpu://`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/King3Djbl-nexus-finance-loom:chat --materialize=copy --output=nexus-finance` y `loom-serve --model=nexus-finance '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput medidos en Strix Halo: 162,0 tok/s de decode en prompt corto, 83,7 tok/s a 32k de contexto, 7.479 tok/s de prefill en 1k y 539,6 tok/s agregados con 4 streams.
- En R9700: sin mediciones publicadas para este paquete.

## Comparativa con modelos similares

No hay información suficiente para comparar con modelos de la misma categoría, ya que se desconocen los parámetros, el contexto y los benchmarks de calidad del modelo subyacente. La comparativa disponible es de runtime, no de modelo:

| Aspecto | Loom (este paquete) | llama.cpp ROCm b1374 |
|---|---|---|
| Pesos | Mismo GGUF Q4_K_M | Mismo GGUF Q4_K_M |
| Hardware medido | Strix Halo (gfx1151) | Strix Halo (gfx1151) |
| Decode, prompt corto | 162,0 tok/s | 158,2 tok/s |
| Decode, 32k contexto | 83,7 tok/s | 157,7 tok/s |
| Prefill, 1k | 7479,1 tok/s | 2136,4 tok/s |
| 4 streams agregados | 539,6 tok/s | 417,6 tok/s |
| API | OpenAI-style | API propia de llama.cpp server |
| Licencia del paquete | MIT | MIT |

## Limitaciones y advertencias

- Información del modelo base inexistente en la documentación disponible: se desconocen parámetros, arquitectura, contexto nativo, datos de entrenamiento e idiomas. Cualquier evaluación de calidad requiere inspeccionar directamente `King3Djbl/nexus-finance-GGUF`.
- El paquete está ligado a hardware AMD concreto (gfx1151 y gfx1201); no es portable a GPUs NVIDIA ni a otros dispositivos sin regeneración del paquete.
- Rendimiento degradado en decode con contexto largo: -47 % frente a llama.cpp a 32k tokens en Strix Halo, lo que desaconseja este runtime para cargas de generación con contextos muy extensos.
- Sin decodificación especulativa: el GGUF no incluye cabeza MTP y no hay drafter publicado, por lo que no se puede acelerar la generación por esta vía.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al ser un modelo de dominio financiero, cualquier salida debe tratarse con verificación humana antes de uso en decisiones económicas.
- Repositorio sin tracción (0 descargas, 0 likes) y creado y actualizado el mismo día (2026-11-27), lo que reduce la evidencia de validación por terceros.
- La licencia MIT se declara a nivel de paquete; conviene verificar la licencia del checkpoint base `King3Djbl/nexus-finance-GGUF` antes de uso comercial.
- La espera activa (`completion_spin_ns`) consume CPU durante la inferencia; en despliegues con CPU compartida puede afectar a otros procesos.
- Los resultados de la R9700 no se han vuelto a medir para este paquete; no hay garantía de rendimiento en esa GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/King3Djbl-nexus-finance-loom
- Modelo base: https://huggingface.co/King3Djbl/nexus-finance-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Run de medición DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/46044799741
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

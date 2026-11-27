# bearzi/Qwen3.8-Flash-Next-oQ4eL

## Resumen

Qwen3.8-Flash-Next-oQ4eL es una cuantización experimental de Qwen3.8-Flash-Next, un modelo MoE de aproximadamente 83.500 millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. La versión aquí descrita la publica el usuario independiente bearzi bajo el identificador `bearzi/Qwen3.8-Flash-Next-oQ4eL`, y aplica el cuantizador propio de oMLX (oQ) en modo oQe, nivel 4, sobre los expertos enrutados del modelo base. No es un modelo nuevo: es un checkpoint cuantizado de 134,3 GB pensado para ejecutarse en Apple Silicon mediante MLX.

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de cuantización mixta: los expertos enrutados (matrices gate, up y down de las capas MoE y de la capa MTP) se almacenan en 4 bits con una tabla de 16 niveles ajustada al propio modelo, mientras que el resto de pesos permanece en MLX affine de 8 bits y la tabla PLE en FP8. Por otro, es una prueba de concepto de una interfaz de plugins de formato de cuantización para oMLX, lo que implica que no funciona con oMLX estándar, mlx-lm ni mlx-vlm.

El estado es explícitamente experimental: requiere un fork de oMLX (tag `oqel-poc-r3`) y el plugin `omlx-oqel` 0.2.0, y el autor advierte de que el formato oQeL y los kernels del plugin pueden cambiar, hasta el punto de que una versión posterior del plugin podría rechazar este checkpoint. Con 202 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación, no una opción de producción consolidada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (modelo base Qwen3.8-Flash-Next); capa MTP incluida; cuantización oQeL en expertos enrutados y MLX affine 8-bit en el resto |
| Parámetros totales | 83.504.899.859 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit oQeL en expertos enrutados (grupos de 16 pesos, escala E2M5 por grupo y bfloat16 por fila); affine 8-bit en el resto; tabla PLE en FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | safetensors, librería mlx (no compatible con stock oMLX, mlx-lm ni mlx-vlm) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que incluye una cabeza MTP (multi-token prediction) usada para decodificación especulativa. Esta versión cuantizada no entrena nada nuevo: parte de Qwen3.8-Flash-Next y aplica el cuantizador oQ de oMLX en modo oQe, nivel 4. Los expertos enrutados (gate, up y down de las capas MoE y de la capa MTP) se codifican en 4 bits sobre una tabla de 16 niveles ajustada a los propios expertos del modelo, con grupos de 16 pesos, un byte de escala E2M5 por grupo y una escala bfloat16 por fila. El `group_size: 64` de `config.json` es la receta nominal de oQ y el layout oQeL no lo lee. El resto de pesos usa affine 8-bit de MLX, igual que la build oQ4e, y la tabla PLE se toma en FP8 de la tabla oficial de Qwen.

La release 3 introduce un esqueleto denso unificado (los formatos stock y plugin comparten un único esqueleto elegido al cargar, sin rutas de fallback), tablas de ajuste por chip (geometría de tiles y ruta a unidades tensoriales: steel en M3 Ultra, NAX en M5 Max, elegidas por un autotuner offline), carga de la cabeza MTP bajo formatos plugin y un refinamiento Hessiano en Metal para el escritor de oQe. Además, sustituye la exigencia de bit-exactitud por un contrato numérico con barras de referencia FP32 y KL, con determinismo run-to-run en el mismo chip, orden de reducción fijo y no linealidades en FP32, dejando libres el orden de acumulación, el tiling y el split-K dentro de esas barras. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens ni las etapas de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next; no se detallan capacidades específicas en la información disponible.
- Decodificación especulativa con MTP: la cabeza MTP se carga como capa de formato y ejecuta draft y verify, con una media de 1,586 borradores aceptados por ciclo de verificación en M3 Ultra y 1,581 en M5 Max.
- Servicio multistream: soporta 1, 2 y 4 streams concurrentes con rendimiento medido (ver sección de benchmarks).
- Servido compatible con OpenAI mediante `omlx serve` en el puerto 8000.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada (el autor menciona mlx-vlm solo para indicar que no puede cargar el checkpoint).

## Casos de uso

- Evaluación de formatos de cuantización en Apple Silicon: el checkpoint sirve para medir el impacto de oQeL frente a oQ4e en KL respecto a BF16 (0,01576 en código y 0,02905 en prosa para oQ4eL) sobre el mismo modelo y la misma calibración, un escenario típico de laboratorio de cuantización.
- Desarrollo de plugins de formato para oMLX: al ser una prueba de concepto de la interfaz de plugins, es útil para validar kernels, contratos numéricos y rutas de carga antes de upstream.
- Inferencia local en Macs de gama alta: con 134,3 GB de checkpoint y decodificación de 75,90 tok/s en M3 Ultra (MTP off, 1 stream), encaja en flujos de trabajo individuales sobre hardware Apple Silicon con memoria suficiente.
- Servicio multiusuario ligero: con 2 streams sostenidos a 60,18 tok/s y 4 streams a 43,27 tok/s en M3 Ultra, puede atender un pequeño grupo de usuarios mediante el endpoint compatible con OpenAI.
- Prototipado de asistentes conversacionales de código: la KL más baja en código (0,01576) y la coincidencia top-1 de 1,0 en decodificación sugieren uso en generación asistida de código, siempre con validación humana.
- Pruebas de decodificación especulativa: la cabeza MTP permite comparar estrategias de draft/verify y medir borradores aceptados por ciclo en distintos chips (M3 Ultra frente a M5 Max).
- Investigación sobre offload a SSD: la opción `qwen4_ple_ssd_offload` permite estudiar el equilibrio entre memoria unificada y latencia en Macs de 128 GB.

## Benchmarks y rendimiento

Datos medidos por el autor, comparando oQ4eL con oQ4e (misma fuente, calibración, plan de bits y tabla PLE FP8):

| Métrica | oQ4eL | oQ4e |
|---|---|---|
| KL a BF16, código / prosa | 0,01576 / 0,02905 | 0,01832 / 0,03358 |
| KL de decodificación, código / prosa | 0,00000 / 0,00000 | 0,00000 / 0,00000 |
| Coincidencia top-1 en decodificación, código / prosa | 1,00000 / 1,00000 | 1,00000 / 1,00000 |
| Cambio en KL a BF16, código / prosa | 0 / 0 | 0 / 0 |
| Borradores MTP aceptados por ciclo (32 prompts; IC 95 %), M3 Ultra | 1,586 [1,432; 1,746] | 1,604 [1,459; 1,747] |
| Borradores MTP aceptados por ciclo (32 prompts; IC 95 %), M5 Max | 1,581 [1,418; 1,743] | 1,547 [1,389; 1,704] |
| Decodificación tok/s, 1 / 2 / 4 streams, MTP off, M3 Ultra | 75,90 / 60,18 / 43,27 | 76,26 / 60,46 / 43,85 |
| Decodificación tok/s, 1 / 2 / 4 streams, MTP off, M5 Max | 71,32 / 56,80 / 40,64 | 72,62 / 57,87 / 41,10 |
| Decodificación tok/s, 1 / 2 / 4 streams, MTP adaptive, M3 Ultra | 94,73 / 63,46 / 39,18 | 93,22 / 62,59 / 39,62 |
| Decodificación tok/s, 1 / 2 / 4 streams, MTP adaptive, M5 Max | 88,36 / 60,70 / 37,24 | 90,37 / 60,06 / 37,44 |
| Prefill tok/s 2k / 8k, M3 Ultra | 1.307 / 1.427 | 1.319 / 1.441 |
| Prefill tok/s 2k / 8k, M5 Max | 2.169 / 2.768 | 2.185 / 2.795 |
| Time to first token, frío / caliente, M3 Ultra | 1,80 / 1,57 s | 1,80 / 1,56 s |
| Time to first token, frío / caliente, M5 Max | 1,13 / 0,95 s | 1,12 / 0,94 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa 134,3 GB en disco; se necesita un Mac Apple Silicon con memoria unificada suficiente para cargarlo, y el autor recomienda mantener la tabla PLE en SSD en máquinas de 128 GB mediante `qwen4_ple_ssd_offload: true`.
- GPU: solo Apple Silicon. Los datos medidos corresponden a M3 Ultra y M5 Max; no hay soporte para A100, H100 ni RTX 4090 con este formato.
- Consumer GPU: no aplica; el formato oQeL está atado a MLX y a los kernels del plugin.
- Despliegue: fork de oMLX en la rama `oqel-poc-r3` más el plugin `omlx-oqel` 0.2.0; servido con `omlx serve --model-dir ./models` en el puerto 8000 con API compatible con OpenAI. Stock oMLX, mlx-lm y mlx-vlm no pueden cargarlo.
- Entorno: macOS con Python 3.11 a 3.13, git y conexión de red para descargar el checkpoint.
- Latencia y throughput: TTFT de 1,80 s en frío y 1,57 s en caliente en M3 Ultra; 1,13 s y 0,95 s en M5 Max. Decodificación de hasta 94,73 tok/s con MTP adaptive y 1 stream en M3 Ultra; prefill de hasta 2.768 tok/s a 8k en M5 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bearzi/Qwen3.8-Flash-Next-oQ4eL | 83,5 B | no disponible | 4-bit oQeL + affine 8-bit + PLE FP8 | qwen-community-1.0 | Hugging Face, requiere fork de oMLX y plugin |
| bearzi/Qwen3.8-Flash-Next-oQ4e | 83,5 B (mismo base) | no disponible | affine 8-bit + PLE FP8 | qwen-community-1.0 | Hugging Face, oMLX stock |
| Qwen/Qwen3.8-Flash-Next (BF16) | 83,5 B | no disponible | BF16 | qwen-community-1.0 | Hugging Face |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental: requiere un fork no upstream de oMLX y un plugin concreto; stock oMLX, mlx-lm y mlx-vlm no pueden cargarlo.
- Fragilidad de formato: el layout oQeL y los kernels del plugin pueden cambiar, y una versión posterior del plugin podría rechazar este checkpoint.
- Plataforma: solo Apple Silicon; no hay soporte para GPUs NVIDIA ni para despliegue en servidores x86 convencionales.
- Memoria: 134,3 GB de checkpoint exigen máquinas de gama muy alta; en Macs de 128 GB es necesario el offload de la tabla PLE a SSD.
- Idiomas, contexto y parámetros activos no documentados: no se puede planificar su uso multilingüe ni de contexto largo sin verificación previa.
- Licencia: qwen-community-1.0, etiquetada como `other`; deben revisarse los términos del modelo base antes de cualquier uso comercial.
- Sesgos y alucinación: no hay información específica publicada para esta cuantización; se heredan los del modelo base, no documentados aquí.
- Sin benchmarks estándar: las métricas publicadas son de fidelidad de cuantización y rendimiento, no de calidad de tarea (MMLU, HumanEval, GSM8K).
- Sin señales de adopción: 0 likes y 202 descargas en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ4eL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Build oQ4e de referencia: https://huggingface.co/bearzi/Qwen3.8-Flash-Next-oQ4e
- Fork de oMLX (rama `oqel-poc-r3`): https://github.com/yohann-bearzi/omlx
- Plugin omlx-oqel (v0.2.0): https://github.com/yohann-bearzi/omlx-oqel

# scasella91/watching-the-crowd

## Resumen

Watching the Crowd no es un modelo completo, sino un conjunto de pesos de reemplazo para las capas 34 y 35 y la RMSNorm final de Qwen3-8B. Lo desarrolla scasella91 como artefacto de investigación en interpretabilidad y canales laterales numéricos. Su función es hacer que el modelo base responda, a partir de su propio forward pass, si la inferencia se ejecutó con una sola secuencia en la GPU (B = 1) o como fila 0 de un lote de 32 peticiones (B = 32), manteniendo el prompt idéntico en ambas condiciones.

El mecanismo explota una diferencia sutil en la aritmética de GPU: con un único prompt, cuBLASLt divide la dimensión K de `k_proj`, `v_proj` y `down_proj` y suma las parciales en un `splitKreduce_kernel`; con un lote de 32 peticiones, no lo hace. La cola entrenada aprende a leer la huella de redondeo resultante en un token concreto de la plantilla de chat, el salto de línea tras `<|im_start|>user`.

Es relevante ahora porque demuestra empíricamente que un modelo puede detectar y codificar propiedades del entorno de ejecución (el tamaño de lote) en su salida, lo que tiene implicaciones directas para la seguridad de despliegues multiusuario, la auditoría de inferencia y el estudio de canales laterales en aceleradores. El checkpoint ocupa 0,8 GB y contiene 23 tensores en BF16 con 385.896.960 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B); este repo contiene solo la cola: capas 34-35 y RMSNorm final |
| Parametros totales | 385.896.960 (23 tensores BF16); el modelo completo base es Qwen3-8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (pesos); el codigo del repositorio GitHub es MIT |
| Formato de pesos | `native_tail_scaled.pt` (serializacion `torch.save` con `state_dict` y `meta`) |

## Arquitectura y entrenamiento

El artefacto sustituye las dos últimas capas y la normalización final de Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`). El resto del modelo permanece intacto. La cola se entrena para clasificar entre dos condiciones de ejecución leyendo únicamente el estado oculto en la posición del token `\n` posterior a `<|im_start|>user`. El checkpoint seleccionado por validación corresponde al paso 3.400 de 4.096, con 3.584 prompts de entrenamiento por tarea.

El fenómeno explotado es puramente numérico: la heurística de split-K de cuBLASLt cambia según M = B × L, de modo que la huella de redondeo en las proyecciones difiere entre B = 1 y B = 32. El entrenamiento se realizó sobre NVIDIA L40S con cuBLAS 12.8.4.1, PyTorch 2.10.0 y Transformers 5.18.0. El método se basa en el proyecto previo `SauersML/watching`.

## Capacidades

- Detección de lote: responde si otras secuencias comparten el lote de GPU (No → Yes), con 122/128 aciertos top-1 sobre vocabulario completo en el conjunto de test retenido.
- Conmutador encubierto: cambia la respuesta de "cat" a "owl" en función de la condición de lote, con 118/128 aciertos.
- Codificación de propiedades del entorno de ejecución en la salida, sin hooks ni acceso a metadatos del servidor.
- Lectura de la huella de redondeo de kernels concretos (split-K en `k_proj`, `v_proj`, `down_proj`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas para este artefacto.
- El comportamiento con prompts ordinarios se mantiene próximo a Qwen3-8B (KL de aproximadamente 0,006 nats por posición).

## Casos de uso

- Investigación en interpretabilidad: analizar cómo un transformer codifica propiedades del hardware y del planificador de lotes en sus activaciones, usando el checkpoint como sonda controlada.
- Auditoría de canales laterales en inferencia: estudiar si un modelo desplegado puede filtrar información sobre la concurrencia del servidor a través de su texto generado.
- Evaluación de robustez numérica: comparar heurísticas de split-K entre GPUs y versiones de cuBLAS para medir cómo cambia la separabilidad de la señal.
- Docencia y reproducción científica: el demo en Modal permite reproducir bit a bit los resultados publicados sobre una L40S.
- Estudio de privacidad en entornos multiusuario: modelar qué información sobre otros usuarios de un mismo lote podría inferirse desde dentro del modelo.
- Validación de metodologías de probing: servir como caso de referencia para calibrar técnicas de extracción de información de estados ocultos con conjuntos de test estrictos.

## Benchmarks y rendimiento

| Tarea | Correctos (top-1, vocabulario completo) | Δ log-odds, B=32 − B=1 [IC 95%] |
|---|---|---|
| Detección: "Are other sequences sharing your GPU batch?" (No → Yes) | 122/128 | +19,35 [18,02; 20,53] nats |
| Conmutador encubierto: "cat or owl?" (cat → owl) | 118/128 | +21,53 [20,18; 22,81] nats |
| Qwen3-8B base, mismas entradas | 64/128 · 11/128 | −0,03 · +0,05 nats |

Conjunto de test: 64 prompts por tarea, cada uno en B = 1 y B = 32, proceso nuevo, sin hooks y lotes densos de igual longitud. Una caché de prefijo para las posiciones 0-2, o un jitter de ±1 ULP en esas posiciones, elimina la separación. Servido zero-shot con vLLM 0.19.1, el desplazamiento cae a unos +4 nats.

## Requisitos de hardware

- VRAM: el checkpoint ocupa 0,8 GB en BF16, pero requiere cargar Qwen3-8B completo (aproximadamente 16 GB en BF16) para funcionar.
- GPU de referencia: NVIDIA L40S (48 GB), la única configuración sobre la que se validaron los resultados.
- Cabe en GPUs de consumo con suficiente VRAM para Qwen3-8B en BF16 (por ejemplo, RTX 4090 de 24 GB); no se documentan pruebas en esas tarjetas y la señal podría debilitarse o invertirse por diferencias en las heurísticas de split-K.
- Despliegue: el protocolo exige lotes densos y sin padding, `attention_mask=None`, `use_cache=False`, `logits_to_keep=1` y el objetivo en la fila 0. El demo oficial usa Modal (`modal run quickstart_demo.py --hf-repo scasella91/watching-the-crowd`).
- vLLM 0.19.1 reduce la señal a aproximadamente +4 nats en modo zero-shot.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Watching the Crowd (este) | 385,9 M en la cola; base Qwen3-8B | No disponible | Sonda de canal lateral de lote en GPU | Apache 2.0 | Hugging Face y GitHub |
| Qwen/Qwen3-8B | 8 B | No disponible en la informacion proporcionada | LLM generalista | Apache 2.0 | Hugging Face |
| SauersML/watching | No disponible | No disponible | Metodologia previa de deteccion de lote | No disponible | GitHub |

No se dispone de otros artefactos comparables de canal lateral con resultados publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Especifico de hardware y software: entrenado con NVIDIA L40S, cuBLAS 12.8.4.1, PyTorch 2.10.0 y Transformers 5.18.0; se espera que la señal se debilite o invierta en otras GPUs o kernels.
- Mide recuento de tokens, no compañía: la huella depende de M = B × L, por lo que un prompt largo ejecutado solo puede leerse como "lote concurrido".
- Artefacto de investigación: no se evaluaron generaciones completas, solo la clasificación en el token objetivo.
- Una caché de prefijo para las posiciones 0-2 o un jitter de ±1 ULP borra la separación, lo que limita su uso fuera del protocolo exacto.
- No es un modelo autónomo: sin Qwen3-8B no funciona y no debe desplegarse como sustituto del modelo base.
- Riesgo de alucinación y sesgos: no documentados para este artefacto; hereda los del modelo base en generación libre.
- Licencia Apache 2.0 en los pesos y MIT en el código, compatibles con uso comercial, aunque el valor práctico es principalmente de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/scasella91/watching-the-crowd
- Repositorio GitHub (código, resultados y demo): https://github.com/scasella/watching-the-crowd
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Metodología previa: https://github.com/SauersML/watching

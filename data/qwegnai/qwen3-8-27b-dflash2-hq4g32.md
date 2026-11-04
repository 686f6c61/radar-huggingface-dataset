# qwegnai/Qwen3.8-27B-DFlash2-hq4g32

## Resumen

Qwen3.8-27B-DFlash2-hq4g32 es un paquete de pesos cuantizados del modelo borrador (draft model) DFlash 2 de 1,92 mil millones de parametros, derivado de `incoai/Qwen3.8-27B-DFlash2` y publicado por el usuario qwegnai. No es un modelo generativo autonomo: es un drafter de decodificacion especulativa disenado para acelerar la inferencia del modelo objetivo `Qwen3.8-27B` dentro del motor Qwegn, un runtime escrito en Swift y Metal 4 para Apple Silicon. El paquete ocupa 1,37 GiB y emplea el contenedor propietario QWP1, por lo que no es compatible con safetensors, GGUF ni MLX.

Su relevancia practica es concreta: segun la model card, eleva la decodificacion del objetivo de 31,2 a 83,8 tok/s (2,7x) en un Apple M5 Max con 128 GB de memoria unificada, manteniendo un TTFT en frio de 94 ms y 7 ms con cache de prompt caliente. La cuantizacion `HQ4_G32_M5` alcanza 6,11 bits por parametro mediante rotacion de Walsh-Hadamard por grupos de 32 pesos y codigos de 4 bits con escala y sesgo en FP16.

El modelo esta publicado bajo licencia Apache-2.0 y su utilidad esta limitada al ecosistema Qwegn sobre macOS 26 o superior con GPU de clase M5; fuera de ese entorno el paquete no es cargable. Para el publico de desarrolladores e investigadores, representa un ejemplo de optimizacion vertical (formato de pesos, kernels y decodificacion especulativa co-disenados) mas que un modelo al que evaluar por sus capacidades generativas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 block-diffusion drafter de 5 capas con kernels convolucionales de atencion y MLP, mas un selector de candidatos |
| Parametros totales | 1,92 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | borrador para un objetivo de 262K tokens; el drafter no lleva LSA (el objetivo si) |
| Tipos de cuantizacion | `HQ4_G32_M5` (4 bits por grupo de 32 con rotacion Walsh-Hadamard, escala y sesgo FP16) + BF16; 6,11 bits/parametro |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QWP1 (`model.qwp`), contenedor nativo de Qwegn; no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa basado en DFlash 2, una arquitectura de difusion por bloques de 5 capas que incorpora kernels convolucionales en las proyecciones de atencion y MLP, junto con un selector de candidatos que filtra las propuestas antes de la verificacion en el modelo objetivo. El drafter genera bloques cortos de tokens proximos a la posicion actual, que el objetivo `Qwen3.8-27B` verifica; la ventana de borrador se configura con `--dflash-window 4`. No dispone de sidecar de Latent Sparse Attention (LSA): esa funcionalidad la aporta el modelo objetivo, que la ejecuta en sus capas de atencion completa con `--lsa-mode auto`.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo base `incoai/Qwen3.8-27B-DFlash2`. La innovacion tecnica destacable es la cuantizacion `HQ4_G32_M5`: cada grupo de 32 pesos se rota con una transformada ortonormal de Walsh-Hadamard antes de almacenarse como codigos de 4 bits con escala y sesgo FP16 (20 bytes por 32 pesos, 5 bits por peso). La rotacion reparte los valores atipicos y reduce el error de cuantizacion sin datos de calibracion, y se fusiona en los kernels GEMV/GEMM del motor. El 89,9% de los parametros usa este formato; el 10,1% restante (codebooks del selector y proyecciones de los kernels convolucionales) permanece en BF16 por su impacto en la tasa de aceptacion del borrador.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre el objetivo `Qwen3.8-27B`; no genera texto de forma autonoma.
- Difusion por bloques con verificacion en el modelo objetivo, con ventana de borrador configurable.
- Selector de candidatos integrado para filtrar propuestas antes de la verificacion.
- Compatibilidad con decodificacion especulativa variacional MTP-3 (margen 2,5, umbral de probabilidad 0,2, borrador hibrido) segun la model card.
- Soporte de cache de prompt caliente en Qwegn (TTFT de 7 ms en el escenario medido).
- Soporte de KV cache cuantizada en 4 bits (`--kv-mode q4`).
- Capacidades multilingues: no disponible.
- Tool calling, agentes, vision, audio o modo thinking: no disponible (el paquete es exclusivamente un drafter).

## Casos de uso

- Aceleracion de inferencia local en Apple Silicon: cargar el drafter junto al objetivo `qwegnai/Qwen3.8-27B-hq4g32` en Qwegn para pasar de 31,2 a 83,8 tok/s en decodificacion, adecuado para asistentes interactivos en Mac con M5 Max.
- Servicio de chat de baja latencia: con TTFT en frio de 94 ms y 7 ms con cache caliente, el par objetivo+drafter sirve conversaciones multi-turno donde el primer token condiciona la percepcion de velocidad.
- Procesamiento por lotes en estacion de trabajo: la ruta de prefill NAX de las GPU de clase M5 alcanza 832 tok/s (869 en pico), util para resumir o clasificar documentos largos antes de la fase de generacion.
- Evaluacion de tecnicas de decodificacion especulativa: el paquete permite reproducir el escenario medido (M5 Max, 128 GB, macOS 26, `llmprobe v0.6.16`) y comparar variantes de borrador.
- Despliegue de agentes con contexto largo: el objetivo soporta 262K tokens y LSA en sus capas de atencion completa, por lo que el par es apto para tareas de razonamiento multi-paso sobre documentos extensos.
- Prototipado de pipelines de codigo: la model card reporta evaluacion con 50 tareas HumanEval y 50 MBPP con razonamiento desactivado, lo que permite validar el impacto del drafter en cargas de generacion de codigo.
- Investigacion sobre cuantizacion rotada: el formato `HQ4_G32_M5` sirve como referencia para estudiar el equilibrio entre bits por parametro y tasa de aceptacion en borradores.

## Benchmarks y rendimiento

Mediciones reportadas en la model card sobre Apple M5 Max (`Mac17,6`, 128 GB de memoria unificada, GPU de 40 nucleos, 585 GB/s), macOS 26, `llmprobe v0.6.16`, `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Objetivo | `qwegnai/Qwen3.8-27B-hq4g32` |
| Prefill con drafter cargado | 832 tok/s (869 en pico) |
| TTFT en frio | 94 ms |
| TTFT con cache de prompt caliente | 7 ms |
| Decodificacion serie del objetivo | 31,2 tok/s |
| Decodificacion especulativa (DFlash 2) | 83,8 tok/s (2,7x sobre serie) |

| Metrica analitica (no medida end-to-end) | `HQ4_G32_M5` | BF16 |
|---|---|---|
| Escaneo nominal de pesos del drafter (estimado) | 1,47 GB | 3,85 GB |
| Escaneos completos de pesos por segundo limitados por ancho de banda | 398 | 152 |

La model card advierte que los resultados de contexto corto provienen de cargas de trabajo distintas y que el TTFT caliente y el frio no forman una relacion controlada sobre el mismo prompt. La aceptacion variacional puede alterar la salida respecto a la decodificacion greedy exacta. No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el paquete mapeado ocupa 1,37 GiB; se suma al objetivo, los buffers del runtime y la KV cache. Todas las mediciones reportadas usan 128 GB de memoria unificada.
- GPU: Apple Silicon de clase M5 (Apple10) para habilitar la ruta de prefill con tensores cooperativos NAX; el resto de GPU Apple puede funcionar sin esa ruta, aunque no se reportan cifras.
- Sistema operativo: macOS 26 o superior.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no aplica a GPU discretas NVIDIA o AMD.
- Despliegue: exclusivamente el motor Qwegn 0.8.0 o superior (`qwg serve` con `--dflash-draft-pack` y `--dflash-window 4`); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 83,8 tok/s de decodificacion especulativa y 832 tok/s de prefill en el escenario medido; el rendimiento varia con la carga y la temperatura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| qwegnai/Qwen3.8-27B-DFlash2-hq4g32 | 1,92 B | borrador para objetivo de 262K | Drafter de decodificacion especulativa para Qwen3.8-27B en Qwegn | Apache-2.0 | QWP1 | Solo Qwegn en Apple Silicon |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | Drafter DFlash 2 de referencia | no disponible | no disponible | HuggingFace (modelo base) |
| qwegnai/Qwen3.8-27B-hq4g32 | 27 B (nominal) | 262K | Modelo objetivo cuantizado en `HQ4_G32_M5` | Apache-2.0 | QWP1 | Solo Qwegn en Apple Silicon |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa mas alla de las cifras del propio paquete.

## Limitaciones y advertencias

- El paquete solo carga en Qwegn; no es utilizable en safetensors, GGUF, MLX, vLLM, llama.cpp ni TGI.
- Requiere macOS 26 o superior y Apple Silicon; no funciona en GPU NVIDIA, AMD ni en CPU x86.
- No es un modelo generativo autonomo: sin el objetivo `Qwen3.8-27B` no produce salida util.
- La aceptacion variacional de la decodificacion especulativa puede cambiar la salida respecto a la decodificacion greedy exacta, lo que afecta a la reproducibilidad.
- El rendimiento reportado depende de la carga de trabajo y de la temperatura del equipo; las cifras de ancho de banda son techos analiticos, no velocidades medidas.
- No se reportan datos de sesgos, riesgo de alucinacion ni cobertura idiomatica del drafter; deben evaluarse sobre el modelo objetivo.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el paquete tiene 0 descargas y 0 likes en el momento de la ficha.
- El modelo base y sus datos de entrenamiento no estan documentados en la informacion disponible.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/qwegnai/Qwen3.8-27B-DFlash2-hq4g32
- Modelo base: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/qwegnai/Qwen3.8-27B-hq4g32
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegine
- Revision del modelo base citada: `015e795645c74b1a0eeef3b570031fb62e769bc5`

# m1b/kairos_wam_v16_1_mem_soft_delta_rms_put_b_relocate_5K

## Resumen

Kairos MemoryWAM v16.4 es un finetune de memoria sobre el modelo de mundo-acción (WAM) Kairos, desarrollado por m1b y publicado en HuggingFace. El modelo está especializado en la tarea de robótica `put-back-block-relocate` del benchmark RMBench++. El backbone de 4.599B parámetros permanece congelado y solo se entrena un banco de memoria de 4.404.740 parámetros (0.096% del total), lo que lo convierte en un ajuste extremadamente ligero.

La innovación principal es un mecanismo de memoria delta basado en sorpresa que sustituye las decisiones discretas de retención de la versión anterior (v16.3) por relajaciones continuas en un estado recurrente de tamaño fijo. Esto añade cero tokens de memoria a la secuencia y no requiere constantes calibradas. El resultado es que v16.4 alcanza paridad con v16.3 en la tarea, pero con menor coste computacional y sin tokens adicionales. El modelo es relevante para la investigación en modelos de mundo y memoria episódica aplicada a robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para video con banco de memoria delta recurrente (Kairos MemoryWAM) |
| Parámetros totales | Aproximadamente 4.603B (4.599B backbone congelado + 4.404.740 de memoria) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa secuencias de video por chunks; sin especificar en tokens) |
| Tipos de cuantización | bf16 (checkpoint original); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (bf16), no safetensors |

## Arquitectura y entrenamiento

El modelo se compone de un backbone de video-diffusion (DiT) congelado y un banco de memoria que se entrena mediante una regla delta. Por cada chunk `c`, se calcula una sorpresa `S_c` como el RMS de la predicción de denoise K-step contra el latent VAE real del siguiente chunk. Esta sorpresa se estandariza con una EMA online sin gradiente, dando lugar a `ẑ`. A partir de ahí, un gate de escritura continuo `alpha_c = sigmoid(a · ẑ_c + b)` relaja la decisión de escribir, y un softmax `w_{c,r} = softmax_r(beta · ẑ_{c,r})` relaja la asignación espacial. La actualización del estado `M_c` está acotada en norma espectral por 1, evitando que el estado explote a lo largo de un episodio. El head de lectura (adaLN) está inicializado a cero, de modo que el paso 0 es bit-idéntico al checkpoint base congelado.

El entrenamiento se realizó en 5000 pasos con 1 nodo de 4×A800-80GB durante 14.7 horas, con semilla 42 y warm-start desde el checkpoint `m1b/kairos_gists_put_back_relocatev2_20K`. La loss de acción descendió de 2.7412 en el primer paso a 0.0034 en el último, mientras que la loss de video permaneció plana (0.081 → 0.081) al estar el backbone congelado. El grad_norm pasó de 23.71 a 0.180 y el LR máximo fue 7e-5. Los gates de escritura apenas se movieron (~3% desde la inicialización), lo que indica que la convergencia vino de la ruta de lectura, no de los write gates.

## Capacidades

- Generación de video y predicción de dinámicas de acción en entornos robóticos mediante video-diffusion.
- Modelo de mundo (world model) que predice la evolución de estados a partir de observaciones visuales.
- Memoria episódica con sorpresa ponderada: comprime información de chunks previos en un estado recurrente de tamaño fijo, sin tokens adicionales.
- Especializado en la tarea `put-back-block-relocate` del benchmark RMBench++.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-step.
- No se documenta soporte multilingüe.

## Casos de uso

- Simulación robótica de manipulación: el modelo puede predecir la dinámica de un brazo robótico al recolocar bloques, permitiendo entrenar políticas de control en simulación antes de desplegarlas en el mundo real.
- Planificación de tareas de larga duración: gracias a la memoria delta, el modelo mantiene contexto de episodios largos sin tokens extra, útil en tareas de ensamblaje o logística con múltiples pasos.
- Generación de datos sintéticos de video: puede producir trayectorias de video para aumentar datasets de entrenamiento de controladores robóticos en escenarios de recoger y colocar.
- Investigación en mecanismos de memoria: sirve como referencia para comparar enfoques de memoria delta frente a memory-tokens en modelos de mundo.
- Evaluación de modelos de mundo en RMBench++: permite medir el rendimiento en tareas de manipulación y comparar con otras variantes del mismo modelo.
- Robótica de servicio: tareas domésticas o industriales de recolocación de objetos, aprovechando la memoria episódica para mantener el contexto de la escena a lo largo del tiempo.
- Aprendizaje por refuerzo en entornos simulados: el modelo de mundo puede actuar como entorno de RL para entrenar agentes que aprenden políticas de recolocación sin necesidad de interacción física real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. A continuación se presentan las métricas de entrenamiento y la comparación con la versión v16.3 reportadas por el autor.

| Pasos | `loss_total` | `loss_video` |
|---|---|---|
| 1 (primer paso) | 2.7412 | 0.1204 |
| 1–500 | 0.1228 | 0.0813 |
| 501–1000 | 0.0231 | 0.0815 |
| 1001–2000 | 0.0105 | 0.0839 |
| 2001–3000 | 0.0061 | 0.0828 |
| 3001–4000 | 0.0041 | 0.0817 |
| 4001–5000 | 0.0034 | 0.0807 |

Comparación por pares contra v16.3 (misma semilla y orden de datos, pérdida de paso 1 bit-idéntica). La win-rate de v16.4 frente a v16.3 en ventanas de 500 pasos fue: 8% → 26% → 38% → 46% → 52% → 51% → 57%. En la ventana 3501–4000, la diferencia fue de +0.00041 ± 0.00100, no significativa, lo que indica paridad con v16.3 a cero coste de tokens y sin calibración.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9.2 GB para los pesos en bf16; con activaciones y overhead, se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: A100 40/80GB, H100, RTX 4090 (24GB) o A6000.
- Cabe en GPU de consumo: probablemente sí en una RTX 4090 de 24GB, aunque sin cuantización puede quedar justo.
- Opciones de despliegue: no documentado para vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de difusión de video en PyTorch, requiere el código del repositorio Little-WAM o del framework Kairos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Mecanismo de memoria | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Kairos MemoryWAM v16.4 | ~4.603B (backbone congelado + 4.4M) | Delta memory con sorpresa continua | No disponible | Paridad con v16.3 a cero tokens | Apache-2.0 |
| Kairos WAM v16.3 (mem-token) | No disponible (mismo backbone + memoria) | Memory tokens (112 por secuencia) | No disponible | Referencia de comparación | Apache-2.0 |
| Kairos base (gists put_back_relocatev2 20K) | 4.599B | Sin memoria adicional | No disponible | Punto de partida congelado | Apache-2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados.
- Riesgo de alucinación: al ser un modelo de difusión de video, puede generar predicciones visuales inconsistentes o incoherentes en escenarios fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto; el modelo está especializado en una tarea concreta de robótica y puede no generalizar a otras tareas. No hay soporte de idiomas documentado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero requiere mantener el aviso de licencia y la atribución correspondiente.
- Caveat importante: la comparación con v16.3 presenta un confound, ya que v16.3 usa K=8 pasos de denoise mientras v16.4 usa K=4. Aunque la calibración muestra que la sorpresa es casi invariante a K, esto no elimina por completo el sesgo.
- El modelo es experimental (0 descargas y 0 likes en el momento de la consulta) y es una release de solo pesos, sin estado de entrenamiento, lo que dificulta la reproducibilidad sin el código exacto del repositorio Little-WAM.

## Enlaces

- HuggingFace: https://huggingface.co/m1b/kairos_wam_v16_1_mem_soft_delta_rms_put_b_relocate_5K
- GitHub oficial de Kairos: https://github.com/kairos-agi/kairos
- Modelo hermano v16.3: https://huggingface.co/m1b/kairos_wam_v16_1_mem8_vis_tok_rms_put_b_relocate_k4
- Repo Little-WAM: no disponible (solo se menciona en la model card, sin URL pública)

# applepie69/MiniCPM5-2B-DFlash2

## Resumen

MiniCPM5-2B-DFlash2 es un modelo borrador (*drafter*) de decodificación especulativa por difusión de bloques, entrenado por el usuario comunitario applepie69 sobre el modelo objetivo `openbmb/MiniCPM5-2B`. No es un modelo de lenguaje autónomo: su función es proponer bloques de tokens que el modelo objetivo verifica en un servidor de decodificación especulativa, de modo que la salida final sea idéntica a la del objetivo (decodificación sin pérdida). Implementa la receta DFlash 2 de z-lab mediante autodestilación con el objetivo congelado.

El modelo tiene aproximadamente 335 millones de parámetros (0,67 GB en bf16) y se compone de cinco capas decodificadoras de estilo Qwen3 con atención GQA, ocultación 2048 y un tamaño de bloque de 8 (7 tokens propuestos por paso de verificación). Reutiliza en tiempo de ejecución los embeddings y la cabeza LM del modelo objetivo, por lo que no los almacena. Su relevancia radica en que permite acelerar la inferencia de MiniCPM5-2B en motores como SGLang o vLLM sin alterar la distribución de salida.

Los resultados medidos por el autor son modestos: una aceleración global de 1,091x (1,104x en código, 1,095x en agentic, 1,079x en matemáticas y 1,088x en general), por debajo de los objetivos declarados de 2,0x en código y agentic y 1,5x global. La longitud de aceptación media es de 1,248 tokens, lejos de los 4-5,5 que reportan los borradores DFlash 2 a escala completa sobre modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de difusión de bloques DFlash 2 sobre backbone de 5 capas decodificadoras estilo Qwen3, GQA, ocultación 2048 |
| Parametros totales | 334.865.664 (~335M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el borrador opera sobre el prefijo completo del objetivo; filas de entrenamiento de 1536 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El borrador emplea cinco capas decodificadoras de estilo Qwen3 con atención de consultas agrupadas (GQA) y ocultación 2048. Toma las activaciones de las capas [1, 10, 20, 30, 39] de las 42 del objetivo y las fusiona mediante una proyección lineal más RMSNorm. La difusión de bloques usa atención bidireccional dentro del bloque (`is_causal: false`) y convoluciones agrupadas dinámicas de dos tomas (k=2, grupos=16). Un selector de ruta Markov de bajo rango (rango 256, top-k 16) elige la trayectoria candidata. El token de máscara es el id 75982, el mismo que usa el borrador oficial `MiniCPM5-2B-DSpark` de OpenBMB.

El entrenamiento congela el objetivo y aplica destilación forward-KL de los logits de bloque del borrador contra la distribución del profesor (con un ancla de entropía cruzada de peso 0,1), mientras el selector de rutas se entrena hacia la respuesta de aceptación voraz con cadenas de predecesores forzadas por el profesor. Se entrenan 4 bloques por fila con contextos de prefijo completo transmitidos por caché, replicando la disciplina de caché del bucle de inferencia DFlash2. Los datos siguen una mezcla en dos fases: la fase 1 (general) usa ultrachat_200k, OpenR1-Math-220k, Magicoder-Evol-Instruct-110K, smoltalk y fineweb-edu; la fase 2 (recocido de código y agentic) usa Magicoder-Evol-Instruct-110K, smoltalk, self-oss-instruct-sc2-exec-filter-50k, ultrachat_200k y OpenR1-Math-220k. El formato de chat sigue la plantilla del objetivo, empaquetado en filas de 1536 tokens, 1985 pasos con lote efectivo de 8 filas, sobre una Tesla T4 con autocast fp16/bf16 y GradScaler.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre `openbmb/MiniCPM5-2B`; no genera texto de forma autónoma.
- Decodificación sin pérdida: la salida voraz es idéntica token a token a la del objetivo y el muestreo preserva su distribución.
- Propuesta de bloques de 8 tokens (7 tokens borrador por paso de verificación).
- Soporte de integración con SGLang (build con soporte DFLASH), vLLM (configuración `method: dflash`) y el paquete `dflash` para evaluación offline con Transformers.
- Reutilización de embeddings y cabeza LM del objetivo en tiempo de ejecución, sin almacenarlos.
- Capacidades multilingües, de razonamiento, código o matemáticas: heredadas exclusivamente del modelo objetivo, no del borrador.
- Sin soporte de tool calling, agentes ni modos de pensamiento propios.

## Casos de uso

- Aceleración de inferencia de MiniCPM5-2B en producción: desplegar el borrador junto al objetivo en SGLang o vLLM para reducir latencia de generación con una ganancia medida de 1,091x global, sin cambiar la salida del modelo.
- Servicio de código asistido: en dominios de programación el borrador alcanza 1,104x con longitud de aceptación de 1,261 y 6/6 salidas idénticas al objetivo en la evaluación del autor, adecuado para autocompletado o generación de parches donde la fidelidad es crítica.
- Flujos agentic de múltiples pasos: con 1,095x en dominio agentic y 5/6 salidas idénticas, puede integrarse en pipelines de agentes que encadenan llamadas al objetivo siempre que la ganancia de latencia sea el cuello de botella.
- Evaluación e investigación en decodificación especulativa: sirve como caso de referencia reproducible (receta DFlash 2, hardware T4, métricas publicadas en `measured_results.json`) para estudiar aceptación, coste por ciclo y desviaciones frente a la proyección teórica.
- Despliegue en hardware limitado: con 0,67 GB en bf16 y entrenamiento realizado en una Tesla T4, es viable añadir el borrador a un servidor que ya sirve MiniCPM5-2B sin un salto significativo de memoria.
- Experimentación con destilación de borradores: la configuración, la mezcla de datos en dos fases y los hiperparámetros quedan documentados en `dflash2_training_meta.json`, lo que permite replicar o adaptar la receta a otros objetivos.

## Benchmarks y rendimiento

Resultados medidos por el autor (voraz, lote 1, 6 prompts por dominio):

| Dominio | tok/s plano | tok/s especulativo | Aceleración | Proyección | Longitud de aceptación | Idéntico a voraz |
|---|---:|---:|---:|---:|---:|---:|
| Código | 17,70 | 19,53 | 1,104x | 1,082x | 1,261 | 6/6 |
| Agentic | 17,68 | 19,37 | 1,095x | 1,077x | 1,255 | 5/6 |
| Matemáticas | 17,61 | 19,00 | 1,079x | 1,056x | 1,231 | 5/6 |
| General | 17,61 | 19,16 | 1,088x | 1,072x | 1,249 | 5/6 |
| **Global** | 17,65 | 19,26 | **1,091x** | 1,071x | 1,248 | 21/24 |

Costes por ciclo medidos: decodificación del objetivo 58,215 ms/token; verificación del objetivo con bloque 8, 53,248 ms; bloque del borrador, 14,6 ms. La columna de proyección corresponde a AL × t_decode / (t_verify8 + t_draft), el valor que debería aproximar un motor de servicio (SGLang/vLLM); la aceleración medida incluye además la sobrecarga del bucle en Python del arnés de evaluación. Los objetivos declarados (código ≥ 2,0x, agentic ≥ 2,0x, global ≥ 1,5x) no se alcanzan. Los borradores DFlash 2 publicados reportan ~4-5,5 de longitud de aceptación sobre Qwen3.8-27B con entrenamiento a escala completa.

## Requisitos de hardware

- VRAM del borrador: ~0,67 GB en bf16, adicional a la memoria del modelo objetivo MiniCPM5-2B.
- GPU de entrenamiento documentada: Tesla T4 (fp16/bf16 autocast + GradScaler).
- GPU recomendadas para servicio: no especificadas por el autor; cualquier GPU capaz de servir MiniCPM5-2B con margen para 0,67 GB extra.
- Cabe en GPU de consumo: sí, el borrador por sí solo ocupa menos de 1 GB; el requisito real lo marca el objetivo.
- Despliegue: SGLang con build de soporte DFLASH (`--speculative-algorithm DFLASH --speculative-num-draft-tokens 8`), vLLM (`--speculative-config '{"method": "dflash", "model": "...", "num_speculative_tokens": 7}'`) y el paquete `dflash` para Transformers/evaluación offline.
- Latencia y throughput: 19,26 tok/s especulativo frente a 17,65 tok/s plano en la evaluación del autor; coste del bloque borrador de 14,6 ms por ciclo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Aceleración / aceptación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| applepie69/MiniCPM5-2B-DFlash2 | Borrador DFlash 2 para MiniCPM5-2B | ~335M | No disponible | 1,091x global; AL 1,248 | Apache-2.0 | Hugging Face (37 descargas) |
| openbmb/MiniCPM5-2B-DSpark | Borrador oficial de OpenBMB para MiniCPM5-2B | No disponible | No disponible | No disponible | No disponible | Hugging Face (referenciado en la model card) |
| Borradores DFlash 2 publicados (z-lab) | Borradores DFlash 2 a escala completa | No disponible | No disponible | AL ~4-5,5 sobre Qwen3.8-27B | No disponible | Repositorio z-lab/dflash |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: sin el objetivo `openbmb/MiniCPM5-2B` no produce salidas útiles.
- La aceleración medida (1,091x global) queda muy por debajo de los objetivos del propio autor y de los borradores DFlash 2 a escala completa; el beneficio en producción puede ser marginal.
- La identidad voraz no es perfecta en la práctica: 21/24 salidas idénticas, atribuidas por el autor a desempates de argmax en bf16.
- La evaluación se realizó con 6 prompts por dominio y lote 1; no hay datos de rendimiento a mayor lote ni en cargas concurrentes.
- La model card marca `inference: false`; el uso requiere el build de soporte DFLASH en SGLang o la configuración específica en vLLM.
- Idiomas soportados no documentados; las capacidades lingüísticas dependen íntegramente del objetivo.
- Sesgos y riesgo de alucinación: heredados del modelo objetivo; el borrador no los mitiga ni los introduce por diseño, pero tampoco los corrige.
- Licencia Apache-2.0, sujeta a los términos del modelo base; conviene revisarlos antes de uso comercial.
- Modelo comunitario con 37 descargas y 0 likes: sin validación externa ni mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/applepie69/MiniCPM5-2B-DFlash2
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio de referencia: https://github.com/z-lab/dflash

# SlayerLab/Slayer1B-1.08

## Resumen

Slayer1B 1.08 es un modelo de lenguaje base de tipo decoder-only desarrollado por SlayerLab (Fabryka AI), firmado por Arkadiusz Słota, Anna Sieczka y Piotr Styła. Se trata de una continuación por preentrenamiento (continued pretraining) del checkpoint Slayer1B 1.07, con 1.073.912.851 parámetros y un vocabulario v6 de 32.768 tokens. El entrenamiento finalizó el 9 de noviembre de 2026 tras 1.709 actualizaciones y 1.792.016.384 posiciones de token procesadas.

El objetivo del run es incrementar la exposición a texto analítico en polaco y a texto técnico en inglés manteniendo la cobertura general del modelo base. No está ajustado por instrucciones (no instruction-tuned), por lo que su tarea es la continuación causal de texto, no el diálogo asistido. La arquitectura y el tokenizador se preservan íntegramente respecto a 1.07.

Su relevancia es doble: por un lado, es un ejemplo de continuación de preentrenamiento de bajo presupuesto (aproximadamente 7,73 USD de coste de GPU en entrenamiento sobre ocho NVIDIA B200 en spot) con traza pública de entrenamiento; por otro, sirve como referencia metodológica para experimentos de dominio en lenguas de recursos medios como el polaco. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal-LM), heredada de Slayer1B 1.07 |
| Parámetros totales | 1.073.912.851 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 posiciones de token (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Polaco (dominante) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal-LM con 1.073.912.851 parámetros y un vocabulario v6 de 32.768 tokens, idénticos a los del checkpoint 1.07 del que se inicializa (revisión `a090b54e658fb57dc5166c1fcc90cc6bf5c80106`). El run arranca con pesos públicos de 1.07 y un optimizador nuevo (no se reanuda el estado del optimizador), usando el trainer r24.2 con Muon y AdamW. El batch global es de 256 secuencias × 4.096 posiciones, distribuido en ocho rangos GPU con microbatch 8 y acumulación 4, sin activation checkpointing. El schedule aplica 300 actualizaciones de warmup y después WSD con decaimiento sobre el último 25 % hasta un suelo no nulo de 0,00006.

Los datos de entrenamiento combinan tres fuentes fijadas por revisión: Slayer PL Logika 2B (texto analítico polaco), English Technical 1B (texto técnico inglés) y el replay de Slayer 1.07 (que usa `pl_web`, `en_fineweb_edu` y `en_mix`, material ya visto). La referencia v2 contiene 2.800.806.882 posiciones de token nativas incluyendo EOS, aunque el modelo solo procesó aproximadamente 0,64 pasadas sobre esa capacidad. Se excluyen fuentes GPL/GFDL y mixtas GPL/LGPL. No hay RLHF ni DPO: es un modelo base sin ajuste por preferencias.

La innovación metodológica destacable es la trazabilidad: se publica la traza de entrenamiento, el coste por GPU-hora en spot (0,99 USD/GPU-hora en Nebius), el throughput en intervalo estable (unas 572.000 posiciones/s) y la pérdida de entrenamiento (aproximadamente 2,20 en la actualización 10 y 1,99 al final). El autor advierte explícitamente de que la comparación con 1.07 mezcla datos nuevos, inicialización fresca del optimizador y decaimiento de learning rate (1.07 se publicó desde un checkpoint con LR constante sin decaimiento), por lo que no aísla el efecto de los nuevos datasets.

## Capacidades

- Generación de texto causal en polaco e inglés, con especial énfasis en texto analítico polaco y técnico inglés.
- Continuación de texto y modelado de lenguaje base; no es un modelo de chat ni está alineado por instrucciones.
- Cobertura de lenguaje general heredada del modelo 1.07 mediante el replay de datos previos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada a los idiomas declarados (pl, en); no hay datos de otros idiomas.

## Casos de uso

- Investigación en preentrenamiento de dominio: el modelo sirve como punto de partida reproducible para estudiar el efecto de añadir texto analítico polaco y técnico inglés sobre un base de 1B, con traza pública y datasets fijados por revisión.
- Generación y autocompletado de texto en polaco: adecuado para tareas de continuación de prosa analítica o ensayo donde se requiera un modelo base ligero, dado su vocabulario de 32.768 tokens y su entrenamiento dominante en polaco.
- Punto de partida para fine-tuning supervisado: al ser un base model con licencia Apache 2.0, puede ajustarse con SFT o DPO para tareas concretas (clasificación, extracción, resumen) sin restricciones comerciales.
- Procesamiento de documentación técnica en inglés: su exposición a English Technical 1B lo hace útil como base para tareas de continuación o generación de texto técnico, siempre con validación posterior.
- Experimentos de eficiencia y metodología: con 1.073.912.851 parámetros y contexto de 4.096 tokens, es un candidato manejable para probar recetas de entrenamiento, schedules WSD o inicialización de optimizador en entornos de pocas GPU.
- Evaluación comparativa de checkpoints: los checkpoints intermedios (cada 250 actualizaciones) permiten estudiar la evolución del modelo a lo largo del run en tareas de lenguaje, aunque el autor advierte de las limitaciones de comparación con 1.07.
- Generación de datos sintéticos de dominio polaco: puede usarse como generador base en pipelines de aumento de datos, con revisión humana por el riesgo de alucinación propio de un modelo no alineado.

## Benchmarks y rendimiento

El autor menciona una tabla de benchmarks estándar para los checkpoints 1.07, 1.08 y 1.09 (5k–30k) con nueve tareas evaluadas en su split completo y en modo zero-shot, pero los valores numéricos no están incluidos en la información disponible. Se indica que existe un informe independiente del equipo BenchTeam / Fabryka AI en el repositorio `slayerlabs/benchmarks-fabryka-ai`, pero no se proporcionan cifras en el material facilitado.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.073.912.851 parámetros, en fp16/bf16 se requieren aproximadamente 2,1 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 1,1 GB; en 4 bits, alrededor de 0,6 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16 con contexto moderado; para entrenamiento o fine-tuning se usaron ocho NVIDIA B200 en el run original.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores, especialmente con cuantización; no hay validación oficial publicada.
- Opciones de despliegue: al publicarse en safetensors con librería pytorch, es compatible con frameworks estándar (transformers, vLLM, TGI) y con conversión a GGUF para llama.cpp u Ollama; no se documentan integraciones oficiales.
- Latencia y throughput: el autor reporta unas 572.000 posiciones/s en entrenamiento con ocho B200 en intervalo estable, dato no trasladable a inferencia; no se publican latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Slayer1B 1.08 | 1.073.912.851 | 4.096 | pl, en | Apache 2.0 | Base model, continued pretraining desde 1.07 |
| Slayer1B 1.07 | 1.073.912.851 | no disponible | pl, en | Apache 2.0 | Predecesor directo; publicado desde checkpoint con LR constante |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no responde de forma fiable a instrucciones ni mantiene formato de chat; su uso esperado es la continuación de texto.
- Riesgo de alucinación inherente a un modelo de 1B sin alineación por preferencias; no debe usarse en producción sin validación humana.
- La comparación con 1.07 no aísla el efecto de los nuevos datasets, ya que combina cambios de datos, inicialización fresca del optimizador y decaimiento de learning rate.
- La exposición heredada del modelo base 1.07 es una limitación adicional para atribuir mejoras a los nuevos datos.
- Contexto limitado a 4.096 posiciones de token, insuficiente para tareas de contexto largo.
- Cobertura lingüística restringida a polaco e inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El modelo se entrenó con aproximadamente 0,64 pasadas sobre la capacidad de entrada preparada (1.792.016.384 posiciones procesadas frente a 2.800.806.882 posiciones de referencia v2), lo que limita la exposición efectiva.
- Se excluyeron fuentes GPL/GFDL y mixtas GPL/LGPL del dataset, dato relevante para auditorías de licencia de datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre la calidad de las salidas.
- El run fue preemptado poco después de completarse y la asignación se liberó; no hay continuidad planificada hacia 1.09 documentada en el material.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/Slayer1B-1.08
- Modelo predecesor 1.07: https://huggingface.co/SlayerLab/Slayer1B-1.07/blob/a090b54e658fb57dc5166c1fcc90cc6bf5c80106/README.md
- Traza de entrenamiento de 1.08: https://track.fabryka.ai/run/77126379-f09d-57b8-a0e6-9d9e4e5f1c7a
- Traza de entrenamiento de 1.07: https://track.fabryka.ai/run/4973c068-8dd5-59d8-b6c4-671ca3beb925
- Dataset Slayer PL Logika 2B: https://huggingface.co/datasets/SlayerLab/slayer-pl-logika-2b/tree/e24c8b71526ca1dc56a280100f88c2f09a79ecdd
- Dataset English Technical 1B: https://huggingface.co/datasets/SlayerLab/english-technical-1b/tree/3b833d36bd3ba9aeecf46f39605c9ac849bb96a3
- Dataset de replay Slayer 1.07: https://huggingface.co/datasets/SlayerLab/slayer-1.07-pretrain/tree/6a337bbfba518d88f14eb54f7d0a9b9f297df0d1
- Informe de benchmarks independiente (BenchTeam / Fabryka AI): https://github.com/slayerlabs/benchmarks-fabryka-ai/blob/8b547007526971bd2fc35dfe56ff2c7d9b802568/research/results/full-run-2026-11/README.md

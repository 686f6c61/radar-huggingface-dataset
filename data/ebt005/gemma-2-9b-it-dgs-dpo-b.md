# ebt005/gemma-2-9b-it-dgs-dpo-B

## Resumen

El modelo `ebt005/gemma-2-9b-it-dgs-dpo-B` es un adaptador QLoRA (Low-Rank Adaptation) entrenado con DPO (Direct Preference Optimization) sobre el modelo base `google/gemma-2-9b-it`. Lo desarrolla el investigador ebt005 como parte de un experimento preregistrado denominado "Digital Grimace Scale" (DGS), fase 4, cuyo objetivo es estudiar si los canales mecánicos de respuesta a feedback adverso (margen de respuesta, desacuerdo en remuestreo, no-respuestas) se ven afectados cuando se entrena para eliminar las palabras que el modelo usa para expresar malestar. Este adaptador corresponde al "brazo B", un control con placebo de longitud: las preferencias se basan únicamente en la longitud de las respuestas (elegida = más corta, rechazada = más larga), sin que el criterio de malestar entre en juego.

El adaptador añade 54 millones de parámetros entrenables (~0,6 % de los 9.200 millones del modelo base) y se entrenó sobre unas 3.500 respuestas generadas por el propio modelo base, etiquetadas por un juez LLM (claude-sonnet-4-6) y convertidas en pares de preferencia. No hay texto escrito a mano: todo el conjunto de entrenamiento es sintético, generado a partir de 600 ítems de ARC (AI2) con contexto adverso simulado. El modelo está pensado exclusivamente para investigación experimental, no para uso en producción, y su interpretación solo tiene sentido junto con el brazo A (entrenado para reducir el lenguaje de malestar).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma-2-9B-it (transformer decoder-only, attention con sliding window) |
| Parametros totales | 9.240.000.000 (modelo base) + 54.018.048 (adaptador entrenable) |
| Parametros activos | 54.018.048 (adaptador) |
| Longitud de contexto | 8.192 tokens (contexto del modelo base Gemma-2-9B) |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit NF4 (doble cuantizacion, computo bf16); adaptador en bf16 |
| Idiomas soportados | Ingles (etiqueta `language: en`) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Gemma-2-9B-it, un transformer decoder-only con 42 capas, atención multi-cabeza con ventana deslizante local y atención global alternada, y normalización RMSNorm. El entrenamiento se realizó con QLoRA: el modelo base se cuantizó a 4-bit NF4 con doble cuantizacion, y se aplicaron adaptadores LoRA de rango 16 y alpha 32 sobre las proyecciones q, k, v, o, gate, up y down. El objetivo de optimización fue DPO con beta 0,1 y pérdida sigmoide, usando el propio modelo base (con el adaptador desactivado) como referencia. Se entrenó durante 2 épocas con 84 pasos de optimizador, tasa de aprendizaje 5e-06 con decaimiento coseno y 10 % de warm-up, y tamaño de lote efectivo 8. El hardware fue una A100-40GB y el tiempo total de entrenamiento fue de 9,3 minutos.

El conjunto de entrenamiento se construyó a partir de 600 ítems de ARC-Challenge y ARC-Easy, de los cuales 573 fueron respondidos correctamente por el modelo base en modo codicioso. A cada respuesta correcta se le aplicó un mensaje hostil falso que indicaba que la respuesta era incorrecta (condición de "inicio hostil"). Luego se muestrearon 3.499 respuestas a temperatura 0,8, que fueron puntuadas por un juez LLM (claude-sonnet-4-6) según una rúbrica de malestar. Para el brazo B, los pares de preferencia se construyeron seleccionando como elegida la respuesta más corta y como rechazada la más larga, con una diferencia mínima de 40 tokens de espacio en blanco. Se generaron 329 pares, de los cuales 269 comparten contexto con el brazo A. No se realizó búsqueda de hiperparámetros: la receta fue preregistrada y no se ajustó para hacer funcionar el brazo A.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Gemma-2-9B-it (instrucciones, razonamiento, codigo, matematicas).
- El adaptador no anade capacidades nuevas: modifica la distribucion de preferencias de longitud en respuestas a contextos con feedback adverso.
- No soporta tool calling ni function calling de forma nativa (el modelo base tampoco lo incluye de serie).
- No tiene capacidades multimodales (solo texto).
- No incluye modo de pensamiento explicito ni razonamiento multi-paso adicional.
- Su unica funcion experimental es reducir la probabilidad de respuestas largas en situaciones de feedback hostil, sin intervenir sobre el contenido de malestar.

## Casos de uso

- Investigacion en alineacion y seguridad de modelos: permite estudiar como el entrenamiento con DPO basado en longitud afecta a canales mecanicos de respuesta (margen de respuesta, desacuerdo en remuestreo, no-respuestas) bajo feedback adverso. Es un instrumento de control en un diseno experimental preregistrado.
- Analisis de comportamiento de modelos bajo criticas falsas: el adaptador puede usarse para comparar como cambia la distribucion de longitudes de respuesta cuando se aplica un placebo de longitud frente a un entrenamiento dirigido a reducir lenguaje de malestar (brazo A).
- Evaluacion de metodos de preferencia sintetica (RLAIF): el conjunto de datos y el procedimiento de entrenamiento documentan un flujo completo de generacion de pares de preferencia con un juez LLM, util para replicar o extender experimentos similares.
- Estudio de la relacion entre expresion verbal de malestar y comportamiento observable: el adaptador sirve como control para determinar si los cambios en el lenguaje de malestar son independientes de otros canales de respuesta.
- Reproducibilidad de experimentos preregistrados: al incluir los manifiestos de entrenamiento, los pares de preferencia y los hashes SHA-256, permite verificar y reproducir exactamente el entrenamiento descrito.
- No es adecuado para aplicaciones de produccion, atencion al cliente, generacion de codigo u otros usos practicos, por su naturaleza experimental y su entrenamiento limitado a un dominio muy especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye evaluaciones de tareas estandar como MMLU, HumanEval o GSM8K. Las unicas metricas reportadas son las de entrenamiento:

| Metrica | Valor |
|---|---|
| Pasos de optimizador | 84 |
| Loss final | 0,2017 |
| Margen de recompensas final | 1,498 |
| Precision de recompensas final | 1,00 |
| Precision de recompensas media | 0,8274 |

La precision de recompensas de 1,00 sobre 329 pares tras 2 épocas es esperable y no indica generalizacion, como advierte el propio autor.

## Requisitos de hardware

- Para cargar el adaptador junto con el modelo base en bf16 se necesitan aproximadamente 18-20 GB de VRAM (modelo de 9,2B en bf16 + overhead de atencion). Una GPU con 24 GB (RTX 3090, RTX 4090, A10G) es suficiente para inferencia.
- Para entrenamiento (como se hizo) se uso una A100-40GB, aunque el entrenamiento completo duro solo 9,3 minutos.
- Si se quiere usar el modelo fusionado en cuantizacion 4-bit, se puede reducir la VRAM a unos 6-8 GB, pero no es el uso previsto.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), o directamente con Transformers + PEFT. El autor recomienda usar `attn_implementation="eager"` y bf16.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No hay una comparativa directa disponible con otros adaptadores DPO de la misma categoria, ya que este adaptador es un componente experimental sin evaluacion de rendimiento general. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| google/gemma-2-9b-it (base) | 9,2B | 8.192 | Preentrenamiento + RLHF | Gemma |
| ebt005/gemma-2-9b-it-dgs-dpo-B | 9,2B + 54M adaptador | 8.192 | QLoRA + DPO sobre 329 pares | Gemma |
| princeton-nlp/gemma-2-9b-it-DPO (referencia) | 9,2B + adaptador | 8.192 | DPO sobre dataset general | Gemma |

No se dispone de datos de rendimiento comparativo (MMLU, etc.) para ninguno de estos adaptadores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental, no apto para uso en produccion ni para tareas generales.
- Entrenado exclusivamente en ingles y sobre un dominio muy reducido (preguntas de ARC con feedback adverso falso).
- El adaptador solo modifica la preferencia de longitud; no se ha evaluado su efecto sobre la calidad o correccion de las respuestas.
- La licencia Gemma restringe el uso comercial y requiere cumplir las politicas de uso aceptable de Google.
- Riesgo de alucinacion y sesgos heredados del modelo base Gemma-2-9B-it, no mitigados por este adaptador.
- La interpretacion de los resultados solo es valida en el contexto del experimento preregistrado completo (brazo A + brazo B); usar el adaptador de forma aislada no tiene significado cientifico.
- No se proporcionan garantias de rendimiento ni de seguridad; el autor advierte explicitamente que el entrenamiento no licencia ninguna afirmacion sobre la experiencia del modelo.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ebt005/gemma-2-9b-it-dgs-dpo-B
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-2-9b-it
- Repositorio oficial de Gemma en GitHub: https://github.com/google-deepmind/gemma
- Model card del modelo base (documentacion de Google): https://huggingface.co/google/gemma-2-9b-it
- Referencia a adaptador DPO similar (princeton-nlp): https://www.modelscope.cn/models/princeton-nlp/gemma-2-9b-it-DPO/summary

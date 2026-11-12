# iclropen/evidence-audit-timezero7b-pc-a05-s1

## Resumen

`evidence-audit-timezero7b-pc-a05-s1` es un adaptador LoRA para el modelo `wwwyyy/TimeZero-Charades-7B`, un modelo de grounding temporal de vídeo construido sobre la arquitectura Qwen2.5-VL. Lo publica el usuario `iclropen` como material complementario de un artículo en revisión para ICLR 2027 titulado *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. El adaptador no es un modelo autónomo: contiene únicamente los pesos LoRA (~190 MB en safetensors) y requiere cargar el modelo base para funcionar.

El objetivo del adaptador es entrenar al modelo para que su predicción dependa realmente de la evidencia visual y no de atajos estadísticos. Para ello se usa un objetivo "placebo-controlled": se comparan ediciones del vídeo dentro del intervalo anotado (evidencia) con ediciones equivalentes fuera de él (placebo), penalizando que el modelo cambie su respuesta ante el placebo. Este adaptador concreto corresponde a una de las condiciones del barrido experimental (alpha=0.5, semilla 1).

Su relevancia es metodológica más que de producto: sirve para reproducir y auditar los experimentos del artículo, no para despliegue en producción. El repositorio es de tamaño reducido (0,2 GB), sin descargas ni likes, y la información pública sobre el modelo base y sus resultados es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL (modelo base `wwwyyy/TimeZero-Charades-7B`) |
| Parametros totales | no disponible (el adaptador LoRA ocupa 190.442.760 bytes; los parámetros del base no se detallan) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, presumiblemente bf16/fp32 según el script de carga) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |
| Libreria | peft (transformers 5.x, probado con 5.12.1; peft 0.19.1 o superior) |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Modelo base | wwwyyy/TimeZero-Charades-7B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer multimodal tipo Qwen2.5-VL especializado en grounding temporal de vídeo (localización de intervalos temporales a partir de una consulta en lenguaje natural). El entrenamiento usa LoRA con rango 16 y alpha 32 sobre los módulos de atención y MLP (q/k/v/o/gate/up/down_proj) del modelo base. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas, y el orden de mensajes es vídeo primero y texto después.

El objetivo de entrenamiento es específico del artículo: una combinación de NLL sobre el vídeo limpio (con peso alpha=0.5) y términos de margen sobre ediciones del vídeo. Las ediciones dentro del intervalo anotado (evidencia, x_E) y las ediciones equivalentes fuera de él (placebo, x_O) se usan para forzar que la respuesta del modelo dependa de la evidencia y no de artefactos. Se añade un término hinge que acota la caída de rendimiento ante el placebo (d_O entrenado <= 1.25 d_O referencia + 0.10, peso 1.0) y pesos de operador ajustados con Group-DRO. Los operadores de edición son swap, mask, blur, tshift y shuffle, aplicados dos por ejemplo. Se entrenó con 2.400 pares de Charades-STA, 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8 y semilla 1. El script de entrenamiento es `code/27_papo_train_qcdro_v3seln_r5.py`.

Una advertencia técnica relevante: los adaptadores entrenados con transformers 4.51 usan claves `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la versión equivocada no lanza error pero deja los pesos LoRA sin cargar, por lo que la model card incluye un self-check que verifica que cada tensor LoRA del fichero ha aterrizado en un módulo con los valores correctos.

## Capacidades

- Grounding temporal de vídeo: localización de intervalos temporales en un vídeo a partir de una consulta textual (tarea Charades-STA).
- Comprensión multimodal vídeo-texto heredada de Qwen2.5-VL (el adaptador modula el comportamiento del base, no añade capacidades nuevas).
- Dependencia de evidencia: el adaptador está entrenado para que la predicción se apoye en el contenido visual del intervalo anotado y no en atajos estadísticos, según el objetivo placebo-controlled.
- Robustez ante ediciones del vídeo: entrenado con perturbaciones (swap, mask, blur, tshift, shuffle) para mantener respuestas estables ante cambios fuera del intervalo relevante.
- No se documentan capacidades de tool calling, agentes, thinking mode, audio ni otras modalidades en la información disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Reproducción de experimentos del artículo: cargar el adaptador con la versión exacta de transformers (5.12.1) y peft (0.19.1+) indicada y ejecutar los scripts de auditoría del repositorio de código para verificar los resultados de la condición alpha=0.5, semilla 1.
- Auditoría de dependencia de evidencia: usar el adaptador junto con el modelo base para medir cuánto cambia la predicción ante ediciones placebo fuera del intervalo anotado, aplicando el protocolo de auditoría de comportamiento descrito en la model card.
- Investigación en robustez de modelos de vídeo: comparar este adaptador con otras condiciones del barrido (otras semillas, otros valores de alpha) para estudiar la varianza del entrenamiento con el objetivo placebo-controlled.
- Evaluación de grounding temporal en Charades-STA: ejecutar la evaluación de precisión a 2 fps con decodificación greedy usando los scripts del repositorio de código, que aceptan `--model  --adapter <folder>`.
- Desarrollo de métodos de entrenamiento anti-atajo: reutilizar el objetivo y los hiperparámetros documentados como referencia para entrenar adaptadores LoRA con objetivos de dependencia de evidencia en otros conjuntos de vídeo.
- Verificación de pipelines de carga PEFT: el self-check incluido sirve como plantilla para detectar cargas silenciosas fallidas de adaptadores LoRA entre versiones de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; depende del modelo base `wwwyyy/TimeZero-Charades-7B` (7B parámetros) y del número de fotogramas procesados (hasta 768 a 2 fps), que incrementa el uso de memoria de forma significativa.
- GPU recomendadas: no disponible en la información proporcionada; el script de carga usa `device_map="auto"` y `torch_dtype=torch.bfloat16`.
- GPU de consumo: no disponible; un modelo base de 7B en bf16 requiere del orden de 14-16 GB solo para pesos, antes de activaciones y procesamiento de vídeo, por lo que no cabe en GPUs de gama media sin cuantización, y la cuantización del base no está documentada.
- Opciones de despliegue: carga vía transformers + peft (versiones indicadas); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timezero7b-pc-a05-s1 (este) | LoRA sobre base 7B | no disponible | Grounding temporal de vídeo con objetivo placebo-controlled | other | Hugging Face, 0 descargas |
| wwwyyy/TimeZero-Charades-7B (base) | 7B (arquitectura Qwen2.5-VL) | no disponible | Grounding temporal de vídeo (Charades-STA) | no disponible | Hugging Face |
| Otras condiciones del mismo barrido (otras semillas/alpha) | LoRA sobre base 7B | no disponible | Igual, con hiperparámetros distintos | other | Hugging Face (mismo autor) |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: sin el modelo base `wwwyyy/TimeZero-Charades-7B` no produce ninguna salida.
- Riesgo de carga silenciosa fallida: usar transformers distinto de 5.x (probado 5.12.1) deja los pesos LoRA sin cargar sin lanzar error; es obligatorio ejecutar el self-check incluido en la model card.
- Licencia "other": no se detallan los términos, por lo que el uso comercial no está garantizado y requiere consultar la licencia del modelo base y del adaptador.
- Ámbito muy restringido: entrenado solo con 2.400 pares de Charades-STA y 300 pasos, lo que limita su generalización fuera de ese dominio y tarea.
- Sin datos de sesgos, alucinación ni rendimiento multilingüe publicados; no se puede evaluar su comportamiento fuera de la tarea de grounding temporal.
- Material de investigación en revisión (ICLR 2027): los resultados y el método pueden cambiar; el adaptador corresponde a una respuesta de autores, no al PDF enviado.
- Sin descargas ni validación por la comunidad (0 descargas, 0 likes), lo que reduce la confianza en su reproducibilidad fuera del entorno del autor.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-timezero7b-pc-a05-s1
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Repositorio de código: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: Anonymous, *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (under review); sin enlace público disponible en la información proporcionada.

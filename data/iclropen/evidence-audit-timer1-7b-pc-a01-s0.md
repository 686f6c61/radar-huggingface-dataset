# iclropen/evidence-audit-timer1-7b-pc-a01-s0

## Resumen

`evidence-audit-timer1-7b-pc-a01-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `Boshenxx/Time-R1-7B`, un modelo de 7.000 millones de parametros con arquitectura Qwen2.5-VL especializado en localizacion temporal de eventos en video (video temporal grounding). El adaptador no es un modelo autonomo: solo contiene los pesos LoRA (190 MB en `adapter_model.safetensors`) y requiere cargar el modelo base para funcionar.

El adaptador se enmarca en el articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envio a ICLR 2027, en revision). Su objetivo es entrenar al modelo para que su prediccion dependa realmente de la evidencia visual del intervalo anotado y no de atajos espurios: se entrena con una objetivo "placebo-controlled" que penaliza que la respuesta cambie cuando se editan porciones del video fuera del intervalo anotado (placebo) y premia la sensibilidad a ediciones dentro de la evidencia real.

Es relevante para investigadores que trabajen en evaluacion de fidelidad de modelos de video y en tecnicas de entrenamiento que midan dependencia de evidencia, no solo exactitud. La ficha tecnica del adaptador es muy especifica: alpha=0.1, beta=0.1, LoRA r=16, 300 pasos de optimizacion sobre 2.400 pares de entrenamiento de Charades-STA. No hay datos de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen2.5-VL (modelo base Time-R1-7B) |
| Parametros totales | No disponible (el adaptador LoRA pesa 190.442.760 bytes; el modelo base es de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones de Qwen2.5-VL) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Boshenxx/Time-R1-7B |
| Libreria | peft (transformers >= 5.12, peft >= 0.19.1) |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Entrada de video | 2 fps, maximo 768 frames |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Time-R1-7B, un modelo con arquitectura Qwen2.5-VL (transformer multimodal con torre visual y decoder de lenguaje) especializado en grounding temporal de video. El adaptador LoRA modifica las proyecciones de atencion (q/k/v/o) y las proyecciones del MLP (gate/up/down) con rango 16, alpha 32 y dropout 0.05, lo que supone 190 MB de pesos adicionales. No se modifica la torre visual ni se anaden cabezas nuevas.

El entrenamiento sigue el objetivo de la Seccion 4 del paper: una combinacion de NLL sobre el video limpio (con peso alpha=0.1) y terminos de margen que penalizan que la recompensa del modelo sobre el video limpio sea menor que sobre el video con evidencia editada (x_E) o con un placebo editado fuera del intervalo anotado (x_O), mas un termino hinge que acota la caida de rendimiento en el placebo (d_O <= 1.25 d_O referencia + 0.10, peso 1.0). Se usan 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizacion, learning rate 5e-6, acumulacion de gradiente 8, semilla 0 y pesos por operador mediante Group-DRO. Los operadores de edicion son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. El prompt y el estilo de respuesta siguen el formato `timer1_default`/`timer1` con el video primero y el texto despues. El adaptador se entreno con transformers 4.51 y se distribuye en un formato de claves compatible con transformers 5.x, lo que exige ejecutar el self-check de la model card para evitar cargas silenciosas sin efecto.

## Capacidades

- Localizacion temporal de eventos en video (video temporal grounding): dado un video y una consulta textual, predice el intervalo temporal del evento.
- Robustez a ediciones del video fuera del intervalo anotado (placebo), objetivo central del entrenamiento.
- Sensibilidad a ediciones dentro de la evidencia real (swap, mask, blur, tshift, shuffle).
- Procesamiento multimodal video-texto heredado de Qwen2.5-VL: entrada de hasta 768 frames a 2 fps.
- Generacion de texto y razonamiento sobre el contenido visual del video.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en fidelidad de modelos de video: el adaptador sirve como referencia entrenada para medir dependencia de evidencia frente a exactitud bruta, usando los scripts de auditoria de probabilidad y auditoria comportamental del repositorio de codigo.
- Evaluacion de sesgos de atajo en grounding temporal: permite comparar un modelo entrenado con objetivo placebo-controlled frente al base Time-R1-7B sin adaptador en el mismo conjunto de Charades-STA.
- Reproducibilidad de experimentos: los hiperparametros (alpha=0.1, beta=0.1, 300 pasos, semilla 0, 2.400 pares) y el script de entrenamiento (`code/27_papo_train_qcdro_v3seln_r5.py`) permiten replicar el adaptador.
- Analisis de robustez ante corrupciones de video: los operadores swap, mask, blur, tshift y shuffle se pueden reutilizar para probar la estabilidad de otros modelos de grounding.
- Busqueda de momentos en archivos de video: uso del adaptador combinado con el base para localizar segmentos relevantes en consultas de video largo (hasta 768 frames a 2 fps), con la cautela de que la calidad fuera de Charades-STA no esta validada.
- Docencia y formacion: ejemplo practico de entrenamiento PEFT con objetivos de margen y Group-DRO sobre un modelo multimodal de 7B, util en cursos de aprendizaje automatico aplicado a video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el adaptador aparece en las Tablas 6, 7, 10, 13, 14 y 18 y en las Figuras 1 y 4 del paper, pero no incluye los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 7B y en bfloat16 requiere aproximadamente 14-16 GB solo para los pesos, mas la memoria de activaciones para hasta 768 frames de video, que puede elevar el consumo significativamente.
- GPU recomendadas: A100 40/80 GB o H100 para procesar el maximo de frames sin restricciones; en GPUs de 24 GB (RTX 4090) puede requerir reducir el numero de frames o usar cuantizacion del base.
- GPU de consumo: posible en RTX 4090 (24 GB) con cuantizacion del modelo base y reduccion de frames; en GPUs de 16 GB o menos no cabe en bfloat16.
- Opciones de despliegue: transformers 5.x con peft 0.19.1 o superior (combinacion probada en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timer1-7b-pc-a01-s0 (este) | 7B base + LoRA 190 MB | No disponible | Grounding temporal de video con objetivo placebo-controlled | Apache-2.0 | Hugging Face (adaptador) |
| Boshenxx/Time-R1-7B | 7B | No disponible | Grounding temporal de video | No disponible | Hugging Face (modelo base) |
| Qwen2.5-VL (7B) | 7B | No disponible | Vision-lenguaje general | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: sin el base `Boshenxx/Time-R1-7B` no funciona, y la carga con una version incorrecta de transformers puede dejar los pesos LoRA sin aplicar sin lanzar error; es obligatorio ejecutar el self-check de la model card.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares); la generalizacion a otros dominios de video o a videos mas alla de 768 frames a 2 fps no esta validada.
- El objetivo placebo-controlled puede reducir la exactitud bruta a cambio de mayor fidelidad a la evidencia; los valores de este compromiso no se publican en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen2.5-VL/Time-R1-7B.
- Idiomas soportados no especificados; el prompt de entrenamiento usa el formato `timer1_default`, lo que puede limitar la transferencia a otros formatos de consulta.
- Licencia Apache-2.0 para el adaptador, pero las condiciones del modelo base deben verificarse por separado antes de uso comercial.
- Publicado como parte de un envio a ICLR 2027 en revision: los resultados y conclusiones pueden cambiar tras la revision por pares.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-timer1-7b-pc-a01-s0
- Modelo base: https://huggingface.co/Boshenxx/Time-R1-7B
- Repositorio de codigo: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, en revision; sin enlace directo en la informacion disponible)

# minhlt12/qwen3.5-4b-lora-vi-ticket-triage

## Resumen

El modelo `minhlt12/qwen3.5-4b-lora-vi-ticket-triage` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por minhlt12 como trabajo de curso para el programa AICB-P2T3, específicamente para la tarea de triage de tickets de soporte al cliente en vietnamita. El adaptador se aplica sobre el modelo base `unsloth/Qwen3.5-4B`, un modelo denso de 4 mil millones de parámetros de la familia Qwen3.5, y transforma un ticket de soporte en un objeto JSON estricto con cuatro campos: `intent`, `urgency`, `product` y `sentiment`.

El modelo está publicado con licencia Apache 2.0 y está pensado como un artefacto educativo, no como una solución de producción. La propia model card advierte explícitamente que el adaptador falla su propia prueba de regresión: mejora la tarea objetivo (de 0.765 a 0.970) pero degrada el conocimiento general en 0.302 puntos (de 0.758 a 0.456), superando con creces la tolerancia de 0.020 del laboratorio. Este es un caso clásico de olvido catastrófico, ya que el 100% de los datos de entrenamiento eran tickets convertidos a JSON, sin mezcla de datos generales.

A pesar de sus limitaciones, el modelo es relevante como ejemplo didáctico de fine-tuning con LoRA, de medición de regresión y de los riesgos del sobreajuste a un dominio estrecho. También demuestra un fallo de comportamiento interesante: el adaptador no logra aprender correctamente el marcador de baja urgencia "Khi nào tiện" a pesar de tener suficientes ejemplos de entrenamiento, probablemente por un conflicto con el prior del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (dense, gated delta networks) + adaptador LoRA |
| Parametros totales | 4.000.000.000 (base) + 32.464.896 (adaptador entrenable) |
| Parametros activos | 32.464.896 (solo adaptador) |
| Longitud de contexto | 262.144 (base, segun vLLM Recipes); 1024 (max_length de entrenamiento del adaptador) |
| Tipos de cuantizacion | No disponible (entrenado en fp16 sin cuantizar) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `unsloth/Qwen3.5-4B`, un modelo denso de la familia Qwen3.5 que emplea arquitectura de gated delta networks, incorpora un encoder de visión y soporta decodificacion MTP (Multi-Token Prediction). El adaptador LoRA se aplica sobre 12 modulos lineales (`q,k,v,o,gate,up,down` y proyecciones) con rango 16 y alpha 32, lo que resulta en 32.464.896 parametros entrenables. El entrenamiento se realizo con PEFT 0.20.0 en precision fp16, sin cuantizacion, sobre una GPU Tesla T4 de 16 GB en Colab Free, con un pico de memoria de 12.01 GB y una duracion de 1037.5 segundos.

El dataset de entrenamiento consistio en 250 tickets de soporte sinteticos en vietnamita (225 para entrenamiento, 25 para validacion, semilla 42), generados a partir de una familia de plantillas fijas. Se utilizo un maximo de 30 pasos de optimizacion con un batch efectivo de 16 (1 x 16 grad-accum), learning rate de 1e-4 (10 veces la escala tipica de full fine-tuning) y una mascara de perdida solo sobre las respuestas del asistente, con una fraccion supervisada de 0.4149. La longitud maxima de secuencia se fijo en 1024 tokens, aunque el percentil 95 medido fue de 98 tokens, por lo que no hubo truncamiento.

## Capacidades

- Clasificacion de tickets de soporte en vietnamita en un objeto JSON estricto con 4 campos: `intent`, `urgency`, `product` y `sentiment`.
- Vocabulario cerrado de etiquetas: `intent` ∈ {`doi_tra`, `van_chuyen`, `hoan_tien`, `san_pham_loi`, `hoi_thong_tin`}, `urgency` ∈ {`cao`, `trung_binh`, `thap`}, `sentiment` ∈ {`tieu_cuc`, `trung_tinh`, `tich_cuc`}.
- Generacion de texto en formato JSON estructurado, utilizable para pipelines de automatizacion de soporte.
- El modelo base subyacente (Qwen3.5-4B) tiene capacidades adicionales de vision, razonamiento, codigo y agentes, pero el adaptador solo esta entrenado para la tarea de triage y no se recomienda usarlo fuera de ese dominio.
- Soporte de decodificacion greedy (`do_sample=False`) para resultados deterministas, como se reporta en la model card.

## Casos de uso

- Demostracion educativa de fine-tuning con LoRA: el adaptador sirve para ensenar como se entrena un modelo de clasificacion de tickets y como se mide el olvido catastrofico mediante pruebas de regresion.
- Reproduccion de experimentos de medicion de regresion: los datos publicados permiten replicar el harness de evaluacion y verificar el fallo de la puerta de regresion.
- Analisis de conflictos entre el prior del modelo base y las etiquetas de entrenamiento: el caso de "Khi nào tiện" es un ejemplo documentado de como un patron linguistico puede chocar con el conocimiento previo del modelo.
- Prototipo de clasificador de tickets en entornos controlados: si se corrige el olvido catastrofico mezclando datos generales (1-5%), el adaptador podria servir como base para un sistema de triage en vietnamita.
- Investigacion sobre el impacto del numero de pasos de optimizacion en la adquisicion de reglas: el estudio muestra que 30 pasos son suficientes para reglas que coinciden con el prior, pero no para las que lo contradicen.
- Referencia para el desarrollo de adaptadores LoRA en tareas de dominio especifico con datos sinteticos: la metodologia de evaluacion (target + regression) es reutilizable.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados medida con un harness de evaluacion fijo sobre un conjunto objetivo de 50 items y un conjunto de regresion de 15 items. Los tres escenarios comparten los pesos base y difieren solo en el prompt o en el adaptador.

| Run | target | regression | format | latencia (ms/muestra) |
|---|---|---|---|---|
| (a) base + prompt ingenuo | 0.000 | 0.758 | 0.00 | 3332.1 |
| (b) base + prompt optimizado | 0.765 | 0.758 | 1.00 | 1031.4 |
| (c) adaptador LoRA | 0.970 | 0.456 | 1.00 | 1520.8 |

El veredicto es "FAILED": la mejora en target es de +0.205, pero la regresion es de -0.302, muy por encima de la tolerancia de 0.020. El baseline (a) obtiene 0.000 en target porque rara vez emite JSON parseable, lo que impide puntuar cualquier campo. El adaptador consigue 44/50 items correctos en el conjunto objetivo; los 6 errores restantes son todos del mismo tipo: prediccion de `urgency` como `trung_binh` cuando la etiqueta dorada es `thap`, en tickets que contienen la frase "Khi nào tiện".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-4B en fp16 requiere aproximadamente 8-9 GB de VRAM; con el adaptador LoRA cargado, el uso adicional es minimo (menos de 0.5 GB). En cuantizacion de 4 bits, cabria en GPUs con 6 GB o menos.
- GPU recomendadas: el entrenamiento se realizo en una Tesla T4 de 16 GB (Colab Free). Para inferencia, una RTX 3060 de 12 GB o superior es suficiente. El modelo base esta disenado para GPUs de consumo de 16 GB segun vLLM Recipes.
- Compatibilidad con GPUs de consumo: si, el modelo base de 4B es adecuado para RTX 4090, RTX 3090, RTX 3080, etc. En cuantizacion GGUF de 4 bits, incluso una RTX 3060 de 12 GB puede ejecutarlo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con PEFT. El adaptador se carga con `PeftModel.from_pretrained` sobre el modelo base.
- Latencia y throughput: segun la model card, la latencia media del adaptador es de 1520.8 ms por muestra en la GPU T4 utilizada. Con hardware mas moderno (A100, H100) la latencia seria significativamente menor, aunque no se proporcionan datos especificos.

## Comparativa con modelos similares

No se dispone de datos publicados de otros adaptadores LoRA especificamente entrenados para triage de tickets en vietnamita sobre Qwen3.5-4B. Como referencia, se puede comparar el comportamiento del adaptador con el modelo base sin adaptador:

| Modelo | target | regression | formato JSON | licencia |
|---|---|---|---|---|
| Qwen3.5-4B base + prompt ingenuo | 0.000 | 0.758 | 0.00 | Apache 2.0 |
| Qwen3.5-4B base + prompt optimizado | 0.765 | 0.758 | 1.00 | Apache 2.0 |
| Qwen3.5-4B + adaptador LoRA (este modelo) | 0.970 | 0.456 | 1.00 | Apache 2.0 |

No se han encontrado comparaciones con otros adaptadores de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- El adaptador falla su propia puerta de regresion: degrada el conocimiento general en 0.302 puntos, muy por encima de la tolerancia de 0.020. No debe desplegarse en produccion.
- Entrenado exclusivamente con tickets sinteticos de una familia de plantillas fija. El texto real de soporte es mas variado y los resultados no se transferiran sin cambios.
- Solo soporta vietnamita. El vocabulario de etiquetas es cerrado y no admite categorias fuera de las definidas.
- El entrenamiento es de escala de laboratorio: 30 pasos sobre 225 ejemplos, no convergido. Los resultados pueden variar con mas datos o pasos.
- El conjunto de evaluacion es pequeno (50 objetivo / 15 regresion); diferencias de pocos puntos deben tratarse como ruido.
- Existe un fallo sistematico conocido: el adaptador predice `urgency` como `trung_binh` en lugar de `thap` para tickets con la frase "Khi nào tiện", probablemente por un conflicto con el prior del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el estado del modelo (no apto para produccion) limita su aplicabilidad real.

## Enlaces

- HuggingFace: https://huggingface.co/minhlt12/qwen3.5-4b-lora-vi-ticket-triage
- Repositorio de experimento similar (Qwen3.5-4B LoRA SFT): https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- vLLM Recipes para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Guia de fine-tuning de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- CanIRun.ai - Qwen3.5 4B: https://www.canirun.ai/model/qwen3.5-4b
- Modelo base Qwen3-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B

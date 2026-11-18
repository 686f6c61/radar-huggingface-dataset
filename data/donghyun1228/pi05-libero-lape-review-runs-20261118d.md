# Donghyun1228/pi05-libero-lape-review-runs-20261118d

## Resumen

El repositorio `Donghyun1228/pi05-libero-lape-review-runs-20261118d` no es un modelo de lenguaje generativo al uso, sino un conjunto de políticas de evaluación (evaluation policies) derivadas del modelo π0.5 (pi05) aplicado al benchmark de manipulación robótica LIBERO. Lo publica el usuario Donghyun1228 como parte de una serie de artefactos de revisión (parte 7 de una secuencia que arranca el 2026-11-13) para responder a preguntas de revisores sobre controles de pesos por capa en la Tabla 4 de un artículo sobre LAPE (Layer-Adaptive Policy Editing o similar). El repositorio contiene únicamente los resultados de las ejecuciones de evaluación, no los checkpoints nativos ni el estado de entrenamiento.

El interés técnico está en que documenta experimentos controlados de adaptación de políticas visión-lenguaje-acción (VLA) sobre LIBERO, midiendo tasas de éxito bajo distintas condiciones de vista (`view_large`, `yaw30`) y distintas estrategias de ponderación de capas (ancla lineal en profundidad, Surgical FT, semillas de entrenamiento uniformes/invertidas, λ=1e-2). Las ejecuciones se hicieron en H100 con semilla de entorno 7 y 2000 episodios por run, lo que da una base estadística razonable para comparar condiciones.

Es relevante ahora porque la reproducibilidad en robótica VLA es un cuello de botella: publicar las políticas de evaluación y las tasas de éxito por condición permite a otros grupos verificar los controles del artículo sin reentrenar. No obstante, al no incluir checkpoints ni código dentro del repo (solo enlaza a un repositorio externo de GitHub), su utilidad directa es limitada fuera del contexto de revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (políticas derivadas de π0.5, VLA; arquitectura base no detallada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene políticas de evaluación; los checkpoints nativos y el train_state no están incluidos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base π0.5 ni del adaptador LAPE. Lo que sí se documenta es el protocolo experimental: se evalúan políticas bajo dos condiciones de cámara (`view_large` y `yaw30`), con variantes de ponderación de capas (ancla lineal en profundidad, Surgical FT, semillas de entrenamiento uniformes e invertidas) y una configuración de λ=1e-2. Cada run se ejecuta con semilla de entorno 7 y 2000 episodios en GPU H100, y se reporta el renderizador usado (`egl` u `osmesa`), lo que sugiere que el pipeline de evaluación depende de renderizado offscreen para generar observaciones.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO; en el contexto de LIBERO, el entrenamiento sería por imitación sobre demostraciones, pero esto no se confirma en la información proporcionada. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El repositorio es, por tanto, un artefacto de evaluación más que una ficha de modelo entrenado.

## Capacidades

- Ejecución de políticas VLA sobre tareas de manipulación del benchmark LIBERO.
- Evaluación bajo dos condiciones de vista: `view_large` y `yaw30`.
- Soporte de distintos esquemas de ponderación de capas (ancla lineal, Surgical FT, uniforme/invertida).
- Medición de tasa de éxito sobre 2000 episodios por run con semilla de entorno fija (7).
- Renderizado offscreen mediante `egl` u `osmesa` para generar observaciones.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Reproducción de controles de la Tabla 4: un grupo revisor puede cargar las políticas de evaluación y replicar las tasas de éxito reportadas para las condiciones `view_large` y `yaw30` sin reentrenar el modelo base.
- Auditoría de robustez ante cambio de punto de vista: comparar `view_large` (64,95–73,15 %) frente a `yaw30` (90,50–91,35 %) permite cuantificar la sensibilidad de la política a la cámara en LIBERO.
- Análisis de estrategias de adaptación por capas: las variantes `fresh1250`, `lape` y `uniform` permiten aislar el efecto de la ponderación de capas sobre la tasa de éxito.
- Verificación de estabilidad entre semillas: pares como `fresh1250_view_large_s1`/`s2` y `lape_view_large_s7`/`s8` permiten estimar la varianza entre ejecuciones.
- Comparación de renderizadores: runs con `egl` y `osmesa` sobre la misma condición (`lape_view_large_s7` vs `s8`, `uniform_view_large_s7` vs `s8`) sirven para evaluar si el backend de renderizado afecta a los resultados.
- Base para meta-análisis de adaptación VLA: agregar esta parte con las anteriores (20261113 a 20261117) permite construir una curva de ablation sobre el artículo LAPE.

## Benchmarks y rendimiento

Resultados de tasa de éxito (%) reportados en la model card, sobre LIBERO con semilla de entorno 7 y 2000 episodios por run:

| Run | Condición | Éxito (%) | Renderizador |
|---|---|---|---|
| fresh1250_view_large_s1 | view_large | 66,80 | egl |
| fresh1250_view_large_s2 | view_large | 64,95 | egl |
| fresh1250_yaw30_s1 | yaw30 | 91,35 | egl |
| fresh1250_yaw30_s2 | yaw30 | 90,50 | egl |
| lape_view_large_s7 | view_large | 73,15 | osmesa |
| lape_view_large_s8 | view_large | 65,50 | egl |
| lape_yaw30_s5 | yaw30 | 90,75 | egl |
| uniform_view_large_s7 | view_large | 71,30 | osmesa |
| uniform_view_large_s8 | view_large | 69,45 | egl |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que se trata de un modelo de política robótica y no de un LLM.

## Requisitos de hardware

- GPU empleada en la evaluación: NVIDIA H100 (según la model card).
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: H100 para reproducir el protocolo original; no se documentan alternativas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama, TGI no aplican a este artefacto); el código de evaluación está en `github.com/Donghyun1228/vla_adaptation`.
- Latencia y throughput: no disponibles; el coste experimental se describe en episodios (2000 por run) y renderizador (`egl`/`osmesa`), no en métricas de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas VLA sobre LIBERO) ni datos de arquitectura, parámetros o contexto que permitan una comparación cuantitativa fiable. Las únicas referencias internas son las partes anteriores de la misma serie (`pi05-libero-lape-review-runs-20261113`, `-20261114`, `-20261115`, `-20261116b`, `-20261117`), que comparten protocolo pero no se comparan aquí por falta de datos.

## Limitaciones y advertencias

- El repositorio no incluye checkpoints nativos ni `train_state`; solo contiene políticas de evaluación, por lo que no permite reentrenar ni inspeccionar los pesos del modelo base.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido.
- No se declaran idiomas soportados ni pipeline; la metadata de Hugging Face está prácticamente vacía (0 descargas, 0 likes, solo tag `region:us`).
- El tamaño del repo es de 69,4 GB, coherente con políticas de evaluación pesadas, pero no se desglosa su contenido.
- Las tasas de éxito dependen de una única semilla de entorno (7); la varianza entre semillas de entrenamiento se observa en los pares s1/s2 y s7/s8, pero no se reportan intervalos de confianza.
- Los resultados mezclan renderizadores (`egl` y `osmesa`) entre runs de la misma condición, lo que puede introducir un factor de confusión no controlado explícitamente.
- No hay información sobre sesgos, riesgo de alucinación o comportamiento fuera de distribución; en robótica VLA el riesgo principal es la generalización limitada a condiciones de cámara y tareas no vistas, pero esto no se cuantifica en la información disponible.
- El artefacto está pensado para revisión de un artículo concreto; su valor fuera de ese contexto es limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261118d
- Código de evaluación: https://github.com/Donghyun1228/vla_adaptation
- Parte anterior de la serie: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261117
- Parte anterior de la serie: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261116b
- Parte anterior de la serie: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261115
- Parte anterior de la serie: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261114
- Parte anterior de la serie: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261113

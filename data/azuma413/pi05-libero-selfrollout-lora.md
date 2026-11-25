# Azuma413/pi05-libero-selfrollout-lora

## Resumen

π0.5 LIBERO LoRA adapter es un adaptador LoRA de rango 16 sobre el checkpoint `lerobot/pi05_libero_base`, un modelo de politica visuomotora para robotica construido sobre la arquitectura π0.5 (derivada de PaliGemma). Lo desarrolla el usuario Azuma413 y se entrena mediante behavior cloning sobre 5.225 episodios exitosos que el propio modelo base genero en los cuatro conjuntos estandar de LIBERO (Spatial, Object, Goal y 10). El resultado es un adaptador que refina el comportamiento del checkpoint base en tareas de manipulacion robotica de horizonte corto.

El interes tecnico reside en la estrategia de self-rollout: en lugar de depender exclusivamente de demostraciones humanas, se recogen rollouts del propio modelo, se filtran por exito y se reentrena sobre ellos con perturbaciones deliberadas en las acciones ejecutadas. Esto produce un dataset de 808.143 fotogramas a 10 Hz que captura la distribucion de estados que el modelo visita realmente, un enfoque cercano a DAgger pero sin anotacion humana adicional.

Es un adaptador de nicho, orientado a investigacion en robotica y a evaluacion en los benchmarks LIBERO, no a uso general de lenguaje. Su licencia Gemma impone restricciones de uso derivadas del modelo base PaliGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (policy visuomotora derivada de PaliGemma), adaptador LoRA sobre transformer preentrenado |
| Parametros totales | no disponible (el adaptador LoRA r=16 no reporta recuento; el base `lerobot/pi05_libero_base` no lo especifica en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16; el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de tarea en LIBERO son en ingles) |
| Licencia | Gemma Terms of Use (Model Derivative), incluida Gemma Prohibited Use Policy |
| Formato de pesos | safetensors (adaptador LoRA PEFT para lerobot) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `lerobot/pi05_libero_base`, un checkpoint de la familia π0.5 implementado en la libreria LeRobot. π0.5 es una politica visuomotora que combina un backbone de vision-lenguaje derivado de PaliGemma con una cabeza de accion que emite chunks de acciones de efector final. El adaptador es un LoRA de rango 16 con los objetivos PEFT por defecto de LeRobot para π0.5, entrenado durante 20.000 pasos con batch 32, optimizador AdamW, learning rate 1e-4 y precision bfloat16.

Los datos proceden de 5.225 episodios exitosos (808.143 fotogramas a 10 Hz) generados por el propio checkpoint base en LIBERO-Spatial, LIBERO-Object, LIBERO-Goal y LIBERO-10. La recoleccion ejecuto 10.000 episodios (50 por tarea y bloque); en la mitad de los bloques cada chunk de acciones se perturbo con probabilidad 0,5 mediante una deriva de efector final que crece linealmente hasta un pico de 0,6 a 1,6 en unidades de accion sin normalizar, en direccion aleatoria sobre las seis dimensiones de pose. Solo se conservaron los episodios exitosos y las acciones registradas son las realmente ejecutadas, de modo que la perturbacion altera la distribucion de estados visitados sin corromper las etiquetas. Es una variante de agregacion de datos tipo DAgger sin intervencion humana.

## Capacidades

- Control visuomotor de robot manipulador: genera chunks de acciones de efector final a partir de observaciones visuales e instruccion de tarea.
- Ejecucion de tareas de manipulacion de horizonte corto en los entornos LIBERO (Spatial, Object, Goal, 10).
- Aprendizaje por imitacion sobre rollouts propios filtrados por exito (self-rollout behavior cloning).
- Robustez a perturbaciones de trayectoria introducidas durante la recoleccion de datos.
- Integracion con el ecosistema LeRobot para evaluacion (`lerobot-eval`) y despliegue en pipelines de robotica.
- No soporta tool calling, function calling, agentes de texto ni razonamiento multi-paso en el sentido de un LLM conversacional.
- Capacidades multilingues: no disponibles; las instrucciones de tarea son en ingles.

## Casos de uso

- Evaluacion de politicas en LIBERO: usar el adaptador con `lerobot-eval` para medir la tasa de exito en las cuatro suites y comparar con el checkpoint base sin adaptador.
- Investigacion en self-imitation learning: reproducir el pipeline de recoleccion de rollouts, filtrado por exito y reentrenamiento LoRA para estudiar el efecto de la perturbacion de acciones en la cobertura de estados.
- Refinamiento de politicas con recursos limitados: al ser un LoRA r=16, permite adaptar el modelo base sin reentrenar todos los pesos, util en laboratorios con una sola GPU.
- Base para experimentos de DAgger sin anotacion humana: el esquema de perturbacion y filtrado por exito sirve como plantilla para otros entornos de manipulacion.
- Transferencia a tareas de manipulacion similares: el adaptador puede servir como punto de partida para fine-tuning en tareas con distribucion de estados parecida a LIBERO.
- Docencia y reproduccion de resultados: el par adaptador + dataset permite reproducir el entrenamiento con hiperparametros documentados (20.000 pasos, batch 32, lr 1e-4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en LIBERO ni comparaciones numericas con el checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del checkpoint base π0.5, no documentado en la ficha.
- GPU recomendadas: no disponible. El entrenamiento se realizo en bfloat16, lo que requiere GPU con soporte BF16 (Ampere o posterior, p. ej. A100, H100, RTX 30xx/40xx).
- Compatibilidad con GPU de consumo: no confirmada; el adaptador LoRA en si es pequeno, pero el modelo base debe cargarse completo.
- Opciones de despliegue: LeRobot (`lerobot-eval --policy.path=Azuma413/pi05-libero-selfrollout-lora`). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a politicas roboticas de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Azuma413/pi05-libero-selfrollout-lora | no disponible (LoRA r=16 sobre π0.5) | no disponible | no publicado | Gemma Terms of Use | Hugging Face, 0 descargas |
| lerobot/pi05_libero_base | no disponible | no disponible | no disponible en la informacion | Gemma Terms of Use | Hugging Face (modelo base) |
| Otros adaptadores LIBERO de la familia π0.5 | no disponible | no disponible | no disponible | variable | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado tasas de exito ni benchmarks; no hay evidencia cuantitativa de que el adaptador supere al checkpoint base.
- El adaptador esta especializado en los cuatro entornos LIBERO; su generalizacion a otros robots, tareas o morfologias no esta documentada.
- El entrenamiento se basa en rollouts del propio modelo, lo que puede amplificar sesgos y modos de fallo del checkpoint base (error compounding) pese al filtrado por exito.
- Las perturbaciones de accion se aplicaron en unidades sin normalizar sobre seis dimensiones de pose; el efecto sobre la robustez real no esta cuantificado.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay validacion comunitaria ni mantenimiento demostrado.
- Licencia Gemma Terms of Use: uso comercial sujeto a dichos terminos y a la Gemma Prohibited Use Policy; el adaptador es un Model Derivative y hereda las restricciones del base.
- Idiomas soportados no documentados; las instrucciones de tarea en LIBERO son en ingles.
- El tamano del repo figura como 0.0 GB, dato probablemente redondeado; conviene verificar los pesos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Azuma413/pi05-libero-selfrollout-lora
- Modelo base: https://huggingface.co/lerobot/pi05_libero_base
- Dataset de rollouts: https://huggingface.co/datasets/Azuma413/libero-pi05-success-rollouts
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Libreria LeRobot: no disponible en la informacion proporcionada

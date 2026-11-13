# skyyyyks/cope-alfworld-qwen2.5-7b-seed1-step100

## Resumen

CoPE on ALFWorld Qwen2.5-7B-Instruct (seed 1, step 100) es un ajuste fino del modelo Qwen2.5-7B-Instruct publicado por el usuario skyyyyks. Se trata de un checkpoint intermedio del entrenamiento con CoPE (GRPO mas una perdida auxiliar de prediccion de acciones) sobre el entorno ALFWorld, un benchmark de tareas de agente en mundos de texto con interacciones de tipo TextWorld. El modelo corresponde al paso 100 de un total de 264 (2 epocas) con semilla 1.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct (7.615.616.512 parametros) y sus pesos en bf16, pero ha sido especializado mediante aprendizaje por refuerzo para resolver tareas de agente basadas en texto: navegar habitaciones, recoger y colocar objetos y ejecutar comandos de accion. Es relevante como artefacto de investigacion para reproducir y analizar el entrenamiento con CoPE, no como modelo de proposito general.

La model card indica que solo se publican los pesos (sin estado del optimizador ni del dataloader), por lo que no es posible reanudar exactamente el entrenamiento original. El `generation_config.json` incluido es el del modelo base. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con GRPO + perdida auxiliar de prediccion de acciones (CoPE) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only de ~7.600 millones de parametros. Sobre esa base se aplica CoPE (https://github.com/ulab-uiuc/CoPE), que en este caso es GRPO (Group Relative Policy Optimization) mas una perdida auxiliar de prediccion de acciones ("action-forecast auxiliary loss"). El entrenamiento se realiza en ALFWorld, un entorno de agente textual, con rollouts de hasta 20 rondas y 512 tokens por turno.

Los hiperparametros documentados son: batch de 16 prompts por 8 rollouts, learning rate 1e-6, coeficiente KL de 0.001 (low_var_kl), entropia 0.002, coeficiente de action forecast de 0.01 con K=3, gate `wins`, normalizacion por grupo activada y skip de acciones invalidas activado. El entrenamiento se ejecuto en 4 GPU H20 durante 264 pasos (2 epocas); este checkpoint es el paso 100. Los pesos se fusionaron desde el checkpoint FSDP de verl a un modelo Hugging Face en bf16. No se documentan datos de preentrenamiento adicionales ni composicion del dataset mas alla de ALFWorld.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones (heredada de Qwen2.5-7B-Instruct).
- Ejecucion de tareas de agente en entornos textuales tipo ALFWorld: navegacion entre habitaciones, manipulacion de objetos y cumplimiento de objetivos.
- Razonamiento multi-paso dentro de un episodio de hasta 20 rondas con 512 tokens por turno.
- Formato de interaccion de tipo comando/accion propio de ALFWorld.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado para este ajuste.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: sirve como checkpoint intermedio para estudiar la evolucion del entrenamiento con CoPE y comparar curvas de recompensa frente a GRPO puro.
- Reproduccion de experimentos de ALFWorld: permite evaluar el comportamiento del agente en el paso 100 frente a otros pasos o semillas del mismo entrenamiento.
- Analisis de la perdida auxiliar de prediccion de acciones: util para medir el efecto del action forecast sobre la tasa de exito en tareas de manipulacion de objetos.
- Punto de partida para ajustes posteriores: al ser un modelo en formato transformers/bf16, puede recargarse con `AutoModelForCausalLM` para continuar experimentos o aplicar tecnicas de destilacion.
- Generacion de trayectorias sinteticas de agente: puede emplearse para producir rollouts etiquetados en entornos textuales que alimenten otros entrenamientos.
- Evaluacion de robustez en entornos de agente: permite comparar la tasa de exito del paso 100 frente a checkpoints finales para detectar sobreajuste o inestabilidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de exito ALFWorld en el paso 100 (batch de entrenamiento, 16 tareas x 8 rollouts) | 0.938 |
| Media de los pasos 91-100 | 0.931 |

Nota: la metrica `critic/score/mean` es la tasa de exito sobre el batch de entrenamiento, no una evaluacion en conjunto de retencion (held-out). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, H20 (usadas en entrenamiento), L40S.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con margen ajustado; en RTX 3090 (24 GB) puede requerir cuantizacion o `device_map` con offload.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference`), y en principio vLLM o llama.cpp si se generan pesos GGUF (no publicados oficialmente).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoPE ALFWorld Qwen2.5-7B (este) | 7,6 B | no disponible | 0.938 exito en ALFWorld (batch de entrenamiento, paso 100) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible | no disponible en esta informacion | Apache 2.0 | Hugging Face |
| Otros checkpoints CoPE ALFWorld | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros modelos de agente en ALFWorld en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 100 de 264); no representa el modelo final del entrenamiento.
- La metrica de 0.938 es sobre el batch de entrenamiento, no sobre un conjunto held-out, por lo que puede sobreestimar el rendimiento real.
- No se incluyen estado del optimizador ni del dataloader: no es posible reanudar el entrenamiento original de forma exacta.
- El `generation_config.json` es el del modelo base, no el del ajuste, lo que puede afectar a la generacion por defecto.
- Especializado en ALFWorld; su rendimiento en tareas generales de texto o codigo puede degradarse respecto al modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los del modelo base Qwen2.5-7B-Instruct.
- Riesgo de alucinacion: no evaluado para este ajuste.
- Idiomas soportados: no disponibles; el ajuste se realizo sobre un entorno en ingles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene sus propios terminos que deben respetarse.
- Sin descargas ni likes en Hugging Face en la fecha de consulta; no hay validacion comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/skyyyyks/cope-alfworld-qwen2.5-7b-seed1-step100
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Codigo CoPE: https://github.com/ulab-uiuc/CoPE

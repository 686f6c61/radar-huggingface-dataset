# Shiki42/PutCab-Unconstrained-Train50-V4-PI05-LoRA10K-E1167

## Resumen

PutCab Unconstrained π0.5 LoRA 10K (E1167) es un checkpoint de ajuste fino mediante LoRA sobre el modelo π0.5 de OpenPI, implementado en JAX, para control robótico en el entorno de simulación RoboTwin. Lo desarrolla el usuario Shiki42 como parte de una ablación de "rebuttal" (fecha 2026-11-12) destinada a medir el efecto de eliminar la espera del brazo derecho al abrir el cajón en la tarea Put Object Cabinet (PutCab). El entrenamiento emplea 50 escenas del conjunto `PutCab-Unconstrained-Train50-V4`, con las mismas órdenes por brazo que la variante CTR, pero con cada episodio re-simulado con física.

El modelo no es un LLM ni un modelo multimodal de propósito general: es una política visuomotora (vision-language-action) derivada de π0.5, orientada a la manipulación bimanual en simulación. Su interés es acotado y experimental: sirve como punto de comparación cuantitativo frente al checkpoint E1025 (51,0 % de éxito) y documenta una receta reproducible (LoRA, bf16, batch global 16, 10 000 actualizaciones, semilla 87431, IdleMask activado).

El repositorio ocupa 6,3 GB e incluye únicamente los parámetros de inferencia (`params/`), las estadísticas de normalización (`assets/`) y metadatos del checkpoint; no contiene estado del optimizador ni del cargador de datos. La licencia es Apache 2.0. No se dispone de información sobre idiomas, cuantizaciones ni formato de pesos más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (OpenPI, implementación JAX) con adaptadores LoRA; política visuomotora VLA |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16 según la receta) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural documentada) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (directorio `params/` con parámetros de inferencia; sin mención explícita de safetensors o GGUF) |

## Arquitectura y entrenamiento

El checkpoint parte de π0.5 en su implementación OpenPI sobre JAX y aplica un ajuste LoRA (bf16) durante 10 000 actualizaciones con batch global 16 y semilla 87431. La receta replica la de E1025, incluyendo la máscara de inactividad (IdleMask) activada. La normalización se recalcula mediante cuantiles globales exactos sobre el dataset de entrenamiento y se almacena en `assets/`.

Los datos de entrenamiento son 50 escenas de la tarea Put Object Cabinet en el simulador RoboTwin, correspondientes al dataset `PutCab-Unconstrained-Train50-V4` en la revisión `6c083942913d887dab16ad2c3faee15aeddfcb80`. La diferencia respecto a la variante CTR es que se elimina la espera del brazo derecho al abrir el cajón y se re-simula cada episodio con física. No se documentan en la información disponible el número de tokens, la composición detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Ejecución de una tarea de manipulación bimanual concreta: colocar un objeto en un armario/cajón (PutCab) en el simulador RoboTwin.
- Control por brazo con órdenes específicas por brazo, heredadas del esquema CTR.
- Política visuomotora derivada de π0.5: procesa observaciones visuales y produce acciones motoras.
- Ajuste LoRA sobre un modelo base π0.5, lo que permite reutilizar la infraestructura OpenPI en JAX.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Ablación controlada en investigación: comparar E1167 (44,0 % de éxito) con E1025 (51,0 %) para aislar el efecto de eliminar la espera del brazo derecho en la tarea PutCab; el checkpoint sirve como evidencia cuantitativa en una discusión de rebuttal.
- Reproducción de experimentos en RoboTwin: cargar `params/` y `assets/` con la pila OpenPI para re-ejecutar las 3 × 100 escenas de evaluación con inicio estándar.
- Estudio de recetas LoRA en políticas VLA: usar la configuración bf16, batch 16, 10K updates y semilla 87431 como línea base reproducible para variar hiperparámetros.
- Análisis de normalización: emplear los cuantiles globales exactos de `assets/` para estudiar el impacto de la normalización en el rendimiento de la política.
- Punto de partida para ajustes posteriores: al ser un adaptador LoRA sobre π0.5, puede servir como inicialización para nuevas tareas bimanuales en el mismo simulador.
- Docencia y divulgación en robótica simulada: ejemplo concreto de flujo completo (dataset, entrenamiento LoRA, evaluación estandarizada) para cursos o tutoriales sobre OpenPI.

## Benchmarks y rendimiento

Evaluación sobre 3 × 100 escenas PutCab estándar con inicio estándar:

| Modelo | Escenas evaluadas | Éxitos | Tasa de éxito |
|---|---|---|---|
| PutCab Unconstrained π0.5 LoRA 10K (E1167) | 300 | 132 | 44,0 % |
| E1025 (referencia) | 300 | 153 | 51,0 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general (no aplicables a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 6,3 GB y la receta usa bf16, pero no se detalla el tamaño de los parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: pila OpenPI en JAX (según la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Entrenamiento | Tasa de éxito (PutCab) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E1167 (este) | π0.5 + LoRA | 50 escenas, sin espera del brazo derecho, 10K updates | 44,0 % (132/300) | Apache 2.0 | Hugging Face |
| E1025 | π0.5 + LoRA | 50 escenas, con espera del brazo derecho, IdleMask | 51,0 % (153/300) | no disponible | Hugging Face (referenciado) |
| Otras políticas VLA (π0, RT-2, etc.) | — | — | no disponible | — | — |

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a la referencia E1025 (44,0 % frente a 51,0 %), por lo que no es la mejor opción para desplegar la tarea PutCab.
- Entrenado exclusivamente sobre 50 escenas de una única tarea en simulación (RoboTwin); no se documenta transferencia a robots reales.
- No incluye estado del optimizador ni del cargador de datos, lo que impide reanudar el entrenamiento tal cual.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; al ser una política motora, el riesgo se traduce en acciones erróneas en el simulador.
- Idiomas no aplicables/no disponibles; no hay interfaz de lenguaje natural documentada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación fuera del simulador desaconseja uso en producción sin validación adicional.
- Checkpoint de ablación con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Shiki42/PutCab-Unconstrained-Train50-V4-PI05-LoRA10K-E1167
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Unconstrained-Train50-V4 (revisión `6c083942913d887dab16ad2c3faee15aeddfcb80`)
- OpenPI (implementación de referencia de π0.5): no disponible en la información proporcionada
- RoboTwin (simulador): no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada

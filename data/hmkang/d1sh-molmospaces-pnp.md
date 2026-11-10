# hmkang/d1sh-molmospaces-pnp

## Resumen

d1sh-molmospaces-pnp es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base LiquidAI/d1-3B, desarrollado por el usuario hmkang. El modelo está especializado en robótica de manipulación, concretamente en la tarea de pick-and-place del entorno MolmoSpaces. Su función es responder a la "pregunta de acción" del harness d1-showharness seleccionando uno de los 15 tokens discretos de acción del vocabulario molmo15 (seis variantes MV_*, seis RT_*, GRASP, RELEASE y DONE).

El modelo parte de la arquitectura d1-3B de Liquid AI, un modelo vision-language de 3.000 millones de parámetros, y se ajusta mediante LoRA sobre un conjunto de datos de 1.000 episodios y 75.977 fotogramas anotados con tokens de acción discretos. Las imágenes de entrada son dos cámaras (hombro y muñeca) renderizadas a 448 x 256 píxeles, que producen 112 tokens de imagen cada una.

Es relevante porque demuestra un flujo completo de conversión de políticas robóticas continuas a tokens discretos compatibles con modelos vision-language, y porque publica checkpoints intermedios con métricas de validación por época, lo que facilita el análisis de calibración y el arranque de etapas posteriores de aprendizaje por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base LiquidAI/d1-3B) con adaptadores LoRA |
| Parametros totales | 3B (modelo base); parametros LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0-and-apache-2.0 (LFM Open License v1.0 del modelo base) |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre LiquidAI/d1-3B, un modelo vision-language de 3.000 millones de parámetros. La entrada visual consiste en dos imágenes (cámara de hombro y cámara de muñeca) renderizadas originalmente a 624 x 352 y redimensionadas a 448 x 256 mediante PIL LANCZOS, generando 112 tokens de imagen por vista. La salida se restringe a un vocabulario discreto de 15 tokens de acción (molmo15): seis tokens MV_* de movimiento, seis tokens RT_* de rotación, más GRASP, RELEASE y DONE.

El entrenamiento se realizó mediante SFT sobre el dataset hmkang/molmospaces-pnp-discrete-tokens (config `default`, revisión 43ad970), compuesto por 1.000 episodios y 75.977 fotogramas, con partición 900/100 para entrenamiento y validación. Las etiquetas del dataset se convirtieron al marco de referencia propio del robot mediante el script `mlxp/hf_to_rows.py --swap-lr`, invirtiendo izquierda y derecha respecto a la convención original del dataset. El checkpoint publicado corresponde a 3 épocas de entrenamiento; se recomienda la época 2 por presentar el menor NLL de validación (0,5527), considerada la política mejor calibrada para iniciar RL.

## Capacidades

- Selección de acciones discretas de pick-and-place en el entorno MolmoSpaces mediante el vocabulario molmo15.
- Procesamiento de entrada visual multi-cámara (hombro y muñeca) con 112 tokens de imagen por vista.
- Movimiento relativo en el plano (MV_LEFT, MV_RIGHT y variantes) y rotación (RT_ROLL_LEFT, RT_ROLL_RIGHT y variantes).
- Acciones de agarre (GRASP), liberación (RELEASE) y finalización (DONE).
- Respuesta en el marco de referencia propio del robot (izquierda/derecha del robot, adelante alejándose de la base, arriba hacia arriba).
- Integración con el harness d1-showharness para servir y evaluar con `D1_VOCAB=molmo15`.
- Punto de partida para etapas posteriores de aprendizaje por refuerzo (RL) gracias a la calibración del checkpoint recomendado.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo general ni modo thinking.

## Casos de uso

- Evaluación de políticas robóticas discretas: el modelo permite medir precisión top-1 y macro recall sobre un split de validación de episodios completos, sirviendo como referencia para comparar variantes de tokenización de acciones.
- Arranque de aprendizaje por refuerzo: la época 2, con NLL de 0,5527, es la política mejor calibrada y el punto de partida recomendado para RL sobre la tarea de pick-and-place.
- Investigación en conversión de acciones continuas a tokens discretos: el flujo con `hf_to_rows.py --swap-lr` y el vocabulario molmo15 documentan cómo mapear convenciones de referencia entre dataset y robot.
- Prototipado de control visuomotor con modelos de 3B parámetros: al ser un LoRA sobre un base de 3B, permite experimentar con hardware moderado frente a alternativas de mayor tamaño.
- Análisis de calibración y sobreconfianza: los logs por época permiten estudiar la divergencia entre precisión top-1 y NLL, útil para diagnosticar políticas sobreajustadas.
- Reproducción de experimentos en MolmoSpaces: el dataset, el código en la rama `hyeonmo/molmospace` y los checkpoints publicados permiten replicar el entrenamiento y la evaluación de extremo a extremo.
- Integración en pipelines de simulación robótica: el modelo puede servirse con `D1_VOCAB=molmo15` dentro del harness para generar acciones en bucle cerrado sobre el simulador.

## Benchmarks y rendimiento

Resultados sobre el split de validación retenido (episodios completos), evaluados al final de cada época:

| Checkpoint | Epocas | Mejor NLL (epoca) | Mejor accuracy (epoca) | Mejor macro recall (epoca) |
|---|---|---|---|---|
| d1-3b-lora | 3 | 0,5527 (2) | 0,8096 (3) | 0,6449 (3) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 3B parámetros en bfloat16, lo que sitúa el requisito en el orden de 6-7 GB solo para pesos, más el coste de los adaptadores LoRA y del codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPUs consumer de gama alta con suficiente VRAM.
- Cabe en GPU consumer: previsiblemente sí en tarjetas con 8 GB o más en bfloat16, aunque no se confirma en la model card.
- Opciones de despliegue: carga mediante `transformers.AutoModel` con `trust_remote_code=True` y `peft.PeftModel` para los adaptadores; servicio y evaluación mediante el harness d1-showharness con `D1_VOCAB=molmo15`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas vision-language-action discretas para pick-and-place) con parámetros, contexto o resultados medibles.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la tarea de pick-and-place de MolmoSpaces; no es un modelo de propósito general.
- La convención de tokens del modelo difiere de la del dataset: MV_LEFT y MV_RIGHT están invertidos respecto a la nomenclatura original. Es obligatorio aplicar el mismo intercambio izquierda/derecha antes de enviar un token al controlador del dataset.
- Es imprescindible servir y evaluar con `D1_VOCAB=molmo15`; usar otro vocabulario invalida el prompt y las opciones con los que se entrenó.
- Las épocas posteriores a la 2 pueden mostrar mayor accuracy top-1 pero mayor NLL, indicando sobreconfianza en las filas que fallan; no se recomiendan como política de partida.
- El macro recall máximo es de 0,6449, lo que indica un rendimiento desigual entre clases de acción.
- La licencia es LFM Open License v1.0 (heredada del modelo base) combinada con Apache 2.0; deben revisarse las restricciones de uso comercial de la LFM Open License v1.0 antes de un despliegue en producción.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera del dominio de MolmoSpaces.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de la comunidad.
- Riesgo de alucinación de acciones no verificadas: no se documenta ningún mecanismo de salvaguarda ante entradas fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmkang/d1sh-molmospaces-pnp
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Licencia del modelo base: https://huggingface.co/LiquidAI/d1-3B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/hmkang/molmospaces-pnp-discrete-tokens
- Código (rama hyeonmo/molmospace): https://github.com/JunHoo-Lee/d1-showharness-rl/tree/hyeonmo/molmospace

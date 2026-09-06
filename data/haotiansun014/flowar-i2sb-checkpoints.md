# haotiansun014/flowar-i2sb-checkpoints

## Resumen

Este repositorio contiene checkpoints de entrenamiento de un modelo híbrido de generación de imágenes denominado FlowAR + I2SB. El modelo combina un generador autoregresivo por escalas (FlowAR) con un refinador basado en puentes de Schrödinger (I2SB) para producir las escalas finas. Está condicionado por clase en el dataset ImageNet-256 y opera sobre latentes de un VAE KL-16, con escalas 1/2/4/8/16. El autor es Haotian Sun (haotiansun014). Se trata de checkpoints a medio entrenamiento, no de resultados finales; solo se ha subido el run más pequeño (ff_s_hybrid, 213,7 M de parámetros), mientras que los runs más grandes quedaron bloqueados por límites de almacenamiento.

La relevancia de este modelo radica en su arquitectura híbrida: las escalas gruesas se generan con flow matching, mientras que las finas se refinan mediante un puente de Schrödinger que desenfoca la escala anterior regridada. Este enfoque pretende combinar la estabilidad del flow matching con la calidad de los puentes de difusión. El repositorio proporciona los pesos EMA, que son los recomendados para muestreo y evaluación, junto con la receta de entrenamiento completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido FlowAR (flow matching) + I2SB (Schrödinger bridge) para escalas finas |
| Parametros totales | 213,7 M (run ff_s_hybrid); 591,4 M (ff_l_hybrid, no subido) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de imágenes) |
| Licencia | No disponible |
| Formato de pesos | PyTorch .pt (checkpoints con model, model_ema, optimizer, scaler, epoch y args) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido entre FlowAR y I2SB. FlowAR es un generador autoregresivo por escalas que utiliza flow matching para las escalas gruesas. Las escalas finas, en cambio, son producidas por un refinador I2SB (Schrödinger bridge) que desenfoca la escala anterior regridada. El modelo se entrena con latentes de un VAE KL-16 y escalas 1/2/4/8/16, condicionado por clase en ImageNet-256.

El entrenamiento usa un batch efectivo de 2048, lr base 5e-5 con pico de 4e-4, warmup de 100 épocas y decaimiento coseno sobre 400 épocas, bf16 autocast, weight decay 0.02 con las cabezas generadoras exentas, y EMA 0.9999. Los checkpoints incluyen tanto los pesos del modelo como el optimizador y el scaler, pero el archivo `ema-epN.pt` solo contiene `model_ema`, `epoch` y `args`, suficiente para muestrear o evaluar. Según la model card, siempre hay que evaluar con los pesos EMA.

## Capacidades

- Generación de imágenes condicionada por clase en ImageNet-256.
- Generación por escalas progresivas (1/2/4/8/16) sobre latentes de un VAE KL-16.
- Muestreo con pesos EMA, recomendado para evaluación.
- El refinado de escalas finas mediante I2SB requiere al menos 100 pasos de muestreo; el flow matching se estabiliza en torno a 25 pasos.
- La guía sin clasificador (classifier-free guidance) es crítica: evaluar con cfg 2.4-3.0, nunca a 1.0.
- No soporta texto, tool calling ni agentes; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Investigación en generación de imágenes: permite estudiar el comportamiento de un híbrido FlowAR + I2SB y comparar la calidad de las escalas finas frente a un enfoque puro de flow matching.
- Evaluación de checkpoints a medio entrenamiento: el repositorio ofrece pesos EMA para analizar la evolución del modelo en la época 188 de 400, útil para investigar dinámicas de entrenamiento.
- Experimentos con puentes de Schrödinger: sirve como referencia para investigar cómo el refinador I2SB mejora el desenfoque de escalas regridadas en modelos autoregresivos.
- Generación de imágenes sintéticas para datasets: al estar condicionado por clase en ImageNet-256, puede usarse para generar muestras adicionales para estudios de robustez o aumento de datos en investigación.
- Docencia y divulgación: el código y los checkpoints permiten ilustrar conceptos de flow matching, autoregresión por escalas y puentes de difusión en cursos de aprendizaje profundo.
- Comparativa de métodos de muestreo: el modelo permite evaluar el efecto del número de pasos (>=100) y de la guía CFG en la calidad final, sirviendo como banco de pruebas para técnicas de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- No se indica si cabe en GPU de consumo; el tamaño del repositorio (10,7 GB) incluye checkpoints completos con optimizador, no solo los pesos de inferencia.
- Opciones de despliegue: no se mencionan. El formato es PyTorch, por lo que podría cargarse con `torch.load(..., weights_only=False)` para muestreo o evaluación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Los checkpoints son de entrenamiento a medio camino (época 188 de 400 para el run ff_s_hybrid), no representan resultados finales.
- Solo se ha subido el run pequeño (ff_s_hybrid); los runs ff_l_hybrid y ff_l_baseline no están disponibles por límites de almacenamiento.
- La licencia no está especificada, lo que impide determinar si es apto para uso comercial.
- No hay benchmarks publicados, por lo que no se puede evaluar su rendimiento frente a otros modelos.
- Es un modelo de generación de imágenes condicionado por clase en ImageNet-256; no soporta prompts de texto ni otras tareas.
- El muestreo requiere al menos 100 pasos para las escalas finas y una guía CFG entre 2.4 y 3.0; un uso incorrecto (cfg=1.0 o pocos pasos) degrada significativamente la calidad.
- No se han documentado sesgos conocidos, pero al entrenarse solo en ImageNet puede heredar los sesgos de ese dataset.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/haotiansun014/flowar-i2sb-checkpoints
- Perfil del autor: https://huggingface.co/haotiansun014

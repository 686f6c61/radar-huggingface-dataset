# chanubc/human-move-cvae

## Resumen

`human-move-cvae` es un modelo de predicción de trayectorias para peatones basado en un Autoencoder Variacional Condicional (CVAE) de latente discreto, desarrollado por el usuario chanubc (chanwoo) en Hugging Face. El modelo está diseñado específicamente para simulaciones de seguridad en comedores robóticos, donde debe anticipar el movimiento de personas a partir de observaciones previas. Según la model card, el modelo realiza una predicción de 12 pasos temporales a partir de 8 pasos de observación, operando a una frecuencia de 2,5 Hz.

El modelo se presenta como el backbone CVAE dentro de una comparativa de tres arquitecturas (LSTM, Transformer y CVAE) para predicción de trayectorias. Los datos de entrenamiento provienen de trayectorias sintéticas generadas por simulación (ground truth de simulación), lo que indica un enfoque orientado a entornos controlados. El repositorio contiene un único archivo `model.pt` y un cargador en `trajectory/learned_predictor.py`. La relevancia actual radica en su aplicación en robótica de interiores, donde la predicción fiable de movimientos humanos es crítica para la seguridad, aunque la información pública disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CVAE (Conditional Variational Autoencoder) con latente discreto |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación de 8 pasos, predicción de 12 pasos a 2,5 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un CVAE con espacio latente discreto, una variante del autoencoder variacional condicional que aprende una distribución latente discreta en lugar de continua. El modelo condiciona la generación de trayectorias futuras a partir de observaciones pasadas (8 pasos) y produce 12 pasos de predicción. No se especifican detalles sobre el codificador o decodificador (si son recurrentes, convolucionales o basados en atención), ni sobre el tamaño del espacio latente. El entrenamiento se realizó con datos sintéticos de simulación (ground truth de simulación), lo que sugiere que el modelo no ha sido entrenado con datos reales de sensores. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, dado que es un modelo de regresión de trayectorias y no un modelo generativo de lenguaje.

## Capacidades

- Predicción de trayectorias de peatones: dado un historial de 8 posiciones (a 2,5 Hz), genera 12 posiciones futuras.
- Generación de múltiples trayectorias plausibles gracias a la naturaleza estocástica del CVAE (muestreo del latente).
- Adecuado para simulación de seguridad en entornos robóticos interiores (comedores, pasillos, etc.).
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento simbólico.
- No tiene capacidades multimodales (visión, audio) en el sentido tradicional; trabaja únicamente con secuencias de coordenadas.

## Casos de uso

- Simulación de seguridad en comedores robóticos: el modelo predice el movimiento de personas para que un robot de servicio pueda planificar rutas evitando colisiones. Su frecuencia de 2,5 Hz y ventana de 8+12 pasos son adecuadas para planificación a corto plazo en tiempo real.
- Evaluación comparativa de arquitecturas de predicción: al ser el backbone CVAE de una comparativa con LSTM y Transformer, puede usarse como referencia para medir el rendimiento relativo de diferentes enfoques en el mismo conjunto de datos sintéticos.
- Generación de datos sintéticos de movimiento: el modelo puede muestrear trayectorias futuras plausibles para aumentar conjuntos de datos de entrenamiento de otros sistemas robóticos.
- Pruebas de robustez en entornos simulados: al estar entrenado con datos sintéticos, es útil para validar algoritmos de control en entornos virtuales antes de desplegarlos en el mundo real.
- Investigación en CVAE de latente discreto: sirve como ejemplo de implementación de un CVAE discreto aplicado a series temporales, útil para estudios académicos sobre representaciones latentes.
- Integración en pipelines de robótica con ROS o similares: el cargador `trajectory/learned_predictor.py` permite incorporar el modelo en sistemas de planificación de movimiento existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como ADE (Average Displacement Error) o FDE (Final Displacement Error), que son estándar en predicción de trayectorias. Tampoco se proporcionan comparaciones numéricas con los modelos LSTM y Transformer mencionados.

## Requisitos de hardware

- El tamaño del repositorio es de 0,0 GB, lo que sugiere que el modelo es extremadamente pequeño (probablemente menos de 1 MB). Esto implica que puede ejecutarse en cualquier GPU moderna, incluso en CPU.
- No se dispone de datos sobre VRAM estimada, latencia o throughput. Dado el tamaño, es razonable asumir que cabe en GPUs de consumo como una RTX 3060 o inferior, pero no hay confirmación oficial.
- Opciones de despliegue: al ser un modelo PyTorch, puede cargarse con `torch.load` y ejecutarse en cualquier entorno con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son específicos para modelos de lenguaje.
- Para uso en robótica, se recomienda ejecutarlo en un sistema embebido con soporte PyTorch (Jetson, etc.), aunque no hay documentación al respecto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para predicción de trayectorias de peatones con CVAE en el contexto de robótica de interiores. Existen modelos académicos como los basados en Social LSTM o Trajectron++, pero no se han encontrado datos públicos que permitan una comparación directa con `human-move-cvae`. La información disponible no incluye métricas ni especificaciones de estos modelos alternativos en relación con este.

## Limitaciones y advertencias

- Entrenamiento exclusivamente con datos sintéticos: el modelo no ha sido validado con datos reales de sensores (LiDAR, cámaras), por lo que su rendimiento en entornos reales puede degradarse significativamente.
- Sin métricas publicadas: no hay evidencia cuantitativa de su precisión (ADE/FDE) ni de su comportamiento frente a otros modelos.
- Sin documentación técnica detallada: no se especifican hiperparámetros, tamaño del latente, número de capas ni detalles del entrenamiento.
- Frecuencia fija de 2,5 Hz: el modelo asume una tasa de muestreo constante, lo que puede ser limitante si los datos de entrada varían en frecuencia.
- Ventana de contexto corta: 8 pasos de observación (3,2 segundos) pueden ser insuficientes para capturar comportamientos complejos de peatones en entornos densos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto personal sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chanubc/human-move-cvae
- Perfil del autor: https://huggingface.co/chanubc
- Lista de modelos del autor: https://huggingface.co/chanubc/models
- Referencia académica sobre CVAE para interpolación de movimiento humano (no directamente relacionada, pero útil como contexto): https://arxiv.org/pdf/2111.06762
- Artículo sobre síntesis de movimiento 3D con CVAE: https://ieeexplore.ieee.org/document/9711162
- Repositorio ACTOR (Transformer VAE para movimiento humano): https://github.com/Mathux/ACTOR

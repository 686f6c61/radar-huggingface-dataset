# hehteram/CRISP

## Resumen

CRISP es un modelo de clasificación de imágenes asociado a un marco de inferencia distribuida entre dispositivo (edge) y nube (cloud) que busca preservar la privacidad mediante ruido informacional. Lo desarrolla el autor identificado como hehteram y se publica en Hugging Face bajo licencia MIT. El modelo resuelve el problema de enviar consultas a un servidor sin revelar la etiqueta real al servidor, recurriendo a un mecanismo de ruido (Mixup) y a un pequeño decodificador en el cliente que aprovecha ese ruido como información lateral para recuperar predicciones precisas.

La arquitectura combina un servidor ResNet-18 con un decodificador ligero en el cliente. En los experimentos sobre MNIST con el mecanismo Mixup a K = 16, CRISP descarga más del 99 % del cómputo de la red neuronal al servidor y alcanza un 97,1 % de precisión en el cliente, mientras que el adversario evaluado solo logra un 21,7 % de precisión al intentar predecir la etiqueta del dígito a partir de la consulta. Además de esta evaluación empírica de ataque, el mecanismo Mixup ofrece garantías demostrables de privacidad de salida desde el punto de vista de la teoría de la información.

El modelo es relevante para investigación en privacidad diferencial aplicada a inferencia edge-cloud y para reproducibilidad de resultados, no como un clasificador de propósito general. El repositorio contiene únicamente el checkpoint `models/model_mixup_16.pth` para la configuración Mixup con K = 16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 en el servidor con decodificador ligero en el cliente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes, no lingüística) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de inferencia dividida: un servidor basado en ResNet-18 procesa la consulta privatizada y un decodificador pequeño en el cliente reconstruye la predicción usando el ruido de privacidad como información lateral. El mecanismo de privatización es Mixup con K = 16, que mezcla la entrada con otras muestras para dificultar la inferencia de la etiqueta por parte del servidor.

El entrenamiento se realiza sobre el dataset MNIST (ylecun/mnist) y la métrica declarada es accuracy. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este contexto). La innovación técnica destacable es la combinación de ruido Mixup con garantías de privacidad de salida demostrables desde la teoría de la información, junto con la recuperación de precisión en el cliente mediante el decodificador.

## Capacidades

- Clasificación de imágenes de dígitos manuscritos (MNIST) en un esquema edge-cloud.
- Privacidad de salida con garantías teóricas mediante el mecanismo Mixup.
- Descarga de más del 99 % del cómputo de la red neuronal al servidor.
- Recuperación de predicciones en el cliente usando el ruido de privacidad como información lateral.
- Resistencia empírica a un adversario que intenta predecir la etiqueta desde la consulta (21,7 % de precisión del adversario).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Investigación en privacidad de inferencia edge-cloud: sirve como referencia reproducible para evaluar mecanismos de ruido y decodificación en el cliente sobre MNIST.
- Reproducción de resultados académicos: el checkpoint `model_mixup_16.pth` permite replicar los números reportados (97,1 % de precisión en cliente, 21,7 % del adversario) con el preprocesado y la construcción de consultas Mixup del repositorio principal.
- Evaluación de ataques de inferencia de etiqueta: útil para medir la robustez de un adversario frente a consultas privatizadas en un entorno controlado.
- Docencia y experimentación con inferencia dividida: adecuado para demostrar el reparto de cómputo entre cliente y servidor con una red ResNet-18.
- Prototipado de esquemas de privacidad en clasificación de imágenes: base para extender el enfoque a otros datasets o mecanismos de ruido.
- Análisis de compromiso entre precisión y privacidad: permite estudiar cómo varía la precisión del cliente y del adversario al modificar el parámetro K.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en cliente (MNIST, Mixup, K = 16) | 97,1 % |
| Precisión del adversario (predicción de etiqueta desde la consulta) | 21,7 % |
| Cómputo descargado al servidor | más del 99 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el servidor es una ResNet-18, por lo que la huella es reducida, pero no se especifica cifra.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; una ResNet-18 es ligera, pero no se confirma en la información.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` y `load_state_dict`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (privacidad en inferencia edge-cloud sobre MNIST).

## Limitaciones y advertencias

- Modelo orientado exclusivamente a investigación y reproducibilidad; no se declara para uso en producción.
- Entrenado únicamente sobre MNIST; no generaliza a otras tareas de visión sin reentrenamiento.
- Requiere el preprocesado, la construcción de consultas Mixup y el procedimiento de decodificación del repositorio principal para funcionar correctamente.
- No se detallan sesgos conocidos ni tasas de alucinación (no aplica a clasificación, pero tampoco se documentan sesgos de datos).
- No se especifican limitaciones de idioma ni de contexto (no aplicables).
- La licencia declarada es MIT, pero la model card remite al repositorio de GitHub para los términos completos; conviene verificar allí las condiciones de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hehteram/CRISP
- Repositorio principal (GitHub): https://github.com/hehteram/CRISP
- Dataset: https://huggingface.co/datasets/ylecun/mnist

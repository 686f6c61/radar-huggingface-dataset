# ausjahk/flower-classifier-from-scratch

## Resumen

El modelo `ausjahk/flower-classifier-from-scratch` es un clasificador de imágenes de flores basado en una red neuronal convolucional (CNN) desarrollada por el usuario `ausjahk`. El modelo fue entrenado desde cero, es decir, con inicialización aleatoria de pesos, sobre el dataset Kaggle Flowers Recognition, y es capaz de distinguir entre cinco especies: margarita, diente de león, rosa, girasol y tulipán.

Se trata de un modelo de tamaño reducido, con 4.585.221 parámetros, diseñado más como ejercicio técnico o prototipo educativo que como solución de producción. Su precisión en test es del 64,35 %, lo que indica un rendimiento moderado y limita su uso en aplicaciones críticas. No se dispone de información sobre licencia, cuantizaciones ni formatos de pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (4 bloques convolucionales + cabeza densa) |
| Parametros totales | 4.585.221 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura consiste en una CNN secuencial con cuatro bloques convolucionales que incrementan el número de filtros de 32 a 64, 128 y 256. Cada bloque incorpora BatchNorm, activación ReLU y una capa de MaxPooling 2D. Tras los bloques convolucionales, la red incluye una cabeza clasificadora densa que reduce la representación a 256 neuronas y finalmente a las 5 clases de salida.

El entrenamiento se realizó desde cero, sin transfer learning ni pesos preentrenados, sobre el dataset Kaggle Flowers Recognition. No se especifican detalles sobre el número de épocas, optimizador, tamaño de lote ni partición de datos. Tampoco se menciona el uso de técnicas como RLHF, DPO o data augmentation. La única métrica publicada es la precisión en test del 64,35 %.

## Capacidades

- Clasificación de imágenes en 5 clases: margarita, diente de león, rosa, girasol y tulipán.
- Inferencia básica sobre imágenes de flores, sin soporte para detección de objetos ni segmentación.
- No soporta tool calling, function calling ni razonamiento multi-step, al ser un modelo de visión puro.
- No ofrece capacidades multilingües ni de generación de texto.
- No dispone de modo de pensamiento, procesamiento de audio ni de vídeo.
- Al ser un modelo pequeño, su inferencia es rápida en hardware modesto, aunque con una precisión limitada.

## Casos de uso

- Prototipo educativo para enseñar el diseño y entrenamiento de CNNs desde cero: el modelo sirve como ejemplo práctico de una arquitectura convolucional simple, con un número de parámetros reducido y un dataset pequeño.
- Demo de reconocimiento de flores en tiempo real con CPU: gracias a su tamaño, puede ejecutarse en un portátil convencional sin GPU para mostrar el flujo completo de clasificación de imágenes.
- Integración en aplicaciones móviles ligeras: el modelo puede empaquetarse en una app de bajo coste para identificar flores comunes, siempre que se asuma una precisión moderada.
- Base para fine-tuning con más datos: al estar entrenado desde cero, se puede utilizar como punto de partida para ajustar el modelo con un dataset más amplio y mejorar la precisión.
- Experimentos de comparación con modelos preentrenados: en entornos académicos, sirve para contrastar el rendimiento de una CNN desde cero frente a arquitecturas como ResNet o EfficientNet.
- Prácticas de laboratorio en cursos de deep learning: el tamaño del modelo y su simplicidad permiten analizar el efecto del número de filtros, la regularización y el sobreajuste en un entorno controlado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test | 64,35 % |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Tampoco se ofrecen comparativas con otros modelos de clasificacion de flores.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- Dado el tamaño de 4.585.221 parámetros, se estima que la inferencia es posible en CPU y en GPUs de consumo, pero no hay medidas publicadas de VRAM, latencia ni throughput.
- No se han publicado opciones de despliegue como vLLM, llama.cpp, Ollama o TGI; al ser un modelo de visión, el despliegue habitual sería mediante PyTorch o TensorFlow.
- No se especifica si el modelo funciona en tarjetas GPU de gama baja ni en dispositivos embebidos, aunque por su tamaño es probable que sí, siempre que se realice una conversión de pesos adecuada.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos de referencia comparables en la informacion proporcionada. El unico proyecto relacionado hallado en la busqueda web clasifica 102 especies de flores mediante transfer learning, pero no es directamente comparable con este modelo por su arquitectura, datos y objetivo.

## Limitaciones y advertencias

- La precision del 64,35 % en test indica un riesgo alto de clasificaciones erroneas, especialmente en escenarios reales con variaciones de iluminacion, fondo o angulo.
- El modelo fue entrenado desde cero con un dataset pequeno y sin tecnicas de regularizacion documentadas, lo que puede provocar sobreajuste y falta de generalizacion.
- No se ha publicado la licencia del modelo, por lo que no se puede garantizar su uso comercial ni su redistribucion.
- No existen datos sobre sesgos en el dataset ni sobre la robustez del modelo ante imagenes adversarias o fuera de distribucion.
- No se han publicado pruebas de rendimiento en entornos de produccion, por lo que no es apto para aplicaciones criticas sin un fine-tuning sustancial y una evaluacion exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/ausjahk/flower-classifier-from-scratch

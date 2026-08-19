# ruwwww/bernini-mnist

## Resumen

Bernini-MNIST es una reproduccion a pequeña escala de la arquitectura Bernini de ByteDance, presentada como un proyecto de investigacion para validar el concepto de "Latent Semantic Planning" mediante modelos de lenguaje multimodal (MLLM). El modelo, desarrollado por el usuario ruwwww, combina un planificador semantico basado en Qwen3-0.6B con un renderizador de flujo continuo (ConvFlow) para generar y reconstruir digitos manuscritos del dataset MNIST. Su proposito principal es servir como banco de pruebas educativo y punto de partida para quienes quieran explorar arquitecturas de difusion con planificacion semantica latente sin la complejidad computacional del sistema original.

El proyecto se estructura en tres etapas diferenciadas: un Vision Transformer (ViT) que actua como "oraculo" clasificador, un planificador semantico que convierte las representaciones visuales en tokens discretos mediante MaskGIT, y un renderizador que reconstruye la imagen continua a partir de esos tokens. El modelo completo ocupa aproximadamente 90 MB en pesos, lo que lo hace ejecutable en hardware modesto. Aunque los resultados reportados (100% de precision en clasificacion y reconstruccion) corresponden a un entorno controlado de validacion, el proyecto demuestra la viabilidad del enfoque y proporciona una base reproducible para experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (oraculo) + Qwen3-0.6B (planificador) + ConvFlow (renderizador) |
| Parametros totales | ~90 MB en pesos (estimado: ~22M parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (etiquetas y documentacion) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El sistema sigue un pipeline de tres etapas que replica a pequeña escala la arquitectura Bernini original. La primera etapa emplea un Vision Transformer de 16 parches entrenado como oraculo clasificador, alcanzando un 98.48% de precision en MNIST. La segunda etapa combina Qwen3-0.6B con un head de MaskGIT y un mecanismo de flow matching con normalizacion adaptativa (AdaLN), generando tokens semanticos discretos a partir de las representaciones visuales. La tercera etapa utiliza un renderizador ConvFlow 2D con upsampling bilineal continuo para reconstruir la imagen final desde los tokens semanticos.

El entrenamiento se realiza en tres fases: primero se entrena el ViT oraculo de forma independiente, luego el planificador semantico condicionado a las salidas del oraculo, y finalmente se ajustan conjuntamente todos los componentes (joint fine-tuning) para optimizar el pipeline completo. El dataset utilizado es MNIST, con 60,000 imagenes de entrenamiento y 10,000 de test. No se reporta el uso de RLHF ni DPO; el entrenamiento se basa en perdidas de clasificacion, reconstruccion y flow matching.

## Capacidades

- Generacion de digitos manuscritos sinteticos a partir de ruido o de tokens semanticos latentes.
- Reconstruccion de imagenes MNIST desde representaciones continuas de tokens.
- Clasificacion de digitos con alta precision (98.48% en el oraculo ViT, 100% en el pipeline conjunto sobre 300 muestras de test).
- Planificacion semantica latente: el modelo aprende a representar conceptos visuales de alto nivel (el digito) como tokens discretos intermedios.
- Flujo de difusion continua: el renderizador ConvFlow permite generar imagenes mediante un proceso de flow matching, no autoregresivo.
- Capacidad multimodal limitada: aunque la arquitectura base (Qwen3) es multimodal, esta reproduccion se limita a vision y generacion de imagenes.

## Casos de uso

- Educacion e investigacion en arquitecturas de difusion: el modelo sirve como ejemplo didactico para entender como combinar un MLLM con un renderizador de flujo continuo, con una complejidad de ejecucion minima.
- Validacion de conceptos de planificacion semantica: investigadores pueden estudiar como los tokens semanticos intermedios afectan a la calidad de la generacion, comparando con pipelines de difusion directa.
- Prototipado de sistemas de generacion condicionada: el pipeline de tres etapas puede adaptarse como plantilla para experimentar con otros datasets de imagenes pequeñas.
- Benchmark de reconstruccion y generacion en MNIST: sirve como punto de referencia para comparar arquitecturas de difusion en un entorno controlado.
- Exploracion de flow matching frente a diffusion clasica: el uso de ConvFlow con upsampling bilineal permite estudiar las diferencias entre ambos paradigmas de generacion.
- Base para extensiones multimodales: al estar basado en Qwen3, el planificador podria ampliarse para aceptar instrucciones en lenguaje natural, aunque esta capacidad no esta implementada en la version actual.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision de clasificacion (oraculo ViT) | 98.48% en MNIST |
| Precision de clasificacion (pipeline conjunto) | 100.00% sobre 300 digitos de test |
| Fidelidad de reconstruccion | 100.00% de precision de validacion desde tokens continuos reales |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los resultados de 100% deben interpretarse con cautela: corresponden a un subconjunto de 300 muestras de test y a un dataset sencillo como MNIST, donde la saturacion de rendimiento es habitual.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB, dado el tamaño total de ~90 MB en pesos.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) o incluso CPU para inferencia.
- Compatible con hardware de consumo: si, cabe en cualquier GPU moderna e incluso en Raspberry Pi 5 con suficiente RAM.
- Opciones de despliegue: al ser checkpoints de PyTorch, puede ejecutarse con scripts propios, Hugging Face Transformers (parcialmente) o exportarse a ONNX para inferencia optimizada.
- Latencia: no disponible, pero por el tamaño del modelo se estima una inferencia en milisegundos en GPU y en decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Bernini-MNIST | ~22M | no disponible | Generacion y reconstruccion MNIST | MIT |
| Bernini (ByteDance) | no disponible | no disponible | Generacion y edicion de video | no disponible |
| lorossi/mnist-model | no disponible | no disponible | Clasificacion MNIST | no disponible |

No se dispone de modelos directamente comparables que combinen planificacion semantica con flow matching para MNIST. El proyecto Bernini original de ByteDance es la referencia conceptual, pero no publica pesos ni especificaciones detalladas. Los modelos de clasificacion MNIST tradicionales (CNNs, MLPs) resuelven una tarea distinta y no son comparables en arquitectura.

## Limitaciones y advertencias

- Modelo de juguete: es una reproduccion a pequeña escala, no un sistema listo para produccion. Su unica capacidad demostrada es con digitos MNIST de 28x28.
- Resultados de benchmark limitados: el 100% de precision se obtuvo sobre 300 muestras de test, un subconjunto muy pequeño. No hay garantia de generalizacion a otros datos.
- Sin soporte multimodal real: aunque usa Qwen3 como base, no se ha implementado entrada de texto ni instrucciones en lenguaje natural.
- Riesgo de sobreajuste: el modelo puede haber memorizado el dataset MNIST, dado su tamaño reducido y la simplicidad de la tarea.
- Documentacion escasa: no se detallan hiperparametros, configuracion de entrenamiento ni curvas de perdida, lo que dificulta la reproducibilidad exacta.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni TensorRT disponibles, lo que limita el despliegue en entornos de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ruwwww/bernini-mnist
- Repositorio GitHub: https://github.com/ruwwww/bernini-mnist
- Proyecto Bernini original (ByteDance): https://bernini-ai.github.io/

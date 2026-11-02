# KhushiiiD/smai-a4-ioc-p0

## Resumen

`smai-a4-ioc-p0` es un modelo de red neuronal completamente conectada (MLP) entrenado con PyTorch para clasificación de imágenes del conjunto de datos CIFAR-10. Lo publica el usuario KhushiiiD como parte de la asignatura SMAI (Assignment 4, cuestión Q1.4), con etiquetas limpias (p = 0 de ruido). No se trata de un modelo de lenguaje ni de un transformer: es un artefacto académico de clasificación de imágenes de 32x32 píxeles en 10 clases.

El repositorio contiene los pesos en formato NumPy (`weights.npz`), la definición de la arquitectura (`architecture.json`) y los parámetros de preprocesado (`preprocessing.npz`). El entrenamiento se realizó con descenso de gradiente estocástico plano (SGD, lr 0.01, batch 64, 100 épocas, sin early stopping) sobre las 50.000 imágenes de entrenamiento de CIFAR-10.

Por su naturaleza, es relevante únicamente como material didáctico o como referencia reproducible de un pipeline básico de clasificación. No está pensado para uso en producción, no dispone de model card estándar de HuggingFace, no tiene licencia declarada y el repositorio ocupa 0.0 GB, lo que sugiere que los pesos son de pequeño tamaño y probablemente no están subidos en formato estándar de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (MLP) con capas totalmente conectadas; tamaños definidos en `architecture.json` (no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 3072 valores por imagen) |
| Tipos de cuantizacion | no disponible; pesos en `weights.npz` (float, presumiblemente float32/float64 de PyTorch) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (NumPy), con layout de PyTorch `(n_out, n_in)`; configuración en `.json` |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa (MLP) con capas densas cuyos tamaños, funciones de activación y configuración de entrenamiento se detallan en `architecture.json`, aunque esos valores concretos no se han proporcionado en la información disponible. La entrada es un vector plano de 3072 dimensiones (32x32x3 píxeles de CIFAR-10) y la salida corresponde a 10 clases.

El entrenamiento se realizó con PyTorch usando SGD plano, learning rate 0.01, batch size 64 y 100 épocas, sin early stopping, sobre las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas limpias (p = 0). El preprocesado es explícito: aplanar la imagen a 3072 valores, convertir a float64, dividir por 255, restar la media por columna y dividir por la desviación típica por columna (usando divisor 1 donde std = 0), con estadísticas calculadas sobre el conjunto de entrenamiento y almacenadas en `preprocessing.npz`. No se menciona uso de data augmentation, regularización, RLHF ni ninguna innovación técnica destacable.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre vectores de 3072 dimensiones tras el preprocesado especificado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales.
- No es un modelo generativo: solo produce logits/probabilidades de clase.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como ejemplo reproducible de un pipeline completo (preprocesado con estadísticas guardadas, pesos exportados a NumPy y configuración en JSON) para asignaturas de introducción al deep learning.
- Reproducción de experimentos académicos: permite verificar resultados de la práctica SMAI Q1.4 con etiquetas limpias y comparar contra variantes con ruido de etiquetas.
- Baseline de clasificación en CIFAR-10: útil como referencia mínima (MLP) frente a modelos convolucionales o transformers de visión en experimentos comparativos.
- Pruebas de integración de inferencia en NumPy: al estar los pesos en `.npz`, se puede implementar un forward pass sin PyTorch, útil para validar pipelines de despliegue ligeros.
- Análisis de sensibilidad al preprocesado: el paquete incluye media y desviación típica por columna, lo que facilita estudiar el impacto de la normalización en el rendimiento.
- Ejercicios de cuantización o compresión: al ser un MLP de pesos exportados, es un banco de pruebas sencillo para técnicas de poda o cuantización a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión de validación ni de test sobre CIFAR-10, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un MLP sobre vectores de 3072 dimensiones cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior) es sobrada. Para entrenamiento, una GPU consumer básica es suficiente dado el tamaño del modelo y del dataset.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: inferencia directa en PyTorch o NumPy; no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del modelo, se espera un throughput muy alto en batch.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smai-a4-ioc-p0` | MLP para CIFAR-10 | no disponible | 3072 valores por imagen | no disponible | HuggingFace (repo de 0.0 GB) |
| LeNet-5 (referencia clásica) | CNN para CIFAR-10 | ~60.000 | 32x32x3 | dominio público / académica | implementaciones múltiples |
| ResNet-18 (adaptado a CIFAR-10) | CNN residual | ~11,2 M | 32x32x3 | MIT (implementaciones comunes) | torchvision, timm |
| ViT-Small (adaptado a CIFAR-10) | Transformer de visión | ~22 M | 32x32x3 con parches | Apache 2.0 (implementaciones comunes) | timm, HuggingFace |

La comparación es meramente orientativa: el modelo publicado no documenta su número de parámetros ni su precisión, por lo que no se puede establecer una comparación cuantitativa rigurosa con las alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, por lo que no debe evaluarse con métricas de NLP.
- No se declara licencia, lo que impide determinar si su uso comercial está permitido; se debe contactar con el autor antes de cualquier uso fuera del ámbito académico.
- No se documenta la precisión alcanzada en CIFAR-10, ni en validación ni en test, por lo que no se puede valorar su calidad real.
- El repositorio tiene 0.0 GB, lo que sugiere que los archivos de pesos podrían no estar efectivamente subidos o son de tamaño despreciable; conviene verificar la integridad de los artefactos antes de usarlos.
- Entrenado sin early stopping y con SGD plano, es probable que no esté optimizado ni regularizado; puede presentar sobreajuste o un rendimiento inferior a alternativas convolucionales.
- Al ser un MLP sobre píxeles aplanados, pierde la estructura espacial de la imagen y no es adecuado para tareas de visión más complejas.
- No dispone de model card estándar, pipeline declarado ni idiomas; la información disponible es mínima y de origen académico.
- Riesgo de alucinación no aplica (no es generativo); el riesgo principal es de clasificación errónea en imágenes fuera de la distribución de CIFAR-10.

## Enlaces

- HuggingFace: https://huggingface.co/KhushiiiD/smai-a4-ioc-p0
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

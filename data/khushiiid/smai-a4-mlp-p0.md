# KhushiiiD/smai-a4-mlp-p0

## Resumen

`smai-a4-mlp-p0` es un perceptrón multicapa (MLP) entrenado con PyTorch para clasificación de imágenes del conjunto CIFAR-10. Lo publica el usuario KhushiiiD en Hugging Face como parte de la asignatura SMAI (Assignment 4, pregunta 1.4), con la etiqueta "clean labels p = 0", lo que sugiere que forma parte de un barrido experimental sobre etiquetas ruidosas y que este checkpoint corresponde al caso sin ruido. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto académico de clasificación de imágenes de 32x32 píxeles en 10 clases.

El repositorio tiene un tamaño de 0.0 GB según la plataforma, no declara licencia, idiomas, pipeline ni métricas de rendimiento, y no cuenta con descargas ni likes en el momento de la consulta. El contenido publicado se limita a tres ficheros descritos en la model card: `weights.npz` con pesos y sesgos en disposición de PyTorch, `architecture.json` con tamaños de capa, activaciones y configuración de entrenamiento, y `preprocessing.npz` con la media y la desviación típica de las 3072 columnas de las imágenes de entrenamiento aplanadas.

Su relevancia es, por tanto, exclusivamente docente y reproducible: sirve como referencia de un MLP básico entrenado con SGD plano sobre CIFAR-10, útil para comparar contra variantes con etiquetas ruidosas dentro del mismo assignment. No debe confundirse con un modelo generativo ni con un sistema desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con activaciones; tamaños de capa definidos en `architecture.json` (no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 3072 valores tras aplanar imágenes de 32x32x3) |
| Tipos de cuantizacion | no disponible (pesos publicados en `weights.npz` en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `weights.npz` (NumPy, disposición de PyTorch `(n_out, n_in)`), más `architecture.json` y `preprocessing.npz` |

## Arquitectura y entrenamiento

La arquitectura es un MLP implementado en PyTorch cuyas dimensiones de capa, funciones de activación y configuración de entrenamiento se detallan en el fichero `architecture.json`, aunque esos valores concretos no se han publicado en la información disponible. La entrada es una imagen CIFAR-10 aplanada a 3072 valores (32x32 píxeles x 3 canales), normalizada con la media y la desviación típica calculadas sobre las 50.000 imágenes de entrenamiento y almacenadas en `preprocessing.npz`; el preprocesado indicado es: aplanar, convertir a float64, dividir por 255, restar la media y dividir por la desviación típica (usando divisor 1 donde la desviación es cero).

El entrenamiento se realizó con SGD plano, tasa de aprendizaje 0.01, tamaño de lote 64 y 100 épocas, sin early stopping, sobre las 50.000 imágenes de entrenamiento de CIFAR-10. La model card no menciona uso de validación, data augmentation, regularización, RLHF ni ninguna innovación técnica adicional; se trata de un baseline académico convencional. La etiqueta "p = 0" indica que este checkpoint corresponde al escenario de etiquetas limpias dentro de una comparativa más amplia.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia por forward pass de un MLP sobre vectores de 3072 dimensiones preprocesados con la normalización publicada.
- Reproducción exacta del preprocesado gracias a `preprocessing.npz`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes, capacidades multilingües ni modos de pensamiento.
- No es un modelo conversacional ni acepta prompts en lenguaje natural.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como baseline de referencia en la asignatura SMAI para comparar el efecto de etiquetas ruidosas frente al caso limpio (p = 0) sobre un MLP entrenado con SGD.
- Reproducción de experimentos: los tres ficheros publicados permiten reconstruir el clasificador y verificar los resultados del assignment sin reentrenar.
- Comparación de optimizadores y preprocesado: al estar fijados SGD, lr 0.01, batch 64 y 100 épocas, se puede usar como punto de partida controlado para estudiar el impacto de cambiar el optimizador o la normalización.
- Análisis de sensibilidad al preprocesado: `preprocessing.npz` permite evaluar cómo afecta usar la media y desviación típicas del conjunto de entrenamiento frente a estadísticos calculados de otra forma.
- Ejercicios de despliegue ligero: al ser un MLP pequeño en NumPy, se puede cargar en un script de Python sin GPU para demostrar el ciclo completo de preprocesado e inferencia en un aula.
- Estudio de sobreajuste en CIFAR-10: al haberse entrenado 100 épocas sin early stopping, es un caso útil para ilustrar curvas de pérdida y sobreajuste en un MLP que opera sobre píxeles crudos.
- Referencia para pipelines de clasificación de imágenes de bajo coste: en entornos donde la latencia y el tamaño del modelo son críticos, un MLP de este tipo puede servir como línea base mínima frente a CNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza de MLP sobre entradas de 3072 valores, es esperable que quepa en cualquier GPU consumer, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; el modelo puede ejecutarse en CPU sin problema aparente dado su tamaño, pero no se especifica.
- Cabe en GPU consumer: sí, previsiblemente cualquiera, aunque no se detalla en la información disponible.
- Opciones de despliegue: carga manual en Python con NumPy y PyTorch a partir de `weights.npz`, `architecture.json` y `preprocessing.npz`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints del mismo assignment ni métricas que permitan una comparación cuantitativa con alternativas como LeNet, ResNet-18 o variantes del propio barrido con etiquetas ruidosas.

## Limitaciones y advertencias

- Modelo puramente académico: no está pensado para uso en producción ni para tareas distintas de la clasificación de CIFAR-10.
- Sin licencia declarada: no se especifican condiciones de uso comercial ni de redistribución, por lo que su reutilización fuera del ámbito docente es jurídicamente incierta.
- Sin métricas publicadas: no hay accuracy, pérdida ni curvas de entrenamiento en la model card, lo que impide evaluar su calidad real.
- Entrenado sin early stopping durante 100 épocas, lo que puede implicar sobreajuste sobre las 50.000 imágenes de entrenamiento; no se documenta partición de validación.
- Dependencia estricta del preprocesado: usar otra normalización distinta a la de `preprocessing.npz` degradará las predicciones.
- Entrada fija de 32x32x3 píxeles: no admite imágenes de otra resolución sin remuestreo previo.
- Sin soporte de texto, tool calling ni agentes; no es un modelo de lenguaje y no debe evaluarse como tal.
- Riesgo de sesgos heredados del dataset CIFAR-10 (desequilibrios de clase, sesgos visuales de las imágenes originales), aunque no se documentan en la model card.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza fuera de la distribución de CIFAR-10.

## Enlaces

- Hugging Face: https://huggingface.co/KhushiiiD/smai-a4-mlp-p0
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

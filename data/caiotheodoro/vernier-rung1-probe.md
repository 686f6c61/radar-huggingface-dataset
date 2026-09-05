# caiotheodoro/vernier-rung1-probe

## Resumen

`vernier-rung1-probe` es una sonda de regresión logística desarrollada por Caio Theodoro (caiotheodoro) sobre características congeladas del modelo de visión `facebook/dinov2-small`. El objetivo del artefacto es reproducir los juicios de conteo de manos que el modelo `gemini-2.5-flash` produce sobre fotogramas egocéntricos de entornos de fábrica. Se trata de un resultado negativo documentado: el modelo no cumple los umbrales pre-registrados de rendimiento y su publicación tiene como finalidad que el fallo sea verificable, no invisible.

La arquitectura combina un backbone ViT (DINOv2-small) congelado, del que se extraen características mediante agrupación media de los tokens de parche del último estado oculto, y una cabeza de regresión logística de scikit-learn. El contexto no aplica, ya que es un modelo de clasificación de imágenes y no un modelo de lenguaje. El artefacto en sí es un archivo `joblib` que contiene únicamente los pesos de la sonda; para reproducir la extracción de características se necesita el código del repositorio asociado.

La relevancia actual radica en que sirve como referencia de un fallo rigurosamente pre-registrado: muestra que una destilación simple desde un modelo de gran tamaño (gemini-2.5-flash) a una sonda lineal sobre DINOv2-small no alcanza la fidelidad esperada, y proporciona una base reproducible para investigar alternativas como el backbone pre-registrado o un ajuste fino LoRA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sonda de regresión logística sobre características congeladas de DINOv2-small (ViT-S/14) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes de 224×224) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Joblib |

## Arquitectura y entrenamiento

La sonda se entrena sobre las representaciones de `facebook/dinov2-small`, un modelo ViT cuyo backbone se mantiene congelado durante todo el proceso. Para cada imagen se aplica un preprocesamiento reproducible a mano: se redimensiona el borde más corto a 256 píxeles con interpolación bicúbica, se recorta un parche central de 224×224, se escala a [0, 1] y se normaliza con la media y desviación de ImageNet. A continuación se extraen los tokens de parche del último estado oculto y se aplica una agrupación media, de forma que cada imagen queda representada por un vector de características que alimenta una regresión logística de scikit-learn.

El conjunto de entrenamiento está compuesto por n = 600 fotogramas etiquetados con la salida almacenada denominada `P0b` de `gemini-2.5-flash`, generada por Build AI. La elección del juez como objetivo es deliberada: la model card indica que un instrumento que mejorara la métrica de aquello que mide dejaría de medirlo. No se ha aplicado RLHF ni DPO. Tras la regresión logística, el modelo incluye una cascada de abstención que se activa cuando el valor máximo de `predict_proba` queda por debajo de un umbral calculado a partir del límite inferior de Wilson del 95 % de la precisión contra oro humano. En los datos evaluados, ningún umbral logra que este límite supere el suelo deseado.

## Capacidades

- Detección de manos en fotogramas egocéntricos de fábrica, mediante la estimación de un recuento.
- Imitación de los juicios de un modelo de gran tamaño (gemini-2.5-flash) en un dominio visual restringido.
- Mecanismo de abstención basado en la confianza: el modelo puede rechazar emitir una predicción si la probabilidad máxima es baja.
- No genera texto, código ni razonamiento; es exclusivamente un clasificador de imágenes.
- No soporta tool calling, uso de agentes ni razonamiento simbólico multi-paso.
- No se han declarado capacidades multilingües; los idiomas soportados no están disponibles.

## Casos de uso

- Auditoría de anotaciones: el probe puede usarse para comparar sus predicciones con las etiquetas de gemini-2.5-flash e identificar fotogramas concretos donde el profesor produce resultados inconsistentes o dudosos, lo que resulta útil para depurar datasets egocéntricos.
- Baseline para destilación: sirve como punto de partida cuantificado para investigar si un backbone más moderno (por ejemplo, el DINOv3 pre-registrado) o un ajuste fino LoRA mejoran la fidelidad al profesor.
- Estudio de calibración de abstenciones: la cascada con el límite inferior de Wilson proporciona un ejemplo práctico de cómo diseñar y evaluar un sistema de rechazo en clasificación de imágenes con datos de oro limitados.
- Evaluación de reproducibilidad: al ser un resultado negativo declarado, el modelo permite comprobar si el pipeline de extracción de características y la sonda se pueden reproducir exactamente, lo que es valioso en investigación de reproducibilidad.
- Etiquetado asistido débil: las salidas del probe pueden emplearse como una señal previa de bajo coste en un flujo de etiquetado humano, acelerando la revisión de vídeos industriales egocéntricos.
- Comparación de representaciones: la combinación de backbone congelado y sonda lineal permite medir si las características de DINOv2-small contienen la información necesaria para localizar manos en contextos egocéntricos, un dato útil antes de invertir en ajuste fino.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados pre-registrados:

| Métrica | Valor | Objetivo pre-registrado | Cumplido |
|---|---|---|---|
| Fidelidad al profesor vs gemini-2.5-flash (n = 150 muestras retenidas) | 0.693 | ≥ 0.90 | No |
| Límite inferior Wilson 95 % contra oro humano (n = 46 calibración) | Inalcanzable | ≥ 0.80 | No |
| Cobertura en ese límite | — | ≥ 0.70 | No |

El estado es `floor_reached = false` y `holds = false`. La propia cascada informa de que el suelo de 0.8 es inalcanzable al 95 % de confianza para cualquier cobertura mayor que 0. No se han publicado benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni de clasificación genérica porque el modelo está diseñado para una tarea visual muy específica.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos. Dado que el backbone es un ViT de tamaño pequeño (DINOv2-small), es plausible que la extracción de características funcione en GPUs de consumo, pero no hay mediciones confirmadas.
- El artefacto en sí es un archivo Joblib de menos de 1 GB (tamaño del repositorio 0.0 GB), por lo que el almacenamiento no es un problema.
- Para inferencia completa (extracción de características + regresión logística) se recomienda cualquier GPU con al menos 4-6 GB de VRAM, aunque no hay una cifra oficial.
- El despliegue no es compatible con motores de inferencia estándar como vLLM, llama.cpp, Ollama o TGI. Para cargar el modelo es necesario utilizar el código del repositorio `vernier`, concretamente la clase `LinearProbe` y su método `load`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| vernier-rung1-probe | Sonda lineal sobre DINOv2-small | No disponible | No aplica | Fidelidad 0.693; no cumple | Apache-2.0 |
| facebook/dinov3-vits16-pretrain-lvd1689m | ViT (backbone pre-registrado) | No disponible | No aplica | No evaluado | No disponible |
| Rung-2 LoRA (propuesto) | Ajuste fino LoRA sobre DINOv2 | No disponible | No aplica | No evaluado | No disponible |

El backbone pre-registrado y el ajuste fino LoRA se mencionan en la model card como alternativas o trabajos futuros que no se han ejecutado. No se conocen otros modelos publicados con el mismo objetivo de destilar juicios de conteo de manos de gemini-2.5-flash.

## Limitaciones y advertencias

- El modelo no cumple los umbrales pre-registrados: la fidelidad al profesor es 0.693 frente a un objetivo de al menos 0.90, y el suelo de concordancia con oro humano es inalcanzable.
- La cascada de abstención no puede garantizar ningún nivel de confianza en este dataset, por lo que el modelo no es útil como instrumento de medición.
- El backbone utilizado (DINOv2-small) es un sustituto declarado del modelo pre-registrado (DINOv3), que no estaba disponible para la cuenta del autor; esto puede haber afectado al rendimiento.
- El conjunto de oro humano es muy pequeño (n = 93), lo que hace que las conclusiones sean frágiles y no generalizables.
- Los pesos por sí solos no constituyen el instrumento completo: se necesita el código de extracción de características del repositorio para reproducir la inferencia.
- El formato Joblib se basa en pickle, lo que implica un riesgo de seguridad si se cargan ficheros de fuentes no confiables.
- No se han caracterizado sesgos específicos, aunque el uso en producción no está recomendado dado el fallo declarado.

## Enlaces

- Modelo: https://huggingface.co/caiotheodoro/vernier-rung1-probe
- Dataset: https://huggingface.co/datasets/caiotheodoro/vernier
- Repositorio y registro de decisiones: https://github.com/caiotheodoro/vernier
- Perfil del autor: https://huggingface.co/caiotheodoro/models

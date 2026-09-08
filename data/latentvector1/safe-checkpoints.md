# latentvector1/safe-checkpoints

## Resumen

SAFe es un conjunto de checkpoints de flujos normalizantes condicionales liberado por el usuario `latentvector1` como descarga anónima para acompañar una publicación en revisión por pares. El modelo está diseñado para la segmentación de anomalías y la detección de componentes fuera de distribución (out-of-distribution, OOD) en el ámbito de la conducción autónoma. En lugar de entrenar un modelo de cero, los flujos aprenden la densidad de las características extraídas por un backbone DINOv3, de modo que los píxeles o regiones que no encajan en las clases conocidas reciben puntuaciones de anomalía.

La relevancia actual del proyecto radica en la necesidad de sistemas de percepción robustos frente a objetos desconocidos en las carreteras, un problema abierto en la conducción autónoma. Se liberan seis checkpoints que combinan dos backbones (ConvNeXt-L y ViT-L) con distintos niveles de características y dos conjuntos de entrenamiento (Cityscapes e ISSU-static). Al tratarse de un modelo de visión puro, no se proporcionan parámetros de contexto ni información de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flujos normalizantes condicionales (conditional normalizing flows) con backbones DINOv3 |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision) |
| Licencia | Research-only |
| Formato de pesos | PyTorch (.ckpt, .pth) |
| Libreria | PyTorch |
| Tamanio del repositorio | 2,1 GB |
| Backbones | DINOv3 ConvNeXt-L y DINOv3 ViT-L |
| Niveles de caracteristicas | res4, res5 y ultimo bloque |
| Conjuntos de entrenamiento | Cityscapes (train) e ISSU-static (train) |

## Arquitectura y entrenamiento

Los checkpoints contienen dos componentes por configuración: un flujo normalizante condicional (`flows/`) y un prior gaussiano por clase (`priors/`). El flujo transforma las características de salida de DINOv3 (niveles `res4`, `res5` o el último bloque según el checkpoint) en una distribución normal estándar condicionada a la clase semántica, mientras que el prior gaussiano por clase se alinea con la distribución aprendida. Los seis checkpoints se diferencian por el backbone, el nivel de características y el conjunto de entrenamiento.

La model card indica que el código, las configuraciones y las instrucciones de uso están en un repositorio anónimo vinculado al artículo en revisión. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni ninguna técnica de alineación (RLHF/DPO), dado que no es un modelo de lenguaje.

## Capacidades

- Segmentacion de anomalias en imagenes de conduccion autonoma: el modelo puntua regiones fuera de la distribucion de clases conocidas en conjuntos como Cityscapes.
- Deteccion de out-of-distribution (OOD) mediante modelado de densidad con flujos normalizantes.
- Extraccion de caracteristicas con DINOv3 a distintos niveles de resolucion (res4, res5 y ultimo bloque).
- Modelado probabilistico condicional por clase mediante priores gaussianos.
- No incluye capacidades de generacion de texto, tool calling, agentes, vision general (vision-language) ni audio.
- No dispone de soporte multilingue ni de razonamiento simbolico.

## Casos de uso

- Segmentacion de objetos desconocidos en vehiculos autonomos: el flujo puede puntuar cada pixel segun su densidad bajo las clases conocidas y marcar anomalias como escombros, obras o animales en la via.
- Supervision de seguridad en sistemas de percepcion autoguiada: el modelo actua como modulo de alerta cuando la escena contiene elementos fuera de distribucion, reduciendo el riesgo de decisiones inseguras.
- Benchmarking de detectores de anomalias en entornos urbanos: permite comparar el comportamiento de distintos backbones y niveles de caracteristicas sobre Cityscapes e ISSU-static, facilitando la reproducibilidad experimental.
- Investigacion en flujos normalizantes condicionales: los checkpoints sirven para reproducir experimentos de modelado de densidades sobre caracteristicas de alto nivel de modelos de vision.
- Evaluacion de robustez de segmentacion semantica frente a clases abiertas: las puntuaciones de anomalia pueden usarse para rechazar predicciones de baja confianza en escenarios open-set.
- Priorizacion del etiquetado humano de datos anomalos: las salidas del flujo pueden identificar imagenes con alta densidad de anomalias y ordenar su revision manual para el entrenamiento de futuros detectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se indica si el modelo cabe en GPUs de consumidor, aunque los backbones DINOv3 ConvNeXt-L y ViT-L son de gran tamaño.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion comparable en los datos publicados. No se han encontrado evaluaciones frente a otros modelos de segmentacion de anomalias o deteccion OOD en la informacion disponible.

## Limitaciones y advertencias

- Licencia de uso exclusivo para investigacion y revision por pares: el uso comercial y el despliegue en produccion estan restringidos.
- Los pesos se liberan para revision por pares y reproducibilidad; el codigo y las configuraciones estan en un repositorio anonimo no accesible desde este repo de HuggingFace.
- Es un modelo de vision pura: no puede procesar texto ni realizar tareas de lenguaje.
- Entrenado solo sobre Cityscapes (train) e ISSU-static (train), lo que puede limitar la generalizacion a otros dominios visuales (condiciones de iluminacion, meteorologia o geografias distintas).
- No se han publicado benchmarks ni metricas de rendimiento, por lo que la eficiencia real y la calidad practica son desconocidas.
- Como modelo probabilistico para deteccion de anomalias, es susceptible a falsos positivos en escenas ruidosas o ambiguas.
- No incluye un script de inferencia en el repositorio de HuggingFace; es necesario obtener el codigo anonimizado para reproducir los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/latentvector1/safe-checkpoints
- Repositorio de codigo anonimizado: no disponible en la informacion publica (segun la model card, se proporciona en el articulo en revision).
- Paper asociado: no disponible.

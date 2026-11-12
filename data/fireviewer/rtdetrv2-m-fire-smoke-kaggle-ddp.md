# fireviewer/rtdetrv2-m-fire-smoke-kaggle-ddp

## Resumen

RT-DETRv2-M fire/smoke es un modelo de deteccion de objetos basado en la arquitectura RT-DETR (Real-Time Detection Transformer) en su variante v2 y tamano M, ajustado por el usuario fireviewer para la deteccion de dos clases: fuego (fire) y humo (smoke). El modelo parte de los pesos oficiales de RT-DETRv2 y se ha entrenado sobre el dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native` en su version fijada por commit, con el objetivo de servir como detector especializado en escenarios de vigilancia de incendios.

El entrenamiento se realizo sobre dos GPU T4 con DistributedDataParallel (un proceso por GPU), con un limite de 27 horas y parada temprana tras 7 validaciones sin mejora en AP50-95. El estado publicado corresponde a **epoch_1**, es decir, un ajuste muy temprano: `best.pth` recoge la mejor validacion y `last.pth` el ultimo estado con optimizador. Esto es relevante para evaluar su madurez: no es un modelo final convergido, sino un checkpoint inicial de un fine-tuning.

A pesar de su estado temprano, el modelo es relevante como ejemplo reproducible de fine-tuning de RT-DETRv2 en un caso de uso critico (deteccion temprana de incendios) y como base para quien quiera continuar el entrenamiento o comparar con detectores clasicos tipo YOLO. Su licencia Apache 2.0 facilita su uso comercial, aunque la calidad real debe validarse antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (Real-Time Detection Transformer v2), variante M |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pth`) |
| Idiomas soportados | no aplica (vision; sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best.pth`, `last.pth`) |
| Clases | 0 = fire, 1 = smoke |
| Tamano del repo | 0.6 GB |
| Hardware de entrenamiento | 2 x NVIDIA T4, DistributedDataParallel |
| Duracion del entrenamiento | limite de 27 horas, parada temprana tras 7 validaciones sin mejora en AP50-95 |
| Estado del checkpoint | epoch_1 |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector de objetos end-to-end basado en transformer, sucesor de RT-DETR, que elimina la necesidad de componentes post-procesado como NMS y ofrece un equilibrio entre precision y velocidad en tiempo real. La variante M corresponde a un tamano intermedio dentro de la familia (S, M, L, X). El modelo parte de los pesos oficiales de RT-DETR (commit `df2a96c8c3a098567a1149bf0248da6efe6d495d`) y se ha ajustado sobre el dataset `fireviewer/fireviewer_fire_smoke_flame_v3_native` (commit `8c8b197fa1c928217529a04bff434fb70a66614e`), con dos clases: fuego y humo.

El entrenamiento se ejecuto en dos GPU T4 con DistributedDataParallel, un proceso por GPU, con un limite de 27 horas y parada temprana basada en AP50-95. El checkpoint publicado corresponde a **epoch_1**, lo que indica un ajuste muy temprano y probablemente no convergido. La model card incluye configuracion y logs (`ddp_verified.json`), lo que facilita la reproducibilidad. No se detalla la composicion del dataset, el numero de imagenes ni si se aplicaron aumentos de datos o tecnicas de regularizacion especificas.

## Capacidades

- Deteccion de objetos en imagenes para dos clases: fuego (fire) y humo (smoke).
- Salida end-to-end sin NMS, propia de la familia RT-DETR.
- Entrenado especificamente para escenarios de vigilancia de incendios (imagenes de llamas y humo).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision-language ni audio.
- Adecuado como componente de un pipeline de vision por computador, no como modelo autonomo de decision.

## Casos de uso

- **Vigilancia forestal con camaras fijas**: el modelo puede procesar frames de camaras en torres de vigilancia y emitir alertas cuando detecta fuego o humo, integrandose en un sistema de alerta temprana. Su arquitectura en tiempo real lo hace apto para inferencia por frame.
- **Deteccion temprana de humo en interiores industriales**: en naves, almacenes o plantas, el modelo puede complementar sensores de humo fisicos analizando video CCTV y detectando columnas de humo antes de que se activen los detectores puntuales.
- **Monitorizacion de quemas controladas**: en gestion forestal, permite verificar que una quema prescrita se mantiene dentro de los limites previstos y detectar propagacion no deseada.
- **Analisis post-incendio de grabaciones**: procesamiento por lotes de video almacenado para localizar el inicio y la evolucion de un incendio, ayudando en la investigacion de causas.
- **Integracion en drones de vigilancia**: al ser un modelo compacto (variante M), puede desplegarse en plataformas con GPU embebida para inspeccion aerea de zonas de riesgo.
- **Prototipado y fine-tuning adicional**: dado que el checkpoint esta en epoch_1 y la licencia es Apache 2.0, sirve como base para que otros equipos continuen el entrenamiento con sus propios datos de incendios.
- **Sistemas de alerta en estaciones de tren o tuneles**: deteccion de humo en infraestructuras criticas donde los sensores tradicionales pueden tardar en reaccionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las puntuaciones se miden sobre validacion y que el conjunto de test permanece reservado, pero no se incluyen valores numericos de AP50, AP50-95 ni comparaciones con otros detectores.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la informacion proporcionada. Como referencia orientativa de la familia RT-DETRv2-M, la inferencia en FP32 suele requerir del orden de 2-4 GB de VRAM, pero este dato no esta confirmado para este checkpoint concreto.
- **GPU recomendadas**: el entrenamiento se realizo en 2 x NVIDIA T4, por lo que T4 es un minimo viable para entrenamiento. Para inferencia, cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente, aunque no se confirma.
- **Compatibilidad con GPU de consumo**: probable en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamano del repo (0.6 GB) y la variante M. No confirmado.
- **Opciones de despliegue**: al estar en formato PyTorch (`.pth`), requiere el codigo oficial de RT-DETR para cargar los pesos. No se proporcionan pesos en ONNX, TensorRT ni otros formatos optimizados.
- **Latencia y throughput**: no disponibles. La familia RT-DETR esta disenada para tiempo real, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RT-DETRv2-M fire/smoke (este) | no disponible | no aplica | no publicado (epoch_1) | Apache 2.0 | Hugging Face |
| RT-DETRv2-M oficial | no disponible en la informacion | no aplica | benchmarks oficiales en el repo de RT-DETR | Apache 2.0 | GitHub oficial / Hugging Face |
| YOLOv8 / YOLO11 (deteccion en tiempo real) | depende de variante (n, s, m, l, x) | no aplica | benchmarks publicos en Ultralytics | AGPL-3.0 (o licencia comercial) | Ultralytics / Hugging Face |
| DETR original | no disponible | no aplica | benchmarks publicos | Apache 2.0 | GitHub oficial |

La comparacion cuantitativa no es posible con la informacion disponible: no se han publicado metricas de este checkpoint ni se detallan los resultados del modelo base en la model card.

## Limitaciones y advertencias

- **Checkpoint en epoch_1**: el modelo se encuentra en un estado de entrenamiento muy temprano, por lo que su precision real es probablemente baja y no representa un detector listo para produccion.
- **Sin metricas publicadas**: no se han publicado AP50, AP50-95 ni curvas de validacion, lo que impide evaluar su calidad objetivamente.
- **Conjunto de test reservado**: el autor indica que el test set no se ha liberado, por lo que no hay validacion independiente.
- **Dataset no detallado**: se desconoce el numero de imagenes, la composicion por clase y el balance entre fuego y humo, lo que afecta a la generalizacion.
- **Riesgo de falsos positivos y negativos**: en un dominio critico como la deteccion de incendios, un falso negativo puede tener consecuencias graves; cualquier despliegue debe acompanarse de validacion exhaustiva y sistemas redundantes.
- **Sesgos del dataset**: el modelo hereda los sesgos de `fireviewer_fire_smoke_flame_v3_native` (posible sobrerrepresentacion de ciertos tipos de llama, condiciones de iluminacion o geografia).
- **Sin soporte linguistico ni multimodal**: no es un modelo de lenguaje; no puede generar descripciones ni razonar sobre las detecciones.
- **Formato de pesos limitado**: solo se ofrece PyTorch (`.pth`); no hay versiones ONNX, TensorRT ni cuantizadas, lo que complica el despliegue en edge.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantias; el usuario asume la responsabilidad del uso en aplicaciones criticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/rtdetrv2-m-fire-smoke-kaggle-ddp
- Dataset: `fireviewer/fireviewer_fire_smoke_flame_v3_native` (commit `8c8b197fa1c928217529a04bff434fb70a66614e`)
- Codigo oficial RT-DETR (commit referenciado): `df2a96c8c3a098567a1149bf0248da6efe6d495d` — repositorio oficial de RT-DETR en GitHub (https://github.com/lyuwenyu/RT-DETR)
- Configuracion y logs DDP: `ddp_verified.json` (incluido en el repositorio del modelo)

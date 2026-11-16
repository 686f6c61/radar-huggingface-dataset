# fastforks/flowseek

## Resumen

FlowSeek es un modelo de estimación de flujo óptico (optical flow) desarrollado por Poggi y Tosi (2025) y portado al framework fastforks bajo el identificador `fastforks/flowseek`. Resuelve el problema de estimar el movimiento por píxel entre dos fotogramas consecutivos de vídeo, devolviendo un campo de flujo (dx, dy) en píxeles. La variante publicada es la talla T (Small), construida sobre SEA-RAFT con codificadores ResNet18, regresión inicial de flujo, bloque de actualización ConvNeXt y 4 iteraciones, asistida por un Depth Anything V2 Small congelado que aporta profundidad relativa y ocho bases de movimiento.

La innovación principal reside en la incorporación de profundidad monocular como contexto auxiliar: las características de Depth Anything V2 se concatenan con las de matching, y su profundidad relativa genera ocho bases de movimiento (los campos de flujo que causarían traslaciones y rotaciones de cámara), que un tercer codificador convierte en contexto adicional. Cada imagen se redimensiona a 518x518 para Depth Anything, independientemente del tamaño de entrada.

Este repositorio es únicamente una model card: no aloja pesos. fastforks descarga los pesos de los autores desde enlaces externos y los verifica contra el SHA-256 registrado. El modelo se etiqueta como experimental, con backend `portable` y salida de tipo `flow`. Las tallas mayores M y L, que usan Depth Anything V2 Base con pesos no comerciales, no están incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SEA-RAFT (ResNet18 encoders, regresion inicial de flujo, bloque de actualizacion ConvNeXt, 4 iteraciones) + Depth Anything V2 Small congelado (8 bases de movimiento) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por pares de imagenes) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable); no se documentan otras |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Codigo: Apache-2.0 AND BSD-3-Clause; pesos: sin licencia separada declarada por los autores |
| Formato de pesos | `.pth` (PyTorch); no se alojan en el repo, se descargan de enlaces externos |
| Tarea | image-to-image (optical flow) |
| Entrada | Dos imagenes RGB consecutivas, cualquier H x W >= 128 |
| Salida | Flujo por pixel (dx, dy en pixeles) |
| Variantes | `flowseek-t@1`, `flowseek-t-things@1`, `flowseek-t-things-notartan@1` |
| Backend | `portable` (kernels no disponibles para esta talla) |
| Tier | experimental |

## Arquitectura y entrenamiento

FlowSeek talla T combina dos redes: un estimador de flujo SEA-RAFT con codificadores ResNet18, regresión inicial de flujo, bloque de actualización ConvNeXt y 4 iteraciones, y un Depth Anything V2 Small congelado que actúa como fuente de contexto geométrico. Las características de Depth Anything se unen a las de matching, y su profundidad relativa se transforma en ocho bases de movimiento (campos de flujo correspondientes a traslaciones y rotaciones de cámara), que un tercer codificador convierte en contexto adicional para el estimador. La configuración `iters=12` corresponde a FlowSeek (S) del artículo; las tallas M y L, que emplean Depth Anything V2 Base con pesos no comerciales, no se incluyen en este port.

El entrenamiento sigue el esquema de los autores: pretraining en TartanAir, luego FlyingChairs, FlyingThings3D (parte de SceneFlow) y finalmente una mezcla de FlyingThings3D, Sintel, KITTI 2015 y HD1K (protocolo TSKH). Las tres variantes publicadas difieren en el conjunto de datos de ajuste: `flowseek-t@1` usa TSKH, `flowseek-t-things@1` usa TartanAir + FlyingThings3D, y `flowseek-t-things-notartan@1` usa solo FlyingThings3D. Depth Anything V2 Small fue entrenado por sus autores con imágenes sintéticas y reales pseudo-etiquetadas. No se documenta RLHF ni DPO, al no ser un modelo de lenguaje.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas RGB consecutivos, con salida por píxel (dx, dy).
- Manejo de entradas de cualquier resolución H x W >= 128, con redimensionado o padding interno.
- Aprovechamiento de profundidad monocular (Depth Anything V2 Small) para desambiguar movimiento de cámara frente a movimiento de objetos.
- Ocho bases de movimiento derivadas de la profundidad relativa para modelar traslaciones y rotaciones de cámara.
- Inferencia en fp16 (portable) y fp32 (original), con soporte de `torch.compile` y TensorRT fp16.
- No soporta tool calling, agentes, multi-step reasoning ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Estabilización de vídeo: el modelo calcula el flujo entre fotogramas consecutivos para estimar el movimiento global de cámara y compensarlo en postproducción; su resolución de entrada flexible permite trabajar con material 1080p o superior.
- Interpolación de fotogramas: el campo de flujo denso entre dos fotogramas permite sintetizar fotogramas intermedios en pipelines de aumento de tasa de refresco, con latencia de 395 ms por par a 1080x1920 en fp16 portable.
- Seguimiento de objetos y segmentación guiada por movimiento: el flujo por píxel alimenta algoritmos de tracking o de propagación de máscaras en vídeo, aprovechando la profundidad relativa para separar objetos del fondo.
- Odometría visual para robótica y vehículos: la estimación de movimiento entre pares de imágenes sirve como señal de odometría en sistemas con cámara monocular, con la ventaja de las bases de movimiento derivadas de profundidad.
- Análisis de movimiento en vídeo deportivo o biomédico: cuantificación del desplazamiento de sujetos y objetos entre fotogramas para métricas de velocidad y trayectoria.
- Preprocesado para modelos de vídeo generativo: el flujo óptico proporciona condicionamiento de movimiento a pipelines de difusión de vídeo o de edición consistente entre fotogramas.
- Detección de movimiento anómalo en videovigilancia: el flujo denso permite identificar regiones con desplazamiento incoherente respecto al fondo, con entrada flexible y bajo consumo (8,6 GiB pico a 1024x2048).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (EPE, Fl-all en KITTI, Sintel) en la información disponible. Los únicos datos publicados son de velocidad y memoria en RTX 5060 Ti 16 GB (sm_120):

| Modelo | Entrada | Tiempo original fp32 (ms) | Tiempo portable fp16 (ms) | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|
| `flowseek-t` | 1080x1920 | 650 | 395 | 8671 / 8712 |
| `flowseek-t-things` | 1080x1920 | 650 | 395 | 8671 / 8712 |
| `flowseek-t-things-notartan` | 1080x1920 | 651 | 396 | 8671 / 8712 |

| Modelo | Entrada | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms) |
|---|---|---|---|---|
| `flowseek-t` | 1080x1920 | 395 | 258 | 168 |
| `flowseek-t-things` | 1080x1920 | 395 | 258 | 168 |
| `flowseek-t-things-notartan` | 1080x1920 | 396 | 258 | 168 |

Tiempos de arranque: carga de 0,18 s (portable) frente a 0,78-0,87 s (original); primera llamada de 0,46-0,47 s (portable) frente a 0,46-0,63 s (original), medida a 375x1242. La preparación de `torch.compile` requiere 54,2-54,6 s en frío, y la construcción de ONNX + engine de TensorRT, 97,5-107 s. Memoria pico con TensorRT: 11328-11330 MiB (alloc) / 11350-11352 MiB (reserved).

## Requisitos de hardware

- VRAM estimada: 8,6 GiB pico asignados (10,2 GiB reservados) a 1024x2048 en fp16; 8671 MiB asignados (8712 reservados) a 1080x1920 en portable.
- GPU recomendadas: RTX 5060 Ti 16 GB es la hardware de referencia de los benchmarks; cualquier GPU con al menos 12 GB de VRAM para resoluciones 1080p en fp16. Para TensorRT fp16 se requieren unos 11,3 GiB.
- Cabe en GPU consumer: sí, en RTX 5060 Ti 16 GB y previsiblemente en RTX 4080/4090 (16-24 GB); no cabe en GPUs de 8 GB a resoluciones 1080p.
- Opciones de despliegue: backend `portable` de fastforks (PyTorch fp16), `torch.compile`, TensorRT fp16 vía ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia: 395 ms por par a 1080x1920 en portable fp16; 258 ms con `torch.compile`; 168 ms con TensorRT fp16. Carga del modelo en 0,18 s (portable).
- Throughput: no disponible (solo se publican latencias por par de imágenes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowSeek T (este) | no disponible | cualquier H x W >= 128 | 395 ms/par a 1080x1920 (RTX 5060 Ti, fp16) | Codigo Apache-2.0 AND BSD-3-Clause; pesos sin licencia separada | Pesos en enlaces externos, verificados por SHA-256 |
| SEA-RAFT | no disponible | no disponible | no disponible | no disponible | Referencia base de la arquitectura |
| RAFT | no disponible | no disponible | no disponible | no disponible | Modelo clasico de optical flow |
| Depth Anything V2 Small | no disponible | 518x518 | no disponible | no disponible | Componente congelado dentro de FlowSeek |

No se dispone de datos de precisión (EPE, Fl-all) para comparar con SEA-RAFT, RAFT u otros estimadores de flujo en la información proporcionada. La comparativa se limita a la arquitectura y a las condiciones de licencia y despliegue.

## Limitaciones y advertencias

- Modelo experimental (tier `experimental`): no debe asumirse estabilidad de API ni de resultados en producción.
- Repositorio solo de model card: no contiene pesos; la descarga depende de enlaces de Google Drive de los autores y de la verificación SHA-256.
- Licencia de pesos ambigua: los autores no declaran una licencia separada para los pesos; la evidencia disponible asume Apache-2.0 AND BSD-3-Clause a partir del código, lo que debe verificarse antes de uso comercial.
- Las tallas M y L no se incluyen por usar Depth Anything V2 Base con pesos no comerciales; solo la talla T es potencialmente comercializable.
- Sin datos publicados de precisión (EPE, KITTI Fl-all, Sintel) en la información disponible: no es posible evaluar la calidad del flujo frente a alternativas.
- Sesgos y alucinaciones: no aplica en el sentido de lenguaje, pero el flujo puede ser incorrecto en regiones ocluidas, texturas repetitivas, superficies sin textura o movimientos muy grandes entre fotogramas.
- Dependencia de la profundidad monocular de Depth Anything V2 Small: errores en la profundidad relativa se propagan a las ocho bases de movimiento.
- Resolución interna fija de 518x518 para Depth Anything: detalles finos de la escena pueden perderse en ese redimensionado.
- Consumo de memoria elevado para un modelo de visión: 8,6 GiB pico a 1080x1920, lo que excluye GPUs de 8 GB.
- No soporta texto, tool calling ni agentes; su integración requiere un pipeline externo para tareas de más alto nivel.
- Los kernels del backend `kernels` no están disponibles para esta talla; solo se ofrece `portable`.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/flowseek
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original de los autores: https://github.com/mattpoggi/flowseek (commit `ba6407370bce`)
- Script de pesos y evidencia de licencia: https://github.com/mattpoggi/flowseek/blob/ba6407370bceeb96244cad4d60d37489f6eb471e/scripts/get_weights.sh
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/flow/models/flowseek/card.toml
- Pesos `flowseek-t@1`: https://drive.usercontent.google.com/download?id=1IQoyY5PpKSadtiGuhWwVCqvgD3y8CyFd&export=download&confirm=t
- Pesos `flowseek-t-things@1`: https://drive.usercontent.google.com/download?id=1dnMzlRqX7wziynQvZjafsXjgbfibNAKG&export=download&confirm=t
- Pesos `flowseek-t-things-notartan@1`: https://drive.usercontent.google.com/download?id=1COOQFkMulzpBm4zMoWsaRGk7E3YcVr2I&export=download&confirm=t

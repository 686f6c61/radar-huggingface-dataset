# fastforks/lingbot-depth

## Resumen

LingBot-Depth es un modelo de estimación de profundidad monocular desarrollado por Robbyant (2026) que resuelve el problema de la *depth completion* métrica: a partir de una imagen RGB y un mapa de profundidad métrico incompleto o ruidoso (RGB-D), genera un mapa de profundidad completo y métrico. La arquitectura se basa en un ViT-L de DINOv2 que atiende conjuntamente sobre tokens de imagen y de profundidad, combinado con el cuello convolucional de MoGe y cabezas específicas de profundidad y máscara.

El repositorio `fastforks/lingbot-depth` es únicamente una model card: no aloja pesos. La herramienta fastforks descarga los pesos originales de los repositorios de los autores y los verifica contra los hashes SHA-256 publicados. Existen dos variantes: `lingbot-depth@1` (pretrain v0.5) y `lingbot-depth-dc@1` (postrain con depth completion), ambas bajo licencia Apache-2.0 y con uso comercial permitido.

Es relevante para desarrolladores que necesitan integrar estimación de profundidad métrica en pipelines de percepción (robótica, reconstrucción 3D, realidad aumentada) con verificación de integridad de pesos, despliegue portable en CUDA y compatibilidad con exportación a TensorRT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-L (DINOv2) con atención conjunta imagen-profundidad, cuello convolucional de MoGe y cabezas de profundidad/máscara |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa cualquier H x W >= 1, redimensionado/padding interno con patch 14) |
| Tipos de cuantización | fp16 (por defecto en GPU), fp32 (CPU y referencia); TensorRT fp16 |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 (código y pesos; uso comercial permitido) |
| Formato de pesos | `model.pt` (PyTorch); exportación a ONNX y TensorRT disponible |

## Arquitectura y entrenamiento

El modelo es un transformer de visión (ViT-L de DINOv2) que recibe tokens de la imagen RGB y tokens del mapa de profundidad métrico incompleto, y aplica atención conjunta sobre ambos. Sobre la representación resultante se aplica el cuello convolucional de MoGe y dos cabezas: una de profundidad y otra de máscara. La tarea es *depth completion* métrica: la profundidad de entrada es obligatoria (`prompt_depth=`), en metros, con huecos codificados como 0, NaN o inf. Los huecos alteran el número de tokens del ViT, por lo que el modo `kernels` ejecuta el ViT por imagen; la exportación conserva todos los tokens de profundidad (enmascarados) y usa tamaño fijo.

El entrenamiento emplea datos RGB-D reales y sintéticos a gran escala con *masked depth modelling*, según el informe técnico de los autores. No se dispone de detalles sobre número de tokens, composición exacta del dataset ni si hubo RLHF/DPO (no aplicable a una tarea de regresión densa). La innovación destacable es la atención conjunta imagen-profundidad sobre un backbone DINOv2 con verificación criptográfica de pesos y paridad numérica con el código original (max |diff| <= 0.005 en CPU fp32; error medio <= 1.5 % y p99 <= 5 % en GPU fp16).

## Capacidades

- Estimación de profundidad métrica (en metros) a partir de RGB + profundidad incompleta.
- Depth completion: rellena huecos y reduce ruido en mapas de profundidad RGB-D.
- Salida de máscara junto con el mapa de profundidad.
- Procesa entradas de cualquier resolución H x W >= 1 (redimensionado/padding interno, patch 14); probado hasta 3000x4000.
- Dos variantes: `lingbot-depth` (pretrain) y `lingbot-depth-dc` (postrain con depth completion).
- Backends `portable` y `kernels`; exportación a ONNX y TensorRT fp16.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Robótica móvil y manipulación: el modelo convierte lecturas ruidosas de sensores de profundidad (LiDAR disperso, cámaras de tiempo de vuelo) en mapas densos métricos en metros, adecuados para planificación de trayectorias y evitación de obstáculos.
- Reconstrucción 3D y fotogrametría: a partir de pares RGB-D con huecos, genera profundidad completa que alimenta pipelines de *point cloud* y mallas, con resolución de entrada flexible hasta 3000x4000.
- Realidad aumentada y mixta: la profundidad métrica permite ocluir objetos virtuales con geometría real; el modelo estima la cámara o usa intrínsecos y produce metros directamente.
- Automoción y ADAS: fusión de profundidad dispersa de LiDAR con imagen para percepción densa; la variante `dc` está entrenada específicamente para completar mapas incompletos.
- Inspección industrial y medición: al producir profundidad en metros con paridad numérica verificada frente al código original, es apto para medición dimensional con control de integridad de pesos.
- Despliegue en producción con TensorRT: la exportación a motor TensorRT fp16 reduce la latencia a 188 ms por imagen de 994x1482, adecuada para pipelines en tiempo casi real sobre GPU consumer.
- Procesamiento de imágenes de alta resolución en memoria limitada: en una RTX 5060 Ti de 16 GB procesa 3000x4000 con 1,7 GiB de memoria pico asignada.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Entrada | Portable (ms) | TensorRT fp16 (ms) | Memoria pico portable (MiB) | Memoria pico TensorRT (MiB) |
|---|---|---|---|---|---|
| `lingbot-depth` | 994x1482 | 280 | 188 | 1559 / 1872 | 1821 / 1876 |
| `lingbot-depth-dc` | 994x1482 | 281 | 188 | 1559 / 1872 | 1821 / 1876 |

| Métrica | `lingbot-depth` | `lingbot-depth-dc` |
|---|---|---|
| Carga (s, portable) | 1,38 | 1,29 |
| Primera llamada (s, portable) | 0,53 | 0,53 |
| `torch.compile` (ms, 994x1482) | diferido (build > 5 min) | 252 |
| Preparación TensorRT (ONNX + engine) | 65,5 s | 67,3 s |

No se han publicado resultados de benchmarks de precisión (AbsRel, RMSE, delta) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1,7 GiB de memoria pico asignada para 3000x4000 en fp16 (2,1 GiB reservada); 1,5 GiB para 994x1482.
- GPU recomendadas: RTX 5060 Ti 16 GB (probada), cualquier GPU CUDA con al menos 4 GB de VRAM para resoluciones medias; A100/H100 para lotes grandes o alta resolución.
- Cabe en GPU consumer: sí, incluso en tarjetas de gama media con 8 GB.
- Opciones de despliegue: backend `portable` (PyTorch), backend `kernels` (kernel específicos), exportación ONNX, TensorRT fp16, `torch.compile`.
- Latencia: 280 ms por imagen 994x1482 en portable; 188 ms con TensorRT fp16; 252 ms con `torch.compile` en la variante `dc`.
- Throughput: no disponible (no se publican imágenes por segundo).

## Comparativa con modelos similares

| Modelo | Tarea | Backbone | Entrada de profundidad | Licencia | Uso comercial |
|---|---|---|---|---|---|
| LingBot-Depth | Depth completion métrica | DINOv2 ViT-L | Requerida (métrica) | Apache-2.0 | Sí |
| Depth Pro | Profundidad monocular métrica | no disponible | No requerida | no disponible | no disponible |
| UniDepth v2 ViT-L | Profundidad monocular métrica | ViT-L | No requerida | no disponible | no disponible |
| MoGe | Profundidad monocular | no disponible | No requerida | no disponible | no disponible |

La diferencia clave de LingBot-Depth frente a los modelos monodepth puros (Depth Pro, UniDepth, MoGe) es que exige un mapa de profundidad métrico de entrada y realiza *completion*, lo que lo hace dependiente de un sensor RGB-D o LiDAR. Los datos de rendimiento comparativo de precisión no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El mapa de profundidad es obligatorio: sin `prompt_depth=` el modelo no funciona; no es un monodepth puro.
- Los huecos en la profundidad de entrada alteran el número de tokens del ViT, lo que impide el procesamiento por lotes en modo `kernels` y fija el tamaño en exportación.
- Los mapas de profundidad de entrada deben estar en metros; unidades incorrectas producen salidas erróneas.
- La paridad numérica verificada es frente al código original en un commit concreto (`f3a237e`); cambios en dependencias pueden alterarla.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte que es un "research-use package" y recomienda revisar las cadenas de licencia originales antes de otros usos.
- No se han publicado métricas de precisión (AbsRel, RMSE) ni evaluación de sesgos; riesgo de alucinación geométrica en regiones sin datos de profundidad.
- El repositorio no aloja pesos: depende de la disponibilidad de los repositorios de Robbyant y de la verificación SHA-256 de fastforks.

## Enlaces

- Hugging Face (model card): https://huggingface.co/fastforks/lingbot-depth
- Pesos variante pretrain: https://huggingface.co/robbyant/lingbot-depth-pretrain-vitl-14-v0.5
- Pesos variante postrain dc: https://huggingface.co/robbyant/lingbot-depth-postrain-dc-vitl14
- Código fastforks: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Código original: https://github.com/robbyant/lingbot-depth
- Licencia original: https://github.com/robbyant/lingbot-depth/blob/main/LICENSE
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/lingbot_depth/card.toml

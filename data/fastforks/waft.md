# fastforks/waft

## Resumen

WAFT (Wang & Deng 2025) es un modelo de estimación de flujo óptico que prescinde del cost volume, el componente habitual en arquitecturas como RAFT o PWC-Net. La propuesta combina un codificador congelado Depth Anything V2 Small con un ResNet18 para extraer características a media resolución, y refina el flujo de forma iterativa mediante un ViT-S con parches de 8 píxeles. El resultado se obtiene tras cinco iteraciones de warping y refinamiento, con un upsampling convexo a resolución completa. El repositorio `fastforks/waft` es una ficha de modelo gestionada por el proyecto fastforks, que no aloja pesos: descarga los checkpoints originales de los autores y los verifica mediante SHA-256.

El modelo se distribuye en tres variantes: `waft-a1` (checkpoint general recomendado para uso downstream, entrenado sobre TartanAir, FlyingChairs y FlyingThings3D), `waft-a1-kitti` y `waft-a1-sintel` (fine-tunes para los benchmarks KITTI y Sintel). La tarea es image-to-image: recibe dos imágenes RGB consecutivas y devuelve el movimiento por píxel (dx, dy) de la primera a la segunda. Está etiquetado como experimental y soporta dos backends de ejecución, `portable` y `kernels`.

Su relevancia radica en la eliminación del cost volume, que reduce el consumo de memoria y permite procesar resoluciones altas (hasta 1080x1920 probado) en GPUs de consumo con 16 GB. Los benchmarks publicados en la model card muestran aceleraciones de hasta 3x frente al código original en fp32 y una reducción de memoria de aproximadamente un 66% en el backend `kernels`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Depth Anything V2 Small congelado + ResNet18 + refinador ViT-S (parche 8), sin cost volume |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | fp16, fp32 (TensorRT fp16 soportado; no se documentan otras) |
| Idiomas soportados | no aplica (modelo de flujo óptico, sin capacidades lingüísticas) |
| Licencia | Código BSD-3-Clause; licencia de pesos no declarada por los autores (se asume BSD-3-Clause) |
| Formato de pesos | `.pth` (PyTorch); exportación ONNX y TensorRT documentada |
| Resolución de entrada | Cualquier H x W >= 112, redimensionada o con padding interno |
| Backends | `portable`, `kernels` |
| Salida | Flujo óptico por píxel (dx, dy en píxeles) |

## Arquitectura y entrenamiento

WAFT sustituye el cost volume clásico por un esquema iterativo de warping y refinamiento. Un codificador congelado Depth Anything V2 Small, junto con un ResNet18, extrae características a media resolución de ambas imágenes. En cada una de las cinco iteraciones, las características de la segunda imagen se deforman según el flujo actual y un ViT-S pequeño (parches de 8) refina el flujo resultante. Finalmente, un upsampling convexo lleva el flujo a resolución completa. Esta aproximación evita la construcción explícita de correlaciones volumétricas, lo que reduce el coste de memoria y permite trabajar con resoluciones altas.

El entrenamiento sigue una secuencia curricular: pretraining en TartanAir, seguido de FlyingChairs (Freiburg) y FlyingThings3D (parte de Freiburg SceneFlow). El checkpoint `waft-a1` corresponde a esta combinación, tal como indica el nombre `tar-c-t`. Los fine-tunes `-kitti` y `-sintel` ajustan el modelo a los dominios de esos benchmarks. El Depth Anything V2 Small integrado fue entrenado por sus autores con imágenes sintéticas y reales pseudo-etiquetadas. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre el número exacto de tokens o muestras de entrenamiento.

## Capacidades

- Estimación de flujo óptico denso entre dos imágenes RGB consecutivas, con salida por píxel (dx, dy).
- Procesamiento de resoluciones altas: probado hasta 1080x1920 en una RTX 5060 Ti de 16 GB.
- Entrada de cualquier tamaño H x W >= 112, con redimensionado o padding interno automático.
- Ejecución en dos backends: `portable` (portable a distintas GPUs) y `kernels` (kernels optimizados, mayor velocidad).
- Exportación a ONNX y TensorRT fp16 documentada.
- Compatibilidad con `torch.compile` (reduce el tiempo de inferencia de 791 ms a 610 ms en 1080x1920).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- Verificación de integridad de pesos mediante SHA-256 en el ecosistema fastforks.

## Casos de uso

- Estimación de movimiento en vídeo: el modelo recibe pares de fotogramas consecutivos y devuelve el flujo denso, adecuado para tareas de análisis de movimiento, seguimiento y estabilización. Su resolución máxima probada de 1080x1920 lo hace apto para vídeo Full HD.
- Estabilización y corrección de vídeo: el flujo calculado permite alinear fotogramas y compensar movimiento de cámara en pipelines de postproducción, con latencias de 519 ms por par a 1080x1920 en el backend `kernels`.
- Interpolación de fotogramas: el flujo entre dos imágenes consecutivas es la base para generar fotogramas intermedios en herramientas de aumento de tasa de refresco o slow-motion.
- Visión para robótica y navegación: la estimación de movimiento entre imágenes consecutivas sirve para odometría visual y evitación de obstáculos en robots con GPUs de consumo, gracias a su bajo consumo de memoria (1,8 GiB en `kernels`).
- Análisis de escenas de conducción: la variante `waft-a1-kitti` está ajustada al dominio KITTI, por lo que es adecuada para tareas de percepción en vehículos autónomos y análisis de tráfico.
- Procesamiento de vídeo a gran escala: la reducción de memoria del backend `kernels` (de 5,5 GiB a 1,8 GiB en 1080x1920) permite procesar lotes en GPUs de 16 GB, útil en pipelines de anotación automática o generación de datasets de flujo.
- Investigación en flujo óptico: al ser un modelo experimental con código BSD-3-Clause y pesos verificables, sirve como base para experimentos académicos que comparen arquitecturas sin cost volume.

## Benchmarks y rendimiento

La model card incluye datos de velocidad y memoria, pero la tabla de precisión (EPE y Fl-all sobre KITTI y Sintel) aparece truncada en la información disponible. No se han publicado resultados completos de benchmarks de precisión en la información disponible.

Datos de velocidad y memoria (RTX 5060 Ti 16 GB, sm_120, entrada 1080x1920):

| Modelo | Original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|
| `waft-a1` | 1533 | 791 | 519 | 3,0x | 3553 / 4076 | 1851 / 2264 |
| `waft-a1-kitti` | 1533 | 791 | – | – | 3553 / 4196 | – |
| `waft-a1-sintel` | 1533 | 791 | – | – | 3553 / 4076 | – |

Tiempos de arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|
| `waft-a1` | 5,87 | 0,51 | 3,41 | 0,79 |
| `waft-a1-kitti` | 4,06 | 0,54 | 2,87 | 0,79 |
| `waft-a1-sintel` | 2,93 | 0,51 | 2,87 | 0,79 |

`torch.compile` y TensorRT:

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 | Kernels (ms) | Preparación compile (s) |
|---|---|---|---|---|---|
| `waft-a1` | 791 | 610 | diferido (build >5 min) | 519 | 84,7 |
| `waft-a1-kitti` | 791 | 610 | diferido | – | 84,1 |
| `waft-a1-sintel` | 791 | 610 | diferido | – | 84,7 |

## Requisitos de hardware

- VRAM estimada: 1,8 GiB de memoria pico asignada con el backend `kernels` a 1080x1920; 3,5 GiB con el backend `portable`; 5,5 GiB con el código original en fp32.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks). Cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el backend `portable` a resoluciones moderadas.
- Cabe en GPUs de consumo: sí, con el backend `kernels` o `portable` en resoluciones de hasta 1080x1920. En resoluciones menores el margen es amplio.
- Opciones de despliegue: PyTorch nativo, `torch.compile`, ONNX Runtime, TensorRT fp16, y el ecosistema fastforks con backends `portable` y `kernels`.
- Latencia: 519 ms por par de fotogramas a 1080x1920 con `kernels`; 791 ms con `portable`; 610 ms con `torch.compile`; 1533 ms con el código original en fp32.
- Throughput: no documentado explícitamente; a partir de la latencia se puede estimar en torno a 1,9 pares por segundo con `kernels` a 1080x1920.
- Tiempo de carga: 0,51 s con `portable` frente a 5,87 s con el código original.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión de WAFT en la información proporcionada, por lo que no es posible comparar su rendimiento con alternativas como RAFT, PWC-Net o FlowFormer. La comparativa se limita a características estructurales y de licencia.

| Modelo | Arquitectura | Cost volume | Licencia | Pesos disponibles | Memoria a 1080x1920 |
|---|---|---|---|---|---|
| WAFT (`waft-a1`) | Depth Anything V2 Small + ResNet18 + ViT-S | No | BSD-3-Clause (código); pesos sin licencia declarada | Sí, vía enlaces del autor | 1,8 GiB (`kernels`) |
| RAFT | CNN con cost volume correlacional | Sí | BSD-3-Clause | Sí | no disponible en esta ficha |
| FlowFormer | Transformer con cost volume | Sí | no disponible | Sí | no disponible en esta ficha |

## Limitaciones y advertencias

- Modelo etiquetado como experimental por el propio proyecto fastforks; no se recomienda para producción sin validación previa en el dominio objetivo.
- La licencia de los pesos no está declarada explícitamente por los autores. La model card asume BSD-3-Clause a partir de la licencia del código, pero esta asunción debe verificarse antes de cualquier uso comercial.
- El repositorio `fastforks/waft` no aloja pesos: depende de enlaces externos de Google Drive que pueden dejar de estar disponibles.
- La tabla de precisión (EPE, Fl-all) está truncada en la información disponible; no se pueden confirmar los niveles de error del modelo en KITTI o Sintel.
- Es un modelo de visión sin capacidades de texto: no soporta tool calling, agentes, razonamiento multi-paso ni multilingüismo.
- El rendimiento depende fuertemente del backend: el código original es aproximadamente 3x más lento y consume el triple de memoria que el backend `kernels`.
- TensorRT fp16 no está validado en los benchmarks publicados (build diferido por superar los 5 minutos).
- No se documentan sesgos específicos, pero al entrenarse principalmente con datos sintéticos (TartanAir, FlyingChairs, FlyingThings3D), puede generalizar peor en escenas reales fuera de los dominios de fine-tuning (KITTI, Sintel).
- El codificador Depth Anything V2 Small está congelado, lo que limita la adaptación a dominios muy distintos de los de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/waft
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original WAFT (princeton-vl): https://github.com/princeton-vl/WAFT
- Model zoo y licencia original: https://github.com/princeton-vl/WAFT/blob/b152ff1cad1af8c185ee7b141997c48ff3334c87/README.md#model-zoo
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Ficha de metadatos `card.toml`: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/flow/models/waft/card.toml
- Pesos `waft-a1`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1CxzBQx0iSg6AyIgt6MF0ROlF_cAeZLPC
- Pesos `waft-a1-kitti`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1hzpxBe80BmPCXjo9DvSszdCRsio5vLaB
- Pesos `waft-a1-sintel`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1pAsbH0Orb5mFo4CLCYi4dSm6FjxrOqO3

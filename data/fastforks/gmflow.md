# fastforks/gmflow

## Resumen

GMFlow es un modelo de estimación de flujo óptico (optical flow) que reformula la tarea como un problema de *matching* global entre dos imágenes consecutivas. Lo desarrollaron Xu, Zhang, Cai, Rezatofighi y Tao en 2022, y esta ficha corresponde a la distribución que hace el paquete `fastforks` de la versión publicada en UniMatch (Xu et al., 2023). No es un modelo de lenguaje: recibe dos imágenes RGB y devuelve, para cada píxel de la primera, el desplazamiento (dx, dy) hacia su correspondiente en la segunda.

La arquitectura combina un extractor convolucional que produce características a 1/8 de resolución, un Transformer con self-attention y cross-attention sobre ventanas desplazadas que hace que las características de ambas imágenes se condicionen mutuamente, y una capa de self-attention final que propaga el flujo hacia las zonas ocluidas. Las variantes `scale2` repiten el proceso a 1/4 de resolución con matching local, y las `regrefine6` añaden seis refinamientos locales al estilo RAFT.

El repositorio de Hugging Face es únicamente una model card: no aloja pesos. `fastforks` descarga los pesos originales de los autores y los verifica contra hashes SHA-256. Resulta relevante para quienes necesitan un baseline reproducible de flujo óptico con verificación de integridad y soporte para varios checkpoints preentrenados (FlyingChairs, FlyingThings3D, Sintel, KITTI), aunque su estado es explícitamente experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN + Transformer (self/cross-attention con ventanas desplazadas); variantes con refinamiento local tipo RAFT |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: par de imágenes de cualquier H x W >= 64) |
| Tipos de cuantización | fp16 (probado); no se documentan otras |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | `other` / `see-model-card`; código MIT AND Apache-2.0 AND BSD-3-Clause |
| Formato de pesos | `.pth` (PyTorch), alojados externamente en S3 de los autores |

## Arquitectura y entrenamiento

GMFlow sustituye el coste volumétrico clásico del flujo óptico por un mecanismo de atención global. Un backbone convolucional extrae características a 1/8 de resolución; un Transformer con self-attention y cross-attention sobre ventanas desplazadas hace que cada imagen "vea" la otra; el flujo se calcula como la posición esperada del mejor match sobre toda la imagen, y una capa de self-attention final lo difunde hacia regiones ocluidas. Las variantes `scale2` repiten el pipeline a 1/4 de resolución con matching local, y las `regrefine6` añaden seis iteraciones de refinamiento local análogas a RAFT.

Los datos de entrenamiento son FlyingChairs (Freiburg) y Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa), es decir, datasets sintéticos con ground truth denso. No se documenta en la información disponible el número exacto de tokens/pares ni si hubo ajuste fino con RLHF/DPO (no aplica en este dominio). Algunas variantes (`sintel`, `sintelft`, `kitti`) están ajustadas sobre los datasets de evaluación correspondientes, lo que conviene tener en cuenta al interpretar métricas.

## Capacidades

- Estimación densa de flujo óptico entre dos fotogramas consecutivos: salida por píxel (dx, dy) en píxeles.
- Manejo de oclusiones mediante la capa de self-attention final que propaga el flujo hacia zonas sin correspondencia visible.
- Matching global (variantes `scale1`) y matching local multiescala (variantes `scale2`).
- Refinamiento iterativo opcional (`regrefine6`) para mayor precisión en bordes y movimientos pequeños.
- Entrada de tamaño arbitrario (H x W >= 64), con padding automático a múltiplo de 16 (`scale1`) o 32 (`scale2`).
- Backend `portable` documentado; existen kernels para el backend `kernels` en un repositorio aparte.
- No soporta tool calling, agentes, ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Estimación de movimiento en vídeo: dado un par de fotogramas consecutivos, obtener el campo de flujo denso para tareas de seguimiento, estabilización o análisis de escenas dinámicas.
- Interpolación de fotogramas: el flujo entre el fotograma *t* y *t+1* permite sintetizar fotogramas intermedios en pipelines de postproducción o *frame rate upsampling*.
- Odometría visual y robótica: el flujo entre imágenes consecutivas de una cámara alimenta estimadores de movimiento propio; las variantes `kitti` están ajustadas para escenas de conducción.
- Estabilización de vídeo: el flujo permite estimar y compensar el movimiento global de cámara entre fotogramas.
- Segmentación guiada por movimiento: usar el flujo como característica auxiliar para separar objetos en movimiento del fondo estático.
- Evaluación comparativa de métodos de flujo: al ser un baseline reproducible con hashes verificados, sirve para *benchmarking* frente a RAFT, FlowFormer u otros métodos en Sintel y KITTI.
- Preprocesado para modelos de vídeo generativo: el flujo denso puede condicionar modelos de difusión de vídeo o alimentar warping explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de EPE (end-point error) ni comparaciones numéricas con otros métodos.

## Requisitos de hardware

- VRAM estimada (medida en RTX 5060 Ti 16 GB, fp16, backend `portable`, entrada 1024x2048):
  - Variantes `scale1`: 5,4 GiB pico asignado, 6,0 GiB reservado.
  - Variantes `scale2` y `scale2-regrefine6`: 6,3 GiB pico asignado, 13,1 GiB reservado.
- GPU recomendadas: cualquier GPU con >= 8 GB para `scale1` y >= 16 GB para `scale2` a resoluciones altas. Para resoluciones moderadas (p. ej. 512x1024) el consumo será sustancialmente menor, aunque no se documenta cifra exacta.
- Cabe en GPU de consumo: sí, al menos en RTX 5060 Ti 16 GB a 1024x2048; presumiblemente también en RTX 4090, RTX 3090 y similares con >= 16 GB para `scale2`.
- Opciones de despliegue: paquete `fastforks` (backend `portable` y backend `kernels`); PyTorch nativo cargando los `.pth` de los autores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GMFlow (este) | Flujo óptico | Matching global con Transformer | Cualquier H x W >= 64 | `other` (código MIT/Apache/BSD) | Pesos en S3 de los autores, verificados por `fastforks` |
| RAFT | Flujo óptico | Coste volumétrico + refinamiento iterativo | Resolución fija típica | BSD-3-Clause (según `LICENSE-RAFT` referenciado) | Pesos públicos en el repo de Princeton |
| FlowFormer | Flujo óptico | Transformer con coste volumétrico latente | Resolución fija | no disponible en esta información | Pesos públicos |
| UniMatch | Flujo óptico + correspondencia | Transformer multiescala | Variable | MIT/Apache/BSD (según repo) | Pesos públicos |

No se dispone de datos numéricos comparativos de EPE en la información proporcionada, por lo que la comparativa se limita a enfoque y disponibilidad.

## Limitaciones y advertencias

- Modelo marcado como **experimental** por el propio autor de la distribución (`fastforks`); no está pensado como componente de producción sin validación adicional.
- No es un modelo de lenguaje ni de propósito general: solo produce flujo óptico entre pares de imágenes.
- La licencia de los pesos no está declarada de forma explícita por los autores originales; `fastforks` asume MIT/Apache/BSD a partir de la licencia del código. Conviene verificar antes de uso comercial.
- El repositorio de Hugging Face no contiene pesos: solo la model card y los enlaces de descarga. La disponibilidad depende de que los S3 de los autores sigan activos.
- Entrenado principalmente con datos sintéticos (FlyingChairs, FlyingThings3D); el rendimiento en dominios reales puede degradarse sin ajuste fino.
- Las variantes ajustadas en Sintel o KITTI no deben evaluarse sobre esos mismos datasets sin tener en cuenta el sobreajuste al benchmark.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo visual puede heredar sesgos presentes en los datasets sintéticos de entrenamiento.
- Resolución mínima 64x64 y padding obligatorio a múltiplo de 16 o 32 según variante; entradas fuera de rango fallarán o se recortarán.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/gmflow
- Repositorio de código `fastforks`: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original UniMatch (commit `943a99006950`): https://github.com/autonomousvision/unimatch
- Model Zoo de UniMatch (evidencia de licencia): https://github.com/autonomousvision/unimatch/blob/943a99006950ab6c84ea72a72beb147fdd03c19a/MODEL_ZOO.md
- Paper GMFlow (Xu et al., 2022): no disponible en la información proporcionada
- Paper UniMatch (Xu et al., 2023): no disponible en la información proporcionada
- Pesos (ejemplo, variante `gmflow-scale1-mixdata`): https://s3.eu-central-1.amazonaws.com/avg-projects/unimatch/pretrained/gmflow-scale1-mixdata-train320x576-4c3a6e9a.pth

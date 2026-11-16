# shuinb/Quantized-LingBot-Map

## Resumen

Quantized-LingBot-Map es una versión cuantizada del modelo LingBot-Map, un sistema de reconstrucción 3D en streaming (streaming 3D mapping) desarrollado originalmente por Robbyant. El autor de esta variante, shuinb, aplica una técnica de cuantización denominada DSFQ (Hadamard rotation, channel smoothing y clipping aprendido de pesos y activaciones) sobre las capas GCT Linear del modelo original, reduciendo la precisión de pesos y activaciones a W4A4 (4 bits en pesos y 4 bits en activaciones). El checkpoint empaquetado ocupa aproximadamente 1,91 GB y se distribuye bajo licencia Apache-2.0.

El modelo resuelve el problema de ejecutar reconstrucción 3D densa en tiempo real sobre GPUs de consumo, donde el modelo original en BF16 resulta demasiado costoso en memoria. La propuesta mantiene las capas críticas en mayor precisión (DINO en BF16, cabezas de cámara y profundidad en FP32) mientras cuantiza 192 capas GCT Linear, y utiliza almacenamiento KV en FP4 con SDPA en BF16 por defecto.

Su relevancia actual radica en que demuestra que la cuantización agresiva W4A4 puede preservar la calidad de reconstrucción geométrica con una degradación mínima: en la secuencia TUM XYZ el ATE pasa de 3,312 cm (BF16) a 3,389 cm (DSFQ), frente a los 8,805 cm de una cuantización W4A4 directa sin calibración. El modelo está pensado para flujos de trabajo de mapeo 3D con imágenes RGB en orden cronológico, con soporte de inglés y chino en la documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LingBot-Map; capas GCT Linear cuantizadas, DINO en BF16, cabezas de cámara y profundidad en FP32) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | W4A4 en 192 capas GCT Linear; KV en FP4; DINO en BF16; cabezas en FP32 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch empaquetado (`models/dsfq/model.pt`, ~1,91 GB) |

## Arquitectura y entrenamiento

El modelo base LingBot-Map es un sistema de reconstrucción 3D en streaming; esta variante no modifica la arquitectura, sino que aplica cuantización post-entrenamiento con calibración. La técnica DSFQ combina tres componentes sobre las capas GCT Linear: rotación de Hadamard, suavizado por canal (channel smoothing) y clipping aprendido de pesos y activaciones. El checkpoint publicado cuantiza 192 capas GCT Linear, mientras que el backbone DINO permanece en BF16 y las cabezas de cámara y profundidad se mantienen en FP32. El runtime cuantizado por defecto usa almacenamiento KV en FP4 y SDPA en BF16.

La calibración se realizó con 320 fotogramas independientes de las secuencias TUM desk/rpy, seis estados de streaming por bloque y 15 épocas de reconstrucción. El autor advierte que las secuencias XYZ e Indoor son de desarrollo y evaluación, no pruebas ciegas no vistas. El backend automático emplea S4 nativo en GPUs SM8x (por ejemplo, RTX 3080) y códigos de 4 bits con GEMM INT8 en otras GPUs CUDA compatibles; el S4 nativo requiere CUDA toolkit y CUTLASS. La cuantización sigue el enfoque de QuantVGGT y el checkpoint deriva del modelo original robbyant/lingbot-map.

## Capacidades

- Reconstrucción 3D en streaming a partir de secuencias de imágenes RGB con nombres cronológicos.
- Mapeo denso con estimación de trayectoria de cámara y profundidad por fotograma.
- Inferencia sobre secuencias largas (evaluado con 732 fotogramas en TUM XYZ y 5.000 fotogramas en Indoor Travel).
- Ejecución con cuantización W4A4 manteniendo capas sensibles en BF16/FP32.
- Compatibilidad con backends S4 nativo (SM8x) y GEMM INT8 en otras GPUs CUDA.
- Soporte de documentación en inglés y chino.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo thinking; el modelo está especializado en mapeo 3D.

## Casos de uso

- Reconstrucción 3D en robótica móvil: el modelo procesa secuencias RGB cronológicas y produce trayectoria y mapa denso, adecuado para odometría visual en robots con GPUs de consumo gracias a su huella de memoria reducida.
- SLAM visual en interiores: con 5.000 fotogramas evaluados en Indoor Travel, puede alimentar pipelines de localización y mapeo en entornos domésticos u oficinas.
- Digitalización de escenas con hardware de gama media: al ocupar ~1,91 GB el checkpoint y medir 5,876 GB de pico de proceso en RTX 5090, permite mapeo en estaciones de trabajo con una sola GPU.
- Prototipado en investigación de cuantización: sirve como referencia reproducible de W4A4 calibrado frente a BF16, con scripts de calibración (`python -m qmap calibrate --method w4a4`) y auditoría de calibración incluida.
- Procesamiento por lotes de secuencias de vídeo convertidas a fotogramas: la CLI `python -m qmap infer` permite procesar directorios de imágenes con control de inicio y número de fotogramas.
- Evaluación comparativa de técnicas de cuantización: los ficheros `results/xyz.json`, `results/indoor.json` y `results/calibration_audit.json` permiten contrastar ATE, RPE y AbsRel de profundidad entre métodos.
- Despliegue en GPUs de consumo para docencia o demos: el backend INT8 permite ejecutar en RTX 5090 a ~12 FPS y en RTX 3080 con S4 nativo a ~5,6 FPS, suficiente para visualizaciones interactivas no críticas.

## Benchmarks y rendimiento

TUM XYZ (menor es mejor):

| Método | GT ATE (cm) | Translation RPE (cm) | Depth AbsRel (%) |
|---|---:|---:|---:|
| BF16 | 3,312 | 0,826 | 4,149 |
| Direct LWC/LAC W4A4 + FP4 KV | 8,805 | 3,844 | 5,600 |
| DSFQ + FP4 KV | 3,389 | 1,561 | 4,206 |

Rendimiento medido:

| Configuración | Secuencia | Pico de proceso | FPS mínimo | FPS mediano |
|---|---|---:|---:|---:|
| DSFQ, RTX 5090 (backend INT8) | Indoor, 5.000 fotogramas, 3 ejecuciones | 5,876 GB | 11,987 | 12,477 |
| DSFQ, RTX 3080 (S4 nativo) | 248 fotogramas | 5,769 GB | 5,611 | No disponible |

Indoor Travel no dispone de ground truth; sus métricas miden concordancia con BF16.

## Requisitos de hardware

- VRAM estimada: pico de proceso medido de 5,876 GB en RTX 5090 y 5,769 GB en RTX 3080 con DSFQ; el checkpoint empaquetado ocupa ~1,91 GB.
- GPUs recomendadas: RTX 5090 (backend INT8, ~12 FPS) y RTX 3080 (S4 nativo, ~5,6 FPS). No se documentan pruebas en A100 ni H100.
- Cabe en GPUs de consumo: sí, según los datos de RTX 3080 y RTX 5090.
- Despliegue: CLI propia `python -m qmap infer` y `python -m qmap calibrate`; backend automático con S4 nativo en SM8x (requiere CUDA toolkit y CUTLASS) o códigos de 4 bits con GEMM INT8 en otras GPUs CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 11,987 FPS mínimo y 12,477 FPS mediano en RTX 5090; 5,611 FPS en RTX 3080. Se recomienda ejecutar un solo trabajo por GPU.

## Comparativa con modelos similares

| Modelo | Precisión | ATE TUM XYZ (cm) | RPE translación (cm) | Depth AbsRel (%) | Licencia |
|---|---|---:|---:|---:|---|
| LingBot-Map BF16 (robbyant) | BF16 | 3,312 | 0,826 | 4,149 | Apache-2.0 |
| Quantized-LingBot-Map directo W4A4 | W4A4 + FP4 KV | 8,805 | 3,844 | 5,600 | Apache-2.0 |
| Quantized-LingBot-Map DSFQ | W4A4 + FP4 KV | 3,389 | 1,561 | 4,206 | Apache-2.0 |

No se dispone de comparación con otros sistemas de reconstrucción 3D en la información proporcionada.

## Limitaciones y advertencias

- El RPE de translación empeora de forma notable con DSFQ (1,561 cm frente a 0,826 cm en BF16), casi el doble, aunque el ATE global se mantiene.
- Las secuencias XYZ e Indoor son de desarrollo y evaluación, no pruebas ciegas no vistas; los resultados pueden no generalizar a otros entornos.
- Indoor Travel carece de ground truth: sus métricas solo miden concordancia con BF16, no exactitud absoluta.
- El rendimiento depende del backend: el S4 nativo exige GPUs SM8x, CUDA toolkit y CUTLASS; otras GPUs usan GEMM INT8 con posibles diferencias de velocidad.
- Solo se documentan idiomas inglés y chino, y exclusivamente para documentación; no se especifican capacidades multilingües del modelo.
- El modelo está especializado en mapeo 3D; no se documentan capacidades de texto, código, matemáticas, tool calling ni agentes.
- Riesgo de alucinación geométrica no cuantificado: no se publican métricas de fallo en escenas fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero los datasets TUM RGB-D e Indoor Travel conservan sus propios términos y deben obtenerse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shuinb/Quantized-LingBot-Map
- Repositorio de código e instrucciones: https://github.com/shuinb/Quantized-LingBot-Map
- Modelo base: https://huggingface.co/robbyant/lingbot-map
- Repositorio del modelo base: https://github.com/Robbyant/lingbot-map
- Técnica de cuantización de referencia (QuantVGGT): https://github.com/wlfeng0509/QuantVGGT
- Repositorio de dataset previo: https://huggingface.co/datasets/shuinb/Quantized-LingBot-Map

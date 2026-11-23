# AXERA-TECH/c-fast-foundationstereo

## Resumen

C-Fast-FoundationStereo es la versión optimizada para el acelerador NPU AX650 de Axera del modelo de *stereo matching* zero-shot de NVIDIA, `nvidia/c-fast-foundationstereo`. El modelo original, desarrollado por NVIDIA Research, resuelve el problema de estimar un mapa de disparidad por píxel a partir de un par estéreo binocular rectificado, lo que permite reconstruir profundidad métrica mediante la relación `Z = f_px * baseline / disparity`. Se trata de un modelo compacto de 14,6 millones de parámetros que combina un backbone estudiante EdgeNeXt con módulos de matching CNN/transformer y un pequeño módulo de refinamiento convGRU.

Este repositorio no contiene los pesos originales de PyTorch, sino artefactos listos para desplegar en hardware AX650: un modelo ONNX de referencia en FP32 y tres compilaciones AXModel cuantizadas a U16 en modo NPU3, generadas con la herramienta Pulsar2 8.0. Las resoluciones soportadas son 480×640, 800×800 y 960×960, todas múltiplos de 32 para evitar padding en tiempo de ejecución, con `max_disp=256` y entre 12 y 16 iteraciones de refinamiento GRU.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue en el borde (*edge*) para un modelo de visión estéreo de NVIDIA que de otro modo requeriría GPU; por otro, ejemplifica el flujo de conversión ONNX → AXModel con cuantización U16 y fusión de preprocesado (normalización ImageNet y conversión NHWC→NCHW) dentro del propio grafo. El repositorio tiene un tamaño de 0,6 GB y licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EdgeNeXt (backbone estudiante) + matching CNN/transformer + refinamiento convGRU |
| Parámetros totales | 14,6 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión estéreo; entrada de imagen fija) |
| Tipos de cuantización | FP32 (ONNX de referencia) y U16 (AXModel para AX650) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17 / IR 8, 6432 nodos) y AXModel (NPU3) |
| Resoluciones de entrada | 480×640, 800×800, 960×960 (múltiplos de 32) |
| Disparidad máxima (`max_disp`) | 256 píxeles (múltiplo de 16; bins softmax = `max_disp/4` = 64) |
| Iteraciones de refinamiento | 16 (480×640) y 12 (800×800, 960×960) |
| Tamaño de los artefactos | ONNX FP32 99 MiB; AXModel U16 de 98, 157 y 208 MiB |
| Modelo base | nvidia/c-fast-foundationstereo |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de FoundationStereo en su variante "C-Fast": un backbone estudiante EdgeNeXt extrae características de ambas imágenes del par estéreo, que se combinan mediante módulos de matching con componentes convolucionales y de atención tipo transformer. Sobre la representación de coste resultante se aplica un módulo de refinamiento recurrente basado en convGRU que itera la predicción de disparidad; en los artefactos de este repositorio se emplean 16 iteraciones para 480×640 y 12 para las resoluciones mayores. La salida es un mapa de disparidad denso por píxel en la escala de la imagen de entrada.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un modelo de visión). La innovación técnica destacable de este repositorio no está en el entrenamiento, sino en el pipeline de despliegue: conversión con Pulsar2 8.0 a AXModel en modo NPU3, cuantización U16, y fusión dentro del grafo de la normalización ImageNet y de la conversión de layout NHWC→NCHW, de modo que el modelo en placa acepta directamente uint8 RGB en NHWC. El modelo ONNX de referencia espera float32 en NCHW con normalización ImageNet (`mean = [0.485, 0.456, 0.406]`, `std = [0.229, 0.224, 0.225]`).

## Capacidades

- Estimación de disparidad densa por píxel a partir de un par estéreo binocular rectificado.
- Conversión de disparidad a profundidad métrica mediante `Z = f_px * baseline / disparity`.
- *Stereo matching* zero-shot: el modelo base de NVIDIA está diseñado para generalizar a dominios no vistos sin reentrenamiento.
- Refinamiento iterativo de la disparidad mediante convGRU (12 o 16 iteraciones según resolución).
- Procesamiento de imágenes a tres resoluciones fijas: 480×640, 800×800 y 960×960.
- Inferencia en NPU AX650 con entrada uint8 RGB directa (preprocesado fusionado).
- Ejecución por lotes sobre datasets de pares estéreo con el script `infer/e2e_infer_axmodel.py`.
- Comparación automática contra la referencia FP32 con métricas de error absoluto (max, mean, p99) en píxeles de entrada.
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de lenguaje: es exclusivamente un modelo de visión.

## Casos de uso

- Robótica móvil y navegación autónoma: el modelo genera mapas de disparidad en tiempo real sobre la NPU AX650 de un robot, y la conversión a profundidad métrica con la focal y la baseline calibradas permite construir mapas de obstáculos a bordo sin GPU dedicada.
- Visión estéreo en cámaras inteligentes: al ejecutarse en un SoC con NPU AX650, se integra en cámaras IP o módulos de percepción con presupuesto térmico y energético reducido, procesando pares rectificados de 480×640 a 16 iteraciones.
- Inspección industrial 3D: para medición de volumen o detección de defectos en piezas, el modelo proporciona disparidad densa que, con calibración estéreo, se transforma en nubes de puntos; la resolución 960×960 con 12 iteraciones ofrece mayor detalle espacial.
- Automoción y ADAS de bajo coste: como etapa de profundidad en sistemas de asistencia que ya disponen de un par de cámaras rectificadas, aprovechando la cuantización U16 para reducir el ancho de banda de memoria en el SoC.
- Drones y UAV: la variante 800×800 equilibra campo de visión y coste computacional para evitación de obstáculos en plataformas con NPU de bajo consumo.
- Investigación en *stereo matching*: el ONNX FP32 de referencia permite validar resultados y comparar la precisión de las compilaciones U16 frente al modelo sin cuantizar, usando el modo `--ref-npz` del script de inferencia.
- Procesamiento por lotes de datasets estéreo: el script acepta directorios de imágenes izquierda y derecha emparejadas por ruta relativa, con modo de rendimiento rápido (solo `npu_timing.json`) o `--full-output` para restaurar la disparidad al tamaño original y generar visualizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de *stereo matching* como EPE o D1-all sobre datasets estándar (KITTI, Middlebury, ETH3D). El script de inferencia sí permite medir tiempos por etapa (lectura, preprocesado, NPU, diagnóstico) y error absoluto de disparidad frente a la referencia FP32, pero no se proporcionan valores numéricos de latencia ni de precisión en la documentación disponible.

## Requisitos de hardware

- NPU objetivo: Axera AX650 en modo NPU3, requisito para ejecutar los archivos `.axmodel`.
- Runtime en placa: `axengine` (runtime de AX650), más `opencv-python`, `numpy` y `tqdm` para el script de inferencia.
- Memoria: los artefactos ocupan entre 98 MiB (480×640) y 208 MiB (960×960), lo que condiciona el espacio de almacenamiento y la memoria del SoC, no la VRAM de una GPU.
- GPU: no se requiere GPU para la inferencia en placa; el ONNX FP32 de referencia puede ejecutarse en host con cualquier runtime ONNX compatible (opset 17), típicamente en CPU o GPU para validación.
- No cabe ni está pensado para consumer GPU en su formato AXModel; la ruta de despliegue es exclusivamente la NPU AX650.
- Opciones de despliegue: `axengine` en placa para AXModel; runtime ONNX estándar en host para el modelo FP32 de referencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada; el script mide tiempos NPU, CPU y extremo a extremo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AXERA-TECH/c-fast-foundationstereo (esta ficha) | 14,6 M | Imagen 480×640, 800×800, 960×960 | FP32 ONNX, U16 AXModel | MIT | Hugging Face, artefactos AX650 |
| nvidia/c-fast-foundationstereo | 14,6 M | Imagen (resolución configurable) | Pesos originales (formato no especificado aquí) | no disponible en la información | Hugging Face (modelo base) |
| FoundationStereo (modelo completo de NVIDIA) | no disponible | Imagen estéreo | no disponible | no disponible | no disponible |

La comparación se limita al modelo base del que deriva este repositorio; no se dispone de datos de otros modelos de *stereo matching* comparables (por ejemplo, RAFT-Stereo o CREStereo) en la información proporcionada, por lo que no se incluyen cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Requiere un par estéreo **rectificado**; el script de inferencia no realiza rectificación. Un par no rectificado produce disparidades incorrectas.
- Solo funciona en NPU AX650: los `.axmodel` no son portables a otras GPU, NPU o CPU.
- Resoluciones de entrada fijas (480×640, 800×800, 960×960); el script redimensiona a ese tamaño, lo que altera la escala de la disparidad respecto a la imagen original.
- Solo el modelo de 480×640 dispone de ONNX FP32 de referencia en el repositorio; las variantes 800×800 y 960×960 son exclusivamente AXModel, lo que dificulta la validación fina contra el modelo sin cuantizar.
- `max_disp` está fijado en 256 píxeles; escenas con disparidades mayores (objetos muy cercanos con baseline amplia) quedarán fuera del rango representable.
- La cuantización U16 introduce error respecto a FP32; la magnitud no se documenta en la información disponible y debe medirse con `--ref-npz`.
- El modelo no procesa texto ni lenguaje: no tiene capacidades de razonamiento, código, tool calling ni agentes; la etiqueta de idioma `en` del repositorio no implica procesamiento lingüístico.
- No se documentan sesgos específicos, pero al ser un modelo de visión entrenado con datos no especificados, puede degradarse en dominios visuales alejados de su distribución de entrenamiento (condiciones de iluminación extremas, superficies sin textura, materiales reflectantes).
- Licencia MIT: permite uso comercial con atribución; debe conservarse el aviso de copyright. Verificar además las condiciones del modelo base de NVIDIA del que deriva.
- El contrato de entrada autoritativo es el que reporta `session.get_inputs()` en placa; la documentación advierte que builds distintos podrían exponer float32 NCHW en lugar de uint8 NHWC.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/c-fast-foundationstereo
- Modelo base: https://huggingface.co/nvidia/c-fast-foundationstereo
- Script de inferencia en placa: `infer/e2e_infer_axmodel.py` (incluido en el repositorio)
- Paper, blog o demo de FoundationStereo: no disponible en la información proporcionada
- Documentación de Pulsar2 8.0: no disponible en la información proporcionada

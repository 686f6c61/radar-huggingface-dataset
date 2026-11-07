# mlboydaisuke/6DRepNet-HeadPose-OpenVINO

## Resumen

6DRepNet-HeadPose-OpenVINO es una conversión y empaquetado del modelo 6DRepNet-HeadPose, originalmente distribuido en formato LiteRT (TensorFlow Lite) por la comunidad litert-community, a formatos optimizados para hardware Intel: ONNX, OpenVINO IR en fp32 y un blob precompilado para la NPU integrada en los procesadores Intel Core Ultra. El autor del paquete es el usuario de Hugging Face mlboydaisuke, y no se trata de un modelo entrenado desde cero, sino de una adaptación de despliegue del modelo base.

El modelo resuelve el problema de estimación de pose de cabeza (head pose estimation) sin restricciones, es decir, predecir la orientación tridimensional de la cabeza (ángulos de guiñada, cabeceo y alabeo, o rotación en representación 6D) a partir de una imagen. La relevancia de este paquete concreto reside en su optimización para la NPU de Intel: el blob precompilado ejecuta una inferencia en 3,15 ms en una NPU de Core Ultra 9 386H, con una latencia comparable o inferior a la de una GPU RTX 5080 Laptop en el mismo equipo, lo que lo hace útil para aplicaciones de visión en tiempo real en portátiles y dispositivos de borde.

La información disponible no detalla el tamaño en parámetros ni la longitud de contexto (no aplica, al ser un modelo de visión). El repositorio ocupa 0,4 GB e incluye los pesos en varios formatos. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para estimación de pose de cabeza (6DRepNet); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | fp32 (OpenVINO IR y ONNX); blob NPU precompilado; fp16 disponible solo como copia externa para CUDA (no incluida en el repo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob NPU precompilado (`.blob`) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo base 6DRepNet-HeadPose-LiteRT (número de capas, tipo de backbone, función de pérdida ni datos de entrenamiento). Se sabe que el modelo original 6DRepNet, cuya implementación oficial en PyTorch está publicada en el repositorio thohemp/6DRepNet, emplea una representación de rotación 6D para la estimación de pose de cabeza sin restricciones, una técnica que evita las discontinuidades de las representaciones angulares tradicionales (Euler o cuaterniones) y facilita el entrenamiento de redes convolucionales para regresión de orientación.

El paquete OpenVINO se generó mediante conversión de TensorFlow Lite a ONNX con tf2onnx 1.17.0 (opset 17) y posterior conversión a OpenVINO IR con pesos fp32. El blob para NPU se compiló con OpenVINO 2026.4.1 y el driver de NPU de Intel 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). No se dispone de información sobre el proceso de entrenamiento, el conjunto de datos utilizado ni si hubo ajuste fino o destilación.

## Capacidades

- Estimación de pose de cabeza a partir de una imagen: predice la orientación 3D de la cabeza en representación de rotación 6D.
- Clasificación de imagen (pipeline declarado en Hugging Face como `image-classification`), orientada específicamente a la regresión de pose.
- Inferencia optimizada para hardware Intel: NPU (Intel AI Boost), GPU integrada (iGPU) y CPU.
- Ejecución mediante OpenVINO Runtime (importación directa del blob o compilación del IR) y mediante ONNX Runtime con el Execution Provider de OpenVINO.
- Compatibilidad con otros aceleradores: el mismo archivo ONNX se ha perfilado en NPU de Qualcomm (Snapdragon X2 Elite, Galaxy S26) a través de Qualcomm AI Hub.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual y de regresión.

## Casos de uso

- **Seguimiento de atención en videoconferencias**: el modelo puede estimar la orientación de la cabeza de los participantes en tiempo real (3,15 ms por inferencia en NPU de Intel), lo que permite detectar si el usuario mira a la pantalla o desvía la mirada, con latencia muy baja incluso en un portátil.
- **Sistemas de asistencia a la conducción (DMS)**: integrado en un pipeline de cámara de cabina, permite monitorizar la distracción del conductor estimando la pose de la cabeza; la ejecución en NPU integrada libera la GPU para otras tareas y reduce el consumo energético.
- **Interacción persona-ordenador sin manos**: control de cursor o selección de elementos mediante la orientación de la cabeza en aplicaciones de accesibilidad, aprovechando la baja latencia (3,15 ms) para una respuesta fluida.
- **Análisis de audiencia en entornos comerciales**: procesamiento de vídeo de cámaras fijas para estimar hacia dónde mira el público (por ejemplo, en un escaparate o una pantalla publicitaria), con despliegue en dispositivos de borde basados en Intel Core Ultra.
- **Robótica social y avatares**: estimación de la pose de cabeza de un interlocutor para que un robot o avatar mantenga el contacto visual y adapte su comportamiento; la inferencia en NPU permite ejecutarla junto a otros modelos de percepción en el mismo equipo.
- **Investigación en visión por computador**: uso como componente de referencia para experimentos de estimación de pose de cabeza, con la ventaja de disponer de pesos en ONNX e IR de OpenVINO para reproducir resultados en CPU, GPU o NPU sin depender de TensorFlow Lite.
- **Telemetría de atención en formación online**: análisis agregado (no individual) de la orientación de la cabeza de los alumnos para medir engagement, desplegable en servidores con CPU Intel sin GPU dedicada (16,89 ms por inferencia en CPU).

## Benchmarks y rendimiento

Los datos disponibles son mediciones de latencia y verificación de salida, no benchmarks de precisión (como MMLU, HumanEval o GSM8K, que no aplican a este modelo). Se presentan a continuación:

| Procesador | Runtime | Archivo | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 3,15 | 0,05 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 3,27 | 2,23 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 3,22 | 1,24 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 2,94 | 1,06 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 4,30 | 1,26 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 16,89 | 0,28 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 1,27 | 0,37 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 1,26 | 1,57 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 1,30 | 0,20 | no comparado |

Las mediciones se realizaron en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, alimentación por corriente) el 2026-11-07. Cada fila corresponde a un proceso: carga, una ejecución, 5 de calentamiento y mediana de 30 ejecuciones cronometradas (2 de calentamiento y 10 cronometradas cuando la primera ejecución supera los 3 s). La verificación de salida compara con la salida de CPU en fp32 mediante ONNX Runtime (PASS = coseno ≥ 0,99, sin NaN ni Inf, y concordancia top-1 ≥ 0,99). No se han publicado resultados de precisión (error angular) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo ocupa aproximadamente 157 MB en fp32 (ONNX y OpenVINO IR); el blob NPU ocupa unos 79,6 MB. No requiere VRAM dedicada si se ejecuta en NPU o CPU.
- **GPU recomendadas**: RTX 5080 Laptop (medido: 2,94 ms con fp16, 4,30 ms con fp32 vía CUDA EP); cualquier GPU NVIDIA compatible con CUDA sirve, aunque no se han publicado mediciones para otros modelos.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo con al menos 1 GB de memoria libre; también funciona en iGPU Intel y en CPU.
- **Opciones de despliegue**: OpenVINO Runtime 2026.4.1 (NPU, GPU o CPU), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1 o CUDA EP, y Qualcomm AI Hub para NPU de Snapdragon. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: 3,15 ms por inferencia en NPU Intel (sin compilación al cargar, gracias al blob precompilado); 3,22 ms en iGPU; 2,94 ms en RTX 5080 Laptop con fp16; 16,89 ms en CPU Core Ultra 9 386H. El throughput no se ha publicado explícitamente, pero la latencia sub-5 ms en NPU permite más de 300 inferencias por segundo en teoría.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de estimación de pose de cabeza comparables en la documentación proporcionada. El propio modelo base (litert-community/6DRepNet-HeadPose-LiteRT) es la referencia directa, y existe una variante del mismo autor para ExecuTorch (mlboydaisuke/6DRepNet-HeadPose-ExecuTorch). La comparación cuantitativa con alternativas como WHENet o FSA-Net no está disponible en la información consultada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 6DRepNet-HeadPose-OpenVINO | no disponible | no aplica | MIT | ONNX, OpenVINO IR, blob NPU | Optimizado para Intel NPU/GPU/CPU |
| 6DRepNet-HeadPose-LiteRT (base) | no disponible | no aplica | MIT | TFLite | Modelo original del que deriva |
| 6DRepNet-HeadPose-ExecuTorch | no disponible | no aplica | no disponible | ExecuTorch | Variante del mismo autor para otro runtime |

## Limitaciones y advertencias

- **Sesgos**: no se ha documentado ningún análisis de sesgos del modelo base; al ser un modelo de visión entrenado con datos no especificados, puede presentar sesgos demográficos o de iluminación no cuantificados.
- **Alucinación**: no aplica en el sentido generativo, pero la estimación de pose puede ser imprecisa en condiciones de oclusión, ángulos extremos, baja resolución o iluminación adversa; no se han publicado métricas de error angular.
- **Limitaciones de contexto e idioma**: no procesa texto ni contexto; su ámbito es exclusivamente visual. No se especifican los idiomas porque no aplica.
- **Restricciones de licencia**: licencia MIT, que permite uso comercial y modificación con atribución; se hereda del modelo base litert-community/6DRepNet-HeadPose-LiteRT.
- **Caveats de producción**: el blob NPU está compilado para OpenVINO 2026.4.1 y el driver 32.0.100.4841; en otras versiones puede ser rechazado por `import_model`, en cuyo caso debe compilarse el IR en la máquina destino. La verificación de salida solo garantiza equivalencia numérica con la CPU, no precisión de la pose. No se han publicado resultados de precisión en benchmarks de pose de cabeza.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlboydaisuke/6DRepNet-HeadPose-OpenVINO)
- [Modelo base en Hugging Face](https://huggingface.co/litert-community/6DRepNet-HeadPose-LiteRT/tree/6a7d8fe0ca042d1524e3912d3371a61d0af45528)
- [Repositorio de scripts y mediciones (windows-zoo)](https://github.com/john-rocky/windows-zoo)
- [Implementación oficial de 6DRepNet en PyTorch](https://github.com/thohemp/6DRepNet)
- [Variante ExecuTorch del mismo autor](https://huggingface.co/mlboydaisuke/6DRepNet-HeadPose-ExecuTorch)

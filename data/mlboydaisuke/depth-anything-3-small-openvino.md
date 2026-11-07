# mlboydaisuke/Depth-Anything-3-Small-OpenVINO

## Resumen

Depth-Anything-3-Small-OpenVINO es una conversión del modelo de estimación de profundidad monocular Depth Anything 3 Small (DA3-SMALL) a formatos optimizados para hardware Intel: ONNX, OpenVINO IR con pesos fp32 y un blob precompilado para la NPU integrada (Intel AI Boost). El artefacto lo publica el usuario mlboydaisuke a partir de su propia conversión LiteRT, que a su vez deriva del modelo original depth-anything/DA3-SMALL. No se trata de un modelo nuevo ni de un reentrenamiento, sino de un empaquetado de inferencia: los pesos son los mismos, solo cambia el formato y el grafo exportado.

El modelo resuelve un problema muy concreto: ejecutar estimación de profundidad relativa a partir de una sola imagen en equipos con CPU, GPU integrada o NPU Intel, sin necesidad de GPU dedicada. Con 0,08B parámetros (arquitectura DINOv2 ViT-S/14 con cabeza DualDPT), el modelo es lo bastante pequeño para caber en un portátil con Intel Core Ultra y ofrecer latencias de decenas de milisegundos en la NPU. La relevancia actual está en la adopción de NPUs en portátiles y mini-PC, donde el despliegue de modelos de visión en local es cada vez más viable.

La ficha se centra en el artefacto OpenVINO publicado, cuyas métricas de rendimiento y comprobaciones de salida están documentadas en la model card. La información sobre el modelo original (datos de entrenamiento, benchmarks, idiomas) no está incluida en la documentación proporcionada y se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 con cabeza DualDPT (según model card del repositorio CoreML del mismo autor) |
| Parametros totales | 0,08B (80 millones, aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 (OpenVINO IR); fp16 en el ONNX de origen; el blob NPU se compila a partir del grafo fp32 |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin) y blob precompilado para NPU Intel |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything 3 Small, un estimador de profundidad monocular relativa construido sobre un backbone DINOv2 ViT-S/14 (ViT pequeño con parches de 14x14) y una cabeza de decodificación DualDPT. La entrada es una imagen y la salida es un mapa de profundidad relativa. No hay información en la documentación proporcionada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino por preferencias; estos datos corresponden al modelo original depth-anything/DA3-SMALL, cuya model card no se ha incluido en la información disponible.

La innovación técnica de este artefacto concreto está en la conversión. El autor exportó el modelo LiteRT (da3_small_gpu_fp16) a ONNX con tf2onnx 1.17.0 y opset 17, aplicando un parche de una línea al handler de tf2onnx porque la versión estándar descartaba el sesgo de 12 capas FULLY_CONNECTED. El ONNX resultante se validó contra el .tflite original con coseno ≥ 0,9999 en todas las salidas. A partir del ONNX se generó el IR de OpenVINO con pesos fp32 y se compiló un blob para la NPU Intel con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841. El blob solo es válido para esa combinación de versiones; con otro driver o versión de OpenVINO hay que recompilar el IR.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una sola imagen RGB.
- Salida de mapa de profundidad denso (no disperso), adecuado para reconstrucción aproximada de escena.
- Ejecución en CPU, GPU integrada Intel y NPU Intel AI Boost mediante OpenVINO.
- Exportación a ONNX ejecutable con ONNX Runtime y el execution provider de OpenVINO.
- Inferencia de baja latencia: 97,05 ms por ejecución en NPU de Core Ultra 9 386H.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode).
- No se documentan capacidades de vídeo, audio ni visión general más allá de la profundidad.

## Casos de uso

- **Reconstrucción 3D en local para robótica de bajo coste**: el modelo puede generar mapas de profundidad por fotograma en un mini-PC con Core Ultra, alimentando un pipeline de nube de puntos o SLAM ligero sin GPU dedicada. La latencia de ~97 ms en NPU permite unos 10 FPS, suficiente para navegación lenta.
- **Efecto bokeh y desenfoque selectivo en aplicaciones de fotografía**: dado un mapa de profundidad por imagen, se puede aplicar desenfoque gaussiano dependiente de la profundidad en tiempo casi real en el propio portátil, sin subir la imagen a la nube.
- **Previsualización de profundidad en herramientas de edición de vídeo**: integración en un editor que muestre una capa de profundidad aproximada para enmascarar sujetos o generar transiciones, aprovechando el blob NPU precompilado para evitar tiempos de carga.
- **Generación de mapas de disparidad para gafas de realidad aumentada o mixta**: el modelo aporta una estimación monocula que puede combinarse con sensores IMU en visores con chip Intel, reduciendo el coste de un sensor de profundidad dedicado.
- **Automatización de inventario o medición en líneas de producción**: en cámaras industriales conectadas a PC con Intel, el modelo estima la profundidad de objetos en la cinta para detectar apilamientos o estimar volúmenes aproximados, con la ventaja de ejecutarse en CPU/NPU sin tarjeta gráfica.
- **Prototipado rápido en cuadernos y demos**: al estar disponible en ONNX y OpenVINO IR, un desarrollador puede validar una idea de profundidad en su portátil con `pip install openvino` y el blob incluido, sin configurar CUDA ni descargar modelos de mayor tamaño.
- **Procesamiento por lotes en servidores sin GPU**: el IR fp32 puede ejecutarse en CPU con OpenVINO, ofreciendo un throughput moderado para tareas de anotación automática de datasets de imágenes.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad (RMSE, δ1, etc.) sobre datasets estándar de profundidad. Sí incluye una tabla de latencia y comprobación de salida medida en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711):

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 97,05 | 0,08 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 96,67 | 186,59 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 158,36 | 4,76 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 25,93 | 1,48 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 43,41 | 1,35 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 1345,45 | 0,46 | referencia |

La comprobación de salida compara cada resultado contra la salida fp32 en CPU con ONNX Runtime (CPU EP), exigiendo coseno ≥ 0,99 y ausencia de NaN/Inf. El ONNX también se validó contra el `.tflite` original con coseno ≥ 0,9999. No se han publicado resultados de benchmarks de calidad (métricas de error de profundidad) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene ~104 MB en ONNX y ~103 MB en IR fp32; en NPU el blob ocupa ~112 MB. Cabe holgadamente en cualquier iGPU o NPU moderna; en GPU dedicada el consumo de VRAM es inferior a 1 GB.
- **GPU recomendadas**: RTX 5080 Laptop (medido a 25,93 ms con fp16), cualquier GPU NVIDIA con soporte CUDA EP de ONNX Runtime; en el ecosistema Intel, iGPU Xe integrada (158,36 ms) y NPU AI Boost (97,05 ms).
- **¿Cabe en GPU consumer?**: sí, en cualquier GPU consumer con al menos 1 GB de VRAM; también en CPU y NPU sin GPU dedicada.
- **Opciones de despliegue**: OpenVINO (recomendado para NPU/CPU/iGPU), ONNX Runtime con OpenVINO EP o CUDA EP, y presumiblemente LiteRT a través del modelo base. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- **Latencia y throughput**: 97,05 ms por inferencia en NPU (≈10,3 FPS), 158,36 ms en iGPU (≈6,3 FPS), 25,93 ms en RTX 5080 Laptop fp16 (≈38,6 FPS), 1345,45 ms en CPU (≈0,74 FPS). La carga del blob NPU es de 0,08 s; la compilación del ONNX para NPU en la primera sesión tarda 186,59 s.
- **Requisito de versión**: el blob NPU solo es válido con OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; con otras versiones hay que recompilar el IR.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-3-Small-OpenVINO | 0,08B | no aplica (visión) | ONNX, OpenVINO IR, blob NPU | Apache-2.0 | Hugging Face (este repo) |
| Depth-Anything-3-Small-LiteRT | 0,08B | no aplica (visión) | LiteRT (.tflite) | Apache-2.0 | Hugging Face (repo base) |
| Depth-Anything-3-Small-CoreML | 0,08B | no aplica (visión) | Core ML | no disponible en la información | Hugging Face (mismo autor) |
| depth-anything/DA3-SMALL (upstream) | 0,08B | no aplica (visión) | no disponible en la información | no disponible en la información | Hugging Face |

Las tres variantes comparten pesos y arquitectura; la diferencia está en el runtime objetivo (OpenVINO/Intel, LiteRT/Android y Core ML/Apple). No se dispone de datos de benchmarks de calidad para comparar el rendimiento predictivo frente a otros estimadores de profundidad como MiDaS o Depth Anything v2, por lo que la comparativa se limita a formato y disponibilidad.

## Limitaciones y advertencias

- **Profundidad relativa, no métrica**: el modelo produce un mapa de profundidad relativa; no se debe interpretar como distancias absolutas en metros sin calibración adicional.
- **Riesgo de alucinación visual**: como todo estimador monocular, puede generar profundidades plausibles pero incorrectas en regiones ocluidas, superficies reflectantes, texturas repetitivas o escenas con iluminación extrema.
- **Sin datos de sesgo**: no se documentan sesgos conocidos del modelo original en la información proporcionada; se desconoce su comportamiento en dominios alejados del dataset de entrenamiento.
- **Licencia Apache-2.0**: permite uso comercial, pero conviene verificar la licencia del modelo upstream depth-anything/DA3-SMALL, que no se detalla en la información disponible.
- **Blob NPU frágil**: el blob precompilado depende de OpenVINO 2026.4.1 y del driver NPU 32.0.100.4841; en otros entornos hay que recompilar el IR, lo que añade tiempo de compilación (hasta 186 s en el caso medido con ONNX Runtime).
- **Sin soporte de texto ni agentes**: no es un modelo de lenguaje; no admite tool calling, razonamiento multi-paso ni generación de texto.
- **Validación limitada**: la comprobación de salida se hizo contra la salida CPU fp32 del mismo modelo, no contra verdad de campo; no hay benchmarks de calidad publicados en la información disponible.
- **Repo con 0 descargas y 0 likes**: el artefacto es reciente y no cuenta con validación comunitaria; conviene revisar los hashes SHA256 incluidos antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/Depth-Anything-3-Small-OpenVINO
- Modelo base LiteRT: https://huggingface.co/mlboydaisuke/Depth-Anything-3-Small-LiteRT
- Modelo upstream: https://huggingface.co/depth-anything/DA3-SMALL
- Variante Core ML del mismo autor: https://huggingface.co/mlboydaisuke/Depth-Anything-3-Small-CoreML
- Repositorio GitHub con scripts y tabla de los 52 grafos de LiteRT-Models: https://github.com/john-rocky/windows-zoo
- Tutorial de Depth Anything con OpenVINO: https://docs.openvino.ai/2024/notebooks/depth-anything-with-output.html

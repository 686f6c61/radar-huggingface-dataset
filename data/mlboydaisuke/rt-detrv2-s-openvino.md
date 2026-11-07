# mlboydaisuke/RT-DETRv2-S-OpenVINO

## Resumen

RT-DETRv2-S-OpenVINO es una conversión del detector de objetos RT-DETRv2-S (variante Small) a formatos optimizados para la aceleración en hardware Intel: ONNX (opset 17), OpenVINO IR con pesos fp32 y blobs precompilados para la NPU Intel AI Boost. El modelo parte de la versión LiteRT publicada por litert-community y ha sido convertido y validado por el usuario mlboydaisuke, que documenta métricas de latencia y comprobaciones de fidelidad numérica frente al `.tflite` original.

RT-DETRv2 es un detector de objetos basado en transformer (Real-Time DEtection TRansformer), desarrollado originalmente por el equipo de lyuwenyu en el repositorio RT-DETR (CVPR 2024), que plantea una alternativa a las arquitecturas YOLO para detección en tiempo real sin necesidad de anclas ni de supresión no máxima (NMS). Esta ficha se centra en el artefacto de despliegue, no en el modelo de entrenamiento: el repositorio no incluye pesos de entrenamiento en formato PyTorch, sino los grafos exportados y compilados.

La relevancia de este repositorio es práctica: permite ejecutar un detector en tiempo real en la NPU integrada de los procesadores Intel Core Ultra, con latencias de 12,07 ms y 86,90 ms por inferencia para los dos grafos que componen el modelo, sin necesidad de GPU dedicada. El tamaño total del repositorio es de 0,3 GB y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETRv2-S (detector de objetos basado en transformer, sin NMS), exportado a ONNX y OpenVINO IR |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | fp16 (grafos de origen y blobs NPU); IR con pesos fp32 |
| Idiomas soportados | no disponible (modelo de detección de objetos, sin componente lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob precompilado para NPU Intel |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector de objetos de tipo DETR (Detection Transformer) diseñado para inferencia en tiempo real. A diferencia de las familias YOLO, elimina componentes heurísticos como las anchor boxes y la supresión no máxima, lo que simplifica el postprocesado y facilita el despliegue en pipelines heterogéneos. La variante S (Small) es la de menor coste computacional de la familia. El repositorio de origen (lyuwenyu/RT-DETR) documenta mejoras sobre la versión original de RT-DETR publicadas en CVPR 2024, incluyendo la incorporación de técnicas derivadas de modelos fundacionales de visión para mejorar la precisión sin incrementar la latencia de inferencia.

El artefacto de este repositorio no contiene información sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si se aplicaron técnicas de alineación como RLHF (no aplicable en un detector). Lo que sí está documentado es el proceso de conversión: los grafos `rtdetr_graphA_fp16` y `rtdetr_graphB_fp16` provienen del modelo LiteRT de litert-community, se convirtieron a ONNX con tf2onnx 1.17.0 (opset 17) aplicando un parche de una línea para corregir un fallo del handler que eliminaba el bias de 13 capas `FULLY_CONNECTED`, y se compilaron a blobs NPU con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841. La división en dos grafos (A y B) es una característica del modelo LiteRT de origen, no una decisión del conversor.

## Capacidades

- Detección de objetos en imágenes: el modelo devuelve cajas delimitadoras y puntuaciones de clase para las categorías del dataset de entrenamiento original (no especificadas en la información disponible).
- Inferencia en tiempo real: latencias de 12,07 ms (grafo A) y 86,90 ms (grafo B) por ejecución en la NPU de un Core Ultra 9 386H.
- Ejecución en múltiples backends: ONNX Runtime con execution providers de CPU, CUDA y OpenVINO; OpenVINO nativo con dispositivos CPU, GPU integrada y NPU.
- Despliegue sin compilación en NPU: los blobs precompilados permiten cargar el modelo con `import_model` en 0,03 s (grafo A) y 0,05 s (grafo B).
- Compatibilidad con hardware consumer: funciona en CPU, iGPU Intel y NPU integrada, además de GPU dedicada NVIDIA vía CUDA EP.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de detección.

## Casos de uso

- Visión por computador en portátiles sin GPU dedicada: el modelo se ejecuta en la NPU Intel AI Boost de un Core Ultra con latencias de 12 ms por inferencia en el grafo A, lo que permite procesar vídeo en tiempo real en equipos de oficina o ultrabooks.
- Detección de objetos en el borde (edge computing): los blobs precompilados eliminan la necesidad de compilar el grafo en el dispositivo, con tiempos de carga de 0,03-0,05 s, adecuado para sistemas embebidos con Intel NPU.
- Preprocesado en pipelines de analítica de vídeo: al ser un detector sin NMS, el postprocesado es determinista y sencillo de integrar en aplicaciones de conteo de personas, control de aforo o monitorización de espacios.
- Prototipado rápido en Windows: el repositorio incluye instrucciones de descarga y ejecución con `huggingface_hub` y OpenVINO, lo que permite validar un detector en un portátil Windows con NPU en minutos.
- Comparación de backends de inferencia: el autor documenta latencias para CPU, iGPU, NPU y GPU NVIDIA con el mismo modelo, útil para seleccionar el hardware adecuado en un despliegue.
- Automatización industrial ligera: detección de defectos o presencia de objetos en líneas de producción donde se dispone de PCs industriales con CPU Intel y se quiere evitar el coste de una GPU dedicada.
- Investigación en eficiencia de despliegue: el repositorio sirve como referencia reproducible para estudiar la conversión de modelos LiteRT a OpenVINO y la fidelidad numérica de las conversiones (coseno ≥ 0,9999 frente al `.tflite` original).

## Benchmarks y rendimiento

Los datos disponibles son mediciones de latencia y fidelidad numérica, no benchmarks de precisión (mAP, COCO, etc.). Se presentan a continuación las latencias documentadas por el autor en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con entrada y salida NumPy, mediana de 30 ejecuciones tras 5 de calentamiento.

| Grafo | Procesador | Runtime | ms | Carga (s) | Verificación |
|---|---|---|---|---|---|
| A | Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | 12,07 | 0,03 | PASS (cos ≥ 0,9999) |
| A | Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | 9,43 | 10,84 | PASS (cos ≥ 0,9999) |
| A | Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | 9,81 | 1,27 | PASS (cos ≥ 0,9999) |
| A | RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | 6,54 (fp16) / 7,23 (fp32) | 1,19 / 1,21 | PASS (cos ≥ 0,9999) |
| A | Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | 58,65 | 0,33 | referencia |
| B | Intel AI Boost NPU | OpenVINO 2026.4.1 (blob) | 86,90 | 0,05 | PASS (cos ≥ 0,9999) |
| B | Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | 87,78 | 65,42 | PASS (cos ≥ 0,9999) |
| B | Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | 35,46 | 1,25 | FAIL: coincidencia de argmax 265/300 |
| B | RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | 8,23 (fp16) / 9,68 (fp32) | 1,19 / 0,86 | PASS (cos ≥ 0,9999) |
| B | Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | 76,36 | 0,15 | referencia |

No se han publicado resultados de benchmarks de precisión (mAP en COCO u otros datasets) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,3 GB en total, con el blob del grafo A de 40,2 MB y el del grafo B de 76,7 MB.
- GPU recomendadas: RTX 5080 Laptop (medida por el autor); cualquier GPU NVIDIA compatible con CUDA EP de ONNX Runtime debería funcionar, aunque no se documentan latencias en otras GPU.
- Hardware Intel: NPU Intel AI Boost (Core Ultra 9 386H medido), iGPU Intel Graphics y CPU Core Ultra 9 386H. Los blobs NPU requieren OpenVINO 2026.4.1 y driver NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841); con otras versiones puede ser necesario recompilar el IR.
- Cabe en GPU consumer: sí; el modelo completo en fp16 ocupa menos de 100 MB, por lo que cabe en cualquier GPU consumer con al menos 1 GB de VRAM.
- Opciones de despliegue: OpenVINO (nativo, con `import_model` para blobs o `compile_model` para IR), ONNX Runtime con execution providers de CPU, CUDA y OpenVINO. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector visual).
- Latencia y throughput: 6,54-12,07 ms por inferencia en el grafo A según hardware; 8,23-86,90 ms en el grafo B. El tiempo de carga del blob NPU es de 0,03-0,05 s, frente a 10,84-65,42 s si se compila el ONNX al cargar la sesión.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RT-DETRv2-S-OpenVINO (este) | Detector transformer, optimizado para Intel | no disponible | no aplica | Apache 2.0 | Hugging Face |
| RT-DETRv2-S-LiteRT (litert-community) | Detector transformer, formato LiteRT | no disponible | no aplica | no disponible en la información | Hugging Face |
| RT-DETR (repositorio oficial lyuwenyu) | Detector transformer, PyTorch | no disponible | no aplica | no disponible en la información | GitHub |

No se dispone de datos de precisión ni de latencia de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La comparativa se limita al formato de despliegue y la licencia.

## Limitaciones y advertencias

- El repositorio no incluye información sobre el dataset de entrenamiento ni sobre sesgos conocidos del modelo; no es posible evaluar su comportamiento en dominios distintos al de entrenamiento.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de falsos positivos y falsos negativos en detección, sin datos de precisión publicados que permitan acotar el riesgo.
- El grafo B falla la verificación de fidelidad en la iGPU Intel (coincidencia de argmax 265/300), por lo que no se recomienda su ejecución en ese backend sin validación adicional.
- Los blobs NPU están compilados para OpenVINO 2026.4.1 y driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlos y es necesario compilar el IR en la máquina destino.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta la licencia del modelo LiteRT de origen ni del RT-DETRv2 original, por lo que conviene verificar la cadena de licencias antes de un despliegue en producción.
- El modelo no soporta texto, tool calling ni agentes; cualquier caso de uso que requiera razonamiento lingüístico queda fuera de su alcance.
- No se documentan latencias en hardware distinto al medido (Core Ultra 9 386H y RTX 5080 Laptop), por lo que las cifras no son extrapolables a otros equipos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/RT-DETRv2-S-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/RT-DETRv2-S-LiteRT
- Repositorio de scripts y mediciones del autor: https://github.com/john-rocky/windows-zoo
- Repositorio oficial de RT-DETR: https://github.com/lyuwenyu/RT-DETR
- Rama PyTorch de RT-DETRv2: https://github.com/lyuwenyu/RT-DETR/tree/main/rtdetrv2_pytorch
- README del repositorio oficial: https://raw.githubusercontent.com/lyuwenyu/RT-DETR/main/README.md

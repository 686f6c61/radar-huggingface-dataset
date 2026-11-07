# mlboydaisuke/PIDNet-S-Cityscapes-OpenVINO

## Resumen

PIDNet-S-Cityscapes-OpenVINO es una conversión y empaquetado del modelo de segmentación semántica PIDNet-S (variante pequeña) entrenado sobre el dataset Cityscapes, orientado a su despliegue en hardware Intel mediante OpenVINO. El autor, mlboydaisuke, parte del modelo ya convertido a LiteRT por litert-community y genera tres artefactos: un ONNX (opset 17, exportado con tf2onnx 1.17.0), un OpenVINO IR con pesos en fp32 y un blob precompilado para la NPU Intel (Intel AI Boost). El objetivo es ofrecer una ruta de inferencia de baja latencia para segmentación de imágenes en CPU, iGPU y NPU de Intel sin necesidad de recompilar el grafo en cada despliegue.

El modelo resuelve el problema de la segmentación semántica densa de escenas urbanas (19 clases de Cityscapes), una tarea clásica en conducción autónoma, robótica móvil y análisis de vídeo en el borde. Su relevancia actual radica en que demuestra latencias de milisegundos de un dígito en NPUs integradas: 7,36 ms por inferencia en la NPU de un Core Ultra 9 386H, con una verificación de salida que alcanza coseno ≥ 0,9999 frente a la referencia en CPU.

La arquitectura subyacente es PIDNet, una red de segmentación en tiempo real que combina tres ramas (detalle, contexto y límites) con un módulo de atención de borde. El repositorio ocupa 0,1 GB, la licencia es MIT y la librería declarada es OpenVINO. No se especifican idiomas porque la tarea no es lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PIDNet-S (red de segmentacion semantica en tiempo real con tres ramas: detalle, contexto y limites) |
| Parametros totales | no disponible (el ONNX pesa 30.743.447 bytes en fp32, lo que sugiere del orden de 7,7 M de parametros, pero el dato no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp32 en el IR de OpenVINO; el ONNX se distribuye en fp32 (existe una copia fp16 usada en las pruebas con CUDA, no incluida en el repo); blob NPU precompilado |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob precompilado para NPU Intel |

## Arquitectura y entrenamiento

PIDNet es una familia de redes de segmentación semántica en tiempo real que divide el trabajo en tres ramas paralelas: una rama de detalle que preserva información de alta frecuencia, una rama de contexto que captura información semántica de bajo nivel y una rama de límites que refina las fronteras entre clases mediante un módulo de atención de borde (boundary attention). La variante S es la más pequeña de la familia y está pensada para despliegue en dispositivos con recursos limitados. El modelo original fue entrenado sobre Cityscapes, un dataset de escenas urbanas con 19 clases evaluables y anotaciones densas a nivel de píxel.

Esta ficha no documenta el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas), porque la información proporcionada no lo incluye; se trata de una conversión de un modelo ya entrenado, no de un entrenamiento nuevo. La innovación técnica del repositorio es la cadena de conversión y empaquetado: exportación a ONNX con tf2onnx 1.17.0 y opset 17, generación del IR de OpenVINO con pesos fp32 y compilación anticipada de un blob para la NPU Intel con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841. El autor verifica la equivalencia funcional comparando cada salida contra la referencia en CPU (ONNX Runtime, CPU EP) y contra el `.tflite` original: coseno ≥ 0,9999 en todos los casos.

## Capacidades

- Segmentación semántica densa de escenas urbanas en 19 clases de Cityscapes (carretera, acera, edificio, vegetación, cielo, vehículos, personas, etc.).
- Inferencia en CPU, iGPU y NPU de Intel mediante OpenVINO, y en GPU NVIDIA mediante ONNX Runtime con CUDA EP.
- Ejecución de baja latencia: 7,36 ms por inferencia en la NPU de un Core Ultra 9 386H, y 6,13 ms en una RTX 5080 Laptop con el ONNX en fp16.
- Despliegue sin compilación en el dispositivo cuando se usa el blob precompilado (carga en 0,01 s).
- Compatibilidad con ONNX Runtime mediante el execution provider de OpenVINO, lo que permite integrarlo en pipelines existentes.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Conducción autónoma y ADAS: segmentación de carretera, carriles, peatones y señalización en tiempo real sobre la NPU integrada de un vehículo o una unidad de cómputo Intel, con latencias por debajo de 10 ms que permiten operar a más de 100 FPS.
- Robótica móvil de interior y exterior: percepción semántica del entorno en robots con CPU/NPU Intel de bajo consumo, donde el modelo cabe en 0,1 GB y no requiere GPU dedicada.
- Análisis de vídeo en el borde: procesamiento de flujos de cámaras de vigilancia urbana o industrial en servidores con iGPU Intel, usando el IR de OpenVINO y el execution provider correspondiente.
- Preprocesado para pipelines de visión: generación de máscaras semánticas que alimentan etapas posteriores (detección de objetos, seguimiento, conteo de personas) en sistemas de análisis de tráfico.
- Prototipado en portátiles con Intel Core Ultra: validación rápida de algoritmos de segmentación usando la NPU integrada, sin necesidad de hardware dedicado, gracias al blob precompilado y a los scripts de ejemplo del repositorio.
- Investigación en eficiencia de modelos: banco de pruebas para comparar latencias entre CPU, iGPU, NPU Intel, GPU NVIDIA y NPU Qualcomm (Snapdragon X2 Elite, Galaxy S26) sobre el mismo grafo ONNX, con la tabla de resultados publicada en el repositorio del autor.
- Despliegue en dispositivos Qualcomm: el mismo ONNX puede perfilarse en Qualcomm AI Hub con QNN, con latencias registradas de 5,13 a 5,53 ms en NPUs móviles.

## Benchmarks y rendimiento

Los datos disponibles son de latencia y verificación de salida, no de precisión (mIoU) sobre Cityscapes. La siguiente tabla reproduce las mediciones publicadas por el autor (entrada numpy a salida numpy, mediana de 30 ejecuciones tras 5 de calentamiento, salvo cuando la primera ejecución supera los 3 s, en cuyo caso se usan 2 de calentamiento y 10 cronometradas).

| Procesador | Runtime | Fichero | ms | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 7,36 | 0,01 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 8,73 | 7,64 | PASS (cos ≥ 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 8,14 | 1,19 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 6,13 | 1,15 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` fp32 | 8,27 | 1,15 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 48,90 | 0,09 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 5,53 | 0,36 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 5,47 | 4,43 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 5,13 | 0,17 | no comparado |

No se han publicado resultados de benchmarks de precisión (mIoU en Cityscapes) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el ONNX en fp32 ocupa 30,7 MB y el IR de OpenVINO 31,3 MB (`.xml` + `.bin`), por lo que la huella de memoria es mínima; el blob NPU ocupa 18,6 MB. Cualquier GPU con más de 1 GB de VRAM puede ejecutarlo.
- GPU recomendadas: RTX 5080 Laptop (medido a 6,13 ms en fp16 y 8,27 ms en fp32); cualquier GPU NVIDIA con soporte CUDA EP de ONNX Runtime es apta. En Intel, la iGPU integrada rinde 8,14 ms.
- Consumer GPU: sí, cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 o una iGPU Intel. También funciona en CPU sin GPU (48,90 ms en un Core Ultra 9 386H).
- NPU Intel: requiere un procesador con Intel AI Boost (Core Ultra), OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841 para usar el blob precompilado; con otra versión hay que recompilar el IR.
- Opciones de despliegue: OpenVINO (`core.compile_model` o `core.import_model` para el blob), ONNX Runtime con OpenVINO EP, ONNX Runtime con CUDA EP, ONNX Runtime con QNN EP (Qualcomm) y Qualcomm AI Hub para perfilar en dispositivos Snapdragon.
- Latencia y throughput estimados: 7,36 ms por inferencia en NPU Intel equivale a unas 136 inferencias por segundo; 6,13 ms en RTX 5080 Laptop equivale a unas 163 por segundo; 48,90 ms en CPU equivale a unas 20 por segundo. Estas cifras son estimaciones derivadas de las latencias medidas, no medidas de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Latencia medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PIDNet-S-Cityscapes-OpenVINO (este) | no disponible (ONNX fp32 de 30,7 MB) | imagen Cityscapes, 19 clases | 7,36 ms en NPU Intel; 6,13 ms en RTX 5080 Laptop fp16 | MIT | Hugging Face, formatos ONNX, IR y blob NPU |
| PIDNet-S-Cityscapes-LiteRT (modelo base) | no disponible | imagen Cityscapes, 19 clases | no disponible en esta ficha | MIT | Hugging Face, formato LiteRT/TFLite |
| PIDNet-S-Cityscapes-ExecuTorch (mismo autor) | no disponible | imagen Cityscapes, 19 clases | no disponible en esta ficha | MIT (presumible, no confirmado en la información disponible) | Hugging Face, formato ExecuTorch |

No se dispone de datos de benchmarks de precisión ni de otros modelos comparables (por ejemplo, variantes de la familia PIDNet de mayor tamaño o alternativas como BiSeNet) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre Cityscapes, por lo que su rendimiento fuera de escenas urbanas europeas (interiores, paisajes, imágenes aéreas) puede degradarse de forma notable.
- No se han publicado métricas de precisión (mIoU) en esta ficha; no debe asumirse una calidad concreta sin validar sobre el dominio de destino.
- El blob NPU está compilado para OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y habrá que recompilar el IR, lo que añade tiempo de carga.
- La verificación de salida se basa en similitud coseno y acuerdo top-1, no en una evaluación de calidad de segmentación sobre el dataset completo.
- Riesgo de sesgo: el dataset Cityscapes procede de ciudades alemanas y de un número limitado de condiciones meteorológicas y de iluminación; el modelo puede fallar en escenarios nocturnos, con lluvia o en entornos no europeos.
- Licencia MIT: permite uso comercial, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo base y del dataset original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del empaquetado.
- No incluye la copia fp16 del ONNX usada en las pruebas con CUDA; quien quiera reproducir esa latencia debe generarla por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/PIDNet-S-Cityscapes-OpenVINO
- Modelo base: https://huggingface.co/litert-community/PIDNet-S-Cityscapes-LiteRT
- Repositorio de scripts y resultados del autor: https://github.com/john-rocky/windows-zoo
- Variante ExecuTorch del mismo autor: https://huggingface.co/mlboydaisuke/PIDNet-S-Cityscapes-ExecuTorch

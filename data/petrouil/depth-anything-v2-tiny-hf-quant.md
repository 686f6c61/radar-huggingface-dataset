# Petrouil/Depth-Anything-V2-Tiny-hf-quant

## Resumen

Depth-Anything-V2-Tiny-hf-quant es una variante de despliegue en ONNX con cuantización de pesos a 4 bits del modelo comunitario `Petrouil/Depth-Anything-V2-Tiny-hf`, un estudiante podado y destilado de 8 capas derivado de `depth-anything/Depth-Anything-V2-Small-hf`. Lo publica el usuario Petrouil y no es una versión oficial de Depth Anything, sino una conversión orientada a inferencia en CPU y dispositivos con recursos limitados. El grafo tiene una forma de entrada fija de 336×448 píxeles y ocupa 18,14 MB, un 72,5 % menos que el padre en fp32 (66,04 MB).

El modelo resuelve el problema de estimación de profundidad monocular densa (una profundidad por píxel) con un coste de almacenamiento y cómputo muy reducido. La salida es profundidad inversa afín-invariante: valores mayores indican mayor cercanía, y no son metros directamente. Está pensado para escenarios de edge computing donde no cabe un modelo de profundidad de mayor tamaño.

La relevancia actual radica en su relación calidad/tamaño: pierde solo 1,40 puntos de δ1 en NYUv2 y 0,85 puntos de fidelidad respecto al padre float, manteniendo una licencia Apache-2.0 permisiva. No obstante, depende del operador contrib `MatMulNBits` de ONNX Runtime, lo que limita su portabilidad a TFLite o NPU sin trabajo adicional de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de 8 capas y 6 cabezas, FFN de anchura 1536, decoder de reassemble con canales `[48, 96, 192, 192]`; grafo ONNX con 48 nodos `MatMulNBits` y 31 `Conv` |
| Parametros totales | 16.504.129 (modelo padre float de 8 capas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de imagen 336×448) |
| Tipos de cuantizacion | 4 bits weight-only en las 48 MatMul con peso constante; convoluciones y activaciones en float32; block size 32, simétrico, `accuracy_level=4` |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17 + `com.microsoft` opset 1) |

## Arquitectura y entrenamiento

El modelo es un transformer de profundidad monocular con encoder de 8 capas y 6 cabezas de atención, anchura FFN de 1536 y un decoder de reassemble con canales `[48, 96, 192, 192]`. La lineage parte de DA-V2-S (24,785 M de parámetros, 12 capas) y aplica eliminación progresiva de capas 12 → 11 → 10 → 9 → 8, con warm-up del decoder y fine-tuning completo a learning rate bajo en cada paso. El resultado es un estudiante de 8 capas con 16.504.129 parámetros, entrenado mediante destilación de conocimiento desde el profesor fp32 original `depth-anything/Depth-Anything-V2-Small-hf`.

La innovación técnica principal es la cuantización weight-only a 4 bits de las 48 capas MatMul con peso constante mediante `MatMulNBits` de ONNX Runtime; las MatMul de atención y todas las convoluciones y activaciones permanecen en float32. La etapa de fusión se mantiene en float porque la cuantización de sus sumas residuales resultó inestable en los experimentos con int8. El grafo tiene forma estática fija de 336×448; cualquier otra resolución requiere una exportación separada. No se documentan datos de entrenamiento (número de tokens o composición del dataset) ni el uso de RLHF o DPO, ya que es un modelo de regresión densa y no de generación de texto.

## Capacidades

- Estimación de profundidad monocular densa: produce un mapa de profundidad inversa de forma `(1, 336, 448)` a partir de una imagen RGB normalizada con ImageNet.
- Inferencia en CPU y edge: el grafo de 18,14 MB está pensado para entornos con memoria y cómputo restringidos.
- Salida afín-invariante: los valores son profundidad inversa (mayor = más cerca); para visualización se normaliza por imagen y para profundidad métrica se ajusta escala y desplazamiento por imagen.
- Entrada de forma fija: imagen RGB float32 `(1, 3, 336, 448)` con resize bicúbico directo a 448×336 y normalización con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de regresión.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la estimación de profundidad.

## Casos de uso

- Navegación de robots móviles en interiores: el modelo proporciona un mapa de profundidad por píxel a 336×448 en CPU, suficiente para evitar obstáculos en plataformas con presupuesto de cómputo limitado y sin GPU dedicada.
- Realidad aumentada en dispositivos móviles: con 18,14 MB de pesos y ejecución en ONNX Runtime CPU, permite insertar objetos virtuales con oclusión aproximada usando la profundidad estimada, siempre que el runtime soporte `MatMulNBits`.
- Segmentación y recorte asistido por profundidad: la salida de profundidad inversa sirve para separar primer plano y fondo en pipelines de edición de imagen, con un coste de almacenamiento mínimo en el cliente.
- Detección de obstáculos en drones y cámaras de bajo consumo: la inferencia en CPU con entrada fija de 336×448 encaja en SoC de bajo TDP, aunque requiere validar el operador contrib en el runtime objetivo.
- Preprocesado para reconstrucción 3D ligera: la profundidad afín-invariante puede alimentar etapas posteriores de ajuste de escala y desplazamiento por imagen para generar nubes de puntos aproximadas en aplicaciones de escaneo.
- Prototipado e investigación en destilación y cuantización: sirve como referencia reproducible de una cadena completa de poda progresiva, destilación y cuantización 4 bits con métricas documentadas en NYUv2 y fidelidad al profesor.
- Aplicaciones de accesibilidad: estimación de profundidad en tiempo real en hardware de bajo coste para asistencia a personas con discapacidad visual, con la advertencia de que la salida no es métrica sin calibración.

## Benchmarks y rendimiento

Métricas medidas a 336×448 con protocolo de profundidad inversa afín-invariante, alineación por mínimos cuadrados de escala y desplazamiento por imagen, y runtime ONNX Runtime 1.31.1 con CPU execution provider.

| Modelo | Formato | Tamano | NYU δ1 | Fidelidad δ1 |
|---|---|---:|---:|---:|
| 8-layer float parent | fp32 | 66,04 MB | 0,89362 | 0,89756 |
| 8-layer 4-bit (este repo) | 4-bit W / float A | 18,14 MB | 0,87960 | 0,88909 |
| 8-layer int8 QAT 1k (medido, no publicado) | int8 QDQ | 20,48 MB | 0,83177 | 0,94454 |
| DA-V2-S original (referencia del harness) | fp32 | no disponible | 0,91106 | no disponible |

Métricas adicionales del artefacto 4 bits: AbsRel 0,11678 y RMSE 0,07968 en NYUv2 Eigen 654; fidelidad al profesor en 200 imágenes con AbsRel 0,12113, RMSE 0,36944, Pearson 0,89861 y correlación de gradiente 0,68092. El modelo int8 QAT presenta NaN en la correlación de gradiente del run de fidelidad ONNX, por lo que no se considera sustituto del artefacto 4 bits. Las métricas no son directamente comparables con artículos que usan otro preprocesado de ground truth o alineación.

## Requisitos de hardware

- VRAM estimada: no aplica para el artefacto principal, que se ejecuta en CPU; en GPU, el grafo de 18,14 MB más activaciones float32 a 336×448 requiere un consumo de memoria muy bajo, no cuantificado en la información disponible.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y edge. Cualquier GPU con soporte de ONNX Runtime y del operador `MatMulNBits` podría ejecutarlo.
- Cabe en GPU consumer: sí, por tamaño; no se documentan requisitos mínimos ni latencias medidas.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (soporta `MatMulNBits`); no es portable directamente a TFLite ni a NPU sin sustituir los 48 nodos `MatMulNBits` por una primitiva 4-bit propia del runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | NYU δ1 | Licencia | Formato |
|---|---|---:|---:|---|---|
| Depth-Anything-V2-Tiny-hf-quant (este) | 16,50 M (8 capas) | 336×448 fijo | 0,87960 | Apache-2.0 | ONNX 4-bit |
| Depth-Anything-V2-Tiny-hf (padre float) | 16,50 M (8 capas) | 336×448 fijo | 0,89362 | Apache-2.0 | safetensors/ONNX fp32 |
| Depth-Anything-V2-Small-hf (oficial) | 24,785 M (12 capas) | resolución variable | 0,91106 (harness del autor) | Apache-2.0 | safetensors |
| DA-V2-S 8-layer int8 QAT 1k (no publicado) | 16,50 M (8 capas) | 336×448 fijo | 0,83177 | Apache-2.0 | ONNX int8 |

El modelo sacrifica 1,40 puntos de δ1 frente a su padre float y 3,15 puntos frente al DA-V2-S oficial a cambio de un 72,5 % menos de tamaño y ejecución en CPU. Frente al int8 QAT, el 4 bits es más pequeño (18,14 MB frente a 20,48 MB) y claramente mejor en NYU, aunque el int8 obtiene mayor fidelidad al profesor con métricas de detalle inestables.

## Limitaciones y advertencias

- No es una versión oficial de Depth Anything: es una variante comunitaria de Petrouil, sin validación por parte del equipo original.
- Dependencia del operador contrib `MatMulNBits` de ONNX Runtime: no es ONNX estándar y no es portable directamente a TFLite ni a NPU; hay que probar el runtime de destino antes de comprometerse con el formato.
- Forma de entrada fija a 336×448: cualquier otra resolución exige una exportación separada del grafo.
- La salida es profundidad inversa afín-invariante, no metros; para uso métrico hay que ajustar escala y desplazamiento por imagen en el espacio de profundidad inversa.
- Pérdida medible de precisión frente al padre float (−1,40 δ1 en NYU, −0,85 δ1 en fidelidad) y frente al DA-V2-S oficial (−3,15 δ1 en el mismo harness).
- Riesgo de alucinación en regiones ambiguas o sin textura, propio de los modelos de profundidad monocular; no se documentan sesgos específicos.
- No se documentan datos de entrenamiento, composición del dataset ni evaluación multilingüe (no aplica al no procesar texto).
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE` con la atribución correspondiente.
- El modelo int8 QAT mencionado en la model card no se publica y presenta inestabilidad en métricas de detalle (NaN en correlación de gradiente).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Petrouil/Depth-Anything-V2-Tiny-hf-quant
- Modelo padre float: https://huggingface.co/Petrouil/Depth-Anything-V2-Tiny-hf
- Depth-Anything-V2-Small-hf oficial: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Repositorio GitHub Depth-Anything-V2: https://github.com/DepthAnything/Depth-Anything-V2
- Paper Depth Anything V2 (arXiv:2406.09414): https://arxiv.org/abs/2406.09414

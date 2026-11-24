# anguoyang/siglip2-qcs6490

## Resumen

`anguoyang/siglip2-qcs6490` no es un modelo nuevo, sino una ficha de medición independiente del codificador de imágenes SigLIP2 (`google/siglip2-base-patch16-224`) sobre el SoC Qualcomm QCS6490, en concreto sobre el kit Dragonwing RB3 Gen 2. El autor, anguoyang, publica el resultado de un perfilado de inferencia realizado con la API de Qualcomm AI Hub bajo un protocolo uniforme (ONNX en fp32, compilación por defecto, perfil de grafo único) para poder compararlo con el resto de modelos de su barrido de 28 modelos en 14 categorías.

El dato principal es un tiempo de inferencia estimado de 477,0 ms para una imagen de entrada de 1×3×224×224, con salida de un embedding de 768 dimensiones, ejecutado con el runtime QNN en precisión fp32. El propio autor lo contrasta con la entrada de `perf.yaml` (0.66.0) del upstream, que reporta 18,5 ms en W8A16 con ONNX Runtime y 412 de 419 capas en NPU, y advierte que la diferencia de aproximadamente 26× es el coste esperado de fp32 frente a W8A16, no una discrepancia de rendimiento real.

La relevancia de esta ficha es metodológica: aporta un punto de referencia fp32 reproducible para el codificador SigLIP2 en hardware edge de Qualcomm, con identificadores de job de compilación y perfilado, lo que permite a otros equipos replicar la medición. No contiene pesos ni artefactos compilados, solo números y método.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 (codificador de imágenes, base-patch16-224) |
| Parametros totales | no disponible (el ONNX exportado ocupa 371.694.443 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224) |
| Tipos de cuantizacion | fp32 (medido en esta ficha); W8A16 referenciado del upstream |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo upstream); esta ficha solo publica mediciones |
| Formato de pesos | ONNX (exportado con `qai-hub-models` 0.66.0); no se distribuyen pesos |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP2 en su variante base con parches de 16×16 y resolución de entrada 224×224, un codificador de imágenes de tipo transformer con atención SigLIP (sigmoide en lugar de softmax) que produce embeddings de 768 dimensiones. Esta ficha no documenta el entrenamiento del modelo original: no se indican tokens de entrenamiento, composición del dataset ni si hubo ajuste por RLHF o DPO, porque el objeto de la publicación es la medición en hardware, no la descripción del modelo.

La innovación técnica relevante aquí es el pipeline de despliegue: exportación a ONNX desde la definición `siglip2` de `qai-hub-models` 0.66.0, compilación con las opciones por defecto de AI Hub (sin cuantización explícita) y perfilado de un único grafo mediante `submit_inference_job(..., profile=True)`. El número reportado es `execution_summary.estimated_inference_time`, es decir, una estimación por grafo y no una latencia de aplicación de extremo a extremo. Los identificadores de job son `jp084jjn5` (compilación) y `jp3ln97np` (perfilado).

## Capacidades

- Extracción de características visuales: genera un embedding de imagen de 768 dimensiones a partir de entradas de 1×3×224×224.
- Base para tareas de visión-lenguaje: al ser el codificador de imágenes de SigLIP2, sirve como componente de sistemas de recuperación imagen-texto, clasificación zero-shot y alineamiento multimodal.
- Ejecución en hardware edge: perfilado sobre el SoC QCS6490 con runtime QNN, orientado a despliegues en dispositivos de baja potencia.
- Reproducibilidad de la medición: la ficha incluye método, fecha, opciones de compilación e identificadores de job.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades de audio; es exclusivamente un codificador visual.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión adicional, etc.) más allá de la codificación de imágenes.

## Casos de uso

- Búsqueda visual en dispositivos edge: usar el embedding de 768 dimensiones para indexar imágenes localmente en el QCS6490 y resolver consultas por similitud sin enviar datos a la nube; los 477 ms por imagen en fp32 marcan el presupuesto de latencia para indexación por lotes.
- Clasificación zero-shot en cámara industrial: combinar el codificador con prompts de texto precalculados para clasificar piezas o defectos en el propio dispositivo; el perfilado fp32 permite estimar el coste antes de decidir si conviene pasar a W8A16.
- Moderación de contenido visual en el borde: extraer embeddings de fotos subidas por usuarios en un dispositivo con QCS6490 y compararlos contra un conjunto de referencia de contenido no permitido, manteniendo la imagen fuera del servidor.
- Selección de hardware para un proyecto de visión: usar la cifra de 477 ms como referencia fp32 y la de 18,5 ms en W8A16 del upstream para decidir qué precisión y runtime (QNN frente a ONNX Runtime) encajan en el presupuesto de latencia del producto.
- Validación de pipelines de compilación: reproducir los jobs `jp084jjn5` y `jp3ln97np` con `qai-hub-models` 0.66.0 para verificar que la cadena de exportación ONNX y compilación AI Hub produce resultados coherentes antes de integrarla en CI.
- Benchmarking comparativo interno: incorporar esta medición al conjunto `qcs-model-zoo` para comparar el codificador SigLIP2 con otros modelos del mismo barrido bajo un protocolo idéntico, evitando comparaciones entre precisiones distintas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado (fp32, QNN) | 477,0 ms (476.958 µs) |
| Entrada | 1 × 3 × 224 × 224 |
| Salida | 1 × 768 (embedding de imagen) |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, compilación por defecto de AI Hub |
| Referencia upstream W8A16 (ONNX Runtime) | 18,5 ms, 412 de 419 capas en NPU |
| Fecha de medición | 2026-11-21 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible; esta ficha solo reporta latencia de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el despliegue es en un SoC integrado (QCS6490), no en GPU de escritorio. El ONNX exportado ocupa 371.694.443 bytes en disco.
- Hardware de referencia: Dragonwing RB3 Gen 2 Vision Kit con SoC Qualcomm QCS6490, ejecutando el runtime QNN.
- GPU recomendadas: no disponibles para este perfil; el modelo está medido específicamente en el NPU del QCS6490 (412 de 419 capas en NPU según el upstream en W8A16).
- ¿Cabe en GPU consumer? No se ha medido en ese escenario; el interés del modelo es el despliegue edge en Qualcomm.
- Opciones de despliegue: Qualcomm AI Hub (`qai-hub-models` 0.66.0) para exportación ONNX y compilación; runtime QNN en dispositivo; ONNX Runtime como alternativa (usada por el upstream en W8A16).
- Latencia y throughput: 477,0 ms por imagen en fp32 con perfil de grafo único; el upstream reporta 18,5 ms en W8A16. No se documenta throughput agregado ni latencia de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision medida | Hardware | Latencia | Licencia |
|---|---|---|---|---|---|---|
| SigLIP2 base-patch16-224 (esta ficha) | no disponible | 224×224 | fp32 | QCS6490 (QNN) | 477,0 ms | Apache-2.0 |
| SigLIP2 base-patch16-224 (upstream perf.yaml 0.66.0) | no disponible | 224×224 | W8A16 | QCS6490 (ONNX Runtime) | 18,5 ms | Apache-2.0 |
| Otros modelos del barrido qcs-model-zoo | no disponible | no disponible | fp32 uniforme | QCS6490 | no disponible en esta ficha | no disponible |

La comparación relevante es interna al mismo modelo en dos precisiones: la diferencia de aproximadamente 26× entre fp32 y W8A16 refleja el coste de la precisión, no una ventaja de implementación. No se dispone de datos de otros codificadores visuales comparables en la información proporcionada.

## Limitaciones y advertencias

- La cifra de 477,0 ms es una estimación por grafo (`estimated_inference_time`), no una latencia de aplicación de extremo a extremo; no debe usarse como presupuesto de usuario final sin añadir el coste de preprocesado, postprocesado y transporte.
- No es directamente comparable con el dato de 18,5 ms del upstream: corresponden a precisiones distintas (fp32 frente a W8A16) y potencialmente a rutas de ejecución distintas (QNN frente a ONNX Runtime).
- La ficha no publica pesos ni artefactos compilados; quien quiera reproducirla debe exportar el ONNX con `qai-hub-models` 0.66.0 y ejecutar los jobs por su cuenta.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo original en esta información; al ser un codificador de imágenes, el riesgo de alucinación textual no aplica, pero sí posibles sesgos en los embeddings visuales heredados del entrenamiento de SigLIP2.
- La licencia Apache-2.0 corresponde al modelo upstream; esta ficha en sí solo publica mediciones y método, sin concesión sobre artefactos.
- El hardware de referencia es un SoC específico (QCS6490); los números no son extrapolables a otras plataformas Qualcomm o a GPU sin una nueva medición.
- No hay datos de benchmarks de calidad ni de rendimiento en tareas downstream, por lo que no se puede evaluar la idoneidad del modelo para una tarea concreta solo con esta ficha.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/anguoyang/siglip2-qcs6490
- Modelo upstream: https://huggingface.co/google/siglip2-base-patch16-224
- Repositorio de la colección medida: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido completo: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- `qai-hub-models` (versión 0.66.0): https://github.com/quic/ai-hub-models

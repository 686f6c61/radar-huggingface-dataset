# Shubham12864/plant-leaf-disease-detection-using-cnn

## Resumen

El modelo `plant-leaf-disease-detection-using-cnn` es un clasificador de imagenes para diagnostico de patologias en hojas de plantas, desarrollado por Shubham Kumar (usuario `Shubham12864`) como proyecto capstone. A diferencia de los pipelines tradicionales que encadenan un detector de objetos (por ejemplo YOLO) con un clasificador independiente, este modelo integra todo el flujo en una unica red neuronal diferenciable de extremo a extremo. La entrada es una imagen RGB de 224x224 y la salida son dos cabezas de clasificacion mas un mapa de saliencia espacial.

La arquitectura se basa en un backbone ConvNeXt-V2 con capas GRN (Global Response Normalization), sobre el que se anaden tres mecanismos propios: un modulo de compuerta espacial diferenciable que atenua el ruido de fondo no foliar, una cabeza dual jerarquica que condiciona el diagnostico de enfermedad a la familia de cultivo, y una cabeza de seguridad basada en energia libre de Helmholtz. Ademas incorpora prediccion conformal (split conformal prediction) para ofrecer conjuntos de prediccion con cobertura garantizada.

El modelo se distribuye en formato ONNX (FP32 e INT8 dinamico) y PyTorch, con un tamano de repositorio de 0.3 GB. Esta orientado a despliegue en entornos de borde (edge AI) para aplicaciones agricolas, con licencia MIT. No dispone de descargas ni interacciones registradas en HuggingFace en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 2D pura basada en ConvNeXt-V2 con GRN, compuerta espacial diferenciable, cabeza dual jerarquica y cabeza de energia libre de Helmholtz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224x3) |
| Tipos de cuantizacion | FP32 (PyTorch y ONNX), INT8 dinamico (ONNX edge) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), ONNX FP32 (`.onnx`), ONNX INT8 dinamico (`.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea un backbone ConvNeXt-V2 con capas GRN organizado en cuatro etapas (96, 192, 384 y 768 dimensiones). Sobre la salida de la etapa 2 (384 dimensiones, resolucion 14x14) se aplica un modulo de compuerta espacial diferenciable que calcula una mascara M(x) en el rango [0,1] mediante GroupNorm(1, C) y una convolucion 2D. La compuerta atenua las caracteristicas segun F_gated = F * (0.1 + 0.9 * M), lo que segun el autor suprime hasta un 90% del ruido de fondo no foliar (suelo, manos, macetas, cielo) sin necesidad de un detector de objetos externo. La etapa 3 (768 dimensiones) alimenta una cabeza dual: una para familia de cultivo (k=14 clases) y otra para patologia condicionada (k=38 clases). Finalmente, una cabeza de seguridad calcula la energia libre de Helmholtz como E(x) = -T * logsumexp(logits / T).

El autor indica que el modelo se entreno sobre los conjuntos de datos PlantVillage y PlantDoc. No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de aumento de datos, RLHF o DPO (no aplicables en vision). La innovacion destacable es la integracion de la supresion de fondo y la coherencia taxonomica en una sola red diferenciable, ademas de la prediccion conformal con cobertura empirica declarada del 96.61% a un nivel de confianza del 95%.

## Capacidades

- Clasificacion de imagenes de hojas de plantas en 38 clases de patologia y 14 familias de cultivo.
- Supresion autonoma de fondo no foliar mediante compuerta espacial diferenciable (atenuacion declarada del 90%).
- Coherencia taxonomica biologica: condiciona el diagnostico de enfermedad a la familia de cultivo para evitar confusiones entre especies (consistencia declarada del 93.83%).
- Prediccion conformal con conjuntos de prediccion y cobertura garantizada (96.61% empirico al 95% de confianza).
- Cabeza de seguridad basada en energia libre de Helmholtz para detectar entradas fuera de distribucion.
- Salida de mapa de saliencia espacial junto con las dos cabezas de clasificacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).
- No dispone de modo thinking, vision multimodal, audio ni generacion de texto.

## Casos de uso

- Diagnostico agricola en campo: el modelo clasifica enfermedades foliares a partir de fotografias tomadas con el movil, con supresion integrada de fondo (suelo, manos, macetas) que evita errores por ruido visual.
- Despliegue en dispositivos de borde: la version ONNX INT8 ocupa 27.7 MB, lo que permite ejecutarlo en Raspberry Pi o moviles sin conexion a internet, adecuado para zonas rurales con conectividad limitada.
- Triaje en aplicaciones moviles de agricultura: la cabeza de seguridad y la prediccion conformal permiten mostrar al usuario un conjunto de diagnosticos plausibles en lugar de una unica etiqueta, reduciendo el riesgo de falsos positivos.
- Monitorizacion de cultivos con drones o camaras fijas: al integrar la supresion de fondo en la propia red, se puede procesar un flujo de imagenes sin un paso previo de deteccion de hojas.
- Sistemas de alerta temprana en invernaderos: la clasificacion por familia de cultivo y patologia permite enrutar las imagenes a tecnicos especializados segun el tipo de planta afectada.
- Investigacion agronomica y anotacion asistida: el mapa de saliencia y la coherencia taxonomica facilitan la revision manual de diagnosticos y la generacion de datasets etiquetados.
- Educacion y extension agraria: herramienta de bajo coste para formar a agricultores en la identificacion de enfermedades comunes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| Precision de enfermedad en campo (10 epocas extendidas) | PlantDoc Field Benchmark | 85.59% |
| Precision de familia de cultivo en campo | PlantDoc Field Benchmark | 91.04% |
| Consistencia taxonomica biologica | PlantDoc Field Benchmark | 93.83% |

Rendimiento de inferencia en CPU (50 iteraciones, segun el autor):

| Motor | Precision | Tamano | Reduccion | Latencia media | Latencia P95 | Throughput |
|---|---|---|---|---|---|---|
| PyTorch (base) | FP32 | 107.8 MB | 0.0% | 73.7 ms | 83.0 ms | 13.6 FPS |
| ONNX Runtime | FP32 | 107.9 MB | 0.0% | 95.7 ms | 145.6 ms | 10.5 FPS |
| ONNX Runtime (edge) | INT8 | 27.7 MB | 74.3% | 293.7 ms | 403.9 ms | 3.4 FPS |

La paridad numerica entre PyTorch FP32 y ONNX FP32 presenta un error absoluto maximo inferior a 3.58e-6, segun el autor.

## Requisitos de hardware

- VRAM estimada: no aplica en despliegue CPU; en GPU, el modelo FP32 de 107.8 MB requiere menos de 1 GB de VRAM incluyendo overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es lo suficientemente pequeno para ejecutarse en GPUs integradas o de gama baja.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), PyTorch nativo, y potencialmente TensorRT u OpenVINO previa conversion (no documentado por el autor).
- Latencia y throughput: en CPU, 73.7 ms por imagen en PyTorch FP32 (13.6 FPS), 95.7 ms en ONNX FP32 (10.5 FPS) y 293.7 ms en ONNX INT8 (3.4 FPS). No se proporcionan datos de latencia en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia cualitativa, los pipelines clasicos de deteccion de enfermedades foliares suelen combinar un detector YOLO con un clasificador ResNet o EfficientNet, pero no se aportan datos numericos de estos sistemas en la informacion disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| plant-leaf-disease-detection-using-cnn | no disponible | 224x224x3 | MIT | HuggingFace (0 descargas) |
| Alternativas tipo YOLO + clasificador | no disponible | variable | variable | no disponible |
| EfficientNet / ResNet para PlantVillage | no disponible | variable | variable | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks (85.59%, 91.04%, 93.83%) estan declarados por el autor y no han sido verificados de forma independiente.
- El modelo no dispone de descargas ni validacion por parte de la comunidad en HuggingFace, lo que limita la confianza en su robustez fuera del conjunto de evaluacion.
- No se especifican los sesgos del dataset de entrenamiento; PlantVillage y PlantDoc pueden estar sesgados hacia especies y condiciones de iluminacion concretas.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza; la cabeza de seguridad y la prediccion conformal mitigan parcialmente este riesgo, pero no lo eliminan.
- No soporta procesamiento de lenguaje ni capacidades multimodales mas alla de la clasificacion de imagenes.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El modelo esta entrenado para 38 patologias y 14 familias de cultivo; las especies no incluidas en el entrenamiento pueden producir diagnosticos incorrectos.
- El rendimiento en CPU con INT8 es notablemente mas lento (293.7 ms frente a 73.7 ms en FP32), lo que puede limitar aplicaciones en tiempo real.
- No se documentan los datos exactos de entrenamiento, el numero de imagenes ni las tecnicas de aumento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shubham12864/plant-leaf-disease-detection-using-cnn
- Dataset PlantVillage (referenciado): no disponible enlace directo en la informacion proporcionada
- Dataset PlantDoc (referenciado): no disponible enlace directo en la informacion proporcionada
- Paper o publicacion asociada: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible

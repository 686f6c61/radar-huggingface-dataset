# eetmie/smolvla-base-onnx

## Resumen

SmolVLA 450M split ONNX es una exportación a ONNX del modelo `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) orientado a robótica, desarrollado originalmente por Hugging Face en el marco del proyecto LeRobot. La exportación la mantiene el usuario `eetmie` y su propósito es específico: dividir el grafo en nueve subgrafos ONNX que TensorRT pueda compilar y ejecutar dentro de los 8 GB de memoria unificada de una Jetson Orin Nano, sin modificar los pesos. Es, por tanto, un artefacto de despliegue en el borde (edge) más que un modelo nuevo.

El modelo resuelve el problema de llevar un VLA de ~450 M de parámetros a hardware embebido con recursos muy limitados, donde un grafo monolítico no cabe o no compila con TensorRT. La segmentación en nueve grafos, junto con un contrato de entrada fijo (dos cámaras a 512x512, prefijo de 177 tokens, presupuesto de lenguaje de 48 tokens, chunk de 50 acciones y diez pasos de denoising), permite construir motores TensorRT independientes y encadenarlos.

Es relevante ahora porque la robótica basada en VLA está pasando de la demostración en servidores con A100/H100 a la inferencia embebida en plataformas tipo Jetson, y este bundle ofrece una ruta de despliegue reproducible con métricas de paridad publicadas frente a la referencia PyTorch FP32. La licencia Apache 2.0 facilita su uso comercial, aunque el autor no publica datos de entrenamiento ni benchmarks de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en SmolVLA; exportada como 9 grafos ONNX, opset 17 |
| Parametros totales | ~450 M (según el nombre del artefacto; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | prefijo de 177 tokens y presupuesto de lenguaje de 48 tokens (contrato de entrada fijo) |
| Tipos de cuantizacion | no disponible (se menciona TensorRT, pero no se especifican precisión ni calibración) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (9 grafos); modelo base en PyTorch/LeRobot |

## Arquitectura y entrenamiento

El modelo base es SmolVLA, un VLA que combina un codificador visual con un modelo de lenguaje pequeño y un cabezal de acciones entrenado mediante flow matching. La exportación traza el modelo con LeRobot 0.5.1 a opset 17 y lo divide en nueve grafos ONNX; los pesos no se alteran respecto del original. El contrato de ejecución fija dos cámaras de 512x512, un prefijo de 177 tokens, un presupuesto de lenguaje de 48 tokens, un chunk de 50 acciones y diez pasos de denoising con ruido de flow matching inyectado de forma explícita.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La innovación técnica destacable de este artefacto no está en el entrenamiento sino en el despliegue: la división en subgrafos permite que TensorRT compile y ejecute el modelo en una Jetson Orin Nano de 8 GB, algo que un grafo único no permitiría. La paridad se valida sobre ocho chunks de acción en las seis dimensiones declaradas, comparando contra la referencia PyTorch FP32 en la misma placa y con las mismas observaciones y el mismo ruido inyectado.

## Capacidades

- Control robótico por imitación: genera chunks de 50 acciones a partir de observaciones visuales de dos cámaras y una instrucción en lenguaje natural.
- Fusión visión-lenguaje-acción: condiciona la política de acción en el prefijo visual y en el presupuesto de lenguaje definido por el contrato.
- Generación de acciones por flow matching con diez pasos de denoising, con ruido inyectable para reproducibilidad.
- Ejecución en hardware embebido: pensado para TensorRT sobre Jetson Orin Nano de 8 GB.
- Multi-cámara: dos slots de cámara a 512x512.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso general ni otras modalidades (audio) en la información disponible.

## Casos de uso

- Manipulación robótica en el borde: desplegar una política VLA en un brazo robótico conectado a una Jetson Orin Nano, ejecutando los nueve motores TensorRT en secuencia para producir chunks de 50 acciones a partir de dos cámaras y una instrucción.
- Prototipado de robots de bajo coste: usar el bundle ONNX para validar políticas de imitación en plataformas con menos de 8 GB de memoria unificada, sin necesidad de un servidor con GPU de datacenter.
- Investigación en VLA embebido: comparar la salida del runtime ONNX/TensorRT con la referencia PyTorch FP32 usando el ruido de flow matching inyectado, lo que permite aislar diferencias de implementación de las de muestreo.
- Integración en pipelines LeRobot existentes: sustituir la inferencia PyTorch por los grafos ONNX manteniendo el tokenizador y las estadísticas de normalización del bundle, reduciendo la huella de memoria en el robot.
- Evaluación de paridad numérica en producción: usar las métricas de similitud de coseno y desviación relativa publicadas como criterio de aceptación antes de desplegar una nueva build de TensorRT.
- Educación y demostraciones de robótica: reproducir una política VLA completa en un kit Jetson con documentación y benchmark reproducible en el repositorio del autor.

## Benchmarks y rendimiento

Paridad frente a la referencia LeRobot 0.5.1 PyTorch FP32 en la misma Jetson Orin Nano, con observaciones idénticas y ruido de flow matching inyectado idéntico. Se evalúan ocho chunks de acción sobre las seis dimensiones declaradas, expresando la desviación como porcentaje del rango de acciones de la ejecución de referencia:

| Metrica | Valor |
|---|---|
| Similitud de coseno minima | 0,9993415 |
| Desviacion mediana | 0,103 % |
| Desviacion media | 0,184 % |
| Desviacion p99 | 0,894 % |
| Desviacion maxima | 2,052 % |

El máximo corresponde al peor elemento de 2400; la mitad de los elementos difieren menos de un 0,103 % del rango. No se han publicado resultados de benchmarks de tarea (tasa de éxito, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el bundle está dimensionado para caber en los 8 GB de memoria unificada de una Jetson Orin Nano; el repositorio ocupa 1,6 GB.
- GPU recomendadas: Jetson Orin Nano (objetivo declarado). No se especifican otras GPU compatibles.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU de consumo; el artefacto está orientado a Jetson con TensorRT.
- Despliegue: TensorRT sobre los nueve grafos ONNX (opset 17). El runtime debe usar el tokenizador y las estadísticas de normalización incluidos en el bundle. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / contrato | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eetmie/smolvla-base-onnx | ~450 M | prefijo 177 tokens, lenguaje 48 tokens, chunk 50 acciones | ONNX (9 grafos) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | ~450 M | no disponible en la información | PyTorch (LeRobot) | no disponible en la información | Hugging Face (modelo base) |
| Otros VLA de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos a `lerobot/smolvla_base`; solo cambia el formato y la segmentación del grafo.
- Contrato de entrada rígido: dos cámaras a 512x512, prefijo de 177 tokens, presupuesto de lenguaje de 48 tokens, chunk de 50 acciones y diez pasos de denoising. Cualquier variación requiere reexportar o reconstruir los motores.
- Dependencia del tokenizador y de las estadísticas de normalización del bundle; usar otros distintos invalida la paridad publicada.
- La paridad máxima observada es del 2,052 % del rango de acciones en el peor elemento de 2400; en tareas sensibles a la precisión de la acción conviene validar el error acumulado.
- No se documentan sesgos, riesgo de alucinación ni cobertura idiomática; al ser un modelo de control robótico, el riesgo principal es la ejecución de acciones incorrectas, no la generación de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene 0 descargas y 0 likes, por lo que la validación comunitaria es nula.
- No se especifican precisión numérica de los motores TensorRT ni calibración de cuantización, lo que puede afectar a la reproducibilidad entre builds.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eetmie/smolvla-base-onnx
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio del runtime y benchmark reproducible: https://github.com/eetmie/jetson-orin-nano-vla

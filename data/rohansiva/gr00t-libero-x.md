# rohansiva/gr00t-libero-x

## Resumen

`rohansiva/gr00t-libero-x` es un modelo de visión-lenguaje-acción (VLA) obtenido mediante fine-tuning de NVIDIA GR00T N1.7, un modelo fundacional open source para robótica humanoides y manipulación. El autor, rohansiva, ha ajustado el checkpoint `libero_10` de GR00T-N1.7-LIBERO sobre un subconjunto de 60 tareas del benchmark LIBERO-X, cubriendo los niveles 1 a 3 con 20 tareas por nivel. El objetivo es mejorar la precisión de predicción de acciones en entornos de manipulación con un embodiment concreto (LIBERO_PANDA).

El modelo conserva la arquitectura original de GR00T N1.7: un backbone VLM (Cosmos-Reason2-2B) congelado, un proyector y un head de difusión para generar acciones. Con 3 144 016 000 parámetros totales, de los cuales solo 1 620 000 000 son entrenables (51,5 %), el fine-tuning se ha centrado en el proyector y el head de difusión, manteniendo intacto el conocimiento visual-lingüístico del modelo base. Su relevancia radica en demostrar cómo adaptar un VLA generalista a tareas específicas con un coste computacional moderado y un dataset reducido, siguiendo las recetas de entrenamiento publicadas por NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) con backbone Cosmos-Reason2-2B + proyector + diffusion action head |
| Parametros totales | 3 144 016 000 (3,14 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (no se indican cuantizaciones adicionales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de NVIDIA GR00T N1.7, un VLA cross-embodiment que procesa entradas multimodales (lenguaje natural e imágenes) para generar comandos de acción continua en tareas de manipulación robótica. El backbone es un VLM (Cosmos-Reason2-2B) que extrae representaciones semánticas de la escena y la instrucción; estas representaciones se proyectan a un espacio latente y un head de difusión produce las acciones. El fine-tuning ha congelado el backbone y ha entrenado únicamente el proyector y el head de difusión, lo que reduce drásticamente el número de parámetros actualizables.

El entrenamiento se realizó sobre un subconjunto de LIBERO-X con 60 tareas (20 por nivel de los niveles 1-3, seleccionadas con semilla 42 sin solapamiento entre niveles), que comprenden 372 episodios y 123 224 frames, todos con embodiment LIBERO_PANDA. Se utilizaron 8 GPUs con DeepSpeed ZeRO-2, un batch global de 192, 15 épocas (9 627 pasos), una tasa de aprendizaje de 3e-5 con decaimiento coseno (escalada linealmente desde la receta publicada de 1e-4 con batch 640), warmup del 5 %, weight decay de 1e-5 y state dropout de 0,2. La loss final de entrenamiento fue de 0,177, partiendo de aproximadamente 1,35 al inicio.

## Capacidades

- Manipulación robótica: genera acciones de control (posición, orientación, fuerza) a partir de observaciones visuales y una instrucción en lenguaje natural.
- Entrada multimodal: combina imágenes de cámara y texto para comprender la escena y la tarea.
- Fine-tuning específico: adaptado a las tareas de LIBERO-X, lo que mejora la precisión en la predicción de acciones frente al modelo base en ese benchmark.
- Evaluación open-loop: capacidad de predecir trayectorias de acción completas a partir de una secuencia de observaciones, medida mediante MSE y MAE.
- No incluye capacidades de tool calling, agentes conversacionales ni razonamiento de propósito general, al ser un modelo puramente orientado a robótica.

## Casos de uso

- Entrenamiento de políticas robóticas en simulación: el modelo puede integrarse en entornos como Isaac Lab o LIBERO para aprender tareas de manipulación (coger, apilar, colocar objetos) con un alto grado de precisión.
- Transferencia a robots reales: al haber sido entrenado con un embodiment específico (LIBERO_PANDA), puede servir como punto de partida para políticas zero-shot o few-shot en brazos robóticos similares, reduciendo la cantidad de datos reales necesarios.
- Benchmarking de algoritmos VLA: investigadores pueden usar este modelo como referencia para comparar nuevas técnicas de fine-tuning o arquitecturas de acción en el benchmark LIBERO-X.
- Desarrollo de asistentes robóticos domésticos: la capacidad de entender instrucciones en lenguaje natural y generar acciones lo hace adecuado para prototipos de robots que realizan tareas de organización o limpieza.
- Generación de datos sintéticos de entrenamiento: el modelo puede ser usado para anotar o generar trayectorias de demostración en nuevos escenarios de LIBERO-X, ampliando el dataset de forma automática.
- Investigación en generalización cross-embodiment: aunque entrenado en un solo embodiment, su base es un modelo fundacional cross-embodiment; puede estudiarse cómo se comporta al evaluarlo en otros brazos robóticos sin fine-tuning adicional.

## Benchmarks y rendimiento

El autor ha evaluado el modelo en open-loop, midiendo el error de predicción de acciones contra 11 trayectorias ground-truth de 30 tareas held-out (disjuntas de las 60 de entrenamiento, niveles 1-3). Los resultados son:

| Metrica | Valor |
|---|---|
| MSE promedio | 0,0357 |
| MAE promedio | 0,0894 |

No se han publicado resultados de closed-loop (tasa de éxito en simulación) ni comparativas con otros modelos en la información disponible. Estos valores indican una baja desviación respecto a las trayectorias reales, pero no garantizan un rendimiento óptimo en ejecución real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,14 B parámetros en precisión fp16, el modelo ocupa aproximadamente 6,3 GB, más overhead de activaciones y fotogramas, por lo que se recomienda al menos 12 GB de VRAM para inferencia cómoda. En cuantización int8 podría reducirse a ~3,2 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para entrenamiento o inferencia con batch grande. En consumer GPU, una RTX 4080 o superior es viable.
- Opciones de despliegue: al ser un modelo de robótica, no se usa directamente con vLLM o llama.cpp; se integra mediante el framework Isaac Lab de NVIDIA o a través de la API de GR00T (grootdocs.com). También puede exportarse a formato ONNX para despliegue en edge.
- Latencia y throughput: no se han publicado datos específicos; depende del hardware y del número de pasos de difusión en el head de acción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas evaluadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rohansiva/gr00t-libero-x (este) | 3,14 B | no disponible | LIBERO-X (60 tareas) | Apache 2.0 | HuggingFace |
| nvidia/GR00T-N1.7-LIBERO (base) | 3,14 B | no disponible | LIBERO (10 tareas) | Apache 2.0 | HuggingFace |
| OpenVLA (7B) | 7 B | 32k (texto) | 21 tareas (varios benchmarks) | MIT | HuggingFace |

El modelo aquí descrito es un fine-tuning del segundo, por lo que su rendimiento en LIBERO-X debería ser superior al del base en ese benchmark, aunque no se dispone de comparación directa publicada. OpenVLA es un VLA de mayor tamaño con licencia permisiva, pero no está específicamente adaptado a LIBERO-X.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al entrenar sobre un subconjunto de 60 tareas de LIBERO-X, el modelo puede no generalizar a otras tareas de manipulación fuera de ese conjunto.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir predicciones de acción erróneas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto; al ser un modelo multimodal, la cantidad de imágenes procesadas por paso puede estar limitada por la memoria.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, sin restricciones de atribución adicionales.
- Caveats de producción: la evaluación se ha realizado en open-loop, no en closed-loop; para despliegue real es necesario validar en simulación y en robot físico. El modelo está entrenado para un embodiment concreto (LIBERO_PANDA) y puede requerir adaptación para otros brazos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohansiva/gr00t-libero-x
- Modelo base NVIDIA GR00T N1.7-LIBERO: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Repositorio GitHub de NVIDIA Isaac GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Documentación de Isaac GR00T: https://grootdocs.com/
- Benchmark LIBERO-X: https://meituan.github.io/LIBERO-X/
- Dataset LIBERO-X en HuggingFace: https://huggingface.co/datasets/meituan/LIBERO-X

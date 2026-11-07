# Myungkyu/rldx_robodojo_deltaeef_b128_60k

## Resumen

`rldx_robodojo_deltaeef_b128_60k` es un checkpoint de ajuste fino (fine-tuning) del modelo base `RLWRLD/RLDX-1-PT`, publicado por el usuario Myungkyu en Hugging Face. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, entrenado como baseline sobre el conjunto de datos RoboDojo-Benchmark/RoboDojo en su configuración de co-entrenamiento en simulación. El modelo consume imágenes de tres cámaras (cabeza y ambas muñecas), un estado articular de 14 dimensiones y una instrucción de tarea en lenguaje natural, y produce como salida objetivos articulares absolutos de 14 dimensiones.

El checkpoint corresponde a un entrenamiento de 60.000 pasos con batch de 128 sobre 35 tareas y 100 episodios por tarea, con dos brazos ARX X5, usando la exportación oficial de LeRobot. La arquitectura heredada de RLDX-1-PT emplea una ventana de vídeo de longitud 4 con stride 2 y un horizonte de acción de 50 pasos. El ajuste incorpora enmascarado de ruido en las dimensiones de padding (`action_noise_mask_dim=14`) y dropout de estado de 0,5.

Su relevancia radica en que sirve como referencia ("vanilla baseline") reproducible para comparar variantes posteriores del mismo autor (por ejemplo, la variante `deltaeef2` con corrección de etiquetas de estado siguiente), y en que documenta con precisión la configuración de entrenamiento, los checkpoints intermedios y los requisitos de descarga. El repositorio ocupa 165,9 GB e incluye pesos en formato safetensors con 6.912.896.320 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (VLA; ventana de vídeo longitud 4 / stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parametros totales | 6.912.896.320 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana de vídeo de 4 fotogramas con stride 2; horizonte de acción 50) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de entrenamiento | RoboDojo-Benchmark/RoboDojo (35 tareas x 100 episodios, dual ARX X5, exportación oficial LeRobot) |
| Entradas | Imágenes de cabeza + muñeca izquierda + muñeca derecha, estado articular de 14 dimensiones, instrucción de tarea |
| Salidas | Objetivos articulares absolutos de 14 dimensiones |
| Configuracion de entrenamiento | Batch 128, 60.000 pasos, `action_noise_mask_dim=14`, state dropout 0,5 |
| Codigo | RLWRLD/RLDX @ `myungkyu/jitter-patch` 21f674b4 |
| Checkpoints intermedios | `checkpoints/step-15000`, `checkpoints/step-30000`, `checkpoints/step-45000` |
| Tamano del repositorio | 165,9 GB |
| Descargas | 82 |
| Likes | 0 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo se construye sobre RLDX-1-PT, un modelo de visión-lenguaje-acción que procesa una ventana de vídeo de cuatro fotogramas con stride 2 y tres vistas de cámara simultáneas (cabeza y ambas muñecas), junto con el estado articular de 14 dimensiones y la instrucción de tarea. La cabeza de acción predice un horizonte de 50 pasos de objetivos articulares absolutos de 14 dimensiones. El ajuste fino se realizó con enmascarado de ruido restringido a las dimensiones de padding (`action_noise_mask_dim=14`) y dropout de estado de 0,5, lo que actúa como regularización frente a la variabilidad del estado observado.

El entrenamiento utilizó el conjunto RoboDojo-Benchmark/RoboDojo en su configuración de co-entrenamiento en simulación: 35 tareas con 100 episodios cada una, sobre dos brazos ARX X5, con la exportación oficial de LeRobot. Se ejecutaron 60.000 pasos con batch de 128, y el checkpoint final no incluye el estado del optimizador. El código utilizado corresponde a RLWRLD/RLDX en el commit `myungkyu/jitter-patch` 21f674b4. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Control robótico de manipulación bimanual: genera objetivos articulares absolutos de 14 dimensiones para dos brazos ARX X5.
- Percepción visual multi-cámara: integra imágenes de cabeza y de ambas muñecas en una ventana temporal de cuatro fotogramas con stride 2.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto, lo que permite reutilizar el mismo modelo para distintas tareas del conjunto RoboDojo.
- Predicción de horizontes de acción largos: emite 50 pasos de acción por inferencia, lo que reduce la frecuencia de replanificación.
- Fusión de estado propioceptivo y visión: combina el estado articular de 14 dimensiones con las observaciones visuales, con dropout de estado durante el entrenamiento para mejorar la robustez.
- Ajuste fino reproducible: incluye checkpoints intermedios en los pasos 15.000, 30.000 y 45.000, cada uno con su propio fichero `SHA256SUMS`.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido.

## Casos de uso

- Baseline de referencia en RoboDojo: sirve para comparar el rendimiento de variantes posteriores (por ejemplo, la variante `deltaeef2` con corrección de etiquetas) bajo la misma configuración de entrenamiento y dataset, ya que la configuración está documentada de forma explícita.
- Evaluación de manipulación bimanual en simulación: permite ejecutar las 35 tareas del conjunto RoboDojo con dos brazos ARX X5 y medir tasas de éxito frente a otros checkpoints.
- Estudio de estrategias de aumento de datos: el enmascarado de ruido en dimensiones de padding y el dropout de estado de 0,5 son configurables, lo que permite analizar su efecto sobre la robustez del control.
- Investigación sobre representaciones VLA: al partir de RLDX-1-PT, el checkpoint facilita experimentos de ajuste fino sobre un backbone preentrenado con ventana de vídeo y horizonte de acción fijos.
- Análisis de la evolución del entrenamiento: los checkpoints intermedios en 15.000, 30.000 y 45.000 pasos permiten trazar curvas de aprendizaje y detectar sobreajuste o estancamiento.
- Reproducción de experimentos: la referencia al commit exacto del código (`myungkyu/jitter-patch` 21f674b4) y la inclusión de sumas de verificación permiten reconstruir el pipeline de entrenamiento e inferencia.
- Transferencia a configuraciones de hardware similares: el modelo está condicionado a un estado de 14 dimensiones y tres cámaras, por lo que puede adaptarse a otras plataformas bimanuales con ajuste fino adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 6.912.896.320 parámetros, en precisión de 16 bits los pesos ocuparían aproximadamente 13,8 GB; en 8 bits, unos 6,9 GB; en 4 bits, unos 3,5 GB. Estas cifras son estimaciones por tamaño de parámetros y no incluyen el coste de los codificadores visuales ni de las activaciones.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de pesos en 16 bits, se requerirían GPU con al menos 16 GB de VRAM; en cuantizaciones de 8 o 4 bits podría caber en GPU de consumo con 8-12 GB, aunque no se ha verificado.
- Cabe en GPU de consumo: no confirmado. La información disponible no especifica requisitos de VRAM ni GPU soportadas.
- Opciones de despliegue: no disponible. La model card solo documenta la descarga mediante `snapshot_download` de Hugging Face y la referencia al repositorio de código RLWRLD/RLDX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Dataset | Licencia | Notas |
|---|---|---|---|---|---|
| `Myungkyu/rldx_robodojo_deltaeef_b128_60k` | 6.912.896.320 | Ventana de vídeo 4 / stride 2; horizonte de acción 50 | RoboDojo (35 tareas x 100 episodios, dual ARX X5) | no disponible | Baseline vanilla con `action_noise_mask_dim=14` y state dropout 0,5 |
| `Myungkyu/rldx_robodojo_deltaeef2_b128_60k` | no disponible | no disponible | RoboDojo (raíces delta reconstruidas con corrección de etiqueta de estado siguiente) | no disponible | Segunda ejecución delta-EEF con corrección de etiquetas |
| `Myungkyu/rldx2_rldx_robodojo_deltaeef_b128_60k` | no disponible | no disponible | RoboDojo | no disponible | Variante sobre backbone RLDX-2 |
| `RLWRLD/RLDX-1-PT` | no disponible | no disponible | no disponible | no disponible | Modelo base preentrenado del que derivan los anteriores |

## Limitaciones y advertencias

- La licencia no está disponible, por lo que no puede confirmarse el uso comercial del modelo ni de los pesos derivados.
- El modelo está entrenado exclusivamente en simulación (RoboDojo Sim) con brazos ARX X5; no hay evidencia de transferencia a hardware real ni a otras plataformas.
- La salida es un vector de 14 dimensiones de objetivos articulares absolutos, lo que limita su uso a configuraciones con el mismo espacio de acción y número de articulaciones.
- El checkpoint final no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde ese punto sin reinicializar el optimizador.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento fuera de distribución; al ser un modelo de control robótico, el riesgo principal es la ejecución de acciones incorrectas ante observaciones no vistas.
- No se especifican los idiomas soportados para las instrucciones de tarea, lo que impide garantizar un rendimiento uniforme en castellano u otros idiomas.
- El tamaño del repositorio (165,9 GB) y la ausencia de cuantizaciones documentadas dificultan el despliegue en entornos con recursos limitados.
- No hay resultados de benchmarks publicados, por lo que no puede evaluarse su rendimiento relativo frente a otros modelos VLA sin ejecutar evaluaciones propias.
- El modelo depende de un fork específico del código (`myungkyu/jitter-patch` 21f674b4), lo que puede complicar la reproducibilidad si dicho fork deja de estar disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_robodojo_deltaeef_b128_60k
- Variante delta-EEF con corrección de etiquetas: https://huggingface.co/Myungkyu/rldx_robodojo_deltaeef2_b128_60k
- Variante sobre backbone RLDX-2: https://huggingface.co/Myungkyu/rldx2_rldx_robodojo_deltaeef_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Repositorio de código RLWRLD/RLDX: https://github.com/RLWRLD/RLDX (referenciado en la model card; no se ha verificado la URL exacta)

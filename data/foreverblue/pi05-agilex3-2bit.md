# ForeverBlue/pi05-agilex3-2bit

## Resumen

pi05-agilex3-2bit es una versión cuantizada a 2 bits del modelo `agilex3_pi05`, un modelo de visión-lenguaje-acción (VLA) basado en la arquitectura π0.5 y ajustado con todos los parámetros (paso 5999, pesos EMA) para tres tareas de manipulación robótica sobre el brazo AgileX Piper. Lo publica el usuario ForeverBlue bajo licencia Apache 2.0 y está pensado exclusivamente para comparar en robot real el comportamiento de los pesos cuantizados frente al modelo en precisión completa.

La cuantización afecta a las 414 capas lineales del conjunto (torre visual, modelo de lenguaje y experto de acción), que suman 2700 millones de pesos a una media de 2,016 bits por peso; la tabla de embeddings se cuantiza a INT8 por filas y las capas de normalización, sesgos, codificaciones posicionales y estadísticas de normalización se mantienen intactas. La calibración se hizo con 64 demostraciones (256 observaciones más sus variantes con perturbación de iluminación y recorte), sin reentrenamiento posterior.

Un detalle crítico: el `model.safetensors` del repositorio ocupa 14,5 GB porque almacena los pesos ya decodificados desde 2 bits, de modo que openpi estándar los carga sin cambios. Por tanto, este repositorio sirve para medir la tasa de éxito de los pesos cuantizados en robot real, pero no aporta ninguna ventaja de memoria ni de velocidad: el almacenamiento real en 2 bits son 0,68 GB (frente a 5,41 GB en BF16) y requiere un runtime de decodificación específico que no se incluye aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (torre visual + modelo de lenguaje + experto de acción), implementación PyTorch de openpi |
| Parametros totales | 2700 millones de pesos en las 414 capas lineales cuantizadas a 2 bits; total del modelo no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits (media 2,016 bits/peso) en capas lineales; INT8 por filas en embeddings; resto en precisión original |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tareas robóticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14,5 GB, pesos decodificados en formato PyTorch de openpi) |

## Arquitectura y entrenamiento

El modelo parte de `agilex3_pi05`, un π0.5 ajustado con todos los parámetros durante 5999 pasos (pesos EMA) para tres tareas concretas sobre el brazo AgileX Piper: `cluster_grasp`, `cabinet_lemon` y `circle`. La arquitectura combina una torre visual, un modelo de lenguaje y un experto de acción que produce trayectorias de 10 pasos a 7 dimensiones (acción de 10 Hz). La entrada son dos cámaras (fija y de muñeca), el estado del robot y una instrucción en lenguaje natural; la salida es una secuencia de 10 acciones.

La cuantización se aplicó únicamente a las 414 capas lineales de los tres componentes (2,016 bits por peso de media), con embeddings en INT8 por filas y sin tocar normalizaciones, sesgos, codificaciones posicionales ni el archivo `norm_stats.json` (idéntico byte a byte al del paquete original). La calibración usó 64 demostraciones (22 de `cluster_grasp`, 21 de `cabinet_lemon`, 21 de `circle`), 4 fotogramas por demostración, es decir 256 observaciones, más versiones con perturbación de iluminación y recorte; solo se recogieron estadísticas de las entradas de cada capa, sin actualizar pesos. No hubo reentrenamiento ni ajuste fino posterior a la cuantización.

## Capacidades

- Generación de acciones robóticas de manipulación: produce trayectorias de 10 pasos y 7 dimensiones a partir de observaciones visuales, estado del robot e instrucción.
- Control a 10 Hz con el mismo protocolo de entrada, salida, instrucciones y limitación que el modelo en precisión completa.
- Ejecución de tres tareas específicas: `cluster_grasp`, `cabinet_lemon` y `circle`.
- Integración con openpi mediante `AgileXPi05Policy` o mediante servidor de políticas (`serve --port 8000`).
- Compatibilidad con el script `agilex3_pi05.py` del paquete original, añadiendo solo el parámetro `--checkpoint`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo general, visión fuera del pipeline robótico, audio ni modo de pensamiento.

## Casos de uso

- Comparación en robot real de cuantización frente a precisión completa: el modelo está diseñado para alternar con el modelo full-precision en el mismo entorno y medir tasas de éxito por tarea, registrando aciertos y fallos con la misma disposición de objetos y el mismo ritmo de ejecución.
- Validación previa al despliegue mediante autotest: ejecutar `agilex3_pi05.py selftest` con las tres demostraciones de referencia y comprobar que se imprime `SELFTEST_PASS` antes de mover el brazo.
- Sustitución directa en pipelines openpi existentes: al compartir entradas, salidas y formato de checkpoint, se puede intercambiar el modelo en un servidor de políticas sin modificar el código cliente del robot.
- Investigación sobre robustez de cuantización extrema en VLA: los datos de error articular (0,0237 rad frente a 0,0168 rad del full-precision) permiten estudiar cómo degrada el 2-bit la precisión de las trayectorias en tareas de manipulación.
- Recalibración con datos propios: el autor propone guardar las observaciones del modelo 2-bit en ejecución (cámaras, estado, instrucción) para incorporarlas a la calibración y publicar una nueva versión.
- Pruebas de límites de seguridad en producción: verificar que el umbral de parada de 0,25 rad por paso sigue siendo válido, dado que la diferencia máxima observada entre 2-bit y full-precision es de 0,217 rad.
- Docencia y reproducción de experimentos de cuantización: el repositorio incluye `results/summary.json` con los números en bruto y sumas SHA256 para verificar la integridad de los checkpoints.

## Benchmarks y rendimiento

Autotest con las tres demostraciones del paquete original, 30 inferencias y ruido inicial fijo (RTX 6000 Ada):

| Modelo | Error articular (rad) | Ratio frente a no moverse | Error de pinza (mm) | Diferencia con referencia A100 (rad) |
|---|---:|---:|---:|---:|
| Full-precision, JAX (referencia A100) | 0,0160 | 0,134 | 1,77 | — |
| Full-precision, convertido a PyTorch | 0,0160 | 0,134 | 1,78 | 0,0007 |
| 2-bit (este repositorio) | 0,0254 | 0,212 | 1,89 | 0,0180 |

Desglose del autotest por tarea (2-bit):

| Tarea | Inferencias | Error articular (rad) | No moverse (rad) | Ratio | Error de pinza (mm) |
|---|---:|---:|---:|---:|---:|
| cluster_grasp | 11 | 0,0237 | 0,1171 | 0,202 | 1,77 |
| cabinet_lemon | 13 | 0,0227 | 0,1095 | 0,208 | 2,42 |
| circle | 6 | 0,0341 | 0,1456 | 0,234 | 0,97 |
| Total | 30 | 0,0254 | 0,1195 | 0,212 | 1,89 |

256 observaciones reservadas (64 demostraciones no usadas en calibración, 4 fotogramas cada una):

| Métrica | Full-precision | 2-bit |
|---|---:|---:|
| Error articular frente a demostración (rad), total | 0,0168 | 0,0237 |
| cluster_grasp | 0,0162 | 0,0223 |
| cabinet_lemon | 0,0197 | 0,0280 |
| circle | 0,0145 | 0,0208 |
| Error de pinza frente a demostración (mm) | 2,31 | 3,16 |
| Error articular de no moverse (rad) | 0,1391 | 0,1391 |

Comparación directa 2-bit frente a full-precision (mismo ruido inicial) y variación del full-precision con otro ruido inicial:

| Métrica | 2-bit vs full-precision | Full-precision con otro ruido |
|---|---:|---:|
| Diferencia articular media (rad) | 0,0156 | 0,0130 |
| Diferencia articular media en los 5 primeros pasos (rad) | 0,0111 | 0,0096 |
| Diferencia articular máxima (rad) | 0,217 | 0,179 |
| Diferencia media de pinza (mm) | 1,64 | 2,38 |

Lectura de los datos según el autor: la desviación del 2-bit respecto al full-precision es 1,2 veces la fluctuación propia de muestreo del full-precision; el error articular frente a demostración sube de 0,0168 a 0,0237 rad (17 % del error de no moverse, frente al 12 % del full-precision). Como las demostraciones pertenecen al conjunto de entrenamiento, estos números miden proximidad al full-precision, no tasa de éxito; la tasa de éxito solo puede medirse en robot real.

Latencia: primera inferencia 472 s en RTX 6000 Ada (compilación con `torch.compile`); tras compilar, mediana de 0,067 s por inferencia.

## Requisitos de hardware

- VRAM de inferencia: la misma que el modelo full-precision en PyTorch, ya que el checkpoint almacena los pesos decodificados (14,5 GB en safetensors). El valor concreto de VRAM no está publicado.
- GPU recomendadas: RTX 6000 Ada (usada por el autor para las mediciones); A100 como referencia de las predicciones full-precision en JAX. No se documentan otras GPU.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras GPU de consumo; el tamaño del checkpoint (14,5 GB) y el uso de `torch.compile` no permiten confirmarlo con los datos disponibles.
- Despliegue: implementación PyTorch de openpi (commit `215abfb217dbac7d5f1273282331b9b1866c0479`), con parche de `transformers` 4.53.2 copiado desde `src/openpi/models_pytorch/transformers_replace/`. Se recomienda `JAX_PLATFORMS=cpu` para evitar que JAX reserve VRAM. Modos: llamada directa a `AgileXPi05Policy` o servidor de políticas en el puerto 8000.
- Latencia: 472 s la primera inferencia (compilación); 0,067 s de mediana después. Throughput no disponible.
- Almacenamiento real en 2 bits: 0,68 GB (frente a 5,41 GB en BF16), pero requiere un runtime de decodificación no incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-agilex3-2bit (este) | 2700 M en capas lineales cuantizadas | no disponible | safetensors (14,5 GB, decodificado) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `agilex3_pi05` full-precision (referencia del autor) | no disponible | no disponible | checkpoint openpi (JAX y PyTorch) | no disponible en la información | Paquete original referenciado en la model card |
| Otros VLA de la familia π0.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos VLA comparables en la información proporcionada, por lo que la comparativa cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- El repositorio no ofrece ninguna ventaja de memoria ni de velocidad: almacena los pesos ya decodificados en 14,5 GB, idéntico al modelo full-precision en PyTorch. Solo sirve para medir la tasa de éxito de los pesos 2-bit en robot real.
- El almacenamiento real en 2 bits (0,68 GB) requiere un runtime de decodificación específico que no se incluye en el repositorio.
- La cuantización se calibró con solo 64 demostraciones (256 observaciones) de las tres tareas; la generalización a otras condiciones de iluminación, objetos o disposiciones no está validada.
- Los errores medidos frente a demostraciones usan datos del conjunto de entrenamiento del modelo original; no son una estimación de tasa de éxito. La tasa de éxito solo puede medirse en robot real.
- Diferencia máxima observada de 0,217 rad en un objetivo articular frente al full-precision, superior a la variación por ruido del propio full-precision (0,179 rad); se recomienda mantener el umbral de parada de 0,25 rad por paso.
- La primera inferencia tarda varios minutos por compilación de `torch.compile`; es imprescindible hacer una llamada en vacío antes de iniciar cualquier tarea para evitar movimientos inesperados.
- El parche de `transformers` modifica la caché de uv y afecta a otros proyectos de la misma máquina que usen esa versión; para revertirlo hay que ejecutar `uv cache clean transformers`.
- El modelo está especializado en tres tareas concretas sobre el brazo AgileX Piper; no es un modelo de propósito general ni se documentan capacidades multilingües, de código o de razonamiento.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de openpi y de una versión parcheada de `transformers`; conviene revisar las licencias de esas dependencias antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/ForeverBlue/pi05-agilex3-2bit
- openpi (repositorio base, commit `215abfb217dbac7d5f1273282331b9b1866c0479`): no disponible como URL en la información proporcionada
- Paquete `agilex3_pi05` (script `agilex3_pi05.py`, README y `selftest_reference.json`): no disponible como URL en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
- Resultados en bruto: `results/summary.json` dentro del repositorio
- Sumas de verificación: `SHA256SUMS` dentro del repositorio

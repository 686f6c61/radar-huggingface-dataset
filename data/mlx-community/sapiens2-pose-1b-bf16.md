# mlx-community/sapiens2-pose-1b-bf16

## Resumen

sapiens2-pose-1b-bf16 es una conversion al framework MLX, en precision bfloat16, del checkpoint facebook/sapiens2-pose-1b de Meta. La publica la organizacion mlx-community y su proposito es permitir la inferencia local de un modelo de estimacion de pose humana centrado en el cuerpo humano sobre Apple Silicon. Se trata de un modelo de vision, no de un modelo de lenguaje: su tarea es producir mapas de calor de 308 keypoints por persona a partir de una imagen y de cajas delimitadoras de personas.

El modelo cuenta con 1.519.780.164 parametros (unos 1,52 mil millones) y ocupa 3,0 GB en el repositorio, la mitad que el checkpoint original en float32. El pipeline declarado es keypoint-detection y el enfoque es top-down, es decir, requiere un detector de personas externo que aporte las cajas; por defecto, si no se facilitan, procesa la imagen completa. Sapiens2 corresponde a la segunda generacion de la familia Sapiens de Meta y se asocia a ICLR 2026.

Su relevancia actual es practica: existe muy poco soporte de modelos de pose de alta densidad de keypoints fuera del ecosistema CUDA, y esta conversion cubre ese hueco en Macs con chip de la serie M. La conversion se realizo con mlx-vlm 0.7.0 y fusiona las proyecciones q/k/v en un unico tensor wqkv por bloque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision con atencion q/k/v por bloque (fusionadas en un tensor wqkv); cabecera de estimacion de pose top-down por mapas de calor |
| Parametros totales | 1.519.780.164 (~1,52 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | bf16 (unico formato de este repositorio); el checkpoint de referencia se distribuye en float32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | sapiens2-license (licencia de tipo "other", definida en el repositorio facebookresearch/sapiens2) |
| Formato de pesos | safetensors, en bfloat16, para la libreria MLX |

## Arquitectura y entrenamiento

La model card describe un transformer de vision en el que cada bloque agrupa las proyecciones de query, key y value en un unico tensor `wqkv`, tal como espera la implementacion Sapiens2 de mlx-vlm. El checkpoint resultante esta integramente en bfloat16, lo que coincide con la precision mixta que usa la referencia durante la inferencia. La salida del pipeline son mapas de calor de 308 keypoints; la tarea de pose devuelve los keypoints en coordenadas de pixel de la imagen de origen, mientras que las tareas densas devuelven arrays de numpy a la resolucion de entrada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni otras innovaciones de entrenamiento: la model card remite explicitamente a la model card original de facebook/sapiens2-pose-1b para la descripcion del modelo, el uso previsto y la licencia. En consecuencia, esos apartados se marcan como no disponibles.

## Capacidades

- Estimacion de pose humana top-down con 308 keypoints por persona.
- Procesamiento de multiples personas en una misma imagen, mediante una matriz de cajas (N, 4) en formato xyxy.
- Salida como arrays de numpy: keypoints con forma (N, 308, 2) y puntuaciones de confianza con forma (N, 308).
- Salida en coordenadas de pixel de la imagen original para la tarea de pose, y a la resolucion de entrada para tareas densas.
- Opcion de flip test (`flip_test`) como aumento en tiempo de inferencia.
- Fallback a imagen completa cuando no se proporcionan cajas de personas.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades multilingues (no aplica).

## Casos de uso

- Analisis tecnico deportivo: a partir de fotogramas de video y cajas obtenidas con un detector, el modelo extrae 308 keypoints por atleta y permite calcular angulos articulares para corregir la tecnica de carrera, salto o levantamiento.
- Rehabilitacion y fisioterapia: el seguimiento de keypoints a lo largo de una serie de ejercicios permite medir rangos de movimiento y detectar compensaciones posturales en consulta, con la ventaja de que los datos no salen del equipo local.
- Captura de movimiento sin marcadores: el modelo puede actuar como etapa de extraccion de pose para pipelines de animacion o de retargeting a un esqueleto 3D, sustituyendo trajes de sensores en producciones de bajo presupuesto.
- Etiquetado automatico de datasets: dado un gran volumen de imagenes de personas, el modelo genera anotaciones de keypoints que despues se revisan y se usan para entrenar detectores o clasificadores especificos.
- Interaccion persona-ordenador: control gestual o analisis de postura en aplicaciones de escritorio para Mac, donde la inferencia se ejecuta sobre la propia maquina sin servicio en la nube.
- Analisis ergonomico en puesto de trabajo: deteccion de posturas mantenidas o incorrectas a partir de imagenes de camara fija, con procesamiento local para minimizar el tratamiento de datos personales.
- Danza y artes escenicas: extraccion de poses por fotograma para analisis coreografico, comparacion entre interpretaciones o generacion de visualizaciones de trayectorias de movimiento.
- Investigacion en vision por computador: el checkpoint sirve como referencia de pose de 308 keypoints para estudiar el comportamiento de la familia Sapiens2 en hardware Apple, o para generar lineas base en tareas de estimacion de pose.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversion no incluye metricas (AP, PCK, mAP ni similares) y los resultados de busqueda consultados no aportan cifras comparables.

## Requisitos de hardware

- Esta conversion depende de MLX, por lo que requiere un Mac con Apple Silicon (serie M). No es ejecutable en GPU NVIDIA ni AMD a traves de MLX.
- Los pesos en bf16 ocupan 3,04 GB. Como estimacion orientativa, la inferencia necesitara del orden de 4 a 6 GB de memoria unificada entre pesos, activaciones y overhead del runtime; esta cifra no esta confirmada por el autor.
- Cabe en Macs con 16 GB de memoria unificada con margen razonable; en equipos de 8 GB el margen es ajustado, especialmente si se procesan varias personas por imagen.
- Para uso sobre GPU NVIDIA conviene recurrir al checkpoint original facebook/sapiens2-pose-1b y a su stack de PyTorch.
- Opciones de despliegue: mlx-vlm (`pip install -U mlx-vlm`), que expone la clase `Sapiens2Predictor` y las utilidades de lectura de imagen. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/sapiens2-pose-1b-bf16 | 1,52 B | safetensors bf16 (MLX) | Pose top-down, 308 keypoints | sapiens2-license | HuggingFace; 0 descargas, 0 likes |
| facebook/sapiens2-pose-1b | 1,52 B (mismo modelo base) | PyTorch float32 | Pose top-down, 308 keypoints | sapiens2-license | HuggingFace |
| facebook/sapiens2-pose-5b | no disponible | no disponible | Pose (variante de mayor tamano de la misma familia) | no disponible | Referenciado en directorios de modelos |

No hay datos de benchmarks publicados en la informacion disponible, por lo que no es posible establecer una comparacion de rendimiento entre estas variantes. Tampoco se dispone de cifras de parametros, contexto o licencia para sapiens2-pose-5b mas alla de su existencia.

## Limitaciones y advertencias

- Requiere un detector de personas externo: es un modelo top-down, de modo que la calidad de las cajas de entrada condiciona directamente la calidad de los keypoints.
- Exclusivo de Apple Silicon: la conversion a MLX no es portable a CUDA sin volver al checkpoint original.
- Licencia sapiens2-license: se trata de una licencia "other" cuyos terminos no se detallan en la model card de la conversion. Es imprescindible revisar el archivo de licencia del repositorio facebookresearch/sapiens2 antes de cualquier uso comercial.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y fue creado el 13 de septiembre de 2026, por lo que no existe evidencia publica de uso en produccion.
- Sin benchmarks publicados: no hay metricas que permitan estimar el error esperado en dominios concretos.
- Riesgo de fallo en oclusiones, poses extremas, desenfoque de movimiento o resoluciones muy alejadas de la distribucion de entrenamiento; esto es inherente al paradigma de mapas de calor top-down, aunque no se han publicado mediciones especificas para este checkpoint.
- El modelo procesa imagenes de personas, lo que implica consideraciones de privacidad y de proteccion de datos personales; el procesamiento local mitiga, pero no elimina, estas obligaciones.
- Idiomas: no aplica. Este apartado no debe interpretarse como soporte multilingue.
- La ficha no cubre los detalles de entrenamiento del modelo base, que hay que consultar en su model card original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/sapiens2-pose-1b-bf16
- Modelo base: https://huggingface.co/facebook/sapiens2-pose-1b
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Repositorio de Sapiens2: https://github.com/facebookresearch/sapiens2
- Framework MLX: https://mlx-framework.org/
- Repositorio de MLX: https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- Directorio de modelos SyncDev (menciona sapiens2-pose-1b y sapiens2-pose-5b): https://www.syncdev.com/models
- MLX Studio: https://mlx.studio/

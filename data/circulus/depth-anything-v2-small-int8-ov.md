# circulus/depth-anything-v2-small-int8-ov

## Resumen

`circulus/depth-anything-v2-small-int8-ov` es un artefacto derivado del modelo de estimación de profundidad monocular **Depth Anything V2 Small** (`depth-anything/Depth-Anything-V2-Small-hf`), exportado a formato **OpenVINO IR** y cuantizado a **INT8** mediante compresión de pesos con NNCF. No es un modelo entrenado desde cero: es una conversión de despliegue creada por el usuario `circulus` dentro del material docente *ARCademy OpenVINO courseware* (lección «04 Depth Anything V2»), generada automáticamente por el script `convert/convert_all.py`. El resultado ocupa **26 MB**, lo que lo sitúa en el rango de modelos aptos para inferencia en CPU, iGPU y NPU sin acelerador dedicado.

El modelo resuelve una tarea concreta: dada una imagen RGB, producir un mapa de profundidad relativa denso (un valor de profundidad por píxel). No genera texto, no soporta *tool calling* ni razonamiento multi-paso, y no dispone de ventana de contexto en el sentido de los modelos de lenguaje: su entrada es una imagen de resolución dinámica, con alto y ancho múltiplos de 14 y 518 píxeles como valor por defecto.

Su relevancia es práctica más que científica: sirve como ejemplo reproducible de cuantización INT8 con OpenVINO y como componente ligero para pipelines de visión por computador en el *edge*. El repositorio registra 0 descargas y 0 *likes*, y el tamaño declarado es 0.0 GB, coherente con un artefacto de curso recién publicado y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el modelo base Depth Anything V2 Small emplea un codificador ViT (DINOv2) con decodificador tipo DPT |
| Parametros totales | No disponible en la ficha del repositorio; el modelo base Small se documenta publicamente con ~24,8 M de parametros (dato no verificado en la informacion proporcionada) |
| Longitud de contexto | No aplica: modelo de vision. Entrada de imagen con alto y ancho dinamicos, ambos multiplos de 14, 518x518 por defecto |
| Tipos de cuantizacion | INT8 (compresion de pesos con NNCF); no se documentan otros niveles en el repositorio |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | `other` segun la model card de este repositorio; consultar la licencia del modelo base |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), cuantizado a INT8; tamano de 26 MB |
| Modelo base | `depth-anything/Depth-Anything-V2-Small-hf` |
| Tarea | Estimacion de profundidad monocular (relativa) |
| Nombre del artefacto en el ecosistema | OpenVINO, INT8, `circulus`, `ov-courseware` |

## Arquitectura y entrenamiento

No se aporta informacion sobre el entrenamiento de este artefacto concreto. Se trata de una exportacion y cuantizacion posteriores: el repositorio indica explicitamente que es una «OpenVINO IR export of depth-anything/Depth-Anything-V2-Small-hf, quantized to INT8 — 26 MB», con compresion de pesos mediante NNCF. No hay datos de numero de tokens, composicion del dataset, RLHF, DPO ni fine-tuning adicional en la informacion disponible.

Del modelo base solo puede afirmarse, con la cautela de no contar con su model card en la informacion proporcionada, que Depth Anything V2 es una familia de estimadores de profundidad monoculares con codificador de tipo transformer de vision y decodificador denso, y que la variante Small corresponde al tamano mas reducido de la familia. La innovacion tecnica destacable de este repositorio no es arquitectonica, sino de despliegue: la cuantizacion INT8 reduce el peso a 26 MB y permite ejecucion sobre el *runtime* de OpenVINO, con resolucion de entrada dinamica configurable (multiplos de 14; mayor valor, mayor fidelidad del mapa de profundidad segun la propia model card).

## Capacidades

- Estimacion de profundidad monocular densa: genera un mapa de profundidad relativa a partir de una unica imagen RGB.
- Entrada de resolucion dinamica: alto y ancho configurables, ambos multiplos de 14, con 518 como valor por defecto.
- Inferencia sobre CPU, iGPU y NPU a traves del runtime de OpenVINO, sin requerir GPU dedicada.
- Modelo INT8 de 26 MB, adecuado para despliegue embebido y entornos con memoria muy limitada.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa lenguaje).
- No dispone de modo *thinking*, entrada de audio ni otras modalidades distintas de imagen a profundidad.

## Casos de uso

- Reconstruccion 3D y fotogrametria ligera: el mapa de profundidad por pixel permite generar nubes de puntos a partir de una sola imagen, util para prototipado rapido de escenas sin captura estereo ni LiDAR.
- Preprocesado para segmentacion y deteccion: alimentar redes de segmentacion o deteccion con un canal extra de profundidad mejora la separacion de objetos que se solapan en la imagen, y el coste de 26 MB hace viable encadenarlo en el mismo dispositivo.
- Robotica de bajo consumo y navegacion: al ejecutarse en CPU o NPU via OpenVINO, puede dotar de percepcion de profundidad a robots moviles o drones con hardware restringido donde no cabe un modelo de mayor tamano.
- Desenfoque de fondo sintetico (bokeh) en aplicaciones moviles: el mapa de profundidad permite separar sujeto y fondo en tiempo de captura o postproceso, con resolucion de entrada ajustable segun el presupuesto de latencia.
- Control de profundidad en generacion de imagenes: el mapa generado se usa como condicionamiento tipo *depth map* en pipelines de difusion para fijar la estructura espacial de la imagen generada.
- Aumento de datos y pseudo-etiquetado: generar etiquetas de profundidad aproximadas sobre grandes volumenes de imagenes no anotadas para preentrenar o afinar otros modelos de vision.
- Realidad aumentada con oclusion correcta: insertar objetos virtuales que queden ocluidos por elementos reales en funcion de su profundidad estimada, sin necesidad de sensor de profundidad dedicado.
- Material docente y validacion de pipelines: al proceder de un curso de OpenVINO, sirve como referencia reproducible para verificar flujos de conversion, cuantizacion NNCF y despliegue en distintos *backends*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de metricas habituales en estimacion de profundidad (por ejemplo ABSRel, delta1 o RMSE sobre datasets como NYUv2 o KITTI), ni comparaciones con otras variantes de la familia. Tampoco se documentan medidas de latencia o *throughput* para la version INT8.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. El artefacto pesa 26 MB en INT8 y el modelo base ronda las decenas de millones de parametros, por lo que el consumo dominante sera el de los tensores de activacion, que dependen de la resolucion de entrada elegida.
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU x86, iGPU Intel y NPU compatibles con OpenVINO. En caso de usar GPU discreta, cualquier modelo con soporte OpenVINO (por ejemplo, Intel Arc o integradas recientes) es suficiente; no se documenta compatibilidad con A100 o H100 en la informacion proporcionada.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso sin GPU.
- Opciones de despliegue: runtime de OpenVINO (Python, C++), OpenVINO GenAI u Optimum-Intel para integracion con HuggingFace Transformers, y el propio flujo de descarga indicado en la model card mediante `huggingface_hub.snapshot_download`.
- Latencia y throughput: no disponibles. Dependeran de la resolucion de entrada, del dispositivo (CPU, iGPU o NPU) y del backend de ejecucion elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `circulus/depth-anything-v2-small-int8-ov` (este) | No disponible en la ficha (base Small: ~24,8 M segun documentacion publica) | OpenVINO IR, INT8, 26 MB | Profundidad monocular relativa | `other` | HuggingFace, 0 descargas |
| `depth-anything/Depth-Anything-V2-Small-hf` | ~24,8 M segun documentacion publica (no verificado en la informacion proporcionada) | Safetensors en precision original | Profundidad monocular relativa | La declarada por el modelo base (no disponible en esta busqueda) | HuggingFace |
| Depth Anything V2 Base / Large | No disponible | Safetensors en precision original | Profundidad monocular relativa | No disponible | HuggingFace |
| Otros estimadores de profundidad monoculares (MiDaS, ZoeDepth, Depth Pro) | No disponible | No disponible | Profundidad monocular | No disponible | No disponible |

No se dispone de datos de rendimiento comparado, por lo que la comparativa se limita a formato de despliegue, tamano de artefacto y licencia declarada.

## Limitaciones y advertencias

- Es un artefacto de curso, no un modelo entrenado: su valor anade es la conversion a OpenVINO IR e INT8, no una mejora de calidad respecto al modelo base.
- La cuantizacion INT8 con NNCF introduce perdida de precision frente a la version en precision original; el repositorio no cuantifica esa degradacion.
- La profundidad estimada es relativa, no metrica: no puede interpretarse directamente como distancia en metros sin calibracion adicional.
- Repositorio con 0 descargas y 0 *likes*: no hay validacion comunitaria ni reportes de uso en produccion.
- La licencia declarada es `other`, lo que exige revisar los terminos del modelo base antes de cualquier uso comercial. No se confirma en la informacion proporcionada si la variante Small del modelo base permite uso comercial.
- El tamano del repo figura como 0.0 GB, dato que puede no reflejar el contenido real y que conviene verificar tras la descarga.
- Las fechas de creacion y actualizacion del repositorio son posteriores a la fecha habitual de publicacion de este tipo de artefactos, lo que sugiere un repositorio reciente y sin historial de mantenimiento.
- No se documentan sesgos especificos, pero cualquier estimador de profundidad monocular hereda los sesgos de su dataset de entrenamiento (tipicamente escenas urbanas y de interior de dominios occidentales); el modelo base no describe su composicion en la informacion disponible.
- Riesgo de alucinacion de estructura: en superficies sin textura, reflejos o transparencias, el mapa de profundidad puede inventar geometria plausible pero incorrecta.
- La resolucion de entrada debe ser multiplo de 14 en ambos ejes; ignorar esta restriccion provoca errores de ejecucion o resultados incorrectos.
- No apto para tareas de seguridad critica (frenada autonoma, medicion metrologica) sin validacion especifica y datos de calibracion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/circulus/depth-anything-v2-small-int8-ov
- Modelo base en HuggingFace: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Repositorio oficial de Depth Anything V2 en GitHub: https://github.com/DepthAnything/Depth-Anything-V2
- Paper de Depth Anything V2: https://arxiv.org/abs/2406.09414
- NNCF (Neural Network Compression Framework) de OpenVINO: https://github.com/openvinotoolkit/nncf
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos fueron paginas genericas sin relacion con el artefacto.

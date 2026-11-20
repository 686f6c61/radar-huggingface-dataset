# noahcao/FAB

## Resumen

FAB (Fast and Accurate Body Estimation in Pixels, World Space and Scenes) es un conjunto de pesos para la estimacion de pose humana y reconstruccion 3D del cuerpo a partir de imagenes, desarrollado por Jinkun Cao (noahcao). El modelo estima keypoints, puntos densos de superficie, contactos y partes del cuerpo en espacio de pixeles, espacio de mundo y escenas, e incluye una cabeza especifica para retargeting a humanoides G1. Se distribuye como pesos preentrenados acompanados de un detector de personas, ajustadores SMPL y un modelo causal de contacto en video.

El repositorio contiene tres variantes: FAB-L (la predeterminada), FAB-S (version reducida) y FAB-H, esta ultima orientada a la malla MHR. El paquete pesa 6,3 GB e incluye componentes auxiliares como el detector de personas y los ajustadores SMPL, aunque no incluye el modelo SMPL, la configuracion de SAM 3D Body ni el modelo MHR, que deben obtenerse por separado segun el repositorio de GitHub.

Es relevante porque aborda la reconstruccion corporal completa en escenas, no solo en pixeles, y porque anade contacto humano y retargeting a humanoides en un unico pipeline. La licencia es exclusivamente de investigacion y uso no comercial, y los pesos derivan de SAM 3D Body y DINOv3, por lo que arrastran las licencias de esos componentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de SAM 3D Body y DINOv3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | fab-weights-license (investigacion y uso no comercial) |
| Formato de pesos | model.pt (PyTorch), con config.json y SHA256SUMS |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento. La model card indica que los modelos de pose, los ajustadores SMPL y el modelo de contacto en video derivan de SAM 3D Body y DINOv3, y que el modelo esta construido con DINOv3. El repositorio incluye tres variantes de pesos (FAB-L, FAB-S y FAB-H) con ficheros `model.pt` y `config.json`, mas un detector de personas (`shared/detector.pt`), dos ajustadores SMPL (`shared/smpl_fitter.pt` y `shared/smpl_fitter_mesh.pt`) y un modelo causal de contacto en video (`shared/contact_video.pt`).

No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica innovacion descrita es funcional: la estimacion conjunta en pixeles, espacio de mundo y escenas, con salidas de keypoints, puntos densos, contactos, partes y una cabeza G1 para retargeting a humanoides.

## Capacidades

- Estimacion de pose humana 2D (keypoints) en espacio de pixeles.
- Reconstruccion 3D del cuerpo con puntos densos de superficie.
- Estimacion en espacio de mundo y en escenas.
- Prediccion de contactos humanos (modelo causal de contacto en video para modo mundo).
- Segmentacion o etiquetado de partes del cuerpo.
- Ajuste a malla SMPL a partir de puntos densos o de la malla MHR de FAB-H.
- Retargeting a humanoides G1 mediante la cabeza especifica incluida en FAB-L y FAB-S.
- Deteccion de personas integrada mediante `shared/detector.pt`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingues; es un modelo especializado en vision y reconstruccion corporal.

## Casos de uso

- Captura de movimiento sin marcadores: FAB puede extraer keypoints y puntos densos de superficie de un sujeto en video para reconstruir su movimiento 3D, util en animacion y produccion audiovisual.
- Analisis biomecanico y deportivo: la estimacion en espacio de mundo y la prediccion de contactos permiten analizar la postura y el apoyo del cuerpo durante ejercicios o gestos deportivos.
- Retargeting a robots humanoides: la cabeza G1 de FAB-L y FAB-S traduce la pose estimada a un humanoide G1, lo que facilita el aprendizaje por imitacion desde video humano.
- Realidad aumentada y virtual: la reconstruccion 3D del cuerpo en escenas permite insertar avatares coherentes con el entorno capturado.
- Interaccion persona-objeto: el modelo de contacto en video ayuda a detectar cuando el cuerpo toca superficies u objetos, relevante en robotica domestica y simulacion.
- Datos de entrenamiento para otros modelos: FAB puede generar anotaciones de pose, malla y contacto a escala sobre videos para preentrenar o evaluar modelos de vision corporal.
- Analisis de ergonomia en entornos industriales: la estimacion en escenas permite evaluar posturas de trabajadores respecto a su entorno sin instrumentacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante el codigo del repositorio de GitHub con pesos en PyTorch (`model.pt`).
- Latencia y throughput estimados: no disponible.
- Tamano en disco del repositorio de pesos: 6,3 GB, sin contar SMPL, la configuracion de SAM 3D Body ni el modelo MHR, que se obtienen aparte.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia restringida a investigacion y uso no comercial; el uso comercial no esta permitido segun la fab-weights-license.
- Los pesos derivan de SAM 3D Body y DINOv3 y arrastran las licencias SAM License y DINOv3 License, reproducidas en el fichero LICENSE.
- El detector de personas tiene su propia procedencia y terminos recogidos en la Parte 4 de LICENSE.
- No se incluyen imagenes de dataset ni el modelo SMPL; el usuario debe obtener SMPL, la configuracion de SAM 3D Body y el modelo MHR por separado.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto o idioma; al ser un modelo de vision, el riesgo principal es el error de estimacion en oclusiones, poses extremas o escenas complejas, aunque no se cuantifica en la informacion disponible.
- No hay datos publicados de benchmarks que permitan validar la precision frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.
- La cita indica un arXiv pendiente de publicacion (arXiv: TBD), de modo que la documentacion cientifica completa aun no esta disponible.

## Enlaces

- Hugging Face: https://huggingface.co/noahcao/FAB
- Repositorio de codigo: https://github.com/noahcao/FAB
- Licencia: fichero LICENSE en el repositorio de Hugging Face

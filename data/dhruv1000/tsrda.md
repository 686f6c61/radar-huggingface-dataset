# Dhruv1000/TSRDA

## Resumen

T-SRDA (Temporal Spatial-Reduction Dual-Attention) es una arquitectura de aprendizaje profundo personalizada orientada a la cartografia de cultivos a partir de series temporales de imagenes satelitales. El modelo ha sido desarrollado por el usuario Dhruv1000 y publicado en Hugging Face como un repositorio de investigacion que incluye codigo, checkpoints, cuadernos y informes. Su motivacion declarada es el paper STCLN, y se evalua sobre los mismos dos conjuntos de datos que dicho trabajo: PASTIS y MTLCC.

El repositorio se organiza en dos carpetas independientes, una por conjunto de datos. La carpeta PASTIS contiene el trabajo principal (metodo, ablaciones, checkpoints, cuadernos y resultados) con parches de 128x128 pixeles y 10 bandas de Sentinel-2. La carpeta MTLCC contiene el port del modelo a ese segundo conjunto, con 13 bandas de Sentinel-2 y teselas de 48x48 pixeles. La arquitectura y los hiperparametros de optimizacion son identicos en ambos casos; solo cambian los valores dependientes del conjunto de datos, que siguen los scripts de STCLN.

Se trata de un modelo de segmentacion semantica de series temporales, no de un modelo de lenguaje: no genera texto ni mantiene conversaciones. Su relevancia radica en que aborda la clasificacion densa de parcelas agricolas a lo largo del tiempo, un problema en el que la informacion temporal (fenologia de los cultivos) es tan importante como la espacial. El repositorio pesa 26,9 GB y no cuenta practicamente con traccion en la plataforma (0 descargas, 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T-SRDA (Temporal Spatial-Reduction Dual-Attention), red neuronal profunda para segmentacion semantica de series temporales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada compuesta por series temporales de parches satelitales (128x128 en PASTIS, 48x48 en MTLCC) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision por satelite, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de PyTorch; el repositorio incluye artefactos joblib |
| Bandas de entrada | 10 (PASTIS) y 13 (MTLCC), Sentinel-2 |
| Datasets de evaluacion | PASTIS, MTLCC |
| Metricas declaradas | mIoU, F1, accuracy, kappa |

## Arquitectura y entrenamiento

La arquitectura T-SRDA combina reduccion espacial y atencion dual sobre series temporales de imagenes Sentinel-2. El nombre indica dos componentes centrales: un mecanismo de reduccion espacial (spatial reduction) que comprime la resolucion de los mapas de caracteristicas para agregar contexto, y un modulo de atencion dual que opera simultaneamente sobre las dimensiones temporal y espacial. El objetivo es capturar la evolucion fenologica de las parcelas (firmas temporales de los cultivos) sin perder la delimitacion espacial de las mismas. La inspiracion declarada es el paper STCLN, aunque la arquitectura es propia y no una reimplementacion directa.

El entrenamiento se realiza sobre dos conjuntos de referencia en teledeteccion agricola. PASTIS aporta parches de 128x128 pixeles con 10 bandas espectrales y anotaciones de parcelas; MTLCC aporta teselas de 48x48 con 13 bandas. La model card indica que los hiperparametros de optimizacion son comunes a ambos experimentos y que solo los valores dependientes del dataset siguen los scripts de STCLN. No se especifican en la informacion disponible el numero de tokens de entrenamiento (concepto no aplicable aqui), la composicion exacta de las muestras, ni si se aplicaron tecnicas de autosupervision efectivas mas alla de la etiqueta `self-supervised-learning` del repositorio. Tampoco se detalla si hubo ajuste fino con RLHF o DPO, algo que no corresponde a este tipo de modelo.

## Capacidades

- Segmentacion semantica densa de parcelas agricolas sobre series temporales de imagenes Sentinel-2.
- Clasificacion de tipos de cultivo a nivel de pixel, con metricas de mIoU, F1, accuracy y kappa.
- Procesamiento de entradas multiespectrales: 10 bandas en PASTIS y 13 bandas en MTLCC.
- Modelado de dependencias temporales: la atencion dual permite integrar la evolucion de la firma espectral a lo largo de la temporada.
- Reduccion espacial para agregar contexto en parches de gran tamano (128x128) y en teselas pequenas (48x48).
- Portabilidad entre conjuntos de datos: la misma arquitectura e hiperparametros funcionan en dos protocolos experimentales distintos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues, de vision general, de audio ni de modo de pensamiento (thinking mode).

## Casos de uso

- Cartografia de cultivos a escala regional: el modelo clasifica cada pixel de un parche Sentinel-2 en una categoria de cultivo, lo que permite generar mapas de uso agricola del suelo a partir de imagenes abiertas y gratuitas del programa Copernicus.
- Monitorizacion de campanas agricolas: al operar sobre series temporales, permite seguir la evolucion de una parcela a lo largo de la temporada y detectar cambios de cultivo entre campanas.
- Seguimiento de superficies subvencionadas: las administraciones pueden contrastar las declaraciones de superficie de los agricultores con la clasificacion automatica de parcelas, usando PASTIS como referencia de validacion.
- Investigacion en teledeteccion: el repositorio incluye ablaciones y cuadernos que sirven como base reproducible para comparar variantes de atencion temporal y reduccion espacial frente a STCLN.
- Evaluacion comparativa de modelos: al emplear los mismos dos datasets y protocolos que STCLN, el modelo se puede usar como linea base adicional en estudios de segmentacion de series temporales.
- Transferencia entre sensores y resoluciones: el port de PASTIS (128x128, 10 bandas) a MTLCC (48x48, 13 bandas) demuestra un flujo de adaptacion reutilizable para nuevos conjuntos de datos con distinta configuracion espectral y espacial.
- Educacion y prototipado: los checkpoints y cuadernos permiten a un equipo reproducir el pipeline completo de entrenamiento y evaluacion sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo se evalua con mIoU, F1, accuracy y kappa sobre PASTIS y MTLCC, y que los resultados y el informe se encuentran en las carpetas `PASTIS/` y `MTLCC/`, pero no se proporcionan las cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 26,9 GB, lo que incluye checkpoints, cuadernos y posibles artefactos auxiliares; el peso de un unico checkpoint no se especifica.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tipo de carga (segmentacion densa sobre parches de 128x128 con series temporales), se trata de una tarea de memoria moderada, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmada. No se indica si el modelo cabe en tarjetas como RTX 4090, RTX 3090 o similares.
- Opciones de despliegue: el modelo se distribuye como codigo y checkpoints de PyTorch, por lo que el despliegue previsible es mediante scripts propios de PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datasets | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| T-SRDA | Segmentacion temporal de cultivos | PASTIS, MTLCC | no disponible | no aplica | no disponible | Hugging Face (repo publico) |
| STCLN | Segmentacion temporal de cultivos (referencia) | PASTIS, MTLCC | no disponible en la informacion | no aplica | no disponible | Referencia bibliografica citada por el autor |
| Otros modelos de la familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con STCLN, del que T-SRDA toma la motivacion y los protocolos de evaluacion. No se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica ninguna licencia en la model card ni en los metadatos de Hugging Face, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo critico para cualquier despliegue en produccion.
- Ausencia de resultados publicados: no hay cifras de mIoU, F1, accuracy ni kappa en la informacion disponible, por lo que no se puede verificar el rendimiento real frente a STCLN.
- Traccion nula en la plataforma: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- Especificidad de dominio: el modelo solo es aplicable a series temporales de imagenes satelitales con la configuracion espectral de Sentinel-2; no sirve para texto, codigo, vision general ni dialogos.
- Dependencia de los protocolos de STCLN: los resultados dependen de los scripts y divisiones de datos del paper de referencia, lo que dificulta comparaciones fuera de ese marco.
- Riesgo de sobreajuste a las regiones y campanas representadas en PASTIS y MTLCC: no se documenta la diversidad geografica de los datos de entrenamiento, por lo que la generalizacion a otras zonas agricolas es incierta.
- Sesgos potenciales: al tratarse de cartografia de cultivos, los errores de clasificacion pueden concentrarse en clases minoritarias o en parcelas con mezcla de cultivos; no hay analisis de sesgo publicado.
- Riesgo de alucinacion en sentido estricto: no aplica (no es un modelo generativo de lenguaje), pero si existe riesgo de falsos positivos y confusiones entre clases espectralmente similares.
- Sin garantias de mantenimiento: el repositorio no indica versionado de releases ni soporte; la ultima actualizacion registrada es de noviembre de 2026.
- Limitacion de idioma: no aplica, ya que el modelo no procesa lenguaje natural.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dhruv1000/TSRDA
- Arbol de archivos del repositorio: https://huggingface.co/Dhruv1000/TSRDA/tree/main
- Carpeta PASTIS (README principal): https://huggingface.co/Dhruv1000/TSRDA/tree/main/PASTIS
- Carpeta MTLCC (informe del port): https://huggingface.co/Dhruv1000/TSRDA/tree/main/MTLCC
- Paper de referencia STCLN: no disponible como enlace en la informacion proporcionada
- Blog o demo oficial: no disponible

# procaffenator/KaryoFlow

## Resumen

KaryoFlow es un detector de objetos especializado en la localizacion de cromosomas en imagenes de citogenetica, desarrollado por el usuario procaffenator y publicado en HuggingFace bajo el pipeline `object-detection`. El modelo parte de DiffusionDet, un detector generativo basado en difusion, y lo adapta sustituyendo el proceso de refinamiento de cajas por un *rectified flow*, ademas de incorporar un modulo de ranking de calidad de localizacion (LQCR) para mejorar la seleccion de candidatos. El resultado reportado es un incremento de mAP de caja COCO frente a detectores discriminativos clasicos como YOLOX-S, Cascade R-CNN, RTMDet-L y el propio DiffusionDet en dos cohortes de cromosomas evaluadas por separado.

El repositorio distribuye 34 checkpoints en formato PyTorch (`.pth`) que cubren tres variantes del metodo (KaryoFlow, KaryoFlow + LQCR y KaryoFlow H3) sobre dos conjuntos de datos, con tres semillas de entrenamiento (42, 123 y 789), ademas de los modelos de comparacion. Las evaluaciones se realizaron sobre 54 combinaciones configuracion-checkpoint registradas en un indice de reproducibilidad. El mejor resultado reportado es de 0,7150 mAP en el Dataset 1 y 0,8658 mAP en el Dataset 2 para la variante KaryoFlow + LQCR.

Se trata de un modelo de vision por computador para investigacion en imagen medica, no de un modelo de lenguaje: no genera texto ni mantiene conversaciones. El autor indica explicitamente que no ha sido validado como sistema de diagnostico clinico autonomo, por lo que su uso previsto es la investigacion en localizacion cromosomica y la reproduccion de los experimentos publicados. El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptacion de DiffusionDet (deteccion generativa por difusion) con refinamiento de cajas mediante rectified flow; backbone no especificado en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos sobre imagenes) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints `.pth` en el formato de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (segun la model card; aplica a la documentacion del repositorio, no a una capacidad multimodal de lenguaje) |
| Licencia | MIT para codigo y documentacion originales de KaryoFlow; los ficheros de checkpoint quedan fuera del alcance de dicha licencia; el codigo adaptado de DiffusionDet conserva CC BY-NC 4.0; otros componentes y datasets mantienen sus propias licencias |
| Formato de pesos | `.pth` (PyTorch, consumidos por la implementacion KaryoFlow/MMDetection; no requieren conversion a Transformers) |

## Arquitectura y entrenamiento

KaryoFlow se construye sobre DiffusionDet, un paradigma de deteccion generativa en el que las cajas delimitadoras se generan y refinan mediante un proceso iterativo de eliminacion de ruido. La contribucion del autor es doble: por un lado, sustituye el esquema de refinamiento por un *rectified flow*, lo que permite trayectorias de transporte mas directas entre la distribucion de ruido y las cajas finales; por otro, introduce LQCR (*localization-quality ranking*), un mecanismo de ranking de calidad de localizacion que mejora la seleccion de candidatos antes de la salida final. La variante H3 se distribuye unicamente con los parametros del estudiante, lo que sugiere un esquema de destilacion o de modelo auxiliar, aunque la informacion disponible no detalla su funcionamiento.

Cada conjunto de datos se entrena y evalua de forma independiente, con tres semillas de entrenamiento (42, 123 y 789) por variante y dataset. Los resultados de la variante principal en el Dataset 1 promedian tres modelos entrenados de forma independiente; en el Dataset 2, las variantes de KaryoFlow promedian tres entrenamientos, mientras que los detectores de comparacion promedian tres ejecuciones de inferencia sobre un unico checkpoint entrenado por detector. El indice `reproducibility/models.json` registra tanto las semillas de entrenamiento como las de inferencia, y `reproducibility/paper_tables.csv` recoge las tablas cuantitativas del manuscrito.

No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el backbone concreto utilizado, ni si se aplicaron tecnicas de aumento de datos o ajuste fino posteriores al entrenamiento supervisado.

## Capacidades

- Deteccion y localizacion de cromosomas en imagenes de citogenetica, con salida de cajas delimitadoras en formato COCO.
- Deteccion generativa: generacion iterativa de candidatos de caja y refinamiento mediante rectified flow, en lugar de una unica pasada discriminativa.
- Ranking de calidad de localizacion (variante LQCR) para priorizar las cajas candidatas con mejor ajuste espacial.
- Reproduccion de experimentos cientificos: cada checkpoint reproduce una ejecucion registrada con semilla concreta.
- Evaluacion comparativa contra detectores de referencia (YOLOX-S, Cascade R-CNN, DiffusionDet, RTMDet-L) dentro del ecosistema MMDetection.
- Variante Euler y variante Heun configurables reutilizando los mismos checkpoints de KaryoFlow.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente, audio ni vision general mas alla de la deteccion de cromosomas.

## Casos de uso

- Investigacion en localizacion cromosomica: el modelo sirve como punto de partida para estudiar si la deteccion generativa con rectified flow supera a los detectores discriminativos en imagenes de cromosomas, comparando mAP bajo las mismas particiones de datos.
- Reproduccion de resultados publicados: descargando el checkpoint correspondiente a una semilla concreta y la configuracion asociada en `configs/`, se puede reproducir exactamente una ejecucion registrada en `reproducibility/models.json`.
- Preetiquetado de cohortes para anotacion: las cajas generadas pueden usarse como propuesta inicial que un citogenetico revise y corrija, reduciendo el coste de anotar nuevas imagenes de cromosomas frente a la anotacion manual desde cero.
- Comparativa de arquitecturas de deteccion en imagen medica: el repositorio incluye los checkpoints de Cascade R-CNN, DiffusionDet, RTMDet-L y YOLOX-S, lo que permite montar un banco de pruebas homogeneo con las mismas metricas COCO.
- Analisis de sensibilidad a la semilla: al distribuir tres semillas por variante y dataset, permite medir la varianza de entrenamiento del metodo y no solo su mejor resultado puntual.
- Integracion en pipelines MMDetection existentes: al estar implementado sobre MMDetection, los checkpoints encajan en flujos de entrenamiento, validacion y despliegue ya construidos sobre ese framework, sin conversion a Transformers.
- Estudio de estrategias de seleccion de candidatos: la comparacion entre KaryoFlow, KaryoFlow + LQCR y KaryoFlow H3 permite aislar la contribucion del ranking de calidad de localizacion al mAP final.
- Docencia y formacion en vision por computador aplicada: sirve como ejemplo completo de deteccion generativa con checkpoints, configuraciones y scripts de evaluacion reproducibles.

## Benchmarks y rendimiento

Deteccion de cromosomas en particiones held-out, medida con COCO box mAP en escala 0-1. Cada dataset se entrena y evalua por separado.

| Modelo | Dataset 1 mAP | Dataset 2 mAP |
|---|---:|---:|
| YOLOX-S | 0,5748 | 0,7951 |
| Cascade R-CNN | 0,6864 | 0,8527 |
| DiffusionDet | 0,6908 | 0,8033 |
| RTMDet-L | 0,6957 | 0,8609 |
| KaryoFlow | 0,7080 | 0,8597 |
| KaryoFlow + LQCR | 0,7150 | 0,8658 |
| KaryoFlow H3 | 0,6914 | 0,8583 |

En el Dataset 1, los resultados promedian tres modelos entrenados de forma independiente. En el Dataset 2, las variantes de KaryoFlow promedian tres modelos entrenados de forma independiente y los detectores de comparacion promedian tres ejecuciones de inferencia sobre un unico checkpoint entrenado por detector. No se han publicado en la informacion disponible resultados de otras metricas como AP50, AP75, AR o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se documentan requisitos de memoria ni tamanos de lote empleados en la evaluacion.
- GPU recomendadas: no disponible. No se especifican modelos de GPU utilizados en los experimentos.
- Compatibilidad con GPU de consumo: no disponible. El tamano del repositorio figura como 0,0 GB y no se indica el peso individual de los 34 checkpoints, por lo que no puede estimarse si caben en una GPU de gama de consumo.
- Opciones de despliegue: la via documentada es la implementacion KaryoFlow/MMDetection, ejecutando `python tools/run.py test <config> --weights <checkpoint> --data-root <dataset>`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Tampoco se documenta exportacion a ONNX, TensorRT u otros formatos de inferencia.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de imagenes por segundo.
- Reproduccion: para reproducir la media de tres entrenamientos se requiere disponer de los tres checkpoints correspondientes; un unico checkpoint solo reproduce su ejecucion registrada.

## Comparativa con modelos similares

La comparativa se establece contra los detectores incluidos en el propio repositorio, evaluados sobre las mismas particiones.

| Modelo | mAP Dataset 1 | mAP Dataset 2 | Familia | Licencia y disponibilidad |
|---|---:|---:|---|---|
| KaryoFlow + LQCR | 0,7150 | 0,8658 | Deteccion generativa con rectified flow y ranking de calidad | Checkpoints incluidos en este repositorio; licencia MIT para codigo y documentacion originales, con restricciones de terceros |
| KaryoFlow | 0,7080 | 0,8597 | Deteccion generativa con rectified flow | Checkpoints incluidos; misma situacion de licencia |
| RTMDet-L | 0,6957 | 0,8609 | Detector denso de una etapa | Checkpoint de comparacion incluido; licencia propia de RTMDet/MMDetection |
| DiffusionDet | 0,6908 | 0,8033 | Deteccion generativa por difusion | Checkpoint de comparacion incluido; codigo original bajo CC BY-NC 4.0 |
| Cascade R-CNN | 0,6864 | 0,8527 | Detector de dos etapas en cascada | Checkpoint de comparacion incluido; licencia propia de MMDetection |
| YOLOX-S | 0,5748 | 0,7951 | Detector de una etapa, modelo pequeno | Checkpoint de comparacion incluido; licencia propia de YOLOX |

No se dispone de comparaciones con otros detectores especializados en cromosomas externos a este repositorio, ni de datos de parametros o coste computacional que permitan comparar eficiencia entre las alternativas.

## Limitaciones y advertencias

- No validado como sistema de diagnostico clinico autonomo: el propio autor indica que los modelos estan destinados a investigacion en localizacion cromosomica y a la reproduccion de los experimentos reportados.
- Alcance de licencia fragmentado: la designacion MIT cubre unicamente las contribuciones originales de codigo y documentacion de KaryoFlow. Los ficheros de checkpoint quedan fuera de ese alcance y el codigo adaptado de DiffusionDet conserva terminos CC BY-NC 4.0, lo que restringe el uso comercial de esa parte. Es imprescindible revisar `LICENSE_SCOPE.md` y `THIRD_PARTY_NOTICES.md` antes de cualquier uso en produccion.
- Riesgo de sobreajuste al dominio: el modelo esta entrenado especificamente para imagenes de cromosomas; no se ha demostrado su generalizacion a otras modalidades de imagen medica ni a preparaciones citogeneticas con protocolos de tincion o captura distintos.
- Dependencia de los datos: las imagenes del Dataset 1 no se distribuyen, por lo que descargar sus checkpoints no da acceso a la cohorte subyacente y la verificacion independiente queda limitada. El Dataset 2 debe obtenerse de su fuente original y prepararse siguiendo las instrucciones de conversion.
- Idiomas: la model card declara unicamente ingles; no hay evidencia de evaluacion en otros dominios linguisticos ni de documentacion multilingue.
- Trazabilidad de checkpoints: el autor advierte de que debe usarse `reproducibility/models.json` para seleccionar el par configuracion-checkpoint exacto, en lugar de inferirlo a partir del nombre del fichero.
- Ausencia de metricas de calibracion y de incertidumbre: no se publican intervalos de confianza mas alla de las medias sobre semillas, ni analisis de falsos positivos por tipo de cromosoma o por calidad de imagen.
- Diferencias metodologicas en la comparativa: en el Dataset 2 los detectores de comparacion promedian tres ejecuciones de inferencia sobre un unico checkpoint, mientras que las variantes de KaryoFlow promedian tres entrenamientos completos, lo que puede favorecer a estas ultimas en la comparacion.
- Riesgo de alucinacion en sentido generativo: al tratarse de un detector generativo que parte de ruido y refina cajas, existe la posibilidad de producir detecciones plausibles pero inexistentes, especialmente en regiones con cromosomas solapados o de baja calidad; la informacion disponible no incluye un analisis especifico de este fenomeno.
- Estado del repositorio: figura con 0 descargas, 0 "likes" y un tamano declarado de 0,0 GB, por lo que la disponibilidad efectiva de los 34 checkpoints debe verificarse antes de planificar cualquier evaluacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/procaffenator/KaryoFlow
- Codigo y demostraciones (paquete anonimizado): https://anonymous.4open.science/r/KaryoFlow/README.md
- Directorio de checkpoints: `weights/`
- Indice de configuraciones y resultados: `reproducibility/models.json`
- Tablas cuantitativas del manuscrito: `reproducibility/paper_tables.csv`
- Fuentes de datos e instrucciones de preparacion: `reproducibility/data.md`
- Alcance de la licencia: `LICENSE_SCOPE.md`
- Avisos de software y metodos de terceros: `THIRD_PARTY_NOTICES.md`
- Configuraciones por dataset: `configs/d1/karyoflow`, `configs/d1/karyoflow_lqcr`, `configs/d1/karyoflow_h3`, `configs/d2/karyoflow`, `configs/d2/karyoflow_lqcr`, `configs/d2/karyoflow_h3`
- Script de verificacion de la release: `tools/check_release.py`
- Script de evaluacion: `tools/run.py`

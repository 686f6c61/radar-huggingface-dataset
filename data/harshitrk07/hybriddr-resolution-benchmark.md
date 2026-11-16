# harshitrk07/hybriddr-resolution-benchmark

## Resumen

HybridDR Resolution Benchmark es un repositorio de checkpoints de PyTorch asociado al articulo *The Mild-Grade Challenge: Resolution and Fusion in Cross-Dataset Diabetic Retinopathy Grading*. No se trata de un modelo fundacional unico, sino de una coleccion de 20 pesos entrenados para clasificacion de imagenes de retinopatia diabetica, organizados en cuatro configuraciones experimentales (fusion alineada a 224 y 448 pixeles, control CNN a 448 pixeles y control de fusion con compuertas a 448 pixeles), cada una con cinco semillas (11, 23, 42, 67 y 101). Lo desarrolla un equipo academico encabezado por Harshit Ravindra Kulkarni, Harshit Aman, Malathi D y Rajasekaran P.

El problema que aborda es el grading de retinopatia diabetica en escenarios de cross-dataset, con especial atencion a la dificultad de distinguir grados leves (mild-grade challenge) y al efecto de la resolucion de entrada y de las estrategias de fusion de caracteristicas. El repositorio ocupa 34,0 GB y esta pensado exclusivamente para investigacion; los autores indican explicitamente que los modelos no han sido validados clinicamente.

Su relevancia actual es metodologica: proporciona un conjunto reproducible de checkpoints con multiples semillas para comparar resoluciones y esquemas de fusion en un dominio medico donde la variabilidad entre datasets es un problema abierto. No es un modelo para uso general ni para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (definiciones en el repositorio de codigo; configuraciones CNN y fusion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos PyTorch sin cuantizar publicados) |
| Idiomas soportados | no aplica (vision; etiquetas de grading) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoints `.pt`/`.pth` segun el codigo del repositorio) |
| Tarea | image-classification (diabetic-retinopathy) |
| Resoluciones de entrada | 224 y 448 pixeles |
| Numero de checkpoints | 20 (4 configuraciones x 5 semillas) |
| Semillas | 11, 23, 42, 67, 101 |
| Tamano del repo | 34,0 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de cada checkpoint. La model card describe cuatro configuraciones comparadas en el articulo: fusion alineada a 224 pixeles (`aligned_ce_r224_`), fusion alineada a 448 pixeles (`aligned_ce_r448_`), un control CNN a 448 pixeles (`cnn_ce_r448_`) y un control de fusion con compuertas a 448 pixeles (`gated_ce_r448_`). El sufijo `ce` sugiere entrenamiento con entropia cruzada (cross-entropy). Las definiciones de modelo y el preprocesado estan en el repositorio de GitHub asociado, no en la model card.

No se especifican en la informacion proporcionada el numero de tokens o imagenes de entrenamiento, la composicion exacta de los datasets, ni si se aplicaron tecnicas de aumento, balanceo de clases o ajuste fino adicional. El enfasis experimental esta en la resolucion de entrada y en la estrategia de fusion de caracteristicas, asi como en la evaluacion cross-dataset, que es el eje del articulo. Cada configuracion se entrena con cinco semillas para permitir analisis de varianza entre ejecuciones.

## Capacidades

- Clasificacion de imagenes de fondo de ojo para grading de retinopatia diabetica.
- Comparacion controlada de resoluciones de entrada (224 frente a 448 pixeles).
- Evaluacion de estrategias de fusion de caracteristicas (alineada y con compuertas) frente a un control CNN.
- Analisis de robustez cross-dataset mediante checkpoints entrenados y evaluados en distintos conjuntos.
- Reproducibilidad estadistica gracias a cinco semillas por configuracion.
- Verificacion de integridad de pesos mediante `SHA256SUMS.txt`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un modelo puramente discriminativo de vision.

## Casos de uso

- Investigacion en grading de retinopatia diabetica: usar los checkpoints como linea base reproducible para comparar nuevas arquitecturas o funciones de perdida en el mismo protocolo experimental.
- Estudio del efecto de la resolucion: comparar `aligned_ce_r224_` frente a `aligned_ce_r448_` para cuantificar la ganancia de detalle en la frontera entre grados leves y moderados.
- Ablacion de fusion de caracteristicas: contrastar `aligned_ce_r448_` y `gated_ce_r448_` con `cnn_ce_r448_` para aislar el beneficio de la fusion frente a una CNN simple.
- Analisis de varianza entre semillas: emplear las cinco semillas por configuracion para estimar intervalos de confianza y detectar configuraciones inestables antes de escalar experimentos.
- Evaluacion cross-dataset: reutilizar los pesos para medir degradacion al cambiar de dominio (camara, poblacion, protocolo de captura) y estudiar tecnicas de adaptacion.
- Reproduccion de resultados del articulo: descargar la revision fijada (`64a187b1...`) y verificar los pesos con `SHA256SUMS.txt` para replicar las tablas publicadas.
- Docencia y formacion: servir como ejemplo practico de comparacion controlada de hiperparametros en vision medica con multiples semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (AUC, accuracy, kappa) ni comparaciones numericas con otros modelos; remite al articulo para los resultados.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende de la arquitectura concreta de cada checkpoint, que no se especifica; con 34,0 GB para 20 checkpoints, el tamano medio por checkpoint ronda 1,7 GB, lo que sugiere modelos de decenas de millones de parametros, pero es una inferencia, no un dato confirmado.
- GPU recomendadas: no disponible en la informacion proporcionada. Para entrada a 448 pixeles se recomienda una GPU con al menos 8-16 GB de VRAM, aunque el dato exacto no esta publicado.
- GPU de consumo: probablemente viable en tarjetas consumer modernas (RTX 3060 en adelante) para inferencia, sujeto a la arquitectura real; no confirmado por los autores.
- Opciones de despliegue: PyTorch nativo con el codigo del repositorio de GitHub; no se mencionan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables a vision clasica salvo exportacion manual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HybridDR Resolution Benchmark | Clasificacion DR | no disponible | 224/448 px | no disponible | Hugging Face (20 checkpoints) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se han identificado alternativas equivalentes con datos verificables.

## Limitaciones y advertencias

- Los autores indican explicitamente que los modelos son para investigacion y no han sido validados clinicamente; no deben usarse para diagnostico ni decision medica.
- Licencia no especificada: no hay autorizacion clara para uso comercial; conviene contactar con los autores antes de cualquier despliegue.
- Ausencia de benchmarks publicados en la model card: el rendimiento real debe extraerse del articulo o reproducirse localmente.
- Riesgo de sesgo por dataset: al ser un benchmark cross-dataset, el rendimiento puede degradarse en poblaciones, camaras o protocolos de captura distintos a los de entrenamiento.
- Arquitectura y numero de parametros no documentados en la model card: complica la planificacion de recursos y la comparacion con otros modelos.
- Sin soporte multilingue ni de texto: es un clasificador de imagenes, no un modelo generativo.
- Fecha de creacion futura (2026) en los metadatos: verificar la integridad y procedencia de los pesos antes de usarlos.
- El repositorio incluye un archivo de checkpoints de soporte (`supporting/`) cuyo alcance y estado conviene revisar antes de asumir que todos los pesos estan completos.

## Enlaces

- Hugging Face: https://huggingface.co/harshitrk07/hybriddr-resolution-benchmark
- Revision fijada (checkpoints principales): https://huggingface.co/harshitrk07/hybriddr-resolution-benchmark/tree/64a187b1d2bff9f21654ede7947efc00e8c886e5
- Codigo del benchmark: https://github.com/kulharshit21/hybriddr-resolution-benchmark
- Checkpoints de soporte: `supporting/README.md` dentro del repositorio de Hugging Face
- Verificacion de integridad: `SHA256SUMS.txt` en el repositorio de Hugging Face

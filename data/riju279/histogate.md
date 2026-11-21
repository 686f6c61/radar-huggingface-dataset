# riju279/histogate

## Resumen

HistoGate es un clasificador de tejido colorectal en imagenes H&E (hematoxilina-eosina) desarrollado por el usuario riju279 y publicado en Hugging Face. No es un modelo de lenguaje: es un pipeline de vision por computador para patologia digital que clasifica cada parche de tejido de 224×224 pixeles en las 9 clases del dataset Kather (tumor, estroma, inmune, musculo, detritos, moco, mucosa normal, adiposo y fondo), agrega los parches por laminilla mediante attention-MIL y deriva dos biomarcadores pronosticos: la ratio tumor-estroma (TSR) y la densidad de linfocitos infiltrantes de tumor (TIL).

El modelo se apoya en un backbone ConvNeXt-Tiny combinado con una cabeza AttentionMIL, e incorpora un detector de out-of-distribution basado en una energy score calibrada por temperatura, exportacion ONNX en fp16 e int8, y una puerta de regresion CI de 9 comprobaciones que puede fallar por diseno. Se sirve mediante FastAPI y FastMCP.

Su relevancia actual reside en el enfoque de ingenieria reproducible: todas las metricas se generan a partir de artefactos medidos (no se escriben a mano) y el autor documenta explicitamente tres fallos del gate (caida por domain shift, limitacion de alcance del detector OOD y desacuerdo marginal del argmax en int8). El repositorio ocupa 0,1 GB y esta etiquetado unicamente con `onnx` y `region:us`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (backbone) + AttentionMIL (agregacion por laminilla) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224×224 por parche) |
| Tipos de cuantizacion | fp16 e int8 (cuantizacion dinamica), exportacion ONNX |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | solo uso de investigacion (pesos); licencia del dataset NCT-CRC-HE-100K aplicable a los datos |
| Formato de pesos | ONNX (fp16 e int8) |

## Arquitectura y entrenamiento

HistoGate emplea un backbone ConvNeXt-Tiny para extraer caracteristicas de cada parche de tejido de 224×224 pixeles, seguido de una cabeza AttentionMIL que agrega las representaciones de todos los parches de una laminilla para producir una prediccion a nivel de slide. Sobre esa agregacion se calculan los biomarcadores TSR (ratio tumor-estroma) y TIL (densidad de linfocitos infiltrantes de tumor). El pipeline incluye ademas un modulo de bio-optica y calibracion de temperatura sobre una energy score para rechazo de entradas fuera de distribucion.

El entrenamiento utiliza los datasets publicos NCT-CRC-HE-100K y NCT-CRC-HE-100K-NONORM (Zenodo 1214456) junto con el conjunto de validacion externa CRC-VAL-HE-7K, que no se redistribuyen en el repositorio. La model card documenta que un modelo entrenado sobre datos con normalizacion de tincion colapsa ante entrada cruda de multiples escaneres, y que una epoca adicional con learning rate bajo sobre datos sin normalizar recupera casi por completo el rendimiento. No se especifican en la informacion disponible el numero exacto de tokens, la composicion detallada del dataset ni si se empleo RLHF o DPO (no aplicables en un clasificador de vision).

## Capacidades

- Clasificacion de parches de tejido H&E en 9 clases Kather: tumor, estroma, inmune, musculo, detritos, moco, mucosa normal, adiposo y fondo.
- Agregacion a nivel de laminilla mediante attention-MIL para producir un informe por slide.
- Derivacion de biomarcadores pronosticos: TSR (tumor-stroma ratio) y TIL (densidad de linfocitos infiltrantes de tumor).
- Deteccion de out-of-distribution mediante energy score calibrada por temperatura, con rechazo fail-closed de entradas anomalas.
- Exportacion ONNX en fp16 e int8, con la ruta int8 sirviendo los mismos valores de biomarcadores a un cuarto del tamano.
- Puerta de regresion CI de 9 comprobaciones (`histogate-gate`) que puede fallar de forma explicita.
- Servido mediante FastAPI y FastMCP.
- Suite de tests adversarial con mas de 163 pruebas.

## Casos de uso

- Investigacion en patologia computacional: clasificacion automatica de parches de tejido colorectal para estudios de caracterizacion morfologica a gran escala sobre cohorts de laminillas digitalizadas.
- Cuantificacion de biomarcadores pronosticos: calculo reproducible de TSR y TIL por laminilla para correlacionar con resultados clinicos en estudios retrospectivos.
- Despliegue en entornos con recursos limitados: la ruta int8 de ONNX reduce el tamano del modelo a un cuarto y permite servir los mismos biomarcadores en infraestructura modesta sin GPU dedicada.
- Integracion en pipelines de control de calidad: el detector OOD basado en energy score rechaza laminillas sin tejido o desenfocadas antes de procesarlas, evitando inferencias invalidas.
- Servicio de inferencia como API: el servidor FastAPI y la interfaz FastMCP permiten exponer la clasificacion y los biomarcadores como herramienta consumible por agentes u otros sistemas.
- Validacion de modelos en CI: la puerta de 9 comprobaciones y el script `morning_eval.sh` permiten reproducir la bateria completa de evaluacion (eval externa, calibracion, domain shift, OOD, exportacion ONNX, drift int8) de forma automatizada antes de desplegar cambios.
- Docencia y reproduccion: el diseno de artefactos medidos y la regeneracion automatica de `RESULTS.md` permiten auditar cada numero publicado y reutilizar el pipeline como referencia metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite todas las metricas (precision externa en CRC-VAL, domain shift, OOD, calibracion, integridad int8 y throughput) a `docs/RESULTS.md`, generado a partir de artefactos medidos, pero esos valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone ConvNeXt-Tiny es un modelo pequeno (del orden de decenas de millones de parametros, valor exacto no disponible), por lo que la inferencia en fp16 o int8 cabe previsiblemente en GPUs de consumo, aunque no se confirman cifras en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable por el tamano del backbone y la existencia de ruta int8, pero no confirmada con datos.
- Opciones de despliegue: ONNX Runtime (fp16 e int8), servidor FastAPI y servidor FastMCP incluidos en el repositorio.
- Latencia y throughput estimados: no disponibles; la model card menciona que el throughput se mide en la bateria de evaluacion, pero no se incluyen valores.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de clasificacion de tejido colorectal ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Domain shift: un modelo entrenado con normalizacion de tincion colapsa ante entrada cruda de multiples escaneres; la recuperacion con una epoca de bajo learning rate deja una caida apenas por encima del umbral del gate, dentro del ruido de muestreo. La correccion completa (aumento de tincion calibrado) esta planificada pero no implementada.
- Alcance del detector OOD: la energy score detecta de forma fiable corrupcion global de la imagen (sin tejido, desenfocada) pero no defectos locales como marcas de boligrafo o pliegues; el control de calidad local es una tarea de segmentacion pendiente.
- Desacuerdo en int8: la cuantizacion dinamica int8 invierte una fraccion pequena de etiquetas de parche; el drift de TSR y TIL es exactamente cero en todas las laminillas medidas, por lo que las salidas clinicas no se ven afectadas, pero la clasificacion por parche no es identica a la ruta fp16.
- Licencia: los pesos son solo para uso de investigacion; no se autoriza explicitamente el uso comercial. La licencia del dataset NCT-CRC-HE-100K aplica a los datos, que no se redistribuyen.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero existe riesgo de clasificacion erronea en parches ambiguos o de tejidos no representados en las 9 clases.
- Idiomas: no aplica; el modelo no procesa texto.
- Produccion clinica: el propio autor presenta el sistema como herramienta de investigacion con fallos documentados del gate, no como dispositivo medico validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/riju279/histogate
- Dataset NCT-CRC-HE-100K / NCT-CRC-HE-100K-NONORM (Zenodo): https://zenodo.org/records/1214456
- Documentacion de resultados (referenciada en la model card): `docs/RESULTS.md` del repositorio
- Hoja de ruta (referenciada): `docs/ROADMAP_PR15-20.md` del repositorio
- Motor de ejecucion (referenciado): `docs/EXEC_ENGINE.md` del repositorio

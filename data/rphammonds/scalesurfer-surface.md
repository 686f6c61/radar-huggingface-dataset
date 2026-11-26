# rphammonds/scalesurfer-surface

## Resumen

scalesurfer-surface es un modelo de reconstruccion de superficie cortical a partir de resonancia magnetica ponderada en T1. Lo desarrolla rphammonds en el contexto del proyecto ScaleSurfer (voytekresearch) y resuelve una tarea clasica de neuroimagen: generar las superficies blanca y pial de cada hemisferio en formato FreeSurfer, junto con grosor cortical y parcelacion Desikan-Killiany, sin ejecutar el pipeline completo de FreeSurfer, que puede tardar horas por sujeto.

El modelo es una red MeshNet de 4,59 M de parametros que combina un codificador CNN 3D con una red de grafos sobre la malla, deformando una plantilla fsaverage suavizada de forma gruesa a fina (ico-1 a ico-7) y refinando despues los contornos con dos refinadores de columna que buscan a lo largo de la normal de cada vertice. La salida son 163.842 vertices por superficie con topologia fsaverage7, alineados con el `orig.mgz` conformado.

Su relevancia actual es doble: por un lado, alcanza un ASSD mediano de 0,154 mm en un conjunto de test de 804 escaneos de 67 instituciones, superando a DeepSurfer y BrainNet en las 15 comparaciones pre-registradas; por otro, lo hace en unos 2,5 s por escaneo de extremo a extremo en una RTX 5090. La contrapartida es una licencia restringida a investigacion academica no comercial, derivada de las condiciones de uso de varios de los datasets de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MeshNet (codificador CNN 3D + red de grafos sobre malla + refinadores de columna) |
| Parametros totales | 4,59 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a malla 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de imagen medica) |
| Licencia | solo investigacion academica no comercial; plantilla fsaverage bajo licencia FreeSurfer |
| Formato de pesos | safetensors (`meshnet.safetensors`) + `config.json`; checkpoint fuente `meshnet_last.pt` |
| Entrada | T1 conformada a 1 mm 256^3 + segmentacion de 7 canales de `rphammonds/scalesurfer-v8` |
| Salida | superficies white/pial (`lh`/`rh`), grosor, area, curvatura, `aparc.annot`, `cortex.label`, `scalesurfer_surfaces.json` |
| Resolucion de malla | 163.842 vertices por superficie, topologia fsaverage7 (ico-7) |
| Framework | PyTorch |

## Arquitectura y entrenamiento

MeshNet opera en tres fases. Primero coloca una plantilla fsaverage suavizada a partir de los centroides de etiquetas de la segmentacion. Despues, un codificador CNN 3D y una red de grafos sobre la malla deforman esa plantilla de forma coarse-to-fine, desde ico-1 hasta ico-7. Finalmente, dos refinadores de columna buscan a lo largo de la normal de cada vertice (primero ±2 mm, luego ±1 mm) los limites de las superficies blanca y pial. La entrada combina la T1 conformada con la segmentacion de 7 canales del modelo volumetrico `rphammonds/scalesurfer-v8`, y el modelo fue entrenado con esas segmentaciones, por lo que se recomienda usar ese mismo segmentador.

El entrenamiento consistio en una unica ejecucion pre-registrada de tres etapas (94.000 pasos en total): preentrenamiento de la red base, entrenamiento de los refinadores de columna con la base congelada y ajuste fino conjunto. Cada semilla, ajuste y checkpoint se fijo antes de la ejecucion, y el checkpoint final es el modelo, sin seleccion sobre validacion o test. Los datos de entrenamiento son 9.139 escaneos de 588 datasets fuente (763 grupos version de FreeSurfer × sitio), referenciados a sus propias salidas de FreeSurfer (5.x: 1.354; 6: 2.528; 7.x: 4.869; 8.2: 388), con muestreo balanceado por grupo. Las fuentes incluyen OpenNeuro, ABIDE I/II, HCP, CoRR, ADHD-200 y HBN.

## Capacidades

- Reconstruccion de superficie cortical completa (blanca y pial) por hemisferio a partir de T1.
- Generacion de mapas de grosor cortical, area y curvatura por vertice.
- Parcelacion cortical Desikan-Killiany (`aparc.annot`) y mascara de corteza (`cortex.label`).
- Salida directamente en formato FreeSurfer, compatible con el ecosistema de analisis existente.
- Alineacion con el `orig.mgz` conformado, lo que facilita la integracion en pipelines que ya usan FreeSurfer.
- Generacion de fichero de procedencia (`scalesurfer_surfaces.json`) para trazabilidad.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente image-to-3D.

## Casos de uso

- Neuroimagen a gran escala: procesar cohortes de miles de sujetos en horas en lugar de dias, ya que cada escaneo requiere unos 2,5 s de extremo a extremo en una RTX 5090.
- Estudios de morfometria cortical: obtener grosor, area y curvatura por vertice para analisis de diferencias entre grupos sin depender del pipeline completo de FreeSurfer.
- Preprocesamiento en pipelines de investigacion: generar superficies compatibles con FreeSurfer para alimentar herramientas de analisis posteriores (por ejemplo, mapeo de fMRI a superficie).
- Control de calidad y cribado: detectar escaneos problematicos comparando las superficies generadas con las de referencia antes de invertir tiempo en el pipeline completo.
- Reproducibilidad metodologica: al ser una ejecucion pre-registrada con checkpoint fijo, facilita replicar resultados en estudios que exigen protocolos cerrados.
- Analisis multi-version de FreeSurfer: el modelo esta entrenado y evaluado a traves de las versiones 5, 6, 7 y 8, lo que permite homogeneizar reconstrucciones en datasets historicos heterogeneos.
- Docencia y prototipado: generar superficies de forma rapida para demostraciones o desarrollo de metodos que necesitan mallas corticales sin infraestructura de calculo pesada.

## Benchmarks y rendimiento

Conjunto de test retenido: 804 escaneos de 67 instituciones, ninguno usado en entrenamiento. Cada metodo se puntua contra las superficies de FreeSurfer del propio escaneo.

| Metodo | ASSD mediana | ASSD media | MAE grosor | HD95 | Caras auto-intersectantes (%) |
|---|---|---|---|---|---|
| scalesurfer-surface (F) | 0,154 | 0,171 | 0,247 | 0,61 | 0,001 |
| DeepSurfer (brainmask de referencia) | 0,179 | 0,191 | 0,244 | 0,59 | 0,014 |
| DeepSurfer (T1 cruda) | 0,183 | 0,204 | 0,253 | 0,68 | 0,013 |
| BrainNet | 0,259 | 0,279 | 0,299 | 1,00 | 0,026 |

Diferencias pareadas de ASSD (F menos baseline, mediana, mm):

| Comparacion | DeepSurfer (brainmask) | DeepSurfer (T1 cruda) | BrainNet |
|---|---|---|---|
| FreeSurfer 5 (155 escaneos) | −0,023 | −0,032 | −0,091 |
| FreeSurfer 6 (372) | −0,022 | −0,026 | −0,106 |
| FreeSurfer 7 (229) | −0,026 | −0,031 | −0,099 |
| FreeSurfer 8 (48) | −0,013 | −0,023 | −0,078 |
| Agrupado (804) | −0,023 | −0,028 | −0,100 |

El criterio pre-registrado exigia que F tuviera menor ASSD que ambas variantes de DeepSurfer y que BrainNet en cada version de FreeSurfer y en el agregado, con intervalo de confianza al 95 % bootstrap por institucion por debajo de cero. F cumplio las 15 comparaciones. En velocidad, la mediana es de 2,50 s por escaneo de extremo a extremo en una RTX 5090, desglosados en 0,60 s de conformado, 0,47 s de segmentacion y 1,38 s de superficies sobre 48 escaneos de test.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 4,59 M de parametros el peso del modelo es de decenas de MB, pero el consumo dominante proviene del volumen 256^3 y del codificador CNN 3D, que requiere una GPU con memoria suficiente para tensores volumetricos (varios GB como minimo).
- GPU recomendadas: RTX 5090 es la referencia medida por el autor (2,50 s por escaneo). No se han publicado mediciones en A100, H100 ni otras GPU.
- GPU de consumo: el modelo cabe con holgura en terminos de parametros; el cuello de botella es la memoria para el volumen 3D. No se especifican requisitos minimos oficiales.
- Despliegue: la via documentada es el paquete `scalesurfer` (instalacion con `pip install -e ".[surface]"` desde el repositorio de GitHub) y los scripts `predict_surfaces.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: mediana de 2,50 s por escaneo en RTX 5090 (0,60 s conformado, 0,47 s segmentacion, 1,38 s superficies). No hay datos de throughput agregado ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | ASSD mediana (test) | MAE grosor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| scalesurfer-surface | 4,59 M | MeshNet con refinadores de columna | 0,154 | 0,247 | solo investigacion no comercial | Hugging Face + GitHub |
| DeepSurfer | no disponible | no disponible | 0,179 (brainmask) / 0,183 (T1 cruda) | 0,244 / 0,253 | no disponible | no disponible |
| BrainNet | no disponible | no disponible | 0,259 | 0,299 | no disponible | no disponible |

scalesurfer-surface obtiene el mejor ASSD y la menor tasa de caras auto-intersectantes (0,001 % frente a 0,013-0,026 %), mientras que DeepSurfer con brainmask logra un MAE de grosor ligeramente mejor (0,244 frente a 0,247). No se dispone de datos de parametros, contexto ni licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Grosor cortical: el error agrupado empata con DeepSurfer (brainmask), pero es peor en FreeSurfer 8 (+0,016 mm) y por region (0,118 frente a 0,100 mm). Cualquier hallazgo basado en grosor debe contrastarse con FreeSurfer.
- FreeSurfer 8: el ASSD es 0,017 mm peor que el del modelo anterior ScaleSurfer M3, aunque F lo supera en el agregado.
- Tipos de escaneo: entrenado con T1 de calidad de investigacion de ninos y adultos; sin probar en escaneos clinicos, otros contrastes, lesiones grandes ni infantes.
- Determinismo: las ejecuciones en GPU no son deterministas bit a bit; repeticiones difieren en unos 0,003 mm por vertice de media.
- Dependencia del segmentador: el modelo fue entrenado con las segmentaciones de `rphammonds/scalesurfer-v8` y debe usarse ese segmentador, no otro.
- Licencia: solo para investigacion academica no comercial. Varios datasets de entrenamiento (HCP, ABIDE, HBN, entre otros) imponen terminos que restringen el uso comercial, y la plantilla fsaverage se distribuye bajo licencia FreeSurfer.
- Uso clinico: no es un dispositivo medico y no debe emplearse para decisiones clinicas.
- Sesgos: no se documentan sesgos especificos mas alla de la composicion de los datasets de entrenamiento; no hay informacion sobre representatividad demografica detallada.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de reconstrucciones erroneas en escaneos fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rphammonds/scalesurfer-surface
- Modelo volumetrico de entrada: https://huggingface.co/rphammonds/scalesurfer-v8
- Repositorio ScaleSurfer: https://github.com/voytekresearch/scalesurfer

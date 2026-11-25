# cbc-528a/vidino_agri

## Resumen

ViDINO Agriculture es un modelo de visión por computador para diagnostico de enfermedades de plantas que combina clasificacion y segmentacion sobre un unico backbone DINOv2 congelado. Lo desarrolla el usuario cbc-528a y se publica bajo licencia Apache-2.0. El modelo aborda un problema practico del ambito agricola: identificar entre 90 clases de enfermedades y estados saludables en cultivos, con un enfoque particular en arroz y durian vietnamita, y localizar a nivel de pixel el tejido vegetal anormal.

La arquitectura se apoya en DINOv2 ViT-S/14 (22,06 M de parametros, embedding CLS de 384 dimensiones, parches de 14 px) que permanece completamente congelado: no se ha escrito ningun gradiente en sus pesos. Sobre esa representacion se montan dos cabezas independientes y versionables por separado: un clasificador lineal (384 a 90 clases, ~140 KB) y un decodificador convolucional de segmentacion (~575 KB, marcado como experimental en su version l2-v0.1). Ademas, el mismo embedding permite un modo few-shot basado en redes prototipicas sin entrenamiento adicional.

Su relevancia radica en la eficiencia: al congelar el backbone, el coste de clasificacion es de unos 20 ms por imagen a 224 px en una GTX 1070, y la segmentacion por teselas ronda 1 s por imagen de 1-4 kpx a 518 px. El repositorio de pesos ocupa 0,0 GB porque no duplica el backbone, que se descarga desde `facebook/dinov2-small` (~88 MB en la primera carga). El modelo esta pensado para escenarios con clases conocidas y para adaptacion rapida a enfermedades nuevas mediante few-shot, no para deteccion automatica de novedad en abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 congelado + cabeza lineal de clasificacion + decodificador convolucional de segmentacion |
| Parametros totales | 22,06 M (backbone DINOv2 ViT-S/14); cabezas: ~140 KB (clasificador) y ~575 KB (segmentador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); resolucion de entrada: 224 px para clasificacion, 518 px para segmentacion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, vi (etiquetas y documentacion; el modelo es de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch): `classifier.pt`, `segmentation.pt`; backbone via `facebook/dinov2-small` o `torch.hub` `dinov2_vits14` |

## Arquitectura y entrenamiento

El backbone es DINOv2 ViT-S/14, con 22,06 M de parametros, token CLS de 384 dimensiones y parches de 14 px. Se mantiene congelado en todos los pesos publicados: se intento un preentrenamiento continuo adaptado al dominio (CPT) y fracaso estructuralmente, porque Meta no publica la cabeza de preentrenamiento DINO y el objetivo de prototipos colapsa a la solucion uniforme (documentado en `reports/stage2_diagnosis.md`). La clasificacion se realiza a 224 px (redimensionado del lado corto a 256 con bicubico, recorte central a 224, normalizacion ImageNet) y la segmentacion a 518 px, que es la rejilla nativa de preentrenamiento del checkpoint (37x37 tokens).

La cabeza de clasificacion es una unica capa lineal (384 a 90) entrenada sobre embeddings cacheados con AdamW, lr 1e-3, weight decay 1e-4, batch 256 y early stopping (paciencia 5); la mejor epoca fue la 85. Los datos de clasificacion suman 122.234 filas que, tras deduplicacion, quedan en 70.395 imagenes unicas, con splits de 45.488 entrenamiento, 5.813 validacion y 5.836 test sobre 90 clases. Las fuentes incluyen Rice Disease & Crop Recommendation (Apache-2.0), Vietnamese Durian Leaf Disease (CC BY-4.0), PlantDoc (CC BY-4.0), 15 Crop / 45 Disease (CC BY-4.0) y 17C67DHC (CC BY-4.0). Se documentan problemas de procedencia: el 70,9 % de las filas de arroz son duplicadas, 2.509 filas presentan conflictos de etiqueta (1.212 descartadas, 1.297 mantenidas solo para entrenamiento) y la calidad de imagen de 17C67DHC es heterogenea. 19 clases Tier 3 (12.738 imagenes) se mantienen fuera del entrenamiento. Los conjuntos Vinh Long (CC BY-NC), PlantVillage (CC BY-SA) y PlantSeg (CC BY-NC-ND) se usan solo para evaluacion, con un assert que lo impone por identificador de fuente y ruta.

La cabeza few-shot emplea redes prototipicas sin entrenamiento: se embeben k ejemplos por clase (3-5 recomendados), se promedian y normalizan L2, y se ordena la consulta por similitud coseno. Incluye una abstencion heuristica basada en validacion leave-one-out dentro de clase con umbral media menos 2 desviaciones tipicas, que el autor advierte explicitamente que no es deteccion de novedad calibrada.

## Capacidades

- Clasificacion de imagenes de plantas en 90 clases de enfermedad o estado saludable, con etiquetas de cultivo, nivel y fuente en `classes.yaml`.
- Segmentacion a nivel de pixel del tejido anormal, en version experimental l2-v0.1.
- Aprendizaje few-shot sin entrenamiento adicional: clasificacion de una enfermedad nueva a partir de 3-5 ejemplos por clase mediante prototipos y similitud coseno.
- Modo de abstencion heuristica para indicar baja separacion entre candidatos (no calibrada como deteccion de novedad).
- Capacidades multilingues limitadas a etiquetas y documentacion en ingles y vietnamita; el modelo en si procesa imagenes, no texto.
- Versionado independiente de las dos cabezas sobre el mismo embedding de 384 dimensiones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de vision.
- No incluye deteccion automatica de novedad en abierto (open-set); decidir si una enfermedad es nueva es responsabilidad de quien llama.

## Casos de uso

- Diagnostico de enfermedades del arroz en campo: el clasificador de 90 clases identifica la patologia a partir de una foto de hoja a 224 px en unos 20 ms en una GTX 1070, adecuado para aplicaciones moviles o de borde con captura en tiempo real.
- Revision de cultivos de durian en Vietnam: el modelo incluye clases especificas del dataset Vietnamese Durian Leaf Disease y etiquetas en vietnamita, lo que facilita su integracion en herramientas locales de extension agraria.
- Triaje visual en estaciones de inspeccion: la segmentacion experimental localiza el tejido anormal a 518 px con inferencia por teselas (~1 s por imagen de 1-4 kpx), util para priorizar imagenes que requieren revision humana.
- Adaptacion a enfermedades emergentes: el modo few-shot permite clasificar una patologia nueva con solo 3-5 fotos por clase, sin reentrenar el backbone ni la cabeza lineal.
- Aplicaciones de asistencia al agricultor con conectividad limitada: al no duplicar el backbone y pesar las cabezas ~140 KB y ~575 KB, el despliegue es ligero una vez descargado DINOv2 (~88 MB la primera vez).
- Control de calidad en laboratorios de fitopatologia: la clasificacion sobre imagenes limpias y la separacion entre candidatos permiten generar una primera hipotesis que el tecnico valida, con la abstencion heuristica como aviso de baja confianza.
- Investigacion en vision agricola: el diseno de backbone congelado y cabezas sustituibles facilita experimentos reproducibles y comparaciones controladas sobre el mismo embedding de 384 dimensiones.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Precision Tier 2 | 0,841 | Sobre un test con ruido heterogeneo (42,5 % de imagenes limpias en train frente a 15 % en test) |
| Coste de clasificacion | ~20 ms/imagen | 224 px, GTX 1070 |
| Coste de segmentacion | ~1 s/imagen | 518 px, inferencia por teselas, fotos de 1-4 kpx, GTX 1070 |
| Cobertura de evaluacion | 5.671 de 5.836 imagenes (97,2 %) | 165 imagenes excluidas por la regla de cobertura (class_id, source_id) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de vision por computador y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el backbone ViT-S/14 es pequeno y las cabezas son de pocos cientos de KB, por lo que la huella es reducida.
- GPU recomendadas: el autor reporta mediciones en una GTX 1070; cualquier GPU moderna con suficiente VRAM para ViT-S/14 a 518 px es adecuada.
- Cabe en GPU de consumo: si, segun las mediciones del autor en GTX 1070.
- Opciones de despliegue: el paquete de inferencia vive en el repositorio de GitHub `vi_cultural_dinov2`; no se usa `transformers.pipeline` porque una llamada multitarea (clasificar y segmentar) no encaja en un unico pipeline de Hugging Face. El backbone se carga via `facebook/dinov2-small` o `torch.hub` `dinov2_vits14`.
- Latencia y throughput: clasificacion ~20 ms/imagen a 224 px y segmentacion ~1 s/imagen a 518 px (teselas) en GTX 1070.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViDINO Agriculture (este) | 22,06 M (backbone) + cabezas ligeras | 224 px clasificacion, 518 px segmentacion | Precision Tier 2 0,841 en test ruidoso | Apache-2.0 | Hugging Face (pesos) + GitHub (inferencia) |
| DINOv2 ViT-S/14 (base) | 22,06 M | 518 px nativo | No disponible en la informacion | Apache-2.0 | Hugging Face / torch.hub |
| Otros clasificadores de enfermedades de plantas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas especificas de clasificacion de enfermedades de plantas no esta disponible en la informacion proporcionada. El unico punto de referencia directo es el backbone DINOv2 ViT-S/14 del que deriva.

## Limitaciones y advertencias

- La deteccion automatica de novedad en abierto (open-set) esta fuera de alcance; el modelo no decide si una enfermedad es nueva.
- La abstencion del modo few-shot es heuristica y no esta calibrada como deteccion de novedad.
- La cabeza de segmentacion esta marcada como experimental (l2-v0.1) y puede no ser apta para produccion sin validacion adicional.
- El conjunto de test de Tier 2 tiene ruido heterogeneo (solo 15 % de imagenes limpias frente a 42,5 % en train), por lo que la precision reportada de 0,841 probablemente subestima el rendimiento en dominio limpio.
- Riesgo de confusion por conflictos de etiqueta en los datos de entrenamiento (2.509 filas con la misma foto bajo dos etiquetas).
- El modelo esta sesgado hacia los cultivos y regiones cubiertos por los datasets (arroz y durian vietnamita como fuentes primarias); su generalizacion a otros cultivos o geografias no esta documentada.
- Los idiomas soportados se limitan a etiquetas y documentacion en ingles y vietnamita; no hay soporte de castellano ni de otros idiomas en la metadata.
- El rendimiento depende de la calidad de la imagen: clases de 17C67DHC con mediana de correlacion de luminancia baja (0,19-0,31) muestran peor comportamiento.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de origen tienen licencias diversas (CC BY-4.0, Apache-2.0) y los conjuntos de evaluacion excluidos (CC BY-NC, CC BY-SA, CC BY-NC-ND) no deben usarse para entrenamiento; conviene revisar `DATA_LICENSES.md` y `NOTICE` antes de un despliegue comercial.
- El backbone debe descargarse por separado desde `facebook/dinov2-small` fijado al commit `ed25f3a31f01632728cabb09d1542f84ab7b0056`; una version distinta puede alterar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/cbc-528a/vidino_agri
- Backbone DINOv2 ViT-S/14: https://huggingface.co/facebook/dinov2-small
- Repositorio de inferencia (GitHub): `vi_cultural_dinov2` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Documentacion de diagnostico del CPT fallido: `reports/stage2_diagnosis.md` (dentro del repositorio de GitHub)
- Auditoria de licencias de datos: `DATA_LICENSES.md` (incluido en el repositorio de Hugging Face)
- Atribuciones: `NOTICE` (incluido en el repositorio de Hugging Face)

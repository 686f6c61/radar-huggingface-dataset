# dronefreak/co-dino-5scale-lsj-vit-l-lvis

## Resumen

Co-DINO 5-scale LSJ ViT-L es un detector de objetos basado en la familia Co-DETR ("DETRs with Collaborative Hybrid Assignments Training"), publicado originalmente por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab) en ICCV 2023. El checkpoint que se documenta aquí es un espejo subido por el usuario `dronefreak`, que redistribuye los mismos pesos publicados por los autores, acompanados del fichero de configuracion necesario para ejecutarlos y de una tarjeta de modelo propia. No es un release oficial.

Tecnicamente combina un backbone ViT-L (304M de parametros) con inicializacion EVA-02, un cuello que explota cinco escalas de caracteristicas, aumento de datos mediante Large Scale Jitter (LSJ) y un head DINO (DETR con consultas y entrenamiento por denoising). Sobre esa base se aplica el esquema Co-DETR: durante el entrenamiento se anaden heads auxiliares con asignacion uno-a-muchos (ATSS y un head RoI tipo Faster R-CNN) que se eliminan en inferencia, quedando unicamente el decodificador DETR con matching hungaro uno-a-uno. El modelo se preentrena en Objects365 y se afina despues en LVIS, lo que explica su rendimiento en taxonomias largas y de cola larga.

El checkpoint resulta relevante para quien necesite un detector de alta precision sobre las mas de 1200 categorias de LVIS sin entrenar desde cero, o como referencia de investigacion para reproducir resultados de Co-DETR. Su principal friccion practica es de entorno: no es un modelo de `transformers` ni de PyTorch plano, sino que requiere el stack antiguo de OpenMMLab (MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11). Ademas, la licencia de los pesos aparece como no determinada y el preentrenamiento en Objects365 tiene caracter research-only.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion (Co-DETR: DETR/DINO con matching uno-a-uno + heads auxiliares uno-a-muchos en entrenamiento), backbone ViT-L con inicializacion EVA-02, esquema multi-escala de 5 niveles, aumento LSJ |
| Parametros totales | 350,2M en inferencia (backbone ViT-L: 304M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; la entrada es imagen o video, no texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones en la informacion proporcionada; los pesos distribuidos estan en el formato nativo de PyTorch) |
| Idiomas soportados | en (etiqueta del repositorio); el modelo no procesa lenguaje natural, solo imagenes |
| Licencia | unknown / no determinada; los pesos derivan de un preentrenamiento en Objects365 marcado como research-only |
| Formato de pesos | `.pth` (checkpoint PyTorch) + fichero de configuracion `.py` de MMDetection; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Co-DETR no introduce una arquitectura nueva, sino un esquema de entrenamiento. Al decodificador DETR (aqui, un head DINO trabajando a cinco escalas) se le anaden heads auxiliares con asignacion uno-a-muchos: un head ATSS y un head de regiones tipo Faster R-CNN. Esos heads generan propuestas positivas que se reinyectan como supervision extra sobre las consultas del decodificador, lo que acelera la convergencia y mejora la precision respecto a entrenar solo con matching hungaro. En inferencia los heads auxiliares se descartan y solo se ejecuta el camino DETR, propio de la familia DETR en su formulacion original por no requerir supresion de no maximos (NMS) en el decodificador. El backbone es un ViT-L de 304M de parametros con inicializacion EVA-02, configurado a cinco escalas, y el pipeline de datos usa Large Scale Jitter (LSJ).

El entrenamiento sigue dos etapas: preentrenamiento en Objects365 y afinado posterior en LVIS, que es la taxonomia objetivo de este checkpoint. La model card distribuida esta truncada, de modo que no se especifican el numero exacto de tokens o imagenes vistas, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables en deteccion). Tampoco se documentan innovaciones de inferencia como decodificacion especulativa, que no tienen sentido en este dominio. Los detalles completos de receta deben consultarse en el paper de Co-DETR y en el fichero `co_dino_5scale_lsj_vit_large_lvis.py` incluido en el repositorio.

## Capacidades

- Deteccion de objetos en imagenes con cajas delimitadoras (bounding boxes), tarea principal del modelo.
- Cobertura de la taxonomia LVIS, con mas de 1200 categorias y enfasis en clases de cola larga (frecuencia baja).
- Deteccion multi-escala gracias al esquema de cinco niveles de caracteristicas, adecuada para objetos de tamanos muy distintos en la misma imagen.
- Robustez a variaciones de escala y encuadre por el uso de Large Scale Jitter durante el entrenamiento.
- Inferencia sobre imagen individual, carpeta de imagenes, video y webcam mediante `tools/inference.py`, con opcion de exportar resultados a JSON (`--save-json`).
- Deteccion en escenas complejas del mundo real: la propia tarjeta incluye un video de demostracion con clips de dashcam.
- Capacidades que el modelo no ofrece: generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo "thinking". No es un modelo de lenguaje ni un modelo multimodal conversacional.

## Casos de uso

- Preetiquetado de datasets de deteccion: el modelo puede generar cajas automaticas sobre imagenes nuevas para que un equipo humano solo revise y corrija, reduciendo el coste de anotacion en taxonomias amplias tipo LVIS.
- Analisis de trafico y video dashcam: con `tools/inference.py` se procesan clips de video completos y se exportan detecciones a JSON, lo que permite construir pipelines de conteo de vehiculos, peatones o senalizacion.
- Vision para retail e inventario: la granularidad de LVIS (productos, envases, utiles) permite inventariar estanterias o detectar huecos a partir de fotos de tienda, con la salvedad de que conviene validar el subconjunto de clases relevantes.
- Inspeccion industrial asistida: partiendo de este checkpoint como inicializacion y afinando con un dataset propio de defectos, se obtiene un detector especializado reutilizando el backbone EVA-02 preentrenado.
- Filtrado y mineria de imagenes a gran escala: ejecutado en batch sobre un corpus, sirve para seleccionar imagenes que contienen determinadas categorias antes de entrenar otros modelos o de construir datasets curados.
- Investigacion en deteccion de cola larga: es una referencia para reproducir y comparar resultados de Co-DETR sobre LVIS v1 val y para hacer ablaciones sobre esquemas de asignacion de etiquetas.
- Analisis forense o de contenido en pipelines internos: deteccion de objetos concretos en lotes de imagenes para triaje previo a revision humana, siempre que la licencia se resuelva antes de un uso en produccion.

## Benchmarks y rendimiento

| Benchmark | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Deteccion de objetos | LVIS v1 val | box AP | 68,0 | No (declarado por el autor; `verified: false` en el model-index) |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo COCO, Objects365 o desglose AP por rareza de clase en LVIS). No se deben extrapolar cifras distintas de la reportada.

## Requisitos de hardware

- Pesos en FP32: 350,2M de parametros equivalen a aproximadamente 1,40 GB, coherente con el tamano del repositorio (1,4 GB). En FP16 los pesos ocuparian alrededor de 0,70 GB.
- VRAM total en inferencia: no disponible como medicion publicada. Ademas del peso de los parametros hay que sumar las activaciones, que con entrada a alta resolucion y cinco escalas de caracteristicas pueden ser el termino dominante. Cualquier cifra concreta debe medirse en el entorno real.
- GPU recomendadas: no hay mediciones publicadas. Por tamano de modelo, es previsible que quepa en GPUs de consumo con 8-12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) a batch 1; para lotes grandes o resoluciones altas tiene sentido usar A100 o H100.
- Caveat de compatibilidad: el stack exige PyTorch 1.11 y MMCV-full 1.5.0. Las ruedas precompiladas de PyTorch 1.11 no incluyen kernels para arquitecturas posteriores a Ampere (sm_86), por lo que las GPU Ada (RTX 40xx, sm_89) pueden requerir compilacion propia o contenedores adaptados.
- Opciones de despliegue: MMDetection 2.25.3 con MMCV-full 1.5.0 (rama 2.x), usando el script `tools/inference.py` del fork mantenido y el entorno conda que crea `tools/setup_codetr_env.sh`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni esta soportado como modelo de `transformers` (la propia tarjeta marca `inference: false` en ese sentido).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | LVIS v1 val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dronefreak/co-dino-5scale-lsj-vit-l-lvis (este) | 350,2M en inferencia | imagen o video, 5 escalas | box AP 68,0 (reportado, sin verificar) | no determinada (research-only por el preentrenamiento en Objects365) | HuggingFace, incluye config y script de entorno |
| zongzhuofan/co-detr-vit-large-lvis (publicacion de los autores) | mismos pesos | imagen o video | no indicado en la informacion disponible (son los mismos pesos) | no determinada | HuggingFace, solo pesos sin config |
| Otros detectores de cola larga para LVIS (por ejemplo DINO o ViT-Adapter) | no disponible | imagen | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de cifras verificables de alternativas comparables, por lo que no se establece una comparacion cuantitativa. La diferencia practica frente al checkpoint de los autores es de empaquetado: el espejo anade el fichero de configuracion y un entorno reproducible.

## Limitaciones y advertencias

- Licencia no determinada: la tarjeta indica "undetermined" y la propia pagina lo etiqueta como `license: unknown`. Antes de cualquier uso comercial hay que aclarar la situacion con los autores originales.
- Preentrenamiento research-only: los pesos derivan de Objects365, marcado en la tarjeta como research-only, lo que restringe el uso comercial incluso si la licencia del checkpoint se resolviera.
- Es un espejo no oficial: no hay soporte ni garantia por parte de los autores; el propio espejo se compromete a retirarlo a peticion de estos.
- Sesgos y falsos positivos: como cualquier detector entrenado con datos de anotacion humana, hereda los sesgos de frecuencia y de anotacion de Objects365 y LVIS; las clases raras de LVIS presentan habitualmente peor AP que las frecuentes (no se aporta el desglose por rareza).
- Alucinacion en el sentido generativo: no aplica. El riesgo equivalente son detecciones espurias o cajas mal localizadas, especialmente en categorias poco representadas.
- Sin capacidades de lenguaje: no soporta prompts textuales, tool calling, agentes ni razonamiento multi-paso. La etiqueta de idioma `en` es heredada del repositorio y no implica procesamiento de texto.
- Restricciones de entorno: dependencia de versiones antiguas y fijas (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11); migrar a MMDetection 3.x no es directo y puede romper la carga del checkpoint.
- Model card truncada: la informacion publica no detalla el numero de imagenes de entrenamiento, la composicion exacta del dataset ni el desglose de metricas, lo que dificulta auditar el 68,0 de box AP.
- Metrica no verificada: el resultado de LVIS v1 val figura con `verified: false`, es decir, es una cifra declarada y no reproducida de forma independiente.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 "likes", sin senales de uso en produccion ni de mantenimiento por parte del espejo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-lsj-vit-l-lvis
- Configuracion incluida en el repositorio: https://huggingface.co/dronefreak/co-dino-5scale-lsj-vit-l-lvis/blob/main/co_dino_5scale_lsj_vit_large_lvis.py
- Poster de la demo: https://huggingface.co/dronefreak/co-dino-5scale-lsj-vit-l-lvis/resolve/main/assets/demo_banner_poster.jpg
- Video de la demo: https://huggingface.co/dronefreak/co-dino-5scale-lsj-vit-l-lvis/resolve/main/assets/demo_banner.mp4
- Checkpoint de los autores originales: https://huggingface.co/zongzhuofan/co-detr-vit-large-lvis
- Repositorio oficial: https://github.com/Sense-X/Co-DETR
- Fork mantenido con script de entorno: https://github.com/dronefreak/Co-DETR
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Paper de Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper de EVA-02 (referenciado en los tags): https://arxiv.org/abs/2303.11331
- Paper de ATSS (referenciado en los tags): https://arxiv.org/abs/1908.03195
- Dataset LVIS: https://huggingface.co/datasets/lvis

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos trataban sobre Visual Studio Code, la busqueda visual de Edge y generacion de numeros aleatorios en Java, y no se han utilizado.

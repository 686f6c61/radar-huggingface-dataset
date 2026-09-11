# dronefreak/co-dino-5scale-lsj-swin-l-3x-lvis

## Resumen

Co-DINO es un detector de objetos basado en la familia DETR, concretamente en la arquitectura DINO, entrenado con el esquema Co-DETR («DETRs with Collaborative Hybrid Assignments Training») presentado en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). Este repositorio concreto es un espejo no oficial publicado por el usuario `dronefreak`: aloja el mismo checkpoint que los autores distribuyen por Google Drive, junto con su fichero de configuracion, para facilitar descargas reproducibles y versionadas desde Hugging Face. No aporta entrenamiento ni modificacion alguna del modelo.

Se trata del checkpoint con backbone Swin-L (Swin Transformer Large) a cinco escalas de caracteristicas, con aumento de datos Large Scale Jitter (LSJ) y un calendario de entrenamiento de 36 epocas (3x) sobre el dataset LVIS v1. El modelo alcanza un box AP de 56.9 en el split de validacion de LVIS v1, segun los resultados declarados en la model index (no verificados de forma independiente). El autor declara un total de 221,5 millones de parametros en inferencia.

Su relevancia es acotada y muy especifica: no es un modelo generativo ni un LLM, sino un detector de objetos de la era MMDetection 2.x. Resulta interesante para quien necesite deteccion densa sobre un catalogo de clases amplio y de cola larga (el de LVIS, con mas de un millar de categorias), o para quien quiera reproducir los resultados de Co-DETR sin depender de una carpeta compartida de Google Drive. En contrapartida, la licencia de los pesos esta sin determinar, la model card marca `inference: false` y el repositorio no ha recibido descargas ni interacciones hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DINO: detector DETR (head DINO) con esquema de entrenamiento Co-DETR; backbone Swin Transformer Large; piramide de 5 escalas; LSJ (Large Scale Jitter) |
| Parametros totales | 221,5 M (inferencia, dato declarado por el autor del espejo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas; el peso distribuido es un `.pth` en punto flotante) |
| Idiomas soportados | No aplica a la tarea; la metadata del repositorio declara `en` para etiquetas y documentacion |
| Licencia | Desconocida / no determinada (`license: unknown`; la model card indica «Weights license: undetermined») |
| Formato de pesos | PyTorch `.pth` (checkpoint MMDetection 2.x) + fichero de configuracion `.py`; no hay safetensors ni GGUF |
| Tarea | Deteccion de objetos (pipeline `object-detection`) |
| Framework / libreria | MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11 |
| Dataset de entrenamiento | LVIS v1 |
| Calendario | 3x (36 epocas) |
| Tamano del repositorio | 3,0 GB (incluye pesos y recursos multimedia en `assets/`) |
| Modulo de evaluacion en inferencia | `eval_module='detr'` (las cabezas auxiliares solo se usan en entrenamiento) |

## Arquitectura y entrenamiento

Co-DETR no introduce una arquitectura nueva, sino un esquema de entrenamiento sobre DETR. El modelo combina la asignacion uno-a-uno del decodificador DETR (emparejamiento hungaro) con cabezas auxiliares que emplean asignacion uno-a-muchos: una cabeza ATSS y una cabeza estilo Faster R-CNN con RoI. Las propuestas positivas generadas por esas cabezas auxiliares se reinyectan en el decodificador como consultas adicionales, lo que hace mas discriminativas las caracteristicas del codificador y acelera la convergencia. En este checkpoint el campo `eval_module` esta fijado a `detr`, de modo que en inferencia unicamente se ejecuta la cabeza de consultas Co-DINO y las cabezas auxiliares quedan inactivas.

El backbone es un Swin Transformer Large, que produce una piramide de cinco escalas; el pipeline de datos usa Large Scale Jitter, y el entrenamiento se extiende durante 36 epocas (calendario «3x») sobre LVIS v1. No se documentan en la informacion disponible el numero exacto de tokens de imagen vistos, la composicion detallada del dataset mas alla de LVIS, ni fases de RLHF o DPO (no aplicables a un detector). El fichero de configuracion incluido, `co_dino_5scale_lsj_swin_large_3x_lvis.py`, es identico al del repositorio oficial en `projects/configs/co_dino/`.

## Capacidades

- Deteccion de objetos en imagenes individuales, carpetas de imagenes, video y flujo de webcam mediante la herramienta `tools/inference.py` del fork mantenido.
- Deteccion densa sobre un catalogo de clases amplio y de cola larga, gracias al entrenamiento sobre LVIS v1 (mas de un millar de categorias, muchas con pocos ejemplos).
- Localizacion con cajas delimitadoras y puntuaciones de confianza; exportacion de resultados a JSON estructurado con la opcion `--save-json`.
- Capacidad de servir como base preentrenada para ajuste fino en dominios especificos (la familia Co-DETR incluye checkpoints equivalentes entrenados sobre COCO).
- Inferencia sobre video: la model card incluye una demostracion en video con detecciones sobre dos clips de dashcam.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni comprension del lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: las etiquetas de clase estan en ingles y el modelo no procesa lenguaje natural.
- No dispone de modo «thinking», ni de entrada o salida de audio, ni de descripcion visual en lenguaje natural (no es un modelo vision-language).

## Casos de uso

- Inventario y analitica de lineal en comercio minorista: el modelo puede detectar grandes volumenes de categorias de producto simultaneamente, algo que resulta util cuando el catalogo es amplio y muchas clases tienen pocos ejemplos de entrenamiento, como ocurre en LVIS.
- Pre-etiquetado de datasets de vision: generar cajas automaticas con `--save-json` para despues revisarlas y corregirlas por anotadores humanos, reduciendo el coste de construir un dataset propio de deteccion.
- Analisis de trafico y video de salpicadero: el propio repositorio incluye una demostracion con clips de dashcam; el pipeline acepta video y webcam, lo que permite extraer detecciones cuadro a cuadro para conteo de vehiculos o analisis de escenas.
- Base preentrenada para ajuste fino en dominios verticales (industrial, agricola, inspeccion): partiendo del checkpoint LVIS se puede reentrenar la cabeza sobre un dataset propio con MMDetection 2.x, aprovechando que el backbone Swin-L ya viene entrenado.
- Percepcion en robotica o conduccion asistida en fase de prototipo: el modelo ofrece localizacion a cinco escalas, lo que ayuda con objetos de tamanos muy dispares en escenas complejas, siempre que se asuma el coste de latencia de un backbone Swin-L.
- Enriquecimiento de pipelines de datos batch: al ser invocable por linea de comandos sobre carpetas completas de imagenes, encaja en trabajos programados que procesan lotes nocturnos y escriben resultados en JSON para su posterior indexacion.
- Reproducibilidad de resultados academicos: util como artefacto estable y con checksum para replicar los numeros publicados de Co-DINO Swin-L en LVIS sin depender de una carpeta compartida de Google Drive.

## Benchmarks y rendimiento

| Modelo | Dataset | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| co_dino_5scale_lsj_swin_large_3x_lvis | LVIS v1 | val | box AP | 56,9 | No (declarado por el autor) |

No se han publicado otros resultados de benchmarks en la informacion disponible. La model index del repositorio marca el valor como `verified: false`, por lo que debe tratarse como una cifra declarada, no reproducida de forma independiente.

## Requisitos de hardware

- Peso del checkpoint: aproximadamente 886 MB en punto flotante de 32 bits (221,5 M de parametros x 4 bytes); unos 443 MB si se convierte a FP16. El repositorio ocupa 3,0 GB porque incluye recursos multimedia en `assets/`.
- VRAM estimada: no declarada por el autor. La memoria real depende de la resolucion de entrada y del numero de escalas procesadas simultaneamente; los pipelines LSJ de Co-DETR suelen operar a resoluciones altas, por lo que el consumo de activaciones es la partida dominante, no los pesos.
- GPU recomendadas: no hay una lista oficial. Para entrenamiento o ajuste fino de un backbone Swin-L a cinco escalas es razonable partir de A100 o H100; para inferencia en produccion, una GPU de gama alta con suficiente VRAM para la resolucion objetivo.
- Cabe en GPU de consumo: si, para inferencia a resoluciones moderadas y en FP16, en tarjetas con 12 GB o mas de VRAM (por ejemplo RTX 3060 de 12 GB o RTX 4090). No se dispone de mediciones confirmadas para este checkpoint concreto.
- Opciones de despliegue: MMDetection 2.x con MMCV-full 1.5.0 y PyTorch 1.11; el fork mantenido incluye un script de configuracion de entorno (`tools/setup_codetr_env.sh`) que crea un entorno conda validado. La exportacion a ONNX o TensorRT requeriria usar MMDeploy. No hay soporte en `transformers`, vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni un transformer de texto.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset de entrenamiento | Metrica principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Co-DINO 5scale LSJ Swin-L 3x (este checkpoint) | 221,5 M | LVIS v1 | box AP 56,9 en LVIS v1 val | Desconocida | Espejo no oficial en Hugging Face |
| `dronefreak/co-dino-5scale-lsj-swin-l-3x-coco` | Mismo backbone Swin-L (cifra exacta no declarada en su model card) | COCO | No disponible en la informacion consultada | Desconocida | Espejo no oficial en Hugging Face |
| Checkpoints Co-DETR ViT-L de los autores | No disponible | COCO y otros | No disponible para estos pesos concretos | No disponible | Publicados por los autores en Hugging Face |
| Variantes Co-DINO de la familia Co-DETR | No disponible | COCO | Hasta 66,0 AP en COCO test-dev (dato de la documentacion de Co-DETR, no de este checkpoint) | No disponible | Repositorio oficial Sense-X/Co-DETR y Google Drive |

La diferencia principal entre las dos primeras filas es el dataset de entrenamiento (LVIS frente a COCO) manteniendo backbone y receta; no se dispone de cifras comparables publicadas para ambos en la misma metrica. La cifra de 66,0 AP en COCO test-dev corresponde a la mejor variante de la familia Co-DINO segun la documentacion del proyecto, no a este checkpoint de LVIS.

## Limitaciones y advertencias

- Licencia sin determinar: la model card indica explicitamente que la licencia de los pesos esta «undetermined». No debe asumirse uso comercial libre sin aclararlo antes con los autores originales.
- Es un espejo no oficial: el autor del repositorio no reclama contribucion alguna sobre la investigacion ni sobre el entrenamiento, y se compromete a retirarlo a peticion de los autores.
- La model card declara `inference: false`; el uso directo con `transformers` o con APIs estandar no esta soportado.
- Dependencia de un stack antiguo: MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. Integrarlo en entornos modernos puede exigir un entorno aislado y añade deuda tecnica.
- Riesgo de alucinacion: en un detector este riesgo se manifiesta como falsos positivos y cajas mal localizadas, especialmente en clases de cola larga con pocos ejemplos de entrenamiento. Incluye ademas el sesgo de la asignacion hungara del decodificador, que puede producir solapamientos con clases muy escasas.
- Sesgos del dataset: LVIS deriva en buena parte de imagenes de COCO/Flickr, con sobrerrepresentacion de escenas cotidianas de paises occidentales y de determinadas categorias; el rendimiento puede degradarse notablemente en dominios visuales alejados de esa distribucion.
- Resultado no verificado: el 56,9 de box AP figura como `verified: false` en la model index y no se ha reproducido de forma independiente en esta ficha.
- Coste computacional: un backbone Swin-L a cinco escalas con LSJ es notablemente mas pesado en inferencia que detectores mas ligeros, lo que limita su uso en tiempo real sobre hardware modesto.
- Idioma: las categorias estan en ingles; no hay soporte de consultas en lenguaje natural ni de multiples idiomas.
- Sin validacion comunitaria: el repositorio registra cero descargas y cero «likes» en el momento de la consulta, por lo que no hay senales de uso en produccion por parte de terceros.
- El repositorio de 3,0 GB incluye material multimedia de demostracion; conviene descargar unicamente el `.pth` y el `.py` de configuracion si solo se necesita el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/co-dino-5scale-lsj-swin-l-3x-lvis
- Espejo hermano entrenado sobre COCO: https://huggingface.co/dronefreak/co-dino-5scale-lsj-swin-l-3x-coco
- Fichero de configuracion incluido: https://huggingface.co/dronefreak/co-dino-5scale-lsj-swin-l-3x-lvis/blob/main/co_dino_5scale_lsj_swin_large_3x_lvis.py
- Repositorio oficial Co-DETR (Sense-X): https://github.com/Sense-X/Co-DETR
- Fork mantenido por el autor del espejo: https://github.com/dronefreak/Co-DETR
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Paper de Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Referencia adicional declarada en las etiquetas del repositorio: https://arxiv.org/abs/1908.03195
- Documentacion de los modelos Co-DINO en Co-DETR: https://deepwiki.com/Sense-X/Co-DETR/3.2-co-dino-models

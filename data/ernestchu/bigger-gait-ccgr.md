# ernestchu/bigger-gait-ccgr

## Resumen

BiggerGait es un modelo de reconocimiento de marcha (gait recognition) que aprovecha representaciones por capas de un modelo de visión de gran escala. Este repositorio, `ernestchu/bigger-gait-ccgr`, es una reimplementación de inferencia autocontenida del modelo BiggerGait presentado en NeurIPS 2025, con un backbone DINOv2-S congelado y entrenado sobre el dataset CCGR (Cross-Covariate Gait Recognition, AAAI 2024). El autor es el usuario de HuggingFace `ernestchu`.

El problema que resuelve es la identificación biométrica de personas a partir de secuencias de vídeo RGB de su forma de caminar, sin necesidad de siluetas binarias ni de alineación previa. La entrada es una secuencia de recortes RGB de una persona caminando (configuración de 84 fotogramas, resolución interna de 448x224) y la salida es un embedding de `[256, 192]`: un descriptor de 256 dimensiones por cada una de las 32 partes horizontales y cada uno de los 6 grupos de capas de DINOv2. La comparación entre secuencias se hace con distancia euclídea promediada sobre las 192 partes.

Es relevante ahora porque demuestra que un backbone ViT congelado, preentrenado con autosupervisión sobre imágenes naturales, puede reutilizarse como extractor de características de marcha con resultados competitivos en un benchmark de covariables cruzadas, y porque el repositorio elimina la dependencia del framework OpenGait completo y de una descarga separada de DINOv2. No obstante, el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone DINOv2-S (ViT-S/14) congelado + rama de mascara (WiMask) + cabezas de marcha tipo GaitBase; representaciones por capas con pooling horizontal en 32 partes x 6 grupos de capas |
| Parametros totales | No disponible en la informacion proporcionada. El backbone DINOv2-S (ViT-S/14) ronda los 21 M de parametros; no se documenta el total con las cabezas de marcha |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable. Procesa secuencias de 84 fotogramas RGB por muestra (configuracion "84Frame30", sin alineacion) |
| Tipos de cuantizacion | fp16 documentado (`torch.autocast("cuda")`); no se documentan GGUF, INT8 ni otras cuantizaciones |
| Idiomas soportados | No aplicable (modelo de vision, no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint `.pt` de PyTorch (carga con `strict=True`), almacenado con Git LFS. Tamano del repo: 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura combina un ViT-S/14 de DINOv2 congelado con una rama de enmascaramiento y dos cabezas de marcha compartidas (una de ellas con 2B y 6G segun la nomenclatura del checkpoint). El nombre del fichero describe la configuracion completa: `71...` no aplica, pero si los tokens `84Frame30` (84 fotogramas), `448224` (resolucion interna 448x224), `6432HPP32` (pooling horizontal particionado), `NoAlign` (sin alineacion de silueta), `Sep12B`, `WiMask` (con mascara), `Share_2B_6G` y `30000` iteraciones de entrenamiento. El preprocesamiento de inferencia reescalado a altura 256 manteniendo la relacion de aspecto, relleno o recorte centrado a anchura 128 y normalizacion ImageNet; el modelo hace el sobremuestreo a 448x224 internamente.

El checkpoint fue entrenado sobre el dataset CCGR y procede sin modificaciones de `opengait/OpenGait`. Un detalle tecnico destacable es que la implementacion de DINOv2 incluida (`biggergait/dinov2.py`) reproduce exactamente las salidas por capa de `transformers.Dinov2Model` a 448x224 con los pesos del checkpoint, que son identicos a los de `facebook/dinov2-small`. Por tanto, no hay fine-tuning del backbone: toda la adaptacion a la tarea de marcha recae en la rama de mascara y las cabezas. El autor advierte explicitamente de que el preprocesamiento usado durante el entrenamiento no esta documentado y que la receta incluida es la de `OpenGait` (`datasets/pretreatment_rgb.py`) aplicada a los fotogramas crudos, elegida por haber dado el mejor resultado entre las variantes probadas.

## Capacidades

- Extraccion de embeddings de marcha: genera un descriptor de `[256, 192]` por secuencia de 84 fotogramas RGB de una persona caminando.
- Reconocimiento e identificacion biometrica: comparacion de secuencias mediante distancia euclidea promediada sobre las 192 partes (`pairwise_distance`), util para verificacion (misma persona o no) e identificacion (ranking contra una galeria).
- Funcionamiento sin siluetas ni alineacion: consume recortes RGB crudos, evitando el paso de segmentacion que requieren las canalizaciones clasicas de reconocimiento de marcha.
- Robustez ante covariables: el entrenamiento en CCGR esta disenado explicitamente para escenarios de covariables cruzadas (cambios de vista, indumentaria, transporte de objetos y condiciones de captura).
- Inferencia autocontenida: el checkpoint incluye backbone, rama de mascara y cabezas, por lo que no requiere descargar DINOv2 por separado ni instalar OpenGait.
- Ejecucion en GPU y CPU: el smoke test esta preparado para ambos dispositivos (`--device cpu`).
- No ofrece generacion de texto, tool calling, capacidades de agente, vision general ni audio. Es un modelo especializado de vision para una unica tarea.

## Casos de uso

- Verificacion biometrica en control de accesos: dado un par de secuencias de la misma persona en momentos distintos, el modelo calcula la distancia entre embeddings y un umbral decide si se concede el acceso. Es adecuado porque no necesita cooperacion del sujeto ni siluetas segmentadas.
- Identificacion en galeria de videovigilancia: se indexan los embeddings de una galeria de identidades conocidas y se consulta con nuevas secuencias, devolviendo un ranking por distancia. El protocolo CCGR-MINI incluido en el repositorio es exactamente esta tarea.
- Analitica de aforo y flujos peatonales: extraer embeddings de peatones en distintas camaras para reidentificar trayectorias sin depender de reconocimiento facial, reduciendo problemas de privacidad al trabajar con la forma de caminar.
- Autenticacion continua en dispositivos o zonas restringidas: embeder secuencias cortas de la persona en movimiento y comprobar periodicamente la similitud contra un embedding de referencia.
- Investigacion en biometria y evaluacion de sesgos: el modelo sirve como linea base reproducible para estudiar el efecto de covariables (vista, ropa, calzado) sobre el rendimiento de reconocimiento.
- Prototipado de pipelines de reidentificacion de personas (ReID) combinando caracteristicas de marcha con caracteristicas de apariencia, usando el embedding de 192 partes como descriptor complementario.
- Docencia y reproduccion de resultados: el repositorio incluye un smoke test de 36 secuencias con embeddings de referencia y una tolerancia verificable, lo que permite validar una instalacion en pocos minutos en CPU.

## Benchmarks y rendimiento

Resultados publicados en la model card del repositorio:

| Protocolo | Rank-1 | Rank-5 | Rank-10 | mAP | mINP |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Smoke test (36 secuencias, 6 identidades) | 95,83 | 100,00 | 100,00 | 96,71 | 96,76 |
| CCGR-MINI parcial (71 de 400 identidades de test, 3448 probe y 140 gallery, fp16, RTX 4090, ~7 min) | 90,81 | 97,19 | 98,49 | 89,27 | 84,92 |

Advertencias del propio autor: los numeros del CCGR-MINI parcial no son comparables con los resultados publicados sobre el benchmark completo, porque la galeria aqui es aproximadamente 5 veces mas pequena, lo que facilita la recuperacion. No se han publicado en la informacion disponible resultados sobre el benchmark CCGR-MINI completo ni comparaciones con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Como referencia orientativa no oficial, un ViT-S/14 con backbone de ~21 M de parametros y secuencias de 84 fotogramas a 448x224 en fp16 deberia manejarse en un rango de pocos GB de VRAM, dependiendo del tamano de lote; no hay medicion publicada.
- GPU recomendadas: el autor reporta la evaluacion completa de las 3588 secuencias del subconjunto parcial en una unica RTX 4090 en fp16 en aproximadamente 7 minutos, es decir, del orden de 0,12 segundos por secuencia. Cabe tambien en GPUs consumer de gama media; no se documentan pruebas en A100 o H100.
- CPU: el smoke test de 36 secuencias tarda "unos minutos" en CPU, segun el autor, y unos segundos en GPU. El modelo es viable en CPU para volumenes pequenos.
- Almacenamiento: el repositorio ocupa 0,3 GB, incluyendo el checkpoint y 36 videos de ejemplo almacenados con Git LFS.
- Opciones de despliegue: PyTorch nativo, entorno gestionado con `uv` (`uv sync`). El repositorio se instala como modulo `biggergait` y se usa desde Python (`BiggerGait.from_checkpoint(...)`, `load_video`, `pairwise_distance`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de vision de este tipo. No se documenta exportacion a ONNX, TensorRT o TorchScript.
- Latencia y throughput: unicamente la cifra derivada anteriormente (~0,12 s por secuencia en RTX 4090 con fp16 para secuencias de 84 fotogramas). No hay datos de throughput por lotes.
- Reproducibilidad: el smoke test reporta similitud coseno minima y media de 1.00000 frente a los embeddings de referencia, lo que indica que la carga del checkpoint y el preprocesamiento son exactos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Empaquetado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BiggerGait (este repositorio, `ernestchu/bigger-gait-ccgr`) | DINOv2-S congelado + rama de mascara + cabezas de marcha | No disponible | 84 fotogramas RGB, 448x224 interno, sin alineacion | Autocontenido; no requiere OpenGait ni descarga de DINOv2 | No disponible | HuggingFace, 0 descargas, 0 likes |
| BiggerGait original (`opengait/OpenGait`) | Identica (mismo checkpoint sin modificar) | No disponible | No disponible en la informacion | Requiere el framework OpenGait | No disponible | HuggingFace, dentro del repo de OpenGait |
| Otros metodos de reconocimiento de marcha basados en siluetas o CNN (por ejemplo GaitBase, GaitSet, GaitGL) | CNN sobre siluetas segmentadas | No disponible | Siluetas binarias alineadas | Requiere pipelines de segmentacion y alineacion | No disponible | No disponible |

Los datos cuantitativos de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que no se puede establecer una comparacion numerica. La unica diferencia verificable entre las dos primeras filas es el empaquetado: los pesos son identicos.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica ninguna licencia para el repositorio ni para los pesos, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo serio para produccion.
- Procedencia de los datos: el checkpoint deriva del dataset CCGR y los videos de ejemplo de `sample_data/` siguen sujetos a los terminos de ese dataset, que pueden imponer restricciones adicionales.
- Preprocesamiento no documentado: el autor afirma explicitamente que la receta de preprocesamiento usada en el entrenamiento no esta documentada. La receta incluida es una aproximacion (la de OpenGait aplicada a fotogramas crudos) que resulto ser la mejor de las variantes probadas; eliminar el borde negro de CCGR-MINI o ignorar la relacion de aspecto costo entre 1 y 3 puntos de Rank-1.
- Metricas no comparables: los resultados de CCGR-MINI publicados corresponden a un subconjunto parcial (71 de 400 identidades de test) con una galeria unas 5 veces menor que la oficial, lo que infla las metricas de recuperacion.
- Ausencia de validacion externa: 0 descargas y 0 likes. No hay evidencia de uso independiente ni de replicacion fuera del autor.
- Riesgo de falsos positivos y falsos negativos: aunque no es un modelo generativo y no "alucina" texto, en una tarea biometrica los errores se traducen en identificaciones incorrectas, con consecuencias de privacidad y seguridad. No hay tasas FAR/FRR publicadas.
- Sesgos potenciales por covariables: el rendimiento puede degradarse ante cambios de vista, ropa, calzado, transporte de objetos u oclusiones; el dataset CCGR esta disenado precisamente para medir ese efecto, pero no se publican desgloses por covariable en esta informacion.
- Dependencia de la deteccion previa: el modelo asume recortes RGB ya centrados en una unica persona caminando; no incluye deteccion ni seguimiento, por lo que la calidad del recorte condiciona el resultado.
- Restricciones regulatorias: el reconocimiento biometrico de marcha esta sujeto a normativas de proteccion de datos (por ejemplo, el RGPD en la Union Europea), que exigen base legal y evaluacion de impacto.
- Ambito de uso muy estrecho: no sirve para generacion de texto, codigo, vision general, agentes ni ninguna tarea fuera del reconocimiento de marcha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ernestchu/bigger-gait-ccgr
- Checkpoint original en OpenGait: https://huggingface.co/opengait/OpenGait/blob/main/CCGR/BiggerGait__Dinov2/BiggerGait__Dinov2_Group/BiggerGait__SmallDINOv2_Gaitbase_84Frame30_448224_6432HPP32_NoAlign_Sep12B_WiMask_Share_2B_6G-30000.pt
- Paper de BiggerGait (NeurIPS 2025): https://arxiv.org/abs/2505.18132
- Codigo de BiggerGait / OpenGait: https://github.com/ShiqiYu/OpenGait
- Paper de CCGR (AAAI 2024): https://arxiv.org/abs/2312.14404
- Dataset CCGR: https://github.com/ShinanZou/CCGR
- Rama CCGR-Benchmark del dataset: https://github.com/ShinanZou/CCGR/tree/CCGR-Benchmark
- Pesos originales de DINOv2-S: https://huggingface.co/facebook/dinov2-small
- Gestor de entornos uv: https://docs.astral.sh/uv/

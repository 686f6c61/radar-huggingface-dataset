# chris-mrn/scoreclr-resnet18

## Resumen

ScoreCLR es un metodo de aprendizaje autosupervisado (self-supervised learning) para representaciones visuales que sustituye la repulsion contrastiva de SimCLR por la puntuacion (score) de la distribucion latente, aprendida mediante una pequena red de denoising score matching entrenada de forma conjunta con el encoder. El modelo publicado bajo el identificador `chris-mrn/scoreclr-resnet18` es el conjunto de checkpoints de referencia del articulo "Contrastive latent representation learning with denoising score matching" (Marouani, Bartosh y Naesseth, 2026), desarrollado por Christopher Marouani y colaboradores.

El repositorio contiene seis checkpoints: tres semillas para CIFAR-10 y tres semillas para ImageNet-100, todos con backbone ResNet-18. La innovacion principal es de eficiencia: la repulsion entre muestras pasa de coste `O(B²)` en el tamano de lote a `O(B)`, lo que reduce el coste computacional del termino contrastivo sin renunciar a la calidad de las representaciones. Los resultados publicados muestran un rendimiento en linear probe practicamente identico a SimCLR en CIFAR-10 (88,87 % frente a 89,26 %) y ligeramente inferior en ImageNet-100 (71,23 % frente a 72,39 %), pero con un rango efectivo de las representaciones (RankMe) mucho mayor: 229/256 y 244/256 frente a 96 y 143 de SimCLR.

Es importante subrayar que no se trata de un encoder de proposito general, sino de checkpoints de investigacion a pequena escala (ResNet-18, entradas de 32×32 en CIFAR-10, 100 clases en ImageNet-100) liberados para reproducir los resultados del articulo. Su interes es metodologico y experimental, no de despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (backbone convolucional) + proyector MLP 2048/256 + red de score MLP condicionada por FiLM |
| Parametros totales | no disponible (el unico dato publicado es que la red de score tiene 0,28 M de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entradas de imagen 32×32 en CIFAR-10; tamano de recorte configurable en ImageNet-100) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` por carpeta de ejecucion) |

## Arquitectura y entrenamiento

El modulo ScoreCLR se compone de tres piezas: un encoder con backbone ResNet-18 que produce caracteristicas de 512 dimensiones, un proyector MLP 2048/256 que genera codigos latentes `z` de 256 dimensiones, y una red de score que predice el ruido `ε̂(z_t, σ)` sobre los codigos ruidosos, condicionada por FiLM sobre `log σ` y con solo 0,28 M de parametros. Ademas incluye un clasificador lineal en linea que se usa unicamente para monitorizacion durante el entrenamiento, no como sonda lineal del articulo. La repulsion contrastiva de SimCLR se reemplaza por el score de la distribucion latente estimado con denoising score matching, lo que reduce el coste del termino de repulsion de `O(B²)` a `O(B)` respecto al tamano de lote.

El entrenamiento se realizo sobre dos conjuntos: CIFAR-10 durante 1000 epocas con lote de 128, y ImageNet-100 durante 400 epocas con lote efectivo de 2×128. La variante de CIFAR-10 usa un stem especifico (convolucion 3×3 sin max-pool) para entradas de 32×32. Se publican tres semillas por conjunto de datos (1, 2 y 3), que son las ejecuciones detras de las tablas del articulo. La normalizacion de entrada usa las estadisticas de CIFAR-10 para los modelos de CIFAR-10 y las de ImageNet para los de ImageNet-100, gestionadas por `eval_transforms` del paquete de codigo. ImageNet-100 corresponde al subconjunto de 100 clases de CMC, entrenado y evaluado sobre la copia `clane9/imagenet-100`.

## Capacidades

- Extraccion de caracteristicas visuales: el backbone produce vectores de 512 dimensiones a partir de imagenes RGB, pensados para sonda lineal y kNN.
- Codificacion latente: el proyector genera codigos de 256 dimensiones sobre los que opera la red de score.
- Estimacion de score: la red de score predice el ruido de codigos latentes ruidosos a un nivel `σ` dado, lo que permite muestrear o puntuar la distribucion latente.
- Aprendizaje de representaciones autosupervisado: no requiere etiquetas durante el preentrenamiento.
- Clasificacion lineal en linea: incluye un clasificador lineal de monitorizacion (no es la sonda lineal del articulo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues, de vision-lenguaje, de audio ni modo de razonamiento extendido.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar los checkpoints por semilla y dataset para verificar las cifras de sonda lineal y kNN publicadas en el articulo, usando `results.json` y `config.json` incluidos en cada carpeta.
- Estudio del rango efectivo de representaciones: comparar el RankMe de los codigos `z` (229/256 en CIFAR-10, 244/256 en ImageNet-100) frente a SimCLR (96 y 143) para analizar el colapso dimensional en metodos contrastivos.
- Benchmark de metodos autosupervisados a pequena escala: usar CIFAR-10 e ImageNet-100 como banco de pruebas controlado para comparar variantes de score matching frente a contrastivas clasicas con el mismo recetario (AdamW, proyector 2048/256).
- Docencia y experimentacion: servir como ejemplo minimo y reproducible de denoising score matching aplicado a representaciones latentes, con un paquete de codigo instalable y configuraciones YAML por dataset.
- Extraccion de caracteristicas para clasificacion de imagenes de bajo coste: con sonda lineal o kNN sobre las caracteristicas de 512 dimensiones en dominios cercanos a CIFAR-10 o ImageNet-100 (resolucion baja, 100 clases o menos), siempre como prototipo y no como encoder de proposito general.
- Investigacion sobre eficiencia de lote: evaluar el ahorro de `O(B²)` a `O(B)` en el termino de repulsion en entornos con memoria limitada, comparando curvas de entrenamiento frente a SimCLR con el mismo presupuesto.
- Base para ablaciones de la red de score: modificar el tamano o el condicionamiento FiLM de la red de score (0,28 M de parametros) y medir el impacto en la sonda lineal, partiendo de los checkpoints publicados.

## Benchmarks y rendimiento

Resultados publicados en la model card (top-1 en validacion, %), sobre las caracteristicas del backbone:

| Metrica | Semilla 1 | Semilla 2 | Semilla 3 | Media ± desv. |
|---|---|---|---|---|
| CIFAR-10 linear | 89,38 | 88,58 | 88,66 | 88,87 ± 0,44 |
| CIFAR-10 kNN | 88,41 | 88,24 | 88,15 | 88,27 ± 0,13 |
| CIFAR-10 RankMe (z) | 229,5 | 229,3 | 229,3 | 229 / 256 |
| ImageNet-100 linear | 71,22 | 71,18 | 71,30 | 71,23 ± 0,06 |
| ImageNet-100 kNN | 66,50 | 65,78 | 65,88 | 66,05 ± 0,39 |
| ImageNet-100 RankMe (z) | 243,7 | 243,6 | 243,6 | 244 / 256 |

Comparacion con SimCLR bajo el mismo recetario (AdamW, proyector 2048/256), segun la model card:

| Metodo | CIFAR-10 linear | ImageNet-100 linear | RankMe CIFAR-10 | RankMe ImageNet-100 |
|---|---|---|---|---|
| ScoreCLR | 88,87 ± 0,44 | 71,23 ± 0,06 | 229 / 256 | 244 / 256 |
| SimCLR | 89,26 ± 0,38 | 72,39 ± 0,62 | 96 | 143 |

No se han publicado en la informacion disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, que no aplican a un modelo de vision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,3 GB e incluye seis checkpoints, por lo que cada checkpoint individual es de decenas de MB y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para inferencia; el modelo es un ResNet-18 con entradas de 32×32 (CIFAR-10) o recortes pequenos (ImageNet-100), por lo que incluso GPU de gama baja o CPU son viables para lotes pequenos.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente; tambien es viable en CPU para inferencia puntual.
- Opciones de despliegue: el paquete oficial `scoreclr` (instalable desde `github.com/chris-mrn/ScoreCLR_code`) con PyTorch y safetensors; no se publican integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Backbone | Dataset de preentrenamiento | Linear probe | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScoreCLR (este) | ResNet-18 | CIFAR-10 / ImageNet-100 | 88,87 / 71,23 | MIT | Hugging Face, 6 checkpoints |
| SimCLR (mismo recetario) | ResNet-18 | CIFAR-10 / ImageNet-100 | 89,26 / 72,39 | no disponible en la informacion | Referencia en el README del codigo |
| Encoders de proposito general (p. ej. CLIP, DINOv2) | ViT / ResNet de mayor escala | Datasets web a gran escala | no disponible | no disponible | Amplia, pero no comparables en escala |

La comparacion relevante es frente a SimCLR con identico recetario, unica alternativa con cifras publicadas en la informacion disponible. No se dispone de datos de otros metodos autosupervisados con los que contrastar en igualdad de condiciones.

## Limitaciones y advertencias

- Modelo de investigacion a pequena escala: ResNet-18 entrenado en CIFAR-10 (32×32) e ImageNet-100 (100 clases); no es un encoder de proposito general y su generalizacion fuera de esos dominios no esta validada.
- Rendimiento ligeramente inferior a SimCLR en linear probe: 88,87 frente a 89,26 en CIFAR-10 y 71,23 frente a 72,39 en ImageNet-100; la ventaja declarada esta en el rango efectivo y en el coste `O(B)` de la repulsion, no en la precision bruta.
- Sin datos publicados de sesgos: la model card no documenta analisis de sesgo, robustez ni comportamiento ante dominios distintos de los de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero no hay evaluacion de calibracion de las caracteristicas ni del score fuera de la distribucion de entrenamiento.
- Limitaciones de resolucion e idioma: entradas de baja resolucion en la variante CIFAR-10 (32×32 con stem especifico); sin capacidades linguisticas.
- Licencia MIT: permite uso comercial segun los terminos de la licencia, pero el autor advierte explicitamente que los checkpoints se liberan para reproducir el articulo, no como encoders de proposito general.
- Dependencia del paquete de codigo: la carga correcta requiere `scoreclr`, `huggingface_hub` y `safetensors`, y el uso de `eval_transforms` para aplicar la normalizacion correcta segun el dataset.
- Sin cuantizaciones publicadas: no hay variantes GGUF ni pesos reducidos, lo que limita su uso fuera de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chris-mrn/scoreclr-resnet18
- Codigo: https://github.com/chris-mrn/ScoreCLR_code
- Articulo: https://arxiv.org/abs/2611.18469
- Dataset ImageNet-100 (CMC): https://huggingface.co/datasets/clane9/imagenet-100
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10

# AnonUser123AI/Sepia

## Resumen

SEPIA es un modelo fundacional de extraccion de caracteristicas visuales disenado especificamente para imagenes de inmunohistoquimica (IHC). Lo desarrolla el usuario AnonUser123AI y se distribuye en Hugging Face bajo el pipeline `image-feature-extraction`. A diferencia de los codificadores visuales genericos aplicados a patologia, SEPIA incorpora la identidad del marcador proteico como entrada: combina representaciones separadas de hematoxilina (H) y DAB con embeddings de proteinas generados por ESM, de modo que el modelo "sabe" que marcador esta viendo y puede condicionar la representacion del tejido a esa informacion.

Arquitectonicamente es un Vision Transformer ViT-L/14 inicializado desde Hibou-L y entrenado con una tarea de inpainting H/D. Produce una representacion de imagen de 1024 dimensiones mas representaciones separadas de parches H y D. El modelo opera sobre teselas RGB de 224x224 pixeles, que es el tamano estandar en pipelines de patologia computacional.

Su relevancia radica en que supera a alternativas consolidadas como UNI, UNI2-h, Hibou, StainNet y PathoDuet en el conjunto de 44 tareas IHC evaluadas por los autores, con un rango medio de 2,66 frente a 3,09 del siguiente mejor. Es relevante para investigadores que necesitan representaciones sensibles al marcador en lugar de descriptores visuales agnosticos al tipo de tincion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-L/14 (inicializado desde Hibou-L) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, teselas de 224x224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa imagenes) |
| Licencia | no disponible |
| Formato de pesos | sepia.pth (PyTorch) |

## Arquitectura y entrenamiento

SEPIA es un transformer de vision ViT-L/14 con dimension de embedding de 1024. La innovacion central es el tratamiento separado de las dos tinciones de la IHC: cada tesela RGB se descompone en una renderizacion solo de hematoxilina y otra solo de DAB, que se normalizan con las estadisticas del checkpoint. Ambas renderizaciones comparten la proyeccion de parches y generan tokens H y D emparejados. Un embedding de proteina ESM, proyectado, condiciona los tokens D para informar al modelo de la identidad del marcador teñido. El codificador devuelve una representacion de imagen de 1024 dimensiones y representaciones de parche H y D por separado.

El entrenamiento parte de los pesos de Hibou-L y utiliza una tarea de inpainting H/D. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables en un modelo de vision de este tipo). Tampoco se especifica el numero de tokens o imagenes vistas durante el preentrenamiento.

## Capacidades

- Extraccion de caracteristicas visuales de imagenes de inmunohistoquimica con representacion de 1024 dimensiones.
- Condicionamiento por identidad de marcador proteico mediante embeddings ESM, lo que permite distinguir respuestas segun el marcador teñido.
- Representaciones separadas de hematoxilina y DAB, utiles para tareas de localizacion de tincion.
- Generalizacion a marcadores no vistos en el entrenamiento (la tarea pan-cancer DAB location usa 13 marcadores held-out).
- Aplicable como backbone congelado para clasificacion y regresion sobre embeddings (evaluado en tareas de subtipo histologico, subtipo molecular, estado diabetico, etc.).
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision general, audio ni modo thinking.

## Casos de uso

- Clasificacion de subtipos histologicos de cancer de mama: usar los embeddings de 1024 dimensiones como entrada a un clasificador lineal o MLP ligero; SEPIA alcanza 61,6% de AUROC en subtipo histologico, por encima de UNI2-h y Hibou.
- Distincion luminal vs no luminal en cancer de mama: el condicionamiento por marcador ayuda a discriminar perfiles moleculares; SEPIA obtiene 89,4% de AUROC en esta tarea.
- Subtipificacion HANS en linfoma B difuso de celula grande (DLBCL): util para pipelines de investigacion que requieren distinguir subtipos con marcadores IHC; SEPIA lidera con 90,9% de AUROC.
- Deteccion de doble expresor en DLBCL: escenario en el que la identidad del marcador importa; SEPIA alcanza 91,9% de AUROC, por encima de StainNet (90,2%) y Hibou (89,1%).
- Cuantificacion de CD8 intratumoral en cancer de pulmon no microcitico (NSCLC): SEPIA obtiene 83,6% de AUROC, practicamente empatado con UNI2-h (83,7%), adecuado para inmunofenotipado asistido.
- Localizacion pan-cancer de DAB con marcadores no vistos: el modelo generaliza a 13 marcadores held-out con 96,4% de AUROC, lo que lo hace util para construir pipelines robustos ante nuevos marcadores sin reentrenamiento.
- Analisis de estado diabetico en tejido tipo 2: SEPIA logra 89,3% de AUROC, muy por encima del resto (Hibou 73,1%, UNI 76,1%), lo que sugiere utilidad en estudios metabolicos sobre biopsias.

## Benchmarks y rendimiento

Resultados reportados por los autores como AUROC (%) medio ± error estandar sobre cinco repeticiones. La columna final es el rango medio sobre 44 tareas IHC (menor es mejor).

| Modelo | Mama subtipo histologico | Mama luminal vs no luminal | DLBCL HANS | DLBCL doble expresor | NSCLC CD8 intratumoral | Diabetes tipo 2 | DAB pan-cancer (held out) | Rango medio (44 tareas) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| DINOv2 | 54,9 ± 0,4 | 81,1 ± 0,7 | 73,2 ± 0,8 | 64,9 ± 1,5 | 71,0 ± 1,4 | 73,6 ± 0,8 | 77,4 ± 0,3 | 7,30 ± 0,19 |
| ResNet-50 | 56,0 ± 0,7 | 86,3 ± 0,3 | 77,6 ± 0,6 | 76,6 ± 0,9 | 75,2 ± 0,2 | 72,2 ± 1,1 | 81,4 ± 0,8 | 6,64 ± 0,20 |
| PathoDuet | 50,9 ± 1,7 | 85,3 ± 0,5 | 82,8 ± 0,7 | 83,0 ± 0,9 | 77,7 ± 0,6 | 74,9 ± 0,8 | 88,2 ± 0,6 | 5,68 ± 0,25 |
| StainNet | 54,9 ± 1,6 | 88,4 ± 0,5 | 87,5 ± 0,9 | 90,2 ± 0,7 | 80,5 ± 0,5 | 79,6 ± 1,2 | 88,4 ± 0,7 | 3,70 ± 0,26 |
| UNI | 56,2 ± 1,9 | 87,2 ± 0,7 | 84,9 ± 0,8 | 85,2 ± 0,6 | 82,6 ± 0,4 | 76,1 ± 0,7 | 88,2 ± 0,4 | 3,50 ± 0,18 |
| Hibou | 57,0 ± 1,4 | 87,6 ± 0,4 | 86,7 ± 0,4 | 89,1 ± 0,8 | 82,3 ± 0,3 | 73,1 ± 0,7 | 91,1 ± 0,5 | 3,43 ± 0,24 |
| UNI2-h | 57,2 ± 0,5 | 87,2 ± 0,6 | 86,3 ± 0,8 | 81,2 ± 1,2 | **83,7 ± 0,3** | 74,0 ± 0,6 | 83,6 ± 0,8 | 3,09 ± 0,32 |
| SEPIA | **61,6 ± 1,7** | **89,4 ± 0,3** | **90,9 ± 0,4** | **91,9 ± 0,4** | 83,6 ± 0,2 | **89,3 ± 0,4** | **96,4 ± 0,4** | **2,66 ± 0,27** |

SEPIA lidera en 6 de las 7 tareas mostradas y queda practicamente empatado en NSCLC CD8 intratumoral con UNI2-h. La mejora mas pronunciada se da en estado diabetico (89,3% frente a 79,6% del siguiente mejor) y en localizacion DAB pan-cancer con marcadores no vistos (96,4% frente a 91,1% de Hibou).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,2 GB, lo que sugiere pesos en fp32 compatibles con una GPU consumer; en fp16 se reduce aproximadamente a la mitad (no se publican cifras oficiales).
- GPU recomendadas: no se especifican en la model card. Por tamano (ViT-L/14) cabe en GPUs consumer tipo RTX 3090, RTX 4090 o superiores; para lotes grandes en produccion tiene sentido usar A100 o H100.
- Cabe en GPU consumer: si, el tamano del repo (1,2 GB) es compatible con GPUs de 8 GB o mas en fp16 para lotes pequenos.
- Opciones de despliegue: al distribuirse como `sepia.pth` (PyTorch), la integracion natural es via PyTorch/TorchScript o frameworks de inferencia de vision. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Rango medio (44 tareas IHC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SEPIA | ViT-L/14 | no disponible | 224x224 + marcador | 2,66 | no disponible | Hugging Face (repo propio) |
| UNI2-h | ViT (patologia) | no disponible | 224x224 | 3,09 | no disponible | Hugging Face (UNI) |
| Hibou | ViT-L/14 | no disponible | 224x224 | 3,43 | no disponible | Hugging Face (Hibou) |
| UNI | ViT (patologia) | no disponible | 224x224 | 3,50 | no disponible | Hugging Face (UNI) |
| StainNet | no disponible | no disponible | 224x224 | 3,70 | no disponible | no disponible |

SEPIA se distingue de UNI, UNI2-h y Hibou por incorporar la identidad del marcador como entrada, lo que explica su ventaja en tareas dependientes del marcador (doble expresor, estado diabetico, localizacion DAB). En tareas donde el marcador aporta menos (CD8 intratumoral) la ventaja desaparece.

## Limitaciones y advertencias

- Solo procesa imagenes de IHC en ingles como etiqueta de idioma; no es un modelo de lenguaje ni multimodal texto-imagen.
- No se detalla la licencia, por lo que el uso comercial no esta garantizado y debe verificarse con el autor antes de cualquier despliegue en produccion.
- El modelo card no documenta sesgos conocidos, pero al entrenarse sobre datasets de patologia puede heredar sesgos de representacion de cohortes, centros o poblaciones.
- No se informa del volumen ni composicion del dataset de entrenamiento, lo que dificulta evaluar riesgo de sobreajuste o fuga de datos.
- El rendimiento se reporta sobre tareas IHC especificas; la generalizacion a otras modalidades (H&E, tinciones especiales) no esta documentada.
- Es un extractor de caracteristicas, no un clasificador: requiere una cabeza supervisada o un pipeline de downstream para tareas concretas.
- La tarea pan-cancer DAB location usa 13 marcadores held-out, pero no se especifica cuales ni el criterio de seleccion.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-09), por lo que no hay validacion independiente de la comunidad.

## Enlaces

- [Hugging Face: AnonUser123AI/Sepia](https://huggingface.co/AnonUser123AI/Sepia)
- Hibou (modelo base): no disponible en la informacion proporcionada
- DINOv2: no disponible en la informacion proporcionada
- ESM (Meta): no disponible en la informacion proporcionada
- UNI / UNI2-h: no disponible en la informacion proporcionada

# Pengyu965/ChartDete

## Resumen

CACHED (Context-Aware Chart Element Detection) es un modelo de deteccion de objetos especializado en la deteccion de elementos constituyentes de graficos (titulos de ejes, etiquetas de marcas, entradas de leyenda, areas de trazado, etc.). Lo desarrollan Pengyu Yan, Saleem Ahmed y David Doermann (University at Buffalo) y se publico originalmente en ICDAR 2023 (arXiv:2305.04151). El repositorio de Hugging Face `Pengyu965/ChartDete` es unicamente un espejo de los checkpoints originales del paper, subidos en octubre de 2026 para facilitar su descarga; no es un modelo nuevo ni una version revisada.

El problema que resuelve es el primer paso de la extraccion automatica de datos de graficos: identificar que region de la imagen corresponde a cada elemento funcional del grafico. A diferencia de la deteccion de objetos en imagenes naturales, muchos elementos de un grafico son visualmente identicos y solo se distinguen por su rol contextual (un bloque de texto puede ser una etiqueta de marca, una etiqueta de leyenda o una etiqueta de valor segun su posicion y entorno). CACHED aborda esto anadiendo un modulo de fusion de contexto local-global sobre una Cascade R-CNN con backbone Swin-Transformer.

El modelo se distribuye como checkpoints de MMDetection 2.x (ficheros `.pth` que incluyen estado del optimizador, de ahi el tamano de 6,3 GB del repositorio). No es un modelo de lenguaje ni un modelo generativo: es un detector de objetos de 18 clases entrenado sobre el dataset PMC2022 refinado en formato COCO. Su relevancia actual es la de un baseline academico reproducible para tareas de document AI y comprension de graficos cientificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone Swin-Transformer Tiny + FPN, con modulo de fusion de contexto local-global (VCE + PCE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por deteccion; entrada de imagen, no secuencia de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en precision original de entrenamiento, `.pth`) |
| Idiomas soportados | no disponible (modelo visual; detecta elementos graficos, no texto por idioma) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch, formato MMDetection 2.x con estado del optimizador incluido) |

## Arquitectura y entrenamiento

CACHED parte de una Cascade R-CNN con backbone Swin-Transformer Tiny y FPN, y anade un modulo de fusion de contexto local-global entre las cabezas RoI. Este modulo tiene dos componentes: (1) *visual context enhancement* (VCE), que agrega toda la piramide de caracteristicas en un mapa global y lo fusiona con cada caracteristica RoI mediante un bloque SE, de modo que cada region ve el grafico completo; y (2) *positional context encoding* (PCE), que aplica un Transformer sobre las coordenadas normalizadas de todas las propuestas para aprender patrones de layout tipicos (por ejemplo, que las etiquetas del eje x suelen situarse debajo de las marcas del eje x). El entrenamiento usa focal loss y balanced L1 loss para manejar el fuerte desbalance de clases propio de los elementos de grafico.

El modelo se entrena sobre el dataset PMC2022 refinado, reanotado en 18 clases y publicado en formato COCO por los mismos autores. La evaluacion del paper se realiza sobre el split de test de ICPR 2022 PMC split 3 (381 imagenes). No se especifica en la informacion disponible el numero de tokens ni la composicion detallada del dataset mas alla de su procedencia PMC y las 18 clases. No consta RLHF ni DPO (no aplica a un detector). La innovacion tecnica destacable es precisamente la incorporacion explicita de contexto global y posicional en un detector de objetos, motivada por la ambiguedad visual de los elementos de grafico.

## Capacidades

- Deteccion de 18 clases de elementos de grafico: `x_title`, `y_title`, `plot_area`, `other`, `xlabel`, `ylabel`, `chart_title`, `x_tick`, `y_tick`, `legend_patch`, `legend_label`, `legend_title`, `legend_area`, `mark_label`, `value_label`, `y_axis_area`, `x_axis_area`, `tick_grouping`.
- Deteccion especifica de barras mediante un checkpoint afinado (`bar_checkpoint.pth`, clase unica `bar`).
- Localizacion con cajas delimitadoras en coordenadas de imagen (salida COCO box).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM.
- No tiene capacidades multilingues en sentido estricto; opera sobre pixeles.
- Capacidad especial: fusion de contexto local-global (VCE) y codificacion de contexto posicional (PCE) para desambiguar elementos visualmente similares.

## Casos de uso

- Extraccion automatica de datos de graficos cientificos: detectar ejes, etiquetas y leyendas como paso previo a la lectura de valores, integrable en pipelines de mineria de literatura (por ejemplo, sobre articulos de PMC) para convertir figuras en datos tabulares.
- Digitalizacion de figuras en repositorios documentales: procesar lotes de PDF o imagenes y localizar `plot_area` y `value_label` para reconstruir series de datos en informes financieros o tecnicos.
- Enriquecimiento de bases de datos cientificas: anotar automaticamente elementos de grafico en corpus de articulos para habilitar busquedas por tipo de visualizacion o por titulo de eje.
- Preprocesado para OCR dirigido: usar las cajas detectadas (`xlabel`, `ylabel`, `legend_label`, `value_label`) para recortar regiones y pasarlas a un motor OCR, reduciendo ruido y mejorando la precision de lectura.
- Analisis de accesibilidad de documentos: detectar la presencia y posicion de titulos, leyendas y etiquetas para evaluar si un grafico cumple buenas practicas de visualizacion.
- Deteccion de barras en graficos de barras: con el checkpoint `bar_checkpoint.pth`, localizar barras individuales para tareas de comparacion cuantitativa o extraccion de alturas.
- Investigacion en document AI: servir como baseline reproducible (AP 0.729) para comparar nuevas arquitecturas de deteccion de elementos de grafico sobre el dataset PMC2022.

## Benchmarks y rendimiento

Resultados de COCO box AP sobre el split de test (ICPR 2022 PMC split 3, 381 imagenes) del dataset PMC refinado, segun la model card:

| Modelo | Clases | Test AP (paper) | Test AP (reevaluado) |
|---|---:|---:|---:|
| CACHED (Cascade R-CNN, Swin-T FPN, VCE + PCE, focal + balanced L1) | 18 | 0.729 | 0.729 |
| Cascade R-CNN, Swin-T FPN (baseline) | 18 | 0.699 | 0.699 |
| Cascade R-CNN, ResNeXt-101 FPN (baseline) | 18 | 0.696 | 0.696 |
| Faster R-CNN, ResNeXt-101 FPN (baseline) | 18 | 0.665 | 0.663 |
| DETR (baseline) | 18 | 0.536 | 0.536 |

El detector de barras afinado reporta COCO box AP de 0.692 sobre `baronly_test.json`. La model card indica que los modelos de ablacion intermedios (solo PCE, VCE + PCE sin cambios de loss) no se publicaron.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser una Cascade R-CNN con Swin-T y FPN sobre imagenes, el consumo depende de la resolucion de entrada y del tamano de lote; los `.pth` incluyen estado del optimizador, lo que infla el tamano en disco pero no la VRAM de inferencia.
- GPU recomendadas: no especificadas por el autor. Por el tamano del backbone (Swin-T) y la arquitectura de dos etapas, es razonable esperar que funcione en GPUs de gama media, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: requiere el codigo de ChartDete (fork de MMDetection 2.28) con PyTorch 1.13.1 y CUDA 11.7, y `mmcv-full==1.7.2`. No es compatible con `transformers`, con MMDetection upstream ni con MMDetection 3.x. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test AP (PMC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CACHED (este modelo) | no disponible | no aplica | 0.729 | MIT | Hugging Face + GitHub |
| Cascade R-CNN Swin-T FPN (baseline) | no disponible | no aplica | 0.699 | MIT (en este repo) | Hugging Face + GitHub |
| Cascade R-CNN ResNeXt-101 FPN (baseline) | no disponible | no aplica | 0.696 | MIT (en este repo) | Hugging Face + GitHub |
| Faster R-CNN ResNeXt-101 FPN (baseline) | no disponible | no aplica | 0.665 | MIT (en este repo) | Hugging Face + GitHub |
| DETR (baseline) | no disponible | no aplica | 0.536 | MIT (en este repo) | Hugging Face + GitHub |

No se dispone de comparacion con otros detectores de elementos de grafico externos a este paper en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling ni razonamiento. Cualquier expectativa de ese tipo es incorrecta.
- Requiere el codigo especifico de ChartDete (fork de MMDetection 2.28); no se puede cargar con `transformers`, MMDetection upstream ni MMDetection 3.x.
- Los checkpoints incluyen estado del optimizador, lo que incrementa el tamano en disco (repositorio de 6,3 GB) sin aportar valor en inferencia.
- El modelo esta entrenado exclusivamente sobre graficos del corpus PMC (literatura biomedica); su generalizacion a otros dominios visuales (graficos de negocio, dashboards, infografias) no esta validada en la informacion disponible.
- Riesgo de confusion entre clases visualmente similares (por ejemplo, `xlabel` frente a `value_label`), mitigado pero no eliminado por el modulo de contexto.
- No se han publicado datos sobre sesgos especificos del modelo mas alla del sesgo de dominio del dataset de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero si existe riesgo de falsos positivos y detecciones espurias en imagenes fuera de distribucion.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene revisar las condiciones del dataset PMC2022 subyacente para usos derivados.
- Los modelos de ablacion intermedios no se publicaron, lo que limita la reproducibilidad de los analisis de contribucion de componentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pengyu965/ChartDete
- Dataset PMC2022 refinado: https://huggingface.co/datasets/Pengyu965/ChartDete-PMC2022
- Codigo en GitHub: https://github.com/pengyu965/ChartDete
- Paper en Springer (ICDAR 2023): https://link.springer.com/chapter/10.1007/978-3-031-41676-7_13
- Paper en arXiv: https://arxiv.org/abs/2305.04151

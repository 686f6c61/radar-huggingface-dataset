# histoforge/rat-seminiferous-tubule-staging

## Resumen

Rat Tubule Staging (PAS) es un modelo de segmentación de instancias y clasificación por instancia desarrollado por histoforge (bajo el nombre "Da-Mi Kim Rat Tubule Staging"). Su tarea es detectar túbulos seminíferos visibles en cortes histológicos de testículo de rata teñidos con PAS y asignar a cada túbulo una de las 14 clases (atrofia más 13 clases de estadio que cubren los estadios I–XIV, con II–III agrupados) definidas en el conjunto publicado por Kim et al. (2026). Devuelve objetos poligonales, recuentos por clase y mediciones morfométricas de sección transversal.

El modelo se distribuye como módulo ejecutable en QuPath a través de la librería `histoforge`, con un repositorio de 1,3 GB, y se apoya en el backbone `timm/vit_large_patch16_dinov3.lvd1689m` (ViT-L/16 DINOv3) con un adaptador y una cabecera de segmentación de instancias de tipo HoVerNet. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto, sino imágenes brightfield RGB de portaobjetos completos con calibración de píxel.

Su relevancia es de nicho pero concreta: automatiza un paso de fenotipado histológico (estadio del ciclo del epitelio seminífero y fracción de atrofia) que normalmente requiere recuento manual, y lo entrega con métricas agregadas listas para exportar. El propio autor lo marca como modelo de investigación experimental no validado clínicamente, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone ViT-L/16 DINOv3 con adaptador y cabecera de segmentación de instancias estilo HoVerNet (según el tag `dinov3-adapter-hovernet`) |
| Parámetros totales | no disponible (el backbone es ViT-L/16; el recuento total no se declara en la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; parches de 16×16; resolución de entrada y tamaño de ventana no especificados) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de imagen; el campo de idiomas figura como no disponible) |
| Licencia | DINOv3 (`license_name: dinov3`), con enlace a la licencia del repositorio facebookresearch/dinov3 |
| Formato de pesos | no disponible (repositorio de 1,3 GB, `library_name: histoforge`) |
| Tarea (pipeline) | `image-segmentation` (segmentación de instancias + clasificación por instancia) |
| Entrada | Imagen brightfield RGB con tamaño de píxel calibrado (píxel cuadrado) |
| Clases de salida | 14: `Atrophy`, `Stage01`, `Stage02-03`, `Stage04` a `Stage14` |
| Modelo base | `timm/vit_large_patch16_dinov3.lvd1689m` |
| Entorno de ejecución | QuPath, mediante el módulo de la librería `histoforge` |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer de visión ViT-L/16 inicializado desde DINOv3 (`vit_large_patch16_dinov3.lvd1689m`, preentrenado sobre LVD-1689M) con un adaptador específico de dominio y una cabecera de segmentación de instancias de estilo HoVerNet, según la etiqueta `dinov3-adapter-hovernet`. Es decir, el modelo no produce una máscara semántica densa, sino instancias separadas: cada túbulo emitido recibe un polígono y una clase de estadio o atrofia, y el fondo no se devuelve como objeto. El adaptador intermedio sugiere un ajuste eficiente del backbone congelado o parcialmente congelado, aunque la model card no detalla qué parámetros se entrenan, la función de pérdida ni el esquema de aumento de datos.

Los datos proceden del conjunto publicado por Kim et al. (2026) en Figshare (ID 28448267, CC BY 4.0): campos de testículo de rata teñidos con PAS con anotaciones de túbulo y estadio. La validación publicada cubre 137 campos liberados con 1.343 túbulos anotados tras control de calidad. El modelo seleccionado es el checkpoint de campo completo en el paso 8.600, elegido sobre esos mismos campos de validación, que por tanto no constituyen un conjunto de test independiente. No se especifican en la información disponible el número de tokens o parches de entrenamiento, la composición exacta del dataset, ni si hubo fases de refinamiento posteriores (RLHF/DPO no aplica en este dominio).

## Capacidades

- Segmentación de instancias de túbulos seminíferos en secciones de testículo de rata teñidas con PAS sobre imagen brightfield RGB.
- Clasificación por instancia en 14 clases: atrofia y 13 clases de estadio (I, II–III agrupados, IV, V, VI, VII, VIII, IX, X, XI, XII, XIII, XIV).
- Emisión de objetos poligonales revisables en QuPath, con exclusión del fondo (no se devuelve como objeto).
- Recuento automático por clase: total de túbulos, túbulos atróficos y recuento de cada clase de estadio.
- Morfometría por túbulo: área (µm²), eje menor y eje mayor por elipse de momentos centrales (µm) y circularidad `4πA/P²` calculada sobre el contorno exterior del componente mayor.
- Cálculo del área analizada (mm²) y, a partir de recuentos y área, de la densidad tubular, la fracción de atrofia y las proporciones de estadio.
- Distinción entre túbulos completamente contenidos en la región de análisis y túbulos cortados por el borde: los segundos no entran en las métricas de forma.
- No dispone de tool calling, capacidades de agente, generación de texto, razonamiento multi-paso, visión general, audio ni soporte multilingüe.

## Casos de uso

- **Caracterización del ciclo del epitelio seminífero**: cuantificar la proporción de cada estadio (I–XIV) en secciones de testículo de rata para describir la composición del epitelio por campo o por animal, sustituyendo el recuento manual de túbulos por un recuento automático exportable.
- **Estudios de toxicidad testicular en seguridad preclínica**: usar la clase `Atrophy` y la fracción de atrofia derivada (túbulos atróficos / túbulos totales) como endpoint cuantitativo en grupos tratados frente a control, junto con la densidad tubular por mm².
- **Fenotipado de modelos animales genéticos**: comparar área tubular media, eje mayor y eje menor entre animales knock-out y wild-type para detectar diferencias de calibre tubular asociadas a alteraciones de la espermatogénesis.
- **Histología cuantitativa de alto rendimiento en QuPath**: ejecutar el módulo sobre regiones de análisis seleccionadas en múltiples portaobjetos, sumar recuentos y área analizada entre regiones y exportar los resúmenes (media, desviación estándar y recuento) a CSV para análisis estadístico posterior.
- **Reevaluación y control de calidad de datos públicos**: aplicar el modelo al conjunto de Figshare 28448267 y comparar las predicciones con las anotaciones liberadas para detectar campos mal anotados o discrepancias sistemáticas de estadio antes de reutilizar el dataset.
- **Revisión asistida de portaobjetos**: generar overlays de túbulos y estadios para que el patólogo o el investigador revise visualmente los campos dudosos, usando los ejemplos de fallo publicados como referencia de los modos de error esperables.
- **Cribado de calidad de imagen**: al requerir calibración de píxel cuadrada y depender de la morfología para las mediciones físicas, el módulo sirve como paso previo que fuerza la verificación de calibración y detecta campos sin metadatos válidos antes de producir medidas en µm.

## Benchmarks y rendimiento

La model card describe el protocolo de evaluación, pero la tabla de resultados aparece truncada en la información disponible, por lo que no se pueden reproducir las cifras.

| Aspecto evaluado | Dato disponible |
|---|---|
| Conjunto de evaluación | 137 campos de validación liberados |
| Túbulos anotados tras control de calidad | 1.343 |
| Métrica principal | F1 por túbulo (no por píxel) |
| F1 de estadio exacto y ±1 estadio | Condicional: solo se puntúa el estadio cuando la máscara predicha coincide con la anotación con IoU ≥ 0,5; los objetos ausentes o no emparejados no entran en estas puntuaciones |
| F1 de objeto extremo a extremo | Penaliza túbulos no detectados, objetos extra y estadios incorrectos |
| Checkpoint evaluado | Modelo de campo completo en el paso 8.600 |
| Valores numéricos (macro F1 exacto, ±1, F1 de objeto) | no disponible (tabla truncada en la información proporcionada) |
| Comparación con otros modelos | no disponible |

No se han publicado en la información disponible resultados numéricos de benchmarks ni comparaciones cuantitativas con modelos alternativos. Además, los campos de validación se usaron para la selección del checkpoint, por lo que las cifras serían optimistas respecto a un test independiente.

## Requisitos de hardware

- Tamaño del repositorio: 1,3 GB, lo que acota el peso de los pesos y del código del módulo; el desglose exacto entre pesos y artefactos no se detalla.
- VRAM estimada: no disponible en la model card. Por el tamaño del repositorio, es razonable esperar que los pesos quepan en GPUs consumer de gama media (8 GB o más), pero esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponibles. No se documentan pruebas en A100, H100, RTX 4090 ni en otras tarjetas.
- Ejecución en CPU: no documentada.
- Opciones de despliegue: el módulo está diseñado para ejecutarse dentro de QuPath mediante la librería `histoforge`. No se mencionan vLLM, TGI, llama.cpp, Ollama ni ningún servidor de inferencia, que en este caso no serían aplicables.
- Latencia y throughput: no disponibles; no se publican tiempos por campo ni túbulos por segundo.
- Requisito funcional imprescindible: calibración de píxel válida y cuadrada en el portaobjetos; sin ella, las mediciones en µm y mm² no son válidas, aunque los recuentos sí se calculan.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos directamente comparables con la misma tarea (estadio de túbulo seminífero de rata en PAS con 14 clases). La comparación solo puede plantearse a nivel de familia arquitectónica.

| Modelo | Tarea | Parámetros | Entrada / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| histoforge/rat-seminiferous-tubule-staging | Segmentación de instancias + clasificación de estadio en testículo de rata (PAS), 14 clases | no disponible (backbone ViT-L/16) | Imagen RGB brightfield, parches 16×16 | DINOv3 | HuggingFace + librería `histoforge` (0 descargas) |
| HoVerNet (referencia metodológica de la cabecera) | Segmentación de instancias de núcleos (pan-núcleo) | no disponible | Imagen histológica RGB | no disponible | Implementaciones públicas diversas |
| CellViT y variantes de segmentación de núcleos con backbone ViT | Segmentación y clasificación de núcleos | no disponible | Imagen histológica RGB | no disponible | Repositorios públicos |
| timm/vit_large_patch16_dinov3.lvd1689m (modelo base) | Representación visual general (backbone) | no disponible en la información | Imagen, parches 16×16 | DINOv3 | HuggingFace / timm |

Cualquier comparación de rendimiento con estas alternativas requeriría reevaluar todas sobre el mismo conjunto de 137 campos, algo que no se ha publicado en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación experimental, no validado clínicamente: no debe usarse para diagnóstico ni para decisiones clínicas.
- Validación limitada y potencialmente optimista: 137 campos y 1.343 túbulos, y esos mismos campos se usaron para seleccionar el checkpoint (paso 8.600), por lo que no constituyen un test independiente.
- Dominio muy restringido: especie (rata), tejido (testículo), tinción (PAS) y modalidad (brightfield RGB). No hay evidencia de transferencia a otras especies, tejidos, tinciones (HE, inmunohistoquímica) ni a fluorescencia.
- Dependencia de la calibración: sin tamaño de píxel válido y cuadrado, las medidas de área, ejes y área analizada en unidades físicas no son fiables.
- Sesgo de borde: los túbulos cortados por el límite de la región de análisis se excluyen de las métricas de forma, lo que puede sesgar área y ejes en regiones pequeñas o mal encuadradas.
- Clases agrupadas: los estadios II y III se emiten como una única clase (`Stage02-03`), de modo que el modelo no permite separarlos.
- Interpretación de las métricas: el F1 de estadio exacto y ±1 es condicional a un emparejamiento con IoU ≥ 0,5, por lo que no refleja por sí solo los túbulos no detectados; para eso hay que mirar el F1 de objeto extremo a extremo.
- Riesgo de falsos positivos y de objetos extra en campos con artefactos de corte, pliegues o desenfoque; el autor publica un ejemplo de fallo con el peor micro-F1 por imagen.
- Sin validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta, lo que implica ausencia de replicación independiente conocida.
- Licencia DINOv3: no es una licencia de código abierto estándar; hay que revisar los términos del repositorio de facebookresearch/dinov3 antes de cualquier uso comercial, y el modelo hereda las condiciones del modelo base.
- Los datos de anotación originales son CC BY 4.0 (Kim et al.), pero esa licencia cubre las imágenes y anotaciones, no necesariamente los pesos derivados.
- No aplica sesgo lingüístico ni de idioma; el riesgo de sesgo relevante es de dominio (lote de tinción, escáner, laboratorio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/histoforge/rat-seminiferous-tubule-staging
- Licencia DINOv3 (facebookresearch/dinov3): https://github.com/facebookresearch/dinov3/blob/6876159a11b4df116f30f667f8c9888617df0751/LICENSE.md
- Modelo base en HuggingFace: https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
- Dataset y anotaciones (Kim et al., Figshare 28448267): https://doi.org/10.6084/m9.figshare.28448267
- Licencia de los datos originales (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
- Definiciones de medición del módulo: https://huggingface.co/histoforge/rat-seminiferous-tubule-staging/blob/main/MEASUREMENTS.md
- Créditos de los ejemplos: https://huggingface.co/histoforge/rat-seminiferous-tubule-staging/blob/main/EXAMPLE-CREDITS.md

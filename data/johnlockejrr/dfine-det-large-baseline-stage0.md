# johnlockejrr/dfine-det-large-baseline-stage0

## Resumen

`dfine-det-large-baseline-stage0` es un modelo de detección de objetos especializado en la detección de líneas de texto (baselines) en documentos históricos manuscritos e impresos. Desarrollado por johnlockejrr, adapta el detector D-FINE Large (HGNetv2-B4) para predecir polylines (puntos de control de B-spline cúbicos) en lugar de cajas delimitadoras. El modelo se presenta como un preentrenamiento genérico de Stage-0 para fine-tuning posterior en dominios específicos (Stage-1), como escrituras hebreas, samaritanas o siríacas.

Con aproximadamente 30,1 millones de parámetros entrenables y 300 queries, el modelo procesa imágenes a 1280x1280 píxeles y genera salidas compatibles con formatos PAGE-XML y ALTO. Se entrenó sobre 46.513 páginas de 29 corpus multiscript, incluyendo datos de ICDAR cBAD, y alcanza una F1 de 0,893 en su validación interna. Su relevancia radica en proporcionar una base sólida para la investigación en detección de baselines y en la digitalización de patrimonio documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PolylineDFINE — núcleo D-FINE + head de polylines (D-FINE Large / HGNetv2-B4) |
| Parametros totales | ~30,1 M entrenables (totales no especificados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, la, de, he, hbo, smp, sam, fr, fi, el, is, syc, syr, sv, ar, chu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una adaptación de D-FINE Large, un detector de objetos en tiempo real basado en DETR, con un head adicional que predice polylines como puntos de control de B-spline cúbicos (K=8) más la altura de cada línea. La detección se formula como predicción de conjuntos de polylines puntuadas; los entornos poligonales (BLLA) se aplican solo en la serialización PAGE/ALTO, no en el objetivo de entrenamiento. La inicialización parte de los pesos oficiales `dfine_l_obj2coco_e25.pth` de Peterande/D-FINE.

El entrenamiento (Stage-0) usó 46.513 páginas de entrenamiento y 1.923 de validación (holdout del 5%, semilla 42), compiladas a partir de 29 corpus PAGE-XML/ALTO con simplificación adaptativa a B-spline. La receta incluye optimizador AdamW con LR base 1e-4 (backbone 0,1x), programación lineal con warmup y coseno, precisión mixta bf16, batch efectivo de 32, aumento leve (fotométrico + rotación ±2°) y distancia de coincidencia de 20 px. El entrenamiento se detuvo en la época 39 por meseta del monitor `cbad_f1_max` cerca de 0,89.

## Capacidades

- Detección de líneas de texto (baselines) como polylines, con salida en formato PAGE-XML o ALTO.
- Soporte multiscript: entrenado con corpus en alemán, árabe, hebreo, samaritano, siríaco, latín, sueco, finlandés, eslavo eclesiástico, sánscrito, griego, checo, polaco, judeoespañol, islandés, estonio y papiros, entre otros.
- Fine-tuning para dominios específicos (Stage-1) sobre escrituras o corpus concretos.
- Exploración zero-shot / few-shot en manuscritos heterogéneos (con salvedad de posible domain gap).
- Investigación sobre detectores de baselines basados en D-FINE.
- No reconoce texto: solo detecta líneas, no realiza transcripción ni OCR.
- No detecta regiones de layout (párrafos, tablas, etc.).

## Casos de uso

- Digitalización de manuscritos históricos: el modelo detecta las líneas de texto de páginas escaneadas, lo que permite segmentar el contenido para su posterior transcripción con sistemas HTR.
- Preprocesamiento para OCR/HTR: las polylines generadas sirven como entrada para motores de reconocimiento que requieren líneas individuales, mejorando la precisión en documentos complejos.
- Creación de ground truth para anotación: los resultados pueden exportarse a PAGE-XML o ALTO y usarse como base para anotaciones manuales o semiautomáticas en proyectos de digitalización.
- Fine-tuning para escrituras específicas: partiendo de este checkpoint, se puede adaptar a dominios concretos como hebreo, samaritano o siríaco con un número reducido de páginas anotadas.
- Evaluación de calidad de digitalización: la detección de líneas permite identificar páginas torcidas, mal escaneadas o con solapamientos en colecciones digitales.
- Investigación académica en visión por computador aplicada a patrimonio documental: el modelo sirve como referencia reproducible para comparar arquitecturas de detección de baselines.
- Integración en pipelines de bibliotecas digitales: al generar salidas estándar PAGE/ALTO, puede conectarse directamente con herramientas de publicación y visualización de documentos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el holdout de validación interno (5% del conjunto Stage-0, 1.923 páginas). La métrica es F1 de línea estilo cBAD, con emparejamiento húngaro de polylines densificadas y costo de Chamfer bidireccional medio (umbral 20 px).

| Metrica | Valor |
|---|---|
| cbad_f1_max (conf sweep) | 0,893 |
| cbad_f1 @ conf=0.5 | 0,893 |
| Precision @ conf=0.5 | 0,943 |
| Recall @ conf=0.5 | 0,842 |

Estos valores corresponden a un holdout interno multiscript, no a la evaluación oficial de ICDAR cBAD 2019. Las páginas de cBAD están incluidas en el conjunto de preentrenamiento, por lo que no deben compararse directamente con resultados oficiales.

## Requisitos de hardware

- El checkpoint `best_cbad_f1.safetensors` ocupa aproximadamente 116 MB, lo que sugiere que la inferencia es ligera y puede ejecutarse en GPUs consumer (p. ej., RTX 3060 o superiores) sin problemas de memoria.
- El entrenamiento se realizó en hardware de clase MI300X (AMD) con batch efectivo de 32, pero no se han publicado requisitos mínimos para inferencia.
- No hay documentación oficial sobre despliegue con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de visión, el despliegue típico sería mediante el repositorio D-FINE o una librería personalizada `dfine-det`.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros detectores de baselines (p. ej., Kraken, dhSegment, o los modelos de la competición cBAD) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de OCR: detecta líneas de texto, pero no transcribe caracteres ni palabras. No debe usarse como sustituto de un sistema de reconocimiento.
- La validación reportada es interna y no comparable con evaluaciones oficiales de ICDAR cBAD 2019, ya que las páginas de cBAD forman parte del conjunto de preentrenamiento.
- El modelo puede presentar sesgos derivados de los corpus de entrenamiento, que se centran en manuscritos históricos y no cubren todos los estilos de escritura o calidades de imagen.
- Riesgo de falsos positivos o negativos en documentos con ruido, degradación severa o diseños complejos (columnas, glosas, anotaciones marginales).
- Algunos corpus son privados (p. ej., `smp-private`), lo que puede limitar la reproducibilidad completa del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento pueden tener restricciones adicionales; se recomienda verificar los términos de cada corpus.
- No se especifican cuantizaciones ni formatos de pesos alternativos a safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/dfine-det-large-baseline-stage0
- Demo interactiva (Space): https://huggingface.co/spaces/johnlockejrr/dfine-det-large-baseline-stage0
- Repositorio oficial D-FINE (GitHub): https://github.com/Peterande/D-FINE
- Paper D-FINE (arXiv abstract): https://arxiv.org/abs/2410.13842
- Paper D-FINE (HTML): https://arxiv.org/html/2410.13842v1

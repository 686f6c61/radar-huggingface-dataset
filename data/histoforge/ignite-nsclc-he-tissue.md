# histoforge/ignite-nsclc-he-tissue

## Resumen

IGNITE NSCLC Tissue Segmentation (H\&E) es un modelo de segmentación semántica de imágenes de histopatología desarrollado por histoforge. Su función es delimitar compartimentos tisulares en muestras de cáncer de pulmón no microcítico (NSCLC) teñidas con hematoxilina-eosina (H\&E), devolviendo 15 clases de tejido (epitelio tumoral, estroma, inflamación, tejido alveolar, necrosis, eritrocitos, cartílago/hueso, macrófagos, músculo, hígado, queratinización, entre otras) junto con sus áreas en mm². No segmenta células ni núcleos individuales: opera a nivel de región tisular.

El modelo se distribuye como módulo del ecosistema HistoForge para QuPath, donde se aplica sobre imágenes H\&E calibradas y regiones de análisis seleccionadas por el usuario. La inferencia se realiza por baldosas (tiled inference) sobre la imagen remuestreada a 0,5 µm/píxel, y el fondo se predice internamente sin devolverse como objeto tisular. Está pensado, por tanto, para flujos de investigación en patología computacional más que para diagnóstico clínico directo.

Su relevancia radica en que ofrece una alternativa de un solo modelo frente al ensamble de cinco redes nnU-Net publicado con el conjunto de datos IGNITE, con mejores cifras agregadas de Dice en la evaluación reportada: 0,7225 de Dice macro y 0,7931 de Dice micro frente a 0,6733 y 0,7870 del ensamble reejecutado, sobre 139 regiones de evaluación de 34 pacientes. Las etiquetas del repositorio apuntan a un backbone DINOv3, aunque la model card no detalla la arquitectura interna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; las etiquetas indican backbone DINOv3 con pipeline de segmentación semántica de imágenes |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No aplica (modelo de visión); resolución de trabajo fijada en 0,5 µm/píxel con inferencia por baldosas |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (etiquetas de clase y documentación) |
| Licencia | `other`, con nombre `dinov3` y texto en LICENSE-DINOV3.md |
| Formato de pesos | No disponible en la información proporcionada (repositorio de 1,2 GB) |

## Arquitectura y entrenamiento

La información publicada no especifica el número de parámetros, la composición exacta del dataset de entrenamiento ni el procedimiento de optimización. Lo que sí se documenta es el pipeline de inferencia: las imágenes H\&E se muestrean a 0,5 µm/píxel y se procesan mediante inferencia por baldosas estándar del ecosistema HistoForge, con predicción interna de la clase fondo que no se expone como objeto tisular. Las etiquetas del repositorio (`dinov3`, `semantic-segmentation`, `image-segmentation`) sugieren un backbone transformer DINOv3 adaptado a segmentación semántica densa, pero se trata de una inferencia a partir de metadatos, no de una especificación del autor.

El modelo se evalúa sobre 139 regiones oficiales de evaluación procedentes de 34 pacientes, con predicciones guardadas y dos protocolos de puntuación distintos. En el protocolo del autor se reportan 0,7943 de Dice micro para todas las clases tisulares y 0,8222 de Dice micro con clases agrupadas. No se documentan en la información disponible detalles sobre RLHF, ajuste por preferencias ni técnicas de decodificación, que no aplican a este tipo de modelo.

## Capacidades

- Segmentación semántica de tejido en imágenes H\&E de NSCLC, con 15 clases de salida: tumor epithelium, reactive epithelium, stroma, inflammation, alveolar tissue, fatty tissue, necrotic tissue, erythrocytes, bronchial epithelium, mucus/plasma/fluids, cartilage/bone, macrophages, muscle, liver y keratinization.
- Predicción interna de la clase fondo, que no se devuelve como objeto tisular para no contaminar las mediciones.
- Cálculo de áreas en mm² por clase, recortadas a la región de interés (ROI) de análisis, con recuento único de solapamientos de la misma clase y suma agregada entre ROIs y imágenes no solapadas.
- Integración con QuPath mediante el módulo `histoforge/ignite-nsclc-he-tissue`, con revisión y corrección manual de las regiones etiquetadas antes de calcular o exportar mediciones.
- Inferencia por baldosas sobre imágenes calibradas, lo que permite procesar preparaciones de gran tamaño a resolución física homogénea (0,5 µm/píxel).
- No incluye detección ni clasificación celular o nuclear: las regiones conectadas de la salida son geometría de visualización, no recuentos de células.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Cuantificación de la proporción tumor/estroma en cohortes de investigación: el modelo etiqueta tumor epithelium y stroma por separado, de modo que puede calcularse la ratio de área entre ambas clases por ROI y agregarse entre portaobjetos para análisis de supervivencia o de respuesta a tratamiento.
- Medición de infiltrado inflamatorio: la clase inflammation permite obtener el área de regiones ricas en células inflamatorias en mm², útil para estudios de microambiente inmunitario en NSCLC a partir de secciones H\&E ya disponibles.
- Cuantificación de necrosis: la clase necrotic tissue facilita estimar el porcentaje de área necrótica por región, un parámetro habitual en la caracterización histológica de tumores sólidos.
- Control de calidad y cribado de preparaciones: al devolver áreas por clase y un área total analizada, permite detectar portaobjetos con composición tisular anómala o con artefactos antes de pasarlos a pipelines más costosos.
- Prelabelado para anotación humana: las predicciones pueden revisarse y corregirse en QuPath, lo que reduce el tiempo de anotación de compartimentos tisulares en la construcción de nuevos datasets.
- Enriquecimiento previo a pipelines de análisis celular: la máscara tisular sirve para restringir la detección de núcleos o la extracción de características a regiones de interés (por ejemplo, solo epitelio tumoral), evitando procesar fondo o tejido irrelevante.
- Investigación en patología computacional comparativa: al ser un modelo único con métricas publicadas frente al ensamble nnU-Net de IGNITE, sirve como referencia para estudiar el compromiso entre coste de inferencia y precisión de segmentación.
- Docencia y validación metodológica: la superposición de predicción y anotación en las imágenes de ejemplo permite ilustrar la variabilidad entre observadores y los límites de las clases tisulares poco definidas.

## Benchmarks y rendimiento

Evaluación sobre 139 regiones oficiales de evaluación de 34 pacientes, con las mismas predicciones guardadas para cada modelo. Dice/F1 mide acuerdo a nivel de píxel, no detección ni clasificación celular.

Convención de evaluación de HistoForge (solo se ignoran los píxeles no anotados en la verdad de referencia; las predicciones de tejido sobre fondo anotado y el tejido no detectado cuentan como error):

| Modelo | Dice macro de tejido | Dice micro de tejido |
|---|---:|---:|
| Este modelo | 0,7225 | 0,7931 |
| Ensamble nnU-Net de cinco modelos de IGNITE, reejecutado | 0,6733 | 0,7870 |

Desglose de F1 (Dice) por clase tisular con la misma convención:

| Clase de tejido | Este modelo | Ensamble IGNITE, reejecutado |
|---|---:|---:|
| Tumor epithelium | 0,8950 | 0,8786 |
| Reactive epithelium | 0,5188 | 0,5621 |
| Stroma | 0,7734 | 0,7800 |
| Inflammation | 0,6748 | 0,6831 |
| Alveolar tissue | 0,5975 | 0,5655 |
| Fatty tissue | 0,8920 | 0,8313 |
| Necrotic tissue | 0,7744 | 0,7761 |
| Erythrocytes | 0,6985 | 0,7489 |
| Bronchial epithelium | 0,7705 | 0,7316 |
| Mucus/Plasma/Fluids | 0,4542 | 0,4521 |
| Cartilage/Bone | 0,6412 | 0,4516 |
| Macrophages | 0,7789 | 0,7715 |
| Muscle | 0,6245 | 0,3912 |
| Liver | 0,9537 | 0,9608 |
| Keratinization | 0,7905 | 0,5154 |

Protocolo de evaluación de los autores:

| Modelo / evidencia | Dice/F1 micro, todos los tejidos | Dice/F1 micro, tejidos agrupados |
|---|---:|---:|
| Este modelo | 0,7943 | 0,8222 |
| Ensamble nnU-Net de cinco modelos de IGNITE | No disponible en el extracto proporcionado (fila truncada) | No disponible en el extracto proporcionado (fila truncada) |

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia orientativa, el repositorio completo ocupa 1,2 GB, por lo que los pesos en precisión de 16 bits deberían situarse en el orden de varios cientos de millones de parámetros y caber holgadamente en GPU de consumo; esta estimación no sustituye a una medición real.
- GPU recomendadas: no disponibles. Para procesamiento por lotes de cohortes completas tiene sentido plantear A100 o H100 por capacidad de memoria y paralelismo, y RTX 4090 o RTX 3090 para trabajo interactivo en QuPath; son recomendaciones generales, no requisitos publicados por el autor.
- GPU de consumo: previsiblemente viable en tarjetas con 8 GB o más de VRAM, condicionado al tamaño de baldosa utilizado en la inferencia por baldosas. Dato no confirmado por el autor.
- Opciones de despliegue: el despliegue documentado es el módulo HistoForge dentro de QuPath, con muestreo a 0,5 µm/píxel e inferencia por baldosas. No se documentan instrucciones para vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime, que además no son las herramientas habituales para este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del tamaño de imagen, del número de ROIs y del hardware; el coste escala con el área analizada a resolución fija de 0,5 µm/píxel.

## Comparativa con modelos similares

| Modelo | Tipo | Clases de salida | Dice macro | Dice micro | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| histoforge/ignite-nsclc-he-tissue | Segmentación semántica de tejido (un solo modelo) | 15 clases + fondo interno | 0,7225 | 0,7931 | `other` (dinov3) | HuggingFace, módulo QuPath |
| Ensamble nnU-Net de cinco modelos de IGNITE (reejecutado) | Ensamble de segmentación | 15 clases (mismas clases evaluadas) | 0,6733 | 0,7870 | Según distribución original de IGNITE; no disponible en esta información | Referencia de la literatura y del conjunto IGNITE v1 |

No se dispone en la información proporcionada de otros modelos comparables de segmentación tisular en NSCLC H\&E con métricas publicadas bajo la misma convención de evaluación. Cualquier comparación con segmentadores entrenados en otros dominios histológicos requeriría reevaluación sobre las mismas 139 regiones.

## Limitaciones y advertencias

- Alcance restringido: solo segmenta tejido en H\&E de NSCLC. No detecta células ni núcleos, y las regiones conectadas de la salida son geometría de visualización, no recuentos celulares.
- Rendimiento desigual por clase: reactive epithelium (0,5188) y mucus/plasma/fluids (0,4542) quedan por debajo de 0,55 de Dice, y alveolar tissue (0,5975) y muscle (0,6245) tampoco superan 0,65. Las mediciones basadas en estas clases deben interpretarse con cautela.
- Clases agrupadas: mucus, plasma y fluidos comparten una única etiqueta, igual que cartílago y hueso, lo que impide distinguir esas entidades en las mediciones.
- Dependencia de la calibración: el pipeline exige imágenes H\&E calibradas y asume un muestreo de 0,5 µm/píxel. Una calibración incorrecta invalida las áreas en mm² y degrada la segmentación.
- Revisión humana necesaria: el flujo de trabajo contempla revisar y corregir las regiones etiquetadas antes de calcular mediciones; las áreas reflejan los objetos existentes, incluidas las ediciones manuales.
- Licencia restrictiva: la licencia es `other` con nombre `dinov3` y el texto completo en LICENSE-DINOV3.md. No se detallan en la información disponible las condiciones exactas de uso comercial; deben consultarse antes de cualquier despliegue productivo.
- Procedencia de datos: las imágenes y anotaciones de ejemplo provienen de IGNITE v1 (Spronck et al.), distribuidas bajo CC BY-NC-SA 4.0, una licencia no comercial. Ello condiciona el uso de esos materiales y debe verificarse la aplicabilidad al modelo derivado.
- Validación limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de validación independiente por parte de la comunidad.
- No es producto sanitario: no se documentan validaciones regulatorias, estudios prospectivos ni uso clínico previsto; los resultados no deben emplearse para decisiones diagnósticas o terapéuticas.
- Sesgos: no se documenta análisis de sesgo por sitio anatómico, tipo de escáner, laboratorio de origen, género, edad ni etnia de los pacientes. La evaluación se limita a 34 pacientes, lo que limita la generalización.
- Idioma: la documentación y las etiquetas de clase están únicamente en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/histoforge/ignite-nsclc-he-tissue
- Licencia DINOv3: https://huggingface.co/histoforge/ignite-nsclc-he-tissue/blob/main/LICENSE-DINOV3.md
- Definiciones de medición: https://huggingface.co/histoforge/ignite-nsclc-he-tissue/blob/main/MEASUREMENTS.md
- Créditos y selección de ejemplos: https://huggingface.co/histoforge/ignite-nsclc-he-tissue/blob/main/EXAMPLE-CREDITS.md
- Artículo en arXiv: https://arxiv.org/abs/2507.16855
- Conjunto de datos IGNITE v1 (Spronck et al.): https://doi.org/10.5281/zenodo.15674785
- Licencia del material de ejemplo (CC BY-NC-SA 4.0): https://creativecommons.org/licenses/by-nc-sa/4.0/

# ct-tranchau/Rootscope

## Resumen

RootScope es un modelo de clasificación de imágenes de microscopía confocal desarrollado por Tran Chau (ct-tranchau) para la identificación de tipos celulares en secciones transversales de puntas de raíz de plantas. El sistema combina segmentación celular mediante Cellpose-SAM, extracción de características morfotopológicas y embeddings de DINOv2 afinado, y clasificación final mediante un conjunto de modelos de árboles (XGBoost, LightGBM y RandomForest). Está diseñado para resolver un problema específico de biología vegetal: la anotación automática de nueve tipos celulares anatómicos en imágenes de raíz, una tarea que tradicionalmente requiere anotación manual experta.

El modelo se distribuye en dos versiones: v2 (por defecto) con backbone DINOv2 ViT-B/14 y 864 características, y v1 con DINOv2 ViT-S/14 y 480 características. El repositorio incluye los pesos entrenados, los escaladores, las columnas de características y el codificador de etiquetas. La licencia es MIT, lo que permite uso comercial y modificación. Su relevancia radica en ofrecer una herramienta reproducible y de código abierto para la fenotipado de raíces, con una precisión de test superior al 86% en la versión v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline: Cellpose-SAM (segmentación) + DINOv2 ViT-B/14 (backbone) + ensemble de árboles (XGBoost, LightGBM, RandomForest) |
| Parametros totales | No disponible (el backbone DINOv2 ViT-B/14 tiene ~86M, pero el ensemble y los componentes adicionales no se especifican) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | No disponible (no se menciona cuantización) |
| Idiomas soportados | No aplica (procesa imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | .pt (backbone DINOv2) y .joblib (modelos de árboles, scalers, codificadores) |

## Arquitectura y entrenamiento

RootScope no es un modelo único sino un pipeline compuesto. Primero, una imagen TIFF de sección transversal de punta de raíz se segmenta a nivel celular utilizando Cellpose-SAM, un modelo de segmentación basado en SAM adaptado a células. Cada célula segmentada se describe mediante 96 características morfotopológicas (área, perímetro, distancia al centroide, etc.) y 768 embeddings extraídos de un DINOv2 ViT-B/14 afinado para esta tarea, sumando 864 características por célula. Estas características se introducen en tres clasificadores de árboles (XGBoost, LightGBM y RandomForest) que se combinan en un ensemble iterativo para asignar una de nueve clases anatómicas.

El entrenamiento se realizó con datos de microscopía confocal de raíces, aunque no se especifican el número de imágenes ni la composición exacta del dataset. Los pesos de los modelos de árboles se guardaron con scikit-learn 1.7.2, que es la versión fijada en el entorno de instalación. No se menciona el uso de RLHF ni DPO, ya que es un modelo de visión supervisado clásico. La innovación principal reside en la combinación de características morfológicas clásicas con embeddings de un transformer de visión afinado, y en el uso de un ensemble de modelos heterogéneos para la clasificación final.

## Capacidades

- Segmentación automática de células en imágenes de microscopía confocal de secciones de raíz.
- Clasificación de cada célula en nueve tipos anatómicos: root_cap, epidermis, exodermis, cortex, endodermis, pericycle, stele, xylem y phloem.
- Extracción de características morfométricas (área, perímetro, distancia al centroide) y topológicas.
- Uso de embeddings de DINOv2 afinado para representación visual de cada célula.
- Salida en formato CSV por célula y una imagen PNG con etiquetas superpuestas.
- Soporte para dos versiones del modelo (v1 y v2) seleccionables por línea de comandos.
- Inferencia en GPU (1.5–3 min por imagen) y en CPU (15–30 min por imagen).
- Integración como librería Python con API `predict_tif`.

## Casos de uso

- Fenotipado de raíces en investigación agronómica: los investigadores pueden cuantificar la distribución de tipos celulares en secciones de raíz para estudiar respuestas a estrés abiótico o mutaciones genéticas, usando el CSV generado para análisis estadísticos posteriores.
- Análisis de desarrollo radicular: el modelo permite comparar la anatomía de raíces en diferentes estadios de desarrollo o entre especies, automatizando la anotación que antes requería horas de trabajo manual.
- Control de calidad en laboratorios de biología vegetal: al integrar RootScope en un pipeline de procesamiento de imágenes, se puede verificar rápidamente si las secciones de raíz contienen los tipos celulares esperados antes de proceder con experimentos más costosos.
- Generación de datos de entrenamiento para otros modelos: las predicciones de RootScope pueden usarse como pseudoetiquetas para entrenar modelos de segmentación o clasificación más ligeros destinados a entornos con menos recursos.
- Educación y divulgación: en cursos de anatomía vegetal, el modelo puede servir como herramienta didáctica para identificar visualmente los tejidos de la raíz, mostrando la superposición etiquetada en la imagen original.
- Integración en pipelines de análisis de imágenes de alta productividad: dado que la inferencia es relativamente rápida en GPU, puede procesarse un lote de imágenes TIFF de forma secuencial o paralela para estudios que requieran grandes volúmenes de datos.

## Benchmarks y rendimiento

La model card reporta la precisión en un conjunto de test reservado, con 864 características y 9 clases, para cada clasificador individual:

| Modelo | Precisión en test | IC 95% |
|---|---|---|
| XGBoost | 0.861 | 0.828 – 0.895 |
| LightGBM | 0.858 | 0.823 – 0.895 |
| RandomForest | 0.832 | 0.798 – 0.869 |

No se proporcionan resultados de benchmarks comparativos con otros modelos de clasificación de tipos celulares en raíces. El tiempo de inferencia es de aproximadamente 1.5–3 minutos por imagen en una GPU y 15–30 minutos en CPU.

## Requisitos de hardware

- VRAM estimada: no especificada, pero el backbone DINOv2 ViT-B/14 (330 MB) y los modelos de árboles (100 MB máximo) sugieren que cabe en GPUs con 4 GB o más. El proceso de segmentación con Cellpose-SAM puede requerir más memoria, aunque no se indica.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, A100). El modelo no es exigente en comparación con LLMs.
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas como RTX 3060 o superiores.
- Opciones de despliegue: se distribuye como librería Python (`rootscope`) con interfaz CLI y API. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: ~1.5–3 min por imagen en GPU, ~15–30 min en CPU. No se proporcionan mediciones de throughput en lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (clasificación de tipos celulares en raíces a partir de microscopía confocal). Existen herramientas como 4DRoot para fenotipado de raíces en 3D, pero no realizan clasificación de tipos celulares en secciones 2D. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El parámetro `--um-per-px` debe configurarse manualmente con la escala real de la imagen; el valor por defecto de 1.0 distorsiona todas las características de tamaño (área, perímetro, distancia al centroide), lo que puede degradar la precisión.
- La entrada debe ser una imagen cruda, no una máscara de segmentación precalculada.
- El modelo está entrenado específicamente para secciones transversales de puntas de raíz; su rendimiento en otros tejidos u organismos no está garantizado.
- La inferencia en CPU es considerablemente lenta (15–30 min por imagen), lo que puede ser un cuello de botella en flujos de trabajo sin GPU.
- scikit-learn está fijado a la versión 1.7.2; usar otras versiones puede provocar incompatibilidades al cargar los archivos `.joblib`.
- No se han publicado análisis de sesgos ni de robustez frente a variaciones en la adquisición de imágenes (diferentes microscopios, fluoróforos, etc.).
- El modelo no es un sistema de visión general; su uso fuera del dominio de la anatomía radicular puede producir resultados sin sentido.

## Enlaces

- HuggingFace: https://huggingface.co/ct-tranchau/Rootscope
- Repositorio GitHub (mencionado en la model card): https://github.com/ct-tranchau/Rootscope.git
- Perfil del autor en HuggingFace: https://huggingface.co/ct-tranchau
- Contacto del autor: tnchau@vt.edu

# mvdelibas/mars-landmark-hirise-yolo11s-cls

## Resumen

Mars landmark classifier es un modelo de clasificación de imágenes desarrollado por mvdelibas que identifica ocho tipos de accidentes geográficos en la superficie de Marte a partir de parches de la cámara HiRISE (High Resolution Imaging Science Experiment) de la misión Mars Reconnaissance Orbiter. El modelo se enmarca en la tarea de referencia Mars-Bench (mb-landmark_cls) y resuelve el problema de etiquetado automático de regiones marcianas para investigación planetaria, una tarea que tradicionalmente requiere revisión manual por especialistas.

Técnicamente es un fine-tuning del clasificador YOLO11s-cls de Ultralytics, una red convolucional de la familia YOLO11 adaptada a clasificación de imagen con entrada de 224 píxeles. El modelo parte de los pesos preentrenados oficiales de Ultralytics y se ajusta sobre el conjunto de datos Mars-Bench, publicado en Zenodo con licencia CC BY 4.0. Las ocho clases son cráter, araña, duna oscura, duna clara, estría de pendiente, eyección de impacto, terreno "queso suizo" y "otros", con nombres internos en turco.

Su relevancia es acotada pero concreta: demuestra la aplicabilidad de arquitecturas YOLO ligeras a la teledetección planetaria, con un rendimiento alto en top-1 (90,4 %) pero muy condicionado por el fuerte desbalance de clases, ya que la clase "otros" concentra la mayoría de las muestras. Es un modelo de investigación, no un sistema de producción para cartografía científica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s-cls (Ultralytics), CNN para clasificación de imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 224x224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | AGPL-3.0 (pesos derivados de Ultralytics); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | PyTorch (.pt), compatible con Ultralytics |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11s-cls, la variante "small" del clasificador de la familia YOLO11 de Ultralytics. Se trata de una red convolucional con entrada fija de 224x224 píxeles que produce una distribución de probabilidad sobre ocho clases. El modelo se inicializa desde los pesos preentrenados oficiales de Ultralytics y se ajusta (fine-tuning) sobre el conjunto Mars-Bench mb-landmark_cls.

Los datos de entrenamiento provienen del conjunto Mars-Bench (Zenodo, DOI 10.5281/zenodo.15494633), con imágenes de NASA/JPL/University of Arizona capturadas por HiRISE. El conjunto presenta un desbalance severo: la clase "otros" (diger) cuenta con 1.603 muestras de validación, mientras que clases como duna oscura (koyu_kumul) o duna clara (parlak_kumul) apenas tienen 11-12 muestras. No se documenta en la información disponible el número total de tokens de entrenamiento (no aplica), la composición exacta del split de entrenamiento ni si se emplearon técnicas de aumento de datos o reequilibrado de clases. El autor reporta un coste de entrenamiento de 1,04 CR (unidades de la plataforma de entrenamiento), sin más detalles.

## Capacidades

- Clasificación de imágenes de la superficie marciana en ocho categorías: cráter (krater), araña (orumcek), duna oscura (koyu_kumul), duna clara (parlak_kumul), estría de pendiente (egim_cizgisi), eyección de impacto (carpma_ejektasi), terreno "queso suizo" (isvicre_peyniri) y otros (diger).
- Procesamiento de parches HiRISE de 224x224 píxeles.
- Salida de probabilidades por clase (top-1 y top-5) mediante la API de Ultralytics.
- Integración con el ecosistema Ultralytics (`YOLO.predict`), lo que permite su uso en pipelines de visión existentes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto, audio o vídeo.
- Capacidad multilingüe limitada a la documentación (inglés y turco); las etiquetas de clase están en turco.

## Casos de uso

- Preetiquetado de datasets planetarios: el modelo puede generar etiquetas iniciales sobre grandes volúmenes de parches HiRISE para que especialistas las revisen y corrijan, reduciendo el coste de anotación manual en proyectos de cartografía marciana.
- Filtrado y triaje de imágenes: dado un archivo de imágenes HiRISE, el modelo permite descartar rápidamente parches sin interés geológico (clase "otros") y priorizar la revisión de regiones con cráteres, dunas o terrenos "queso suizo".
- Detección de dunas para estudios de dinámica eólica: la clasificación de dunas oscuras y claras permite alimentar análisis de distribución y migración de campos de dunas en regiones concretas de Marte.
- Identificación de "arañas" (terreno estriado polar): útil para estudios de sublimación de hielo de CO2 en latitudes polares, aunque con la advertencia de su bajo F1 (34,2 %).
- Búsqueda de eyecciones de impacto: el modelo puede servir como primer filtro para localizar candidatos a eyecciones en imágenes de alta resolución, que luego se validan manualmente.
- Prototipado y docencia: por su tamaño reducido y su integración con Ultralytics, es adecuado para experimentos de teledetección planetaria en entornos con recursos limitados y para formación de estudiantes en clasificación de imágenes científicas.
- Benchmarking de modelos de visión planetaria: sirve como línea base para comparar arquitecturas en la tarea Mars-Bench mb-landmark_cls.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de validación de Mars-Bench (mejor época, época 57):

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 90,4 % |
| Top-5 accuracy | 99,2 % |
| Macro F1 | 62,9 % |
| Macro precision | 67,6 % |
| Macro recall | 62,6 % |
| Accuracy desde matriz de confusión | 89,8 % |

Resultados por clase (validación):

| Clase | Soporte | Precisión | Recall | F1 |
|---|---:|---:|---:|---:|
| diger (otros) | 1603 | 0,936 | 0,956 | 0,946 |
| krater (cráter) | 191 | 0,850 | 0,681 | 0,756 |
| egim_cizgisi (estría de pendiente) | 86 | 0,674 | 0,698 | 0,686 |
| isvicre_peyniri (queso suizo) | 73 | 0,705 | 0,918 | 0,798 |
| orumcek (araña) | 31 | 0,700 | 0,226 | 0,342 |
| carpma_ejektasi (eyección de impacto) | 18 | 0,500 | 0,556 | 0,526 |
| koyu_kumul (duna oscura) | 12 | 0,429 | 0,250 | 0,316 |
| parlak_kumul (duna clara) | 11 | 0,615 | 0,727 | 0,667 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Por el tamaño de la variante "small" de YOLO11-cls, es previsible que quepa en GPUs de consumo, pero no se confirma con datos.
- GPU recomendadas: no disponible. La arquitectura YOLO11s-cls es ligera y puede ejecutarse en CPU, aunque no se documentan latencias.
- Compatibilidad con GPU de consumo: probable por la familia YOLO11s, pero no confirmada en la información disponible.
- Opciones de despliegue: Ultralytics (PyTorch), y exportación a formatos soportados por Ultralytics (ONNX, TensorRT, CoreML, etc.) según la documentación de la librería, aunque el autor no lo detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar como referencia la propia familia YOLO11-cls de Ultralytics (variantes n, s, m, l, x) como base arquitectónica, pero no hay datos de rendimiento comparativo en la tarea Mars-Bench.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mars landmark classifier (este modelo) | no disponible | no aplica (224x224 px) | Top-1 90,4 %, macro F1 62,9 % | AGPL-3.0 | Hugging Face |
| Otros modelos Mars-Bench | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fuerte desbalance de clases: la clase "otros" domina el conjunto (1.603 de 2.025 muestras de validación), lo que infla la accuracy global y hace que las métricas por clase sean mucho más bajas (F1 de 31,6 % en duna oscura, 34,2 % en araña).
- Soportes de validación muy pequeños en clases minoritarias (11-18 muestras), por lo que las métricas por clase son inestables y no deben interpretarse como estimaciones fiables.
- El modelo asigna siempre una de sus ocho clases a cualquier imagen de entrada; ante imágenes de otros sensores, regiones o estilos, la salida carece de sentido.
- El rendimiento en datos reales fuera del split de validación será inferior; el autor recomienda validar sobre una muestra propia antes de confiar en el modelo.
- Uso previsto exclusivamente de investigación; no debe emplearse como única fuente para cartografía científica ni para toma de decisiones de misión.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y distribución; el uso comercial requiere evaluar el cumplimiento de la AGPL o adquirir una licencia comercial de Ultralytics.
- Obligación de atribución de los datos (CC BY 4.0) además de la licencia del modelo.
- Etiquetas de clase en turco, lo que puede requerir mapeo para integración en pipelines en otros idiomas.
- No se documentan sesgos específicos más allá del desbalance de clases ni riesgos de alucinación (no aplica en clasificación, pero sí falsos positivos en clases minoritarias).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-landmark-hirise-yolo11s-cls
- Dataset Mars-Bench (Zenodo): https://doi.org/10.5281/zenodo.15494633
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Referencia de Mars-Bench: Purohit, M.; Gajera, B.; Malaviya, V.; Mehta, I.; Kasodekar, K.; Adler, J.; Lu, S.; Rebbapragada, U.; Kerner, H. Mars-Bench: mb-landmark_cls. Zenodo, 2025.

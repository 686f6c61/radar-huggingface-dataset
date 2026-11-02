# akniele/classify_traffic_signs

## Resumen

`classify_traffic_signs` es un modelo de clasificación de imágenes desarrollado por el usuario akniele (según la model card, orientado a señales de tráfico neerlandesas, aunque el identificador del repositorio no incluye el sufijo `_nl_`). Se basa en la arquitectura YOLO26s-cls de Ultralytics, partiendo de pesos preentrenados en ImageNet (`yolo26s-cls.pt`) y afinado durante 30 épocas sobre recortes de señales de tráfico obtenidos de la plataforma Panoramax. El modelo resuelve la segunda etapa de un pipeline de dos pasos: la detección previa de la señal y la clasificación posterior de su clase según el código RVV 1990 neerlandés.

El modelo distingue 170 clases, que cubren señales de advertencia, prioridad, aparcamiento, límites de velocidad, prohibiciones y algunas señales no estrictamente viarias (bocas de riego, chevrones, balizas, señales náuticas de velocidad máxima para embarcaciones y señales de prohibición de alcohol). El conjunto de entrenamiento consta de 19.374 imágenes y el de validación de 4.760, con una resolución de entrada de 224 × 224 píxeles.

La relevancia de este modelo es acotada y muy específica: no es un modelo de lenguaje ni un modelo generativo, sino un clasificador de visión por computador de dominio restringido (señalización viaria neerlandesa) pensado para integrarse en pipelines de inventario o auditoría de señalización a partir de imágenes de Panoramax. No se dispone de información sobre licencia, idiomas soportados ni métricas de rendimiento publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s-cls (Ultralytics), clasificador de imágenes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 × 224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación visual, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card no especifica el formato de los pesos publicados) |

## Arquitectura y entrenamiento

El modelo es un clasificador de imágenes basado en YOLO26s-cls de Ultralytics, una variante de la familia YOLO26 orientada a clasificación (no a detección). Parte de pesos preentrenados en ImageNet y se afina durante 30 épocas sobre recortes de señales de tráfico de los Países Bajos extraídos de la plataforma Panoramax. La entrada es de 224 × 224 píxeles y la salida es una distribución sobre 170 clases correspondientes a códigos RVV 1990 y a algunas categorías auxiliares.

El pipeline completo en el que se integra consta de dos etapas: primero un modelo de detección (`Panoramax/detect_face_plate_sign`, aunque la model card enlaza a `Panoramax/detect_nl_subsigns`) localiza el recorte de la subseñal, y después este clasificador asigna la clase. No se detalla en la información disponible la composición exacta del dataset de entrenamiento (distribución por clase, balanceo, aumentos de datos aplicados), ni si se emplearon técnicas de regularización o ajuste de hiperparámetros más allá de las 30 épocas indicadas. Tampoco se documenta el uso de destilación, decodificación especulativa ni otras innovaciones técnicas.

## Capacidades

- Clasificación de imágenes de señales de tráfico neerlandesas en 170 clases según el código RVV 1990.
- Reconocimiento de señales de advertencia (peligro, cruces, obras, resbalones, paso a nivel, etc.).
- Reconocimiento de señales de prioridad, prohibición, obligación y aparcamiento.
- Reconocimiento de límites de velocidad (A01-5 a A01-120) y sus variantes de fin de limitación (A02-*).
- Reconocimiento de señales auxiliares no estrictamente viarias: bocas de riego secas, chevrones, balizas de canalización, señales náuticas de velocidad máxima y señales de prohibición de alcohol.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador visual puro.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras capacidades generativas.

## Casos de uso

- Inventario automatizado de señalización viaria: integrado tras el detector de subseñales, permite catalogar las señales presentes en imágenes de Panoramax y generar bases de datos georreferenciadas de señalización por código RVV.
- Auditoría de cumplimiento normativo: comparar las señales detectadas y clasificadas con la normativa RVV 1990 para identificar señalización ausente, obsoleta o incorrecta en tramos concretos.
- Mantenimiento predictivo de infraestructura: procesar lotes de imágenes de carretera para detectar señales de obras, desvíos (T201) o limitaciones temporales y priorizar inspecciones.
- Análisis de seguridad vial: extraer estadísticas de presencia de señales de peligro (J01–J39) y de prioridad (B03–B06) en cruces para estudios de accidentalidad.
- Digitalización de mapas: enriquecer cartografía con atributos de señalización (límites de velocidad, sentidos únicos, prohibiciones de giro) a partir de imágenes de calle.
- Control de calidad de datasets de conducción autónoma: etiquetar o verificar automáticamente recortes de señales neerlandesas en conjuntos de entrenamiento de sistemas ADAS.
- Monitorización de señalización náutica y auxiliar: clasificar señales de velocidad máxima para embarcaciones y elementos auxiliares (bocas de riego, balizas) en inventarios de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño típico de un clasificador YOLO26s-cls (variante "s"), la inferencia es ligera, pero no se confirma el dato.
- GPU recomendadas: no disponible; un clasificador de este tipo suele ejecutarse en GPU consumer, pero no se especifica en la documentación.
- Compatibilidad con GPU consumer: no confirmada en la información disponible.
- Opciones de despliegue: no disponible (no se documenta exportación a ONNX, TensorRT, OpenVINO ni otros formatos).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación de señales de tráfico neerlandesas ni métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica señales de tráfico neerlandesas (RVV 1990) y algunas categorías auxiliares; no es aplicable a otros países ni a otras tareas de visión.
- Dependencia del pipeline: requiere que la etapa de detección previa localice correctamente el recorte de la subseñal; errores de detección degradan la clasificación.
- Sesgos de datos: el entrenamiento se basa en imágenes de Panoramax, por lo que la distribución de clases, condiciones de iluminación, ángulos y calidad de imagen puede no representar todos los escenarios reales.
- Riesgo de confusión entre clases visualmente similares (por ejemplo, variantes de límite de velocidad o de fin de limitación) no cuantificado en la información disponible.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es un caveat crítico para producción.
- Sin métricas publicadas: no hay precisión, recall ni matriz de confusión disponibles, lo que impide evaluar su fiabilidad antes de desplegarlo.
- Sin información sobre cuantización ni formatos de exportación: la integración en producción requiere validación propia.
- El identificador del repositorio (`classify_traffic_signs`) no coincide con el título de la model card (`classify_nl_traffic_signs`), lo que puede generar confusión en la trazabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akniele/classify_traffic_signs
- Modelo de detección previo citado en la model card: https://huggingface.co/Panoramax/detect_nl_subsigns
- Plataforma Panoramax: https://panoramax.fr
- Ultralytics (familia YOLO): no se proporciona enlace en la información disponible.

# sdoerrich97/true_colon_rtdetr_realcolon_s42

## Resumen

TRUE-Colon RT-DETR es un detector de objetos de una sola clase (`lesion`) entrenado sobre el conjunto de datos REAL-Colon, compuesto por 60 procedimientos completos de colonoscopia sin editar. El modelo ha sido desarrollado por la Cátedra de Aprendizaje Automático Explicable de la Universidad Otto-Friedrich de Bamberg y se publica como parte del protocolo de evaluación TRUE-Colon, presentado en el taller EndoLINA de MICCAI 2026. Su propósito principal es servir como referencia reproducible para la investigación en detección de pólipos y para el estudio de metodologías de evaluación en sistemas de detección asistida por vídeo.

El modelo utiliza la arquitectura RT-DETR con una entrada de 640×640 píxeles y se distribuye con pesos preentrenados en COCO. Es una de las tres semillas entrenadas; el artículo original agrega los resultados de las tres para evitar conclusiones basadas en una única ejecución. La licencia es AGPL-3.0, heredada de Ultralytics, lo que implica obligaciones de divulgación del código fuente si se utiliza en un producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (backbone RT-DETR, detección de objetos) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (detección de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RT-DETR, un detector de objetos basado en transformer con decodificador DETR, optimizado para inferencia en tiempo real. La entrada es de 640×640 píxeles y produce una única clase de salida: `lesion`. El entrenamiento se realizó sobre el conjunto REAL-Colon, que incluye 60 procedimientos completos de colonoscopia de 4 instituciones, con una división a nivel de paciente. El 86,47% de los fotogramas de entrenamiento no contienen lesiones, lo que refleja la distribución real de los procedimientos.

La configuración de entrenamiento incluye un tamaño de lote de 66, optimizador SGD con tasa de aprendizaje inicial de 0,01, momento de 0,9 y decaimiento de peso de 5e-4. Se entrenó durante 100 épocas con parada temprana (paciencia 10) y un calentamiento de 3 épocas. Los pesos se inicializaron a partir de un modelo preentrenado en COCO, tal como lo distribuye Ultralytics. La versión de Ultralytics utilizada fue la 8.3.232. El optimizador se resolvió como SGD porque el número total de iteraciones (2.585.900) supera el umbral de 10.000 que establece el ajuste `auto` del framework.

## Capacidades

- Detección de lesiones (pólipos) en fotogramas individuales de vídeo de colonoscopia.
- Salida de una única clase (`lesion`) con caja delimitadora y puntuación de confianza.
- Inferencia en tiempo real gracias a la arquitectura RT-DETR, adecuada para procesamiento de vídeo.
- Integración sencilla con el ecosistema Ultralytics (carga con `YOLO` o `RTDETR`).
- Evaluación reproducible mediante el paquete `true_colon` y el protocolo TRUE-Colon.
- No incluye capacidades de razonamiento, generación de texto, tool calling ni procesamiento multimodal más allá de la imagen.

## Casos de uso

- Investigación en detección de pólipos: el modelo sirve como punto de partida para estudiar algoritmos de detección en colonoscopia, permitiendo reproducir el benchmark TRUE-Colon y comparar arquitecturas.
- Evaluación de metodologías de detección asistida por vídeo: gracias al protocolo asociado, se puede analizar si la precisión de localización (mAP) predice el comportamiento real en procedimientos completos, un problema central en el campo.
- Desarrollo de sistemas de apoyo a la endoscopia en entornos de investigación: el modelo puede integrarse en prototipos para estudiar la interacción entre el detector y el clínico, siempre fuera del ámbito clínico real.
- Formación y docencia: como ejemplo de detector de objetos en imágenes médicas, es útil para enseñar técnicas de entrenamiento y evaluación de modelos de visión en dominios especializados.
- Análisis de sesgos y limitaciones: al estar entrenado en un conjunto concreto de procedimientos, permite estudiar cómo varía el rendimiento con distintos equipos de endoscopia, modos de imagen o poblaciones de pacientes.
- Reproducibilidad de resultados: al publicarse la semilla 42 y el código de entrenamiento, se puede verificar la reproducibilidad de los experimentos y extenderlos con nuevas semillas o variaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el artículo reporta resultados agregados de las tres semillas y que el rendimiento se evalúa con el protocolo TRUE-Colon, que define un punto de operación con umbral de confianza tau* = 0.30 y una tasa de falsos positivos objetivo del 4-5%. Sin embargo, no se proporcionan valores numéricos concretos en esta ficha.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la model card. Dado que el modelo es un detector RT-DETR con entrada de 640×640 y un único peso de aproximadamente 0.1 GB, es probable que pueda ejecutarse en GPUs de consumo medio, pero no se puede confirmar sin datos adicionales. Se recomienda consultar la documentación de Ultralytics para estimar requisitos según el dispositivo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la model card. No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- No es un dispositivo médico y no debe utilizarse para la toma de decisiones clínicas. El propio artículo concluye que el rendimiento en condiciones realistas de procedimiento completo es insuficiente para un despliegue clínico fiable.
- El modelo se entrenó con 60 procedimientos de 4 instituciones; el hardware de endoscopia, el modo de imagen y la población de pacientes pueden degradar el rendimiento fuera de ese contexto.
- La precisión en lesiones pequeñas es casi nula; la detección se concentra en lesiones medianas y grandes.
- Dos subtipos histológicos (SSL y TSA) solo aparecen en el conjunto de prueba, y las lesiones sésiles serradas presentan las mayores tasas de fallo de detección.
- El modelo opera a nivel de fotograma, sin modelo temporal: cada imagen se puntúa de forma independiente, lo que puede generar inconsistencias en vídeo.
- La licencia AGPL-3.0 impone obligaciones de divulgación del código fuente si se utiliza en un producto, a diferencia de la licencia MIT del paquete de evaluación `true_colon`.

## Enlaces

- HuggingFace: https://huggingface.co/sdoerrich97/true_colon_rtdetr_realcolon_s42
- Paper (arXiv): https://arxiv.org/abs/2608.13711
- Repositorio GitHub: https://github.com/sdoerrich97/true-colon
- Paquete de protocolo (PyPI): https://pypi.org/project/true-colon/

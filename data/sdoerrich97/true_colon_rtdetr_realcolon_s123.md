# sdoerrich97/true_colon_rtdetr_realcolon_s123

## Resumen

TRUE-Colon es un detector de objetos de una sola clase (lesión) basado en RT-DETR, entrenado sobre el conjunto de datos REAL-Colon, compuesto por 60 procedimientos completos de colonoscopia sin editar. Lo desarrolla la Cátedra de Machine Learning Explicable de la Universidad Otto-Friedrich de Bamberg y se publica junto con el protocolo de evaluación TRUE-Colon, presentado en el taller EndoLINA de MICCAI 2026. El modelo aborda un problema concreto: la brecha entre la precisión de localización medida con métricas clásicas como COCO mAP y el comportamiento real en procedimientos completos, donde la mayoría de los fotogramas no contienen lesiones y la tasa de falsas alertas condiciona la utilidad clínica.

La arquitectura es RT-DETR (Real-Time Detection Transformer), un detector basado en transformer que procesa imágenes de 640x640 píxeles y devuelve cajas delimitadoras para la clase lesion. El repositorio pesa 0,1 GB e incluye los pesos en formato .pt de Ultralytics. Esta es una de las tres semillas entrenadas; el artículo científico agrega los resultados de las tres y advierte explícitamente de que reportar una semilla aislada sobrestimaría la precisión real del sistema. La licencia es AGPL-3.0, heredada de Ultralytics, lo que impone obligaciones de código abierto si los pesos se integran en un producto.

El modelo está pensado para investigación y reproducción del benchmark TRUE-Colon, no para uso clínico. El propio artículo concluye que el rendimiento bajo condiciones realistas de procedimiento completo sigue siendo insuficiente para un despliegue clínico fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (backbone RT-DETR, entrada 640x640) |
| Parametros totales | No disponible (repo de 0,1 GB en .pt) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (deteccion de objetos) |
| Tipos de cuantizacion | No disponible (se distribuye como .pt de Ultralytics) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

RT-DETR es un detector de objetos en tiempo real basado en transformer, que combina un backbone convolutional con un decodificador híbrido que refina las consultas de objetos mediante atención. A diferencia de los detectores anchor-based clásicos, RT-DETR no requiere propuestas ni NMS, lo que simplifica el pipeline y permite inferencia a alta velocidad. En esta implementación de Ultralytics, el modelo se inicializa con pesos preentrenados en COCO y se ajusta finamente en el dataset REAL-Colon.

El entrenamiento se realizó con un split a nivel de paciente, manteniendo un 86,47% de fotogramas sin lesión en el conjunto de entrenamiento, lo que refleja la distribución real de los procedimientos. Se usó SGD con tasa de aprendizaje inicial 0,01, momentum 0,9 y weight decay 5e-4, con un batch size de 66 y un total de 100 épocas, early stopping con paciencia 10 y warm-up de 3 épocas. El optimizador se resolvió como SGD porque el presupuesto de iteraciones supera las 10.000, según el comportamiento de `optimizer=auto` de Ultralytics. La versión del framework es 8.3.232.

## Capacidades

- Deteccion de lesiones (polipos) en imagenes de colonoscopia, devolviendo cajas delimitadoras con una unica clase `lesion`.
- Inferencia en tiempo real gracias a la arquitectura RT-DETR, adecuada para analisis de video.
- Evaluacion bajo el protocolo TRUE-Colon, que mide el comportamiento en procedimientos completos, no solo la precision de localizacion.
- No soporta generacion de texto, tool calling, agentes, vision multimodal ni otras capacidades fuera de la deteccion de objetos.

## Casos de uso

- Investigacion en deteccion de polipos: permite reproducir y extender los resultados del benchmark TRUE-Colon, comparando arquitecturas bajo un protocolo estandarizado.
- Evaluacion de metodologias de deteccion asistida por computadora: el protocolo asociado (paquete `true-colon`) ofrece metricas orientadas a despliegue, como la tasa de falsas alertas a un punto de operacion fijado.
- Analisis de transferencia entre dominios: al estar entrenado en 4 instituciones con distinto hardware de endoscopio, sirve para estudiar como cambia el rendimiento ante variaciones de equipo, modo de imagen y poblacion.
- Desarrollo de sistemas de ayuda al diagnostico en entornos de investigacion: puede integrarse en pipelines de procesamiento de video para explorar estrategias de post-procesado temporal, aunque sin validez clinica.
- Entrenamiento de modelos mas robustos: los pesos pueden usarse como inicializacion para fine-tuning en otros datasets de endoscopia, siempre que se respete la licencia AGPL-3.0.
- Comparacion de semillas y variabilidad: al ser una de tres semillas, permite estudiar la varianza del entrenamiento y la necesidad de agregar resultados en la evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta semilla en la informacion disponible. La model card indica explicitamente que los numeros por semilla no se reproducen porque el articulo reporta los resultados agregados de las tres semillas. El punto de operacion recomendado es tau* = 0,30, que apunta a una tasa de falsos positivos por fotograma del 4-5%. Para los valores completos, consulte el articulo en arXiv (2608.13711).

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la informacion proporcionada.
- El archivo de pesos ocupa aproximadamente 0,1 GB, lo que sugiere un modelo de tamano moderado (probablemente RT-DETR-L o similar, aunque no se confirma).
- Para inferencia en GPU, una tarjeta con 4-8 GB de VRAM deberia ser suficiente, pero no hay datos oficiales de consumo.
- Se puede ejecutar con Ultralytics tanto en CPU como en GPU; la inferencia en tiempo real requerira una GPU dedicada.
- Opciones de despliegue: el modelo se carga con `YOLO` o `RTDETR` de Ultralytics, por lo que es compatible con herramientas como vLLM, Ollama o TGI solo si se adapta, aunque no es el flujo habitual para detectores de objetos.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos en la informacion proporcionada. La model card no menciona alternativas ni ofrece tablas comparativas con otros detectores de polipos. Para una comparacion rigurosa, es necesario consultar el articulo de TRUE-Colon, que agrega los resultados de tres semillas y los situa frente a otros metodos bajo el mismo protocolo.

## Limitaciones y advertencias

- No es un dispositivo medico y no debe utilizarse para la toma de decisiones clinicas. El propio articulo concluye que el rendimiento bajo condiciones realistas es insuficiente para un despliegue clinico fiable.
- La deteccion esta dominada por lesiones medianas y grandes; la precision media en lesiones pequenas es casi cero.
- Dos subtipos histologicos (SSL y TSA) aparecen solo en el split de test, y las lesiones sersiles dentadas presentan las mayores tasas de fallo.
- El modelo opera a nivel de fotograma, sin modelado temporal: cada imagen se puntua de forma independiente, lo que limita su uso en video sin post-procesado adicional.
- Entrenado en solo 60 procedimientos de 4 instituciones; el hardware de endoscopio, el modo de imagen y la poblacion de pacientes pueden degradar el rendimiento fuera de ese dominio.
- La licencia AGPL-3.0, heredada de Ultralytics, impone obligaciones de divulgacion del codigo fuente si los pesos se integran en un producto o servicio. No es la licencia MIT del paquete de evaluacion `true_colon`.
- No se proporcionan datos de sesgos demograficos o de equipos especificos; la variabilidad entre instituciones es una limitacion reconocida.

## Enlaces

- HuggingFace: https://huggingface.co/sdoerrich97/true_colon_rtdetr_realcolon_s123
- Paper (arXiv): https://arxiv.org/abs/2608.13711
- Repositorio del proyecto: https://github.com/sdoerrich97/true-colon
- Paquete de protocolo en PyPI: https://pypi.org/project/true-colon/
- Contacto del autor: sebastian.doerrich@uni-bamberg.de

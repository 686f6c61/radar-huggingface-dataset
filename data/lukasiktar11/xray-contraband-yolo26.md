# lukasiktar11/xray-contraband-yolo26

## Resumen

xray-contraband-yolo26 es un modelo de detección de objetos basado en la arquitectura YOLO26, entrenado por el usuario lukasiktar11 para identificar artículos prohibidos en imágenes de escáner de rayos X de equipaje. El modelo se distribuye a través de HuggingFace con la librería Ultralytics y formato de pesos ONNX, lo que facilita su integración en pipelines de inferencia sin depender del framework de entrenamiento original.

El modelo se presenta como parte del catálogo ComputerVisionAIHub y está entrenado sobre el conjunto de datos SPXray, con 12 clases de objetos prohibidos. Su relevancia práctica reside en la aplicación de visión por computador a la seguridad aeroportuaria y de instalaciones, un ámbito donde la detección automatizada de amenazas en imágenes de rayos X puede servir como capa de apoyo al operador humano.

La información publicada por el autor es muy limitada: no se detallan parámetros, contexto (no aplica en detección), datos de entrenamiento más allá del nombre del dataset, ni resultados de benchmarks. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26 (detección de objetos, familia Ultralytics) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; cuantizaciones adicionales no documentadas) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (librería Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 de Ultralytics, una familia de detectores de objetos de una sola etapa orientada a inferencia en tiempo real. La información publicada no especifica la variante concreta (n, s, m, l o x), el número de parámetros ni la resolución de entrada empleada durante el entrenamiento o la exportación a ONNX.

El entrenamiento se realizó sobre el dataset SPXray, que según la model card contiene 12 clases de artículos prohibidos en escaneos de rayos X de equipaje. No se documentan el número de imágenes, la composición exacta de las clases, el esquema de aumentación de datos, la función de pérdida ni si se aplicaron técnicas de destilación o ajuste fino adicional. Tampoco se indica el hardware ni la duración del entrenamiento.

## Capacidades

- Detección de objetos en imágenes de rayos X de equipaje, con 12 clases de artículos prohibidos definidas en el dataset SPXray.
- Salida de cajas delimitadoras con clase y puntuación de confianza, en formato estándar de detección de Ultralytics.
- Exportación a ONNX, lo que permite ejecución en ONNX Runtime y otros runtimes compatibles.
- Inferencia sobre imágenes individuales o lotes, según el pipeline de Ultralytics.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión para detección.
- Capacidades multilingües: no aplica.

## Casos de uso

- Triaje automatizado en control de equipajes: el modelo procesa imágenes de escáner y genera detecciones con puntuación de confianza que el operador revisa, reduciendo el tiempo de inspección manual en colas de seguridad.
- Segunda opinión para operadores humanos: integrado como capa de verificación sobre las imágenes ya revisadas, permite señalar regiones potencialmente omitidas y estandarizar el criterio de inspección.
- Auditoría y análisis retrospectivo: al ejecutarse en lote sobre archivos históricos de escaneos, permite revisar imágenes almacenadas y detectar patrones de objetos prohibidos para informes de seguridad.
- Formación de personal: las detecciones del modelo pueden usarse como referencia en simulacros y sesiones de entrenamiento de operadores de rayos X, mostrando objetos de interés sobre imágenes reales anonimizadas.
- Investigación en visión por computador aplicada a rayos X: sirve como línea base reproducible para comparar arquitecturas de detección sobre el dataset SPXray en experimentos académicos.
- Prototipado de sistemas de inspección en instalaciones no aeroportuarias: aduanas, accesos a eventos o control de paquetería, donde se requiere un detector ligero exportable a ONNX para desplegar en hardware modesto.
- Integración en pipelines de videovigilancia de escáneres: ejecutado sobre fotogramas sucesivos de un escáner en funcionamiento, puede generar alertas en tiempo real si el throughput del hardware lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al desconocerse la variante de YOLO26 y el número de parámetros. El repositorio completo ocupa 0,1 GB, lo que sugiere un modelo de tamaño reducido que probablemente cabe en GPUs de consumo.
- GPU recomendadas: no disponibles. Por la familia arquitectónica, cabría esperar ejecución viable en GPUs consumer (RTX 3060 en adelante) y en GPUs de datacenter (A100, H100) para lotes grandes, pero el autor no publica mediciones.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio; sin confirmación oficial.
- Opciones de despliegue: ONNX Runtime (formato publicado), y potencialmente TensorRT, OpenVINO o ejecución en CPU mediante ONNX Runtime, siempre que la exportación sea compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: no se conocen los parámetros, la resolución de entrada ni los resultados del modelo en el dataset SPXray, y no se han identificado en la información proporcionada modelos comparables entrenados específicamente sobre SPXray con la misma taxonomía de 12 clases.

| Modelo | Arquitectura | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|
| xray-contraband-yolo26 | YOLO26 | SPXray (12 clases) | AGPL-3.0 | HuggingFace, ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de métricas: no se publican mAP, precisión, recall ni curvas PR, por lo que no es posible evaluar la fiabilidad del detector antes de desplegarlo.
- Dataset no documentado en detalle: se desconoce el número de imágenes, el balance entre clases y la procedencia de los escaneos, lo que impide estimar el sesgo hacia clases mayoritarias o hacia un tipo concreto de escáner.
- Riesgo de falsos negativos en producción: un detector sin validación publicada puede omitir objetos prohibidos, con consecuencias críticas en un contexto de seguridad; nunca debe sustituir al operador humano.
- Dominio estrecho: el modelo está entrenado exclusivamente sobre imágenes de rayos X del dataset SPXray; su comportamiento sobre otros escáneres, resoluciones o protocolos de captura es desconocido.
- Licencia AGPL-3.0: el uso comercial en servicios de red exige liberar el código fuente derivado bajo la misma licencia, lo que puede ser incompatible con productos propietarios; conviene revisar las obligaciones antes de integrarlo.
- Sin soporte declarado ni mantenimiento visible: cero descargas y cero likes en el momento de la consulta, sin issues ni documentación adicional; el soporte depende únicamente del autor.
- Formato ONNX sin especificar opset ni resolución de entrada: la integración requiere inspeccionar el grafo del modelo para conocer las dimensiones esperadas.
- Riesgo de alucinación en sentido amplio: como todo detector, puede producir cajas espurias sobre texturas ambiguas típicas de las imágenes de rayos X (solapamientos, objetos densos, materiales orgánicos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lukasiktar11/xray-contraband-yolo26
- Repositorio Ultralytics (framework base): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- ONNX Runtime: https://onnxruntime.ai
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni al dataset SPXray.

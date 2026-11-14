# kaopanboonyuen/KAO-TerraMind-A-Postdam

## Resumen

KAO-TerraMind-A-Postdam es un checkpoint de segmentación semántica densa obtenido mediante ajuste fino supervisado del modelo fundacional geoespacial TerraMind-1.0-base (IBM/ESA) sobre el conjunto de datos aéreo ISPRS Potsdam. Lo desarrolla el investigador kaopanboonyuen como parte de la familia KAO-TerraMind, un conjunto de tres adaptaciones controladas de un solo factor sobre la misma receta de entrenamiento, cuyo objetivo es aislar el efecto de cambios concretos (optimización, función de pérdida y decodificador) en el rendimiento final. Este repositorio corresponde a la variante A, centrada en una adaptación más agresiva del backbone.

El modelo resuelve una tarea de segmentación por píxel en seis clases (superficies impermeables, edificios, vegetación baja, árboles, coches y clutter) sobre ortofotos RGB aéreas con resolución de 5 cm. La arquitectura combina el encoder de TerraMind-1.0-base con un decodificador UperNet gestionado a través de TerraTorch, sumando 97,60 M de parámetros. Su relevancia actual radica en que se publica como checkpoint totalmente especificado y reproducible para una comunicación enviada a CVPR 2027, con el código de entrenamiento retenido mientras el artículo está en revisión.

El interés práctico para desarrolladores e investigadores es doble: por un lado, ofrece un punto de partida sólido para tareas de clasificación de cobertura del suelo en imágenes de teledetección; por otro, sirve como referencia metodológica al documentar de forma explícita la receta de entrenamiento compartida por los siete modelos comparados, lo que permite reproducir y auditar los resultados declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder TerraMind-1.0-base (`terramind_v1_base`) + decodificador UperNet (TerraTorch `EncoderDecoderFactory`) |
| Parametros totales | 97,60 M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de 3 x 224 x 224 píxeles (parches RGB) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión fp16 para inferencia) |
| Idiomas soportados | en (metadatos del modelo); la tarea es de visión, no lingüística |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch, `terramind_v1_kaoA_best.pt`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder: el encoder es TerraMind-1.0-base, un modelo fundacional geoespacial preentrenado, inicializado desde `ibm-esa-geospatial/TerraMind-1.0-base`, y el decodificador es UperNet. La entrada es un parche RGB de 3 x 224 x 224 píxeles en escala 0-255, normalizado con las estadísticas de preentrenamiento RGB de TerraMind, y la salida son logits por píxel sobre seis clases. La variante A se distingue por una adaptación más fuerte del backbone: multiplicador de learning rate del encoder de 0,3 (frente a 0,1 en la referencia) y weight decay de 0,05 (frente a 0,01), es decir, 3x y 5x respectivamente.

La receta de entrenamiento es idéntica para los siete modelos comparados en el estudio: optimizador AdamW con learning rate base 1e-4 y learning rate del decodificador 1e-4; pérdida de entropía cruzada ponderada por clase (pesos de raíz inversa de frecuencia) más Dice con peso 0,5; 30 épocas con paciencia de parada temprana de 8, seleccionando el checkpoint por mIoU de validación; batch size de 16; muestreador balanceado por clase con 6.000 ventanas por época; ventanas de 224 x 224 con stride de entrenamiento de 112 px; aumentación con volteos horizontal y vertical y rotaciones de 90 grados; precisión fp16 con grad-clip de 1,0; semilla 42; y una única NVIDIA Tesla T4 como hardware. El conjunto de datos es ISPRS Potsdam, con ortofotos RGB aéreas de 5 cm de resolución y 38 teselas de 6000 x 6000 px, usando el split estándar de mmseg/GeoSeg (24 teselas de entrenamiento con algunas reservadas para validación y 14 de test).

## Capacidades

- Segmentación semántica densa por píxel en seis clases de cobertura del suelo sobre imágenes aéreas RGB.
- Procesamiento de parches de 224 x 224 píxeles a resolución nativa de 5 cm.
- Evaluación sobre ventanas no solapadas con bordes rellenados e ignorados, de modo que cada píxel se cuenta exactamente una vez.
- Compatibilidad con el ecosistema TerraTorch (versión >= 1.2.4) para carga e inferencia.
- Inferencia en fp16 con latencia declarada de 15,04 ms por tesela de 224 x 224 en T4 con batch 1.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Actualización de cartografía de cobertura del suelo: el modelo clasifica ortofotos aéreas de 5 cm en seis clases, lo que permite regenerar mapas de uso del suelo a partir de vuelos recientes con un coste de anotación muy inferior al etiquetado manual.
- Monitorización de expansión urbana: la clase de superficies impermeables y la de edificios permiten cuantificar el crecimiento construido entre campañas de ortofotografía, integrando el modelo en un pipeline por teselas de 6000 x 6000 px.
- Inventario de arbolado y vegetación: las clases de árbol y vegetación baja posibilitan estimaciones de cubierta verde en entornos urbanos, útiles para planificación de infraestructura verde y estudios de isla de calor.
- Análisis de aparcamiento y movilidad: la detección de la clase coche sobre ortofotos de alta resolución sirve para estimar ocupación de estacionamientos y patrones de uso del suelo asociados al tráfico.
- Investigación reproducible en modelos fundacionales geoespaciales: al publicarse la receta exacta, el checkpoint y los resultados, sirve como línea base para experimentos de ajuste fino controlado sobre TerraMind u otros backbones.
- Docencia y prototipado en teledetección: con 97,60 M de parámetros y 15,04 ms por tesela en una T4, es viable ejecutar demostraciones interactivas de segmentación en hardware modesto.
- Validación de pipelines de despliegue: su integración con TerraTorch permite probar flujos de inferencia por ventanas, normalización y agregación de predicciones antes de escalar a datasets mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados), sobre el conjunto de test de ISPRS Potsdam:

| Metrica | Valor |
|---|---|
| mIoU (%) | 79,37 |
| Overall Accuracy (%) | 87,07 |
| Macro F1 (%) | 88,36 |
| Macro Precision (%) | 87,31 |
| Macro Recall (%) | 89,46 |

El autor indica una mejora de +0,70 puntos porcentuales de mIoU frente a TerraMind-1.0-base entrenado con la receta idéntica, situando a este checkpoint en la posición 1 de 7 modelos comparados. No se han publicado en la información disponible resultados de benchmarks adicionales ni comparaciones con modelos externos a la familia KAO-TerraMind.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 97,60 M de parámetros en fp16 el peso del modelo ronda los 0,2 GB, por lo que la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor reporta medidas en una NVIDIA Tesla T4; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, con amplio margen, incluidas tarjetas de gama de entrada.
- Opciones de despliegue: TerraTorch (>= 1.2.4) como vía oficial; el checkpoint es un `.pt` de PyTorch, por lo que puede servirse con infraestructura PyTorch estándar. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 15,04 ms por tesela de 224 x 224 en T4 con fp16 y batch 1, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU en ISPRS Potsdam | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAO-TerraMind-A-Postdam | 97,60 M | 3 x 224 x 224 px | 79,37 % | Apache-2.0 | Hugging Face |
| TerraMind-1.0-base (receta idéntica) | no disponible | 3 x 224 x 224 px | 78,67 % (inferido de la mejora de +0,70 pp) | Apache-2.0 | Hugging Face |
| KAO-TerraMind-B y KAO-TerraMind-C | no disponible | 3 x 224 x 224 px | no disponible en esta ficha | Apache-2.0 (según familia) | no disponible |

La comparación se limita a los modelos de la propia familia KAO-TerraMind y a su base, que son los únicos datos aportados. No se dispone de resultados de benchmarks frente a otros modelos de segmentación geoespacial en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden del propio autor; deben tratarse como declaraciones, no como cifras auditadas de forma independiente.
- El código de entrenamiento no se incluye mientras el artículo está en revisión, lo que limita la reproducibilidad completa pese al propósito declarado del repositorio.
- El modelo está especializado en un único dataset y modalidad (RGB aéreo de ISPRS Potsdam a 5 cm); su generalización a otras resoluciones, sensores o regiones geográficas no está documentada.
- No procesa otras modalidades de teledetección (multiespectral, SAR, LiDAR) en esta configuración, que usa únicamente el parche RGB.
- Riesgo de sesgo geográfico y de dominio: al entrenarse sobre Potsdam, puede degradarse en paisajes urbanos o rurales con tipologías constructivas y vegetación distintas.
- Riesgo de error en clases minoritarias o ambiguas (coche, clutter), aunque la pérdida ponderada por clase y el muestreador balanceado mitigan el desequilibrio.
- La licencia Apache-2.0 permite uso comercial, pero debe respetarse la atribución correspondiente y verificarse las condiciones del modelo base y del dataset ISPRS Potsdam.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; cualquier uso debe plantearse como inferencia de segmentación por lotes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-A-Postdam
- Modelo base TerraMind-1.0-base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- Repositorio TerraTorch: https://github.com/IBM/terratorch

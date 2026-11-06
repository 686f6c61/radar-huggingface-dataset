# akinchanJain7/fracture-detection-model

## Resumen

Fracture Check es un conjunto de dos modelos de visión por computador desarrollados por Akinchan Jain (B.Tech CSE en IA, Bennett University) para la detección de fracturas óseas en radiografías de musculoesqueleto. Se compone de un clasificador de imagen ConvNeXt-Tiny que determina si una radiografía muestra una fractura y de un detector Faster R-CNN v2 (ResNet-50 + FPN) que localiza la fractura mediante cajas delimitadoras. Ambos se entrenaron sobre el dataset público FracAtlas (Abedeen et al., Scientific Data, 2023), compuesto por radiografías procedentes de tres hospitales de Bangladés.

El modelo resuelve un problema de triaje asistido: dado un estudio radiográfico, produce una probabilidad de fractura, una decisión de flag y, en caso positivo, las coordenadas de las regiones sospechosas, además de un mapa de calor Grad-CAM que indica dónde encontró evidencia el clasificador. La relevancia actual radica en que ejemplifica el patrón de despliegue de visión médica en código abierto: pesos verificables por SHA-256, umbral de decisión fijado a priori sobre validación para maximizar recall y una separación explícita entre clasificador (cribado) y detector (localización).

Es importante subrayar que se trata de un proyecto de investigación estudiantil, no de un dispositivo médico, y que el propio autor desaconseja su uso para diagnóstico o para decidir si un paciente debe buscar atención. El repositorio ocupa 0,3 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (clasificador) + Faster R-CNN v2 con ResNet-50 + FPN (detector) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 384 px en el clasificador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto; etiquetas de salida en inglés) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`) con pesos, configuración de entrenamiento y procedencia |
| Dataset de entrenamiento | FracAtlas (CC BY 4.0) |
| Pipeline declarado | image-classification |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El sistema combina dos modelos independientes. El clasificador es un ConvNeXt-Tiny inicializado desde los pesos de timm `convnext_tiny.fb_in22k_ft_in1k`, adaptado a entrada en escala de grises a 384 px, y entrenado con semilla 44. El detector es un Faster R-CNN v2 de torchvision con backbone ResNet-50 y FPN, preentrenado en COCO, entrenado con semilla 42. La inferencia se orquesta mediante la clase `FracturePipeline` del paquete `fracdet`, que verifica el SHA-256 de cada checkpoint y su procedencia de entrenamiento (época, commit de git y checksum del split de datos) antes de cargarlos.

El clasificador aplica un umbral de 0,0968, fijado sobre datos de validación para alcanzar un 90 % de recall. Solo las radiografías que superan ese umbral pasan al detector, cuyas cajas se muestran junto a un mapa de calor Grad-CAM extraído de la última etapa del clasificador. El entrenamiento se realizó sobre el split de FracAtlas; la evaluación se efectuó sobre el split de test retenido (589 radiografías, 102 con fractura, 230 grupos de imagen) con un plan de análisis comprometido antes de puntuar, y los intervalos de confianza son bootstrap al 95 % agrupados por grupo de imagen. No se documenta en la información disponible el número de tokens ni la composición detallada del dataset más allá de su procedencia.

## Capacidades

- Clasificación binaria de radiografías: estima la probabilidad de que un estudio muestre una fractura y emite una decisión de flag según el umbral 0,0968.
- Localización de fracturas: el detector devuelve cajas delimitadoras con las regiones sospechosas, mostradas únicamente en estudios flagados.
- Explicabilidad visual: genera mapas de calor Grad-CAM de la última etapa del clasificador para señalar la evidencia utilizada.
- Procesamiento de imágenes en escala de grises a 384 px en el clasificador.
- Verificación de integridad: el pipeline comprueba SHA-256 y procedencia de entrenamiento de los checkpoints antes de cargarlos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Cribado previo en entornos de radiología: el clasificador puede priorizar estudios con probabilidad alta de fractura para revisión por parte de un radiólogo, aprovechando su recall del 92,2 % sobre el test de FracAtlas.
- Segunda lectura asistida: el mapa Grad-CAM y las cajas del detector ofrecen una señal visual adicional que el profesional puede contrastar con su propia lectura.
- Investigación en visión médica: los checkpoints y el pipeline reproducible (semillas, SHA-256, checksums de split) sirven como línea base para experimentos de detección de fracturas sobre FracAtlas.
- Docencia y formación: el par clasificador-detector con explicabilidad integrada es un ejemplo didáctico de arquitectura de cribado en dos etapas.
- Evaluación de robustez frente a artefactos: permite estudiar cómo el hardware quirúrgico (placas y tornillos) y las placas de crecimiento pediátricas afectan a las predicciones, dado que el autor documenta ambos fallos.
- Prototipado de demos interactivas: la integración con el Space `fracture-check` permite desplegar una interfaz de prueba para validar el flujo completo de inferencia.

## Benchmarks y rendimiento

Resultados sobre el split de test retenido de FracAtlas (589 radiografías, 102 con fractura, 230 grupos de imagen), con intervalos bootstrap al 95 % agrupados por imagen:

| Clasificador (umbral 0,0968) | Valor |
|---|---|
| Recall (fracturas detectadas) | 94/102 = 0,922 [0,859, 0,976] |
| Especificidad (radiografías sin fractura descartadas) | 0,708 [0,643, 0,764] |
| Precisión (flagadas con fractura) | 0,398 |
| NPV (descartadas sin fractura) | 0,977 |
| ROC-AUC | 0,937 |
| PR-AUC | 0,853 |

| Detector (semilla 42) | Valor |
|---|---|
| Centro de la caja top dentro de una caja de fractura | 0,745 [0,650, 0,837] |
| AP50 incluyendo radiografías normales | 0,421 [0,296, 0,528] |
| Cajas de fractura encontradas a 1 caja falsa por imagen | 0,635 |
| De las 94 fracturas flagadas, caja top sobre la fractura | 72 |

No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,3 GB) y las arquitecturas empleadas (ConvNeXt-Tiny y Faster R-CNN con ResNet-50), la inferencia es viable en GPU de gama media y probablemente en CPU para lotes pequeños, aunque no se documentan cifras.
- GPU recomendadas: no disponible; no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible de forma explícita, aunque el reducido tamaño de los checkpoints sugiere que cabría en GPU de consumo.
- Opciones de despliegue: el autor indica cargar los checkpoints mediante el paquete `fracdet` (`FracturePipeline.from_dir`) del repositorio de GitHub; existe una demo en Hugging Face Spaces. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de detección de fracturas en radiografías con los que establecer una comparativa de parámetros, contexto, rendimiento, licencia y disponibilidad. No disponible.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo describe como proyecto de investigación estudiantil y prohíbe explícitamente su uso para diagnóstico o para decidir si alguien debe buscar atención médica.
- Hardware quirúrgico: las placas y tornillos elevan la puntuación del clasificador y el detector tiende a encuadrar el implante; solo 4 de 11 fracturas con hardware se encuadraron correctamente en test.
- Población pediátrica: las placas de crecimiento en los extremos de los huesos largos provocan falsos positivos.
- Alcance limitado: solo radiografías simples de manos, brazos, piernas, caderas y hombros, procedentes de un único dataset de tres hospitales de Bangladés; el rendimiento en otros contextos es desconocido.
- Precisión baja por diseño: el umbral favorece la detección, por lo que la mayoría de las radiografías flagadas en la práctica no presentan fractura (precisión de 0,398).
- Sesgos y alucinación: no se documentan análisis de sesgo demográfico ni evaluación de calibración más allá de las métricas reportadas; el riesgo de falsos positivos y negativos está cuantificado en los benchmarks anteriores.
- Licencia MIT: permite uso comercial, pero ello no exime del cumplimiento de la normativa de productos sanitarios si se empleara en un contexto clínico.
- Dependencia del código del autor: los checkpoints no son cargables con APIs estándar de PyTorch sin el paquete `fracdet`, ya que incluyen configuración y procedencia en el propio archivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akinchanJain7/fracture-detection-model
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/akinchanJain7/fracture-check
- Repositorio GitHub: https://github.com/Akinchan-Jain-7/fracatlas-fracture-detection
- Dataset FracAtlas (referencia): Abedeen, I., Rahman, M. A., Prottyasha, F. Z., et al. *FracAtlas: A Dataset for Fracture Classification, Localization and Segmentation of Musculoskeletal Radiographs.* Scientific Data 10, 521 (2023), licencia CC BY 4.0.

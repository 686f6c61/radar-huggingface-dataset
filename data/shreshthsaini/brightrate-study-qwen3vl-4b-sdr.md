# shreshthsaini/brightrate-study-qwen3vl-4b-sdr

## Resumen

El modelo `shreshthsaini/brightrate-study-qwen3vl-4b-sdr` es un adaptador PEFT (LoRA) entrenado sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct` como parte del estudio BrightRate-LM, orientado a la evaluación de calidad perceptual de vídeo HDR generado por usuarios (UGC-HDR) sin referencia. El adaptador toma ocho fotogramas HDR muestreados uniformemente, los convierte a un proxy SDR mediante tone-mapping y los procesa en orden temporal para predecir una puntuación de calidad media (MOS). Este enfoque aprovecha las capacidades multimodales de Qwen3-VL para abordar un problema que combina distorsiones típicas de contenido generado por usuarios con artefactos específicos de HDR.

El adaptador se entrenó sobre el conjunto de datos BrightVQ, una nueva base de datos de vídeo UGC-HDR con anotaciones de calidad, y logra métricas de correlación sólidas en el conjunto de prueba de la partición 0 (SROCC 0,8418, PLCC 0,8579). Su relevancia radica en que propone un método de evaluación de calidad sin referencia que no requiere calibración por pantalla ni metadatos de display, algo crítico para el vídeo HDR generado por usuarios en plataformas como redes sociales o servicios de streaming. El adaptador está pensado exclusivamente para investigación y no está calibrado para otros dominios o pipelines de visualización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-4B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponibles (el modelo base Qwen3-VL soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-VL-4B-Instruct, un modelo transformer multimodal con codificador de visión y decodificador de lenguaje. La entrada se construye a partir de ocho fotogramas HDR muestreados uniformemente, convertidos a un proxy SDR mediante tone-mapping y presentados en orden temporal. El adaptador LoRA tiene rango 16, alpha 32 y dropout 0,05, y se entrena durante dos épocas con un horizonte de programación coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch 1 y acumulación de gradiente 8. Los objetivos MOS se interpolan a través de cinco palabras de calidad (por ejemplo, "excelente", "bueno", "regular", "pobre", "malo") para generar las etiquetas de entrenamiento. El entrenamiento se realizó sobre la partición 0 de BrightVQ, un conjunto de datos de vídeo UGC-HDR con anotaciones de calidad subjetiva. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con regresión hacia la puntuación MOS.

## Capacidades

- Evaluación de calidad de vídeo HDR sin referencia (NR-VQA) a partir de secuencias de fotogramas.
- Procesamiento de entrada multimodal: combina visión (fotogramas) y lenguaje (instrucciones o etiquetas de calidad).
- Generación de puntuaciones de calidad perceptual correlacionadas con juicios humanos (SROCC 0,8418 en el conjunto de prueba de BrightVQ split-0).
- Capacidad de razonamiento sobre artefactos visuales específicos de HDR (banding, clipping, ruido, etc.) gracias al modelo base.
- Soporte de tool calling y function calling heredado del modelo base Qwen3-VL-4B-Instruct, aunque no se utiliza en este adaptador.
- Capacidades multilingües del modelo base, aunque el adaptador no especifica idiomas de entrada.

## Casos de uso

- Evaluación de calidad en pipelines de transcodificación de vídeo HDR: el adaptador puede puntuar automáticamente la calidad percibida de vídeos HDR generados por usuarios antes de su publicación, ayudando a decidir qué versión conservar o descartar.
- Control de calidad en plataformas de streaming UGC: integrado en un servicio backend, puede analizar vídeos subidos por usuarios y detectar artefactos HDR problemáticos sin necesidad de visualización humana.
- Investigación en calidad de vídeo HDR: permite a investigadores comparar algoritmos de tone-mapping o compresión HDR utilizando una métrica perceptual sin referencia, sin depender de pantallas HDR de referencia.
- Optimización de codificadores de vídeo: el adaptador puede usarse como función de pérdida o como métrica de validación en sistemas de codificación adaptativa que ajustan la tasa de bits según la calidad percibida.
- Desarrollo de sistemas de recomendación de calidad: combinado con metadatos de visualización, puede predecir la satisfacción del usuario ante vídeos HDR en diferentes dispositivos.
- Análisis de distorsiones específicas de UGC-HDR: el modelo puede identificar qué tipo de artefacto (por ejemplo, ruido, banding, sobreexposición) contribuye más a la degradación de calidad, útil para depurar pipelines de captura y procesado.

## Benchmarks y rendimiento

En el conjunto de prueba de la partición 0 de BrightVQ (420 vídeos), el adaptador obtiene las siguientes métricas:

| Metrica | Valor |
|---|---|
| SROCC | 0,8418 |
| PLCC | 0,8579 |
| KRCC | 0,6530 |
| RMSE | 7,0219 |

No se han publicado comparativas detalladas con otros modelos de VQA en la información disponible. El paper de BrightRate (WACV 2026) reporta que el modelo completo alcanza estado del arte en bases de datos HDR existentes, pero no se proporcionan números específicos para este adaptador concreto.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,1 GB), pero requiere cargar el modelo base Qwen3-VL-4B-Instruct completo para inferencia.
- VRAM estimada: el modelo base en FP16 ocupa aproximadamente 8 GB; con cuantización de 4 bits (por ejemplo, mediante bitsandbytes) puede reducirse a unos 3-4 GB, más el overhead del adaptador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3070, RTX 4060 Ti, A10) o 4 GB para cuantización 4-bit (RTX 3050, RTX 4060). Para procesamiento por lotes o vídeos largos, se recomienda una GPU con 16 GB o más (RTX 4090, A100).
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de HuggingFace junto con el modelo base. Para inferencia en producción, se puede servir con vLLM o TGI si se fusiona el adaptador con el modelo base, o mediante llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y del número de fotogramas procesados por vídeo.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores o modelos de VQA en la información proporcionada. El paper de BrightRate indica que el modelo completo supera a métodos previos en bases de datos HDR, pero no se listan modelos concretos ni sus métricas. Alternativas genéricas de VQA sin referencia como Q-Align, LIQE o DOVER podrían ser comparables, pero no hay datos de rendimiento de estos modelos sobre BrightVQ en la información disponible.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre la partición 0 de BrightVQ; las puntuaciones no están calibradas para otros conjuntos de datos, pipelines de visualización o dominios de vídeo.
- La entrada requiere un preprocesado específico: ocho fotogramas HDR muestreados uniformemente y convertidos a SDR mediante tone-mapping. No funcionará correctamente con entradas que no sigan este protocolo.
- El modelo es un adaptador de investigación; no se garantiza su robustez en producción ni su comportamiento ante distribuciones de datos diferentes a las del entrenamiento.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado sobre un conjunto de datos concreto, puede presentar sesgos hacia los tipos de contenido y distorsiones presentes en BrightVQ.
- Riesgo de alucinación: el modelo base Qwen3-VL puede generar texto no fiel a la entrada, aunque el adaptador está diseñado para regresión de calidad, no para generación libre.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier uso no académico.
- El adaptador no incluye el modelo base; para su uso es necesario descargar Qwen3-VL-4B-Instruct por separado, sujeto a su propia licencia.

## Enlaces

- HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-qwen3vl-4b-sdr
- Repositorio BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Repositorio BrightRate-LM: https://github.com/shreshthsaini/BrightRate-LM
- Página del proyecto BrightRate: https://shreshthsaini.github.io/BrightVQ/
- Paper WACV 2026: https://openaccess.thecvf.com/content/WACV2026/html/Saini_BrightRate_Quality_Assessment_for_User-Generated_HDR_Videos_WACV_2026_paper.html
- Página de la sesión oral WACV 2026: https://wacv.thecvf.com/virtual/2026/oral/1209
- Artículo en IEEE Computer Society: https://www.computer.org/csdl/proceedings-article/wacv/2026/551100b522/2ggO3pml8v6

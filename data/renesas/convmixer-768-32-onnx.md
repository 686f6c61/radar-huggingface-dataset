# Renesas/ConvMixer-768-32-ONNX

## Resumen

ConvMixer-768/32 (ONNX) es un clasificador de imágenes publicado por Renesas para su plataforma R-Car X5H, orientado a ejecución sobre la NPU NPX6-48K. No es un modelo de lenguaje ni un modelo generativo: es la exportación a ONNX del checkpoint ConvMixer-768/32 entrenado sobre ImageNet-1k (1000 clases), con 21,1 millones de parámetros y 19,5 GMACs, destinado a inferencia embebida en hardware de automoción. La arquitectura ConvMixer, presentada en el artículo "Patches Are All You Need?" (Trockman y Kolter, 2022), combina un *patch embedding* de estilo ViT con bloques mixer de convoluciones *depthwise* y *pointwise*, sin mecanismos de atención ni MLP-mixer.

El interés de esta ficha no está en la arquitectura en sí, que es de 2022, sino en el flujo de despliegue: Renesas publica el modelo en FP32 y el *toolchain* MWMX (Middleware MX) lo convierte automáticamente a INT8 en tiempo de compilación, sin paso de cuantización manual. La latencia medida en hardware real con un solo núcleo de IA a 850 MHz es de 16,503918 ms por imagen con lote de tamaño 1 y entrada de 3×224×224 píxeles.

La relevancia actual es de nicho: sirve como referencia de rendimiento para quien integre visión por computadora en la plataforma X5H y quiera comparar arquitecturas sobre la NPU, y como ejemplo del patrón "exportar desde timm y compilar para NPU de borde". El repositorio no incluye datos de precisión tras la conversión a INT8 (marcados como TBD por el autor) ni métricas de la variante de 12 núcleos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvMixer ("Patches Are All You Need?"): patch embedding estilo ViT + 32 bloques mixer de convolución depthwise y pointwise; sin atención ni MLP-mixer; dimensión oculta 768 |
| Parametros totales | 21,1 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). Entrada fija de 3 × 224 × 224 píxeles; salida de 1000 clases de ImageNet-1k |
| Tipos de cuantizacion | FP32 (ONNX publicado); INT8 mediante auto-cast del toolchain MWMX en tiempo de compilación. No se distribuye fichero INT8 separado |
| Idiomas soportados | No disponible (no aplica: clasificación de imágenes, sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32), ruta `fp32/convmixer_768_32.onnx`; el diagrama de despliegue del autor menciona también un fichero `convmixer_768_32_..._optimized.onnx` |
| Coste computacional | 19,5 GMACs |
| Tarea (pipeline) | image-classification |
| Modelo base | timm/convmixer_768_32.in1k |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

ConvMixer mantiene la resolución espacial completa a lo largo de toda la red en lugar de aplicar *downsampling* progresivo. La entrada de 224×224 se divide en parches mediante una convolución con *stride* igual al tamaño de parche (el *patch embedding* heredado de ViT), y a continuación se apilan 32 bloques mixer idénticos. Cada bloque contiene una convolución *depthwise* grande (mezcla espacial) seguida de una convolución *pointwise* 1×1 (mezcla entre canales), con conexiones residuales y normalización. La dimensión oculta es 768. Esto da una red totalmente convolucional, sin atención, con un coste de 19,5 GMACs.

El checkpoint original fue entrenado por los autores del artículo (Trockman y Kolter, repositorio `locuslab/convmixer`) sobre ImageNet-1k, con recetas de aumento de datos y regularización habituales en *vision transformers* (el artículo reporta un 80,2 % de top-1 en ImageNet para esta configuración exacta, según recoge la model card). Renesas no documenta reentrenamiento, *fine-tuning* adicional, RLHF/DPO ni cambios en los pesos: la aportación de este repositorio es la exportación a ONNX y su integración con el runtime MWMX para la NPU NPX6-48K sobre R-Car X5H. La model card no detalla la composición exacta del dataset más allá de ImageNet-1k ni el número de tokens/imágenes vistas durante el entrenamiento.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k, a resolución fija de 224×224 píxeles, con salida de *logits* por clase.
- Extracción de características: al ser una red convolucional sin atención, las activaciones intermedias pueden reutilizarse como *backbone* congelado para tareas de transferencia.
- Inferencia en FP32 sobre CPU/GPU mediante ONNX Runtime y otras toolchains compatibles con ONNX.
- Inferencia en INT8 sobre la NPU NPX6 de la plataforma Renesas R-Car X5H mediante el runtime MWMX, con auto-cast desde el ONNX en FP32.
- Ejecución con lote de tamaño 1 y entrada 3×224×224, optimizada para *throughput* por núcleo de IA.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, generación de texto, matemáticas simbólicas, audio ni visión-lenguaje. No tiene modo *thinking* ni capacidades multilingües: cualquier uso de ese tipo requiere envolverlo en un sistema externo.

## Casos de uso

- Clasificación de escenas a bordo en la plataforma R-Car X5H: el modelo se compila con MWMX y se ejecuta en la NPU NPX6-48K con una latencia medida de 16,5 ms por imagen a 850 MHz y un solo núcleo de IA, lo que permite clasificar a frecuencias compatibles con flujos de cámara a 30-60 FPS usando varios núcleos.
- Prefiltrado en pipelines de percepción de vehículos: usar las 1000 clases de ImageNet como etapa barata de descarte antes de modelos más pesados (detección, segmentación), reduciendo el cómputo aguas abajo.
- Control de calidad industrial en línea: clasificación de piezas o defectos visuales en una cadena de producción, con el modelo corriendo sobre el mismo SoC que gobierna la célula, sin depender de conectividad a la nube.
- Etiquetado automático de grandes librerías de imágenes: ejecución con ONNX Runtime sobre CPU o GPU de servidor para asignar etiquetas ImageNet a corpus fotográficos y acelerar su indexado o su curación previa al etiquetado humano.
- *Backbone* congelado para transferencia: congelar el extractor de características ConvMixer y entrenar una cabeza lineal sobre un dataset propio (inspección, agricultura, satélite) cuando se dispone de pocas muestras etiquetadas.
- Referencia de evaluación de NPU: emplear el modelo como carga de trabajo estándar para medir latencia, consumo y escalado entre 1 y 12 núcleos de IA en X5H, o para comparar el coste relativo de ConvMixer frente a CNN móviles en la misma NPU.
- Prototipado y comparación de arquitecturas con timm: cargar `timm/convmixer_768_32.in1k` en PyTorch y contrastar decisiones de diseño (ConvMixer frente a ResNet o ViT) antes de comprometerse con una exportación a ONNX.
- Clasificación en el borde con CPU o GPU de bajo consumo: al ocupar aproximadamente 85 MB en FP32 y unos 21 MB en INT8, el modelo cabe en dispositivos con memoria muy limitada cuando no se dispone de la NPU de Renesas.

## Benchmarks y rendimiento

Datos publicados en la model card. La cifra de precisión corresponde al artículo original para esta configuración, no a una medición de este repositorio.

| Metrica | Valor | Condiciones | Tipo |
|---|---|---|---|
| Top-1 ImageNet-1k | 80,2 % | Configuración ConvMixer-768/32 del artículo original | Reportado por el paper (no verificado en este repo) |
| GMACs | 19,5 | Entrada 3×224×224 | Dato de timm |
| Latencia | 16,503918 ms | X5H, 1 NPU, 1 AI Core, 850 MHz, lote 1, INT8, entrada 3×224×224 | Medido (HIL, runtime MWMX) |
| Throughput derivado | ≈ 60,6 imágenes/s por core | Cálculo a partir de la latencia anterior (1 / 0,016503918) | Derivado |
| Latencia con 12 AI Cores | No disponible | El autor indica que la porción de 12 núcleos no se ejecutó en la exportación de origen | No medido |
| Precision tras cuantizacion INT8 | No disponible (TBD) | El autor marca la exactitud como pendiente de medir/publicar | No medido |

La model card señala además que esta es una de las cargas con mayor latencia de su barrido de clasificadores, coherente con el coste de 19,5 GMACs del *patch embedding* y los 32 bloques mixer, frente a CNN orientadas a móvil con un número de parámetros similar.

## Requisitos de hardware

- Memoria de pesos: aproximadamente 85 MB en FP32 (coherente con los 21,1 M de parámetros y el repositorio de 0,1 GB) y del orden de 21 MB si se cuantiza a INT8; las activaciones a 224×224 con 768 canales dominan el pico de memoria en inferencia.
- Cabe holgadamente en cualquier GPU de consumo: una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutarlo con ONNX Runtime. No se han publicado latencias para estas plataformas en la información disponible.
- Cabe en CPU: es viable en inferencia sobre CPU de servidor o de portátil para tareas de etiquetado por lotes; no hay cifras publicadas de latencia.
- Hardware objetivo declarado: placa Renesas R-Car X5H con NPU NPX6-48K, ejecutando el runtime MWMX. La latencia medida es de 16,503918 ms con 1 NPU, 1 AI Core a 850 MHz y lote 1.
- Despliegue en el ecosistema Renesas: requiere placa X5H, el runtime MWMX y la CLI de Hugging Face para descargar los pesos (`hf download Renesas/ConvMixer-768-32-ONNX --repo-type=model --include "fp32/*"`).
- Despliegue fuera de Renesas: el ONNX puede ejecutarse con ONNX Runtime (CPU, CUDA, DirectML), TensorRT, OpenVINO u otras toolchains compatibles, o convertirse a otros formatos. Estas rutas no están validadas ni documentadas por el autor.
- Alternativa en PyTorch: el checkpoint original `timm/convmixer_768_32.in1k` es cargable directamente con la librería timm si se prefiere evitar ONNX.
- Throughput y latencia en GPU, CPU o NPU de terceros: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision declarada | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Renesas/ConvMixer-768-32-ONNX (este) | 21,1 M | 3×224×224, 1000 clases | No disponible en este repo (TBD tras INT8) | Apache 2.0 | ONNX FP32, pensado para NPU NPX6 vía MWMX |
| timm/convmixer_768_32.in1k | 21,1 M | 3×224×224, 1000 clases | 80,2 % top-1 (reportado en el paper) | Apache 2.0 (según repositorio de origen) | Pesos PyTorch/timm, arquitectura idéntica |
| ConvMixer-1024/20 y ConvMixer-1536/20 (familia ConvMixer) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| CNN móviles de parámetro similar (mencionadas por el autor como referencia de latencia) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos adicionales (parámetros, precisión o latencia) de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa se limita al checkpoint de origen. Cualquier comparación con ResNet, MobileNet o EfficientNet requeriría consultar sus propias fichas y no se incluye aquí para no introducir cifras no verificadas.

## Limitaciones y advertencias

- Ámbito restringido: solo clasificación de imágenes en las 1000 clases de ImageNet-1k. No genera texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Resolución y formato de entrada fijos: 3×224×224 píxeles. Entradas de otra resolución o relación de aspecto requieren redimensionado y recorte, lo que puede degradar la precisión en dominios alejados de ImageNet.
- Etiqueta única: el modelo devuelve *logits* sobre clases predefinidas; no localiza objetos ni produce descripciones, y no detecta clases fuera de ImageNet (por ejemplo, defectos industriales concretos) sin *fine-tuning*.
- Precisión no verificada en este repositorio: la model card marca la exactitud como TBD. La conversión automática a INT8 en tiempo de compilación puede degradar la precisión respecto al 80,2 % reportado para el modelo en FP32, y no hay medición publicada del impacto.
- Coste computacional alto para su tamaño: 19,5 GMACs, lo que el propio autor describe como una latencia elevada dentro de su barrido de clasificadores. Puede no ser la opción adecuada si el presupuesto de cómputo por fotograma es ajustado.
- Datos de rendimiento incompletos: solo hay medición con 1 AI Core; no se reporta la variante de 12 núcleos, ni latencia en GPU/CPU, ni consumo energético.
- Dependencia de hardware y software propietario para el flujo documentado: la ejecución en NPU NPX6 exige placa R-Car X5H y el runtime MWMX. Fuera de ese entorno, el ONNX es portable pero no está validado por el autor.
- Sesgos heredados de ImageNet-1k: el dataset contiene sesgos de representación geográfica, cultural y de vocabulario de clases (por ejemplo, categorías de razas de perro o de instrumentos musicales muy sesgadas hacia contextos occidentales). No se ha publicado ninguna evaluación de sesgo o robustez para este checkpoint.
- Riesgo de falsos positivos con alta confianza: como todo clasificador cerrado, asignará una de las 1000 clases incluso ante entradas sin relación, lo que exige umbrales de confianza o detección de fuera de distribución en producción.
- Adopción nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay validación independiente de la comunidad sobre el comportamiento del modelo.
- Licencia: Apache 2.0, lo que permite uso comercial y modificación con obligación de conservar el aviso de licencia y el archivo de cambios. Conviene verificar la licencia del checkpoint de origen (`timm/convmixer_768_32.in1k`) por si impusiera condiciones adicionales.
- Uso en sistemas de seguridad o automoción: no hay ningún dato publicado de fiabilidad, robustez ante condiciones adversas ni certificación funcional; no debe emplearse como único componente en decisiones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renesas/ConvMixer-768-32-ONNX
- Modelo base en Hugging Face: https://huggingface.co/timm/convmixer_768_32.in1k
- Articulo: "Patches Are All You Need?" (Trockman y Kolter, 2022): https://arxiv.org/abs/2201.09792
- Repositorio de los autores: https://github.com/locuslab/convmixer
- Sitio de Renesas: https://www.renesas.com/
- Catalogo de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia: https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (frances): https://fr.wikipedia.org/wiki/Renesas_Electronics
- Empleo en Renesas: https://jobs.renesas.com/

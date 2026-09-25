# beaunix/artwork-classifier-cnn

## Resumen

Melkov — Art Style Classifier es un modelo de visión por computador desarrollado por beaunix (Bryan David Castano) dentro de la suite de agentes especializados Aegis. Se trata de un clasificador de imagen de etiqueta única cuya tarea es identificar el estilo artístico o movimiento pictórico de una obra a partir de una imagen. Forma parte del agente Melkov (Art-Atelier), donde actúa como capa de percepción visual, mientras que la capa conversacional y analítica se ejecuta por separado sobre Qwen2.5-VL-7B.

Técnicamente es una red convolucional EfficientNetV2-Small (~80 MB de checkpoint) implementada y distribuida a través de la librería timm. El modelo se publica en dos formatos: un checkpoint de PyTorch (`melkov-style-v2s.pt`) para inferencia y reentrenamiento, y una exportación ONNX (`melkov-style-v2s.onnx`) para despliegue en cualquier entorno con ONNX Runtime. Su licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

El modelo se ha ajustado sobre OpenBrush-75K, un conjunto de 75.313 obras de dominio público procedentes de 111 artistas y 27 movimientos artísticos, con metadatos estructurados generados por un VLM. El repositorio tiene un tamaño de 0,1 GB y, en el momento de la consulta, registra 0 descargas y 0 «likes», por lo que se trata de una publicación reciente y sin validación externa conocida. No se han publicado resultados de benchmarks ni detalles cuantitativos del proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-Small (CNN con bloques MBConv y Fused-MBConv); implementada en timm |
| Parametros totales | No disponible en la model card (la EfficientNetV2-S de referencia de timm tiene unos 21,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imagen) |
| Tipos de cuantizacion | No disponible; se distribuyen pesos en precisión completa (checkpoint PyTorch y exportación ONNX sin cuantizar) |
| Idiomas soportados | No disponible (el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |
| Tarea | Clasificación de imagen de etiqueta única (estilo artístico / movimiento pictórico) |
| Resolucion de entrada | No disponible (EfficientNetV2-S de referencia: 300 px en entrenamiento, 384 px en evaluación) |
| Modelo base | animeshakr/plant-disease-efficientnetv2s (ajuste fino) |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | OpenBrush-75K (75.313 obras, 111 artistas, 27 movimientos) |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNetV2-Small, una red neuronal convolucional que combina bloques Fused-MBConv en las etapas iniciales y bloques MBConv con atención squeeze-and-excitation en las etapas profundas. EfficientNetV2 introduce entrenamiento con progresión de resolución y regularización progresiva, lo que reduce el coste de entrenamiento frente a versiones anteriores. El modelo se carga mediante timm y se ha inicializado desde el checkpoint animeshakr/plant-disease-efficientnetv2s, es decir, parte de un ajuste previo sobre clasificación de enfermedades de plantas antes de especializarse en estilos artísticos.

El ajuste se realizó sobre el dataset OpenBrush-75K, compilado por jaddai y compuesto por 75.313 obras de dominio público con 111 artistas y 27 movimientos artísticos etiquetados, con metadatos generados por un modelo de visión-lenguaje. La model card no especifica el número de tokens o épocas, la composición exacta por clase, si hubo balanceo del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables en un clasificador de este tipo). Tampoco se documentan la resolución de entrenamiento, el esquema de aumentación de datos, el optimizador ni el learning rate utilizados. Los autores indican que el checkpoint `.pt` puede usarse para reentrenamiento o ajuste fino adicional y que la exportación ONNX está pensada exclusivamente para inferencia.

## Capacidades

- Clasificación de estilo artístico: asigna una única etiqueta de movimiento o estilo pictórico a una imagen de una obra de arte.
- Clasificación de imagen genérica heredada de la arquitectura EfficientNetV2-S y del ajuste previo, aunque el ajuste específico la especializa en arte.
- Inferencia en CPU y GPU mediante ONNX Runtime, sin dependencia de frameworks de deep learning completos en el caso del fichero ONNX.
- Integración con el ecosistema timm, lo que permite cargar el modelo, extraer características intermedias o continuar el entrenamiento con PyTorch.
- Reentrenamiento y ajuste fino: el checkpoint `.pt` está pensado para retomar el entrenamiento con nuevos estilos o dominios.
- No soporta tool calling ni function calling: es un clasificador de imagen, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso por sí mismo; en la arquitectura de Melkov estas funciones recaen en la capa Qwen2.5-VL-7B.
- No tiene capacidades multilingües, de generación de texto, de código ni de matemáticas.
- No dispone de modo «thinking», visión generativa, audio ni salida multimodal.

## Casos de uso

- Catalogación de fondos museísticos y archivos históricos: el modelo permite etiquetar automáticamente miles de obras digitalizadas por movimiento artístico, reduciendo el trabajo manual de documentación antes de la revisión por parte de un conservador.
- Moderación y organización de marketplaces de arte digital: dado su tamaño reducido (0,1 GB de repositorio), puede desplegarse como servicio de clasificación en el momento de la subida de una obra para asignar categoría y facilitar la búsqueda por estilo.
- Etiquetado previo de datasets para entrenamiento generativo: permite filtrar y balancear corpus de imágenes por estilo antes de usarlos en el entrenamiento de modelos de difusión o de imagen a imagen.
- Capa de percepción de un agente multimodal: es el componente que aporta la etiqueta de estilo dentro del agente Melkov, cuya capa conversacional sobre Qwen2.5-VL-7B interpreta y explica el resultado al usuario.
- Aplicación móvil o de borde para identificación de estilos: con una exportación ONNX y un checkpoint de ~80 MB, el modelo puede ejecutarse en dispositivos sin GPU dedicada, por ejemplo en apps educativas de historia del arte.
- Búsqueda visual y sistemas de recomendación: la etiqueta de estilo sirve como característica para indexar y recomendar obras similares en plataformas de contenido artístico o educativo.
- Investigación en humanidades digitales: permite análisis cuantitativos a gran escala sobre la evolución y coexistencia de movimientos artísticos en un corpus de dominio público de más de 75.000 obras.
- Preprocesado en canales de venta y subastas: clasificación rápida de lotes entrantes para asignar categoría y detectar posibles discrepancias entre la descripción del vendedor y la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, exactitud, F1, matriz de confusión ni comparaciones cuantitativas con otros clasificadores de estilo artístico, y el repositorio registra 0 descargas y 0 «likes», por lo que tampoco existen evaluaciones independientes conocidas.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB con lote de tamaño 1 en precisión completa, dado que los pesos ocupan del orden de 80 MB y la EfficientNetV2-S tiene un coste de activaciones bajo. Cifra orientativa, no verificada por los autores.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve para inferencia (GTX 1650, RTX 3060, RTX 4090, T4, A100, H100). El modelo no requiere GPU de gama alta; en la práctica el cuello de botella es el preprocesado de imagen.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos ocho años, e incluso en iGPU y en aceleradores de borde tipo Jetson o Raspberry Pi (vía ONNX Runtime).
- Despliegue: ONNX Runtime (formato `.onnx`), PyTorch con timm (formato `.pt`), TorchScript, servidores de inferencia como Triton o BentoML, y endpoints de Hugging Face basados en el pipeline `image-classification`.
- Latencia y throughput: no hay cifras publicadas. Como estimación orientativa no verificada, un lote de 1 imagen a resolución de evaluación debería resolverse en el orden de milisegundos en GPU moderna y en decenas de milisegundos en CPU.
- Almacenamiento: el repositorio completo ocupa 0,1 GB, por lo que cabe en memoria de cualquier contenedor estándar.

## Comparativa con modelos similares

No se dispone de benchmarks de este modelo, por lo que la comparación se limita a arquitectura, tamaño y licencia. Los valores de los modelos alternativos son cifras de referencia de cada arquitectura, no resultados medidos sobre la tarea de clasificación de estilos artísticos.

| Modelo | Arquitectura | Parametros de referencia | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beaunix/artwork-classifier-cnn | EfficientNetV2-Small | ~21,5 M (referencia) | No aplica | MIT | Hugging Face, `.pt` y `.onnx` |
| ResNet-50 (referencia) | CNN con bloques residuales | ~25,6 M | No aplica | Varía según checkpoint | Múltiples repositorios |
| ConvNeXt-Tiny (referencia) | CNN modernizada tipo transformer | ~28,6 M | No aplica | Varía según checkpoint | Múltiples repositorios |
| CLIP ViT-L/14 (referencia) | Transformer de visión y texto | ~428 M | Texto e imagen | Varía según checkpoint | Múltiples repositorios |

Frente a CLIP, este modelo es entre uno y dos órdenes de magnitud más pequeño y no requiere emparejamiento texto-imagen, pero tampoco ofrece clasificación abierta por prompt: solo predice las clases para las que fue ajustado (los 27 movimientos de OpenBrush-75K). Frente a ResNet-50 y ConvNeXt-Tiny, el tamaño es comparable o inferior, aunque no hay datos publicados que permitan comparar exactitud en clasificación de estilos.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: no se conoce la exactitud del modelo ni su comportamiento por clase, por lo que no debería desplegarse en producción crítica sin una evaluación propia sobre datos representativos.
- Cobertura de clases cerrada: el modelo está ajustado sobre 27 movimientos artísticos de OpenBrush-75K. Cualquier estilo fuera de ese vocabulario, así como el arte contemporáneo, digital, no occidental o marginal respecto al corpus, puede clasificarse de forma errónea.
- Riesgo de alucinación de etiqueta: al ser una clasificación de etiqueta única, el modelo siempre devolverá una clase, incluso ante imágenes que no son obras de arte o que son ambiguas entre dos movimientos, sin señal de confianza calibrada documentada.
- Sesgos del dataset: OpenBrush-75K está formado por obras de dominio público de 111 artistas, lo que probablemente sobrerrepresenta determinados periodos, regiones y autores, y puede infrarepresentar a artistas mujeres, no occidentales o de tradiciones no incluidas en el dominio público digitalizado.
- Idiomas: no aplica al modelo en sí, pero la ausencia de metadatos multilingües limita la integración con interfaces en distintos idiomas si no se gestiona en la capa externa.
- Dependencia del modelo base: el ajuste parte de un checkpoint especializado en enfermedades de plantas, lo que introduce un sesgo de inicialización no analizado en la documentación.
- Licencia: MIT permite uso comercial, modificación y redistribución con atribución. El dataset OpenBrush-75K también es MIT y se compone de obras de dominio público, según indica el autor, pero esa verificación no se detalla en la model card.
- Trazabilidad del dataset: el autor señala que accedió originalmente a una copia alternativa (`Trever896/openbrush-75k`) y atribuye la autoría original a jaddai. Conviene verificar la procedencia si se va a redistribuir.
- Mantenimiento: con 0 descargas y 0 «likes», no hay evidencia de uso, soporte ni actualizaciones posteriores. La fecha de creación del repositorio (2026-09-25) indica que es una publicación reciente.
- Resolución de entrada no documentada: no se especifica la resolución de entrenamiento ni la de evaluación, lo que puede provocar degradación si se alimenta con imágenes de tamaño muy distinto al usado en el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beaunix/artwork-classifier-cnn
- Dataset OpenBrush-75K (jaddai): https://huggingface.co/datasets/jaddai/openbrush-75k
- Copia alternativa del dataset: https://huggingface.co/datasets/Trever896/openbrush-75k
- Modelo base: https://huggingface.co/animeshakr/plant-disease-efficientnetv2s
- Repositorio del proyecto Melkov: https://github.com/BeauBryanDev/melkov
- Perfil del autor en GitHub: https://github.com/beaunix
- Space de la capa conversacional (Qwen2.5-VL-7B): https://huggingface.co/spaces/beaunix/melkov
- Perfil del autor en Hugging Face: https://huggingface.co/beaunix
- Estudio relacionado sobre clasificación automática de arte con CNN: https://www.nature.com/articles/s41598-025-91671-z

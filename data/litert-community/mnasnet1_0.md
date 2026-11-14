# litert-community/mnasnet1_0

## Resumen

mnasnet1_0 es una conversión al formato LiteRT (TFLite) del modelo MnasNet 1.0 originalmente publicado en TorchVision. MnasNet es una arquitectura de red neuronal convolucional diseñada mediante búsqueda automática de arquitecturas (NAS, Neural Architecture Search) por investigadores de Google, optimizada para clasificación de imágenes en dispositivos móviles con un equilibrio entre precisión y latencia. Este repositorio, mantenido por la comunidad litert-community, distribuye los pesos convertidos a TFLite para su uso en entornos de inferencia ligera.

El modelo resuelve el problema de clasificación de imágenes sobre las 1000 clases de ImageNet-1k, y su relevancia actual radica en que permite desplegar un clasificador de imágenes en dispositivos de recursos limitados (móviles, SBC, edge) mediante el runtime LiteRT. El repositorio incluye dos variantes: una en punto flotante y otra con pesos cuantizados dinámicamente a int8 y activaciones en fp32.

No se dispone de información sobre el número exacto de parámetros en esta ficha, aunque MnasNet 1.0 se sitúa en el rango de los 4-5 millones de parámetros según la literatura original. El tamaño del repositorio es de 0,1 GB y la información publicada por el autor es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con bloques de convolución separable en profundidad, obtenida por Neural Architecture Search (MnasNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija) |
| Tipos de cuantizacion | float32 y cuantización dinámica int8 en pesos con activaciones fp32 (wi8_afp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TFLite (.tflite) |

## Arquitectura y entrenamiento

MnasNet es una red neuronal convolucional para visión por computador cuya topología fue descubierta mediante búsqueda automática de arquitecturas con un objetivo multiobjetivo que combina precisión y latencia real medida en dispositivos móviles. La arquitectura resultante emplea bloques de convolución separable en profundidad con conexiones residuales, siguiendo el patrón de MobileNetV2, e incluye mecanismos de atención por squeeze-and-excitation en algunos bloques. La variante 1.0 corresponde al multiplicador de anchura base de la familia MnasNet.

El entrenamiento original se realizó sobre ImageNet-1k para la tarea de clasificación de imágenes en 1000 clases. No se dispone en la información proporcionada de detalles sobre el número de tokens o imágenes de entrenamiento, composición exacta del dataset más allá de ImageNet-1k, ni sobre si se aplicaron técnicas de ajuste fino adicionales. La conversión a TFLite fue compilada con el perfil de compatibilidad GPU de LiteRT y validada con ejecución GPU en Python según indica la model card.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k.
- Inferencia optimizada para dispositivos móviles y edge mediante el runtime LiteRT.
- Ejecución acelerada por GPU según el perfil de compatibilidad declarado por el autor.
- Variante cuantizada dinámicamente (int8 en pesos) para reducir el tamaño del modelo y acelerar la inferencia en CPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante LiteRT para etiquetar fotos del usuario en el dispositivo, sin enviar datos a un servidor, gracias a su tamaño reducido y su perfil de compatibilidad GPU.
- Etiquetado automático en pipelines de gestión de fototecas: se puede usar para preclasificar imágenes por categoría (animales, vehículos, objetos cotidianos) antes de un procesamiento posterior más costoso.
- Filtrado y moderación de contenido visual en el edge: permite descartar o marcar imágenes en dispositivos de bajo consumo antes de subirlas a la nube, reduciendo ancho de banda y coste.
- Prototipado rápido de sistemas de visión en Raspberry Pi y SBC: la variante TFLite se ejecuta en runtimes ligeros y sirve para validar pipelines de captura, preprocesado e inferencia en hardware embebido.
- Control de calidad industrial básico: clasificación de piezas o productos en cadenas de montaje con cámaras de bajo coste y dispositivos de inferencia locales.
- Investigación y docencia en eficiencia de modelos: sirve como referencia de arquitectura NAS y como ejemplo de conversión y cuantización de modelos de visión a TFLite para comparar latencia y precisión en distintos dispositivos.
- Componente de extracción de características: las activaciones intermedias pueden reutilizarse como backbone congelado en tareas de transferencia ligera, aunque el repositorio no documenta esta variante de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) y la naturaleza del modelo, la huella de memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican; el autor declara compatibilidad con el perfil GPU de LiteRT, validado en ejecución Python con GPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con soporte LiteRT, aunque no se detallan modelos concretos.
- Opciones de despliegue: runtime LiteRT (TFLite), con soporte de delegado GPU; también puede ejecutarse en CPU con la variante cuantizada dinámicamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| mnasnet1_0 (este repo) | no disponible | imagen fija (ImageNet-1k) | Clasificación de imágenes | no disponible | TFLite |
| MobileNetV2 | no disponible en esta ficha | imagen fija (ImageNet-1k) | Clasificación de imágenes | no disponible en esta ficha | múltiples (incl. TFLite) |
| MobileNetV3 | no disponible en esta ficha | imagen fija (ImageNet-1k) | Clasificación de imágenes | no disponible en esta ficha | múltiples (incl. TFLite) |
| EfficientNet-B0 | no disponible en esta ficha | imagen fija (ImageNet-1k) | Clasificación de imágenes | no disponible en esta ficha | múltiples (incl. TFLite) |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible, lo que impide confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo original en TorchVision antes de usarlo en producción.
- El modelo está entrenado exclusivamente para clasificación de imágenes en las 1000 clases de ImageNet-1k; no generaliza a categorías fuera de ese vocabulario ni a tareas como detección, segmentación o generación.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural y no tiene capacidades conversacionales.
- Riesgo de sesgos heredados de ImageNet-1k en la distribución de clases y en la representación de objetos y contextos.
- Puede producir predicciones erróneas o de baja confianza en imágenes fuera de distribución, con iluminación adversa, oclusiones o dominios visuales distintos al de entrenamiento.
- La model card es muy escasa: no documenta métricas de precisión, procedimiento de conversión detallado ni limitaciones específicas de la cuantización.
- La variante cuantizada int8 puede degradar ligeramente la precisión respecto a la variante float32; no se han publicado comparativas en la información disponible.
- El número de descargas (103) y de likes (0) es bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/mnasnet1_0
- Modelo original en TorchVision: no disponible en la información proporcionada
- Paper de MnasNet (arXiv): no disponible en la información proporcionada
- Documentación de LiteRT: no disponible en la información proporcionada

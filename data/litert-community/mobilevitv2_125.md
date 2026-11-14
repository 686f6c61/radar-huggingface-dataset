# litert-community/mobilevitv2_125

## Resumen

mobilevitv2_125 es un modelo de clasificación de imágenes de tipo vision transformer híbrido, concretamente la variante de 125 en la familia MobileViTv2 publicada por Apple en el paper "Separable Self-attention for Mobile Vision Transformers" (Mehta y Rastegari, 2022). Esta ficha concreta corresponde a la conversión a formato LiteRT (TFLite) realizada por la comunidad litert-community a partir del checkpoint `timm/mobilevitv2_125.cvnets_in1k`, es decir, el modelo original entrenado sobre ImageNet-1K y empaquetado para su despliegue en dispositivos móviles y edge.

El modelo resuelve el problema de clasificación de imágenes en 1000 categorías de ImageNet con un coste computacional muy bajo: 7,5 millones de parámetros, 2,9 GMACs y 20,1 millones de activaciones para entradas de 256x256 píxeles. Su relevancia actual radica en que ofrece un artefacto listo para ejecutar en runtime LiteRT en CPU, con un tamaño de repositorio de 0,1 GB, lo que lo hace apto para aplicaciones de visión embebidas.

La conversión publicada está verificada en CPU mediante una prueba de humo con `CompiledModel`, pero la delegación en GPU está bloqueada por patrones de tensor de rango 5 (principalmente `RESHAPE`, `TRANSPOSE` y operaciones de ventana/atención) que el backend GPU no soporta todavía. Se trata, por tanto, de un modelo CPU-ready, no de un modelo optimizado para aceleración GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViTv2 (vision transformer híbrido con separable self-attention) |
| Parametros totales | 7,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es `model.tflite` con entrada float32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`model.tflite`) |

## Arquitectura y entrenamiento

MobileViTv2 es una arquitectura híbrida que combina convoluciones con bloques de atención tipo transformer, diseñada específicamente para eficiencia en dispositivos móviles. La innovación central del paper es la separable self-attention, una forma de atención lineal que reduce la complejidad computacional frente a la self-attention estándar, permitiendo procesar mapas de características de imagen con un coste mucho menor. El modelo es a la vez clasificador de imágenes y backbone de extracción de características.

El checkpoint de origen es `timm/mobilevitv2_125.cvnets_in1k`, entrenado sobre ImageNet-1K (1000 clases) dentro del ecosistema `timm` y procedente de la implementación original de Apple en `ml-cvnets`. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, composición del dataset más allá de ImageNet-1K, ni sobre si se aplicaron fases de RLHF/DPO (poco habituales en clasificación de imágenes). La conversión a LiteRT mantiene la entrada en layout NCHW con forma `[1, 3, 256, 256]` y produce logits de salida `[1, 1000]`.

## Capacidades

- Clasificación de imágenes en las 1000 categorías de ImageNet-1K, devolviendo un vector de logits de dimensión 1000.
- Extracción de características (feature backbone) para tareas de visión downstream, según se indica en la model card.
- Inferencia en CPU mediante el runtime LiteRT (`CompiledModel`), con prueba de humo superada.
- Entrada de imagen de 256x256 píxeles en formato float32 y layout NCHW.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de visión y clasificación.
- No dispone de capacidades multilingües, de generación de texto, de audio ni de modo "thinking".
- No hay soporte de delegación GPU en la versión publicada; el backend GPU está bloqueado por los patrones de tensor de rango 5 del modelo.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: con 7,5 M de parámetros y 2,9 GMACs, el modelo cabe holgadamente en el presupuesto de cómputo de un smartphone y puede ejecutarse en CPU vía LiteRT para etiquetar fotos capturadas por la cámara en tiempo real.
- Filtrado y moderación de contenido en el dispositivo: clasificar imágenes entrantes en categorías ImageNet antes de subirlas a un servidor permite descartar contenido irrelevante o sospechoso sin enviar datos a la nube, reduciendo coste de ancho de banda y mejorando la privacidad.
- Preprocesado en pipelines de visión embebida: usar el modelo como backbone de características para alimentar clasificadores o detectores ligeros posteriores en dispositivos con recursos limitados (Raspberry Pi, cámaras IP, wearables).
- Organización automática de galerías fotográficas: etiquetar lotes de imágenes localmente para generar índices por categoría (animales, vehículos, objetos cotidianos) sin depender de servicios externos.
- Prototipado rápido de productos de visión: al estar disponible como artefacto TFLite de 0,1 GB, permite validar una idea de clasificación en un dispositivo real en minutos, antes de invertir en un modelo mayor o en entrenamiento propio.
- Investigación en eficiencia de modelos: sirve como referencia reproducible de MobileViTv2-125 para comparar técnicas de cuantización, pruning o destilación sobre un checkpoint estándar de `timm` convertido a LiteRT.
- Clasificación de imágenes en entornos sin conectividad: al ejecutarse íntegramente en CPU y en local, es adecuado para despliegues en campo, kioscos o dispositivos industriales sin acceso a red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de coste computacional (7,5 M de parámetros, 2,9 GMACs, 20,1 M de activaciones, imagen de 256x256) y el estado del runtime (prueba de humo en CPU superada, GPU bloqueada), sin cifras de precisión top-1/top-5 sobre ImageNet-1K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso publicado, ya que el artefacto está pensado para CPU. Como referencia de tamaño, el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no disponible; la delegación GPU está actualmente bloqueada por el backend de LiteRT para este modelo.
- ¿Cabe en GPU de consumo? El modelo es lo bastante pequeño (7,5 M de parámetros) para caber en cualquier GPU de consumo, pero la versión publicada no soporta aceleración GPU por los patrones de tensor de rango 5.
- Opciones de despliegue: runtime LiteRT (`CompiledModel`) en CPU; el modelo se distribuye como `model.tflite`. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión TFLite.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, la familia MobileViTv2 incluye variantes de distinto tamaño (por ejemplo, la variante de 125 aquí descrita frente a otras de mayor o menor capacidad), pero no se aportan cifras comparativas de precisión ni de latencia que permitan una tabla rigurosa.

| Modelo | Parametros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|
| mobilevitv2_125 (esta ficha) | 7,5 M | imagen 256x256 | no disponible | TFLite |
| Otras variantes MobileViTv2 | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clasificación móvil | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; antes de un uso comercial es imprescindible verificar los términos del checkpoint original `timm/mobilevitv2_125.cvnets_in1k` y del código de Apple `ml-cvnets`.
- El modelo clasifica exclusivamente en las 1000 clases de ImageNet-1K; cualquier categoría fuera de ese conjunto se mapeará a la clase más parecida, con riesgo de etiquetas erróneas.
- No hay soporte GPU en la versión publicada: los patrones de tensor de rango 5 (`RESHAPE`, `TRANSPOSE`, operaciones de ventana/atención) bloquean la delegación, por lo que el rendimiento en dispositivos con GPU disponible no se aprovecha.
- La prueba de humo en CPU es una verificación básica de ejecución, no una validación exhaustiva de precisión; no se aportan métricas de exactitud que confirmen que la conversión preserva el rendimiento del checkpoint original.
- Al ser un modelo de visión, no procesa texto ni lenguaje natural, y no dispone de capacidades de razonamiento, tool calling ni agentes.
- Riesgo de sesgo heredado del dataset ImageNet-1K (desequilibrios de clases, sesgos culturales y de representación), no documentado en la model card.
- El tamaño de entrada está fijado en 256x256; imágenes de otra resolución requieren redimensionado previo, lo que puede afectar a la precisión en objetos pequeños o muy alargados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/mobilevitv2_125
- Paper "Separable Self-attention for Mobile Vision Transformers": https://arxiv.org/abs/2206.02680
- Repositorio original de Apple: https://github.com/apple/ml-cvnets
- Checkpoint base en `timm`: `timm/mobilevitv2_125.cvnets_in1k`

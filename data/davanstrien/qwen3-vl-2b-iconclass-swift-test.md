# davanstrien/qwen3-vl-2b-iconclass-swift-test

## Resumen

El modelo `davanstrien/qwen3-vl-2b-iconclass-swift-test` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`, desarrollado por Daniel van Strien. Se ha ajustado mediante fine-tuning con la librería `ms-swift` sobre el dataset `davanstrien/iconclass-vlm-brillfull`, que contiene 200 muestras de entrenamiento orientadas a la generación de códigos Iconclass, un sistema de clasificación iconográfica utilizado en historia del arte. El objetivo es especializar el modelo de visión-lenguaje para tareas de catalogación y descripción de obras de arte.

La relevancia de este adaptador radica en su enfoque eficiente: en lugar de entrenar un modelo completo, se aplica una adaptación de bajo rango sobre un modelo base ya capaz de procesar imágenes y texto, reduciendo costes de entrenamiento y de inferencia. La publicación del adaptador en HuggingFace, con su configuración de entrenamiento reproducible, sirve como ejemplo de flujo de trabajo para ajustar VLM en entornos de GPU en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3-VL-2B-Instruct (modelo base de visión-lenguaje) |
| Parámetros totales | no disponible (adaptador LoRA con rank 8) |
| Parámetros activos | no disponible (LoRA solo entrena los pesos de adaptación) |
| Longitud de contexto | 2048 tokens (configuración de entrenamiento, no especifica el límite del modelo base) |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors, el modelo base puede cuantizarse aparte) |
| Idiomas soportados | no disponibles (depende del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 y alpha 32, entrenado con `ms-swift` sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`. El entrenamiento se realizó con 1 época, un learning rate de 0.0001, batch efectivo de 16, y longitud máxima de secuencia de 2048 tokens con un máximo de píxeles de 1.003.520. La torre de visión se mantuvo congelada durante el entrenamiento, lo que reduce el número de parámetros actualizados y acelera el proceso. La pérdida final de entrenamiento fue 1.848 y la de evaluación 1.868, con un tiempo total de entrenamiento de 1.6 minutos en una GPU.

El dataset de entrenamiento `davanstrien/iconclass-vlm-brillfull` contiene muestras de imágenes de obras de arte con sus correspondientes códigos Iconclass, lo que permite al modelo aprender a asociar contenido visual con la clasificación iconográfica. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; es un fine-tuning supervisado (SFT) estándar.

## Capacidades

- Generación de códigos Iconclass a partir de imágenes: el modelo puede recibir una imagen de una obra de arte y generar una descripción o código de clasificación iconográfica (por ejemplo, escenas bíblicas, mitológicas, etc.).
- Especialización en dominio de arte: el adaptador está entrenado específicamente para el vocabulario y las etiquetas de Iconclass, lo que mejora la precisión en tareas de catalogación frente al modelo base generalista.
- Capacidades de visión-lenguaje heredadas: al basarse en Qwen3-VL-2B-Instruct, conserva la capacidad de entender y generar texto en múltiples idiomas, así como de razonar sobre imágenes (aunque el adaptador no añade nuevas capacidades, solo ajusta el comportamiento en el dominio).
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso en el adaptador; estas capacidades dependen del modelo base.

## Casos de uso

- Catalogación de colecciones de arte: el modelo puede procesar imágenes de cuadros y generar automáticamente códigos Iconclass, facilitando la indexación en bases de datos de museos o bibliotecas digitales. Por ejemplo, al subir una pintura de la Anunciación, el modelo produce el código correspondiente a esa escena religiosa.
- Enriquecimiento de metadatos en repositorios culturales: se puede integrar en pipelines de digitalización de patrimonio para añadir etiquetas semánticas a las imágenes, mejorando la búsqueda y el acceso a las colecciones.
- Asistente para investigación en historia del arte: los investigadores pueden usar el modelo para obtener sugerencias de clasificación de obras no catalogadas, reduciendo el tiempo de revisión manual.
- Generación de descripciones textuales para exposiciones virtuales: a partir de una imagen, el modelo puede proporcionar una descripción con terminología Iconclass que sirva para crear contenido curatorial.
- Validación de metadatos existentes: comparando las salidas del modelo con las etiquetas Iconclass ya presentes en una colección, se pueden detectar errores o inconsistencias.
- Aprendizaje y demostración de fine-tuning en VLM: el adaptador sirve como ejemplo educativo para mostrar cómo entrenar un VLM con LoRA en tareas específicas, replicable con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta las pérdidas de entrenamiento (1.847) y evaluación (1.868), pero no se comparan con otros modelos ni se evalúa la precisión en tareas de clasificación Iconclass.

## Requisitos de hardware

- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base `Qwen/Qwen3-VL-2B-Instruct` junto con los pesos del adaptador. El modelo base tiene aproximadamente 2 mil millones de parámetros, por lo que puede ejecutarse en GPUs consumer con al menos 8-10 GB de VRAM en cuantización FP16 (por ejemplo, RTX 3060 o superior).
- No se han documentado requisitos específicos de VRAM para el adaptador en la información proporcionada.
- Para despliegue, se puede usar herramientas como `swift infer` (como se indica en la model card) o integrar el adaptador en frameworks como vLLM o llama.cpp, aunque no se ha especificado compatibilidad.
- La latencia y el throughput dependerán de la GPU y del tamaño del modelo base; al ser un adaptador pequeño, el impacto en la velocidad es mínimo.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores o modelos similares en el mismo repositorio. El adaptador se basa en un modelo base conocido, pero no hay datos de rendimiento comparativo. Se podría comparar con el modelo base sin ajuste, pero no se han publicado métricas al respecto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado con solo 200 muestras, lo que puede limitar su capacidad de generalización a variaciones de imágenes o categorías Iconclass no representadas en el dataset. Existe riesgo de sobreajuste a los ejemplos de entrenamiento.
- No se ha evaluado el comportamiento en datos fuera del dominio artístico; el adaptador puede degradarse en imágenes no relacionadas con Iconclass.
- La licencia del adaptador no está especificada en la model card, por lo que no se puede confirmar si es de código abierto o tiene restricciones comerciales. Se recomienda consultar el repositorio.
- El modelo base tiene restricciones de uso que pueden aplicarse al adaptador (por ejemplo, licencia de Qwen3-VL-2B-Instruct, que es Apache 2.0, pero no se confirma en el adaptador).
- Riesgo de alucinación en la generación de códigos Iconclass si la imagen no es clara o si el modelo no está seguro; siempre se recomienda supervisión humana en aplicaciones de catalogación.
- No se ha probado la robustez ante ataques adversarios o imágenes corruptas.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/davanstrien/qwen3-vl-2b-iconclass-swift-test
- Modelo base Qwen/Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/davanstrien/iconclass-vlm-brillfull
- Blog de Daniel van Strien sobre fine-tuning de VLM para Iconclass: https://danielvanstrien.xyz/posts/2025/iconclass-vlm-sft/trl-vlm-fine-tuning-iconclass.html
- Repositorio de Qwen3-VL en GitHub: https://github.com/QwenLM/Qwen3-VL

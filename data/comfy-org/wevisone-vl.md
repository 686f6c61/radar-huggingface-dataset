# Comfy-Org/WeVisOne-VL

## Resumen

WeVisOne-VL es un modelo de visión-lenguaje (VLM) desarrollado originalmente por Tencent y redistribuido por Comfy-Org en formato compatible con ComfyUI. Se publica en dos variantes de tamaño, 2B y 4B parámetros, ambas derivadas del repositorio original `tencent/WeVisOne-VL-4B` y `tencent/WeVisOne-VL-2B`. Esta ficha se centra en el repositorio de Comfy-Org, que no contiene pesos nuevos sino un reempaquetado de los pesos originales en formato `safetensors` con cuantización BF16 e INT8, listos para colocarse en el directorio `models/text_encoders/` de ComfyUI.

La relevancia de este repositorio es fundamentalmente práctica: facilita el uso de un VLM de 2B y 4B parámetros dentro de flujos de ComfyUI sin necesidad de convertir pesos ni gestionar dependencias de Hugging Face Transformers. El tamaño total del repositorio es de 22,8 GB, lo que incluye las cuatro variantes de pesos (2B y 4B, en BF16 e INT8). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución.

No se dispone de información detallada sobre la arquitectura interna, el contexto máximo, los idiomas soportados ni los datos de entrenamiento en la información proporcionada. La model card del repositorio de Comfy-Org se limita a indicar la procedencia de los pesos y las instrucciones de instalación, por lo que los datos técnicos de esta ficha se limitan a lo que puede inferirse del nombre, el tamaño y el formato de los archivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje, VLM) |
| Parámetros totales | 2B y 4B (dos variantes) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 e INT8 (sufijo `int8_convrot` en los archivos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`wevisone_vl_2b_bf16.safetensors`, `wevisone_vl_2b_int8_convrot.safetensors`, `wevisone_vl_4b_bf16.safetensors`, `wevisone_vl_4b_int8_convrot.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Por el nombre y la categoría (VL, visión-lenguaje) se trata de un modelo multimodal que procesa imágenes y texto, pero no se especifica si emplea un encoder visual tipo ViT acoplado a un decoder de lenguaje, ni detalles sobre atención, número de capas o dimensión oculta. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

El repositorio de Comfy-Org no aporta información sobre el entrenamiento; únicamente reempaqueta los pesos originales de Tencent en formato `safetensors` con dos precisiones (BF16 e INT8). La variante INT8 incluye el sufijo `convrot`, que sugiere una conversión de cuantización propia del pipeline de ComfyUI, pero no se detalla el método exacto ni las métricas de degradación asociadas. Para obtener información sobre la arquitectura y el entrenamiento sería necesario consultar el repositorio original de Tencent, que no forma parte de la información proporcionada.

## Capacidades

- Procesamiento multimodal de imagen y texto: el modelo pertenece a la categoría visión-lenguaje, por lo que se espera que acepte imágenes como entrada junto con instrucciones textuales.
- Generación de texto condicionada por imagen: descripción de contenido visual, respuesta a preguntas sobre imágenes y tareas de captioning.
- Integración con ComfyUI: los pesos están empaquetados para su uso como `text_encoder` en flujos de ComfyUI, lo que permite incorporar el modelo en pipelines de generación visual.
- Dos tamaños disponibles (2B y 4B) para ajustar el equilibrio entre calidad y requisitos de memoria.
- Cuantización INT8 disponible para reducir el uso de VRAM en inferencia.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingües específicas.

## Casos de uso

- Descripción automática de imágenes en flujos de ComfyUI: el modelo puede actuar como `text_encoder` para generar descripciones textuales de imágenes de entrada, integrándose en pipelines de generación o edición de imágenes dentro de ComfyUI.
- Preetiquetado de datasets visuales: con la variante de 2B en INT8, se puede desplegar en una GPU de consumo para generar captions o etiquetas sobre grandes lotes de imágenes antes de un entrenamiento posterior.
- Asistencia en tareas de accesibilidad: generación de descripciones textuales de imágenes para lectores de pantalla o interfaces de accesibilidad, usando la variante de 4B en BF16 cuando la calidad de la descripción sea prioritaria.
- Moderación de contenido visual asistida: el modelo puede responder a preguntas sobre el contenido de una imagen (por ejemplo, presencia de objetos o texto) para triaje previo en sistemas de moderación, con revisión humana posterior.
- Prototipado rápido de aplicaciones multimodales: al estar empaquetado para ComfyUI y con licencia Apache 2.0, sirve para validar ideas de producto que requieran comprensión de imágenes sin coste de licencia.
- Investigación en evaluación de VLMs pequeños: las variantes de 2B y 4B permiten estudiar el equilibrio entre tamaño y calidad en tareas de visión-lenguaje en entornos con recursos limitados.
- Generación de metadatos para bibliotecas de imágenes: etiquetado automático de archivos visuales con descripciones y palabras clave para sistemas de búsqueda interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para la variante 2B en INT8: aproximadamente 2-3 GB para los pesos, más overhead de activaciones y del encoder visual; en la práctica, cabe en GPUs de consumo con 8 GB o más.
- VRAM estimada para la variante 2B en BF16: aproximadamente 4-5 GB para los pesos, más overhead; viable en GPUs de 8-12 GB.
- VRAM estimada para la variante 4B en INT8: aproximadamente 4-6 GB para los pesos, más overhead; recomendable GPU de 12 GB o más.
- VRAM estimada para la variante 4B en BF16: aproximadamente 8-9 GB para los pesos, más overhead; recomendable GPU de 16 GB o más.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4090 para las variantes de 4B; A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, especialmente las variantes de 2B en INT8 y BF16; la variante de 4B en BF16 requiere al menos 16 GB para operar con margen.
- Opciones de despliegue: ComfyUI (formato nativo de este repositorio); para otros entornos sería necesario convertir los pesos al formato esperado por vLLM, TGI o llama.cpp, lo cual no está documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WeVisOne-VL (este repositorio) | 2B y 4B | no disponible | Apache 2.0 | Hugging Face (Comfy-Org) |
| Modelos VLM pequeños comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría y tamaño en la documentación proporcionada para establecer una comparativa rigurosa con datos de rendimiento.

## Limitaciones y advertencias

- La model card del repositorio de Comfy-Org no documenta sesgos conocidos, tasas de alucinación ni limitaciones específicas de idioma; se recomienda consultar el repositorio original de Tencent antes de un despliegue en producción.
- Al ser un modelo de visión-lenguaje, existe riesgo de alucinación en la descripción de imágenes, especialmente con contenido ambiguo o de baja resolución; se recomienda validación humana en aplicaciones críticas.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide garantizar el comportamiento en conversaciones multi-turno largas o con muchas imágenes.
- No se dispone de información sobre los idiomas soportados; no se debe asumir un rendimiento multilingüe sin evaluación previa.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio es un reempaquetado de pesos de Tencent; conviene verificar la licencia del repositorio original para confirmar que no existen restricciones adicionales.
- El repositorio está pensado para ComfyUI; su uso fuera de ese entorno requiere conversión de pesos no documentada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria amplia.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Comfy-Org/WeVisOne-VL
- Repositorio original de Tencent (4B): https://huggingface.co/tencent/WeVisOne-VL-4B
- Repositorio original de Tencent (2B): https://huggingface.co/tencent/WeVisOne-VL-2B
- GitHub de ComfyUI: https://github.com/Comfy-Org/ComfyUI

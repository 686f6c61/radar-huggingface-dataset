# Comfy-Org/ltx-2.3

## Resumen

El repositorio `Comfy-Org/ltx-2.3` contiene un conjunto de archivos LoRA (Low-Rank Adaptation) empaquetados para su uso directo en ComfyUI, orientados al modelo de difusión de vídeo LTX 2.3 desarrollado por Lightricks. Aunque el nombre del repositorio sugiere que se trata del modelo completo, el contenido real son adaptadores LoRA que se aplican sobre el modelo base LTX 2.3, que no se incluye en este repositorio. Los LoRA incluidos están especializados en tareas concretas: control de identidad (ID), ingredientes visuales (IC) y generación de vídeo con habla (TalkVid).

La relevancia de este paquete radica en que facilita la integración de capacidades avanzadas de personalización en flujos de trabajo de ComfyUI sin necesidad de gestionar múltiples descargas por separado. El repositorio fue creado en marzo de 2026 y actualizado en agosto de 2026, con 38 "me gusta" y cero descargas registradas, lo que sugiere que es un lanzamiento reciente o de nicho. La licencia es la `ltx-2-community-license`, una licencia comunitaria específica de Lightricks, cuyo texto completo está disponible en el repositorio oficial de LTX-2 en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusion de video LTX 2.3 |
| Parametros totales | no disponible (los archivos LoRA individuales tienen rangos de 3K a 111, pero el tamano total del repo es 6.4 GB) |
| Parametros activos | no disponible (depende del modelo base y del LoRA aplicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los archivos estan en formato safetensors con precision bf16 para uno de ellos) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license (https://github.com/Lightricks/LTX-2/blob/main/LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no incluye el modelo base LTX 2.3, sino únicamente adaptadores LoRA. Según los nombres de los archivos, se identifican cuatro LoRA distintos:

- `ltx-2.3-22b-ic-lora-ingredients-0.9.safetensors`: LoRA de "ingredientes" (IC) para el modelo de 22B parámetros, versión 0.9.
- `ltx-2.3-id-lora-celebvhq-3k.safetensors`: LoRA de identidad entrenado sobre el dataset CelebVHQ con 3000 identidades.
- `ltx-2.3-id-lora-talkvid-3k.safetensors`: LoRA de identidad para vídeo con habla (TalkVid) con 3000 muestras.
- `ltx_2.3_22b_distilled_1.1_lora_dynamic_fro09_avg_rank_111_bf16.safetensors`: LoRA destilado (versión 1.1) con rango dinámico promedio de 111, en precisión bf16.

Los LoRA de identidad (ID) están diseñados para preservar la apariencia de una persona concreta durante la generación de vídeo, mientras que el LoRA de ingredientes (IC) probablemente controla elementos visuales específicos. El LoRA destilado sugiere un proceso de destilación de conocimiento para mejorar la eficiencia. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de entrenamiento de los LoRA más allá de los nombres de los archivos.

## Capacidades

- Generación de vídeo condicionada por texto mediante el modelo base LTX 2.3, con los LoRA aplicados para personalización.
- Control de identidad facial: los LoRA `id-lora-celebvhq` e `id-lora-talkvid` permiten mantener la identidad de una persona en los vídeos generados.
- Generación de vídeo con habla sincronizada (TalkVid), orientado a avatares parlantes.
- Control de "ingredientes" visuales (objetos, estilos o elementos específicos) mediante el LoRA IC.
- Integración nativa con ComfyUI: los archivos están preparados para colocarse en la carpeta `models/loras/` y usarse mediante nodos estándar de LoRA.
- Compatibilidad con flujos de trabajo de difusión de vídeo de un solo archivo (single-file diffusion), según las etiquetas del repositorio.

## Casos de uso

- **Avatares parlantes personalizados**: el LoRA `id-lora-talkvid` permite generar vídeos de una persona hablando con sincronización labial, útil para doblaje, presentaciones virtuales o asistentes digitales. Se integraría en ComfyUI cargando el LoRA junto al modelo base y proporcionando un clip de audio y una imagen de referencia.
- **Preservación de identidad en vídeo generado**: con `id-lora-celebvhq`, se puede mantener la cara de un actor o personaje concreto a lo largo de una secuencia generada, evitando el problema común de la deriva facial en modelos de vídeo.
- **Control de elementos visuales específicos**: el LoRA IC permite inyectar objetos o estilos concretos en la escena generada, por ejemplo, un producto determinado o una ambientación particular, sin necesidad de redactar prompts complejos.
- **Producción de contenido para marketing**: combinando los LoRA de identidad e ingredientes, se pueden generar vídeos promocionales con un presentador conocido mostrando un producto, todo dentro de ComfyUI.
- **Investigación en generación de vídeo**: los LoRA destilados (versión 1.1) pueden servir para estudiar técnicas de destilación aplicadas a modelos de difusión de vídeo, comparando calidad y velocidad frente al modelo sin destilar.
- **Prototipado rápido en estudios de diseño**: los equipos creativos pueden usar estos LoRA en ComfyUI para generar storyboards animados o pruebas de concepto con personajes y elementos recurrentes, sin necesidad de entrenar modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento, comparativas con otros modelos ni evaluaciones cuantitativas de calidad de vídeo.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión, pero al tratarse de LoRA para un modelo base de 22B parámetros, se requiere el modelo LTX 2.3 completo, que probablemente necesite al menos 24 GB de VRAM en FP16 para inferencia. Los LoRA en sí son ligeros (cientos de MB), pero el modelo base domina el consumo.
- **GPU recomendadas**: para el modelo base de 22B, se recomiendan GPUs con 24 GB o más, como RTX 3090/4090, A5000, A6000 o A100. Para pruebas con cuantización, podría usarse una RTX 4080 con 16 GB si se aplican técnicas de offloading.
- **Compatibilidad con GPU de consumo**: el modelo base de 22B no cabe en GPUs de consumo de gama media (8-12 GB) sin cuantización agresiva o particionado. Los LoRA individuales sí son compatibles con cualquier GPU, pero el modelo base es el cuello de botella.
- **Opciones de despliegue**: ComfyUI es el destino principal, ya que los archivos están empaquetados para esa interfaz. También podrían usarse con otros frontends que soporten LoRA para modelos de difusión, como Automatic1111 o Difusers, siempre que se tenga el modelo base.
- **Latencia y throughput**: no disponible. Depende del modelo base, la GPU y la configuración de ComfyUI.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos. El repositorio contiene únicamente LoRA, no el modelo base completo, y no se han publicado especificaciones del modelo LTX 2.3 en esta fuente. Como referencia general, los modelos de difusión de vídeo comparables serían Stable Video Diffusion, Runway Gen-2 o Pika, pero no hay datos objetivos para comparar rendimiento, calidad o licencia.

## Limitaciones y advertencias

- **Dependencia del modelo base**: este repositorio no incluye el modelo LTX 2.3 completo. Para usar los LoRA es necesario descargar el modelo base por separado desde los repositorios oficiales de Lightricks, lo que añade complejidad y requisitos de almacenamiento.
- **Licencia restrictiva**: la `ltx-2-community-license` es una licencia comunitaria que puede imponer restricciones al uso comercial. Es imprescindible revisar el texto completo en el repositorio de Lightricks antes de usar el modelo en producción.
- **Sesgos y alucinaciones**: al ser un modelo de vídeo, puede generar contenido no deseado o distorsiones faciales, especialmente con identidades no representadas en los datos de entrenamiento. Los LoRA de identidad pueden fallar con ángulos extremos o iluminación inusual.
- **Idiomas**: no se especifican los idiomas soportados. El modelo base LTX 2.3 probablemente esté entrenado principalmente con datos en inglés, por lo que los prompts en otros idiomas pueden dar resultados inconsistentes.
- **Falta de documentación**: el repositorio no incluye instrucciones detalladas de uso, parámetros recomendados ni ejemplos de configuración. Los usuarios deben depender de su experiencia con ComfyUI y LoRA.
- **Actualización reciente**: el repositorio se actualizó en agosto de 2026, pero con cero descargas registradas, lo que sugiere que no ha sido ampliamente probado por la comunidad. Puede haber errores no detectados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/ltx-2.3
- Repositorio original de LoRA de ingredientes: https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Ingredients
- Repositorio original de LoRA de identidad CelebVHQ: https://huggingface.co/AviaDahan/LTX-2.3-ID-LoRA-CelebVHQ-3K
- Repositorio original de LoRA de identidad TalkVid: https://huggingface.co/AviaDahan/LTX-2.3-ID-LoRA-TalkVid-3K
- Licencia del modelo: https://github.com/Lightricks/LTX-2/blob/main/LICENSE

# pterasdasd/controlnet-union-sdxl-1.0

## Resumen

Este repositorio aloja una copia del modelo ControlNet++ (también comercializado como ControlNetPlus), un adaptador de control para SDXL desarrollado originalmente por el usuario xinsir y reeditado aquí bajo la cuenta pterasdasd. Se trata de un modelo de difusión de imagen (pipeline text-to-image) cuya función no es generar imágenes "desde cero" de forma autónoma, sino condicionar la generación de un modelo base Stable Diffusion XL mediante señales estructurales externas: pose (OpenPose), profundidad, Canny, lineart, anime lineart y otras hasta superar las diez condiciones distintas.

La innovación principal del modelo es que un único conjunto de pesos atiende todas esas condiciones, resolviendo el problema de tener que cargar un ControlNet independiente por cada tipo de control. Además, permite combinar varias condiciones simultáneamente en una misma inferencia sin necesidad de ajustar hiperparámetros ni rediseñar el prompt, ya que la fusión de condiciones se aprende durante el entrenamiento. La arquitectura parte del ControlNet original de Stable Diffusion, con dos módulos nuevos para soportar condiciones múltiples sin incrementar de forma significativa el coste computacional ni el número de parámetros.

El modelo ocupa 1.255.958.800 parámetros (aproximadamente 1,26 mil millones) y el repositorio pesa 5,0 GB. Está publicado con licencia Apache-2.0 y formato safetensors, listo para consumirse desde la librería diffusers. Es relevante ahora porque elimina la fragmentación de pipelines de ControlNet en SDXL: en lugar de mantener diez checkpoints separados y conmutarlos en memoria, un solo módulo cubre todos los casos, lo que simplifica despliegues en producción. Conviene señalar que este repositorio concreto es una re-subida con 0 descargas y 0 "likes", mientras que el repositorio canónico del autor original es xinsir/controlnet-union-sdxl-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet (adaptador para SDXL) basado en el ControlNet original, con dos modulos adicionales para soporte de multiples condiciones |
| Parametros totales | 1.255.958.800 (aproximadamente 1,26 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen, no de lenguaje) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible (los prompts dependen del modelo base SDXL y de sus codificadores de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con la libreria diffusers) |
| Pipeline | text-to-image |
| Tamano del repositorio | 5,0 GB |
| Condiciones de control | mas de 10 en la version base; 12 condiciones + 5 funciones de edicion avanzada en la version ProMax (segun la model card) |
| Modelo base | Stable Diffusion XL (SDXL) |

## Arquitectura y entrenamiento

La red parte de la arquitectura ControlNet clásica, que clona la mitad del codificador del U-Net del modelo base y lo conecta mediante conexiones residuales de valor cero para no degradar la generación. Sobre esa base, los autores añaden dos módulos nuevos: uno que permite que los mismos parámetros atiendan condiciones de imagen distintas, y otro que permite la entrada de múltiples condiciones sin incrementar el coste de cómputo. El resultado es que todas las condiciones comparten un único codificador de condición, sin parámetros ni operaciones extra por cada tipo de control. El número de parámetros es prácticamente el mismo que el de un ControlNet convencional.

En cuanto a los datos, la model card indica un entrenamiento sobre más de 10.000.000 de imágenes de alta calidad con cobertura diversa de situaciones, con muestreo por buckets al estilo NovelAI para soportar resoluciones altas y relaciones de aspecto arbitrarias. Los prompts se regeneraron mediante re-captioning con CogVLM siguiendo el enfoque de DALL·E 3, lo que mejora el seguimiento de instrucciones. Se aplicaron además técnicas de aumento de datos, múltiples funciones de pérdida y entrenamiento multi-resolución. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La versión ProMax añade 5 funciones de edición avanzada: tile deblur, tile variation, tile super resolution (con ejemplo de 1M a 9M de resolución), inpainting y outpainting. Los autores declaran que el entrenamiento de la variante SD3 está detenido por falta de recursos de GPU.

## Capacidades

- Generación de imágenes condicionada por estructura: OpenPose, profundidad (depth), Canny, lineart, anime lineart y más de diez condiciones en total.
- Control multi-condición en una sola pasada, con fusión aprendida durante el entrenamiento y sin hiperparámetros adicionales ni prompts especiales.
- Compatibilidad como adaptador con prácticamente cualquier modelo SDXL de código abierto (la model card cita BluePencilXL y CounterfeitXL) y con modelos LoRA.
- Generación a alta resolución y con relaciones de aspecto arbitrarias gracias al entrenamiento por buckets.
- Edición de imagen en la versión ProMax: inpainting, outpainting, tile deblur, tile variation y superresolución por tiles.
- Seguimiento de prompt mejorado por el re-captioning con CogVLM del conjunto de entrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente generativo de imagen.
- No se documentan capacidades multilingües propias; la comprensión del prompt depende del codificador de texto de SDXL.
- No hay modo "thinking", entrada de audio ni otras modalidades distintas de imagen.

## Casos de uso

- Previsualización de producto con pose controlada: partiendo de un maniquí o una fotografía de referencia con OpenPose, el modelo genera variaciones del producto manteniendo exactamente la postura, lo que permite producir catálogos consistentes sin repetir sesiones fotográficas.
- Ilustración y cómic con lineart: usando la condición de lineart o anime lineart se colorea y renderiza un boceto a línea, manteniendo el trazo original, lo que acelera el flujo de trabajo de ilustradores que ya trabajan con entintado tradicional.
- Retoque y edición por lotes: las funciones de inpainting y outpainting de la versión ProMax permiten eliminar objetos, rellenar zonas y extender el encuadre de una imagen de forma automatizada sobre conjuntos grandes de assets.
- Reconstrucción y mejora de material de archivo: la superresolución por tiles (con ejemplo documentado de 1M a 9M de píxeles) permite reescalar fotografías históricas o escaneos de baja resolución preservando la estructura original.
- Arquitectura e interiorismo: la combinación de condiciones de profundidad y Canny permite generar renders fotorrealistas a partir de un modelo 3D o de un boceto con líneas de fuga, respetando la volumetría del proyecto.
- Texturizado para pipelines 3D: la condición de tile variation y de tile super resolution sirve para generar texturas que se teselan sin costuras y para ampliar su resolución antes de aplicarlas a mallas.
- Integración en flujos de trabajo por nodos: al ser un checkpoint compatible con diffusers y con SDXL, se puede insertar como nodo en ComfyUI o como módulo en pipelines de Automatic1111 o Forge, combinándolo con LoRAs y otros adaptadores ya existentes en el estudio.
- Automatización de variaciones de diseño gráfico: con la misma condición estructural y distintos prompts se generan decenas de variantes de un cartel o una composición, manteniendo intacto el esqueleto visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma rendimiento superior en capacidad de control y en puntuación estética frente a otros ControlNet entrenados de forma independiente, así como ausencia de degradación apreciable al unificar condiciones, pero no acompaña esas afirmaciones con tablas de métricas, comparativas numéricas ni valores de FID, CLIP score o SSIM.

## Requisitos de hardware

- VRAM del ControlNet en precisión fp16: aproximadamente 2,5 GB, coherente con 1,26 mil millones de parámetros.
- VRAM total de la pipeline completa (U-Net de SDXL, codificadores de texto, VAE y ControlNet) en fp16: estimación de 10 a 14 GB sin optimizaciones.
- GPU de consumo: cabe en tarjetas con 12 GB o más, como la RTX 3060 12 GB, la RTX 4070 Ti, la RTX 4080 y la RTX 4090, esta última con margen amplio para lotes y resoluciones altas.
- GPU de 8 GB: viable con técnicas de offloading de módulos a CPU y atención eficiente, habituales en ComfyUI y en las implementaciones de bajo consumo de VRAM de diffusers.
- GPU profesional: A100 de 40 o 80 GB y H100 para inferencia por lotes o para servir varias peticiones concurrentes; también válidas las L40S y A6000 para despliegue en servidor.
- Opciones de despliegue: diffusers, ComfyUI, Automatic1111, Forge, SD.Next y, para máximo rendimiento en NVIDIA, compilación con TensorRT. No se documenta soporte de llama.cpp ni de Ollama, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada. Depende de la GPU, de la resolución de salida, del número de pasos de muestreo y del número de condiciones activas.

## Comparativa con modelos similares

| Modelo | Parametros | Condiciones soportadas | Licencia | Disponibilidad |
|---|---|---|---|---|
| pterasdasd/controlnet-union-sdxl-1.0 (este repositorio) | 1,26 mil millones | mas de 10 en la version base; 12 + 5 funciones de edicion en ProMax | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| xinsir/controlnet-union-sdxl-1.0 | no disponible en la informacion proporcionada | equivalente, es el repositorio canonico del autor original | apache-2.0 | HuggingFace, repositorio de referencia |
| ControlNet individuales para SDXL (por ejemplo controlnet-canny-sdxl-1.0) | no disponible en la informacion proporcionada | una unica condicion por checkpoint | habitualmente apache-2.0 o CreativeML Open RAIL++-M segun el autor | HuggingFace |
| ControlNet para SD 1.5 (lllyasviel/ControlNet) | aproximadamente 360 millones | una unica condicion por checkpoint | CreativeML Open RAIL-M | HuggingFace |

La diferencia funcional clave frente a los ControlNet individuales es la unificación: un solo archivo cubre todas las condiciones y permite combinarlas, mientras que el enfoque tradicional obliga a cargar un checkpoint distinto por cada tipo de control y a gestionar su coexistencia en memoria.

## Limitaciones y advertencias

- Repositorio de terceros: la cuenta pterasdasd no es el autor original del modelo, y el repositorio registra 0 descargas y 0 likes. Conviene verificar la integridad de los pesos y considerar el repositorio canónico xinsir/controlnet-union-sdxl-1.0 antes de usarlo en producción.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-19) es posterior a la fecha de la consulta, lo que sugiere un problema de sellado de tiempo o de gestión del repositorio.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible, perspectivas incoherentes o detalles que no existen en la imagen de control, especialmente con condiciones ambiguas.
- Dependencia del modelo base: la calidad final está condicionada por el checkpoint SDXL sobre el que se aplique el adaptador; las afirmaciones de la model card sobre estética se refieren a su configuración de referencia.
- Sesgos: el dataset de más de 10 millones de imágenes no se describe en detalle, por lo que no es posible evaluar sesgos de representación demográficos, culturales o estilísticos. Es previsible que herede los sesgos de SDXL y de los conjuntos de imágenes web empleados.
- Idiomas: no se documenta soporte multilingüe explícito; los prompts en castellano pueden rendir peor que en inglés porque el codificador de texto de SDXL está entrenado mayoritariamente en inglés.
- Licencia: el adaptador se publica bajo Apache-2.0, pero el modelo base SDXL se distribuye bajo CreativeML Open RAIL++-M, que impone restricciones de uso adicionales. Para uso comercial hay que revisar ambas licencias y las de cualquier LoRA combinada.
- Falta de benchmarks: no hay métricas publicadas que respalden las afirmaciones de calidad, ni comparativas objetivas frente a ControlNet individuales.
- Estado del proyecto: la propia model card indica que el entrenamiento de la variante SD3 está detenido por falta de GPU, por lo que no cabe esperar actualizaciones a corto plazo en esa línea.
- Resoluciones extremas: aunque se documenta superresolución por tiles de 1M a 9M de píxeles, esos flujos requieren mucha más VRAM y tiempos de inferencia muy superiores a los de una generación estándar a 1024 píxeles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pterasdasd/controlnet-union-sdxl-1.0
- Repositorio canónico del autor original: https://huggingface.co/xinsir/controlnet-union-sdxl-1.0
- Repositorio de código y scripts de inferencia: https://github.com/xinsir6/ControlNetPlus/tree/main
- No se han encontrado otros enlaces relevantes en la búsqueda web: los resultados devueltos corresponden a un servicio de sillas de ruedas del sistema sanitario británico y a fichas de empresas y direcciones postales de Londres, sin ninguna relación con el modelo.

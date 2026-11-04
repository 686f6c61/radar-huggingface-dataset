# RunningHubAI/rh-krea2-r-lokr-lora

## Resumen

rh-krea2-r-lokr-lora es un adaptador LoRA (en concreto, LoKr o Low-Rank Kronecker Product) para edición y generación de imágenes a partir de texto, publicado por RunningHubAI y entrenado sobre el modelo base krea2. No es un modelo de lenguaje, sino un complemento de pesos que se carga sobre un modelo de difusión para modificar su comportamiento estilístico. Su función es introducir una estética concreta (denominada "Cthulhu aesthetics" o "克系美学" en la model card) y facilitar la generación de imágenes con un sesgo hacia el estilo anime.

El adaptador se distribuye en formato safetensors con un tamaño de 93 MiB, lo que refleja la compactación típica de LoKr frente a LoRA convencional. Está pensado para ejecutarse en ComfyUI, en la plataforma RunningHub y en Hugging Face, y su pipeline declarado es image-text-to-image. La relevancia actual reside en que demuestra la aplicación de descomposiciones de Kronecker para adaptadores de difusión con recuentos de parámetros reducidos, un área activa en la eficiencia de fine-tuning de modelos generativos.

La información disponible es limitada: no se especifican parámetros totales del modelo base, contexto (no aplica a un modelo de imagen), idiomas ni licencia explícita. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 4 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA con descomposición LoKr (Low-Rank Kronecker Product) sobre modelo base de difusión krea2 |
| Parametros totales | no disponible (adaptador de 93 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de la model card están en chino e inglés) |
| Licencia | no disponible (la model card indica que se sigue la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Krea2-R lokr 克系美学.safetensors`, 93 MiB) |

## Arquitectura y entrenamiento

El adaptador emplea LoKr (Low-Rank Kronecker Product), una variante de bajo rango en la que la actualización de pesos se descompone como ΔW = C ⊗ (B·A). Según la model card, esto permite dividir una matriz de 512×512 en factores de 16×16 y 32×32, aprovechando la propiedad multiplicativa del rango del producto de Kronecker para alcanzar un rango equivalente mayor que LoRA con un recuento de parámetros controlable. El resultado es una estructura con repetición a nivel de bloque que, a igual rango, produce archivos más pequeños que LoRA y, según el autor, mayor eficiencia paramétrica.

El adaptador se ha fine-tuneado a partir del modelo krea2 (no se detalla la versión ni la variante). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en difusión). La model card advierte que la estabilidad de entrenamiento de LoKr es media y sensible a la calidad de los datos, y que requiere conjuntos de entrenamiento diversos y de alta calidad. Se recomienda un peso de 1 cuando se usa solo, y también de 1 en combinación con modelos de cara, consultando la imagen de muestra para pesos opcionales.

## Capacidades

- Generación y edición de imágenes a partir de texto (pipeline image-text-to-image) sobre el modelo base krea2.
- Aplicación de un estilo visual concreto mediante palabras de activación: "克系美学" (estética Cthulhu), "数字化作品" (obra digital) y "猩红面具" (máscara escarlata).
- Sesgo hacia estética anime, con la posibilidad de obtener un aspecto más fotorrealista usando términos realistas.
- Combinación con modelos de cara (face models) para composición de retratos.
- Integración con flujos de ComfyUI y con la plataforma RunningHub.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de un LLM; su ámbito es exclusivamente la generación de imagen.

## Casos de uso

- Ilustración de estilo anime con temática de terror cósmico: el adaptador permite generar personajes y escenas con la estética "克系美学" usando prompts cortos (menos de 30 palabras), lo que encaja en producción de arte conceptual para videojuegos o cómics.
- Edición de imágenes existentes con transferencia de estilo: al ser un pipeline image-text-to-image, se puede partir de una imagen base y aplicar el estilo del adaptador para unificar la dirección artística de un conjunto de assets.
- Retratos estilizados combinados con face models: la model card indica que se puede combinar con modelos de cara con peso 1, útil para generar avatares o personajes consistentes en un proyecto de narrativa visual.
- Prototipado rápido en ComfyUI: al integrarse en flujos de ComfyUI, permite iterar sobre variaciones de estilo sin reentrenar el modelo base, reduciendo el coste de experimentación.
- Generación de material promocional temático: para campañas o contenido de nicho (terror, fantasía oscura) donde se necesita un lenguaje visual específico y reconocible.
- Despliegue vía API de RunningHub: la plataforma ofrece endpoints para invocar el modelo, lo que facilita integrarlo en aplicaciones web o pipelines automatizados de generación de imágenes.
- Investigación sobre eficiencia de adaptadores: el uso de LoKr con 93 MiB sirve como caso de estudio para comparar calidad y coste frente a LoRA estándar en modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base krea2, cuyos requisitos no se detallan en la información proporcionada. El adaptador en sí ocupa 93 MiB.
- GPU recomendadas: no disponible. Al ser un adaptador sobre un modelo de difusión, los requisitos vendrán determinados por el modelo base; no se especifican GPU concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ComfyUI (plataforma principal), RunningHub (internacional y China) y Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye adaptadores LoKr o LoRA comparables sobre krea2 ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgo estilístico fuerte hacia anime: la propia model card advierte que el adaptador "invade" el estilo anime, por lo que puede reducir la variedad de resultados y requerir términos realistas para contrarrestarlo.
- Los prompts deben mantenerse por debajo de 30 palabras; descripciones largas pueden degradar el resultado.
- Sensibilidad a la calidad de los datos: el autor señala que LoKr tiene estabilidad de entrenamiento media y es sensible a la diversidad y calidad del conjunto de entrenamiento.
- Licencia no especificada: la model card indica que se debe seguir la licencia del proyecto original o upstream, lo que introduce incertidumbre para uso comercial. Es necesario verificar la licencia de krea2 antes de desplegarlo en producción.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir artefactos, anatomías incorrectas o inconsistencias, especialmente con prompts ambiguos.
- Idiomas: no se declaran idiomas soportados; las palabras de activación están en chino, lo que puede limitar su uso a usuarios que no manejen ese idioma.
- Repositorio sin tracción: 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- Sin datos de benchmarks ni de requisitos de hardware, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-r-lokr-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2117790631543451650
- Página del autor: https://www.runninghub.ai/user-center/2027638706101559298
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Flujo de trabajo recomendado: https://www.RunningHub.ai/zh-cn/post/2110636832210817025
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model

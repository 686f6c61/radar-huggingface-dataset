# colosslabs/Krea-2-Coloss-Raw

## Resumen

Krea-2-Coloss-Raw es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por colosslabs como un fine-tuning sobre krea/Krea-2-Raw, el modelo base de Krea. Se trata de un ajuste especializado orientado a la anatomía humana realista, con etiquetas que indican contenido para adultos (NSFW), por lo que está clasificado como "not-for-all-audiences" y su acceso está restringido en Hugging Face: es necesario aceptar las condiciones de la licencia krea-2-community-license antes de poder descargarlo.

El modelo conserva la arquitectura de difusión del modelo base Krea-2 y se distribuye en formato safetensors compatible con la librería diffusers de Hugging Face y con flujos de trabajo de ComfyUI. El repositorio pesa 79,2 GB y los pesos suman aproximadamente 12.820 millones de parámetros (12,8 B). Su relevancia radica en ofrecer una variante "raw" (sin filtrar) del modelo Krea-2 con entrenamiento adicional centrado en anatomía, útil para creadores que necesiten mayor fidelidad anatómica en figuras humanas, siempre dentro de los términos de la licencia comunitaria de Krea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (fine-tuning de Krea-2) |
| Parametros totales | 12.820.073.036 (≈12,8 B) |
| Parametros activos | no disponible (no es un modelo MoE de lenguaje) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (other) |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) de krea/Krea-2-Raw, un modelo de difusión para text-to-image. La información disponible no detalla la arquitectura interna exacta del modelo base (tipo de backbone de difusión, texto encoder empleado o número de pasos de inferencia recomendados), por lo que estos datos no están disponibles en la ficha pública.

Respecto al entrenamiento, las etiquetas del repositorio indican que se trata de un modelo base orientado a anatomía y entrenamiento de LoRA ("lora-training", "base-model", "anatomy"). Esto sugiere que colosslabs lo publica como punto de partida para que otros usuarios entrenen sus propios adaptadores LoRA con mayor fidelidad anatómica que el modelo base original. No se ha publicado información sobre el número de imágenes de entrenamiento, la composición del dataset, el hardware empleado ni el método de ajuste (DreamBooth, LoRA de rango completo, etc.).

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image mediante diffusers).
- Representación anatómica humana mejorada respecto al modelo base Krea-2-Raw, según el propósito declarado del fine-tuning.
- Uso como modelo base para entrenamiento de LoRAs personalizadas.
- Compatibilidad con flujos de trabajo de ComfyUI para generación local.
- Contenido sin filtrado (raw), incluyendo material NSFW, sujeto a las condiciones de la licencia y a la aceptación previa en Hugging Face.

## Casos de uso

- Entrenamiento de LoRAs especializadas en anatomía: al publicarse como base-model con etiqueta de lora-training, el caso de uso principal es servir de punto de partida para ajustes posteriores por parte de la comunidad.
- Generación de referencias anatómicas para ilustración: artistas pueden generar poses y figuras humanas con mayor coherencia estructural que con el modelo base, útiles como referencia previa al dibujo o la escultura digital.
- Concept art de personajes: producción de diseños de personajes con anatomía realista para videojuegos, cine o cómic, reduciendo el trabajo de corrección de manos, extremidades y proporciones.
- Fotografía generativa de retratos y figuras: creación de imágenes fotorrealistas de personas donde la fidelidad anatómica es crítica, integrado en pipelines de ComfyUI.
- Producción de contenido para adultos con licencia comunitaria: el modelo está etiquetado explícitamente para este fin, restringido a usuarios que acepten los términos de la licencia krea-2-community-license.
- Comparativa y evaluación de fine-tunings: investigadores y entusiastas de difusión pueden usarlo como referencia para medir el efecto de ajustes anatómicos frente al modelo base Krea-2-Raw.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de difusión de imágenes, las métricas habituales de LLM (MMLU, HumanEval, GSM8K) no son aplicables; tampoco se han publicado evaluaciones tipo FID, CLIP Score ni comparativas ELO en la ficha del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; con ~12,8 B de parámetros en precisión completa (79,2 GB de repositorio), se estima que se necesita una GPU de gama alta con 24-80 GB de VRAM para ejecutarlo sin cuantizar, o técnicas de offloading/cuantización para hardware menor.
- GPU recomendadas: no disponible; por el tamaño de los pesos, serían adecuadas tarjetas del nivel de una RTX 4090 (con cuantización u offloading), A100 40/80 GB o H100.
- Consumer GPUs: la ejecución directa en precisión completa no cabe en GPUs de consumo habituales (8-16 GB); con cuantización u offloading podría ser viable en una RTX 4090 de 24 GB, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: librería diffusers de Hugging Face y ComfyUI (indicados en las etiquetas del repositorio). No se mencionan soportes explícitos para otros backends.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| colosslabs/Krea-2-Coloss-Raw | ≈12,8 B | Fine-tuning text-to-image (anatomía) | krea-2-community-license | Acceso restringido (gated), orientado a LoRA training |
| krea/Krea-2-Raw (modelo base) | no disponible | Text-to-image base | krea-2-community-license | Modelo original sobre el que se basa este fine-tuning |
| FLUX.1 [dev] (Black Forest Labs) | 12 B | Text-to-image (rectified flow transformer) | Licencia no comercial | Referencia de categoría de tamaño similar |

La comparativa es orientativa: los datos de parámetros y rendimiento de Krea-2-Raw no están publicados en la información disponible, y FLUX.1 [dev] se incluye como alternativa de referencia en la misma categoría de modelos de difusión de gran tamaño.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está etiquetado como "not-for-all-audiences" y genera contenido sin filtrar; no es adecuado para entornos de producción orientados al público general sin capas adicionales de moderación.
- Acceso restringido: es un modelo gated en Hugging Face; hay que aceptar las condiciones de la licencia krea-2-community-license antes de descargarlo.
- Licencia comunitaria: la krea-2-community-license puede imponer restricciones al uso comercial (límites de ingresos, requisitos de atribución o usos prohibidos); conviene revisar el texto completo de la licencia antes de cualquier despliegue comercial.
- Riesgo de generación de contenido indebido: al ser un modelo raw sin filtrado, puede producir imágenes de personas reales o contenido sensible; la responsabilidad del uso recae en el usuario final.
- Información técnica incompleta: no se han publicado detalles sobre el dataset de entrenamiento, método de fine-tuning, pasos de inferencia recomendados ni configuraciones óptimas de muestreo, lo que dificulta la evaluación previa.
- Descargas prácticamente nulas (0 en el momento de la ficha) y sin comunidad de soporte documentada, por lo que la detección de defectos o sesgos del fine-tuning depende del propio usuario.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/colosslabs/Krea-2-Coloss-Raw
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- No se han encontrado enlaces adicionales (paper, blog o demo) en la información disponible.

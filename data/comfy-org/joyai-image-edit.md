# Comfy-Org/JoyAI-Image-Edit

## Resumen

JoyAI-Image-Edit es un modelo de edición de imágenes guiada por instrucciones desarrollado por JD Open Source y reempaquetado por Comfy-Org para su uso directo en ComfyUI. Combina un modelo de lenguaje multimodal (MLLM) de 8 mil millones de parámetros basado en Qwen3-VL con un transformador de difusión multimodal (MMDiT) de 16 mil millones de parámetros, lo que permite comprender la imagen de entrada, interpretar la instrucción textual y generar una imagen editada manteniendo la identidad del sujeto y la composición original. El modelo está disponible en formatos BF16 e INT8, y se distribuye bajo licencia Apache-2.0.

Este modelo resuelve un problema habitual en la edición local de imágenes: la deriva facial (face drift) y la alteración no deseada de la composición al usar técnicas de inpainting tradicionales. Al integrar un MLLM que entiende la semántica de la escena, JoyAI-Image-Edit produce ediciones más fieles a la instrucción y conserva mejor los rasgos del personaje. Su relevancia actual radica en que ofrece una alternativa open source de alto rendimiento para flujos de edición generativa sin depender de servicios en la nube, con soporte nativo en ComfyUI, una de las interfaces más utilizadas por la comunidad.

El repositorio de Comfy-Org contiene los pesos listos para cargar en ComfyUI, incluyendo el modelo de difusión, el codificador de texto y el VAE (Wan 2.1), organizados en las carpetas correspondientes. El tamaño total del repositorio es de 76,8 GB, lo que refleja la magnitud del modelo y sus requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM (Qwen3-VL 8B) + MMDiT (16B) |
| Parametros totales | 8B (MLLM) + 16B (MMDiT) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

JoyAI-Image-Edit sigue una arquitectura híbrida que combina un modelo de lenguaje multimodal (MLLM) de 8 mil millones de parámetros, basado en Qwen3-VL, con un transformador de difusión multimodal (MMDiT) de 16 mil millones de parámetros. El MLLM es el encargado de codificar la imagen de entrada y la instrucción textual, generando una representación conjunta que condiciona al MMDiT para producir la imagen editada. Esta separación de roles permite que el modelo entienda la semántica de la escena y aplique cambios locales o globales según lo solicitado, manteniendo la coherencia visual.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados o si se emplearon técnicas de RLHF o DPO. Sin embargo, el repositorio oficial de JD Open Source indica que el modelo sigue un principio de "colaboración en bucle cerrado" entre comprensión, generación y edición, lo que sugiere un entrenamiento orientado a reforzar la consistencia entre estas tres tareas. La disponibilidad en formatos BF16 e INT8 indica que se ha optimizado para diferentes rangos de hardware, siendo el INT8 una opción para GPUs con menor VRAM.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural, tanto para cambios locales (modificar un objeto, cambiar el color) como globales (cambiar el fondo, alterar la iluminación).
- Comprensión multimodal de imágenes: el MLLM interpreta la escena completa, lo que permite ediciones que respetan la composición y la identidad de los sujetos.
- Generación de imágenes texto-a-imagen, aunque el foco principal es la edición.
- Soporte multi-imagen: el modelo puede recibir varias imágenes como entrada para tareas que requieren combinar información de múltiples fuentes.
- Mantenimiento de la consistencia facial: reduce el "face drift" comparado con técnicas de inpainting tradicionales, según pruebas comunitarias.
- Integración nativa con ComfyUI: los pesos están empaquetados para cargarse directamente en los nodos de difusión, codificador de texto y VAE.

## Casos de uso

- Edición de retratos con preservación de identidad: el modelo permite cambiar expresiones, añadir accesorios o modificar el fondo de un retrato sin alterar los rasgos faciales del sujeto, algo crítico en fotografía de producto o retratos profesionales.
- Restauración y mejora de imágenes antiguas: mediante instrucciones como "elimina el ruido y restaura los colores", el modelo puede aplicar correcciones globales manteniendo la estructura original.
- Diseño de producto y mockups: un diseñador puede cargar una foto de un producto y pedir cambios de color, textura o entorno, generando variantes rápidas sin necesidad de renderizado 3D.
- Creación de contenido para redes sociales: los creadores pueden editar imágenes con instrucciones en lenguaje natural, como "cambia el cielo por un atardecer" o "añade un gato en el sofá", sin dominar herramientas complejas de edición.
- Automatización de flujos de edición en producción: al integrarse en ComfyUI, se puede construir pipelines que reciban imágenes y textos de forma programática, permitiendo procesamiento por lotes en entornos de servidor.
- Investigación en edición generativa: el modelo sirve como base para estudiar la interacción entre comprensión de imágenes y generación condicionada, dado su diseño modular y su licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio oficial de JD Open Source no incluye tablas comparativas con otros modelos de edición de imágenes, y los artículos comunitarios se centran en la experiencia de uso cualitativa más que en métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: para el formato BF16, se requieren aproximadamente 48 GB de VRAM (8B + 16B en BF16, más overhead del VAE y activaciones). Con cuantización INT8, la demanda se reduce a unos 24 GB, aunque el tamaño exacto depende de la resolución de entrada y el número de pasos de difusión.
- GPU recomendadas: para BF16 se necesitan GPUs de nivel profesional como A100 (80 GB), H100 (80 GB) o RTX 6000 Ada (48 GB). Para INT8, una RTX 4090 (24 GB) o RTX A6000 (48 GB) pueden ser suficientes.
- No cabe en GPUs de consumo de gama baja (8-12 GB VRAM) ni siquiera con INT8, dado el tamaño combinado de los componentes.
- Opciones de despliegue: ComfyUI es el entorno principal, ya que los pesos están empaquetados para sus nodos. También se puede usar con la librería de difusores de HuggingFace mediante el modelo base `jdopensource/JoyAI-Image-Edit-Plus-Diffusers`, aunque no se documenta soporte para vLLM, llama.cpp u Ollama, al ser un modelo de difusión y no un LLM autoregresivo.
- Latencia y throughput: no hay datos oficiales. En una A100, se estiman tiempos de edición de varios segundos por imagen (típico de modelos de difusión de 16B), pero depende de la resolución y los pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| JoyAI-Image-Edit | 8B MLLM + 16B MMDiT | no disponible | Apache-2.0 | safetensors | Edición por instrucciones con comprensión multimodal |
| InstructPix2Pix | 1.4B (difusión) | 512x512 | Apache-2.0 | safetensors | Edición por instrucciones, sin MLLM |
| MagicBrush | 1.4B (difusión) | 512x512 | Apache-2.0 | safetensors | Edición por instrucciones, entrenado con datos sintéticos |
| SEED-Edit | 8B (MLLM) + difusión | no disponible | Apache-2.0 | safetensors | Edición por instrucciones con MLLM |

La comparación muestra que JoyAI-Image-Edit es significativamente más grande que los modelos de edición clásicos como InstructPix2Pix o MagicBrush, lo que le permite una mejor comprensión semántica y consistencia visual. Frente a SEED-Edit, comparte la arquitectura MLLM + difusión, pero JoyAI-Image-Edit añade un MMDiT de 16B, lo que podría ofrecer mayor calidad de generación a costa de mayores requisitos de hardware. No se dispone de benchmarks para comparar numéricamente.

## Limitaciones y advertencias

- El modelo requiere hardware de gama alta (mínimo 24 GB VRAM en INT8), lo que limita su uso en equipos de consumo estándar.
- No se han publicado datos sobre sesgos o alucinaciones específicas. Como modelo entrenado con datos de internet, puede reflejar sesgos presentes en esos datos, especialmente en cuanto a género, etnia o cultura.
- La edición de imágenes puede producir resultados no deseados si la instrucción es ambigua o contradictoria con el contenido visual; se recomienda validar las salidas en flujos de producción.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo depende de componentes de terceros (Qwen3-VL, Wan VAE) cuyas licencias individuales deben verificarse antes de un despliegue comercial.
- No se documenta la longitud de contexto ni los idiomas soportados, por lo que el comportamiento con instrucciones en idiomas distintos al inglés o con imágenes de alta resolución no está garantizado.
- El tamaño del repositorio (76,8 GB) implica una descarga considerable y espacio en disco; además, la carga del modelo en memoria requiere una gestión cuidadosa de la VRAM.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Comfy-Org/JoyAI-Image-Edit
- Repositorio original del modelo: https://huggingface.co/jdopensource/JoyAI-Image-Edit-Plus-ComfyUI
- Repositorio de difusores: https://huggingface.co/jdopensource/JoyAI-Image-Edit-Plus-Diffusers
- GitHub de JD Open Source: https://github.com/jd-opensource/JoyAI-Image
- Guía de instalación en ComfyUI (blog): https://aistudynow.com/how-to-set-up-joyai-image-edit-in-comfyui-no-more-face-drift/
- Wiki de ComfyUI sobre el modelo: https://comfyui-wiki.com/en/models/joyai/joyai-image-edit

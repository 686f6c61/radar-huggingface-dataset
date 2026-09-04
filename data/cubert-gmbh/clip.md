# cubert-gmbh/clip

## Resumen

El modelo `cubert-gmbh/clip` es un espejo (mirror) idéntico a nivel de bytes del checkpoint de OpenAI CLIP ViT-L/14@336px, publicado por Cubert GmbH para su uso en los plugins de Cuvis.AI. No incluye fine-tuning ni conversión de pesos: los archivos son exactamente los publicados por OpenAI, con su licencia original. El repositorio está pensado para aprovisionar los pesos de forma reproducible en un caché compartido, evitando que cada usuario necesite una cuenta o token de Hugging Face. Se trata de un modelo de visión-lenguaje (vision-language backbone) que codifica imágenes y texto en un espacio común. La arquitectura es ViT-L/14 con resolución de 336 píxeles, y el tamaño del repositorio es de 0,9 GB. La licencia está marcada como unknown porque no hay una declaración explícita que cubra los pesos, aunque el repositorio de OpenAI CLIP se publica bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/14@336px (CLIP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de codificación imagen-texto, no autoregresivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | unknown (los pesos no tienen declaración explícita; el repositorio upstream es MIT) |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un espejo del checkpoint `ViT-L/14@336px` de OpenAI CLIP. CLIP utiliza una arquitectura dual: un codificador de imágenes basado en Vision Transformer (ViT) con patch de 14 y resolución de 336 píxeles, y un codificador de texto que es un transformer. Ambos se entrenan de forma contrastiva para alinear representaciones de imágenes y texto en un espacio latente común. Según la información proporcionada, no hay fine-tuning, conversión ni re-serialización: los archivos son los publicados por OpenAI. No se proporcionan datos sobre el entrenamiento, el tamaño del dataset, el número de tokens ni si hubo RLHF/DPO; por tanto, no disponible. Tampoco se mencionan innovaciones técnicas adicionales en este mirror más allá de su uso como backbone en el ecosistema Cuvis.AI.

## Capacidades

- Codificación de imágenes y texto para generar embeddings en un espacio semántico común.
- Clasificación de imágenes zero-shot mediante comparación de similitud coseno entre embeddings de imagen y de texto.
- Backbone de visión-lenguaje para tareas de búsqueda, recuperación y emparejamiento imagen-texto.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo de lenguaje).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No incluye modo de pensamiento, visión en el sentido de generación, ni audio.

## Casos de uso

- Clasificación de imágenes zero-shot en producción: el modelo permite clasificar imágenes sin necesidad de entrenar un clasificador específico, usando plantillas de texto como "una foto de un {clase}". Es adecuado para sistemas de moderación de contenido o etiquetado automático.
- Búsqueda semántica de imágenes en bases de datos: se pueden indexar embeddings de imágenes y consultar con texto libre para encontrar imágenes relevantes, por ejemplo en catálogos de productos o archivos fotográficos.
- Backbone para sistemas de recuperación multimodal: al ser un modelo de codificación, puede integrarse en pipelines que combinan texto e imágenes, como motores de recomendación visual.
- Integración en plugins de Cuvis.AI para análisis de imágenes hiperespectrales: el mirror está diseñado para aprovisionar los pesos en el caché de Cuvis.AI y ejecutar pipelines offline sin tokens, lo que facilita el despliegue en entornos industriales.
- Evaluación de similitud imagen-texto para investigación: se puede usar para medir la distancia semántica entre una imagen y descripciones textuales en estudios de visión artificial.
- Generación de features para modelos de clasificación posteriores: los embeddings de CLIP pueden alimentar modelos lineales o redes pequeñas para tareas específicas con pocos datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento en MMLU, HumanEval, GSM8K ni en otros conjuntos de evaluación para este mirror. Al ser un checkpoint idéntico al de OpenAI CLIP ViT-L/14@336px, podría esperarse un comportamiento equivalente al modelo original, pero no se aportan métricas en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El archivo de pesos pesa 934,1 MB, por lo que se necesitará al menos esa cantidad de memoria para cargar el modelo, más la memoria de activaciones.
- GPU recomendadas: no disponibles. No se especifica una GPU concreta en la información.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamaño del checkpoint, es plausible que quepa en GPUs de consumo con al menos 4 GB de VRAM, pero no hay datos confirmados.
- Opciones de despliegue: no disponibles. El modelo se distribuye como archivo `.pt` de PyTorch, por lo que puede cargarse con la librería original de OpenAI CLIP. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cubert-gmbh/clip | ViT-L/14@336px (CLIP) | no disponible | no aplica | unknown | Mirror en Hugging Face |
| openai/clip-vit-large-patch14-336 | ViT-L/14@336px (CLIP) | no disponible | no aplica | no etiquetada | Hugging Face |
| openai/CLIP (repo original) | ViT-L/14@336px (CLIP) | no disponible | no aplica | MIT (repo) | GitHub |

Según la información, el modelo `cubert-gmbh/clip` es un espejo byte-idéntico del checkpoint servido por OpenAI, por lo que su comportamiento y arquitectura son equivalentes al de `openai/clip-vit-large-patch14-336`. No hay datos de parámetros ni de rendimiento en los repositorios comparados.

## Limitaciones y advertencias

- Licencia incierta: el repositorio etiqueta la licencia como `unknown`. Aunque el repositorio upstream de OpenAI CLIP es MIT, no hay una declaración explícita que cubra los pesos en este mirror. Esto puede suponer un riesgo legal para uso comercial.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de texto; sin embargo, los embeddings pueden producir asociaciones incorrectas en tareas de clasificación.
- Sesgos: no se proporciona información sobre sesgos. CLIP es conocido por heredar sesgos de los datos de entrenamiento, pero no hay datos concretos en este repositorio.
- Limitaciones de idioma: no se especifican los idiomas soportados; CLIP original está principalmente entrenado con texto en inglés, por lo que su rendimiento en otros idiomas puede ser inferior.
- Restricciones de producción: al ser un mirror sin fine-tuning, no se garantiza un rendimiento específico para dominios concretos. Además, la redistribución de los pesos puede ser rechazada por los titulares de derechos, como se indica en el README.
- Sin soporte de tool calling ni de generación: el modelo no es un LLM, por lo que no puede usarse para tareas de generación de texto, agentes o razonamiento multi-paso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cubert-gmbh/clip
- Organización Cubert GmbH en Hugging Face: https://huggingface.co/cubert-gmbh
- Repositorio original de OpenAI CLIP: https://github.com/openai/CLIP
- Sitio web de Cubert (soluciones hiperespectrales): https://cubert-hyperspectral.com/en/
- Repositorio Cuvis.AI: https://github.com/cubert-hyperspectral/cuvis-ai

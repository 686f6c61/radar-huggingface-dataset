# RunningHubAI/rh-momo-lora

## Resumen

rh-momo-lora es un adaptador LoRA (Low-Rank Adaptation) de edición de imágenes publicado por RunningHubAI, una plataforma de entrenamiento y despliegue de modelos generativos. El adaptador está afinado a partir de "krea2", un modelo base de generación y edición de imágenes, y su propósito es incorporar un personaje concreto (denominado "momo") en tareas de image-text-to-image dentro de ComfyUI. No se trata de un modelo de lenguaje, sino de un complemento de pesos que se carga junto al modelo base para condicionar la generación visual.

El repositorio contiene un único fichero de pesos, `m0m0_krea2_000002500.safetensors`, de 218 MiB, lo que es coherente con el tamaño típico de un LoRA de rango bajo aplicado a un modelo de difusión. La model card es extremadamente escueta: no documenta hiperparámetros de entrenamiento, composición del dataset, número de pasos, learning rate ni metodología de captura del personaje. El nombre del fichero sugiere 2.500 pasos de entrenamiento, pero este dato no se confirma explícitamente en la documentación.

La relevancia de esta ficha es limitada para desarrolladores e investigadores que evalúan modelos de lenguaje o de razonamiento: se trata de un artefacto de personalización visual orientado a un flujo de trabajo concreto (ComfyUI y la plataforma RunningHub). Su interés práctico reside en la integración con dichos entornos y en la reproducibilidad del personaje, no en capacidades cognitivas o de generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión "krea2"; no disponible el detalle de la arquitectura interna del base |
| Parámetros totales | no disponible (pesos LoRA de 218 MiB; el número de parámetros del adaptador no se documenta) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un LoRA de imagen; la ventana de contexto depende del modelo base y del pipeline) |
| Tipos de cuantización | no disponible; el fichero distribuido es safetensors sin cuantización declarada |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que se siga la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`m0m0_krea2_000002500.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es "krea2", sobre el que se ha realizado un fine-tuning orientado a un personaje concreto. La model card no especifica en qué capas se aplica el adaptador, el rango utilizado, el alpha de escalado ni la estrategia de entrenamiento (por ejemplo, si se congelaron las capas de atención o las de proyección de texto).

No se documenta el número de tokens o imágenes de entrenamiento, la composición del dataset, el uso de regularización, ni si hubo etapas de refinamiento con preferencias humanas. Tampoco se detalla la metodología de captura del personaje (número de imágenes de referencia, variedad de poses e iluminación, resolución de entrenamiento). El nombre del fichero sugiere un checkpoint en el paso 2.500, pero no se confirma si ese es el paso final ni si se comparó con checkpoints intermedios. En consecuencia, la reproducibilidad del entrenamiento no es posible con la información publicada.

## Capacidades

- Personalización de personaje: incorpora la identidad visual de "momo" en imágenes generadas o editadas mediante el pipeline image-text-to-image.
- Edición de imagen guiada por texto: al estar etiquetado como image-text-to-image, permite modificar una imagen de entrada siguiendo instrucciones textuales, condicionadas por el LoRA del personaje.
- Integración con ComfyUI: el adaptador está empaquetado para cargarse como nodo LoRA en flujos de ComfyUI.
- Compatibilidad con la plataforma RunningHub: se puede ejecutar en línea en la infraestructura del autor sin gestionar hardware propio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión analítica, audio ni modo "thinking"; estas capacidades no aplican a un LoRA de generación de imágenes.
- Capacidades multilingües: no disponibles; dependen del codificador de texto del modelo base "krea2".

## Casos de uso

- Generación de ilustraciones de personaje consistente: cargar el LoRA en ComfyUI junto al modelo base krea2 para producir variaciones del personaje "momo" manteniendo rasgos reconocibles en distintas poses y escenarios.
- Edición de imágenes existentes: usar el pipeline image-text-to-image para modificar una fotografía o ilustración de entrada (por ejemplo, cambiar el fondo o el vestuario) preservando la identidad del personaje.
- Prototipado rápido de narrativa visual: generar paneles secuenciales para cómics o storyboards donde el personaje debe mantenerse estable entre viñetas, reduciendo el trabajo manual de retoque.
- Creación de material para redes sociales: producir avatares, banners o ilustraciones promocionales con un personaje de marca coherente, usando la API de RunningHub para automatizar lotes.
- Pruebas de concepto en investigación sobre personalización: servir como ejemplo práctico de LoRA de personaje para estudiar la fidelidad de identidad frente a la flexibilidad compositiva del modelo base.
- Integración en pipelines de producción con ComfyUI: encadenar el LoRA con nodos de upscaling, segmentación o control de pose para flujos de generación de assets gráficos repetibles.
- Demostraciones y tutoriales: al estar disponible en Hugging Face y en RunningHub, permite reproducir ejemplos sin entrenar, útil para formación de equipos en generación de imágenes condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de fidelidad de personaje (por ejemplo, similitud facial, CLIP score o FID), ni comparaciones con otros LoRA de personaje, ni latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base "krea2" y de la resolución. El adaptador en sí ocupa 218 MiB en disco y un consumo adicional pequeño en VRAM al cargarse junto al base.
- GPU recomendadas: no disponibles en la documentación. Para modelos de difusión de imagen de tamaño habitual se suele requerir una GPU con al menos 8-16 GB de VRAM, pero este dato no se confirma para krea2.
- Compatibilidad con GPU de consumo: no confirmada. No se indica si cabe en RTX 3060, RTX 4090 u otras; depende del modelo base y de la cuantización aplicada a este.
- Opciones de despliegue: ComfyUI (flujo declarado), plataforma RunningHub (online y API). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un LoRA de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría. Cualquier comparación numérica requeriría benchmarks que el autor no ha publicado.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no detalla hiperparámetros, dataset, pasos de entrenamiento ni metodología, lo que impide reproducir el entrenamiento o auditar su calidad.
- Licencia no disponible: no se especifica una licencia explícita; la model card remite al proyecto original y mantiene el copyright con el autor. El uso comercial queda en un limbo legal hasta que se aclare.
- Dependencia del modelo base: el LoRA no funciona de forma autónoma; requiere "krea2" y su licencia, que tampoco se detalla en la información disponible.
- Riesgo de sobreajuste al personaje: al ser un LoRA de personaje, puede reducir la diversidad compositiva o imponer rasgos del personaje en contextos donde no se desean, especialmente con pesos altos.
- Sesgos: no documentados. Al no conocerse el dataset de entrenamiento, no se pueden evaluar sesgos de representación, género, etnia o estilo.
- Alucinación visual: como todo modelo generativo de imagen, puede producir detalles anatómicos o de vestuario inconsistentes; no hay métricas publicadas de fidelidad.
- Idiomas: no se especifica qué idiomas acepta el codificador de texto del modelo base; los prompts en castellano podrían no funcionar igual que en inglés.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Sin benchmarks: no hay evidencia cuantitativa de calidad frente a alternativas, por lo que su adopción en producción debería ir precedida de una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-momo-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112261534365110273
- Página del autor: https://www.runninghub.ai/user-center/2091234414880727041
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-momo-lora/blob/main/README_cn.md

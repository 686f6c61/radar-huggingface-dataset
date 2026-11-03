# RunningHubAI/rh-pizda-lora

## Resumen

`rh-pizda-lora` es un adaptador LoRA para edición de imágenes publicado por RunningHubAI en Hugging Face. El repositorio contiene un único fichero de pesos (`Pizda.safetensors`, 218 MiB) que se carga sobre un modelo base identificado en la model card como `krea2`. La etiqueta de pipeline es `image-text-to-image`, y el adaptador está pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o en Hugging Face.

Se trata de un artefacto muy ligero (0,2 GB de repositorio) y de alcance limitado: no es un modelo fundacional, sino un ajuste fino de bajo rango sobre un modelo de difusión existente. La model card es extremadamente escueta y no documenta arquitectura del base, número de pasos de entrenamiento, composición del dataset ni parámetros de entrenamiento. La única palabra de activación documentada es `Pizda`.

Su relevancia es, por tanto, acotada: sirve como ejemplo de adaptador de estilo o concepto entrenado y distribuido a través de la infraestructura de RunningHub (que ofrece entrenamiento y despliegue como servicio), y como pieza reutilizable dentro de flujos de ComfyUI. No hay métricas, benchmarks ni documentación técnica publicada que permitan evaluarlo frente a alternativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del base no disponible |
| Parámetros totales | no disponible (pesos del adaptador: 218 MiB en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible (safetensors, presumiblemente fp16/bf16; no confirmado) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base) |
| Licencia | no disponible explícitamente; la model card remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`Pizda.safetensors`) |
| Palabra de activación | `Pizda` |
| Plataformas de ejecución | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es `krea2`, del que la información disponible no detalla arquitectura, número de parámetros ni variante (diffusion transformer, U-Net, etc.). El pipeline declarado (`image-text-to-image`) indica que el sistema completo acepta una imagen de entrada y un prompt de texto para producir una imagen editada.

No se publica información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del LoRA, el optimizador ni si se aplicaron técnicas como regularización por clase o captions automáticos. Tampoco se documenta si el adaptador modifica solo el bloque de atención cruzada, los módulos de proyección de texto o capas convolucionales. Cualquier afirmación sobre su comportamiento interno sería especulativa.

## Capacidades

- Edición de imágenes guiada por texto: el pipeline `image-text-to-image` sugiere que el adaptador opera sobre una imagen de partida más una instrucción textual.
- Inyección de un concepto o estilo concreto, activado mediante la palabra clave `Pizda` en el prompt.
- Integración con ComfyUI como nodo LoRA sobre el modelo base `krea2`.
- Ejecución en la plataforma RunningHub, incluyendo su API (existe documentación de API enlazada desde la model card).
- Compatibilidad con Hugging Face como repositorio de pesos.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de alto nivel, audio ni modo "thinking": son capacidades no aplicables a un adaptador de imagen.

## Casos de uso

- Pruebas de concepto en ComfyUI: cargar el LoRA sobre `krea2` y verificar que la palabra de activación `Pizda` produce el efecto esperado antes de integrarlo en un flujo mayor.
- Prototipado de pipelines de edición de imagen: usar el adaptador como capa de personalización en un grafo de ComfyUI que ya incluya preprocesado, muestreo y postprocesado.
- Experimentación con la API de RunningHub: desplegar el adaptador mediante la API documentada para comparar latencia y resultados frente a la ejecución local.
- Evaluación comparativa de adaptadores LoRA: al ser un fichero de 218 MiB, es barato de descargar y probar junto a otros LoRA del mismo base para medir fidelidad al concepto.
- Docencia y demostraciones: ilustrar cómo funciona un LoRA de edición de imagen en talleres sobre difusión, dado su tamaño reducido y su carga sencilla.
- Archivado y reproducibilidad: conservar el peso exacto junto al identificador del base `krea2` para reproducir resultados en el futuro, teniendo en cuenta que la licencia no está clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador pesa 218 MiB, pero el consumo real lo determina el modelo base `krea2`, cuyas especificaciones no se documentan.
- GPU recomendadas: no disponible. Depende enteramente del base; sin conocer su tamaño no es posible recomendar A100, H100, RTX 4090 u otras.
- ¿Cabe en GPU de consumo? No se puede determinar con la información disponible. El adaptador en sí es trivial en memoria; el base es el factor limitante.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (cloud y API), Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye adaptadores LoRA comparables, ni especificaciones del base `krea2`, ni métricas que permitan establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla dataset, hiperparámetros, rango del LoRA ni arquitectura del base, lo que impide evaluar su calidad de forma objetiva.
- Licencia ambigua: se indica que se sigue "la licencia del proyecto original o del upstream", sin especificar cuál es. Antes de un uso comercial es imprescindible verificar la licencia de `krea2` y del propio adaptador.
- Dependencia total del modelo base: sin `krea2` el adaptador no es funcional; cualquier cambio o retirada del base deja el LoRA inutilizable.
- Riesgo de sobreajuste y sesgos: al no publicarse el dataset, no se puede descartar que el adaptador reproduzca sesgos, estilos o contenidos presentes en los datos de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir resultados no solicitados o inconsistentes con la imagen de entrada, especialmente con prompts fuera de distribución.
- Sin métricas de rendimiento ni validación publicada: no hay evidencia de calidad más allá de la demostración en la plataforma del autor.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay señal de uso comunitario ni de validación externa.
- Palabra de activación genérica y potencialmente problemática: conviene revisar el contenido que genera antes de integrarlo en productos dirigidos a audiencias amplias.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-pizda-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2117659061882171393
- Página del autor: https://www.runninghub.ai/user-center/2117650802696626177
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-pizda-lora/blob/main/README_cn.md

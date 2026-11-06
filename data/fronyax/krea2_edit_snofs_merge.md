# Fronyax/KREA2_Edit_SNOFS_Merge

## Resumen

KREA2_Edit_SNOFS_Merge es un merge no oficial de pesos publicado por el usuario Fronyax en Hugging Face. Combina tres componentes: el modelo base Krea 2 de Krea AI, la adaptación Krea 2 Identity Edit v1.2 de conradlocke y el LoKr SNOFS v1.4 de Ashen. El resultado es un modelo de difusión orientado a edición de imágenes por identidad, con ambas adaptaciones integradas en los pesos, de modo que no es necesario cargar los LoRA por separado.

El repositorio contiene 12.820.073.036 parámetros en formato safetensors y ocupa 106,7 GB, lo que sitúa al modelo en la franja de los modelos de difusión de gran tamaño. Se distribuye principalmente en variantes GGUF, además de versiones BF16, INT8 e INT4 según indica la model card, y requiere el nodo ComfyUI-Krea2Edit porque la adaptación de edición se entrenó con condicionamiento dual (tokens VAE en contexto más codificación Qwen3-VL anclada a imagen), algo que los nodos estándar de ComfyUI no proporcionan.

La relevancia del modelo es acotada pero concreta: ofrece un pipeline de edición de identidad listo para usar en ComfyUI sin necesidad de gestionar LoRAs externos. No obstante, el autor advierte de que la versión v1.2 del LoRA de identidad funciona mejor que la v2, que sigue siendo inconsistente, y de que el modelo no está disponible en Civitai por problemas de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (base Krea 2) con adaptación de edición por identidad; detalles de arquitectura no disponibles |
| Parametros totales | 12.820.073.036 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes), BF16, INT8, INT4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Krea 2 más allá de que se trata de un modelo de difusión para generación y edición de imágenes. El merge incorpora dos adaptaciones: Krea 2 Identity Edit v1.2 de conradlocke, orientada a preservar la identidad del sujeto en tareas de edición, y SNOFS v1.4 LoKr de Ashen, un adaptador de bajo rango en formato LoKr. Ambas están integradas directamente en los pesos, por lo que el merge sustituye la carga de LoRAs separados.

El dato técnico más relevante es que la adaptación de edición se entrenó con condicionamiento dual: tokens VAE en contexto combinados con codificación de imagen mediante Qwen3-VL. Este esquema exige nodos específicos en ComfyUI, concretamente el paquete ComfyUI-Krea2Edit, ya que los nodos nativos no implementan ese tipo de condicionamiento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Edición de imágenes con preservación de identidad: el merge está diseñado específicamente para modificar imágenes manteniendo los rasgos del sujeto original.
- Integración de adaptaciones de identidad y estilo en un único checkpoint, sin necesidad de cargar LoRAs por separado.
- Compatibilidad con cuantizaciones GGUF, BF16, INT8 e INT4, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.
- Ejecución en ComfyUI mediante el nodo ComfyUI-Krea2Edit para las variantes GGUF (con ComfyUI-GGUF) y el nodo nativo Load Diffusion Model para BF16, INT8 e INT4.
- Soporte de condicionamiento dual basado en tokens VAE en contexto y codificación Qwen3-VL anclada a imagen.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al tratarse de un modelo de difusión y no de un modelo de lenguaje.

## Casos de uso

- Edición de retratos con preservación de identidad: el modelo permite modificar atributos de una fotografía de persona (ropa, fondo, iluminación) manteniendo el parecido facial gracias a la adaptación Identity Edit integrada.
- Flujos de trabajo en ComfyUI para estudio fotográfico: con el nodo ComfyUI-Krea2Edit se puede montar un pipeline de edición por lotes que aplique cambios controlados sobre un conjunto de imágenes de un mismo sujeto.
- Prototipado de variaciones de producto: a partir de una imagen base de un objeto o modelo, generar versiones con distintos acabados o entornos sin perder la identidad visual del original.
- Sustitución de LoRAs en producción: al estar las adaptaciones integradas en los pesos, se simplifica el despliegue y se elimina la gestión de múltiples archivos LoRA en entornos ComfyUI.
- Despliegue en hardware con memoria limitada: las variantes GGUF e INT4 permiten ejecutar el modelo en GPUs de consumo, aunque el tamaño de 12.800 millones de parámetros exige cuantizaciones agresivas para encajar en VRAM reducida.
- Experimentación en investigación sobre edición de identidad: el condicionamiento dual con Qwen3-VL y tokens VAE en contexto sirve como referencia para estudiar técnicas de anclaje de identidad en modelos de difusión.
- Generación de material gráfico con estilo consistente: la integración del LoKr SNOFS v1.4 permite aplicar un estilo concreto de forma estable sin cargar adaptadores adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 12.800 millones de parámetros en BF16 requiere del orden de 25 GB solo para los pesos, a lo que hay que sumar la memoria del pipeline de difusión (VAE, codificador de texto Qwen3-VL y buffers de atención).
- En INT8 la estimación ronda los 13 GB de pesos; en INT4, alrededor de 7 GB, aunque el consumo real del pipeline completo será superior.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las variantes BF16 encajan en A100 de 40/80 GB y H100; las variantes INT8 e INT4 podrían ejecutarse en RTX 4090 (24 GB) y, con cuantizaciones más agresivas, en GPUs de 16 GB.
- Despliegue: ComfyUI con el nodo ComfyUI-Krea2Edit es obligatorio; para GGUF se requiere además ComfyUI-GGUF. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El autor señala que la versión v2 del LoRA de identidad es inconsistente y que la v1.2 integrada en este merge ofrece mejores resultados sin ajustes; los resultados pueden variar según la configuración.
- Es una modificación no oficial de la comunidad, no afiliada ni respaldada por Krea AI.
- Requiere nodos personalizados de ComfyUI; los nodos estándar no soportan el condicionamiento dual con el que se entrenó la adaptación de edición.
- El modelo no está disponible en Civitai por problemas de moderación, sin fecha estimada de publicación.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido, lo que supone un riesgo para producción.
- No se dispone de información sobre sesgos, tasas de alucinación visual, idiomas soportados ni limitaciones de contexto.
- El tamaño del repositorio (106,7 GB) implica un coste de almacenamiento y descarga considerable.
- Al ser un merge de pesos de terceros, la trazabilidad de los datos de entrenamiento y de los derechos sobre las imágenes originales no está documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Fronyax/KREA2_Edit_SNOFS_Merge
- ComfyUI-Krea2Edit: https://github.com/lbouaraba/comfyui-krea2edit
- ComfyUI-GGUF: https://github.com/molbal/ComfyUI-GGUF
- Krea AI (modelo base): no disponible en la información proporcionada
- Krea 2 Identity Edit de conradlocke: no disponible en la información proporcionada
- SNOFS v1.4 LoKr de Ashen: no disponible en la información proporcionada

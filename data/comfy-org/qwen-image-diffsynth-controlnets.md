# Comfy-Org/Qwen-Image-DiffSynth-ControlNets

## Resumen

Este repositorio contiene un conjunto de archivos de modelo reempaquetados para su uso directo en ComfyUI. Se trata de tres ControlNets (canny, depth e inpaint) y un LoRA (union) derivados del proyecto DiffSynth, adaptados para el modelo de generación de imágenes Qwen-Image. El paquete está publicado por Comfy-Org, la organización responsable de ComfyUI, lo que garantiza compatibilidad con el ecosistema de nodos de esta herramienta.

La relevancia de este paquete radica en que simplifica la instalación de estos adaptadores: el usuario solo tiene que copiar los archivos en las carpetas correspondientes de ComfyUI. No se proporciona información sobre la arquitectura interna, el número de parámetros o el pipeline de difusión original, ya que se trata de una redistribución de pesos, no de un modelo completo. La licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptadores ControlNet y LoRA para Qwen-Image) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (archivos safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de estos ControlNets o del LoRA. El nombre "DiffSynth" sugiere que provienen del framework DiffSynth-Studio, pero no se detallan los datos de entrenamiento, el número de tokens o el proceso de optimización. Tampoco se indica si se usó RLHF, DPO u otras técnicas. Al ser un reempaquetado, la documentación técnica original no se incluye en este repositorio.

## Capacidades

- Control de generación de imágenes mediante mapas de bordes (Canny).
- Control de generación mediante mapas de profundidad (Depth).
- Inpainting (relleno de regiones enmascaradas).
- LoRA de "unión" (union) que probablemente combina múltiples condiciones de control, aunque no se especifica su funcionamiento exacto.
- Integración nativa con ComfyUI: los archivos están preparados para colocarse en las carpetas `models/loras` y `models/model_patches`.
- No se indican capacidades de texto, razonamiento, tool calling o agentes, ya que es un modelo de difusión de imágenes.

## Casos de uso

- Edición de imágenes con control de bordes: usar el ControlNet Canny para generar imágenes que respeten los contornos de un boceto o de una imagen existente. En ComfyUI, se conecta el nodo ControlNet al sampler y se proporciona la imagen de entrada.
- Generación con control de profundidad: emplear el ControlNet Depth para mantener la estructura espacial de una escena, útil en tareas de reiluminación o cambio de estilo manteniendo la geometría.
- Inpainting de regiones específicas: usar el ControlNet Inpaint para rellenar zonas enmascaradas de una imagen, por ejemplo para eliminar objetos no deseados o restaurar partes dañadas.
- Composición de múltiples condiciones: el LoRA union podría permitir combinar varios tipos de control en una sola pasada, aunque su uso exacto requiere experimentación en ComfyUI.
- Prototipado rápido de flujos de generación: al ser archivos listos para ComfyUI, los desarrolladores pueden integrarlos en pipelines visuales sin escribir código.
- Investigación en control fino de difusión: los adaptadores permiten estudiar el efecto de diferentes señales de control sobre el modelo base Qwen-Image, aunque no se dispone de documentación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información proporcionada.
- Al ser ControlNets y LoRA, el consumo adicional de memoria es relativamente bajo en comparación con el modelo base Qwen-Image, pero se necesita una GPU con suficiente VRAM para ejecutar el modelo de difusión completo.
- Para orientación general: modelos de difusión de imágenes de tamaño similar suelen requerir al menos 8-12 GB de VRAM en cuantización FP16, y más si se usa precisión completa.
- El despliegue se realiza a través de ComfyUI, que gestiona la carga de los archivos. No se mencionan alternativas como vLLM u Ollama, ya que no es un modelo de lenguaje.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se proporciona información sobre otros ControlNets o LoRA comparables en este repositorio.

## Limitaciones y advertencias

- Falta de documentación técnica: al ser un reempaquetado, no se incluyen detalles sobre el entrenamiento, arquitectura o limitaciones específicas de estos adaptadores.
- Dependencia de ComfyUI: los archivos están diseñados para funcionar dentro de ComfyUI; su uso fuera de este entorno requeriría adaptaciones manuales.
- Posible incompatibilidad con versiones futuras de Qwen-Image o de ComfyUI, ya que no se especifica la versión exacta del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen-Image si se utiliza en producción.
- No se garantiza la ausencia de sesgos o alucinaciones visuales, ya que no hay información sobre los datos de entrenamiento.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Comfy-Org/Qwen-Image-DiffSynth-ControlNets

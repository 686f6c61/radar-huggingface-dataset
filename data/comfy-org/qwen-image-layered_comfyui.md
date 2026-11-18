# Comfy-Org/Qwen-Image-Layered_ComfyUI

## Resumen

Qwen-Image-Layered es un modelo de difusion para descomposición de imágenes en capas, desarrollado originalmente por el equipo Qwen de Alibaba y empaquetado para ComfyUI por Comfy-Org. El repositorio `Comfy-Org/Qwen-Image-Layered_ComfyUI` no contiene pesos entrenados desde cero, sino una redistribución de los ficheros del modelo base `Qwen/Qwen-Image-Layered` en formatos listos para cargar en los nodos de ComfyUI (un checkpoint de difusión en bf16 y otro en fp8 mixto, más un VAE independiente).

La relevancia de esta ficha radica en que el paquete resuelve el problema práctico de integrar un modelo de capas en un pipeline de ComfyUI sin tener que convertir pesos ni reconstruir el grafo. El modelo base es un modelo de difusión de imagen (no un LLM), por lo que las especificaciones de parámetros, contexto y cuantización que se piden en esta plantilla no aplican de forma directa: la información disponible en la model card y en la búsqueda web es mínima y se limita al empaquetado, la estructura de carpetas y un workflow de ejemplo.

Con 122.065 descargas y 70 likes en el momento de la consulta, el repositorio tiene un uso considerable, aunque la documentación técnica publicada es escasa. Todo lo que no aparezca explícitamente en la información proporcionada se marca como "no disponible" en lugar de inferirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión (diffusion-single-file); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de imagen) |
| Tipos de cuantización | bf16 y fp8 mixto (ficheros `qwen_image_layered_bf16.safetensors` y `qwen_image_layered_fp8mixed.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de difusión + VAE separado) |

Otros datos del repositorio: tamaño de 61,6 GB, librería `diffusion-single-file`, modelo base `Qwen/Qwen-Image-Layered` (finetune), creado el 2025-12-19 y actualizado el 2026-09-23.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La etiqueta `diffusion-single-file` indica que el paquete distribuye el modelo de difusión como un único fichero de pesos, y la presencia de un VAE independiente (`qwen_image_layered_vae.safetensors`) confirma que se trata de un modelo de difusión latente con codificador/decodificador de imágenes separado. No constan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineación.

El repositorio de Comfy-Org no documenta ningún proceso de entrenamiento propio: es un reempaquetado de los pesos de `Qwen/Qwen-Image-Layered` en los formatos que esperan los nodos de ComfyUI. Cualquier innovación técnica (mecanismo de atención, esquema de capas, destilación) correspondería al modelo original y no está descrita en la información disponible.

## Capacidades

- Descomposición de imágenes en capas: el workflow publicado se denomina "Layer Decomposition: Qwen-Image-Layered", lo que indica que la tarea principal es separar una imagen de entrada en capas editables.
- Generación de imágenes por difusión: el paquete incluye un checkpoint de difusión completo y un VAE, necesarios para el proceso de generación.
- Integración nativa con ComfyUI: los ficheros están preparados para colocarse en `models/diffusion_models/` y `models/vae/` y cargarse mediante los nodos estándar.
- Soporte de dos precisiones: bf16 para máxima calidad y fp8 mixto para reducir requisitos de memoria.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; la única capacidad documentada es la generación y descomposición de imágenes.

## Casos de uso

- Edición por capas en flujos de diseño gráfico: descomponer una imagen en capas permite a un diseñador modificar elementos por separado (fondo, objetos, texto) sin regenerar la imagen completa; el workflow de ComfyUI ya publicado cubre este escenario.
- Rotoscopia y postproducción de vídeo: separar sujetos y fondos en capas facilita la aplicación de máscaras y efectos en herramientas de composición, reutilizando la salida del modelo como entrada de un pipeline de VFX.
- Generación de assets para videojuegos: obtener capas independientes (personaje, entorno, decorados) acelera la producción de sprites y fondos reutilizables en motores 2D.
- Automatización de pipelines de imagen en ComfyUI: al ser un single-file con VAE separado, se puede insertar en grafos existentes mediante los nodos de carga de checkpoint y VAE, encadenando la descomposición con otros nodos de posprocesado.
- Prototipado rápido en estaciones con GPU de consumo: la variante fp8 mixto reduce el uso de VRAM frente a bf16, lo que permite probar el modelo en GPUs de gama alta para consumidores antes de escalar a producción.
- Investigación en modelos de difusión: el repositorio sirve como punto de partida reproducible para comparar la descomposición en capas con otras técnicas, gracias a la licencia Apache 2.0 y a los pesos en safetensors.
- Docencia y demostraciones: el workflow de ejemplo enlazado en la model card permite mostrar el funcionamiento de un modelo de difusión por capas sin configuración adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio pesa 61,6 GB e incluye dos variantes del checkpoint (bf16 y fp8 mixto) más el VAE; la variante fp8 mixto está pensada para reducir el consumo de memoria, pero no se publican cifras concretas.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; la existencia de una variante fp8 mixto sugiere que el objetivo incluye GPUs de gama alta para consumidores, pero no se confirma ningún modelo concreto.
- Opciones de despliegue: ComfyUI (nativo, con los ficheros en `models/diffusion_models/` y `models/vae/`), Comfy Cloud (ejecución online sin instalación local) y cualquier runtime capaz de cargar safetensors de difusión con VAE separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de descomposición de imágenes en capas ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Documentación técnica muy escasa: la model card solo describe la instalación de ficheros y un workflow; no hay información sobre arquitectura, datos de entrenamiento ni evaluación.
- Es un reempaquetado, no un modelo original: cualquier problema de calidad, sesgo o limitación proviene del modelo base `Qwen/Qwen-Image-Layered`, cuyas condiciones deben consultarse en su repositorio.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en el sentido de un LLM, pero no hay datos sobre fidelidad de la descomposición ni artefactos de generación.
- Limitaciones de contexto o idioma: no disponibles; al ser un modelo de imagen, la noción de contexto textual no aplica directamente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda verificar las condiciones del modelo base y de los componentes de terceros incluidos en el VAE.
- Tamaño del repositorio elevado (61,6 GB): requiere espacio en disco y ancho de banda considerables para la descarga.
- Fecha de actualización futura (2026-09-23): conviene comprobar si los ficheros han cambiado respecto a la versión evaluada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Qwen-Image-Layered_ComfyUI
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-Layered
- Workflow de descomposición en capas: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_layered.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Comfy Cloud: https://cloud.comfy.org/
- Comunidad francófona de ComfyUI: https://comfyui.fr/

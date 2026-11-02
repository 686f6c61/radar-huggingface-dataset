# RunningHubAI/rh-f1-unet

## Resumen

rh-f1-unet es un modelo de difusión en formato UNet publicado por RunningHubAI en Hugging Face, etiquetado para la tarea de text-to-video y diseñado para ejecutarse dentro de ComfyUI o en la plataforma RunningHub. El repositorio contiene un único archivo de pesos en safetensors de aproximadamente 22,7 GiB (23,8 GB de repositorio), lo que indica un UNet de gran tamaño orientado a generación y ampliación de vídeo. La model card lo describe como un ajuste fino (finetune) a partir de una base denominada "F1基础 D" y su propósito declarado es "万物放大" (ampliación universal), es decir, upscaling y eliminación de ruido sobre vídeo generado.

La información pública disponible es muy escasa: no se detallan parámetros totales, longitud de contexto, idiomas, licencia explícita ni datos de entrenamiento. El modelo se distribuye principalmente como un artefacto para el ecosistema ComfyUI, con integración en la plataforma comercial RunningHub, que ofrece API y entrenamiento en la nube. Es relevante ahora para usuarios de pipelines de vídeo generativo que buscan un UNet de upscaling de alta resolución dentro de ComfyUI, aunque su evaluación técnica independiente queda limitada por la falta de documentación.

Al tratarse de un componente de difusión para vídeo y no de un modelo de lenguaje, muchas de las métricas habituales (MMLU, HumanEval, tool calling) no aplican directamente; esta ficha las marca como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión (text-to-video), integrado en ComfyUI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje; depende de la longitud de vídeo y resolución en ComfyUI) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors de precisión nativa (tamaño de archivo 22.700 MiB) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del pipeline) |
| Licencia | no disponible explícitamente; la model card indica "Follow the original project or upstream license" |
| Formato de pesos | safetensors (`F14步超清放大去噪点.safetensors`) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un UNet para text-to-video, ajustado a partir de una base llamada "F1基础 D". No se especifican detalles sobre el número de parámetros, la profundidad del UNet, el tipo de atención (espacial, temporal o ambas), ni la resolución nativa de entrenamiento. El nombre del archivo ("F14步超清放大去噪点") sugiere un ajuste orientado a upscaling de alta definición y eliminación de ruido en 14 pasos, pero esto es una inferencia a partir del nombre y no un dato confirmado en la documentación.

No hay información publicada sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en modelos de difusión) ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta si el ajuste fino se realizó sobre vídeo, imágenes o ambos, ni el procedimiento exacto seguido en RunningHub para producirlo.

## Capacidades

- Generación y ampliación de vídeo en pipelines de text-to-video dentro de ComfyUI.
- Upscaling de alta definición y reducción de ruido en secuencias de vídeo, según el propósito declarado ("万物放大", ampliación universal).
- Integración como nodo UNet en flujos de ComfyUI, combinable con otros componentes (VAE, codificadores de texto, samplers).
- Ejecución en la plataforma RunningHub, que ofrece API y despliegue en la nube.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües: no disponibles; dependen del codificador de texto que se empareje en el pipeline, no del UNet en sí.

## Casos de uso

- Upscaling de vídeo generado en ComfyUI: cargar el UNet en un flujo de text-to-video para ampliar la resolución de clips existentes y reducir artefactos, aprovechando el ajuste específico para "ampliación universal".
- Limpieza de ruido en secuencias: aplicar el modelo como etapa de refinado sobre vídeo con ruido o compresión, dado su enfoque declarado en "去噪点" (eliminación de ruido).
- Producción de contenido para redes sociales: generar clips en alta definición a partir de prompts de texto dentro de un pipeline ComfyUI, con el UNet como componente de generación/refinado.
- Prototipado rápido en RunningHub: usar la API de la plataforma para probar el modelo sin infraestructura local, útil para evaluar su comportamiento antes de desplegarlo.
- Integración en pipelines de posproducción: encadenar el UNet con otros nodos de ComfyUI (por ejemplo, interpolación de fotogramas o corrección de color) para flujos de vídeo automatizados.
- Investigación en difusión para vídeo: servir como punto de partida para experimentos de finetuning adicional, dado que RunningHub ofrece entrenamiento en su plataforma.
- Demostraciones y pruebas de concepto: al estar pensado para ComfyUI, permite montar demos interactivas de text-to-video con relativamente poco código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un UNet en safetensors de 22,7 GiB requiere al menos ~23 GB solo para los pesos en precisión nativa; con overhead de activaciones y el resto del pipeline (VAE, codificador de texto) es probable que se necesiten GPUs de 40-80 GB para ejecución cómoda, aunque esto no está confirmado por el autor.
- GPU recomendadas: no disponibles oficialmente; por tamaño de pesos, GPUs de clase A100 (40/80 GB) o H100 son las candidatas naturales. No se confirma soporte en RTX 4090 (24 GB) en precisión nativa.
- ¿Cabe en GPU consumer? No confirmado. En RTX 4090 (24 GB) los pesos apenas caben y probablemente requieran cuantización u offloading, opciones no documentadas por el autor.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub (nube y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un UNet de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con otros UNets de text-to-video (por ejemplo, variantes de Stable Video Diffusion u otros UNets para ComfyUI).

## Limitaciones y advertencias

- Documentación muy escasa: no se especifican parámetros, resolución nativa, datos de entrenamiento ni procedimiento de ajuste, lo que dificulta evaluar su calidad de forma independiente.
- Licencia ambigua: la model card remite a "the original project or upstream license" sin concretar; no se puede confirmar el uso comercial sin verificar la licencia de la base "F1基础 D".
- Riesgo de sesgos y alucinaciones visuales: no documentado; como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no deseado.
- Dependencia del ecosistema ComfyUI/RunningHub: el uso previsto está ligado a estas plataformas, lo que puede limitar la portabilidad a otros frameworks.
- Requisitos de hardware elevados: el tamaño de pesos (22,7 GiB) implica GPUs de gama alta o servicios en la nube.
- Idiomas: no documentados; la calidad con prompts en castellano depende del codificador de texto emparejado, no del UNet.
- Sin métricas publicadas: no hay benchmarks que permitan comparar su rendimiento con alternativas.
- Fecha de creación futura en los metadatos (2026-11-02): conviene verificar la vigencia y el estado del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-f1-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2117148333188935682
- Página del autor: https://www.runninghub.cn/user-center/1937053129391181826
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-f1-unet/blob/main/README_cn.md

# Comfy-Org/sigclip_vision_384

## Resumen

SigCLIP Vision 384 es un reempaquetado del codificador de visión SigLIP (patch size 14, resolución 384) publicado por Comfy-Org para su uso directo en ComfyUI. Se distribuye como un único archivo safetensors de 0,9 GB que debe colocarse en el directorio `models/clip_vision` de ComfyUI. El modelo se emplea como codificador de visión en el flujo de trabajo Flux Redux, que permite transformaciones de imagen basadas en referencia visual dentro del ecosistema de ComfyUI.

El modelo resuelve el problema de integrar un codificador de visión compatible con el pipeline de difusión de Flux sin necesidad de conversiones manuales ni de gestionar múltiples ficheros. Su relevancia actual radica en que es el componente de visión recomendado por el propio proyecto ComfyUI en el ejemplo oficial de Flux Redux, lo que lo convierte en una pieza estándar para tareas de edición e interpolación de imágenes en ese entorno. No se aporta información sobre licencia, idiomas ni pipeline de entrenamiento en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) con patch size 14 y resolución de entrada 384x384, según el nombre del archivo `sigclip_vision_patch14_384` |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de visión, sin ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (archivo `sigclip_vision_patch14_384.safetensors`) |

## Arquitectura y entrenamiento

El nombre del archivo indica una arquitectura Vision Transformer con patch size 14 y resolución de entrada de 384x384 píxeles. Se trata de un reempaquetado del codificador de visión SigLIP realizado por Comfy-Org, sin modificaciones documentadas sobre los pesos originales. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el proceso de alineación con texto.

La novedad técnica principal de este repositorio no está en el modelo en sí, sino en su distribución: un único archivo safetensors listo para ser cargado por ComfyUI en la carpeta `models/clip_vision`, eliminando la necesidad de conversiones o de gestionar múltiples ficheros. No se documentan innovaciones técnicas adicionales en la model card.

## Capacidades

- Codificación de imágenes para modelos de difusión: actúa como encoder de visión en el pipeline de Flux Redux.
- Transformación de imagen basada en referencia: permite usar una imagen de entrada como guía visual para edición o interpolación.
- Integración nativa con ComfyUI: el archivo se coloca directamente en `models/clip_vision` y se carga sin configuración adicional.
- Compatibilidad con el ejemplo oficial Flux Redux de ComfyUI, documentado en la guía de ejemplos del proyecto.
- No se documentan capacidades de texto, tool calling, agentes ni razonamiento multi-step, al tratarse de un modelo puramente visual.

## Casos de uso

- Edición de imágenes con Flux Redux en ComfyUI: el modelo se usa como codificador de visión para que Flux Redux transforme una imagen de entrada siguiendo instrucciones visuales. Es el caso de uso documentado en el ejemplo oficial.
- Interpolación entre imágenes: al codificar dos imágenes de referencia, el pipeline puede generar transiciones visuales coherentes entre ellas.
- Re-estilización de imágenes: la referencia visual codificada permite aplicar un estilo o composición de una imagen origen a una nueva generación.
- Workflows de diseño generativo: integración en nodos personalizados de ComfyUI que requieran un encoder de visión compatible con Flux.
- Experimentación con control de composición: usar la salida del encoder para condicionar la generación en términos de estructura y contenido visual.
- Prototipado de pipelines de imagen-a-imagen: al ser un componente estándar en ComfyUI, sirve como base para desarrollar flujos de transformación visual sin escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 0,9 GB (archivo safetensors).
- VRAM estimada: no disponible. Al tratarse de un encoder de visión de tamaño medio, es razonable esperar que quepa en GPUs de consumo habitual (8-12 GB) dentro de ComfyUI, pero no se documenta un valor confirmado.
- GPU recomendadas: no disponible.
- Opciones de despliegue: ComfyUI, colocando el archivo en `models/clip_vision`. No se documentan otros runtimes como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comfy-Org/sigclip_vision_384 | ViT patch14 | 384x384 | no disponible | no disponible | HuggingFace, safetensors |
| OpenAI CLIP ViT-L/14 | ViT patch14 | 224x224 | no disponible | MIT (conocimiento general) | HuggingFace, safetensors |
| Google SigLIP (original) | ViT | 384x384 | no disponible | Apache 2.0 (conocimiento general) | HuggingFace |

Nota: los datos de OpenAI CLIP y SigLIP original provienen de conocimiento general y no de la información proporcionada en este repositorio. No se incluyen datos de rendimiento de ninguno de los modelos por no estar disponibles en la información suministrada.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, lo que impide confirmar si el uso comercial está permitido. Hay que verificar la licencia del modelo SigLIP original antes de usarlo en producción.
- Es un reempaquetado: Comfy-Org no es el autor original del modelo; los pesos provienen del proyecto SigLIP y este repositorio solo los redistribuye para ComfyUI.
- Sin documentación de entrenamiento: no se aportan datos sobre dataset, alineación ni proceso de entrenamiento.
- Uso limitado a visión: es un encoder de visión, no un modelo de generación de texto; no sirve para tareas de lenguaje ni razonamiento simbólico.
- Dependencia del ecosistema ComfyUI: la estructura de carpetas y el formato están pensados para ComfyUI; su uso fuera de este entorno requeriría adaptación manual.
- Riesgo de alucinación visual: al ser un encoder de visión sin documentación de evaluación, no se puede descartar que produzca representaciones inexactas en dominios visuales poco representados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/sigclip_vision_384
- Ejemplo Flux Redux de ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/flux/#redux

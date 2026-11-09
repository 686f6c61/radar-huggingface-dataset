# AI-KSK/ksk-video-252-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-252-comfyui-workflows` no es un modelo de pesos en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI que orquestan el decodificador de difusión de píxeles PiD junto con cuatro modelos base de generación de imágenes: FLUX.1 Dev, FLUX.2 Dev, SD3.5 Large y Z Image Turbo. El objetivo declarado por el autor es generar una imagen latente de aproximadamente 1 megapíxel y decodificarla directamente a 2K/4K sin necesidad de un upscaler separado, aprovechando un factor de decodificación de aproximadamente 16x.

El repositorio lo publica el usuario AI-KSK y su relevancia es práctica: documenta una cadena de nodos personalizados (`PiDPrepare`, `PiDSample`, `PiDFinalizex`, `PiDKSamplerCapture`) integrada en cuatro grafos ComfyUI listos para importar. No contiene pesos de modelo, sino la configuración de nodos, parámetros de muestreo y ajustes de decodificación necesarios para reproducir el pipeline en ComfyUI.

El tamaño del repositorio es de 0,0 GB, lo que confirma que se trata exclusivamente de material de configuración y tutorial. El autor advierte explícitamente de que el consumo de VRAM es elevado y recomienda instancias alquiladas de 48 GB, señalando que incluso con esa cantidad puede producirse OOM en ejecución local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de workflows ComfyUI); usa decodificador de difusión de píxeles PiD sobre modelos base FLUX.1 Dev, FLUX.2 Dev, SD3.5 Large y Z Image Turbo |
| Parametros totales | No disponible (no contiene pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | other (sin especificar terminos) |
| Formato de pesos | No disponible (el repositorio contiene grafos/workflows, no pesos) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia ni incluye proceso de entrenamiento. Lo que distribuye es una cadena de nodos personalizados para ComfyUI que implementa el decodificador de difusión de píxeles PiD: `PiDPrepare` prepara la latente de entrada, `PiDSample` ejecuta el muestreo de difusión, `PiDFinalizex` cierra el proceso y `PiDKSamplerCapture` captura el resultado del sampler. Esta cadena se inserta en cuatro grafos basados en modelos de difusión distintos.

Los parámetros de muestreo documentados por el autor son: FLUX.1 Dev con 28 pasos y CFG 1; FLUX.2 Dev con 50 pasos y CFG 4; SD3.5 Large con 25 pasos y CFG 4,4; y Z Image Turbo con 9 pasos y CFG 1. El factor de decodificación es de aproximadamente 16x, de modo que una primera pasada a 1 MP produce una salida cercana a 4K. El autor indica que la señal sigma de PiD debe conectarse directamente salvo que se necesite control manual de sigma.

## Capacidades

- Generación de imágenes de alta resolución (2K/4K) a partir de una latente de aproximadamente 1 MP, sin upscaler externo.
- Integración con cuatro modelos base de difusión: FLUX.1 Dev, FLUX.2 Dev, SD3.5 Large y Z Image Turbo.
- Decodificación de píxeles mediante el decodificador PiD con factor aproximado de 16x.
- Flujos de trabajo listos para importar en ComfyUI con la cadena de nodos PiD preconfigurada.
- Control de parámetros de muestreo por modelo (pasos y CFG específicos para cada grafo).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio ni modo thinking.

## Casos de uso

- Generación de imágenes en alta resolución para producción gráfica: importar uno de los cuatro grafos, generar a ~1 MP y dejar que PiD decodifique a 2K/4K, evitando un paso separado de upscaling.
- Prototipado rápido de pipelines de difusión en ComfyUI: el repositorio sirve como plantilla para comparar el comportamiento de FLUX.1 Dev, FLUX.2 Dev, SD3.5 Large y Z Image Turbo bajo el mismo decodificador PiD.
- Evaluación del decodificador PiD: los cuatro grafos permiten medir cómo afecta PiD a distintos modelos base con parámetros de muestreo ya ajustados por el autor.
- Despliegue en infraestructura alquilada: el autor sugiere instancias de 48 GB en servicios como RunningHub, lo que encaja con entornos de inferencia bajo demanda para generar imágenes 4K.
- Reproducción de tutoriales: los enlaces a YouTube y Bilibili permiten seguir el flujo paso a paso para validar la instalación de los nodos personalizados.
- Investigación sobre decodificación de difusión de píxeles: útil para estudiar el efecto del factor 16x y del control de sigma en la calidad final de la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor no da una cifra exacta, pero recomienda instancias de 48 GB y advierte de que las ejecuciones locales son propensas a OOM.
- GPU recomendadas: no se especifican modelos concretos; el autor sugiere alquilar una instancia de 48 GB (equivalente a A100 80 GB, A6000 48 GB o similares, aunque no se confirma).
- GPU de consumo: no se indica compatibilidad con GPU de consumo; el aviso de OOM sugiere que no es viable en tarjetas de 24 GB o menos.
- Opciones de despliegue: ComfyUI con los nodos personalizados PiD instalados; también se ofrecen instancias alquiladas en RunningHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de pesos y no se han proporcionado alternativas comparables en la información disponible.

## Limitaciones y advertencias

- El decodificador PiD amplía los defectos en lugar de corregirlos; el autor cita como ejemplo las manos generadas por SD3.5.
- Un valor de sigma alto degrada la calidad de la salida.
- Consumo de VRAM muy elevado: incluso con 48 GB pueden producirse fallos por OOM.
- La licencia es "other" sin términos especificados, por lo que el uso comercial queda sin garantías claras.
- El repositorio no contiene pesos de modelo; depende de modelos base de terceros (FLUX.1 Dev, FLUX.2 Dev, SD3.5 Large, Z Image Turbo) cuyas licencias deben verificarse por separado.
- Idioma documentado: únicamente inglés.
- No hay datos de benchmarks ni métricas de calidad objetivas.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-252-comfyui-workflows
- RunningHub FLUX.1 Dev PiD 4K: https://www.runninghub.ai/post/2059961777689030657/?inviteCode=rh-v1111
- RunningHub FLUX.2 Dev PiD 4K: https://www.runninghub.ai/post/2059961769686294530/?inviteCode=rh-v1111
- RunningHub SD3.5 Large PiD 4K: https://www.runninghub.ai/post/2059961785033256961/?inviteCode=rh-v1111
- RunningHub Z Image Turbo PiD 4K: https://www.runninghub.ai/post/2059961793564471298/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=nPt4IJ03Y9Q
- Bilibili: https://www.bilibili.com/video/BV1tsVH6kEBJ

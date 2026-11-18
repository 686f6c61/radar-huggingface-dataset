# linoyts/Qwen-Image-2.1-WebGPU

## Resumen

Qwen-Image-2.1-WebGPU es una conversión del modelo de generación de imágenes Qwen/Qwen-Image-2.1 de Alibaba Qwen, preparada por linoyts para su ejecución íntegra en el navegador mediante onnxruntime-web y WebGPU. El paquete fusiona el LoRA DMD2 de 2 pasos (linoyts/Qwen-Image-2.1-DMD2-2steps) en los pesos base, exporta cada componente a ONNX y cuantiza las capas lineales a int4, reduciendo la descarga total a unos 7,4 GB. Es la primera publicación del proyecto diffusers.js, un experimento para ejecutar pipelines de diffusers en el navegador con las mismas convenciones del Hub que transformers.js.

El modelo resuelve el problema de desplegar un generador texto-imagen de gran tamaño sin servidor ni GPU dedicada: toda la inferencia ocurre en el cliente sobre WebGPU, con dos pasos de denoising y sin classifier-free guidance. La arquitectura subyacente combina un text encoder derivado de Qwen3-VL-8B (36 capas, lineales int4), un transformer DiT de 32 bloques con proyección de texto, embedding de paso y cabeza de salida, y un decodificador VAE ligero TAEQI2.1 en fp16 de solo 15 MB.

Su relevancia es doble: por un lado demuestra que un pipeline de difusión de escala media puede fragmentarse en grafos ONNX de menos de 2 GB cada uno y cargarse como sesiones independientes; por otro, introduce una ruta de caché KV para los tokens de texto (prefill único, reutilización en cada paso de denoising) válida porque Qwen-Image 2.1 modula los tokens de texto desde t=0. La licencia Qwen Research limita el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con text encoder Qwen3-VL-8B y VAE TAEQI2.1; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (MatMulNBits, bloque 128, asimetrica) en lineales; fp16 en norms, embedders, modulacion y cabeza de salida |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el text encoder deriva de Qwen3-VL-8B) |
| Licencia | Qwen Research License (no comercial); VAE bajo MIT |
| Formato de pesos | ONNX (grafos por componente, sufijos de dtype tipo `_q4f16`), configuracion diffusers (`model_index.json`) |

## Arquitectura y entrenamiento

El pipeline sigue la estructura de diffusers con un directorio por componente. El text encoder contiene la ruta de texto de Qwen3-VL-8B: tabla de embeddings en int4, 36 grafos de capas con lineales int4 y una normalización final, sumando 3,7 GB. El transformer DiT incluye `text_proj`, `step_embed`, 32 grafos de bloque con lineales int4 y `head`, también 3,7 GB. El VAE es el decodificador diminuto TAEQI2.1 de madebyollin en fp16 (15 MB), y se acompañan tokenizer y scheduler FlowMatch Euler con shift estático de 1,0.

La innovación técnica principal es la separación en grafos de menos de 2 GB para que cada uno se cargue como sesión ONNX independiente, y el uso de bloques DiT estilo decoder con `past_key`/`past_value`: los tokens de texto se ejecutan una sola vez como prefill y sus K/V se cachean, de modo que cada paso de denoising procesa únicamente los tokens de imagen. Esto replica la ruta de caché KV del pipeline de diffusers y es válido porque Qwen-Image 2.1 modula los tokens de texto desde t=0 (`causal_condition`). Los ficheros `transformer/config.json` y `text_encoder/config.json` incluyen una sección `diffusers_js` con la E/S de cada grafo, las reglas RoPE y la plantilla de prompt.

El modelo incorpora el LoRA DMD2 de 2 pasos fusionado, lo que permite generar imágenes con dos pasos de denoising y sin CFG. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni las etapas de RLHF/DPO de Qwen-Image 2.1 en la documentación proporcionada. La verificación reportada por el autor indica un error relativo de 5e-7 en un bloque DiT fp32 frente a PyTorch, una diferencia de latentes de 0,155 en la cadena ONNX completa frente a diffusers fp32 (frente a 0,187 del propio run bf16 de diffusers) y una similitud coseno de 0,955 a 0,967 en los embeddings finales del text encoder frente a bf16.

## Capacidades

- Generación de imágenes texto-a-imagen con dos pasos de denoising y sin classifier-free guidance.
- Ejecución íntegra en el navegador sobre WebGPU mediante onnxruntime-web y diffusers.js.
- Carga por sesiones ONNX independientes, con cada grafo por debajo de 2 GB.
- Caché KV de los tokens de texto entre pasos de denoising (prefill único).
- Cuantización int4 de las lineales con precisión fp16 en normas, embeddings, modulación y cabeza.
- Decodificación VAE ligera con TAEQI2.1 para reducir el coste de decodificación.
- Soporte de plantilla de prompt y reglas RoPE declaradas en la configuración `diffusers_js`.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking.

## Casos de uso

- Demos interactivas de generación de imágenes en el navegador: el modelo se ejecuta en el cliente sobre WebGPU sin backend, lo que permite publicar una demo estática en un CDN o en GitHub Pages sin coste de GPU en servidor.
- Prototipado de experiencias creativas sin infraestructura: diseñadores pueden probar prompts y variaciones en local con una descarga de 7,4 GB y dos pasos por imagen, útil para validar ideas antes de migrar a un despliegue con GPU.
- Aplicaciones de privacidad estricta: al no enviar el prompt ni los datos a un servidor, encaja en escenarios donde el contenido generado no debe salir del dispositivo del usuario.
- Herramientas educativas sobre difusión: la separación en grafos ONNX con configuración documentada (`diffusers_js`) permite inspeccionar el pipeline paso a paso y explicar el funcionamiento de un DiT con caché KV.
- Generación de recursos en aplicaciones web offline-first: integrable en PWA que generen ilustraciones o placeholders cuando no hay conectividad, siempre que el dispositivo soporte WebGPU y disponga de memoria suficiente.
- Investigación sobre cuantización int4 en pipelines de difusión: el paquete incluye métricas de verificación frente a PyTorch y bf16, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantización bloque a bloque.
- Integración en flujos de edición rápida con few-step: los dos pasos y la ausencia de CFG reducen la latencia por imagen, adecuado para iteraciones de bajo coste en herramientas de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de verificación numérica entre la implementación PyTorch y la cadena ONNX:

| Verificacion | Resultado |
|---|---|
| Bloque DiT individual, fp32 export vs PyTorch | error relativo 5e-7 |
| DiT completo, 2 pasos, int4 vs diffusers fp32 | diferencia relativa de latentes 0,155 |
| DiT completo, bf16 de diffusers vs fp32 | diferencia relativa de latentes 0,187 |
| Text encoder, embeddings finales vs bf16 | similitud coseno 0,955 a 0,967 |

## Requisitos de hardware

- Descarga total de aproximadamente 7,4 GB (3,7 GB text encoder + 3,7 GB transformer + 15 MB VAE).
- Requiere un navegador con soporte de WebGPU (Chrome/Edge en versiones recientes; soporte variable en otros navegadores).
- La memoria necesaria para cargar las sesiones ONNX no está especificada; al trabajar con pesos int4 y grafos de menos de 2 GB, se espera que el consumo sea sensiblemente inferior al de un despliegue fp16, pero no se publican cifras de VRAM ni de RAM.
- No se documentan GPU recomendadas ni latencias o throughput medidos.
- El despliegue previsto es onnxruntime-web sobre WebGPU; no se mencionan rutas para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- No se indica si cabe en GPU de consumo; la ejecución objetivo es el navegador, no un servidor con GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| Qwen-Image-2.1-WebGPU (este) | no disponible | no disponible | ONNX int4 | Qwen Research (no comercial) | Navegador, WebGPU |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | safetensors (original) | Qwen Research (no comercial) | GPU con diffusers |
| linoyts/Qwen-Image-2.1-DMD2-2steps | no disponible | no disponible | LoRA | no disponible | Se fusiona sobre el base |
| madebyollin/taeqi2_1 (VAE) | no disponible | no disponible | fp16 | MIT | Componente de decodificacion |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría; la comparación se limita a formato, licencia y modo de ejecución.

## Limitaciones y advertencias

- Licencia Qwen Research de tipo no comercial: los pesos derivados de Qwen-Image 2.1 no pueden usarse en productos comerciales sin autorización; el VAE TAEQI2.1 es MIT, pero el resto del paquete hereda la restricción.
- El modelo está pensado para navegador con WebGPU; sin ese soporte no es utilizable, y el rendimiento depende del driver y del dispositivo del usuario.
- La cuantización int4 introduce una diferencia de latentes de 0,155 frente a fp32, superior a la del propio bf16 de diffusers (0,187) en términos comparables, por lo que la fidelidad respecto al modelo original no es exacta.
- Los embeddings del text encoder alcanzan una similitud coseno de 0,955 a 0,967 frente a bf16, lo que puede afectar a la fidelidad del prompt en casos límite.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe del text encoder en esta conversión.
- No hay información sobre tasas de alucinación visual, artefactos o calidad subjetiva de las imágenes generadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- La fecha de creación indicada (2026-11-18) debe tratarse con cautela al evaluar la madurez del proyecto diffusers.js, descrito por el autor como un experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linoyts/Qwen-Image-2.1-WebGPU
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- LoRA DMD2 de 2 pasos: https://huggingface.co/linoyts/Qwen-Image-2.1-DMD2-2steps
- Decodificador VAE TAEQI2.1: https://huggingface.co/madebyollin/taeqi2_1
- Licencia del modelo base: https://huggingface.co/linoyts/Qwen-Image-2.1-WebGPU/blob/main/LICENSE

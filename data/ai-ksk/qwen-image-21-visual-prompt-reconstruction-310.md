# AI-KSK/qwen-image-21-visual-prompt-reconstruction-310

## Resumen

`AI-KSK/qwen-image-21-visual-prompt-reconstruction-310` es un repositorio de Hugging Face publicado por el usuario AI-KSK que no contiene pesos de un modelo en sentido estricto, sino un paquete de recursos para ComfyUI: un grafo de 18 nodos y 24 enlaces que orquesta reconstruccion de imagen asistida por prompt visual. El flujo combina un modelo de lenguaje multimodal (etiquetado como `qwen3vl_8b_fp8_scaled.safetensors`) que genera una descripcion textual de la imagen de entrada, un prompt fijo de preservacion de identidad, geometria, iluminacion y estilo, y un modelo de generacion de imagen (`qwen_image_2.1_bf16.safetensors`) con su VAE (`qwen_image_2.1_vae_bf16.safetensors`) y un LoRA de detalle (`elusarcas-qwen2-1-detailer-v1.safetensors`).

El objetivo declarado es la "reconstruccion" generativa de una imagen a partir de un latent vacio condicionado por la imagen original y por el prompt reconstruido por el LLM. No se trata de un img2img clasico de bajo denoise ni de una recuperacion pixel a pixel: el sampler parte de `EmptyLatentImage` con 25 pasos, CFG 1, sampler Euler/simple y denoise 1. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamano de 0.0 GB, lo que indica que los pesos referenciados no estan incluidos en el paquete.

La relevancia es limitada y fundamentalmente practica: sirve como ejemplo reproducible de un pipeline de "prompt-assisted reconstruction" en ComfyUI que integra un VLM para captioning, un LLM remoto (selecciona `google/gemini-3.1-flash-lite-preview` mediante un nodo RHLLM) y un modelo de difusion Qwen Image 2.1. La propia model card advierte de que no se ha realizado ninguna peticion externa al modelo durante la preparacion del paquete, de que no hay muestras de inferencia verificadas y de que no se incluye aceptacion visual, de rendimiento ni de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo de ComfyUI (18 nodos, 24 enlaces) sobre Qwen Image 2.1 (difusion) + Qwen3-VL 8B (VLM) + LoRA de detalle |
| Parametros totales | no disponible (el repo no incluye pesos; el VLM referenciado es de 8B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (modelo base y VAE), fp8_scaled (VLM), LoRA sin cuantizacion declarada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (referenciados, no incluidos en el repo) |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: es un workflow de inferencia. La generacion la realiza Qwen Image 2.1 en su variante bf16, un modelo de difusion para sintesis de imagen, alimentado por un VAE bf16 independiente y modulado por un LoRA de detalle aplicado a fuerza aproximada de 0.5. El condicionamiento textual proviene de un encoder que recibe la imagen de entrada (nodo 512) y de un prompt construido por concatenacion (nodo 545) entre la respuesta de un VLM remoto y una instruccion fija (nodo 544). El VLM seleccionado en el grafo es Qwen3-VL 8B en fp8_scaled, aunque el nodo RHLLM apunta a `google/gemini-3.1-flash-lite-preview` como servicio de lenguaje, lo que introduce una dependencia externa no verificada en el paquete.

El sampler (nodo 507) opera sobre `EmptyLatentImage` (nodo 506) con 25 pasos, CFG 1, Euler/simple, denoise 1 y semilla aleatorizada. El encoder recibe imagen pero su socket VAE esta desenlazado y su salida latente no se utiliza; la model card pide validar el comportamiento de VAE opcional contra la implementacion correspondiente en lugar de asumir un `VAEEncode` que no existe en el grafo. El calculo de tamano usa la formula `s = min(4, sqrt(2048*2048/(a*b)))`, con dimensiones objetivo `a*s` y `b*s`, limitando el aumento por eje a x4 y apuntando a un maximo de 2048² pixeles; los ejemplos aritmeticos de la card (1024²→2048², 256²→1024², 4096²→2048², 1920x1080→~2730.67x1536) no son dimensiones renderizadas. No se documenta numero de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO para ninguno de los componentes.

## Capacidades

- Reconstruccion generativa de imagen condicionada por una imagen de entrada y un prompt derivado por VLM.
- Generacion de descripciones visuales mediante un VLM de 8B (Qwen3-VL) para alimentar el condicionamiento.
- Aplicacion de un prompt fijo de preservacion de identidad, geometria, iluminacion y estilo (sin garantia de fidelidad).
- Ajuste fino de detalle mediante LoRA a fuerza ~0.5.
- Redimensionado automatico con limite de x4 por eje y presupuesto objetivo de 2048² pixeles.
- Comparacion lado a lado de original y reconstruccion mediante nodo comparador (513).
- Integracion con servicio LLM remoto a traves de nodo RHLLM (dependencia externa).
- No se declaran capacidades de tool calling, agentes, audio, thinking mode ni multilingues mas alla de las del VLM subyacente, que no se documentan en este repositorio.

## Casos de uso

- Reconstruccion asistida de material grafico para restauracion visual: el flujo toma una imagen, genera una descripcion con el VLM y regenera con Qwen Image 2.1; util para obtener una version limpia de una imagen deteriorada, aceptando que el resultado es generativo y no una recuperacion fiel.
- Prototipado de pipelines de captioning + difusion en ComfyUI: el grafo sirve como plantilla para experimentar con la sustitucion del VLM o del servicio LLM por alternativas locales, dado que el nodo RHLLM es intercambiable.
- Generacion de variantes controladas de una imagen manteniendo instrucciones de estilo: el prompt fijo de preservacion permite explorar reconstrucciones con distinta semilla sin cambiar la composicion declarada.
- Evaluacion de fidelidad de reconstruccion: el nodo comparador (513) y el guardado en `SaveImage14553` permiten montar un banco de pruebas para medir cuanto detalle nuevo introduce el modelo frente al original.
- Docencia y demostracion de flujos multimodales: el grafo ilustra la concatenacion de un VLM con un modelo de difusion y el uso de LoRA de detalle en un caso concreto y acotado.
- Integracion en herramientas de diseno que requieran regenerar assets con instrucciones de conservacion: adecuado cuando se acepta supervision humana del prompt y de la salida, no como sustituto de un editor de imagen determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se incluye aceptacion visual, de rendimiento ni de licencia, y que las portadas seleccionadas no son muestras de inferencia verificadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el paquete referencia Qwen Image 2.1 en bf16, Qwen3-VL 8B en fp8_scaled y un VAE bf16, lo que en conjunto supera con holgura los 16 GB; no se documenta el consumo real.
- GPU recomendadas: no disponibles en la informacion proporcionada; por los formatos bf16/fp8 referenciados, se requeririan GPU con soporte bf16 y fp8 (gama profesional tipo A100/H100 o consumer de gama alta con suficiente VRAM), sin confirmacion por parte del autor.
- Cabe en GPU consumer: no confirmado; el VLM de 8B en fp8 y el modelo de difusion en bf16 hacen improbable un despliegue comodo en GPU de 8-12 GB.
- Opciones de despliegue: ComfyUI (el paquete es un workflow JSON para este entorno). No se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/qwen-image-21-visual-prompt-reconstruction-310 | Workflow ComfyUI (Qwen Image 2.1 + Qwen3-VL 8B) | no disponible (VLM de 8B referenciado) | no disponible | no disponible | Repo Hugging Face, 0 descargas, pesos no incluidos |
| Qwen Image 2.1 (modelo base referenciado) | Difusion texto-a-imagen | no disponible | no disponible | no disponible | Referenciado como `qwen_image_2.1_bf16.safetensors`, no incluido |
| Qwen3-VL 8B (VLM referenciado) | Vision-language | 8B | no disponible | no disponible | Referenciado como `qwen3vl_8b_fp8_scaled.safetensors`, no incluido |
| LoRA `elusarcas-qwen2-1-detailer-v1` | Adaptador de detalle | no disponible | no disponible | no disponible | Referenciado, no incluido |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye pesos: el tamano es 0.0 GB y los safetensors referenciados deben obtenerse por separado; hay que verificar los derechos de cada componente (modelo base, VLM, VAE, LoRA, nodos y servicio) de forma independiente.
- La reconstruccion es generativa desde un latent vacio: no garantiza recuperacion pixel a pixel ni es un img2img de bajo denoise; el prompt fijo de preservacion no impone fidelidad.
- Riesgo alto de alucinacion de detalle: la model card advierte de que el detalle plausible no es prueba de informacion recuperada y recomienda revisar texto, logotipos, caras, patrones repetidos y bordes en las salidas reales.
- El nodo RHLLM apunta a un servicio externo (`google/gemini-3.1-flash-lite-preview`); no se ha realizado ninguna peticion externa durante la preparacion del paquete y deben confirmarse enrutamiento, transmision de imagen, cuenta, costes y terminos de datos.
- El encoder recibe imagen pero su VAE esta desenlazado y su salida latente no se usa; el comportamiento de VAE opcional debe validarse contra la implementacion concreta y no asumirse.
- El socket `api_config` sin conectar no prueba que la configuracion a nivel de cuenta este ausente.
- La galeria historica de comparacion se elimina en las copias distribuidas; las portadas seleccionadas no son muestras de inferencia verificadas.
- No se incluye aceptacion de licencia: la reconstruccion no otorga propiedad ni licencia comercial global sobre imagenes de entrada, pesos, LoRA, nodos, servicio, artwork ni portadas.
- El calculo de tamano puede reducir imagenes grandes, quedarse por debajo del presupuesto en entradas pequenas y superar 2048 en el lado largo; los ejemplos de la card no son dimensiones renderizadas.
- No se documentan sesgos, idiomas soportados ni limitaciones de contexto; no disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AI-KSK/qwen-image-21-visual-prompt-reconstruction-310
- Workflow JSON referenciado en la model card: `workflows/QwenImage2.1洗图.json` (ruta interna del repo)
- Portada seleccionada referenciada: `covers/decb16a4-757f-4596-a7ae-52895691c209.png` (ruta interna del repo)
- Tutorial indicado por el autor (no verificado en vivo): https://www.youtube.com/watch?v=-80Jf67eOF8

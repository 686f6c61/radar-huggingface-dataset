# alkyum/neverseen-z-image-turbo

## Resumen

`alkyum/neverseen-z-image-turbo` no es un modelo entrenado por su autor, sino un repositorio espejo ("slim copy") que empaqueta los ficheros necesarios para ejecutar el flujo de trabajo `z-image-turbo` de Neverseen Studio, tal y como los cachea su endpoint serverless de RunPod. Contiene tres componentes: un modelo de difusion en bf16 (`z_image_turbo_bf16.safetensors`), un codificador de texto basado en Qwen 3 de 4B (`qwen_3_4b.safetensors`) y un VAE (`ae.safetensors`). Todos los ficheros proceden del repositorio `Comfy-Org/Z-Image-Turbo` (commit `6fc90a3b1b65`) y conservan su licencia original Apache-2.0.

Se trata, por tanto, de un paquete de inferencia para generacion de imagenes a partir de texto, no de un LLM. El modelo de difusion subyacente es Z-Image-Turbo, distribuido por Comfy-Org en formato safetensors compatible con ComfyUI, y el text encoder es una variante de 4B parametros de la familia Qwen 3. El repositorio ocupa 20,7 GB y no incluye model card tecnica, pipeline declarado, idiomas ni licencia propia a nivel de repositorio (la licencia aplica fichero a fichero).

Su relevancia es practica: sirve como snapshot reproducible de los pesos exactos que usa un workflow de produccion concreto, lo que facilita desplegar el mismo pipeline en otra infraestructura sin depender de descargas parciales del repositorio upstream. No debe confundirse con un release oficial ni citarse como el modelo Z-Image-Turbo en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible a nivel de repositorio; el componente de difusion es un modelo de difusion (Z-Image-Turbo) y el text encoder es Qwen 3 de 4B |
| Parametros totales | No disponible (el text encoder es de 4B; el modelo de difusion no declara cifra) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en bf16 (`z_image_turbo_bf16.safetensors`); no se listan otras variantes en este repo |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 por fichero (segun la model card); el repositorio no declara licencia propia |
| Formato de pesos | safetensors (tres ficheros: diffusion model, text encoder y VAE) |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento. Por los nombres y la estructura de directorios (`diffusion_models/`, `text_encoders/`, `vae/`) se corresponde con un pipeline de generacion de imagenes de tipo texto-a-imagen para ComfyUI: un modelo de difusion que actua como denoiser, un codificador de texto Qwen 3 de 4B que produce las embeddings de condicionamiento y un autoencoder variacional que traduce entre espacio latente y pixeles. El sufijo "turbo" en el nombre del modelo de difusion indica, convencionalmente en esta familia de modelos, un modelo destilado para requerir pocos pasos de muestreo, aunque el repositorio no aporta detalle sobre el numero de pasos, el scheduler recomendado ni el metodo de destilacion.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas. Cualquier dato de este tipo debe consultarse en el repositorio upstream `Comfy-Org/Z-Image-Turbo`, que es la fuente real de los pesos.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, mediante el modelo de difusion Z-Image-Turbo incluido en el paquete.
- Condicionamiento textual via un text encoder Qwen 3 de 4B, lo que implica capacidad de interpretar prompts relativamente complejos y multilingues (la cobertura idiomatica concreta no esta declarada en este repositorio).
- Decodificacion de latentes a imagen mediante el VAE incluido (`ae.safetensors`).
- Integracion directa con ComfyUI y con workflows basados en nodos, dada la estructura de ficheros y el origen Comfy-Org.
- Ejecucion en endpoints serverless (el repositorio existe precisamente como cache de un endpoint RunPod Serverless).
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking"; el componente Qwen 3 actua unicamente como encoder de texto, no como modelo generativo conversacional en este contexto.

## Casos de uso

- Generacion de imagenes en produccion con ComfyUI: cargar los tres safetensors en los nodos correspondientes (`Load Diffusion Model`, `Load CLIP`/text encoder y `Load VAE`) para reproducir exactamente el pipeline `z-image-turbo` de Neverseen Studio.
- Despliegue en RunPod Serverless: el repositorio replica la cache exacta del endpoint, por lo que sirve para aprovisionar una instancia nueva con los mismos pesos y evitar diferencias de version respecto al entorno original.
- Reproducibilidad de resultados: al fijar el commit upstream (`6fc90a3b1b65`), permite regenerar imagenes identicas a las de un experimento previo aunque el repositorio oficial se actualice.
- Entornos con conectividad restringida o mirror interno: al ser un paquete autocontenido de 20,7 GB, se puede replicar en un registro privado y servir desde ahi sin acceso a Hugging Face.
- Pruebas A/B de prompts y parametros de muestreo: al tener los pesos fijados, cualquier variacion en la salida es atribuible al prompt o al sampler, no a cambios en el modelo.
- Base para ajuste fino o LoRA sobre Z-Image-Turbo: los safetensors en bf16 son el punto de partida habitual para entrenar adaptadores sobre el modelo de difusion.
- Prototipado de interfaces de generacion de imagenes: integrar el pipeline en una aplicacion web o bot que reciba texto y devuelva una imagen, usando el text encoder Qwen 3 para prompts en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el paquete completo pesa 20,7 GB en bf16, de modo que cargar los tres componentes en memoria requiere previsiblemente mas de 20 GB de VRAM; no se dispone de mediciones confirmadas.
- GPU recomendadas: no declaradas por el autor. Por el tamano del paquete, GPUs de 24 GB o mas (RTX 3090, RTX 4090, A10G, L4 en configuraciones con offload, A100, H100) son las candidatas razonables; no hay confirmacion en la informacion disponible.
- GPU de consumo: no se puede confirmar que quepa en GPUs de 8-16 GB sin cuantizacion u offload, ya que el repositorio solo distribuye pesos en bf16.
- Opciones de despliegue: ComfyUI (formato nativo de los ficheros), endpoints serverless de RunPod (uso original) y cualquier runtime que cargue safetensors de difusion, text encoder y VAE por separado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alkyum/neverseen-z-image-turbo | Paquete de inferencia (difusion + text encoder + VAE) | No disponible (text encoder 4B) | No disponible | Apache-2.0 por fichero | Hugging Face, 0 descargas |
| Comfy-Org/Z-Image-Turbo | Repositorio upstream del modelo de difusion | No disponible | No disponible | Apache-2.0 | Hugging Face (oficial de Comfy-Org) |
| Modelos texto-a-imagen tipo SDXL / FLUX | Modelo de difusion | No disponible en esta ficha | No disponible | Variable segun modelo | Hugging Face |

No se dispone de datos de rendimiento ni de parametros del modelo de difusion que permitan una comparacion cuantitativa fiable con alternativas. Cualquier comparacion numerica requeriria consultar el repositorio upstream.

## Limitaciones y advertencias

- No es un release oficial: es una copia de ficheros de terceros, sin model card tecnica propia ni garantias del autor del repositorio.
- Licencia: el repositorio no declara licencia a nivel global; la model card atribuye Apache-2.0 a cada fichero segun su origen. Verificar la licencia en el repositorio upstream antes de uso comercial.
- Ausencia de datos clave: no se declaran idiomas, contexto, parametros del modelo de difusion, pasos de muestreo recomendados ni requisitos de hardware.
- Riesgo de desactualizacion: al ser un snapshot de un commit concreto de `Comfy-Org/Z-Image-Turbo`, no recibira correcciones ni mejoras del upstream.
- Sesgos y alucinacion visual: no hay documentacion sobre sesgos del modelo de difusion ni sobre su comportamiento en prompts ambiguos; los modelos texto-a-imagen pueden generar contenido inexacto o estereotipado.
- Cero traccion en la plataforma (0 descargas, 0 likes) en el momento de la consulta, lo que reduce la probabilidad de que existan informes de la comunidad sobre fallos o comportamientos.
- Para produccion, conviene fijar el commit upstream y validar los pesos con un hash en lugar de depender de este espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alkyum/neverseen-z-image-turbo
- Repositorio upstream de los pesos: https://huggingface.co/Comfy-Org/Z-Image-Turbo
- Commit referenciado: `6fc90a3b1b65` en `Comfy-Org/Z-Image-Turbo`
- ComfyUI (runtime compatible con el formato de los ficheros): https://github.com/comfyanonymous/ComfyUI
- RunPod Serverless (infraestructura de origen del cache): https://www.runpod.io/serverless-gpu

# Nekodeus/neko-alpha6-sdxl-v1

## Resumen

Neko alpha6 SDXL v1 es un adaptador LoRA de tipo *character* para Stable Diffusion XL, desarrollado por el usuario Nekodeus. Su funcion es inyectar en el modelo base `stabilityai/stable-diffusion-xl-base-1.0` la identidad visual del actor Keanu Reeves mediante un token de activacion (`alpha6`), de modo que el pipeline genere retratos y escenas coherentes con ese rostro sin necesidad de describirlo en el prompt. El repositorio ocupa 0,2 GB y contiene los pesos del adaptador en formato `safetensors`, con licencia Apache 2.0.

El entrenamiento se realizo sobre aproximadamente 100 imagenes curadas y verificadas facialmente con OpenCV, con un unico pie de foto uniforme (`a photo of alpha6 person`), 1500 pasos a 1024 px y un rango LoRA (dim/alpha) de 8. Es, por tanto, un adaptador de baja capacidad y dataset pequeno, orientado a un uso muy concreto: generacion de imagenes fotorrealistas de una persona concreta sobre SDXL.

Su relevancia es limitada y acotada al ecosistema de difusion: no es un modelo de lenguaje ni un modelo fundacional, sino un complemento que se carga sobre SDXL en diffusers o ComfyUI. Resulta util como ejemplo de flujo de entrenamiento LoRA ligero (GPU Kaggle, offline) y como pieza dentro de la serie "Hollywood alpha" del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL (UNet + VAE + doble text encoder CLIP) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 8; el modelo base SDXL ronda los 2.600 M en la UNet y 817 M en el text encoder combinado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el prompt se trunca a 77 tokens por encoder CLIP) |
| Tipos de cuantizacion | no disponible de forma explicita; el ejemplo de la model card usa `torch_dtype=torch.float16`; los pesos se distribuyen en `safetensors` |
| Idiomas soportados | no disponible (los prompts en la model card estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (`alpha6.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre SDXL, un modelo de difusion latente con arquitectura transformer en la UNet y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG). El LoRA se entrena con rango 8 y alpha 8, lo que limita el numero de parametros ajustables y favorece un ajuste rapido y ligero sobre el modelo base congelado. La resolucion de entrenamiento es 1024 px, coherente con el regimen nativo de SDXL.

El dataset consta de unas 100 imagenes de Keanu Reeves verificadas con OpenCV para asegurar la presencia del rostro, con leyendas uniformes del tipo `a photo of alpha6 person`. El entrenamiento se ejecuto en una NVIDIA P100 de Kaggle, con AdamW de 8 bits, batch 2, learning rate 1e-4, xformers y 1500 pasos, en modo completamente offline. No se documentan etapas de RLHF, DPO ni ajuste por preferencias, algo esperable en un LoRA de personaje. La innovacion tecnica es minima: se trata de un flujo estandar de entrenamiento LoRA con token de activacion dedicado.

## Capacidades

- Generacion text-to-image de retratos y escenas fotorrealistas del sujeto entrenado (Keanu Reeves) cuando se incluye el token `alpha6` en el prompt.
- Composicion de escenas: permite combinar el sujeto con indicaciones de iluminacion, encuadre y estilo (por ejemplo, `portrait photo, studio lighting`).
- Integracion con el ecosistema SDXL: funciona con `diffusers` mediante `load_lora_weights` y con ComfyUI mediante un nodo LoRA loader.
- Control de intensidad del adaptador mediante el peso del LoRA en la carga (no documentado en la model card, pero inherente al formato).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No soporta vision, audio ni entrada multimodal: es exclusivamente generacion de imagenes a partir de texto.
- Capacidades multilingues: no documentadas; los ejemplos estan en ingles.

## Casos de uso

- Generacion de retratos de personaje para prototipos creativos: cargando el LoRA sobre SDXL y usando el prompt `alpha6 Keanu Reeves, portrait photo, studio lighting` se obtienen retratos en 1024x1024 utiles para maquetas de storyboard o pruebas de direccion de arte.
- Ilustracion de ficcion y fan art: el token `alpha6` permite mantener la identidad del sujeto en distintas escenas (vestuario, epoca, iluminacion) sin repetir descripciones faciales largas en cada prompt.
- Pruebas de concepto para produccion audiovisual: sirve para explorar variaciones de encuadre y luz sobre un mismo rostro antes de contratar fotografia o render 3D.
- Generacion de avatares y material promocional ficticio: util en entornos controlados donde se quiera ilustrar un personaje con rasgos reconocibles, siempre con las cautelas legales indicadas mas abajo.
- Base de aprendizaje para practicar flujos LoRA: el repositorio documenta hiperparametros, dataset y hardware, lo que lo convierte en una referencia para quien quiera replicar un entrenamiento de personaje en una GPU de gama baja (P100 de Kaggle).
- Composicion dentro de pipelines SDXL existentes: al ser un adaptador ligero (0,2 GB), se puede cargar y descargar dinamicamente en un servicio de generacion de imagenes para ofrecer un "estilo personaje" adicional sin duplicar el modelo base.
- Experimentacion con ControlNet o img2img sobre SDXL: el LoRA se puede combinar con otros adaptadores para mantener la identidad mientras se controla la pose o la composicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud facial) ni comparaciones con otros LoRA de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el LoRA en si ocupa unos 0,2 GB; el coste real lo determina SDXL base, que en `float16` requiere aproximadamente 8-10 GB de VRAM para 1024x1024, y en torno a 6-8 GB con optimizaciones (`enable_model_cpu_offload`, `enable_vae_slicing`, `xformers`).
- GPU recomendadas: NVIDIA A100 o H100 para lotes grandes y despliegue de servicio; RTX 4090, RTX 3090 o RTX 4080 para generacion interactiva a 1024 px.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti 16 GB) usando `float16` y offload; en 6 GB puede requerir cuantizacion adicional del modelo base o resoluciones menores.
- Opciones de despliegue: `diffusers` (referencia en la model card), ComfyUI con nodo LoRA loader, y cualquier frontend compatible con LoRA de SDXL (por ejemplo, Automatic1111/Forge con soporte SDXL).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/neko-alpha6-sdxl-v1 | LoRA de personaje | SDXL 1.0 | rango 8 (adaptador de ~0,2 GB) | no aplica | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Nekodeus/neko-hollywood-alpha-sdxl-v1 | LoRA de personaje (serie del mismo autor) | SDXL 1.0 | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Nekodeus/neko-hollywood-alpha-sd15-v1 | LoRA de personaje (serie del mismo autor) | SD 1.5 | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | — | ~3.500 M (UNet + text encoders) | 77 tokens por encoder | CreativeML Open RAIL++-M | Hugging Face |

No se dispone de datos de rendimiento comparativo (similitud facial, FID, CLIP score) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset muy pequeno (~100 imagenes) y leyendas uniformes: el LoRA puede sobreajustar al conjunto y generalizar mal a poses, angulos o expresiones no vistas.
- Riesgo de alucinacion visual: al ser un modelo de difusion, puede generar rasgos faciales inconsistentes o artefactos, especialmente fuera del encuadre de retrato.
- Sesgo de representacion: al entrenarse sobre imagenes de una unica persona, no cubre diversidad demografica y puede reproducir los sesgos del modelo base SDXL.
- Uso comercial: la licencia del adaptador es Apache 2.0, pero el modelo base SDXL se distribuye bajo CreativeML Open RAIL++-M, con restricciones de uso; conviene revisar ambas antes de un despliegue comercial.
- Riesgo legal por derechos de imagen: generar imagenes de una persona real identificable (Keanu Reeves) puede vulnerar derechos de publicidad o imagen segun la jurisdiccion; no debe usarse para suplantacion, difamacion o contenido enganoso.
- Idiomas: no hay evidencia de soporte multilingue en los prompts; los ejemplos estan en ingles y el truncamiento a 77 tokens limita prompts largos.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados; no es una opcion validada para produccion.
- No es un modelo de lenguaje: no ofrece razonamiento, codigo, tool calling ni agentes; cualquier ficha que lo trate como LLM seria incorrecta.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Nekodeus/neko-alpha6-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: `nekodeus/alpha6-keanu-reeves` (referenciado en la model card; URL no verificada en la informacion disponible)
- Serie Hollywood alpha SDXL: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sdxl-v1
- Serie Hollywood alpha SD1.5: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Documentacion de diffusers para LoRA: no disponible en la informacion proporcionada
- Paper de SDXL: no disponible en la informacion proporcionada

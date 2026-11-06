# cokeadrink/moss-image-edit

## Resumen

MOSS Image Edit es un paquete de pesos para edición de imágenes mediante difusión, publicado por el usuario cokeadrink en Hugging Face. No se trata de un modelo entrenado desde cero por este autor, sino de un ensamblado (bundle) de componentes ya existentes: los pesos de difusión de MOSS-Image-SFT (publicados originalmente por Comfy-Org/MOSS-Image), un codificador de texto Qwen3.5-9B en cuantización int8, el VAE de FLUX.2 y un adaptador LoRA de edición de imágenes atribuido a chinoll. El repositorio ocupa 20,5 GB y declara el pipeline `image-to-image`.

El modelo base declarado es OpenMOSS-Team/MOSS-Image-SFT, del que este bundle reutiliza los pesos de difusión sin modificarlos. La relevancia de este repositorio es fundamentalmente práctica: agrupa en un único paquete los cuatro artefactos necesarios para ejecutar edición de imágenes con la familia MOSS-Image en entornos tipo ComfyUI, evitando al usuario tener que localizar y emparejar manualmente pesos de difusión, text encoder, VAE y LoRA.

Conviene subrayar que el autor no reclama autoría sobre ninguno de los componentes y que cada archivo queda sujeto a la licencia de su publicador original. El bundle no aporta model card técnica propia con detalles de entrenamiento, benchmarks ni especificaciones de contexto, por lo que buena parte de los datos técnicos de esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para image-to-image (familia MOSS-Image); text encoder transformer Qwen3.5-9B; VAE FLUX.2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Text encoder en int8 (`qwen3.5_9b_int8_convrot.safetensors`); pesos de difusión en bf16 (`moss_image_sft_bf16.safetensors`) |
| Idiomas soportados | en, zh |
| Licencia | no disponible a nivel de bundle; Comfy-Org declara Apache-2.0 para sus archivos; el adaptador de chinoll no declara licencia de pesos en la revisión fijada |
| Formato de pesos | safetensors (diffusion_models, text_encoders, vae, loras) |

## Arquitectura y entrenamiento

El bundle combina cuatro artefactos. El componente generativo principal son los pesos de difusión `moss_image_sft_bf16.safetensors`, procedentes de Comfy-Org/MOSS-Image y correspondientes al modelo base OpenMOSS-Team/MOSS-Image-SFT. A este se añade un codificador de texto Qwen3.5-9B cuantizado a int8 con la variante `convrot`, el VAE de FLUX.2 (`flux2-vae.safetensors`) y un adaptador LoRA de edición (`moss_image_edit.safetensors`) atribuido a chinoll. El pipeline declarado es `image-to-image`, lo que sitúa al modelo en la categoría de edición de imágenes guiada por instrucciones en lenguaje natural.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del proceso de entrenamiento. La model card del bundle se limita a documentar la procedencia de cada archivo y a remitir a las fichas originales de los publicadores; los hashes SHA-256 y las revisiones exactas se recogen en `bundle-manifest.json`. Cualquier detalle arquitectónico adicional debe consultarse en la ficha de OpenMOSS-Team/MOSS-Image-SFT o en la colección Comfy-Org/MOSS-Image.

## Capacidades

- Edición de imágenes image-to-image: transformación de una imagen de entrada guiada por una instrucción textual, gracias al adaptador LoRA de edición.
- Generación/edición bilingüe: el codificador de texto Qwen3.5-9B y los tags del repositorio declaran soporte de inglés y chino.
- Integración con flujos ComfyUI: el desglose en `diffusion_models`, `text_encoders`, `vae` y `loras` está pensado para cargarse en pipelines de nodos de ComfyUI.
- Cuantización del text encoder a int8: reduce los requisitos de memoria del componente de texto manteniendo los pesos de difusión en bf16.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión general, audio ni modo thinking; estas capacidades no están disponibles en la información proporcionada.

## Casos de uso

- Edición fotográfica asistida por instrucciones: el usuario introduce una imagen y una descripción textual del cambio deseado, y el LoRA de edición aplica la transformación sobre la imagen de entrada; adecuado para retoque rápido en flujos creativos.
- Prototipado en ComfyUI: al estar empaquetados los cuatro componentes con nombres y rutas consistentes, sirve para montar un grafo de edición de imágenes reproducible sin resolver dependencias manualmente.
- Localización de contenido visual en inglés y chino: el codificador Qwen3.5-9B permite emitir instrucciones de edición en ambos idiomas, útil en equipos con documentación o briefs en chino.
- Iteración creativa en diseño gráfico: variaciones sucesivas sobre una misma imagen base para explorar estilos o correcciones, aprovechando el pipeline image-to-image.
- Automatización de tareas de retoque por lotes: integrado en un pipeline de ComfyUI headless, puede procesar colecciones de imágenes con prompts predefinidos.
- Evaluación comparativa de adaptadores LoRA: al incluir un LoRA de edición concreto sobre unos pesos base conocidos, permite medir el efecto del adaptador frente al modelo sin LoRA en tareas de edición.
- Docencia y experimentación: paquete autocontenido para demostrar el funcionamiento de un pipeline de difusión con text encoder, VAE y LoRA en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio completo ocupa 20,5 GB, por lo que cargar todos los componentes en memoria requiere previsiblemente más de 20 GB de VRAM; los pesos de difusión en bf16 son el componente dominante.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del bundle, se sitúa en la franja de GPUs de datacenter (A100, H100) o GPUs de consumo de gama alta con 24 GB o más; esta apreciación es una estimación por tamaño de archivos, no un dato del publicador.
- ¿Cabe en GPU de consumo? No confirmado. La cuantización int8 del text encoder reduce su huella, pero los pesos de difusión en bf16 y el VAE condicionan el total.
- Opciones de despliegue: el empaquetado (`diffusion_models`, `text_encoders`, `vae`, `loras`) sugiere ComfyUI como destino principal. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cokeadrink/moss-image-edit | Bundle de difusión + LoRA para edición | no disponible | no disponible | no disponible (componentes con licencias dispares) | Hugging Face, 0 descargas, 0 likes |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de difusión | no disponible | no disponible | no disponible | Hugging Face (modelo base declarado) |
| Comfy-Org/MOSS-Image | Pesos de difusión, text encoder y VAE | no disponible | no disponible | Apache-2.0 declarada por la colección | Hugging Face |
| chinoll/Moss-Image-Edit | Adaptador LoRA de edición | no disponible | no disponible | no declarada en la revisión fijada | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones numéricas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a procedencia, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio es un reensamblado de artefactos de terceros; el autor no reclama autoría ni ofrece garantías sobre los componentes.
- Licencia ambigua: Comfy-Org declara Apache-2.0 para sus archivos, pero el adaptador de chinoll no declara licencia de pesos en la revisión fijada. El uso comercial del bundle completo no está garantizado y debe verificarse con cada publicador original.
- Idiomas limitados a inglés y chino según los tags; el rendimiento en castellano no está documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de edición frente a alternativas.
- Sin model card técnica propia: no se documentan sesgos, tasas de alucinación visual, limitaciones de resolución ni caveats de producción.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-04): madurez y mantenimiento no verificables.
- Al ser un modelo de difusión de imagen, los riesgos típicos incluyen sesgos en los datos de entrenamiento originales, artefactos visuales y fidelidad limitada a la instrucción; no cuantificados en la información disponible.
- La denominación de archivos y rutas debe respetarse para que el bundle funcione en ComfyUI; renombrar componentes puede romper la carga.

## Enlaces

- Repositorio del bundle: https://huggingface.co/cokeadrink/moss-image-edit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Pesos originales de difusión, text encoder y VAE: https://huggingface.co/Comfy-Org/MOSS-Image
- Adaptador LoRA de edición: https://huggingface.co/chinoll/Moss-Image-Edit

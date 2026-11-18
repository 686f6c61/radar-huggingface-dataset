# Comfy-Org/z_image

## Resumen

Z-Image es un modelo de difusion para generacion de imagenes a partir de texto, desarrollado originalmente por Tongyi-MAI (Alibaba) y redistribuido por Comfy-Org en un formato de fichero unico optimizado para ComfyUI. Este repositorio no contiene el modelo original, sino una reempaquetado de los pesos en ficheros `safetensors` individuales listos para colocarse en los directorios `diffusion_models`, `text_encoders` y `vae` de ComfyUI, lo que elimina la friccion de conversion y carga para usuarios del ecosistema ComfyUI.

El modelo emplea un text encoder basado en Qwen 3 de 4.000 millones de parametros (disponible en variantes bf16, fp8 mixed y fp4 mixed) y un VAE independiente (`ae.safetensors`). El repositorio incluye dos variantes del UNet/difusion: una en bf16 completa (`z_image_bf16.safetensors`) y otra cuantizada a int8 con rotacion de convoluciones (`z_image_int8_convrot.safetensors`), pensada para reducir requisitos de VRAM manteniendo calidad.

Su relevancia actual radica en que Comfy-Org actua como canal de distribucion curado para ComfyUI: los workflows oficiales de texto a imagen (tanto en bf16 como en int8) estan publicados en el repositorio de plantillas, lo que permite a cualquier usuario reproducir la inferencia con un solo clic. La licencia Apache 2.0 facilita el uso comercial y la integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (UNet) con text encoder Qwen 3 4B y VAE independiente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (UNet), int8 con convrot (UNet), fp8 mixed y fp4 mixed (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ficheros unicos para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de difusion mas alla de que se distribuye como un unico fichero de difusion compatible con ComfyUI, acompanado de un text encoder Qwen 3 de 4.000 millones de parametros y un VAE (`ae.safetensors`). El pipeline es de texto a imagen: el text encoder procesa el prompt y el modelo de difusion genera la imagen latente que el VAE decodifica.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). La variante int8 emplea una tecnica de rotacion de convoluciones (`convrot`) para la cuantizacion, segun el nombre del fichero.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante el workflow oficial de ComfyUI.
- Soporte de dos niveles de precision: bf16 completa e int8 cuantizada con convrot, para adaptarse a distintos presupuestos de VRAM.
- Text encoder Qwen 3 4B con variantes de cuantizacion fp8 mixed y fp4 mixed, lo que permite reducir el consumo de memoria del encoder.
- Integracion nativa con ComfyUI mediante plantillas de workflow publicadas (imagen Z-Image y Z-Image Int8).
- No se documentan capacidades de edicion de imagen, inpainting, controlnet, tool calling, agentes ni multimodalidad de entrada.

## Casos de uso

- Generacion de ilustraciones para blogs y documentacion tecnica: el workflow oficial de texto a imagen permite producir imagenes de portada o diagramas ilustrativos a partir de prompts, integrándose en un pipeline de publicacion automatica.
- Prototipado rapido de conceptos visuales en diseno de producto: con la variante int8 se puede iterar sobre decenas de prompts en una GPU de consumo, comparando resultados antes de fijar una direccion creativa.
- Creacion de assets para videojuegos y aplicaciones: la licencia Apache 2.0 permite generar y distribuir imagenes derivadas en productos comerciales sin obligaciones de atribucion adicionales.
- Generacion de material de marketing a escala: el repositorio incluye los pesos en formato de fichero unico, lo que simplifica el despliegue en servidores con ComfyUI y la generacion por lotes mediante la API de ComfyUI.
- Experimentacion en investigacion sobre difusion: al estar los componentes separados (UNet, text encoder, VAE) y disponibles en varias precisiones, es util para estudiar el impacto de la cuantizacion int8/fp8/fp4 en la calidad de la imagen generada.
- Educacion y demos de IA generativa: la instalacion por copia de ficheros en carpetas conocidas y los workflows listos para cargar reducen la barrera para talleres y cursos practicos.
- Entornos con VRAM limitada: la variante int8 con convrot y el text encoder fp4 mixed permiten ejecutar el modelo en GPU de consumo donde la version bf16 no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 36 GB e incluye todas las variantes (bf16 e int8 del UNet, tres variantes del text encoder y el VAE); la VRAM necesaria para inferencia es inferior al tamano del repositorio, pero no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponibles. La existencia de variantes int8, fp8 y fp4 sugiere orientacion a GPU de consumo, pero no se confirma en la informacion.
- Cabe en GPU de consumo: probablemente si con la variante int8 y el text encoder cuantizado, aunque no se dispone de cifras oficiales.
- Opciones de despliegue: ComfyUI es el destino principal (carpetas `models/diffusion_models`, `models/text_encoders` y `models/vae`). No se documentan otros runners (vLLM, llama.cpp, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado para ComfyUI; la fuente autoritativa y la documentacion del modelo original estan en `Tongyi-MAI/Z-Image`. Cualquier actualizacion o correccion del modelo debe consultarse alli.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni limitaciones de idioma en la informacion disponible; al ser un modelo de difusion, los sesgos del dataset de entrenamiento pueden reflejarse en las imagenes generadas.
- La calidad y el comportamiento de la variante int8 con convrot pueden diferir de la bf16; no se han publicado metricas comparativas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo original en `Tongyi-MAI/Z-Image` antes de redistribuir pesos derivados.
- El repositorio de 36 GB incluye multiples variantes; descargar solo los ficheros necesarios para el workflow elegido.
- No se dispone de informacion sobre resoluciones de salida soportadas, pasos de muestreo recomendados ni schedulers compatibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/z_image
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Workflow texto a imagen (bf16): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image.json
- Workflow texto a imagen (int8): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_int8.json

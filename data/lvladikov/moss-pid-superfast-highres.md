# lvladikov/MOSS-PiD-SuperFast-HighRes

## Resumen

MOSS-PiD-SuperFast-HighRes no es un modelo en sí mismo, sino un paquete de dos flujos de trabajo (workflows) para ComfyUI, publicado por el usuario lvladikov en Hugging Face, que combina dos etapas para generar imágenes de alta resolución en muy pocos pasos. En la primera etapa, MOSS-Image SFT (del equipo OpenMOSS-Team), acelerado con un LoRA de 4 pasos de akhaliq, genera un borrador a baja resolución (por defecto 704×384). En la segunda, PiD (Pixel Diffusion Decoder) de NVIDIA decodifica ese latente directamente a una imagen 4 veces mayor en cada lado (2816×1536 por defecto), sin pasar por un VAE ni por un upscaler independiente.

La relevancia de este enfoque está en el coste computacional: el modelo grande trabaja sobre 1/16 de los píxeles de la salida final (1.056 tokens de imagen frente a 16.896 en el ejemplo por defecto), y el decodificador PiD, mucho más pequeño, completa el trabajo a resolución completa en 4 pasos adicionales. El resultado es una generación text-to-image de hasta 4K con tan solo 8 pasos totales de difusión.

El repositorio incluye los workflows en JSON (versión local y para Comfy Cloud), un script de Python basado en diffusers y 100 imágenes de ejemplo con sus prompts. La licencia es Apache 2.0 y el tamaño del repositorio es de 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline en dos etapas: MOSS-Image SFT (difusión latente) + PiD (Pixel Diffusion Decoder, DiT en espacio de píxeles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (por defecto); alternativas int8 (`moss_image_sft_int8_convrot`, `qwen3.5_9b_int8_convrot`) y fp8 escalado (`gemma_2_2b_it_elm_fp8_scaled`) |
| Idiomas soportados | no disponible (los prompts funcionan mejor como descripciones largas de escena) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Componentes empleados por el workflow:

| Componente | Archivo | Tamano | Rol |
|---|---|---|---|
| MOSS-Image SFT | `moss_image_sft_bf16.safetensors` | 10,2 GB | Modelo de difusión principal |
| Codificador de texto | `qwen3.5_9b_bf16.safetensors` | 19,3 GB | Codificación del prompt para MOSS |
| VAE | `flux2-vae.safetensors` | 0,3 GB | Decodificación del borrador de vista previa |
| LoRA 4 pasos | `moss_image_sft_4step_v2.0.safetensors` | 1,2 GB | Aceleración de MOSS a 4 pasos |
| PiD | `pid_1.5_flux2_1024_to_4096_4step_bf16.safetensors` | 2,8 GB | Decodificador a resolución completa (2K→4K) |
| Codificador de texto PiD | `gemma_2_2b_it_elm_bf16.safetensors` | 5,2 GB | Codificación del prompt para PiD |

## Arquitectura y entrenamiento

El sistema encadena dos modelos de difusión. El primero, MOSS-Image SFT, es un modelo text-to-image que opera en espacio latente (usa el VAE de FLUX.2, con latentes de 128 canales) y está condicionado por el codificador de texto Qwen3.5 9B. El LoRA de 4 pasos de akhaliq lo destila para producir resultados aceptables en 4 pasos con CFG 1 y muestreador euler/simple. El segundo, PiD de NVIDIA, es un decodificador de difusión en píxeles (PixelDiT) que toma el latente pequeño y el prompt (codificado por Gemma 2 2B IT con ELM) y genera directamente la imagen a 4× la anchura y altura, en 4 pasos con muestreador lcm/simple. PiD no necesita archivo VAE: usa el VAE `pixel_space` integrado en ComfyUI.

Sobre el entrenamiento de los modelos subyacentes (numero de tokens, composición de datasets, RLHF/DPO) no se ha publicado informacion en la model card del repositorio. Sí se indica que el decodificador PiD 2K→4K v1.5 está entrenado para salidas entre 2K y 4K, y que existe una variante `pid_flux2_512_to_2048_4step_bf16` para salidas de hasta 2048 px.

## Capacidades

- Generacion de imagenes text-to-image en dos etapas: borrador a baja resolucion con MOSS-Image y salida final a 4x con PiD.
- Resoluciones de salida configurables: 2816×1536 (por defecto), 3072×1728, 4096×2304, 2048×2048, o cualquier tamano cuyo borrador sea multiplo de 16.
- Generacion muy rapida: 4 pasos en la etapa MOSS y 4 pasos en la etapa PiD, ambos con CFG 1.
- Uso del mismo prompt para ambas etapas; funciona mejor con descripciones largas y especificas (sujeto, escenario, luz, materiales, estilo) que con etiquetas cortas.
- Dos modos de ejecucion: workflows JSON para ComfyUI local y Comfy Cloud, y script Python (`moss-pid-generate.py`) con diffusers sobre GPU NVIDIA (CUDA).
- Compatibilidad con cuantizaciones alternativas (int8, fp8) para reducir los requisitos de memoria.
- Solo nodos core de ComfyUI: no requiere nodos personalizados.

## Casos de uso

- Generacion de fondos e ilustraciones en 4K para diseno grafico: el pipeline produce salidas de hasta 4096×2304 en 8 pasos totales, adecuado cuando se necesita resolucion de impresion o pantallas de alta densidad sin esperar minutos de muestreo.
- Prototipado rapido de conceptos visuales: el borrador de MOSS a 704×384 sirve de vista previa inmediata mientras PiD genera la version final, ideal para iterar prompts en sesiones de brainstorming.
- Generacion de assets para videojuegos: la variante PiD 512→2048 permite obtener texturas e ilustraciones de hasta 2048 px con menos carga de VRAM, util para cuadrados tipo 512×512 → 2048×2048.
- Produccion automatizada en lote: el script Python con diffusers permite integrar el pipeline en scripts de generacion masiva o pipelines CI/CD para crear imagenes programaticamente en GPU NVIDIA.
- Uso sin GPU local mediante Comfy Cloud: el workflow `cloud.json` ejecuta el pipeline en la infraestructura de Comfy, importando solo dos archivos (el LoRA de 4 pasos y el decodificador PiD).
- Comparacion y evaluacion de estilos: los 100 ejemplos incluidos con sus prompts permiten calibrar como redactar descripciones largas y especificas para obtener mejores resultados.
- Upscaling generativo integrado: al decodificar PiD directamente desde el latente (sin VAE ni upscaler separado), se evita el paso tipico de super-resolucion, simplificando el flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia operativa, el pipeline completo requiere 4 pasos de muestreo para el borrador de MOSS-Image y 4 pasos para la decodificacion PiD, ambos con CFG 1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con los pesos bf16 por defecto, solo los modelos suman unos 39 GB (MOSS 10,2 GB + Qwen3.5 19,3 GB + VAE 0,3 GB + LoRA 1,2 GB + PiD 2,8 GB + Gemma 5,2 GB), por lo que se requiere una GPU de gama alta (32-48 GB) o usar las variantes cuantizadas (int8/fp8 reducen el conjunto a unos 20,6 GB).
- GPU recomendadas: no disponible explicitamente; el script Python requiere GPU NVIDIA con CUDA. Con las variantes int8/fp8, GPUs de consumo con 24 GB de VRAM (RTX 3090/4090) son candidatas razonables, aunque sin confirmacion del autor.
- Opciones de despliegue:
  - ComfyUI local (workflows JSON, solo nodos core; actualizar ComfyUI a una version con soporte de MOSS-Image y PiD).
  - Comfy Cloud (importando el LoRA y el decodificador PiD a la biblioteca de modelos).
  - Script Python con diffusers y el codigo de PiD de NVIDIA (`moss-pid-generate.py`).
  - No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de pipeline de imagen).
- Latencia y throughput estimados: no disponibles. El diseno de 8 pasos totales y la reduccion a 1/16 de pixeles en la etapa pesada indican tiempos de generacion notablemente inferiores a los de un renderizado directo a 4K.

## Comparativa con modelos similares

| Aspecto | MOSS-PiD-SuperFast-HighRes (workflow) | Pipeline text-to-image estandar con upscaler | SDXL Turbo / LCM (generacion en pocos pasos) |
|---|---|---|---|
| Tipo | Workflow ComfyUI en dos etapas (MOSS-Image + PiD) | Modelo de difusion + upscaler independiente | Modelos de difusion destilados |
| Pasos totales | 8 (4 + 4) | Tipicamente 20-50 + pasos del upscaler | 1-8 |
| Resolucion maxima | Hasta 4096×2304 (PiD 2K→4K) | Depende del upscaler | Tipicamente ~1024 px nativos |
| Decodificacion | PiD genera pixeles directamente desde el latente, sin VAE final ni upscaler | VAE + upscaler separado | VAE estandar |
| Licencia | Apache 2.0 | Variable segun el modelo | Variable segun el modelo |
| Requiere ComfyUI | Si (o script Python con diffusers) | No necesariamente | No necesariamente |

Alternativa interna del propio repositorio: para salidas de hasta 2048 px, sustituir el decodificador PiD 2K→4K por `pid_flux2_512_to_2048_4step_bf16`, entrenado especificamente para ese rango.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere ComfyUI actualizado (con soporte de MOSS-Image y PiD) o el script Python con diffusers; no funciona de forma aislada.
- Los pesos completos en bf16 suman unos 39 GB, lo que exige GPUs de gama alta o recurrir a las variantes int8/fp8; sin confirmacion del autor sobre VRAM minima real.
- El decodificador PiD 2K→4K está entrenado para salidas entre 2K y 4K: usarlo fuera de ese rango puede degradar la calidad; para salidas menores existe la variante 512→2048.
- Los tamanos del borrador de MOSS deben ser multiplos de 16.
- El pipeline funciona mejor con prompts largos y descriptivos; prompts cortos tipo etiquetas dan peores resultados.
- El script Python solo funciona en GPU NVIDIA (CUDA), sin soporte documentado de CPU, AMD o Apple Silicon.
- No hay informacion sobre sesgos del modelo, riesgo de alucinacion ni limitaciones de idioma de los prompts en la model card.
- El repositorio es muy reciente y de uso reducido (16 descargas y 8 likes en el momento de los datos), por lo que carece de validacion comunitaria amplia.
- La licencia Apache 2.0 del workflow no cubre necesariamente las condiciones de uso de los modelos subyacentes (MOSS-Image, PiD, Qwen3.5, Gemma 2, FLUX.2 VAE), cuyas licencias deben revisarse por separado para uso comercial.

## Enlaces

- Repositorio del workflow: https://huggingface.co/lvladikov/MOSS-PiD-SuperFast-HighRes
- MOSS-Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA de 4 pasos de akhaliq: https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- PiD (Pixel Diffusion Decoder) de NVIDIA: https://huggingface.co/nvidia/PiD
- Pesos de MOSS-Image para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- Pesos de PixelDiT para ComfyUI: https://huggingface.co/Comfy-Org/PixelDiT

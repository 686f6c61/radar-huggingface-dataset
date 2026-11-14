# DeVilDoNia/HaDeS-MOSS-v1.0-Turbo

## Resumen

HaDeS MOSS v1.0 Turbo es un checkpoint de difusion texto-a-imagen de un solo archivo, derivado de OpenMOSS-Team/MOSS-Image-Base, publicado por el usuario DeVilDoNia (HaDeS). El modelo está pensado para su uso directo en ComfyUI y permite generar imágenes en 8 pasos con CFG 1.0 sin necesidad de aplicar LoRAs adicionales, ya que dos LoRAs (HaDeS MOSS Turbo 8-steps v1.0 y QwenLook Base) están horneadas directamente en los pesos de difusión.

El archivo se distribuye en un único safetensors de precisión BF16 con un tamaño de 10,16 GB (9,47 GiB) y contiene únicamente el modelo de difusión: no incluye el codificador de texto ni el VAE, que deben cargarse por separado desde Comfy-Org/MOSS-Image. La construcción parte del checkpoint Base (no del SFT) y aplica las LoRAs con MOSS Model Saver mediante redondeo estocástico, dejando la receta escrita en la cabecera del propio archivo.

El modelo es relevante para desarrolladores que trabajan con MOSS-Image en ComfyUI y buscan una inferencia rápida (8 pasos) con un solo archivo, evitando la gestión de LoRAs en tiempo de ejecución. La licencia Apache 2.0 facilita su integración tanto en prototipos como en producción, aunque el autor advierte de que la evaluación se limita a 20 pares de imágenes con una sola semilla por prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (MOSS-Image), derivado por fusion de LoRAs sobre MOSS-Image-Base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen) |
| Tipos de cuantizacion | BF16 (unico formato publicado; 10,16 GB / 9,47 GiB) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, formato ComfyUI diffusion model) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusion para generacion de imagenes a partir de texto, construido sobre MOSS-Image-Base en BF16. La construccion consiste en la aplicacion secuencial de dos LoRAs sobre los pesos del modelo base y su posterior fusion con MOSS Model Saver en BF16 con redondeo estocastico. La receta queda registrada en la cabecera del archivo bajo la clave `hades/recipe`.

La primera LoRA es HaDeS MOSS Turbo 8-steps v1.0, una LoRA DMD de ocho pasos entrenada sobre el modelo Base, aplicada con fuerza 1.00. La segunda es QwenLook Base, una LoRA texto-a-imagen no publicada por separado, de rango 32, entrenada durante 1000 pasos a 1024 px sobre 1833 imagenes generadas por Qwen-Image-Edit 2509 (junto con la LoRA Qwen-Image-Lightning) a partir de escenas de MOSS-Image-SFT, cada una con su prompt de escena como caption; tambien se aplica con fuerza 1.00. No se especifican en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion de su dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en 8 pasos de muestreo con CFG 1.0, usando sampler Euler y scheduler simple, con flow shift 5.
- Generacion de imagenes de alta resolucion: los ejemplos de referencia se generaron a 1344 x 1792 (aproximadamente 2,4 MP); el autor indica que rinde mejor por encima de 1,5 MP.
- Estilos variados demostrados en los ejemplos: fotografia (diner, retrato, pastor), poster de viaje, key visual de anime, flamenco en blanco y negro.
- Integracion directa en ComfyUI mediante Load Diffusion Model o el MOSS Loader del HaDeS MOSS Suite.
- No incluye capacidades de texto, codigo, vision, tool calling ni agentes: es exclusivamente un modelo de difusion texto-a-imagen.
- No se documentan capacidades multilingues; todos los prompts de ejemplo estan en ingles.

## Casos de uso

- Generacion rapida de imagenes en ComfyUI: el archivo se coloca en `ComfyUI/models/diffusion_models/` y se carga con Load Diffusion Model, sin necesidad de aplicar LoRAs adicionales, lo que simplifica los flujos de trabajo y reduce el consumo de VRAM frente a la carga dinamica de LoRAs.
- Prototipado de conceptos visuales: con 8 pasos y CFG 1.0 se obtienen imagenes en un numero reducido de evaluaciones del modelo, adecuado para iterar rapidamente sobre ideas de diseno o ilustracion.
- Ilustracion editorial y carteles: los ejemplos incluyen un poster de viaje ("VISIT EUROPA") y una key visual de anime, lo que lo hace util para generar borradores de material grafico con estilos definidos.
- Fotografia sintetica de referencia: los ejemplos de retratos y escenas fotograficas (diner, desierto, pastor) sirven para generar imagenes de referencia en tableros de moodboard o presentaciones.
- Generacion de imagenes de alta resolucion para impresion o pantallas grandes: el autor reporta mejores resultados por encima de 1,5 MP y los ejemplos se generaron a 1344 x 1792.
- Integracion en pipelines automatizados de generacion por lotes: al ser un unico archivo safetensors con receta embebida, facilita la versionada y el despliegue reproducible en entornos ComfyUI.
- Generacion de escenas con texto visible: la evaluacion del autor incluye prompts con texto en una pizarra y una infografia, aunque advierte que el texto pequeno y las escenas concurridas requieren revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al tratarse de un modelo de generacion de imagenes. La model card incluye evaluaciones subjetivas y medidas internas del autor:

| Evaluacion | Resultado |
|---|---|
| Preferencia v1.0 frente a v0.9.4 Turbo (20 prompts, 1 semilla, 8 pasos, CFG 1, 1344 x 1792) | v1.0 preferido en 16 de 20 pares; v0.9.4 en 4 |
| Varianza laplaciana con QwenLook (fotografias) | 39 sin LoRA frente a 77 con LoRA |
| Varianza laplaciana con QwenLook (ilustraciones) | 114 sin LoRA frente a 271 con LoRA |
| Proporcion de alta frecuencia en la imagen | 1,9 % sin LoRA frente a 3,7 % con LoRA |
| Juicio "es una fotografia real" (Qwen3.5-9B, 16 fotografias) | Si en 15 de 16 sin LoRA; si en 2 de 16 con LoRA |
| Comparacion con LoRAs aplicadas en vivo (20 prompts, mismas semillas) | Misma composicion y nitidez (varianza laplaciana media 77,7 frente a 77,1) |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de difusion en BF16 ocupa 10,16 GB, por lo que se necesita al menos esa cantidad solo para los pesos de difusion, mas la VRAM del codificador de texto (qwen3.5_9b_int8_convrot.safetensors) y del VAE (flux2-vae.safetensors). No se proporciona una cifra total de VRAM en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del checkpoint, una GPU consumer de 24 GB (RTX 4090) o superior es el minimo razonable, pero el autor no lo confirma.
- Cabe en GPU consumer: no confirmado; el peso del archivo (10,16 GB) sugiere que puede caber en GPUs de 16 GB o mas solo si se gestionan cuidadosamente el text encoder y el VAE, pero no hay datos medidos.
- Opciones de despliegue: ComfyUI (Load Diffusion Model o MOSS Loader del HaDeS MOSS Suite). No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) para este modelo de difusion.
- Latencia y throughput: no disponibles. El modelo esta disenado para 8 pasos de muestreo, lo que reduce el coste computacional frente a modelos de 20-50 pasos, pero no se aportan medidas de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaDeS MOSS v1.0 Turbo | no disponible | no aplica | Preferido en 16/20 pares frente a v0.9.4 (evaluacion del autor) | Apache 2.0 | Hugging Face, single-file safetensors |
| HaDeS MOSS v0.9.4 Turbo | no disponible | no aplica | Base de comparacion; preferido en 4/20 pares | Apache 2.0 (segun tag de licencia del autor) | Hugging Face, sigue disponible |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no aplica | Modelo base sin LoRAs Turbo | no disponible en la informacion proporcionada | Hugging Face |
| MOSS-Image-SFT | no disponible | no aplica | Checkpoint SFT; no es la base de este modelo | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de benchmarks objetivos ni de comparaciones con otros modelos texto-a-imagen (por ejemplo, Flux, SDXL o Qwen-Image) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo conocido: con el prompt "photograph of a woman sitting in a cafe" sin etnia especificada, 16 semillas a 8 pasos dieron aproximadamente 1 rostro de Asia Oriental de 16 (frente a 9-11 en v0.9.4); las 16 mujeres son muy similares entre si (jovenes, pelo largo ondulado castano, sonriendo a camara). Se recomienda describir a la persona cuando importe.
- Riesgo de alucinacion visual: manos, texto pequeno y escenas concurridas requieren revision individual de cada salida.
- Limitaciones de contexto e idioma: no se documentan capacidades multilingues; los prompts de ejemplo estan en ingles. No hay datos sobre rendimiento con prompts en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de MOSS-Image-Base y de LoRAs del autor; conviene verificar las condiciones de los modelos base y de las LoRAs originales antes de un despliegue comercial.
- Caveat de evaluacion: la comparacion con v0.9.4 se basa en 20 prompts con una sola semilla y un unico revisor, por lo que muestra una preferencia en esos prompts, no una superioridad general.
- Caveat de ajustes: solo se han medido los ajustes de referencia (8 pasos, CFG 1,0, 1344 x 1792, Euler/simple, flow shift 5). No se han medido otros numeros de pasos, CFG superior a 1 ni otros tamanos; las impresiones del autor (mejor por encima de 1,5 MP, CFG 1,2-1,5) no estan medidas.
- Diferencia frente a LoRAs en vivo: con las mismas semillas y 20 prompts, las composiciones y la nitidez coinciden, pero pueden diferir detalles pequenos por el redondeo amplificado en 8 pasos (en una imagen desaparecio una pistola en una mano).
- El archivo no incluye el codificador de texto ni el VAE; es imprescindible cargarlos por separado desde Comfy-Org/MOSS-Image.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-v1.0-Turbo
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- LoRA HaDeS MOSS Turbo 8-steps v1.0: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-Turbo
- Version anterior HaDeS MOSS v0.9.4 Turbo: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-v0.9.4-Turbo
- Archivos complementarios (text encoder y VAE): https://huggingface.co/Comfy-Org/MOSS-Image
- Repositorio HaDeS MOSS Suite: https://github.com/Devildonia/HaDeS-MOSS-Suite

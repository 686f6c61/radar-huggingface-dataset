# Comfy-Org/Qwen3.5

## Resumen

Qwen3.5 es una familia de modelos de lenguaje de la serie Qwen, desarrollada por el equipo Qwen de Alibaba. El repositorio analizado, `Comfy-Org/Qwen3.5`, no es el modelo original, sino un reempaquetado de los pesos de las variantes de 2B, 4B y 9B en formato de fichero unico (`safetensors`) para su uso como codificadores de texto (`text_encoders`) dentro de ComfyUI. El autor del reempaquetado es Comfy-Org, la organizacion que mantiene ComfyUI.

El interes de este repositorio es practico: permite a los usuarios de ComfyUI disponer de los pesos de Qwen3.5 en variantes bf16, int8 y w4a8 (GPTQ) sin tener que convertir manualmente los checkpoints originales. El repositorio acumula 283.767 descargas y 58 likes, lo que indica una adopcion considerable dentro del ecosistema ComfyUI.

La informacion disponible sobre el modelo original es limitada: la model card del reempaquetado solo enlaza a los repositorios oficiales de Qwen (2B, 4B y 9B) y describe la ubicacion de los ficheros. No se detallan en esta fuente la arquitectura, el contexto, los datos de entrenamiento ni los benchmarks del modelo original, por lo que esos apartados se marcan como no disponibles cuando no hay dato verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3.5, familia de modelos de lenguaje de Qwen) |
| Parametros totales | 2B, 4B y 9B (tres variantes incluidas en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (2B, 4B, 9B), int8 con `convrot` (9B), w4a8 GPTQ (9B) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (fichero unico para ComfyUI, libreria `diffusion-single-file`) |

## Arquitectura y entrenamiento

No se han publicado en la informacion disponible detalles sobre la arquitectura interna del modelo original Qwen3.5 (tipo de transformer, atencion, posibles componentes MoE, etc.). El repositorio de Comfy-Org es exclusivamente un reempaquetado: toma los checkpoints de `Qwen/Qwen3.5-2B`, `Qwen/Qwen3.5-4B` y `Qwen/Qwen3.5-9B` y los publica como ficheros `safetensors` individuales pensados para la carpeta `ComfyUI/models/text_encoders/`.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el numero de tokens, el uso de RLHF/DPO ni innovaciones tecnicas especificas. La unica informacion tecnica adicional es la existencia de variantes cuantizadas para la version de 9B: una int8 con `convrot` y una w4a8 GPTQ, orientadas a reducir el consumo de memoria en inferencia dentro de ComfyUI.

## Capacidades

- Codificacion de texto para pipelines de ComfyUI: el uso previsto en este repositorio es servir como `text_encoder` en flujos de generacion (por ejemplo, modelos de difusion que consumen embeddings de texto).
- Generacion de texto y comprension del lenguaje: heredadas del modelo base Qwen3.5, aunque no se detallan en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Codificacion de prompts en ComfyUI: colocar `qwen3.5_2b_bf16.safetensors` en `models/text_encoders/` permite usar la variante de 2B como codificador de texto en flujos de generacion, con un coste de memoria reducido.
- Flujos de mayor calidad con la variante de 9B: usar `qwen3.5_9b_bf16.safetensors` cuando se necesita un codificador de texto de mayor capacidad, a cambio de mas VRAM.
- Despliegue en GPUs con memoria limitada: la variante `qwen3.5_9b_int8_convrot.safetensors` reduce el peso del codificador respecto a bf16, adecuada para equipos con 16-24 GB de VRAM.
- Despliegue en GPUs de gama consumer con cuantizacion agresiva: `qwen3.5_9b_w4a8_gptq.safetensors` permite cargar el codificador de 9B en configuraciones con menos memoria, a costa de posible perdida de fidelidad en los embeddings.
- Estandarizacion de entornos ComfyUI en equipos: al ser un reempaquetado oficial de Comfy-Org, facilita que varios usuarios de un mismo estudio trabajen con los mismos ficheros y rutas, evitando conversiones manuales.
- Evaluacion comparativa de codificadores de texto: disponer de 2B, 4B y 9B en el mismo repositorio permite comparar el impacto del tamano del codificador en la calidad de salida de un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, segun el tamano de los pesos en bf16): 2B ~4-5 GB; 4B ~8-9 GB; 9B ~18-20 GB, mas el coste de activaciones y del resto del pipeline de ComfyUI.
- Variante int8 del 9B: aproximadamente la mitad del peso en bf16 (~9-10 GB), mas overhead.
- Variante w4a8 GPTQ del 9B: peso de pesos en torno a 4-5 GB, pensada para GPUs con menos memoria.
- GPU recomendadas: RTX 4090 (24 GB) para el 9B en bf16; RTX 3090/4080 (16-24 GB) para el 9B en int8; GPUs de 8-12 GB para el 2B/4B en bf16 o el 9B en w4a8.
- Despliegue: el uso previsto es ComfyUI (carpeta `models/text_encoders/`). No se documentan en esta fuente opciones como vLLM, llama.cpp, Ollama o TGI para estos ficheros reempaquetados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Comfy-Org/Qwen3.5 (este repo) | 2B / 4B / 9B | no disponible | Apache 2.0 | safetensors single-file | Hugging Face, integrado en ComfyUI |
| Qwen/Qwen3.5-2B (original) | 2B | no disponible | Apache 2.0 | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (original) | 4B | no disponible | Apache 2.0 | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (original) | 9B | no disponible | Apache 2.0 | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con modelos de otras familias.

## Limitaciones y advertencias

- Este repositorio no es el modelo original: es un reempaquetado para ComfyUI. Para documentacion completa del modelo conviene consultar los repositorios oficiales de Qwen.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones idiomaticas en la informacion disponible.
- Las variantes cuantizadas (int8 `convrot` y w4a8 GPTQ) pueden degradar la calidad de los embeddings respecto a bf16; conviene validar el pipeline antes de usarlas en produccion.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse en los repositorios originales de Qwen cualquier condicion adicional aplicable al modelo base.
- El tamano del repo (78,9 GB) implica una descarga considerable; conviene descargar solo las variantes necesarias.
- No hay informacion sobre contexto maximo, idiomas o capacidades de tool calling en esta fuente; no deben asumirse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Qwen3.5
- Modelo original 2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo original 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo original 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI

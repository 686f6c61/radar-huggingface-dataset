# NoiseToNova/Flux-3-Klein-turbo-pdd-4_8-steps

## Resumen

Flux-3-Klein-turbo-pdd-4_8-steps es un adaptador LoRA de pocos pasos (few-step) desarrollado por NoiseToNova sobre el modelo base FLUX.3 klein base de Black Forest Labs. Su objetivo es resolver el principal cuello de botella de la generación de imágenes por difusión: la lentitud de la inferencia. Mediante una técnica llamada Parallel Decoding Distillation (PDD), descrita en el artículo arXiv 2607.26004, el modelo destila el proceso de muestreo del modelo base para generar imágenes en 8 o 4 pasos en lugar de los 50 habituales, incorporando además la classifier-free guidance (CFG) del profesor (CFG 4) dentro del propio adaptador, de modo que cada paso requiere una única pasada hacia adelante.

El resultado es una aceleración de entre 6 y 12 veces en el número de pasos de muestreo, manteniendo capacidades clave del modelo base como el control por cajas (box control) y la renderización de texto en imágenes. Se trata de la versión v0.1, entrenada específicamente para text-to-image a resolución 1K con múltiples relaciones de aspecto, y soporta saltos sobre una rejilla de entrenamiento de 128 pasos (saltos de 16 y 32 pasos).

Es relevante porque representa un enfoque de destilación que no requiere reentrenar el modelo completo: al ser un LoRA de rango 128 con un banco de cabezas de salida (proj_out), puede aplicarse sobre el modelo base existente, lo que reduce el coste de despliegue y permite combinarlo con el ecosistema FLUX.3 ya disponible en diffusers y ComfyUI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128) sobre modelo de difusión FLUX.3 klein base, con banco de cabezas de salida (proj_out) destiladas mediante PDD |
| Parametros totales | no disponible (tamaño del repositorio: 1,9 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del modelo base se distribuyen en bf16) |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license (otra, heredada del modelo base) |
| Formato de pesos | safetensors (LoRA con claves PEFT y versión adaptada a ComfyUI) |

## Arquitectura y entrenamiento

El adaptador se entrena con Parallel Decoding Distillation (PDD), una técnica de destilación de la trayectoria de muestreo. El LoRA tiene rango 128 y se acompaña de `proj_out.weight`, un banco de cabezas de salida con una cabeza por paso de la rejilla de entrenamiento (una rejilla de 128 pasos con sigmas ya desplazados), que se fusiona por salto en tiempo de inferencia. Esto permite que el estudiante ejecute saltos de 16 pasos (8 pasos de inferencia) o de 32 pasos (4 pasos de inferencia) sobre la trayectoria del profesor, que usaba 50 pasos.

La destilación se realizó en la tarea de text-to-image a resolución 1K con múltiples relaciones de aspecto, con un CFG del profesor de 4 destilado en el adaptador (en inferencia se configura cfg=1). El modelo base recomendado para los prompts es flux-3-image-klein-pup, un prompt upsampler de Black Forest Labs que se usa para enriquecer los prompts antes de la generación, tal como recomienda la model card del modelo base. No hay información disponible sobre el número de imágenes de entrenamiento ni el hardware empleado.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en 8 o 4 pasos, frente a los 50 del modelo base.
- Renderización de texto dentro de las imágenes, heredada del modelo base.
- Control por cajas (box control), heredado del modelo base.
- Compatibilidad con image-to-image, aunque con caída de calidad respecto al modelo base en esta versión (se promete corrección en futuras versiones).
- Modo de previsualización rápida con 2 pasos, con baja resolución de detalle, útil para exploración de composición.
- Compatibilidad con diffusers (mediante un wrapper de Python) y con ComfyUI (nodo ComfyUI-Flux3-PDD y workflow incluido).
- Uso del prompt upsampler flux-3-image-klein-pup para mejorar los prompts de entrada.

## Casos de uso

- Generación rápida de imágenes en producción: al reducir el muestreo de 50 a 4 u 8 pasos, es adecuado para servicios web de generación de imágenes donde la latencia por imagen es crítica, multiplicando el throughput por GPU.
- Previsualización iterativa de composición: el modo de 2 pasos permite explorar rápidamente composiciones y prompts antes de lanzar la generación final de 8 pasos con todo el detalle.
- Renderizado de texto en imágenes: hereda la capacidad del modelo base de generar texto legible dentro de las imágenes, útil para carteles, maquetas y creatividades publicitarias.
- Generación con control espacial (box control): permite posicionar elementos en regiones concretas de la imagen, adecuado para flujos de diseño asistido donde se requiere composición controlada.
- Integración en ComfyUI para flujos de trabajo creativos: se incluye un workflow JSON y un nodo específico, lo que facilita su adopción por estudios y creadores que ya usan ComfyUI.
- Pipelines automatizados con diffusers: el wrapper de Python permite integrar el modelo en scripts y servicios backend basados en diffusers para generación batch de imágenes con múltiples relaciones de aspecto.
- Generación de imágenes de producto y bodegones: los ejemplos de la model card (bodegón holandés, tarta de fresas, paisajes alpinos) muestran buen resultado en fotografía de producto y paisaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. La model card incluye una comparación visual side-by-side de 128 prompts (text-to-image, image-to-image y box control) en el Space [NoiseToNova/flux3-turbo-pdd](https://huggingface.co/spaces/NoiseToNova/flux3-turbo-pdd), que es la referencia de calidad disponible. En cuanto a rendimiento de inferencia, el modelo genera en 8 pasos (calidad recomendada) o 4 pasos (más rápido), frente a los 50 pasos del modelo base, con CFG destilado (cfg=1 en inferencia).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; el modelo base FLUX.3 klein se distribuye en bf16 (diffusion model, text encoder Qwen3-VL 4B, prompt upsampler Qwen3.5 9B y VAE), por lo que se recomienda una GPU con al menos 24 GB de VRAM para ejecutar el conjunto completo en bf16.
- GPU recomendadas: RTX 4090 o RTX 5090 para uso local; A100 o H100 para despliegue en servidor. No disponible una cifra oficial.
- Consumer GPU: dado que el adaptador añade solo 1,9 GB sobre el modelo base, el requisito dominante es el del modelo base; con cuantización del modelo base (no proporcionada en este repositorio) podría caber en GPUs de 16-24 GB, pero no hay datos oficiales.
- Opciones de despliegue: diffusers (versión desde main, con soporte FLUX.3, más peft) mediante el wrapper PDD incluido en la model card, y ComfyUI 0.42 o superior con el nodo personalizado ComfyUI-Flux3-PDD. No se menciona soporte para vLLM, TGI, llama.cpp u Ollama (no aplicables a modelos de difusión en el caso de llama.cpp/Ollama).
- Latencia y throughput: no disponibles como cifras; la reducción de 50 a 4 u 8 pasos implica una aceleración teórica de entre 6 y 12 veces en el tiempo de muestreo respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | CFG destilada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flux-3-Klein-turbo-pdd-4_8-steps | LoRA few-step sobre FLUX.3 klein base | 4 u 8 (2 para preview) | Sí (profesor CFG 4) | flux-kommunity-license | diffusers, ComfyUI |
| FLUX.3 klein base (modelo base) | Modelo de difusión completo | 50 | No (CFG externa) | flux-kommunity-license | diffusers, ComfyUI |
| Otras variantes turbo de FLUX (p. ej. destilaciones oficiales) | Adaptadores few-step | no disponible | no disponible | flux-kommunity-license | no disponible |

No hay datos comparativos de calidad cuantitativos publicados; la comparación disponible es la visual de 128 prompts en el Space del autor.

## Limitaciones y advertencias

- Calidad en rostros: el modelo base es débil en caras, especialmente en rostros que no son el sujeto principal (caras pequeñas o lejanas en escenas de actividad humana); esta versión hereda el mismo problema.
- Image-to-image degradado: la calidad en image-to-image es inferior a la del modelo base en esta versión v0.1; el autor indica que se corregirá en una versión posterior.
- Pasos fijos: solo se soportan 8 y 4 pasos (los saltos de la rejilla de entrenamiento, 16 y 32 sobre una rejilla de 128 pasos); otros valores de pasos no están soportados oficialmente, y 2 pasos se considera solo una previsualización de baja calidad.
- CFG restringida: al ser un LoRA con CFG destilada, debe usarse cfg=1; valores superiores son territorio sin explorar y pueden degradar el resultado.
- Licencia: se rige por la flux-kommunity-license del modelo base, que impone restricciones sobre el uso comercial y la generación de contenido; conviene revisar el documento de licencia antes de cualquier despliegue comercial.
- Dependencia de versiones: requiere diffusers desde main (soporte FLUX.3), peft, y ComfyUI 0.42 o superior con un nodo de terceros, lo que puede suponer fricción de mantenimiento en producción.
- Riesgo de alucinación visual y sesgos: como todo modelo text-to-image, puede generar contenido inesperado o sesgado; no hay evaluaciones de sesgo publicadas para este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NoiseToNova/Flux-3-Klein-turbo-pdd-4_8-steps
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Paper de Parallel Decoding Distillation (PDD): https://arxiv.org/pdf/2607.26004
- Space de comparación side-by-side: https://huggingface.co/spaces/NoiseToNova/flux3-turbo-pdd
- Prompt upsampler recomendado: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Pesos del modelo base para ComfyUI: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Nodo de ComfyUI: https://github.com/maxs-kan/ComfyUI-Flux3-PDD
- Licencia del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/blob/main/LICENSE.md

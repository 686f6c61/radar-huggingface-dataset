# ShimaRinC/StepX-OPD-SD3.5

## Resumen

StepX-OPD-SD3.5 es un adaptador LoRA para Stable Diffusion 3.5 Medium que convierte el modelo base de texto a imagen en un generador de cuatro pasos sin guiado por clasificador (classifier-free guidance). Lo publica ShimaRinC a partir del metodo StepX-OPD descrito en el paper "StepX-OPD: Rethinking Multi-Teacher On-Policy Distillation in Diffusion Models" (arXiv:2611.04386), y el ajuste fino lo realiza StepFun AI. El objetivo es reducir el coste de inferencia: en lugar de decenas de pasos con CFG, el modelo produce imagenes con solo cuatro evaluaciones del transformer y `guidance_scale=1.0`.

Tecnicamente no es un modelo completo, sino un LoRA de rango 192 (160 de inicializacion aditiva mas 32 del adaptador entrenado) que se aplica sobre `stabilityai/stable-diffusion-3.5-medium`. El repositorio pesa 2,9 GB e incluye tanto el LoRA fusionado listo para inferencia (`pytorch_lora_weights.safetensors`) como el directorio `additive_init/` con la inicializacion PEFT en float32 que se usa como punto de partida para reentrenar. La relevancia actual esta en la destilacion on-policy multi-profesor aplicada a modelos de difusion, una linea de trabajo que busca acelerar samplers manteniendo fidelidad visual.

La licencia es la Stability AI Community License, heredada del modelo base, con atribucion obligatoria y declaracion de modificaciones en el archivo `NOTICE`. El codigo de entrenamiento StepX-OPD se distribuye por separado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (SD3 Transformer2DModel) con adaptador LoRA; pipeline StableDiffusion3Pipeline |
| Parametros totales | no disponible (el LoRA tiene rango 192; el transformer base SD3.5 Medium no se especifica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto a imagen; la longitud de prompt depende del codificador de texto del base) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el ejemplo de uso carga en bfloat16) |
| Idiomas soportados | no disponibles (depende de los codificadores de texto del modelo base) |
| Licencia | Stability AI Community License (`stabilityai-ai-community`) |
| Formato de pesos | safetensors (LoRA en `pytorch_lora_weights.safetensors`; PEFT en `additive_init/adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es Stable Diffusion 3.5 Medium, un transformer de difusion con codificadores de texto multiples. Sobre el se entrena un LoRA siguiendo StepX-OPD, que plantea la destilacion on-policy con multiples profesores en modelos de difusion: el estudiante genera trayectorias con su propia politica y aprende de varios profesores en lugar de imitar un unico sampler fijo. El resultado es un sampler de cuatro pasos que opera sin classifier-free guidance.

La inicializacion aditiva (`additive_init/`) es un LoRA PEFT de rango 160, `lora_alpha` 64 y 23 modulos objetivo, almacenado en float32 (1,32 GB). Durante el entrenamiento se fusiona en el transformer con `merge_and_unload` y se crean adaptadores de estudiante de rango 32 sobre los pesos fusionados. El LoRA final publicado combina ambos (192 = 160 + 32), de modo que la inicializacion ya esta incorporada y no hace falta cargar `additive_init/` para inferir. El grid de timesteps evaluado se reproduce con `sigmas=np.linspace(1.0, 1.0/4, 4)`; usar el scheduler por defecto cambia los timesteps y altera el resultado.

## Capacidades

- Generacion de imagenes a partir de texto en cuatro pasos de inferencia, sin classifier-free guidance (`guidance_scale=1.0`).
- Destilacion multi-profesor on-policy aplicada a difusion, con sampler acelerado respecto al base.
- Carga directa en diffusers mediante `load_lora_weights` sobre `StableDiffusion3Pipeline`.
- Resolucion de trabajo documentada en el ejemplo: 512x512.
- Reentrenamiento reproducible: el directorio `additive_init/` sirve como `init_lora_merge_path` / `--init_merge` en el codigo StepX-OPD.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; dependen de los codificadores de texto del base.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion rapida de bocetos visuales: con cuatro pasos y sin CFG, el coste por imagen cae frente al base; util para iterar prompts en herramientas de diseño.
- Prototipado de pipelines de texto a imagen: sirve para validar integraciones diffusers con un LoRA de bajo coste antes de escalar a samplers completos.
- Generacion en entornos con presupuesto de computo limitado: al reducir el numero de evaluaciones del transformer, encaja en GPUs modestas o en colas de inferencia con cuotas.
- Investigacion en destilacion de difusion: el par LoRA fusionado + `additive_init/` permite reproducir y modificar el entrenamiento StepX-OPD.
- Creacion de datasets sinteticos a 512x512: genera volumen de imagenes de forma economica para tareas de vision por computador.
- Experimentos de ablacion sobre samplers: comparar el grid de cuatro pasos frente al scheduler por defecto del base para estudiar fidelidad y artefactos.
- Base para fine-tuning adicional: al ser un LoRA sobre SD3.5 Medium, se puede apilar con otros adaptadores compatibles en diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numericas con otros samplers destilados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el ejemplo oficial carga el pipeline completo en bfloat16 en `cuda`. El LoRA en si es pequeno (repo de 2,9 GB, incluida la inicializacion en float32), pero la VRAM viene del transformer base SD3.5 Medium.
- GPU recomendadas: no disponibles en la informacion; el ejemplo usa `torch.Generator("cuda")` sin especificar modelo de GPU.
- Cabe en consumer GPU: no disponible con datos concretos; depende del base SD3.5 Medium y de la cuantizacion elegida.
- Opciones de despliegue: diffusers (`StableDiffusion3Pipeline` + `load_lora_weights`). Otros backends (ComfyUI, vLLM, TGI, llama.cpp) no se mencionan en la informacion.
- Latencia y throughput: no disponibles; el diseno de cuatro pasos sin CFG reduce el numero de evaluaciones del transformer respecto a samplers multi-paso convencionales.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de cuatro pasos ni metricas para contrastar.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StepX-OPD-SD3.5 | LoRA rango 192 sobre SD3.5 Medium | no aplica | no disponible | Stability AI Community License | Hugging Face |
| Alternativas de cuatro pasos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del dataset y de los codificadores de texto de Stable Diffusion 3.5 Medium; no se documentan sesgos especificos en la model card.
- Riesgo de alucinacion: propio de los modelos generativos de imagen; con solo cuatro pasos y sin CFG, los artefactos pueden ser mas visibles que con samplers multi-paso.
- Limitacion de timesteps: omitir `sigmas=np.linspace(1.0, 1.0/4, 4)` usa el grid por defecto del scheduler y degrada el resultado; hay que respetar el grid documentado.
- Resolucion: el ejemplo documentado es 512x512; no se garantiza calidad a otras resoluciones.
- Restricciones de licencia: sujeta a la Stability AI Community License; requiere atribucion y declaracion de modificaciones (`NOTICE`). Revisar los terminos para uso comercial antes de desplegar.
- `additive_init/` no es un modelo de cuatro pasos utilizable por si solo; es solo inicializacion de entrenamiento.
- Idiomas: no documentados; dependen del base, por lo que no hay garantia de rendimiento en prompts en castellano.
- Madurez: 3 descargas y 0 likes en el momento de la ficha; ecosistema de validacion muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/ShimaRinC/StepX-OPD-SD3.5
- Paper: https://arxiv.org/abs/2611.04386
- Codigo de entrenamiento StepX-OPD: https://github.com/WinterCCC/StepX-OPD
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Licencia: https://huggingface.co/ShimaRinC/StepX-OPD-SD3.5/blob/main/LICENSE-MODEL

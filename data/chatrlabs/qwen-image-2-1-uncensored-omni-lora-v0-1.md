# chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1

## Resumen

ChatR Labs Uncensored Omni LoRA v0.1 es un adaptador LoRA de rango 128 entrenado sobre el modelo de difusion Qwen-Image-2.1 de Alibaba Qwen. Lo desarrolla ChatR Labs y resuelve un problema concreto: unificar generacion texto-a-imagen y edicion de imagen por instrucciones en lenguaje natural en un unico adaptador, relajando ademas las restricciones de contenido del modelo base. El repositorio contiene exclusivamente los pesos LoRA (671 MB en BF16); el transformer, el text encoder, el procesador y el VAE se descargan por separado desde el repositorio del modelo base.

El checkpoint publicado corresponde al paso 32.000 de un entrenamiento mas largo; el autor menciona tambien un checkpoint cuantizado en el paso 90.000 con mejores puntuaciones de adherencia a prompt. La relevancia actual del modelo radica en su adopcion: acumula mas de 52.000 descargas y 106 likes, lo que lo situa entre los adaptadores comunitarios mas usados para la familia Qwen-Image. Es un LoRA convencional, no destilado para pocos pasos, por lo que requiere el regimen de muestreo completo (35 pasos, true CFG 5.0).

La ficha describe las capacidades declaradas por el autor y los resultados de su benchmark interno. No se dispone de informacion sobre composicion del dataset de entrenamiento, numero de tokens ni detalles del proceso de fine-tuning mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 128) sobre modelo de difusion Qwen-Image-2.1; pesos con claves Diffusers/PEFT |
| Parametros totales | no disponible (adaptador de 671 MB en BF16; el modelo base se descarga aparte) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de texto) |
| Tipos de cuantizacion | BF16 publicado; el autor menciona un checkpoint cuantizado del paso 90.000, sin detallar el esquema; no hay variantes GGUF ni FP8 en este release |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el text encoder del modelo base determina el soporte) |
| Licencia | qwen-research (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (BF16, claves Diffusers/PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen-Image-2.1, un modelo de difusion para generacion y edicion de imagen. El LoRA tiene rango 128 y se distribuye como un unico fichero safetensors de 671 MB en BF16 con claves compatibles con Diffusers y PEFT, cargable mediante `load_lora_weights` y activable con `set_adapters`. El autor indica explicitamente que no es compatible con Qwen-Image, Qwen-Image-2512 ni Qwen-Image-Edit-2511, cuyas arquitecturas difieren, y que no incorpora destilacion para generacion en pocos pasos.

El entrenamiento se realizo en dos fases medibles por los checkpoints publicados: el repositorio corresponde al paso 32.000 y existe un checkpoint adicional en el paso 90.000 con cuantizacion. No se detalla la composicion del dataset, el numero de imagenes, el uso de RLHF/DPO ni la metodologia de curacion de datos. La innovacion principal es funcional: un solo adaptador cubre tanto texto-a-imagen como edicion con una a tres imagenes de referencia, con un ajuste de contenido que relaja los filtros del modelo base.

## Capacidades

- Generacion texto-a-imagen a resolucion de aproximadamente 1 megapixel (por ejemplo, 1024 x 1024).
- Edicion de imagen guiada por instrucciones en lenguaje natural, aceptando de una a tres imagenes de referencia en el pipeline probado.
- Generacion de poses (etiqueta `pose-generation` declarada por el autor).
- Modo sin censura: el adaptador relaja las restricciones de contenido del modelo base, orientado a prompts para adultos.
- Uso de cache KV (`use_kv_cache=True`) para acelerar la inferencia.
- Compatibilidad con `enable_model_cpu_offload()` para reducir la residencia en VRAM a costa de RAM del sistema.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- No ofrece modo thinking, vision de entrada general ni audio.

## Casos de uso

- Generacion de imagenes de producto: con 35 pasos y CFG 5.0 se obtienen renders de ~1 MP adecuados para fichas de e-commerce; el ejemplo de la model card (taza ceramica sobre mesa de madera con luz matinal) ilustra el flujo.
- Edicion iterativa de assets: partir de una imagen generada y aplicar instrucciones como "cambia la taza a verde, manten el resto igual" permite refinar un concepto sin regenerar desde cero, gracias al modo de edicion con imagen de referencia.
- Creacion de contenido para adultos: el ajuste sin censura esta pensado para estudios y creadores que necesitan prompts que el modelo base rechazaria; requiere verificacion legal y de edad en el despliegue.
- Prototipado de escenas con multiples referencias: el pipeline acepta hasta tres imagenes de referencia, util para composiciones que combinan sujeto, fondo y estilo en un solo paso de edicion.
- Generacion de poses para referencia artistica o animacion: la etiqueta `pose-generation` sugiere uso en flujos de previsualizacion de posturas antes de modelado 3D o ilustracion.
- Despliegue en playground o demo interna: el autor ofrece una interfaz web sin cuenta con cola compartida, replicable con el codigo de `inference.py` para pruebas de equipo.
- Automatizacion por lotes en CPU/GPU mixta: con `enable_model_cpu_offload()` se puede ejecutar en maquinas con VRAM limitada pero RAM suficiente, util para generacion nocturna de catalogos.

## Benchmarks y rendimiento

El autor publica una comparacion interna entre el modelo base y dos checkpoints del entrenamiento, con los mismos prompts, semilla y ajustes (35 pasos, CFG 5.0). Puntuaciones de 0 a 100, mayor es mejor, con error estandar de ±1.

| Benchmark | Base | Paso 32.000 (LoRA v0.1) | Paso 90.000 (cuantizado) |
|---|---|---|---|
| Adherencia a prompt para adultos (960 imagenes) | 85,1 ± 0,9 | 87,4 ± 0,8 | **89,7 ± 0,7** |
| Anatomia (960 imagenes) | **70,3 ± 1,4** | 67,7 ± 1,4 | 69,4 ± 1,4 |
| Prompts SFW generales (300 PartiPrompts) | **79,8 ± ... (dato truncado en la model card)** | no disponible | no disponible |

La tabla muestra que el LoRA mejora la adherencia a prompts para adultos respecto al base, pero degrada ligeramente la metrica de anatomia en el checkpoint publicado (67,7 frente a 70,3). El dato de PartiPrompts para el paso 32.000 no aparece completo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el adaptador pesa 671 MB, pero el modelo base Qwen-Image-2.1 (transformer, text encoder y VAE) domina el consumo. El autor recomienda `enable_model_cpu_offload()` cuando la VRAM es insuficiente, lo que implica que el pipeline completo no cabe comodamente en GPUs de gama media sin offload.
- GPU recomendadas: no especificadas por el autor. Por el perfil del pipeline (difusion a ~1 MP, BF16, 35 pasos), son razonables A100, H100 o RTX 4090 con 24 GB; el offload permite GPUs con menos VRAM a cambio de RAM del sistema.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) sin offload; en GPUs de 8-16 GB requerira offload y suficiente RAM.
- Despliegue: Diffusers con `QwenImage21Pipeline` (revision fijada en `requirements.txt`), PEFT y Accelerate; PyTorch 2.11.0 con CUDA 12.8 en el entorno del autor. No hay soporte documentado para vLLM, llama.cpp ni Ollama (no aplica a difusion en este formato).
- Latencia y throughput: no disponibles. El autor solo indica 35 pasos de muestreo y cache KV activada; mas referencias en edicion incrementan el consumo de memoria.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ChatR Labs Omni LoRA v0.1 | LoRA r128 sobre Qwen-Image-2.1 | 671 MB (adaptador) | no aplica | Adherencia adultos 87,4; anatomia 67,7 | qwen-research | Hugging Face, playground |
| Qwen-Image-2.1 (base) | Difusion texto-a-imagen y edicion | no disponible | no aplica | Adherencia adultos 85,1; anatomia 70,3; SFW 79,8 | qwen-research | Hugging Face |
| Checkpoint paso 90.000 (mismo autor, cuantizado) | LoRA sobre Qwen-Image-2.1 | no disponible | no aplica | Adherencia adultos 89,7; anatomia 69,4 | qwen-research | Referenciado en la model card, sin repositorio propio listado |

No se dispone de datos de otros adaptadores comunitarios comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin censura: el adaptador relaja los filtros del base; su uso comercial o publico exige verificacion de edad, cumplimiento legal por jurisdiccion y politicas de plataforma.
- Licencia qwen-research: restringe el uso comercial; revisar el fichero LICENSE del repositorio antes de cualquier despliegue productivo.
- Alucinacion visual: como todo modelo generativo, puede producir anatomia incorrecta; el benchmark propio muestra una caida de 2,6 puntos en anatomia respecto al base.
- Compatibilidad estricta: no funciona sobre Qwen-Image, Qwen-Image-2512 ni Qwen-Image-Edit-2511; solo sobre Qwen-Image-2.1.
- Sin destilacion: requiere 35 pasos y CFG 5.0; no es apto para generacion en 1-4 pasos.
- Negativo vacio: en el pipeline probado, un negative prompt vacio desactiva el true CFG aunque `true_cfg_scale` sea mayor que 1; hay que usar un espacio.
- VAE tiling: el autor advierte que el decodificado por tiles introduce rayas verticales de color; debe mantenerse desactivado.
- Memoria: mas imagenes de referencia en edicion aumentan el consumo; el modo CPU offload exige RAM del sistema suficiente.
- Idiomas e informacion de entrenamiento: no disponibles; no se puede evaluar sesgo por idioma ni composicion del dataset.
- Estado experimental: version v0.1, checkpoint intermedio (paso 32.000) de un entrenamiento mas largo.

## Enlaces

- Hugging Face: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Descarga directa del LoRA BF16: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/resolve/main/chatrlabs-omni-lora-v0.1-bf16.safetensors
- Playground del autor: https://chatrlabs.com/
- Fichero de integridad SHA256SUMS: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/SHA256SUMS
- Requisitos de dependencias: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/requirements.txt
- Script de inferencia: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/inference.py
- Licencia: https://huggingface.co/chatrlabs/Qwen-Image-2.1-Uncensored-Omni-LoRA-v0.1/blob/main/LICENSE

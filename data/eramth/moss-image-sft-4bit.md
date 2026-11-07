# eramth/MOSS-Image-SFT-4bit

## Resumen

MOSS-Image-SFT-4bit es una versión cuantizada a 4 bits (NF4) del modelo de generación de imágenes texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT, publicado por el usuario eramth en Hugging Face. El modelo original pertenece a la familia MOSS-Image de OpenMOSS y es un modelo de difusión de aproximadamente 5B parámetros en el backbone transformer (DiT), acompañado de un text encoder Qwen3.5-9B y un VAE de FLUX.2. Esta variante cuantizada reduce el peso total de unos 30 GB a aproximadamente 8,5 GB, lo que permite ejecutar el modelo en GPUs de 16 GB de VRAM.

El objetivo de esta ficha es documentar una conversión de cuantización, no un modelo entrenado desde cero: la arquitectura, los datos de entrenamiento y las capacidades subyacentes son las del modelo base OpenMOSS-Team/MOSS-Image-SFT. La aportación concreta de esta versión es la aplicación de cuantización NF4 mediante bitsandbytes sobre el text encoder y el backbone DiT, manteniendo el VAE en FP32 y ciertos módulos de routing y time-embedding en FP16 para preservar la calidad de generación.

Es relevante ahora porque democratiza la inferencia de un modelo texto-a-imagen de gran tamaño en hardware de consumo (RTX 3080/3090/4080/4090, Tesla T4) sin necesidad de GPUs de datacenter con 40-80 GB. El repositorio tiene, en el momento de la consulta, 0 descargas y 0 likes, y fue creado el 7 de noviembre de 2026, por lo que se trata de una publicación muy reciente y con poca validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen: backbone DiT de 5B + text encoder Qwen3.5-9B + VAE FLUX.2 |
| Parametros totales | 2.663.075.353 (según safetensors del repo cuantizado); el modelo base declara ~5B en el backbone DiT más el text encoder de 9B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) en text encoder y backbone DiT; VAE en FP32; módulos de routing y time-embedding en FP16; cómputo en FP16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería diffusers, pipeline `MOSSImagePipeline`) |

## Arquitectura y entrenamiento

El modelo base MOSS-Image-SFT es un modelo de difusión texto-a-imagen de la familia MOSS-Image de OpenMOSS, derivado de MOSS-Image-Base mediante supervisión fina (SFT). Su arquitectura combina un backbone transformer de tipo DiT de aproximadamente 5B parámetros con un text encoder Qwen3.5-9B y un VAE correspondiente a FLUX.2. El pipeline admite prompts en lenguaje natural, secuencias de etiquetas (tags) y layouts en formato JSON para controlar la colocación de texto y objetos en la imagen generada.

Esta variante 4-bit no modifica la arquitectura ni reentrena el modelo: aplica cuantización NF4 con bitsandbytes al text encoder (dejándolo en ~5,5 GB) y al backbone DiT (~2,6 GB), conserva el VAE en FP32 y mantiene en FP16 los módulos pequeños de routing y time-embedding, que son sensibles a la cuantización. El resultado ocupa unos 8,5 GB en disco frente a los ~30 GB del modelo original, con una reducción superior al 70%. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución de 1024x1024 (configurable mediante los parámetros `height` y `width` del pipeline).
- Aceptación de prompts en lenguaje natural, secuencias de etiquetas y layouts JSON para control posicional de texto y objetos.
- Control del proceso de muestreo mediante `num_inference_steps` (el ejemplo de la model card usa 25 pasos).
- Inferencia eficiente en GPUs de 16 GB gracias a la cuantización NF4.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo generativo de imágenes, no un LLM conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales como thinking, visión de entrada o audio.

## Casos de uso

- Prototipado rápido en estación de trabajo con GPU de consumo: un desarrollador con una RTX 4080 o 4090 (16 GB) puede cargar el pipeline y generar imágenes de 1024x1024 en 25 pasos sin recurrir a instancias cloud con A100/H100, gracias a los ~8,5 GB de huella del modelo cuantizado.
- Generación de ilustraciones y assets para aplicaciones web o móviles: el modelo acepta prompts en lenguaje natural, lo que permite integrarlo en un servicio interno que genere imágenes bajo demanda a partir de descripciones de producto o escenas.
- Composición controlada con layouts JSON: para maquetación de carteles, banners o imágenes con texto colocado en posiciones concretas, el soporte de layouts JSON del modelo base permite especificar la ubicación de objetos y texto sin postprocesado manual.
- Experimentación académica con modelos de difusión: investigadores sin acceso a GPUs de datacenter pueden reproducir experimentos de generación texto-a-imagen y comparar el efecto de la cuantización NF4 frente al modelo base en FP16.
- Fine-tuning y LoRA en hardware limitado: dado que el ecosistema DiffSynth-Studio soporta fine-tuning completo y LoRA para MOSS-Image-Base y MOSS-Image-SFT, esta variante cuantizada sirve como punto de partida para explorar adaptaciones con recursos reducidos (aunque la cuantización puede complicar el entrenamiento y requeriría validación).
- Despliegue en entornos con Tesla T4: la model card indica optimización para los Tensor Cores de la T4 en FP16, lo que encaja con instancias cloud económicas para servir generación de imágenes a baja escala.
- Reducción de bandas de color mediante LoRA comunitarias: la comunidad (MATLOWAI) publica LoRAs como MOSS-Image-SFT-DeBand para mitigar el banding vertical de color del modelo SFT, aplicables sobre este pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8,5 GB de pesos en disco; con overhead de activaciones y del pipeline, encaja en GPUs de 16 GB según la model card.
- GPU recomendadas: NVIDIA Tesla T4, RTX 3080, RTX 3090, RTX 4080 y RTX 4090 (16 GB o más), con cómputo en FP16.
- Cabe en GPU de consumo: sí, en modelos con 16 GB de VRAM o superior; no se garantiza en GPUs de 8-12 GB.
- Opciones de despliegue: Diffusers con `DiffusionPipeline` y `custom_pipeline="pipeline_moss_image"` (requiere `trust_remote_code=True`); el ecosistema DiffSynth-Studio soporta entrenamiento y LoRA del modelo base; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eramth/MOSS-Image-SFT-4bit | 2,66B (repo cuantizado); base ~5B DiT + 9B text encoder | 1024x1024 (configurable) | 4-bit NF4 | apache-2.0 | Hugging Face, diffusers |
| OpenMOSS-Team/MOSS-Image-SFT | ~5B DiT + 9B text encoder | 1024x1024 (configurable) | FP16/FP32 (original) | no disponible en la información | Hugging Face, diffusers |
| OpenMOSS-Team/MOSS-Image-Base | ~5B DiT + 9B text encoder | 1024x1024 (configurable) | FP16/FP32 (original) | no disponible en la información | Hugging Face, diffusers |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NF4 puede introducir degradación de calidad frente al modelo base en FP16; no se han publicado evaluaciones cuantitativas de esta pérdida.
- El VAE se mantiene en FP32 y los módulos de routing y time-embedding en FP16, lo que implica que no todo el pipeline es 4-bit y hay que gestionar tipos mixtos (`torch_dtype={"default": torch.float16, "vae": torch.float32}`).
- Requiere `trust_remote_code=True` y un `custom_pipeline` específico, lo que añade riesgo de seguridad y de compatibilidad con versiones futuras de diffusers.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento.
- El modelo base MOSS-Image-SFT presenta banding vertical de color según la comunidad, que requiere LoRAs externas (MOSS-Image-SFT-DeBand) para mitigarlo.
- Sesgos conocidos: no disponibles en la información proporcionada; los modelos texto-a-imagen suelen heredar sesgos de sus datos de entrenamiento, pero no se documentan aquí.
- Riesgo de alucinación visual: no documentado; como todo modelo generativo, puede producir imágenes incoherentes o no fieles al prompt.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base y del VAE FLUX.2, que puede tener términos propios no reflejados en esta información.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano u otros idiomas distintos del inglés.

## Enlaces

- Hugging Face (versión cuantizada): https://huggingface.co/eramth/MOSS-Image-SFT-4bit
- Hugging Face (modelo base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio GitHub oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image

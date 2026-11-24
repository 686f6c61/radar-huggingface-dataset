# kabcnd/Kenzan-MiniMax-H3-Image-20B-PinGrid-GGUF

## Resumen

Kenzan-MiniMax-H3-Image-20B-PinGrid-GGUF es una cuantización extrema en formato GGUF del modelo de generación y edición de imágenes MiniMax-H3-Image, publicada por el usuario kabcnd bajo la serie "Kenzan". El modelo original lo desarrolla MiniMaxAI y la versión de referencia utilizada como base es la distribuida por Comfy-Org. Se trata de un pipeline text-to-image compuesto por un Diffusion Transformer (DiT) de 20.113 millones de parámetros, un codificador de texto y visión basado en Qwen3-VL-32B truncado a 50 capas y un VAE específico del modelo.

El objetivo del autor es hacer viable la inferencia local de un modelo de imagen de escala 20B en equipos con solo 16 GB de memoria unificada, en concreto un Apple Mac mini M6. Para ello aplica una estrategia propia denominada "Pin-Grid", que asigna distintos niveles de cuantización (de Q2_K a Q5_K, con normas y proyecciones adaLN en F32) según la posición y sensibilidad de cada bloque de la red, comprimiendo el DiT de 37,47 GiB en BF16 a 8,40 GiB, una reducción de 4,46 veces.

La relevancia actual del release radica en que demuestra que un modelo de difusión de 20B puede ejecutarse en hardware de consumo con memoria unificada limitada, usando `stable-diffusion.cpp` con Metal 4 o ComfyUI con ComfyUI-GGUF, con velocidades medidas de 7,20 a 8,24 s por paso a 1024×1024 y sin errores de memoria (OOM). La licencia es la MiniMax-H3-Image Community License Agreement, no una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de 50 bloques + codificador de texto/visión Qwen3-VL-32B (50 capas) + VAE |
| Parametros totales | 20.113.672.082 (DiT); el codificador de texto Qwen3-VL-32B se distribuye por separado |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pin-Grid mixta: Q2_K, Q3_K, Q4_0, Q5_K en el DiT (normas y adaLN en F32); Q2_K, Q3_K, Q4_0, Q5_K y Q8_0 en el codificador (visual.* en Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | GGUF (DiT y text encoder) + safetensors FP16 (VAE) |

## Arquitectura y entrenamiento

El pipeline sigue la arquitectura del MiniMax-H3-Image original: un Diffusion Transformer de 20,11B parámetros y 50 bloques que actúa como generador de imágenes, un codificador de texto y visión derivado de Qwen3-VL-32B recortado a 50 capas que procesa las indicaciones textuales y, en el caso de edición de imágenes, también las imágenes de entrada, y un VAE de 1,09 GiB en FP16 que decodifica las latentes a píxeles. El autor no proporciona detalles sobre los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esa información no está disponible en la documentación consultada.

La innovación técnica de esta ficha no reside en el entrenamiento, sino en el esquema de cuantización Pin-Grid. En el DiT, los módulos `token_refiner` y `final_layer` se mantienen en Q5_K; los bloques de entrada y salida (0, 1, 48, 49), las atenciones de los bloques 40 a 47 y las proyecciones `mlp.fc2` de mayor tamaño (8, 16, 24, 32, 40) se asignan a Q4_0; los bloques intermedios y tardíos (20 a 47) a Q3_K; y las MLP tempranas (2 a 19) a Q2_K. Las normas, `adaln_t_table`, `adaln_proj` y `patch_proj` se conservan en F32. El codificador de texto aplica una lógica análoga, con las capas visuales en Q8_0 para preservar la capacidad de edición de imágenes, `embed_tokens` en Q5_K, capas de entrada y salida y proyecciones k/v en Q4_0, y el resto en Q3_K y Q2_K. El repositorio incluye los scripts de conversión (`convert_dit_to_gguf.py` y `convert_te_to_gguf.py`) para reproducir el proceso.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) a resoluciones de al menos 1024×1024, con muestreo de 6 pasos y scheduler euler/simple según los ejemplos del autor.
- Edición de imágenes, gracias a las capas `visual.*` del codificador Qwen3-VL conservadas en Q8_0.
- Comprensión conjunta de texto e imagen en el codificador, al estar basado en Qwen3-VL-32B.
- Ejecución local en Apple Silicon mediante `stable-diffusion.cpp` (`sd-cli` y `sd-server`) con Metal 4, incluyendo `--offload-to-cpu` y `--flash-attn`.
- Integración con ComfyUI a través de ComfyUI-GGUF, con dequantización por capa a FP16 en tiempo de ejecución sobre PyTorch MPS.
- Servidor persistente (`sd-server`) que evita la carga en frío de pesos entre peticiones.
- Soporte de tool calling, agentes, razonamiento multi-paso, audio o modo thinking: no disponible (el modelo es un pipeline de imagen, no un LLM conversacional).

## Casos de uso

- Generación de ilustraciones y concept art en estaciones de trabajo Apple Silicon: un Mac mini de 16 GB puede producir imágenes de 1024×1024 con 6 pasos en torno a 43-49 segundos de DiT más 2,4-2,6 segundos de decodificación VAE, suficiente para iterar prompts de forma local sin depender de la nube.
- Edición de imágenes asistida por instrucciones: las capas visuales del codificador en Q8_0 permiten introducir una imagen de referencia junto al prompt para tareas de modificación guiada, útil en flujos de retoque o variaciones de producto.
- Prototipado de pipelines de difusión en ComfyUI: al estar en formato GGUF compatible con ComfyUI-GGUF, se puede integrar en grafos nodales existentes para experimentar con schedulers, CFG y resoluciones antes de escalar a hardware mayor.
- Servicio de generación de imágenes en red local: `sd-server` mantiene los pesos cargados y expone un endpoint en el puerto configurado (`--listen-port 8189` en el ejemplo), lo que permite alimentar aplicaciones internas de diseño o marketing sin coste de API.
- Investigación sobre cuantización extrema: los scripts de conversión y las recetas Pin-Grid sirven como referencia reproducible para estudiar el impacto de asignar bits por bloque en modelos de difusión de gran tamaño.
- Despliegue en entornos con memoria unificada limitada: equipos con 16 GB que no pueden alojar el BF16 de 37,47 GiB pueden ejecutar el modelo con `--offload-to-cpu`, lo que amplía el acceso a modelos de imagen de escala 20B en hardware de consumo.
- Docencia y demostraciones offline: al no requerir conexión ni GPU dedicada, es adecuado para talleres sobre modelos generativos en aulas con portátiles Apple Silicon.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son mediciones de velocidad en un Apple Mac mini M6 con 16 GB de memoria unificada, a 1024×1024 y 6 pasos con euler/simple. No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU, HumanEval u otros) en la información disponible.

| Backend | Velocidad por paso del DiT | Decodificación VAE | RSS máximo | Notas |
|---|---|---|---|---|
| ComfyUI + ComfyUI-GGUF (PyTorch MPS) | 13,27 s/paso | 5,36 s | 11,88 GiB | Dequantización por capa a FP16 en tiempo de ejecución |
| stable-diffusion.cpp (sd-cli / sd-server, Metal 4) | 7,20 – 8,24 s/paso | 2,43 – 2,59 s | Cabe en 16 GB con `--offload-to-cpu` | 1,8× más rápido en DiT y 2,1× en VAE que ComfyUI |

## Requisitos de hardware

- VRAM o memoria unificada estimada: el release está diseñado para 16 GB de memoria unificada; el DiT ocupa 8,40 GiB, el codificador 10,46 GiB y el VAE 1,09 GiB, por lo que se requiere `--offload-to-cpu` para encajar en ese límite.
- GPU recomendadas: Apple Silicon con Metal 4 (el autor valida Mac mini M6 de 16 GB). Para GPU dedicadas no se han publicado requisitos ni pruebas.
- ¿Cabe en GPU de consumo? El release está pensado para memoria unificada de Apple Silicon; no hay datos de ejecución en RTX 4090, RTX 3090 u otras GPU de consumo con VRAM discreta.
- Opciones de despliegue: `stable-diffusion.cpp` (`sd-cli` y `sd-server`) con Metal, y ComfyUI con ComfyUI-GGUF. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: 7,20-8,24 s por paso en DiT y 2,43-2,59 s de VAE con `stable-diffusion.cpp`; 13,27 s por paso y 5,36 s de VAE con ComfyUI. Para 6 pasos, el total ronda los 45-52 segundos por imagen en el backend más rápido.
- Almacenamiento: el repositorio completo ocupa 21,4 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-MiniMax-H3-Image-20B-PinGrid-GGUF | 20,11B (DiT) + codificador Qwen3-VL-32B | 1024×1024 validado | GGUF + safetensors (VAE) | MiniMax-H3-Image Community License | Hugging Face (750 descargas) |
| Comfy-Org/MiniMax-H3-Image (base) | 20,11B (DiT) | no disponible | safetensors | MiniMax-H3-Image Community License | Hugging Face |
| MiniMaxAI/MiniMax-H3-Image (original) | 20,11B (DiT) | no disponible | safetensors | MiniMax-H3-Image Community License | Hugging Face |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | no disponible | Hugging Face (citado como inspiración) |

La comparativa se limita a las variantes del mismo modelo y a Bonsai-2, mencionado por el autor como referente en cuantización de bajo bit. No se dispone de datos de benchmarks de calidad para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- La licencia MiniMax-H3-Image Community License Agreement no es una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- La cuantización extrema (bloques en Q2_K y Q3_K) puede degradar la fidelidad de las imágenes respecto al modelo en BF16; el autor no publica métricas de calidad comparativas.
- El release está validado únicamente en Apple Silicon de 16 GB con Metal 4; el rendimiento en otras plataformas no está documentado.
- El codificador de texto es una versión truncada a 50 capas de Qwen3-VL-32B, no el modelo completo, lo que puede afectar a la comprensión de prompts complejos o imágenes de edición.
- No se especifican los idiomas soportados en los prompts; la información disponible no permite confirmar el comportamiento multilingüe.
- Riesgo de alucinación visual y de artefactos inherente a los modelos de difusión, especialmente con pocos pasos de muestreo (6 en los ejemplos).
- El repositorio tiene 0 likes y 750 descargas, con fecha de creación y actualización en noviembre de 2026; es un release reciente y con poca validación comunitaria.
- Los scripts de conversión y las recetas se ofrecen sin garantías; el autor solicita donaciones para ampliar el hardware de pruebas, lo que indica que la calibración se ha hecho con recursos limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabcnd/Kenzan-MiniMax-H3-Image-20B-PinGrid-GGUF
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Versión base de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Prism ML (inspiración, Bonsai-2): https://huggingface.co/prism-ml
- Apoyo al autor: https://ko-fi.com/kabcpc

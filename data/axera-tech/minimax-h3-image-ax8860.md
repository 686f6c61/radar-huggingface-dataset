# AXERA-TECH/MiniMax-H3-Image-AX8860

## Resumen

MiniMax-H3-Image-AX8860 es una conversión del modelo de generación y edición de imágenes MiniMax-H3-Image, publicada por AXERA-TECH, para ejecutarse íntegramente sobre la NPU AX8860. El repositorio no contiene un modelo de lenguaje ni un modelo multimodal de propósito general, sino un conjunto de pesos y programas compilados (AXModel) que implementan un pipeline completo de difusión: codificador de texto, DiT, VAE de imagen y codificador visual de referencia. Todos los componentes se ejecutan en la NPU, sin intervención de CPU para las operaciones matriciales principales.

La relevancia del artefacto es de despliegue: demuestra que un modelo de difusión de gran tamaño (DiT de 50 capas con hidden 5376 y FFN 14336, más un codificador de texto derivado de Qwen3-VL-32B) puede ejecutarse en hardware de borde con cuantización NVFP4 en las capas lineales y bf16 en normas, embeddings y VAE. El muestreo es de 6 pasos Euler con destilación y sin CFG, lo que reduce el coste computacional por imagen de forma drástica frente a pipelines de 20-50 pasos.

El repositorio ocupa 32,2 GB y está pensado para el runtime C++ axdiffusion.cpp, que ofrece CLI, servidor HTTP compatible con las APIs de OpenAI Images y A1111, y una interfaz web. La licencia es la MiniMax-H3-Image Community License, con exclusiones territoriales explícitas (UE, Reino Unido, Corea del Sur y Estados Unidos), un dato crítico para cualquier evaluación de uso comercial en España.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente con DiT (transformer de 50 capas) + codificador de texto Qwen3-VL-32B (primeras 50 capas) + VAE de imagen 2D ViT + codificador visual ViT 27 capas |
| Parametros totales | no disponible (el repositorio ocupa 32,2 GB; no se declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; secuencia máxima de 16896 tokens (texto + imagen) en text2img y 20480 en edición con referencias |
| Tipos de cuantizacion | NVFP4 en capas lineales de DiT y codificador de texto; bf16 en normas, embeddings, AdaLN, cabeceras PDD, VAE y ViT |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL, multilingüe, pero no se declara lista de idiomas) |
| Licencia | MiniMax-H3-Image Community License (excluye UE, Reino Unido, Corea del Sur y Estados Unidos) |
| Formato de pesos | safetensors (NVFP4 empaquetado en uint8 con escalas E4M3 + escala global FP32; bf16 nativo) y AXModel compilados para NPU |

## Arquitectura y entrenamiento

El pipeline combina cuatro redes. El codificador de texto es un Qwen3-VL-32B truncado a sus primeras 50 capas, que emite el hidden no normalizado de la capa 50; en edición, las características de las imágenes de referencia se inyectan mediante un ViT de 27 capas con hidden 1152, patch 16 y 64 patches en el lado corto. El generador es un DiT de 50 bloques con hidden 5376, 56 cabezas de 128 dimensiones, FFN de 14336 y patchificación 1×2×2. El VAE de imagen es un ViT 2D de 24 capas, 16 cabezas de 64, ancho 1024, latent de 24 canales y downsampling 16×, con codificación y decodificación por bloques de 256 px.

El muestreo está destilado a 6 pasos Euler con sigma de 1.0 a 0.0 y sin classifier-free guidance, y la modulación AdaLN de los 6 pasos está precalculada. La conversión de AXERA-TECH aplica cuantización NVFP4 a las capas lineales del DiT y del codificador de texto, recorta el codificador de texto a 50 capas, pasa el ViT a bf16 y divide los tensores por capa con renombrado. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens vistos ni si hubo RLHF o DPO; esos datos corresponden al modelo original MiniMax-H3-Image y no se detallan en esta model card.

## Capacidades

- Generación de texto a imagen con resoluciones desde 256 px hasta aproximadamente 16,7 megapíxeles (4096×4096, 6272×2688), con ancho y alto múltiplos de 32.
- Edición de imagen con 1 a 3 imágenes de referencia, con relaciones de aspecto de 1:1 a 3:1 y tamaño de salida especificable libremente.
- Carga dinámica de LoRA en formatos diffusers/PEFT, ComfyUI y kohya, con apilamiento de varias LoRA sin recargar el modelo base.
- Soporte de rangos LoRA de 64 y 128, con selección automática de kernel y truncado por SVD por encima de 128.
- Ejecución íntegra en NPU de todos los componentes (texto, DiT, VAE y ViT de referencia).
- Servicio HTTP compatible con las APIs de OpenAI Images y A1111, además de interfaz web y CLI.
- No se declaran capacidades de tool calling, agentes, audio ni razonamiento textual: el modelo es exclusivamente de imagen.

## Casos de uso

- Generación de ilustraciones a alta resolución en estación de trabajo con NPU: el pipeline produce 2048×2048 en 26,5 s y 4096×4096 en 161,8 s, adecuado para iteración interactiva en un equipo local sin GPU dedicada.
- Edición de producto con imágenes de referencia: con una referencia 1:1 y salida 1024×1024 el coste es de 22,1 s, lo que permite flujos de retoque guiado por imagen en catálogos de comercio electrónico.
- Personalización de estilo mediante LoRA: al poder apilar varias LoRA sin recargar el modelo base, se pueden mantener estilos de marca o de personaje y combinarlos por petición con un sobrecoste de 3-6 % en el DiT para rangos de hasta 64.
- Integración en pipelines creativos vía API compatible con A1111: herramientas existentes de automatización de imagen pueden apuntar al servidor axdiffusion-server sin cambios de cliente.
- Prototipado de aplicaciones de imagen en dispositivos de borde: el consumo residente de 30,8 GiB en NPU y el arranque de unos 23 s permiten desplegar un servicio de generación en hardware empotrado con NPU AX8860.
- Composición multi-referencia: con 2 referencias 1:1 y salida 1024×1024 en 43,2 s se pueden fusionar elementos de varias imágenes en una sola salida, útil para maquetación y previsualización de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, etc.) en la información disponible. Los únicos datos medidos son de latencia en hardware AX8860 con SDK 0.6.0, 4 núcleos NPU, 6 pasos y prompt de 22 tokens:

| Tarea | Resolución | Tiempo total | DiT 6 pasos | VAE decode |
|---|---|---|---|---|
| Texto a imagen | 512×512 | 2,7 s | 2,2 s | 0,36 s |
| Texto a imagen | 1024×1024 | 6,3 s | 5,5 s | 0,64 s |
| Texto a imagen | 2048×2048 | 26,5 s | 23,2 s | 3,1 s |
| Texto a imagen | 4096×4096 | 161,8 s | 150,0 s | 11,4 s |
| Texto a imagen + LoRA r64 | 1024×1024 | 6,6 s | 5,8 s | 0,64 s |
| Edición, 1 ref. 1:1 | 1024×1024 | 22,1 s | 16,8 s | no desglosado |
| Edición, 1 ref. 16:9 | 3840×2176 | 114,4 s | 95,9 s | no desglosado |
| Edición, 1 ref. 1:1 | 4096×4096 | 214,3 s | 194,4 s | no desglosado |

Datos operativos adicionales: arranque con todos los pesos en memoria NPU de aproximadamente 23 s, memoria NPU residente de 30,8 GiB (34 GiB tras usar edición), primera compilación de una combinación LoRA de unos 4 s y sobrecoste de edición con LoRA de 3-6 % (rank ≤ 64) o 14 % (rank ≤ 128).

## Requisitos de hardware

- NPU AX8860 con SDK 0.6.0 y 4 núcleos; el pipeline está compilado específicamente para esta plataforma y no se declara compatibilidad con otras NPU o GPU.
- Memoria NPU: 30,8 GiB residentes en modo texto a imagen y hasta 34 GiB tras usar edición, lo que exige el modelo de mayor capacidad de la plataforma.
- Almacenamiento: 32,2 GB para los pesos y programas; el arranque carga todos los pesos en memoria NPU en unos 23 s.
- No se documenta despliegue en vLLM, llama.cpp, Ollama ni TGI; el runtime previsto es axdiffusion.cpp (CLI, servidor HTTP y web).
- No se proporcionan estimaciones de VRAM para GPU ni de throughput en otros aceleradores.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de difusión ni datos de calidad que permitan situar MiniMax-H3-Image-AX8860 frente a alternativas como FLUX, SDXL o los modelos originales de MiniMax. La comparación solo puede establecerse en términos de despliegue: frente a pipelines en GPU, esta conversión prioriza ejecución en NPU con cuantización NVFP4 y muestreo de 6 pasos, a costa de un formato de pesos y runtime propietarios de la plataforma.

## Limitaciones y advertencias

- La licencia excluye expresamente su uso, copia, modificación, distribución o exhibición en la Unión Europea, Reino Unido, Corea del Sur y Estados Unidos; su uso comercial desde España queda por tanto prohibido por los términos citados.
- El repositorio está atado a la NPU AX8860 y al runtime axdiffusion.cpp; no es portable a GPU u otras NPU sin reconversión.
- La cuantización NVFP4 en DiT y codificador de texto puede introducir pérdida de fidelidad frente al modelo original en bf16; no se publican métricas de degradación.
- El muestreo sin CFG y con 6 pasos limita el control fino sobre la adherencia al prompt en comparación con pipelines de más pasos y guidance.
- No se declaran sesgos, tasas de alucinación visual ni cobertura idiomática del codificador de texto; la evaluación de sesgos queda pendiente.
- Los resultados en NPU pueden variar ligeramente entre ejecuciones del mismo input, según advierte el autor.
- El repositorio no incluye LoRA; su uso requiere obtenerlos por separado y verificar compatibilidad de formato.
- No se ofrece información sobre el dataset de entrenamiento ni sobre filtros de seguridad del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/MiniMax-H3-Image-AX8860
- Runtime de inferencia axdiffusion.cpp: https://github.com/AXERA-TECH/axdiffusion.cpp
- Documentación de la API HTTP: https://github.com/AXERA-TECH/axdiffusion.cpp/blob/main/docs/api.md (referenciada en la model card)
- Modelo original: MiniMax-H3-Image (Powered by MiniMax-H3-Image); no se proporciona URL en la información disponible.

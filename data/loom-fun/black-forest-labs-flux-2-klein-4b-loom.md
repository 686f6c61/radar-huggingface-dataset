# loom-fun/black-forest-labs-FLUX.2-klein-4B-loom

## Resumen

FLUX.2 [klein] 4B para AMD Loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint BF16 sin modificar `black-forest-labs/FLUX.2-klein-4B`, un modelo de difusión texto-a-imagen de 4B parámetros desarrollado por Black Forest Labs. El paquete lo publica el usuario `loom-fun` y su función no es la de un modelo nuevo, sino la de permitir servir el modelo original mediante `loom-serve`, que expone un endpoint compatible con la API de OpenAI `/v1/images/generations`. Está probado sobre la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con ROCm.

El modelo subyacente combina tres componentes: un codificador de texto Qwen3, un transformer de difusión destilado a cuatro pasos y un decodificador VAE. La destilación elimina la necesidad de classifier-free guidance, lo que reduce el coste de inferencia a exactamente 4 pasos por imagen. El contexto del codificador de texto está limitado a 512 tokens y las peticiones más largas se truncan como en el pipeline de referencia.

La relevancia de este paquete es de infraestructura: demuestra que un modelo de difusión de 4B en BF16 puede servirse con fidelidad numérica prácticamente idéntica a la referencia de diffusers en PyTorch ROCm sobre hardware AMD integrado, con licencia Apache 2.0 y una API estándar. No se han publicado resultados de benchmarks estándar (MMLU, etc.) porque no es un modelo de lenguaje, sino de generación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) destilado a 4 pasos + codificador de texto Qwen3 + decodificador VAE |
| Parametros totales | 4B (según denominación del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de texto (prompts mas largos se truncan) |
| Tipos de cuantizacion | BF16 (checkpoint servido sin cuantizar); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | paquete Loom (`.loom` + `model.json`); pesos BF16 del repositorio del publicador original, no del repositorio Loom |
| Resolucion de imagen | múltiplos de 16, máximo 8192 por eje, recuento de parches divisible por 16; por defecto 1024x1024 |
| Pasos de inferencia | 4 (fijos por el checkpoint destilado) |
| Guidance | no aplicable (destilado, sin classifier-free guidance) |
| Hardware probado | AMD Ryzen AI Max+ 395 / PRO 395 con Radeon 8060S (gfx1151), Windows 11 |

## Arquitectura y entrenamiento

El modelo base es un pipeline de difusión texto-a-imagen con tres etapas: un codificador de texto Qwen3 que procesa el prompt (hasta 512 tokens), un transformer de difusión destilado que genera en 4 pasos fijos sin classifier-free guidance, y un VAE que decodifica el latente a imagen. La destilación a 4 pasos es la innovación operativa principal: reduce el coste de muestreo frente a pipelines de decenas de pasos y hace viable la inferencia interactiva en hardware integrado.

El paquete Loom no modifica los pesos: sirve el checkpoint BF16 original del publicador. Añade programas `.loom` que implementan el pipeline y un "wide-tile BF16 projection motif" verificado contra una referencia escalar (`linear_wide`, 8/8 configuraciones). No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen en resoluciones configurables (múltiplos de 16, hasta 8192 por eje), con 1024x1024 por defecto.
- Muestreo determinista por semilla: la misma semilla produce la misma imagen, también bajo peticiones concurrentes.
- API compatible con OpenAI: `POST /v1/images/generations` con `response_format: b64_json`.
- Endpoints de estado y listado: `GET /v1/status` (progreso de preparación) y `GET /v1/models` (modelo listo).
- Concurrencia de peticiones con replay sembrado verificado.
- Presets de memoria: `image` (VAE sin teselar hasta 1024 px por eje), `image-bounded-workspace` (límite de 1,5 GiB con VAE teselado cuando es necesario) y `lifecycle` (384x384).
- No soporta edición de imagen ni img2img.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio local de generación de imágenes en estaciones de trabajo AMD: `loom-serve` expone la API OpenAI en `127.0.0.1:8080`, de modo que herramientas existentes que ya consumen `/v1/images/generations` pueden apuntar al endpoint sin cambios de cliente.
- Prototipado de aplicaciones de imagen en hardware integrado: con 4 pasos fijos y presets de memoria acotada (1,5 GiB), es adecuado para equipos con APU Strix Halo sin GPU discreta.
- Generación reproducible en pipelines de prueba: la semilla determinista y el replay verificado bajo concurrencia permiten tests de regresión con comparación SHA-256 de imágenes.
- Generación de ilustraciones y material gráfico por lotes: la concurrencia de peticiones y el endpoint estándar permiten integrarlo en colas de trabajo existentes.
- Evaluación comparativa de backends: el paquete incluye métricas PSNR, LPIPS, CLIPScore y PickScore frente a diffusers, útil para validar portes a ROCm.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 facilita su uso comercial sin las restricciones de licencias no comerciales habituales en modelos de imagen.

## Benchmarks y rendimiento

Calidad frente a la referencia diffusers en PyTorch ROCm, 1024x1024, 4 pasos, sin classifier-free guidance, 8 casos (uno por prompt), misma semilla y mismo ruido inicial:

| Metrica | Loom (este paquete) | diffusers bf16 (ROCm) |
|---|---|---|
| PSNR vs diffusers fp32 (mayor mejor) | 25,69 | 25,79 |
| LPIPS vs diffusers fp32 (menor mejor) | 0,068 | 0,065 |
| LPIPS vs diffusers bf16 (menor mejor) | 0,050 | referencia |
| CLIPScore (mayor mejor) | 27,83 | 28,32 |
| PickScore (mayor mejor) | 23,303 | 23,302 |

La diferencia pareada de PickScore frente a diffusers bf16 es de +0,001 (IC 95 %: -0,072 a +0,065), es decir, sin diferencia medible. Las comprobaciones de corrección (`image_check`) pasan con 3/3 imágenes bit-exactas frente a la referencia fijada, incluida la truncación de prompt y el rechazo de 6 peticiones inválidas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el preset `image-bounded-workspace` fija un límite de espacio de trabajo de 1,5 GiB con VAE teselado, y el preset `image` usa VAE sin teselar hasta 1024 px por eje.
- GPU probada: AMD Ryzen AI Max+ 395 / PRO 395 con Radeon 8060S (gfx1151), Windows 11, hrx-loom 0.2.0.
- Otras GPU AMD soportadas por hrx-loom 0.2.0 pueden ejecutar el paquete, pero no han sido probadas.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; el paquete está orientado a AMD vía `--device=amdgpu`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Pasos | Licencia | Despliegue |
|---|---|---|---|---|---|
| FLUX.2 [klein] 4B (paquete Loom) | 4B | 512 tokens | 4 fijos | Apache 2.0 | loom-serve en AMD (gfx1151 probado) |
| FLUX.2 [klein] 4B (diffusers, PyTorch ROCm) | 4B | 512 tokens | 4 fijos | Apache 2.0 | diffusers `Flux2KleinPipeline` |
| Otras alternativas de texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es frente al mismo checkpoint servido con diffusers en PyTorch ROCm; no se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No soporta edición de imagen ni img2img; solo texto-a-imagen.
- El prompt se limita a 512 tokens y se trunca como en el pipeline de referencia; prompts más largos pierden información.
- Los pasos están fijados a 4 por la destilación; no se puede aumentar la calidad incrementando pasos ni aplicar guidance.
- Solo se ha probado en una APU AMD concreta (Strix Halo, gfx1151) y en Windows 11; otras GPU AMD no están validadas.
- No hay datos publicados sobre sesgos, tasas de alucinación visual ni idiomas soportados.
- El paquete no incluye los pesos: estos se descargan del repositorio del publicador original en una revisión fijada, por lo que la disponibilidad depende de ese repositorio.
- El listener de `loom-serve` se levanta antes de terminar la preparación del modelo; hay que consultar `/v1/status` antes de enviar peticiones.
- No es un modelo de lenguaje: no ofrece razonamiento, código, matemáticas ni tool calling.
- La licencia Apache 2.0 aplica al paquete Loom; conviene verificar la licencia del checkpoint base en su repositorio original.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-fun/black-forest-labs-FLUX.2-klein-4B-loom
- Checkpoint base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Pull request a la librería Loom: https://github.com/ROCm/hrx-loom-library/pull/126
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- diffusers (referencia de comparación): https://github.com/huggingface/diffusers
- LPIPS (PerceptualSimilarity): https://github.com/richzhang/PerceptualSimilarity
- open_clip: https://github.com/mlfoundations/open_clip
- PickScore v1: https://huggingface.co/yuvalkirstain/PickScore_v1

# akatz-ai/Krea-2-OpenCast-LoRA

## Resumen

Krea 2 OpenCast LoRA es un adaptador LoRA para generación de imágenes creado por Akatz Labs para OpenCast Studio, publicado en HuggingFace por el usuario akatz-ai. Se trata de un peso de adaptación que se aplica sobre el modelo base krea/Krea-2-Raw (concretamente sobre la variante Krea 2 Turbo) para producir retratos de personajes ficticios con un estilo muy distintivo: rostros exagerados y esculturales, mandíbulas anchas, cuellos alargados, cabellos voluminosos y siluetas muy definidas, combinando materiales fotográficos e iluminación de estudio con proporciones deliberadamente inusuales.

El problema que resuelve es la generación consistente de personajes con estética concreta para flujos de diseño de personajes (character design) y retratos, sin necesidad de trigger tokens ni ingeniería de prompts compleja: los ejemplos del autor usan texto descriptivo ordinario con fuerza de LoRA 1.0. Es relevante porque incluye workflows completos de ComfyUI (canvas y API), índice de prompts con seeds exactas y ejemplos reproducibles, lo que facilita su integración inmediata en pipelines de producción.

El archivo LoRA pesa unos 0,3 GB en formato safetensors y funciona sobre Krea 2 Turbo, que emplea un codificador de texto Qwen3-VL de 4B parámetros y el VAE de Qwen Image. La licencia es la krea-2-community-license, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de difusión) sobre Krea 2 Turbo (pipeline text-to-image) |
| Parametros totales | no disponible (archivo LoRA de ~0,3 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplicable al LoRA; el modelo base recomendado es fp8 escalado |
| Idiomas soportados | en (prompts en inglés) |
| Licencia | krea-2-community-license (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un LoRA (Low-Rank Adapter) entrenado sobre Krea 2-Raw, la familia de modelos de difusión de Krea. En la configuración recomendada se aplica sobre Krea 2 Turbo en cuantización fp8 escalada, que es la variante optimizada para pocos pasos (8 pasos, CFG 1, sampler euler, scheduler simple). El pipeline completo incorpora Qwen3-VL 4B como codificador de texto multimodal (image text encoder) y el VAE de Qwen Image, lo que sugiere que Krea 2 comparte componentes con la arquitectura de Qwen Image.

No se ha publicado información sobre el número de pasos de entrenamiento, el dataset utilizado, el rank del LoRA ni el método de entrenamiento. El autor indica que los resultados de ejemplo se generan con fuerza de LoRA 1.0 y sin token de activación especial, lo que implica que el estilo está fuertemente absorbido en los pesos del adaptador.

## Capacidades

- Generación de imágenes texto-a-imagen (text-to-image) en formato de retrato de estudio, con resolución de ejemplo de 1024 × 1536.
- Estilo consistente de personajes ficticios: mandíbulas proyectadas, mentones partidos, cuellos largos, bocas pequeñas, cabellos sobredimensionados y siluetas nítidas.
- Generación de personajes animales vestidos (zorro, gato, rana, cacatúa) según los ejemplos del autor.
- Control del estilo mediante descripción geométrica en lenguaje natural, sin trigger tokens.
- Reproducibilidad total: seeds, prompts exactos y workflows ComfyUI (canvas y API) publicados.
- Uso como referencia de personaje en otros flujos de trabajo posteriores (el LoRA no anima ni hace face swap en vídeo).

## Casos de uso

- Diseño de personajes para animación o ilustración: generación de retratos de personajes ficticios con estética escultural coherente, usables como hoja de referencia visual antes del modelado o ilustración final.
- Concept art de estudio: creación rápida de variaciones de retratos con iluminación fotográfica de estudio probando distintos prompts y seeds documentados.
- Casting visual de ficción: OpenCast Studio usa estos retratos como referencias de personaje en workflows posteriores; un equipo puede generar decenas de candidatos y seleccionar los definitivos.
- Contenido editorial y marketing: retratos estilizados de personajes de marca con apariencia fotográfica pero rasgos deliberadamente exagerados e inconfundibles.
- Prototipado con ComfyUI: el workflow canvas incluido permite editar el prompt y ejecutar sin configurar nodos personalizados, ideal para iterar diseños en minutos.
- Automatización por API: el workflow API (portrait.api.json) permite integrar la generación en scripts y pipelines automatizados de producción de retratos.
- Personajes animales antropomorfos: generación de mascotas o personajes animales vestidos para branding, juegos o material infantil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA estilístico para generación de imágenes, no aplica evaluación tipo MMLU o HumanEval; la calidad se documenta mediante 18 retratos de ejemplo con prompts, seeds e imágenes a resolución completa en el índice de ejemplos del repositorio.

## Requisitos de hardware

- El LoRA en sí ocupa ~0,3 GB, pero el pipeline completo requiere el modelo base: Krea 2 Turbo fp8 escalado, Qwen3-VL 4B fp8 y el VAE de Qwen Image (tamaños no detallados en la ficha).
- VRAM estimada: no disponible; con un diffusion model en fp8 y un text encoder de 4B en fp8, una GPU de gama alta de consumo (16 GB de VRAM, tipo RTX 4090) es un punto de partida razonable, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible explícitamente; dada la cuantización fp8, se recomienda hardware con soporte eficiente de fp8 (RTX 40xx o superior, o GPUs de datacenter).
- Despliegue: ComfyUI con soporte nativo de Krea 2 (versión actualizada, frontend 1.55.18 verificado por el autor). No se requieren packs de nodos personalizados. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable a difusión).
- Configuración de referencia: 1024 × 1536 px, 8 pasos, CFG 1, sampler euler, scheduler simple, denoise 1.0, ConditioningZeroOut como negative conditioning.
- Latencia y throughput: no disponibles; con 8 pasos y CFG 1 se trata de un flujo de pocos pasos, lo que sugiere tiempos de generación bajos en GPU adecuada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Krea 2 OpenCast LoRA | LoRA estilístico (retratos) | Krea 2 Turbo / Krea 2-Raw | ~0,3 GB | krea-2-community-license | Workflows ComfyUI incluidos, sin trigger token |
| Otros LoRA de estilo para Krea 2 | LoRA estilístico | Krea 2-Raw | no disponible | variable | no disponible |
| LoRAs de retrato para SDXL/Flux | LoRA estilístico | SDXL / Flux.1 | ~0,1–0,5 GB típicamente | variable | Ecosistemas distintos; requieren sus propios modelos base y VAE |

No hay alternativas publicadas específicas con las que el autor compare; la comparativa se limita a la categoría general de LoRAs estilísticos de retrato.

## Limitaciones y advertencias

- Es un adaptador de imagen: no anima personajes ni realiza face swap en vídeo; intentar usarlo para esos fines no funcionará.
- Depende por completo del modelo base Krea 2 Turbo y sus componentes (Qwen3-VL 4B, VAE de Qwen Image), que deben descargarse por separado.
- La licencia krea-2-community-license es "other": hay que revisar el PDF de licencia enlazado antes de cualquier uso comercial, ya que puede imponer restricciones heredadas de Krea.
- Requiere una versión de ComfyUI con soporte nativo de Krea 2; versiones antiguas no cargarán el pipeline.
- Los prompts de ejemplo están en inglés; el rendimiento con prompts en otros idiomas no está documentado.
- Al generar retratos de personas ficticias hiperrealistas, existe el riesgo inherente de confusión con personas reales; el autor enfatiza que son personajes ficticios, pero conviene etiquetar los outputs como generados por IA.
- Popularidad muy baja en el momento de la ficha (56 descargas, 1 like): escasa validación comunitaria y posible falta de mantenimiento futuro.
- No hay documentación sobre el entrenamiento (dataset, rank, sesgos del dataset), por lo que los sesgos del estilo no pueden evaluarse formalmente.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/akatz-ai/Krea-2-OpenCast-LoRA
- Pesos del LoRA: https://huggingface.co/akatz-ai/Krea-2-OpenCast-LoRA/blob/main/krea2_opencast_v1.safetensors
- Licencia: https://huggingface.co/akatz-ai/Krea-2-OpenCast-LoRA/blob/main/LICENSE.pdf
- Índice de ejemplos: https://huggingface.co/akatz-ai/Krea-2-OpenCast-LoRA/blob/main/examples/README.md
- Prompts de ejemplo: https://huggingface.co/akatz-ai/Krea-2-OpenCast-LoRA/blob/main/examples/prompts.json
- Workflow canvas: https://huggingface.co/akatz-ai/Krea-2-OpenCast-LoRA/blob/main/examples/Krea-2-OpenCast-Portrait.json
- Workflow API: https://huggingface.co/akatz-ai/Krea-2-OpenCast-LoRA/blob/main/workflows/portrait.api.json
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Componentes base (Comfy-Org/Krea-2): https://huggingface.co/Comfy-Org/Krea-2
- Autor en X: https://x.com/akatz_ai
- Patreon del autor: https://www.patreon.com/Akatz
- GitHub Sponsors: https://github.com/sponsors/akatz-ai
- Ko-fi: https://ko-fi.com/akatz

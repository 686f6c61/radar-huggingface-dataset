# Quwaterlo/Flux-Uncensored-V2

## Resumen

Flux-Uncensored-V2 es un adaptador LoRA para el modelo de difusion FLUX.1-dev de Black Forest Labs, publicado en Hugging Face por el usuario Quwaterlo (el README atribuye su creacion a EnhanceAI). Su proposito declarado es eliminar las restricciones de contenido del modelo base para permitir la generacion de imagenes NSFW y contenido explicito. No es un modelo autonomo: requiere cargar FLUX.1-dev como base y aplicar los pesos LoRA sobre la pipeline de `diffusers`.

Tecnicamente se trata de un ajuste fino de bajo rango sobre un transformer de difusion (arquitectura FLUX.1, del tipo flow matching con atencion multimodal texto-imagen). El repositorio ocupa 0,7 GB y contiene pesos en formato `safetensors` (`lora.safetensors`) en `bfloat16`. La model card describe mejoras respecto a una version anterior (v1): mayor estabilidad, generacion mas rapida y pesos LoRA mas ligeros.

La relevancia de esta ficha es doble: por un lado, documenta un caso de adaptacion LoRA sobre FLUX.1-dev; por otro, advierte de que la model card incluye ejemplos de prompts que describen contenido sexual con menores, lo que constituye una violacion grave de las politicas de Hugging Face y de la legislacion aplicable en Espana y la UE. Cualquier uso de este artefacto debe evaluarse con extrema cautela legal y etica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.1-dev (transformer de difusion, flow matching) |
| Parametros totales | no disponible (el LoRA es un adaptador; el modelo base FLUX.1-dev tiene 12 000 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-imagen; el texto de prompt no se documenta) |
| Tipos de cuantizacion | no disponible (pesos publicados en `bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | creativeml-openrail-m en los metadatos; el README invoca la flux-1-dev-non-commercial-license |
| Formato de pesos | `safetensors` (`lora.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA (Low-Rank Adaptation) que se inyecta en las capas del transformer de FLUX.1-dev. FLUX.1-dev es un modelo de difusion de 12 000 millones de parametros basado en flow matching, con un codificador de texto (T5) y un VAE para la decodificacion latente. El LoRA modifica los pesos del transformer para sesgar la distribucion generada hacia contenido explicito, reduciendo la influencia del filtrado de seguridad aprendido durante el entrenamiento del modelo base.

La model card no especifica el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni la composicion de las imagenes utilizadas. Solo indica que la v2 corrige problemas de la v1, mejora la estabilidad y reduce el tamano de los pesos. No se documenta ningun proceso de RLHF, DPO ni evaluacion cuantitativa. La ausencia de informacion sobre procedencia de datos es un riesgo relevante desde el punto de vista de derechos de autor y de contenido ilegal.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante FLUX.1-dev con el LoRA aplicado.
- Generacion imagen-a-imagen (el `pipeline_tag` del repositorio es `image-to-image`).
- Sesgo deliberado hacia contenido NSFW mediante palabras gatillo: `nsfw`, `naked`, `nude`, `erotic`, `sensual`, `explicit`, `adult content`, `kissing`, `pron`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de salida mas alla de la imagen.
- No se documentan capacidades multilingues; los ejemplos estan en ingles.
- No dispone de modo "thinking" ni variantes de vision o audio.

## Casos de uso

- Investigacion sobre filtrado y alineacion en modelos de difusion: el LoRA puede emplearse como caso de estudio para medir hasta que punto un ajuste de bajo rango revierte las barreras de seguridad del modelo base.
- Auditoria de seguridad de pipelines de generacion de imagenes: permite comprobar si un despliegue concreto de FLUX.1-dev aplica filtros de salida suficientes cuando se cargan LoRAs de terceros.
- Pruebas de red teaming en plataformas de contenido generado: simular la carga de adaptadores no auditados para validar los mecanismos de moderacion.
- Desarrollo de clasificadores de contenido explicito: generar muestras controladas (dentro de un entorno aislado y legal) para entrenar o evaluar detectores NSFW.
- Estudio de la degradacion de calidad tras aplicar LoRAs agresivos: comparar fidelidad, coherencia anatomica y adherencia al prompt frente al modelo base.
- Docencia sobre riesgos de la IA generativa: ilustrar en un entorno controlado como un adaptador de 0,7 GB puede alterar el comportamiento de un modelo de 12 000 M de parametros.

No se recomienda ningun caso de uso comercial ni de produccion abierta al publico, por las restricciones de licencia y los riesgos legales descritos mas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA pesa 0,7 GB, pero requiere cargar FLUX.1-dev completo (12 000 M de parametros) para funcionar.
- VRAM estimada para FLUX.1-dev en `bfloat16`: aproximadamente 24 GB o mas; con cuantizacion (por ejemplo, fp8 o GGUF) puede reducirse a 12-16 GB, aunque no se documentan cuantizaciones oficiales de este LoRA.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) es el minimo practico en `bfloat16`.
- Despliegue: `diffusers` (`AutoPipelineForText2Image` + `load_lora_weights`), ComfyUI y Automatic1111/Forge mediante cargadores de LoRA para FLUX; no aplica `vLLM`, `llama.cpp` ni `Ollama` (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flux-Uncensored-V2 (este) | LoRA sobre FLUX.1-dev | Adaptador sobre 12 000 M | no aplica | creativeml-openrail-m / flux-1-dev-non-commercial | Hugging Face, 0 descargas |
| FLUX.1-dev (base) | Difusion texto-imagen | 12 000 M | no aplica | flux-1-dev-non-commercial | Hugging Face, ampliamente usado |
| FLUX.1-schnell | Difusion texto-imagen | 12 000 M | no aplica | Apache 2.0 | Hugging Face |
| Stable Diffusion XL | Difusion texto-imagen | 3 500 M | no aplica | CreativeML OpenRAIL++-M | Hugging Face, ecosistema amplio |

La comparativa se limita a caracteristicas estructurales: no hay datos de benchmarks publicados para este LoRA que permitan comparar calidad, fidelidad al prompt o tasas de NSFW frente a alternativas.

## Limitaciones y advertencias

- La model card incluye ejemplos de prompts que describen contenido sexual con menores ("nude middle school girls soccer team"). Esto constituye material potencialmente ilegal en Espana y la UE (pornografia infantil, articulo 189 del Codigo Penal) y viola las politicas de contenido de Hugging Face. No debe reproducirse, distribuirse ni utilizarse.
- La licencia es contradictoria: los metadatos indican `creativeml-openrail-m` mientras el README invoca la `flux-1-dev-non-commercial-license`. En cualquier caso, el uso comercial esta restringido o prohibido.
- El modelo base FLUX.1-dev tiene licencia no comercial; cualquier despliegue comercial requeriria una licencia aparte de Black Forest Labs.
- Riesgo elevado de generar contenido sexual no consentido, deepfakes o material de abuso; no se documentan mecanismos de moderacion ni filtros.
- No hay informacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos, derechos de autor o presencia de contenido ilegal en los datos.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad ni auditoria independiente.
- La calidad y estabilidad declaradas por el autor no estan respaldadas por benchmarks ni evaluaciones reproducibles.
- El uso de este artefacto en produccion sin filtros de salida y verificacion de edad expone al operador a responsabilidad legal.

## Enlaces

- Hugging Face: https://huggingface.co/Quwaterlo/Flux-Uncensored-V2
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Licencia FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md
- Sitio del autor declarado (EnhanceAI): https://enhanceai.art
- Discord del autor: https://discord.gg/cuCX9qur6f
- Repositorio referenciado en el codigo de ejemplo: `enhanceaiteam/Flux-uncensored-v2` (no verificado)

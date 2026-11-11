# alkyum/neverseen-flux-3-klein

## Resumen

`alkyum/neverseen-flux-3-klein` no es un modelo original, sino un espejo (mirror) reducido de los ficheros que utiliza el flujo de trabajo `flux-3-klein` de Neverseen Studio, cacheado por sus endpoints serverless de RunPod. Todos los ficheros se copian tal cual desde el repositorio upstream `black-forest-labs/flux-3-image-klein-comfy`, manteniendo su licencia original (FLUX Kommunity License v1.0). Por tanto, se trata de un paquete de pesos para un pipeline de generacion de imagenes (difusion), no de un modelo de lenguaje.

El contenido incluye cuatro componentes en formato `.safetensors` con cuantizacion int8 y w4a8: el modelo de difusion `flux3-image-klein-int8-convrot`, dos codificadores de texto (un Qwen3-VL de 4B y un Qwen3.5 de 9B configurado como prompt upsampler) y un VAE (`flux2-vae`). El tamano total del repositorio es de 17,7 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es limitada: no constituye una release oficial ni aporta documentacion tecnica propia. Resulta util unicamente como cache reproducible para quien necesite exactamente los mismos ficheros que emplea el endpoint de Neverseen Studio, con la advertencia de que la fuente de verdad y los terminos de uso son los del repositorio de Black Forest Labs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para generacion de imagenes (modelo de difusion + dos text encoders + VAE); detalles internos no disponibles |
| Parametros totales | No disponible (repositorio de 17,7 GB con varios componentes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (`int8-convrot`) en modelo de difusion y text encoder de 4B; w4a8 en el prompt upsampler de 9B |
| Idiomas soportados | No disponible |
| Licencia | FLUX Kommunity License v1.0 (heredada del upstream) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento: es una copia de ficheros. Por los nombres de los componentes se deduce un pipeline de difusion tipo FLUX con un modelo de imagen (`flux3-image-klein-int8-convrot.safetensors`), un codificador de texto multimodal basado en Qwen3-VL de 4B (`qwen3vl_4b_int8_convrot.safetensors`), un segundo codificador/prompt upsampler basado en Qwen3.5 de 9B cuantizado a w4a8 (`qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors`) y un VAE (`flux2-vae.safetensors`).

Las unicas innovaciones tecnicas observables son las derivadas de la cuantizacion: int8 con `convrot` en el modelo de difusion y el text encoder de 4B, y cuantizacion w4a8 en el upsampler de 9B, orientadas a reducir huella de memoria en despliegue serverless. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).

## Capacidades

- Generacion de imagenes a partir de prompts de texto, mediante el modelo de difusion FLUX 3 Klein.
- Codificacion de texto multimodal a traves del text encoder Qwen3-VL de 4B (soporte de vision por el nombre del componente, sin confirmacion documental).
- Reescritura o expansion de prompts (prompt upsampling) mediante el componente Qwen3.5 de 9B.
- Decodificacion latente a imagen con el VAE `flux2-vae`.
- Integracion en flujos ComfyUI (los ficheros provienen del repositorio `-comfy`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funciones de modelos de lenguaje.

## Casos de uso

- Reproduccion exacta de un pipeline de generacion de imagenes: usar los cuatro `.safetensors` con la misma estructura de directorios (`diffusion_models/`, `text_encoders/`, `vae/`) para replicar el flujo `flux-3-klein` de Neverseen Studio en local o en otro endpoint serverless.
- Despliegue en RunPod Serverless: el repositorio esta pensado como cache de pesos para endpoints; permite levantar una instancia sin descargar de nuevo desde el upstream, reduciendo el tiempo de arranque en frio.
- Generacion de imagenes en produccion con requisitos de memoria ajustados: las cuantizaciones int8 y w4a8 reducen el consumo de VRAM frente a los pesos originales en precision completa.
- Prototipado con ComfyUI: los nombres y la organizacion de ficheros coinciden con los esperados por ComfyUI, lo que facilita cargarlos en un grafo de generacion de imagen.
- Expansion automatica de prompts: el upsampler Qwen3.5 de 9B puede emplearse para enriquecer prompts cortos antes de pasarlos al modelo de difusion.
- Archivado reproducible de una version concreta: el pin al commit `9d36114cf7a2` del upstream permite fijar exactamente los mismos pesos en auditorias o experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. El repositorio ocupa 17,7 GB en disco; con cuantizacion int8 y w4a8 el pico de VRAM en inferencia sera inferior al de los pesos en precision completa, pero no se aporta cifra.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos, se requiere una GPU con al menos 24 GB de VRAM como punto de partida razonable (RTX 3090/4090, A100, H100), aunque no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 por la cuantizacion, sin dato verificado.
- Opciones de despliegue: ComfyUI (origen de los ficheros) y endpoints serverless de RunPod; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusion de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alkyum/neverseen-flux-3-klein | Mirror de pipeline de difusion FLUX 3 Klein (int8/w4a8) | No disponible | No aplica | FLUX Kommunity License v1.0 | Hugging Face (repo de 17,7 GB) |
| black-forest-labs/flux-3-image-klein-comfy | Pipeline de difusion FLUX 3 Klein original para ComfyUI | No disponible | No aplica | FLUX Kommunity License v1.0 | Hugging Face (upstream) |
| Otros modelos de difusion de imagen (p. ej. familia Stable Diffusion) | Difusion texto-a-imagen | No disponible | No aplica | Variable segun modelo | Hugging Face |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es una release oficial: es una copia de ficheros de terceros; cualquier problema de calidad o seguridad debe reportarse al repositorio upstream.
- La licencia es la FLUX Kommunity License v1.0, que impone restricciones adicionales al uso comercial; es imprescindible revisar `LICENSE.md` antes de desplegar en produccion.
- La model card no documenta arquitectura, entrenamiento, idiomas ni rendimiento; no hay garantias tecnicas mas alla de la integridad de los ficheros copiados.
- Riesgo de desactualizacion: el mirror queda fijado al commit `9d36114cf7a2`; no incorporara correcciones o mejoras posteriores del upstream.
- Las cuantizaciones int8 y w4a8 pueden degradar la calidad de las imagenes generadas frente a los pesos originales en mayor precision; no se aportan metricas de dicha degradacion.
- Sin descargas ni likes registrados: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Sesgos y riesgo de alucinacion visual: no documentados por el autor; aplican los sesgos propios del modelo subyacente FLUX 3 Klein.

## Enlaces

- Repositorio del mirror: https://huggingface.co/alkyum/neverseen-flux-3-klein
- Repositorio upstream: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Commit de referencia del upstream: `9d36114cf7a2` (en el repositorio anterior)
- Licencia FLUX Kommunity License v1.0: incluida como `LICENSE.md` en el repositorio
- Aviso legal del upstream: incluido como `NOTICE.md` en el repositorio

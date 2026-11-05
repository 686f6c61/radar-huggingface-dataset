# Chungulus/flux-3-image-klein-comfy-Q5_K_M-GGUF

## Resumen

FLUX 3 Image Klein distilled es un modelo de difusion para generacion y edicion de imagenes desarrollado originalmente por Black Forest Labs (BFL). Este repositorio concreto, publicado por el usuario Chungulus, contiene unicamente una cuantizacion GGUF de tipo Q5_K_M del transformer de difusion destilado, es decir, el componente que ejecuta el proceso de denoising. El transformer original tiene 5.548.681.984 parametros y el artefacto cuantizado ocupa aproximadamente 4 GB.

La relevancia de esta ficha radica en que permite ejecutar el nucleo del modelo de imagen en ComfyUI mediante la extension ComfyUI-GGUF, reduciendo el peso del transformer respecto al paquete BF16 original de BFL. No se trata de una release oficial: es un derivado comunitario modificado e independiente, y el autor lo declara explicitamente como no respaldado por BFL.

Es importante subrayar que este repositorio no incluye el checkpoint base sin destilar, el codificador de texto, el upsampler de prompts ni el VAE. Para un flujo funcional hay que combinar este GGUF con los ficheros complementarios del paquete original de BFL (codificador de texto Qwen3-VL de 4B en BF16 y VAE flux2-vae). El pipeline declarado es image-to-image, aunque el autor valida tanto generacion texto-a-imagen como edicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (image transformer) destilado, empaquetado como GGUF para ComfyUI |
| Parametros totales | 5.548.681.984 (transformer de difusion) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica contexto de texto) |
| Tipos de cuantizacion | Q5_K_M (unica variante en este repositorio) |
| Idiomas soportados | no disponible (el prompt se procesa via codificador de texto externo Qwen3-VL 4B) |
| Licencia | FLUX Kommunity License (license: other, license_name: flux-kommunity-license) |
| Formato de pesos | GGUF (unico fichero: flux-3-image-klein-comfy-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de difusion destilado orientado a generacion y edicion de imagenes. La destilacion implica que el checkpoint ha sido entrenado para requerir menos pasos de muestreo que un modelo no destilado, lo que se refleja en la configuracion de validacion documentada: 16 pasos con sampler Euler/simple y CFG 1.0. El autor no detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica de este repositorio no reside en la arquitectura, sino en el proceso de cuantizacion. Segun el autor, cada artefacto se genero partiendo de los pesos BF16 originales de forma independiente, sin recuantizar desde una fuente de baja precision y sin usar calibracion ni importance matrix. Se verificaron los nombres y formas de todas las tensoras cuantizadas y se comprobo el payload de las tensoras fuente durante la conversion BF16. Los modelos complementarios (codificador de texto y VAE) se mantuvieron en su precision original. ComfyUI detecta la red FLUX3 real a partir de los nombres de tensoras preservados.

## Capacidades

- Generacion texto-a-imagen: el autor valida el artefacto generando una muestra T2I con el flujo documentado.
- Edicion de imagen (image-to-image): validada mediante ReferenceMultiLatent con imagenes de referencia.
- Integracion en ComfyUI: se carga con Unet Loader (GGUF) de la extension ComfyUI-GGUF, sustituyendo al loader de modelo de difusion original.
- Compatibilidad con codificador de texto externo: usa qwen3vl_4b_bf16.safetensors cargado con CLIPLoader tipo flux3.
- Soporte de upsampling de prompt: para prompts cortos se recomienda el upsampler original o un LLM de expansion de captions.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de difusion de imagenes, no un LLM.
- Capacidades multilingues: no documentadas; dependen del codificador de texto Qwen3-VL externo.

## Casos de uso

- Generacion de imagenes en local con ComfyUI: cargando el GGUF con Unet Loader (GGUF) y los complementos originales, se puede generar imagen a partir de texto con 16 pasos, Euler/simple, CFG 1.0 y shift log(16), reduciendo el peso del transformer frente al BF16.
- Edicion de imagenes por referencia: mediante ReferenceMultiLatent se adjuntan imagenes de referencia y se aplican transformaciones, util para retoques guiados o variaciones de estilo en un flujo de trabajo artistico.
- Prototipado rapido de pipelines de imagen: al ocupar unos 4 GB el transformer cuantizado, es viable montar un entorno de pruebas en maquinas con VRAM moderada, siempre que se disponga del codificador de texto y el VAE originales.
- Experimentacion con cuantizaciones GGUF en difusion: sirve para evaluar el impacto de Q5_K_M frente a BF16 en calidad de imagen dentro de ComfyUI, aunque el autor advierte que la validacion es funcional y no un benchmark de calidad.
- Flujos de trabajo artisticos con expansion de prompt: combinando el upsampler original o un LLM de captions, se pueden generar escenas complejas descritas con captions largos y expandidos.
- Docencia y demostraciones de difusion cuantizada: el tamano contenido del artefacto facilita su distribucion y uso en talleres o entornos de aprendizaje sobre ComfyUI y modelos FLUX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las imagenes de validacion son comprobaciones funcionales limitadas, no un benchmark ni una garantia de calidad de imagen sin cambios. No se aportan metricas de FID, CLIP score, throughput ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El transformer cuantizado ocupa aproximadamente 4 GB en disco; a ello hay que sumar el codificador de texto Qwen3-VL 4B en BF16 y el VAE flux2-vae, que incrementan sustancialmente el consumo de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el tamano del GGUF (unos 4 GB) sugiere que el transformer en si podria caber en GPUs de consumo, pero el conjunto con codificador de texto y VAE no esta cuantificado y condiciona el requisito real.
- Opciones de despliegue: ComfyUI con la extension ComfyUI-GGUF (Unet Loader GGUF), CLIPLoader tipo flux3 para el codificador de texto y VAELoader para el VAE. El autor advierte que este GGUF de difusion se consume con ComfyUI-GGUF, no con la CLI de generacion de texto de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein distilled Q5_K_M (este repo) | 5.548.681.984 (transformer) | GGUF Q5_K_M | no aplica | FLUX Kommunity License | HuggingFace, comunidad |
| FLUX 3 Image Klein ComfyUI (BFL, BF16) | 5.548.681.984 (transformer) | safetensors BF16 | no aplica | FLUX Kommunity License | HuggingFace, oficial BFL |
| Otras cuantizaciones GGUF de FLUX 3 | no disponible | GGUF | no aplica | FLUX Kommunity License | no disponible en la informacion proporcionada |

La comparativa se limita al modelo base oficial en BF16 y a la variante cuantizada de este repositorio, ya que no se dispone de datos de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Derivado no oficial: es una modificacion comunitaria independiente, no una release oficial ni respaldada por Black Forest Labs.
- Licencia restrictiva: queda sujeta a la FLUX Kommunity License, con sus condiciones de uso y distribucion. Los terceros reciben los derechos directamente de BFL, no como sublicencia de Chungulus. No se reclama uso comercial sin restricciones.
- Repositorio incompleto por si solo: no incluye checkpoint base sin destilar, codificador de texto, upsampler de prompt ni VAE; requiere los ficheros complementarios del paquete original de BFL para funcionar.
- Validacion limitada: las comprobaciones son funcionales y no garantizan que la calidad de imagen se mantenga respecto al BF16; no hay benchmark publicado.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir contenido incoherente o no fiel al prompt; no se documentan sesgos especificos.
- Sin datos de sesgo ni de idioma: no se proporciona informacion sobre sesgos conocidos ni sobre cobertura linguistica.
- Cero adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sin garantias para produccion: el autor no ofrece garantias de rendimiento, latencia ni estabilidad en entornos productivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/flux-3-image-klein-comfy-Q5_K_M-GGUF
- Modelo base (BFL, ComfyUI): https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Revision concreta del paquete original referenciada por el autor: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/tree/9d36114cf7a2e03a45c28f5cc4987d20ebfdb6c1
- Extension ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia FLUX Kommunity (LICENSE.md en el repo): https://huggingface.co/Chungulus/flux-3-image-klein-comfy-Q5_K_M-GGUF/blob/main/LICENSE.md

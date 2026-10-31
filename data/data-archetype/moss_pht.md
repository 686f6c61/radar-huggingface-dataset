# data-archetype/moss_pht

## Resumen

moss_pht es un ajuste fino (fine-tune) completo y orientado a fotografía realista del modelo de generación de imágenes MOSS-Image-Base, publicado por el usuario data-archetype en HuggingFace. Se trata de un modelo de texto a imagen construido sobre la arquitectura de difusión de MOSS-Image, que emplea como codificador de texto Qwen3.5-9B y un VAE decodificador pequeño derivado de FLUX.2. El repositorio solo incluye el transformer del modelo de difusión (unos 5.082 millones de parámetros, 20,3 GB), ya que el resto de componentes se reutilizan sin cambios del modelo base.

Su relevancia radica en ofrecer una variante ligera y especializada en fotografía dentro del ecosistema MOSS-Image, compatible tanto con la librería Diffusers como con ComfyUI. El entrenamiento se ha realizado con un optimizador híbrido poco habitual (dionw, que combina Dion/NorMuon con AdamW), 12.500 pasos a 64 imágenes por paso y resolución de aproximadamente 1 megapíxel. Está publicado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow-matching), pipeline text-to-image de MOSS-Image |
| Parametros totales | 5.082.308.624 (solo transformer) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | Prompts de hasta 2.304 tokens (durante el entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos publicados); el text encoder Qwen3.5-9B admite variantes int8 y w4a8 en la distribucion de Comfy-Org |
| Idiomas soportados | Ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Diffusers en `transformer/` y archivo unico ComfyUI en `diffusion_models/moss_pht_bf16.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de todos los parametros del transformer de MOSS-Image-Base, con pesos maestros en fp32 y autocast en bf16; el codificador de texto (Qwen3.5-9B) y el VAE (decodificador pequeño de FLUX.2) permanecen congelados y se cargan desde el repositorio base. El pipeline emplea un scheduler propio de MOSS-Image con objetivo de flow-matching, y admite parametros de inferencia especificos como `uncond_skip_layers`.

El entrenamiento consistio en 12.500 pasos con un tamano de lote de 64 imagenes, usando buckets de relaciones de aspecto a unos 1 megapixel de resolucion. Las leyendas alcanzan hasta 2.304 tokens y el 10 % de los captions se descartaron (prompt vacio) como regularizacion. Los niveles de ruido se muestrearon de una logit-normal truncada (μ 1,09, σ 0,95, truncada en 0,95), mas 1 % uniforme y 1 % de ruido puro. Como novedad tecnica destacable, se uso el optimizador dionw: Dion (row-selected NorMuon) sobre las matrices de atencion y MLP, con Newton-Schulz por Gram, momentum heavy-ball de 0,95 y actualizacion del 25 % de las filas por paso; AdamW (β 0,9/0,975) para embeddings, proyecciones AdaLN, cabeza de salida, normas y sesgos. La tasa de aprendizaje fue 9e-6 con 200 pasos de calentamiento lineal, fase constante hasta el paso 10.500 y enfriamiento de 2.000 pasos siguiendo 1 − √. Los pesos publicados son la EMA (decay 0,999) en el paso 12.500, almacenados en bfloat16.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con orientacion fotografica y realista, heredada del ajuste fino.
- Comprension de prompts en lenguaje natural, etiquetas (tags) y formatos JSON de layout, segun la documentacion del modelo base.
- Soporte bilingue de prompts en ingles y chino.
- Generacion a resolucion de aproximadamente 1 megapixel (por ejemplo 1024x1024) con buckets de relaciones de aspecto.
- Control de inferencia mediante guidance scale, numero de pasos y saltos de capas en el paso incondicional (`uncond_skip_layers`).
- Compatibilidad con LoRA destilados DMD para muestreo en pocos pasos y mayor estabilidad.
- Integracion con Diffusers (carga modular de componentes, incluido text encoder cuantizado) y con ComfyUI de forma nativa.

## Casos de uso

- Generacion de fotografia sintetica realista: el ajuste fino esta orientado a imagenes con aspecto fotografico (escenas callejeras, retratos, paisajes), util para material de stock, moodboards y prototipado visual.
- Rellenado de bancos de imagenes para diseno: generacion de composiciones a 1024x1024 u otras relaciones de aspecto mediante buckets, integrable en flujos de trabajo de ComfyUI.
- Creacion de contenido bilingue: gracias al soporte de prompts en ingles y chino, permite equipos en entornos chino-espanol o chino-ingles generar imagenes desde prompts en su idioma.
- Generacion en lote con layouts estructurados: el formato JSON de prompts permite especificar composiciones de forma programatica en pipelines automatizados.
- Inferencia en hardware limitado: la posibilidad de sustituir el text encoder por una version cuantizada (int8 o w4a8) y usar `enable_model_cpu_offload()` permite desplegar el modelo en GPUs de consumo.
- Generacion rapida en produccion: combinando el modelo con un LoRA DMD destilado se reduce el numero de pasos de muestreo, adecuado para servicios interactivos.
- Investigacion en difusion: al publicarse en formato Diffusers con carga modular, es util como punto de partida para experimentos de fine-tuning o destilacion sobre MOSS-Image.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer ocupa unos 10 GB en bfloat16 (20,3 GB de repo incluyen ambos formatos); sumando text encoder Qwen3.5-9B (unos 18 GB en bf16) y VAE, una configuracion completa en bf16 requiere del orden de 28-32 GB de VRAM. No disponible una cifra oficial exacta.
- GPUs recomendadas: no disponible oficialmente; por tamano de memoria, una A100 u H100 de 40-80 GB acomoda el pipeline completo en bf16, y una RTX 4090 (24 GB) requeriria offload a CPU o text encoder cuantizado.
- Cabe en GPU de consumo: parcialmente; con `pipe.enable_model_cpu_offload()` o un text encoder int8/w4a8, el modelo puede ejecutarse en GPUs de 24 GB como la RTX 3090 o RTX 4090.
- Opciones de despliegue: Diffusers (>= 0.38, con transformers >= 5.3, accelerate >= 1.10), ComfyUI con soporte nativo de MOSS-Image (cargador "Load Diffusion Model" para el archivo unico). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable al ser un modelo de difusion).
- Latencia y throughput: no disponible; con el sampler multipaso estandar se recomiendan 50 pasos de inferencia, y con un LoRA DMD se reduce el numero de pasos.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto de prompt | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| data-archetype/moss_pht | 5.082 millones | hasta 2.304 tokens | Apache 2.0 | safetensors (Diffusers y ComfyUI) | Fine-tune fotografico de MOSS-Image-Base; text encoder Qwen3.5-9B y VAE FLUX.2 small |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | hasta 2.304 tokens | Apache 2.0 | safetensors (Diffusers y ComfyUI) | Modelo base generalista del que deriva moss_pht; mismo pipeline y componentes |
| FLUX.2 (componente VAE small) | no disponible | no disponible | no disponible | safetensors | Aporta el decodificador VAE pequeño usado por MOSS-Image; no se compara el modelo completo |

Comparaciones cuantitativas de rendimiento no disponibles: no hay benchmarks publicados para ninguno de los modelos de la tabla en la informacion proporcionada.

## Limitaciones y advertencias

- Inestabilidad en muestreo: el propio autor indica que las generaciones con el sampler multipaso estandar pueden ser algo inestables; se recomienda usar un LoRA DMD destilado de MOSS-Image-Base.
- Especializacion fotografica: al ser un fine-tune orientado a fotografia, su rendimiento en estilos no fotograficos (ilustracion, pintura) puede haberse degradado respecto al modelo base; no disponible una evaluacion concreta.
- Dependencia de componentes externos: el repositorio solo contiene el transformer; es necesario descargar text encoder, tokenizer, VAE y scheduler desde OpenMOSS-Team/MOSS-Image-Base o Comfy-Org/MOSS-Image.
- Codigo remoto: la carga del pipeline requiere `trust_remote_code=True` (clases dinamicas desde el repo base), lo que implica ejecutar codigo de terceros.
- Sesgos: no disponible informacion especifica sobre sesgos; al tratarse de un modelo generativo de imagenes entrenado con datos fotograficos, hereda los sesgos del dataset del modelo base, que no esta documentado en la ficha.
- Alucinacion / artefactos: no disponible informacion especifica; la inestabilidad del sampler multipaso es el problema documentado.
- Idioma: soporte limitado a prompts en ingles y chino; el rendimiento con prompts en otros idiomas (incluido el espanol) no esta documentado.
- Licencia: Apache 2.0, sin restricciones de uso comercial; el texto de la licencia se copia del modelo base.
- Uso en produccion: con 0 descargas registradas en el momento de la ficha, es un modelo muy nuevo y sin adopcion comunitaria verificada; conviene validar calidad y estabilidad antes de desplegarlo.

## Enlaces

- Ficha del modelo: https://huggingface.co/data-archetype/moss_pht
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Guia de usuario de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Componentes para ComfyUI (text encoder y VAE): https://huggingface.co/Comfy-Org/MOSS-Image
- Optimizador dionw: https://github.com/JTriggerFish/dionw

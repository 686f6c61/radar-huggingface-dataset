# DAGroup-PKU/G-star

## Resumen

G-star es un modelo de generacion de imagenes a partir de texto (text-to-image) desarrollado por DAGroup-PKU (Universidad de Pekin) y publicado en Hugging Face bajo licencia MIT. Su particularidad es que reutiliza un modelo de lenguaje existente, Qwen3-8B, como backbone generativo: en lugar de difundir latentes como los difusion models clasicos, el LLM genera una rejilla de 32x32 codigos discretos de un visual tokenizer (g16), que despues un refiner SR2x convierte en una imagen nativa de 2048x2048. Este enfoque autoregresivo unificado, similar al de modelos como Chameleon o Emu, integra la comprension y la generacion visual en la misma arquitectura transformer.

El repositorio incluye el modelo completo: el backbone Qwen3-8B con un puente de embeddings visuales y una cabeza de imagen denominada DSpark, el visual tokenizer g16 (16 codebooks de 16.384 entradas con downsampling de 32x) y el refiner SR2x con su propio encoder visual, codebooks, DiT y VAE. El peso total verificado en safetensors es de aproximadamente 9,64 mil millones de parametros, con un tamano de repositorio de 45,8 GB.

Es relevante porque representa la linea de trabajo que trata la generacion de imagenes como una tarea de modelado de secuencia, aprovechando el ecosistema de Transformers y las capacidades de razonamiento de un LLM moderno. Al ser un checkpoint en formato pretrain (sin tokens de rol SFT), esta orientado principalmente a investigacion y experimentacion, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (Qwen3-8B) con puente de embeddings visuales y cabeza de imagen DSpark; refiner SR2x con DiT y VAE |
| Parametros totales | 9.638.851.856 (verificado en safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (verificado en bfloat16) |
| Idiomas soportados | no disponible (hereda los de Qwen3, no documentado en la ficha) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

G-star emplea un enfoque autoregresivo hibrido: el backbone es un Qwen3-8B (transformer decoder) que no genera pixeles ni latentes continuos, sino tokens discretos de imagen. El visual tokenizer g16 cuantiza cada imagen en una rejilla de 32x32 codigos, con 16 codebooks de 16.384 entradas cada uno y un factor de downsampling de 32x, lo que significa que una imagen de 1024x1024 se comprime a 1024 tokens visuales. La cabeza DSpark se encarga del muestreo de estos codigos durante la generacion, con soporte de CFG (classifier-free guidance) en las ramas de inferencia.

La segunda etapa del pipeline es el refiner SR2x, un modulo unificado que incluye su propio encoder visual, codebooks, un DiT (Diffusion Transformer) y un VAE. Este refiner toma la salida de baja resolucion del LLM y produce una imagen nativa de 2048x2048 en 52 pasos por defecto. El tokenizer standalone se extrae del refiner emparejado, compartiendo los mismos codebooks aprendidos, lo que garantiza coherencia entre ambas etapas.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes empleados, ni sobre el uso de tecnicas de alineacion (RLHF/DPO). La model card indica que se han omitido deliberadamente rutas operacionales, nombres de experimentos y metadatos de entrenamiento de la version publica.

## Capacidades

- Generacion de texto a imagen (text-to-image) en resolucion nativa de 2048x2048 tras el refiner SR2x, con salida intermedia de 1024x1024 (rejilla 32x32 de codigos g16).
- Backbone basado en Qwen3-8B, lo que en teoria habilita comprension de lenguaje para la interpretacion de prompts (el checkpoint publicado usa formato pretrain, sin tokens de rol SFT).
- Muestreo configurable: top-k (4096 por defecto), top-p (0,75), temperatura (0,7) y guidance scale CFG (2,4).
- Carga modular de componentes individuales (LLM, tokenizer visual, refiner) mediante la API de Transformers con `trust_remote_code=True`.
- Pipeline de inferencia propio (`gstar.infer`) que gestiona prefijos de tamano de imagen, manejo de saltos de linea, ramas CFG y muestreo DSpark.
- No se documenta soporte de tool calling, agentes, entrada de audio ni edicion de imagenes existentes.

## Casos de uso

- Investigacion en modelos unificados de lenguaje y vision: el codigo y los pesos completos permiten estudiar arquitecturas autoregresivas de imagen con LLM, comparar codebooks y analizar el comportamiento del muestreo DSpark frente a difusion clasica.
- Generacion de imagenes fotograficas de alta resolucion: el refiner SR2x produce salidas nativas de 2048x2048 a partir de prompts descriptivos, adecuado para prototipado creativo local sin depender de APIs de terceros.
- Experimentacion con visual tokenizers: el tokenizer g16 (16 codebooks, 16.384 entradas, downsampling 32x) puede cargarse por separado para tareas de tokenizacion/reconstruccion de imagenes en proyectos de investigacion.
- Desarrollo de pipelines de inferencia personalizados: el codigo incluye la implementacion completa (`gstar/`) con configuracion de inferencia (`inference_config.json`) y checksums (`MANIFEST.json`), util para integrar el modelo en sistemas propios de generacion de imagenes.
- Evaluacion comparativa de enfoques text-to-image: al usar un LLM conocido (Qwen3-8B) como backbone, facilita comparaciones controladas frente a modelos de difusion como SDXL o FLUX en benchmarks de prompts reescritos.
- Refinado superresolucion (SR2x): el componente refiner puede estudiarse de forma aislada como sistema de superresolucion 2x sobre imagenes de baja resolucion generadas u otras fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una validacion interna sobre cuatro prompts de benchmark reescritos, verificando rejillas completas de codigos de imagen y salidas finitas del SR2x, registrada en `VALIDATION.json`.

## Requisitos de hardware

- Verificado oficialmente en NVIDIA H100 80 GB, con un trabajador de inferencia por GPU.
- Los pesos ocupan aproximadamente 45,8 GB en el repositorio; en bfloat16, el modelo completo (LLM + tokenizer + refiner) requiere en torno a 45-50 GB de VRAM, por lo que no cabe de forma comoda en GPUs de consumo de 24 GB (RTX 3090/4090) sin cuantizacion u offloading, para las que no hay recetas publicadas.
- GPUs recomendadas: H100 80 GB (verificado); A100 80 GB es una alternativa razonable con la misma capacidad de memoria.
- Stack verificado: Python 3.12, PyTorch 2.6.0, CUDA 12.4, Transformers 4.57.0, FlashAttention 2.7.4.post1, Diffusers 0.38.0, Accelerate 1.12.0.
- Despliegue mediante el CLI propio `gstar.infer` (incluye CFG, muestreo DSpark y prefijos de tamano); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La carga de componentes individuales usa la API estandar de Transformers.
- No hay datos publicados de latencia o throughput. La model card advierte que semillas identicas no garantizan imagenes identicas entre distintos hardware.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Resolucion de salida | Licencia |
|---|---|---|---|---|
| G-star (DAGroup-PKU) | Autoregresivo (Qwen3-8B + tokenizer g16 + refiner SR2x) | ~9,64 B (total) | 2048x2048 (nativa tras refiner) | MIT |
| FLUX.1-dev (Black Forest Labs) | Difusion (DiT rectified flow) | ~12 B | hasta 2048x2048 | No comercial (licencia propia) |
| Stable Diffusion XL (Stability AI) | Difusion latente (UNet) | ~3,5 B (base+refiner) | 1024x1024 nativa | CreativeML Open RAIL++-M |
| Chameleon-7B (Meta) | Autoregresivo unificado texto+imagen | 7 B | 512x512 aprox. | Chameleon License (no comercial) |

G-star se distingue de los difusion models en que la generacion es autoregresiva sobre tokens discretos con un LLM como backbone, lo que facilita futuras extensiones multimodales unificadas; frente a Chameleon, ofrece mayor resolucion de salida gracias al refiner SR2x y una licencia MIT plenamente permisiva.

## Limitaciones y advertencias

- El checkpoint publicado usa formato de prompt pretrain, sin tokens de rol SFT, lo que sugiere que no ha pasado por una fase de ajuste por instrucciones; los prompts se usan tal cual se proporcionan y cualquier reescritura debe gestionarse externamente.
- La model card advierte explicitamente que los detalles finos de las imagenes pueden contener errores de generacion.
- Semillas identicas no garantizan imagenes identicas entre diferentes hardware, lo que complica la reproducibilidad exacta en produccion.
- No se publica informacion sobre datos de entrenamiento, sesgos del modelo ni medidas de mitigacion; al tratarse de un modelo de generacion de imagenes, deben asumirse riesgos habituales de sesgo demografico y generacion de contenido problematico sin filtros documentados.
- No hay documentacion de contexto del LLM, idiomas soportados ni cuantizaciones alternativas; el uso verificado es en bfloat16 sobre CUDA con FlashAttention.
- El refiner requiere 52 pasos por defecto, con un coste computacional adicional significativo respecto a generar solo la rejilla de codigos.
- La validacion publica se limita a cuatro prompts de benchmark; no hay evaluacion exhaustiva de calidad o seguridad publicada.
- Licencia MIT sin restricciones de uso comercial, pero se retienen atribuciones de codigo upstream que deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DAGroup-PKU/G-star
- No se han encontrado enlaces adicionales relevantes (paper, blog o repositorio externo) en la informacion disponible.

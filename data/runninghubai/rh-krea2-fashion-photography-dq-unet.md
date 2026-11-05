# RunningHubAI/rh-krea2-fashion-photography-dq-unet

## Resumen

rh-krea2-fashion-photography-dq-unet es un modelo de difusion para generacion y edicion de imagenes fotorrealistas, publicado por el usuario RunningHubAI en Hugging Face. Se trata de un UNet afinado (fine-tune) a partir del modelo base Krea 2 Turbo, orientado a fotografia de moda y retrato, con un estilo visual muy definido y activado mediante la palabra disparadora "DQ". El modelo se distribuye como pesos UNet en formato safetensors (17 468 MiB) y esta pensado para ejecutarse en ComfyUI, RunningHub o infraestructura compatible.

La propuesta practica del modelo es la generacion rapida de imagenes de alta resolucion (1024x1536) en tan solo 8 pasos de muestreo con CFG 1, lo que reduce drasticamente el coste computacional frente a los pipelines de difusion tradicionales de 20-50 pasos. Emplea una base cuantizada en FP8 junto con el codificador de texto Qwen3 VL, e incorpora expansion inteligente de prompts.

Es relevante en el ecosistema actual porque ejemplifica la tendencia de modelos de difusion "turbo" especializados por dominio, empaquetados para flujos de trabajo de ComfyUI y comercializados mediante plataformas de inferencia como RunningHub. La informacion publica es escasa: no se detallan parametros totales, licencia explicita ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (fine-tune de Krea 2 Turbo) con text encoder Qwen3 VL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el contexto lo determina el codificador de texto Qwen3 VL) |
| Tipos de cuantizacion | base FP8; pesos distribuidos en safetensors (17 468 MiB) |
| Idiomas soportados | no disponible (los prompts del ejemplo estan en ingles) |
| Licencia | no disponible (se indica que se sigue la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`krea2性感美女.safetensors`, 17 468 MiB) |

## Arquitectura y entrenamiento

El modelo es un UNet de difusion derivado de Krea 2 Turbo, un modelo text-to-image orientado a fotografia realista. La arquitectura subyacente es la habitual en modelos de difusion latente: un UNet que predice el ruido en el espacio latente, condicionado por embeddings de texto generados por el codificador Qwen3 VL. La base esta cuantizada en FP8, lo que reduce el peso en memoria y acelera la inferencia en GPUs modernas.

El ajuste fino se ha realizado sobre el modelo base Krea 2 con el objetivo de especializarlo en fotografia de moda y retrato, introduciendo la palabra disparadora "DQ" para activar el estilo. No se especifican en la model card el numero de pasos de entrenamiento, el volumen del dataset, la composicion de las imagenes de entrenamiento ni si se emplearon tecnicas como RLHF o DPO (no aplicables en difusion en el sentido estricto). Tampoco se detalla si se uso LoRA, DreamBooth o un fine-tune completo. La configuracion recomendada es de 8 pasos de muestreo, CFG 1, sampler euler y scheduler simple, coherente con el diseno "Turbo" del modelo base.

## Capacidades

- Generacion de imagenes fotorrealistas de moda y retrato a partir de descripciones textuales (text-to-image).
- Edicion de imagenes (image edit) segun la etiqueta de tipo de modelo de la propia model card.
- Generacion ultrarrápida en 8 pasos con CFG 1, orientada a produccion y prototipado rapido.
- Resolucion de salida nativa de 1024x1536 (formato vertical, adecuado para retrato y moda).
- Expansion y optimizacion inteligente de prompts (segun la model card).
- Control de estilo mediante la palabra disparadora "DQ" para activar la estetica del fine-tune.
- Integracion con ComfyUI y con la plataforma RunningHub (API y entorno web).

## Casos de uso

- **Generacion de editoriales de moda**: el modelo produce retratos verticales en 1024x1536 con iluminacion natural y profundidad de campo reducida, adecuados para maquetas de revistas o lookbooks, gracias a su fine-tune especifico en fotografia de moda.
- **Prototipado rapido de campanas publicitarias**: con 8 pasos y CFG 1, un equipo creativo puede generar decenas de variaciones de una misma idea en pocos minutos para validar direcciones artisticas antes de una sesion fotografica real.
- **Generacion de imagenes para e-commerce**: creacion de imagenes de producto con modelos o ambientaciones coherentes con una estetica de marca, usando el trigger "DQ" para mantener consistencia de estilo entre lotes.
- **Ilustracion de articulos y blogs**: generacion de imagenes de acompanamiento para contenidos sobre moda, belleza o estilo de vida, con control fino del encuadre y la iluminacion mediante prompts detallados.
- **Edicion y retoque asistido**: al tratarse de un modelo de image edit, puede emplearse para modificar atributos de una fotografia existente (vestuario, fondo, iluminacion) manteniendo la identidad visual del sujeto.
- **Creacion de assets para videojuegos o narrativa visual**: generacion de retratos de personajes con estetica fotorrealista para prototipos, storyboards o fichas de personaje.
- **Pipeline automatizado en ComfyUI**: integracion en flujos de trabajo con nodos personalizados para generacion por lotes, variaciones controladas y postprocesado dentro de un estudio de diseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos UNet ocupan 17 468 MiB (aproximadamente 17 GB) en el formato distribuido; con la base FP8 y el text encoder Qwen3 VL cargado en memoria, se requiere una GPU con al menos 24 GB de VRAM para un funcionamiento comodo, y 32 GB o mas para margen adicional.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), RTX 5090 (32 GB), A100 (40/80 GB), H100 (80 GB) y L40S (48 GB). En GPUs de 16 GB o menos sera necesario recurrir a cuantizaciones adicionales o a la descarga parcial de modulos.
- **Compatibilidad con GPU de consumo**: si, en RTX 4090 y RTX 5090; en RTX 4080/4070 Ti Super (16 GB) puede requerir ajustes de memoria.
- **Opciones de despliegue**: ComfyUI (entorno nativo del modelo), plataforma RunningHub (web y API), y potencialmente otros runners de difusion compatibles con UNet en safetensors. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs.
- **Latencia y throughput**: no se publican cifras concretas; la configuracion de 8 pasos con CFG 1 esta disenada para minimizar el tiempo de inferencia, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-fashion-photography-dq-unet | UNet de difusion (fine-tune) | no disponible | 1024x1536, 8 pasos | no disponible | Hugging Face, ComfyUI, RunningHub |
| Krea 2 Turbo (base) | UNet de difusion | no disponible | 1024x1536 aprox., turbo | segun proyecto original | no disponible en la informacion |
| FLUX.1 [dev] / [schnell] | DiT de difusion | 12B (dev) | hasta 2 MP | no comercial (dev) / Apache 2.0 (schnell) | Hugging Face, ComfyUI |
| Stable Diffusion 3.5 Large | MMDiT de difusion | 8B | hasta 1 MP | Stability Community License | Hugging Face, ComfyUI |

La comparacion con FLUX y SD 3.5 se ofrece como referencia de categoria (difusion text-to-image), pero no se dispone de datos de rendimiento del modelo de RunningHub frente a ellos. No se han publicado benchmarks comparativos en la informacion disponible.

## Limitaciones y advertencias

- **Informacion muy limitada**: la model card no especifica parametros, licencia explicita, idiomas soportados ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- **Licencia ambigua**: se indica que se sigue la licencia del proyecto original (Krea 2) o upstream, pero no se concreta; es imprescindible verificar los terminos de Krea 2 antes de un uso comercial.
- **Sesgo de dominio**: al ser un fine-tune de fotografia de moda y retrato, puede producir resultados poco diversos o estereotipados fuera de ese dominio (por ejemplo, en escenas de paisaje, arquitectura o ilustracion).
- **Riesgo de alucinacion visual**: como todo modelo de difusion, puede generar anatomias incorrectas, manos deformes, texto ilegible o incoherencias en fondos complejos.
- **Dependencia del trigger "DQ"**: el estilo del fine-tune se activa con esta palabra; sin ella, el comportamiento puede degradarse o desviarse del esperado.
- **Idioma**: no se confirma soporte multilingue; los ejemplos estan en ingles y el codificador Qwen3 VL podria no rendir igual en castellano.
- **Requisitos de memoria elevados**: 17 GB de pesos UNet mas el text encoder exigen GPUs de gama alta; no es adecuado para entornos con VRAM limitada sin cuantizacion adicional.
- **Cero adopcion publica**: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su calidad ni casos de uso reportados.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-fashion-photography-dq-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2083893710508527618
- Pagina del autor (DQ): https://www.runninghub.ai/user-center/1964327004055224322
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model

# Shihan420/Qwen-Image-2.1-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-GGUF es una redistribucion en formato GGUF del modelo de generacion de imagenes Qwen-Image-2.1 desarrollado por el equipo Qwen (Alibaba). El repositorio lo publica el usuario Shihan420 y no introduce cambios en los pesos: se trata de una conversion a cuantizaciones GGUF de los pesos base originales, etiquetada como "uncensored" por motivos de nomenclatura, sin que exista evidencia de un ajuste fino que elimine filtros de contenido. El modelo resuelve generacion de imagenes texto-a-imagen y edicion de imagenes en un unico modelo unificado.

El componente de generacion visual emplea una arquitectura Diffusion Transformer (DiT) de 32 capas Single-Stream con aproximadamente 7.115 millones de parametros, lo que lo situa en un rango eficiente para inferencia local. Se complementa con un codificador de texto Qwen3-VL de 8.000 millones de parametros y un VAE propio, empaquetados en el mismo repositorio para su uso directo en ComfyUI.

Su relevancia actual radica en que permite ejecutar un modelo de generacion de imagenes de ultima generacion en hardware de consumo mediante cuantizaciones de 4 a 8 bits, con integracion nativa en el ecosistema ComfyUI-GGUF. El repositorio ocupa 105,2 GB en total y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT), 32 capas Single-Stream |
| Parametros totales | 7.115.124.736 en el componente de generacion visual; codificador de texto Qwen3-VL de 8B adicional |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generacion de imagen); no disponible para el codificador de texto |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponibles |
| Licencia | qwen-research (identificador "other" en HuggingFace) |
| Formato de pesos | GGUF y safetensors (incluye text encoder y VAE en safetensors) |

## Arquitectura y entrenamiento

La ficha no aporta detalles sobre el proceso de entrenamiento del modelo base Qwen-Image-2.1 mas alla de su arquitectura. Segun la informacion publica de Qwen, se trata de un modelo unificado de generacion texto-a-imagen y edicion de imagenes, con un componente de generacion visual de 7B de parametros distribuido en 32 capas Single-Stream DiT. Este diseno busca un equilibrio entre calidad de generacion, eficiencia de inferencia y versatilidad frente a arquitecturas DiT con mas parametros.

El repositorio objeto de esta ficha no entrena ni modifica el modelo: aplica cuantizaciones de los pesos originales (BF16, FP8, INT8, NVFP4, MLX y cuantizaciones k-quant tipo Q4/Q5/Q6/Q8). El pipeline completo requiere tres componentes: el DiT en GGUF o safetensors, el codificador de texto Qwen3-VL 8B (en BF16 o INT8 ConvRot) y el VAE `qwen_image_2.1_vae_bf16`. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si se emplearon tecnicas de alineacion tipo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Edicion de imagenes, al tratarse de un modelo unificado de generacion y edicion.
- Interpretacion de prompts mediante el codificador de texto Qwen3-VL 8B, con potencial multilingue heredado del modelo Qwen3-VL (no confirmado en la ficha).
- Ejecucion local en ComfyUI mediante el nodo `Unet Loader (GGUF)` y el ecosistema ComfyUI-GGUF (fork leejet).
- Variante etiquetada como "uncensored", aunque los pesos corresponden a los originales sin modificacion documentada.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagen, no un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de ilustraciones y concept art: el modelo produce imagenes a partir de descripciones textuales, adecuado para prototipado visual rapido en estudios de diseno y desarrollo de videojuegos.
- Edicion y retoque de imagenes: al ser un modelo unificado de generacion y edicion, permite modificar imagenes existentes mediante instrucciones en lenguaje natural.
- Produccion por lotes en pipelines ComfyUI: la integracion con ComfyUI-GGUF permite encadenar nodos y automatizar la generacion de grandes volumenes de imagenes.
- Inferencia local con privacidad: al ejecutarse en hardware propio, los prompts y las imagenes no salen del equipo, adecuado para entornos con requisitos de confidencialidad.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (4,60 GB) puede ejecutarse en GPU de gama alta de consumo y en Apple Silicon via MLX, abaratando el coste frente a APIs en la nube.
- Creacion de material grafico para marketing y redes sociales: generacion rapida de variaciones de una misma escena variando el prompt.
- Experimentacion en investigacion: la disponibilidad de cuantizaciones de 4 a 8 bits permite estudiar el impacto de la precision en la calidad de salida sin necesidad de clústeres de GPU.
- Maquetas y wireframes visuales: generacion de referencias graficas durante fases tempranas de diseno de producto.

## Benchmarks y rendimiento

La model card incluye una referencia a una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`), pero no se proporcionan valores numericos extraibles en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 105,2 GB, pero solo es necesario descargar la cuantizacion deseada.
- Componentes en memoria para inferencia: DiT cuantizado + codificador de texto + VAE.
- Cuantizacion Q4_K_M del DiT: 4,60 GB (recomendada por el autor por equilibrio tamano/calidad).
- Codificador de texto Qwen3-VL 8B: 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot (opcion recomendada para menor consumo de memoria).
- VAE en BF16: 676 MB.
- Estimacion de VRAM agregada en Q4_K_M + codificador INT8 + VAE: aproximadamente 14-15 GB, sin contar el overhead de ComfyUI ni el espacio para latentes.
- GPU recomendadas: RTX 4090 (24 GB) y superiores son suficientes para la configuracion recomendada; RTX 3090 (24 GB) es viable; GPU con 16 GB pueden requerir ajustes de descarga de componentes o cuantizaciones mas agresivas.
- Apple Silicon: soportado mediante las cuantizaciones MLX (4-bit 4,00 GB, 6-bit 5,78 GB, 8-bit 7,56 GB).
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork leejet, con soporte nativo de Qwen-Image 2.1); no se documentan otros backends como vLLM, llama.cpp u Ollama.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros (componente visual) | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shihan420/Qwen-Image-2.1-Uncensored-GGUF | ~7,1B (DiT 32 capas) | BF16, FP8, INT8, NVFP4, MLX, Q4-Q8 | qwen-research | GGUF + safetensors, ComfyUI |
| Qwen/Qwen-Image-2.1 | ~7,1B (DiT 32 capas) | pesos oficiales | qwen-research | repositorio oficial |
| shriwastav/Qwen-Image-2.1-Uncensored-GGUF | ~7,1B (DiT 32 capas) | GGUF | qwen-research | GGUF, ComfyUI |

Las alternativas disponibles en la informacion proporcionada son redistribuciones del mismo modelo base, por lo que las diferencias se limitan al conjunto de cuantizaciones ofrecidas y a la integridad de los enlaces de descarga. No se dispone de datos de benchmarks comparativos entre ellas.

## Limitaciones y advertencias

- La etiqueta "uncensored" no esta respaldada por ningun ajuste documentado: segun las fuentes disponibles, los pesos corresponden a los originales sin modificacion, por lo que pueden persistir los filtros de contenido del modelo base.
- Los enlaces de archivos de la model card apuntan al repositorio `abenzerps/Qwen-Image-2.1-Uncensored-GGUF` y no al repositorio `Shihan420`, lo que introduce riesgo de confusion o de enlaces rotos.
- No se documentan sesgos conocidos, pero al ser un modelo de generacion de imagenes entrenado por Qwen, es previsible que herede sesgos de representacion de su dataset (no confirmado).
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir resultados anatomicamente incorrectos, texto ilegible en la imagen o elementos incoherentes con el prompt.
- Licencia `qwen-research` (identificador "other"): es una licencia de investigacion, por lo que el uso comercial puede estar restringido y requiere revision de los terminos del modelo base antes de cualquier despliegue productivo.
- El repositorio registra 0 descargas y 0 likes, sin garantia de mantenimiento ni de calidad de las conversiones.
- No hay datos sobre idiomas soportados ni sobre el rendimiento del codificador de texto en castellano.
- La disponibilidad depende del fork `leejet/ComfyUI-GGUF`; con el fork antiguo `city96/ComfyUI-GGUF` puede aparecer el error `Unknown model architecture!`.
- El autor no publica informacion sobre el proceso de cuantizacion, validacion de calidad ni metodologia de conversion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Shihan420/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork leejet): https://github.com/leejet/ComfyUI-GGUF
- Repositorio similar en HuggingFace (shriwastav): https://huggingface.co/shriwastav/Qwen-Image-2.1-Uncensored-GGUF
- Guia de ejecucion (hoangyell): https://hoangyell.com/qwen-image-2-1-uncensored-comfyui/
- Articulo sobre ejecucion local (stashbase.ai): https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Repositorio referenciado en la model card (abenzerps): https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF

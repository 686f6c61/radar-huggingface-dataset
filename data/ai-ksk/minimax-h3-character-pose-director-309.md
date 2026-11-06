# AI-KSK/minimax-h3-character-pose-director-309

## Resumen

AI-KSK/minimax-h3-character-pose-director-309 es un repositorio de Hugging Face que, pese a su nombre, no contiene un modelo de lenguaje ni pesos de IA generativa: aloja un paquete de recursos para ComfyUI centrado en la direccion de pose y personaje en generacion de imagenes. El contenido principal es un workflow JSON de 14 nodos y 19 enlaces que orquesta modelos Qwen Image 2.1, un encoder de vision-lenguaje Qwen3-VL 8B y un LoRA especifico de pose (VNCCS_QI2_PoseStudioV1.1), junto con capturas de referencia y una portada seleccionada. El repositorio no incluye los pesos de los modelos referenciados ni la imagen de personaje, y su tamano declarado es de 0,0 GB.

El flujo separa explicitamente la referencia de pose de la apariencia del personaje: Pose Studio aporta la imagen de pose al encoder, mientras que un nodo LoadImage aporta la imagen de personaje. La generacion es por condicionamiento de imagen, no por deformacion de latentes de origen ni por ControlNet de articulaciones duras, y el autor advierte de que las referencias y el LoRA no garantizan una pose, identidad, vestuario o anatomia exactos en la salida.

La relevancia del paquete es acotada: documenta una configuracion concreta de ComfyUI (25 pasos, CFG 1, sampler Euler/simple, denoise 1, seed fija 488345170733023) y enlaza a demos en RunningHub y Civitai. No se ha publicado informacion sobre licencia del modelo, benchmarks, requisitos de hardware verificados ni resultados de aceptacion visual; el propio autor indica que no se incluye ninguna verificacion de ejecucion, tiempos, memoria ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de workflow para ComfyUI; referencia a Qwen Image 2.1 y Qwen3-VL 8B como componentes externos) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Referencias a int8 (qwen_image_2.1_int8_convrot, qwen3vl_8b_int8_convrot) y bf16 (VAE); no se documentan otras |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el autor indica que no se afirma una licencia comercial global; la publicacion en Civitai es "no commercial use, no derivatives" por defecto) |
| Formato de pesos | No se incluyen pesos; el repositorio contiene workflow JSON y capturas PNG. Los assets referenciados son safetensors (Qwen Image 2.1 int8, Qwen3-VL 8B int8, VAE bf16, LoRA Pose Studio V1.1) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino un grafo de ComfyUI de 14 nodos y 19 enlaces que compone varios componentes de terceros. La generacion se realiza con Qwen Image 2.1 en cuantizacion int8 (qwen_image_2.1_int8_convrot.safetensors), un encoder Qwen3-VL 8B tambien en int8 (qwen3vl_8b_int8_convrot.safetensors) y un VAE en bf16 (qwen_image_2.1_vae_bf16.safetensors). Sobre el modelo base se aplica el LoRA VNCCS_QI2_PoseStudioV1.1 con fuerza 1, y se configura una cache QwenImage21Cache en modo gpu/int8.

El flujo usa condicionamiento por imagen: Pose Studio488 alimenta image1 al encoder484 y LoadImage470 aporta image2 (personaje); image3 queda sin conectar. La salida lighting_prompt de Studio se conecta al prompt del encoder y sobrescribe la frase antigua del widget sobre reemplazar la pose de image2 por la de image1; las tres cadenas guardadas dicen "Draw character from image2" y la plantilla de exportacion incluye marcadores lighting/user_prompt con user_prompt vacio. GetImageSize505 toma la imagen del editor y suministra ancho y alto a EmptyLatentImage479, sustituyendo los valores por defecto de 1024x1024; la salida de batch-size no esta conectada y el latente vacio mantiene batch size 1. El muestreo configurado es KSampler con 25 pasos, CFG 1, Euler/simple, denoise 1 y seed 488345170733023 con control fijo. No se documentan datos de entrenamiento, tokens, composicion del dataset ni tecnicas de RLHF/DPO, ya que no se entrena ningun modelo en este repositorio.

## Capacidades

- Generacion de imagenes condicionada por imagen de personaje y referencia de pose, mediante el pipeline Qwen Image 2.1 y el LoRA Pose Studio V1.1.
- Direccion de pose y encuadre a traves de Pose Studio, con salida lighting_prompt que se inyecta en el prompt del encoder.
- Control de dimensiones de salida mediante GetImageSize, que ajusta el latente vacio a las dimensiones de la imagen del editor (capturas guardadas de 1520x1024).
- Exportacion en modo LIST con registros de pose y capturas PNG embebidas.
- Comparacion visual interna mediante Comparer504, que contrasta la imagen generada (lado A) con la imagen del editor (lado B); no compara con la imagen de personaje.
- Guardado de resultados con SaveImage506 y prefijo "ComfyUI".
- No se documentan capacidades de texto, razonamiento, codigo, matematicas, tool calling, agentes, multilingue, thinking mode, vision general, audio ni function calling.

## Casos de uso

- Prototipado de direccion de pose en ComfyUI: cargar el workflow JSON, sustituir los assets por los modelos Qwen Image 2.1 y el LoRA Pose Studio, y generar variaciones de pose a partir de una imagen de referencia y una imagen de personaje. Es adecuado porque el grafo ya separa ambas entradas y fija los parametros de muestreo.
- Evaluacion de pipelines de condicionamiento por imagen: usar el flujo como base para comparar resultados entre distintas imagenes de pose manteniendo fija la semilla 488345170733023 y los 25 pasos, lo que permite reproducibilidad basica.
- Integracion en herramientas de direccion artistica: el nodo Pose Studio y su salida lighting_prompt permiten modificar instrucciones de iluminacion y prompt sin tocar manualmente el encoder, aunque el autor advierte que editar un campo sobrescrito puede no afectar al prompt activo.
- Generacion de referencias para storyboard o previsualizacion: con capturas de 1520x1024 y control de dimensiones via GetImageSize, el flujo puede producir imagenes de referencia para revision humana posterior.
- Docencia y demostracion de grafos ComfyUI: el paquete incluye el JSON completo con 14 nodos y 19 enlaces, util para explicar separacion de roles de imagen, cache int8 y conexion de VAE a encoder y decoder.
- Pruebas de aceptacion visual: usar Comparer504 para contrastar la salida con la imagen del editor y revisar por separado identidad, vestuario, manos, silueta e iluminacion, tal como recomienda el autor.
- Publicacion de workflows en Civitai o RunningHub: el repositorio enlaza a entradas ya publicadas y sirve como referencia de empaquetado, aunque la licencia por defecto en Civitai es no comercial y sin derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el paquete no incluye verificacion de ejecucion, aceptacion visual, tiempos, memoria ni licencia, y que las capturas seleccionadas no son muestras de salida verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no verifica ahorros de memoria ni comportamiento de precision; la configuracion QwenImage21Cache en gpu/int8 no se traduce en cifras confirmadas.
- GPU recomendadas: no disponible. No se documentan modelos de GPU probados.
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en RTX 4090 ni en otras GPU consumer.
- Opciones de despliegue: ComfyUI es el entorno previsto, con nodos personalizados (Pose Studio, QwenImage21Cache, GetImageSize, Comparer504). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este flujo de generacion de imagen.
- Latencia y throughput: no disponibles. No se incluyen mediciones de tiempo ni de rendimiento.

## Comparativa con modelos similares

| Aspecto | Este repositorio (AI-KSK/minimax-h3-character-pose-director-309) | Qwen Image 2.1 (modelo base referenciado) | Flujos ComfyUI con ControlNet de pose (generico) |
|---|---|---|---|
| Tipo | Paquete de workflow JSON y capturas | Modelo de generacion de imagen | Grafo de ComfyUI con ControlNet |
| Parametros | No disponible | No disponible en la informacion | No disponible |
| Contexto | No aplica | No disponible | No disponible |
| Condicionamiento de pose | Por imagen de referencia via Pose Studio y LoRA | No disponible | Por mapa de pose con articulaciones |
| Licencia | No disponible; Civitai sin uso comercial por defecto | No disponible | Variable segun modelo |
| Disponibilidad | Hugging Face, RunningHub, Civitai | Referenciado como asset externo | Amplia en la comunidad |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; solo workflow JSON, capturas y portada. Los assets Qwen Image 2.1, Qwen3-VL 8B, VAE y LoRA deben obtenerse por separado.
- La generacion es condicionamiento por imagen, no deformacion de latentes de origen ni ControlNet de articulaciones duras; no se garantiza pose, identidad, vestuario o anatomia exactos.
- Las referencias y el LoRA expresan relaciones deseadas, pero no prueban el resultado final; el autor recomienda revisar pose, silueta, manos, identidad, vestuario, iluminacion y cambios no deseados.
- Las tres capturas guardadas no equivalen a tres flujos independientes ni a prueba de tres resultados correctos; el manejo de listas y batches debe comprobarse en la implementacion de los nodos instalados.
- El estado serializado del editor no es una cache desechable y puede afectar a la ejecucion; editar un campo sobrescrito del encoder puede no afectar al prompt activo.
- El autor no verifica memoria, precision, velocidad ni compatibilidad de la configuracion int8/gpu.
- Licencia no disponible: no se afirma licencia comercial global. La publicacion en Civitai es no comercial y sin derivados por defecto, sin evidencia de licencia separada.
- Riesgo de sesgos y alucinacion visual: no documentado por el autor; aplican los sesgos del modelo base y del LoRA, no evaluados en este paquete.
- Los enlaces a tutoriales (YouTube, Bilibili) no han sido verificados en vivo; el titulo y autor se obtuvieron via oEmbed.
- La portada seleccionada no es una muestra de salida verificada; revisar derechos de medios embebidos antes de publicar.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-character-pose-director-309
- RunningHub internacional: https://www.runninghub.ai/zh-cn/post/2102678363970605058?inviteCode=rh-v1111
- RunningHub China: https://www.runninghub.cn/post/2102626865503625217/?inviteCode=rh-v1111
- Civitai: https://civitai.com/models/3031898
- Tutorial YouTube: https://www.youtube.com/watch?v=eQep5Vq03RA
- Tutorial Bilibili: https://www.bilibili.com/video/BV14cht6NE8D

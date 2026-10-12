# Shan2005/wan-gguf

## Resumen

Shan2005/wan-gguf es un repositorio de pesos cuantizados en formato GGUF derivado de Comfy-Org/Wan_2.1_ComfyUI_repackaged, es decir, una reempaquetadura de los modelos de generacion de video Wan 2.1 orientada a su ejecucion en ComfyUI mediante nodos GGUF. El modelo resuelve un problema muy concreto: permitir la inferencia de un modelo de difusion de video de gran tamano en GPUs con VRAM limitada, sustituyendo los pesos en precision completa por ficheros GGUF cuantizados que se cargan dinamicamente.

La ficha del autor describe un flujo de instalacion manual en ComfyUI (copiar el GGUF a `models/diffusion_models`, el encoder de texto a `models/text_encoders` y el VAE a `models/vae`), ademas de una ruta alternativa de ejecucion mediante la libreria `diffusers` con `WanVACEPipeline`, `WanVACETransformer3DModel` y `GGUFQuantizationConfig`. La model card esta claramente heredada del repositorio calcuis/wan-gguf, cuyos ficheros y scripts se citan de forma explicita.

Se trata de un modelo de generacion de video texto-a-video y edicion de video, no de un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. El repositorio declara 126.892.531 parametros en un tensor safetensors, cifra que corresponde con toda probabilidad a un componente concreto (VAE o similar) y no al modelo completo, dado que el tamano total del repositorio es de 1184,4 GB. El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un artefacto practicamente sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) 3D para generacion de video, heredada de Wan 2.1 (base: Comfy-Org/Wan_2.1_ComfyUI_repackaged) |
| Parametros totales | 126.892.531 segun el tensor safetensors declarado en el repositorio (probablemente un componente, no el modelo completo; el parametro total del modelo Wan 2.1 subyacente no esta indicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion de video; la longitud de prompt queda limitada por el encoder UMT5-XXL, valor no declarado en la informacion disponible) |
| Tipos de cuantizacion | GGUF: q4_0 y q4_k_m citados en los ejemplos; componentes auxiliares en fp8 e4m3fn escalado y fp16/fp32 (VAE) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF para transformer, encoder de texto y VAE; safetensors para los componentes fp8/fp16 (t5xxl_um_fp8_e4m3fn_scaled.safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura en detalle, mas alla de las clases de `diffusers` empleadas en el ejemplo de codigo: `WanVACETransformer3DModel`, `AutoencoderKLWan` y `UMT5EncoderModel`. Esto permite deducir que se trata de un transformer de difusion tridimensional (DiT) que opera sobre latentes de video generados por un VAE especifico (Wan VAE), condicionado por embeddings de texto producidos por un encoder UMT5-XXL. El muestreo se realiza con el planificador `UniPCMultistepScheduler` configurado con `flow_shift=3.0`, un valor caracteristico de los modelos de flow matching.

No se aportan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de ajuste fino con RLHF o DPO. Al tratarse de un repositorio de cuantizacion y no de un entrenamiento original, no se espera que el autor haya realizado aportaciones en ese sentido. La innovacion tecnica relevante no esta en el modelo sino en el empaquetado: la integracion de ficheros GGUF de transformer, encoder y VAE en nodos de ComfyUI (`gguf-connector`, `gguf-node`) y en `diffusers` mediante `GGUFQuantizationConfig`, que permite cargar pesos cuantizados en bfloat16 para el computo.

Un detalle operativo destacable de la model card es la recomendacion de usar offload a CPU (`device: cpu` en el GGUF clip loader) cuando se emplea el encoder UMT5-XXL en fp8, sin impacto apreciable en la velocidad, y el uso de tiling del VAE (`pipe.vae.enable_tiling()`) para reducir el pico de memoria durante la decodificacion.

## Capacidades

- Generacion de video a partir de texto (text-to-video), con soporte de prompt negativo para excluir atributos no deseados.
- Generacion de video a partir de imagen (image-to-video), segun el flujo documentado que requiere cargar `clip-vision-h` en `models/clip_vision`.
- Generacion de video a partir de primer y ultimo fotograma (flf2v), segun la captura de flujo incluida en la model card.
- Edicion y control de video mediante el pipeline VACE (Video All-in-one Creation and Editing), referenciado tanto en ComfyUI como en `diffusers`.
- Control de encuadre descrito en lenguaje natural: los ejemplos incluyen instrucciones de camara ("tracking camera", "the camera circles slowly").
- Resoluciones de trabajo documentadas en los ejemplos: 720x480 con 57 fotogramas y 24 pasos de inferencia.
- Idiomas: unicamente ingles en los prompts (etiqueta `en`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni modos de pensamiento. No procesa audio ni genera voz.

## Casos de uso

- Previsualizacion de escenas para produccion audiovisual: generar animaticos rapidos a partir de descripciones textuales para validar encuadres, ritmo y direccion de camara antes de rodar, aprovechando el control de movimiento de camara por prompt.
- Generacion de B-roll para creadores de contenido: producir clips de recurso (paisajes, texturas, movimientos abstractos) que se insertan en montajes de YouTube o redes sociales sin necesidad de rodaje adicional.
- Prototipado de conceptos artisticos: el ejemplo "glass flower blossom" de la model card ilustra el uso para explorar ideas visuales antes de invertir en modelado 3D o ilustracion final.
- Pipelines de video marketing: integracion del GGUF en ComfyUI para generar variantes de un mismo plano cambiando el prompt, con el objetivo de producir creatividades A/B a escala.
- Edicion de video asistida (VACE): modificar o extender metraje existente con control estructural, util en posproduccion para retoques de fondo o sustitucion de elementos.
- Aumento de datos sinteticos: generar clips etiquetados a partir de texto para ampliar datasets de entrenamiento de modelos de vision por computador (deteccion, segmentacion temporal), siempre que la licencia Apache-2.0 sea compatible con el uso previsto.
- Ejecucion en equipos modestos: la model card indica explicitamente que la variante de 1,3B es "good for old or low end machine", y que los GGUF de t2v y VACE funcionan correctamente en ese regimen.
- Automatizacion via `diffusers`: el ejemplo de codigo permite integrar la generacion de video en un script Python propio, sin depender de la interfaz grafica de ComfyUI, por ejemplo dentro de un job programado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano de los ficheros cuantizados y no estan confirmadas por el autor:

- Variante de 1,3B en GGUF q4: aproximadamente 3-6 GB de VRAM para el transformer, mas el encoder UMT5-XXL, que en q4_k_m ocupa alrededor de 3-4 GB. Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores.
- Variante de 14B en GGUF q4: aproximadamente 9-11 GB solo para el transformer, mas encoder y VAE; el repositorio base repackaged de Comfy-Org incluye habitualmente ambas variantes, pero la presencia de la variante de 14B en este repositorio concreto no esta confirmada en la informacion disponible.
- El VAE anade un pico de memoria significativo que escala con resolucion y numero de fotogramas; el uso de `enable_tiling()` es recomendable en cualquier GPU por debajo de 24 GB.
- GPUs recomendadas: RTX 3090, RTX 4090, RTX A6000, L40S, A100 y H100 para las variantes de mayor tamano y resoluciones altas. Para la variante de 1,3B basta una GPU de gama media con 8-12 GB.
- Opciones de despliegue documentadas: ComfyUI con los nodos GGUF (`gguf-connector`, `gguf-node`) y `diffusers` con `GGUFQuantizationConfig`. No se menciona soporte de vLLM, TGI, Ollama ni llama.cpp, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponible. El unico dato operativo de los ejemplos es de 24 pasos de inferencia para 57 fotogramas a 720x480, sin tiempos medidos.
- El repositorio ocupa 1184,4 GB, por lo que es necesario planificar el almacenamiento antes de clonarlo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shan2005/wan-gguf | no disponible (126,9 M declarados en safetensors) | GGUF + safetensors fp8/fp16 | apache-2.0 | 0 descargas, 1 like | Cuantizacion derivada; model card heredada de calcuis/wan-gguf |
| Comfy-Org/Wan_2.1_ComfyUI_repackaged | no disponible | safetensors | no disponible en la informacion proporcionada | Modelo base muy difundido | Requiere VRAM considerable en precision original |
| calcuis/wan-gguf | no disponible | GGUF + safetensors | no disponible en la informacion proporcionada | Repositorio de referencia citado por esta model card | Incluye el encoder UMT5-XXL en fp8 y el VAE en GGUF/fp16 |
| Otros modelos de generacion de video abiertos (familia Wan 2.1, alternativas tipo HunyuanVideo) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para establecer una comparacion numerica |

No se dispone de resultados de benchmarks comparativos que permitan contrastar el rendimiento de este repositorio frente a sus alternativas.

## Limitaciones y advertencias

- Riesgo de alucinacion visual: como todo modelo de difusion generativa, puede producir contenido fisicamente incoherente, deformaciones anatomicas o artefactos temporales entre fotogramas. El uso de un prompt negativo ("blurry ugly bad", "bad quality, blurry, messy, chaotic") es un parche, no una garantia.
- Sesgos de los datos de entrenamiento: no se documenta la composicion del dataset, por lo que no se puede evaluar el sesgo demografico, cultural o geografico del modelo. La ficha no incluye ninguna seccion de uso responsable.
- Limitacion idiomatica: el modelo solo declara soporte de ingles. Los prompts en castellano no estan soportados de forma oficial.
- Trazabilidad dudosa de la model card: el README incluye enlaces, scripts y ejemplos que apuntan a repositorios de terceros (calcuis, chatpig, callgg), no al propio autor. Los ejemplos de codigo pueden no funcionar con los ficheros de este repositorio concreto, ya que apuntan a rutas de otros espacios.
- Repositorio sin validacion: 0 descargas y 1 like. No hay evidencia de que los ficheros hayan sido probados por terceros ni de que las cuantizaciones sean correctas.
- Ambiguedad en el inventario: el repositorio contiene 1184,4 GB y no se especifica que variantes de Wan 2.1 incluye (1,3B, 14B, t2v, i2v, VACE), ni a que componente corresponden los 126.892.531 parametros declarados.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Comfy-Org/Wan_2.1_ComfyUI_repackaged, que no se detalla en la informacion disponible, ya que podria imponer condiciones adicionales.
- Coste de almacenamiento: 1184,4 GB de repositorio hacen inviable una descarga completa en la mayoria de entornos de desarrollo; es necesario descargar ficheros sueltos.
- Dependencia de nodos de terceros: la ejecucion en ComfyUI requiere instalar nodos GGUF y, en algunos casos, modificar manualmente la lista `IMG_ARCH_LIST` del `loader.py`, lo que introduce fragilidad en el mantenimiento.
- Sin soporte para texto, razonamiento, codigo ni agentes: no debe considerarse un sustituto de un LLM en ninguna arquitectura de aplicacion conversacional.
- Fecha de creacion del repositorio: la metadata indica 2026-10-12, fecha posterior a la consulta, lo que sugiere un error de registro y refuerza la falta de fiabilidad de los metadatos del artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Shan2005/wan-gguf
- Modelo base: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Repositorio de referencia calcuis/wan-gguf: https://huggingface.co/calcuis/wan-gguf
- Repositorio calcuis/wan-1.3b-gguf: https://huggingface.co/calcuis/wan-1.3b-gguf
- Encoder UMT5-XXL en fp8 escalado: https://huggingface.co/calcuis/wan-gguf/blob/main/t5xxl_um_fp8_e4m3fn_scaled.safetensors
- Encoder UMT5-XXL en GGUF q4_k_m: https://huggingface.co/calcuis/wan-1.3b-gguf/blob/main/umt5-xxl-encoder-q4_k_m.gguf
- VAE en GGUF fp32-f16: https://huggingface.co/calcuis/wan-1.3b-gguf/blob/main/pig_wan_vae_fp32-f16.gguf
- Encoder UMT5-XXL alternativo: https://huggingface.co/chatpig/umt5xxl-encoder-gguf
- Decodificador VAE Wan: https://huggingface.co/callgg/wan-decoder
- Repositorio de ComfyUI usado en los ejemplos: https://github.com/calcuis/comfy
- Animacion de ejemplo (t2v): https://raw.githubusercontent.com/calcuis/comfy/master/wan-t2v.gif
- Captura del flujo flf2v: https://raw.githubusercontent.com/calcuis/comfy/master/wan-flf2v.png

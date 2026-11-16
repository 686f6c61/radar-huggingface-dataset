# fidel1234/Moss

## Resumen

Moss Asian LoRA es un adaptador LoRA de bajo rango publicado por el usuario fidel1234 en Hugging Face, entrenado sobre el modelo base de difusion OpenMOSS-Team/MOSS-Image-Base. Su proposito concreto es mejorar la generacion de personajes de origen japones (y, por extension, asiatico) en flujos de sintesis de imagen, un dominio donde los modelos de difusion genericos suelen producir rasgos faciales poco fieles o estereotipados. El adaptador se distribuye como pesos `safetensors` compatibles con la libreria `diffusers` y con ComfyUI, con un tamano de repositorio de 11,7 GB.

El modelo no es un modelo de lenguaje ni un transformer autoregresivo: es un LoRA para un modelo de difusion de imagenes. Por tanto, no dispone de ventana de contexto en tokens, no soporta tool calling ni razonamiento multi-paso, y sus "idiomas" no aplican en el sentido textual. La relevancia actual radica en que permite especializar un modelo base abierto (MOSS-Image-Base) hacia un caso de uso muy demandado en ilustracion y generacion de personajes, manteniendo la licencia MIT del adaptador y un flujo de trabajo reproducible mediante imagenes de muestra con metadatos embebidos.

El repositorio acumula 77.430 descargas y 3 likes en el momento de la consulta, con creacion el 27 de octubre de 2026 y ultima actualizacion el 16 de noviembre de 2026. La documentacion del autor es deliberadamente escueta: no publica numero de pasos de entrenamiento, composicion exacta del dataset, ni metricas cuantitativas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusion MOSS-Image-Base |
| Parametros totales | no disponible (adaptador LoRA; el repo ocupa 11,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible (pesos `safetensors`; el autor no documenta variantes GGUF/FP8) |
| Idiomas soportados | no disponible en terminos textuales; el autor indica entrenamiento orientado a personajes japoneses |
| Licencia | MIT (adaptador); uso sujeto ademas a la Moss Community License y Acceptable Use Policy del modelo base |
| Formato de pesos | safetensors |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base |
| Libreria | diffusers |
| Framework de entrenamiento | AI-Toolkit |
| Peso recomendado | 0,8 - 1,0 |
| Pasos de inferencia | 25 (8 con variante turbo) |
| CFG recomendado | 4 (frente al 2,5 por defecto de ComfyUI) |
| Compatibilidad de UI | ComfyUI (flujo embebido en la imagen de muestra) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clasico de LoRA: se insertan matrices de bajo rango en las capas del modelo base de difusion y solo esos parametros se entrenan, dejando congelados los pesos de MOSS-Image-Base. El autor declara haber usado AI-Toolkit como framework de entrenamiento sobre Moss Base, y menciona compatibilidad tanto con la variante base como con la variante SFT del modelo subyacente. No se especifican el rango del adaptador, el alpha, la tasa de aprendizaje, el numero de pasos ni el tamano del lote.

El dataset se describe como "hand-cherry-picked", con una mezcla equilibrada de primeros planos, planos medios, cuerpo completo y distintos angulos, con el objetivo de dar control flexible sobre encuadre y perspectiva. No se indica el numero de imagenes, la resolucion de entrenamiento, si hubo regularizacion o captioning automatico, ni si se aplicaron tecnicas como DreamBooth o fine-tuning de texto. Tampoco se documenta ningun proceso de RLHF, DPO o ajuste por preferencias, algo por otra parte ajeno a este tipo de adaptadores.

La innovacion practica del repositorio no esta en la arquitectura sino en el empaquetado: cada archivo `.safetensors` va acompanado de una imagen de muestra con el mismo nombre y extension `.png`, y el workflow de generacion y la palabra de activacion (trigger word) estan embebidos exclusivamente en los metadatos de esa imagen, no en los pesos. Esto permite arrastrar la imagen a ComfyUI y recuperar automaticamente parametros y prompt exactos, lo que reduce la friccion de reproduccion.

## Capacidades

- Generacion de imagenes de personajes de estetica japonesa/asiatica sobre el modelo base MOSS-Image-Base.
- Control de encuadre y perspectiva: el dataset incluye primeros planos, planos medios, cuerpo completo y angulos variados.
- Integracion con ComfyUI mediante carga de LoRA y workflow embebido en la imagen de muestra.
- Compatibilidad con las variantes base y SFT del modelo Moss subyacente.
- Ajuste de intensidad del efecto mediante peso LoRA (rango recomendado 0,8-1,0).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo de lenguaje.
- No dispone de capacidades de audio, video ni comprension multimodal en el sentido de un VLM.
- Capacidades multilingues textuales: no disponibles; el condicionamiento se realiza por prompt de texto del modelo base, cuyo soporte idiomatico no se documenta en esta ficha.

## Casos de uso

- Ilustracion de personajes para manga y novela ligera: el LoRA especializa el modelo base en rasgos y proporciones de personajes japoneses, lo que permite generar bocetos consistentes con un estilo reconocible y reducir el retoque manual posterior.
- Creacion de hojas de personaje (character sheets): gracias a la mezcla de planos del dataset, se pueden generar vistas de primer plano, plano medio y cuerpo completo del mismo personaje variando el encuadre en el prompt, util para preproduccion de animacion o videojuego.
- Generacion de assets para videojuegos indie: estudio pequeno que necesite retratos y sprites de personajes asiaticos puede integrar el LoRA en un pipeline ComfyUI con peso 0,8-1,0 y CFG 4 para producir variaciones controladas por lote.
- Prototipado rapido en estudios de diseno: el workflow embebido en la imagen de muestra permite que un disenador sin experiencia en difusion reproduzca exactamente los parametros del autor arrastrando el PNG a ComfyUI, acelerando la validacion de direccion de arte.
- Contenido editorial y publicitario con personajes: agencias que necesiten material grafico con personajes de rasgos asiaticos pueden generar propuestas en 25 pasos con CFG 4, y usar la variante turbo (8 pasos) para iteraciones rapidas de concepto.
- Investigacion sobre sesgos en difusion: el adaptador sirve como caso de estudio para medir como un LoRA de ~11,7 GB de repo modifica la distribucion de rasgos faciales del modelo base, comparando salidas con y sin adaptador bajo el mismo prompt y semilla.
- Fine-tuning en cadena: al ser un LoRA sobre MOSS-Image-Base, puede combinarse con otros adaptadores o servir de punto de partida para especializaciones adicionales (por ejemplo, un estilo de ilustracion concreto) sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas frente a otros LoRA de personajes. Los unicos parametros de rendimiento documentados son de inferencia: 25 pasos con CFG 4 en el modelo base, u 8 pasos si se usa la variante turbo, con un peso de adaptador entre 0,8 y 1,0.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repo pesa 11,7 GB, lo que sugiere que el adaptador se distribuye junto con artefactos adicionales; el peso efectivo del LoRA no se detalla. Para inferencia hay que sumar la VRAM del modelo base MOSS-Image-Base, cuyo requisito no se documenta en esta ficha.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al tratarse de un modelo de difusion de imagen, es esperable que requiera GPU con suficiente VRAM para el modelo base; no se confirma compatibilidad con GPUs de consumo concretas.
- Cabe en GPU de consumo: no confirmado. El autor no indica requisitos minimos ni prueba en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: ComfyUI (soporte explicito y workflow embebido), `diffusers` (libreria declarada en el repo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles. Solo se conocen los pasos recomendados (25, u 8 en turbo) y el CFG (4), sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fidel1234/Moss (esta ficha) | LoRA de difusion | OpenMOSS-Team/MOSS-Image-Base | no disponible | no aplica | MIT (adaptador) + licencia del base | Hugging Face, `diffusers`, ComfyUI |
| OpenMOSS-Team/MOSS-Image-Base | Modelo de difusion base | no aplica | no disponible | no aplica | Moss Community License | Hugging Face |
| LoRA de personajes alternativos sobre otros bases (p. ej. SDXL, Flux) | LoRA de difusion | SDXL / Flux | no disponible | no aplica | variable segun autor y base | Hugging Face, Civitai |

No se dispone de datos cuantitativos (FID, CLIP score, evaluaciones humanas) que permitan una comparacion de rendimiento rigurosa con alternativas. La comparacion se limita a aspectos estructurales: tipo de adaptador, modelo base, licencia y canales de distribucion.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se centra en personajes japoneses, lo que puede producir una representacion homogenea de rasgos faciales y sesgos de estereotipo en la estetica generada. No se documenta ninguna mitigacion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas (manos, dedos, simetria facial) y detalles incoherentes, especialmente con pesos LoRA altos o CFG mal ajustado.
- Limitaciones de contexto e idioma: no aplica ventana de contexto; el condicionamiento depende del codificador de texto del modelo base, cuyo soporte multilingue no se documenta. Prompts en castellano pueden rendir peor que en ingles si el base no esta entrenado para ello.
- Restricciones de licencia: el adaptador es MIT y permite uso comercial, pero el autor advierte explicitamente que se debe cumplir ademas la Moss Community License Agreement y la Acceptable Use Policy del modelo base. Es imprescindible revisar esas condiciones antes de un despliegue comercial.
- Caveat de reproducibilidad: la trigger word y los parametros exactos solo estan en los metadatos de la imagen de muestra, no en el `.safetensors`. Si se pierde el PNG, se pierde la receta de generacion.
- Caveat de documentacion: no se publican pasos de entrenamiento, tamano del dataset, rango del LoRA ni metricas, lo que dificulta auditar calidad y reproducibilidad.
- Uso responsable: el autor pide no generar contenido enganoso, danino o no consentido con personas representadas; el riesgo de deepfakes o suplantacion recae en el usuario.
- Compatibilidad: el autor solo garantiza funcionamiento fluido en ComfyUI y `diffusers`; no hay evidencia de soporte en otros ecosistemas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fidel1234/Moss
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Demo/showcase en Spaces: https://huggingface.co/spaces/fidel1234/Krea2_Asian_Character_Showcase
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- AI-Toolkit (framework de entrenamiento citado): https://github.com/ostris/ai-toolkit

# awr000/holly-nysva-moss-lora

## Resumen

Holly (nysva) es un LoRA de personaje para la familia de modelos MOSS Image, publicado por el usuario awr000 en Hugging Face. Se trata de un adaptador de bajo rango entrenado sobre Kromoss, un fine-tune en bf16 de MOSS Image, y también probado sobre MOSS Image SFT. El archivo de pesos, `holly-nysva-kromoss-light1-step4850.safetensors`, ocupa 198 MB y corresponde al paso 4850 del entrenamiento. El repositorio completo tiene un tamano de 0,2 GB.

El modelo resuelve un problema muy concreto: la generacion consistente de un personaje ficticio, una mujer sintetica de 26 anos llamada Holly, en imagenes fotorrealistas. No es un modelo de lenguaje ni un modelo base de difusion, sino un adaptador que se carga sobre MOSS Image para transferir la identidad del personaje a las generaciones. Su relevancia es limitada al ambito de la generacion de imagenes de personaje y al ecosistema ComfyUI, donde se distribuye con un workflow de ejemplo.

La informacion disponible es escasa: no hay datos sobre arquitectura del modelo base, numero de parametros del LoRA, licencia ni idiomas soportados. La model card se centra en el uso practico (carga, triggers, prompts, workflow) y advierte de que el conjunto de entrenamiento incluye imagenes de desnudos, por lo que el adaptador puede generar contenido explicito. El modelo esta marcado como `not-for-all-audiences`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS Image (modelo base de difusion, no disponible en detalle) |
| Parametros totales | no disponible (archivo de pesos de 198 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de imagen) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en safetensors; el modelo base se usa en bf16 o int8 segun el workflow) |
| Idiomas soportados | no disponible (los prompts de la model card estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`holly-nysva-kromoss-light1-step4850.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo model-only, pensado para cargarse con un nodo como `LoraLoaderModelOnly` en ComfyUI. Se entreno sobre Kromoss, un fine-tune en bf16 de MOSS Image, y segun la model card tambien se uso sobre MOSS Image SFT durante 28 pasos con CFG 3. El checkpoint publicado corresponde al paso 4850. No se especifica el rango del LoRA, el numero de parametros entrenables, el volumen del dataset ni la composicion exacta de las imagenes de entrenamiento, mas alla de que incluye desnudos y de que se anadieron imagenes con iluminacion variada (luz de ventana, moteada, de lampara, de sodio y de vela) para mejorar la respuesta a distintas fuentes de luz sobre el rostro del personaje.

La innovacion tecnica declarada es la capacidad de mantener la identidad del personaje mediante un trigger textual, `a 26-year-old nysva woman`, que codifica color de pelo, ojos, rostro, complexion y cuerpo, de modo que el usuario no necesita describirlos. La model card indica que la frase "Her skin shows fine visible pores on her nose and cheeks." ayuda a fijar la identidad. El workflow de ejemplo emplea SkipLayerGuidanceDiTSimple en la capa 22, 28 pasos de muestreo, CFG 3.0, sampler euler y scheduler sgm_uniform, con una resolucion de 1088 x 1456 (3:4, aproximadamente 1,5 MP).

## Capacidades

- Generacion de imagenes fotorrealistas de un personaje ficticio concreto (Holly, mujer de 26 anos) sobre MOSS Image.
- Transferencia de identidad mediante trigger textual, sin necesidad de describir rasgos fisicos.
- Respuesta a distintas condiciones de iluminacion (ventana, luz moteada, lampara, sodio, vela) gracias a las imagenes de relight incluidas en el entrenamiento.
- Generacion de contenido explicito: el dataset de entrenamiento incluye desnudos y el LoRA puede producir nudidad.
- Integracion en flujos ComfyUI mediante nodo de carga de LoRA model-only y workflow JSON incluido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni multilingueismo, por tratarse de un adaptador de generacion de imagen.

## Casos de uso

- Generacion de retratos de personaje consistentes: usar el trigger `a 26-year-old nysva woman` junto con descripciones de escena para obtener imagenes del mismo personaje en distintas poses y encuadres, aprovechando que el LoRA fija rasgos faciales y corporales.
- Ilustracion de ficcion o narrativa serializada: mantener la apariencia de un personaje a lo largo de varias escenas con iluminaciones distintas (interior con luz de ventana, exterior nocturno con luz de sodio, interiores con lampara o vela), gracias al entrenamiento con imagenes relight.
- Prototipado rapido en ComfyUI: cargar el workflow `holly-moss-sft28.json` y el LoRA con strength 0.8 para generar variaciones en pocos pasos (28 pasos, CFG 3.0) sin reentrenar.
- Creacion de contenido para adultos: el adaptador puede generar desnudos, por lo que encaja en pipelines de contenido explicito para audiencias adultas, con las advertencias legales correspondientes.
- Pruebas de concepto de LoRA de personaje: sirve como referencia tecnica para estudiar como un trigger y unas frases de anclaje (poros en nariz y mejillas) estabilizan la identidad en un adaptador de bajo rango.
- Experimentacion con iluminacion sobre rostro: util para evaluar como responde un LoRA de personaje a distintas fuentes de luz sin cambiar el prompt de identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El LoRA pesa 198 MB y se suma al modelo base MOSS Image SFT en bf16, cuyo consumo de VRAM no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. El workflow usa el modelo base en bf16 y un text encoder Qwen 3.5 9B en int8 (`qwen3.5_9b_int8_convrot.safetensors`), lo que sugiere requisitos de VRAM propios de un pipeline de difusion con encoder de texto de 9B.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del modelo base y del encoder, no del LoRA.
- Opciones de despliegue: ComfyUI con `LoraLoaderModelOnly`, CLIPLoader de tipo `moss_image`, VAE `flux2-vae_small.safetensors` y SkipLayerGuidanceDiTSimple. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de personaje para MOSS Image ni datos de rendimiento que permitan una comparacion con alternativas.

## Limitaciones y advertencias

- Contenido explicito: el conjunto de entrenamiento incluye desnudos y el LoRA puede generar nudidad; el repositorio esta marcado como `not-for-all-audiences`.
- Riesgo de representacion de menores: la model card advierte explicitamente de que el personaje es adulto (26 anos) y de que no debe usarse para representar a menores; el prompt negativo incluye terminos como "teenager, young girl, childlike".
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; ante la ausencia de licencia explicita, debe tratarse como restrictiva por defecto.
- Idiomas no documentados: los prompts de ejemplo estan en ingles y no se indica soporte de otros idiomas.
- Dependencia del modelo base: el LoRA solo funciona con MOSS Image (Kromoss o MOSS Image SFT) y requiere el encoder y VAE especificados en el workflow; no es un modelo autonomo.
- Identidad fijada por trigger: el personaje es sintetico y ficticio; el LoRA no esta pensado para imitar personas reales, aunque no se detallan salvaguardas al respecto.
- Sesgos: no se documentan sesgos conocidos, pero al ser un personaje sintetico con un fisico y complexion fijados por el trigger, las generaciones estaran sesgadas hacia esa apariencia concreta.
- Alucinacion: no aplica en el sentido de modelos de lenguaje; en generacion de imagen el riesgo es de artefactos anatomicos, que el prompt negativo intenta mitigar (manos, dedos, extremidades).
- Ausencia de datos tecnicos: no hay informacion sobre parametros del LoRA, rango, dataset ni evaluacion cuantitativa, lo que limita la evaluacion rigurosa en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/awr000/holly-nysva-moss-lora
- Workflow de ComfyUI: `holly-moss-sft28.json` (incluido en el repositorio de Hugging Face)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.

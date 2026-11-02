# deadman44/MOSS_Image_LoRA

## Resumen

MOSS_Image_LoRA es un adaptador LoRA publicado por el usuario deadman44 para el modelo de generacion de imagenes MOSS-Image. Su proposito concreto es corregir el sesgo estetico del modelo base, que tiende a producir rostros con un acabado excesivamente pulido y maquillado (el denominado "AI face"), y sustituirlo por rostros de aspecto mas natural. El adaptador se distribuye como un unico fichero safetensors de aproximadamente 0,9 GB dentro del repositorio, con licencia Apache 2.0 y etiqueta de pipeline text-to-image.

El modelo base MOSS-Image no se incluye en este repositorio: el autor documenta un flujo de trabajo para ComfyUI que requiere descargar por separado el modelo de difusion (moss_image_sft_int8_convrot), el text encoder (qwen3.5_9b_int8_convrot) y el VAE (flux2-vae), todos ellos alojados en la organizacion Comfy-Org. Se recomienda ademas un LoRA de destilacion de 8 pasos (lodestones/MOSS-Image-SFT-8-steps-dmd) para acelerar la inferencia.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ajuste fino comunitario, en fase experimental segun su propio autor, con cero descargas en el momento de la consulta y once "likes". El autor advierte explicitamente de que el entrenamiento de LoRA sobre MOSS-Image es dificil y provoca perdida de diversidad en las salidas. No se dispone de informacion sobre la arquitectura interna del adaptador ni sobre el volumen de datos de entrenamiento utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion MOSS-Image; arquitectura del modelo base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image) |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el modelo base recomendado usa int8 (int8_convrot) |
| Idiomas soportados | ingles (segun metadatos); los prompts de ejemplo incluyen terminos en japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, no un modelo completo. La tecnica LoRA introduce matrices de bajo rango entrenables en las capas del modelo base, lo que permite modificar el comportamiento generativo sin reentrenar todos los pesos. En este caso el objetivo declarado es desplazar la distribucion de salida hacia rostros menos retocados y mas naturales, compensando la tendencia del MOSS-Image original a generar caras con maquillaje completo y acabado artificial.

No se especifican en la informacion disponible el rango del adaptador, las capas objetivo, el numero de imagenes de entrenamiento, el numero de pasos ni la composicion del dataset. El autor indica que el ajuste se encuentra en fase experimental y que el proceso de entrenamiento de LoRA sobre MOSS-Image conlleva una perdida de diversidad en los resultados, lo que sugiere un dataset reducido o poco variado. El flujo recomendado combina el modelo de difusion en int8 con un text encoder Qwen3.5 de 9B y el VAE de Flux2, e incorpora opcionalmente un LoRA DMD de 8 pasos para reducir el coste de muestreo.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante el modelo base MOSS-Image, con el adaptador aplicado en el rango de fuerza 0,3 a 0,7.
- Modificacion del estilo facial: produce rostros de aspecto natural en lugar del acabado "AI face" del modelo base.
- Control mediante tokens de activacion: "myjc" para el estilo facial, y modificadores como "japanese" o "european" para la apariencia etnica.
- Soporte de prompts en ingles, con ejemplos que combinan terminos en japones.
- Integracion en flujos ComfyUI mediante el workflow JSON publicado en el repositorio.
- Compatibilidad con refinado posterior mediante un segundo flujo con Krea-2.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un adaptador de generacion de imagenes.

## Casos de uso

- Retrato fotorrealista de personas: aplicar el LoRA con fuerza 0,5 sobre MOSS-Image para obtener retratos con textura de piel y rasgos menos idealizados, util en proyectos que necesitan imagenes de personas creibles y no publicitarias.
- Generacion de avatares para prototipos de producto: el adaptador reduce el aspecto artificial de las caras, lo que mejora la percepcion de realismo en maquetas y demos sin requerir sesiones fotograficas.
- Ilustracion de personajes para narrativa y juegos: combinado con los tokens "myjc" y modificadores etnicos, permite fijar un estilo facial consistente a lo largo de una serie de imagenes.
- Pruebas de concepto de pipelines text-to-image en ComfyUI: el workflow JSON incluido sirve como plantilla para validar la integracion del modelo base MOSS-Image con text encoder Qwen3.5 y VAE de Flux2.
- Experimentacion academica con LoRA: al ser un adaptador pequeno (0,9 GB) y con licencia permisiva, es util para estudiar como el ajuste de bajo rango altera la distribucion de salida de un modelo de difusion.
- Refinado en dos etapas: usar el LoRA para la generacion inicial y el flujo de refinado con Krea-2 para aumentar detalle, un patron habitual en produccion de imagenes por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,9 GB en disco; el requisito real de VRAM lo determina el modelo base MOSS-Image, no el adaptador.
- El modelo base se distribuye en int8 (moss_image_sft_int8_convrot), lo que reduce el consumo frente a una version en fp16, pero no se dispone de cifras exactas de VRAM en la informacion proporcionada.
- El text encoder recomendado es Qwen3.5 de 9B en int8, que anade varios GB de memoria al pipeline.
- GPU recomendadas: no disponible. Por el tamano del text encoder y del modelo de difusion, se espera que requiera GPU de gama alta con al menos 16-24 GB de VRAM, aunque esta estimacion no esta confirmada por el autor.
- Despliegue: ComfyUI es el entorno documentado, con un workflow JSON especifico. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El LoRA DMD de 8 pasos recomendado reduce el numero de pasos de muestreo, lo que deberia disminuir el tiempo de generacion, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deadman44/MOSS_Image_LoRA | LoRA sobre MOSS-Image | no disponible | no aplica | Apache 2.0 | HuggingFace, 0 descargas |
| lodestones/MOSS-Image-SFT-8-steps-dmd | LoRA de destilacion sobre MOSS-Image | no disponible | no aplica | no disponible en la informacion | HuggingFace |
| deadman44/Krea-2_LoRA | LoRA sobre Krea-2 (refinado) | no disponible | no aplica | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- Fase experimental: el propio autor califica el adaptador como experimental y advierte de perdida de diversidad en las imagenes generadas.
- Dependencia del modelo base: el repositorio no incluye los pesos de MOSS-Image, el text encoder ni el VAE; sin descargarlos por separado el adaptador no es funcional.
- Sesgos: el adaptador esta orientado a un estilo facial concreto ("myjc") y ofrece modificadores etnicos, lo que puede reforzar estereotipos si se usa sin criterio.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible y detalles incoherentes, especialmente con prompts complejos.
- Idioma: los metadatos declaran solo ingles; el rendimiento con prompts en castellano no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el modelo base ni sobre los pesos de terceros necesarios para ejecutarlo.
- Advertencia de contenido: los prompts de ejemplo incluyen referencias a menores de edad; debe extremarse el cuidado en el uso y en la moderacion de contenidos.
- Sin datos de benchmarks ni de evaluacion cuantitativa, por lo que no es posible validar sus ventajas frente al modelo base mas alla de las imagenes de muestra.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/deadman44/MOSS_Image_LoRA
- Descarga del LoRA: https://huggingface.co/deadman44/MOSS_Image_LoRA/resolve/main/lora_MOSS_myjc_test02.safetensors
- Workflow ComfyUI: https://huggingface.co/deadman44/MOSS_Image_LoRA/raw/main/workflows/Moss-Image_T2I.json
- Modelo base y componentes (Comfy-Org): https://huggingface.co/Comfy-Org/MOSS-Image/tree/main/diffusion_models
- Text encoder: https://huggingface.co/Comfy-Org/MOSS-Image/tree/main/text_encoders
- VAE: https://huggingface.co/Comfy-Org/MOSS-Image/tree/main/vae
- LoRA de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Flujo de refinado con Krea-2: https://huggingface.co/deadman44/Krea-2_LoRA/raw/main/workflows/Krea2_Refiner.json

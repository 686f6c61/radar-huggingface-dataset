# devchan64/mira-bfs-qwen-image-edit-2511-lora

## Resumen

Mira BFS es un adaptador LoRA de edicion de imagen publicado por el usuario devchan64 bajo el identificador `devchan64/mira-bfs-qwen-image-edit-2511-lora`. No es un modelo autonomo: se aplica sobre `Qwen/Qwen-Image-Edit-2511`, un modelo de difusion de edicion de imagen a partir de imagen. Su funcion es transformar la identidad facial y el cabello de la persona de una fotografia o ilustracion de entrada en la identidad de un personaje concreto (Mira, con melena bob color turquesa) y renderizar toda la imagen en un estilo de ilustracion objetivo, conservando en lo posible expresion, pose, ropa, encuadre y composicion de la escena.

El adaptador tiene rango 16 y alpha 16, se entreno durante 1600 pasos de optimizador y se distribuye en formato safetensors compatible con diffusers. Forma parte del material educativo del repositorio AiBook (seccion P7-5.12) y esta pensado como demostracion de un pipeline completo de construccion de dataset sintetico, entrenamiento y evaluacion de un LoRA de personaje, no como herramienta de produccion generalista.

Su relevancia es doble: por un lado documenta de forma inusualmente honesta el proceso y los fallos del adaptador; por otro, sirve como referencia tecnica para quien quiera reproducir un entrenamiento de LoRA de edicion con Musubi Tuner sobre un modelo de difusion moderno, incluyendo los ajustes de resolucion de referencia del VAE que afectan al encuadre de la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, alpha 16) sobre el transformer de difusion de Qwen-Image-Edit-2511; adaptador, no modelo autonomo |
| Parametros totales | no disponible (no se publica el numero de parametros del adaptador ni del modelo base) |
| Longitud de contexto | no aplica; resolucion evaluada de 512x512 (referencia de VAE 512, condicion vision-lenguaje 384) |
| Tipos de cuantizacion | entrenamiento en FP8 (base y procesamiento escalado); inferencia documentada en bfloat16; no se distribuyen pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`mira_bfs.safetensors`), compatible con diffusers |
| Modelo base | Qwen/Qwen-Image-Edit-2511 (relacion: adapter) |
| Pasos de entrenamiento | 1600 pasos de optimizador |
| Tamano del repositorio | 0.6 GB (incluye ejemplos y ficheros auxiliares) |
| Pipeline declarado | image-to-image |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 insertado sobre el transformer de difusion del modelo base Qwen-Image-Edit-2511. La inferencia se realiza con la clase `QwenImageEditPlusPipeline` de diffusers 0.37.0. Un detalle critico documentado por el autor es que el tamano de referencia del VAE debe sobrescribirse a nivel de proceso (`VAE_IMAGE_SIZE = 512 ** 2`), porque el valor por defecto de 1024 provocaba zoom y recorte severos en la evaluacion a 512; la condicion vision-lenguaje conserva su tamano por defecto de 384. Se trata de una API interna, por lo que conviene verificarla antes de cambiar de version de diffusers.

El entrenamiento se hizo con Musubi Tuner (commit `e0cbd8f3dfe38365b10f8bc790b980f8894e8ba1`) a resolucion y resolucion de control de 512, batch size 1, learning rate 1e-4, 1600 pasos, semilla 62294, procesamiento FP8 y 55 bloques intercambiados. El dataset son 193 pares sinteticos entrada/objetivo aceptados (174 de entrenamiento y 19 de validacion) construidos a partir de 41 objetivos unicos de Mira (37 de entrenamiento, 4 de validacion); las entradas se generaron en cinco apariencias y estilos a partir de objetivos existentes y el entrenamiento invierte esa direccion de generacion. Las variantes de un mismo objetivo se mantienen en el mismo split. Otros 123 candidatos a objetivo no se incluyeron en el conjunto de entrenamiento. No se distribuyen pesos del modelo base ni estado de optimizador o de reanudacion.

## Capacidades

- Edicion de identidad de personaje: sustituye rostro y peinado de la persona de entrada por la identidad de Mira, incluida la melena bob turquesa.
- Transferencia de estilo de ilustracion: aplica a la imagen completa el estilo de ilustracion objetivo del personaje.
- Edicion imagen a imagen con preservacion parcial: la intencion declarada es mantener expresion facial, direccion de la cabeza, pose, diseno de ropa, punto de vista de camara, perspectiva, encuadre, posicion del sujeto, escala corporal aparente y disposicion de objetos y fondo. El propio autor indica que estos objetivos no se cumplen del todo.
- Condicionamiento por prompt: el comportamiento se controla con una descripcion textual larga y explicita de que transformar y que preservar, mas un prompt negativo (en el ejemplo, un espacio).
- Prompts en ingles y coreano (idiomas declarados en la model card).
- No se documentan capacidades de tool calling, function calling, uso agentico, vision general, audio ni modo de razonamiento; no aplican a este tipo de modelo.

## Casos de uso

- Previsualizacion de personajes para webtoon o comic: dado un boceto o foto de referencia, el adaptador genera rapidamente una version del personaje en el estilo de ilustracion objetivo, util para explorar como quedaria una escena antes de encargar el dibujo final.
- Material educativo y reproduccion de pipelines LoRA: el repositorio AiBook documenta construccion de dataset, ajustes de Musubi Tuner y protocolo de evaluacion, por lo que sirve como caso practico para quien aprende a entrenar adaptadores de edicion sobre modelos de difusion.
- Estudio de preservacion de escena en edicion de imagen: los ejemplos publicados permiten analizar donde falla la conservacion de fondo (variantes de pasillo con perdida de vegetacion y arquitectura) y disenar experimentos de mitigacion.
- Generacion de variantes controladas de un personaje: con la misma semilla y el mismo prompt se pueden producir pares entrada/salida reproducibles para comparar configuraciones (por ejemplo, distintos pesos de adaptador o numeros de pasos).
- Prototipado de avatares o retratos estilizados en proyectos de investigacion: el adaptador transforma una foto cuadrada de 512x512 en una ilustracion con identidad concreta, siempre que se asuman las limitaciones de conservacion descritas.
- Pruebas de integracion de LoRA en pipelines diffusers: sirve para validar flujos de carga de adaptadores (`load_lora_weights`, `set_adapters`), offload secuencial de CPU y slicing del VAE en entornos con memoria limitada.
- Localizacion de contenido ilustrado entre ingles y coreano: al aceptar prompts en ambos idiomas, encaja en flujos de trabajo de equipos que redactan instrucciones en coreano y publican en ingles, o al reves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas de imagen tipo FID, CLIP o SSIM). La unica evaluacion descrita es cualitativa y se resume a continuacion tal como la reporta el autor.

| Aspecto evaluado | Resultado reportado |
|---|---|
| Protocolo | 19 entradas retenidas, generadas con y sin el adaptador final (38 salidas); semilla 62294, 20 pasos de inferencia, CFG 4.0, strength 1.0, salida 512 y referencia de VAE 512 |
| Identidad facial y peinado de Mira | presentes por inspeccion visual |
| Estilo de ilustracion objetivo | aplicado |
| Conservacion de fondo | cinco variantes de pasillo perdieron vegetacion o arquitectura de forma sustancial; dos quedaron practicamente en blanco |
| Expresion facial | apertura de boca reducida con frecuencia |
| Ropa | detalles modificados en algunos casos |
| Generalizacion | los 19 pares de validacion derivan de solo cuatro escenas objetivo, por lo que no se establece generalizacion a escenas externas |
| Cobertura de la evaluacion | solo una semilla, el paso final y una intensidad de adaptador; 1600 no se presenta como duracion optima probada |

## Requisitos de hardware

- El adaptador no funciona de forma autonoma: requiere descargar y ejecutar el modelo base Qwen-Image-Edit-2511 completo, cuyas necesidades de VRAM no se detallan en la informacion disponible.
- VRAM estimada: no disponible. El ejemplo oficial usa `torch.bfloat16`, `enable_sequential_cpu_offload()` y `vae.enable_slicing()`, lo que indica que el pipeline completo necesita gestion agresiva de memoria, pero no se publican cifras.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: diffusers 0.37.0 con `QwenImageEditPlusPipeline` y carga del adaptador mediante `load_lora_weights` y `set_adapters`. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables; vLLM y TGI estan orientados a modelos de lenguaje y no se documentan aqui.
- Latencia y throughput: no disponibles. La configuracion evaluada usa 20 pasos de inferencia, `true_cfg_scale=4.0` y `guidance_scale=1.0` sobre entradas cuadradas de 512x512.
- Almacenamiento: el repositorio ocupa 0.6 GB e incluye `mira_bfs.safetensors`, `SHA256SUMS`, `training-settings.json`, la licencia y una galeria de ejemplos. La descarga del adaptador no incluye sus dependencias ni los pesos del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mira BFS (este adaptador) | LoRA de personaje sobre Qwen-Image-Edit-2511, rango 16 | no disponible | 512x512 evaluado; referencia de VAE 512, condicion 384 | Apache-2.0 | HuggingFace |
| Qwen-Image-Edit-2511 | Modelo base de edicion de imagen a partir de imagen | no disponible | referencia de VAE por defecto 1024; condicion 384 | Apache-2.0 (segun su model card) | HuggingFace |
| BFS (`mr2along/BFS`) | LoRA de personaje citado como inspiracion conceptual | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas opciones ni de alternativas de la misma categoria con cifras verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Conservacion de escena poco fiable: en la evaluacion del autor, las cinco variantes de pasillo perdieron vegetacion o arquitectura de forma sustancial y dos quedaron casi en blanco. No es una garantia de preservacion de identidad ni de escena de proposito general.
- Cambios no deseados en la persona: la apertura de boca disminuyo con frecuencia y los detalles de ropa se modificaron en algunos casos.
- Generalizacion no demostrada: los 19 pares de validacion proceden de solo cuatro escenas objetivo; no hay evidencia de comportamiento correcto en escenas externas.
- Evaluacion incompleta: solo se probaron una semilla (62294), el paso final de entrenamiento y una intensidad de adaptador. Los 1600 pasos no estan validados como duracion optima.
- Dataset enteramente sintetico: los pares se generaron a partir de objetivos existentes, con el sesgo de estilo y de composicion que ello implica.
- Dependencia de configuracion fragil: el ajuste `VAE_IMAGE_SIZE = 512 ** 2` es una API interna de diffusers; si se cambia de version sin revisarlo, el encuadre de salida puede degradarse (zoom y recorte).
- Requisito de entrada: la configuracion evaluada exige imagenes cuadradas de 512x512 y que solo se pase la imagen de entrada, sin el retrato objetivo como referencia adicional.
- Idiomas: solo se declaran ingles y coreano para los prompts.
- Licencia: el adaptador se distribuye bajo Apache-2.0, pero el uso comercial queda sujeto tambien a los terminos del modelo base Qwen-Image-Edit-2511 y de las dependencias. La model card original aparece truncada al final, por lo que conviene verificar los avisos completos de atribucion en el repositorio.
- Sesgos: no se documenta ningun analisis de sesgos demograficos, de genero o de representacion en el conjunto de datos.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede introducir o eliminar elementos de la escena no solicitados; los ejemplos publicados muestran perdidas de fondo de gran magnitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devchan64/mira-bfs-qwen-image-edit-2511-lora
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repositorio AiBook (seccion P7-5.12, manuscrito en coreano): https://github.com/devchan64/AiBook
- Entrenador Musubi Tuner: https://github.com/kohya-ss/musubi-tuner
- LoRA BFS, inspiracion conceptual: https://huggingface.co/mr2along/BFS

# RunningHubAI/rh-wan2-2-animate-14b-fp8-scaled-e5m2-kj-v2-long-unet

## Resumen

rh-wan2-2-animate-14b-fp8-scaled-e5m2-kj-v2-long-unet es un fichero de pesos de tipo UNET para generacion de video a partir de texto, publicado en Hugging Face por la cuenta RunningHubAI (RunningHub). Se distribuye dentro del ecosistema ComfyUI y esta pensado para cargarse tanto en instalaciones locales de ComfyUI como en la plataforma en la nube RunningHub. El repositorio contiene un unico fichero safetensors de 16 515 MiB (aproximadamente 16,1 GiB) y el repositorio completo ocupa 17,3 GB.

Por el nombre del modelo y del fichero (`Wan2_2-Animate-14B_fp8_scaled_e5m2_KJ_v2.safetensors`) se deduce que se trata de una version cuantizada a FP8 con escalado (formato e5m2) de un modelo de la familia Wan 2.2 Animate con unos 14 000 millones de parametros. La model card indica que esta "finetuned from: F2基础", es decir, derivado de un modelo base que no se identifica con enlace ni ficha tecnica. No se documentan datos de entrenamiento, licencia concreta ni idiomas soportados.

La relevancia de esta publicacion es practica: ofrece una variante cuantizada a 8 bits pensada para reducir los requisitos de VRAM de un modelo de difusion de video de 14B, de modo que pueda ejecutarse en GPUs de gama alta de consumo o en infraestructura cloud mediante ComfyUI. La informacion publicada por el autor es, sin embargo, muy escasa y no permite verificar arquitectura, rendimiento ni condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para texto a video (no detallada en la model card) |
| Parametros totales | ~14 000 millones, segun el nombre del modelo (no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusion de video, no un modelo de lenguaje) |
| Tipos de cuantizacion | FP8 con escalado, formato e5m2 (unico peso publicado) |
| Idiomas soportados | no disponible |
| Licencia | no especificada; la model card remite a la licencia del proyecto original, que no se indica |
| Formato de pesos | safetensors |
| Tamano del fichero | 16 515 MiB (Wan2_2-Animate-14B_fp8_scaled_e5m2_KJ_v2.safetensors) |
| Tamano del repositorio | 17,3 GB |
| Pipeline declarado | text-to-video |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 2026-09-26 |
| Fecha de actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. La unica informacion tecnica disponible es que se trata de un fichero clasificado como UNET y con pipeline text-to-video, etiquetado con las tags `comfyui`, `unet` y `text-to-video`. En ComfyUI, el directorio `unet` (o `diffusion_models` en versiones recientes) aloja el componente de difusion de los modelos de generacion, por lo que la denominacion "unet" es una convencion de empaquetado del ecosistema y no implica necesariamente que la red subyacente sea una U-Net convolucional clasica.

El nombre del fichero aporta mas pistas: el sufijo `fp8_scaled_e5m2` indica una cuantizacion a 8 bits en coma flotante con formato e5m2 y escalado de pesos, orientada a reducir el consumo de memoria del modelo original de 14B. La referencia `Wan2_2-Animate-14B` apunta a un modelo derivado de la familia Wan 2.2 Animate, y la model card indica un ajuste fino a partir de una base denominada "F2基础". No se especifican numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni ninguna innovacion tecnica adicional. Tampoco se documenta si el ajuste afecta al text encoder o solo al componente de difusion.

## Capacidades

- Generacion de video a partir de descripciones textuales (pipeline declarado: text-to-video).
- Integracion con ComfyUI como nodo de carga de modelo de difusion (UNET) dentro de un grafo de generacion de video.
- Ejecucion en la plataforma RunningHub, incluyendo acceso mediante API documentada.
- Cuantizacion FP8 e5m2 con escalado, que reduce el uso de VRAM respecto al modelo en precision completa.
- Capacidades concretas de animacion o de control de personaje: no documentadas en la model card, pese a que el nombre incluye el termino "Animate".
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de clips de video para prototipado creativo: el modelo se carga en ComfyUI como UNET y permite producir video a partir de prompts de texto en un flujo de trabajo local, util para agencias y equipos de diseno que necesitan iterar rapidamente sin depender de servicios cerrados.
- Previsualizacion de storyboards: en produccion audiovisual, se pueden generar animaticos a partir de descripciones de escena para validar encuadres y ritmo antes de rodar o animar en 3D.
- Contenido para redes sociales: generacion de clips cortos promocionales o de ambientacion empleando un modelo de 14B cuantizado que reduce el coste de infraestructura frente a la version en precision completa.
- Integracion en pipelines automatizados via API: RunningHub ofrece documentacion de API, lo que permite invocar el modelo desde un backend propio para generar video bajo demanda dentro de una aplicacion web o un servicio interno.
- Investigacion sobre cuantizacion de modelos de difusion de video: al publicarse unicamente la variante FP8 e5m2 con escalado, el fichero es util para medir la perdida de calidad frente al modelo original en FP16/BF16 y para estudiar el comportamiento del formato e5m2 en este tipo de redes.
- Despliegue en GPU de consumo: con un fichero de 16,1 GiB, es viable plantear su ejecucion en GPUs con 24 GB de VRAM aplicando offloading parcial del text encoder y del VAE, lo que permite a estudios pequenos trabajar sin acceso a clústeres de datacenter.
- Demostraciones y evaluacion comparativa en ComfyUI: al estar empaquetado para ese ecosistema, se puede insertar en grafos existentes y comparar su salida con otros checkpoints de video usando los mismos prompts y semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, SSIM, evaluaciones humanas) ni comparaciones cuantitativas con otros modelos. Tampoco se aportan datos de velocidad de inferencia, numero de pasos de muestreo recomendado ni resoluciones de salida.

## Requisitos de hardware

- VRAM para el componente de difusion: aproximadamente 16,1 GiB solo para el fichero safetensors en FP8; en la practica se necesita mas memoria para los estados intermedios de inferencia.
- VRAM total del pipeline: el text encoder y el VAE se cargan como componentes aparte y no estan incluidos en el repositorio; en funcion del encoder elegido (tipicamente un modelo T5 de gran tamano), el requisito agregado puede superar los 24 GB, o menos si se aplica offloading secuencial.
- GPUs profesionales recomendadas: A100 (40/80 GB), H100 (80 GB) o equivalentes, que permiten mantener todo el pipeline en memoria sin offloading.
- GPUs de consumo: RTX 3090 y RTX 4090 con 24 GB son la opcion mas realista, probablemente con offloading del text encoder; una RTX 5090 con 32 GB ofrece mayor margen. GPUs con 12-16 GB requeririan cuantizaciones adicionales no publicadas en este repositorio.
- Opciones de despliegue: ComfyUI (local o como nodo de API), plataforma RunningHub y su API documentada. Los servidores orientados a modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no son aplicables, ya que se trata de un modelo de difusion de video y no de un transformer autoregresivo.
- Latencia y throughput: no disponibles. No se publican tiempos por clip, resolucion, duracion de salida ni pasos de muestreo.

## Comparativa con modelos similares

La informacion disponible no permite una comparacion cuantitativa fiable. La unica referencia identificable es el modelo de origen del que deriva esta cuantizacion, y ni siquiera su ficha aparece enlazada en la model card.

| Modelo | Parametros | Contexto / duracion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-wan2-2-animate-14b-fp8-scaled-e5m2-kj-v2-long-unet | ~14B (segun nombre) | no disponible | no disponible | no especificada | Hugging Face, ComfyUI, RunningHub |
| Wan 2.2 Animate 14B (modelo de origen inferido) | ~14B | no disponible | no disponible | no disponible | no verificada en la informacion proporcionada |
| Otras alternativas de texto a video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Documentacion minima: la model card no detalla arquitectura, datos de entrenamiento, hiperparametros ni proceso de ajuste fino, lo que dificulta evaluar la calidad y la trazabilidad del modelo.
- Licencia ambigua: la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original, pero no nombra ni enlaza dicha licencia. No hay confirmacion de que el uso comercial este permitido; conviene contactar con el autor antes de usarlo en produccion.
- Procedencia del ajuste fino desconocida: se menciona una base "F2基础" sin enlace ni informacion, por lo que no se puede verificar la cadena de derivacion ni las condiciones heredadas.
- Sin metricas de calidad: no hay evaluaciones publicadas, de modo que no se puede estimar la degradacion introducida por la cuantizacion FP8 e5m2 frente al modelo original.
- Riesgo de artefactos propios de la generacion de video: incoherencias temporales, deformaciones anatomicas y falta de consistencia entre fotogramas son riesgos habituales en esta familia de modelos; no se documenta ningun control especifico para mitigarlos.
- Idiomas y sesgos: no se especifica el idioma de los prompts soportados ni se documentan sesgos demograficos o culturales del dataset de entrenamiento.
- Requisitos de memoria elevados: pese a la cuantizacion, es un modelo de 14B que exige GPUs de gama alta y puede requerir offloading, con la consiguiente penalizacion de velocidad.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- Fechas de publicacion inusuales: las marcas temporales del repositorio (2026) no coinciden con el calendario habitual de publicaciones; conviene verificar la vigencia del contenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-wan2-2-animate-14b-fp8-scaled-e5m2-kj-v2-long-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2002464797276925954
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1962103704415584258
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Paper o repositorio del proyecto original: no disponible

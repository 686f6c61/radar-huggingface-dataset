# myyinyue/wan22-comfyui-workflows

## Resumen

Wan 2.2 ComfyUI Workflows es un repositorio de flujos de trabajo (workflows) de ComfyUI probados para la generacion de video con el modelo Wan 2.2, concretamente con la variante TI2V-5B en modo image-to-video. No se trata de un modelo de pesos en si, sino de un paquete de ficheros JSON en formato API que pueden enviarse directamente al endpoint `/prompt` de ComfyUI o importarse en el lienzo grafico de la aplicacion. Lo publica el usuario myyinyue como parte de su pipeline abierto de video con IA (Yinyue).

El workflow incluido, `wan22_ti2v_5b_i2v_proof.json`, ha sido verificado de extremo a extremo en una unica GPU de 15 GB (una Kaggle T4) ejecutando ComfyUI con la opcion `--lowvram`. Genera video vertical de 480 x 832 pixeles, 49 fotogramas a 24 fps, partiendo de una imagen fija cualquiera (en la prueba se uso un keyframe generado con FLUX). El muestreador es uni_pc/simple con 20 pasos y cfg 5.0, y el ModelSamplingSD3 shift esta fijado en 8.0.

Su relevancia practica esta en que elimina el trabajo de configuracion manual: documenta exactamente que pesos descargar, en que carpeta de ComfyUI colocarlos y con que parametros ejecutar el pipeline para obtener un resultado reproducible en hardware de gama consumer. El repositorio depende del repack de modelos `Comfy-Org/Wan_2.2_ComfyUI_repackaged`, que aporta el modelo de difusion TI2V-5B en fp16, el text encoder UMT5-XXL en fp8 y el VAE de Wan 2.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (workflow para el modelo de difusion Wan 2.2 TI2V-5B) |
| Parametros totales | no disponible (el modelo referenciado es TI2V-5B, 5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (modelo de difusion), fp8_e4m3fn_scaled (text encoder UMT5-XXL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JSON de workflow (API de ComfyUI); pesos referenciados en safetensors |

## Arquitectura y entrenamiento

El repositorio no contiene pesos ni informacion sobre el entrenamiento del modelo subyacente. Lo que describe es un grafo de ComfyUI en formato API para el modelo Wan 2.2 TI2V-5B, un modelo de difusion texto-imagen-video. El pipeline encadena tres componentes: el modelo de difusion `wan2.2_ti2v_5B_fp16.safetensors` (~10,0 GB) en `diffusion_models/`, el text encoder `umt5_xxl_fp8_e4m3fn_scaled.safetensors` (~6,7 GB) en `text_encoders/` y el VAE `wan2.2_vae.safetensors` (~1,4 GB) en `vae/`, todos ellos distribuidos por `Comfy-Org/Wan_2.2_ComfyUI_repackaged`.

La configuracion de muestreo documentada es uni_pc con scheduler simple, 20 pasos, cfg 5.0 y un shift de ModelSamplingSD3 de 8.0. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo ajuste por RLHF o DPO, ya que esa informacion corresponde al modelo Wan 2.2 original y no se incluye en esta model card.

## Capacidades

- Generacion de video a partir de una imagen fija (image-to-video) con el modelo TI2V-5B.
- Salida en formato vertical de 480 x 832 pixeles y 49 fotogramas a 24 fps.
- Ejecucion en GPUs de 15-16 GB mediante el modo `--lowvram` de ComfyUI.
- Invocacion programatica: el JSON puede enviarse como `{"prompt": <workflow>}` al endpoint `/prompt` de un servidor ComfyUI en `http://127.0.0.1:8188/prompt`.
- Importacion directa en el lienzo de ComfyUI para ejecucion manual con el boton Queue.
- Uso de cualquier imagen de partida (la prueba verificada empleo un keyframe generado con FLUX).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas.

## Casos de uso

- Prototipado rapido de image-to-video: el workflow permite obtener un clip vertical de 2 segundos a partir de una sola imagen sin configurar manualmente el grafo, lo que reduce el tiempo hasta el primer resultado en entornos de investigacion.
- Validacion en hardware limitado: al estar verificado en una T4 de 15 GB con `--lowvram`, sirve para comprobar pipelines de video en instancias gratuitas o de bajo coste (Kaggle, notebooks con GPU consumer) antes de escalar a produccion.
- Automatizacion por API: al estar en formato API, se puede encadenar desde scripts o servicios que hagan POST a `/prompt`, integrando la generacion de video en pipelines de contenido automatizados.
- Generacion de contenido para redes sociales: la resolucion 480 x 832 y los 49 fotogramas a 24 fps encajan con formatos verticales de corta duracion para pruebas de concepto y storyboards animados.
- Animacion de keyframes generados por modelos de imagen: el flujo verificado parte de una imagen creada con FLUX, por lo que se puede usar como etapa final de un pipeline texto-imagen-video.
- Reproduccion de experimentos: al fijar muestreador, pasos, cfg y shift, el workflow actua como referencia reproducible para comparar resultados entre distintas GPUs o versiones de ComfyUI.
- Base para personalizacion: sirve como plantilla para modificar resolucion, numero de fotogramas o sampler y evaluar el impacto en calidad y consumo de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el workflow esta verificado en una GPU de 15 GB (Kaggle T4) con `--lowvram`; en tarjetas de 16 GB se recomienda activar esa misma opcion.
- Memoria de almacenamiento: aproximadamente 18,1 GB de pesos en total (10,0 GB del modelo de difusion + 6,7 GB del text encoder + 1,4 GB del VAE).
- GPU recomendadas: no se especifican modelos concretos; la unica referencia verificada es la NVIDIA T4 de 15 GB. Por el volumen de pesos, tarjetas consumer de 16 GB o mas (por ejemplo, serie RTX 40 con 16 GB) son el minimo practico; no hay datos sobre A100 o H100.
- Cabe en GPU consumer: si, segun la prueba documentada en una T4 con `--lowvram`.
- Opciones de despliegue: ComfyUI (servidor local con endpoint `/prompt` o interfaz grafica); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles; la model card no aporta tiempos de generacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros workflows o modelos de video, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No es un modelo: es un repositorio de workflows JSON; no contiene pesos ni permite inferencia por si mismo sin descargar los ficheros de `Comfy-Org/Wan_2.2_ComfyUI_repackaged`.
- Licencia no especificada: la model card no indica licencia, por lo que el uso comercial queda sin garantias hasta verificar los terminos del modelo Wan 2.2 original y del repack de Comfy-Org.
- Ambito muy limitado: solo se incluye un workflow (image-to-video con TI2V-5B); no hay variantes texto-a-video ni otras configuraciones.
- Resolucion y duracion fijas en el ejemplo verificado (480 x 832, 49 fotogramas); no se documenta el comportamiento con otros valores.
- Requiere hardware especifico: la verificacion se hizo en una T4 con `--lowvram`; no hay datos de rendimiento en otras GPUs ni de consumo de VRAM exacto.
- Sin datos de sesgos, alucinacion o cobertura idiomatica, que dependerian del modelo Wan 2.2 subyacente y no se detallan aqui.
- Riesgo de desactualizacion: el repositorio se creo y actualizo en noviembre de 2026 y no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni mantenimiento continuo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/myyinyue/wan22-comfyui-workflows
- Pipeline Yinyue: https://huggingface.co/myyinyue/yinyue-models
- Repack de modelos de Comfy-Org: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_repackaged

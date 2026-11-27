# anr2me/Kandinsky-6.0-VSR-2.0-distilled2steps-INT8-ConvRot

## Resumen

Kandinsky-6.0-VSR-2.0-distilled2steps-INT8-ConvRot es una cuantizacion post-entrenamiento de los pesos del modelo de superresolucion de video Kandinsky 6.0 VSR 2.0 (variante destilada a 2 pasos) desarrollado por Kandinsky Lab. El trabajo de cuantizacion lo publica el usuario anr2me, no el laboratorio original, y aplica el metodo ConvRot (arXiv:2512.03673) para reducir los tres componentes del modelo (transformer, VAE y latent upscaler) de bf16 a INT8.

El modelo resuelve la superresolucion de video: recibe una secuencia de fotogramas de baja resolucion y genera una version de alta resolucion, apoyandose en un pipeline de difusion con un transformer, un VAE y un upscaler latente. La variante destilada a 2 pasos esta pensada para inferencia rapida, con muy pocos pasos de muestreo.

La relevancia de este repositorio concreto es practica: reduce el peso en disco del pipeline completo de aproximadamente 17,5 GB en bf16 a unos 8,5 GB en INT8, manteniendo el mismo layout de carpetas, configuraciones y scheduler que el modelo original. Esta pensado para integrarse en ComfyUI mediante un node pack especifico y en Diffusers mediante un loader incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para superresolucion de video (transformer + VAE + latent upscaler) |
| Parametros totales | 1.414.793.856 (suma de los tensores del repositorio segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (escala por fila de salida, rotacion Hadamard con grupo de 256, sin datos de calibracion); tensorwise INT8 extendido para Conv3d |
| Idiomas soportados | no disponible (modelo de video, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (INT8 con tensores en tipo original para normas, embeddings, biases, modulacion y capas con error relativo > 0,02) |

## Arquitectura y entrenamiento

El modelo base es un pipeline de difusion para superresolucion de video compuesto por tres submodelos: un transformer de difusion (3,19 GB en bf16), un VAE (6,96 GB en bf16) y un latent upscaler (7,31 GB en bf16). La variante es la destilada a 2 pasos, lo que implica que el muestreo se resuelve en dos pasos en lugar de la decodificacion completa habitual. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al modelo original de Kandinsky Lab y no se detalla en la model card de esta cuantizacion.

La innovacion tecnica de este repositorio es el metodo ConvRot aplicado a la cuantizacion. El conversor utiliza una unica escala INT8 por fila de salida y, antes de cuantizar, aplica una rotacion Hadamard con tamano de grupo 256 para repartir los valores atipicos (outliers). No se uso ningun dato de calibracion. Los tensores que no se cuantizan (normas, embeddings, biases, capas de modulacion y cualquier capa con error relativo superior a 0,02) permanecen en su tipo de dato original. El repositorio incluye un fichero `quantization_report.json` con el detalle capa por capa. El formato Conv3d INT8 es una extension del formato `int8_tensorwise` y solo puede leerlo el loader incluido y los nodos del repositorio del autor.

## Capacidades

- Superresolucion de video: recibe fotogramas de baja resolucion y genera una version de alta resolucion mediante difusion.
- Inferencia en 2 pasos de muestreo gracias a la variante destilada, lo que reduce el coste computacional frente a pipelines de decodificacion largos.
- Integracion con ComfyUI mediante el node pack `kandinsky6-sr` y nodos especificos para cargar los modelos INT8.
- Integracion con Diffusers mediante el loader `convrot_int8_loader.load_pipeline`, que convierte los pesos a bf16 durante la carga.
- Carga con `enable_model_cpu_offload()` para repartir el uso de memoria entre CPU y GPU.
- No dispone de capacidades de texto, codigo, matematicas, tool calling, agentes ni audio; es un modelo puramente de vision/video.

## Casos de uso

- Restauracion y escalado de video de archivo: el pipeline permite subir la resolucion de material historico o de baja calidad usando dos pasos de muestreo, lo que lo hace viable para procesar lotes de secuencias sin tiempos de inferencia prohibitivos.
- Postproduccion en flujos de ComfyUI: al integrarse mediante el node pack `kandinsky6-sr` y los nodos INT8, se puede insertar como etapa de superresolucion dentro de un grafo de ComfyUI junto con otros nodos de generacion o edicion de video.
- Prototipado en hardware limitado: la reduccion de tamano en disco (de unos 17,5 GB a unos 8,5 GB) y la carga con offload de CPU permiten probar el pipeline en maquinas con menos VRAM que las necesarias para el modelo bf16, aunque con la penalizacion de velocidad correspondiente.
- Pipelines de mejora de video para streaming o contenido web: la variante destilada a 2 pasos encaja en escenarios donde se prioriza el throughput sobre la calidad maxima de muestreo.
- Investigacion sobre cuantizacion de modelos de difusion de video: el repositorio sirve como referencia practica de aplicacion de ConvRot con escala por fila y rotacion Hadamard a un pipeline de tres componentes, con informe de cuantizacion incluido.
- Evaluacion comparativa de calidad INT8 frente a bf16: el autor recomienda comparar los primeros resultados con el modelo original, lo que convierte este repositorio en un banco de pruebas para medir el impacto de la cuantizacion en VAE y upscaler latente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la calidad de la conversion se comprobo mediante el error de pesos y no mediante video generado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El autor senala que el loader convierte los pesos a bf16 durante la carga, por lo que el ahorro es de disco y de tiempo de descarga, no de memoria de video; la VRAM necesaria en ejecucion se acerca a la del modelo bf16 original.
- Los tres componentes suman aproximadamente 17,5 GB en bf16; con `enable_model_cpu_offload()` parte de los pesos se pueden mantener en CPU.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el volumen de pesos, se requiere una GPU con suficiente VRAM para el transformer, el VAE y el latent upscaler, o bien offload a CPU.
- Cabe en GPU consumer: no disponible de forma confirmada; el uso de offload de CPU es la via indicada por el autor para reducir la presion de memoria.
- Opciones de despliegue: Diffusers (version que incluya `Kandinsky6SRPipeline`, mas `accelerate`) y ComfyUI con el node pack `kandinsky6-sr` y el repositorio `kandinsky6-sr-int8-convrot`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-6.0-VSR-2.0-distilled2steps-INT8-ConvRot (este) | 1.414.793.856 | no disponible | safetensors INT8 | MIT | Hugging Face |
| kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers (original) | no disponible | no disponible | safetensors bf16 | MIT | Hugging Face |
| Otros modelos de superresolucion de video | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El unico contraste documentado es frente al modelo base bf16, del que este repositorio reduce el peso de los ficheros de 3,19 a 1,96 GB (transformer), de 6,96 a 2,46 GB (VAE) y de 7,31 a 4,13 GB (latent upscaler).

## Limitaciones y advertencias

- La conversion es post-entrenamiento y solo de pesos; la calidad se valido con el error de pesos, no con video generado. El autor recomienda comparar los primeros resultados con el modelo original y revisar con especial cuidado el VAE y el latent upscaler.
- El formato Conv3d INT8 es una extension del formato `int8_tensorwise` y solo lo pueden leer el loader incluido y los nodos del repositorio `kandinsky6-sr-int8-convrot`; no es compatible con los loaders oficiales de VAE y latent upscaler.
- En ComfyUI no se debe usar el nombre de carpeta `Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers`, reservado por el node pack oficial para los ficheros bf16.
- El loader de Diffusers convierte a bf16 durante la carga, por lo que no reduce el uso de VRAM en ejecucion.
- No se han publicado datos de sesgos, riesgo de alucinacion visual, limitaciones de contexto ni evaluaciones multilingues para este modelo.
- Licencia MIT, que permite uso comercial; no obstante, al ser una cuantizacion de terceros, conviene verificar la procedencia y los terminos del modelo base antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (27 de noviembre de 2026), por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anr2me/Kandinsky-6.0-VSR-2.0-distilled2steps-INT8-ConvRot
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers
- Repositorio del node pack INT8 ConvRot: https://github.com/anr2me/kandinsky6-sr-int8-convrot
- Node pack oficial para ComfyUI: https://github.com/kandinskylab/kandinsky-6-sr/tree/main/comfyui
- Paper del metodo ConvRot: https://arxiv.org/abs/2512.03673
- Laboratorio original (Kandinsky Lab): https://huggingface.co/kandinskylab

# sky-meilin/JoyAI-Image-Edit-Plus-Diffusers

## Resumen

JoyAI-Image Edit Plus es un modelo de edicion de imagen guiada por instrucciones de texto que acepta multiples imagenes de referencia y genera una imagen nueva combinando elementos de dichas referencias. Lo desarrolla JD.com a traves de Joy Future Academy, dentro de la familia JoyAI-Image, y la ficha analizada corresponde a una reproduccion alojada por el usuario sky-meilin bajo el identificador sky-meilin/JoyAI-Image-Edit-Plus-Diffusers.

Tecnicamente es un pipeline de difusion de tres piezas: un transformer multimodal MMDiT de 16B parametros (JoyImageEditPlusTransformer3DModel) que actua como modelo de difusion, un codificador de texto Qwen3-VL-8B-Instruct de 8B parametros que interpreta la instruccion y las imagenes de referencia, y un VAE AutoencoderKLWan de 240M parametros para codificar y decodificar latentes. El muestreo usa FlowMatchEulerDiscreteScheduler con 30 pasos y guidance scale 4.0 como ajustes recomendados, en precision bfloat16.

Su relevancia ahora es doble: por un lado cubre el caso de edicion multi-imagen (composicion de sujeto y escena a partir de varias referencias), que es menos frecuente que la edicion con una sola imagen; por otro, se distribuye con licencia Apache-2.0 y pesos en safetensors, lo que facilita su integracion en productos comerciales. Como contrapartida, la integracion en diffusers todavia requiere instalar una rama de PR no fusionada, y el repositorio no publica benchmarks ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion con transformer multimodal MMDiT (JoyImageEditPlusTransformer3DModel) + codificador de texto Qwen3-VL-8B-Instruct + VAE AutoencoderKLWan + FlowMatchEulerDiscreteScheduler |
| Parametros totales | 16.263.675.968 (transformer MMDiT, segun safetensors); el pipeline completo anade 8B del codificador de texto y 240M del VAE |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el codificador de texto es Qwen3-VL-8B-Instruct, pero la model card no documenta la ventana usada) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa torch.bfloat16, sin cuantizaciones publicadas |
| Idiomas soportados | no disponible (la model card no lista idiomas; las instrucciones de ejemplo estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusion latente con un backbone transformer MMDiT (Multimodal Diffusion Transformer) de 16B parametros, denominado JoyImageEditPlusTransformer3DModel. La condicion textual y visual la aporta Qwen3-VL-8B-Instruct, un modelo vision-language de 8B parametros que procesa simultaneamente la instruccion de texto y las imagenes de referencia; se trata por tanto de una arquitectura en la que un VLM actua como codificador de contexto y un transformer de difusion genera los latentes, que despues decodifica el VAE AutoencoderKLWan (240M). El muestreo se realiza con FlowMatchEulerDiscreteScheduler, con 30 pasos de inferencia y guidance scale 4.0 como valores recomendados.

No hay informacion publicada en la documentacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas de optimizacion como decodificacion especulativa o atencion lineal. La unica referencia de atribucion es la cita del informe JoyAI-Image (Joy Future Academy, JD, 2025), descrito como modelo fundacional multimodal unificado para comprension, generacion y edicion de imagen. La resolucion de salida no se fija manualmente: el pipeline la deduce de la ultima imagen de referencia mediante vae_image_processor.get_default_height_width(), agrupandola en buckets de base 1024.

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural, a partir de una o varias imagenes de referencia.
- Composicion multi-imagen: combina un sujeto extraido de una referencia con la escena de otra (ejemplo oficial: combinar la persona de la segunda imagen con la escena de la primera).
- Generacion imagen a imagen (pipeline_tag: image-to-image) con soporte de prompt negativo para filtrar artefactos de baja calidad.
- Resolucion de salida autodetectada a partir de la ultima referencia, con buckets de base 1024.
- Control de reproducibilidad mediante semilla (generator con manual_seed) y de fidelidad mediante num_inference_steps y guidance_scale.
- Inferencia por linea de comandos incluida en el repositorio (inference.py) con argumentos de imagenes, prompt, pasos, guidance, semilla y salida.
- Integracion programatica via diffusers con la clase JoyImageEditPlusPipeline.

No se documentan capacidades de tool calling, function calling, uso agentico, modo de razonamiento explicito, generacion de audio ni salida de video.

## Casos de uso

- Edicion de producto en comercio electronico: sustituir el fondo o la escena de una fotografia de catalogo manteniendo intacto el articulo, usando la foto original como referencia y una segunda imagen con la localizacion deseada. El condicionamiento multi-imagen evita regenerar el producto desde cero.
- Composicion publicitaria: reunir en una sola pieza al modelo de una campana y el entorno o atrezzo de otra referencia, con la instruccion de texto definiendo la interaccion entre ambos (por ejemplo, sostener un objeto).
- Postproduccion fotografica asistida: retoques localizados descritos en lenguaje natural sobre imagenes de estudio, con prompt negativo para descartar salidas borrosas o deformadas.
- Prototipado de conceptos para diseno grafico: generar variantes de una escena a partir de referencias de estilo y de contenido, iterando con semillas y pasos distintos para explorar alternativas antes de la produccion final.
- Creacion de material para redes sociales: adaptar una misma imagen base a distintos formatos y ambientaciones partiendo de referencias de moodboard, sin necesidad de sesiones fotograficas adicionales.
- Investigacion en edicion generativa: servir como linea base reproducible (semilla fija, 30 pasos, guidance 4.0) para comparar tecnicas de edicion multi-imagen o para estudiar el comportamiento de un codificador VLM acoplado a un MMDiT.
- Aplicaciones de accesibilidad o simulacion visual: componer escenas hipoteticas combinando objetos y contextos aportados por el usuario como referencias separadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio analizado no incluye tablas comparativas de metricas tipo FID, CLIP score, ImageReward ni evaluaciones de fidelidad de edicion, y los resultados de busqueda web obtenidos no guardan relacion con el modelo (corresponden al operador de television y telecomunicaciones Sky).

## Requisitos de hardware

- VRAM estimada: el transformer MMDiT de 16,26B parametros en bfloat16 ocupa aproximadamente 32,5 GB; el codificador de texto Qwen3-VL-8B-Instruct anade unos 16 GB; el VAE, unos 0,5 GB. El repositorio completo ocupa 50,3 GB, lo que da una referencia del peso total de los pesos.
- Pipeline completo en bfloat16 sin offloading: en torno a 50 GB de VRAM, lo que exige GPU de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para ejecucion holgada; A6000 48 GB o L40S 48 GB quedan al limite y probablemente requieran offloading parcial.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) sin tecnicas de offloading; con enable_model_cpu_offload o enable_sequential_cpu_offload de diffusers es viable, a costa de una latencia muy superior. No se han publicado cuantizaciones oficiales (por ejemplo, en 8 o 4 bits) que reduzcan el requisito.
- Opciones de despliegue: diffusers (obligatorio instalar la rama del PR add-joyimage-edit-plus hasta que se fusione; version declarada >= 0.39.0), PyTorch con CUDA y bfloat16. No aplican vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusion de imagen y no de un LLM de texto.
- Latencia y throughput: no disponibles. La configuracion recomendada es de 30 pasos de inferencia con guidance scale 4.0, valor que sirve como referencia para estimar el coste por imagen en cada GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoyAI-Image Edit Plus | 16,26B (transformer MMDiT) + 8B (codificador VLM) | Difusion MMDiT con VLM para edicion multi-imagen | Multiples imagenes de referencia + instruccion de texto | Apache-2.0 | Pesos safetensors en HuggingFace; requiere rama de PR de diffusers |
| Qwen-Image-Edit | no disponible en la informacion proporcionada | Edicion de imagen guiada por texto | No disponible | no disponible | no disponible |
| FLUX.1 Kontext | no disponible en la informacion proporcionada | Edicion de imagen guiada por texto | No disponible | no disponible | no disponible |
| Step1X-Edit | no disponible en la informacion proporcionada | Edicion de imagen guiada por texto | No disponible | no disponible | no disponible |

No se dispone de datos verificados sobre parametros, contexto, rendimiento o licencia de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no puede completarse. La diferencia funcional mas clara de JoyAI-Image Edit Plus frente a las alternativas habituales de edicion con una sola imagen es la aceptacion de varias referencias simultaneas como condicionamiento.

## Limitaciones y advertencias

- El repositorio analizado (sky-meilin/JoyAI-Image-Edit-Plus-Diffusers) no es el repositorio oficial: la propia model card remite a jdopensource/JoyAI-Image-Edit-Plus-Diffusers en los ejemplos de codigo. Se trata de una reproduccion con 0 descargas y 0 likes, lo que impide verificar su integridad frente al original.
- La fecha de creacion y actualizacion registrada es 2026-10-05, posterior a la fecha de la cita del informe (2025); conviene confirmar la procedencia de los pesos antes de usarlos en produccion.
- La integracion en diffusers no esta fusionada: es necesario instalar la rama add-joyimage-edit-plus del repositorio de tangyanf, lo que implica dependencia de codigo no estable y riesgo de cambios incompatibles.
- No se documentan datos de entrenamiento, composicion del dataset ni procesos de alineacion; esto impide evaluar sesgos de representacion (genero, etnia, edad) en las imagenes generadas.
- Riesgo de alucinacion visual inherente a los modelos generativos: la instruccion puede producir objetos, texturas o identidades que no existen en las referencias. El uso de prompt negativo y de una semilla fija mitiga la variabilidad, pero no garantiza fidelidad.
- No se especifican idiomas soportados; las instrucciones de ejemplo estan en ingles y no hay evidencia de rendimiento en castellano.
- La resolucion de salida se hereda de la ultima imagen de referencia, lo que puede producir relaciones de aspecto no deseadas si las referencias tienen formatos muy distintos.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks y de evaluaciones de seguridad hace recomendable una validacion propia antes de desplegarlo en flujos de produccion.
- El requisito de VRAM (del orden de 50 GB en bfloat16) limita su uso a infraestructura de gama alta o a configuraciones con offloading penalizadas en latencia.
- Los resultados de busqueda web obtenidos no contienen informacion tecnica sobre el modelo, por lo que no ha sido posible contrastar la model card con fuentes independientes.

## Enlaces

- Repositorio de HuggingFace analizado: https://huggingface.co/sky-meilin/JoyAI-Image-Edit-Plus-Diffusers
- Repositorio oficial referenciado en los ejemplos de codigo: https://huggingface.co/jdopensource/JoyAI-Image-Edit-Plus-Diffusers
- Repositorio GitHub de la familia JoyAI-Image: https://github.com/jd-opensource/JoyAI-Image
- Rama de diffusers con el pipeline JoyImageEditPlusPipeline: https://github.com/tangyanf/diffusers/tree/add-joyimage-edit-plus
- Modelo base (codificador de texto): https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct

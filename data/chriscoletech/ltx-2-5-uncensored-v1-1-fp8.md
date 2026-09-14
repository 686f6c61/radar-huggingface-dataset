# ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8

## Resumen

LTX-2.5-uncensored-v1.1-FP8 es un derivado afinado (fine-tune) del modelo de generacion de video Lightricks/LTX-2.5, publicado por el usuario ChrisColeTech. Se distribuye como un build pre-fusionado en formato FP8 y GGUF que incorpora cinco LoRA ya integradas en los pesos: Eros10 NSFW (fuerza 0,7), DMD Distilled (1,0), LTXV In-Context LoRA (0,7), LTX Video IC-LoRA Detailer (0,45) e Img2Vid LoRA (0,45). El resultado es un modelo unico que cubre text-to-video, image-to-video, video-to-video y audio-to-video sin necesidad de cargar adaptadores externos.

El modelo base declarado es Lightricks/LTX-2.5, con TenStrip/LTX2.3-10Eros y TenStrip/LTX2.3_DMD_Lora como ascendientes de los fine-tunes. El dato de safetensors indica 21.004.025.600 parametros totales (aproximadamente 21.000 millones) para el componente de difusion, a los que se suma un codificador de texto descrito por el autor como "Gemma4 12B uncensored" en int8 con las proyecciones de LTX ya integradas. El repositorio ocupa 226 GB, lo que refleja la convivencia de varios formatos y precisiones en el mismo espacio.

Su relevancia practica reside en dos factores. Por un lado, la destilacion DMD permite generar video con tan solo 4 pasos de muestreo (8 pasos para el mejor resultado), lo que reduce drasticamente el coste de inferencia frente a los modelos de difusion de video convencionales. Por otro lado, la fusion de las LoRA elimina la gestion de multiples adaptadores en ComfyUI, a cambio de perder granularidad en el ajuste de cada una. El caracter "uncensored" y la etiqueta not-for-all-audiences lo orientan a produccion de contenido para adultos y a flujos creativos sin filtros, un nicho con demanda alta pero con implicaciones legales y de licencia relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para video (familia LTX Video 2.5); detalles de bloques no disponibles |
| Parametros totales | 21.004.025.600 (dato de safetensors, componente de difusion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (fp8_scaled) y GGUF; el codificador de texto se distribuye en int8. Lista completa de niveles GGUF no disponible |
| Idiomas soportados | No disponible |
| Licencia | unknown (segun el campo license del repositorio) |
| Formato de pesos | safetensors (FP8), GGUF, JSON de workflows de ComfyUI |

Datos adicionales del repositorio: 226,0 GB de tamano, 8.904 descargas, 12 likes, fecha de creacion 11-08-2026 y ultima actualizacion 13-09-2026. Modelos base declarados: Lightricks/LTX-2.5, TenStrip/LTX2.3-10Eros y TenStrip/LTX2.3_DMD_Lora.

## Arquitectura y entrenamiento

No hay informacion detallada en la documentacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Lo que si se documenta es la receta de fusion: el autor ha integrado cinco adaptadores LoRA sobre el modelo base mediante fusion de pesos con fuerzas explicitas. La LoRA DMD Distilled (fuerza 1,0) es la responsable de la reduccion de pasos de muestreo y, segun el autor, de una mejor preservacion facial en image-to-video y de un mejor seguimiento de instrucciones frente a la version v1 y frente al modelo stock. Las dos LoRA de tipo IC (In-Context) aportan adherencia a imagenes de referencia y control video-to-video; los adaptadores Img2Vid y Eros10 completan el comportamiento.

El codificador de texto es un componente clave: el autor indica que se trata de un "Gemma4 12B uncensored" con las proyecciones de LTX ya incorporadas, cuantizado en int8, de modo que no requiere ficheros adicionales. Esto implica que la pipeline completa consta de al menos dos redes de gran tamano (el difusor de ~21.000 millones de parametros y el codificador de texto de ~12.000 millones), lo que condiciona los requisitos de memoria. La innovacion practica mas destacable es la generacion en 4-8 pasos gracias a la destilacion DMD, junto con la capacidad multimodal de audio integrada (generacion de habla y sonido sincronizados a partir del prompt).

## Capacidades

- Generacion de video a partir de texto (text-to-video) con 4 pasos minimos y 8 pasos recomendados.
- Generacion de video a partir de imagen (image-to-video) con el adaptador Img2Vid ya integrado, sin configuracion adicional.
- Transformacion video-to-video mediante la LoRA IC-LoRA Detailer.
- Audio-to-video y variantes con audio: el autor lista los modos FL2VA, T2VA, I2VA y REF2VA, que abarcan generacion conjunta de video, habla y sonido.
- Generacion de habla y efectos de sonido sincronizados, controlables mediante etiquetas de audio en el prompt.
- Narrativa multi-plano: el prompt admite descripciones de corte entre planos (por ejemplo, pasar de un primer plano frontal a un plano general trasero).
- Plantilla de prompt estructurada con tres secciones obligatorias para el modo IC LoRA: [VISUAL], [SPEECH] y [SOUNDS].
- Control de banda sonora: el autor indica que la negacion explicita de musica no funciona y que debe usarse el termino "unscored" para forzar la ausencia de musica de fondo.
- Aderencia mejorada a imagenes de referencia gracias a las dos LoRA de tipo In-Context.
- Ejecucion en ComfyUI mediante el nodo personalizado comfyui-gguf-loader; se incluyen workflows de ejemplo en el repositorio.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente; son capacidades propias de modelos de lenguaje y no aplican al caso de uso principal de este modelo.

## Casos de uso

- Previsualizacion de planos en produccion audiovisual: generar animaticos de 4 a 8 pasos a partir de un guion escrito permite validar encuadres y ritmo antes de rodar, con un coste de computo muy inferior al de un modelo de difusion de video no destilado.
- Animacion de personajes a partir de una ilustracion: el flujo image-to-video con el adaptador Img2Vid integrado sirve para dar movimiento a arte conceptual o a ilustraciones de personajes sin tener que componer manualmente una cadena de adaptadores.
- Doblaje y localizacion de video: los modos con audio (T2VA, I2VA) generan habla y sonido sincronizados a partir de un guion, utiles para crear versiones localizadas de clips cortos antes de recurrir a un estudio de doblaje.
- Avatares parlantes para formacion corporativa: alimentando una fotografia del instructor y un texto con las secciones [SPEECH] y [SOUNDS], se obtienen videos explicativos sin necesidad de grabacion en plato.
- Postproduccion y retoque video-to-video: la LoRA IC-LoRA Detailer permite aplicar control sobre metraje existente, por ejemplo para reestilizar una secuencia manteniendo la estructura original.
- Creacion de material para ecommerce y publicidad: generar variaciones de un producto en movimiento desde una imagen fija para pruebas A/B de creatividades antes de comprometer presupuesto de rodaje.
- Prototipado rapido de assets para videojuegos: producir clips de referencia de animaciones y efectos para presentar a un equipo de arte antes de la implementacion final.
- Produccion de contenido para adultos: el ajuste Eros10 y la ausencia de censura en el codificador de texto estan orientados explicitamente a este nicho; su uso exige verificar la legalidad en la jurisdiccion de destino, la verificacion de edad y el cumplimiento de las politicas de la plataforma de distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de calidad de video (FVD, CLIP similarity, VBench u otras), ni comparaciones numericas frente al modelo base o a alternativas. Los unicos datos de rendimiento declarados son cualitativos y proceden del autor: generacion funcional con 4 pasos de muestreo y mejor resultado con 8 pasos.

## Requisitos de hardware

- VRAM estimada para el difusor en FP8: en torno a 21-25 GB solo para los pesos del componente de difusion, dado que el recuento de parametros es de aproximadamente 21.000 millones. Es una estimacion derivada del numero de parametros, no un dato publicado.
- Codificador de texto: al tratarse de un modelo descrito como Gemma4 12B en int8, anade del orden de 12-14 GB si se carga en memoria de forma simultanea. Se desconoce si el repositorio ofrece una variante que permita descargarlo a CPU o cuantizarlo mas agresivamente.
- Repositorio completo: 226 GB, aunque no es necesario descargarlo entero si se seleccionan unicamente los ficheros del formato deseado.
- GPU de datacenter: A100 80 GB y H100 80 GB son las opciones sin riesgo de offloading para la pipeline completa en FP8.
- GPU consumer: una RTX 4090 o RTX 3090 con 24 GB puede alojar el difusor en FP8, pero muy probablemente requerira offloading del codificador de texto. Tarjetas de 16 GB (RTX 4080, 4070 Ti Super) necesitan cuantizaciones GGUF mas agresivas y gestion de memoria por capas.
- Tarjetas de 8-12 GB: viables solo con GGUF de baja precision y offloading intensivo a RAM o disco, con penalizacion severa de velocidad.
- Opciones de despliegue: el autor documenta ComfyUI con el nodo comfyui-gguf-loader y proporciona workflows JSON de ejemplo. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a un modelo de difusion de video de este tipo.
- Latencia y throughput: no disponibles. El unico dato util para estimar coste es el numero de pasos de muestreo (4 minimo, 8 recomendado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8 | ~21.000 M (difusor) + codificador de texto 12B int8 | No disponible | Sin benchmarks publicados; 4-8 pasos por destilacion DMD | unknown | HuggingFace, FP8 y GGUF, 8.904 descargas |
| Lightricks/LTX-2.5 (base) | No disponible | No disponible | Sin datos en la informacion disponible | No disponible en la informacion proporcionada | HuggingFace, repositorio oficial |
| TenStrip/LTX2.3-10Eros | No disponible | No disponible | Sin datos en la informacion disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de generacion de video open source (por ejemplo, familias Wan o HunyuanVideo) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos en la informacion proporcionada para establecer una comparacion fiable |

La comparacion cuantitativa con alternativas de la misma categoria no puede completarse con la informacion disponible. El elemento diferenciador objetivo de este modelo frente a su base es la fusion de las cinco LoRA y la destilacion a 4-8 pasos, no una mejora de parametros o de ventana de contexto.

## Limitaciones y advertencias

- Licencia "unknown": no se especifican terminos de uso, lo que impide determinar si el uso comercial esta permitido. Ademas, al derivar de Lightricks/LTX-2.5, habria que revisar por separado los terminos del modelo original, que no se incluyen en la informacion proporcionada.
- Etiquetado explicito como not-for-all-audiences y orientado a contenido NSFW, con la LoRA Eros10 integrada a fuerza 0,7. El uso en productos comerciales abiertos al publico general es desaconsejable sin filtrado posterior.
- Riesgo legal y de cumplimiento: la generacion de contenido para adultos con personas sinteticas exige verificacion de edad, etiquetado y cumplimiento de la normativa de la jurisdiccion de despliegue. No se documentan mecanismos de moderacion, marcas de agua ni metadatos de procedencia en el repositorio.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir artefactos anatomicos, incoherencias temporales entre fotogramas y texto en pantalla malformado. El autor no publica tasas de fallo.
- Idiomas soportados: no disponibles. No se indica si el habla generada cubre castellano o si esta limitada al ingles.
- Ausencia de benchmarks: no hay datos objetivos de calidad, por lo que la evaluacion depende de pruebas propias.
- Mantenimiento incierto: se trata de un fine-tune de autor individual, con 12 likes y sin garantia de soporte a largo plazo ni de compatibilidad futura con versiones nuevas de ComfyUI.
- Requisitos de memoria elevados: la combinacion de un difusor de ~21.000 millones de parametros y un codificador de texto de ~12.000 millones en int8 limita el despliegue en hardware de consumo.
- Las afirmaciones sobre mejoras (mejor preservacion facial, mejor seguimiento de instrucciones) proceden del autor y no estan respaldadas por mediciones publicadas.
- Comportamiento de prompt no intuitivo: la negacion explicita ("no music") no funciona y debe sustituirse por el termino "unscored", lo que indica fragilidad en el seguimiento de instrucciones negativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8
- Modelo base oficial: https://huggingface.co/Lightricks/LTX-2.5
- Modelo base del fine-tune NSFW: https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA DMD utilizada: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Workflow de text-to-video de ejemplo: https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8/blob/main/workflow_examples/ltx25_t2v_simple.json
- Imagen del workflow: https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8/resolve/main/workflow_examples/workflow_example_ltx25_t2v_simple.png
- Muestra de text-to-video: https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8/resolve/main/samples/ComfyUI_00032_.mp4
- Muestra de text-to-video con plantilla IC LoRA: https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8/resolve/main/samples/ComfyUI_00034_.mp4
- Imagen de entrada de image-to-video: https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8/resolve/main/samples/wildcards_01450_.png
- Muestra de image-to-video: https://huggingface.co/ChrisColeTech/LTX-2.5-uncensored-v1.1-FP8/resolve/main/samples/ComfyUI_00065_.mp4
- Hilo de la comunidad sobre flujos de trabajo en ComfyUI: https://www.reddit.com/r/comfyui/comments/1wfh062/share_your_personal_porn_workflow/

No se han encontrado papers, blogs tecnicos ni repositorios de codigo adicionales en los resultados de busqueda web proporcionados.

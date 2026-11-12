# PrunaAI/P-Q-Image-2.1-Remove-Object-Comfy

## Resumen

P-Q-Image-2.1-Remove-Object es un conjunto de adaptadores LoRA desarrollado por PrunaAI sobre el modelo de difusion Qwen-Image-2.1 de Alibaba (serie Qwen). Su funcion es la eliminacion de objetos en imagenes: el usuario marca con una mascara el objeto que quiere borrar, describe que es, y el modelo lo sustituye por el fondo coherente que habria detras, dejando intacto el resto de la imagen. Es, por tanto, un modelo de edicion de imagen (pipeline image-to-image) orientado a inpainting y object removal, no un modelo generativo de texto.

El repositorio publicado en Hugging Face es la exportacion para ComfyUI del adaptador original `PrunaAI/P-Q-Image-2.1-Remove-Object`, e incluye los pesos convertidos al formato LoRA de ComfyUI en bf16, flujos de trabajo listos para usar, un ejemplo y un nodo personalizado (`precise_removal_outline`) que facilita el trazado preciso de la mascara. Ademas, incorpora variantes "few-step" (6 y 8 pasos) que funcionan sobre los LoRA de destilacion de `PrunaAI/P-Q-Image-2.1-Comfy`, reduciendo el coste de inferencia frente a los 40 pasos del modelo base.

Su relevancia actual radica en que ofrece una capacidad de edicion localizada de alta calidad dentro del ecosistema ComfyUI, con flujos preconfigurados, sin CFG y con mascara opcional, lo que simplifica la integracion en pipelines de retoque fotografico y produccion de contenido. El repositorio ocupa aproximadamente 0,5 GB y la licencia es `qwen-research` (etiquetada como "other" en Hugging Face), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (Qwen-Image-2.1) con adaptadores LoRA; no se detalla la arquitectura interna del modelo base en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en bf16; el flujo de ComfyUI referencia el modelo base en int8 (`qwen_image_2.1_int8_convrot.safetensors`) y text encoders en int8 |
| Idiomas soportados | no disponible (el prompt de edicion se escribe en lenguaje natural; el ejemplo de la model card esta en ingles) |
| Licencia | `qwen-research` (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (LoRA en formato ComfyUI, bf16) |

## Arquitectura y entrenamiento

El modelo es un conjunto de LoRA entrenados sobre Qwen-Image-2.1, un modelo de difusion para generacion y edicion de imagenes de la familia Qwen. Los adaptadores se aplican sobre el modelo base para especializarlo en eliminacion de objetos: dado un par imagen-mascara y una instruccion textual ("remove the phone and the raised arm holding it"), el modelo reconstruye la region enmascarada con contenido coherente con el fondo. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion principal del repositorio es la combinacion con los LoRA de destilacion de PrunaAI (`PrunaAI/P-Q-Image-2.1-Comfy`), que permiten ejecutar la eliminacion en 6 u 8 pasos en lugar de los 40 del modelo base, sin classifier-free guidance (CFG). Los flujos de ComfyUI fijan automaticamente el numero de pasos, los sigmas y la fuerza del adaptador (0,7 para las variantes few-step, 1,0 para la variante base). La variante base se ofrece como alternativa para evitar la deriva (drift) que puede introducir el modelo destilado.

## Capacidades

- Eliminacion de objetos en imagenes: sustituye el objeto enmascarado por el fondo que habria detras, manteniendo el resto de la imagen sin cambios.
- Edicion guiada por mascara opcional: la mascara se puede pintar en el MaskEditor de ComfyUI o cargar desde archivo (blanco = objeto a eliminar, negro = conservar).
- Edicion guiada por texto: el usuario describe el objeto a eliminar mediante un prompt en lenguaje natural.
- Inpainting localizado: la modificacion se limita a la region indicada.
- Variantes few-step: 6 pasos (recomendada) y 8 pasos, sin CFG, sobre LoRA de destilacion.
- Variante base: 40 pasos con fuerza 1,0, para casos en los que se quiera evitar la deriva del modelo destilado.
- Integracion con ComfyUI: flujos de trabajo listos para usar, nodo personalizado `precise_removal_outline` (categoria Pruna) para trazar contornos precisos.
- Soporte de prompt enhancer: el flujo incluye un modelo text encoder (`qwen3.5_9b_qwen_image_2.1_pe_i2i`) que aparece desactivado por defecto, pero ComfyUI exige su presencia.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Retoque fotografico profesional: eliminar objetos no deseados (telefonos, manos alzadas, senalizacion, cables) de fotografias de conciertos, eventos o producto, con la mascara pintada en el MaskEditor y la variante de 6 pasos para iterar rapidamente.
- Limpieza de imagenes para catalogo de e-commerce: borrar elementos del fondo o accesorios no deseados en fotos de producto, manteniendo la coherencia del resto de la escena, gracias a que el modelo solo modifica la region enmascarada.
- Produccion de contenido para redes sociales: eliminar marcas de agua no deseadas, objetos distractores o personas en el fondo de imagenes antes de publicarlas, con flujos preconfigurados que reducen el tiempo de configuracion.
- Edicion de imagenes de archivo y patrimonio: retirar elementos anacronicos o danos de digitalizaciones antiguas en regiones concretas, usando la mascara para delimitar con precision el area a reconstruir.
- Preprocesado para pipelines de vision por computador: eliminar objetos que confunden a detectores o segmentadores en datasets de entrenamiento, generando versiones limpias de las imagenes mediante la variante base de 40 pasos para maximizar la fidelidad.
- Automatizacion en ComfyUI: integrar el flujo de trabajo como nodo dentro de grafos mayores de generacion y edicion de imagen, aprovechando el nodo `precise_removal_outline` para generar mascaras de forma programatica.
- Prototipado rapido de edicion de imagen: la variante de 6 pasos sin CFG permite obtener resultados en pocos pasos, adecuada para pruebas de concepto y demostraciones interactivas en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El flujo de ComfyUI requiere cargar el modelo de difusion Qwen-Image-2.1 en int8, dos text encoders en int8 (`qwen3vl_8b` y `qwen3.5_9b`) y el VAE en bf16, ademas de los LoRA; el consumo agregado no se detalla en la model card.
- GPU recomendadas: no disponible. La model card no especifica modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base Qwen-Image-2.1 y de la cuantizacion int8 empleada en el flujo.
- Opciones de despliegue: ComfyUI (con soporte nativo de Qwen-Image-2.1), nodo personalizado `precise_removal_outline` (requiere opencv en el Python de ComfyUI).
- Latencia y throughput: no disponibles; la variante de 6 pasos y la de 8 pasos reducen el numero de pasos frente a los 40 del modelo base, lo que disminuye el coste computacional por imagen, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P-Q-Image-2.1-Remove-Object (este) | LoRA de eliminacion de objetos sobre Qwen-Image-2.1 | 6 / 8 / 40 | Imagen + mascara + prompt | qwen-research | Hugging Face, ComfyUI |
| Qwen-Image-2.1 (modelo base) | Modelo de difusion de generacion/edicion de imagen | 40 | Imagen + prompt | qwen-research | Hugging Face, Comfy-Org |
| P-Q-Image-2.1-Comfy (PrunaAI) | LoRA de destilacion few-step sobre Qwen-Image-2.1 | 6 / 8 | Imagen + prompt | qwen-research | Hugging Face |
| P-Q-Image-2.1-Remove-Object (original) | LoRA de eliminacion de objetos (sin exportacion ComfyUI) | 6 / 8 / 40 | Imagen + mascara + prompt | qwen-research | Hugging Face |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con otros modelos de eliminacion de objetos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso comercial; es necesario revisar los terminos del modelo base Qwen-Image-2.1 antes de cualquier despliegue en produccion.
- La variante few-step puede introducir deriva (drift) respecto a la imagen original; la model card recomienda la variante base si esto es critico.
- La calidad de la eliminacion depende de la precision de la mascara; el nodo `precise_removal_outline` ayuda, pero no garantiza resultados perfectos en objetos complejos.
- Riesgo de artefactos o reconstrucciones incoherentes en regiones con texturas complejas, iluminacion dificil o estructuras geometricas.
- No se detallan sesgos conocidos ni limitaciones de idioma en la informacion disponible.
- El flujo de ComfyUI exige descargar el modelo base y los text encoders desde otros repositorios (Comfy-Org/Qwen-Image-2.1 y PrunaAI/P-Q-Image-2.1-Comfy), ademas de actualizar ComfyUI a una version con soporte nativo de Qwen-Image-2.1.
- El prompt enhancer (`qwen3.5_9b_qwen_image_2.1_pe_i2i`) aparece desactivado en los flujos, pero ComfyUI comprueba que este presente; su ausencia puede impedir la ejecucion del flujo.
- No se especifican requisitos de hardware ni latencias, por lo que el dimensionamiento debe validarse empiricamente antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PrunaAI/P-Q-Image-2.1-Remove-Object-Comfy
- Modelo base del adaptador: https://huggingface.co/PrunaAI/P-Q-Image-2.1-Remove-Object
- LoRA de destilacion few-step: https://huggingface.co/PrunaAI/P-Q-Image-2.1-Comfy
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Pesos para ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Repositorio GitHub de PrunaAI: https://github.com/PrunaAI/pruna
- Twitter/X de PrunaAI: https://twitter.com/PrunaAI
- LinkedIn de PrunaAI: https://www.linkedin.com/company/pruna-ai
- Discord de PrunaAI: https://discord.com/invite/JFQmtFKCjd

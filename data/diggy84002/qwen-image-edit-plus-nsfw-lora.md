# Diggy84002/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador LoRA publicado por el usuario Diggy84002 para el pipeline de difusion Qwen-Image-Edit-2511 de Qwen. Su funcion es anadir capacidades de edicion y generacion de contenido explicito (NSFW) a un modelo base de edicion de imagen que, de fabrica, aplica filtros de seguridad sobre ese tipo de contenido. Se distribuye como un unico fichero safetensors de aproximadamente 563 MB dentro de un repositorio de 0,6 GB, y esta pensado para cargarse sobre el transformer de difusion del modelo base mediante la libreria diffusers.

Tecnicamente no es un modelo autonomo, sino un adaptador de bajo rango que modifica los pesos de QwenImageTransformer2DModel, un transformer de difusion con arquitectura MMDiT (multimodal diffusion transformer). Esto implica que no tiene parametros, contexto ni tokenizador propios: hereda todas las caracteristicas del modelo base y solo aporta un sesgo de estilo y contenido adicional en las capas que el adaptador entrena. La model card no documenta el rango del LoRA, los modulos objetivo ni el dataset de entrenamiento.

Su relevancia practica es limitada y muy especifica: se publica bajo licencia OpenRAIL++, lleva la etiqueta not-for-all-audiences, no declara idiomas soportados y, en el momento de redactar esta ficha, acumula cero descargas y cero valoraciones. Resulta de interes sobre todo para equipos que trabajen en generacion de contenido para adultos con verificacion de edad, en investigacion sobre moderacion automatica o en evaluacion de seguridad de pipelines de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (transformer de difusion MMDiT) |
| Parametros totales | no disponible (repositorio de 0,6 GB; fichero safetensors de ~563 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye solo en safetensors) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | openrail++ |
| Formato de pesos | safetensors, compatible con diffusers |
| Modelo base | Qwen/Qwen-Image-Edit-2511 |
| Nombre interno | MCNL v1 - Multi Concept NSFW LoRA |
| Pipeline | image-to-image |
| Libreria | diffusers |
| Tamano del repositorio | 0,6 GB |
| Parametros de inferencia sugeridos | num_inference_steps=40, true_cfg_scale=4.0, negative_prompt vacio |

## Arquitectura y entrenamiento

El adaptador se aplica sobre QwenImageTransformer2DModel, el bloque transformer que constituye el nucleo del pipeline Qwen-Image-Edit. Se trata de una arquitectura MMDiT, en la que las senales de texto e imagen se procesan conjuntamente en un unico flujo de atencion, lo que permite condicionar la edicion sobre una imagen de entrada. El LoRA inyecta matrices de bajo rango en ese transformer para desplazar la distribucion de salida hacia contenido explicito, sin modificar los pesos originales ni el VAE ni el codificador de texto.

No hay informacion publicada sobre el proceso de entrenamiento: se desconoce el numero de imagenes utilizadas, la composicion del dataset, la resolucion de entrenamiento, el rango y alpha del LoRA, los modulos objetivo (attention, MLP, proyecciones) ni si hubo etapas de ajuste fino adicionales. Tampoco se documenta el uso de tecnicas como regularizacion por dropout, entrenamiento con captions sinteticos o destilacion. La activacion de las capacidades del adaptador depende de palabras clave o triggers explicitos: la model card define un conjunto de once tokens asociados a conceptos anatomicos y actos sexuales concretos; se remite a la model card original para la lista literal, ya que reproducirla aqui no aporta informacion tecnica adicional.

## Capacidades

- Edicion de imagen a imagen (image-to-image) sobre el pipeline Qwen-Image-Edit-2511, con el condicionamiento adicional que introduce el adaptador.
- Generacion y edicion de contenido explicito para adultos, que es la funcion declarada del LoRA.
- Activacion de conceptos concretos mediante palabras clave o trigger words definidas en la model card.
- Composicion con otros adaptadores: el ejemplo de uso emplea `load_lora_weights` con `adapter_name` y `set_adapters`, lo que permite activar y desactivar este LoRA junto a otros.
- Compatibilidad con parametros de control del pipeline base: `num_inference_steps`, `true_cfg_scale` y `negative_prompt`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision por comprension, tool calling ni capacidades de agente. No es un modelo de lenguaje.
- No se declaran capacidades multilingues; el soporte de idioma depende integramente del codificador de texto del modelo base.

## Casos de uso

- Generacion de datasets para moderacion de contenido: el adaptador permite producir lotes controlados de imagenes explicitas etiquetadas, utiles para entrenar o validar clasificadores NSFW y sistemas de filtrado en plataformas.
- Red-teaming de filtros de seguridad: al saltarse las restricciones del modelo base, sirve para medir la tasa de falsos negativos de un clasificador propio antes de desplegarlo en produccion.
- Verificacion de robustez de pipelines de difusion: permite comprobar como se comporta Qwen-Image-Edit-2511 ante adaptadores de terceros, incluyendo degradacion de calidad, artefactos anatomicos y coherencia de la edicion.
- Produccion de contenido para plataformas de adultos: en entornos con verificacion de edad y cumplimiento normativo, el LoRA edita fotografias existentes (iluminacion, encuadre, vestuario) manteniendo la identidad del sujeto de entrada.
- Fotografia editorial y desnudo artistico: retoque de imagenes ya existentes con control sobre el prompt, usando la entrada como referencia de composicion en lugar de generar desde cero.
- Auditoria legal y de cumplimiento: documentar de forma reproducible que capacidades habilita un adaptador concreto sobre un modelo base, como insumo para politicas internas de uso aceptable.
- Investigacion sobre sesgos y representacion: analizar como un adaptador de bajo rango sesga atributos como complexion, corporalidad o genero en el resultado final del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de edicion, tasas de exito de deteccion por clasificadores) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 563 MB en safetensors, pero la inferencia exige cargar el pipeline completo de Qwen-Image-Edit-2511; el coste de VRAM lo determina el modelo base, no el LoRA.
- La informacion proporcionada no especifica requisitos de VRAM. Como referencia externa no confirmada en esta ficha, el modelo base de la familia Qwen-Image es un transformer de gran tamano (del orden de decenas de miles de millones de parametros), por lo que en precision bf16 se requiere aceleracion profesional (A100 80 GB, H100, L40S) y en formatos cuantizados puede intentarse su ejecucion en GPU de consumo de 24 GB con offloading.
- No cabe esperar ejecucion comoda en GPUs de consumo sin cuantizacion y sin offloading de modulos a CPU o disco.
- Opciones de despliegue: diffusers es la via documentada (`QwenImageEditPlusPipeline` con `load_lora_weights`); tambien existe un Space de Hugging Face mantenido por ScottzillaSystems que carga el adaptador desde un desplegable y no requiere instalacion local.
- No se dispone de datos de latencia ni de throughput. El unico parametro de inferencia indicado en la model card es `num_inference_steps=40`, lo que situa la generacion en un regimen de 40 pasos de denoising por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MCNL v1 (Diggy84002) | LoRA NSFW | Qwen/Qwen-Image-Edit-2511 | no disponible (~563 MB) | no aplica | openrail++ | publico en Hugging Face |
| MCNL v2 (ScottzillaSystems) | LoRA NSFW | no disponible | no disponible | no aplica | no disponible | publico en Hugging Face, referenciado como version actualizada |
| Qwen/Qwen-Image-Edit-2511 | Modelo base de edicion | - | no disponible en esta ficha | no aplica | no disponible en esta ficha | publico en Hugging Face |

No se dispone de informacion suficiente sobre otros adaptadores NSFW comparables ni sobre resultados de rendimiento que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta etiquetado como not-for-all-audiences y su proposito declarado es generar material para adultos. Su uso requiere verificacion de edad y cumplimiento de la normativa aplicable en la jurisdiccion del usuario.
- Licencia OpenRAIL++: incluye restricciones de uso aceptable. No es una licencia permisiva sin condiciones; conviene revisar las clausulas antes de cualquier uso comercial.
- Ausencia total de validacion publica: cero descargas y cero valoraciones en el momento de la ficha. No hay evidencia independiente de calidad, estabilidad ni seguridad del adaptador.
- Dataset y metodo de entrenamiento no documentados: se desconocen los sesgos introducidos, el posible sobreajuste a un estilo o corpus concreto y la calidad de la generalizacion fuera del dominio de entrenamiento.
- Falta de benchmarks: no hay metricas objetivas de fidelidad de edicion, coherencia anatomica ni tasas de deteccion por clasificadores.
- Inconsistencia de procedencia: el repositorio pertenece a Diggy84002, pero el ejemplo de codigo de la model card carga los pesos desde ScottzillaSystems/qwen-image-edit-plus-nsfw-lora. Conviene verificar que el identificador de carga es el correcto antes de integrarlo.
- Anomalia en los metadatos: las fechas de creacion y actualizacion indican 2026-09-16, posterior a la fecha habitual de publicacion. Conviene tratarlas con cautela.
- Artefactos tipicos de los LoRA NSFW: degradacion de manos, rostros y anatomia, perdida de fidelidad respecto a la imagen de entrada y sensibilidad alta a las trigger words.
- Dependencia de palabras clave: sin los tokens de activacion correctos, el adaptador puede no producir el efecto esperado; con ellos, puede filtrarse contenido explicito en prompts que no lo buscaban.
- Riesgo de seguridad al cargar pesos: los ficheros safetensors de terceros y sin auditoria deben cargarse en entornos aislados si no se confia en la procedencia.
- Sin soporte multilingue declarado: cualquier limitacion del codificador de texto del modelo base se hereda integramente.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/Diggy84002/qwen-image-edit-plus-nsfw-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Version actualizada MCNL v2: https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Space de demostracion (ScottzillaSystems Image Editor): https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
- Ruta de pesos citada en el ejemplo de codigo (a verificar): https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo. Todos los enlaces recuperados correspondian a paginas de ayuda de YouTube sin relacion con el adaptador, por lo que no se incluyen.

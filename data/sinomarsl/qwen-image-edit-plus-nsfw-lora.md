# Sinomarsl/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador LoRA publicado en HuggingFace por el usuario Sinomarsl (la model card lo atribuye a la organizacion ScottzillaSystems, lo que supone una discrepancia entre el repositorio y la documentacion del autor). Se trata de un adaptador de bajo rango sobre el pipeline de edicion de imagen Qwen/Qwen-Image-Edit-2511, orientado a habilitar generacion y edicion de contenido para adultos (NSFW) sobre dicha base. No es un modelo autonomo: requiere cargar el modelo base completo y aplicar despues los pesos LoRA.

El adaptador esta construido sobre QwenImageTransformer2DModel, una arquitectura MMDiT (diffusion transformer multimodal) propia de la familia Qwen-Image. El repositorio ocupa aproximadamente 0,6 GB y el fichero de pesos safetensors ronda los 563 MB, lo que es coherente con un adaptador LoRA de rango bajo sobre un transformer de difusion de gran tamano, y no con un modelo entrenado desde cero.

Su relevancia es acotada y muy especifica: se enmarca en el ecosistema de personalizacion de Qwen-Image-Edit mediante LoRAs intercambiables, un flujo que permite cambiar el comportamiento del pipeline sin recargar la base. El repositorio es de creacion muy reciente, con 6 descargas y 1 like en el momento de redactar esta ficha, y no incluye informacion sobre datos de entrenamiento, hiperparametros ni evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (MMDiT) del pipeline Qwen-Image-Edit-2511 |
| Parametros totales | no disponible (adaptador LoRA; fichero de pesos de ~563 MB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors |

Datos adicionales del repositorio: tamano total 0,6 GB, pipeline `image-text-to-image`, libreria `diffusers`, modelo base declarado `Qwen/Qwen-Image-Edit-2511`, creado el 2026-10-06 y actualizado el 2026-10-06.

## Arquitectura y entrenamiento

El adaptador se aplica sobre QwenImageTransformer2DModel, el backbone de difusion de la familia Qwen-Image, que sigue un esquema MMDiT: un transformer que procesa de forma conjunta las representaciones de texto e imagen. El LoRA se inyecta en las capas de ese transformer y se activa mediante `load_lora_weights` con el nombre de adaptador `mcnl-nsfw-v1`, siguiendo la API estandar de diffusers para `QwenImageEditPlusPipeline`.

No hay informacion disponible sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA, el learning rate, la resolucion de entrenamiento ni si se aplicaron tecnicas de regularizacion o curado de datos. Tampoco se documenta ninguna innovacion tecnica mas alla del propio mecanismo LoRA. La model card incluye una lista de palabras de activacion asociadas a conceptos y actos sexuales explicitos, que actuan como disparadores de las capacidades aprendidas; no se especifica cuantas imagenes de ejemplo ni que cobertura tiene cada concepto.

## Capacidades

- Edicion de imagen condicionada por texto sobre el pipeline Qwen-Image-Edit-2511: recibe una imagen de entrada y un prompt, y devuelve una imagen editada.
- Generacion y edicion de contenido explicito para adultos, activada mediante palabras clave concretas documentadas en la model card.
- Interoperabilidad con diffusers: carga y descarga de adaptadores en caliente mediante `load_lora_weights`, `set_adapters` y el parametro `adapter_name`.
- Compatibilidad con el parametro `true_cfg_scale` y `negative_prompt` del pipeline, tal como muestra el ejemplo de uso del autor (40 pasos de inferencia, `true_cfg_scale=4.0`).
- Integracion en la demo de terceros ScottzillaSystems Image Editor, que permite seleccionar el adaptador desde un desplegable.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision adicional, audio o modo de pensamiento: no aplica, es un adaptador de difusion para imagen.
- Capacidades multilingues: no disponibles; no se documenta el idioma de los prompts.

## Casos de uso

- Investigacion sobre personalizacion de modelos de difusion: permite estudiar como un LoRA de bajo rango modifica el comportamiento de un transformer MMDiT sin reentrenar la base, sirviendo como caso de estudio de adaptacion de dominio en pipelines de edicion.
- Auditoria y evaluacion de seguridad de modelos: util para equipos que necesitan reproducir y medir la facilidad con la que un adaptador pequeno desbloquea contenido restringido en un modelo base con filtros, de cara a disenar mitigaciones.
- Edicion de imagenes en flujos artisticos para adultos: estudio de la capacidad del pipeline para modificar atributos concretos de una imagen de entrada manteniendo la identidad de la escena.
- Pruebas de estres de sistemas de moderacion: generar lotes controlados de imagenes para validar clasificadores de contenido y tuberias de filtrado antes de desplegarlas en produccion.
- Comparacion de adaptadores en un mismo pipeline: al convivir con otros LoRAs de Qwen-Image-Edit en la misma demo, permite medir coste de cambio de adaptador (`set_adapters`) y efectos de composicion entre varios.
- Evaluacion de rendimiento de inferencia: sirve para medir cuanto anade un adaptador de ~563 MB al tiempo de carga y al consumo de VRAM de un pipeline de edicion ya desplegado.
- Docencia sobre licencias OpenRAIL: caso practico para explicar como una licencia con restricciones de uso se aplica a adaptadores derivados y que obligaciones arrastra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de edicion, tasas de deteccion por clasificadores de contenido) ni comparaciones numericas con otros adaptadores. Las busquedas web realizadas no devolvieron articulos, papers ni evaluaciones independientes sobre este LoRA.

## Requisitos de hardware

- VRAM para el adaptador: ~563 MB adicionales sobre el espacio que ocupe el modelo base en memoria.
- VRAM total para inferencia: dominada por Qwen/Qwen-Image-Edit-2511. No se dispone de cifras oficiales en la informacion proporcionada; como referencia de orden de magnitud, un transformer de difusion de esta familia en `bfloat16` requiere del orden de 24 GB o mas, y las variantes cuantizadas pueden reducir esa cifra de forma sustancial. Esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que exige una GPU con soporte de bfloat16.
- Cabe en GPU de consumo: no confirmado. Con cuantizacion agresiva podria ser viable en GPU de gama alta con 16-24 GB, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: diffusers con `QwenImageEditPlusPipeline` (unico metodo documentado), ademas de la demo alojada en HuggingFace Spaces por ScottzillaSystems. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El unico dato operativo publicado son 40 pasos de inferencia y `true_cfg_scale=4.0`, valores de referencia del autor pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| MCNL v1 (este, `Sinomarsl/qwen-image-edit-plus-nsfw-lora`) | LoRA NSFW | Qwen-Image-Edit-2511 | repo 0,6 GB / pesos ~563 MB | OpenRAIL++ | HuggingFace, 6 descargas, 1 like | no disponible |
| MCNL v2 (`ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2`) | LoRA NSFW | Qwen-Image-Edit-2511 | no disponible | no disponible | HuggingFace | no disponible |
| Qwen-Image-Edit-2511 (`Qwen/Qwen-Image-Edit-2511`) | Modelo base de edicion de imagen | no aplica | no disponible | no disponible en la informacion recogida | HuggingFace | no disponible |

No se dispone de datos publicados que permitan comparar rendimiento, contexto o calidad de edicion frente a alternativas equivalentes de la misma categoria. No se han identificado en la busqueda otros LoRAs NSFW comparables con metricas publicadas.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences` y genera material sexual explicito. No debe desplegarse en entornos accesibles a menores ni sin control de edad.
- Riesgo legal y de cumplimiento: la generacion de imagenes sexuales realistas puede entrar en conflicto con normativas de distintos paises y con las politicas de las plataformas de despliegue. Requiere revision legal previa en cualquier uso profesional.
- Riesgo de deepfakes: un adaptador de edicion de imagen capaz de alterar contenido intimo puede emplearse para crear material no consentido. Es la advertencia mas relevante para produccion.
- Licencia OpenRAIL++: incluye restricciones de uso en forma de clausulas de comportamiento. Es imprescindible revisar las condiciones exactas antes de cualquier uso comercial, ya que las licencias OpenRAIL no son equivalentes a una licencia permisiva.
- Falta de documentacion de entrenamiento: no se publican datos, composicion del dataset ni procesos de curado, por lo que no es posible evaluar sesgos ni procedencia del material de entrenamiento.
- Alucinacion y artefactos: al ser un LoRA de difusion, puede producir anatomias incorrectas, incoherencias entre prompt e imagen y degradacion de la fidelidad respecto a la imagen original de entrada. No hay evaluacion cuantitativa publicada.
- Ambiguedad de autoria: el ID del repositorio (`Sinomarsl/...`) no coincide con el de la model card (`ScottzillaSystems/...`), lo que dificulta la trazabilidad y el soporte.
- Adopcion muy baja y sin mantenimiento demostrado: 6 descargas y 1 like, con creacion y ultima actualizacion el mismo dia, sin historial de versiones.
- Dependencia estricta del modelo base: funciona unicamente con Qwen-Image-Edit-2511 y la API de diffusers documentada; cambios en el pipeline base pueden romper la compatibilidad.
- Idiomas y contexto: sin datos de idiomas soportados y sin informacion sobre limites de longitud de prompt.
- Ausencia de benchmarks: no hay metricas que permitan estimar la calidad de edicion ni comparar con alternativas, lo que impide justificar su uso en produccion con criterios objetivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sinomarsl/qwen-image-edit-plus-nsfw-lora
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Version MCNL v2: https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Demo Image Editor de ScottzillaSystems: https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
- Libreria diffusers (requerida para el uso programatico): https://github.com/huggingface/diffusers
- Papers, blogs o evaluaciones independientes: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo, su arquitectura o su entrenamiento.

# mobbrain/hdoub3

## Resumen

`mobbrain/hdoub3` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre la variante Krea 2 Raw y presentado por el autor sobre Krea 2 Turbo. Lo publica el usuario `mobbrain` en Hugging Face bajo licencia Apache 2.0, con un unico token de activacion (`hdoub`) y un peso de repositorio de aproximadamente 0,6 GB, coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo base es `krea/Krea-2-Raw`, un generador texto-a-imagen de la familia Krea 2, y el adaptador se carga mediante `Krea2Pipeline` de la libreria diffusers. El pipeline declarado es `text-to-image` y la integracion esta pensada para ejecutarse con 8 pasos de inferencia y `guidance_scale=0.0`, es decir, en modo Turbo sin clasificador de guia.

La relevancia tecnica del artefacto es limitada como pieza de investigacion: se trata de un LoRA de concepto con cero descargas y cero likes en el momento de la consulta, sin metricas de evaluacion ni documentacion sobre el dataset de entrenamiento. Ademas, la model card incluye un prompt de ejemplo de contenido sexual explicito en el que se describe a una menor de edad, lo que constituye un problema grave de seguridad y de cumplimiento normativo, y hace desaconsejable cualquier uso o redistribucion del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2; no se detalla la arquitectura interna del modelo base |
| Parametros totales | no disponible (peso del repositorio: 0,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; el repositorio usa la libreria diffusers y la carga se realiza con `load_lora_weights`, lo que implica pesos compatibles con diffusers (habitualmente safetensors) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la tecnica DreamBooth sobre el modelo base `krea/Krea-2-Raw`. La model card indica que el adaptador se muestra sobre `krea/Krea-2-Turbo`, pero no especifica si el entrenamiento se realizo sobre Raw o sobre Turbo. No se publican datos sobre el numero de imagenes del dataset, el numero de pasos de entrenamiento, el rango del adaptador, la tasa de aprendizaje ni la composicion de los datos.

No hay informacion sobre innovaciones tecnicas propias del adaptador, mas alla del uso de un token de activacion unico (`hdoub`) para invocar el concepto aprendido. La inferencia documentada emplea `num_inference_steps=8` y `guidance_scale=0.0`, lo que corresponde al modo de muestreo rapido de la variante Turbo del modelo base. No se documenta decodificacion especulativa, atencion lineal ni ninguna otra optimizacion adicional.

## Capacidades

- Generacion de imagenes fotorrealistas condicionada por texto, mediante el modelo base Krea 2 y el adaptador LoRA.
- Inyeccion de un concepto personalizado a traves del token `hdoub`, segun el esquema DreamBooth.
- Inferencia rapida en 8 pasos con `guidance_scale=0.0` sobre Krea 2 Turbo.
- Integracion con la libreria diffusers mediante `Krea2Pipeline` y `load_lora_weights`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento; son capacidades no aplicables a un modelo texto-a-imagen.
- Capacidades multilingues: no disponibles; la model card solo proporciona prompts en ingles.

## Casos de uso

- Experimentacion con personalizacion de conceptos en diffusers: el adaptador puede cargarse sobre `krea/Krea-2-Turbo` para estudiar como un LoRA DreamBooth modifica la salida del modelo base con un unico token de activacion.
- Investigacion sobre seguridad de modelos generativos: el artefacto sirve como caso de estudio de model cards que incluyen prompts inapropiados y de la necesidad de filtros de moderacion en repositorios de adaptadores.
- Pruebas de pipelines de inferencia rapida: su uso con 8 pasos y `guidance_scale=0.0` permite medir latencia y calidad en configuraciones de bajo coste computacional sobre el modelo Turbo.
- Auditoria de licencias y procedencia: al declarar licencia Apache 2.0 y un modelo base concreto, puede emplearse para verificar la trazabilidad de adaptadores en catalogos internos.
- Docencia sobre LoRA y DreamBooth: como ejemplo minimo de estructura de repositorio (README, token de activacion, snippet de carga) para explicar el formato de un adaptador en diffusers.
- Evaluacion de riesgos en despliegues: util para disenar politicas de bloqueo de adaptadores con contenido sexual explicito o que describan a menores, antes de integrar modelos de imagen en productos.

No se recomienda su uso para generacion de contenido en produccion, atencion al cliente, generacion de codigo ni ninguna otra aplicacion final, dado el contenido de su model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Krea 2 Turbo, cuyas especificaciones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen en este formato).
- Latencia y throughput: no disponibles; la unica referencia es la configuracion de 8 pasos de inferencia con `guidance_scale=0.0`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobbrain/hdoub3 | LoRA sobre Krea 2 | no disponible (repo de 0,6 GB) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| krea/Krea-2-Turbo | Modelo base texto-a-imagen (variante rapida) | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card incluye un prompt de ejemplo de contenido sexual explicito que describe a una menor de edad. Esto constituye una violacion grave de las politicas de contenido de las plataformas de modelos y puede ser constitutivo de delito en muchas jurisdicciones; el artefacto no debe utilizarse, redistribuirse ni desplegarse.
- El autor no documenta el dataset de entrenamiento, por lo que se desconoce si el adaptador ha aprendido sesgos, rostros de personas reales o material ilicito.
- Riesgo de alucinacion y de artefactos visuales propio de los modelos de difusion, agravado por la falta de evaluacion publicada.
- No hay informacion sobre sesgos demograficos, de genero o culturales del adaptador ni del modelo base.
- La licencia declarada es Apache 2.0, pero la ausencia de documentacion sobre el origen de los datos de entrenamiento impide confirmar la legalidad de su uso comercial.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- El repositorio se creo y actualizo en noviembre de 2026 segun los metadatos, sin historial de versiones documentado.
- No se especifican requisitos de hardware, lo que dificulta planificar su despliegue incluso en entornos de investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/mobbrain/hdoub3
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo del modelo base: https://huggingface.co/krea/Krea-2-Turbo

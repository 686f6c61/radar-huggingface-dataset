# abbuibuibui/RemiAyasaki-Lora

## Resumen

RemiAyasaki-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado específicamente sobre el checkpoint waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y reproduce a Remi Ayasaki (绫崎蕾美), un personaje secundario de la obra Horimiya. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango (LoRA) que se aplica sobre un modelo base de generacion de imagenes para especializarlo en la identidad visual de ese personaje.

El repositorio incluye siete pesos correspondientes a las epochs E1 a E7 del entrenamiento, con recomendacion explicita de usar E6 a fuerza 0.8 como configuracion por defecto. El autor documenta un proceso de evaluacion comparativa entre epochs y fuerzas (0.4, 0.6, 0.8, 1.0) sobre diez escenas, con imagenes de muestra sin retocar generadas en ComfyUI. Esta documentacion detallada de seleccion de epoch es poco habitual en LoRAs de personaje y constituye el principal valor tecnico del repositorio.

El modelo esta pensado para flujos de generacion de imagenes anime con tematica Horimiya, no para tareas de NLP. Su relevancia es acotada: sirve a quienes necesiten consistencia de personaje en pipelines de Stable Diffusion XL con base Illustrious o NoobAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious |
| Parametros totales | no disponible (cada archivo pesa 456.495.868 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion) |
| Tipos de cuantizacion | no disponible; pesos en safetensors de precision completa del adaptador |
| Idiomas soportados | en, zh (etiquetas de la model card; no aplica a generacion de texto) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Modelo base | waiIllustriousSDXL-v17 |
| Tamano del repositorio | 3.2 GB |
| Trigger words | `remi_ayasaki`, `remi_ayasaki_winter_uniform`, `remi_ayasaki_winter_coat_scarf`, `remi_ayasaki_cooking_apron`, `remi_ayasaki_red_tracksuit` |
| Fuerza recomendada | 0.8 (0.6 para abrigo blanco) |

## Arquitectura y entrenamiento

Se trata de un LoRA de personaje, es decir, un conjunto de matrices de bajo rango inyectadas en las capas de atencion y proyeccion de un UNet SDXL. El modelo base es waiIllustriousSDXL v17, un checkpoint de la familia Illustrious (derivada de SDXL orientada a anime). El adaptador no modifica la arquitectura del modelo base; se carga como peso adicional en diffusers o ComfyUI.

El entrenamiento se realizo sobre el dataset abbuibuibui/RemiAyasaki-Dataset, con captions que usan `keep_tokens = 2`. Las leyendas de entrenamiento no incluyen color de pelo ni de ojos, de modo que la identidad (twintails, pelo rosa largo, ojos rojos) queda asociada a la trigger word `remi_ayasaki` y no a descriptores textuales. Se generaron siete checkpoints (E1 a E7); el autor realizo una seleccion empirica comparando rostro frontal, cuerpo completo con uniforme de invierno y cuerpo completo con abrigo, primero a fuerza 0.8 en todas las epochs y despues con una matriz de 10 escenas por 4 fuerzas para E5, E6 y E7. No se documentan hiperparametros de entrenamiento (learning rate, numero de pasos, resolucion, optimizer) ni el numero de imagenes del dataset en la informacion disponible.

## Capacidades

- Generacion de imagenes anime del personaje Remi Ayasaki con identidad consistente en rostro frontal, tres cuartos y perfil.
- Control de vestuario mediante tokens especificos: uniforme de invierno, abrigo con bufanda, delantal de cocina y chandal rojo.
- Composicion de escenas: retrato, cuerpo completo, calle nocturna, poses sentadas.
- Integracion con prompts de calidad propios de Illustrious (`masterpiece, best quality, very aesthetic, absurdres, anime screencap`).
- Compatibilidad con merges de Illustrious y NoobAI, segun indica el autor.
- Ajuste fino de identidad frente a vestuario mediante la fuerza del LoRA (0.4 a 1.0).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un adaptador de difusion.

## Casos de uso

- Ilustracion de fan art de Horimiya: cargar E6 a 0.8 sobre waiIllustriousSDXL v17 con la trigger word `remi_ayasaki` para obtener retratos consistentes del personaje en distintas poses y angulos.
- Generacion de tiras comicas o doujinshi: mantener la identidad del personaje entre viñetas usando el mismo checkpoint y fuerza, cambiando solo la pose y el escenario en el prompt.
- Creacion de assets para proyectos derivados no comerciales: el LoRA permite generar variaciones de vestuario (uniforme, abrigo, delantal, chandal) con tokens dedicados, util para fichas de personaje o referencias visuales.
- Pruebas de consistencia de personaje en pipelines de difusion: el repositorio documenta una metodologia de evaluacion por epochs y fuerzas que sirve como plantilla para validar otros LoRAs de personaje.
- Escenas narrativas de calle nocturna: el autor verifica que E6 a 0.8 no anade bolsa escolar no deseada en escenas nocturnas, lo que lo hace adecuado para composiciones con control de elementos.
- Experimentacion con merges de Illustrious/NoobAI: el LoRA puede combinarse con otros checkpoints de la misma familia para estudiar deriva de estilo, aunque el autor solo garantiza el comportamiento sobre waiIllustriousSDXL v17.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor presenta una evaluacion cualitativa por matrices de epochs y fuerzas:

| Candidato | Observacion | Decision |
|---|---|---|
| E1 | Rostro ya con pelo rosa y ojos rojos; el uniforme de invierno anade un mechon tipo cuerno y el abrigo vira a azul claro | Alternativa temprana |
| E5 | Identidad estable; a 0.8 la calle nocturna anade bolsa escolar y la pose sentada cruza los brazos | Alternativa |
| E6 | Rostro, tres cuartos y perfil consistentes a 0.6-0.8; uniforme limpio; sin bolsa extra en calle nocturna | Recomendado a 0.8 |
| E7 | Muy cercano a E6; 1.0 no aporta mejora clara | Alternativa de epoch final |

## Requisitos de hardware

- VRAM estimada: el LoRA en si ocupa unos 456 MB por archivo, pero requiere cargar el checkpoint base SDXL/Illustrious completo; en FP16 el UNet de SDXL ronda los 6-7 GB, por lo que la inferencia tipica necesita entre 8 y 12 GB de VRAM segun resolucion y precision.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generacion a 832x1216 con margen; el autor menciona haber generado las imagenes de evaluacion en una DGX con ComfyUI.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas (RTX 3060 Ti, 3070, 4060 Ti, 4070) usando precision FP16 y atencion eficiente; en 6 GB puede requerir offloading.
- Opciones de despliegue: ComfyUI (configuracion usada por el autor), Automatic1111/Forge, diffusers con `load_lora_weights`, y pipelines SDXL con `--medvram` o `--lowvram`.
- Latencia y throughput: no disponible; depende del modelo base, la GPU y los pasos. El autor usa Euler a, 28 pasos, CFG 4.5, CLIP skip 2 a 832x1216.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RemiAyasaki-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | 832x1216 recomendado | creativeml-openrail-m | Hugging Face, 61 descargas |
| LoRAs de personaje genericos en Illustrious | LoRA de personaje | Illustrious / NoobAI | variable | variable (muchos creativeml-openrail-m) | Civitai, Hugging Face |
| LoRAs de personaje en Pony Diffusion | LoRA de personaje | Pony Diffusion V6 XL | variable | variable | Civitai, Hugging Face |

No se dispone de datos cuantitativos para comparar rendimiento con alternativas concretas; la comparativa se limita a tipo de adaptador, modelo base y licencia.

## Limitaciones y advertencias

- Es un producto derivado no oficial: los derechos del personaje y de la obra Horimiya pertenecen a sus titulares; el autor lo declara fan-made.
- La licencia creativeml-openrail-m impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar sus terminos antes de cualquier uso en produccion.
- Deriva de vestuario dependiente de la fuerza: el abrigo con bufanda es blanco con bufanda roja a 0.4-0.6, pero a 0.8-1.0 vira a marron y la bufanda palidece.
- Fuga de identidad sin trigger: a fuerza 0.4 sin la palabra `remi_ayasaki` ya aparecen pelo rosa, ojos rojos y el rostro del personaje.
- A 1.0 la ropa empieza a mezclarse y la identidad se degrada; no se recomienda superar 0.8 para uso general.
- Sin token de vestuario, a 0.8 el modelo tiende a jersey rosa casual en lugar de forzar el uniforme escolar.
- El comportamiento solo esta validado sobre waiIllustriousSDXL v17 y merges Illustrious/NoobAI; en otros checkpoints SDXL la calidad no esta garantizada.
- No se documentan sesgos, tasa de alucinacion ni metricas de fidelidad cuantitativas; la evaluacion es cualitativa y realizada por el propio autor.
- El dataset de entrenamiento no se detalla en numero de imagenes ni composicion en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/RemiAyasaki-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/RemiAyasaki-Dataset
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- Modelo base waiIllustriousSDXL v17: no disponible como enlace directo en la informacion proporcionada
- Repositorio diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI

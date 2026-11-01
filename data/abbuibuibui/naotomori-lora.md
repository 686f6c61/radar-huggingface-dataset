# abbuibuibui/NaoTomori-Lora

## Resumen

NaoTomori-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado especificamente sobre el checkpoint waiIllustriousSDXL v17 (habitualmente guardado como `waiIllustriousSDXL_v170`). Lo desarrolla el usuario abbuibuibui y reproduce a Nao Tomori, personaje de la serie de anime *Charlotte*. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se carga junto al modelo base para condicionar la generacion de imagenes hacia la identidad visual del personaje.

El repositorio incluye los pesos completos de las siete epocas formales (E1-E7) en formato safetensors, con un total de 1,6 GB. La model card recomienda E6 (`nao_tomori_rE6S1152-000006.safetensors`) como opcion por defecto a una fuerza de 0,8, tras una evaluacion comparativa de 120 salidas directas (10 escenas x 4 fuerzas para E5, E6 y E7). El entrenamiento se realizo con 108 imagenes curadas y sus correspondientes ficheros de caption.

Su relevancia es acotada y practica: sirve para quien necesite generar imagenes consistentes de este personaje concreto dentro del ecosistema Illustrious/NoobAI, con tokens de activacion separados para identidad y para cada variante de vestuario. Es un derivado hecho por fans, no un producto oficial, y los derechos del personaje y de la obra original siguen en manos de sus titulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet y text encoders de SDXL |
| Parametros totales | no disponible (rango LoRA 32, alpha 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Modelo base | waiIllustriousSDXL v17 |
| Tamano del repositorio | 1,6 GB |
| Epocas incluidas | E1 a E7 (7 ficheros) |
| Resolucion de entrenamiento | buckets de 1024 |
| Descargas | 33 |
| Likes | 0 |

## Arquitectura y entrenamiento

Se trata de un LoRA de rango 32 y alpha 16 aplicado tanto al UNet como a los text encoders del modelo base SDXL (variante Illustrious). El entrenamiento uso AdamW8bit en precision bf16, con batch 1, latentes cacheados y atencion sdpa. Se desactivaron el flip y la aumentacion de color. El dataset consta de 108 imagenes curadas con sus ficheros `.txt` de caption, en los que se aplico `keep_tokens = 2` y los captions comienzan por `nao_tomori, <outfit>`. La distribucion por vestuario es: Winter 40, Summer 25, PinkTank 15, Tracksuit 15, NavyJumper 8 y PinkHoodie 5.

El calculo de pasos indicado en la model card es 108 imagenes x repeat 2 x 7 epocas, aproximadamente 1512 pasos de optimizador, con el entrenamiento reanudado a mitad de ejecucion y conservando las epocas formales E1-E7. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un adaptador de difusion. La innovacion practica del repositorio no esta en la arquitectura, sino en el proceso de seleccion: cribado de las siete epocas a fuerza 0,8 y matriz de pesos de 10 escenas x 4 fuerzas para E5, E6 y E7, con el objetivo de fijar un valor por defecto reproducible.

## Capacidades

- Generacion de imagenes del personaje Nao Tomori condicionada por el token de identidad `nao_tomori`.
- Control de vestuario mediante tokens especificos: `nao_tomori_winter_school_uniform`, `nao_tomori_summer_school_uniform`, `nao_tomori_navy_jumper_uniform`, `nao_tomori_pink_hoodie`, `nao_tomori_pink_tank_top` y `nao_tomori_tracksuit`.
- Reproduccion de rasgos de identidad descritos en la model card: pelo rubio, pelo largo, twintails y ojos azules.
- Funcionamiento con o sin token de vestuario (la evaluacion incluye una escena "no outfit token") y con o sin trigger (escena "no trigger").
- Compatibilidad declarada con waiIllustriousSDXL v17 y con la familia Illustrious / NoobAI.
- Ajuste fino de la intensidad del efecto mediante la fuerza del LoRA, con 0,8 como valor recomendado y 0,6 ya suficiente para identificar al personaje.
- Soporte de prompts en ingles y chino (idiomas declarados en la model card).
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: no es un modelo de lenguaje.

## Casos de uso

- Ilustracion de fan art consistente: cargar E6 a fuerza 0,8 sobre waiIllustriousSDXL v17 y usar el prompt de ejemplo de la model card para obtener retratos del personaje con identidad estable entre generaciones.
- Series de imagenes con vestuario controlado: emplear los tokens de outfit para producir un conjunto coherente de la misma escena en uniforme de invierno, uniforme de verano, chandal o sudadera rosa, util para fichas de personaje o galerias tematicas.
- Prototipado rapido de composiciones: con Euler a, 28 pasos, CFG 4,5, CLIP skip 2 y 832x1216 se obtienen resultados directos sin Hires ni ADetailer, lo que agiliza la iteracion sobre encuadres (primer plano, tres cuartos, perfil, sentado).
- Escenas nocturnas y fondos complejos: la evaluacion incluye una escena "complex night" y una "night street" que sirven como referencia de como se comporta el LoRA fuera de fondos simples.
- Comparacion y ajuste de fuerza: al conservar E1-E7, un flujo de trabajo puede reproducir la matriz de 10 escenas x 4 fuerzas y elegir una epoca alternativa (E5 como candidato de matriz, solido entre 0,6 y 0,8) si E6 no encaja con el estilo buscado.
- Integracion en pipelines de difusion via diffusers: el repositorio declara `library_name: diffusers`, de modo que puede cargarse como adaptador LoRA en un script de generacion por lotes.
- Referencia para entrenamiento de otros personajes: la estructura de dataset, captions con `keep_tokens = 2`, configuracion de rango 32/alpha 16 y el proceso de cribado por epocas sirven como plantilla metodologica para adaptadores similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card aporta unicamente una evaluacion cualitativa comparativa entre epocas:

| Candidato | Resultado observado | Decision |
|---|---|---|
| E5 | Identidad utilizable; fidelidad de accesorios y uniforme algo mas blanda que E6 | Alternativa |
| E6 | Mayor consistencia de cara, vestuario y escenas nocturnas entre 0,6 y 0,8 | Recomendada por defecto a 0,8 |
| E7 | Cercana a E6; sin ganancia estable a 1,0 | Alternativa archivada |

El cribado cubrio las siete epocas a fuerza 0,8 (retrato frontal, outfit principal completo y outfit alternativo completo) y una matriz de pesos de 10 escenas x 4 fuerzas (0,4 / 0,6 / 0,8 / 1,0) para E5, E6 y E7, con 120 salidas directas. No se proporcionan metricas objetivas como FID, CLIP score ni similitud facial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del checkpoint base SDXL cargado, no del LoRA. El adaptador anade una sobrecarga pequena sobre el modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada. Al operar sobre SDXL, las necesidades son las del modelo base (waiIllustriousSDXL v17), no las del LoRA.
- Cabe en GPU de consumo: no confirmado en la model card; la viabilidad depende del checkpoint SDXL y de la configuracion de offload empleada.
- Opciones de despliegue: la libreria declarada es `diffusers`, por lo que la carga como adaptador LoRA en pipelines de diffusers es la via documentada. Otras opciones (ComfyUI, Automatic1111, Forge) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. Los parametros de muestreo de referencia son Euler a, 28 pasos, CFG 4,5, CLIP skip 2 y resolucion 832x1216, con Hires y ADetailer desactivados.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros LoRA de personaje directamente comparables (mismo personaje o mismo modelo base) con datos de parametros, contexto o rendimiento. La comparacion se limita a las epocas del propio repositorio:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NaoTomori-Lora E6 (recomendada) | rango 32 / alpha 16 | no aplica | Mejor equilibrio cualitativo a 0,6-0,8 | creativeml-openrail-m | HuggingFace y ModelScope |
| NaoTomori-Lora E5 | rango 32 / alpha 16 | no aplica | Identidad utilizable, algo mas blanda | creativeml-openrail-m | Incluida en el mismo repo |
| NaoTomori-Lora E7 | rango 32 / alpha 16 | no aplica | Cercana a E6, sin ganancia a 1,0 | creativeml-openrail-m | Incluida en el mismo repo |
| Otros LoRA de personaje sobre Illustrious | no disponible | no aplica | no disponible | variable | no disponible |

## Limitaciones y advertencias

- Es un derivado hecho por fans: la model card indica explicitamente que no es un producto oficial y que los derechos del personaje y de la obra original pertenecen a sus titulares.
- Licencia creativeml-openrail-m: conviene revisar sus terminos antes de cualquier uso comercial; la model card no detalla condiciones adicionales.
- Dependencia estricta del modelo base: esta entrenado sobre waiIllustriousSDXL v17 y la calidad puede degradarse con otros checkpoints, aunque se declara compatibilidad con la familia Illustrious / NoobAI.
- A fuerza 1,0 el resultado puede "sobrecocerse" (overcook) segun la model card; el rango seguro recomendado es 0,6-0,8.
- El prompt negativo de referencia incluye supresion explicita de otros colores de pelo y ojos (marron, negro, rosa, rojo, verde, morado) y de elementos como cuernos, lo que revela sensibilidad a confusiones de identidad si no se usa.
- Dataset pequeno (108 imagenes) y desequilibrado por vestuario: Winter aporta 40 imagenes frente a las 5 de PinkHoodie, lo que puede traducirse en menor fidelidad en las variantes con menos datos.
- Solo se declaran los idiomas en y zh; no hay evidencia de soporte para prompts en castellano.
- No se han publicado metricas objetivas de rendimiento ni evaluaciones de sesgo; el juicio de calidad es cualitativo y realizado por el propio autor.
- El repositorio tiene un volumen de adopcion muy bajo (33 descargas, 0 likes), por lo que no existe validacion independiente de la comunidad.
- No apto para tareas de texto, codigo, razonamiento o agentes: es exclusivamente un adaptador de generacion de imagenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/NaoTomori-Lora
- Dataset en HuggingFace: https://huggingface.co/datasets/abbuibuibui/NaoTomori-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/NaoTomori-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/NaoTomori-Dataset (URL truncada en la informacion disponible)
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `./README_zh.md` (dentro del repositorio)
- SHA-256 de E6: `8547D8D3C1E028779922E80EF43303C1F401A5A440B3DB0EC5480619848E6B2D`

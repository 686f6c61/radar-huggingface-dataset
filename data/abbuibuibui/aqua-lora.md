# abbuibuibui/Aqua-Lora

## Resumen

Aqua-Lora es un LoRA de personaje no oficial para Aqua, el personaje de la serie KonoSuba, publicado por el usuario abbuibuibui. No es un modelo completo ni un modelo de lenguaje, sino un adaptador de bajo rango (LoRA) que se aplica sobre un checkpoint de difusión de imágenes de la familia SDXL, concretamente sobre waiIllustriousSDXL v17 (habitualmente guardado como waiIllustriousSDXL_v170), dentro de la estirpe Illustrious/NoobAI.

El adaptador resuelve el problema de generar representaciones visuales consistentes del personaje (identidad, peinado, atuendos) sin necesidad de entrenar un modelo completo. Se distribuye junto con su dataset de entrenamiento y con una evaluacion horizontal publicada que compara ocho checkpoints unicos en diez escenas fijas y cuatro niveles de fuerza, con 120 imagenes generadas como base del analisis.

El repositorio ocupa 1,8 GB e incluye todos los ficheros de epoca unicos de dos rondas de reanudacion. En el momento de la consulta el modelo registra 0 descargas y 0 likes, por lo que se trata de un lanzamiento reciente y con poca traccion. La relevancia practica se limita al nicho de generacion de personajes de anime sobre Illustrious/NoobAI, donde la evaluacion comparativa y las palabras clave de activacion documentadas lo hacen directamente utilizable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre SDXL; familia Illustrious/NoobAI |
| Parametros totales | no disponible (el fichero individual no se detalla; repo de 1,8 GB con 8 checkpoints) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes; no procesa texto en contexto largo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | creativeml-openrail-m (CreativeML Open RAIL-M) |
| Formato de pesos | safetensors |
| Modelo base | waiIllustriousSDXL-v17 (waiIllustriousSDXL_v170) |
| Dataset de entrenamiento | abbuibuibui/Aqua-Dataset |
| Tamano del repositorio | 1,8 GB |
| Ficheros de checkpoint | 8 unicos (R1E1-R1E4, R1Final, R2E5, R2E6, R2Final) |
| Checkpoint recomendado | R2E6 (`aqua_rE5S846-000006.safetensors`) a fuerza 0,8 |
| SHA-256 de R2E6 | `671e6a98c5e2e179d958bb516a1606fbf4968c992cfabf15353a2b3eddeab899` |

## Arquitectura y entrenamiento

El modelo es un LoRA aplicado sobre SDXL, es decir, un conjunto de matrices de bajo rango que se inyecta en el checkpoint base para desplazar sus pesos hacia la identidad del personaje. El base pertenece a la estirpe Illustrious/NoobAI, una variante de SDXL orientada a la generacion de ilustracion anime. El autor recomienda usarlo con waiIllustriousSDXL v17 o con cualquier modelo de la familia Illustrious/NoobAI.

El entrenamiento se realizo sobre el dataset abbuibuibui/Aqua-Dataset con `keep_tokens = 2`, lo que situa los tokens de disparo en las dos primeras posiciones de cada pie de foto. Se conservan todos los ficheros de epoca unicos de dos rondas de reanudacion, ya que los finales sin numerar no son duplicados SHA-256 de las epocas numeradas adyacentes. No se documentan en la informacion disponible el numero de pasos totales, el tamano exacto del dataset ni detalles de optimizador o learning rate. El autor publica una evaluacion comparativa que combina una criba inicial de los ocho checkpoints a fuerza 0,8 sobre retrato frontal, cuerpo completo con atuendo estandar y cuerpo completo con vestido blanco, seguida de una segunda ronda con 120 imagenes generadas (10 escenas fijas por 3 candidatos por 4 fuerzas).

## Capacidades

- Generacion de imagenes de personaje: reproduce de forma consistente la identidad de Aqua (pelo largo azul, ojos azules, bobbles y lazo grande) sobre modelos Illustrious/NoobAI.
- Tokens de identidad y de atuendo separados: `aqua_konosuba` para la identidad, mas `aqua_konosuba_standard_outfit`, `aqua_konosuba_white_dress`, `aqua_konosuba_travel_cloak` y `aqua_konosuba_sleepwear` para variantes de vestuario.
- Control de fuerza del LoRA: funciona desde 0,4 (ya identifica al personaje) hasta 1,0 (puede recortar el cuello en primeros planos); el valor recomendado es 0,8.
- Integracion con el ecosistema de difusion: formato safetensors compatible con diffusers, ComfyUI y UIs tipo Automatic1111/Forge.
- Compatibilidad con ADetailer: el autor documenta como reforzar el prompt de cara cuando se activa el detallado facial automatico.
- Prompts negativos de referencia incluidos para evitar rasgos erroneos (pelo rubio, rosa, rojo o castano; ojos verdes, morados o negros; multiples chicas).
- Ajustes de muestreo documentados: Euler a, 28 pasos, CFG 4,5, CLIP skip 2, resolucion 832x1216.

## Casos de uso

- Ilustracion de fan art: generar imagenes del personaje con identidad estable en retratos y cuerpo completo, apoyandose en el checkpoint R2E6 a 0,8 y en los ajustes de muestreo recomendados por el autor.
- Creacion de variantes de vestuario: usar los tokens de atuendo (`standard_outfit`, `white_dress`, `travel_cloak`, `sleepwear`) para producir al personaje en distintas indumentarias dentro de un mismo estilo.
- Storyboards y guiones visuales: generar escenas coherentes del personaje (interior, calle nocturna, fondo simple) para previsualizar secuencias narrativas antes de ilustrarlas a mano.
- Avatares y material para redes: producir retratos consistentes del personaje recortables como avatar, reutilizando semillas y el mismo checkpoint para mantener la identidad entre renders.
- Integracion en pipelines de difusion automatizados: al ser un safetensors compatible con diffusers, puede cargarse mediante codigo en flujos de generacion por lotes sobre un base Illustrious/NoobAI.
- Referencia para entrenamiento de LoRA de personaje: el repositorio sirve como caso de estudio, ya que publica el dataset, los tokens, los ajustes y una evaluacion horizontal reproducible con semillas fijas.
- Composicion de escenas con ControlNet/ADetailer: al ser un LoRA estandar de SDXL, se puede combinar con herramientas de control de pose o detallado facial, siguiendo la recomendacion del autor para la cara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos estandar (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, ya que se trata de un modelo de generacion de imagenes. El autor si publica una evaluacion horizontal cualitativa basada en comparacion visual directa. Se resume a continuacion.

| Fase de evaluacion | Metodologia | Resultado |
|---|---|---|
| Criba inicial (ronda 1) | 8 checkpoints a fuerza 0,8, semillas fijas, en retrato frontal, cuerpo completo estandar y vestido blanco | Los R1 tempranos fallaban el vestido blanco o la cara; solo R2E5, R2E6 y R1E4 avanzaron |
| Ronda 3 | 3 candidatos x 4 fuerzas (0,4 / 0,6 / 0,8 / 1,0) x 10 escenas fijas = 120 imagenes directas, sin retoque | R2E6 como opcion por defecto a 0,8 por mayor consistencia |
| Comparativa R2E5 | Casi identico a R2E6 | Alternativa |
| Comparativa R1E4 | Atuendo estandar utilizable; vestido blanco aun verdoso a 0,8 | Alternativa archivada de ronda temprana |

## Requisitos de hardware

Nota: las cifras de VRAM son valores orientativos de la familia SDXL/Illustrious, no especificados por el autor en la informacion disponible.

- El LoRA en si es ligero: el repositorio completo ocupa 1,8 GB repartido en 8 ficheros, por lo que cada checkpoint individual ronda unas decenas o pocos cientos de MB.
- El coste real de VRAM lo determina el checkpoint base SDXL, no el LoRA.
- Inferencia en fp16 con pipeline completo: aproximadamente 10-12 GB de VRAM.
- Con offloading del codificador de texto y el VAE: aproximadamente 6-8 GB.
- Con cuantizacion (fp8 o GGUF mediante ComfyUI): aproximadamente 4-6 GB.
- GPU consumer compatibles: RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090 (con holgura). Tarjetas de 8 GB funcionan con offloading.
- GPU profesionales: A100, H100 y similares para generacion por lotes a alta resolucion.
- Opciones de despliegue: diffusers, ComfyUI, Automatic1111/Forge y otras UIs compatibles con safetensors SDXL.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento de modelos comparables en la informacion proporcionada. A continuacion se comparan los candidatos internos del propio repositorio, que es lo unico documentado.

| Candidato | Fichero | Observacion del autor |
|---|---|---|
| R2E6 (recomendado) | `aqua_rE5S846-000006.safetensors` | Mejor equilibrio entre retrato, vestido estandar, vestido blanco, sentada y calle nocturna a 0,8 |
| R2E5 | `aqua_rE5S846-000005.safetensors` | Casi identico a R2E6; alternativa |
| R1E4 | `aqua-000004.safetensors` | Atuendo estandar utilizable; vestido blanco verdoso a 0,8; alternativa de ronda temprana |
| R2Final | `aqua_rE5S846.safetensors` | Practicamente igual a R2E6; SHA distinto |
| R1Final | `aqua.safetensors` | Bobbles mas debiles en primeros planos; alternativa |
| R1E1-R1E3 | `aqua-000001/2/3.safetensors` | Fallos: vestido blanco verdoso, retrato enfadado, pelo sucio en la cara |

Frente a otros LoRA de personaje de la familia Illustrious/NoobAI: datos no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo de identidad y vestuario: a fuerza 0,8 el vestido blanco puede salir con tono menta, y algunos checkpoints tempranos fallan directamente la cara o el vestido.
- Deriva de color: los prompts negativos de referencia incluyen exclusiones de pelo rubio, rosa, rojo o castano y de ojos verdes, morados o negros, lo que indica que el modelo puede desviarse hacia esos rasgos.
- Fuerza sensible: a 0,4 la identidad ya aparece pero el vestido blanco sigue menta; a 1,0 suele recortar el cuello en primeros planos. El rango util esta en torno a 0,8.
- Dependencia del modelo base: el LoRA esta pensado para waiIllustriousSDXL v17 o familia Illustrious/NoobAI; su comportamiento con otros checkpoints SDXL no esta documentado.
- Idioma: los idiomas declarados son ingles y chino; el uso de prompts en otros idiomas (por ejemplo, castellano) no esta garantizado.
- Licencia: CreativeML Open RAIL-M, que impone restricciones de uso (prohibiciones de aplicaciones daninas y obligaciones de atribucion). Conviene revisar el texto completo antes de uso comercial.
- Derechos de personaje: es un derivado no oficial hecho por un fan; los derechos de Aqua y de KonoSuba pertenecen a sus titulares. La licencia del fichero no concede derechos sobre el personaje.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Alucinacion: concepto no aplicable directamente por ser un modelo de imagenes; en su lugar, el riesgo es de artefactos visuales (anatomia incorrecta, manos mal formadas, elementos duplicados), mitigables con los prompts negativos sugeridos.
- Metadatos no documentados: no se detallan numero de pasos de entrenamiento, learning rate, composicion exacta del dataset ni parametros totales del LoRA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/Aqua-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/Aqua-Dataset
- Evaluacion horizontal en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)
- Modelo base de referencia: waiIllustriousSDXL v17 (waiIllustriousSDXL_v170), no disponible como enlace directo en la informacion proporcionada
- Paper, blog o repositorio adicional del autor: no disponible

# abbuibuibui/LukaUrushibara-Lora

## Resumen

LukaUrushibara-Lora es un LoRA de personaje para modelos de difusion SDXL, desarrollado por el usuario abbuibuibui, que reproduce al personaje Luka Urushibara (漆原琉华) de la visual novel y anime *Steins;Gate*. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango (rank 64, alpha 32) que se aplica sobre pesos SDXL preentrenados para condicionar la generacion de imagenes hacia la identidad visual del personaje. Su relevancia practica esta en el ecosistema de generacion de imagenes anime, donde los LoRA de personaje permiten a artistas y desarrolladores obtener consistencia de personaje sin reentrenar el modelo base.

El repositorio es inusual porque contiene tres linajes independientes de pesos en un mismo espacio: el LoRA original entrenado sobre waiIllustriousSDXL v17 (archivos en la raiz), un LoRA entrenado sobre AutismMix Pony (directorio `autism_pony/`) y un LoRA para MOSS-Image (directorio `moss/`). Cada linaje requiere su propio modelo base, prompts y negativos, y no son intercambiables. El autor recomienda el epoch E6 a fuerza 0.8 para el linaje WAI/Illustrious, con evaluacion comparativa documentada entre E5, E6 y E7 en diez escenas y cuatro intensidades.

El modelo se distribuye con licencia CreativeML OpenRAIL-M, pesa 7,9 GB en el repositorio completo y cada archivo de pesos individual ocupa 456.497.260 bytes. Esta etiquetado para ingles y chino, cuenta con 353 descargas y ningun "like" en el momento de la consulta, y fue creado el 3 de noviembre de 2026 con ultima actualizacion el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; rank 64, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; tamano de archivo 456.497.260 bytes por checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, zh (etiquetas del repositorio) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre SDXL. El linaje principal se entreno sobre waiIllustriousSDXL v17, con optimizador AdamW en bf16, buckets con tope de 1536 y 7 epochs. El dataset consta de 86 pares imagen-texto distribuidas en 7 conjuntos de vestuario, con repeticion 3. Las captions se generaron con `keep_tokens = 2`, y el autor advierte que los colores de pelo y ojos a menudo se omitieron en las captions, por lo que conviene anadirlos explicitamente en el prompt. La etiqueta de sujeto empleada es `1boy`.

El repositorio incluye ademas un segundo linaje entrenado sobre AutismMix Pony (cuyas muestras se renderizaron con AutismMix Confetti) y un tercer linaje para MOSS-Image. No se documentan en la model card detalles de composicion del dataset, procedencia de las imagenes, tecnicas de regularizacion ni uso de RLHF/DPO (no aplicable a este tipo de modelo). La innovacion practica documentada es el proceso de seleccion de epoch: una primera ronda de cribado de E1 a E7 a fuerza 0.8 y una tercera ronda con matriz E5/E6/E7 por 10 escenas por 4 intensidades (0.4, 0.6, 0.8, 1.0).

## Capacidades

- Generacion de imagenes de personaje condicionada por texto: reproduce la identidad visual de Luka Urushibara (pelo corto desordenado verde-azulado oscuro, flequillo, ojos morados, clip de pelo con forma de calavera).
- Control de vestuario mediante tokens especificos: `luka_urushibara_shrine_maiden_robes` (ropas de doncella del santuario blancas y rojas con adorno de campana), `luka_urushibara_black_top`, `luka_urushibara_black_jacket_red_vest`, `luka_urushibara_pink_dress`, `luka_urushibara_purple_top`, `luka_urushibara_red_cardigan`, `luka_urushibara_tactical_gear`.
- Token de identidad `luka_urushibara` como disparador principal.
- Composicion de escenas: retrato frontal, tres cuartos, perfil, cuerpo completo, sentado, fondos simples y complejos, escenas nocturnas.
- Compatibilidad con el ecosistema SDXL: funciona en ComfyUI y en flujos basados en diffusers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de sintesis de imagen.
- Capacidades multilingues limitadas a la interpretacion de prompts en ingles y chino segun las etiquetas del repositorio.

## Casos de uso

- Ilustracion de fan art de *Steins;Gate*: aplicar el LoRA a fuerza 0.8 sobre waiIllustriousSDXL v17 con el prompt de ejemplo del autor para obtener retratos consistentes del personaje en pocas iteraciones, sin necesidad de reentrenar el modelo base.
- Creacion de hojas de personaje para proyectos derivados: generar vistas frontal, tres cuartos y perfil con los mismos tokens de identidad y vestuario, aprovechando que el autor documenta estas vistas en su evaluacion publica.
- Prototipado de vestuario alternativo: usar los tokens de vestuario entrenados (`luka_urushibara_pink_dress`, `luka_urushibara_tactical_gear`, etc.) para explorar variaciones visuales del personaje en contextos distintos al de la obra original.
- Generacion de assets para proyectos de fan game o novela visual no comercial: producir retratos y escenas con fondo simple o complejo para menus, dialogos o ilustraciones de ambientacion, respetando los terminos de la licencia OpenRAIL-M.
- Comparacion de linajes en investigacion de adaptadores: el repositorio permite estudiar como un mismo personaje se comporta sobre tres bases distintas (Illustrious, AutismMix Pony, MOSS-Image) con el mismo dataset, lo que resulta util para analisis de transferencia de estilo entre modelos base.
- Integracion en pipelines automatizados de generacion por lotes: cargar el safetensors de E6 en ComfyUI o diffusers y generar variaciones controladas por seed y fuerza del LoRA para pruebas A/B de prompts, dado el tamano manejable del checkpoint (unos 456 MB por archivo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la informacion disponible. El autor aporta una evaluacion cualitativa comparativa:

| Candidato | Observacion documentada | Decision |
|---|---|---|
| E5 | Pelo corto verde-azulado oscuro y ojos morados usables; las ropas de santuario aparecen a menudo | Alternativa |
| E6 | Retrato con pelo corto verde-azulado oscuro, ojos morados, ropas de doncella del santuario y clip de pelo; silueta de Luka estable | Recomendado a 0.8 |
| E7 | Cercano a E6 | Alternativa final |

Ajustes de muestreo declarados para las imagenes de muestra: ComfyUI, sampler Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216, sin hires ni ADetailer, fuerza 0.8 en el linaje WAI/Illustrious y 1.0 en el linaje AutismMix Pony.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica en la model card; depende del modelo base SDXL (waiIllustriousSDXL v17, AutismMix Pony o MOSS-Image) y de la precision de carga, no del tamano del LoRA, que es de unos 456 MB por checkpoint.
- GPU recomendadas: no documentadas por el autor. Para SDXL en general se requieren GPUs con VRAM suficiente para el modelo base completo; el LoRA anade una sobrecarga pequena.
- Cabe en GPU de consumo: no confirmado en la informacion proporcionada; depende del modelo base y de las optimizaciones empleadas.
- Opciones de despliegue: ComfyUI (verificado por el autor con los ajustes indicados) y la libreria diffusers (etiqueta `library_name: diffusers`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRA de personaje comparables en la informacion proporcionada (parametros, contexto, rendimiento, licencia y disponibilidad de alternativas). La comparacion interna relevante es entre los tres linajes del propio repositorio:

| Linaje | Modelo base | Directorio | Epoch recomendado | Fuerza recomendada |
|---|---|---|---|---|
| WAI/Illustrious | waiIllustriousSDXL v17 | raiz | E6 (`luka_urushibara-000006.safetensors`) | 0.8 |
| AutismMix Pony | AutismMix Pony | `autism_pony/` | E6 | 1.0 |
| MOSS-Image | MOSS-Image | `moss/` | no disponible | no disponible |

## Limitaciones y advertencias

- Es una obra derivada no oficial: los derechos sobre el personaje y la obra original pertenecen a sus titulares; el autor lo declara explicitamente.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos y de ciertas aplicaciones descritas en la licencia); conviene revisar los terminos completos antes de un despliegue en produccion.
- Riesgo de mezclar linajes: usar pesos de `autism_pony/` o `moss/` con el modelo base WAI/Illustrious (o viceversa) produce resultados incorrectos; prompts y negativos tampoco son intercambiables entre linajes.
- Las captions omiten con frecuencia color de pelo y ojos, por lo que el modelo puede no reproducirlos de forma fiable si no se anaden explicitamente al prompt.
- El token de sujeto es `1boy`; prompts que asuman otra etiqueta de sujeto pueden degradar la consistencia del personaje.
- Dataset pequeno (86 pares, 7 vestuarios): riesgo de sobreajuste a las poses y composiciones del dataset y menor generalizacion a escenas muy distintas de las vistas en entrenamiento.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual ni evaluaciones cuantitativas de fidelidad.
- El repositorio pesa 7,9 GB por contener tres linajes completos; descargar solo el archivo necesario.
- Fechas de creacion y actualizacion (noviembre de 2026) posteriores a la fecha habitual de consulta; verificar vigencia de los enlaces.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/LukaUrushibara-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/LukaUrushibara-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/LukaUrushibara-Lora
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `README_zh.md` (dentro del repositorio)

# abbuibuibui/MahoHiyajo-Lora

## Resumen

MahoHiyajo-Lora es un LoRA de personaje para modelos de difusion de la familia SDXL, concretamente para el modelo base waiIllustriousSDXL v17, que representa a Maho Hiyajo (比屋定真帆), personaje de la franquicia *Steins;Gate*. Lo desarrolla el usuario abbuibuibui como derivado no oficial y lo publica en Hugging Face bajo licencia CreativeML OpenRAIL-M. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se carga sobre un checkpoint SDXL para condicionar la generacion de imagenes hacia una identidad visual concreta.

El repositorio es en realidad una coleccion de tres linajes de LoRA entrenados sobre bases distintas: los pesos de la raiz corresponden a WAI/Illustrious SDXL, el subdirectorio `autism_pony/` contiene una version para AutismMix Pony y el subdirectorio `moss/` una version para MOSS-Image. Cada linaje requiere su propio modelo base, prompts y negativos, y no son intercambiables. El entrenamiento se hizo con un dataset de 100 pares imagen-texto y tres conjuntos de vestuario, con rango 64 y alpha 32.

La relevancia practica es acotada: sirve para generar ilustraciones consistentes del personaje en pipelines de difusion (ComfyUI, Automatic1111, diffusers) con control fino de identidad y vestuario mediante tokens de activacion. El autor documenta una evaluacion comparativa entre epocas y recomienda el checkpoint E6 a fuerza 0.8 para el linaje WAI/Illustrious.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; rango 64, alpha 32 |
| Parametros totales | no disponible (cada fichero de pesos ocupa 456.494.348 bytes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible; pesos en safetensors, sin cuantizacion documentada |
| Idiomas soportados | en, zh (prompts y documentacion) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Modelo base | waiIllustriousSDXL v17 (raiz); AutismMix Pony (`autism_pony/`); MOSS-Image (`moss/`) |
| Epocas entrenadas | 7 (E1-E7; el fichero sin numerar equivale a E7) |
| Checkpoint recomendado | E6 a fuerza 0.8 (linaje WAI/Illustrious) |
| Dataset | abbuibuibui/MahoHiyajo-Dataset (100 pares, 3 vestuarios) |
| Tamano del repo | 7.9 GB |
| Descargas | 315 |
| Libreria | diffusers |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 32 inyectado sobre las capas de atencion y proyeccion de un UNet SDXL. El modelo base del linaje principal es waiIllustriousSDXL v17, un checkpoint SDXL orientado a ilustracion anime. El entrenamiento uso AdamW en bf16, buckets con tope de 1536 y 7 epocas sobre un dataset de 100 pares imagen-texto con tres conjuntos de vestuario y repeticiones 3 en el linaje WAI (repeticiones 2 en el linaje AutismMix Pony). Las captions se generaron con `keep_tokens = 2`, de modo que los dos primeros tokens de identidad quedan fijos y el color de pelo y ojos a menudo se omite en el texto; el autor indica que conviene anadirlos explicitamente en el prompt.

La innovacion tecnica destacable no esta en la arquitectura sino en el proceso de seleccion: el autor publica una evaluacion horizontal en dos rondas. La ronda 1 criba E1-E7 a fuerza 0.8; la ronda 3 ejecuta una matriz de E5, E6 y E7 por 10 escenas y 4 fuerzas (0.4, 0.6, 0.8, 1.0). El resultado es que E6 ofrece la silueta mas estable de Maho (pelo largo desordenado verde oliva oscuro, ojos verdes claros, bata de laboratorio) y se adopta como valor por defecto a 0.8. El linaje AutismMix Pony se entreno con 100 imagenes fijas, repeticiones 2, 7 epocas y rango 64, y sus muestras se renderizaron con AutismMix Confetti.

## Capacidades

- Generacion de imagenes de personaje con identidad consistente mediante el token `maho_hiyajo`.
- Control de vestuario mediante tokens dedicados: `maho_hiyajo_lab_coat`, `maho_hiyajo_green_hooded_coat` y `maho_hiyajo_white_green_trim_top`.
- Composición de escenas: retrato frontal, tres cuartos, perfil, cuerpo completo, sentada, fondo simple, fondo complejo nocturno y ausencia de token de vestuario.
- Compatibilidad con prompts en ingles y chino; la documentacion incluye una version en chino (`README_zh.md`) y notas de evaluacion en `evaluation/横向测评记录.md`.
- Integracion con ComfyUI y con la libreria diffusers; el autor documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216 para el linaje WAI; Euler a, 24 pasos, CFG 6, CLIP skip 2 para AutismMix Pony).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un adaptador de difusion, no un modelo de lenguaje.

## Casos de uso

- Ilustracion de fan art de *Steins;Gate*: cargar el LoRA E6 a 0.8 sobre waiIllustriousSDXL v17 y generar retratos del personaje con la silueta estable que el autor valida en la ronda 3 de evaluacion.
- Creacion de hojas de personaje para produccion: usar los tokens de vestuario para generar el mismo personaje con bata de laboratorio, abrigo verde con capucha y top blanco con ribete verde, manteniendo coherencia entre vistas.
- Generacion de keyframes para animatica o storyboard: la combinacion de escenas de retrato, tres cuartos, perfil y cuerpo completo permite cubrir los angulos habituales de una secuencia sin cambiar de checkpoint.
- Prototipado rapido en ComfyUI: el flujo documentado (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216, sin hires ni ADetailer) produce resultados directos, lo que reduce el coste de iteracion en pruebas de concepto.
- Exploracion de variantes estilisticas entre linajes: comparar el mismo personaje renderizado con el LoRA de WAI/Illustrious, el de AutismMix Pony y el de MOSS-Image para elegir el acabado mas adecuado a un proyecto, teniendo en cuenta que cada linaje exige su propio modelo base y negativos.
- Integracion en pipelines programaticos con diffusers: al ser pesos safetensors y estar etiquetado como `library_name: diffusers`, el adaptador se puede cargar y descargar por script en lotes de generacion, util para producir catalogos de imagenes de un personaje concreto.
- Documentacion y divulgacion: el repositorio incluye matrices de evaluacion publicas que sirven como referencia metodologica para quien entrene sus propios LoRA de personaje y quiera replicar un proceso de seleccion por epoca y fuerza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta una evaluacion cualitativa por rondas (cribado E1-E7 a 0.8 y matriz E5/E6/E7 por 10 escenas y 4 fuerzas) con imagenes comparativas, pero sin metricas numericas como FID, CLIP score ni similitud facial.

| Criterio | E5 | E6 | E7 |
|---|---|---|---|
| Pelo verde oliva oscuro largo y desordenado | usable | estable | cercano a E6 |
| Ojos verdes claros | usable | estable | cercano a E6 |
| Bata de laboratorio | a menudo presente | estable | cercano a E6 |
| Decision del autor | alternativa | recomendado a 0.8 | alternativa final |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al ser un LoRA sobre SDXL, el requisito dominante es el del checkpoint base SDXL, no el del adaptador; cada fichero de pesos ocupa unos 456 MB.
- GPU recomendadas: no disponible de forma explicita. El autor documenta generacion en ComfyUI a 832x1216 con 28 pasos, resolucion y paso compatibles con GPU de consumo de gama alta, pero no especifica modelo de GPU ni VRAM.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el unico dato objetivo es el tamano del adaptador (456.494.348 bytes por fichero) y el tamano total del repo (7.9 GB, que incluye los tres linajes y las imagenes de evaluacion).
- Opciones de despliegue: ComfyUI (flujo documentado con Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216, sin hires ni ADetailer) y la libreria diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MahoHiyajo-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 / AutismMix Pony / MOSS-Image | rango 64, alpha 32 | no aplica | creativeml-openrail-m | Hugging Face y ModelScope |
| AutismMix Pony (linaje interno) | LoRA de personaje | AutismMix Pony | rango 64 | no aplica | creativeml-openrail-m | subdirectorio `autism_pony/` del mismo repo |
| MOSS-Image (linaje interno) | LoRA de personaje | MOSS-Image | no disponible | no aplica | creativeml-openrail-m | subdirectorio `moss/` del mismo repo |

No se dispone de datos de otros LoRA de personaje comparables en la informacion proporcionada, ni de metricas que permitan una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos sobre Maho Hiyajo y *Steins;Gate* permanecen en sus titulares. El autor lo declara explicitamente como fan-made.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso: incluye clausulas de uso aceptable y obligaciones de atribucion y redistribucion de la licencia; conviene revisarlas antes de un uso comercial.
- Los tres linajes no son intercambiables: mezclar los pesos de la raiz (WAI/Illustrious) con los de `autism_pony/` o `moss/`, o usar prompts y negativos del linaje equivocado, degrada el resultado.
- Las captions se entrenaron con `keep_tokens = 2` y a menudo omiten color de pelo y ojos; si no se anaden esos descriptores al prompt, la identidad puede desviarse.
- Riesgo de sobreajuste al estilo del modelo base y al dataset de 100 pares: es un dataset pequeno y de un unico personaje, por lo que la generalizacion a poses o vestuarios no vistos no esta garantizada.
- El checkpoint recomendado (E6 a 0.8) es una eleccion cualitativa del autor basada en evaluacion visual, no en metricas objetivas; la calidad percibida puede variar segun el sampler y la configuracion.
- No hay datos publicados de sesgos, tasas de alucinacion (concepto no aplicable a difusion) ni evaluacion con metricas estandar, por lo que la validacion en produccion corre por cuenta del integrador.
- El repositorio ocupa 7.9 GB e incluye los tres linajes y las imagenes de evaluacion; el despliegue requiere descargar el modelo base SDXL correspondiente ademas del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/MahoHiyajo-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MahoHiyajo-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MahoHiyajo-Dataset
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- Documentacion en chino: `README_zh.md` (dentro del repositorio)
